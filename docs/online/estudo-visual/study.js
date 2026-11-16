/* Estudo isolado. Nenhum estado de conta, mapa logico, receita ou save e alterado. */
const canvas=document.getElementById('scene'),g=canvas.getContext('2d');g.imageSmoothingEnabled=false;
const P={ink:'#30252b',shade:'#443a39',grass:'#81ac4b',grassL:'#a5c961',grassD:'#68943d',leaf:'#4c803b',leafD:'#355c35',leafL:'#91bb53',bark:'#795034',wood:'#ba7a40',woodL:'#edb86a',woodD:'#835431',cream:'#fae5af',red:'#cf4d40',redL:'#eb7450',redD:'#8f3836',blue:'#81c6ca',soil:'#73503b',soilD:'#503a30',soilL:'#ab7750',path:'#d9b877',pathD:'#b69057'};
function r(x,y,w,h,c){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
// Polygon edges are stair steps (integer pixels), no smoothing or fractional scale.
function steps(x,y,w,h,c){r(x+8,y,w-16,h,c);r(x+3,y+4,w-6,h-8,c);r(x,y+10,w,h-20,c);}
function shadow(x,y,w,h){steps(x,y,w,h,'#52753b');steps(x+4,y+2,w-8,h-5,'#496835');}
function grass(){r(0,0,560,320,P.grass);for(let y=0;y<320;y+=16)for(let x=0;x<560;x+=16){const n=(x*17+y*31)%71;if(n<21){r(x+3,y+7,5,2,P.grassD);r(x+5,y+5,1,3,P.grassD);}if(n>57)r(x+8,y+11,4,1,P.grassL);}
  for(const [x,y,w]of [[0,12,560],[0,29,560]]){r(x,y,w,2,P.grassD);}r(0,0,560,12,'#456c37');}
function path(){r(0,206,560,35,P.pathD);r(0,209,560,27,P.path);r(232,71,39,249,P.pathD);r(235,71,32,249,P.path);r(234,207,35,32,P.path);for(let x=4;x<560;x+=27){r(x,213+(x%3)*6,8,2,'#e8ca8c');r(x+12,228-(x%4),4,2,'#bd995c');}for(let y=79;y<318;y+=23){r(239,y,7,2,'#e9cc8e');r(257,y+7,4,2,'#bd995c');}}
function flower(x,y,c){r(x,y+2,1,5,P.leafD);r(x-1,y,3,3,c);r(x,y+1,1,1,'#ffe9a5');}
function bush(x,y,w=28){shadow(x-2,y+16,w+5,12);steps(x,y,w,22,P.leafD);steps(x+2,y-2,w-4,20,P.leaf);r(x+5,y,10,3,P.leafL);r(x+4,y+6,4,2,'#6b9f42');r(x+w-10,y+9,6,3,'#406d36');}
function tree(x,y){shadow(x-2,y+65,64,19);r(x+24,y+31,13,43,P.ink);r(x+25,y+32,11,41,P.bark);r(x+26,y+42,3,24,'#a77540');r(x+34,y+51,8,3,P.ink);r(x+35,y+49,5,2,P.bark);steps(x,y,62,57,P.ink);steps(x+1,y+1,60,55,P.leafD);steps(x+5,y+3,46,43,P.leaf);steps(x+10,y+2,36,29,'#709e43');steps(x+14,y+3,24,14,P.leafL);r(x+9,y+22,5,2,'#92b957');r(x+12,y+25,13,3,'#709e43');r(x+38,y+29,16,9,'#386437');r(x+29,y+40,11,4,'#467337');}
function stone(x,y){steps(x,y,17,11,P.ink);steps(x+1,y-2,14,10,'#91957b');r(x+4,y-1,7,2,'#b8b99b');r(x+10,y+5,4,2,'#727966');}
function fence(x,y,w){shadow(x-2,y+10,w+7,9);r(x,y+3,w,4,P.ink);r(x+1,y+3,w-2,2,P.woodL);r(x,y+12,w,4,P.ink);r(x+1,y+12,w-2,2,P.wood);for(let k=0;k<=w;k+=16){r(x+k,y-2,5,25,P.ink);r(x+k+1,y,3,21,P.woodL);r(x+k+3,y+3,1,18,P.woodD);r(x+k+1,y+18,2,2,'#d4934d');}}
function roof(x,y,w,h){for(let j=0;j<h;j++){const left=Math.max(0,18-j);r(x+left,y+j,w-left*2,1,P.ink);}for(let j=3;j<h-4;j++){const left=Math.max(2,20-j);r(x+left,y+j,w-left*2,1,j%8===3?P.redD:j%8===4?P.redL:P.red);}for(let j=8;j<h-5;j+=8)for(let k=23;k<w-12;k+=13)r(x+k+(j%16?0:6),y+j-3,1,4,P.redD);r(x+1,y+h-4,w-2,4,P.ink);r(x+3,y+h-4,w-6,1,'#f9bd72');r(x+8,y+h,w-16,4,P.redD);}
function windowBox(x,y,w=20,h=22){r(x-2,y-2,w+4,h+4,P.ink);r(x,y,w,h,P.woodL);r(x+2,y+2,w-4,h-4,'#437989');r(x+3,y+3,w-7,h-8,P.blue);r(x+4,y+4,2,h-11,'#c4ede4');r(x+w/2-1,y+1,2,h-2,P.cream);r(x+1,y+h/2,w-2,2,P.cream);r(x-3,y+h+1,w+6,4,P.ink);r(x-2,y+h+1,w+4,2,P.woodL);}
function barn(x,y){shadow(x-8,y+103,147,24);r(x+5,y+29,129,82,P.ink);r(x+8,y+30,123,77,P.redD);r(x+10,y+32,112,73,P.red);for(let k=12;k<124;k+=10){r(x+k,y+35,2,70,P.redD);r(x+k+2,y+35,1,67,P.redL);}r(x+8,y+44,121,4,P.cream);r(x+8,y+95,121,4,P.cream);r(x+9,y+30,5,77,P.cream);r(x+122,y+30,5,77,P.cream);roof(x-2,y,140,37);r(x+50,y+52,39,55,P.ink);r(x+53,y+54,33,51,P.woodD);r(x+56,y+55,27,49,P.wood);r(x+67,y+54,3,51,P.ink);r(x+51,y+54,37,3,P.cream);r(x+51,y+103,37,3,P.cream);for(let n=0;n<26;n++){r(x+55+n,y+58+n,2,3,P.cream);r(x+80-n,y+58+n,2,3,P.cream);}r(x+48,y+107,43,4,'#c5bb92');r(x+46,y+111,47,4,P.ink);windowBox(x+21,y+58,18,23);windowBox(x+98,y+58,18,23);r(x+54,y+25,32,17,P.ink);r(x+56,y+27,28,13,P.cream);r(x+59,y+30,22,2,P.redD);r(x+60,y+34,20,2,P.redD);r(x+108,y-4,10,16,P.ink);r(x+110,y-2,6,11,P.woodL);r(x+107,y-5,12,3,P.cream);}
function coop(x,y){shadow(x-5,y+69,99,21);r(x+5,y+24,76,49,P.ink);r(x+8,y+25,70,43,P.woodL);r(x+65,y+27,12,41,P.wood);for(let k=32;k<65;k+=8){r(x+9,y+k,55,2,P.wood);r(x+10,y+k-1,52,1,'#f7cf83');}roof(x,y,86,31);windowBox(x+15,y+37,16,17);r(x+43,y+37,22,33,P.ink);r(x+46,y+40,16,28,'#453b35');r(x+44,y+70,21,5,P.woodD);r(x+42,y+75,25,4,P.woodL);r(x+40,y+79,29,4,P.woodD);}
function chicken(x,y){shadow(x-1,y+17,21,8);r(x+3,y+4,14,14,P.ink);r(x+2,y+6,16,10,P.ink);r(x+4,y+5,11,10,'#fff4d5');r(x+5,y+12,9,4,'#dbc49c');r(x+13,y,8,12,P.ink);r(x+14,y+2,6,8,'#fff4d5');r(x+15,y-2,4,3,P.red);r(x+18,y+4,1,2,P.ink);r(x+20,y+6,3,2,'#e8aa3f');r(x+6,y+17,2,4,P.woodD);r(x+12,y+17,2,4,P.woodD);r(x,y+4,4,5,'#fff4d5');}
function bed(x,y,w,h,ripe){shadow(x-2,y+5,w+6,h);r(x,y,w,h,P.ink);r(x+2,y+2,w-4,h-4,P.soilD);r(x+3,y+2,w-6,2,P.soilL);for(let j=8;j<h-3;j+=12){r(x+4,y+j,w-8,5,P.soil);r(x+5,y+j,w-10,1,P.soilL);for(let k=10;k<w-7;k+=17){const xx=x+k,yy=y+j;r(xx-3,yy-4,8,9,P.leafD);r(xx-5,yy-5,5,3,'#54863b');r(xx+2,yy-6,5,3,'#3b6b35');r(xx-2,yy-5,2,8,P.leafL);if(ripe){r(xx,yy-10,5,11,P.ink);r(xx+1,yy-9,3,9,'#f1ba35');r(xx+1,yy-8,1,6,'#ffe293');r(xx+3,yy-6,1,3,'#cd8732');}else r(xx-3,yy-6,3,2,'#b1cf65');}}r(x+2,y+h-3,w-4,1,'#a97143');}
function well(x,y){shadow(x-4,y+40,46,16);r(x+2,y+20,35,26,P.ink);r(x+4,y+22,31,21,'#92987d');r(x+6,y+23,27,7,'#4d6961');r(x+8,y+23,23,3,'#263e40');for(let j=31;j<43;j+=7){r(x+5,y+j,29,1,'#c3c3a0');for(let k=10;k<32;k+=11)r(x+k+(j%2?0:5),y+j-5,1,5,'#616f5f');}r(x+1,y+7,4,31,P.ink);r(x+34,y+7,4,31,P.ink);r(x+2,y+8,2,26,P.woodL);r(x+35,y+8,2,26,P.woodL);roof(x-3,y-8,45,20);r(x+18,y+12,1,16,P.woodD);}
const img=src=>new Promise(resolve=>{const im=new Image();im.onload=()=>resolve(im);im.src=src;});
function person(sheet,x,y){shadow(x+6,y+53,30,11);g.drawImage(sheet,0,0,40,32,x,y,40,32);g.drawImage(sheet,0,32,40,17,x,y+30,40,17);r(x+11,y+46,18,12,P.ink);r(x+12,y+46,7,10,'#586d94');r(x+21,y+46,7,10,'#586d94');r(x+13,y+47,2,7,'#8094b5');r(x+22,y+47,2,7,'#8094b5');r(x+10,y+55,10,5,P.ink);r(x+20,y+55,10,5,P.ink);r(x+11,y+55,7,2,P.woodD);r(x+22,y+55,7,2,P.woodD);}
async function main(){
 const originals=await Promise.all([1,5,0].map(i=>img(window.FZ_SPR.chars[i].sheet)));
 for(const im of originals){const c=document.createElement('canvas');c.width=40;c.height=50;const cg=c.getContext('2d');cg.imageSmoothingEnabled=false;cg.drawImage(im,0,0,40,50,0,0,40,50);document.getElementById('cast').append(c);}
 const deco=await Promise.all(['barrel','sack','plant'].map(k=>img(window.FrutodromoArt.deco(k))));
 grass();path();
 fence(12,44,176);fence(301,25,224);
 tree(-14,-14);tree(44,-22);tree(100,-26);tree(164,-20);tree(494,-20);tree(532,26);
 bush(10,83,32);bush(190,56,24);flower(45,92,'#f6cc64');flower(51,89,'#e67d85');
 barn(65,70);well(281,55);coop(386,45);
 g.drawImage(deco[0],51,161);g.drawImage(deco[1],194,160);g.drawImage(deco[2],184,155);
 fence(366,128,128);chicken(399,113);chicken(445,106);chicken(470,120);
 bed(302,161,83,38,true);bed(399,161,83,38,true);
 bed(305,253,83,43,false);bed(401,253,83,43,false);
 tree(5,236);bush(63,288,48);bush(133,277,30);stone(181,300);
 bush(504,247,41);flower(513,263,'#ee9ca3');flower(524,257,'#ffe29a');
 person(originals[0],219,163);person(originals[1],170,213);
 // Original robot silhouette is kept whole; the human body study does not apply to other species.
 shadow(501,155,25,10);g.drawImage(originals[2],0,0,40,52,493,106,40,52);
 for(const [x,y]of [[47,187],[201,191],[290,142],[483,196],[157,247]]){flower(x,y,'#f3c965');flower(x+7,y+4,'#e78c8c');}
 stone(14,188);stone(521,179);
 document.body.dataset.ready='true';
}
main().catch(()=>{document.querySelector('.lead').textContent='Não foi possível carregar a arte original. Inicie este estudo pelo servidor local indicado no README.';});
