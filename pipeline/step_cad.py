"""Cadastre (Parcellaire Express IGN/DGFiP) : calque des parcelles et parcelles par bâtiment."""
import numpy as np, shapely
from shapely.geometry import shape
from core import *

WFS = ('https://data.geopf.fr/wfs/ows?service=WFS&version=2.0.0&request=GetFeature&typeNames=CADASTRALPARCELS.PARCELLAIRE_EXPRESS:parcelle'
       '&count=5000&startIndex={si}&outputFormat=application/json&bbox={a},{b},{c},{d},urn:ogc:def:crs:EPSG::4326')

def parcelles():
    p = os.path.join(RAW, 'parcelles.json')
    if os.path.exists(p) and time.time() - os.path.getmtime(p) < 20 * 3600: return json.load(open(p))
    P = {}
    for i in range(26):
        for j in range(11):
            lon = 2.22 + i * 0.01; lat = 48.81 + j * 0.01; si = 0
            while True:
                d = get_json(WFS.format(si=si, a=lat, b=lon, c=lat + .01, d=lon + .01), timeout=240)
                for x in d['features']:
                    if x['properties'].get('code_dep') == '75': P[x['properties']['idu']] = x
                if len(d['features']) < 5000: break
                si += 5000
    log('  cadastre :', len(P), 'parcelles')
    if len(P) < 60000: raise RuntimeError('cadastre incomplet')
    L = list(P.values()); json.dump(L, open(p, 'w')); return L

def run(st):
    g = st.geo(); polys, areas, N = g.polys, g.areas, st.N
    feats = []; geo = []
    for x in parcelles():
        gg = proj(shape(x['geometry'])); p = x['properties']
        lab = 'Parcelle %s %s %s, %s m²' % (p['code_arr'], p['section'], p['numero'].lstrip('0'), f"{p['contenance']:,}".replace(',', ' '))
        feats.append((gg, lab)); geo.append((gg, p['idu'], p['contenance']))
    overlay(st, 'cad', feats, 'poly', lambda p: 0, lambda p: p, tol=0.15)
    gs = np.array([x[0] for x in geo], dtype=object); bad = ~shapely.is_valid(gs); gs[bad] = shapely.make_valid(gs[bad])
    bi, pi = shapely.STRtree(gs).query(polys, predicate='intersects')
    inter = shapely.area(shapely.intersection(polys[bi], gs[pi]))
    acc = collections.defaultdict(list)
    for b, p_, a in zip(bi, pi, inter):
        if a > 0.5 and a > 0.05 * areas[b]: acc[int(b)].append((a, p_))
    st.set_arr('c', {b: [[geo[p_][1], int(geo[p_][2])] for a, p_ in sorted(L, reverse=True)[:4]] for b, L in acc.items()})
    log('cadastre : %d bâtiments rattachés' % len(acc))

def voirie(st):
    """Trottoirs, terre-pleins et passages piétons (plan de voirie de la Ville de Paris)."""
    for oid, ds in [('trot', 'plan-de-voirie-trottoirs-emprises'), ('tpl', 'plan-de-voirie-terre-pleins'), ('ppi', 'plan-de-voirie-passages-pietons')]:
        overlay(st, oid, load_geojson(ods(ds)), 'poly', tol=0.15)
