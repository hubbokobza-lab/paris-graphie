"""Transports en commun (Île-de-France Mobilités) : lignes ferrées et bus, gares et stations, accès."""
import json
from core import *
from shapely.geometry import box

IDFM = 'https://data.iledefrance-mobilites.fr/api/explore/v2.1/catalog/datasets/%s/exports/geojson'
MODE = {'METRO': 'Métro', 'RER': 'RER', 'TRAIN': 'Train', 'TRAMWAY': 'Tram', 'VAL': 'Val', 'CABLE': 'Câble'}

def idfm(ds, min_size=50_000):
    return json.load(open(fetch(IDFM % ds, 'idfm_%s.geojson' % ds, min_size=min_size)))['features']

def zone():
    a = proj(box(2.2241, 48.8155, 2.4699, 48.9022)); return a.buffer(600)

def nom_ligne(p):
    m = MODE.get(str(p.get('mode') or '').upper(), (p.get('mode') or '').title())
    return ('%s %s' % (m, p.get('indice_lig') or p.get('res_com') or '')).strip()

def run(st):
    Z = zone()
    # lignes ferrées, à la couleur officielle de chaque ligne
    fe = [(g.intersection(Z), p) for g, p in load_geojson(idfm('traces-du-reseau-ferre-idf')) if g is not None and g.intersects(Z)]
    cols = []; ci = {}
    def cl(p):
        c = '#' + str(p.get('colourweb_hexa') or '888888').lstrip('#')
        if c not in ci: ci[c] = len(cols); cols.append(c)
        return ci[c]
    overlay(st, 'tcf', fe, 'line', cl, nom_ligne, tol=1.0)
    o = json.loads(gzip.decompress(st.files['ov_tcf.json'])); o['cols'] = cols; st.put_file('ov_tcf.json', o)
    # bus (tracés GTFS), d'une seule couleur, avec le numéro de ligne
    bu = [(g.intersection(Z), p) for g, p in load_geojson(idfm('traces-des-lignes-de-transport-en-commun-idfm', 500_000))
          if g is not None and str(p.get('route_type')) in ('3', 'Bus') and g.intersects(Z)]
    overlay(st, 'bus', bu, 'line', lambda p: 0, lambda p: 'Bus %s%s' % (p.get('route_short_name') or '', (' : ' + p['route_long_name']) if p.get('route_long_name') else ''), tol=1.5)
    # gares et stations : un point par station, avec toutes ses lignes
    G = {}
    for g, p in load_geojson(idfm('emplacement-des-gares-idf')):
        if g is None or not g.intersects(Z): continue
        k = p.get('id_ref_zdc') or p.get('nom_zdc') or p.get('nom_gares')
        e = G.setdefault(k, {'g': g if g.geom_type == 'Point' else g.centroid, 'n': p.get('nom_zdc') or p.get('nom_gares'), 'l': [], 'm': set()})
        nl = nom_ligne(p)
        if nl not in e['l']: e['l'].append(nl)
        e['m'].add(str(p.get('mode') or '').upper())
    rank = lambda m: 0 if 'METRO' in m else 1 if ('RER' in m or 'TRAIN' in m) else 2
    S = [(e['g'], {'c': min(rank(m) for m in e['m']), 'l': '%s : %s' % (e['n'], ', '.join(sorted(e['l'])))}) for e in G.values()]
    overlay(st, 'gare', S, 'pt', lambda p: p['c'], lambda p: p['l'])
    st.put_file('gares.json', [[round(g.x, 1), round(g.y, 1), p['l']] for g, p in S])
    # accès (entrées et sorties des stations)
    ac = [(g, p) for g, p in load_geojson(idfm('acces')) if g is not None and g.intersects(Z)]
    overlay(st, 'acc', ac, 'pt', lambda p: 0, lambda p: 'Accès : %s' % (p.get('accname') or p.get('accshortname') or ''))
    log('  transports : %d tronçons ferrés, %d tracés de bus, %d stations, %d accès' % (len(fe), len(bu), len(S), len(ac)))
