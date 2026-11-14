# Parecer do Claude Code — 14/11/2026

Revisão recebida pelo Codex em chamada dedicada pelo terminal, com ferramentas somente leitura. Referência analisada: commit `e3de04d`, branch `codex/frutodromo-online`.
Este é o parecer do Claude, preservado como contribuição de análise. Recomendações, riscos e critérios abaixo são propostas; não equivalem a testes, aprovação do proprietário ou aconselhamento jurídico. O Codex verificou que a chamada concluiu com sucesso e o checkout permaneceu limpo.
A chamada não injeta contexto na conversa antiga do aplicativo; este arquivo e o centralizador são a memória compartilhada.

---

## Arquivos efetivamente lidos

No repositório `frutodromo` (branch `codex/frutodromo-online`, commit `e3de04d`): `CLAUDE.md` (via instruções do projeto), `docs/online/README.md`, `docs/online/AGENTS.md`, `docs/online/BRIEF.md`, `docs/online/ECONOMY_AND_GROWTH.md`, `docs/online/CLAUDE_HANDOFF.md`. No `ai-game-studio`: `AGENTS.md`, `docs/COORDINATION.md`, `projects/FRUTODROMO_ONLINE_EXPLORATION.md`. Em `js/game.js` fiz apenas buscas pontuais (não leitura integral): confirmei `cross()` no cliente (linha 375, com `Math.random()`), `normState`/`migrate` (353/363) e persistência local/SDK. Não executei comandos, não editei nada, não acionei subagentes.

Tudo abaixo é **proposta minha**, para o Eric decidir. Não houve teste novo nem aprovação.

## 1. Reaproveitamento e principal trabalho novo

Reaproveitável com baixo risco: identidade visual e sprites procedurais, atributos e genética de cruzamento, variedades brilhantes, árvore de espécies/cartas/coleção, pedidos de NPC, interação por toque em retrato, i18n, e o conhecimento acumulado de desempenho e layout. Isso cobre a *sensação* do jogo — é o ativo mais difícil de recriar.

Reaproveitável só como regra de referência: economia solo, preços de pedidos e ritmo de descoberta. Em economia persistente compartilhada, esses números passam a definir inflação de oferta; concordo com o `BRIEF.md` que reuso precisa de revisão.

O principal trabalho novo não é o pomar — é a **autoridade do estado**. Hoje sorteio, cruzamento e saldo vivem no cliente, com `localStorage` e Data Module como cópia. Um mercado entre jogadores exige servidor dono de inventário, sorteios, tempo de produção, saldos e transferências atômicas com idempotência e histórico. É uma troca de arquitetura, não um módulo adicional: contas, backend, banco, deploy, suporte e custo recorrente. O segundo trabalho novo, em ordem de esforço, é produção por tempo com cálculo de tempo offline confiável (relógio do servidor, não do dispositivo).

## 2. Três fragilidades / decisões prioritárias

**(a) Não existe fonte de demanda no desenho atual.** A documentação reconhece isso, mas vale endurecer: num jogo onde todos podem cruzar tudo, cada jogador é produtor e ninguém é comprador estrutural. Especialização complementar só gera comércio se algo for *difícil de obter por conta própria* (linhagem exclusiva, custo de oportunidade, limite de slots). Minha proposta: definir a demanda antes do mercado — um sumidouro que consome produto permanentemente (receitas, encomendas, melhorias) e torna o item irrecuperável. Sem sumidouro, o mercado vira estoque parado.

**(b) Reprodução infinita destrói escassez.** Se uma matriz rara gera sementes sem limite, o preço tende a zero e a primeira semana define a economia inteira. Proposta de abordagem (não de número): decidir por *regra*, não por tuning — por exemplo matriz com usos finitos, ou semente que não reproduz, ou degradação por geração. Isso precisa ser simulado em planilha/script antes de qualquer protótipo jogável.

**(c) Dinheiro real contamina o desenho se entrar cedo.** A direção do Eric inclui estudar ganho para jogadores; a hipótese é legítima. Mas a decisão de design muda radicalmente se o item tem valor monetário: multi-conta, bots de farm, KYC, estornos, obrigação de pagamento, regime tributário e regras de loteria/apostas no Brasil. Proposta: tratar como **duas frentes separadas** — diversão e comércio interno agora; estudo jurídico/operacional de pagamentos em paralelo, como pesquisa documental, sem nenhuma integração. Se o estudo reprovar, o jogo precisa continuar bom sem saque.

## 3. Primeira experiência jogável pequena (proposta)

Um "pomar de duas estufas", sessão de 10–15 minutos, sem servidor e sem mercado real: protótipo local separado, com armazenamento próprio (nunca `frutodromo9`).

Conteúdo: 2 slots de cultivo, 3 linhagens, colheita por tempo curto, 1 cruzamento, e um quadro de 3 encomendas que **consomem** o fruto. O recurso escasso é slot × tempo. A decisão interessante: usar o fruto raro na encomenda que paga agora, ou gastá-lo como matriz para uma linhagem melhor depois — e aceitar ficar sem renda nesse intervalo.

Critérios observáveis que eu proporia:
- o jogador completa plantio → colheita → entrega sem tutorial narrado;
- ele consegue explicar, com palavras próprias, por que escolheu entregar ou cruzar;
- ao menos uma vez ele deixa uma encomenda passar de propósito;
- com a aba fechada e reaberta, o progresso de tempo confere e nada duplica;
- ao fim da sessão, ele diz o que faria na próxima — e nomeia um item que gostaria de comprar de outra pessoa.

Esse último ponto é o único sinal honesto de demanda antes de existir mercado. Observações com 5–8 pessoas diferentes; contas simuladas não valem como evidência.

## 4. Teste de divulgação: tráfego ≠ retorno ≠ demanda

Proposta de três medidas independentes, nunca somadas:

**Tráfego** — visita e primeira colheita, por canal. Mede a comunicação, não o jogo. Dizer "é um idle de cultivo e coleção"; não mencionar ganho de dinheiro, para não atrair público de renda e poluir o sinal.

**Retorno** — jogador que volta em um segundo dia, sem lembrete pago. É o indicador que decide se vale construir servidor.

**Demanda de itens** — só medível com pelo menos dois papéis produtivos. Teste fechado: metade com linhagem A, metade com B, encomendas que exigem as duas, moeda interna de teste, canal de negociação manual (sem mercado implementado). Medir pedidos de compra espontâneos, tempo até fechar, estoque sem comprador e quantos continuam negociando no segundo dia. Anúncio feito ≠ venda concluída ≠ venda repetida.

## 5. Decisões mínimas do Eric antes de implementar

1. O Frutódromo lançado continua intacto e o online é produto separado (minha recomendação) ou vira evolução dele?
2. Autoriza custo recorrente de servidor/banco, e com que teto mensal? Sem isso, mercado real não sai do papel.
3. Dinheiro real: estudo em paralelo sem implementação, ou requisito de produto desde já?
4. Sementes, matrizes e colheitas — o que é transferível? Minha proposta: só colheita no início.
5. Público-alvo do primeiro teste: jogadores de idle/coleção ou público de renda?
6. O protótipo é descartável (conceito) ou base de código do produto final? Isso muda stack e cuidado desde a primeira linha.