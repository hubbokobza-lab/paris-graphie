"""Occupants (Insee Sirene, fichier stock mensuel) : comptages par bâtiment uniquement, aucun nom publié.
s_ne établissements actifs, s_cl établissements fermés depuis le 1er janvier 2024, s_eff effectif salarié estimé, s_act activité dominante."""
import numpy as np, pandas as pd
from core import *

DS = 'base-sirene-des-entreprises-et-de-leurs-etablissements-siren-siret'
TV={'AV':'avenue','BD':'boulevard','PL':'place','QUAI':'quai','PAS':'passage','ALL':'allee','CITE':'cite','CHE':'chemin','COUR':'cour','CRS':'cours','IMP':'impasse','SQ':'square','VLA':'villa','RTE':'route','FG':'faubourg','GAL':'galerie','RPT':'rond point','SEN':'sentier','PTE':'porte','ESP':'esplanade','PRV':'parvis','VOIE':'voie','PRO':'promenade','TRA':'traverse','PORT':'port','ESC':'escalier','CAR':'carrefour','PARC':'parc','JARD':'jardin','DSC':'descente','HAM':'hameau','MAR':'marche','PONT':'pont','RUE':'rue','CTRE':'centre','CLOS':'clos','CHS':'chaussee','CHEM':'chemin','PETR':'petite route','VCHE':'vieux chemin','LOT':'lotissement','RLE':'ruelle','ROC':'rocade','ZA':'zone artisanale','ZAC':'zone amenagement concerte','ZONE':'zone','AUT':'autoroute','BER':'berges','BRG':'bourg','VEN':'venelle','TSSE':'terrasse','MTE':'montee','SQUA':'square','QU':'quai','DIG':'digue','PLE':'passerelle','PRT':'petite route','PLAN':'plan','PTA':'petite allee','VC':'voie communale','CAMI':'camin','CD':'chemin departemental','PCH':'petit chemin','CTRE':'centre','AGL':'agglomeration','ARC':'arcade','ENV':'enclos','ILOT':'ilot','LD':'lieu dit','PLT':'plateau','PLN':'plaine','QUA':'quartier','REM':'remparts','RES':'residence','SEN':'sentier','SUP':'','TOUR':'tour','TRAV':'traverse','VLGE':'village','VLA':'villa','PASS':'passage','PSTY':'peristyle','PLAG':'plage','PNT':'pointe'}
ART={'de','du','des','la','le','les','l','d','et','aux','au','en','sur','sous'}
TYPES=set(TV.values())|{'rue','avenue','boulevard','place','quai','passage','allee','cite','cour','cours','impasse','square','villa','route','faubourg','galerie','sentier','porte','esplanade','parvis','voie','promenade','traverse','port','chemin','pont','chaussee','rond','point','petite','hameau','jardin','parc','square','mail','rampe','ruelle','sente','rond-point'}
def core_(n):
    tk = n.split()
    if tk and tk[0] in TYPES: tk = tk[1:]
    return ' '.join(t for t in tk if t not in ART)

def grp(c):
    if not isinstance(c, str) or len(c) < 2 or not c[:2].isdigit(): return 9
    d = int(c[:2])
    if d == 68: return 2
    if 58 <= d <= 66 or 69 <= d <= 75 or (77 <= d <= 82 and d != 81): return 1
    if 45 <= d <= 47: return 3
    if d in (55, 56): return 4
    if 86 <= d <= 88: return 5
    if d == 85: return 6
    if d in (84, 94) or 90 <= d <= 93: return 7
    if d <= 44 or 49 <= d <= 53 or d == 81: return 8
    return 9
MID = {'00': 0, '01': 1.5, '02': 4, '03': 7.5, '11': 14.5, '12': 35, '21': 75, '22': 150, '31': 225, '32': 375, '41': 750, '42': 1500, '51': 3500, '52': 7500, '53': 12000}

def run(st, ban):
    import duckdb
    d = get_json('https://www.data.gouv.fr/api/1/datasets/%s/' % DS)
    r = [x for x in d['resources'] if 'StockEtablissement ' in x['title'] + ' ' and 'Historique' not in x['title'] and 'Liens' not in x['title'] and x.get('format') == 'parquet']
    if not r: raise RuntimeError('fichier StockEtablissement (parquet) introuvable sur data.gouv.fr')
    p = fetch(r[0]['url'], 'sirene-etab.parquet', max_age_h=24 * 20, min_size=500_000_000)
    df = duckdb.connect().sql("""select trancheEffectifsEtablissement te, numeroVoieEtablissement nv, indiceRepetitionEtablissement ir,
        typeVoieEtablissement tv, libelleVoieEtablissement lv, codeCommuneEtablissement ins, etatAdministratifEtablissement et,
        activitePrincipaleEtablissement naf from '%s'
        where codeCommuneEtablissement like '751%%' and (etatAdministratifEtablissement='A' or (etatAdministratifEtablissement='F' and dateDebut>=DATE '2024-01-01'))""" % p).df()
    log('Sirene : %d établissements à Paris (actifs ou fermés depuis 2024)' % len(df))
    bk = {}; bk0 = {}; bk2 = {}; bk20 = {}
    for ins, vn, nu, sf, s in zip(ban.commune_insee, ban.vn, ban.numero.astype(int), ban.sfn, ban.sh):
        if s < 0: continue
        bk.setdefault((ins, vn, nu, sf), int(s)); bk0.setdefault((ins, vn, nu), int(s))
        c = core_(vn); bk2.setdefault((ins, c, nu, sf), int(s)); bk20.setdefault((ins, c, nu), int(s))
    nv = pd.to_numeric(df.nv, errors='coerce').values
    vn = ((df.tv.fillna('').map(lambda t: TV.get(t, norm(t)))) + ' ' + df.lv.fillna('')).map(norm).values
    sf = df.ir.fillna('').map(lambda s: SUF.get(s.lower(), s.lower())).values
    sh = np.full(len(df), -1, int)
    for i, (ins, v, n, f) in enumerate(zip(df.ins.values, vn, nv, sf)):
        if n != n: continue
        n = int(n); s = bk.get((ins, v, n, f))
        if s is None: s = bk0.get((ins, v, n))
        if s is None:
            c = core_(v); s = bk2.get((ins, c, n, f))
            if s is None: s = bk20.get((ins, c, n))
        if s is not None: sh[i] = s
    df['sh'] = sh; log('Sirene : %.1f %% rattachés à un bâtiment' % (100 * np.mean(sh >= 0)))
    df = df[df.sh >= 0].copy(); df['g'] = df.naf.map(grp); df['eff'] = df.te.map(MID).fillna(0)
    N = st.N; act = df[df.et == 'A']; clo = df[df.et == 'F']
    s_ne = np.zeros(N, np.uint16); s_eff = np.zeros(N, np.uint16); s_act = np.zeros(N, np.uint8); s_cl = np.zeros(N, np.uint8)
    g1 = act.groupby('sh'); n1 = g1.size(); s_ne[n1.index] = np.minimum(n1.values, 65535)
    a = g1.eff.sum(); s_eff[a.index] = np.minimum(a.values, 65535).astype(np.uint16)
    s_nek = np.zeros(N, np.uint16); k = act[act.te.isin(list(MID))].groupby('sh').size(); s_nek[k.index] = np.minimum(k.values, 65535)   # établissements à effectif connu
    dom = act.groupby(['sh', 'g']).size().unstack(fill_value=0).idxmax(axis=1); s_act[dom.index] = dom.values
    g2 = clo.groupby('sh').size(); s_cl[g2.index] = np.minimum(g2.values, 255)
    for k, v in (('s_ne', s_ne), ('s_eff', s_eff), ('s_act', s_act), ('s_cl', s_cl), ('s_nek', s_nek)): st.put(k, v)
    log('Sirene : %d bâtiments avec établissement actif, %d avec fermetures depuis 2024' % ((s_ne > 0).sum(), (s_cl > 0).sum()))
    if (s_ne > 0).sum() < 20000: raise RuntimeError('trop peu de bâtiments occupés selon Sirene')
