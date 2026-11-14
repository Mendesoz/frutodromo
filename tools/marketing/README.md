# Material de divulgação (CrazyGames)

Gera as capas e os vídeos de prévia em `docs/crazygames/` com o visual atual do jogo. Nada aqui é carregado pelo jogo.

Ordem (rodar da raiz do repositório; tudo intermediário fica em `/tmp/qa9/`):

1. `python3 tools/marketing/export_sprites.py` — abre `index.html` no Chromium (Playwright, `Math.random` com semente) e exporta frutas, personagens e caldeirão para `/tmp/qa9/spr2/`.
2. Fonte do título: converter `Pixelify Sans` 700 (woff2 embutido no CSS) para TTF em `/tmp/fonts/pix700.ttf` com `fonttools` + `brotli` (ou passar outra via `FONT=`).
3. `python3 tools/marketing/make_covers.py` — capas 1920×1080, 800×1200, 800×800 e a capa de retrato do vídeo (1080×1620) em `/tmp/qa9/covers/`.
4. `python3 tools/marketing/rec_video.py land` e `... port` — grava a jogada encenada (screencast do Chrome, sem som). Abre `index.html` direto do disco (file://).
5. `python3 tools/marketing/assemble_video.py land` e `... port` — junta capa + jogada com ffmpeg (H.264, ~18–20 s).
6. Copiar para `docs/crazygames/`: `cover-*.png`, `preview-landscape-1920x1080.mp4`, `preview-portrait-1080x1620.mp4`.

A jogada usa só funções do jogo (`cross`, `treeAdd`, `newCust`, itens da bolsa) para montar a cena; não altera regras nem saves reais (roda num perfil temporário do navegador).
