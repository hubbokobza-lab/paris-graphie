"""Hébergement touristique : hôtels classés (Atout France), meublés touristiques autorisés (Ville de Paris), densité d'annonces Airbnb (Inside Airbnb)."""
import io, numpy as np, pandas as pd
from core import *
from step_ban import load_ban

AF_URL = 'https://data.classement.atout-france.fr/static/exportHebergementsClasses/hebergements_classes.csv'
IA_PAGE = 'https://insideairbnb.com/get-the-data/'
ABR = {'bd': 'boulevard', 'bld': 'boulevard', 'boul': 'boulevard', 'av': 'avenue', 'ave': 'avenue', 'r': 'rue', 'pl': 'place', 'fg': 'faubourg',
       'fbg': 'faubourg', 'st': 'saint', 'ste': 'sainte', 'qu': 'quai', 'sq': 'square', 'imp': 'impasse', 'pass': 'passage', 'rte': 'route', 'all': 'allee'}
ADR = re.compile(r'^\s*(\d+)\s*(bis|ter|quater|[a-d])?\b[\s,\-]*(.+)$', re.I)

class Geocoder:
    def __init__(self, ban):
        self.k = {}; self.k0 = {}; self.k1 = {}
        for ins, vn, nu, sf, lo, la in zip(ban.commune_insee, ban.vn, ban.numero.astype(int), ban.sfn, ban.long, ban.lat):
            self.k.setdefault((ins, vn, nu, sf), (lo, la)); self.k0.setdefault((ins, vn, nu), (lo, la)); self.k1.setdefault((vn, nu), set()).add((lo, la))
    def __call__(self, adresse, cp=None, ins=None):
        m = ADR.match(str(adresse or ''))
        if not m: return None
        n = int(m.group(1)); sf = SUF.get((m.group(2) or '').lower(), (m.group(2) or '').lower())
        vn = ' '.join(ABR.get(w, w) for w in norm(m.group(3)).split())
        if ins is None and cp:
            cp = str(cp).strip(); ins = '75116' if cp == '75116' else ('751' + cp[-2:] if cp[:3] == '750' else None)
        if ins:
            p = self.k.get((ins, vn, n, sf)) or self.k0.get((ins, vn, n))
            if p: return p
        s = self.k1.get((vn, n))
        return next(iter(s)) if s and len(s) == 1 else None

def hotels(st, geo, card):
    df = pd.read_csv(io.BytesIO(open(fetch(AF_URL, 'hebergements_classes.csv', min_size=500_000), 'rb').read()), sep=';', dtype=str, encoding='utf-8-sig')
    df.columns = [c.strip().upper() for c in df.columns]
    df = df[df['CODE POSTAL'].fillna('').str.strip().str.match(r'^75(0\d\d|116)$')].copy()
    g = st.geo(); feats = []; nok = 0
    TY = lambda t, c: (5 if 'RÉSIDENCE' in t else 6 if 'AUBERGE' in t else 4 if ('5' in c or 'alace' in c) else 3 if '4' in c else 2 if '3' in c else 1 if 'HÔTEL' in t else 6)
    for _, r in df.iterrows():
        p = geo(r['ADRESSE'], r['CODE POSTAL'])
        if p is None: continue
        nok += 1; t = str(r.get('TYPOLOGIE ÉTABLISSEMENT', '')).upper(); c = str(r.get('CLASSEMENT', ''))
        ch = str(r.get('NOMBRE DE CHAMBRES', '') or '').strip(); cap = str(r.get("CAPACITÉ D'ACCUEIL (PERSONNES)", '') or '').strip()
        lab = '%s : %s, %s%s' % (str(r.get('NOM COMMERCIAL', '')).strip().title(), t.capitalize().replace('Hôtel de tourisme', 'hôtel'), c,
                                 (', %s chambres' % ch) if ch not in ('', '-') else (', %s personnes' % cap) if cap not in ('', '-') else '')
        feats.append((shapely_point(p), {'c': TY(t, c) - 1, 'l': lab}))
        s = int(g.locate([p[0]], [p[1]])[0])
        if s >= 0: card.setdefault(s, []).append(['hot', lab])
    log('  hôtels et hébergements classés à Paris :', len(df), 'localisés :', nok)
    if nok < 0.7 * len(df): raise RuntimeError('géocodage des hôtels insuffisant')
    overlay(st, 'hot', [(proj(f), p) for f, p in feats], 'pt', lambda p: p['c'], lambda p: p['l'])

def meubles(st, geo, card):
    df = pd.read_csv(ods('registre-des-autorisations-de-changement-dusage-pour-les-meubles', 'csv', 'chgt_usage_meubles.csv', min_size=5_000), sep=';', dtype=str, encoding='utf-8-sig')
    g = st.geo(); feats = []
    for _, r in df.iterrows():
        p = None
        try: la, lo = [float(x) for x in str(r.get('xy') or '').split(',')]; p = (lo, la)
        except Exception: p = geo(r.get('adresse'), r.get('arrondissement'))
        if p is None: continue
        n = str(r.get('nb_de_logements') or '').strip()
        lab = 'Changement d\'usage autorisé en meublé touristique (%s) : %s%s' % (r.get('annee') or '?', (r.get('adresse') or '').strip(), (', %s logement%s' % (n, 's' if n not in ('1', '') else '')) if n else '')
        feats.append((proj(shapely_point(p)), {'l': lab}))
        s = int(g.locate([p[0]], [p[1]])[0])
        if s >= 0: card.setdefault(s, []).append(['cu', lab])
    log('  changements d\'usage meublés touristiques :', len(df), 'localisés :', len(feats))
    overlay(st, 'cu', feats, 'pt', lambda p: 0, lambda p: p['l'])

def airbnb(st):
    html = urllib.request.urlopen(urllib.request.Request(IA_PAGE, headers=UA), timeout=60).read().decode('utf-8', 'replace')
    u = re.findall(r'https://data\.insideairbnb\.com/france/ile-de-france/paris/(\d{4}-\d{2}-\d{2})/visualisations/listings\.csv', html)
    if not u: raise RuntimeError('lien Inside Airbnb introuvable')
    d = max(u); df = pd.read_csv(fetch('https://data.insideairbnb.com/france/ile-de-france/paris/%s/visualisations/listings.csv' % d, 'airbnb_%s.csv' % d, min_size=1_000_000))
    x = (df.longitude.values - LON0) * KX; y = (df.latitude.values - LAT0) * KY
    C = 250.0; ix = np.floor(x / C).astype(int); iy = np.floor(y / C).astype(int)
    ent = (df.room_type == 'Entire home/apt').values; multi = (df.calculated_host_listings_count.fillna(1) > 1).values
    agg = {}
    for a, b, e, m in zip(ix, iy, ent, multi):
        v = agg.setdefault((a, b), [0, 0, 0]); v[0] += 1; v[1] += e; v[2] += m
    from shapely.geometry import box
    feats = []
    for (a, b), (n, e, m) in agg.items():
        if n < 3: continue      # pas de maille trop peu peuplée : confidentialité et bruit de position
        feats.append((box(a * C, b * C, (a + 1) * C, (b + 1) * C), {'n': n, 'e': e, 'm': m}))
    dd = '%s/%s/%s' % (d[8:10], d[5:7], d[:4])
    cl = lambda p: 0 if p['n'] < 10 else 1 if p['n'] < 30 else 2 if p['n'] < 60 else 3 if p['n'] < 100 else 4
    lab = lambda p: '%d annonces Airbnb dans ce carré de 250 m (%d %% logements entiers, %d %% d\'hôtes à plusieurs annonces), relevé Inside Airbnb du %s' % (p['n'], round(100 * p['e'] / p['n']), round(100 * p['m'] / p['n']), dd)
    log('  Airbnb :', len(df), 'annonces au', d, ',', len(feats), 'mailles')
    overlay(st, 'abnb', feats, 'poly', cl, lab, tol=0)
    return d

def shapely_point(p):
    from shapely.geometry import Point
    return Point(p[0], p[1])

def run(st, ban=None, done=lambda *k: None):
    if ban is None: ban = load_ban()
    geo = Geocoder(ban); card = {}; err = []
    for f, k in ((hotels, 'hot'), (meubles, 'cu')):
        try: f(st, geo, card); done(k)
        except Exception as e: err.append('%s : %s' % (k, str(e)[:200]))
    try: airbnb(st); done('abnb')
    except Exception as e: err.append('abnb : %s' % str(e)[:200])
    st.put_file('tour.json', {str(k): v for k, v in card.items()})
    return err
