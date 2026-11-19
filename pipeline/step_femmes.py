"""Femmes illustres à Paris (Ville de Paris, 2019) : portraits localisés et parcours."""
from core import *
from step_climat import capgeo

CAT = ['77 Illustres Parisiennes', 'Femmes de lettres', 'Artistes', 'Comédiennes', 'Scientifiques', 'Politiques', 'Sportives', 'Cheffes']

def run(st):
    pt = load_geojson(capgeo('SG_ParisCelebreLesFemmes', folder='SG'))
    def lab(p):
        return '%s : %s' % (p.get('name') or '', p.get('short_desc') or '')
    pt = [(g, p) for g, p in pt if g is not None and not g.is_empty]
    overlay(st, 'fem', pt, 'pt', lambda p: CAT.index(p['tab_name']) if p.get('tab_name') in CAT else 0, lab)
    # fiche : texte des portraits, rattaché par la position
    F = []
    for g, p in pt:
        ll = g.centroid if g.geom_type != 'Point' else g
        d = ' '.join(x.strip() for x in (p.get('desc%d' % i) for i in range(1, 6)) if x and x.strip())
        F.append([round(ll.x, 6), round(ll.y, 6), p.get('name') or '', p.get('tab_name') or '', p.get('short_desc') or '', d])
    st.put_file('fem.json', F)
    pc = load_geojson(capgeo('SG_ParisCelebreLesFemmes_Parcours', folder='SG'))
    overlay(st, 'femp', pc, 'line', lambda p: 0, lambda p: 'Parcours « Paris célèbre les femmes » (2019)')
