"""Îlots de fraîcheur de la Ville de Paris (espaces verts frais et équipements frais). Les calques îlots de chaleur (LCZ Cerema) et canopée (Apur) sont statiques."""
from core import *

CAPGEO = 'https://capgeo2.paris.fr/opendata/rest/services/DEVE/%s/MapServer/0/query'

def capgeo(service, page=1000):
    b = CAPGEO % service
    n = get_json(b + '?where=1%3D1&returnCountOnly=true&f=json')['count']
    feats = []; off = 0
    while off < n:
        r = get_json(b + '?where=1%%3D1&outFields=*&outSR=4326&orderByFields=objectid&resultOffset=%d&resultRecordCount=%d&f=geojson' % (off, page))
        f = r.get('features', [])
        if not f: break
        feats += f; off += len(f)
    log('  Ville de Paris', service, len(feats), '/', n)
    if n == 0 or len(feats) < n * 0.98: raise RuntimeError('%s incomplet' % service)
    return feats

EQ = {'Piscine': 0, 'Baignade extérieure': 0, 'Bains-douches': 0, 'Musée': 1, 'Bibliothèque': 1, "Mairie d'arrondissement": 1, 'Lieux de culte': 1,
      'Brumisateur': 2, 'Ombrière pérenne': 2, 'Ombrière temporaire': 2}

def run(st):
    ev = load_geojson(capgeo('DEVE_Ilots_de_fraicheur_espaces_verts'))
    def c_ev(p):
        v = p.get('p_vegetation_h') or 0
        return 0 if v > .5 else 1 if v >= .25 else 2
    def l_ev(p):
        v = p.get('p_vegetation_h'); o = []
        if v is not None: o.append('%d %% de végétation haute' % round(v * 100))
        if (p.get('ouvert_24h') or '').lower().startswith('oui'): o.append('ouvert 24 h/24')
        elif (p.get('ouverture_estivale_nocturne') or '').lower().startswith('oui'): o.append('ouvert la nuit en été')
        if (p.get('canicule_ouverture') or '').lower().startswith('oui'): o.append('ouvert la nuit en canicule')
        return '%s%s' % (p.get('nom') or 'Espace vert', (' : ' + ', '.join(o)) if o else '')
    overlay(st, 'frais', ev, 'poly', c_ev, l_ev, tol=0.5)
    eq = load_geojson(capgeo('DEVE_Ilots_de_fraicheur_equipements'))
    eq = [(g, p) for g, p in eq if p.get('type') in EQ]
    overlay(st, 'fraiq', eq, 'pt', lambda p: EQ[p['type']], lambda p: '%s : %s%s' % (p['type'], p.get('nom') or '', ' (payant)' if p.get('payant') == 'Oui' else ''))
