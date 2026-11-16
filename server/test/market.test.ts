import { after, before, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { database, migrate, type Database } from '../src/db.js';
import { auth } from '../src/auth.js';
import { game, GameError } from '../src/game.js';
import { activeMarketReserved, occupancy } from '../src/economy.js';
import { market, isMarketCommand, MARKET_RULES, type MarketCommand } from '../src/market.js';

let db: Database;
const url = process.env.TEST_DATABASE_URL;
if (url && !new URL(url).pathname.endsWith('_test')) throw new Error('TEST_DATABASE_URL deve apontar para banco com sufixo _test; testes apagam apenas esse banco.');
let now = new Date('2030-01-01T00:00:00Z');
const clock = () => new Date(now);
const advance = (seconds: number) => { now = new Date(now.getTime() + seconds * 1000); };
const key = () => randomUUID();
const err = (code: string) => (e: unknown) => e instanceof GameError && e.code === code;
// Este arquivo divide o banco de CI com os outros: nome unico por conta e nenhum TRUNCATE.
const username = () => 'u' + randomUUID().replace(/-/g, '').slice(0, 20);
const create = (farmName = 'Fazenda do mercado') => auth(db).register(username(), 'teste-seguro-123', farmName);

const coins = async (farm: string) => (await db.query('SELECT coins FROM wallets WHERE farm_id=$1', [farm])).rows[0].coins as number;
const inv = async (farm: string, item: string) =>
  ((await db.query('SELECT quantity FROM inventory WHERE farm_id=$1 AND item=$2', [farm, item])).rows[0]?.quantity ?? 0) as number;
const escrow = async (farm: string, item: string) =>
  (await db.query("SELECT COALESCE(sum(quantity),0)::int AS n FROM market_listings WHERE seller_farm_id=$1 AND item=$2 AND status='active'", [farm, item])).rows[0].n as number;
const held = async (farm: string, item: string) => (await inv(farm, item)) + (await escrow(farm, item));
const listingRow = async (id: string) => (await db.query('SELECT * FROM market_listings WHERE id=$1', [id])).rows[0];
const tradesOf = async (id: string) => (await db.query('SELECT * FROM market_trades WHERE listing_id=$1', [id])).rows;
// Razoes reconciliam: o inventario de cada fazenda e exatamente a soma dos eventos.
const reconciles = async (farm: string, label: string) => {
  const events = (await db.query('SELECT item,sum(delta)::int AS n FROM inventory_events WHERE farm_id=$1 GROUP BY item', [farm])).rows;
  for (const event of events) assert.equal(event.n, await inv(farm, event.item), `${label}: eventos de ${event.item} nao batem com o estoque`);
  const ledger = (await db.query('SELECT COALESCE(sum(delta),0)::int AS n FROM ledger WHERE farm_id=$1', [farm])).rows[0].n;
  assert.equal(ledger, await coins(farm), `${label}: razao de moedas nao bate com a carteira`);
};
// Estoque de preparo com evento junto, para a reconciliacao continuar valendo.
const grant = async (farm: string, item: string, quantity: number) => {
  await db.query(`INSERT INTO inventory(farm_id,item,quantity) VALUES($1,$2,$3)
    ON CONFLICT(farm_id,item) DO UPDATE SET quantity=inventory.quantity+excluded.quantity`, [farm, item, quantity]);
  await db.query('INSERT INTO inventory_events(id,farm_id,item,delta,reason,operation_key,created_at) VALUES($1,$2,$3,$4,$5,$6,$7)',
    [randomUUID(), farm, item, quantity, 'test_grant', 'test:' + randomUUID(), clock()]);
};
const open = async (seller: { id: string }, item: 'corn' | 'feed' | 'egg', quantity: number, unitPrice: number) =>
  (await market(db, clock).execute(seller.id, key(), { type: 'market_list', item, quantity, unitPrice })).listingId as string;
const farmOf = async (playerId: string) => (await market(db, clock).snapshot(playerId)).farmId;

before(async () => { db = await database(url, 'memory://'); await migrate(db); });
after(async () => { await db?.close(); });
beforeEach(() => { now = new Date('2030-01-01T00:00:00Z'); });

test('anunciar tira o lote do estoque sem mudar a ocupacao e cancelar devolve tudo', async () => {
  const seller = await create(); const m = market(db, clock);
  const farm = await farmOf(seller.id);
  const start = await occupancy(db, farm);
  assert.deepEqual(start, { inventory: 4, production: 0, market: 0, total: 4 });
  const op = key();
  const receipt = await m.execute(seller.id, op, { type: 'market_list', item: 'corn', quantity: 3, unitPrice: 2 });
  assert.deepEqual(receipt, { key: op, type: 'market_list', listingId: receipt.listingId, item: 'corn', quantity: 3, unitPrice: 2, totalPrice: 6 });
  const id = receipt.listingId as string;
  assert.equal(await inv(farm, 'corn'), 1);
  assert.equal(await activeMarketReserved(db, farm), 3);
  // Custodia nao cria nem destroi espaco: o que saiu do estoque continua ocupando o armazem.
  assert.deepEqual(await occupancy(db, farm), { inventory: 1, production: 0, market: 3, total: 4 });
  assert.equal(await coins(farm), 80, 'anunciar nao mexe em moeda');
  const listed = await listingRow(id);
  assert.equal(listed.status, 'active'); assert.equal(listed.buyer_farm_id, null); assert.equal(listed.unit_price, 2);
  const shown = (await m.snapshot(seller.id)).listings.find(l => l.id === id)!;
  assert.deepEqual({ item: shown.item, quantity: shown.quantity, unitPrice: shown.unitPrice, totalPrice: shown.totalPrice, mine: shown.mine, sellerName: shown.sellerName },
    { item: 'corn', quantity: 3, unitPrice: 2, totalPrice: 6, mine: true, sellerName: 'Fazenda do mercado' });
  await reconciles(farm, 'depois de anunciar');

  const cancelled = await m.execute(seller.id, key(), { type: 'market_cancel', listingId: id });
  assert.deepEqual({ ...cancelled, key: undefined }, { key: undefined, type: 'market_cancel', listingId: id, item: 'corn', quantity: 3, returned: 3 });
  assert.equal(await inv(farm, 'corn'), 4);
  assert.deepEqual(await occupancy(db, farm), start);
  const closed = await listingRow(id);
  assert.equal(closed.status, 'cancelled'); assert.ok(closed.cancelled_at); assert.equal(closed.sold_at, null);
  assert.equal(closed.quantity, 3, 'historico do lote nao pode ser apagado');
  assert.equal((await m.snapshot(seller.id)).listings.some(l => l.id === id), false);
  assert.equal((await m.snapshot(seller.id)).myListings.find(l => l.id === id)!.status, 'cancelled');
  await reconciles(farm, 'depois de cancelar');
  await assert.rejects(m.execute(seller.id, key(), { type: 'market_cancel', listingId: id }), err('LISTING_UNAVAILABLE'));
});

test('compra move moedas e itens entre duas contas, conserva o total e nao se repete', async () => {
  const seller = await create('Fazenda vendedora'); const buyer = await create('Fazenda compradora');
  const m = market(db, clock);
  const sellerFarm = await farmOf(seller.id); const buyerFarm = await farmOf(buyer.id);
  const id = await open(seller, 'corn', 3, 2);
  const itemsBefore = await held(sellerFarm, 'corn') + await held(buyerFarm, 'corn');
  const coinsBefore = await coins(sellerFarm) + await coins(buyerFarm);
  const op = key();
  const receipt = await m.execute(buyer.id, op, { type: 'market_buy', listingId: id });
  assert.deepEqual({ ...receipt, tradeId: undefined }, { key: op, type: 'market_buy', listingId: id, tradeId: undefined,
    sellerFarmId: sellerFarm, item: 'corn', quantity: 3, unitPrice: 2, totalPrice: 6 });
  assert.equal(await coins(buyerFarm), 74); assert.equal(await coins(sellerFarm), 86);
  assert.equal(await inv(buyerFarm, 'corn'), 7); assert.equal(await inv(sellerFarm, 'corn'), 1);
  assert.equal(await escrow(sellerFarm, 'corn'), 0, 'venda libera a custodia do vendedor');
  assert.equal(await held(sellerFarm, 'corn') + await held(buyerFarm, 'corn'), itemsBefore, 'mercado nao cria nem destroi item');
  assert.equal(await coins(sellerFarm) + await coins(buyerFarm), coinsBefore, 'mercado nao cria nem destroi moeda');
  await reconciles(sellerFarm, 'vendedor'); await reconciles(buyerFarm, 'comprador');
  const sold = await listingRow(id);
  assert.equal(sold.status, 'sold'); assert.equal(sold.buyer_farm_id, buyerFarm); assert.ok(sold.sold_at);
  const trades = await tradesOf(id);
  assert.equal(trades.length, 1);
  assert.equal(trades[0].total_price, 6); assert.equal(trades[0].seller_farm_id, sellerFarm);
  // Sem taxa: o que saiu do comprador entrou inteiro no vendedor.
  assert.equal((await db.query("SELECT COALESCE(sum(delta),0)::int AS n FROM ledger WHERE operation_key=$1", ['trade:' + trades[0].id])).rows[0].n, 0);
  const mine = (await m.snapshot(seller.id)).trades.find(t => t.listingId === id)!;
  assert.equal(mine.side, 'sell'); assert.equal(mine.otherFarmName, 'Fazenda compradora'); assert.equal(mine.totalPrice, 6);
  const theirs = (await m.snapshot(buyer.id)).trades.find(t => t.listingId === id)!;
  assert.equal(theirs.side, 'buy'); assert.equal(theirs.otherFarmName, 'Fazenda vendedora');
  // Anuncio vendido nao pode ser comprado nem cancelado depois.
  await assert.rejects(m.execute(buyer.id, key(), { type: 'market_buy', listingId: id }), err('LISTING_UNAVAILABLE'));
  await assert.rejects(m.execute(seller.id, key(), { type: 'market_cancel', listingId: id }), err('LISTING_UNAVAILABLE'));
  // Rodar as migracoes de novo nao apaga o historico de negociacao.
  await migrate(db);
  assert.equal((await tradesOf(id)).length, 1);
  assert.equal((await listingRow(id)).status, 'sold');
});

test('mesma chave repete o recibo e payload diferente e recusado', async () => {
  const seller = await create(); const buyer = await create(); const m = market(db, clock);
  const sellerFarm = await farmOf(seller.id); const buyerFarm = await farmOf(buyer.id);
  const listKey = key();
  const first = await m.execute(seller.id, listKey, { type: 'market_list', item: 'corn', quantity: 2, unitPrice: 3 });
  const again = await m.execute(seller.id, listKey, { type: 'market_list', item: 'corn', quantity: 2, unitPrice: 3 });
  assert.deepEqual(again, first);
  assert.equal(await inv(sellerFarm, 'corn'), 2, 'anuncio repetido nao pode tirar o lote duas vezes');
  assert.equal((await db.query('SELECT count(*)::int AS n FROM market_listings WHERE seller_farm_id=$1', [sellerFarm])).rows[0].n, 1);
  await assert.rejects(m.execute(seller.id, listKey, { type: 'market_list', item: 'corn', quantity: 1, unitPrice: 3 }), err('OPERATION_KEY_REUSED'));
  assert.equal(await inv(sellerFarm, 'corn'), 2);
  await assert.rejects(m.execute(seller.id, 'curta', { type: 'market_cancel', listingId: first.listingId as string }), err('INVALID_OPERATION_KEY'));

  const buyKey = key();
  const command: MarketCommand = { type: 'market_buy', listingId: first.listingId as string };
  const results = await Promise.all(Array.from({ length: 8 }, () => m.execute(buyer.id, buyKey, command)));
  for (const result of results) assert.deepEqual(result, results[0]);
  assert.equal(await coins(buyerFarm), 74, 'oito repeticoes cobram uma vez so');
  assert.equal(await inv(buyerFarm, 'corn'), 6);
  assert.equal((await tradesOf(first.listingId as string)).length, 1);
  assert.equal((await db.query('SELECT count(*)::int AS n FROM ledger WHERE farm_id=$1 AND reason=$2', [buyerFarm, 'market_purchase'])).rows[0].n, 1);
  await reconciles(buyerFarm, 'comprador repetido'); await reconciles(sellerFarm, 'vendedor repetido');
});

test('item, quantidade e preco fora da regra nao criam anuncio', async () => {
  const seller = await create(); const m = market(db, clock);
  const farm = await farmOf(seller.id);
  const list = (command: unknown) => m.execute(seller.id, key(), command as MarketCommand);
  await assert.rejects(list({ type: 'market_list', item: 'ouro', quantity: 1, unitPrice: 2 }), err('INVALID_MARKET_ITEM'));
  await assert.rejects(list({ type: 'market_list', item: 'corn', quantity: 0, unitPrice: 2 }), err('INVALID_MARKET_QUANTITY'));
  await assert.rejects(list({ type: 'market_list', item: 'corn', quantity: -3, unitPrice: 2 }), err('INVALID_MARKET_QUANTITY'));
  await assert.rejects(list({ type: 'market_list', item: 'corn', quantity: 1.5, unitPrice: 2 }), err('INVALID_MARKET_QUANTITY'));
  await assert.rejects(list({ type: 'market_list', item: 'corn', quantity: MARKET_RULES.maxQuantity + 1, unitPrice: 2 }), err('INVALID_MARKET_QUANTITY'));
  await assert.rejects(list({ type: 'market_list', item: 'corn', quantity: 1, unitPrice: 0 }), err('INVALID_MARKET_PRICE'));
  await assert.rejects(list({ type: 'market_list', item: 'corn', quantity: 1, unitPrice: MARKET_RULES.prices.corn.max + 1 }), err('INVALID_MARKET_PRICE'));
  await assert.rejects(list({ type: 'market_list', item: 'corn', quantity: 1, unitPrice: 2.5 }), err('INVALID_MARKET_PRICE'));
  await assert.rejects(list({ type: 'market_list', item: 'egg', quantity: 1, unitPrice: 2 }), err('INVALID_MARKET_PRICE'));
  await assert.rejects(list({ type: 'market_vender', item: 'corn', quantity: 1, unitPrice: 2 }), err('INVALID_COMMAND'));
  // Lote maior que o estoque tambem nao passa, e nada e reservado.
  await assert.rejects(list({ type: 'market_list', item: 'corn', quantity: 5, unitPrice: 2 }), err('INSUFFICIENT_ITEMS'));
  await assert.rejects(list({ type: 'market_list', item: 'egg', quantity: 1, unitPrice: 3 }), err('INSUFFICIENT_ITEMS'));
  assert.equal(await inv(farm, 'corn'), 4);
  assert.equal((await db.query('SELECT count(*)::int AS n FROM market_listings WHERE seller_farm_id=$1', [farm])).rows[0].n, 0);
  assert.deepEqual(await occupancy(db, farm), { inventory: 4, production: 0, market: 0, total: 4 });
  assert.equal(isMarketCommand({ type: 'market_buy' }), true);
  assert.equal(isMarketCommand({ type: 'queue' }), false);
});

test('saldo curto desfaz a compra inteira, inclusive a producao que seria colhida', async () => {
  const seller = await create(); const buyer = await create(); const m = market(db, clock);
  const sellerFarm = await farmOf(seller.id); const buyerFarm = await farmOf(buyer.id);
  const g = game(db, clock);
  const plot = (await g.snapshot(buyer.id)).buildings.find((b: any) => b.kind === 'plot').id;
  await g.execute(buyer.id, key(), { type: 'queue', buildingId: plot, recipe: 'corn' });
  advance(30);
  await db.query('UPDATE wallets SET coins=1 WHERE farm_id=$1', [buyerFarm]);
  const id = await open(seller, 'corn', 3, 2);
  await assert.rejects(m.execute(buyer.id, key(), { type: 'market_buy', listingId: id }), err('INSUFFICIENT_COINS'));
  assert.equal(await coins(buyerFarm), 1); assert.equal(await coins(sellerFarm), 80);
  assert.equal(await inv(buyerFarm, 'corn'), 3);
  assert.equal((await listingRow(id)).status, 'active');
  assert.equal((await tradesOf(id)).length, 0);
  assert.equal((await db.query("SELECT count(*)::int AS n FROM ledger WHERE farm_id=$1 AND operation_key LIKE 'trade:%'", [buyerFarm])).rows[0].n, 0);
  // A falha desfez tambem o acerto de producao: o milho pronto continua por colher.
  assert.equal((await db.query('SELECT count(*)::int AS n FROM production_jobs WHERE farm_id=$1 AND claimed_at IS NULL', [buyerFarm])).rows[0].n, 1);
  assert.equal((await db.query('SELECT count(*)::int AS n FROM operations WHERE farm_id=$1', [buyerFarm])).rows[0].n, 1);

  await db.query('UPDATE wallets SET coins=80 WHERE farm_id=$1', [buyerFarm]);
  await m.execute(buyer.id, key(), { type: 'market_buy', listingId: id });
  assert.equal(await inv(buyerFarm, 'corn'), 8, 'colheita pendente entra uma vez e o lote comprado tambem');
  assert.equal(await coins(buyerFarm), 74);
  assert.equal((await db.query("SELECT count(*)::int AS n FROM inventory_events WHERE farm_id=$1 AND reason='production'", [buyerFarm])).rows[0].n, 1);
  await reconciles(buyerFarm, 'comprador depois do rollback');
});

test('capacidade do comprador conta estoque, producao e lotes reservados', async () => {
  const seller = await create(); const buyer = await create(); const m = market(db, clock);
  const sellerFarm = await farmOf(seller.id); const buyerFarm = await farmOf(buyer.id);
  await db.query('UPDATE farms SET capacity=10 WHERE id=$1', [buyerFarm]);
  await grant(buyerFarm, 'corn', 4);
  await m.execute(buyer.id, key(), { type: 'market_list', item: 'corn', quantity: 3, unitPrice: 2 });
  assert.deepEqual(await occupancy(db, buyerFarm), { inventory: 5, production: 0, market: 3, total: 8 });
  const id = await open(seller, 'corn', 3, 2);
  // 5 no estoque + 3 reservados + 3 comprados passam dos 10 de capacidade.
  await assert.rejects(m.execute(buyer.id, key(), { type: 'market_buy', listingId: id }), err('STORAGE_FULL'));
  assert.equal(await coins(buyerFarm), 80); assert.equal((await listingRow(id)).status, 'active');
  await db.query('UPDATE farms SET capacity=11 WHERE id=$1', [buyerFarm]);
  await m.execute(buyer.id, key(), { type: 'market_buy', listingId: id });
  assert.deepEqual(await occupancy(db, buyerFarm), { inventory: 8, production: 0, market: 3, total: 11 });
  assert.equal(await coins(buyerFarm), 74); assert.equal(await coins(sellerFarm), 86);
  await reconciles(buyerFarm, 'comprador no limite');
});

test('lote reservado protege o cancelamento mesmo com producao ocupando o armazem', async () => {
  const seller = await create(); const m = market(db, clock); const g = game(db, clock);
  const farm = await farmOf(seller.id);
  await db.query('UPDATE farms SET capacity=10 WHERE id=$1', [farm]);
  await grant(farm, 'corn', 6);
  const id = await open(seller, 'corn', 4, 2);
  assert.deepEqual(await occupancy(db, farm), { inventory: 6, production: 0, market: 4, total: 10 });
  const plot = (await g.snapshot(seller.id)).buildings.find((b: any) => b.kind === 'plot').id;
  // Depende de game.ts contar a reserva de mercado (occupancy) na capacidade: sem isso
  // a producao caberia agora e o cancelamento ficaria preso com o armazem estourado.
  await assert.rejects(g.execute(seller.id, key(), { type: 'queue', buildingId: plot, recipe: 'corn' }), err('STORAGE_FULL'));
  assert.equal(await inv(farm, 'corn'), 6, 'recusa por capacidade nao pode consumir a semente');
  await m.execute(seller.id, key(), { type: 'market_cancel', listingId: id });
  assert.equal(await inv(farm, 'corn'), 10);
  const end = await occupancy(db, farm);
  assert.deepEqual(end, { inventory: 10, production: 0, market: 0, total: 10 });
  assert.ok(end.total <= 10, 'cancelar nunca pode estourar o armazem');
  await reconciles(farm, 'cancelamento com producao');
});

test('nao se compra o proprio lote nem se cancela o lote alheio', async () => {
  const seller = await create(); const other = await create(); const m = market(db, clock);
  const sellerFarm = await farmOf(seller.id); const otherFarm = await farmOf(other.id);
  const id = await open(seller, 'corn', 2, 2);
  await assert.rejects(m.execute(seller.id, key(), { type: 'market_buy', listingId: id }), err('OWN_LISTING'));
  await assert.rejects(m.execute(other.id, key(), { type: 'market_cancel', listingId: id }), err('NOT_LISTING_OWNER'));
  await assert.rejects(m.execute(other.id, key(), { type: 'market_buy', listingId: randomUUID() }), err('LISTING_NOT_FOUND'));
  await assert.rejects(m.execute(other.id, key(), { type: 'market_cancel', listingId: 'nao-e-uuid' }), err('LISTING_NOT_FOUND'));
  assert.equal((await listingRow(id)).status, 'active');
  assert.equal(await escrow(sellerFarm, 'corn'), 2);
  assert.equal(await coins(sellerFarm), 80); assert.equal(await coins(otherFarm), 80);
  assert.equal((await db.query('SELECT count(*)::int AS n FROM operations WHERE farm_id=$1', [otherFarm])).rows[0].n, 0,
    'tentativa recusada nao grava recibo');
  // O mesmo lote visto pela outra conta nao vem marcado como proprio.
  const seen = (await m.snapshot(other.id)).listings.find(l => l.id === id)!;
  assert.equal(seen.mine, false); assert.equal(seen.sellerFarmId, sellerFarm);
  assert.equal((await m.snapshot(other.id)).myListings.some(l => l.id === id), false);
});

test('fazenda esperada diferente da sessao recusa o comando sem efeito', async () => {
  const seller = await create(); const buyer = await create(); const m = market(db, clock);
  const sellerFarm = await farmOf(seller.id); const buyerFarm = await farmOf(buyer.id);
  const id = await open(seller, 'corn', 2, 2);
  await assert.rejects(m.execute(buyer.id, key(), { type: 'market_buy', listingId: id }, sellerFarm), err('FARM_CHANGED'));
  await assert.rejects(m.execute(buyer.id, key(), { type: 'market_list', item: 'corn', quantity: 1, unitPrice: 2 }, sellerFarm), err('FARM_CHANGED'));
  assert.equal(await coins(buyerFarm), 80); assert.equal((await listingRow(id)).status, 'active');
  assert.equal(await inv(buyerFarm, 'corn'), 4);
  await m.execute(buyer.id, key(), { type: 'market_buy', listingId: id }, buyerFarm);
  assert.equal(await coins(buyerFarm), 76); assert.equal((await listingRow(id)).status, 'sold');
});

test('dois compradores ao mesmo tempo: uma venda, um recusado, moedas conferem', async () => {
  const seller = await create(); const first = await create(); const second = await create();
  const other = url ? await database(url) : db;
  try {
    const sellerFarm = await farmOf(seller.id);
    const firstFarm = await farmOf(first.id); const secondFarm = await farmOf(second.id);
    const id = await open(seller, 'corn', 3, 2);
    const results = await Promise.allSettled([
      market(db, clock).execute(first.id, key(), { type: 'market_buy', listingId: id }),
      market(other, clock).execute(second.id, key(), { type: 'market_buy', listingId: id })
    ]);
    const done = results.filter(r => r.status === 'fulfilled');
    const refused = results.filter(r => r.status === 'rejected');
    assert.equal(done.length, 1, 'um unico comprador pode levar o lote');
    assert.equal(refused.length, 1);
    assert.ok(err('LISTING_UNAVAILABLE')((refused[0] as PromiseRejectedResult).reason), (refused[0] as PromiseRejectedResult).reason);
    assert.equal((await tradesOf(id)).length, 1);
    assert.equal((await listingRow(id)).status, 'sold');
    const paid = [await coins(firstFarm), await coins(secondFarm)].sort();
    assert.deepEqual(paid, [74, 80]);
    assert.equal(await coins(sellerFarm), 86);
    assert.equal(await inv(firstFarm, 'corn') + await inv(secondFarm, 'corn'), 11, 'so um comprador recebe o lote');
    assert.equal(await escrow(sellerFarm, 'corn'), 0);
    await reconciles(sellerFarm, 'vendedor disputado');
  } finally { if (other !== db) await other.close(); }
});

test('cancelar e comprar ao mesmo tempo produzem um unico efeito', async () => {
  const seller = await create(); const buyer = await create();
  const other = url ? await database(url) : db;
  try {
    const sellerFarm = await farmOf(seller.id); const buyerFarm = await farmOf(buyer.id);
    const id = await open(seller, 'corn', 3, 2);
    const results = await Promise.allSettled([
      market(db, clock).execute(seller.id, key(), { type: 'market_cancel', listingId: id }),
      market(other, clock).execute(buyer.id, key(), { type: 'market_buy', listingId: id })
    ]);
    assert.equal(results.filter(r => r.status === 'fulfilled').length, 1, 'cancelar e vender nao podem valer os dois');
    const refused = results.find(r => r.status === 'rejected') as PromiseRejectedResult;
    assert.ok(err('LISTING_UNAVAILABLE')(refused.reason), refused.reason);
    const end = await listingRow(id);
    assert.ok(['sold', 'cancelled'].includes(end.status));
    assert.equal(await escrow(sellerFarm, 'corn'), 0, 'o lote nao pode ficar preso em custodia');
    if (end.status === 'cancelled') {
      assert.equal(await inv(sellerFarm, 'corn'), 4); assert.equal(await inv(buyerFarm, 'corn'), 4);
      assert.equal(await coins(buyerFarm), 80); assert.equal(await coins(sellerFarm), 80);
      assert.equal((await tradesOf(id)).length, 0);
    } else {
      assert.equal(await inv(sellerFarm, 'corn'), 1); assert.equal(await inv(buyerFarm, 'corn'), 7);
      assert.equal(await coins(buyerFarm), 74); assert.equal(await coins(sellerFarm), 86);
      assert.equal((await tradesOf(id)).length, 1);
    }
    await reconciles(sellerFarm, 'vendedor na corrida'); await reconciles(buyerFarm, 'comprador na corrida');
  } finally { if (other !== db) await other.close(); }
});

test('compra reciproca entre duas fazendas termina sem travar o banco', async () => {
  const a = await create('Fazenda A'); const b = await create('Fazenda B');
  const other = url ? await database(url) : db;
  try {
    const farmA = await farmOf(a.id); const farmB = await farmOf(b.id);
    const ma = market(db, clock); const mb = market(other, clock);
    const listA = (await ma.execute(a.id, key(), { type: 'market_list', item: 'corn', quantity: 2, unitPrice: 2 })).listingId as string;
    const listB = (await mb.execute(b.id, key(), { type: 'market_list', item: 'corn', quantity: 2, unitPrice: 3 })).listingId as string;
    // A compra de B enquanto B compra de A: as duas transacoes pedem as mesmas duas
    // fazendas. Sem ordem estavel de trava isso vira deadlock.
    const results = await Promise.all([
      ma.execute(a.id, key(), { type: 'market_buy', listingId: listB }),
      mb.execute(b.id, key(), { type: 'market_buy', listingId: listA })
    ]);
    assert.equal(results.length, 2);
    assert.equal((await listingRow(listA)).status, 'sold');
    assert.equal((await listingRow(listB)).status, 'sold');
    assert.equal(await coins(farmA), 78); assert.equal(await coins(farmB), 82);
    assert.equal(await inv(farmA, 'corn'), 4); assert.equal(await inv(farmB, 'corn'), 4);
    assert.equal(await escrow(farmA, 'corn') + await escrow(farmB, 'corn'), 0);
    await reconciles(farmA, 'fazenda A'); await reconciles(farmB, 'fazenda B');
  } finally { if (other !== db) await other.close(); }
});

test('vitrine mostra o mais novo primeiro, limita anuncios ativos e nao vaza dado privado', async () => {
  const seller = await create('Banca do teste'); const visitor = await create(); const m = market(db, clock);
  const farm = await farmOf(seller.id);
  await grant(farm, 'corn', 36);
  const older = await open(seller, 'corn', 1, 2);
  advance(60);
  const newer = await open(seller, 'corn', 1, 3);
  const view = await m.snapshot(visitor.id);
  assert.deepEqual(view.rules, MARKET_RULES);
  assert.equal(view.farmId, await farmOf(visitor.id));
  assert.equal(view.serverTime, new Date(now).toISOString());
  const positions = view.listings.map(l => l.id);
  assert.ok(positions.indexOf(newer) < positions.indexOf(older), 'o anuncio mais novo vem primeiro');
  assert.ok(view.listings.length <= 60);
  const json = JSON.stringify(view);
  assert.equal(json.includes(seller.token), false);
  assert.match(json, /Banca do teste/);
  for (const secret of ['coins', 'password', 'token', 'session', 'username', 'player_id'])
    assert.equal(json.toLowerCase().includes(secret), false, `vitrine nao pode expor ${secret}`);

  for (let i = 2; i < MARKET_RULES.maxActiveListings; i++) await open(seller, 'corn', 1, 2);
  assert.equal(await activeMarketReserved(db, farm), MARKET_RULES.maxActiveListings);
  await assert.rejects(m.execute(seller.id, key(), { type: 'market_list', item: 'corn', quantity: 1, unitPrice: 2 }), err('TOO_MANY_LISTINGS'));
  assert.equal(await inv(farm, 'corn'), 40 - MARKET_RULES.maxActiveListings, 'recusa pelo teto nao pode reservar mais um lote');
  const own = await m.snapshot(seller.id);
  assert.equal(own.myListings.filter(l => l.status === 'active').length, MARKET_RULES.maxActiveListings);
  assert.ok(own.myListings.every(l => l.mine));
  // Cancelar um libera uma vaga.
  await m.execute(seller.id, key(), { type: 'market_cancel', listingId: newer });
  await m.execute(seller.id, key(), { type: 'market_list', item: 'corn', quantity: 1, unitPrice: 2 });
  assert.equal(await activeMarketReserved(db, farm), MARKET_RULES.maxActiveListings);
  await reconciles(farm, 'banca cheia');
});
