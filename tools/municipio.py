#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
municipio.py — en que municipio cae un punto. Point-in-polygon, de verdad.

    python3 tools/municipio.py                      # las fichas del registro
    python3 tools/municipio.py ID [ID ...]
    python3 tools/municipio.py --punto 28.5,-16.3
    python3 tools/municipio.py --calibrar           # contra las 2.514 paradas
    python3 tools/municipio.py --lote < puntos.txt  # «id lat lng [municipio]»

DE DONDE SALE
  Del shapefile municipal del Cabildo (31 municipios, 182 anillos, 143.737
  vertices), convertido a lon/lat con tools/convertir_municipios.py y guardado
  en tools/datos/municipios-tenerife.json.gz. El zip original esta al lado.

  Durante semanas esto se hizo POR APROXIMACION -mirando si habia una raya
  municipal del mapa OSM entre el punto y las paradas de alrededor- porque el
  shapefile no estaba. Ese metodo acertaba, pero era indirecto y no se podia
  cerrar un punto pegado a un limite. Este es el dato de verdad.

LA TRAMPA QUE TIENE ESTE SHAPEFILE, Y HAY QUE RESOLVERLA
  El anillo de La Laguna ENVUELVE a Tegueste: esta dibujado sin recortarle el
  hueco. Asi que un punto de Tegueste cae dentro de los dos, y quien mire solo
  «el primero que contenga el punto» dira La Laguna. Pasa en las 45 paradas de
  Tegueste: las 45.

  Se resuelve con una regla: SI UN PUNTO CAE EN VARIOS, GANA EL MAS PEQUEÑO.
  Un enclave siempre es menor que quien lo envuelve. Con eso, la coincidencia
  con el municipio que traen las 2.514 paradas de TITSA pasa de 97,3 % a
  100,00 %: 2.514 de 2.514, cero discrepancias.

  Y el nombre: el shapefile escribe «La Laguna», «Guimar», «Guia de Isora» y
  «Santa Ursula»; el catalogo de TITSA usa el nombre oficial completo y con
  tildes. La tabla ALIAS traduce, y no hace nada mas.
"""
import gzip
import io
import json
import math
import os
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GEO = os.path.join(RAIZ, 'tools', 'datos', 'municipios-tenerife.json.gz')
VERIF = os.path.join(RAIZ, 'datos', 'verificado.json')

# Como lo escribe el shapefile -> como lo escribe el catalogo de TITSA.
ALIAS = {
    'La Laguna': 'San Cristóbal de La Laguna',
    'Guimar': 'Güímar',
    'Guia de Isora': 'Guía de Isora',
    'Santa Ursula': 'Santa Úrsula',
}

_cache = None


def cargar():
    """{municipio: [anillo, ...]} en lon/lat, y el area de cada uno."""
    global _cache
    if _cache is None:
        if not os.path.exists(GEO):
            return None
        with gzip.open(GEO, 'rt', encoding='utf-8') as f:
            por = json.load(f)
        area = {}
        for nom, anillos in por.items():
            t = 0.0
            for an in anillos:
                s = 0.0
                for i in range(len(an) - 1):
                    s += an[i][0] * an[i + 1][1] - an[i + 1][0] * an[i][1]
                t += abs(s / 2)
            area[nom] = t
        _cache = (por, area)
    return _cache


def _dentro(x, y, an):
    d = False
    j = len(an) - 1
    for i in range(len(an)):
        xi, yi = an[i]
        xj, yj = an[j]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi:
            d = not d
        j = i
    return d


def de(lat, lng, oficial=True):
    """El municipio del punto, o None si cae fuera de la isla."""
    c = cargar()
    if c is None:
        return None
    por, area = c
    hit = [n for n, anillos in por.items() if any(_dentro(lng, lat, a) for a in anillos)]
    if not hit:
        return None
    hit.sort(key=lambda n: area[n])          # el enclave gana a quien lo envuelve
    return ALIAS.get(hit[0], hit[0]) if oficial else hit[0]


def todos(lat, lng):
    """Todos los que contienen el punto, del mas pequeño al mas grande."""
    c = cargar()
    if c is None:
        return []
    por, area = c
    hit = [n for n, anillos in por.items() if any(_dentro(lng, lat, a) for a in anillos)]
    hit.sort(key=lambda n: area[n])
    return [ALIAS.get(n, n) for n in hit]


def _d_seg(P, A, B):
    """Metros del punto P=(lat,lon) al SEGMENTO AB, con A y B en (lon,lat)."""
    k = math.cos(math.radians(P[0]))
    ax, ay = (A[0] - P[1]) * 111320 * k, (A[1] - P[0]) * 110540
    bx, by = (B[0] - P[1]) * 111320 * k, (B[1] - P[0]) * 110540
    dx, dy = bx - ax, by - ay
    L = dx * dx + dy * dy
    t = 0.0 if L == 0 else max(0.0, min(1.0, (-ax * dx - ay * dy) / L))
    return math.hypot(ax + t * dx, ay + t * dy)


def metros_a(lat, lng, nombre):
    """Metros del punto al borde del municipio `nombre`, o None si no existe.

    Es EL dato que separa un error de texto de un pin impreciso: a 40 m de la
    raya el pin pudo caer al otro lado por nada, y a 44 km no hay pin que
    explique nada. Se mide al SEGMENTO, nunca al vertice."""
    c = cargar()
    if c is None:
        return None
    por, _ = c
    inv = {v: k for k, v in ALIAS.items()}
    anillos = por.get(inv.get(nombre, nombre))
    if not anillos:
        return None
    mejor = float('inf')
    for an in anillos:
        for i in range(1, len(an)):
            d = _d_seg((lat, lng), an[i - 1], an[i])
            if d < mejor:
                mejor = d
    return mejor


def _lugares():
    import subprocess
    o = subprocess.run(['node', '-e', "const{PLACES}=require('./tools/cargar');"
                        "console.log(JSON.stringify(PLACES.map(p=>({id:p.id,lat:p.lat,lng:p.lng}))))"],
                       cwd=RAIZ, capture_output=True, text=True)
    return {p['id']: p for p in json.loads(o.stdout)}


def main():
    if cargar() is None:
        print('  no esta %s: no se puede comprobar (no es fallo)' % GEO)
        return 0
    por, _ = cargar()
    args = list(sys.argv[1:])
    if '--lote' not in args:
        print('  poligono municipal del Cabildo: %d municipios, %d anillos'
              % (len(por), sum(len(a) for a in por.values())))

    if '--lote' in args:
        # Una linea «id lat lng» por punto; devuelve «id<TAB>municipio». Asi el
        # control en JavaScript pregunta una sola vez por los 787 y la
        # geometria vive en un solo sitio.
        for linea in sys.stdin:
            t = linea.rstrip('\n').split('\t') if '\t' in linea else linea.split()
            if len(t) < 3:
                continue
            la, lo = float(t[1]), float(t[2])
            m = de(la, lo)
            # Con un cuarto campo -el municipio que la ficha declara- se
            # devuelve tambien a cuantos metros esta su raya. Esa cifra es la
            # que separa «el pin cayo al otro lado por 40 m» de «el texto
            # miente por 44 km».
            d = metros_a(la, lo, t[3].strip()) if len(t) > 3 and t[3].strip() else None
            sys.stdout.write('%s\t%s\t%s\n' % (t[0], m or '',
                             '' if d is None else str(int(round(d)))))
        return 0

    if '--calibrar' in args:
        import subprocess
        cat = json.loads(subprocess.run(
            ['node', '-e', "const{CAT}=require('./tools/cargar');"
             "console.log(JSON.stringify(Object.values(CAT)))"],
            cwd=RAIZ, capture_output=True, text=True).stdout)
        ok = mal = fuera = 0
        casos = {}
        for s in cat:
            if not s.get('m'):
                continue
            m = de(s['la'], s['lo'])
            if m is None:
                fuera += 1
            elif m == s['m']:
                ok += 1
            else:
                mal += 1
                casos[(s['m'], m)] = casos.get((s['m'], m), 0) + 1
        print('  paradas de TITSA con municipio............: %d' % (ok + mal + fuera))
        print('  el poligono dice lo mismo.................: %d (%.2f %%)'
              % (ok, 100.0 * ok / max(ok + mal + fuera, 1)))
        print('  discrepan.................................: %d' % mal)
        print('  caen fuera de todo poligono...............: %d' % fuera)
        for (a, b), n in sorted(casos.items(), key=lambda x: -x[1])[:10]:
            print('      TITSA %-28s poligono %-28s x%d' % (a, b, n))
        return 1 if (mal or fuera) else 0

    sueltos = []
    while '--punto' in args:
        i = args.index('--punto')
        la, lo = args[i + 1].split(',')
        sueltos.append((float(la), float(lo)))
        del args[i:i + 2]
    ids = [a for a in args if not a.startswith('--')]

    reg = json.load(io.open(VERIF, encoding='utf-8')) if os.path.exists(VERIF) else {}
    esperado = {k: v.get('municipio') for k, v in (reg.get('municipio_oficial') or {}).items()
                if not k.startswith('_')}
    if not ids and not sueltos:
        ids = sorted(esperado)
        if not ids:
            print('  ninguna ficha apuntada con su municipio todavia')
            return 0

    LUG = _lugares() if ids else {}
    fallos = 0
    for id in ids:
        p = LUG.get(id)
        if not p:
            print('  FALLO %s: no existe esa ficha' % id)
            fallos += 1
            continue
        m = de(p['lat'], p['lng'])
        varios = todos(p['lat'], p['lng'])
        esp = esperado.get(id)
        bien = m is not None and (esp is None or m == esp)
        print('  %s %-32s %s' % ('OK  ' if bien else 'FALLO', id, m or '(fuera de la isla)'))
        if len(varios) > 1:
            print('        cae en %d poligonos (%s): gana el mas pequeño'
                  % (len(varios), ', '.join(varios)))
        if esp and m != esp:
            print('        el registro dice «%s»' % esp)
        if not bien:
            fallos += 1
    for k, (la, lo) in enumerate(sueltos):
        m = de(la, lo)
        varios = todos(la, lo)
        print('  --   %.6f,%.6f -> %s%s' % (la, lo, m or '(fuera de la isla)',
              ('  [cae en %s, gana el mas pequeño]' % ', '.join(varios)) if len(varios) > 1 else ''))
    print('  %s' % ('OK' if not fallos else '%d ficha(s) sin cuadrar' % fallos))
    return 1 if fallos else 0


if __name__ == '__main__':
    sys.exit(main())
