#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""El vigia de TITSA: una vez al mes mira el GTFS oficial de las guaguas
(lineas, paradas y horarios) y avisa a quien mantiene la app.

POR QUE EXISTE (22 de noviembre de 2026). Jerome: «Prepara el bots para que
lo verifica cada mes a la misma fecha. Recuerda que debe avisar si no puede
tener acceso a los datos que no queremos que falla y después se queda mudo.
Hazlo bien para también que lo revise siempre que lo hace!».

QUE MIRA, cada vez:
  1. El fichero de TITSA (GTFS_URL, el que enlaza la ficha de su conjunto en
     el portal de datos abiertos del Cabildo): que se baja, que es un GTFS
     que se puede leer (sus ficheros y sus filas) y su huella.
  2. Sus fechas: el primer y el ultimo dia con servicio, los dias sin
     ninguno, los viajes de cada dia y hasta que dia llega el horario
     completo de los laborables. Esto ultimo se DEDUCE de los viajes (TITSA
     no lo dice en ninguna parte) y el informe lo dice asi.
  3. La red contra la app (datos/titsa.js): lineas y paradas del GTFS que la
     app no tiene, y al reves. La app no se toca: la red se regenera con
     tools/gtfs_red.py, leyendo su informe, y eso lo decide una persona.
  4. La ficha del portal (su API): que la licencia sigue siendo la que cita
     el credito del panel de guaguas (cc-by).
  5. Se revisa a si mismo: vuelve a leer lo que ha guardado y comprueba que
     cuadra con lo que ha visto, y cuenta otra vez, de otra forma, la huella
     del fichero y sus lineas. Si algo no cuadra, es una alarma.

COMO AVISA. Siempre escribe su informe (--informe), tambien cuando todo esta
en orden, y su nivel (--nivel): «en-orden», «aviso» o «alarma».
  · alarma: no ha podido bajar o leer el GTFS (la red, el certificado, el
    robots.txt, una pagina de bloqueo en lugar del fichero, un ZIP roto o sin
    sus ficheros), los datos ya han caducado, la red de la app no se puede
    leer, o el vigia no cuadra consigo mismo. Sale con 1: el flujo abre una
    incidencia y se pone en rojo.
  · aviso: los datos acaban en menos de AVISO_FIN_DIAS dias, el horario
    completo en menos de AVISO_HORARIO_DIAS, hay dias sin ningun servicio, el
    fichero es el mismo que el de la vuelta anterior, la ficha del portal no
    se puede leer o su licencia ha cambiado, o la red difiere de la app de
    una forma nueva. El flujo abre (o comenta) una incidencia.
  · Nunca se queda callado: cada vuelta guarda su fecha y lo que ha visto en
    tools/datos/vigia-titsa.json, aunque no cambie nada mas; si el script se
    cae sin dejar su informe, el flujo lo cuenta como alarma.

EL CERTIFICADO. www.titsa.com no manda su certificado intermedio (Sectigo
Public Server Authentication CA OV R36): un navegador lo busca solo, Python
no. Va en tools/certificados/ y se comprueba por su huella SHA-256
(INTERMEDIO_SHA256) antes de usarlo; la cadena se sigue verificando entera,
hasta una raiz de confianza del sistema. Nunca se desactiva la verificacion.
Si TITSA cambia de certificado y el nuevo no cuadra, es una alarma que lo
dice.

EL FLUJO (.github/workflows/vigia-titsa.yml): el dia 22 de cada mes; con
alarma o aviso abre una incidencia en GitHub (o comenta la abierta), con
alarma se pone en rojo, y guarda la vuelta en el repo.

Uso:
  python3 tools/vigia_titsa.py --informe /tmp/titsa.md --nivel /tmp/titsa.nivel
  python3 tools/vigia_titsa.py --zip Google_transit.zip --informe ...  (con un fichero ya bajado)
  python3 tools/vigia_titsa.py --probar                                 (sus controles, sin red)
"""
import argparse
import csv
import datetime as dt
import hashlib
import html
import io
import json
import os
import re
import ssl
import sys
import tempfile
import time
import urllib.error
import urllib.request
import urllib.robotparser
import zipfile
from collections import Counter, defaultdict

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ESTADO = os.path.join(RAIZ, 'tools', 'datos', 'vigia-titsa.json')
RED_APP = os.path.join(RAIZ, 'datos', 'titsa.js')
FLUJO = os.path.join(RAIZ, '.github', 'workflows', 'vigia-titsa.yml')
INTERMEDIO = os.path.join(RAIZ, 'tools', 'certificados', 'sectigo-public-server-authentication-ca-ov-r36.pem')
INTERMEDIO_SHA256 = '6542d176bed50f193c0ce297ae44ecd8a0a86bec2ede682769344059b4e78530'

GTFS_URL = 'https://www.titsa.com/Google_transit.zip'
PORTAL_API = ('https://datos.tenerife.es/ckan/api/3/action/package_show'
              '?id=informacion-sobre-el-sistema-de-transporte-de-titsa-en-tenerife')
PORTAL_FICHA = ('https://datos.tenerife.es/es/datos/conjuntos-de-datos/'
                'informacion-sobre-el-sistema-de-transporte-de-titsa-en-tenerife')
LICENCIA = 'cc-by'
TITULO_INCIDENCIA = 'TITSA: revisar los datos de las guaguas'
UA = 'TenerifeGo/1.0 (+https://tenerifego.app/)'

TOPE_ZIP = 80_000_000          # el fichero bajado (hoy, 21 MB)
TOPE_JSON = 2_000_000          # la respuesta del portal
TOPE_TXT = 300_000_000         # cada fichero de dentro, descomprimido (hoy, el mayor: 51 MB)
TOPE_TOTAL = 600_000_000       # todos juntos (hoy, 85 MB)
NECESARIOS = ('agency.txt', 'routes.txt', 'stops.txt', 'trips.txt', 'stop_times.txt')
AVISO_FIN_DIAS = 60
AVISO_HORARIO_DIAS = 14
UMBRAL_COMPLETO = 0.8          # un laborable con menos del 80 % de los viajes de referencia no es el horario completo
LABORABLES_REF = 10            # los diez primeros laborables desde hoy dan la referencia
MAX_DIAS_CALENDARIO = 800      # una fila de calendar.txt no se recorre mas alla
EJEMPLOS = 12
DIAS = ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')
NOMBRE_DIA = ('lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo')


class SinAcceso(Exception):
    """No se ha podido llegar a los datos: la red, el certificado, el robots.txt, un bloqueo."""


class GTFSMal(Exception):
    """Lo que se ha bajado no es un GTFS que se pueda leer."""


class RedAppMal(Exception):
    """datos/titsa.js no se deja leer como se espera."""


def mil(n):
    """20792042 -> «20.792.042», como se escriben las cifras en castellano."""
    return format(int(n), ',').replace(',', '.')


def rel(ruta):
    return os.path.relpath(ruta, RAIZ)


def num_linea(s):
    """«054» y «54» son la misma linea (como en tools/gtfs_red.py)."""
    s = (s or '').strip()
    return s.lstrip('0') or s


def mediana(xs):
    xs = sorted(xs)
    if not xs:
        return None
    m = len(xs) // 2
    return xs[m] if len(xs) % 2 else (xs[m - 1] + xs[m]) / 2


def fecha_gtfs(s, donde):
    s = (s or '').strip()
    if not re.fullmatch(r'\d{8}', s):
        raise GTFSMal('%s: fecha que no se entiende (%r)' % (donde, s[:20]))
    try:
        return dt.date(int(s[:4]), int(s[4:6]), int(s[6:]))
    except ValueError:
        raise GTFSMal('%s: fecha imposible (%r)' % (donde, s))


def citar(t):
    """Un texto de fuera (de una pagina, del GTFS), como codigo: asi GitHub no
    convierte las @cuentas en menciones ni los #numeros en enlaces a
    incidencias. Igual que en tools/vigia_sos.py."""
    t = str(t).replace('\n', ' ').replace('\r', ' ')
    tira = max([len(x) for x in re.findall(r'`+', t)] or [0])
    v = '`' * (tira + 1)
    if t.startswith('`') or t.endswith('`'):
        t = ' ' + t + ' '
    return v + t + v


def parece_html(b, tipo=''):
    ini = b[:400].lstrip().lower()
    return 'html' in (tipo or '').lower() or ini.startswith((b'<!doctype', b'<html', b'<?xml'))


def texto_html(b, n=240):
    s = b[:200_000].decode('utf-8', 'replace')
    s = re.sub(r'(?is)<(script|style|noscript|template)\b.*?</\1\s*>', ' ', s)
    s = re.sub(r'(?s)<!--.*?-->', ' ', s)
    s = re.sub(r'(?s)<[^>]+>', ' ', s)
    s = re.sub(r'\s+', ' ', html.unescape(s)).strip()
    return s[:n] + ('…' if len(s) > n else '')


# ─────────────────────────────────────────────────────────────── la red

def contexto_tls(ruta=INTERMEDIO, huella=INTERMEDIO_SHA256):
    """Las raices de confianza del sistema mas el intermedio de Sectigo, si su
    huella es la esperada. La verificacion (cadena y nombre) sigue entera."""
    try:
        pem = open(ruta, encoding='ascii').read()
        pem = pem[pem.index('-----BEGIN CERTIFICATE-----'):]
        der = ssl.PEM_cert_to_DER_cert(pem)
    except Exception as e:
        raise SinAcceso('no se pudo leer el certificado intermedio guardado (%s): %s' % (rel(ruta), e))
    if hashlib.sha256(der).hexdigest() != huella:
        raise SinAcceso('el certificado intermedio guardado (%s) no es el esperado: su huella no cuadra, '
                        'y no se usa' % rel(ruta))
    ctx = ssl.create_default_context()
    ctx.load_verify_locations(cadata=pem)
    return ctx


def bajar(url, tope, ctx=None, intentos=2, espera=8):
    """(bytes, cabeceras), o SinAcceso con el motivo, dicho para una persona."""
    ultimo = 'sin respuesta'
    for i in range(intentos):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': UA})
            with urllib.request.urlopen(req, timeout=90, context=ctx) as r:
                b = r.read(tope + 1)
                cab = {'http': r.status, 'tipo': r.headers.get('Content-Type', ''),
                       'modificado': r.headers.get('Last-Modified', ''), 'etag': r.headers.get('ETag', '')}
            if len(b) > tope:
                raise SinAcceso('pasa de %d bytes' % tope)
            return b, cab
        except SinAcceso:
            raise
        except urllib.error.HTTPError as e:
            ultimo = 'el servidor responde HTTP %d' % e.code
            try:
                cuerpo = e.read(200_000)
                if cuerpo and parece_html(cuerpo, e.headers.get('Content-Type', '') if e.headers else ''):
                    ultimo += ', con una página que dice: ' + citar(texto_html(cuerpo))
            except Exception:
                pass
        except urllib.error.URLError as e:
            r = e.reason
            if isinstance(r, ssl.SSLCertVerificationError):
                ultimo = 'su certificado no se pudo verificar (%s)' % (r.verify_message or r)
            else:
                ultimo = 'no se pudo conectar (%s)' % r
        except ssl.SSLCertVerificationError as e:
            ultimo = 'su certificado no se pudo verificar (%s)' % (e.verify_message or e)
        except Exception as e:
            ultimo = '%s: %s' % (type(e).__name__, e)
        if i + 1 < intentos:
            time.sleep(espera * (i + 1))
    raise SinAcceso(ultimo)


def permitido(url, ctx, bajar_fn=bajar):
    """Lo que el robots.txt del sitio no deja leer a un robot, no se lee. Si
    no se puede leer el robots.txt, se lee (como en tools/vigia_sos.py)."""
    host = re.match(r'https://([^/]+)', url).group(1)
    try:
        b, cab = bajar_fn('https://%s/robots.txt' % host, 500_000, ctx, 1, 0)
    except Exception:
        return True
    if parece_html(b, cab.get('tipo', '')):
        return True
    rp = urllib.robotparser.RobotFileParser()
    rp.parse(b.decode('utf-8', 'replace').splitlines())
    return rp.can_fetch(UA, url)


# ──────────────────────────────────────────────────────────── el GTFS

def leer_gtfs(datos):
    """Lee el ZIP en memoria (no saca nada al disco) y devuelve lo que hace falta."""
    try:
        z = zipfile.ZipFile(io.BytesIO(datos))
    except zipfile.BadZipFile:
        if parece_html(datos):
            raise GTFSMal('no es un ZIP: es una página web que dice ' + citar(texto_html(datos)))
        raise GTFSMal('no es un ZIP')
    infos, total = {}, 0
    for i in z.infolist():
        if i.is_dir():
            continue
        nombre = os.path.basename(i.filename).lower()
        total += i.file_size
        if i.file_size > TOPE_TXT:
            raise GTFSMal('%s pasa de %d bytes descomprimido' % (nombre, TOPE_TXT))
        infos.setdefault(nombre, i)
    if total > TOPE_TOTAL:
        raise GTFSMal('lo que lleva dentro pasa de %d bytes descomprimido' % TOPE_TOTAL)
    faltan = [n for n in NECESARIOS if n not in infos]
    if 'calendar.txt' not in infos and 'calendar_dates.txt' not in infos:
        faltan.append('calendar.txt o calendar_dates.txt')
    if faltan:
        raise GTFSMal('le faltan ficheros: ' + ', '.join(faltan))

    def filas(nombre, campos):
        if nombre not in infos:
            return
        try:
            with z.open(infos[nombre]) as f:
                lector = csv.DictReader(io.TextIOWrapper(f, encoding='utf-8-sig', newline=''))
                cab = lector.fieldnames or []
                falta = [c for c in campos if c not in cab]
                if falta:
                    raise GTFSMal('%s no tiene la columna %s' % (nombre, ', '.join(falta)))
                for fila in lector:
                    yield fila
        except GTFSMal:
            raise
        except (csv.Error, UnicodeDecodeError, zipfile.BadZipFile, EOFError, OSError, ValueError) as e:
            raise GTFSMal('%s no se puede leer: %s' % (nombre, e))

    g = {'ficheros': sorted(infos), 'descomprimido': total}
    g['agencias'] = [a.get('agency_name', '') for a in filas('agency.txt', ('agency_name',))]
    g['lineas'] = {}
    for r in filas('routes.txt', ('route_id',)):
        corto = (r.get('route_short_name') or '').strip() or (r.get('route_id') or '').strip()
        g['lineas'][num_linea(corto)] = (r.get('route_long_name') or '').strip()
    g['paradas'] = {r['stop_id'].strip(): (r.get('stop_name') or '').strip() for r in filas('stops.txt', ('stop_id',))}
    viajes_servicio = Counter(r['service_id'].strip() for r in filas('trips.txt', ('trip_id', 'service_id')))
    servidas = set()
    for r in filas('stop_times.txt', ('trip_id', 'stop_id')):
        servidas.add(r['stop_id'].strip())
    g['paradas_servidas'] = servidas

    dias = defaultdict(set)
    for r in filas('calendar.txt', ('service_id', 'start_date', 'end_date') + DIAS):
        ini, fin = fecha_gtfs(r['start_date'], 'calendar.txt'), fecha_gtfs(r['end_date'], 'calendar.txt')
        fin = min(fin, ini + dt.timedelta(days=MAX_DIAS_CALENDARIO))
        marca = [r[d].strip() == '1' for d in DIAS]
        d = ini
        while d <= fin:
            if marca[d.weekday()]:
                dias[d].add(r['service_id'].strip())
            d += dt.timedelta(days=1)
    for r in filas('calendar_dates.txt', ('service_id', 'date', 'exception_type')):
        d, tipo = fecha_gtfs(r['date'], 'calendar_dates.txt'), r['exception_type'].strip()
        if tipo == '1':
            dias[d].add(r['service_id'].strip())
        elif tipo == '2':
            dias[d].discard(r['service_id'].strip())
    g['viajes_dia'] = {d: sum(viajes_servicio[s] for s in ss) for d, ss in dias.items() if ss}
    if not g['viajes_dia']:
        raise GTFSMal('ningún día tiene servicio')
    if not g['lineas'] or not g['paradas']:
        raise GTFSMal('no trae líneas o paradas')
    return g


def horario_completo(viajes, hoy):
    """Hasta que dia llega el horario completo de los laborables (DEDUCIDO).
    Referencia: la mediana de los LABORABLES_REF primeros laborables desde hoy.
    El horario completo acaba el dia antes del primer laborable a partir del
    cual TODOS los laborables bajan del UMBRAL_COMPLETO de la referencia (un
    festivo suelto en medio no lo corta)."""
    lab = [(d, viajes[d]) for d in sorted(viajes) if d >= hoy and d.weekday() < 5]
    if len(lab) < LABORABLES_REF:
        return None
    ref = int(round(mediana([n for _, n in lab[:LABORABLES_REF]])))
    k = len(lab)
    while k > 0 and lab[k - 1][1] < UMBRAL_COMPLETO * ref:
        k -= 1
    if k == len(lab):
        return {'hasta': max(viajes), 'referencia': ref, 'despues': None, 'hasta_el_final': True}
    return {'hasta': lab[k][0] - dt.timedelta(days=1), 'referencia': ref,
            'despues': int(round(mediana([n for _, n in lab[k:]]))), 'hasta_el_final': False}


def leer_red_app(texto):
    """Los numeros de linea de bus y los stop_id de TITSA_PARADAS (las claves y
    sus parejas, el campo «s») de datos/titsa.js, sin ejecutar JS."""
    numeros = re.findall(r'\bid:"bus-[^"]+",\s*numero:"([^"]*)"', texto)
    if len(numeros) != len(re.findall(r'\bid:"bus-', texto)) or len(numeros) < 100:
        raise RedAppMal('leo %d números de línea de %d líneas de bus' % (len(numeros), len(re.findall(r'\bid:"bus-', texto))))
    try:
        i = texto.index('const TITSA_PARADAS = {')
        j = texto.index('\n};', i)
    except ValueError:
        raise RedAppMal('no encuentro TITSA_PARADAS')
    bloque = texto[i:j]
    claves = re.findall(r'^\s*"([^"]+)":\s*\{', bloque, re.M)
    if len(claves) != len(re.findall(r'\bla:', bloque)) or len(claves) < 1000:
        raise RedAppMal('leo %d paradas de %d en TITSA_PARADAS' % (len(claves), len(re.findall(r'\bla:', bloque))))
    ids = set(claves)
    for m in re.finditer(r'\bs:\[([^\]]*)\]', bloque):
        ids.update(re.findall(r'"([^"]+)"', m.group(1)))
    return {num_linea(n) for n in numeros}, ids


def comparar_red(g, lineas_app, paradas_app):
    lin = set(g['lineas'])
    return {
        'lineas_nuevas': sorted(lin - lineas_app, key=lambda x: (len(x), x)),
        'lineas_que_ya_no_estan': sorted(lineas_app - lin, key=lambda x: (len(x), x)),
        'paradas_nuevas': sorted(g['paradas_servidas'] - paradas_app),
        'paradas_que_ya_no_estan': sorted(paradas_app - set(g['paradas'])),
    }


def huella_red(dif):
    return hashlib.sha256(json.dumps(dif, sort_keys=True).encode('utf-8')).hexdigest()


# ─────────────────────────────────────────────────────────── el portal

def mirar_portal(bajar_fn=bajar, permitido_fn=permitido):
    try:
        if not permitido_fn(PORTAL_API, None):
            return {'ok': False, 'error': 'su robots.txt no deja leer la API'}
        b, cab = bajar_fn(PORTAL_API, TOPE_JSON, None)
    except SinAcceso as e:
        return {'ok': False, 'error': str(e)}
    if parece_html(b, cab.get('tipo', '')):
        return {'ok': False, 'error': 'en lugar de los datos devuelve una página que dice ' + citar(texto_html(b))}
    try:
        d = json.loads(b.decode('utf-8'))
        r = d['result']
        if d.get('success') is not True or not isinstance(r, dict):
            raise ValueError('success no es true')
    except Exception:
        return {'ok': False, 'error': 'su respuesta no se puede leer como la API del portal'}
    rec = (r.get('resources') or [{}])[0] or {}
    return {'ok': True, 'licencia': r.get('license_id'), 'licencia_nombre': r.get('license_title'),
            'recurso_modificado': rec.get('last_modified'), 'recurso_bytes': rec.get('size')}


# ─────────────────────────────────────────────────────────── la vuelta

def red_app_fichero():
    with open(RED_APP, encoding='utf-8') as f:
        return leer_red_app(f.read())


def vuelta(hoy, ahora, previo, bajar_fn=bajar, permitido_fn=permitido, zip_local=None,
           red_fn=red_app_fichero, portal_fn=None, contexto_fn=contexto_tls):
    """Una vuelta entera. Devuelve el registro que se guarda; dentro van sus
    alarmas y avisos, y lo necesario para revisarse."""
    alarmas, avisos = [], []
    reg = {'version': 1, 'ultima_vuelta': ahora, 'fuente': GTFS_URL, 'gtfs': None, 'portal': None, 'red': None}
    datos, cab = None, {}
    if zip_local:
        datos, cab = zip_local, {'origen': 'fichero local'}
    else:
        try:
            ctx = contexto_fn()
            if not permitido_fn(GTFS_URL, ctx):
                raise SinAcceso('su robots.txt no deja leerlo')
            datos, cab = bajar_fn(GTFS_URL, TOPE_ZIP, ctx)
        except SinAcceso as e:
            alarmas.append('No se ha podido bajar el GTFS de TITSA (%s): %s.' % (GTFS_URL, e))
    g = None
    if datos is not None:
        try:
            g = leer_gtfs(datos)
        except GTFSMal as e:
            alarmas.append('Lo que se ha bajado de %s no es un GTFS que se pueda leer: %s.' % (GTFS_URL, e))
    if g is not None:
        desde, hasta = min(g['viajes_dia']), max(g['viajes_dia'])
        ini = max(desde, hoy)
        sin = []
        d = ini
        while d <= hasta:
            if d not in g['viajes_dia']:
                sin.append(d.isoformat())
            d += dt.timedelta(days=1)
        hc = horario_completo(g['viajes_dia'], hoy)
        reg['gtfs'] = {
            'sha256': hashlib.sha256(datos).hexdigest(), 'bytes': len(datos),
            'http': cab.get('http'), 'modificado': cab.get('modificado') or cab.get('origen', ''),
            'ficheros': g['ficheros'], 'agencias': g['agencias'],
            'desde': desde.isoformat(), 'hasta': hasta.isoformat(),
            'dias_con_servicio': len(g['viajes_dia']), 'dias_sin_servicio': sin[:60],
            'lineas': len(g['lineas']), 'paradas': len(g['paradas']), 'paradas_con_servicio': len(g['paradas_servidas']),
            'horario_completo_hasta': hc['hasta'].isoformat() if hc else None,
            'horario_completo_hasta_el_final': bool(hc and hc['hasta_el_final']),
            'viajes_laborable_referencia': hc['referencia'] if hc else None,
            'viajes_laborable_despues': hc['despues'] if hc else None,
        }
        if hasta < hoy:
            alarmas.append('Los datos ya han caducado: el último día con servicio es el %s.' % hasta.isoformat())
        elif (hasta - hoy).days < AVISO_FIN_DIAS:
            avisos.append('Los datos acaban pronto: el último día con servicio es el %s (dentro de %d días).'
                          % (hasta.isoformat(), (hasta - hoy).days))
        if sin:
            avisos.append('Hay %d días sin ningún servicio entre hoy y el final: %s.' % (len(sin), ', '.join(sin[:10]) + (' …' if len(sin) > 10 else '')))
        if hc and not hc['hasta_el_final'] and (hc['hasta'] - hoy).days < AVISO_HORARIO_DIAS:
            avisos.append('El horario completo de los laborables acaba pronto: el %s (deducido de los viajes de cada día).'
                          % hc['hasta'].isoformat())
        ant = (previo or {}).get('gtfs') or {}
        if ant.get('sha256') and ant['sha256'] == reg['gtfs']['sha256']:
            avisos.append('El fichero es exactamente el mismo que el de la vuelta anterior (%s): TITSA no lo ha '
                          'rehecho.' % ((previo or {}).get('ultima_vuelta') or '?')[:10])
        # la red, contra la app
        try:
            lin_app, par_app = red_fn()
            dif = comparar_red(g, lin_app, par_app)
            h = huella_red(dif)
            hay = any(dif.values())
            reg['red'] = {'huella': h, 'lineas_app': len(lin_app), 'paradas_app': len(par_app),
                          'cuantas': {k: len(v) for k, v in dif.items()},
                          'ejemplos': {k: v[:200] for k, v in dif.items()},
                          'nombres': {p: g['paradas'].get(p, '') for p in dif['paradas_nuevas'][:EJEMPLOS]}}
            if hay and h != ((previo or {}).get('red') or {}).get('huella'):
                avisos.append('La red del GTFS ya no coincide con la de la app (datos/titsa.js), y es una diferencia '
                              'nueva: hay que mirar el informe de tools/gtfs_red.py y regenerar la red si hace falta.')
        except (RedAppMal, OSError) as e:
            alarmas.append('No se ha podido leer la red de la app (datos/titsa.js) para compararla: %s.' % e)
    # la ficha del portal
    p = (portal_fn or (lambda: mirar_portal(bajar_fn, permitido_fn)))()
    reg['portal'] = p
    if not p.get('ok'):
        avisos.append('No se ha podido leer la ficha del portal de datos abiertos (%s): %s. No se ha comprobado '
                      'la licencia.' % (PORTAL_FICHA, p.get('error')))
    elif p.get('licencia') != LICENCIA:
        avisos.append('La licencia de la ficha del portal ya no es %s: es %s. El crédito del panel de guaguas dice '
                      '«CC BY»: hay que revisarlo.' % (LICENCIA, citar(p.get('licencia'))))
    reg['alarmas'], reg['avisos'] = alarmas, avisos
    reg['nivel'] = 'alarma' if alarmas else ('aviso' if avisos else 'en-orden')
    reg['_datos'] = datos
    return reg


def guardar(ruta, reg):
    os.makedirs(os.path.dirname(os.path.abspath(ruta)), exist_ok=True)
    limpio = {k: v for k, v in reg.items() if not k.startswith('_')}
    tmp = ruta + '.tmp'
    with open(tmp, 'w', encoding='utf-8') as f:
        json.dump(limpio, f, ensure_ascii=False, indent=1, sort_keys=True)
        f.write('\n')
    os.replace(tmp, ruta)


def leer_previo(ruta):
    try:
        with open(ruta, encoding='utf-8') as f:
            d = json.load(f)
        return d if isinstance(d, dict) else {}
    except Exception:
        return {}


def revisarse(ruta, reg):
    """Vuelve a leer lo guardado y lo compara con lo visto; cuenta otra vez,
    de otra forma, la huella del fichero y sus lineas. Devuelve los problemas."""
    mal = []
    try:
        with open(ruta, encoding='utf-8') as f:
            leido = json.load(f)
    except Exception as e:
        return ['lo guardado en %s no se puede volver a leer (%s)' % (rel(ruta), e)]
    for k in ('ultima_vuelta', 'nivel', 'alarmas', 'avisos'):
        if leido.get(k) != reg.get(k):
            mal.append('lo guardado no dice lo mismo que lo visto en «%s»' % k)
    gv, gl = reg.get('gtfs'), leido.get('gtfs')
    if gv:
        if not gl:
            mal.append('lo guardado no trae lo que se ha visto del GTFS')
        else:
            for k in ('sha256', 'bytes', 'desde', 'hasta', 'lineas', 'paradas', 'horario_completo_hasta'):
                if gl.get(k) != gv.get(k):
                    mal.append('lo guardado no dice lo mismo que lo visto en «gtfs.%s»' % k)
            datos = reg.get('_datos')
            if datos is not None:
                h = hashlib.new('sha256')
                for i in range(0, len(datos), 1 << 20):
                    h.update(datos[i:i + (1 << 20)])
                if h.hexdigest() != gv['sha256']:
                    mal.append('la huella del fichero, contada otra vez, no cuadra')
                try:
                    with zipfile.ZipFile(io.BytesIO(datos)) as z:
                        nombre = next(n for n in z.namelist() if os.path.basename(n).lower() == 'routes.txt')
                        lineas = [l for l in z.read(nombre).decode('utf-8-sig').splitlines() if l.strip()]
                    if len(lineas) - 1 < gv['lineas']:
                        mal.append('routes.txt tiene %d filas y el vigía cuenta %d líneas' % (len(lineas) - 1, gv['lineas']))
                except Exception as e:
                    mal.append('routes.txt no se deja contar otra vez (%s)' % e)
    return mal


def informe(reg, hoy):
    g, p, red = reg.get('gtfs'), reg.get('portal') or {}, reg.get('red')
    titulo = {'alarma': TITULO_INCIDENCIA + ' (alarma)', 'aviso': TITULO_INCIDENCIA,
              'en-orden': 'TITSA: los datos de las guaguas, en orden'}[reg['nivel']]
    l = ['# ' + titulo, '',
         'Vuelta del vigía de TITSA (`tools/vigia_titsa.py`) del %s. Mira una vez al mes el GTFS oficial de TITSA '
         '(líneas, paradas y horarios) y lo compara con la red de la app. No toca la app.' % reg['ultima_vuelta'][:10], '']
    if reg['alarmas']:
        l += ['## Alarma: hay que mirarlo ya', ''] + ['- ' + x for x in reg['alarmas']] + ['']
    if reg['avisos']:
        l += ['## Avisos', ''] + ['- ' + x for x in reg['avisos']] + ['']
    l += ['## Lo que ha visto', '']
    if g:
        l.append('- **El fichero**: %s · %s bytes · %s · huella `%s…`' % (
            GTFS_URL, mil(g['bytes']), ('modificado: ' + citar(g['modificado'])) if g.get('modificado') else 'sin fecha', g['sha256'][:12]))
        l.append('- **Las fechas**: del %s al %s, %d días con servicio%s.' % (
            g['desde'], g['hasta'], g['dias_con_servicio'],
            '' if not g['dias_sin_servicio'] else '; %d sin ninguno' % len(g['dias_sin_servicio'])))
        if g.get('horario_completo_hasta'):
            if g.get('horario_completo_hasta_el_final'):
                l.append('- **El horario completo de los laborables** (deducido de los viajes de cada día): hasta el final, '
                         'con unos %s viajes cada laborable.' % mil(g['viajes_laborable_referencia']))
            else:
                d = dt.date.fromisoformat(g['horario_completo_hasta'])
                l.append('- **El horario completo de los laborables** (deducido de los viajes de cada día; TITSA no lo dice): '
                         'hasta el %s %s, con unos %s viajes cada laborable; después, unos %s.' % (
                             NOMBRE_DIA[d.weekday()], g['horario_completo_hasta'], mil(g['viajes_laborable_referencia']),
                             mil(g['viajes_laborable_despues'])))
        l.append('- **La red**: %s líneas y %s paradas (%s con servicio).' % (mil(g['lineas']), mil(g['paradas']), mil(g['paradas_con_servicio'])))
    else:
        l.append('- **El fichero**: no se ha podido leer (mira la alarma).')
    if red:
        c, e = red['cuantas'], red['ejemplos']
        if not any(c.values()):
            l.append('- **Contra la app** (`datos/titsa.js`): las mismas líneas y paradas.')
        else:
            l.append('- **Contra la app** (`datos/titsa.js`, %s líneas de guagua y %s códigos de parada):' % (mil(red['lineas_app']), mil(red['paradas_app'])))
            if c['lineas_nuevas']:
                l.append('  - líneas del GTFS que la app no tiene (%d): %s' % (c['lineas_nuevas'], citar(', '.join(e['lineas_nuevas'][:40]))))
            if c['lineas_que_ya_no_estan']:
                l.append('  - líneas de la app que el GTFS ya no tiene (%d): %s' % (c['lineas_que_ya_no_estan'], citar(', '.join(e['lineas_que_ya_no_estan'][:40]))))
            if c['paradas_nuevas']:
                ej = ['%s %s' % (x, red['nombres'].get(x, '')) for x in e['paradas_nuevas'][:EJEMPLOS]]
                l.append('  - paradas con servicio en el GTFS que la app no tiene (%d), por ejemplo: %s' % (c['paradas_nuevas'], citar('; '.join(ej))))
            if c['paradas_que_ya_no_estan']:
                l.append('  - paradas de la app que el GTFS ya no tiene (%d), por ejemplo: %s' % (c['paradas_que_ya_no_estan'], citar(', '.join(e['paradas_que_ya_no_estan'][:EJEMPLOS]))))
    if p.get('ok'):
        l.append('- **La ficha del portal**: licencia %s%s.' % (
            citar(p.get('licencia')), (', recurso modificado el ' + citar(p['recurso_modificado'])) if p.get('recurso_modificado') else ''))
    elif p:
        l.append('- **La ficha del portal**: no se ha podido leer.')
    l.append('- **Se ha revisado a sí mismo**: %s' % ('lo guardado cuadra con lo visto.' if not reg.get('_revision') else
                                                     'NO cuadra (mira la alarma).'))
    l += ['', '## Qué hacer', '']
    if reg['alarmas']:
        l.append('- Leer la alarma. Si es la red o un bloqueo, volver a lanzar el flujo a mano más tarde (Actions → '
                 '«Vigia TITSA» → Run workflow); si es el certificado o el fichero, mirar qué ha cambiado en titsa.com.')
    if reg['avisos']:
        l.append('- Leer cada aviso. Ninguno toca la app solo: lo que haya que cambiar, lo cambia una persona con su fuente.')
    if not reg['alarmas'] and not reg['avisos']:
        l.append('- Nada: todo en orden.')
    l.append('- Cuando esté revisado, se cierra esta incidencia diciendo qué se ha hecho.' if reg['nivel'] != 'en-orden' else '')
    return '\n'.join(x for x in l if x is not None).rstrip() + '\n'


def ejecutar(ruta_estado, ruta_informe, ruta_nivel, hoy=None, ahora=None, **kw):
    ahora = ahora or dt.datetime.now(dt.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
    hoy = hoy or dt.date.fromisoformat(ahora[:10])
    previo = leer_previo(ruta_estado)
    reg = vuelta(hoy, ahora, previo, **kw)
    guardar(ruta_estado, reg)
    mal = revisarse(ruta_estado, reg)
    if mal:
        reg['_revision'] = mal
        reg['alarmas'] = reg['alarmas'] + ['El vigía no cuadra consigo mismo: ' + '; '.join(mal) + '.']
        reg['nivel'] = 'alarma'
        guardar(ruta_estado, reg)
    txt = informe(reg, hoy)
    if ruta_informe:
        with open(ruta_informe, 'w', encoding='utf-8') as f:
            f.write(txt)
    if ruta_nivel:
        with open(ruta_nivel, 'w', encoding='utf-8') as f:
            f.write(reg['nivel'] + '\n')
    return reg, txt


# ────────────────────────────────────────────────────── los controles

def _zip(ficheros):
    b = io.BytesIO()
    with zipfile.ZipFile(b, 'w', zipfile.ZIP_DEFLATED) as z:
        for n, t in ficheros.items():
            z.writestr(n, t)
    return b.getvalue()


def _gtfs_prueba(hoy, dias=180, completo=30, quitar=(), lineas=('101', '102', '015'), sin_dia=None,
                 festivo=None, con_9999=False):
    """Un GTFS pequeno: cada laborable 10 viajes hasta hoy+completo y 4 despues
    (el dia «festivo», 3); los fines de semana, 3. Tres paradas en stops.txt
    (la 9999, con un nombre que lleva @ y #, solo con servicio si con_9999)."""
    cd = ['service_id,date,exception_type']
    trips = ['route_id,service_id,trip_id']
    st = ['trip_id,arrival_time,departure_time,stop_id,stop_sequence']
    for k in range(dias):
        d = hoy + dt.timedelta(days=k)
        if sin_dia is not None and k == sin_dia:
            continue
        sid = 'S%d' % k
        cd.append('%s,%s,1' % (sid, d.strftime('%Y%m%d')))
        n = (10 if k < completo else 4) if d.weekday() < 5 else 3
        if festivo is not None and k == festivo:
            n = 3
        for t in range(n):
            tid = 'T%d_%d' % (k, t)
            trips.append('R1,%s,%s' % (sid, tid))
            st.append('%s,08:00:00,08:00:00,1100,1' % tid)
            st.append('%s,08:10:00,08:10:00,%s,2' % (tid, '9999' if con_9999 and t == 0 else '1101'))
    f = {
        'agency.txt': 'agency_id,agency_name,agency_url,agency_timezone\nT,TITSA,http://www.titsa.com,Atlantic/Canary\n',
        'routes.txt': 'route_id,route_short_name,route_long_name,route_type\n' + ''.join(
            'R%d,%s,Linea %s,3\n' % (i + 1, n, n) for i, n in enumerate(lineas)),
        'stops.txt': 'stop_id,stop_name,stop_lat,stop_lon\n1100,Acoran,28.4,-16.3\n1101,Atabara,28.4,-16.3\n9999,@nueva #12,28.4,-16.3\n',
        'trips.txt': '\n'.join(trips) + '\n',
        'stop_times.txt': '\n'.join(st) + '\n',
        'calendar_dates.txt': '\n'.join(cd) + '\n',
    }
    for q in quitar:
        f.pop(q, None)
    return _zip(f)


def probar():
    global TOPE_TXT, TOPE_TOTAL
    fallos = []

    def ok(c, txt):
        print(('  OK  ' if c else '  MAL ') + txt)
        if not c:
            fallos.append(txt)

    hoy = dt.date(2099, 1, 5)  # un lunes
    ahora = '2099-01-05T05:23:00Z'
    portal_bien = lambda: {'ok': True, 'licencia': 'cc-by', 'licencia_nombre': 'Creative Commons Attribution',
                           'recurso_modificado': '2099-01-05T00:00:46', 'recurso_bytes': 1}
    app_igual = lambda: ({'101', '102', '15'}, {'1100', '1101'})

    def red(zipb, tipo='application/zip', caer=None):
        def f(url, tope, ctx=None, intentos=2, espera=8):
            if caer:
                raise SinAcceso(caer)
            if url.endswith('robots.txt'):
                return b'User-agent: *\nDisallow: /administrator/\n', {'http': 200, 'tipo': 'text/plain'}
            return zipb, {'http': 200, 'tipo': tipo, 'modificado': 'Mon, 05 Jan 2099 04:07:42 GMT'}
        return f

    def una(tmp, nombre, **kw):
        ruta = kw.pop('ruta', None) or os.path.join(tmp, nombre + '.json')
        inf, niv = os.path.join(tmp, nombre + '.md'), os.path.join(tmp, nombre + '.nivel')
        kw.setdefault('portal_fn', portal_bien)
        kw.setdefault('red_fn', app_igual)
        kw.setdefault('contexto_fn', lambda: None)
        kw.setdefault('permitido_fn', lambda u, c, *a: True)
        reg, txt = ejecutar(ruta, inf, niv, hoy=kw.pop('hoy', hoy), ahora=kw.pop('ahora', ahora), **kw)
        return reg, txt, open(niv, encoding='utf-8').read().strip(), ruta

    # el certificado: con su huella, se usa; con otra, no
    try:
        contexto_tls()
        ok(True, 'el certificado intermedio guardado tiene la huella esperada y se carga')
    except SinAcceso as e:
        ok(False, 'el certificado intermedio guardado: %s' % e)
    try:
        contexto_tls(huella='0' * 64)
        ok(False, 'un certificado con otra huella no se usa')
    except SinAcceso as e:
        ok('no es el esperado' in str(e), 'un certificado con otra huella no se usa')
    ctx = contexto_tls()
    ok(ctx.verify_mode == ssl.CERT_REQUIRED and ctx.check_hostname, 'la verificación sigue entera: certificado obligatorio y nombre comprobado')

    with tempfile.TemporaryDirectory() as tmp:
        gtfs = _gtfs_prueba(hoy)
        reg, txt, niv, ruta = una(tmp, 'bien', bajar_fn=red(gtfs))
        g = reg['gtfs']
        ok(niv == 'en-orden' and not reg['alarmas'] and not reg['avisos'], 'un GTFS bueno y la app igual: en orden %s' % (reg['alarmas'] + reg['avisos']))
        ok(g['desde'] == '2099-01-05' and g['hasta'] == '2099-07-03' and g['dias_con_servicio'] == 180,
           'las fechas: del primer al último día con servicio (%s – %s, %d días)' % (g['desde'], g['hasta'], g['dias_con_servicio']))
        ok(g['horario_completo_hasta'] == '2099-02-03' and g['viajes_laborable_referencia'] == 10 and g['viajes_laborable_despues'] == 4,
           'el horario completo, deducido: hasta el día antes del primer laborable desde el que ya no vuelve (%s)' % g['horario_completo_hasta'])
        ok('deducido' in txt and 'en orden' in txt, 'el informe se escribe también cuando todo va bien, y dice «deducido»')
        ok(json.load(open(ruta, encoding='utf-8'))['ultima_vuelta'] == ahora, 'cada vuelta guarda su fecha: nunca se queda mudo')
        ok('_datos' not in json.load(open(ruta, encoding='utf-8')), 'lo guardado no lleva el fichero')

        reg, txt, niv, _ = una(tmp, 'festivo', bajar_fn=red(_gtfs_prueba(hoy, festivo=10)))
        ok(reg['gtfs']['horario_completo_hasta'] == '2099-02-03' and niv == 'en-orden', 'un festivo suelto (3 viajes un lunes) no corta el horario completo')

        # sin acceso: la red, el certificado, un bloqueo, el robots.txt
        reg, txt, niv, ruta = una(tmp, 'caida', bajar_fn=red(None, caer='no se pudo conectar (timed out)'))
        ok(niv == 'alarma' and 'No se ha podido bajar' in txt and 'timed out' in txt, 'sin red: alarma, con el motivo, en el informe')
        ok(json.load(open(ruta, encoding='utf-8'))['nivel'] == 'alarma', 'y la vuelta se guarda con su alarma')
        reg, txt, niv, _ = una(tmp, 'cert', bajar_fn=red(None, caer='su certificado no se pudo verificar (unable to get local issuer certificate)'))
        ok(niv == 'alarma' and 'certificado' in txt, 'un certificado que no se verifica: alarma que lo dice')
        bloqueo = b'<html><head><style>x{}</style></head><body><h1>Bloqueo de pagina web</h1> Siga a @alguien y vea #12</body></html>'
        reg, txt, niv, _ = una(tmp, 'bloqueo', bajar_fn=red(bloqueo, tipo='text/html'))
        ok(niv == 'alarma' and 'Bloqueo de pagina web' in txt, 'una página de bloqueo en lugar del fichero: alarma, con lo que dice la página')
        ok(txt.count('@alguien') == 1 and re.search(r'`[^`\n]*@alguien[^`\n]*`', txt) is not None, 'lo que dice la página va como código (sin menciones ni enlaces)')
        reg, txt, niv, _ = una(tmp, 'robots', bajar_fn=red(gtfs), permitido_fn=lambda u, c, *a: False)
        ok(niv == 'alarma' and 'robots.txt' in txt, 'si el robots.txt no deja: no se lee, y es alarma')
        def ctx_mal():
            raise SinAcceso('el certificado intermedio guardado (x) no es el esperado: su huella no cuadra, y no se usa')
        reg, txt, niv, _ = una(tmp, 'ctxmal', bajar_fn=red(gtfs), contexto_fn=ctx_mal)
        ok(niv == 'alarma' and 'huella' in txt and reg['gtfs'] is None, 'el certificado guardado cambiado: alarma, y no se baja nada')

        # ficheros rotos, incompletos o demasiado grandes
        reg, txt, niv, _ = una(tmp, 'roto', bajar_fn=red(b'PK\x03\x04 roto'))
        ok(niv == 'alarma' and 'no es un ZIP' in txt, 'un ZIP roto: alarma')
        reg, txt, niv, _ = una(tmp, 'falta', bajar_fn=red(_gtfs_prueba(hoy, quitar=('stop_times.txt',))))
        ok(niv == 'alarma' and 'stop_times.txt' in txt, 'un GTFS sin stop_times.txt: alarma que lo dice')
        reg, txt, niv, _ = una(tmp, 'sincal', bajar_fn=red(_gtfs_prueba(hoy, quitar=('calendar_dates.txt',))))
        ok(niv == 'alarma' and 'calendar' in txt, 'un GTFS sin calendario: alarma')
        malo = _zip({'agency.txt': 'agency_name\nTITSA\n', 'routes.txt': 'route_id,route_short_name\nR1,101\n', 'stops.txt': 'stop_id,stop_name\n1,a\n',
                     'trips.txt': 'route_id,service_id,trip_id\nR1,S,T\n', 'stop_times.txt': 'trip_id,stop_id\nT,1\n',
                     'calendar_dates.txt': 'service_id,date,exception_type\nS,2099-01-05,1\n'})
        reg, txt, niv, _ = una(tmp, 'fecha', bajar_fn=red(malo))
        ok(niv == 'alarma' and 'fecha' in txt, 'una fecha que no es AAAAMMDD: alarma')
        sincol = _zip({'agency.txt': 'agency_name\nTITSA\n', 'routes.txt': 'route_id,route_short_name\nR1,101\n', 'stops.txt': 'stop_id,stop_name\n1,a\n',
                       'trips.txt': 'route_id,trip_id\nR1,T\n', 'stop_times.txt': 'trip_id,stop_id\nT,1\n',
                       'calendar_dates.txt': 'service_id,date,exception_type\nS,20990105,1\n'})
        reg, txt, niv, _ = una(tmp, 'columna', bajar_fn=red(sincol))
        ok(niv == 'alarma' and 'service_id' in txt, 'un fichero sin una columna que hace falta: alarma que la nombra')
        viejo = TOPE_TXT
        TOPE_TXT = 500
        try:
            reg, txt, niv, _ = una(tmp, 'grande', bajar_fn=red(gtfs))
            ok(niv == 'alarma' and 'descomprimido' in txt, 'un fichero de dentro demasiado grande al descomprimir: alarma, y no se lee')
        finally:
            TOPE_TXT = viejo
        viejo = TOPE_TOTAL
        TOPE_TOTAL = 2000
        try:
            reg, txt, niv, _ = una(tmp, 'grande2', bajar_fn=red(gtfs))
            ok(niv == 'alarma' and 'descomprimido' in txt, 'todo junto demasiado grande al descomprimir: alarma')
        finally:
            TOPE_TOTAL = viejo

        # caducado y a punto de caducar
        reg, txt, niv, _ = una(tmp, 'caducado', bajar_fn=red(_gtfs_prueba(dt.date(2098, 12, 1), dias=20)))
        ok(niv == 'alarma' and 'caducado' in txt, 'datos que ya acabaron: alarma')
        reg, txt, niv, _ = una(tmp, 'pronto', bajar_fn=red(_gtfs_prueba(hoy, dias=40)))
        ok(niv == 'aviso' and 'acaban pronto' in txt, 'datos que acaban en menos de %d días: aviso' % AVISO_FIN_DIAS)
        reg, txt, niv, _ = una(tmp, 'horario', bajar_fn=red(_gtfs_prueba(hoy, completo=8)))
        ok(niv == 'aviso' and 'horario completo de los laborables acaba pronto' in txt and reg['gtfs']['horario_completo_hasta'] == '2099-01-12',
           'el horario completo que acaba en menos de %d días: aviso (%s)' % (AVISO_HORARIO_DIAS, reg['gtfs']['horario_completo_hasta']))
        reg, txt, niv, _ = una(tmp, 'hueco', bajar_fn=red(_gtfs_prueba(hoy, sin_dia=3)))
        ok(niv == 'aviso' and '1 días sin ningún servicio' in txt and '2099-01-08' in txt, 'un día sin ningún servicio: aviso con su fecha')

        # el mismo fichero que la vuelta anterior
        ruta_m = os.path.join(tmp, 'mismo.json')
        una(tmp, 'mismo1', ruta=ruta_m, bajar_fn=red(gtfs))
        reg, txt, niv, _ = una(tmp, 'mismo2', ruta=ruta_m, bajar_fn=red(gtfs), hoy=dt.date(2099, 2, 5), ahora='2099-02-05T05:23:00Z')
        ok(niv == 'aviso' and 'exactamente el mismo' in txt, 'el mismo fichero que hace un mes: aviso (TITSA no lo ha rehecho)')

        # la red contra la app
        ruta_r = os.path.join(tmp, 'red.json')
        reg, txt, niv, _ = una(tmp, 'red', ruta=ruta_r, bajar_fn=red(_gtfs_prueba(hoy, lineas=('101', '102', '015', '999'), con_9999=True)),
                               red_fn=lambda: ({'101', '102', '15', '7'}, {'1100', '1101', '1114'}))
        c = reg['red']['cuantas']
        ok(niv == 'aviso' and 'ya no coincide' in txt, 'la red del GTFS distinta de la app: aviso')
        ok(c == {'lineas_nuevas': 1, 'lineas_que_ya_no_estan': 1, 'paradas_nuevas': 1, 'paradas_que_ya_no_estan': 1},
           'contadas las cuatro diferencias: línea nueva (999), línea que ya no está (7), parada nueva (9999) y parada que ya no está (1114): %s' % c)
        ok('`999`' in txt and '`7`' in txt and '`1114`' in txt, 'el informe las nombra')
        ok(txt.count('@nueva') == 1 and re.search(r'`[^`\n]*@nueva #12[^`\n]*`', txt) is not None, 'el nombre de una parada va como código (sin menciones ni enlaces)')
        # un mes despues: otro fichero (un dia mas), las mismas diferencias
        reg2, txt2, niv2, _ = una(tmp, 'red2', ruta=ruta_r, bajar_fn=red(_gtfs_prueba(hoy, dias=181, lineas=('101', '102', '015', '999'), con_9999=True)),
                                  red_fn=lambda: ({'101', '102', '15', '7'}, {'1100', '1101', '1114'}), ahora='2099-01-05T06:00:00Z')
        ok(niv2 == 'en-orden' and not any('ya no coincide' in a for a in reg2['avisos']) and '999' in txt2,
           'la misma diferencia la vuelta siguiente no vuelve a avisar, pero sigue en el informe')
        def app_rota():
            raise RedAppMal('leo 0 números de línea de 0 líneas de bus')
        reg, txt, niv, _ = una(tmp, 'appmal', bajar_fn=red(gtfs), red_fn=app_rota)
        ok(niv == 'alarma' and 'red de la app' in txt, 'si la red de la app no se deja leer: alarma (no compara a ciegas)')
        try:
            leer_red_app('const TITSA_LINES = [{id:"bus-1", numero:"1"}];')
            ok(False, 'leer_red_app: una red de juguete no pasa')
        except RedAppMal:
            ok(True, 'leer_red_app: una red de juguete (o un fichero cambiado) no pasa: no compara a ciegas')

        # el portal
        reg, txt, niv, _ = una(tmp, 'portal', bajar_fn=red(gtfs), portal_fn=lambda: {'ok': False, 'error': 'en lugar de los datos devuelve una página que dice `Bloqueo`'})
        ok(niv == 'aviso' and 'No se ha podido leer la ficha del portal' in txt and 'No se ha comprobado' in txt, 'la ficha del portal bloqueada: aviso (no se ha comprobado la licencia)')
        reg, txt, niv, _ = una(tmp, 'licencia', bajar_fn=red(gtfs), portal_fn=lambda: {'ok': True, 'licencia': 'cc-by-sa'})
        ok(niv == 'aviso' and 'ya no es cc-by' in txt and 'cc-by-sa' in txt, 'otra licencia en el portal: aviso')
        def portal_red(url, tope, ctx=None, intentos=2, espera=8):
            if url.endswith('robots.txt'):
                raise SinAcceso('HTTP 404')
            return b'<html><body>Bloqueo de pagina web 7704</body></html>', {'http': 200, 'tipo': 'text/html'}
        p = mirar_portal(portal_red, lambda u, c, *a: True)
        ok(not p['ok'] and 'Bloqueo' in p['error'], 'mirar_portal: una página de bloqueo con HTTP 200 no pasa por datos')
        p = mirar_portal(lambda *a, **k: (b'{"success": true, "result": {"license_id": "cc-by", "resources": [{"last_modified": "x"}]}}', {'http': 200, 'tipo': 'application/json'}),
                         lambda u, c, *a: True)
        ok(p['ok'] and p['licencia'] == 'cc-by' and p['recurso_modificado'] == 'x', 'mirar_portal: la respuesta de la API se lee')
        p = mirar_portal(lambda *a, **k: (b'{"success": false}', {'http': 200, 'tipo': 'application/json'}), lambda u, c, *a: True)
        ok(not p['ok'], 'mirar_portal: «success» que no es true no pasa')

        # se revisa a si mismo
        reg, txt, niv, ruta = una(tmp, 'revisar', bajar_fn=red(gtfs))
        cambiado = dict(reg, gtfs=dict(reg['gtfs'], hasta='2000-01-01'))
        mal = revisarse(ruta, cambiado)
        ok(bool(mal) and any('gtfs.hasta' in x for x in mal), 'si lo guardado no dice lo mismo que lo visto, lo ve')
        cambiado = dict(reg, _datos=reg['_datos'] + b'x')
        ok(any('huella' in x for x in revisarse(ruta, cambiado)), 'la huella del fichero, contada otra vez')
        cambiado = dict(reg, gtfs=dict(reg['gtfs'], lineas=99))
        mal = revisarse(ruta, cambiado)
        ok(any('routes.txt tiene' in x for x in mal), 'las líneas, contadas otra vez de otra forma')
        ruta_x = os.path.join(tmp, 'x.json')
        open(ruta_x, 'w', encoding='utf-8').write('{roto')
        ok(any('no se puede volver a leer' in x for x in revisarse(ruta_x, reg)), 'lo guardado roto: lo ve')
        ok(revisarse(ruta, reg) == [], 'y lo guardado bien: cuadra')

        # el informe y el nivel, siempre
        for nombre in ('bien', 'caida', 'pronto', 'bloqueo'):
            ok(os.path.getsize(os.path.join(tmp, nombre + '.md')) > 200 and open(os.path.join(tmp, nombre + '.nivel'), encoding='utf-8').read().strip() in ('en-orden', 'aviso', 'alarma'),
               'el informe y el nivel se escriben siempre (%s)' % nombre)

    # la red de verdad de la app se deja leer
    if os.path.exists(RED_APP):
        try:
            lin, par = red_app_fichero()
            ok(len(lin) >= 150 and len(par) >= 2500, 'la red de la app (datos/titsa.js) se deja leer: %d líneas de guagua y %d stop_id' % (len(lin), len(par)))
        except RedAppMal as e:
            ok(False, 'la red de la app (datos/titsa.js) se deja leer: %s' % e)

    # el flujo: el dia 22, a mano tambien, la incidencia con el mismo titulo, y que no se queda mudo
    if os.path.exists(FLUJO):
        y = open(FLUJO, encoding='utf-8').read()
        ok(re.search(r"cron:\s*'23 5 22 \* \*'", y) is not None and 'workflow_dispatch:' in y, 'el flujo: el día 22 de cada mes (05:23 UTC) y a mano')
        ok(TITULO_INCIDENCIA in y, 'el flujo abre la incidencia con el mismo título que el informe')
        ok(y.count('if: always()') >= 2 and "steps.avisar.outcome == 'success'" in y, 'el flujo avisa aunque el vigía se caiga, y guarda la vuelta solo después de avisar')
        ok('NIVEL=alarma' in y and 'exit 1' in y, 'el flujo: si el vigía no deja informe o nivel, es alarma; con alarma, en rojo')
        ok(re.search(r'permissions:\s*\n\s*contents: write\s*\n\s*issues: write\s*\n', y) is not None, 'el flujo: solo los permisos que necesita (contenido e incidencias)')
        ok('${{ github.event' not in y, 'el flujo no mete en sus órdenes nada que venga del evento')
        ok('tools/datos/vigia-titsa.json' in y and 'python3 tools/vigia_titsa.py --informe' in y, 'el flujo corre este vigía y guarda su vuelta')
    else:
        ok(False, 'el flujo .github/workflows/vigia-titsa.yml existe')

    print('RESULTADO: ' + ('EN VERDE' if not fallos else '%d fallo(s)' % len(fallos)))
    return 1 if fallos else 0


def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument('--informe', help='donde escribir el informe en Markdown (siempre se escribe)')
    ap.add_argument('--nivel', help='donde escribir el nivel: en-orden, aviso o alarma')
    ap.add_argument('--estado', default=ESTADO)
    ap.add_argument('--zip', help='un GTFS ya bajado, en lugar de bajarlo')
    ap.add_argument('--probar', action='store_true')
    a = ap.parse_args(argv)
    if a.probar:
        return probar()
    kw = {}
    if a.zip:
        with open(a.zip, 'rb') as f:
            kw['zip_local'] = f.read()
    reg, txt = ejecutar(a.estado, a.informe, a.nivel, **kw)
    g = reg.get('gtfs') or {}
    print('Vigía TITSA: %s · %s · del %s al %s · %s líneas · %d alarma(s), %d aviso(s)' % (
        reg['nivel'], g.get('modificado', '-'), g.get('desde', '-'), g.get('hasta', '-'), g.get('lineas', '-'),
        len(reg['alarmas']), len(reg['avisos'])))
    for x in reg['alarmas']:
        print('  ALARMA: ' + x)
    for x in reg['avisos']:
        print('  AVISO: ' + x)
    return 1 if reg['nivel'] == 'alarma' else 0


if __name__ == '__main__':
    sys.exit(main())
