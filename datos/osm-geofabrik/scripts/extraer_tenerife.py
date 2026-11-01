#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
extraer_tenerife.py - Tenerife Go
=================================
SOLO libreria estandar de Python 3 (sqlite3, struct, json, math, zipfile).

Entradas
  --gpkg     canary-islands-AAMMDD-free_gpkg.zip  (Geofabrik) o el .gpkg descomprimido
  --municip  20151123_municip_shp.zip             o carpeta con municip.shp + municip.dbf
  --out      carpeta de salida
  --gpkg-completo   ademas genera tenerife-osm-completo.gpkg (20 capas recortadas)

Salidas (en --out)
  municipios/municipios_tenerife.geojson               31 municipios WGS84, resolucion completa
  municipios/municipios_tenerife_simplificado.geojson  idem, Douglas-Peucker 5 m (solo para pintar)
  osm/osm_pois_tenerife.json                           POIs OSM de Tenerife (JSON indexado por id)
  osm/osm_lugares_tenerife.json                        nucleos y lugares OSM (JSON indexado por id)
  osm/resumen_extraccion.json                          recuentos + controles de calidad
  tenerife-osm-completo.gpkg                           (opcional)
"""
import argparse
import collections
import datetime
import glob
import hashlib
import json
import math
import os
import shutil
import sqlite3
import sys
import tempfile
import zipfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import geo_utils as G  # noqa: E402

# Bbox de validacion de la app (lat 27.9-28.65, lng -17.05 a -16.0). No contiene ninguna otra isla.
BBOX = (-17.05, 27.9, -16.0, 28.65)          # minLng, minLat, maxLng, maxLat
DIST_COSTA_M = 2000.0                         # puntos fuera de poligono: municipio mas cercano hasta 2 km
TOL_SIMPL_M = 5.0                             # Douglas-Peucker version 'simplificado' (metros, UTM)
DUP_M = 150.0                                 # mismo nombre normalizado a < 150 m -> posible duplicado

# Nombres oficiales INE (codigo de 5 cifras). Fuente: INE, relacion de municipios y codigos,
# consultada via Idescat "Codigos territoriales - Provincia 38" (pagina fechada 13/07/2026),
# https://idescat.cat/codis/?c=38&id=51&lang=es&n=6  (consulta 2026-09-27)
NOMBRES_INE = {
    '38001': 'Adeje', '38004': 'Arafo', '38005': 'Arico', '38006': 'Arona',
    '38010': 'Buenavista del Norte', '38011': 'Candelaria', '38012': 'Fasnia',
    '38015': 'Garachico', '38017': 'Granadilla de Abona', '38018': 'Guancha, La',
    '38019': 'Guía de Isora', '38020': 'Güímar', '38022': 'Icod de los Vinos',
    '38023': 'San Cristóbal de La Laguna', '38025': 'Matanza de Acentejo, La',
    '38026': 'Orotava, La', '38028': 'Puerto de la Cruz', '38031': 'Realejos, Los',
    '38032': 'Rosario, El', '38034': 'San Juan de la Rambla', '38035': 'San Miguel de Abona',
    '38038': 'Santa Cruz de Tenerife', '38039': 'Santa Úrsula', '38040': 'Santiago del Teide',
    '38041': 'Sauzal, El', '38042': 'Silos, Los', '38043': 'Tacoronte', '38044': 'Tanque, El',
    '38046': 'Tegueste', '38051': 'Victoria de Acentejo, La', '38052': 'Vilaflor de Chasna',
}


def nombre_visible(ine):
    """'Orotava, La' -> 'La Orotava' (solo reordena el articulo del nombre INE)."""
    if ', ' in ine:
        base, art = ine.rsplit(', ', 1)
        if art in ('La', 'El', 'Los', 'Las'):
            return art + ' ' + base
    return ine


# ------------------------------------------------------------
#  Clasificacion de POIs (fclass Geofabrik)
# ------------------------------------------------------------
# Nunca entran en el fichero de POIs (siguen en el GPKG completo)
EXCLUIR = set('''
bench waste_basket recycling recycling_glass recycling_paper recycling_clothes post_box telephone
comms_tower camera_surveillance vending_machine vending_parking vending_cigarette water_works
wastewater_plant car_wash prison water_well school kindergarten college university nursing_home
pedestrian_crossing stop street_lamp traffic_signals turning_circle motorway_junction speed_camera
railway_crossing mini_roundabout parking_bicycle bicycle_repair_station service dam slipway apron
helipad bus_stop tram_stop
'''.split())

# Entran aunque no tengan nombre (la clase por si sola es informacion util)
SIN_NOMBRE_OK = set('''
viewpoint observation_tower beach drinking_water toilet atm pharmacy hospital clinic police
fuel picnic_site camp_site caravan_site playground taxi marina ferry_terminal bus_station airport
lighthouse museum alpine_hut wilderness_hut dog_park
'''.split())

GRUPOS = collections.OrderedDict([
    ('playa', 'beach'),
    ('mirador', 'viewpoint observation_tower'),
    ('naturaleza', 'peak volcano cave_entrance spring cliff waterfall tree'),
    ('cultura', 'museum monument memorial ruins archaeological castle fort artwork attraction '
                'arts_centre theatre cinema library windmill water_mill lighthouse wayside_cross '
                'wayside_shrine town_hall courthouse public_building graveyard tower'),
    ('religioso', 'christian christian_catholic christian_evangelical christian_orthodox '
                  'christian_anglican christian_protestant buddhist muslim jewish hindu'),
    ('ocio', 'zoo park playground golf_course sports_centre sports_hall stadium pitch swimming_pool '
             'dog_park nightclub picnic_site track fitness_centre community_centre theme_park'),
    ('alojamiento', 'hotel hostel guesthouse motel chalet camp_site caravan_site alpine_hut '
                    'wilderness_hut'),
    ('gastronomia', 'restaurant cafe bar pub fast_food food_court biergarten'),
    ('salud', 'pharmacy hospital clinic doctors dentist veterinary'),
    ('transporte', 'fuel parking taxi marina ferry_terminal bus_station airport pier'),
    ('servicios', 'police fire_station post_office bank atm toilet drinking_water tourist_info '
                  'consulate car_rental bicycle_rental car_sharing laundry shelter fountain kiosk '
                  'travel_agent embassy'),
    ('compras', 'supermarket convenience mall marketplace department_store gift_shop bakery '
                'greengrocer butcher beverages clothes shoe_shop jeweller bookshop newsagent '
                'florist optician chemist sports_shop outdoor_shop toy_shop doityourself '
                'furniture_shop garden_centre computer_shop mobile_phone_shop stationery video_shop '
                'bicycle_shop car_dealership beauty_shop hairdresser general'),
])
GRUPO_DE = {}
for _g, _lst in GRUPOS.items():
    for _fc in _lst.split():
        GRUPO_DE.setdefault(_fc, _g)
ORDEN_GRUPO = {g: i for i, g in enumerate(list(GRUPOS) + ['otros'])}

# Correspondencia fclass -> categoria de la app SOLO cuando es 1:1 sin ambiguedad (sugerencia)
CAT_APP = {
    'beach': 'playa', 'viewpoint': 'mirador', 'observation_tower': 'mirador', 'museum': 'museo',
    'lighthouse': 'faros', 'pharmacy': 'farmacia', 'hospital': 'hospital',
    'veterinary': 'veterinario', 'fuel': 'gasolinera', 'parking': 'parking',
    'supermarket': 'supermercado', 'marketplace': 'mercadillo', 'camp_site': 'camping',
    'golf_course': 'golf', 'zoo': 'animales', 'marina': 'puerto_ocio',
    'peak': 'montana', 'volcano': 'montana',
}

POI_CAPAS = [
    ('gis_osm_pois_free', 'n', 'pois'), ('gis_osm_pois_a_free', 'a', 'pois_a'),
    ('gis_osm_pofw_free', 'n', 'pofw'), ('gis_osm_pofw_a_free', 'a', 'pofw_a'),
    ('gis_osm_natural_free', 'n', 'natural'), ('gis_osm_natural_a_free', 'a', 'natural_a'),
    ('gis_osm_transport_free', 'n', 'transport'), ('gis_osm_transport_a_free', 'a', 'transport_a'),
    ('gis_osm_traffic_free', 'n', 'traffic'), ('gis_osm_traffic_a_free', 'a', 'traffic_a'),
]
LUGAR_CAPAS = [('gis_osm_places_free', 'n', 'places'), ('gis_osm_places_a_free', 'a', 'places_a')]


# ------------------------------------------------------------
def bbox_intersecta(env):
    minx, maxx, miny, maxy = env
    return not (maxx < BBOX[0] or minx > BBOX[2] or maxy < BBOX[1] or miny > BBOX[3])


def bbox_dentro(env):
    minx, maxx, miny, maxy = env
    return minx >= BBOX[0] and maxx <= BBOX[2] and miny >= BBOX[1] and maxy <= BBOX[3]


def md5(path):
    h = hashlib.md5()
    with open(path, 'rb') as f:
        for b in iter(lambda: f.read(1 << 20), b''):
            h.update(b)
    return h.hexdigest()


def preparar_entradas(args, tmp):
    gp = args.gpkg
    if gp.lower().endswith('.zip'):
        with zipfile.ZipFile(gp) as z:
            m = [n for n in z.namelist() if n.lower().endswith('.gpkg')]
            if len(m) != 1:
                sys.exit('ERROR: el zip no contiene exactamente un .gpkg: %r' % m)
            z.extract(m[0], tmp)
            readme = [n for n in z.namelist() if n.upper().endswith('README')]
            fecha = ''
            if readme:
                txt = z.read(readme[0]).decode('utf-8', 'replace')
                for tok in txt.replace('\n', ' ').split():
                    tok = tok.strip('.,;:')
                    if tok[:2] == '20' and 'T' in tok and tok.endswith('Z'):
                        fecha = tok
            gp = os.path.join(tmp, m[0])
    else:
        fecha = ''
    mu = args.municip
    if mu.lower().endswith('.zip'):
        d = os.path.join(tmp, 'municip')
        with zipfile.ZipFile(mu) as z:
            z.extractall(d)
        mu = d
    shp = glob.glob(os.path.join(mu, '**', '*.shp'), recursive=True)
    if len(shp) != 1:
        sys.exit('ERROR: se esperaba un unico .shp municipal, hay %r' % shp)
    return gp, fecha, shp[0], shp[0][:-4] + '.dbf'


# ------------------------------------------------------------
#  MUNICIPIOS
# ------------------------------------------------------------
def cargar_municipios(shp, dbf):
    rings = G.read_shp_polygons(shp)
    fields, rows = G.read_dbf(dbf)
    if len(rings) != len(rows):
        sys.exit('ERROR: SHP (%d) y DBF (%d) no cuadran' % (len(rings), len(rows)))
    recs = []
    for rr, row in zip(rings, rows):
        if row is None or not rr:
            continue
        cod = row['COD_MUNI'].strip()
        if cod not in NOMBRES_INE:
            sys.exit('ERROR: COD_MUNI %r no es de Tenerife' % cod)
        recs.append({'cod': cod, 'nombre_shp': row['NOMBRE'], 'roque': int(row.get('ROQUE') or 0),
                     'area_gis': row['AREA_GIS'], 'rings': rr})
    return recs


def anillos_a_poligonos(rings):
    """Shapefile: exteriores en sentido horario (area<0), huecos antihorario (area>0)."""
    ext = [r for r in rings if G.ring_area_signed(r) < 0]
    holes = [r for r in rings if G.ring_area_signed(r) > 0]
    if not ext:                       # orientacion no estandar: todo exterior
        return [[r] for r in rings]
    polys = [[e] for e in ext]
    for h in holes:
        x, y = h[0]
        for p in polys:
            if G.point_in_rings(x, y, [p[0]]):
                p.append(h)
                break
        else:
            polys.append([h])
    return polys


def geojson_municipios(recs, tol=None):
    por = collections.OrderedDict()
    for r in recs:
        d = por.setdefault(r['cod'], {'polys': [], 'area': 0.0, 'nombre_shp': r['nombre_shp'],
                                      'roques': 0})
        d['polys'].extend(anillos_a_poligonos(r['rings']))
        d['area'] += r['area_gis']
        if r['roque'] > 0:
            d['roques'] += 1
    feats = []
    nv = 0
    for cod in sorted(por):
        d = por[cod]
        coords = []
        for poly in d['polys']:
            pr = []
            for k, ring in enumerate(poly):
                rr = G.simplify_ring(ring, tol) if tol else ring
                ll = []
                for e, n in rr:
                    lon, lat = G.utm28_to_wgs84(e, n)
                    p = [round(lon, 6), round(lat, 6)]
                    if not ll or ll[-1] != p:
                        ll.append(p)
                if ll[0] != ll[-1]:
                    ll.append(list(ll[0]))
                if len(ll) < 4:
                    continue
                a = G.ring_area_signed([tuple(p) for p in ll])
                if (k == 0 and a < 0) or (k > 0 and a > 0):     # RFC 7946: exterior CCW
                    ll.reverse()
                nv += len(ll)
                pr.append(ll)
            if pr:
                coords.append(pr)
        ine = NOMBRES_INE[cod]
        feats.append({'type': 'Feature', 'id': cod, 'properties': {
            'cod_ine': cod, 'nombre': nombre_visible(ine), 'nombre_ine': ine,
            'nombre_shp': d['nombre_shp'], 'area_km2': round(d['area'] / 1e6, 3),
            'partes': len(coords), 'partes_roque': d['roques']},
            'geometry': {'type': 'MultiPolygon', 'coordinates': coords}})
    return {'type': 'FeatureCollection', 'name': 'municipios_tenerife', 'features': feats}, nv


class IndiceMunicipal(object):
    def __init__(self, recs):
        self.polys = [(G.PolyIndex(r['rings']), r['cod']) for r in recs]
        self.grid = G.EdgeGrid(500.0)
        for r in recs:
            for ring in r['rings']:
                self.grid.add_ring(ring, r['cod'])

    def asignar(self, lon, lat):
        e, n = G.wgs84_to_utm28(lon, lat)
        hits = sorted({cod for (pi, cod) in self.polys if pi.contains(e, n)})
        if len(hits) == 1:
            return hits[0], 'poligono', 0
        if len(hits) > 1:
            return hits[0], 'solape', 0
        d, cod = self.grid.nearest(e, n, DIST_COSTA_M)
        if cod:
            return cod, 'costa', int(round(d))
        return None, 'mar', None


# ------------------------------------------------------------
#  OSM
# ------------------------------------------------------------
def columnas(con, t):
    return [r[1] for r in con.execute("pragma table_info('%s')" % t)]


def geometria_pt(blob):
    """-> (lng, lat, geom, bbox, m2, metodo_punto)"""
    t, c = G.gpkg_geom(blob)
    if t == 1:
        return c[0], c[1], 'punto', None, None, None
    polys = G.as_polys(t, c)
    (x, y), met = G.point_on_surface(polys)
    env = G.envelope(t, c)
    bb = [round(env[0], 6), round(env[2], 6), round(env[1], 6), round(env[3], 6)]
    return x, y, 'poligono', bb, int(round(G.area_m2_lonlat(polys))), met


def ordenar_fclass(fcs):
    return sorted(fcs, key=lambda f: (ORDEN_GRUPO[GRUPO_DE.get(f, 'otros')],
                                      0 if f in CAT_APP else 1))


def extraer(con, capas, idx, es_poi):
    feats = collections.OrderedDict()
    firma = {}
    descart = collections.Counter()
    for tabla, tipo, capa in capas:
        cols = columnas(con, tabla)
        ncol = 'name' if 'name' in cols else 'NULL'
        for blob, osm_id, fc, name in con.execute(
                'select geom, osm_id, fclass, %s from "%s"' % (ncol, tabla)):
            if blob is None:
                continue
            env = G.blob_envelope(blob)
            if env is None or not bbox_intersecta(env):
                continue
            name = (name or '').strip()
            if es_poi:
                if fc in EXCLUIR:
                    descart['excluida:' + fc] += 1
                    continue
                if not name and fc not in SIN_NOMBRE_OK:
                    descart['sin_nombre:' + fc] += 1
                    continue
            key = 'osm-%s%s' % (tipo, osm_id)
            h = hashlib.md5(blob).hexdigest()
            if key in feats and firma[key] != h:          # mismo id, otra geometria (way vs relation)
                k2 = key + '-b'
                while k2 in feats and firma[k2] != h:
                    k2 += 'b'
                key = k2
            if key in feats:
                f = feats[key]
                if fc not in f['fclass']:
                    f['fclass'].append(fc)
                if capa not in f['capas']:
                    f['capas'].append(capa)
                if not f['name'] and name:
                    f['name'] = name
                continue
            lng, lat, geom, bb, m2, met = geometria_pt(blob)
            cod, metodo, dist = idx.asignar(lng, lat)
            f = collections.OrderedDict()
            f['name'] = name
            f['fclass'] = [fc]
            f['lat'] = round(lat, 6)
            f['lng'] = round(lng, 6)
            f['geom'] = geom
            if geom == 'poligono':
                f['punto'] = met
                f['bbox'] = bb
                f['area_m2'] = m2
            f['ine'] = cod
            f['muni'] = nombre_visible(NOMBRES_INE[cod]) if cod else None
            f['muni_metodo'] = metodo
            if metodo == 'costa':
                f['muni_dist_m'] = dist
            f['capas'] = [capa]
            f['osm'] = ('node/%s' % osm_id) if tipo == 'n' else ('area/%s' % osm_id)
            feats[key] = f
            firma[key] = h
    # campos derivados
    for k, f in feats.items():
        f['fclass'] = ordenar_fclass(f['fclass'])
        if es_poi:
            f['grupo'] = GRUPO_DE.get(f['fclass'][0], 'otros')
            f['cat_app'] = next((CAT_APP[x] for x in f['fclass'] if x in CAT_APP), None)
    return feats, descart


def marcar_duplicados(feats):
    """Mismo nombre normalizado + mismo grupo a < DUP_M metros -> 'posible_dup' (no se fusiona)."""
    por = collections.defaultdict(list)
    for k, f in feats.items():
        nn = G.norm_nombre(f['name'])
        if nn:
            por[nn].append(k)
    n = 0
    for nn, ks in por.items():
        if len(ks) < 2:
            continue
        for i in range(len(ks)):
            for j in range(i + 1, len(ks)):
                a, b = feats[ks[i]], feats[ks[j]]
                if a.get('grupo') != b.get('grupo'):
                    continue            # mismo nombre pero otra cosa (p.ej. hotel y su parking)
                if G.haversine_m(a['lng'], a['lat'], b['lng'], b['lat']) < DUP_M:
                    a.setdefault('posible_dup', []).append(ks[j])
                    b.setdefault('posible_dup', []).append(ks[i])
                    n += 1
    return n


ORDEN_CAMPOS = ['name', 'grupo', 'cat_app', 'fclass', 'lat', 'lng', 'ine', 'muni', 'muni_metodo',
                'muni_dist_m', 'geom', 'punto', 'bbox', 'area_m2', 'capas', 'osm', 'posible_dup']


def escribir_json_indexado(path, meta, clave, feats):
    """Un registro por linea: legible, 'grepeable' y JSON valido."""
    with open(path, 'w', encoding='utf-8') as fo:
        fo.write('{"_meta": ')
        fo.write(json.dumps(meta, ensure_ascii=False, indent=1))
        fo.write(',\n"%s": {\n' % clave)
        ks = list(feats)
        for i, k in enumerate(ks):
            f = feats[k]
            o = collections.OrderedDict((c, f[c]) for c in ORDEN_CAMPOS if c in f)
            fo.write(json.dumps(k) + ': ' + json.dumps(o, ensure_ascii=False, separators=(',', ':')))
            fo.write(',\n' if i < len(ks) - 1 else '\n')
        fo.write('}}\n')


# ------------------------------------------------------------
#  GPKG COMPLETO RECORTADO
# ------------------------------------------------------------
def gpkg_completo(src, dst):
    shutil.copyfile(src, dst)
    con = sqlite3.connect(dst)
    tabs = [t for (t,) in con.execute(
        "select table_name from gpkg_contents where data_type='features' order by table_name")]
    res = collections.OrderedDict()
    now = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.000Z')
    for t in tabs:
        borrar = []
        ext = [1e9, -1e9, 1e9, -1e9]
        n = 0
        for fid, blob in con.execute('select fid, geom from "%s"' % t):
            env = G.blob_envelope(blob) if blob else None
            ok = env is not None and bbox_intersecta(env)
            if ok and t == 'gis_osm_adminareas_a_free' and not bbox_dentro(env):
                ok = False          # provincia / comunidad autonoma: no son de Tenerife
            if ok:
                n += 1
                ext = [min(ext[0], env[0]), max(ext[1], env[1]), min(ext[2], env[2]),
                       max(ext[3], env[3])]
            else:
                borrar.append((fid,))
        con.executemany('delete from "%s" where fid=?' % t, borrar)
        if n:
            con.execute('update gpkg_contents set min_x=?, max_x=?, min_y=?, max_y=?, '
                        'last_change=? where table_name=?', (ext[0], ext[1], ext[2], ext[3], now, t))
        res[t] = n
        con.commit()
    con.execute('vacuum')
    chk = con.execute('pragma integrity_check').fetchone()[0]
    ogr = dict(con.execute('select table_name, feature_count from gpkg_ogr_contents'))
    real = {t: con.execute('select count(*) from "%s"' % t).fetchone()[0] for t in tabs}
    appid = con.execute('pragma application_id').fetchone()[0]
    con.close()
    return res, {'integrity_check': chk, 'application_id': hex(appid),
                 'ogr_counts_ok': all(ogr.get(t) == real[t] for t in tabs)}


# ------------------------------------------------------------
#  CONTROLES
# ------------------------------------------------------------
def control_admin_osm(con, feats_list, recs):
    """Compara la asignacion municipal oficial con los limites OSM admin_level8 (control externo)."""
    cod_por_nombre = {G.norm_nombre(nombre_visible(v)): k for k, v in NOMBRES_INE.items()}
    cod_por_nombre['vilaflor'] = '38052'          # OSM lo nombra 'Vilaflor' (INE: Vilaflor de Chasna)
    idx = []
    cent = {}
    for blob, name in con.execute("select geom, name from gis_osm_adminareas_a_free "
                                  "where fclass='admin_level8'"):
        env = G.blob_envelope(blob)
        if not bbox_dentro(env):
            continue
        cod = cod_por_nombre.get(G.norm_nombre(name))
        if cod is None:
            continue
        t, c = G.gpkg_geom(blob)
        polys = G.as_polys(t, c)
        rings = [r for p in polys for r in p]
        idx.append((G.PolyIndex(rings), cod))
        # centroide OSM en UTM para comparar con el oficial
        sx = sy = sa = 0.0
        for p in polys:
            up = [[G.wgs84_to_utm28(x, y) for x, y in r] for r in p]
            cx, cy, a = G.polygon_centroid(up)
            sx += cx * a
            sy += cy * a
            sa += a
        cent[cod] = (sx / sa, sy / sa, sa)
    # centroides oficiales
    ofi = collections.defaultdict(lambda: [0.0, 0.0, 0.0])
    for r in recs:
        for p in anillos_a_poligonos(r['rings']):
            cx, cy, a = G.polygon_centroid(p)
            o = ofi[r['cod']]
            o[0] += cx * a
            o[1] += cy * a
            o[2] += a
    desv = {}
    for cod, (x, y, a) in cent.items():
        o = ofi[cod]
        desv[cod] = {'dist_centroides_m': round(math.hypot(x - o[0] / o[2], y - o[1] / o[2]), 1),
                     'area_osm_km2': round(a / 1e6, 3), 'area_oficial_km2': round(o[2] / 1e6, 3)}
    iguales = distintos = sin_osm = 0
    ejemplos = []
    for k, f in feats_list:
        if f['muni_metodo'] != 'poligono':
            continue
        hit = [cod for (pi, cod) in idx if pi.contains(f['lng'], f['lat'])]
        if not hit:
            sin_osm += 1
        elif f['ine'] in hit:
            iguales += 1
        else:
            distintos += 1
            if len(ejemplos) < 15:
                ejemplos.append({'id': k, 'name': f['name'], 'oficial': f['ine'], 'osm': hit[0]})
    return {'municipios_osm_encontrados': len(idx), 'coinciden': iguales,
            'difieren': distintos, 'fuera_de_limites_osm': sin_osm,
            'ejemplos_difieren': ejemplos, 'por_municipio': desv}


def validar(feats, nombre):
    ids = list(feats)
    fuera = [k for k, f in feats.items()
             if not (BBOX[1] <= f['lat'] <= BBOX[3] and BBOX[0] <= f['lng'] <= BBOX[2])]
    nan = [k for k, f in feats.items() if f['lat'] != f['lat'] or f['lng'] != f['lng']]
    comillas = [k for k, f in feats.items() if '"' in f['name']]
    raros = [k for k, f in feats.items() if any(ch in f['name'] for ch in '\\\n\r\t<>`')]
    return {'fichero': nombre, 'registros': len(ids), 'ids_unicos': len(set(ids)) == len(ids),
            'fuera_bbox': fuera, 'nan': nan, 'nombres_con_comilla_doble': comillas,
            'nombres_con_caracteres_de_riesgo': raros}


# ------------------------------------------------------------
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--gpkg', required=True)
    ap.add_argument('--municip', required=True)
    ap.add_argument('--out', required=True)
    ap.add_argument('--gpkg-completo', action='store_true')
    args = ap.parse_args()
    tmp = tempfile.mkdtemp(prefix='tf_')
    try:
        gpkg, fecha_osm, shp, dbf = preparar_entradas(args, tmp)
        os.makedirs(os.path.join(args.out, 'municipios'), exist_ok=True)
        os.makedirs(os.path.join(args.out, 'osm'), exist_ok=True)
        hoy = datetime.date.today().isoformat()
        resumen = collections.OrderedDict()

        # ---------- municipios
        recs = cargar_municipios(shp, dbf)
        cods = sorted({r['cod'] for r in recs})
        if len(cods) != 31:
            sys.exit('ERROR: se esperaban 31 municipios, hay %d' % len(cods))
        fc_full, nv_full = geojson_municipios(recs)
        fc_simp, nv_simp = geojson_municipios(recs, TOL_SIMPL_M)
        meta_mun = {'fuente': os.path.basename(args.municip) + ' (DBF fechado 2015-11-23)',
                    'crs_origen': 'WGS 84 / UTM huso 28N (segun .prj)',
                    'transformacion': 'UTM 28N -> WGS84 lon/lat, series de Kruger (stdlib), 6 decimales',
                    'nombres': 'nombre_ine = INE (via Idescat, consulta 2026-09-27); '
                               'nombre = mismo nombre con el articulo delante; '
                               'nombre_shp = valor original del DBF (sin tildes)',
                    'generado': hoy}
        for fc, nv, nom, extra in (
                (fc_full, nv_full, 'municipios_tenerife.geojson', 'resolucion completa'),
                (fc_simp, nv_simp, 'municipios_tenerife_simplificado.geojson',
                 'Douglas-Peucker %.0f m en UTM; SOLO para pintar, no para punto-en-poligono'
                 % TOL_SIMPL_M)):
            fc['metadata'] = dict(meta_mun, version=extra, vertices=nv)
            with open(os.path.join(args.out, 'municipios', nom), 'w', encoding='utf-8') as fo:
                json.dump(fc, fo, ensure_ascii=False, separators=(',', ':'))
        resumen['municipios'] = {'registros_shp': len(recs), 'municipios': len(cods),
                                 'vertices_completo': nv_full, 'vertices_simplificado': nv_simp,
                                 'area_total_km2': round(sum(r['area_gis'] for r in recs) / 1e6, 2)}

        idx = IndiceMunicipal(recs)
        con = sqlite3.connect(gpkg)

        # ---------- recuento por capa (Tenerife)
        capas = collections.OrderedDict()
        for (t,) in con.execute("select table_name from gpkg_contents order by table_name"):
            cols = columnas(con, t)
            nn = 'name' if 'name' in cols else 'NULL'
            cnt = collections.Counter()
            for blob, fc, name in con.execute('select geom, fclass, %s from "%s"' % (nn, t)):
                env = G.blob_envelope(blob) if blob else None
                if env and bbox_intersecta(env):
                    cnt[fc] += 1
            capas[t.replace('gis_osm_', '').replace('_free', '')] = dict(cnt.most_common())
        resumen['osm_capas_tenerife'] = capas

        # ---------- POIs
        pois, desc = extraer(con, POI_CAPAS, idx, True)
        ndup = marcar_duplicados(pois)
        # ---------- lugares
        lug, _ = extraer(con, LUGAR_CAPAS, idx, False)

        base_meta = collections.OrderedDict([
            ('fuente', 'OpenStreetMap - extracto Geofabrik canary-islands (formato free GPKG)'),
            ('datos_osm_a', fecha_osm),
            ('licencia', 'ODbL 1.0 - atribucion obligatoria: (c) OpenStreetMap contributors'),
            ('recorte', 'bbox lng %.2f..%.2f, lat %.2f..%.2f (solo contiene Tenerife)'
             % (BBOX[0], BBOX[2], BBOX[1], BBOX[3])),
            ('municipio', 'punto-en-poligono contra %s en UTM 28N; fuera de poligono -> '
             'municipio mas cercano hasta %d m (muni_metodo=costa); mas lejos -> mar'
             % (os.path.basename(args.municip), DIST_COSTA_M)),
            ('generado', hoy),
            ('aviso', 'OSM NO es fuente oficial: usar para contrastar y localizar candidatos. '
                      'Nada entra en la app sin verificar contra fuente oficial.'),
        ])
        m1 = collections.OrderedDict(base_meta)
        m1['registros'] = len(pois)
        m1['campos'] = collections.OrderedDict([
            ('name', 'nombre OSM (puede ir vacio en clases utiles sin nombre)'),
            ('grupo', 'agrupacion generica de este fichero'),
            ('cat_app', 'categoria de la app SUGERIDA solo para correspondencias 1:1; null si ambigua'),
            ('fclass', 'clases Geofabrik (varias si el objeto lleva varias etiquetas); la 1a manda'),
            ('lat/lng', 'WGS84, 6 decimales; en poligonos es un punto garantizado dentro'),
            ('ine/muni', 'codigo INE y nombre del municipio'),
            ('muni_metodo', 'poligono | costa (con muni_dist_m) | mar (sin municipio)'),
            ('geom', 'punto | poligono'), ('punto', 'centroide | interior (solo poligonos)'),
            ('bbox', '[minLng,minLat,maxLng,maxLat] (solo poligonos)'),
            ('area_m2', 'superficie aproximada (solo poligonos)'),
            ('capas', 'capas Geofabrik de origen'),
            ('osm', 'node/ID | area/ID (area = way o relation; el extracto free no lo distingue)'),
            ('posible_dup', 'ids con mismo nombre y mismo grupo a menos de %d m (no se ha fusionado nada)'
             % DUP_M)])
        escribir_json_indexado(os.path.join(args.out, 'osm', 'osm_pois_tenerife.json'),
                               m1, 'pois', pois)
        m2 = collections.OrderedDict(base_meta)
        m2['registros'] = len(lug)
        m2['nota'] = ('Poblacion OSM omitida a proposito (dato perecedero). '
                      'Mismos campos que osm_pois_tenerife.json salvo grupo/cat_app.')
        escribir_json_indexado(os.path.join(args.out, 'osm', 'osm_lugares_tenerife.json'),
                               m2, 'lugares', lug)

        # ---------- resumen POIs
        resumen['pois'] = collections.OrderedDict([
            ('total', len(pois)),
            ('con_nombre', sum(1 for f in pois.values() if f['name'])),
            ('por_grupo', dict(collections.Counter(f['grupo'] for f in pois.values()).most_common())),
            ('por_cat_app', dict(collections.Counter(f['cat_app'] for f in pois.values()
                                                     if f['cat_app']).most_common())),
            ('por_fclass', dict(collections.Counter(f['fclass'][0] for f in pois.values())
                                .most_common())),
            ('por_municipio', dict(collections.Counter(f['muni'] or '(mar)' for f in pois.values())
                                   .most_common())),
            ('muni_metodo', dict(collections.Counter(f['muni_metodo'] for f in pois.values()))),
            ('punto_poligono', dict(collections.Counter(f.get('punto') for f in pois.values()
                                                        if f['geom'] == 'poligono'))),
            ('pares_posible_dup', ndup),
            ('descartados', dict(desc.most_common())),
        ])
        resumen['lugares'] = collections.OrderedDict([
            ('total', len(lug)),
            ('por_fclass', dict(collections.Counter(f['fclass'][0] for f in lug.values())
                                .most_common())),
            ('muni_metodo', dict(collections.Counter(f['muni_metodo'] for f in lug.values()))),
        ])
        # ---------- controles
        resumen['validacion'] = [validar(pois, 'osm_pois_tenerife.json'),
                                 validar(lug, 'osm_lugares_tenerife.json')]
        resumen['control_limites_osm'] = control_admin_osm(
            con, list(pois.items()) + list(lug.items()), recs)
        con.close()

        # ---------- GPKG completo
        if args.gpkg_completo:
            dst = os.path.join(args.out, 'tenerife-osm-completo.gpkg')
            res, chk = gpkg_completo(gpkg, dst)
            resumen['gpkg_completo'] = {'capas': res, 'controles': chk,
                                        'bytes': os.path.getsize(dst)}

        # ---------- manifiesto md5
        man = collections.OrderedDict()
        for root, _, files in os.walk(args.out):
            for fn in sorted(files):
                p = os.path.join(root, fn)
                if fn != 'resumen_extraccion.json':
                    man[os.path.relpath(p, args.out)] = {'bytes': os.path.getsize(p), 'md5': md5(p)}
        resumen['manifiesto'] = man
        with open(os.path.join(args.out, 'osm', 'resumen_extraccion.json'), 'w',
                  encoding='utf-8') as fo:
            json.dump(resumen, fo, ensure_ascii=False, indent=1)
        v = resumen['validacion']
        print('POIs %d | lugares %d | ids unicos %s/%s | fuera bbox %d/%d | municipios 31 OK'
              % (len(pois), len(lug), v[0]['ids_unicos'], v[1]['ids_unicos'],
                 len(v[0]['fuera_bbox']), len(v[1]['fuera_bbox'])))
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == '__main__':
    main()
