# Estrutura desejada pelo Eric, a partir do Pokeidle

Tela de referência enviada pelo Eric: `referencia/pokeidle-tela-2026-11-14.png`.

14/11/2026. O Eric mostrou a tela do Pokeidle e disse o que quer no Frutódromo Online. Este documento separa o que é **pedido do Eric**, o que é **proposta do Claude** e o que **ainda precisa de decisão**. Nada disso foi implementado.

## Pedido do Eric
- Três moedas próprias.
- Mercado interno com NPC.
- Ranking.
- Passe de batalha.
- Torneio. Não precisa de chefe (boss), ginásio nem PvP.
- "Casa" virando um pomar ou fazendinha que dá para mostrar ("veja minha fazendinha"), com mais cosméticos.
- RMT: loja entre jogadores.
- Shop: o diamante é a moeda com que se compra boost dentro do jogo.

## Proposta de correspondência (Claude)
| No Pokeidle | No Frutódromo Online | Já existe no Frutódromo? |
|---|---|---|
| Coins | **Moedas**: ganhas com encomendas e clientes NPC; compram sementes e itens da feira NPC | sim (moedas, feira, clientes) |
| Diamantes (Shop) | **Diamantes**: comprados com dinheiro; boosts, cosméticos, passe premium | não |
| Gemas (RMT) | **Gemas**: a moeda do mercado entre jogadores | não |
| Hunt no mapa (idle) | **Pomar produzindo sozinho**, com chance de variedade rara ou brilhante na colheita | cruzamento e brilhantes, sim; produção por tempo, não |
| Pokédex | **Frutódex**: árvore de espécies, cartas e coleção | sim |
| Market (NPC) | **Quitanda/feira NPC** | sim |
| Casa | **Fazendinha decorável**, visitável por outros jogadores | não |
| RMT | **Feira dos produtores**: jogadores vendem frutas e sementes entre si, em gemas | não |
| Passe | **Passe da temporada**: missões (colher, cruzar, entregar), trilha grátis e premium | não |
| Ranks | **Rankings**: coleção, raras descobertas, vendas, fruta da semana | não |
| Torneio | **Concurso agrícola**: a maior ou mais rara fruta de um tema, por exemplo a "fruta do dia" ligada ao clima | o clima do dia existe |
| Automações VIP | **Colheita e replantio automáticos** como vantagem VIP | não |
| Chat Mundo/Comércio | Chat de comércio | não |
| Bônus Twitch/Kick | Recompensa por assistir live: divulgação por streamers | não |

Observação: o Pokeidle é um jogo de fã sobre uma marca de terceiros. As frutas do Frutódromo são originais, então podem ser vendidas e divulgadas sem depender da marca de ninguém.

## Riscos do desenho (Claude)
1. **Boost pago com mercado.** Se o boost faz produzir mais fruta rara e essa fruta vira gemas no mercado, quem paga produz mais e vende mais. Quem não paga perde a graça, e o mercado vira "comprar dinheiro com dinheiro". Proposta: o boost compra conveniência (tempo, automação, estufa temporária), não mais sorte nem mais oferta da fruta negociável; ou a fruta do boost não é negociável.
2. **Três moedas pedem fluxo claro.** Para cada moeda: de onde entra, onde sai e como não acumula sem fim. A simulação de reprodução mostrou que a oferta foge do controle facilmente.
3. **Saque das gemas.** É a parte mais cara e arriscada: servidor dono dos saldos, contas verificadas, serviço de pagamento, regras legais. Proposta: gemas só dentro do jogo até o estudo de viabilidade terminar.
4. **Tamanho.** O Pokeidle tem muitos sistemas. Tudo junto, com servidor, é trabalho de meses.

## Ordem de construção proposta (Claude)
1. **Protótipo descartável, sem servidor:** pomar, encomendas, moedas e a escolha entre entregar e cruzar. Já aprovado.
2. **Servidor e contas:** pomar salvo no servidor, Frutódex e rankings.
3. **Feira dos produtores com gemas, sem saque.**
4. **Loja de diamantes, passe da temporada, fazendinha decorável e concurso.**
5. **Estudo de saque** em paralelo, decidido à parte.

## Decisões pendentes do Eric
- O boost pode aumentar a produção de fruta negociável, ou só dar conveniência?
- As gemas terão saque no começo, ou só depois do estudo?
- A ordem de construção acima serve?

## Mercado da comunidade do Pokeidle (segunda tela do Eric)
Tela: `referencia/pokeidle-mercado-2026-11-14.png`. O Eric destacou a quantidade de opções do mercado.

O que a tela mostra:
- Vende **Pokémon** e **itens**, em coins ou em gemas, com depósito e saque.
- Filtros por raridade (brilhante, potência, lendário, golpes especiais), espécie, nível e potência, e ordenação por preço.

Leitura do Claude:
- Os filtros existem porque cada Pokémon é único (atributos sorteados) e **permanente**: o jogador o treina e caça com ele. O valor está no atributo raro.
- No Frutódromo, o item permanente equivalente é a **árvore/muda** de uma linhagem, com atributos sorteados (produção, chance de brilhante, poder, tamanho, estampa). A **fruta colhida** é o equivalente dos itens: consumível, estraga e serve para encomendas e concursos.
- Filtros possíveis: espécie, cor, tamanho, poder, estampa, brilhante, linhagem/geração e dias até estragar.
- Um mercado com muitos filtros só faz sentido com muitos anúncios. No começo, poucos filtros bastam.

## Decisão do Eric — gemas (14/11, 12h56)
- O mercado entre jogadores usa **gemas**, e a gema tem valor em real/dólar.
- Regra proposta pelo Claude para a gema não virar dívida do estúdio:
  - a gema só entra no jogo por depósito de dinheiro e só sai por saque;
  - o jogo nunca cria gema em colheita, encomenda, passe ou concurso;
  - o jogador ganha gema apenas vendendo para outro jogador;
  - o estúdio cobra comissão na venda e/ou no saque.
  - Assim cada gema em circulação tem um depósito por trás.
- Consequência: o boost comprado com diamantes não pode aumentar a produção do que é vendável por gemas. Do contrário, o diamante vira uma máquina de comprar gemas. Proposta: o boost dá só conveniência.
- Pendências: cotação da gema, comissão, serviço de pagamento (Pix e saque), verificação de contas e regras legais e fiscais. Isso faz parte do estudo de viabilidade e ainda não está decidido.

## Decisões e ideia do Eric — achados e ferramentas (14/11, 13h03)
- **Boosts:** temporários.
- **Pagamento:** por uma API de pagamento, ainda não escolhida.
- **Achados:** ao plantar e colher na fazendinha, o jogador pode encontrar itens raros ("como achar petróleo ou garimpar") que valem gemas no mercado da comunidade. No Pokeidle, o paralelo são as pedras que caem e os Pokémon capturados, cada um com classificação.
  - Exemplos do Eric: luvas de plantio melhores e ferramentas que melhoram o pomar.
  - Objetivo: não ser só farm; dar profundidade (é preciso entender as classificações) e um motivo para gastar dinheiro no jogo, com a percepção de retorno dentro dele.

## Proposta do Claude para os achados
- **O jogo cria itens, nunca gemas.** Um achado só vale gemas quando outro jogador compra com gemas depositadas. A regra de lastro continua valendo.
- **Classificação:** cada ferramenta sai com qualidade e atributos sorteados, como o IV do Pokémon. Exemplos: velocidade de colheita, chance de brilhante, tamanho, poder.
- **Desgaste:** a ferramenta se desgasta em N colheitas. É o sumidouro que mantém a demanda; sem desgaste, o mercado de ferramentas satura como na simulação.
- **Risco principal:** se dinheiro (diamantes ou boost) aumentar a chance de achar item vendável por gemas, isso vira pagar por sorteio de algo que vale dinheiro. É o desenho que regras de jogo de azar costumam alcançar; precisa de parecer jurídico. Proposta: achados vêm de jogar; o boost acelera tempo, mas não aumenta a chance de achado negociável, ou o achado feito sob boost fica preso à conta.
- **Comunicação:** apresentar como "o valor do que você encontra e cria", nunca como investimento ou renda garantida.
