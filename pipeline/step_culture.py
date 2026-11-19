"""Lieux et équipements culturels (Basilic, ministère de la Culture) et lieux de culte (OpenStreetMap)."""
import io, json, numpy as np, pandas as pd
from core import *
from shapely.geometry import Point
from step_osm_metro import overpass_one, BB

BAS_DS = '61777ddaa9101d073e5506cd'
CL = [('Musées et lieux de mémoire', ('Musée', 'Lieu de mémoire')),
      ('Théâtres, scènes et opéras', ('Théâtre', 'Scène', 'Opéra')),
      ('Cinémas', ('Cinéma',)),
      ('Bibliothèques et archives', ('Bibliothèque', "Service d'archives")),
      ('Librairies', ('Librairie',)),
      ('Conservatoires et centres de création', ('Conservatoire', "Centre d'art", 'Centre de création artistique', 'Centre de création musicale'))]
TY = {t: i for i, (_, ts) in enumerate(CL) for t in ts}

def basilic_url():
    d = get_json('https://www.data.gouv.fr/api/1/datasets/%s/' % BAS_DS)
    rs = [r for r in d['resources'] if (r.get('format') or '').lower() == 'csv']
    rs.sort(key=lambda r: r.get('last_modified') or r.get('created_at') or '', reverse=True)
    return rs[0]['url']

def culture(st):
    df = pd.read_csv(fetch(basilic_url(), 'basilic.csv', min_size=10_000_000), sep=None, engine='python', dtype=str, encoding='utf-8-sig')
    df = df[df.code_insee.fillna('').str.startswith('751') & df['Type équipement ou lieu'].isin(TY)].copy()
    g = st.geo(); F = []; card = {}
    for _, r in df.iterrows():
        try: lo, la = float(r.Longitude), float(r.Latitude)
        except Exception: continue
        t = r['Type équipement ou lieu']; ex = ''
        if t == 'Cinéma' and isinstance(r.Nombre_ecrans, str): ex = ', %s écran%s' % (r.Nombre_ecrans.split('.')[0], 's' if r.Nombre_ecrans.split('.')[0] != '1' else '')
        if t == 'Théâtre' and isinstance(r.Jauge_du_theatre, str): ex = ', jauge %s places' % r.Jauge_du_theatre.split('.')[0]
        lab = '%s (%s%s)' % (str(r.Nom).strip(), t.lower(), ex)
        if isinstance(r['Label et appellation'], str) and r['Label et appellation'].strip(): lab += ' · ' + r['Label et appellation'].strip()
        F.append((proj(Point(lo, la)), {'c': TY[t], 'l': lab}))
        s = int(g.locate([lo], [la])[0])
        if s >= 0: card.setdefault(str(s), []).append(['cult', lab])
    log('  lieux culturels à Paris :', len(F))
    if len(F) < 500: raise RuntimeError('Basilic : trop peu de lieux')
    overlay(st, 'cult', F, 'pt', lambda p: p['c'], lambda p: p['l'])
    st.put_file('cult.json', card)

REL = {'christian': 0, 'jewish': 1, 'muslim': 2, 'buddhist': 3}
DEN = {'catholic': 'catholique', 'roman_catholic': 'catholique', 'protestant': 'protestant', 'reformed': 'réformé', 'lutheran': 'luthérien', 'evangelical': 'évangélique',
       'orthodox': 'orthodoxe', 'russian_orthodox': 'orthodoxe russe', 'greek_orthodox': 'orthodoxe grec', 'armenian_apostolic': 'arménien apostolique', 'anglican': 'anglican', 'baptist': 'baptiste'}
RN = {'christian': 'chrétien', 'jewish': 'juif', 'muslim': 'musulman', 'buddhist': 'bouddhiste', 'hindu': 'hindou', 'sikh': 'sikh', 'taoist': 'taoïste', 'bahai': 'bahá’í'}

def cultes(st):
    q = '[out:json][timeout:150];nwr["amenity"="place_of_worship"](%s);out center tags;' % BB
    E = overpass_one(q, 200); g = st.geo(); F = []; card = {}
    for e in E:
        t = e.get('tags', {}); c = e.get('center') or ({'lat': e['lat'], 'lon': e['lon']} if 'lat' in e else None)
        if not c: continue
        rel = t.get('religion', ''); cls = REL.get(rel, 4)
        if rel == 'christian' and 'catholic' not in t.get('denomination', 'catholic'): cls = 5
        nm = t.get('name') or 'Lieu de culte'
        d = DEN.get(t.get('denomination', ''), '')
        lab = '%s (culte %s%s)' % (nm, RN.get(rel, rel or 'non précisé'), (', ' + d) if d else '')
        F.append((proj(Point(c['lon'], c['lat'])), {'c': cls, 'l': lab}))
        s = int(g.locate([c['lon']], [c['lat']])[0])
        if s >= 0: card.setdefault(str(s), []).append(['culte', lab])
    log('  lieux de culte (OSM) :', len(F))
    overlay(st, 'culte', F, 'pt', lambda p: p['c'], lambda p: p['l'])
    st.put_file('culte.json', card)

def run(st, done=lambda *k: None):
    err = []
    for f, k in ((culture, 'cult'), (cultes, 'culte')):
        try: f(st); done(k)
        except Exception as e: err.append('%s : %s' % (k, str(e)[:200]))
    return err
