# Bíblia Visual do Frutódromo — v0 (para discussão)

**Status:** rascunho para consenso entre Eric, Claude e Codex. **Nada aqui está aprovado.** Não autoriza produção em escala. Não altera backend, economia, colisão ou lógica do jogo.

**Pergunta central:** se tirássemos todas as referências externas, como seria o universo do Frutódromo?

**Princípio:** o mundo, o elenco, a interface e a vegetação seguem as mesmas regras. Cada novo asset precisa passar pela régua desta Bíblia antes de entrar no jogo.

Referências usadas só para princípios (composição, legibilidade, escala, atmosfera). Nenhum sprite, mapa, tile ou composição copiado de Pokémon Emerald, Stardew Valley, Don't Starve ou Sunflower Land.

Cena para avaliação: `index.html` nesta pasta (cena-piloto v0, sem alteração de arte).

---

## 1. Diagnóstico — o que hoje é inconsistente

Medido nos arquivos atuais (`world-art.js`, `prototipo-fazenda/sprites.js`, `reused-art.js`).

| # | Problema | Onde aparece | Consequência |
|---|---|---|---|
| 1 | **Sem régua comum de escala.** Avatar de campo ~30 px visíveis; porta da casa 25 px; casa 84 px de altura; moinho 120 px. | Cena-piloto | Personagem parece grande para as portas e pequeno para o moinho. |
| 2 | **Três projeções misturadas.** Personagens de frente (retrato); construções em três quartos (telhado visível); árvores de frente; terreno quase de cima. | Todo o mundo | Nada parece estar no mesmo "chão". |
| 3 | **Contorno com cores diferentes.** Personagens e construções: `#2a1a12`. Árvores: verde-escuro próprio. Terreno: sem contorno. Objetos herdados: contorno de outro peso. | Cena | O mundo parece montado de bibliotecas diferentes. |
| 4 | **Densidade de detalhe irregular.** Retratos com muitos detalhes de rosto; casas com tábuas de 5 px; grama com tufos de 1 px. | Cena | Cada elemento pede um "zoom" diferente para ser lido. |
| 5 | **Dois pipelines.** Arte gerada por código (`world-art.js`) e arte herdada em PNG (`sprites.js`, extraída do Frutódromo). | Todo o mundo | Qualquer ajuste em uma parte não se propaga às outras. Escala de produção ruim. |
| 6 | **Avatar de campo é derivado, não desenhado.** Retrato reduzido por blocos 2×2, costas e lado automáticos, pernas por espécie. | Personagens | Costas e perfil parecem "recortes", não personagem. |
| 7 | **Paleta sem papéis.** Verdes saturados nas árvores; vermelho e azul nos telhados; dourado em UI e em objetos; sem regra de qual cor significa o quê. | Mundo e UI | O olho não sabe o que é interativo, o que é fundo, o que é destaque. |
| 8 | **Interface com outra linguagem.** Molduras de madeira e papel do Frutódromo sobre um mundo sem relação com elas. | UI | Painéis chamam mais atenção que o mundo. |
| 9 | **Luz só em parte.** Luz superior esquerda em construções e árvores; personagens de retrato sem luz própria; sombras de contato em elipse com opacidades diferentes. | Mundo | Pouca sensação de volume comum. |
| 10 | **Sem assinatura.** Nada no mundo se repete como marca reconhecível. | Todo o mundo | A cena pode ser de qualquer jogo. |

---

## 2. Regras propostas (concretas, testáveis)

### 2.1 Escala e grade
- **Tile = 24 px** (grade lógica já existente no online; mantida).
- **Avatar de campo = 30 px de altura visível** (≈ 1,25 tile). Base nos pés, centro do tile.
- **Porta de construção = 15 × 25 px.** É a régua. Toda construção tem porta; porta sempre em escala com o avatar (≈ 0,8 da altura dele).
- **Altura de construções**: casa ≈ 3,5 tiles; galinheiro ≈ 3 tiles; banca ≈ 3 tiles; moinho ≈ 5 tiles (é o marco vertical da cena).
- **Ampliação inteira apenas** (zoom 1×, 2×, 3×). Nunca escala fracionária.
- **Um pixel de arte = um pixel de tela no zoom 1×.** Nenhum asset novo sai de uma escala diferente.

### 2.2 Perspectiva
- **Vista de três quartos fixa:** cada objeto mostra a face frontal e um topo de ~1/3 da altura da face. Mesmo ângulo para casas, canteiros, árvores e mobília.
- **Personagens continuam de frente** com rosto original (preservação do elenco), **mas** com pés no chão do mesmo plano: sombra de contato obrigatória.
- **Chão em planta** (tiles quase de cima). Não há paredes de chão; bordas do terreno são só variação de tile.
- *Decisão 1 (para discussão):* personagens 3/4 de verdade, ou manter frontais? Frontais preservam o elenco; 3/4 exige desenhar corpo novo para cada espécie.

### 2.3 Contorno
- **Contorno externo único: `#2a1a12`** para tudo que fica de pé (personagens, construções, árvores, objetos). Terreno e caminho não têm contorno externo.
- **Contorno interno:** um tom mais escuro do material (madeira, grama, pedra). Nunca preto puro.
- **Espessura:** 1 px de contorno em tudo. Nada de contorno de 2 px nas bordas de sprites grandes.

### 2.4 Luz e sombra
- **Fonte de luz:** superior esquerda, fixa, em todo o mundo.
- **Três níveis por material:** luz (topo e esquerda), meio, sombra (base e direita). Sem outros níveis.
- **Sombra de contato:** elipse `rgba(18,48,28,.30)` sob todo objeto e personagem. Largura = largura da base.
- **Sem sombra projetada longa.** Sem blur, sem `drop-shadow` decorativo (exceto contorno de destaque de item interativo).

### 2.5 Paleta (papéis fixos)
Seis famílias, cada uma com 3 ou 4 tons. Cada sprite usa no máximo **16 cores**.

| Papel | Família | Uso |
|---|---|---|
| Grama | 3 tons verdes, sem saturação máxima | Chão e copas em segundo plano |
| Terra e caminho | 3 tons bege-marrom | Caminhos, canteiros |
| Madeira | 4 tons laranja-marrom | Construções, caixotes, cercas |
| Reboco e pedra | 3 tons creme e cinza-azulado | Paredes, torres, pedras |
| Acento de telhado | vermelho-tijolo **ou** azul-ardósia (escolher uma por construção) | Telhados |
| Destaque interativo | dourado `#f7c331` | **Somente** o que o jogador pode tocar ou coletar |

- Azul e vermelho de telhado não aparecem em outros elementos.
- Verde saturado (`#5daf47`) só no realce de flor ou fruta.
- *Decisão 2:* Dourado reservado para interação é proposta forte. Aceitamos?

### 2.6 Materiais
- **Grama:** pontos e tufos de 2 px, sem ruído aleatório por pixel.
- **Terra:** sulcos horizontais de 1 px a cada 4 px.
- **Madeira:** tábuas de 5 px de passo; uma linha de sombra por tábua.
- **Pedra:** blocos de 5 px com juntas claras.
- **Reboco:** liso, sem textura.
- **Palha e tecido:** 2 tons, sem contorno interno.

### 2.7 Personagens de campo
- **Altura padrão:** 30 px. Mesma base, mesmo contorno, mesmo tom de bota para toda a família.
- **Silhueta define a espécie**, não a cor. Cada espécie tem uma forma de cabeça ou de orelha reconhecível.
- **Quatro direções:** baixo (frente), cima (costas), lado (perfil) e passo de 3 quadros. Costas e perfil **desenhados**, não derivados automaticamente.
- *Decisão 3:* Refazer o avatar por espécie à mão, ou aceitar a derivação até a V2?

### 2.8 Construções
- **Cada construção tem uma assinatura de telhado:** casa = telhado vermelho com chaminé; galinheiro = telhado azul com beiral; moinho = torre de pedra com pás; banca = toldo listrado.
- **Porta e base** conforme 2.1.
- **Base de ancoragem:** parte inferior da pegada. A altura visual pode passar do quadrado de colisão.

### 2.9 Vegetação e terreno
- **Árvores:** no máximo 4 variantes por tipo; copas em tufos com três tons; tronco de 10 px de largura.
- **Nunca repetir o mesmo sprite ao lado.** Variação por sorteio fixo por posição.
- **Terreno não comprado:** mata densa, não grama lisa.
- **Flores e mato alto:** pontuais, nunca em toda a área.

### 2.10 Interface
- **Molduras de madeira e papel** do Frutódromo são a única linguagem de painel.
- **Painel de papel `#f5efe0`** com texto `#2a1a12`. Texto sobre o mundo só com sombra de 2 px `#2a1a12`.
- **UI não ocupa mais de 35% da largura** no desktop; no celular, painéis viram faixas recolhíveis.
- *Decisão 4:* Quanto da tela a fazenda deve ocupar? Proposta: 65% desktop, 70% celular em pé.

### 2.11 Assinatura (elementos recorrentes)
Propostas para escolha, não todas juntas:
- **A.** Contorno quente `#2a1a12` em tudo (já proposto em 2.3).
- **B.** Placa de madeira com ícone de fruta ou produto em cada instalação (rótulo de loja/casa).
- **C.** Brilho dourado de um pixel em cada ponto colhível.
- **D.** Canteiro com sulcos horizontais e planta em estágios (já existe; reforçar).

---

## 3. Comparação de direções (para discutir)

| Direção | Ponto forte | Limitação | Relação com o jogo |
|---|---|---|---|
| **1. Caseira de vila** | Calma, materiais quentes, bom para ler portas e caminhos | Pode parecer genérica se não tiver assinatura | Fazenda como protagonista; combina com elenco |
| **2. Ilustrada de bolso** | Silhuetas claras, cor com função, contorno forte | Exige mais desenho à mão | Melhor para o elenco do Frutódromo e para portais |
| **3. Mapa de tiles limpo** | Muito fácil de produzir em escala; grade forte | Menos personalidade; risco de parecer tutorial | Rápida para o protótipo; fraca para a marca |

**Recomendação provisória:** direção 2, com a regra 2.5 (papéis fixos de cor) e a assinatura A + B. Razão: é a única que consegue usar o elenco original sem parecer colagem. **Ainda não é escolha final**; depende da cena-piloto.

---

## 4. Gargalos que precisam de decisão

1. **Pipeline:** arte procedural (código) ou arte desenhada à mão (PNG)? Código dá consistência e custo baixo, mas limita personalidade. Desenho à mão dá personalidade e custa mais. **Proposta:** desenho à mão nos sprites-chave (casa, moinho, humano, uma espécie), código para repetição (grama, árvores, caminho).
2. **Elenco:** frontal ou 3/4 (Decisão 1).
3. **Avatar de campo:** derivado ou desenhado por espécie (Decisão 3).
4. **Dourado reservado** (Decisão 2) e **área de UI** (Decisão 4).
5. **Objetos herdados** do Frutódromo (caixote, balança, barril): ajustar ao contorno e à régua, ou manter como exceção?

---

## 5. Cena-piloto e como validar

A cena-piloto (`index.html` nesta pasta) mostra o estado atual composto. A próxima versão deve aplicar as regras acima e ser avaliada assim:

1. **Teste dos 3 segundos:** 5 pessoas veem a cena por 3 s e dizem que mundo é. Se não reconhecerem a mesma coisa, a identidade não está clara.
2. **Teste de consistência:** a cena tem os mesmos elementos em três pontos de vista do mesmo lote (casa, galinheiro, canteiro, personagem, árvore). Todos devem parecer do mesmo lugar.
3. **Teste de escala:** o avatar ao lado de cada construção, em zoom 1×, 2× e 3×.
4. **Teste de celular:** em 393×760, o mundo continua legível com a UI ativa.
5. **Revisão do Eric e do Codex** antes de qualquer integração no `/play/`.

Só depois da aprovação visual desta cena, a produção em escala começa.

---

## 6. Histórico
- **16/11/2026 (v0):** primeira proposta, a partir de `claude/arte-fazenda-emerald` (`7e5c3a6`). Diagnóstico, regras, decisões em aberto e cena-piloto.
