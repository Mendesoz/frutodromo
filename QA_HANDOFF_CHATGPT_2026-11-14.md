# Handoff QA — Claude → ChatGPT/Codex (14/11/2026)

Branch: `qa-claude-frutodromo` (PR #24 contra `stage9-dynamic-difficulty`). Não alterei a `main` e não publiquei nada. Detalhes, evidências e scripts: `QA_CLAUDE.md`, `docs/qa/`, `tools/qa/`.

## Decisão do proprietário (Eric, 14/11)
- O Frutódromo é **jogo de navegador**. **Próximo marco: lançar no CrazyGames.** O iPhone fica para depois do lançamento.
- No celular o jogo é **em pé**. Paisagem só importa na janela do CrazyGames (computador). A paisagem no celular saiu do escopo.
- O PWA offline é um extra e não bloqueia o lançamento.

## O que o Claude fechou
| Commit | O quê |
|---|---|
| `fe9a9f0` | Service worker registra em qualquer `https` (antes, só em `github.io`); cache v44; nunca no portal |
| `c990b92` | Área de toque de 40 px nos botões do topo e no ARRUMAR em telas largas de toque |
| `1a616bf` | Feira em inglês sem palavras partidas (MARKE/T, Strawberr/y): removida a regra da 8C |
| `667a801` | **M-08:** cliente já atendido não paga de novo (2ª fruta nos 900 ms antes de ele sair). Usa `WeakSet` em memória, sem campo novo no save |
| `ca778fd` | Textos do modo dica que ficavam em português no inglês |
| `27bcafd`, `d89f8e5`, `69db8e8`, `72ba853` | Relatórios e evidências: M-02 a M-08 executados no navegador com RNG semeado; iPhone real (relato do Eric); escopo |

**Resultados no navegador** (Chromium e WebKitGTK; não substituem o iPhone):
- receitas de 0 a 5 cruzamentos 100% reproduzidas (inclusive com elemento e super-fruta);
- entrega real 125/125, dica 125/125, caldeirão real 20/20;
- 0 pedidos impossíveis em 80 mil;
- saves de versões antigas carregam;
- desempenho sem piora e memória estável.

**No iPhone real (Eric):** abertura, arraste e entrega, entrega errada e dica, fechar e reabrir e o visual passaram, sem o véu lilás.

## Para o ChatGPT/Codex decidir ou fazer (lógica, receitas, dificuldade, saves)
Nada disso foi alterado pelo Claude: são regras de jogo, que precisam de aprovação do Eric.
1. **LOG-01:** do nível 5 em diante a profundidade 2 nunca é pedida. O difícil pula para a 3, com receitas de até 5 cruzamentos.
2. **LOG-02:** o VIP pede na mesma profundidade dos outros clientes, embora o comentário diga "o mais fundo".
3. **LOG-03:** um acerto depois de um erro com o mesmo cliente zera o sinal de dificuldade (`streak` passa a +1).
4. **LOG-06:** nos níveis 3 a 6, com `streak` negativo, o peso do difícil fica negativo, e por isso o médio também cai. No nível 3 com `streak` −5 a distribuição fica 80/20/0.
5. **LOG-04 (política):** o `DIFF` é por aparelho. Importar um código mantém o `DIFF` do aparelho de destino. Documentar ou mudar.
6. **Coordenação em `js/game.js`:** o Claude só mexeu no registro do SW (fim do arquivo) e na guarda `SERVED` (em volta de `deliver()` e na condição de soltura no cliente). A `qa-chatgpt-logic` partiu de `b3ea727`: rebase sobre `origin/qa-claude-frutodromo`.
7. **Produção:** às 8h40 de 14/11, `frutodromo.pages.dev` servia v44 com a etapa 9, mas **sem** as correções de hoje (`SERVED` e i18n). Não foi o Claude que publicou. Confirmar no Cloudflare qual branch está em produção.

## O que falta para lançar no CrazyGames
| # | Item | Dono | Situação |
|---|---|---|---|
| 1 | Fechar LOG-01, 02, 03 e 06: manter como está ou ajustar | Eric + ChatGPT | aberto |
| 2 | Rebase da `qa-chatgpt-logic`, merge do PR #24 na `stage9`, PRs de lógica por cima | ChatGPT + Claude (revisão) | aberto |
| 3 | Regressão final na branch candidata: `tools/qa/` (smoke, regressão em 6 tamanhos, `logic.py`, `m08.py`, `untr.py`, `mkfit.py`, portal) | Claude | rodar quando a candidata existir |
| 4 | Gerar o zip do portal da candidata (`python3 tools/build_portal.py`) e testar no QA Tool do CrazyGames: `gameplayStart`, mudo, Data Module, sem requisições externas além do SDK | Claude gera e testa local; Eric sobe | o zip de `qa-claude-frutodromo` já passa local: 128 KB, a única requisição externa é `sdk.crazygames.com`, `portal_sdk.py` e `portal_direct.py` sem erros |
| 5 | **Capas e vídeo novos**: os de `docs/crazygames/` são de antes do roadmap visual e não mostram o visual novo (cenário, caldeirão, personagens, interface). A recusa anterior foi por qualidade, então a página precisa refletir o jogo atual | Claude (prints e vídeo do jogo) + Eric (aprova) | aberto |
| 6 | Texto da página (`docs/crazygames/pagina.md`): revisar o que mudou (dicas, VIPs com figurino, dificuldade adaptativa) | ChatGPT ou Claude | aberto |
| 7 | Merge na `main` e produção, só com aprovação do Eric | Eric | depois de 1 a 6 |
| 8 | Reenviar ao CrazyGames | Eric | depois de 7 |
| — | iPhone (zoom de toque duplo, segundo plano, 10 min de desempenho, PWA offline na v44) | Eric | **depois do lançamento** |
