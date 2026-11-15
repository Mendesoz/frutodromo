# QA da base online — 15/11/2026

Código validado: `886d289cc4b6c0e7714c713064de399a3acd6e87`, branch `codex/fazenda-online-base`, [PR #30](https://github.com/Mendesoz/frutodromo/pull/30). Piloto isolado da apresentação e do Frutódromo publicado.

## Resultado observado

- `npm run verify`: tipos TypeScript e 13 testes de integração PASS no Windows/Node22/PGlite.
- [GitHub Actions 43709182693](https://github.com/Mendesoz/frutodromo/actions/runs/43709182693), job132796840368: npm ci, os mesmos testes em PostgreSQL17, build, auditoria das dependências de produção e sintaxe dos dois JS originais: SUCCESS. A suíte concorrente abre duas pools PostgreSQL e duas instâncias da API.
- `npm run build`: PASS local. `npm audit --omit=dev --audit-level=high`: zero vulnerabilidades reportadas nesta execução. Não equivale a auditoria completa de segurança.
- `npm start`: build iniciou em loopback8860; GET `/health` respondeu HTTP200 com banco PGlite. Banco persistente criado em server/.data/postgres, ignorado pelo Git.
- Smoke via HTTP real, sem navegador: duas contas de QA distintas cadastradas; cada uma recebeu sua fazenda/80moedas; duas requisições simultâneas com a mesma chave geraram um único plantio, dois recibos iguais, 3milhos e1job por fazenda. Credenciais efêmeras não registradas.
- Diff contra bce3379 em js/, css/, index.html, sw.js e prototipo-fazenda/: vazio. Saves e jogo publicado preservados.

## Testes automatizados

1. Migrações repetíveis, senha/token não armazenados em texto puro, login/logout.
2. Ciclo milho→ração→ovo→pedido; fila sequencial; saldos reconciliam com razões de moeda/itens.
3. Doze repetições simultâneas: um efeito e recibos iguais; payload divergente com a mesma chave é recusado.
4. Expansão: adjacência, saldo insuficiente, terreno repetido; nenhuma máquina criada pela compra de área.
5. Reserva de capacidade: consumo revertido em falha e entrega permitida com estoque cheio.
6. Acerto offline em passo único versus90passos; doze consultas simultâneas não duplicam produtos; ausência de30dias não produz além da fila finita.
7. Compra/resgate de semente; saldo, milho pendente e cooldown persistente.
8. API: sessão obrigatória, rejeição de origem indevida/campos forjados, edifício de outra conta e logout.
9. Sessão expirada/inventada e limite de tentativas de login.
10. Cinquenta comandos por duas instâncias:26compras,24recusas, saldo2,30milhos e27eventos monetários incluindo grant inicial.
11. Fechar/reabrir banco PGlite preserva fazenda e sessão.
12. Regressão do relógio do servidor não retrocede tempo ou antecipa nova produção.
13. Chave enviada pelo cliente não colide com evento interno de produção.

## Claude e limites

Parecer da proposta concluído em chamada dedicada, somente leitura: [CLAUDE_BASE_ONLINE_2026-11-15.md](CLAUDE_BASE_ONLINE_2026-11-15.md). Codex incorporou compra/resgate de sementes limitado, eventos de inventário, tempo monotônico e testes no PostgreSQL real. Outras recomendações foram avaliadas: filas finitas já limitam acúmulo; reserva de saída resolve transbordo nesta versão; encomenda fixa sem prazo evita pedido impossível no primeiro ciclo. Não adotar automaticamente todos os detalhes sugeridos.

Revisão adicional do código real concluída com `npm run review:claude`: [CLAUDE_REVISAO_CODIGO_2026-11-15.md](CLAUDE_REVISAO_CODIGO_2026-11-15.md). Claude aprovou a base para teste local fechado, sem encontrar caminho de duplicação/saldo negativo na leitura; não executou testes. Codex aplicou:
- Bloqueio cross-site também em GETs de API.
- Teste de 30 replays com a mesma chave por duas instâncias e de capacidade concorrente por chaves distintas.
- Preservação do erro original em rollback e descarte da conexão se rollback falhar.
- Clock de cadastro injetável e tempo padrão compartilhado no banco; teste com data no passado.
- Item de saída explícito por receita; sessão com limpeza/limite de10; caminho de banco ancorado em server/ e proteção .data no Git.
- Resgate aguarda jobs/ração/entrega possível. Não exigir inventário estritamente vazio: 1 ovo isolado não completa o pedido de2 e essa exigência criaria travamento. Caso coberto por teste.

Após ajustes, `npm run verify` passou com **18 testes locais** e build PASS. Relógio abruptamente incorreto no próprio banco, arquivo de operações e demais limites operacionais permanecem pendências documentadas; não foi aplicado um teto arbitrário que bloquearia retornos legítimos após ausência longa. A CI da revisão precisa ser conferida antes de concluir o marco.

Nenhuma nova UI foi entregue nesta rodada; não houve novo teste de navegador/resoluções. A prévia visual continua local/offline, sem esta API. Não há mercado P2P, hospedagem do backend, restauração de backup testada, dinheiro real ou medição de balanceamento/retorno de jogadores. O limitador de login atual é por processo/IP; operação pública exigirá limite distribuído e demais itens de server/README.md. Esta validação autoriza avançar no piloto, não comprova prontidão comercial.
