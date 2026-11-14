# Conceito proposto — pomares, variedades e comércio

Estado: proposta do Codex para discussão. Não é especificação aprovada de jogo completo.

## Experiência
Um jogo de navegador em pixel art, desenhado para telefone em pé e computador. Cada jogador desenvolve um pomar mágico, descobre variedades de frutas e escolhe entre vender, consumir ou investir sua produção. Acompanhar o pomar deve ser divertido mesmo para quem nunca sacar dinheiro.

Ciclo: obter sementes → plantar → colher → cruzar → atender encomendas ou negociar → melhorar o pomar.

Exemplo de interação: um produtor cultiva ingredientes de gelo; outro produz receitas que consomem esses ingredientes e compra sua colheita. Especializações complementares criam motivos para negociar. São propostas novas, não funções existentes.

## O que podemos aproveitar
- Identidade, sprites procedurais, atributos, cruzamento e variedades brilhantes.
- Árvore de espécies, cartas e coleção como ponto de partida.
- Pedidos NPC, caldeirão e interação por toque/arraste.
- Experiência adquirida em tradução, layout retrato, persistência e desempenho.

Reuso deve passar por revisão; não pressupor que regras balanceadas para uma partida solo funcionem numa economia persistente compartilhada.

## O que será novo
Pomar e produção por tempo; distinção entre semente/matriz e fruto consumível; especializações; contas e inventário controlados pelo servidor; mercado e histórico transacional. O SDK de save e o armazenamento local atuais não tornam o inventário confiável para comércio.

## Primeira prova candidata
Propor um protótipo com um pomar pequeno, poucas linhagens, colheita gradual, cruzamento e encomendas que consumam produtos. Depois, um teste fechado com jogadores distintos e negociação em uma moeda interna de teste. Quantidades, duração e tecnologia serão definidos após revisão.

Critérios observáveis:
- O jogador entende a primeira plantação, colheita e venda sem explicação externa extensa.
- Precisa escolher entre produzir, consumir, cruzar e negociar.
- Há motivo para comprar de outro jogador além de revender mais caro.
- O teste produz vendas concluídas, consumo de produtos e retorno voluntário de jogadores.
- Transferência preserva saldo e propriedade; tentativas repetidas ou simultâneas não duplicam itens.
- Testar demanda com pessoas diferentes. Contas simuladas e bots de teste verificam funcionamento técnico, não provam demanda real.

## Decisões abertas
1. Quanto da quitanda atual permanece e quanto da experiência vira pomar?
2. Qual o custo e limite da reprodução de linhagens?
3. Qual a função de sementes, matrizes e colheitas? O que é negociável?
4. O que continua acontecendo com a aba fechada e como o tempo é calculado?
5. Qual o primeiro público e qual a proposta de diversão para ele?
6. Como avaliar uma futura operação com pagamentos e saques, separadamente do teste de diversão?

Multiplayer inicialmente pode ser assíncrono, por mercado e produção. Mundo em tempo real, combate, guildas e três moedas não são requisitos aprovados.
