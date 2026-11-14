# Inglês: procura texto visível que ficou em português (palavras pt comuns e acentos) em vários estados da interface
import asyncio,json,re,sys
from playwright.async_api import async_playwright
U=sys.argv[1] if len(sys.argv)>1 else "file:///tmp/qa9/site/index.html"
PT=r"\b(de|do|da|dos|das|e|o|os|um|uma|com|pra|para|não|nao|seu|sua|que|pode|seguem|receita|cor|tamanho|poderes|estampa|frutas?|cliente|clientes|moedas|nível|dia|caldeirão|feira|bolsa|árvore|ajustes|toque|arraste|aqui|mais|menos|novo|nova|espécie|pedido|dica|só|já|está|são|esse|essa|ele|ela|vai|quando|cada|passo|resultado|tudo|nada|ainda|agora|hoje|amanhã)\b|[ãõçáéíóúâêô]"
STATES=[
 ("inicio","()=>0"),
 ("jogo","()=>{const b=document.querySelector('#modal.on .big');if(b)b.click()}"),
 ("tut","()=>0"),
 ("vip","()=>{S.tut={a:1,b:1,c:1,d:1,e:1,f:1};tutStep&&tutStep();S.delivered=24;const g=[];let k=0;while(g.length<3&&k<3000){k++;const c=newCust();if(c.vip){c.come=false;g.push(c)}}S.cust=g;renderCounter()}"),
 ("dica-sp","()=>{const t=reachPool(9).filter(x=>recipeOf(x).length>=3)[0];const c=S.cust[0];c.tg=rk(t);c.reqs=[{k:'sp',v:spKey(t),im:stImg(t)}];renderCounter();showHint(0)}"),
 ("dica-feira","()=>{closeModal();const t=reachPool(9).find(x=>!x.p);const c=S.cust[0];c.tg=rk(t);c.reqs=[{k:'sp',v:spKey(t),im:stImg(t)}];renderCounter();showHint(0)}"),
 ("dica-attr","()=>{closeModal();const c=S.cust[1];showHint(1)}"),
 ("ajustes","()=>{closeModal();settings()}"),
 ("exportar","()=>{document.getElementById('sexp').click()}"),
 ("importar","()=>{closeModal();settings();document.getElementById('simp').click()}"),
 ("import-erro","()=>{document.getElementById('bk').value='xxx';document.getElementById('bki').click()}"),
 ("arvore","()=>{closeModal();document.getElementById('dexb').click()}"),
 ("pausa","()=>{closeTree&&closeTree();document.getElementById('pauseb').click()}"),
 ("entrega-errada","()=>{closeModal();const c=S.cust[0];c.reqs=[{k:'cor',v:'roxa'},{k:'doceMin',v:8}];const f=S.fruits[0];deliver(f,0,f.x,f.y)}"),
 ("fimdia","()=>{closeModal();endDay()}"),
]
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();found={}
    for W,H in [(1024,600),(390,844)]:
      ctx=await b.new_context(viewport={'width':W,'height':H},locale='en-US');pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
      await pg.goto(U);await pg.wait_for_timeout(1000)
      for name,js in STATES:
        try:await pg.evaluate(js)
        except Exception as e: found.setdefault('_falha_estado',[]).append(name+': '+str(e)[:80]);continue
        await pg.wait_for_timeout(5000 if name=='jogo' else 700)
        txt=await pg.evaluate("""()=>{const out=[];const tw=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;while(n=tw.nextNode()){const el=n.parentElement;if(!el)continue;const r=el.getBoundingClientRect();if(!r.width||getComputedStyle(el).visibility=='hidden'||el.closest('[style*="display:none"],[hidden]'))continue;const t=n.textContent.trim();if(t)out.push(t)}
          for(const e of document.querySelectorAll('[title],[aria-label],textarea,input[placeholder]'))for(const a of ['title','aria-label','placeholder'])if(e.getAttribute(a))out.push('@'+a+':'+e.getAttribute(a));return out}""")
        for t in txt:
          if re.search(PT,t,re.I) and not re.match(r"^FRUTO1:",t):
            found.setdefault(t[:140],set()).add(name)
        if name in ('dica-sp','ajustes','fimdia'):await pg.screenshot(path=f"/tmp/qa9/untr-{name}-{W}.png")
      found.setdefault('_errs',[]).extend(errs);await ctx.close()
    await b.close()
  for k,v in sorted(found.items()):print(repr(k),'->',sorted(v) if isinstance(v,set) else v)
asyncio.run(main())
