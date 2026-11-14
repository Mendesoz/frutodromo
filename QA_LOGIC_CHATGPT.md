# QA complementar — mecânicas e persistência (ChatGPT)

Base: `qa-claude-frutodromo`; branch isolada `qa-chatgpt-logic`. Revisão em 2026-11-14. Não alterar `main` nem publicar.

## O que o Claude já cobriu
Ver `QA_CLAUDE.md`: Chromium/WebKitGTK, responsividade, arraste, entrega, PWA offline, desempenho, soak. **Safari iPhone real ainda não testado.** Não duplicar esses testes sem mudança de código.

## Achados da inspeção do código — ainda não corrigidos
1. **LOG-01 — classe difícil pode não corresponder ao custo real.** Em `newCust()`, `depth=tier==0?0:tier==1?Math.min(1,maxD):maxD`. Se `maxD==1`, médio e difícil convergem. Em níveis avançados, a classe difícil seleciona o maior `t.d` disponível, mas isso não garante que a receita de menor custo para aquele alvo tenha a mesma profundidade. Medir distribuição de profundidade **real** e comparar com 45/40/15; não declarar pesos comprovados antes disso.
2. **LOG-02 — VIP e comentários divergentes.** O comentário em `newCust()` diz “VIP pede o mais fundo”, mas a seleção de `depth` já não distingue VIP. Confirmar se isso é uma mudança desejada de balanceamento antes de alterar.
3. **LOG-03 — erro e acerto do mesmo cliente.** `diffRecord(false,c)` limita a uma falha por cliente; `diffRecord(true,c)` registra acerto depois de uma falha e redefine a sequência de dificuldade. Verificar se o sinal de adaptação desejado é “resultado final por cliente” ou “uma falha + uma entrega”; evitar mudança de regra sem autorização.
4. **LOG-04 — persistência de DIFF.** `DIFF` usa `localStorage.frutodromo_difficulty`, fora do objeto `S` e do fluxo de save/importação/nuvem. “Novo Jogo” zera DIFF desde `9cf9575`, mas carregar save antigo, trocar dispositivo, importar código e alternar conta do portal podem manter/adquirir histórico adaptativo diferente. Testar esses fluxos antes de decidir migrar o formato de save.
5. **LOG-05 — dica e cruzamento visual.** `showHint()` usa previsão determinística de atributos, enquanto `cross()` sorteia aparência cosmética. Comparar o que a dica promete (espécie, requisitos e imagem) com o que o jogador pode produzir. Não exigir identidade visual de atributos aleatórios.

## Matriz de testes complementares proposta
| ID | Procedimento | Critério de aceite |
|---|---|---|
| M-01 | Gerar amostra grande de pedidos por nível 1, 2, 3, 4, 5, 7, 9, 12 com RNG fixo | 100% de pedidos alcançáveis a partir das frutas permitidas |
| M-02 | Medir 10 mil pedidos por nível com DIFF neutro; separar VIP, espécie, requisitos e profundidade mínima | Distribuição observada documentada e comparada aos pesos; diferenças explicadas |
| M-03 | Repetir entrega errada 5 vezes ao mesmo cliente e depois entregar corretamente | No máximo uma falha por cliente; comportamento de acerto documentado |
| M-04 | Acertar/errar sequências longas e reiniciar por Novo Jogo | Pesos válidos, `streak` limitado na fórmula, DIFF zerado em Novo Jogo |
| M-05 | Salvar/importar/recarregar em local, nuvem e portal com histórico DIFF não neutro | Sem corrupção de save; política de DIFF entre saves documentada |
| M-06 | Para cada pedido, reconstruir receita da dica e simular cruzamentos repetidos | Requisitos e espécie corretos; diferenças cosméticas não impedem completar |
| M-07 | Pedidos VIP de níveis 3+ com profundidades distintas | Sem pedido impossível e sem mudança não aprovada na regra VIP |
| M-08 | Dia avançado, clientes simultâneos, entrega errada, expiração, pausa, retorno | Sem estado de cliente preso, sem duplicação de recompensa e timer inalterado |

## Dependências e colaboração
- Claude: continuar `QA_CLAUDE.md` e iPhone/PWA; evitar mudanças de dificuldade/receitas sem revisão conjunta.
- ChatGPT: implementar primeiro harness de testes determinísticos e medir distribuição; corrigir apenas bugs reproduzidos em PR separado.
- Proprietário: aprovar mudanças de balanceamento e testar iPhone real.
- Nenhum dos testes M-01 a M-08 foi executado por este documento. São casos de teste e hipóteses verificáveis, não resultados.

## Integração
A branch `qa-chatgpt-logic` foi criada **a partir da branch de QA do Claude** para aproveitar suas correções, sem sobrescrever `js/game.js`, `css/style.css` ou `sw.js`. O único arquivo novo desta etapa é este relatório. Integrar apenas após revisão e aprovação.
