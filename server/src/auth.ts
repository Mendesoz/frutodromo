import { scrypt as scryptCallback, randomBytes, randomUUID, createHash, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import type { Database, Queryable } from './db.js';
import { GameError, seedFarm } from './game.js';
const scrypt = promisify(scryptCallback);
const digest = (token: string) => createHash('sha256').update(token).digest('hex');
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const key = await scrypt(password, salt, 64) as Buffer;
  return `${salt}:${key.toString('hex')}`;
}
async function matchPassword(password: string, stored: string) {
  const [salt, hex] = stored.split(':');
  const key = await scrypt(password, salt, 64) as Buffer;
  return timingSafeEqual(key, Buffer.from(hex, 'hex'));
}
async function newSession(tx: Queryable, id: string) {
  await tx.query('SELECT id FROM players WHERE id=$1 FOR UPDATE', [id]);
  await tx.query('DELETE FROM sessions WHERE expires_at <= now()');
  const token = randomBytes(32).toString('base64url');
  await tx.query("INSERT INTO sessions(token_hash,player_id,expires_at) VALUES($1,$2,now()+interval '7 days')", [digest(token), id]);
  await tx.query('DELETE FROM sessions WHERE player_id=$1 AND token_hash NOT IN (SELECT token_hash FROM sessions WHERE player_id=$1 ORDER BY expires_at DESC LIMIT 10)', [id]);
  return token;
}
export function auth(db: Database, clock?: () => Date) {
  return {
    async register(username: string, password: string, farmName: string) {
      const hash = await hashPassword(password);
      try {
        return await db.transaction(async tx => {
          const id = randomUUID();
          await tx.query('INSERT INTO players(id,username,password_hash) VALUES($1,$2,$3)', [id, username, hash]);
          const now = clock ? clock() : new Date((await tx.query('SELECT clock_timestamp() AS t')).rows[0].t);
          await seedFarm(tx, id, farmName, now);
          return { id, token: await newSession(tx, id) };
        });
      } catch (error: any) {
        if (error.code === '23505') throw new GameError(409, 'USERNAME_UNAVAILABLE');
        throw error;
      }
    },
    async login(username: string, password: string) {
      const player = (await db.query('SELECT id,password_hash FROM players WHERE username=$1', [username])).rows[0];
      // Mesmo trabalho criptografico para nomes inexistentes.
      const fallback = '00000000000000000000000000000000:' + '00'.repeat(64);
      const valid = await matchPassword(password, player?.password_hash ?? fallback);
      if (!player || !valid) throw new GameError(401, 'INVALID_CREDENTIALS');
      return { id: player.id, token: await db.transaction(tx => newSession(tx, player.id)) };
    },
    async player(token?: string) {
      if (!token || token.length > 100) throw new GameError(401, 'AUTH_REQUIRED');
      const session = (await db.query('SELECT player_id FROM sessions WHERE token_hash=$1 AND expires_at > now()', [digest(token)])).rows[0];
      if (!session) throw new GameError(401, 'AUTH_REQUIRED');
      return session.player_id as string;
    },
    async logout(token?: string) {
      if (token) await db.query('DELETE FROM sessions WHERE token_hash=$1', [digest(token)]);
    }
  };
}
