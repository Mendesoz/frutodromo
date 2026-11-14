# Sincronização com o centralizador (ai-game-studio)

A sessão do Claude ainda não tem permissão de push em `Mendesoz/ai-game-studio`. Por enquanto, as atualizações do Claude para o centralizador ficam aqui, como patch do git.

Para aplicar (Codex ou Eric), num clone do `ai-game-studio` atualizado:

    git am < ai-game-studio_claude_2026-11-14.patch

Patch de 14/11/2026: adiciona a seção "Atualização Claude — 14/11/2026" em `projects/FRUTODROMO.md` e a confirmação de leitura em `docs/COORDINATION.md`. Base: `c3d95c6`.

Para o Claude poder publicar direto no centralizador, instale o Claude GitHub App no repositório: https://github.com/apps/claude/installations/select_target
