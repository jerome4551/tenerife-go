#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Regenera la red TITSA de index.html desde el GTFS oficial.

    python3 tools/gtfs_red.py Google_transit.zip                 # fase 1: solo informe
    python3 tools/gtfs_red.py Google_transit.zip --emitir salida/ # ademas escribe los bloques

NO toca index.html. Lee el ZIP, lee el index para saber que lineas hay y de
donde sacar el municipio, y emite dos ficheros de texto:

    salida/TITSA_PARADAS.js   el catalogo de paradas fisicas
    salida/secuencias.js      el campo paradas[] y terminales[] de cada linea
    salida/informe.txt        lo que hay que leer ANTES de aplicar nada

Reglas, todas del documento de reconstruccion:

  · Par ida/vuelta = mismo nombre normalizado a menos de 80 m. Se queda el
    stop_id menor como clave; el resto van al campo `s`. El umbral no se sube.
  · Municipio: el de la parada MAS CERCANA del index actual, y solo si esta a
    menos de 3 km. Si no, cadena vacia. Nunca se inventa.
  · Trip canonico de cada linea: el que tiene mas paradas distintas.
  · terminales = primera y ultima de la secuencia, ya deduplicada.
  · Ninguna coordenada se deduce, se geocodifica ni se saca de un centroide.
"""
import argparse, csv, io, json, math, os, re, sys, unicodedata, zipfile
from collections import defaultdict

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

UMBRAL_PAREJA_M = 80.0     # ida/vuelta. NO SUBIR: a 150 m se funden paradas distintas.
UMBRAL_MUNI_KM  = 3.0      # mas lejos que esto, el municipio se deja vacio.
BBOX = (27.9, 28.65, -17.05, -16.0)

# Lineas que el documento manda NO regenerar, con el motivo.
NO_REGENERAR = {
    '231': 'el GTFS 231 es «Intercambiador Santa Cruz — La Gallega», otra linea con el mismo numero',
}
# El tranvia no esta en este GTFS.
TRANVIA = ('tram-L1', 'tram-L2')


# ─────────────────────────────────────────────────────────── utilidades

def norm(s):
    """minusculas, sin tildes, sin signos, espacios colapsados."""
    s = unicodedata.normalize('NFKD', s or '')
    s = ''.join(c for c in s if not unicodedata.combining(c))
    s = s.lower()
    s = re.sub(r'[^a-z0-9\s]', ' ', s)
    return re.sub(r'\s+', ' ', s).strip()


def metros(a, b):
    R = 6371000.0
    la1, lo1 = math.radians(a[0]), math.radians(a[1])
    la2, lo2 = math.radians(b[0]), math.radians(b[1])
    h = (math.sin((la2 - la1) / 2) ** 2
         + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2)
    return 2 * R * math.asin(math.sqrt(h))


def num_linea(s):
    """«054» y «54» son la misma linea; «L1» se queda como esta."""
    s = (s or '').strip()
    return s.lstrip('0') or s


_COL = {}
def colisiones(lineas):
    """Numeros que apuntan a mas de una linea del fichero.

    Los pares dia/noche comparten numero —bus-015 y bus-015N, bus-934 y
    bus-934N— pero NO comparten recorrido: la nocturna de la 015 es en
    realidad la 714. Regenerar por numero le daria el itinerario diurno.
    Se detectan solos para que una colision futura tampoco pase inadvertida.
    """
    k = id(lineas)
    if k not in _COL:
        cuenta = defaultdict(int)
        for l in lineas:
            cuenta[num_linea(l['numero'])] += 1
        _COL[k] = {n for n, c in cuenta.items() if c > 1}
    return _COL[k]


def leer_csv(z, nombre):
    for n in z.namelist():
        if os.path.basename(n).lower() == nombre:
            with z.open(n) as f:
                txt = io.TextIOWrapper(f, encoding='utf-8-sig', newline='')
                return list(csv.DictReader(txt))
    raise SystemExit('ABORTADO: el ZIP no trae %s' % nombre)


# ─────────────────────────────────────────── lo que ya hay en index.html

def leer_index():
    """Saca TITSA_LINES del index sin ejecutar JS: solo lo que necesitamos."""
    s = io.open(os.path.join(RAIZ, 'index.html'), encoding='utf8').read()
    i = s.index('const TITSA_LINES = [')
    o = s.index('[', i)
    d, q, fin = 0, None, -1
    for k in range(o, len(s)):
        c, p = s[k], s[k - 1]
        if q:
            if c == q and p != '\\':
                q = None
            continue
        if c in '"\'`':
            q = c
            continue
        if c == '[':
            d += 1
        elif c == ']':
            d -= 1
            if d == 0:
                fin = k
                break
    bloque = s[o:fin + 1]

    # Entre el «{» y el «id:» puede haber un comentario de bloque: siete lineas
    # lo tienen. Si el hueco solo admite espacios, esas siete se pierden en
    # silencio y se marcarian como «sin equivalente en GTFS».
    HUECO = r'(?:\s|/\*[\s\S]*?\*/|//[^\n]*\n)*'

    lineas, paradas = [], []
    for m in re.finditer(r'\{' + HUECO + r'id:"(bus-[^"]+|tram-[^"]+)",\s*numero:"([^"]*)"', bloque):
        ini = m.start()
        d2, q2, cierre = 0, None, None
        for k in range(ini, len(bloque)):
            c, p = bloque[k], bloque[k - 1]
            if q2:
                if c == q2 and p != '\\':
                    q2 = None
                continue
            if c in '"\'`':
                q2 = c
                continue
            if c == '{':
                d2 += 1
            elif c == '}':
                d2 -= 1
                if d2 == 0:
                    cierre = k + 1
                    break
        trozo = bloque[ini:cierre]
        ps = []
        for pm in re.finditer(
                r'\{' + HUECO + r'id:"([^"]*)",\s*nombre:"([^"]*)",\s*lat:\s*([-\d.]+),\s*lng:\s*([-\d.]+)'
                r'[^{}]*?municipio:"([^"]*)"', trozo):
            ps.append({'id': pm.group(1), 'nombre': pm.group(2),
                       'lat': float(pm.group(3)), 'lng': float(pm.group(4)),
                       'municipio': pm.group(5)})
        lineas.append({'id': m.group(1), 'numero': m.group(2), 'paradas': ps})
        paradas.extend(ps)

    # Control de lectura: si el numero de lineas o de paradas no cuadra con lo
    # que hay en el fichero, el parser se esta dejando algo y no se sigue.
    n_lineas = len(re.findall(r'\bid:"(?:bus|tram)-', bloque))
    n_paradas = bloque.count('esTerminal:')
    if len(lineas) != n_lineas or len(paradas) != n_paradas:
        raise SystemExit(
            'ABORTADO: lei %d lineas de %d y %d paradas de %d. El parser se deja algo.'
            % (len(lineas), n_lineas, len(paradas), n_paradas))
    return lineas, paradas


# ────────────────────────────────────────────── catalogo desde stops.txt

def construir_catalogo(stops, paradas_viejas, avisos):
    brutas = []
    for r in stops:
        try:
            la, lo = float(r['stop_lat']), float(r['stop_lon'])
        except (KeyError, ValueError, TypeError):
            avisos.append('parada sin coordenada legible: %r' % r.get('stop_id'))
            continue
        if not (BBOX[0] <= la <= BBOX[1] and BBOX[2] <= lo <= BBOX[3]):
            avisos.append('FUERA DEL BBOX, descartada: %s %s (%s, %s)'
                          % (r.get('stop_id'), r.get('stop_name'), la, lo))
            continue
        brutas.append({'sid': str(r['stop_id']).strip(),
                       'nom': (r.get('stop_name') or '').strip(),
                       'la': la, 'lo': lo})

    # agrupar el par ida/vuelta: mismo nombre normalizado y a menos de 80 m
    por_nombre = defaultdict(list)
    for b in brutas:
        por_nombre[norm(b['nom'])].append(b)

    catalogo, agrupadas = {}, 0
    for _, grupo in por_nombre.items():
        grupo.sort(key=lambda x: (len(x['sid']), x['sid']))
        pendientes, racimos = list(grupo), []
        while pendientes:
            base = pendientes.pop(0)
            racimo = [base]
            resto = []
            for o in pendientes:
                if metros((base['la'], base['lo']), (o['la'], o['lo'])) <= UMBRAL_PAREJA_M:
                    racimo.append(o)
                else:
                    resto.append(o)
            pendientes = resto
            racimos.append(racimo)
        for racimo in racimos:
            racimo.sort(key=lambda x: (len(x['sid']), x['sid']))
            jefe = racimo[0]
            ent = {'n': titulo(jefe['nom']), 'la': jefe['la'], 'lo': jefe['lo'], 'm': ''}
            if len(racimo) > 1:
                ent['s'] = [x['sid'] for x in racimo[1:]]
                agrupadas += len(racimo) - 1
            catalogo[jefe['sid']] = ent

    # alias -> clave, para resolver cualquier stop_id de stop_times
    alias = {}
    for clave, ent in catalogo.items():
        alias[clave] = clave
        for s in ent.get('s', ()):
            alias[s] = clave

    # municipio: el de la parada mas cercana del index, si esta a menos de 3 km
    sin_muni = 0
    for clave, ent in catalogo.items():
        mejor, dmin = '', 1e18
        for v in paradas_viejas:
            d = metros((ent['la'], ent['lo']), (v['lat'], v['lng']))
            if d < dmin:
                dmin, mejor = d, v['municipio']
        if dmin <= UMBRAL_MUNI_KM * 1000 and mejor:
            # el fichero tiene una parada con «La Laguna» a secas; la forma
            # canonica, usada 146 veces, es la larga.
            ent['m'] = 'San Cristóbal de La Laguna' if mejor == 'La Laguna' else mejor
        else:
            sin_muni += 1
    return catalogo, alias, agrupadas, sin_muni


def titulo(s):
    """MAYUSCULAS del GTFS -> Mayuscula Inicial, respetando las particulas."""
    if not s:
        return s
    if s != s.upper():
        return s                      # ya viene con capitalizacion propia
    menores = {'de', 'del', 'la', 'las', 'el', 'los', 'y', 'a', 'en'}
    out = []
    for i, w in enumerate(s.lower().split()):
        out.append(w if (i and w in menores) else w[:1].upper() + w[1:])
    return ' '.join(out)


# ───────────────────────────────────────── recorrido canonico de cada linea

def construir_secuencias(z, alias, avisos):
    routes = leer_csv(z, 'routes.txt')
    trips = leer_csv(z, 'trips.txt')
    st = leer_csv(z, 'stop_times.txt')

    ruta_de_trip = {t['trip_id']: t['route_id'] for t in trips}
    paradas_trip = defaultdict(list)
    for r in st:
        try:
            seq = int(r['stop_sequence'])
        except (KeyError, ValueError, TypeError):
            continue
        paradas_trip[r['trip_id']].append((seq, str(r['stop_id']).strip()))

    # trip canonico por ruta = el de mas paradas distintas
    mejor_trip = {}
    for tid, lst in paradas_trip.items():
        rid = ruta_de_trip.get(tid)
        if rid is None:
            continue
        n = len({s for _, s in lst})
        if rid not in mejor_trip or n > mejor_trip[rid][1]:
            mejor_trip[rid] = (tid, n)

    secuencias = {}
    for r in routes:
        rid = r['route_id']
        corto = (r.get('route_short_name') or '').strip()
        largo = (r.get('route_long_name') or '').strip()
        if rid not in mejor_trip:
            avisos.append('ruta %s (%s) sin ningun trip con paradas' % (corto or rid, largo))
            continue
        tid = mejor_trip[rid][0]
        orden = sorted(paradas_trip[tid], key=lambda x: x[0])
        claves, huerfanas = [], []
        for _, sid in orden:
            k = alias.get(sid)
            if k is None:
                huerfanas.append(sid)
                continue
            if claves and claves[-1] == k:
                continue                       # circular que repite consecutivo
            claves.append(k)
        if huerfanas:
            avisos.append('ruta %s: %d stop_id de stop_times no estan en el catalogo (%s)'
                          % (corto or rid, len(huerfanas), ', '.join(sorted(set(huerfanas))[:6])))
        if len(claves) < 2:
            avisos.append('ruta %s: menos de 2 paradas utiles, no se regenera' % (corto or rid))
            continue
        secuencias[num_linea(corto)] = {
            'corto': corto, 'largo': largo,
            'paradas': claves,
            'terminales': [claves[0], claves[-1]],
        }
    return secuencias


# ────────────────────────────────────────────────────────────── emision

def js_cadena(s):
    """Comillas dobles y todo lo no-ASCII en \\uXXXX, como en el documento."""
    out = ['"']
    for c in s:
        if c == '"':
            out.append('\\"')
        elif c == '\\':
            out.append('\\\\')
        elif ord(c) < 128:
            out.append(c)
        else:
            out.append('\\u%04x' % ord(c))
    out.append('"')
    return ''.join(out)


def emitir_catalogo(catalogo):
    L = ['/* Catalogo de paradas fisicas de TITSA. Generado por tools/gtfs_red.py',
         '   desde stops.txt del GTFS oficial. Clave = stop_id de TITSA.',
         '   n=nombre, la=lat, lo=lng, m=municipio, s=stop_ids agrupados (par',
         '   ida/vuelta a menos de 80 m). NO editar a mano: se regenera. */',
         'const TITSA_PARADAS = {']
    for clave in sorted(catalogo, key=lambda k: (len(k), k)):
        e = catalogo[clave]
        campos = ['n:%s' % js_cadena(e['n']),
                  'la:%.5f' % e['la'], 'lo:%.5f' % e['lo'],
                  'm:%s' % js_cadena(e['m'])]
        if e.get('s'):
            campos.append('s:[%s]' % ','.join(js_cadena(x) for x in e['s']))
        L.append('  %s: { %s },' % (js_cadena(clave), ', '.join(campos)))
    L.append('};')
    return '\n'.join(L) + '\n'


def emitir_secuencias(lineas, secuencias):
    L = ['// Un str_replace por linea. Sustituye el campo paradas:[...] entero.',
         '// nombre, color, tipo, frecuencia, precio, nota, minutos y servicio NO se tocan.', '']
    choques = colisiones(lineas)
    for ln in lineas:
        if ln['id'] in TRANVIA:
            continue
        num = num_linea(ln['numero'])
        if ln['numero'] in NO_REGENERAR or num in NO_REGENERAR:
            L.append('/* %s  NO SE REGENERA: %s */'
                     % (ln['id'], NO_REGENERAR.get(ln['numero']) or NO_REGENERAR[num]))
            L.append('')
            continue
        if num in choques:
            L.append('/* %s  NO SE REGENERA: el numero %s lo comparten %s, y no comparten'
                     ' recorrido. Decidir a mano cual va con que ruta del GTFS. */'
                     % (ln['id'], num,
                        ' y '.join(l['id'] for l in lineas if num_linea(l['numero']) == num)))
            L.append('')
            continue
        s = secuencias.get(num)
        if not s:
            L.append('/* %s  sin equivalente en GTFS 2026-08: revisar */' % ln['id'])
            L.append('')
            continue
        L.append('// %s  (%d paradas)' % (ln['id'], len(s['paradas'])))
        L.append('    paradas:[%s],' % ','.join(js_cadena(k) for k in s['paradas']))
        L.append('    terminales:[%s]' % ','.join(js_cadena(k) for k in s['terminales']))
        L.append('')
    return '\n'.join(L) + '\n'


HIDRATACION = '''
/* Hidratacion: convierte las claves de catalogo en los objetos de parada que
   el resto del codigo ya espera (.id .nombre .lat .lng .municipio .esTerminal).
   Se ejecuta una sola vez, antes de cualquier consumidor. */
(function hidratarParadas(){
  if (!Array.isArray(TITSA_LINES)) return;
  for (const line of TITSA_LINES) {
    if (!Array.isArray(line.paradas)) continue;
    if (typeof line.paradas[0] !== 'string') continue;   // ya hidratada o tranvia
    const term = new Set(line.terminales || []);
    line.paradas = line.paradas.map(function(ref){
      const p = TITSA_PARADAS[ref];
      if (!p) return null;
      return { id: line.id + '-' + ref, stopId: ref, nombre: p.n,
               lat: p.la, lng: p.lo, municipio: p.m, esTerminal: term.has(ref) };
    }).filter(Boolean);
  }
})();
'''


# ──────────────────────────────────────────────────────────────── informe

def informe(catalogo, alias, secuencias, lineas, agrupadas, sin_muni, avisos):
    P = []
    w = P.append
    w('# Informe de la fase 1 — no se ha tocado index.html')
    w('')
    w('## Catalogo')
    w('  paradas fisicas          : %d' % len(catalogo))
    w('  stop_id agrupados        : %d  (par ida/vuelta a menos de %.0f m)' % (agrupadas, UMBRAL_PAREJA_M))
    w('  claves + alias           : %d' % len(alias))
    w('  sin municipio            : %d  (ninguna parada del index a menos de %.0f km)'
      % (sin_muni, UMBRAL_MUNI_KM))
    fuera = [k for k, e in catalogo.items()
             if not (BBOX[0] <= e['la'] <= BBOX[1] and BBOX[2] <= e['lo'] <= BBOX[3])]
    w('  fuera del bbox           : %d   %s' % (len(fuera), 'OK' if not fuera else '*** REVISAR ***'))

    # control 3 del documento: dos claves con el mismo nombre normalizado
    # tienen que estar a mas de 80 m
    por_nombre = defaultdict(list)
    for k, e in catalogo.items():
        por_nombre[norm(e['n'])].append((k, e))
    fallos_grupo = []
    for nom, lst in por_nombre.items():
        for i in range(len(lst)):
            for j in range(i + 1, len(lst)):
                d = metros((lst[i][1]['la'], lst[i][1]['lo']), (lst[j][1]['la'], lst[j][1]['lo']))
                if d <= UMBRAL_PAREJA_M:
                    fallos_grupo.append('%s: %s y %s a %.0f m' % (lst[i][1]['n'], lst[i][0], lst[j][0], d))
    w('  agrupacion coherente     : %s' % ('OK' if not fallos_grupo else '*** %d fallos ***' % len(fallos_grupo)))
    for f in fallos_grupo[:10]:
        w('      ' + f)

    w('')
    w('## Lineas')
    regen, marcar, parar, tranvia, choque = [], [], [], [], []
    for ln in lineas:
        if ln['id'] in TRANVIA:
            tranvia.append(ln['id'])
        elif ln['numero'] in NO_REGENERAR or num_linea(ln['numero']) in NO_REGENERAR:
            parar.append(ln['id'])
        elif num_linea(ln['numero']) in colisiones(lineas):
            choque.append(ln['id'])
        elif num_linea(ln['numero']) in secuencias:
            regen.append(ln)
        else:
            marcar.append(ln['id'])
    w('  del index                : %d' % len(lineas))
    w('  se regeneran             : %d' % len(regen))
    w('  se marcan (sin GTFS)     : %d   %s' % (len(marcar), ' '.join(marcar)))
    w('  no se tocan (decision)   : %d   %s' % (len(parar), ' '.join(parar)))
    w('  numero compartido        : %d   %s' % (len(choque), ' '.join(choque)))
    w('  tranvia, intacto         : %d   %s' % (len(tranvia), ' '.join(tranvia)))
    for n in sorted(colisiones(lineas)):
        w('      numero %s lo usan: %s' % (n, ' '.join(
            l['id'] for l in lineas if num_linea(l['numero']) == n)))

    en_index = {num_linea(l['numero']) for l in lineas}
    solo_gtfs = sorted(set(secuencias) - en_index, key=lambda x: (len(x), x))
    w('  en el GTFS y no en index : %d' % len(solo_gtfs))
    for n in solo_gtfs:
        w('      %-6s %s' % (secuencias[n]['corto'], secuencias[n]['largo']))

    w('')
    w('## Desvio de cada linea regenerada: parada vieja -> nueva mas cercana')
    w('  %-9s %5s %5s %8s %8s %8s' % ('linea', 'antes', 'ahora', 'mediana', 'p90', 'maximo'))
    filas = []
    for ln in regen:
        s = secuencias[num_linea(ln['numero'])]
        nuevas = [(catalogo[k]['la'], catalogo[k]['lo']) for k in s['paradas'] if k in catalogo]
        ds = []
        for v in ln['paradas']:
            if not nuevas:
                continue
            ds.append(min(metros((v['lat'], v['lng']), n) for n in nuevas))
        ds.sort()
        if ds:
            med = ds[len(ds) // 2]
            p90 = ds[min(len(ds) - 1, int(len(ds) * 0.9))]
            filas.append((med, ln['id'], len(ln['paradas']), len(s['paradas']), med, p90, ds[-1]))
    filas.sort(reverse=True)
    for _, lid, a, b, med, p90, mx in filas:
        w('  %-9s %5d %5d %7.0fm %7.0fm %7.0fm' % (lid, a, b, med, p90, mx))

    if avisos:
        w('')
        w('## Avisos (%d)' % len(avisos))
        for a in avisos[:80]:
            w('  ' + a)
        if len(avisos) > 80:
            w('  ... y %d mas' % (len(avisos) - 80))

    w('')
    w('## Aeropuertos — claves que necesita el arreglo de la seccion 4')
    for etiqueta, patron in (('TFS / Reina Sofia', r'reina sofia|aeropuerto sur|tfs'),
                             ('TFN / Los Rodeos',  r'los rodeos|aeropuerto norte|tfn')):
        hits = [(k, e) for k, e in catalogo.items() if re.search(patron, norm(e['n']))]
        w('  %s: %d' % (etiqueta, len(hits)))
        for k, e in sorted(hits):
            en = sorted(n for n, s in secuencias.items() if k in s['paradas'])
            w('      %-8s %-38s %.5f, %.5f   lineas: %s'
              % (k, e['n'], e['la'], e['lo'], ' '.join(en) or '(ninguna)'))
    return '\n'.join(P) + '\n'


# ─────────────────────────────────────────────────────────────────── main

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('zip', help='Google_transit.zip del GTFS oficial de TITSA')
    ap.add_argument('--emitir', metavar='DIR', help='ademas de informar, escribe los bloques')
    a = ap.parse_args()

    if not zipfile.is_zipfile(a.zip):
        raise SystemExit('ABORTADO: %s no es un ZIP' % a.zip)
    z = zipfile.ZipFile(a.zip)
    avisos = []

    lineas, paradas_viejas = leer_index()
    if not lineas:
        raise SystemExit('ABORTADO: no he podido leer TITSA_LINES de index.html')

    stops = leer_csv(z, 'stops.txt')
    catalogo, alias, agrupadas, sin_muni = construir_catalogo(stops, paradas_viejas, avisos)
    secuencias = construir_secuencias(z, alias, avisos)

    # control 2: integridad referencial
    huerfanas = sum(1 for s in secuencias.values() for k in s['paradas'] if k not in catalogo)
    if huerfanas:
        raise SystemExit('ABORTADO: %d claves de secuencia no estan en el catalogo' % huerfanas)
    # control 4: terminales
    for n, s in secuencias.items():
        assert len(s['terminales']) == 2, 'linea %s: terminales != 2' % n
        assert all(t in s['paradas'] for t in s['terminales']), 'linea %s: terminal fuera de paradas' % n

    txt = informe(catalogo, alias, secuencias, lineas, agrupadas, sin_muni, avisos)
    print(txt)

    if a.emitir:
        os.makedirs(a.emitir, exist_ok=True)
        io.open(os.path.join(a.emitir, 'TITSA_PARADAS.js'), 'w', encoding='utf8').write(
            emitir_catalogo(catalogo))
        io.open(os.path.join(a.emitir, 'secuencias.js'), 'w', encoding='utf8').write(
            emitir_secuencias(lineas, secuencias))
        io.open(os.path.join(a.emitir, 'hidratacion.js'), 'w', encoding='utf8').write(HIDRATACION)
        io.open(os.path.join(a.emitir, 'informe.txt'), 'w', encoding='utf8').write(txt)
        print('escrito en %s/' % a.emitir)


if __name__ == '__main__':
    main()
