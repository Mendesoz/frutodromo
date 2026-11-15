const fs=require('node:fs');
const path=require('node:path');
const repo=path.resolve(__dirname,'../..');
const source=fs.readFileSync(path.join(repo,'js/game.js'),'utf8');
function cut(a,b){const i=source.indexOf(a),j=source.indexOf(b,i);if(i<0||j<0)throw Error('Limite de extração não encontrado: '+a);return source.slice(i,j);}
const helpers=`const cl=(v,a,b)=>Math.max(a,Math.min(b,v));
const hex=c=>"#"+c.map(x=>Math.round(cl(x,0,255)).toString(16).padStart(2,"0")).join("");
const mul=(c,k)=>c.map(x=>x*k),lift=(c,k)=>c.map(x=>x+(255-x)*k);
`;
const parts=[
cut('(function(){const O=', '/* ================= cores'),
helpers,
cut('function hexToRgb','/* ================= frutas'),
cut('const SKIN=','const NAMESF='),
cut('const EYEC=','// expressão a partir'),
cut('function srand(seed)','// janelas:'),
cut('function cloudStrip','// paleta do cenário'),
cut('const PAL2=','function buildWall'),
cut('function buildAwning','function buildCounter('),
cut('function buildCounter(', '// decoração (Etapa 4)'),
cut('const DECO=','function renderProps()')
];
const suffix=`
const farmer=(s)=>({name:s&&s.farmer||'Fazendeiro',kind:'person',t0:0,blinkD:1,rw:1,skin:SKIN[1],hair:HAIR[1],shirt:SHIRT[2],sp:3,hs:0,hat:2,hat2:s&&s.hatGold?[247,195,49]:[205,155,75],eyeC:1,acc:[],acc2:SHIRT[3]});
function fieldCharacter(s){const [c,g]=cvs(40,66);g.drawImage(CH.sheet(farmer(s)).cv,0,0,40,52,0,0,40,52);px(g,10,50,'#2a1a12',20,2);px(g,11,52,'#3d5a8a',8,11);px(g,21,52,'#3d5a8a',8,11);px(g,11,52,'#5677a5',2,9);px(g,21,52,'#5677a5',2,9);px(g,10,62,'#5b3f2a',10,3);px(g,20,62,'#5b3f2a',10,3);px(g,10,65,'#2a1a12',10,1);px(g,20,65,'#2a1a12',10,1);return c.toDataURL();}
window.FrutodromoArt={character:(s,ex='ok')=>CH.frame(farmer(s),ex),fieldCharacter,customer:(ex='happy')=>CH.frame({...farmer(null),name:'Lia',hs:1,hat:0,sp:4,shirt:SHIRT[7]},ex),deco:DECO.spr,size:u=>ADIM[u],floor:buildTableTile,awning:buildAwning,cloud:cloudStrip,canvas:cvs,px,art,blank,hex,mul,lift,srand};
})();
`;
fs.writeFileSync(path.join(repo,'prototipo-fazenda/reused-art.js'),'// Arte reutilizada de js/game.js, base b475703. Molduras, personagens CH, decoração DECO e texturas originais.\n// Extração feita por prototipo-fazenda/tools/extract-art.cjs; não contém caldeirão, genética, save ou lógica de produção.\n(()=>{\n'+parts.join('\n')+suffix);
console.log('Arte original extraída: '+parts.length+' blocos; '+fs.statSync(path.join(repo,'prototipo-fazenda/reused-art.js')).size+' bytes.');
