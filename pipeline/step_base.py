"""Emprise bâtie Apur : géométries et attributs de base (réinitialise l'état : nouveaux indices de bâtiments)."""
import numpy as np
from core import *

def run(st):
    F = arcgis('EMPRISE_BATIE_PARIS', 'OBJECTID,an_const,an_rehab,an_surelevation,c_perconst,h_med,h_max,n_sq_ar,b_igh,b_terrasse,m2_vegetal,b_psolaire,c_ens_moy',
               page=2000, extra='&geometryPrecision=7')
    nr, rl, ab, dl = [], [], [], []
    keep = []
    for f in F:
        g = f.get('geometry') or {}; rings = []
        for r in g.get('rings', []):
            a = np.round((np.asarray(r, float) - [LON0, LAT0]) / Q).astype(np.int64)
            if len(a) > 1 and (a[0] == a[-1]).all(): a = a[:-1]
            d = np.diff(a, axis=0); m = np.r_[True, np.any(d != 0, axis=1)]; a = a[m]
            if len(a) >= 3: rings.append(a)
        if not rings: continue
        def area2(a):   # double aire (formule du lacet, anneau fermé, coordonnées recentrées)
            b = (a - a[0]).astype(np.float64); c = np.roll(b, -1, axis=0)
            return abs(float(np.sum(b[:, 0] * c[:, 1] - c[:, 0] * b[:, 1])))
        rings.sort(key=lambda a: -area2(a))   # contour extérieur d'abord, puis les cours
        keep.append(f['attributes']); nr.append(min(255, len(rings)))
        for a in rings[:255]:
            rl.append(len(a)); ab += [int(a[0, 0]), int(a[0, 1])]
            dl += np.clip(np.diff(a, axis=0), -32768, 32767).ravel().tolist()
    N = len(keep)
    st.__init__()            # remise à zéro
    st.H['n'] = N
    v = lambda k, f=lambda x: x: np.array([f(a.get(k)) for a in keep])
    num = lambda x: 0 if x is None else x
    st.put('nr', np.array(nr, np.uint8)); st.put('rl', np.array(rl, np.uint16)); st.put('ab', np.array(ab, np.uint16)); st.put('dl', np.array(dl, np.int16))
    st.put('an_const', v('an_const', num).astype(np.uint16)); st.put('an_rehab', v('an_rehab', num).astype(np.uint16)); st.put('an_surel', v('an_surelevation', num).astype(np.uint16))
    st.put('h_med', np.clip(np.round(v('h_med', num).astype(float) * 10), 0, 65535).astype(np.uint16))
    st.put('h_max', np.clip(np.round(v('h_max', num).astype(float) * 10), 0, 65535).astype(np.uint16))
    st.put('ens', np.clip(v('c_ens_moy', num), 0, 65535).astype(np.uint16))
    st.put('veg', np.clip(np.round(v('m2_vegetal', num).astype(float)), 0, 65535).astype(np.uint16))
    st.zero('area', 'H')
    per = v('c_perconst', num); per[per == 99] = 13; st.put('per', np.clip(per, 0, 255).astype(np.uint8))
    st.put('igh', (v('b_igh') == 'O').astype(np.uint8)); st.put('ter', (v('b_terrasse') == 'O').astype(np.uint8)); st.put('sol', (v('b_psolaire') == 'O').astype(np.uint8))
    st.put('arr', np.array([(a['n_sq_ar'] - 750000000) if a.get('n_sq_ar') and 750000000 < a['n_sq_ar'] <= 750000020 else 0 for a in keep], np.uint8))
    st.arr = {a: {} for a in range(21)}
    log('base Apur :', N, 'bâtiments')
