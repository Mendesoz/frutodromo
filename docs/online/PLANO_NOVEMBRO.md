# Plano executável até 30/11/2026

Autorização do Eric em 15/11: seguir o recorte proposto pelo Codex, construir banco/backend, incluir Claude para acelerar e automatizar o trabalho. Meta: alpha fechado jogável com duas contas, fazendas persistentes, produção, expansão e primeira negociação com moeda virtual. Meta de desenvolvimento, não promessa de lançamento comercial.

Este plano e DIRECAO_ATUAL prevalecem sobre escopos históricos de genética/pomar. Referência de gameplay Hay Day; identidade e sprites originais; navegador no computador e telefone em pé. Nome Brotalume ainda proposto. Main/Frutódromo e saves existentes preservados.

## Fila com critérios de conclusão

**Separação pedida pelo Eric em16/11:** a tabela abaixo é a fila funcional. Há uma fila visual independente em [DIRECAO_ARTE.md](DIRECAO_ARTE.md), com cenário atual em revisão. Codex conduz estudo visual; Claude organiza a frente funcional em [documento próprio](FRENTE_FUNCIONAL_2026-11-16.md), com revisão de integração. Alpha exige aceitabilidade das duas frentes, não apenas testes econômicos verdes. Estudo01 de arte ainda é proposta; não é cliente novo aprovado.

| Ordem/data alvo | Entrega | Responsáveis | Critério verificável / estado |
|---|---|---|---|
| 1 — 15–18/11 | Conta, banco, API autoritativa e ciclo mínimo | Codex implementou; Claude revisou arquitetura e código | **Concluído em15/11 para o piloto**: cadastro/login, isolamento, milho→ração→ovo→pedido, expansão e persistência.18testes PASS local e em PostgreSQL17 no CI43709893238, build/auditoria/sintaxe PASS. Achados do Claude aplicados; [QA](QA_BASE_ONLINE_2026-11-15.md). |
| 2 — 19–22/11 | Mapa contínuo pequeno e cliente conectado | Codex cliente/integração/QA; Claude layout persistente/testes e revisão | **Concluído em16/11 no piloto local**: conta, produção/encomenda pela UI, expansão, movimento por arraste/toque/campos, personagem e recarga persistentes; quatro telas sem overflow;29testes PASS local/PostgreSQL, incluindo troca de cookie entre contas. [QA](QA_MAPA_ONLINE_2026-11-16.md). Hospedagem pública não configurada. |
| 3 — 23–26/11 | Comércio mínimo entre duas contas | Claude módulo/migração/testes; Codex integração/cliente/QA | **Implementado e validado em16/11 no piloto local**: lote reservado, compra/cancelamento atômicos, histórico, conservação e concorrência entre pools no PostgreSQL17;44testes PASS CI,43locais mais caso adicional dirigido. [QA](QA_MERCADO_2026-11-16.md). Revisão independente final registrada junto ao QA. |
| 4 — 27–28/11 | Automação limitada e observação de economia | Codex simulação/tempo; Claude revisão de gargalos | Uma regra de reposição com reserva mínima, teto de autonomia e limite de trabalho; mesmo resultado online/offline; registrar produção, consumo, retorno e negócios. Pendente. |
| 5 — 29–30/11 | Candidata para teste fechado | Codex integra; Claude QA independente | Duas pessoas completam produção/expansão/negociação, sem intervenção técnica; regressão, restauração de backup e ambiente de teste disponíveis. Hospedagem só com arquitetura/custo concretos. Pendente. |

Antes de atrasar, cortar nesta ordem: ligas/barcos/cooperativas (já fora do alpha), variedade de culturas/máquinas, raridades e boosts, opções extras de automação. Preservar arte reaproveitada e qualidade legível; não repetir uma interface genérica descartável. Não cortar integridade de saldo/estoque, idempotência ou testes concorrentes. Se houver bloqueio, registrar evidência e reduzir a próxima tarefa, sem anunciar entregas inexistentes.

## Regras piloto escolhidas nesta rodada

- Economia virtual identificada como `pilot-resettable-v1`, explicitamente sujeita a reinício; saldo local não é convertido em itens online.
- Uma cultura/duas transformações. Pedido NPC fixo, repetível, sem TTL neste primeiro recorte. Valores candidatos em server/README.md, sem alegação de balanceamento validado.
- Filas finitas, sem fabricação infinita offline; saída reservada no armazém ao enfileirar. Ação que consome estoque pode executar com armazém cheio. Essa política dispensa descarte involuntário e precisa ser apresentada no cliente.
- Semente comprável por 3 moedas; recuperação de 1 unidade só sem milho, ração, jobs pendentes ou pedido completável, saldo<3 e intervalo de1h. Um ovo isolado não bloqueia o resgate. Revisar novamente antes de transferir itens no mercado.
- Terreno concede espaço; não cria produção ou capacidade automaticamente. Custo crescente é um ralo inicial de moeda, não prova de equilíbrio.
- Ranking com bônus comprável, RNG enviesado escondido e venda forçada de excedentes não entram automaticamente a partir do documento recebido. Pagamentos/saques não fazem parte do alpha.

## Fluxo de trabalho e automação real

1. Consultar esta fila, centralizador e HEAD; escolher o primeiro critério pendente. Uma tarefa de código por área; combinar arquivos antes de delegar escrita.
2. Codex conduz implementação/integração; Claude executa tarefa limitada em processo sem janela. Nesta rodada: parecer de economia e revisão independente de server/. Distinguir solicitação de resposta recebida.
3. `server/npm run verify` verifica tipos e integração; `npm run build` compila. Cada push/PR com server/ dispara `.github/workflows/fazenda-online.yml` com PostgreSQL real. Falha bloqueia a conclusão da tarefa.
4. `server/npm run review:claude` aciona o revisor Read/Glob/Grep e guarda resultado privado. Não envia segredos ou copia histórico inteiro, não pede escrita irrestrita e não faz merge automaticamente.
5. Aplicar achados pertinentes, repetir somente verificações afetadas e registrar QA/commit/PR. Atualizar `Mendesoz/ai-game-studio` ao fechar marco significativo.

Não há serviço permanente instalado ou tarefas de desenvolvimento agendadas. CI executa em cada envio; revisão do Claude executa quando acionada; trabalho de implementação continua em sessões ativas. O registro durável permite retomar pela próxima tarefa sem Eric transportar contexto entre chats. Nenhuma automação afirma que agentes continuarão trabalhando depois que a sessão terminar.

## Retomada

Branch desta base: `codex/fazenda-online-base`, derivada de `codex/fazenda-visual` em bce3379. Reserva:5075446. Não aplicar rebase que reescreva o merge já compartilhado; conferir ancestralidade de origin/main e integrar avanços preservando histórico. Não trocar branch usada por outro agente nem promover esta frente à main.

Próxima tarefa: etapa4, automação limitada. Definir uma regra de reposição por instalação, reserva mínima de ingrediente, máximo de ciclos e prazo explícito. Nenhuma repetição infinita: reservar recursos/capacidade e simular online/offline com o mesmo resultado antes de acrescentar controles ao cliente. Conferir a branch documental `claude/online-simulacao` (303bbb6): ela acrescentou ideias de VIP/passe/ficha e comissão, sem implementação. Tratar essas propostas na descoberta; não ampliar silenciosamente o piloto para pagamentos ou comissão em dinheiro real.
