# Simulação de oferta: regras de reprodução da linhagem rara

14/11/2026, Claude. Branch de tarefa `claude/online-simulacao`, derivada de `codex/frutodromo-online`. Script: `tools/online/sim_reproducao.py`.

É um estudo com números inventados para **comparar regras**. Não é balanceamento, não é teste com pessoas e não mostra demanda real. Os jogadores do modelo são 200 robôs com duas condutas fixas.

## Decisões do Eric (14/11, neste chat)
- **Escolha central do protótipo:** entregar a fruta rara agora (paga bem) ou usá-la como matriz para cruzar, deixando a estufa ocupada e ficando sem renda por um tempo.
- **Reprodução:** simular as regras antes de escolher. Este documento é essa simulação.
- **Protótipo:** descartável, com entrada e save próprios. Serve para testar se a escolha diverte, com 5 a 8 pessoas.
- **Jogo separado ou evolução:** em aberto. O Eric não sabe se um idle de frutas engaja sem um público prévio como o de Pokémon. Proposta do Claude: decidir depois, com os dados de retorno do Frutódromo no CrazyGames (se as pessoas voltam para completar a árvore de espécies) e com o protótipo.

## Modelo
- 200 jogadores, 30 dias, 3 colheitas por dia, 2 estufas cada.
- A estufa comum dá 2 frutas comuns por ciclo. Cruzar 2 comuns dá semente rara com chance `P_CROSS`.
- A árvore rara dá `Y` frutas por ciclo durante `VIDA` ciclos e seca.
- Cada fruta rara pode ser entregue numa encomenda rara (é consumida) ou virar matriz (gera 2 sementes), se a regra deixar. Sem encomenda disponível, ela fica em estoque, sem comprador.
- Demanda: 1 encomenda rara por jogador por dia, ou seja, 200 por dia.
- Metade dos jogadores investe (usa como matriz sempre que pode); a outra metade vende sempre.

Regras comparadas:
| Regra | O que acontece |
|---|---|
| livre (controle) | toda fruta rara pode virar matriz, sem limite |
| finita | cada linhagem aceita só 3 usos como matriz |
| estéril | só a fruta da semente do cruzamento serve de matriz; as gerações seguintes não reproduzem |
| declínio | cada geração produz 0,6× a anterior |

## Resultados (média de 6 a 10 rodadas)
**A. Números generosos** (`P_CROSS=0,10`, `Y=2`, `VIDA=6`):
| Regra | Raras colhidas/dia (dia 30) | Consumidas/dia | Estoque sem comprador (dia 30) |
|---|---|---|---|
| livre | 1.559 | 202 | 34.377 |
| finita | 1.259 | 201 | 28.550 |
| estéril | 1.052 | 200 | 23.680 |
| declínio | 732 | 202 | 14.890 |

**B. Rendimento baixo** (`P_CROSS=0,03`, `Y=1`, `VIDA=3`):
| Regra | Raras/dia (dias 7 → 14 → 30) | Consumidas/dia (dia 30) | Estoque (dias 7 → 14 → 30) | Jogadores com rara (dia 30) |
|---|---|---|---|---|
| livre | 304 → 466 → 587 | 142 | 601 → 2.123 → 7.222 | 104 |
| finita | 175 → 193 → 197 | 131 | 416 → 724 → 1.438 | 86 |
| estéril | 106 → 107 → 99 | 92 | 141 → 165 → 191 | 43 |
| declínio | 104 → 119 → 118 | 92 | 53 → 52 → 30 | 44 |

**C. B + fruta estraga no estoque em 2 dias:**
| Regra | Estoque (dias 7 → 14 → 30) | Consumidas/dia (dia 30) |
|---|---|---|
| livre | 290 → 508 → 702 | 142 |
| finita | 146 → 131 → 109 | 122 |
| estéril | 58 → 30 → 16 | 85 |
| declínio | 19 → 17 → 5 | 92 |

## O que a simulação sugere
1. **A regra de reprodução não basta.** Com números generosos, as quatro regras produzem 4 a 8 vezes a demanda, e o estoque sem comprador só cresce. O que mais pesa é a razão entre o que uma árvore produz e o que as encomendas consomem, mais a chance do cruzamento.
2. **Com rendimento baixo, as regras se separam.** A livre cresce sem parar. A finita acumula devagar e sempre. A estéril e a de declínio estabilizam a oferta *abaixo* da demanda: atendem cerca de metade das encomendas raras. Essa falta é o que daria motivo para comprar de outro jogador num mercado futuro.
3. **Fruta que estraga é um sumidouro que combina com o tema.** Ela segura o estoque em todas as regras, mas não corrige a produção da regra livre.
4. **Sugestão para o protótipo:** a regra estéril ("só a fruta do cruzamento dá muda"), que é a mais fácil de explicar ao jogador, mais fruta que estraga em poucos dias. A de declínio é a alternativa, se a estéril parecer punitiva no teste.

## Limites
- As condutas são fixas. Pessoas de verdade reagem a preço, a escassez e ao tédio.
- Ainda não há mercado entre jogadores; o modelo mede oferta contra encomendas de NPC.
- Os números de rendimento, chance e demanda são candidatos. Os valores do protótipo saem do teste com pessoas.

## Próximo passo proposto (precisa do Eric)
Aprovar o recorte do protótipo descartável: 2 estufas, 3 linhagens, cruzamento com a regra estéril, fruta que estraga e 3 encomendas, com save próprio. Depois disso, combinar com o Codex quem implementa o quê.
