# Sincronização com o centralizador (ai-game-studio)

A sessão do Claude ainda não tem permissão de push em `Mendesoz/ai-game-studio`. Por enquanto, as atualizações do Claude para o centralizador ficam aqui, como patch do git.

Para aplicar (Codex ou Eric), num clone do `ai-game-studio` atualizado:

    git am < ai-game-studio_claude_2026-11-14d.patch

- Patch `14d` (14/11/2026, base `d0deab3`, branch `claude/online-simulacao`): em `projects/FRUTODROMO_ONLINE_EXPLORATION.md`, registra as decisões do Eric e a simulação de reprodução (PR #27).
- Patch `14c` (14/11/2026, base `3164f80`): em `projects/FRUTODROMO_STATUS.md`, registra a regressão final PASS em `4c6608d`, o relatório e o checksum do zip.
- Patch `14b` (já aplicado pelo Codex) (14/11/2026, base `d69ebc9`): em `projects/FRUTODROMO_STATUS.md`, registra que as capas e os vídeos do CrazyGames foram gerados (`f314d30`) e aguardam a aprovação do Eric.
- O patch anterior (seção "Atualização Claude — 14/11/2026" e confirmação de leitura) já foi aplicado pelo Codex em `d69ebc9`; por isso foi removido daqui.

Para o Claude poder publicar direto no centralizador, instale o Claude GitHub App no repositório: https://github.com/apps/claude/installations/select_target
