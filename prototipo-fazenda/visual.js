/* Camada de arte: não altera S, produção, preços, RNG, temporizadores ou persistência. */
(()=>{'use strict';
const A=window.FrutodromoArt,cache=new Map(),imgs=new Map();let latest=null,layout=null,signature='';
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function person(s,w){const k=w>=70?2:1;return '<img class="original-character" src="'+(k===2?A.fieldCharacter(s):A.character(s,'ok'))+'" width="'+40*k+'" height="'+(k===2?66:52)*k+'" alt="" draggable="false">';}
function animal(kind,w,tint,label){const gold=tint&&tint!=='#fff',key=kind+gold;let u=cache.get(key);if(!u){const g=A.blank(kind==='galinha'?26:36,kind==='galinha'?24:28),H=g.length,W=g[0].length;
const r=(x,y,w,h,c)=>{for(let j=0;j<h;j++)for(let i=0;i<w;i++)if(g[y+j]&&x+i>=0&&x+i<W)g[y+j][x+i]=c};
if(kind==='galinha'){const hi=gold?'#ffe39a':'#fff7dd',mid=gold?'#e9b447':'#eadfc5',sh=gold?'#ae762d':'#b8a992';
r(6,10,14,9,mid);r(8,8,9,4,hi);r(5,12,3,6,sh);r(8,10,10,7,hi);r(9,15,9,4,mid);r(8,18,11,2,sh);r(17,4,6,10,hi);r(18,3,4,2,'#ce5a48');r(20,1,2,3,'#e06b50');r(21,6,1,2,'#372c25');r(23,8,2,2,'#e3a74a');r(20,11,2,3,'#c75a4b');r(9,11,6,4,mid);r(9,15,4,2,sh);r(8,20,2,3,'#b07a35');r(16,20,2,3,'#b07a35');r(6,22,4,1,'#d3a34b');r(15,22,4,1,'#d3a34b');r(3,8,3,6,hi);r(1,7,3,5,mid);}
else{const hi=gold?'#f0cf85':'#fff3d8',mid=gold?'#cca15d':'#e4d5b5',sh=gold?'#9c733e':'#b9a58b';r(5,9,23,13,mid);r(6,8,19,9,hi);r(7,20,20,3,sh);r(26,6,8,13,hi);r(27,16,8,5,'#dba898');r(28,17,5,2,'#e8bca6');r(29,10,2,2,'#392c25');r(27,4,2,3,'#c7b48b');r(33,4,2,3,'#c7b48b');r(8,9,6,5,gold?'#946844':'#685c4d');r(18,13,6,6,gold?'#a87346':'#746655');r(7,22,3,5,sh);r(24,22,3,5,sh);r(7,26,4,1,'#57493a');r(24,26,4,1,'#57493a');r(2,11,2,11,sh);r(1,20,3,3,'#65503d');}
const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');for(let y=0;y<H;y++)for(let x0=0;x0<W;x0++){let col=g[y][x0];if(!col){let n=g[y][x0-1]||g[y][x0+1]||(g[y-1]||[])[x0]||(g[y+1]||[])[x0];if(n)col='#50402f';}if(col){x.fillStyle=col;x.fillRect(x0,y,1,1);}}u=c.toDataURL();cache.set(key,u);}
if(w===0)return u;const k=kind==='galinha'?(w>=32?2:1):(w>=60?2:1),W=kind==='galinha'?26:36,H=kind==='galinha'?24:28;return '<img class="farm-animal" src="'+u+'" width="'+W*k+'" height="'+H*k+'" alt="'+esc(label||kind)+'" draggable="false">';}
function image(u){let i=imgs.get(u);if(!i){i=new Image();imgs.set(u,i);i.onload=()=>{signature='';if(latest)paint(latest)};i.src=u;}return i;}
function paint(s){latest=s;const scene=document.getElementById('scene');if(!scene)return layout;const W=Math.ceil(scene.clientWidth/2),H=Math.ceil(scene.clientHeight/2),sig=[W,H,s.model,s.coopCap,s.pastCap].join('|');if(sig===signature)return layout;signature=sig;
let c=document.getElementById('farmLandscape');if(!c){c=document.createElement('canvas');c.id='farmLandscape';c.setAttribute('aria-label','Cenário da fazenda com celeiro, quitanda, árvores, canteiros e decoração original do Frutódromo');c.setAttribute('role','img');scene.prepend(c);}c.width=W;c.height=H;c.style.width=W*2+'px';c.style.height=H*2+'px';const x=c.getContext('2d');x.imageSmoothingEnabled=false;
const r=(a,b,w,h,col)=>{x.fillStyle=col;x.fillRect(Math.round(a),Math.round(b),Math.round(w),Math.round(h))},rng=A.srand(20261115),compact=W<260;
const ground=compact?82:79;
r(0,0,W,H,'#c7e3d5');r(0,0,W,30,'#b9d7d0');r(W-45,15,10,10,'#f8e8a7');r(W-47,17,14,6,'#f8e8a7');
const clouds=image(A.cloud(W,30,false,9));if(clouds.complete&&clouds.naturalWidth)x.drawImage(clouds,0,12);
for(let a=-10;a<W+10;a+=13){const h=15+Math.floor(rng()*18);r(a,ground-h,17,h,'#87aa82');r(a+3,ground-h+5,12,h-5,'#70946d');}r(0,ground,W,H-ground,'#94ad6e');r(0,ground,W,4,'#a8be7c');
for(let i=0;i<W*H/90;i++){const a=Math.floor(rng()*W),b=ground+Math.floor(rng()*(H-ground));r(a,b,2,1,i%4?'#88a064':'#b1c383');if(i%7===0)r(a,b-1,1,2,'#74945b');}
let coop,past,plots,worker;
if(compact){coop={x:9,y:146,w:Math.floor(W*.42)-8,h:49};past={x:Math.floor(W*.53),y:131,w:Math.floor(W*.43),h:46};plots={x:Math.floor(W*.53),y:187,w:Math.floor(W*.43),h:49};worker={x:Math.floor(W*.36),y:96};}
else{coop={x:12,y:H-76,w:Math.floor(W*.31)-10,h:60};past={x:Math.floor(W*.36),y:H-76,w:Math.floor(W*.26),h:60};plots={x:Math.floor(W*.70),y:H-76,w:Math.floor(W*.27),h:60};worker={x:Math.floor(W*.51),y:H-116};}
layout={W,H,coop,past,plots,worker};
// Caminho de pedra em degraus. Os pixels permanecem em escala inteira.
const pathY=compact?124:H-100;r(0,pathY,W,16,'#c8b88f');r(0,pathY+2,W,12,'#d6c79f');for(let a=0;a<W;a+=15){r(a+2,pathY+4,8,3,'#b9ac88');r(a+7,pathY+10,7,2,'#e7d7ae');}r(Math.floor(W*.45),ground,15,H-ground,'#c8b88f');r(Math.floor(W*.45)+2,ground,11,H-ground,'#dbcca4');
function roof(a,b,w,h){r(a,b+8,w,h-8,'#8b4c35');for(let y=0;y<14;y+=3){const z=14-y;r(a+z/2,b+y,w-z,3,y%2?'#b9764d':'#c88c59');for(let k=0;k<w-z;k+=9)r(a+z/2+k,b+y,1,3,'#9b5e3d');}r(a,b+13,w,2,'#663e2a');r(a+2,b+14,w-4,1,'#e0ae74');}
function shed(a,b,w,h){r(a+3,b+15,w-6,h-15,'#bd8b54');for(let j=16;j<h;j+=7){r(a+3,b+j,w-6,1,'#e1b67b');r(a+3,b+j+6,w-6,1,'#976b40');}r(a+3,b+16,3,h-16,'#dfb67d');r(a+w-6,b+16,3,h-16,'#8a5c35');roof(a,b,w,17);r(a+Math.floor(w*.38),b+h-22,17,22,'#6c4b31');r(a+Math.floor(w*.38)+2,b+h-20,13,20,'#936b42');r(a+Math.floor(w*.38)+7,b+h-20,1,20,'#6d4c30');r(a+Math.floor(w*.38),b+h-9,17,2,'#d9bc86');r(a+9,b+24,9,10,'#694b33');r(a+10,b+25,7,7,'#b6d9c4');r(a+13,b+25,1,7,'#e1be88');r(a+10,b+28,7,1,'#e1be88');}
const barnX=compact?10:16,barnW=compact?62:Math.min(84,Math.round(W*.28));shed(barnX,compact?61:58,barnW,60);
// Quitanda reaproveita o toldo listrado e as caixas do cenário original.
const marketW=compact?60:76,marketX=W-marketW-13,marketY=compact?59:56;
r(marketX+5,marketY+23,marketW-10,42,'#d9ac72');for(let a=marketX+7;a<marketX+marketW-5;a+=7)r(a,marketY+24,1,39,'#bd8f5e');r(marketX+3,marketY+42,marketW-6,19,'#a57143');r(marketX+2,marketY+42,marketW-4,3,'#ecc38a');r(marketX+4,marketY+57,marketW-8,4,'#805332');
const aw=image(A.awning(marketW));if(aw.complete&&aw.naturalWidth)x.drawImage(aw,marketX,marketY+21);
function draw(u,a,b,w,h){const i=image(u);if(i.complete&&i.naturalWidth)x.drawImage(i,Math.round(a),Math.round(b),w||i.naturalWidth,h||i.naturalHeight);}
draw(A.deco('crate','morango'),marketX+5,marketY+36);draw(A.deco('basket','laranja'),marketX+marketW-30,marketY+38);draw(A.deco('scale'),marketX+marketW-22,marketY+29);draw(A.deco('barrel'),barnX+barnW-4,compact?98:102);draw(A.deco('sack'),barnX-6,compact?105:106);
function fence(z){r(z.x,z.y+z.h,z.w,3,'#53683f');for(let a=z.x;a<=z.x+z.w;a+=10){r(a,z.y+z.h-10,3,14,'#8a6038');r(a,z.y+z.h-10,1,12,'#d9b97b');r(a,z.y+z.h-11,3,1,'#e9d0a0');}r(z.x,z.y+z.h-7,z.w,2,'#dab47a');r(z.x,z.y+z.h-2,z.w,2,'#c69d61');r(z.x,z.y+5,2,z.h-6,'#ae8d57');r(z.x+z.w-2,z.y+5,2,z.h-6,'#ae8d57');for(let a=z.x;a<z.x+z.w;a+=10){r(a,z.y+4,2,6,'#cba56c');}r(z.x,z.y+6,z.w,2,'#d4b37a');}
fence(coop);fence(past);
function tree(a,b){r(a+9,b+21,5,24,'#765336');r(a+9,b+23,2,20,'#b18750');const blobs=[[12,13,13],[4,21,9],[21,21,10],[13,25,12]];for(const [cx,cy,rr]of blobs){for(let yy=-rr;yy<=rr;yy++)for(let xx=-rr;xx<=rr;xx++)if(xx*xx+yy*yy<rr*rr){let col=xx+yy<-5?'#9ab85a':xx+yy>8?'#527942':'#769b4b';r(a+cx+xx,b+cy+yy,1,1,col);}}r(a+3,b+13,4,3,'#b9cf73');r(a+19,b+21,4,3,'#9fba5c');}
tree(-10,35);tree(W-23,26);if(!compact)tree(Math.round(W*.4)-12,50);
draw(A.deco('plant'),marketX-12,marketY+52);draw(A.deco('board'),marketX-22,pathY-19);draw(A.deco('crate','banana'),compact?8:W-46,H-30);draw(A.deco('sack'),compact?38:W-70,H-28);
for(let i=0;i<Math.floor(W/11);i++){const a=Math.floor(rng()*W),b=H-8-Math.floor(rng()*14);if(a>plots.x-6&&a<plots.x+plots.w+5)continue;r(a,b,1,5,'#5f8546');r(a-1,b-1,3,2,i%2?'#e7dba5':'#d1a78b');r(a,b,1,1,'#d6b85c');}
function position(el,z){el.style.left=z.x*2+'px';el.style.top=z.y*2+'px';el.style.width=z.w*2+'px';el.style.height=z.h*2+'px';}
position(document.getElementById('coopZone'),coop);position(document.getElementById('pastZone'),past);position(document.getElementById('plots'),plots);
document.getElementById('plots').style.gridTemplateColumns='repeat(2,minmax(0,1fr))';
const labels=scene.querySelectorAll('.zlabel');[coop,past,plots].forEach((z,i)=>{labels[i].style.left=(z.x+2)*2+'px';labels[i].style.top=(z.y-12)*2+'px';});
const farmer=document.getElementById('walker')||document.getElementById('farmer');farmer.style.left=worker.x*2+'px';farmer.style.top=worker.y*2+'px';
if(document.getElementById('walker')){const hero=window.FZ_SPR&&window.FZ_SPR.chars[s.hero];farmer.dataset.kind=hero&&hero.kind||'person';document.getElementById('farmer').style.setProperty('--s',2);}
scene.dataset.compact=String(compact);const visitors=document.getElementById('custs');if(visitors){visitors.style.left=(marketX+(compact?17:-10))*2+'px';visitors.style.top=(marketY+4)*2+'px';visitors.style.right='auto';}
return layout;}
function placeAnimal(el,a,l){const z=a.kind==='galinha'?l.coop:l.past,w=a.kind==='galinha'?26:36,h=a.kind==='galinha'?24:28;el.style.left=2*Math.round(z.x+4+a.x/100*Math.max(0,z.w-w-7))+'px';el.style.top=2*Math.round(z.y+4+a.y/65*Math.max(0,z.h-h-10))+'px';}
function floatPoint(f){if(!layout)return {x:0,y:0};const z=f.zone==='galinha'?layout.coop:layout.past;return{x:2*Math.round(z.x+4+f.x/100*Math.max(0,z.w-32)),y:2*Math.round(z.y+f.y/65*Math.max(0,z.h-20))};}
window.FazendaVisual={person,animal,animalUrl:(kind,gold)=>animal(kind,0,gold?'#f7c331':null),layout:paint,placeAnimal,floatPoint};
new ResizeObserver(()=>{signature='';if(latest)paint(latest)}).observe(document.getElementById('scene'));
})();
