import type { FastifyInstance } from 'fastify';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

// Lista fechada: nunca servir pastas do servidor, banco ou caminhos fornecidos pelo visitante.
const assets: Record<string, { path: URL; type: string }> = {};
for (const [name, type] of [['index.html', 'text/html'], ['style.css', 'text/css'], ['app.js', 'text/javascript'], ['map.js', 'text/javascript']] as const)
  assets[name === 'index.html' ? '/play/' : '/play/' + name] = { path: new URL('../web/' + name, import.meta.url), type };
for (const file of ['reused-art.js', 'sprites.js']) assets['/art/' + file] = { path: new URL('../../prototipo-fazenda/' + file, import.meta.url), type: 'text/javascript' };
for (const weight of [400, 600, 700]) {
  const name = `pixelify-sans-latin-${weight}-normal.woff2`;
  assets['/art/fonts/' + name] = { path: new URL('../../prototipo-fazenda/fonts/' + name, import.meta.url), type: 'font/woff2' };
}
export async function registerClient(app: FastifyInstance) {
  app.get('/', (_req, reply) => reply.redirect('/play/'));
  app.get('/play', (_req, reply) => reply.redirect('/play/'));
  for (const [url, asset] of Object.entries(assets)) app.get(url, async (req, reply) => {
    const body = await readFile(asset.path);
    if (asset.type === 'text/html') reply.header('Referrer-Policy', 'no-referrer').header('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
    else {
      const etag = '"' + createHash('sha256').update(body).digest('hex') + '"';
      reply.header('Cache-Control', 'public, max-age=0, must-revalidate').header('ETag', etag);
      if (req.headers['if-none-match'] === etag) return reply.code(304).send();
    }
    return reply.type(asset.type + (asset.type.startsWith('text/') ? '; charset=utf-8' : '')).send(body);
  });
}
