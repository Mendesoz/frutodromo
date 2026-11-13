# Bateria responsiva (Chromium, toque, DPR real de iPhone): prints e checagens automáticas
import asyncio,json,sys
from playwright.async_api import async_playwright
URL=sys.argv[1] if len(sys.argv)>1 else "file:///tmp/qa9/site/index.html"
OUT=sys.argv[2] if len(sys.argv)>2 else "/tmp/qa9/resp"
import os;os.makedirs(OUT,exist_ok=True)
DEV=[("SE",375,667,2),("i13mini",375,812,3),("i14",390,844,3),("i14PM",430,932,3),("i14-land",844,390,3),("SE-land",667,375,2),("ipad",820,1180,2),("cg",1024,600,1),("low",900,430,1),("desk",1280,680,1),("and360",360,640,3)]
CHK="""()=>{const q=s=>document.querySelector(s),R=e=>e.getBoundingClientRect(),vw=innerWidth,vh=innerHeight,out={vw,vh,errs:window.__errs||[]};
 const sel=['header','#scene','#table','#market','#pot','#tidy','#bin'];out.box={};for(const s of sel){const e=q(s);if(e){const b=R(e);out.box[s]=[Math.round(b.x),Math.round(b.y),Math.round(b.width),Math.round(b.height)]}}
 // fora da tela
 out.offscreen=[...document.querySelectorAll('header *,#market .mk,#market .mkar,.bub,.cust,#tidy,#bin,#pot,.fr,#tut.on')].filter(e=>{const b=R(e);return b.width>0&&(b.right>vw+1||b.bottom>vh+1||b.left<-1||b.top<-1)}).map(e=>(e.id||e.className).toString().slice(0,30)).slice(0,10);
 // texto cortado (overflow escondido) em botões, cartões, balões, cabeçalho
 out.clip=[...document.querySelectorAll('header .btn,header .tag,.mk .nm,.mk .pr,.rq b,.bn,#tut .tx,.toast')].filter(e=>e.scrollWidth>e.clientWidth+1&&getComputedStyle(e).overflow!='visible').map(e=>e.textContent.trim().slice(0,24)).slice(0,10);
 // alvos de toque pequenos
 out.small=[...document.querySelectorAll('header .btn,#tidy,.hint,.mkar,.mk')].filter(e=>{const b=R(e);return b.width>0&&(b.width<36||b.height<36)}).map(e=>(e.id||e.className||'').toString().slice(0,20)+':'+Math.round(R(e).width)+'x'+Math.round(R(e).height)).slice(0,10);
 // balões sobrepostos
 const bs=[...document.querySelectorAll('.bub')].map(R);let ov=0;for(let i=0;i<bs.length;i++)for(let j=i+1;j<bs.length;j++){const a=bs[i],b=bs[j];const w=Math.min(a.right,b.right)-Math.max(a.left,b.left),h=Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top);if(w>2&&h>2)ov++}out.bubOverlap=ov;
 out.potInTable=(()=>{const p=q('#pot'),t=q('#table');if(!p||!t)return null;const a=R(p),b=R(t);return a.top>=b.top-1&&a.bottom<=b.bottom+1})();
 out.zoom=q('#scene').style.zoom;return out}"""
async def run(p,name,W,H,dpr,loc):
  b=await p.chromium.launch()
  ctx=await b.new_context(viewport={'width':W,'height':H},device_scale_factor=dpr,is_mobile=W<900 or H>W,has_touch=True,locale=loc)
  pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
  await pg.goto(URL);await pg.wait_for_timeout(1200)
  await pg.evaluate("()=>{const b=document.querySelector('#modal.on .big');if(b)b.click()}");await pg.wait_for_timeout(1500)
  r=await pg.evaluate(CHK);r['pageerr']=errs
  await pg.screenshot(path=f"{OUT}/{name}-{loc[:2]}-jogo.png")
  # modal de dica: toca no ? do primeiro balão
  c=await pg.evaluate("()=>{const h=document.querySelector('.bub .hint');if(!h)return null;const b=h.getBoundingClientRect();return [b.x+b.width/2,b.y+b.height/2]}")
  if c:
    await pg.touchscreen.tap(c[0],c[1]);await pg.wait_for_timeout(700)
    r['hintModal']=await pg.evaluate("()=>{const m=document.querySelector('#modal.on #mbox');if(!m)return null;const b=m.getBoundingClientRect();return {box:[Math.round(b.x),Math.round(b.y),Math.round(b.width),Math.round(b.height)],scrollH:m.scrollHeight,clientH:m.clientHeight,fits:b.bottom<=innerHeight&&b.top>=0}}")
    await pg.screenshot(path=f"{OUT}/{name}-{loc[:2]}-dica.png")
    await pg.evaluate("()=>{const c=document.querySelector('#modal.on .x,#modal.on [data-close],#modal.on .btn');if(c)c.click()}");await pg.wait_for_timeout(400)
  # ajustes
  await pg.evaluate("()=>document.getElementById('menub').click()");await pg.wait_for_timeout(600)
  r['menu']=await pg.evaluate("()=>{const m=document.querySelector('#modal.on #mbox');if(!m)return null;const b=m.getBoundingClientRect();return {fits:b.bottom<=innerHeight+1&&b.top>=-1,scroll:m.scrollHeight>m.clientHeight}}")
  await pg.screenshot(path=f"{OUT}/{name}-{loc[:2]}-menu.png")
  await b.close();return r
async def main():
  res={}
  async with async_playwright() as p:
    for loc in ["pt-BR","en-US"]:
      for name,W,H,dpr in DEV:
        r=await run(p,name,W,H,dpr,loc);res[f"{name}-{loc}"]=r
        bad={k:r[k] for k in ['offscreen','clip','small','bubOverlap','pageerr','errs'] if r.get(k)}
        print(f"{name:9s} {W}x{H} {loc} zoom={r['zoom']!r:6} potOK={r['potInTable']} dica={r.get('hintModal',{}) and r['hintModal'].get('fits')} menu={r['menu']} {json.dumps(bad,ensure_ascii=False)}")
  json.dump(res,open(f"{OUT}/resp.json","w"),ensure_ascii=False,indent=1)
asyncio.run(main())
