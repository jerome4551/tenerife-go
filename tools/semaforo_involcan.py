#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""El semaforo volcanico de Tenerife segun el boletin semanal de INVOLCAN.

POR QUE EXISTE (22 de octubre de 2026). El panel 🆘 EMERGENCIAS explica que
significa cada color del semaforo del PEVOLCA, pero no dice en cual estamos:
la app no decide eso. Lo que si puede ensenar, con su fecha, es lo que dice el
boletin oficial. El Instituto Volcanologico de Canarias (INVOLCAN) publica
cada semana el informativo «Guayota» de cada isla, y el de Tenerife dice en
que posicion esta el semaforo segun el PEVOLCA:
  https://www.involcan.org/wp-content/uploads/GUAYOTA/guayota-tfe-es-co.pdf
Por ejemplo (16 de octubre de 2026): «Segun el PEVOLCA se informa que en la
actualidad el semaforo volcanico se encuentra en posicion VERDE ... Este
informe esta actualizado a las 00:00 del 16 octubre 2026».

LO QUE ESTE ROBOT NO ES. No es un aviso: el boletin es semanal y el semaforo
puede cambiar entre dos boletines. La app lo ensena como «Boletin de INVOLCAN
del {fecha}: semaforo {color}», con la nota de que los cambios los anuncian
antes el 112 y ES-Alert, y deja de ensenar el color cuando el boletin tiene
mas de 8 dias. El punto del boton SOS solo se enciende si el color no es
verde.

COMO NO SE ENSENA NADA FALSO.
  · Si la descarga, el PDF o la lectura fallan, NO se escribe nada.
  · Tiene que aparecer UN color, y uno solo, en la frase del semaforo, y la
    fecha del informe; si no, se para.
  · El texto tiene que ser el de Tenerife (nombra la isla o sus estaciones).
  · La fecha del boletin no puede ser del futuro ni anterior a la del ultimo
    boletin guardado: un boletin no va hacia atras.
  · Sin cambios, solo se reescribe cada 12 horas, para renovar «consultado».

Uso:
  python3 tools/semaforo_involcan.py                    baja y escribe si toca
  python3 tools/semaforo_involcan.py --pdf G.pdf --ahora 2026-10-22T12:00:00Z
  python3 tools/semaforo_involcan.py --texto G.txt      sin PDF (pruebas)
  python3 tools/semaforo_involcan.py --probar           sus controles, sin red
"""
import argparse
import datetime as dt
import io
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
import unicodedata
import urllib.request

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SALIDA = os.path.join(RAIZ, 'datos', 'semaforo-involcan.json')
CANAL = 'https://www.involcan.org/wp-content/uploads/GUAYOTA/guayota-tfe-es-co.pdf'
LATIDO = dt.timedelta(hours=12)
UA = 'TenerifeGo/1.0 (+https://tenerifego.app/)'
MESES = {'enero': 1, 'febrero': 2, 'marzo': 3, 'abril': 4, 'mayo': 5, 'junio': 6, 'julio': 7, 'agosto': 8,
         'septiembre': 9, 'setiembre': 9, 'octubre': 10, 'noviembre': 11, 'diciembre': 12}
COLOR = re.compile(r'sem[aá]foro\s+volc[aá]nico\s+se\s+encuentra\s+en\s+posici[oó]n\s+(VERDE|AMARILLO|NARANJA|ROJO)\b', re.I)
FECHA = re.compile(r'actualizado\s+a\s+las\s+\d{1,2}:\d{2}\s+del\s+(\d{1,2})\s+(?:de\s+)?(' + '|'.join(MESES) + r')\s+(?:de\s+)?(\d{4})', re.I)
ISLA = re.compile(r'Tenerife|\bTFE\d*|\bTEIT\b|\bTFT\d*', re.I)


class Parar(Exception):
    """Algo no cuadra: no se escribe nada."""


def bajar(url, tope=15_000_000):
    ultimo = None
    for intento in range(3):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': UA})
            with urllib.request.urlopen(req, timeout=90) as r:
                b = r.read(tope + 1)
            if len(b) > tope:
                raise Parar(f'{url}: mas de {tope} bytes')
            if not b.startswith(b'%PDF'):
                raise Parar(f'{url}: no es un PDF')
            return b
        except Parar:
            raise
        except Exception as e:
            ultimo = e
            time.sleep(10 * (intento + 1))
    raise Parar(f'{url}: {ultimo}')


def texto_pdf(b):
    """Con pypdf; si no esta, con pdftotext. Ninguno: se para."""
    try:
        import pypdf
        lector = pypdf.PdfReader(io.BytesIO(b))
        return '\n'.join((p.extract_text() or '') for p in lector.pages)
    except ImportError:
        pass
    except Exception as e:
        raise Parar(f'el PDF no se lee: {e}')
    if shutil.which('pdftotext'):
        with tempfile.NamedTemporaryFile(suffix='.pdf') as f:
            f.write(b); f.flush()
            r = subprocess.run(['pdftotext', '-enc', 'UTF-8', f.name, '-'], capture_output=True, timeout=60)
            if r.returncode == 0:
                return r.stdout.decode('utf-8', 'replace')
    raise Parar('no hay con que leer el PDF (pip install pypdf)')


def leer(texto, ahora, anterior=None):
    t = re.sub(r'\s+', ' ', unicodedata.normalize('NFC', texto or ''))
    if not ISLA.search(t):
        raise Parar('el boletin no nombra Tenerife ni sus estaciones')
    colores = {m.group(1).lower() for m in COLOR.finditer(t)}
    if len(colores) != 1:
        raise Parar(f'no hay un color, y uno solo, en la frase del semaforo: {sorted(colores)}')
    m = FECHA.search(t)
    if not m:
        raise Parar('no se encuentra la fecha del informe')
    try:
        dia = dt.date(int(m.group(3)), MESES[m.group(2).lower()], int(m.group(1)))
    except ValueError:
        raise Parar(f'fecha imposible: {m.group(0)}')
    if dia > (ahora + dt.timedelta(days=1)).date():
        raise Parar(f'el boletin dice ser del futuro: {dia}')
    if anterior and dia.isoformat() < anterior:
        raise Parar(f'el boletin ({dia}) es anterior al ultimo guardado ({anterior})')
    return {
        'fuente': 'INVOLCAN. Instituto Volcanológico de Canarias. Informativo semanal «Guayota» de Tenerife, según el PEVOLCA.',
        'canal': CANAL,
        'web': 'https://www.involcan.org/',
        'consultado': ahora.astimezone(dt.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
        'boletin': dia.isoformat(),
        'color': colores.pop(),
    }


def fecha_iso(s):
    d = dt.datetime.fromisoformat(s.strip().replace('Z', '+00:00'))
    if d.tzinfo is None:
        raise Parar(f'fecha sin zona horaria: {s}')
    return d


def viejo_de(salida):
    try:
        return json.load(open(salida, encoding='utf-8'))
    except Exception:
        return None


def escribir(nuevo, salida, ahora):
    viejo = viejo_de(salida)
    if viejo and viejo.get('consultado'):
        try:
            hace = ahora - fecha_iso(viejo['consultado'])
        except Exception:
            hace = None
        quita = lambda d: {k: v for k, v in d.items() if k != 'consultado'}
        if quita(viejo) == quita(nuevo) and hace is not None and dt.timedelta(0) <= hace < LATIDO:
            return False
    os.makedirs(os.path.dirname(os.path.abspath(salida)), exist_ok=True)
    tmp = salida + '.tmp'
    with open(tmp, 'w', encoding='utf-8') as fh:
        json.dump(nuevo, fh, ensure_ascii=False, indent=1)
        fh.write('\n')
    os.replace(tmp, salida)
    return True


def probar():
    fallos = []
    def ok(c, txt):
        print(('  OK  ' if c else '  MAL ') + txt)
        if not c:
            fallos.append(txt)
    base = open(os.path.join(RAIZ, 'tools', 'datos', 'semaforo-involcan-prueba.txt'), encoding='utf-8').read()
    ahora = fecha_iso('2026-10-22T12:00:00Z')
    d = leer(base, ahora)
    ok(d['color'] == 'verde' and d['boletin'] == '2026-10-16', 'el texto del boletin del 16 de octubre: verde, 2026-10-16 (%s, %s)' % (d['color'], d['boletin']))
    roto = base.replace('posición VERDE', 'posición\nAMARILLO').replace('16 octubre 2026', '16 de octubre de 2026')
    d2 = leer(roto, ahora)
    ok(d2['color'] == 'amarillo' and d2['boletin'] == '2026-10-16', 'con saltos de linea y «de»: amarillo, 2026-10-16')
    casos = [
        (base.replace('16 octubre 2026', '30 octubre 2026'), 'un boletin del futuro'),
        (base + ' el semáforo volcánico se encuentra en posición ROJO', 'dos colores distintos'),
        (base.replace('se encuentra en posición VERDE', 'se encuentra en posición'), 'sin color'),
        (base.replace('actualizado a las 00:00 del 16 octubre 2026', 'actualizado'), 'sin fecha'),
        (re.sub(r'Tenerife|TFE12|TFT12|TEIT', 'XXXX', base), 'un texto que no es de Tenerife'),
        (base.replace('16 octubre 2026', '31 febrero 2026'), 'una fecha imposible'),
    ]
    for txt, que in casos:
        try:
            leer(txt, ahora); ok(False, 'para con ' + que)
        except Parar:
            ok(True, 'para con ' + que)
    try:
        leer(base, ahora, anterior='2026-10-23'); ok(False, 'para si el boletin va hacia atras')
    except Parar:
        ok(True, 'para si el boletin va hacia atras')
    # De PDF a texto, con un PDF hecho aqui (reportlab) que parte las frases
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.pdfgen import canvas
        buf = io.BytesIO(); c = canvas.Canvas(buf, pagesize=A4)
        y = 800
        palabras = base.split()
        linea = ''
        for p in palabras:
            if len(linea) + len(p) > 70:
                c.drawString(40, y, linea); y -= 14; linea = ''
            linea = (linea + ' ' + p).strip()
        c.drawString(40, y, linea); c.save()
        d3 = leer(texto_pdf(buf.getvalue()), ahora)
        ok(d3['color'] == 'verde' and d3['boletin'] == '2026-10-16', 'de un PDF con las frases partidas: verde, 2026-10-16')
    except ImportError:
        print('  (sin reportlab: el paso del PDF se prueba con el boletin de verdad)')
    with tempfile.TemporaryDirectory() as tmp:
        sal = os.path.join(tmp, 's.json')
        ok(escribir(d, sal, ahora), 'escribe la primera vez')
        ok(not escribir(leer(base, ahora + dt.timedelta(hours=5)), sal, ahora + dt.timedelta(hours=5)), 'sin cambios y antes de 12 h: no reescribe')
        ok(escribir(leer(base, ahora + dt.timedelta(hours=13)), sal, ahora + dt.timedelta(hours=13)), 'a las 12 h renueva «consultado»')
        antes = open(sal, encoding='utf-8').read()
        r = main(['--texto', os.path.join(tmp, 'no-existe.txt'), '--salida', sal])
        ok(r == 1 and open(sal, encoding='utf-8').read() == antes, 'si falla la lectura no toca el fichero')
    print('RESULTADO: ' + ('EN VERDE' if not fallos else '%d fallo(s)' % len(fallos)))
    return 1 if fallos else 0


def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument('--pdf')
    ap.add_argument('--texto')
    ap.add_argument('--ahora')
    ap.add_argument('--salida', default=SALIDA)
    ap.add_argument('--probar', action='store_true')
    a = ap.parse_args(argv)
    if a.probar:
        return probar()
    ahora = fecha_iso(a.ahora) if a.ahora else dt.datetime.now(dt.timezone.utc)
    try:
        if a.texto:
            texto = open(a.texto, encoding='utf-8').read()
        else:
            texto = texto_pdf(open(a.pdf, 'rb').read() if a.pdf else bajar(CANAL))
        anterior = (viejo_de(a.salida) or {}).get('boletin')
        nuevo = leer(texto, ahora, anterior)
    except (Parar, OSError) as e:
        print(f'PARADO, no se escribe nada: {e}')
        return 1
    if escribir(nuevo, a.salida, ahora):
        print(f'Escrito {os.path.relpath(a.salida, RAIZ)}: boletin del {nuevo["boletin"]}, semaforo {nuevo["color"]}')
    else:
        print('Sin cambios y comprobado hace menos de 12 horas: no se reescribe')
    return 0


if __name__ == '__main__':
    sys.exit(main())
