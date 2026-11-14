# QA Claude — interface, responsividade, Safari/iPhone, PWA e desempenho

Branch: `qa-claude-frutodromo`, criada a partir de `stage9-dynamic-difficulty` (`9cf9575`). `main` não foi alterada e nada foi publicado.
Plano de referência: `ai-game-studio/projects/FRUTODROMO_FINISH_PLAN.md`. Dia 1 (inventário) e parte do Dia 2 (correções de interface).
Última atualização: 14/11/2026 (dia 2: handoff do ChatGPT e primeiros resultados do iPhone real).

## Ambiente de teste (o que foi de fato executado)
| Motor | Como | Observação |
|---|---|---|
| Chromium 153 (Playwright) | `file://` e `http://localhost`, toque emulado, DPR 1–3, `pt-BR` e `en-US` | principal |
| WebKit (WebKitGTK 2.52, UA `AppleWebKit/605.1.15`) | Selenium + WebKitWebDriver sob Xvfb | mesmo motor de layout e JS do Safari, **mas não é o Safari do iPhone**: outro compositor gráfico, sem iOS |
| Safari iPhone real | — | **NÃO TESTADO.** Nada aqui afirma comportamento do iPhone; ver roteiro do proprietário no fim |
| Playwright WebKit | — | não instalou (download bloqueado pela rede do ambiente) |

Tamanhos: 375×667 (SE), 375×812, 390×844 (iPhone 14), 430×932, 667×375 e 844×390 (deitado), 820×1180 (iPad), 1024×600 (CrazyGames), 900×430 (janela baixa), 1280×680, 360×640.
Scripts em `tools/qa/` (rodam sobre uma cópia em `/tmp/qa9/site` criada por `tools/qa/mksite.sh`, que injeta um coletor de erros). Evidências em `docs/qa/2026-11-13/`.

## Achados
Formato do plano: `ID | Severidade | Arquivo/linha | Passos | Esperado | Observado | Evidência | Testado de fato? | Proposta | Branch/commit`.

| ID | Sev. | Arquivo/linha | Passos | Esperado | Observado | Evidência | Testado? | Proposta | Commit |
|---|---|---|---|---|---|---|---|---|---|
| QA-01 | **P1** | `js/game.js` (registro do SW, fim do arquivo) | Abrir o jogo em qualquer host que não seja `*.github.io` (ex.: `frutodromo.pages.dev`, `localhost`), jogar, ficar offline, recarregar | Jogo abre offline com o save | Sem service worker: `sw=null`, nenhum cache, recarga offline falha (`ERR_INTERNET_DISCONNECTED`) | `tools/qa/pwa.py`; `docs/qa/2026-11-13/pwa-offline-recarga-ok.png` (depois) | Sim (Chromium, localhost) | Registrar em qualquer `https:` e no localhost; nunca no build de portal (`window.PORTAL_NAME`) | `fe9a9f0` **corrigido** |
| QA-02 | P2 | `sw.js` | Comparar `CACHE` entre `5cf0d73` e `9cf9575` | Versão do cache sobe quando arquivos mudam | Continuava `frutodromo-v43` com CSS e JS das etapas 6B–9 diferentes; PWA instalado mantinha entradas antigas | leitura do diff | Sim (estático) | Subir para `v44` | `fe9a9f0` **corrigido** |
| QA-03 | P2 | `css/style.css` (regra de 40 px só em `max-width:599px`) | Tela de toque com 600 px ou mais de largura (iPhone deitado 844×390 e 667×375, iPad 820×1180) | Alvos de toque de ~40 px | ÁRVORE 63×28, pausa 30×28, menu 28×28, ARRUMAR 72×28 | `tools/qa/resp.py`, `tools/qa/hit.py` | Sim (Chromium com toque emulado) | Ampliar só a área de toque com pseudo-elemento invisível em `(pointer:coarse) and (min-width:600px)`; desenho e altura do cabeçalho iguais | `c990b92` **corrigido** |
| QA-04 | **Fechado** (iPhone real: PASS) | `css/style.css` `#sky` (`mix-blend-mode:multiply`), `#lamp` (`screen`) | WebKit com compositing acelerado: abrir o jogo | Cena com parede, janelas, clientes | Cena inteira coberta por um lilás opaco (clientes, balões e fantasma do arraste somem). Com `WEBKIT_DISABLE_COMPOSITING_MODE=1` a cena aparece certa. Página mínima com o mesmo blend funciona | `webkit-composited-ceu-opaco.png` × `webkit-sem-compositing-ok.png` | Sim no WebKitGTK; **não testado no iPhone** | Defeito do WebKitGTK sob Xvfb (GL por software). Em 14/11 o Eric confirmou no iPhone real: cenário e personagens normais, sem véu lilás, inclusive deitado. Nenhuma ação | — |
| QA-05 | P3 (rebaixado) | `js/game.js` `fitScene`, `ZMIN` | iPhone SE deitado (667×375) | Caldeirão inteiro na mesa | Mesa de 114 px e caixa do caldeirão de 126 px. Medição de 14/11: o **corpo** do caldeirão fica inteiro (0 px cortado); só a faixa de baixo da caixa, com o rótulo e o brilho, passa 12 px. Com 6 frutas grandes a mesa fica apertada. Em 844×390 cabe (mesa 129 px) | `iphone-se-deitado-667x375.png` | Sim (Chromium) | Não corrigido: mexe na regra de altura da cena, que também afeta a janela do CrazyGames. Proposta para o Dia 2/3, se o proprietário jogar deitado: cena mínima menor só abaixo de 400 px de altura | — |
| QA-06 | P2 risco | `css/style.css` (`html`) | iPhone: girar para deitado | Texto do mesmo tamanho | Sem `-webkit-text-size-adjust`; o Safari pode aumentar texto ao girar | — | **Não testado** (só acontece no iOS) | `html{-webkit-text-size-adjust:100%}` se o proprietário vir texto crescer | — |
| QA-07 | P2 risco | `css/style.css` | iPhone: tocar duas vezes rápido em área sem botão (etiquetas do topo, parede da cena, texto de modal) | Nada | Pode dar zoom de duplo toque: só botões, cartões, clientes e frutas têm `touch-action` | — | **Não testado** (Chromium não emula) | `html{touch-action:manipulation}` (mantém o gesto de pinça) se o proprietário confirmar | — |
| QA-08 | P2 | `manifest.json` `"orientation":"portrait"` | Instalar o PWA no Android e girar | Combinar com o jogo, que suporta deitado | Android trava em retrato; o iOS ignora | — | Estático | Decisão do proprietário: manter, ou trocar para `"any"` | — |
| QA-09 | Info | `css/style.css` (etapas 7–8) | Leitura do diff `5cf0d73..9cf9575` | — | As etapas 7–8 reintroduziram sombras com desfoque no cabeçalho e na feira, `drop-shadow` em retratos e balões e bordas internas de 3 px, contra a regra de pixel inteiro da etapa 5. Aprovado pelo proprietário no iPhone (etapa 7). Desempenho medido sem piora (abaixo) | leitura | Sim | Nenhuma ação | — |
| QA-11 | **P1** (inglês é o idioma do portal) | `css/style.css` regra `.mk{overflow-wrap:anywhere}` da etapa 8C | Jogo em inglês, olhar a feira | Nomes inteiros | `MARKE/T`, `Strawberr/y`, `Watermelo/n` partidos no meio, em todos os tamanhos (360×640 a 1280×680). Na `5cf0d73` nada quebrava e nada estourava | `tools/qa/mkfit.py`, `tools/qa/broken.py` | Sim (Chromium, en e pt) | Remover a regra: 3 palavras quebradas viram 0, e nenhum texto estoura o cartão (como antes) | `1a616bf` **corrigido** |
| QA-12 | P3 | `css/style.css` `.rq b{overflow-wrap:anywhere}` (etapa 5C) | Em 360 px, pedido com nome comprido em inglês | Nome inteiro | Uma vez apareceu `WATERMELO/N` partido num balão (depende do pedido sorteado) | `tools/qa/broken.py` em `origin/stage9` | Sim, intermitente | Aceitar (a alternativa é o texto estourar o balão). Rever só se aparecer muito | — |
| QA-13 | P3 | `sw.js` (`fetch` com rede primeiro, sem tempo limite) | Abrir o PWA com internet muito ruim (conecta, mas não responde) | Abre em poucos segundos com a cópia guardada | Espera o tempo limite do sistema antes de cair no cache (não medido no aparelho) | leitura | Estático | Se o proprietário notar demora: tempo limite de ~4 s só para a navegação | — |
| QA-10 | Info | — | Conferir qual branch `frutodromo.pages.dev` publica | — | Não verificado: o acesso ao site pedia aprovação e ninguém respondeu | — | **Não** | Proprietário confirma na Cloudflare antes do teste no iPhone | — |

| QA-14 | P3 | `js/game.js` `toastPlace` (5B) | Com o modal "COMO FAZER?" aberto, entregar e subir de nível | Aviso legível sem tapar o modal | O aviso vai para o topo da tela, por cima do título do modal ("HOW TO MAKE IT?" coberto por ~1 s) | `docs/qa/2026-11-14/dica-5-passos-en-antes-traducao.png` | Sim | Aceitar (dura pouco); se incomodar, pôr o aviso abaixo do título do modal | — |
| QA-15 | **P1** (inglês) | `js/i18n.js` (textos do modo dica, `8f67f3a`) | Jogo em inglês: abrir uma dica e os ajustes | Tudo em inglês | "A estampa pode variar; **color, size** e poderes seguem a **recipe**." na dica; "Modo dica" e a explicação em português nos ajustes | `tools/qa/untr.py`; print acima | Sim (15 estados × 2 tamanhos) | Três entradas novas em `js/i18n.js` | `ca778fd` **corrigido** |
| M-08 | **P1** | `js/game.js` soltura no cliente e `deliver()` | Duas frutas que atendem o mesmo pedido; soltar a 2ª no mesmo cliente até 900 ms depois da 1ª (arraste real) | Só a 1ª paga | A 2ª era paga de novo e contava mais uma entrega (o nível sobe mais rápido): 2 pagamentos com 0, 300 e 700 ms; 1 com 1200 ms | `tools/qa/m08.py` | Sim (Chromium, 1024×600) | Marca em memória (`WeakSet`) o cliente atendido; a fruta fica na mesa. Sem campo novo no save, sem mudar regra | `667a801` **corrigido** |

Nenhum P0 encontrado.

## Verificações que passaram (executadas)
- **Sintaxe:** `node --check js/game.js js/i18n.js` ok.
- **Regressão Chromium** (`smoke.py`, `first2.py`, `portal_sdk.py`, `portal_direct.py`, `regress.py`, `drag.py`, `mk.py`), antes e depois das correções, 0 erros de console:
  - fluxo completo: compra, cruzamento, entrega, venda, árvore, álbum, carta, fim do dia e save igual ao recarregar, em 6 tamanhos;
  - tutorial não cobre frutas nem o caldeirão;
  - SDK do CrazyGames e mudo;
  - fantasma do arraste visível em 4 tamanhos;
  - setas da feira.
- **WebKit, sem compositing acelerado** (`wk.py`, `wkdeliver.py`):
  - carrega sem erro de JS;
  - `CSS.supports` ok para `zoom`, `:has()` e `dvh`; fonte Pixelify carregada; Pointer Events ok;
  - cruzamento com arraste de ponteiro real em 4 tamanhos;
  - entrega real a cliente em 500×800, 1024×600 e 900×430 (moedas e `delivered` sobem, `.cust.hot` acende, o fantasma aparece e some ao soltar);
  - save igual depois de recarregar.
- **Responsividade, 11 tamanhos × pt/en** (`resp.py`):
  - nenhum balão sobreposto; caldeirão dentro da mesa, exceto QA-05;
  - menu de ajustes cabe em todos, com rolagem interna onde precisa;
  - os "fora da tela" acusados são os cartões do trilho rolável da feira (esperado).
- **Modal "COMO FAZER?"** (`deep.py`): a receita mais longa disponível no nível 9 (5 passos) cabe em 667×375, 844×390, 375×667, 360×640 e 1024×600, com rolagem interna no celular deitado.
- **PWA** (`pwa.py`, depois de `fe9a9f0`):
  - SW ativo com 14 arquivos em cache, sem erros de instalabilidade nem de manifesto;
  - recarga offline abre o jogo com save e fonte;
  - o build do portal não registra SW.
- **Desempenho, CPU 4x** (`perf.py`, 2 rodadas por versão, `5cf0d73` × branch 9):
  - 393×760 e 1280×680, parado e arrastando: mediana 16,7 ms e p95 ≤ 16,8 ms nos dois;
  - recálculo de estilo 855–993 ms (base 825–887) em ~8 s;
  - 0 long tasks. Sem regressão mensurável.
- **Sessão longa** (`soak.py`, 6 min, 2 dias, compras a cada 15 s): heap entre 4,2 e 4,6 MB, nós do DOM estáveis (sobem só com as frutas compradas e voltam ao trocar de dia), nenhum fantasma ou aviso sobrando, 0 erros (`docs/qa/2026-11-13/soak.log`).
- **Ciclo de vida, por leitura:** salva em `visibilitychange` e `pagehide`, suspende e retoma o áudio ao voltar, destrava o áudio no primeiro toque. É o que o iOS exige; não testado no aparelho.

## Testes de execução da etapa 9 (dia 2; sem mudar código)
Estes testes cobrem itens da matriz "PENDENTE" do `REGRESSION_2026-11-13.md` que dependem de rodar o jogo. A lógica de pedidos é do ChatGPT; aqui só medição. Script: `tools/qa/recipes.py` (log em `docs/qa/2026-11-14/recipes.log`). Feira antes e depois do QA-11: `docs/qa/2026-11-14/feira-1024-en-{antes,depois}.png`.
- **Sintaxe e execução no navegador:** ok no Chromium e no WebKit, 0 erros.
- **Receitas reproduzidas e aceitas:** para cada alvo, as frutas da feira foram cruzadas com o `cross()` real, seguindo `recipeOf`, 8 vezes por alvo e 25 alvos por número de cruzamentos (1 a 5), nos níveis 2, 4, 6 e 9. **100%** aceitas por `meets()` tanto como pedido de espécie quanto como pedido de atributos (`reqsFrom`). 0 falhas em 3.296 tentativas.
- **Profundidade dos pedidos** (150 clientes por nível, sem adaptação): níveis 1–2 com 83–86% de feira e 14–17% de 1 cruzamento; níveis 3–4 com 65% / 30% / 5% (profundidade 0/1/2); níveis 5–6 com 55% / 39% / 6% (0/1/3); níveis 7–9 com 39–46% / 35–45% / 15–19% (0/1/3). Bate com os pesos 45/40/15. **Observação para o ChatGPT:** do nível 5 em diante a profundidade 2 nunca é pedida (o difícil pula direto para a 3, com receita de até 5 cruzamentos). Se for de propósito, ok; se não, é um degrau grande.
- **Adaptação** (nível 7, 400 clientes): neutro 45/42/13%; depois de 5 erros 61/39/**0%** de difíceis; depois de 5 acertos 27/42/**31%**.
- **Um erro por cliente:** 3 entregas erradas ao mesmo cliente contam 1 erro. A sequência de 5 erros e 5 acertos atualiza `streak` como esperado e é gravada em `frutodromo_difficulty`.
- **NOVO JOGO:** pelo fluxo real (dois toques), `DIFF` volta a zero e a chave local é apagada, inclusive depois de recarregar (antes: `{wins:5,misses:8,streak:-2}` persistia ao recarregar).
- **Dicas ligadas/desligadas e PWA** (`tools/qa/hints.py`, `http://localhost` com SW): desligar nos ajustes some com os 3 "?". Continua desligado ao recarregar e ao recarregar **offline**; religar offline traz os "?" de volta.
- **VIPs e poderes elementais na tela** (`tools/qa/vip.py`): 3 VIPs com pedidos de gelo, raio, fogo e super-fruta em 390×844, 1024×600 e 900×430; nenhum balão sobreposto nem cortado; figurinos legíveis.

## Handoff do ChatGPT (14/11) — `QA_HANDOFF_CLAUDE_2026-11-14.md`
Ambiente: Chromium 153 (Playwright) com `Math.random` semeado (mulberry32, semente **20261114**) via `add_init_script`, rodando a cópia da branch em `file://` e `http://localhost`. Scripts: `tools/qa/logic.py` (M-02 e M-06), `tools/qa/logic2.py` (M-03, M-04, M-05 e caldeirão), `tools/qa/m08.py`, `tools/qa/oldsave.py`, `tools/qa/pwa2.py` e `tools/qa/untr.py`. Saídas em `docs/qa/2026-11-14/logic-*.json`. **Nada disto é teste no Safari do iPhone.**

| Item | Resultado | Evidência e resumo |
|---|---|---|
| M-06 receitas reproduzidas | **PASS** | Níveis 1, 2, 3, 4, 5, 7, 9 e 12, estratos por número de cruzamentos (0 a 5) e por elemento (E) e super-fruta (H), até 30 alvos × 6 realizações cada, com `cross()` real a partir de `baseFruit()`. Em 100% dos casos: `rk` igual ao alvo, `meets` de espécie ok e `meets` de 1 a 4 atributos (`reqsFrom`) ok. |
| M-06 entrega e dica | **PASS** | Níveis 2, 4, 5, 9 e 12, 25 alvos cada: cliente pedindo o alvo (espécie ou atributos) e fruta realizada entregue com `deliver()` real. 125 de 125 pagas. A dica mostra pelo menos os passos de `recipeOf` (125 de 125). Prints de dica com super-fruta, elemento e 5 passos. |
| M-06 caldeirão real | **PASS** | 20 alvos do nível 9: os dois pais realizados vão para `S.pot` e `brew()` roda de verdade. 20 de 20 filhos atendem espécie e 4 atributos. |
| M-02 distribuição | **PASS, com observações** | 10.000 pedidos por nível, `DIFF` neutro. 0 pedidos impossíveis em 80.000. Profundidade do alvo bate com os pesos: níveis 1–2 com 85/15; 3–4 com 65/32/3; 5 com 55/37/8; 7, 9 e 12 com 45/40/15. Observações: (a) do nível 5 em diante a profundidade 2 nunca sai, o difícil é sempre a 3, com receita de até 5 cruzamentos; (b) pedidos de atributos muitas vezes aceitam uma fruta mais barata que o alvo, então o custo real mínimo é menor. Pedidos que exigem 3 ou mais cruzamentos: 6,2% no nível 5 e cerca de 11,5% do 7 ao 12, contra 8% e 15% nominais. |
| M-07 VIP | **PASS** (mas LOG-02 confirmado) | VIP em 15% dos pedidos a partir do nível 3. A profundidade do VIP é **igual** à dos demais (nível 9: 45/40/15), ou seja, o comentário "VIP pede o mais fundo" não vale mais. Decisão de regra: ChatGPT e Eric. |
| M-03 erro e acerto no mesmo cliente | **PASS, com observação** | 5 entregas erradas ao mesmo cliente com `deliver()` real dão `misses=1` e `streak=-1`; nenhuma moeda; o cliente continua. A entrega certa depois disso paga e leva `streak` a +1 (LOG-03: o acerto apaga o sinal de dificuldade; decidir se é o desejado). |
| M-04 sequências e limites | **PASS, com observação** | 40 acertos dão `wins=30` (limite) e `streak=40`; 40 erros, `misses=30` e `streak=-40`. O `streak` não tem limite, mas o deslocamento é limitado a ±0,15. **LOG-06:** nos níveis 3–6, com `streak` negativo, o peso difícil fica negativo (nível 3, `streak` −5: [0,80, 0,32, −0,12]). Não quebra, mas o médio também cai: nível 3 com `streak` −5 fica em 80/20/0, em vez de 65/32/3 tirando só o difícil. É regra de balanceamento, não corrigi. |
| M-04 Novo Jogo | **PASS** | Fluxo real (2 toques), seguido de recarga: `DIFF` zerado e chave apagada. |
| M-05 save local | **PASS** | Moedas 777, entregas 13, dia 4: recarregar mantém tudo, e `DIFF` também. |
| M-05 importar código | **PASS** (política documentada) | Exportar e importar em outro aparelho restaura o jogo inteiro. **O `DIFF` do aparelho de destino é mantido** (ele não vai no código). Código inválido mostra "Invalid code. Your progress is unchanged." e não muda nada. |
| M-05 save de versões antigas | **PASS** | Saves gravados por `5cf0d73`, `8f67f3a` (produção anterior) e `8133f50` (antes do roadmap) carregam iguais na branch, com 0 erros. A primeira tentativa falhou por erro do script: o `pagehide` regravava o save. Refeito com `oldsave.py`. |
| M-05 nuvem e portal | **PASS** (simulado) | `portal_sdk.py` com o SDK simulado (dados, outro aparelho, mudo, sem módulo de dados) sem erros. O `DIFF` fica no `localStorage` do iframe e não vai para a nuvem. CrazyGames real: **BLOCKED**. |
| M-08 recompensa duplicada | **FAIL → corrigido** (`667a801`) | Ver M-08 na tabela de achados. |
| M-08 pausa | **PASS** | Pausado por 4 s, `S.clock` não anda (tempo e paciência usam `S.clock`); ao retomar, volta a contar. |
| M-08 expiração e clientes simultâneos | **PASS** (comportamento atual) | Com 3 clientes: paciência em 0 não faz o cliente ir embora (ele fica bravo até o fim do dia), como já era. Sem estado preso nas regressões. |
| PWA, versão publicada | **verificado** | Em 14/11 por volta das 8h20, `frutodromo.pages.dev` serve `sw.js` com `frutodromo-v44` e o registro novo do SW. Ou seja, a produção já mudou: tem `c990b92`, mas **não** tem `1a616bf` nem `ca778fd`. Não fui eu que publiquei. A prévia `qa-claude-frutodromo.frutodromo.pages.dev` também está em v44. |
| PWA offline intermitente | **causa provável identificada** | Até `8f67f3a` não havia SW em `pages.dev`, então abrir offline dependia só do cache HTTP do navegador: às vezes funciona, às vezes não. Na branch (`pwa2.py`, perfil persistente): abre online, fecha e reabre offline 3 vezes, todas ok, com save e fonte. Abrir offline sem nunca ter aberto online falha, como esperado. No iPhone: abrir **uma vez online** a versão nova (o app da tela de início tem armazenamento próprio), depois testar offline. |
| Corte do caldeirão em 667×375 e alvos de toque | **PASS** | O corpo não é cortado (QA-05 rebaixado). Toque nas bordas ampliadas acerta ÁRVORE, pausa, menu e ARRUMAR em 844×390, 667×375, 820×1180 e 1024×600. |
| Safari iOS real | **BLOCKED** | Depende do proprietário (roteiro abaixo). |

## Coordenação com o ChatGPT (`js/game.js`)
Mudanças minhas em `js/game.js`: a linha de registro do service worker no fim do arquivo (`fe9a9f0`) e a guarda contra entrega duplicada (`667a801`: `SERVED` antes de `deliver()`, a condição na soltura e `SERVED.add(c)` na entrega certa). Não toquei em dificuldade, pedidos, receitas, dicas nem no formato do save. Em `js/i18n.js`: 3 traduções novas (`ca778fd`). Em CSS: um bloco novo no fim do `style.css` (`c990b92`) e a remoção de uma linha da etapa 8C (`.mk{overflow-wrap:anywhere}`, `1a616bf`). Se o ChatGPT mexer no fim do `game.js`, o conflito é de uma linha.

## Roteiro para o proprietário (iPhone, Dia 4)
Safari primeiro, depois o PWA instalado. Marque OK/falha e mande print do que falhar.
1. Abrir o link de homologação. Confirme antes que ele publica esta branch (QA-10).
2. **QA-04:** a cena (parede, janelas, clientes) aparece normal, sem um véu lilás? Repetir à noite (o céu muda de cor).
3. Novo jogo e tutorial inteiro; arrastar duas frutas ao caldeirão; arrastar a fruta nova até o cliente certo (ela fica visível sobre o balcão o tempo todo?).
4. Entregar fruta errada: aparece o aviso e o "?" pisca; tocar no "?" abre "COMO FAZER?"; ligar e desligar as dicas nos ajustes.
5. Girar para deitado: botões do topo fáceis de tocar (QA-03)? Texto do mesmo tamanho (QA-06)? Caldeirão inteiro (QA-05)?
6. Tocar duas vezes rápido na parede e no texto de um modal: a página dá zoom (QA-07)?
7. Instalar o PWA (Compartilhar → Adicionar à Tela de Início), **abrir uma vez com internet** (para instalar o modo offline da versão nova), jogar um pouco, fechar pelo seletor de apps, abrir de novo: progresso igual? Ativar o modo avião e abrir o PWA: o jogo abre? Repetir 3 vezes.
8. Som: tocar, ir para outro app, voltar: o som volta?
9. Jogar 5 minutos seguidos: algum engasgo ao arrastar ou ao chegar cliente?

## Decisão de escopo do proprietário (14/11/2026)
O Frutódromo é um **jogo de navegador**. Rodar bem no iPhone é um diferencial, mas o celular é jogado **em pé**. O modo deitado só importa para a janela do CrazyGames, ou seja, computador em paisagem (1024×600, 900×430, 1280×680), já coberta pelos testes de Chromium e WebKit.

Consequências:
- **QA-05** (caldeirão em 667×375), o modo deitado no celular e a rotação no meio do jogo saem da lista de pendências: **fora do escopo**.
- **QA-08**: manter `"orientation":"portrait"` no `manifest.json`.
- A correção de toque `c990b92` fica: não atrapalha em pé e ajuda em tablet e notebook com tela de toque.
- O PWA continua útil como extra, mas não é requisito de lançamento.

## iPhone real (Eric) — 14/11/2026
**Ambiente de teste do iPhone:** a prévia da branch, `https://qa-claude-frutodromo.frutodromo.pages.dev`, e não a produção.

Conferido por WebFetch às 8h40:
- a prévia serve o `sw.js` com `frutodromo-v44` e o `game.js` com a guarda de entrega dupla (`SERVED`, `667a801`) e o registro novo do SW;
- `frutodromo.pages.dev` **não está mais na etapa 7**: serve `sw.js` `frutodromo-v44`, e o `game.js` tem `diffTier` mas não tem `SERVED` nem `fixFruitDeco` (197.013 caracteres, igual a `b3ea727`/`e0c4251`). A produção foi trocada para uma versão da etapa 9 anterior às correções de hoje, e não fui eu que publiquei. Quem cuida do Cloudflare precisa confirmar qual branch está em produção.

**Já testado pelo Eric no iPhone real (PASS, relato do proprietário):**
| Item | Resultado |
|---|---|
| Abertura do jogo: cenário e personagens corretos | PASS (iPhone) |
| Arrastar frutas e entregar pedidos | PASS (iPhone) |
| Entrega errada e dica de receita | PASS (iPhone) |
| Fechar e reabrir: progresso preservado | PASS (iPhone) |
| Deitado: visual certo, sem o véu lilás do WebKitGTK (QA-04) | PASS (iPhone, prints com o Eric) |

**Pendentes no iPhone (BLOCKED: dependem do Eric).** Os testes no Chromium e no WebKitGTK não contam como aprovação.

Para os itens que pedem verificação técnica, use a página de diagnóstico **`https://qa-claude-frutodromo.frutodromo.pages.dev/tools/qa/diag.html`**, aberta no Safari, com um print da tela. Ela mostra:
- se o service worker está registrado e controlando a página, a versão (`frutodromo-v44`), os arquivos em cache e os que faltam;
- se a página está aberta como app ou no Safari, o tamanho da janela, o zoom e o `text-size-adjust`.

Limitação: no iOS, o app da tela de início tem armazenamento separado do Safari, e de dentro dele não dá para abrir essa página. No app instalado, o teste é só de comportamento.

| # | Item | Status | Procedimento (iPhone) | Passa se |
|---|---|---|---|---|
| 1 | **PWA offline (extra, não bloqueia o lançamento)** | Testado pelo Eric antes da v44: 1 falha e 1 sucesso. Causa provável: versão sem SW. Reteste na prévia v44: BLOCKED | (a) Apagar o ícone antigo do Frutódromo da tela de início, porque o antigo pode ter sido instalado de uma versão sem SW. (b) No Safari, abrir a prévia, esperar o jogo carregar, abrir o `diag.html` e tirar print: "Service worker registrado", "Faltando no cache: nenhum". (c) Compartilhar → Adicionar à Tela de Início. (d) Abrir **pelo ícone** com internet, entrar no jogo, jogar 30 s. (e) Fechar o app de verdade: deslizar para cima no seletor de apps. (f) Ativar o modo avião e abrir **pelo ícone**. (g) Repetir (e) e (f) 3 vezes. (h) Repetir abrindo pelo **Safari** em modo avião, anotando a origem de cada tentativa. | Abre nas 3 tentativas pelo ícone, com progresso. Se falhar: print da tela de erro, anotar se foi pelo ícone ou pelo Safari, quanto tempo depois do passo (d) e se o ícone foi instalado antes ou depois de abrir a prévia online. |
| 2 | **Service worker: versão, atualização e offline após fechar** | BLOCKED | Print do `diag.html` no Safari em 3 momentos: online, depois do jogo aberto e em modo avião. Atualização: quando houver um commit novo na branch, abrir o app **online** uma vez, fechar e reabrir. | `diag.html` mostra `frutodromo-v44` (ou a versão nova), "Controlando esta página: true" e "Faltando no cache: nenhum". Offline, a página e o jogo abrem. |
| 3 | **Deitado 667×375 (iPhone SE ou tela equivalente)** | **Fora do escopo** (celular só em pé) | Deitar o aparelho com o jogo aberto, print. Arrastar 2 frutas ao caldeirão, tocar no caldeirão para devolver uma, cruzar. | O corpo do caldeirão aparece inteiro (no Chromium só o rótulo e o brilho passam 12 px: QA-05) e responde ao toque. Num iPhone maior que o SE, a tela deitada não chega a 667×375: anotar o modelo. |
| 4 | **Áreas de toque deitado** | **Fora do escopo** no celular; em pé já passa (40 px desde a etapa 5) | Deitado, tocar **na borda** (não no centro) de ÁRVORE, pausa, menu e ARRUMAR, 5 vezes cada. | Cada toque abre o botão certo, sem acionar o vizinho. |
| 5 | **Zoom de toque duplo e texto ao girar (QA-06, QA-07)** | BLOCKED | No Safari e no app: tocar duas vezes rápido na parede, no balcão, nas etiquetas do topo e no texto de um modal; girar de retrato para deitado e voltar. | A página não dá zoom (o `diag.html` mostraria "zoom" diferente de 1.00) e o texto não fica maior depois de girar. Se acontecer, a correção é uma linha de CSS cada (proposta em QA-06 e QA-07). |
| 6 | **Segundo plano e abertura pelo ícone** (rotação fora do escopo) | BLOCKED | Pelo ícone: jogar, ir para a tela de início por 1 minuto e voltar; receber ou simular uma notificação; trancar a tela por 1 minuto e voltar. | Volta pausado, o som volta ao continuar, a fruta não some nem fica presa, e o layout se ajusta à nova orientação. |
| 7 | **Desempenho real** | BLOCKED | Jogar 10 minutos seguidos pelo ícone, com 3 clientes e o caldeirão em uso. Anotar engasgos no arraste, demora quando chega cliente, aquecimento e a bateria antes e depois. Opcional, se houver um Mac: Safari → Desenvolvedor → iPhone → Timeline. | Sem engasgo perceptível no arraste, sem travar na chegada de cliente, aquecimento normal. Qualquer engasgo: anotar o momento e o que estava na tela. |

## Tarefas do CrazyGames (`TAREFAS_CRAZYGAMES.md`)
### 1. Volume de música e efeitos — PASS, com observação
Script: `tools/qa/audio.py`. Ambiente: Chromium; um `AnalyserNode` colocado antes da saída de áudio; volumes padrão (música 60, efeitos 80). Saída em `docs/qa/2026-11-14/audio.json`. Valores em dBFS.

| Som | Pico | Média (RMS) |
|---|---|---|
| plop (fruta no caldeirão) | −25,2 | −36,5 |
| dex (espécie nova) | −22,5 | −37,0 |
| lvl, day | −26,7 | −37,5 |
| pop, mut | −26,8 / −27,4 | −38,3 / −38,8 |
| open | −29,6 | −39,9 |
| brew, coin, bad | −25,3 / −29,9 / −27,2 | −40,5 / −40,9 / −40,9 |
| buy, bag, bagc, bell | −28,7 / −28,7 / −29,9 / −27,7 | −41,1 / −41,4 / −41,9 / −42,0 |
| close, sel | −31,1 / −29,9 | −42,9 / −43,0 |
| fire | −31,6 | −45,0 |
| música chiptune | −27,3 | −43,9 |
| música lo-fi | −23,8 | −39,7 |

- **Consistência: PASS.** Todos os efeitos ficam a no máximo 4,5 dB da mediana (−40,9). As duas músicas ficam abaixo dos efeitos principais, como deve ser, e a lo-fi é 4 dB mais alta que a chiptune.
- **Observação:** o jogo inteiro é baixo. O pico máximo é −22,5 dBFS, enquanto jogos de navegador costumam ficar entre −6 e −12. Se o Eric achar baixo no computador, dá para subir o volume geral uns 6 dB sem desequilibrar nada. Isso é decisão de gosto, por isso não mudei.
- A chuva não foi medida: só toca com o clima real ligado, e o clima fica desligado no portal.

### 4. Sombras borradas → degraus de pixel — PASS
- **O que mudou:** as sombras das etapas 7 e 8 com desfoque viraram faixas duras de 2 px:
  - cabeçalho e feira;
  - brilho da fruta-alvo ao arrastar, da fruta brilhante e da fruta nova;
  - faíscas do caldeirão.
- **Grade de pixel:** os deslocamentos de 1 e 3 px foram para 2 e 4 px (`.rq.y`, `.rq.n`, `.mk.rare`, `.cust.come`).
- **Teste:** nenhum `box-shadow`, `drop-shadow` ou `text-shadow` com desfoque sobra no CSS (varredura por expressão regular).
- **Evidência:** antes e depois em `docs/qa/2026-11-14/sombras-*.png`.
- **Desempenho no Chromium, CPU 4×, 393×760, 2 rodadas:** igual à stage9 original (mediana 16,7 ms, nenhum quadro acima de 33 ms ao arrastar).

### 5 e 6. Tutorial: "Pular tutorial" e mãozinha animada — PASS (Chromium)
- **PULAR TUTORIAL** ("SKIP TUTORIAL" em inglês) em todos os passos: um toque marca os 4 passos como feitos e salva. Depois de recarregar, o tutorial não volta. "Rever tutorial" nos ajustes recomeça do passo 1. A área de toque é de 79×40.
- **Mãozinha em pixel art** (gerada por código, escala 3x, posições em px pares, sem bloquear o toque):
  - no passo 1, sai da fruta mais perto do caldeirão e vai até ele;
  - no passo 2, sai de uma fruta que atende um cliente e vai até o balão desse cliente;
  - a fruta vai junto, meio transparente;
  - some enquanto o jogador arrasta, com modal aberto e com a aba escondida;
  - com movimento reduzido, fica parada sobre a fruta.
- **Teste** (`tools/qa/tuthand.py`, 390×844 pt, 1024×600 en, 900×430 pt e 390×844 com movimento reduzido): passou, com 0 erros. Prints em `docs/qa/2026-11-14/tutorial-maozinha-*.png`.
- **Regressão:** smoke, primeiros minutos (o tutorial não cobre frutas), portal com SDK e direto, `regress.py` nos 6 tamanhos, `untr.py` (0 textos em português no inglês) e `m08.py` (1 pagamento), todos sem erros. Cache sobe para `v45`.

## Pendências
- iPhone real (todo o roteiro acima).
- Firefox não testado: o ambiente não tem o navegador.
- QA-05, QA-06, QA-07 e QA-08 dependem do teste ou da decisão do proprietário.
