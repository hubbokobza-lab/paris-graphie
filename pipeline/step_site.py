"""Assemblage du site public : page HTML (version publique : const PUB=true, sans DVF ; Sirene en comptages seulement) et fichiers figés."""
import shutil, glob
from core import *
import methodes

# fichiers statiques publiés tels quels avec la page (LiDAR HD de l'outil Coupe : copc.js et laz-perf, licences MIT et Apache 2.0 ; aperçus du tutoriel)
ASSETS = ('pg-copc.js', 'laz-perf.wasm', 'tuto-fiche.jpg', 'tuto-plan.jpg', 'tuto-coupe.jpg')

def html():
    t = open(os.path.join(STATIC, 'template.html'), encoding='utf-8').read()
    e = open(os.path.join(STATIC, 'earcut.min.js'), encoding='utf-8').read()
    t = t.replace('<script src="https://cdn.jsdelivr.net/npm/earcut@2.2.4/dist/earcut.min.js"></script>', '<script>' + e + '</script>')
    assert t.count('const PUB=false;') == 1, 'drapeau PUB introuvable dans template.html'
    t = t.replace('const PUB=false;', 'const PUB=true;')
    assert t.count('const METH=/*METH*/[];') == 1, 'emplacement de la méthodologie introuvable dans template.html'
    t = t.replace('const METH=/*METH*/[];', 'const METH=' + json.dumps(methodes.load(), ensure_ascii=False) + ';')
    if not methodes.readme_ok(): print('::warning title=README::méthodes du README différentes de static/methodes.json (python pipeline/methodes.py)', flush=True)
    t = re.sub(r"const DV='\d+';", "const DV='%s';" % time.strftime('%Y%m%d%H%M'), t, count=1)
    return t

def write_page(out):
    """Page, méthodologie et fichiers statiques : tout ce qui ne dépend pas des données."""
    for f in glob.glob(os.path.join(STATIC, '*.json')):
        if not os.path.basename(f).startswith(('sources_', 'methodes')): shutil.copy(f, out)
    for f in ASSETS: shutil.copy(os.path.join(STATIC, f), out)
    open(os.path.join(out, 'index.html'), 'w', encoding='utf-8').write(html())
    open(os.path.join(out, '.nojekyll'), 'w').write('')

def run(st, out):
    os.makedirs(out, exist_ok=True)
    st.save(out)
    write_page(out)
    open(os.path.join(out, 'maj.json'), 'w').write(json.dumps({'date': time.strftime('%Y-%m-%d %H:%M UTC', time.gmtime()), 'batiments': st.N}))
    log('site écrit :', len(os.listdir(out)), 'fichiers, %.1f Mo' % (sum(os.path.getsize(os.path.join(out, f)) for f in os.listdir(out)) / 1e6))
