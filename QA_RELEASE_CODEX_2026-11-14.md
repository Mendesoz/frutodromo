# Fechamento CrazyGames — Codex, 14/11/2026

## Escopo aprovado pelo Eric
Corrigir apenas LOG-06. Manter nesta versão LOG-01 (profundidades), LOG-02 (VIP), LOG-03 (erro e acerto como eventos) e LOG-04 (DIFF por aparelho). Não migrar saves.

## Correção
`diffTier()` limita a transferência de probabilidade ao peso disponível dos difíceis. Quando os difíceis chegam a zero, a adaptação para; os médios mantêm sua proporção.

| Níveis, sequência −5 | Antes: fácil/médio/difícil | Depois |
|---|---|---|
| 3–4 | 80/20/0% (peso difícil interno −12%) | 68/32/0% |
| 5–6 | 70/30/0% (peso difícil interno −7%) | 63/37/0% |
| 7+ | 60/40/0% | 60/40/0% |

Pesos neutros, adaptação positiva, níveis iniciais, tempos de clientes, receitas, VIPs e persistência mantidos.

## Testes executados pelo Codex
- `node --check js/game.js` e `node --check js/i18n.js`: PASS.
- `node --test tests/difficulty.test.cjs`: 7/7 PASS. O teste executa `diffTier()` extraída do arquivo real; 3 dos 7 casos falhavam antes da correção. Cobre bases neutras, adaptação positiva, limites negativos e sequências de −40 a +40 nos níveis 3–12. Mede categorias selecionadas, não profundidade mínima das receitas.
- Playwright com Microsoft Edge/Chromium no Windows, sem janela: 393×760, 1024×600, 900×430 e 1280×680. Compra pela feira, arraste de duas frutas ao caldeirão, mistura concluída, entrega por arraste a um pedido real, venda, avanço de dia e recarga com moedas, entregas, dia, frutas e árvore preservados: PASS nos quatro tamanhos, zero erros de página/console.
- Para entregar, o harness reconstrói uma fruta que satisfaz o alvo do cliente com as funções reais e a insere na mesa; a entrega usa ponteiro real. O teste não mede o fluxo completo de aquisição de cada ingrediente dessa receita.
- Resultado da checagem de navegador: `docs/qa/2026-11-14/codex-smoke.json`. Harness de navegador executado fora do repositório para não alterar os scripts em `tools/qa/` do Claude.
- Não executados pelo Codex: Safari/iPhone real, QA Tool do CrazyGames e regressão final do zip integrado. Esses pontos não são declarados aprovados por este relatório.

## Texto da página
`docs/crazygames/pagina.md` revisado em inglês e português: dicas opcionais, VIPs com figurino, adaptação e controles. Retiradas promessas de genética/árvore infinitas e de cliente ir embora quando perde a paciência. Retrato é a orientação do telefone; paisagem refere-se à janela desktop do portal.

## Candidata e próximos passos
A branch `codex/crazygames-final-logic` reúne as atualizações de `qa-claude-frutodromo`, os dois documentos de lógica anteriores e esta correção. Ela permite executar a tarefa 9 sem promover `main` ou `stage9`.

Claude: conferir a candidata fixada pelo SHA divulgado no PR/centralizador; executar regressão final, gerar o zip e registrar evidências. Se houver atualização do código que precise ir para o site/PWA, o responsável pelo SW deve ajustar o cache na integração final; o Codex preservou `sw.js` conforme a divisão de arquivos. O build do portal é separado.

Eric: aprovar capas e vídeos atuais, integração final e envio. Nenhum merge em `main`/`stage9` ou publicação foi feito por esta tarefa.
