#!/usr/bin/env python3
"""
verificar_osm.py — revisa un .pmtiles de OSM ANTES de meterlo en el repositorio.

    python3 tools/verificar_osm.py ruta/al/fichero.pmtiles

QUE MIRA
  1. Que sea un PMTiles v3 legible y con vector tiles dentro.
  2. Que traiga el ESQUEMA DE PROTOMAPS. protomaps-leaflet lo dibuja con su
     flavor 'light', que busca las capas earth, water, roads, places,
     landuse, landcover, buildings y boundaries. Con otro esquema
     -OpenMapTiles, por ejemplo- el fichero es valido y el mapa sale EN
     BLANCO, sin ningun error: el estilo no encuentra sus capas.
  3. Que cubra Tenerife, comparando con la caja de navegacion de la app.
  4. Que quepa en GitHub: por encima de 100 MB el push se rechaza.
  5. Que dentro haya senderos (kind 'path'), que es lo que justifica todo
     esto y lo que el mapa base no puede llevar.
"""
import sys, os, json, gzip, math

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pmtiles.reader import Reader, MmapSource
from pmtiles.tile import TileType, Compression, zxy_to_tileid
import mapbox_vector_tile as mvt

# La caja de navegacion del mapa de la app (tenerifeBounds en index.html).
BBOX = (-16.98, 27.90, -16.08, 28.65)
NECESARIAS = {'earth', 'roads', 'places'}
DESEABLES = {'water', 'landuse', 'landcover', 'buildings', 'boundaries'}

fallos = []
def ok(cond, txt, detalle=''):
    print(('  OK  ' if cond else '  MAL ') + txt + (('   -> ' + str(detalle)) if (detalle and not cond) else ''))
    if not cond:
        fallos.append(txt)

def main():
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(1)
    ruta = sys.argv[1]
    if not os.path.exists(ruta):
        print('No existe: ' + ruta); sys.exit(1)

    tam = os.path.getsize(ruta)
    print('\n%s  ·  %.1f MB\n' % (ruta, tam / 1e6))

    with open(ruta, 'r+b') as f:
        r = Reader(MmapSource(f))
        h = r.header()
        meta = r.metadata()

        ok(h['tile_type'] == TileType.MVT, 'lleva vector tiles (MVT)', h['tile_type'])
        print('      zoom %d a %d' % (h['min_zoom'], h['max_zoom']))
        ok(h['max_zoom'] >= 13, 'llega al menos a z13; por debajo no hay detalle de sendero',
           'max_zoom=%d' % h['max_zoom'])

        oe, os_, on, oo = (h['min_lon_e7'] / 1e7, h['min_lat_e7'] / 1e7,
                           h['max_lat_e7'] / 1e7, h['max_lon_e7'] / 1e7)
        print('      caja  %.4f,%.4f  ->  %.4f,%.4f' % (oe, os_, oo, on))
        cubre = (oe <= BBOX[0] + 0.05 and os_ <= BBOX[1] + 0.05 and
                 oo >= BBOX[2] - 0.05 and on >= BBOX[3] - 0.05)
        ok(cubre, 'cubre la caja de navegacion de la app',
           'la app va de %.2f,%.2f a %.2f,%.2f' % BBOX)

        capas = set()
        for v in (meta.get('vector_layers') or []):
            capas.add(v.get('id'))
        print('      capas: ' + (', '.join(sorted(capas)) or '(ninguna declarada)'))
        faltan = NECESARIAS - capas
        ok(not faltan, 'trae el esquema de Protomaps (earth, roads, places)',
           'faltan: ' + ', '.join(sorted(faltan)) + '. Con otro esquema el mapa sale EN BLANCO.')
        ausentes = DESEABLES - capas
        if ausentes:
            print('      (sin %s: se dibujara, pero mas pobre)' % ', '.join(sorted(ausentes)))

        # una tesela del centro de la isla, para confirmar que se decodifica
        z = min(h['max_zoom'], 14)
        lat, lon = 28.30, -16.55
        rad = math.radians(lat)
        x = int((lon + 180) / 360 * 2 ** z)
        y = int((1 - math.log(math.tan(rad) + 1 / math.cos(rad)) / math.pi) / 2 * 2 ** z)
        crudo = r.get(z, x, y)
        ok(bool(crudo), 'la tesela z%d/%d/%d (centro de la isla) trae datos' % (z, x, y))
        if crudo:
            datos = gzip.decompress(crudo) if h['tile_compression'] == Compression.GZIP else crudo
            tile = mvt.decode(datos)
            print('      esa tesela: ' + ', '.join('%s(%d)' % (k, len(v['features'])) for k, v in tile.items()))
            sendas = 0
            for k, v in tile.items():
                if k != 'roads':
                    continue
                for ft in v['features']:
                    kind = ft.get('properties', {}).get('kind') or ft.get('properties', {}).get('pmap:kind')
                    if kind in ('path', 'footway', 'track'):
                        sendas += 1
            if sendas:
                print('      y %d senderos en ella' % sendas)
            else:
                print('      AVISO: ningun sendero en esa tesela concreta. Puede ser'
                      ' normal si cae en zona urbana; miralo en otra de monte.')

    ok(tam < 100e6, 'cabe en GitHub (el limite por fichero son 100 MB)', '%.0f MB' % (tam / 1e6))
    if tam > 80e6:
        print('      AVISO: por encima de 80 MB conviene bajar un nivel de zoom.')

    print('\n  ' + ('%d problema(s)' % len(fallos) if fallos else 'listo para copiarlo a mapa/tenerife-osm.pmtiles') + '\n')
    sys.exit(1 if fallos else 0)


if __name__ == '__main__':
    main()
