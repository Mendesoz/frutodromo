// Linguagem visual compartilhada do mundo. Somente aparencia, sem estado economico.
//
// Rodada visual Claude (16/11/2026), pedido do Eric: acabamento no nivel de um
// RPG de bolso classico, sem copiar sprites. Principios desta versao:
// - grade de tiles de 24 px legivel: grama com tufos regulares, flores, mato alto;
// - caminho por autotile (borda, cantos externos e internos), sem faixas retas soltas;
// - arvores em tufos com luz superior esquerda e contorno verde escuro proprio;
// - construcoes com telhado dominante, beiral, porta na escala do avatar;
// - avatar de campo com 4 direcoes, derivado do retrato original em meia escala.
// Exportacoes e ancoras iguais a versao anterior: map.js so passa a direcao.
let g;
const cache=new Map(),images=new Map(),listeners=new Set();
export function onArtReady(fn){listeners.add(fn);}
function surface(w,h,paint){const c=document.createElement('canvas');c.width=w;c.height=h;const previous=g;g=c.getContext('2d');g.imageSmoothingEnabled=false;try{paint();}finally{g=previous;}return c;}
function bitmap(url){if(images.has(url))return images.get(url);const im=new Image();images.set(url,im);im.onload=()=>{cache.clear();for(const fn of listeners)fn();};im.src=url;return im;}
function original(kind,x,y,arg){const im=bitmap(window.FrutodromoArt.deco(kind,arg));if(im.complete&&im.naturalWidth)g.drawImage(im,x,y);}

const P={
 ink:'#2a1a12',shade:'rgba(18,48,28,.30)',
 g0:'#3f8f3e',g1:'#5daf47',g2:'#7cc858',g3:'#a2dc70',g4:'#c8ee90',
 tl0:'#21582f',tl1:'#2f7a36',tl2:'#4fa23e',tl3:'#7ccb52',tl4:'#b3e67a',
 p0:'#f6e8bc',p1:'#e8d29a',p2:'#d4b677',p3:'#ad8a50',
 t0:'#14301f',t1:'#22563a',t2:'#317a41',t3:'#4b9b48',t4:'#73bf58',t5:'#a7dc7a',
 bark0:'#4a2c1a',bark1:'#7c4b2a',bark2:'#a86f3d',
 wall0:'#fff8e6',wall1:'#f1e2bd',wall2:'#d8c394',wall3:'#b49c6c',
 wood0:'#f3c47e',wood1:'#d4914c',wood2:'#a86734',wood3:'#6e4222',
 red0:'#ff9a72',red1:'#ea5a40',red2:'#c03d31',red3:'#842a28',
 blu0:'#a6d0ff',blu1:'#5d96ea',blu2:'#3f6dc2',blu3:'#2a4a8c',
 brn0:'#f0a868',brn1:'#cf7a3e',brn2:'#a2552c',brn3:'#6c3420',
 gl0:'#eefaff',gl1:'#9fd8f8',gl2:'#5ca2e2',gl3:'#3a6fb0',
 st0:'#eceaf0',st1:'#c4c2d0',st2:'#9a98ad',st3:'#6a6880',
 so0:'#b47c4a',so1:'#8e5b35',so2:'#6c4227',so3:'#4a2c1a',
 lf0:'#2c6a2e',lf1:'#4a9a3a',lf2:'#7cc84e',lf3:'#b6e87a',
 cn0:'#fff3a6',cn1:'#f7cf3c',cn2:'#d29a24',
 yel0:'#ffe9a0',yel1:'#f8c53e',yel2:'#d89a26'
};
function r(x,y,w,h,c){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
function p(x,y,c){r(x,y,1,1,c);}
function ellipse(cx,cy,rx,ry,c){for(let y=-ry;y<=ry;y++){const w=Math.round(rx*Math.sqrt(Math.max(0,1-(y/(ry+.5))**2)));if(w>0)r(cx-w,cy+y,w*2,1,c);}}
function sprite(rows,pal,x,y,flip=false){rows.forEach((row,j)=>{for(let i=0;i<row.length;i++){const col=pal[row[i]];if(col)p(flip?x+row.length-1-i:x+i,y+j,col);}});}
// Preenche uma forma com contorno interno: test(x,y) define a forma; color(x,y) o miolo.
function blob(x0,y0,x1,y1,test,color,ink=P.ink){for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){if(!test(x,y))continue;p(x,y,!test(x-1,y)||!test(x+1,y)||!test(x,y-1)||!test(x,y+1)?ink:color(x,y));}}
const hash=(x,y,s=0)=>{let h=(x*374761393+y*668265263+s*982451653)|0;h=(h^(h>>>13))*1274126177|0;return (h^(h>>>16))>>>0;};

// ---------- vegetacao ----------
const CANOPY=[
 [[24,12,10],[14,21,9],[34,21,9],[11,32,9],[37,32,9],[24,33,11]],
 [[21,13,9],[31,16,8],[13,25,9],[35,27,8],[24,26,10],[16,35,8],[31,36,9]],
];
function canopy(clumps,fruit){
 const inside=(c,x,y)=>{const dx=x+.5-c[0],dy=y+.5-c[1];return dx*dx+dy*dy<=c[2]*c[2]+c[2]*.6;};
 const front=(x,y)=>{for(let i=clumps.length-1;i>=0;i--)if(inside(clumps[i],x,y))return clumps[i];return null;};
 const cols=[P.t1,P.t2,P.t3,P.t4,P.t5];
 blob(0,0,48,48,(x,y)=>!!front(x,y),(x,y)=>{
  const c=front(x,y),dx=(x+.5-c[0])/c[2],dy=(y+.5-c[1])/c[2],d=Math.hypot(dx,dy);
  if(!inside(c,x,y+1)&&front(x,y+1))return P.t1; // sombra que separa os tufos
  const L=-(.55*dx+.85*dy)-(y>36?.35:0);
  let lvl=L>.52&&d<.8?4:L>.12?3:L>-.32?2:1;if(d>.9&&dy>.2)lvl=Math.min(lvl,1);
  return cols[lvl];
 },P.t0);
 if(fruit)for(const [x,y]of[[15,18],[29,12],[34,25],[19,31],[27,38],[9,30]]){r(x,y,2,2,'#e2412f');p(x,y,'#ff9a7c');p(x+1,y+2,P.t1);}
}
function trunk(cx,top,base){for(let y=top;y<base;y++){const fl=y>=base-3?1:0;r(cx-5-fl,y,10+2*fl,1,P.ink);r(cx-4-fl,y,8+2*fl,1,P.bark1);r(cx-3-fl,y,2,1,P.bark2);r(cx+2+fl,y,2,1,P.bark0);}r(cx-5,base,10,1,P.ink);}
function pine(){
 const tiers=[[3,13,6],[11,23,10],[20,33,14],[29,44,17]];
 const inside=(x,y)=>tiers.some(([t,b,hw])=>y>=t&&y<b&&Math.abs(x+.5-24)<=1+(y-t)/(b-t)*hw);
 const tier=(x,y)=>{let k=-1;tiers.forEach(([t,b],i)=>{if(y>=t&&y<b&&inside(x,y))k=i;});return tiers[k];};
 blob(0,0,48,48,inside,(x,y)=>{const [t,b,hw]=tier(x,y),f=(y-t)/(b-t),side=(x+.5-24)/(1+f*hw);
  if(y>=b-2)return P.t1;if(side<-.35&&f>.25)return '#5fa95a';if(side<.15)return '#3f8c4c';if(side<.6)return '#2f7445';return '#245e3c';},P.t0);
}
export function treeCanvas(variant=0){
 const key='tree'+variant;if(cache.has(key))return cache.get(key);
 // 48x58; base do tronco em (24,56).
 const c=surface(48,58,()=>{
  ellipse(24,55,15,3,P.shade);
  if(variant===2){trunk(24,42,56);pine();}
  else{trunk(24,38,56);canopy(CANOPY[variant%2],variant===3);}
 });cache.set(key,c);return c;
}
function bush(x,y){blob(x,y,x+22,y+16,(i,j)=>{const dx=(i-x-10.5)/10.5,dy=(j-y-9)/8.5;return dx*dx+dy*dy<=1&&j>=y;},(i,j)=>{const L=-(i-x-11)/11-(j-y-8)/7;return L>.6?P.t4:L>-.2?P.t3:P.t2;},P.t0);}
function rock(x,y){blob(x,y,x+16,y+11,(i,j)=>{const dx=(i-x-7.5)/7.5,dy=(j-y-5.5)/5.5;return dx*dx+dy*dy<=1.05;},(i,j)=>{const L=-(i-x-8)/8-(j-y-5)/5;return L>.7?P.st0:L>-.1?P.st1:P.st2;});}

// ---------- tiles do chao ----------
const T=24;
function tuft(x,y,c=P.g1){p(x,y,c);p(x+1,y+1,c);p(x+2,y,c);}
const TUFTS=[[[4,4],[15,9],[7,17],[18,19]],[[3,10],[12,3],[19,14],[10,19]],[[6,6],[16,16]],[[5,13],[14,5],[19,19]]];
function grassTile(v){const key='gt'+v;if(cache.has(key))return cache.get(key);const c=surface(T,T,()=>{r(0,0,T,T,P.g2);for(const [x,y]of TUFTS[v])tuft(x,y);if(v===3){for(const [x,y]of[[9,9],[10,8],[2,2],[20,7]])p(x,y,P.g3);}});cache.set(key,c);return c;}
const FLOWER={a:'#f05a44',b:'#fff6ee',c:'#ffd84c'},FLOWERC={a:'#ffe27a',b:'#f6c040',c:'#f08a2a'};
function flower(x,y,k){const a=FLOWER[k],c=FLOWERC[k];p(x+1,y,a);p(x,y+1,a);p(x+2,y+1,a);p(x+1,y+2,a);p(x+1,y+1,c);p(x,y+2,P.g0);p(x+2,y+2,P.g0);p(x+1,y+3,P.g0);}
function flowerTile(k){const key='ft'+k;if(cache.has(key))return cache.get(key);const c=surface(T,T,()=>{g.drawImage(grassTile(2),0,0);flower(4,5,k);flower(15,3,k==='a'?'b':k);flower(9,15,k);flower(18,15,k==='b'?'c':k);});cache.set(key,c);return c;}
const TALL=["..o....o","..oo..oh",".ohlo.ol",".ohllohl","ohlllllo","olmmmmlo","ommmmmmo",".oooooo."];
function tallTile(){if(cache.has('tall'))return cache.get('tall');const pal={o:P.tl0,h:P.tl4,l:P.tl3,m:P.tl2};const c=surface(T,T,()=>{r(0,0,T,T,P.tl1);for(const [x,y]of[[0,1],[8,0],[16,1],[4,9],[12,8],[20,9],[-4,8],[0,16],[8,15],[16,16]])sprite(TALL,pal,x,y);});cache.set('tall',c);return c;}
// Autotile do caminho: mask de vizinhos (N,E,S,W e diagonais) que tambem sao caminho.
const SCALLOP=[3,3,2,2,2,3,3,2,2,3,4,3,2,2,2,3,3,3,2,2,3,3,2,2];
function pathTile(m){
 const key='pt'+m;if(cache.has(key))return cache.get(key);
 const N=m&1,E=m&2,S=m&4,W=m&8,NE=m&16,SE=m&32,SW=m&64,NW=m&128;
 const c=surface(T,T,()=>{for(let y=0;y<T;y++)for(let x=0;x<T;x++){
  let d=99;
  if(!N)d=Math.min(d,y-SCALLOP[x]);if(!S)d=Math.min(d,T-1-y-SCALLOP[(x+7)%T]);
  if(!W)d=Math.min(d,x-SCALLOP[(y+3)%T]);if(!E)d=Math.min(d,T-1-x-SCALLOP[(y+11)%T]);
  const R=8,corner=(ax,ay)=>(R-2.5)-Math.hypot(ax-R+.5,ay-R+.5);
  if(!N&&!W&&x<R&&y<R)d=Math.min(d,corner(x,y));if(!N&&!E&&x>=T-R&&y<R)d=Math.min(d,corner(T-1-x,y));
  if(!S&&!W&&x<R&&y>=T-R)d=Math.min(d,corner(x,T-1-y));if(!S&&!E&&x>=T-R&&y>=T-R)d=Math.min(d,corner(T-1-x,T-1-y));
  const notch=(ax,ay)=>Math.hypot(ax+.5,ay+.5)-3.2;
  if(N&&W&&!NW)d=Math.min(d,notch(x,y));if(N&&E&&!NE)d=Math.min(d,notch(T-1-x,y));
  if(S&&W&&!SW)d=Math.min(d,notch(x,T-1-y));if(S&&E&&!SE)d=Math.min(d,notch(T-1-x,T-1-y));
  p(x,y,d<0?P.g2:d<1?P.p3:d<2?P.p2:P.p1);
 }
 for(const [x,y]of[[4,5],[15,8],[9,16],[19,19],[6,20],[13,12]]){p(x,y,P.p0);p(x+1,y+1,P.p2);}
 });cache.set(key,c);return c;
}
// Caminhos do terreno inicial em tiles: corredor central, faixa livre y=5 e acessos.
const START_PATH=(()=>{const s=new Set();for(let y=0;y<12;y++)s.add('5,'+y);for(let x=0;x<12;x++)s.add(x+',5');for(let x=1;x<5;x++)s.add(x+',9');for(let x=6;x<11;x++)s.add(x+',10');return s;})();
const START_FLOWERS={'0,9':'a','0,10':'b','1,10':'a','4,4':'c','6,4':'b','11,4':'a','0,4':'b','8,4':'a'};
const START_TALL=new Set(['8,11','9,11','10,11','11,11','11,10','0,0','0,1']);

export function paintTerrain(canvas,snapshot){
 const previous=g;g=canvas.getContext('2d');g.imageSmoothingEnabled=false;
 const owned=new Set(snapshot.land.map(p=>p.x+','+p.y)),S=288,O=576;
 r(0,0,1440,1440,P.t1);
 for(let py=-2;py<=2;py++)for(let px=-2;px<=2;px++){
  const x0=O+px*S,y0=O+py*S;
  if(!owned.has(px+','+py))continue;
  const start=px===0&&py===0,isPath=(tx,ty)=>start&&START_PATH.has(tx+','+ty);
  for(let ty=0;ty<12;ty++)for(let tx=0;tx<12;tx++){
   const key=tx+','+ty,h=hash(tx+px*12,ty+py*12,7),X=x0+tx*T,Y=y0+ty*T;
   if(isPath(tx,ty)){const q=(dx,dy)=>{const a=tx+dx,b=ty+dy;return a<0||a>11||b<0||b>11?isPath(Math.min(11,Math.max(0,a)),Math.min(11,Math.max(0,b))):isPath(a,b);};
    const m=(q(0,-1)?1:0)|(q(1,0)?2:0)|(q(0,1)?4:0)|(q(-1,0)?8:0)|(q(1,-1)?16:0)|(q(1,1)?32:0)|(q(-1,1)?64:0)|(q(-1,-1)?128:0);
    g.drawImage(pathTile(m),X,Y);continue;}
   let tile;
   if(start&&START_TALL.has(key))tile=tallTile();
   else if(start&&START_FLOWERS[key])tile=flowerTile(START_FLOWERS[key]);
   else if(!start&&h%100<5)tile=flowerTile('abc'[h%3]);
   else if(!start&&(hash(Math.floor(tx/3)+px*5,Math.floor(ty/3)+py*5,3)%9===0)&&tx%3!==2)tile=tallTile();
   else tile=grassTile(h%10<5?0:h%10<8?1:h%10<9?2:3);
   g.drawImage(tile,X,Y);
  }
  if(!start)for(let i=0;i<3;i++){const h=hash(px,py,20+i),tx=1+h%10,ty=1+(h>>>8)%10;if(i===0)bush(x0+tx*T+1,y0+ty*T+6);else rock(x0+tx*T+4,y0+ty*T+9);}
 }
 // Mata densa nos terrenos ainda nao comprados; copas ficam dentro do proprio terreno.
 for(let py=-2;py<=2;py++)for(let px=-2;px<=2;px++){
  if(owned.has(px+','+py))continue;const x0=O+px*S,y0=O+py*S;r(x0,y0,S,S,P.g0);
  for(let row=0,by=y0+46;by<=y0+S-2;row++,by+=20)for(let bx=x0+24+(row%2)*14;bx<=x0+S-24;bx+=28){
   const h=hash(bx,by,5),v=h%20<3?2:h%2;g.drawImage(treeCanvas(v),bx-24+(h>>>5)%3-1,by-56);
  }
 }
 // Arvores frutiferas do lote inicial; troncos coincidem com as colisoes de map.js.
 if(owned.has('0,0'))for(const [x,y,v]of[[19,51,3],[274,50,1],[19,285,0],[279,291,3]])g.drawImage(treeCanvas(v),O+x-24,O+y-56);
 g=previous;
}

// ---------- construcoes ----------
function windowBox(x,y,w=14,h=12){r(x-1,y-1,w+2,h+2,P.ink);r(x,y,w,h,P.wall0);r(x+1,y+1,w-2,h-2,P.gl2);r(x+1,y+1,w-3,h-4,P.gl1);p(x+2,y+2,P.gl0);p(x+3,y+2,P.gl0);p(x+2,y+3,P.gl0);r(x+Math.floor(w/2)-1,y+1,1,h-2,P.wall0);r(x+1,y+Math.floor(h/2)-1,w-2,1,P.wall0);}
function flowerBox(x,y,w){r(x,y,w,5,P.ink);r(x+1,y+1,w-2,3,P.wood1);r(x+1,y+3,w-2,1,P.wood2);for(let i=2;i<w-2;i+=4){p(x+i,y-2,i%8===2?'#f05a44':'#ffd84c');p(x+i-1,y-1,P.lf1);p(x+i+1,y-1,P.lf1);p(x+i,y,P.lf2);}}
function door(x,y,w,h,c0=P.wood1,c1=P.wood2){r(x-1,y-1,w+2,h+1,P.ink);r(x,y,w,h,P.wood3);r(x+2,y+2,w-4,h-2,c0);for(let i=x+2+4;i<x+w-2;i+=4)r(i,y+2,1,h-2,c1);r(x+2,y+2,w-4,1,P.wood0);p(x+w-5,y+Math.floor(h/2),'#ffe27a');p(x+w-5,y+Math.floor(h/2)+1,P.yel2);r(x-2,y+h,w+4,2,P.ink);r(x-1,y+h,w+2,1,P.st1);}
function roof(x,y,w,h,c,{ridge=true,inset=6}={}){
 const [c0,c1,c2,c3]=c;
 for(let j=0;j<h;j++){const k=Math.round(inset*(1-j/(h-1))),xa=x+k,wa=w-2*k;
  r(xa,y+j,wa,1,P.ink);if(j===0||j>=h-1)continue;
  const band=(j-3)%6,col=j<3&&ridge?c0:j>=h-3?c3:band===5?c2:c1;r(xa+1,y+j,wa-2,1,col);
  if(j>=3&&j<h-3&&band<4)for(let i=xa+3+((Math.floor((j-3)/6)%2)*4);i<xa+wa-2;i+=8)if(band<2)p(i,y+j,c2);
  if(j>=3&&j<h-3){p(xa+1,y+j,c0);p(xa+wa-2,y+j,c2);}
 }
}
const RED=[P.red0,P.red1,P.red2,P.red3],BLUE=[P.blu0,P.blu1,P.blu2,P.blu3],BROWN=[P.brn0,P.brn1,P.brn2,P.brn3];
function planks(x,y,w,h,base,line,light){r(x,y,w,h,base);for(let j=y+4;j<y+h;j+=5){r(x,j,w,1,line);r(x,j+1,w,1,light);}}
function cottage(){ // 64x84, pegada 2x3
 ellipse(32,81,28,3,P.shade);
 r(7,44,50,38,P.ink);planks(8,44,48,36,P.wall1,P.wall2,P.wall0);r(8,44,48,4,P.wall3);r(8,48,48,1,P.wall2);
 r(8,44,3,36,P.wood1);r(9,44,1,36,P.wood0);r(53,44,3,36,P.wood2);
 r(7,77,50,5,P.ink);r(8,78,48,3,P.st1);for(let i=10;i<56;i+=7)p(i,79,P.st2);r(8,78,48,1,P.st0);
 windowBox(14,53,15,13);flowerBox(12,67,19);
 door(35,53,15,25);
 roof(2,6,60,42,RED);
 r(45,4,8,14,P.ink);r(46,5,6,12,P.brn2);r(46,5,2,12,P.brn1);r(44,2,10,3,P.ink);r(45,3,8,1,P.st1);
 original('plant',-1,66);
}
function chicken(x,y,flip=false){sprite(["..rr........",".orro.......","owwwwo......","ykwwwo...oo.","owwwwwoooWo.",".owwwwwwwWWo",".owwwwwwwWWo","..oWwwwwWWo.","...ooooooo..","....y..y....","...yy.yy...."],{o:P.ink,k:P.ink,r:'#e8483a',w:'#fffaf0',W:'#d9ccb4',y:'#f0a030'},x,y,flip);}
function henhouse(){ // 80x88, pegada 3x3
 ellipse(40,86,36,3,P.shade);
 ellipse(40,74,32,7,'#d9c27a');ellipse(40,74,28,5,'#e8d394');for(const [x,y]of[[20,72],[30,76],[52,71],[60,75],[44,78]])r(x,y,3,1,'#c7a95e');
 r(10,34,60,30,P.ink);r(11,34,58,29,P.red1);for(let i=15;i<68;i+=5)r(i,34,1,29,P.red2);r(11,34,58,4,P.red3);r(11,38,58,1,P.red2);
 r(11,34,3,29,P.wall0);r(66,34,3,29,P.wall1);r(11,60,58,3,P.wall1);
 r(34,45,13,14,P.ink);r(35,46,11,13,'#3b2a24');r(35,46,11,2,'#22170f');r(31,59,19,3,P.ink);r(32,59,17,2,P.wood1);for(let i=34;i<49;i+=3)p(i,60,P.wood2);
 r(18,43,10,10,P.ink);r(19,44,8,8,P.gl1);p(20,45,P.gl0);r(22,44,1,8,P.wall0);r(19,47,8,1,P.wall0);
 r(53,43,10,10,P.ink);r(54,44,8,8,P.gl1);p(55,45,P.gl0);r(57,44,1,8,P.wall0);r(54,47,8,1,P.wall0);
 roof(4,8,72,30,BLUE);r(36,2,8,9,P.ink);r(37,3,6,7,P.wall1);p(39,5,P.ink);p(40,5,P.ink);r(38,6,4,2,P.gl2);
 chicken(16,63);chicken(52,65,true);chicken(36,68);
 for(let i=4;i<=76;i+=8){r(i,75,4,12,P.ink);r(i+1,76,2,10,P.wall0);p(i+2,77,P.wall2);}
 r(4,78,76,3,P.ink);r(5,79,74,1,P.wall0);r(4,83,76,3,P.ink);r(5,84,74,1,P.wall1);
 for(let i=4;i<=76;i+=8){r(i+1,79,2,1,P.wall0);r(i+1,84,2,1,P.wall0);}
}
function sails(cx,cy){
 const blade=(x,y,w,h,horizontal)=>{r(x,y,w,h,P.ink);r(x+1,y+1,w-2,h-2,P.wall0);
  if(horizontal){r(x+1,y+Math.floor(h/2),w-2,1,P.wood2);for(let i=x+3;i<x+w-1;i+=4)r(i,y+1,1,h-2,P.wall2);}
  else{r(x+Math.floor(w/2),y+1,1,h-2,P.wood2);for(let j=y+3;j<y+h-1;j+=4)r(x+1,j,w-2,1,P.wall2);}};
 blade(cx-4,cy-28,9,25,false);blade(cx-4,cy+4,9,25,false);blade(cx-29,cy-4,25,9,true);blade(cx+5,cy-4,25,9,true);
 r(cx-3,cy-3,7,7,P.ink);r(cx-2,cy-2,5,5,P.wood1);p(cx-1,cy-1,P.wood0);p(cx,cy,P.wood3);
}
function mill(){ // 80x120, pegada 3x3
 ellipse(40,117,36,3,P.shade);
 // torre de pedra
 r(25,30,30,58,P.ink);for(let j=31;j<88;j++){const row=Math.floor((j-31)/5),edge=(j-31)%5===4;r(26,j,28,1,edge?P.st2:P.st1);if(!edge)for(let i=26+(row%2?4:0);i<54;i+=8)p(i,j,P.st2);p(26,j,P.st0);p(27,j,P.st0);p(52,j,P.st2);p(53,j,P.st3);}
 r(36,40,8,10,P.ink);r(37,41,6,8,'#3b2a24');r(37,41,6,2,P.gl3);
 roof(21,14,38,20,BROWN,{inset:12});
 // galpao
 r(7,84,66,33,P.ink);planks(8,84,64,31,P.wood1,P.wood2,P.wood0);r(8,84,64,3,P.wood3);
 windowBox(14,94,12,11);windowBox(55,94,12,11);door(32,92,17,23,P.brn1,P.brn2);
 r(7,113,66,4,P.ink);r(8,114,64,2,P.st1);
 roof(3,64,74,24,BROWN,{inset:5});
 sails(40,32);
 original('sack',58,98);
}
function market(){ // 60x80, pegada 2x3
 ellipse(30,77,27,3,P.shade);
 for(const x of[7,49]){r(x,12,5,64,P.ink);r(x+1,13,3,62,P.wood1);p(x+1,13,P.wood0);r(x+3,13,1,62,P.wood2);}
 r(4,50,52,26,P.ink);planks(5,50,50,24,P.wood1,P.wood2,P.wood0);r(5,73,50,2,P.wood3);
 r(18,56,24,10,P.ink);r(19,57,22,8,P.wall0);r(21,59,18,1,P.wood2);r(21,62,12,1,P.wood2);
 original('crate',7,24,'morango');original('scale',35,30);
 r(3,46,54,6,P.ink);r(4,47,52,3,P.wood0);r(4,50,52,1,P.wood2);
 r(2,2,56,4,P.ink);
 for(let i=0;i<7;i++){const x=3+i*8,c=i%2?P.wall0:P.yel1,s=i%2?P.wall2:P.yel2;r(x,5,8,16,c);r(x,5,8,2,i%2?P.wall1:P.yel0);r(x,18,8,3,s);ellipse(x+4,22,4,2,c);p(x+4,25,P.ink);}
 r(2,5,1,18,P.ink);r(57,5,1,18,P.ink);for(let i=0;i<7;i++){const x=3+i*8;r(x,25,8,1,P.ink);p(x,24,P.ink);p(x+7,24,P.ink);}
 original('basket',-2,58,'laranja');
}
const CROP={
 1:{rows:["l...l","ll.ll",".lml.","..m.."],w:5},
 2:{rows:["...h.....","..lh.....","..lm..l..","l.lm.ll..",".llmll...","..lmm....","...ml.l..","..lmlll..",".l.m.....","...m....."],w:9},
 3:{rows:["....t.t....","....ttt....","....hm.....","...lhm.....","..llmm.ll..","..l.mm.l...","...cmm.....","..ccmmll...","..ccmml.l..","..cc.m..l..","..l.mmlll..",".ll.mm.....","l...mml....","....mm.ll..",".....m...l.","....mm.....","....m......"],w:11}
};
function bed(w,h,stage){ // solo arado com cantos arredondados; plantas por tile
 const top=16,inside=(x,y)=>{if(y<top||y>=top+h||x<0||x>=w)return false;const cx=Math.min(x,w-1-x),cy=Math.min(y-top,top+h-1-y);return !(cx+cy<3);};
 ellipse(w/2,top+h-1,w/2-2,3,P.shade);
 blob(0,top,w,top+h,inside,(x,y)=>{const k=(y-top-3)%8;return k<2?P.so0:k<5?P.so1:k<6?P.so2:P.so1;},P.so3);
 for(let y=top+5;y<top+h-3;y+=8)for(let x=3;x<w-3;x+=6)p(x+((y>>3)%2)*3,y,P.so3);
 if(!stage)return;const cr=CROP[stage],pal={l:P.lf2,m:P.lf1,h:P.lf3,t:P.cn1,c:P.cn1};
 for(let ty=0;ty<h/24;ty++)for(let tx=0;tx<w/24;tx++){const bx=tx*24+12-Math.floor(cr.w/2),by=top+ty*24+16-cr.rows.length;
  ellipse(tx*24+12,top+ty*24+16,4,1,'rgba(40,20,10,.35)');sprite(cr.rows,pal,bx,by);
  if(stage===3)for(const [x,y]of[[2,7],[2,8],[3,7]])p(bx+x,by+y,P.cn0);}
}
export function buildingCanvas(kind,footW,footH,stage=0){
 const key=[kind,footW,footH,stage].join(':');if(cache.has(key))return cache.get(key);
 const size=kind==='plot'?[footW,footH+16]:kind==='feed_mill'?[80,120]:kind==='coop'?[80,88]:kind==='house'?[64,84]:[60,80];
 const canvas=surface(...size,()=>{if(kind==='plot')bed(footW,footH,stage);else if(kind==='feed_mill')mill();else if(kind==='coop')henhouse();else if(kind==='house')cottage();else market();});
 const result={canvas,w:size[0],h:size[1]};cache.set(key,result);return result;
}

// ---------- avatar de campo ----------
// Retrato 40x52 do Frutodromo reduzido a 20x26 por blocos 2x2 (cor dominante; contorno
// vence empate). Costas e perfil sao derivados do mesmo retrato; pernas por especie.
const lum=(c)=>c[0]*.3+c[1]*.59+c[2]*.11;
function halfPortrait(source){
 const c=document.createElement('canvas');c.width=40;c.height=52;const x=c.getContext('2d');x.drawImage(source,0,0,40,52,0,0,40,52);
 const d=x.getImageData(0,0,40,52).data,out=[];
 for(let y=0;y<26;y++){const row=[];for(let i=0;i<20;i++){const px=[];for(const [a,b]of[[0,0],[1,0],[0,1],[1,1]]){const k=((2*y+b)*40+2*i+a)*4;if(d[k+3]>127)px.push([d[k],d[k+1],d[k+2]]);}
  if(px.length<2){row.push(null);continue;}const counts=new Map();for(const q of px){const s=q.join();counts.set(s,(counts.get(s)||0)+1);}
  let best=null,n=0;for(const [s,k]of counts)if(k>n){n=k;best=s;}let col=best.split(',').map(Number);
  if(n<3){const dark=px.filter(q=>lum(q)<60);if(dark.length)col=dark.sort((a,b)=>lum(a)-lum(b))[0];}row.push(col);}
  out.push(row);}
 return out;
}
const same=(a,b)=>a&&b&&a[0]===b[0]&&a[1]===b[1]&&a[2]===b[2];
function dominant(grid,y0,y1,skipDark=true){const counts=new Map();for(let y=y0;y<y1;y++)for(const c of grid[y])if(c&&(!skipDark||lum(c)>=60)){const s=c.join();counts.set(s,(counts.get(s)||0)+1);}let best=null,n=0;for(const [s,k]of counts)if(k>n){n=k;best=s;}return best?best.split(',').map(Number):[120,120,120];}
function views(grid){
 const H=15,boundary=(x,y)=>!grid[y]?.[x-1]||!grid[y]?.[x+1]||!grid[y-1]?.[x]||!grid[y+1]?.[x];
 // Cabelo/pelo = cores do miolo das 4 primeiras linhas (inclusive cabelo escuro).
 const top=new Map();for(let y=0;y<4;y++)grid[y].forEach((c,x)=>{if(c&&!boundary(x,y))top.set(c.join(),(top.get(c.join())||0)+1);});
 let main=null,best=0;for(const [k,n]of top)if(n>best){best=n;main=k.split(',').map(Number);}main=main||dominant(grid,0,5);
 const back=grid.map(row=>row.slice());
 for(let y=0;y<H;y++)for(let x=0;x<20;x++){const c=grid[y][x];if(!c||boundary(x,y))continue;if(!top.has(c.join()))back[y][x]=main;}
 const side=back.map(row=>row.slice());
 for(let y=0;y<H;y++)for(let x=0;x<20;x++){if(same(grid[y][x],back[y][x]))continue;const t=x+2;if(t<20&&back[y][t]&&!boundary(t,y)&&!top.has(String(grid[y][x])))side[y][t]=grid[y][x];}
 return {front:grid,back,side};
}
function hex(c){return 'rgb('+c.join()+')';}
const FEET={person:'#3a2a22',robot:'#6a6880',penguin:'#f0a030',ghost:null};
function heroData(spec){
 const key='heroData'+spec.sheet.length+spec.name;if(cache.has(key))return cache.get(key);
 const source=bitmap(spec.sheet);if(!source.complete||!source.naturalWidth)return null;
 const grid=halfPortrait(source),fur=dominant(grid,0,12),last=grid[25];
 let pants=null;for(const x of[9,10,8,11,7,12])if(last[x]&&lum(last[x])>=60){pants=last[x];break;}
 const data={...views(grid),pants:pants||dominant(grid,18,26),feet:spec.kind in FEET?FEET[spec.kind]:hex(fur),kind:spec.kind};
 let bottom=25;while(bottom>0&&!grid[bottom].some(Boolean))bottom--;data.bottom=bottom;
 let l=20,rr=-1;grid[bottom].forEach((c,x)=>{if(c){l=Math.min(l,x);rr=Math.max(rr,x);}});data.left=l;data.right=rr;
 cache.set(key,data);return data;
}
function legs(d,facing,phase,ox,y){
 if(d.kind==='ghost'){for(let i=d.left;i<=d.right;i++){const wave=(i+phase)%4<2?1:2;r(ox+i,y,1,wave,hex(d.front[d.bottom][i]||[240,240,250]));p(ox+i,y+wave,P.ink);}return;}
 const pants=hex(d.pants),cx=ox+10,leg=(x,len)=>{r(x-1,y,5,len+2,P.ink);r(x,y,3,len,pants);p(x,y,'rgba(255,255,255,.25)');r(x,y+len-1,3,1,d.feet||pants);};
 if(facing==='left'||facing==='right'){const s=phase===1?2:phase===2?-2:0;leg(cx-2-s,4);if(s)leg(cx-2+s,phase===1?3:4);return;}
 const up1=phase===1?1:0,up2=phase===2?1:0;leg(cx-4,4-up1);leg(cx+1,4-up2);
}
export function avatarCanvas(index,phase=0,facing='down'){
 const spec=window.FZ_SPR.chars[index]??window.FZ_SPR.chars[0],key='hero'+index+':'+phase+':'+facing;
 if(cache.has(key))return cache.get(key);
 const d=heroData(spec);
 // 40x66, pes ancorados em (20,60) como antes.
 const c=surface(40,66,()=>{
  if(!d)return;
  const bob=d.kind==='ghost'?(phase===1?-4:-3):(phase?-1:0),y0=29+bob+(25-d.bottom);
  ellipse(20,60,9,2,P.shade);
  legs(d,facing,phase,10,y0+d.bottom+1);
  const view=facing==='up'?d.back:facing==='left'||facing==='right'?d.side:d.front,flip=facing==='left';
  for(let y=0;y<26;y++)for(let x=0;x<20;x++){const col=view[y][flip?19-x:x];if(col)p(10+x,y0+y,hex(col));}
 });
 if(d)cache.set(key,c);return c;
}

export function paintWelcome(canvas){
 const previous=g;g=canvas.getContext('2d');g.imageSmoothingEnabled=false;
 for(let y=0;y<11;y++)for(let x=0;x<15;x++){const h=hash(x,y,11);g.drawImage(grassTile(h%10<5?0:h%10<8?1:3),x*T,y*T);}
 const path=new Set();for(let y=0;y<11;y++)path.add('7,'+y);for(let x=0;x<15;x++)path.add(x+',7');
 for(const key of path){const [x,y]=key.split(',').map(Number),q=(dx,dy)=>{const a=x+dx,b=y+dy;return a<0||a>14||b<0||b>10?path.has(Math.min(14,Math.max(0,a))+','+Math.min(10,Math.max(0,b))):path.has(a+','+b);};
  const m=(q(0,-1)?1:0)|(q(1,0)?2:0)|(q(0,1)?4:0)|(q(-1,0)?8:0)|(q(1,-1)?16:0)|(q(1,1)?32:0)|(q(-1,1)?64:0)|(q(-1,-1)?128:0);g.drawImage(pathTile(m),x*T,y*T);}
 for(const [x,y,k]of[[1,6,'a'],[2,6,'b'],[12,6,'a'],[13,6,'c'],[9,10,'b']])g.drawImage(flowerTile(k),x*T,y*T);
 for(const [x,y]of[[0,9],[0,10],[1,10],[13,10],[14,10],[14,9]])g.drawImage(tallTile(),x*T,y*T);
 g.drawImage(treeCanvas(1),-14,-20);g.drawImage(treeCanvas(2),318,-14);g.drawImage(treeCanvas(0),330,30);g.drawImage(treeCanvas(3),-20,40);
 for(const [kind,x,y,fw,fh]of [['feed_mill',36,40,72,72],['coop',220,62,72,72],['house',64,168,48,72],['plot',216,196,48,48],['plot',270,196,48,48]]){const art=buildingCanvas(kind,fw,fh,kind==='plot'?3:0);g.drawImage(art.canvas,x+Math.round((fw-art.w)/2),y+fh-art.h);}
 g.drawImage(avatarCanvas(1),160,126);g=previous;
}
