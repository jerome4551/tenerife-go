#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
municipio_raya.py — a que municipio cae un punto, sin inventar nada.

    python3 tools/municipio_raya.py                 # las fichas ya cerradas asi
    python3 tools/municipio_raya.py ID [ID ...]     # las que se le pidan
    python3 tools/municipio_raya.py --calibrar      # cuanto se puede fiar uno

POR QUE NO ES UN POINT-IN-POLYGON
  Lo suyo seria meter la coordenada dentro del poligono municipal del Cabildo.
  ESE FICHERO NO ESTA EN EL REPOSITORIO y no se puede bajar desde aqui: la
  politica de salida tumba Overpass, Nominatim, IDECanarias y los portales de
  datos abiertos. Y el municipio de las paradas de TITSA tampoco sale de un
  poligono: gtfs_red.py se lo copia a cada parada del indice de TITSA mas
  cercano, a menos de 3 km.

LO QUE SI HAY, Y QUE PRUEBA
  El mapa OSM del propio repositorio trae la capa `boundaries`, y dentro las
  rayas municipales (kind_detail 8). No son poligonos -son lineas sueltas,
  recortadas por tesela- asi que no se puede preguntar «dentro de quien cae».
  Pero si se puede preguntar lo unico que hace falta:

      ¿hay una raya municipal ENTRE el punto y las paradas que lo rodean?

  Si no la hay, el punto y esas paradas estan en el mismo municipio, y el
  municipio de las paradas ya lo trae el dato. Eso responde exactamente al
  riesgo de fiarse de la parada de al lado: una parada a 67 m puede caer al
  otro lado de una raya, y esto lo mira en vez de suponerlo.

LO QUE NO PUEDE DECIR, Y LO DICE
  Las rayas vienen partidas por tesela y con huecos. Un hueco justo al lado
  del punto dejaria pasar una raya sin verla. Por eso:
    · se mide tambien la distancia al HUECO mas cercano, y
    · con --calibrar se cuenta, sobre las 2.514 paradas, cuantas parejas
      vecinas de municipio distinto tienen de verdad una raya en medio.
  Una ficha solo se da por buena si NINGUNA raya y NINGUN hueco caen dentro
  del circulo que abarca las paradas en las que se apoya: fuera de ese circulo
  ya no pueden meterse entre el punto y ellas.
"""
import io, json, math, os, re, subprocess, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAPA = os.path.join(RAIZ, 'mapa', 'tenerife-osm.pmtiles')
Z, EXT = 14, 4096
CAJA = (-16.98, 27.90, -16.08, 28.65)          # oeste, sur, este, norte
CUANTAS = 8                                     # paradas de apoyo


def tesela(lat, lng, z=Z):
    n = 1 << z
    s = math.sin(math.radians(lat))
    return (int((lng + 180.0) / 360.0 * n),
            int((0.5 - math.log((1 + s) / (1 - s)) / (4 * math.pi)) * n))


def a_lonlat(tx, ty, px, py):
    """vertice MVT -> (lon, lat). La Y del MVT va hacia ARRIBA."""
    n = 1 << Z
    X, Y = tx + px / EXT, ty + (1 - py / EXT)
    m = math.pi - 2 * math.pi * Y / n
    return (X / n * 360.0 - 180.0,
            math.degrees(math.atan(0.5 * (math.exp(m) - math.exp(-m)))))


def metros(la1, lo1, la2, lo2):
    k = math.cos(math.radians((la1 + la2) / 2))
    return math.hypot((lo2 - lo1) * 111320.0 * k, (la2 - la1) * 110540.0)


def rayas():
    """Las lineas de raya municipal (admin_level 8) del mapa del repositorio."""
    import gzip
    from pmtiles.reader import Reader, MmapSource
    from pmtiles.tile import Compression
    import mapbox_vector_tile as mvt
    x0, y0 = tesela(CAJA[3], CAJA[0])
    x1, y1 = tesela(CAJA[1], CAJA[2])
    f = open(MAPA, 'rb')
    r = Reader(MmapSource(f))
    h = r.header()
    salida = []
    for tx in range(x0, x1 + 1):
        for ty in range(y0, y1 + 1):
            c = r.get(Z, tx, ty)
            if not c:
                continue
            b = gzip.decompress(c) if h['tile_compression'] == Compression.GZIP else c
            try:
                d = mvt.decode(b)
            except Exception:
                continue
            cap = d.get('boundaries')
            if not cap:
                continue
            for ft in cap['features']:
                if ft['properties'].get('kind_detail') != 8:
                    continue
                g = ft['geometry']
                t = g.get('type')
                partes = ([g['coordinates']] if t == 'LineString'
                          else g['coordinates'] if t == 'MultiLineString' else [])
                for parte in partes:
                    if len(parte) >= 2:
                        salida.append([a_lonlat(tx, ty, px, py) for px, py in parte])
    return salida


def paradas():
    orden = subprocess.run(
        ['node', '-e', "const{CAT}=require('./tools/cargar');"
                       "console.log(JSON.stringify(Object.values(CAT)))"],
        cwd=RAIZ, capture_output=True, text=True)
    return [s for s in json.loads(orden.stdout) if s.get('m')]


def lugares():
    orden = subprocess.run(
        ['node', '-e', "const{PLACES}=require('./tools/cargar');"
                       "console.log(JSON.stringify(PLACES.map(p=>"
                       "({id:p.id,name:p.name,lat:p.lat,lng:p.lng}))))"],
        cwd=RAIZ, capture_output=True, text=True)
    return {p['id']: p for p in json.loads(orden.stdout)}


def main():
    args = [a for a in sys.argv[1:]]
    calibrar = '--calibrar' in args
    ids = [a for a in args if not a.startswith('--')]

    if not os.path.exists(MAPA):
        print('  sin mapa OSM en el repositorio: no se puede comprobar')
        return 0
    from shapely.geometry import LineString, Point
    from shapely.ops import unary_union, linemerge

    ls = [LineString(l) for l in rayas()]
    red = unary_union(ls)
    fus = linemerge(red)
    tramos = list(fus.geoms) if fus.geom_type == 'MultiLineString' else [fus]
    puntas = []
    for t in tramos:
        c = list(t.coords)
        puntas += [Point(c[0]), Point(c[-1])]
    K = 111320.0
    huecos = [p for i, p in enumerate(puntas)
              if min((p.distance(q) * K for j, q in enumerate(puntas) if j != i),
                     default=9e9) > 20]
    print('  rayas municipales del mapa OSM del repositorio: %d tramos' % len(ls))
    print('  huecos (extremos que no empalman con nada)....: %d' % len(huecos))

    PAR = paradas()
    if calibrar:
        total = bien = 0
        for s in PAR:
            cerca = sorted((o for o in PAR if o is not s),
                           key=lambda o: metros(s['la'], s['lo'], o['la'], o['lo']))[:6]
            for o in cerca:
                if o['m'] == s['m'] or metros(s['la'], s['lo'], o['la'], o['lo']) > 1500:
                    continue
                total += 1
                if LineString([(s['lo'], s['la']), (o['lo'], o['la'])]).intersects(red):
                    bien += 1
        print('  parejas de paradas vecinas de municipio distinto (<1,5 km): %d' % total)
        print('  con una raya de verdad en medio............................: %d (%.1f%%)'
              % (bien, 100.0 * bien / max(total, 1)))
        print('  o sea: el dato de rayas pierde 1 de cada %d cruces. Por eso una'
              % max(1, round(total / max(total - bien, 1))))
        print('  ficha solo se cierra si ni una raya ni un hueco caen dentro del')
        print('  circulo que abarca las paradas en que se apoya.')
        return 0

    REG = os.path.join(RAIZ, 'datos', 'verificado.json')
    reg = json.load(io.open(REG, encoding='utf-8')) if os.path.exists(REG) else {}
    porRaya = (reg.get('municipio_por_raya') or {})
    if not ids:
        ids = sorted(k for k in porRaya if not k.startswith('_'))
        if not ids:
            print('  ninguna ficha cerrada por este metodo todavia')
            return 0

    LUG = lugares()
    fallos = 0
    for id in ids:
        p = LUG.get(id)
        if not p:
            print('  FALLO %s: no existe esa ficha' % id); fallos += 1; continue
        P = Point(p['lng'], p['lat'])
        cerca = sorted(PAR, key=lambda s: metros(p['lat'], p['lng'], s['la'], s['lo']))[:CUANTAS]
        lejos = metros(p['lat'], p['lng'], cerca[-1]['la'], cerca[-1]['lo'])
        d_raya = P.distance(red) * K
        d_hueco = min((P.distance(h) * K for h in huecos), default=9e9)
        cruces = [s for s in cerca
                  if LineString([(p['lng'], p['lat']), (s['lo'], s['la'])]).intersects(red)]
        munis = sorted({s['m'] for s in cerca})
        esperado = porRaya.get(id, {}).get('municipio')
        # La prueba es que no haya raya EN MEDIO. Lo que se exige ademas es
        # que ni una raya ni un hueco del dato caigan dentro del circulo que
        # abarca las paradas de apoyo: fuera de ese circulo ya no pueden
        # meterse entre el punto y ellas.
        bien = (not cruces and len(munis) == 1
                and d_raya > lejos and d_hueco > lejos
                and (esperado is None or munis[0] == esperado))
        print('  %s %-24s %s' % ('OK  ' if bien else 'FALLO', id, munis[0] if len(munis) == 1 else '/'.join(munis)))
        print('        %d paradas de apoyo hasta %d m · raya mas cercana %d m · hueco %d m · rayas en medio %d'
              % (len(cerca), round(lejos), round(d_raya), round(d_hueco), len(cruces)))
        if esperado and (len(munis) != 1 or munis[0] != esperado):
            print('        el registro dice «%s» y las paradas dicen «%s»' % (esperado, '/'.join(munis)))
        if not bien:
            fallos += 1
    print('  %s' % ('OK' if not fallos else '%d ficha(s) sin respaldo' % fallos))
    return 1 if fallos else 0


if __name__ == '__main__':
    sys.exit(main())
