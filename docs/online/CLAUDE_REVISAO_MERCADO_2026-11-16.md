# Revisão final recebida do Claude Code — 16/11/2026

Leitura independente do código da etapa3, antes do ajuste M3/B3 pelo Codex. Quando o prompt foi enviado havia42testes locais; depois o Codex executou43locais e a cobertura final44/44 PostgreSQL17 passou no CI43855795937. O Claude não executou testes. Resultado e tratamento dos achados no QA_MERCADO_2026-11-16.md.

Revisão feita só com leitura (Read/Glob/Grep). Não editei nada, não rodei nenhum comando e não li `.env`, `.data` nem credenciais. Os 42 testes verdes são o que você me informou — eu não os executei.

# Revisão independente — Brotalume etapa 3 (mercado)

## Veredito

**Não encontrei bloqueador.** A espinha dorsal de concorrência e conservação está correta por leitura. Os achados abaixo são de gravidade média para baixo, e o maior risco não é bug: é o que o mercado abre na economia do piloto.

## O que verifiquei e está certo

- **Ordem de travas.** `market.ts:103-111` trava as fazendas por id ordenado, sempre antes do anúncio (`:176` → `:198`). Nenhum caminho trava anúncio antes de fazenda, e `game.ts` também trava `farms` primeiro (`economy.ts:35`). Compra recíproca A↔B e compra×cancelamento não fecham ciclo.
- **Replay duplo.** Leitura sem trava (`market.ts:162`) e releitura sob trava antes de qualquer efeito (`:179`). Em READ COMMITTED a segunda transação enxerga o recibo recém-commitado e nunca colide com a PK `operations(farm_id,key)`.
- **Custódia neutra.** `consume` + linha ativa (`market.ts:192-194`) com `activeMarketReserved` somando na ocupação (`economy.ts:47-55`): anunciar não abre espaço, e cancelar sem checar capacidade (`:203-207`) é seguro porque `game.ts` conta a reserva em `occupancy` (`game.ts:86`, `:103`, `:109`). O invariante "todo write em `market_listings` de uma fazenda segura a trava daquela fazenda" se mantém nos três comandos.
- **Conservação.** Item: sai do estoque no anúncio, volta no cancelamento, entra só no comprador na venda. Moeda: `money` nos dois lados com a mesma chave `trade:<id>`, e `ledger UNIQUE(farm_id,operation_key)` permite os dois lados sem permitir duplicata. Chaves de auditoria não colidem (`listing:`, `listing:*:cancel`, `trade:`, `command:`, `job:`).
- **Troca de contas.** `expectedFarmId` conferido antes de qualquer efeito (`market.ts:160`) e recusa sem gravar recibo.
- **CHECKs do schema** fecham os estados impossíveis (`004_market.sql:16-20`, `:30`, `:38-39`): vendido sem comprador, cancelado com data de venda, auto-compra, total divergente.

## Achados

### Média

**M1 — O mercado transforma o brinde de cadastro em torneira transferível.**
`game.ts:28-29` dá 80 moedas + 4 milhos a cada conta nova; `market.ts:14-22` não tem teto de volume por fazenda nem por dia; `app.ts:63` limita cadastro a 5/min. Um anúncio sozinho move até 3.000 moedas, então uma conta descartável esvazia as 80 moedas dela numa única venda combinada. Antes da etapa 3 o brinde ficava preso na conta. Conservação continua válida (nada é criado), mas **concentração** passou a ser possível: ~400 moedas/min por IP.
Correção mínima, se quiser fechar agora: exigir uma entrega de encomenda concluída (ou idade mínima de conta) antes de liberar `market_list`/`market_buy`, ou um teto diário de moedas negociadas por fazenda em `MARKET_RULES`. Se a decisão for aceitar, vale registrar explicitamente no doc do piloto.

**M2 — A vitrine é monopolizável e não tem paginação.**
`market.ts:131-133` mostra `LIMIT 60 ORDER BY created_at DESC` sem teto por vendedor, e `maxActiveListings: 12` (`market.ts:16`). Cinco contas enchem a vitrine inteira, e cancelar+reanunciar devolve o topo. Passando de ~60 anúncios ativos, a maioria dos vendedores some da feira.
Correção mínima: limitar a 2 ou 3 anúncios por vendedor na consulta da vitrine (`row_number() OVER (PARTITION BY l.seller_farm_id ORDER BY l.created_at DESC, l.id) <= 3`), mantendo o `LIMIT 60`.

**M3 — Compra que falha deixa o diálogo aberto com o erro escondido atrás dele.**
`web/app.js:25` manda o erro para `#noticeText`, que fica atrás do backdrop do `<dialog>`; `web/market.js:139` só fecha o diálogo em caso de sucesso. Para `LISTING_UNAVAILABLE` o `refresh(true)` conserta o texto interno. Para `INSUFFICIENT_COINS` e `STORAGE_FULL` não: `this.farm` continua o snapshot antigo (`refresh()` só busca `/api/market`), então `renderPurchase` reabilita `tradeConfirm` e o jogador clica de novo no mesmo erro invisível.
Correção mínima: no `catch` de `sendPending`, para comandos `market_*` sem pendência, chamar também `sync({quiet:true,fresh:true})` e passar a mensagem para a UI do mercado (um `failed(body, msg)` que escreve em `#tradeMessage` e chama `refresh(true)`).

### Baixa

**B1 — `validate()` roda antes do replay** (`market.ts:155` vs `:162`). Se `MARKET_RULES` mudar entre o pedido original e o reenvio, a repetição é recusada com `INVALID_MARKET_PRICE` em vez de devolver o recibo — o cliente anuncia falha para uma operação que deu certo. Correção mínima: manter `KEY_PATTERN` primeiro, mover `validate(command)` para depois do primeiro `replay`. O `fingerprint` não depende da validação e o único acesso ao banco antes seria `operations` por `(farm_id,key)`, com a chave já validada.

**B2 — Vendedor no teto de moedas devolve `INSUFFICIENT_COINS` ao comprador** (`economy.ts:22-23`, chamado em `market.ts:221`). Mensagem enganosa. Já estava registrado na entrega original; inalcançável no piloto (2e9).

**B3 — `unitPrice` máximo duplicado.** `app.ts:25` fixa `maximum: 30` enquanto a faixa real é por item em `MARKET_RULES.prices` (`market.ts:17-21`). Subir `egg.max` acima de 30 passaria a dar 400 no schema antes de chegar na regra. Correção mínima: `maximum: Math.max(...Object.values(MARKET_RULES.prices).map(p => p.max))`.

**B4 — `stable()` não canonicaliza objetos dentro de array** (`domain.ts:7-11`), e UUID em maiúscula gera hash diferente embora o Postgres trate como o mesmo uuid (`market.ts:28` é case-insensitive, igual ao `format: uuid` do ajv). Nenhum comando atual usa array e o cliente devolve o id como veio do servidor, então é latente. Correção mínima: recursão em array no `stable()`.

**B5 — Até 3 `GET /api/market` por comando confirmado.** `app.js:25` faz `sync` → `render` → `setFarm` → `refresh()`, e em seguida `confirmed()` chama `refresh(true)`, que cai no reentrante de `market.js:52` e dispara mais um. Somado ao poll de 8s com o painel aberto, continua dentro dos 120/min, mas é desperdício. Correção mínima: em `refresh`, quando já há requisição em voo para a mesma fazenda, reaproveitá-la em vez de encadear outra.

**B6 — `market_trades ... WHERE buyer_farm_id=$1 OR seller_farm_id=$1 ORDER BY created_at DESC`** (`market.ts:138-142`) não usa índice para a ordenação. Irrelevante no piloto; vira `UNION ALL` quando o histórico crescer.

**B7 — Anúncio não expira.** Conta abandonada congela a capacidade dela para sempre. Aceitável num piloto resetável, mas merece uma linha no doc.

## O que os 42 testes locais não provam

Com `TEST_DATABASE_URL` vazio tudo roda em PGlite, cujo `transaction()` serializa (`db.ts:41`), e `market.test.ts:269`, `:296` e `:325` caem no fallback `other = db`. Ou seja: **"dois compradores ao mesmo tempo", "cancelar e comprar ao mesmo tempo", "compra recíproca" e as 8 repetições da mesma chave viram execuções sequenciais.** Ordem de travas, ausência de deadlock e o padrão de releitura do recibo sob trava só são exercidos de verdade no job PostgreSQL do CI (`.github/workflows/fazenda-online.yml`). Até ele ficar verde, concorrência é "correta por leitura", não verificada.

Lacunas que valeria cobrir depois do CI passar:
- `market_buy` concorrente com um comando de `game.ts` na mesma fazenda — os dois módulos travam `farms` por predicados diferentes (`WHERE player_id=$1` em `economy.ts:35` vs `WHERE id=$1` em `market.ts:106`); é o único cruzamento entre frentes sem teste.
- Dois `market_list` simultâneos exatamente no limite de `maxActiveListings`.
- Teto de moedas do vendedor (B2).

## Riscos do piloto virtual resetável, para registro

1. Moeda e item agora atravessam contas. Sem antifraude de multiconta, o brinde de cadastro é funilável (M1).
2. Preços de `MARKET_RULES` são números candidatos, não equilíbrio validado — o próprio comentário em `market.ts:12-13` diz isso. Com troca entre contas, erro de faixa agora se propaga entre jogadores, não fica contido numa conta.
3. `recover_seed` continua sendo torneira de 1 milho/hora por conta (`game.ts:97-110`); o mercado não aumenta a taxa, mas torna o produto dela vendável.
4. A tabela `operations` cresce sem poda; num reset do piloto isso some, mas é dívida se o piloto virar permanente.
5. Nada aqui tem prontidão comercial: sem antifraude, sem moderação de nome de fazenda exibido na vitrine pública (`market.ts:37`, nome vai para toda conta logada) e sem mecanismo de reversão de negócio.

Se quiser, posso montar o escopo de correção para M3 + B1 + B3 (as três com patch pequeno e sem tocar em mecânica) e mandar para o developer.