# WebKit: entrega de verdade (arrasta com ponteiro a fruta que atende um cliente) em 3 tamanhos
import json,time
from selenium import webdriver
from selenium.webdriver.common.actions.action_builder import ActionBuilder
from selenium.webdriver.common.actions.pointer_input import PointerInput
from selenium.webdriver.common.actions import interaction
d=webdriver.WebKitGTK(options=webdriver.WebKitGTKOptions())
FIND="""const fr=[...document.querySelectorAll('#table .fr')];for(let i=0;i<S.cust.length;i++){const c=S.cust[i];if(!c||c.leaving)continue;for(const f of S.fruits){if(c.reqs.every(r=>meets(f,r))){const el=fr.find(e=>e.__f===f)||fr[S.fruits.indexOf(f)];const ce=document.querySelector('.cust[data-i="'+i+'"] .chr')||document.querySelector('.cust[data-i="'+i+'"]');if(!el||!ce)continue;const a=el.getBoundingClientRect(),b=ce.getBoundingClientRect();return [a.x+a.width/2,a.y+a.height/2,b.x+b.width/2,b.y+b.height/2,i]}}}
 // ninguém atendível: compra a fruta pedida pelo 1o cliente (nível 1 pede fruta da feira) e tenta de novo na próxima volta
 return null"""
try:
  for W,H in [(500,800),(500,800),(1024,600)]:
    d.set_window_size(W,H);time.sleep(.3);d.get("file:///tmp/qa9/site/index.html");time.sleep(1.5)
    d.execute_script("localStorage.clear()");d.refresh();time.sleep(1.5)
    d.execute_script("var b=document.querySelector('#modal.on .big');if(b)b.click();S.tut={a:1,b:1,c:1,d:1,e:1,f:1};S.coins=500");time.sleep(5)
    pos=None
    for tries in range(12):
      pos=d.execute_script(FIND)
      if pos:break
      d.execute_script("for(const m of document.querySelectorAll('#market .mk:not(.off):not(.tabk)'))m.click()");time.sleep(.8)
    c0=d.execute_script("return S.coins")
    if pos:
      ab=ActionBuilder(d,mouse=PointerInput(interaction.POINTER_MOUSE,"mouse"))
      ab.pointer_action.move_to_location(int(pos[0]),int(pos[1])).pointer_down()
      for k in range(1,11): ab.pointer_action.move_to_location(int(pos[0]+(pos[2]-pos[0])*k/10),int(pos[1]+(pos[3]-pos[1])*k/10))
      ab.perform();time.sleep(.2)
      mid=d.execute_script("return {hotI:[...document.querySelectorAll('.cust.hot')].map(e=>e.dataset.i),hot:document.querySelectorAll('.cust.hot').length,gh:!!document.querySelector('.fr.gh')}")
      d.save_screenshot(f"/tmp/qa9/wkdel-{W}x{H}.png")
      ab=ActionBuilder(d,mouse=PointerInput(interaction.POINTER_MOUSE,"mouse"));ab.pointer_action.pointer_up();ab.perform();time.sleep(1.2)
    r=d.execute_script("return {toast:(document.querySelector('.toast')||{}).textContent,fr:S.fruits.length,coins:S.coins,delivered:S.delivered,gh:document.querySelectorAll('.gh,.gsrc').length,errs:window.__errs}")
    print(W,H,"alvo",pos and pos[4],"meio",pos and mid,"moedas",c0,"->",r)
finally: d.quit()
