"""Régénère les aperçus du tutoriel (static/tuto-*.jpg) depuis un site construit avec hooks.
Usage : python3 tests/apercus.py <dossier_site> <dossier_sortie>"""
import sys,os,functools,http.server,threading,subprocess
SITE,OUT=sys.argv[1],sys.argv[2]
class _Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
srv=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(_Q,directory=SITE));threading.Thread(target=srv.serve_forever,daemon=True).start()
URL='http://127.0.0.1:%d/'%srv.server_address[1]
from playwright.sync_api import sync_playwright
def dl(pg,action,name):
  with pg.expect_download(timeout=300000) as d: action()
  p='/tmp/ap/'+name;d.value.save_as(p);return p
def png(pdf,name,page=1,w=1440):
  subprocess.run(['pdftoppm','-png','-r','150','-f',str(page),'-l',str(page),'-scale-to-x',str(w),'-scale-to-y','-1',pdf,'/tmp/ap/'+name],check=True)
  return [f for f in sorted(os.listdir('/tmp/ap')) if f.startswith(name) and f.endswith('.png')][0]
with sync_playwright() as p:
 b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
 pg=b.new_page(viewport={'width':1400,'height':900},accept_downloads=True)
 pg.add_init_script("try{localStorage.setItem('pg_tuto','1')}catch(e){}")
 pg.goto(URL+'?c=per');pg.wait_for_function("!!(window.parisGraphie&&document.querySelector('#crit details.lsec'))",timeout=90000);pg.wait_for_timeout(1500)
 pg.fill('#q','65 bis rue la fayette');pg.wait_for_timeout(2000);pg.keyboard.press('Enter');pg.wait_for_timeout(5000)
 f=dl(pg,lambda:pg.click('#card #pdfb'),'fiche.pdf');print('fiche',png(f,'fiche'))
 pg.evaluate("__t.tuto()")
 for k in range(3):pg.wait_for_timeout(6000);pg.click('#tuw .tuo')
 pg.wait_for_timeout(12000);pg.keyboard.press('Escape');pg.wait_for_timeout(3000)
 pg.click('#cx') if pg.is_visible('#cx') else None;pg.wait_for_timeout(800)
 def rect():
  pg.mouse.move(420,170);pg.mouse.down();pg.mouse.move(1000,780,steps=8);pg.mouse.up()
 pg.click('#zp');pg.wait_for_timeout(300);pg.click('#zpp');pg.wait_for_timeout(300);f=dl(pg,rect,'plan.pdf');print('plan',png(f,'plan'))
 pg.screenshot(path='/tmp/ap/vue.png')
 pg.evaluate("__t.tcut()")
 pg.wait_for_function("document.querySelector('#cutw')&&!document.querySelector('#cutw').hidden&&document.querySelector('#cutw .cutsvg svg')",timeout=90000);pg.wait_for_timeout(15000)
 f=dl(pg,lambda:pg.click('#cuts'),'coupe.pdf');print('coupe',png(f,'coupe'))
 b.close()
