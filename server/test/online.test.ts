import { before, after, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname, basename, resolve } from 'node:path';
import { database, migrate, type Database } from '../src/db.js';
import { auth } from '../src/auth.js';
import { game, type Command, GameError } from '../src/game.js';
import { buildApp } from '../src/app.js';

let db: Database;
const url = process.env.TEST_DATABASE_URL;
if (url && !new URL(url).pathname.endsWith('_test')) throw new Error('TEST_DATABASE_URL deve apontar para banco com sufixo _test; testes apagam apenas esse banco.');
let now = new Date('2030-01-01T00:00:00Z');
const clock = () => new Date(now);
const advance = (seconds: number) => { now = new Date(now.getTime() + seconds * 1000); };
const key = () => randomUUID();
const err = (code: string) => (e: unknown) => e instanceof GameError && e.code === code;
const qty = (s: any, item: string) => s.inventory.find((i: any) => i.item === item)?.quantity ?? 0;
const create = async (name = 'fazendeiro') => auth(db).register(name, 'teste-seguro-123', 'Fazenda do teste');
const origin = 'http://127.0.0.1:8860';

before(async () => { db = await database(url, 'memory://'); await migrate(db); });
after(async () => { await db?.close(); });
beforeEach(async () => { await db.query('TRUNCATE players CASCADE'); now = new Date('2030-01-01T00:00:00Z'); });

test('migracoes podem rodar de novo sem apagar contas e senhas/sessoes nao ficam em texto puro', async () => {
  const user = await create();
  await migrate(db);
  const row = (await db.query('SELECT password_hash FROM players WHERE id=$1', [user.id])).rows[0];
  assert.notEqual(row.password_hash, 'teste-seguro-123');
  const sessions = (await db.query('SELECT token_hash FROM sessions')).rows;
  assert.equal(sessions[0].token_hash.length, 64);
  assert.notEqual(sessions[0].token_hash, user.token);
  const logged = await auth(db).login('fazendeiro', 'teste-seguro-123');
  assert.notEqual(logged.token, user.token);
  assert.equal(await auth(db).player(logged.token), user.id);
  await assert.rejects(auth(db).login('fazendeiro', 'senha-errada'), err('INVALID_CREDENTIALS'));
  await auth(db).logout(logged.token);
  await assert.rejects(auth(db).player(logged.token), err('AUTH_REQUIRED'));
});

test('ciclo milho -> racao -> ovo -> encomenda, com fila sequencial e razoes reconciliaveis', async () => {
  const user = await create(); const g = game(db, clock);
  let s = await g.snapshot(user.id);
  const plot = s.buildings.find(b => b.kind === 'plot').id;
  const mill = s.buildings.find(b => b.kind === 'feed_mill').id;
  const coop = s.buildings.find(b => b.kind === 'coop').id;
  await g.execute(user.id, key(), { type: 'queue', buildingId: plot, recipe: 'corn' });
  assert.equal(qty(await g.snapshot(user.id), 'corn'), 3);
  advance(30); assert.equal(qty(await g.snapshot(user.id), 'corn'), 5);
  await g.execute(user.id, key(), { type: 'queue', buildingId: mill, recipe: 'feed' });
  await g.execute(user.id, key(), { type: 'queue', buildingId: mill, recipe: 'feed' });
  s = await g.snapshot(user.id);
  assert.equal(s.jobs.length, 2);
  assert.equal(new Date(s.jobs[0].finishes_at).getTime(), new Date(s.jobs[1].started_at).getTime());
  await assert.rejects(g.execute(user.id, key(), { type: 'queue', buildingId: mill, recipe: 'feed' }), err('QUEUE_FULL'));
  advance(90); assert.equal(qty(await g.snapshot(user.id), 'feed'), 2);
  await g.execute(user.id, key(), { type: 'queue', buildingId: coop, recipe: 'egg' });
  await g.execute(user.id, key(), { type: 'queue', buildingId: coop, recipe: 'egg' });
  advance(120); s = await g.snapshot(user.id); assert.equal(qty(s, 'egg'), 2);
  await g.execute(user.id, key(), { type: 'deliver' });
  s = await g.snapshot(user.id); assert.equal(s.coins, 98); assert.equal(qty(s, 'egg'), 0);
  assert.equal(Number((await db.query('SELECT sum(delta) AS n FROM ledger WHERE farm_id=$1', [s.farm.id])).rows[0].n), s.coins);
  const events = (await db.query('SELECT item,sum(delta)::int AS n FROM inventory_events WHERE farm_id=$1 GROUP BY item', [s.farm.id])).rows;
  for (const event of events) assert.equal(event.n, qty(s, event.item));
});

test('repeticao simultanea da mesma operacao produz um unico efeito e payload divergente e recusado', async () => {
  const user = await create(); const g = game(db, clock); const op = key();
  const command: Command = { type: 'expand', x: 1, y: 0 };
  const results = await Promise.all(Array.from({ length: 12 }, () => g.execute(user.id, op, command)));
  for (const result of results) assert.deepEqual(result, results[0]);
  const s = await g.snapshot(user.id); assert.equal(s.coins, 20); assert.equal(s.land.length, 2);
  await assert.rejects(g.execute(user.id, op, { type: 'expand', x: 0, y: 1 }), err('OPERATION_KEY_REUSED'));
  assert.equal((await g.snapshot(user.id)).coins, 20);
});

test('terreno exige adjacencia e saldo; nao concede producao ou cobra duas vezes', async () => {
  const user = await create(); const g = game(db, clock); const start = await g.snapshot(user.id);
  await assert.rejects(g.execute(user.id, key(), { type: 'expand', x: 2, y: 2 }), err('LAND_NOT_ADJACENT'));
  await g.execute(user.id, key(), { type: 'expand', x: 0, y: 1 });
  await assert.rejects(g.execute(user.id, key(), { type: 'expand', x: 0, y: 1 }), err('LAND_ALREADY_OWNED'));
  await assert.rejects(g.execute(user.id, key(), { type: 'expand', x: 0, y: 2 }), err('INSUFFICIENT_COINS'));
  const end = await g.snapshot(user.id);
  assert.equal(end.coins, 20); assert.equal(end.buildings.length, start.buildings.length);
});

test('capacidade reserva saidas, desfaz consumo ao falhar e permite encomenda com armazem cheio', async () => {
  const user = await create(); const g = game(db, clock); const s = await g.snapshot(user.id);
  await db.query('UPDATE farms SET capacity=10 WHERE id=$1', [s.farm.id]);
  await db.query("UPDATE inventory SET quantity=10 WHERE farm_id=$1 AND item='corn'", [s.farm.id]);
  const before = (await db.query('SELECT count(*)::int AS n FROM inventory_events')).rows[0].n;
  await assert.rejects(g.execute(user.id, key(), { type: 'queue', buildingId: s.buildings.find(b => b.kind === 'plot').id, recipe: 'corn' }), err('STORAGE_FULL'));
  assert.equal(qty(await g.snapshot(user.id), 'corn'), 10);
  assert.equal((await db.query('SELECT count(*)::int AS n FROM inventory_events')).rows[0].n, before);
  await db.query("UPDATE inventory SET quantity=8 WHERE farm_id=$1 AND item='corn'", [s.farm.id]);
  await db.query("INSERT INTO inventory(farm_id,item,quantity) VALUES($1,'egg',2)", [s.farm.id]);
  await g.execute(user.id, key(), { type: 'deliver' });
  assert.equal((await g.snapshot(user.id)).coins, 98);
});

test('avanco offline e repetidas consultas nao duplicam produtos; passo unico equivale a passos pequenos', async () => {
  const a = await create('fazenda_a'); const b = await create('fazenda_b'); const g = game(db, clock);
  for (const user of [a, b]) {
    const s = await g.snapshot(user.id); const mill = s.buildings.find(x => x.kind === 'feed_mill').id;
    for (let i = 0; i < 2; i++) await g.execute(user.id, key(), { type: 'queue', buildingId: mill, recipe: 'feed' });
  }
  for (let i = 0; i < 90; i++) { advance(1); await g.snapshot(a.id); }
  const [sa, sb] = await Promise.all([g.snapshot(a.id), g.snapshot(b.id)]);
  assert.deepEqual(sa.inventory, sb.inventory); assert.equal(qty(sb, 'feed'), 2);
  advance(30 * 86400);
  const snapshots = await Promise.all(Array.from({ length: 12 }, () => g.snapshot(b.id)));
  for (const s of snapshots) assert.equal(qty(s, 'feed'), 2);
  assert.equal((await db.query("SELECT count(*)::int AS n FROM inventory_events WHERE farm_id=$1 AND reason='production'", [sb.farm.id])).rows[0].n, 2);
});

test('recuperacao exige pobreza e ausencia de milho pendente; cooldown persiste e compra tem custo', async () => {
  const user = await create(); const g = game(db, clock); const s = await g.snapshot(user.id);
  await assert.rejects(g.execute(user.id, key(), { type: 'recover_seed' }), err('SEED_RECOVERY_UNAVAILABLE'));
  await g.execute(user.id, key(), { type: 'buy_seed' });
  assert.equal((await g.snapshot(user.id)).coins, 77);
  await db.query('UPDATE wallets SET coins=0 WHERE farm_id=$1', [s.farm.id]);
  await db.query("UPDATE inventory SET quantity=0 WHERE farm_id=$1 AND item='corn'", [s.farm.id]);
  await g.execute(user.id, key(), { type: 'recover_seed' });
  assert.equal(qty(await g.snapshot(user.id), 'corn'), 1);
  const plot = s.buildings.find(b => b.kind === 'plot').id;
  await g.execute(user.id, key(), { type: 'queue', buildingId: plot, recipe: 'corn' });
  await assert.rejects(g.execute(user.id, key(), { type: 'recover_seed' }), err('SEED_RECOVERY_UNAVAILABLE'));
  advance(30); await g.snapshot(user.id);
  await db.query("UPDATE inventory SET quantity=0 WHERE farm_id=$1 AND item='corn'", [s.farm.id]);
  await assert.rejects(g.execute(user.id, key(), { type: 'recover_seed' }), err('SEED_RECOVERY_UNAVAILABLE'));
  advance(3600); await g.execute(user.id, key(), { type: 'recover_seed' });
  assert.equal(qty(await g.snapshot(user.id), 'corn'), 1);
});

test('API exige sessao, bloqueia CSRF e campos forjados e isola edificios de outras contas', async () => {
  const app = await buildApp(db, { clock });
  try {
    assert.equal((await app.inject({ method: 'GET', url: '/api/farm' })).statusCode, 401);
    const payload = { username: 'teste_api', password: 'teste-seguro-123', farmName: 'Minha Fazenda' };
    assert.equal((await app.inject({ method: 'POST', url: '/api/auth/register', payload, headers: { origin: 'https://invasor.example' } })).statusCode, 403);
    const registered = await app.inject({ method: 'POST', url: '/api/auth/register', payload, headers: { origin } });
    assert.equal(registered.statusCode, 201, registered.body);
    assert.match(registered.headers['set-cookie'] as string, /HttpOnly/);
    assert.match(registered.headers['set-cookie'] as string, /SameSite=Lax/);
    const session = (registered.headers['set-cookie'] as string).split(';')[0];
    assert.equal((await app.inject({ method: 'GET', url: '/api/farm', headers: { cookie: session, 'sec-fetch-site': 'cross-site' } })).statusCode, 403);
    const headers = { origin, cookie: session, 'idempotency-key': key() };
    const forged = await app.inject({ method: 'POST', url: '/api/commands', headers, payload: { type: 'buy_seed', coins: 999999, now: '2099-01-01' } });
    assert.equal(forged.statusCode, 400);
    assert.equal((await app.inject({ method: 'POST', url: '/api/commands', headers: { origin, cookie: session }, payload: { type: 'buy_seed' } })).statusCode, 400);
    assert.equal((await app.inject({ method: 'POST', url: '/api/commands', headers: { origin, cookie: session, 'idempotency-key': 'bad' }, payload: { type: 'buy_seed' } })).statusCode, 400);
    assert.equal((await app.inject({ method: 'POST', url: '/api/auth/logout', headers: { origin, cookie: session, 'content-type': 'text/plain' }, payload: '{}' })).statusCode, 415);
    const other = await create('outra_conta'); const foreign = await game(db, clock).snapshot(other.id);
    const attempt = await app.inject({ method: 'POST', url: '/api/commands', headers, payload: { type: 'queue', recipe: 'corn', buildingId: foreign.buildings.find(b => b.kind === 'plot').id } });
    assert.equal(attempt.statusCode, 409); assert.equal(attempt.json().error, 'INVALID_BUILDING');
    assert.equal((await app.inject({ method: 'GET', url: '/api/farm', headers: { cookie: session } })).json().coins, 80);
    await db.query("UPDATE sessions SET expires_at=now()-interval '1 second' WHERE player_id=$1", [registered.json().playerId]);
    assert.equal((await app.inject({ method: 'GET', url: '/api/farm', headers: { cookie: session } })).statusCode, 401);
    await app.inject({ method: 'POST', url: '/api/auth/logout', headers: { origin, cookie: session }, payload: {} });
    assert.equal((await app.inject({ method: 'GET', url: '/api/farm', headers: { cookie: session } })).statusCode, 401);
  } finally { await app.close(); }
});

test('sessao expirada ou inventada e recusada, login tem limite de tentativas', async () => {
  const user = await create();
  await db.query("UPDATE sessions SET expires_at=now()-interval '1 second'");
  await assert.rejects(auth(db).player(user.token), err('AUTH_REQUIRED'));
  await assert.rejects(auth(db).player('inventado'), err('AUTH_REQUIRED'));
  const app = await buildApp(db);
  try {
    for (let i = 0; i < 10; i++) assert.equal((await app.inject({ method: 'POST', url: '/api/auth/login', headers: { origin }, payload: { username: 'nao_existe', password: 'senha-errada-123' } })).statusCode, 401);
    assert.equal((await app.inject({ method: 'POST', url: '/api/auth/login', headers: { origin }, payload: { username: 'nao_existe', password: 'senha-errada-123' } })).statusCode, 429);
  } finally { await app.close(); }
});

test('50 comandos por duas instancias nao gastam saldo duas vezes', async () => {
  const user = await create();
  const second = url ? await database(url) : db;
  const [a, b] = await Promise.all([buildApp(db), buildApp(second)]);
  try {
    const responses = await Promise.all(Array.from({ length: 50 }, (_, i) => (i % 2 ? a : b).inject({ method: 'POST', url: '/api/commands',
      headers: { origin, cookie: `brotalume_session=${user.token}`, 'idempotency-key': key() }, payload: { type: 'buy_seed' } })));
    assert.equal(responses.filter(r => r.statusCode === 200).length, 26);
    assert.equal(responses.filter(r => r.statusCode === 409).length, 24);
    const s = await game(db).snapshot(user.id);
    assert.equal(s.coins, 2); assert.equal(qty(s, 'corn'), 30);
    assert.equal((await db.query('SELECT count(*)::int AS n FROM ledger WHERE farm_id=$1', [s.farm.id])).rows[0].n, 27);
  } finally { await a.close(); await b.close(); if (second !== db) await second.close(); }
});

test('mesma chave em duas instancias recebe um recibo e um debito; capacidade concorrente tambem e respeitada', async () => {
  const user = await create(); const second = url ? await database(url) : db;
  const [a, b] = await Promise.all([buildApp(db), buildApp(second)]);
  try {
    const op = key();
    const responses = await Promise.all(Array.from({ length: 30 }, (_, i) => (i % 2 ? a : b).inject({ method: 'POST', url: '/api/commands',
      headers: { origin, cookie: `brotalume_session=${user.token}`, 'idempotency-key': op }, payload: { type: 'buy_seed' } })));
    for (const response of responses) { assert.equal(response.statusCode, 200); assert.deepEqual(response.json(), responses[0].json()); }
    const s = await game(db).snapshot(user.id);
    assert.equal(s.coins, 77); assert.equal(qty(s, 'corn'), 5);
    assert.equal((await db.query('SELECT count(*)::int AS n FROM ledger WHERE farm_id=$1 AND operation_key=$2', [s.farm.id, 'command:' + op])).rows[0].n, 1);
    await db.query('UPDATE farms SET capacity=10 WHERE id=$1', [s.farm.id]);
    const buys = await Promise.all(Array.from({ length: 20 }, (_, i) => (i % 2 ? a : b).inject({ method: 'POST', url: '/api/commands',
      headers: { origin, cookie: `brotalume_session=${user.token}`, 'idempotency-key': key() }, payload: { type: 'buy_seed' } })));
    assert.equal(buys.filter(r => r.statusCode === 200).length, 5);
    assert.equal(buys.filter(r => r.json().error === 'STORAGE_FULL').length, 15);
    const after = await game(db).snapshot(user.id); assert.equal(qty(after, 'corn'), 10); assert.equal(after.coins, 62);
    assert.equal(after.nextExpansionCost, 60); assert.equal(after.reservedCapacity, 0);
  } finally { await a.close(); await b.close(); if (second !== db) await second.close(); }
});

test('construcao propria incompativel e recusada e reservas ficam visiveis', async () => {
  const user = await create(); const g = game(db, clock); const s = await g.snapshot(user.id);
  const plot = s.buildings.find(b => b.kind === 'plot').id;
  await assert.rejects(g.execute(user.id, key(), { type: 'queue', buildingId: plot, recipe: 'egg' }), err('INVALID_BUILDING'));
  await g.execute(user.id, key(), { type: 'queue', buildingId: plot, recipe: 'corn' });
  assert.equal((await g.snapshot(user.id)).reservedCapacity, 2);
});

test('cadastro usa clock de teste mesmo no passado; sessoes mantem tempo real do banco', async () => {
  const past = () => new Date('2001-01-01T00:00:00Z');
  const user = await auth(db, past).register('relogio_passado', 'teste-seguro-123', 'Passado');
  const s = await game(db, past).snapshot(user.id);
  assert.equal(s.serverTime, past().toISOString()); assert.equal(await auth(db).player(user.token), user.id);
  assert.equal(new Date((await db.query('SELECT created_at FROM ledger WHERE farm_id=$1', [s.farm.id])).rows[0].created_at).toISOString(), past().toISOString());
});

test('resgate espera producao ou entrega possivel, mas um ovo isolado nao trava recuperacao', async () => {
  const user = await create(); const g = game(db, clock); const s = await g.snapshot(user.id);
  await db.query('UPDATE wallets SET coins=0 WHERE farm_id=$1', [s.farm.id]);
  await db.query("UPDATE inventory SET quantity=0 WHERE farm_id=$1 AND item='corn'", [s.farm.id]);
  await db.query("INSERT INTO inventory(farm_id,item,quantity) VALUES($1,'egg',2)", [s.farm.id]);
  await assert.rejects(g.execute(user.id, key(), { type: 'recover_seed' }), err('SEED_RECOVERY_UNAVAILABLE'));
  await db.query("UPDATE inventory SET quantity=1 WHERE farm_id=$1 AND item='egg'", [s.farm.id]);
  await db.query("INSERT INTO inventory(farm_id,item,quantity) VALUES($1,'feed',1)", [s.farm.id]);
  await assert.rejects(g.execute(user.id, key(), { type: 'recover_seed' }), err('SEED_RECOVERY_UNAVAILABLE'));
  await db.query("UPDATE inventory SET quantity=0 WHERE farm_id=$1 AND item='feed'", [s.farm.id]);
  await g.execute(user.id, key(), { type: 'recover_seed' });
  assert.equal(qty(await g.snapshot(user.id), 'corn'), 1);
});

test('login limpa sessoes expiradas e limita sessoes ativas por conta', async () => {
  const user = await create();
  await db.query("UPDATE sessions SET expires_at=now()-interval '1 second'");
  for (let i = 0; i < 12; i++) await auth(db).login('fazendeiro', 'teste-seguro-123');
  assert.equal((await db.query('SELECT count(*)::int AS n FROM sessions WHERE player_id=$1', [user.id])).rows[0].n, 10);
});

test('PGlite de desenvolvimento preserva fazenda apos fechar e abrir o banco', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'brotalume-db-'));
  let persistent: Database | undefined;
  try {
    persistent = await database(undefined, folder); await migrate(persistent);
    const user = await auth(persistent).register('persistencia', 'teste-seguro-123', 'Persistente');
    await persistent.close(); persistent = await database(undefined, folder); await migrate(persistent);
    assert.equal((await game(persistent).snapshot(user.id)).farm.name, 'Persistente');
    assert.equal(await auth(persistent).player(user.token), user.id);
  } finally {
    await persistent?.close();
    if (dirname(resolve(folder)) !== resolve(tmpdir()) || !basename(folder).startsWith('brotalume-db-')) throw new Error('Pasta temporaria inesperada.');
    await rm(folder, { recursive: true });
  }
});

test('recuo do relogio do servidor nao permite antecipar producao ou voltar o estado', async () => {
  const user = await create(); const g = game(db, clock); const s = await g.snapshot(user.id);
  const plot = s.buildings.find(b => b.kind === 'plot').id;
  await g.execute(user.id, key(), { type: 'queue', buildingId: plot, recipe: 'corn' });
  advance(30); const produced = await g.snapshot(user.id);
  advance(-1000); const regressed = await g.snapshot(user.id);
  assert.equal(regressed.serverTime, produced.serverTime);
  const next = await g.execute(user.id, key(), { type: 'queue', buildingId: plot, recipe: 'corn' });
  assert.equal(next.finishesAt, '2030-01-01T00:01:00.000Z');
});

test('chaves fornecidas pelo cliente nao colidem com eventos internos de producao', async () => {
  const user = await create(); const g = game(db, clock); const s = await g.snapshot(user.id);
  const plot = s.buildings.find(b => b.kind === 'plot').id;
  const first = await g.execute(user.id, key(), { type: 'queue', buildingId: plot, recipe: 'corn' });
  advance(30);
  await g.execute(user.id, first.jobId as string, { type: 'queue', buildingId: plot, recipe: 'corn' });
  advance(30); assert.equal(qty(await g.snapshot(user.id), 'corn'), 6);
});
