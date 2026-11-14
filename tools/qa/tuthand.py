# Tutorial: mãozinha nos passos 1 e 2, some ao arrastar, PULAR TUTORIAL, persistência e REVER TUTORIAL; movimento reduzido; en
import asyncio,json,sys
from playwright.async_api import async_playwright
U=sys.argv[1] if len(sys.argv)>1 else "file:///tmp/qa9/site/index.html"
ST="()=>{const h=document.getElementById('tuthand'),t=document.getElementById('tut');const r=e=>{if(!e)return null;const b=e.getBoundingClientRect();return [Math.round(b.x),Math.round(b.y),Math.round(b.width),Math.round(b.height)]};return {tut:t&&t.classList.contains('on')?t.dataset.k:null,hand:h?h.className:null,handImg:h?r(h.querySelector('.hh')):null,tr:h?h.style.transform:null,skip:!!document.querySelector('#tut .tskip'),skipTxt:(document.querySelector('#tut .tskip')||{}).textContent,tutState:JSON.stringify(S.tut),errs:window.__errs}}"
async def run(p,W,H,loc,rm):
  ctx=await p.chromium.launch();c=await ctx.new_context(viewport={'width':W,'height':H},locale=loc,reduced_motion='reduce' if rm else 'no-preference',is_mobile=W<600,has_touch=True,device_scale_factor=2);pg=await c.new_page()
  await pg.goto(U);await pg.wait_for_timeout(900);await pg.evaluate("()=>{const b=document.querySelector('#modal.on .big');if(b)b.click()}");await pg.wait_for_timeout(4500)
  out={}
  out['passo1']=await pg.evaluate(ST);await pg.screenshot(path=f"/tmp/qa9/th-{W}x{H}-{loc[:2]}{'-rm' if rm else ''}-p1a.png")
  await pg.wait_for_timeout(900);out['passo1_t2']=await pg.evaluate(ST);await pg.screenshot(path=f"/tmp/qa9/th-{W}x{H}-{loc[:2]}{'-rm' if rm else ''}-p1b.png")
  # arrastando: mãozinha some
  pos=await pg.evaluate("()=>{const f=document.querySelector('#table .fr');const a=f.getBoundingClientRect();return [a.x+a.width/2,a.y+a.height/2]}")
  await pg.mouse.move(*pos);await pg.mouse.down();await pg.mouse.move(pos[0]+30,pos[1]-20);await pg.mouse.move(pos[0]+60,pos[1]-30);await pg.wait_for_timeout(200)
  out['arrastando']=await pg.evaluate(ST);await pg.mouse.up();await pg.wait_for_timeout(400)
  # passo 2: marca t1 feito
  await pg.evaluate("()=>{tutDone('t1')}");await pg.wait_for_timeout(1500)
  out['passo2']=await pg.evaluate(ST);await pg.wait_for_timeout(900);await pg.screenshot(path=f"/tmp/qa9/th-{W}x{H}-{loc[:2]}{'-rm' if rm else ''}-p2.png")
  # pular
  sk=await pg.evaluate("()=>{const b=document.querySelector('#tut .tskip');if(!b)return null;const r=b.getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2,Math.round(r.width),Math.round(r.height)]}")
  if sk:
    if W<600: await pg.touchscreen.tap(sk[0],sk[1])
    else: await pg.mouse.click(sk[0],sk[1])
  await pg.wait_for_timeout(1200);out['pulou']=await pg.evaluate(ST);out['skipSize']=sk and sk[2:]
  await pg.reload();await pg.wait_for_timeout(1000);await pg.evaluate("()=>{const b=document.querySelector('#modal.on .big');if(b)b.click()}");await pg.wait_for_timeout(2500)
  out['recarregou']=await pg.evaluate(ST)
  await pg.evaluate("()=>{settings();document.getElementById('stut').click()}");await pg.wait_for_timeout(1500);out['rever']=await pg.evaluate(ST)
  await ctx.close();return out
async def main():
  async with async_playwright() as p:
    for W,H,loc,rm in [(390,844,'pt-BR',False),(1024,600,'en-US',False),(900,430,'pt-BR',False),(390,844,'pt-BR',True)]:
      r=await run(p,W,H,loc,rm);print(W,H,loc,'rm' if rm else '',json.dumps(r,ensure_ascii=False))
asyncio.run(main())
