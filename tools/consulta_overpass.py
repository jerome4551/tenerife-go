#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
consulta_overpass.py — escribe la consulta de Overpass de lo que falta.

    python3 tools/consulta_overpass.py > consulta.overpassql

QUE ES ESTO
  Overpass es el buscador de OpenStreetMap: se le pide «dame los
  supermercados que se llamen Lidl a 2 km de este punto» y contesta con la
  lista y sus coordenadas. Desde este contenedor esta CERRADO por la politica
  de salida (000 en los dos endpoints), asi que la consulta se escribe aqui y
  se ejecuta fuera, en un navegador.

  El «volcado» es simplemente el resultado en JSON, guardado en un fichero.
  Con ese fichero delante, las coordenadas que faltan salen sin inventar nada.

QUE SALE DE AQUI
  La consulta de las fichas que siguen con la coordenada puesta a ojo, sacadas
  del propio repositorio: las que auditar_redondeo.py cuenta como «a ojo y sin
  verificar», sin las que estan declaradas como rotulo de zona. Si manana son
  otras, la consulta cambia sola.

  Para cada ficha se pide lo que tiene sentido pedir: por marca si la ficha
  nombra una, y por tipo de sitio si no -una gasolinera, un mirador, un parque
  canino-. Cada bloque lleva delante el id en un comentario, para poder atar
  cada resultado a su ficha.
"""
import io
import json
import os
import re
import sys
import unicodedata

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VERIF = os.path.join(RAIZ, 'datos', 'verificado.json')

# Marca -> como se escribe en OSM. Si la ficha nombra una marca, se busca por
# nombre: es lo que de verdad identifica la tienda.
MARCAS = ['Mercadona', 'Lidl', 'HiperDino', 'SuperDino', 'Spar', 'Aldi',
          'Repsol', 'Cepsa', 'Disa', 'Shell', 'BP', 'Moeve']
# Categoria de la app -> que etiqueta de OSM pedir cuando no hay marca.
POR_TIPO = {
    'gasolinera':      ['"amenity"="fuel"'],
    'mirador':         ['"tourism"="viewpoint"'],
    'petfriendly':     ['"leisure"="dog_park"'],
    'mercadillo':      ['"amenity"="marketplace"'],
    'museo':           ['"tourism"="museum"', '"tourism"="gallery"', '"amenity"="arts_centre"'],
    'barbacoa':        ['"tourism"="picnic_site"', '"leisure"="picnic_table"'],
    'deporte_publico': ['"leisure"="fitness_station"', '"leisure"="pitch"', '"leisure"="sports_centre"'],
    'buceo':           ['"shop"="scuba_diving"', '"sport"="scuba_diving"'],
    'kayak':           ['"sport"="canoe"', '"shop"="sports"'],
    'pesca':           ['"shop"="fishing"', '"sport"="fishing"'],
    'parapente':       ['"sport"="free_flying"', '"paragliding"="takeoff"'],
    'puerto_comercial': ['"landuse"="port"', '"industrial"="port"', '"amenity"="ferry_terminal"'],
    'oficina_turismo': ['"tourism"="information"'],
    'ayuda':           ['"amenity"="social_facility"', '"office"="ngo"', '"healthcare"'],
    'ciclismo':        ['"amenity"="drinking_water"', '"tourism"="information"'],
    'supermercado':    ['"shop"="supermarket"', '"shop"="convenience"'],
    'golf':            ['"leisure"="golf_course"'],
    'montana':         ['"natural"="peak"'],
    'naturaleza':      ['"tourism"="viewpoint"', '"natural"="peak"'],
    'accesible':       ['"tourism"="information"'],
    'municipio':       ['"place"'],
    'senderismo':      ['"information"="guidepost"'],
}
RADIO = 2000


def sinTildes(s):
    s = unicodedata.normalize('NFD', s or '')
    return ''.join(c for c in s if unicodedata.category(c) != 'Mn')


def decimales(x):
    return 0 if '.' not in x else len(x.split('.')[1].rstrip('0'))


def main():
    src = io.open(os.path.join(RAIZ, 'index.html'), encoding='utf-8').read()
    pat = re.compile(r'\{\s*id:"([a-z0-9\-]+)",[^\n]*?category:"([a-z_]+)",[^\n]*?'
                     r'name:"((?:[^"\\]|\\.)*)"[^\n]*?lat:([-\d.]+),\s*lng:([-\d.]+)')
    reg = json.load(io.open(VERIF, encoding='utf-8')) if os.path.exists(VERIF) else {}
    ok = reg.get('coordenada', {})
    zona = reg.get('coordenada_de_zona', {})

    faltan = []
    for m in pat.finditer(src):
        pid, cat, nom, la, lo = m.groups()
        if decimales(la) > 3 or decimales(lo) > 3:
            continue
        if pid in ok or pid in zona:
            continue
        faltan.append((pid, cat, nom, la, lo))

    w = sys.stdout.write
    w('// Consulta de Overpass para las %d fichas que siguen con la coordenada\n' % len(faltan))
    w('// puesta a ojo. Generada con: python3 tools/consulta_overpass.py\n')
    w('//\n')
    w('// COMO SE EJECUTA, sin instalar nada:\n')
    w('//   1. Abre https://overpass-turbo.eu\n')
    w('//   2. Pega todo esto en el panel de la izquierda\n')
    w('//   3. Pulsa «Run» (o Ctrl+Enter). Tarda un minuto largo.\n')
    w('//   4. «Export» -> «raw data directly from Overpass API» -> guarda el\n')
    w('//      fichero .json y mandalo.\n')
    w('//\n')
    w('// Cada bloque lleva delante el id de la ficha y lo que dice hoy la app,\n')
    w('// para poder atar cada resultado a su sitio.\n\n')
    w('[out:json][timeout:300];\n(\n')
    for pid, cat, nom, la, lo in sorted(faltan):
        marca = next((mk for mk in MARCAS if sinTildes(mk).lower() in sinTildes(nom).lower()), None)
        w('  // %s — %s\n' % (pid, nom))
        w('  //   la app dice %s,%s\n' % (la, lo))
        if marca:
            w('  nwr(around:%d,%s,%s)["name"~"%s",i];\n' % (RADIO, la, lo, marca))
        for etiqueta in POR_TIPO.get(cat, []):
            w('  nwr(around:%d,%s,%s)[%s];\n' % (RADIO, la, lo, etiqueta))
    w(');\nout center tags;\n')
    return 0


if __name__ == '__main__':
    sys.exit(main())
