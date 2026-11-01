#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""El vigia del panel SOS: avisa a quien mantiene la app cuando cambia una
de las paginas oficiales de las que sale lo que dice el panel.

POR QUE EXISTE (22 de octubre de 2026). Jerome: «También si entra nuevo
planes de evacuación. Siempre atentos que es donde salen las emergencias».
Lo que el panel aconseja sale de paginas oficiales (los consejos del
Gobierno de Canarias, sus planes de emergencias, el 112, el IGN, Sanidad,
Salvamento Maritimo...), y esas paginas se revisan: sale un plan nuevo,
cambia un consejo, se mueve un enlace. Un texto de la app no puede
cambiarse solo, sin que una persona lo lea y lo compruebe; lo que si puede
hacer un robot es darse cuenta y avisar.

QUE HACE. Lee las URL de SOS_FUENTES en modulos/emergencias.js (asi la
lista no envejece: una fuente nueva entra sola) y, de cada una, saca una
huella:
  · de una pagina HTML, del texto que se lee (sin scripts, estilos,
    comentarios ni etiquetas, y con los espacios juntados): si alguien cambia
    un estilo o un contador de visitas, no salta;
  · de un PDF o de otra cosa, de los bytes.
La compara con la que guardo la vez anterior (tools/datos/vigia-sos.json) y
escribe un informe en Markdown (--informe) con lo que ha cambiado, un trozo
del texto nuevo y el enlace, para revisar el panel. Una pagina que falla
tres veces seguidas sale en el informe como enlace roto.
  · La primera vez solo apunta las huellas: no hay nada con que comparar.
  · Las paginas que cambian por su naturaleza (el boletin semanal de
    INVOLCAN) no se vigilan: van en CAMBIAN_SIEMPRE.
  · No toca la app ni sus textos, ni decide nada: avisa.
  · Respeta el robots.txt de cada sitio: lo que no deja leer, no se lee.

EL FLUJO (.github/workflows/vigia-sos.yml), apagado hasta el bloque 3 de la
nota PARA-CLAUDE-CODE-SOS: una vez por semana; guarda las huellas y, si hay
informe, abre una incidencia en GitHub (o comenta la que ya este abierta).

Uso:
  python3 tools/vigia_sos.py --informe /tmp/vigia.md     mira las paginas
  python3 tools/vigia_sos.py --probar                    sus controles, sin red
"""
import argparse
import datetime as dt
import hashlib
import html
import json
import os
import re
import sys
import tempfile
import time
import urllib.request
import urllib.robotparser

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODULO = os.path.join(RAIZ, 'modulos', 'emergencias.js')
ESTADO = os.path.join(RAIZ, 'tools', 'datos', 'vigia-sos.json')
UA = 'TenerifeGo/1.0 (+https://tenerifego.app/)'
TOPE = 15_000_000
ROTO_TRAS = 3
# lo que se guarda del texto de cada pagina, para ensenar el trozo que cambia
TEXTO_MAX = 6000
# Cambian cada semana por su naturaleza: no son una novedad que revisar
CAMBIAN_SIEMPRE = {'involcan'}
# Solo las paginas de los organismos que publican consejos y planes: las
# noticias (prensa, notas del portal) llevan columnas de «lo ultimo» que
# cambian a diario y solo darian falsas alarmas; y un decreto publicado no
# cambia. Desde la noche del 22 de octubre de 2026, tambien las guias de
# Proteccion Civil y de la IVHHN, las del Consejo Europeo de Resucitacion,
# la revision del ILCOR que sigue en borrador, el NHS, la Asociacion Espanola
# de Pediatria, la Comunidad de Madrid, el telefono de toxicologia y «Tu
# Europa». No: Tenerife ON, el Cabildo y Aena (cambian cada dia) ni la
# pagina de impresion del Resuscitation Council UK (se genera al pedirla).
DOMINIOS = ('www.gobiernodecanarias.org', 'www.112canarias.com', 'www.ign.es', 'www.boe.es',
            'www.sanidad.gob.es', 'www.transportes.gob.es', 'www.interior.gob.es',
            'recursosemergencias.educacionfpydeportes.gob.es', 'ivhhn.org', 'www.ivhhn.org',
            'www.erc.edu', 'costr.ilcor.org', 'www.nhs.uk', 'enfamilia.aeped.es',
            'www.comunidad.madrid', 'www.mjusticia.gob.es', 'europa.eu')
# Y paginas que no son fuente de ninguna guia pero donde aparece lo nuevo:
# el indice de consejos del Gobierno de Canarias (un riesgo con consejos
# nuevos, como los maremotos, saldria ahi).
EXTRA = {'indiceConsejos': 'https://www.gobiernodecanarias.org/emergencias/consejos/consejos.html'}


def fuentes(js):
    """{clave: url} de SOS_FUENTES en el texto del modulo."""
    m = re.search(r'var SOS_FUENTES = \{(.*?)\n  \};', js, re.S)
    if not m:
        raise SystemExit('PARADO: no encuentro SOS_FUENTES en modulos/emergencias.js')
    out = {}
    for clave, url in re.findall(r"^\s*(\w+):\s*\{[^\n]*?url: '(https://[^']+)'", m.group(1), re.M):
        host = re.match(r'https://([^/]+)', url).group(1)
        if clave not in CAMBIAN_SIEMPRE and host in DOMINIOS:
            out[clave] = url
    out.update(EXTRA)
    if len(out) < 10:
        raise SystemExit('PARADO: SOS_FUENTES con solo %d fuentes: algo no cuadra' % len(out))
    return out


def texto_html(b):
    s = b.decode('utf-8', 'replace')
    s = re.sub(r'(?is)<(script|style|noscript|template)\b.*?</\1\s*>', ' ', s)
    s = re.sub(r'(?s)<!--.*?-->', ' ', s)
    s = re.sub(r'(?s)<[^>]+>', ' ', s)
    s = html.unescape(s)
    return re.sub(r'\s+', ' ', s).strip()


def huella(b, tipo):
    """(huella, texto o None): del texto que se lee si es HTML; si no, de los bytes."""
    if 'html' in (tipo or '') or b[:200].lstrip().lower().startswith((b'<!doctype html', b'<html')):
        t = texto_html(b)
        return 'texto:' + hashlib.sha256(t.encode('utf-8')).hexdigest(), t
    return 'bytes:' + hashlib.sha256(b).hexdigest(), None


_ROBOTS = {}


def permitido(url):
    """Lo que el robots.txt de cada sitio no deja leer a un robot, no se lee
    (el Gobierno de Canarias, por ejemplo, cierra /cmsgob1/, donde guarda sus
    PDF). Si no se puede leer el robots.txt, se lee la pagina."""
    host = re.match(r'https://([^/]+)', url).group(1)
    if host not in _ROBOTS:
        rp = urllib.robotparser.RobotFileParser('https://%s/robots.txt' % host)
        try:
            rp.read()
        except Exception:
            rp = None
        _ROBOTS[host] = rp
    rp = _ROBOTS[host]
    return True if rp is None else rp.can_fetch(UA, url)


def bajar(url):
    ultimo = None
    for intento in range(2):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': UA})
            with urllib.request.urlopen(req, timeout=60) as r:
                b = r.read(TOPE + 1)
                tipo = r.headers.get('Content-Type', '')
            if len(b) > TOPE:
                raise IOError('mas de %d bytes' % TOPE)
            return b, tipo
        except Exception as e:
            ultimo = e
            time.sleep(5 * (intento + 1))
    raise IOError(str(ultimo))


def trozo(viejo, nuevo, ancho=280):
    """Un trozo del texto nuevo alrededor del primer sitio donde cambia (del
    viejo solo se guardan TEXTO_MAX caracteres: mas alla, desde ahi)."""
    if viejo is None or nuevo is None:
        return ''
    nuevo = nuevo[:TEXTO_MAX + ancho]
    i = 0
    while i < min(len(viejo), len(nuevo)) and viejo[i] == nuevo[i]:
        i += 1
    ini = max(0, i - 60)
    return ('…' if ini else '') + nuevo[ini:ini + ancho] + ('…' if ini + ancho < len(nuevo) else '')


def vigilar(urls, estado, ahora, bajar_fn=bajar, permitido_fn=permitido):
    """Devuelve (estado nuevo, cambios, rotos). El estado guarda, por clave, la
    url, la huella, el texto (solo de HTML, para el trozo del informe), cuando
    cambio y los fallos seguidos."""
    nuevo, cambios, rotos = {}, [], []
    for clave, url in sorted(urls.items()):
        antes = estado.get(clave) or {}
        if antes.get('url') != url:
            antes = {}
        if not permitido_fn(url):
            continue
        try:
            b, tipo = bajar_fn(url)
        except Exception as e:
            fallos = int(antes.get('fallos', 0)) + 1
            nuevo[clave] = dict(antes, url=url, fallos=fallos, error=str(e)[:200])
            if fallos == ROTO_TRAS:
                rotos.append((clave, url, str(e)[:200]))
            continue
        h, txt = huella(b, tipo)
        # sin la hora de cada vuelta: el fichero solo cambia si cambia algo
        reg = {'url': url, 'huella': h, 'texto': txt[:TEXTO_MAX] if txt else None,
               'cambiado': antes.get('cambiado') or ahora, 'fallos': 0}
        if antes.get('huella') and antes['huella'] != h:
            reg['cambiado'] = ahora
            cambios.append((clave, url, trozo(antes.get('texto'), txt)))
        nuevo[clave] = reg
    return nuevo, cambios, rotos


def citar(t):
    """El trozo de la pagina, como codigo: ahi GitHub no convierte las
    @cuentas en menciones (una pagina del 112 que diga «@112canarias» avisaria
    a quien se llame asi en GitHub), ni los #numeros en enlaces a incidencias,
    ni las direcciones en enlaces. El delimitador, una comilla invertida mas
    que la tira mas larga del texto."""
    t = t.replace('\n', ' ')
    tira = max([len(x) for x in re.findall(r'`+', t)] or [0])
    v = '`' * (tira + 1)
    if t.startswith('`') or t.endswith('`'):
        t = ' ' + t + ' '
    return v + t + v


def informe(cambios, rotos, ahora):
    if not cambios and not rotos:
        return ''
    l = ['# SOS: revisar el panel de emergencias', '',
         'El vigía (`tools/vigia_sos.py`, %s) ha visto cambios, o páginas que no '
         'responden, entre las oficiales de las que sale lo que dice el panel SOS. Hay '
         'que leerlas y, si cambia algo que el panel dice (un consejo, un plan nuevo, '
         'un teléfono), cambiar sus filas en los diez idiomas y la fecha de revisión '
         '(`SOS_REVISADO`), con la fuente. Si una página se ha movido, buscar su '
         'dirección nueva en la web del organismo y cambiarla en `SOS_FUENTES`. Si no '
         'cambia nada que importe, se cierra esta incidencia diciendo por qué.' % ahora[:10], '']
    if cambios:
        l += ['## Han cambiado', '']
        for clave, url, t in cambios:
            l.append('- **%s**: %s' % (clave, url))
            if t:
                l.append('  > ' + citar(t))
        l.append('')
    if rotos:
        l += ['## No responden (%d veces seguidas)' % ROTO_TRAS, '']
        for clave, url, e in rotos:
            l.append('- **%s**: %s (%s)' % (clave, url, e))
        l.append('')
    return '\n'.join(l)


def leer_estado(ruta):
    try:
        with open(ruta, encoding='utf-8') as f:
            d = json.load(f)
        return d.get('paginas', {}) if isinstance(d, dict) else {}
    except Exception:
        return {}


def guardar_estado(ruta, paginas):
    os.makedirs(os.path.dirname(os.path.abspath(ruta)), exist_ok=True)
    tmp = ruta + '.tmp'
    with open(tmp, 'w', encoding='utf-8') as f:
        json.dump({'paginas': paginas}, f, ensure_ascii=False, indent=1, sort_keys=True)
        f.write('\n')
    os.replace(tmp, ruta)


def probar():
    fallos = []
    def ok(c, txt):
        print(('  OK  ' if c else '  MAL ') + txt)
        if not c:
            fallos.append(txt)
    js = open(MODULO, encoding='utf-8').read() if os.path.exists(MODULO) else ''
    if js:
        u = fuentes(js)
        ok('involcan' not in u and 'planes' in u and 'indiceConsejos' in u and all(v.startswith('https://') for v in u.values()),
           'las fuentes salen del modulo (%d), sin el boletin semanal y con el indice de consejos' % len(u))
        ok(not any(re.search(r'rtvc|diariodeavisos|/noticias/|doi\.org', v) for v in u.values()), 'sin noticias ni prensa (falsas alarmas)')
    paginas = {
        'a': b'<!doctype html><html><head><style>.x{}</style><script>var n=1</script></head><body><h1>Consejos</h1><p>Llame al 112.</p></body></html>',
        'b': b'%PDF-1.4 prueba',
    }
    urls = {'a': 'https://ejemplo.gob/a', 'b': 'https://ejemplo.gob/b.pdf'}
    def red(contenidos, caidas=()):
        def f(url):
            clave = 'a' if url.endswith('/a') else 'b'
            if clave in caidas:
                raise IOError('HTTP 404')
            return contenidos[clave], 'text/html' if clave == 'a' else 'application/pdf'
        return f
    e0, c0, r0 = vigilar(urls, {}, '2099-01-01', red(paginas), permitido_fn=lambda u: not u.endswith('.pdf'))
    ok(list(e0) == ['a'], 'lo que cierra el robots.txt no se lee')
    e1, c1, r1 = vigilar(urls, {}, '2099-01-01', red(paginas), permitido_fn=lambda u: True)
    ok(not c1 and not r1 and informe(c1, r1, '2099-01-01') == '', 'la primera vez solo apunta')
    otra = dict(paginas, a=paginas['a'].replace(b'var n=1', b'var n=2').replace(b'.x{}', b'.x{color:red}'))
    e2, c2, r2 = vigilar(urls, e1, '2099-01-08', red(otra), permitido_fn=lambda u: True)
    ok(not c2, 'un cambio en scripts o estilos no salta')
    nueva = dict(paginas, a=paginas['a'].replace(b'Llame al 112.', b'Llame al 112. Nuevo plan de evacuacion.'))
    e3, c3, r3 = vigilar(urls, e2, '2099-01-15', red(nueva), permitido_fn=lambda u: True)
    ok([c[0] for c in c3] == ['a'] and 'Nuevo plan' in c3[0][2], 'un cambio en el texto salta, con su trozo: %s' % c3)
    ok('Nuevo plan' in informe(c3, r3, '2099-01-15') and 'https://ejemplo.gob/a' in informe(c3, r3, '2099-01-15'), 'el informe lo cuenta con el enlace')
    inf = informe([('a', 'https://ejemplo.gob/a', 'Siga a @112canarias y la nota #12 en `x`')], [], '2099-01-15')
    ok('> `` Siga a @112canarias y la nota #12 en `x` ``' in inf and inf.count('@112canarias') == 1,
       'el trozo va como codigo: las @cuentas no son menciones ni los #numeros enlaces')
    pdf2 = dict(nueva, b=b'%PDF-1.4 prueba 2')
    e4, c4, r4 = vigilar(urls, e3, '2099-01-22', red(pdf2), permitido_fn=lambda u: True)
    ok([c[0] for c in c4] == ['b'], 'un PDF que cambia salta')
    e = e4
    for semana in range(ROTO_TRAS):
        e, c, r = vigilar(urls, e, '2099-02-0%d' % (semana + 1), red(pdf2, caidas=('a',)), permitido_fn=lambda u: True)
        if semana < ROTO_TRAS - 1:
            ok(not r, 'una caida suelta no es un enlace roto (%d)' % (semana + 1))
    ok([x[0] for x in r] == ['a'] and e['a']['huella'] == e4['a']['huella'], 'tres caidas seguidas: enlace roto, y la huella buena se guarda')
    e, c, r = vigilar(urls, e, '2099-02-10', red(pdf2), permitido_fn=lambda u: True)
    ok(not c and e['a']['fallos'] == 0, 'cuando vuelve igual, no hay cambio')
    with tempfile.TemporaryDirectory() as tmp:
        ruta = os.path.join(tmp, 'vigia.json')
        guardar_estado(ruta, e)
        antes = open(ruta, encoding='utf-8').read()
        e5, c5, r5 = vigilar(urls, leer_estado(ruta), '2099-02-17', red(pdf2), permitido_fn=lambda u: True)
        guardar_estado(ruta, e5)
        ok(open(ruta, encoding='utf-8').read() == antes, 'una semana sin cambios no cambia el fichero (no hay commit)')
        ok(leer_estado(ruta).keys() == e.keys(), 'el estado se guarda y se lee')
    print('RESULTADO: ' + ('EN VERDE' if not fallos else '%d fallo(s)' % len(fallos)))
    return 1 if fallos else 0


def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument('--informe', help='donde escribir el informe en Markdown (vacio si no hay nada)')
    ap.add_argument('--estado', default=ESTADO)
    ap.add_argument('--probar', action='store_true')
    a = ap.parse_args(argv)
    if a.probar:
        return probar()
    ahora = dt.datetime.now(dt.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
    urls = fuentes(open(MODULO, encoding='utf-8').read())
    estado = leer_estado(a.estado)
    primera = not estado
    nuevo, cambios, rotos = vigilar(urls, estado, ahora)
    guardar_estado(a.estado, nuevo)
    txt = informe(cambios, rotos, ahora)
    if a.informe:
        with open(a.informe, 'w', encoding='utf-8') as f:
            f.write(txt)
    cerradas = sorted(set(urls) - set(nuevo))
    print('%d paginas miradas%s; %d cambiadas; %d sin responder %d veces seguidas'
          % (len(nuevo), ' (primera vez: solo se apuntan)' if primera else '', len(cambios), len(rotos), ROTO_TRAS))
    if cerradas:
        print('%d que su robots.txt no deja leer (no se miran): %s' % (len(cerradas), ', '.join(cerradas)))
    return 0


if __name__ == '__main__':
    sys.exit(main())
