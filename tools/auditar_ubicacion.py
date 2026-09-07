#!/usr/bin/env python3
"""
auditar_ubicacion.py — ¿estan las playas donde dicen estar?

    python3 tools/auditar_ubicacion.py

QUE HACE
  Mide cada POI de categoria playa o piscinas contra la capa `water` del mapa
  de OSM que lleva la propia app, y avisa si alguno esta absurdamente lejos
  del agua.

DOS COSAS QUE HAY QUE MEDIR BIEN, Y QUE AL PRINCIPIO ESTABAN MAL
  1. Al BORDE del agua, no al vertice mas cercano. Medir al vertice daba 20
     sospechosos; al segmento quedan 10. Es la misma trampa que ya ha
     producido tres bloqueantes falsos en este proyecto.
  2. Mirando las 9 teselas de alrededor, no solo la suya. Una tesela z14 mide
     unos 2,4 km: una playa junto al borde tiene el mar en la tesela de al
     lado y parecia estar a un kilometro de cualquier agua.

SEGUNDA MEDIDA: CONTRA EL MAR, NO CONTRA "AGUA"
  La capa `water` de OSM incluye agua interior -balsas, embalses, estanques-,
  asi que "esta a 279 m de agua" no quiere decir "esta junto al mar". Con solo
  esa medida, charco-infierno-arafo pasaba: tenia una balsa a 279 m y estaba a
  10,2 km del Atlantico, con una ficha que decia "piscina natural en la COSTA
  de Arafo" y etiquetas Costa y Atlantico. Al buscarlo resulto que el sitio no
  existe -no hay ningun "Charco del Infierno" en Arafo- y se quito. Este
  control es lo que lo saco a la luz, asi que se queda.
  Por eso se mide ademas contra el anillo de costa de GSHHG, que es solo mar.
  Es tosca -250-500 m de error en las calas- y para esto da igual: aqui no se
  buscan metros, se busca que un punto de baño no este en el monte. Y ahi el
  reparto no es continuo, son dos grupos: 99 puntos por debajo de 614 m y uno
  a 10.187 m. Cuando hay dos grupos separados si se puede afirmar cual esta
  mal.

POR QUE EL UMBRAL ES TAN ALTO
  La distribucion real es continua -mediana 86 m, cuartil 3 167 m, maximo
  573 m-: no hay dos grupos separados, asi que no hay forma de decir "de aqui
  para alla estan mal". Los mayores se explican solos: el pin de una playa
  larga va en el centro o en el acceso, y el poligono de agua a z14 esta
  generalizado. Los cinco peores se contrastaron uno a uno contra las paradas
  de TITSA y los cinco estaban en su municipio y a distancia normal.

  Asi que esto NO busca errores de metros. Busca que a nadie se le vaya una
  playa al centro de la isla, que es un fallo que si se puede afirmar.
"""
import gzip, math, os, re, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
MAPA = os.path.join(RAIZ, 'mapa', 'tenerife-osm.pmtiles')
UMBRAL = 800.0          # metros: error grosero, no de precision
Z, EXT, R = 14, 4096, 6371000.0


def main():
    if not os.path.exists(MAPA):
        print('  --  no hay mapa/tenerife-osm.pmtiles: no se puede medir (no es fallo)')
        return 0
    from pmtiles.reader import Reader, MmapSource
    from pmtiles.tile import Compression
    import mapbox_vector_tile as mvt

    src = open(os.path.join(RAIZ, 'index.html'), encoding='utf-8').read()
    pat = re.compile(r'\{\s*id:"([a-z0-9\-]+)",[^\n]*?category:"([a-z_]+)",[^\n]*?lat:([-\d.]+),\s*lng:([-\d.]+)')
    costeros = [(m.group(1), m.group(2), float(m.group(3)), float(m.group(4)))
                for m in pat.finditer(src) if m.group(2) in ('playa', 'piscinas')]

    f = open(MAPA, 'r+b')
    r = Reader(MmapSource(f))
    h = r.header()
    N = 1 << Z
    cache = {}

    def tile(x, y):
        if (x, y) not in cache:
            crudo = r.get(Z, x, y)
            d = None
            if crudo:
                b = gzip.decompress(crudo) if h['tile_compression'] == Compression.GZIP else crudo
                try:
                    d = mvt.decode(b)
                except Exception:
                    d = None
            cache[(x, y)] = d
        return cache[(x, y)]

    def esquina(x, y):
        return x / N * 360 - 180, math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * y / N))))

    def plano(lat, lon, ref):
        k = math.cos(math.radians(ref[0]))
        return (math.radians(lon - ref[1]) * R * k, math.radians(lat - ref[0]) * R)

    def d_seg(A, B):
        ax, ay = A; bx, by = B
        dx, dy = bx - ax, by - ay
        L = dx * dx + dy * dy
        t = 0.0 if L == 0 else max(0.0, min(1.0, (-ax * dx - ay * dy) / L))
        return math.hypot(ax + t * dx, ay + t * dy)

    def anillos(c):
        if not c:
            return
        if isinstance(c[0], (int, float)):
            return
        if isinstance(c[0][0], (int, float)):
            yield c
        else:
            for q in c:
                for a in anillos(q):
                    yield a

    def al_agua(la, lo):
        x0 = int((lo + 180) / 360 * N)
        y0 = int((1 - math.log(math.tan(math.radians(la)) + 1 / math.cos(math.radians(la))) / math.pi) / 2 * N)
        mejor = float('inf')
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                t = tile(x0 + dx, y0 + dy)
                if not t or 'water' not in t:
                    continue
                lonA, latA = esquina(x0 + dx, y0 + dy)
                lonB, latB = esquina(x0 + dx + 1, y0 + dy + 1)
                for ft in t['water']['features']:
                    for an in anillos(ft['geometry'].get('coordinates')):
                        pts = [plano(latA + (cy / EXT) * (latB - latA),
                                     lonA + (cx / EXT) * (lonB - lonA), (la, lo)) for cx, cy in an]
                        for i in range(1, len(pts)):
                            d = d_seg(pts[i - 1], pts[i])
                            if d < mejor:
                                mejor = d
        return mejor

    ds = sorted((al_agua(la, lo), pid) for pid, c, la, lo in costeros)
    v = [d for d, _ in ds if d < float('inf')]
    print('  playas y charcos medidos contra la capa water de OSM: %d' % len(v))
    if v:
        print('  distancia al borde del agua: mediana %.0f m · cuartil 3 %.0f m · maximo %.0f m (%s)'
              % (v[len(v) // 2], v[3 * len(v) // 4], v[-1], ds[-1][1]))
    # ── contra la costa de verdad ──
    import json
    UMBRAL_MAR = 2000.0     # metros: un punto de baño no esta a 2 km del mar
    costa = json.load(open(os.path.join(RAIZ, 'tools', 'datos', 'costa_tenerife.json')))
    anillo = costa['anillo']
    # El orden de los vertices se decide por el SIGNO, no por la magnitud:
    # en Tenerife la latitud es 27-29 y la longitud -16 a -17, y las dos pasan
    # de 20, asi que un umbral de magnitud se equivoca -y se equivoco-.
    lat_primero = anillo[0][0] > 0 and anillo[0][1] < 0
    lat0 = 28.3
    def xy(la, lo):
        return (math.radians(lo) * R * math.cos(math.radians(lat0)), math.radians(la) * R)
    aro = [xy(q[0], q[1]) if lat_primero else xy(q[1], q[0]) for q in anillo]
    def a_la_costa(la, lo):
        p = xy(la, lo)
        mejor = float('inf')
        for i in range(len(aro)):
            ax, ay = aro[i]; bx, by = aro[(i + 1) % len(aro)]
            dx, dy = bx - ax, by - ay
            if dx == 0 and dy == 0:
                d = math.hypot(p[0] - ax, p[1] - ay)
            else:
                t = max(0.0, min(1.0, ((p[0]-ax)*dx + (p[1]-ay)*dy) / (dx*dx + dy*dy)))
                d = math.hypot(p[0] - (ax + t*dx), p[1] - (ay + t*dy))
            if d < mejor: mejor = d
        return mejor
    mar = sorted(((a_la_costa(la, lo), pid) for pid, _c, la, lo in costeros), reverse=True)
    tierra = [(d, pid) for d, pid in mar if d > UMBRAL_MAR]
    print('  distancia al MAR (costa GSHHG): mediana %.0f m · maximo %.0f m (%s)'
          % (sorted(d for d, _ in mar)[len(mar)//2], mar[0][0], mar[0][1]))
    print('  tierra adentro (a mas de %d m del mar): %d' % (UMBRAL_MAR, len(tierra)))
    for d, pid in tierra:
        print('      <--  %s  a %.1f km del mar' % (pid, d / 1000.0))

    lejos = [(d, pid) for d, pid in ds if d > UMBRAL]
    print('  a mas de %d m del agua (error grosero): %d' % (UMBRAL, len(lejos)))
    for d, pid in lejos:
        print('      <--  %-30s %.0f m' % (pid, d))
    return 1 if (lejos or tierra) else 0


if __name__ == '__main__':
    sys.exit(main())
