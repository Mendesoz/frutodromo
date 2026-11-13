# ROADMAP — Frutódromo (contexto para Claude)

Atualizado em 2026-11-13. Fonte de contexto compartilhado: https://github.com/Mendesoz/ai-game-studio/blob/main/projects/FRUTODROMO.md

## Regras
Preservar `main`; implementar/testar em branch separada; pedir aprovação para novas etapas; diferenciar revisão estática de teste real. O usuário quer um link fixo de testes e relatório auditável de todas as etapas.

## Etapas recentes
- 6B: figurinos VIP aprovados; `7286c9ce730cd45723d8ac980eeb887c4a559795` (`stage6b-vip-costumes`).
- 7: polimento visual aprovado pelo usuário após teste no iPhone; branch `stage7-visual-polish`.
- 8A: feedback visual, `b74d5c`; 8B: reações, `28db06e`; 8C: responsividade, `e3a826d`; testes individuais não confirmados.
- Correção de receitas e modo dica: `8f67f3a934d72eac16b2bb2840217f12658ee401`. Usuário testou e confirmou funcionamento. Não confundir com QA exaustivo.
- 9: dificuldade gradual e dinâmica, commit `dec8ca1c239850d6562d688a44aa0f415b6eee14`, branch `stage9-dynamic-difficulty`. Código implementado, verificações estáticas feitas; **ainda sem testes reais e sem deploy confirmado**.

## Etapa 9 — decisão aprovada
- Níveis 1–2: 85% fácil, 15% médio, 0% difícil.
- Níveis 3–4: 65% / 32% / 3%.
- Níveis 5–6: 55% / 37% / 8%.
- Níveis 7+: 45% / 40% / 15%.
- Adaptação dinâmica por sequência de acertos/erros, limitada a ±15 pontos percentuais.
- Manter os tempos atuais dos clientes.
- Preservar pedidos possíveis, frutas malucas, entregas válidas e opção de dicas.
- Percentuais representam pesos de categorias, não medições reais. VIPs usam regra própria de profundidade. Validar distribuição e diversão.

## Próximas ações
1. Inspecionar `js/game.js`, especialmente `reachPool`, `newCust`, `diffTier`, `diffRecord`, `showHint`, `deliver`, `brew`.
2. Testar sintaxe, jogo no navegador e no iPhone/PWA, pedidos e adaptação por nível.
3. Registrar evidências e corrigir eventuais falhas antes de aprovar deploy.
4. Para publicar no link fixo `https://frutodromo.pages.dev/`, verificar a branch de produção configurada na Cloudflare; não presumir que a branch 9 esteja publicada.
5. Levantar commits históricos das etapas 1–6A para auditoria completa, sem inventar detalhes.

Jogo principal: https://mendesoz.github.io/frutodromo/ — não alterar sem autorização.
