# PWA: (1) 1ª abertura online, fecha o navegador, reabre offline (perfil persistente) — 3 ciclos; (2) abertura offline sem nunca ter aberto online
import asyncio,json,subprocess,time,shutil,sys
from playwright.async_api import async_playwright
ROOT=sys.argv[1] if len(sys.argv)>1 else "/tmp/qa9/site";PORT=8781
srv=subprocess.Popen(["python3","-m","http.server",str(PORT),"--bind","127.0.0.1"],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
U=f"http://localhost:{PORT}/"
PROF="/tmp/qa9/pwa-profile"
async def openp(p,offline):
  ctx=await p.chromium.launch_persistent_context(PROF,viewport={'width':390,'height':844},is_mobile=True,has_touch=True,offline=offline)
  pg=ctx.pages[0] if ctx.pages else await ctx.new_page()
  ok=True;info=None
  try:
    await pg.goto(U,timeout=10000);await pg.wait_for_timeout(2500)
    info=await pg.evaluate("async()=>({sw:!!(await navigator.serviceWorker.getRegistration()),ctrl:!!navigator.serviceWorker.controller,S:typeof S!='undefined'?[S.coins,S.fruits.length,S.day]:null,font:document.fonts.check('12px \"Pixelify Sans\"'),caches:(await caches.keys()).join(',')})")
  except Exception as e: ok=False;info=str(e)[:100]
  return ctx,pg,ok,info
async def main():
  shutil.rmtree(PROF,ignore_errors=True);out=[]
  async with async_playwright() as p:
    ctx,pg,ok,info=await openp(p,False);out.append(('online 1a vez',ok,info))
    await pg.evaluate("()=>{const b=document.querySelector('#modal.on .big');if(b)b.click()}");await pg.wait_for_timeout(1500)
    await pg.evaluate("()=>{S.coins=555;saveNow?saveNow():save()}");await pg.wait_for_timeout(800);await ctx.close()
    for k in range(3):
      ctx,pg,ok,info=await openp(p,True);out.append((f'offline reabertura {k+1}',ok,info))
      if ok: await pg.screenshot(path=f"/tmp/qa9/pwa2-offline-{k+1}.png")
      await ctx.close()
    ctx,pg,ok,info=await openp(p,False);out.append(('online de novo',ok,info));await ctx.close()
    shutil.rmtree(PROF,ignore_errors=True)
    ctx,pg,ok,info=await openp(p,True);out.append(('offline sem nunca ter aberto',ok,info));await ctx.close()
  for o in out:print(json.dumps(o,ensure_ascii=False))
try: asyncio.run(main())
finally: srv.kill()
