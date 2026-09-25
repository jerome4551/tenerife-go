#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
osm_cerca.py — que hay en OSM alrededor de un punto, sin salir a la red.

    python3 tools/osm_cerca.py 28.4327,-16.4714 400 --nombre "terrero|lucha"
    python3 tools/osm_cerca.py 28.4327,-16.4714 250 --tipo marketplace

PARA QUE
  Los parches piden consultas a Overpass. Desde aqui Overpass esta cerrado
  por la politica de salida, pero el dato de OSM que hace falta ya esta
  dentro: mapa/tenerife-osm.pmtiles, capas `pois`, `places`, `landuse` y
  `buildings`, a z14. Esto lo consulta como haria Overpass y ENSEÑA lo que
  encuentra, con su distancia, para poder exigir «exactamente uno».

LO QUE NO ES
  No es Overpass. El pmtiles es un extracto a z14: lleva el nombre y el tipo,
  no todas las etiquetas, y un elemento que OSM tenga pero el extracto no
  lleve aqui no sale. Por eso imprime CUANTOS hay de ese tipo en toda la isla:
  si son cuatro, el extracto esta filtrado y no se puede concluir «no existe»;
  si son quince repartidos, el filtro no se lo esta comiendo.

  Un mismo elemento aparece en varias teselas: se agrupa por nombre y
  coordenada redondeada antes de contar, que si no «exactamente uno» sale dos.
"""
import gzip, math, os, re, sys, unicodedata

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAPA = os.path.join(RAIZ, 'mapa', 'tenerife-osm.pmtiles')
Z, EXT = 14, 4096
CAPAS = ('pois', 'places', 'landuse', 'buildings')


def tes(lat, lng, z=Z):
    n = 1 << z
    s = math.sin(math.radians(lat))
    return (int((lng + 180) / 360 * n),
            int((0.5 - math.log((1 + s) / (1 - s)) / (4 * math.pi)) * n))


def a_lonlat(tx, ty, px, py):
    n = 1 << Z
    X, Y = tx + px / EXT, ty + (1 - py / EXT)
    m = math.pi - 2 * math.pi * Y / n
    return (X / n * 360 - 180,
            math.degrees(math.atan(0.5 * (math.exp(m) - math.exp(-m)))))


def metros(a, b):
    k = math.cos(math.radians((a[0] + b[0]) / 2))
    return math.hypot((b[1] - a[1]) * 111320 * k, (b[0] - a[0]) * 110540)


def norm(s):
    return unicodedata.normalize('NFD', s or '').encode('ascii', 'ignore').decode().lower()


def barrer(centro, radio_teselas=3, isla=False):
    from pmtiles.reader import Reader, MmapSource
    from pmtiles.tile import Compression
    import mapbox_vector_tile as mvt
    f = open(MAPA, 'rb')
    r = Reader(MmapSource(f))
    h = r.header()
    if isla:
        x0, y0 = tes(28.65, -16.98)
        x1, y1 = tes(27.90, -16.08)
    else:
        cx, cy = tes(*centro)
        x0, y0 = cx - radio_teselas, cy - radio_teselas
        x1, y1 = cx + radio_teselas, cy + radio_teselas
    for tx in range(x0, x1 + 1):
        for ty in range(y0, y1 + 1):
            c = r.get(Z, tx, ty)
            if not c:
                continue
            b = gzip.decompress(c) if h['tile_compression'] == Compression.GZIP else c
            try:
                d = mvt.decode(b)
            except Exception:
                continue
            for capa in CAPAS:
                if capa not in d:
                    continue
                for ft in d[capa]['features']:
                    p = ft['properties']
                    g = ft['geometry']
                    t, co = g['type'], g['coordinates']
                    if t == 'Point':
                        pt = co
                    elif t == 'Polygon':
                        pt = co[0][0]
                    elif t == 'MultiPolygon':
                        pt = co[0][0][0]
                    elif t == 'LineString':
                        pt = co[0]
                    else:
                        continue
                    lon, lat = a_lonlat(tx, ty, pt[0], pt[1])
                    yield (capa, p.get('name') or '', p.get('kind'), lat, lon)


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        return 2
    la, lo = (float(x) for x in sys.argv[1].split(','))
    radio = float(sys.argv[2])
    nombre = tipo = None
    if '--nombre' in sys.argv:
        nombre = sys.argv[sys.argv.index('--nombre') + 1]
    if '--tipo' in sys.argv:
        tipo = sys.argv[sys.argv.index('--tipo') + 1]

    teselas = max(2, int(radio / 2000) + 2)
    unicos = {}
    for capa, nom, kind, plat, plon in barrer((la, lo), teselas):
        d = metros((la, lo), (plat, plon))
        if d > radio:
            continue
        if nombre and not re.search(nombre, norm(nom)):
            continue
        if tipo and kind != tipo:
            continue
        unicos.setdefault((nom, round(plat, 5), round(plon, 5)), (capa, kind, plat, plon, d))
    print('  centro %.6f,%.6f · radio %d m%s%s'
          % (la, lo, radio,
             ' · nombre ~ /%s/' % nombre if nombre else '',
             ' · tipo = %s' % tipo if tipo else ''))
    print('  elementos distintos: %d' % len(unicos))
    for (nom, _, _), (capa, kind, plat, plon, d) in sorted(unicos.items(), key=lambda x: x[1][4]):
        print('    %5d m  %-10s %-12s %-42s %.6f,%.6f' % (round(d), capa, kind or '-', nom[:42], plat, plon))
    if tipo:
        isla = {}
        for capa, nom, kind, plat, plon in barrer((la, lo), isla=True):
            if kind == tipo:
                isla.setdefault((nom, round(plat, 4), round(plon, 4)), 1)
        print('  de ese tipo en toda la isla: %d (para saber si el extracto los filtra)' % len(isla))
    return 0


if __name__ == '__main__':
    sys.exit(main())
