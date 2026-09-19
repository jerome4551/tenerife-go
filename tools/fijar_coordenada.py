#!/usr/bin/env python3
"""
fijar_coordenada.py — cambia la coordenada de un lugar, comprobandola antes.

    python3 tools/fijar_coordenada.py <id> <lat> <lng> ["de donde sale"]
    python3 tools/fijar_coordenada.py --fichero nuevas.txt

    nuevas.txt: una por linea,   id  lat  lng  # de donde sale
    Las lineas vacias y las que empiezan por # se saltan.

POR QUE EXISTE
  Una coordenada mala no da error: se dibuja igual y el pin sale en el mar.
  Asi llegaron un Lidl, un parking y una ermita al agua sin que nadie se
  enterara. Esta herramienta comprueba ANTES de escribir:

    1. que el id existe en places[]
    2. que la coordenada esta dentro de la caja de Tenerife
    3. que CAE EN TIERRA, contra la capa `earth` del OSM del proyecto
    4. y dice cuanto se mueve el punto, para que un dedazo de un grado
       -que son 111 km- se vea antes de guardarlo

  Si algo de eso falla NO ESCRIBE NADA. Mas vale dejar el punto donde
  estaba que moverlo a otro sitio equivocado sin que se note.

  Las categorias que estan en el agua a proposito -puertos, marinas,
  charcos- se avisan pero no se bloquean: un embarcadero SI esta sobre el
  agua, y quien lo mueve sabe lo que hace.
"""
import io
import math
import os
import re
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HTML = os.path.join(RAIZ, 'index.html')
MAPA = os.path.join(RAIZ, 'mapa', 'tenerife-osm.pmtiles')
CAJA = (27.90, 28.70, -17.00, -16.05)   # lat min, lat max, lng min, lng max
DEL_AGUA = {'puerto_ocio', 'puerto_comercial', 'piscinas', 'buceo', 'avistamiento'}
Z, EXT, R = 14, 4096, 6371000.0


def _tierra():
    """Devuelve una funcion (lat,lng)->bool, o None si no hay mapa."""
    if not os.path.exists(MAPA):
        return None
    import gzip
    from pmtiles.reader import Reader, MmapSource
    from pmtiles.tile import Compression
    import mapbox_vector_tile as mvt
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

    def en_tierra(la, lo):
        x0 = int((lo + 180) / 360 * N)
        y0 = int((1 - math.log(math.tan(math.radians(la)) + 1 / math.cos(math.radians(la))) / math.pi) / 2 * N)
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                t = tesela(x0 + dx, y0 + dy)
                if not t or 'earth' not in t:
                    continue
                lonA, latA = esquina(x0 + dx, y0 + dy)
                lonB, latB = esquina(x0 + dx + 1, y0 + dy + 1)
                px = (lo - lonA) / (lonB - lonA) * EXT
                # el eje y viene VOLTEADO por la libreria (ver
                # tools/auditar_en_el_mar.py, donde se comprobo)
                py = EXT - (la - latA) / (latB - latA) * EXT
                if not (-200 <= px <= EXT + 200 and -200 <= py <= EXT + 200):
                    continue
                for ft in t['earth']['features']:
                    g = ft.get('geometry') or {}
                    c = g.get('coordinates')
                    if not c:
                        continue
                    polis = c if g.get('type') == 'MultiPolygon' else ([c] if g.get('type') == 'Polygon' else [])
                    for poli in polis:
                        if poli and len(poli[0]) >= 3 and dentro((px, py), poli[0]) \
                                and not any(len(a) >= 3 and dentro((px, py), a) for a in poli[1:]):
                            return True
        return False
    return en_tierra


def metros(la1, lo1, la2, lo2):
    k = math.cos(math.radians((la1 + la2) / 2))
    return math.hypot(math.radians(lo2 - lo1) * R * k, math.radians(la2 - la1) * R)


def main():
    args = sys.argv[1:]
    cambios = []
    if args and args[0] == '--fichero':
        if len(args) < 2:
            print('falta el fichero'); return 2
        for linea in io.open(args[1], encoding='utf-8'):
            linea = linea.split('#')[0].strip()
            if not linea:
                continue
            p = linea.split()
            if len(p) < 3:
                print('linea que no entiendo: ' + linea); return 2
            cambios.append((p[0], float(p[1]), float(p[2]), ''))
    elif len(args) >= 3:
        cambios.append((args[0], float(args[1]), float(args[2]), args[3] if len(args) > 3 else ''))
    else:
        print(__doc__); return 2

    s = io.open(HTML, encoding='utf-8').read()
    en_tierra = _tierra()
    if en_tierra is None:
        print('  --  sin mapa/tenerife-osm.pmtiles no puedo comprobar que caiga en tierra.')
        print('      No escribo nada: esa comprobacion es el motivo de esta herramienta.')
        return 1

    # Todo se valida ANTES de tocar el fichero. Escribir la mitad seria peor
    # que no escribir nada.
    plan = []
    for pid, la, lo, fuente in cambios:
        i = s.find('id:"%s"' % pid)
        if i < 0:
            print('  MAL  %s no existe en places[]' % pid); return 1
        tro = s[i:i + 2600]
        m = re.search(r'lat:(-?[\d.]+),\s*lng:(-?[\d.]+)', tro)
        if not m:
            print('  MAL  %s no tiene lat/lng donde deberia' % pid); return 1
        cat = (re.search(r'category:"([a-z_]+)"', tro) or [None, ''])[1]
        vla, vlo = float(m.group(1)), float(m.group(2))
        if not (CAJA[0] <= la <= CAJA[1] and CAJA[2] <= lo <= CAJA[3]):
            print('  MAL  %s: %.5f,%.5f cae fuera de Tenerife' % (pid, la, lo)); return 1
        tierra = en_tierra(la, lo)
        d = metros(vla, vlo, la, lo)
        if not tierra and cat not in DEL_AGUA:
            print('  MAL  %s [%s]: %.5f,%.5f SIGUE EN EL AGUA. No lo escribo.' % (pid, cat, la, lo)); return 1
        plan.append((pid, i, m, tro, vla, vlo, la, lo, d, cat, tierra, fuente))

    for pid, i, m, tro, vla, vlo, la, lo, d, cat, tierra, fuente in sorted(plan, key=lambda x: -x[1]):
        s = s[:i] + tro[:m.start()] + ('lat:%s, lng:%s' % (la, lo)) + tro[m.end():] + s[i + 2600:]
        aviso = '' if tierra else '   (en el agua, pero es %s: se permite)' % cat
        print('  OK   %-28s %.5f,%.5f -> %.5f,%.5f   se mueve %.0f m%s'
              % (pid, vla, vlo, la, lo, d, aviso))
        if fuente:
            print('       fuente: %s' % fuente)
    io.open(HTML, 'w', encoding='utf-8').write(s)
    print('  escritas %d coordenada(s) en index.html' % len(plan))
    return 0


if __name__ == '__main__':
    sys.exit(main())
