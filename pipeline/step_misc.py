"""Altitude du sol (relief figé), flux privés mis à zéro (version publique)."""
import numpy as np, struct
from core import *

def relief(st):
    raw = gzip.decompress(open(os.path.join(STATIC, 'mnt.json'), 'rb').read()); hl = struct.unpack('<I', raw[:4])[0]; h = json.loads(raw[4:4 + hl])
    q = np.frombuffer(raw[4 + hl:], '<u2').reshape(h['ny'], h['nx'])
    import shapely
    rp = st.geo().rp; px = shapely.get_x(rp); py = shapely.get_y(rp)
    ix = np.clip(((px - h['x0']) / h['r']).astype(int), 0, h['nx'] - 1); iy = np.clip(((py - h['y0']) / h['r']).astype(int), 0, h['ny'] - 1)
    st.put('zg', q[iy, ix].astype(np.uint16))

def private_zero(st):
    """DVF n'est pas publié sur le site : flux à zéro, format conservé (Sirene : step_sirene, comptages seulement)."""
    for k, t in [('dvf_n', 'B'), ('dvf_last', 'H'), ('pm2', 'H')]: st.zero(k, t)
    for k, t in [('s_ne', 'H'), ('s_eff', 'H'), ('s_act', 'B'), ('s_cl', 'B')]:
        if k not in st.S: st.zero(k, t)
