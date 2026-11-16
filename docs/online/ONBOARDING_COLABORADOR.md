# Bem-vindo ao Brotalume, Gabriuus

Você vai ajudar a construir um jogo de fazenda para navegador, usando seu agente de código para implementar e testar tarefas pequenas. Não precisa ler todo o histórico do Eric: este guia, a issue escolhida e os documentos indicados são o ponto de partida.

## O que estamos construindo

Brotalume é o nome de trabalho. A fazenda começa pequena e cresce com produção, comércio e personalização. Hay Day é referência de gameplay; Stardew Valley, Don't Starve e a imagem de Sunflower Land enviada pelo Eric ajudam a direção visual. A identidade e os personagens são nossos. Computador e telefone em pé são os alvos; WASD já permite andar na fazenda.

Há duas frentes: **funcionalidade/organização** e **visual da fazenda**. Conta, banco, produção, expansão e feira virtual existem no piloto. O visual está em revisão. Caminhada é local, sem presença multiplayer; moedas são de teste, sem pagamento/saque. Meta de alpha fechado:30/11/2026, não promessa de lançamento comercial.

O mesmo repositório também contém o Frutódromo publicado, que é outro jogo. Sua entrada de trabalho é **server/ → /play/**. Não trabalhe na main, no index.html da raiz ou no protótipo antigo por engano.

## Leia só o necessário para começar

1. A [primeira issue #32](https://github.com/Mendesoz/frutodromo/issues/32).
2. [Direção atual](DIRECAO_ATUAL.md) e [direção de arte](DIRECAO_ARTE.md).
3. [README do servidor](../../server/README.md), para executar.
4. Instruções AGENTS.md aplicáveis e a tabela de reservas em [roadmap](../roadmap-visual.md).

Memória compartilhada do estúdio: [ai-game-studio](https://github.com/Mendesoz/ai-game-studio). Ler a ficha `projects/FRUTODROMO_ONLINE_EXPLORATION.md` e `docs/COORDINATION.md`; o registro mais recente prevalece sobre estados históricos. Não precisa carregar js/game.js inteiro no contexto do agente.

## Sua fila inicial

| Ordem | Issue | Entrega | Risco |
|---|---|---|---|
| 1 | [#32 — primeira sessão](https://github.com/Mendesoz/frutodromo/issues/32) | Rodar, jogar e registrar resultados | Documental |
| 2 | [#33 — textos claros](https://github.com/Mendesoz/frutodromo/issues/33) | Até5 propostas de texto com antes/depois | Documental |
| 3 | [#34 — controles e telas pequenas](https://github.com/Mendesoz/frutodromo/issues/34) | QA reproduzível, sobretudo arraste e toque sustentado | Leitura/teste local |
| 4 | [#35 — enfeites originais](https://github.com/Mendesoz/frutodromo/issues/35) | Três objetos num estudo em canvas isolado | Código visual isolado |

Comece pela32. As demais são fila, não quatro tarefas simultâneas. Depois dos primeiros PRs, podemos liberar uma correção pequena da interface com arquivos definidos. Economia, autenticação, banco, migrações, produção, CI, pagamentos e publicação continuam com a frente principal.

## Preparar seu ambiente

Use seu computador, sua conta GitHub e sua sessão do agente. Não precisa receber credenciais, banco ou assinatura do Eric. Requisitos: Git e Node22 ou posterior. Docker e PostgreSQL externo não são necessários para desenvolver localmente.

Em uma pasta nova, para quem já tem permissão de push:

```powershell
git clone --branch codex/fazenda-online-base https://github.com/Mendesoz/frutodromo.git
cd frutodromo
git switch -c codex/gabriuus-32-primeira-sessao
cd server
npm ci
npm run dev
```

Abra `http://127.0.0.1:8860/play/` e crie uma conta descartável. O banco local nasce automaticamente em server/.data, ignorado pelo Git. Não copie .env de produção nem altere DATABASE_URL. Para parar o servidor, Ctrl+C no terminal dele. Se a porta estiver ocupada, peça ao agente outra porta local, sem matar processos desconhecidos.

**Situação de acesso em16/11:** GitHub informou permissão `read` para Gabriuus e recusou atribuí-lo às issues. Acesso de escrita/convite não foi concedido nesta tarefa. Enquanto isso, pode usar um fork próprio: clonar o fork, adicionar o repositório do Mendesoz como `upstream`, buscar a branch `codex/fazenda-online-base`, criar sua branch a partir dela e enviar o PR para essa mesma branch no repositório original. O agente pode preparar esse fluxo. Se o Eric optar por dar acesso de escrita, ele gerencia o convite no GitHub; não compartilhar tokens.

## Como uma tarefa anda

**Disponível → em andamento → PR para revisão → ajustes → concluída.** Usamos comentários e links na issue; nenhum quadro externo ou robô de distribuição foi configurado.

1. Confira que ninguém reservou a issue/arquivos. Comente: “Vou trabalhar nesta issue, na branch X; arquivos Y.” Se não tiver permissão para comentar, peça ao Eric/Codex registrar a reserva. Não atribua trabalho a si mesmo só na conversa privada.
2. O agente confere HEAD remoto, instruções aplicáveis e a tabela do roadmap. Registra sua linha antes de editar. Em fork, a reserva precisa também aparecer na issue central, pois a branch do fork não é visível na tabela da integração até o merge.
3. Uma issue por branch, derivada da integração atual. As instruções antigas da raiz sobre rebase/push na main pertencem ao Frutódromo; para esta frente vale docs/online/AGENTS.md. Não reescrever histórico compartilhado nem trocar/desfazer o checkout de outro colaborador.
4. Trabalhe somente nos arquivos permitidos. Se descobrir outro bug, descreva em uma issue ou no PR. Não aproveite para refatorar o projeto inteiro.
5. Confira o resultado você mesmo e peça ao agente para executar os checks pertinentes. Documentação simples não exige rodar todo o banco; código em server exige `npm run verify` e `npm run build` dentro de server. Mudança visual exige captura e inspeção no navegador. Não marque teste não executado como aprovado.
6. Abra PR em **codex/fazenda-online-base**, com link da issue, resultado, arquivos, testes e imagem quando visual. Use “Relacionado a #32”; fechamento automático pode não ocorrer em branch diferente da default.
7. Eric/Codex revisam; mudanças podem voltar para ajuste. Não fazer merge/publicação sozinho. Só depois da integração, liberar a reserva e concluir a issue; o responsável pela integração atualiza o centralizador.

## Prompt pronto para usar com seu agente

Substitua o número da issue quando trocar de tarefa:

```text
Vou contribuir como Gabriuus no Brotalume, repositório Mendesoz/frutodromo.
Trabalhe somente na issue https://github.com/Mendesoz/frutodromo/issues/32.
Leia docs/online/ONBOARDING_COLABORADOR.md, DIRECAO_ATUAL.md,
os AGENTS.md aplicáveis, a issue e a tabela de reservas no roadmap.
Consulte o centralizador Mendesoz/ai-game-studio e o HEAD remoto atual.
Use checkout próprio e branch derivada de codex/fazenda-online-base.
Tenho acesso read; use fork/PR se continuar sem permissão de push.
Antes de editar, registre a reserva e confirme que os arquivos estão livres.
Faça só o escopo permitido. Não altere main, economia, autenticação,
banco, produção, credenciais, CI ou publicação. Se outra área for necessária,
documente o bloqueio na issue e não amplie o escopo sozinho.
Execute verificações adequadas e abra um PR pequeno para
codex/fazenda-online-base, com resultados reais, limitações e evidência.
Não faça merge. Explique cada passo em português simples.
```

## Modelo de entrega

```markdown
Relacionado a #NUMERO

Resultado: o que ficou pronto e onde conferir.
Base: commit usado / branch.
Verificação: comando ou fluxo, ambiente e resultado real.
Evidência: captura quando visual, sem dados privados.
Pendências: o que falhou, ficou fora do escopo ou não foi testado.
```

Para um bug, acrescente passos para reproduzir, esperado e observado. Para arte, informe dimensões nativas, origem dos elementos e mostre junto da paleta existente. Proposta visual ainda precisa da avaliação do Eric; não substitui automaticamente os assets do jogo.
