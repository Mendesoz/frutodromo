# Entrega do Claude — mercado virtual, 16/11/2026

Resposta recebida de uma sessão dedicada do Claude Code. Os testes citados como pendentes na entrega foram executados pelo Codex posteriormente; consultar QA_MERCADO_2026-11-16.md para o resultado final.

Entrega pronta. Os três arquivos foram escritos; não rodei nada (sem comandos, conforme combinado).

## Arquivos

**`server/migrations/004_market.sql`** — `market_listings` (id, seller_farm_id→farms, item, quantity 1..100, unit_price 1..1000, status active/sold/cancelled, buyer_farm_id, created_at/sold_at/cancelled_at) e `market_trades` (listing_id **UNIQUE**, buyer/seller, item, quantity, unit_price, total_price, created_at). CHECKs: coerência status×datas×comprador, comprador ≠ vendedor, `total_price = quantity * unit_price`. Índices: parcial de ativos `(created_at DESC, id)`, `(seller_farm_id, status, created_at DESC, id)` para `activeMarketReserved`, e por comprador/vendedor nas trocas. Só DDL simples, sem função nem string com ponto e vírgula. Nada apaga histórico: cancelar e vender só mudam status e carimbam data.

**`server/src/market.ts`** — contrato exato pedido: `MarketCommand`, `isMarketCommand(command: {type:string})`, `MARKET_RULES` (`as const`), `market(db, clock?) → {execute(playerId, key, command, expectedFarmId?), snapshot(playerId)}`. Sem rota HTTP.

**`server/test/market.test.ts`** — 13 testes, PGlite `memory://` ou `TEST_DATABASE_URL` com guarda `_test`, usuários UUID curtos, **sem TRUNCATE**; nenhuma asserção depende de contagem global (sempre `find` por id).

## Decisões relevantes

**Ordem de travas.** Dentro da transação: 1) fazenda do ator e anúncio **sem trava** (só campos imutáveis: dono, item, lote, preço); 2) `FOR UPDATE` em todas as fazendas envolvidas, uma consulta por fazenda em ordem crescente de id (garante a ordem de aquisição sem depender do plano do banco); 3) só então `SELECT ... FOR UPDATE` do anúncio e conferência de `status='active'`. Nenhuma trava de anúncio antes das fazendas, então A→B e B→A não travam. `settle` + `farmTime` por fazenda travada antes de qualquer checagem de capacidade ou saldo.

**Idempotência.** `operations(farm_id,key)` com hash canônico de `domain.fingerprint`. Leitura sem trava antes de descobrir o anúncio (recibo é imutável) e **releitura sob trava antes de qualquer efeito**; hash diferente → `OPERATION_KEY_REUSED`. Mesma regex de chave do `game`. `expectedFarmId` conferido antes e sob trava → `FARM_CHANGED`.

**Custódia.** Anunciar usa `consume` (lote sai do estoque) e grava a linha ativa: a ocupação total não muda, então anunciar nunca abre espaço. Cancelar devolve o lote inteiro na mesma transação **sem checar capacidade** — a reserva já ocupava exatamente aquele espaço. Comprar só credita o comprador (vendedor já entregou), com `occupancy().total + quantity > capacity → STORAGE_FULL`. Preço/lote vêm sempre do banco. Sem taxa, sem compra parcial.

**Chaves de auditoria:** `listing:<id>` (saída), `listing:<id>:cancel` (devolução), `trade:<tradeId>` (moedas dos dois lados + item do comprador). O sufixo `:cancel` é obrigatório por causa de `inventory_events UNIQUE(farm_id,operation_key,item)`. Não colidem com `command:`.

**Erros:** os do contrato, mais `INVALID_OPERATION_KEY`/`INVALID_COMMAND` (400), `OPERATION_KEY_REUSED`/`FARM_CHANGED` (409) e `FARM_NOT_FOUND` (404), todos reaproveitados do `game`. `listingId` malformado vira `LISTING_NOT_FOUND` (não chega ao banco como uuid inválido).

## Pendências e riscos para o Codex

1. **Não executei os testes.** Revisão limitada a leitura; rode `npm run verify` e o CI com PostgreSQL.
2. **Um teste depende de você**: *"lote reservado protege o cancelamento mesmo com producao"* espera `STORAGE_FULL` ao enfileirar produção com lote reservado — só passa quando `game.ts` usar `occupancy()` (hoje soma apenas estoque + jobs). É o cruzamento proposital entre as duas frentes.
3. **`consume` grava `reason='consumed'`** (fixo no helper, seu arquivo). A custódia fica identificável só pela chave `listing:%`. Se quiser razão própria (`market_listing`), adicione o parâmetro em `economy.ts` e eu ajusto.
4. **`money` com teto de 2.000.000.000**: vendedor perto do teto receberia `INSUFFICIENT_COINS`, mensagem enganosa. Improvável no piloto.
5. `snapshot` do mercado não avança `last_processed_at` (sem trava); `serverTime` vem do relógio compartilhado. A produção é acertada em `game.snapshot`.
6. Validação de formato roda antes do replay: se as regras de preço mudarem, a repetição de um comando antigo é recusada em vez de devolver o recibo.
7. PGlite serializa transações — concorrência real só é comprovada com `TEST_DATABASE_URL`.

Piloto virtual e resetável: não há antifraude de multiconta nem qualquer prontidão comercial aqui.
