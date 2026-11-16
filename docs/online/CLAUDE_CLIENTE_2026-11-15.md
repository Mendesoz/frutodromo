## Revisão de leitura — cliente web do piloto (`server/web/*`, `server/src/client.ts`)

Só leitura: não executei nada, não abri navegador, não toquei no banco. Os 28 testes e o build do Codex cobrem o backend; nada abaixo foi verificado em execução.

### Grave

**1. Operação pendente sobrevive à troca de conta** — `app.js:14` (`showEntry`) não limpa `pending`, nem `$('retry').hidden`. Caminho real: comando dá timeout (`pending` guardado, botão "Tentar novamente" visível) → clique em "Reconectar" → 401 → `showEntry()` → login com **outra conta** → `sendPending()` (`app.js:22`) reenvia o comando da conta A com o cookie da conta B. `move`/`queue` morrem em `INVALID_BUILDING` (escopo por fazenda em `game.ts:120,164`), mas `deliver`, `buy_seed`, `recover_seed`, `expand` e `customize` não têm id e **executam na conta errada**. Correção: em `showEntry()` zerar `pending`, `selected`, `organizing`, `landChoice`, `$('landDialog').close()`, esconder `retry`/`refresh`, `map.snapshot=null`.

**2. `crypto.randomUUID()` só existe em contexto seguro** — `app.js:21`. Em `http://` por IP de LAN (celular no teste) é `undefined`: `command()` lança TypeError dentro de `void command(...)`, nenhum botão funciona e nenhuma mensagem aparece. Fallback: `crypto.randomUUID?.() ?? (Date.now().toString(36)+'-'+Math.random().toString(36).slice(2)+'-'+Math.random().toString(36).slice(2))` — casa com `^[a-zA-Z0-9_-]{8,100}$` (`app.ts:78`, `game.ts:103`).

**3. Com `pending`, a fazenda congela** — `app.js:13` (poll) e `app.js:38` exigem `!pending`. Se o jogador não clicar em "Tentar novamente", o GET `/api/farm` nunca mais roda: produções terminam no servidor e não aparecem. GET é seguro e idempotente; bloqueie só mutações, não a sincronização.

### Média

**4. Obstáculos duplicados em vez de lidos do snapshot** — `map.js:25` fixa `['house',1,6,2,3],['market',9,7,2,3]`; o servidor manda `obstacles` (`layout.ts:28`, `game.ts:97`) com `kind:'stand'`, não `'market'`. Qualquer mudança de um lado cria parede invisível. Desenhe o cenário a partir de `snapshot.obstacles` com um mapa kind→sprite.

**5. Z-index do cenário ignora profundidade** — `map.js:24` dá banda `4+floor((tile_y+OFFSET)/10)` aos prédios, mas `.scenery-sprite` é z-index 3 fixo e `.field-hero` é 5. Prédio movido ao norte da casa (ex.: coop em y=3) desenha **em cima** da casa que está à frente. Use a mesma fórmula com o `y` dos obstáculos.

**6. `drawTerrain()` inteiro a cada zoom** — `map.js:33` chama `drawTerrain()`, mas o canvas é sempre 1440×1440 nativo e só a largura CSS muda. São ~21 mil `fillRect` + ~400 árvores travando a thread por clique no `+`/`−`. No zoom, atualize apenas `world/terrain style.width/height` e `--tile`. Mesma coisa no `signature` de `map.js:24`: `zoom` é irrelevante para o canvas nativo.

**7. `Cache-Control: no-store` global atinge a arte** — `app.ts:37` aplica a todas as rotas, inclusive as de `client.ts:16`. `sprites.js` embute 28 PNGs em data URL e as fontes são 3 woff2: tudo rebaixado em cada visita, no celular. Isente `/art/*` e `/play/*.css|js` com `max-age` + ETag; mantenha `no-store` no HTML e na API.

**8. `touch-action:none` no mapa** (`style.css`, `.map-viewport`) — com mapa de 360px dentro de página longa, swipe vertical iniciado no mapa nunca rola a página. Decisão sua; se quiser os dois, `pan-y` fora do modo organizar.

**9. No-ops silenciosos** — `command()` (`app.js:21`) e `openLand()` (`app.js:25`) retornam sem dizer nada quando `busy||pending`; "Expandir" e arrastar parecem quebrados. Mostre `say('Termine o pedido pendente...')`.

### Baixa

**10. Textos de economia fixos no cliente** — `app.js:17` (`Usa 2 milhos · 45 segundos`), `app.js:31` (`18 moedas`), `index.html:52` (`Semente · 3 moedas`). O snapshot já traz `recipes`, `order` e `seedPrice`; derive (só exibição, sem mexer em mecânica).

**11. Limites do mundo fixos no cliente** — `map.js:1` (`PARCEL=12,OFFSET=24`), `app.js:24` e `map.js:23` (`Math.abs()<=2`), `index.html:50` (`min=-24 max=35`, impossível para pegada 3×3). Exponha `parcelMin/parcelMax` em `layoutInfo()` e consuma `parcelSize`.

**12. Herói nulo e nomes repetidos** — `app.js:20` compara com `snapshot.farm.hero` sem `??0` (nenhum botão marcado em fazenda antiga), enquanto `app.js:15` usa `??0`. E `chars` tem nomes duplicados ("Pinguim Pipo", "Pipoca", "Felino Félix", "Sapo Zé"), gerando `aria-label` ambíguos.

**13. Acessibilidade menor** — `#mapHint` (`index.html:45`) muda de instrução sem `aria-live`; `#syncStatus` não é região viva; `#capacity` lê "4 + 2 / 200". Foco visível, `aria-pressed`, rótulo de expansão, diálogo e caminho de teclado pelo `#moveForm` estão corretos.

**14. `toLowerCase()` morto** — `app.js:29`: `pattern="[a-z0-9_]{3,24}"` (`index.html:22`) barra o envio antes; quem digita "Eric" vê erro do navegador.

### Estático e autoridade
Lista fechada por chave literal (`client.ts:5-12`): travessia é estruturalmente impossível, MIME e CSP corretos, `/api/*` registrado antes. Faltam `Referrer-Policy` e checagem no boot — se `prototipo-fazenda/` não existir no deploy, cada GET vira 500 em vez de falha de inicialização. Nenhum `localStorage`, `sessionStorage` ou `document.cookie` em `server/web/`: sessão é cookie httpOnly, `/api/auth/status` só devolve booleano e toda mutação passa por `/api/commands` com validação no servidor. Nenhum estado local vira autoridade.

**Veredito:** serve para **teste local fechado** depois de corrigir 1, 2 e 3. Não é prontidão comercial.