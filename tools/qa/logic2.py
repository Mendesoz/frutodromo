# M-03/M-04 (entregas reais e sequências), M-05 (saves), caldeirão real (brew) — Chromium, RNG semeado
import asyncio,json,sys,os
from playwright.async_api import async_playwright
U=sys.argv[1] if len(sys.argv)>1 else "file:///tmp/qa9/site/index.html"
BASEURL=sys.argv[2] if len(sys.argv)>2 else "file:///tmp/qa9/base/index.html"
SEED=20261114
INIT="""(()=>{let a=%d>>>0;Math.random=function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}})()"""%SEED
START="()=>{localStorage.removeItem('frutodromo_difficulty');const b=document.querySelector('#modal.on .big');if(b)b.click();S.tut={a:1,b:1,c:1,d:1,e:1,f:1};tutStep&&tutStep()}"
async def page(b,url=U,init=True):
  ctx=await b.new_context(viewport={'width':1024,'height':600})
  if init:await ctx.add_init_script(INIT)
  pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));await pg.goto(url);await pg.wait_for_timeout(900);return ctx,pg,errs
async def main():
  R={}
  async with async_playwright() as p:
    b=await p.chromium.launch()
    # ---- M-03: 5 entregas erradas ao mesmo cliente e depois a certa (deliver real) ----
    ctx,pg,errs=await page(b);await pg.evaluate(START);await pg.wait_for_timeout(4000)
    R['M03']=await pg.evaluate("""async()=>{DIFF={wins:0,misses:0,streak:0};const st=()=>JSON.parse(JSON.stringify(DIFF));const out=[];
      const morango=baseFruit(BASE.find(b=>b[0]=='Morango')),limao=baseFruit(BASE.find(b=>b[0]=='Limão'));
      const c=S.cust[0];c.reqs=[{k:'cor',v:colorName(morango.rgb)}];c.come=false;renderCounter();S.fruits.push(limao,morango);limao.x=20;limao.y=40;morango.x=120;morango.y=40;renderTable();
      for(let k=0;k<5;k++){deliver(limao,0,20,40);out.push(['erro '+(k+1),st(),S.coins,S.delivered]);await new Promise(r=>setTimeout(r,100))}
      deliver(morango,0,120,40);out.push(['acerto',st(),S.coins,S.delivered]);
      return out}""")
    R['M03errs']=errs;await ctx.close()
    # ---- M-04: sequências longas, limites e pesos ----
    ctx,pg,errs=await page(b);await pg.evaluate(START);await pg.wait_for_timeout(2500)
    R['M04']=await pg.evaluate("""()=>{const o={};DIFF={wins:0,misses:0,streak:0};for(let i=0;i<40;i++)diffRecord(true,{});o.apos40acertos=JSON.parse(JSON.stringify(DIFF));
      for(let i=0;i<40;i++)diffRecord(false,{});o.apos40erros=JSON.parse(JSON.stringify(DIFF));
      const W=L=>L<=4?[.65,.32,.03]:L<=6?[.55,.37,.08]:[.45,.40,.15];o.pesos={};o.prob={};
      for(const L of [1,3,5,7,12])for(const s of [-10,-5,-1,0,1,5,10]){const shift=Math.max(-.15,Math.min(.15,s*.035));const w=W(L);const ww=[w[0]-shift,w[1],w[2]+shift];
        DIFF={wins:0,misses:0,streak:s};const c=[0,0,0];for(let i=0;i<60000;i++)c[diffTier(L)]++;o.prob[L+'/'+s]=c.map(x=>+(x/600).toFixed(1));if(L>2&&ww.some(x=>x<0))o.pesos[L+'/'+s]=ww.map(x=>+x.toFixed(3))}
      return o}""")
    # ---- NOVO JOGO (fluxo real) ----
    await pg.evaluate("()=>{diffRecord(false,{});diffRecord(false,{});save()}");await pg.reload();await pg.wait_for_timeout(1200)
    before=await pg.evaluate("()=>JSON.stringify(DIFF)")
    await pg.evaluate("()=>{const n=document.getElementById('newg');n.click();n.click()}");await pg.wait_for_timeout(800);await pg.reload();await pg.wait_for_timeout(1200)
    R['NovoJogo']=dict(antes=before,depoisRecarga=await pg.evaluate("()=>[JSON.stringify(DIFF),localStorage.getItem('frutodromo_difficulty'),S.delivered,S.coins]"));await ctx.close()
    # ---- M-05: saves ----
    ctx,pg,errs=await page(b);await pg.evaluate(START);await pg.wait_for_timeout(2500)
    await pg.evaluate("()=>{S.coins=777;S.delivered=13;S.day=4;DIFF={wins:4,misses:2,streak:3};localStorage.setItem('frutodromo_difficulty',JSON.stringify(DIFF));saveNow&&saveNow()}")
    snapA=await pg.evaluate("()=>JSON.stringify({c:S.coins,d:S.delivered,day:S.day,f:S.fruits.length,t:Object.keys(S.tree||{}).length})")
    await pg.reload();await pg.wait_for_timeout(1500)
    R['M05local']=dict(antes=snapA,depois=await pg.evaluate("()=>JSON.stringify({c:S.coins,d:S.delivered,day:S.day,f:S.fruits.length,t:Object.keys(S.tree||{}).length})"),diff=await pg.evaluate("()=>JSON.stringify(DIFF)"))
    code=await pg.evaluate("()=>'FRUTO1:'+btoa(unescape(encodeURIComponent(JSON.stringify(S))))")
    await ctx.close()
    # importar em outro aparelho (contexto novo, histórico DIFF diferente)
    ctx,pg,errs=await page(b);await pg.evaluate(START);await pg.wait_for_timeout(2000)
    await pg.evaluate("()=>{DIFF={wins:0,misses:9,streak:-6};localStorage.setItem('frutodromo_difficulty',JSON.stringify(DIFF))}")
    await pg.evaluate("()=>{settings();document.getElementById('simp').click()}");await pg.wait_for_timeout(300)
    await pg.evaluate("(c)=>{document.getElementById('bk').value=c;document.getElementById('bki').click()}",code);await pg.wait_for_timeout(1200)
    R['M05import']=dict(estado=await pg.evaluate("()=>JSON.stringify({c:S.coins,d:S.delivered,day:S.day,f:S.fruits.length,t:Object.keys(S.tree||{}).length})"),diffDoAparelho=await pg.evaluate("()=>JSON.stringify(DIFF)"),toast=await pg.evaluate("()=>(document.querySelector('.toast')||{}).textContent"),errs=errs)
    # código inválido não muda nada
    before=await pg.evaluate("()=>JSON.stringify(S).length")
    await pg.evaluate("()=>{settings();document.getElementById('simp').click()}");await pg.wait_for_timeout(300)
    await pg.evaluate("()=>{document.getElementById('bk').value='FRUTO1:%%%lixo';document.getElementById('bki').click()}");await pg.wait_for_timeout(600)
    R['M05invalido']=dict(igual=before==await pg.evaluate("()=>JSON.stringify(S).length"),toast=await pg.evaluate("()=>(document.querySelector('.toast')||{}).textContent"))
    await ctx.close()
    # save antigo (gerado pela 5cf0d73) carregando na versão atual
    ctx,pg,errs=await page(b,BASEURL,init=False);await pg.evaluate("()=>{const b=document.querySelector('#modal.on .big');if(b)b.click()}");await pg.wait_for_timeout(2500)
    await pg.evaluate("()=>{S.coins=321;S.delivered=10;save&&save()}");await pg.wait_for_timeout(1200)
    old=await pg.evaluate("()=>localStorage.getItem('frutodromo9')");await ctx.close()
    ctx,pg,errs=await page(b)
    await pg.evaluate("(v)=>{localStorage.setItem('frutodromo9',v);localStorage.removeItem('frutodromo_difficulty')}",old);await pg.reload();await pg.wait_for_timeout(1500)
    await pg.evaluate("()=>{const b=document.querySelector('#modal.on .big');if(b)b.click()}");await pg.wait_for_timeout(2500)
    R['M05saveAntigo']=dict(estado=await pg.evaluate("()=>JSON.stringify({c:S.coins,d:S.delivered,f:S.fruits.length,cust:S.cust.filter(Boolean).length})"),diff=await pg.evaluate("()=>JSON.stringify(DIFF)"),errs=errs)
    await ctx.close()
    # ---- caldeirão real: brew() com pais realizados, nível 9 ----
    ctx,pg,errs=await page(b);await pg.evaluate(START);await pg.wait_for_timeout(3000)
    R['brew']=await pg.evaluate("""async()=>{S.delivered=24;const pool=reachPool(9).filter(x=>x.p);const realize=x=>{if(!x.p){const b=BASE.find(b=>b[0]==x.name);return baseFruit(b)}return cross(realize(x.p[0]),realize(x.p[1]))};
      let ok=0,n=0;const bad=[];const ts=pool.sort(()=>Math.random()-.5).slice(0,20);
      for(const t of ts){const a=realize(t.p[0]),c=realize(t.p[1]);S.fruits.push(a,c);S.pot=[a,c];S.fruits=S.fruits.filter(f=>f!==a&&f!==c);const before=new Set(S.fruits.map(f=>f.id));brew();await new Promise(r=>setTimeout(r,1500));
        const kid=S.fruits.find(f=>!before.has(f.id));n++;if(kid&&meets(kid,{k:'sp',v:spKey(t)})&&reqsFrom(t,4,9).every(q=>meets(kid,q)))ok++;else if(bad.length<3)bad.push(stLabel(t));if(S.fruits.length>12)S.fruits=S.fruits.slice(-4)}
      return {n,ok,bad}}""")
    R['brewErrs']=errs;await ctx.close();await b.close()
  print(json.dumps(R,ensure_ascii=False,indent=1));json.dump(R,open("/tmp/qa9/logic2.json","w"),ensure_ascii=False,indent=1)
asyncio.run(main())
