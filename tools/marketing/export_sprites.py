# Exporta sprites atuais do jogo (personagens da etapa 6, caldeirão da etapa 3, frutas) para montar capas
import os,asyncio,base64,json
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page()
    await pg.add_init_script("""(()=>{let a=777;Math.random=function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}})()""")
    await pg.goto("file://"+os.path.abspath("index.html"));await pg.wait_for_timeout(800)
    d=await pg.evaluate("""()=>{const out={};
      BASE.forEach((bb,i)=>{out['base_'+i]=fruitImg(baseFruit(bb))});
      const hero=baseFruit(BASE[0]);hero.hero=true;hero.cape="#2d6cdf";out['hero_straw']=fruitImg(hero);
      for(let k=0;k<30;k++){const a=baseFruit(R(BASE)),c=baseFruit(R(BASE));let x=cross(a,c);if(k%3==0)x=cross(x,baseFruit(R(BASE)));out['hy_'+k]=fruitImg(x)}
      out['pot']=potImg();
      S.delivered=24;const kinds={};let g=0;
      while(g<3000){g++;const c=newCust();const key=c.vip?'vip_'+c.name.split(' ')[0]:c.kind+(c.kind=='person'?'_'+c.gen:'');kinds[key]=kinds[key]||[];if(kinds[key].length<3)kinds[key].push(c)}
      for(const [k,arr] of Object.entries(kinds))arr.forEach((c,i)=>{out['ch_'+k+'_'+i]=personImg(c,'happy');out['cho_'+k+'_'+i]=personImg(c,'ok')});
      return out}""")
    n=0
    for k,v in d.items():
      if isinstance(v,str) and v.startswith("data:image"):
        open(f"/tmp/qa9/spr2/{k}.png","wb").write(base64.b64decode(v.split(",")[1]));n+=1
    print(n,sorted(k for k in d if k.startswith('ch_')))
    await b.close()
asyncio.run(main())
