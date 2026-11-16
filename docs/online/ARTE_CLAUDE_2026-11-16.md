# Arte da fazenda online — rodada Claude (16/11/2026)

**Pedido do Eric:** a fazenda em `/play/` não estava bonita. Ele quer acabamento no nível de um RPG de bolso clássico (referência: Pokémon Emerald), sem copiar sprites. O Codex ficou sem uso, então o Claude assumiu a frente visual até ele voltar.

**Branch:** `claude/arte-fazenda-emerald`, criada de `codex/fazenda-online-base` (`dcf6c5a`). Não houve merge, push na main nem publicação.

## Escopo
Arquivos alterados:
- `server/web/world-art.js`: toda a arte. As exportações e as âncoras (base no centro da pegada, pés do avatar em 20,60) são as mesmas da versão anterior.
- `server/web/map.js`: uma linha, que repassa ao `avatarCanvas` a direção que o `Walker` já calcula.

Nada mudou em pegadas, colisão, rotas, banco, economia, painéis, `index.html` ou `style.css`. Esses dois últimos ficaram livres para a issue #33 do Gabriel.

## O que mudou (comparado à `DIRECAO_ARTE.md`)
| Problema da versão anterior | Agora |
|---|---|
| A grama era um ruído aleatório e escuro | Tiles de 24 px com tufos regulares, em 4 variações. Também há tiles de flores (vermelha, branca e amarela) e de mato alto. |
| O caminho era uma faixa reta que passava sob a casa | Autotile com borda recortada, cantos externos arredondados e cantos internos. O traçado acompanha a faixa livre y=5 e os acessos à casa e à banca. |
| As árvores eram bolhas com ruído | Árvores em tufos: cada tufo tem luz no canto superior esquerdo e uma sombra que o separa do vizinho, com contorno verde-escuro próprio. Há 4 variantes: duas redondas, um pinheiro e uma frutífera. |
| Os terrenos não comprados eram grama escura com árvores soltas | Uma mata densa em fileiras alternadas, que forma uma parede de floresta. As copas não invadem os terrenos vizinhos. |
| O personagem tinha quase a altura das casas | Avatar com cerca de 31 px, ou 1,3 tile. A porta da casa tem 25 px, o que dá a proporção de um RPG de bolso. |
| As construções repetiam a mesma caixa com telhado vermelho | Cada construção tem silhueta e cor próprias. **Casa:** telhado vermelho, floreira e chaminé. **Galinheiro:** telhado azul, cerca branca, palha e três galinhas. **Moinho:** torre de pedra, pás em cruz e galpão. **Banca:** toldo amarelo e caixote, balança e cesta reaproveitados do Frutódromo. |
| Os canteiros eram caixas escuras | Solo arado com cantos arredondados e sulcos. O milho aparece em três estágios: broto, planta jovem e espiga madura. |
| As pernas eram um remendo sob o retrato | Avatar de campo em 4 direções e 3 quadros, gerado a partir dos 22 retratos originais em meia escala, por blocos 2×2 em que o contorno vence o empate. As costas trocam o rosto pela cor do cabelo ou pelo. O perfil desloca o rosto 2 px. As pernas variam por espécie: o pinguim tem pés laranja e o fantasma flutua. |

## Verificação
- `npm run verify`: tipos, sintaxe dos 5 módulos e 55/55 testes com PGlite. `npm run build` e `git diff --check` também passaram.
- No Chromium headless (Playwright), em 1280×720 e 393×760, foram feitos cadastro, entrada, zoom 2× e 3×, troca para a Iara e caminhada com WASD nas 4 direções, sem erro de página. `data-facing` seguiu a tecla.
- Não houve teste em celular físico nem em CI PostgreSQL. A rodada não deve ser tratada como aprovada no celular.

Capturas em `qa-arte-2026-11-16/`:
- `antes-depois-2x.jpg`
- `fazenda-1280x720.jpg` e `fazenda-393x760.jpg`
- `zoom3-detalhe.jpg`
- `caminhada-4-direcoes.jpg`
- `avatares-22x4-direcoes.png`
- `entrada.png`

## Limites e próximos passos sugeridos
1. **Perfil do avatar:** o deslocamento do rosto lê bem a 1× e 2×, mas ainda não é um perfil desenhado à mão. O próximo passo é um perfil feito à mão para um humano e uma espécie, como pede a direção.
2. **Vida e animação (V4):** flores e mato balançando, pás do moinho girando e galinhas andando. Por enquanto a arte é estática.
3. **Painéis:** a área jogável ainda divide a tela com cartões grandes. Reduzir os painéis depende de `index.html`/`style.css` e deve ser combinado com a issue #33.
4. **Terrenos expandidos:** recebem flores, mato alto, arbusto e pedras por sorteio fixo. Não foram testados com compra real, porque o caixa inicial não alcança o preço.
