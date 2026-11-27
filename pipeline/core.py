"""Paris-graphie : socle commun de la chaîne de mise à jour.

L'état (« State ») correspond exactement aux fichiers publiés du site :
data.json (flux par bâtiment), arr_XX.json (détails par arrondissement), ov_*.json (calques), etc.
Chaque module lit ses sources, remplace ses propres flux et clés, et laisse le reste intact.
"""
import gzip, json, os, re, struct, time, math, unicodedata, collections, subprocess, urllib.parse, urllib.request
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.environ.get('PG_RAW', os.path.join(ROOT, 'work', 'raw'))
STATIC = os.path.join(ROOT, 'static')
os.makedirs(RAW, exist_ok=True)

LON0, LAT0, Q = 2.2255, 48.8162, 5e-6
KX = 111320 * math.cos(math.radians(LAT0)); KY = 110574
DT = {'B': 'u1', 'H': '<u2', 'h': '<i2', 'I': '<u4'}
UA = {'User-Agent': 'paris-graphie-maj/1.0 (+https://paris-graphie.bouchaudarchitectes.com/)'}

def log(*a): print(time.strftime('%H:%M:%S'), *a, flush=True)

# ---------------------------------------------------------------- téléchargements
def http(url, tries=5, timeout=300):
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=timeout) as r:
                return r.read()
        except Exception as e:
            if i == tries - 1: raise
            log('  nouvel essai', i + 1, url[:90], e); time.sleep(5 * (i + 1))

def get_json(url, **k): return json.loads(http(url, **k))

def fetch(url, name, max_age_h=20, min_size=200):
    """Télécharge url vers RAW/name (avec cache court pour éviter de refaire pendant une même exécution)."""
    p = os.path.join(RAW, name)
    if os.path.exists(p) and os.path.getsize(p) >= min_size and time.time() - os.path.getmtime(p) < max_age_h * 3600:
        return p
    tmp = p + '.part'; err = ''
    for i in range(5):
        r = subprocess.run(['curl', '-sSL', '--fail', '-m', '1800', '-A', UA['User-Agent'], '-o', tmp, url], capture_output=True, text=True)
        if r.returncode == 0 and os.path.exists(tmp):
            with open(tmp, 'rb') as f: head = f.read(2)
            if head == b'\x1f\x8b':   # fichier ou réponse compressés : on décompresse avant de contrôler la taille
                data = gzip.decompress(open(tmp, 'rb').read()); open(tmp, 'wb').write(data)
            if os.path.getsize(tmp) >= min_size: break
            err = 'fichier trop petit (%d octets)' % os.path.getsize(tmp)
        else:
            err = 'curl %d %s' % (r.returncode, (r.stderr or '').strip()[:200])
        log('  nouvel essai', i + 1, name, err); time.sleep(10 * (i + 1))
    else:
        raise RuntimeError('téléchargement impossible : %s (%s)' % (url, err))
    os.replace(tmp, p); log('  ', name, '%.1f Mo' % (os.path.getsize(p) / 1e6))
    return p

def ods(dataset, fmt='geojson', name=None, **k):
    """Export complet d'un jeu de données opendata.paris.fr."""
    return fetch('https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/%s/exports/%s' % (dataset, fmt), name or '%s.%s' % (dataset, fmt), **k)

def arcgis(service, fields='*', where='1=1', geometry=True, page=2000, extra=''):
    """Toutes les entités d'une couche ArcGIS (Apur), en pages, triées par OBJECTID."""
    b = 'https://carto2.apur.org/apur/rest/services/OPENDATA/%s/MapServer/0/query' % service
    w = urllib.parse.quote(where)
    n = get_json(b + '?where=%s&returnCountOnly=true&f=json' % w)['count']
    out = []; off = 0
    while off < n:
        r = get_json(b + '?where=%s&outFields=%s&returnGeometry=%s&outSR=4326&orderByFields=OBJECTID&resultOffset=%d&resultRecordCount=%d%s&f=json'
                     % (w, fields, 'true' if geometry else 'false', off, page, extra))
        fs = r.get('features', [])
        if not fs: break
        out += fs; off += len(fs)
    log('  Apur', service, len(out), '/', n)
    if len(out) < n * 0.98: raise RuntimeError('Apur %s incomplet (%d / %d)' % (service, len(out), n))
    return out

# ---------------------------------------------------------------- état du site
class State:
    def __init__(self, d=None):
        self.H = {'n': 0, 'lon0': LON0, 'lat0': LAT0, 'q': Q}
        self.S = collections.OrderedDict()   # nom -> (type, ndarray)
        self.arr = {}                         # a -> dict
        self.files = {}                       # nom de fichier publié -> bytes (gz) à écrire
        self._geo = None
        if d: self.load(d)

    # -- lecture / écriture
    def load(self, d):
        raw = gzip.decompress(open(os.path.join(d, 'data.json'), 'rb').read())
        hl = struct.unpack('<I', raw[:4])[0]; H = json.loads(raw[4:4 + hl]); o = 4 + hl
        for k, t, n in H.pop('streams'):
            a = np.frombuffer(raw, dtype=DT[t], count=n, offset=o).copy(); o += a.nbytes; self.S[k] = (t, a)
        self.H.update(H)
        for a in range(21):
            p = os.path.join(d, 'arr_%02d.json' % a)
            if os.path.exists(p): self.arr[a] = json.loads(gzip.decompress(open(p, 'rb').read()))
        log('état chargé :', self.N, 'bâtiments,', len(self.S), 'flux')

    def save(self, d):
        os.makedirs(d, exist_ok=True)
        hj = json.dumps(dict(self.H, streams=[[k, t, len(a)] for k, (t, a) in self.S.items()])).encode()
        body = b''.join(a.astype(np.dtype(DT[t])).tobytes() for k, (t, a) in self.S.items())
        open(os.path.join(d, 'data.json'), 'wb').write(gzip.compress(struct.pack('<I', len(hj)) + hj + body, 9))
        for a, v in self.arr.items():
            open(os.path.join(d, 'arr_%02d.json' % a), 'wb').write(gzip.compress(json.dumps(v, ensure_ascii=False, separators=(',', ':')).encode(), 9))
        for name, b in self.files.items(): open(os.path.join(d, name), 'wb').write(b)

    @property
    def N(self): return int(self.H['n'])
    def s(self, k): return self.S[k][1]
    def put(self, k, a, t=None):
        a = np.asarray(a)
        if t is None: t = {'uint8': 'B', 'uint16': 'H', 'int16': 'h', 'uint32': 'I'}[a.dtype.name]
        assert len(a) == self.N or k in ('rl', 'ab', 'dl'), (k, len(a), self.N)
        self.S[k] = (t, a.astype(np.dtype(DT[t])))
    def zero(self, k, t):
        self.put(k, np.zeros(self.N, np.dtype(DT[t])), t)
    def set_arr(self, key, per_building):
        """per_building : {indice bâtiment: valeur} -> clé `key` de chaque arr_XX."""
        ARR = self.s('arr'); by = collections.defaultdict(dict)
        for b, v in per_building.items(): by[int(ARR[int(b)])][str(int(b))] = v
        for a in range(21):
            self.arr.setdefault(a, {})[key] = by.get(a, {})
    def put_file(self, name, obj):
        self.files[name] = gzip.compress(json.dumps(obj, ensure_ascii=False, separators=(',', ':')).encode(), 9)

    # -- géométrie des bâtiments
    def geo(self):
        if self._geo is None: self._geo = Geo(self)
        return self._geo

def build_poly(rings):
    """Anneaux triés par aire décroissante : un anneau contenu dans un nombre impair d'anneaux plus grands est une cour,
    sinon c'est une partie séparée du bâtiment (bâtiments en plusieurs morceaux, comme l'Arc de triomphe)."""
    from shapely.geometry import Polygon, MultiPolygon, Point
    from shapely.prepared import prep
    if len(rings) == 1: return Polygon(rings[0])
    P = [Polygon(r) for r in rings]; PP = [prep(p) for p in P]; ex = []
    for i, r in enumerate(rings):
        pt = Point(r[0]); par = [q for q in range(i) if PP[q].contains(pt)]
        if len(par) % 2 == 0: ex.append([i, []])
        else:
            e = next((e for e in reversed(ex) if e[0] in par), ex[0]); e[1].append(i)
    if len(ex) == 1: return Polygon(rings[0], [rings[h] for h in ex[0][1]])
    return MultiPolygon([Polygon(rings[e], [rings[h] for h in hs]) for e, hs in ex])

class Geo:
    def __init__(self, st):
        import shapely
        from shapely.geometry import Polygon
        self.shapely = shapely
        nr, rl, ab, dl = st.s('nr'), st.s('rl'), st.s('ab'), st.s('dl')
        kx = Q * KX; ky = Q * KY
        polys = []; ri = 0; dp = 0
        for s in range(st.N):
            rings = []
            for r in range(int(nr[s])):
                L = int(rl[ri]); x0, y0 = int(ab[2 * ri]), int(ab[2 * ri + 1])
                seg = dl[dp:dp + 2 * (L - 1)].astype(np.int64).reshape(-1, 2)
                pts = np.vstack([[0, 0], np.cumsum(seg, axis=0)]) + [x0, y0]
                dp += 2 * (L - 1); ri += 1
                rings.append(np.c_[pts[:, 0] * kx, pts[:, 1] * ky])
            polys.append(build_poly(rings) if len(rings[0]) >= 3 else Polygon())
        polys = np.array(polys, dtype=object)
        bad = ~shapely.is_valid(polys); polys[bad] = shapely.make_valid(polys[bad])
        self.polys = polys; self.areas = shapely.area(polys); self.tree = shapely.STRtree(polys)
        self.rp = shapely.point_on_surface(polys)
        log('géométries :', len(polys), 'bâtiments,', int(bad.sum()), 'réparés')

    def locate(self, lon, lat, maxd=20):
        shapely = self.shapely
        x = (np.asarray(lon, float) - LON0) * KX; y = (np.asarray(lat, float) - LAT0) * KY
        pts = shapely.points(x, y); res = np.full(len(pts), -1, int)
        if len(pts) == 0: return res
        pi, bi = self.tree.query(pts, predicate='within')
        order = np.argsort(-self.areas[bi]); res[pi[order]] = bi[order]
        un = np.where(res < 0)[0]
        if len(un):
            qi, bj = self.tree.query_nearest(pts[un], max_distance=maxd, all_matches=False); res[un[qi]] = bj
        return res

def proj(g):
    import shapely
    return shapely.transform(g, lambda a: np.c_[(a[:, 0] - LON0) * KX, (a[:, 1] - LAT0) * KY])

def norm(s):
    s = unicodedata.normalize('NFKD', str(s).lower()); s = ''.join(c for c in s if not unicodedata.combining(c))
    return re.sub(r'[^a-z0-9]+', ' ', s).strip()
SUF = {'b': 'bis', 't': 'ter', 'q': 'quater', 'c': 'quater', 'bis': 'bis', 'ter': 'ter', 'quater': 'quater'}

# ---------------------------------------------------------------- calques (format ov_*.json)
def enc_path(coords):
    c = np.round(np.asarray(coords) * 10).astype(np.int64)
    d = np.diff(c, axis=0); keep = np.any(d != 0, axis=1)
    return [int(c[0, 0]), int(c[0, 1])] + [int(v) for v in d[keep].ravel()]

def paths(g, tol):
    if g is None or g.is_empty: return []
    if tol: g = g.simplify(tol)
    res = []
    def add(x):
        if x.geom_type == 'Polygon':
            res.append(enc_path(x.exterior.coords))
            for r in x.interiors: res.append(enc_path(r.coords))
        elif x.geom_type == 'LineString': res.append(enc_path(x.coords))
        elif hasattr(x, 'geoms'):
            for y in x.geoms: add(y)
    add(g); return [p for p in res if len(p) >= 4]

def overlay(st, oid, feats, kind, cls=lambda p: 0, prop=lambda p: 0, tol=0.3, bbox=None):
    out = []
    for g, p in feats:
        if g is None or g.is_empty or (bbox is not None and not g.intersects(bbox)): continue
        if kind == 'pt':
            c = g if g.geom_type == 'Point' else g.centroid
            out.append([cls(p), prop(p), int(round(c.x * 10)), int(round(c.y * 10))])
        else:
            ps = paths(g, tol)
            if ps: out.append([cls(p), prop(p), ps])
    st.put_file('ov_%s.json' % oid, {'k': kind, 'f': out})
    log('  calque %-9s %6d objets' % (oid, len(out)))

PARIS_ENV = json.dumps({"xmin": 2.2241, "ymin": 48.8155, "xmax": 2.4699, "ymax": 48.9022, "spatialReference": {"wkid": 4326}})

def arcgis_geojson(service, where='1=1', page=1000, paris=True):
    """Couche ArcGIS Apur au format GeoJSON (WGS84), toutes pages, limitée à l'emprise de Paris."""
    b = 'https://carto2.apur.org/apur/rest/services/OPENDATA/%s/MapServer/0/query' % service
    w = urllib.parse.quote(where)
    if paris: w += '&geometry=%s&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects' % urllib.parse.quote(PARIS_ENV)
    n = get_json(b + '?where=%s&returnCountOnly=true&f=json' % w)['count']
    feats = []; off = 0
    while off < n:
        r = get_json(b + '?where=%s&outFields=*&outSR=4326&orderByFields=OBJECTID&resultOffset=%d&resultRecordCount=%d&f=geojson' % (w, off, page))
        f = r.get('features', [])
        if not f: break
        feats += f; off += len(f)
    log('  Apur', service, len(feats), '/', n)
    if len(feats) < n * 0.98: raise RuntimeError('Apur %s incomplet' % service)
    return feats

def load_geojson(path_or_feats):
    from shapely.geometry import shape
    fs = json.load(open(path_or_feats))['features'] if isinstance(path_or_feats, str) else path_or_feats
    return [(proj(shape(x['geometry'])), x['properties']) for x in fs if x.get('geometry')]
