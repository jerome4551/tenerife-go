#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
candidatos.py — para una ficha, que hay en OSM que PUEDA SER ESE SITIO.

    python3 tools/candidatos.py <id> [...]
    python3 tools/candidatos.py --a-ojo        las que tienen la coordenada puesta a ojo

PARA QUE SIRVE
  Una coordenada escrita con tres decimales no es «el punto bueno redondeado»:
  es una cuadricula de 110 m, y a menudo ni eso. Esta herramienta busca en el
  paquete de OSM de Geofabrik (datos/osm-geofabrik/) lo que comparta nombre con
  la ficha, EN TODA LA ISLA, y dice a que distancia esta del pin. Si el sitio
  con ese nombre esta a 5 km, el pin no es impreciso: esta en otro lado.

COMO BUSCA
  Por las palabras distintivas del nombre de la ficha, quitando las que no
  identifican nada (articulos, el municipio, la categoria). Ordena por cuantas
  palabras comparte y, a igualdad, por lo cerca que esta. Ensena tambien lo que
  hay PEGADO al pin, que es lo que dice si el punto cae en un sitio que no tiene
  nada que ver.

LO QUE NO HACE
  NO PROPONE NADA Y NO ESCRIBE NADA. OSM no es fuente oficial (LEEME §2.1):
  esto localiza candidatos para mirarlos uno a uno. Y que algo no aparezca aqui
  NO PRUEBA QUE NO EXISTA: el paquete es el extracto `pois` + `places` de
  Geofabrik, no OSM entero. Con la escalada quedo claro: cero elementos de
  escalada en toda Tenerife, y Guaria existe y tiene 130 vias.
"""
import json
import os
import re
import subprocess
import sys
import unicodedata

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(RAIZ, 'tools'))
import geofabrik_cerca as gf   # noqa: E402

# Palabras que no identifican NADA: articulos, preposiciones y la geografia de
# relleno. La categoria NO va aqui. «skatepark» y «canino» me parecieron palabras
# de categoria y las meti en esta lista: con eso el skatepark de La Laguna y el
# parque canino se quedaban sin ningun candidato aunque OSM los tenga. Para el
# tipo ya esta AFIN; esta lista es solo para lo que no dice nada de nadie.
VACIAS = set("""
de del la las el los y e en al a un una con por para sobre
tenerife isla islas norte sur este oeste noroeste noreste suroeste sureste
""".split())


# Que tipo de OSM encaja con cada categoria de la app. Sin esto el nombre solo
# no basta: «Lidl Granadilla de Abona» comparte «granadilla» con el ayuntamiento,
# con el museo y con el pueblo, y el supermercado quedaba el cuarto.
AFIN = {
    'supermercado':     {'supermarket', 'convenience', 'greengrocer', 'bakery'},
    'gasolinera':       {'fuel'},
    'mirador':          {'viewpoint', 'attraction'},
    'naturaleza':       {'viewpoint', 'attraction', 'peak', 'tree', 'nature_reserve'},
    'museo':            {'museum', 'artwork', 'attraction', 'arts_centre'},
    'mercadillo':       {'marketplace', 'greengrocer'},
    'barbacoa':         {'picnic_site', 'camp_site'},
    'buceo':            {'sports_shop', 'shop', 'water_sports', 'attraction'},
    'kayak':            {'sports_shop', 'shop', 'water_sports', 'attraction', 'slipway'},
    'pesca':            {'sports_shop', 'shop', 'attraction', 'slipway'},
    'deporte_publico':  {'pitch', 'sports_centre', 'playground', 'park', 'fitness_centre'},
    'petfriendly':      {'park', 'dog_park', 'playground'},
    'puerto_comercial': {'harbour', 'port', 'ferry_terminal', 'marina'},
    'ayuda':            {'clinic', 'hospital', 'community_centre', 'doctors', 'social_facility'},
    'ciclismo':         {'bicycle_shop', 'drinking_water', 'tourist_info', 'attraction'},
    'parapente':        {'attraction', 'viewpoint', 'peak'},
}


# La misma marca escrita de varias formas, y las que han cambiado de nombre.
# Sin esto la herramienta dice «no existe» de cosas que existen, y eso ya ha
# pasado dos veces el mismo dia:
#   · «SuperDino Los Realejos» estaba en OSM como «Super Dino», CON ESPACIO, y
#     como la busqueda es por palabras enteras, «hiperdino» no casaba con «dino».
#     Llegue a escribir «de los 46 HiperDino de la isla, ninguno esta en Los
#     Realejos». Estaba a 486 m del pin.
#   · «Cepsa» se llama ahora MOEVE. Busque «cepsa», encontre 1 en toda la isla y
#     di por hecho que el paquete no cubria la marca. Hay 41 Moeve.
# Regla: si una palabra de la ficha esta aqui, se busca tambien por sus hermanas.
MARCAS = {
    'hiperdino': {'hiperdino', 'hiper', 'dino', 'superdino'},
    'superdino': {'superdino', 'super', 'dino', 'hiperdino'},
    'dino':      {'dino', 'hiperdino', 'superdino'},
    'cepsa':     {'cepsa', 'moeve'},
    'moeve':     {'moeve', 'cepsa'},
}


def llano(s):
    s = unicodedata.normalize('NFD', (s or '').lower())
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return s


def palabras(txt):
    """Las que identifican: sin emoji, sin parentesis final, sin las vacias.
       Una marca arrastra a sus hermanas: ver MARCAS."""
    t = re.sub(r'\([^)]*\)', ' ', txt or '')
    t = llano(t)
    t = re.sub(r'[^a-z0-9 ]+', ' ', t)
    out = set()
    for w in t.split():
        if len(w) < 3 or w in VACIAS:
            continue
        out.add(w)
        out |= MARCAS.get(w, set())
    return sorted(out)


def fichas(ids=None):
    js = ("const{PLACES}=require('./tools/cargar');console.log(JSON.stringify("
          "PLACES.map(p=>({id:p.id,name:p.name,lat:p.lat,lng:p.lng,category:p.category,cat:(p.cat&&p.cat.es)||''}))))")
    o = subprocess.run(['node', '-e', js], cwd=RAIZ, capture_output=True, text=True)
    if o.returncode:
        sys.exit(o.stderr.strip() or 'no puedo leer PLACES')
    todas = {p['id']: p for p in json.loads(o.stdout)}
    if ids is None:
        return todas
    falta = [i for i in ids if i not in todas]
    if falta:
        sys.exit('no existe(n) en el registro: ' + ', '.join(falta))
    return [todas[i] for i in ids]


def a_ojo():
    """Los mismos que lista auditar_redondeo.py, sacados de el y no a mano."""
    o = subprocess.run([sys.executable, 'tools/auditar_redondeo.py'],
                       cwd=RAIZ, capture_output=True, text=True)
    dentro, ids = False, []
    for l in o.stdout.split('\n'):
        if 'a ojo Y SIN VERIFICAR' in l:
            dentro = True
            continue
        if dentro:
            if l.strip().startswith('redondas A PROPOSITO'):
                break
            t = l.split()
            if t:
                ids.append(t[0])
    if not ids:
        sys.exit('auditar_redondeo.py no me ha dado la lista')
    return ids


def busca(p, todos, categoria):
    """Comparte nombre, y ademas es del tipo que toca. El tipo manda sobre el
       numero de palabras: un supermercado con una palabra en comun vale mas
       que un ayuntamiento con dos."""
    clave = set(palabras(p['name']))
    if not clave:
        return []
    afin = AFIN.get(categoria, set())
    out = []
    for e in todos:
        comunes = clave & set(palabras(e.get('name')))
        if not comunes:
            continue
        encaja = bool(afin & set(e.get('fclass') or []))
        d = gf.metros(p['lat'], p['lng'], e['lat'], e['lng'])
        out.append((0 if encaja else 1, -len(comunes), d, comunes, e, encaja))
    out.sort(key=lambda x: (x[0], x[1], x[2]))
    return out


def main():
    a = sys.argv[1:]
    if not a:
        sys.exit(__doc__.strip())
    ids = a_ojo() if a[0] == '--a-ojo' else a
    todos = gf.cargar()
    print('# OSM (Geofabrik) NO es fuente oficial. Candidatos, no correcciones.')
    print('# Que algo no salga aqui NO prueba que no exista.')
    for p in fichas(ids):
        print('\n%s' % ('─' * 78))
        print('%s  «%s»' % (p['id'], p['name']))
        print('   pin %s, %s  ·  %s' % (p['lat'], p['lng'], p['cat']))
        pegado = gf.cerca(p['lat'], p['lng'], 300.0)
        if pegado:
            print('   EN EL PIN: ' + ' · '.join(
                '%s (%.0f m)' % ((e.get('name') or '(sin nombre)')[:26], d)
                for d, e in pegado[:3]))
        else:
            print('   EN EL PIN: nada en 300 m')
        hit = busca(p, todos, p.get('category') or '')
        if not hit:
            print('   por nombre: nada en toda la isla')
            continue
        deltipo = [x for x in hit if x[0] == 0]
        print('   por nombre: %d en toda la isla, %d del tipo que toca' % (len(hit), len(deltipo)))
        for _, n, d, com, e, encaja in hit[:4]:
            print('     %s %8.0f m  %-34s %-20s %s' % (
                '=' if encaja else ' ', d, (e.get('name') or '?')[:34],
                (e.get('muni') or '?')[:20], '+'.join(sorted(com))))
    return 0


if __name__ == '__main__':
    sys.exit(main())
