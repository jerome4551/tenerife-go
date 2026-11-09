#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
cuerpo_isla_relieve.py — el fondo del mapa de «Cruce la isla» (modulos/cuerpo.js, bloque 8).

    python3 tools/cuerpo_isla_relieve.py              pinta los dos fondos (de dia y de noche) y su .json
    python3 tools/cuerpo_isla_relieve.py --comprobar  mira que los fondos sean los de hoy (sin pintar nada)

QUE PINTA
  datos/cuerpo/isla-relieve-dia.webp y datos/cuerpo/isla-relieve-noche.webp: la isla con su
  relieve y su suelo, el mar con tres lineas de agua y la linea de costa, en la proyeccion de
  islaP() del modulo (ISLA_W, ISLA_M, ISLA_LON e ISLA_LAT, que se leen del propio modulo) a tres
  pixeles por unidad (1074 x 906 para 358 x 302): nitido en un iPhone. Encima, el modulo dibuja
  la ruta, las paradas, los nombres y el compañero. Y datos/cuerpo/isla-relieve.json: de que
  ficheros sale (con su sha256), la proyeccion, el tamaño y el sha256 de cada fondo.

DE DONDE SALE (nada se inventa ni se pide a ningun servicio)
  · El relieve: mapa/tenerife-relieve.png, el de «La isla en 3D» (el Copernicus DEM GLO-30
    en celdas de 60 m, o el MDT05 del IGN si un dia el workflow lo cambia: entonces este
    fondo hay que rehacerlo y su credito, el de «Las cifras», tambien; --comprobar lo dice).
    La altura sombrea las laderas (luz del noroeste) y aclara la cumbre; la fraccion de cielo
    (mapa/tenerife-relieve-ao.png) oscurece barrancos y calderas.
  · El suelo: la capa landuse de mapa/tenerife-osm.pmtiles (z11; OpenStreetMap, ODbL): bosque
    (forest, wood), matorral (scrub, heath, grassland, meadow, grass), roca (bare_rock, scree),
    cultivo (farmland, orchard, vineyard, allotments), pueblos (residential, industrial,
    commercial, retail, railway, aerodrome) y arena (sand, beach). Cada clase, su color.
  · La costa: el borde exterior de los limites municipales de 2015
    (datos/osm-geofabrik/municipios/municipios_tenerife.geojson), entero (68.575 vertices),
    el mismo anillo que tools/cuerpo_isla.py simplifica para COSTA.
  · Las tres lineas del mar (a 1,1, 2,4 y 4 km de la costa) son dibujo, no profundidades.

LO QUE HACE FALTA
  Para pintar: numpy, scipy y Pillow con WebP. Para --comprobar, nada: solo la biblioteca
  estandar (sumas sha256, la proyeccion del modulo y las dos notas de Copernicus que enseña «Las
  cifras»), asi que va en tools/auditar.sh.
"""
import collections
import hashlib
import io
import json
import math
import os
import re
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(RAIZ, 'tools'))

MODULO = os.path.join(RAIZ, 'modulos', 'cuerpo.js')
RELIEVE = os.path.join(RAIZ, 'mapa', 'tenerife-relieve.png')
RELIEVE_AO = os.path.join(RAIZ, 'mapa', 'tenerife-relieve-ao.png')
RELIEVE_JSON = os.path.join(RAIZ, 'mapa', 'tenerife-relieve.json')
OSM = os.path.join(RAIZ, 'mapa', 'tenerife-osm.pmtiles')
GEOJSON = os.path.join(RAIZ, 'datos', 'osm-geofabrik', 'municipios', 'municipios_tenerife.geojson')
SALIDA = os.path.join(RAIZ, 'datos', 'cuerpo')
FONDOS = {'dia': 'isla-relieve-dia.webp', 'noche': 'isla-relieve-noche.webp'}
MANIFIESTO = os.path.join(SALIDA, 'isla-relieve.json')
FORMATO = 1
ESCALA = 3                 # pixeles del fondo por unidad del viewBox del mapa
CALIDAD = 82               # WebP con perdida; method=6 (el mas lento, el mas pequeño)
R_TIERRA = 6378137.0
FUENTE_RELIEVE = 'copernicus-glo30'   # la que nombra el credito de «Las cifras» (cuerpoCifrasMapa)

ENTRADAS = {
    'relieve': RELIEVE, 'relieve_ao': RELIEVE_AO, 'relieve_json': RELIEVE_JSON,
    'osm': OSM, 'costa': GEOJSON, 'herramienta': os.path.abspath(__file__),
}

CLASES = (
    ('matorral', ('scrub', 'heath', 'grassland', 'meadow', 'grass')),
    ('cultivo', ('farmland', 'orchard', 'vineyard', 'allotments')),
    ('bosque', ('forest', 'wood')),
    ('roca', ('bare_rock', 'scree')),
    ('ciudad', ('residential', 'industrial', 'commercial', 'retail', 'railway', 'aerodrome')),
    ('arena', ('sand', 'beach')),
)

TEMAS = {
    'dia': dict(
        mar_cerca='#E4F2F3', mar_lejos='#CFE5E9', agua='#0B7C86', agua_alfa=(0.16, 0.11, 0.07),
        rampa=[(0, '#EFE4C9'), (600, '#E7D8B7'), (1200, '#DDCCA9'), (2000, '#D5C5A7'), (2400, '#DFD4C1'),
               (3000, '#E9E2D7'), (3715, '#F5F1EB')],
        clases=dict(matorral=('#D5CBA2', 0.85), cultivo=('#D9D6A8', 0.55), bosque=('#9FB689', 0.92),
                    roca=('#BBA58F', 0.85), ciudad=('#D8CEC3', 0.75), arena=('#F2E5C2', 0.9)),
        sombra='#4E3D2A', luz='#FFFDF6', costa='#7A6446', borde='#FFF9EC',
        k_sombra=0.60, k_luz=0.28, k_ao=0.55, sombra_isla=0.14, k_borde=0.30,
    ),
    'noche': dict(
        mar_cerca='#142231', mar_lejos='#0E1823', agua='#3CC8D6', agua_alfa=(0.16, 0.11, 0.07),
        rampa=[(0, '#2D3746'), (500, '#313C4C'), (1200, '#364254'), (2000, '#3E4A5D'), (2400, '#4A566E'),
               (3000, '#5A667E'), (3715, '#727E96')],
        clases=dict(matorral=('#353F45', 0.85), cultivo=('#323E3A', 0.55), bosque=('#243C32', 0.92),
                    roca=('#40434B', 0.85), ciudad=('#3D3F49', 0.75), arena=('#403F3B', 0.9)),
        sombra='#070B12', luz='#A9BBD6', costa='#8899AE', borde='#5D6E86',
        k_sombra=0.68, k_luz=0.24, k_ao=0.60, sombra_isla=0.35, k_borde=0.25,
    ),
}


def sha256(ruta):
    h = hashlib.sha256()
    with open(ruta, 'rb') as f:
        for trozo in iter(lambda: f.read(1 << 20), b''):
            h.update(trozo)
    return h.hexdigest()


def proyeccion():
    """Las constantes de islaP(), leidas del modulo: si alguien las cambia alli, el fondo ya no casa."""
    s = open(MODULO, encoding='utf-8').read()
    m = re.search(r'var ISLA_W = (\d+), ISLA_M = (\d+), ISLA_LON = \[(-?[\d.]+), (-?[\d.]+)\], ISLA_LAT = \[(-?[\d.]+), (-?[\d.]+)\];', s)
    if not m:
        raise SystemExit('No encuentro ISLA_W, ISLA_M, ISLA_LON e ISLA_LAT en modulos/cuerpo.js: para.')
    w, mg = int(m.group(1)), int(m.group(2))
    lon = (float(m.group(3)), float(m.group(4)))
    lat = (float(m.group(5)), float(m.group(6)))
    k = math.cos(28.3 * math.pi / 180)
    esc = (w - 2 * mg) / ((lon[1] - lon[0]) * k)
    h = int(math.floor((lat[1] - lat[0]) * esc + 2 * mg + 0.5))     # Math.round de JS
    return dict(ISLA_W=w, ISLA_M=mg, ISLA_LON=list(lon), ISLA_LAT=list(lat), ISLA_H=h, k=k, esc=esc)


# ───────────────────────── pintar (numpy, scipy, Pillow) ─────────────────────────
def pintar_todo():
    import numpy as np
    from PIL import Image, ImageDraw, features
    from scipy import ndimage
    from cuerpo_isla import anillo_exterior
    from pmtiles_ligero import PMTiles, decodificar, tesela_de, area_firmada

    if not features.check('webp'):
        raise SystemExit('Pillow no tiene WebP: para.')
    rel = json.load(open(RELIEVE_JSON, encoding='utf-8'))
    if rel['fuente']['id'] != FUENTE_RELIEVE:
        raise SystemExit('El relieve sale de %r y el credito de «Las cifras» nombra a Copernicus: hay que cambiar '
                         'cuerpoCifrasMapa (y FUENTE_RELIEVE aqui) antes de pintar. Para.' % rel['fuente']['id'])
    P = proyeccion()
    W, H = P['ISLA_W'] * ESCALA, P['ISLA_H'] * ESCALA

    def isla_p(lat, lon):
        return (P['ISLA_M'] + (lon - P['ISLA_LON'][0]) * P['k'] * P['esc'],
                P['ISLA_M'] + (P['ISLA_LAT'][1] - lat) * P['esc'])

    def hexrgb(s):
        s = s.lstrip('#')
        return np.array([int(s[i:i + 2], 16) for i in (0, 2, 4)], dtype=np.float64)

    def rampa(h, tabla):
        hs = np.array([t[0] for t in tabla], dtype=np.float64)
        cs = np.array([hexrgb(t[1]) for t in tabla])
        out = np.empty(h.shape + (3,))
        for c in range(3):
            out[..., c] = np.interp(h, hs, cs[:, c])
        return out

    def suave_paso(a, b, x):
        t = np.clip((x - a) / (b - a), 0, 1)
        return t * t * (3 - 2 * t)

    # el relieve, remuestreado a la malla del fondo (bicubico; el mar, 0)
    M = rel['malla']
    a = np.asarray(Image.open(RELIEVE), dtype=np.int64)
    alt = (a[..., 0] * 256 + a[..., 1]) * rel['altura']['metros_por_unidad']
    ao = np.asarray(Image.open(RELIEVE_AO), dtype=np.float64) / 255.0
    x = (np.arange(W) + 0.5) / ESCALA
    y = (np.arange(H) + 0.5) / ESCALA
    lon = P['ISLA_LON'][0] + (x - P['ISLA_M']) / (P['k'] * P['esc'])
    lat = P['ISLA_LAT'][1] - (y - P['ISLA_M']) / P['esc']
    X = R_TIERRA * np.radians(lon)
    Y = R_TIERRA * np.log(np.tan(np.pi / 4 + np.radians(lat) / 2))
    FJ, CI = np.meshgrid((M['y0'] - Y) / M['paso'] - 0.5, (X - M['x0']) / M['paso'] - 0.5, indexing='ij')
    h = np.maximum(ndimage.map_coordinates(alt, [FJ, CI], order=3, mode='constant', cval=0.0), 0.0)
    cielo = np.clip(ndimage.map_coordinates(ao, [FJ, CI], order=1, mode='constant', cval=1.0), 0, 1)
    paso_m = 111320.0 / (P['esc'] * ESCALA)

    # la tierra: el anillo entero de los limites municipales, a 4x y reducido (bordes suaves)
    ss = 4
    im = Image.new('L', (W * ss, H * ss), 0)
    ImageDraw.Draw(im).polygon([tuple(v * ESCALA * ss for v in isla_p(la, lo)) for lo, la in anillo_exterior()], fill=255)
    tierra_a = np.asarray(im.resize((W, H), Image.LANCZOS), dtype=np.float64) / 255.0

    # el suelo: la capa landuse de OSM a z11, cada clase en su mascara (a 2x y reducida)
    p, z, n = PMTiles(OSM), 11, 2 ** 11
    capas = {c: Image.new('L', (W * 2, H * 2), 0) for c, _ in CLASES}
    dib = {c: ImageDraw.Draw(im2) for c, im2 in capas.items()}
    clase_de = {k: c for c, ks in CLASES for k in ks}
    x0, y1 = tesela_de(-16.98, 27.90, z)
    x1, y0 = tesela_de(-16.08, 28.65, z)
    for tx in range(int(x0), int(x1) + 1):
        for ty in range(int(y0), int(y1) + 1):
            datos = decodificar(p.tesela(z, tx, ty))
            if 'landuse' not in datos:
                continue
            ext, rasgos = datos['landuse']
            for tipo, props, partes in rasgos:
                c = clase_de.get(props.get('kind'))
                if tipo != 3 or c is None:
                    continue
                for anillo in partes:
                    if len(anillo) < 4:
                        continue
                    pts = []
                    for u, v in anillo:
                        lo = (tx + u / ext) / n * 360.0 - 180.0
                        la = math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * (ty + v / ext) / n))))
                        q = isla_p(la, lo)
                        pts.append((q[0] * ESCALA * 2, q[1] * ESCALA * 2))
                    dib[c].polygon(pts, fill=255 if area_firmada(anillo) > 0 else 0)
    p.cerrar()
    suelo = {c: np.asarray(capas[c].resize((W, H), Image.LANCZOS), dtype=np.float64) / 255.0 for c, _ in CLASES}

    # el sombreado: varias luces (la principal del noroeste), con el relieve exagerado 1,9 veces
    hz = ndimage.gaussian_filter(h, 0.7) * 1.9
    gy, gx = np.gradient(hz, paso_m)
    pend = np.arctan(np.hypot(gx, gy))
    orient = np.arctan2(gy, -gx)
    zen = math.radians(90 - 42)
    luz = np.zeros_like(h)
    for az, peso in ((315, 0.55), (270, 0.15), (345, 0.20), (225, 0.10)):
        luz += peso * (np.cos(zen) * np.cos(pend) + np.sin(zen) * np.sin(pend) * np.cos(math.radians(90 - az) - orient))
    luz = np.clip(luz, 0, 1)
    llano = math.cos(zen)
    oscuro = np.clip((llano - luz) / llano, 0, 1)
    claro = np.clip((luz - llano) / (1 - llano), 0, 1)

    tierra = tierra_a > 0.5
    dist_mar = ndimage.gaussian_filter(ndimage.distance_transform_edt(~tierra), 1.2) * paso_m / 1000.0
    dist_tierra = ndimage.distance_transform_edt(tierra) * paso_m / 1000.0
    sombra_isla = ndimage.gaussian_filter(tierra_a, 2.2 * ESCALA)
    sombra_isla = np.roll(np.roll(sombra_isla, int(0.8 * ESCALA), axis=0), int(0.5 * ESCALA), axis=1)
    borde = ndimage.gaussian_filter(np.clip(1 - np.abs(tierra_a - 0.5) * 2, 0, 1), 0.35 * ESCALA) * 1.6

    fondos = {}
    for tema, T in TEMAS.items():
        t = suave_paso(0.0, 14.0, dist_mar)[..., None]
        mar = (1 - t) * hexrgb(T['mar_cerca']) + t * hexrgb(T['mar_lejos'])
        for dk, alfa in zip((1.1, 2.4, 4.0), T['agua_alfa']):
            d = np.abs(dist_mar - dk) * 1000.0 / paso_m
            al = np.clip(1 - d / (0.55 * ESCALA), 0, 1)[..., None] * alfa
            mar = mar * (1 - al) + hexrgb(T['agua']) * al
        mar = mar * (1 - T['sombra_isla'] * sombra_isla[..., None] * (1 - tierra_a[..., None]))

        base = rampa(h, T['rampa'])
        aclara = np.clip(base / rampa(np.zeros(1), T['rampa'])[0], 0.6, 1.3)
        for c, _ in CLASES:
            col, k = T['clases'][c]
            al = (ndimage.gaussian_filter(suelo[c], 0.45 * ESCALA) * k)[..., None]
            base = base * (1 - al) + hexrgb(col) * aclara * al
        al = (T['k_sombra'] * oscuro ** 0.9)[..., None]
        isla = base * (1 - al) + hexrgb(T['sombra']) * al
        al = (T['k_luz'] * claro ** 1.1)[..., None]
        isla = isla * (1 - al) + hexrgb(T['luz']) * al
        isla = isla * (1 - T['k_ao'] * (1 - cielo) ** 1.2)[..., None]
        al = (np.clip(1 - dist_tierra / 0.30, 0, 1) * T['k_borde'])[..., None]
        isla = isla * (1 - al) + hexrgb(T['borde']) * al

        img = mar * (1 - tierra_a[..., None]) + isla * tierra_a[..., None]
        al = np.clip(borde, 0, 1)[..., None] * 0.55
        img = img * (1 - al) + hexrgb(T['costa']) * al
        buf = io.BytesIO()
        Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).save(buf, 'WEBP', quality=CALIDAD, method=6)
        fondos[tema] = buf.getvalue()
    return P, (W, H), fondos, rel


def manifiesto(P, tam, fondos, rel):
    return {
        'formato': FORMATO,
        'que': 'El fondo del mapa de «Cruce la isla» (modulos/cuerpo.js): relieve, suelo, mar y costa. Lo pinta tools/cuerpo_isla_relieve.py.',
        'proyeccion': {k: P[k] for k in ('ISLA_W', 'ISLA_M', 'ISLA_LON', 'ISLA_LAT', 'ISLA_H')},
        'escala': ESCALA, 'tamaño': list(tam), 'calidad_webp': CALIDAD,
        'relieve_fuente': rel['fuente']['id'],
        'entradas': {k: {'fichero': os.path.relpath(v, RAIZ), 'sha256': sha256(v)} for k, v in ENTRADAS.items()},
        'fondos': {t: {'fichero': 'datos/cuerpo/' + FONDOS[t], 'bytes': len(b), 'sha256': hashlib.sha256(b).hexdigest()} for t, b in fondos.items()},
        'nota': 'Las tres lineas del mar son dibujo, no profundidades. El suelo, de OpenStreetMap (ODbL); el relieve, el de «La isla en 3D».',
    }


def escribir():
    P, tam, fondos, rel = pintar_todo()
    for t, b in fondos.items():
        with open(os.path.join(SALIDA, FONDOS[t]), 'wb') as f:
            f.write(b)
    m = manifiesto(P, tam, fondos, rel)
    with open(MANIFIESTO, 'w', encoding='utf-8') as f:
        json.dump(m, f, ensure_ascii=False, indent=1)
        f.write('\n')
    print('Hecho: %s (%d bytes) y %s (%d bytes), %d x %d; y datos/cuerpo/isla-relieve.json'
          % (FONDOS['dia'], len(fondos['dia']), FONDOS['noche'], len(fondos['noche']), tam[0], tam[1]))


def comprobar():
    fallos = []
    if not os.path.exists(MANIFIESTO):
        print('FALLA: no esta datos/cuerpo/isla-relieve.json (python3 tools/cuerpo_isla_relieve.py lo pinta).')
        return 1
    m = json.load(open(MANIFIESTO, encoding='utf-8'))
    if m.get('formato') != FORMATO:
        fallos.append('formato %r, se esperaba %d' % (m.get('formato'), FORMATO))
    P = proyeccion()
    for k in ('ISLA_W', 'ISLA_M', 'ISLA_LON', 'ISLA_LAT', 'ISLA_H'):
        if m.get('proyeccion', {}).get(k) != P[k]:
            fallos.append('la proyeccion no es la del modulo (%s: %r en el fondo, %r en modulos/cuerpo.js)' % (k, m.get('proyeccion', {}).get(k), P[k]))
    if m.get('tamaño') != [P['ISLA_W'] * ESCALA, P['ISLA_H'] * ESCALA]:
        fallos.append('el tamaño %r no es %d x %d' % (m.get('tamaño'), P['ISLA_W'] * ESCALA, P['ISLA_H'] * ESCALA))
    for k, ruta in ENTRADAS.items():
        e = m.get('entradas', {}).get(k, {})
        if not os.path.exists(ruta):
            fallos.append('falta %s' % os.path.relpath(ruta, RAIZ))
        elif e.get('sha256') != sha256(ruta):
            fallos.append('%s ha cambiado desde que se pinto el fondo: hay que volver a pintarlo' % os.path.relpath(ruta, RAIZ))
    rel = json.load(open(RELIEVE_JSON, encoding='utf-8'))
    if rel['fuente']['id'] != FUENTE_RELIEVE or m.get('relieve_fuente') != FUENTE_RELIEVE:
        fallos.append('el relieve sale de %r y el credito del mapa nombra a Copernicus' % rel['fuente']['id'])
    for t, nombre in FONDOS.items():
        ruta = os.path.join(SALIDA, nombre)
        f = m.get('fondos', {}).get(t, {})
        if not os.path.exists(ruta):
            fallos.append('falta datos/cuerpo/%s' % nombre)
            continue
        b = open(ruta, 'rb').read()
        if f.get('sha256') != hashlib.sha256(b).hexdigest() or f.get('bytes') != len(b):
            fallos.append('datos/cuerpo/%s no es el que dice el .json' % nombre)
        if b[:4] != b'RIFF' or b[8:12] != b'WEBP':
            fallos.append('datos/cuerpo/%s no es un WebP' % nombre)
        else:
            ancho = alto = None
            if b[12:16] == b'VP8 ':
                ancho = int.from_bytes(b[26:28], 'little') & 0x3FFF
                alto = int.from_bytes(b[28:30], 'little') & 0x3FFF
            if (ancho, alto) != (P['ISLA_W'] * ESCALA, P['ISLA_H'] * ESCALA):
                fallos.append('datos/cuerpo/%s mide %rx%r, no %dx%d' % (nombre, ancho, alto, P['ISLA_W'] * ESCALA, P['ISLA_H'] * ESCALA))
    s = open(MODULO, encoding='utf-8').read()
    for t, nombre in FONDOS.items():
        if ("'./datos/cuerpo/%s'" % nombre) not in s:
            fallos.append('el modulo no pide datos/cuerpo/%s' % nombre)
    # las dos notas de Copernicus que enseña «Las cifras», palabra por palabra las del relieve
    for k in ('credito', 'responsabilidad'):
        if ("'%s'" % rel['fuente'][k]) not in s:
            fallos.append('COPERNICUS_NOTAS del modulo no lleva, palabra por palabra, fuente.%s de mapa/tenerife-relieve.json' % k)
    if fallos:
        for x in fallos:
            print('FALLA: ' + x)
        return 1
    print('El fondo de «Cruce la isla» esta al dia: dos WebP de %dx%d (%d y %d bytes) en la proyeccion del modulo, '
          'pintados con el relieve, el mapa OSM, la costa y la herramienta de hoy.'
          % (P['ISLA_W'] * ESCALA, P['ISLA_H'] * ESCALA, m['fondos']['dia']['bytes'], m['fondos']['noche']['bytes']))
    return 0


if __name__ == '__main__':
    if '--comprobar' in sys.argv[1:]:
        sys.exit(comprobar())
    escribir()
