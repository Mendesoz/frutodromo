Implementação concluída. Relatório:

## Arquivos alterados

**Novos**
- `server/src/layout.ts` — geometria do mapa. Sem importar `game.ts` (zero ciclo): `validatePlacement` devolve código e quem chama decide o status.
- `server/migrations/003_layout.sql` — `buildings.tile_x/tile_y`, backfill, `NOT NULL`, CHECK de mundo, `farms.hero`.
- `server/test/layout.test.ts` — 9 testes.

**Editados (só o combinado)**
- `server/src/game.ts` — união `Command` + `move`/`customize`, `seedFarm` com coordenadas explícitas via `defaultPosition`, snapshot ampliado, dois novos ramos no `execute` existente.
- `server/src/app.ts` — schema dos dois comandos, `import { registerClient } from './client.js'` e `await registerClient(app)` imediatamente antes do `return app`. Não toquei em hooks, cookies, CORS/origem, rate limit nem no error handler.

## Contrato final

`GET /api/farm` ganhou, sem remover nada: `parcelSize: 12`; `footprints: {plot:{w:2,h:2},feed_mill:{w:3,h:3},coop:{w:3,h:3}}`; `obstacles: [{kind:'house',x:1,y:6,w:2,h:3},{kind:'stand',x:9,y:7,w:2,h:3}]`; `farm.hero` (0–21, padrão 0); `tile_x`/`tile_y` em cada item de `buildings`.

Mundo: terrenos −2..2 de 12×12; tiles válidos −24..35 inclusive. O servidor só fala em tiles.

Layout inicial (igual na migração e em cadastro novo): `feed_mill` slot0 (1,1), `coop` slot0 (7,1), `plot` slot0 (3,7), slot1 (6,7). Nenhum nasce sobre casa, banca ou outro prédio, e todos cabem no terreno (0,0) — verificado por asserção nos testes.

`{"type":"move","buildingId":uuid,"x":int,"y":int}` — mesmo `execute`, mesma transação, mesma trava `FOR UPDATE` na fazenda e mesma idempotência por `Idempotency-Key`. Valida dono, inteiros, limites do mundo com a pegada inteira, todos os terrenos cobertos comprados e ausência de sobreposição com prédios e com os dois obstáculos (retângulos meia-abertos — encostar é permitido). Recibo `{key,type:'move',buildingId,x,y}`. Erros: `INVALID_BUILDING` 409, `INVALID_POSITION` 400, `MOVE_OUTSIDE_LAND` 409, `MOVE_OVERLAP` 409. Não escreve em preço, receita, job, capacidade ou fila — só `tile_x/tile_y`.

`{"type":"customize","hero":0..21}` — recibo `{key,type:'customize',hero}`; fora da faixa é 400 (`INVALID_HERO` na chamada direta, `INVALID_REQUEST` pelo schema HTTP).

Concorrência: como toda mutação passa pela trava da fazenda, dois movimentos válidos que colidem são serializados e o segundo vê a posição já gravada e recebe `MOVE_OVERLAP`.

## Limitações de verificação

**Não executei testes, nem `check`, nem `build`, nem comandos ou navegador.** Tudo abaixo é leitura de código.

1. **`app.ts` não compila até o Codex criar `server/src/client.ts`** exportando `registerClient`. `npm run check`, `npm test` e a importação de `buildApp` em qualquer teste falham nesse intervalo. Foi o que a tarefa pediu; é o primeiro ponto a conferir na integração.
2. O CHECK do banco cobre só o tile de origem (−24..35). A extensão da pegada e a posse do terreno vivem em `layout.ts`; escrita direta no SQL contorna isso.
3. O backfill cobre as quatro combinações kind/slot que o cadastro cria. Qualquer outra cai numa faixa livre (`y=4`, `x=3+(slot%3)*3`) que pode colidir a partir de `slot >= 3` ou entre kinds diferentes de mesmo slot. Nenhum banco atual tem essas linhas; preferi isso a travar a migração.
4. O teste de migração monta um PGlite temporário com 001+002 aplicadas à mão e depois roda `migrate`, replicando o `split(';')` do `db.ts` — logo depende desse detalhe de implementação continuar igual.
5. O teste de concorrência exige exatamente um 200 e um 409. Com PGlite a serialização é trivial (conexão única); a prova real é o PostgreSQL do CI.
6. `layout.test.ts` nunca trunca: usa usuários `u<uuid curto>` e só lê. Como `layout` vem antes de `online` na ordem alfabética, o `TRUNCATE players CASCADE` do `online.test.ts` roda depois e não atropela nada — mas isso vale com `--test-concurrency=1`.
7. Não vi conflito com arquivos do Codex: `client.ts`, `server/web/` e os demais migrations seguem intocados.