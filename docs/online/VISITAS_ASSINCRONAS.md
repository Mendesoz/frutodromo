# Visitas assíncronas a fazendas — desenho técnico

**Estado:** proposta técnica do Codex, 20/11/2026. A direção de visitas assíncronas foi aprovada por Eric; política de privacidade e campos visíveis ainda precisam ser apresentados antes de implementar o recurso.

## Marco anterior: produção offline

O piloto já tem a base de produção offline aprovada:

- `production_jobs.started_at` e `finishes_at` persistem no PostgreSQL/PGlite; a conclusão não depende da página ficar aberta.
- `farms.last_processed_at` e `farmTime()` usam o tempo do servidor e impedem o relógio de uma fazenda de retroceder.
- `settle()` resolve trabalhos vencidos quando o dono consulta ou executa uma ação, dentro da transação que trava a fazenda. Não há loop global de simulação.
- Filas e capacidade são limitadas/reservadas no enfileiramento. A produção não se repete sem limite durante ausência.

`server/test/online.test.ts` contém cobertura do avanço offline, consultas repetidas sem duplicação e equivalência de um passo longo a vários curtos. Este registro é leitura de código e documentação; os testes não foram executados nesta tarefa.

## Proposta para o primeiro marco de visitas

### Compartilhamento explícito e revogável

- A fazenda começa privada para visitas.
- O proprietário pode criar um link aleatório de visita e revogá-lo/rotacioná-lo quando quiser.
- O token funciona como capacidade de acesso ao mapa. Guardar no banco apenas o hash do token; não usar nome de usuário nem UUID interno como segredo.
- A visita requer conta autenticada e não exige o proprietário online. Não criar busca pública por nome de usuário nesta etapa.

### Snapshot público de leitura

A API de visita deve usar uma projeção própria e devolver somente o necessário para renderizar o mapa: nome público da fazenda, aparência/avatar escolhido, terrenos desbloqueados, prédios e posições, além de geometria decorativa estática.

Não incluir carteira/saldo, inventário, encomendas, histórico, sessões, filas/tempos de produção ou informações de conta. O endpoint não chama `settle()`, não altera `last_processed_at` e não aceita comandos. Assim, abrir uma visita não coleta produção nem produz efeitos econômicos.

### Cliente

- Abrir o link em um modo visual de visita, com controles de câmera/caminhada se mantidos na versão atual.
- Desativar seleção de produção, construção, movimentação, expansão e quaisquer controles de economia.
- Exibir claramente o nome da fazenda e o estado “Visitando”; permitir voltar à fazenda própria.
- Link expirado, revogado ou inválido deve falhar sem revelar se existe uma conta específica.

## Ordem sugerida de implementação

1. Confirmar no escopo do marco os campos de mapa realmente públicos e o requisito de conta para visitantes.
2. Migração para credencial de compartilhamento com rotação/revogação, sem armazenar o token em texto puro.
3. Serviço de leitura pública com projeção mínima e endpoint autenticado, separado do snapshot privado de `GET /api/farm`.
4. Modo visual isolado no cliente, com todas as ações econômicas e de edição desativadas.
5. Revisão do isolamento entre contas e concorrência; depois, demonstração com duas contas e proprietário offline.

## Fora deste marco

Sem presença em tempo real, movimento de visitantes sincronizado, permissões granulares, chat, presentes, colheita na fazenda alheia, diretório pesquisável, notificações, visitas recompensadas ou qualquer pagamento/saque. Esses itens podem ser reavaliados depois, conforme uso e custo.

## Evidência e limites

- O modelo de fazendas individuais e visitas assíncronas foi aprovado por Eric em 20/11/2026; proteção por link e a lista de dados públicos são propostas, não decisões finais.
- O backend existente mantém cada fazenda associada a uma conta e já possui snapshot privado e mercado entre fazendas. Ainda não existe API ou modo de cliente para visitar o mapa de outra conta.
- Nenhum código foi alterado para implementar visitas nesta atualização documental.
