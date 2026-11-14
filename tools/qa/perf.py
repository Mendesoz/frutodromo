import asyncio,sys,json,statistics as st
from playwright.async_api import async_playwright
async def measure(p,url,W,H,dpr,rate):
  b=await p.chromium.launch();ctx=await b.new_context(viewport={'width':W,'height':H},device_scale_factor=dpr,has_touch=True,is_mobile=W<600)
  pg=await ctx.new_page();cdp=await ctx.new_cdp_session(pg)
  await pg.goto(url);await pg.wait_for_timeout(800)
  await pg.evaluate("()=>{const b=document.querySelector('#modal.on .big');if(b)b.click();try{S.tut={a:1,b:1,c:1,d:1,e:1,f:1}}catch(e){}}");await pg.wait_for_timeout(6000)
  await cdp.send("Emulation.setCPUThrottlingRate",{"rate":rate})
  await cdp.send("Performance.enable")
  m0={x['name']:x['value'] for x in (await cdp.send("Performance.getMetrics"))['metrics']}
  idle=await pg.evaluate("""()=>new Promise(r=>{const t=[];let l=performance.now();const lt=[];const po=new PerformanceObserver(l2=>l2.getEntries().forEach(e=>lt.push(e.duration)));try{po.observe({type:'longtask',buffered:false})}catch(e){}
    function f(n){t.push(n-l);l=n;if(t.length<300)requestAnimationFrame(f);else{po.disconnect();r({t,lt})}}requestAnimationFrame(f)})""")
  # arraste contínuo de uma fruta por 3 s
  pos=await pg.evaluate("()=>{const f=document.querySelector('.fr');const a=f.getBoundingClientRect();return [a.x+a.width/2,a.y+a.height/2]}")
  await pg.mouse.move(pos[0],pos[1]);await pg.mouse.down()
  dr=pg.evaluate("""()=>new Promise(r=>{const t=[];let l=performance.now();function f(n){t.push(n-l);l=n;if(t.length<120)requestAnimationFrame(f);else r(t)}requestAnimationFrame(f)})""")
  async def mv():
    for i in range(90):
      await pg.mouse.move(pos[0]+((i*7)%160)-80,pos[1]-((i*5)%120));await pg.wait_for_timeout(16)
  dt,_=await asyncio.gather(dr,mv());await pg.mouse.up()
  m1={x['name']:x['value'] for x in (await cdp.send("Performance.getMetrics"))['metrics']}
  nodes=await pg.evaluate("document.getElementsByTagName('*').length")
  await b.close()
  def s(a):a=sorted(a[5:]);return dict(med=round(st.median(a),1),p95=round(a[int(len(a)*.95)],1),max=round(max(a),1),janky=sum(1 for x in a if x>33.5))
  return dict(idle=s(idle['t']),longtasks=len(idle['lt']),drag=s(dt),layoutMs=round((m1['LayoutDuration']-m0['LayoutDuration'])*1000),styleMs=round((m1['RecalcStyleDuration']-m0['RecalcStyleDuration'])*1000),scriptMs=round((m1['ScriptDuration']-m0['ScriptDuration'])*1000),nodes=nodes)
async def main():
  async with async_playwright() as p:
    for (W,H,dpr) in [(393,760,3),(1280,680,1)]:
      for lab,url in [("base 5cf0d73","file:///tmp/qa9/base/index.html"),("stage9","file:///tmp/qa9/site/index.html")]:
        for k in range(2):
          r=await measure(p,url,W,H,dpr,4);print(f"{W}x{H} {lab} run{k}",json.dumps(r))
asyncio.run(main())
