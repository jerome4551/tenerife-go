#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
mapa_base.py — el mapa base que viaja DENTRO de la app, recortado del detallado.

    python3 tools/mapa_base.py              # escribe mapa/tenerife-base.pmtiles
    python3 tools/mapa_base.py --comprobar  # el del repositorio, ¿es el que sale del detallado?

POR QUE EXISTE
  La app se abrio en un avion y salio el mapa en blanco. Guardar las teselas
  que el usuario ya ha mirado -lo que hace el service worker- arregla ese
  caso, pero no el de alguien que instala la app y se va al monte. Para eso el
  mapa tiene que venir dentro: este, en el precache del service worker.

DE DONDE SALE (desde el 31 de octubre de 2026, por la tarde)
  De mapa/tenerife-osm.pmtiles, el mapa detallado que ya esta en el
  repositorio (OpenStreetMap, con el esquema de Protomaps): las mismas
  teselas de z6 a z13, con solo una parte de lo que llevan. La geometria se
  copia tal cual, byte a byte: no se recorta, no se simplifica y no se mueve
  ni una coordenada. Por eso la costa es la misma en el mapa base, en el
  detallado y en el 3D, y el estilo tambien (estiloIslaBase llama a
  estiloIslaDetallada, en index.html).

  Jerome, 31 de octubre de 2026: «verifica la carta completa 2D de la mapa
  offline. La quiero de qualidad superior en cada rincón». El de antes se
  hacia con la costa de GSHHG (1.542 vertices: de cerca, a tramos rectos, y
  con las calas comidas, de 250 a 500 m) y con los trazados de las 183 lineas
  de guagua del GTFS de TITSA como carreteras: todas iguales, solo por donde
  pasa una guagua, y con rectas donde un trazado del GTFS salta (al norte de
  Adeje dibujaba una cuña de dos rectas que no es ninguna carretera). Pesaba
  1,06 MB, casi todo esas lineas sin simplificar en los zooms bajos. Medido
  el mismo dia, a z13 y en toda la isla (doce cuadros de 1.600 x 1.600 px):
  el mar del mapa base de antes se separaba del de OpenStreetMap en 252.881
  pixeles; el de este, en 4.431, que son rotulos y lineas de barco sobre el
  agua, no costa. Este pesa 1,09 MB.

QUE LLEVA (CAPAS) Y QUE NO
  earth    la tierra y los acantilados                  todo
  water    embalses, balsas, lagunas, piscinas...       los poligonos menos el
                                                        mar, que es el fondo
  landuse  el Parque Nacional                           solo se pinta su borde
  roads    autopistas y carreteras, barcos, teleferico,
           pistas del aeropuerto; y en z13 las calles   (residential,
           y las calles peatonales                      unclassified,
                                                        living_street, road;
                                                        y pedestrian)
  places   ciudades, pueblos, aldeas, caserios, barrios y parajes
  pois     los picos con su altitud, las playas y el Parque Nacional
  NO lleva senderos, pistas, aceras, caminos de servicio, edificios, el resto de los
           usos del suelo, los limites municipales ni los barrancos: eso es
           el mapa detallado, que se descarga desde la ⓘ (12 MB).
  De cada rasgo, solo las propiedades que mira el estilo (PROPIEDADES).

ZOOM
  z6 a z13, como antes. De z14 para arriba el renderizador reescala el z13
  (maxDataZoom sale de la cabecera del propio fichero).

SI SE REHACE EL DETALLADO
  Hay que rehacer este (y nombres_chinos_mapa.py): el workflow
  generar-mapa.yml lo hace al hacer commit del detallado, y --comprobar, que
  pasa en tools/auditar.sh, lo canta si no se hace.

LA HUELLA EN sw.js
  El service worker sirve este fichero de su precache, que solo se rehace
  cuando cambia sw.js. Por eso sw.js lleva su huella (MAPA_BASE_HUELLA, los
  16 primeros caracteres de su sha256): la escribe esta herramienta al
  generar el mapa y la coteja --comprobar. Sin ella, un mapa base nuevo no
  llegaria a quien ya tiene la app instalada. Sale el mismo fichero
  byte a byte cada vez (gzip sin la hora dentro, el JSON ordenado). Si alguna
  vez un zlib distinto comprimiera distinto, --comprobar lo dice y compara el
  contenido: el de cada tesela, sin comprimir.

Sin paquetes: lee y escribe con tools/pmtiles_ligero.py.
"""
import hashlib
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pmtiles_ligero as pl

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FUENTE = os.path.join(RAIZ, 'mapa', 'tenerife-osm.pmtiles')
SALIDA = os.path.join(RAIZ, 'mapa', 'tenerife-base.pmtiles')
Z_MIN, Z_MAX = 6, 13
# La caja de navegacion del mapa de la app, ni mas ni menos (la del detallado).
BBOX = (-16.98, 27.90, -16.08, 28.65)
CENTRO = (10, -16.53, 28.275)
TOPE_BYTES = 1500000
SW = os.path.join(RAIZ, 'sw.js')
HUELLA_RE = re.compile(r"^const MAPA_BASE_HUELLA = '([0-9a-f]{16})';$", re.M)

# Los diez idiomas de la app, con las claves del esquema de Protomaps (el chino,
# zh-Hans y zh-Hant; en chino el estilo pinta los pueblos con MAPA_NOMBRES_ZH).
IDIOMAS = ('es', 'en', 'fr', 'de', 'it', 'nl', 'bg', 'pl', 'zh-Hans', 'zh-Hant')
PROPIEDADES = frozenset(('kind', 'kind_detail', 'min_zoom', 'name', 'ref', 'is_tunnel', 'is_bridge',
                         'is_link', 'population', 'population_rank', 'elevation')
                        + tuple('name:' + i for i in IDIOMAS))
CAPAS = ('earth', 'water', 'landuse', 'roads', 'places', 'pois')
VIAS = frozenset(('highway', 'major_road', 'ferry', 'aerialway', 'aeroway'))
CALLES = frozenset(('residential', 'unclassified', 'living_street', 'road'))
# Las calles peatonales (en Protomaps van con los caminos, kind=path): sin ellas, el casco de La
# Laguna, que es casi todo peatonal, salia a huecos.
PEATONALES = frozenset(('pedestrian',))
Z_CALLES = 13
# Todos los nombres de lugar que pinta el estilo: de los pueblos a los parajes (la cumbre del Teide,
# La Rambleta, las Cañadas...), que salen de z14 para arriba. Son poco peso y son los rincones.
SITIOS = frozenset(('city', 'town', 'village', 'hamlet', 'suburb', 'quarter', 'neighbourhood',
                    'locality', 'isolated_dwelling', 'farm'))
PUNTOS = frozenset(('peak', 'beach', 'national_park'))
# Una tesela de mar abierto al suroeste de la isla (z12): en el base no lleva nada.
MAR_ABIERTO = (12, 1859, 1719)


def entra(capa, z, tipo, p):
    """¿Va este rasgo al mapa base? p: sus propiedades."""
    k = p.get('kind')
    if capa == 'earth':
        return True
    if capa == 'water':
        return tipo == 3 and k != 'ocean'
    if capa == 'landuse':
        return k == 'national_park'
    if capa == 'roads':
        if k in VIAS:
            return True
        if z < Z_CALLES:
            return False
        d = p.get('kind_detail')
        return (k == 'minor_road' and d in CALLES) or (k == 'path' and d in PEATONALES)
    if capa == 'places':
        return p.get('kind_detail') in SITIOS
    if capa == 'pois':
        return k in PUNTOS
    return False


def recortar(buf, z, cuenta):
    """Los bytes MVT de la tesela del base, a partir de los de la detallada (b'' si no queda nada)."""
    salida = []
    for nombre, claves, valores, rasgos, ext in pl.capas_crudas(buf):
        if nombre not in CAPAS:
            continue
        nclaves, nvalores, iclave, ivalor, nuevos = [], [], {}, {}, []
        for w in rasgos:
            tags, tipo, geo = pl.rasgo_crudo(w)
            p = {claves[tags[i]]: pl.valor(valores[tags[i + 1]]) for i in range(0, len(tags) - 1, 2)}
            if not entra(nombre, z, tipo, p):
                continue
            t = []
            for i in range(0, len(tags) - 1, 2):
                k, v = claves[tags[i]], valores[tags[i + 1]]
                if k not in PROPIEDADES:
                    continue
                if k not in iclave:
                    iclave[k] = len(nclaves)
                    nclaves.append(k)
                if v not in ivalor:
                    ivalor[v] = len(nvalores)
                    nvalores.append(v)
                t += [iclave[k], ivalor[v]]
            r = (pl.campo_bytes(2, b''.join(pl.vint(x) for x in t)) if t else b'')
            nuevos.append(r + pl.campo_vint(3, tipo) + pl.campo_bytes(4, geo))
            cuenta[nombre] = cuenta.get(nombre, 0) + 1
        if not nuevos:
            continue
        capa = pl.campo_vint(15, 2) + pl.campo_bytes(1, nombre.encode('utf-8'))
        capa += b''.join(pl.campo_bytes(2, r) for r in nuevos)
        capa += b''.join(pl.campo_bytes(3, k.encode('utf-8')) for k in nclaves)
        capa += b''.join(pl.campo_bytes(4, v) for v in nvalores)
        capa += pl.campo_vint(5, ext)
        salida.append(pl.campo_bytes(3, capa))
    return b''.join(salida)


def sha256(ruta):
    h = hashlib.sha256()
    with open(ruta, 'rb') as f:
        for trozo in iter(lambda: f.read(1 << 20), b''):
            h.update(trozo)
    return h.hexdigest()


def construir():
    """{tile_id: MVT}, los metadatos y las cuentas por capa."""
    if not os.path.exists(FUENTE):
        raise SystemExit('ABORTADO: no esta %s, que es de donde sale el mapa base' % os.path.relpath(FUENTE, RAIZ))
    src = pl.PMTiles(FUENTE)
    try:
        mf = src.metadatos()
        capas_f = sorted(v.get('id') for v in mf.get('vector_layers', []))
        # Con otro esquema el mapa saldria vacio sin dar error: se para.
        for c in ('earth', 'roads', 'places'):
            if c not in capas_f:
                raise SystemExit('ABORTADO: %s no trae la capa %s (¿no es el esquema de Protomaps?): %s'
                                 % (os.path.relpath(FUENTE, RAIZ), c, ', '.join(capas_f)))
        teselas, cuenta = {}, {}
        for z, x, y, buf in src.todas():
            if Z_MIN <= z <= Z_MAX:
                mvt = recortar(buf, z, cuenta)
                if mvt:
                    teselas[pl.zxy_a_id(z, x, y)] = mvt
    finally:
        src.cerrar()
    campos = {
        'earth': ['kind', 'min_zoom', 'name'],
        'water': ['kind', 'kind_detail', 'min_zoom', 'name'],
        'landuse': ['kind', 'min_zoom', 'name'],
        'roads': ['kind', 'kind_detail', 'min_zoom', 'name', 'ref', 'is_tunnel', 'is_bridge', 'is_link'],
        'places': ['kind', 'kind_detail', 'min_zoom', 'name', 'population', 'population_rank'],
        'pois': ['kind', 'min_zoom', 'name', 'elevation'],
    }
    meta = {
        'name': 'Tenerife Go — mapa base',
        'description': ('Recorte ligero de mapa/tenerife-osm.pmtiles (OpenStreetMap, esquema de Protomaps): '
                        'la tierra y la costa, las carreteras, los pueblos, los picos y las playas, de z%d a z%d. '
                        'Lo hace tools/mapa_base.py.' % (Z_MIN, Z_MAX)),
        'attribution': mf.get('attribution') or '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap</a>',
        'type': 'baselayer',
        'vector_layers': [{'id': c, 'fields': {k: 'String' for k in campos[c]}} for c in CAPAS if cuenta.get(c)],
        'tgo:fuente': {
            'fichero': 'mapa/tenerife-osm.pmtiles',
            'sha256': sha256(FUENTE),
            'version': mf.get('version'),
            'datos_osm_hasta': mf.get('planetiler:osm:osmosisreplicationtime'),
        },
    }
    return teselas, meta, cuenta


def escribir(ruta, teselas, meta):
    return pl.escribir_pmtiles(ruta, teselas, meta, {'zmin': Z_MIN, 'zmax': Z_MAX, 'bbox': BBOX, 'centro': CENTRO})


def huella_en_sw():
    """La huella que lleva sw.js, o None si no esta la linea (una sola vez)."""
    m = HUELLA_RE.findall(open(SW, encoding='utf-8').read())
    return m[0] if len(m) == 1 else None


def escribir_huella(h):
    s = open(SW, encoding='utf-8').read()
    if len(HUELLA_RE.findall(s)) != 1:
        raise SystemExit('ABORTADO: sw.js no tiene una (y solo una) linea «const MAPA_BASE_HUELLA = \'...\';»')
    nuevo = HUELLA_RE.sub("const MAPA_BASE_HUELLA = '%s';" % h, s)
    if nuevo != s:
        with open(SW, 'w', encoding='utf-8') as f:
            f.write(nuevo)


def comprobar():
    fallos = []

    def mal(m):
        fallos.append(m)
        print('  FALLO: ' + m)

    def ok(m):
        print('  ok  ' + m)

    if not os.path.exists(SALIDA):
        print('  FALLO: no esta %s' % os.path.relpath(SALIDA, RAIZ))
        return 1
    teselas, meta, cuenta = construir()
    tmp = SALIDA + '.comprobar'
    try:
        escribir(tmp, teselas, meta)
        igual = open(tmp, 'rb').read() == open(SALIDA, 'rb').read()
    finally:
        if os.path.exists(tmp):
            os.remove(tmp)

    p = pl.PMTiles(SALIDA)
    try:
        c = p.cab
        hay = {pl.id_a_zxy(t): None for t, _, _ in p.entradas()}
        if igual:
            ok('es el que sale de mapa/tenerife-osm.pmtiles, byte a byte (%d teselas)' % len(teselas))
        else:
            # ¿el mismo contenido, comprimido de otra forma?
            dentro = {pl.zxy_a_id(z, x, y): d for z, x, y, d in p.todas()}
            if dentro == teselas and p.metadatos() == json.loads(json.dumps(meta, ensure_ascii=False)):
                ok('mismas teselas y metadatos que salen del detallado (comprimidos de otra forma: otro zlib)')
            else:
                mal('no es el que sale de mapa/tenerife-osm.pmtiles: python3 tools/mapa_base.py '
                    '(¿se rehizo el detallado sin rehacer el base?)')
        if (c['zmin'], c['zmax'], c['tipo']) == (Z_MIN, Z_MAX, 1):
            ok('z%d a z%d, teselas vectoriales (MVT)' % (Z_MIN, Z_MAX))
        else:
            mal('cabecera: zoom %s-%s, tipo %s' % (c['zmin'], c['zmax'], c['tipo']))
        caja = (c['lon_min'], c['lat_min'], c['lon_max'], c['lat_max'])
        if all(abs(a - b) < 1e-6 for a, b in zip(caja, BBOX)):
            ok('la caja es la de la app: %s' % ', '.join('%.2f' % v for v in caja))
        else:
            mal('la caja es %s y la de la app %s' % (caja, BBOX))
        m = p.metadatos()
        if 'OpenStreetMap' in (m.get('attribution') or ''):
            ok('los metadatos dan el credito a OpenStreetMap')
        else:
            mal('los metadatos no nombran a OpenStreetMap: %r' % m.get('attribution'))
        capas = sorted(v['id'] for v in m.get('vector_layers', []))
        if set(capas) <= set(CAPAS) and {'earth', 'roads', 'places'} <= set(capas):
            ok('capas: %s' % ', '.join(capas))
        else:
            mal('capas: %s' % ', '.join(capas))
        if MAR_ABIERTO not in hay:
            ok('una tesela de mar abierto no ocupa sitio (z%d/%d/%d)' % MAR_ABIERTO)
        else:
            mal('la tesela de mar abierto z%d/%d/%d lleva algo' % MAR_ABIERTO)
        # lo que no tiene que ir: senderos, edificios, el mar como poligono
        prohibido = {}
        for z, x, y, d in p.todas():
            for nombre, claves, valores, rasgos, _ in pl.capas_crudas(d):
                if nombre not in CAPAS:
                    prohibido['capa ' + nombre] = prohibido.get('capa ' + nombre, 0) + 1
                    continue
                for w in rasgos:
                    tags, tipo, _ = pl.rasgo_crudo(w)
                    q = {claves[tags[i]]: pl.valor(valores[tags[i + 1]]) for i in range(0, len(tags) - 1, 2)}
                    if not entra(nombre, z, tipo, q):
                        k = '%s/%s' % (nombre, q.get('kind'))
                        prohibido[k] = prohibido.get(k, 0) + 1
                    sobra = set(q) - PROPIEDADES
                    if sobra:
                        k = 'propiedad ' + ','.join(sorted(sobra))
                        prohibido[k] = prohibido.get(k, 0) + 1
        if not prohibido:
            ok('ni senderos, ni edificios, ni el mar, ni propiedades que el estilo no mira')
        else:
            mal('lleva lo que no tiene que llevar: %s' % prohibido)
        h, en_sw = sha256(SALIDA)[:16], huella_en_sw()
        if en_sw == h:
            ok('sw.js lleva su huella (%s): un mapa base nuevo llega a quien ya tiene la app' % h)
        else:
            mal('sw.js lleva la huella %s y la del mapa base es %s: python3 tools/mapa_base.py' % (en_sw, h))
        b = os.path.getsize(SALIDA)
        if b <= TOPE_BYTES:
            ok('%.2f MB: cabe en el precache (tope %.1f MB)' % (b / 1e6, TOPE_BYTES / 1e6))
        else:
            mal('%.2f MB pasa del tope de %.1f MB del precache' % (b / 1e6, TOPE_BYTES / 1e6))
        print('  rasgos por capa: ' + ', '.join('%s %d' % (k, cuenta[k]) for k in CAPAS if k in cuenta))
    finally:
        p.cerrar()
    print('\n  MAPA BASE: %s' % ('EN VERDE' if not fallos else '%d FALLO(S)' % len(fallos)))
    return 1 if fallos else 0


def main():
    if '--comprobar' in sys.argv[1:]:
        return comprobar()
    print('Recortando %s ...' % os.path.relpath(FUENTE, RAIZ))
    teselas, meta, cuenta = construir()
    r = escribir(SALIDA, teselas, meta)
    escribir_huella(sha256(SALIDA)[:16])
    print('  huella en sw.js: %s' % huella_en_sw())
    print('  rasgos por capa: ' + ', '.join('%s %d' % (k, cuenta[k]) for k in CAPAS if k in cuenta))
    print('%s  ·  %d teselas (%d distintas)  ·  %.2f MB' % (os.path.relpath(SALIDA, RAIZ), r['teselas'],
                                                          r['contenidos'], r['bytes'] / 1e6))
    if r['bytes'] > TOPE_BYTES:
        print('  OJO: pasa del tope de %.1f MB del precache' % (TOPE_BYTES / 1e6))
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
