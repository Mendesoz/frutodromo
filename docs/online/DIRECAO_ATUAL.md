# Brotalume — direção atual e coordenação

15/11/2026. Este registro prevalece sobre os primeiros briefs de frutas e sobre instruções conflitantes de apresentação.

## Atualização mais recente — base online autorizada
16/11: mapa e cliente conectados ao servidor concluídos no piloto local, [QA](QA_MAPA_ONLINE_2026-11-16.md). Código23610f5,28testes local/PostgreSQL17 e navegador nas quatro dimensões. Entrada `http://127.0.0.1:8860/play/`; não confundir com hospedagem pública ou com a prévia antiga do protótipo. Claude implementou layout/migração/comandos/testes nos arquivos delegados e revisou o cliente. Próxima etapa: comércio virtual entre duas contas.

Eric autorizou construir a base proposta pelo Codex, incluindo banco/servidor e colaboração com Claude, com meta de alpha até 30/11/2026. Plano vigente: [PLANO_NOVEMBRO.md](PLANO_NOVEMBRO.md). Branch `codex/fazenda-online-base`, derivada da integração visual bce3379. `server/` contém piloto independente com cliente em `/play/`; a entrada histórica `prototipo-fazenda/` continua separada e local. Comércio entre jogadores permanece pendente.

A autenticação do Claude Code voltou a funcionar após Eric entrar pela extensão do VS Code. Duas chamadas dedicadas concluíram o parecer [da proposta](CLAUDE_BASE_ONLINE_2026-11-15.md) e [do código real](CLAUDE_REVISAO_CODIGO_2026-11-15.md). Codex aplicou os achados pertinentes e ampliou os testes. Isso atualiza as falhas de autenticação históricas abaixo, sem criar ponte automática para o chat antigo.

## Direção explicitada pelo Eric neste chat
- Fazer uma fazenda personalizável, usando Hay Day como referência de gameplay.
- Preservar a essência, pixel art e sprites originais do Frutódromo. Hay Day não é referência de identidade visual ou de ativos.
- Não usar caldeirão ou genética. Eclosão ocorre em chocadeira/ninho.
- Agentes precisam combinar o trabalho antes de construir versões concorrentes.
- Encontrar um nome novo para o produto.

## Nome proposto pelo Codex
**Brotalume**. Broto + lume; nome de trabalho para cultivo, descobertas e um lugar próprio. Frase candidata: “Cultive seu canto do mundo.” Eric ainda não confirmou o nome definitivo.

Uma busca pública preliminar não trouxe um jogo evidente com esse nome. Isso não é uma verificação jurídica de marca, domínio ou disponibilidade comercial. Brotália foi descartado nesta triagem porque já existe um jogo de cultivo/construção chamado BROTALIA em https://dvk-music.itch.io/brotalia .

## Como traduzir a referência de gameplay
São propostas de implementação a detalhar, não funções já entregues:
1. Uma fazenda contínua, em que o jogador escolhe onde colocar canteiros, instalações, caminhos e decoração.
2. Plantar e colher como ações no cenário; criar animais e recolher os produtos.
3. Cadeias de produção: matérias-primas viram produtos em instalações próprias, ocupando tempo e capacidade.
4. Encomendas, venda e comércio dão destino aos produtos; expansão e personalização dão destino ao progresso.
5. Visitar fazendas e mostrar o lugar criado pelo jogador pode apoiar a camada social.

AFK, raridades, achados, três moedas e estudo de mercado com ganho de jogadores vêm das decisões anteriores. Referenciar Hay Day não define automaticamente suas regras nem autoriza pagamentos/saques. Não copiar números, assets, mapas, interface ou sistemas completos de outra marca.

Referência oficial consultada: https://supercell.com/en/games/hayday/ . O recorte acima é a interpretação de produto proposta pelo Codex para o pedido do Eric.

## Fonte única e divisão de trabalho proposta
- Apresentação em revisão: `codex/fazenda-visual`, [PR #29](https://github.com/Mendesoz/frutodromo/pull/29), contra `claude/fazenda-prototipo`.
- Codex: cenário, composição e apresentação visual nesta rodada. Claude: revisão do loop, economia e parecer sobre o recorte jogável. Essa divisão foi enviada para confirmação, não presumir aceite sem resposta.
- Antes de alterar o mesmo arquivo, consultar branch/HEAD, área em andamento e PR. Combinar tarefa/arquivos antes de editar.
- GitHub + `Mendesoz/ai-game-studio` são o registro durável. Uma sessão dedicada do CLI não injeta mensagens na conversa antiga do aplicativo. Distinguir mensagem preparada, enviada e respondida.
- Solicitação de coordenação/revisão enviada ao Claude no PR #29. Não afirmar que a sessão antiga recebeu ou respondeu sem evidência.
- A tentativa adicional de chamada direta pelo Claude Code local falhou com sessão de autenticação expirada. Nenhuma resposta ou aceite foi recebido nessa chamada; não houve tentativa de contornar a autenticação. A mensagem no PR foi publicada com sucesso, aguardando resposta.

## Integração desta rodada
Codex incorporou o trabalho `d4e4e45` do Claude, incluindo seletor de personagem, clientes/expressões, sprites originais de frutas e save `fazenda_proto_v2`. Preserva o exterior e o reaproveitamento de decoração do Codex. Remove o caldeirão da eclosão e da cópia de interface.

O protótipo atual ainda não implementa edição livre da fazenda ou cadeias produtivas completas. A próxima etapa de gameplay deve ser pequena: colocar/mover canteiros e uma instalação, persistir a disposição e fechar um ciclo curto de produção e encomenda.

O jogo Frutódromo publicado permanece separado. Não promover esta expansão à main nesta rodada.
