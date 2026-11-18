"""Mise à jour de Paris-graphie.

  python pipeline/run.py full   --out site_new                  reconstruction complète depuis les sources
  python pipeline/run.py weekly --site site_actuel --out site_new  urbanisme et CVP seulement, sur le site existant
"""
import argparse, sys, os, shutil
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from core import *
import step_base, step_ban, step_urba, step_misc, step_plu, step_usage, step_bdnb, step_cad, step_site

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

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('mode', choices=['full', 'weekly'])
    ap.add_argument('--site', help='site publié actuel (pour weekly)'); ap.add_argument('--out', required=True)
    a = ap.parse_args()
    if not (a.site and os.path.exists(os.path.join(a.site, 'data.json'))):
        a.site = None
        if a.mode == 'weekly': log('pas de site existant : reconstruction complète'); a.mode = 'full'
    prev = State(a.site) if a.site else None
    if a.mode == 'full':
        st = State(); step_base.run(st)
        ban = step_ban.run(st); step_urba.run(st, ban); step_misc.private_zero(st); step_misc.relief(st)
        step_plu.run(st); step_usage.run(st); step_bdnb.run(st); step_cad.run(st); step_cad.voirie(st)
        # fichiers calculés lors d'exécutions précédentes mais non régénérés (ex. calque mobilité en échec)
        if a.site:
            for f in os.listdir(a.site):
                if f.startswith('ov_') and f not in st.files and not os.path.exists(os.path.join(STATIC, f)):
                    st.files[f] = open(os.path.join(a.site, f), 'rb').read()
    else:
        st = State(a.site)
        for f in os.listdir(a.site):     # on repart de tous les fichiers publiés
            if f.endswith('.json') and not f.startswith(('arr_', 'data')) and not os.path.exists(os.path.join(STATIC, f)):
                st.files[f] = open(os.path.join(a.site, f), 'rb').read()
        ban = step_ban.run(st); step_urba.run(st, ban)
    check(st, prev)
    if os.path.exists(a.out): shutil.rmtree(a.out)
    step_site.run(st, a.out)

if __name__ == '__main__':
    main()
