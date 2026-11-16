// Locomocao local do avatar na fazenda (WASD).
//
// Modulo puro: sem DOM, sem rede, sem persistencia e sem credencial. O avatar e
// representacao local desta etapa; o servidor nao conhece a posicao e nenhuma
// chamada sai daqui por quadro. Quem le o teclado, desenha e move a camera fica
// fora: este arquivo so responde onde o personagem pode estar.
//
// Unidade: tile, igual ao snapshot da API (`land` em parcelas de `parcelSize`,
// `footprints[kind]` e `obstacles` em tiles). Nada de pixel, zoom ou sprite: a
// colisao usa somente o retangulo de chao do predio, nunca a altura do desenho.
// Retangulos meia-abertos [x, x+w), como em src/layout.ts: encostar nao e
// sobrepor. Eixo y cresce para baixo, como na tela.
//
// `position` e o ponto dos pes; o renderer ancora os pes do sprite nele.

export const SPEED_TILES_PER_SECOND = 2.7;   // velocidade de caminhada
export const FOOT_RADIUS_TILES = 0.22;       // meia-caixa dos pes (AABB conservadora)
export const MAX_STEP_SECONDS = 0.1;         // teto de dt: aba em segundo plano nao teleporta
export const MAX_SUBSTEP_TILES = 0.1;        // passo maximo por subpasso de colisao
export const DEFAULT_PARCEL_SIZE = 12;
export const DEFAULT_SPAWN = Object.freeze({ x: 5.6, y: 6.3 });

const REFINE_PASSES = 8;   // bisseccoes para encostar na parede sem deixar vao visivel
const EDGE = 1e-9;         // borda superior meia-aberta da caixa dos pes
const MIN_MOVE = 1e-6;     // deslocamento abaixo disto conta como parado
const TIE = 1e-12;         // empate de distancia na busca de celula livre

function finiteRect(x, y, w, h) {
  return Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0;
}
function own(object, key) {
  return object != null && typeof key === 'string' && Object.prototype.hasOwnProperty.call(object, key);
}

// Le o snapshot da API e guarda copia propria: mexer no objeto depois nao muda a
// colisao. Devolve null quando o snapshot nao da para usar (o mundo anterior fica).
function readWorld(snapshot) {
  if (!snapshot || typeof snapshot !== 'object' || !Array.isArray(snapshot.land)) return null;
  const size = Number.isFinite(snapshot.parcelSize) && snapshot.parcelSize > 0 ? snapshot.parcelSize : DEFAULT_PARCEL_SIZE;
  const keys = new Set(), parcels = [];
  for (const parcel of snapshot.land) {
    if (!parcel || !Number.isInteger(parcel.x) || !Number.isInteger(parcel.y)) continue;
    const key = parcel.x + ':' + parcel.y;
    if (keys.has(key)) continue;
    keys.add(key);
    parcels.push({ x: parcel.x, y: parcel.y });
  }
  // Sem nenhuma parcela usavel o snapshot nao serve: o mundo anterior continua.
  if (parcels.length === 0) return null;
  // Ordem fixa: a busca por celula livre precisa dar sempre o mesmo resultado.
  parcels.sort((a, b) => a.y - b.y || a.x - b.x);
  const footprints = snapshot.footprints && typeof snapshot.footprints === 'object' ? snapshot.footprints : {};
  const blockers = [];
  if (Array.isArray(snapshot.obstacles))
    for (const o of snapshot.obstacles)
      if (o && finiteRect(o.x, o.y, o.w, o.h)) blockers.push({ x: o.x, y: o.y, w: o.w, h: o.h });
  if (Array.isArray(snapshot.buildings))
    for (const b of snapshot.buildings) {
      if (!b) continue;
      // Pegada desconhecida vira 1x1: bloqueia conservador em vez de deixar passar.
      const foot = own(footprints, b.kind) ? footprints[b.kind] : null;
      const w = foot && Number.isFinite(foot.w) && foot.w > 0 ? foot.w : 1;
      const h = foot && Number.isFinite(foot.h) && foot.h > 0 ? foot.h : 1;
      if (finiteRect(b.tile_x, b.tile_y, w, h)) blockers.push({ x: b.tile_x, y: b.tile_y, w, h });
    }
  const farmId = snapshot.farm && typeof snapshot.farm === 'object' && snapshot.farm.id != null ? snapshot.farm.id : null;
  return { farmId, size, keys, parcels, blockers };
}

export class Walker {
  #x = DEFAULT_SPAWN.x;
  #y = DEFAULT_SPAWN.y;
  #facing = 'down';
  #moving = false;
  #blocked = false;
  #ready = false;
  #farmId = null;
  #size = DEFAULT_PARCEL_SIZE;
  #keys = new Set();
  #parcels = [];
  #blockers = [];

  // Copia: ninguem move o avatar escrevendo em walker.position.
  get position() { return { x: this.#x, y: this.#y }; }
  get facing() { return this.#facing; }
  get moving() { return this.#moving; }
  // Pressionou e nao saiu do lugar (parede, terra nao comprada ou sem saida).
  get blocked() { return this.#blocked; }
  get ready() { return this.#ready; }
  state() { return { x: this.#x, y: this.#y, facing: this.#facing, moving: this.#moving }; }

  // Auxiliar de leitura para o renderer: o ponto aguenta os pes?
  canStand(x, y) { return this.#ready && this.#free(x, y); }

  // Snapshot novo (inclusive o poll periodico). Reposiciona so quando precisa:
  // fazenda diferente, reset pedido ou chao que deixou de existir sob os pes.
  setWorld(snapshot, reset = false) {
    const world = readWorld(snapshot);
    if (!world) {
      if (reset === true && this.#ready) this.#spawn();
      return this.state();
    }
    const changed = world.farmId !== this.#farmId;
    this.#farmId = world.farmId;
    this.#size = world.size;
    this.#keys = world.keys;
    this.#parcels = world.parcels;
    this.#blockers = world.blockers;
    this.#ready = true;
    if (reset === true || changed) this.#spawn();
    else if (!this.#free(this.#x, this.#y)) {
      // Construiram ou moveram algo em cima do avatar: anda para a celula livre
      // mais proxima. Posicao ainda valida fica intacta (poll nao teleporta).
      this.#moving = false;
      this.#blocked = !this.#relocate(this.#x, this.#y);
    }
    return this.state();
  }

  // Um quadro de caminhada. inputX/inputY no intervalo [-1,1] (WASD ou analogico),
  // seconds = tempo do quadro. Nunca lanca: entrada ruim apenas para o avatar.
  move(inputX, inputY, seconds) {
    this.#blocked = false;
    if (!Number.isFinite(inputX) || !Number.isFinite(inputY) || !Number.isFinite(seconds) || seconds <= 0) {
      this.#moving = false;
      return this.state();
    }
    const length = Math.hypot(inputX, inputY);
    if (!(length > 0)) { this.#moving = false; return this.state(); }
    // Diagonal normalizada: (1,1) anda os mesmos 2,7 tiles/s de (1,0).
    // Intensidade menor que 1 (analogico) continua andando devagar.
    const scale = length > 1 ? 1 / length : 1;
    const ix = inputX * scale, iy = inputY * scale;
    // Diagonal exata vira lado: o sprite atual so tem variacao horizontal.
    this.#facing = Math.abs(iy) > Math.abs(ix) ? (iy > 0 ? 'down' : 'up') : (ix > 0 ? 'right' : 'left');
    if (!this.#ready) { this.#moving = false; this.#blocked = true; return this.state(); }
    if (!this.#free(this.#x, this.#y) && !this.#relocate(this.#x, this.#y)) {
      this.#moving = false;
      this.#blocked = true;
      return this.state();
    }
    const dt = Math.min(seconds, MAX_STEP_SECONDS);
    const dx = ix * SPEED_TILES_PER_SECOND * dt, dy = iy * SPEED_TILES_PER_SECOND * dt;
    const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) / MAX_SUBSTEP_TILES));
    const stepX = dx / steps, stepY = dy / steps;
    const fromX = this.#x, fromY = this.#y;
    for (let i = 0; i < steps; i++) {
      // Eixo por eixo: da o deslizamento na parede e impede cortar quina.
      const movedX = stepX !== 0 && this.#axis(stepX, 0);
      const movedY = stepY !== 0 && this.#axis(0, stepY);
      if (!movedX && !movedY) break;
    }
    this.#moving = Math.abs(this.#x - fromX) + Math.abs(this.#y - fromY) > MIN_MOVE;
    this.#blocked = !this.#moving;
    return this.state();
  }

  // Passo em um unico eixo. Se o passo inteiro nao cabe, encosta na parede com
  // algumas bisseccoes em vez de parar um subpasso antes.
  #axis(dx, dy) {
    const nx = this.#x + dx, ny = this.#y + dy;
    if (this.#free(nx, ny)) { this.#x = nx; this.#y = ny; return true; }
    let low = 0, high = 1;
    for (let i = 0; i < REFINE_PASSES; i++) {
      const mid = (low + high) / 2;
      if (this.#free(this.#x + dx * mid, this.#y + dy * mid)) low = mid; else high = mid;
    }
    const partX = dx * low, partY = dy * low;
    if (Math.abs(partX) + Math.abs(partY) <= MIN_MOVE) return false;
    this.#x += partX;
    this.#y += partY;
    return true;
  }

  // A caixa dos pes inteira precisa estar em parcela comprada e fora de todo
  // retangulo de chao. Conservadora: a caixa contem o circulo de mesmo raio.
  #free(x, y) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return false;
    const minX = x - FOOT_RADIUS_TILES, maxX = x + FOOT_RADIUS_TILES;
    const minY = y - FOOT_RADIUS_TILES, maxY = y + FOOT_RADIUS_TILES;
    const size = this.#size;
    const firstX = Math.floor(minX / size), lastX = Math.floor((maxX - EDGE) / size);
    const firstY = Math.floor(minY / size), lastY = Math.floor((maxY - EDGE) / size);
    for (let py = firstY; py <= lastY; py++)
      for (let px = firstX; px <= lastX; px++)
        if (!this.#keys.has(px + ':' + py)) return false;   // vale tambem na divisa entre parcelas
    for (const b of this.#blockers)
      if (minX < b.x + b.w && b.x < maxX && minY < b.y + b.h && b.y < maxY) return false;
    return true;
  }

  #spawn() {
    this.#x = DEFAULT_SPAWN.x;
    this.#y = DEFAULT_SPAWN.y;
    this.#facing = 'down';
    this.#moving = false;
    this.#blocked = false;
    if (!this.#free(this.#x, this.#y)) this.#blocked = !this.#relocate(DEFAULT_SPAWN.x, DEFAULT_SPAWN.y);
  }

  // Centro de tile livre mais proximo, dentro da terra comprada. Deterministico:
  // menor distancia e, no empate, menor y e depois menor x. Sem saida, mantem a
  // posicao e devolve false (o chamador trata como bloqueado; nada lanca).
  #relocate(fromX, fromY) {
    let best = null;
    for (const parcel of this.#parcels) {
      const baseX = parcel.x * this.#size, baseY = parcel.y * this.#size;
      for (let ty = 0; ty < this.#size; ty++)
        for (let tx = 0; tx < this.#size; tx++) {
          const cx = baseX + tx + 0.5, cy = baseY + ty + 0.5;
          if (!this.#free(cx, cy)) continue;
          const distance = (cx - fromX) * (cx - fromX) + (cy - fromY) * (cy - fromY);
          if (!best || distance < best.distance - TIE ||
              (distance <= best.distance + TIE && (cy < best.y || (cy === best.y && cx < best.x))))
            best = { distance, x: cx, y: cy };
        }
    }
    if (!best) return false;
    this.#x = best.x;
    this.#y = best.y;
    this.#moving = false;
    return true;
  }
}
