#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
auditar_redondeo.py — inventario, no puerta: coordenadas provisionales.

    python3 tools/auditar_redondeo.py

QUE MIRA
  1. Fichas cuya lat Y lng tienen 3 decimales SIGNIFICATIVOS o menos. Eso no es una
     coordenada tomada de una fuente: es un marcador puesto a ojo. Tres
     decimales son ~110 m de lado, y asi fue como un Lidl acabo en el
     mar. Que dos coordenadas de verdad caigan las dos en 3 decimales
     por casualidad es una entre un millon, o sea que la senal es buena.
  2. Fichas de playa, piscinas, surf o windsurf que estan en tierra a
     mas de 150 m de la costa. Una playa tierra adentro es un dedazo o
     una coordenada de aparcamiento colada en la ficha de la playa.

POR QUE NO FALLA NUNCA
  Ninguna de las dos listas es un error por si sola: un mirador con la
  coordenada redondeada esta bien donde esta, y el punto de una escuela
  de surf puede estar en el local, no en la orilla. Quien falla cuando
  la imprecision tiene consecuencias es auditar_en_el_mar.py, que mide
  si el punto cae en el agua. Esto es el inventario de lo que habria
  que ir puliendo, y se imprime entero para que no sea un silencio.
"""
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import costa

COSTERAS = {'playa', 'piscinas', 'surf', 'windsurf'}
LEJOS = 150.0


def decimales(x):
    """Decimales SIGNIFICATIVOS: los ceros de la derecha no cuentan.

    Aqui se escapaban 41. Un marcador puesto a ojo se escribe «28.372» y
    luego alguien lo deja en «28.3720» para que case con el formato de las
    demas, y contando caracteres eso parecen cuatro decimales. Es el mismo
    punto con un cero de adorno: sigue siendo una cuadricula de 110 m.
    Contando solo los significativos, la cuenta pasa de 13 a 54."""
    if '.' not in x:
        return 0
    return len(x.split('.')[1].rstrip('0'))


def main():
    src = open(os.path.join(costa.RAIZ, 'index.html'), encoding='utf-8').read()
    pat = re.compile(r'\{\s*id:"([a-z0-9\-]+)",[^\n]*?category:"([a-z_]+)",[^\n]*?'
                     r'name:"((?:[^"\\]|\\.)*)"[^\n]*?lat:([-\d.]+),\s*lng:([-\d.]+)')
    sitios = [(m.group(1), m.group(2), m.group(3), m.group(4), m.group(5))
              for m in pat.finditer(src)]
    if not sitios:
        print('  MAL  no he podido leer places[] del fuente')
        return 1

    red = [s for s in sitios if decimales(s[3]) <= 3 and decimales(s[4]) <= 3]
    print('  coordenadas redondeadas (lat y lng con 3 decimales o menos): %d de %d'
          % (len(red), len(sitios)))
    for pid, cat, nom, la, lo in sorted(red, key=lambda s: (s[1], s[0])):
        print('      %-34s %-17s %9s,%9s  %s' % (pid, cat, la, lo, nom[:34]))

    analiza = costa.abrir()
    if analiza is None:
        print('  --  sin mapa/tenerife-osm.pmtiles no puedo medir la distancia a la costa')
        return 0

    cost = [s for s in sitios if s[1] in COSTERAS]
    lejos = []
    for pid, cat, nom, la, lo in cost:
        t, b, _ = analiza(float(la), float(lo))
        if t and b > LEJOS:
            lejos.append((b, pid, cat, nom))
    lejos.sort(reverse=True)
    print('  costeras tierra adentro (a mas de %.0f m de la costa): %d de %d'
          % (LEJOS, len(lejos), len(cost)))
    for b, pid, cat, nom in lejos:
        print('      %6.0f m  %-30s %-10s %s' % (b, pid, cat, nom[:34]))
    return 0


if __name__ == '__main__':
    sys.exit(main())
