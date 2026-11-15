# Protótipo descartável da fazenda idle

Página única (`index.html`), sem servidor. Serve para testar com 5 a 10 pessoas se o ciclo da fazenda diverte. Não é a base do jogo final. Não usa o save do Frutódromo: a fazenda fica salva só no navegador, em `localStorage["fazenda_proto_v1"]`.

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
