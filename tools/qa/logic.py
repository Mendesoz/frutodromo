# Harness de lógica da etapa 9 no navegador (Chromium), com Math.random semeado (mulberry32).
# Uso: python3 logic.py [URL] [SEED] [N_M02]   — saída JSON em /tmp/qa9/logic-<SEED>.json e prints em /tmp/qa9/logic/
import asyncio,json,sys,os
from playwright.async_api import async_playwright
U=sys.argv[1] if len(sys.argv)>1 else "file:///tmp/qa9/site/index.html"
SEED=int(sys.argv[2]) if len(sys.argv)>2 else 20261114
NM=int(sys.argv[3]) if len(sys.argv)>3 else 10000
os.makedirs("/tmp/qa9/logic",exist_ok=True)
INIT="""(()=>{let a=%d>>>0;Math.random=function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};window.__seed=%d})()"""%(SEED,SEED)
LEVELS=[1,2,3,4,5,7,9,12]
M02="""([L,N])=>{const keep=CH.sheet;CH.sheet=()=>"";const was=running;running=false;const d0=S.delivered;S.delivered=(L-1)*3;const D0=JSON.stringify(DIFF);DIFF={wins:0,misses:0,streak:0};
 const pool=reachPool(L),byK=new Map(pool.map(x=>[rk(x),x]));const steps=x=>recipeOf(x).length;
 const o={N,td:{},tdVip:{},tdNon:{},vip:0,sp:0,nreq:{},minSteps:{},minStepsVip:{},el:0,hero:0,impossible:0,pool:pool.length};
 const memo=new Map();const minFor=reqs=>{const k=JSON.stringify(reqs);if(memo.has(k))return memo.get(k);let m=99;for(const x of pool){if(reqs.every(r=>meets(x,r))){const s=steps(x);if(s<m)m=s;if(m==0)break}}memo.set(k,m);return m};
 for(let i=0;i<N;i++){const c=newCust();const t=byK.get(c.tg);const inc=(m,k)=>m[k]=(m[k]||0)+1;inc(o.td,c.td);inc(c.vip?o.tdVip:o.tdNon,c.td);if(c.vip)o.vip++;
  const isSp=c.reqs.some(r=>r.k=='sp');if(isSp)o.sp++;inc(o.nreq,c.reqs.length);if(c.reqs.some(r=>r.k=='el'))o.el++;if(c.reqs.some(r=>r.k=='hero'))o.hero++;
  if(!t||!c.reqs.every(r=>meets(t,r)))o.impossible++;
  const ms=isSp?steps(t):minFor(c.reqs);inc(o.minSteps,ms);if(c.vip)inc(o.minStepsVip,ms)}
 CH.sheet=keep;running=was;S.delivered=d0;DIFF=JSON.parse(D0);return o}"""
# pesos esperados por diffTier (cópia da fórmula, só para comparar)
M06="""([L,PER,REP])=>{const d0=S.delivered;S.delivered=(L-1)*3;const pool=reachPool(L);
 const realize=x=>{if(!x.p){const b=BASE.find(b=>b[0]==x.name);return baseFruit(b)}return cross(realize(x.p[0]),realize(x.p[1]))};
 const strata={};for(const t of pool){const k=recipeOf(t).length+(t.hero?'H':t.el?'E':'');(strata[k]=strata[k]||[]).push(t)}
 const out={};const sid=S.id;
 for(const k of Object.keys(strata).sort()){const ts=strata[k].sort(()=>Math.random()-.5).slice(0,PER);let n=0,rkOk=0,spOk=0,atOk=0;const bad=[];
  for(const t of ts){for(let r=0;r<REP;r++){const f=realize(t);n++;if(rk(f)==rk(t))rkOk++;
    if(meets(f,{k:'sp',v:spKey(t)}))spOk++;else if(bad.length<4)bad.push('sp '+stLabel(t));
    const reqs=reqsFrom(t,1+(r%4),L);if(reqs.every(q=>meets(f,q)))atOk++;else if(bad.length<4)bad.push(stLabel(t)+' '+JSON.stringify(reqs.filter(q=>!meets(f,q))))}}
  out[k]={alvos:ts.length,n,rk:+(rkOk/n*100).toFixed(1),especie:+(spOk/n*100).toFixed(1),atributos:+(atOk/n*100).toFixed(1),falhas:bad}}
 S.id=sid;S.delivered=d0;return out}"""
# entrega real + dica: monta cliente pedindo o alvo, coloca a fruta realizada na mesa, chama deliver; abre a dica e conta passos
M06D="""([L,PER])=>{S.delivered=(L-1)*3;const pool=reachPool(L).filter(x=>x.p);const realize=x=>{if(!x.p){const b=BASE.find(b=>b[0]==x.name);return baseFruit(b)}return cross(realize(x.p[0]),realize(x.p[1]))};
 const res={entregas:0,pagas:0,dicaPassosOk:0,dicaN:0,ex:[]};const pick=pool.sort(()=>Math.random()-.5).slice(0,PER);
 for(const t of pick){const c=S.cust.find(Boolean);if(!c)break;const i=S.cust.indexOf(c);const sp=Math.random()<.5;c.tg=rk(t);c.td=t.d;c.reqs=sp?[{k:'sp',v:spKey(t),im:stImg(t)}]:reqsFrom(t,3,L);c.mood=null;c.leaving=false;c.come=false;renderCounter();
  // dica
  showHint(i);const steps=document.querySelectorAll('#modal.on .rstep').length;res.dicaN++;const want=recipeOf(t).length;if(steps>=want)res.dicaPassosOk++;else if(res.ex.length<4)res.ex.push('dica '+stLabel(t)+' passos '+steps+'/'+want);closeModal();
  const f=realize(t);f.x=20;f.y=40;S.fruits.push(f);const c0=S.coins,d0=S.delivered;res.entregas++;deliver(f,i,20,40);if(S.delivered==d0+1&&S.coins>c0)res.pagas++;else if(res.ex.length<4)res.ex.push('entrega '+stLabel(t)+' '+JSON.stringify(c.reqs.map(r=>r.k)));
  // novo cliente no lugar (sem esperar a saída)
  S.cust[i]=newCust();S.cust[i].come=false}
 return res}"""
async def main():
  R={'seed':SEED,'url':U}
  async with async_playwright() as p:
    b=await p.chromium.launch();ctx=await b.new_context(viewport={'width':1024,'height':600});await ctx.add_init_script(INIT)
    pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto(U);await pg.wait_for_timeout(900);await pg.evaluate("()=>{localStorage.removeItem('frutodromo_difficulty');const b=document.querySelector('#modal.on .big');if(b)b.click();S.tut={a:1,b:1,c:1,d:1,e:1,f:1};tutStep&&tutStep();S.coins=99999}");await pg.wait_for_timeout(4000)
    print("seed",await pg.evaluate("window.__seed"))
    # pesos esperados (lidos da própria função com DIFF neutro, 200 mil sorteios)
    R['pesosObservadosDiffTier']=await pg.evaluate("""(Ls)=>{const o={};DIFF={wins:0,misses:0,streak:0};for(const L of Ls){const c=[0,0,0];for(let i=0;i<200000;i++)c[diffTier(L)]++;o[L]=c.map(x=>+(x/2000).toFixed(2))}return o}""",LEVELS)
    R['M02']={}
    for L in LEVELS:
      r=await pg.evaluate(M02,[L,NM]);R['M02'][L]=r;print("M02",L,json.dumps({k:r[k] for k in ['td','tdVip','vip','sp','minSteps','impossible','pool']}))
    R['M06']={}
    for L in LEVELS:
      r=await pg.evaluate(M06,[L,30,6]);R['M06'][L]=r;print("M06",L,json.dumps(r,ensure_ascii=False)[:900])
    R['M06entrega']={}
    for L in [2,4,5,9,12]:
      r=await pg.evaluate(M06D,[L,25]);R['M06entrega'][L]=r;print("M06D",L,json.dumps(r,ensure_ascii=False))
    # dica com receita longa e com elemento/herói: prints
    for L,flt,name in [(9,"x=>x.hero","heroi"),(9,"x=>x.el&&!x.hero&&recipeOf(x).length>=3","elemento"),(12,"x=>recipeOf(x).length==5","5passos")]:
      await pg.evaluate("""([L,flt])=>{S.delivered=(L-1)*3;const t=reachPool(L).filter(eval(flt))[0];const c=S.cust.find(Boolean);const i=S.cust.indexOf(c);c.tg=rk(t);c.reqs=[{k:'sp',v:spKey(t),im:stImg(t)}];renderCounter();showHint(i)}""",[L,flt]);await pg.wait_for_timeout(400)
      await pg.screenshot(path=f"/tmp/qa9/logic/dica-{name}.png");await pg.evaluate("()=>closeModal()")
    R['errs']=errs;await b.close()
  json.dump(R,open(f"/tmp/qa9/logic-{SEED}.json","w"),ensure_ascii=False,indent=1);print("errs",errs)
asyncio.run(main())
