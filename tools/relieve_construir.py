#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
relieve_construir.py — el relieve de Tenerife para «La isla en 3D»
(modulos/isla3d.js, 31 de octubre de 2026).

    python3 tools/relieve_construir.py DEM.tif [DEM.tif ...]
        rehace los tres ficheros del relieve en mapa/ a partir del modelo
        digital del terreno oficial (las teselas que cubran la isla)
    python3 tools/relieve_construir.py --comprobar
        coteja los tres ficheros de mapa/ (lo pasa tools/auditar.sh); sin
        red y solo con numpy y Pillow

LA FUENTE
  Copernicus DEM GLO-30 (Agencia Espacial Europea / Union Europea): una
  altura cada segundo de arco (unos 30 m), en teselas de un grado, publicas
  en el registro de datos abiertos de AWS (s3://copernicus-dem-30m, sin
  cuenta). Tenerife cabe entera en
  Copernicus_DSM_COG_10_N28_00_W017_00_DEM.tif. La descarga la hace
  .github/workflows/generar-relieve.yml, que tiene red; aqui solo se
  transforma. La tesela que entra se anota en el .json con su sha256.

LA COSTA NO SALE DEL MODELO, SALE DEL MAPA
  La linea de costa es la de la capa `earth` de mapa/tenerife-osm.pmtiles,
  la misma que dibuja el mapa detallado y la que usa tools/costa.py: si el
  3D tuviera otra costa, el agua del 3D no casaria con la del mapa. Donde el
  mapa dice mar, la altura es 0; donde dice tierra, al menos 0,1 m.

LO QUE ESCRIBE (en mapa/)
  tenerife-relieve.png     RGB, una celda de 60 m por pixel, en la malla de
                           Web Mercator de la app (la de las teselas): R y G
                           son la altura en decimetros (R*256+G; 0 = mar) y B
                           la distancia a la costa con signo (128 en la
                           costa, 4 m por unidad, mas de 128 hacia tierra).
  tenerife-relieve-ao.png  gris: la fraccion de cielo que se ve desde cada
                           celda (sky-view factor), con la que el 3D oscurece
                           barrancos y calderas. Calculado aqui, no en el movil.
  tenerife-relieve.json    la malla, las escalas, la fuente con su sha256, su
                           licencia y las dos notas que esta pide, y los
                           controles (sumas y muestras) con los que la app
                           comprueba que el PNG se ha leido sin tocar un solo
                           valor (la gestion de color de un navegador lo
                           estropearia en silencio).
  Y la huella del relieve en sw.js y en index.html (ver HUELLAS): un relieve
  nuevo cambia sw.js, que es lo que hace que los moviles que ya tienen la app
  lo bajen al precache, y le dice a index.html que hay relieve sin preguntar
  a nadie.

LA LICENCIA
  «Licence for Copernicus DEM instance COP-DEM-GLO-30-F Global 30m Full, Free
  & Open», articulo 6: quien ensena el modelo al publico pone una nota, la del
  6(b) si lo ha adaptado (aqui, remuestreado a 60 m y con la costa de OSM), y
  la frase de la responsabilidad del 6(c), las dos palabra por palabra.
  Estan abajo (NOTA_6B y NOTA_6C), van al .json y el 3D las ensena.

POR QUE UN PNG Y NO UN BINARIO
  GitHub Pages no comprime los .bin; el PNG si va comprimido y el navegador
  lo descomprime solo, sin bibliotecas. Los valores se comprueban al leerlo.
"""
import hashlib
import json
import math
import os
import re
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(RAIZ, 'tools'))

MAPA = os.path.join(RAIZ, 'mapa')
OSM = os.path.join(MAPA, 'tenerife-osm.pmtiles')
PNG = os.path.join(MAPA, 'tenerife-relieve.png')
PNG_AO = os.path.join(MAPA, 'tenerife-relieve-ao.png')
META = os.path.join(MAPA, 'tenerife-relieve.json')
SW = os.path.join(RAIZ, 'sw.js')
INDEX = os.path.join(RAIZ, 'index.html')

# La licencia del modelo y lo que pide su articulo 6 a quien lo ensena al
# publico, palabra por palabra (comprobado contra el PDF el 31 de octubre de
# 2026). modulos/isla3d.js lleva las mismas dos notas (DEM_NOTA y
# DEM_RESPONSABILIDAD) y tools/auditar_isla3d.js coteja las copias.
LICENCIA = dict(
    nombre='Licence for Copernicus DEM instance COP-DEM-GLO-30-F Global 30m Full, Free & Open',
    url='https://documentation.dataspace.copernicus.eu/APIs/SentinelHub/Data/DEM/resources/license/License-COPDEM-30.pdf')
NOTA_6B = ('produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH '
           '2014-2018 provided under COPERNICUS by the European Union and ESA; all rights reserved')
NOTA_6C = ('The organisations in charge of the Copernicus programme by law or by delegation do not incur any '
           'liability for any use of the Copernicus WorldDEM-30')

# La huella del relieve: los 16 primeros caracteres del sha256 del .json, o
# «ninguno» mientras no haya relieve. Va en dos sitios, una linea en cada uno:
#   sw.js       «const RELIEVE_HUELLA = '<huella>';». Con «ninguno», el
#               precache no pide los tres ficheros (tres 404). Y cambia con el
#               relieve: un sw.js distinto es lo que hace que los moviles que
#               ya tienen la app instalen otra vez el service worker y bajen
#               el relieve nuevo al precache, para tenerlo sin conexion aunque
#               no lleguen a abrir el 3D con red.
#   index.html  «var RELIEVE_HUELLA = '<huella>';», en el bloque del 3D. Con
#               «ninguno» el boton no sale y no se pide nada (en la app de las
#               tiendas, preguntar por un fichero que no va dentro es un 404).
# Las escribe construir() (y el workflow, en el mismo commit que el relieve)
# y las coteja --comprobar.
HUELLAS = (
    (SW, re.compile(r"^const RELIEVE_HUELLA = '([^']*)';$", re.M), "const RELIEVE_HUELLA = '%s';"),
    (INDEX, re.compile(r"^  var RELIEVE_HUELLA = '([^']*)';$", re.M), "  var RELIEVE_HUELLA = '%s';"),
)

R = 6378137.0
# La isla con un margen de mar: lo de fuera lo pinta el 3D como mar abierto.
LON_O, LON_E, LAT_S, LAT_N = -16.95, -16.09, 27.98, 28.61
LAT_REF = 28.295            # el centro de la caja: la escala de Mercator ahi
PASO_SUELO = 60.0           # metros de suelo por celda
SS = 4                      # submuestreo de la costa (15 m)
Z_COSTA = 13                # zoom de las teselas de las que sale la costa
COSTA_M_UNIDAD = 4.0        # B: metros por unidad
ALTURA_M_UNIDAD = 0.1       # R*256+G: decimetros

# La cumbre del Teide en la ficha de la app (places[], pico-teide-cumbre),
# para comprobar que la celda mas alta cae donde tiene que caer.
TEIDE = (28.2725, -16.6422)
# Superficie de Tenerife segun el ISTAC/INE: 2.034,38 km2.
SUPERFICIE_KM2 = 2034.38
# Lo mas que se rellena si la costa del mapa llega donde no llega el modelo
# (ver construir): la punta de Rasca, al sur de 28° N, son unas decenas de
# celdas a menos de 300 m de una con modelo.
RELLENO_MAX_CELDAS = 300
RELLENO_MAX_M = 600


def merc_x(lon):
    return R * math.radians(lon)


def merc_y(lat):
    s = math.sin(math.radians(lat))
    return R * 0.5 * math.log((1 + s) / (1 - s))


def lon_de(x):
    return math.degrees(x / R)


def lat_de(y):
    return math.degrees(2 * math.atan(math.exp(y / R)) - math.pi / 2)


def malla():
    k = math.cos(math.radians(LAT_REF))
    paso = PASO_SUELO / k
    x0, y0 = merc_x(LON_O), merc_y(LAT_N)
    ancho = int(math.ceil((merc_x(LON_E) - x0) / paso))
    alto = int(math.ceil((y0 - merc_y(LAT_S)) / paso))
    return dict(x0=x0, y0=y0, paso=paso, ancho=ancho, alto=alto, k=k)


# ───────────────────────── el modelo digital (GeoTIFF) ─────────────────────────
def leer_geotiff(ruta):
    """(alturas float32 [fila, col], lon del centro de la col 0, lat del centro de
    la fila 0, paso en lon, paso en lat, nodata)."""
    import numpy as np
    from PIL import Image
    Image.MAX_IMAGE_PIXELS = None
    im = Image.open(ruta)
    t = im.tag_v2
    escala = t.get(33550)            # ModelPixelScaleTag
    punto = t.get(33922)             # ModelTiepointTag
    claves = t.get(34735)            # GeoKeyDirectoryTag
    if not escala or not punto:
        raise SystemExit('  FALLA  %s no lleva georreferencia (ModelPixelScale / ModelTiepoint)' % ruta)
    sx, sy = float(escala[0]), float(escala[1])
    ti, tj, _, tx, ty, _ = [float(v) for v in punto[:6]]
    # GTRasterTypeGeoKey (1025): 1 = el punto de enganche es la ESQUINA del
    # pixel (PixelIsArea, lo normal); 2 = es su CENTRO (PixelIsPoint).
    tipo = 1
    if claves:
        c = list(claves)
        for k in range(4, len(c) - 3, 4):
            if c[k] == 1025:
                tipo = c[k + 3]
    mitad = 0.5 if tipo == 1 else 0.0
    lon0 = tx + (0 - ti + mitad) * sx
    lat0 = ty - (0 - tj + mitad) * sy
    nodata = None
    if 42113 in t:
        try:
            nodata = float(str(t.get(42113)).strip('\x00 '))
        except ValueError:
            nodata = None
    a = np.array(im, dtype=np.float32)
    if a.ndim != 2:
        raise SystemExit('  FALLA  %s: se esperaba una banda' % ruta)
    return a, lon0, lat0, sx, sy, nodata


def alturas_desde_dem(rutas, M):
    """La altura en el centro de cada celda: media de los pixeles del modelo
    que caen en ella (filtro de caja del tamano de la celda + bilineal)."""
    import numpy as np
    from scipy import ndimage
    ancho, alto = M['ancho'], M['alto']
    xs = M['x0'] + (np.arange(ancho) + 0.5) * M['paso']
    ys = M['y0'] - (np.arange(alto) + 0.5) * M['paso']
    lons = np.degrees(xs / R)
    lats = np.degrees(2 * np.arctan(np.exp(ys / R)) - np.pi / 2)
    LON, LAT = np.meshgrid(lons, lats)
    H = np.full((alto, ancho), np.nan, dtype=np.float64)
    fuentes = []
    for ruta in rutas:
        a, lon0, lat0, sx, sy, nodata = leer_geotiff(ruta)
        if nodata is not None:
            a = np.where(a == nodata, np.nan, a)
        a = np.where(a < -1000, np.nan, a)
        # pixeles del modelo por celda, en cada eje
        lado_x = PASO_SUELO / (sx * 111320.0 * math.cos(math.radians(LAT_REF)))
        lado_y = PASO_SUELO / (sy * 110574.0)
        k = (max(1, int(round(lado_y))), max(1, int(round(lado_x))))
        relleno = np.where(np.isnan(a), 0.0, a)
        peso = ndimage.uniform_filter((~np.isnan(a)).astype(np.float64), size=k, mode='nearest')
        suma = ndimage.uniform_filter(relleno.astype(np.float64), size=k, mode='nearest')
        media = np.where(peso > 0.01, suma / np.maximum(peso, 1e-9), np.nan)
        col = (LON - lon0) / sx
        fil = (lat0 - LAT) / sy
        # hasta el borde de la tesela, medio pixel mas alla del ultimo centro:
        # asi dos teselas vecinas (la N28 y la N27, en 28° N) casan sin una
        # franja de celdas sin altura entre las dos
        dentro = (col >= -0.5) & (col <= a.shape[1] - 0.5) & (fil >= -0.5) & (fil <= a.shape[0] - 0.5)
        v = ndimage.map_coordinates(np.where(np.isnan(media), -9999.0, media),
                                    [fil[dentro], col[dentro]], order=1, mode='nearest')
        v = np.where(v < -1000, np.nan, v)
        sub = H[dentro]
        sub = np.where(np.isnan(sub), v, sub)
        H[dentro] = sub
        fuentes.append(dict(fichero=os.path.basename(ruta), sha256=sha256(ruta),
                            pixeles=[int(a.shape[1]), int(a.shape[0])],
                            caja=[round(lon0 - sx / 2, 6), round(lat0 - (a.shape[0] - 0.5) * sy, 6),
                                  round(lon0 + (a.shape[1] - 0.5) * sx, 6), round(lat0 + sy / 2, 6)]))
    return H, fuentes


# ───────────────────────── la costa (capa earth del mapa OSM) ─────────────────────────
def tierra_osm(M, ruta=OSM, z=Z_COSTA, ss=SS):
    """Mascara de tierra a ss veces la resolucion de la malla."""
    import numpy as np
    from PIL import Image, ImageDraw
    from pmtiles_ligero import PMTiles, decodificar, area_firmada, tesela_de
    W, H = M['ancho'] * ss, M['alto'] * ss
    celda = M['paso'] / ss
    lienzo = Image.new('L', (W, H), 0)
    p = PMTiles(ruta)
    n = 1 << z
    mundo = 2 * math.pi * R
    tx0, ty1 = tesela_de(LON_O, LAT_S, z)
    tx1, ty0 = tesela_de(LON_E, LAT_N, z)
    teselas = 0
    for tx in range(int(tx0), int(tx1) + 1):
        for ty in range(int(ty0), int(ty1) + 1):
            buf = p.tesela(z, tx, ty)
            if not buf:
                continue
            capas = decodificar(buf)
            if 'earth' not in capas:
                continue
            ext, feats = capas['earth']
            # la tesela (sin su borde de propina) en pixeles del lienzo
            X0 = -math.pi * R + tx * mundo / n
            Y0 = math.pi * R - ty * mundo / n
            lado = mundo / n
            c0 = (X0 - M['x0']) / celda
            f0 = (M['y0'] - Y0) / celda
            esc = lado / ext / celda
            ca, fa = int(math.floor(c0)), int(math.floor(f0))
            cb, fb = int(math.ceil(c0 + lado / celda)), int(math.ceil(f0 + lado / celda))
            if cb <= 0 or fb <= 0 or ca >= W or fa >= H:
                continue
            tw, th = cb - ca, fb - fa
            img = Image.new('L', (tw, th), 0)
            d = ImageDraw.Draw(img)
            for tipo, props, partes in feats:
                if tipo != 3:
                    continue
                for anillo in partes:
                    if len(anillo) < 4:
                        continue
                    pts = [(c0 - ca + x * esc, f0 - fa + y * esc) for x, y in anillo]
                    d.polygon(pts, fill=255 if area_firmada(anillo) > 0 else 0)
            # solo el cuadrado de la tesela: el borde de propina lo pinta la vecina
            recorte = img.crop((0, 0, tw, th))
            dest = lienzo.crop((ca, fa, cb, fb))
            mascara = Image.new('L', (tw, th), 0)
            ImageDraw.Draw(mascara).rectangle([max(0, c0 - ca), max(0, f0 - fa),
                                               min(tw, c0 - ca + lado / celda) - 1,
                                               min(th, f0 - fa + lado / celda) - 1], fill=255)
            dest.paste(recorte, (0, 0), mascara)
            lienzo.paste(dest, (ca, fa))
            teselas += 1
    p.cerrar()
    return np.array(lienzo) > 127, teselas


IDIOMAS_OSM = ('name', 'name:es', 'name:en', 'name:fr', 'name:de', 'name:it', 'name:nl',
               'name:zh-Hans', 'name:zh-Hant', 'name:bg', 'name:pl')


def rotulos_osm(ruta=OSM):
    """Los nombres que el 3D pone encima del relieve, del mismo mapa de OSM:
    ciudades, pueblos y barrios grandes (capa places, z12), macizos y valles
    (pois, z13) y cimas con nombre y altitud (pois, z13). Solo los nombres que
    trae el mapa en los idiomas de la app; si falta uno, la app usa `name`."""
    from pmtiles_ligero import PMTiles, decodificar, tesela_de
    p = PMTiles(ruta)
    mundo = 2 * math.pi * R

    def lonlat(z, tx, ty, ext, x, y):
        X = -math.pi * R + (tx + x / ext) * mundo / (1 << z)
        Y = math.pi * R - (ty + y / ext) * mundo / (1 << z)
        return round(lon_de(X), 5), round(lat_de(Y), 5)

    def nombres(props):
        n = {k: props[k] for k in IDIOMAS_OSM if isinstance(props.get(k), str) and props.get(k)}
        base = n.get('name')
        return {k: v for k, v in n.items() if k == 'name' or v != base}

    def recorrer(z, capa):
        x0, y1 = tesela_de(LON_O, LAT_S, z)
        x1, y0 = tesela_de(LON_E, LAT_N, z)
        for tx in range(int(x0), int(x1) + 1):
            for ty in range(int(y0), int(y1) + 1):
                c = decodificar(p.tesela(z, tx, ty))
                if capa not in c:
                    continue
                ext, feats = c[capa]
                for tipo, props, partes in feats:
                    if tipo == 1 and partes and 0 <= partes[0][0][0] < ext and 0 <= partes[0][0][1] < ext:
                        yield (lonlat(z, tx, ty, ext, partes[0][0][0], partes[0][0][1]), props)

    lugares, zonas, cimas, vistos = [], [], [], set()
    for (lo, la), pr in recorrer(12, 'places'):
        kd = pr.get('kind_detail')
        if pr.get('kind') != 'locality' or kd not in ('city', 'town', 'village') or not pr.get('name'):
            continue
        k = ('l', pr['name'], round(lo, 3), round(la, 3))
        if k in vistos:
            continue
        vistos.add(k)
        lugares.append([lo, la, kd, int(pr.get('population_rank') or 0), nombres(pr)])
    for (lo, la), pr in recorrer(13, 'pois'):
        kind, nom = pr.get('kind'), pr.get('name')
        if not nom:
            continue
        if kind in ('massif', 'mountain_range', 'valley'):
            k = ('z', nom)
            if k not in vistos:
                vistos.add(k)
                zonas.append([lo, la, kind, nombres(pr)])
        elif kind == 'peak' and isinstance(pr.get('elevation'), (int, float)) and pr['elevation'] > 0:
            k = ('c', nom, round(lo, 3), round(la, 3))
            if k not in vistos:
                vistos.add(k)
                cimas.append([lo, la, int(round(pr['elevation'])), nombres(pr)])
    p.cerrar()
    lugares.sort(key=lambda r: (-r[3], r[4].get('name', '')))
    cimas.sort(key=lambda r: -r[2])
    return dict(fuente='OpenStreetMap: capas places y pois de mapa/tenerife-osm.pmtiles',
                lugares=[r for r in lugares if LON_O <= r[0] <= LON_E and LAT_S <= r[1] <= LAT_N],
                zonas=[r for r in zonas if LON_O <= r[0] <= LON_E and LAT_S <= r[1] <= LAT_N],
                cimas=[r for r in cimas if LON_O <= r[0] <= LON_E and LAT_S <= r[1] <= LAT_N])


def distancia_costa(tierra_hi, M, ss=SS):
    """Distancia con signo a la costa en el centro de cada celda (m): > 0 tierra."""
    import numpy as np
    from scipy import ndimage
    celda = M['paso'] * M['k'] / ss          # metros de suelo
    dt = ndimage.distance_transform_edt(tierra_hi)
    dm = ndimage.distance_transform_edt(~tierra_hi)
    sdf = np.where(tierra_hi, dt - 0.5, -(dm - 0.5)) * celda
    a, b = M['alto'], M['ancho']
    return sdf.reshape(a, ss, b, ss).mean(axis=(1, 3)), tierra_hi.reshape(a, ss, b, ss).mean(axis=(1, 3))


def cielo_visible(h, celda_m, direcciones=16, radios=(1, 2, 3, 4, 6, 8, 11, 16, 23, 32, 45, 64)):
    """Fraccion de cielo visible (sky-view factor) por celda, 0..1."""
    import numpy as np
    alto, ancho = h.shape
    pad = max(radios) + 1
    hp = np.pad(h, pad, mode='edge')
    svf = np.zeros_like(h, dtype=np.float64)
    for d in range(direcciones):
        th = 2 * math.pi * d / direcciones
        mx = np.zeros_like(h, dtype=np.float64)
        for r in radios:
            dx = int(round(r * math.sin(th)))
            dy = int(round(-r * math.cos(th)))
            if dx == 0 and dy == 0:
                continue
            dist = math.hypot(dx, dy) * celda_m
            vecino = hp[pad + dy:pad + dy + alto, pad + dx:pad + dx + ancho]
            np.maximum(mx, (vecino - h) / dist, out=mx)
        svf += 1.0 - np.sin(np.arctan(mx))
    return svf / direcciones


def sha256(ruta):
    h = hashlib.sha256()
    with open(ruta, 'rb') as f:
        for trozo in iter(lambda: f.read(1 << 20), b''):
            h.update(trozo)
    return h.hexdigest()


def huella_esperada():
    """La que tiene que decir sw.js con el relieve que hay en mapa/."""
    return sha256(META)[:16] if os.path.exists(META) else 'ninguno'


def huellas():
    """{fichero: [lo que dice cada linea de huella que tiene]}"""
    out = {}
    for ruta, rx, _ in HUELLAS:
        with open(ruta, encoding='utf-8') as f:
            out[os.path.relpath(ruta, RAIZ)] = rx.findall(f.read())
    return out


def escribir_huella(h):
    for ruta, rx, linea in HUELLAS:
        with open(ruta, encoding='utf-8', newline='') as f:
            txt = f.read()
        nuevo, n = rx.subn(lambda m: linea % h, txt)
        if n != 1:
            raise SystemExit('  FALLA  %s tiene que llevar una linea de huella, y solo una (lleva %d)'
                             % (os.path.relpath(ruta, RAIZ), n))
        if nuevo != txt:
            with open(ruta, 'w', encoding='utf-8', newline='') as f:
                f.write(nuevo)


def controles(dm, b, ao):
    """Sumas y muestras con las que la app y --comprobar cotejan el PNG leido."""
    import numpy as np
    alto, ancho = dm.shape
    muestras = []
    rng = np.random.RandomState(20261031)
    i_max = int(np.argmax(dm))
    puntos = [(i_max % ancho, i_max // ancho)]
    puntos += [(int(rng.randint(0, ancho)), int(rng.randint(0, alto))) for _ in range(23)]
    for i, j in puntos:
        muestras.append([i, j, int(dm[j, i]), int(b[j, i]), int(ao[j, i])])
    return dict(suma_dm=int(dm.astype(np.uint64).sum() % (1 << 32)),
                suma_costa=int(b.astype(np.uint64).sum() % (1 << 32)),
                suma_ao=int(ao.astype(np.uint64).sum() % (1 << 32)),
                muestras=muestras)


def construir(rutas):
    import numpy as np
    from PIL import Image
    M = malla()
    print('  malla: %d x %d celdas de %.0f m (Mercator, paso %.3f m)' % (M['ancho'], M['alto'], PASO_SUELO, M['paso']))
    H, fuentes = alturas_desde_dem(rutas, M)
    print('  modelo: %s' % ', '.join(f['fichero'] for f in fuentes))
    tierra_hi, nt = tierra_osm(M)
    print('  costa: %d teselas z%d de la capa earth' % (nt, Z_COSTA))
    sdf, frac = distancia_costa(tierra_hi, M)
    tierra = sdf >= 0
    faltan = tierra & np.isnan(H)
    relleno = None
    if faltan.any():
        # La punta de Rasca baja de 28° N (la costa del mapa llega a 27,998):
        # cae en la tesela N27 W017. Si esa tesela no existe, unas pocas celdas
        # de la orilla se quedan sin modelo. Esas, y solo si son pocas y estan
        # pegadas a celdas con modelo, toman la altura de la celda de tierra con
        # modelo mas cercana, y el .json lo apunta (relleno). Mas que eso es que
        # falta una tesela, y para.
        from scipy import ndimage
        con = tierra & ~np.isnan(H)
        dist, (ii, jj) = ndimage.distance_transform_edt(~con, return_indices=True)
        n = int(faltan.sum())
        lejos = float(dist[faltan].max()) * PASO_SUELO
        if n > RELLENO_MAX_CELDAS or lejos > RELLENO_MAX_M:
            raise SystemExit('  FALLA  %d celdas de tierra sin altura, la mas lejana a %.0f m de una con modelo: '
                             'el modelo no cubre la isla entera (falta una tesela)' % (n, lejos))
        H = np.where(faltan, H[ii, jj], H)
        fj, fi = np.nonzero(faltan)
        Xf = M['x0'] + (fi + 0.5) * M['paso']
        Yf = M['y0'] - (fj + 0.5) * M['paso']
        relleno = dict(celdas=n, distancia_max_m=int(round(lejos)),
                       caja=[round(float(lon_de(Xf.min())), 5), round(float(lat_de(Yf.min())), 5),
                             round(float(lon_de(Xf.max())), 5), round(float(lat_de(Yf.max())), 5)],
                       como='la altura de la celda de tierra con modelo mas cercana',
                       por_que='la costa del mapa llega donde no llega ninguna tesela del modelo')
        print('  OJO: %d celdas de tierra sin modelo (la mas lejana a %.0f m de una con modelo), en %s: '
              'llevan la altura de la celda con modelo mas cercana, y el .json lo apunta' % (n, lejos, relleno['caja']))
    h = np.where(tierra, np.maximum(np.nan_to_num(H, nan=0.0), ALTURA_M_UNIDAD), 0.0)
    dm = np.clip(np.round(h / ALTURA_M_UNIDAD), 0, 65535).astype(np.uint16)
    dm = np.where(tierra, np.maximum(dm, 1), 0).astype(np.uint16)
    b = np.clip(np.round(128 + sdf / COSTA_M_UNIDAD), 0, 255).astype(np.uint8)
    # la costa manda: donde hay altura, B >= 128, y donde no, B < 128
    b = np.where(dm > 0, np.maximum(b, 128), np.minimum(b, 127)).astype(np.uint8)
    svf = cielo_visible(dm.astype(np.float64) * ALTURA_M_UNIDAD, PASO_SUELO)
    ao = np.where(dm > 0, np.clip(np.round(svf * 255), 0, 255), 255).astype(np.uint8)
    rgb = np.dstack([(dm >> 8).astype(np.uint8), (dm & 255).astype(np.uint8), b])
    os.makedirs(MAPA, exist_ok=True)
    Image.fromarray(rgb, 'RGB').save(PNG, optimize=True)
    Image.fromarray(ao, 'L').save(PNG_AO, optimize=True)
    i_max = int(np.argmax(dm))
    jm, im_ = divmod(i_max, M['ancho'])
    Xm = M['x0'] + (im_ + 0.5) * M['paso']
    Ym = M['y0'] - (jm + 0.5) * M['paso']
    meta = dict(
        formato=1,
        fuente=dict(nombre='Copernicus DEM GLO-30', teselas=fuentes,
                    registro='https://registry.opendata.aws/copernicus-dem/',
                    licencia=LICENCIA, credito=NOTA_6B, responsabilidad=NOTA_6C),
        costa=dict(fuente='OpenStreetMap: capa earth de mapa/tenerife-osm.pmtiles (z%d)' % Z_COSTA,
                   metros_por_unidad=COSTA_M_UNIDAD, cero=128),
        malla=dict(x0=M['x0'], y0=M['y0'], paso=M['paso'], ancho=M['ancho'], alto=M['alto'],
                   lat_ref=LAT_REF, paso_suelo_m=PASO_SUELO, caja=[LON_O, LAT_S, LON_E, LAT_N]),
        altura=dict(metros_por_unidad=ALTURA_M_UNIDAD, max_m=round(int(dm.max()) * ALTURA_M_UNIDAD, 1),
                    max_celda=[im_, jm], max_lonlat=[round(lon_de(Xm), 5), round(lat_de(Ym), 5)],
                    celdas_tierra=int((dm > 0).sum())),
        ao=dict(que='fraccion de cielo visible (sky-view factor) x 255; el mar, 255',
                direcciones=16, radio_max_m=64 * PASO_SUELO),
        relleno=relleno,
        control=controles(dm, b, ao),
        rotulos=rotulos_osm(),
        ficheros={os.path.basename(PNG): dict(bytes=os.path.getsize(PNG), sha256=sha256(PNG)),
                  os.path.basename(PNG_AO): dict(bytes=os.path.getsize(PNG_AO), sha256=sha256(PNG_AO))})
    with open(META, 'w', encoding='utf-8') as f:
        json.dump(meta, f, ensure_ascii=False, indent=1)
        f.write('\n')
    escribir_huella(huella_esperada())
    print('  escrito: %s (%.0f kB), %s (%.0f kB), %s; y la huella en sw.js e index.html: %s' % (
        os.path.basename(PNG), os.path.getsize(PNG) / 1024, os.path.basename(PNG_AO),
        os.path.getsize(PNG_AO) / 1024, os.path.basename(META), huella_esperada()))
    print('  cota maxima: %.1f m en %.5f, %.5f' % (meta['altura']['max_m'], meta['altura']['max_lonlat'][1],
                                                  meta['altura']['max_lonlat'][0]))
    return 0


# ───────────────────────── --comprobar ─────────────────────────
def comprobar():
    fallos = []

    def mal(m):
        fallos.append(m)
        print('  FALLA  ' + m)

    def ok(m):
        print('  OK     ' + m)

    # la huella, en sw.js y en index.html, haya relieve o no
    he = huella_esperada()
    for fichero, hs in huellas().items():
        if len(hs) != 1:
            mal('%s tiene que llevar una linea de huella del relieve, y solo una (lleva %d)' % (fichero, len(hs)))
        elif hs[0] != he:
            mal('%s dice que la huella del relieve es «%s» y la de mapa/ es «%s»: la escribe '
                'python3 tools/relieve_construir.py al construir (y el workflow, en su commit)' % (fichero, hs[0], he))
        else:
            ok('%s lleva la huella del relieve: «%s»' % (fichero, he))
    hay = [os.path.exists(x) for x in (PNG, PNG_AO, META)]
    if not all(hay):
        if any(hay):
            mal('relieve a medias: faltan %s (van los tres juntos)' % ', '.join(
                os.path.relpath(x, RAIZ) for x, h in zip((PNG, PNG_AO, META), hay) if not h))
        else:
            print('  (no hay relieve en mapa/: «La isla en 3D» no se ofrece hasta que lo genere el workflow '
                  'generar-relieve.yml)')
        print('  %s' % ('RELIEVE EN VERDE (sin relieve todavia)' if not fallos else '%d fallo(s)' % len(fallos)))
        return 1 if fallos else 0
    import numpy as np
    from PIL import Image
    meta = json.load(open(META, encoding='utf-8'))
    fu = meta.get('fuente', {})
    if fu.get('credito') != NOTA_6B or fu.get('responsabilidad') != NOTA_6C or fu.get('licencia') != LICENCIA:
        mal('las notas de la licencia del .json no son las del articulo 6, palabra por palabra: hay que regenerar')
    else:
        ok('las dos notas de la licencia del Copernicus DEM (6(b) y 6(c)), palabra por palabra')
    rel = meta.get('relleno')
    if rel:
        if rel.get('celdas', 0) > RELLENO_MAX_CELDAS or rel.get('distancia_max_m', 0) > RELLENO_MAX_M:
            mal('relleno de %s celdas a %s m: mas de lo que se permite' % (rel.get('celdas'), rel.get('distancia_max_m')))
        else:
            ok('%d celdas de la orilla sin modelo, rellenas con la celda con modelo mas cercana (a %d m como mucho), '
               'en %s, y apuntado' % (rel['celdas'], rel['distancia_max_m'], rel.get('caja')))
    else:
        ok('todas las celdas de tierra tienen altura del modelo: sin relleno')
    M = malla()
    m = meta['malla']
    if (m['ancho'], m['alto']) != (M['ancho'], M['alto']) or abs(m['paso'] - M['paso']) > 1e-6 \
            or abs(m['x0'] - M['x0']) > 1e-3 or abs(m['y0'] - M['y0']) > 1e-3:
        mal('la malla del .json no es la de esta herramienta: hay que regenerar')
    else:
        ok('malla %d x %d, %.0f m por celda, la misma que la herramienta' % (M['ancho'], M['alto'], PASO_SUELO))
    for nombre, info in meta['ficheros'].items():
        ruta = os.path.join(MAPA, nombre)
        if sha256(ruta) != info['sha256'] or os.path.getsize(ruta) != info['bytes']:
            mal('%s no es el que describe el .json (sha256 o tamano)' % nombre)
        else:
            ok('%s: %d bytes, sha256 del .json' % (nombre, info['bytes']))
    im = Image.open(PNG)
    ia = Image.open(PNG_AO)
    if im.mode != 'RGB' or ia.mode != 'L':
        mal('modos de color: %s y %s (se esperaba RGB y L)' % (im.mode, ia.mode))
    # sin perfiles de color: un navegador los aplicaria y tocaria los valores
    for img, nombre in ((im, 'relieve'), (ia, 'ao')):
        sobra = [k for k in ('gamma', 'icc_profile', 'srgb', 'chromaticity') if k in img.info]
        if sobra:
            mal('el PNG del %s lleva %s: el navegador cambiaria los valores' % (nombre, ', '.join(sobra)))
    a = np.array(im)
    ao = np.array(ia)
    if a.shape[:2] != (M['alto'], M['ancho']) or ao.shape != (M['alto'], M['ancho']):
        mal('tamanos: %s y %s' % (a.shape, ao.shape))
        return 1
    dm = a[:, :, 0].astype(np.uint32) * 256 + a[:, :, 1]
    b = a[:, :, 2]
    c = controles(dm, b, ao)
    if any(c[k] != meta['control'][k] for k in ('suma_dm', 'suma_costa', 'suma_ao')) \
            or c['muestras'] != meta['control']['muestras']:
        mal('las sumas o las muestras no coinciden con el .json')
    else:
        ok('sumas y %d muestras, las del .json' % len(c['muestras']))
    tierra = dm > 0
    if np.any(tierra & (b < 128)) or np.any(~tierra & (b >= 128)):
        mal('la altura y la costa se contradicen en %d celdas' % int(np.sum(tierra != (b >= 128))))
    else:
        ok('altura y costa de acuerdo en las %d celdas' % dm.size)
    km2 = tierra.sum() * PASO_SUELO * PASO_SUELO / 1e6
    if abs(km2 - SUPERFICIE_KM2) / SUPERFICIE_KM2 > 0.03:
        mal('tierra: %.0f km2, lejos de los %.2f de Tenerife' % (km2, SUPERFICIE_KM2))
    else:
        ok('tierra: %.0f km2 (Tenerife: %.2f km2)' % (km2, SUPERFICIE_KM2))
    borde = np.concatenate([dm[0, :], dm[-1, :], dm[:, 0], dm[:, -1]])
    if borde.max() != 0:
        mal('hay tierra en el borde de la malla: la caja no envuelve la isla')
    else:
        ok('el borde de la malla es mar')
    hmax = dm.max() * ALTURA_M_UNIDAD
    jm, im_ = divmod(int(np.argmax(dm)), M['ancho'])
    Xm = M['x0'] + (im_ + 0.5) * M['paso']
    Ym = M['y0'] - (jm + 0.5) * M['paso']
    la, lo = lat_de(Ym), lon_de(Xm)
    dist = math.hypot(math.radians(lo - TEIDE[1]) * R * math.cos(math.radians(la)),
                      math.radians(la - TEIDE[0]) * R)
    if not (3600 <= hmax <= 3760):
        mal('cota maxima %.1f m: el Teide tiene 3.715 m' % hmax)
    elif dist > 400:
        mal('la celda mas alta (%.1f m) cae a %.0f m de la cumbre del Teide' % (hmax, dist))
    else:
        ok('cota maxima %.1f m, a %.0f m de la cumbre del Teide de la ficha (3.715 m oficiales; '
           'la celda es la media de 60 x 60 m)' % (hmax, dist))
    vals = ao[tierra]
    if vals.size and (vals.min() < 40 or vals.max() > 255):
        mal('cielo visible fuera de rango: %d..%d' % (vals.min(), vals.max()))
    elif np.any(ao[~tierra] != 255):
        mal('el mar debe ir a 255 en el PNG del cielo visible')
    else:
        ok('cielo visible: %d..%d en tierra, 255 en el mar' % (vals.min(), vals.max()))
    print('  %s' % ('RELIEVE EN VERDE' if not fallos else '%d fallo(s)' % len(fallos)))
    return 1 if fallos else 0


if __name__ == '__main__':
    if len(sys.argv) >= 2 and sys.argv[1] == '--comprobar':
        sys.exit(comprobar())
    if len(sys.argv) < 2 or sys.argv[1].startswith('-'):
        print(__doc__)
        sys.exit(2)
    sys.exit(construir(sys.argv[1:]))
