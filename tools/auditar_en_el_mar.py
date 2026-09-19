#!/usr/bin/env python3
"""
auditar_en_el_mar.py — lugares que caen en el agua y no deberian.

    python3 tools/auditar_en_el_mar.py [--lista]

EL HUECO QUE TAPA
  auditar_ubicacion.py mide las 99 playas y charcos y avisa si alguno esta
  LEJOS del agua. Nadie miraba lo contrario: un supermercado, un parking o
  una ermita METIDOS EN EL MAR. Y los habia. Se veian en el movil y en
  ningun control.

COMO SE MIDE
  Contra la capa `earth` del mapa de OSM que ya lleva el proyecto: un sitio
  de tierra tiene que estar DENTRO de un poligono de tierra. No se
  geocodifica nada ni se pregunta a nadie; la respuesta sale de un dato que
  ya estaba en el repositorio.

  EL EJE Y VIENE VOLTEADO. mapbox_vector_tile.decode() devuelve la y con el
  origen abajo, no arriba como el MVT crudo. No se adivino: se probaron las
  dos convenciones sobre los 804 lugares. Sin voltear, 139 caian fuera de
  tierra -entre ellos el Hospital del Norte, que esta en Icod-; volteando,
  22. Cuando una convencion da 139 y la otra 22, no hay duda de cual es.

  Y LOS AGUJEROS CUENTAN. El oceano viene como un poligono con la tierra
  recortada dentro, y la tierra al reves. Aplanando todos los anillos por
  igual, caer en un agujero contaba como caer dentro.

POR QUE SE MIDE CUANTO, Y NO SOLO SI
  El poligono a z14 esta generalizado, asi que un punto a pocos metros de
  la orilla puede caer del lado equivocado por el propio dibujo. Lo que se
  ordena es la distancia al borde de tierra mas cercano: a 2 km es un error
  de datos, a 3 m es el dibujo.

  Un puerto, una marina o un embarcadero SI estan en el agua por
  definicion. Se miden igual y se listan aparte en vez de callarlos: que la
  exencion este escrita y no sea un silencio.
"""
import gzip
import math
import os
import re
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAPA = os.path.join(RAIZ, 'mapa', 'tenerife-osm.pmtiles')
Z, EXT, R = 14, 4096, 6371000.0

# Lo que puede estar en el agua sin que sea un fallo.
# Un FARO no entra aqui: se construye en tierra o sobre un dique, y el que
# estaba a 444 m mar adentro se veia a simple vista en el movil.
DEL_AGUA = {'puerto_ocio', 'puerto_comercial', 'piscinas', 'buceo', 'avistamiento'}

# A partir de aqui ya no es el dibujo generalizado: es un error de dato.
UMBRAL = 60.0


def main():
    lista = '--lista' in sys.argv
    if not os.path.exists(MAPA):
        print('  --  no hay mapa/tenerife-osm.pmtiles: no se puede medir (no es fallo)')
        return 0
    from pmtiles.reader import Reader, MmapSource
    from pmtiles.tile import Compression
    import mapbox_vector_tile as mvt

    src = open(os.path.join(RAIZ, 'index.html'), encoding='utf-8').read()
    pat = re.compile(r'\{\s*id:"([a-z0-9\-]+)",[^\n]*?category:"([a-z_]+)",[^\n]*?'
                     r'name:"((?:[^"\\]|\\.)*)"[^\n]*?lat:([-\d.]+),\s*lng:([-\d.]+)')
    sitios = [(m.group(1), m.group(2), m.group(3), float(m.group(4)), float(m.group(5)))
              for m in pat.finditer(src)]
    if not sitios:
        print('  MAL  no he podido leer places[] del fuente')
        return 1

    f = open(MAPA, 'r+b')
    r = Reader(MmapSource(f))
    h = r.header()
    N = 1 << Z
    cache = {}

    def tesela(x, y):
        if (x, y) not in cache:
            c = r.get(Z, x, y)
            d = None
            if c:
                b = gzip.decompress(c) if h['tile_compression'] == Compression.GZIP else c
                try:
                    d = mvt.decode(b)
                except Exception:
                    d = None
            cache[(x, y)] = d
        return cache[(x, y)]

    def esquina(x, y):
        return (x / N * 360 - 180,
                math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * y / N)))))

    def dentro(pt, an):
        x, y = pt
        d = False
        j = len(an) - 1
        for i in range(len(an)):
            xi, yi = an[i]
            xj, yj = an[j]
            if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi:
                d = not d
            j = i
        return d

    def d_seg(P, A, B):
        """Al SEGMENTO, nunca al vertice: es la trampa que ya ha dado tres
        bloqueantes falsos en este proyecto."""
        ax, ay = A[0] - P[0], A[1] - P[1]
        bx, by = B[0] - P[0], B[1] - P[1]
        dx, dy = bx - ax, by - ay
        L = dx * dx + dy * dy
        t = 0.0 if L == 0 else max(0.0, min(1.0, (-ax * dx - ay * dy) / L))
        return math.hypot(ax + t * dx, ay + t * dy)

    def analiza(la, lo):
        """(esta en tierra, metros hasta el borde de tierra mas cercano)."""
        x0 = int((lo + 180) / 360 * N)
        y0 = int((1 - math.log(math.tan(math.radians(la)) + 1 / math.cos(math.radians(la))) / math.pi) / 2 * N)
        tierra, borde = False, float('inf')
        k = math.cos(math.radians(la))
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                t = tesela(x0 + dx, y0 + dy)
                if not t or 'earth' not in t:
                    continue
                lonA, latA = esquina(x0 + dx, y0 + dy)
                lonB, latB = esquina(x0 + dx + 1, y0 + dy + 1)
                px = (lo - lonA) / (lonB - lonA) * EXT
                py = EXT - (la - latA) / (latB - latA) * EXT
                for ft in t['earth']['features']:
                    g = ft.get('geometry') or {}
                    tipo = g.get('type')
                    c = g.get('coordinates')
                    if not c:
                        continue
                    polis = c if tipo == 'MultiPolygon' else ([c] if tipo == 'Polygon' else [])
                    for poli in polis:
                        if not poli or len(poli[0]) < 3:
                            continue
                        if -200 <= px <= EXT + 200 and -200 <= py <= EXT + 200:
                            if dentro((px, py), poli[0]) and not any(
                                    len(a) >= 3 and dentro((px, py), a) for a in poli[1:]):
                                tierra = True
                        for an in poli:
                            pl = [(math.radians((lonA + (cx / EXT) * (lonB - lonA)) - lo) * R * k,
                                   math.radians((latA + ((EXT - cy) / EXT) * (latB - latA)) - la) * R)
                                  for cx, cy in an]
                            for i in range(1, len(pl)):
                                d = d_seg((0.0, 0.0), pl[i - 1], pl[i])
                                if d < borde:
                                    borde = d
        return tierra, (0.0 if borde == float('inf') else borde)

    fuera, exentos = [], []
    for pid, cat, nom, la, lo in sitios:
        t, b = analiza(la, lo)
        if t:
            continue
        (exentos if cat in DEL_AGUA else fuera).append((b, pid, cat, nom, la, lo))
    fuera.sort(reverse=True)
    exentos.sort(reverse=True)
    graves = [x for x in fuera if x[0] >= UMBRAL]

    print('  lugares medidos contra la capa earth de OSM.: %d' % len(sitios))
    print('  de tierra y FUERA de tierra.................: %d' % len(fuera))
    print('  de esos, a mas de %.0f m del borde (no es el dibujo): %d' % (UMBRAL, len(graves)))
    for b, pid, cat, nom, la, lo in (fuera if lista else graves):
        print('      %7.0f m del borde  %-30s %-18s %-32s %.5f,%.5f'
              % (b, pid, cat, nom[:32], la, lo))
    if exentos:
        print('  puertos, marinas y charcos (estan en el agua a proposito): %d' % len(exentos))
        if lista:
            for b, pid, cat, nom, la, lo in exentos:
                print('          %7.0f m  %-30s %s' % (b, pid, cat))
    return 1 if graves else 0


if __name__ == '__main__':
    sys.exit(main())
