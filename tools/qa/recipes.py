# Runtime QA da etapa 9 (somente leitura do código; roda numa cópia):
#  A) distribuição de profundidade dos pedidos por faixa de nível (newCust, 150 por nível)
#  B) receitas reproduzidas com cross() real a partir das frutas da feira e aceitas por meets() (pedido de espécie e de atributos)
#  C) diffRecord: 1 erro por cliente, 5 acertos/5 erros, NOVO JOGO zera o estado
import asyncio,json,sys
from playwright.async_api import async_playwright
URL=sys.argv[1] if len(sys.argv)>1 else "file:///tmp/qa9/site/index.html"
A="""()=>{const out={};const save=JSON.stringify(S);running=false;
 for(const L of [1,2,3,4,5,6,7,8,9]){S.delivered=(L-1)*3;DIFF={wins:0,misses:0,streak:0};const cnt={},vip={n:0},sp={n:0},rsteps=[];
  for(let i=0;i<150;i++){const c=newCust();cnt[c.td]=(cnt[c.td]||0)+1;if(c.vip)vip.n++;if(c.reqs.some(r=>r.k=='sp'))sp.n++;
    const t=reachPool(L).find(x=>rk(x)==c.tg);if(t)rsteps.push(recipeOf(t).length)}
  const pool=reachPool(L);out[L]={depth:cnt,vip:vip.n,sp:sp.n,maxSteps:Math.max(...rsteps),meanSteps:+(rsteps.reduce((a,b)=>a+b,0)/rsteps.length).toFixed(2),pool:pool.length,maxD:Math.max(...pool.map(x=>x.d))}}
 // adaptação: sequência de 5 erros e de 5 acertos no nível 7
 const ad={};for(const [lab,st] of [["neutro",0],["5 erros",-5],["5 acertos",5]]){S.delivered=18;DIFF={wins:0,misses:0,streak:st};const cnt={};for(let i=0;i<400;i++){const c=newCust();cnt[c.td]=(cnt[c.td]||0)+1}ad[lab]=cnt}
 out.adapt=ad;Object.assign(S,JSON.parse(save));return out}"""
B="""()=>{const realize=x=>{if(!x.p){const b=BASE.find(b=>b[0]==x.name);return baseFruit(b)}return cross(realize(x.p[0]),realize(x.p[1]))};
 const res={};const sid=S.id;
 for(const L of [2,4,6,9]){const pool=reachPool(L);const byD={};
  for(const t of pool){if(!t.p)continue;const k=recipeOf(t).length;(byD[k]=byD[k]||[]).push(t)}
  res[L]={};
  for(const k of Object.keys(byD)){const ts=byD[k].sort(()=>Math.random()-.5).slice(0,25);let spOk=0,attrOk=0,tot=0,bad=[];
   for(const t of ts){for(let r=0;r<8;r++){const f=realize(t);tot++;
     if(meets(f,{k:'sp',v:spKey(t)}))spOk++;else if(bad.length<3)bad.push(stLabel(t)+' -> sp falhou');
     const reqs=reqsFrom(t,3,L);if(reqs.every(q=>meets(f,q)))attrOk++;else if(bad.length<3)bad.push(stLabel(t)+' -> '+JSON.stringify(reqs.filter(q=>!meets(f,q))))}}
   res[L][k+' cruz.']={alvos:ts.length,tentativas:tot,especieOk:+(spOk/tot*100).toFixed(1),atributosOk:+(attrOk/tot*100).toFixed(1),ex:bad}}}
 S.id=sid;return res}"""
C="""()=>{const o={};DIFF={wins:0,misses:0,streak:0};const c={};diffRecord(false,c);diffRecord(false,c);diffRecord(false,c);o.umErroPorCliente=JSON.parse(JSON.stringify(DIFF));
 for(let i=0;i<5;i++)diffRecord(false,{});o.cincoErros=JSON.parse(JSON.stringify(DIFF));for(let i=0;i<5;i++)diffRecord(true,{});o.cincoAcertos=JSON.parse(JSON.stringify(DIFF));
 o.salvoLocal=localStorage.getItem('frutodromo_difficulty');return o}"""
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();ctx=await b.new_context(viewport={'width':1024,'height':600});pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto(URL);await pg.wait_for_timeout(1000);await pg.evaluate("()=>{const b=document.querySelector('#modal.on .big');if(b)b.click();S.tut={a:1,b:1,c:1,d:1,e:1,f:1}}");await pg.wait_for_timeout(1500)
    print("A",json.dumps(await pg.evaluate(A)))
    print("B",json.dumps(await pg.evaluate(B),ensure_ascii=False))
    print("C",json.dumps(await pg.evaluate(C)))
    # NOVO JOGO pelo fluxo real (menu -> NOVO JOGO duas vezes)
    await pg.evaluate("()=>{diffRecord(false,{});diffRecord(false,{})}")
    before=await pg.evaluate("()=>[JSON.stringify(DIFF),localStorage.getItem('frutodromo_difficulty')]")
    await pg.reload();await pg.wait_for_timeout(1500)
    persisted=await pg.evaluate("()=>JSON.stringify(DIFF)")
    ok=await pg.evaluate("()=>{const n=document.getElementById('newg');if(!n)return 'sem botão newg na tela inicial';n.click();n.click();return 'clicado'}")
    if ok!='clicado':
      await pg.evaluate("()=>{const m=document.getElementById('menub');m&&m.click()}");await pg.wait_for_timeout(500)
      ok=await pg.evaluate("()=>{const n=document.getElementById('newg');if(!n)return 'sem botão newg';n.click();n.click();return 'clicado (menu)'}")
    await pg.wait_for_timeout(800)
    after=await pg.evaluate("()=>[JSON.stringify(DIFF),localStorage.getItem('frutodromo_difficulty'),S.coins,S.fruits.length,S.delivered]")
    await pg.reload();await pg.wait_for_timeout(1200)
    after2=await pg.evaluate("()=>[JSON.stringify(DIFF),localStorage.getItem('frutodromo_difficulty')]")
    print("NOVOJOGO",json.dumps(dict(antes=before,aposRecarga=persisted,clique=ok,depois=after,depoisRecarga=after2)))
    print("errs",errs);await b.close()
asyncio.run(main())
