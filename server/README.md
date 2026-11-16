# Base online da fazenda — piloto

Entrada online separada do Frutódromo e do protótipo local. Cliente jogável em `/play/`, com cadastro/login, mapa, produção e expansão conectados à API. Nenhum save `frutodromo9`/`fazenda_proto_v2` é importado. Economia `pilot-resettable-v1`, virtual, pode ser zerada; não há mercado P2P, pagamento, saque ou saldo negociável.

## Rodar

Requer Node >=22. Na pasta `server`: `npm ci`, `npm run dev`. Jogo em `http://127.0.0.1:8860/play/`; API na mesma origem. Sem configuração, usa PostgreSQL embarcado PGlite com dados persistentes em `.data/postgres`, no processo servidor, fora do navegador. Não inicia Docker ou ocupa janelas do computador. `PGLITE_DATA_DIR` permite separar o banco de QA; não abrir o mesmo diretório PGlite em dois processos simultâneos.

Para PostgreSQL convencional, configure `DATABASE_URL` em `.env` (veja `.env.example`). Migrações são aplicadas ao iniciar. Produção exige PostgreSQL e origem HTTPS explícita; não existe hospedagem de backend configurada nesta rodada. Mantenha a API local até a revisão de operação para teste hospedado. `HOST` é loopback por padrão.

`npm run verify`: tipos e testes de integração. `npm run build` compila; `npm start` roda o compilado. A CI usa PostgreSQL 17 real, duas pools/instâncias e testes concorrentes. `TEST_DATABASE_URL` é exclusivo de testes, deve terminar em `_test` e seu conteúdo é apagado pela suíte; nunca aponte para dados reais.

`npm run review:claude` executa uma revisão independente com a sessão autenticada do Claude Code, apenas Read/Glob/Grep, sem edição ou MCPs. Resultado privado em `.claude-results`. Usa sua assinatura/limites do Claude; não roda em cada push nem fica ligado após a revisão. Codex avalia e aplica os achados. Não injeta mensagens na conversa antiga da extensão.

## API

Todos os POSTs exigem `Origin` igual a `PUBLIC_ORIGIN` e `Content-Type: application/json`. Sessão em cookie HttpOnly/SameSite=Lax, Secure em produção; sete dias de validade. Senhas com scrypt (padrão Node: N=16384, r=8, p=1), sal aleatório de 16 bytes, chave de 64 bytes; tokens de 32 bytes são armazenados apenas como SHA-256.

O cliente envia também `X-Farm-Id` nos comandos com a fazenda retornada pelo snapshot. O servidor deriva o dono da sessão e confere essa expectativa dentro da transação; divergência dá409/FARM_CHANGED sem qualquer efeito. O header não permite escolher o dono ou autorizar outra fazenda. Isso cobre uma mudança de cookie em outra aba entre o clique e o envio.

| Rota | Corpo/resultado |
|---|---|
| GET `/health` | prontidão do banco |
| GET `/api/auth/status` | booleano de sessão, sem expor token ou dados da conta |
| POST `/api/auth/register` | `username`, `password` (10–128 caracteres), `farmName` |
| POST `/api/auth/login` | `username`, `password` |
| POST `/api/auth/logout` | `{}` |
| GET `/api/farm` | relógio servidor, fazenda, moedas, inventário, construções, filas, terrenos, receitas e encomenda |
| POST `/api/commands` | comando abaixo + header `Idempotency-Key` (8–100 letras/números/`_`/`-`) |

Comandos:
- `{"type":"queue","buildingId":"UUID da própria fazenda","recipe":"corn"}`; receitas `corn`, `feed`, `egg`.
- `{"type":"deliver"}`: consome 2 ovos e paga 18 moedas de teste; pedido piloto fixo e repetível.
- `{"type":"buy_seed"}`: 1 milho por 3 moedas.
- `{"type":"recover_seed"}`: 1 milho quando milho=0, sem colheita de milho pendente, saldo<3; intervalo mínimo de 1h.
- `{"type":"expand","x":1,"y":0}`: apenas vizinho lateral, grade -2…2, custo 60×terrenos já comprados. Dá área, não máquinas/capacidade.
- `{"type":"move","buildingId":"UUID","x":12,"y":4}`: move em tiles inteiros, só em terrenos próprios, sem sobrepor prédios/casa/banca; não altera a produção.
- `{"type":"customize","hero":1}`: salva um dos 22 personagens originais, índice 0–21.

## Mapa e cliente

Cada terreno tem 12×12 tiles; tile de24px nativos, zoom1/2/3 inteiro. Arraste o fundo para explorar, use o zoom ou as setas com foco no mapa. “Organizar” permite arrastar uma construção, escolher uma posição no cenário ou usar coluna/linha. “Expandir” lista os terrenos vizinhos e mostra custo/saldo antes de comprar.

Layout, personagem e compras ficam no servidor. O cliente usa cookie HttpOnly e GET de sincronização; nunca localStorage como autoridade. Se um comando tem resposta incerta, mantém a mesma chave para reenvio, bloqueia novas mutações e continua atualizando estoque/filas. Pedidos pendentes são vinculados à fazenda e descartados ao sair/trocar de conta. Respostas antigas não substituem estado de outra conta ou de uma ação mais recente. Arte/fontes usam ETag com revalidação; HTML/API continuam no-store.

Arte: molduras, fontes, personagens, toldo e decoração originais reaproveitados de prototipo-fazenda/. Terreno e instalações em pixel art procedural. Entrada online em português nesta etapa; não é o build de portal nem uma alteração do jogo publicado.

Os números são candidatos de teste. Cadastro dá 80 moedas, 4 milhos, 2 canteiros, moinho e galinheiro. Milho consome 1/produz 2 em 30s; ração consome 2 milhos/produz 1 em 45s; ovo consome 1 ração/produz 1 em 60s. Canteiro comporta 1 trabalho, moinho/galinheiro 2 em sequência. Animais não se aposentam neste piloto. Não há raridades nem sorteio de produção.

O resgate também exige ausência de ração, jobs pendentes e pedido completável (2 ovos). Um ovo isolado não impede resgate, pois não permite pagar/produzir outra semente e bloquear esse caso causaria travamento. Antes de comércio P2P, revisar a regra e a transferibilidade da semente recuperada.

## Invariantes

- Cada comando bloqueia a própria fazenda em transação; consulta também bloqueia para acertar produção vencida uma única vez. Sem `setInterval` econômico. Todos os caminhos de mutação seguem a mesma trava.
- Horário vem do banco compartilhado (`clock_timestamp`), não do relógio do navegador ou de cada processo API; não retrocede por fazenda. A conclusão usa timestamps fixos, e jobs concluídos têm `claimed_at`. Sem produção infinita offline: só os trabalhos explicitamente enfileirados (máximo 1/2 por instalação). Injeção de clock existe apenas na construção do app para testes, inclusive cadastro; sessão sempre usa tempo real do banco.
- Ingredientes saem ao enfileirar. Saídas reservam espaço imediatamente: inventário + reservas <= capacidade. Isso evita perder itens ou bloquear uma entrega com armazém cheio; é uma política piloto a testar na UI.
- Repetir chave/payload devolve exatamente o recibo persistido; chave com outro payload dá409. Falha desfaz consumo, moedas, eventos e trabalho.
- Razão de moedas e eventos de inventário permitem reconciliar saldos. Eventos de comandos e de jobs usam namespaces distintos. Nenhum cliente define preço, quantidade produzida, saldo, dono ou horário.
- PGlite é conveniência para desenvolvimento em uma instância. Não demonstra escalabilidade ou concorrência de PostgreSQL real.
- Consultas de API também rejeitam `Sec-Fetch-Site: cross-site`. Sessões expiradas são limpas no login/cadastro; cada conta mantém no máximo 10 sessões ativas. Retenção dos registros econômicos não é apagada automaticamente, para não permitir repetir pagamentos antigos.

## Antes de teste público

Ainda faltam: mercado com reserva/transação entre fazendas; recuperação de conta e troca de senha; limites distribuídos por conta/IP (o limitador atual é por processo/IP); política de arquivo de jobs/operações; backup/restauração verificados; monitoramento do relógio do banco e intervenção em desvio abrupto; telemetria, TLS e configuração de hospedagem; teste de carga, abuso de contas múltiplas e revisão do resgate antes de itens transferíveis. Safari/iPhone real e conexão externa ainda precisam de QA específico. Não afirmar prontidão comercial ou antifraude completa.

Referências técnicas: [PGlite](https://pglite.dev/docs/), [transações node-postgres](https://node-postgres.com/features/transactions), [validação Fastify](https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/).
