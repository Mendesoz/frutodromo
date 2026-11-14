# Handoff QA — ChatGPT → Claude (2026-11-14)

Branch: `qa-chatgpt-logic`, baseada em `qa-claude-frutodromo`. Não modificar `main`, não publicar nem fazer merge sem aprovação do proprietário.

## Executado por ChatGPT
- Inspeção de `js/game.js`: geração usa `reachPool(L)`, requisitos derivados de um alvo do pool; `diffRecord` bloqueia falhas duplicadas do mesmo cliente, mas registra acerto após falha; DIFF persiste em `localStorage.frutodromo_difficulty`, fora de `S`; comentário VIP promete maior profundidade, código não impõe.
- Simulação isolada de 300.000 sorteios dos pesos da dificuldade: nível 3 (64,73/32,21/3,06%), nível 5 (54,74/37,29/7,97%), nível 9 (44,65/40,39/14,97%). Isto NÃO mede a profundidade efetiva de pedidos.
- Teste executado em JS extraído do código real, não no navegador: `reachPool`, `recipeOf`, `reqsFrom`, `meets`, `predictSt`, `inh`, `baseFruit`, etc. Níveis 1,2,3,4,5,7,9,12: respectivamente 43,53,962,1436,8325,8325,8325,8325 itens no pool (35.794 verificações de cadeias de receita); 0 dependências quebradas, 0 requisitos contraditórios. Mais 1.000 pedidos simulados por nível (8.000 no total), 0 alvos impossíveis. Isso valida propriedades da geração, NÃO a entrega pelo caldeirão em execução.
- Nenhuma correção de mecânica aplicada.

## Claude — próximos testes, com evidências
1. **M-06, prioritário:** em navegador, construir as receitas de pedidos via `recipeOf` e efetuar `cross` com frutas reais, verificando `rk`, `meets`, entrega e dica; cobrir níveis 1,2,3,4,5,7,9,12, elementos e hero; registrar sementes, amostras, divergências e screenshots/logs.
2. **M-02:** medir >=10.000 pedidos por nível com `DIFF` neutro, registrar profundidade do alvo `td`, profundidade mínima de receita que satisfaz requisitos, VIP/não-VIP e distribuição observada; comparar com os pesos esperados, explicar desvios sem alterar balanceamento automaticamente.
3. **M-03/M-04:** 5 entregas erradas ao mesmo cliente e depois acerto; sequências de acerto/erro, `streak`, limites de pesos, Novo Jogo e reset de DIFF.
4. **M-05:** saves local, importação, nuvem/portal quando ambiente disponível, verificar isolamento e reset do histórico DIFF; não alterar formato do save sem aprovação.
5. **M-07/M-08:** VIP profundidade, pedidos simultâneos, expiração, pausa, ausência de recompensa duplicada.
6. **PWA/iPhone:** verificar se versão corrigida de `sw.js` e registro SW foi de fato publicada em homologação; teste offline após inicialização online, fechar/reabrir, e teste de abertura direta offline. Relato do usuário: PWA instalado no iPhone já tinha sido aberto online; em uma tentativa offline falhou, em outra funcionou. Intermitência ainda não reproduzida na branch QA. Testar corte do caldeirão em 667×375 e touch targets; Safari iOS real depende do usuário.

## Entrega solicitada
- Atualizar `QA_CLAUDE.md` com PASS/FAIL/BLOCKED, ambiente, passos de reprodução, logs e commits.
- Corrigir apenas bugs efetivamente reproduzidos em branch QA, sem adicionar funcionalidades.
- Comunicar qualquer decisão de regra de balanceamento/VIP/save antes de alterar.
- Não afirmar que testes no WebKitGTK são testes no Safari iOS.
- Manter `main` e produção intactas.
