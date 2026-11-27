"""Mise à jour de Paris-graphie.

  python pipeline/run.py full   --out site_new                  reconstruction complète depuis les sources
  python pipeline/run.py weekly --site site_actuel --out site_new  étapes dues seulement (voir STEPS), sur le site existant
  python pipeline/run.py site   --site site_actuel --out site_new  nouvelle page seulement, données inchangées
"""
import argparse, sys, os, shutil
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from core import *
from engine import Step, Engine
import step_base, step_ban, step_urba, step_misc, step_plu, step_usage, step_bdnb, step_cad, step_climat, step_tour, step_transport, step_osm_metro, step_culture, step_bouchaud, step_sirene, step_proprio, step_site

def check(st, prev=None):
    """Garde-fous : on refuse de publier un résultat manifestement incomplet."""
    req = ['nr', 'rl', 'ab', 'dl', 'arr', 'n_tot', 'n_adr', 'zo', 'pf', 'ty', 'bn', 'zg', 'dvf_n', 's_ne']
    miss = [k for k in req if k not in st.S]
    assert not miss, 'flux manquants : %s' % miss
    assert st.N > 110000, 'trop peu de bâtiments : %d' % st.N
    nz = lambda k: int((st.s(k) > 0).sum())
    assert nz('n_tot') > 50000, 'trop peu de bâtiments avec dossiers : %d' % nz('n_tot')
    assert nz('n_adr') > 60000, 'trop peu d\'adresses : %d' % nz('n_adr')
    if prev is not None and 'n_tot' in prev.S:
        assert nz('n_tot') > 0.9 * int((prev.s('n_tot') > 0).sum()), 'chute anormale du nombre de dossiers'
    log('contrôles OK :', st.N, 'bâtiments,', nz('n_tot'), 'avec dossiers,', nz('pf'), 'protégés,', nz('bn'), 'BDNB')

# ---------------------------------------------------------------- registre des étapes (dans l'ordre d'exécution)
def _ban(st, ctx): ctx['ban'] = step_ban.run(st)
def _sirene_absente(st): return 's_nek' not in st.S or int((st.s('s_ne') > 0).sum()) == 0
SIR = {'s_ne': 'H', 's_eff': 'H', 's_act': 'B', 's_cl': 'B', 's_nek': 'H'}

STEPS = [
    Step('base', lambda st, c: step_base.run(st), 'full', dates=['apur'], critical=True, rebuild=True, label='Bâtiments (Apur)'),
    Step('ban', _ban, 'always', dates=['ban'], critical=True, label='Adresses (BAN)'),
    Step('urba', lambda st, c: step_urba.run(st, c['ban']), 'always', dates=['urb', 'cvp'], critical=True, label='Urbanisme et CVP'),
    Step('prive', lambda st, c: step_misc.private_zero(st), 'always', critical=True, label='Flux privés (version publique)'),
    Step('relief', lambda st, c: step_misc.relief(st), 'full', critical=True, label='Altitude du sol'),
    Step('plu', lambda st, c: step_plu.run(st), 'full', dates=['plu', 'pat', 'arch', 'reg', 'gpu'], critical=True, label='PLU, patrimoine, risques'),
    Step('usage', lambda st, c: step_usage.run(st), 'full', dates=['typ', 'com'], critical=True, label='Usages et commerces'),
    Step('bdnb', lambda st, c: step_bdnb.run(st), 'full', dates=['bdnb', 'dpe'], critical=True, label='BDNB'),
    Step('cad', lambda st, c: step_cad.run(st), 'full', dates=['cad'], arr={'c': 'b'}, files=['ov_cad.json'], label='Cadastre'),
    Step('voirie', lambda st, c: step_cad.voirie(st), 'full', dates=['voir'], critical=True, label='Plan de voirie'),
    Step('transport', lambda st, c: step_transport.run(st), 'full', dates=['tcf'], files=['ov_tcf.json', 'ov_bus.json', 'ov_gare.json', 'ov_acc.json', 'gares.json'], label='Transports'),
    Step('tour', lambda st, c: step_tour.run(st, c['ban'], c['done']), 'full', files=['ov_hot.json', 'ov_cu.json', 'ov_abnb.json'], label='Hébergement touristique'),
    Step('climat', lambda st, c: step_climat.run(st), 'full', dates=['frais'], files=['ov_frais.json', 'ov_fraiq.json'], label='Îlots de fraîcheur'),
    Step('filet', lambda st, c: step_plu.filet(st), None, files=['ov_filet.json'], label='Filets de couleur (outil Coupe)'),
    Step('sirene', lambda st, c: step_sirene.run(st, c['ban']), 25, dates=['sir'], streams=SIR, force=_sirene_absente, label='Sirene (comptages)'),
    Step('proprio', lambda st, c: step_proprio.run(st), 90, version=2, dates=['own'], streams={'own': 'B', 'own_n': 'H'}, arr={'o': 'b', 'oan': 'g'},
         force=lambda st: 'own' not in st.S, label='Propriétaires personnes morales'),
    Step('osm', lambda st, c: step_osm_metro.run(st), 'full', dates=['osmm'], files=['ov_osmm.json', 'ov_osms.json'], label='Métro (OpenStreetMap)'),
    Step('culture', lambda st, c: step_culture.run(st, c['done']), 'full', files=['ov_cult.json', 'ov_culte.json', 'cult.json', 'culte.json'], label='Lieux culturels et de culte'),
    Step('bouchaud', lambda st, c: step_bouchaud.run(st), 'always', dates=['boa0', 'boa1', 'boa2'], files=['ov_boa0.json', 'ov_boa1.json', 'ov_boa2.json'], label='Projets Bouchaud'),
]

def migrate(SD):
    """Anciennes marques de recalcul unique (avant le registre) -> versions d'étapes."""
    if '_v' in SD: return
    V = SD['_v'] = {s.id: s.version for s in STEPS}
    if not SD.get('fil_v'): V['filet'] = 0
    if not SD.get('sir_v'): V['sirene'] = 0
    if SD.get('own', '') < '2026-11-26': V['proprio'] = 1
    for k in ('fil_v', 'sir_v'): SD.pop(k, None)

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('mode', choices=['full', 'weekly', 'site'])
    ap.add_argument('--site', help='site publié actuel'); ap.add_argument('--out', required=True)
    a = ap.parse_args()
    if not (a.site and os.path.exists(os.path.join(a.site, 'data.json'))):
        a.site = None
        if a.mode != 'full': log('pas de site existant : reconstruction complète'); a.mode = 'full'
    if a.mode == 'site':      # interface seulement : on republie les données telles quelles avec la nouvelle page
        if os.path.exists(a.out): shutil.rmtree(a.out)
        shutil.copytree(a.site, a.out, ignore=shutil.ignore_patterns('.git', 'index.html'))
        step_site.write_page(a.out); return
    prev = State(a.site) if a.site else None
    # dates d'extraction par source (affichées dans le site et les PDF) et versions des étapes
    SD = json.load(open(os.path.join(STATIC, 'sources_init.json')))
    if a.site and os.path.exists(os.path.join(a.site, 'sources.json')):
        raw = open(os.path.join(a.site, 'sources.json'), 'rb').read()
        SD.update(json.loads(gzip.decompress(raw) if raw[:2] == b'\x1f\x8b' else raw))
    migrate(SD)
    today = time.strftime('%Y-%m-%d')
    if a.mode == 'full': st = State()
    else:
        st = State(a.site)
        for f in os.listdir(a.site):     # on repart de tous les fichiers publiés
            if f.endswith('.json') and not f.startswith(('arr_', 'data')) and not os.path.exists(os.path.join(STATIC, f)):
                st.files[f] = open(os.path.join(a.site, f), 'rb').read()
    Engine(a.mode, st, prev, a.site, SD, today).run(STEPS)
    if a.mode == 'full' and a.site:     # calques d'exécutions précédentes non régénérés cette fois
        for f in os.listdir(a.site):
            if f.startswith('ov_') and f not in st.files and not os.path.exists(os.path.join(STATIC, f)):
                st.files[f] = open(os.path.join(a.site, f), 'rb').read()
    SD['_maj'] = today
    st.files['sources.json'] = json.dumps(SD, ensure_ascii=False).encode()
    check(st, prev)
    if os.path.exists(a.out): shutil.rmtree(a.out)
    step_site.run(st, a.out)

if __name__ == '__main__':
    import traceback
    try:
        main()
    except Exception as e:
        tb = traceback.format_exc().strip().splitlines()
        where = [l.strip() for l in tb if l.strip().startswith('File ') and '/pipeline/' in l]
        msg = '%s: %s' % (type(e).__name__, str(e)[:400])
        print('::error title=Échec de la mise à jour::' + msg.replace('\n', ' ') + ' | ' + (where[-1] if where else ''), flush=True)
        traceback.print_exc()
        sys.exit(1)
