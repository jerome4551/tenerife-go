#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
zonas_lugares.py — Norte o Sur de cada lugar, para «Organiza tu día».

    python3 tools/zonas_lugares.py               # escribe el bloque en index.html
    python3 tools/zonas_lugares.py --comprobar   # el bloque de index.html, ¿al dia?

POR QUE
  Jerome, 13 de octubre de 2026: «la isla es grande, si voy de los cristianos
  a Santa Cruz son más de 50km. Podríamos proponer si quiere quedarse en el
  sur o norte o no importa». «Organiza tu día» pregunta Norte, Sur o «Me da
  igual», y con Norte o con Sur solo salen lugares de esa zona.

DE DONDE SALE LA ZONA
  Del MUNICIPIO, y el municipio, del poligono oficial del Cabildo
  (tools/municipio.py, que coincide con las 2.514 paradas de TITSA: 2.514 de
  2.514). Nada a ojo, nada por el nombre ni por la latitud.

  Norte: los 19 municipios de NORTE, de Santa Cruz a Buenavista del Norte.
  Sur: los 12 de SUR, de Candelaria a Santiago del Teide.
  Es el reparto que ya usaba la pestaña «Ruta del día»: Candelaria, Arafo y
  Güímar en el Sur, El Rosario en el Norte.

  LO QUE SE LE HA DICHO A JEROME: el Teide y casi todo Las Cañadas son de La
  Orotava, asi que salen en el Norte; Masca y los Acantilados de Los Gigantes
  son de Buenavista del Norte, y tambien. Si un dia se quieren en las dos
  zonas, se dice AQUI, con su porque, y no a mano en index.html.

LO QUE CAE FUERA DE TODO POLIGONO
  El dibujo municipal acaba en la orilla, y un muelle o una piscina natural
  quedan a veces unos metros fuera (15 fichas el 13 de octubre de 2026; la
  que mas, a 493 m). Van con el municipio mas cercano SOLO si esta a menos de
  1 km y el siguiente queda al menos al doble. Si no, el guion PARA y no
  escribe nada: eso lo decide una persona.

EL CONTROL (--comprobar, en auditar.sh)
  1. El bloque de index.html es exactamente el que sale de aqui. Un lugar
     dado de alta sin pasar el guion no tiene zona: no saldria ni en el Norte
     ni en el Sur, y nadie lo veria.
  2. Cada municipio del poligono tiene zona, y solo una.
  3. Las listas Norte y Sur de «Ruta del día», hechas a mano, frente al
     poligono.
"""
import io
import json
import os
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import municipio as M  # noqa: E402

RAIZ = M.RAIZ
HTML = os.path.join(RAIZ, 'index.html')

# Los nombres, como los devuelve municipio.de() (el shapefile con ALIAS).
NORTE = [
    'Santa Cruz de Tenerife', 'San Cristóbal de La Laguna', 'El Rosario', 'Tegueste',
    'Tacoronte', 'El Sauzal', 'La Matanza de Acentejo', 'La Victoria de Acentejo',
    'Santa Úrsula', 'La Orotava', 'Puerto de la Cruz', 'Los Realejos',
    'San Juan de la Rambla', 'La Guancha', 'Icod de los Vinos', 'Garachico',
    'El Tanque', 'Los Silos', 'Buenavista del Norte',
]
SUR = [
    'Candelaria', 'Arafo', 'Güímar', 'Fasnia', 'Arico', 'Granadilla de Abona',
    'San Miguel de Abona', 'Vilaflor', 'Arona', 'Adeje', 'Guía de Isora',
    'Santiago del Teide',
]
ZONA = dict([(m, 'norte') for m in NORTE] + [(m, 'sur') for m in SUR])

# Fuera de todo poligono: el mas cercano, si esta a menos de esto...
FUERA_MAX_M = 1000
# ...y el siguiente queda al menos a tantas veces esa distancia.
FUERA_VECES = 2

# «Ruta del día» tiene sus listas de sugerencias por zona, hechas a mano.
# Estas cuatro son de Buenavista del Norte y la lista las pone en el Sur: se
# llega a ellas desde Los Gigantes y Santiago del Teide. Estan asi desde antes
# del 13 de octubre de 2026 y quedan preguntadas a Jerome; no se cambian sin su
# OK. Cualquier otra que no case con el poligono pone esto en rojo.
RUTA_DIA_PREGUNTADAS = {'masca', 'ruta-masca-playa', 'mirador-maska', 'acantilados-gigantes'}

INI = '/* >>> zonas de los lugares'
FIN = '/* <<< zonas de los lugares */'


def calcular():
    """{id: (zona, municipio, metros fuera o 0)}, o sale con un mensaje."""
    por, _ = M.cargar()
    municipios = sorted(M.ALIAS.get(n, n) for n in por)
    sin_zona = [m for m in municipios if m not in ZONA]
    sin_poligono = [m for m in ZONA if m not in municipios]
    if sin_zona or sin_poligono:
        print('  municipios del poligono sin zona: %s' % (sin_zona or '-'))
        print('  municipios con zona que el poligono no tiene: %s' % (sin_poligono or '-'))
        sys.exit(1)
    res = {}
    paran = []
    for i, p in sorted(M._lugares().items()):
        m = M.de(p['lat'], p['lng'])
        d = 0
        if m is None:
            ds = sorted((M.metros_a(p['lat'], p['lng'], n), n) for n in municipios)
            (d, m), (d2, m2) = ds[0], ds[1]
            if d > FUERA_MAX_M or d2 < FUERA_VECES * max(d, 1):
                paran.append('%s: %s a %.0f m, %s a %.0f m' % (i, m, d, m2, d2))
                continue
        res[i] = (ZONA[m], m, d)
    if paran:
        print('  PARA: lugares fuera de todo poligono sin un municipio claro:')
        for x in paran:
            print('    ' + x)
        sys.exit(1)
    return res


def bloque(res):
    def lineas(z):
        ids = sorted(i for i, v in res.items() if v[0] == z)
        out, cur = [], ''
        for i in ids:
            if cur and len(cur) + 1 + len(i) > 92:
                out.append(cur)
                cur = i
            else:
                cur = (cur + ' ' + i) if cur else i
        if cur:
            out.append(cur)
        return ',\n'.join("    '%s'" % x for x in out)
    return (INI + ' · las escribe tools/zonas_lugares.py: NO SE TOCAN A MANO.\n'
            '   Norte o Sur de cada lugar, por el poligono oficial de su municipio\n'
            '   (Cabildo). Las usa «Organiza tu día»: Norte, Sur o «Me da igual».\n'
            '   Un lugar nuevo no tiene zona hasta que se vuelve a pasar el guion, y\n'
            '   auditar.sh lo dice. */\n'
            'const DP_ZONA_LUGAR = {\n'
            '  norte: [\n' + lineas('norte') + '\n  ].join(\' \'),\n'
            '  sur: [\n' + lineas('sur') + '\n  ].join(\' \')\n'
            '};\n' + FIN)


def ruta_del_dia():
    """Las sugerencias Norte y Sur de «Ruta del día», leidas del fuente."""
    js = ("const s=require('fs').readFileSync('index.html','utf8');"
          "const i=s.indexOf('const DAY_TRIP_ZONES = {');"
          "const j=s.indexOf('\\n};',i);"
          "const D=eval('('+s.slice(s.indexOf('{',i),j+2)+')');"
          "console.log(JSON.stringify({norte:D.north.suggestionIds,sur:D.south.suggestionIds}))")
    o = subprocess.run(['node', '-e', js], cwd=RAIZ, capture_output=True, text=True)
    return json.loads(o.stdout)


def main():
    if M.cargar() is None:
        print('  NO ESTA %s: sin el poligono no hay zona que comprobar' % M.GEO)
        return 1
    res = calcular()
    nuevo = bloque(res)
    s = io.open(HTML, encoding='utf-8').read()
    a = s.find(INI)
    b = s.find(FIN)
    if a < 0 or b < a:
        print('  no encuentro las marcas «%s» y «%s» en index.html' % (INI, FIN))
        return 1
    actual = s[a:b + len(FIN)]

    n = sum(1 for v in res.values() if v[0] == 'norte')
    fuera = sorted((v[2], i, v[1]) for i, v in res.items() if v[2])
    print('  lugares con zona, por el poligono de su municipio: %d' % len(res))
    print('    Norte (%d municipios)....................... %d' % (len(NORTE), n))
    print('    Sur (%d municipios)......................... %d' % (len(SUR), len(res) - n))
    print('    fuera del poligono, con el mas cercano...... %d%s' % (
        len(fuera), (' (el mas lejos: %s, %s, a %.0f m)' % (fuera[-1][1], fuera[-1][2], fuera[-1][0])) if fuera else ''))

    if '--comprobar' not in sys.argv[1:]:
        if actual == nuevo:
            print('  index.html ya estaba al dia')
        else:
            io.open(HTML, 'w', encoding='utf-8').write(s[:a] + nuevo + s[b + len(FIN):])
            print('  escrito en index.html')
        return 0

    mal = 0
    if actual != nuevo:
        mal += 1
        ids_html = {}
        for z in ('norte', 'sur'):
            k = actual.find('  %s: [' % z)
            trozo = actual[k:actual.find(']', k)] if k >= 0 else ''
            for linea in trozo.split('\n')[1:]:
                for i in linea.strip().strip(",'").split():
                    ids_html[i] = z
        sin = sorted(i for i in res if i not in ids_html)
        sobra = sorted(i for i in ids_html if i not in res)
        cambia = sorted(i for i in res if i in ids_html and ids_html[i] != res[i][0])
        print('  EL BLOQUE DE index.html NO ESTA AL DIA (python3 tools/zonas_lugares.py):')
        print('    lugares sin zona.......................... %d %s' % (len(sin), ' '.join(sin[:6])))
        print('    zonas de lugares que ya no existen......... %d %s' % (len(sobra), ' '.join(sobra[:6])))
        print('    con la zona cambiada....................... %d %s' % (len(cambia), ' '.join(cambia[:6])))
    else:
        print('  el bloque de index.html es el que sale del poligono: si')

    rd = ruta_del_dia()
    for z in ('norte', 'sur'):
        malos = [i for i in rd[z] if i in res and res[i][0] != z and i not in RUTA_DIA_PREGUNTADAS]
        no_hay = [i for i in rd[z] if i not in res]
        print('  «Ruta del día», %s: %d sugerencias; en un municipio de la otra zona: %d; que no existen: %d'
              % (z.capitalize(), len(rd[z]), len(malos), len(no_hay)))
        for i in malos + no_hay:
            print('      <--  %s %s' % (i, ('(' + res[i][1] + ')') if i in res else '(no hay ficha)'))
        mal += len(malos) + len(no_hay)
    preg = sorted(i for i in RUTA_DIA_PREGUNTADAS if i in rd['sur'] and i in res and res[i][0] == 'norte')
    print('    preguntadas a Jerome, en el Sur de «Ruta del día» y de un municipio del Norte: %d (%s)'
          % (len(preg), ', '.join(preg)))
    print('  todo en orden' if not mal else '  *** %d cosa(s) que mirar ***' % mal)
    return 1 if mal else 0


if __name__ == '__main__':
    sys.exit(main())
