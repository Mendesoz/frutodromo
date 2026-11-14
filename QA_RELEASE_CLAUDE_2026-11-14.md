# Regressão final da candidata do CrazyGames (tarefa 9) — Claude, 14/11/2026

**SHA testado:** `4c6608de42cf9dd76e635d487d727ede9fb017f9` (`codex/crazygames-final-logic`, PR #25), em checkout destacado. Nenhuma linha do jogo foi alterada. Esta branch (`qa-claude-release`) só acrescenta este relatório, as evidências, o zip e dois arquivos de QA (`tools/qa/log06.py` e a correção do `tools/qa/mksite.sh`).

**Aprovação:** o Eric aprovou a candidata do PR #25, as capas e os vídeos e o avanço para o envio, conforme relatado pelo Codex em 14/11. A regressão final abaixo é a condição antes de publicar. Não houve merge, publicação nem envio ao CrazyGames.

**Veredito:** PASS em tudo o que foi executado, com zero erros de página. Nenhum bug novo foi reproduzido.

## Pacote do portal
| Item | Valor |
|---|---|
| Arquivo | `release/frutodromo-crazygames-4c6608d.zip` (nesta branch) |
| Gerado por | `python3 tools/build_portal.py` sobre o SHA testado |
| Tamanho | 129.678 bytes; contém só `index.html` (314.316 bytes, com fontes e CSS embutidos) |
| SHA-256 | `3a248e560081253c7798e243c6410973b6dfacbd21f01b43eefbca102a97be0e` |
| Conferência do conteúdo | correção LOG-06, `tutSkip`, PULAR/SKIP TUTORIAL, trava M-08 (`SERVED`), SDK v3 do CrazyGames como única origem externa |

## Ambiente
- Linux (contêiner), Playwright com Chromium headless, `Math.random` com semente nos testes que precisam.
- WebKitGTK 2.52 (WebKitWebDriver) sob Xvfb, com `WEBKIT_DISABLE_COMPOSITING_MODE=1`. É o motor do Safari, **não é Safari nem iPhone**.
- Node para sintaxe e `tests/difficulty.test.cjs`.
- Não executados aqui: iPhone/Safari real, Firefox (não instalado) e QA Tool do CrazyGames (exige enviar o zip ao painel de desenvolvedor, que é passo do Eric).

## Resultados
| Teste | Resultado | Evidência (`docs/qa/2026-11-14/release/`) |
|---|---|---|
| Sintaxe (`game.js`, `i18n.js`, `sw.js`) e `manifest.json` | PASS | — |
| `tests/difficulty.test.cjs` | PASS 7/7 | — |
| LOG-06 no jogo real (40 mil sorteios por caso, níveis 3/5/7, sequência −40 a +40) | PASS: nunca negativo; com sequência negativa fica 68/32/0 (L3), 63/37/0 (L5), 60/40/0 (L7); médios preservados; neutro e positivo iguais aos de antes | `log06.log` |
| Smoke (compra, mistura, dia) | PASS, 0 erros | `smoke.log` |
| Primeiros minutos com tutorial, 3 tamanhos | PASS; tutorial não cobre frutas nem caldeirão | `first2.log` |
| Regressão em 6 tamanhos (arraste, mistura, entrega, venda, árvore, álbum, carta, save após recarga) | PASS; saída **idêntica** à de `0170b41` (com semente) | `regress.log` |
| Tutorial: pular, mãozinha, recarga, rever, movimento reduzido; pt e en | PASS | `tuthand.log` |
| Textos sem tradução no inglês | PASS (só nomes próprios de personagens) | `untr.log` |
| M-08: cliente já atendido não paga de novo; pausa congela o relógio | PASS, 1 pagamento | `m08.log` |
| Modo dica liga/desliga, salvo e offline | PASS | `hints.log` |
| VIPs com figurino, balões sem sobrepor nem cortar | PASS | `vip.log` |
| Áreas de toque do cabeçalho | PASS | `hit.log` |
| Responsivo, 11 tamanhos × pt/en | PASS; "fora da tela" são os cartões do trilho rolável da feira (esperado) | `resp.log` |
| Paisagem de telefone (balões e personagens) | PASS | `land.log` |
| Save antigo (versão 2) carrega e joga | PASS | `oldsave.log` |
| M-06: entrega real com dica, níveis 2 a 12 | PASS, 125/125 pagas | `logic.log` |
| Receitas e mistura | PASS, 20/20 misturas, 100% das receitas | `logic2.log`, `recipes.log` |
| Receita mais longa (5 passos) cabe na tela | PASS, 5 tamanhos | `deep.log` |
| Palavras partidas no meio | PASS, 0 casos em 6 combinações | `broken.log` |
| PWA: abre online e reabre offline 3 vezes | PASS 3/3, cache `frutodromo-v45` | `pwa2.log` |
| WebKit: carga, recursos CSS, fonte, cruzamento com ponteiro real em 4 tamanhos | PASS, 0 erros | `wk.log`, `wk-*-cruzou.png` |
| WebKit: entrega real com ponteiro | PASS 3/3 na 2ª execução; na 1ª, 2/3 (ver observação 1) | `wkdeliver.log`, `wkdeliver-run2.log` |
| Desempenho com CPU 4× mais lenta, 393×760 e 1280×680 | PASS; igual ou melhor que a `main` (`5cf0d73`), sem tarefas longas | `perf.log` |
| Sessão longa de 6 min | PASS; heap estável (~4 MB), sem acúmulo de fantasmas ou avisos; mesmo padrão da rodada anterior | `soak.log` |
| Zip com SDK simulado: save no Data Module, 2ª visita, mudo do SDK, sem Data Module, sem SDK | PASS, 0 erros | `portal_sdk.log` |
| Zip aberto direto e site sem SW no portal | PASS | `portal_direct.log` |

## Observações (não são bugs do jogo)
1. **`wkdeliver.py`, 1ª execução:** no 3º caso (1024×600) o script não encontrou cliente atendível em 12 compras e terminou sem entrega. O `localStorage.clear()` do script não zera o estado, porque o jogo salva de novo ao sair da página; o caso herdou 0 moedas e 106 frutas. A 2ª execução passou nos 3 casos. Vale corrigir o script, não o jogo.
2. **`wk.py`:** a coluna `drags` sai `-1` porque o script lê `window.S`, e `S` não fica em `window`. O cruzamento é confirmado pelo estado depois do arraste (frutas −1, árvore +1) e pelos prints.
3. **Cache do SW:** o `game.js` mudou (LOG-06) e o cache continua `frutodromo-v45`. O SW busca primeiro na rede, então quem abre online recebe o arquivo novo e atualiza a cópia offline. Não precisa subir a versão para esta mudança. O portal não usa SW.
4. **`tools/qa/mksite.sh`:** a versão da branch tinha um erro de aspas que impedia gerar a cópia de teste. Foi corrigido aqui e conferido; os testes usaram a cópia equivalente em `/tmp`.

## Pendências antes de publicar (Eric)
- Enviar o zip ao painel do CrazyGames e rodar a QA Tool deles.
- Subir capas, vídeos e o texto de `docs/crazygames/pagina.md`.
- Decidir o merge da candidata e a publicação do site. O Claude não faz nenhum dos dois.
