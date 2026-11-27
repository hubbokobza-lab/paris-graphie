"""Accès statique pour les IA et les scripts : un fichier JSON par voie (api/voies/<slug>.json), un index et llms.txt.
Les indicateurs sont calculés par la page elle-même (même logique que la carte), dans un Chromium sans écran."""
import json, os, re, sys, threading, unicodedata, functools, http.server, time

def slug(s):
    s = unicodedata.normalize('NFD', s.lower()); s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')

DROP = {'Hauteur médiane', 'Hauteur maximale', 'Nombre de niveaux (fichiers fonciers, sinon estimé)'}   # doublons des valeurs chiffrées

def run(site, base='https://paris-graphie.bouchaudarchitectes.com/'):
    from playwright.sync_api import sync_playwright
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    H = functools.partial(Q, directory=site)
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), H); port = srv.server_address[1]
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    d = os.path.join(site, 'api', 'voies'); os.makedirs(d, exist_ok=True)
    idx = []; nb = 0
    with sync_playwright() as p:
        br = p.chromium.launch(args=['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'])
        pg = br.new_page(viewport={'width': 1200, 'height': 800})
        pg.goto('http://127.0.0.1:%d/' % port)
        pg.wait_for_function('window.parisGraphie && document.querySelector("#load").style.display==="none"', timeout=180000)
        for _ in range(30):
            SRCS = pg.evaluate('parisGraphie.sources()')
            if any(x['extrait_le'] for x in SRCS['sources']): break
            time.sleep(1)
        i, step, tot = 0, 400, None
        while tot is None or i < tot:
            r = pg.evaluate('([a,b])=>parisGraphie.dumpStreets(a,b)', [i, i + step]); tot = r['total']
            for v in r['out']:
                if not v['numeros']: continue
                sg = slug(v['voie']); nb += len(v['batiments'])
                K = []
                for r in v['batiments'].values():
                    for k in r:
                        if k not in K and k not in DROP: K.append(k)
                bat = {b: [r.get(k) for k in K] for b, r in v['batiments'].items()}
                json.dump({'voie': v['voie'], 'carte': base, 'sources': base + 'api/sources.json', 'licence': 'données ouvertes (ODbL ou Licence Ouverte selon le producteur), voir sources', 'numeros': v['numeros'], 'champs': K, 'batiments': bat},
                          open(os.path.join(d, sg + '.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
                idx.append([v['voie'], sg])
            i += step
        br.close()
    srv.shutdown()
    json.dump(dict({'maj': time.strftime('%Y-%m-%d')}, **SRCS), open(os.path.join(site, 'api', 'sources.json'), 'w'), ensure_ascii=False, indent=1)
    json.dump({'maj': time.strftime('%Y-%m-%d'), 'sources': base + 'api/sources.json', 'voies': idx}, open(os.path.join(site, 'api', 'voies.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
    open(os.path.join(site, 'llms.txt'), 'w').write(LLMS.replace('{B}', base).replace('{N}', str(len(idx))).replace('{D}', time.strftime('%Y-%m-%d')))
    print('accès IA : %d voies, %d bâtiments' % (len(idx), nb), flush=True)

LLMS = """# Paris-graphie (Bouchaud Architectes)

Outil conçu et édité par Bouchaud Architectes (Paris). Présentation : https://www.bouchaudarchitectes.com/hors-piste/paris-graphie
Contact (anomalie, réclamation, question) : h.bokobza@bouchaudarchitectes.com
API : https://paris-graphie-api.hub-bokobza.workers.dev/ · Code source : https://github.com/hubbokobza-lab/paris-graphie

> Carte des immeubles de Paris intra-muros : âge, hauteur, niveaux, surface de plancher estimée, usages, DPE, patrimoine, PLU, autorisations d'urbanisme, sous-sol. Données ouvertes (Apur, Ville de Paris, BDNB, ADEME, IGN...), mises à jour chaque semaine. Données du {D}.

## API (recommandé)

- {B} est la carte. L'API se trouve à https://paris-graphie-api.hub-bokobza.workers.dev/ :
  /adresse?q=40 rue Laffitte (un immeuble, avec métro et RER à pied), /adresses?q=a|b|c (25 au plus), /voie?nom=rue Laffitte, /sources.
- Serveur MCP pour assistants IA : https://paris-graphie-api.hub-bokobza.workers.dev/mcp (HTTP, outils immeuble_paris, immeubles_paris, sources_paris_graphie).

## Interroger une adresse sans navigateur (fichiers statiques)

1. Index des voies ({N} voies) : {B}api/voies.json, liste de [nom de la voie, identifiant].
2. Fichier d'une voie : {B}api/voies/<identifiant>.json, par exemple {B}api/voies/rue-de-rivoli.json
   L'identifiant est le nom de la voie en minuscules, sans accents, mots séparés par des tirets.
3. Dans ce fichier, "numeros" associe chaque numéro (ex. "12", "12 bis") à un identifiant de bâtiment ; "batiments" donne pour chaque bâtiment la liste des valeurs, dans l'ordre des noms de "champs".

## Interroger une liste d'adresses avec un navigateur

- Ouvrir {B}?adresses=12 rue de Rivoli|3 boulevard Haussmann (adresses séparées par |) : le tableau s'affiche et s'exporte en CSV.
- Ou, dans la page : await window.parisGraphie.analyse(["12 rue de Rivoli", "3 boulevard Haussmann"]) renvoie un tableau d'objets.
- Un bâtiment précis : {B}?b=<longitude>,<latitude>

## Sources

Toutes les sources (producteur, jeu de données, date d'extraction, lien) : {B}api/sources.json

## Précautions

- La surface de plancher est une estimation (emprise × niveaux, moins 20 à 40 %), pas une donnée cadastrale.
- Les rattachements adresse / bâtiment et dossier / bâtiment sont approximatifs. Vérifier sur les sources citées dans la carte.
"""

if __name__ == '__main__':
    run(sys.argv[1])
