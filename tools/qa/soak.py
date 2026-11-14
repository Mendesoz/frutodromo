# Sessão longa (6 min reais): dias passando, clientes chegando/saindo, compra e venda periódicas; mede nós do DOM, heap e listeners de .gh/.toast
import asyncio,json,time
from playwright.async_api import async_playwright
async def m():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=["--enable-precise-memory-info","--js-flags=--expose-gc"]);c=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,is_mobile=True,has_touch=True)
    pg=await c.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto("file:///tmp/qa9/site/index.html");await pg.wait_for_timeout(900)
    await pg.evaluate("()=>{const b=document.querySelector('#modal.on .big');if(b)b.click();S.tut={a:1,b:1,c:1,d:1,e:1,f:1};S.coins=5000}")
    t0=time.time();rows=[]
    while time.time()-t0<360:
      await pg.wait_for_timeout(15000)
      r=await pg.evaluate("""()=>{try{gc&&gc()}catch(e){}
        // passa o dia se o resumo estiver aberto
        const nx=document.getElementById('nextd');if(nx&&nx.offsetParent)nx.click();
        // compra uma fruta e vende a mais antiga, mantendo ~8 na mesa
        const mk=document.querySelector('#market .mk:not(.off):not(.tabk)');if(mk)mk.click();
        return {t:Math.round(performance.now()/1000),nodes:document.getElementsByTagName('*').length,heapMB:performance.memory?Math.round(performance.memory.usedJSHeapSize/1048576*10)/10:null,fr:S.fruits.length,cust:document.querySelectorAll('.cust').length,day:S.day,gh:document.querySelectorAll('.gh').length,toasts:document.querySelectorAll('.toast').length,imgs:document.images.length}}""")
      rows.append(r);print(json.dumps(r),flush=True)
    print("errs",errs);await b.close()
asyncio.run(m())
