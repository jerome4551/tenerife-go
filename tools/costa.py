#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
costa.py — la linea de costa del proyecto, en un solo sitio.

No es un control: es el trozo de geometria que usan los controles que
miden tierra y mar (auditar_en_el_mar.py, auditar_redondeo.py) y las
herramientas que mueven coordenadas. Estaba copiado en tres ficheros y
una copia se quedo con el eje Y sin voltear durante semanas, midiendo
contra una costa en espejo y dando verde. Por eso vive aqui una vez.

DE DONDE SALE
  De la capa `earth` del mapa OSM que ya lleva el repositorio
  (mapa/tenerife-osm.pmtiles, z14). No se geocodifica nada ni se
  pregunta a ningun servicio: la respuesta sale de un dato que ya
  estaba dentro.

LAS DOS TRAMPAS
  1. EL EJE Y VIENE VOLTEADO. mapbox_vector_tile.decode() devuelve la y
     con el origen abajo. Se comprobo sobre los 804 lugares: sin
     voltear, 139 caian fuera de tierra -entre ellos el Hospital del
     Norte, que esta en Icod-; volteando, 22.
  2. LOS AGUJEROS CUENTAN. El oceano viene como un poligono con la
     tierra recortada dentro. Aplanando todos los anillos por igual,
     caer en un agujero contaba como caer dentro.

Y LA DISTANCIA ES AL SEGMENTO, NUNCA AL VERTICE. Medir al vertice mas
cercano ya ha dado tres bloqueantes falsos en este proyecto.
"""
import gzip
import math
import os

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAPA = os.path.join(RAIZ, 'mapa', 'tenerife-osm.pmtiles')
Z, EXT, R = 14, 4096, 6371000.0


def hay_mapa():
    return os.path.exists(MAPA)


def metros(la1, lo1, la2, lo2):
    """Haversine plano local: sobra para las distancias de una isla."""
    k = math.cos(math.radians((la1 + la2) / 2))
    return math.hypot(math.radians(lo2 - lo1) * R * k, math.radians(la2 - la1) * R)


def d_seg(P, A, B):
    """(distancia, punto mas cercano) AL SEGMENTO, nunca al vertice."""
    ax, ay = A[0] - P[0], A[1] - P[1]
    bx, by = B[0] - P[0], B[1] - P[1]
    dx, dy = bx - ax, by - ay
    L = dx * dx + dy * dy
    t = 0.0 if L == 0 else max(0.0, min(1.0, (-ax * dx - ay * dy) / L))
    qx, qy = ax + t * dx, ay + t * dy
    return math.hypot(qx, qy), (P[0] + qx, P[1] + qy)


def abrir():
    """Devuelve analiza(lat,lng) -> (en tierra, metros al borde, punto del
    borde en metros locales relativos al punto), o None si no hay mapa."""
    if not hay_mapa():
        return None
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

    def analiza(la, lo):
        x0 = int((lo + 180) / 360 * N)
        y0 = int((1 - math.log(math.tan(math.radians(la)) + 1 / math.cos(math.radians(la))) / math.pi) / 2 * N)
        tierra, borde, q = False, float('inf'), None
        k = math.cos(math.radians(la))
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                t = tesela(x0 + dx, y0 + dy)
                if not t or 'earth' not in t:
                    continue
                lonA, latA = esquina(x0 + dx, y0 + dy)
                lonB, latB = esquina(x0 + dx + 1, y0 + dy + 1)
                px = (lo - lonA) / (lonB - lonA) * EXT
                py = EXT - (la - latA) / (latB - latA) * EXT     # el eje y, volteado
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
                                d, pt = d_seg((0.0, 0.0), pl[i - 1], pl[i])
                                if d < borde:
                                    borde, q = d, pt
        return tierra, (0.0 if borde == float('inf') else borde), q

    return analiza


def mover(la, lo, ex, ey):
    """Suma metros locales (ex al este, ey al norte) a una coordenada."""
    k = math.cos(math.radians(la))
    return (la + math.degrees(ey / R), lo + math.degrees(ex / (R * k)))
