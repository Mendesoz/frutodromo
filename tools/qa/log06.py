# LOG-06 no navegador: distribuição de diffTier() no jogo real (candidata), por nível e sequência
import asyncio,json
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={"width":393,"height":760});errs=[]
    pg.on("pageerror",lambda e:errs.append(str(e)))
    await pg.goto("file:///tmp/qa9/site/index.html");await pg.wait_for_timeout(800)
    r=await pg.evaluate("""()=>{const out={};const keep=DIFF.streak;
      for(const L of [3,5,7])for(const s of [-40,-5,-3,0,3,5,40]){DIFF.streak=s;const n=[0,0,0];for(let i=0;i<40000;i++)n[diffTier(L)]++;out[`L${L} s${s}`]=n.map(x=>Math.round(x/400))}
      DIFF.streak=keep;return out}""")
    for k,v in r.items():print(k,v)
    print("errs",errs);await b.close()
asyncio.run(main())
