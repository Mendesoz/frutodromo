# Volume: pico e RMS (dBFS) de cada efeito, das duas músicas e da chuva, medidos num AnalyserNode antes da saída de áudio
import asyncio,json,sys
from playwright.async_api import async_playwright
U=sys.argv[1] if len(sys.argv)>1 else "file:///tmp/qa9/site/index.html"
INIT="""(()=>{const C=window.AudioContext;if(!C)return;const orig=AudioNode.prototype.connect;
 AudioNode.prototype.connect=function(d,...r){if(d&&d instanceof AudioDestinationNode){const c=d.context;if(!c.__bus){c.__an=c.createAnalyser();c.__an.fftSize=2048;c.__bus=c.createGain();orig.call(c.__bus,c.__an);orig.call(c.__an,d)}return orig.call(this,c.__bus,...r)}return orig.call(this,d,...r)}})()"""
MEAS="""async(ms)=>{const a=AC.__an;if(!a)return null;const buf=new Float32Array(a.fftSize);let peak=0,sum=0,n=0;const t0=performance.now();
 while(performance.now()-t0<ms){a.getFloatTimeDomainData(buf);let s=0;for(const x of buf){const v=Math.abs(x);if(v>peak)peak=v;s+=x*x}const rms=Math.sqrt(s/buf.length);if(rms>0.001){sum+=rms*rms;n++}await new Promise(r=>setTimeout(r,20))}
 const db=x=>x>0?+(20*Math.log10(x)).toFixed(1):-99;return {pico:db(peak),rms:db(n?Math.sqrt(sum/n):0)}}"""
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=["--autoplay-policy=no-user-gesture-required"]);ctx=await b.new_context(viewport={'width':1024,'height':600});await ctx.add_init_script(INIT)
    pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto(U);await pg.wait_for_timeout(900);await pg.mouse.click(500,300);await pg.wait_for_timeout(300)
    await pg.evaluate("()=>{const b=document.querySelector('#modal.on .big');if(b)b.click();S.tut={a:1,b:1,c:1,d:1,e:1,f:1};tutStep&&tutStep();ac();CFG.mus=CFG.mus??60;CFG.sfx=CFG.sfx??80}");await pg.wait_for_timeout(1500)
    info=await pg.evaluate("()=>({state:AC&&AC.state,mus:CFG.mus,sfx:CFG.sfx,muted,names:Object.keys(SFX)})");print(info)
    res={}
    await pg.evaluate("()=>{running=false;ambSet&&ambSet(0)}");await pg.wait_for_timeout(1500)
    for nm in info['names']:
      await pg.evaluate("(n)=>SFX[n]()",nm);r=await pg.evaluate(MEAS,1500);res['efeito '+nm]=r;await pg.wait_for_timeout(300)
    for st in ['chip','lofi']:
      await pg.evaluate("(s)=>{CFG.musStyle=s;running=true;modalOpen=false}",st);r=await pg.evaluate(MEAS,9000);res['música '+st]=r
    await pg.evaluate("()=>{running=false}");await pg.wait_for_timeout(800)
    await pg.evaluate("()=>{CFG.amb=true;ambSet(3)}");await pg.wait_for_timeout(2500);res['chuva forte']=await pg.evaluate(MEAS,3000)
    await pg.evaluate("()=>ambSet(0)")
    for k,v in res.items():print(f"{k:16s} {v}")
    print("config",{k:info[k] for k in ['mus','sfx']},"errs",errs)
    json.dump(dict(cfg=info,res=res),open('/tmp/qa9/audio.json','w'),ensure_ascii=False,indent=1)
    await b.close()
asyncio.run(main())
