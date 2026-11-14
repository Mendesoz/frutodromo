import asyncio,sys,json
from playwright.async_api import async_playwright
URL=sys.argv[1] if len(sys.argv)>1 else "file:///tmp/qa9/site/index.html"
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for name,W,H in [("SE-land",667,375),("i14-land",844,390),("i14PM-land",932,430)]:
      ctx=await b.new_context(viewport={'width':W,'height':H},device_scale_factor=2,is_mobile=True,has_touch=True,locale="pt-BR")
      pg=await ctx.new_page();await pg.goto(URL);await pg.wait_for_timeout(1000)
      await pg.evaluate("()=>{const b=document.querySelector('#modal.on .big');if(b)b.click()}");await pg.wait_for_timeout(6000)
      r=await pg.evaluate("""()=>{const R=e=>{const b=e.getBoundingClientRect();return [Math.round(b.x),Math.round(b.y),Math.round(b.width),Math.round(b.height)]};return {cust:[...document.querySelectorAll('.cust')].map(c=>({c:R(c),bub:c.querySelector('.bub')?R(c.querySelector('.bub')):null,pw:c.querySelector('.pw')?R(c.querySelector('.pw')):null})),scene:R(document.getElementById('scene'))}}""")
      print(name,json.dumps(r))
      await pg.screenshot(path=f"/tmp/qa9/resp/{name}-6s.png");await ctx.close()
    await b.close()
asyncio.run(main())
