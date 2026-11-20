import { randomUUID } from 'node:crypto';
import type { Database, Queryable } from './db.js';
import { GameError, fingerprint } from './domain.js';
import { add, consume, farmTime, money, occupancy, settle } from './economy.js';

export type MarketItem = 'corn' | 'feed' | 'egg';
export type MarketCommand =
  | { type: 'market_list'; item: MarketItem; quantity: number; unitPrice: number }
  | { type: 'market_buy'; listingId: string }
  | { type: 'market_cancel'; listingId: string };

// Numeros candidatos do piloto resetavel: limitam abuso e mantem o lote dentro de
// um inteiro pequeno. Nao sao equilibrio validado e devem ser revistos com dados.
export const MARKET_RULES = {
  maxQuantity: 100,
  maxActiveListings: 12,
  prices: {
    corn: { min: 1, max: 6 },
    feed: { min: 2, max: 18 },
    egg: { min: 3, max: 30 }
  }
} as const;

const ITEMS: readonly MarketItem[] = ['corn', 'feed', 'egg'];
const TYPES: readonly string[] = ['market_list', 'market_buy', 'market_cancel'];
// Mesma regra de chave de game.execute: o recibo vive na mesma tabela operations.
const KEY_PATTERN = /^[a-zA-Z0-9_-]{8,100}$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_LISTINGS = 60;
const MAX_MY_LISTINGS = 30;
const MAX_TRADES = 20;

export function isMarketCommand(command: { type: string }): command is MarketCommand {
  return TYPES.includes(command.type);
}

const listingColumns = `l.id, l.seller_farm_id, l.item, l.quantity, l.unit_price, l.status, l.created_at, f.name AS seller_name`;

function listingView(row: any, farmId: string) {
  return {
    id: row.id as string,
    sellerFarmId: row.seller_farm_id as string,
    sellerName: row.seller_name as string,
    item: row.item as MarketItem,
    quantity: row.quantity as number,
    unitPrice: row.unit_price as number,
    totalPrice: (row.quantity * row.unit_price) as number,
    status: row.status as 'active' | 'sold' | 'cancelled',
    createdAt: new Date(row.created_at).toISOString(),
    mine: row.seller_farm_id === farmId
  };
}

function tradeView(row: any, farmId: string) {
  const bought = row.buyer_farm_id === farmId;
  return {
    id: row.id as string,
    listingId: row.listing_id as string,
    buyerFarmId: row.buyer_farm_id as string,
    sellerFarmId: row.seller_farm_id as string,
    item: row.item as MarketItem,
    quantity: row.quantity as number,
    unitPrice: row.unit_price as number,
    totalPrice: row.total_price as number,
    createdAt: new Date(row.created_at).toISOString(),
    side: (bought ? 'buy' : 'sell') as 'buy' | 'sell',
    otherFarmName: (bought ? row.seller_name : row.buyer_name) as string
  };
}

function validate(command: MarketCommand) {
  if (command.type === 'market_list') {
    if (typeof command.item !== 'string' || !ITEMS.includes(command.item)) throw new GameError(400, 'INVALID_MARKET_ITEM');
    if (!Number.isInteger(command.quantity) || command.quantity < 1 || command.quantity > MARKET_RULES.maxQuantity)
      throw new GameError(400, 'INVALID_MARKET_QUANTITY');
    const price = MARKET_RULES.prices[command.item];
    if (!Number.isInteger(command.unitPrice) || command.unitPrice < price.min || command.unitPrice > price.max)
      throw new GameError(400, 'INVALID_MARKET_PRICE');
  } else if (command.type === 'market_buy' || command.type === 'market_cancel') {
    // Identificador malformado nunca chega ao banco como uuid invalido.
    if (typeof command.listingId !== 'string' || !UUID_PATTERN.test(command.listingId)) throw new GameError(404, 'LISTING_NOT_FOUND');
  } else throw new GameError(400, 'INVALID_COMMAND');
}

async function farmOf(tx: Queryable, playerId: string) {
  const row = (await tx.query('SELECT id FROM farms WHERE player_id=$1', [playerId])).rows[0];
  if (!row) throw new GameError(404, 'FARM_NOT_FOUND');
  return row.id as string;
}

// Recibo imutavel: uma vez gravado nunca muda, entao pode ser lido sem trava para
// responder repeticao antiga. A mesma leitura se repete sob trava antes de qualquer efeito.
async function replay(tx: Queryable, farmId: string, key: string, hash: string) {
  const previous = (await tx.query('SELECT request_hash,result FROM operations WHERE farm_id=$1 AND key=$2', [farmId, key])).rows[0];
  if (!previous) return undefined;
  if (previous.request_hash !== hash) throw new GameError(409, 'OPERATION_KEY_REUSED');
  return previous.result as Record<string, unknown>;
}

// Ordem global estavel por id: duas compras reciprocas (A compra de B e B compra de A)
// pedem as mesmas travas na mesma ordem e nao travam uma na outra. Uma consulta por
// fazenda, em sequencia, garante a ordem de aquisicao sem depender do plano do banco.
async function lockFarms(tx: Queryable, ids: string[]) {
  const farms = new Map<string, any>();
  for (const id of [...new Set(ids)].sort()) {
    const row = (await tx.query('SELECT * FROM farms WHERE id=$1 FOR UPDATE', [id])).rows[0];
    if (!row) throw new GameError(404, 'FARM_NOT_FOUND');
    farms.set(id, row);
  }
  return farms;
}

// Tempo e producao de cada fazenda travada antes de olhar capacidade ou saldo.
async function settleAll(tx: Queryable, farms: Map<string, any>, clock?: () => Date) {
  const times = new Map<string, Date>();
  for (const [id, farm] of farms) {
    const now = await farmTime(tx, farm, clock);
    await settle(tx, id, now);
    times.set(id, now);
  }
  return times;
}

export function market(db: Database, clock?: () => Date) {
  return {
    // Leitura publica da vitrine: read committed, sem trava, nao muda recurso nenhum.
    async snapshot(playerId: string) {
      return db.transaction(async tx => {
        const farmId = await farmOf(tx, playerId);
        const serverTime = clock ? clock() : new Date((await tx.query('SELECT clock_timestamp() AS t')).rows[0].t);
        const listings = (await tx.query(
          `SELECT ${listingColumns} FROM market_listings l JOIN farms f ON f.id=l.seller_farm_id
           WHERE l.status='active' ORDER BY l.created_at DESC, l.id LIMIT ${MAX_LISTINGS}`)).rows;
        // Ativos primeiro para que o proprio lote nunca suma atras de historico antigo.
        const mine = (await tx.query(
          `SELECT ${listingColumns} FROM market_listings l JOIN farms f ON f.id=l.seller_farm_id
           WHERE l.seller_farm_id=$1 ORDER BY (l.status='active') DESC, l.created_at DESC, l.id LIMIT ${MAX_MY_LISTINGS}`, [farmId])).rows;
        const trades = (await tx.query(
          `SELECT t.id, t.listing_id, t.buyer_farm_id, t.seller_farm_id, t.item, t.quantity, t.unit_price, t.total_price, t.created_at,
                  buyer.name AS buyer_name, seller.name AS seller_name
           FROM market_trades t JOIN farms buyer ON buyer.id=t.buyer_farm_id JOIN farms seller ON seller.id=t.seller_farm_id
           WHERE t.buyer_farm_id=$1 OR t.seller_farm_id=$1 ORDER BY t.created_at DESC, t.id LIMIT ${MAX_TRADES}`, [farmId])).rows;
        // So nome e identificador de fazenda saem daqui: nada de usuario, sessao ou saldo alheio.
        return {
          farmId, serverTime: serverTime.toISOString(), rules: MARKET_RULES,
          listings: listings.map(row => listingView(row, farmId)),
          myListings: mine.map(row => listingView(row, farmId)),
          trades: trades.map(row => tradeView(row, farmId))
        };
      });
    },

    async execute(playerId: string, key: string, command: MarketCommand, expectedFarmId?: string) {
      if (!KEY_PATTERN.test(key)) throw new GameError(400, 'INVALID_OPERATION_KEY');
      validate(command);
      return db.transaction(async tx => {
        // 1. Ator e anuncio sem trava. Do anuncio so usamos o que e imutavel
        // (dono, item, lote, preco); o estado vem da releitura travada la embaixo.
        const actorId = await farmOf(tx, playerId);
        if (expectedFarmId && expectedFarmId !== actorId) throw new GameError(409, 'FARM_CHANGED');
        const hash = fingerprint(command);
        const old = await replay(tx, actorId, key, hash);
        if (old) return old;
        const involved = [actorId];
        let listed: any;
        if (command.type !== 'market_list') {
          listed = (await tx.query('SELECT id,seller_farm_id,item,quantity,unit_price FROM market_listings WHERE id=$1', [command.listingId])).rows[0];
          if (!listed) throw new GameError(404, 'LISTING_NOT_FOUND');
          if (command.type === 'market_buy') {
            if (listed.seller_farm_id === actorId) throw new GameError(409, 'OWN_LISTING');
            involved.push(listed.seller_farm_id);
          } else if (listed.seller_farm_id !== actorId) throw new GameError(403, 'NOT_LISTING_OWNER');
        }

        // 2. Travar todas as fazendas envolvidas, em ordem de id, antes do anuncio.
        const farms = await lockFarms(tx, involved);
        const actor = farms.get(actorId);
        if (expectedFarmId && expectedFarmId !== actor.id) throw new GameError(409, 'FARM_CHANGED');
        const confirmed = await replay(tx, actorId, key, hash);
        if (confirmed) return confirmed;
        const times = await settleAll(tx, farms, clock);
        const at = (farmId: string) => times.get(farmId)!;
        const now = new Date(Math.max(...[...times.values()].map(time => time.getTime())));

        let detail: Record<string, unknown> = {};
        if (command.type === 'market_list') {
          const active = (await tx.query("SELECT count(*)::int AS n FROM market_listings WHERE seller_farm_id=$1 AND status='active'", [actorId])).rows[0].n;
          if (active >= MARKET_RULES.maxActiveListings) throw new GameError(409, 'TOO_MANY_LISTINGS');
          const id = randomUUID();
          // O lote sai do inventario e vira custodia da linha ativa: a ocupacao do
          // vendedor nao muda, entao anunciar nunca abre espaco para encher o armazem.
          await consume(tx, actorId, command.item, command.quantity, 'listing:' + id, at(actorId));
          await tx.query('INSERT INTO market_listings(id,seller_farm_id,item,quantity,unit_price,status,created_at) VALUES($1,$2,$3,$4,$5,$6,$7)',
            [id, actorId, command.item, command.quantity, command.unitPrice, 'active', now]);
          detail = { listingId: id, item: command.item, quantity: command.quantity, unitPrice: command.unitPrice, totalPrice: command.quantity * command.unitPrice };
        } else {
          // 3. So agora o anuncio e travado e relido: dono, lote e preco valem os do banco.
          const listing = (await tx.query('SELECT * FROM market_listings WHERE id=$1 FOR UPDATE', [listed.id])).rows[0];
          if (!listing) throw new GameError(404, 'LISTING_NOT_FOUND');
          if (command.type === 'market_cancel') {
            if (listing.seller_farm_id !== actorId) throw new GameError(403, 'NOT_LISTING_OWNER');
            if (listing.status !== 'active') throw new GameError(409, 'LISTING_UNAVAILABLE');
            const closed = await tx.query("UPDATE market_listings SET status='cancelled', cancelled_at=$2 WHERE id=$1 AND status='active' RETURNING id", [listing.id, now]);
            if (!closed.rows.length) throw new GameError(409, 'LISTING_UNAVAILABLE');
            // Devolve o lote inteiro na mesma transacao. Sem checar capacidade de proposito:
            // a reserva ja ocupava exatamente esse espaco, entao cancelar nunca fica preso.
            await add(tx, actorId, listing.item, listing.quantity, 'market_cancel', 'listing:' + listing.id + ':cancel', at(actorId));
            detail = { listingId: listing.id, item: listing.item, quantity: listing.quantity, returned: listing.quantity };
          } else {
            if (listing.seller_farm_id === actorId) throw new GameError(409, 'OWN_LISTING');
            if (listing.seller_farm_id !== listed.seller_farm_id) throw new GameError(409, 'LISTING_UNAVAILABLE');
            if (listing.status !== 'active') throw new GameError(409, 'LISTING_UNAVAILABLE');
            const seller = listing.seller_farm_id as string;
            // Preco e lote vem do anuncio no servidor: o cliente nao envia total nem hora.
            const total = listing.quantity * listing.unit_price;
            const used = await occupancy(tx, actorId);
            if (used.total + listing.quantity > actor.capacity) throw new GameError(409, 'STORAGE_FULL');
            const tradeId = randomUUID();
            const audit = 'trade:' + tradeId;
            await money(tx, actorId, -total, 'market_purchase', audit, at(actorId));
            await money(tx, seller, total, 'market_sale', audit, at(seller));
            // O vendedor ja entregou o lote na custodia: aqui so o comprador recebe.
            await add(tx, actorId, listing.item, listing.quantity, 'market_purchase', audit, at(actorId));
            const sold = await tx.query("UPDATE market_listings SET status='sold', buyer_farm_id=$2, sold_at=$3 WHERE id=$1 AND status='active' RETURNING id", [listing.id, actorId, now]);
            if (!sold.rows.length) throw new GameError(409, 'LISTING_UNAVAILABLE');
            await tx.query(`INSERT INTO market_trades(id,listing_id,buyer_farm_id,seller_farm_id,item,quantity,unit_price,total_price,created_at)
              VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
              [tradeId, listing.id, actorId, seller, listing.item, listing.quantity, listing.unit_price, total, now]);
            detail = { listingId: listing.id, tradeId, sellerFarmId: seller, item: listing.item, quantity: listing.quantity, unitPrice: listing.unit_price, totalPrice: total };
          }
        }
        const result = { key, type: command.type, ...detail };
        await tx.query('INSERT INTO operations(farm_id,key,request_hash,result,created_at) VALUES($1,$2,$3,$4,$5)', [actorId, key, hash, JSON.stringify(result), at(actorId)]);
        return result as Record<string, unknown>;
      });
    }
  };
}
