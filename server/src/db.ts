import { PGlite } from '@electric-sql/pglite';
import pg from 'pg';
import { readFile, readdir, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface Queryable {
  query(sql: string, params?: any[]): Promise<{ rows: any[]; rowCount?: number | null }>;
}
export interface Database extends Queryable {
  kind: 'postgres' | 'pglite';
  transaction<T>(fn: (tx: Queryable) => Promise<T>): Promise<T>;
  close(): Promise<void>;
}
export async function database(url?: string, path = fileURLToPath(new URL('../.data/postgres', import.meta.url))): Promise<Database> {
  if (url) {
    const pool = new pg.Pool({ connectionString: url, max: 10 });
    return {
      kind: 'postgres', query: (s, p) => pool.query(s, p),
      async transaction(fn) {
        const client = await pool.connect();
        let broken: Error | undefined;
        try {
          await client.query('BEGIN');
          const result = await fn(client);
          await client.query('COMMIT');
          return result;
        } catch (error) {
          try { await client.query('ROLLBACK'); } catch (rollbackError) { broken = rollbackError as Error; }
          throw error;
        } finally { client.release(broken); }
      },
      close: () => pool.end()
    };
  }
  if (path !== 'memory://') await mkdir(resolve(path), { recursive: true });
  const embedded = new PGlite(path);
  await embedded.waitReady;
  return {
    kind: 'pglite', query: (s, p) => embedded.query(s, p),
    transaction: fn => embedded.transaction(tx => fn(tx)),
    close: () => embedded.close()
  };
}
export async function migrate(db: Database) {
  const folder = new URL('../migrations/', import.meta.url);
  // build/ e src/ ficam um nivel abaixo de server/.
  for (const file of (await readdir(folder)).filter(f => f.endsWith('.sql')).sort()) {
    await db.transaction(async tx => {
      if (db.kind === 'postgres') await tx.query('SELECT pg_advisory_xact_lock(76243101)');
      await tx.query('CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())');
      if ((await tx.query('SELECT name FROM schema_migrations WHERE name=$1', [file])).rows.length) return;
      const sql = await readFile(new URL(file, folder), 'utf8');
      // Migração inicial só contém DDL simples, sem funções ou strings com ponto e vírgula.
      for (const statement of sql.split(';').map(s => s.trim()).filter(Boolean)) await tx.query(statement);
      await tx.query('INSERT INTO schema_migrations(name) VALUES($1)', [file]);
    });
  }
}
