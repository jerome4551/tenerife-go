#!/usr/bin/env python3
"""
mapa_prueba_osm.py — un .pmtiles pequeno con el ESQUEMA DE PROTOMAPS.

    python3 tools/mapa_prueba_osm.py

Escribe tools/datos/prueba-osm.pmtiles.

PARA QUE
  El bloque 4 descarga un .pmtiles de OSM y lo dibuja con el estilo de la
  app (estiloIslaDetallada, en index.html; hasta el 24 de octubre de 2026,
  el flavor 'light' de protomaps-leaflet), que espera las capas earth,
  water, roads, places, pois, landuse, buildings y boundaries.

  Ese fichero lo genera el usuario y no cabe en el repositorio. Sin algo con
  ese esquema no se puede probar NADA de la maquinaria -descargar, guardar,
  releer del cache, estilar, pintar- y se estaria subiendo a ciegas.

  Esto es un banco de pruebas, no un mapa: lleva las mismas tres cosas que
  llevaba el mapa base hasta el 31 de octubre de 2026 (la costa de GSHHG, los
  trazados de las guaguas y los nucleos) pero con los nombres y las
  propiedades que espera el estilo. No se sirve nunca al usuario; vive en
  tools/ junto a la auditoria.
"""
import json, math, os, re, sys, gzip

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from shapely.geometry import Polygon, LineString, MultiLineString, Point, box
from shapely.ops import transform as sh_transform
import mapbox_vector_tile as mvt
from pmtiles.writer import Writer
from pmtiles.tile import TileType, Compression, zxy_to_tileid

_gzip_compress = gzip.compress
gzip.compress = lambda datos, nivel=9, **kw: _gzip_compress(datos, nivel, mtime=0)

# Hasta el 31 de octubre de 2026 esto se reaprovechaba de tools/mapa_base.py, que leia lo mismo
# para hacer el mapa base. Desde ese dia el mapa base sale del mapa detallado de OpenStreetMap,
# y lo que este banco de pruebas necesita (la costa de GSHHG, los `via` de las guaguas y los
# nucleos de places[], la proyeccion y la rejilla) vive aqui, igual que estaba alli: el banco
# de pruebas sale igual que antes.
class MB:
    RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    EXTENT = 4096
    # La caja de navegacion del mapa de la app, ni mas ni menos.
    BBOX = (-16.98, 27.90, -16.08, 28.65)
    R = 6378137.0

    @staticmethod
    def a_mercator(lon, lat):
        x = math.radians(lon) * MB.R
        y = math.log(math.tan(math.pi / 4 + math.radians(lat) / 2)) * MB.R
        return x, y

    @staticmethod
    def merc_geom(g):
        return sh_transform(lambda xs, ys: tuple(zip(*[MB.a_mercator(x, y) for x, y in zip(xs, ys)])), g)

    @staticmethod
    def caja_tesela(z, x, y):
        """Limites de una tesela en metros de Mercator."""
        n = 2 ** z
        lado = 2 * math.pi * MB.R / n
        x0 = -math.pi * MB.R + x * lado
        y1 = math.pi * MB.R - y * lado
        return (x0, y1 - lado, x0 + lado, y1)

    @staticmethod
    def rango_teselas(z):
        def xt(lon): return int((lon + 180) / 360 * 2 ** z)
        def yt(lat):
            r = math.radians(lat)
            return int((1 - math.log(math.tan(r) + 1 / math.cos(r)) / math.pi) / 2 * 2 ** z)
        return xt(MB.BBOX[0]), yt(MB.BBOX[3]), xt(MB.BBOX[2]), yt(MB.BBOX[1])

    @staticmethod
    def leer_datos():
        src = open(os.path.join(MB.RAIZ, 'index.html'), encoding='utf-8').read()
        # Los `via` de las lineas viven en datos/titsa.js desde el 9 de octubre de
        # 2026; los nucleos siguen en places[], dentro de index.html.
        red = open(os.path.join(MB.RAIZ, 'datos', 'titsa.js'), encoding='utf-8').read()

        costa = json.load(open(os.path.join(MB.RAIZ, 'tools/datos/costa_tenerife.json'), encoding='utf-8'))
        tierra = Polygon([(p[1], p[0]) for p in costa['anillo']])          # [lat,lon] -> (lon,lat)
        if not tierra.is_valid:
            tierra = tierra.buffer(0)

        vias = []
        for m in re.finditer(r'via:\s*\[\s*(\[[^\]]*\](?:\s*,\s*\[[^\]]*\])*)\s*\]', red):
            pts = [tuple(map(float, p.split(','))) for p in re.findall(r'\[([-\d.]+,\s*[-\d.]+)\]', m.group(1))]
            if len(pts) > 1:
                vias.append(LineString([(lo, la) for la, lo in pts]))       # a (lon,lat)
        # Sin trazados el banco saldria sin carreteras y sin dar error: se para.
        if not vias:
            raise SystemExit('ABORTADO: no encuentro ningun `via` en datos/titsa.js')

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

SALIDA = os.path.join(MB.RAIZ, 'tools', 'datos', 'prueba-osm.pmtiles')
# z6 a z12 la isla entera; z13 y z14 solo una ventana en el centro. Asi la
# cabecera declara z14 -que es lo que exige el verificador- y hay un tile de
# z14 sobre Tenerife que decodificar, sin que el fichero engorde: la isla
# entera a z14 son 1.584 teselas.
Z_MIN, Z_MAX = 6, 14
Z_COMPLETO = 12
VENTANA = 0.04           # grados alrededor del centro para z13 y z14


def main():
    tierra, vias, sitios = MB.leer_datos()
    tierra_m = MB.merc_geom(tierra)
    red_m = MultiLineString([MB.merc_geom(t) for t in vias])
    sitios_m = [(MB.merc_geom(p), n) for p, n in sitios]

    os.makedirs(os.path.dirname(SALIDA), exist_ok=True)
    escritas = 0
    with open(SALIDA, 'wb') as fh:
        w = Writer(fh)
        for z in range(Z_MIN, Z_MAX + 1):
            if z <= Z_COMPLETO:
                x0, y0, x1, y1 = MB.rango_teselas(z)
            else:
                # La Laguna, que es uno de los puntos que muestrea
                # tools/verificar_osm.py y ahi si hay trazado de guaguas.
                clon, clat = -16.315, 28.487
                def _t(lon, lat, z=z):
                    r = math.radians(lat)
                    return (int((lon + 180) / 360 * 2 ** z),
                            int((1 - math.log(math.tan(r) + 1 / math.cos(r)) / math.pi) / 2 * 2 ** z))
                x0, y1b = _t(clon - VENTANA, clat - VENTANA)
                x1, y0 = _t(clon + VENTANA, clat + VENTANA)
                y1 = y1b
            lado = 2 * math.pi * MB.R / (2 ** z)
            tol = lado / MB.EXTENT * 4
            for x in range(x0, x1 + 1):
                for y in range(y0, y1 + 1):
                    caja = MB.caja_tesela(z, x, y)
                    marco = box(caja[0] - lado * 0.05, caja[1] - lado * 0.05,
                                caja[2] + lado * 0.05, caja[3] + lado * 0.05)
                    capas = []
                    t = tierra_m.intersection(marco)
                    if not t.is_empty:
                        t = t.simplify(tol, preserve_topology=True)
                        if not t.is_empty:
                            # 'earth' es como llama el esquema de Protomaps a la tierra
                            capas.append({'name': 'earth', 'features': [
                                {'geometry': t.wkt, 'properties': {}}]})
                    r = red_m.intersection(marco)
                    if not r.is_empty:
                        r = r.simplify(tol, preserve_topology=False)
                        if not r.is_empty:
                            # kind es la propiedad por la que filtra el estilo
                            capas.append({'name': 'roads', 'features': [
                                {'geometry': r.wkt, 'properties': {'kind': 'minor_road'}},
                                # el estilo pinta kind 'path': el verificador
                                # comprueba que dentro hay senderos, asi que el
                                # banco de pruebas tiene que traerlos
                                {'geometry': r.wkt, 'properties': {'kind': 'path'}}]})
                            # el resto de capas del esquema, declaradas y con
                            # geometria, para que el fichero se parezca a un
                            # build de verdad y el estilo tenga que resolverlas
                            if z <= 10:   # solo en los zooms bajos: engorda mucho
                                capas.append({'name': 'water', 'features': [
                                    {'geometry': marco.difference(t).wkt if not t.is_empty else marco.wkt,
                                     'properties': {'kind': 'ocean'}}]})
                    if z >= 9:
                        dentro = [(p, n) for p, n in sitios_m if marco.contains(p)]
                        if dentro:
                            capas.append({'name': 'places', 'features': [
                                {'geometry': p.wkt,
                                 'properties': {'name': n, 'kind': 'locality', 'min_zoom': 9}}
                                for p, n in dentro]})
                    if not capas:
                        continue
                    datos = mvt.encode(capas, default_options={
                        'quantize_bounds': caja, 'extents': MB.EXTENT, 'y_coord_down': False,
                        'on_invalid_geometry': mvt.encoder.on_invalid_geometry_make_valid})
                    w.write_tile(zxy_to_tileid(z, x, y), gzip.compress(datos, 6))
                    escritas += 1

        w.finalize({
            'tile_type': TileType.MVT, 'tile_compression': Compression.GZIP,
            'min_zoom': Z_MIN, 'max_zoom': Z_MAX,
            'min_lon_e7': int(MB.BBOX[0] * 1e7), 'min_lat_e7': int(MB.BBOX[1] * 1e7),
            'max_lon_e7': int(MB.BBOX[2] * 1e7), 'max_lat_e7': int(MB.BBOX[3] * 1e7),
            'center_zoom': 10,
            'center_lon_e7': int((MB.BBOX[0] + MB.BBOX[2]) / 2 * 1e7),
            'center_lat_e7': int((MB.BBOX[1] + MB.BBOX[3]) / 2 * 1e7),
        }, {
            'name': 'BANCO DE PRUEBAS — no es un mapa',
            'description': 'Esquema de Protomaps con datos del propio repositorio. Solo para tools/auditar_mapa.js.',
            # Se declaran las mismas capas que un build de Protomaps de
            # verdad: el verificador decide el esquema por estos nombres.
            'vector_layers': [
                {'id': 'earth', 'fields': {}},
                {'id': 'water', 'fields': {'kind': 'String'}},
                {'id': 'landuse', 'fields': {'kind': 'String'}},
                {'id': 'landcover', 'fields': {'kind': 'String'}},
                {'id': 'buildings', 'fields': {}},
                {'id': 'boundaries', 'fields': {'kind': 'String'}},
                {'id': 'roads', 'fields': {'kind': 'String'}},
                {'id': 'places', 'fields': {'name': 'String', 'kind': 'String'}},
            ],
        })
    print('%s  ·  %d teselas  ·  %.2f MB' % (os.path.relpath(SALIDA, MB.RAIZ), escritas,
                                             os.path.getsize(SALIDA) / 1e6))


if __name__ == '__main__':
    main()
