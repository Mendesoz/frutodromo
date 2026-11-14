# Roadmap visual do Frutódromo

Objetivo: estética de jogo indie profissional em pixel art, sem mudar mecânicas, economia, progressão nem salvamento.
Modo: autônomo, autorizado pelo Eric em 10/11/2026. O Claude decide e executa etapa por etapa, com teste e revisão a cada uma.
Desde 12/11/2026 cada etapa testada vai para a `main` (e para o site) aos poucos, e o Codex trabalha junto. Regras de convivência em `AGENTS.md`.

## Quem está mexendo em quê
Antes de começar, marque aqui (e faça push). Ao terminar, apague a linha.

| Agente | Área | Arquivos / funções | Desde |
|---|---|---|---|
| Claude | Etapa 6A — Personagens | `js/game.js` (`charImg`, `personImg`, `renderCounter` só o `.pw`, loop de 250 ms, `showPortrait`), `css/style.css` (`.pw`, `.chr`, `bob`, `blk`, `.sweat`) | 13/11 14:15 |

## Pendências abertas (qualquer agente pode pegar, marcando acima)
- Balões de pedido vizinhos se sobrepõem em 393×760 — Etapa 5.
- `brew()`: corrida rara se o save for trocado durante a mistura (já tem guarda).
- Coco sobre barril/caixote marrom perde contraste — Etapa 8 (polimento).

| Etapa | Tema | Status | Notas |
|---|---|---|---|
| 1 | Fundação visual (grade de pixels, escala, nitidez) | concluída (11/11) | escala só inteira; cena sem zoom fracionário |
| 2 | Cenário (chão, parede, janelas, balcão, luz ambiente) | concluída (11/11) | chão 240×80, frente do balcão, lambri, luz por clima |
| 3 | Caldeirão (poção animada, fumaça, partículas, reflexo) | concluída (12/11) | corpo 48×44 a 2x, poção em 4 quadros, halo sem blur |
| 4 | Decoração (caixotes, barris, cestos, lampiões, placas, balança) | concluída (12/11) | 3 a 10 enfeites por faixa de tela, lampiões acesos à noite |
| 5 | Interface (HUD, inventário, feira, balões, botões) | concluída (13/11) | 5A base: fonte embutida, escala de texto, molduras; 5B avisos; 5C tutorial, feira, balões |
| 6 | Personagens (sprites, expressões, roupas, respiração) | em andamento (6A) | 6A folha de sprites e 5 expressões; 6B movimento e VIP |
| 7 | Game feel (ambiente, reações, luz dinâmica, feedback) | pendente | |
| 8 | Polimento (desempenho, responsividade, regressão) | pendente | |

## Regras inegociáveis
- Não alterar mecânicas, economia, progressão ou salvamento.
- Não prejudicar o sistema de frutas nem o arrastar e soltar.
- Não adicionar dependências sem justificativa.
- Respeitar `prefers-reduced-motion`.
- Não sacrificar desempenho por efeito visual.
- Grade de pixels consistente, mantendo a hierarquia visual e as proporções das frutas.

## Registro por etapa
(cada etapa concluída ganha aqui: o que mudou, arquivos, testes, problemas e riscos)

### Frente online separada — Codex (14/11/2026)
- Eric autorizou branch exclusiva, planejamento e transmissão ao Claude de um jogo idle com mercado, divulgação e estudo de ganho para jogadores.
- Branch `codex/frutodromo-online`, base publicada `b475703`; documentos em `docs/online/` com conceito proposto, economia, aquisição e tarefa de análise do Claude.
- Preparação documental; nenhuma alteração de código, saves, cache ou integração financeira. Sintaxe de `js/game.js` e `js/i18n.js` e `git diff --check`: PASS. Não houve novo teste de jogabilidade nesta tarefa.
- Conceito detalhado e primeira etapa de implementação continuam para definição com Eric após a revisão. O envio do jogo atual ao portal ficou com Eric.

### Preparação da promoção final — Codex (14/11/2026)
- Reuniu relatórios, evidências e zip da regressão final do Claude; código de jogo igual ao da candidata aprovada.
- Cache atualizado para v46. Atualização v45→v46 e três aberturas offline com progresso e fonte preservados: PASS.
- Sintaxe, 7/7 testes de dificuldade e fluxo de jogo nas quatro resoluções obrigatórias: PASS.
- Evidências em `QA_PUBLICATION_CODEX_2026-11-14.md`. Para o CrazyGames, ainda faltam login, upload e QA Tool real no painel.

### Fechamento CrazyGames — Codex (14/11/2026)
- LOG-06 aprovado pelo Eric: transferência fácil/difícil limitada ao peso disponível; preserva a proporção dos médios. Demais regras mantidas.
- Texto da página revisado em português e inglês, com dicas, VIPs, adaptação e orientação retrato no telefone.
- Testes: 7/7 de dificuldade, sintaxe e fluxo de jogo nas quatro resoluções obrigatórias sem erros. Evidências e limitações em `QA_RELEASE_CODEX_2026-11-14.md`.
- Branch candidata: `codex/crazygames-final-logic`. Tarefa 9, aprovação dos materiais, integração final e envio ainda pendentes. Nenhuma promoção para `main`/`stage9`.

### Etapa 1 — Fundação visual (concluída em 11/11/2026)
**Motivo:** o CrazyGames recusou o jogo por qualidade geral, e as diretrizes deles pedem resolução consistente. Na janela deles (1024×600) a cena era encolhida por zoom de 0,85 e ficava borrada.

**O que mudou**
- Pixel lógico: 1 pixel de arte = 2 px CSS no mundo; objetos de destaque em múltiplos inteiros (frutas 2–7x, caldeirão 4x, retrato 4x).
- `fitScene`: sem zoom fracionário. Entre 530 e 649 px de altura a cena é cortada (252–280 px) em vez de encolhida; abaixo de 530 usa zoom 0,5 exato.
- Parede pode ser mais baixa (`renderProps`, `winLayout(W,H)`).
- Ícones, sol, folha e fruta do balão em tamanho nativo ×2 (`ADIM` e `sz()`).
- Frutas fora da mesa em múltiplos de 18 (slots 36, árvore 54, álbum 72, revelação 198, confete 36/54); MICRO 36 px.
- Efeitos de elemento (`fxHTML`) em escala inteira; caixotes sem `scale` nem `rotate`; animações `idle` e `flk` só com `translateY`.
- Caldeirão e moldura do desktop em px inteiros; caldeirão acompanha a mesa com `ResizeObserver`; NOVO JOGO recentraliza o caldeirão.
- Resize com debounce; balão de espécie nova sem corte de texto; `image-rendering: pixelated` na ordem certa; cache v32.

**Arquivos:** `js/game.js`, `css/style.css`, `sw.js`.

**Testes:** tester (Playwright, 6 tamanhos, arraste real): regressão completa sem erros, 0 sprites com escala fracionária, layout de balões e caldeirão ok, movimento reduzido e inglês ok. Revisor: aprovado com ressalvas; as 6 ressalvas foram corrigidas na rodada 2 e reverificadas.

**Riscos e pendências**
- Abaixo de 530 px de altura o texto dos balões fica pequeno (zoom 0,5): tratar na Etapa 5.
- Abaixo de ~400 px de altura o caldeirão não cabe na mesa (já era assim antes).
- Pixel das frutas grandes (até 7 px) segue maior que o do cenário: escolha consciente para manter os tamanhos.

### Etapa 2 — Cenário (concluída em 11/11/2026)
**O que mudou**
- Chão: ladrilho 240×80 (exibido 480×160) com tábuas de comprimento variável, emendas desencontradas, veios, nós, pregos discretos e duas manchas; sem costura.
- Balcão: tampo com quina, beiral e veios; nova frente ripada com rodapé e sombra de contato em 5 degraus (`buildCounterFront`, 48×22 a 2x; 1x com zoom 0,5).
- Parede: tábuas de larguras variadas, veios, nós e pregos; lambri com almofadas; prateleira com mão-francesa e sombra; janelas com moldura de 4 px, brilho no vidro e peitoril; toldo com luz, sombra e contorno.
- Luz: camadas `#tamb`, `#flight`, `#flamp` e feixes `.wlight` controlados por `wxLight()` no fim de `updateSky()` (dia, amanhecer, entardecer, nublado, tempestade, noite). O chão escurece à noite; as frutas não mudam de cor. Vinhetas novas.
- Correções: janelas grandes usavam a classe `.big` dos botões e ficavam deslocadas (agora `.wbig`); `#lamp` à noite 0,8 → 0,5 para não estourar o rosto do cliente.
- Frutas: topo mínimo de 24 px na mesa (não ficam sobre a face do balcão); `clampPos` roda também quando a mesa muda de tamanho (troca de aba, jogo novo em tela baixa).
- `placePot` não reescreve mais `S.potPos` quando a mesa está escondida.
- Ladrilho e frente memoizados; `renderProps` ficou mais rápido que antes.

**Arquivos:** `js/game.js`, `css/style.css`, `index.html`, `sw.js` (cache v33).

**Testes:** tester (10 tamanhos, 9 climas, arraste real, movimento reduzido, inglês, desempenho): sem erros; fruta com a mesma cor em todos os climas; quadro mediano 16,7 ms durante o arraste. Revisor: aprovado com ressalvas, todas corrigidas e reverificadas.

**Riscos e pendências**
- Coco e frutas marrons têm contraste baixo sobre o chão e os caixotes (o contorno salva). Rever na Etapa 4.
- Tapetes ficaram lavados (translúcidos): Etapa 4.
- Em mesa muito baixa (1024×530) as 6 frutas iniciais se sobrepõem até o jogador arrumar.
- Custo de `mix-blend-mode` em celular fraco não medido em aparelho real.

### Etapa 3 — Caldeirão (concluída em 12/11/2026)
**O que mudou**
- Corpo do caldeirão redesenhado em 48×44 nativo, exibido a 2x (96×88): bojo com luz e sombra, cinta com rebites, argolas, 3 pés. Gerado uma vez.
- Poção animada em 4 quadros (`steps(4)`), na cor média das frutas; misturando mostra as duas cores girando; bolhas, fumaça, faíscas e respingos em pixel art; halo de 2 px sem desfoque; luz no chão em degraus.
- Sem `rotate` nem blur: tremida só com translação de 2 px.
- Cache dos sprites por cor (máx. 24). Nenhum `toDataURL` com o jogo parado.
- Guarda em `brew()` se o save for trocado no meio da mistura; partículas não rodam com movimento reduzido.

**Testes:** tester (7 tamanhos, arraste real, movimento reduzido, inglês, CPU 4x) sem erros; revisor aprovou.

### Etapa 4 — Decoração (concluída em 12/11/2026)
**O que mudou**
- Enfeites em pixel art gerados por código: caixotes, barril, cesto de laranjas, sacos, lousa, balança, caixa registradora, vaso, tapetes e 2 lampiões.
- Posição por faixa de tela (largo 10, baixo 7, celular 5, celular baixo 3); nunca cruzam o caldeirão (recalcula ao mover o caldeirão) e não recriam à toa.
- Lampiões apagados de dia e acesos no entardecer, tempestade e noite, com halo em degraus; parados com movimento reduzido.
- Sombra de contato sob as frutas.
- Todos com `pointer-events:none`: não atrapalham arrastar.

**Testes:** tester com 24 verificações em 7 tamanhos, em inglês e com movimento reduzido, sem erros; desempenho sem piora. Achados levados para a Etapa 5 (aviso de 3 linhas cobre o caldeirão em 375×553; sombra das frutas em meio-pixel).

### Etapa 5 — Interface (concluída em 13/11/2026)
- 5A: fonte Pixelify Sans embutida (sem Google Fonts), texto só em 10/12/14/16/20/28 px, molduras 9-slice em pixel art, alvos de toque de 40 px no celular, ligaduras desligadas ("fi" virava "A").
- 5B: avisos num letreiro fixo sob o cabeçalho (fila, ×N, erros em vermelho), feedback de espécie errada ("Toque no ? pra ver a receita").
- 5C: tutorial fora da mesa com contorno no alvo, feira com abas fixas e setas, balão ao lado do cliente em janela baixa, cliente que aceita a fruta segurada fica verde.
- Frutas não ficam sobre enfeites (ARRUMAR, compra, nascimento, jogo novo, soltar).
- 5D (13/11): fruta arrastada visível fora da mesa (fantasma em camada fixa), avisos e tutorial se reposicionam ao girar a tela, ajustes da revisão.
