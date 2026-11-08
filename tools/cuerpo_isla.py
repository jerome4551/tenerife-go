#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
cuerpo_isla.py — la costa de Tenerife que dibuja «Cruce la isla» (modulos/cuerpo.js, bloque 5).

    python3 tools/cuerpo_isla.py              escribe la constante COSTA tal como va en el modulo
    python3 tools/cuerpo_isla.py --comprobar  compara con la que lleva el modulo y dice si coincide

DE DONDE SALE
  De los limites municipales que ya lleva el repositorio
  (datos/osm-geofabrik/municipios/municipios_tenerife.geojson: 31 municipios, 182
  poligonos, shapefile de 23-11-2015 aportado por Jerome, WGS 84). La costa es
  el borde exterior de la union de los municipios: las aristas que solo pertenecen
  a un poligono (las compartidas entre dos municipios se anulan). No se pregunta
  a ningun servicio ni se geocodifica nada.

  Salen 151 anillos: el grande (68.575 vertices) es la isla; los demas, roques e
  islotes, que no se dibujan. El anillo se simplifica con Douglas-Peucker a 0,002
  grados (unos 220 m: un pixel del esquema, que mide 358 px para 80 km) y queda en
  unos 260 puntos, escritos «lat,lon» con cuatro decimales (11 m), separados por
  espacios y del noreste hacia el sur en el sentido de las agujas del reloj.

QUE NO ES
  No es el trazado del GR 131: ese es un esquema entre paradas hasta que llegue
  el oficial (tools/gr131_trazado.py). Y no es cartografia: es el dibujo de un
  esquema de 358 px.
"""
import collections
import json
import math
import os
import re
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GEOJSON = os.path.join(RAIZ, 'datos', 'osm-geofabrik', 'municipios', 'municipios_tenerife.geojson')
MODULO = os.path.join(RAIZ, 'modulos', 'cuerpo.js')
TOL = 0.002
K = math.cos(28.3 * math.pi / 180)


def anillo_exterior():
    d = json.load(open(GEOJSON, encoding='utf-8'))
    cnt = collections.Counter()
    for ft in d['features']:
        for poly in ft['geometry']['coordinates']:
            for ring in poly:
                pts = [(round(p[0], 7), round(p[1], 7)) for p in ring]
                for i in range(len(pts) - 1):
                    a, b = pts[i], pts[i + 1]
                    if a != b:
                        cnt[(a, b) if a < b else (b, a)] += 1
    adj = collections.defaultdict(list)
    for (a, b), c in cnt.items():
        if c == 1:
            adj[a].append(b)
            adj[b].append(a)
    visto, anillos = set(), []
    for inicio in adj:
        if inicio in visto:
            continue
        anillo, prev, cur = [inicio], None, inicio
        visto.add(inicio)
        while True:
            sig = [n for n in adj[cur] if n != prev]
            if not sig or sig[0] == inicio or sig[0] in visto:
                break
            anillo.append(sig[0])
            visto.add(sig[0])
            prev, cur = cur, sig[0]
        anillos.append(anillo)
    anillos.sort(key=len, reverse=True)
    return anillos[0]


def simplifica(pts, tol):
    def dist(p, a, b):
        ax, ay, bx, by, px, py = a[0] * K, a[1], b[0] * K, b[1], p[0] * K, p[1]
        dx, dy = bx - ax, by - ay
        if dx == 0 and dy == 0:
            return math.hypot(px - ax, py - ay)
        t = max(0.0, min(1.0, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
        return math.hypot(px - (ax + t * dx), py - (ay + t * dy))

    def rec(i, j, keep):
        if j <= i + 1:
            return
        mx, mi = -1.0, -1
        for m in range(i + 1, j):
            dd = dist(pts[m], pts[i], pts[j])
            if dd > mx:
                mx, mi = dd, m
        if mx > tol:
            rec(i, mi, keep)
            keep.add(mi)
            rec(mi, j, keep)

    keep = {0, len(pts) - 1}
    rec(0, len(pts) - 1, keep)
    return [pts[i] for i in sorted(keep)]


def costa():
    anillo = anillo_exterior()
    # se empieza por el punto mas al noreste (la punta de Anaga) y se recorre en el sentido de las agujas del reloj
    i0 = max(range(len(anillo)), key=lambda i: anillo[i][0] + anillo[i][1])
    anillo = anillo[i0:] + anillo[:i0]
    area = sum(anillo[i][0] * anillo[(i + 1) % len(anillo)][1] - anillo[(i + 1) % len(anillo)][0] * anillo[i][1] for i in range(len(anillo)))
    if area > 0:  # antihorario: se invierte
        anillo = [anillo[0]] + anillo[:0:-1]
    s = simplifica(anillo + [anillo[0]], TOL)[:-1]
    return ' '.join('%.4f,%.4f' % (p[1], p[0]) for p in s)


def main():
    c = costa()
    if '--comprobar' in sys.argv:
        m = re.search(r"var COSTA = '([^']+)';", open(MODULO, encoding='utf-8').read())
        if not m:
            sys.exit('no encuentro COSTA en el modulo')
        if m.group(1) == c:
            print('COSTA del modulo: la misma que sale del GeoJSON (%d puntos)' % (c.count(' ') + 1))
        else:
            sys.exit('COSTA del modulo DISTINTA: %d puntos frente a %d' % (m.group(1).count(' ') + 1, c.count(' ') + 1))
        return
    print(c)
    print('%d puntos' % (c.count(' ') + 1), file=sys.stderr)


if __name__ == '__main__':
    main()
