#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Alertas declaradas por el Gobierno de Canarias, para el panel SOS de la app.

POR QUE EXISTE (22 de octubre de 2026). Jerome: «no la enviamos pero
guardamos la app atenta para si se puede tener las informaciones adecuadas y
reales poder tener la gente informada [...] Siempre atentos que es donde
salen las emergencias». Cada vez que el Gobierno de Canarias declara una
prealerta, una alerta o una emergencia (o las da por terminadas), lo publica
como nota en su portal de noticias, en la categoria «Alertas». El portal da
esa categoria como canal RSS 2.0:
  https://www3.gobiernodecanarias.org/noticias/category/alertas/feed/
La app no puede leerlo desde el navegador (otro dominio): este robot lo baja
aqui y deja en datos/alertas-canarias.json los titulares, con su hora y su
enlace, y la app los lee de su propio dominio.

COMO ES EL CANAL (leido el 22 de octubre de 2026). <channel><title> «Alertas
– Portal de Noticias del Gobierno de Canarias»; cada <item> trae <title> (el
titular: «El Gobierno de Canarias actualiza la situación y declara alerta por
lluvias en El Hierro, La Gomera y La Palma»), <link> (la nota, bajo
https://www3.gobiernodecanarias.org/noticias/), <pubDate> en RFC 822 con
zona («Wed, 21 Oct 2026 13:15:11 +0000») y sus <category>.

QUE GUARDA. De cada nota: el titular TAL CUAL, en castellano (un aviso
oficial no se traduce a mano), la hora de publicacion en UTC y el enlace a la
nota. Las 12 mas recientes de los ultimos 30 dias. El panel ensena las de los
ultimos 7 dias, tres como mucho, cada una con su hora; NO decide si tocan a
Tenerife ni lo graves que son: eso lo dice el titular, y la nota entera esta
a un toque.

COMO NO SE ENSENA NADA FALSO.
  · Si la descarga o la lectura falla, NO se escribe nada: el fichero se queda
    con su ultima comprobacion buena y su hora («consultado»), y la app, a las
    6 horas, dice que no ha podido comprobar y manda a la web del Gobierno.
  · Si el canal no es el de Alertas del portal, no trae <channel> o trae
    elementos y no se entiende ninguno, se para sin escribir.
  · Un elemento sin titular, sin una hora que se entienda, con una hora del
    futuro o con un enlace fuera de www3.gobiernodecanarias.org/noticias/ se
    descarta (y se cuenta en «descartados»); no se adivina nada.
  · Sin cambios, solo se reescribe cada 3 horas, para renovar «consultado».

Uso:
  python3 tools/alertas_canarias.py                       baja y escribe si toca
  python3 tools/alertas_canarias.py --rss R.xml --ahora 2026-10-22T12:00:00Z
                                                          sin red (pruebas)
  python3 tools/alertas_canarias.py --salida OTRO.json    escribe en otro sitio
  python3 tools/alertas_canarias.py --probar              sus controles, sin red
"""
import argparse
import datetime as dt
import email.utils
import html
import json
import os
import re
import sys
import tempfile
import time
import urllib.request
import xml.etree.ElementTree as ET

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SALIDA = os.path.join(RAIZ, 'datos', 'alertas-canarias.json')
CANAL = 'https://www3.gobiernodecanarias.org/noticias/category/alertas/feed/'
WEB = 'https://www3.gobiernodecanarias.org/noticias/category/alertas/'
ENLACE_OK = re.compile(r'^https://www3\.gobiernodecanarias\.org/noticias/[A-Za-z0-9._~%/?=&+-]*$')
CUANTAS = 12
DIAS = 30
LATIDO = dt.timedelta(hours=3)
UA = 'TenerifeGo/1.0 (+https://tenerifego.app/)'


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


def hora_rss(s):
    """«Wed, 21 Oct 2026 13:15:11 +0000» -> datetime UTC (None si no se entiende
    o no trae zona)."""
    try:
        d = email.utils.parsedate_to_datetime((s or '').strip())
    except (TypeError, ValueError, IndexError):
        return None
    if d is None or d.tzinfo is None:
        return None
    return d.astimezone(dt.timezone.utc)


def limpio(s):
    """El titular: sin entidades HTML que el portal deje escapadas dos veces
    ni espacios de mas. No se cambia ni una palabra."""
    return re.sub(r'\s+', ' ', html.unescape(s or '')).strip()


def leer(rss, ahora):
    try:
        raiz = ET.fromstring(rss)
    except ET.ParseError as e:
        raise Parar(f'el canal no es XML: {e}')
    canal = raiz.find('channel')
    if canal is None:
        raise Parar('el canal no tiene <channel>')
    titulo = limpio(canal.findtext('title'))
    if not titulo.startswith('Alertas') or 'Gobierno de Canarias' not in titulo:
        raise Parar(f'no es el canal de Alertas del Gobierno de Canarias: {titulo!r}')
    items = canal.findall('item')
    alertas, descartados, entendidos = [], 0, 0
    desde = ahora - dt.timedelta(days=DIAS)
    for it in items:
        tit = limpio(it.findtext('title'))
        enlace = (it.findtext('link') or '').strip()
        t = hora_rss(it.findtext('pubDate'))
        if not (tit and 4 < len(tit) < 300 and t and ENLACE_OK.match(enlace)):
            descartados += 1
            continue
        entendidos += 1
        if t > ahora + dt.timedelta(minutes=10):
            descartados += 1   # una hora del futuro: algo esta mal leido
            continue
        if t < desde:
            continue
        alertas.append({'t': t.strftime('%Y-%m-%dT%H:%M:%SZ'), 'titulo': tit, 'enlace': enlace})
    if items and not entendidos:
        raise Parar(f'el canal trae {len(items)} elementos y no se entiende ninguno: ha cambiado de forma')
    vistos, unicas = set(), []
    for a in sorted(alertas, key=lambda x: x['t'], reverse=True):
        if a['enlace'] in vistos:
            continue
        vistos.add(a['enlace'])
        unicas.append(a)
    return unicas[:CUANTAS], descartados


def construir(rss, ahora):
    alertas, descartados = leer(rss, ahora)
    return {
        'fuente': 'Gobierno de Canarias. Portal de Noticias, categoría «Alertas» (canal RSS).',
        'canal': CANAL,
        'web': WEB,
        'consultado': ahora.astimezone(dt.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
        'alertas': alertas,
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
    """Los controles del lector, sin red, con tools/datos/alertas-canarias-prueba.xml
    (un canal con la forma del del portal y notas inventadas del ano 2099)."""
    fallos = []
    def ok(c, txt):
        print(('  OK  ' if c else '  MAL ') + txt)
        if not c:
            fallos.append(txt)
    prueba = open(os.path.join(RAIZ, 'tools', 'datos', 'alertas-canarias-prueba.xml'), 'rb').read()
    ahora = fecha_iso('2099-03-20T12:00:00Z')
    d = construir(prueba, ahora)
    tits = [a['titulo'] for a in d['alertas']]
    ok(len(tits) == 3, 'tres notas validas de los ultimos 30 dias: %s' % tits)
    ok(tits[0].startswith('PRUEBA · El Gobierno de Canarias declara la prealerta por lluvias'), 'la mas reciente primero: %r' % tits[:1])
    ok(d['alertas'][0]['t'] == '2099-03-20T09:30:00Z', 'la hora, pasada a UTC (venia en +0100): %s' % d['alertas'][0]['t'])
    ok('«Alerta máxima»' in tits[1] and '&' not in tits[1], 'las entidades se leen, el titular no cambia: %r' % tits[1])
    ok(d['descartados'] == 3, 'se descartan la de otra web, la de sin fecha y la del futuro (%d)' % d['descartados'])
    ok(all(a['enlace'].startswith('https://www3.gobiernodecanarias.org/noticias/') for a in d['alertas']), 'solo enlaces del portal')
    ok(not any('enero' in a['titulo'] for a in d['alertas']), 'la de hace mas de 30 dias no entra')
    ok(len({a['enlace'] for a in d['alertas']}) == len(d['alertas']), 'la repetida sale una vez')
    for malo, que in [(b'<rss><channel><title>Otra cosa</title></channel></rss>', 'otro canal'),
                      (b'no es xml', 'no es XML'),
                      ('<rss><channel><title>Alertas – Portal de Noticias del Gobierno de Canarias</title><item><title>x</title></item></channel></rss>'.encode('utf-8'), 'ningun elemento entendido')]:
        try:
            construir(malo, ahora)
            ok(False, 'para con %s' % que)
        except Parar:
            ok(True, 'para con %s' % que)
    vacio = construir('<rss><channel><title>Alertas – Portal de Noticias del Gobierno de Canarias</title></channel></rss>'.encode('utf-8'), ahora)
    ok(vacio['alertas'] == [], 'sin notas: lista vacia, no un error')
    with tempfile.TemporaryDirectory() as tmp:
        sal = os.path.join(tmp, 'alertas.json')
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
        print(f'Escrito {os.path.relpath(a.salida, RAIZ)}: {len(nuevo["alertas"])} nota(s) de los ultimos {DIAS} dias; '
              f'{nuevo["descartados"]} elemento(s) del canal sin leer')
    else:
        print('Sin cambios y comprobado hace menos de 3 horas: no se reescribe')
    return 0


if __name__ == '__main__':
    sys.exit(main())
