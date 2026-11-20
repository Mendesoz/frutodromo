import { loadEnvFile } from 'node:process';
import { database, migrate } from './db.js';
import { buildApp } from './app.js';
try { loadEnvFile('.env'); } catch (error: any) { if (error.code !== 'ENOENT') throw error; }
const production = process.env.NODE_ENV === 'production';
if (production && !process.env.DATABASE_URL) throw new Error('Producao exige PostgreSQL via DATABASE_URL. PGlite e apenas desenvolvimento.');
if (production && !process.env.PUBLIC_ORIGIN) throw new Error('Producao exige PUBLIC_ORIGIN explicita.');
const db = await database(process.env.DATABASE_URL, process.env.PGLITE_DATA_DIR);
await migrate(db);
const port = Number(process.env.PORT ?? 8860);
const app = await buildApp(db, { production, origin: process.env.PUBLIC_ORIGIN ?? `http://127.0.0.1:${port}`, logger: true });
app.addHook('onClose', () => db.close());
for (const signal of ['SIGINT', 'SIGTERM'] as const) process.once(signal, () => { void app.close(); });
await app.listen({ host: process.env.HOST ?? '127.0.0.1', port });
