# Base online da fazenda — piloto

Entrada de servidor separada do Frutódromo e do protótipo local. Nenhum save `frutodromo9`/`fazenda_proto_v2` é importado. Economia `pilot-resettable-v1`, virtual, pode ser zerada; não há pagamento, saque ou saldo negociável. O frontend da fazenda ainda não usa esta API.

## Rodar

Requer Node >=22. Na pasta `server`: `npm ci`, `npm run dev`. API em `http://127.0.0.1:8860`. Sem configuração, usa PostgreSQL embarcado PGlite com dados persistentes em `.data/postgres`, no processo servidor, fora do navegador. Não inicia Docker ou ocupa janelas do computador.

Para PostgreSQL convencional, configure `DATABASE_URL` em `.env` (veja `.env.example`). Migrações são aplicadas ao iniciar. Produção exige PostgreSQL e origem HTTPS explícita; não existe hospedagem de backend configurada nesta rodada. Mantenha a API local até a revisão de operação para teste hospedado. `HOST` é loopback por padrão.

`npm run verify`: tipos e testes de integração. `npm run build` compila; `npm start` roda o compilado. A CI usa PostgreSQL 17 real, duas pools/instâncias e testes concorrentes. `TEST_DATABASE_URL` é exclusivo de testes, deve terminar em `_test` e seu conteúdo é apagado pela suíte; nunca aponte para dados reais.

`npm run review:claude` executa uma revisão independente com a sessão autenticada do Claude Code, apenas Read/Glob/Grep, sem edição ou MCPs. Resultado privado em `.claude-results`. Usa sua assinatura/limites do Claude; não roda em cada push nem fica ligado após a revisão. Codex avalia e aplica os achados. Não injeta mensagens na conversa antiga da extensão.

## API

Todos os POSTs exigem `Origin` igual a `PUBLIC_ORIGIN` e `Content-Type: application/json`. Sessão em cookie HttpOnly/SameSite=Lax, Secure em produção; sete dias de validade. Senhas com scrypt (padrão Node: N=16384, r=8, p=1), sal aleatório de 16 bytes, chave de 64 bytes; tokens de 32 bytes são armazenados apenas como SHA-256.

| Rota | Corpo/resultado |
|---|---|
| GET `/health` | prontidão do banco |
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

Os números são candidatos de teste. Cadastro dá 80 moedas, 4 milhos, 2 canteiros, moinho e galinheiro. Milho consome1/produz2 em30s; ração consome2 milhos/produz1 em45s; ovo consome1 ração/produz1 em60s. Canteiro comporta1 trabalho, moinho/galinheiro2 em sequência. Animais não se aposentam neste piloto. Não há raridades nem sorteio de produção.

## Invariantes

- Cada comando bloqueia a própria fazenda em transação; consulta também bloqueia para acertar produção vencida uma única vez. Sem `setInterval` econômico. Todos os caminhos de mutação seguem a mesma trava.
- Horário vem do servidor, não retrocede por fazenda. A conclusão usa timestamps fixos, e jobs concluídos têm `claimed_at`. Sem produção infinita offline: só os trabalhos explicitamente enfileirados (máximo 1/2 por instalação).
- Ingredientes saem ao enfileirar. Saídas reservam espaço imediatamente: inventário + reservas <= capacidade. Isso evita perder itens ou bloquear uma entrega com armazém cheio; é uma política piloto a testar na UI.
- Repetir chave/payload devolve exatamente o recibo persistido; chave com outro payload dá409. Falha desfaz consumo, moedas, eventos e trabalho.
- Razão de moedas e eventos de inventário permitem reconciliar saldos. Eventos de comandos e de jobs usam namespaces distintos. Nenhum cliente define preço, quantidade produzida, saldo, dono ou horário.
- PGlite é conveniência para desenvolvimento em uma instância. Não demonstra escalabilidade ou concorrência de PostgreSQL real.

## Antes de teste público

Ainda faltam: frontend conectado; mercado com reserva/transação entre fazendas; recuperação de conta e troca de senha; limites distribuídos por conta/IP (o limitador atual é por processo/IP); política de retenção de sessões/jobs/operações; backup/restauração verificados; telemetria, TLS e configuração de hospedagem; teste de carga, abuso de contas múltiplas e revisão do resgate antes de itens transferíveis. Não afirmar prontidão comercial ou antifraude completa.

Referências técnicas: [PGlite](https://pglite.dev/docs/), [transações node-postgres](https://node-postgres.com/features/transactions), [validação Fastify](https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/).
