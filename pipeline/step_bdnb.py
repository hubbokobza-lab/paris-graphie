"""Base de données nationale des bâtiments (CSTB), département 75."""
import numpy as np, pandas as pd, shapely, zipfile, pyproj
from core import *

S3 = 'https://open-data.s3.fr-par.scw.cloud/bdnb_millesime_{m}/millesime_{m}_dep75/open_data_millesime_{m}_dep75_csv'

def bdnb_url():
    """Dernier millésime publié (les noms suivent le motif AAAA-MM-lettre) : on teste du plus récent au plus ancien."""
    y0 = int(time.strftime('%Y'))
    for y in (y0, y0 - 1):
        for mo in range(12, 0, -1):
            for l in 'dcba':
                m = '%d-%02d-%s' % (y, mo, l)
                r = subprocess.run(['curl', '-sI', '-m', '20', '-o', '/dev/null', '-w', '%{http_code}', S3.format(m=m) + '_metadata.yml'], capture_output=True, text=True).stdout
                if r == '200': return S3.format(m=m) + '.zip', m
    raise RuntimeError('BDNB : aucun millésime trouvé')

def run(st):
    g = st.geo(); polys, rp, N = g.polys, g.rp, st.N
    url, mil = bdnb_url(); log('BDNB millésime', mil)
    z = fetch(url, 'bdnb_%s_dep75.zip' % mil, max_age_h=24 * 365, min_size=50_000_000)
    zf = zipfile.ZipFile(z); names = {os.path.basename(n)[:-4]: n for n in zf.namelist() if n.endswith('.csv')}
    rd = lambda f, cols: pd.read_csv(zf.open(names[f]), sep=';', dtype=str, usecols=cols, encoding='utf-8')
    tr = pyproj.Transformer.from_crs(2154, 4326, always_xy=True)
    gdf = rd('batiment_groupe', ['batiment_groupe_id', 'geom_groupe'])
    geo = shapely.from_wkt(gdf.geom_groupe.values)
    def f(c):
        lo, la = tr.transform(c[:, 0], c[:, 1]); return np.c_[(np.asarray(lo) - LON0) * KX, (np.asarray(la) - LAT0) * KY]
    geo = shapely.transform(geo, f); T = shapely.STRtree(geo)
    pi, gi = T.query(rp, predicate='within'); grp = np.full(N, -1); grp[pi] = gi
    un = np.where(grp < 0)[0]; qi, gj = T.query_nearest(rp[un], max_distance=3, all_matches=False); grp[un[qi]] = gj
    log('bâtiments rattachés à un groupe BDNB :', int((grp >= 0).sum()), '/', N)
    ids = gdf.batiment_groupe_id.values; idx = {k: i for i, k in enumerate(ids)}
    def tbl(name, cols):
        out = {c: np.full(len(ids), None, object) for c in cols}
        if name not in names: log('  table absente :', name); return out
        df = rd(name, ['batiment_groupe_id'] + cols).drop_duplicates('batiment_groupe_id')
        ii = df.batiment_groupe_id.map(idx); m = ii.notna(); ii = ii[m].astype(int).values
        for c in cols: out[c][ii] = df[c].fillna('').values[m.values]
        return out
    F = tbl('batiment_groupe_ffo_bat', ['nb_niveau', 'usage_niveau_1_txt', 'mat_mur_txt', 'mat_toit_txt', 'nb_log', 'annee_construction'])
    U = tbl('batiment_groupe_synthese_propriete_usage', ['usage_principal_bdnb_open'])
    R = tbl('batiment_groupe_rnc', ['nb_lot_tot', 'nb_log', 'nb_lot_tertiaire', 'nb_lot_garpark'])
    P = tbl('batiment_groupe_rpls', ['nb_log'])
    D = tbl('batiment_groupe_dpe_representatif_logement', ['classe_bilan_dpe', 'classe_emission_ges', 'emission_ges_5_usages_m2', 'conso_5_usages_ep_m2', 'date_etablissement_dpe', 'arrete_2021', 'type_energie_chauffage'])
    EQ = tbl('batiment_groupe_bdtopo_zoac', ['l_nature', 'l_toponyme'])
    DT_ = tbl('batiment_groupe_dpe_tertiaire', ['classe_conso_energie_dpe_tertiaire', 'classe_emission_ges_dpe_tertiaire', 'emission_ges_dpe_tertiaire_m2', 'date_etablissement_dpe'])
    num = lambda v: (int(float(v)) if v not in (None, '') and v == v else 0)
    USG = {'Résidentiel collectif': 1, 'Résidentiel individuel': 2, 'Tertiaire': 3, 'Tertiaire & Autres': 3, 'Secondaire': 4, 'Primaire': 4, 'Dépendance': 5}
    CL = {c: i + 1 for i, c in enumerate('ABCDEFG')}
    def matcode(s):
        s = (s or '').upper()
        if not s or s.startswith('INDET'): return 0
        if 'BETON' in s: return 3 if not ('PIERRE' in s or 'BRIQUE' in s or 'MEULIERE' in s) else 4
        if 'PIERRE' in s and 'BRIQUE' not in s and 'MEULIERE' not in s: return 1
        if 'BRIQUE' in s or 'MEULIERE' in s: return 2
        if 'BOIS' in s: return 5
        return 6
    z8 = lambda: np.zeros(N, np.uint8); z16 = lambda: np.zeros(N, np.uint16)
    be, bn, bu, bm, bd, bg = z8(), z8(), z8(), z8(), z8(), z8(); bl, bs, bt = z16(), z16(), z16()
    grpN = collections.Counter(grp[grp >= 0].tolist()); det = {}
    for s in range(N):
        j = grp[s]
        if j < 0: continue
        q = EQ['l_nature'][j] or ''
        if q and not any(x in q for x in ('Administration', 'Espace public', 'extraterritorial', 'Mairie', 'Préfecture', 'Ministère')): be[s] = 1
        bn[s] = min(255, num(F['nb_niveau'][j])); u = F['usage_niveau_1_txt'][j] or U['usage_principal_bdnb_open'][j]
        bu[s] = USG.get(U['usage_principal_bdnb_open'][j] or u, 0)
        bl[s] = min(65535, max(num(F['nb_log'][j]), num(R['nb_log'][j]))); bs[s] = min(65535, num(P['nb_log'][j])); bt[s] = min(65535, num(R['nb_lot_tertiaire'][j]))
        bm[s] = matcode(F['mat_mur_txt'][j]); c = D['classe_bilan_dpe'][j]; bd[s] = CL.get(c, 0) if c else 0
        c2 = D['classe_emission_ges'][j]; bg[s] = CL.get(c2, 0) if c2 else 0
        tok = num(DT_['emission_ges_dpe_tertiaire_m2'][j]) > 0
        ct = DT_['classe_conso_energie_dpe_tertiaire'][j] if tok else ''; gt = DT_['classe_emission_ges_dpe_tertiaire'][j] if tok else ''
        if not bd[s] and ct: bd[s] = CL.get(ct, 0)
        if not bg[s] and gt: bg[s] = CL.get(gt, 0)
        det[s] = [ids[j], grpN[j], U['usage_principal_bdnb_open'][j] or u or '', num(F['nb_niveau'][j]), int(bl[s]), int(bs[s]), int(bt[s]), num(R['nb_lot_tot'][j]),
                  F['mat_mur_txt'][j] or '', F['mat_toit_txt'][j] or '', D['classe_bilan_dpe'][j] or '', D['classe_emission_ges'][j] or '', D['emission_ges_5_usages_m2'][j] or '',
                  (D['date_etablissement_dpe'][j] or '')[:10], D['arrete_2021'][j] or '', ct or '', gt or '', (DT_['emission_ges_dpe_tertiaire_m2'][j] or '') if tok else '',
                  ((DT_['date_etablissement_dpe'][j] or '')[:10]) if tok else '', D['type_energie_chauffage'][j] or '', F['annee_construction'][j] or '',
                  (EQ['l_toponyme'][j] or '').strip('[]" ').replace('""', ''), (EQ['l_nature'][j] or '').strip('[]" ').replace('""', '')]
    st.set_arr('n', det)
    for k, a_ in [('bn', bn), ('bu', bu), ('bl', bl), ('bs', bs), ('bt', bt), ('bm', bm), ('bd', bd), ('bg', bg), ('be', be)]: st.put(k, a_)
    log('BDNB : niveaux %d, DPE %d, logements %d' % ((bn > 0).sum(), (bd > 0).sum(), (bl > 0).sum()))
