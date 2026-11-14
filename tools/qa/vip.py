# VIPs (6B) e poderes elementais na tela: 3 VIPs no balcão em 3 tamanhos, dia e noite
import asyncio,json
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for W,H,dpr in [(390,844,2),(1024,600,1),(900,430,1)]:
      ctx=await b.new_context(viewport={'width':W,'height':H},device_scale_factor=dpr,is_mobile=W<600,has_touch=True);pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
      await pg.goto("file:///tmp/qa9/site/index.html");await pg.wait_for_timeout(900)
      await pg.evaluate("()=>{const b=document.querySelector('#modal.on .big');if(b)b.click();S.tut={a:1,b:1,c:1,d:1,e:1,f:1}}");await pg.wait_for_timeout(4500)
      r=await pg.evaluate("""()=>{S.delivered=24;const got=[],names=new Set();let g=0;while(got.length<3&&g<3000){g++;const c=newCust();if(c.vip&&!names.has(c.name)){names.add(c.name);c.come=false;got.push(c)}}
        S.cust=got;renderCounter();return {vips:got.map(c=>c.name+' ['+c.reqs.map(r=>r.k+(r.v?':'+r.v:'')).join(',')+']'),tries:g}}""")
      await pg.wait_for_timeout(1500)
      await pg.screenshot(path=f"/tmp/qa9/vip-{W}x{H}.png")
      chk=await pg.evaluate("""()=>{const R=e=>e.getBoundingClientRect();const bs=[...document.querySelectorAll('.bub')].map(R);let ov=0;for(let i=0;i<bs.length;i++)for(let j=i+1;j<bs.length;j++){const a=bs[i],c=bs[j];if(Math.min(a.right,c.right)-Math.max(a.left,c.left)>2&&Math.min(a.bottom,c.bottom)-Math.max(a.top,c.top)>2)ov++}
        const sc=R(document.getElementById('scene'));return {bubOverlap:ov,cut:bs.filter(b=>b.left<sc.left-1||b.right>sc.right+1||b.top<sc.top-1).length}}""")
      print(W,H,json.dumps(r,ensure_ascii=False),json.dumps(chk),errs)
      await ctx.close()
    await b.close()
asyncio.run(main())
