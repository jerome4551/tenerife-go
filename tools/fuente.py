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

    import fuente
    s = fuente.html()        # en vez de leer index.html a pelo
"""
import io
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


def html():
    index, fs = ficheros()
    partes = [index]
    for ruta, texto, perezoso in [(r, t, False) for r, t in fs] + [(r, t, True) for r, t in perezosos(index)]:
        partes.append('\n<script>\n/* ════ %s · no esta en index.html: %s'
                      ' Se pega aqui solo para las herramientas (tools/fuente.js y .py). ════ */\n'
                      % (ruta, 'lo pide su cargador al abrir el panel.' if perezoso else 'lo carga su etiqueta.'))
        partes.append(texto + '\n</script>\n')
    return ''.join(partes)


if __name__ == '__main__':
    index, fs = ficheros()
    print('index.html: %d lineas' % len(index.split('\n')))
    for ruta, texto in fs:
        print('%s: %d lineas, %d bytes' % (ruta, len(texto.split('\n')), len(texto.encode('utf-8'))))
    for ruta, texto in perezosos(index):
        print('%s: %d lineas, %d bytes (carga perezosa)' % (ruta, len(texto.split('\n')), len(texto.encode('utf-8'))))
    import subprocess, json
    js = subprocess.run(['node', '-e', "process.stdout.write(require('./tools/fuente').html())"],
                        cwd=RAIZ, stdout=subprocess.PIPE).stdout.decode('utf-8')
    print('igual que tools/fuente.js: %s' % ('si' if js == html() else 'NO'))
