#!/usr/bin/env python3
"""
mapa_base.py — construye el mapa base que viaja DENTRO de la app.

    python3 tools/mapa_base.py

Escribe mapa/tenerife-base.pmtiles.

POR QUE EXISTE
  La app se abrio en un avion y salio el mapa en blanco. Guardar las teselas
  que el usuario ya ha mirado -lo que hace ahora el service worker- arregla
  ese caso, pero no el de alguien que instala la app y se va al monte. Para
  eso el mapa tiene que venir dentro.

DE DONDE SALEN LOS DATOS
  De la propia app. No se descarga nada y no se inventa nada:

    tierra     tools/datos/costa_tenerife.json — el poligono de la isla,
               GSHHG a resolucion full, 1.542 vertices.
    carretera  los `via` de las 183 lineas de TITSA_LINES — 26.593 vertices
               de trazado real sacados de shapes.txt del GTFS. Se unen y se
               deduplican: 183 lineas comparten calzada, y lo que queda es la
               red viaria, no las rutas de guagua.
    sitio      los nucleos y ciudades de places[] — coordenadas reales de la
               propia app, no centroides ni geocodificacion.

  Lo que NO lleva: senderos y curvas de nivel, que no estan en ningun dato
  que tengamos. Para eso hace falta un .pmtiles de OSM, que es el bloque 4 y
  es opcional. Este de aqui es el suelo: costa, carreteras y nombres, siempre
  presente y sin que nadie tenga que descargar nada.

ZOOM
  z6 a z13. De z14 para arriba el renderizador reutiliza el z13 -es lo que
  hace maxDataZoom-, asi que generar mas solo engorda el fichero.
"""
import json, math, os, re, sys, gzip

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from shapely.geometry import Polygon, LineString, MultiLineString, Point, box, mapping
from shapely.ops import transform as sh_transform
import mapbox_vector_tile as mvt
from pmtiles.writer import Writer
from pmtiles.tile import TileType, Compression, zxy_to_tileid

# ── que el fichero salga igual en cada ejecucion ──────────────────────────
# gzip escribe la hora dentro de cada bloque comprimido, asi que dos
# generaciones seguidas daban un fichero distinto: 4 bytes de diferencia, pero
# 1,1 MB de diff binario en el repositorio cada vez que se regenerara, sin que
# hubiera cambiado ni un dato.
#
# Dos de esos bloques -el directorio raiz y los metadatos- los comprime la
# propia libreria pmtiles con un gzip.compress() sin mtime, donde no se puede
# pasar el parametro. De ahi que se fuerce aqui, para todo el proceso. No es
# el PYTHONHASHSEED: se probo, y con la semilla fija seguian saliendo los
# mismos 4 bytes distintos.
_gzip_compress = gzip.compress
gzip.compress = lambda datos, nivel=9, **kw: _gzip_compress(datos, nivel, mtime=0)

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SALIDA = os.path.join(RAIZ, 'mapa', 'tenerife-base.pmtiles')
Z_MIN, Z_MAX = 6, 13
EXTENT = 4096
# La caja de navegacion del mapa de la app, ni mas ni menos.
BBOX = (-16.98, 27.90, -16.08, 28.65)

R = 6378137.0
def a_mercator(lon, lat):
    x = math.radians(lon) * R
    y = math.log(math.tan(math.pi / 4 + math.radians(lat) / 2)) * R
    return x, y
def merc_geom(g):
    return sh_transform(lambda xs, ys: tuple(zip(*[a_mercator(x, y) for x, y in zip(xs, ys)])), g)

def caja_tesela(z, x, y):
    """Limites de una tesela en metros de Mercator."""
    n = 2 ** z
    lado = 2 * math.pi * R / n
    x0 = -math.pi * R + x * lado
    y1 = math.pi * R - y * lado
    return (x0, y1 - lado, x0 + lado, y1)

def rango_teselas(z):
    def xt(lon): return int((lon + 180) / 360 * 2 ** z)
    def yt(lat):
        r = math.radians(lat)
        return int((1 - math.log(math.tan(r) + 1 / math.cos(r)) / math.pi) / 2 * 2 ** z)
    return xt(BBOX[0]), yt(BBOX[3]), xt(BBOX[2]), yt(BBOX[1])


def leer_datos():
    src = open(os.path.join(RAIZ, 'index.html'), encoding='utf-8').read()

    costa = json.load(open(os.path.join(RAIZ, 'tools/datos/costa_tenerife.json'), encoding='utf-8'))
    tierra = Polygon([(p[1], p[0]) for p in costa['anillo']])          # [lat,lon] -> (lon,lat)
    if not tierra.is_valid:
        tierra = tierra.buffer(0)

    vias = []
    for m in re.finditer(r'via:\s*\[\s*(\[[^\]]*\](?:\s*,\s*\[[^\]]*\])*)\s*\]', src):
        pts = [tuple(map(float, p.split(','))) for p in re.findall(r'\[([-\d.]+,\s*[-\d.]+)\]', m.group(1))]
        if len(pts) > 1:
            vias.append(LineString([(lo, la) for la, lo in pts]))       # a (lon,lat)

    # Nucleos y ciudades: los dos prefijos apuntan al mismo sitio en muchos
    # casos, asi que se quedan por nombre y coordenada, sin repetir.
    sitios, vistos = [], set()
    for m in re.finditer(r'\{\s*id:"((?:nucleo|ciudad)-[a-z0-9\-]+)",[^\n]*?name:"((?:[^"\\]|\\.)*)"[^\n]*?lat:([-\d.]+),\s*lng:([-\d.]+)', src):
        nombre = m.group(2)
        clave = (round(float(m.group(3)), 3), round(float(m.group(4)), 3))
        if clave in vistos:
            continue
        vistos.add(clave)
        sitios.append((Point(float(m.group(4)), float(m.group(3))), nombre))

    return tierra, vias, sitios


def main():
    print('Leyendo los datos de la propia app...')
    tierra, vias, sitios = leer_datos()
    print('  tierra    : %d vertices' % len(tierra.exterior.coords))
    print('  via       : %d lineas, %d vertices' % (len(vias), sum(len(v.coords) for v in vias)))
    print('  sitios    : %d nucleos' % len(sitios))

    # Las 183 se dibujan tal cual. Medido antes de decidirlo: de 26.410
    # segmentos solo 236 estan repetidos al metro -un 1%-, porque cada trazado
    # se simplifico por su cuenta y casi ninguno comparte vertice. Un
    # unary_union para "unir la calzada" nodifica en cada cruce y sube de
    # 26.593 vertices a 237.308: nueve veces mas fichero para dibujar lo
    # mismo. Que dos trazados casi paralelos se pisen no es problema: a escala
    # de mapa se lee como una carretera, que es lo que es.
    tierra_m = merc_geom(tierra)
    red_m = MultiLineString([merc_geom(t) for t in vias])
    sitios_m = [(merc_geom(p), n) for p, n in sitios]

    os.makedirs(os.path.dirname(SALIDA), exist_ok=True)
    escritas = 0
    with open(SALIDA, 'wb') as fh:
        w = Writer(fh)
        for z in range(Z_MIN, Z_MAX + 1):
            x0, y0, x1, y1 = rango_teselas(z)
            lado = 2 * math.pi * R / (2 ** z)
            # Simplificar a un pixel de la tesela: por debajo de eso no se ve.
            tol = lado / EXTENT * 4
            for x in range(x0, x1 + 1):
                for y in range(y0, y1 + 1):
                    caja = caja_tesela(z, x, y)
                    # margen para que las lineas no se corten en el borde
                    marco = box(caja[0] - lado * 0.05, caja[1] - lado * 0.05,
                                caja[2] + lado * 0.05, caja[3] + lado * 0.05)
                    capas = []
                    t = tierra_m.intersection(marco)
                    if not t.is_empty:
                        t = t.simplify(tol, preserve_topology=True)
                        if not t.is_empty:
                            capas.append({'name': 'tierra', 'features': [{'geometry': t.wkt, 'properties': {}}]})
                    r = red_m.intersection(marco)
                    if not r.is_empty:
                        r = r.simplify(tol, preserve_topology=False)
                        if not r.is_empty:
                            capas.append({'name': 'carretera', 'features': [{'geometry': r.wkt, 'properties': {}}]})
                    if z >= 9:
                        dentro = [(p, n) for p, n in sitios_m if marco.contains(p)]
                        if dentro:
                            capas.append({'name': 'sitio', 'features':
                                [{'geometry': p.wkt, 'properties': {'nombre': n}} for p, n in dentro]})
                    if not capas:
                        continue
                    datos = mvt.encode(capas, default_options={
                        'quantize_bounds': caja, 'extents': EXTENT, 'y_coord_down': False,
                        'on_invalid_geometry': mvt.encoder.on_invalid_geometry_make_valid})
                    w.write_tile(zxy_to_tileid(z, x, y), gzip.compress(datos, 6))
                    escritas += 1
            print('  z%-2d  %d teselas acumuladas' % (z, escritas))

        w.finalize({
            'tile_type': TileType.MVT, 'tile_compression': Compression.GZIP,
            'min_zoom': Z_MIN, 'max_zoom': Z_MAX,
            'min_lon_e7': int(BBOX[0] * 1e7), 'min_lat_e7': int(BBOX[1] * 1e7),
            'max_lon_e7': int(BBOX[2] * 1e7), 'max_lat_e7': int(BBOX[3] * 1e7),
            'center_zoom': 10,
            'center_lon_e7': int((BBOX[0] + BBOX[2]) / 2 * 1e7),
            'center_lat_e7': int((BBOX[1] + BBOX[3]) / 2 * 1e7),
        }, {
            'name': 'Tenerife Go — mapa base',
            'description': 'Costa (GSHHG), red viaria (trazado real del GTFS de TITSA) y nucleos. Se genera con tools/mapa_base.py.',
            'attribution': 'Costa: GSHHG · Viario: GTFS de TITSA · © Tenerife Go',
            'vector_layers': [
                {'id': 'tierra', 'fields': {}},
                {'id': 'carretera', 'fields': {}},
                {'id': 'sitio', 'fields': {'nombre': 'String'}},
            ],
        })
    print('\n%s  ·  %d teselas  ·  %.1f MB' % (os.path.relpath(SALIDA, RAIZ), escritas,
                                               os.path.getsize(SALIDA) / 1e6))


if __name__ == '__main__':
    main()
