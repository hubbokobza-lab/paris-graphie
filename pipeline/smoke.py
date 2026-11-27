"""Contrôle avant publication : ouvre le site assemblé dans un navigateur sans écran et vérifie qu'il fonctionne.

  python pipeline/smoke.py ../site_neuf

Échec (code 1) si la page lève une erreur JavaScript, si la carte ne se charge pas, si la recherche d'adresse
ou la fiche d'un bâtiment ne répondent pas, ou si la méthodologie est absente. Le robot ne publie alors rien.
"""
import functools, http.server, sys, threading, time

def serve(d):
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    h = functools.partial(Q, directory=d)
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), h)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv

def main(d):
    from playwright.sync_api import sync_playwright
    srv = serve(d); url = 'http://127.0.0.1:%d/' % srv.server_address[1]
    errs, fails = [], []
    def ok(cond, what):
        print(('  ok    ' if cond else '  ÉCHEC ') + what, flush=True)
        if not cond: fails.append(what)
    with sync_playwright() as p:
        b = p.chromium.launch(args=['--use-gl=swiftshader', '--enable-unsafe-swiftshader'])
        for vp, name in (({'width': 1400, 'height': 900}, 'ordinateur'), ({'width': 390, 'height': 844}, 'téléphone')):
            pg = b.new_page(viewport=vp); pg.on('pageerror', lambda e, n=name: errs.append('%s : %s' % (n, e)))
            pg.add_init_script("try{localStorage.setItem('pg_tuto','1')}catch(e){}")
            pg.goto(url, wait_until='load'); t0 = time.time()
            while time.time() - t0 < 60 and not pg.evaluate("!!(window.parisGraphie && document.querySelector('#crit details.lsec'))"): pg.wait_for_timeout(500)
            ok(pg.evaluate("!!document.querySelector('#crit details.lsec')"), '%s : carte et calques chargés' % name)
            ok(pg.evaluate("(window.parisGraphie.sources().methodologie||[]).length>10"), '%s : méthodologie présente' % name)
            pg.fill('#q', '65 bis rue la fayette'); pg.wait_for_timeout(2500); pg.keyboard.press('Enter'); pg.wait_for_timeout(4000)
            ok(pg.evaluate("!document.querySelector('#card').hidden && /La Fayette/i.test(document.querySelector('#card').textContent)"), '%s : recherche d\'adresse et fiche' % name)
            pg.close()
        b.close()
    srv.shutdown()
    for e in errs: print('  erreur JavaScript : ' + e[:300], flush=True)
    if errs or fails:
        print('::error title=Contrôle du site::%d erreur(s) JavaScript, %d contrôle(s) en échec : publication annulée' % (len(errs), len(fails)), flush=True)
        sys.exit(1)
    print('contrôle du site OK', flush=True)

if __name__ == '__main__':
    main(sys.argv[1])
