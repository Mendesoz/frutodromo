import { after, before, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { database, migrate, type Database } from '../src/db.js';
import { auth } from '../src/auth.js';
import { game, GameError } from '../src/game.js';
import { buildApp } from '../src/app.js';
import { FOOTPRINTS, OBSTACLES, defaultPosition, parcelsCovered, rectOf, rectsOverlap, validatePlacement } from '../src/layout.js';

let db: Database;
const url = process.env.TEST_DATABASE_URL;
if (url && !new URL(url).pathname.endsWith('_test')) throw new Error('TEST_DATABASE_URL deve apontar para banco com sufixo _test; testes apagam apenas esse banco.');
let now = new Date('2030-01-01T00:00:00Z');
const clock = () => new Date(now);
const advance = (seconds: number) => { now = new Date(now.getTime() + seconds * 1000); };
const key = () => randomUUID();
const err = (code: string) => (e: unknown) => e instanceof GameError && e.code === code;
const qty = (s: any, item: string) => s.inventory.find((i: any) => i.item === item)?.quantity ?? 0;
// Este arquivo divide o banco de CI com online.test.ts: nome unico por conta e nenhum TRUNCATE.
const name = () => 'u' + randomUUID().replace(/-/g, '').slice(0, 20);
const create = () => auth(db).register(name(), 'teste-seguro-123', 'Fazenda do layout');
const origin = 'http://127.0.0.1:8860';
const at = (s: any, kind: string, slot = 0) => {
  const building = s.buildings.find((b: any) => b.kind === kind && b.slot === slot);
  return { id: building.id, x: building.tile_x, y: building.tile_y, queue_limit: building.queue_limit };
};
const noOverlap = (rows: any[], message: string) => {
  const rects = rows.map(row => rectOf(row.kind, row.tile_x, row.tile_y));
  for (let i = 0; i < rects.length; i++) {
    for (const obstacle of OBSTACLES) assert.ok(!rectsOverlap(rects[i], obstacle), message);
    for (let j = i + 1; j < rects.length; j++) assert.ok(!rectsOverlap(rects[i], rects[j]), message);
  }
};

before(async () => { db = await database(url, 'memory://'); await migrate(db); });
after(async () => { await db?.close(); });
beforeEach(() => { now = new Date('2030-01-01T00:00:00Z'); });

test('retangulos meia-abertos, terrenos cobertos e tipo desconhecido', () => {
  assert.equal(rectsOverlap({ x: 0, y: 0, w: 2, h: 2 }, { x: 2, y: 0, w: 2, h: 2 }), false);
  assert.equal(rectsOverlap({ x: 0, y: 0, w: 2, h: 2 }, { x: 0, y: 2, w: 2, h: 2 }), false);
  assert.equal(rectsOverlap({ x: 0, y: 0, w: 2, h: 2 }, { x: 1, y: 1, w: 2, h: 2 }), true);
  assert.deepEqual(parcelsCovered({ x: 0, y: 0, w: 2, h: 2 }), [{ x: 0, y: 0 }]);
  assert.deepEqual(parcelsCovered({ x: -1, y: -1, w: 2, h: 2 }), [{ x: -1, y: -1 }, { x: 0, y: -1 }, { x: -1, y: 0 }, { x: 0, y: 0 }]);
  assert.deepEqual(parcelsCovered({ x: -24, y: 35, w: 3, h: 1 }), [{ x: -2, y: 2 }]);
  assert.equal(validatePlacement({ kind: 'arvore', x: 0, y: 0, land: [{ x: 0, y: 0 }], occupied: [] }), 'INVALID_BUILDING');
  assert.equal(validatePlacement({ kind: 'plot', x: 0, y: 0, land: [{ x: 0, y: 0 }], occupied: [] }), null);
});

test('cadastro novo nasce com layout padrao, heroi zero e medidas do mapa no snapshot', async () => {
  const user = await create();
  const s: any = await game(db, clock).snapshot(user.id);
  assert.equal(s.parcelSize, 12);
  assert.deepEqual(s.footprints, { plot: { w: 2, h: 2 }, feed_mill: { w: 3, h: 3 }, coop: { w: 3, h: 3 } });
  assert.deepEqual(s.obstacles, [{ kind: 'house', x: 1, y: 6, w: 2, h: 3 }, { kind: 'stand', x: 9, y: 7, w: 2, h: 3 }]);
  assert.equal(s.farm.hero, 0);
  assert.deepEqual(s.land, [{ x: 0, y: 0 }]);
  assert.deepEqual({ x: at(s, 'feed_mill').x, y: at(s, 'feed_mill').y }, { x: 1, y: 1 });
  assert.deepEqual({ x: at(s, 'coop').x, y: at(s, 'coop').y }, { x: 7, y: 1 });
  assert.deepEqual({ x: at(s, 'plot', 0).x, y: at(s, 'plot', 0).y }, { x: 3, y: 7 });
  assert.deepEqual({ x: at(s, 'plot', 1).x, y: at(s, 'plot', 1).y }, { x: 6, y: 7 });
  noOverlap(s.buildings, 'layout inicial nao pode nascer sobreposto');
  for (const building of s.buildings)
    assert.deepEqual(parcelsCovered(rectOf(building.kind, building.tile_x, building.tile_y)), [{ x: 0, y: 0 }],
      'layout inicial deve caber no terreno inicial');
});

test('migracao 003 posiciona predios de fazendas criadas antes do layout', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'brotalume-layout-'));
  let legacy: Database | undefined;
  try {
    legacy = await database(undefined, folder);
    // Banco antigo: aplica somente 001 e 002 e marca as duas como ja aplicadas.
    await legacy.transaction(async tx => {
      await tx.query('CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())');
      for (const file of ['001_base.sql', '002_sessions_expiry.sql']) {
        const sql = await readFile(new URL('../migrations/' + file, import.meta.url), 'utf8');
        for (const statement of sql.split(';').map(s => s.trim()).filter(Boolean)) await tx.query(statement);
        await tx.query('INSERT INTO schema_migrations(name) VALUES($1)', [file]);
      }
    });
    const playerId = randomUUID(); const farmId = randomUUID();
    await legacy.query('INSERT INTO players(id,username,password_hash) VALUES($1,$2,$3)', [playerId, name(), 'salt:hash']);
    await legacy.query('INSERT INTO farms(id,player_id,name) VALUES($1,$2,$3)', [farmId, playerId, 'Antiga']);
    await legacy.query('INSERT INTO wallets(farm_id,coins) VALUES($1,7)', [farmId]);
    await legacy.query("INSERT INTO inventory(farm_id,item,quantity) VALUES($1,'corn',4)", [farmId]);
    await legacy.query('INSERT INTO land(farm_id,x,y) VALUES($1,0,0)', [farmId]);
    for (const [kind, slot] of [['plot', 0], ['plot', 1], ['feed_mill', 0], ['coop', 0]] as const)
      await legacy.query('INSERT INTO buildings(id,farm_id,kind,slot,queue_limit) VALUES($1,$2,$3,$4,2)', [randomUUID(), farmId, kind, slot]);

    await migrate(legacy);
    const rows = (await legacy.query('SELECT kind,slot,tile_x,tile_y FROM buildings WHERE farm_id=$1 ORDER BY kind,slot', [farmId])).rows;
    assert.equal(rows.length, 4);
    for (const row of rows) assert.deepEqual({ x: row.tile_x, y: row.tile_y }, defaultPosition(row.kind, row.slot));
    noOverlap(rows, 'backfill da migracao nao pode sobrepor nem cair na casa ou na banca');
    const farm = (await legacy.query('SELECT hero,capacity FROM farms WHERE id=$1', [farmId])).rows[0];
    assert.equal(farm.hero, 0);
    assert.equal(farm.capacity, 200);
    // Rodar de novo nao apaga nem duplica a fazenda antiga.
    await migrate(legacy);
    assert.equal((await legacy.query('SELECT count(*)::int AS n FROM buildings WHERE farm_id=$1', [farmId])).rows[0].n, 4);
    assert.equal((await legacy.query('SELECT coins FROM wallets WHERE farm_id=$1', [farmId])).rows[0].coins, 7);
  } finally {
    await legacy?.close();
    if (dirname(resolve(folder)) !== resolve(tmpdir()) || !basename(folder).startsWith('brotalume-layout-')) throw new Error('Pasta temporaria inesperada.');
    await rm(folder, { recursive: true });
  }
});

test('mover predio persiste, repete o mesmo recibo e nao toca em economia ou producao', async () => {
  const user = await create(); const g = game(db, clock);
  const before: any = await g.snapshot(user.id);
  const plot = at(before, 'plot', 0);
  const op = key();
  const receipt = await g.execute(user.id, op, { type: 'move', buildingId: plot.id, x: 0, y: 4 });
  assert.deepEqual(receipt, { key: op, type: 'move', buildingId: plot.id, x: 0, y: 4 });
  assert.deepEqual(await g.execute(user.id, op, { type: 'move', buildingId: plot.id, x: 0, y: 4 }), receipt);
  const stored = (await db.query('SELECT tile_x,tile_y FROM buildings WHERE id=$1', [plot.id])).rows[0];
  assert.deepEqual({ x: stored.tile_x, y: stored.tile_y }, { x: 0, y: 4 });
  const after: any = await g.snapshot(user.id);
  assert.deepEqual({ x: at(after, 'plot', 0).x, y: at(after, 'plot', 0).y }, { x: 0, y: 4 });
  assert.equal(at(after, 'plot', 0).queue_limit, plot.queue_limit);
  assert.equal(after.coins, before.coins);
  assert.deepEqual(after.inventory, before.inventory);
  assert.equal(after.farm.capacity, before.farm.capacity);
  assert.equal(after.nextExpansionCost, before.nextExpansionCost);
  assert.deepEqual(after.recipes, before.recipes);
  assert.equal(after.buildings.length, before.buildings.length);
  // Um unico movimento registrado e a producao continua igual depois de mover.
  assert.equal((await db.query("SELECT count(*)::int AS n FROM operations WHERE farm_id=$1 AND result->>'type'='move'", [before.farm.id])).rows[0].n, 1);
  await g.execute(user.id, key(), { type: 'queue', buildingId: plot.id, recipe: 'corn' });
  advance(30);
  assert.equal(qty(await g.snapshot(user.id), 'corn'), 5);
});

test('movimento recusa sobreposicao, casa, banca, fora do mundo e terreno nao comprado', async () => {
  const user = await create(); const g = game(db, clock);
  const s: any = await g.snapshot(user.id);
  const plot = at(s, 'plot', 0).id;
  const move = (x: number, y: number) => g.execute(user.id, key(), { type: 'move', buildingId: plot, x, y });
  await assert.rejects(move(2, 2), err('MOVE_OVERLAP'));        // sobre o moinho (1..3, 1..3)
  await assert.rejects(move(7, 2), err('MOVE_OVERLAP'));        // sobre o galinheiro (7..9, 1..3)
  await assert.rejects(move(6, 7), err('MOVE_OVERLAP'));        // sobre o outro canteiro
  await move(4, 1);                                             // encostar no moinho e permitido
  assert.deepEqual({ x: at(await g.snapshot(user.id), 'plot', 0).x, y: at(await g.snapshot(user.id), 'plot', 0).y }, { x: 4, y: 1 });
  await assert.rejects(move(2, 5), err('MOVE_OVERLAP'));         // casa (1..2, 6..8)
  await assert.rejects(move(10, 6), err('MOVE_OVERLAP'));        // banca (9..10, 7..9)
  await assert.rejects(move(35, 0), err('INVALID_POSITION'));    // pegada passa do tile 35
  await assert.rejects(move(0, -25), err('INVALID_POSITION'));
  await assert.rejects(move(0.5, 4), err('INVALID_POSITION'));
  await assert.rejects(move(12, 0), err('MOVE_OUTSIDE_LAND'));   // terreno (1,0) nao comprado
  await assert.rejects(move(11, 0), err('MOVE_OUTSIDE_LAND'));   // atravessa a borda do terreno comprado
  // Com o terreno vizinho comprado, os mesmos movimentos passam.
  await g.execute(user.id, key(), { type: 'expand', x: 1, y: 0 });
  await move(12, 0);
  await move(11, 0);
  const end: any = await g.snapshot(user.id);
  assert.deepEqual({ x: at(end, 'plot', 0).x, y: at(end, 'plot', 0).y }, { x: 11, y: 0 });
  assert.equal(end.coins, 20);
  assert.equal(end.buildings.length, s.buildings.length);
  noOverlap((await db.query('SELECT kind,tile_x,tile_y FROM buildings WHERE farm_id=$1', [s.farm.id])).rows, 'nenhuma recusa pode deixar predio sobreposto');
});

test('predio de outra conta ou inexistente nao pode ser movido', async () => {
  const owner = await create(); const other = await create(); const g = game(db, clock);
  const foreign = at(await g.snapshot(other.id), 'plot', 0);
  await assert.rejects(g.execute(owner.id, key(), { type: 'move', buildingId: foreign.id, x: 0, y: 4 }), err('INVALID_BUILDING'));
  await assert.rejects(g.execute(owner.id, key(), { type: 'move', buildingId: randomUUID(), x: 0, y: 4 }), err('INVALID_BUILDING'));
  const stored = (await db.query('SELECT tile_x,tile_y FROM buildings WHERE id=$1', [foreign.id])).rows[0];
  assert.deepEqual({ x: stored.tile_x, y: stored.tile_y }, { x: foreign.x, y: foreign.y });
  assert.deepEqual({ x: at(await g.snapshot(owner.id), 'plot', 0).x, y: at(await g.snapshot(owner.id), 'plot', 0).y }, { x: 3, y: 7 });
});

test('customizacao guarda o personagem e recusa valor fora da faixa de 0 a 21', async () => {
  const user = await create(); const g = game(db, clock);
  assert.equal((await g.snapshot(user.id)).farm.hero, 0);
  const op = key();
  assert.deepEqual(await g.execute(user.id, op, { type: 'customize', hero: 21 }), { key: op, type: 'customize', hero: 21 });
  assert.deepEqual(await g.execute(user.id, op, { type: 'customize', hero: 21 }), { key: op, type: 'customize', hero: 21 });
  const s: any = await g.snapshot(user.id);
  assert.equal(s.farm.hero, 21);
  await assert.rejects(g.execute(user.id, key(), { type: 'customize', hero: 22 }), err('INVALID_HERO'));
  await assert.rejects(g.execute(user.id, key(), { type: 'customize', hero: -1 }), err('INVALID_HERO'));
  await assert.rejects(g.execute(user.id, key(), { type: 'customize', hero: 1.5 }), err('INVALID_HERO'));
  const end: any = await g.snapshot(user.id);
  assert.equal(end.farm.hero, 21);
  assert.equal(end.coins, 80);
  assert.deepEqual(end.inventory, s.inventory);
  await g.execute(user.id, key(), { type: 'customize', hero: 0 });
  assert.equal((await g.snapshot(user.id)).farm.hero, 0);
});

test('dois movimentos simultaneos para a mesma area nao deixam predios sobrepostos', async () => {
  const user = await create();
  const second = url ? await database(url) : db;
  const [a, b] = await Promise.all([buildApp(db, { clock }), buildApp(second, { clock })]);
  try {
    const s: any = await game(db, clock).snapshot(user.id);
    const headers = () => ({ origin, cookie: `brotalume_session=${user.token}`, 'idempotency-key': key() });
    const send = (app: typeof a, buildingId: string, x: number, y: number) =>
      app.inject({ method: 'POST', url: '/api/commands', headers: headers(), payload: { type: 'move', buildingId, x, y } });
    // Os dois destinos sao validos sozinhos, mas se sobrepoem entre si.
    const responses = await Promise.all([send(a, at(s, 'plot', 0).id, 0, 4), send(b, at(s, 'plot', 1).id, 1, 4)]);
    assert.equal(responses.filter(r => r.statusCode === 200).length, 1, responses.map(r => r.body).join(' | '));
    const refused = responses.find(r => r.statusCode !== 200)!;
    assert.equal(refused.statusCode, 409);
    assert.equal(refused.json().error, 'MOVE_OVERLAP');
    noOverlap((await db.query('SELECT kind,tile_x,tile_y FROM buildings WHERE farm_id=$1', [s.farm.id])).rows, 'concorrencia nao pode sobrepor predios');
  } finally { await a.close(); await b.close(); if (second !== db) await second.close(); }
});

test('schema HTTP de move e customize recusa campo faltando, extra, fracionario e fora do mundo', async () => {
  const user = await create();
  const app = await buildApp(db, { clock });
  try {
    const s: any = await game(db, clock).snapshot(user.id);
    const plot = at(s, 'plot', 0).id;
    const post = (payload: unknown, op = key()) => app.inject({ method: 'POST', url: '/api/commands',
      headers: { origin, cookie: `brotalume_session=${user.token}`, 'idempotency-key': op }, payload: payload as any });
    assert.equal((await post({ type: 'move', buildingId: plot })).statusCode, 400);
    assert.equal((await post({ type: 'move', x: 0, y: 4 })).statusCode, 400);
    assert.equal((await post({ type: 'move', buildingId: plot, x: 0, y: 4, hero: 3 })).statusCode, 400);
    assert.equal((await post({ type: 'move', buildingId: plot, x: 0.5, y: 4 })).statusCode, 400);
    assert.equal((await post({ type: 'move', buildingId: plot, x: '0', y: 4 })).statusCode, 400);
    assert.equal((await post({ type: 'move', buildingId: 'nao-e-uuid', x: 0, y: 4 })).statusCode, 400);
    assert.equal((await post({ type: 'move', buildingId: plot, x: 36, y: 4 })).statusCode, 400);
    assert.equal((await post({ type: 'move', buildingId: plot, x: 0, y: -25 })).statusCode, 400);
    assert.equal((await post({ type: 'customize', hero: 22 })).statusCode, 400);
    assert.equal((await post({ type: 'customize' })).statusCode, 400);
    const op = key();
    const ok = await post({ type: 'move', buildingId: plot, x: 0, y: 4 }, op);
    assert.equal(ok.statusCode, 200, ok.body);
    assert.deepEqual(ok.json(), { key: op, type: 'move', buildingId: plot, x: 0, y: 4 });
    const hero = await post({ type: 'customize', hero: 7 });
    assert.equal(hero.statusCode, 200, hero.body);
    assert.equal(hero.json().hero, 7);
    // Regra de terreno vira 409 de dominio, nao 400 de schema.
    const outside = await post({ type: 'move', buildingId: plot, x: 12, y: 0 });
    assert.equal(outside.statusCode, 409);
    assert.equal(outside.json().error, 'MOVE_OUTSIDE_LAND');
    const farm = await app.inject({ method: 'GET', url: '/api/farm', headers: { cookie: `brotalume_session=${user.token}` } });
    assert.equal(farm.json().farm.hero, 7);
    assert.equal(farm.json().parcelSize, 12);
    assert.deepEqual(farm.json().footprints, FOOTPRINTS);
  } finally { await app.close(); }
});
