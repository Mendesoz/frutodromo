import { test } from 'node:test';
import assert from 'node:assert/strict';
// Modulo do cliente, em JS puro: roda no navegador e aqui sem DOM, rede ou banco.
import { Walker, DEFAULT_SPAWN, SPEED_TILES_PER_SECOND, FOOT_RADIUS_TILES, MAX_STEP_SECONDS } from '../web/locomotion.js';

const R = FOOT_RADIUS_TILES, SPEED = SPEED_TILES_PER_SECOND;
const STEP = SPEED * MAX_STEP_SECONDS;            // 0,27 tile: deslocamento maximo de um quadro
const DIAGONAL = STEP / Math.SQRT2;               // por eixo na diagonal

// Cenario inicial real da API: terreno (0,0), casa, banca, moinho, galinheiro e
// dois canteiros. Mesmas medidas de src/layout.ts.
const base = (over: Record<string, unknown> = {}): any => ({
  farm: { id: 'fazenda-1', name: 'Fazenda', capacity: 200, hero: 0 },
  land: [{ x: 0, y: 0 }],
  parcelSize: 12,
  footprints: { plot: { w: 2, h: 2 }, feed_mill: { w: 3, h: 3 }, coop: { w: 3, h: 3 } },
  obstacles: [{ kind: 'house', x: 1, y: 6, w: 2, h: 3 }, { kind: 'stand', x: 9, y: 7, w: 2, h: 3 }],
  buildings: [
    { id: 'b1', kind: 'feed_mill', slot: 0, tile_x: 1, tile_y: 1 },
    { id: 'b2', kind: 'coop', slot: 0, tile_x: 7, tile_y: 1 },
    { id: 'b3', kind: 'plot', slot: 0, tile_x: 3, tile_y: 7 },
    { id: 'b4', kind: 'plot', slot: 1, tile_x: 6, tile_y: 7 }
  ],
  ...over
});
const plot = (id: string, x: number, y: number) => ({ id, kind: 'plot', slot: 9, tile_x: x, tile_y: y });

// Geometria escrita de novo aqui de proposito: o teste nao usa as contas do modulo.
const rects = (world: any) => [
  ...world.obstacles.map((o: any) => ({ x: o.x, y: o.y, w: o.w, h: o.h })),
  ...world.buildings.map((b: any) => ({ x: b.tile_x, y: b.tile_y, ...world.footprints[b.kind] }))
];
const standable = (world: any, x: number, y: number) => {
  const minX = x - R, maxX = x + R, minY = y - R, maxY = y + R, size = world.parcelSize;
  const owned = new Set(world.land.map((p: any) => p.x + ':' + p.y));
  for (const [cx, cy] of [[minX, minY], [maxX - 1e-9, minY], [minX, maxY - 1e-9], [maxX - 1e-9, maxY - 1e-9]])
    if (!owned.has(Math.floor(cx / size) + ':' + Math.floor(cy / size))) return false;
  for (const b of rects(world)) if (minX < b.x + b.w && b.x < maxX && minY < b.y + b.h && b.y < maxY) return false;
  return true;
};
// Caminha `seconds` em quadros de `step`, conferindo cada quadro contra a geometria.
const walk = (walker: any, ix: number, iy: number, seconds: number, world: any = null, step = 0.05) => {
  let state = walker.state();
  for (let left = seconds; left > 1e-12; left -= step) {
    state = walker.move(ix, iy, Math.min(step, left));
    if (world) assert.ok(standable(world, state.x, state.y), `pisou em area bloqueada: ${state.x}, ${state.y}`);
  }
  return state;
};
const near = (value: number, target: number, tolerance = 1e-9) =>
  assert.ok(Math.abs(value - target) <= tolerance, `${value} longe de ${target} (tolerancia ${tolerance})`);
// Encostado na parede: nunca dentro dela e sem vao perceptivel (menos de 0,001 tile).
const wall = (value: number, target: number) => near(value, target, 1e-3);
const ready = (world: any = base()) => { const walker = new Walker(); walker.setWorld(world); return walker; };

test('nasce no ponto padrao olhando para baixo e ninguem move a posicao por fora', () => {
  const walker = new Walker();
  assert.deepEqual(walker.position, { x: 5.6, y: 6.3 });
  assert.deepEqual(walker.position, { ...DEFAULT_SPAWN });
  assert.equal(walker.facing, 'down');
  assert.equal(walker.moving, false);
  const leaked = walker.position;
  leaked.x = 99; leaked.y = -99;
  assert.deepEqual(walker.position, { x: 5.6, y: 6.3 });
  const world = base();
  assert.ok(standable(world, 5.6, 6.3), 'o ponto padrao do cenario inicial precisa estar livre');
  const state = walker.setWorld(world);
  assert.deepEqual(state, { x: 5.6, y: 6.3, facing: 'down', moving: false });
  assert.deepEqual(Object.keys(state).sort(), ['facing', 'moving', 'x', 'y']);
  state.x = 42; state.moving = true;
  assert.deepEqual(walker.position, { x: 5.6, y: 6.3 });
  assert.equal(walker.moving, false);
});

test('velocidade vale 2,7 tiles por segundo no eixo e na diagonal', () => {
  const cardinal = ready();
  for (let i = 0; i < 10; i++) cardinal.move(1, 0, 0.1);           // 1 segundo em 10 quadros
  near(cardinal.position.x, 5.6 + SPEED);
  assert.equal(cardinal.position.y, 6.3);
  assert.equal(cardinal.moving, true);

  const diagonal = ready();
  let state: any;
  for (let i = 0; i < 10; i++) state = diagonal.move(1, -1, 0.1);  // cima e direita, area livre
  const dx = state.x - 5.6, dy = state.y - 6.3;
  near(Math.hypot(dx, dy), SPEED);                                 // diagonal nao e mais rapida
  near(dx, SPEED / Math.SQRT2);
  near(dy, -SPEED / Math.SQRT2);
  assert.ok(standable(base(), state.x, state.y));

  // Intensidade menor que 1 (analogico) anda proporcionalmente, sem normalizar para cima.
  const soft = ready();
  near(soft.move(0.5, 0, 0.1).x, 5.6 + STEP / 2);
});

test('dt tem teto de 0,1 s e entrada invalida nao move nem quebra', () => {
  const walker = ready();
  near(walker.move(0, -1, 10).y, 6.3 - STEP);                      // aba em segundo plano nao teleporta
  near(walker.move(0, -1, 0.1).y, 6.3 - STEP * 2);
  const parked = walker.position;
  walker.move(0, -1, 0.001);                                       // fixa facing 'up' antes dos invalidos
  const before = walker.position;
  assert.notDeepEqual(before, parked);
  for (const [ix, iy, dt] of [[NaN, 0, 0.1], [0, NaN, 0.1], [Infinity, 0, 0.1], [0, -Infinity, 0.1],
    [0, -1, NaN], [0, -1, Infinity], [0, -1, 0], [0, -1, -5], ['1' as any, 0, 0.1], [0, 1, '0.1' as any]]) {
    const state = walker.move(ix as number, iy as number, dt as number);
    assert.deepEqual(walker.position, before, `entrada ${ix}, ${iy}, ${dt} nao pode mover`);
    assert.equal(state.moving, false);
    assert.equal(state.facing, 'up');
    assert.deepEqual(Object.keys(state).sort(), ['facing', 'moving', 'x', 'y']);
  }
  // Entrada neutra: para no lugar e guarda a ultima direcao.
  const idle = walker.move(0, 0, 0.1);
  assert.deepEqual(walker.position, before);
  assert.equal(idle.moving, false);
  assert.equal(idle.facing, 'up');
});

test('facing segue a direcao pressionada e a diagonal vira lado', () => {
  const walker = ready();
  assert.equal(walker.move(0, 1, 0.001).facing, 'down');
  assert.equal(walker.move(0, -1, 0.001).facing, 'up');
  assert.equal(walker.move(-1, 0, 0.001).facing, 'left');
  assert.equal(walker.move(1, 0, 0.001).facing, 'right');
  assert.equal(walker.move(1, 1, 0.001).facing, 'right');
  assert.equal(walker.move(-1, -1, 0.001).facing, 'left');
  assert.equal(walker.move(0.2, 1, 0.001).facing, 'down');
  assert.equal(walker.move(-1, 0.2, 0.001).facing, 'left');
});

test('a volta no limite externo para na borda do terreno comprado', () => {
  const world = base();
  const walker = ready(world);
  let state = walk(walker, 0, -1, 10, world);                      // corredor livre entre moinho e galinheiro
  wall(state.y, R);
  assert.equal(state.x, 5.6);
  assert.equal(state.moving, false, 'encostado na borda o avatar fica parado');
  state = walk(walker, -1, 0, 10, world);
  wall(state.x, R);
  state = walk(walker, 0, 1, 10, world);
  wall(state.y, 12 - R);
  state = walk(walker, 1, 0, 10, world);
  wall(state.x, 12 - R);
  state = walk(walker, 0, -1, 10, world);
  wall(state.y, R);
  assert.ok(standable(world, state.x, state.y));
});

test('atravessa para a parcela comprada e para na divisa da terra nao comprada', () => {
  const closed = base();
  const east = base({ land: [{ x: 0, y: 0 }, { x: 1, y: 0 }] });
  const south = base({ land: [{ x: 0, y: 0 }, { x: 0, y: 1 }] });

  wall(walk(ready(closed), 1, 0, 10, closed).x, 12 - R);           // parcela (1,0) nao comprada
  near(walk(ready(east), 1, 0, 4, east).x, 5.6 + SPEED * 4);       // mesma caminhada cruza a divisa
  wall(walk(ready(closed), 0, 1, 10, closed).y, 12 - R);           // corredor entre os canteiros
  near(walk(ready(south), 0, 1, 4, south).y, 6.3 + SPEED * 4);

  // Comprar o vizinho de lado nao abre o de baixo.
  const corner = walk(ready(east), 1, 1, 10, east);
  assert.ok(corner.x > 12, 'devia ter cruzado para a parcela comprada');
  wall(corner.y, 12 - R);
});

test('colide com predio e enfeite, desliza na parede e nao atravessa com dt alto', () => {
  const world = base();
  const walker = ready(world);
  let state = walk(walker, -1, 0, 10, world);                      // casa ocupa x 1..2 na altura dos pes
  wall(state.x, 3 + R);
  assert.equal(state.y, 6.3);
  assert.equal(state.moving, false);
  assert.equal(state.facing, 'left');

  // Encostado na casa, a diagonal continua andando no eixo livre (deslizamento).
  const slid = walker.move(-1, -1, 0.1);
  wall(slid.x, 3 + R);
  near(slid.y, 6.3 - DIAGONAL);
  assert.equal(slid.moving, true);
  // Passando da casa o eixo x destrava sozinho, sem o jogador soltar a tecla.
  state = walk(walker, -1, -1, 10, world);
  wall(state.x, R);
  wall(state.y, R);

  // Quadro gigante (aba voltando do segundo plano) nao atravessa parede nenhuma.
  const jumper = ready(world);
  for (let i = 0; i < 40; i++) {
    const far = jumper.move(-1, 0, 100);
    assert.ok(standable(world, far.x, far.y), `atravessou com dt alto: ${far.x}, ${far.y}`);
  }
  wall(jumper.position.x, 3 + R);

  // A banca (obstaculo decorativo) tambem barra: descendo pela direita o avatar
  // encosta no topo dela, em y 7, e nao entra no tile ocupado.
  const south = ready(world);
  walk(south, 1, 0, 1.2, world);
  const stopped = walk(south, 0, 1, 10, world);
  wall(stopped.y, 7 - R);
  assert.ok(standable(world, stopped.x, stopped.y));
});

test('predio novo embaixo dos pes reloca para a celula livre mais proxima e o poll nao teleporta', () => {
  const world = base();
  const walker = ready(world);
  walk(walker, 1, 0, 0.5, world);
  const parked = walker.position;
  near(parked.x, 5.6 + SPEED * 0.5);

  // Poll periodico com snapshot novo, mesma fazenda: posicao valida fica intacta
  // e a caminhada em andamento continua (o poll nao e um quadro do jogo).
  for (let i = 0; i < 3; i++) {
    const state = walker.setWorld(base());
    assert.deepEqual(walker.position, parked, 'poll nao pode teleportar quem esta em lugar valido');
    assert.deepEqual(state, { ...parked, facing: 'right', moving: true });
  }

  // Canteiro novo (construido ou movido pelo jogador) cai em cima do avatar.
  const invaded = base({ buildings: [...base().buildings, plot('b5', 6, 6)] });
  const moved = walker.setWorld(invaded);
  assert.deepEqual(walker.position, { x: 6.5, y: 5.5 });           // centro livre mais proximo
  assert.equal(moved.moving, false);
  assert.ok(standable(invaded, moved.x, moved.y));
  // Agora a posicao e valida de novo: o proximo poll nao mexe mais.
  walker.setWorld(base({ buildings: [...base().buildings, plot('b5', 6, 6)] }));
  assert.deepEqual(walker.position, { x: 6.5, y: 5.5 });
});

test('spawn alternativo e deterministico quando o ponto padrao esta ocupado', () => {
  const blockedSpawn = base({ buildings: [...base().buildings, plot('b5', 5, 6)] });
  assert.equal(standable(blockedSpawn, 5.6, 6.3), false);
  const first = ready(blockedSpawn), second = ready(blockedSpawn);
  assert.deepEqual(first.position, { x: 5.5, y: 5.5 });
  assert.deepEqual(first.position, second.position);
  assert.ok(standable(blockedSpawn, first.position.x, first.position.y));

  // Terreno inteiro bloqueado: mantem a posicao, fica parado e nao lanca.
  const sealed = base({ buildings: [], obstacles: [{ kind: 'muro', x: 0, y: 0, w: 12, h: 12 }] });
  const stuck = ready(sealed);
  assert.deepEqual(stuck.position, { x: 5.6, y: 6.3 });
  assert.equal(stuck.blocked, true);
  const state = walk(stuck, 1, 1, 1);
  assert.deepEqual(stuck.position, { x: 5.6, y: 6.3 });
  assert.equal(state.moving, false);
});

test('trocar de fazenda e reset voltam ao ponto padrao', () => {
  const world = base();
  const walker = ready(world);
  walk(walker, 0, -1, 1, world);
  assert.notDeepEqual(walker.position, { x: 5.6, y: 6.3 });

  const other = base({ farm: { id: 'fazenda-2', name: 'Outra', capacity: 200, hero: 3 } });
  assert.deepEqual(walker.setWorld(other), { x: 5.6, y: 6.3, facing: 'down', moving: false });

  walk(walker, 1, 0, 1, other);
  assert.deepEqual(walker.setWorld(other, true), { x: 5.6, y: 6.3, facing: 'down', moving: false });

  // Voltar para a fazenda anterior tambem recomeca no ponto padrao.
  walk(walker, 1, 0, 1, other);
  assert.deepEqual(walker.setWorld(world), { x: 5.6, y: 6.3, facing: 'down', moving: false });
});

test('snapshot ruim mantem o mundo anterior e o avatar nao anda sem mundo', () => {
  const semMundo = new Walker();
  assert.deepEqual(semMundo.setWorld(null), { x: 5.6, y: 6.3, facing: 'down', moving: false });
  assert.equal(semMundo.move(1, 0, 0.1).moving, false);
  assert.deepEqual(semMundo.position, { x: 5.6, y: 6.3 });

  const world = base();
  const walker = ready(world);
  walk(walker, 1, 0, 0.5, world);
  const parked = walker.position;
  for (const ruim of [null, undefined, 42, 'snapshot', {}, { land: 'nao e lista' }, { land: [{ x: 0.5, y: null }, null] }]) {
    walker.setWorld(ruim as any);
    assert.deepEqual(walker.position, parked, `snapshot ${JSON.stringify(ruim)} nao pode mexer no avatar`);
  }
  assert.equal(walk(walker, 1, 0, 0.2, world).moving, true, 'o mundo anterior continua valendo');

  // Mexer no objeto do snapshot depois do setWorld nao muda a colisao (copia propria).
  const mutante = base();
  const copiador = ready(mutante);
  mutante.obstacles.push({ kind: 'muro', x: 0, y: 0, w: 12, h: 12 });
  mutante.land.length = 0;
  assert.equal(copiador.move(0, -1, 0.1).moving, true);
  near(copiador.position.y, 6.3 - STEP);
});
