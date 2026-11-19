"""Voies du métro et du RER en tunnel d'après OpenStreetMap (ODbL) : voies principales, voies de service, raccordements, tronçons désaffectés, stations fermées."""
import json, time, urllib.parse, urllib.request
from core import *
from shapely.geometry import LineString, Point

BB = '48.80,2.21,48.91,2.48'
Q = """[out:json][timeout:240];
(way["railway"="subway"](%(b)s);
 way["disused:railway"="subway"](%(b)s); way["abandoned:railway"="subway"](%(b)s); way["construction:railway"="subway"](%(b)s);
 way["railway"~"^(disused|abandoned|construction)$"]["tunnel"](%(b)s);
 way["railway"="rail"]["tunnel"="yes"](%(b)s);
 way["railway"="light_rail"]["tunnel"="yes"](%(b)s););
out tags geom;
(node["station"="subway"]["disused:railway"="station"](%(b)s); node["station"="subway"]["abandoned:railway"="station"](%(b)s);
 node["railway"="station"]["station"="subway"]["disused"="yes"](%(b)s); node["railway"~"^(disused|abandoned)$"]["station"="subway"](%(b)s);
 node["disused:railway"="station"]["subway"="yes"](%(b)s); node["railway"="station"]["station"="subway"]["ghost"="yes"](%(b)s););
out tags;""" % {'b': BB}
EP = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter', 'https://maps.mail.ru/osm/tools/overpass/api/interpreter']

def overpass():
    err = None
    for k in range(6):
        u = EP[k % len(EP)]
        try:
            req = urllib.request.Request(u, data=urllib.parse.urlencode({'data': Q}).encode(), headers=dict(UA, **{'Content-Type': 'application/x-www-form-urlencoded'}))
            with urllib.request.urlopen(req, timeout=300) as r: d = json.loads(r.read())
            if len(d.get('elements', [])) > 500: return d['elements']
            err = 'réponse trop courte (%d éléments)' % len(d.get('elements', []))
        except Exception as e: err = str(e)
        log('  Overpass', u, 'échec :', err[:120]); time.sleep(20)
    raise RuntimeError('Overpass indisponible : %s' % err)

LAB = ['Métro : voie principale', 'Métro : voie de service, garage ou raccordement', 'RER et train en tunnel', 'Voie désaffectée ou abandonnée', 'Voie en construction']

def run(st):
    E = overpass(); W = []; S = []
    for e in E:
        t = e.get('tags', {})
        if e['type'] == 'way' and len(e.get('geometry') or []) >= 2:
            rw = t.get('railway', '')
            if rw in ('disused', 'abandoned') or 'disused:railway' in t or 'abandoned:railway' in t: c = 3
            elif rw == 'construction' or 'construction:railway' in t: c = 4
            elif rw in ('rail', 'light_rail'): c = 2
            elif t.get('service') in ('siding', 'yard', 'spur', 'crossover'): c = 1
            else: c = 0
            pos = 'en tunnel' if t.get('tunnel') in ('yes', 'building_passage') or t.get('layer', '0').startswith('-') else 'en viaduc' if t.get('bridge') else 'en surface'
            nm = t.get('name') or t.get('ref') or ''
            if t.get('service'): nm = (nm + ' ' if nm else '') + {'siding': '(voie de garage)', 'yard': '(faisceau)', 'spur': '(embranchement)', 'crossover': '(communication)'}.get(t['service'], '')
            g = LineString([(p['lon'], p['lat']) for p in e['geometry']])
            W.append((proj(g), {'c': c, 'l': '%s, %s%s' % (LAB[c], pos, (' : ' + nm) if nm else '')}))
        elif e['type'] == 'node':
            S.append((proj(Point(e['lon'], e['lat'])), {'l': 'Station fermée ou jamais ouverte : %s' % (t.get('name') or t.get('old_name') or '?')}))
    log('  OSM métro : %d tronçons, %d stations fermées' % (len(W), len(S)))
    if len(W) < 500: raise RuntimeError('trop peu de voies OSM')
    overlay(st, 'osmm', W, 'line', lambda p: p['c'], lambda p: p['l'], tol=0.5)
    overlay(st, 'osms', S, 'pt', lambda p: 0, lambda p: p['l'])
