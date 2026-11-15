// Arte reutilizada de js/game.js, base b475703. Molduras, personagens CH, decoração DECO e texturas originais.
// Extração feita por prototipo-fazenda/tools/extract-art.cjs; não contém caldeirão, genética, save ou lógica de produção.
(()=>{
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

const cl=(v,a,b)=>Math.max(a,Math.min(b,v));
const hex=c=>"#"+c.map(x=>Math.round(cl(x,0,255)).toString(16).padStart(2,"0")).join("");
const mul=(c,k)=>c.map(x=>x*k),lift=(c,k)=>c.map(x=>x+(255-x)*k);

function hexToRgb(h){return[1,3,5].map(i=>parseInt(h.slice(i,i+2),16))}
const blank=(W,H)=>Array.from({length:H},()=>Array(W).fill(null));
function toImg(W,H,grid,outlineCol){const out=grid.map(r=>r.slice());
for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(!grid[y][x]){const n=[[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy])=>(grid[y+dy]||[])[x+dx]).find(Boolean);if(n)out[y][x]=outlineCol||hex(mul(hexToRgb(n),.3))}
const c=document.createElement("canvas");c.width=W;c.height=H;const g=c.getContext("2d");
for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(out[y][x]){g.fillStyle=out[y][x];g.fillRect(x,y,1,1)}return c.toDataURL()}
const artCache={},ADIM={},sz=(u,k=2)=>{const d=ADIM[u];return d?`width:${d[0]*k}px;height:${d[1]*k}px`:""};
function art(rows,pal,ol){const k=rows.join("")+JSON.stringify(pal)+ol;if(artCache[k])return artCache[k];const H=rows.length+2,W2=rows[0].length+2,g=blank(W2,H);rows.forEach((r,y)=>[...r].forEach((ch,x)=>{if(pal[ch])g[y+1][x+1]=pal[ch]}));const u=toImg(W2,H,g,ol||"#2a1a12");ADIM[u]=[W2,H];return artCache[k]=u}
const ell=(cx,cy,a,b,rot=0)=>(x,y)=>{const dx=x-cx,dy=y-cy,c=Math.cos(rot),s=Math.sin(rot),u=dx*c+dy*s,v=-dx*s+dy*c;return u*u/(a*a)+v*v/(b*b)<=1};

const SKIN=[[246,210,180],[232,180,142],[201,141,99],[162,104,63],[122,74,42],[90,53,32]],HAIR=[[43,26,16],[74,44,23],[74,44,23],[122,74,34],[122,74,34],[196,138,60],[227,194,122],[150,150,150],[178,58,42],[30,30,50],[30,30,50],[110,60,150],[40,90,160]],SHIRT=[[214,48,49],[69,123,157],[42,157,143],[244,162,97],[109,89,122],[233,196,106],[38,70,83],[255,122,162],[138,177,125]];

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
 const role=c.vip?({"Chef Estrelado":"chef","Crítica Gourmet":"critic","Cientista Maluca":"sci","Prefeito":"mayor","Influencer Fit":"fit","Colecionador":"coll"}[c.name]||null):null; // 6B: papel visual derivado do nome já salvo
 const sw=pick([11,12,12,13]),hOff=human||furry?pick([0,0,1,1,2]):0; // largura de ombro e altura (0–2 px de arte) saem da semente: o save não ganha campo
 let gar=role?({chef:"chefj",critic:"blazer",sci:"coat",mayor:"suit",fit:"tank",coll:"vest"}[role]):sp==3?"overall":sp==4?"shirt":pick(["tee","tee","hoodie","tank","sweater"]);
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
  if(role=="chef"){F((x,y)=>y>=1&&y<=9&&dx(x)<=9.5&&(y>=4||dx(x)<=7.5),WHt,"hat");F((x,y)=>y>=9&&y<=11&&dx(x)<=10.5,shd(WHt),"brim")}
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

function srand(seed){let s=seed;return()=>{s=(s*16807)%2147483647;return s/2147483647}}
function cvs(w,h){const c=document.createElement("canvas");c.width=w;c.height=h;const g=c.getContext("2d");g.imageSmoothingEnabled=false;return[c,g]}
function px(g,x,y,c,w=1,h=1){g.fillStyle=c;g.fillRect(x,y,w,h)}
function spr(g,rows,pal,x0,y0){rows.forEach((r,y)=>[...r].forEach((ch,x)=>{if(pal[ch])px(g,x0+x,y0+y,pal[ch])}))}

function cloudStrip(w,h,dense,seed){const[c,g]=cvs(w,h),r=srand(seed),n=dense?Math.round(w/7):Math.max(2,Math.round(w/26)),blobs=[];
 for(let k=0;k<n;k++){const rx=dense?5+r()*7:4+r()*5;blobs.push([r()*w,(dense?.25+r()*.7:.35+r()*.4)*h,rx,rx*.55])}
 const lit=dense?[206,211,220]:[255,255,255],mid=dense?[178,185,196]:[232,236,244],sh=dense?[150,158,172]:[200,207,220];
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){let best=-1,by=0;for(const[bx,cy,rx,ry]of blobs)for(const o of[-w,0,w]){const dx=(x-bx-o)/rx,dy=(y-cy)/ry,d=dx*dx+dy*dy;if(d<1&&(best<0||d<best)){best=d;by=dy}}
  if(dense&&y>h*.55)best=best<0?.9:best;if(best<0)continue;px(g,x,y,hex(by<-.35?lit:by>.45||y>h*.8?sh:mid))}
 return c.toDataURL()}

const PAL2={
 wall:[[220,180,122],[212,171,113],[227,188,132],[205,164,106]],wallGroove:"#8f6236",knot:"#9a6a3a",knotD:"#74491f",
 lam:[168,112,62],lamHi:"#c08a50",lamLo:"#8a5a30",lamGr:"#6a4222",capHi:"#d9a465",cap:"#b47c46",capLo:"#6a4222",
 shHi:"#f2c888",sh1:"#dba565",sh2:"#b97c44",sh3:"#875530",
 frO:"#4a2c16",frM:"#9b6a3e",frH:"#c89258",frD:"#6b4423",sill:"#e0ae6e",sillD:"#8a5a34",
 ctHi:"#f6d090",ct1:"#e2ae6c",ct2:"#d39c5c",ctEdge:"#b97c44",ctEdgeD:"#96602f",ctLip:"#4e2e16",
 fr:[122,74,40],frHi:"#93603a",frLo:"#643a1e",frGr:"#4a2a14",base:"#3e2210",baseHi:"#7a4a28",
 floor:[[196,124,66],[186,114,58],[204,134,74],[176,106,52],[191,120,62]],flSeam:"#7a4420",flHi:.14,flGrD:.86,flGrL:.1,flKnot:"#8a4f26",flKnotD:"#663a1a"};

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

const farmer=(s)=>({name:s&&s.farmer||'Fazendeiro',kind:'person',t0:0,blinkD:1,rw:1,skin:SKIN[1],hair:HAIR[1],shirt:SHIRT[2],sp:3,hs:0,hat:2,hat2:s&&s.hatGold?[247,195,49]:[205,155,75],eyeC:1,acc:[],acc2:SHIRT[3]});
function fieldCharacter(s){const [c,g]=cvs(40,66);g.drawImage(CH.sheet(farmer(s)).cv,0,0,40,52,0,0,40,52);px(g,10,50,'#2a1a12',20,2);px(g,11,52,'#3d5a8a',8,11);px(g,21,52,'#3d5a8a',8,11);px(g,11,52,'#5677a5',2,9);px(g,21,52,'#5677a5',2,9);px(g,10,62,'#5b3f2a',10,3);px(g,20,62,'#5b3f2a',10,3);px(g,10,65,'#2a1a12',10,1);px(g,20,65,'#2a1a12',10,1);return c.toDataURL();}
window.FrutodromoArt={character:(s,ex='ok')=>CH.frame(farmer(s),ex),fieldCharacter,customer:(ex='happy')=>CH.frame({...farmer(null),name:'Lia',hs:1,hat:0,sp:4,shirt:SHIRT[7]},ex),deco:DECO.spr,size:u=>ADIM[u],floor:buildTableTile,awning:buildAwning,cloud:cloudStrip,canvas:cvs,px,art,blank,hex,mul,lift,srand};
})();
