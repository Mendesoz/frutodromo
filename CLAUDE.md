# Frutódromo — instruções para o Claude

Jogo de navegador em pixel art (HTML, CSS e JavaScript puro, sem frameworks): o jogador cruza frutas num caldeirão, descobre espécies numa árvore e atende clientes NPC numa quitanda. O dono do projeto é o Eric. Responda sempre em português do Brasil.

## Equipe de agentes (`.claude/agents/`)
Os modelos já estão definidos em cada agente. Nunca peça ao Eric para trocar de modelo.

| Agente | Modelo | Papel | Pode editar? |
|---|---|---|---|
| `art-director` | fable | direção artística, análise de referências, plano visual | não |
| `developer` | sonnet | implementa etapas aprovadas e corrige bugs aprovados | sim, sem commit |
| `tester` | sonnet | joga e testa no Playwright, procura regressões, relatório | não |
| `code-reviewer` | fable | revisa o diff, bugs, arquitetura, riscos e escopo | não |

Os agentes de leitura (tester, code-reviewer, art-director) usam `.claude/hooks/qa-guard.py`, que só deixa escrever em `/tmp/` e bloqueia git que altere o repositório. O developer usa `.claude/hooks/dev-guard.py`, que bloqueia commit, push, merge, troca de branch e descarte de mudanças.

Se um agente falhar porque o modelo dele não está disponível, avise o Eric. Não troque de modelo nem faça o trabalho do agente no lugar dele sem avisar.

## Papel da sessão principal
Você coordena: escolhe os agentes conforme a tarefa, passa a cada um uma tarefa completa (contexto, escopo aprovado, arquivos, critérios de aceite) e junta os resultados. Não implemente você mesmo o que é trabalho do developer.

## Fluxo por tipo de tarefa
**Tarefa visual** (cenário, sprites, personagens, interface, luz, animação, referência de imagem):
1. `art-director` analisa e escreve o plano visual em etapas.
2. Apresente o plano ao Eric e **espere aprovação**.
3. `developer` implementa **só a etapa aprovada**.
4. `tester` testa a etapa e procura regressões.
5. `code-reviewer` revisa as alterações.
6. Relatório final ao Eric. A próxima etapa só começa com nova aprovação.

**Bug:**
1. `tester` reproduz e documenta. Pule este passo se o Eric já trouxe a reprodução.
2. Apresente a causa provável e a correção proposta e **espere aprovação**.
3. `developer` corrige, depois `tester` faz o reteste e a regressão, depois `code-reviewer` revisa.
4. Relatório final.

**Funcionalidade ou mudança de código não visual:** apresente o plano e espere aprovação. Depois siga como no bug: `developer`, `tester`, `code-reviewer`, relatório.

**Pergunta, análise ou explicação:** responda direto. Chame `code-reviewer` ou `art-director` só se a análise pedir leitura profunda do código ou do visual.

Se o tester ou o revisor apontarem problemas na etapa, mostre ao Eric. Uma nova rodada do developer só acontece com aprovação, a não ser que seja correção de algo que a própria etapa quebrou e que esteja dentro do escopo já aprovado.

## Modo autônomo (roadmap visual)
Desde 10/11/2026 o Eric autorizou trabalho autônomo de ponta a ponta no roadmap visual (`docs/roadmap-visual.md`). Nesse modo:
- Não espere aprovação a cada etapa. Planeje (art-director), implemente (developer), teste (tester), revise (code-reviewer), corrija e siga para a próxima etapa.
- Atualize `docs/roadmap-visual.md` ao concluir cada etapa e mande um resumo curto ao Eric com antes e depois.
- **Pare e avise** se algo puder causar perda de progresso ou quebrar uma funcionalidade importante.
- Continua proibido remover funcionalidade e mexer em mecânicas, economia, progressão ou salvamento.

## Regras
- **Aprovação:** fora do modo autônomo, não avance para uma nova etapa de implementação sem aprovação do Eric.
- **Somente leitura:** tester, code-reviewer e art-director nunca alteram código.
- **Mecânicas:** não altere gameplay, economia (preços, pagamentos), progressão (níveis, desbloqueios) nem salvamento sem autorização explícita.
- **Commit e push (desde 12/11/2026):** o Eric autorizou mudar o site aos poucos, desde que nada quebre. A sessão principal faz commit e push na `main` com frequência (a cada mudança verificada: fim de etapa, correção ou parte de etapa que passou na regressão, sem esperar juntar muita coisa), sempre depois de `git pull --rebase origin main`, para o Codex trabalhar em cima do código atual. Depois do push, e então atualiza o artifact e o zip do CrazyGames. Nunca `push --force` nem reescrever histórico. Os subagentes continuam sem commit.
- **Trabalho junto com o Codex:** o Codex também mexe neste repositório. Siga o `AGENTS.md` (pull antes de começar, marcar a área em `docs/roadmap-visual.md`, commits pequenos, pull --rebase antes de push, resolver conflitos preservando o trabalho dos dois). Antes de delegar uma etapa, confira a tabela "Quem está mexendo em quê" e marque a área.
- **Identidade:** preserve a pixel art gerada por código, os personagens originais, o português com tradução em `js/i18n.js` e o funcionamento no celular, no computador, em janela baixa e offline.

## Relatório final ao Eric
```
# <tarefa> — etapa N
## Resultado
- o que mudou, em linguagem simples (com prints antes/depois quando for visual)
## Testes (tester)
- o que passou, o que falhou
## Revisão (code-reviewer)
- veredito e achados relevantes
## Problemas encontrados
- ...
## Pendências e próxima etapa sugerida
- ... (precisa de aprovação)
```

## Mapa do projeto
- `index.html`, `css/style.css`, `js/i18n.js` (português → inglês), `js/game.js` (todo o jogo), `sw.js` (cache offline, `frutodromo-vN`), `manifest.json`.
- `tools/bundle.py` gera o arquivo único usado no artifact. `tools/build_portal.py` gera o zip do CrazyGames em `dist/`.
- Save em `localStorage["frutodromo9"]`, e no Data Module do SDK quando roda no CrazyGames. Saves antigos passam por `normState` e `migrate`.
- `docs/crazygames/`: capas, vídeos e texto da página do jogo no portal.
