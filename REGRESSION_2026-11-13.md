# Regressão pré-lançamento — 2026-11-13

Escopo: revisão estática de `js/game.js` na branch `stage9-dynamic-difficulty`. **Não foram executados testes de navegador, PWA ou simulações automatizadas.** Este documento distingue risco de bug reproduzido.

## Achados
1. **ALTO — adaptação por tentativas, não por pedidos**: `deliver()` chama `diffRecord(false)` a cada fruta recusada. `DIFF.streak` pode atingir -5 por repetidas tentativas contra um único cliente. Validar intenção e introduzir limite por cliente ou janela de desempenho.
2. **ALTO — pesos não equivalem à dificuldade real**: `diffTier()` sorteia 0/1/2, mas `newCust()` usa profundidades sobrepostas [0,1], [1,2], [2,3]; níveis 1–2 não têm profundidade 2; VIPs ignoram a profundidade sorteada e usam `maxD`. Portanto 45/40/15 são pesos de categorias, não distribuição efetiva mensurável.
3. **MÉDIO — imagens de dica aproximadas**: `stImg()` constrói imagem a partir dos pais, enquanto `cross()` sorteia padrão, topo e outras características cosméticas. O usuário pode ver diferenças visuais embora a fruta seja aceita. Confirmar UX e ajustar explicação.
4. **MÉDIO — estado adaptativo separado do save do jogo**: `DIFF` é lido de `localStorage.frutodromo_difficulty`, independentemente do save principal. Novo jogo pode herdar desempenho anterior. Investigar fluxos de reset e sincronização.
5. **MÉDIO — espécies novas e dificuldade**: `spReq` pode escolher um alvo profundo mesmo para uma categoria nominal fácil; a contagem de cruzamentos reais depende de `recipeOf(t).length`, que não é a mesma coisa que `t.d`. Medir o custo real.
6. **BAIXO — registro de vitórias/erros**: `DIFF.wins` e `DIFF.misses` acumulam até 30 mas a adaptação só usa `DIFF.streak`; avaliar simplificação e telemetria local.

## Verificações positivas de leitura
- `predictSt()` e `cross()` usam `inh()` e arredondamento RGB compatíveis.
- `elOut()` é compatível com a previsão de elemento e hero.
- `showHint()` tenta resolver o alvo exato antes de usar alternativa.
- `deliver()` valida os requisitos efetivos do cliente.
- `newCust()` mantém a expressão anterior do tempo de paciência; o modo dica é configurável.
- Alterações da Etapa 9 estão isoladas da `main`.

## Matriz de testes pendentes
| Teste | Resultado |
| --- | --- |
| Sintaxe/execução JS em navegador | PENDENTE |
| Novo jogo e reset do estado de dificuldade | PENDENTE |
| 100+ pedidos por faixa de nível, medindo dificuldade efetiva | PENDENTE |
| Sequências de 5 acertos e 5 erros, incluindo erros no mesmo cliente | PENDENTE |
| Receitas com 1–4 cruzamentos reproduzidas e aceitas | PENDENTE |
| Clientes VIP e poderes elementais | PENDENTE |
| Dicas ligadas/desligadas e reinício do PWA | PENDENTE |
| Safari iPhone, arraste, entrega, economia e save | PENDENTE |
| Regressão visual das Etapas 6B–8C | PENDENTE |

## Política de refinamento
Sem novas mecânicas nesta fase. Priorizar bugs reproduzíveis, clareza das dicas, dificuldade equilibrada, desempenho e preservação de saves. Não alterar `main` nem publicar sem autorização.

## Atualização — refinamento aplicado
Commit: `27f85e7fe0bc544b96ef80df2a398b39f7592ac9`.
- Corrigido: tentativas incorretas repetidas para o mesmo cliente contam apenas uma vez para a sequência adaptativa. A entrega correta continua contando como acerto.
- Corrigido parcialmente: categorias de seleção não se sobrepõem (fácil = profundidade 0, médio = 1, difícil = profundidade máxima disponível). Nos níveis 1–2, difícil não é sorteado; níveis 3–4 têm profundidade máxima 2; níveis 5+ até 3. Quando o alvo da profundidade não passa pelos filtros de desbloqueio, há fallback para profundidades menores.
- O tempo de paciência e a configuração de dicas não foram alterados.
- O custo real de uma receita pode superar sua profundidade `d` quando ambos os ingredientes requerem cruzamentos; medir `recipeOf(t).length` em QA.
- **Validação feita:** oito verificações estáticas de presença das mudanças, preservação de regras e isolamento da branch. **Não executado:** navegador, PWA, distribuição empírica, compilação de JS.
- **Pendência:** confirmar se a política de contabilizar erro e acerto no mesmo cliente é adequada; avaliar reset de `DIFF` em novo jogo, fluxo de saves, VIPs e dicas.
