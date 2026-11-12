# Frutódromo — instruções para agentes (Codex, Claude e outros)

Jogo de navegador em pixel art (HTML, CSS e JavaScript puro, sem frameworks): o jogador cruza frutas num caldeirão, descobre espécies numa árvore e atende clientes NPC numa quitanda. O dono do projeto é o Eric. Responda sempre em português do Brasil.

Mais de um agente trabalha neste repositório ao mesmo tempo (Claude e Codex). Estas regras existem para ninguém sobrescrever o trabalho do outro.

## Antes de começar qualquer tarefa
1. `git pull --rebase origin main`.
2. Leia `docs/roadmap-visual.md`, principalmente a seção **Quem está mexendo em quê**. Se a área que você vai mexer já está marcada por outro agente, escolha outra ou combine com o Eric.
3. Marque a sua área na tabela (agente, área, arquivos/funções, data e hora) e faça um commit pequeno só com essa marcação (`docs: Codex pega <área>`), com push, antes de começar o trabalho de verdade.

## Enquanto trabalha
- Commits pequenos e focados, com mensagem em português dizendo o que mudou e por quê.
- Mexa só no que a sua tarefa pede. Achou outro problema? Anote em `docs/roadmap-visual.md` (seção de pendências) em vez de corrigir por conta própria.
- Antes de cada push: `git pull --rebase origin main`, resolva conflitos preservando o trabalho dos dois lados, rode as verificações abaixo e só então `git push`.
- Nunca use `git push --force`, `git reset --hard` em commits já enviados nem reescreva histórico compartilhado.
- Ao terminar, desmarque a sua área na tabela e registre o que fez no roadmap.

## Verificações obrigatórias antes de enviar
- `node --check js/game.js` e `node --check js/i18n.js`.
- Abrir o jogo e jogar: entrar, comprar, cruzar 2 frutas no caldeirão, entregar a um cliente, vender, passar o dia e recarregar a página com o progresso intacto, sem erro no console.
- Testar no celular (393×760), na janela do CrazyGames (1024×600), em janela baixa (900×430) e no computador (1280×680).
- Se mudou algo que vai para o ar, aumente a versão do cache em `sw.js` (`frutodromo-vN`).
- Texto novo em português precisa da tradução em `js/i18n.js`.

## Regras do jogo (não quebrar)
- Não alterar mecânicas, economia (preços, pagamentos), progressão (níveis, desbloqueios) nem salvamento sem pedido explícito do Eric.
- Saves antigos precisam continuar carregando (`normState`, `migrate`). Save em `localStorage["frutodromo9"]` e no Data Module do SDK quando roda no CrazyGames.
- Não quebrar arrastar e soltar (frutas, caldeirão, entrega, lixeira).
- Pixel art gerada por código: sprites em canvas (`toImg`, `art(rows, paleta)`), sem arquivos de imagem, `image-rendering: pixelated`.
- **Escala só inteira**: 1 pixel de arte = 2 px CSS no cenário; objetos de destaque em múltiplos inteiros (frutas 2–7x, caldeirão 2x de 48×44). Nada de `zoom`, `scale()` ou `rotate()` fracionário em sprite.
- Respeitar `prefers-reduced-motion`. Não sacrificar desempenho por efeito.
- Personagens originais; nada com direitos autorais nem pessoas reais.

## Mapa do projeto
- `index.html`, `css/style.css`, `js/i18n.js` (português → inglês), `js/game.js` (todo o jogo), `sw.js` (cache offline), `manifest.json`.
- `tools/bundle.py saida.html` gera o arquivo único (usado no artifact do Claude). `tools/build_portal.py` gera o zip do CrazyGames em `dist/` (fora do git).
- `docs/roadmap-visual.md`: roadmap visual em etapas, registro de cada etapa e a tabela de quem está mexendo em quê.
- `docs/crazygames/`: capas, vídeos e texto da página do jogo no portal.
- `.claude/`: agentes e hooks do Claude Code (não mexer sem pedido).

## Publicação
O site é o GitHub Pages da branch `main` (mendesoz.github.io/frutodromo). Tudo que vai para a `main` vai para o ar, então só envie o que passou nas verificações.
