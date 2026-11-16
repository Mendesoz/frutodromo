// Geometria do mapa persistente da fazenda online.
//
// O servidor so conhece tiles. O cliente desenha o tile em 24 px nativos com zoom
// inteiro; nada aqui depende de pixels, camera ou arte.
//
// Este modulo nao importa game.ts de proposito: a validacao devolve um codigo de
// erro e quem chama decide o status HTTP. Assim nao existe ciclo de import.

export const PARCEL_SIZE = 12;
export const PARCEL_MIN = -2;
export const PARCEL_MAX = 2;
// Terrenos -2..2 cobrem tiles -24..35 (inclusive nas duas pontas).
export const WORLD_TILE_MIN = PARCEL_MIN * PARCEL_SIZE;
export const WORLD_TILE_MAX = (PARCEL_MAX + 1) * PARCEL_SIZE - 1;

export const FOOTPRINTS = {
  plot: { w: 2, h: 2 },
  feed_mill: { w: 3, h: 3 },
  coop: { w: 3, h: 3 }
} as const;

export type BuildingKind = keyof typeof FOOTPRINTS;
export type Rect = { x: number; y: number; w: number; h: number };
export type Parcel = { x: number; y: number };

// Decoracao fixa do terreno inicial (0,0): ocupa tiles e bloqueia movimento,
// mas nao e producao nova nem concede capacidade. Coordenadas absolutas de tile.
export const OBSTACLES: readonly (Rect & { kind: string })[] = [
  { kind: 'house', x: 1, y: 6, w: 2, h: 3 },
  { kind: 'stand', x: 9, y: 7, w: 2, h: 3 }
];

// Os 22 personagens originais; 0 e o robo Unidade K7. Nenhum sprite vive no servidor.
export const HERO_MIN = 0;
export const HERO_MAX = 21;

export type PlacementError = 'INVALID_BUILDING' | 'INVALID_POSITION' | 'MOVE_OUTSIDE_LAND' | 'MOVE_OVERLAP';

export function isBuildingKind(kind: unknown): kind is BuildingKind {
  return typeof kind === 'string' && Object.prototype.hasOwnProperty.call(FOOTPRINTS, kind);
}
export function footprintOf(kind: BuildingKind) { return FOOTPRINTS[kind]; }
export function rectOf(kind: BuildingKind, x: number, y: number): Rect {
  const { w, h } = FOOTPRINTS[kind];
  return { x, y, w, h };
}
// Retangulos meia-abertos: [x, x+w) por [y, y+h). Encostar nao e sobrepor.
export function rectsOverlap(a: Rect, b: Rect) {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}
// Todos os terrenos tocados pelo retangulo, inclusive em coordenada negativa.
export function parcelsCovered(rect: Rect): Parcel[] {
  const parcels: Parcel[] = [];
  const lastX = Math.floor((rect.x + rect.w - 1) / PARCEL_SIZE);
  const lastY = Math.floor((rect.y + rect.h - 1) / PARCEL_SIZE);
  for (let y = Math.floor(rect.y / PARCEL_SIZE); y <= lastY; y++)
    for (let x = Math.floor(rect.x / PARCEL_SIZE); x <= lastX; x++) parcels.push({ x, y });
  return parcels;
}
// Posicao inicial de cada predio no terreno (0,0). Precisa casar com o
// preenchimento da migracao 003 para fazendas antigas e novas ficarem iguais.
export function defaultPosition(kind: BuildingKind, slot: number): Parcel {
  if (kind === 'feed_mill' && slot === 0) return { x: 1, y: 1 };
  if (kind === 'coop' && slot === 0) return { x: 7, y: 1 };
  if (kind === 'plot' && slot === 0) return { x: 3, y: 7 };
  if (kind === 'plot' && slot === 1) return { x: 6, y: 7 };
  // Faixa y=4..6 esta livre de casa, banca e predios iniciais. Combinacao que o
  // cadastro atual nunca cria; com slot >= 3 o jogador pode precisar mover.
  return { x: 3 + (slot % 3) * 3, y: 4 };
}
// Devolve null quando a posicao e valida, ou o codigo do primeiro problema.
export function validatePlacement(options: {
  kind: unknown;
  x: number;
  y: number;
  land: readonly Parcel[];
  occupied: readonly Rect[];
}): PlacementError | null {
  if (!isBuildingKind(options.kind)) return 'INVALID_BUILDING';
  if (!Number.isInteger(options.x) || !Number.isInteger(options.y)) return 'INVALID_POSITION';
  const rect = rectOf(options.kind, options.x, options.y);
  if (rect.x < WORLD_TILE_MIN || rect.y < WORLD_TILE_MIN ||
      rect.x + rect.w - 1 > WORLD_TILE_MAX || rect.y + rect.h - 1 > WORLD_TILE_MAX) return 'INVALID_POSITION';
  const owned = new Set(options.land.map(parcel => parcel.x + ':' + parcel.y));
  if (!parcelsCovered(rect).every(parcel => owned.has(parcel.x + ':' + parcel.y))) return 'MOVE_OUTSIDE_LAND';
  for (const other of [...options.occupied, ...OBSTACLES]) if (rectsOverlap(rect, other)) return 'MOVE_OVERLAP';
  return null;
}
// Parte fixa do snapshot: o cliente precisa das medidas e dos bloqueios decorativos.
export function layoutInfo() {
  return { parcelSize: PARCEL_SIZE, footprints: FOOTPRINTS, obstacles: OBSTACLES };
}
