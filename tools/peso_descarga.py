#!/usr/bin/env python3
"""Lo que baja un movil la primera vez, por idioma.

    python3 tools/peso_descarga.py

La cifra de la cabecera de AUDITORIA-FINAL.md sale de aqui, no de la
memoria. Se cuenta COMPRIMIDO, que es lo que viaja, y con el `gzip -9` del
sistema: el zlib de Python da 2,6 kB menos sobre index.html -misma norma,
otra implementacion- y mezclar los dos haria que la cabecera no cuadrase
consigo misma.

Se cuenta lo que el navegador pide de verdad para ensenar la app:

    index.html                      siempre, y lleva el castellano dentro
    idiomas/<lang>.json             los textos de los 804 lugares
    idiomas/etiquetas/<lang>.json   los chips del globo
    faq/<lang>.json                 las 69 respuestas del asistente

El castellano no tiene idiomas/es.json ni etiquetas porque viven dentro de
index.html: por eso es el mas barato, y por eso su cifra no sale de restarle
ficheros a la de los demas.

No entran vendor/ ni el mapa sin conexion: no se piden al arrancar.
"""
import pathlib
import re
import subprocess
import sys

RAIZ = pathlib.Path(__file__).resolve().parent.parent
PIEZAS = ('idiomas/%s.json', 'idiomas/etiquetas/%s.json', 'faq/%s.json')


def comprimido(p):
    """Bytes que ocupa el fichero comprimido. Por la entrada estandar, para
    que gzip no meta el nombre del fichero en la cabecera y la cifra dependa
    solo del contenido."""
    with open(p, 'rb') as f:
        r = subprocess.run(['gzip', '-9', '-c'], stdin=f, stdout=subprocess.PIPE)
    return len(r.stdout)


def idiomas():
    src = (RAIZ / 'index.html').read_text(encoding='utf-8')
    m = re.search(r'SUPPORTED_LANGS\s*=\s*\[([^\]]*)\]', src)
    if not m:
        sys.exit('no encuentro SUPPORTED_LANGS en index.html')
    return [x.strip().strip("'\"") for x in m.group(1).split(',') if x.strip()]


def kb(n):
    return round(n / 1000)


def main():
    base = comprimido(RAIZ / 'index.html')
    print('=== lo que baja la primera visita, comprimido (gzip -9) ===')
    print('  %-30s %5d kB' % ('index.html', kb(base)))
    filas = []
    for l in idiomas():
        piezas = [RAIZ / (p % l) for p in PIEZAS]
        piezas = [f for f in piezas if f.exists()]
        filas.append((l, base + sum(comprimido(f) for f in piezas), len(piezas)))
    for l, total, n in filas:
        print('  %-30s %5d kB   (index + %d)' % (l, kb(total), n))
    barato = min(filas, key=lambda x: x[1])
    caro = max(filas, key=lambda x: x[1])
    print('\n  el mas barato: %s, %d kB' % (barato[0], kb(barato[1])))
    print('  el peor caso : %s, %d kB' % (caro[0], kb(caro[1])))


if __name__ == '__main__':
    main()
