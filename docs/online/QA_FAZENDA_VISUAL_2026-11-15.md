# Fazenda — reaproveitamento visual e verificação

15/11/2026, Codex. Branch `codex/fazenda-visual`, base `c7a5903c45fac804742b8edb68efc2f9f3ba65ed` do Claude.

## Integração seguinte: `d4e4e45`
O Claude publicou uma revisão concorrente durante esta rodada. Ela foi integrada nesta branch preservando o seletor de personagens, clientes/expressões, frutas originais e save `fazenda_proto_v2`. O histórico abaixo registra a primeira passagem em v1; os fatos desta seção prevalecem para o resultado integrado.

- Comparação de economia/RNG/estado/produção e offline/loop com `d4e4e45`: idênticos. Ações/compras idênticas após normalizar a mudança de texto “caldeirão” → “chocadeira”.
- A interface deixou de referenciar o caldeirão; ovo dourado aparece como ovo na chocadeira. Genética não foi adicionada.
- Teste real após integração: entrada com o personagem original Unidade K7, Eric/Boa Vista; recarga preservou personagem/fazenda e produção no save v2.
- Ovo dourado obtido pela produção normal e colocado na chocadeira; ativação de adubo por 5 diamantes, 40 → 35; encomenda de Júlia entregue e agradecimento visível; venda de comuns e saldo de 170 moedas observados. A eclosão completa não foi auditada nesta passagem.
- Console capturado após carregamento e entrada integrada: nenhum erro ou aviso. A sintaxe inline, a fonte de save v2 e a ausência de referências de interface ao caldeirão foram conferidas.
- Direção de gameplay Hay Day e proposta do nome Brotalume estão em `DIRECAO_ATUAL.md`. Edição livre da fazenda/cadeias produtivas ainda não foram implementadas.

## Pedido e resultado
Eric rejeitou os blocos genéricos da primeira tela e pediu reaproveitar o design do Frutódromo. Caldeirão e cruzamentos não pertencem à fazenda atual.

A apresentação agora usa a fonte local, as molduras 9-slice, os personagens CH e a decoração DECO do jogo publicado. O exterior tem celeiro, quitanda com toldo original, cercas, caminho, vegetação, canteiros e animais com volume. O personagem de campo reaproveita a cabeça/corpo originais e ganha pernas e botas.

Os sprites não foram substituídos por uma imagem de referência: são gerados pelos mesmos blocos de desenho do jogo, isolados em `prototipo-fazenda/reused-art.js`. O extrator fica em `prototipo-fazenda/tools/extract-art.cjs`.

## Escopo preservado
- Comparação textual das seções de economia/RNG/estado/produção, ações/compras e offline/loop contra `c7a5903`: idênticas.
- Save continua `fazenda_proto_v1`; o save `frutodromo9` do lançamento não foi tocado.
- `js/game.js`, `js/i18n.js`, `css/style.css` e `sw.js` do jogo publicado não foram alterados. O protótipo não usa o SW de produção.
- Interface e posição dos elementos mudaram. Não foram adicionados servidor, mercado real, depósito ou saque.

## Verificações efetivamente executadas
Ambiente: navegador interno do Codex, via controles de navegador, app servido em localhost. Não representa teste físico de iPhone/Safari.

- Entrada normal: criar Eric/Fazenda Boa Vista, modelo Vale.
- Produção real observada: ovos e milho aparecem no armazém; nenhuma injeção de saldo ou relógio usada no navegador.
- Feira: vender todos os comuns; moedas 80 → 195, armazém esvaziado na ação.
- Loja: comprar galinha por 120 moedas; três animais na cena/lista e 75 moedas.
- Loja de diamantes: ativar adubo de 5 diamantes; 40 → 35, bônus e temporizador visíveis.
- Modo AFK: contador e produtos atualizando; botão Voltar funcional.
- Recarga: nome, modelo, três animais, 75 moedas, 35 diamantes e bônus preservados; produção continuou.
- 393×760, 1024×600, 900×430 e 1280×680: sem rolagem horizontal, nenhuma imagem pendente/quebrada. Canvas de cenário em escala 2× inteira em todos os casos medidos.
- Ajuste de enquadramento: cena com 478 px de altura para acomodar o arranjo estreito. Página pode rolar verticalmente; não há tentativa de encolher o jogo com zoom fracionário.
- Console observado após as ações e a recarga: zero erros e avisos capturados.
- Sintaxe do script inline, `visual.js`, `reused-art.js` e JS do lançamento: PASS. `git diff --check`: PASS.

## Limites
Não repeti o teste de duas horas offline, eclosão de ovo dourado, aposentadoria ou achado de ferramenta. Esses sistemas permanecem na seção de lógica idêntica à base, mas isso não substitui testes funcionais completos. Não houve teste de comunidade, demanda, receita ou retenção.

Capturas: [desktop](../../prototipo-fazenda/docs/visual-desktop.jpg), [celular](../../prototipo-fazenda/docs/visual-celular.jpg).
