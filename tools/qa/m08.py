# M-08: entrega dupla no mesmo cliente dentro da janela de 900 ms (arraste real), pausa congela tempo e paciência
import asyncio,json,sys
from playwright.async_api import async_playwright
U=sys.argv[1] if len(sys.argv)>1 else "file:///tmp/qa9/site/index.html"
SETUP="""()=>{S.tut={a:1,b:1,c:1,d:1,e:1,f:1};tutStep&&tutStep();
 // cliente 0 pede só cor do morango; duas frutas iguais (morango) na mesa
 const b=BASE.find(b=>b[0]=='Morango');const f1=baseFruit(b),f2=baseFruit(b);
 const c=S.cust[0];c.reqs=[{k:'cor',v:colorName(f1.rgb)}];c.come=false;c.mood=null;c.leaving=false;
 S.fruits=[f1,f2];f1.x=60;f1.y=40;f2.x=200;f2.y=40;renderTable();renderCounter();fixFruitDeco&&fixFruitDeco();
 return {coins:S.coins,delivered:S.delivered,reqs:c.reqs,meets:[meets(f1,c.reqs[0]),meets(f2,c.reqs[0])]}}"""
POS="""(k)=>{const fr=[...document.querySelectorAll('#table .fr')];const el=fr[k];const ce=document.querySelector('.cust[data-i="0"] .bub')||document.querySelector('.cust[data-i="0"]');if(!el||!ce)return null;const a=el.getBoundingClientRect(),b=ce.getBoundingClientRect();return [a.x+a.width/2,a.y+a.height/2,b.x+b.width/2,b.y+b.height/2]}"""
async def drag(pg,p,steps=6):
  await pg.mouse.move(p[0],p[1]);await pg.mouse.down()
  for k in range(1,steps+1): await pg.mouse.move(p[0]+(p[2]-p[0])*k/steps,p[1]+(p[3]-p[1])*k/steps)
  await pg.mouse.up()
async def main():
  async with async_playwright() as pw:
    b=await pw.chromium.launch();out={}
    for gap in [0,300,700,1200]:
      ctx=await b.new_context(viewport={'width':1024,'height':600});pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
      await pg.goto(U);await pg.wait_for_timeout(900);await pg.evaluate("()=>{const b=document.querySelector('#modal.on .big');if(b)b.click()}");await pg.wait_for_timeout(4500)
      s0=await pg.evaluate(SETUP);await pg.wait_for_timeout(400)
      p1=await pg.evaluate(POS,0);await drag(pg,p1)
      await pg.wait_for_timeout(gap)
      st=await pg.evaluate("()=>({leaving:S.cust[0]&&S.cust[0].leaving,mood:S.cust[0]&&S.cust[0].mood})")
      p2=await pg.evaluate(POS,0)
      if p2: await drag(pg,p2)
      await pg.wait_for_timeout(300)
      s1=await pg.evaluate("()=>({coins:S.coins,delivered:S.delivered,served:S.ds.served,fruits:S.fruits.length})")
      out[gap]=dict(antes=s0,estadoNo2o=st,depois=s1,pagamentos=s1['delivered']-s0['delivered'],errs=errs)
      print("gap",gap,json.dumps(out[gap],ensure_ascii=False));await ctx.close()
    # pausa
    ctx=await b.new_context(viewport={'width':1024,'height':600});pg=await ctx.new_page()
    await pg.goto(U);await pg.wait_for_timeout(900);await pg.evaluate("()=>{const b=document.querySelector('#modal.on .big');if(b)b.click();S.tut={a:1,b:1,c:1,d:1,e:1,f:1}}");await pg.wait_for_timeout(4000)
    a=await pg.evaluate("()=>({clock:S.clock,t0:S.cust.map(c=>c&&c.t0)})");await pg.evaluate("()=>document.getElementById('pauseb').click()");await pg.wait_for_timeout(4000)
    bq=await pg.evaluate("()=>({clock:S.clock,running})");await pg.evaluate("()=>document.getElementById('resume').click()");await pg.wait_for_timeout(1000)
    cq=await pg.evaluate("()=>({clock:S.clock,running})")
    print("pausa",json.dumps(dict(antes=a,pausado4s=bq,retomado1s=cq)));await b.close()
asyncio.run(main())
