// Frutódromo — lógica do jogo: sprites gerados por código, genética das frutas, clientes, árvore de espécies, som e interface
const R=a=>a[Math.floor(Math.random()*a.length)],N=(a,b)=>Math.floor(Math.random()*(b-a+1))+a,cl=(v,a,b)=>Math.max(a,Math.min(b,v));
const $=id=>document.getElementById(id);
/* ================= cores ================= */
const COLORS={vermelha:[214,48,49],rosa:[247,143,179],laranja:[243,140,32],amarela:[247,205,55],verde:[106,176,58],roxa:[118,56,150],marrom:[133,88,50],cinza:[150,150,150],azul:[52,120,222],branca:[240,238,226]};
const MUT_ONLY=["branca","rosa"];
function colorName(rgb){let best,bd=1e9;for(const[k,v]of Object.entries(COLORS)){const d=(v[0]-rgb[0])**2+(v[1]-rgb[1])**2+(v[2]-rgb[2])**2;if(d<bd){bd=d;best=k}}return best}
const hex=c=>"#"+c.map(x=>Math.round(cl(x,0,255)).toString(16).padStart(2,"0")).join("");
const mul=(c,k)=>c.map(x=>x*k),lift=(c,k)=>c.map(x=>x+(255-x)*k);
/* ================= elementos ================= */
const ELEM={fogo:{n:"Fogo",adj:"Flamejante",c:"#ff7b00"},gelo:{n:"Gelo",adj:"Congelada",c:"#5bc0eb"},raio:{n:"Raio",adj:"Elétrica",c:"#e8c800"},veneno:{n:"Veneno",adj:"Tóxica",c:"#3fbf3f"},cosmico:{n:"Cósmico",adj:"Cósmica",c:"#9b6bff"}};
/* ================= motor de pixel ================= */
function hexToRgb(h){return[1,3,5].map(i=>parseInt(h.slice(i,i+2),16))}
const blank=(W,H)=>Array.from({length:H},()=>Array(W).fill(null));
function toImg(W,H,grid,outlineCol){const out=grid.map(r=>r.slice());
for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(!grid[y][x]){const n=[[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy])=>(grid[y+dy]||[])[x+dx]).find(Boolean);if(n)out[y][x]=outlineCol||hex(mul(hexToRgb(n),.3))}
const c=document.createElement("canvas");c.width=W;c.height=H;const g=c.getContext("2d");
for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(out[y][x]){g.fillStyle=out[y][x];g.fillRect(x,y,1,1)}return c.toDataURL()}
const artCache={};
function art(rows,pal,ol){const k=rows.join("")+JSON.stringify(pal)+ol;if(artCache[k])return artCache[k];const H=rows.length+2,W2=rows[0].length+2,g=blank(W2,H);rows.forEach((r,y)=>[...r].forEach((ch,x)=>{if(pal[ch])g[y+1][x+1]=pal[ch]}));return artCache[k]=toImg(W2,H,g,ol||"#2a1a12")}
const ell=(cx,cy,a,b,rot=0)=>(x,y)=>{const dx=x-cx,dy=y-cy,c=Math.cos(rot),s=Math.sin(rot),u=dx*c+dy*s,v=-dx*s+dy*c;return u*u/(a*a)+v*v/(b*b)<=1};
/* ================= frutas ================= */
const W=18;
const MASK={
heart:(x,y)=>{const r=["...##########...","..############..",".##############.",".##############.",".##############.","..############..","..############..","...##########...","....########....",".....######.....","......####......",".......##......."];const yy=y-4,xx=x-1;return yy>=0&&yy<r.length&&r[yy][xx]=="#"},
banana:(x,y)=>{const r=["..##............","..##............","..###...........",".####...........",".#####..........","######..........","#######.........","########........","#########.......",".##########.....",".############...","..##############","...#############",".....#########.."];const yy=y-2,xx=x-1;return yy>=0&&yy<r.length&&r[yy][xx]=="#"},
oval:ell(8.5,10,7.6,4.8),round:ell(8.5,9.5,7,7),kidney:ell(8.8,10,7,5,-.55),tall:ell(8.5,11,5.4,5.6),
cluster:(x,y)=>GRAPES.some(([cx,cy])=>(x-cx)**2+(y-cy)**2<=3.4)};
const GRAPES=[[4,6],[7.5,6],[11,6],[14,6],[5.7,9],[9.2,9],[12.6,9],[7.5,12],[11,12],[9.2,15]];
const TOPS={
leaf:[[-1,5,"g"],[-1,8,"g"],[-1,11,"g"],[0,6,"g"],[0,7,"G"],[0,8,"g"],[0,9,"G"],[0,10,"g"],[1,7,"g"],[1,8,"g"],[1,9,"g"]],
stem:[[-3,10,"s"],[-2,9,"s"],[-1,9,"s"],[-2,11,"g"],[-3,11,"g"],[-3,12,"g"]],
crown:[[-5,9,"g"],[-4,6,"g"],[-4,9,"G"],[-4,12,"g"],[-3,6,"G"],[-3,7,"g"],[-3,9,"g"],[-3,11,"g"],[-3,12,"G"],[-2,7,"g"],[-2,8,"G"],[-2,9,"g"],[-2,10,"G"],[-2,11,"g"],[-1,7,"G"],[-1,8,"g"],[-1,9,"g"],[-1,10,"g"],[-1,11,"G"]],none:[]};
const TCOL={g:"#5fb33a",G:"#2f7a2a",s:"#6b4423"};
const cache={};
function maskGrid(f){if(f.mask)return [...f.mask].map(Number);const m=MASK[f.shape],o=[];for(let y=0;y<W;y++)for(let x=0;x<W;x++)o.push(m(x,y)?1:0);return o}
function blurG(g){const o=new Array(W*W).fill(0);for(let y=0;y<W;y++)for(let x=0;x<W;x++){let s=0,n=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const X=x+dx,Y=y+dy;if(X>=0&&Y>=0&&X<W&&Y<W){s+=g[Y*W+X];n++}}o[y*W+x]=s/n}return o}
// funde os formatos dos pais: borra os dois, tira a média e corta
function morph(a,b){let A=blurG(blurG(maskGrid(a))),B=blurG(blurG(maskGrid(b)));const o=A.map((v,i)=>(v+B[i])/2>=.45?1:0);
for(let y=0;y<W;y++)for(let x=0;x<W;x++)if(x==0||y==0||x==W-1||y==W-1)o[y*W+x]=0;if(o.reduce((s,v)=>s+v,0)<20)return maskGrid(a).join("");return o.join("")}
function fruitImg(f){const key=[f.mask||f.shape,f.tip||"",f.pat,f.top,f.rgb.map(Math.round).join("."),f.rgb2?f.rgb2.join("."):"",f.hero?f.cape||1:0].join("|");if(cache[key])return cache[key];
const MG=maskGrid(f),m=(x,y)=>x>=0&&y>=0&&x<W&&y<W&&MG[y*W+x]==1,grid=blank(W,W),base=f.rgb,L=hex(lift(base,.45)),B=hex(base),D=hex(mul(base,.7)),D2=hex(mul(base,.5));
let minx=99,miny=99,maxx=0,maxy=0;for(let y=0;y<W;y++)for(let x=0;x<W;x++)if(m(x,y)){minx=Math.min(minx,x);miny=Math.min(miny,y);maxx=Math.max(maxx,x);maxy=Math.max(maxy,y)}
const cx=(minx+maxx)/2,cy=(miny+maxy)/2,sp=(maxx-minx+maxy-miny)/4;
// capa da super-fruta (atrás)
if(f.hero){const cc=hexToRgb(f.cape||"#d63031"),C1=hex(cc),C2=hex(mul(cc,.7)),bw=(maxx-minx);for(let y=Math.round(cy)-1;y<=Math.min(W-2,maxy+2);y++){const w=bw*.22+1+(y-cy)*.45;for(let x=1;x<W-1;x++){const d=Math.abs(x-cx);if(d<=w)grid[y][x]=d>w-1.2||(y==Math.min(W-2,maxy+2)&&x%2)?C2:C1}}}
for(let y=0;y<W;y++)for(let x=0;x<W;x++){if(!m(x,y))continue;
let t=(x-cx+y-cy)/sp,col=t<-.7?L:t>.75?D:B;
if(f.shape=="banana"){const inE=!m(x+1,y-1)||!m(x+1,y),outE=!m(x-1,y+1)||!m(x,y+1);col=inE?L:outE?D:((x+y)%7==0?L:B)}
if(f.shape=="cluster"){let best,bd=99;GRAPES.forEach(g=>{const d=(x-g[0])**2+(y-g[1])**2;if(d<bd){bd=d;best=g}});const o=(x-best[0])+(y-best[1]);col=o<-1?L:o>.9?D:B;if(bd>2.4)col=D2}
const inner=m(x-1,y)&&m(x+1,y)&&m(x,y-1)&&m(x,y+1);
const A2=f.rgb2?hex(f.rgb2):null,A2D=f.rgb2?hex(mul(f.rgb2,.8)):null,A2L=f.rgb2?hex(lift(f.rgb2,.35)):null;
if(f.pat=="marble"&&A2){const v=Math.sin(x*.9+Math.sin(y*.7)*2.2)+Math.cos(y*.55-x*.3);if(v>.9)col=A2;else if(v>.55)col=A2L}
if(inner){if(f.pat=="seeds"&&y%2==0&&(x+y)%4==0)col=A2L||"#f6e27a";
if(f.pat=="stripes"&&(x+Math.round(Math.sin(y*.5)))%3==0)col=A2D||D2;
if(f.pat=="hatch"&&((x+y)%3==0||(x-y+30)%3==0))col=D;
if(f.pat=="pores"&&(x*7+y*3)%11==0)col=D;
if(f.pat=="fibers"&&(x*5+y*3)%4==0)col=D2;
if(f.pat=="spots"&&(x*3+y*5)%7==0)col=A2D||D2;
if(f.pat=="blush"&&(x-cx)+(y-cy)<-2&&(x+y)%2==0)col="#e5533d"}
grid[y][x]=col}
if(f.tip){for(let y=0;y<W;y++)for(let x=0;x<W;x++)if(m(x,y)&&(y<=miny+1||(x>=maxx-1&&y>=maxy-3)))grid[y][x]=f.tip}
if(f.shape!="cluster"&&f.shape!="banana")[[minx+2,miny+2],[minx+2,miny+3],[minx+3,miny+2]].forEach(([x,y])=>{if(m(x,y))grid[y][x]="#ffffff"});
// máscara de herói
if(f.hero){const my=Math.round(cy)-1;for(let x=0;x<W;x++)if(m(x,my)){grid[my][x]="#1a1a2a";if(m(x,my-1)&&Math.abs(x-cx)<3)grid[my-1][x]="#1a1a2a"}const ex=[Math.round(cx)-2,Math.round(cx)+1];ex.forEach(x=>{if(m(x,my))grid[my][x]="#ffffff"})}
(TOPS[f.top]||[]).forEach(([dy,x,k])=>{const y=miny+dy;if(y>=0&&y<W&&x<W)grid[y][x]=TCOL[k]});
return cache[key]=toImg(W,W,grid)}
/* ===== sprites de efeitos ===== */
const SPR={
fogo:()=>art(["...r...","..ror..",".roor..",".royor.","royyor.","royyyor","roywyor",".royyor","..rrrr."],{r:"#c0392b",o:"#f39c12",y:"#f7dc6f",w:"#fffbe6"},"#7a1a10"),
gelo:()=>art([".w.w.","..w..","wwbww","..w..",".w.w."],{w:"#e8f8ff",b:"#7fd3ff"},"#2a6a8a"),
raio:()=>art(["..yy",".yy.","yyy.","..yy",".yy.",".y.."],{y:"#ffe84a"},"#8a6a00"),
veneno:()=>art([".gg.","gwgg","gggg",".gg."],{g:"#7dff6a",w:"#e8ffe0"},"#1f6a1a"),
cosmico:()=>art(["..s..","..s..","sswss","..s..","..s.."],{s:"#c9a7ff",w:"#ffffff"},"#4a2a8a")};
/* ================= pessoas ================= */
const SKIN=[[246,210,180],[232,180,142],[201,141,99],[162,104,63],[122,74,42],[90,53,32]],HAIR=[[43,26,16],[74,44,23],[74,44,23],[122,74,34],[122,74,34],[196,138,60],[227,194,122],[150,150,150],[178,58,42],[30,30,50],[30,30,50],[110,60,150],[40,90,160]],SHIRT=[[214,48,49],[69,123,157],[42,157,143],[244,162,97],[109,89,122],[233,196,106],[38,70,83],[255,122,162],[138,177,125]];
const NAMES=["Dona Cida","Seu Jorge","Paulão","Lia","Rafa","Tânia","Zé","Morgana","Kenji","Bruna","Lurdes","Barbosa","Nico","Jana","Otávio","Bia","Duda","Caio","Sol","Vini"];
const VIPS=["Chef Estrelado","Crítica Gourmet","Cientista Maluca","Prefeito","Influencer Fit","Colecionador"];
// ===== Retratos em alta resolução (40x52): pele/cabelo com 3 tons, olhos com íris, nariz, lábios, blush =====
const EYEC=[[70,110,190],[60,140,90],[120,80,50],[60,40,30],[140,90,170],[50,150,160]];
function charImg(p,mood,blink){const PW=40,PH=52,col=blank(PW,PH),mat=blank(PW,PH),k=p.kind||"person";
const put=(x,y,c,m)=>{x=Math.round(x);y=Math.round(y);if(x<0||y<0||x>=PW||y>=PH)return;col[y][x]=c;mat[y][x]=m||c};
const fill=(fn,c,m)=>{for(let y=0;y<PH;y++)for(let x=0;x<PW;x++)if(fn(x,y))put(x,y,typeof c=="function"?c(x,y):c,m)};
const rgb=(a,d)=>hex(a||d);
const SKc=p.skin||[232,180,142],FUc=p.fur||SKc,HAc=p.hair||[74,44,23],SHc=p.shirt||[69,123,157];
const SK=hex(SKc),F=hex(FUc),FD=hex(mul(FUc,.8)),FL=hex(lift(FUc,.55)),HA=hex(HAc),SH=hex(SHc),SH2=hex(lift(SHc,.6));
const dx=x=>Math.abs(x-19.5),furry=["cat","dog","bear","bunny"].includes(k);
const head=(x,y)=>(ell(19.5,19.5,11,12)(x,y)&&y<=30)||ell(19.5,25,8.6,7)(x,y);
let eyes=[[14.5,22],[24.5,22]],face=true,mouthY=29,human=k=="person";
// ---------- roupa / corpo ----------
const shoulders=(x,y)=>y>=37&&dx(x)<=8.5+Math.min(11.5,(y-37)*1.7);
const sp=p.sp||0;
const cloth=(x,y)=>{if(sp==1&&Math.floor(y/2)%2==0)return SH2;if(sp==2&&(x+(Math.floor(y/3)%2)*2)%4==0&&y%3==1)return SH2;
 if(sp==3&&((dx(x)>=4&&dx(x)<=6&&y<=43)||(y>=43&&dx(x)<=7)))return "#3d5a8a";return SH};
if(k=="ghost"){fill((x,y)=>(ell(19.5,21,13,13)(x,y)&&y<=22)||(y>=20&&dx(x)<=13&&y<=38+Math.round(2*Math.sin(x*.85)))||ell(6,28,3,2.2)(x,y)||ell(33,28,3,2.2)(x,y),"#f4f1ff","body")}
else if(k=="penguin"){fill(shoulders,"#2b2b40","shirt");fill((x,y)=>y>=37&&dx(x)<=5+(y-37)*.9,"#f2f2fa","belly")}
else if(k=="robot")fill(shoulders,"#9aa0ad","shirt");
else if(k=="frog"){fill(shoulders,F,"shirt");fill((x,y)=>y>=39&&dx(x)<=4+(y-39)*.8,FL,"belly")}
else fill(shoulders,cloth,"shirt");
// gola
if(human||furry||k=="alien"){if(sp==4){fill((x,y)=>y>=37&&y<=40&&dx(x)<=5&&dx(x)>=y-37,"#f5efe0","collar")}
 else fill((x,y)=>y>=36&&y<=38&&dx(x)<=4.5,hex(mul(SHc,.75)),"collar")}
// cabelo (trás) — fica atrás da cabeça e cai sobre os ombros
if(human){const hs=p.hs||0,HB=(fn)=>fill(fn,HA,"hairb");
 if(hs==1)HB((x,y)=>y>=10&&y<=44&&dx(x)<=14.5-(y>40?(y-40)*1.2:0)&&!(y>=29&&dx(x)<=7.5));
 if(hs==2)HB((x,y)=>y>=10&&y<=29&&dx(x)<=13.5-(y>27?(y-27):0));
 if(hs==3)HB((x,y)=>(x-19.5)**2+(y-3.5)**2<=22);
 if(hs==4)HB((x,y)=>ell(19.5,15,16,13.5)(x,y)&&y<=27);
 if(hs==5)HB((x,y)=>ell(31.5,25,3.2,10,-.25)(x,y)||(x>=28&&x<=31&&y>=12&&y<=17));
 if(hs==7)HB((x,y)=>dx(x)>=9&&dx(x)<=13&&y>=14&&y<=43&&!((y%6==0)&&dx(x)>12));}
// pescoço
if(human)fill((x,y)=>y>=29&&y<=38&&dx(x)<=3.6,hex(mul(SKc,.86)),"neck");
// ---------- cabeça ----------
if(human){fill(ell(8.6,22,2.2,3.2),SK,"ear");fill(ell(30.4,22,2.2,3.2),SK,"ear");fill(head,SK,"skin")}
if(furry){
 if(k=="bunny"){fill((x,y)=>y<=16&&(ell(14,6,3,9)(x,y)||ell(25,6,3,9)(x,y)),F,"ear");fill((x,y)=>y>=1&&y<=13&&(ell(14,6,1.1,6.5)(x,y)||ell(25,6,1.1,6.5)(x,y)),"#f5a3b5","earin")}
 if(k=="bear"){fill((x,y)=>(x-8.5)**2+(y-9)**2<=18||(x-30.5)**2+(y-9)**2<=18,F,"ear");fill((x,y)=>(x-8.5)**2+(y-9)**2<=6||(x-30.5)**2+(y-9)**2<=6,FL,"earin")}
 if(k=="cat"){fill((x,y)=>y>=2&&y<=15&&(Math.abs(x-10)<=(y-2)*.55||Math.abs(x-29)<=(y-2)*.55),F,"ear");fill((x,y)=>y>=6&&y<=13&&(Math.abs(x-10)<=(y-6)*.3||Math.abs(x-29)<=(y-6)*.3),"#f5a3b5","earin")}
 fill((x,y)=>ell(19.5,21,12,11.5)(x,y),F,"head");
 if(k=="dog")fill((x,y)=>(ell(7,21,3.4,8)(x,y)||ell(32,21,3.4,8)(x,y)),FD,"ear2");
 [[7,24],[6,26],[7,28],[32,24],[33,26],[32,28]].forEach(([x,y])=>{if(k!="bunny")put(x,y,F,"head")});
 fill(ell(19.5,27.5,6,4),FL,"muzzle");eyes=[[14,21],[25,21]];mouthY=31}
if(k=="frog"){fill(ell(19.5,25,15,9.5),F,"head");fill((x,y)=>(x-11)**2+(y-14)**2<=26||(x-28)**2+(y-14)**2<=26,F,"head");eyes=[[11,14],[28,14]];mouthY=29}
if(k=="penguin"){fill(ell(19.5,20,12.5,12),"#2b2b40","head");fill(ell(19.5,23,9.5,8.5),"#f2f2fa","face");eyes=[[15,21],[24,21]];mouthY=31}
if(k=="robot"){fill((x,y)=>x>=7&&x<=32&&y>=6&&y<=31,"#b8bdc8","head");fill((x,y)=>(x==19||x==20)&&y>=1&&y<=5,"#7d8392","ant");fill((x,y)=>(x>=4&&x<=6||x>=33&&x<=35)&&y>=15&&y<=21,"#7d8392","ant");
 fill((x,y)=>x>=10&&x<=29&&y>=12&&y<=26,"#1a2433","screen");face=false}
if(k=="alien"){fill((x,y)=>(x==11||x==28)&&y>=2&&y<=9,F,"ant");fill(ell(19.5,20,12.5,12.5),F,"head");face=false}
// ---------- cabelo (frente) ----------
if(human){const hs=p.hs||0,cap=(x,y)=>ell(19.5,16.5,12.6,11)(x,y),fr=(x,y)=>y>=8&&y<=13+((Math.floor(x/3))%2)&&dx(x)<=10.5;
 const H=(fn)=>fill(fn,HA,"hair");
 if(hs==0)H((x,y)=>cap(x,y)&&(y<=12||(dx(x)>=10&&y<=22))||fr(x,y)&&y<=11);
 if(hs==1||hs==2||hs==5||hs==7)H((x,y)=>(cap(x,y)&&y<=14)||fr(x,y)||(cap(x,y)&&dx(x)>=10&&y<=20));
 if(hs==3)H((x,y)=>(cap(x,y)&&y<=13)||(dx(x)>=10&&y<=20&&cap(x,y)));
 if(hs==4)H((x,y)=>ell(19.5,15,16,13.5)(x,y)&&y<=11);
 if(hs==6)H((x,y)=>cap(x,y)&&y>=14&&y<=22&&dx(x)>=10);
 if(hs==8)H((x,y)=>(cap(x,y)&&y<=12)||(y>=2&&y<=9&&dx(x)<=11&&(x%5<3)&&y>=9-(x%5)*2.2));
 const hat=p.vip?0:(p.hat||0),HT=hex(p.hat2||SHc),HTD=hex(mul(p.hat2||SHc,.75));
 if(hat==1){fill((x,y)=>y>=3&&y<=11&&cap(x,y),HT,"hat");fill((x,y)=>y>=11&&y<=12&&x>=8&&x<=37,HTD,"hat2")}
 if(hat==2){fill((x,y)=>ell(19.5,11,13,8)(x,y)&&y<=12,HT,"hat");fill((x,y)=>y>=11&&y<=13&&dx(x)<=12.5,hex(lift(p.hat2||SHc,.35)),"hat2");fill((x,y)=>(x-19.5)**2+(y-2.5)**2<=8,"#f5efe0","pom")}
 if(hat==3){fill((x,y)=>dx(x)<=8&&y>=0&&y<=9,"#26263a","hat");fill((x,y)=>dx(x)<=13&&y>=9&&y<=10,"#26263a","hat2");fill((x,y)=>dx(x)<=8&&y>=7&&y<=8,"#c0392b","band")}
}
// ---------- sombreamento em 3 tons com pontilhado ----------
const out=col.map(r=>r.slice()),noShade=new Set(["screen","pom","band"]),bb={};
for(let y=0;y<PH;y++)for(let x=0;x<PW;x++){const m=mat[y][x];if(!m)continue;const b=bb[m]||(bb[m]=[99,99,0,0]);b[0]=Math.min(b[0],x);b[1]=Math.min(b[1],y);b[2]=Math.max(b[2],x);b[3]=Math.max(b[3],y)}
for(let y=0;y<PH;y++)for(let x=0;x<PW;x++){const m=mat[y][x];if(!m||noShade.has(m))continue;const c=hexToRgb(col[y][x]),b=bb[m];
 const w=Math.max(1,b[2]-b[0]),h=Math.max(1,b[3]-b[1]),rx=(x-(b[0]+w*.32))/w,ry=(y-(b[1]+h*.24))/h,r=Math.sqrt(rx*rx+ry*ry);
 const same=(X,Y)=>Y>=0&&Y<PH&&X>=0&&X<PW&&mat[Y][X]==m;
 let v=c;if(r<.26)v=lift(c,.2);else if(r>.8)v=mul(c,.84);
 if(!same(x+1,y)||!same(x,y+1))v=mul(v,.88);else if(!same(x-1,y)||!same(x,y-1))v=lift(v,.1);out[y][x]=hex(v)}
const P=(x,y,c)=>{x=Math.round(x);y=Math.round(y);if(x>=0&&y>=0&&x<PW&&y<PH)out[y][x]=c};
// brilho do cabelo (arco)
if(human)for(let y=0;y<PH;y++)for(let x=0;x<PW;x++){if(mat[y][x]=="hairb"&&y>14&&(x*7+Math.floor(y/3))%5==0)out[y][x]=hex(mul(HAc,.7));if(mat[y][x]!="hair")continue;const e=((x-16)/8)**2+((y-9)/4.5)**2;if(e>.78&&e<1.05&&(x+y)%3!=0)out[y][x]=hex(lift(HAc,.42));else if(y>13&&(x*7+Math.floor(y/3))%5==0&&mat[y-1]&&mat[y-1][x]=="hair")out[y][x]=hex(mul(HAc,.72))}
// ---------- rosto ----------
const E="#2a1a12",WH="#ffffff",EC=hex(EYEC[(p.eyeC||0)%EYEC.length]),PK="#f2909f",SKD=hex(mul(SKc,.78));
const blushC=furry||k=="ghost"||k=="frog"?"#f7a1b0":hex([Math.min(255,SKc[0]+20),SKc[1]*.72,SKc[2]*.75]);
if(face){eyes.forEach(([cx,cy],i)=>{
 if(blink||mood=="happy"){const up=mood=="happy";for(let d=-2;d<=2;d++)P(cx+d,cy+(up?(Math.abs(d)==2?1:0):1)-(up?0:0),E);return}
 const big=!human;// bichos: olhão
 if(!human){const EA=k=="cat"?"#3a5a2a":k=="frog"?"#1e2a14":"#2b1d18";for(let y=-2;y<=2;y++)for(let x=-3;x<=3;x++)if((x/2.6)**2+(y/2.4)**2<=1)P(cx+x,cy+y,y>=1?hex(lift(hexToRgb(EA),.12)):EA);P(cx-1,cy-1,WH);P(cx,cy-1,WH);P(cx-1,cy,WH);P(cx+1,cy+1,"#c8c8e0");return}
 const ix=Math.round(cx),iy=Math.round(cy);
 for(let y=-1;y<=2;y++)for(let x=-2;x<=2;x++)if((x/2.5)**2+((y-.5)/1.9)**2<=1)P(ix+x,iy+y,WH);
 const ECD=hex(mul(EYEC[(p.eyeC||0)%EYEC.length],.45));[[0,-1],[1,-1],[0,0],[1,0],[0,1],[1,1]].forEach(([x,y])=>P(ix+x-1+(i?1:0)*0,iy+y,EC));
 P(ix-1,iy,ECD);P(ix,iy,ECD);P(ix-1,iy+1,ECD);P(ix-1,iy-1,WH);
 for(let x=-2;x<=2;x++)P(ix+x,iy-2,E);P(i?ix+3:ix-3,iy-2,E);P(i?ix+3:ix-3,iy-3,E)});
 if(human){const BR=hex(mul(HAc,.7));eyes.forEach(([cx,cy],i)=>{for(let d=-2;d<=2;d++){const tilt=mood=="sad"?(i?-d:d)*.45:0;P(cx+d,cy-5+tilt-(Math.abs(d)<=1?1:0)*(mood=="happy"?1:0),BR)}})}
 // blush
 eyes.forEach(([cx,cy],i)=>{for(let y=0;y<=1;y++)for(let x=-2;x<=2;x++)if((x+y)%2==0)P(cx+(i?1:-1)+x,cy+4+y,blushC)});
 // nariz
 if(human){P(19,25,SKD);P(20,26,SKD);P(19,26,SKD);P(18,24,hex(lift(SKc,.3)))}
 if(furry){const nc=k=="cat"?"#ff8fa3":"#2a1a12";[[18,25],[19,25],[20,25],[21,25],[19,26],[20,26]].forEach(([x,y])=>P(x,y,nc));P(19,25,"#ffffff")}
 if(k=="penguin"){[[17,26],[18,26],[19,26],[20,26],[21,26],[22,26],[18,27],[19,27],[20,27],[21,27],[19,28],[20,28]].forEach(([x,y],i)=>P(x,y,i<6?"#f5a623":"#d68910"))}
 if(k=="cat")[[9,27],[10,27],[11,27],[8,29],[9,29],[10,29],[11,29],[28,27],[29,27],[30,27],[28,29],[29,29],[30,29],[31,29]].forEach(([x,y])=>P(x,y,"#6a5248"));
 if(k=="bunny"&&mood!="sad"){P(19,28,"#ffffff");P(20,28,"#ffffff");P(19,29,"#d8d8e0");P(20,29,"#d8d8e0")}
 // boca
 const my=mouthY,LIP=human?hex([Math.min(255,SKc[0]*.9+40),SKc[1]*.55,SKc[2]*.6]):"#e0556b";
 if(k=="frog"){for(let x=10;x<=29;x++)P(x,my+(mood=="happy"?(Math.abs(x-19.5)>7?-1:0):mood=="sad"?(Math.abs(x-19.5)>7?1:0):0),E)}
 else if(mood=="happy"){for(let x=-3;x<=3;x++)P(19.5+x,my+(Math.abs(x)==3?-1:0),E);for(let x=-2;x<=2;x++)P(19.5+x,my+1,x==0||Math.abs(x)==1?"#c0394f":E);P(19,my+1,"#ff8fa3");P(20,my+1,"#ff8fa3");for(let x=-1;x<=1;x++)P(19.5+x,my+2,E)}
 else if(mood=="sad"){for(let x=-2;x<=2;x++)P(19.5+x,my+(Math.abs(x)==2?1:0),E)}
 else if(furry&&p.mouth==1){P(17,my,E);P(18,my+1,E);P(19,my,E);P(20,my,E);P(21,my+1,E);P(22,my,E)}
 else{for(let x=-2;x<=2;x++)P(19.5+x,my,E);if(human)for(let x=-1;x<=1;x++)P(19.5+x,my+1,LIP);P(17,my-1,E);P(22,my-1,E)}
}
if(k=="frog")[[15,19],[16,19],[24,21],[25,21],[19,30],[12,25],[27,26]].forEach(([x,y])=>P(x,y,hex(mul(FUc,.75))));
if(k=="robot"){for(let x=8;x<=31;x++)if(x<16||x>23)P(x,7,"#e4e8ef");P(8,8,"#e4e8ef");for(let y=8;y<=12;y++)P(8,y,"#e4e8ef");P(18,0,"#ff8a7e");P(21,0,"#c0392b");
 for(let x=12;x<=27;x+=5)P(x,29,"#8a8f9c");}
if(k=="penguin"){[[8,40],[9,42],[10,44],[30,40],[29,42],[28,44]].forEach(([x,y])=>P(x,y,"#3e3e58"))}
if(k=="robot"){const sc=mood=="sad"?"#ff5a4e":"#4ef0ff",scD=mood=="sad"?"#a8302a":"#1f8fa0";
 [[13,16],[23,16]].forEach(([x0,y0])=>{for(let y=0;y<4;y++)for(let x=0;x<4;x++)P(x0+x,y0+y,blink?(y==3?sc:"#1a2433"):(mood=="happy"&&y>=2?"#1a2433":(x==0&&y==0?"#ffffff":sc)))});
 for(let x=14;x<=25;x++)P(x,23,mood=="sad"?(x<16||x>23?"#1a2433":sc):(x%2?sc:scD));P(19,0,"#ff5a4e");P(20,0,"#ff5a4e");[[9,9],[30,9],[9,28],[30,28]].forEach(([x,y])=>P(x,y,"#6f7584"))}
if(k=="alien"){[[14,21,.45],[25,21,-.45]].forEach(([cx,cy,r],i)=>{for(let y=13;y<=29;y++)for(let x=6;x<=33;x++)if(ell(cx,cy,3,4.6,r)(x,y))P(x,y,blink?hex(mul(FUc,.8)):"#141420");if(!blink){P(cx-1,cy-2,WH);P(cx,cy-2,WH);P(cx-1,cy-1,WH);P(cx+1,cy+2,"#5a5a80")}});
 P(11,1,"#f7c331");P(28,1,"#f7c331");P(10,1,"#f7c331");P(29,1,"#f7c331");const my=30;
 if(mood=="happy"){for(let x=-2;x<=2;x++)P(19.5+x,my+(Math.abs(x)==2?-1:0),E)}else if(mood=="sad"){for(let x=-2;x<=2;x++)P(19.5+x,my+(Math.abs(x)==2?0:-1),E)}else{P(19,my,E);P(20,my,E)}}
if(k=="ghost"){P(9,27,"#f7a1b0");P(10,27,"#f7a1b0");P(29,27,"#f7a1b0");P(30,27,"#f7a1b0")}
// ---------- acessórios ----------
const acc=p.acc||[],AC=hex(p.acc2||[214,48,49]),ACD=hex(mul(p.acc2||[214,48,49],.72));
if(human&&acc.includes("freck"))[[11,26],[13,27],[12,28],[26,26],[28,27],[27,28]].forEach(([x,y])=>P(x,y,hex(mul(SKc,.68))));
if(human&&acc.includes("must")){for(let x=-4;x<=4;x++)P(19.5+x,27+(Math.abs(x)>=3?1:0),HA);for(let x=-3;x<=3;x++)P(19.5+x,26,HA)}
if(human&&acc.includes("glass"))eyes.forEach(([cx,cy])=>{for(let a=0;a<24;a++){const t=a/24*Math.PI*2;P(cx+Math.cos(t)*4,cy+Math.sin(t)*3.3,"#3a3a4a")}P(19,22,"#3a3a4a");P(20,22,"#3a3a4a")});
if(human&&acc.includes("ear")){[[8,26],[8,27],[31,26],[31,27]].forEach(([x,y])=>P(x,y,"#f7c331"));P(8,28,"#ffe27a");P(31,28,"#ffe27a")}
if(acc.includes("scarf")&&k!="ghost"){for(let y=34;y<=38;y++)for(let x=-9;x<=9;x++)if(Math.abs(x)<=9-(y-34)*.3)P(19.5+x,y,(x+y)%4<2?AC:ACD);for(let y=38;y<=44;y++){P(26,y,AC);P(27,y,ACD)}}
if(human&&acc.includes("neck"))for(let x=-5;x<=5;x+=2)P(19.5+x,39+(Math.abs(x)<2?1:0),"#f7c331");
if(acc.includes("bow")&&!(human&&(p.hat||p.vip))){const c=AC;[[27,4],[28,3],[29,4],[28,5],[27,5],[26,4],[30,5],[31,4],[32,3],[33,4],[32,5],[31,5],[29,5],[30,4]].forEach(([x,y],i)=>P(x,y,i<6?c:ACD));P(29,4,ACD)}
if(human&&acc.includes("flower")&&!p.hat&&!p.vip)[[9,8,"#ff7aa2"],[13,5,"#ffe84a"],[19,4,"#ff7aa2"],[25,5,"#8af0ff"],[29,8,"#ffe84a"]].forEach(([x,y,c])=>{P(x,y,c);P(x+1,y,c);P(x,y+1,c);P(x+1,y+1,"#fff");P(x+2,y+1,"#5fb33a")});
if(human&&acc.includes("leaf")&&!p.hat&&!p.vip){[[27,6],[28,5],[29,5],[30,4],[31,4],[28,6],[29,6],[30,5],[32,3],[26,7]].forEach(([x,y],i)=>P(x,y,i%3?"#5fb33a":"#3f8a2e"));P(27,7,"#c0392b");P(26,7,"#c0392b")}
if(!human&&acc.includes("tie")&&k!="ghost"){[[16,37],[17,37],[18,38],[17,38],[16,39],[17,39],[21,38],[22,37],[23,37],[22,38],[22,39],[23,39],[19,38],[20,38]].forEach(([x,y],i)=>P(x,y,i>=12?ACD:AC))}
if(human&&sp==4)[[19,41],[19,45],[19,49]].forEach(([x,y])=>P(x,y,"#f5efe0"));
if(p.vip){const top=human?(p.hat==3?0:3):k=="robot"?2:4;for(let x=-6;x<=6;x++){P(19.5+x,top+3,"#f7c331");P(19.5+x,top+4,"#d4a017")}[[-6,0],[-3,1],[0,-1],[3,1],[6,0]].forEach(([x,y])=>{P(19.5+x,top+y+1,"#ffe27a");P(19.5+x,top+y+2,"#f7c331")});P(19,top+3,"#e74c3c");P(20,top+3,"#e74c3c")}
return toImg(PW,PH,out,null)}
function personImg(p,mood,blink){return charImg(p,mood,blink)}
const KINDS=[["cat",[[240,160,80],[120,120,130],[60,50,50],[250,240,230]],["Sr. Bigode","Mia","Felino Félix","Pantufa"]],["dog",[[190,130,80],[120,80,50],[230,210,170]],["Totó","Bolinha","Paçoca","Caramelo"]],
["bear",[[140,90,55],[90,60,40]],["Ursão","Ursula","Mel"]],["bunny",[[245,240,235],[200,170,140]],["Dona Coelha","Pipoca"]],["frog",[[110,190,70]],["Sapo Zé","Rã Rita"]],
["penguin",[[34,34,46]],["Pinguim Pipo","Gelinho"]],["robot",[[160,165,175]],["Robô R-12","Bip-Bop","Unidade K7"]],["alien",[[140,220,90],[170,130,240]],["Zork","Glip","Xuxu de Marte"]],["ghost",[[245,240,255]],["Fantasminha","Boo-Boo"]]];
/* ================= feira ================= */
// nome, forma, padrão, topo, cor(rgb ou nome), doce, azedo, tamanho, preço, nível, elemento
const BASE=[["Morango","heart","seeds","leaf","vermelha",7,3,2,3,1],["Banana","banana","none","none","amarela",8,1,5,2,1],["Limão","oval","pores","stem","verde",1,9,3,2,1],["Uva","cluster","none","stem","roxa",7,4,2,3,1],
["Coco","round","fibers","none","marrom",4,1,8,4,1],["Melancia","round","stripes","stem","verde",6,1,10,5,1],["Manga","kidney","blush","stem","laranja",9,2,6,4,1],["Abacaxi","tall","hatch","crown","amarela",6,6,8,4,1],
["Pimenta-Dragão","banana","none","none","vermelha",1,3,2,10,2,"fogo"],["Fruta Glacial","oval","none","leaf","azul",3,6,5,12,3,"gelo"],["Carambola Elétrica","tall","seeds","stem","amarela",6,4,5,14,4,"raio"]];
/* ================= estado ================= */
let S,running=false,modalOpen=false;
let CFG={mus:60,sfx:80,vib:true,zen:false};try{Object.assign(CFG,JSON.parse(localStorage.getItem("frutodromo_cfg")||"{}"))}catch(e){}
const saveCfg=()=>{try{localStorage.setItem("frutodromo_cfg",JSON.stringify(CFG))}catch(e){}};const sk=k=>false;const dayLen=()=>150000+(sk('t3')?60000:0);
function level(){return 1+Math.floor(S.delivered/3)}
const now=()=>S.clock;
function baseFruit(b){const c=typeof b[4]=="string"?COLORS[b[4]].slice():b[4].slice();return{id:"f"+(S.id++),tip:b[0]=="Banana"?"#6b4423":b[0]=="Pimenta-Dragão"?"#3f9a3a":null,root:b[0].split(/[ -]/)[0],shape:b[1],pat:b[2],top:b[3],rgb:c,doce:b[5],az:b[6],tam:b[7],gen:0,mut:false,el:b[10]||null,hero:false,base:b[0]}}
function fresh(){S={bag:[{t:"grow"},{t:"shrink"}],potPos:null,coins:25,delivered:0,id:1,fruits:[],pot:[],cust:[null,null,null],clock:0,day:1,dayT:0,ds:{earn:0,served:0,best:0,dex:0},dex:{},tree:{},started:false,ess:0,sk:{}};
[0,1,2,4,5,6].forEach((bi,i)=>{const f=baseFruit(BASE[bi]);f.x=14+(i%3)*104;f.y=12+Math.floor(i/3)*92;S.fruits.push(f)})}
try{S=JSON.parse(localStorage.getItem("frutodromo9"))}catch(e){}if(!S||!S.fruits)fresh();
const save=()=>{try{localStorage.setItem("frutodromo9",JSON.stringify(S))}catch(e){}};
/* ================= genética ================= */
function portmanteau(a,b){if(a==b)return a;const n=a.slice(0,Math.max(2,Math.ceil(a.length/2)))+b.slice(Math.floor(b.length/2)).toLowerCase();return n.replace(/([a-zà-ú])\1/gi,"$1")}
// regra única: parecidos se intensificam
function inh(x,y,max){if(x<=3&&y<=3)return Math.max(0,Math.min(x,y)-1);if(x>=8&&y>=8)return Math.min(max,Math.max(x,y)+1);return Math.round((x+y)/2)}
function elOut(a,b){if(a.el&&b.el&&a.el!=b.el)return{el:R([a.el,b.el]),hero:true};return{el:a.el||b.el||null,hero:!!(a.hero||b.hero)}}
function cross(a,b){const fa=Math.random()<.5,P=fa?a:b,Q=fa?b:a,e=elOut(a,b);
const c={id:"f"+(S.id++),gen:Math.max(a.gen,b.gen)+1,mut:false,root:portmanteau(P.root,Q.root),shape:"mix",mask:a.shape==b.shape&&!a.mask&&!b.mask?null:morph(a,b),pat:Math.random()<.5?Q.pat:P.pat,top:R([a.top,b.top]),
doce:inh(a.doce,b.doce,10),az:inh(a.az,b.az,10),tam:inh(a.tam,b.tam,12),rgb:a.rgb.map((x,i)=>Math.round((x+b.rgb[i])/2)),el:e.el,hero:e.hero};
{const da=a.rgb.reduce((s,x,i)=>s+(x-c.rgb[i])**2,0),db=b.rgb.reduce((s,x,i)=>s+(x-c.rgb[i])**2,0),far=da>db?a:b;if(Math.max(da,db)>1500){c.rgb2=far.rgb.map(Math.round);if(Math.random()<.35)c.pat="marble";else if(c.pat=="none"||c.pat=="pores"||c.pat=="fibers")c.pat=R(["spots","stripes","seeds"])}}
c.shiny=Math.random()<((a.shiny||b.shiny)?.25:.04);
if(!c.mask)c.shape=a.shape;if(c.hero)c.cape=(a.hero&&a.cape)||(b.hero&&b.cape)||R(["#d63031","#2d6cdf","#8e44ad","#16a085","#f39c12"]);
if(Math.random()<.08){c.mut=true;if(Math.random()<.6)c.rgb=COLORS[R(["rosa","branca","azul","cinza"])].slice();else c.pat=R(["spots","stripes","seeds","none","blush"])}
return c}
function stars(t){let s=1;if(t.d>=2)s++;if(t.d>=4)s++;if(t.st.el)s++;if(t.st.hero)s++;if(t.st.tam==0||t.st.tam>=11)s++;if(t.shiny)s++;return Math.min(5,s)}
const RAR=[null,["COMUM","#8d99ae"],["INCOMUM","#3ca55c"],["RARA","#2d6cdf"],["ÉPICA","#9b5de5"],["LENDÁRIA","#f39c12"]];
function fname(f){let n=(f.hero?"Super ":"")+f.root+(f.gen>=3?" "+["","","","Nobre","Rara","Ancestral","Lendária"][Math.min(6,f.gen)]:"");if(f.el)n+=" "+ELEM[f.el].adj;return n}
const sizeName=t=>t==0?"Microscópica":t==1?"Mini":t<=3?"Pequena":t<=7?"Média":t<=10?"Grande":t==11?"Enorme":"Gigantesca";
/* ================= Frutódex ================= */
// ===== Árvore de espécies: infinita, cresce a cada combinação nova =====
const taste=f=>f.doce>=6&&f.az>=6?"agridoce":f.doce>=8?"doce":f.az>=8?"azeda":"suave";
const spKey=f=>[sizeName(f.tam),colorName(f.rgb),taste(f),f.el||"",f.hero?"S":""].join("|");
function spLabel(k){const[sz,c,t,el,h]=k.split("|");return (h?"Super · ":"")+sz+" · "+c+" · "+t+(el?" · "+ELEM[el].n:"")}
function treeAdd(f,parents,silent){S.tree=S.tree||{};const k=spKey(f);f.sp=k;if(S.tree[k]){if(f.shiny&&!S.tree[k].shiny){S.tree[k].shiny=true;S.tree[k].img={...S.tree[k].img,rgb2:f.rgb2,pat:f.pat};if(!silent)setTimeout(()=>reveal(k,true),1000)}return false}
const pk=parents?[...new Set(parents.map(p=>p.sp||spKey(p)))]:[];const d=pk.length?Math.max(...pk.map(x=>(S.tree[x]||{d:0}).d))+1:0;
S.tree[k]={n:Object.keys(S.tree).length+1,name:f.base||fname(f),d,par:pk,t:Date.now(),img:{shape:f.shape,mask:f.mask,tip:f.tip,pat:f.pat,top:f.top,rgb:f.rgb,rgb2:f.rgb2,hero:f.hero,cape:f.cape},shiny:!!f.shiny,day:S.day,st:{doce:f.doce,az:f.az,tam:f.tam,rgb:f.rgb,el:f.el,hero:f.hero}};
if(!silent){S.ds.dex++;const t=S.tree[k],n=t.n,st=stars(t);if(st>=3||t.d>=2||t.shiny)setTimeout(()=>reveal(k),1000);else setTimeout(()=>{toast(`<b>NOVA ESPÉCIE nº ${n}!</b><br>${spLabel(k)}`);SFX.dex()},900)}
else if(f.shiny&&!S.tree[k].shiny){S.tree[k].shiny=true}return true}
const dexCheck=(f,silent)=>treeAdd(f,null,silent);
function predictSt(a,b){const e=a.el&&b.el&&a.el!=b.el?{el:a.el,hero:true}:{el:a.el||b.el||null,hero:!!(a.hero||b.hero)};
return{doce:inh(a.doce,b.doce,10),az:inh(a.az,b.az,10),tam:inh(a.tam,b.tam,12),rgb:a.rgb.map((x,q)=>(x+b.rgb[q])/2),el:e.el,hero:e.hero}}
function suggestions(max,only){const ks=Object.keys(S.tree||{}),out=[],seen=new Set();
for(let i=0;i<ks.length;i++)for(let j=i;j<ks.length;j++){if(only&&ks[i]!=only&&ks[j]!=only)continue;const c=predictSt(S.tree[ks[i]].st,S.tree[ks[j]].st),k=spKey(c);if(S.tree[k]||seen.has(k))continue;seen.add(k);
out.push({k,a:ks[i],b:ks[j],c,score:Math.abs(c.tam-6)*1.5+(c.hero?5:0)+(c.el?1:0)+(c.doce==10||c.az==10?3:0)+((i*7+j*13)%10)/10})}
return out.sort((x,y)=>y.score-x.score).slice(0,max)}
/* ================= clientes ================= */
// ===== pedidos sempre possíveis: o cliente escolhe uma fruta que dá pra fazer com a feira =====
const reach={};const rk=f=>[f.doce,f.az,f.tam,colorName(f.rgb),f.el||"",f.hero?1:0].join(",");
function reachPool(L){const maxD=L<=2?1:L<=4?2:3,key=L+"_"+maxD;if(reach[key])return reach[key];
const all=new Map();BASE.filter(b=>b[9]<=L).forEach(b=>{const f=baseFruit(b);S.id--;const o={doce:f.doce,az:f.az,tam:f.tam,rgb:f.rgb,el:f.el,hero:f.hero,d:0,name:b[0],img:{shape:f.shape,pat:f.pat,top:f.top,rgb:f.rgb,tip:f.tip}};all.set(rk(o),o)});
for(let d=1;d<=maxD;d++){const arr=[...all.values()],lo=arr.filter(x=>x.d<=1),hiA=arr.filter(x=>x.d==d-1),add=[];
const src=d<3?arr:lo;for(const a of hiA)for(const b of src){if(d<3&&b.d<a.d&&b.d<d-1)continue;const c=predictSt(a,b);c.d=d;c.p=[a,b];const k=rk(c);if(!all.has(k))add.push([k,c])}
add.forEach(([k,c])=>{if(!all.has(k))all.set(k,c)})}
return reach[key]=[...all.values()]}
function recipeOf(t){const steps=[];const walk=x=>{if(!x.p)return;walk(x.p[0]);walk(x.p[1]);if(!steps.includes(x))steps.push(x)};walk(t);return steps}
function reqsFrom(t,n,L){const out=[],c=colorName(t.rgb);
const sz=t.tam==0?{k:"micro"}:t.tam<=1?{k:"mini"}:t.tam>=12?{k:"giga"}:t.tam>=11?{k:"enorme"}:t.tam>=8?{k:"tamMin",v:8}:t.tam<=3?{k:"tamMax",v:3}:{k:"media"};
const special=[];if(t.hero)special.push({k:"hero"});if(t.el)special.push({k:"el",v:t.el});if(sz&&["micro","giga","mini","enorme"].includes(sz.k))special.push(sz);
const normal=[{k:"cor",v:c}];if(sz&&!special.includes(sz))normal.push(sz);
const lvl=(v,k)=>v>=8?{k:k+"Min",v:8}:v>=6?{k:k+"Min",v:6}:v<=2?{k:k+"Max",v:2}:v<=4?{k:k+"Max",v:4}:null;
[lvl(t.doce,"doce"),lvl(t.az,"az")].forEach(r=>{if(r)normal.push(r)});
special.sort(()=>Math.random()-.5);normal.sort(()=>Math.random()-.5);
for(const r of [...special,...normal]){if(out.length>=n)break;out.push(r)}return out}
function newCust(){const L=level(),vip=L>=(sk('t4')?2:3)&&Math.random()<(sk('t4')?.3:.15);let n=Math.min(3,1+Math.floor((L-1)/2)+(Math.random()<.3?1:0));if(vip)n=Math.min(4,n+1);
const pool=reachPool(L),maxD=Math.max(...pool.map(x=>x.d));
// alvo: nível baixo pede coisas perto da feira; VIP pede o mais fundo
const want=vip?maxD:Math.min(maxD,R([0,1,1,2,2,3].filter(d=>d<=maxD))),cand=pool.filter(x=>x.d==want&&(L>=5||!x.hero)&&(L>=3||!x.el));
const t=R(cand.length?cand:pool),reqs=reqsFrom(t,n,L);
let rw=4+reqs.length*5+L*2+t.d*6;reqs.forEach(r=>{if(r.k=="el")rw+=12;if(r.k=="mini"||r.k=="enorme")rw+=10;if(r.k=="micro"||r.k=="giga")rw+=22;if(r.k=="hero")rw+=30});if(vip)rw*=3;
const kd=Math.random()<.45?R(KINDS):null;
const ACC=["freck","must","glass","ear","scarf","neck","bow","flower","tie","leaf"],acc=[];for(let q=0;q<N(0,2);q++)acc.push(R(ACC));
return{name:vip?R(VIPS):kd?R(kd[2]):R(NAMES),kind:kd?kd[0]:"person",fur:kd?R(kd[1]):null,vip,skin:R(SKIN),hair:R(HAIR),hs:R([0,0,1,1,2,2,3,4,5,6,7,8]),eyeC:N(0,5),hat:Math.random()<.25?N(1,3):0,hat2:R(SHIRT),sp:N(0,4),acc,acc2:R(SHIRT),mouth:N(0,1),blinkD:Math.random()*4,shirt:R(SHIRT),gl:false,reqs,rw,t0:now(),
pat:(95000+t.d*45000+reqs.length*15000)*(vip?.85:1),come:true,tg:rk(t),td:t.d}}
function stImg(x){if(x.img)return x.img;let a=x;while(a.p)a=a.p[0];return {...a.img,rgb:x.rgb,hero:x.hero,cape:x.hero?"#d63031":null}}
function stLabel(x){return x.d==0?x.name:(x.hero?"Super ":"")+sizeName(x.tam)+" "+colorName(x.rgb)+(x.el?" "+ELEM[x.el].n:"")}
function showHint(i){const c=S.cust[i];if(!c)return;const L=level(),pool=reachPool(L);const ok=pool.filter(x=>c.reqs.every(r=>meets(x,r))).map(x=>[x,recipeOf(x).length]).sort((a,b)=>a[1]-b[1]);let t=ok.length?ok[0][0]:null;
let h=`<h2>COMO FAZER?</h2><p style="margin-top:0">Pedido de <b>${c.name}</b></p>`;
if(!t)h+="<p>Hmm, esse pedido ficou difícil. Pode trocar por outro cliente esperando ele ir embora.</p>";
else if(t.d==0)h+=`<p>É só comprar na feira:</p><div class="rstep"><span class="fi"><img src="${fruitImg(stImg(t))}"><span class="nn">${t.name}</span></span></div>`;
else{const st=recipeOf(t);h+=`<p>${st.length} cruzamento${st.length>1?"s":""} no caldeirão:</p>`+st.map((x,k)=>{const[a,b]=x.p,fi=y=>`<span class="fi"><img src="${fruitImg(stImg(y))}"><span class="nn">${stLabel(y)}</span></span>`;return `<div class="rstep"><b>${k+1}.</b>${fi(a)}<b>+</b>${fi(b)}<b>=</b>${fi(x)}</div>`}).join("")+`<p style="font-size:.75rem;opacity:.75">As frutas da feira estão lá embaixo. Use o resultado de cada passo no passo seguinte.</p>`}
openModal(h+`<button class="big" id="cl">ENTENDI</button>`);$("cl").onclick=closeModal}
function meets(f,r){switch(r.k){case"cor":return colorName(f.rgb)==r.v;case"doceMin":return f.doce>=r.v;case"doceMax":return f.doce<=r.v;case"azMin":return f.az>=r.v;case"azMax":return f.az<=r.v;
case"tamMin":return f.tam>=r.v;case"tamMax":return f.tam<=r.v;case"media":return f.tam>=4&&f.tam<=7;case"mini":return f.tam<=1;case"micro":return f.tam==0;case"enorme":return f.tam>=11;case"giga":return f.tam==12;case"el":return f.el==r.v;case"hero":return !!f.hero}}
const LAB={doce:["DOCE","#ff5f9e"],az:["AZEDO","#9ccc2e"],tam:["TAM.","#3fa7e0"]};
function cells(fn,col){let s="";for(let i=1;i<=10;i++)s+=`<i style="${fn(i)?"background:"+col:""}"></i>`;return `<span class="cells">${s}</span>`}
const RICO={doce:()=>art(["..p..",".ppp.","ppwpp",".ppp.","..p.."],{p:"#ff5f9e",w:"#ffd0e4"},"#8a2050"),az:()=>art([".yy..","yyyy.","yyyyy",".yyyy","..yy."],{y:"#d6e84a"},"#5a6a10"),
tam:()=>art(["..b..",".bbb.","..b..","..b..","..b..",".bbb.","..b.."],{b:"#3fa7e0"},"#164a6a"),hero:()=>art(["..m..","rrmrr","rrrrr","rr.rr","r...r"],{m:"#1a1a2a",r:"#d63031"},"#5a1010")};
function reqWord(r){switch(r.k){
case"doceMin":return[r.v>=8?"MUITO DOCE":"DOCE",r.v+"+","doce"];case"doceMax":return[r.v<=2?"NADA DOCE":"POUCO DOCE","até "+r.v,"doce"];
case"azMin":return[r.v>=8?"MUITO AZEDA":"AZEDA",r.v+"+","az"];case"azMax":return[r.v<=2?"NADA AZEDA":"POUCO AZEDA","até "+r.v,"az"];
case"tamMin":return[r.v>=8?"GRANDE":"TAMANHO",r.v+"+","tam"];case"tamMax":return[r.v<=3?"PEQUENA":"TAMANHO","até "+r.v,"tam"];case"media":return["MÉDIA","4 a 7","tam"];
case"mini":return["MINI","0 ou 1","tam"];case"micro":return["MICROSCÓPICA","0","tam"];case"enorme":return["ENORME","11+","tam"];case"giga":return["GIGANTESCA","12","tam"];
case"cor":return[r.v.toUpperCase(),"","cor"];case"el":return[ELEM[r.v].n.toUpperCase(),"","el"];case"hero":return["SUPER-FRUTA","","hero"]}}
function reqHTML(r,f){const ok=f?meets(f,r):null,[w,n,ic]=reqWord(r);
const icon=ic=="cor"?`<span class="sw" style="background:${hex(COLORS[r.v])}"></span>`:ic=="el"?`<img class="ico" src="${SPR[r.v]()}">`:`<img class="ico" src="${RICO[ic]()}">`;
return `<div class="rq ${ok===true?"y":ok===false?"n":""} ${ic=="cor"?"cor":""}" ${ic=="cor"?`onclick="colorGuide('${r.v}')"`:""}>${icon}<b style="${w.length>9?"font-size:.56rem;letter-spacing:-.4px":""}">${w}</b>${n?`<span class="nb">${n}</span>`:""}${ok===null?"":`<i class="ck">${ok?"✓":"✗"}</i>`}</div>`}
const leftOf=c=>CFG.zen?1:cl(1-(now()-c.t0)/c.pat,0,1),pay=c=>Math.round(c.rw*(.5+.5*leftOf(c))*(sk('cap')?1.5:1));
let sel=null,hoverCust=-1;const pcache={};
function renderCounter(){const f=sel?S.fruits.find(x=>x.id==sel):null;
if(!running&&S.cust.every(c=>!c)){$("custs").innerHTML=`<div class="closed">${S.started?'<span class="px" style="background:#f5efe0;padding:4px 10px">QUITANDA FECHADA</span>':""}</div>`;return}
$("custs").innerHTML=S.cust.map((c,i)=>{if(!c)return `<div class="cust"></div>`;const left=leftOf(c);
const ok=f&&c.reqs.every(r=>meets(f,r)),mood=c.mood||(left<.2?"sad":"ok"),pk=i+mood+c.t0+c.name;
if(!pcache[pk])pcache[pk]=personImg(c,mood);if(!pcache[pk+"b"])pcache[pk+"b"]=personImg(c,mood,true);const on=Math.ceil(left*10),pc=left>.5?"#3ce06f":left>.2?"#f4a261":"#e74c3c";
let pat="";for(let s=0;s<10;s++)pat+=`<i style="${s<on?"background:"+pc:""}"></i>`;
const cls=(hoverCust==i||ok?"hot ":"")+(c.leaving?"leave ":"")+(c.come?"come ":"")+(c.mood=="sad"?"sad ":"")+(c.vip?"vip":"");
return `<div class="cust ${cls} ${c.mood=="happy"?"happy":""} ${left<.12&&!c.mood?"angry":""}" data-i="${i}" data-low="${left<.2?1:0}"><div class="bub px"><span class="bn">${c.name}</span>${c.vip?'<span class="vipb">VIP x3</span>':""}${c.reqs.map(r=>reqHTML(r,f)).join("")}
<div class="pay"><span class="coin"></span><b>${pay(c)}</b><span class="hint" onclick="event.stopPropagation();showHint(${i})">?</span></div><div class="pat">${pat}</div></div><div class="pw" onclick="showPortrait(${i})"><img class="p" src="${pcache[pk]}"><img class="p blk" src="${pcache[pk+"b"]}" style="animation-delay:-${(c.blinkD||0).toFixed(2)}s"></div>${left<.2&&!c.leaving?'<span class="sweat"></span>':""}${left<.12&&!c.leaving?'<span class="puff"><i></i><i></i></span>':""}</div>`}).join("");
S.cust.forEach(c=>{if(c)c.come=false})}
/* ================= mesa ================= */
const tbl=$("table");
const scale=f=>f.tam==0?1:f.tam==1?2:f.tam<=3?3:f.tam<=7?4:f.tam<=10?5:f.tam==11?6:7,fsize=f=>f.tam==0?40:W*scale(f);
function fxHTML(f,s){if(!f.el)return"";const src=SPR[f.el](),o=[];
if(f.el=="fogo"){o.push(`<img class="fx fx-fogo" src="${src}" style="left:${s*.32}px;top:${-s*.22}px;width:${s*.36}px;height:${s*.44}px">`);o.push(`<img class="fx fx-fogo" src="${src}" style="left:${s*.02}px;top:${s*.18}px;width:${s*.22}px;height:${s*.27}px;animation-delay:-.15s">`);o.push(`<img class="fx fx-fogo" src="${src}" style="left:${s*.74}px;top:${s*.12}px;width:${s*.24}px;height:${s*.3}px;animation-delay:-.1s">`)}
else{const cls=f.el=="veneno"?"fx-rise":"fx-tw",pos=[[.05,.05],[.78,.12],[.12,.72],[.82,.7],[.46,-.08]];pos.forEach(([x,y],k)=>o.push(`<img class="fx ${cls}" src="${src}" style="left:${s*x}px;top:${s*y}px;width:${Math.max(10,s*.18)}px;height:${Math.max(10,s*.18)}px;animation-delay:-${k*.27}s">`))}
return o.join("")}
function renderTable(newId){tbl.querySelectorAll(".fr").forEach(e=>e.remove());$("tip").style.display=S.fruits.length?"none":"";
S.fruits.forEach(f=>{const d=document.createElement("div");d.className="fr"+(f.id==newId?" new":"")+(f.id==sel?" sel":"")+(f.tam==0?" micro":"")+(f.el?" el-"+f.el:"")+(f.shiny?" shiny":"");d.dataset.id=f.id;const s=fsize(f);
d.style.width=d.style.height=s+"px";d.style.left=f.x+"px";d.style.top=f.y+"px";d.style.setProperty("--d",(parseInt(f.id.slice(1))%7)*.3+"s");d.innerHTML=`<img src="${fruitImg(f)}">`+fxHTML(f,s)+(f.shiny?[[.1,.15],[.75,.05],[.85,.65],[.2,.8]].map(([x,y],k)=>`<span class="spk" style="left:${s*x}px;top:${s*y}px;animation-delay:-${k*.3}s"></span>`).join(""):"")+(f.mut?'<span class="mut">MUT</span>':"");tbl.appendChild(d);drag(d,f)})}
function clampPos(f){const s=fsize(f);f.x=cl(f.x,0,Math.max(0,tbl.clientWidth-s));f.y=cl(f.y,0,Math.max(0,tbl.clientHeight-s))}
function center(el){const r=el.getBoundingClientRect();return[r.left+r.width/2,r.top+r.height/2]}
function inside(x,y,el){const r=el.getBoundingClientRect();return x>r.left&&x<r.right&&y>r.top&&y<r.bottom}
function custAt(x,y){let k=-1;document.querySelectorAll(".cust").forEach(c=>{if(c.dataset.i!==undefined&&inside(x,y,c))k=+c.dataset.i});return k}
function drag(el,f){let sx,sy,ox,oy,mv=false,on=false;
el.addEventListener("pointerdown",e=>{if(modalOpen)return;e.preventDefault();el.setPointerCapture(e.pointerId);sx=e.clientX;sy=e.clientY;ox=f.x;oy=f.y;mv=false;on=true});
el.addEventListener("pointermove",e=>{if(!on)return;const dx=e.clientX-sx,dy=e.clientY-sy;if(!mv&&Math.abs(dx)+Math.abs(dy)<6)return;
if(!mv){mv=true;el.classList.add("drag");sel=f.id;showInfo(null);renderCounter()}
el.style.left=ox+dx+"px";el.style.top=oy+dy+"px";const[cx,cy]=center(el);
{const op=!brewing&&inside(cx,cy,$("pot"));$("pot").classList.toggle("hot",op);el.classList.toggle("overpot",op)}$("bin").classList.toggle("hot",inside(cx,cy,$("bin")));
const hc=custAt(cx,cy);if(hc!=hoverCust){hoverCust=hc;document.querySelectorAll(".cust").forEach(c=>c.classList.toggle("hot",c.dataset.i!==undefined&&+c.dataset.i===hc))}});
const up=e=>{if(!on)return;on=false;el.classList.remove("drag");$("bin").classList.remove("hot");$("pot").classList.remove("hot");
if(!mv&&armed){useItem(f);return}if(!mv){sel=sel==f.id?null:f.id;showInfo(sel?f:null);renderCounter();tbl.querySelectorAll(".fr").forEach(x=>x.classList.toggle("sel",x.dataset.id==sel));return}
const[cx,cy]=center(el);const hc=custAt(cx,cy);hoverCust=-1;
if(hc>=0&&S.cust[hc]&&!S.cust[hc].leaving){deliver(f,hc,ox,oy);return}
if(inside(cx,cy,$("bin"))){sell(f);return}
if(inside(cx,cy,$("pot"))){if(brewing||S.pot.length>=(sk("c3")?3:2)){f.x=ox;f.y=oy;renderTable();return toast("O caldeirão está ocupado!")}addToPot(f);return}
f.x=ox+(e.clientX-sx);f.y=oy+(e.clientY-sy);clampPos(f);sel=null;save();renderTable();renderCounter()};
el.addEventListener("pointerup",up);el.addEventListener("pointercancel",up)}
function sell(f){const v=(sk('t2')?2:1)*(1+Math.floor(f.gen/2)+(f.mut?2:0)+(f.el?3:0)+(f.hero?6:0)+(f.tam==0||f.tam>=11?4:0));const br=$("bin").getBoundingClientRect();flyCoins(br.left+br.width/2,br.top+br.height/2,v,0);S.coins+=v;$("coins").textContent=S.coins;undoOffer(f,v);floatText(br.left+br.width/2,br.top,"+"+v);buzz(15);S.ds.earn+=v;
S.fruits=S.fruits.filter(x=>x!=f);sel=null;showInfo(null);save();renderTable();renderCounter();renderMarket()}
function deliver(f,i,ox,oy){const c=S.cust[i];
if(!c.reqs.every(r=>meets(f,r))){f.x=ox;f.y=oy;renderTable();c.mood="sad";renderCounter();SFX.bad();buzz(120);{const ce=document.querySelector(`.cust[data-i="${i}"] .bub`);if(ce){const r=ce.getBoundingClientRect();floatText(r.left+r.width/2,r.top+20,"✗","#ff5a4e")}}setTimeout(()=>{if(S.cust[i]==c){c.mood=null;renderCounter()}},1200);return toast(`${c.name}: "Não foi isso que eu pedi..."`)}
const cb=comboHit(),bonus=cb>=2?Math.round(pay(c)*Math.min(.5,(cb-1)*.1)):0,v=pay(c)+bonus,L0=level();const ce=document.querySelector(`.cust[data-i="${i}"] .bub`).getBoundingClientRect();flyCoins(ce.left+ce.width/2,ce.top+ce.height/2,v,v);floatText(ce.left+ce.width/2,ce.top+10,"+"+v);if(cb>=2)setTimeout(()=>floatText(ce.left+ce.width/2,ce.top+40,`COMBO x${cb}!`,"#ff8ad8"),250);buzz([20,40,30]);
S.delivered++;S.ds.served++;if(c.vip)rec("vips",1);tutDone("t2");gainEss(c.vip?3:1);S.ds.earn+=v;S.ds.best=Math.max(S.ds.best,v);S.fruits=S.fruits.filter(x=>x!=f);sel=null;showInfo(null);c.mood="happy";renderTable();renderCounter();renderMarket();
toast(`${c.name} adorou! <b>+${v}</b> moedas${level()>L0?`<br><b>NÍVEL ${level()}!</b>${newUnlock(level())}`:""}`);if(level()>L0){SFX.lvl();shake(5);buzz([40,60,40,60,80])}
{const first=!(S.rec&&S.rec.gifts),n=c.vip?2:(first||Math.random()<.35)?1:0;for(let g=0;g<n;g++)setTimeout(()=>giveItem(rollItem(),ce.left+ce.width/2,ce.top+ce.height/2,c.name),600+g*700);if(n)rec("gifts",n)}
setTimeout(()=>{c.leaving=true;renderCounter();setTimeout(()=>{S.cust[i]=null;renderCounter();setTimeout(()=>{if(running&&!S.cust[i]){S.cust[i]=newCust();save();renderCounter()}},700)},700)},900)}
function newUnlock(L){const u=[];const extra={2:"Clientes pedem frutas MINI e ENORMES",3:"Pedidos de FOGO e clientes VIP",4:"Pedidos de GELO e cores raras",5:"Microscópicas, Gigantescas e SUPER-FRUTAS"}[L];
return (u.length?"<br>Nova na feira: "+u.join(", "):"")+(extra?"<br>"+extra:"")}
/* ================= info / feira ================= */
function showInfo(f){const p=$("info");if(!f){p.classList.remove("on");return}if(S.tut&&S.tut.t2)tutDone("t3");
const tw=(v,a,b)=>v>=8?"muito "+a:v>=6?a:v<=2?"nada "+a:v<=4?"pouco "+a:"",st=(l,v,c,w)=>`<div class="st"><span>${l}</span>${cells(i=>i<=v,c)}<b style="white-space:nowrap">${v}${w?` <small style="font-weight:400;opacity:.75">${w}</small>`:""}</b></div>`;
const tamTxt=f.tam==0?`<div class="st"><span>Tamanho</span><b>MICROSCÓPICA</b></div>`:f.tam>=11?`<div class="st"><span>Tamanho</span>${cells(()=>1,"#3fa7e0")}<b>${f.tam}!</b></div>`:st("Tamanho",f.tam,"#3fa7e0");
p.innerHTML=`<span class="x" onclick="sel=null;showInfo(null);renderCounter();renderTable()">X</span><img src="${fruitImg(f)}"><div style="flex:1"><div class="t">${fname(f)}</div>
<div class="g">${f.gen?"Geração "+f.gen:"Da feira"} · cor ${colorName(f.rgb)} · ${sizeName(f.tam)}${f.mut?'<span class="chip" style="background:#7b5cff">MUTANTE</span>':""}${f.el?`<span class="chip" style="background:${ELEM[f.el].c}">${ELEM[f.el].n.toUpperCase()}</span>`:""}${f.hero?'<span class="chip" style="background:#d63031">SUPER</span>':""}${f.shiny?'<span class="chip" style="background:linear-gradient(90deg,#ff8ad8,#ffe84a,#8af0ff);color:#2a1a12">BRILHANTE</span>':""}</div>
${st("Doce",f.doce,"#ff5f9e",tw(f.doce,"doce"))}${st("Azedo",f.az,"#9ccc2e",tw(f.az,"azeda"))}${tamTxt}${S.pot.length==1&&!S.pot.includes(f)?`<div style="font-size:.68rem;margin-top:4px;background:#e4dbff;padding:3px 5px"><b>PREVISÃO</b> com ${fname(S.pot[0])}:<br>${predict(f,S.pot[0])}</div>`:""}</div>`;p.classList.add("on")}
const POT=(c)=>art(["..kk..","..kk..",".gggg.","gccccg","gcwccg","gccccg",".gggg."],{k:"#8a5a34",g:"#cfe6ee",c,w:"#ffffff"},"#2a1a12");
const ITEMS={
bag:{img:()=>art(["..kk..",".k..k.","bbbbbb","bbybbb","bbbbbb",".bbbb."],{k:"#6b4423",b:"#b07040",y:"#f7c331"},"#2a1a12")},
grow:{n:"Poção Gigante",short:()=>"Gigante",d:"+3 de tamanho (até 12). Morango gigante? Pode!",img:()=>POT("#4fd06a"),w:10,go:f=>{f.tam=Math.min(12,f.tam+3)}},
shrink:{n:"Poção Minúscula",short:()=>"Minúscula",d:"-3 de tamanho (até 0). Melancia de bolso!",img:()=>POT("#9b6bff"),w:10,go:f=>{f.tam=Math.max(0,f.tam-3)}},
sweet:{n:"Mel Encantado",short:()=>"Mel",d:"+3 de doçura",img:()=>art([".kkk.","yyyyy","yywyy","yyyyy",".yyy."],{k:"#8a5a34",y:"#f7c331",w:"#fff3a0"},"#6b4a10"),w:8,go:f=>{f.doce=Math.min(10,f.doce+3)}},
sour:{n:"Gota Azeda",short:()=>"Azeda",d:"+3 de acidez",img:()=>art(["..y..",".yyy.","yywyy","yyyyy",".yyy."],{y:"#d6e84a",w:"#f5ffc0"},"#5a6a10"),w:8,go:f=>{f.az=Math.min(10,f.az+3)}},
paint:{n:"Tinta Mágica",short:v=>v,d:"Pinta a fruta de outra cor",img:v=>art(["kkkkk","k...k","ccccc","ccwcc",".ccc."],{k:"#8a8a98",c:hex(COLORS[v]||COLORS.rosa),w:"#ffffff"},"#2a1a12"),w:8,go:(f,v)=>{f.rgb=COLORS[v].slice()},vals:Object.keys(COLORS)},
fogo:{n:"Pena de Fênix",short:()=>"Fênix",d:"A fruta pega FOGO",img:()=>art(["...r","..ro",".roy","roy.","oy..","y..."],{r:"#c0392b",o:"#f39c12",y:"#f7dc6f"},"#7a1a10"),w:4,go:f=>{if(f.el&&f.el!="fogo")f.hero=true;f.el="fogo"}},
gelo:{n:"Cristal Eterno",short:()=>"Cristal",d:"A fruta vira GELO",img:()=>art(["..w..",".wbw.","wbbbw",".wbw.","..w.."],{w:"#e8f8ff",b:"#5bc0eb"},"#2a6a8a"),w:4,go:f=>{if(f.el&&f.el!="gelo")f.hero=true;f.el="gelo"}},
raio:{n:"Raio na Garrafa",short:()=>"Raio",d:"A fruta ganha RAIO",img:()=>POT("#ffe84a"),w:4,go:f=>{if(f.el&&f.el!="raio")f.hero=true;f.el="raio"}},
hero:{n:"Capa Heroica",short:()=>"Capa",d:"Vira SUPER-FRUTA",img:()=>art(["..m..","rrmrr","rrrrr","rr.rr","r...r"],{m:"#1a1a2a",r:"#d63031"},"#5a1010"),w:2,go:f=>{f.hero=true;f.cape=f.cape||R(["#d63031","#2d6cdf","#8e44ad","#16a085","#f39c12"])}},
shiny:{n:"Pó de Estrela",short:()=>"Estrela",d:"Deixa a fruta BRILHANTE",img:()=>art(["..y..","..y..","yywyy","..y..","..y.."],{y:"#ffe84a",w:"#ffffff"},"#8a6a00"),w:2,go:f=>{f.shiny=true}},
brush:{n:"Pincel Doido",short:()=>"Pincel",d:"Troca a estampa por uma maluca",img:()=>art(["....kk","...kk.","..kk..",".bb...","bbb...","bb...."],{k:"#8a5a34",b:"#ff5f9e"},"#2a1a12"),w:6,go:f=>{f.pat=R(["marble","spots","stripes","seeds","blush","hatch"]);f.rgb2=COLORS[R(Object.keys(COLORS))].slice()}},
morph:{n:"Molde Maluco",short:()=>"Molde",d:"Deforma a fruta num formato novo",img:()=>art(["ppp..","p.ppp","ppp.p","..ppp"],{p:"#b48cff"},"#4a2a8a"),w:5,go:f=>{const other={shape:R(["heart","banana","oval","round","kidney","tall","cluster"])};f.mask=morph(f,other);f.shape="mix"}}};
function rollItem(){const ks=Object.keys(ITEMS).filter(k=>ITEMS[k].w),tot=ks.reduce((s,k)=>s+ITEMS[k].w,0);let r=Math.random()*tot;for(const k of ks){if((r-=ITEMS[k].w)<0){const it={t:k};if(ITEMS[k].vals)it.v=R(ITEMS[k].vals);return it}}return{t:"grow"}}
function giveItem(it,x,y,from){S.bag=S.bag||[];S.bag.push(it);save();const I=ITEMS[it.t],im=document.createElement("img");im.src=I.img(it.v);im.style.cssText=`position:fixed;left:${x}px;top:${y}px;width:36px;height:36px;z-index:130;image-rendering:pixelated;pointer-events:none`;document.body.appendChild(im);
const bt=$("bagtab")||$("market"),r=bt.getBoundingClientRect();im.animate([{transform:"translate(-50%,-50%) scale(.5)"},{transform:"translate(-50%,-140%) scale(1.4)",offset:.3},{transform:`translate(${r.left+r.width/2-x-18}px,${r.top+r.height/2-y-18}px) scale(.6)`}],{duration:1100,easing:"ease-in"}).onfinish=()=>{im.remove();renderMarket();const b=$("bagtab");if(b){b.classList.remove("got");void b.offsetWidth;b.classList.add("got")}};
setTimeout(()=>{toast(`<b>PRESENTE${from?" de "+from:""}!</b><br>${I.n}${it.v?" ("+it.v+")":""}`);SFX.dex();buzz([20,30,20])},500)}
function armItem(k){armed=armed==k?null:k;renderMarket();const tip=$("armtip");if(armed){const it=(S.bag||[]).find(x=>x.t+(x.v||"")==armed),I=ITEMS[it.t];tip.innerHTML=`${I.n}${it.v?" ("+it.v+")":""}: ${I.d}<br><span style="font-weight:400">Toque numa fruta da mesa pra usar · toque de novo pra cancelar</span>`;tip.classList.add("on");tbl.classList.add("arming")}else{tip.classList.remove("on");tbl.classList.remove("arming")}}
function useItem(f){const idx=(S.bag||[]).findIndex(x=>x.t+(x.v||"")==armed);if(idx<0){armItem(null);return}const it=S.bag[idx],I=ITEMS[it.t];
const before=JSON.stringify([f.tam,f.doce,f.az,f.rgb,f.el,f.hero,f.shiny,f.pat,f.mask]);const old={...f,sp:f.sp},s0=fsize(f);I.go(f,it.v);{const s1=fsize(f);f.x-=(s1-s0)/2;f.y-=(s1-s0)/2}
if(JSON.stringify([f.tam,f.doce,f.az,f.rgb,f.el,f.hero,f.shiny,f.pat,f.mask])==before){toast("Não mudou nada nessa fruta. Tente outra!");return}
S.bag.splice(idx,1);f.mod=true;if(!S.bag.some(x=>x.t+(x.v||"")==armed))armItem(null);else renderMarket();
const el=tbl.querySelector(`[data-id="${f.id}"]`),r=el?el.getBoundingClientRect():{left:200,top:400,width:0,height:0};clampPos(f);rec("items",1);
treeAdd(f,[old]);if(f.shiny)rec("shiny",1);save();renderTable(f.id);showInfo(f);renderCounter();
burst(r.left+r.width/2,r.top+r.height/2,f.rgb,26);SFX.mut();shake(3);buzz([30,20,50]);toast(`<b>${I.n}!</b> ${fname(f)}`)}
let mkTab="feira",armed=null;
function bagCount(){return (S.bag||[]).length}
function renderMarket(){const L=level();const tabs=`<div class="mk tabk ${mkTab=="feira"?"on":""}" onclick="mkTab='feira';armed=null;renderMarket()"><b>FEIRA</b></div><div class="mk tabk ${mkTab=="bolsa"?"on":""}" id="bagtab" onclick="mkTab='bolsa';renderMarket()"><img src="${ITEMS.bag.img()}" style="width:28px;height:28px"><b>BOLSA</b>${bagCount()?`<span class="cnt2">${bagCount()}</span>`:""}</div>`;
if(mkTab=="bolsa"){const groups={};(S.bag||[]).forEach(it=>{const k=it.t+(it.v||"");(groups[k]=groups[k]||{it,n:0}).n++});const gs=Object.values(groups);
 $("market").innerHTML=tabs+(gs.length?gs.map(({it,n})=>{const I=ITEMS[it.t],k=it.t+(it.v||"");return `<div class="mk px itm ${armed==k?"arm":""}" onclick="armItem('${k}')"><img src="${I.img(it.v)}">${I.short(it.v)}<div class="pr">x${n}</div></div>`}).join(""):`<div style="color:#ffe9b8;font-size:.75rem;padding:8px;align-self:center">Vazia. Clientes dão <b>presentes</b> quando você entrega!</div>`);return}
$("market").innerHTML=tabs+BASE.map((b,i)=>{const f={shape:b[1],pat:b[2],top:b[3],rgb:typeof b[4]=="string"?COLORS[b[4]]:b[4],tip:b[0]=="Banana"?"#6b4423":b[0]=="Pimenta-Dragão"?"#3f9a3a":null};const lock=false,rare=!!b[10];
return `<div class="mk px ${lock?"lock":S.coins<b[8]?"off":""} ${rare&&!lock?"rare":""}" onclick="buy(${i})"><img src="${fruitImg(f)}">${lock?"???":b[0]}<div class="pr">${lock?"NÍVEL "+b[9]:`<span class="coin"></span>${b[8]}`}</div></div>`}).join("")}
function buy(i){const b=BASE[i];if(S.coins<b[8])return toast("Moedas insuficientes");S.coins-=b[8];const f=baseFruit(b);
{const pr=$("pot"),pw={x:pr.offsetLeft,y:pr.offsetTop,w:pr.offsetWidth,h:pr.offsetHeight};let k=0;do{f.x=N(10,Math.max(10,tbl.clientWidth-110));f.y=N(10,Math.max(10,tbl.clientHeight-110));k++}while(k<30&&f.x+fsize(f)>pw.x&&f.x<pw.x+pw.w&&f.y+fsize(f)>pw.y&&f.y<pw.y+pw.h)}clampPos(f);S.fruits.push(f);dexCheck(f);SFX.buy();save();$("coins").textContent=S.coins;renderTable(f.id);renderMarket()}
/* ================= cenário ================= */
const JAR=["cccccc","cccccc",".gggg.","gjjjjg","gwjjjg","gwjjjg","gjjjjg","gjjjjg",".gggg."];
const PLANT=["....l..l....","..l.ll.l.l..","...lLLll....",".l.lLllLl.l.","..lLLllLLl..","...lLllLl...",".....ll.....","..pppppppp..","..pPPPPPPp..","...pppppp...","...pppppp...","....pppp...."];
const REG=["...dddddd.....","...dwwwwd.....","...dddddd.....","....dd........",".mmmmmmmmmmmm.",".mkkmkkmkkmmm.",".mmmmmmmmmmmm.","bbbbbbbbbbbbbb","bBBBBBBBBBBBBb","bbbbbbbbbbbbbb"];
const CLOCK=[".www.","wwkww","wwkkw","wwwww",".www."];
/* ================= cenário em pixel art (2 pixels de tela por pixel de arte, igual aos clientes) ================= */
function srand(seed){let s=seed;return()=>{s=(s*16807)%2147483647;return s/2147483647}}
function cvs(w,h){const c=document.createElement("canvas");c.width=w;c.height=h;const g=c.getContext("2d");g.imageSmoothingEnabled=false;return[c,g]}
function px(g,x,y,c,w=1,h=1){g.fillStyle=c;g.fillRect(x,y,w,h)}
function spr(g,rows,pal,x0,y0){rows.forEach((r,y)=>[...r].forEach((ch,x)=>{if(pal[ch])px(g,x0+x,y0+y,pal[ch])}))}
// janelas: posições em pixels de arte [x,y,largura,altura]
let WINS=[];
function winLayout(W){if(W*2>=600){const ww=46,wh=34;return [[Math.round(W/3)-ww/2,28,ww,wh],[Math.round(W*2/3)-ww/2,28,ww,wh]]}return [[Math.round(W*.22)-17,18,34,20],[Math.round(W*.78)-17,18,34,20]]}
function curtainImg(h,flip){const w=7,[c,g]=cvs(w,h+5);for(let y=0;y<h+5;y++){const ww=y<4?w:Math.max(3,w-Math.floor((y-4)/(h/4.5)));for(let i=0;i<ww;i++){const xx=flip?w-1-i:i;px(g,xx,y,(i+Math.floor(y/2))%3==0?"#b8323a":i==ww-1?"#e0606a":"#d64550")}}return c.toDataURL()}
const CLOUD=()=>art(["....wwww......","..wwwwwwww....",".wwwwwwwwwwww.","wwwwwwwwwwwwww",".ssssssssssss."],{w:"#ffffff",s:"#d8dce6"},"#a8b0c0");
function buildWall(W,H){const[c,g]=cvs(W,H),rnd=srand(7),T=H-140;
 // tábuas verticais
 for(let x=0;x<W;x+=12){const tone=[[222,190,140],[214,181,131],[228,198,150],[218,186,136]][(x/12)%4];
  for(let y=0;y<H;y++)for(let i=0;i<12;i++){let col=tone;if(i==0)col=mul(tone,.78);else if(i==1)col=lift(tone,.18);else if(i==11)col=mul(tone,.9);px(g,x+i,y,hex(col))}
  for(let k=0;k<6;k++){const gx=x+2+Math.floor(rnd()*9),gy=Math.floor(rnd()*H),gl=4+Math.floor(rnd()*10);for(let j=0;j<gl;j++)px(g,gx,gy+j,hex(mul(tone,.88)))}
  [20,58].forEach(ny=>{px(g,x+5,ny,"#7a5a3a");px(g,x+6,ny,"#5a3e26");px(g,x+5,ny-1,"#c8a878")})}
 // rodapé (lambri) abaixo da prateleira
 const wy=106+T;for(let y=wy;y<H;y++)for(let x=0;x<W;x++){const b=[176,122,74];let col=y==wy?lift(b,.25):y==wy+1?mul(b,.7):(x%24==0?mul(b,.75):x%24==1?lift(b,.12):b);px(g,x,y,hex(col))}
 // prateleira
 const sy=94+T;for(let x=0;x<W;x++){px(g,x,sy,"#d39a62");px(g,x,sy+1,"#b47a46");px(g,x,sy+2,"#9b6438");px(g,x,sy+3,"#6b4423");px(g,x,sy+4,"#00000030")}
 for(let x=10;x<W;x+=Math.max(60,Math.round(W/4))){spr(g,["kk","kk",".k",".k"],{k:"#6b4423"},x,sy+4)}
 // janelas com moldura, cruzeta e cortinas (vidro transparente pro céu aparecer atrás)
 WINS=winLayout(W);
 WINS.forEach(([wx,wy,ww,wh])=>{
  for(let y=-3;y<wh+3;y++)for(let x=-3;x<ww+3;x++){const edge=x<0||y<0||x>=ww||y>=wh;if(edge)px(g,wx+x,wy+y,y>=wh?"#8a5a34":(x<0||y<0?(x==-3||y==-3?"#5a3e26":"#9b6a3e"):"#6b4423"))}
  g.clearRect(wx,wy,ww,wh);const mx=wx+Math.floor(ww/2)-1,my=wy+Math.floor(wh/2)-1;px(g,mx,wy,"#6b4423",2,wh);px(g,wx,my,"#6b4423",ww,2);px(g,mx,wy,"#9b6a3e",1,wh);px(g,wx,my,"#9b6a3e",ww,1);
  px(g,wx-5,wy+wh+2,"#d39a62",ww+10,1);px(g,wx-5,wy+wh+3,"#8a5a34",ww+10,2);px(g,wx-5,wy+wh+5,"#00000030",ww+10,1);
  for(let x=-6;x<ww+6;x++){px(g,wx+x,wy-6,"#6b4423");px(g,wx+x,wy-5,"#9b6a3e")}});

 // itens da prateleira: potes, caixote com frutas, balança, vaso
 const jam=[[214,48,49],[243,140,32],[118,56,150],[247,205,55],[106,176,58],[247,143,179]];let x=4,k=0;
 while(x<W-16){const kind=k%5;
  if(kind==0||kind==2){const j=hex(jam[k%jam.length]),jd=hex(mul(jam[k%jam.length],.75)),lid=k%2?"#c0392b":"#e9e2d0";spr(g,[".llllll.",".llllll.","gggggggg","gjjjjjjg","gwjjjjjg","gwjjjjdg","gjppppdg","gjppppdg","gjjjjddg",".gggggg."],{l:lid,g:"#cfe6ee",j,d:jd,w:"#ffffff",p:"#f5efe0"},x,sy-10);x+=12}
  else if(kind==1){spr(g,["cccccccccccc","cbbbbbbbbbbc","cccccccccccc","cbbbbbbbbbbc","cccccccccccc"],{c:"#8a5a34",b:"#b47a46"},x,sy-5);
   ["#d63031","#f7c331","#5fb33a","#e67e22"].forEach((f,i)=>{spr(g,[".ff.","ffff","ffff",".ff."],{f},x+1+i*3-(i>1?0:0),sy-8-(i%2))});x+=16}
  else if(kind==3){spr(g,["..kk..","kkkkkk","kgggkk","kgggkk",".kkkk.","..kk..","kkkkkk"],{k:"#5a5a66",g:"#9aa0ad"},x,sy-7);x+=10}
  else{spr(g,["..l.l..",".lLlLl.","lLllLll",".lLlLl.","..ppp..",".ppppp.",".pPPPp."],{l:"#5fb33a",L:"#2f7a2a",p:"#c0603a",P:"#e07a4a"},x,sy-7);x+=11}
  x+=6+Math.floor(srand(k+3)()*10);k++}
 return c.toDataURL()}
function buildAwning(W){const H=16,[c,g]=cvs(W,H);for(let x=0;x<W;x++){const red=Math.floor(x/12)%2==0,b=red?[200,52,52]:[245,239,224];
 for(let y=0;y<11;y++){let col=y==0?mul(b,.7):y<3?lift(b,.15):y>8?mul(b,.85):b;if((x%12)==0)col=mul(col,.85);px(g,x,y,hex(col))}
 const xi=x%12,depth=Math.round(Math.sin(xi/12*Math.PI)*4);for(let y=11;y<11+depth;y++)px(g,x,y,hex(y==10+depth?mul(b,.7):mul(b,.92)))}
 for(let x=0;x<W;x++)px(g,x,0,"#2a1a12");return c.toDataURL()}
function buildCounter(W){const H=13,[c,g]=cvs(W,H);for(let x=0;x<W;x++){px(g,x,0,"#2a1a12");px(g,x,1,"#e0a870");px(g,x,2,"#c58a55");px(g,x,3,"#a86a3d");px(g,x,4,"#6b4423");
 for(let y=5;y<H;y++){const pl=Math.floor(x/16)%2?[150,92,52]:[140,86,48];let col=x%16==0?mul(pl,.7):x%16==1?lift(pl,.15):pl;if(y==5)col=mul(col,.75);px(g,x,y,hex(col))}}
 for(let x=8;x<W;x+=16){px(g,x,8,"#5a3e26");px(g,x,11,"#5a3e26")}return c.toDataURL()}
function buildTableTile(){const W=60,H=40,[c,g]=cvs(W,H),rnd=srand(11);
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const row=Math.floor(y/10),b=[[184,121,74],[176,114,68],[190,126,78],[172,110,64]][row],iy=y%10;let col=iy==0?mul(b,.62):iy==1?lift(b,.16):iy==9?mul(b,.86):b;px(g,x,y,hex(col))}
 for(let k=0;k<26;k++){const gy=Math.floor(rnd()*H),gx=Math.floor(rnd()*W),gl=5+Math.floor(rnd()*14);if(gy%10<2)continue;for(let j=0;j<gl;j++)px(g,(gx+j)%W,gy,"#00000016")}
 [[14,5],[44,26]].forEach(([kx,ky])=>{spr(g,[".kk.","kddk",".kk."],{k:"#8a5230",d:"#6b3e22"},kx,ky)});
 [[0,10],[30,20],[18,30]].forEach(([sx,sy])=>{px(g,sx,sy,"#00000040",1,10)});return c.toDataURL()}
const PLANT2=["......l..l......","...l..ll.l..l...","....llLLll.l....","..l.lLllLlll.l..",".lllLllLLllLll..","..lLLlllLLllL...","...lLLllLLll....","....lLlLLlL.....","......llll......","...pppppppppp...","...PPPPPPPPPP...","....pppppppp....","....pppppppp....","....pppppppp....",".....pppppp....."];
const REG2=["....dddddddd........","....dwwwwwwd........","....dwgwgwwd........","....dddddddd........","......dddd..........","..mmmmmmmmmmmmmmmm..",".mkkmkkmkkmkkmmmmmm.",".mmmmmmmmmmmmmmmmmm.",".mkkmkkmkkmkkmyyyym.","bbbbbbbbbbbbbbbbbbbb","bBBBBBBBBBBBBBBBBBBb","bBBBBBBkkkkBBBBBBBBb","bbbbbbbbbbbbbbbbbbbb"];
function renderProps(){const sc=$("scene"),Wd=sc.clientWidth,W=Math.ceil(Wd/2),H=Math.max(140,Math.round(sc.clientHeight/2));
 let h="";const wall=buildWall(W,H);
 const cl_=CLOUD();WINS.forEach(([wx,wy,ww,wh],i)=>{const W2=ww*2,H2=wh*2,big=ww>30,rnd=srand(i+5);let st="";for(let k=0;k<(big?16:8);k++)st+=`<span style="left:${Math.floor(rnd()*W2)}px;top:${Math.floor(rnd()*H2*.8)}px;animation-delay:-${(rnd()*2).toFixed(2)}s"></span>`;
 let cds="";for(let k=0;k<3;k++)cds+=`<span class="cld" style="top:${Math.round(4+k*H2*.25)}px;width:${big?36:24}px;height:${big?13:9}px;background-image:url(${cl_});--ww:${W2+40}px;animation-duration:${22+k*9}s;animation-delay:-${k*8}s"></span>`;
 h+=`<div class="win ${big?"big":""}" id="win${i+1}" style="left:${wx*2}px;top:${wy*2}px;width:${W2}px;height:${H2}px"><div class="stars">${st}</div>${cds}<div class="sun" id="sun${i+1}"></div><div class="wfx"></div></div>`;
 const ci=curtainImg(wh,false),cf=curtainImg(wh,true),cw=14;h+=`<img class="curt" src="${ci}" style="left:${wx*2-6}px;top:${wy*2-8}px;width:${cw}px;height:${(wh+5)*2}px;animation-delay:-${i*3}s"><img class="curt r" src="${cf}" style="left:${wx*2+W2-cw+6}px;top:${wy*2-8}px;width:${cw}px;height:${(wh+5)*2}px;animation-delay:-${i*3+1.5}s">`});
 h+=`<img id="clockimg" style="left:${Wd/2-18}px;top:34px;width:36px;height:36px;z-index:2"><span id="wxtag"></span>`;
 h+=`<img src="${wall}" style="left:0;top:0;width:${W*2}px;height:${H*2}px">`;
 h+=`<img src="${buildAwning(W)}" style="left:0;top:0;width:${W*2}px;height:32px;z-index:2">`;
 $("props").innerHTML=h;
 $("counter").style.background=`url(${buildCounter(W)}) 0 0/${W*2}px 26px no-repeat`;
 $("table").style.backgroundImage=`url(${buildTableTile()})`;
 $("cprops").innerHTML=`<img src="${art(PLANT2,{l:"#6cc04a",L:"#2f7a2a",p:"#c0603a",P:"#e8875a"})}" style="left:2px;bottom:0;width:36px;height:34px"><img src="${art(REG2,{d:"#3a3a44",w:"#9be7a6",g:"#5ec27a",m:"#c9c9d1",k:"#6a6a78",b:"#7a7a88",B:"#5a5a66",y:"#f7c331"})}" style="right:2px;bottom:0;width:44px;height:30px">`;
 updateSky();drawClock()}
/* ================= caldeirão ================= */
let brewing=false;
function potImg(col){const PW=24,PH=22,g=blank(PW,PH),L=hex(lift(col,.45)),B=hex(col),D=hex(mul(col,.75));const body=ell(12,13,10.5,7.5);
for(let y=0;y<PH;y++)for(let x=0;x<PW;x++){if(body(x,y)&&y>=7)g[y][x]=sk("cap")?(x<7?"#ffe27a":x>17?"#a87b00":"#e0b020"):(x<7?"#5d5d6e":x>17?"#26262e":"#3c3c48");
if(y>=4&&y<=7&&ell(12,6.4,8.6,1.8)(x,y))g[y][x]=(x+y)%4==0?L:x>15?D:B;
if((y==7||y==8)&&x>=1&&x<=22)g[y][x]=y==7?"#6e6e80":"#4a4a58";
if(y>=20&&(x==5||x==6||x==17||x==18))g[y][x]="#26262e"}
[[8,3],[13,2],[15,4],[10,1]].forEach(([x,y])=>g[y][x]=L);g[9][4]=g[10][4]="#8a8aa0";return toImg(PW,PH,g,"#1a1a20")}
function renderPot(){const p=S.pot;const col=p.length?p.reduce((a,f)=>a.map((x,i)=>x+f.rgb[i]/p.length),[0,0,0]):[123,92,255];
$("potimg").src=potImg(col);$("pot").style.setProperty("--lq",hex(col));$("potslots").innerHTML=(sk("c3")?[0,1,2]:[0,1]).map(i=>`<div class="sl">${p[i]?`<img src="${fruitImg(p[i])}">`:""}</div>`).join("")}
function addToPot(f){buzz(20);S.pot.push(f);S.fruits=S.fruits.filter(x=>x!=f);sel=null;showInfo(null);save();renderTable();renderCounter();renderPot();SFX.plop();
const r=$("potimg").getBoundingClientRect();burst(r.left+r.width/2,r.top+18,f.rgb,10);
if(S.pot.length<2)return toast("Coloque mais uma fruta no caldeirão");
if(sk("c3")&&S.pot.length==2)return toast("Coloque a 3ª fruta ou toque no caldeirão pra misturar");
brew()}
function brew(){brewing=true;$("pot").classList.add("brew");toast("Misturando...");SFX.brew();
setTimeout(()=>{$("pot").classList.remove("brew");const ing=S.pot;S.pot=[];brewing=false;
const make=()=>{let c=cross(ing[0],ing[1]);if(ing[2]){c=cross(c,ing[2]);c.gen=Math.max(...ing.map(x=>x.gen))+1}return c};
rec("crosses",1);const kids=[make()];if(sk("c2")&&Math.random()<.2)kids.push(make());
kids.forEach((c,ki)=>{gainEss(1+(c.mut?2:0)+(c.hero?3:0));
const tr=tbl.getBoundingClientRect(),pr=$("pot").getBoundingClientRect();c.x=pr.right-tr.left+8+ki*70;c.y=pr.top-tr.top-fsize(c)/3-ki*20;clampPos(c);
S.fruits.push(c);sel=c.id;treeAdd(c,ing);if(c.shiny)rec("shiny",1);tutDone("t1");save();renderTable(c.id);renderPot();renderCounter();showInfo(c);
const er=tbl.querySelector(`[data-id="${c.id}"]`).getBoundingClientRect(),ex=er.left+er.width/2,ey=er.top+er.height/2;burst(ex,ey,c.rgb,24);
if(c.mut||c.hero||c.shiny){burst(ex,ey,[180,155,255],18);SFX.mut();shake(c.hero?7:4);buzz([40,30,80])}else{SFX.pop();buzz(35)}if(c.el=="fogo")SFX.fire();
toast((kids.length>1?"<b>GÊMEOS!</b> ":"")+(c.hero?`<b>SUPER-FRUTA!</b> ${fname(c)}`:c.mut?`<b>MUTAÇÃO!</b> ${fname(c)}`:`Nasceu: <b>${fname(c)}</b>`))})},sk("c1")?550:1100)}
function potTap(){if(brewing||!S.pot.length||modalOpen)return;if(S.pot.length>=2)return brew();const f=S.pot.pop();const tr=tbl.getBoundingClientRect(),pr=$("pot").getBoundingClientRect();f.x=pr.right-tr.left+8;f.y=pr.top-tr.top;clampPos(f);S.fruits.push(f);save();renderTable(f.id);renderPot()}
function placePot(){const p=$("pot");if(!S.potPos)return;const w=p.offsetWidth,h=p.offsetHeight;S.potPos.x=cl(S.potPos.x,0,Math.max(0,tbl.clientWidth-w));S.potPos.y=cl(S.potPos.y,0,Math.max(0,tbl.clientHeight-h));p.style.left=S.potPos.x+"px";p.style.top=S.potPos.y+"px";p.style.bottom="auto"}
(()=>{const p=$("pot");let sx,sy,ox,oy,on=false,mv=false;
p.addEventListener("pointerdown",e=>{if(modalOpen)return;e.preventDefault();p.setPointerCapture(e.pointerId);sx=e.clientX;sy=e.clientY;ox=p.offsetLeft;oy=p.offsetTop;on=true;mv=false});
p.addEventListener("pointermove",e=>{if(!on)return;const dx=e.clientX-sx,dy=e.clientY-sy;if(!mv&&Math.abs(dx)+Math.abs(dy)<6)return;if(!mv){mv=true;p.classList.add("mv")}
S.potPos={x:ox+dx,y:oy+dy};placePot()});
const up=()=>{if(!on)return;on=false;p.classList.remove("mv");if(mv){save();return}potTap()};p.addEventListener("pointerup",up);p.addEventListener("pointercancel",up)})();
/* ================= efeitos ================= */
function burst(x,y,rgb,n){for(let i=0;i<n;i++){const d=document.createElement("div");d.className="pt";d.style.background=i%3==0?"#ffffff":hex(i%2?rgb:lift(rgb,.4));d.style.left=x+"px";d.style.top=y+"px";document.body.appendChild(d);
const a=Math.random()*Math.PI*2,r=28+Math.random()*50;d.animate([{transform:"translate(0,0)",opacity:1},{transform:`translate(${Math.cos(a)*r}px,${Math.sin(a)*r-18}px)`,opacity:0}],{duration:600+Math.random()*300,easing:"steps(6)"}).onfinish=()=>d.remove()}}
let undoT=null;function undoOffer(f,v){const u=$("undo");clearTimeout(undoT);u.innerHTML=`Vendida por ${v} <button class="btn" id="undob">DESFAZER</button><i></i>`;u.classList.remove("on");void u.offsetWidth;u.classList.add("on");
$("undob").onclick=()=>{clearTimeout(undoT);u.classList.remove("on");if(S.fruits.includes(f))return;S.coins=Math.max(0,S.coins-v);S.ds.earn-=v;S.fruits.push(f);clampPos(f);save();hud();renderTable(f.id);renderMarket();SFX.plop();toast("Venda desfeita!")};
undoT=setTimeout(()=>u.classList.remove("on"),3200)}
function tidy(){const pr=$("pot"),br=$("bin"),tw=tbl.clientWidth,th=tbl.clientHeight;const blocks=[[pr.offsetLeft-6,pr.offsetTop-6,pr.offsetWidth+12,pr.offsetHeight+12],[br.offsetLeft-6,br.offsetTop-6,br.offsetWidth+12,br.offsetHeight+12],[tw-90,0,90,34]];
const hit=(x,y,s)=>blocks.some(([bx,by,bw,bh])=>x<bx+bw&&x+s>bx&&y<by+bh&&y+s>by);
const list=S.fruits.slice().sort((a,b)=>(a.sp||"").localeCompare(b.sp||"")||a.gen-b.gen);let x=8,y=8,rowH=0;
list.forEach(f=>{const s=fsize(f);let guard=0;while(guard++<200){if(x+s>tw-4){x=8;y+=rowH+6;rowH=0}if(y+s>th-4){y=th-s-4;break}if(!hit(x,y,s))break;x+=10}
f.x=x;f.y=y;x+=s+6;rowH=Math.max(rowH,s)});save();renderTable();SFX.plop();buzz(15)}
$("tidy").onclick=tidy;
function buzz(p){if(!CFG.vib)return;try{if(navigator.vibrate)navigator.vibrate(p)}catch(e){}}
function floatText(x,y,t,c){const d=document.createElement("div");d.className="ftx";d.textContent=t;d.style.left=x+"px";d.style.top=y+"px";d.style.color=c||"#f7c331";document.body.appendChild(d);
d.animate([{transform:"translate(-50%,-50%) scale(.6)",opacity:0},{transform:"translate(-50%,-90%) scale(1.15)",opacity:1,offset:.25},{transform:"translate(-50%,-260%) scale(1)",opacity:0}],{duration:1100,easing:"steps(10)"}).onfinish=()=>d.remove()}
function shake(n){const a=document.body.animate([{transform:"translate(0,0)"},{transform:`translate(${n}px,${-n/2}px)`},{transform:`translate(${-n}px,${n/2}px)`},{transform:`translate(${n/2}px,${n}px)`},{transform:"translate(0,0)"}],{duration:320,easing:"steps(4)"})}
let combo=0,comboT=0;const COMBO_WIN=25000;
function comboHit(){combo=now()-comboT<COMBO_WIN?combo+1:1;comboT=now();renderCombo();rec("maxCombo",combo,1);return combo}
function rec(k,v,isMax){S.rec=S.rec||{};if(isMax)S.rec[k]=Math.max(S.rec[k]||0,v);else S.rec[k]=(S.rec[k]||0)+v;checkAch()}
const ACH=[["cross10","Aprendiz de alquimista","Cruze 10 frutas",()=>S.rec.crosses>=10,10],["cross50","Alquimista","Cruze 50 frutas",()=>S.rec.crosses>=50,30],["cross200","Mestre do caldeirão","Cruze 200 frutas",()=>S.rec.crosses>=200,100],
["del10","Quitandeiro","Atenda 10 clientes",()=>S.delivered>=10,10],["del50","Freguesia fiel","Atenda 50 clientes",()=>S.delivered>=50,40],["del200","Lenda da feira","Atenda 200 clientes",()=>S.delivered>=200,120],
["sp10","Curioso","Descubra 10 espécies",()=>Object.keys(S.tree||{}).length>=10,15],["sp30","Naturalista","Descubra 30 espécies",()=>Object.keys(S.tree||{}).length>=30,40],["sp100","Árvore infinita","Descubra 100 espécies",()=>Object.keys(S.tree||{}).length>=100,150],
["micro","Microscópio","Crie uma fruta Microscópica",()=>spAny(k=>k.startsWith("Microscópica")),20],["giga","Titã","Crie uma fruta Gigantesca",()=>spAny(k=>k.startsWith("Gigantesca")),20],
["super","Herói da feira","Crie uma super-fruta",()=>spAny(k=>k.endsWith("|S")),30],["shiny","Brilho raro","Encontre uma fruta brilhante",()=>(S.rec.shiny||0)>=1,25],
["leg","Lendária!","Descubra uma espécie Lendária",()=>Object.values(S.tree||{}).some(t=>stars(t)>=5),60],["vip5","Clientela VIP","Atenda 5 VIPs",()=>(S.rec.vips||0)>=5,30],
["combo5","Combo x5","Faça um combo de 5 entregas",()=>(S.rec.maxCombo||0)>=5,25],["day100","Dia de ouro","Lucre 100 moedas num dia",()=>(S.rec.bestDay||0)>=100,30],["item10","Cientista maluco","Use 10 artefatos",()=>(S.rec.items||0)>=10,30]];
const TROPHY=()=>art(["y.yyy.y","yyyyyyy",".yyyyy.","..yyy..","...y...","..yyy..",".ddddd."],{y:"#f7c331",d:"#a87b00"},"#6b4a10");
const spAny=fn=>Object.keys(S.tree||{}).some(fn);
function checkAch(){S.ach=S.ach||{};S.rec=S.rec||{};ACH.forEach(([id,n,d,ok,rw])=>{if(S.ach[id]||!ok())return;S.ach[id]=Date.now();S.coins+=rw;save();
 setTimeout(()=>{toast(`<img src="${TROPHY()}" style="width:18px;height:18px;display:inline-block;vertical-align:-3px;image-rendering:pixelated"> <b>CONQUISTA!</b> ${n}<br>+${rw} moedas`);SFX.lvl();buzz([30,40,30]);hud()},1600)})}
function renderCombo(){const e=$("combo");if(!e)return;const left=combo>=2?1-(now()-comboT)/COMBO_WIN:0;if(left<=0){e.classList.remove("on");if(left<=0&&combo>=2&&now()-comboT>=COMBO_WIN)combo=0;return}
if(!e.classList.contains("on")){e.classList.add("on")}e.innerHTML=`COMBO x${combo}<i style="width:${Math.max(0,left*100)}%"></i>`}
function flyCoins(x,y,n,total){const t=$("hudcoin").getBoundingClientRect(),k=cl(n,1,10);let done=false;
for(let i=0;i<k;i++)setTimeout(()=>{const d=document.createElement("div");d.className="fc";d.style.left=x+"px";d.style.top=y+"px";document.body.appendChild(d);
d.animate([{transform:"translate(0,0)"},{transform:`translate(${(Math.random()-.5)*50}px,${-24-Math.random()*24}px)`,offset:.3},{transform:`translate(${t.left-x}px,${t.top-y}px)`}],{duration:750,easing:"ease-in"}).onfinish=()=>{d.remove();if(i%3==0)SFX.coin();
if(i==k-1&&!done){done=true;S.coins+=total;$("coins").textContent=S.coins;const tg=$("cointag");tg.classList.remove("bump");void tg.offsetWidth;tg.classList.add("bump");save();renderMarket()}}},i*60)}
/* ================= som (chiptune) ================= */
let AC=null,muted=false;try{muted=localStorage.getItem("frutodromo_mute")=="1"}catch(e){}
function unlockAudio(){const a=ac();if(!a||unlockAudio.ok)return;try{const b=a.createBuffer(1,1,22050),src=a.createBufferSource();src.buffer=b;src.connect(a.destination);src.start(0)}catch(e){}
 if(a.state=="running")unlockAudio.ok=1;else a.resume().then(()=>{unlockAudio.ok=1}).catch(()=>{})}
try{if(navigator.audioSession)navigator.audioSession.type="playback"}catch(e){}
["touchend","click","keydown"].forEach(ev=>document.addEventListener(ev,unlockAudio,{capture:true,passive:true}));
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&AC&&AC.state!="running"){unlockAudio.ok=0;AC.resume().catch(()=>{})}});
function ac(){try{if(!AC)AC=new(window.AudioContext||window.webkitAudioContext)();if(AC.state!="running")AC.resume().catch(()=>{})}catch(e){}return AC}
function tone(f,d,type="square",vol=.05,when=0,slide=0,music){if(muted||!AC)return;vol*=(music?CFG.mus:CFG.sfx)/100*(music?1.4:1.2);if(vol<=0.0002)return;try{const a=AC,t=a.currentTime+when,o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(slide)o.frequency.linearRampToValueAtTime(Math.max(30,f+slide),t+d);
g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+d+.03)}catch(e){}}
const SFX={plop:()=>tone(330,.14,"square",.06,0,-180),brew:()=>{for(let i=0;i<8;i++)tone(180+Math.random()*320,.08,"triangle",.06,i*.12)},pop:()=>{tone(523,.08);tone(784,.14,"square",.05,.08)},
coin:()=>{tone(988,.05,"square",.035);tone(1319,.1,"square",.035,.05)},bad:()=>tone(150,.28,"sawtooth",.05,0,-40),lvl:()=>[523,659,784,1047].forEach((f,i)=>tone(f,.13,"square",.05,i*.1)),
mut:()=>[392,523,659,784,1047,1319].forEach((f,i)=>tone(f,.08,"square",.045,i*.06)),dex:()=>{tone(880,.1,"triangle",.08);tone(1175,.2,"triangle",.08,.1)},
day:()=>[784,659,523,659,784,1047].forEach((f,i)=>tone(f,.16,"square",.05,i*.14)),buy:()=>tone(660,.06,"square",.04),
sel:()=>{tone(1047,.035,"square",.035);tone(1568,.05,"square",.03,.035)},
open:()=>[523,659,784,1047].forEach((f,i)=>tone(f,.06,"square",.035,i*.035)),
close:()=>[988,784,587].forEach((f,i)=>tone(f,.05,"square",.03,i*.035)),fire:()=>tone(110,.35,"sawtooth",.03,0,240)};
const MEL=[523,0,659,0,784,659,523,0,587,0,698,0,880,698,587,0,523,0,659,784,880,0,784,659,587,523,0,587,659,0,0,0],BAS=[131,131,196,196,175,175,147,196];let step=0;
setInterval(()=>{if(muted||!running||modalOpen||!AC)return;const n=MEL[step%MEL.length];if(n)tone(n,.16,"square",.014,0,0,1);if(step%4==0)tone(BAS[(step/4|0)%BAS.length],.32,"triangle",.04,0,0,1);step++},190);
function sndLabel(){const b=$("sndb");if(b)b.textContent=muted?"SOM: DESLIGADO":"SOM: LIGADO"}
function toggleSnd(){muted=!muted;try{localStorage.setItem("frutodromo_mute",muted?"1":"0")}catch(e){}ac();sndLabel()}
/* ================= dias ================= */
const fmt=ms=>{const s=Math.max(0,Math.ceil(ms/1000));return Math.floor(s/60)+":"+String(s%60).padStart(2,"0")};
function drawClock(){const im=$("clockimg");if(!im)return;const[c,g]=cvs(18,18),d=new Date(),h=d.getHours()%12+d.getMinutes()/60,m=d.getMinutes();
 for(let y=0;y<18;y++)for(let x=0;x<18;x++){const r=Math.hypot(x-8.5,y-8.5);if(r<=8.6)px(g,x,y,r>7.6?"#5a3e26":r>6.8?"#8a5a34":"#f5efe0")}
 for(let k=0;k<12;k++){const a=k/12*Math.PI*2;px(g,Math.round(8.5+Math.sin(a)*5.6),Math.round(8.5-Math.cos(a)*5.6),k%3==0?"#2a1a12":"#b8a888")}
 const hand=(ang,len,col)=>{for(let t=0;t<=len;t+=.5)px(g,Math.round(8.5+Math.sin(ang)*t),Math.round(8.5-Math.cos(ang)*t),col)};
 hand(h/12*Math.PI*2,3.8,"#2a1a12");hand(m/60*Math.PI*2,5.6,"#c0392b");px(g,8,8,"#2a1a12",2,2);im.src=c.toDataURL();
 im.title=d.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}
setInterval(drawClock,20000);
const WX={ok:false};
const hrsOf=iso=>{const t=(iso||"").split("T")[1]||"";const[a,b]=t.split(":").map(Number);return isNaN(a)?null:a+(b||0)/60};
const isRain=c=>(c>=51&&c<=67)||(c>=80&&c<=82)||c>=95,isSnow=c=>(c>=71&&c<=77)||c==85||c==86,isFog=c=>c==45||c==48;
async function fetchWX(){if(!CFG.wx||!CFG.loc)return;try{const[la,lo]=CFG.loc;
 const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${la}&longitude=${lo}&current=temperature_2m,weather_code,is_day,cloud_cover,precipitation,wind_gusts_10m&daily=sunrise,sunset&timezone=auto&forecast_days=1`);
 const j=await r.json(),c=j.current;Object.assign(WX,{ok:true,code:c.weather_code,isDay:c.is_day,temp:Math.round(c.temperature_2m),cloud:c.cloud_cover,precip:c.precipitation,gust:c.wind_gusts_10m,sr:hrsOf(j.daily.sunrise[0]),ss:hrsOf(j.daily.sunset[0])});
 updateSky();checkAlerts()}catch(e){WX.ok=false}}
setInterval(fetchWX,20*60000);
function askWeather(next){if(CFG.wx!==undefined||!navigator.geolocation){next&&next();return}
 openModal(`<h2>CLIMA DE VERDADE?</h2><p>A janela da quitanda pode mostrar o <b>tempo real da sua cidade</b>: sol, nuvens, chuva e noite. Se vier tempo perigoso, o jogo te avisa.</p><p style="font-size:.78rem;opacity:.8">Usa sua localização aproximada só pra buscar a previsão (Open-Meteo). Nada é guardado fora do seu aparelho.</p><button class="big" id="wxy">SIM, MOSTRAR</button><br><button class="big alt" id="wxn">AGORA NÃO</button>`);
 $("wxn").onclick=()=>{CFG.wx=false;saveCfg();closeModal();next&&next()};
 $("wxy").onclick=()=>{closeModal();next&&next();try{navigator.geolocation.getCurrentPosition(p=>{CFG.loc=[+p.coords.latitude.toFixed(1),+p.coords.longitude.toFixed(1)];CFG.wx=true;saveCfg();fetchWX()},()=>{CFG.wx=false;saveCfg();toast("Sem localização: a janela mostra só a hora do dia")},{timeout:10000,maximumAge:3600000})}catch(e){CFG.wx=false;saveCfg()}}}
function checkAlerts(){if(!WX.ok)return;const al=[];
 if(WX.code>=95)al.push(["TEMPESTADE COM RAIOS","Há tempestade com raios na sua região agora.","Fique em local fechado, longe de janelas, árvores e postes. Evite usar aparelhos ligados na tomada."]);
 if(WX.precip>=10||[65,67,82].includes(WX.code))al.push(["CHUVA FORTE","Está chovendo forte na sua região.","Cuidado com alagamentos e enxurradas. Nunca atravesse ruas ou rios alagados."]);
 if(WX.temp>=36)al.push(["CALOR EXTREMO",`A temperatura está em ${WX.temp}°C.`,"Beba bastante água, evite sol forte entre 10h e 16h e cuide de crianças, idosos e animais."]);
 if(WX.temp<=3)al.push(["FRIO INTENSO",`A temperatura está em ${WX.temp}°C.`,"Agasalhe-se bem e proteja pessoas em situação de rua, idosos e animais."]);
 if(WX.gust>=70)al.push(["VENTOS FORTES",`Rajadas de até ${Math.round(WX.gust)} km/h.`,"Fique longe de árvores, placas e estruturas soltas."]);
 if(!al.length)return;const key=al.map(a=>a[0]).join()+new Date().toDateString()+new Date().getHours();if(CFG.lastAlert==key)return;CFG.lastAlert=key;saveCfg();
 const show=()=>{if(modalOpen){setTimeout(show,3000);return}SFX.bad();buzz([200,100,200]);openModal(`<h2 style="color:#c0392b">AVISO DO TEMPO</h2>${al.map(([t,a,b])=>`<div class="cg" style="border-color:#c0392b;background:#ffe6e0"><div style="text-align:left"><b>${t}</b><br>${a}<br><span style="font-size:.8rem">${b}</span></div></div>`).join("")}
 <p style="font-size:.72rem;opacity:.8">Baseado na previsão do Open-Meteo pra sua região. <b>Não é um alerta oficial.</b> Pra avisos oficiais, acompanhe a <b>Defesa Civil (ligue 199)</b> e o <b>INMET</b>.</p><button class="big" id="cl">ENTENDI</button>`);$("cl").onclick=closeModal};show()}
function realH(){const d=new Date();return d.getHours()+d.getMinutes()/60}
function wxState(){const h=realH(),sr=WX.ok&&WX.sr!=null?WX.sr:6,ss=WX.ok&&WX.ss!=null?WX.ss:18;let ph=h<sr-.6||h>ss+.6?"night":h<sr+.8?"dawn":h>ss-.8?"dusk":"day";
 let w="sun";if(WX.ok){const c=WX.code;w=c>=95?"storm":isSnow(c)?"snow":isRain(c)?"rain":isFog(c)?"fog":WX.cloud>=70||c==3?"cloud":WX.cloud>=30||c==2?"few":"sun"}
 const f=CFG.wxForce||"auto";if(f!="auto"){({sol:()=>{w="sun";ph="day"},nublado:()=>{w="cloud";ph="day"},chuva:()=>{w="rain";ph="day"},tempestade:()=>{w="storm";ph="day"},estrelada:()=>{w="sun";ph="night"},noitechuva:()=>{w="rain";ph="night"},entardecer:()=>{w="few";ph="dusk"}})[f]()}
 return{ph,w,frac:cl((h-sr)/Math.max(1,ss-sr),0,1)}}
function updateSky(){const sk=$("sky");if(!sk)return;const{ph,w,frac}=wxState(),night=ph=="night";
 const grey=["cloud","rain","storm","fog","snow"].includes(w);
 let skyC={night:[22,24,58],dawn:[250,176,128],dusk:[240,138,92],day:[118,192,244]}[ph];if(grey)skyC=night?[38,40,52]:skyC.map((v,i)=>Math.round(v*.35+[156,162,172][i]*.65));if(w=="storm")skyC=skyC.map(v=>v*.7);
 sk.style.background=grey&&!night?"#e6e6ee":{night:"#a4a2d4",dawn:"#ffe6d0",dusk:"#ffd8bc",day:"#ffffff"}[ph];$("lamp").style.opacity=night?.8:ph=="dusk"||w=="storm"?.4:0;
 [1,2].forEach(n=>{const el=$("win"+n),e=$("sun"+n);if(!el||!e)return;el.style.background=hex(skyC);
  const cls={night,starry:night&&!grey,rain:w=="rain"||w=="storm",storm:w=="storm",snow:w=="snow",fog:w=="fog",cloudy:grey,few:w=="few"};Object.entries(cls).forEach(([k,v])=>el.classList.toggle(k,!!v));
  const W2=el.clientWidth,H2=el.clientHeight;e.style.display=grey?"none":"";e.style.background=night?"#f5efe0":ph=="day"?"#ffe84a":"#ffb347";e.style.boxShadow=night?"inset -3px 0 0 #c8c0a8":ph=="day"?"0 0 0 2px #fff6a0":"none";
  e.style.left=(night?W2-16:Math.round(4+frac*(W2-14)))+"px";e.style.top=(night?5:Math.round(H2*.62-Math.sin(frac*Math.PI)*H2*.5))+"px"});
 const t=$("wxtag");if(t){if(WX.ok){t.textContent=WX.temp+"°";t.style.display=""}else t.style.display="none"}}
function settings(back){const sl=(id,lab,v)=>`<div style="display:flex;align-items:center;gap:8px;margin:8px 0;text-align:left"><span style="width:80px">${lab}</span><input type="range" id="${id}" min="0" max="100" value="${v}" style="flex:1;accent-color:#3ca55c"><b id="${id}v" style="width:34px">${v}</b></div>`;
const tg=(id,lab,on,desc)=>`<div class="cg" style="cursor:pointer" id="${id}"><span class="big-sw" style="width:26px;height:26px;background:${on?"#3ca55c":"#c9b99a"}"></span><div style="flex:1"><b>${lab}: ${on?"LIGADO":"DESLIGADO"}</b><br><span style="font-size:.72rem">${desc}</span></div></div>`;
openModal(`<h2>AJUSTES</h2>${sl("smus","Música",CFG.mus)}${sl("ssfx","Efeitos",CFG.sfx)}
${tg("svib","Vibração",CFG.vib,"Vibra o celular ao cruzar, entregar e descobrir")}
${tg("szen","Modo Zen",CFG.zen,"Sem relógio e sem pressa: o dia não acaba e os clientes esperam pra sempre")}${tg("swx","Clima real na janela",!!CFG.wx,"Mostra o tempo da sua cidade e avisa sobre tempo perigoso")}
<div style="text-align:left;margin:8px 0"><b>Ver clima na janela:</b><div class="flt" style="border:2px solid #2a1a12;margin-top:4px;flex-wrap:wrap">${[["auto","Automático"],["sol","Sol"],["nublado","Nublado"],["chuva","Chuva"],["tempestade","Tempestade"],["entardecer","Entardecer"],["estrelada","Noite estrelada"],["noitechuva","Noite chuvosa"]].map(([k,l])=>`<span class="${(CFG.wxForce||"auto")==k?"on":""}" onclick="CFG.wxForce='${k}';saveCfg();updateSky();settings()">${l}</span>`).join("")}</div></div>
<button class="big alt" id="stut">REVER TUTORIAL</button><br><button class="big alt" id="sexp">EXPORTAR PROGRESSO</button><button class="big alt" id="simp">IMPORTAR</button><br><button class="big" id="cl">PRONTO</button>`);
["smus","ssfx"].forEach(id=>{$(id).oninput=e=>{const v=+e.target.value;$(id+"v").textContent=v;if(id=="smus")CFG.mus=v;else{CFG.sfx=v;SFX.coin()}saveCfg()}});
$("svib").onclick=()=>{CFG.vib=!CFG.vib;saveCfg();buzz(40);settings(back)};$("szen").onclick=()=>{CFG.zen=!CFG.zen;saveCfg();hud();renderCounter();settings(back)};$("swx").onclick=()=>{if(CFG.wx){CFG.wx=false;WX.ok=false;saveCfg();updateSky();settings(back)}else{delete CFG.wx;saveCfg();closeModal();askWeather(()=>settings(back))}};
$("stut").onclick=()=>{S.tut={};save();closeModal();tutStep()};
$("sexp").onclick=()=>{save();const code="FRUTO1:"+btoa(unescape(encodeURIComponent(JSON.stringify(S))));
 openModal(`<h2>SEU CÓDIGO</h2><p style="font-size:.8rem">Guarde esse código (num bloco de notas ou mande pra você mesmo). Ele leva tudo: frutas, espécies, cartas e conquistas.</p><textarea id="bk" readonly style="width:100%;height:140px;font-size:.6rem;font-family:monospace">${code}</textarea><button class="big" id="bkc">COPIAR</button><button class="big alt" id="cl">VOLTAR</button>`);
 $("bkc").onclick=async()=>{try{await navigator.clipboard.writeText(code);toast("Código copiado!")}catch(e){$("bk").select();toast("Selecionei o código. Copie manualmente.")}};$("cl").onclick=()=>settings(back)};
$("simp").onclick=()=>{openModal(`<h2>IMPORTAR</h2><p style="font-size:.8rem">Cole o código do seu progresso. Isso <b>substitui</b> o jogo atual deste aparelho.</p><textarea id="bk" style="width:100%;height:140px;font-size:.6rem;font-family:monospace"></textarea><button class="big" id="bki">CARREGAR</button><button class="big alt" id="cl">VOLTAR</button>`);
 $("cl").onclick=()=>settings(back);$("bki").onclick=()=>{try{const v=$("bk").value.trim();if(!v.startsWith("FRUTO1:"))throw 0;const d=JSON.parse(decodeURIComponent(escape(atob(v.slice(7)))));if(!d.fruits||!d.tree)throw 0;
  S=d;S.pot=S.pot||[];save();closeModal();running=false;renderAll();placePot();toast("Progresso carregado!");startScreen()}catch(e){toast("Código inválido. Confira se copiou inteiro.")}}};$("cl").onclick=()=>{closeModal();if(back)back()}}
const TUT=[["pot","Arraste <b>duas frutas</b> até o <b>caldeirão</b> pra criar uma nova!","t1"],["cust","Agora arraste uma fruta até o <b>cliente</b> que pediu algo parecido. Toque no <b>?</b> do balão se precisar da receita.","t2"],["dexb","Toque numa fruta pra ver os atributos. Na <b>ÁRVORE</b> ficam todas as espécies que você descobriu!","t3"]];
function tutStep(){S.tut=S.tut||{};const st=TUT.find(t=>!S.tut[t[2]]);const box=$("tut");if(!st||modalOpen||!running){box.classList.remove("on");return}
if(box.dataset.k==st[2]&&box.classList.contains("on"))return;box.dataset.k=st[2];
const tg=st[0]=="cust"?document.querySelector(".cust .pw"):$(st[0]);if(!tg)return;const r=tg.getBoundingClientRect();
box.innerHTML=st[1]+`<br><button class="btn" onclick="S.tut['${st[2]}']=1;save();$('tut').classList.remove('on');setTimeout(tutStep,400)">ENTENDI</button><span class="ar"></span>`;box.classList.add("on");
const bw=box.offsetWidth,bh=box.offsetHeight,ar=box.querySelector(".ar");let x=cl(r.left+r.width/2-bw/2,6,innerWidth-bw-6),y;
if(r.top>bh+20){y=r.top-bh-12;ar.style.cssText=`left:${r.left+r.width/2-x-9}px;bottom:-18px;border-top-color:#2a1a12`}else{y=r.bottom+12;ar.style.cssText=`left:${r.left+r.width/2-x-9}px;top:-18px;border-bottom-color:#2a1a12`}
box.style.left=x+"px";box.style.top=y+"px"}
function tutDone(k){S.tut=S.tut||{};if(!S.tut[k]){S.tut[k]=1;save();$("tut").classList.remove("on");setTimeout(tutStep,900)}}
function hud(){updateSky();$("coins").textContent=S.coins;const rem=dayLen()-S.dayT;$("day").textContent=`D${S.day} · NV${level()} · ${CFG.zen?"ZEN ∞":running?fmt(rem):"--:--"}`;$("day").classList.toggle("low",running&&!CFG.zen&&rem<20000)}
function startDay(){setTimeout(tutStep,2500);running=true;S.started=true;S.cust.forEach((c,i)=>{if(!c)setTimeout(()=>{if(running&&!S.cust[i]){S.cust[i]=newCust();save();renderCounter()}},300+i*1400)});renderCounter();hud()}
function endDay(){running=false;rec("bestDay",S.ds.earn,1);SFX.day();S.cust.forEach(c=>{if(c)c.leaving=true});renderCounter();
setTimeout(()=>{S.cust=[null,null,null];renderCounter();save();showSummary()},900)}
function showSummary(){const d=S.ds;openModal(`<h2>FIM DO DIA ${S.day}</h2><div class="row">${[...S.fruits].sort((a,b)=>b.gen-a.gen).slice(0,3).map(f=>`<img src="${fruitImg(f)}">`).join("")}</div>
<div class="sum"><span>Lucro do dia</span><b>${d.earn} moedas</b><span>Clientes atendidos</span><b>${d.served}</b><span>Maior pagamento</span><b>${d.best}</b><span>Novas espécies</span><b>${d.dex}</b><span>Nível</span><b>${level()}</b></div>
<p style="font-size:.85rem">+1 <b>presente da quitanda</b> pra começar o próximo dia!</p><p>${d.served>=6?"Dia incrível! A quitanda está famosa.":d.served>=3?"Bom dia de trabalho!":"Dia fraco... amanhã é outro dia!"}</p><button class="big" id="nextd">ABRIR DIA ${S.day+1}</button>`);
$("nextd").onclick=()=>{setTimeout(()=>giveItem(rollItem(),innerWidth/2,innerHeight/2,"da quitanda"),600);S.day++;S.dayT=0;S.ds={earn:0,served:0,best:0,dex:0};save();closeModal();startDay()}}
/* ================= modais ================= */
function openModal(h){if(!$("modal").classList.contains("on"))SFX.open();modalOpen=true;$("mbox").innerHTML=h;$("modal").classList.add("on")}
function closeModal(){if($("modal").classList.contains("on"))SFX.close();modalOpen=$("tv").classList.contains("on")||$("rv").classList.contains("on");$("modal").classList.remove("on")}
function rainFruits(on){document.querySelectorAll(".fall").forEach(e=>e.remove());if(!on)return;
for(let i=0;i<12;i++){const b=BASE[i%8],f={shape:b[1],pat:b[2],top:b[3],rgb:COLORS[b[4]],tip:b[0]=="Banana"?"#6b4423":null},im=document.createElement("img");im.className="fall";im.src=fruitImg(f);
im.style.left=(Math.random()*95)+"vw";im.style.animationDuration=(5+Math.random()*6)+"s";im.style.animationDelay=(-Math.random()*10)+"s";im.style.width=im.style.height=(30+Math.random()*30)+"px";document.body.appendChild(im)}}
function startScreen(){rainFruits(true);const demo=[{shape:"heart",pat:"seeds",top:"leaf",rgb:COLORS.vermelha},{shape:"round",pat:"stripes",top:"stem",rgb:[243,140,32],hero:true,cape:"#2d6cdf"},{shape:"tall",pat:"hatch",top:"crown",rgb:COLORS.amarela}];
const cont=S.started;let armed=false;
openModal(`<div class="logo">FRUTÓDROMO</div><p style="margin-top:0">A quitanda das frutas que a natureza não teve coragem de criar</p><div class="row">${demo.map(f=>`<img src="${fruitImg(f)}">`).join("")}</div>
<p style="font-size:.8rem;text-align:left">• Jogue 2 frutas no <b>caldeirão</b> pra criar híbridos<br>• <b>Parecidos se intensificam</b>: pequena + pequena encolhe, grande + grande cresce, doce + doce fica mais doce<br>• Entregue o que os clientes pedem nos balões<br>• Clientes dão <b>presentes mágicos</b>: poções, tintas, penas de fênix... use na fruta que quiser (aba <b>BOLSA</b>)<br>• Expanda a <b>Árvore de Espécies</b>: cada combinação nova vira uma espécie, e ela não tem fim</p>
<button class="big" id="go">${cont?"CONTINUAR · DIA "+S.day:"ABRIR A QUITANDA"}</button><br><button class="big alt" id="sndb" onclick="toggleSnd()"></button><button class="big alt" onclick="settings(startScreen)">AJUSTES</button>${cont?'<button class="big alt" id="newg">NOVO JOGO</button>':""}`);sndLabel();
$("go").onclick=()=>{ac();rainFruits(false);closeModal();const go=()=>{if(!running)startDay()};askWeather(go)};
if(cont)$("newg").onclick=e=>{if(!armed){armed=true;e.target.textContent="TOQUE DE NOVO PRA APAGAR TUDO";return}fresh();S.fruits.forEach(f=>dexCheck(f,true));const pe=$("pot");pe.style.left="10px";pe.style.top="";pe.style.bottom="8px";save();sel=null;showInfo(null);ac();rainFruits(false);closeModal();renderAll();startDay()}}
function gainEss(){}
const HELLO={person:["Olá! ","Oi, tudo bem? ","Boa tarde! ","E aí! "],cat:["Miau... ","Mrrr... "],dog:["Au au! ","Oi oi oi! "],bear:["Hmm... ","Grrr, oi! "],bunny:["Oi oi! ","Hihi! "],frog:["Croac! "],penguin:["Brrr! "],robot:["BIP-BOP. SOLICITAÇÃO: "],alien:["Saudações, terráqueo. "],ghost:["Buuu... "]};
function sayReq(r){const[w,n]=reqWord(r);return r.k=="cor"?"da cor "+w.toLowerCase():r.k=="el"?"de "+w:r.k=="hero"?"SUPER-FRUTA":w.toLowerCase()+(n?` (${n})`:"")}
function showPortrait(i){const c=S.cust[i];if(!c||c.leaving)return;const left=leftOf(c),mood=c.mood||(left<.2?"sad":"ok");
const parts=c.reqs.map(sayReq).filter(Boolean),last=parts.length>1?parts.slice(0,-1).join(", ")+" e "+parts[parts.length-1]:parts[0]||"especial";
const hi=R(HELLO[c.kind||"person"]||HELLO.person),tail=c.kind=="robot"?" FIM DA TRANSMISSÃO.":left<.2?" E rápido, por favor!":c.vip?" Pago bem, viu?":"";
const txt=`${hi}Quero uma fruta ${last}.${tail}`;
openModal(`<h2>${c.name}${c.vip?' <span style="background:#d4a017;color:#2a1a12;font-size:.7rem;padding:1px 5px">VIP</span>':""}</h2><div class="prt"><img src="${personImg(c,mood)}"></div><div class="say" id="sayt"></div>
<div style="display:flex;align-items:center;justify-content:center;gap:6px;font-weight:700"><span class="coin"></span>${pay(c)} moedas</div><button class="big" id="phint">COMO FAZER?</button><button class="big alt" id="cl">FECHAR</button>`);
$("cl").onclick=closeModal;$("phint").onclick=()=>{closeModal();showHint(i)};
let n=0;const el=$("sayt"),tick=()=>{if(!el.isConnected)return;el.textContent=txt.slice(0,++n);if(n%3==0)tone(c.kind=="robot"?880:c.kind=="ghost"?300:520+Math.random()*120,.03,"square",.02);if(n<txt.length)setTimeout(tick,22)};tick()}
function predict(a,b){const e=elOut(a,b),t=inh(a.tam,b.tam,12);return `Doce ${inh(a.doce,b.doce,10)} · Azedo ${inh(a.az,b.az,10)} · ${sizeName(t)} (${t}) · cor ${colorName(a.rgb.map((x,i)=>(x+b.rgb[i])/2))}${e.el?" · "+ELEM[e.el].n:""}${e.hero?" · <b>SUPER!</b>":""}`}
/* ================= guia de cores ================= */
const CORDER=["vermelha","laranja","amarela","verde","azul","roxa","marrom","cinza","rosa","branca"];
function colorGuideHTML(hi){const L=level(),rep={};
BASE.forEach(b=>{const c=typeof b[4]=="string"?b[4]:colorName(b[4]);const cur=rep[c];if(!cur||(b[9]<cur[9]))rep[c]=b});
const img=b=>`<img src="${fruitImg({shape:b[1],pat:b[2],top:b[3],rgb:COLORS[b[4]],tip:b[0]=="Banana"?"#6b4423":b[0]=="Pimenta-Dragão"?"#3f9a3a":null})}">`;
const recipes={};const cols=Object.keys(rep);
cols.forEach((a,i)=>cols.slice(i).forEach(b=>{const r=colorName(COLORS[a].map((x,k)=>(x+COLORS[b][k])/2));(recipes[r]=recipes[r]||[]).push([a,b])}));
const have=new Set(Object.keys(S.tree||{}).map(k=>k.split("|")[1]));let h=`<div class="cgw"><p style="font-size:.8rem;margin-top:0">A cor do filho é a <b>mistura das cores dos pais</b>, como tinta. Híbridos podem ser misturados de novo pra chegar em outras cores.</p>`;
CORDER.forEach(c=>{const rs=(recipes[c]||[]).filter(([a,b])=>a!=b||rep[a]).sort((x,y)=>(x[0]==x[1])-(y[0]==y[1])).slice(0,4);
const lock=b=>b[9]>L?` <i style="opacity:.6">(nível ${b[9]})</i>`:"";
let body;if(MUT_ONLY.includes(c))body=`<div style="white-space:normal">Só por <b>mutação</b>: chance pequena ao cruzar qualquer fruta</div>`;
else body=rs.map(([a,b])=>a==b?`<span>${img(rep[a])}${rep[a][0]}${lock(rep[a])}</span>`:`<span>${img(rep[a])}<span class="mini-sw" style="background:${hex(COLORS[a])}"></span>+${img(rep[b])}<span class="mini-sw" style="background:${hex(COLORS[b])}"></span>${lock(rep[a])}${lock(rep[b])}</span>`).join("")||"<span>—</span>";
h+=`<div class="cg ${hi==c?"hi":""}" id="cg-${c}"><span class="big-sw" style="background:${hex(COLORS[c])}"></span><span class="nm2">${c.toUpperCase()}${have.has(c)?"<br><span style='font-size:.6rem;color:#3ca55c'>✔ já tem</span>":""}</span><div class="rcp">${body}</div></div>`});
return h+"</div>"}
function colorGuide(hi){openTree("cores",hi)}
function reveal(k,shinyOnly){SFX.mut();showCard(k,true,shinyOnly)}
function cardFrame(g,st,col,shiny){const px=(x,y,c,s=4)=>{g.fillStyle=c;g.fillRect(x,y,s,s)};
if(shiny){const rb=["#ff8ad8","#ffe84a","#8af0ff","#b48cff"];for(let i=0;i<300;i+=6){g.fillStyle=rb[(i/6|0)%4];g.fillRect(i,6,6,8);g.fillRect(i,406,6,8)}for(let i=0;i<420;i+=6){g.fillStyle=rb[(i/6|0)%4];g.fillRect(6,i,8,6);g.fillRect(286,i,8,6)}}
if(st>=4){const gem=st>=5?"#e74c3c":"#8af0ff",gold=st>=5?"#f7c331":"#c9a7ff",dk=st>=5?"#a87b00":"#6a3fd0";
 [[6,6,1,1],[294,6,-1,1],[6,414,1,-1],[294,414,-1,-1]].forEach(([x,y,sx,sy])=>{for(let i=0;i<7;i++){px(x+sx*i*4-(sx<0?4:0),y+sy*0-(sy<0?4:0),gold);px(x-(sx<0?4:0),y+sy*i*4-(sy<0?4:0),gold)}
  px(x+sx*4-(sx<0?4:0),y+sy*4-(sy<0?4:0),gem,8);px(x+sx*8-(sx<0?4:0),y+sy*8-(sy<0?4:0),dk)});
 if(st>=5)for(let x=110;x<=190;x+=8){px(x,2,"#f7c331");if((x/8|0)%2)px(x,-2,"#ffe27a")}}
if(st==3)[[18,18],[278,18],[18,398],[278,398]].forEach(([x,y])=>{px(x,y,col);px(x+4,y+4,"#fff")})}
function cardCanvas(k){const t=S.tree[k],st=stars(t),[lab,col]=RAR[st],c=document.createElement("canvas");c.width=300;c.height=420;const g=c.getContext("2d");g.imageSmoothingEnabled=false;
g.fillStyle="#2a1a12";g.fillRect(0,0,300,420);g.fillStyle=col;g.fillRect(6,6,288,408);g.fillStyle="#f5efe0";g.fillRect(14,14,272,392);
for(let i=0;i<24;i++){g.fillStyle=i%2?hex(lift(hexToRgb(col),.75)):"#efe4cf";g.beginPath();g.moveTo(150,150);g.arc(150,150,260,i*Math.PI/12,(i+1)*Math.PI/12);g.fill()}
g.fillStyle="#f5efe0";g.fillRect(14,262,272,144);g.fillStyle="#2a1a12";g.fillRect(14,258,272,4);
cardFrame(g,st,col,t.shiny);
return new Promise(res=>{const im=new Image();im.onload=()=>{g.drawImage(im,60,40,180,180);
g.fillStyle="#2a1a12";g.font="bold 18px 'Pixelify Sans',monospace";g.textAlign="center";g.fillText(`nº ${t.n} · ${t.name}`.slice(0,26),150,32);
g.font="bold 22px 'Pixelify Sans',monospace";g.fillStyle=col;g.fillText("★".repeat(st)+"☆".repeat(5-st),150,248);
g.textAlign="left";g.fillStyle="#2a1a12";g.font="14px 'Pixelify Sans',monospace";const ls=[lab+(t.shiny?" · BRILHANTE ✦":""),spLabel(k),`Doce ${t.st.doce} · Azedo ${t.st.az} · Tamanho ${t.st.tam}`,`Geração ${t.d} · Dia ${t.day||S.day}`];
ls.forEach((l,i)=>{g.font=(i==0?"bold ":"")+(i==1?"12px":"14px")+" 'Pixelify Sans',monospace";let y=284+i*24;g.fillText(l.slice(0,36),26,y)});
g.font="bold 10px 'Pixelify Sans',monospace";g.fillStyle="#8a6a50";g.textAlign="center";g.fillText("FRUTÓDROMO · mendesoz.github.io/frutodromo",150,396);res(c)};im.src=fruitImg(t.img)})}
async function showCard(k,isNew,shinyOnly){const c=await cardCanvas(k),url=c.toDataURL("image/png"),t=S.tree[k];
openModal(`<h2>${isNew?(shinyOnly?"✦ VERSÃO BRILHANTE!":"NOVA ESPÉCIE!"):"CARTA DA ESPÉCIE"}</h2><img id="cardimg" class="${isNew?"cin":""}" src="${url}">
<button class="big" id="cdl">BAIXAR</button><button class="big" id="csh">COMPARTILHAR</button><br><button class="big alt" id="cl">${isNew?"CONTINUAR":"FECHAR"}</button>`);
if(isNew)setTimeout(()=>{const r=$("cardimg").getBoundingClientRect();burst(r.left+r.width/2,r.top+r.height*.35,t.img.rgb,30);burst(r.left+r.width/2,r.top+r.height*.35,[255,240,160],16)},450);
$("cl").onclick=closeModal;
$("cdl").onclick=()=>{if(window.self!==window.top)return toast("Aqui não dá pra baixar. Faça um print, ou abra mendesoz.github.io/frutodromo");try{const a=document.createElement("a");a.href=url;a.download=`frutodromo-especie-${t.n}.png`;document.body.appendChild(a);a.click();a.remove();toast("Carta baixada!")}catch(e){toast("Não deu pra baixar aqui. Faça um print!")}};
$("csh").onclick=async()=>{try{const blob=await (await fetch(url)).blob(),file=new File([blob],`frutodromo-${t.n}.png`,{type:"image/png"});
if(navigator.canShare&&navigator.canShare({files:[file]}))await navigator.share({files:[file],title:"Frutódromo",text:`Olha a fruta que eu descobri no Frutódromo: ${t.name}! mendesoz.github.io/frutodromo`});
else{await navigator.clipboard.writeText(`Olha a fruta que eu descobri no Frutódromo: ${t.name} (${spLabel(k)})! mendesoz.github.io/frutodromo`);toast("Texto copiado! Cole junto com o print.")}}catch(e){toast("Compartilhar não funciona aqui. Abra pelo link do GitHub Pages!")}}}
let tvTab="tree",tvSel=null,tvZoom=1,tvFilter=null;
function spMatch(k,fl){if(!fl)return true;const[sz,c,t,el,h]=k.split("|"),T=S.tree[k];if(fl.startsWith("c:"))return c==fl.slice(2);if(fl.startsWith("e:"))return el==fl.slice(2);
if(fl=="super")return !!h;if(fl=="shiny")return !!(T&&T.shiny);if(fl=="extreme")return ["Microscópica","Mini","Enorme","Gigantesca"].includes(sz);if(fl=="rare")return T&&stars(T)>=3;return true}
function renderFilter(){const f=$("tvf");if(tvTab!="tree"){f.style.display="none";return}f.style.display="";const have=new Set(Object.keys(S.tree||{}).map(k=>k.split("|")[1]));
const chip=(id,lab)=>`<span class="${tvFilter==id||(!tvFilter&&!id)?"on":""}" onclick="tvFilter=${id?`'${id}'`:"null"};renderTree()">${lab}</span>`;
f.innerHTML=chip(null,"TODAS")+chip("rare","★3+")+chip("shiny","✦ BRILHANTES")+chip("super","SUPER")+chip("extreme","TAMANHO EXTREMO")+Object.keys(ELEM).filter(e=>Object.keys(S.tree||{}).some(k=>k.split("|")[3]==e)).map(e=>chip("e:"+e,ELEM[e].n.toUpperCase())).join("")+CORDER.filter(c=>have.has(c)).map(c=>chip("c:"+c,`<i class="dt" style="background:${hex(COLORS[c])}"></i>${c}`)).join("")}
function openTree(tab,hi){SFX.open();if(S.tut&&S.tut.t2)tutDone("t3");$("tut").classList.remove("on");tvTab=tab||"tree";modalOpen=true;$("tv").classList.add("on");renderTree(hi);if(tvTab=="tree")setTimeout(()=>{const b=$("tvb"),e=b.querySelector(".sp.new")||b.querySelector(".sp");if(e&&!hi){b.scrollLeft=Math.max(0,e.offsetLeft*tvZoom-b.clientWidth/2)}},30)}
function closeTree(){SFX.close();$("tv").classList.remove("on");modalOpen=false;tvSel=null}
function renderTree(hi){const T=S.tree||{},ks=Object.keys(T);renderFilter();$("tabT").classList.toggle("on",tvTab=="tree");$("tabC").classList.toggle("on",tvTab=="cores");$("tabA").classList.toggle("on",tvTab=="album");$("tabQ").classList.toggle("on",tvTab=="ach");
$("tvcnt").textContent=tvFilter?`${ks.filter(k=>spMatch(k,tvFilter)).length} de ${ks.length}`:`${ks.length} espécies · ∞`;$("zm").style.display=$("zp").style.display=tvTab=="tree"?"":"none";$("tvcnt").style.display=tvTab=="tree"||tvTab=="cores"?"":"none";
if(tvTab=="album"){const ord=ks.slice().sort((a,b)=>stars(T[b])-stars(T[a])||(T[b].shiny?1:0)-(T[a].shiny?1:0)||T[a].n-T[b].n);
 $("tvb").innerHTML=`<div class="alb">${ord.map(k=>{const t=T[k],st=stars(t),[rl,rc]=RAR[st];return `<div class="ac ${t.shiny?"shn":""}" style="border-color:${rc}" onclick="showCard('${k}')"><span class="no">${t.n}</span><img src="${fruitImg(t.img)}"><b style="color:${rc}">${"★".repeat(st)}</b><span>${t.d==0?t.name:spLabel(k).split(" · ").slice(0,2).join(" · ")}</span></div>`}).join("")}</div>`;
 $("tvd").innerHTML=`<b>${ks.length} cartas</b> · ${ks.filter(k=>T[k].shiny).length} brilhantes · ${ks.filter(k=>stars(T[k])>=5).length} lendárias. Toque numa carta pra abrir, baixar ou compartilhar.`;return}
if(tvTab=="ach"){S.rec=S.rec||{};S.ach=S.ach||{};const done=ACH.filter(a=>S.ach[a[0]]).length;
 $("tvb").innerHTML=`<div class="cgw"><div class="recs">${[["Espécies",ks.length],["Clientes atendidos",S.delivered],["Cruzamentos",S.rec.crosses||0],["Brilhantes achadas",S.rec.shiny||0],["Maior combo","x"+(S.rec.maxCombo||0)],["Melhor dia",(S.rec.bestDay||0)+" moedas"],["VIPs atendidos",S.rec.vips||0],["Dias jogados",S.day]].map(([a,b])=>`<div><span>${a}</span><b>${b}</b></div>`).join("")}</div>
 ${ACH.map(([id,n,d,ok,rw])=>`<div class="cg ${S.ach[id]?"hi":""}"><span class="big-sw" style="background:${S.ach[id]?"#f7c331":"#c9b99a"};display:flex;align-items:center;justify-content:center;font-size:1rem">${S.ach[id]?`<img src="${TROPHY()}" style="width:22px;height:22px">`:"?"}</span><div style="flex:1;text-align:left"><b>${n}</b><br><span style="font-size:.74rem">${d}</span></div><span style="font-size:.72rem;font-weight:700">+${rw}</span></div>`).join("")}</div>`;
 $("tvd").innerHTML=`<b>${done} de ${ACH.length} conquistas</b> · cada uma dá moedas de presente.`;return}
if(tvTab=="cores"){$("tvb").innerHTML=colorGuideHTML(hi);$("tvd").innerHTML="Toque no requisito de COR de um cliente pra abrir direto aqui.";if(hi){const e=$("cg-"+hi);if(e)setTimeout(()=>e.scrollIntoView({block:"center"}),30)}return}
const rows={};ks.forEach(k=>{(rows[T[k].d]=rows[T[k].d]||[]).push(k)});Object.values(rows).forEach(r=>r.sort((a,b)=>T[a].n-T[b].n));
const maxD=ks.length?Math.max(...ks.map(k=>T[k].d)):0,sug=suggestions(8);const qRow=maxD+1;
const CW=86,RH=110,PADL=40;const widest=Math.max(4,...Object.values(rows).map(r=>r.length),sug.length);const Wd=PADL+widest*CW+20,H=(qRow+1)*RH+30;
const pos={};for(let d=0;d<=maxD;d++){const r=rows[d]||[],off=PADL+(widest-r.length)*CW/2;r.forEach((k,i)=>pos[k]=[off+i*CW+CW/2,d*RH+14])}
const qoff=PADL+(widest-sug.length)*CW/2;sug.forEach((q,i)=>pos["?"+i]=[qoff+i*CW+CW/2,qRow*RH+14]);
const newest=ks.slice().sort((a,b)=>T[b].n-T[a].n)[0];
let lines="";const ln=(a,b,dash,col)=>{const[x1,y1]=pos[a],[x2,y2]=pos[b];lines+=`<path d="M${x1} ${y1+64} C${x1} ${y1+92},${x2} ${y2-24},${x2} ${y2+2}" stroke="${col}" stroke-width="3" fill="none" ${dash?'stroke-dasharray="5 5"':""}/>`};
ks.forEach(k=>T[k].par.forEach(p=>{if(pos[p])ln(p,k,false,tvSel&&(tvSel==k||tvSel==p)?"#e67e22":"#6b4a33")}));
sug.forEach((q,i)=>{if(tvSel!="?"+i)return;ln(q.a,"?"+i,true,"#e67e22");if(q.b!=q.a)ln(q.b,"?"+i,true,"#e67e22")});
let h=`<div id="tvs" style="width:${Wd*tvZoom}px;height:${H*tvZoom}px"><div id="tvc" style="width:${Wd}px;height:${H}px;transform:scale(${tvZoom})"><svg width="${Wd}" height="${H}">${lines}</svg>`;
for(let d=0;d<=qRow;d++)h+=`<span class="rowlab" style="top:${d*RH+2}px">${d==0?"FEIRA":d==qRow?"???":"G"+d}</span>`;
ks.forEach(k=>{const[x,y]=pos[k],t=T[k];h+=`<div class="sp ${tvSel==k?"cur":""} ${k==newest&&t.d>0?"new":""} ${spMatch(k,tvFilter)?"":"dim"}" style="left:${x-38}px;top:${y}px" onclick="tvSel='${k.replace(/'/g,"")}';renderTree()"><span class="no" style="background:${RAR[stars(t)][1]}">${t.n}${t.shiny?"✦":""}</span><div class="ic"><img src="${fruitImg(t.img)}"></div>${t.d==0?t.name:spLabel(k).split(" · ").slice(0,2).join(" · ")}</div>`});
sug.forEach((q,i)=>{const[x,y]=pos["?"+i],A=T[q.a];h+=`<div class="sp q ${tvSel=="?"+i?"cur":""}" style="left:${x-38}px;top:${y}px" onclick="tvSel='?${i}';renderTree()"><div class="ic"><img src="${fruitImg({...A.img,rgb:q.c.rgb,mask:A.img.mask,shape:A.img.shape})}"></div>?</div>`});
$("tvb").innerHTML=h+"</div></div>";
// painel de detalhe
const nm=k=>T[k].d==0?T[k].name:spLabel(k),im=k=>`<img src="${fruitImg(T[k].img)}">`;let det;
if(tvSel&&tvSel[0]=="?"){const q=sug[+tvSel.slice(1)];det=q?`<b>Espécie desconhecida</b><br>Receita provável: ${im(q.a)} <b>${nm(q.a)}</b> + ${im(q.b)} <b>${nm(q.b)}</b><br>Deve sair: <b>${spLabel(q.k)}</b>`:""}
else if(tvSel&&T[tvSel]){const t=T[tvSel],my=suggestions(4,tvSel);
const sr=stars(t),[rl,rc]=RAR[sr];det=`<img class="bigi" src="${fruitImg(t.img)}"><b>nº ${t.n} · ${t.d==0?t.name:"Geração "+t.d}</b> <span style="color:${rc};font-weight:700">${"★".repeat(sr)} ${rl}</span>${t.shiny?" ✦":""}<br>${spLabel(tvSel)}<br><button class="btn" style="background:#3ca55c;margin:3px 0" onclick="showCard('${tvSel}')">VER CARTA</button><br>${t.par.length?"Pais: "+t.par.map(p=>T[p]?im(p)+" "+nm(p):"?").join(" + "):"Fruta da feira"}<br>Primeira: ${t.name}<div style="clear:both"></div>
${my.length?"<b>Experimente cruzar com:</b>"+my.map(q=>{const o=q.a==tvSel?q.b:q.a;return `<div class="sug">${im(tvSel)}+${im(o)} ${nm(o)} → <b>${spLabel(q.k)}</b></div>`}).join(""):"<i>Essa espécie já gerou tudo que dava com as que você tem. Descubra outras!</i>"}`}
else det=`<b>Árvore de espécies</b> · cada combinação nova de tamanho, cor, sabor e poder vira uma espécie. Ela não tem fim.<br>Regra: <b>parecidos se intensificam</b> (pequena + pequena encolhe, grande + grande cresce). Toque num <b>?</b> pra ver a receita da próxima descoberta.`;
$("tvd").innerHTML=det}
$("tabT").onclick=()=>{tvTab="tree";renderTree()};$("tabA").onclick=()=>{tvTab="album";renderTree()};$("tabQ").onclick=()=>{tvTab="ach";renderTree()};$("tabC").onclick=()=>{tvTab="cores";renderTree()};$("tvx").onclick=closeTree;
$("zm").onclick=()=>{tvZoom=Math.max(.4,tvZoom-.2);renderTree()};$("zp").onclick=()=>{tvZoom=Math.min(1.6,tvZoom+.2);renderTree()};
$("dexb").onclick=()=>{tvSel=null;openTree("tree")};$("pauseb").onclick=()=>{if(!running)return;openModal(`<h2>PAUSADO</h2><p>O tempo e a paciência dos clientes estão congelados.</p><button class="big" id="resume">CONTINUAR</button><br><button class="big alt" id="sndb" onclick="toggleSnd()"></button><button class="big alt" onclick="settings()">AJUSTES</button>`);sndLabel();$("resume").onclick=closeModal};$("menub").onclick=startScreen;
/* ================= laço ================= */
let tt;function toast(h){const t=$("toast");t.innerHTML=h;t.classList.add("on");clearTimeout(tt);tt=setTimeout(()=>t.classList.remove("on"),2600)}
function renderAll(n){hud();renderPot();renderCounter();renderTable(n);renderMarket()}
let last=performance.now(),saveT=0;
setInterval(()=>{const t=performance.now(),dt=Math.min(1000,t-last);last=t;
if(running&&!modalOpen){S.clock+=dt;if(!CFG.zen)S.dayT+=dt;if(S.dayT>=dayLen()){S.dayT=dayLen();endDay()}
S.cust.forEach((c,i)=>{if(!c||c.leaving)return;const el=document.querySelector(`.cust[data-i="${i}"]`);if(!el)return;const left=leftOf(c),on=Math.ceil(left*10),pc=left>.5?"#3ce06f":left>.2?"#f4a261":"#e74c3c";
el.querySelectorAll(".pat i").forEach((x,k)=>x.style.background=k<on?pc:"");const pb=el.querySelector(".pay b");if(pb)pb.textContent=pay(c);
if((left<.2?"1":"0")!=el.dataset.low&&!document.querySelector(".fr.drag"))renderCounter()});
if((saveT+=dt)>4000){saveT=0;save()}}hud();renderCombo()},250);
window.addEventListener("resize",()=>{S.fruits.forEach(clampPos);renderTable();renderProps();placePot()});
S.pot=S.pot||[];if(S.pot.length==2){S.fruits.push(...S.pot);S.pot=[]}
document.addEventListener("pointerdown",e=>{const t=e.target.closest("button,.btn,.big,.hint,.flt span,.sp,.cg,.tvh .btn,#pot,.pw");if(!t)return;ac();
 if(t.id=="go"||t.id=="cl"||t.id=="tvx"||t.id=="resume"||t.id=="nextd"||t.id=="rvx"||t.id=="pot")return;SFX.sel()},true);
if("serviceWorker" in navigator&&location.hostname.endsWith("github.io"))navigator.serviceWorker.register("sw.js").catch(()=>{});
S.ess=S.ess||0;S.sk=S.sk||{};S.tree=S.tree||{};if(!S.bag)S.bag=[{t:"grow"},{t:"shrink"}];S.fruits.forEach(f=>{clampPos(f);treeAdd(f,null,true)});renderProps();renderAll();placePot();fetchWX();startScreen();
