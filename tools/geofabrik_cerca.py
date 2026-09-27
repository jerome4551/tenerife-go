#!/usr/bin/env python3
"""
geofabrik_cerca.py — que hay en OSM alrededor de un punto, segun el paquete
de Geofabrik que trajo Jerome (datos/osm-geofabrik/).

    python3 tools/geofabrik_cerca.py <id-de-ficha> [...]     alrededor de la ficha
    python3 tools/geofabrik_cerca.py --punto lat,lng [radio_m]
    python3 tools/geofabrik_cerca.py --nombre <texto> [--desde lat,lng]
                                                             por nombre, en toda la isla
    python3 tools/geofabrik_cerca.py --municipio <id> [...]  el reparto por municipio

POR QUE OTRA HERRAMIENTA Y NO buscar_en_osm.py
  buscar_en_osm.py mira mapa/tenerife-osm.pmtiles, que es un recorte a z14:
  se deja por el camino casi todos los POI pequenos y reduce cada via o
  poligono a UN punto de rotulo. Este paquete trae 14281 POI y 1445 lugares
  sin recortar, con el municipio ya calculado punto-en-poligono. Donde el
  pmtiles no encuentra nada, este suele encontrarlo.

  QUE ALGO NO ESTE AQUI TAMPOCO QUIERE DECIR QUE NO ESTE EN OSM. El paquete
  es el extracto `pois` + `places` de Geofabrik, no OSM entero.

LO QUE ESTA HERRAMIENTA NO HACE (LEEME_CLAUDE_CODE.md, §2.1)
  OSM NO ES FUENTE OFICIAL. Esto localiza candidatos y contrasta; ningun POI
  entra, cambia o se borra por lo que diga aqui sin verificacion contra
  fuente oficial y OK de Jerome. No escribe nada en el repo.
"""
import json
import math
import os
import subprocess
import sys
import unicodedata

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAQ = os.path.join(RAIZ, 'datos', 'osm-geofabrik', 'osm')
R = 6371000.0

_cache = None


def cargar():
    """Los dos ficheros del paquete en una sola lista."""
    global _cache
    if _cache is not None:
        return _cache
    fila = []
    for fich, capa in (('osm_pois_tenerife.json', 'pois'),
                       ('osm_lugares_tenerife.json', 'lugares')):
        ruta = os.path.join(PAQ, fich)
        if not os.path.exists(ruta):
            sys.exit('falta %s — el paquete de Geofabrik no esta en el repo' % ruta)
        d = json.load(open(ruta, encoding='utf-8'))
        clave = [k for k in d if k != '_meta'][0]
        for osm_id, e in d[clave].items():
            e = dict(e)
            e['id'] = osm_id
            e['capa'] = capa
            fila.append(e)
    _cache = fila
    return fila


def metros(lat1, lng1, lat2, lng2):
    f1, f2 = math.radians(lat1), math.radians(lat2)
    df, dl = f2 - f1, math.radians(lng2 - lng1)
    a = math.sin(df / 2) ** 2 + math.cos(f1) * math.cos(f2) * math.sin(dl / 2) ** 2
    return 2 * R * math.asin(min(1.0, math.sqrt(a)))


def _llano(s):
    s = unicodedata.normalize('NFD', (s or '').lower())
    return ''.join(c for c in s if unicodedata.category(c) != 'Mn')


def cerca(lat, lng, radio=500.0):
    """Lo que hay a menos de `radio` metros, de mas cerca a mas lejos."""
    # Una caja primero: comparar 15726 distancias por ficha no hace falta.
    dlat = radio / 111320.0
    dlng = radio / (111320.0 * max(0.2, math.cos(math.radians(lat))))
    out = []
    for e in cargar():
        if abs(e['lat'] - lat) > dlat or abs(e['lng'] - lng) > dlng:
            continue
        d = metros(lat, lng, e['lat'], e['lng'])
        if d <= radio:
            out.append((d, e))
    out.sort(key=lambda x: x[0])
    return out


def por_nombre(texto):
    t = _llano(texto)
    return [e for e in cargar() if t in _llano(e.get('name'))]


def _pinta(d, e):
    tipo = '/'.join(e.get('fclass') or []) or e.get('grupo') or e['capa']
    return '    %8.0f m  %-42s %-16s %-24s %s' % (
        d, (e.get('name') or '(sin nombre)')[:42], tipo[:16],
        (e.get('muni') or '?')[:24], e.get('osm') or e['id'])


def _fichas(ids):
    js = ("const{PLACES}=require('./tools/cargar');"
          "console.log(JSON.stringify(PLACES.map(p=>"
          "({id:p.id,lat:p.lat,lng:p.lng,name:p.name}))))")
    o = subprocess.run(['node', '-e', js], cwd=RAIZ, capture_output=True, text=True)
    if o.returncode:
        sys.exit(o.stderr.strip() or 'no puedo leer PLACES')
    todas = {p['id']: p for p in json.loads(o.stdout)}
    falta = [i for i in ids if i not in todas]
    if falta:
        sys.exit('no existe(n) en el registro: ' + ', '.join(falta))
    return [todas[i] for i in ids]


def main():
    a = sys.argv[1:]
    if not a:
        sys.exit(__doc__.strip())

    print('# OSM (Geofabrik) NO es fuente oficial. Candidatos, no correcciones.')

    if a[0] == '--nombre':
        desde = None
        if '--desde' in a:
            i = a.index('--desde')
            if i + 1 >= len(a) or ',' not in a[i + 1]:
                sys.exit('--desde necesita lat,lng')
            desde = [float(x) for x in a[i + 1].split(',')]
            a = a[:i] + a[i + 2:]
        if len(a) < 2:
            sys.exit('--nombre necesita un texto')
        texto = ' '.join(a[1:])
        hit = por_nombre(texto)
        print('«%s»: %d en toda la isla' % (texto, len(hit)))
        if desde:
            print('  ordenados por distancia a %s, %s' % (desde[0], desde[1]))
            for d, e in sorted((metros(desde[0], desde[1], e['lat'], e['lng']), e)
                               for e in hit):
                print('%s  %s, %s' % (_pinta(d, e), e['lat'], e['lng']))
        else:
            for e in sorted(hit, key=lambda e: e.get('name') or ''):
                print(_pinta(0, e).replace('       0 m', '          '))
        return 0

    if a[0] == '--punto':
        if len(a) < 2 or ',' not in a[1]:
            sys.exit('--punto necesita lat,lng')
        lat, lng = [float(x) for x in a[1].split(',')]
        radio = float(a[2]) if len(a) > 2 else 500.0
        hit = cerca(lat, lng, radio)
        print('%s, %s · %d elemento(s) a menos de %g m' % (lat, lng, len(hit), radio))
        for d, e in hit[:40]:
            print(_pinta(d, e))
        return 0

    reparto = a[0] == '--municipio'
    ids = a[1:] if reparto else a
    if not ids:
        sys.exit('dime al menos un id')

    for p in _fichas(ids):
        print('\n%s  «%s»  %s, %s' % (p['id'], p.get('name') or '', p['lat'], p['lng']))
        hit = cerca(p['lat'], p['lng'], 1000.0)
        if not hit:
            print('    nada en 1 km. El paquete no lo tiene: no prueba que no exista.')
            continue
        if reparto:
            # Que municipio dice OSM de lo que hay alrededor, y a que distancia
            # el primero de cada uno. Esto es lo que contrasta el poligono.
            visto = {}
            for d, e in hit:
                m = e.get('muni') or '?'
                if m not in visto:
                    visto[m] = (d, e)
            for m, (d, e) in sorted(visto.items(), key=lambda x: x[1][0]):
                print('    %-24s el mas cercano a %.0f m: %s' % (
                    m, d, (e.get('name') or '(sin nombre)')[:40]))
        else:
            for d, e in hit[:12]:
                print(_pinta(d, e))
    return 0


if __name__ == '__main__':
    sys.exit(main())
