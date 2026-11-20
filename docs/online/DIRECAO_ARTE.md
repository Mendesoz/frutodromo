# Duas frentes e uma identidade visual

16/11/2026. Decisão do Eric: separar funcionalidade/organização da apresentação da fazenda. O piloto atual funciona, mas o cenário está simplório e não combina com os sprites de personagens. **Funcionalidade aprovada em testes não significa arte aprovada.** A meta de novembro não pode apagar esse problema.

## Atualização — cenário jogável, caminhada e referências

Pedido posterior do Eric em16/11: usar Stardew Valley e Don't Starve como referências visuais, permitir andar pela fazenda com WASD. Depois enviou captura do Sunflower Land e autorizou também como referência. **São referências de arte/composição, não autorização para copiar sprites, mapas, interface ou economia.**

Interpretação de direção: acolhimento e organização de espaços de Stardew; silhuetas orgânicas/expressivas de Don't Starve; na imagem enviada do Sunflower Land, objetos legíveis, terreno com borda/volume e fazenda protagonista. Fontes oficiais consultadas: [Stardew Valley — mídia](https://www.stardewvalley.net/media/) e [Klei — Don't Starve](https://www.klei.com/games/dont-starve/). Sunflower: apenas a captura fornecida, sem avaliação do jogo/economia.

O cliente /play/ já contém uma **iteração candidata**, com arte separada em world-art.js, construções com altura visual independente da colisão, vegetação variada, corpo humano em canvas e WASD/botões móveis. Claude entregou locomotion.js/testes; Codex integrou e validou. [QA com imagens e limites](QA_CAMINHADA_2026-11-16.md). Isto atualiza as descrições de estudo isolado abaixo; não representa aprovação estética nem conclusão das etapas V1–V5.

Próxima rodada visual: (1) reduzir presença dos painéis e valorizar a área jogável; (2) bordas/transições de terreno com profundidade e caminhos menos retos, preservando a grade lógica; (3) corpos/direções completos para humano e robô antes dos22; (4) árvores e instalações com menos repetição. A imagem do Sunflower Land ainda não virou uma ilha ou mecânica de compra nova nesta versão.
## Frentes e responsáveis nesta rodada

| Frente | Condução / entrega real | Próxima entrega |
|---|---|---|
| Funcionalidade e organização | Claude entregou fila técnica das etapas4–5 e proposta de contrato em `claude/frente-funcional`, commit3f743d7; Codex revisa e integra. [Documento](FRENTE_FUNCIONAL_2026-11-16.md). | Simulação de automação finita e critérios de teste, com arquivos combinados antes de implementar. |
| Visual da fazenda | Codex: diagnóstico, direção e estudo isolado em [estudo-visual](estudo-visual/README.md). | Validar uma cena pequena como conjunto; depois separar renderer/manifesto e substituir os elementos em blocos coerentes. |

A frente funcional cuida de regras, API, banco, persistência, fila e observação. A visual cuida de personagens no mundo, construções, terreno, vegetação, câmera, iluminação, animação e interface da fazenda. Cada uma tem backlog e critérios próprios; a entrega final exige as duas. Essa divisão não cria dois jogos nem dois estados de fazenda.

Não há edição visual concorrente do Claude nesta rodada. Tarefa funcional foi transmitida à sessão cloud já identificada, com retorno `ok:true`, e gerou o documento3f743d7 numa branch própria. Não confundir envio com implementação: nenhuma automação de produção nova foi escrita nesta rodada.

## Diagnóstico do cenário atual

Inspeção da captura1280×680 e de `server/web/map.js`/`style.css`:

- Personagens originais têm contorno escuro, contraste forte, expressões e detalhes. Cenário tem uma paleta predominantemente verde/bege/marrom com contraste baixo; árvores e edifícios parecem vir de outra biblioteca.
- Casa, moinho e galinheiro partem de caixas pequenas e repetem a mesma silhueta. O personagem ocupa quase a altura de construções, prejudicando a sensação de lugar.
- O mapa reutiliza quadros40×52 concebidos para o balcão. Humanos recebem pernas via `.field-hero[data-kind=person]::after`, um remendo visual; não há um conjunto de corpos/direções de campo desenhado como família.
- Detalhe do terreno se espalha em pontos por toda a área, enquanto prédios têm poucas formas e materiais. A distribuição da atenção está invertida.
- Muitos painéis/textos disputam espaço com o cenário. A interface possui identidade reaproveitada, mas a composição ainda dá mais presença aos controles do que à fazenda.

Reaproveitar o arquivo do personagem não basta: contorno, escala de pixel, perspectiva, luz, cores, proporção e acabamento precisam ter relação entre si.

## Direção proposta — o mundo acompanha o elenco

Preservar rostos, expressões, personalidade, nomes e diversidade do elenco original. Não trocar os personagens para justificar um cenário mais fácil. Hay Day continua referência de gameplay; seus sprites, câmera isométrica e interface não são o padrão visual a copiar.

1. **Pixel art com contorno comum:** contorno quente e escuro; largura consistente em pixels nativos. Sombras e volumes em degraus, sem blur, suavização ou filtros que lavem o elenco.
2. **Vista de três quartos sobre grade ortogonal:** ver telhado e frente dos objetos, mantendo a mesma inclinação e linha de chão. É proposta de arte; não muda coordenadas de terreno/colisão para isometria.
3. **Cores com função:** vegetação organiza o fundo; madeira, reboco e telhados distinguem construções; roupas e objetos interativos mantêm leitura. Mais variação de material, sem adicionar ruído em cada pixel.
4. **Construções com presença e proporção:** porta comparada ao personagem de campo; telhado, beiral, base e volume lateral; cada instalação tem silhueta própria. Altura visual não será limitada pelo retângulo lógico de colisão.
5. **Personagem de campo desenhado de verdade:** estudar corpo/roupa/pés/direções com o rosto original; separar retrato de avatar no mundo. Não aplicar pernas humanas às outras espécies. Não redesenhar22 personagens antes de acertar um humano e uma espécie diferente como conjunto.
6. **Cenário composto:** caminhos conectam entradas, plantações se agrupam, vegetação enquadra a área; respiro para expansão e leitura. Detalhe concentrado perto das atividades, chão mais calmo.
7. **Luz comum:** luz superior esquerda, sombra de contato coerente; mesma regra para árvores, construções, animais e elenco. Escala de exibição inteira, sem esticar sprite.
8. **Fazenda como protagonista:** testar mais área para o mundo e ações contextuais menores antes de redesenhar toda a interface. Navegador e telefone em pé continuam requisitos.

## Estudo01 entregue nesta rodada

`estudo-visual/` é uma cena estática em canvas, gerada por código e separada do jogo: um celeiro, galinheiro, poço, canteiros, vegetação e os personagens originais Iara/Caio/Unidade K7. Reaproveita sprites, fonte, barril/saco/vaso; rostos permanecem nos pixels originais. O corpo humano é apenas estudo de proporção com peças originais e pés novos. O robô mantém sua silhueta; isso não é um pacote de personagens final.

O estudo testa contraste, contorno, hierarquia, escala e composição. **Não é um redesign aprovado**, não contém renderização final de todas as instalações, animais, movimento, estados de produção ou interface. O celeiro não representa nova construção comprável no banco. O lugar desenhado não é um novo layout salvo nem muda footprints. A proposta ainda precisa ganhar variedade de formas, movimento e acabamento antes da integração.

## Fila visual e aceite

| Ordem | Entrega | Critério de saída |
|---|---|---|
| V1 | Cena de referência isolada | Elenco e mundo avaliados juntos; Eric aprova a direção ou aponta correções. Estudo01 preparado nesta rodada; **aprovação pendente**. |
| V2 | Família de ativos de campo | Um humano, uma espécie diferente, moinho, galinheiro, canteiro, árvore/cerca/chão com mesma perspectiva, luz e pixel; escala de portas e base legível; sem remendo CSS. |
| V3 | Integração do cenário | Manifesto visual separado do estado; âncora na base e profundidade; áreas clicáveis continuam representando footprints; mover/expandir/recarregar preservam as mesmas coordenadas. |
| V4 | Apresentação e vida | Estados idle/trabalhando/conclusão sem mentir sobre colheita manual; animações discretas, interface dá espaço ao mundo, movimento reduzido respeitado. |
| V5 | QA conjunto | Quatro viewports, toque/retrato, oclusão, contraste, nitidez e desempenho; regressão funcional. iPhone/Safari físico ainda precisa de teste próprio. |

## Contrato entre as duas frentes

API fornece estado lógico; renderer decide imagem, dimensão, âncora e animação. `tile_x/tile_y`, `footprints`, `land`, `hero` e jobs existentes continuam sendo a fonte. Dimensão do sprite não entra no banco. `visualBounds` pode ultrapassar o footprint, sem ampliar colisão. Ordenação usa base no chão; seleção do prédio continua acessível quando telhado/árvore o encobrem.

A rodada inicial do estudo isolado não alterou server/web. A integração posterior de caminhada altera o cliente e tem QA próprio acima:55testes locais; conferir CI atual no QA. Testes de lógica não validam a estética. API econômica, saves e Frutódromo publicado permanecem preservados.
