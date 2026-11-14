# Modo dica: desligar nos ajustes some com o "?"; persiste ao recarregar e offline (PWA); religar volta
import asyncio,json,subprocess,time
from playwright.async_api import async_playwright
srv=subprocess.Popen(["python3","-m","http.server","8770","--bind","127.0.0.1"],cwd="/tmp/qa9/site",stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
U="http://localhost:8770/index.html"
Q="()=>({hints:document.querySelectorAll('.bub .hint').length,cust:document.querySelectorAll('.cust').length,cfg:String(CFG.hints),sdica:!!document.getElementById('sdica')})"
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();ctx=await b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True);pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto(U);await pg.wait_for_timeout(2500)
    await pg.evaluate("()=>{const b=document.querySelector('#modal.on .big');if(b)b.click();S.tut={a:1,b:1,c:1,d:1,e:1,f:1}}");await pg.wait_for_timeout(5000)
    r={'inicio':await pg.evaluate(Q)}
    await pg.evaluate("()=>settings()");await pg.wait_for_timeout(500)
    print('sdica?',await pg.evaluate("()=>{const t=document.getElementById('sdica');if(!t)return false;t.click();return true}"));await pg.wait_for_timeout(300)
    await pg.evaluate("()=>{const x=document.querySelector('#modal.on .x')||[...document.querySelectorAll('#modal.on .btn,#modal.on .big')].pop();x&&x.click()}");await pg.wait_for_timeout(2200)
    r['desligado']=await pg.evaluate(Q)
    await pg.reload();await pg.wait_for_timeout(2500);await pg.evaluate("()=>{const b=document.querySelector('#modal.on .big');if(b)b.click()}");await pg.wait_for_timeout(2500)
    r['recarga']=await pg.evaluate(Q)
    await ctx.set_offline(True);await pg.reload();await pg.wait_for_timeout(2500);await pg.evaluate("()=>{const b=document.querySelector('#modal.on .big');if(b)b.click()}");await pg.wait_for_timeout(2500)
    r['offline']=await pg.evaluate(Q)
    await pg.evaluate("()=>settings()");await pg.wait_for_timeout(500)
    print('sdica?',await pg.evaluate("()=>{const t=document.getElementById('sdica');if(!t)return false;t.click();return true}"));await pg.wait_for_timeout(300)
    await pg.evaluate("()=>{const x=document.querySelector('#modal.on .x')||[...document.querySelectorAll('#modal.on .btn,#modal.on .big')].pop();x&&x.click()}");await pg.wait_for_timeout(2200)
    r['religado_offline']=await pg.evaluate(Q);r['errs']=errs
    print(json.dumps(r));await b.close()
try: asyncio.run(main())
finally: srv.kill()
