# Exporta sprites e molduras do Frutódromo (gerados por código no jogo) para o protótipo da fazenda.
# Rodar da raiz do repositório:  python3 prototipo-fazenda/tools/export_sprites.py
import os, re, json, asyncio
from playwright.async_api import async_playwright
ROOT = os.path.abspath(".")
async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(); pg = await b.new_page()
    await pg.add_init_script("""(()=>{let a=4242;Math.random=function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}})()""")
    await pg.goto("file://" + os.path.join(ROOT, "index.html")); await pg.wait_for_timeout(900)
    d = await pg.evaluate("""()=>{
      const out={vars:{},fruits:{},hy:[],chars:[],vips:[],deco:{}};
      const st=document.documentElement.style;
      for(let i=0;i<st.length;i++){const k=st[i];if(/^--(f-|tail)/.test(k))out.vars[k]=st.getPropertyValue(k).trim()}
      BASE.forEach(bb=>{out.fruits[bb[0]]=fruitImg(baseFruit(bb))});
      for(let k=0;k<8;k++){const a=baseFruit(R(BASE)),c=baseFruit(R(BASE));out.hy.push(fruitImg(cross(a,c)))}
      out.pot=potImg();
      ['plant','reg','scale','lantern'].forEach(n=>{try{out.deco[n]=decoSpr(n)}catch(e){}});
      S.delivered=40;const seen={};let g=0;
      while(g<4000&&(out.chars.length<22||out.vips.length<6)){g++;const c=newCust();const key=c.vip?'vip_'+c.name:c.kind+(c.kind=='person'?'_'+c.gen:'')+'_'+(seen[c.kind]||0);
        if(c.vip){if(!out.vips.find(v=>v.name==c.name))out.vips.push({name:c.name,kind:c.kind,sheet:charSheet(c).url})}
        else{seen[c.kind]=(seen[c.kind]||0)+1;if(seen[c.kind]<=3&&out.chars.length<22)out.chars.push({name:c.name,kind:c.kind,gen:c.gen||'',sheet:charSheet(c).url})}}
      return out}""")
    pass  # a fonte vem de prototipo-fazenda/fonts (cópia de fonts/ do jogo)
    await b.close()
  dst = os.path.join(ROOT, "prototipo-fazenda/sprites.js")
  open(dst, "w", encoding="utf-8").write("/* gerado por prototipo-fazenda/tools/export_sprites.py a partir do Frutódromo */\nwindow.FZ_SPR=" + json.dumps(d, ensure_ascii=False) + ";\n")
  print("ok", {k: (len(v) if hasattr(v, "__len__") else v) for k, v in d.items() if k != "fontcss"}, "bytes", os.path.getsize(dst))
asyncio.run(main())
