"""Propriétaires personnes morales (DGFiP, fichier des locaux des personnes morales, open data, situation au 1er janvier).
Les particuliers n'y figurent pas. Rattachement par la parcelle cadastrale."""
import collections, io, subprocess, zipfile
import numpy as np, pandas as pd
from core import *

API = 'https://data.economie.gouv.fr/api/datasets/1.0/fichiers-des-locaux-et-des-parcelles-des-personnes-morales/'
# classes du critère « propriétaire principal »
CL = ['Aucun propriétaire personne morale connu (particuliers ou inconnu)', 'État, Ville, établissement public', 'Bailleur social',
      'Copropriété (syndicat)', 'Société civile (SCI, SCPI…)', 'Société commerciale (foncière, assureur, banque…)', 'Association, fondation, autre']

def cls(grp, forme):
    g = str(grp)[:1]; f = str(forme or '')
    if g in '1234' or g == '9' or f[:1] == '7': return 1
    if g == '5' or f in ('5546', '5547', '5646', '5647') or f.startswith('55') and 'HLM' in f: return 2
    if g == '7' or f == '9110': return 3
    if f.startswith('65'): return 4
    if f[:1] in '5' or f.startswith('6'): return 5
    return 6

def run(st):
    d = get_json(API)
    att = [a for a in d.get('attachments', []) if 'locaux' in a['title'].lower() and a['title'].lower().endswith('.zip')]
    att.sort(key=lambda a: re.findall(r'20\d\d', a['title'])[-1] if re.findall(r'20\d\d', a['title']) else '0')
    if not att: raise RuntimeError('fichier des locaux des personnes morales introuvable')
    a = att[-1]; an = re.findall(r'20\d\d', a['title'])[-1]
    p = fetch(API + 'attachments/' + a['id'], 'pm_locaux_%s.zip' % an, max_age_h=24 * 30, min_size=50_000_000)
    z = zipfile.ZipFile(p); m = [n for n in z.namelist() if re.search(r'_750\.(csv|txt)$', n, re.I)]
    if not m: raise RuntimeError('fichier de Paris absent de %s' % a['title'])
    raw = z.read(m[0])
    try: txt = raw.decode('utf-8')
    except UnicodeDecodeError: txt = raw.decode('latin-1')
    df = pd.read_csv(io.StringIO(txt), sep=';', dtype=str)
    df.columns = [norm(c).replace(' ', '_') for c in df.columns]
    log('propriétaires personnes morales (%s) : %d locaux à Paris' % (an, len(df)))
    sec = df.section.fillna('').str.strip().str.rjust(2, '0'); pre = df.prefixe.fillna('').str.strip().replace('', '000').str.rjust(3, '0')
    df['par'] = '75' + df.code_commune.str.zfill(3) + pre + sec + df.n_plan.fillna('').str.zfill(4)
    df['drt'] = df.code_droit.fillna('').str[:1]
    df = df[df.drt.isin(['P', 'U', 'N', 'B', 'R', 'F', 'D', 'V', 'W', 'X', 'Y', 'Z', 'G', 'S', 'E', 'K', 'L', 'H', 'O', 'J', 'A'])]
    df['grp'] = df.groupe_personne.fillna('').str[:1]
    # parcelle -> bâtiments (parcelles de chaque bâtiment, issues de la BAN)
    par2b = collections.defaultdict(list)
    for ar, v in st.arr.items():
        for b, ps in (v.get('p') or {}).items():
            for q in ps: par2b[q].append(int(b))
    agg = df.groupby(['par', 'n_siren', 'denomination', 'forme_juridique_abregee', 'forme_juridique', 'grp'], dropna=False).size().reset_index(name='n')
    own = collections.defaultdict(lambda: collections.Counter()); meta = {}
    for r in agg.itertuples(index=False):
        bs = par2b.get(r.par)
        if not bs: continue
        k = str(r.n_siren or '') or str(r.denomination)
        meta[k] = (str(r.denomination or '').strip(), str(r.forme_juridique_abregee or '').strip(), str(r.n_siren or '').strip(), cls(r.grp, r.forme_juridique), str(r.grp))
        for b in bs: own[b][k] += int(r.n)
    N = st.N; oc = np.zeros(N, np.uint8); on = np.zeros(N, np.uint16); out = {}
    for b, c in own.items():
        top = c.most_common()
        # copropriété : le syndicat ne détient que les parties communes ; on retient d'abord le principal propriétaire hors syndicat
        main = next((k for k, _ in top if meta[k][3] != 3), top[0][0])
        oc[b] = meta[main][3]
        on[b] = min(65535, sum(c.values()))
        out[b] = [[meta[k][0], meta[k][1], meta[k][2], meta[k][3], n] for k, n in top[:8]] + ([['+%d autres' % (len(top) - 8), '', '', 0, 0]] if len(top) > 8 else [])
    st.put('own', oc); st.put('own_n', on); st.set_arr('o', out)
    for a_ in range(21): st.arr[a_]['oan'] = an
    log('propriétaires : %d bâtiments avec au moins une personne morale propriétaire' % (oc > 0).sum())
    if (oc > 0).sum() < 15000: raise RuntimeError('trop peu de bâtiments rattachés aux propriétaires')
