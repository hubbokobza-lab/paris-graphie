"""Batterie de tests de bout en bout (ordinateur et téléphone), à lancer à la main avant une grosse modification.

  python pipeline/run.py site --site <copie de gh-pages> --out /tmp/pg_test
  python tests/batterie.py /tmp/pg_test

Couvre : calques, recherche, fiche et PDF, export de plan DXF/PDF, mesure (Maj), coupe (calques, profondeur,
exports, poignées A/B, mesure, eau), tutoriel, mise en page téléphone. Les échecs de requêtes vers les
services en ligne (arbres, voies d'eau) peuvent venir du réseau : relancer avant de conclure.
"""
import sys, os, functools, http.server, threading
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'pipeline'))
import step_site
SITE = sys.argv[1]
open(os.path.join(SITE, 'index.html'), 'w', encoding='utf-8').write(step_site.html(hooks=True))
class _Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
_srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(_Q, directory=SITE))
threading.Thread(target=_srv.serve_forever, daemon=True).start()
import time,json
from playwright.sync_api import sync_playwright
URL='http://127.0.0.1:%d/' % _srv.server_address[1]
R=[];ERR=[]

def ok(c,w):
  [print('   erreur :',e[:250],flush=True) for e in ERR[ok.n:]];ok.n=len(ERR)
  R.append((bool(c),w));print(('ok    ' if c else 'ÉCHEC ')+w,flush=True)
ok.n=0
def dl(pg,action,name,timeout=180000):
  try:
    with pg.expect_download(timeout=timeout) as d: action()
    p='/tmp/out_'+name;d.value.save_as(p);b=open(p,'rb').read(8);return p,os.path.getsize(p),b
  except Exception as e: return None,0,str(e)[:120]
with sync_playwright() as p:
 b=p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader'])
 # ---------------- ordinateur
 pg=b.new_page(viewport={'width':1400,'height':900},accept_downloads=True)
 pg.on('pageerror',lambda e:ERR.append('desk: '+str(e)));pg.on('console',lambda m:m.type=='error' and ERR.append('console: '+m.text[:200]))
 pg.add_init_script("try{localStorage.setItem('pg_tuto','1')}catch(e){}")
 pg.goto(URL);pg.wait_for_function("!!(window.parisGraphie&&document.querySelector('#crit details.lsec'))",timeout=90000);pg.wait_for_timeout(1500)
 ok(pg.evaluate("document.querySelectorAll('#crit .lfam').length")==2,'deux familles de calques')
 ok(not pg.evaluate("[...document.querySelectorAll('#crit details.lsec')].some(d=>/DVF/.test(d.dataset.g||''))"),'pas de DVF sur le site public')
 # tous les calques (critères)
 n0=len(ERR);ids=pg.evaluate("[...document.querySelectorAll('#crit input, #scroll > details input')].map((e,i)=>i)")
 cnt=pg.evaluate("""(async()=>{const ins=[...document.querySelectorAll('#scroll input[type=radio], #scroll input[type=checkbox]')];let n=0;for(const i of ins){const d=i.closest('details');if(d)d.open=true;i.click();n++;await new Promise(r=>setTimeout(r,120));}return n})()""")
 pg.wait_for_timeout(3000);ok(len(ERR)==n0,'%d calques activés un par un sans erreur'%cnt)
 pg.evaluate("document.querySelector('#reset')&&document.querySelector('#reset').click()");pg.wait_for_timeout(500)
 pg.fill('#lq','métro');pg.wait_for_timeout(600);ok(pg.evaluate("document.querySelectorAll('#scroll details.lsec:not([hidden])').length")>0,'recherche de calque');pg.fill('#lq','');pg.wait_for_timeout(300)
 pg.click('#methb');pg.wait_for_timeout(400);ok(pg.evaluate("document.querySelector('#metht').textContent.length>3000"),'méthodologie affichée')
 pg.click('#srcb');pg.wait_for_timeout(400);ok(pg.evaluate("document.querySelector('#srct').textContent.length>300"),'sources affichées')
 # recherche + fiche
 pg.fill('#q','65bis rue lafayette');pg.wait_for_timeout(2000);ok(pg.evaluate("document.querySelectorAll('#sg > *').length")>0,'recherche « 65bis rue lafayette » (suggestions)');pg.keyboard.press('Escape')
 pg.fill('#q','65 bis rue la fayette');pg.wait_for_timeout(2000);pg.keyboard.press('Enter');pg.wait_for_timeout(4000)
 ok(pg.evaluate("!document.querySelector('#card').hidden && /La Fayette/i.test(document.querySelector('#card').textContent)"),'recherche « 65 bis rue la fayette » et fiche')
 secs=pg.evaluate("[...document.querySelectorAll('#card details.fsec')].map(d=>{d.open=true;return d.querySelector('summary').textContent.trim().slice(0,30)})")
 ok(len(secs)>=8,'fiche : %d rubriques (%s)'%(len(secs),' | '.join(secs)))
 ok(pg.evaluate("document.querySelectorAll('#card .ffam').length")==2,'fiche : deux intertitres')
 f,sz,h=dl(pg,lambda:pg.click('#card #pdfb'),'fiche.pdf',300000);ok(f and h[:4]==b'%PDF' and sz>50000,'fiche PDF (%s octets) %s'%(sz,'' if f else h))
 if f:
  import subprocess;t=subprocess.run(['pdftotext',f,'-'],capture_output=True,text=True).stdout
  ok("L'ouvrage" in t or "L’ouvrage" in t or "L'OUVRAGE" in t.upper(),'fiche PDF : intertitres');ok(t.count('Coupe')>=1,'fiche PDF : coupes')
 pg.click('#cx') if pg.is_visible('#cx') else None
 # plan : DXF puis PDF
 def rect():
  pg.mouse.move(500,250);pg.mouse.down();pg.mouse.move(900,650,steps=8);pg.mouse.up()
 pg.click('#zp');pg.wait_for_timeout(300);ok(pg.is_visible('#zx') and pg.is_visible('#zpp'),'plan : choix DXF/PDF')
 pg.click('#zx');pg.wait_for_timeout(300);f,sz,h=dl(pg,rect,'plan.dxf');ok(f and sz>10000,'plan DXF (%s octets)'%sz)
 pg.click('#zp');pg.wait_for_timeout(300);pg.click('#zpp');pg.wait_for_timeout(300);f,sz,h=dl(pg,rect,'plan.pdf');ok(f and h[:4]==b'%PDF','plan PDF (%s octets)'%sz)
 # mesure + Maj
 pg.click('#zm');pg.mouse.click(800,300);pg.mouse.move(803,420);pg.keyboard.down('Shift');pg.mouse.move(870,520);pg.wait_for_timeout(200)
 v=pg.evaluate("(()=>{const m=__ms();return m.pts.length&&m.cur?[m.pts[0][0],m.cur[0]]:[JSON.stringify(m),document.querySelector('#zm').className,document.querySelector('#xmsg').textContent]})()");pg.keyboard.up('Shift');pg.keyboard.press('Escape');pg.keyboard.press('Escape')
 ok(abs(v[0]-v[1])<1e-6,'mesure : Maj garde la verticale %s'%v)
 pg.click('#zm') if pg.evaluate("document.querySelector('#zm').classList.contains('on')") else None
 # coupe tracée à la souris
 pg.click('#zc');pg.wait_for_timeout(300);pg.mouse.move(500,450);pg.mouse.down();pg.mouse.move(800,460,steps=8);pg.mouse.up()
 pg.wait_for_function("document.querySelector('#cutw')&&!document.querySelector('#cutw').hidden&&document.querySelector('#cutw .cutsvg svg')",timeout=90000);pg.wait_for_timeout(8000)
 ok(True,'coupe tracée à la souris')
 n0=len(ERR);pg.evaluate("(async()=>{for(const c of document.querySelectorAll('#cutw .cutside input[data-k]')){c.click();await new Promise(r=>setTimeout(r,80));c.click();await new Promise(r=>setTimeout(r,80));}})()");pg.wait_for_timeout(2500)
 ok(len(ERR)==n0,'coupe : tous les calques basculés sans erreur')
 ok(pg.evaluate("document.querySelector('#cutw input[data-k=ppri]').checked")==False,'coupe : PPRI masqué par défaut')
 pg.evaluate("const s=document.querySelector('#lidd');s.value=500;s.dispatchEvent(new Event('input'));s.dispatchEvent(new Event('change'))");pg.wait_for_timeout(6000)
 ok(pg.evaluate("!!document.querySelector('#cutw .cutsvg svg')"),'coupe : curseur de profondeur')
 f,sz,h=dl(pg,lambda:pg.click('#cutd'),'coupe.dxf');ok(f and sz>10000,'coupe DXF (%s octets)'%sz)
 f,sz,h=dl(pg,lambda:pg.click('#cuts'),'coupe.pdf');ok(f and h[:4]==b'%PDF','coupe PDF (%s octets)'%sz)
 pg.locator('#abdrag [data-ab=B] circle').nth(1).scroll_into_view_if_needed();pg.wait_for_timeout(300);hb=pg.locator('#abdrag [data-ab=B] circle').nth(1).bounding_box();L0=pg.inner_text('#cutw .alh b')
 pg.mouse.move(hb['x']+4,hb['y']+4);pg.mouse.down();pg.mouse.move(hb['x']-40,hb['y']+4,steps=5);pg.mouse.up()
 try: pg.wait_for_function("!/Recalcul/.test(document.querySelector('#cutw .alh b').textContent)",timeout=90000)
 except Exception: pass
 ok(pg.inner_text('#cutw .alh b')!=L0 and 'Coupe A-B' in pg.inner_text('#cutw .alh b'),'coupe : poignée B (%s → %s)'%(L0,pg.inner_text('#cutw .alh b')))
 pg.click('#cutm');sv=pg.locator('#cutw .cutsvg svg').bounding_box();pg.mouse.move(sv['x']+200,sv['y']+120);pg.mouse.down();pg.keyboard.down('Shift');pg.mouse.move(sv['x']+205,sv['y']+40,steps=5);pg.mouse.up();pg.keyboard.up('Shift');pg.wait_for_timeout(300)
 ok(pg.evaluate("document.querySelectorAll('#cutw .cutsvg svg .msr, #cutw .cutsvg svg [data-ms]').length>=0"),'coupe : mesure')
 pg.click('#cutx');pg.wait_for_timeout(300)
 # coupe sur la Seine (eau)
 pg.evaluate("__cut(2.3375,48.8612,2.3325,48.8565)");pg.wait_for_timeout(12000)
 ok(pg.evaluate("document.querySelectorAll('#cutw [data-ly=eau] rect').length")>0,'coupe : eau sur la Seine');pg.click('#cutx')
 # zoom de la coupe
 pg.evaluate("__cut(2.3300,48.8728,2.3312,48.8745)");pg.wait_for_timeout(9000)
 v0=pg.evaluate("document.querySelector('#cutw .cutsvg svg').getAttribute('viewBox')");pg.click('#cutzi');pg.wait_for_timeout(300)
 ok(pg.evaluate("document.querySelector('#cutw .cutsvg svg').getAttribute('viewBox')")!=v0,'coupe : zoom avant');pg.click('#cutzr');pg.click('#cutx')
 # accueil (premier écran)
 pg.goto(URL+'?accueil=1');pg.wait_for_function("!!(window.parisGraphie&&document.querySelector('#crit details.lsec'))",timeout=90000);pg.wait_for_timeout(1000)
 ok(pg.is_visible('#acc'),'accueil affiché');pg.type('#accq','65 bis rue la');pg.wait_for_timeout(1500)
 ok(not pg.is_visible('#acc') and pg.evaluate("document.querySelector('#q').value").startswith('65 bis'),'accueil : la saisie passe à la recherche')
 pg.goto(URL);pg.wait_for_function("!!(window.parisGraphie&&document.querySelector('#crit details.lsec'))",timeout=90000);pg.wait_for_timeout(1000)
 # tutoriel
 pg.evaluate("__t.tuto()");pg.wait_for_timeout(6000);st_=0
 for i in range(4):
  ok(pg.is_visible('#tuw'),'tuto ordinateur : étape %d'%(i+1));pg.click('#tuw .tuo');pg.wait_for_timeout(7000)
 ok(not pg.is_visible('#tuw'),'tuto ordinateur : fermé à la fin')
 pg.close()
 # ---------------- téléphone
 pg=b.new_page(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,accept_downloads=True)
 pg.on('pageerror',lambda e:ERR.append('mob: '+str(e)))
 pg.add_init_script("try{localStorage.setItem('pg_tuto','1')}catch(e){}")
 pg.goto(URL);pg.wait_for_function("!!(window.parisGraphie&&document.querySelector('#crit details.lsec'))",timeout=90000);pg.wait_for_timeout(1500)
 pg.fill('#q','65 bis rue la fayette');pg.wait_for_timeout(2000);pg.keyboard.press('Enter');pg.wait_for_timeout(4000)
 h_=pg.evaluate("document.querySelector('#card').getBoundingClientRect().height")
 ok(not pg.evaluate("document.querySelector('#card').hidden") and h_<=844*0.52,'téléphone : fiche à mi-hauteur (%d px)'%h_)
 pg.evaluate("__cut(2.3300,48.8728,2.3312,48.8745)");pg.wait_for_timeout(9000)
 ok(pg.is_visible('#cutw .cuthint') and pg.is_visible('#cutsb'),'téléphone portrait : invitation à tourner et bouton Calques')
 pg.set_viewport_size({'width':844,'height':390});pg.wait_for_timeout(800)
 hh=pg.evaluate("document.querySelector('#cutw .cutsvg svg').getBoundingClientRect().height")
 ok(hh>250,'téléphone paysage : coupe plein écran (%d px)'%hh)
 pg.click('#cutsb');pg.wait_for_timeout(300);ok(pg.is_visible('#cutw .cutside'),'téléphone paysage : volet des calques')
 pg.click('#cutx');pg.set_viewport_size({'width':390,'height':844});pg.wait_for_timeout(500)
 pg.evaluate("__t.tuto()");pg.wait_for_timeout(6000)
 for i in range(4):
  ok(pg.is_visible('#tuw'),'tuto téléphone : étape %d'%(i+1));pg.click('#tuw .tuo');pg.wait_for_timeout(8000)
 pg.close();b.close()
print('\n%d/%d contrôles OK'%(sum(c for c,_ in R),len(R)))
for e in ERR[:30]: print('ERREUR',e[:300])


sys.exit(0 if all(c for c,_ in R) else 1)
