#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
gasolineras_plan.py — corta el trabajo de las 212 gasolineras en 31 tandas,
una por municipio.

    python3 tools/gasolineras_plan.py

DE DONDE SALE TODO
  registro/gasolineras-canarias.json, que baja el flujo de GitHub Actions desde
  el Ministerio. El municipio NO es el del registro: es el del poligono del
  Cabildo, calculado aqui. (Coinciden en las 212, pero el que manda es el
  poligono, como en los bloques anteriores.)

LO QUE ESCRIBE
  datos/gasolineras/plan/NN-municipio.json, una tanda por municipio, con las
  estaciones ya emparejadas contra las fichas que la app YA tiene, para no
  duplicar ninguna.

LO QUE NO ESCRIBE
  index.html. Ni una linea. Y NINGUN PRECIO: el registro los trae, pero un
  precio caduca en 24 h y no puede vivir dentro de la app.
"""
import json
import os
import subprocess
import sys
import unicodedata

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(RAIZ, 'tools'))
sys.argv = [sys.argv[0]]          # gasolineras.py mira sys.argv al importarse
import gasolineras as G           # noqa: E402
import geofabrik_cerca as gf      # noqa: E402

SALIDA = os.path.join(RAIZ, 'datos', 'gasolineras', 'plan')


def llano(s):
    s = unicodedata.normalize('NFD', (s or '').lower())
    return ''.join(c for c in s if unicodedata.category(c) != 'Mn')


def main():
    reg, _ = G.cargar_registro()
    app = G.gasolineras_app()
    for p in app:
        p['marca'] = G.marca_de(p['name'])

    # El emparejamiento es EXCLUSIVO: cada ficha de la app reclama UNA sola
    # estacion, la mas cercana. Sin esto salian 18 emparejamientos para 14 fichas,
    # porque hay pines con dos o tres estaciones alrededor -el de Guimar tiene un
    # BP a 14 m, una H2EXAGON a 224 m y una PLENERGY a 194 m- y las tres se daban
    # por «ya en la app». Las otras dos siguen necesitando su ficha.
    reclamada = {}
    for p in app:
        mejor = None
        for e in reg:
            d = gf.metros(p['lat'], p['lng'], e['lat'], e['lng'])
            if d > 300:
                continue
            if e['marca'] and p['marca'] and e['marca'] != p['marca']:
                continue
            if mejor is None or d < mejor[0]:
                mejor = (d, e)
        if mejor:
            reclamada[mejor[1]['ideess']] = {'id': p['id'], 'name': p['name'],
                                             'a_metros': round(mejor[0])}

    porm = {}
    for e in reg:
        porm.setdefault(e['municipio_poligono'] or '(sin municipio)', []).append(e)

    os.makedirs(SALIDA, exist_ok=True)
    for f in os.listdir(SALIDA):
        os.remove(os.path.join(SALIDA, f))

    total_ya = total_nuevas = 0
    print('%-30s %6s %6s %6s' % ('municipio', 'total', 'ya', 'nuevas'))
    print('-' * 52)
    for n, (muni, ests) in enumerate(sorted(porm.items(), key=lambda x: -len(x[1])), 1):
        filas = []
        for e in sorted(ests, key=lambda x: x['rotulo']):
            ya = reclamada.get(e['ideess'])
            filas.append({
                'ideess': e['ideess'],
                'rotulo': e['rotulo'],
                'marca': e['marca'],
                'direccion': e['direccion'],
                'cp': e['cp'],
                'localidad': e['localidad'],
                'municipio': e['municipio_poligono'],
                'horario': e['horario'],
                'lat': e['lat'],
                'lng': e['lng'],
                'ya_en_la_app': ya,
            })
        ya = sum(1 for f in filas if f['ya_en_la_app'])
        total_ya += ya
        total_nuevas += len(filas) - ya
        ruta = os.path.join(SALIDA, '%02d-%s.json' % (
            n, llano(muni).replace(' ', '-').replace('ñ', 'n')))
        json.dump({'_': ['Tanda %d de %d: %s.' % (n, len(porm), muni),
                         'Del registro oficial del MITECO; el municipio lo pone el poligono del Cabildo.',
                         'SIN PRECIOS a proposito: caducan en 24 h y no viven dentro de la app.',
                         'Nada de esto esta aplicado.'],
                   'municipio': muni,
                   'estaciones': len(filas),
                   'ya_en_la_app': ya,
                   'altas_nuevas': len(filas) - ya,
                   'lista': filas},
                  open(ruta, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        print('%-30s %6d %6d %6d' % (muni[:30], len(filas), ya, len(filas) - ya))
    print('-' * 52)
    print('%-30s %6d %6d %6d' % ('total', total_ya + total_nuevas, total_ya, total_nuevas))
    print('\n%d tandas en %s' % (len(porm), SALIDA))
    return 0


if __name__ == '__main__':
    sys.exit(main())
