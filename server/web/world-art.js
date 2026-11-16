// Linguagem visual compartilhada do mundo. Somente aparencia, sem estado economico.
let g;
const cache=new Map(),images=new Map(),listeners=new Set();
export function onArtReady(fn){listeners.add(fn);}
function surface(w,h,paint){const c=document.createElement('canvas');c.width=w;c.height=h;const previous=g;g=c.getContext('2d');g.imageSmoothingEnabled=false;try{paint();}finally{g=previous;}return c;}
function bitmap(url){if(images.has(url))return images.get(url);const im=new Image();images.set(url,im);im.onload=()=>{cache.clear();for(const fn of listeners)fn();};im.src=url;return im;}
function original(kind,x,y,arg){const im=bitmap(window.FrutodromoArt.deco(kind,arg));if(im.complete&&im.naturalWidth)g.drawImage(im,x,y);}
const P={ink:'#30252b',shade:'#443a39',grass:'#81ac4b',grassL:'#a5c961',grassD:'#68943d',leaf:'#4c803b',leafD:'#355c35',leafL:'#91bb53',bark:'#795034',wood:'#ba7a40',woodL:'#edb86a',woodD:'#835431',cream:'#fae5af',red:'#cf4d40',redL:'#eb7450',redD:'#8f3836',blue:'#81c6ca',soil:'#73503b',soilD:'#503a30',soilL:'#ab7750',path:'#d9b877',pathD:'#b69057'};
function r(x,y,w,h,c){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
function steps(x,y,w,h,c){r(x+8,y,w-16,h,c);r(x+3,y+4,w-6,h-8,c);r(x,y+10,w,h-20,c);}
function shadow(x,y,w,h){steps(x,y,w,h,'#52753b');steps(x+4,y+2,w-8,h-5,'#496835');}
function bush(x,y,w=28){shadow(x-2,y+16,w+5,12);steps(x,y,w,22,P.leafD);steps(x+2,y-2,w-4,20,P.leaf);r(x+5,y,10,3,P.leafL);r(x+4,y+6,4,2,'#6b9f42');r(x+w-10,y+9,6,3,'#406d36');}
function stone(x,y){steps(x,y,17,11,P.ink);steps(x+1,y-2,14,10,'#91957b');r(x+4,y-1,7,2,'#b8b99b');r(x+10,y+5,4,2,'#727966');}
function fence(x,y,w){shadow(x-2,y+10,w+7,9);r(x,y+3,w,4,P.ink);r(x+1,y+3,w-2,2,P.woodL);r(x,y+12,w,4,P.ink);r(x+1,y+12,w-2,2,P.wood);for(let k=0;k<=w;k+=16){r(x+k,y-2,5,25,P.ink);r(x+k+1,y,3,21,P.woodL);r(x+k+3,y+3,1,18,P.woodD);r(x+k+1,y+18,2,2,'#d4934d');}}
function roof(x,y,w,h){for(let j=0;j<h;j++){const left=Math.max(0,18-j);r(x+left,y+j,w-left*2,1,P.ink);}for(let j=3;j<h-4;j++){const left=Math.max(2,20-j);r(x+left,y+j,w-left*2,1,j%8===3?P.redD:j%8===4?P.redL:P.red);}for(let j=8;j<h-5;j+=8)for(let k=23;k<w-12;k+=13)r(x+k+(j%16?0:6),y+j-3,1,4,P.redD);r(x+1,y+h-4,w-2,4,P.ink);r(x+3,y+h-4,w-6,1,'#f9bd72');r(x+8,y+h,w-16,4,P.redD);}
function windowBox(x,y,w=20,h=22){r(x-2,y-2,w+4,h+4,P.ink);r(x,y,w,h,P.woodL);r(x+2,y+2,w-4,h-4,'#437989');r(x+3,y+3,w-7,h-8,P.blue);r(x+4,y+4,2,h-11,'#c4ede4');r(x+w/2-1,y+1,2,h-2,P.cream);r(x+1,y+h/2,w-2,2,P.cream);r(x-3,y+h+1,w+6,4,P.ink);r(x-2,y+h+1,w+4,2,P.woodL);}
function chicken(x,y){shadow(x-1,y+17,21,8);r(x+3,y+4,14,14,P.ink);r(x+2,y+6,16,10,P.ink);r(x+4,y+5,11,10,'#fff4d5');r(x+5,y+12,9,4,'#dbc49c');r(x+13,y,8,12,P.ink);r(x+14,y+2,6,8,'#fff4d5');r(x+15,y-2,4,3,P.red);r(x+18,y+4,1,2,P.ink);r(x+20,y+6,3,2,'#e8aa3f');r(x+6,y+17,2,4,P.woodD);r(x+12,y+17,2,4,P.woodD);r(x,y+4,4,5,'#fff4d5');}
function bed(x,y,w,h,ripe,growing=true){shadow(x-2,y+5,w+6,h);r(x,y,w,h,P.ink);r(x+2,y+2,w-4,h-4,P.soilD);r(x+3,y+2,w-6,2,P.soilL);for(let j=8;j<h-3;j+=12){r(x+4,y+j,w-8,5,P.soil);r(x+5,y+j,w-10,1,P.soilL);if(growing)for(let k=10;k<w-7;k+=17){const xx=x+k,yy=y+j;r(xx-3,yy-4,8,9,P.leafD);r(xx-5,yy-5,5,3,'#54863b');r(xx+2,yy-6,5,3,'#3b6b35');r(xx-2,yy-5,2,8,P.leafL);if(ripe){r(xx,yy-10,5,11,P.ink);r(xx+1,yy-9,3,9,'#f1ba35');r(xx+1,yy-8,1,6,'#ffe293');r(xx+3,yy-6,1,3,'#cd8732');}else r(xx-3,yy-6,3,2,'#b1cf65');}}r(x+2,y+h-3,w-4,1,'#a97143');}
export function treeCanvas(variant=0){
 const key='tree'+variant;if(cache.has(key))return cache.get(key);
 const c=surface(70,96,()=>{
  shadow(5,78,58,15);
  for(let y=35;y<85;y++){const x=33+Math.round(Math.sin(y*.12+variant)*3);r(x-5,y,10,1,P.ink);r(x-4,y,8,1,'#795333');r(x-3,y,2,1,'#af8046');}
  const lobes=[[33,22,22,20],[19,38,18,22],[47,38,18,21],[33,49,24,19]];
  const inside=(x,y)=>{
   if(variant===3){const half=y<29?(y-4)*.62:y<49?10+(y-24)*.62:16+(y-45)*.45;return y>5&&y<72&&Math.abs(x-34)<half+(y%7===0?1:0);}
   return lobes.some(([cx,cy,rx,ry])=>((x-cx)/rx)**2+((y-cy)/ry)**2<1+.035*Math.sin(x*.65+variant));
  };
  for(let y=1;y<74;y++)for(let x=2;x<67;x++){
   if(!inside(x,y))continue;
   if(!inside(x-1,y)||!inside(x+1,y)||!inside(x,y-1)||!inside(x,y+1)){r(x,y,1,1,P.ink);continue;}
   const blob=Math.sin(x*.17+y*.08)+Math.cos(y*.19-x*.07),light=(66-y)*.034+(40-x)*.022+blob*.47;
   const colors=variant===3?['#294d3d','#36684a','#477f4a','#5c994f','#7db258','#a2c873']:['#355837','#46723a','#638c3f','#80a64c','#a0bd61','#c2d484'];
   const shade=Math.max(0,Math.min(5,Math.floor(light+1.6)));
   r(x,y,1,1,colors[shade]);
   if((x*23+y*37+variant*13)%149<2&&y<53&&shade>1)r(x,y,2,1,colors[Math.min(5,shade+1)]);
  }
 });cache.set(key,c);return c;
}
function cottage(){
 shadow(4,94,71,16);r(9,35,61,64,P.ink);r(10,36,59,61,'#dbb878');r(58,36,11,61,'#b47d48');
 for(let y=41;y<94;y+=8){r(11,y,46,1,'#b9894c');r(11,y+1,46,1,'#f4d699');}
 roof(1,8,77,35);r(55,1,9,18,P.ink);r(57,2,5,13,'#b27745');r(54,0,11,3,P.cream);
 r(35,52,25,46,P.ink);r(37,54,21,43,P.woodD);r(39,55,17,41,P.wood);r(40,56,2,38,P.woodL);r(53,76,2,2,'#ffda73');
 windowBox(17,56,13,19);r(33,98,29,4,'#c7bb91');r(31,102,33,3,P.ink);original('plant',3,83);
}
function mill(){
 shadow(4,109,93,17);r(17,41,72,71,P.ink);r(19,43,68,66,'#ddb777');
 for(let y=48;y<108;y+=8){r(20,y,64,1,'#aa7742');r(20,y+1,64,1,'#edcb8b');}
 roof(9,18,89,33);r(44,61,26,49,P.ink);r(46,63,22,45,'#826040');r(48,64,2,41,P.woodL);windowBox(24,64,13,17);
 // Torre, eixo e pas em pixels nativos; sem girar o sprite por CSS.
 r(28,11,30,45,P.ink);r(30,12,26,42,'#d5b36f');roof(19,0,48,20);
 for(let n=0;n<24;n++){r(42-n,27-n,3,2,P.ink);r(43+n,28+n,3,2,P.ink);r(42-n,28+n,2,3,P.ink);r(43+n,27-n,2,3,P.ink);}
 for(let n=0;n<22;n++){r(42-n,27-n,2,1,P.cream);r(43+n,28+n,2,1,P.cream);r(42-n,28+n,1,2,P.cream);r(43+n,27-n,1,2,P.cream);}
 r(40,25,7,7,P.ink);r(42,27,3,3,'#c29150');original('sack',2,92);original('barrel',76,88);
}
function henhouse(){
 shadow(1,93,94,16);r(5,57,87,42,'#a5b65e');r(14,27,66,49,P.ink);r(16,29,62,43,'#e5bd79');r(66,29,12,43,'#b98144');
 for(let y=34;y<69;y+=8){r(17,y,48,1,'#a87942');r(17,y+1,48,1,'#f6d391');}
 roof(7,2,81,34);windowBox(23,39,15,18);r(48,39,24,33,P.ink);r(50,41,20,29,'#453c33');r(47,72,26,4,P.woodL);r(44,76,32,4,P.woodD);
 chicken(18,77);chicken(64,72);fence(4,88,80);
}
function market(){
 shadow(1,78,78,14);r(6,34,67,46,P.ink);r(8,35,63,42,P.wood);for(let x=11;x<69;x+=8)r(x,43,2,33,P.woodD);
 r(8,12,3,42,P.ink);r(68,12,3,42,P.ink);r(3,29,73,4,P.ink);
 for(let i=0;i<6;i++){r(4+i*12,11,12,18,i%2?P.cream:P.red);r(6+i*12,29,8,5,i%2?'#d1bf95':P.redD);r(8+i*12,33,4,2,P.ink);}
 r(3,10,74,2,P.ink);original('crate',10,36,'morango');original('scale',52,34);r(4,52,71,4,P.ink);r(5,52,69,2,P.woodL);original('basket',-1,65,'laranja');
}
export function buildingCanvas(kind,footW,footH,stage=0){
 const key=[kind,footW,footH,stage].join(':');if(cache.has(key))return cache.get(key);
 const size=kind==='plot'?[footW,footH+8]:kind==='feed_mill'?[104,128]:kind==='coop'?[100,112]:kind==='house'?[80,112]:[82,96];
 const canvas=surface(...size,()=>{if(kind==='plot')bed(0,8,footW,footH-8,stage>1,stage>0);else if(kind==='feed_mill')mill();else if(kind==='coop')henhouse();else if(kind==='house')cottage();else market();});
 const result={canvas,w:size[0],h:size[1]};cache.set(key,result);return result;
}
export function avatarCanvas(index,phase=0){
 const spec=window.FZ_SPR.chars[index]??window.FZ_SPR.chars[0],key='hero'+index+':'+phase;
 if(cache.has(key))return cache.get(key);const source=bitmap(spec.sheet);
 const c=surface(40,66,()=>{
  if(!source.complete||!source.naturalWidth)return;
  shadow(6,55,29,10);
  if(spec.kind==='person'){
   g.drawImage(source,0,0,40,32,0,0,40,32);g.drawImage(source,0,32,40,17,0,30,40,17);
   r(11,46,18,12,P.ink);r(12,46,7,10,'#586d94');r(21,46,7,10,'#586d94');r(13,47,2,7,'#8094b5');r(22,47,2,7,'#8094b5');
   const step=phase===1?2:phase===2?-2:0;r(10,55+step,10,4,P.ink);r(20,55-step,10,4,P.ink);r(11,55+step,7,2,P.woodD);r(22,55-step,7,2,P.woodD);
  }else g.drawImage(source,phase?40:0,0,40,52,0,8-(phase?1:0),40,52);
 });cache.set(key,c);return c;
}
export function paintTerrain(canvas,snapshot){
 const previous=g;g=canvas.getContext('2d');g.imageSmoothingEnabled=false;
 const owned=new Set(snapshot.land.map(p=>p.x+','+p.y)),rng=window.FrutodromoArt.srand(25319),T=24,S=288,O=576;
 r(0,0,1440,1440,'#365b39');
 for(let py=-2;py<=2;py++)for(let px=-2;px<=2;px++){
  const x=O+px*S,y=O+py*S,has=owned.has(px+','+py);r(x,y,S,S,has?'#87aa50':'#547c3d');
  for(let i=0;i<(has?230:140);i++){const xx=x+Math.floor(rng()*S),yy=y+Math.floor(rng()*S);r(xx,yy,4,1,has?'#769c46':'#486d38');if(i%9===0){r(xx+1,yy-2,1,3,has?'#6a913c':'#385d34');r(xx+3,yy-1,1,2,has?'#9ab95d':'#678d45');}}
  if(!has){for(let i=0;i<18;i++){const tx=x+Math.floor(rng()*(S-65)),ty=y+Math.floor(rng()*(S-85));g.drawImage(treeCanvas(i%4),tx,ty);}for(let i=0;i<4;i++)stone(x+Math.floor(rng()*260),y+Math.floor(rng()*260));}
  else {for(let i=0;i<13;i++){const xx=x+9+Math.floor(rng()*270),yy=y+9+Math.floor(rng()*270);r(xx,yy,1,4,P.leafD);r(xx-1,yy-1,3,2,i%3?'#f4cc7b':'#ec9c9f');}}
 }
 // Caminhos do lote inicial. Expandir aumenta area; nao cria estradas ou edificios.
 r(O,O+146,S,25,P.pathD);r(O,O+148,S,20,P.path);r(O+124,O+55,24,233,P.pathD);r(O+126,O+55,20,233,P.path);
 for(let i=0;i<17;i++)r(O+i*18,O+152+(i%3)*5,7,1,'#ebd092');
 for(const [x,y,v]of [[0,4,0],[255,3,1],[0,238,2],[260,244,3]])g.drawImage(treeCanvas(v),O+x-14,O+y-38);
 g=previous;
}
export function paintWelcome(canvas){
 const previous=g;g=canvas.getContext('2d');g.imageSmoothingEnabled=false;r(0,0,360,260,'#87aa50');r(0,167,360,26,P.path);r(164,0,24,260,P.path);
 for(const [kind,x,y,fw,fh]of [['feed_mill',29,35,72,72],['coop',222,49,72,72],['house',50,146,48,72],['plot',222,201,48,48],['plot',279,201,48,48]]){
  const art=buildingCanvas(kind,fw,fh,2);g.drawImage(art.canvas,x,y);
 }
 g.drawImage(treeCanvas(1),-18,63);g.drawImage(treeCanvas(2),306,-23);g.drawImage(avatarCanvas(1),148,137);g=previous;
}
