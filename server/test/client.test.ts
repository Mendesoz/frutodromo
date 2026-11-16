import { test } from 'node:test';
import assert from 'node:assert/strict';
import { database, migrate } from '../src/db.js';
import { buildApp } from '../src/app.js';

test('cliente e arte sao servidos com lista fechada, MIME correto e sem acesso ao servidor', async () => {
  const db = await database(undefined, 'memory://');
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
