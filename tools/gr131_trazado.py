#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
gr131_trazado.py — el trazado oficial del GR 131 para «Cruce la isla» (modulos/cuerpo.js, bloque 5).

    python3 tools/gr131_trazado.py --fuente "Cabildo de Tenerife, Tenerife ON (GPX, 2026)" RUTA.gpx [MAS.gpx ...]
    python3 tools/gr131_trazado.py --comprobar            comprueba datos/cuerpo/gr131-trazado.json como lo hace el modulo
                                                          (el fichero de serie, sin puntos, dice que aun no hay trazado: vale)

QUE HACE
  Lee uno o varios GPX (trk/trkseg/trkpt o rte/rtept; tambien un GeoJSON LineString o
  MultiLineString), encadena los tramos por sus extremos mas cercanos, los orienta de La
  Esperanza a Arona, mide los kilometros (haversine, radio 6371 km) y escribe
  datos/cuerpo/gr131-trazado.json:

      { "fuente": "...", "generado": "AAAA-MM-DD", "largo_medido_km": 86.2,
        "puntos": [[lat, lon, km], ...] }

  Los km de las seis paradas se CLAVAN a los oficiales que lleva el modulo (GR131.paradas:
  0 · 29,8 · 42,9 · 56,0 · 67,3 · 85,55): se busca el punto del trazado mas cercano a cada
  parada y los km se reescalan tramo a tramo para que cada parada caiga exactamente en su km.
  Asi el marcador, que avanza por km anotado, pasa por las paradas en su sitio, y el ultimo
  punto queda en 85,55, que es lo que el modulo exige (ponerTrazado: +-0,5 km). Lo que mide el
  GPX de verdad se guarda aparte en largo_medido_km, para saberlo.

  El trazado se simplifica (Douglas-Peucker, 20 m por defecto; --tolerancia METROS) sin
  perder los puntos de las paradas, y se escribe con 5 decimales (1 m) y km con 2.

QUE NO HACE
  No descarga nada: el GPX lo trae quien lo ejecuta (Claude Code, con red), de la fuente
  oficial que ponga en --fuente, que es lo que la app ensena en «Las cifras». Si una
  parada queda a mas de 400 m del trazado, se para y lo dice: no se inventa.

Solo biblioteca estandar.
"""
import datetime
import json
import math
import os
import re
import sys
import xml.etree.ElementTree as ET

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODULO = os.path.join(RAIZ, 'modulos', 'cuerpo.js')
SALIDA = os.path.join(RAIZ, 'datos', 'cuerpo', 'gr131-trazado.json')
R_TIERRA = 6371.0088
MAX_PARADA_M = 400


def paradas_del_modulo():
    """Las paradas y el total, tal como los lleva el modulo (una sola fuente de verdad)."""
    s = open(MODULO, encoding='utf-8').read()
    m = re.search(r"var GR131 = \{ total: ([\d.]+), paradas: \[(.*?)\] \};", s, re.S)
    if not m:
        sys.exit('no encuentro GR131 en el modulo')
    total = float(m.group(1))
    paradas = []
    for p in re.finditer(r"\{ id: '(\w+)', nombre: '([^']+)', corto: '[^']+', km: ([\d.]+), lat: ([\d.\-]+), lon: ([\d.\-]+) \}", m.group(2)):
        paradas.append({'id': p.group(1), 'nombre': p.group(2), 'km': float(p.group(3)), 'lat': float(p.group(4)), 'lon': float(p.group(5))})
    if len(paradas) < 2:
        sys.exit('no leo las paradas del modulo')
    return total, paradas


def hav(a, b):
    """Distancia en km entre (lat, lon) y (lat, lon)."""
    la1, lo1, la2, lo2 = map(math.radians, (a[0], a[1], b[0], b[1]))
    h = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2
    return 2 * R_TIERRA * math.asin(math.sqrt(h))


def lee_gpx(ruta):
    """Los tramos de un GPX como listas de (lat, lon)."""
    ns = {'g': 'http://www.topografix.com/GPX/1/1', 'g0': 'http://www.topografix.com/GPX/1/0'}
    raiz = ET.parse(ruta).getroot()
    tramos = []
    for pref in ('g', 'g0'):
        for seg in raiz.iter('{%s}trkseg' % ns[pref]):
            pts = [(float(p.get('lat')), float(p.get('lon'))) for p in seg.findall('{%s}trkpt' % ns[pref])]
            if len(pts) > 1:
                tramos.append(pts)
        for rte in raiz.iter('{%s}rte' % ns[pref]):
            pts = [(float(p.get('lat')), float(p.get('lon'))) for p in rte.findall('{%s}rtept' % ns[pref])]
            if len(pts) > 1:
                tramos.append(pts)
    if not tramos:   # GPX sin espacio de nombres
        for seg in raiz.iter('trkseg'):
            pts = [(float(p.get('lat')), float(p.get('lon'))) for p in seg.findall('trkpt')]
            if len(pts) > 1:
                tramos.append(pts)
    return tramos


def lee_geojson(ruta):
    d = json.load(open(ruta, encoding='utf-8'))
    geoms = []
    if d.get('type') == 'FeatureCollection':
        geoms = [f['geometry'] for f in d['features'] if f.get('geometry')]
    elif d.get('type') == 'Feature':
        geoms = [d['geometry']]
    else:
        geoms = [d]
    tramos = []
    for g in geoms:
        if g['type'] == 'LineString':
            tramos.append([(c[1], c[0]) for c in g['coordinates']])
        elif g['type'] == 'MultiLineString':
            for l in g['coordinates']:
                tramos.append([(c[1], c[0]) for c in l])
    return tramos


def encadena(tramos, inicio):
    """Encadena los tramos empezando por el que tiene un extremo mas cerca de `inicio`,
    y sigue siempre por el extremo mas cercano al final del anterior (dandole la vuelta si hace falta)."""
    tramos = [t for t in tramos if len(t) > 1]
    if not tramos:
        sys.exit('el fichero no trae ningun tramo')
    i0 = min(range(len(tramos)), key=lambda i: min(hav(tramos[i][0], inicio), hav(tramos[i][-1], inicio)))
    t = tramos.pop(i0)
    if hav(t[-1], inicio) < hav(t[0], inicio):
        t = t[::-1]
    cadena = list(t)
    while tramos:
        fin = cadena[-1]
        j = min(range(len(tramos)), key=lambda i: min(hav(tramos[i][0], fin), hav(tramos[i][-1], fin)))
        t = tramos.pop(j)
        if hav(t[-1], fin) < hav(t[0], fin):
            t = t[::-1]
        salto = hav(t[0], fin)
        if salto > 1.0:
            print('AVISO: salto de %.2f km entre tramos (el trazado no es continuo)' % salto, file=sys.stderr)
        cadena.extend(t if salto > 0.001 else t[1:])
    return cadena


def acumula(pts):
    km = [0.0]
    for i in range(1, len(pts)):
        km.append(km[-1] + hav(pts[i - 1], pts[i]))
    return km


def clava_paradas(pts, km, paradas):
    """El indice del punto mas cercano a cada parada, en orden creciente; se para si alguna queda lejos."""
    idx, desde = [], 0
    for p in paradas:
        obj = (p['lat'], p['lon'])
        i = min(range(desde, len(pts)), key=lambda k: hav(pts[k], obj))
        d = hav(pts[i], obj) * 1000
        if d > MAX_PARADA_M:
            sys.exit('la parada %s (%s) queda a %.0f m del trazado: no se clava (¿es el GR 131 completo?)' % (p['id'], p['nombre'], d))
        print('  %-10s km medido %7.2f  → oficial %6.2f  (a %3.0f m del trazado)' % (p['id'], km[i], p['km'], d), file=sys.stderr)
        idx.append(i)
        desde = i + 1
    return idx


def reescala(km, idx, paradas):
    """km reescalados tramo a tramo para que cada parada caiga en su km oficial."""
    out = [0.0] * len(km)
    for t in range(len(idx) - 1):
        a, b = idx[t], idx[t + 1]
        ka, kb = paradas[t]['km'], paradas[t + 1]['km']
        la, lb = km[a], km[b]
        for i in range(a, b + 1):
            f = (km[i] - la) / (lb - la) if lb > la else 0.0
            out[i] = ka + (kb - ka) * f
    return out


def simplifica(pts, tol_km, fijos):
    """Douglas-Peucker sobre indices, conservando los fijos (las paradas)."""
    K = math.cos(math.radians(28.3))

    def dist(p, a, b):
        ax, ay, bx, by, px, py = a[1] * K, a[0], b[1] * K, b[0], p[1] * K, p[0]
        dx, dy = bx - ax, by - ay
        if dx == 0 and dy == 0:
            return math.hypot(px - ax, py - ay)
        t = max(0.0, min(1.0, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
        return math.hypot(px - (ax + t * dx), py - (ay + t * dy))

    tol = tol_km / 111.32   # grados
    keep = set(fijos) | {0, len(pts) - 1}
    pila = []
    fijos_ord = sorted(keep)
    for a, b in zip(fijos_ord, fijos_ord[1:]):
        pila.append((a, b))
    while pila:
        i, j = pila.pop()
        if j <= i + 1:
            continue
        mx, mi = -1.0, -1
        for m in range(i + 1, j):
            dd = dist(pts[m], pts[i], pts[j])
            if dd > mx:
                mx, mi = dd, m
        if mx > tol:
            keep.add(mi)
            pila.append((i, mi))
            pila.append((mi, j))
    return sorted(keep)


def comprueba(ruta, total, paradas):
    """Lo mismo que mira el modulo (ponerTrazado), y algo mas."""
    j = json.load(open(ruta, encoding='utf-8'))
    pts = j.get('puntos')
    if isinstance(pts, list) and not pts and not j.get('fuente'):
        print('gr131-trazado.json: sin trazado oficial todavia (puntos vacios): la app dibuja el esquema. Vale.')
        return
    if not isinstance(pts, list) or len(pts) < 10:
        sys.exit('puntos: faltan (hacen falta al menos 10)')
    ult = -1
    for n, p in enumerate(pts):
        if not (isinstance(p, list) and len(p) >= 3 and all(isinstance(v, (int, float)) for v in p[:3])):
            sys.exit('punto %d mal formado: %r' % (n, p))
        if not (27.9 <= p[0] <= 28.7 and -17.1 <= p[1] <= -16):
            sys.exit('punto %d fuera de Tenerife: %r' % (n, p))
        if p[2] < ult:
            sys.exit('punto %d: los km retroceden (%s tras %s)' % (n, p[2], ult))
        ult = p[2]
    if abs(ult - total) > 0.5:
        sys.exit('el ultimo km es %.2f y el total del modulo %.2f (mas de 0,5 km)' % (ult, total))
    for p in paradas:
        i = min(range(len(pts)), key=lambda k: abs(pts[k][2] - p['km']))
        d = hav((pts[i][0], pts[i][1]), (p['lat'], p['lon'])) * 1000
        print('  %-10s en el km %6.2f del trazado: a %3.0f m de su coordenada%s' % (p['id'], pts[i][2], d, '' if d <= MAX_PARADA_M else '  ← LEJOS'), file=sys.stderr)
        if d > MAX_PARADA_M:
            sys.exit('la parada %s queda lejos del trazado' % p['id'])
    if not isinstance(j.get('fuente'), str) or not j['fuente'].strip():
        sys.exit('fuente: falta (es lo que la app ensena en «Las cifras»)')
    print('gr131-trazado.json: %d puntos, %.2f km, fuente «%s»: vale' % (len(pts), ult, j['fuente']))


def main():
    args = sys.argv[1:]
    total, paradas = paradas_del_modulo()
    if '--comprobar' in args:
        comprueba(SALIDA, total, paradas)
        return
    fuente, tol_m, ficheros = '', 20.0, []
    i = 0
    while i < len(args):
        if args[i] == '--fuente':
            fuente = args[i + 1]; i += 2
        elif args[i] == '--tolerancia':
            tol_m = float(args[i + 1]); i += 2
        else:
            ficheros.append(args[i]); i += 1
    if not ficheros or not fuente.strip():
        sys.exit(__doc__)
    tramos = []
    for f in ficheros:
        tramos.extend(lee_geojson(f) if f.lower().endswith(('.json', '.geojson')) else lee_gpx(f))
    inicio = (paradas[0]['lat'], paradas[0]['lon'])
    pts = encadena(tramos, inicio)
    km = acumula(pts)
    print('trazado: %d puntos, %.2f km medidos (oficial: %.2f)' % (len(pts), km[-1], total), file=sys.stderr)
    idx = clava_paradas(pts, km, paradas)
    pts, km = pts[idx[0]:idx[-1] + 1], km[idx[0]:idx[-1] + 1]   # antes de la primera parada y despues de la ultima, fuera
    idx = [i - idx[0] for i in idx]
    km2 = reescala(km, idx, paradas)
    keep = simplifica(pts, tol_m / 1000.0, idx)
    puntos = [[round(pts[i][0], 5), round(pts[i][1], 5), round(km2[i], 2)] for i in keep]
    puntos[-1][2] = round(total, 2)
    salida = {'fuente': fuente.strip(), 'generado': datetime.date.today().isoformat(), 'largo_medido_km': round(km[-1] - km[0], 2), 'puntos': puntos}
    os.makedirs(os.path.dirname(SALIDA), exist_ok=True)
    with open(SALIDA, 'w', encoding='utf-8') as f:
        json.dump(salida, f, ensure_ascii=False, separators=(',', ':'))
        f.write('\n')
    print('escrito %s: %d puntos (de %d), %.1f kB' % (os.path.relpath(SALIDA, RAIZ), len(puntos), len(pts), os.path.getsize(SALIDA) / 1024), file=sys.stderr)
    comprueba(SALIDA, total, paradas)


if __name__ == '__main__':
    main()
