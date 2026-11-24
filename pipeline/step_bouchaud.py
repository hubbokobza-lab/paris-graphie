"""Projets de Bouchaud Architectes à Paris, lus chaque semaine sur bouchaudarchitectes.com (CMS Wix, pages portfolio-general)."""
import html as H, json, re, time, urllib.parse, urllib.request
from core import *
from shapely.geometry import Point

SITE = 'https://www.bouchaudarchitectes.com'
GEO = 'https://data.geopf.fr/geocodage/search?'

def get(u):
    req = urllib.request.Request(u, headers=UA)
    for k in range(3):
        try:
            with urllib.request.urlopen(req, timeout=60) as r: return r.read().decode('utf-8', 'replace')
        except Exception as e:
            err = e; time.sleep(5)
    raise err

def pages():
    idx = get(SITE + '/sitemap.xml')
    sub = [H.unescape(u) for u in re.findall(r'<loc>([^<]+)</loc>', idx) if 'portfolio-general' in u]
    if not sub: raise RuntimeError('sitemap du portfolio introuvable')
    return [H.unescape(u) for u in re.findall(r'<loc>([^<]+)</loc>', get(sub[0]))]

def item(page, url):
    path = urllib.parse.unquote(urllib.parse.urlparse(url).path)
    found = []
    def walk(o):
        if found or not isinstance(o, (dict, list)): return
        if isinstance(o, dict):
            l = o.get('link-portfolio-general-title')
            if isinstance(l, str) and urllib.parse.unquote(l) == path: found.append(o); return
            for v in o.values(): walk(v)
        else:
            for v in o: walk(v)
    for blk in re.findall(r'<script[^>]*type="application/json"[^>]*>(.*?)</script>', page, re.S):
        try: walk(json.loads(blk))
        except Exception: pass
        if found: break
    return found[0] if found else None

def cover(page, it):
    # image de couverture : og:image de la page, sinon première image Wix de la fiche
    m = re.search(r'<meta[^>]+property="og:image"[^>]+content="([^"]+)"', page) or re.search(r'<meta[^>]+content="([^"]+)"[^>]+property="og:image"', page)
    src = m.group(1) if m else ''
    if not src:
        k = re.search(r'wix:image://v1/([^/"#]+)', json.dumps(it))
        src = k.group(1) if k else ''
    k = re.search(r'(?:media/)?([0-9a-z_]+~mv2(?:_[0-9a-z_]+)?\.(?:jpe?g|png|webp|gif))', src, re.I)
    if not k: return src or None
    mid = k.group(1)
    return 'https://static.wixstatic.com/media/%s/v1/fill/w_200,h_300,al_c,q_80,enc_auto/%s' % (mid, mid)

IDF = ('75', '77', '78', '91', '92', '93', '94', '95')
CTX = {'paris': True, 'suf': 'Paris'}   # commune du projet en cours de localisation

def geocode(q, typ=None, cp=None):
    p = {'q': q, 'limit': 1, 'citycode': None}
    p = {'q': q, 'limit': 1}
    if typ: p['type'] = typ
    if cp: p['postcode'] = cp
    try: f = json.loads(get(GEO + urllib.parse.urlencode(p))).get('features') or []
    except Exception: return None
    if not f: return None
    pr = f[0]['properties']
    cc = str(pr.get('citycode', ''))
    if (not cc.startswith('751') if CTX['paris'] else cc[:2] not in IDF) or pr.get('score', 0) < 0.45: return None
    lo, la = f[0]['geometry']['coordinates']; return lo, la, pr

def cp_of(ville):
    m = re.search(r'Paris\s*(\d{1,2})', ville or '')
    if not m: return None
    n = int(m.group(1)); return '750%02d' % n if n != 16 else None

# titres trop courts pour être localisés, précisés par l'agence
ALIAS = {'75 faubourg': '75 Rue du Faubourg Saint-Honoré', '7 petit': '7 Impasse Charles Petit'}

LIEUX = {'la défense': (2.2384, 48.8919)}   # parvis de La Défense

def locate(it):
    """Appartements : un point sur la rue, sans numéro. Autres projets : l'adresse précise (numéro et voie du titre)."""
    t = re.sub(r'\b(19|20)\d\d\b', '', re.sub(r'\s*-\s*Lot\s*\d+', '', it.get('title') or '')).strip()
    ville = re.sub(r'\s+', ' ', (it.get('ville') or '').strip()); cp = cp_of(ville)
    CTX['paris'] = not ville or ville.lower().startswith('paris') or 'Paris intra-muros' in (it.get('arraystring') or [])
    CTX['suf'] = 'Paris' if CTX['paris'] else ville
    CTX['cp'] = cp
    r = place(it, t)
    if r and not (1.44 < r[0] < 3.56 and 48.12 < r[1] < 49.24): r = None   # hors Île-de-France
    if r or CTX['paris']: return r
    if ville.lower() in LIEUX: return LIEUX[ville.lower()] + (ville,)   # lieu-dit qui n'est pas une commune
    m = geocode(ville, 'municipality')                     # hors Paris sans adresse : centre de la commune
    return (m[0], m[1], m[2].get('city')) if m else None

def place(it, t):
    cp = CTX['cp'] if CTX['paris'] else None
    al = ALIAS.get(re.sub(r'\s+', ' ', (it.get('title') or '').strip().lower()))
    if al:
        r = geocode(al + ' ' + CTX['suf'], 'housenumber', cp) or geocode(al + ' ' + CTX['suf'], 'housenumber')
        if r: return r[0], r[1], r[2].get('label')
    appart = 'appartement' in str(it.get('programme1') or '').lower()
    m = re.match(r'^(\d+(?:\s*-\s*\d+)?)\s+(.+)$', t)
    if appart or not m:
        voie = m.group(2) if m else t
        voie = re.sub(r'^(rue|avenue|boulevard|bd|place)\s+(de\s+|du\s+|des\s+)?', '', voie, flags=re.I) if not re.match(r'^(rue|avenue|boulevard)', voie, re.I) else voie
        r = geocode(voie + ' ' + CTX['suf'], 'street', cp) or geocode(voie + ' ' + CTX['suf'], 'street')
        if r is None and not appart:
            a = it.get('address') or {}
            loc = a.get('location') or {}
            if loc.get('latitude'): return loc['longitude'], loc['latitude'], 'adresse du site'
        return (r[0], r[1], r[2].get('street') or r[2].get('name')) if r else None
    num = m.group(1).split('-')[0].strip(); voie = m.group(2)
    r = geocode('%s %s %s' % (num, voie, CTX['suf']), 'housenumber', cp) or geocode('%s %s %s' % (num, voie, CTX['suf']), 'housenumber')
    if r: return r[0], r[1], r[2].get('label')
    loc = (it.get('address') or {}).get('location') or {}      # adresse saisie dans le CMS
    if loc.get('latitude'): return loc['longitude'], loc['latitude'], 'adresse du site'
    r = geocode('%s %s' % (voie, CTX['suf']), 'street', cp) or geocode('%s %s' % (voie, CTX['suf']), 'street')
    return (r[0], r[1], r[2].get('street') or r[2].get('name')) if r else None

def run(st):
    P = pages(); out = []; nok = []; hors = []
    an = int(time.strftime('%Y'))
    for u in P:
        try: page = get(u); it = item(page, u)
        except Exception as e: nok.append(u + ' : ' + str(e)[:60]); continue
        if not it: nok.append(u + ' : fiche introuvable'); continue
        tags = it.get('arraystring') or []
        title = (it.get('title') or '').strip()
        if title.lower().startswith('étude'): continue
        g = locate(it)
        if not g:
            if CTX['paris'] or re.search(r'\b(7[578]|9[1-5])\d{3}\b|hauts-de-seine|seine-saint-denis|val-de-marne|essonne|yvelines|val-d.oise|seine-et-marne', CTX['suf'], re.I): nok.append(title + ' : non localisé')
            else: hors.append('%s (%s)' % (title, CTX['suf'] or '?'))
            continue
        liv = str(it.get('livraison') or '').strip()
        enc = liv.isdigit() and int(liv) > an - 1
        prog = re.sub(r'\s+', ' ', str(it.get('programme1') or '')).strip()
        lab = '%s%s' % (prog, (' (livraison %s)' % liv) if liv else '')
        out.append((proj(Point(g[0], g[1])), {'c': 1 if enc else 0, 'l': lab or title, 'u': u, 't': title, 'im': cover(page, it), 'par': CTX['paris']}))
    bad = []
    for _, p in out:                       # vérifie que chaque vignette s'affiche
        if not p['im']: continue
        try:
            if len(get(p['im'])) < 500: raise ValueError
        except Exception: bad.append(p['t']); p['im'] = None
    if bad: log('  Bouchaud Architectes : vignettes inaccessibles : ' + '; '.join(bad))
    log('  Bouchaud Architectes : %d projets en Île-de-France dont %d à Paris (%d avec image) ; hors Île-de-France ou commune inconnue : %s ; non localisés : %s' % (len(out), sum(1 for _, p in out if p['par']), sum(1 for _, p in out if p['im']), '; '.join(hors) or 'aucun', '; '.join(nok) or 'aucun'))
    if len(out) < 10: raise RuntimeError('trop peu de projets Bouchaud localisés')
    overlay(st, 'boa', out, 'pt', lambda p: p['c'], lambda p: p['l'])
    o = json.loads(gzip.decompress(st.files['ov_boa.json'])); o['u'] = [p['u'] for _, p in out]; o['t'] = [p['t'] for _, p in out]; o['im'] = [p['im'] for _, p in out]; st.put_file('ov_boa.json', o)
