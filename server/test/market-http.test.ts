import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { database, migrate } from '../src/db.js';
import { buildApp } from '../src/app.js';
import { auth } from '../src/auth.js';
import { game } from '../src/game.js';

const testUrl = process.env.TEST_DATABASE_URL;
if (testUrl && !new URL(testUrl).pathname.endsWith('_test')) throw new Error('TEST_DATABASE_URL exige banco de testes com sufixo _test.');

test('mercado HTTP autentica, rejeita total forjado e vincula comando a fazenda antes de negociar', async () => {
  const db = await database(testUrl, 'memory://');
  await migrate(db);
  const app = await buildApp(db);
  try {
    assert.equal((await app.inject('/api/market')).statusCode, 401);
    const seller = await auth(db).register('s_'+randomUUID().replace(/-/g,'').slice(0,20), 'teste-seguro-123', 'Banca HTTP');
    const buyer = await auth(db).register('b_'+randomUUID().replace(/-/g,'').slice(0,20), 'teste-seguro-123', 'Comprador HTTP');
    const sellerFarm = (await game(db).snapshot(seller.id)).farm.id;
    const buyerFarm = (await game(db).snapshot(buyer.id)).farm.id;
    const send = (token: string, farmId: string, payload: unknown, key = randomUUID()) => app.inject({
      method: 'POST', url: '/api/commands', payload,
      headers: { origin: 'http://127.0.0.1:8860', cookie: `brotalume_session=${token}`, 'x-farm-id': farmId, 'idempotency-key': key }
    });
    const listed = await send(seller.token, sellerFarm, { type: 'market_list', item: 'corn', quantity: 2, unitPrice: 2 });
    assert.equal(listed.statusCode, 200);
    const market = await app.inject({ url: '/api/market', headers: { cookie: `brotalume_session=${buyer.token}` } });
    const listing = market.json().listings.find((l: any) => l.sellerFarmId === sellerFarm);
    assert.equal(listing.totalPrice, 4);
    const command = { type: 'market_buy', listingId: listing.id };
    assert.equal((await send(buyer.token, buyerFarm, { ...command, totalPrice: 0 })).statusCode, 400);
    assert.equal((await send(buyer.token, buyerFarm, { ...command, sellerFarmId: buyerFarm })).statusCode, 400);
    const changed = await send(buyer.token, sellerFarm, command);
    assert.equal(changed.statusCode, 409);
    assert.equal(changed.json().error, 'FARM_CHANGED');
    assert.equal((await game(db).snapshot(buyer.id)).coins, 80);
    const key = randomUUID();
    const bought = await send(buyer.token, buyerFarm, command, key);
    assert.equal(bought.statusCode, 200);
    assert.deepEqual((await send(buyer.token, buyerFarm, command, key)).json(), bought.json());
    assert.equal((await game(db).snapshot(buyer.id)).coins, 76);
    assert.equal((await game(db).snapshot(seller.id)).coins, 84);
  } finally { await app.close(); await db.close(); }
});

test('lote em custodia impede resgate de semente mesmo com estoque e saldo vazios', async () => {
  const db = await database(testUrl, 'memory://');
  await migrate(db);
  try {
    const user = await auth(db).register('r_'+randomUUID().replace(/-/g,'').slice(0,20), 'teste-seguro-123', 'Resgate na feira');
    const farms = game(db);
    const farmId = (await farms.snapshot(user.id)).farm.id;
    await farms.execute(user.id, randomUUID(), { type: 'market_list', item: 'corn', quantity: 4, unitPrice: 1 });
    // Fixture de pobreza: sem alterar inventario ou reserva real do anuncio.
    await db.query('UPDATE wallets SET coins=0 WHERE farm_id=$1', [farmId]);
    await assert.rejects(farms.execute(user.id, randomUUID(), { type: 'recover_seed' }), (e: any) => e.code === 'SEED_RECOVERY_UNAVAILABLE');
    const snapshot = await farms.snapshot(user.id);
    assert.equal(snapshot.inventory.find(i => i.item === 'corn')?.quantity, 0);
    assert.equal(snapshot.marketReservedCapacity, 4);
    assert.equal((await db.query("SELECT count(*)::int AS n FROM inventory_events WHERE farm_id=$1 AND reason='recover_seed'", [farmId])).rows[0].n, 0);
  } finally { await db.close(); }
});
