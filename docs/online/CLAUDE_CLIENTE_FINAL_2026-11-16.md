Leitura estática de `server/web/app.js` e `server/web/map.js` (+ checagem cruzada de `server/src/app.ts:78` e `server/src/game.ts:103`). **Não executei nada**: sem comandos, testes, navegador ou servidor.

## Veredito
**Apto para teste local fechado.** Não achei regressão nas correções que você listou. Dois defeitos reais, nenhum bloqueante; o nº 1 é o único que pode atrapalhar o teste responsivo que o Codex está rodando.

## Correções conferidas (sem problema)
- **`pending` entre contas:** `command()` grava `farmId` (`app.js:22`); `sendPending` descarta se `snapshot?.farm.id` divergir (`app.js:23`); `showEntry()` zera `pending`/`retry`/`landChoice` (`app.js:15`). Simulei o caminho crítico — sessão trocada em outra aba, poll traz a fazenda B com 200, clique em "Tentar novamente" — e o guarda pega. Entrar pelo formulário com `pending` vivo é impossível: a tela de entrada só reaparece via `showEntry()`.
- **Respostas concorrentes:** `viewGeneration` é capturado antes do fetch e reconferido nos dois ramos (`app.js:14`). O `fresh` perde o flag na chamada recursiva, mas `busy` bloqueia poll e `visibilitychange` durante `sendPending`, então o GET aninhado sempre é novo — não encontrei caminho para `loaded=false` falso nem para snapshot velho sobrescrever o novo.
- **`operationKey` fallback:** `'op_'+32 hex` = 35 chars, casa com `^[a-zA-Z0-9_-]{8,100}$` do schema e do `execute`. Sem 400 em contexto inseguro (`randomUUID` só existe em HTTPS/localhost).
- **Zoom:** `sizeWorld`/`coord`/`clamp` só produzem inteiros e `image-rendering:pixelated` é global (`style.css:2`); terreno não é redesenhado em `setZoom` (`map.js:34`). Ok.
- **`pointerdown`:** `preventDefault` + `focus({preventScroll:true})` ok; `touch-action:none` está no CSS. `ignoreClick` com `setTimeout(0)` cobre o caso de `click` não disparar.

## Problemas encontrados

**1. Multitoque dispara pan errático e `move` indevido — `map.js:38-40`**
`pointerdown` não filtra ponteiro secundário: um segundo dedo sobrescreve `this.drag` e recaptura. Dois efeitos reais com `touch-action:none` (usuário tenta pinçar): (a) soltar o primeiro dedo zera `this.drag` e o mapa "congela" até reencostar; (b) em modo Organizar, dedo A arrastando o fundo + dedo B numa construção → o `pointerup` de A usa `drag.moving` de B e envia um `move` para o tile onde A soltou. Reversível, mas é um comando não intencional.
Correção mínima: em `pointerdown`, `if(!e.isPrimary||this.drag)return;` e guardar `id:e.pointerId` no `this.drag`; em `pointermove` e `pointerup`, `if(!this.drag||e.pointerId!==this.drag.id)return;`.

**2. Botões ficam travados até 8 s após descarte entre contas — `app.js:23`**
O ramo de descarte faz `return` antes de `busy=true`, então o `finally` não roda e `buttonState()` só é chamado no próximo poll, com os botões ainda desabilitados por `locked`.
Correção mínima: `buttonState();` antes do `return`.

**Observação (não bug):** 401 em `sync` não silencioso chama `showEntry()` e depois escreve o aviso em `#noticeText`, que está dentro de `#game` (oculto) — o usuário volta ao login sem explicação (`app.js:14`). Cosmético.