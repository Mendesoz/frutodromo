// Frutódromo — lógica do jogo: sprites gerados por código, genética das frutas, clientes, árvore de espécies, som e interface
const T0=performance.now(); // início do script: nos 2,5 s seguintes a mesa ainda está assentando
const R=a=>a[Math.floor(Math.random()*a.length)],N=(a,b)=>Math.floor(Math.random()*(b-a+1))+a,cl=(v,a,b)=>Math.max(a,Math.min(b,v));
const $=id=>document.getElementById(id);
/* ================= molduras de interface (9-slice em pixel art, geradas UMA vez no carregamento) =================
frame(anéis, miolo): canvas (2·n+1)², anéis = [[luz, sombra], ...] de fora pra dentro; o 1º anel é o contorno. Canto de fora transparente (arredonda 1 px).
Usadas por border-image: var(--f-x) 3 fill / 6px stretch (modal: 5 / 10px), ou seja, 1 pixel de arte = 2 px CSS. */
(function(){const O="#2a1a12";
function frame(rings,center){const s=rings.length,n=2*s+1,c=document.createElement("canvas");c.width=c.height=n;const g=c.getContext("2d");
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){const d=Math.min(x,y,n-1-x,n-1-y);if(d==0&&(x==0||x==n-1)&&(y==0||y==n-1))continue;let col=center;
  if(d<s){const[tl,br]=rings[d],top=y==d,left=x==d,bot=y==n-1-d,right=x==n-1-d;col=(bot&&!right&&left)?br:(top||left)&&!(bot||right&&!top)?tl:br}
  g.fillStyle=col;g.fillRect(x,y,1,1)}
 return c.toDataURL()}
const F={
 paper:frame([[O,O],["#ffffff","#dccba6"],["#fbf3df","#fbf3df"]],"#fbf3df"),
 vip:frame([[O,O],["#fffbe6","#e2c878"],["#fff3c4","#fff3c4"]],"#fff3c4"),
 btn:frame([[O,O],["#d9a465","#6e4424"],["#9a6234","#9a6234"]],"#9a6234"),
 btnOn:frame([[O,O],["#fff3a0","#b7841a"],["#f7c331","#f7c331"]],"#f7c331"),
 go:frame([[O,O],["#8fe09a","#27753f"],["#3ca55c","#3ca55c"]],"#3ca55c"),
 tag:frame([[O,O],["#1a0f08","#7a4a28"],["#2a1a12","#2a1a12"]],"#2a1a12"),
 card:frame([[O,O],["#f0c684","#96602f"],["#cf9858","#cf9858"]],"#cf9858"),
 rare:frame([[O,O],["#f3dcff","#9a62c8"],["#d9a6ff","#d9a6ff"]],"#d9a6ff"),
 item:frame([[O,O],["#f1e8ff","#9a86c8"],["#d8c4f0","#d8c4f0"]],"#d8c4f0"),
 lock:frame([[O,O],["#8a6244","#4a2e1c"],["#6b4a33","#6b4a33"]],"#6b4a33"),
 dark:frame([[O,O],["#93603a","#4a2a14"],["#6b4423","#6b4423"]],"#6b4423"),
 toast:frame([[O,O],["#f2d08a","#a87a2a"],["#2a1a12","#2a1a12"]],"#2a1a12"),
 danger:frame([[O,O],["#e8705f","#7a1f16"],["#c0392b","#c0392b"]],"#c0392b"),
 err:frame([[O,O],["#ffb8ac","#a43a2c"],["#ffe1dc","#ffe1dc"]],"#ffe1dc"),
 ok:frame([[O,O],["#f4fff0","#7ccf8a"],["#dcf8e0","#dcf8e0"]],"#dcf8e0"),
 modal:frame([[O,O],["#e2b878","#8f5c2c"],["#b47c42","#b47c42"],["#6a4020","#6a4020"],["#ffffff","#dccba6"]],"#fbf3df")};
// rabinho do balão (7×4 px de arte, desenhado em 14×8 px CSS)
function tail(face){const rows=["offfffo",".offfo.","..ofo..","...o..."],c=document.createElement("canvas"),g=c.getContext("2d");c.width=7;c.height=4;
 rows.forEach((r,y)=>[...r].forEach((ch,x)=>{if(ch==".")return;g.fillStyle=ch=="o"?O:face;g.fillRect(x,y,1,1)}));return c.toDataURL()}
// rabinho lateral (4×7 de arte, 8×14 CSS) pro balão ao lado do cliente em janela baixa, e setas da feira (4×7)
function spr47(rows,pal){const c=document.createElement("canvas"),g=c.getContext("2d");c.width=4;c.height=7;rows.forEach((r,y)=>[...r].forEach((ch,x)=>{if(ch==".")return;g.fillStyle=pal[ch];g.fillRect(x,y,1,1)}));return c.toDataURL()}
const TAILL=["...o","..of",".off","offf",".off","..of","...o"],ARR=["o...","oo..","ooo.","oooo","ooo.","oo..","o..."];
const rs=document.documentElement.style;Object.entries(F).forEach(([k,v])=>rs.setProperty("--f-"+k,`url(${v})`));
rs.setProperty("--tail",`url(${tail("#fbf3df")})`);rs.setProperty("--tailv",`url(${tail("#fff3c4")})`);rs.setProperty("--tailok",`url(${tail("#dcf8e0")})`);
[["","#fbf3df"],["v","#fff3c4"],["ok","#dcf8e0"]].forEach(([k,c])=>rs.setProperty("--tailL"+k,`url(${spr47(TAILL,{o:O,f:c})})`));
rs.setProperty("--arR",`url(${spr47(ARR,{o:O})})`);rs.setProperty("--arL",`url(${spr47(ARR.map(r=>[...r].reverse().join("")),{o:O})})`);
})();
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
const artCache={},ADIM={},sz=(u,k=2)=>{const d=ADIM[u];return d?`width:${d[0]*k}px;height:${d[1]*k}px`:""};
function art(rows,pal,ol){const k=rows.join("")+JSON.stringify(pal)+ol;if(artCache[k])return artCache[k];const H=rows.length+2,W2=rows[0].length+2,g=blank(W2,H);rows.forEach((r,y)=>[...r].forEach((ch,x)=>{if(pal[ch])g[y+1][x+1]=pal[ch]}));const u=toImg(W2,H,g,ol||"#2a1a12");ADIM[u]=[W2,H];return artCache[k]=u}
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
// máscara de formato guardada compacta: "~" + base64 dos bits (antes eram 324 dígitos por fruta)
const packMask=m=>{if(!m||m[0]=="~")return m;const t=Array.isArray(m)?m.join(""):m;let bin="";for(let i=0;i<t.length;i+=8){let b=0;for(let j=0;j<8;j++)b=b*2+(t[i+j]=="1"?1:0);bin+=String.fromCharCode(b)}return "~"+btoa(bin)};
const unpackMask=m=>{if(m[0]!="~")return m;const bin=atob(m.slice(1));let t="";for(let i=0;i<bin.length;i++)t+=bin.charCodeAt(i).toString(2).padStart(8,"0");return t.slice(0,W*W)};
// DNA: código de 5 caracteres tirado de tudo que a fruta tem (formato, estampa, cores, sabor, tamanho, poder, capa, brilho)
const q8=c=>c?c.map(v=>Math.round(v/8)).join("."):"";
function dnaCode(f){const t=[f.mask||f.shape,f.pat,f.top,f.tip||"",q8(f.rgb),q8(f.rgb2),f.doce,f.az,f.tam,f.el||"",f.hero?f.cape||1:0,f.shiny?1:0].join("|");let h=2166136261;for(let i=0;i<t.length;i++){h^=t.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(36).toUpperCase().padStart(7,"0").slice(-5)}
function maskGrid(f){if(f.mask)return [...unpackMask(f.mask)].map(Number);const m=MASK[f.shape],o=[];for(let y=0;y<W;y++)for(let x=0;x<W;x++)o.push(m(x,y)?1:0);return o}
function blurG(g){const o=new Array(W*W).fill(0);for(let y=0;y<W;y++)for(let x=0;x<W;x++){let s=0,n=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const X=x+dx,Y=y+dy;if(X>=0&&Y>=0&&X<W&&Y<W){s+=g[Y*W+X];n++}}o[y*W+x]=s/n}return o}
// funde os formatos dos pais: borra os dois, tira a média e corta
function morph(a,b){let A=blurG(blurG(maskGrid(a))),B=blurG(blurG(maskGrid(b)));const o=A.map((v,i)=>(v+B[i])/2>=.45?1:0);
for(let y=0;y<W;y++)for(let x=0;x<W;x++)if(x==0||y==0||x==W-1||y==W-1)o[y*W+x]=0;if(o.reduce((s,v)=>s+v,0)<20)return packMask(maskGrid(a).join(""));return packMask(o.join(""))}
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
const NAMESF=["Dona Cida","Lia","Tânia","Morgana","Bruna","Lurdes","Jana","Bia","Helena","Marta","Júlia","Clara","Iara","Rosa","Yumi","Dona Neide","Lara","Vitória"];
const NAMESM=["Seu Jorge","Paulão","Zé","Kenji","Barbosa","Nico","Otávio","Caio","Vini","Tião","Beto","Igor","Davi","Léo","Seu Lauro","Hiro","Rodrigo","Arthur"];
const NAMESN=["Rafa","Duda","Sol","Kim","Alex","Dani"];const NAMES=[...NAMESF,...NAMESM,...NAMESN];
const VIPS=["Chef Estrelado","Crítica Gourmet","Cientista Maluca","Prefeito","Influencer Fit","Colecionador"],VIPG={"Chef Estrelado":"m","Crítica Gourmet":"f","Cientista Maluca":"f","Prefeito":"m","Influencer Fit":"f","Colecionador":"m"};
// ===== Personagens (6A): uma folha 120×260 por cliente = 3 quadros (parado, respiração, piscada) × 5 expressões (ok, happy, worry, angry, sad).
// Corpo e cabeça desenhados em 40×52 px de arte (2 px de tela por px), 3 tons por material, contorno tingido. Tudo sai de campos que já estão no save
// (nome|t0|blinkD|rw + pele, cabelo, roupa...): nenhum campo novo. Respiração/piscada por CSS; a expressão troca só por data-ex.
const EYEC=[[70,110,190],[60,140,90],[120,80,50],[60,40,30],[140,90,170],[50,150,160]];
const CH=(()=>{
const PW=40,PH=52,EXS=["ok","happy","worry","angry","sad"],E="#2a1a12",WH="#ffffff";
const hsh=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
const rng=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const ckey=c=>c.name+"|"+c.t0+"|"+c.blinkD+"|"+c.rw;
const dx=x=>Math.abs(x-19.5);
// sombra com leve desvio de matiz (mais fria/escura), luz mais quente: 3 tons por material, sem pontilhado
const shd=c=>[c[0]*.74,c[1]*.68,c[2]*.74],lit=c=>[c[0]+(255-c[0])*.3,c[1]+(255-c[1])*.26,c[2]+(255-c[2])*.14];
function layer(){const col=blank(PW,PH),mat=blank(PW,PH);
 const put=(x,y,c,m)=>{x=Math.round(x);y=Math.round(y);if(x<0||y<0||x>=PW||y>=PH)return;col[y][x]=c;mat[y][x]=m};
 const fill=(fn,c,m)=>{for(let y=0;y<PH;y++)for(let x=0;x<PW;x++)if(fn(x,y))put(x,y,typeof c=="function"?c(x,y):c,m)};
 return{col,mat,put,fill}}
// tons: borda de cima/esquerda clara, borda de baixo/direita escura, faixa de sombra de forma à direita em materiais grandes
function shade(L,flat,band){const out=blank(PW,PH),bb={};
 for(let y=0;y<PH;y++)for(let x=0;x<PW;x++){const m=L.mat[y][x];if(!m)continue;const b=bb[m]||(bb[m]=[99,99,0,0]);b[0]=Math.min(b[0],x);b[1]=Math.min(b[1],y);b[2]=Math.max(b[2],x);b[3]=Math.max(b[3],y)}
 for(let y=0;y<PH;y++)for(let x=0;x<PW;x++){const m=L.mat[y][x];if(!m)continue;const c=L.col[y][x];if(flat.has(m)){out[y][x]=hex(c);continue}
  const s=(X,Y)=>Y>=0&&Y<PH&&X>=0&&X<PW&&L.mat[Y][X]==m,b=bb[m],w=b[2]-b[0]+1;
  let v=c;if(!s(x+1,y)||!s(x,y+1)||(band.has(m)&&w>=8&&x>b[0]+w*.74))v=shd(c);else if((!s(x-1,y)||!s(x,y-1))&&w>=4)v=lit(c);out[y][x]=hex(v)}
 return out}
function build(c){
 const k=c.kind||"person",human=k=="person",furry=["cat","dog","bear","bunny"].includes(k),r=rng(hsh(ckey(c))),pick=a=>a[Math.floor(r()*a.length)];
 const SK=c.skin||[232,180,142],FU=c.fur||SK,HA=c.hair||[74,44,23],SH=c.shirt||[69,123,157],AC=c.acc2||[214,48,49],acc=c.acc||[],sp=c.sp||0;
 const role=null; // figurinos VIP: 6B
 const sw=pick([11,12,12,13]),hOff=human||furry?pick([0,0,1,1,2]):0; // largura de ombro e altura (0–2 px de arte) saem da semente: o save não ganha campo
 let gar=sp==3?"overall":sp==4?"shirt":pick(["tee","tee","hoodie","tank","sweater"]);
 const SKa=human?SK:FU; // pele dos braços
 /* ---------- CORPO (camada parada) ---------- */
 const B=layer(),WHt=[245,239,224],DEN=[61,90,138];
 if(k=="ghost"){}
 else if(k=="robot"){B.fill((x,y)=>y>=27&&y<=30&&dx(x)<=3.6,(x,y)=>y%2?[93,99,114]:[125,131,146],"neck");
  B.fill((x,y)=>y>=30&&dx(x)<=9.5,[154,160,173],"torso");B.fill((x,y)=>y>=31&&dx(x)>10&&dx(x)<=13.5,(x,y)=>y%4==2?[93,99,114]:[125,131,146],x=>0);
  for(let y=31;y<PH;y++)for(let x=0;x<PW;x++)if(dx(x)>10&&dx(x)<=13.5){B.mat[y][x]=x<20?"armL":"armR"}
  B.fill((x,y)=>y>=33&&y<=39&&dx(x)<=6,[26,36,51],"panel");[[15,35,[78,240,255]],[18,35,[247,195,49]],[21,35,[255,90,78]],[24,35,[60,224,111]],[15,37,[78,240,255]],[16,37,[78,240,255]],[17,37,[78,240,255]],[22,37,[125,131,146]],[23,37,[125,131,146]],[24,37,[125,131,146]]].forEach(([x,y,cc])=>B.put(x,y,cc,"led"))}
 else if(k=="penguin"){B.fill((x,y)=>y>=28&&dx(x)<=Math.min(12,7+(y-28)*1.5),[43,43,64],"torso");B.fill((x,y)=>y>=30&&dx(x)<=Math.min(7.5,3+(y-30)*.9),[242,242,250],"belly");
  B.fill((x,y)=>y>=31&&dx(x)>12&&dx(x)<=14.5&&y<=44,[43,43,64],"flip")}
 else if(k=="frog"){B.fill((x,y)=>y>=30&&dx(x)<=Math.min(12.5,9+(y-30)*1.2),FU,"torso");B.fill((x,y)=>y>=32&&dx(x)<=Math.min(7.5,4+(y-32)*.8),lit(lit(FU)),"belly");
  B.fill((x,y)=>y>=37&&y<=40&&dx(x)>=10&&dx(x)<=14.5,FU,"hand");[[5,41],[7,41],[9,41],[30,41],[32,41],[34,41]].forEach(([x,y])=>B.put(x,y,FU,"hand"))}
 else{const top=29,long=!["tee","tank"].includes(gar),sleeve=gar=="tee"?6:gar=="tank"?0:99;
  const CL={chefj:WHt,coat:WHt,blazer:[58,52,72],suit:[44,48,66],vest:WHt}[gar]||SH,CL2=lit(lit(CL));
  const cloth=(x,y)=>{if(gar=="sweater"||(sp==1&&!role))return Math.floor((y-top)/2)%2?CL:CL2;if(sp==2&&!role&&gar!="hoodie")return (x+Math.floor(y/3)%2*2)%4==0&&y%3==1?CL2:CL;return CL};
  // pescoço
  B.fill((x,y)=>y>=24&&y<=top+1&&dx(x)<=(k=="alien"?2.6:furry?4.6:3.6),shd(SKa),"neck");
  // tronco e braços (materiais separados: a costura do braço sai do sombreamento)
  const sh=y=>y==top?sw-3:y==top+1?sw-1:sw;
  B.fill((x,y)=>y>=top&&dx(x)<=sh(y)-(y>=top+2?4:0),gar=="tank"?(x,y)=>dx(x)<=sw-6||y>top+5?cloth(x,y):SKa:cloth,"torso");
  B.fill((x,y)=>y>=top+2&&dx(x)>sw-4&&dx(x)<=sh(y)&&x<20,(x,y)=>y-top<sleeve?cloth(x,y):SKa,"armL");
  B.fill((x,y)=>y>=top+2&&dx(x)>sw-4&&dx(x)<=sh(y)&&x>20,(x,y)=>y-top<sleeve?cloth(x,y):SKa,"armR");
  if(gar=="tank"){for(let y=top;y<top+6;y++)for(let x=0;x<PW;x++)if(B.mat[y][x]=="torso"&&dx(x)>sw-6)B.mat[y][x]=x<20?"shL":"shR"}
  if(gar=="tee"){for(let x=0;x<PW;x++){const m=B.mat[top+5]&&B.mat[top+5][x];if(m=="armL"||m=="armR")B.put(x,top+5,shd(CL),m+"c")}}
  // gola / detalhes por roupa
  const cd=shd(CL);
  if(gar=="tee"||gar=="sweater")B.fill((x,y)=>y>=top&&y<=top+1&&dx(x)<=5.5&&dx(x)>3-(y-top)*2.5,cd,"collar");
  if(gar=="tank")B.fill((x,y)=>y>=top&&y<=top+3&&dx(x)<=4.5-(y-top),SKa,"chest");
  if(gar=="shirt"||gar=="coat"||gar=="chefj"||gar=="vest"){B.fill((x,y)=>y>=top&&y<=top+3&&dx(x)<=5.5&&dx(x)>=y-top,gar=="shirt"?WHt:lit(CL),"collar");
   if(gar=="shirt")[top+4,top+8].forEach(y=>{B.put(19,y,WHt,"btn");B.put(20,y,WHt,"btn")})}
  if(gar=="coat"){B.fill((x,y)=>y>=top+3&&x>=19&&x<=20,shd(WHt),"seam");B.fill((x,y)=>y>=top&&y<=top+2&&dx(x)<=2.5,[42,157,143],"under");[[24,top+6,[214,48,49]],[26,top+6,[69,123,157]],[24,top+7,WHt],[25,top+7,WHt],[26,top+7,WHt]].forEach(([x,y,cc])=>B.put(x,y,cc,"pen"))}
  if(gar=="blazer"||gar=="suit"){B.fill((x,y)=>y>=top&&y<=top+9&&dx(x)<=Math.max(0,4.5-(y-top)*.5),WHt,"under");B.fill((x,y)=>y>=top&&y<=top+8&&dx(x)>Math.max(0,4.5-(y-top)*.5)&&dx(x)<=Math.max(1,6.5-(y-top)*.5),lit(CL),"lapel");
   if(gar=="suit"){B.fill((x,y)=>y>=top+1&&y<=top+8&&dx(x)<=1,[192,57,43],"tie");for(let y=top;y<PH;y++)for(let x=0;x<PW;x++){const d=x-(8+(y-top)*1.6);if(B.mat[y][x]&&B.mat[y][x]!="neck"&&d>=0&&d<4)B.put(x,y,d<1||d>=3?[247,195,49]:[60,160,90],"sash")}}
   else{B.fill((x,y)=>y>=top-1&&y<=top+2&&dx(x)<=5.5,[30,30,50],"scarf")}}
  if(gar=="vest"){B.fill((x,y)=>y>=top+1&&dx(x)>=3&&dx(x)<=sw-4.5,[122,74,42],"vest");B.fill((x,y)=>y>=top+1&&y<=top+3&&dx(x)<=1.5,[214,48,49],"tie");B.put(19,top+2,[150,30,30],"tie");B.put(20,top+2,[150,30,30],"tie")}
  if(gar=="hoodie"){B.fill((x,y)=>y>=top-2&&y<=top+1&&dx(x)>=4&&dx(x)<=8.5-(top+1-y)*.8,cd,"hood");[top+2,top+3,top+4,top+5].forEach(y=>{B.put(17,y,WHt,"cord");B.put(22,y,WHt,"cord")});B.fill((x,y)=>y>=top+9&&y<=top+10&&dx(x)<=5.5,cd,"pocket")}
  if(gar=="overall"){B.fill((x,y)=>(dx(x)>=4&&dx(x)<=6&&y>=top&&y<=top+6)||(y>=top+6&&dx(x)<=sw-4.5),DEN,"bib");B.put(14,top+6,[247,195,49],"btn");B.put(25,top+6,[247,195,49],"btn")}
  if(c.vip){[[26,top+4],[27,top+4],[26,top+5],[27,top+5]].forEach(([x,y])=>{if(role!="coll"&&role!="sci")B.put(x,y,[247,195,49],"pin")});}
  if(acc.includes("scarf")&&!role)B.fill((x,y)=>(y>=top-2&&y<=top+1&&dx(x)<=7-(top+1-y)*.4)||(x>=24&&x<=26&&y>=top+1&&y<=top+7),(x,y)=>(x+y)%4<2?AC:shd(AC),"scarf");
  if(human&&acc.includes("neck")&&!role&&!acc.includes("scarf"))for(let x=-4;x<=4;x+=2)B.put(19.5+x,top+2+(Math.abs(x)<2?1:0),[247,195,49],"gold");
  if(!human&&acc.includes("tie")||(c.vip&&!human)){const t=c.vip?[247,195,49]:AC;[[16,top+1],[17,top+1],[16,top+2],[17,top+2],[16,top+3],[17,top+3],[22,top+1],[23,top+1],[22,top+2],[23,top+2],[22,top+3],[23,top+3],[18,top+2],[21,top+2]].forEach(([x,y])=>B.put(x,y,t,"bow"));B.put(19,top+2,shd(t),"knot");B.put(20,top+2,shd(t),"knot")}
 }
 const flat=new Set(["led","btn","cord","pen","gold","knot","pin","sash","iris","stripe","panel"]),band=new Set(["torso","skin","head","hat"]);
 const Bo=shade(B,flat,band);
 /* ---------- CABEÇA (camada que desce 1 px na respiração) ---------- */
 const Hd=layer(),hy=hOff; // tudo da cabeça usa y+hy
 const F=(fn,cc,m)=>Hd.fill((x,y)=>fn(x,y-hy),cc,m);
 let eyes=[[14.5,18],[24.5,18]],mouthY=24,face="human";
 const cap=(x,y)=>ell(19.5,12.5,12.6,11)(x,y),fr=(x,y)=>y>=4&&y<=9+(Math.floor(x/3)%2)&&dx(x)<=10.5;
 const hs=role=="sci"?8:role=="fit"?5:role=="mayor"?6:(c.hs||0);
 const hat=role?0:(c.hat||0);
 if(human){
  if(hs==1)F((x,y)=>y>=6&&y<=40&&dx(x)<=14.5-(y>36?(y-36)*1.2:0)&&!(y>=25&&dx(x)<=7.5),HA,"hairb");
  if(hs==2)F((x,y)=>y>=6&&y<=25&&dx(x)<=13.5-(y>23?(y-23):0),HA,"hairb");
  if(hs==3&&!hat)F((x,y)=>(x-10)**2+(y-4)**2<=11||(x-29)**2+(y-4)**2<=11,HA,"bun");
  if(hs==4)F((x,y)=>ell(19.5,12,15.5,11)(x,y)&&y<=23,HA,"hairb");
  if(hs==5)F((x,y)=>ell(31.5,21,3.2,10,-.25)(x,y)||(x>=28&&x<=31&&y>=8&&y<=13),HA,"hairb");
  if(hs==7)F((x,y)=>dx(x)>=9&&dx(x)<=13&&y>=10&&y<=38&&!((y%6==0)&&dx(x)>12),HA,"hairb");
  F(ell(8.4,18,2.2,3.2),SK,"ear");F(ell(30.6,18,2.2,3.2),SK,"ear");
  F((x,y)=>(ell(19.5,15,11,11.5)(x,y)&&y<=25)||ell(19.5,20,8.6,6.8)(x,y),SK,"skin");
  const H=fn=>F(fn,HA,"hair");
  if(hs==0)H((x,y)=>cap(x,y)&&(y<=8||(dx(x)>=10&&y<=18))||fr(x,y)&&y<=7);
  if(hs==1||hs==2||hs==5||hs==7)H((x,y)=>(cap(x,y)&&y<=10)||fr(x,y)||(cap(x,y)&&dx(x)>=10&&y<=16));
  if(hs==3)H((x,y)=>(cap(x,y)&&y<=9)||(dx(x)>=10&&y<=16&&cap(x,y)));
  if(hs==4)H((x,y)=>ell(19.5,12,15.5,11)(x,y)&&y<=8);
  if(hs==6)H((x,y)=>cap(x,y)&&y>=10&&y<=18&&dx(x)>=10);
  if(hs==8)H((x,y)=>(cap(x,y)&&y<=8)||(y>=1&&y<=6&&dx(x)<=(role=="sci"?14:11)&&(x%5<3)&&y>=6-(x%5)*2.2)||(role=="sci"&&dx(x)>=10&&dx(x)<=14.5&&y>=5&&y<=15&&(y%4<3)));
  const HT=c.hat2||SH;
  if(hat==1){F((x,y)=>y>=1&&y<=7&&cap(x,y),HT,"hat");F((x,y)=>y>=7&&y<=8&&x>=8&&x<=36,shd(HT),"brim")}
  if(hat==2){F((x,y)=>ell(19.5,8,13,7.2)(x,y)&&y<=8,HT,"hat");F((x,y)=>y>=7&&y<=9&&dx(x)<=12.5,lit(lit(HT)),"fold");F((x,y)=>(x-19.5)**2+(y-1.6)**2<=5,WHt,"pom")}
  if(hat==3){F((x,y)=>dx(x)<=8.5&&y>=1&&y<=7&&!(y==1&&dx(x)>7),[233,196,106],"hat");F((x,y)=>dx(x)<=16-(y==9?1:0)&&y>=8&&y<=9,[233,196,106],"brim");F((x,y)=>dx(x)<=8.5&&y>=5&&y<=6,[192,57,43],"band")}
 }
 if(furry){const hc=17;
  if(k=="bunny"){F((x,y)=>y<=13&&(ell(14,7.5,3,6.6)(x,y)||ell(25,7.5,3,6.6)(x,y)),FU,"ear");F((x,y)=>y>=3&&y<=11&&(ell(14,7.5,1.1,4.6)(x,y)||ell(25,7.5,1.1,4.6)(x,y)),[245,163,181],"earin")}
  if(k=="bear"){F((x,y)=>(x-8.5)**2+(y-6.5)**2<=18||(x-30.5)**2+(y-6.5)**2<=18,FU,"ear");F((x,y)=>(x-8.5)**2+(y-6.5)**2<=5||(x-30.5)**2+(y-6.5)**2<=5,lit(lit(FU)),"earin")}
  if(k=="cat"){F((x,y)=>y>=1&&y<=12&&(Math.abs(x-10)<=(y-1)*.6||Math.abs(x-29)<=(y-1)*.6),FU,"ear");F((x,y)=>y>=5&&y<=10&&(Math.abs(x-10)<=(y-5)*.35||Math.abs(x-29)<=(y-5)*.35),[245,163,181],"earin")}
  F(ell(19.5,hc,12,11),FU,"head");
  if(k=="dog")F((x,y)=>ell(7,17,3.4,8)(x,y)||ell(32,17,3.4,8)(x,y),shd(FU),"ear2");
  if(k=="cat")[[7,20],[6,22],[7,24],[32,20],[33,22],[32,24]].forEach(([x,y])=>Hd.put(x,y+hy,FU,"head"));
  F(ell(19.5,23.5,6,4),lit(lit(FU)),"muzzle");eyes=[[14,17],[25,17]];mouthY=27;face="furry"}
 if(k=="frog"){F(ell(19.5,21,15,9.5),FU,"head");F((x,y)=>(x-11)**2+(y-10)**2<=26||(x-28)**2+(y-10)**2<=26,FU,"head");eyes=[[11,10],[28,10]];mouthY=25;face="frog"}
 if(k=="penguin"){F(ell(19.5,16,12.5,12),[43,43,64],"head");F(ell(19.5,19,9.5,8.5),[242,242,250],"face");eyes=[[15,17],[24,17]];mouthY=27;face="penguin"}
 if(k=="robot"){F((x,y)=>(x==19||x==20)&&y>=1&&y<=4,[125,131,146],"ant");F((x,y)=>(x>=18&&x<=21)&&y>=0&&y<=1,[255,90,78],"bulb");F((x,y)=>(x>=4&&x<=6||x>=33&&x<=35)&&y>=12&&y<=18,[125,131,146],"bolt");
  F((x,y)=>x>=7&&x<=32&&y>=4&&y<=27,[184,189,200],"head");F((x,y)=>x>=10&&x<=29&&y>=9&&y<=23,[26,36,51],"screen");face="robot"}
 if(k=="alien"){F((x,y)=>(x==11||x==28)&&y>=2&&y<=7,FU,"ant");F((x,y)=>(Math.abs(x-11)<=1||Math.abs(x-28)<=1)&&y>=0&&y<=1,[247,195,49],"tip");F((x,y)=>ell(19.5,16,12.5,12)(x,y)||ell(19.5,23,7,5.5)(x,y),FU,"head");mouthY=26;face="alien"}
 if(k=="ghost"){const G=[244,241,255];F((x,y)=>(ell(19.5,17,13,13)(x,y)&&y<=18)||(y>=16&&dx(x)<=13&&y<=37+Math.round(1.6*Math.sin(x*.85)))||ell(6,25,3,2.2)(x,y)||ell(33,25,3,2.2)(x,y),G,"head");eyes=[[14.5,17],[24.5,17]];mouthY=23;face="ghost"}
 const Ho=shade(Hd,new Set(["screen","band","stalk","tip","bulb"]),band);
 // brilho de cabelo: um arco curto de 1 tom (sem pontilhado)
 if(human)for(let y=0;y<PH;y++)for(let x=0;x<PW;x++){if(Hd.mat[y][x]!="hair")continue;const e=((x-15.5)/7)**2+((y-hy-5)/3.4)**2;if(e>.8&&e<1.12&&x<=17&&y-hy<=6)Ho[y][x]=hex(lit(lit(HA)))}
 /* ---------- ROSTO por expressão ---------- */
 const EYEc=EYEC[(c.eyeC||0)%EYEC.length],BRc=human?hex(mul(HA,.6)):E;
 const blC=human?hex([Math.min(255,SK[0]+18),SK[1]*.72,SK[2]*.75]):"#f7a1b0";
 function drawFace(g,ex,blink,oy){const P=(x,y,cc)=>{x=Math.round(x);y=Math.round(y+oy+hy);if(x>=0&&y>=0&&x<PW&&y<PH&&g[y][x])g[y][x]=cc};
  const closed=blink||ex=="happy"||ex=="sad",my=mouthY;
  if(face=="robot"){const sc=ex=="angry"||ex=="sad"?"#ff5a4e":ex=="worry"?"#f7c331":"#4ef0ff",scD=ex=="angry"||ex=="sad"?"#a8302a":ex=="worry"?"#a8801a":"#1f8fa0",bg="#1a2433";
   [[13,12],[23,12]].forEach(([x0,y0],i)=>{for(let y=0;y<4;y++)for(let x=0;x<4;x++){let on=true;
     if(blink)on=y==3;else if(ex=="happy")on=y==0||(y==1&&(x==0||x==3));else if(ex=="angry")on=y>=(i?3-x:x)-1&&y>0;else if(ex=="sad")on=(x==y||x==3-y);else if(ex=="worry")on=y>=1;
     P(x0+x,y0+y,on?(x==0&&y==0&&ex=="ok"?WH:sc):bg)}});
   for(let x=14;x<=25;x++){const yy=ex=="happy"?(x<16||x>23?19:20):ex=="worry"?(x%4<2?19:20):ex=="sad"||ex=="angry"?(x<16||x>23?20:19):19;P(x,yy,ex=="ok"?(x%2?sc:scD):sc)}
   if(ex=="happy")for(let x=16;x<=23;x++)P(x,19,sc);
   [[9,6],[30,6],[9,25],[30,25]].forEach(([x,y])=>P(x,y,"#6f7584"));return}
  if(face=="alien"){[[14,17,.45],[25,17,-.45]].forEach(([cx,cy,rot],i)=>{for(let y=9;y<=25;y++)for(let x=6;x<=33;x++)if(ell(cx,cy,3,4.6,rot)(x,y)){let on=!blink;if(ex=="happy"&&y>cy)on=false;if(ex=="sad"&&y<cy)on=false;if(ex=="angry"&&(y-cy)<(i?-(x-cx):(x-cx))*.9-1.5)on=false;P(x,y,on?"#141420":hex(shd(FU)))}
    if(!blink&&ex!="sad"){P(cx-1,cy-2+(ex=="angry"?2:0),WH);P(cx,cy-2+(ex=="angry"?2:0),WH);if(ex!="happy")P(cx+1,cy+2,"#5a5a80")}});
   if(ex=="happy"){for(let x=-3;x<=3;x++)P(19.5+x,my+(Math.abs(x)==3?-1:0),E);for(let x=-2;x<=2;x++)P(19.5+x,my+1,E)}else if(ex=="ok"){for(let x=-1;x<=1;x++)P(19.5+x,my,E);P(17.5,my-1,E);P(21.5,my-1,E)}
   else if(ex=="worry"){[[17,0],[18,1],[19,0],[20,1],[21,0],[22,1]].forEach(([x,d])=>P(x,my+d-1,E))}else{for(let x=-2;x<=2;x++)P(19.5+x,my+(Math.abs(x)==2?1:0)-1,E);if(ex=="angry")for(let x=-1;x<=1;x++)P(19.5+x,my,WH)}
   return}
  // olhos
  eyes.forEach(([cx,cy],i)=>{const s=i?1:-1; // s: lado de fora
   if(closed){const up=ex=="happy"&&!blink;for(let d=-2;d<=2;d++)P(cx+d,cy+(up?(Math.abs(d)==2?1:0):(Math.abs(d)==2?0:1)),E)}
   else if(face=="human"){const ix=Math.round(cx),iy=Math.round(cy);
    for(let y=-1;y<=2;y++)for(let x=-2;x<=2;x++)if((x/2.5)**2+((y-.5)/1.9)**2<=1)P(ix+x,iy+y,WH);
    const px0=ix-1+(ex=="worry"?(i?-1:1)*0:0);[[0,-1],[1,-1],[0,0],[1,0],[0,1],[1,1]].forEach(([x,y])=>P(px0+x,iy+y,hex(EYEc)));
    P(px0,iy,E);P(px0+1,iy,E);P(px0,iy+1,E);P(px0,iy-1,WH);
    for(let x=-2;x<=2;x++)P(ix+x,iy-2,E);P(ix+s*3,iy-1,E);
    if(ex=="angry"){for(let x=-2;x<=2;x++)P(ix+x,iy-1,E)}}
   else{const EA=k=="cat"?[58,90,42]:k=="frog"?[30,42,20]:[43,29,24];for(let y=-2;y<=2;y++)for(let x=-3;x<=3;x++)if((x/2.6)**2+(y/2.4)**2<=1)P(cx+x,cy+y,hex(EA));
    P(cx-1,cy-1,WH);P(cx,cy-1,WH);P(cx-1,cy,WH);if(ex=="worry"){P(cx+1,cy+1,WH)}
    if(ex=="angry")for(let d=-3;d<=3;d++){const yy=cy-2+Math.round((s*d<0?1:0)+(s*d<-1?1:0));P(cx+d,yy,E);P(cx+d,yy-1,E)}}
   // sobrancelhas: humanos sempre; bichos só quando a expressão pede
   if(face=="human"||((ex=="worry"||ex=="sad")&&face!="frog")){const by=cy-(face=="human"?5:4);for(let d=-2;d<=2;d++){const t=ex=="worry"||ex=="sad"?Math.round(-s*d*-.5):ex=="angry"?Math.round(s*d*-.6)+1:(Math.abs(d)==2?1:0)-(ex=="happy"?1:0);P(cx+d,by+t,BRc);if(ex=="angry")P(cx+d,by+t+1,BRc)}}
   // bochecha
   if(ex!="angry")for(let y=0;y<=1;y++)for(let x=-2;x<=2;x++)if((x+y)%2==0||ex=="happy")P(cx+s+x,cy+4+y,blC);
   else if(face=="human"||face=="ghost")for(let x=-2;x<=2;x++)P(cx+s+x,cy+4,"#e2574c")});
  // nariz
  if(face=="human"){const SKD=hex(shd(SK));P(19,21,SKD);P(20,22,SKD);P(19,22,SKD)}
  if(face=="furry"){const nc=k=="cat"?"#ff8fa3":E;[[18,21],[19,21],[20,21],[21,21],[19,22],[20,22]].forEach(([x,y])=>P(x,y,nc));P(19,21,k=="cat"?"#ffc2cd":"#6a5248");
   if(k=="cat")[[9,23],[10,23],[11,23],[8,25],[9,25],[10,25],[28,23],[29,23],[30,23],[29,25],[30,25],[31,25]].forEach(([x,y])=>P(x,y,"#6a5248"));
   if(k=="bunny"&&(ex=="ok"||ex=="happy")){P(19,25,WH);P(20,25,WH);P(19,26,"#d8d8e0");P(20,26,"#d8d8e0")}}
  if(face=="penguin"){[[17,22],[18,22],[19,22],[20,22],[21,22],[22,22],[18,23],[19,23],[20,23],[21,23],[19,24],[20,24]].forEach(([x,y],i)=>P(x,y,i<6?"#f5a623":"#d68910"));if(ex=="happy"||ex=="sad"){P(19,25,ex=="sad"?"#d68910":"#c0394f");P(20,25,ex=="sad"?"#d68910":"#c0394f")}return}
  // boca
  if(face=="frog"){const cv=ex=="happy"?-1:ex=="ok"?0:1;for(let x=9;x<=30;x++)P(x,my+(Math.abs(x-19.5)>7?cv:0)+(ex=="worry"&&x%4<2?1:0),E);if(ex=="happy")for(let x=16;x<=23;x++)P(x,my+1,"#c0394f");[[15,15],[16,15],[24,17],[25,17],[12,21],[27,22]].forEach(([x,y])=>P(x,y,hex(shd(FU))));return}
  const LIP=face=="human"?hex([Math.min(255,SK[0]*.9+40),SK[1]*.55,SK[2]*.6]):"#e0556b";
  if(ex=="happy"){for(let x=-3;x<=3;x++)P(19.5+x,my+(Math.abs(x)==3?-1:0),E);for(let x=-2;x<=2;x++)P(19.5+x,my+1,Math.abs(x)<=1?"#c0394f":E);P(19,my+1,"#ff8fa3");P(20,my+1,"#ff8fa3");for(let x=-1;x<=1;x++)P(19.5+x,my+2,E)}
  else if(ex=="ok"){for(let x=-2;x<=2;x++)P(19.5+x,my,E);P(16.5,my-1,E);P(22.5,my-1,E);if(face=="human"){P(19,my+1,LIP);P(20,my+1,LIP)}}
  else if(ex=="worry"){[[17,1],[18,0],[19,0],[20,1],[21,0],[22,0]].forEach(([x,d])=>P(x,my+d,E))}
  else if(ex=="angry"){for(let x=-3;x<=3;x++){P(19.5+x,my-1,E);P(19.5+x,my+1,E);P(19.5+x,my,Math.abs(x)==3?E:x==0?"#b8b8c4":WH)}}
  else{for(let x=-2;x<=2;x++)P(19.5+x,my+(Math.abs(x)==2?1:0),E);P(19,my+1,"#7a2a36");P(20,my+1,"#7a2a36");for(let x=-1;x<=1;x++)P(19.5+x,my+2,E);P(19,my+2,E)}
  // acessórios de rosto
  if(face=="human"){
   if(acc.includes("freck"))[[11,22],[13,23],[12,24],[26,22],[28,23],[27,24]].forEach(([x,y])=>P(x,y,hex(mul(SK,.68))));
   if(acc.includes("must")||role=="mayor"){for(let x=-4;x<=4;x++)P(19.5+x,22+(Math.abs(x)>=3?1:0)+1,hex(HA));for(let x=-3;x<=3;x++)P(19.5+x,22,hex(HA))}
   if(acc.includes("glass")||role=="critic")eyes.forEach(([cx,cy])=>{for(let a=0;a<24;a++){const t=a/24*Math.PI*2;P(cx+Math.cos(t)*4,cy+.4+Math.sin(t)*3.3,role=="critic"?"#c0392b":"#3a3a4a")}P(19,18,"#3a3a4a");P(20,18,"#3a3a4a")});
   if(acc.includes("ear")&&!role){[[8,22],[8,23],[31,22],[31,23]].forEach(([x,y])=>P(x,y,"#f7c331"))}}
 }
 /* ---------- composição: 3 quadros × 5 expressões num ImageData só; contorno tingido igual ao das frutas ---------- */
 const W3=PW*3,H5=PH*EXS.length,img=new ImageData(W3,H5),p32=new Uint32Array(img.data.buffer);
 // contorno = vizinho a 30%; tons de contorno parecidos viram o mesmo (limite de cores por sprite)
 const olp=[],olm=new Map(),OLm=h=>{let u=olm.get(h);if(u===undefined){const q=mul(hexToRgb(h),.3).map(Math.round),m=olp.find(p=>Math.abs(p[0]-q[0])+Math.abs(p[1]-q[1])+Math.abs(p[2]-q[2])<=OLT);if(m)u=m[3];else{u=U32(hex(q));olp.push([q[0],q[1],q[2],u])}olm.set(h,u)}return u};
 const base=[0,1].map(oy=>{const f=Bo.map(rw=>rw.slice());
  for(let y=PH-1;y>=0;y--)for(let x=0;x<PW;x++){const v=Ho[y][x];if(v&&y+oy<PH)f[y+oy][x]=v}
  // sombra do queixo: 2 linhas logo abaixo da cabeça, só sobre o corpo
  for(let x=0;x<PW;x++)for(let y=PH-3;y>0;y--)if(Ho[y-oy]&&Ho[y-oy][x]&&!(Ho[y+1-oy]||[])[x]&&Bo[y+1][x]&&k!="ghost"&&Hd.mat[y-oy][x]!="hairb"){[1,2].forEach(d=>{if(Bo[y+d]&&Bo[y+d][x]&&!(Ho[y+d-oy]||[])[x])f[y+d][x]=hex(mul(hexToRgb(Bo[y+d][x]),d==1?.72:.86))});break}
  return f});
 EXS.forEach((ex,r)=>[[0,false],[1,false],[0,true]].forEach(([oy,bl],fi)=>{const f=base[oy].map(rw=>rw.slice());drawFace(f,ex,bl,oy);
  // acessórios de cabelo (fora do rosto)
  const P=(x,y,cc)=>{y+=oy+hy;if(y>=0&&y<PH&&x>=0&&x<PW)f[y][x]=cc};
  if(human&&!hat&&!role){if(acc.includes("bow")){[[27,3],[28,2],[29,3],[28,4],[27,4],[26,3],[30,4],[31,3],[32,2],[33,3],[32,4],[31,4]].forEach(([x,y],i)=>P(x,y,hex(i<6?AC:shd(AC))));P(29,3,hex(shd(shd(AC))));P(30,3,hex(shd(shd(AC))))}
   else if(acc.includes("flower")){[[26,5],[28,5],[27,4],[27,6]].forEach(([x,y])=>P(x,y,"#ff7aa2"));P(27,5,"#ffe84a")}
   else if(acc.includes("leaf")){[[27,4],[28,3],[29,3],[30,2],[28,4],[29,4]].forEach(([x,y],i)=>P(x,y,i%3?"#5fb33a":"#3f8a2e"))}}
  if(c.vip){const top=human?1:k=="robot"?5:k=="frog"?4:k=="ghost"?2:k=="bunny"?10:3;for(let x=-4;x<=4;x++){P(Math.round(19.5+x),top+2,"#f7c331");P(Math.round(19.5+x),top+3,"#d4a017")}[[-4,0],[0,-1],[4,0]].forEach(([x,y])=>{P(Math.round(19.5+x),top+y,"#ffe27a");P(Math.round(19.5+x),top+y+1,"#f7c331")});P(19,top+2,"#e74c3c");P(20,top+2,"#e74c3c")}
  const o=(r*PH)*W3+fi*PW;
  for(let y=0;y<PH;y++){const row=f[y];for(let x=0;x<PW;x++){const v=row[x];let u=0;
   if(v)u=U32(v);else{const n=row[x+1]||row[x-1]||(f[y+1]&&f[y+1][x])||(f[y-1]&&f[y-1][x]);if(n)u=OLm(n)}
   if(u)p32[o+y*W3+x]=u}}}));
 const cv=document.createElement("canvas");cv.width=W3;cv.height=H5;cv.getContext("2d").putImageData(img,0,0);return cv}
// cor "#rrggbb" -> pixel RGBA de 32 bits (little-endian); contorno = cor vizinha a 30%
const OLT=64,U32c=new Map();
function U32(h){let u=U32c.get(h);if(u===undefined){const n=parseInt(h.slice(1),16);u=(0xFF000000|((n&255)<<16)|(n&0xFF00)|(n>>16))>>>0;U32c.set(h,u)}return u}
/* ---------- cache: 1 folha por cliente, no máximo 12 (os 3 da tela + os que acabaram de sair) ---------- */
const sheets=new Map();
function sheet(c){const key=ckey(c);let s=sheets.get(key);if(s){sheets.delete(key);sheets.set(key,s);return s}
 const cv=build(c);s={cv,url:cv.toDataURL(),frames:{}};sheets.set(key,s);if(sheets.size>12)sheets.delete(sheets.keys().next().value);return s}
function frame(c,ex){const s=sheet(c);if(!s.frames[ex]){const t=document.createElement("canvas");t.width=PW;t.height=PH;t.getContext("2d").drawImage(s.cv,0,-EXS.indexOf(ex)*PH);s.frames[ex]=t.toDataURL()}return s.frames[ex]}
return{sheet,frame,build,sheets,EXS}})();
// expressão a partir dos estados que já existem (nenhum campo novo no save)
const exOf=c=>{if(c.mood=="happy")return"happy";if(c.mood=="sad")return"sad";if(c.leaving)return"sad"; // saindo sem ser atendido (fim do dia)
 const l=leftOf(c);return l<.12?"angry":l<.2?"worry":"ok"};
const charSheet=c=>CH.sheet(c);
function personImg(p,ex){return CH.frame(p,ex||exOf(p))}
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
const saveCfg=()=>{try{localStorage.setItem("frutodromo_cfg",JSON.stringify(CFG))}catch(e){}};const dayLen=()=>150000;
function level(){return 1+Math.floor(S.delivered/3)}
const now=()=>S.clock;
function baseFruit(b){const c=typeof b[4]=="string"?COLORS[b[4]].slice():b[4].slice();return{id:"f"+(S.id++),tip:b[0]=="Banana"?"#6b4423":b[0]=="Pimenta-Dragão"?"#3f9a3a":null,root:b[0].split(/[ -]/)[0],shape:b[1],pat:b[2],top:b[3],rgb:c,doce:b[5],az:b[6],tam:b[7],gen:0,mut:false,el:b[10]||null,hero:false,base:b[0]}}
let SPREAD=new WeakSet(); // frutas iniciais de jogo novo: placeDeco as afasta de enfeites e de outras frutas uma vez
function fresh(){S={v:2,bag:[{t:"grow"},{t:"shrink"}],potPos:null,coins:25,delivered:0,id:1,fruits:[],pot:[],cust:[null,null,null],clock:0,day:1,dayT:0,ds:{earn:0,served:0,best:0,dex:0},dex:{},tree:{},started:false};
[0,1,2,4,5,6].forEach((bi,i)=>{const f=baseFruit(BASE[bi]);f.x=14+(i%3)*104;f.y=12+Math.floor(i/3)*92;S.fruits.push(f)})}
// Confere um progresso vindo do save ou de um backup e completa o que faltar. Retorna null se não der pra usar.
function normState(d,strict){const okF=f=>f&&typeof f=="object"&&typeof f.id=="string"&&Array.isArray(f.rgb)&&f.rgb.length==3&&["tam","doce","az"].every(k=>typeof f[k]=="number"&&isFinite(f[k]));
 if(!d||typeof d!="object"||!Array.isArray(d.fruits)||!d.tree||typeof d.tree!="object"||Array.isArray(d.tree))return null;
 if(strict&&!(["coins","delivered","day","dayT"].every(k=>typeof d[k]=="number"&&isFinite(d[k]))&&Array.isArray(d.cust)))return null;
 const keep=S;fresh();const b=S;S=keep;const num=(v,def,min)=>typeof v=="number"&&isFinite(v)&&(min==null||v>=min)?v:def,obj=(v,def)=>v&&typeof v=="object"&&!Array.isArray(v)?v:def;
 const o={...b,...d,v:typeof d.v=="number"?d.v:1,coins:num(d.coins,b.coins,0),delivered:num(d.delivered,0,0),id:num(d.id,1,1),clock:num(d.clock,0,0),day:num(d.day,1,1),dayT:num(d.dayT,0,0),
  fruits:d.fruits.filter(okF),pot:Array.isArray(d.pot)?d.pot.filter(okF):[],ds:{...b.ds,...obj(d.ds,{})},dex:obj(d.dex,{}),tree:d.tree,
  cust:Array.isArray(d.cust)?[0,1,2].map(i=>{const c=d.cust[i];return c&&typeof c=="object"&&Array.isArray(c.reqs)&&typeof c.name=="string"?c:null}):[null,null,null],
  bag:Array.isArray(d.bag)?d.bag.filter(x=>x&&typeof x.t=="string"):b.bag};
 const mx=Math.max(0,...o.fruits.concat(o.pot).map(f=>parseInt(f.id.slice(1))||0));if(o.id<=mx)o.id=mx+1;return o}
// saves antigos (v1): máscaras viram compactas e cada espécie ganha sua 1ª variedade com DNA
function migrate(){S.tree=S.tree||{};if((S.v||1)<2){[...S.fruits,...(S.pot||[])].forEach(f=>{if(f.mask)f.mask=packMask(f.mask)});Object.values(S.tree).forEach(t=>{if(t.img&&t.img.mask)t.img.mask=packMask(t.img.mask);if(!t.v){const st=t.st||{};t.v={[dnaCode({...t.img,doce:st.doce,az:st.az,tam:st.tam,rgb:st.rgb||t.img.rgb,el:st.el,hero:st.hero,shiny:t.shiny})]:{n:1,t:t.t||Date.now()}}}});S.v=2}}
try{S=normState(JSON.parse(localStorage.getItem("frutodromo9")))}catch(e){S=null}const HAD_LOCAL=!!S,LOCAL_TS=S&&S.ts||0;if(!S){fresh();S.fruits.forEach(f=>SPREAD.add(f))}
// salvar: agrupa vários pedidos seguidos num só (800 ms); fechar/trocar de aba grava na hora; avisa uma vez se o espaço acabar
let saveTimer=null,saveWarned=false;
const cgData=()=>{try{return typeof PORTAL!="undefined"&&PORTAL.ready&&PORTAL.data?PORTAL.sdk.data:null}catch(e){return null}};
const saveNow=()=>{clearTimeout(saveTimer);saveTimer=null;S.ts=Date.now();const js=JSON.stringify(S),d=cgData();if(d){try{d.setItem("frutodromo9",js)}catch(e){}}try{localStorage.setItem("frutodromo9",js)}catch(e){if(!saveWarned&&typeof toast=="function"){saveWarned=true;toast("<b>Não deu pra salvar!</b> Faça um backup em Ajustes.",{err:true})}}};
const save=()=>{if(!saveTimer)saveTimer=setTimeout(saveNow,800)};
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
const imgOf=f=>({shape:f.shape,mask:f.mask,tip:f.tip,pat:f.pat,top:f.top,rgb:f.rgb,rgb2:f.rgb2,hero:f.hero,cape:f.cape,shiny:!!f.shiny});
const VAR_IMG_MAX=24,varCount=t=>t&&t.v?Object.keys(t.v).length:1,totalVars=()=>Object.values(S.tree||{}).reduce((a,t)=>a+varCount(t),0);
// variedade: mesma espécie, DNA diferente. A 1ª variedade usa a imagem da espécie; as próximas guardam a própria (até 24 por espécie)
function addVariety(k,f,silent){const t=S.tree[k],dna=f.dna||(f.dna=dnaCode(f));t.v=t.v||{};if(t.v[dna])return false;const n=Object.keys(t.v).length+1;
 t.v[dna]=n==1?{n,t:Date.now()}:n<=VAR_IMG_MAX?{n,t:Date.now(),img:imgOf(f)}:{n,t:Date.now()};
 if(!silent&&n>1){rec("vars",1);setTimeout(()=>{toast(`<b>VARIEDADE NOVA!</b> nº ${n} de ${spLabel(k).split(" · ").slice(0,2).join(" · ")}<br>DNA <b>#${dna}</b>`);SFX.dex()},900)}return true}
function treeAdd(f,parents,silent){S.tree=S.tree||{};const k=spKey(f);f.sp=k;f.dna=dnaCode(f);if(S.tree[k]){addVariety(k,f,silent);if(f.shiny&&!S.tree[k].shiny){S.tree[k].shiny=true;S.tree[k].img={...S.tree[k].img,rgb2:f.rgb2,pat:f.pat};if(!silent)setTimeout(()=>reveal(k,true),1000)}return false}
const pk=parents?[...new Set(parents.map(p=>p.sp||spKey(p)))]:[];const d=pk.length?Math.max(...pk.map(x=>(S.tree[x]||{d:0}).d))+1:0;
S.tree[k]={v:{[f.dna]:{n:1,t:Date.now()}},n:Object.keys(S.tree).length+1,name:f.base||fname(f),d,par:pk,t:Date.now(),img:{shape:f.shape,mask:f.mask,tip:f.tip,pat:f.pat,top:f.top,rgb:f.rgb,rgb2:f.rgb2,hero:f.hero,cape:f.cape},shiny:!!f.shiny,day:S.day,st:{doce:f.doce,az:f.az,tam:f.tam,rgb:f.rgb,el:f.el,hero:f.hero}};
if(!silent){S.ds.dex++;setTimeout(checkAch,0);const t=S.tree[k],n=t.n,st=stars(t);if(st>=3||t.d>=2||t.shiny)setTimeout(()=>reveal(k),1000);else setTimeout(()=>{toast(`<b>NOVA ESPÉCIE nº ${n}!</b><br>${spLabel(k)}`);SFX.dex()},900)}
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
function newCust(){if(running)setTimeout(()=>SFX.bell(),200);const L=level(),vip=L>=3&&Math.random()<.15;let n=Math.min(3,1+Math.floor((L-1)/2)+(Math.random()<.3?1:0));if(vip)n=Math.min(4,n+1);
const pool=reachPool(L),maxD=Math.max(...pool.map(x=>x.d));
// alvo: nível baixo pede coisas perto da feira; VIP pede o mais fundo
const want=vip?maxD:Math.min(maxD,R([0,1,1,2,2,3].filter(d=>d<=maxD))),cand=pool.filter(x=>x.d==want&&(L>=5||!x.hero)&&(L>=3||!x.el));
const t=R(cand.length?cand:pool),spReq=!vip&&Math.random()<(L<=2?.7:.5),reqs=spReq?[{k:"sp",v:spKey(t),im:stImg(t)}]:reqsFrom(t,n,L);
let rw=4+reqs.length*5+L*2+t.d*6+(spReq?8+t.d*4:0);reqs.forEach(r=>{if(r.k=="el")rw+=12;if(r.k=="mini"||r.k=="enorme")rw+=10;if(r.k=="micro"||r.k=="giga")rw+=22;if(r.k=="hero")rw+=30});if(vip)rw*=3;
const kd=Math.random()<.45?R(KINDS):null;
const vipN=vip?R(VIPS):null,kdN=kd?R(kd[2]):null,gen=vip?VIPG[vipN]:kd?(/^(Dona|Rã|Miss)|a$/.test(kdN)?"f":/^(Sr|Seu)|(ão|o)$/.test(kdN)?"m":"n"):R(["f","f","m","m","m","f","n"]);
const ACC=gen=="f"?["freck","glass","ear","scarf","neck","bow","flower","leaf","ear","bow"]:gen=="m"?["freck","must","glass","scarf","neck","tie","leaf","tie"]:["freck","glass","scarf","neck","leaf"],acc=[];for(let q=0;q<N(0,2);q++)acc.push(R(ACC));
const hsG=gen=="f"?[1,1,2,2,3,5,7,4]:gen=="m"?[0,0,0,6,8,4,0,8]:[0,2,4,8,6];
const nc={name:vipN||(kd?kdN:R(gen=="f"?NAMESF:gen=="m"?NAMESM:NAMESN)),gen,kind:kd?kd[0]:"person",fur:kd?R(kd[1]):null,vip,skin:R(SKIN),hair:R(HAIR),hs:R(hsG),eyeC:N(0,5),hat:Math.random()<.25?N(1,3):0,hat2:R(SHIRT),sp:N(0,4),acc,acc2:R(SHIRT),mouth:N(0,1),blinkD:Math.random()*4,shirt:R(SHIRT),gl:false,reqs,rw,t0:now(),
pat:(95000+t.d*45000+reqs.length*15000)*(vip?.85:1),come:true,ct:Date.now(),tg:rk(t),td:t.d};charSheet(nc);return nc} // a folha já nasce pronta (antes do cliente entrar), sem travar a chegada
function stImg(x){if(x.img)return x.img;let a=x;while(a.p)a=a.p[0];return {...a.img,rgb:x.rgb,hero:x.hero,cape:x.hero?"#d63031":null}}
function stLabel(x){return x.d==0?x.name:(x.hero?"Super ":"")+sizeName(x.tam)+" "+colorName(x.rgb)+(x.el?" "+ELEM[x.el].n:"")}
function showHint(i){const c=S.cust[i];if(!c)return;const L=level(),pool=reachPool(L);const ok=pool.filter(x=>c.reqs.every(r=>meets(x,r))).map(x=>[x,recipeOf(x).length]).sort((a,b)=>a[1]-b[1]);let t=ok.length?ok[0][0]:null;
let h=`<h2>COMO FAZER?</h2><p style="margin-top:0">Pedido de <b>${c.name}</b></p>`;
if(!t)h+="<p>Hmm, esse pedido ficou difícil. Pode trocar por outro cliente esperando ele ir embora.</p>";
else if(t.d==0)h+=`<p>É só comprar na feira:</p><div class="rstep"><span class="fi"><img src="${fruitImg(stImg(t))}"><span class="nn">${t.name}</span></span></div>`;
else{const st=recipeOf(t);h+=`<p>${st.length} cruzamento${st.length>1?"s":""} no caldeirão:</p>`+st.map((x,k)=>{const[a,b]=x.p,fi=y=>`<span class="fi"><img src="${fruitImg(stImg(y))}"><span class="nn">${stLabel(y)}</span></span>`;return `<div class="rstep"><b>${k+1}.</b>${fi(a)}<b>+</b>${fi(b)}<b>=</b>${fi(x)}</div>`}).join("")+`<p style="font-size:var(--t12);opacity:.75">As frutas da feira estão lá embaixo. Use o resultado de cada passo no passo seguinte.</p>`}
openModal(h+`<button class="big" id="cl">ENTENDI</button>`);$("cl").onclick=closeModal}
function meets(f,r){switch(r.k){case"cor":return colorName(f.rgb)==r.v;case"doceMin":return f.doce>=r.v;case"doceMax":return f.doce<=r.v;case"azMin":return f.az>=r.v;case"azMax":return f.az<=r.v;
case"tamMin":return f.tam>=r.v;case"tamMax":return f.tam<=r.v;case"media":return f.tam>=4&&f.tam<=7;case"mini":return f.tam<=1;case"micro":return f.tam==0;case"enorme":return f.tam>=11;case"giga":return f.tam==12;case"el":return f.el==r.v;case"hero":return !!f.hero;case"sp":return spKey(f)==r.v}}
const LAB={doce:["DOCE","#ff5f9e"],az:["AZEDO","#9ccc2e"],tam:["TAM.","#3fa7e0"]};
function cells(fn,col){let s="";for(let i=1;i<=10;i++)s+=`<i style="${fn(i)?"background:"+col:""}"></i>`;return `<span class="cells">${s}</span>`}
const RICO={doce:()=>art(["..p..",".ppp.","ppwpp",".ppp.","..p.."],{p:"#ff5f9e",w:"#ffd0e4"},"#8a2050"),az:()=>art([".yy..","yyyy.","yyyyy",".yyyy","..yy."],{y:"#d6e84a"},"#5a6a10"),
tam:()=>art(["..b..",".bbb.","..b..","..b..","..b..",".bbb.","..b.."],{b:"#3fa7e0"},"#164a6a"),hero:()=>art(["..m..","rrmrr","rrrrr","rr.rr","r...r"],{m:"#1a1a2a",r:"#d63031"},"#5a1010")};
function reqWord(r){switch(r.k){
case"doceMin":return[r.v>=8?"MUITO DOCE":"DOCE",r.v+"+","doce"];case"doceMax":return[r.v<=2?"NADA DOCE":"POUCO DOCE","até "+r.v,"doce"];
case"azMin":return[r.v>=8?"MUITO AZEDA":"AZEDA",r.v+"+","az"];case"azMax":return[r.v<=2?"NADA AZEDA":"POUCO AZEDA","até "+r.v,"az"];
case"tamMin":return[r.v>=8?"GRANDE":"TAMANHO",r.v+"+","tam"];case"tamMax":return[r.v<=3?"PEQUENA":"TAMANHO","até "+r.v,"tam"];case"media":return["MÉDIA","4 a 7","tam"];
case"mini":return["MINI","0 ou 1","tam"];case"micro":return["MICROSCÓPICA","0","tam"];case"enorme":return["ENORME","11+","tam"];case"giga":return["GIGANTESCA","12","tam"];
case"cor":return[r.v.toUpperCase(),"","cor"];case"el":return[ELEM[r.v].n.toUpperCase(),"","el"];case"hero":return["SUPER-FRUTA","","hero"];case"sp":{const t=S.tree[r.v],[sz,,,el]=r.v.split("|");return[t?t.name.toUpperCase():"ESPÉCIE NOVA",t?"":sz+(el?" · "+ELEM[el].n:""),"sp"]}}}
function reqHTML(r,f){const ok=f?meets(f,r):null,[w,n,ic]=reqWord(r);
const icon=ic=="sp"?`<img class="spi" src="${fruitImg(r.im)}">`:ic=="cor"?`<span class="sw" style="background:${hex(COLORS[r.v])}"></span>`:ic=="el"?(u=>`<img class="ico" src="${u}" style="${sz(u)}">`)(SPR[r.v]()):(u=>`<img class="ico" src="${u}" style="${sz(u)}">`)(RICO[ic]());
return `<div class="rq ${ok===true?"y":ok===false?"n":""} ${ic=="cor"?"cor":""} ${ic=="sp"?"rsp":""}" ${ic=="cor"?`onclick="colorGuide('${r.v}')"`:""}>${icon}${ic=="sp"?`<span class="spt"><b style="${w.length>9?"font-size:var(--t10);letter-spacing:-.4px":""}">${w}</b>${n?`<span class="nb">${n}</span>`:""}</span>`:`<b style="${w.length>9?"font-size:var(--t10);letter-spacing:-.4px":""}">${w}</b>${n?`<span class="nb">${n}</span>`:""}`}${ok===null?"":`<i class="ck">${ok?"✓":"✗"}</i>`}</div>`}
const leftOf=c=>CFG.zen?1:cl(1-(now()-c.t0)/c.pat,0,1),pay=c=>Math.round(c.rw*(.5+.5*leftOf(c)));
const WALK_IN=1500,WALK_OUT=1000;let sel=null,hoverCust=-1;
function renderCounter(){const f=sel?S.fruits.find(x=>x.id==sel):null;
if(!running&&S.cust.every(c=>!c)){$("custs").innerHTML=`<div class="closed">${S.started?'<span class="px" style="padding:4px 10px">QUITANDA FECHADA</span>':""}</div>`;return}
$("custs").innerHTML=S.cust.map((c,i)=>{if(!c)return `<div class="cust"></div>`;const left=leftOf(c);
const ok=f&&c.reqs.every(r=>meets(f,r)),ex=c.leaving&&c.mood=="happy"?"happy":exOf(c),sh=charSheet(c);const on=Math.ceil(left*10),pc=left>.5?"#3ce06f":left>.2?"#f4a261":"#e74c3c";
let pat="";for(let s=0;s<10;s++)pat+=`<i style="${s<on?"background:"+pc:""}"></i>`;
const nowR=Date.now(),inT=nowR-(c.ct||0),outT=nowR-(c.lt||0),coming=!c.leaving&&inT<WALK_IN,Wsc=$("scene").clientWidth,cx=(i+.5)*Wsc/3,dir=i==0?-1:i==2?1:((c.ct||0)%2?1:-1),fx=2*Math.round((dir<0?-(cx+70):(Wsc-cx+70))/2);
const cls=(hoverCust==i||ok?"hot ":"")+(c.leaving?"leave ":"")+(coming?"come ":"")+(c.mood=="sad"?"sad ":"")+(c.vip?"vip":"");
return `<div class="cust ${cls} ${c.mood=="happy"?"happy":""} ${left<.12&&!c.mood?"angry":""}" data-i="${i}" data-low="${left<.2?1:0}" style="--fx:${fx}px;--wd:-${Math.min(inT,WALK_IN)}ms;--bd:${Math.max(0,WALK_IN-inT)}ms;--ld:-${Math.min(outT,WALK_OUT)}ms"><div class="bub px"><span class="bn">${c.name}</span>${c.vip?'<span class="vipb">VIP x3</span>':""}${c.reqs.map(r=>reqHTML(r,f)).join("")}
<div class="pay"><span class="coin"></span><b>${pay(c)}</b><span class="hint" onclick="event.stopPropagation();showHint(${i})">?</span></div><div class="pat">${pat}</div></div><div class="pw" onclick="showPortrait(${i})"><div class="chr" data-ex="${ex}" style="background-image:url(${sh.url});animation-delay:-${(c.blinkD||0).toFixed(2)}s"></div></div>${left<.2&&!c.leaving?'<span class="sweat"></span>':""}${left<.12&&!c.leaving?'<span class="puff"><i></i><i></i></span>':""}</div>`}).join("");
S.cust.forEach(c=>{if(c)c.come=false});
 const wl=S.cust.map(c=>c&&!c.leaving?WALK_IN-(Date.now()-(c.ct||0)):-1).filter(t=>t>0);if(wl.length){clearTimeout(renderCounter.wt);renderCounter.wt=setTimeout(renderCounter,Math.max(...wl)+60)}}
/* ================= mesa ================= */
const tbl=$("table");
const scale=f=>f.tam==0?1:f.tam==1?2:f.tam<=3?3:f.tam<=7?4:f.tam<=10?5:f.tam==11?6:7,fsize=f=>f.tam==0?40:W*scale(f);
function fxHTML(f,s){if(!f.el)return"";const src=SPR[f.el](),o=[],R2=Math.round;
if(f.el=="fogo"){const k=s/18>=5?3:2,d=ADIM[src]||[9,11];o.push(`<img class="fx fx-fogo" src="${src}" style="left:${R2(s*.32)}px;top:${R2(-s*.22)}px;width:${d[0]*k}px;height:${d[1]*k}px">`);o.push(`<img class="fx fx-fogo" src="${src}" style="left:${R2(s*.02)}px;top:${R2(s*.18)}px;width:${d[0]*2}px;height:${d[1]*2}px;animation-delay:-.15s">`);o.push(`<img class="fx fx-fogo" src="${src}" style="left:${R2(s*.74)}px;top:${R2(s*.12)}px;width:${d[0]*2}px;height:${d[1]*2}px;animation-delay:-.1s">`)}
else{const cls="fx-tw",pos=[[.05,.05],[.78,.12],[.12,.72],[.82,.7],[.46,-.08]];pos.forEach(([x,y],k)=>o.push(`<img class="fx ${cls}" src="${src}" style="left:${R2(s*x)}px;top:${R2(s*y)}px;${sz(src)};animation-delay:-${k*.27}s">`))}
return o.join("")}
function renderTable(newId){tbl.querySelectorAll(".fr").forEach(e=>e.remove());$("tip").style.display=S.fruits.length?"none":"";
S.fruits.forEach(f=>{const d=document.createElement("div");d.className="fr"+(f.id==newId?" new":"")+(f.id==sel?" sel":"")+(f.tam==0?" micro":"")+(f.el?" el-"+f.el:"")+(f.shiny?" shiny":"");d.dataset.id=f.id;const s=fsize(f);
d.style.width=d.style.height=s+"px";d.style.left=f.x+"px";d.style.top=f.y+"px";d.style.setProperty("--d",(parseInt(f.id.slice(1))%7)*.3+"s");d.innerHTML=`<img src="${fruitImg(f)}">`+fxHTML(f,s)+(f.shiny?[[.1,.15],[.75,.05],[.85,.65],[.2,.8]].map(([x,y],k)=>`<span class="spk" style="left:${Math.round(s*x)}px;top:${Math.round(s*y)}px;animation-delay:-${k*.3}s"></span>`).join(""):"")+(f.mut?'<span class="mut">MUT</span>':"");tbl.appendChild(d);drag(d,f)})}
// procura um lugar livre perto de onde a fruta está (não cobre outra fruta nem o caldeirão/lixo)
// enfeites sólidos do chão (caixotes, barril, cesto, saco, balança): obstáculo pras frutas. Tapetes (data-k="rug") ficam de fora: pode ter fruta por cima.
function decoBlocks(pad){return[...tbl.querySelectorAll(".dobj")].filter(e=>e.dataset.k!="rug").map(e=>[e.offsetLeft-pad,e.offsetTop-pad,e.offsetWidth+2*pad,e.offsetHeight+2*pad])}
// decoOnly: só evita caldeirão, lixeira e enfeites (frutas novas); sem ele evita também outras frutas
function freeSpot(f,decoOnly){const s=fsize(f),pr=$("pot"),br=$("bin"),blk=[[pr.offsetLeft,pr.offsetTop,pr.offsetWidth,pr.offsetHeight],[br.offsetLeft,br.offsetTop,br.offsetWidth,br.offsetHeight],...decoBlocks(4)];
 const hit=(x,y)=>blk.some(([bx,by,bw,bh])=>x<bx+bw&&x+s>bx&&y<by+bh&&y+s>by)||(!decoOnly&&S.fruits.some(o=>o!=f&&x<o.x+fsize(o)-8&&x+s>o.x+8&&y<o.y+fsize(o)-8&&y+s>o.y+8));
 if(!hit(f.x,f.y))return;const x0=f.x,y0=f.y;for(let r=20;r<400;r+=18)for(let a=0;a<12;a++){const x=cl(x0+Math.cos(a/12*Math.PI*2)*r,0,Math.max(0,tbl.clientWidth-s)),y=cl(y0+Math.sin(a/12*Math.PI*2)*r,fruitTop(tbl.clientHeight,s),Math.max(fruitTop(tbl.clientHeight,s),tbl.clientHeight-s));if(!hit(x,y)){f.x=x;f.y=y;return}}
 // anéis não acharam: varre a mesa inteira de 6 em 6 px e fica com o vão livre mais perto
 const lo=fruitTop(tbl.clientHeight,s);let bd=1e9,bx=null,by=0;for(let y=lo;y<=Math.max(lo,tbl.clientHeight-s);y+=6)for(let x=0;x<=Math.max(0,tbl.clientWidth-s);x+=6)if(!hit(x,y)){const d=(x-x0)**2+(y-y0)**2;if(d<bd){bd=d;bx=x;by=y}}
 if(bx!=null){f.x=bx;f.y=by}}
// topo mínimo das frutas: os 24 px de cima da mesa são a face vertical do balcão
const TOPMIN=24,fruitTop=(th,s)=>Math.min(TOPMIN,Math.max(0,th-s));
function clampPos(f){if(!tbl.clientWidth||!tbl.clientHeight)return;const s=fsize(f),lo=fruitTop(tbl.clientHeight,s);f.x=cl(f.x,0,Math.max(0,tbl.clientWidth-s));f.y=cl(f.y,lo,Math.max(lo,tbl.clientHeight-s))}
function center(el){const r=el.getBoundingClientRect();return[r.left+r.width/2,r.top+r.height/2]}
function inside(x,y,el){const r=el.getBoundingClientRect();return x>r.left&&x<r.right&&y>r.top&&y<r.bottom}
function custAt(x,y){let k=-1;document.querySelectorAll(".cust").forEach(c=>{if(c.dataset.i!==undefined&&inside(x,y,c))k=+c.dataset.i});return k}
function drag(el,f){let sx,sy,ox,oy,mv=false,on=false,gh=null;
// #table tem overflow:hidden: durante o arraste a fruta aparece num "fantasma" fixo no body (visível sobre cena, balões e feira); o original fica invisível mas é ele que recebe os eventos e dá a posição
const ghMake=()=>{const r=el.getBoundingClientRect();gh=el.cloneNode(true);gh.removeAttribute("data-id");gh.classList.remove("drag","sel","new");gh.classList.add("gh");gh.style.cssText=`left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px`;document.body.appendChild(gh);el.classList.add("gsrc")};
const ghMove=()=>{if(!gh)return;if(!el.isConnected){ghKill();return}const r=el.getBoundingClientRect();gh.style.left=r.left+"px";gh.style.top=r.top+"px"};
const ghKill=()=>{if(gh){gh.remove();gh=null}el.classList.remove("gsrc")};
el.addEventListener("pointerdown",e=>{if(modalOpen)return;e.preventDefault();el.setPointerCapture(e.pointerId);sx=e.clientX;sy=e.clientY;ox=f.x;oy=f.y;mv=false;on=true});
el.addEventListener("pointermove",e=>{if(!on)return;const dx=e.clientX-sx,dy=e.clientY-sy;if(!mv&&Math.abs(dx)+Math.abs(dy)<6)return;
if(!mv){mv=true;el.classList.add("drag");sel=f.id;showInfo(null);renderCounter();ghMake()}
el.style.left=ox+dx+"px";el.style.top=oy+dy+"px";const[cx,cy]=center(el);ghMove();
{const op=!brewing&&inside(cx,cy,$("pot"));$("pot").classList.toggle("hot",op);el.classList.toggle("overpot",op);if(gh)gh.classList.toggle("overpot",op)}$("bin").classList.toggle("hot",inside(cx,cy,$("bin")));
const hc=custAt(cx,cy);if(hc!=hoverCust){hoverCust=hc;document.querySelectorAll(".cust").forEach(c=>c.classList.toggle("hot",c.dataset.i!==undefined&&+c.dataset.i===hc))}});
const up=e=>{if(!on)return;on=false;ghKill();if(mv)SPREAD.delete(f);el.classList.remove("drag");$("bin").classList.remove("hot");$("pot").classList.remove("hot");
if(!mv&&armed){useItem(f);return}if(!mv){sel=sel==f.id?null:f.id;showInfo(sel?f:null);renderCounter();tbl.querySelectorAll(".fr").forEach(x=>x.classList.toggle("sel",x.dataset.id==sel));return}
const[cx,cy]=center(el);const hc=custAt(cx,cy);hoverCust=-1;
if(hc>=0&&S.cust[hc]&&!S.cust[hc].leaving){deliver(f,hc,ox,oy);return}
if(inside(cx,cy,$("bin"))){sell(f);return}
if(inside(cx,cy,$("pot"))){if(brewing||S.pot.length>=2){f.x=ox;f.y=oy;renderTable();return toast("O caldeirão está ocupado!")}addToPot(f);return}
f.x=ox+(e.clientX-sx);f.y=oy+(e.clientY-sy);clampPos(f);freeSpot(f,true);sel=null;save();renderTable();renderCounter()};
// cancelamento do sistema (ligação, gesto do navegador...): volta tudo como estava, sem vender, entregar nem usar item
const cancel=()=>{if(!on)return;on=false;ghKill();el.classList.remove("drag","overpot");$("bin").classList.remove("hot");$("pot").classList.remove("hot");
 hoverCust=-1;document.querySelectorAll(".cust.hot").forEach(c=>c.classList.remove("hot"));if(mv){f.x=ox;f.y=oy;renderTable();renderCounter()}};
el.addEventListener("pointerup",up);el.addEventListener("pointercancel",cancel)}
function sell(f){const v=(1+Math.floor(f.gen/2)+(f.mut?2:0)+(f.el?3:0)+(f.hero?6:0)+(f.tam==0||f.tam>=11?4:0));const br=$("bin").getBoundingClientRect();flyCoins(br.left+br.width/2,br.top+br.height/2,v,0);S.coins+=v;showCoins();undoOffer(f,v);floatText(br.left+br.width/2,br.top,"+"+v);buzz(15);S.ds.earn+=v;
S.fruits=S.fruits.filter(x=>x!=f);sel=null;showInfo(null);save();renderTable();renderCounter();renderMarket()}
function deliver(f,i,ox,oy){const c=S.cust[i];
if(!c.reqs.every(r=>meets(f,r))){f.x=ox;f.y=oy;renderTable();c.mood="sad";renderCounter();SFX.bad();buzz(120);{const ce=document.querySelector(`.cust[data-i="${i}"] .bub`);if(ce){const r=ce.getBoundingClientRect();floatText(r.left+r.width/2,r.top+20,"✗","#ff5a4e")}}const miss=c.reqs.map((r,k)=>[r,k]).filter(([r])=>!meets(f,r));document.querySelectorAll(`.cust[data-i="${i}"] .rq`).forEach((e,k)=>{if(miss.some(m=>m[1]==k))e.classList.add("n","miss")});
setTimeout(()=>{if(S.cust[i]==c){c.mood=null;renderCounter()}},1600);if(miss.some(([r])=>r.k=="sp")){const h=document.querySelector(`.cust[data-i="${i}"] .hint`);if(h)h.classList.add("nudge");return toast("Não é essa espécie! Toque no <b>?</b> pra ver a receita.")}
return toast(`Faltou: <b>${miss.map(([r])=>{const[w,n]=reqWord(r);return w+(n?" "+n:"")}).join(", ")}</b>`)}
const cb=comboHit(),bonus=cb>=2?Math.round(pay(c)*Math.min(.5,(cb-1)*.1)):0,v=pay(c)+bonus,L0=level();const ce=document.querySelector(`.cust[data-i="${i}"] .bub`).getBoundingClientRect();S.coins+=v;flyCoins(ce.left+ce.width/2,ce.top+ce.height/2,v,v);floatText(ce.left+ce.width/2,ce.top+10,"+"+v);if(cb>=2)setTimeout(()=>floatText(ce.left+ce.width/2,ce.top+40,`COMBO x${cb}!`,"#ff8ad8"),250);buzz([20,40,30]);
S.delivered++;S.ds.served++;if(c.vip)rec("vips",1);checkAch();tutDone("t2");S.ds.earn+=v;S.ds.best=Math.max(S.ds.best,v);S.fruits=S.fruits.filter(x=>x!=f);sel=null;showInfo(null);c.mood="happy";renderTable();renderCounter();renderMarket();
toast(`${c.name} adorou! <b>+${v}</b> moedas${level()>L0?`<br><b>NÍVEL ${level()}!</b>${newUnlock(level())}`:""}`);if(level()>L0){SFX.lvl();shake(5);buzz([40,60,40,60,80])}
{const first=!(S.rec&&S.rec.gifts),n=c.vip?2:(first||Math.random()<.35)?1:0;for(let g=0;g<n;g++)setTimeout(()=>giveItem(rollItem(),ce.left+ce.width/2,ce.top+ce.height/2,"de "+c.name),600+g*700);if(n)rec("gifts",n)}
setTimeout(()=>{c.leaving=true;c.lt=Date.now();renderCounter();setTimeout(()=>{S.cust[i]=null;renderCounter();setTimeout(()=>{if(running&&!S.cust[i]){S.cust[i]=newCust();save();renderCounter()}},700)},WALK_OUT)},900)}
function newUnlock(L){const extra={2:"Clientes pedem frutas MINI e ENORMES",3:"Pedidos de FOGO e clientes VIP",4:"Pedidos de GELO e cores raras",5:"Microscópicas, Gigantescas e SUPER-FRUTAS"}[L];
return extra?"<br>"+extra:""}
/* ================= info / feira ================= */
// feira: segurar (toque) ou passar o mouse mostra doce/azedo/tamanho antes de comprar
let mkHoldT=null,mkSkip=0,mkPrev=false;
function mkPreview(i){const f=baseFruit(BASE[i]);S.id--;mkPrev=true;showInfo(f);if(S.tut&&S.tut.t3)tutDone("t4")}
function mkDown(i,e){clearTimeout(mkHoldT);mkSkip=0;if(e.pointerType=="mouse")return;mkHoldT=setTimeout(()=>{mkSkip=1;mkPreview(i);buzz(15)},420)}
function mkUp(){clearTimeout(mkHoldT)}
function mkEnter(i,e){if(e.pointerType!="mouse")return;clearTimeout(mkHoldT);mkHoldT=setTimeout(()=>mkPreview(i),350)}
function mkLeave(e){clearTimeout(mkHoldT);if(mkPrev&&e.pointerType=="mouse"){mkPrev=false;if(!sel)showInfo(null)}}
let infoT=null;function infoAuto(f){clearTimeout(infoT);infoT=setTimeout(()=>{if(sel==f.id&&!document.querySelector(".fr.drag")){sel=null;showInfo(null);tbl.querySelectorAll(".fr.sel").forEach(x=>x.classList.remove("sel"))}},4500)}
function showInfo(f){clearTimeout(infoT);const p=$("info");if(!f){p.classList.remove("on");return}p.style.top=Math.round($("scene").getBoundingClientRect().bottom+3)+"px";if(S.tut&&S.tut.t2)tutDone("t3");
const tw=(v,a,b)=>v>=8?"muito "+a:v>=6?a:v<=2?"nada "+a:v<=4?"pouco "+a:"",st=(l,v,c,w)=>`<div class="st"><span>${l}</span>${cells(i=>i<=v,c)}<b style="white-space:nowrap">${v}${w?` <small style="font-weight:400;opacity:.75">${w}</small>`:""}</b></div>`;
const tamTxt=f.tam==0?`<div class="st"><span>Tamanho</span><b>MICROSCÓPICA</b></div>`:f.tam>=11?`<div class="st"><span>Tamanho</span>${cells(()=>1,"#3fa7e0")}<b>${f.tam}!</b></div>`:st("Tamanho",f.tam,"#3fa7e0");
p.innerHTML=`<span class="x" onclick="sel=null;showInfo(null);renderCounter();renderTable()">X</span><img src="${fruitImg(f)}"><div style="flex:1"><div class="t">${fname(f)}</div>
<div class="g">${f.gen?"Geração "+f.gen:"Da feira"} · cor ${colorName(f.rgb)} · ${sizeName(f.tam)} · <b>DNA #${f.dna||dnaCode(f)}</b>${f.mut?'<span class="chip" style="background:#7b5cff">MUTANTE</span>':""}${f.el?`<span class="chip" style="background:${ELEM[f.el].c}">${ELEM[f.el].n.toUpperCase()}</span>`:""}${f.hero?'<span class="chip" style="background:#d63031">SUPER</span>':""}${f.shiny?'<span class="chip" style="background:linear-gradient(90deg,#ff8ad8,#ffe84a,#8af0ff);color:#2a1a12">BRILHANTE</span>':""}</div>
${st("Doce",f.doce,"#ff5f9e",tw(f.doce,"doce"))}${st("Azedo",f.az,"#9ccc2e",tw(f.az,"azeda"))}${tamTxt}${S.pot.length==1&&!S.pot.includes(f)?`<div style="font-size:var(--t12);margin-top:4px;background:#e4dbff;padding:3px 5px"><b>PREVISÃO</b> com ${fname(S.pot[0])}:<br>${predict(f,S.pot[0])}</div>`:""}</div>`;p.classList.add("on")}
const POT=(c)=>art(["..kk..","..kk..",".gggg.","gccccg","gcwccg","gccccg",".gggg."],{k:"#8a5a34",g:"#cfe6ee",c,w:"#ffffff"},"#2a1a12");
const P16=rows=>{rows=rows.map(r=>{const p=16-r.length;return ".".repeat(Math.floor(p/2))+r+".".repeat(Math.ceil(p/2))});while(rows.length<16)rows.length%2?rows.unshift(".".repeat(16)):rows.push(".".repeat(16));return rows};
const FLASK=(c,big,extra)=>{const L=hex(lift(hexToRgb(c),.35)),D=hex(mul(hexToRgb(c),.68));const rows=big?["......kkkk......","......kKKk......",".....gggggg.....","......geeg......","......geeg......",".....geeeeg.....","...gglccccgg....","..gwcccccccccg..",".gwwcccccccccDg.",".gwcccbcccccDDg.",".gccccccccccDDg.",".gcccccbcccccDg.",".gccccccccccDDg.","..gccccccccDDg..","...ggcccccDDgg..",".....gggggg....."]:["................","................","................","................",".......kk.......",".......KK.......","......gggg......",".......ge.......","......gccg......",".....gwcccg.....","....gwccccDg....","....gccbccDg....","....gcccccDg....",".....gccDDg.....","......gggg......","................"];
 return art(extra?extra(rows):rows,{k:"#a87444",K:"#7a4a28",g:"#2a3a4a",e:"#d8eef5",w:"#ffffff",c,l:L,D,b:"#ffffffcc",z:"#ffe84a",Z:"#fff8c0"},"#1a1a20")};
const ITEMSPR={
bag:()=>art(P16([".....ssssss.....","....s......s....","...s........s...","...s........s...",".BBBBBBBBBBBBBB.","BLLLLLLLLLLLLLLB","BhffffffffffffDB","BhfffffffffffffB","BFfffffggffffFFB","BBFFFFgyGgFFFFBB","BLLLLLgGGgLLLLDB","BLLLLLLLLLLLLLDB","BLLLLLLLLLLLLDDB","BDLLLLLLLLLLLDDB","BDDDDDDDDDDDDDDB",".BBBBBBBBBBBBBB."]),{s:"#7a4a28",B:"#5a3418",L:"#c47e45",D:"#9a5a2e",h:"#e0a070",f:"#a8622f",F:"#7a4220",g:"#f7c331",y:"#fff3a0",G:"#b8860b"},"#2a1a12"),
grow:()=>FLASK("#4fd06a",true),
shrink:()=>FLASK("#9b6bff",false),
raio:()=>FLASK("#2a3a7a",true,r=>{r=r.slice();r[8]=".gwwcccczZcccDg.";r[9]=".gwccccczZccDDg.";r[10]=".gccccczZZZcDDg.";r[11]=".gcccccczZcccDg.";r[12]=".gccccccZcccDDg.";return r}),
sweet:()=>art(P16(["................","....rrrrrrrr....","...rRrrRrrRrr...","....rrrrrrrr....",".....kkkkkk.....","....gggggggg....","...gyyyyyyyyg...","..gwyyyyyyyyyg..","..gwyHHHHHHyOg..","..gyyHhhhhHyOg..","..gyyHHHHHHyOg..","..gyyyyyyyyyOg..","..gyyyyyyyyOOg..","...gOOOOOOOOg...","....gggggggg....","................"]),{r:"#d63031",R:"#f2f2f2",k:"#7a4a28",g:"#c88a2a",y:"#f7c331",w:"#fff3a0",O:"#d8901a",H:"#f5efe0",h:"#8a5a34"},"#5a3a10"),
sour:()=>art(P16([".......y........",".......y........","......yyy.......","......yyy.......",".....ywyyy......",".....wyyyy......","....ywyyyyy.....","....wyyyyyy..y..","...ywyyyyyyy.yy.","...yyyyyyyyY.YY.","...yyyyyyyyY....","...yyyyyyyYY....","....yyyyyYY.....",".....YYYYY......","................","................"]),{y:"#d6e84a",Y:"#a8bc20",w:"#f8ffd0"},"#4a5a10"),
paint:v=>{const c=hex(COLORS[v]||COLORS.rosa),cd=hex(mul(COLORS[v]||COLORS.rosa,.7));return art(P16(["....kkkkkkkk....","...k........k...","..k..........k..","..ssssssssssss..",".sccccccccccccs.",".sLcCccccccccSs.",".sLLcLLLcLLLLSs.",".sLLcLLLLLLLLSs.",".sLLCLLLLLLLLSs.",".sLLLLLLLLLLLSs.",".sccccccccccccs.",".sccwcccccccdcs.",".sccccccccccdds.",".sLLLLLLLLLLLSs.","..ssssssssssss..","................"]),{k:"#5a5a66",s:"#4a4a58",L:"#d8d8e0",S:"#9a9aa8",c,C:cd,d:cd,w:"#ffffff"},"#1a1a20")},
fogo:()=>art(P16(["...........yyy..",".........yyooy..","........yoooory.",".......yooorroy.","......yoorrrroy.",".....yoorrrrRo..","....yoorrrRRo...","....yorrrRRo....","...yorrRRro.....","...yorRRro......","..yorRRo........","..yoRRo.........","..wRo...........",".wk.............","wk..............","k..............."]),{y:"#ffe066",o:"#f39c12",r:"#e74c3c",R:"#a8231a",w:"#f5efe0",k:"#8a5a34"},"#5a1008"),
gelo:()=>art(P16(["................",".......w........","......wbb.......","......wbB.......",".....wwbBB......",".....wbbBB......","..w..wbbBB..w...",".wb..wbbBB.wbB..",".wbB.wbbBB.wbB..",".wbBwwbbBBBwbB..",".wbBwbbbbBBwbB..","..bBwbbbbBB.bB..","..sssssssssssss.",".sSSSSSSSSSSSSs.","................","................"]),{w:"#ffffff",b:"#8fdcff",B:"#3a9ad9",s:"#eef8ff",S:"#b8d8ee"},"#1a4a6a"),
hero:()=>art(P16(["................","....gg....gg....","....gGkkkkGg....","...rRhrrrrhRr...","..rrRhrrrrrhRr..","..rrRrrrrrrrRr..",".rrRrrrrrrrrRrr.",".rrRrrrhrrrrrRr.",".rRrrrrhrrrrrRr.","rrRrrrrhrrrrrRrr","rRrrrrrrrrrrrrRr","rRrrrrrrrrrrrrRr","RrrRrrrRrrrRrrrR","R.rR.rrR.rrR.rR.","..R...R...R.....","................"]),{g:"#f7c331",G:"#b8860b",k:"#3a1a10",r:"#d63031",R:"#8a1a1a",h:"#ff7a6a"},"#3a0a0a"),
shiny:()=>art(P16(["......o.........","......y.....w...",".....yWy...wWw..",".....yWy....w...","....yWWWy.......","..yyyWWWyyy.....","oyyWWWWWWWyyo...","..yyyWWWyyy.....","....yWWWy.......",".....yWy.....p..",".....yWy....pPp.","......y......p..","......o.........","................"]),{o:"#f39c12",y:"#ffe84a",W:"#ffffff",w:"#bff4ff",p:"#ffb3e6",P:"#ffffff"},"#8a6a00"),
brush:()=>art(P16(["............kk..","...........kKk..","..........kKk...",".........kKk....","........kKk.....",".......kKk......","......mMm.......",".....mMm........","....bBbm........","...bbBb.........","..bbBb..........",".bbBb....p......",".bBb..........c.","bBb......y......","b...............","................"]),{k:"#c8864a",K:"#8a5a34",m:"#d8d8e0",M:"#8a8a98",b:"#ff5f9e",B:"#c0306a",p:"#5bc0eb",c:"#6cc04a",y:"#f7c331"},"#2a1a12"),
morph:()=>art(P16(["................","......wppp......","....wppppppp....","...wpppppppPp...","...pPpppPpppP...","..wpPppwpPpppP..","..ppPkpppkPppP..","..ppPpppppPppPp.",".wppPppkkppPppP.",".pppPpppppPpppP.",".ppppPPppPPpppP.","..PPPPPPPPPPPP..","dddddddddddddddd",".DDDDDDDDDDDDDD.","................","................"]),{w:"#e8d8ff",p:"#b48cff",P:"#7a4ad0",k:"#2a1a40",d:"#e8e8f0",D:"#a8a8b8"},"#3a1a6a")};
const ITEMS={
bag:{img:ITEMSPR.bag},
grow:{n:"Poção Gigante",short:()=>"Gigante",d:"+3 de tamanho (até 12). Morango gigante? Pode!",img:ITEMSPR.grow,w:10,go:f=>{f.tam=Math.min(12,f.tam+3)}},
shrink:{n:"Poção Minúscula",short:()=>"Minúscula",d:"-3 de tamanho (até 0). Melancia de bolso!",img:ITEMSPR.shrink,w:10,go:f=>{f.tam=Math.max(0,f.tam-3)}},
sweet:{n:"Mel Encantado",short:()=>"Mel",d:"+3 de doçura",img:ITEMSPR.sweet,w:8,go:f=>{f.doce=Math.min(10,f.doce+3)}},
sour:{n:"Gota Azeda",short:()=>"Azeda",d:"+3 de acidez",img:ITEMSPR.sour,w:8,go:f=>{f.az=Math.min(10,f.az+3)}},
paint:{n:"Tinta Mágica",short:v=>v,d:"Pinta a fruta de outra cor",img:ITEMSPR.paint,w:8,go:(f,v)=>{f.rgb=COLORS[v].slice()},vals:Object.keys(COLORS)},
fogo:{n:"Pena de Fênix",short:()=>"Fênix",d:"A fruta pega FOGO",img:ITEMSPR.fogo,w:4,go:f=>{if(f.el&&f.el!="fogo")f.hero=true;f.el="fogo"}},
gelo:{n:"Cristal Eterno",short:()=>"Cristal",d:"A fruta vira GELO",img:ITEMSPR.gelo,w:4,go:f=>{if(f.el&&f.el!="gelo")f.hero=true;f.el="gelo"}},
raio:{n:"Raio na Garrafa",short:()=>"Raio",d:"A fruta ganha RAIO",img:ITEMSPR.raio,w:4,go:f=>{if(f.el&&f.el!="raio")f.hero=true;f.el="raio"}},
hero:{n:"Capa Heroica",short:()=>"Capa",d:"Vira SUPER-FRUTA",img:ITEMSPR.hero,w:2,go:f=>{f.hero=true;f.cape=f.cape||R(["#d63031","#2d6cdf","#8e44ad","#16a085","#f39c12"])}},
shiny:{n:"Pó de Estrela",short:()=>"Estrela",d:"Deixa a fruta BRILHANTE",img:ITEMSPR.shiny,w:2,go:f=>{f.shiny=true}},
brush:{n:"Pincel Doido",short:()=>"Pincel",d:"Troca a estampa por uma maluca",img:ITEMSPR.brush,w:6,go:f=>{const p0=f.pat,c0=JSON.stringify(f.rgb2);for(let k=0;k<12;k++){f.pat=R(["marble","spots","stripes","seeds","blush","hatch"]);f.rgb2=COLORS[R(Object.keys(COLORS))].slice();if(f.pat!=p0||JSON.stringify(f.rgb2)!=c0)break}}},
morph:{n:"Molde Maluco",short:()=>"Molde",d:"Deforma a fruta num formato novo",img:ITEMSPR.morph,w:5,go:f=>{const other={shape:R(["heart","banana","oval","round","kidney","tall","cluster"])};f.mask=morph(f,other);f.shape="mix"}}};
function rollItem(){const ks=Object.keys(ITEMS).filter(k=>ITEMS[k].w),tot=ks.reduce((s,k)=>s+ITEMS[k].w,0);let r=Math.random()*tot;for(const k of ks){if((r-=ITEMS[k].w)<0){const it={t:k};if(ITEMS[k].vals)it.v=R(ITEMS[k].vals);return it}}return{t:"grow"}}
function giveItem(it,x,y,from){S.bag=S.bag||[];S.bag.push(it);save();const I=ITEMS[it.t],im=document.createElement("img");im.src=I.img(it.v);im.style.cssText=`position:fixed;left:${x}px;top:${y}px;width:36px;height:36px;z-index:130;image-rendering:pixelated;pointer-events:none`;document.body.appendChild(im);
const bt=$("bagtab")||$("market"),r=bt.getBoundingClientRect();im.animate([{transform:"translate(-50%,-50%) scale(.5)"},{transform:"translate(-50%,-140%) scale(1.4)",offset:.3},{transform:`translate(${r.left+r.width/2-x-18}px,${r.top+r.height/2-y-18}px) scale(.6)`}],{duration:1100,easing:"ease-in"}).onfinish=()=>{im.remove();renderMarket();const b=$("bagtab");if(b){b.classList.remove("got");void b.offsetWidth;b.classList.add("got")}};
setTimeout(()=>{toast(`<b>PRESENTE${from?" "+from:""}!</b><br>${I.n}${it.v?" ("+it.v+")":""}`);SFX.dex();buzz([20,30,20])},500)}
function armItem(k){armed=armed==k?null:k;renderMarket();const tip=$("armtip");if(armed){const it=(S.bag||[]).find(x=>x.t+(x.v||"")==armed),I=ITEMS[it.t];tip.innerHTML=`${I.n}${it.v?" ("+it.v+")":""}: ${I.d}<br><span style="font-weight:400">Toque numa fruta da mesa pra usar · toque de novo pra cancelar</span>`;tip.classList.add("on");tbl.classList.add("arming")}else{tip.classList.remove("on");tbl.classList.remove("arming")}}
function useItem(f){const idx=(S.bag||[]).findIndex(x=>x.t+(x.v||"")==armed);if(idx<0){armItem(null);return}const it=S.bag[idx],I=ITEMS[it.t];
const look=()=>JSON.stringify([f.tam,f.doce,f.az,f.rgb,f.rgb2,f.el,f.hero,f.cape,f.shiny,f.pat,f.mask,f.shape]),before=look();const old={...f,sp:f.sp},s0=fsize(f);I.go(f,it.v);{const s1=fsize(f);f.x-=(s1-s0)/2;f.y-=(s1-s0)/2}
if(look()==before){toast("Não mudou nada nessa fruta. Tente outra!");return}
S.bag.splice(idx,1);f.mod=true;if(!S.bag.some(x=>x.t+(x.v||"")==armed))armItem(null);else renderMarket();
const el=tbl.querySelector(`[data-id="${f.id}"]`),r=el?el.getBoundingClientRect():{left:200,top:400,width:0,height:0};clampPos(f);rec("items",1);
treeAdd(f,[old]);if(f.shiny)rec("shiny",1);save();renderTable(f.id);showInfo(f);renderCounter();
burst(r.left+r.width/2,r.top+r.height/2,f.rgb,26);SFX.mut();shake(3);buzz([30,20,50]);toast(`<b>${I.n}!</b> ${fname(f)}`)}
let mkTab="feira",armed=null,bagAnim=0;
function bagCount(){return (S.bag||[]).length}
function renderMarket(){const L=level();const tabs=`<div class="mk tabk ${mkTab=="feira"?"on":""}" onclick="if(mkTab!='feira')SFX.bagc();mkTab='feira';armed=null;renderMarket()"><b>FEIRA</b></div><div class="mk tabk ${mkTab=="bolsa"?"on":""}" id="bagtab" onclick="if(mkTab!='bolsa')SFX.bag();mkTab='bolsa';renderMarket()"><img class="bagi" src="${ITEMS.bag.img()}" style="width:36px;height:36px"><b>BOLSA</b>${bagCount()?`<span class="cnt2">${bagCount()}</span>`:""}</div>`;
if(mkTab=="bolsa"){const groups={};(S.bag||[]).forEach(it=>{const k=it.t+(it.v||"");(groups[k]=groups[k]||{it,n:0}).n++});const gs=Object.values(groups);
 mkSet(tabs,(gs.length?gs.map(({it,n},gi)=>{const I=ITEMS[it.t],k=it.t+(it.v||"");return `<div class="mk px itm ${armed==k?"arm":""} ${bagAnim?"in":""}" style="animation-delay:${gi*45}ms" onclick="armItem('${k}')"><img src="${I.img(it.v)}">${I.short(it.v)}<div class="pr">x${n}</div></div>`}).join(""):`<div style="color:#ffe9b8;font-size:var(--t12);padding:8px;align-self:center">Vazia. Clientes dão <b>presentes</b> quando você entrega!</div>`));return}
mkSet(tabs,BASE.map((b,i)=>{const f={shape:b[1],pat:b[2],top:b[3],rgb:typeof b[4]=="string"?COLORS[b[4]]:b[4],tip:b[0]=="Banana"?"#6b4423":b[0]=="Pimenta-Dragão"?"#3f9a3a":null};const lock=false,rare=!!b[10];
return `<div class="mk px ${lock?"lock":S.coins<b[8]?"off":""} ${rare&&!lock?"rare":""}" onclick="if(mkSkip){mkSkip=0;return}buy(${i})" onpointerdown="mkDown(${i},event)" onpointerup="mkUp()" onpointercancel="mkUp()" onpointerenter="mkEnter(${i},event)" onpointerleave="mkLeave(event)"><img src="${fruitImg(f)}">${lock?"???":b[0]}<div class="pr">${lock?"NÍVEL "+b[9]:`<span class="coin"></span>${b[8]}`}</div></div>`}).join(""))}
// FEIRA/BOLSA ficam fixas; só a pista .mkscroll rola (sem barra nativa). Setas de pixel só aparecem do lado que ainda tem conteúdo
const mkSL={feira:0,bolsa:0};let mkHTML="";
function mkSet(tabs,cards){const m=$("market"),html=tabs+`<div class="mkscroll">${cards}</div><button class="mkar l" hidden aria-label="Anterior"></button><button class="mkar r" hidden aria-label="Próximo"></button>`;
 if(html==mkHTML&&m.querySelector(".mkscroll")){mkUpd&&mkUpd();return} // nada mudou: não recria (não interrompe a rolagem suave)
 mkHTML=html;m.innerHTML=html;
 const sc=m.querySelector(".mkscroll");sc.scrollLeft=mkSL[mkTab]||0; // cada aba lembra a própria posição
 const L=m.querySelector(".mkar.l"),R=m.querySelector(".mkar.r"),upd=()=>{const pad=sc.classList.contains("more")?60:0,more=sc.scrollWidth-pad-sc.clientWidth>2;sc.classList.toggle("more",more); // .more reserva 30px de cada lado pras setas não cobrirem cartas
  L.hidden=!more||sc.scrollLeft<=1;R.hidden=!more||sc.scrollLeft>=sc.scrollWidth-sc.clientWidth-1;
  const x=sc.offsetLeft;L.style.left=x+"px";R.style.left=(x+sc.clientWidth-28)+"px"};
 const go=d=>()=>{const c=sc.querySelector(".mk");const w=c?c.offsetWidth+6:74;sc.scrollBy({left:d*2*w,behavior:RM.matches?"auto":"smooth"})};
 L.onclick=go(-1);R.onclick=go(1);sc.addEventListener("scroll",()=>{mkSL[mkTab]=sc.scrollLeft;upd()},{passive:true});mkUpd=upd;upd();sc.scrollLeft=mkSL[mkTab]||0}
let mkUpd=null;window.addEventListener("resize",()=>setTimeout(()=>mkUpd&&mkUpd(),150));
function buy(i){const b=BASE[i];if(S.coins<b[8])return toast("Moedas insuficientes");S.coins-=b[8];const f=baseFruit(b);
{const pr=$("pot"),pw={x:pr.offsetLeft,y:pr.offsetTop,w:pr.offsetWidth,h:pr.offsetHeight};let k=0;do{f.x=N(10,Math.max(10,tbl.clientWidth-110));f.y=N(10,Math.max(10,tbl.clientHeight-110));k++}while(k<30&&f.x+fsize(f)>pw.x&&f.x<pw.x+pw.w&&f.y+fsize(f)>pw.y&&f.y<pw.y+pw.h)}clampPos(f);freeSpot(f,true);S.fruits.push(f);dexCheck(f);SFX.buy();save();showCoins();renderTable(f.id);renderMarket()}
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
function winLayout(W,H){if(W*2>=600&&H>=114){const ww=46,wh=34;return [[Math.round(W/3)-ww/2,28,ww,wh],[Math.round(W*2/3)-ww/2,28,ww,wh]]}return [[Math.round(W*.22)-17,18,34,20],[Math.round(W*.78)-17,18,34,20]]}
function curtainImg(h,flip){const w=7,[c,g]=cvs(w,h+5);for(let y=0;y<h+5;y++){const ww=y<4?w:Math.max(3,w-Math.floor((y-4)/(h/4.5)));for(let i=0;i<ww;i++){const xx=flip?w-1-i:i;px(g,xx,y,(i+Math.floor(y/2))%3==0?"#b8323a":i==ww-1?"#e0606a":"#d64550")}}return c.toDataURL()}
const memo=fn=>{let v;return()=>v||(v=fn())};
const SUNI=memo(()=>art(["..yyy..",".yWYYy.","yWYYYYy","yYYYYYy","yYYYYOy",".yYYOy.","..yyy.."],{y:"#ffd23a",Y:"#ffe84a",W:"#fffbe0",O:"#f7c331"},"#fff3a080"));
const DUSKI=memo(()=>art(["..ooo..",".oYYYo.","oYYYYYo","oYYYYYo","oYYYYOo",".oYYOo.","..ooo.."],{o:"#ff8a3a",Y:"#ffb347",O:"#f08030"},"#ffd0a080"));
const MOONI=memo(()=>art(["..mmm..",".mMmm..","mMmm...","mmm....","mmmm...",".mmmmm.","..mmm.."],{m:"#f5efe0",M:"#ffffff"},"#c8c0a860"));
function cloudStrip(w,h,dense,seed){const[c,g]=cvs(w,h),r=srand(seed),n=dense?Math.round(w/7):Math.max(2,Math.round(w/26)),blobs=[];
 for(let k=0;k<n;k++){const rx=dense?5+r()*7:4+r()*5;blobs.push([r()*w,(dense?.25+r()*.7:.35+r()*.4)*h,rx,rx*.55])}
 const lit=dense?[206,211,220]:[255,255,255],mid=dense?[178,185,196]:[232,236,244],sh=dense?[150,158,172]:[200,207,220];
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){let best=-1,by=0;for(const[bx,cy,rx,ry]of blobs)for(const o of[-w,0,w]){const dx=(x-bx-o)/rx,dy=(y-cy)/ry,d=dx*dx+dy*dy;if(d<1&&(best<0||d<best)){best=d;by=dy}}
  if(dense&&y>h*.55)best=best<0?.9:best;if(best<0)continue;px(g,x,y,hex(by<-.35?lit:by>.45||y>h*.8?sh:mid))}
 return c.toDataURL()}
// paleta do cenário (Etapa 2): parede, lambri, prateleira, moldura, balcão, frente do balcão e chão
const PAL2={
 wall:[[220,180,122],[212,171,113],[227,188,132],[205,164,106]],wallGroove:"#8f6236",knot:"#9a6a3a",knotD:"#74491f",
 lam:[168,112,62],lamHi:"#c08a50",lamLo:"#8a5a30",lamGr:"#6a4222",capHi:"#d9a465",cap:"#b47c46",capLo:"#6a4222",
 shHi:"#f2c888",sh1:"#dba565",sh2:"#b97c44",sh3:"#875530",
 frO:"#4a2c16",frM:"#9b6a3e",frH:"#c89258",frD:"#6b4423",sill:"#e0ae6e",sillD:"#8a5a34",
 ctHi:"#f6d090",ct1:"#e2ae6c",ct2:"#d39c5c",ctEdge:"#b97c44",ctEdgeD:"#96602f",ctLip:"#4e2e16",
 fr:[122,74,40],frHi:"#93603a",frLo:"#643a1e",frGr:"#4a2a14",base:"#3e2210",baseHi:"#7a4a28",
 floor:[[196,124,66],[186,114,58],[204,134,74],[176,106,52],[191,120,62]],flSeam:"#7a4420",flHi:.14,flGrD:.86,flGrL:.1,flKnot:"#8a4f26",flKnotD:"#663a1a"};
function buildWall(W,H){const[c,g]=cvs(W,H),rnd=srand(7),T=H-140,P=PAL2;
 // tábuas verticais de larguras variadas
 let x=0,k=0;const widths=[12,10,13,11,14,12,10,12];
 while(x<W){const w=widths[k%widths.length],tone=P.wall[(k*3+(k>>1))%4];
  for(let i=0;i<w;i++){const col=i==0?P.wallGroove:i==1?hex(lift(tone,.2)):i==w-1?hex(mul(tone,.9)):hex(tone);px(g,x+i,0,col,1,H)}
  // veios: riscos verticais de 1 px, mais escuros e alguns claros
  for(let n=0;n<7;n++){const gx=x+2+Math.floor(rnd()*(w-4)),gy=Math.floor(rnd()*H),gl=5+Math.floor(rnd()*14);px(g,gx,gy,hex(mul(tone,n%4==3?1.06:.9)),1,gl)}
  // nó (1 a cada ~4 tábuas), fora da faixa das janelas
  if(rnd()<.28){const kx=x+3+Math.floor(rnd()*(w-7)),ky=70+T+Math.floor(rnd()*18);if(ky>20){px(g,kx,ky,P.knot,3,1);px(g,kx-1,ky+1,P.knot,5,2);px(g,kx,ky+3,P.knot,3,1);px(g,kx,ky+1,P.knotD,2,2);px(g,kx+1,ky-2,hex(mul(tone,.9)),1,2);px(g,kx+1,ky+4,hex(mul(tone,.9)),1,3)}}
  // pregos (2 fileiras)
  [22,84+T].forEach(ny=>{if(ny>18){px(g,x+Math.floor(w/2),ny,"#6b4a2c");px(g,x+Math.floor(w/2),ny-1,hex(lift(tone,.3)))}});
  x+=w;k++}
 // sombra do toldo na parede (degraus de 2 px de arte, sem gradiente)
 [[11,.34],[13,.24],[15,.15],[17,.07]].forEach(([y,a])=>px(g,0,y,`rgba(40,20,8,${a})`,W,2));
 // lambri: régua de arremate + almofadas
 const wy=106+T;px(g,0,wy,P.capHi,W,1);px(g,0,wy+1,P.cap,W,1);px(g,0,wy+2,P.capLo,W,1);
 for(let y=wy+3;y<H;y++)for(let xx=0;xx<W;xx++){const m=xx%24;let col=hex(P.lam);if(m==0)col=P.lamGr;else if(m==1)col=P.lamHi;else if(m==23)col=P.lamLo;px(g,xx,y,col)}
 px(g,0,wy+3,"rgba(40,20,8,.28)",W,1);
 for(let xx=0;xx<W;xx+=24){const a=xx+4,b=wy+6,w=17,h=Math.max(4,H-13-b-2);px(g,a,b,P.lamLo,w,h);px(g,a,b,P.lamGr,w,1);px(g,a,b,P.lamGr,1,h);px(g,a+w-1,b,P.lamHi,1,h);px(g,a,b+h-1,P.lamHi,w,1);px(g,a+1,b+1,hex(mul(P.lam,.9)),w-2,h-2);for(let n=0;n<3;n++)px(g,a+3+n*5,b+2,hex(mul(P.lam,.82)),1,h-4)}
 // prateleira com quina clara, face, sombra em degraus e mãos-francesas
 const sy=94+T;px(g,0,sy,P.shHi,W,1);px(g,0,sy+1,P.sh1,W,1);px(g,0,sy+2,P.sh2,W,1);px(g,0,sy+3,P.sh3,W,1);px(g,0,sy+4,"rgba(40,20,8,.38)",W,1);px(g,0,sy+5,"rgba(40,20,8,.22)",W,1);px(g,0,sy+6,"rgba(40,20,8,.1)",W,1);
 for(let xx=10;xx<W;xx+=Math.max(60,Math.round(W/4))){spr(g,["kkkk","hkk.","hk..","hk..","k..."],{k:P.sh3,h:P.sh2},xx,sy+4)}
 // janelas
 WINS=winLayout(W,H);
 WINS.forEach(([wx,wy,ww,wh])=>{
  // moldura de 4 px: contorno, meio com luz em cima/esquerda, sombra interna
  px(g,wx-4,wy-4,P.frO,ww+8,wh+8);px(g,wx-3,wy-3,P.frM,ww+6,wh+6);px(g,wx-3,wy-3,P.frH,ww+6,1);px(g,wx-3,wy-3,P.frH,1,wh+6);px(g,wx-1,wy-1,P.frD,ww+2,wh+2);
  g.clearRect(wx,wy,ww,wh);
  // sombra interna do vidro (topo e esquerda) e brilho diagonal
  px(g,wx,wy,"rgba(20,10,30,.28)",ww,1);px(g,wx,wy,"rgba(20,10,30,.28)",1,wh);
  for(let d=0;d<Math.min(10,wh-4);d++){px(g,wx+6+d,wy+wh-3-d,"rgba(255,255,255,.2)",2,1);if(ww>40)px(g,wx+ww-14+d,wy+Math.min(wh-3,14)-d,"rgba(255,255,255,.14)",1,1)}
  // cruzeta de 2 px com luz
  const mx=wx+Math.floor(ww/2)-1,my=wy+Math.floor(wh/2)-1;px(g,mx,wy,P.frD,2,wh);px(g,wx,my,P.frD,ww,2);px(g,mx,wy,P.frM,1,wh);px(g,wx,my,P.frM,ww,1);
  // peitoril (largo, com quina clara e sombra em degraus) e verga
  px(g,wx-6,wy+wh+3,P.sill,ww+12,1);px(g,wx-6,wy+wh+4,P.frM,ww+12,1);px(g,wx-6,wy+wh+5,P.sillD,ww+12,1);px(g,wx-5,wy+wh+6,"rgba(40,20,8,.32)",ww+10,1);px(g,wx-4,wy+wh+7,"rgba(40,20,8,.14)",ww+8,1);
  px(g,wx-6,wy-6,P.frO,ww+12,1);px(g,wx-6,wy-5,P.frH,ww+12,1)});

 DECO.shelf(g,W,sy);
 return c.toDataURL()}
function buildAwning(W){const H=16,[c,g]=cvs(W,H);for(let x=0;x<W;x++){const red=Math.floor(x/12)%2==0,b=red?[200,57,47]:[243,230,200],xi=x%12,depth=1+Math.round(Math.sin((xi+.5)/12*Math.PI)*4);
 for(let y=0;y<10+depth;y++){let col=y<=1?lift(b,.22):y>=8+depth?mul(b,.74):y>=7?mul(b,.9):b;if(xi==0)col=mul(col,.84);if(xi==11)col=mul(col,.92);px(g,x,y,hex(col))}
 px(g,x,10+depth,"#2a1a12")}
 px(g,0,0,"#2a1a12",W,1);return c.toDataURL()}
function buildCounter(W){const H=13,[c,g]=cvs(W,H),rnd=srand(23),P=PAL2;
 px(g,0,0,"#2a1a12",W,1);px(g,0,1,P.ctHi,W,1);px(g,0,2,P.ct1,W,2);px(g,0,4,P.ct2,W,1);px(g,0,5,P.ctEdge,W,2);px(g,0,7,P.ctEdgeD,W,1);px(g,0,8,P.ctLip,W,1);
 // veios e emendas do tampo
 for(let x=0;x<W;){const len=44+Math.floor(rnd()*30);px(g,x,2,"#c08a4c",1,3);px(g,x+1,2,"#f0c684",1,2);for(let n=0;n<3;n++){const gx=x+3+Math.floor(rnd()*(len-10)),gl=6+Math.floor(rnd()*16);px(g,gx,2+Math.floor(rnd()*3),"#d09a58",gl,1)}x+=len}
 // início da frente (sombreada pelo beiral): continua na faixa do topo da mesa
 for(let x=0;x<W;x++)for(let y=9;y<H;y++)px(g,x,y,counterFrontPx(x,y-9,true));
 return c.toDataURL()}
// frente do balcão: módulo de 24 px (montante de 4 + almofada ripada de 20)
function counterFrontPx(x,y,shade){const P=PAL2,m=x%24;let col;if(m<4)col=m==0?P.frGr:m==1?P.frHi:m==3?P.frLo:hex(P.fr);else{const s=(m-4)%4;col=s==0?P.frGr:s==1?hex(mul(P.fr,.92)):hex(mul(P.fr,.8))}
 if(shade&&y<2)col=hex(mul(hexToRgb(col),y==0?.62:.8));return col}
let _front,_tile;
function buildCounterFront(){if(_front)return _front;const W=48,FH=12,SH=10,[c,g]=cvs(W,FH+SH),P=PAL2;
 for(let x=0;x<W;x++)for(let y=0;y<FH-3;y++)px(g,x,y,counterFrontPx(x,y+4,false));
 px(g,0,FH-3,P.baseHi,W,1);px(g,0,FH-2,P.base,W,2);
 // sombra de contato no chão, em degraus com pontilhado na transição
 const A=[.5,.36,.24,.13,.06,0];for(let i=0;i<5;i++){const y=FH+i*2;px(g,0,y,`rgba(30,12,4,${A[i]})`,W,1);for(let x=0;x<W;x++){const al=(x+i)%2?A[i]:A[i+1];if(al)px(g,x,y+1,`rgba(30,12,4,${al})`)}}
 return _front=c.toDataURL()}
// chão: ripas horizontais de 10 px com emendas desencontradas (nunca a menos de 6 px da emenda da fileira de cima) e fechamento em módulo 240
function buildTableTile(){if(_tile)return _tile;const W=240,H=80,RH=10,[c,g]=cvs(W,H),rnd=srand(11),P=PAL2,near=(a,list)=>list.some(b=>{const d=Math.abs(a-b)%W;return Math.min(d,W-d)<6});
 let prev=[],first=[];
 for(let r=0;r<H/RH;r++){const y0=r*RH,seams=[],avoid=r==H/RH-1?prev.concat(first):prev;let x=Math.floor(rnd()*40);while(avoid.length&&near(x%W,avoid))x+=8;const start=x;let ti=Math.floor(rnd()*5);
  while(x<start+W){let len=38+Math.floor(rnd()*40);if(x+len>start+W-20)len=start+W-x;
   // emenda que cairia perto da fileira anterior: alonga 8 px (o fechamento do ladrilho continua valendo)
   while(x+len<start+W&&near((x+len)%W,avoid)){len+=8;if(x+len>start+W-20){len=start+W-x}}
   const tone=P.floor[ti=(ti+1+Math.floor(rnd()*3))%5];seams.push(x%W);
   const put=(xx,yy,col,w=1,h=1)=>{for(let i=0;i<w;i++)px(g,((xx+i)%W+W)%W,yy,col,1,h)};
   put(x,y0,hex(tone),len,RH);put(x,y0,hex(lift(tone,P.flHi)),len,1);put(x,y0+RH-1,P.flSeam,len,1);put(x,y0+RH-2,hex(mul(tone,.9)),len,1);
   // emenda de topo: sulco escuro + filete claro
   put(x,y0,P.flSeam,1,RH);put(x+1,y0+1,hex(lift(tone,.1)),1,RH-3);
   // veios
   const ng=3+Math.floor(rnd()*3);for(let n=0;n<ng;n++){const gl=6+Math.floor(rnd()*18),gx=x+3+Math.floor(rnd()*Math.max(1,len-gl-5)),gy=y0+2+Math.floor(rnd()*(RH-5));put(gx,gy,hex(n==0?lift(tone,P.flGrL):mul(tone,P.flGrD)),gl,1)}
   // nó
   if(rnd()<.22&&len>30){const kx=x+8+Math.floor(rnd()*(len-18)),ky=y0+3;put(kx+1,ky,P.flKnot,2,1);put(kx,ky+1,P.flKnot,4,2);put(kx+1,ky+3,P.flKnot,2,1);put(kx+1,ky+1,P.flKnotD,2,2);put(kx-3,ky+1,hex(mul(tone,.86)),2,1);put(kx+5,ky+2,hex(mul(tone,.86)),3,1)}
   // pregos discretos: 2 por ponta
   [x+3,x+len-3].forEach(nx=>{[y0+2,y0+6].forEach(ny=>put(nx,ny,hex(mul(tone,.62))))});
   x+=len}
  prev=seams;if(r==0)first=seams}
 // 2 manchas discretas: borrão sólido em 2 tons (sem pontilhado)
 [[52,23],[168,56]].forEach(([sx,sy])=>{["..oooooo....",".oooiiiooo..","ooiiiiiiooo.",".oooiiioooo.","...ooooo...."].forEach((r,y)=>[...r].forEach((ch,x)=>{if(ch!=".")px(g,sx+x,sy+y,ch=="i"?"rgba(60,28,10,.2)":"rgba(60,28,10,.11)")}))});
 return _tile=c.toDataURL()}
// decoração (Etapa 4): sprites em 2x gerados uma vez (cache), sem usar fruitImg; tudo em px pares
const DECO=(()=>{
const WOOD={hi:"#e2b878",l:"#cf9c5a",m:"#b47c42",d:"#8f5c2c",dd:"#6a4020",in:"#3a2010"},IRON={l:"#8a84ac",m:"#625c80",d:"#3d3852"},
 WICK={hi:"#ecc884",l:"#d6a85e",m:"#b98644",d:"#8c6028"},BURL={hi:"#e2c08a",l:"#cfa870",m:"#b58c52",d:"#8c683a"};
const FRU={morango:["#f0685c","#d63031","#9c1f24","#5fb33a"],uva:["#a06ad0","#763896","#4e2468",null],banana:["#fbe27a","#f7cd37","#c79a1c",null],limao:["#a6d86a","#6ab03a","#3f7a22",null],laranja:["#ffb45c","#f38c20","#b8600e","#5fb33a"],maca:["#f08a7a","#c8392f","#8c2420","#6b4423"]};
/* monta um sprite: grade de cores → contorno automático (cor escurecida do vizinho, como o toImg) + sombra de contato em 2 degraus */
function mk(W,H,g,sh){const[c,k]=cvs(W,H+(sh?2:0));
 if(sh){let a=W,b=0;for(let x=0;x<W;x++)if(g[H-1][x]||g[H-2][x]){a=Math.min(a,x);b=Math.max(b,x)}px(k,a-1,H-1,"rgba(30,12,4,.4)",b-a+3,2);for(let x=a-2;x<=b+2;x++)if((x&1)==0)px(k,x,H+1,"rgba(30,12,4,.26)")}
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){let col=g[y][x];if(!col){const n=[[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy])=>(g[y+dy]||[])[x+dx]).find(Boolean);if(n)col=hex(mul(hexToRgb(n),.32))}if(col)px(k,x,y,col)}
 const u=c.toDataURL();ADIM[u]=[W,H+(sh?2:0)];return u}
const R=(g,x,y,w,h,col)=>{for(let j=0;j<h;j++)for(let i=0;i<w;i++)if(g[y+j]&&x+i>=0&&x+i<g[0].length)g[y+j][x+i]=col};
function blob(g,cx,cy,f){const[hi,b,d,leaf]=FRU[f];[".hbb.","hbbbb","bbbbd","bbbdd",".bdd."].forEach((r,y)=>[...r].forEach((ch,x)=>{if(ch!=".")R(g,cx-2+x,cy-2+y,1,1,ch=="h"?hi:ch=="b"?b:d)}));if(leaf)R(g,cx,cy-3,2,1,leaf)}
function pile(g,x0,x1,yb,f){const n=Math.floor((x1-x0)/5);for(let i=0;i<n-1;i++)blob(g,x0+5+i*5,yb-5,f);for(let i=0;i<n;i++)blob(g,x0+2+i*5+(i%2),yb-1-(i%2),f)}
const DS={};
// caixote de feira 30×22 com frutas dentro
DS.crate=f=>{const W=30,H=22,g=blank(W,H);R(g,2,8,26,3,WOOD.in);pile(g,2,28,9,f);
 for(let b=0;b<3;b++){const y=10+b*4;R(g,1,y,28,4,WOOD.l);R(g,1,y,28,1,WOOD.hi);R(g,1,y+3,28,1,WOOD.d);for(let n=0;n<3;n++)R(g,6+((b*7+n*9)%19),y+1+(n%2),4+(n*2)%3,1,WOOD.m)}
 [0,26].forEach(x=>{R(g,x,7,4,15,WOOD.m);R(g,x,7,1,15,WOOD.hi);R(g,x+3,7,1,15,WOOD.d);[11,15,19].forEach(y=>R(g,x+2,y,1,1,WOOD.dd))});R(g,0,21,30,1,WOOD.dd);return mk(W,H,g,1)};
// barril 22×28
DS.barrel=()=>{const W=22,H=28,g=blank(W,H);for(let y=1;y<H;y++){const hw=8+Math.round(2.6*Math.sin(Math.PI*(y-1)/26)),x0=11-hw,x1=10+hw;for(let x=x0;x<=x1;x++){const t=(x-x0)/(x1-x0);let col=t<.18?WOOD.hi:t<.5?WOOD.l:t<.8?WOOD.m:WOOD.d;if((x-11+40)%4==0)col=t<.5?WOOD.m:WOOD.dd;g[y][x]=col}
  if(y==5||y==6||y==21||y==22)for(let x=x0;x<=x1;x++){const t=(x-x0)/(x1-x0);g[y][x]=(y==5||y==21)?(t<.3?IRON.l:t<.75?IRON.m:IRON.d):(t<.75?IRON.d:"#2a2638")}}
 for(let x=4;x<18;x++){g[0][x]=WOOD.hi;g[1][x]=WOOD.l;g[2][x]=x<6||x>15?WOOD.l:WOOD.m}R(g,6,1,10,1,WOOD.d);R(g,7,2,8,1,WOOD.dd);return mk(W,H,g,1)};
// cesto de vime 26×18 com frutas
DS.basket=f=>{const W=26,H=18,g=blank(W,H);R(g,2,6,22,2,WOOD.in);pile(g,1,25,7,f);
 for(let y=8;y<H;y++){const ins=Math.floor((y-8)/3),x0=ins,x1=W-1-ins;for(let x=x0;x<=x1;x++){const w=((x>>1)+(y>>1))%2;let col=w?WICK.l:WICK.m;if(x-x0<2)col=WICK.hi;if(x1-x<2)col=WICK.d;if(y==H-1)col=WICK.d;g[y][x]=col}}
 R(g,0,7,26,1,WICK.hi);R(g,0,8,26,1,WICK.l);R(g,0,9,26,1,WICK.d);for(let x=1;x<25;x+=3)R(g,x,8,1,1,WICK.d);return mk(W,H,g,1)};
// saco de estopa 20×22 amarrado
DS.sack=()=>{const rows=["......hlll..........",".....hlllmm.........","......rrrr..........",".....hllllm.........","....hllllllm........","...hllllllllmm......","..hlllllllllllm.....",".hllllllllllllmm....",".hlllllllllmllmmd...","hllllllllllllllmmd..","hlllllmllllllllmmd..","hllllllllllllmllmmd.","hllllllllllllllmmmd.","hlllllllllllllllmmd.","hllllmlllllllllmmmd.","hllllllllllllllmmmd.","hlllllllllllmllmmdd.",".hlllllllllllllmmdd.",".hllllllllllllmmmdd.","..mlllllllllmmmmdd..","...mmmmmmmmmmmddd...","....dddddddddddd...."],W=20,H=22,g=blank(W,H),P={h:BURL.hi,l:BURL.l,m:BURL.m,d:BURL.d,r:"#7a4a28"};
 rows.forEach((r,y)=>[...r].forEach((ch,x)=>{if(P[ch])g[y][x]=P[ch]}));return mk(W,H,g,1)};
// lousa de cavalete 20×26 (sem texto: fruta = moeda, riscos de giz)
DS.board=()=>{const W=20,H=26,g=blank(W,H),S="#2f4038",S2="#3a4e44",CH="#e8ecdc";R(g,1,0,18,20,WOOD.m);R(g,1,0,18,1,WOOD.hi);R(g,1,0,1,20,WOOD.hi);R(g,18,0,1,20,WOOD.d);R(g,1,19,18,1,WOOD.d);R(g,3,2,14,16,S);R(g,3,2,14,1,S2);
 [[5,5],[6,4],[7,4],[8,5],[8,6],[8,7],[7,8],[6,8],[5,7],[5,6]].forEach(([x,y])=>g[y][x]="#f0685c");g[3][7]="#8fd45a";g[3][8]="#8fd45a";R(g,10,5,2,1,CH);R(g,10,7,2,1,CH);R(g,13,5,3,3,"#f7c331");g[5][13]="#fff3a0";
 R(g,5,11,9,1,CH);R(g,5,13,6,1,CH);R(g,12,13,3,1,"#f7c331");R(g,5,15,10,1,CH);
 R(g,2,20,2,6,WOOD.m);R(g,2,20,1,6,WOOD.hi);R(g,16,20,2,6,WOOD.d);R(g,16,20,1,6,WOOD.m);return mk(W,H,g,1)};
// tapete 48×14 com franja e losangos
DS.rug=k=>{const C=k?["#c9584a","#a8443a","#7c2e28","#ecd6a6"]:["#9aa860","#7c8a4a","#56642e","#ecd6a6"],W=48,H=14,[c,g]=cvs(W,H+1);
 px(g,3,H,"rgba(30,12,4,.3)",W-6,1);
 for(let y=1;y<H-1;y+=2){px(g,0,y,C[3],3,1);px(g,W-3,y,C[3],3,1);px(g,1,y+1>H-2?y:y+1,C[2],1,1)}
 px(g,3,0,C[2],W-6,H);px(g,4,1,C[1],W-8,H-2);px(g,5,2,C[3],W-10,1);px(g,5,H-3,C[3],W-10,1);px(g,5,3,C[0],W-10,1);
 for(let cx=11;cx<W-8;cx+=9)for(let d=0;d<3;d++){px(g,cx-d,5+d,C[3],1,1);px(g,cx+d,5+d,C[3],1,1);px(g,cx-d,9-d,C[3],1,1);px(g,cx+d,9-d,C[3],1,1);if(d==0)px(g,cx,7,C[0],1,1)}
 for(let x=6;x<W-6;x+=3)px(g,x,H-2,C[2],1,1);const u=c.toDataURL();ADIM[u]=[W,H+1];return u};
// balança de feira 20×18 (pro balcão)
DS.scale=()=>{const g=blank(20,18),M="#c9c9d1",Md="#8e8e9c",Mh="#f0f0f4",Rd="#c8392f",Rh="#e86a5a",Rs="#8c2420";R(g,1,0,18,1,Mh);R(g,2,1,16,1,M);R(g,4,2,12,1,Md);R(g,8,3,4,2,Md);
 for(let y=5;y<16;y++){const ins=y<8?8-y:0;R(g,3+ins,y,14-ins*2,1,Rd);g[y][3+ins]=Rh;g[y][16-ins]=Rs}R(g,7,7,6,6,"#f5efe0");R(g,7,7,6,1,M);g[7][7]=g[7][12]=g[12][7]=g[12][12]=Rd;g[9][9]=g[10][10]="#2a1a12";g[8][10]="#c8392f";R(g,2,16,16,2,"#3d3852");R(g,2,16,16,1,"#625c80");return mk(20,18,g,0)};
// planta 16×17 e caixa registradora 22×16 na paleta nova
DS.plant=()=>art(["......l..L......","...l..lh.l..l...","....lhLLlh.l....","..l.lLhlLlhl.l..",".lhlLlhLLlhLll..","..lLLlhlLLhlL...","...lLLlhLLll....","....lLlLLlL.....","......lLLl......","...hpppppppp....","...pPPPPPPPd....","....hpppppd.....","....hpppppd.....","....hpppppd.....",".....pppdd......"],{l:"#6cc04a",L:"#2f7a2a",h:"#a6e070",p:"#c8683e",P:"#e8875a",d:"#964a28"});
DS.reg=()=>art(["....dddddddd..........","....dwwgwwgd..........","....dwgwwgwd..........","....dddddddd..........","......bbbb............","..hmmmmmmmmmmmmmmmm...",".hmkkmkkmkkmkkmmyymm..",".hmmmmmmmmmmmmmmmmmd..",".hmkkmkkmkkmkkmmyymd..",".hmmmmmmmmmmmmmmmmmd..","hrrrrrrrrrrrrrrrrrrrd.","hrRRRRRRRRRRRRRRRRRrd.","hrRRRRRkkkkkRRRRRRRrd.","hrrrrrrrrrrrrrrrrrrrd.","bbbbbbbbbbbbbbbbbbbbb."],{d:"#3a2a22",w:"#9be7a6",g:"#5ec27a",b:"#e0ae4e",h:"#f2d08a",m:"#b47c42",k:"#f5efe0",y:"#f7c331",r:"#9c2a24",R:"#c8392f"});
// lampião 9×18: tira de 4 quadros (0 apagado, 1–3 chama)
DS.lantern=()=>{const FW=9,H=18,[c,g]=cvs(FW*4,H),K="#3d3852",Kh="#625c80",B="#e0ae4e";for(let f=0;f<4;f++){const o=f*FW;px(g,o+4,0,K,1,3);px(g,o+2,3,K,5,1);px(g,o+1,4,Kh,7,1);px(g,o+1,5,K,7,1);px(g,o+1,6,K,1,8);px(g,o+7,6,K,1,8);px(g,o+2,6,f?"#ffe9a8":"#4a4a5e",5,8);px(g,o+4,6,K,1,8);px(g,o+1,14,K,7,1);px(g,o+2,15,B,5,1);px(g,o+3,16,K,3,1);
  if(f){px(g,o+2,6,"#fff6d0",5,8);px(g,o+4,6,K,1,2);const h=[0,4,5,3][f],x=o+3+(f==2?1:0);px(g,x,13-h,"#ffb030",f==2?2:3,h);px(g,o+4,13-h+1,"#fff3a0",1,Math.max(1,h-1));px(g,o+3,13,"#f07020",3,1)}else{px(g,o+3,7,"#62627a",1,5)}}
 const u=c.toDataURL();ADIM[u]=[FW*4,H];return u};
// halo do lampião em degraus (40×40)
DS.halo=()=>{const W=40,[c,g]=cvs(W,W),T=[[.12,.5],[.36,.3],[.68,.16],[1,.07]];for(let y=0;y<W;y++)for(let x=0;x<W;x++){const d=((x-19.5)/20)**2+((y-19.5)/20)**2;for(let i=0;i<4;i++)if(d<T[i][0]){let a=T[i][1];if(T[i][0]-d<.04&&(x+y)%2==0)a=i<3?T[i+1][1]:0;if(a)px(g,x,y,`rgba(255,200,110,${a})`);break}}const u=c.toDataURL();ADIM[u]=[W,W];return u};
const memoD={},decoSpr=(k,a)=>memoD[k+(a??"")]||(memoD[k+(a??"")]=DS[k](a));
/* itens da prateleira (substitui o bloco dentro de buildWall) */
function shelfItems(g,W,sy){const jam=[[214,48,49],[243,140,32],[118,56,150],[247,205,55],[106,176,58],[247,143,179]];let x=4,k=0;
 while(x<W-16){const kind=k%7,j=jam[k%jam.length];
  if(kind==0||kind==3){spr(g,[".kllllk.",".kLLLLk.","ghhggggd","gwjjjjJd","gwjjjjJd","gjppppJd","gjpPppJd","gjjjjJJd","gjJJJJJd",".dddddd."],{k:"#2a1a12",l:k%2?"#c8392f":"#f3e6c8",L:k%2?"#9c2a24":"#d9c8a0",g:"#d8eef4",h:"#ffffff",d:"#9fc0cc",w:"#ffffff",j:hex(j),J:hex(mul(j,.72)),p:"#f5efe0",P:hex(mul(j,.85))},x,sy-10);x+=12}
  else if(kind==1){spr(g,["hllllllllllh","mdmmmmmmmmdm","hllllllllllh","mdmmmmmmmmdm","dddddddddddd"],{h:WOOD.hi,l:WOOD.l,m:WOOD.m,d:WOOD.d},x,sy-5);["#d63031","#f7cd37","#6ab03a","#f38c20"].forEach((f,i)=>{spr(g,[".hf.","ffff","fffd",".dd."],{f,h:hex(lift(hexToRgb(f),.45)),d:hex(mul(hexToRgb(f),.7))},x+i*3,sy-8-(i%2))});x+=16}
  else if(kind==2){spr(g,[".....k.....","..kkkkkkk..",".k...k...k.","hmmm.k.hmmm",".ddd.k..ddd",".....k.....","....kkk....","..hmmmmmd.."],{k:"#3d3852",h:"#f2d08a",m:"#e0ae4e",d:"#a87a2a"},x,sy-8);x+=15}
  else if(kind==4){spr(g,["..l.h.l..",".lhLlLhl.","lLlhLlLll",".lLlLhLl.","..hpppd..",".hpPPPpd.","..hpppd.."],{l:"#6cc04a",L:"#2f7a2a",h:"#a6e070",p:"#c8683e",P:"#e8875a",d:"#964a28"},x,sy-7);x+=13}
  else if(kind==5){spr(g,["..kk..","..cc..","..gg..",".hggd.","hgggGd","hgwwGd","hgwwGd","hgggGd","hgggGd",".dddd."],{k:"#6b4423",c:"#d9a465",g:"#5a9a4a",G:"#3f7a34",h:"#9ad08a",d:"#2f5a28",w:"#f5efe0"},x,sy-10);spr(g,["..kk..","..cc..",".hggd.","hgwwGd","hgwwGd","hgggGd",".dddd."],{k:"#6b4423",c:"#d9a465",g:"#b06a3a",G:"#8a4e26",h:"#d99558",d:"#663a1a",w:"#f5efe0"},x+7,sy-7);x+=17}
  else{spr(g,["..hf.hf.hf..",".hfffffffff.","hllllllllllh","lmlmlmlmlmld","mlmlmlmlmlmd",".ddddddddd.."],{f:"#f38c20",h:"#ffb45c",l:WICK.l,m:WICK.m,d:WICK.d},x,sy-6);x+=16}
  x+=6+Math.floor(srand(k+3)()*10);k++}}


// gera todos de uma vez (no 1º renderProps) para o resize nunca chamar toDataURL de novo
const warm=()=>[["crate","morango"],["crate","uva"],["crate","banana"],["barrel"],["basket","laranja"],["sack"],["board"],["rug",0],["rug",1],["scale"],["plant"],["reg"],["lantern"],["halo"]].forEach(([k,a])=>decoSpr(k,a));
return{spr:decoSpr,shelf:shelfItems,warm}})();
const decoSpr=DECO.spr;
function renderProps(){DECO.warm();const sc=$("scene"),Wd=sc.clientWidth,W=Math.ceil(Wd/2),H=Math.max(100,Math.round(sc.clientHeight/2));
 let h="";const wall=buildWall(W,H);
 WINS.forEach(([wx,wy,ww,wh],i)=>{const W2=ww*2,H2=wh*2,big=ww>30,rnd=srand(i+5);let st="";for(let k=0;k<(big?16:8);k++)st+=`<span style="left:${Math.floor(rnd()*W2)}px;top:${Math.floor(rnd()*H2*.8)}px;animation-delay:-${(rnd()*2).toFixed(2)}s"></span>`;
 const tw=ww*2,sA=cloudStrip(tw,Math.round(wh*.62),false,i*7+1),sD=cloudStrip(tw,Math.round(wh*.62),true,i*7+2),sB=cloudStrip(tw,Math.round(wh*.72),false,i*7+3),sE=cloudStrip(tw,Math.round(wh*.72),true,i*7+4);
 const bs=`background-size:${tw*2}px 100%;--tw:${tw*2}px`;
 let cds=`<span class="cl a" style="${bs};--cs:url(${sA});--cd:url(${sD})"></span><span class="cl b" style="${bs};--cs:url(${sB});--cd:url(${sE})"></span><img class="leaf" src="${art([".gg..","gGGg.",".gGgg","..g.."],{g:"#5fb33a",G:"#8fd45a"})}" style="--lw:${W2}px;animation-delay:-${i*3}s">`;
 h+=`<div class="win ${big?"wbig":""}" id="win${i+1}" style="left:${wx*2}px;top:${wy*2}px;width:${W2}px;height:${H2}px"><div class="stars">${st}</div>${cds}<div class="sun" id="sun${i+1}"></div><div class="wfx"></div></div>`;
 const ci=curtainImg(wh,false),cf=curtainImg(wh,true),cw=14;h+=`<img class="curt" src="${ci}" style="left:${wx*2-6}px;top:${wy*2-8}px;width:${cw}px;height:${(wh+5)*2}px;animation-delay:-${i*3}s"><img class="curt r" src="${cf}" style="left:${wx*2+W2-cw+6}px;top:${wy*2-8}px;width:${cw}px;height:${(wh+5)*2}px;animation-delay:-${i*3+1.5}s">`});
 h+=`<img id="clockimg" style="left:${Wd/2-18}px;top:34px;width:36px;height:36px;z-index:2"><span id="wxtag"></span>`;
 h+=`<img src="${wall}" style="left:0;top:0;width:${W*2}px;height:${H*2}px">`;
 h+=`<img src="${buildAwning(W)}" style="left:0;top:0;width:${W*2}px;height:32px;z-index:2">`;
 $("props").innerHTML=h;
 $("counter").style.background=`url(${buildCounter(W)}) 0 0/${W*2}px 26px no-repeat`;
 $("table").style.backgroundImage=`url(${buildCounterFront()}),url(${buildTableTile()})`;
 // luz que entra pelas janelas: feixe na parede/balcão (#props) e mancha no chão (#flight), centradas nas janelas
 {const z=sc.style.zoom=="0.5"?.5:1,t=$("table");WINS.forEach(([wx,wy,ww,wh],i)=>{t.style.setProperty("--w"+(i+1)+"x",Math.round((wx+ww/2)*2*z)+"px");
  $("props").insertAdjacentHTML("beforeend",`<div class="wlight" style="left:${wx*2-ww}px;top:${(wy+wh+6)*2}px;width:${ww*4}px;height:${Math.max(0,sc.clientHeight-(wy+wh+6)*2)}px"></div>`)})}
 $("cprops").innerHTML=`<img src="${decoSpr("plant")}" style="left:2px;bottom:0;${sz(decoSpr("plant"))}">`+(Wd>=700?`<img src="${decoSpr("scale")}" style="left:44px;bottom:0;${sz(decoSpr("scale"))}">`:"")+`<img src="${decoSpr("reg")}" style="right:2px;bottom:0;${sz(decoSpr("reg"))}">`;
 // lampiões pendurados no toldo (acendem à noite, no entardecer e na tempestade)
 sc.querySelectorAll(":scope>.lant,:scope>.lhalo").forEach(e=>e.remove());{const big=WINS[0][2]>40,ev=v=>Math.round(v/2)*2;(big?[.26,.74]:[.36,.64]).forEach((p,i)=>{const x=ev(Wd*p-9);sc.insertAdjacentHTML("beforeend",`<span class="lhalo" style="left:${x-32}px;top:8px"></span>`);$("custs").insertAdjacentHTML("beforebegin",`<span class="lant" style="left:${x}px;top:24px;animation-delay:-${i*.2}s"></span>`)});
  sc.style.setProperty("--lant",`url(${decoSpr("lantern")})`);sc.style.setProperty("--lhalo",`url(${decoSpr("halo")})`)}
 placeDeco();lantSync();
 updateSky();drawClock()}
/* ================= caldeirão ================= */
let brewing=false;
// caldeirão (Etapa 3): corpo de ferro 48×44 gerado uma vez; poção, luz, fumaça, bolhas e faíscas são folhas pequenas por cor (cache de 24)
const POT_IRON={o:"#17141f",d2:"#2a2638",d1:"#353048",b:"#4b4563",l1:"#625c80",l2:"#8a84ac",l3:"#b4aed6",rimD:"#3d3852",hole:"#1e1a2c"};
const potE=(cx,cy,a,b)=>(x,y)=>((x-cx)/a)**2+((y-cy)/b)**2<=1,POT_MOUTH=potE(23.5,11.5,18.5,3.4);
let POT_BODY=null;
function potImg(){if(POT_BODY)return POT_BODY;const I=POT_IRON,W=48,H=44,g=blank(W,H),body=potE(23.5,28,19.5,13.5),rim=potE(23.5,12,22,5),shine=ell(12.5,27,2.6,6,.35);
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){
  if(body(x,y)&&y>=14){let c=I.b;if(x<10||(x<12&&(x+y)%2==0))c=I.l1;if(x>37||(x>35&&(x+y)%2==0))c=I.d2;if(y>36&&x<=37)c=I.d1;if(y>38)c=I.d2;if(shine(x,y))c=I.l2;g[y][x]=c}
  if(rim(x,y))g[y][x]=y<=9?I.l2:y>=15?I.rimD:I.l1;
  if(POT_MOUTH(x,y))g[y][x]=I.hole}
 // brilho especular, cinta com rebites, luz na borda
 [[12,23],[12,24],[13,22]].forEach(([x,y])=>g[y][x]=I.l3);
 for(let x=5;x<43;x++)if(body(x,20)){g[20][x]=x<10?I.b:x>37?I.o:I.d1;if(x%6==2)g[19][x]=x>35?I.b:I.l2}
 for(let x=6;x<20;x++)if(rim(x,8)&&!rim(x,7))g[8][x]=I.l3;[[3,10],[4,9],[5,9]].forEach(([x,y])=>{if(rim(x,y))g[y][x]=I.l3});
 // alças (argolas) e 3 pés
 ["hhh.","h..h","h..h","hhh."].forEach((r,y)=>[...r].forEach((ch,x)=>{if(ch=="h"){g[21+y][0+x]=I.l1;g[21+y][47-x]=I.d1}}));
 [[9,I.d1],[22,I.d2],[35,I.d2]].forEach(([fx,c])=>{for(let y=40;y<43;y++)for(let x=fx;x<fx+4;x++)g[y][x]=y==40&&c==I.d1?I.b:c});
 return POT_BODY=toImg(W,H,g,I.o)}
// folha de 4 quadros do líquido: 192×18 (só a boca + espaço pra bolhas/respingos)
function potLiqSheet(cols,brew){const FW=48,FH=18,[c,g]=cvs(FW*4,FH),mix=cols.reduce((a,k)=>a.map((v,i)=>v+k[i]/cols.length),[0,0,0]);
 const sh=k=>({L:hex(lift(k,.5)),B:hex(k),D:hex(mul(k,.68)),W:"#ffffff"}),M=sh(mix),A=sh(cols[0]),Bc=sh(cols[cols.length-1]);
 const sites=brew?[[9,11,0],[16,13,2],[23,10,1],[30,13,3],[37,11,2]]:[[14,12,0],[26,10,2],[34,12,1]];
 for(let f=0;f<4;f++){const ox=f*FW,P=(x,y,col)=>{if(x>=0&&x<FW&&y>=0&&y<FH)px(g,ox+x,y,col)};
  for(let y=0;y<FH;y++)for(let x=0;x<FW;x++){if(!POT_MOUTH(x,y))continue;let s=M;
   if(brew)s=((x+y*3+f*3)%12<6)?A:Bc;                       // duas cores girando
   let col=y<=9?s.D:s.B;                                    // sombra da borda de trás
   if(!brew&&y==11&&(x+f*3)%14<5)col=s.L;                   // ondinha clara que anda 3 px por quadro
   if(!brew&&y==13&&(x+26-f*3)%16<4)col=s.L;
   if(brew&&(x+y*3+f*3)%12==0)col=s.L;
   P(x,y,col)}
  sites.forEach(([bx,by,off])=>{const st=(f+off)%4,L=M.L,W=M.W;
   if(st==0)P(bx,by,L);
   else if(st==1){P(bx,by,L);P(bx+1,by,L);P(bx,by-1,W);P(bx+1,by-1,L)}
   else if(st==2){const r=brew?[".LL.","LW.L","L..L",".LL."]:[".L.","LWL",".L."];r.forEach((row,yy)=>[...row].forEach((ch,xx)=>{if(ch!=".")P(bx-1+xx,by-(brew?3:2)+yy,ch=="W"?W:L)}))}
   else{[[-2,-2],[2,-3],[0,-4],[-1,0],[2,0]].forEach(([dx,dy])=>P(bx+dx,by+dy+(brew?-1:0),L))}});
  if(brew){[[11,5-(f%2)*3],[36,6-((f+1)%2)*3],[23,3-(f%2)*2]].forEach(([dx,dy],i)=>{const s=i==1?Bc:A;P(dx,dy,s.L);P(dx,dy+1,s.B);P(dx+1,dy+1,s.B)})}}
 return c.toDataURL()}
// luz no chão em degraus + sombra de contato: 128×48
function potFloorGlow(col){const W=128,H=48,[c,g]=cvs(W,H),k=lift(col,.3).map(Math.round),T=[[.16,.56],[.4,.38],[.7,.22],[1,.1]];
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const d=((x-63.5)/62)**2+((y-23.5)/23)**2;let a=0;
  for(let i=0;i<T.length;i++){if(d<T[i][0]){a=T[i][1];if(T[i][0]-d<.035&&(x+y)%2==0)a=i+1<T.length?T[i+1][1]:0;break}}
  if(a)px(g,x,y,`rgba(${k[0]},${k[1]},${k[2]},${a})`)}
 const sh=potE(63.5,25,21,4.2);for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(sh(x,y))px(g,x,y,"rgba(24,8,28,.5)");
 return c.toDataURL()}
// fumaça: tira de 3 quadros 9×7 (grande, média, rala); bolha 3×3; faísca 5×5
function potPuffStrip(col){const[c,g]=cvs(27,7),a=`rgba(${lift(col,.78).map(Math.round)},.9)`,b=`rgba(${lift(col,.55).map(Math.round)},.75)`;
 [["..aaaa...",".aaaaaab.","aaaaaaabb","aaaaaabbb",".aaabbbb.","..abbb...","........."],[".........","..aaa....",".aaaab...",".aaabb...","..abb....",".........","........."],[".........","...a.....","..a.b....","....b....",".b.......",".........","........."]]
  .forEach((rows,f)=>rows.forEach((r,y)=>[...r].forEach((ch,x)=>{if(ch!=".")px(g,f*9+x,y,ch=="a"?a:b)})));return c.toDataURL()}
function potBubble(col){const[c,g]=cvs(3,3),L=hex(lift(col,.5));px(g,1,0,L);px(g,0,1,"#ffffff");px(g,2,1,L);px(g,1,2,L);return c.toDataURL()}
function potSpark(col){const[c,g]=cvs(5,5),L=hex(lift(col,.6));px(g,2,0,L,1,5);px(g,0,2,L,5,1);px(g,2,2,"#ffffff");return c.toDataURL()}
const POT_FX={};
function potAssets(cols){const q=k=>k.map(v=>Math.round(v/8)*8),cs=cols.map(q),key=cs.map(k=>k.join(".")).join("|");
 if(POT_FX[key])return POT_FX[key];if(Object.keys(POT_FX).length>=24)for(const k in POT_FX)delete POT_FX[k];
 const mix=cs.reduce((a,k)=>a.map((v,i)=>v+k[i]/cs.length),[0,0,0]);
 return POT_FX[key]={idle:potLiqSheet([mix],false),brew:potLiqSheet(cs,true),glow:potFloorGlow(mix),puff:potPuffStrip(mix),bub:potBubble(mix),spark:potSpark(mix),hl:hex(lift(mix,.45)),hl2:hex(lift(mix,.75))}}
// respingos: gotas de 4 px saindo da boca em arco (só quando mistura; não roda com movimento reduzido)
function potSplash(cols,n){if(RM.matches||document.hidden)return;const r=$("potimg").getBoundingClientRect(),x0=r.left+r.width/2,y0=r.top+22;
 for(let i=0;i<n;i++){const d=document.createElement("div");d.className="pt psm";d.style.background=hex(lift(cols[i%cols.length],i%3==0?.5:.1));const sx=Math.round((Math.random()*56-28)/2)*2;d.style.left=(x0+sx)+"px";d.style.top=y0+"px";document.body.appendChild(d);
  const dx=Math.round((sx*1.2+(Math.random()*20-10))/2)*2,up=24+Math.round(Math.random()*12)*2;
  d.animate([{transform:"translate(0,0)",opacity:1},{transform:`translate(${dx/2}px,${-up}px)`,opacity:1,offset:.45},{transform:`translate(${dx}px,${10}px)`,opacity:0}],{duration:520,easing:"steps(8)"}).onfinish=()=>d.remove()}}
let potN=0;
function renderPot(){const p=S.pot,pot=$("pot"),im=$("potimg"),cols=p.length?p.map(f=>f.rgb):[[214,64,238]],A=potAssets(cols),st=pot.style;
 if(!im.dataset.b){im.src=potImg();im.dataset.b="1"}
 st.setProperty("--pi",`url(${A.idle})`);st.setProperty("--pb",`url(${A.brew})`);st.setProperty("--gl",`url(${A.glow})`);st.setProperty("--pf",`url(${A.puff})`);st.setProperty("--bbi",`url(${A.bub})`);st.setProperty("--spk",`url(${A.spark})`);st.setProperty("--hl",A.hl);st.setProperty("--hl2",A.hl2);
 pot.classList.toggle("has1",p.length==1);
 if(potN>=2&&p.length==0){pot.classList.remove("pop");void pot.offsetWidth;pot.classList.add("pop");setTimeout(()=>pot.classList.remove("pop"),500)}
 potN=p.length;
 $("potslots").innerHTML=[0,1].map(i=>`<div class="sl">${p[i]?`<img src="${fruitImg(p[i])}">`:""}</div>`).join("")}
function addToPot(f){buzz(20);S.pot.push(f);S.fruits=S.fruits.filter(x=>x!=f);sel=null;showInfo(null);save();renderTable();renderCounter();renderPot();SFX.plop();
const r=$("potimg").getBoundingClientRect();burst(r.left+r.width/2,r.top+18,f.rgb,10);
if(S.pot.length<2)return toast("Coloque mais uma fruta no caldeirão");
brew()}
function brew(){brewing=true;const sc=S.pot.map(f=>f.rgb);$("pot").classList.add("brew");SFX.brew();[0,350,700].forEach(t=>setTimeout(()=>potSplash(sc,5),t));
setTimeout(()=>{$("pot").classList.remove("brew");const ing=S.pot;if(!ing||ing.length<2||ing.some(f=>!f)){brewing=false;renderPot();return}S.pot=[];brewing=false;
const make=()=>{let c=cross(ing[0],ing[1]);if(ing[2]){c=cross(c,ing[2]);c.gen=Math.max(...ing.map(x=>x.gen))+1}return c};
rec("crosses",1);const kids=[make()];
kids.forEach((c,ki)=>{
const tr=tbl.getBoundingClientRect(),pr=$("pot").getBoundingClientRect();c.x=pr.right-tr.left+8+ki*70;c.y=pr.top-tr.top-fsize(c)/3-ki*20;clampPos(c);freeSpot(c);
S.fruits.push(c);sel=c.id;treeAdd(c,ing);if(c.shiny)rec("shiny",1);tutDone("t1");save();renderTable(c.id);renderPot();renderCounter();if(S.tut&&S.tut.t3){showInfo(c);infoAuto(c)}else sel=null;
const er=tbl.querySelector(`[data-id="${c.id}"]`).getBoundingClientRect(),ex=er.left+er.width/2,ey=er.top+er.height/2;burst(ex,ey,c.rgb,24);
if(c.mut||c.hero||c.shiny){burst(ex,ey,[180,155,255],18);SFX.mut();shake(c.hero?7:4);buzz([40,30,80])}else{SFX.pop();buzz(35)}if(c.el=="fogo")SFX.fire();
toast((c.hero?`<b>SUPER-FRUTA!</b> ${fname(c)}`:c.mut?`<b>MUTAÇÃO!</b> ${fname(c)}`:`Nasceu: <b>${fname(c)}</b>`))})},1100)}
function potTap(){if(brewing||!S.pot.length||modalOpen)return;if(S.pot.length>=2)return brew();const f=S.pot.pop();const tr=tbl.getBoundingClientRect(),pr=$("pot").getBoundingClientRect();f.x=pr.right-tr.left+8;f.y=pr.top-tr.top;clampPos(f);freeSpot(f,true);S.fruits.push(f);save();renderTable(f.id);renderPot()}
function freeFromPot(){const pr=$("pot");if(!pr||!tbl)return;let busy=false;try{busy=ptrDown||!!document.querySelector(".fr.drag,#pot.mv")}catch(e){}if(busy){clearTimeout(window.fpT);window.fpT=setTimeout(freeFromPot,300);return}const X=pr.offsetLeft,Y=pr.offsetTop,W=pr.offsetWidth,H=pr.offsetHeight;let mv=0;
 S.fruits.forEach(f=>{const z=fsize(f),hit=()=>f.x+z>X+6&&f.x<X+W-6&&f.y+z>Y+6&&f.y<Y+H-6;if(!hit())return;let k=0;do{f.x=N(6,Math.max(6,tbl.clientWidth-z-6));f.y=N(6,Math.max(6,tbl.clientHeight-z-6));k++}while(k<40&&hit());clampPos(f);mv++});if(mv){fixFruitDeco();renderTable()}}
function placePot(){const p=$("pot");if(!tbl.clientWidth||!tbl.clientHeight)return;if(!S.potPos){p.style.left=p.style.top=p.style.bottom="";p.style.top=cl(Math.round(p.offsetTop),0,Math.max(0,Math.round(tbl.clientHeight-p.offsetHeight)))+"px";p.style.left=Math.round(p.offsetLeft)+"px";p.style.bottom="auto";return}const w=p.offsetWidth,h=p.offsetHeight;// só o valor aplicado é limitado: a posição salva do jogador não é reescrita
 p.style.left=Math.round(cl(S.potPos.x,0,Math.max(0,tbl.clientWidth-w)))+"px";p.style.top=Math.round(cl(S.potPos.y,0,Math.max(0,tbl.clientHeight-h)))+"px";p.style.bottom="auto"}
(()=>{const p=$("pot");let sx,sy,ox,oy,on=false,mv=false;
p.addEventListener("pointerdown",e=>{if(modalOpen)return;e.preventDefault();p.setPointerCapture(e.pointerId);sx=e.clientX;sy=e.clientY;ox=p.offsetLeft;oy=p.offsetTop;on=true;mv=false});
p.addEventListener("pointermove",e=>{if(!on)return;const dx=e.clientX-sx,dy=e.clientY-sy;if(!mv&&Math.abs(dx)+Math.abs(dy)<6)return;if(!mv){mv=true;p.classList.add("mv")}
S.potPos={x:ox+dx,y:oy+dy};placePot()});
const up=()=>{if(!on)return;on=false;p.classList.remove("mv");if(mv){save();placeDeco();return}potTap()};
const cancel=()=>{if(!on)return;on=false;p.classList.remove("mv");if(mv){save();placeDeco()}};p.addEventListener("pointerup",up);p.addEventListener("pointercancel",cancel)})();
/* ================= efeitos ================= */
function burst(x,y,rgb,n){if(RM.matches)return;for(let i=0;i<n;i++){const d=document.createElement("div");d.className="pt";d.style.background=i%3==0?"#ffffff":hex(i%2?rgb:lift(rgb,.4));d.style.left=x+"px";d.style.top=y+"px";document.body.appendChild(d);
const a=Math.random()*Math.PI*2,r=28+Math.random()*50;d.animate([{transform:"translate(0,0)",opacity:1},{transform:`translate(${Math.cos(a)*r}px,${Math.sin(a)*r-18}px)`,opacity:0}],{duration:600+Math.random()*300,easing:"steps(6)"}).onfinish=()=>d.remove()}}
let undoT=null;function undoOffer(f,v){const u=$("undo");clearTimeout(undoT);u.innerHTML=`Vendida por ${v} <button class="btn" id="undob">DESFAZER</button><i></i>`;u.classList.remove("on");void u.offsetWidth;u.classList.add("on");
$("undob").onclick=()=>{clearTimeout(undoT);u.classList.remove("on");if(S.fruits.includes(f))return;if(S.coins<v){toast("Não dá pra desfazer: você já gastou as moedas dessa venda.");return}S.coins-=v;S.ds.earn-=v;S.fruits.push(f);clampPos(f);freeSpot(f,true);save();hud();renderTable(f.id);renderMarket();SFX.plop();toast("Venda desfeita!")};
undoT=setTimeout(()=>u.classList.remove("on"),3200)}
function tidy(){const pr=$("pot"),br=$("bin"),tw=tbl.clientWidth,th=tbl.clientHeight;const base=[[pr.offsetLeft-6,pr.offsetTop-6,pr.offsetWidth+12,pr.offsetHeight+12],[br.offsetLeft-6,br.offsetTop-6,br.offsetWidth+12,br.offsetHeight+12],[tw-90,0,90,34]];
const list=S.fruits.slice().sort((a,b)=>(a.sp||"").localeCompare(b.sp||"")||a.gen-b.gen);
// fileira por fileira, pulando os obstáculos. Fruta que não achou lugar livre vai pro fim da lista (ok=false)
const plan=blocks=>{const hit=(x,y,s)=>blocks.some(([bx,by,bw,bh])=>x<bx+bw&&x+s>bx&&y<by+bh&&y+s>by);let x=8,y=TOPMIN,rowH=0;const pos=[];
 list.forEach(f=>{const s=fsize(f);let guard=0,ok=false;while(guard++<200){if(x+s>tw-4){x=8;y+=rowH+6;rowH=0}if(y+s>th-4)break;if(!hit(x,y,s)){ok=true;break}x+=10}
  if(!ok)y=th-s-4;pos.push([x,y,ok]);x+=s+6;rowH=Math.max(rowH,s)});return pos};
const deco=decoBlocks(6);let pos=plan(base.concat(deco));
// quem sobrou (maiores primeiro): varredura de 8 em 8 px por qualquer vão que não cubra obstáculo nem fruta já posta.
// 1ª rodada evitando enfeites pra TODAS as que sobraram; só as que não couberam mesmo vão pra 2ª rodada (ignora enfeites); sem vão nenhum, empilha no fundo
const rect=i=>[pos[i][0],pos[i][1],fsize(list[i]),fsize(list[i])],ov=([bx,by,bw,bh],xx,yy,s)=>xx<bx+bw&&xx+s>bx&&yy<by+bh&&yy+s>by;
const scan=(i,blocks,st=8)=>{const s=fsize(list[i]),lo=fruitTop(th,s),placed=pos.map((_,j)=>j).filter(j=>j!=i&&pos[j][2]).map(rect);
 for(let yy=lo;yy<=th-s-2;yy+=st)for(let xx=4;xx<=tw-s-4;xx+=st)if(!blocks.some(b=>ov(b,xx,yy,s))&&!placed.some(b=>ov(b,xx,yy,s))){pos[i]=[xx,yy,true];return true}return false};
const left=pos.map((q,i)=>i).filter(i=>!pos[i][2]).sort((a,b)=>fsize(list[b])-fsize(list[a]));
let left2=left.filter(i=>!scan(i,base.concat(deco)));
if(left2.length){ // o arranjo por fileira desperdiçou espaço: refaz tudo, maiores primeiro, varredura de 6 em 6 px (só vale se sobrar menos fruta sem lugar)
 const keep=pos.map(q=>q.slice());pos=list.map(()=>[0,0,false]);const all=list.map((f,i)=>i).sort((a,b)=>fsize(list[b])-fsize(list[a]));
 const l2=all.filter(i=>!scan(i,base.concat(deco),6));
 if(l2.length<left2.length)left2=l2;else pos=keep}
left2.forEach(i=>scan(i,base,6));
pos.forEach((q,i)=>{if(!q[2]){const s=fsize(list[i]),y=Math.max(0,th-s-4);let x=null;for(let xx=4;xx<=tw-s-4&&x===null;xx+=8)if(!base.some(b=>ov(b,xx,y,s)))x=xx;pos[i]=[x===null?cl(8+i*20,4,Math.max(4,tw-s-4)):x,y,false]}}); // sem vão nenhum: fundo da mesa, nunca [0,0]
list.forEach((f,i)=>{f.x=pos[i][0];f.y=pos[i][1];clampPos(f)});save();renderTable();SFX.plop();buzz(15)}
$("tidy").onclick=tidy;
function buzz(p){if(!CFG.vib)return;try{if(navigator.vibrate)navigator.vibrate(p)}catch(e){}}
function floatText(x,y,t,c){const d=document.createElement("div");d.className="ftx";d.textContent=t;d.style.left=x+"px";d.style.top=y+"px";d.style.color=c||"#f7c331";document.body.appendChild(d);
d.animate([{transform:"translate(-50%,-50%) scale(.6)",opacity:0},{transform:"translate(-50%,-90%) scale(1.15)",opacity:1,offset:.25},{transform:"translate(-50%,-260%) scale(1)",opacity:0}],{duration:1100,easing:"steps(10)"}).onfinish=()=>d.remove()}
function shake(n){if(RM.matches)return;const a=document.body.animate([{transform:"translate(0,0)"},{transform:`translate(${n}px,${-n/2}px)`},{transform:`translate(${-n}px,${n/2}px)`},{transform:`translate(${n/2}px,${n}px)`},{transform:"translate(0,0)"}],{duration:320,easing:"steps(4)"})}
let combo=0,comboT=0;const COMBO_WIN=25000;
function comboHit(){combo=now()-comboT<COMBO_WIN?combo+1:1;comboT=now();renderCombo();rec("maxCombo",combo,1);return combo}
function rec(k,v,isMax){S.rec=S.rec||{};if(isMax)S.rec[k]=Math.max(S.rec[k]||0,v);else S.rec[k]=(S.rec[k]||0)+v;checkAch()}
const ACH=[["var25","Banco de sementes","Colete 25 variedades",()=>totalVars()>=25,20],["var100","Genética infinita","Colete 100 variedades",()=>totalVars()>=100,60],["cross10","Aprendiz de alquimista","Cruze 10 frutas",()=>S.rec.crosses>=10,10],["cross50","Alquimista","Cruze 50 frutas",()=>S.rec.crosses>=50,30],["cross200","Mestre do caldeirão","Cruze 200 frutas",()=>S.rec.crosses>=200,100],
["del10","Quitandeiro","Atenda 10 clientes",()=>S.delivered>=10,10],["del50","Freguesia fiel","Atenda 50 clientes",()=>S.delivered>=50,40],["del200","Lenda da feira","Atenda 200 clientes",()=>S.delivered>=200,120],
["sp10","Curioso","Descubra 10 espécies",()=>Object.keys(S.tree||{}).length>=10,15],["sp30","Naturalista","Descubra 30 espécies",()=>Object.keys(S.tree||{}).length>=30,40],["sp100","Árvore infinita","Descubra 100 espécies",()=>Object.keys(S.tree||{}).length>=100,150],
["micro","Microscópio","Crie uma fruta Microscópica",()=>spAny(k=>k.startsWith("Microscópica")),20],["giga","Titã","Crie uma fruta Gigantesca",()=>spAny(k=>k.startsWith("Gigantesca")),20],
["super","Herói da feira","Crie uma super-fruta",()=>spAny(k=>k.endsWith("|S")),30],["shiny","Brilho raro","Encontre uma fruta brilhante",()=>(S.rec.shiny||0)>=1,25],
["leg","Lendária!","Descubra uma espécie Lendária",()=>Object.values(S.tree||{}).some(t=>stars(t)>=5),60],["vip5","Clientela VIP","Atenda 5 VIPs",()=>(S.rec.vips||0)>=5,30],
["combo5","Combo x5","Faça um combo de 5 entregas",()=>(S.rec.maxCombo||0)>=5,25],["day100","Dia de ouro","Lucre 100 moedas num dia",()=>(S.rec.bestDay||0)>=100,30],["item10","Cientista maluco","Use 10 artefatos",()=>(S.rec.items||0)>=10,30]];
const TROPHY=()=>art(["y.yyy.y","yyyyyyy",".yyyyy.","..yyy..","...y...","..yyy..",".ddddd."],{y:"#f7c331",d:"#a87b00"},"#6b4a10");
const spAny=fn=>Object.keys(S.tree||{}).some(fn);
function checkAch(){S.ach=S.ach||{};S.rec=S.rec||{};ACH.forEach(([id,n,d,ok,rw])=>{if(S.ach[id]||!ok())return;S.ach[id]=Date.now();portalHappy();S.coins+=rw;save();
 setTimeout(()=>{toast(`<img src="${TROPHY()}" style="width:16px;height:16px;display:inline-block;vertical-align:-4px;image-rendering:pixelated"> <b>CONQUISTA!</b> ${n}<br>+${rw} moedas`);SFX.lvl();buzz([30,40,30]);hud()},1600)})}
function renderCombo(){const e=$("combo");if(!e)return;const left=combo>=2?1-(now()-comboT)/COMBO_WIN:0;if(left<=0){e.classList.remove("on");if(left<=0&&combo>=2&&now()-comboT>=COMBO_WIN)combo=0;return}
if(!e.classList.contains("on")){e.classList.add("on")}e.innerHTML=`COMBO x${combo}<i style="width:${Math.max(0,left*100)}%"></i>`}
// moedas "voando": já estão no saldo (S.coins), mas o contador do topo só mostra quando chegam
let coinFly=0;const showCoins=()=>{$("coins").textContent=Math.max(0,S.coins-coinFly)};
function flyCoins(x,y,n,total){coinFly+=total||0;const t=$("hudcoin").getBoundingClientRect(),k=cl(n,1,10);let done=false;
for(let i=0;i<k;i++)setTimeout(()=>{const d=document.createElement("div");d.className="fc";d.style.left=x+"px";d.style.top=y+"px";document.body.appendChild(d);
d.animate([{transform:"translate(0,0)"},{transform:`translate(${(Math.random()-.5)*50}px,${-24-Math.random()*24}px)`,offset:.3},{transform:`translate(${t.left-x}px,${t.top-y}px)`}],{duration:750,easing:"ease-in"}).onfinish=()=>{d.remove();if(i%3==0)SFX.coin();
if(i==k-1&&!done){done=true;coinFly=Math.max(0,coinFly-total);showCoins();const tg=$("cointag");tg.classList.remove("bump");void tg.offsetWidth;tg.classList.add("bump");save();renderMarket()}}},i*60)}
/* ================= som (chiptune) ================= */
let AC=null,muted=false;try{muted=localStorage.getItem("frutodromo_mute")=="1"}catch(e){}
// iPhone/iPad (inclusive dentro do app e de iframes): com a chave do silencioso ligada o Web Audio fica mudo.
// Tocar um <audio> silencioso em loop, iniciado num toque, muda a sessão de áudio pra "reprodução" e libera o som.
function silentWav(){const n=800,b=new ArrayBuffer(44+n),v=new DataView(b),w=(o,t)=>[...t].forEach((c,i)=>v.setUint8(o+i,c.charCodeAt(0)));
 w(0,"RIFF");v.setUint32(4,36+n,true);w(8,"WAVE");w(12,"fmt ");v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,8000,true);v.setUint32(28,8000,true);v.setUint16(32,1,true);v.setUint16(34,8,true);w(36,"data");v.setUint32(40,n,true);for(let i=0;i<n;i++)v.setUint8(44+i,128);
 return URL.createObjectURL(new Blob([b],{type:"audio/wav"}))}
let silentEl=null;function keepAudioSession(){try{if(!silentEl){silentEl=document.createElement("audio");silentEl.src=silentWav();silentEl.loop=true;silentEl.setAttribute("playsinline","");silentEl.setAttribute("x-webkit-airplay","deny");silentEl.preload="auto"}
 if(silentEl.paused&&!document.hidden){const pr=silentEl.play();if(pr&&pr.catch)pr.catch(()=>{})}}catch(e){}}
document.addEventListener("visibilitychange",()=>{if(document.hidden&&silentEl)silentEl.pause()});
function unlockAudio(){if(!muted)keepAudioSession();const a=ac();if(!a||unlockAudio.ok)return;try{const b=a.createBuffer(1,1,22050),src=a.createBufferSource();src.buffer=b;src.connect(a.destination);src.start(0)}catch(e){}
 if(a.state=="running")unlockAudio.ok=1;else a.resume().then(()=>{unlockAudio.ok=1}).catch(()=>{})}
try{if(navigator.audioSession)navigator.audioSession.type="playback"}catch(e){}
["touchend","click","keydown"].forEach(ev=>document.addEventListener(ev,unlockAudio,{capture:true,passive:true}));
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&AC&&AC.state!="running"){unlockAudio.ok=0;AC.resume().catch(()=>{})}});
const RM=matchMedia("(prefers-reduced-motion: reduce)");
function ac(){try{if(!AC)AC=new(window.AudioContext||window.webkitAudioContext)();if(AC.state!="running"&&!CGMUTE)AC.resume().catch(()=>{})}catch(e){}return AC}
var CGMUTE=false;// som desligado pelo CrazyGames (tem prioridade sobre o botão de som do jogo)
function tone(f,d,type="square",vol=.05,when=0,slide=0,music,dest){if(muted||CGMUTE||!AC)return;vol*=(music?CFG.mus:CFG.sfx)/100*(music?1.4:1.2);if(vol<=0.0002)return;try{const a=AC,t=a.currentTime+when,o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(slide)o.frequency.linearRampToValueAtTime(Math.max(30,f+slide),t+d);
if(dest){g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.04)}else g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(dest||a.destination);o.start(t);o.stop(t+d+.03)}catch(e){}}
const SFX={plop:()=>tone(330,.14,"square",.06,0,-180),brew:()=>{for(let i=0;i<8;i++)tone(180+Math.random()*320,.08,"triangle",.06,i*.12)},pop:()=>{tone(523,.08);tone(784,.14,"square",.05,.08)},
coin:()=>{tone(988,.05,"square",.035);tone(1319,.1,"square",.035,.05)},bad:()=>tone(150,.28,"sawtooth",.05,0,-40),lvl:()=>[523,659,784,1047].forEach((f,i)=>tone(f,.13,"square",.05,i*.1)),
mut:()=>[392,523,659,784,1047,1319].forEach((f,i)=>tone(f,.08,"square",.045,i*.06)),dex:()=>{tone(880,.1,"triangle",.08);tone(1175,.2,"triangle",.08,.1)},
day:()=>[784,659,523,659,784,1047].forEach((f,i)=>tone(f,.16,"square",.05,i*.14)),buy:()=>tone(660,.06,"square",.04),
sel:()=>{tone(1047,.035,"square",.035);tone(1568,.05,"square",.03,.035)},
bag:()=>{bagAnim=1;setTimeout(()=>bagAnim=0,400);tone(180,.07,"square",.04,0,420);tone(523,.05,"square",.035,.07);tone(784,.05,"square",.035,.11);tone(1175,.09,"square",.03,.15)},
bell:()=>{tone(1568,.09,"triangle",.045);tone(1319,.22,"triangle",.04,.1)},
bagc:()=>{tone(1175,.04,"square",.03);tone(784,.04,"square",.03,.04);tone(392,.08,"square",.035,.08,-180)},
open:()=>[523,659,784,1047].forEach((f,i)=>tone(f,.06,"square",.035,i*.035)),
close:()=>[988,784,587].forEach((f,i)=>tone(f,.05,"square",.03,i*.035)),fire:()=>tone(110,.35,"sawtooth",.03,0,240)};
const MEL=[523,0,659,0,784,659,523,0,587,0,698,0,880,698,587,0,523,0,659,784,880,0,784,659,587,523,0,587,659,0,0,0],BAS=[131,131,196,196,175,175,147,196];let step=0;
/* ---- som ambiente (chuva e trovão) e trilha lo-fi, tudo gerado no navegador ---- */
const AMB={g:null,lp:null,key:""};let NOISE=null;
function noiseBuf(){if(NOISE)return NOISE;const a=AC,b=a.createBuffer(1,a.sampleRate*3,a.sampleRate),d=b.getChannelData(0);let br=0;for(let i=0;i<d.length;i++){const w=Math.random()*2-1;br=(br+.02*w)/1.02;d[i]=w*.5+br*2.5}return NOISE=b}
function ambSet(lv){if(!AC||AC.state!="running")return;const on=lv>0&&!muted&&!CGMUTE&&CFG.amb!==false&&!document.hidden,vol=on?[0,.016,.028,.045][lv]*CFG.sfx/100:0;
 if(!AMB.g){if(!on)return;const a=AC,src=a.createBufferSource();src.buffer=noiseBuf();src.loop=true;const hp=a.createBiquadFilter();hp.type="highpass";hp.frequency.value=350;const lp=a.createBiquadFilter();lp.type="lowpass";const g=a.createGain();g.gain.value=0;src.connect(hp);hp.connect(lp);lp.connect(g);g.connect(a.destination);src.start();AMB.g=g;AMB.lp=lp}
 const key=vol.toFixed(3)+"|"+lv;if(key==AMB.key)return;AMB.key=key;const t=AC.currentTime;AMB.g.gain.cancelScheduledValues(t);AMB.g.gain.setTargetAtTime(vol,t,.7);AMB.lp.frequency.setTargetAtTime([1200,1300,2200,3400][lv],t,.5)}
function ambThunder(){if(!AC||AC.state!="running"||muted||CGMUTE||CFG.amb===false)return;const a=AC,t=a.currentTime,src=a.createBufferSource();src.buffer=noiseBuf();const lp=a.createBiquadFilter();lp.type="lowpass";lp.frequency.value=160;const g=a.createGain(),v=.22*CFG.sfx/100;
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.12);g.gain.exponentialRampToValueAtTime(v*.45,t+.7);g.gain.exponentialRampToValueAtTime(.0001,t+2.8);src.connect(lp);lp.connect(g);g.connect(a.destination);src.start(t);src.stop(t+3)}
// lo-fi: acordes de sétima suaves, baixo, notas soltas com swing e um chiado de vinil, num filtro abafado
const LOFI={ch:[[349,440,523,659],[330,392,494,587],[294,349,440,523],[262,330,392,494]],bs:[87,82,73,65]};let lstep=0,LBUS=null;
const lofiOn=()=>{const st=CFG.musStyle||"auto";return st=="lofi"||(st=="auto"&&!!WXS&&(WXS.ph=="night"||WXS.w=="rain"||WXS.w=="storm"))};
function lofiBus(){if(!LBUS){LBUS=AC.createBiquadFilter();LBUS.type="lowpass";LBUS.frequency.value=1400;LBUS.Q.value=.6;LBUS.connect(AC.destination)}return LBUS}
// ocarina: seno puro com vibrato leve e um sopro curto no começo de cada nota; melodia original (Ré menor pentatônica)
const OCA=[[0,880,2],[2,1047,2],[4,880,1],[5,784,1],[6,698,2],[8,587,3],[11,698,1],[12,784,2],[14,880,2],[16,1047,2],[18,880,2],[20,784,2],[22,698,1],[23,784,1],[24,880,6]];
function ocarina(f,d,when){if(muted||CGMUTE||!AC)return;const a=AC,t=a.currentTime+when,B=lofiBus(),v=.032*CFG.mus/100*1.4;if(v<=.0002)return;try{
 const o=a.createOscillator(),g=a.createGain(),lfo=a.createOscillator(),lg=a.createGain();o.type="sine";o.frequency.value=f;lfo.frequency.value=5.2;lg.gain.setValueAtTime(0,t);lg.gain.linearRampToValueAtTime(f*.007,t+.25);lfo.connect(lg);lg.connect(o.frequency);
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.07);g.gain.setValueAtTime(v,t+Math.max(.08,d-.15));g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(B);
 const n=a.createBufferSource(),bp=a.createBiquadFilter(),ng=a.createGain();n.buffer=noiseBuf();bp.type="bandpass";bp.frequency.value=f*2;bp.Q.value=2.5;ng.gain.setValueAtTime(v*.3,t);ng.gain.exponentialRampToValueAtTime(.0001,t+.1);n.connect(bp);bp.connect(ng);ng.connect(B);
 o.start(t);lfo.start(t);o.stop(t+d+.05);lfo.stop(t+d+.05);n.start(t,Math.random()*2);n.stop(t+.12)}catch(e){}}
function lofiTick(){const e=lstep%8,bar=(lstep/8|0)%4,ch=LOFI.ch[bar],B=lofiBus(),sw=e%2?.08:0,solo=(lstep/32|0)%2==1;
 if(solo)OCA.filter(n=>n[0]==lstep%32).forEach(([,f,l])=>ocarina(f,l*.38*.95,sw));
 if(e==0||e==5)ch.forEach((f,k)=>tone(f,1.7,"triangle",.011,sw+k*.018,0,1,B));
 if(e==0||e==4)tone(LOFI.bs[bar]*2,.95,"sine",.06,sw,0,1,B);
 if(!solo&&e!=0&&Math.random()<.32)tone(ch[(Math.random()*4)|0]*2,.55,"sine",.02,sw,0,1,B);
 if(Math.random()<.3)tone(2500+Math.random()*3500,.012,"square",.0025,Math.random()*.3,0,1,B);lstep++}
setInterval(()=>{if(muted||!running||modalOpen||!AC)return;if(lofiOn()){if(step%2==0)lofiTick();step++;return}const n=MEL[step%MEL.length];if(n)tone(n,.16,"square",.014,0,0,1);if(step%4==0)tone(BAS[(step/4|0)%BAS.length],.32,"triangle",.04,0,0,1);step++},190);
function sndLabel(){const b=$("sndb");if(b)b.textContent=muted?"SOM: DESLIGADO":"SOM: LIGADO"}
function toggleSnd(){muted=!muted;try{localStorage.setItem("frutodromo_mute",muted?"1":"0")}catch(e){}ac();if(muted){if(silentEl)silentEl.pause()}else keepAudioSession();sndLabel()}
/* ================= dias ================= */
const fmt=ms=>{const s=Math.max(0,Math.ceil(ms/1000));return Math.floor(s/60)+":"+String(s%60).padStart(2,"0")};
function drawClock(){const im=$("clockimg");if(!im)return;const[c,g]=cvs(18,18),d=new Date(),h=d.getHours()%12+d.getMinutes()/60,m=d.getMinutes();
 for(let y=0;y<18;y++)for(let x=0;x<18;x++){const r=Math.hypot(x-8.5,y-8.5);if(r<=8.6)px(g,x,y,r>7.6?"#5a3e26":r>6.8?"#8a5a34":"#f5efe0")}
 for(let k=0;k<12;k++){const a=k/12*Math.PI*2;px(g,Math.round(8.5+Math.sin(a)*5.6),Math.round(8.5-Math.cos(a)*5.6),k%3==0?"#2a1a12":"#b8a888")}
 const hand=(ang,len,col)=>{for(let t=0;t<=len;t+=.5)px(g,Math.round(8.5+Math.sin(ang)*t),Math.round(8.5-Math.cos(ang)*t),col)};
 hand(h/12*Math.PI*2,3.8,"#2a1a12");hand(m/60*Math.PI*2,5.6,"#c0392b");px(g,8,8,"#2a1a12",2,2);im.src=c.toDataURL();
 im.title=d.toLocaleTimeString(EN?"en-US":"pt-BR",{hour:"2-digit",minute:"2-digit"})}
setInterval(drawClock,20000);
const WX={ok:false};
const hrsOf=iso=>{const t=(iso||"").split("T")[1]||"";const[a,b]=t.split(":").map(Number);return isNaN(a)?null:a+(b||0)/60};
const isRain=c=>(c>=51&&c<=67)||(c>=80&&c<=82)||c>=95,isSnow=c=>(c>=71&&c<=77)||c==85||c==86,isFog=c=>c==45||c==48;
async function fetchWX(){if(!CFG.wx||!CFG.loc)return;try{const[la,lo]=CFG.loc;
 const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${la}&longitude=${lo}&current=temperature_2m,weather_code,is_day,cloud_cover,precipitation,wind_gusts_10m&daily=sunrise,sunset&timezone=auto&forecast_days=1`);
 const j=await r.json(),c=j.current;Object.assign(WX,{ok:true,code:c.weather_code,isDay:c.is_day,temp:Math.round(c.temperature_2m),cloud:c.cloud_cover,precip:c.precipitation,gust:c.wind_gusts_10m,sr:hrsOf(j.daily.sunrise[0]),ss:hrsOf(j.daily.sunset[0])});
 updateSky();checkAlerts()}catch(e){WX.ok=false}}
setInterval(fetchWX,20*60000);
function askWeather(next){if(CFG.wx!==undefined||!navigator.geolocation||PORTAL.name){next&&next();return}
 openModal(`<h2>CLIMA DE VERDADE?</h2><p>A janela da quitanda pode mostrar o <b>tempo real da sua cidade</b>: sol, nuvens, chuva e noite. Se vier tempo perigoso, o jogo te avisa.</p><p style="font-size:var(--t12);opacity:.8">Usa sua localização aproximada só pra buscar a previsão (Open-Meteo). Nada é guardado fora do seu aparelho.</p><button class="big" id="wxy">SIM, MOSTRAR</button><br><button class="big alt" id="wxn">AGORA NÃO</button>`);
 $("wxn").onclick=()=>{CFG.wx=false;saveCfg();closeModal();next&&next()};
 $("wxy").onclick=()=>{closeModal();next&&next();try{navigator.geolocation.getCurrentPosition(p=>{CFG.loc=[+p.coords.latitude.toFixed(1),+p.coords.longitude.toFixed(1)];CFG.wx=true;saveCfg();fetchWX()},()=>{CFG.wx=false;saveCfg();toast("Sem localização: a janela mostra só a hora do dia")},{timeout:10000,maximumAge:3600000})}catch(e){CFG.wx=false;saveCfg()}}}
function checkAlerts(){if(!WX.ok)return;const al=[];
 if(WX.code>=95)al.push(["TEMPESTADE COM RAIOS","Há tempestade com raios na sua região agora.","Fique em local fechado, longe de janelas, árvores e postes. Evite usar aparelhos ligados na tomada."]);
 if(WX.precip>=10||[65,67,82].includes(WX.code))al.push(["CHUVA FORTE","Está chovendo forte na sua região.","Cuidado com alagamentos e enxurradas. Nunca atravesse ruas ou rios alagados."]);
 if(WX.temp>=36)al.push(["CALOR EXTREMO",`A temperatura está em ${WX.temp}°C.`,"Beba bastante água, evite sol forte entre 10h e 16h e cuide de crianças, idosos e animais."]);
 if(WX.temp<=3)al.push(["FRIO INTENSO",`A temperatura está em ${WX.temp}°C.`,"Agasalhe-se bem e proteja pessoas em situação de rua, idosos e animais."]);
 if(WX.gust>=70)al.push(["VENTOS FORTES",`Rajadas de até ${Math.round(WX.gust)} km/h.`,"Fique longe de árvores, placas e estruturas soltas."]);
 if(!al.length)return;const key=al.map(a=>a[0]).join()+new Date().toDateString()+new Date().getHours();if(CFG.lastAlert==key)return;CFG.lastAlert=key;saveCfg();
 const show=()=>{if(modalOpen){setTimeout(show,3000);return}SFX.bad();buzz([200,100,200]);openModal(`<h2 style="color:#c0392b">AVISO DO TEMPO</h2>${al.map(([t,a,b])=>`<div class="cg" style="border-image-source:var(--f-err)"><div style="text-align:left"><b>${t}</b><br>${a}<br><span style="font-size:var(--t12)">${b}</span></div></div>`).join("")}
 <p style="font-size:var(--t12);opacity:.8">Baseado na previsão do Open-Meteo pra sua região. <b>Não é um alerta oficial.</b> Pra avisos oficiais, acompanhe a <b>Defesa Civil (ligue 199)</b> e o <b>INMET</b>.</p><button class="big" id="cl">ENTENDI</button>`);$("cl").onclick=closeModal};show()}
function realH(){const d=new Date();return d.getHours()+d.getMinutes()/60}
function wxState(){const h=realH(),sr=WX.ok&&WX.sr!=null?WX.sr:6,ss=WX.ok&&WX.ss!=null?WX.ss:18;let ph=h<sr-.6||h>ss+.6?"night":h<sr+.8?"dawn":h>ss-.8?"dusk":"day";
 let w="sun",lv=0;if(WX.ok){const c=WX.code;w=c>=95?"storm":isSnow(c)?"snow":isRain(c)?"rain":isFog(c)?"fog":WX.cloud>=70||c==3?"cloud":WX.cloud>=30||c==2?"few":"sun";
  // intensidade: 1 garoa/chuva fraca, 2 chuva, 3 chuva forte (códigos WMO + milímetros na última hora)
  if(w=="rain")lv=Math.max([65,67,82].includes(c)?3:[63,81].includes(c)?2:1,WX.precip>=7.6?3:WX.precip>=2.5?2:1);if(w=="storm")lv=3}
 const f=CFG.wxForce||"auto";if(f!="auto"){const F={sol:()=>{w="sun";ph="day"},nublado:()=>{w="cloud";ph="day"},garoa:()=>{w="rain";lv=1;ph="day"},chuva:()=>{w="rain";lv=2;ph="day"},chuvaforte:()=>{w="rain";lv=3;ph="day"},tempestade:()=>{w="storm";lv=3;ph="day"},estrelada:()=>{w="sun";ph="night"},noitechuva:()=>{w="rain";lv=2;ph="night"},entardecer:()=>{w="few";ph="dusk"}};if(F[f])F[f]()}
 return{ph,w,lv,frac:cl((h-sr)/Math.max(1,ss-sr),0,1)}}
let WXS=null,lightT=0;
// luz do dia: cor e força da luz das janelas (feixes, mancha no chão) e escurecimento do chão (#tamb) por estado do céu
function wxLight(ws){const{ph,w}=ws,night=ph=="night",grey=["cloud","rain","storm","fog","snow"].includes(w);
 let col="#ffe2a8",op=.55;if(ph=="dawn"){col="#ffc890";op=.6}else if(ph=="dusk"){col="#ff9c5c";op=.7}else if(w=="few")op=.44;
 if(grey){col="#e4ecf6";op=w=="storm"?.1:.22}if(night){col="#a9b8ff";op=grey?0:.3}
 $("table").style.setProperty("--wlc",col);$("scene").style.setProperty("--wlc",col);
 document.querySelectorAll(".wlight").forEach(e=>e.style.opacity=op);$("flight").style.opacity=op;
 $("tamb").style.background=$("sky").style.background;$("flamp").style.opacity=(parseFloat($("lamp").style.opacity)||0)*.9;lantSync()}
function updateSky(){const sk=$("sky");if(!sk)return;const ws=wxState(),{ph,w,lv,frac}=ws,night=ph=="night";WXS=ws;
 const grey=["cloud","rain","storm","fog","snow"].includes(w);
 let skyC={night:[22,24,58],dawn:[250,176,128],dusk:[240,138,92],day:[118,192,244]}[ph];if(grey)skyC=night?(w=="cloud"?[34,36,46]:[28,30,40]):ph=="day"?({cloud:[160,168,180],rain:[[150,158,172],[150,158,172],[132,140,154],[112,120,134]][lv],storm:[96,102,116],fog:[200,202,208],snow:[196,200,210]}[w]):skyC.map((v,i)=>Math.round(v*.3+[150,154,164][i]*.7));
 sk.style.background=grey&&!night?"#e6e6ee":{night:"#a4a2d4",dawn:"#ffe6d0",dusk:"#ffd8bc",day:"#ffffff"}[ph];$("lamp").style.opacity=night?.5:ph=="dusk"||w=="storm"||lv>=3?.4:0;
 [1,2].forEach(n=>{const el=$("win"+n),e=$("sun"+n);if(!el||!e)return;el.style.background=hex(skyC);
  const cls={night,starry:night&&!grey,rain:w=="rain"||w=="storm",r1:lv==1,r3:lv>=3,storm:w=="storm",snow:w=="snow",fog:w=="fog",cloudy:grey,few:w=="few"};Object.entries(cls).forEach(([k,v])=>el.classList.toggle(k,!!v));
  const W2=el.clientWidth,H2=el.clientHeight;e.style.display=grey?"none":"";e.style.background=`url(${night?MOONI():ph=="day"?SUNI():DUSKI()}) 0 0/100% 100%`;e.style.boxShadow="none";
  e.style.left=(night?W2-20:Math.round(4+frac*(W2-18)))+"px";e.style.top=(night?5:Math.round(H2*.62-Math.sin(frac*Math.PI)*H2*.5))+"px"});
 const t=$("wxtag");if(t){if(WX.ok){t.textContent=WX.temp+"°";t.style.display=""}else t.style.display="none"}
 // relâmpago na tempestade (a cada 9 a 25 s) e o trovão chega um pouco depois; chuva com som conforme a intensidade
 if(w=="storm"&&Date.now()>lightT){if(lightT&&!document.hidden){if(!RM.matches)[1,2].forEach(n=>{const el=$("win"+n);if(el){el.classList.remove("flash");void el.offsetWidth;el.classList.add("flash")}});setTimeout(()=>ambThunder(),500+Math.random()*1200)}lightT=Date.now()+9000+Math.random()*16000}
 wxLight(ws);
 ambSet(w=="rain"||w=="storm"?lv:0)}
function setLang(k){if(k==LANG)return;CFG.lang=k;saveCfg();try{saveNow()}catch(e){}location.reload()}
function settings(back){const sl=(id,lab,v)=>`<div style="display:flex;align-items:center;gap:8px;margin:8px 0;text-align:left"><span style="width:80px">${lab}</span><input type="range" id="${id}" min="0" max="100" value="${v}" style="flex:1;accent-color:#3ca55c"><b id="${id}v" style="width:34px">${v}</b></div>`;
const tg=(id,lab,on,desc)=>`<div class="cg" style="cursor:pointer" id="${id}"><span class="big-sw" style="width:26px;height:26px;background:${on?"#3ca55c":"#c9b99a"}"></span><div style="flex:1"><b>${lab}: ${on?"LIGADO":"DESLIGADO"}</b><br><span style="font-size:var(--t12)">${desc}</span></div></div>`;
openModal(`<h2>AJUSTES</h2>${sl("smus","Música",CFG.mus)}${sl("ssfx","Efeitos",CFG.sfx)}
${tg("svib","Vibração",CFG.vib,"Vibra o celular ao cruzar, entregar e descobrir")}
${tg("szen","Modo Zen",CFG.zen,"Sem relógio e sem pressa: o dia não acaba e os clientes esperam pra sempre")}${tg("swx","Clima real na janela",!!CFG.wx,"Mostra o tempo da sua cidade e avisa sobre tempo perigoso")}
${tg("samb","Som de chuva",CFG.amb!==false,"Barulho de chuva e trovão quando estiver chovendo na janela")}
<div style="text-align:left;margin:8px 0"><b>Estilo da música:</b><div class="flt" style="border:2px solid #2a1a12;margin-top:4px;flex-wrap:wrap">${[["auto","Automático (lo-fi na chuva e à noite)"],["chip","Chiptune"],["lofi","Lo-fi"]].map(([k,l])=>`<span class="${(CFG.musStyle||"auto")==k?"on":""}" onclick="CFG.musStyle='${k}';saveCfg();settings()">${l}</span>`).join("")}</div></div>
<div style="text-align:left;margin:8px 0"><b>Ver clima na janela:</b><div class="flt" style="border:2px solid #2a1a12;margin-top:4px;flex-wrap:wrap">${[["auto","Automático"],["sol",EN?"Sunny":"Sol"],["nublado","Nublado"],["garoa","Garoa"],["chuva","Chuva"],["chuvaforte","Chuva forte"],["tempestade","Tempestade"],["entardecer","Entardecer"],["estrelada","Noite estrelada"],["noitechuva","Noite chuvosa"]].map(([k,l])=>`<span class="${(CFG.wxForce||"auto")==k?"on":""}" onclick="CFG.wxForce='${k}';saveCfg();updateSky();settings()">${l}</span>`).join("")}</div></div>
<div style="text-align:left;margin:8px 0"><b>Idioma / Language:</b><div class="flt" style="border:2px solid #2a1a12;margin-top:4px">${[["pt","Português"],["en","English"]].map(([k,l])=>`<span class="${LANG==k?"on":""}" onclick="setLang('${k}')">${l}</span>`).join("")}</div></div>
<button class="big alt" id="stut">REVER TUTORIAL</button><br><button class="big alt" id="sexp">EXPORTAR PROGRESSO</button><button class="big alt" id="simp">IMPORTAR</button><br><button class="big" id="cl">PRONTO</button>`);
["smus","ssfx"].forEach(id=>{$(id).oninput=e=>{const v=+e.target.value;$(id+"v").textContent=v;if(id=="smus")CFG.mus=v;else{CFG.sfx=v;SFX.coin()}saveCfg()}});
$("svib").onclick=()=>{CFG.vib=!CFG.vib;saveCfg();buzz(40);settings(back)};$("samb").onclick=()=>{CFG.amb=CFG.amb===false;saveCfg();settings(back)};$("szen").onclick=()=>{CFG.zen=!CFG.zen;saveCfg();hud();renderCounter();settings(back)};$("swx").onclick=()=>{if(CFG.wx){CFG.wx=false;WX.ok=false;saveCfg();updateSky();settings(back)}else{delete CFG.wx;saveCfg();closeModal();askWeather(()=>settings(back))}};
$("stut").onclick=()=>{S.tut={};save();closeModal();tutStep()};
$("sexp").onclick=()=>{save();const code="FRUTO1:"+btoa(unescape(encodeURIComponent(JSON.stringify(S))));
 openModal(`<h2>SEU CÓDIGO</h2><p style="font-size:var(--t12)">Guarde esse código (num bloco de notas ou mande pra você mesmo). Ele leva tudo: frutas, espécies, cartas e conquistas.</p><textarea id="bk" readonly style="width:100%;height:140px;font-size:var(--t10);font-family:monospace">${code}</textarea><button class="big" id="bkc">COPIAR</button><button class="big alt" id="cl">VOLTAR</button>`);
 $("bkc").onclick=async()=>{try{await navigator.clipboard.writeText(code);toast("Código copiado!")}catch(e){$("bk").select();toast("Selecionei o código. Copie manualmente.")}};$("cl").onclick=()=>settings(back)};
$("simp").onclick=()=>{openModal(`<h2>IMPORTAR</h2><p style="font-size:var(--t12)">Cole o código do seu progresso. Isso <b>substitui</b> o jogo atual deste aparelho.</p><textarea id="bk" style="width:100%;height:140px;font-size:var(--t10);font-family:monospace"></textarea><button class="big" id="bki">CARREGAR</button><button class="big alt" id="cl">VOLTAR</button>`);
 $("cl").onclick=()=>settings(back);$("bki").onclick=()=>{try{const v=$("bk").value.trim();if(!v.startsWith("FRUTO1:"))throw 0;const d=JSON.parse(decodeURIComponent(escape(atob(v.slice(7)))));const n=normState(d,true);if(!n)throw 0;n.bag=n.bag.filter(x=>ITEMS[x.t]);
  const old=S;S=n;try{migrate();S.fruits.forEach(f=>treeAdd(f,null,true));closeModal();running=false;renderAll();placePot()}catch(err){S=old;renderAll();placePot();throw err}
  fixFruitDeco();save();toast("Progresso carregado!");startScreen()}catch(e){toast("Código inválido. Seu progresso não mudou.",{err:true})}}};$("cl").onclick=()=>{closeModal();if(back)back()}}
const TUT=[["pot","Arraste <b>duas frutas</b> até o <b>caldeirão</b> pra criar uma nova!","t1"],["cust","Agora arraste uma fruta até o <b>cliente</b> que pediu algo parecido. Toque no <b>?</b> do balão se precisar da receita.","t2"],["dexb","Toque numa fruta pra ver os atributos. Na <b>ÁRVORE</b> ficam todas as espécies que você descobriu!","t3"],["market","<b>Segure</b> uma fruta da feira (ou passe o mouse) pra ver doce, azedo e tamanho antes de comprar.","t4"]];
// tutorial: o balão nunca fica sobre a mesa. Fica na parte de baixo da cena (ou sobre a feira no passo do cliente) e o alvo ganha um contorno amarelo piscando.
const tutClear=()=>document.querySelectorAll(".tutfocus").forEach(e=>e.classList.remove("tutfocus"));
function tutStep(){S.tut=S.tut||{};const st=TUT.find(t=>!(S.tut||{})[t[2]]);const box=$("tut");tutClear();if(!st||modalOpen||!running){box.classList.remove("on");return}
const tg={pot:$("pot"),cust:$("custs"),dexb:$("dexb"),market:$("market")}[st[0]];if(!tg)return;
if(box.dataset.k!=st[2]||!box.classList.contains("on")){box.dataset.k=st[2];
 box.innerHTML=`<span>${st[1]}</span><button class="btn" onclick="S.tut['${st[2]}']=1;save();tutClear();$('tut').classList.remove('on');setTimeout(tutStep,400)">ENTENDI</button>`;box.classList.add("on")}
tg.classList.add("tutfocus");tutPlace(st)}
// posição da cena medida por elementos sem zoom (motores antigos dividem o rect do #scene pelo zoom): x e largura da feira, y do header até a mesa
function sceneBox(){const mk=$("market").getBoundingClientRect(),hd=document.querySelector("header").getBoundingClientRect(),tr=$("table").getBoundingClientRect();return{left:mk.left,width:mk.width,top:hd.bottom,bottom:tr.top}}
function tutPlace(st){const box=$("tut"),ev=v=>Math.round(v/2)*2,sc=sceneBox(),mk=$("market").getBoundingClientRect();
 const onMk=st[0]=="cust"||(st[0]=="pot"&&$("scene").style.zoom=="0.5"); // janela baixa: o balão de pedido ocupa a cena toda, então o passo do caldeirão também vai sobre a feira
 box.style.maxWidth=ev(Math.min(380,innerWidth-16))+"px";const bw=box.offsetWidth,bh=box.offsetHeight;
 const x=ev(sc.left+(sc.width-bw)/2),y=onMk?ev(Math.max(mk.top,mk.bottom-bh-4)):ev(Math.max(sc.top+2,sc.bottom-bh-34));box.style.left=x+"px";box.style.top=y+"px"}
function tutDone(k){S.tut=S.tut||{};if(!S.tut[k]){S.tut[k]=1;save();tutClear();$("tut").classList.remove("on");setTimeout(tutStep,900)}}
function hud(){updateSky();showCoins();const rem=dayLen()-S.dayT;const wide=innerWidth>=440,tm=CFG.zen?"ZEN":running?fmt(rem):"--:--";$("day").textContent=wide?`DIA ${S.day} · NÍVEL ${level()} · ${tm}`:`D${S.day} · NV${level()} · ${tm}`;$("day").classList.toggle("low",running&&!CFG.zen&&rem<20000)}
function startDay(){setTimeout(tutStep,2500);setTimeout(()=>{try{fixFruitDeco()}catch(e){}SPREAD=new WeakSet()},1200);running=true;S.started=true;S.cust.forEach((c,i)=>{if(!c)setTimeout(()=>{if(running&&!S.cust[i]){S.cust[i]=newCust();save();renderCounter()}},300+i*1400)});renderCounter();hud()}
function endDay(){running=false;tutStep();rec("bestDay",S.ds.earn,1);SFX.day();S.cust.forEach(c=>{if(c){c.leaving=true;c.lt=Date.now()}});renderCounter();
setTimeout(()=>{S.cust=[null,null,null];renderCounter();save();showSummary()},900)}
function showSummary(){const d=S.ds;openModal(`<h2>FIM DO DIA ${S.day}</h2><div class="row">${[...S.fruits].sort((a,b)=>b.gen-a.gen).slice(0,3).map(f=>`<img src="${fruitImg(f)}">`).join("")}</div>
<div class="sum"><span>Lucro do dia</span><b>${d.earn} moedas</b><span>Clientes atendidos</span><b>${d.served}</b><span>Maior pagamento</span><b>${d.best}</b><span>Novas espécies</span><b>${d.dex}</b><span>Nível</span><b>${level()}</b></div>
<p style="font-size:var(--t14)">+1 <b>presente da quitanda</b> pra começar o próximo dia!</p><p>${d.served>=6?"Dia incrível! A quitanda está famosa.":d.served>=3?"Bom dia de trabalho!":"Dia fraco... amanhã é outro dia!"}</p>${PORTAL.ready?`<button class="big alt" id="rwd">ASSISTIR ANÚNCIO: +1 PRESENTE</button><br>`:""}<button class="big" id="nextd">ABRIR DIA ${S.day+1}</button>`);
if($("rwd"))$("rwd").onclick=()=>{const b=$("rwd");b.disabled=true;portalAd("rewarded",()=>{b.remove();setTimeout(()=>giveItem(rollItem(),innerWidth/2,innerHeight/2,"do anúncio"),300)},()=>{b.disabled=false;toast("O anúncio não carregou agora. Tente de novo daqui a pouco.")})};
$("nextd").onclick=()=>{S.day++;S.dayT=0;S.ds={earn:0,served:0,best:0,dex:0};save();closeModal();
 portalAd("midgame",()=>{setTimeout(()=>giveItem(rollItem(),innerWidth/2,innerHeight/2,"da quitanda"),600);askWeather(()=>{if(!running)startDay()})})}}
/* ================= portais de jogos (CrazyGames) =================
   Só liga quando a página foi gerada para um portal (window.PORTAL_NAME, ver tools/build_portal.py).
   No GitHub e no artifact nada disso roda e o jogo fica igual. Sem SDK, com bloqueador de anúncio
   ou se o anúncio falhar, o jogo continua normalmente. */
const PORTAL={name:window.PORTAL_NAME||null,sdk:null,ready:false,playing:false,ad:false,data:false};
async function portalInit(){if(PORTAL.name!="crazygames"||!window.CrazyGames||!window.CrazyGames.SDK)return;
 try{await window.CrazyGames.SDK.init();PORTAL.sdk=window.CrazyGames.SDK;PORTAL.ready=true;try{PORTAL.sdk.game.loadingStop()}catch(e){}}catch(e){PORTAL.ready=false;return}
 // mudo pelo site do CrazyGames
 const applyMute=st=>{CGMUTE=!!(st&&st.muteAudio);if(!AC)return;if(CGMUTE){try{updateSky()}catch(e){}AC.suspend().catch(()=>{})}else if(!muted&&!PORTAL.ad&&!document.hidden){AC.resume().catch(()=>{});try{updateSky()}catch(e){}}};
 try{applyMute(PORTAL.sdk.game.settings);PORTAL.sdk.game.addSettingsChangeListener(applyMute)}catch(e){}
 // progresso pelo Data Module (sincroniza com a conta; visitante fica no próprio aparelho)
 try{const d=PORTAL.sdk.data;if(d&&typeof d.getItem=="function"){const raw=d.getItem("frutodromo9");PORTAL.data=true;
  const n=raw?normState(JSON.parse(raw)):null;
  if(n&&(!HAD_LOCAL||(n.ts||0)>LOCAL_TS)){const was=running;S=n;migrate();if(!S.bag)S.bag=[{t:"grow"},{t:"shrink"}];S.bag=S.bag.filter(x=>ITEMS[x.t]);S.pot=[];S.fruits.forEach(f=>{clampPos(f);treeAdd(f,null,true)});renderAll();placePot();fixFruitDeco();running=was;if(was)S.cust.forEach((c,i)=>{if(!c)setTimeout(()=>{if(running&&!S.cust[i]){S.cust[i]=newCust();save();renderCounter()}},300+i*900)})}
  else saveNow()}}catch(e){PORTAL.data=false}}
const portalCall=fn=>{if(!PORTAL.ready)return;try{fn(PORTAL.sdk)}catch(e){}};
function portalPlaying(on){if(!PORTAL.ready||on==PORTAL.playing)return;/* só marca depois do SDK pronto, senão o 1º gameplayStart se perde */PORTAL.playing=on;portalCall(s=>on?s.game.gameplayStart():s.game.gameplayStop())}
const portalHappy=()=>portalCall(s=>s.game.happytime());
// durante o anúncio: som desligado e jogo parado (modalOpen congela o tempo dos clientes)
function adMute(on){PORTAL.ad=on;if(!AC)return;if(on)AC.suspend().catch(()=>{});else if(!muted&&!CGMUTE&&!document.hidden)AC.resume().catch(()=>{})}
function portalAd(type,ok,fail){if(!PORTAL.ready){(type=="rewarded"?fail:ok)&&(type=="rewarded"?fail:ok)();return}
 const was=modalOpen;modalOpen=true;portalPlaying(false);
 PORTAL.sdk.ad.requestAd(type,{adStarted:()=>adMute(true),adFinished:()=>{adMute(false);modalOpen=was||$("modal").classList.contains("on");ok&&ok()},adError:()=>{adMute(false);modalOpen=was||$("modal").classList.contains("on");fail?fail():ok&&ok()}})}
const SITE_TXT=()=>PORTAL.name?"FRUTÓDROMO":"FRUTÓDROMO · mendesoz.github.io/frutodromo";
/* ================= modais ================= */
function openModal(h){if(!$("modal").classList.contains("on"))SFX.open();modalOpen=true;$("mbox").innerHTML=h;$("modal").classList.add("on");tutStep();if(tCur)toastPlace()}
function closeModal(){if($("modal").classList.contains("on"))SFX.close();modalOpen=$("tv").classList.contains("on")||$("rv").classList.contains("on");$("modal").classList.remove("on");if(tCur)toastPlace()}
function rainFruits(on){document.querySelectorAll(".fall").forEach(e=>e.remove());if(!on||RM.matches)return;
for(let i=0;i<12;i++){const b=BASE[i%8],f={shape:b[1],pat:b[2],top:b[3],rgb:COLORS[b[4]],tip:b[0]=="Banana"?"#6b4423":null},im=document.createElement("img");im.className="fall";im.src=fruitImg(f);
im.style.left=(Math.random()*95)+"vw";im.style.animationDuration=(5+Math.random()*6)+"s";im.style.animationDelay=(-Math.random()*10)+"s";im.style.width=im.style.height=R([36,54])+"px";document.body.appendChild(im)}}
function startScreen(){rainFruits(true);const demo=[{shape:"heart",pat:"seeds",top:"leaf",rgb:COLORS.vermelha},{shape:"round",pat:"stripes",top:"stem",rgb:[243,140,32],hero:true,cape:"#2d6cdf"},{shape:"tall",pat:"hatch",top:"crown",rgb:COLORS.amarela}];
const cont=S.started;let armed=false;
openModal(`<div class="logo">FRUTÓDROMO</div><p style="margin-top:0">A quitanda das frutas que a natureza não teve coragem de criar</p><div class="row">${demo.map(f=>`<img src="${fruitImg(f)}">`).join("")}</div>
<ol class="how"><li><b>Cruze</b> 2 frutas no caldeirão</li><li><b>Entregue</b> o que os clientes pedem</li><li><b>Descubra</b> espécies novas pra sua árvore</li></ol><p class="how2">Presentes dos clientes ficam na <b>BOLSA</b> e mudam qualquer fruta.</p>
<button class="big" id="go">${cont?"CONTINUAR · DIA "+S.day:"ABRIR A QUITANDA"}</button><br><button class="big alt" id="sndb" onclick="toggleSnd()"></button><button class="big alt" onclick="settings(startScreen)">AJUSTES</button>${cont?'<button class="big alt" id="newg">NOVO JOGO</button>':""}`);sndLabel();
$("go").onclick=()=>{ac();rainFruits(false);closeModal();if(!running)startDay()};
if(cont)$("newg").onclick=e=>{if(!armed){armed=true;e.target.textContent="TOQUE DE NOVO PRA APAGAR TUDO";return}fresh();S.fruits.forEach(f=>{SPREAD.add(f);dexCheck(f,true)});const pe=$("pot");pe.style.left=pe.style.top=pe.style.bottom="";placePot();save();sel=null;showInfo(null);ac();rainFruits(false);closeModal();renderAll();fixFruitDeco();startDay()}}
const HELLO={person:["Olá! ","Oi, tudo bem? ","Boa tarde! ","E aí! "],cat:["Miau... ","Mrrr... "],dog:["Au au! ","Oi oi oi! "],bear:["Hmm... ","Grrr, oi! "],bunny:["Oi oi! ","Hihi! "],frog:["Croac! "],penguin:["Brrr! "],robot:["BIP-BOP. SOLICITAÇÃO: "],alien:["Saudações, terráqueo. "],ghost:["Buuu... "]};
const HELLO_EN={person:["Hello! ","Hi, how are you? ","Good afternoon! ","Hey there! "],cat:["Meow... ","Mrrr... "],dog:["Woof woof! ","Hi hi hi! "],bear:["Hmm... ","Grrr, hi! "],bunny:["Hi hi! ","Hehe! "],frog:["Ribbit! "],penguin:["Brrr! "],robot:["BEEP-BOOP. REQUEST: "],alien:["Greetings, earthling. "],ghost:["Boooo... "]};
function sayEN(c,left){const ps=c.reqs.map(r=>{const[w,n]=reqWord(r);return r.k=="cor"?tl(r.v):r.k=="el"?"with "+tl(ELEM[r.v].n).toLowerCase()+" power":r.k=="hero"?"a SUPER-FRUIT":tl(w).toLowerCase()+(n?` (${tl(n)})`:"")}).filter(Boolean);
 const list=ps.length>1?ps.slice(0,-1).join(", ")+" and "+ps[ps.length-1]:ps[0]||"special";
 return R(HELLO_EN[c.kind||"person"]||HELLO_EN.person)+"I want a fruit that's "+list+"."+(c.kind=="robot"?" END OF TRANSMISSION.":left<.2?" And quickly, please!":c.vip?" I pay well!":"")}
function sayReq(r){const[w,n]=reqWord(r);return r.k=="cor"?"da cor "+w.toLowerCase():r.k=="el"?"de "+w:r.k=="hero"?"SUPER-FRUTA":w.toLowerCase()+(n?` (${n})`:"")}
function showPortrait(i){const c=S.cust[i];if(!c||c.leaving)return;const left=leftOf(c);
const parts=c.reqs.map(sayReq).filter(Boolean),last=parts.length>1?parts.slice(0,-1).join(", ")+" e "+parts[parts.length-1]:parts[0]||"especial";
const hi=R(HELLO[c.kind||"person"]||HELLO.person),tail=c.kind=="robot"?" FIM DA TRANSMISSÃO.":left<.2?" E rápido, por favor!":c.vip?" Pago bem, viu?":"";
const sp=c.reqs[0]&&c.reqs[0].k=="sp"?c.reqs[0]:null,spT=sp&&S.tree[sp.v];
const txt=sp?(EN?(R(HELLO_EN[c.kind||"person"]||HELLO_EN.person)+(spT?"I want this one: "+tl(spT.name)+"!":"I want a fruit nobody has seen yet, like this one!")):`${hi}${spT?"Quero esta aqui: "+spT.name+"!":"Quero uma fruta que ninguém viu ainda, assim ó!"}${tail}`):EN?sayEN(c,left):`${hi}Quero uma fruta ${last}.${tail}`;
openModal(`<h2>${c.name}${c.vip?' <span style="background:#d4a017;color:#2a1a12;font-size:var(--t12);padding:1px 5px">VIP</span>':""}</h2><div class="prt"><img src="${personImg(c,exOf(c))}"></div><div class="say" id="sayt"></div>${sp?`<div style="text-align:center"><img src="${fruitImg(sp.im)}" style="width:64px;height:64px;image-rendering:pixelated"></div>`:""}
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
const have=new Set(Object.keys(S.tree||{}).map(k=>k.split("|")[1]));let h=`<div class="cgw"><p style="font-size:var(--t12);margin-top:0">A cor do filho é a <b>mistura das cores dos pais</b>, como tinta. Híbridos podem ser misturados de novo pra chegar em outras cores.</p>`;
CORDER.forEach(c=>{const rs=(recipes[c]||[]).filter(([a,b])=>a!=b||rep[a]).sort((x,y)=>(x[0]==x[1])-(y[0]==y[1])).slice(0,4);
const lock=b=>"";
let body;if(MUT_ONLY.includes(c))body=`<div style="white-space:normal">Só por <b>mutação</b>: chance pequena ao cruzar qualquer fruta</div>`;
else body=rs.map(([a,b])=>a==b?`<span>${img(rep[a])}${rep[a][0]}${lock(rep[a])}</span>`:`<span>${img(rep[a])}<span class="mini-sw" style="background:${hex(COLORS[a])}"></span>+${img(rep[b])}<span class="mini-sw" style="background:${hex(COLORS[b])}"></span>${lock(rep[a])}${lock(rep[b])}</span>`).join("")||"<span>—</span>";
h+=`<div class="cg ${hi==c?"hi":""}" id="cg-${c}"><span class="big-sw" style="background:${hex(COLORS[c])}"></span><span class="nm2">${c.toUpperCase()}${have.has(c)?"<br><span style='font-size:var(--t10);color:#3ca55c'>✔ já tem</span>":""}</span><div class="rcp">${body}</div></div>`});
return h+"</div>"}
function colorGuide(hi){openTree("cores",hi)}
function reveal(k,shinyOnly){SFX.mut();portalHappy();showCard(k,true,shinyOnly)}
function cardFrame(g,st,col,shiny){const px=(x,y,c,s=4)=>{g.fillStyle=c;g.fillRect(x,y,s,s)};
if(shiny){const rb=["#ff8ad8","#ffe84a","#8af0ff","#b48cff"];for(let i=0;i<300;i+=6){g.fillStyle=rb[(i/6|0)%4];g.fillRect(i,6,6,8);g.fillRect(i,406,6,8)}for(let i=0;i<420;i+=6){g.fillStyle=rb[(i/6|0)%4];g.fillRect(6,i,8,6);g.fillRect(286,i,8,6)}}
if(st>=4){const gem=st>=5?"#e74c3c":"#8af0ff",gold=st>=5?"#f7c331":"#c9a7ff",dk=st>=5?"#a87b00":"#6a3fd0";
 [[6,6,1,1],[294,6,-1,1],[6,414,1,-1],[294,414,-1,-1]].forEach(([x,y,sx,sy])=>{for(let i=0;i<7;i++){px(x+sx*i*4-(sx<0?4:0),y+sy*0-(sy<0?4:0),gold);px(x-(sx<0?4:0),y+sy*i*4-(sy<0?4:0),gold)}
  px(x+sx*4-(sx<0?4:0),y+sy*4-(sy<0?4:0),gem,8);px(x+sx*8-(sx<0?4:0),y+sy*8-(sy<0?4:0),dk)});
 if(st>=5)for(let x=110;x<=190;x+=8){px(x,2,"#f7c331");if((x/8|0)%2)px(x,-2,"#ffe27a")}}
if(st==3)[[18,18],[278,18],[18,398],[278,398]].forEach(([x,y])=>{px(x,y,col);px(x+4,y+4,"#fff")})}
// texto da carta: diminui a fonte até caber (nomes em inglês costumam ser mais longos)
function fitText(g,txt,x,y,maxW,size,w){let s=size;do{g.font=w+s+"px 'Pixelify Sans',monospace"}while(g.measureText(txt).width>maxW&&--s>8);g.fillText(txt,x,y)}
function cardCanvas(k){const t=S.tree[k],st=stars(t),[lab,col]=RAR[st],c=document.createElement("canvas");c.width=300;c.height=420;const g=c.getContext("2d");g.imageSmoothingEnabled=false;
g.fillStyle="#2a1a12";g.fillRect(0,0,300,420);g.fillStyle=col;g.fillRect(6,6,288,408);g.fillStyle="#f5efe0";g.fillRect(14,14,272,392);
for(let i=0;i<24;i++){g.fillStyle=i%2?hex(lift(hexToRgb(col),.75)):"#efe4cf";g.beginPath();g.moveTo(150,150);g.arc(150,150,260,i*Math.PI/12,(i+1)*Math.PI/12);g.fill()}
g.fillStyle="#f5efe0";g.fillRect(14,262,272,144);g.fillStyle="#2a1a12";g.fillRect(14,258,272,4);
cardFrame(g,st,col,t.shiny);
return new Promise(res=>{const im=new Image();im.onload=()=>{g.drawImage(im,60,40,180,180);
g.fillStyle="#2a1a12";g.textAlign="center";fitText(g,tl(`nº ${t.n} · ${t.name}`),150,32,268,18,"bold ");
g.font="bold 22px 'Pixelify Sans',monospace";g.fillStyle=col;g.fillText("★".repeat(st)+"☆".repeat(5-st),150,248);
g.textAlign="left";g.fillStyle="#2a1a12";g.font="14px 'Pixelify Sans',monospace";const ls=[lab+(t.shiny?" · BRILHANTE ✦":""),spLabel(k),`Doce ${t.st.doce} · Azedo ${t.st.az} · Tamanho ${t.st.tam}`,`Geração ${t.d} · Dia ${t.day||S.day}`];
ls.forEach((l,i)=>fitText(g,tl(l),26,284+i*24,250,i==1?12:14,i==0?"bold ":""));
g.font="bold 10px 'Pixelify Sans',monospace";g.fillStyle="#8a6a50";g.textAlign="center";g.fillText(SITE_TXT(),150,396);res(c)};im.src=fruitImg(t.img)})}
async function showCard(k,isNew,shinyOnly){const c=await cardCanvas(k),url=c.toDataURL("image/png"),t=S.tree[k];
openModal(`<h2>${isNew?(shinyOnly?"✦ VERSÃO BRILHANTE!":"NOVA ESPÉCIE!"):"CARTA DA ESPÉCIE"}</h2><img id="cardimg" class="${isNew?"cin":""}" src="${url}">
<button class="big" id="cdl">BAIXAR</button><button class="big" id="csh">COMPARTILHAR</button><br><button class="big alt" id="cl">${isNew?"CONTINUAR":"FECHAR"}</button>`);
if(isNew)setTimeout(()=>{const r=$("cardimg").getBoundingClientRect();burst(r.left+r.width/2,r.top+r.height*.35,t.img.rgb,30);burst(r.left+r.width/2,r.top+r.height*.35,[255,240,160],16)},450);
$("cl").onclick=closeModal;
$("cdl").onclick=async()=>{if(window.self!==window.top&&window.claude&&!PORTAL.name){/* dentro do artifact do Claude: o download passa pela confirmação do próprio Claude */
 try{const dl=window.claude&&window.claude.use?await window.claude.use("downloads"):null;if(!dl)return toast(PORTAL.name?"Aqui não dá pra baixar. Faça um print!":"Aqui não dá pra baixar. Faça um print, ou abra mendesoz.github.io/frutodromo");
  const bin=atob(url.split(",")[1]),u8=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u8[i]=bin.charCodeAt(i);
  await dl.save({filename:`frutodromo-especie-${t.n}.png`,data:new Blob([u8],{type:"image/png"})});toast("Carta salva!")}catch(e){if(e&&e.code=="declined")return;toast("Não deu pra baixar aqui. Faça um print!",{err:true})}return}
try{const a=document.createElement("a");a.href=url;a.download=`frutodromo-especie-${t.n}.png`;document.body.appendChild(a);a.click();a.remove();toast("Carta baixada!")}catch(e){toast("Não deu pra baixar aqui. Faça um print!",{err:true})}};
$("csh").onclick=async()=>{try{const blob=await (await fetch(url)).blob(),file=new File([blob],`frutodromo-${t.n}.png`,{type:"image/png"});
if(navigator.canShare&&navigator.canShare({files:[file]}))await navigator.share({files:[file],title:"Frutódromo",text:tl(`Olha a fruta que eu descobri no Frutódromo: ${t.name}!`)+(PORTAL.name?"":" mendesoz.github.io/frutodromo")});
else{await navigator.clipboard.writeText(tl(`Olha a fruta que eu descobri no Frutódromo: ${t.name} (${spLabel(k)})!`)+(PORTAL.name?"":" mendesoz.github.io/frutodromo"));toast("Texto copiado! Cole junto com o print.")}}catch(e){toast(PORTAL.name?"Compartilhar não funciona aqui. Faça um print!":"Compartilhar não funciona aqui. Abra pelo link do GitHub Pages!")}}}
let tvTab="tree",tvSel=null,tvFilter=null,tvHelp=false,tvSugs=[];
function spMatch(k,fl){if(!fl)return true;const[sz,c,t,el,h]=k.split("|"),T=S.tree[k];if(fl.startsWith("c:"))return c==fl.slice(2);if(fl.startsWith("e:"))return el==fl.slice(2);
if(fl=="super")return !!h;if(fl=="shiny")return !!(T&&T.shiny);if(fl=="extreme")return ["Microscópica","Mini","Enorme","Gigantesca"].includes(sz);if(fl=="rare")return T&&stars(T)>=3;return true}
function renderFilter(){const f=$("tvf");if(tvTab!="tree"){f.style.display="none";return}f.style.display="";const have=new Set(Object.keys(S.tree||{}).map(k=>k.split("|")[1]));
const chip=(id,lab)=>`<span class="${tvFilter==id||(!tvFilter&&!id)?"on":""}" onclick="tvFilter=${id?`'${id}'`:"null"};renderTree()">${lab}</span>`;
f.innerHTML=chip(null,"TODAS")+chip("rare","★3+")+chip("shiny","✦ BRILHANTES")+chip("super","SUPER")+chip("extreme","TAMANHO EXTREMO")+Object.keys(ELEM).filter(e=>Object.keys(S.tree||{}).some(k=>k.split("|")[3]==e)).map(e=>chip("e:"+e,ELEM[e].n.toUpperCase())).join("")+CORDER.filter(c=>have.has(c)).map(c=>chip("c:"+c,`<i class="dt" style="background:${hex(COLORS[c])}"></i>${c}`)).join("")}
function openTree(tab,hi){SFX.open();if(S.tut&&S.tut.t2)tutDone("t3");$("tut").classList.remove("on");tvTab=tab||"tree";modalOpen=true;$("tv").classList.add("on");if(tCur)toastPlace();tvHelp=false;$("tvb").scrollTop=0;renderTree(hi);if(tvTab=="tree")setTimeout(()=>{const e=$("tvb").querySelector(".sp.new");if(e&&!hi)e.scrollIntoView({block:"center"});drawFam()},30)}
function closeTree(){SFX.close();$("tv").classList.remove("on");modalOpen=false;tvSel=null;if(tCur)toastPlace()}
function renderTree(hi){const T=S.tree||{},ks=Object.keys(T);renderFilter();$("tabT").classList.toggle("on",tvTab=="tree");$("tabC").classList.toggle("on",tvTab=="cores");$("tabA").classList.toggle("on",tvTab=="album");$("tabQ").classList.toggle("on",tvTab=="ach");
$("tvcnt").textContent=tvFilter?`${ks.filter(k=>spMatch(k,tvFilter)).length} de ${ks.length}`:(innerWidth<520?`${ks.length} esp. · ${totalVars()} var.`:`${ks.length} espécies · ${totalVars()} variedades`);$("tvhelp").style.display=tvTab=="tree"?"":"none";$("tvhelp").classList.toggle("on",tvHelp);$("tvcnt").style.display=tvTab=="tree"||tvTab=="cores"?"":"none";
if(tvTab=="album"){const ord=ks.slice().sort((a,b)=>stars(T[b])-stars(T[a])||(T[b].shiny?1:0)-(T[a].shiny?1:0)||T[a].n-T[b].n);
 $("tvb").innerHTML=`<div class="alb">${ord.map(k=>{const t=T[k],st=stars(t),[rl,rc]=RAR[st];return `<div class="ac ${t.shiny?"shn":""}" style="border-color:${rc}" onclick="showCard('${k}')"><span class="no">${t.n}</span><img src="${fruitImg(t.img)}"><b style="color:${rc}">${"★".repeat(st)}</b><span>${t.d==0?t.name:spLabel(k).split(" · ").slice(0,2).join(" · ")}</span></div>`}).join("")}</div>`;
 $("tvd").innerHTML=`<b>${ks.length} cartas</b> · ${ks.filter(k=>T[k].shiny).length} brilhantes · ${ks.filter(k=>stars(T[k])>=5).length} lendárias. Toque numa carta pra abrir, baixar ou compartilhar.`;return}
if(tvTab=="ach"){S.rec=S.rec||{};S.ach=S.ach||{};const done=ACH.filter(a=>S.ach[a[0]]).length;
 $("tvb").innerHTML=`<div class="cgw"><div class="recs">${[["Espécies",ks.length],["Variedades",totalVars()],["Clientes atendidos",S.delivered],["Cruzamentos",S.rec.crosses||0],["Brilhantes achadas",S.rec.shiny||0],["Maior combo","x"+(S.rec.maxCombo||0)],["Melhor dia",(S.rec.bestDay||0)+" moedas"],["VIPs atendidos",S.rec.vips||0],["Dias jogados",S.day]].map(([a,b])=>`<div><span>${a}</span><b>${b}</b></div>`).join("")}</div>
 ${ACH.map(([id,n,d,ok,rw])=>`<div class="cg ${S.ach[id]?"hi":""}"><span class="big-sw" style="background:${S.ach[id]?"#f7c331":"#c9b99a"};display:flex;align-items:center;justify-content:center;font-size:var(--t16)">${S.ach[id]?`<img src="${TROPHY()}" style="width:22px;height:22px">`:"?"}</span><div style="flex:1;text-align:left"><b>${n}</b><br><span style="font-size:var(--t12)">${d}</span></div><span style="font-size:var(--t12);font-weight:700">+${rw}</span></div>`).join("")}</div>`;
 $("tvd").innerHTML=`<b>${done} de ${ACH.length} conquistas</b> · cada uma dá moedas de presente.`;return}
if(tvTab=="cores"){$("tvb").innerHTML=colorGuideHTML(hi);$("tvd").innerHTML="Toque no requisito de COR de um cliente pra abrir direto aqui.";if(hi){const e=$("cg-"+hi);if(e)setTimeout(()=>e.scrollIntoView({block:"center"}),30)}return}
// Árvore: espécies em fileiras por geração, sem teia de linhas. Ao tocar numa fruta, só a família dela
// (pais e filhos) fica em destaque e ligada por linhas; o resto apaga.
const sel=tvSel&&T[tvSel]?tvSel:null,fam=new Set();
if(sel){T[sel].par.forEach(p=>fam.add(p));ks.forEach(k=>{if(T[k].par.includes(sel))fam.add(k)})}
const vis=ks.filter(k=>spMatch(k,tvFilter)),gens={};vis.forEach(k=>{(gens[T[k].d]=gens[T[k].d]||[]).push(k)});
const newest=ks.slice().sort((a,b)=>T[b].n-T[a].n)[0];tvSugs=tvFilter?[]:suggestions(8);
const lab=k=>T[k].d==0?T[k].name:spLabel(k).split(" · ").slice(0,2).join(" · "),esc=k=>k.replace(/&/g,"&amp;").replace(/"/g,"&quot;");
const qsel=tvSel&&tvSel[0]=="?"?tvSugs[+tvSel.slice(1)]:null;if(qsel){fam.add(qsel.a);fam.add(qsel.b)}
const card=k=>{const t=T[k],dim=(sel&&k!=sel&&!fam.has(k))||(qsel&&!fam.has(k));
 return `<div class="sp ${sel==k?"cur":""} ${dim?"dim":""} ${fam.has(k)?"fam":""} ${k==newest&&t.d>0?"new":""}" data-k="${esc(k)}" onclick="tvPick(this.dataset.k)"><span class="no" style="background:${RAR[stars(t)][1]}">${t.n}${t.shiny?"✦":""}</span><div class="ic"><img src="${fruitImg(t.img)}">${varCount(t)>1?`<span class="vc">×${varCount(t)}</span>`:""}</div><span class="lb">${lab(k)}</span></div>`};
let h=`<div class="tvw">`;
Object.keys(gens).map(Number).sort((a,b)=>a-b).forEach(d=>{h+=`<div class="gsec"><div class="gh"><b>${d==0?"FEIRA":d+"ª GERAÇÃO"}</b><span>${gens[d].length}</span></div><div class="gg">${gens[d].sort((a,b)=>T[a].n-T[b].n).map(card).join("")}</div></div>`});
if(tvSugs.length)h+=`<div class="gsec"><div class="gh"><b>PRÓXIMAS DESCOBERTAS</b><span>toque pra ver a receita</span></div><div class="gg">${tvSugs.map((q,i)=>{const A=T[q.a];return `<div class="sp q ${tvSel=="?"+i?"cur":""} ${sel?"dim":""}" data-k="?${i}" onclick="tvPick(this.dataset.k)"><div class="ic"><img src="${fruitImg({...A.img,rgb:q.c.rgb})}"></div><span class="lb">???</span></div>`}).join("")}</div></div>`;
if(!vis.length)h+=`<p class="empty">Nenhuma espécie com esse filtro ainda.</p>`;
const st=$("tvb").scrollTop;$("tvb").innerHTML=h+`<svg class="famsvg"></svg></div>`;$("tvb").scrollTop=st;drawFam();
// ficha de baixo
const nm=k=>T[k].d==0?T[k].name:spLabel(k),chip=k=>T[k]?`<span class="chip" data-k="${esc(k)}" onclick="tvPick(this.dataset.k,1)"><img src="${fruitImg(T[k].img)}">${lab(k)}</span>`:"";let det;
if(qsel){det=`<div class="dh"><div class="bigi q"><img src="${fruitImg({...T[qsel.a].img,rgb:qsel.c.rgb})}"></div><div><b>Espécie desconhecida</b><br>Deve sair: <b>${spLabel(qsel.k)}</b></div><button class="btn x" onclick="tvPick(null)">X</button></div>
 <div class="drow"><span>RECEITA</span>${chip(qsel.a)}+${chip(qsel.b)}</div>`}
else if(sel){const t=T[sel],kids=ks.filter(k=>T[k].par.includes(sel)).sort((a,b)=>T[a].n-T[b].n),sr=stars(t),[rl,rc]=RAR[sr],my=suggestions(3,sel);
 det=`<div class="dh"><img class="bigi" src="${fruitImg(t.img)}"><div><b>nº ${t.n} · ${t.d==0?t.name:t.d+"ª geração"}</b> <span style="color:${rc};font-weight:700">${"★".repeat(sr)} ${rl}</span>${t.shiny?" ✦":""}<br>${spLabel(sel)}</div><button class="btn x" onclick="tvPick(null)">X</button></div>
 <div class="drow"><span>PAIS</span>${t.par.length?t.par.map(chip).join(""):"<i>Fruta da feira</i>"}</div>
 <div class="drow"><span>VARIEDADES</span>${varRow(sel)}</div>
 <div class="drow"><span>FILHOS</span>${kids.length?kids.map(chip).join(""):"<i>Ainda nenhum. Cruze ela com outra!</i>"}</div>
 ${my.length?`<div class="drow"><span>TENTE</span>${my.map(q=>{const o=q.a==sel?q.b:q.a;return chip(o)}).join("")}</div>`:""}
 <button class="btn" style="border-image-source:var(--f-go);margin-top:4px" onclick="showCard('${esc(sel)}')">VER CARTA</button>`}
else if(tvHelp)det=`<b>Como funciona a árvore</b><br>Cada combinação nova de <b>tamanho, cor, sabor e poder</b> vira uma espécie. As fileiras mostram de qual geração ela é: a Feira é a geração 0, e cada cruzamento cria a seguinte.<br>Regra: <b>parecidos se intensificam</b> (pequena + pequena encolhe, grande + grande cresce).<br>Toque numa fruta pra ver os pais e os filhos dela. Toque num <b>?</b> pra ver a receita da próxima descoberta.`;
else det=`Toque numa fruta pra ver <b>de onde ela veio</b> e <b>o que ela já gerou</b>.`;
$("tvd").innerHTML=det;$("tvd").classList.toggle("open",!!(sel||qsel||tvHelp))}
function varRow(k){const t=S.tree[k],vs=Object.entries(t.v||{}).sort((a,b)=>a[1].n-b[1].n),shown=vs.filter(([,v])=>v.n==1||v.img);
 return shown.map(([code,v])=>`<span class="vr" title="DNA #${code}"><img src="${fruitImg(v.img||t.img)}"><b>#${code}</b></span>`).join("")+(vs.length>shown.length?`<i>+${vs.length-shown.length} sem foto</i>`:"")}
function tvPick(k,jump){tvSel=k&&tvSel!=k?k:(jump?k:null);tvHelp=false;renderTree();if(jump&&k){const e=$("tvb").querySelector(`.sp[data-k="${CSS.escape(k)}"]`);if(e)e.scrollIntoView({block:"center",behavior:"smooth"});setTimeout(drawFam,400)}}
function drawFam(){const w=document.querySelector("#tvb .tvw"),sv=w&&w.querySelector(".famsvg");if(!sv)return;const T=S.tree||{},pairs=[];
 if(tvSel&&T[tvSel]){T[tvSel].par.forEach(p=>pairs.push([p,tvSel]));Object.keys(T).forEach(k=>{if(T[k].par.includes(tvSel))pairs.push([tvSel,k])})}
 else if(tvSel&&tvSel[0]=="?"){const q=tvSugs[+tvSel.slice(1)];if(q){pairs.push([q.a,tvSel]);if(q.b!=q.a)pairs.push([q.b,tvSel])}}
 const wr=w.getBoundingClientRect(),el=k=>w.querySelector(`.sp[data-k="${CSS.escape(k)}"] .ic`);sv.setAttribute("width",w.scrollWidth);sv.setAttribute("height",w.scrollHeight);
 sv.innerHTML=pairs.map(([a,b])=>{const A=el(a),B=el(b);if(!A||!B)return"";const ra=A.getBoundingClientRect(),rb=B.getBoundingClientRect();
  const x1=ra.left+ra.width/2-wr.left,y1=ra.bottom-wr.top,x2=rb.left+rb.width/2-wr.left,y2=rb.top-wr.top,my=(y1+y2)/2;
  return `<path d="M${x1} ${y1} C${x1} ${my},${x2} ${my},${x2} ${y2}" stroke="#e67e22" stroke-width="3" fill="none" stroke-linecap="round"/>`}).join("")}
$("tabT").onclick=()=>{tvTab="tree";renderTree()};$("tabA").onclick=()=>{tvTab="album";renderTree()};$("tabQ").onclick=()=>{tvTab="ach";renderTree()};$("tabC").onclick=()=>{tvTab="cores";renderTree()};$("tvx").onclick=closeTree;
$("tvhelp").onclick=()=>{tvHelp=!tvHelp;tvSel=null;renderTree()};
$("dexb").onclick=()=>{tvSel=null;openTree("tree")};$("pauseb").onclick=()=>{if(!running)return;openModal(`<h2>PAUSADO</h2><p>O tempo e a paciência dos clientes estão congelados.</p><button class="big" id="resume">CONTINUAR</button><br><button class="big alt" id="sndb" onclick="toggleSnd()"></button><button class="big alt" onclick="settings()">AJUSTES</button>`);sndLabel();$("resume").onclick=closeModal};$("menub").onclick=startScreen;
/* ================= laço ================= */
/* ================= avisos (toasts): letreiro fixo sobre o toldo, um por vez, com fila ================= */
// posição 1: topo da cena + 2 px, centrado (sob o cabeçalho). Com modal, árvore ou revelação abertos vai pro topo da tela (z 250).
// posição 2 (só se a posição 1 cobrir o tutorial, um balão de pedido ou um nome de cliente): topo da mesa, 1 linha, sobre a frente do balcão, sem encostar no ARRUMAR.
// fila: mín. 1,2 s na tela se há outro esperando, 2,4 s se não há, erro 4,5 s; igual ao da tela ou ao último da fila vira ×N; máx. 3 na fila.
const TQ=[];let tCur=null,tTimer=0,tAt=0;const T_MIN=1200,T_DUR=2400,T_ERR=4500,T_MAXQ=3;
function toastPlace(){const t=$("toast"),over=modalOpen||$("tv").classList.contains("on")||$("rv").classList.contains("on");t.classList.toggle("ovr",over);
 const sc=sceneBox(),tr=$("table").getBoundingClientRect(),td=$("tidy").getBoundingClientRect(),ev=v=>Math.round(v/2)*2;
 const hits=(sel,x,y,w,h)=>[...document.querySelectorAll(sel)].some(e=>{const r=e.getBoundingClientRect();return r.width&&!(r.right<=x||x+w<=r.left||r.bottom<=y||y+h<=r.top)});
 // candidatas em ordem: 1) topo da cena, 2 linhas; 2) topo da cena, 1 linha; 3) topo da mesa (frente do balcão), 1 linha, sem encostar no ARRUMAR
 const pick=c=>{t.classList.toggle("one",c.one);t.style.transform="none";let mw=over?Math.min(innerWidth-24,420):Math.min(420,sc.width-16);if(c.p==2)mw=Math.min(420,tr.width-2*(Math.ceil(tr.right-td.left)+12));t.style.maxWidth=ev(mw)+"px";
  let fits=true;if(c.one){t.classList.remove("one");fits=t.offsetHeight<=(innerWidth>=700?18:16)+14;t.classList.add("one")} // 1 linha só vale se o texto couber nela
  const w=t.offsetWidth,h=t.offsetHeight;return{c,w,h,fits,x:ev(over?(innerWidth-w)/2:c.p==2?tr.left+(tr.width-w)/2:sc.left+(sc.width-w)/2),y:over?8:c.p==2?ev(tr.top+2):ev(sc.top+2)}};
 let best=null;
 if(over)best=pick({one:false,p:1});
 else{const L=[{one:false,p:1},{one:true,p:1},{one:true,p:2},{one:false,p:2}].map(pick);
  const hard=q=>hits("#tut.on,.bub",q.x,q.y,q.w,q.h),tab=q=>q.c.p==2&&hits(".fr,#pot,#info.on",q.x,q.y,q.w,q.h); // a etiqueta do nome (.bn) pode ficar por baixo; balão e tutorial não
  best=L.find(q=>q.fits&&!hard(q)&&!tab(q))||(!hard(L[0])?L[0]:L[3]);pick(best.c)}
 t.style.left=best.x+"px";t.style.top=best.y+"px"}
function toastShow(o,keepAt){tCur=o;const t=$("toast");t.innerHTML=o.h+(o.n>1?` <i class="tn">×${o.n}</i>`:"");t.classList.toggle("err",!!o.err);try{toastPlace()}catch(e){}t.classList.add("on");if(!keepAt)tAt=Date.now();toastArm();setTimeout(()=>{try{if(tCur===o)toastPlace()}catch(e){}},350)}
function toastArm(){clearTimeout(tTimer);const d=tCur.err?T_ERR:TQ.length?(tCur.keep?1600:T_MIN):T_DUR;tTimer=setTimeout(toastNext,Math.max(60,d-(Date.now()-tAt)))}
function toastNext(){if(TQ.length)return toastShow(TQ.shift());tCur=null;$("toast").classList.remove("on")}
function toast(h,opt){h=String(h).replace(/<br\s*\/?>/gi," ");const o={h,n:1,err:!!(opt&&opt.err),keep:/NÍVEL|CONQUISTA/.test(h)};
 if(tCur&&tCur.h==h){tCur.n++;return toastShow(tCur,TQ.length>0)}
 const last=TQ[TQ.length-1];if(last&&last.h==h){last.n++;return}
 if(!tCur)return toastShow(o);
 TQ.push(o);while(TQ.length>T_MAXQ){let k=TQ.findIndex(q=>!q.err&&!q.keep);if(k<0)k=TQ.findIndex(q=>!q.keep);if(k<0)break;TQ.splice(k,1)} // nunca descarta NÍVEL nem CONQUISTA
 toastArm()}
// reposiciona aviso e tutorial depois do fitScene (resize, rotação, fim do onResize)
function relayout(){try{if(tCur)toastPlace()}catch(e){}try{const box=$("tut");if(box.classList.contains("on")){const st=TUT.find(t=>!(S.tut||{})[t[2]]);if(st)tutPlace(st)}}catch(e){}}
function renderAll(n){hud();renderPot();renderCounter();renderTable(n);renderMarket()}
let last=performance.now(),saveT=0;
setInterval(()=>{const t=performance.now(),dt=Math.min(1000,t-last);last=t;
if(running&&!modalOpen){S.clock+=dt;if(!CFG.zen)S.dayT+=dt;if(S.dayT>=dayLen()){S.dayT=dayLen();endDay()}
S.cust.forEach((c,i)=>{if(!c||c.leaving)return;const el=document.querySelector(`.cust[data-i="${i}"]`);if(!el)return;const left=leftOf(c),on=Math.ceil(left*10),pc=left>.5?"#3ce06f":left>.2?"#f4a261":"#e74c3c";
el.querySelectorAll(".pat i").forEach((x,k)=>x.style.background=k<on?pc:"");const pb=el.querySelector(".pay b");if(pb)pb.textContent=pay(c);
// expressão e marcas de paciência trocam por atributo/elemento, sem renderCounter (a virada dos 12% troca o rosto em até 250 ms)
 const ex=exOf(c),ch=el.querySelector(".chr");if(ch&&ch.dataset.ex!=ex)ch.dataset.ex=ex;el.dataset.low=left<.2?1:0;el.classList.toggle("angry",left<.12&&!c.mood);
 const sw=el.querySelector(".sweat"),pf=el.querySelector(".puff");if(left<.2&&!sw)el.insertAdjacentHTML("beforeend",'<span class="sweat"></span>');if(left<.12&&!pf)el.insertAdjacentHTML("beforeend",'<span class="puff"><i></i><i></i></span>')});
if((saveT+=dt)>10000){saveT=0;save()}}portalPlaying(running&&!modalOpen&&!document.hidden);hud();renderCombo()},250);
window.addEventListener("pagehide",()=>saveNow());
document.addEventListener("visibilitychange",()=>{if(document.hidden){saveNow();if(AC&&AC.state=="running")AC.suspend().catch(()=>{});if(running&&!modalOpen)$("pauseb").click()}});
// enfeites do chão: posições absolutas e pares por faixa de tela (recalculadas em renderProps, no resize e quando a mesa muda de altura)
let decoKey="";function placeDeco(){const t=document.getElementById("table"),pt=document.getElementById("pot");if(!t||!pt)return;const tw=t.clientWidth,th=t.clientHeight;if(!tw||!th)return;
 const pl=pt.offsetLeft,ptp=pt.offsetTop,pw=pt.offsetWidth,ph=pt.offsetHeight,key=[tw,th,pl,ptp,pw,ph].join();
 if(key==decoKey&&t.querySelector(".dobj"))return;decoKey=key;// só refaz se a mesa ou o caldeirão mudaram
 t.querySelectorAll(".deco,.dobj").forEach(e=>e.remove());const ev=v=>Math.round(v/2)*2,low=th<190,small=tw<600;
 const o=[],add=(k,a,x,y)=>{const u=decoSpr(k,a),d=ADIM[u]||[0,0],X=ev(x),Y=ev(y);// enfeite que cruza o caldeirão (posição real) é pulado; tapetes ficam sob ele de propósito
  if(k!="rug"&&X<pl+pw&&X+d[0]*2>pl&&Y<ptp+ph&&Y+d[1]*2>ptp)return;o.push(`<img class="dobj" data-k="${k}" src="${u}" style="left:${X}px;top:${Y}px;${sz(u)}">`)};
 // tapetes (ficam embaixo de tudo)
 if(small)add("rug",1,tw/2-48,46);else[[.22,0],[.5,1],[.78,0]].forEach(([p,k])=>add("rug",k,tw*p-48,46));
 // esquerda
 add("crate","morango",4,36);
 if(!small)add("crate","uva",68,44);
 if(!low){add("barrel",null,4,96);if(!small)add("crate","banana",52,108)}
 // direita (abaixo do ARRUMAR, acima da lixeira)
 if(low){add("basket","laranja",tw-124,8);if(!small)add("sack",null,tw-176,12)}else{const dy=small?8:0;add("basket","laranja",tw-56,40+dy);
  if(!small)add("sack",null,tw-104,36);
  if(th>=210&&!small)add("board",null,tw-48,84);
  if(small)add("sack",null,tw-44,84+dy)}
 t.insertAdjacentHTML("afterbegin",o.join(""));
 fixFruitDeco()}
// fruta que ficou sobre enfeite sólido (jogo novo, save, resize, troca de aba) sai de cima dele; só mexe em quem cruza (ou nas frutas iniciais até o jogo começar), nunca em fruta sendo arrastada
let fxT=0;
function fixFruitDeco(){const t=document.getElementById("table");if(!S||!S.fruits||!t||!t.clientWidth||!t.clientHeight)return;
 // não recria as frutas no meio de um arraste (renderTable perderia o pointer capture): tenta de novo daqui a pouco
 let busy=false;try{busy=ptrDown||!!document.querySelector(".fr.drag,#pot.mv")}catch(e){}
 if(busy){clearTimeout(fxT);fxT=setTimeout(fixFruitDeco,300);return}
 const early=performance.now()-T0<2500,blk=decoBlocks(4),cross=f=>{const z=fsize(f);return blk.some(([bx,by,bw,bh])=>f.x<bx+bw&&f.x+z>bx&&f.y<by+bh&&f.y+z>by)};let ch=0,mv=0;
 S.fruits.slice().sort((p,q)=>fsize(q)-fsize(p)).forEach(f=>{if(t.querySelector('.fr.drag[data-id="'+f.id+'"]'))return;const x0=f.x,y0=f.y;clampPos(f);const x1=f.x,y1=f.y,sp=SPREAD.has(f);if(sp||(!early&&cross(f))){freeSpot(f,!sp);if(cross(f))freeSpot(f,true)}if(f.x!=x1||f.y!=y1)mv++;if(f.x!=x0||f.y!=y0)ch++});
 if(ch)renderTable();if(mv)save()}

function addDeco(){placeDeco()}
function lantSync(){$("scene").classList.toggle("lit",(parseFloat($("lamp").style.opacity)||0)>0)}
setTimeout(()=>{try{addDeco()}catch(e){}},0);
// telas baixas (janela do CrazyGames, celular deitado): encolhe a cena pra mesa e o caldeirão caberem
const Z=!!(window.CSS&&CSS.supports&&CSS.supports("zoom","0.5")); // sem suporte a zoom não usa a janela baixa
const ZMIN=530; // abaixo disso a mesa não comporta o caldeirão inteiro com a cena em 252: só aí usa zoom 0.5
function fitScene(){const sc=document.getElementById("scene");if(!sc)return;const h=window.innerHeight,par=v=>Math.round(v/2)*2,cp=v=>Math.max(252,Math.min(280,v));
 // só zoom 1 ou 0.5 (nunca fracionário); a altura da cena encolhe em passos pares pra caber a mesa
 const tb=document.getElementById("table");if(tb)tb.classList.toggle("low",h<ZMIN);
 if(h>=650){sc.style.zoom="";sc.style.height=""}
 else if(h>=ZMIN||!Z){sc.style.zoom="";sc.style.height=cp(par(h*.6-108))+"px"}
 else{sc.style.zoom="0.5";sc.style.height=cp(par(2*(h*.6-122)))+"px"}
 // janela baixa (zoom 0.5): balão vai pro lado do cliente, em tamanho real (zoom:2 cancela o 0.5); --bw = largura do balão em px de tela
 const low=sc.style.zoom=="0.5";sc.classList.toggle("low",low);if(low)sc.style.setProperty("--bw",Math.max(120,Math.min(210,Math.floor(window.innerWidth/3)-58))+"px");else sc.style.removeProperty("--bw");
 // moldura do computador: posição inteira (evita meio pixel na borda e nas coisas ancoradas nela)
 const rs=document.documentElement.style;if(window.matchMedia("(min-width:1200px) and (min-height:600px)").matches){const w=window.innerWidth,hh=window.innerHeight,fw=Math.min(w-48,1100),fh=Math.min(hh-32,860);rs.setProperty("--fw",fw+"px");rs.setProperty("--fh",fh+"px");rs.setProperty("--fx",Math.floor((w-fw)/2)+"px");rs.setProperty("--fy",Math.floor((hh-fh)/2)+"px")}else["--fw","--fh","--fx","--fy"].forEach(k=>rs.removeProperty(k))}
fitScene();
let rzT=0;const onResize=()=>{if($("tv").classList.contains("on"))drawFam();S.fruits.forEach(clampPos);renderTable();renderProps();placePot();freeFromPot();relayout()};
window.addEventListener("resize",()=>{fitScene();relayout();clearTimeout(rzT);rzT=setTimeout(()=>requestAnimationFrame(onResize),120)});
// a mesa muda de altura sem resize (abas FEIRA/BOLSA): o caldeirão sem posição salva reancora em px inteiros
let ptrDown=0;["pointerdown"].forEach(t=>document.addEventListener(t,()=>{ptrDown=1},true));["pointerup","pointercancel"].forEach(t=>document.addEventListener(t,()=>{ptrDown=0;setTimeout(()=>{try{onTable()}catch(e){}},80)},true));
const onTable=()=>{if(!tbl.clientWidth||!tbl.clientHeight)return;placePot();if(ptrDown||document.querySelector(".fr.drag,#pot.mv"))return;placeDeco();let mv=0;S.fruits.forEach(f=>{const x=f.x,y=f.y;clampPos(f);if(f.x!=x||f.y!=y)mv++});if(mv)renderTable()};
if(window.ResizeObserver)new ResizeObserver(()=>{try{onTable()}catch(e){}}).observe($("table"));setTimeout(()=>{try{freeFromPot()}catch(e){}},300);
S.pot=S.pot||[];if(S.pot.length==2){S.fruits.push(...S.pot);S.pot=[]}
document.addEventListener("pointerdown",e=>{const t=e.target.closest("button,.btn,.big,.hint,.flt span,.sp,.cg,.tvh .btn,#pot,.pw");if(!t)return;ac();
 if(t.id=="go"||t.id=="cl"||t.id=="tvx"||t.id=="resume"||t.id=="nextd"||t.id=="rvx"||t.id=="pot")return;SFX.sel()},true);
if("serviceWorker" in navigator&&location.hostname.endsWith("github.io"))navigator.serviceWorker.register("sw.js").catch(()=>{});
delete S.ess;delete S.sk;S.tree=S.tree||{};
setTimeout(()=>{try{fixFruitDeco()}catch(e){}},2600); // save carregado: tira fruta de cima de enfeite depois que a mesa assentou
migrate();if(!S.bag)S.bag=[{t:"grow"},{t:"shrink"}];S.bag=S.bag.filter(x=>ITEMS[x.t]);S.fruits.forEach(f=>{clampPos(f);treeAdd(f,null,true)});renderProps();renderAll();placePot();fetchWX();
// nos portais o jogador cai direto na partida (exigência do CrazyGames); o menu ≡ continua abrindo a tela inicial
if(PORTAL.name){startDay();portalInit()}else{startScreen();portalInit()}
