# PWA: serve o site em http://localhost (contexto seguro), confere registro do SW, cache, recarga offline e instalabilidade
import asyncio,sys,json,subprocess,time
from playwright.async_api import async_playwright
ROOT=sys.argv[1];PORT=int(sys.argv[2]) if len(sys.argv)>2 else 8765
srv=subprocess.Popen(["python3","-m","http.server",str(PORT),"--bind","127.0.0.1"],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
URL=f"http://localhost:{PORT}/index.html"
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();ctx=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=3,is_mobile=True,has_touch=True)
    pg=await ctx.new_page();cdp=await ctx.new_cdp_session(pg)
    await pg.goto(URL);await pg.wait_for_timeout(2500)
    reg=await pg.evaluate("async()=>{if(!navigator.serviceWorker)return 'sem API';const r=await navigator.serviceWorker.getRegistration();return r?{scope:r.scope,active:!!r.active,state:(r.active||r.installing||r.waiting||{}).state}:null}")
    await pg.wait_for_timeout(1500)
    keys=await pg.evaluate("async()=>{const ks=await caches.keys();const o={};for(const k of ks){o[k]=(await (await caches.open(k)).keys()).length}return o}")
    inst=await cdp.send("Page.getInstallabilityErrors")
    man=await cdp.send("Page.getAppManifest")
    # joga um pouco para gerar save, depois offline + recarga
    await pg.evaluate("()=>{const b=document.querySelector('#modal.on .big');if(b)b.click()}");await pg.wait_for_timeout(1500)
    before=await pg.evaluate("()=>{save&&save();return [S.coins,S.fruits.length]}")
    await ctx.set_offline(True)
    ok=True
    try:
      await pg.reload(wait_until="load",timeout=8000);await pg.wait_for_timeout(1500)
      after=await pg.evaluate("()=>[typeof S!='undefined'?S.coins:null,typeof S!='undefined'?S.fruits.length:null,document.fonts.check('12px \"Pixelify Sans\"'),document.title]")
    except Exception as e:
      ok=False;after=str(e)[:120]
    await pg.screenshot(path=f"/tmp/qa9/pwa-offline-{PORT}.png")
    print(json.dumps(dict(sw=reg,caches=keys,installErrors=[e.get('errorId') for e in inst.get('installabilityErrors',[])],manifestErrors=man.get('errors'),offlineReload=ok,before=before,after=after),ensure_ascii=False))
    await b.close()
try: asyncio.run(main())
finally: srv.kill()
