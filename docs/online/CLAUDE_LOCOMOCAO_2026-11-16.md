# Entrega Claude — locomoção

Sessão dedicada concluída em 16/11/2026. Escrita autorizada apenas em locomotion.js e locomotion.test.ts; sem Bash, rede ou Git. Codex revisou e executou os testes. O relatório cita 10 testes, mas o arquivo final contém 11 e a suíte executada contém 55 no total.

Entregue. Os dois arquivos estão prontos e conferem com os pontos de integração que o Codex já deixou no `map.js` (`new Walker()`, `setWorld({...snapshot, obstacles:[...]}, fresh)`, `move(0,0,0)` no `clearMovement`, `move(dx,dy,dt)` no loop) e no `client.ts` (`/play/locomotion.js` já servido).

## Arquivos entregues
- `server/web/locomotion.js` — módulo ESM puro (sem DOM, sem rede, sem persistência, sem credencial).
- `server/test/locomotion.test.ts` — 10 testes `node:test`, rodam via `tsx --test test/*.test.ts` sem banco.

## API
`new Walker()` → `position {x:5.6,y:6.3}` (getter com cópia), `facing 'down'`, `moving false`.
`setWorld(snapshot, reset=false)` e `move(inputX,inputY,seconds)` devolvem `{x,y,facing,moving}` — exatamente essas quatro chaves. Extras aditivos: getters `facing`/`moving`/`blocked`/`ready`, `state()`, `canStand(x,y)` e as constantes (`SPEED_TILES_PER_SECOND`, `FOOT_RADIUS_TILES`, `MAX_STEP_SECONDS`, `MAX_SUBSTEP_TILES`, `DEFAULT_SPAWN`, `DEFAULT_PARCEL_SIZE`).

## Decisões
- **Pés em AABB de raio 0,22** (contém o círculo, é conservadora) contra retângulos meia-abertos `[x, x+w)`, igual ao `src/layout.ts`: encostar não é sobrepor. Só o retângulo de chão entra; altura visual nunca.
- **Eixo por eixo, subpasso ≤0,1 tile, 8 bissecções** ao bater: desliza na parede, não atravessa nem corta quina, e encosta com vão abaixo de 0,001 tile (0,02 px a 24 px/tile) em vez de parar um subpasso antes.
- **Diagonal normalizada** só quando o comprimento passa de 1 (teclado + joystick somados); intensidade menor que 1 anda proporcionalmente.
- **`facing`**: vertical só quando `|iy| > |ix|`; diagonal exata vira `left`/`right`, porque o sprite atual só varia na horizontal. Entrada neutra ou inválida preserva a última direção.
- **`moving` é resultado do último quadro.** `setWorld` com posição ainda válida não mexe em posição, `facing` nem `moving` — o poll não é um quadro e não corta a animação. Reset, troca de fazenda e realocação zeram `moving`.
- **Snapshot inutilizável** (nulo, não-objeto, `land` que não é lista, ou sem nenhuma parcela válida) mantém o mundo anterior em vez de travar o avatar. O mundo é copiado: mexer no objeto depois não muda a colisão.
- **Pegada desconhecida vira 1×1** (bloqueia conservador). Obstáculos com coordenada fracionária funcionam — exijo só finito e `w/h > 0`, então os troncos que você injeta no `setSnapshot` entram normalmente.
- **Spawn e resgate determinísticos**: centro de tile livre mais próximo dentro da terra comprada, empate por menor `y` e depois menor `x`. Sem saída: mantém a posição, `moving=false`, `blocked=true`, sem throw.

## Riscos e pendências
- **Não executei os testes** (nesta tarefa estou sem Bash). Os valores esperados saíram da geometria real do cenário inicial, calculados à mão; a execução e a integração são suas. Se alguma asserção apertada falhar, os pontos a olhar primeiro são a tolerância de encosto (`wall`, 1e-3) e os dois alvos de realocação (`{6.5,5.5}` e `{5.5,5.5}`).
- `tsc --noEmit` cobre só `src/`, então o import de JS dentro de TS passa batido; se um dia os testes entrarem no `tsconfig`, vai faltar `allowJs`. Não editei `package.json` nem `tsconfig.json` (já vi que o `check` e o `client.test.ts` foram atualizados do seu lado).
- A busca de célula livre varre até 144 tiles por parcela (≈3600 com 25 parcelas), mas só roda quando a posição fica inválida — construção em cima dos pés, troca de fazenda ou spawn ocupado. Não roda por quadro.
- A realocação testa **centros de tile**: um obstáculo fracionário em cima do centro descarta o tile inteiro, mesmo com canto livre.
- `facing`, `moving`, `position` são getters sem setter: atribuir de fora lança em ESM. Conferi que o `map.js` só lê.
- A posição é local e some ao recarregar — sem API, sem persistência e sem efeito em economia, como combinado para esta etapa.
