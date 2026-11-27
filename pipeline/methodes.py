"""Méthodologie des indicateurs : source unique static/methodes.json.

Elle est injectée dans la page à l'assemblage (step_site.html), relue par l'API (step_api, via la page)
et recopiée dans le README entre deux marqueurs :  python pipeline/methodes.py
"""
import json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'static', 'methodes.json'); README = os.path.join(ROOT, 'README.md')
A, B = '<!-- méthodes : généré depuis static/methodes.json par python pipeline/methodes.py -->', '<!-- fin des méthodes -->'

def load():
    M = json.load(open(SRC, encoding='utf-8'))
    for x in M: assert x.get('indicateur') and x.get('methode'), x
    return M

def readme_block(M):
    return '\n'.join([A] + ['- **%s.** %s' % (x['indicateur'], x['methode']) for x in M] + [B])

def readme_ok():
    r = open(README, encoding='utf-8').read()
    return readme_block(load()) in r

def write_readme():
    r = open(README, encoding='utf-8').read()
    r2 = re.sub(re.escape(A) + r'.*?' + re.escape(B), lambda m: readme_block(load()), r, flags=re.S)
    assert A in r2, 'marqueurs absents du README'
    open(README, 'w', encoding='utf-8').write(r2)
    print('README : %d méthodes' % len(load()))

if __name__ == '__main__':
    write_readme()
