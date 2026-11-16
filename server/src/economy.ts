import { randomUUID } from 'node:crypto';
import type { Queryable } from './db.js';
import { GameError } from './domain.js';

export async function stock(tx: Queryable, farm: string, item: string) {
  return (await tx.query('SELECT quantity FROM inventory WHERE farm_id=$1 AND item=$2', [farm, item])).rows[0]?.quantity ?? 0;
}
export async function itemEvent(tx: Queryable, farm: string, item: string, delta: number, reason: string, key: string, now: Date) {
  await tx.query('INSERT INTO inventory_events(id,farm_id,item,delta,reason,operation_key,created_at) VALUES($1,$2,$3,$4,$5,$6,$7)', [randomUUID(), farm, item, delta, reason, key, now]);
}
export async function add(tx: Queryable, farm: string, item: string, quantity: number, reason: string, key: string, now: Date) {
  await tx.query(`INSERT INTO inventory(farm_id,item,quantity) VALUES($1,$2,$3)
    ON CONFLICT(farm_id,item) DO UPDATE SET quantity=inventory.quantity+excluded.quantity`, [farm, item, quantity]);
  await itemEvent(tx, farm, item, quantity, reason, key, now);
}
export async function consume(tx: Queryable, farm: string, item: string, quantity: number, key: string, now: Date) {
  const r = await tx.query('UPDATE inventory SET quantity=quantity-$3 WHERE farm_id=$1 AND item=$2 AND quantity >= $3 RETURNING quantity', [farm, item, quantity]);
  if (!r.rows.length) throw new GameError(409, 'INSUFFICIENT_ITEMS');
  await itemEvent(tx, farm, item, -quantity, 'consumed', key, now);
}
export async function money(tx: Queryable, farm: string, delta: number, reason: string, key: string, now: Date) {
  const r = await tx.query('UPDATE wallets SET coins=coins+$2 WHERE farm_id=$1 AND coins+$2 BETWEEN 0 AND 2000000000 RETURNING coins', [farm, delta]);
  if (!r.rows.length) throw new GameError(409, 'INSUFFICIENT_COINS');
  await tx.query('INSERT INTO ledger(id,farm_id,delta,balance_after,reason,operation_key,created_at) VALUES($1,$2,$3,$4,$5,$6,$7)',
    [randomUUID(), farm, delta, r.rows[0].coins, reason, key, now]);
}
export async function settle(tx: Queryable, farm: string, now: Date) {
  const jobs = (await tx.query('SELECT * FROM production_jobs WHERE farm_id=$1 AND claimed_at IS NULL AND finishes_at <= $2 ORDER BY finishes_at,id FOR UPDATE', [farm, now])).rows;
  for (const job of jobs) {
    await add(tx, farm, job.output_item, job.output_quantity, 'production', 'job:' + job.id, now);
    await tx.query('UPDATE production_jobs SET claimed_at=$2 WHERE id=$1', [job.id, now]);
  }
}
export async function lockFarm(tx: Queryable, playerId: string) {
  const farm = (await tx.query('SELECT * FROM farms WHERE player_id=$1 FOR UPDATE', [playerId])).rows[0];
  if (!farm) throw new GameError(404, 'FARM_NOT_FOUND');
  return farm;
}
export async function farmTime(tx: Queryable, farm: any, clock?: () => Date) {
  const observed = clock ? clock() : new Date((await tx.query('SELECT clock_timestamp() AS t')).rows[0].t);
  const now = new Date(Math.max(observed.getTime(), new Date(farm.last_processed_at).getTime()));
  await tx.query('UPDATE farms SET last_processed_at=$2 WHERE id=$1', [farm.id, now]);
  return now;
}


export async function activeMarketReserved(tx: Queryable, farmId: string) {
  return (await tx.query("SELECT COALESCE(sum(quantity),0)::int AS n FROM market_listings WHERE seller_farm_id=$1 AND status='active'", [farmId])).rows[0].n as number;
}
export async function occupancy(tx: Queryable, farmId: string) {
  const inventory = (await tx.query('SELECT COALESCE(sum(quantity),0)::int AS n FROM inventory WHERE farm_id=$1', [farmId])).rows[0].n as number;
  const production = (await tx.query('SELECT COALESCE(sum(output_quantity),0)::int AS n FROM production_jobs WHERE farm_id=$1 AND claimed_at IS NULL', [farmId])).rows[0].n as number;
  const market = await activeMarketReserved(tx, farmId);
  return { inventory, production, market, total: inventory + production + market };
}
