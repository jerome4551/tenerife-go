#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
relieve_ign.py — baja el MDT05 del IGN para el relieve de «La isla en 3D»
(31 de octubre de 2026, por la tarde).

    python3 tools/relieve_ign.py CARPETA [--servicio URL] [--trozo GRADOS] [--factor N]

Escribe en CARPETA:
  ign-mdt05-tenerife.tif   la isla en la malla del propio MDT05 (en grados), con
                           la media de cada bloque de N x N pixeles (N=3 por
                           defecto: unos 14 m): Float32, sin dato = -9999,
                           PixelIsArea. Lo lee tools/relieve_construir.py como
                           cualquier GeoTIFF en grados y lo pasa a las celdas
                           de 60 m del relieve, con la costa del mapa.
  ign-mdt05-tenerife.json  de donde sale: el servicio, la coleccion, la malla de
                           origen, cada peticion (caja, bytes, sha256) y la hora.
                           relieve_construir.py --registro lo resume en el
                           .json del relieve.

POR QUE
  Jerome, 31 de octubre de 2026: «Fuentes 3D la mejor pero gratis». De las
  fuentes oficiales que se miraron ese dia (claude/FUENTES-3D.md, en el
  proyecto), la mejor gratis para Tenerife es el MDT05 del Instituto
  Geografico Nacional: un modelo del TERRENO (sin arboles ni edificios, que el
  Copernicus DEM de antes si lleva, porque es de superficie) con una altura
  cada 5 m, sacado de los vuelos LiDAR del PNOA (1.a cobertura), con una
  exactitud vertical de 50 cm segun su metadato. Licencia CC BY 4.0, uso
  comercial incluido, y sin cuenta.

EL SERVICIO
  La OGC API Coverages de la IDEE (https://api-coverages.idee.es), coleccion
  EL.ElevationGridCoverage_4258_5_C («MDT Islas Canarias EPSG:4258 5»: el
  MDT05 de Canarias en grados). Cada peticion es una caja:
      /collections/<coleccion>/coverage?subset=Lat(s:n),Long(o:e)&f=COG
  (la forma de los ejemplos del blog de la IDEE) y devuelve un GeoTIFF en el
  sistema de la coleccion. Su descripcion dice «El tamano maximo de descarga
  esta limitado», sin cifra: se pide la isla a trozos (0,04 grados, unos
  900 x 900 pixeles) y, si un trozo no sale, en cuatro mas pequenos. Solo los
  trozos con tierra segun la costa del mapa (la capa earth de
  mapa/tenerife-osm.pmtiles, la misma del relieve). Uno detras de otro, con
  reintentos y esperas si el servidor no da abasto.

LA LICENCIA
  CC BY 4.0. El IGN pide, para una obra derivada, «Obra derivada de
  <producto> <fecha> CC-BY 4.0 <productor>», visible al pie del mapa, y la
  misma atribucion en los metadatos de lo que se haga con el dato. El
  metadato del MDT05 da «MDT05-cob1 2008-2015 CC-BY 4.0 scne.es». El credito
  completo esta en relieve_construir.py (FUENTES) y en modulos/isla3d.js, y
  lo coteja tools/auditar_isla3d.js.

SIN RED AQUI
  El contenedor donde se escribio no llega a la IDEE (el proxy lo para): lo
  usa el workflow generar-relieve.yml, que tiene red. Aqui se probo de punta a
  punta contra un servidor de prueba con --servicio. Si en el runner algo no
  sale (el servicio no contesta, devuelve otra cosa, o falta tierra), sale con
  un estado distinto de 0 y el workflow hace el relieve con Copernicus.
"""
import argparse
import datetime
import hashlib
import http.client
import io
import json
import math
import os
import sys
import time
import urllib.error
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import relieve_construir as rc

SERVICIO = 'https://api-coverages.idee.es'
COLECCION = 'EL.ElevationGridCoverage_4258_5_C'
NOMBRE = 'ign-mdt05-tenerife'
NODATA = -9999.0
AGENTE = 'TenerifeGo-relieve/1.0 (+https://tenerifego.app; tools/relieve_ign.py)'
# La caja de la isla, con margen: la del relieve.
LON_O, LON_E, LAT_S, LAT_N = rc.LON_O, rc.LON_E, rc.LAT_S, rc.LAT_N
# Paso esperado de la coleccion de 5 m en grados (su domainset: «about 4.505e-05»).
PASO_ESPERADO = 4.505e-05
MARGEN_PX = 2               # pixeles de mas por cada lado de cada peticion
COBERTURA_MIN = 0.995       # la parte de las celdas de tierra que tiene que tener dato


def utc():
    return datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')


# ───────────────────────── la peticion ─────────────────────────
class Vacio(Exception):
    """El servicio dice que en esa caja no hay nada (204, 404)."""


class Rechazo(Exception):
    """El servicio no quiere esa caja (demasiado grande, mal formada...): se parte."""


def pedir(url, intentos=5, espera=(3, 10, 30, 60)):
    """Los bytes de la respuesta. Reintenta lo que es pasajero (sin red, respuesta cortada,
    429, 502, 503, 504)."""
    ultimo = None
    for k in range(intentos):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': AGENTE, 'Accept': 'image/tiff, application/octet-stream, */*'})
            with urllib.request.urlopen(req, timeout=180) as r:
                datos = r.read()
                if r.status == 204 or not datos:
                    raise Vacio('HTTP %d sin cuerpo' % r.status)
                tipo = r.headers.get('Content-Type', '')
                if 'json' in tipo or 'html' in tipo or datos[:1] in (b'{', b'<'):
                    raise Rechazo('el servicio contesta %s y no un GeoTIFF: %s' % (tipo or '?', datos[:200].decode('utf-8', 'replace')))
                return datos
        except urllib.error.HTTPError as e:
            cuerpo = ''
            try:
                cuerpo = e.read()[:300].decode('utf-8', 'replace')
            except Exception:
                pass
            if e.code in (204, 404):
                raise Vacio('HTTP %d' % e.code)
            if e.code in (429, 502, 503, 504):
                ultimo = 'HTTP %d %s' % (e.code, cuerpo)
            else:
                raise Rechazo('HTTP %d %s' % (e.code, cuerpo))
        except (urllib.error.URLError, http.client.HTTPException, TimeoutError, ConnectionError, OSError) as e:
            # HTTPException: una respuesta cortada a medias (IncompleteRead), tambien pasajero
            ultimo = '%s: %s' % (type(e).__name__, e)
        if k < intentos - 1:
            t = espera[min(k, len(espera) - 1)]
            print('      (pasajero: %s; otra vez en %d s)' % (ultimo, t), flush=True)
            time.sleep(t)
    raise Rechazo('sin respuesta tras %d intentos: %s' % (intentos, ultimo))


def leer_tiff(datos):
    """(alturas float32 [fila, col], lon del borde izquierdo, lat del borde de arriba,
    paso en lon, paso en lat, sin dato, epsg). Con rasterio si esta (lee cualquier
    compresion); si no, con Pillow, como relieve_construir.leer_geotiff."""
    import numpy as np
    try:
        from rasterio.io import MemoryFile
    except ImportError:
        MemoryFile = None
    if MemoryFile is not None:
        with MemoryFile(datos) as mf, mf.open() as ds:
            t = ds.transform
            if abs(t.b) > 1e-12 or abs(t.d) > 1e-12:
                raise Rechazo('malla girada')
            epsg = ds.crs.to_epsg() if ds.crs else None
            a = ds.read(1).astype(np.float32)
            return a, float(t.c), float(t.f), float(t.a), float(-t.e), ds.nodata, epsg
    from PIL import Image
    Image.MAX_IMAGE_PIXELS = None
    im = Image.open(io.BytesIO(datos))
    tg = im.tag_v2
    escala, punto, claves = tg.get(33550), tg.get(33922), tg.get(34735)
    if not escala or not punto:
        raise Rechazo('el GeoTIFF no lleva georreferencia (ModelPixelScale / ModelTiepoint)')
    sx, sy = float(escala[0]), float(escala[1])
    ti, tj, _, tx, ty, _ = [float(v) for v in punto[:6]]
    tipo, epsg = 1, None
    if claves:
        c = list(claves)
        for k in range(4, len(c) - 3, 4):
            if c[k] == 1025:
                tipo = c[k + 3]
            elif c[k] in (2048, 3072):
                epsg = c[k + 3]
    # el borde del pixel 0: con PixelIsPoint el punto de enganche es su centro
    medio = 0.5 if tipo == 2 else 0.0
    lon_izq = tx - (ti + medio) * sx
    lat_arr = ty + (tj + medio) * sy
    nodata = None
    if 42113 in tg:
        try:
            nodata = float(str(tg.get(42113)).strip('\x00 '))
        except ValueError:
            nodata = None
    a = np.array(im, dtype=np.float32)
    if a.ndim != 2:
        raise Rechazo('se esperaba una banda')
    return a, lon_izq, lat_arr, sx, sy, nodata, epsg


def url_caja(servicio, coleccion, o, s, e, n):
    return '%s/collections/%s/coverage?subset=Lat(%.9f:%.9f),Long(%.9f:%.9f)&f=COG' % (
        servicio.rstrip('/'), coleccion, s, n, o, e)


# ───────────────────────── la isla, a trozos ─────────────────────────
def mascara_tierra():
    """La tierra del relieve (celdas de 60 m de la malla de Mercator) y la misma,
    un poco ensanchada: solo se piden los trozos que tocan esta."""
    from scipy import ndimage
    M = rc.malla()
    tierra, _ = rc.tierra_osm(M, ss=1)
    return M, tierra, ndimage.binary_dilation(tierra, iterations=3)


def hay_tierra(M, ancha, o, s, e, n):
    """¿La caja (en grados) toca alguna celda de tierra?"""
    i0 = max(0, int(math.floor((rc.merc_x(o) - M['x0']) / M['paso'])))
    i1 = min(M['ancho'], int(math.ceil((rc.merc_x(e) - M['x0']) / M['paso'])))
    j0 = max(0, int(math.floor((M['y0'] - rc.merc_y(n)) / M['paso'])))
    j1 = min(M['alto'], int(math.ceil((M['y0'] - rc.merc_y(s)) / M['paso'])))
    return i1 > i0 and j1 > j0 and bool(ancha[j0:j1, i0:i1].any())


def main():
    import numpy as np
    from PIL import Image, TiffImagePlugin, TiffTags
    ap = argparse.ArgumentParser(description='Baja el MDT05 del IGN de Tenerife (ver la cabecera).')
    ap.add_argument('carpeta')
    ap.add_argument('--servicio', default=SERVICIO)
    ap.add_argument('--coleccion', default=COLECCION)
    ap.add_argument('--trozo', type=float, default=0.04, help='lado de cada peticion, en grados')
    ap.add_argument('--factor', type=int, default=3, help='pixeles del MDT05 por lado de cada bloque del mosaico')
    ap.add_argument('--max-peticiones', type=int, default=2000)
    args = ap.parse_args()
    F = args.factor
    os.makedirs(args.carpeta, exist_ok=True)
    t0 = time.time()
    print('El MDT05 del IGN, de %s (coleccion %s)' % (args.servicio, args.coleccion), flush=True)

    # 1. una peticion pequena en el centro de la isla: la malla de la coleccion
    cx, cy = -16.60, 28.30
    url = url_caja(args.servicio, args.coleccion, cx, cy, cx + 0.005, cy + 0.005)
    datos = pedir(url)
    a, L, T, dx, dy, nodata, epsg = leer_tiff(datos)
    print('  la malla: paso %.9f x %.9f grados, sin dato %s, EPSG %s (%d x %d pixeles de prueba)' % (
        dx, dy, nodata, epsg, a.shape[1], a.shape[0]), flush=True)
    if epsg not in (None, 4258, 4326, 4081):
        raise SystemExit('  PARA: la coleccion viene en EPSG %s y aqui se espera una en grados (4258)' % epsg)
    if abs(dx - PASO_ESPERADO) / PASO_ESPERADO > 0.05 or abs(dy - PASO_ESPERADO) / PASO_ESPERADO > 0.05:
        raise SystemExit('  PARA: paso de %.3g x %.3g grados; el del MDT05 es %.4g' % (dx, dy, PASO_ESPERADO))
    validos = a[np.isfinite(a) & (a > -1000) & ((a != nodata) if nodata is not None else True)]
    if validos.size == 0 or not (100 < float(np.median(validos)) < 3800):
        raise SystemExit('  PARA: la prueba del centro de la isla no trae alturas creibles (mediana %s)'
                         % (float(np.median(validos)) if validos.size else 'sin datos'))
    REF_LON, REF_LAT = L, T

    # 2. el mosaico, en bloques de F x F pixeles alineados con la malla de la coleccion
    def col(lon):
        return (lon - REF_LON) / dx

    def fil(lat):
        return (REF_LAT - lat) / dy
    C0 = int(math.floor(col(LON_O) / F)) * F
    C1 = int(math.ceil(col(LON_E) / F)) * F
    R0 = int(math.floor(fil(LAT_N) / F)) * F
    R1 = int(math.ceil(fil(LAT_S) / F)) * F
    NB_C, NB_R = (C1 - C0) // F, (R1 - R0) // F
    suma = np.zeros((NB_R, NB_C), dtype=np.float64)
    cuenta = np.zeros((NB_R, NB_C), dtype=np.uint16)
    print('  el mosaico: %d x %d bloques de %d x %d pixeles (%.1f m)' % (
        NB_C, NB_R, F, F, F * dx * 111320 * math.cos(math.radians(rc.LAT_REF))), flush=True)

    M, tierra, ancha = mascara_tierra()
    K = max(8, int(round(args.trozo / dx / F)))     # bloques por lado de cada trozo
    pendientes = []
    for br in range(0, NB_R, K):
        for bc in range(0, NB_C, K):
            pendientes.append((br, min(br + K, NB_R), bc, min(bc + K, NB_C)))

    def caja(t):
        br0, br1, bc0, bc1 = t
        o = REF_LON + (C0 + bc0 * F) * dx
        e = REF_LON + (C0 + bc1 * F) * dx
        n = REF_LAT - (R0 + br0 * F) * dy
        s = REF_LAT - (R0 + br1 * F) * dy
        return o, s, e, n

    def sumar(t, a, L, T, sx, sy, nodata):
        if abs(sx - dx) / dx > 1e-6 or abs(sy - dy) / dy > 1e-6:
            raise Rechazo('un trozo con otro paso (%.9g x %.9g)' % (sx, sy))
        gc, gr = (L - REF_LON) / dx, (REF_LAT - T) / dy
        if abs(gc - round(gc)) > 0.02 or abs(gr - round(gr)) > 0.02:
            raise Rechazo('un trozo fuera de la malla (%.3f, %.3f pixeles)' % (gc, gr))
        gc, gr = int(round(gc)), int(round(gr))
        br0, br1, bc0, bc1 = t
        # el nucleo del trozo, en pixeles de la malla; de la respuesta solo cuenta esto
        r0, r1 = R0 + br0 * F, R0 + br1 * F
        c0, c1 = C0 + bc0 * F, C0 + bc1 * F
        rr0, rr1 = max(gr, r0), min(gr + a.shape[0], r1)
        cc0, cc1 = max(gc, c0), min(gc + a.shape[1], c1)
        if rr1 <= rr0 or cc1 <= cc0:
            return 0
        sub = a[rr0 - gr:rr1 - gr, cc0 - gc:cc1 - gc]
        ok = np.isfinite(sub) & (sub > -1000) & (sub < 9000)
        if nodata is not None:
            ok &= sub != np.float32(nodata)
        v = np.where(ok, sub, 0.0).astype(np.float64)
        filas = (np.arange(rr0, rr1) - R0) // F
        cols = (np.arange(cc0, cc1) - C0) // F
        if (rr0 - R0) % F == 0 and (rr1 - R0) % F == 0 and (cc0 - C0) % F == 0 and (cc1 - C0) % F == 0:
            nr, nc = (rr1 - rr0) // F, (cc1 - cc0) // F
            suma[filas[0]:filas[0] + nr, cols[0]:cols[0] + nc] += v.reshape(nr, F, nc, F).sum(axis=(1, 3))
            cuenta[filas[0]:filas[0] + nr, cols[0]:cols[0] + nc] += ok.reshape(nr, F, nc, F).sum(axis=(1, 3)).astype(np.uint16)
        else:
            FF, CC = np.meshgrid(filas, cols, indexing='ij')
            np.add.at(suma, (FF, CC), v)
            np.add.at(cuenta, (FF, CC), ok.astype(np.uint16))
        return int(ok.sum())

    registro = []
    hechos = vacios = saltados = partidos = 0
    total_bytes = 0
    while pendientes:
        t = pendientes.pop(0)
        o, s, e, n = caja(t)
        if not hay_tierra(M, ancha, o, s, e, n):
            saltados += 1
            continue
        if hechos + vacios >= args.max_peticiones:
            raise SystemExit('  PARA: mas de %d peticiones' % args.max_peticiones)
        url = url_caja(args.servicio, args.coleccion, o - MARGEN_PX * dx, s - MARGEN_PX * dy,
                       e + MARGEN_PX * dx, n + MARGEN_PX * dy)
        try:
            datos = pedir(url)
            a, L, T, sx, sy, nd, _ = leer_tiff(datos)
            px = sumar(t, a, L, T, sx, sy, nd)
            hechos += 1
            total_bytes += len(datos)
            registro.append(dict(caja=[round(o, 7), round(s, 7), round(e, 7), round(n, 7)], bytes=len(datos),
                                 sha256=hashlib.sha256(datos).hexdigest(), pixeles=[int(a.shape[1]), int(a.shape[0])],
                                 con_dato=px))
            print('    %4d  %.3f %.3f %.3f %.3f  %7d bytes  %d pixeles con dato' % (
                hechos, o, s, e, n, len(datos), px), flush=True)
        except Vacio as err:
            vacios += 1
            registro.append(dict(caja=[round(o, 7), round(s, 7), round(e, 7), round(n, 7)], vacio=str(err)))
            print('    ----  %.3f %.3f %.3f %.3f  sin datos (%s)' % (o, s, e, n, err), flush=True)
        except Rechazo as err:
            br0, br1, bc0, bc1 = t
            if br1 - br0 <= 8 and bc1 - bc0 <= 8:
                raise SystemExit('  PARA: un trozo de %d x %d bloques no sale: %s' % (bc1 - bc0, br1 - br0, err))
            mr, mc = (br0 + br1) // 2, (bc0 + bc1) // 2
            partes = [(br0, mr, bc0, mc), (br0, mr, mc, bc1), (mr, br1, bc0, mc), (mr, br1, mc, bc1)]
            partes = [p for p in partes if p[1] > p[0] and p[3] > p[2]]
            pendientes = partes + pendientes
            partidos += 1
            print('    ....  %.3f %.3f %.3f %.3f  no sale (%s): en %d trozos' % (o, s, e, n, str(err)[:120], len(partes)), flush=True)

    # 3. la media de cada bloque (con al menos la mitad de sus pixeles con dato)
    lleno = cuenta >= (F * F + 1) // 2
    media = np.where(lleno, suma / np.maximum(cuenta, 1), NODATA).astype(np.float32)
    print('  %d peticiones (%.0f MB), %d sin datos, %d trozos partidos, %d sin tierra; %.0f s' % (
        hechos, total_bytes / 1e6, vacios, partidos, saltados, time.time() - t0), flush=True)

    # 4. ¿toda la tierra tiene dato? (las celdas de 60 m del relieve, en su centro)
    jj, ii = np.nonzero(tierra)
    lon = np.degrees((M['x0'] + (ii + 0.5) * M['paso']) / rc.R)
    lat = np.degrees(2 * np.arctan(np.exp((M['y0'] - (jj + 0.5) * M['paso']) / rc.R)) - np.pi / 2)
    bc = np.floor((lon - REF_LON) / dx - C0).astype(int) // F
    br = np.floor((REF_LAT - lat) / dy - R0).astype(int) // F
    dentro = (bc >= 0) & (bc < NB_C) & (br >= 0) & (br < NB_R)
    con = np.zeros(len(ii), dtype=bool)
    con[dentro] = lleno[br[dentro], bc[dentro]]
    cobertura = float(con.mean()) if len(con) else 0.0
    alturas = media[br[dentro & con], bc[dentro & con]]
    print('  tierra con dato: %.3f %% de %d celdas de 60 m; alturas %.1f a %.1f m' % (
        100 * cobertura, len(con), float(alturas.min()) if alturas.size else 0, float(alturas.max()) if alturas.size else 0), flush=True)

    # 5. el mosaico, como GeoTIFF en grados (lo lee relieve_construir.leer_geotiff)
    tif = os.path.join(args.carpeta, NOMBRE + '.tif')
    info = TiffImagePlugin.ImageFileDirectory_v2()
    info[33550] = (F * dx, F * dy, 0.0)
    info.tagtype[33550] = TiffTags.DOUBLE
    info[33922] = (0.0, 0.0, 0.0, REF_LON + C0 * dx, REF_LAT - R0 * dy, 0.0)
    info.tagtype[33922] = TiffTags.DOUBLE
    # GeoKeyDirectory: modelo geografico (1024=2), PixelIsArea (1025=1), ETRS89 (2048=4258)
    info[34735] = (1, 1, 0, 3, 1024, 0, 1, 2, 1025, 0, 1, 1, 2048, 0, 1, 4258)
    info.tagtype[34735] = TiffTags.SHORT
    info[42113] = '%g' % NODATA
    info.tagtype[42113] = TiffTags.ASCII
    Image.fromarray(media, 'F').save(tif, tiffinfo=info, compression='tiff_deflate')
    # se vuelve a leer como lo leera relieve_construir: tiene que salir lo mismo
    b, lon0, lat0, sx, sy, nd = rc.leer_geotiff(tif)
    if b.shape != media.shape or not np.array_equal(b, media) or abs(lon0 - (REF_LON + (C0 + F / 2) * dx)) > 1e-9 \
            or abs(lat0 - (REF_LAT - (R0 + F / 2) * dy)) > 1e-9 or nd != NODATA:
        raise SystemExit('  PARA: el GeoTIFF escrito no se lee igual')
    h = hashlib.sha256(open(tif, 'rb').read()).hexdigest()
    reg = dict(
        fuente='Modelo Digital del Terreno con paso de malla de 5 metros (MDT05) de España',
        servicio=args.servicio, coleccion=args.coleccion,
        peticion=url_caja(args.servicio, args.coleccion, 0, 0, 0, 0).split('?')[0] + '?subset=Lat(s:n),Long(o:e)&f=COG',
        fecha=utc(), malla_origen=dict(lon_izquierda=REF_LON, lat_arriba=REF_LAT, paso_lon=dx, paso_lat=dy, epsg=epsg,
                                       sin_dato=nodata),
        factor=F, mosaico=dict(fichero=os.path.basename(tif), sha256=h, pixeles=[NB_C, NB_R],
                               caja=[REF_LON + C0 * dx, REF_LAT - R1 * dy, REF_LON + C1 * dx, REF_LAT - R0 * dy]),
        peticiones=hechos, sin_datos=vacios, partidos=partidos, bytes=total_bytes,
        cobertura_tierra=round(cobertura, 5), herramienta='tools/relieve_ign.py', registro=registro)
    with open(os.path.join(args.carpeta, NOMBRE + '.json'), 'w', encoding='utf-8') as f:
        json.dump(reg, f, ensure_ascii=False, indent=1)
        f.write('\n')
    print('  escrito: %s (%.0f MB) y %s.json' % (tif, os.path.getsize(tif) / 1e6, NOMBRE), flush=True)
    if cobertura < COBERTURA_MIN:
        print('  PARA: solo el %.2f %% de la tierra tiene dato (hace falta el %.1f %%)' % (100 * cobertura, 100 * COBERTURA_MIN))
        return 3
    print('  MDT05 EN VERDE')
    return 0


if __name__ == '__main__':
    sys.exit(main())
