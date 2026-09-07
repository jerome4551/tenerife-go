#!/usr/bin/env python3
"""
orientacion_osm.py — deducir hacia donde mira una playa, con la costa de OSM.

    python3 tools/orientacion_osm.py            # solo el control
    python3 tools/orientacion_osm.py --todas    # y la propuesta para las 66

POR QUE OTRO INTENTO
  El primero -tools/orientacion.py- usaba GSHHG y su propio control lo tumbo:
  reproducia 10 de las 22 orientaciones que ya existian. El fallo era de la
  costa, no del metodo: GSHHG a resolucion "full" se come las calas, 250-500 m.
  La app lleva desde septiembre un mapa de OSM propio -mapa/tenerife-osm.pmtiles,
  z14- con capa `water`. Esa costa es de otro orden de fidelidad, y ya estaba
  en el repositorio.

EL METODO
  No se mide la normal del borde mas cercano: un borde suelto de un islote o
  de una roca apunta a cualquier sitio. Se pregunta "desde aqui, ?por donde
  hay mar?": se lanzan 180 rayos, se mira a 100, 200, 300, 400 y 500 m cual
  cae dentro de agua, y se toma la MEDIA CIRCULAR de los que si. Eso da un
  rumbo continuo, que luego se redondea a los 8 rumbos que usa la app.

EL CONTROL, QUE ES LO QUE DECIDE
  12 orientaciones estan escritas a mano y son las fiables. Si el metodo no
  las reproduce, no vale, y no se acepta ninguna de las 66. Igual que la vez
  anterior: el control manda, no las ganas de cerrar el asunto.

RESULTADO — TAMPOCO VALE, Y ESO CAMBIA EL DIAGNOSTICO
  Con la costa de OSM, que es mucho mejor que GSHHG:

    metodo                                exactas   a un rumbo   peor
    GSHHG, abanico de rayos (el 1o)       10 / 22        -         -
    OSM, media circular del agua           6 / 12        4         2
    OSM, normal a la linea de costa        5 / 12        1         6

  Los tres rondan el 45-50 %. Y el barrido de radios ensena lo importante: la
  media circular da 6/12 con radios de 200-500 m y baja a 1/12 con 50 m. Si
  el problema fuera la fidelidad de la costa, acercarse tendria que MEJORARLO.
  Empeora. Asi que el diagnostico anterior -"falta una costa con fidelidad
  <= 50 m"- era el equivocado: la costa buena ya estaba en el repositorio
  desde septiembre y no arregla nada.

  Lo que pasa es que `ori` no es "por donde hay mar". Es hacia donde da el
  frente de la playa, y eso lo decide el trazado local de la orilla y por
  donde entra la mar de fondo, no el reparto de agua alrededor del pin. Y
  `badWind` no es geometrico en absoluto: Las Vistas no lleva NE porque el
  alisio entra ahi de tierra a mar y encima lo frenan el relieve y la Montana
  de Guaza. Eso no esta en ningun poligono.

  Dos discrepancias son coherentes entre los dos metodos de OSM y merecen que
  alguien que conozca el sitio las mire: teresitas (a mano NE, la geometria
  dice SE ~155) y playa-amarilla (a mano SW, la geometria dice SE ~141). No
  las toco: las escritas a mano son el control por decision del proyecto.
"""
import gzip, math, os, re, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAPA = os.path.join(RAIZ, 'mapa', 'tenerife-osm.pmtiles')
Z, EXT, R = 14, 4096, 6371000.0
RUMBOS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']

def a_rumbo(g):
    return RUMBOS[int((g % 360) / 45.0 + 0.5) % 8]

def sep(a, b):
    """separacion en pasos de 45 grados entre dos rumbos (0..4)"""
    d = abs(RUMBOS.index(a) - RUMBOS.index(b))
    return min(d, 8 - d)

def main():
    if not os.path.exists(MAPA):
        print('  --  no hay mapa/tenerife-osm.pmtiles'); return 0
    from pmtiles.reader import Reader, MmapSource
    from pmtiles.tile import Compression
    import mapbox_vector_tile as mvt

    src = open(os.path.join(RAIZ, 'index.html'), encoding='utf-8').read()

    # PLAYAS_ORIENTACION, por emparejamiento de llaves
    o = src.index('{', src.index('const PLAYAS_ORIENTACION'))
    d, q, k = 0, None, o
    while k < len(src):
        c, p = src[k], src[k-1]
        if q:
            if c == q and p != '\\': q = None
        elif c in '"\'`': q = c
        elif c == '{': d += 1
        elif c == '}':
            d -= 1
            if d == 0: break
        k += 1
    crudo = src[o:k+1]
    ORI = {}
    for m in re.finditer(r"['\"]?([a-z0-9\-]+)['\"]?\s*:\s*\{([^{}]*)\}", crudo):
        cuerpo = m.group(2)
        mo = re.search(r"ori\s*:\s*'([A-Z]+)'", cuerpo)
        if mo:
            ORI[m.group(1)] = {'ori': mo.group(1),
                               'deducida': 'deducida' in cuerpo,
                               'noBano': 'noBano' in cuerpo}

    pat = re.compile(r'\{\s*id:"([a-z0-9\-]+)",[^\n]*?category:"([a-z_]+)",[^\n]*?lat:([-\d.]+),\s*lng:([-\d.]+)')
    pts = {m.group(1): (float(m.group(3)), float(m.group(4)))
           for m in pat.finditer(src) if m.group(2) in ('playa', 'piscinas')}

    f = open(MAPA, 'r+b')
    rd = Reader(MmapSource(f))
    h = rd.header()
    N = 1 << Z
    cache = {}

    def tile(x, y):
        if (x, y) not in cache:
            raw = rd.get(Z, x, y)
            if raw is None:
                cache[(x, y)] = None
            else:
                if h['tile_compression'] == Compression.GZIP:
                    raw = gzip.decompress(raw)
                try:
                    cache[(x, y)] = mvt.decode(raw)
                except Exception:
                    cache[(x, y)] = None
        return cache[(x, y)]

    def xy(la, lo):
        s = math.sin(math.radians(la))
        return ((lo + 180.0) / 360.0 * N,
                (0.5 - math.log((1 + s) / (1 - s)) / (4 * math.pi)) * N)

    def dentro(anillo, px, py):
        d = False
        j = len(anillo) - 1
        for i in range(len(anillo)):
            xi, yi = anillo[i]; xj, yj = anillo[j]
            if (yi > py) != (yj > py) and px < (xj - xi) * (py - yi) / (yj - yi) + xi:
                d = not d
            j = i
        return d

    def es_agua(la, lo):
        fx, fy = xy(la, lo)
        tx, ty = int(fx), int(fy)
        t = tile(tx, ty)
        if not t: return False
        px = (fx - tx) * EXT
        py = (1 - (fy - ty)) * EXT     # MVT tiene la Y hacia arriba
        # mvt.decode devuelve un dict {nombre_de_capa: {...}}, no una lista
        if 'water' not in t: return False
        for ft in t['water']['features']:
            geo = ft.get('geometry', {})
            tipo, co = geo.get('type'), geo.get('coordinates', [])
            pols = [co] if tipo == 'Polygon' else (co if tipo == 'MultiPolygon' else [])
            for pol in pols:
                if not pol: continue
                if dentro(pol[0], px, py) and not any(dentro(h, px, py) for h in pol[1:]):
                    return True
        return False

    def deducir(la, lo):
        """media circular de los rumbos por los que hay mar"""
        sx = sy = 0.0
        tocados = 0
        for radio in (100, 200, 300, 400, 500):
            dlat = radio / 111320.0
            dlon = radio / (111320.0 * math.cos(math.radians(la)))
            for i in range(180):
                g = i * 2.0
                r = math.radians(g)
                if es_agua(la + dlat * math.cos(r), lo + dlon * math.sin(r)):
                    sx += math.sin(r); sy += math.cos(r); tocados += 1
        if tocados == 0: return None, 0, 0.0
        g = math.degrees(math.atan2(sx, sy)) % 360
        fuerza = math.hypot(sx, sy) / tocados     # 1 = todos en la misma direccion
        return g, tocados, fuerza

    aMano = [i for i, v in ORI.items() if not v['deducida'] and not v['noBano'] and i in pts]
    print('EL CONTROL — las %d orientaciones escritas a mano' % len(aMano))
    print('  %-24s %-6s %-6s %-8s %s' % ('playa', 'a mano', 'OSM', 'grados', 'rayos·fuerza'))
    aciertos = casi = 0
    for i in sorted(aMano):
        la, lo = pts[i]
        g, n, fz = deducir(la, lo)
        if g is None:
            print('  %-24s %-6s %-6s' % (i, ORI[i]['ori'], '(sin agua alrededor)')); continue
        r = a_rumbo(g)
        s = sep(r, ORI[i]['ori'])
        marca = 'OK' if s == 0 else ('~' if s == 1 else 'MAL')
        if s == 0: aciertos += 1
        elif s == 1: casi += 1
        print('  %-24s %-6s %-6s %-8s %d rayos · %.2f   %s'
              % (i, ORI[i]['ori'], r, '%.0f' % g, n, fz, marca))
    print('\n  exactas: %d de %d · a un rumbo (45 grados): %d · el resto: %d'
          % (aciertos, len(aMano), casi, len(aMano) - aciertos - casi))
    return aciertos, casi, len(aMano), pts, ORI, deducir, a_rumbo

if __name__ == '__main__':
    r = main()
    if not isinstance(r, tuple): sys.exit(0)
    aciertos, casi, total, pts, ORI, deducir, a_rumbo = r
    if '--todas' in sys.argv:
        print('\nPROPUESTA para las que no tienen orientacion')
        for i in sorted(p for p in pts if p not in ORI):
            la, lo = pts[i]
            g, n, fz = deducir(la, lo)
            print('  %-30s %-4s %-6s %d rayos · fuerza %.2f'
                  % (i, (a_rumbo(g) if g is not None else '--'),
                     ('%.0f' % g) if g is not None else '', n, fz))
