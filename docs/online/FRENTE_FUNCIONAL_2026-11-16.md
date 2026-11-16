# Frente funcional e organização — fila das etapas 4 e 5

16/11/2026, Claude. Branch `claude/frente-funcional`, derivada de `codex/fazenda-online-base` em `a1e29d8`.

Este documento é **só documental**. Ele não altera `server/`, o protótipo, as mecânicas nem o visual. Tudo que aparece como "proposta" depende de o Codex combinar os arquivos no roadmap ou no PR antes de alguém editar.

Divisão pedida pelo Eric em 16/11:
- **Frente visual:** direção do Codex, com uma cena de referência em `docs/online/estudo-visual/` antes de mexer no cliente. A identidade original fica preservada e o mundo acompanha os personagens.
- **Frente funcional e de organização:** este documento.
- **Fora daqui:** VIP, passe e comissão continuam em descoberta.

### Revisão de integração do Codex

Recebido em3f743d7 e incorporado como especificação proposta, sem iniciar implementação. Antes de converter a proposta em código:

- A condição visual de capacidade precisa usar **estoque + reservas de produção + reservas de mercado**, descontando o insumo do ciclo tentado; `capacity − reservedCapacity` sozinho, citado abaixo, não representa espaço livre. Considerar também fila cheia/início futuro. O servidor permanece autoridade.
- O acerto automático precisa ordenar **todos** os eventos de produção da fazenda cronologicamente, incluindo novos ciclos inseridos entre eventos já existentes, com desempate determinístico. Tratar cada instalação isoladamente pode alterar consumo/capacidade conforme a frequência do login. O texto de `settle` abaixo é esboço, não algoritmo já validado.
- Comparar equivalência online/offline por efeitos econômicos/ordem lógica, normalizando UUIDs e timestamps de auditoria de execução. Não exigir igualdade literal de identificadores aleatórios entre duas simulações.
- `just_done` só é válido com confirmação consistente de produção na mesma fazenda. Ausência de um job numa resposta descartada, troca de conta ou reinício do piloto não é prova de conclusão.
- Testar em iPhone físico é critério técnico pendente proposto para QA; o pedido explícito do Eric é priorizar telefone em pé e ter boa experiência no iPhone. Não atribuir ao Eric uma nova exigência de aprovação textual que ele não fez.
- Nada nessa especificação aprova20ciclos/8h, preços novos, pagamentos, abertura pública ou criação de20instalações. Limites por regra e por fazenda ainda serão definidos e medidos.

## 1. O que existe hoje (lido do código em `a1e29d8`)

| Entidade | Campos reais | Observação para as próximas etapas |
|---|---|---|
| `farms` | `id`, `player_id` (único), `name`, `capacity` (padrão 200), `seed_recovered_at`, `last_processed_at`, `hero` (0–21) | `last_processed_at` só avança, porque `farmTime` usa o maior entre o relógio e o último processamento. É a âncora do acerto offline. |
| `wallets` | `coins` (0–2.000.000.000) | Toda mudança passa por `money()` e grava no `ledger`. |
| `inventory` | `item` ∈ {`corn`,`feed`,`egg`}, `quantity` | Toda mudança grava em `inventory_events` com `reason` e `operation_key`. |
| `land` | `x`,`y` ∈ −2…2, em **parcelas** | Cada parcela tem 12×12 tiles (`PARCEL_SIZE`). Comprar terreno dá área, não capacidade. |
| `buildings` | `id`, `kind` ∈ {`plot`,`feed_mill`,`coop`}, `slot`, `queue_limit` (1–9), `tile_x`,`tile_y` (−24…35) | Ocupação vem de `FOOTPRINTS`: plot 2×2, moinho 3×3, galinheiro 3×3. Obstáculos fixos: casa (1,6, 2×3) e banca (9,7, 2×3). |
| `production_jobs` | `building_id`, `recipe`, `output_item`, `output_quantity`, `started_at`, `finishes_at`, `claimed_at` | O insumo é consumido ao enfileirar. A saída fica reservada na capacidade. `settle()` credita os trabalhos vencidos em ordem (`finishes_at`, `id`). Não existe estado "pronto para colher": o produto entra no estoque sozinho. |
| `market_listings` / `market_trades` | lote inteiro, `unit_price`, `status` ∈ {active, sold, cancelled}, comprador e vendedor | Lote ativo ocupa capacidade (`marketReservedCapacity`). |
| `ledger`, `inventory_events`, `operations` | delta, motivo, chave de operação, resultado idempotente | São a base para medir produção, consumo, retorno e negócios na etapa 4. |

**Snapshot `GET /api/farm`:**
- relógio e fazenda: `serverTime`, `farm{id,name,capacity,hero}`;
- recursos e produção: `coins`, `inventory[]`, `buildings[]`, `jobs[]`, `land[]`, `recipes`, `order`;
- layout: `parcelSize`, `footprints`, `obstacles`;
- economia: `economy` (`pilot-resettable-v1`), `seedPrice`, `nextExpansionCost`;
- capacidade: `marketReservedCapacity`, `productionReservedCapacity` e `reservedCapacity`.

**Receitas:**
- milho: 1 milho vira 2 em 30 s;
- ração: 2 milhos viram 1 ração em 45 s;
- ovo: 1 ração vira 1 ovo em 60 s;
- encomenda fixa: 2 ovos por 18 moedas.

**Cliente:**
- `web/map.js` usa `TILE=24` px nativos e zoom inteiro 1–3;
- sincroniza a cada 8 s (quando a aba está visível e livre) e roda um relógio local de 1 s;
- desenha o personagem com o índice `hero`, a partir da folha de 40×52 por quadro.

## 2. Contrato de estado para a arte (proposta)

O objetivo é que a direção visual troque sprites, alturas e enquadramentos **sem mexer em coordenada lógica, ocupação ou regra**.

**Princípios:**
1. **O servidor só conhece tiles inteiros.** Posição (`tile_x`,`tile_y`), ocupação (`footprints`) e parcelas são lógicas. Nunca há pixel, altura de sprite ou zoom no banco ou na API.
2. **A ocupação é regra, o sprite é aparência.** Um prédio 3×3 pode ter sprite mais alto que 3 tiles (telhado, chaminé) sem ocupar mais chão. A colisão continua sendo o retângulo lógico.
3. **Âncora fixa: base no centro do retângulo.** O sprite se alinha pelo centro da borda de baixo da ocupação. Para um sprite de qualquer altura, `topo = base − altura_do_sprite`. Trocar a altura não move nada no mapa.
4. **Ordem de desenho pela linha de base.** `z = (tile_y + h) × 10`, como já acontece no cliente. Não depende do tamanho do sprite.
5. **A arte fica num manifesto do cliente.** O manifesto liga cada `kind` a `{sprite, largura, altura, âncora}`, e personagens e decorações também. Ele é a única coisa que a frente visual troca. O servidor não precisa saber dele.

**Estado de uma construção, derivado no cliente** (sem campo novo no servidor, exceto a automação, marcada abaixo):

```json
{
  "id": "uuid", "kind": "coop",
  "tile": { "x": 7, "y": 1 }, "footprint": { "w": 3, "h": 3 },
  "status": "working",
  "progress": 0.42,
  "queue": { "used": 1, "limit": 2 },
  "output": { "item": "egg", "quantity": 1, "finishesAt": "ISO" },
  "blocked": null,
  "automation": null
}
```

- **`status`:**
  - `idle`: sem trabalho;
  - `working`: tem trabalho com `started_at ≤ serverTime < finishes_at`;
  - `queued`: só há trabalho futuro na fila;
  - `just_done`: um trabalho que o snapshot anterior mostrava sumiu, ou seja, o produto entrou no estoque. É transitório, só para animação.
- **`progress`:** `(serverTime − started_at) / (finishes_at − started_at)`, avançado pelo relógio local entre as sincronizações e corrigido a cada snapshot.
- **`blocked`:** `null`, `storage` (capacidade − `reservedCapacity` < saída da receita) ou `input` (insumo insuficiente para o próximo ciclo). É derivado e serve para dizer **por que** a construção parou, coisa que a arte precisa mostrar.
- **`automation`** (somente na etapa 4, proposta abaixo): `{ "active": true, "cyclesLeft": 5, "until": "ISO", "stopReason": null }`.

**Personagem:**
- o servidor guarda só `hero` (o índice);
- a posição no mapa é decisão do cliente, em tiles fracionários: andar é animação, não regra;
- a folha mantém 3 quadros × 5 expressões, com 40×52 por quadro;
- se a direção visual mudar esse tamanho, muda só o manifesto, nunca o contrato.

**Ponto a corrigir quando o Codex mexer no cliente:** hoje `map.js` desenha o personagem com `top = coord(4) − 6×zoom`, um ajuste em pixels amarrado à altura do sprite atual. Com a âncora na base, esse ajuste vira dado do manifesto. Fica só registrado aqui; não editei o arquivo.

## 3. Fila curta — etapa 4: automação limitada

O plano pede uma regra de reposição por instalação, com reserva mínima de insumo, teto de ciclos, prazo, reserva de capacidade e o mesmo resultado online e offline.

**Dados (proposta, a combinar):** uma tabela `automation_rules`, com uma regra por construção:
- **identificação:** `building_id` (chave), `farm_id`, `recipe`;
- **limites:** `min_input_reserve` (não consumir abaixo disso), `cycles_left`, `expires_at`;
- **estado:** `stopped_reason` ∈ {`null`, `input`, `storage`, `expired`, `exhausted`, `cancelled`}, `created_at`, `updated_at`.

**Regra de execução, dentro de `settle()` e sob a trava da fazenda:**
- ao creditar um trabalho vencido de uma construção com regra ativa, tentar enfileirar o próximo com `started_at = finishes_at` do anterior, e não com o relógio atual. É isso que deixa o resultado offline igual ao online;
- antes de enfileirar, conferir, nesta ordem: `expires_at > started_at`, `cycles_left > 0`, `estoque(insumo) − amount ≥ min_input_reserve` e capacidade (`occupancy.total + output ≤ capacity`);
- a primeira condição que falhar grava `stopped_reason` e para a regra;
- repetir enquanto houver trabalhos vencidos. O laço termina porque `cycles_left` é finito e cada ciclo tem duração > 0;
- usar uma chave de evento estável (por exemplo `auto:<rule>:<n>`) para o acerto ser idempotente se o mesmo intervalo for processado duas vezes.

**Valores candidatos:** até 20 ciclos e prazo de até 8 h. São só para o teste, não balanceamento.

**Critérios de aceite** (cada um vira teste em PGlite e PostgreSQL 17):
1. **Online igual a offline:** a mesma fazenda, processada com sincronizações a cada 8 s ou com um único acerto 8 h depois, termina com estoque, moedas, trabalhos e `inventory_events` idênticos.
2. **Ciclos finitos:** depois de N ciclos, a regra fica `exhausted` e não cria trabalho. Nenhum caminho cria trabalho infinito.
3. **Prazo:** nenhum trabalho automático começa em `started_at ≥ expires_at`.
4. **Reserva mínima:** o estoque do insumo nunca fica abaixo de `min_input_reserve` por causa da automação. Uma ação manual pode ir abaixo.
5. **Capacidade:** a automação nunca leva `inventory + production + market` acima de `capacity`. Com o armazém cheio, ela para com `storage` e não descarta nada.
6. **Feira:** anunciar um lote reduz o insumo disponível para a automação na mesma transação. Comprar ou cancelar lote e a automação não se atropelam (trava em ordem de UUID, como na feira).
7. **Idempotência:** reprocessar o mesmo intervalo e repetir o comando de criar ou cancelar a regra com a mesma `Idempotency-Key` não duplica trabalho, evento nem moeda.
8. **Cancelamento:** cancelar a regra não devolve insumo de trabalho já enfileirado, que segue a regra atual. Só impede os próximos.
9. **Observação de economia:** um relatório somente leitura (script ou rota de QA, sem UI) agrega por fazenda e por período, a partir de `inventory_events`, `ledger` e `market_trades`:
   - produção por item;
   - consumo;
   - moedas ganhas e gastas;
   - negócios e preço médio.

**Divisão sugerida:**
- Codex: simulação, tempo e implementação, como no plano;
- Claude: revisão de gargalos e testes dos critérios 1–8, nos arquivos que o Codex delegar;
- o cliente só ganha controles depois dos critérios 1–5 verdes.

## 4. Fila curta — etapa 5: candidata para teste fechado

**Critérios:**
1. **Fluxo completo:** duas pessoas criam conta, produzem, expandem, negociam na feira e usam a automação **sem ajuda técnica**, no computador e no celular em pé. Evidência: gravação ou registro do teste e o relatório da etapa 4.
2. **Regressão:** `npm run verify` verde em PGlite e PostgreSQL 17 na CI, mais o QA de cliente nas quatro telas que já são usadas (393×760, 900×430, 1024×600, 1280×680).
3. **Backup e restauração:** um `pg_dump` feito, restaurado num banco limpo e conferido. A conferência compara a soma de moedas, o estoque por item e a quantidade de anúncios ativos e de negócios. O procedimento fica documentado. Para o PGlite, copiar `.data/postgres` só com o processo parado.
4. **Reinício da economia:** procedimento escrito para zerar `pilot-resettable-v1` sem apagar contas. Os testadores são avisados antes.
5. **Ambiente de teste:** acessível aos dois testadores. Hospedagem pública só com arquitetura e custo aprovados pelo Eric, como diz o plano. Enquanto isso, o teste é local ou por túnel controlado, decisão do Codex e do Eric.
6. **Página de limites conhecidos:** economia de teste que pode ser zerada, sem dinheiro real, e os números não estão validados.

## 5. Riscos abertos

| Risco | Situação hoje | Mitigação proposta para o alpha |
|---|---|---|
| **Multicontas** | O cadastro tem limite de 5 por minuto por IP e a API de 120 por minuto. A feira permite passar itens de uma conta para outra. | O alpha é fechado, por convite ou código. Registrar quem criou cada conta. O relatório da etapa 4 marca transferências repetidas entre as mesmas fazendas e preços fora da faixa. O impacto é baixo enquanto a moeda é virtual e pode ser zerada, mas o padrão precisa estar resolvido antes de qualquer valor real. |
| **Backup** | O PGlite grava em `.data/postgres` e é de um processo só. Não há rotina de backup. | Critério 3 da etapa 5. Para PostgreSQL, `pg_dump` agendado pelo ambiente de teste. Testar a restauração, não só gerar o arquivo. |
| **iPhone e Safari** | O QA de cliente roda no Chromium. Pela regra do Eric, nada vale como aprovado no iPhone sem teste no aparelho. | Teste em aparelho real antes do alpha: cookie `SameSite=Lax` e `Secure` com HTTPS, rastreamento do Safari (ITP), arrastar e dar zoom no mapa, memória de canvas com zoom 3, `100vh` com a barra do Safari e nitidez do pixel art (`image-rendering`). Registrar como BLOQUEADO enquanto não houver aparelho. |
| **Carga** | Cada `GET /api/farm` trava a fazenda e roda `settle()`. O cliente sincroniza a cada 8 s por aba. A automação aumenta o trabalho do acerto. | O custo do acerto é limitado por regra (ciclos ≤ 20). Medir o tempo do snapshot com 20 regras e 8 h offline. Não sincronizar abas em segundo plano (o cliente já respeita `document.hidden`). Revisar o tamanho do pool de conexões quando houver hospedagem. |
| **Relógio** | `farmTime` usa o relógio do banco e nunca volta. | Manter. Nenhum horário vem do cliente na automação. |

## 6. Próximo passo e combinação

- Este documento não inicia nenhuma implementação.
- Quando o Codex combinar os arquivos da etapa 4 (por exemplo `migrations/005_automation.sql`, um módulo próprio e os testes), Claude implementa ou revisa só a parte delegada, como na feira.
- Os pontos do contrato de arte (âncora na base, manifesto no cliente) ficam para a frente visual do Codex decidir no `estudo-visual/`.
