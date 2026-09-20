#!/usr/bin/env python3
"""
auditar_en_el_mar.py — lugares que caen en el agua y no deberian.

    python3 tools/auditar_en_el_mar.py [--lista]

EL HUECO QUE TAPA
  auditar_ubicacion.py mide las 99 playas y charcos y avisa si alguno esta
  LEJOS del agua. Nadie miraba lo contrario: un supermercado, un parking o
  una ermita METIDOS EN EL MAR. Y los habia. Se veian en el movil y en
  ningun control.

COMO SE MIDE
  Un sitio de tierra tiene que estar DENTRO de un poligono de tierra. No se
  geocodifica nada ni se pregunta a nadie; la respuesta sale de un dato que
  ya estaba en el repositorio: la capa `earth` del mapa de OSM del proyecto.

  La geometria -y las dos trampas que tiene, el eje Y volteado y los
  agujeros del poligono- vive en tools/costa.py, que es donde esta la linea
  de costa del proyecto. Aqui solo se usa.

POR QUE SE MIDE CUANTO, Y NO SOLO SI
  El poligono a z14 esta generalizado, asi que un punto a pocos metros de
  la orilla puede caer del lado equivocado por el propio dibujo. Lo que se
  ordena es la distancia al borde de tierra mas cercano: a 2 km es un error
  de datos, a 3 m es el dibujo.

  Un puerto, una marina o un embarcadero SI estan en el agua por
  definicion. Se miden igual y se listan aparte en vez de callarlos: que la
  exencion este escrita y no sea un silencio.
"""
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import costa

RAIZ = costa.RAIZ

# Lo que puede estar en el agua sin que sea un fallo.
# Un FARO no entra aqui: se construye en tierra o sobre un dique, y el que
# estaba a 444 m mar adentro se veia a simple vista en el movil.
DEL_AGUA = {'puerto_ocio', 'puerto_comercial', 'piscinas', 'buceo', 'avistamiento'}

# A partir de aqui ya no es el dibujo generalizado: es un error de dato.
UMBRAL = 60.0


def main():
    lista = '--lista' in sys.argv
    analiza = costa.abrir()
    if analiza is None:
        print('  --  no hay mapa/tenerife-osm.pmtiles: no se puede medir (no es fallo)')
        return 0

    src = open(os.path.join(RAIZ, 'index.html'), encoding='utf-8').read()
    pat = re.compile(r'\{\s*id:"([a-z0-9\-]+)",[^\n]*?category:"([a-z_]+)",[^\n]*?'
                     r'name:"((?:[^"\\]|\\.)*)"[^\n]*?lat:([-\d.]+),\s*lng:([-\d.]+)')
    sitios = [(m.group(1), m.group(2), m.group(3), float(m.group(4)), float(m.group(5)))
              for m in pat.finditer(src)]
    if not sitios:
        print('  MAL  no he podido leer places[] del fuente')
        return 1

    fuera, exentos = [], []
    for pid, cat, nom, la, lo in sitios:
        t, b, _ = analiza(la, lo)
        if t:
            continue
        (exentos if cat in DEL_AGUA else fuera).append((b, pid, cat, nom, la, lo))
    fuera.sort(reverse=True)
    exentos.sort(reverse=True)
    graves = [x for x in fuera if x[0] >= UMBRAL]

    print('  lugares medidos contra la capa earth de OSM.: %d' % len(sitios))
    print('  de tierra y FUERA de tierra.................: %d' % len(fuera))
    print('  de esos, a mas de %.0f m del borde (no es el dibujo): %d' % (UMBRAL, len(graves)))
    for b, pid, cat, nom, la, lo in (fuera if lista else graves):
        print('      %7.0f m del borde  %-30s %-18s %-32s %.5f,%.5f'
              % (b, pid, cat, nom[:32], la, lo))
    if exentos:
        print('  puertos, marinas y charcos (estan en el agua a proposito): %d' % len(exentos))
        if lista:
            for b, pid, cat, nom, la, lo in exentos:
                print('          %7.0f m  %-30s %s' % (b, pid, cat))
    return 1 if graves else 0


if __name__ == '__main__':
    sys.exit(main())
