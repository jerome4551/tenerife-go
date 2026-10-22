#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""fuente.py — el fuente entero de la app, para las herramientas que lo barren.

Lo mismo que tools/fuente.js, para las de Python: index.html con los ficheros
propios que carga (los <script src> del propio origen que no son de vendor/)
pegados AL FINAL, cada uno en su bloque <script>. Al final para que los numeros
de linea de index.html no se muevan.

Hace falta desde el 9 de octubre de 2026, cuando la red de guaguas salio a
datos/titsa.js: con las herramientas sin tocar, auditar_cirilico.py paso de
1.161 nombres en cirilico a 1.160 y siguio en verde. Ver tools/fuente.js.

Y los modulos de carga perezosa (17 de octubre de 2026), declarados en el
fuente con «CARGA-PEREZOSA: <ruta>»: entran en html() detras de los otros;
ficheros() sigue siendo solo lo que se carga al arrancar. Ver tools/fuente.js.

Y los textos que van un fichero por idioma (22 de octubre de 2026),
declarados con «IDIOMAS-PEREZOSOS: <carpeta>»: los <carpeta>/<idioma>.json de
los idiomas de SUPPORTED_LANGS se juntan en una tabla de filas de diez
idiomas (var IDIOMAS_<CARPETA> = {...}) detras de los modulos. Tiene que
salir byte a byte lo mismo que en tools/fuente.js (lo comprueba el main).

    import fuente
    s = fuente.html()        # en vez de leer index.html a pelo
"""
import io
import json
import os
import re

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def ficheros():
    index = io.open(os.path.join(RAIZ, 'index.html'), encoding='utf-8').read()
    out = []
    for m in re.finditer(r'<script\b[^>]*\bsrc\s*=\s*["\']([^"\']+)["\'][^>]*>', index, re.I):
        url = m.group(1)
        if re.match(r'^(?:[a-z]+:)?//', url, re.I):
            continue                                   # de otro dominio
        ruta = re.sub(r'[?#].*$', '', re.sub(r'^\./', '', url))
        if ruta.startswith('vendor/'):
            continue                                   # librerias, no fuente
        abs_ = os.path.join(RAIZ, ruta)
        if not os.path.exists(abs_):
            raise SystemExit('index.html carga %s y no existe' % ruta)
        texto = io.open(abs_, encoding='utf-8').read()
        if re.search(r'</script', texto, re.I):
            raise SystemExit('%s trae «</script»: no se puede pegar en linea' % ruta)
        out.append((ruta, texto))
    return index, out


def perezosos(index=None):
    if index is None:
        index = io.open(os.path.join(RAIZ, 'index.html'), encoding='utf-8').read()
    _, fs = ficheros()
    vistos = {r for r, _ in fs}
    out = []
    for m in re.finditer(r'CARGA-PEREZOSA:\s*([\w./-]+\.js)\b', index):
        ruta = re.sub(r'^\./', '', m.group(1))
        if ruta in vistos:
            continue
        vistos.add(ruta)
        abs_ = os.path.join(RAIZ, ruta)
        if not os.path.exists(abs_):
            raise SystemExit('index.html declara la carga perezosa de %s y no existe' % ruta)
        texto = io.open(abs_, encoding='utf-8').read()
        if re.search(r'</script', texto, re.I):
            raise SystemExit('%s trae «</script»: no se puede pegar en linea' % ruta)
        out.append((ruta, texto))
    return out


def _js(x):
    """JSON.stringify de un texto o de una clave: lo mismo que json.dumps sin
    escapar lo que no es ASCII (ninguno de los dos escapa U+2028/9 ni «/»)."""
    return json.dumps(x, ensure_ascii=False)


def por_idioma(index=None):
    """[(carpeta, nombre, texto)] de las carpetas IDIOMAS-PEREZOSOS."""
    if index is None:
        index = io.open(os.path.join(RAIZ, 'index.html'), encoding='utf-8').read()
    m = re.search(r'SUPPORTED_LANGS\s*=\s*\[([^\]]*)\]', index)
    langs = re.findall(r'[a-z]+', m.group(1)) if m else []
    out, vistos = [], set()
    for m3 in re.finditer(r'IDIOMAS-PEREZOSOS:\s*([\w./-]+)', index):
        d = re.sub(r'/$', '', re.sub(r'^\./', '', m3.group(1)))
        if d in vistos:
            continue
        vistos.add(d)
        if not langs:
            raise SystemExit('IDIOMAS-PEREZOSOS: %s, y no encuentro SUPPORTED_LANGS en index.html' % d)
        filas, claves = {}, None
        for l in langs:
            abs_ = os.path.join(RAIZ, d, l + '.json')
            if not os.path.exists(abs_):
                raise SystemExit('index.html declara %s y falta %s/%s.json' % (d, d, l))
            datos = json.loads(io.open(abs_, encoding='utf-8').read())
            ks = list(datos.keys())
            if claves is None:
                claves = ks
            elif ks != claves:
                raise SystemExit('%s/%s.json no tiene las mismas claves, en el mismo orden, que %s/%s.json' % (d, l, d, langs[0]))
            for k in ks:
                if not isinstance(datos[k], str):
                    raise SystemExit('%s/%s.json: %s no es un texto' % (d, l, k))
                filas.setdefault(k, {})[l] = datos[k]
        nombre = 'IDIOMAS_' + re.sub(r'[^A-Z0-9]', '_', d.split('/')[-1].upper())
        texto = 'var ' + nombre + ' = {\n' + ',\n'.join(
            '    ' + _js(k) + ': {' + ', '.join(_js(l) + ': ' + _js(filas[k][l]) for l in langs) + '}' for k in claves) + '\n};'
        out.append((d, nombre, texto))
    return out


def html():
    index, fs = ficheros()
    partes = [index]
    for ruta, texto, perezoso in [(r, t, False) for r, t in fs] + [(r, t, True) for r, t in perezosos(index)]:
        partes.append('\n<script>\n/* ════ %s · no esta en index.html: %s'
                      ' Se pega aqui solo para las herramientas (tools/fuente.js y .py). ════ */\n'
                      % (ruta, 'lo pide su cargador al abrir el panel.' if perezoso else 'lo carga su etiqueta.'))
        partes.append(texto + '\n</script>\n')
    for d, nombre, texto in por_idioma(index):
        partes.append('\n<script>\n/* ════ %s/<idioma>.json · no esta en index.html: el modulo pide solo el del'
                      ' idioma de quien mira; aqui van los de todos juntos, fila a fila. Se pega aqui solo para las'
                      ' herramientas (tools/fuente.js y .py). ════ */\n' % d)
        partes.append(texto + '\n</script>\n')
    return ''.join(partes)


if __name__ == '__main__':
    index, fs = ficheros()
    print('index.html: %d lineas' % len(index.split('\n')))
    for ruta, texto in fs:
        print('%s: %d lineas, %d bytes' % (ruta, len(texto.split('\n')), len(texto.encode('utf-8'))))
    for ruta, texto in perezosos(index):
        print('%s: %d lineas, %d bytes (carga perezosa)' % (ruta, len(texto.split('\n')), len(texto.encode('utf-8'))))
    for d, nombre, texto in por_idioma(index):
        print('%s/<idioma>.json: %d filas de diez idiomas, juntas en %s' % (d, len(texto.split('\n')) - 2, nombre))
    import subprocess, json
    js = subprocess.run(['node', '-e', "process.stdout.write(require('./tools/fuente').html())"],
                        cwd=RAIZ, stdout=subprocess.PIPE).stdout.decode('utf-8')
    print('igual que tools/fuente.js: %s' % ('si' if js == html() else 'NO'))
