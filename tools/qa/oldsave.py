import asyncio,json
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    ctx=await b.new_context(viewport={'width':1024,'height':600});pg=await ctx.new_page()
    await pg.goto("file:///tmp/qa9/base/index.html");await pg.wait_for_timeout(900)
    await pg.evaluate("()=>{const b=document.querySelector('#modal.on .big');if(b)b.click()}");await pg.wait_for_timeout(2500)
    await pg.evaluate("()=>{S.coins=321;S.delivered=10;S.day=3}");await pg.evaluate("()=>{saveNow?saveNow():save()}");await pg.wait_for_timeout(1500)
    old=await pg.evaluate("()=>localStorage.getItem('frutodromo9')");o=json.loads(old);print('save antigo:',{k:o.get(k) for k in ['coins','delivered','day']},'chaves',len(o),'versao?',o.get('v'))
    await ctx.close()
    ctx=await b.new_context(viewport={'width':1024,'height':600})
    await ctx.add_init_script("if(!sessionStorage.getItem('qa_inj')){localStorage.clear();localStorage.setItem('frutodromo9',"+json.dumps(old)+");sessionStorage.setItem('qa_inj','1')}")
    pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto("file:///tmp/qa9/site/index.html");await pg.wait_for_timeout(1500)
    print('carregado (tela inicial):',await pg.evaluate("()=>JSON.stringify({c:S.coins,d:S.delivered,day:S.day,f:S.fruits.length})"))
    await pg.evaluate("()=>{const b=document.querySelector('#modal.on .big');if(b)b.click()}");await pg.wait_for_timeout(2500)
    print('jogando:',await pg.evaluate("()=>JSON.stringify({c:S.coins,d:S.delivered,day:S.day,f:S.fruits.length,cust:S.cust.filter(Boolean).length,lv:level()})"),errs)
    await b.close()
asyncio.run(main())
