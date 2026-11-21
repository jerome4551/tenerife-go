#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""La costa de Tenerife del mapa pequeño de las rutas en coche del «Pase de viaje»
(modulos/pase.js, CONTORNO), sacada del relieve de la propia app (21 de noviembre de 2026).

    python3 tools/pase_contorno.py              imprime el contorno (JSON, [lng, lat])
    python3 tools/pase_contorno.py --comprobar  dice si el de modulos/pase.js es el mismo

DE DONDE SALE. El canal azul de mapa/tenerife-relieve.png («costa», ver su .json) vale 128 en la
linea de costa de la capa «earth» de OpenStreetMap, mas hacia tierra y menos hacia el mar. Se toma
la linea de 128 mas larga (la isla; los roques sueltos quedan fuera), se simplifica a 2,5 celdas
(unos 170 m: en un mapa de 360 px que cubre una ruta, menos de un pixel) y se pasa cada vertice de
la malla Web Mercator a longitud y latitud con cuatro decimales.

NO HACE FALTA PARA LA AUDITORIA: tools/probar_pase.js comprueba, en el navegador y con el relieve
ya leido, que cada vertice cae en la costa. Esto solo hace falta para volver a sacarlo si cambia
el relieve. Necesita numpy, Pillow y scikit-image (pip install numpy pillow scikit-image).
"""
import json, math, os, re, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def contorno():
    import numpy as np
    from PIL import Image
    from skimage import measure
    m = json.load(open(os.path.join(RAIZ, 'mapa', 'tenerife-relieve.json'), encoding='utf-8'))['malla']
    im = np.array(Image.open(os.path.join(RAIZ, 'mapa', 'tenerife-relieve.png')).convert('RGBA'))
    costa = im[:, :, 2].astype(float)
    lineas = sorted(measure.find_contours(costa, 128), key=len, reverse=True)
    simple = measure.approximate_polygon(lineas[0], tolerance=2.5)
    R = 6378137.0
    out = []
    for fila, col in simple:
        X = m['x0'] + (col + 0.5) * m['paso']
        Y = m['y0'] - (fila + 0.5) * m['paso']
        lng = X / R * 180 / math.pi
        lat = (2 * math.atan(math.exp(Y / R)) - math.pi / 2) * 180 / math.pi
        out.append([round(lng, 4), round(lat, 4)])
    return out


def en_pase():
    s = open(os.path.join(RAIZ, 'modulos', 'pase.js'), encoding='utf-8').read()
    m = re.search(r'var CONTORNO = (\[\[.*?\]\]);', s)
    return json.loads(m.group(1)) if m else None


if __name__ == '__main__':
    nuevo = contorno()
    if '--comprobar' in sys.argv:
        viejo = en_pase()
        if viejo == nuevo:
            print('el contorno de modulos/pase.js esta al dia (%d vertices)' % len(nuevo))
            sys.exit(0)
        print('el contorno de modulos/pase.js NO es el del relieve: %s vertices en el modulo, %d sacados'
              % (len(viejo) if viejo else 'ningun', len(nuevo)))
        sys.exit(1)
    print(json.dumps(nuevo, separators=(',', ':')))
