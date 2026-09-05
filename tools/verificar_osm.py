#!/usr/bin/env python3
"""
verificar_osm.py — comprueba un .pmtiles antes de subirlo a Tenerife Go.

Sin dependencias: lector de cabecera y de directorios PMTiles v3 en stdlib.

    python3 tools/verificar_osm.py mapa/tenerife-osm.pmtiles [index.html]
    python3 tools/verificar_osm.py https://…/x.pmtiles --solo-cabeceras

Comprueba, en este orden:
  1. Que es PMTiles v3 y que los tiles son vectoriales (MVT).
  2. ESQUEMA. Es la comprobacion cara: con OpenMapTiles el fichero es valido,
     no da ningun error, y el mapa sale en blanco. Se decide por los nombres
     de las capas en los metadatos, no por el nombre del fichero.
  3. Caja: que cubre la de navegacion de la app.
  4. Zoom maximo.
  5. Tamano, contra el limite REAL de subida (25 MB por el navegador de GitHub).
  6. Que dentro hay un tile de verdad en el zoom maximo sobre Tenerife, y que
     ese tile contiene senderos.
  7. COMPATIBILIDAD REAL con el estilo que lleva la app. Ver mas abajo.

Sale con codigo 0 solo si pasa todo.

── SOBRE LAS PETICIONES POR RANGO ────────────────────────────────────────
PMTiles normalmente lee el archivo a trozos con cabeceras Range, y eso obliga
a que el hosting haga byte serving. Si no lo hace, el mapa sale en blanco sin
dar ningun error.

Tenerife Go NO depende de eso, a proposito: index.html construye la capa con
`new pmtiles.PMTiles(fuenteBlob(...))` sobre el fichero entero ya descargado,
nunca con una URL, asi que las lecturas por rango las resuelve blob.slice()
dentro del navegador. Hay un control permanente en tools/auditar_mapa.js que
graba TODAS las peticiones mientras se carga la capa y falla si alguna lleva
cabecera Range, precisamente para que nadie reintroduzca la dependencia
pasando una URL suelta.

Si algun dia el fichero se sirviera desde otro sitio, con
`--solo-cabeceras <url>` se comprueba que ese host si sirve rangos.

── SOBRE LAS VERSIONES DEL ESQUEMA ───────────────────────────────────────
Los builds diarios y el paquete de estilos van por su cuenta, y si el estilo
y el build no son de la misma generacion sale, otra vez, el mapa en blanco
sin error. Comparar numeros de version no sirve: no siempre estan en los
metadatos y no dicen lo que de verdad importa.

Lo que hace el paso 7 es probar el par concreto: carga el fichero con el
protomaps-leaflet que hay en vendor/ —el mismo que corre en el movil del
usuario— y cuenta cuantos rasgos dibuja de verdad. Si sale cero, no importa
que versiones sean: ese fichero con este estilo da un mapa en blanco.
"""
import sys, os, json, gzip, zlib, struct

# caja de navegacion de la app
BBOX_APP = (-16.98, 27.90, -16.08, 28.65)   # W, S, E, N
ZOOM_MIN_EXIGIDO = 14
LIMITE_NAVEGADOR = 25 * 1024 * 1024         # subida por el navegador de GitHub
LIMITE_CLI       = 100 * 1024 * 1024        # push por linea de comandos

# Las capas que pide de verdad el estilo que lleva la app. NO es una lista de
# memoria: sale de preguntarle a vendor/protomaps-leaflet.js que dataLayer
# nombran sus reglas, y tools/auditar_mapa.js comprueba en cada auditoria que
# esta constante sigue coincidiendo con lo que el bundle pide. Si algun dia se
# actualiza el vendor y cambia, la auditoria lo canta.
CAPAS_DEL_ESTILO = {'boundaries','buildings','earth','landcover','landuse',
                    'places','roads','water'}

CAPAS_PROTOMAPS = {'earth','water','landuse','natural','physical_line',
                   'buildings','boundaries','places','roads','transit',
                   'physical_point','pois'}
CAPAS_OPENMAPTILES = {'transportation','transportation_name','water_name',
                      'landcover','mountain_peak','aerodrome_label','housenumber',
                      'boundary','aeroway','park'}
COMPRESION = {0:'desconocida',1:'ninguna',2:'gzip',3:'brotli',4:'zstd'}
TIPO_TILE  = {0:'desconocido',1:'MVT (vectorial)',2:'PNG',3:'JPEG',4:'WEBP',5:'AVIF'}

fallos, avisos = [], []
def mal(m): fallos.append(m); print(f'  FALLA  {m}')
def ok(m):  print(f'  OK     {m}')
def avisa(m): avisos.append(m); print(f'  AVISO  {m}')


# ─────────── cabecera PMTiles v3 (127 bytes) ───────────
def leer_cabecera(f):
    f.seek(0); b = f.read(127)
    if len(b) < 127 or b[:7] != b'PMTiles':
        raise SystemExit('  FALLA  No es un fichero PMTiles (falta la firma).')
    if b[7] != 3:
        raise SystemExit(f'  FALLA  PMTiles version {b[7]}; se esperaba la 3.')
    u = lambda o: struct.unpack('<Q', b[o:o+8])[0]
    i = lambda o: struct.unpack('<i', b[o:o+4])[0]
    return dict(
        raiz_off=u(8), raiz_len=u(16), meta_off=u(24), meta_len=u(32),
        hojas_off=u(40), hojas_len=u(48), datos_off=u(56), datos_len=u(64),
        n_direccionados=u(72), n_entradas=u(80), n_contenidos=u(88),
        agrupado=b[96], comp_interna=b[97], comp_tile=b[98], tipo_tile=b[99],
        zmin=b[100], zmax=b[101],
        lon_min=i(102)/1e7, lat_min=i(106)/1e7,
        lon_max=i(110)/1e7, lat_max=i(114)/1e7)

def descomprimir(raw, modo):
    if modo == 1: return raw
    if modo == 2: return gzip.decompress(raw)
    if modo == 3:
        try:
            import brotli; return brotli.decompress(raw)
        except ImportError:
            raise SystemExit('  FALLA  El fichero usa brotli y no hay modulo brotli.')
    if modo == 4:
        try:
            import zstandard as z; return z.ZstdDecompressor().decompress(raw)
        except ImportError:
            raise SystemExit('  FALLA  El fichero usa zstd y no hay modulo zstandard.')
    return raw


# ─────────── directorio PMTiles v3 ───────────
def varint(b, p):
    r = s = 0
    while True:
        x = b[p]; p += 1
        r |= (x & 0x7f) << s
        if not (x & 0x80): return r, p
        s += 7

def leer_directorio(buf):
    n, p = varint(buf, 0)
    ids, tid = [], 0
    for _ in range(n):
        d, p = varint(buf, p); tid += d; ids.append(tid)
    runs = []
    for _ in range(n):
        v, p = varint(buf, p); runs.append(v)
    largos = []
    for _ in range(n):
        v, p = varint(buf, p); largos.append(v)
    offs = []
    for i in range(n):
        v, p = varint(buf, p)
        offs.append(offs[i-1] + largos[i-1] if v == 0 and i > 0 else v - 1)
    return [dict(id=ids[i], run=runs[i], off=offs[i], len=largos[i]) for i in range(n)]

def zxy_a_tileid(z, x, y):
    """indice Hilbert usado por PMTiles."""
    base = 0
    for t in range(z): base += (1 << t) * (1 << t)
    n, rx, ry, d, tx, ty = 1 << z, 0, 0, 0, x, y
    s = n // 2
    while s > 0:
        rx = 1 if (tx & s) > 0 else 0
        ry = 1 if (ty & s) > 0 else 0
        d += s * s * ((3 * rx) ^ ry)
        if ry == 0:
            if rx == 1:
                tx = s - 1 - tx; ty = s - 1 - ty
            tx, ty = ty, tx
        s //= 2
    return base + d

def buscar(entradas, tid):
    for e in entradas:
        if e['id'] <= tid < e['id'] + max(e['run'], 1):
            return e
    return None


def comprobar_rangos(url):
    """Solo para un fichero servido por HTTP desde otro sitio. La app no lo
    necesita -lee de un Blob-, pero si algun dia se sirviera por rangos, un
    host que no haga byte serving da mapa en blanco sin error."""
    import urllib.request
    print(f'\nHost: {url}\n')
    pet = urllib.request.Request(url, headers={'Range': 'bytes=0-99'})
    try:
        with urllib.request.urlopen(pet, timeout=20) as r:
            codigo = r.status
            cab = {k.lower(): v for k, v in r.headers.items()}
            leido = len(r.read())
    except Exception as ex:
        print(f'  FALLA  no se pudo pedir el rango: {type(ex).__name__}: {ex}')
        sys.exit(1)
    print(f'         HTTP {codigo} · accept-ranges: {cab.get("accept-ranges","(ninguno)")} · '
          f'content-range: {cab.get("content-range","(ninguno)")} · {leido} bytes')
    sirve = (codigo == 206 and 'content-range' in cab and leido == 100)
    (ok if sirve else mal)('el host sirve peticiones Range')
    if not sirve:
        print('         Sin byte serving, un PMTiles leido por URL da MAPA EN BLANCO')
        print('         sin dar ningun error. (Tenerife Go no lo usa: lee de un Blob.)')
    sys.exit(1 if fallos else 0)


def comprobar_lector(ruta_html):
    """Un .pmtiles perfecto no se ve si la app que lo consume no trae lector.
    El navegador no lee PMTiles solo: hace falta protomaps-leaflet, o pmtiles
    mas MapLibre."""
    print('\n0. ¿LA APP TIENE LECTOR?')
    try:
        h = open(ruta_html, encoding='utf-8').read()
    except Exception as ex:
        avisa(f'no se pudo leer {ruta_html}: {ex}')
        return
    import hashlib
    print(f'         {ruta_html} · md5 {hashlib.md5(h.encode("utf-8")).hexdigest()}')
    tiene_pm = 'pmtiles' in h.lower()
    tiene_est = 'protomaps' in h.lower() or 'maplibre' in h.lower()
    (ok if tiene_pm else mal)('index.html carga un lector de PMTiles')
    (ok if tiene_est else mal)('index.html carga un motor que sepa dibujarlo')
    if not (tiene_pm and tiene_est):
        print('         Sin eso, dejar el .pmtiles en el repositorio no hace nada:')
        print('         el navegador no lee PMTiles por su cuenta.')


def main():
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(1)
    ruta = sys.argv[1]
    if '--solo-cabeceras' in sys.argv or ruta.startswith('http'):
        comprobar_rangos(ruta)
    if not os.path.exists(ruta):
        print(f'  FALLA  No existe: {ruta}'); sys.exit(1)
    html = None
    for a in sys.argv[2:]:
        if not a.startswith('-') and os.path.exists(a):
            html = a

    tam = os.path.getsize(ruta)
    print(f'\nFichero: {ruta}\n')
    if html:
        comprobar_lector(html)
    f = open(ruta, 'rb')
    h = leer_cabecera(f)

    # 1 ── formato
    print('1. FORMATO')
    ok('PMTiles v3')
    t = TIPO_TILE.get(h['tipo_tile'], '?')
    (ok if h['tipo_tile'] == 1 else mal)(f'tipo de tile: {t}')
    print(f'         compresion interna {COMPRESION.get(h["comp_interna"],"?")} · '
          f'tiles {COMPRESION.get(h["comp_tile"],"?")}')
    print(f'         {h["n_direccionados"]:,} tiles direccionados · '
          f'{h["n_contenidos"]:,} contenidos distintos')

    # 2 ── esquema
    print('\n2. ESQUEMA  (el fallo silencioso)')
    f.seek(h['meta_off'])
    meta = json.loads(descomprimir(f.read(h['meta_len']), h['comp_interna']).decode('utf-8'))
    capas = {c.get('id') for c in meta.get('vector_layers', []) if c.get('id')}
    if not capas:
        mal('los metadatos no declaran vector_layers: no se puede saber el esquema')
    else:
        print(f'         capas ({len(capas)}): {", ".join(sorted(capas))}')
        pm  = len(capas & CAPAS_PROTOMAPS)
        omt = len(capas & CAPAS_OPENMAPTILES)
        if pm >= 6 and omt <= 1:
            ok(f'Protomaps basemap ({pm} capas propias reconocidas)')
        elif omt >= 3:
            mal(f'parece OpenMapTiles ({omt} capas propias). '
                'El mapa saldra EN BLANCO sin dar ningun error.')
        else:
            mal(f'esquema no reconocido (Protomaps {pm}, OpenMapTiles {omt}). '
                'No subir sin comprobarlo a mano.')
    for k in ('version', 'vector_layers_version', 'planetiler:version'):
        if k in meta: print(f'         {k}: {meta[k]}')
    if 'name' in meta: print(f'         name: {meta["name"]}')

    # 3 ── caja
    print('\n3. CAJA')
    W, S, E, N = BBOX_APP
    print(f'         fichero: {h["lon_min"]:.4f},{h["lat_min"]:.4f},{h["lon_max"]:.4f},{h["lat_max"]:.4f}')
    print(f'         app    : {W},{S},{E},{N}')
    tol = 0.01
    cubre = (h['lon_min'] <= W + tol and h['lat_min'] <= S + tol and
             h['lon_max'] >= E - tol and h['lat_max'] >= N - tol)
    (ok if cubre else mal)('cubre la caja de navegacion de la app')
    if (h['lon_max'] - h['lon_min']) > 5 or (h['lat_max'] - h['lat_min']) > 5:
        avisa('la caja es mucho mayor que Tenerife: puede que no se recortara')

    # 4 ── zoom
    print('\n4. ZOOM')
    print(f'         z{h["zmin"]} a z{h["zmax"]}')
    (ok if h['zmax'] >= ZOOM_MIN_EXIGIDO else mal)(f'zmax >= {ZOOM_MIN_EXIGIDO}')
    if h['zmax'] >= 15: ok('z15: detalle de sendero bueno')

    # 5 ── tamano
    print('\n5. TAMANO')
    mb = tam / 1024 / 1024
    print(f'         {tam:,} bytes = {mb:.1f} MB')
    if tam <= LIMITE_NAVEGADOR:
        ok(f'cabe por el navegador de GitHub (limite 25 MB)')
    elif tam <= LIMITE_CLI:
        mal(f'{mb:.1f} MB: NO se puede subir arrastrando en la web de GitHub '
            '(limite 25 MB). Solo por git desde linea de comandos, o alojarlo fuera.')
    else:
        mal(f'{mb:.1f} MB: GitHub rechaza el push (limite 100 MB). Baja un zoom.')

    # 6 ── tiles de verdad, con senderos
    #
    # Se miran VARIOS puntos, no el centro de la caja. El centro de Tenerife
    # cae en mitad de la caldera del Teide, donde un build legitimo puede
    # traer poca cosa; dar por malo el fichero por eso seria un bloqueante
    # falso. Basta con que UNO de los puntos traiga senderos.
    print('\n6. CONTENIDO REAL')
    PUNTOS = [('La Laguna', 28.487, -16.315), ('Anaga', 28.545, -16.235),
              ('Teide', 28.275, -16.530), ('Adeje', 28.123, -16.726),
              ('La Orotava', 28.390, -16.523)]
    import math
    leidos, con_roads, con_sendas = 0, 0, []
    # El try SOLO envuelve la lectura, que es lo que puede fallar por el
    # fichero. Si envolviera tambien las conclusiones, un error de
    # programacion en ellas se convertiria en un aviso y el script saldria en
    # verde: paso de verdad mientras se escribia esto.
    try:
        f.seek(h['raiz_off'])
        raiz = leer_directorio(descomprimir(f.read(h['raiz_len']), h['comp_interna']))
        z = h['zmax']
        n = 1 << z
        for nombre, lat, lon in PUNTOS:
            if not (h['lat_min'] <= lat <= h['lat_max'] and h['lon_min'] <= lon <= h['lon_max']):
                continue
            x = int((lon + 180.0) / 360.0 * n)
            y = int((1.0 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2.0 * n)
            e = buscar(raiz, zxy_a_tileid(z, x, y))
            if e is None:
                print(f'         {nombre:<11} z{z}/{x}/{y}: no esta en el directorio raiz'
                      ' (puede estar en una hoja)')
                continue
            f.seek(h['datos_off'] + e['off'])
            tile = descomprimir(f.read(e['len']), h['comp_tile'])
            leidos += 1
            hay_roads = b'roads' in tile
            if hay_roads:
                con_roads += 1
            sendero = [w.decode() for w in (b'path', b'footway', b'track', b'steps') if w in tile]
            if sendero:
                con_sendas.append(nombre)
            print(f'         {nombre:<11} z{z}/{x}/{y}: {len(tile):>7,} bytes'
                  f' · roads {"si" if hay_roads else "no"}'
                  f' · sendas {",".join(sendero) if sendero else "-"}')
    except Exception as ex:
        avisa(f'no se pudo leer el directorio de tiles ({type(ex).__name__}: {ex})')

    (ok if leidos else mal)(f'tiles del zoom maximo leidos y descomprimidos: {leidos}')
    (ok if con_roads else mal)(f'la capa roads aparece en {con_roads} de {leidos} tile(s)')
    (ok if con_sendas else mal)(
        ('senderos en: ' + ', '.join(con_sendas)) if con_sendas else
        'ningun tile de los mirados contiene senderos. Comprueba el zoom y que el build los incluya.')

    # 7a ── cuanto de lo que pide el estilo trae el fichero
    print('\n7. ¿SE VE CON EL ESTILO DE LA APP?')
    if capas:
        tiene = capas & CAPAS_DEL_ESTILO
        pct = len(tiene) * 100 // len(CAPAS_DEL_ESTILO)
        print(f'         el estilo pide {len(CAPAS_DEL_ESTILO)} capas; el fichero trae {len(tiene)} ({pct} %)')
        if tiene != CAPAS_DEL_ESTILO:
            print('         faltan: ' + ', '.join(sorted(CAPAS_DEL_ESTILO - capas)))
        if pct < 70:
            mal(f'compatibilidad de capas {pct} %: el mapa saldra vacio o casi')
        elif pct < 100:
            avisa(f'compatibilidad de capas {pct} %: se vera, pero incompleto')
        else:
            ok('el fichero trae las 8 capas que pide el estilo')

    # 7b ── ¿se VE de verdad?
    #
    # Los pasos 1 a 6 miran el fichero. Este mira el PAR: se monta la capa
    # con el vendor/protomaps-leaflet.js que corre en el movil del usuario y
    # se cuentan los pixeles que no son fondo. Comparar numeros de version no
    # sirve -no siempre estan, y no dicen lo que importa-; esto sí: si sale
    # cero, ese fichero con este estilo da un mapa en blanco, sean de la
    # generacion que sean.
    import subprocess
    aqui = os.path.dirname(os.path.abspath(__file__))
    try:
        r = subprocess.run(['node', os.path.join(aqui, 'verificar_estilo.js'), ruta],
                           capture_output=True, text=True, timeout=240)
        for linea in r.stdout.splitlines():
            t = linea.strip()
            if t.startswith('OK ') or t.startswith('MAL '):
                print('         ' + t)
        (ok if r.returncode == 0 else mal)(
            'se dibuja de verdad con vendor/protomaps-leaflet.js'
            if r.returncode == 0 else
            'MAPA EN BLANCO: el esquema del fichero y el del estilo no se entienden')
    except FileNotFoundError:
        avisa('no hay node: no se ha podido comprobar que se VEA, solo que el fichero este bien')
    except Exception as ex:
        avisa(f'no se pudo ejecutar la prueba de estilo ({type(ex).__name__}: {ex})')

    print('\n' + '-'*60)
    if fallos:
        print(f'NO SUBIR. {len(fallos)} fallo(s):')
        for x in fallos: print(f'  · {x}')
        sys.exit(1)
    if avisos:
        print(f'Pasa, con {len(avisos)} aviso(s):')
        for x in avisos: print(f'  · {x}')
    else:
        print('TODO EN VERDE. Listo para subir.')
    sys.exit(0)


if __name__ == '__main__':
    main()
