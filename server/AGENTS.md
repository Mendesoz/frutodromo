# Base online — limites de colaboração

Leia docs/online/DIRECAO_ATUAL.md e PLANO_NOVEMBRO.md. server/ é o piloto online isolado; não alterar o Frutódromo publicado nem importar seus saves. Não editar .env, .data ou ler credenciais em revisões.

Codex conduz esta base. Claude é revisor somente leitura nesta rodada; uma tarefa de escrita futura precisa identificar arquivos e objetivo antes do início, sem pedir nova autorização do Eric para desenvolvimento já autorizado. O runner de revisão não permite alterações.

Checagens: `npm run verify`, `npm run build`; CI PostgreSQL precisa passar. PGlite não comprova concorrência real. Testes usam banco com sufixo _test e apagam somente esse banco; nunca usar DATABASE_URL real como TEST_DATABASE_URL.

Não relaxar transações, trava de fazenda, idempotência ou validações para fazer teste passar. Novas mutações devem registrar razão/eventos, seguir trava/tempo e ter teste de repetição/concorrência pertinente. Mercado exige reserva de lote e travas em ordem estável entre fazendas. Sem integração financeira nesta etapa.

Branches codex/; não reescrever commits compartilhados ou promover main. Atualizar fila, QA e centralizador com estado real e próxima ação; não declarar fluxo automático ou revisão concluída sem evidência.
