# Varredura de palavras quebradas no meio (sem hífen) na tela de jogo, balões VIP, tutorial, aviso, ajustes, dica e fim do dia
import asyncio,json,sys
from playwright.async_api import async_playwright
U=sys.argv[1]
SCAN="""(tag)=>{const out=new Set();const tw=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;while(n=tw.nextNode()){const el=n.parentElement;if(!el||!el.offsetParent&&getComputedStyle(el).position!='fixed')continue;const re=/[^\\s\\-]+/g;let m;while(m=re.exec(n.textContent)){if(m[0].length<3)continue;const rg=document.createRange();rg.setStart(n,m.index);rg.setEnd(n,m.index+m[0].length);const rs=[...rg.getClientRects()].filter(r=>r.width>0);if(rs.length>1)out.add(m[0]+'@'+(el.closest('[id]')||{}).id)}}return [...out]}"""
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();res={}
    for loc in ['en-US','pt-BR']:
     for W,H in [(390,844),(360,640),(1024,600),(900,430),(844,390)]:
      ctx=await b.new_context(viewport={'width':W,'height':H},locale=loc,is_mobile=W<600,has_touch=True);pg=await ctx.new_page()
      await pg.goto(U);await pg.wait_for_timeout(900);found=set()
      found|=set(await pg.evaluate(SCAN,'inicio'))
      await pg.evaluate("()=>{const b=document.querySelector('#modal.on .big');if(b)b.click()}");await pg.wait_for_timeout(5500)
      found|=set(await pg.evaluate(SCAN,'jogo+tut'))
      await pg.evaluate("""()=>{S.tut={a:1,b:1,c:1,d:1,e:1,f:1};tutStep&&tutStep();S.delivered=24;const got=[];let g=0;while(got.length<3&&g<3000){g++;const c=newCust();if(c.vip){c.come=false;got.push(c)}}S.cust=got;renderCounter();toast('Bartolomeu adorou! <b>+128</b> moedas<br><b>NÍVEL 9!</b> Clientes pedem frutas MICROSCÓPICAS e GIGANTESCAS')}""");await pg.wait_for_timeout(900)
      found|=set(await pg.evaluate(SCAN,'vip'))
      await pg.evaluate("()=>showHint(0)");await pg.wait_for_timeout(500);found|=set(await pg.evaluate(SCAN,'dica'))
      await pg.evaluate("()=>settings()");await pg.wait_for_timeout(500);found|=set(await pg.evaluate(SCAN,'ajustes'))
      await pg.evaluate("()=>{closeModal&&closeModal();endDay()}");await pg.wait_for_timeout(2500);found|=set(await pg.evaluate(SCAN,'fim'))
      res[f"{loc} {W}x{H}"]=sorted(found);print(loc,W,H,sorted(found));await ctx.close()
    await b.close()
asyncio.run(main())
