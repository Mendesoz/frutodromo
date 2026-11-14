"""Capas do CrazyGames (1920x1080, 800x1200, 800x800 e a de retrato para o vídeo) com os sprites ATUAIS do jogo.
Sprites exportados por tools/marketing/export_sprites.py para /tmp/qa9/spr2 (personagens da etapa 6, caldeirão da etapa 3, frutas).
Fundo roxo e título como no ícone; tudo em pixel art ampliada por inteiro (NEAREST).
uso: python3 tools/marketing/make_covers.py [pasta_saida]"""
import math,sys,os
from PIL import Image,ImageDraw,ImageFont
SPR=os.environ.get("SPR","/tmp/qa9/spr2/");FONT=os.environ.get("FONT","/tmp/fonts/pix700.ttf")
OUT=sys.argv[1] if len(sys.argv)>1 else "/tmp/qa9/covers"
os.makedirs(OUT,exist_ok=True)
BG,H1,H2,H3="#5a22c8","#6c30e0","#7f45f2","#9a68ff"
hexc=lambda h:tuple(int(h[i:i+2],16) for i in (1,3,5))+(255,)
def sp(n):return Image.open(SPR+n+".png").convert("RGBA")
def up(im,k):return im.resize((im.width*k,im.height*k),Image.NEAREST)
def background(w,h,cx,cy,R):
    im=Image.new("RGBA",(w,h),hexc(BG));p=im.load()
    for y in range(h):
        for x in range(w):
            dx,dy=x+.5-cx,y+.5-cy;r=math.hypot(dx,dy);a=(math.atan2(dy,dx)+math.pi)/(2*math.pi)
            if r<R*.55:p[x,y]=hexc(H3)
            elif r<R*.78:p[x,y]=hexc(H2)
            elif r<R:p[x,y]=hexc(H1)
            elif int(a*32)%2==0 and r<R*1.9:p[x,y]=hexc(H1)
    return im
def sparkle(im,x,y,big=False):
    p=im.load();W=hexc("#ffffff");Y=hexc("#fff07a")
    for dx,dy in [(0,0),(1,0),(-1,0),(0,1),(0,-1)]+([(2,0),(-2,0),(0,2),(0,-2)] if big else []):
        if 0<=x+dx<im.width and 0<=y+dy<im.height:p[x+dx,y+dy]=W
    if big:p[x,y]=Y
def paste(im,s,x,y):
    L=Image.new("RGBA",im.size,(0,0,0,0));L.paste(s,(x,y),s);im.alpha_composite(L)
def potion(im,x,y):
    """caldeirão atual (48x44) com poção mágica e o Super Morango saindo dele"""
    pot=sp("pot").copy();pp=pot.load()
    # poção dentro da boca do caldeirão (no jogo é uma camada animada à parte): elipse lilás em 3 tons
    for yy in range(pot.height):
        for xx in range(pot.width):
            e=((xx+.5-23.5)/19)**2+((yy+.5-12)/3.6)**2
            if e<=1:pp[xx,yy]=hexc("#e05cf0") if e<.35 and yy<12 else hexc("#b23ad8") if e<.8 else hexc("#7d1fa8")
    paste(im,sp("hero_straw").resize((36,36),Image.NEAREST),x+6,y-26)
    paste(im,pot,x,y)
    for sx,sy,b in [(x+2,y-4,0),(x+44,y-10,1),(x+40,y+2,0),(x+4,y-18,1)]:sparkle(im,sx,sy,bool(b))
def title(cv,text,cx,top,size):
    f=ImageFont.truetype(FONT,size);d=ImageDraw.Draw(cv)
    bb=d.textbbox((0,0),text,font=f);tw,th=bb[2]-bb[0],bb[3]-bb[1]
    x,y=cx-tw//2-bb[0],top-bb[1];sw=max(4,size//11);sh=max(6,size//9)
    d.text((x+sh*.4,y+sh),text,font=f,fill=hexc("#1b0d3a"),stroke_width=sw,stroke_fill=hexc("#1b0d3a"))
    d.text((x,y),text,font=f,fill=hexc("#2a1a12"),stroke_width=sw,stroke_fill=hexc("#2a1a12"))
    mask=Image.new("L",cv.size,0);ImageDraw.Draw(mask).text((x,y),text,font=f,fill=255)
    grad=Image.new("RGBA",cv.size);gd=ImageDraw.Draw(grad)
    for yy in range(max(0,top-4),min(cv.height,top+th+6)):
        t=min(1,max(0,(yy-top)/max(1,th)));c=[int(a+(b-a)*t) for a,b in zip((255,240,90),(255,128,30))]
        if t<.18:c=[255,252,200]
        gd.line([(0,yy),(cv.width,yy)],fill=tuple(c)+(255,))
    cv.paste(grad,(0,0),mask)
CH=dict(cat="ch_cat_2",chef="ch_vip_Chef_0",girl="ch_person_f_1",robot="ch_robot_0",alien="ch_alien_1",frog="ch_frog_0",ghost="ch_ghost_0",mayor="ch_vip_Prefeito_1")
def compose(kind,out=None):
    if kind=="land":
        W,H,K=192,108,10;im=background(W,H,96,80,50)
        chars=[("cat",-6,H-52),("chef",26,H-52),("robot",W-68,H-52),("alien",W-36,H-52)]
        pot=(96-24,H-44)
        fruits=[(26,34,"base_1"),(52,30,"base_4"),(150,36,"base_9"),(122,48,"base_8"),(4,38,"base_7"),(172,34,"hy_13")]
        stars=[(16,58,1),(176,58,1),(76,44,0),(116,42,0),(96,30,0),(186,22,0),(6,24,0)]
        ttop,tsize=int(1080*.045),236
    elif kind=="port":
        W,H,K=100,150,8;im=background(W,H,50,104,52)
        chars=[("cat",-8,H-52),("robot",W-32,H-52)]
        pot=(50-24,H-44-6)
        fruits=[(8,42,"base_1"),(74,40,"base_9"),(14,66,"base_4"),(70,64,"base_8"),(42,36,"base_3")]
        stars=[(10,30,1),(90,58,1),(40,60,0),(62,30,0),(6,96,0)]
        ttop,tsize=int(1200*.06),118
    else:
        W,H,K=100,100,8;im=background(W,H,50,64,40)
        chars=[("chef",-12,H-52),("robot",W-28,H-52)]
        pot=(50-24,H-44)
        fruits=[(3,22,"base_1"),(78,21,"base_9")]
        stars=[(30,27,1),(68,30,0),(92,44,0),(8,44,1)]
        ttop,tsize=int(800*.05),118
    for x,y,n in fruits:paste(im,sp(n),x,y)
    for x,y,b in stars:sparkle(im,x,y,bool(b))
    potion(im,*pot)
    for n,x,y in chars:paste(im,sp(CH[n]),x,y)
    if out:
        f=out[0]/(W*K);cv=im.resize(out,Image.NEAREST).convert("RGBA");ttop,tsize=int(ttop*f),int(tsize*f)
    else:cv=up(im,K).convert("RGBA")
    title(cv,"FRUTÓDROMO",cv.width//2,ttop,tsize)
    return cv.convert("RGB")
if __name__=="__main__":
    names={"land":"cover-landscape-1920x1080.png","port":"cover-portrait-800x1200.png","sq":"cover-square-800x800.png"}
    for k,n in names.items():
        c=compose(k);c.save(os.path.join(OUT,n),optimize=True);print(n,c.size)
    compose("port",(1080,1620)).save(os.path.join(OUT,"cover-portrait-video.png"));print("cover-portrait-video.png")
