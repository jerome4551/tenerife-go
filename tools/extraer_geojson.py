#!/usr/bin/env python3
"""
extraer_geojson.py — saca los poligonos de arena y de agua del pmtiles de la app.

    python3 tools/extraer_geojson.py playas.geojson agua.geojson

Alimenta a tools/orientacion_playa.py. Lee mapa/tenerife-osm.pmtiles, z14, la
caja de navegacion de la app.

LA TRAMPA QUE HAY QUE RESOLVER AQUI Y NO EN EL OTRO SCRIPT
  Un pmtiles guarda la geometria RECORTADA POR TESELA. Una tesela z14 mide unos
  2,4 km, asi que una playa que cruce el borde llega partida en dos trozos, y
  cada trozo es un poligono distinto. El metodo del eje largo se traga eso sin
  quejarse: coge el trozo mas cercano, le calcula el eje, y devuelve un angulo
  plausible que es el del recorte, no el de la playa. Es exactamente el fallo
  que no se nota.
  Por eso la arena se UNE con shapely antes de escribir: los trozos vecinos
  vuelven a ser una playa. El agua no se une -no hace falta, solo se le
  pregunta si un punto cae dentro, y para eso un trozo cualquiera vale-.

  El agua ademas se limita a las teselas que rodean a algun POI: es lo unico
  que el otro script consulta -150 m alrededor- y asi el fichero no se va a
  cientos de megas de oceano que nadie mira.
"""
import gzip, json, math, os, re, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAPA = os.path.join(RAIZ, 'mapa', 'tenerife-osm.pmtiles')
Z, EXT = 14, 4096
CAJA = (-16.98, 27.90, -16.08, 28.65)      # oeste, sur, este, norte

def tesela(lat, lng, z=Z):
    n = 1 << z
    s = math.sin(math.radians(lat))
    return (int((lng + 180.0) / 360.0 * n),
            int((0.5 - math.log((1 + s) / (1 - s)) / (4 * math.pi)) * n))

def a_lonlat(tx, ty, px, py):
    """vertice MVT -> (lon, lat). La Y del MVT va hacia ARRIBA."""
    n = 1 << Z
    X = tx + px / EXT
    Y = ty + (1 - py / EXT)
    lon = X / n * 360.0 - 180.0
    m = math.pi - 2 * math.pi * Y / n
    lat = math.degrees(math.atan(0.5 * (math.exp(m) - math.exp(-m))))
    return (lon, lat)

def main():
    if len(sys.argv) < 3:
        print(__doc__); return 1
    sal_playas, sal_agua = sys.argv[1], sys.argv[2]
    from pmtiles.reader import Reader, MmapSource
    from pmtiles.tile import Compression
    import mapbox_vector_tile as mvt
    from shapely.geometry import Polygon, MultiPolygon, mapping
    from shapely.ops import unary_union

    # teselas que rodean a algun POI: es donde se consulta el agua
    src = open(os.path.join(RAIZ, 'index.html'), encoding='utf-8').read()
    poi = [(float(m.group(1)), float(m.group(2)))
           for m in re.finditer(r'lat:(-?[\d.]+), lng:(-?[\d.]+)', src)]
    cerca = set()
    for la, lo in poi:
        x, y = tesela(la, lo)
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                cerca.add((x + dx, y + dy))

    f = open(MAPA, 'r+b')
    r = Reader(MmapSource(f)); h = r.header()
    x0, y0 = tesela(CAJA[3], CAJA[0])
    x1, y1 = tesela(CAJA[1], CAJA[2])
    print('teselas z14 de la caja: %d · con POI cerca: %d'
          % ((x1-x0+1)*(y1-y0+1), len(cerca & {(x,y) for x in range(x0,x1+1) for y in range(y0,y1+1)})))

    arena_trozos, agua_feats = [], []
    kinds_vistos = {}
    leidas = 0
    for tx in range(x0, x1 + 1):
        for ty in range(y0, y1 + 1):
            raw = r.get(Z, tx, ty)
            if raw is None: continue
            if h['tile_compression'] == Compression.GZIP: raw = gzip.decompress(raw)
            try: t = mvt.decode(raw)
            except Exception: continue
            leidas += 1
            if 'landuse' in t:
                for ft in t['landuse']['features']:
                    k = ft['properties'].get('kind')
                    kinds_vistos[k] = kinds_vistos.get(k, 0) + 1
                    if k != 'beach': continue
                    geo = ft.get('geometry', {}); tipo = geo.get('type'); co = geo.get('coordinates', [])
                    for pol in ([co] if tipo == 'Polygon' else (co if tipo == 'MultiPolygon' else [])):
                        if not pol: continue
                        ext = [a_lonlat(tx, ty, p[0], p[1]) for p in pol[0]]
                        hue = [[a_lonlat(tx, ty, p[0], p[1]) for p in a] for a in pol[1:]]
                        if len(ext) < 4: continue
                        try:
                            g = Polygon(ext, hue)
                            if not g.is_valid: g = g.buffer(0)
                            if not g.is_empty: arena_trozos.append(g)
                        except Exception: pass
            if 'water' in t and (tx, ty) in cerca:
                for ft in t['water']['features']:
                    geo = ft.get('geometry', {}); tipo = geo.get('type'); co = geo.get('coordinates', [])
                    for pol in ([co] if tipo == 'Polygon' else (co if tipo == 'MultiPolygon' else [])):
                        if not pol or len(pol[0]) < 4: continue
                        agua_feats.append({'type': 'Feature', 'properties': {}, 'geometry': {
                            'type': 'Polygon',
                            'coordinates': [[list(a_lonlat(tx, ty, p[0], p[1])) for p in a] for a in pol]}})

    print('teselas leidas: %d' % leidas)
    print('trozos de arena antes de unir: %d' % len(arena_trozos))
    unida = unary_union(arena_trozos) if arena_trozos else None
    if unida is None: playas = []
    elif unida.geom_type == 'Polygon': playas = [unida]
    else: playas = list(unida.geoms)
    print('poligonos de arena despues de unir: %d   (%d trozos eran de playas partidas por el borde)'
          % (len(playas), len(arena_trozos) - len(playas)))
    print('poligonos de agua: %d' % len(agua_feats))

    json.dump({'type': 'FeatureCollection', 'features':
               [{'type': 'Feature', 'properties': {}, 'geometry': mapping(g)} for g in playas]},
              open(sal_playas, 'w'))
    json.dump({'type': 'FeatureCollection', 'features': agua_feats}, open(sal_agua, 'w'))
    print('\nescritos: %s (%.1f MB) · %s (%.1f MB)'
          % (sal_playas, os.path.getsize(sal_playas)/1048576,
             sal_agua, os.path.getsize(sal_agua)/1048576))
    if len(playas) < 30:
        print('  AVISO: menos de 30 poligonos de arena. La orden de trabajo dice que se desconfie.')
    return 0

if __name__ == '__main__':
    sys.exit(main())
