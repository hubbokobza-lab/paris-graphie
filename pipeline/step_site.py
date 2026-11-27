"""Assemblage du site public : page HTML (version publique : const PUB=true, sans DVF ; Sirene en comptages seulement) et fichiers figés."""
import shutil, glob
from core import *
import methodes

# fichiers statiques publiés tels quels avec la page (LiDAR HD de l'outil Coupe : copc.js et laz-perf, licences MIT et Apache 2.0 ; aperçus du tutoriel)
ASSETS = ('pg-copc.js', 'laz-perf.wasm', 'tuto-fiche.jpg', 'tuto-plan.jpg', 'tuto-coupe.jpg')

SRC = os.path.join(STATIC, 'src')

def template():
    """Page source : static/page.html + static/src/style.css + static/src/*.js (dans l'ordre des noms).
    Les fichiers JS partagent une même portée (une fonction asynchrone qui enveloppe le tout) : l'ordre compte,
    chaque fichier peut utiliser ce que les précédents définissent."""
    page = open(os.path.join(STATIC, 'page.html'), encoding='utf-8').read()
    css = open(os.path.join(SRC, 'style.css'), encoding='utf-8').read().rstrip('\n')
    js = ''.join(open(f, encoding='utf-8').read() for f in sorted(glob.glob(os.path.join(SRC, '*.js'))))
    assert page.count('/*CSS*/') == 1 and page.count('/*JS*/') == 1
    return page.replace('/*CSS*/', css).replace('/*JS*/', '<script>\n(async function(){\n"use strict";\n' + js + '})();')

def html(hooks=False, dv=None):
    """hooks=True : accès de test (tests/batterie.py) aux outils internes ; jamais publié."""
    t = template()
    e = open(os.path.join(STATIC, 'earcut.min.js'), encoding='utf-8').read()
    t = t.replace('<script src="https://cdn.jsdelivr.net/npm/earcut@2.2.4/dist/earcut.min.js"></script>', '<script>' + e + '</script>')
    assert t.count('const PUB=false;') == 1, 'drapeau PUB introuvable dans static/src'
    t = t.replace('const PUB=false;', 'const PUB=true;')
    assert t.count('const METH=/*METH*/[];') == 1, 'emplacement de la méthodologie introuvable dans static/src'
    t = t.replace('const METH=/*METH*/[];', 'const METH=' + json.dumps(methodes.load(), ensure_ascii=False) + ';')
    if not methodes.readme_ok(): print('::warning title=README::méthodes du README différentes de static/methodes.json (python pipeline/methodes.py)', flush=True)
    # DV : version des données dans les URL (cache navigateur). Elle ne change que si les données changent,
    # pour qu'une simple republication de la page ne force pas à retélécharger 7 Mo.
    t = re.sub(r"const DV='\w+';", "const DV='%s';" % (dv or time.strftime('%Y%m%d%H%M')), t, count=1)
    if hooks: t = t.replace('window.parisGraphie={', 'window.__ms=()=>MS;window.__t={tuto:()=>tuto()};window.__cut=(a,b,c,d)=>cutShow(llToW(a,b),llToW(c,d));window.parisGraphie={', 1)
    return t

def write_page(out):
    """Page, méthodologie et fichiers statiques : tout ce qui ne dépend pas des données."""
    for f in glob.glob(os.path.join(STATIC, '*.json')):
        if not os.path.basename(f).startswith(('sources_', 'methodes')): shutil.copy(f, out)
    for f in ASSETS: shutil.copy(os.path.join(STATIC, f), out)
    import hashlib
    h = hashlib.sha1()
    for f in sorted(os.listdir(out)):
        if (f.endswith('.json') and f != 'maj.json') or f in ASSETS: h.update(f.encode()); h.update(open(os.path.join(out, f), 'rb').read())
    open(os.path.join(out, 'index.html'), 'w', encoding='utf-8').write(html(dv=h.hexdigest()[:12]))
    open(os.path.join(out, '.nojekyll'), 'w').write('')

def run(st, out):
    os.makedirs(out, exist_ok=True)
    st.save(out)
    write_page(out)
    open(os.path.join(out, 'maj.json'), 'w').write(json.dumps({'date': time.strftime('%Y-%m-%d %H:%M UTC', time.gmtime()), 'batiments': st.N}))
    log('site écrit :', len(os.listdir(out)), 'fichiers, %.1f Mo' % (sum(os.path.getsize(os.path.join(out, f)) for f in os.listdir(out)) / 1e6))
