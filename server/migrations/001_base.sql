CREATE TABLE players (
  id uuid PRIMARY KEY,
  username text NOT NULL UNIQUE CHECK (username ~ '^[a-z0-9_]{3,24}$'),
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE sessions (
  token_hash text PRIMARY KEY,
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL
);
CREATE INDEX sessions_player_idx ON sessions(player_id);
CREATE TABLE farms (
  id uuid PRIMARY KEY,
  player_id uuid NOT NULL UNIQUE REFERENCES players(id),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 40),
  capacity integer NOT NULL DEFAULT 200 CHECK (capacity BETWEEN 10 AND 100000),
  seed_recovered_at timestamptz,
  last_processed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE wallets (
  farm_id uuid PRIMARY KEY REFERENCES farms(id),
  coins integer NOT NULL CHECK (coins BETWEEN 0 AND 2000000000)
);
CREATE TABLE inventory (
  farm_id uuid NOT NULL REFERENCES farms(id),
  item text NOT NULL CHECK (item IN ('corn','feed','egg')),
  quantity integer NOT NULL CHECK (quantity BETWEEN 0 AND 100000),
  PRIMARY KEY (farm_id,item)
);
CREATE TABLE land (
  farm_id uuid NOT NULL REFERENCES farms(id),
  x integer NOT NULL CHECK (x BETWEEN -2 AND 2),
  y integer NOT NULL CHECK (y BETWEEN -2 AND 2),
  PRIMARY KEY(farm_id,x,y)
);
CREATE TABLE buildings (
  id uuid PRIMARY KEY,
  farm_id uuid NOT NULL REFERENCES farms(id),
  kind text NOT NULL CHECK (kind IN ('plot','feed_mill','coop')),
  slot integer NOT NULL CHECK (slot BETWEEN 0 AND 99),
  queue_limit integer NOT NULL CHECK (queue_limit BETWEEN 1 AND 9),
  UNIQUE(farm_id,kind,slot)
);
CREATE INDEX buildings_farm_idx ON buildings(farm_id);
CREATE TABLE production_jobs (
  id uuid PRIMARY KEY,
  farm_id uuid NOT NULL REFERENCES farms(id),
  building_id uuid NOT NULL REFERENCES buildings(id),
  recipe text NOT NULL CHECK (recipe IN ('corn','feed','egg')),
  output_item text NOT NULL CHECK (output_item IN ('corn','feed','egg')),
  output_quantity integer NOT NULL CHECK (output_quantity BETWEEN 1 AND 100),
  started_at timestamptz NOT NULL,
  finishes_at timestamptz NOT NULL CHECK (finishes_at > started_at),
  claimed_at timestamptz
);
CREATE INDEX jobs_pending_idx ON production_jobs(farm_id,finishes_at) WHERE claimed_at IS NULL;
CREATE TABLE ledger (
  id uuid PRIMARY KEY,
  farm_id uuid NOT NULL REFERENCES farms(id),
  delta integer NOT NULL CHECK (delta <> 0),
  balance_after integer NOT NULL CHECK (balance_after >= 0),
  reason text NOT NULL,
  operation_key text NOT NULL,
  created_at timestamptz NOT NULL,
  UNIQUE(farm_id,operation_key)
);
CREATE TABLE operations (
  farm_id uuid NOT NULL REFERENCES farms(id),
  key text NOT NULL CHECK (char_length(key) BETWEEN 8 AND 100),
  request_hash text NOT NULL,
  result jsonb NOT NULL,
  created_at timestamptz NOT NULL,
  PRIMARY KEY (farm_id,key)
);
CREATE TABLE inventory_events (
  id uuid PRIMARY KEY,
  farm_id uuid NOT NULL REFERENCES farms(id),
  item text NOT NULL CHECK (item IN ('corn','feed','egg')),
  delta integer NOT NULL CHECK (delta <> 0),
  reason text NOT NULL,
  operation_key text NOT NULL,
  created_at timestamptz NOT NULL,
  UNIQUE(farm_id,operation_key,item)
);
