# Brotalume — direção atual e coordenação

**Atualização16/11:** cenário candidato e caminhada WASD/botões móveis integrados ao piloto; Claude fez colisão/testes, Codex arte/integração/QA. [Resultado e limites](QA_CAMINHADA_2026-11-16.md). Referências visuais adicionais autorizadas: Stardew Valley, Don't Starve e captura do Sunflower Land; manter identidade original. Arte ainda em revisão, automação funcional etapa4 pendente. Esta atualização prevalece sobre o estado anterior de estudo somente isolado.

15/11/2026. Este registro prevalece sobre os primeiros briefs de frutas e sobre instruções conflitantes de apresentação.

## Atualização mais recente — base online autorizada
16/11, revisão de direção pelo Eric: separar **funcionalidade/organização** de **visual da fazenda**. Cenário atual considerado simplório e incongruente com o elenco; os marcos funcionais abaixo não equivalem a aprovação visual. [Direção de arte e duas filas](DIRECAO_ARTE.md): Codex conduz cena de referência isolada, Claude entregou [fila funcional e contrato proposto](FRENTE_FUNCIONAL_2026-11-16.md) em3f743d7. Estudo visual01 preparado; ainda não aprovado ou integrado ao cliente. Identidade dos personagens é a referência para o mundo.

16/11: feira virtual implementada no cliente conectado: anúncios com reserva, compra/cancelamento atômicos e histórico. [QA](QA_MERCADO_2026-11-16.md), código4f4b6cf e cobertura8aedd7c:44testes PostgreSQL17 verdes;43testes locais mais o caso adicional dirigido passaram. Negociação real na UI em duas contas, inclusive telefone em pé. Claude implementou módulo/migração/testes em arquivos delegados; Codex integrou cliente/API e executou QA. Entrada `http://127.0.0.1:8860/play/`; não confundir com hospedagem pública ou prévia antiga. Próxima etapa: automação limitada da produção.

Eric autorizou construir a base proposta pelo Codex, incluindo banco/servidor e colaboração com Claude, com meta de alpha até 30/11/2026. Plano vigente: [PLANO_NOVEMBRO.md](PLANO_NOVEMBRO.md). Branch `codex/fazenda-online-base`, derivada da integração visual bce3379. `server/` contém piloto independente com cliente em `/play/`; a entrada histórica `prototipo-fazenda/` continua separada e local. Comércio usa somente moedas virtuais resetáveis, sem taxa nesta etapa.

Na conferência de16/11, a branch documental `claude/online-simulacao` avançou para303bbb6: registra interesse do Eric em VIP/passe acessível por farm, ficha negociável e comissão. A branch `claude/fazenda-prototipo` entregou e65e26d, experimento local de VIP/comissão10%, sem autoridade do servidor. Preservados como referência de descoberta, sem incorporar regras financeiras ou conclusões jurídicas ao piloto. Mensagem de coordenação à sessão cloud retornou ok:true e o Claude confirmou alinhamento no handoff41ef83e. Definir moeda, sumidouros, benefícios, abuso e viabilidade em tarefa própria; não reintroduzir caldeirão/RNG pago pela documentação histórica.

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
