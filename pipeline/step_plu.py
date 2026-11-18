"""PLU bioclimatique, patrimoine (Apur), risques, archéologie, mobilité : calques et rattachement aux bâtiments."""
import numpy as np, shapely
from shapely.geometry import Point
from shapely.ops import unary_union
from core import *

PLU = ['plub_zonage', 'plub_hauteur', 'plub_hmc', 'plub_filet', 'plub_fuseau', 'plub_ecm', 'plub_ecm_limite', 'plub_ecbbv', 'plub_isri', 'plub_ebc', 'plub_evp',
       'plub_elpv', 'plub_jpp', 'plub_arbralign', 'plub_arbre', 'plub_srv_mce', 'plub_logsoc', 'plub_equidest', 'plub_sectpart', 'plub_res_logt', 'plub_res_equi',
       'plub_res_voie', 'plub_plocequi', 'plub_eal', 'plub_stcal', 'plub_hebtour', 'plub_pai', 'plub_pepent', 'plub_agri', 'plub_protcom', 'plub_batchtdest',
       'plub_surf_pvp', 'plub_epp', 'plub_ps', 'plub_batmodrn', 'plub_vec', 'plub_gdmag', 'plub_carriere', 'plub_gypse', 'plub_pprizone', 'plub_pvp', 'plub_pvp_geos']

def mobility():
    base = 'https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/'
    q = lambda s: get_json(base + s.replace(' ', '%20'))
    rows = q('comptage-multimodal-comptages/records?select=id_site,mode,avg(nb_usagers) as m,count(*) as n&group_by=id_site,mode&limit=20000')['results']
    sites = {}
    for r in json.load(open(fetch(base + "comptage-multimodal-comptages/exports/json?select=id_site,label,voie,coordonnees_geo&where=t%3E%3Dnow(days%3D-3)", 'multimodal_sites.json'))):
        c = r.get('coordonnees_geo')
        if c and r['id_site'] not in sites: sites[r['id_site']] = [r.get('label') or '', r.get('voie') or '', c['lon'], c['lat']]
    vr = q('comptage-velo-donnees-compteurs/records?select=id_compteur,nom_compteur,avg(sum_counts) as m,count(*) as n&group_by=id_compteur,nom_compteur&limit=20000')['results']
    agg = {}
    for r in vr:
        i = int(str(r['id_compteur']).split('-')[0]); nm = re.sub(r'\s+[NSEO]{1,2}-[NSEO]{1,2}$', '', r['nom_compteur'] or '')
        a = agg.setdefault(i, {'id': i, 'name': nm, 'm': 0.0, 'n': 0}); a['m'] += r['m'] or 0; a['n'] = max(a['n'], r['n'] or 0)
    coords = {}
    for r in json.load(open(fetch(base + 'comptage-velo-compteurs/exports/json', 'velo_compteurs.json'))):
        c = r.get('coordinates')
        if c: coords[str(r['id'])] = [c['lon'], c['lat']]
    return {'rows': rows, 'sites': sites}, {'rows': list(agg.values()), 'coords': coords}

def run(st):
    g = st.geo(); polys, areas, rp, N = g.polys, g.areas, g.rp, st.N
    allb = shapely.total_bounds(polys); BB = shapely.box(allb[0] - 400, allb[1] - 400, allb[2] + 400, allb[3] + 400)
    L = {d: load_geojson(ods(d)) for d in PLU}
    log('PLU :', sum(len(v) for v in L.values()), 'objets')
    E = lambda *a, **k: overlay(st, *a, bbox=BB, **k)
    G = {}
    z = L['plub_zonage']; G['zonage'] = z
    ZC = {'UG': 0, 'UGSU': 1, 'UV': 2, 'N': 3, 'PSMV7': 4, 'PSMVM': 4, 'SENAT': 5}
    E('zonage', z, 'poly', lambda p: ZC.get(p['zone'], 5), tol=1.0)
    G['hauteur'] = L['plub_hauteur']; HC = {18: 0, 25: 1, 31: 2, 37: 3}
    E('hauteur', L['plub_hauteur'], 'poly', lambda p: HC.get(int(p['hauteur']), 4), tol=1.0)
    E('hmc', L['plub_hmc'], 'poly', lambda p: 0, lambda p: 'Hauteur max constructible : %.0f m NGF' % p['ht_hmc'], tol=0.5)
    fc = {'B': 0, 'N': 1, 'P': 2, 'G': 3, 'M': 4, 'V': 5, 'K': 6, 'O': 7}
    E('filet', L['plub_filet'], 'line', lambda p: fc.get(p['haut'], 8), tol=0.4)
    E('fuseau', L['plub_fuseau'], 'poly', lambda p: 0, lambda p: 'Fuseau %s : %.1f à %.1f m NGF' % (p['fuseau'], float(p['h_min']), float(p['h_max'])), tol=1.0)
    E('ecm', L['plub_ecm'], 'poly', lambda p: 0 if (p['hauteur'] or 0) == 0 else 1, lambda p: ('Hauteur max %.1f m' % p['hauteur']) if p['hauteur'] else 0, tol=0.2)
    E('ecml', L['plub_ecm_limite'], 'line', tol=0.2); E('ecbbv', L['plub_ecbbv'], 'poly', tol=0.2); E('isri', L['plub_isri'], 'line', tol=0.2)
    E('ebc', L['plub_ebc'], 'poly', tol=0.5); E('evp', L['plub_evp'], 'poly', tol=0.3); E('elpv', L['plub_elpv'], 'poly', tol=0.3); E('jpp', L['plub_jpp'], 'poly', tol=0.3)
    E('arbal', L['plub_arbralign'], 'line', tol=0.5)
    E('arbre', L['plub_arbre'], 'pt', lambda p: 0, lambda p: '%s (%s)' % (p['a08_nom_us'], (p['a08_adr'] or '')[:50]))
    E('mce', L['plub_srv_mce'], 'poly', tol=1.0)
    LZ = {'ZDLS': 0, 'ZNDLS': 1, 'ZHDLS': 2}
    E('logsoc', L['plub_logsoc'], 'poly', lambda p: LZ.get(p['type_zls'], 0), tol=1.5); E('equidest', L['plub_equidest'], 'poly', tol=1.5)
    SPC = {'SMV': 0, 'SDP': 1, 'SOA': 2}
    E('sectpart', L['plub_sectpart'], 'poly', lambda p: SPC.get(p['type_sp'], 0), lambda p: p['texte_sp'] or 0, tol=1.0)
    E('resl', L['plub_res_logt'], 'poly', lambda p: 0, lambda p: 'Réserve logement %s : %s' % (p['typeres'], (p['a05_adr'] or '')[:70]), tol=0.4)
    E('rese', L['plub_res_equi'], 'poly', lambda p: 0, lambda p: ('Réserve équipement : %s' % (p['a03_dest'] or ''))[:80], tol=0.4)
    E('resv', L['plub_res_voie'], 'poly', lambda p: 0, lambda p: 'Réserve voie : %s' % (p['a03_adr'] or ''), tol=0.4)
    E('ploc', L['plub_plocequi'], 'poly', lambda p: 0, lambda p: '%s : %s' % (p['perimetre'], (p['a04_dest'] or '')[:70]), tol=0.4)
    E('eal', L['plub_eal'], 'poly', tol=0.3); E('stcal', L['plub_stcal'], 'poly', tol=0.5); E('hebt', L['plub_hebtour'], 'poly', tol=1.5)
    E('pai', L['plub_pai'], 'pt', lambda p: 0, lambda p: 'Activités productives urbaines protégées')
    E('pepe', L['plub_pepent'], 'pt', lambda p: 0, lambda p: 'Incubateur / pépinière protégé')
    E('agri', L['plub_agri'], 'pt', lambda p: 0, lambda p: 'Agriculture urbaine : %s (%s)' % (p['a07_loc'], p['a07_surf']))
    E('protcom', L['plub_protcom'], 'line', tol=0.3); E('batch', L['plub_batchtdest'], 'poly', tol=0.3)
    G['pvp'] = L['plub_surf_pvp']; E('pvp', L['plub_surf_pvp'], 'poly', tol=0.2)
    E('epp', L['plub_epp'], 'pt', lambda p: 0, lambda p: 'Élément particulier protégé')
    E('ps', L['plub_ps'], 'pt', lambda p: 0, lambda p: 'Parcelle signalée pour son intérêt patrimonial')
    G['bm'] = L['plub_batmodrn']; E('batmod', L['plub_batmodrn'], 'poly', tol=0.3)
    G['vec'] = L['plub_vec']; E('vec', L['plub_vec'], 'poly', tol=0.3); E('gdmag', L['plub_gdmag'], 'poly', tol=0.3)
    # monuments historiques et périmètres (Apur)
    mh = [(gg, p) for gg, p in load_geojson(arcgis_geojson('PATRIMOINE_IMMEUBLE_PROTEGE')) if p['C_IMP_NIV2'] != 'PLU']; G['mh'] = mh
    E('mh', mh, 'poly', lambda p: {'MH': 0, 'ACR': 1, 'ACRR': 1}.get(p['C_IMP_NIV2'], 2),
      lambda p: '%s%s%s' % (p['L_IMP'] or 'Immeuble protégé', (' (protégé en %s)' % p['AN_PROT']) if p['AN_PROT'] else '', (' · Mérimée ' + p['C_MERIMEE']) if p['C_MERIMEE'] else ''), tol=0.3)
    pp = load_geojson(arcgis_geojson('PATRIMOINE_PERIMETRE_PROTECTION')); G['pp'] = pp
    PPN = {'MH': 0, 'ACR': 0, 'ACRR': 0, 'SPR': 1, 'SC': 2, 'SI': 3, 'CJI': 4, 'CJ': 4, 'BU': 4, 'ZT': 4}
    byc = collections.defaultdict(list)
    for gg, p in pp: byc[PPN.get(p['C_PP_NIV2'], 4)].append(gg)
    E('pp', [(unary_union(v).buffer(0), {'c': k}) for k, v in sorted(byc.items())], 'poly', lambda p: p['c'], tol=1.5)
    # sous-sol et risques
    car, gyp, ri = L['plub_carriere'], L['plub_gypse'], L['plub_pprizone']
    E('carr', car, 'poly', tol=1.0); E('gyps', gyp, 'poly', tol=1.0)
    RC = {'BC': 0, 'BCH': 1, 'BS': 2, 'BSH': 3, 'R': 4, 'V': 5}
    E('ppri', ri, 'poly', lambda p: RC.get(p['zonage'], 5), tol=0.8)
    # archéologie
    ar = json.load(open(ods('referentiel-archeologique-de-paris', 'json', 'archeo.json')))
    PER = [('prehistoire', 'Préhistoire'), ('protohistoire', 'Protohistoire'), ('antiquite', 'Antiquité'), ('moyen_age', 'Moyen Âge'), ('temps_modernes', 'Temps modernes'), ('epoque_contemporaine', 'Époque contemporaine')]
    arp = []
    for a in ar:
        gp = a.get('geo_point_2d')
        if not gp: continue
        arp.append((Point((gp['lon'] - LON0) * KX, (gp['lat'] - LAT0) * KY), {'adr': a.get('adresse') or '', 'dt': a.get('date_operation') or '', 'nat': a.get('nature_operation') or '',
                    'syn': a.get('synthese') or '', 'per': [i for i, (k, _) in enumerate(PER) if a.get(k) == 'Oui']}))
    E('archeo', arp, 'pt', lambda p: (p['per'][0] if p['per'] else 6), lambda p: '%s%s%s' % (p['adr'], (' · ' + str(p['dt'])) if p['dt'] else '', (' · ' + ', '.join(PER[i][1] for i in p['per'])) if p['per'] else ''))
    # mobilité (comptages) : en cas d'échec, on garde le calque précédent
    try:
        mm, vl = mobility()
        MODE = {'Vélos': 'vélos', 'Trottinettes': 'trottinettes', '2 roues motorisées': '2RM', 'Véhicules légers': 'voitures', 'Poids lourds': 'poids lourds', 'Autobus et autocars': 'bus et cars'}
        per = {}
        for r in mm['rows']:
            if r['mode'] and r['m'] is not None and r['id_site'] in mm['sites']: per.setdefault(r['id_site'], {})[r['mode']] = r['m'] * 24
        mob = [(Point((mm['sites'][s][2] - LON0) * KX, (mm['sites'][s][3] - LAT0) * KY), {'name': mm['sites'][s][0], 'd': d}) for s, d in per.items()]
        for r in vl['rows']:
            c = vl['coords'].get(str(r['id']))
            if c and r['m'] is not None: mob.append((Point((c[0] - LON0) * KX, (c[1] - LAT0) * KY), {'name': r['name'], 'd': {'Vélos': r['m'] * 24}}))
        def mobprop(p):
            s = ' · '.join('%s ≈ %s/j' % (MODE.get(k, k), format(int(round(v)), ',').replace(',', ' ')) for k, v in sorted(p['d'].items(), key=lambda kv: -kv[1]) if v >= 1)
            return '%s : %s' % (p['name'], s or 'pas de comptage')
        def mobcls(p):
            v = p['d'].get('Vélos', 0); return 0 if v < 500 else 1 if v < 1500 else 2 if v < 4000 else 3
        E('mob', mob, 'pt', mobcls, mobprop)
    except Exception as e:
        log('  mobilité non mise à jour :', e)
    # ---------------- rattachement aux bâtiments
    def inside_idx(geoms):
        t = shapely.STRtree(geoms); r = np.full(N, -1, int); pi, gj = t.query(rp, predicate='within'); r[pi] = gj; return r
    def overlap(geoms, minr=0.25):
        t = shapely.STRtree(geoms); bi, gj = t.query(polys, predicate='intersects')
        inter = shapely.area(shapely.intersection(polys[bi], np.array(geoms, dtype=object)[gj]))
        ok = inter >= np.minimum(minr * areas[bi], 25); d = collections.defaultdict(list)
        for b, gg in zip(bi[ok], gj[ok]): d[int(b)].append(int(gg))
        return d
    arr_ = lambda lst: np.array([gg for gg, p in lst], dtype=object)
    zi = inside_idx(arr_(G['zonage']))
    ZC2 = {'UG': 1, 'UGSU': 2, 'UV': 3, 'N': 4, 'PSMV7': 5, 'PSMVM': 5, 'SENAT': 6}
    zo = np.array([ZC2.get(G['zonage'][i][1]['zone'], 6) if i >= 0 else 0 for i in zi], np.uint8)
    hi = inside_idx(arr_(G['hauteur']))
    hp = np.array([int(G['hauteur'][i][1]['hauteur']) if i >= 0 else 0 for i in hi], np.uint8); hp[(hp == 0) & (zo == 5)] = 25
    pf = np.zeros(N, np.uint16); det = collections.defaultdict(dict)
    for b, l in overlap(arr_(mh)).items():
        for gg in l:
            p = mh[gg][1]; pf[b] |= 1 if p['C_IMP_NIV2'] == 'MH' else 2
            det[b].setdefault('mh', []).append([p['L_IMP'] or '', p['AN_PROT'] or 0, p['C_MERIMEE'] or '', p['C_IMP_NIV2'] or ''])
    m1 = {x['properties']['n_sq_spvp']: (x['properties']['n_sq_ca'], x['properties']['num_pvp']) for x in json.load(open(os.path.join(RAW, 'plub_pvp_geos.geojson')))['features']}
    m2 = {(x['properties']['num_ca'], x['properties']['num_pvp']): x['properties'] for x in json.load(open(os.path.join(RAW, 'plub_pvp.geojson')))['features']}
    TYP = {'BP': 'Bâtiment protégé', 'EPP': 'Élément particulier protégé', 'BP et EPP': 'Bâtiment et élément particulier protégés'}
    for b, l in overlap(arr_(G['pvp'])).items():
        pf[b] |= 4
        for gg in l[:3]:
            p = G['pvp'][gg][1]; k = m1.get(p['n_sq_spvp']); t = m2.get(k) if k else None
            if t: det[b].setdefault('pl', []).append([TYP.get(t['typ_prot'], t['typ_prot']), (t['motiv_txt'] or ''), t['adr_ori'] or ''])
    for key, bit, lab in (('bm', 16, 'Bâtiment ou ensemble moderne (PLU)'), ('vec', 32, 'Volumétrie existante à conserver (PLU)')):
        for b in overlap(arr_(G[key])): pf[b] |= bit; det[b].setdefault('fl', []).append(lab)
    t = shapely.STRtree(arr_(pp)); pi, gj = t.query(rp, predicate='within')
    PPL = {'MH': 'Abords de monument historique', 'ACR': 'Abords de monument historique', 'ACRR': 'Abords de monument historique', 'SPR': 'Site patrimonial remarquable', 'SC': 'Site classé',
           'SI': 'Site inscrit', 'CJI': 'Bien inscrit / jardin', 'CJ': 'Jardin / site', 'BU': 'Périmètre de protection', 'ZT': 'Zone tampon'}
    for b, gg in zip(pi, gj):
        pf[b] |= 8; p = pp[gg][1]
        nm = PPL.get(p['C_PP_NIV2'], 'Périmètre de protection') + (' : ' + p['L_PP'][:70] if p['L_PP'] and p['C_PP_NIV2'] not in ('MH', 'ACR', 'ACRR') else '')
        Lp = det[int(b)].setdefault('pp', [])
        if nm not in Lp and len(Lp) < 4: Lp.append(nm)
    rs = np.zeros(N, np.uint8)
    def within(lst, val, label=None, lab_fn=None):
        t = shapely.STRtree(arr_(lst)); pi, gj = t.query(rp, predicate='within')
        for b, gg in zip(pi, gj):
            if val: rs[b] = max(rs[b], val)
            Lf = det[int(b)].setdefault('fl', []); s = lab_fn(lst[gg][1]) if lab_fn else label
            if s not in Lf: Lf.append(s)
    within(car, 1, 'Secteur de risque : carrières (inspection générale des carrières)')
    within(gyp, 2, 'Secteur de risque : gypse')
    RL = {'BC': 'Zone bleue claire', 'BCH': 'Zone bleue claire hors Seine', 'BS': 'Zone bleue sombre', 'BSH': 'Zone bleue sombre hors Seine', 'R': 'Zone rouge', 'V': 'Zone verte'}
    within(ri, 3, lab_fn=lambda p: "Plan de prévention du risque d'inondation : " + RL.get(p['zonage'], p['zonage']))
    apt = shapely.points([[gg.x, gg.y] for gg, p in arp]); t = shapely.STRtree(apt)
    bi, pj = t.query(polys, predicate='dwithin', distance=40)
    PERN = [p for _, p in PER]; ar_n = np.zeros(N, np.uint8); dd = collections.defaultdict(list)
    for b, j in zip(bi, pj): dd[int(b)].append(int(j))
    for b, l in dd.items():
        ar_n[b] = min(255, len(l)); Lr = []
        for j in sorted(l, key=lambda j: shapely.distance(polys[b], apt[j]))[:5]:
            p = arp[j][1]; Lr.append([p['adr'], str(p['dt']), p['nat'], p['syn'][:420], [PERN[i] for i in p['per']], int(round(shapely.distance(polys[b], apt[j])))])
        det[b]['ar'] = Lr
    psp = [gg for gg, p in L['plub_ps']]
    t = shapely.STRtree(np.array(psp, dtype=object)); bi, _ = t.query(polys, predicate='dwithin', distance=3)
    for b in set(bi.tolist()): pf[b] |= 64; det[b].setdefault('fl', []).append('Parcelle signalée pour son intérêt patrimonial (PLU)')
    u = {}
    for b in set(det) | set(np.where(zo > 0)[0].tolist()):
        e = dict(det.get(b, {}))
        if zo[b]: e['z'] = ['', 'UG', 'UGSU', 'UV', 'N', 'PSMV', 'Autre'][zo[b]]
        if hp[b]: e['h'] = int(hp[b])
        if b in det: u[b] = e
    st.set_arr('u', u)
    for k, a_ in [('zo', zo), ('hp', hp), ('pf', pf), ('rs', rs), ('ar_n', ar_n)]: st.put(k, a_)
    log('patrimoine : MH %d ; protégés PLU %d ; périmètres %d ; fouilles proches %d' % (((pf & 1) > 0).sum(), ((pf & 4) > 0).sum(), ((pf & 8) > 0).sum(), (ar_n > 0).sum()))
