import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import rateLimit from '@fastify/rate-limit';
import type { Database } from './db.js';
import { auth } from './auth.js';
import { registerClient } from './client.js';
import { game, GameError, type Command } from './game.js';
import { HERO_MAX, HERO_MIN, WORLD_TILE_MAX, WORLD_TILE_MIN } from './layout.js';

const text = (minLength: number, maxLength: number) => ({ type: 'string', minLength, maxLength });
const credentials = {
  username: { type: 'string', pattern: '^[a-z0-9_]{3,24}$' }, password: text(10, 128)
};
const object = (properties: Record<string, unknown>) => ({ type: 'object', additionalProperties: false, properties, required: Object.keys(properties) });
const commandSchema = { oneOf: [
  object({ type: { const: 'queue' }, buildingId: { type: 'string', format: 'uuid' }, recipe: { enum: ['corn', 'feed', 'egg'] } }),
  object({ type: { const: 'deliver' } }),
  object({ type: { const: 'recover_seed' } }),
  object({ type: { const: 'buy_seed' } }),
  object({ type: { const: 'expand' }, x: { type: 'integer', minimum: -2, maximum: 2 }, y: { type: 'integer', minimum: -2, maximum: 2 } }),
  object({ type: { const: 'move' }, buildingId: { type: 'string', format: 'uuid' },
    x: { type: 'integer', minimum: WORLD_TILE_MIN, maximum: WORLD_TILE_MAX }, y: { type: 'integer', minimum: WORLD_TILE_MIN, maximum: WORLD_TILE_MAX } }),
  object({ type: { const: 'customize' }, hero: { type: 'integer', minimum: HERO_MIN, maximum: HERO_MAX } })
] };

export async function buildApp(db: Database, options: { origin?: string; production?: boolean; clock?: () => Date; logger?: boolean } = {}) {
  const origin = options.origin ?? 'http://127.0.0.1:8860';
  if (new URL(origin).origin !== origin) throw new Error('PUBLIC_ORIGIN deve conter somente a origem, sem caminho.');
  if (options.production && !origin.startsWith('https://')) throw new Error('Producao exige HTTPS.');
  const app = Fastify({ logger: options.logger ?? false, bodyLimit: 4096, ajv: { customOptions: { removeAdditional: false, coerceTypes: false } } });
  await app.register(cookie);
  await app.register(rateLimit, { max: 120, timeWindow: '1 minute' });
  const accounts = auth(db, options.clock);
  const farms = game(db, options.clock);
  const cookieOptions = { httpOnly: true, sameSite: 'lax' as const, secure: options.production ?? false, path: '/', maxAge: 7 * 86400 };
  app.addHook('onRequest', async (req, reply) => {
    reply.header('Cache-Control', 'no-store').header('X-Content-Type-Options', 'nosniff');
    if (req.url.startsWith('/api/') && req.headers['sec-fetch-site'] === 'cross-site') throw new GameError(403, 'ORIGIN_REJECTED');
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      if (req.headers.origin !== origin || req.headers['sec-fetch-site'] === 'cross-site') throw new GameError(403, 'ORIGIN_REJECTED');
      if (req.headers['content-type']?.split(';')[0].trim() !== 'application/json') throw new GameError(415, 'JSON_REQUIRED');
    }
  });
  app.setErrorHandler((error: any, _req, reply) => {
    if (error instanceof GameError) return reply.code(error.status).send({ error: error.code });
    if (error.validation) return reply.code(400).send({ error: 'INVALID_REQUEST' });
    if (error.statusCode && error.statusCode < 500) return reply.code(error.statusCode).send({ error: error.statusCode === 429 ? 'RATE_LIMITED' : 'INVALID_REQUEST' });
    app.log.error(error);
    return reply.code(500).send({ error: 'INTERNAL_ERROR' });
  });
  app.get('/health', async () => { await db.query('SELECT 1'); return { ok: true, database: db.kind, version: '0.1.0' }; });
  app.get('/api/auth/status', async req => {
    try { await accounts.player(req.cookies.brotalume_session); return { authenticated: true }; }
    catch (error) { if (error instanceof GameError && error.code === 'AUTH_REQUIRED') return { authenticated: false }; throw error; }
  });
  app.post<{ Body: { username: string; password: string; farmName: string } }>('/api/auth/register', {
    schema: { body: object({ ...credentials, farmName: { ...text(1, 40), pattern: '\\S' } }) },
    config: { rateLimit: { max: 5, timeWindow: '1 minute' } }
  }, async (req, reply) => {
    const user = await accounts.register(req.body.username, req.body.password, req.body.farmName.trim());
    reply.setCookie('brotalume_session', user.token, cookieOptions);
    return reply.code(201).send({ playerId: user.id });
  });
  app.post<{ Body: { username: string; password: string } }>('/api/auth/login', {
    schema: { body: object(credentials) }, config: { rateLimit: { max: 10, timeWindow: '1 minute' } }
  }, async (req, reply) => {
    const user = await accounts.login(req.body.username, req.body.password);
    reply.setCookie('brotalume_session', user.token, cookieOptions);
    return { playerId: user.id };
  });
  app.post('/api/auth/logout', { schema: { body: object({}) } }, async (req, reply) => {
    await accounts.logout(req.cookies.brotalume_session);
    reply.clearCookie('brotalume_session', cookieOptions);
    return { ok: true };
  });
  app.get('/api/farm', async req => farms.snapshot(await accounts.player(req.cookies.brotalume_session)));
  app.post<{ Body: Command }>('/api/commands', {
    schema: { body: commandSchema, headers: { type: 'object', required: ['idempotency-key'], properties: { 'idempotency-key': { type: 'string', pattern: '^[a-zA-Z0-9_-]{8,100}$' }, 'x-farm-id': { type: 'string', format: 'uuid' } } } }
  }, async req => farms.execute(await accounts.player(req.cookies.brotalume_session), String(req.headers['idempotency-key']), req.body,
    req.headers['x-farm-id'] ? String(req.headers['x-farm-id']) : undefined));
  // Cliente estatico do piloto (Codex). Registrado depois da API, sem mudar
  // os cabecalhos nem as regras de origem definidas acima.
  await registerClient(app);
  return app;
}
