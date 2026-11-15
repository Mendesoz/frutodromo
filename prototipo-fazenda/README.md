# Protótipo descartável da fazenda idle

Página `index.html` com recursos visuais locais, sem servidor de jogo. Serve para testar com 5 a 10 pessoas se o ciclo da fazenda diverte. Não é a base do jogo final. Não usa o save do Frutódromo: a fazenda fica salva só no navegador, em `localStorage["fazenda_proto_v2"]`.

## Reaproveitamento visual — 15/11/2026
Após o pedido do Eric para reaproveitar o design existente, o Codex criou `codex/fazenda-visual` sobre `claude/fazenda-prototipo` (`c7a5903`).
- `reused-art.js`: cópia delimitada das molduras 9-slice, motor de personagens CH, objetos DECO, toldo, nuvens e texturas de `js/game.js`, base publicada `b475703`. Nenhum código de produção, caldeirão, genética ou salvamento é executado por esse módulo.
- Personagem e retrato originais, com pernas/botas adicionadas na versão de corpo inteiro usada no campo. Caixotes, barril, sacos, balança, lousa e planta são os sprites reais do Frutódromo.
- `visual.js`: cenário exterior, novas cercas e construções, animais com contorno e sombreamento coerentes; adapta a posição dos elementos ao telefone em pé e ao computador.
- `visual.css`: fonte embutida do jogo, molduras originais, botões e painéis claros. Sem Google Fonts e sem dependências novas.
- Regras, preços, RNG, produção, ações, offline e save do protótipo foram preservados. A adaptação é visual; não adiciona mercado real ou pagamentos.
- Para regenerar a cópia dos ativos: `node prototipo-fazenda/tools/extract-art.cjs`, a partir da raiz. A arte é uma fotografia da base de origem; revisar o diff ao regenerar com uma nova versão do jogo.

[Relatório da verificação](../docs/online/QA_FAZENDA_VISUAL_2026-11-15.md) · [Tela desktop](docs/visual-desktop.jpg) · [Tela no celular](docs/visual-celular.jpg).

## O que tem
- Criação do fazendeiro e da fazenda, com modelo à escolha: Vale, Serra ou Litoral.
- Cena animada com galinheiro, curral e horta. A fazenda produz sozinha e mostra cada produção ("+1 ovo").
- Tudo sorteado:
  - raridade e atributos dos animais (produção, chance de produto raro, vida útil, brilhante);
  - produto raro (ovo dourado, leite premium, abóbora gigante);
  - achados de ferramentas com classificação e desgaste.
- Escolha central: o ovo dourado pode ser vendido, entregue numa encomenda que paga mais ou chocado para nascer uma galinha com mais chance de ser rara.
- Feira NPC, 3 encomendas que se renovam e loja em moedas: animais, vagas, armazém, canteiros e sementes.
- Loja de diamantes com itens temporários (adubo turbo, vendedor automático, armazém extra) e um cosmético. O teste começa com 40 diamantes.
- Armazém com limite: cheio, a fazenda para.
- Modo AFK com contador de quanto está rendendo.
- "Enquanto você esteve fora": cálculo ao reabrir, até 8 h.
- Animais se aposentam e ferramentas quebram (sumidouros).
- Aba Diário com o botão "Copiar resumo do teste", para o testador mandar ao Eric.

## O que não tem (de propósito)
Servidor, contas, gemas, mercado entre jogadores, pagamento, ranking e decoração. Os números são de teste, não balanceamento.

## Teste automatizado feito
Playwright/Chromium em 390×844 e 1280×800, sem erros de página. O teste cobre:
- entrada e produção;
- feira, loja e loja de diamantes;
- volta depois de 2 h fora;
- chocar ovo dourado e entregar encomenda;
- modo AFK e diário.

## Integração com o trabalho seguinte do Claude
A revisão incorpora `d4e4e45`: seletor de personagens originais na entrada, frutas originais da horta, clientes e expressões nas encomendas, fontes/ativos locais e save v2. O cenário exterior e a apresentação do Codex foram preservados. O caldeirão foi retirado da eclosão; a interface usa chocadeira/ninho. O Frutódromo publicado continua separado.
