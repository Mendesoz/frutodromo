import { createHash, randomUUID } from 'node:crypto';
import type { Database, Queryable } from './db.js';
import { HERO_MAX, HERO_MIN, defaultPosition, layoutInfo, rectOf, validatePlacement, isBuildingKind } from './layout.js';

export class GameError extends Error {
  constructor(public status: number, public code: string) { super(code); }
}
export type Command =
  | { type: 'queue'; buildingId: string; recipe: 'corn' | 'feed' | 'egg' }
  | { type: 'deliver' }
  | { type: 'recover_seed' }
  | { type: 'buy_seed' }
  | { type: 'expand'; x: number; y: number }
  | { type: 'move'; buildingId: string; x: number; y: number }
  | { type: 'customize'; hero: number };
export const RECIPES = {
  corn: { kind: 'plot', input: 'corn', item: 'corn', amount: 1, output: 2, seconds: 30 },
  feed: { kind: 'feed_mill', input: 'corn', item: 'feed', amount: 2, output: 1, seconds: 45 },
  egg: { kind: 'coop', input: 'feed', item: 'egg', amount: 1, output: 1, seconds: 60 }
} as const;

function stable(value: any): string {
  if (value && typeof value === 'object' && !Array.isArray(value))
    return '{' + Object.keys(value).sort().map(k => JSON.stringify(k) + ':' + stable(value[k])).join(',') + '}';
  return JSON.stringify(value);
}
export function fingerprint(command: Command) { return createHash('sha256').update(stable(command)).digest('hex'); }
async function stock(tx: Queryable, farm: string, item: string) {
  return (await tx.query('SELECT quantity FROM inventory WHERE farm_id=$1 AND item=$2', [farm, item])).rows[0]?.quantity ?? 0;
}
async function itemEvent(tx: Queryable, farm: string, item: string, delta: number, reason: string, key: string, now: Date) {
  await tx.query('INSERT INTO inventory_events(id,farm_id,item,delta,reason,operation_key,created_at) VALUES($1,$2,$3,$4,$5,$6,$7)', [randomUUID(), farm, item, delta, reason, key, now]);
}
async function add(tx: Queryable, farm: string, item: string, quantity: number, reason: string, key: string, now: Date) {
  await tx.query(`INSERT INTO inventory(farm_id,item,quantity) VALUES($1,$2,$3)
    ON CONFLICT(farm_id,item) DO UPDATE SET quantity=inventory.quantity+excluded.quantity`, [farm, item, quantity]);
  await itemEvent(tx, farm, item, quantity, reason, key, now);
}
async function consume(tx: Queryable, farm: string, item: string, quantity: number, key: string, now: Date) {
  const r = await tx.query('UPDATE inventory SET quantity=quantity-$3 WHERE farm_id=$1 AND item=$2 AND quantity >= $3 RETURNING quantity', [farm, item, quantity]);
  if (!r.rows.length) throw new GameError(409, 'INSUFFICIENT_ITEMS');
  await itemEvent(tx, farm, item, -quantity, 'consumed', key, now);
}
async function money(tx: Queryable, farm: string, delta: number, reason: string, key: string, now: Date) {
  const r = await tx.query('UPDATE wallets SET coins=coins+$2 WHERE farm_id=$1 AND coins+$2 BETWEEN 0 AND 2000000000 RETURNING coins', [farm, delta]);
  if (!r.rows.length) throw new GameError(409, 'INSUFFICIENT_COINS');
  await tx.query('INSERT INTO ledger(id,farm_id,delta,balance_after,reason,operation_key,created_at) VALUES($1,$2,$3,$4,$5,$6,$7)',
    [randomUUID(), farm, delta, r.rows[0].coins, reason, key, now]);
}
async function settle(tx: Queryable, farm: string, now: Date) {
  const jobs = (await tx.query('SELECT * FROM production_jobs WHERE farm_id=$1 AND claimed_at IS NULL AND finishes_at <= $2 ORDER BY finishes_at,id FOR UPDATE', [farm, now])).rows;
  for (const job of jobs) {
    await add(tx, farm, job.output_item, job.output_quantity, 'production', 'job:' + job.id, now);
    await tx.query('UPDATE production_jobs SET claimed_at=$2 WHERE id=$1', [job.id, now]);
  }
}
async function lockFarm(tx: Queryable, playerId: string) {
  const farm = (await tx.query('SELECT * FROM farms WHERE player_id=$1 FOR UPDATE', [playerId])).rows[0];
  if (!farm) throw new GameError(404, 'FARM_NOT_FOUND');
  return farm;
}
async function farmTime(tx: Queryable, farm: any, clock?: () => Date) {
  const observed = clock ? clock() : new Date((await tx.query('SELECT clock_timestamp() AS t')).rows[0].t);
  const now = new Date(Math.max(observed.getTime(), new Date(farm.last_processed_at).getTime()));
  await tx.query('UPDATE farms SET last_processed_at=$2 WHERE id=$1', [farm.id, now]);
  return now;
}

export async function seedFarm(tx: Queryable, playerId: string, name: string, now: Date) {
  const farmId = randomUUID();
  await tx.query('INSERT INTO farms(id,player_id,name,created_at,last_processed_at) VALUES($1,$2,$3,$4,$4)', [farmId, playerId, name, now]);
  await tx.query('INSERT INTO wallets(farm_id,coins) VALUES($1,0)', [farmId]);
  await money(tx, farmId, 80, 'initial_grant', 'initial_grant', now);
  await add(tx, farmId, 'corn', 4, 'initial_grant', 'initial_grant', now);
  await tx.query('INSERT INTO land(farm_id,x,y) VALUES($1,0,0)', [farmId]);
  for (const [kind, slot, limit] of [['plot', 0, 1], ['plot', 1, 1], ['feed_mill', 0, 2], ['coop', 0, 2]] as const) {
    const at = defaultPosition(kind, slot);
    await tx.query('INSERT INTO buildings(id,farm_id,kind,slot,queue_limit,tile_x,tile_y) VALUES($1,$2,$3,$4,$5,$6,$7)',
      [randomUUID(), farmId, kind, slot, limit, at.x, at.y]);
  }
  return farmId;
}

export function game(db: Database, clock?: () => Date) {
  return {
    async snapshot(playerId: string) {
      return db.transaction(async tx => {
        const farm = await lockFarm(tx, playerId);
        const now = await farmTime(tx, farm, clock);
        await settle(tx, farm.id, now);
        const inventory = (await tx.query('SELECT item,quantity FROM inventory WHERE farm_id=$1 ORDER BY item', [farm.id])).rows;
        const buildings = (await tx.query('SELECT id,kind,slot,queue_limit,tile_x,tile_y FROM buildings WHERE farm_id=$1 ORDER BY kind,slot', [farm.id])).rows;
        const jobs = (await tx.query('SELECT id,building_id,recipe,output_item,output_quantity,started_at,finishes_at FROM production_jobs WHERE farm_id=$1 AND claimed_at IS NULL ORDER BY finishes_at,id', [farm.id])).rows;
        const land = (await tx.query('SELECT x,y FROM land WHERE farm_id=$1 ORDER BY x,y', [farm.id])).rows;
        const coins = (await tx.query('SELECT coins FROM wallets WHERE farm_id=$1', [farm.id])).rows[0].coins;
        return { serverTime: now.toISOString(), farm: { id: farm.id, name: farm.name, capacity: farm.capacity, hero: farm.hero }, coins, inventory, buildings, jobs, land,
          recipes: RECIPES, order: { item: 'egg', quantity: 2, coins: 18 }, ...layoutInfo(),
          economy: 'pilot-resettable-v1', seedPrice: 3,
          nextExpansionCost: land.length * 60, reservedCapacity: jobs.reduce((n, j) => n + j.output_quantity, 0) };
      });
    },
    async execute(playerId: string, key: string, command: Command, expectedFarmId?: string) {
      if (!/^[a-zA-Z0-9_-]{8,100}$/.test(key)) throw new GameError(400, 'INVALID_OPERATION_KEY');
      return db.transaction(async tx => {
        // Todas as mutacoes de uma fazenda seguem esta mesma trava, inclusive leitura com acerto offline.
        const farm = await lockFarm(tx, playerId);
        if (expectedFarmId && expectedFarmId !== farm.id) throw new GameError(409, 'FARM_CHANGED');
        const hash = fingerprint(command);
        const previous = (await tx.query('SELECT request_hash,result FROM operations WHERE farm_id=$1 AND key=$2', [farm.id, key])).rows[0];
        if (previous) {
          if (previous.request_hash !== hash) throw new GameError(409, 'OPERATION_KEY_REUSED');
          return previous.result;
        }
        const now = await farmTime(tx, farm, clock);
        const auditKey = 'command:' + key;
        await settle(tx, farm.id, now);
        let detail: Record<string, unknown> = {};
        if (command.type === 'queue') {
          const recipe = RECIPES[command.recipe];
          if (!recipe) throw new GameError(400, 'INVALID_RECIPE');
          const building = (await tx.query('SELECT * FROM buildings WHERE id=$1 AND farm_id=$2', [command.buildingId, farm.id])).rows[0];
          if (!building || building.kind !== recipe.kind) throw new GameError(409, 'INVALID_BUILDING');
          const pending = (await tx.query('SELECT finishes_at FROM production_jobs WHERE building_id=$1 AND claimed_at IS NULL ORDER BY finishes_at', [building.id])).rows;
          if (pending.length >= building.queue_limit) throw new GameError(409, 'QUEUE_FULL');
          await consume(tx, farm.id, recipe.input, recipe.amount, auditKey, now);
          const items = (await tx.query('SELECT COALESCE(sum(quantity),0)::int AS n FROM inventory WHERE farm_id=$1', [farm.id])).rows[0].n;
          const reserved = (await tx.query('SELECT COALESCE(sum(output_quantity),0)::int AS n FROM production_jobs WHERE farm_id=$1 AND claimed_at IS NULL', [farm.id])).rows[0].n;
          if (items + reserved + recipe.output > farm.capacity) throw new GameError(409, 'STORAGE_FULL');
          const start = pending.length ? new Date(Math.max(now.getTime(), new Date(pending.at(-1).finishes_at).getTime())) : now;
          const finish = new Date(start.getTime() + recipe.seconds * 1000);
          const id = randomUUID();
          await tx.query('INSERT INTO production_jobs(id,farm_id,building_id,recipe,output_item,output_quantity,started_at,finishes_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',
            [id, farm.id, building.id, command.recipe, recipe.item, recipe.output, start, finish]);
          detail = { jobId: id, finishesAt: finish.toISOString() };
        } else if (command.type === 'deliver') {
          await consume(tx, farm.id, 'egg', 2, auditKey, now);
          await money(tx, farm.id, 18, 'npc_order', auditKey, now);
          detail = { earned: 18 };
        } else if (command.type === 'recover_seed' || command.type === 'buy_seed') {
          const pendingCorn = (await tx.query("SELECT id FROM production_jobs WHERE farm_id=$1 AND claimed_at IS NULL AND output_item='corn' LIMIT 1", [farm.id])).rows.length;
          if (command.type === 'recover_seed') {
            const coins = (await tx.query('SELECT coins FROM wallets WHERE farm_id=$1', [farm.id])).rows[0].coins;
            const pendingAny = (await tx.query('SELECT id FROM production_jobs WHERE farm_id=$1 AND claimed_at IS NULL LIMIT 1', [farm.id])).rows.length;
            if (await stock(tx, farm.id, 'corn') > 0 || pendingCorn || pendingAny || coins >= 3 ||
                await stock(tx, farm.id, 'feed') > 0 || await stock(tx, farm.id, 'egg') >= 2 ||
                (farm.seed_recovered_at && now.getTime() - new Date(farm.seed_recovered_at).getTime() < 3600000))
              throw new GameError(409, 'SEED_RECOVERY_UNAVAILABLE');
            await tx.query('UPDATE farms SET seed_recovered_at=$2 WHERE id=$1', [farm.id, now]);
          } else await money(tx, farm.id, -3, 'seed_purchase', auditKey, now);
          const used = (await tx.query('SELECT COALESCE(sum(quantity),0)::int AS n FROM inventory WHERE farm_id=$1', [farm.id])).rows[0].n;
          const reserved = (await tx.query('SELECT COALESCE(sum(output_quantity),0)::int AS n FROM production_jobs WHERE farm_id=$1 AND claimed_at IS NULL', [farm.id])).rows[0].n;
          if (used + reserved >= farm.capacity) throw new GameError(409, 'STORAGE_FULL');
          await add(tx, farm.id, 'corn', 1, command.type, auditKey, now);
        } else if (command.type === 'expand') {
          if (!Number.isInteger(command.x) || !Number.isInteger(command.y) || Math.abs(command.x) > 2 || Math.abs(command.y) > 2)
            throw new GameError(400, 'INVALID_LAND');
          const plots = (await tx.query('SELECT x,y FROM land WHERE farm_id=$1', [farm.id])).rows;
          if (plots.some(p => p.x === command.x && p.y === command.y)) throw new GameError(409, 'LAND_ALREADY_OWNED');
          if (!plots.some(p => Math.abs(p.x - command.x) + Math.abs(p.y - command.y) === 1)) throw new GameError(409, 'LAND_NOT_ADJACENT');
          await money(tx, farm.id, -plots.length * 60, 'land_expansion', auditKey, now);
          await tx.query('INSERT INTO land(farm_id,x,y) VALUES($1,$2,$3)', [farm.id, command.x, command.y]);
          detail = { x: command.x, y: command.y };
        } else if (command.type === 'move') {
          // So muda o lugar: nada de preco, receita, producao, capacidade ou fila.
          const building = (await tx.query('SELECT id,kind FROM buildings WHERE id=$1 AND farm_id=$2', [command.buildingId, farm.id])).rows[0];
          if (!building || !isBuildingKind(building.kind)) throw new GameError(409, 'INVALID_BUILDING');
          const others = (await tx.query('SELECT kind,tile_x,tile_y FROM buildings WHERE farm_id=$1 AND id<>$2', [farm.id, building.id])).rows;
          const land = (await tx.query('SELECT x,y FROM land WHERE farm_id=$1', [farm.id])).rows;
          const problem = validatePlacement({
            kind: building.kind, x: command.x, y: command.y, land,
            occupied: others.filter(other => isBuildingKind(other.kind)).map(other => rectOf(other.kind, other.tile_x, other.tile_y))
          });
          if (problem) throw new GameError(problem === 'INVALID_POSITION' ? 400 : 409, problem);
          await tx.query('UPDATE buildings SET tile_x=$2,tile_y=$3 WHERE id=$1', [building.id, command.x, command.y]);
          detail = { buildingId: building.id, x: command.x, y: command.y };
        } else if (command.type === 'customize') {
          if (!Number.isInteger(command.hero) || command.hero < HERO_MIN || command.hero > HERO_MAX) throw new GameError(400, 'INVALID_HERO');
          await tx.query('UPDATE farms SET hero=$2 WHERE id=$1', [farm.id, command.hero]);
          detail = { hero: command.hero };
        } else throw new GameError(400, 'INVALID_COMMAND');
        const result = { key, type: command.type, ...detail };
        await tx.query('INSERT INTO operations(farm_id,key,request_hash,result,created_at) VALUES($1,$2,$3,$4,$5)', [farm.id, key, hash, JSON.stringify(result), now]);
        return result;
      });
    }
  };
}
