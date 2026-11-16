# Protótipo descartável da fazenda idle

> **Situação em 16/11/2026 (coordenação com o Codex).** Este protótipo é um experimento local e descartável de VIP/comissão (`e65e26d`). A base online oficial é outra: `codex/fazenda-online-base` (PR #30, código `4f4b6cf` e teste `8aedd7c`), com cliente em `/play/`, mapa expansível persistente e **feira P2P real entre contas, já entregue**, usando moedas virtuais que podem ser zeradas. Nada daqui (gemas simuladas, concessões de teste, caldeirão) entra no servidor. VIP, passe e comissão continuam em descoberta, sem autorização financeira. Direção vigente: `docs/online/DIRECAO_ATUAL.md` e `docs/online/PLANO_NOVEMBRO.md` daquela branch.

Página única (`index.html`), sem servidor. Serve para testar com 5 a 10 pessoas se o ciclo da fazenda diverte. Não é a base do jogo final. Não usa o save do Frutódromo: a fazenda fica salva só no navegador, em `localStorage["fazenda_proto_v2"]`.

## Reaproveitado do Frutódromo
- **Personagens:** as folhas de sprites dos clientes, com 3 quadros e 5 expressões, viram o fazendeiro escolhido na entrada e os clientes das encomendas. Os clientes ficam preocupados quando o tempo acaba e felizes na entrega; os VIPs pedem ovo dourado.
- **Frutas:** morango, melancia e abacaxi são os cultivos da horta. Os híbridos viram a "fruta rara".
- **Caldeirão:** é onde se choca o ovo dourado.
- **Interface:** molduras de papel, botão, VIP e modal; madeira do cabeçalho; fundo xadrez; fonte Pixelify Sans; animação parada e de passo dos personagens.
- **Bichos e ícones novos:** galinha, vaca, ovo e leite, feitos com a mesma técnica `art()` (grade + paleta + contorno #2a1a12).
- **Como regenerar:** `sprites.js` é gerado por `tools/export_sprites.py`, que roda o jogo publicado e salva o que ele desenha. `fonts/` é cópia de `fonts/` do jogo (licença OFL).

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

## Ficha VIP e mercado (16/11)
- **Ficha VIP (30 dias):** compra com 50 diamantes, ou do NPC por 20.000 moedas (cerca de 15 dias de farm). Pode ser usada ou vendida no mercado.
- **O que o VIP dá:** +150 no armazém, vendedor automático, +1 vaga no galinheiro e no curral, caldeirão 2× mais rápido. Não muda a chance de raro por produção.
- **Mercado da comunidade em gemas, com os outros jogadores simulados:**
  - dá para comprar fichas, ovos dourados e ferramentas anunciados;
  - dá para anunciar os seus pelo preço que quiser, e quanto mais barato, mais rápido vende;
  - o jogo fica com 10% de cada venda, e a aba mostra a comissão acumulada no teste.
- **Botões só de teste:** "+50 diamantes" e "+500 gemas", sem cobrança.

## O que não tem (de propósito)
Servidor, contas, mercado com pessoas de verdade, pagamento, saque, ranking e decoração. Os números são de teste, não balanceamento.

## Teste automatizado feito
Playwright/Chromium em 390×844 e 1280×800, sem erros de página. O teste cobre:
- entrada e produção;
- feira, loja e loja de diamantes;
- volta depois de 2 h fora;
- chocar ovo dourado e entregar encomenda;
- modo AFK e diário.
