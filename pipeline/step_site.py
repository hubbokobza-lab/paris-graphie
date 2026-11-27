"""Assemblage du site public : page HTML (version publique, sans DVF ; Sirene en comptages seulement) et fichiers figés."""
import shutil, glob
from core import *

def html():
    t = open(os.path.join(STATIC, 'template.html'), encoding='utf-8').read()
    e = open(os.path.join(STATIC, 'earcut.min.js'), encoding='utf-8').read()
    t = t.replace('<script src="https://cdn.jsdelivr.net/npm/earcut@2.2.4/dist/earcut.min.js"></script>', '<script>' + e + '</script>')
    lines = t.split('\n'); n0 = len(lines)
    lines = [l for l in lines if not (l.startswith(" {id:'") and "g:'Marché (DVF" in l)]   # Sirene : comptages publiés, noms non (loadSir désactivé)
    assert n0 - len(lines) == 2, n0 - len(lines)
    t = '\n'.join(lines)
    def rep(a, b):
        nonlocal t
        assert t.count(a) == 1, a[:60]; t = t.replace(a, b)
    rep("function loadSir(a){if(!SIRD[a])", "function loadSir(a){return Promise.resolve(null);if(!SIRD[a])")
    rep("const PUB=false;", "const PUB=true;")
    rep("rattachements des dossiers, ventes et établissements au bâtiment", "rattachements des dossiers au bâtiment")
    t = re.sub(r"const DV='\d+';", "const DV='%s';" % time.strftime('%Y%m%d%H%M'), t, count=1)
    return t

def run(st, out):
    os.makedirs(out, exist_ok=True)
    st.save(out)
    for f in glob.glob(os.path.join(STATIC, '*.json')):
        if not os.path.basename(f).startswith('sources_'): shutil.copy(f, out)
    for f in ('pg-copc.js', 'laz-perf.wasm', 'tuto-fiche.jpg', 'tuto-plan.jpg', 'tuto-coupe.jpg'):   # lecture du LiDAR HD dans l'outil Coupe (copc.js et laz-perf, licences MIT et Apache 2.0)
        shutil.copy(os.path.join(STATIC, f), out)
    open(os.path.join(out, 'index.html'), 'w', encoding='utf-8').write(html())
    open(os.path.join(out, '.nojekyll'), 'w').write('')
    open(os.path.join(out, 'maj.json'), 'w').write(json.dumps({'date': time.strftime('%Y-%m-%d %H:%M UTC', time.gmtime()), 'batiments': st.N}))
    log('site écrit :', len(os.listdir(out)), 'fichiers, %.1f Mo' % (sum(os.path.getsize(os.path.join(out, f)) for f in os.listdir(out)) / 1e6))
