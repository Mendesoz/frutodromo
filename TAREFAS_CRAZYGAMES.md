# Tarefas para reenviar ao CrazyGames (14/11/2026)

O Eric aprovou estas tarefas em 14/11. Elas vêm da comparação com o guia de qualidade do CrazyGames (`QA_CLAUDE.md`, seção do guia) e estão na ordem do mais fácil para o mais difícil.

**Regra de convivência:** cada um mexe só nos arquivos e nas funções da sua linha. Branch do Claude: `qa-claude-frutodromo`. Branch do ChatGPT: `qa-chatgpt-logic`, que deve passar por rebase sobre a do Claude antes de começar. Nada vai para a `main` nem para a produção sem aprovação do Eric.

| Ordem | Tarefa | Dono | Arquivos e áreas | Pronto quando |
|---|---|---|---|---|
| 1 | Medir o volume de música e efeitos (pico e média de cada som e da música) | **Claude** | só medição (`tools/qa/`) | tabela no `QA_CLAUDE.md`; se algum som destoar mais de 6 dB, propor ajuste |
| 2 | Texto da página do CrazyGames em inglês e português: dicas, VIPs com figurino, dificuldade que se adapta, controles (arrastar e tocar) | **ChatGPT** | `docs/crazygames/pagina.md` | texto revisado, curto e fiel ao jogo |
| 3 | Fechar as decisões LOG-01, 02, 03, 04 e 06 com o Eric, implementando só se ele aprovar | **ChatGPT** | `js/game.js`: `diffTier`, `newCust`, `diffRecord`, `DIFF` | decisão registrada; testes `tools/qa/logic.py` e `logic2.py` passando |
| 4 | Trocar as sombras borradas das etapas 7 e 8 por sombras em degraus de pixel (cabeçalho, feira, retratos, balões) | **Claude** | `css/style.css` | nenhum `box-shadow` ou `drop-shadow` com desfoque na interface do jogo; prints antes e depois |
| 5 | Botão "Pular tutorial" (um toque encerra os 4 passos) | **Claude** | `js/game.js`: `TUT`, `tutStep`, `tutPlace`; `css/style.css` `#tut`; `js/i18n.js` | pula tudo de uma vez, fica salvo e "Rever tutorial" nos ajustes continua funcionando |
| 6 | Mãozinha animada em pixel art mostrando o gesto: fruta até o caldeirão (passo 1) e até o cliente (passo 2) | **Claude** | mesmas áreas do item 5 | aparece só no tutorial, some ao arrastar, fica parada com movimento reduzido, não bloqueia o toque |
| 7 | Capas novas (1920×1080, 800×1200, 800×800) e vídeo de prévia com o visual atual | **Claude** (gera) e **Eric** (aprova) | `docs/crazygames/` | capas e vídeo mostrando o jogo como ele está hoje — **gerado em 14/11, aguardando aprovação do Eric** |
| 8 | Integração: rebase, merge do PR #24 na `stage9` e PRs de lógica por cima | **ChatGPT** (Claude revisa) | branches | candidata única |
| 9 | Regressão final na candidata e zip do portal (`tools/build_portal.py`) | **Claude** | `tools/qa/`, `dist/` | tudo PASS; zip pronto para o QA Tool do CrazyGames |
| 10 | Merge na `main`, publicação e reenvio ao CrazyGames | **Eric** | — | depois dos itens 1 a 9 |

**Fica para depois do lançamento:** iPhone (zoom de toque duplo, volta do segundo plano, 10 minutos de desempenho, PWA offline na v44).

**ChatGPT, não mexa em:** `css/style.css`, tutorial (`TUT`, `tutStep`, `tutPlace`, `tutClear`), `sw.js`, `tools/qa/`.
**Claude, não mexe em:** dificuldade, pedidos, receitas, save, `docs/crazygames/pagina.md`.
