#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Terremotos del IGN cerca de Tenerife, para el panel SOS de la app.

POR QUE EXISTE (22 de octubre de 2026). El panel 🆘 EMERGENCIAS explica que
hacer, pero no puede decir que esta pasando: eso lo dicen el 112 y ES-Alert.
Lo que si se puede ensenar con su fecha y su fuente es lo que mide el IGN: los
terremotos de los ultimos diez dias cerca de la isla. La app no puede pedirlo
al IGN desde el navegador (otro dominio), asi que este robot lo baja aqui y lo
deja en datos/sismos-ign.json, que la app lee de su propio dominio.

DE DONDE SALE. Del canal GeoRSS del Instituto Geografico Nacional, «los
terremotos ocurridos en Espana durante los ultimos diez dias»:
  https://www.ign.es/ign/RssTools/sismologia.xml
(es el que leen la integracion «IGN Sismologia» de Home Assistant y la
biblioteca georss-ign-sismologia-client). Cada <item> trae:
  · <title>  «-Info.terremoto: DD/MM/YYYY HH:MM:SS»
  · <link>   la ficha del IGN, con el identificador (evid=es2026xxxxx)
  · <description> «Se ha producido un terremoto de magnitud M en LUGAR en la
              fecha DD/MM/YYYY HH:MM:SS en la siguiente localizacion: LAT,LON»
  · <geo:lat>, <geo:long>
El IGN avisa de que la informacion se revisa y puede cambiar: la app lo dice.

LA HORA: COMPROBAR UNA VEZ ANTES DE ENCENDERLO. Los catalogos del IGN van en
hora UTC (la pagina de ultimos terremotos da fecha y hora UTC y aparte la
local, con asterisco). Este lector toma la hora del canal como UTC. Antes de
encender el robot: un terremoto del canal, contra su ficha (el enlace evid),
que da las dos. Si el canal fuera en hora local, cambiar HORA_DEL_CANAL.

LA ZONA. Una caja alrededor de Tenerife con su mar, que deja fuera La Gomera
y Gran Canaria: latitud 27,85 a 28,75 y longitud -17,05 a -15,95 (la caja de
la app, un poco mas ancha por el mar).

COMO NO SE ENSENA NADA FALSO.
  · Si la descarga o la lectura falla, NO se escribe nada: el fichero se queda
    con su ultima comprobacion buena y su hora («consultado»), y la app, a las
    6 horas, dice que no ha podido comprobar y manda a la web del IGN.
  · Si el canal no es el del IGN, no trae <channel> o trae elementos y no se
    entiende ninguno, se para sin escribir.
  · Un elemento al que le falta la magnitud, la hora o la posicion se descarta
    (y se cuenta en «descartados»); no se adivina nada.
  · Sin cambios, solo se reescribe cada 3 horas, para renovar «consultado».
No se traduce nada aqui: el lugar va tal cual lo escribe el IGN.

Uso:
  python3 tools/sismos_ign.py                          baja y escribe si toca
  python3 tools/sismos_ign.py --rss R.xml --ahora 2026-10-22T12:00:00Z
                                                       sin red (pruebas)
  python3 tools/sismos_ign.py --salida OTRO.json       escribe en otro sitio
  python3 tools/sismos_ign.py --probar                 sus controles, sin red
"""
import argparse
import datetime as dt
import json
import os
import re
import sys
import tempfile
import time
import urllib.request
import xml.etree.ElementTree as ET

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SALIDA = os.path.join(RAIZ, 'datos', 'sismos-ign.json')
CANAL = 'https://www.ign.es/ign/RssTools/sismologia.xml'
WEB = 'https://www.ign.es/web/ign/portal/vlc-ultimo-terremoto/-/terremotos-canarias/get10dias'
ZONA = {'lat': [27.85, 28.75], 'lon': [-17.05, -15.95]}
HORA_DEL_CANAL = dt.timezone.utc
LATIDO = dt.timedelta(hours=3)
GEO = '{http://www.w3.org/2003/01/geo/wgs84_pos#}'
UA = 'TenerifeGo/1.0 (+https://jerome4551.github.io/tenerife-go/)'
FICHA = re.compile(r'^https?://www\.ign\.es/web/ign/portal/sis-catalogo-terremotos/-/catalogo-terremotos/detailTerremoto\?evid=([A-Za-z0-9]+)$')


class Parar(Exception):
    """Algo no cuadra: no se escribe nada."""


def bajar(url, tope=2_000_000):
    ultimo = None
    for intento in range(3):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': UA})
            with urllib.request.urlopen(req, timeout=60) as r:
                b = r.read(tope + 1)
            if len(b) > tope:
                raise Parar(f'{url}: mas de {tope} bytes')
            return b
        except Parar:
            raise
        except Exception as e:  # red: se reintenta
            ultimo = e
            time.sleep(10 * (intento + 1))
    raise Parar(f'{url}: {ultimo}')


def fecha_iso(s):
    d = dt.datetime.fromisoformat(s.strip().replace('Z', '+00:00'))
    if d.tzinfo is None:
        raise Parar(f'fecha sin zona horaria: {s}')
    return d


def hora_ign(s):
    """«18/03/2019 19:34:55» (hora del canal) -> datetime UTC."""
    m = re.search(r'(\d{1,2})/(\d{1,2})/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})', s or '')
    if not m:
        return None
    d, mes, a, h, mi, se = (int(x) for x in m.groups())
    try:
        return dt.datetime(a, mes, d, h, mi, se, tzinfo=HORA_DEL_CANAL).astimezone(dt.timezone.utc)
    except ValueError:
        return None


def numero(s):
    try:
        v = float(str(s).strip().replace(',', '.'))
    except (TypeError, ValueError):
        return None
    return v if v == v and abs(v) != float('inf') else None


def leer(rss, ahora):
    try:
        raiz = ET.fromstring(rss)
    except ET.ParseError as e:
        raise Parar(f'el canal no es XML: {e}')
    canal = raiz.find('channel')
    if canal is None:
        raise Parar('el canal no tiene <channel>')
    titulo = (canal.findtext('title') or '').strip()
    if 'IGN' not in titulo or 'Sismolog' not in titulo:
        raise Parar(f'no es el canal de sismologia del IGN: {titulo!r}')
    items = canal.findall('item')
    sismos, descartados, entendidos = [], 0, 0
    for it in items:
        desc = (it.findtext('description') or '').strip()
        enlace = (it.findtext('link') or '').strip()
        mag = re.search(r'magnitud\s+([0-9]+(?:[.,][0-9]+)?)\s+en\s+(.+?)\s+en la fecha', desc)
        t = hora_ign(it.findtext('title')) or hora_ign(desc)
        lat, lon = numero(it.findtext(GEO + 'lat')), numero(it.findtext(GEO + 'long'))
        ficha = FICHA.match(enlace)
        if not (mag and t and lat is not None and lon is not None and ficha):
            descartados += 1
            continue
        entendidos += 1
        m = numero(mag.group(1))
        lugar = re.sub(r'\s+', ' ', mag.group(2)).strip()
        if m is None or not (0 <= m < 10) or not lugar or len(lugar) > 79:
            descartados += 1
            continue
        if t > ahora + dt.timedelta(minutes=10):
            descartados += 1   # una hora del futuro: algo esta mal leido
            continue
        if not (ZONA['lat'][0] <= lat <= ZONA['lat'][1] and ZONA['lon'][0] <= lon <= ZONA['lon'][1]):
            continue
        sismos.append({
            'id': ficha.group(1),
            't': t.strftime('%Y-%m-%dT%H:%M:%SZ'),
            'lat': round(lat, 4), 'lon': round(lon, 4),
            'm': round(m, 1), 'lugar': lugar,
            'url': 'https://www.ign.es/web/ign/portal/sis-catalogo-terremotos/-/catalogo-terremotos/detailTerremoto?evid=' + ficha.group(1),
        })
    if items and not entendidos:
        raise Parar(f'el canal trae {len(items)} elementos y no se entiende ninguno: ha cambiado de forma')
    vistos, unicos = set(), []
    for s in sorted(sismos, key=lambda x: x['t'], reverse=True):
        if s['id'] in vistos:
            continue
        vistos.add(s['id'])
        unicos.append(s)
    return unicos, descartados


def construir(rss, ahora):
    sismos, descartados = leer(rss, ahora)
    return {
        'fuente': 'IGN. Instituto Geográfico Nacional. Terremotos de los últimos diez días (canal GeoRSS).',
        'canal': CANAL,
        'web': WEB,
        'zona': ZONA,
        'consultado': ahora.astimezone(dt.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
        'sismos': sismos,
        'descartados': descartados,
    }


def sin_hora(d):
    return {k: v for k, v in d.items() if k != 'consultado'}


def escribir(nuevo, salida, ahora):
    viejo = None
    if os.path.exists(salida):
        try:
            viejo = json.load(open(salida, encoding='utf-8'))
        except Exception:
            viejo = None
    if viejo and viejo.get('consultado'):
        try:
            hace = ahora - fecha_iso(viejo['consultado'])
        except Exception:
            hace = None
        if sin_hora(viejo) == sin_hora(nuevo) and hace is not None and dt.timedelta(0) <= hace < LATIDO:
            return False
    os.makedirs(os.path.dirname(os.path.abspath(salida)), exist_ok=True)
    tmp = salida + '.tmp'
    with open(tmp, 'w', encoding='utf-8') as fh:
        json.dump(nuevo, fh, ensure_ascii=False, indent=1)
        fh.write('\n')
    os.replace(tmp, salida)
    return True


def probar():
    """Los controles del lector, sin red, con tools/datos/sismos-ign-prueba.xml
    (un canal con la forma del del IGN y terremotos inventados, es2099…)."""
    fallos = []
    def ok(c, txt):
        print(('  OK  ' if c else '  MAL ') + txt)
        if not c:
            fallos.append(txt)
    prueba = open(os.path.join(RAIZ, 'tools', 'datos', 'sismos-ign-prueba.xml'), 'rb').read()
    ahora = fecha_iso('2099-03-20T12:00:00Z')
    d = construir(prueba, ahora)
    ids = [s['id'] for s in d['sismos']]
    ok(ids == ['es2099aaaab', 'es2099aaaaa'], 'solo los de la caja de Tenerife, del mas reciente al mas antiguo: %s' % ids)
    ok(d['descartados'] == 2, 'los dos elementos sin magnitud o sin posicion se descartan (%d)' % d['descartados'])
    ok(d['sismos'][0]['t'] == '2099-03-19T23:05:10Z' and d['sismos'][0]['m'] == 3.1, 'hora UTC y magnitud: %s' % d['sismos'][0])
    ok(d['sismos'][1]['lugar'] == 'LAS CAÑADAS DEL TEIDE.ITF', 'el lugar, tal cual: %r' % d['sismos'][1]['lugar'])
    for malo, que in [(b'<rss><channel><title>Otra cosa</title></channel></rss>', 'otro canal'),
                      (b'no es xml', 'no es XML'),
                      (b'<rss><channel><title>GeoRSS Sismolog\xc3\xada IGN</title><item><title>x</title></item></channel></rss>', 'ningun elemento entendido')]:
        try:
            construir(malo, ahora)
            ok(False, 'para con %s' % que)
        except Parar:
            ok(True, 'para con %s' % que)
    vacio = construir(b'<rss><channel><title>GeoRSS Sismolog\xc3\xada IGN</title></channel></rss>', ahora)
    ok(vacio['sismos'] == [], 'sin terremotos: lista vacia, no un error')
    with tempfile.TemporaryDirectory() as tmp:
        sal = os.path.join(tmp, 'sismos.json')
        ok(escribir(d, sal, ahora), 'escribe la primera vez')
        d2 = construir(prueba, ahora + dt.timedelta(minutes=50))
        ok(not escribir(d2, sal, ahora + dt.timedelta(minutes=50)), 'sin cambios y antes de 3 h: no reescribe')
        d3 = construir(prueba, ahora + dt.timedelta(hours=3, minutes=5))
        ok(escribir(d3, sal, ahora + dt.timedelta(hours=3, minutes=5)), 'sin cambios pero a las 3 h: renueva «consultado»')
        antes = open(sal, encoding='utf-8').read()
        r = main(['--rss', os.path.join(tmp, 'no-existe.xml'), '--salida', sal])
        ok(r == 1 and open(sal, encoding='utf-8').read() == antes, 'si falla la lectura no toca el fichero')
    print('RESULTADO: ' + ('EN VERDE' if not fallos else '%d fallo(s)' % len(fallos)))
    return 1 if fallos else 0


def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument('--rss')
    ap.add_argument('--ahora')
    ap.add_argument('--salida', default=SALIDA)
    ap.add_argument('--probar', action='store_true')
    a = ap.parse_args(argv)
    if a.probar:
        return probar()
    ahora = fecha_iso(a.ahora) if a.ahora else dt.datetime.now(dt.timezone.utc)
    try:
        rss = open(a.rss, 'rb').read() if a.rss else bajar(CANAL)
        nuevo = construir(rss, ahora)
    except (Parar, OSError) as e:
        print(f'PARADO, no se escribe nada: {e}')
        return 1
    if escribir(nuevo, a.salida, ahora):
        print(f'Escrito {os.path.relpath(a.salida, RAIZ)}: {len(nuevo["sismos"])} terremoto(s) cerca de Tenerife '
              f'en 10 dias; {nuevo["descartados"]} elemento(s) del canal sin leer')
    else:
        print('Sin cambios y comprobado hace menos de 3 horas: no se reescribe')
    return 0


if __name__ == '__main__':
    sys.exit(main())
