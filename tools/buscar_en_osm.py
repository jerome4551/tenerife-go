#!/usr/bin/env python3
"""
buscar_en_osm.py — candidatos de coordenada para un lugar, sacados del OSM
que ya lleva el proyecto.

    python3 tools/buscar_en_osm.py <id-del-lugar> [radio_km]
    python3 tools/buscar_en_osm.py --todos            (los que estan fuera de tierra)

DE DONDE SALE EL DATO
  De la capa `pois` de mapa/tenerife-osm.pmtiles, que son los puntos de
  OpenStreetMap con su nombre y su tipo. NO se geocodifica, no se pregunta a
  nadie y no se deduce nada del nombre ni del barrio: si OSM no lo tiene,
  esta herramienta no propone nada y lo dice.

COMO PROPONE
  Busca alrededor de donde la app dice que esta el sitio y ordena por lo
  parecido del nombre y lo compatible del tipo. NO ESCRIBE NADA: imprime
  candidatos para mirarlos uno a uno. Mover un punto a ciegas es como
  dejarlo en el mar, solo que sin que se note.
"""
import gzip
import math
import os
import re
import sys
import unicodedata

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAPA = os.path.join(RAIZ, 'mapa', 'tenerife-osm.pmtiles')
Z, EXT, R = 14, 4096, 6371000.0

# Que tipo de OSM encaja con cada categoria de la app. Solo se usa para
# ORDENAR: un candidato de otro tipo se ensena igual, mas abajo.
AFIN = {
    'supermercado': {'supermarket', 'convenience', 'grocery'},
    'parking': {'parking'},
    'cultura': {'place_of_worship', 'museum', 'attraction', 'monument', 'castle', 'artwork'},
    'faros': {'lighthouse'},
    'puerto_ocio': {'marina', 'harbour', 'slipway', 'pier'},
    'puerto_comercial': {'harbour', 'port', 'ferry_terminal'},
    'golf': {'golf_course'},
    'municipio': {'town', 'village', 'suburb', 'neighbourhood', 'hamlet', 'administrative'},
    'montana': {'peak', 'volcano', 'hill'},
    'windsurf': {'beach', 'surfing'},
    'familia': {'attraction', 'aquarium', 'theme_park', 'zoo'},
    'piscinas': {'swimming_pool', 'water_park', 'beach'},
    'webcam': set(),
}


def nrm(s):
    s = unicodedata.normalize('NFD', str(s or '').lower())
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z0-9 ]+', ' ', s).strip()


def parecido(a, b):
    """Cuantas palabras de 3+ letras comparten, sobre las de la mas corta."""
    pa = {w for w in nrm(a).split() if len(w) > 2}
    pb = {w for w in nrm(b).split() if len(w) > 2}
    if not pa or not pb:
        return 0.0
    return len(pa & pb) / min(len(pa), len(pb))


def main():
    if not os.path.exists(MAPA):
        print('no hay mapa/tenerife-osm.pmtiles')
        return 2
    from pmtiles.reader import Reader, MmapSource
    from pmtiles.tile import Compression
    import mapbox_vector_tile as mvt

    src = open(os.path.join(RAIZ, 'index.html'), encoding='utf-8').read()
    pat = re.compile(r'\{\s*id:"([a-z0-9\-]+)",[^\n]*?category:"([a-z_]+)",[^\n]*?'
                     r'name:"((?:[^"\\]|\\.)*)"[^\n]*?lat:([-\d.]+),\s*lng:([-\d.]+)')
    sitios = {m.group(1): (m.group(2), m.group(3), float(m.group(4)), float(m.group(5)))
              for m in pat.finditer(src)}

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

    def metros(la1, lo1, la2, lo2):
        k = math.cos(math.radians((la1 + la2) / 2))
        return math.hypot(math.radians(lo2 - lo1) * R * k, math.radians(la2 - la1) * R)

    def candidatos(pid, radio_km):
        cat, nom, la, lo = sitios[pid]
        pasos = max(1, int(radio_km / 2.0) + 1)
        x0 = int((lo + 180) / 360 * N)
        y0 = int((1 - math.log(math.tan(math.radians(la)) + 1 / math.cos(math.radians(la))) / math.pi) / 2 * N)
        vistos = []
        for dx in range(-pasos, pasos + 1):
            for dy in range(-pasos, pasos + 1):
                t = tesela(x0 + dx, y0 + dy)
                if not t or 'pois' not in t:
                    continue
                lonA, latA = esquina(x0 + dx, y0 + dy)
                lonB, latB = esquina(x0 + dx + 1, y0 + dy + 1)
                for ft in t['pois']['features']:
                    pr = ft.get('properties') or {}
                    if not pr.get('name'):
                        continue
                    g = ft.get('geometry') or {}
                    if g.get('type') != 'Point':
                        continue
                    cx, cy = g['coordinates']
                    # el eje y viene VOLTEADO por la libreria: se comprobo
                    # sobre los 804 lugares, 22 fuera de tierra frente a 139
                    glat = latA + ((EXT - cy) / EXT) * (latB - latA)
                    glon = lonA + (cx / EXT) * (lonB - lonA)
                    d = metros(la, lo, glat, glon)
                    if d > radio_km * 1000:
                        continue
                    vistos.append((parecido(nom, pr['name']),
                                   1 if pr.get('kind') in AFIN.get(cat, set()) else 0,
                                   -d, pr['name'], pr.get('kind'), glat, glon, d))
        vistos.sort(reverse=True)
        return cat, nom, la, lo, vistos

    ids = sys.argv[1:]
    radio = 3.0
    if ids and ids[-1].replace('.', '').isdigit():
        radio = float(ids.pop())
    if ids == ['--todos']:
        ids = [k for k in sitios]
        print('usa --todos con la lista de auditar_en_el_mar.py')
        return 2
    for pid in ids:
        if pid not in sitios:
            print('%s: no existe en places[]' % pid)
            continue
        cat, nom, la, lo, v = candidatos(pid, radio)
        print('\n== %s  [%s]  %s' % (pid, cat, nom))
        print('   la app dice   %.5f, %.5f' % (la, lo))
        if not v:
            print('   OSM no tiene nada con nombre a menos de %.0f km: no propongo nada' % radio)
            continue
        for p, afin, _, onom, okind, glat, glon, d in v[:6]:
            print('   %4.2f %s %-22s %-34s %.5f, %.5f   a %5.0f m' %
                  (p, '*' if afin else ' ', okind or '', onom[:34], glat, glon, d))
    return 0


if __name__ == '__main__':
    sys.exit(main())
