"""Autorisations d'urbanisme (historique + dossiers récents) et Commission du Vieux Paris. Module hebdomadaire."""
import time
import numpy as np, pandas as pd
from core import *
from step_ban import load_ban

TYP = {'Permis de construire': 'PC', 'Permis de démolir': 'PD', "Permis d'aménager": 'PA', 'Déclarations préalables': 'DP',
       'Déclaration de travaux (Déclarations préalables)': 'DT', 'Ravalements (Déclarations préalables)': 'RV'}
ACC = {'Favorable', 'Favorable avec réserve', 'Favorable tacite', 'Accord tacite'}
SP = re.compile(r'(?:surface|shon|sdp)[^:\d\n]{0,40}?cr[ée]{1,2}e?s?[^:\d\n]{0,25}?:?\s*(\d[\d ]*(?:[.,]\d+)?)\s*m', re.I)

def clip(d, n):
    if not isinstance(d, str): return ''
    d = re.sub(r'\s+', ' ', d).strip(); return d if len(d) <= n else d[:n - 1] + '…'
def surf(d):
    if not isinstance(d, str): return 0.0
    t = 0.0
    for m in SP.finditer(d):
        try: t += float(m.group(1).replace(' ', '').replace(',', '.'))
        except ValueError: pass
    return min(t, 200000.0)
def parse_num(v):
    if not isinstance(v, str): return None, ''
    m = re.match(r'\s*(\d+)\s*([A-Za-z]*)', v)
    if not m: return None, ''
    return int(m.group(1)), SUF.get(m.group(2).lower(), m.group(2).lower())

LEGAL = re.compile(r"\b(SCI|SAS|SASU|SA|SARL|SNC|SCCV|SCPI|OPCI|EURL|SEM|SPL|SELARL|SCP|GIE|SCA|SCS|ASSOCIATION|ASSOC|SYNDICAT|SDC|COPROPRIETE|COPRO|VILLE|PARIS|MAIRIE|ETAT|MINISTERE|REGION|DEPARTEMENT|HABITAT|LOGEMENT|LOGEMENTS|IMMOBILIER|IMMOBILIERE|IMMO|FONCIERE|FONCIER|GROUPE|SOCIETE|STE|CIE|COMPAGNIE|BANQUE|HOTEL|HOTELS|RESIDENCE|INVEST|INVESTISSEMENT|INVESTISSEMENTS|HOLDING|PROMOTION|RATP|SNCF|APHP|UNIVERSITE|ECOLE|LYCEE|COLLEGE|EGLISE|PAROISSE|DIOCESE|FONDATION|FONDS|CABINET|AGENCE|ARCHITECTES|ARCHITECTURE|PARTNERS|GESTION|DEVELOPPEMENT|CAPITAL|REIM|ASSET|ASSETS|MANAGEMENT|PROPERTY|PROPERTIES|REAL|ESTATE|FRANCE|INTERNATIONAL|SERVICES|CENTRE|CLINIQUE|HOPITAL|MUSEE|THEATRE|OFFICE|PUBLIC|RESTAURANT|CAFE|BOULANGERIE|PHARMACIE|BANK|MAISON|ETABLISSEMENT|ETABLISSEMENTS|ELOGIE|SIEMP|RIVP|3F|CDC|ICADE|GECINA|NEXITY|BOUYGUES|VINCI|EIFFAGE|KAUFMAN|COGEDIM|ALTAREA|EMERIGE|SOGEPROM|COVIVIO|KLEPIERRE|UNIBAIL)\b")
def moa_public(d):
    """Site public : on n'affiche que les personnes morales ; les particuliers deviennent « particulier »."""
    d = d.strip()
    if not d: return ''
    u = norm(d).upper()
    if re.search(r'\b(M|MME|MR|MLLE|MONSIEUR|MADAME|MADEMOISELLE)\b', u): return 'particulier'
    if LEGAL.search(u) or re.search(r'\d|&', d) or len(d.split()) == 1: return d
    if any(re.match(r'^[A-ZÀ-Ý][a-zà-ÿ]', w) for w in d.split()): return 'particulier'   # « Prénom NOM »
    if 2 <= len(u.split()) <= 3: return 'particulier'   # « NOM PRÉNOM » en capitales : prudence
    return d

SITADEL = ['8b35affb-55fc-4c1f-915b-7750f974446a', 'f8f0700f-806c-40a7-83b1-f21cf507e7c4']
def sitadel():
    """Maîtres d'ouvrage personnes morales des permis depuis 2013 (base Sitadel, SDES)."""
    M = {}
    for rid in SITADEL:
        try:
            u = 'https://data.statistiques.developpement-durable.gouv.fr/dido/api/v1/datafiles/%s/csv?DEP_CODE=eq:75&columns=NUM_DAU,DENOM_DEM&withColumnName=true' % rid
            df = pd.read_csv(fetch(u, 'sitadel_%s.csv' % rid[:8], min_size=20_000), sep=';', dtype=str)
            for n, d in zip(df.NUM_DAU, df.DENOM_DEM):
                if isinstance(d, str) and d.strip() and isinstance(n, str): M[re.sub(r'[^0-9A-Z]', '', n)] = d.strip()
        except Exception as e: log('  Sitadel', rid[:8], 'indisponible :', str(e)[:120])
    log("  Sitadel : %d maîtres d'ouvrage (personnes morales)" % len(M))
    return M

def run(st, ban=None):
    g = st.geo(); N = st.N; ARR = st.s('arr')
    if ban is None: ban = load_ban()
    bk = {}; bk0 = {}
    for ins, vn, nu, sf, lo, la in zip(ban.commune_insee, ban.vn, ban.numero.astype(int), ban.sfn, ban.long, ban.lat):
        bk.setdefault((ins, vn, nu, sf), (lo, la)); bk0.setdefault((ins, vn, nu), (lo, la))
    h = pd.read_csv(ods('autorisations-durbanisme-h', 'csv', 'autorisations-durbanisme-h.csv', min_size=10_000_000), sep=';', dtype=str, encoding='utf-8-sig')
    rec = pd.read_csv(ods('dossiers-recents-durbanisme', 'csv', 'dossiers-recents-durbanisme.csv', min_size=500_000), sep=';', dtype=str, encoding='utf-8-sig').drop_duplicates('nom_dossier').set_index('nom_dossier')
    lon = np.full(len(h), np.nan); lat = np.full(len(h), np.nan)
    ins = ('751' + h.arrondissement.fillna('00').str[-2:]).values; vn = h.adresse_du_terrain.fillna('').map(norm).values
    for i, (a, v, nv) in enumerate(zip(ins, vn, h.numero_voirie_du_terrain.values)):
        n, sf = parse_num(nv)
        if n is None: continue
        p = bk.get((a, v, n, sf)) or bk0.get((a, v, n))
        if p is not None: lon[i], lat[i] = p
    for i in np.where(h.numero_dossier.isin(rec.index).values)[0]:
        try:
            la, lo = [float(x) for x in str(rec.at[h.numero_dossier.iat[i], 'geo_point_2d']).split(',')]; lon[i], lat[i] = lo, la
        except Exception: pass
    ok = ~np.isnan(lon); sh = np.full(len(h), -1, int); sh[ok] = g.locate(lon[ok], lat[ok])
    h['sh'] = sh; h = h[h.sh >= 0].drop_duplicates(['sh', 'numero_dossier']).copy()
    log('dossiers d\'urbanisme rattachés :', len(h), 'sur', len(sh))
    h['t'] = h.type_dossier.map(TYP); h['acc'] = h.decision_autorite.isin(ACC)
    h = h[h.t.notna()].copy()
    h['yd'] = pd.to_numeric(h.date_depot.str[:4], errors='coerce').fillna(0).astype(int)
    h['sc'] = np.where(h.acc, h.description_travaux.map(surf), 0.0)
    # délai d'obtention (jours entre dépôt et décision), autorisations accordées uniquement
    MO = {m: i + 1 for i, m in enumerate(['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'])}
    ddec = pd.to_datetime(h.annee_decision.fillna('') + '-' + h.mois_decision.map(MO).astype('Int64').astype(str) + '-' + h.jour_decision.fillna(''), errors='coerce')
    dl = (ddec - pd.to_datetime(h.date_depot, errors='coerce')).dt.days
    h['dl'] = np.where(h.acc & h.t.isin(['PC', 'DP', 'PD']) & dl.between(1, 3650), dl, 0).astype(int)
    y0 = int(time.strftime('%Y')) - 5
    MED = {t: int(h[(h.t == t) & (h.dl > 0) & (h.yd >= y0)].dl.median()) for t in ('PC', 'DP', 'PD') if ((h.t == t) & (h.dl > 0) & (h.yd >= y0)).any()}
    log('délai médian d\'obtention depuis', y0, ':', MED)
    n_tot = np.zeros(N, np.uint16); n_pc = np.zeros(N, np.uint8); last_pc = np.zeros(N, np.uint16); last_pd = np.zeros(N, np.uint16)
    surfc = np.zeros(N, np.uint32); recs = np.zeros(N, np.uint8)
    gs = h.groupby('sh').size(); n_tot[gs.index] = np.minimum(gs.values, 65535)
    pc = h[h.t == 'PC'].groupby('sh').size(); n_pc[pc.index] = np.minimum(pc.values, 255)
    a = h[(h.t == 'PC') & h.acc].groupby('sh').yd.max(); last_pc[a.index] = a.values
    a = h[(h.t == 'PD') & h.acc].groupby('sh').yd.max(); last_pd[a.index] = a.values
    a = h.groupby('sh').sc.sum(); surfc[a.index] = np.minimum(np.round(a.values), 4e9).astype(np.uint32)
    ETAT = {"En cours d'instruction": 1, 'Accordé': 2, 'Refusé': 3}
    for s, nm in zip(h.sh.values, h.numero_dossier.values):
        if nm in rec.index: recs[s] = 1 if recs[s] == 1 else max(recs[s], ETAT.get(rec.at[nm, 'etat'], 0))
    DEC = sorted(h.decision_autorite.dropna().unique().tolist()); DI = {d: i for i, d in enumerate(DEC)}
    TL = ['PC', 'PD', 'PA', 'DP', 'DT', 'RV']; TI = {t: i for i, t in enumerate(TL)}
    MOA = sitadel()
    def dem(nm):
        d = rec.at[nm, 'demandeur'] if nm in rec.index and isinstance(rec.at[nm, 'demandeur'], str) else ''
        if d: return moa_public(d)
        return MOA.get(re.sub(r'[^0-9A-Z]', '', str(nm))[2:], '')
    h = h.sort_values('date_depot', ascending=False)
    det = collections.defaultdict(list)
    for s, nm, dd, t, dc, ds, dl_ in zip(h.sh.values, h.numero_dossier.values, h.date_depot.values, h.t.values, h.decision_autorite.values, h.description_travaux.values, h.dl.values):
        det[int(s)].append([nm, dd, TI[t], DI.get(dc, -1), clip(ds, 90 if t in ('RV', 'DT') else 260), dem(nm), int(dl_)])
    st.set_arr('b', det)
    for a_ in range(21): st.arr[a_]['t'] = TL; st.arr[a_]['d'] = DEC; st.arr[a_]['med'] = MED
    # Commission du Vieux Paris
    cv = json.load(open(ods('commission-du-vieux-paris-adresses-instruites', 'json', 'cvp.json', min_size=100_000)))
    cv = [c for c in cv if c.get('geo_point_2d')]
    cl = g.locate([c['geo_point_2d']['lon'] for c in cv], [c['geo_point_2d']['lat'] for c in cv], 25)
    cvp_n = np.zeros(N, np.uint8); cvp_k = np.zeros(N, np.uint8); cd = collections.defaultdict(list)
    for c, s in sorted(zip(cv, cl), key=lambda z: z[0].get('date_passage') or '', reverse=True):
        if s < 0: continue
        cvp_n[s] = min(255, cvp_n[s] + 1); k = 1 if c.get('resolution') == 'Vœu' else 2
        cvp_k[s] = k if cvp_k[s] == 0 else min(cvp_k[s], k)
        cd[int(s)].append([c.get('date_passage'), c.get('resolution') or '', c.get('type_de_travaux_1') or '', ' ; '.join(c.get('protection') or []),
                           clip(c.get('voeu'), 380), c.get('url_document_de_seance') or '', c.get('adresse') or '',
                           re.sub(r'\s*;\s*', ', ', (c.get('architecte') or '').strip()), str(c.get('date_de_construction') or c.get('siecle_de_construction') or '').strip()])
    st.put_file('cvp.json', {'b': cd})
    for k, a_ in [('n_tot', n_tot), ('n_pc', n_pc), ('last_pc', last_pc), ('last_pd', last_pd), ('surf', surfc), ('cvp_n', cvp_n), ('cvp_k', cvp_k), ('rec', recs)]:
        st.put(k, a_)
    log('urbanisme : %d bâtiments avec dossiers, %d avec un passage en CVP' % ((n_tot > 0).sum(), (cvp_n > 0).sum()))
