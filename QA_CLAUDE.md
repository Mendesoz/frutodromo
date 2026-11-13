# QA Claude — interface, responsividade, Safari/iPhone, PWA e desempenho

Branch: `qa-claude-frutodromo`, criada a partir de `stage9-dynamic-difficulty` (`9cf9575`). `main` não foi alterada e nada foi publicado.
Plano de referência: `ai-game-studio/projects/FRUTODROMO_FINISH_PLAN.md`. Dia 1 (inventário) e parte do Dia 2 (correções de interface).
Última atualização: 13/11/2026.

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
| QA-04 | P1 a confirmar | `css/style.css` `#sky` (`mix-blend-mode:multiply`), `#lamp` (`screen`) | WebKit com compositing acelerado: abrir o jogo | Cena com parede, janelas, clientes | Cena inteira coberta por um lilás opaco (clientes, balões e fantasma do arraste somem). Com `WEBKIT_DISABLE_COMPOSITING_MODE=1` a cena aparece certa. Página mínima com o mesmo blend funciona | `webkit-composited-ceu-opaco.png` × `webkit-sem-compositing-ok.png` | Sim no WebKitGTK; **não testado no iPhone** | Provável defeito do WebKitGTK sob Xvfb (GL por software). O proprietário aprovou a etapa 7 no iPhone, o que sugere que o Safari real está certo. Confirmar no iPhone (roteiro, item 2). Se falhar lá: trocar o blend por `opacity` no `#sky`/`#lamp` | — |
| QA-05 | P2 | `js/game.js` `fitScene`, `ZMIN` | iPhone SE deitado (667×375) | Caldeirão inteiro na mesa | Mesa de 114 px e caldeirão de 126 px: os pés do caldeirão saem 12 px pela base; com 6 frutas grandes a mesa fica apertada. Em 844×390 cabe (mesa 129 px) | `iphone-se-deitado-667x375.png` | Sim (Chromium) | Não corrigido: mexe na regra de altura da cena, que também afeta a janela do CrazyGames. Proposta para o Dia 2/3, se o proprietário jogar deitado: cena mínima menor só abaixo de 400 px de altura | — |
| QA-06 | P2 risco | `css/style.css` (`html`) | iPhone: girar para deitado | Texto do mesmo tamanho | Sem `-webkit-text-size-adjust`; o Safari pode aumentar texto ao girar | — | **Não testado** (só acontece no iOS) | `html{-webkit-text-size-adjust:100%}` se o proprietário vir texto crescer | — |
| QA-07 | P2 risco | `css/style.css` | iPhone: tocar duas vezes rápido em área sem botão (etiquetas do topo, parede da cena, texto de modal) | Nada | Pode dar zoom de duplo toque: só botões, cartões, clientes e frutas têm `touch-action` | — | **Não testado** (Chromium não emula) | `html{touch-action:manipulation}` (mantém o gesto de pinça) se o proprietário confirmar | — |
| QA-08 | P2 | `manifest.json` `"orientation":"portrait"` | Instalar o PWA no Android e girar | Combinar com o jogo, que suporta deitado | Android trava em retrato; o iOS ignora | — | Estático | Decisão do proprietário: manter, ou trocar para `"any"` | — |
| QA-09 | Info | `css/style.css` (etapas 7–8) | Leitura do diff `5cf0d73..9cf9575` | — | As etapas 7–8 reintroduziram sombras com desfoque no cabeçalho e na feira, `drop-shadow` em retratos e balões e bordas internas de 3 px, contra a regra de pixel inteiro da etapa 5. Aprovado pelo proprietário no iPhone (etapa 7). Desempenho medido sem piora (abaixo) | leitura | Sim | Nenhuma ação | — |
| QA-10 | Info | — | Conferir qual branch `frutodromo.pages.dev` publica | — | Não verificado: o acesso ao site pedia aprovação e ninguém respondeu | — | **Não** | Proprietário confirma na Cloudflare antes do teste no iPhone | — |

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

## Coordenação com o ChatGPT (`js/game.js`)
Única mudança minha em `js/game.js`: a linha de registro do service worker no fim do arquivo (`fe9a9f0`). Não toquei em dificuldade, pedidos, receitas, dicas nem save. Em CSS, só acrescentei um bloco no fim do `style.css` (`c990b92`). Se o ChatGPT mexer no fim do `game.js`, o conflito é de uma linha.

## Roteiro para o proprietário (iPhone, Dia 4)
Safari primeiro, depois o PWA instalado. Marque OK/falha e mande print do que falhar.
1. Abrir o link de homologação. Confirme antes que ele publica esta branch (QA-10).
2. **QA-04:** a cena (parede, janelas, clientes) aparece normal, sem um véu lilás? Repetir à noite (o céu muda de cor).
3. Novo jogo e tutorial inteiro; arrastar duas frutas ao caldeirão; arrastar a fruta nova até o cliente certo (ela fica visível sobre o balcão o tempo todo?).
4. Entregar fruta errada: aparece o aviso e o "?" pisca; tocar no "?" abre "COMO FAZER?"; ligar e desligar as dicas nos ajustes.
5. Girar para deitado: botões do topo fáceis de tocar (QA-03)? Texto do mesmo tamanho (QA-06)? Caldeirão inteiro (QA-05)?
6. Tocar duas vezes rápido na parede e no texto de um modal: a página dá zoom (QA-07)?
7. Instalar o PWA (Compartilhar → Adicionar à Tela de Início), jogar um pouco, fechar pelo seletor de apps, abrir de novo: progresso igual? Ativar modo avião e abrir o PWA: o jogo abre?
8. Som: tocar, ir para outro app, voltar: o som volta?
9. Jogar 5 minutos seguidos: algum engasgo ao arrastar ou ao chegar cliente?

## Pendências
- iPhone real (todo o roteiro acima).
- Firefox não testado: o ambiente não tem o navegador.
- QA-05, QA-06, QA-07 e QA-08 dependem do teste ou da decisão do proprietário.
