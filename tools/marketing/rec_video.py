"""Grava o vídeo de prévia do Frutódromo (sem som) via screencast do Chrome e monta com ffmpeg.
uso: python3 rec_video.py land|port"""
import asyncio,base64,json,os,shutil,subprocess,sys
from playwright.async_api import async_playwright
MODE=sys.argv[1]
if MODE=="land": VW,VH,DSF,OW,OH,COVER=1024,576,1.875,1920,1080,"/tmp/qa9/covers/cover-landscape-1920x1080.png"
else: VW,VH,DSF,OW,OH,COVER=432,648,2.5,1080,1620,"/tmp/qa9/covers/cover-portrait-video.png"
FR=f"/tmp/qa9/frames_{MODE}";shutil.rmtree(FR,ignore_errors=True);os.makedirs(FR)
SETUP="""()=>{
 S.tut={t1:1,t2:1,t3:1,t4:1};S.ach={};ACH.forEach(a=>S.ach[a[0]]=1);$('tut').classList.remove('on');$('tut').innerHTML='';
 CFG.wxForce='entardecer';CFG.wx=false;updateSky();
 // árvore já com várias espécies
 for(let k=0;k<26;k++){const a=baseFruit(R(BASE.slice(0,8))),b=baseFruit(R(BASE));let x=cross(a,b);if(k%3==0)x=cross(x,baseFruit(R(BASE)));treeAdd(x,null,true)}
 S.coins=148;showCoins();
 const pick=n=>baseFruit(BASE[BASE.findIndex(b=>b[0]==n)]);
 const T=$('table'),W=T.clientWidth,H=T.clientHeight,sz=f=>fsize(f);
 const place=(f,px,py)=>{f.x=Math.round(px*W-sz(f)/2);f.y=Math.round(py*H-sz(f)/2);clampPos(f);return f};
 const st=place(pick('Morango'),.40,.28),ba=place(pick('Banana'),.62,.28),pe=place(pick('Pimenta-Dragão'),.40,.72),gl=place(pick('Fruta Glacial'),.62,.72),ca=place(pick('Carambola Elétrica'),.80,.30),me=place(pick('Melancia'),.80,.70);
 st.id='v_st';ba.id='v_ba';pe.id='v_pe';gl.id='v_gl';ca.id='v_ca';me.id='v_me';
 S.fruits=[st,ba,pe,gl,ca,me];
 S.bag=[{t:'grow'},{t:'shiny'},{t:'fogo'}];
 const mk=(reqs,vip)=>{let c;for(let k=0;k<60;k++){c=newCust();if(!!c.vip==!!vip&&c.kind!='ghost')break}c.reqs=reqs;c.come=false;c.ct=Date.now()-5000;c.t0=now();c.pat=400000;return c};
 S.cust=[mk([{k:'el',v:'fogo'}]),mk([{k:'cor',v:'azul'},{k:'el',v:'gelo'}]),mk([{k:'el',v:'raio'},{k:'tamMax',v:6}])];
 save();renderAll();placePot();
}"""
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=["--hide-scrollbars"])
    ctx=await b.new_context(viewport={"width":VW,"height":VH},device_scale_factor=DSF,locale="en-US")
    pg=await ctx.new_page();errs=[];pg.on("pageerror",lambda e:errs.append(str(e)[:200]))
    await pg.goto("file://"+os.path.abspath("index.html"));await pg.wait_for_timeout(800)
    await pg.add_style_tag(content=":root{--fw:100vw!important;--fh:100vh!important;--fx:0px!important;--fy:0px!important}html{background:#2a1a12!important}*{cursor:none!important}")
    await pg.click("#go");await pg.wait_for_timeout(600)
    await pg.evaluate(SETUP);await pg.wait_for_timeout(2500)
    await pg.evaluate("()=>{document.querySelectorAll('.toast').forEach(t=>t.classList.remove('on'))}")
    cdp=await ctx.new_cdp_session(pg);meta=[]
    async def on_frame(ev):
      i=len(meta);open(f"{FR}/{i:05d}.jpg","wb").write(base64.b64decode(ev["data"]));meta.append(ev["metadata"]["timestamp"])
      try: await cdp.send("Page.screencastFrameAck",{"sessionId":ev["sessionId"]})
      except Exception: pass
    cdp.on("Page.screencastFrame",lambda ev:asyncio.ensure_future(on_frame(ev)))
    await cdp.send("Page.startScreencast",{"format":"jpeg","quality":92,"maxWidth":OW,"maxHeight":OH,"everyNthFrame":1})
    async def ctr(sel):
      for k in range(20):
        try: bb=await pg.locator(sel).first.bounding_box(timeout=300)
        except Exception: bb=None
        if bb: return bb["x"]+bb["width"]/2,bb["y"]+bb["height"]/2
        await pg.wait_for_timeout(50)
      await pg.screenshot(path="/tmp/vchk/fail.png");raise SystemExit("sem "+sel+" modal="+str(await pg.evaluate("()=>[modalOpen,$('mbox').innerText.slice(0,80)]")))
    async def drag(sel,to,ms=520):
      x0,y0=await ctr(sel);x1,y1=await ctr(to) if isinstance(to,str) else to
      await pg.mouse.move(x0,y0);await pg.mouse.down();n=16
      for k in range(1,n+1):
        t=k/n;e=t*t*(3-2*t);await pg.mouse.move(x0+(x1-x0)*e,y0+(y1-y0)*e-30*4*t*(1-t));await pg.wait_for_timeout(ms//n)
      await pg.mouse.up()
    async def tap(sel):
      x,y=await ctr(sel);await pg.mouse.click(x,y)
    W=pg.wait_for_timeout
    await W(500)
    await drag('.fr[data-id="v_st"]','#potimg');await W(250)
    await drag('.fr[data-id="v_ba"]','#potimg');await W(1900)            # mistura + nasce
    await pg.evaluate('()=>showInfo(null)');await W(150)
    await drag('.fr[data-id="v_pe"]','.cust[data-i="0"] .pw');await W(1150)  # entrega fogo
    await drag('.fr[data-id="v_gl"]','.cust[data-i="1"] .pw');await W(1150)  # entrega gelo
    await tap('#bagtab');await W(500)
    await tap('.mk.itm >> nth=0');await W(350)
    await tap('.fr[data-id="v_me"]');await W(450);await pg.evaluate('()=>showInfo(null)');await W(650)                         # poção gigante na melancia
    await pg.evaluate('()=>showInfo(null)')
    await pg.evaluate("()=>{const f=cross(baseFruit(BASE[0]),baseFruit(BASE[0]));f.hero=true;f.cape='#2d6cdf';f.el='fogo';f.shiny=true;f.tam=12;const k=spKey(f);const T=$('table');f.x=T.clientWidth*.3;f.y=T.clientHeight*.3;clampPos(f);S.fruits.push(f);renderTable(f.id);treeAdd(f)}")
    await W(3200)                                                          # carta lendária
    await pg.evaluate("()=>closeModal()");await W(900)
    await cdp.send("Page.stopScreencast");await W(200)
    print("frames",len(meta),"errors",errs)
    json.dump(meta,open(f"{FR}/meta.json","w"))
    await b.close()
asyncio.run(main())
