import { test } from 'node:test';
import assert from 'node:assert/strict';
import { database, migrate } from '../src/db.js';
import { buildApp } from '../src/app.js';
import { auth } from '../src/auth.js';
import { game } from '../src/game.js';
import { randomUUID } from 'node:crypto';
const testUrl = process.env.TEST_DATABASE_URL;
if (testUrl && !new URL(testUrl).pathname.endsWith('_test')) throw new Error('TEST_DATABASE_URL exige banco de testes com sufixo _test.');

test('cliente e arte sao servidos com lista fechada, MIME correto e sem acesso ao servidor', async () => {
  const db = await database(testUrl, 'memory://');
  await migrate(db);
  const app = await buildApp(db);
  try {
    const page = await app.inject('/play/');
    assert.equal(page.statusCode, 200);
    assert.match(page.headers['content-type']!, /^text\/html/);
    assert.match(page.headers['content-security-policy']!, /frame-ancestors 'none'/);
    assert.match(page.body, /id="mapViewport"/);
    const art = await app.inject('/art/reused-art.js');
    assert.match(art.headers['cache-control']!, /must-revalidate/);
    assert.equal((await app.inject({ url: '/art/reused-art.js', headers: { 'if-none-match': art.headers.etag } })).statusCode, 304);
    for (const asset of ['/play/app.js', '/play/map.js', '/play/style.css', '/art/sprites.js', '/art/reused-art.js', '/art/fonts/pixelify-sans-latin-400-normal.woff2'])
      assert.equal((await app.inject(asset)).statusCode, 200, asset);
    for (const path of ['/server/.env', '/.env', '/play/.env', '/art/../server/.env', '/play/../../server/.data/postgres', '/server/src/auth.ts'])
      assert.equal((await app.inject(path)).statusCode, 404, path);
    const status = await app.inject('/api/auth/status');
    assert.deepEqual(status.json(), { authenticated: false });
    assert.equal((await app.inject({ url: '/api/auth/status', headers: { 'sec-fetch-site': 'cross-site' } })).statusCode, 403);
  } finally { await app.close(); await db.close(); }
});

test('pedido da fazenda A nao executa se o cookie mudar para conta B antes do envio', async () => {
  const db = await database(testUrl, 'memory://');
  await migrate(db);
  const a = await auth(db).register('a_'+randomUUID().replace(/-/g,'').slice(0,20), 'teste-seguro-123', 'Fazenda A');
  const b = await auth(db).register('b_'+randomUUID().replace(/-/g,'').slice(0,20), 'teste-seguro-123', 'Fazenda B');
  const sa = await game(db).snapshot(a.id), sb = await game(db).snapshot(b.id);
  const app = await buildApp(db);
  try {
    const operation = randomUUID();
    const headers = { origin: 'http://127.0.0.1:8860', cookie: `brotalume_session=${b.token}`, 'idempotency-key': operation, 'x-farm-id': sa.farm.id };
    const rejected = await app.inject({ method: 'POST', url: '/api/commands', headers, payload: { type: 'buy_seed' } });
    assert.equal(rejected.statusCode, 409);
    assert.equal(rejected.json().error, 'FARM_CHANGED');
    assert.equal((await game(db).snapshot(a.id)).coins, 80);
    assert.equal((await game(db).snapshot(b.id)).coins, 80);
    assert.equal((await db.query('SELECT count(*)::int AS n FROM operations WHERE farm_id=$1 OR farm_id=$2', [sa.farm.id,sb.farm.id])).rows[0].n, 0);
    // A recusa nao ocupa a chave na outra fazenda. Uma acao nova e explicitamente de B funciona.
    const accepted = await app.inject({ method: 'POST', url: '/api/commands', headers: { ...headers, 'x-farm-id': sb.farm.id }, payload: { type: 'buy_seed' } });
    assert.equal(accepted.statusCode, 200);
    assert.equal((await game(db).snapshot(b.id)).coins, 77);
  } finally { await app.close(); await db.close(); }
});
