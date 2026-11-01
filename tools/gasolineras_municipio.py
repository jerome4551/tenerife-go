#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
gasolineras_municipio.py — el municipio de cada gasolinera de la app, para
datos/gasolineras-municipio.json.

    python3 tools/gasolineras_municipio.py           lo escribe
    python3 tools/gasolineras_municipio.py --mirar   solo dice si esta al dia

POR QUE (7 de octubre). Desde ese dia la app pide los precios EN VIVO al
Ministerio, como el tiempo y el mar a Open-Meteo, y calcula ella «las mas
baratas de cada municipio» con la regla de Jerome. Para eso necesita saber de
que municipio es cada gasolinera, y tiene que ser EL MISMO que usa
tools/precios_gasolineras.py: el poligono municipal (tools/municipio.py) sobre
la coordenada de la ficha, no el campo Municipio del registro. Esto no es un
dato perecedero: cambia solo si cambia una ficha, y entonces
auditar_precios_gasolineras.py se pone rojo hasta que se vuelva a escribir.
"""
import json
import os
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(RAIZ, 'tools'))
import precios_gasolineras as P   # noqa: E402
import municipio as M             # noqa: E402

SALIDA = os.path.join(RAIZ, 'datos', 'gasolineras-municipio.json')


def calcular():
    fichas = P.fichas_de_la_app()
    out = {}
    for f in sorted(fichas, key=lambda f: f['id']):
        mu = M.de(f['lat'], f['lng'])
        if not mu:
            sys.exit('PARO: %s no cae en ningun municipio' % f['id'])
        out[f['id']] = mu
    return {
        '_': ['Lo escribe tools/gasolineras_municipio.py: el municipio (poligono) de cada gasolinera de la app.',
              'La app lo usa para calcular en vivo las mas baratas de cada municipio. No se edita a mano.'],
        'municipios': out,
    }


def main():
    nuevo = calcular()
    if '--mirar' in sys.argv[1:]:
        try:
            viejo = json.load(open(SALIDA, encoding='utf-8'))
        except (OSError, ValueError):
            viejo = None
        ok = bool(viejo) and viejo.get('municipios') == nuevo['municipios']
        print('datos/gasolineras-municipio.json ' + ('al dia' if ok else 'NO esta al dia: python3 tools/gasolineras_municipio.py'))
        return 0 if ok else 1
    with open(SALIDA, 'w', encoding='utf-8') as fh:
        fh.write(json.dumps(nuevo, ensure_ascii=False, indent=1, sort_keys=False) + '\n')
    print('%d gasolineras -> %s' % (len(nuevo['municipios']), os.path.relpath(SALIDA, RAIZ)))
    return 0


if __name__ == '__main__':
    sys.exit(main())
