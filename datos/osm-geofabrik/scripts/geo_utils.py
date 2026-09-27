# -*- coding: utf-8 -*-
"""
geo_utils.py - utilidades SOLO stdlib (sin dependencias) para Tenerife Go.

  * GeoPackage: cabecera 'GP' + WKB (Point/LineString/Polygon/Multi*, con o sin Z/M)
  * Shapefile: lectura SHP (tipo 5 Polygon) + DBF
  * UTM huso 28N <-> WGS84 (series de Kruger 4o orden, error < 1 mm en el huso)
  * Punto-en-poligono (ray casting, regla par-impar) con indice por bandas
  * Rejilla de aristas para distancia punto-borde
  * Douglas-Peucker, area, centroide y punto interior
"""
import math
import struct

# ============================================================
#  GEOPACKAGE / WKB
# ============================================================
_ENV_BYTES = {0: 0, 1: 32, 2: 48, 3: 48, 4: 64}


def gpkg_header(blob):
    """-> (envelope | None, offset_wkb, vacia). envelope = (minx, maxx, miny, maxy)."""
    if blob is None or blob[0:2] != b'GP':
        raise ValueError('blob sin cabecera GP')
    flags = blob[3]
    fmt = '<' if (flags & 1) else '>'
    env_ind = (flags >> 1) & 7
    empty = bool((flags >> 4) & 1)
    env = struct.unpack_from(fmt + '4d', blob, 8) if env_ind else None
    return env, 8 + _ENV_BYTES[env_ind], empty


def wkb_read(buf, off=0):
    """-> (tipo, coords, offset_final). Tipos 1..7 (Z/M descartadas)."""
    fmt = '<' if buf[off] == 1 else '>'
    (t,) = struct.unpack_from(fmt + 'I', buf, off + 1)
    off += 5
    hz = bool(t & 0x80000000)
    hm = bool(t & 0x40000000)
    if t & 0x20000000:            # EWKB con SRID
        off += 4
    t &= 0x0FFFFFFF
    if t >= 3000:
        hz = hm = True
        t -= 3000
    elif t >= 2000:
        hm = True
        t -= 2000
    elif t >= 1000:
        hz = True
        t -= 1000
    dim = 2 + int(hz) + int(hm)
    step = 8 * dim

    def pts(o):
        (n,) = struct.unpack_from(fmt + 'I', buf, o)
        o += 4
        out = []
        for i in range(n):
            x, y = struct.unpack_from(fmt + '2d', buf, o + i * step)
            out.append((x, y))
        return out, o + n * step

    if t == 1:
        x, y = struct.unpack_from(fmt + '2d', buf, off)
        return 1, (x, y), off + step
    if t == 2:
        p, off = pts(off)
        return 2, p, off
    if t == 3:
        (nr,) = struct.unpack_from(fmt + 'I', buf, off)
        off += 4
        rings = []
        for _ in range(nr):
            r, off = pts(off)
            rings.append(r)
        return 3, rings, off
    if t in (4, 5, 6, 7):
        (ng,) = struct.unpack_from(fmt + 'I', buf, off)
        off += 4
        parts = []
        for _ in range(ng):
            st, sc, off = wkb_read(buf, off)
            parts.append((st, sc))
        if t == 7:
            return 7, parts, off
        return t, [sc for (st, sc) in parts], off
    raise ValueError('tipo WKB no soportado: %d' % t)


def gpkg_geom(blob):
    """-> (tipo, coords) o (None, None) si vacia."""
    env, o, empty = gpkg_header(blob)
    if empty:
        return None, None
    t, c, _ = wkb_read(blob, o)
    return t, c


def iter_coords(t, c):
    """Recorre todos los vertices (x, y) de una geometria."""
    if t == 1:
        yield c
    elif t in (2, 4):
        for p in c:
            yield p
    elif t in (3, 5):
        for r in c:
            for p in r:
                yield p
    elif t == 6:
        for poly in c:
            for r in poly:
                for p in r:
                    yield p
    elif t == 7:
        for (st, sc) in c:
            for p in iter_coords(st, sc):
                yield p


def envelope(t, c):
    xs, ys = [], []
    for x, y in iter_coords(t, c):
        xs.append(x)
        ys.append(y)
    if not xs:
        return None
    return (min(xs), max(xs), min(ys), max(ys))


def blob_envelope(blob):
    """Envelope (minx, maxx, miny, maxy) desde cabecera o, si falta, desde el WKB."""
    env, o, empty = gpkg_header(blob)
    if empty:
        return None
    if env is not None:
        return env
    t, c, _ = wkb_read(blob, o)
    if t == 1:
        return (c[0], c[0], c[1], c[1])
    return envelope(t, c)


# ============================================================
#  SHAPEFILE (Polygon) + DBF
# ============================================================
def read_dbf(path, encoding='cp1252'):
    f = open(path, 'rb').read()
    nrec = struct.unpack('<I', f[4:8])[0]
    hlen, rlen = struct.unpack('<HH', f[8:12])
    fields = []
    off = 32
    while f[off] != 0x0D:
        name = f[off:off + 11].split(b'\0')[0].decode('ascii')
        typ = chr(f[off + 11])
        ln = f[off + 16]
        dc = f[off + 17]
        fields.append((name, typ, ln, dc))
        off += 32
    rows = []
    p = hlen
    for _ in range(nrec):
        r = f[p:p + rlen]
        p += rlen
        if r[0:1] == b'*':
            rows.append(None)       # borrado
            continue
        q = 1
        row = {}
        for (n, t, l, d) in fields:
            raw = r[q:q + l].decode(encoding).strip()
            q += l
            if t in ('N', 'F'):
                row[n] = float(raw) if raw else None
            else:
                row[n] = raw
        rows.append(row)
    return fields, rows


def read_shp_polygons(path):
    """-> lista de registros; cada uno = lista de anillos [(x, y), ...] (cerrados)."""
    f = open(path, 'rb').read()
    code = struct.unpack('>i', f[0:4])[0]
    stype = struct.unpack('<i', f[32:36])[0]
    if code != 9994 or stype not in (5, 15, 25):
        raise ValueError('SHP no es Polygon (tipo %d)' % stype)
    out = []
    p = 100
    n = len(f)
    while p < n:
        _, clen = struct.unpack('>ii', f[p:p + 8])
        c = p + 8
        st = struct.unpack('<i', f[c:c + 4])[0]
        if st == 0:
            out.append([])
        else:
            nparts, npts = struct.unpack('<ii', f[c + 36:c + 44])
            parts = list(struct.unpack('<%di' % nparts, f[c + 44:c + 44 + 4 * nparts]))
            po = c + 44 + 4 * nparts
            xy = struct.unpack('<%dd' % (2 * npts), f[po:po + 16 * npts])
            pts = list(zip(xy[0::2], xy[1::2]))
            parts.append(npts)
            out.append([pts[parts[i]:parts[i + 1]] for i in range(nparts)])
        p = c + clen * 2
    return out


# ============================================================
#  UTM 28N <-> WGS84  (Kruger, n-series; Karney 2011 / Kawase 2011)
# ============================================================
_A = 6378137.0
_F = 1 / 298.257223563
_N = _F / (2 - _F)
_AA = _A / (1 + _N) * (1 + _N ** 2 / 4 + _N ** 4 / 64)
_ALPHA = (
    _N / 2 - 2 * _N ** 2 / 3 + 5 * _N ** 3 / 16 + 41 * _N ** 4 / 180,
    13 * _N ** 2 / 48 - 3 * _N ** 3 / 5 + 557 * _N ** 4 / 1440,
    61 * _N ** 3 / 240 - 103 * _N ** 4 / 140,
    49561 * _N ** 4 / 161280,
)
_BETA = (
    _N / 2 - 2 * _N ** 2 / 3 + 37 * _N ** 3 / 96 - _N ** 4 / 360,
    _N ** 2 / 48 + _N ** 3 / 15 - 437 * _N ** 4 / 1440,
    17 * _N ** 3 / 480 - 37 * _N ** 4 / 840,
    4397 * _N ** 4 / 161280,
)
_DELTA = (
    2 * _N - 2 * _N ** 2 / 3 - 2 * _N ** 3 + 116 * _N ** 4 / 45,
    7 * _N ** 2 / 3 - 8 * _N ** 3 / 5 - 227 * _N ** 4 / 45,
    56 * _N ** 3 / 15 - 136 * _N ** 4 / 35,
    4279 * _N ** 4 / 630,
)
_K0 = 0.9996
_E0 = 500000.0
_LON0 = math.radians(-15.0)      # meridiano central huso 28
_C2 = 2 * math.sqrt(_N) / (1 + _N)


def wgs84_to_utm28(lon, lat):
    phi = math.radians(lat)
    dl = math.radians(lon) - _LON0
    t = math.sinh(math.atanh(math.sin(phi)) - _C2 * math.atanh(_C2 * math.sin(phi)))
    xi_ = math.atan2(t, math.cos(dl))
    eta_ = math.atanh(math.sin(dl) / math.sqrt(1 + t * t))
    xi, eta = xi_, eta_
    for j, a in enumerate(_ALPHA, 1):
        xi += a * math.sin(2 * j * xi_) * math.cosh(2 * j * eta_)
        eta += a * math.cos(2 * j * xi_) * math.sinh(2 * j * eta_)
    return _E0 + _K0 * _AA * eta, _K0 * _AA * xi


def utm28_to_wgs84(e, n):
    xi = n / (_K0 * _AA)
    eta = (e - _E0) / (_K0 * _AA)
    xi_, eta_ = xi, eta
    for j, b in enumerate(_BETA, 1):
        xi_ -= b * math.sin(2 * j * xi) * math.cosh(2 * j * eta)
        eta_ -= b * math.cos(2 * j * xi) * math.sinh(2 * j * eta)
    chi = math.asin(math.sin(xi_) / math.cosh(eta_))
    phi = chi
    for j, d in enumerate(_DELTA, 1):
        phi += d * math.sin(2 * j * chi)
    lam = _LON0 + math.atan2(math.sinh(eta_), math.cos(xi_))
    return math.degrees(lam), math.degrees(phi)


# ============================================================
#  GEOMETRIA PLANA
# ============================================================
def ring_edges(ring):
    """Aristas de un anillo (cerrado o no)."""
    if len(ring) < 2:
        return []
    if ring[0] == ring[-1]:
        return list(zip(ring[:-1], ring[1:]))
    return list(zip(ring, ring[1:] + ring[:1]))


def ring_area_signed(ring):
    s = 0.0
    for (x1, y1), (x2, y2) in ring_edges(ring):
        s += x1 * y2 - x2 * y1
    return s / 2.0


def ring_centroid(ring):
    a = 0.0
    cx = cy = 0.0
    for (x1, y1), (x2, y2) in ring_edges(ring):
        cr = x1 * y2 - x2 * y1
        a += cr
        cx += (x1 + x2) * cr
        cy += (y1 + y2) * cr
    a /= 2.0
    if a == 0:
        xs = [p[0] for p in ring]
        ys = [p[1] for p in ring]
        return sum(xs) / len(xs), sum(ys) / len(ys), 0.0
    return cx / (6 * a), cy / (6 * a), a


def point_in_rings(x, y, rings):
    """Regla par-impar sobre todos los anillos (exterior + huecos)."""
    inside = False
    for ring in rings:
        for (x1, y1), (x2, y2) in ring_edges(ring):
            if (y1 > y) != (y2 > y):
                if x < x1 + (y - y1) * (x2 - x1) / (y2 - y1):
                    inside = not inside
    return inside


def seg_dist(px, py, x1, y1, x2, y2):
    """Distancia punto-segmento (al segmento, no al vertice)."""
    dx, dy = x2 - x1, y2 - y1
    L = dx * dx + dy * dy
    if L == 0:
        return math.hypot(px - x1, py - y1)
    u = ((px - x1) * dx + (py - y1) * dy) / L
    u = 0.0 if u < 0 else (1.0 if u > 1 else u)
    return math.hypot(px - (x1 + u * dx), py - (y1 + u * dy))


def douglas_peucker(pts, tol):
    """Simplificacion D-P iterativa (conserva extremos)."""
    n = len(pts)
    if n < 3:
        return list(pts)
    keep = [False] * n
    keep[0] = keep[-1] = True
    stack = [(0, n - 1)]
    while stack:
        i, j = stack.pop()
        x1, y1 = pts[i]
        x2, y2 = pts[j]
        dmax, idx = -1.0, -1
        for k in range(i + 1, j):
            d = seg_dist(pts[k][0], pts[k][1], x1, y1, x2, y2)
            if d > dmax:
                dmax, idx = d, k
        if dmax > tol:
            keep[idx] = True
            stack.append((i, idx))
            stack.append((idx, j))
    return [p for p, k in zip(pts, keep) if k]


def simplify_ring(ring, tol):
    """D-P de un anillo cerrado partiendolo en dos mitades (evita colapsar)."""
    closed = ring[0] == ring[-1]
    r = ring[:-1] if closed else ring[:]
    if len(r) < 4:
        return ring
    m = len(r) // 2
    a = douglas_peucker(r[:m + 1], tol)
    b = douglas_peucker(r[m:] + [r[0]], tol)
    out = a[:-1] + b
    if len(out) < 4:
        return ring
    return out


# ============================================================
#  INDICES
# ============================================================
class PolyIndex(object):
    """Punto-en-poligono rapido: aristas agrupadas en bandas horizontales."""

    def __init__(self, rings, band_edges=24):
        xs = [p[0] for r in rings for p in r]
        ys = [p[1] for r in rings for p in r]
        self.minx, self.maxx = min(xs), max(xs)
        self.miny, self.maxy = min(ys), max(ys)
        edges = []
        for r in rings:
            for (x1, y1), (x2, y2) in ring_edges(r):
                if y1 != y2:
                    edges.append((x1, y1, x2, y2))
        nb = max(1, min(4096, len(edges) // band_edges))
        self.nb = nb
        self.h = (self.maxy - self.miny) / nb or 1.0
        self.bands = [[] for _ in range(nb)]
        for e in edges:
            lo, hi = (e[1], e[3]) if e[1] < e[3] else (e[3], e[1])
            b0 = max(0, min(nb - 1, int((lo - self.miny) / self.h)))
            b1 = max(0, min(nb - 1, int((hi - self.miny) / self.h)))
            for b in range(b0, b1 + 1):
                self.bands[b].append(e)

    def contains(self, x, y):
        if x < self.minx or x > self.maxx or y < self.miny or y > self.maxy:
            return False
        b = max(0, min(self.nb - 1, int((y - self.miny) / self.h)))
        inside = False
        for x1, y1, x2, y2 in self.bands[b]:
            if (y1 > y) != (y2 > y):
                if x < x1 + (y - y1) * (x2 - x1) / (y2 - y1):
                    inside = not inside
        return inside


class EdgeGrid(object):
    """Rejilla de aristas etiquetadas para 'borde mas cercano' (coordenadas en metros)."""

    def __init__(self, cell=500.0):
        self.cell = cell
        self.g = {}

    def add_ring(self, ring, label):
        c = self.cell
        for (x1, y1), (x2, y2) in ring_edges(ring):
            i0, i1 = int(math.floor(min(x1, x2) / c)), int(math.floor(max(x1, x2) / c))
            j0, j1 = int(math.floor(min(y1, y2) / c)), int(math.floor(max(y1, y2) / c))
            for i in range(i0, i1 + 1):
                for j in range(j0, j1 + 1):
                    self.g.setdefault((i, j), []).append((x1, y1, x2, y2, label))

    def nearest(self, x, y, max_dist):
        c = self.cell
        r = int(math.ceil(max_dist / c))
        ci, cj = int(math.floor(x / c)), int(math.floor(y / c))
        best, blabel = None, None
        for i in range(ci - r, ci + r + 1):
            for j in range(cj - r, cj + r + 1):
                for x1, y1, x2, y2, lab in self.g.get((i, j), ()):
                    d = seg_dist(x, y, x1, y1, x2, y2)
                    if best is None or d < best:
                        best, blabel = d, lab
        if best is None or best > max_dist:
            return None, None
        return best, blabel


def polygon_centroid(rings):
    """Centroide de area de un poligono (anillo 0 exterior, resto huecos) -> (cx, cy, area>=0)."""
    cx, cy, a = ring_centroid(rings[0])
    A = abs(a)
    sx, sy = cx * A, cy * A
    for h in rings[1:]:
        hx, hy, ha = ring_centroid(h)
        ha = abs(ha)
        A -= ha
        sx -= hx * ha
        sy -= hy * ha
    if A <= 0:
        return rings[0][0][0], rings[0][0][1], 0.0
    return sx / A, sy / A, A


def point_on_surface(polys):
    """Punto garantizado DENTRO del poligono mayor de un (multi)poligono.
    polys: lista de poligonos (cada uno lista de anillos).
    -> ((x, y), metodo) con metodo en {'centroide', 'interior', 'vertice'}."""
    best, bc = None, None
    for p in polys:
        c = polygon_centroid(p)
        if best is None or c[2] > bc[2]:
            best, bc = p, c
    cx, cy, _ = bc
    if point_in_rings(cx, cy, best):
        return (cx, cy), 'centroide'
    ys = [pt[1] for pt in best[0]]
    for yy in (cy, (min(ys) + max(ys)) / 2.0):
        xs = []
        for ring in best:
            for (x1, y1), (x2, y2) in ring_edges(ring):
                if (y1 > yy) != (y2 > yy):
                    xs.append(x1 + (yy - y1) * (x2 - x1) / (y2 - y1))
        xs.sort()
        if len(xs) >= 2:
            segs = [(xs[i], xs[i + 1]) for i in range(0, len(xs) - 1, 2)]
            a, b = max(segs, key=lambda s: s[1] - s[0])
            return ((a + b) / 2.0, yy), 'interior'
    return best[0][0], 'vertice'


def m_por_grado(lat):
    """Metros por grado de latitud y de longitud (WGS84) a la latitud dada."""
    p = math.radians(lat)
    mlat = 111132.954 - 559.822 * math.cos(2 * p) + 1.175 * math.cos(4 * p)
    mlon = 111412.84 * math.cos(p) - 93.5 * math.cos(3 * p) + 0.118 * math.cos(5 * p)
    return mlat, mlon


def area_m2_lonlat(polys):
    """Area aproximada (m2) de un (multi)poligono en lon/lat (escala local, error < 0.5%)."""
    tot = 0.0
    for p in polys:
        cx, cy, a = polygon_centroid(p)
        mlat, mlon = m_por_grado(cy)
        tot += a * mlat * mlon
    return tot


def as_polys(t, c):
    """Normaliza Polygon (3) / MultiPolygon (6) a lista de poligonos."""
    if t == 3:
        return [c]
    if t == 6:
        return c
    raise ValueError('no es poligono: %r' % t)


# ============================================================
#  VARIOS
# ============================================================
import re as _re
import unicodedata as _ud


def norm_nombre(s):
    """minusculas, sin tildes ni signos, espacios simples (para comparar nombres)."""
    s = _ud.normalize('NFKD', (s or '').lower())
    s = ''.join(ch for ch in s if not _ud.combining(ch))
    s = _re.sub(r'[^a-z0-9]+', ' ', s)
    return ' '.join(s.split())


def haversine_m(lon1, lat1, lon2, lat2):
    R = 6371008.8
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = p2 - p1
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))
