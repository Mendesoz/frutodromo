# Plano executável até 30/11/2026

Autorização do Eric em 15/11: seguir o recorte proposto pelo Codex, construir banco/backend, incluir Claude para acelerar e automatizar o trabalho. Meta: alpha fechado jogável com duas contas, fazendas persistentes, produção, expansão e primeira negociação com moeda virtual. Meta de desenvolvimento, não promessa de lançamento comercial.

Este plano e DIRECAO_ATUAL prevalecem sobre escopos históricos de genética/pomar. Referência de gameplay Hay Day; identidade e sprites originais; navegador no computador e telefone em pé. Nome Brotalume ainda proposto. Main/Frutódromo e saves existentes preservados.

## Fila com critérios de conclusão

| Ordem/data alvo | Entrega | Responsáveis | Critério verificável / estado |
|---|---|---|---|
| 1 — 15–18/11 | Conta, banco, API autoritativa e ciclo mínimo | Codex implementa; Claude revisa arquitetura e código | Cadastro/login, isolamento, milho→ração→ovo→pedido, expansão, persistência e testes no PostgreSQL. Implementação e testes locais concluídos nesta rodada; conferir QA e CI antes de considerar validado no PostgreSQL convencional. |
| 2 — 19–22/11 | Mapa contínuo pequeno e cliente conectado | Codex integra servidor/mapa; Claude recebe revisão de fluxo/UI em arquivos combinados | Entrar em conta, plantar e produzir no cenário; fechar/reabrir preserva estado; comprar terreno adjacente; layout salvo; 393×760, 1024×600, 900×430 e 1280×680. Pendente. |
| 3 — 23–26/11 | Comércio mínimo entre duas contas | Codex transações/integração; Claude revisa concorrência e economia | Anunciar lote reservado, comprar, cancelar; uma venda por lote mesmo com compradores simultâneos; moeda/itens reconciliam; sem dinheiro real. Pendente. |
| 4 — 27–28/11 | Automação limitada e observação de economia | Codex simulação/tempo; Claude revisão de gargalos | Uma regra de reposição com reserva mínima, teto de autonomia e limite de trabalho; mesmo resultado online/offline; registrar produção, consumo, retorno e negócios. Pendente. |
| 5 — 29–30/11 | Candidata para teste fechado | Codex integra; Claude QA independente | Duas pessoas completam produção/expansão/negociação, sem intervenção técnica; regressão, restauração de backup e ambiente de teste disponíveis. Hospedagem só com arquitetura/custo concretos. Pendente. |

Antes de atrasar, cortar nesta ordem: ligas/barcos/cooperativas (já fora do alpha), variedade de culturas/máquinas, raridades e boosts, opções extras de automação. Preservar arte reaproveitada e qualidade legível; não repetir uma interface genérica descartável. Não cortar integridade de saldo/estoque, idempotência ou testes concorrentes. Se houver bloqueio, registrar evidência e reduzir a próxima tarefa, sem anunciar entregas inexistentes.

## Regras piloto escolhidas nesta rodada

- Economia virtual identificada como `pilot-resettable-v1`, explicitamente sujeita a reinício; saldo local não é convertido em itens online.
- Uma cultura/duas transformações. Pedido NPC fixo, repetível, sem TTL neste primeiro recorte. Valores candidatos em server/README.md, sem alegação de balanceamento validado.
- Filas finitas, sem fabricação infinita offline; saída reservada no armazém ao enfileirar. Ação que consome estoque pode executar com armazém cheio. Essa política dispensa descarte involuntário e precisa ser apresentada no cliente.
- Semente comprável por 3 moedas; recuperação de 1 unidade só sem milho disponível/pendente, saldo<3 e intervalo de1h. Revisar novamente antes de transferir itens no mercado.
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

Próxima tarefa após banco/API verde: conectar uma entrada online separada ao mapa e preservar os saves locais para teste. Coordenar o mapa com a área visual, mantendo o servidor separado em server/.
