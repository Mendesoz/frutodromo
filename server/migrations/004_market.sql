-- Mercado piloto entre contas: o lote anunciado sai do inventario e fica em
-- custodia na propria linha ativa. Nada e apagado: cancelamento e venda apenas
-- mudam status e carimbam a data, preservando o historico de negociacoes.
-- DDL simples de proposito: o migrador divide o arquivo por ponto e virgula.
CREATE TABLE market_listings (
  id uuid PRIMARY KEY,
  seller_farm_id uuid NOT NULL REFERENCES farms(id),
  item text NOT NULL CHECK (item IN ('corn','feed','egg')),
  quantity integer NOT NULL CHECK (quantity BETWEEN 1 AND 100),
  unit_price integer NOT NULL CHECK (unit_price BETWEEN 1 AND 1000),
  status text NOT NULL CHECK (status IN ('active','sold','cancelled')),
  buyer_farm_id uuid REFERENCES farms(id),
  created_at timestamptz NOT NULL,
  sold_at timestamptz,
  cancelled_at timestamptz,
  CONSTRAINT market_listings_not_self CHECK (buyer_farm_id IS NULL OR buyer_farm_id <> seller_farm_id),
  CONSTRAINT market_listings_status_dates CHECK (
    (status = 'active' AND buyer_farm_id IS NULL AND sold_at IS NULL AND cancelled_at IS NULL)
    OR (status = 'sold' AND buyer_farm_id IS NOT NULL AND sold_at IS NOT NULL AND cancelled_at IS NULL)
    OR (status = 'cancelled' AND buyer_farm_id IS NULL AND sold_at IS NULL AND cancelled_at IS NOT NULL))
);
-- Vitrine: so anuncios ativos, do mais novo para o mais antigo.
CREATE INDEX market_listings_active_idx ON market_listings(created_at DESC, id) WHERE status = 'active';
-- Reserva de capacidade do vendedor e historico proprio.
CREATE INDEX market_listings_seller_idx ON market_listings(seller_farm_id, status, created_at DESC, id);
CREATE INDEX market_listings_buyer_idx ON market_listings(buyer_farm_id, created_at DESC, id) WHERE buyer_farm_id IS NOT NULL;
-- Uma venda por anuncio: listing_id e unico, entao o lote nunca e vendido duas vezes.
CREATE TABLE market_trades (
  id uuid PRIMARY KEY,
  listing_id uuid NOT NULL UNIQUE REFERENCES market_listings(id),
  buyer_farm_id uuid NOT NULL REFERENCES farms(id),
  seller_farm_id uuid NOT NULL REFERENCES farms(id),
  item text NOT NULL CHECK (item IN ('corn','feed','egg')),
  quantity integer NOT NULL CHECK (quantity BETWEEN 1 AND 100),
  unit_price integer NOT NULL CHECK (unit_price BETWEEN 1 AND 1000),
  total_price integer NOT NULL CHECK (total_price > 0),
  created_at timestamptz NOT NULL,
  CONSTRAINT market_trades_two_farms CHECK (buyer_farm_id <> seller_farm_id),
  CONSTRAINT market_trades_total CHECK (total_price = quantity * unit_price)
);
CREATE INDEX market_trades_buyer_idx ON market_trades(buyer_farm_id, created_at DESC, id);
CREATE INDEX market_trades_seller_idx ON market_trades(seller_farm_id, created_at DESC, id);
