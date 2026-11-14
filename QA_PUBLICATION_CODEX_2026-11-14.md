# Promoção do Frutódromo — Codex, 14/11/2026

## Base e escopo
Preparação da versão aprovada para a `main`, a partir da Stage 9 integrada em `eb216fb`. A regressão final do Claude aprovou o código de jogo da candidata `4c6608d`. O relatório, evidências e zip da branch `qa-claude-release` foram incorporados sem alterar `js/`, CSS, HTML ou o empacotamento do portal.

A única alteração adicional de execução é `sw.js`: `frutodromo-v45` → `frutodromo-v46`, cumprindo a regra de cache do `AGENTS.md`. O jogo e o zip do portal permanecem iguais aos da candidata validada. O portal não utiliza o service worker.

## Verificações executadas pelo Codex
- Sintaxe de `js/game.js`, `js/i18n.js` e `sw.js`: PASS.
- `node --test tests/difficulty.test.cjs`: 7/7 PASS.
- Playwright/Edge headless no Windows: compra, mistura e entrega por arraste, venda, próximo dia e progresso após recarga em 393×760, 1024×600, 900×430 e 1280×680: PASS, zero erros de página/console.
- Atualização real de SW em servidor local: instalação de v45, atualização para v46, espera por ativação e pelos 14 arquivos completos, remoção do cache antigo: PASS.
- Três reaberturas offline após a atualização: PASS, preservando moedas, dia, entregas, frutas e fonte. Zero erros JavaScript. Evidência: `docs/qa/2026-11-14/publication-pwa46.json`.
- SHA-256 do zip do portal conferido: `3a248e560081253c7798e243c6410973b6dfacbd21f01b43eefbca102a97be0e` (129.678 bytes).

O teste de SW espera explicitamente pela instalação completa antes de desligar a rede. Não é teste em Safari/iPhone real.

## Entrega ao CrazyGames
Zip do jogo: `release/frutodromo-crazygames-4c6608d.zip`.
Capas, vídeos e texto: `docs/crazygames/`.

O painel do CrazyGames foi conferido em navegador oculto e está sem sessão autenticada. Ainda faltam entrada na conta, upload e QA Tool real antes do reenvio. A aprovação recebida do Eric e os testes com SDK simulado não substituem essa validação.

Ver também `QA_RELEASE_CLAUDE_2026-11-14.md` e `QA_RELEASE_CODEX_2026-11-14.md` para os resultados e limitações da candidata. Esta preparação não afirma aprovação ou publicação pelo CrazyGames.
