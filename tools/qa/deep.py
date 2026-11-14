# Modal "COMO FAZER?" com a receita mais longa disponível: cabe em telas pequenas?
import asyncio,json
from playwright.async_api import async_playwright
JS="""(lv)=>{if(lv){S.delivered=lv*3}const L=level(),pool=reachPool(L);let best=null,bl=-1;for(const x of pool){const n=recipeOf(x).length;if(n>bl){bl=n;best=x}}
 if(!best||!S.cust[0])return {L,err:'sem alvo'};S.cust[0].tg=rk(best);S.cust[0].reqs=[];showHint(0);
 const m=document.querySelector('#modal.on #mbox');const b=m.getBoundingClientRect();return {L,steps:bl,box:[Math.round(b.x),Math.round(b.y),Math.round(b.width),Math.round(b.height)],scroll:[m.scrollHeight,m.clientHeight],fitsV:b.top>=0&&b.bottom<=innerHeight,ovf:getComputedStyle(m).overflowY}}"""
async def m():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for W,H in [(667,375),(844,390),(375,667),(360,640),(1024,600)]:
      c=await b.new_context(viewport={'width':W,'height':H},device_scale_factor=2,is_mobile=True,has_touch=True);pg=await c.new_page();await pg.goto("file:///tmp/qa9/site/index.html");await pg.wait_for_timeout(900)
      await pg.evaluate("()=>{const b=document.querySelector('#modal.on .big');if(b)b.click()}");await pg.wait_for_timeout(5000)
      r=await pg.evaluate(JS,8);print(W,H,json.dumps(r));await pg.screenshot(path=f"/tmp/qa9/resp/deep-{W}x{H}.png");await c.close()
    await b.close()
asyncio.run(m())
