"""Typologie Apur et commerces (BDCOM) par bâtiment."""
import numpy as np
from shapely.geometry import Polygon
from core import *

def run(st):
    g = st.geo(); N = st.N
    TY = {'logement collectif': 1, 'bâtiment mixte': 2, 'batiment tertiaire ou industriel': 3, 'logement individuel': 4, 'Non déterminée': 5}
    F = arcgis('BESOIN_THEORIQUE_CHAUFFAGE_ET_TYPOLOGIE_AU_BATI', 'N_SQ_EB,Typologie_apur', where='N_SQ_EB>=750000000 AND N_SQ_EB<760000000',
               extra='&geometryPrecision=6&maxAllowableOffset=0.00003')
    lon = []; lat = []; cod = []; ar = []
    for f in F:
        try:
            p = Polygon(f['geometry']['rings'][0]).buffer(0); rp = p.representative_point()
            if rp.is_empty: continue
        except Exception: continue
        lon.append(rp.x); lat.append(rp.y); cod.append(TY.get(f['attributes'].get('Typologie_apur'), 5)); ar.append(p.area)
    res = g.locate(np.array(lon), np.array(lat), maxd=3)
    ty = np.zeros(N, np.uint8); best = np.zeros(N)
    for r, c, a in zip(res, cod, ar):
        if r >= 0 and a > best[r]: best[r] = a; ty[r] = c
    log('typologie rattachée :', int((ty > 0).sum()), '/', N)
    B = arcgis('BDCOM_OD', 'NUM,LET,TYPE_VOIE,LIBELLE_VOIE,SITUATION,CODE_ACTIVITE,LIBELLE_ACTIVITE,LIBELLE_REGROUPEMENT_8_POSTES,REGROUPEMENT_8_POSTES,SURFACE,CC_NOM',
               extra='&geometryPrecision=6')
    B = [(f['geometry']['x'], f['geometry']['y'], f['attributes']) for f in B if f.get('geometry')]
    res = g.locate(np.array([b[0] for b in B]), np.array([b[1] for b in B]), maxd=15)
    nc = np.zeros(N, np.uint16); det = collections.defaultdict(list)
    for r, (x, y, a) in zip(res, B):
        if r < 0: continue
        nc[r] += 1
        adr = ('%s%s %s %s' % (a['NUM'] or '', (a['LET'] or '').lower(), (a['TYPE_VOIE'] or '').lower(), (a['LIBELLE_VOIE'] or '').title())).strip()
        det[int(r)].append([a['REGROUPEMENT_8_POSTES'], a['LIBELLE_ACTIVITE'] or '', a['SURFACE'] or '', a['SITUATION'] or '', a['CC_NOM'] or '', adr])
    st.set_arr('k', det); st.put('ty', ty); st.put('nc', nc)
    X = (np.array([b[0] for b in B]) - LON0) * KX; Y = (np.array([b[1] for b in B]) - LAT0) * KY
    st.put_file('ov_com.json', {'k': 'pt', 'f': [[max(0, (a['REGROUPEMENT_8_POSTES'] or 7) - 1), (a['LIBELLE_ACTIVITE'] or '') + (' · ' + a['SURFACE'] if a['SURFACE'] else '') + (' · ' + a['CC_NOM'] if a['CC_NOM'] else ''),
                                                   int(round(x * 10)), int(round(y * 10))] for x, y, (_, _, a) in zip(X, Y, B)]})
    log('commerces :', len(B), 'dont', int(sum(len(v) for v in det.values())), 'rattachés')
