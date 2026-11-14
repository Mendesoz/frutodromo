# Cartões da feira: palavra quebrada no meio x texto estourando o cartão
import asyncio,json,sys
from playwright.async_api import async_playwright
U=sys.argv[1]
JS="""()=>{const o={broken:[],overflow:[]};for(const e of document.querySelectorAll('#market .mk')){
  const tw=document.createTreeWalker(e,NodeFilter.SHOW_TEXT);let n;while(n=tw.nextNode()){const re=/\\S+/g;let m;while(m=re.exec(n.textContent)){const rg=document.createRange();rg.setStart(n,m.index);rg.setEnd(n,m.index+m[0].length);const rs=[...rg.getClientRects()].filter(r=>r.width>0);if(rs.length>1&&!/-/.test(m[0]))o.broken.push(m[0]);
    const c=e.getBoundingClientRect(),bw=parseFloat(getComputedStyle(e).borderLeftWidth)||0;for(const r of rs){if(r.left<c.left+bw-1||r.right>c.right-bw+1)o.overflow.push(m[0]+' '+Math.round(r.right-(c.right-bw)))}}}}
  return o}"""
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for loc in ['en-US','pt-BR']:
     for W,H in [(1024,600),(390,844),(360,640),(900,430),(1280,680)]:
      ctx=await b.new_context(viewport={'width':W,'height':H},locale=loc);pg=await ctx.new_page()
      await pg.goto(U);await pg.wait_for_timeout(900);await pg.evaluate("()=>{const b=document.querySelector('#modal.on .big');if(b)b.click();S.delivered=30;renderMarket()}");await pg.wait_for_timeout(1200)
      # rola o trilho inteiro e junta
      tot={'broken':set(),'overflow':set()}
      for k in range(8):
        r=await pg.evaluate(JS);[tot['broken'].add(x) for x in r['broken']];[tot['overflow'].add(x) for x in r['overflow']]
        await pg.evaluate("()=>{const s=document.querySelector('.mkscroll');if(s)s.scrollLeft+=300}");await pg.wait_for_timeout(150)
      print(loc,W,H,'quebradas:',sorted(tot['broken']),'estouram:',sorted(tot['overflow']))
      if W in (1024,390):await pg.evaluate("()=>{const s=document.querySelector('.mkscroll');if(s)s.scrollLeft=0}");await pg.screenshot(path=f"/tmp/qa9/mk-{W}-{loc[:2]}-{U.split('/')[-2]}.png",clip={'x':0,'y':H-110,'width':W,'height':110})
      await ctx.close()
    await b.close()
asyncio.run(main())
