# Teste em WebKit (WebKitGTK via WebDriver, sob Xvfb): carrega, joga o fluxo básico e tira prints.
import sys,json,time
from selenium import webdriver
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.actions.action_builder import ActionBuilder
from selenium.webdriver.common.actions.pointer_input import PointerInput
from selenium.webdriver.common.actions import interaction
URL="file:///tmp/qa9/site/index.html"
OUT=sys.argv[1] if len(sys.argv)>1 else "/tmp/qa9/wk"
SIZES=[(393,760),(1024,600),(900,430),(1280,680)]
import os;os.makedirs(OUT,exist_ok=True)
opts=webdriver.WebKitGTKOptions();opts.binary_location="/usr/bin/MiniBrowser" if os.path.exists("/usr/bin/MiniBrowser") else None
def drv():
    o=webdriver.WebKitGTKOptions()
    o.add_argument("--automation")
    return webdriver.WebKitGTK(options=o)
def js(d,s): return d.execute_script(s)
res={}
d=drv()
try:
  d.get(URL);time.sleep(1.5)
  print("UA:",js(d,"return navigator.userAgent"))
  print("feat:",js(d,"return {zoom:CSS.supports('zoom','0.5'),has:CSS.supports('selector(:has(*))'),dvh:CSS.supports('height','100dvh'),fonts:document.fonts.check('12px \"Pixelify Sans\"'),pe:!!window.PointerEvent}"))
  for W,H in SIZES:
    d.set_window_size(W,H+ (js(d,"return window.outerHeight-window.innerHeight") or 0));time.sleep(.4)
    js(d,"localStorage.clear()");d.get(URL);time.sleep(2)
    iw=js(d,"return [innerWidth,innerHeight]")
    # entra no jogo
    js(d,"var b=document.querySelector('#modal.on .big');if(b)b.click()");time.sleep(1.5)
    st=js(d,"""const q=s=>document.querySelector(s),r=e=>{if(!e)return null;const b=e.getBoundingClientRect();return [Math.round(b.x),Math.round(b.y),Math.round(b.width),Math.round(b.height)]};
      return {fr:document.querySelectorAll('.fr').length,cust:document.querySelectorAll('.cust').length,scene:r(q('#scene')),table:r(q('#table')),market:r(q('#market')),pot:r(q('#pot')),zoom:q('#scene').style.zoom,low:q('#scene').classList.contains('low'),errs:window.__errs,tut:(q('#tut')||{}).className}""")
    d.save_screenshot(f"{OUT}/wk-{W}x{H}-inicio.png")
    # arrasta 2 frutas pro caldeirão com eventos de ponteiro reais (mouse)
    drags=[]
    for i in range(2):
      pos=js(d,"""const f=[...document.querySelectorAll('.fr')].filter(x=>!x.classList.contains('inpot'))[0],p=document.querySelector('#pot');if(!f||!p)return null;const a=f.getBoundingClientRect(),b=p.getBoundingClientRect();return [a.x+a.width/2,a.y+a.height/2,b.x+b.width/2,b.y+b.height/2]""")
      if not pos: drags.append("sem alvo");continue
      ab=ActionBuilder(d,mouse=PointerInput(interaction.POINTER_MOUSE,"mouse"))
      ab.pointer_action.move_to_location(int(pos[0]),int(pos[1])).pointer_down()
      for k in range(1,9): ab.pointer_action.move_to_location(int(pos[0]+(pos[2]-pos[0])*k/8),int(pos[1]+(pos[3]-pos[1])*k/8))
      ab.pointer_action.pointer_up();ab.perform();time.sleep(.6)
      drags.append(js(d,"return (window.S&&S.pot)?S.pot.length:-1"))
    time.sleep(3.5)
    after=js(d,"return {fruits:S.fruits.length,pot:S.pot.length,tree:Object.keys(S.tree||{}).length,errs:window.__errs}")
    d.save_screenshot(f"{OUT}/wk-{W}x{H}-cruzou.png")
    # entrega: arrasta a 1a fruta até o 1o cliente
    pos=js(d,"""const f=document.querySelector('.fr'),c=document.querySelector('.cust .chr')||document.querySelector('.cust');if(!f||!c)return null;const a=f.getBoundingClientRect(),b=c.getBoundingClientRect();return [a.x+a.width/2,a.y+a.height/2,b.x+b.width/2,b.y+b.height/2]""")
    ghost=None
    if pos:
      ab=ActionBuilder(d,mouse=PointerInput(interaction.POINTER_MOUSE,"mouse"))
      ab.pointer_action.move_to_location(int(pos[0]),int(pos[1])).pointer_down()
      for k in range(1,8): ab.pointer_action.move_to_location(int(pos[0]+(pos[2]-pos[0])*k/10),int(pos[1]+(pos[3]-pos[1])*k/10))
      ab.perform()
      ghost=js(d,"const g=document.querySelector('.fr.gh');if(!g)return null;const b=g.getBoundingClientRect();return {w:Math.round(b.width),y:Math.round(b.y),vis:getComputedStyle(g).visibility,hot:document.querySelectorAll('.cust.hot').length}")
      d.save_screenshot(f"{OUT}/wk-{W}x{H}-arraste.png")
      ab=ActionBuilder(d,mouse=PointerInput(interaction.POINTER_MOUSE,"mouse"));ab.pointer_action.move_to_location(int(pos[2]),int(pos[3])).pointer_up();ab.perform();time.sleep(1)
    fin=js(d,"return {fruits:S.fruits.length,coins:S.coins,gh:document.querySelectorAll('.gh,.gsrc').length,errs:window.__errs}")
    # recarrega: save intacto?
    snap=js(d,"save&&save();return JSON.stringify([S.coins,S.fruits.length,Object.keys(S.tree||{}).length])");time.sleep(1.2)
    d.refresh();time.sleep(2)
    snap2=js(d,"return JSON.stringify([S.coins,S.fruits.length,Object.keys(S.tree||{}).length])")
    res[f"{W}x{H}"]=dict(inner=iw,st=st,drags=drags,after=after,ghost=ghost,fin=fin,save=[snap,snap2],errs=js(d,"return window.__errs"))
    print(f"{W}x{H}",json.dumps(res[f'{W}x{H}'],ensure_ascii=False))
finally:
  d.quit()
json.dump(res,open(f"{OUT}/wk.json","w"),ensure_ascii=False,indent=1)
