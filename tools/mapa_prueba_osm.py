#!/usr/bin/env python3
"""
mapa_prueba_osm.py — un .pmtiles pequeno con el ESQUEMA DE PROTOMAPS.

    python3 tools/mapa_prueba_osm.py

Escribe tools/datos/prueba-osm.pmtiles.

PARA QUE
  El bloque 4 descarga un .pmtiles de OSM y lo dibuja con los estilos que
  trae protomaps-leaflet (flavor 'light'), que esperan las capas earth,
  water, roads, places, landuse, landcover, buildings y boundaries.

  Ese fichero lo genera el usuario y no cabe en el repositorio. Sin algo con
  ese esquema no se puede probar NADA de la maquinaria -descargar, guardar,
  releer del cache, estilar, pintar- y se estaria subiendo a ciegas.

  Esto es un banco de pruebas, no un mapa: lleva las mismas tres cosas que el
  mapa base pero con los nombres y las propiedades que espera el estilo. No
  se sirve nunca al usuario; vive en tools/ junto a la auditoria.
"""
import json, math, os, sys, gzip

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from shapely.geometry import Polygon, LineString, MultiLineString, Point, box
from shapely.ops import transform as sh_transform
import mapbox_vector_tile as mvt
from pmtiles.writer import Writer
from pmtiles.tile import TileType, Compression, zxy_to_tileid

_gzip_compress = gzip.compress
gzip.compress = lambda datos, nivel=9, **kw: _gzip_compress(datos, nivel, mtime=0)

import mapa_base as MB   # se reaprovechan lectura, proyeccion y rejilla

SALIDA = os.path.join(MB.RAIZ, 'tools', 'datos', 'prueba-osm.pmtiles')
Z_MIN, Z_MAX = 6, 11     # menos zoom que el de verdad: es un banco de pruebas,
                         # no un mapa, y no hay por que engordar el repositorio


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
            x0, y0, x1, y1 = MB.rango_teselas(z)
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
                                {'geometry': r.wkt, 'properties': {'kind': 'minor_road'}}]})
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
            'vector_layers': [
                {'id': 'earth', 'fields': {}},
                {'id': 'roads', 'fields': {'kind': 'String'}},
                {'id': 'places', 'fields': {'name': 'String', 'kind': 'String'}},
            ],
        })
    print('%s  ·  %d teselas  ·  %.2f MB' % (os.path.relpath(SALIDA, MB.RAIZ), escritas,
                                             os.path.getsize(SALIDA) / 1e6))


if __name__ == '__main__':
    main()
