# Toque nas bordas da área ampliada (6 px acima/abaixo, 3 px dos lados) acerta o botão?
import asyncio,json
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for W,H in [(844,390),(667,375),(820,1180),(1024,600)]:
      ctx=await b.new_context(viewport={'width':W,'height':H},device_scale_factor=2,is_mobile=True,has_touch=True)
      pg=await ctx.new_page();await pg.goto("file:///tmp/qa9/site/index.html");await pg.wait_for_timeout(900)
      await pg.evaluate("()=>{const b=document.querySelector('#modal.on .big');if(b)b.click()}");await pg.wait_for_timeout(1200)
      r=await pg.evaluate("""()=>{const out={};for(const id of ['dexb','pauseb','menub','tidy']){const e=document.getElementById(id),b=e.getBoundingClientRect();
        const pts=[[b.left+b.width/2,b.top-5],[b.left+b.width/2,b.bottom+5],[b.left-2,b.top+b.height/2],[b.right+2,b.top+b.height/2]];
        out[id]={size:[Math.round(b.width),Math.round(b.height)],hits:pts.map(([x,y])=>{const t=document.elementFromPoint(x,y);return !!t&&(t===e||e.contains(t))})}}
        // vizinhos não se roubam: meio do vão entre pausa e menu cai em qual?
        const a=document.getElementById('pauseb').getBoundingClientRect(),m=document.getElementById('menub').getBoundingClientRect();out.gap=(document.elementFromPoint((a.right+m.left)/2,a.top+a.height/2)||{}).id;return out}""")
      print(W,H,json.dumps(r));await ctx.close()
    await b.close()
asyncio.run(main())
