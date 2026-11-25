"""Mise à jour de Paris-graphie.

  python pipeline/run.py full   --out site_new                  reconstruction complète depuis les sources
  python pipeline/run.py weekly --site site_actuel --out site_new  urbanisme et CVP seulement, sur le site existant
"""
import argparse, sys, os, shutil
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from core import *
import step_base, step_ban, step_urba, step_misc, step_plu, step_usage, step_bdnb, step_cad, step_climat, step_tour, step_transport, step_osm_metro, step_culture, step_bouchaud, step_sirene, step_site

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
    # dates d'extraction par source (affichées dans le site et les PDF)
    SD = json.load(open(os.path.join(STATIC, 'sources_init.json')))
    if a.site and os.path.exists(os.path.join(a.site, 'sources.json')):
        raw = open(os.path.join(a.site, 'sources.json'), 'rb').read()
        SD.update(json.loads(gzip.decompress(raw) if raw[:2] == b'\x1f\x8b' else raw))
    today = time.strftime('%Y-%m-%d')
    def done(*keys):
        for k in keys: SD[k] = today
    if a.mode == 'full':
        st = State(); step_base.run(st); done('apur')
        ban = step_ban.run(st); done('ban'); step_urba.run(st, ban); done('urb', 'cvp'); step_misc.private_zero(st); step_misc.relief(st)
        step_plu.run(st); done('plu', 'pat', 'arch', 'reg', 'gpu'); step_usage.run(st); done('typ', 'com')
        step_bdnb.run(st); done('bdnb', 'dpe')
        try:
            step_cad.run(st); done('cad')
        except Exception as e:      # le cadastre ne doit pas bloquer la mise à jour
            print('::warning title=Cadastre non mis à jour::%s' % str(e)[:300], flush=True)
            if a.site:
                for f in ('ov_cad.json',):
                    if os.path.exists(os.path.join(a.site, f)): st.files[f] = open(os.path.join(a.site, f), 'rb').read()
        step_cad.voirie(st); done('voir')
        try:
            step_transport.run(st); done('tcf')
        except Exception as e:
            print('::warning title=Transports non mis à jour::%s' % str(e)[:300], flush=True)
            if a.site:
                for f in ('ov_tcf.json', 'ov_bus.json', 'ov_gare.json', 'ov_acc.json', 'gares.json'):
                    if os.path.exists(os.path.join(a.site, f)): st.files[f] = open(os.path.join(a.site, f), 'rb').read()
        for e in step_tour.run(st, ban, done):
            print('::warning title=Hébergement touristique incomplet::%s' % e, flush=True)
        if a.site:
            for f in ('ov_hot.json', 'ov_cu.json', 'ov_abnb.json'):
                if f not in st.files and os.path.exists(os.path.join(a.site, f)): st.files[f] = open(os.path.join(a.site, f), 'rb').read()
        try:
            step_climat.run(st); done('frais')
        except Exception as e:      # les îlots de fraîcheur ne doivent pas bloquer la mise à jour
            print('::warning title=Îlots de fraîcheur non mis à jour::%s' % str(e)[:300], flush=True)
            if a.site:
                for f in ('ov_frais.json', 'ov_fraiq.json'):
                    if os.path.exists(os.path.join(a.site, f)): st.files[f] = open(os.path.join(a.site, f), 'rb').read()
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
        ban = step_ban.run(st); done('ban'); step_urba.run(st, ban); done('urb', 'cvp')
    # Sirene (comptages d'établissements par bâtiment) : fichier mensuel, recalculé si la dernière extraction a plus de 25 jours
    import datetime
    age = (datetime.date.today() - datetime.date.fromisoformat(SD.get('sir', '2000-01-01'))).days
    if a.mode == 'full' or age > 25 or 's_ne' not in st.S or int((st.s('s_ne') > 0).sum()) == 0:
        try:
            step_sirene.run(st, ban); done('sir')
        except Exception as e:
            print('::warning title=Sirene non mis à jour::%s' % str(e)[:300], flush=True)
            if prev is not None and 's_ne' in prev.S and len(prev.s('s_ne')) == st.N:
                for k in ('s_ne', 's_eff', 's_act', 's_cl'): st.put(k, prev.s(k))
            else: step_misc.private_zero(st)
    if a.mode == 'full':   # OpenStreetMap et Basilic : trimestriel (Overpass est lent et instable)
        try:
            step_osm_metro.run(st); done('osmm')
        except Exception as e:
            print('::warning title=Voies du métro (OSM) non mises à jour::%s' % str(e)[:300], flush=True)
            if a.site:
                for f in ('ov_osmm.json', 'ov_osms.json'):
                    if os.path.exists(os.path.join(a.site, f)): st.files[f] = open(os.path.join(a.site, f), 'rb').read()
        for e in step_culture.run(st, done):
            print('::warning title=Lieux culturels ou de culte non mis à jour::%s' % e, flush=True)
        if a.site:
            for f in ('ov_cult.json', 'ov_culte.json', 'cult.json', 'culte.json'):
                if f not in st.files and os.path.exists(os.path.join(a.site, f)): st.files[f] = open(os.path.join(a.site, f), 'rb').read()
    try:
        step_bouchaud.run(st); [done(k) for k in ('boa0', 'boa1', 'boa2')]
    except Exception as e:      # chaque semaine ; en cas d'échec on garde la version précédente
        print('::warning title=Projets Bouchaud non mis à jour::%s' % str(e)[:300], flush=True)
        for fn in ('ov_boa0.json', 'ov_boa1.json', 'ov_boa2.json'):
            if a.site and os.path.exists(os.path.join(a.site, fn)): st.files[fn] = open(os.path.join(a.site, fn), 'rb').read()
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
