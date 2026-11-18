"""Base adresse nationale : adresses et parcelles par bâtiment, étiquettes de rues, numéros, index de recherche."""
import numpy as np, pandas as pd
from scipy.spatial import cKDTree
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import connected_components
from core import *

BAN_URL = 'https://adresse.data.gouv.fr/data/ban/adresses/latest/csv-bal/adresses-75.csv.gz'

def load_ban():
    p = fetch(BAN_URL, 'adresses-ban.csv', min_size=10_000_000)
    ban = pd.read_csv(p, sep=';', dtype={'suffixe': str, 'commune_insee': str, 'numero': 'Int64', 'cad_parcelles': str}, encoding='utf-8-sig')
    ban = ban.dropna(subset=['long', 'lat', 'numero', 'voie_nom']); ban = ban[ban.numero < 9000].reset_index(drop=True)
    ban['sf'] = ban.suffixe.fillna('').str.strip()
    ban['vn'] = ban.voie_nom.map(norm); ban['sfn'] = ban.sf.map(lambda s: SUF.get(norm(s), norm(s)))
    return ban

def lab(n, s):
    s = (s or '').strip().lower(); return str(int(n)) + ({'b': ' bis', 't': ' ter', 'q': ' quater', 'c': ' quater'}.get(s, ' ' + s) if s else '')

def run(st, ban=None):
    g = st.geo(); N = st.N
    if ban is None: ban = load_ban()
    ban['sh'] = g.locate(ban.long.values, ban.lat.values, 25)
    log('BAN', len(ban), 'adresses, rattachées à un bâtiment : %.1f%%' % (100 * np.mean(ban.sh >= 0)))
    ban['full'] = [lab(n, s) + ' ' + v for n, s, v in zip(ban.numero, ban.sf, ban.voie_nom)]
    bb = ban[ban.sh >= 0].sort_values(['voie_nom', 'numero', 'sfn'])
    adr = collections.defaultdict(list); pcs = collections.defaultdict(set)
    for s, f, pc in zip(bb.sh.values, bb.full.values, bb.cad_parcelles.fillna('').values):
        if f not in adr[int(s)]: adr[int(s)].append(f)
        for q in str(pc).split(','):
            if q: pcs[int(s)].add(q)
    st.set_arr('a', adr); st.set_arr('p', {s: sorted(v) for s, v in pcs.items()})
    n_ad = np.zeros(N, np.uint8)
    for s, v in adr.items(): n_ad[s] = min(255, len(v))
    st.put('n_adr', n_ad)
    # numéros et étiquettes de rues
    nx = (ban.long.values - LON0) * KX; ny = (ban.lat.values - LAT0) * KY
    nl = [str(int(n)) + ({'bis': 'b', 'ter': 't', 'quater': 'q'}.get(s, s[:1]) if s else '') for n, s in zip(ban.numero, ban.sfn)]
    num = [[int(round(x * 2)), int(round(y * 2)), l] for x, y, l in zip(nx, ny, nl)]
    labels = []
    for vn_, grp in ban.groupby('voie_nom'):
        P = np.c_[nx[grp.index], ny[grp.index]]
        if len(P) == 1: labels.append([round(P[0, 0], 1), round(P[0, 1], 1), 0, vn_, 30, 1]); continue
        pairs = cKDTree(P).query_pairs(90, output_type='ndarray')
        m = coo_matrix((np.ones(len(pairs)), (pairs[:, 0], pairs[:, 1])), shape=(len(P), len(P)))
        nc, cl = connected_components(m, directed=False)
        for c in range(nc):
            Qp = P[cl == c]
            if len(Qp) < 2: continue
            ctr = Qp.mean(0); _, _, vt = np.linalg.svd(Qp - ctr, full_matrices=False); pr = (Qp - ctr) @ vt[0]
            o = np.argsort(pr); Qp = Qp[o]; pr = pr[o]
            nch = max(1, int(round((pr[-1] - pr[0]) / 380))); edges = np.linspace(pr[0], pr[-1] + 1e-6, nch + 1)
            for k in range(nch):
                C = Qp[(pr >= edges[k]) & (pr < edges[k + 1])]
                if len(C) < 2: continue
                cc = np.median(C, 0); _, _, v2 = np.linalg.svd(C - C.mean(0), full_matrices=False)
                a = np.degrees(np.arctan2(v2[0][1], v2[0][0])); a = a - 180 if a > 90 else a + 180 if a < -90 else a
                ln = float(np.ptp((C - C.mean(0)) @ v2[0]))
                labels.append([round(float(cc[0]), 1), round(float(cc[1]), 1), round(float(a), 1), vn_, round(max(ln, 20), 0), len(C)])
    st.put_file('labels.json', {'s': labels, 'n': num})
    # index de recherche d'adresses
    idx = collections.defaultdict(list)
    for n, s, v, lo, la, ins in zip(ban.numero, ban.suffixe.fillna(''), ban.voie_nom, ban.long, ban.lat, ban.commune_insee):
        idx[v].append([lab(n, s), int(round((lo - LON0) * KX * 2)), int(round((la - LAT0) * KY * 2)), int(str(ins)[-2:]) if str(ins).startswith('751') else 0])
    st.put_file('addr.json', [[k, sorted(v, key=lambda e: (int(re.match(r'\d+', e[0]).group()), e[0]))] for k, v in sorted(idx.items())])
    log('rues', len(labels), 'étiquettes ;', len(idx), 'voies dans l\'index')
    return ban
