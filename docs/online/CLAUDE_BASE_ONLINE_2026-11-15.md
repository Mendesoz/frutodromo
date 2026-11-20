Li os quatro documentos pedidos e o `prototipo-fazenda/index.html` (503 linhas, sem abrir `sprites.js`). Confirmei por `Glob` que **`server/` ainda não existe** no commit `5075446` da branch `codex/fazenda-online-base` — então nada abaixo é revisão de código: é parecer sobre a proposta. Não executei comandos nem alterei arquivos.

```markdown
# Parecer do Claude — base online da fazenda (Brotalume)

15/11/2026. Parecer **sobre a proposta** do Codex, somente leitura.
Lido: `AGENTS.md`, `docs/online/AGENTS.md`, `docs/online/DIRECAO_ATUAL.md`,
`docs/online/ECONOMY_AND_GROWTH.md`, `docs/online/NEXT_STEPS.md`,
`prototipo-fazenda/index.html`. `server/` não existia quando escrevi isto
(verificado no commit `5075446`): nenhum arquivo de servidor foi testado.
Arte, sprites, caldeirão e a direção de referência seguem como já decidido —
este documento não os redefine.

## 1. Críticas concretas: travamento e inflação

**Travamento (deadlock).** A recuperação gratuita é o instinto certo, mas do
jeito que está descrita vira torneira. Condicione-a a um estado *estritamente*
morto: zero sementes **e** zero canteiros ocupados **e** zero colheitas
pendentes **e** zero itens da cadeia no estoque **e** moedas < semente mais
barata. Dê 1 semente (nunca moedas), com cooldown e contador por conta, e grave
como evento `recuperacao` com origem marcada — sem isso, vender tudo para
"mendigar" semente fica rentável no dia em que existir mercado.

Travamentos que a recuperação **não** cobre e precisam de regra explícita:
- **Capacidade.** Se o armazém enche, o comando que *consome* (entregar, vender)
  nunca pode ser recusado. Para colheita, escolha uma política e documente:
  recusar, colher parcial, ou deixar pronto no canteiro. O protótipo apenas
  congela a produção (`index.html:253-277`); no servidor isso precisa ser
  determinístico e auditável, não emergente.
- **Encomenda inviável.** Gere a encomenda a partir da capacidade real da fazenda
  (animais × taxa × TTL), com piso na menor quantidade alcançável, e garanta que
  sempre exista ao menos uma encomenda completável. Toda encomenda com TTL.
- **Ciclo deficitário.** Com plantar 1 → colher 2, exija
  `2 × preço_venda_milho > preço_semente` com margem ≥ 30%. Se o ciclo der
  prejuízo, todo mundo converge para zero e a recuperação passa a ser o jogo.

**Inflação.** O recorte piloto é quase só torneira: encomenda dá moedas e o
único ralo é semente. Inclua desde já **um ralo com custo crescente** (vaga de
instalação ou canteiro, 3 níveis bastam) só para a curva ser observável. Mais:
- Pagamento da encomenda calculado **no servidor**, por fórmula com teto, nunca
  vindo do cliente, e persistido junto da encomenda para auditoria.
- Produção acumulada fora do ar precisa de **teto explícito** (o protótipo usa
  8 h em `index.html:476`). Sem teto, uma ausência de 30 dias imprime estoque.
- **Sorteio raro só dentro da transação que comita**, com semente e resultado
  gravados. Se o raro é sorteado na leitura, abas paralelas e retentativas
  multiplicam raros. Nenhum endpoint de leitura deve chamar RNG.
- Marque a economia do piloto como descartável (`economy_epoch` ou flag
  `piloto`) e diga isso na tela. Zerar depois fica barato agora e caríssimo
  depois. Progresso local não entra como saldo: mantenha.

## 2. Invariantes e testes prioritários

**Invariantes**
1. Nunca negativo: `CHECK (qty >= 0)` e `UPDATE ... WHERE qty >= n`, não
   ler-modificar-escrever.
2. Conservação: toda mudança de item/moeda gera exatamente uma linha de razão
   (`events`); saldo é cache re-derivável da soma do razão.
3. Idempotência: único em `(account_id, idempotency_key)`; replay devolve a
   **resposta original armazenada**. Chave com payload diferente → 409 e zero
   efeito. Chave sempre no escopo da conta.
4. Relógio monotônico por fazenda: `last_tick_at` nunca retrocede; produção =
   f(last_tick_at, agora_servidor) e então `last_tick_at := agora`. Coleta
   duplicada passa a ser impossível por construção.
5. Avanço único: avanço de produção só dentro da transação com trava da linha da
   fazenda (`SELECT ... FOR UPDATE`). Leituras são projeção pura, não persistem.
6. Capacidade: `total ≤ capacidade` após cada commit, com a política de
   transbordo escolhida no item 1.
7. Fila sequencial: `ends_at[i] ≤ starts_at[i+1]`; avaliar o mesmo intervalo em 1
   passo ou em 240 passos dá resultado idêntico.
8. Sessão: cookie HttpOnly, Secure, SameSite; id opaco ≥128 bits de CSPRNG,
   guardado com hash; expiração absoluta e por inatividade; rotação no login;
   troca de senha invalida as outras sessões. scrypt com parâmetros declarados e
   sal por usuário, comparação em tempo constante, limite de tentativas por conta
   e por IP, erro de login que não revela se a conta existe.
9. CSRF: exigir header próprio (ou double-submit) além do SameSite, checar
   `Origin`, recusar `Content-Type` de formulário. Sessão só pelo cookie.
10. Múltiplas instâncias: nada de estado em memória que importe (sem tick em
    processo, sem cache de idempotência, sem mapa de sessão). Trava só no
    Postgres.

**Testes prioritários** — t1 replay de chave (um efeito, resposta idêntica);
t2 **idempotência divergente** (409, zero efeito); t3 duas abas disparando
coleta em paralelo sem chave (resultado = uma coleta legítima; razão = saldo);
t4 coleta duas vezes no mesmo instante (segunda rende zero); t5 cronologia da
fila em passos diferentes (resultado e `ends_at` iguais); t6 capacidade no
limite (sem negativo, sem estourar, sem item sumindo sem linha de razão);
t7 recuperação (condição exata, no máximo 1 semente, negada com moedas
suficientes); t8 sessão expirada/desconhecida (401 sem efeito colateral);
t9 POST cross-origin sem o header (recusado); t10 **duas instâncias contra um
Postgres**, 50 comandos concorrentes (sem deadlock, sem lost update);
t11 timestamp e relógio falsos do cliente (nenhum efeito); t12 determinismo de
RNG e ausência de RNG em leitura.

**Alerta de método:** rodar a suíte só no PGlite esconde corrida. t3, t4 e t10
precisam de Postgres real na CI.

## 3. Recorte factível até 30/11

- **M1 (16–18/11)** esquema, migrações, conta/sessão, health; Postgres real na CI.
- **M2 (19–22/11)** barramento de comandos: transação + trava + idempotência +
  razão + tempo do servidor; `plantar`, `colher`.
- **M3 (23–25/11)** ração e ovo em fila sequencial, capacidade, recuperação.
- **M4 (26–27/11)** encomenda NPC viável com TTL e moedas; testes t1–t12.
- **M5 (28–30/11)** cliente mínimo em entrada nova, sem tocar o jogo publicado;
  smoke de ponta a ponta; aviso de "pode ser zerado".

**Cortar antes de atrasar, nesta ordem:** acabamento visual e reaproveitamento de
sprites na entrada nova (UI crua serve), mais de uma cultura, raridade/brilhante,
resumo offline, impulsos e diamantes, diário, tradução da entrada nova, paridade
com PGlite, hospedagem. **Não cortar:** razão, idempotência, trava, tempo do
servidor, testes. Se em 25/11 o M2 não estiver verde, troque a encomenda NPC por
"vender ovo por moedas" e entregue a cadeia fechada.

Mercado P2P, ligas, pagamentos e monetização seguem fora deste recorte.

## 4. Minha tarefa de revisão seguinte

Quando o Codex fechar o código: ler `server/` (esquema, migrações, handler de
comando, sessão), confrontar os 10 invariantes com o código citando
`arquivo:linha`, rodar a suíte contra Postgres real, aplicar 5 sondagens
adversariais (chave divergente, replay, duas abas, relógio falso, estouro de
capacidade), apontar qualquer caminho que no futuro permita lavar saldo para um
mercado, e entregar veredito go/no-go ao Eric. Essa revisão não aprova mercado,
pagamento nem promoção à `main`.
```

Dois pontos que valem decisão do Eric antes de eu revisar o código: a política de transbordo de capacidade (recusar / parcial / segurar no canteiro) e se a economia do piloto já nasce declarada como zerável. Ambos são baratos agora e caros depois.