"""Assemblage du site public : page HTML (version publique, sans DVF ni Sirene) et fichiers figés."""
import shutil, glob
from core import *

def html():
    t = open(os.path.join(STATIC, 'template.html'), encoding='utf-8').read()
    e = open(os.path.join(STATIC, 'earcut.min.js'), encoding='utf-8').read()
    t = t.replace('<script src="https://cdn.jsdelivr.net/npm/earcut@2.2.4/dist/earcut.min.js"></script>', '<script>' + e + '</script>')
    lines = t.split('\n'); n0 = len(lines)
    lines = [l for l in lines if not (l.startswith(" {id:'") and ("g:'Marché (DVF" in l or "g:'Occupants (Sirene)'" in l))]
    assert n0 - len(lines) == 6, n0 - len(lines)
    t = '\n'.join(lines)
    def rep(a, b):
        nonlocal t
        assert t.count(a) == 1, a[:60]; t = t.replace(a, b)
    rep("function loadSir(a){if(!SIRD[a])", "function loadSir(a){return Promise.resolve(null);if(!SIRD[a])")
    rep(" ; DGFiP, « Demandes de valeurs foncières » géolocalisées par Etalab (ventes 2021-2025) ; Insee, base Sirene (stock du 01/11/2026)", "")
    rep("Les dossiers d\\'urbanisme, ventes et établissements sont rattachés", "Les dossiers d\\'urbanisme sont rattachés")
    rep("rattachements des dossiers, ventes et établissements au bâtiment", "rattachements des dossiers au bâtiment")
    t = re.sub(r"const DV='\d+';", "const DV='%s';" % time.strftime('%Y%m%d%H%M'), t, count=1)
    return t

def run(st, out):
    os.makedirs(out, exist_ok=True)
    st.save(out)
    for f in glob.glob(os.path.join(STATIC, '*.json')): shutil.copy(f, out)
    open(os.path.join(out, 'index.html'), 'w', encoding='utf-8').write(html())
    open(os.path.join(out, '.nojekyll'), 'w').write('')
    open(os.path.join(out, 'maj.json'), 'w').write(json.dumps({'date': time.strftime('%Y-%m-%d %H:%M UTC', time.gmtime()), 'batiments': st.N}))
    log('site écrit :', len(os.listdir(out)), 'fichiers, %.1f Mo' % (sum(os.path.getsize(os.path.join(out, f)) for f in os.listdir(out)) / 1e6))
