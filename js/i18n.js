/* ================= idioma (português / inglês) =================
   O jogo é escrito em português. Em inglês, este arquivo traduz o texto na hora em que ele vai pra tela:
   intercepta innerHTML/textContent, traduz só os textos (nunca tags, classes ou ids) e guarda em cache.
   O save continua igual nos dois idiomas, então dá pra trocar a qualquer momento.
   Escolha: Ajustes → Idioma. Sem escolha salva, segue o idioma do navegador. */
(function(){
let cfg={};try{cfg=JSON.parse(localStorage.getItem("frutodromo_cfg")||"{}")}catch(e){}
const nav=((navigator.languages&&navigator.languages[0])||navigator.language||"pt")+"";
const LANG=cfg.lang=="pt"||cfg.lang=="en"?cfg.lang:(/^pt/i.test(nav)?"pt":"en");
window.LANG=LANG;window.EN=LANG=="en";window.tl=s=>s;
if(LANG!="en")return;
document.documentElement.lang="en";

/* ---- frases e palavras (português → inglês). As mais longas ganham das mais curtas. ---- */
const D={
// tela inicial, menus e botões
"Frutódromo — Randomizador de Frutas Doidas":"Frutódromo — Crazy Fruit Randomizer",
"A quitanda das frutas que a natureza não teve coragem de criar":"The fruit stand for fruits nature never dared to create",
"2 frutas no caldeirão":"2 fruits in the cauldron","o que os clientes pedem":"what customers ask for","espécies novas pra sua árvore":"new species for your tree",
"Presentes dos clientes ficam na":"Customer gifts go in the","e mudam qualquer fruta.":"and can change any fruit.",
"ABRIR A QUITANDA":"OPEN THE STAND","NOVO JOGO":"NEW GAME","TOQUE DE NOVO PRA APAGAR TUDO":"TAP AGAIN TO ERASE EVERYTHING",
"AJUSTES":"SETTINGS","FECHAR":"CLOSE","VOLTAR":"BACK","PRONTO":"DONE","ENTENDI":"GOT IT","CONTINUAR":"CONTINUE","COPIAR":"COPY","CARREGAR":"LOAD","IMPORTAR":"IMPORT",
"EXPORTAR PROGRESSO":"EXPORT PROGRESS","REVER TUTORIAL":"REPLAY TUTORIAL","BAIXAR":"DOWNLOAD","COMPARTILHAR":"SHARE","DESFAZER":"UNDO","ARRUMAR":"TIDY UP",
"COMO FAZER?":"HOW TO MAKE IT?","SIM, MOSTRAR":"YES, SHOW ME","AGORA NÃO":"NOT NOW","VER CARTA":"VIEW CARD","PAUSADO":"PAUSED","ABRIR DIA":"OPEN DAY","FIM DO DIA":"END OF DAY",
"SOM: LIGADO":"SOUND: ON","SOM: DESLIGADO":"SOUND: OFF","LIGADO":"ON","DESLIGADO":"OFF","ASSISTIR ANÚNCIO: +1 PRESENTE":"WATCH AD: +1 GIFT","SEU CÓDIGO":"YOUR CODE",
"O tempo e a paciência dos clientes estão congelados.":"Time and customer patience are frozen.",
"Compre frutas na feira.":"Buy fruits at the market.","Jogue 2 frutas no CALDEIRÃO: CRUZAR":"Drop 2 fruits in the CAULDRON: CROSS","Arraste até o cliente: ENTREGAR":"Drag to a customer: DELIVER","Toque na fruta: VER ATRIBUTOS":"Tap a fruit: SEE STATS",
"pra vender":"to sell","Arraste":"Drag",
// ajustes
"Música":"Music","Efeitos":"Effects","Vibração":"Vibration","Modo Zen":"Zen Mode","Clima real na janela":"Real weather in the window","Som de chuva":"Rain sound",
"Vibra o celular ao cruzar, entregar e descobrir":"Vibrates the phone when you cross, deliver and discover",
"Sem relógio e sem pressa: o dia não acaba e os clientes esperam pra sempre":"No clock, no rush: the day never ends and customers wait forever",
"Mostra o tempo da sua cidade e avisa sobre tempo perigoso":"Shows your city's weather and warns about dangerous weather",
"Barulho de chuva e trovão quando estiver chovendo na janela":"Rain and thunder sounds when it's raining in the window",
"Estilo da música:":"Music style:","Automático (lo-fi na chuva e à noite)":"Automatic (lo-fi when raining and at night)","Automático":"Automatic","Ver clima na janela:":"Window weather:",
// tutorial e ajuda
"Toque numa fruta pra ver os atributos. Na":"Tap a fruit to see its stats. The","ficam todas as espécies que você descobriu!":"keeps every species you've discovered!",
"uma fruta da feira (ou passe o mouse) pra ver doce, azedo e tamanho antes de comprar.":"a market fruit (or hover with the mouse) to see sweet, sour and size before buying.",
"Como funciona a árvore":"How the tree works","Como funciona":"How it works","Cada combinação nova de":"Each new combination of","tamanho, cor, sabor e poder":"size, color, taste and power",
"vira uma espécie. As fileiras mostram de qual geração ela é: a Feira é a geração 0, e cada cruzamento cria a seguinte.":"becomes a species. Each row is a generation: the Market is generation 0, and every cross creates the next one.",
"Regra:":"Rule:","parecidos se intensificam":"alike traits intensify","(pequena + pequena encolhe, grande + grande cresce).":"(small + small shrinks, big + big grows).",
"Toque numa fruta pra ver os pais e os filhos dela. Toque num":"Tap a fruit to see its parents and children. Tap a","pra ver a receita da próxima descoberta.":"to see the recipe for the next discovery.",
"Toque numa fruta pra ver":"Tap a fruit to see","de onde ela veio":"where it came from","o que ela já gerou":"what it has produced",
"Ainda nenhum. Cruze ela com outra!":"None yet. Cross it with another one!","Fruta da feira":"Market fruit","TENTE":"TRY",
"Espécie desconhecida":"Unknown species","Deve sair:":"Should give:","PRÓXIMAS DESCOBERTAS":"NEXT DISCOVERIES","toque pra ver a receita":"tap to see the recipe",
"Nenhuma espécie com esse filtro ainda.":"No species with this filter yet.","Toque no requisito de COR de um cliente pra abrir direto aqui.":"Tap a customer's COLOR requirement to jump straight here.",
"A cor do filho é a":"A child's color is the","mistura das cores dos pais":"mix of its parents' colors",
"como tinta. Híbridos podem ser misturados de novo pra chegar em outras cores.":"like paint. Hybrids can be mixed again to reach other colors.",
"Só por":"Only by",": chance pequena ao cruzar qualquer fruta":": small chance when crossing any fruit",
"lendárias. Toque numa carta pra abrir, baixar ou compartilhar.":"legendary. Tap a card to open, download or share.","cada uma dá moedas de presente.":"each one gives bonus coins.",
"Pedido de":"Request from","É só comprar na feira:":"Just buy it at the market:",
"Hmm, esse pedido ficou difícil. Pode trocar por outro cliente esperando ele ir embora.":"Hmm, this one's tricky. You can let this customer leave and wait for another.",
"As frutas da feira estão lá embaixo. Use o resultado de cada passo no passo seguinte.":"The market fruits are down below. Use each step's result in the next step.",
"Toque numa fruta da mesa pra usar · toque de novo pra cancelar":"Tap a fruit on the table to use it · tap again to cancel",
"Vazia. Clientes dão":"Empty. Customers give","quando você entrega!":"when you deliver!",
// fim do dia
"Lucro do dia":"Day's profit","Clientes atendidos":"Customers served","Maior pagamento":"Biggest payment","Novas espécies":"New species",
"presente da quitanda":"stand gift","pra começar o próximo dia!":"to start the next day!","Dia incrível! A quitanda está famosa.":"Amazing day! The stand is famous.",
"Bom dia de trabalho!":"Good day's work!","Dia fraco... amanhã é outro dia!":"Slow day... tomorrow is another day!","Brilhantes achadas":"Shiny ones found","Maior combo":"Best combo","Cruzamentos":"Crosses","Melhor dia":"Best day","VIPs atendidos":"VIPs served","Dias jogados":"Days played","TAMANHO EXTREMO":"EXTREME SIZE","PREVISÃO":"PREVIEW",
"Clientes pedem frutas MINI e ENORMES":"Customers ask for MINI and HUGE fruits","Pedidos de FOGO e clientes VIP":"FIRE requests and VIP customers",
"Pedidos de GELO e cores raras":"ICE requests and rare colors","Microscópicas, Gigantescas e SUPER-FRUTAS":"Microscopic, Gigantic and SUPER-FRUITS",
// avisos
"Moedas insuficientes":"Not enough coins","O caldeirão está ocupado!":"The cauldron is busy!","Coloque mais uma fruta no caldeirão":"Add one more fruit to the cauldron","Misturando...":"Mixing...",
"Nasceu:":"Born:","Venda desfeita!":"Sale undone!","Não dá pra desfazer: você já gastou as moedas dessa venda.":"Can't undo: you already spent the coins from that sale.",
"Não mudou nada nessa fruta. Tente outra!":"Nothing changed on this fruit. Try another one!","Progresso carregado!":"Progress loaded!",
"Código inválido. Confira se copiou inteiro. Seu progresso atual não foi alterado.":"Invalid code. Make sure you copied all of it. Your current progress wasn't changed.",
"Código copiado!":"Code copied!","Selecionei o código. Copie manualmente.":"I selected the code. Copy it manually.",
"Guarde esse código (num bloco de notas ou mande pra você mesmo). Ele leva tudo: frutas, espécies, cartas e conquistas.":"Keep this code (in a notes app, or send it to yourself). It carries everything: fruits, species, cards and achievements.",
"Cole o código do seu progresso. Isso":"Paste your progress code. This","substitui":"replaces","o jogo atual deste aparelho.":"the current game on this device.",
"Não deu pra salvar!":"Couldn't save!","O espaço do navegador encheu.":"The browser storage is full.","Em Ajustes → EXPORTAR PROGRESSO guarde um backup.":"Go to Settings → EXPORT PROGRESS and keep a backup.",
"Carta salva!":"Card saved!","Carta baixada!":"Card downloaded!","Não deu pra baixar aqui. Faça um print!":"Couldn't download here. Take a screenshot!",
"Aqui não dá pra baixar. Faça um print, ou abra mendesoz.github.io/frutodromo":"Downloads don't work here. Take a screenshot, or open mendesoz.github.io/frutodromo",
"Aqui não dá pra baixar. Faça um print!":"Downloads don't work here. Take a screenshot!","Texto copiado! Cole junto com o print.":"Text copied! Paste it with your screenshot.",
"Compartilhar não funciona aqui. Abra pelo link do GitHub Pages!":"Sharing doesn't work here. Open the GitHub Pages link!","Compartilhar não funciona aqui. Faça um print!":"Sharing doesn't work here. Take a screenshot!",
"O anúncio não carregou agora. Tente de novo daqui a pouco.":"The ad didn't load. Try again in a bit.","Quase! Faltou:":"Almost! Missing:",
"Olha a fruta que eu descobri no Frutódromo:":"Look at the fruit I discovered in Frutódromo:",
"PRESENTE do anúncio":"GIFT from the ad","PRESENTE da quitanda":"GIFT from the stand",
"NOVA ESPÉCIE":"NEW SPECIES","ESPÉCIE NOVA":"NEW SPECIES","Quero esta aqui:":"I want this one:","Quero uma fruta que ninguém viu ainda, assim ó!":"I want a fruit nobody has seen yet, like this one!","VARIEDADE NOVA":"NEW VARIETY","CARTA DA ESPÉCIE":"SPECIES CARD","VERSÃO BRILHANTE":"SHINY VERSION","SUPER-FRUTA":"SUPER-FRUIT","MUTAÇÃO":"MUTATION",
// clima
"CLIMA DE VERDADE?":"REAL WEATHER?","A janela da quitanda pode mostrar o":"The stand's window can show the","tempo real da sua cidade":"live weather in your city",
": sol, nuvens, chuva e noite. Se vier tempo perigoso, o jogo te avisa.":": sun, clouds, rain and night. If dangerous weather comes, the game warns you.",
"Usa sua localização aproximada só pra buscar a previsão (Open-Meteo). Nada é guardado fora do seu aparelho.":"Uses your approximate location only to fetch the forecast (Open-Meteo). Nothing is stored off your device.",
"Sem localização: a janela mostra só a hora do dia":"No location: the window only shows the time of day",
"AVISO DO TEMPO":"WEATHER ALERT","TEMPESTADE COM RAIOS":"THUNDERSTORM","Há tempestade com raios na sua região agora.":"There's a thunderstorm in your area right now.",
"Fique em local fechado, longe de janelas, árvores e postes. Evite usar aparelhos ligados na tomada.":"Stay indoors, away from windows, trees and poles. Avoid using plugged-in devices.",
"CHUVA FORTE":"HEAVY RAIN","Está chovendo forte na sua região.":"It's raining heavily in your area.",
"Cuidado com alagamentos e enxurradas. Nunca atravesse ruas ou rios alagados.":"Watch out for floods and flash floods. Never cross flooded streets or rivers.",
"CALOR EXTREMO":"EXTREME HEAT","Beba bastante água, evite sol forte entre 10h e 16h e cuide de crianças, idosos e animais.":"Drink plenty of water, avoid strong sun between 10am and 4pm, and look after children, older people and animals.",
"FRIO INTENSO":"INTENSE COLD","Agasalhe-se bem e proteja pessoas em situação de rua, idosos e animais.":"Bundle up and help protect people without a home, older people and animals.",
"VENTOS FORTES":"STRONG WINDS","Fique longe de árvores, placas e estruturas soltas.":"Stay away from trees, signs and loose structures.",
"Baseado na previsão do Open-Meteo pra sua região.":"Based on the Open-Meteo forecast for your area.","Não é um alerta oficial.":"This is not an official alert.",
"Pra avisos oficiais, acompanhe a":"For official alerts, follow","Defesa Civil (ligue 199)":"your local civil defense","INMET":"weather service",
"Nublado":"Cloudy","Garoa":"Drizzle","Chuva forte":"Heavy rain","Tempestade":"Storm","Entardecer":"Sunset","Noite estrelada":"Starry night","Noite chuvosa":"Rainy night","Chuva":"Rain",
// conquistas
"Banco de sementes":"Seed Bank","Genética infinita":"Infinite Genetics","Aprendiz de alquimista":"Alchemist's Apprentice","Alquimista":"Alchemist","Mestre do caldeirão":"Cauldron Master",
"Quitandeiro":"Grocer","Freguesia fiel":"Loyal Regulars","Lenda da feira":"Market Legend","Curioso":"Curious","Naturalista":"Naturalist","Árvore infinita":"Infinite Tree",
"Microscópio":"Microscope","Crie uma fruta Microscópica":"Make a Microscopic fruit","Titã":"Titan","Crie uma fruta Gigantesca":"Make a Gigantic fruit","Herói da feira":"Market Hero",
"Crie uma super-fruta":"Make a super-fruit","Brilho raro":"Rare Shine","Encontre uma fruta brilhante":"Find a shiny fruit","Descubra uma espécie Lendária":"Discover a Legendary species",
"Clientela VIP":"VIP Clientele","Faça um combo de":"Make a combo of","Dia de ouro":"Golden Day","Lucre 100 moedas num dia":"Earn 100 coins in one day","Cientista maluco":"Mad Scientist",
"Use 10 artefatos":"Use 10 items","Colete":"Collect","Cruze":"Cross","Atenda":"Serve","Descubra":"Discover","Entregue":"Deliver","Segure":"Hold","entregas":"deliveries",
// artefatos
"Poção Gigante":"Giant Potion","Poção Minúscula":"Tiny Potion","+3 de tamanho (até 12). Morango gigante? Pode!":"+3 size (max 12). Giant strawberry? Sure!",
"-3 de tamanho (até 0). Melancia de bolso!":"-3 size (min 0). Pocket watermelon!","Mel Encantado":"Enchanted Honey","+3 de doçura":"+3 sweetness","Gota Azeda":"Sour Drop","+3 de acidez":"+3 sourness",
"Tinta Mágica":"Magic Paint","Pinta a fruta de outra cor":"Paints the fruit another color","Pena de Fênix":"Phoenix Feather","A fruta pega FOGO":"The fruit catches FIRE",
"Cristal Eterno":"Eternal Crystal","A fruta vira GELO":"The fruit turns to ICE","Raio na Garrafa":"Lightning in a Bottle","A fruta ganha RAIO":"The fruit gets LIGHTNING",
"Capa Heroica":"Hero Cape","Vira SUPER-FRUTA":"Becomes a SUPER-FRUIT","Pó de Estrela":"Stardust","Deixa a fruta BRILHANTE":"Makes the fruit SHINY",
"Pincel Doido":"Crazy Brush","Troca a estampa por uma maluca":"Swaps the pattern for a wild one","Molde Maluco":"Wacky Mold","Deforma a fruta num formato novo":"Warps the fruit into a new shape",
"Mel":"Honey","Minúscula":"Tiny","já tem":"got it","Fênix":"Phoenix","Cristal":"Crystal","Capa":"Cape","Estrela":"Star","Pincel":"Brush","Molde":"Mold",
// clientes especiais (nomes de gente ficam como estão)
"Chef Estrelado":"Star Chef","Crítica Gourmet":"Gourmet Critic","Cientista Maluca":"Mad Scientist","Prefeito":"Mayor","Influencer Fit":"Fitness Influencer","Colecionador":"Collector",
"Felino Félix":"Felix the Cat","Dona Coelha":"Mrs. Bunny","Sr. Bigode":"Mr. Whiskers","Pinguim Pipo":"Pipo the Penguin","Gelinho":"Frosty","Robô R-12":"Robot R-12","Unidade K7":"Unit K7",
"Xuxu de Marte":"Xuxu from Mars","Fantasminha":"Little Ghost","Rã Rita":"Rita the Frog","Sapo Zé":"Zé the Toad","Ursão":"Big Bear","Caramelo":"Caramel","Pipoca":"Popcorn","Pantufa":"Slippers","Bolinha":"Bubbles",
// frutas da feira
"Pimenta-Dragão":"Dragon Pepper","Fruta Glacial":"Glacial Fruit","Carambola Elétrica":"Electric Starfruit","Carambola":"Starfruit","Pimenta":"Pepper",
"Morango":"Strawberry","Limão":"Lemon","Uva":"Grape","Coco":"Coconut","Melancia":"Watermelon","Manga":"Mango","Abacaxi":"Pineapple",
// atributos
"muito doce":"very sweet","pouco doce":"slightly sweet","nada doce":"not sweet","muito azeda":"very sour","pouco azeda":"slightly sour","nada azeda":"not sour",
"agridoce":"sweet & sour","suave":"mild","doce":"sweet","azeda":"sour","azedo":"sour","Microscópica":"Microscopic","Pequena":"Small","Média":"Medium","Grande":"Big","Enorme":"Huge",
"Gigantesca":"Gigantic","Gigante":"Giant","Tamanho":"Size","TAM.":"SIZE",
"Fogo":"Fire","Gelo":"Ice","Raio":"Lightning","Veneno":"Poison","Cósmico":"Cosmic","Flamejante":"Flaming","Congelada":"Frozen","Elétrica":"Electric","Tóxica":"Toxic","Cósmica":"Cosmic",
"Nobre":"Noble","Rara":"Rare","Ancestral":"Ancient","Lendária":"Legendary","lendárias":"legendary","Comum":"Common","Incomum":"Uncommon","Épica":"Epic",
"vermelha":"red","laranja":"orange","amarela":"yellow","verde":"green","roxa":"purple","marrom":"brown","cinza":"gray","azul":"blue","branca":"white",
"brilhante":"shiny","brilhantes":"shiny","mutante":"mutant","mutação":"mutation",
// palavras soltas
"Da feira":"From the market","Geração":"Generation","geração":"generation","cor":"color","da cor":"colored","até o":"to the","até":"up to",
"fruta":"fruit","frutas":"fruits","espécie":"species","espécies":"species","esp.":"sp.","variedade":"variety","variedades":"varieties","cartas":"cards","carta":"card",
"conquistas":"achievements","conquista":"achievement","moedas":"coins","moeda":"coin","clientes":"customers","cliente":"customer","presentes":"gifts","presente":"gift",
"Dia":"Day","Nível":"Level","feira":"market","bolsa":"bag","caldeirão":"cauldron","árvore":"tree","cores":"colors","álbum":"album","troféus":"trophies","receita":"recipe",
"pais":"parents","filhos":"children","todas":"all","duas frutas":"two fruits","pra criar uma nova!":"to make a new one!","do balão se precisar da receita.":"on the bubble if you need the recipe."
};
// palavras que também são nomes de clientes: só traduz em minúsculas ou TUDO MAIÚSCULO ("Rosa" é nome, "rosa" é cor)
const CS={"rosa":"pink"};
// trecho que é exatamente isso (entre duas tags)
const SEG={"e":"and","e o":"and","de":"of"};
// HTML inteiro do tutorial (as tags ficam em outra ordem no inglês)
const HX=[
["Arraste <b>duas frutas</b> até o <b>caldeirão</b> pra criar uma nova!","Drag <b>two fruits</b> into the <b>cauldron</b> to make a new one!"],
["Agora arraste uma fruta até o <b>cliente</b> que pediu algo parecido. Toque no <b>?</b> do balão se precisar da receita.","Now drag a fruit to the <b>customer</b> who asked for something like it. Tap the <b>?</b> on the bubble if you need the recipe."]];

const ord=n=>n+(n%100>=11&&n%100<=13?"th":["th","st","nd","rd"][n%10]||"th");
const up=(m,v)=>m===m.toUpperCase()?v.toUpperCase():v;
const PAT=[
[/nº ?(\d+) de /g,"#$1 of "],[/nº ?(\d+)/g,"#$1"],
[/(\d+)ª (geração|GERAÇÃO)/g,(a,n,g)=>up(g,ord(+n)+" generation")],
[/\bNV(\d)/g,"LV$1"],
[/(\d+) de (\d+)/g,"$1 of $2"],[/(\d+) a (\d+)/g,"$1 to $2"],[/(\d+) ou (\d+)/g,"$1 or $2"],
[/A temperatura está em (-?\d+)°C\./g,"The temperature is $1°C."],
[/Rajadas de até (\d+) km\/h\./g,"Gusts up to $1 km/h."],
[/(\d+) cruzamentos? no caldeirão:/g,(a,n)=>n+(n=="1"?" cross":" crosses")+" in the cauldron:"],
[/Vendida por (\d+)/g,"Sold for $1"],[/^(\s*)com (.+):(\s*)$/g,"$1with $2:$3"],
[/PRESENTE de /g,"GIFT from "],
[/Faça um combo de (\d+) entregas/g,"Make a $1-delivery combo"],
[/Combo x(\d+)/g,"Combo x$1"]];

// "Morango Rara Flamejante" → "Rara Flamejante Morango" (em inglês o adjetivo vem antes)
const ADJ="Nobre|Rara|Ancestral|Lendária|Flamejante|Congelada|Elétrica|Tóxica|Cósmica";
const NAMERX=new RegExp("(^|[^\\p{L}])(\\p{Lu}[\\p{L}'-]*)((?: (?:"+ADJ+"))+)(?=[^\\p{L}]|$)","gu");

const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
const MAP=new Map();Object.entries(D).forEach(([k,v])=>MAP.set(k.toLowerCase(),v));Object.entries(CS).forEach(([k,v])=>MAP.set(k,v));
const keys=[...MAP.keys()].sort((a,b)=>b.length-a.length);
const RX=new RegExp("(^|[^\\p{L}\\p{N}])("+keys.map(esc).join("|")+")(?=[^\\p{L}\\p{N}]|$)","giu");
function fit(m,v){const letters=m.replace(/[^\p{L}]/gu,"");
 if(letters.length>1&&letters===letters.toUpperCase())return v.toUpperCase();
 if(/^\p{Lu}/u.test(m)&&/^\p{Ll}/u.test(v))return v[0].toUpperCase()+v.slice(1);
 if(/^\p{Ll}/u.test(m)&&/^\p{Lu}\p{Ll}/u.test(v))return v[0].toLowerCase()+v.slice(1);
 return v}
function trText(t){
 if(typeof t!="string"||!/\p{L}/u.test(t))return t;
 const tt=t.trim();if(SEG[tt]!=null)return t.replace(tt,SEG[tt]);
 for(const[rx,f]of PAT)t=t.replace(rx,f);
 t=t.replace(NAMERX,(all,pre,root,adj)=>MAP.has((root+adj).toLowerCase())?all:pre+adj.trim()+" "+root);
 return t.replace(RX,(all,pre,m)=>{const lk=m.toLowerCase();
  if(CS[lk]&&m!==lk&&m!==lk.toUpperCase())return all;
  return pre+fit(m,MAP.get(lk))})}
const trTag=tag=>tag.replace(/\b(title|alt|placeholder|aria-label)="([^"]*)"/g,(a,n,v)=>n+'="'+trText(v)+'"');
const cache=new Map();
function trHTML(h){
 if(typeof h!="string"||!h||!/\p{L}/u.test(h))return h;
 const c=cache.get(h);if(c!==undefined)return c;
 let o=h;for(const[a,b]of HX)if(o.includes(a))o=o.split(a).join(b);
 o=o.replace(/(<(?:[^>"']|"[^"]*"|'[^']*')*>)|([^<]+)/g,(all,tag,txt)=>tag?trTag(tag):trText(txt));
 if(cache.size>3000)cache.clear();cache.set(h,o);return o}
window.tl=trHTML;

const hook=(proto,prop)=>{const d=Object.getOwnPropertyDescriptor(proto,prop);if(!d||!d.set)return;
 Object.defineProperty(proto,prop,{configurable:true,enumerable:d.enumerable,get:d.get,set(v){d.set.call(this,typeof v=="string"?(prop=="innerHTML"?trHTML(v):trText(v)):v)}})};
hook(Element.prototype,"innerHTML");hook(Node.prototype,"textContent");

// o que já está no index.html
document.title=trText(document.title);
const walk=n=>{if(n.nodeType==3){const v=trText(n.nodeValue);if(v!==n.nodeValue)n.nodeValue=v}
 else if(n.nodeType==1&&n.tagName!="SCRIPT"&&n.tagName!="STYLE"){if(n.title)n.title=trText(n.title);n.childNodes.forEach(walk)}};
if(document.body)walk(document.body);
})();
