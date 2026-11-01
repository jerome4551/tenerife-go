#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
gasolineras.py — las gasolineras de la app contra el REGISTRO OFICIAL.

    python3 tools/gasolineras.py              contra el registro oficial
    python3 tools/gasolineras.py --sin-registro   provisional, mientras no llega

QUE NECESITA
  datos/gasolineras/miteco_provincia38_AAAA-MM-DD.json, que es la respuesta de
  la API de precios de carburantes del Ministerio para la Transicion Ecologica
  (provincia 38). Coge el mas reciente que encuentre. Si no hay ninguno, PARA y
  lo dice: desde este entorno la descarga esta bloqueada y la sube Jerome.

    curl -s -H "Accept: application/json" \\
      "https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/\\
PreciosCarburantes/EstacionesTerrestres/FiltroProvincia/38" \\
      -o datos/gasolineras/miteco_provincia38_AAAA-MM-DD.json

POR QUE EL REGISTRO Y NO GOOGLE
  Google no da coordenadas y no es fuente oficial. El registro si: trae rotulo,
  direccion, municipio, horario, coordenadas y el IDEESS, que es el
  identificador oficial de la estacion y permite volver a sincronizar.

EL MODO --sin-registro
  Mientras el registro no este, empareja las CAPTURAS de Jerome con los
  surtidores del mapa del repositorio: misma marca, mismo municipio, y la calle
  de la direccion comprobada contra la red de calles. Sirve para saber CUAL es
  cada estacion y cuales de las fichas de la app no tienen ninguna detras. NO DA
  COORDENADA OFICIAL: para eso hace falta el registro, que es el unico que trae
  el IDEESS. Todo lo que salga de aqui es provisional y lleva la etiqueta.

QUE HACE, Y QUE NO
  Clasifica cada ficha de la app y prepara las altas. NO TOCA index.html: deja
  dos ficheros para que Jerome decida. Los precios NO entran nunca en la app,
  son datos perecederos.
"""
import glob
import json
import os
import re
import subprocess
import sys
import unicodedata

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(RAIZ, 'tools'))
import municipio as M          # noqa: E402
import geofabrik_cerca as gf   # noqa: E402

DIR = os.path.join(RAIZ, 'datos', 'gasolineras')
CAJA = (27.95, 28.62, -16.98, -16.05)   # Tenerife: la provincia 38 trae 4 islas

# El rotulo del registro y el nombre de la app no se escriben igual. Y Cepsa se
# llama ahora MOEVE: si no se empareja, media isla sale como «marca distinta».
MARCA = {
    'cepsa': 'cepsa', 'moeve': 'cepsa',
    'repsol': 'repsol', 'campsa': 'repsol', 'petronor': 'repsol',
    'disa': 'disa', 'shell': 'shell', 'bp': 'bp',
    'petroprix': 'petroprix', 'tgas': 'tgas', 'pcan': 'pcan',
    'oceano': 'oceano', 'plenoil': 'plenoil', 'ballenoil': 'ballenoil',
}


def llano(s):
    s = unicodedata.normalize('NFD', (s or '').lower())
    return ''.join(c for c in s if unicodedata.category(c) != 'Mn')


def muni_llano(s):
    """El registro escribe el articulo al final: «Realejos (Los)». Comparado tal
       cual, salian 40 discrepancias de municipio que no lo eran -13 de Los
       Realejos, 10 de La Orotava...- y un control que canta 40 falsos no lo mira
       nadie. Se le da la vuelta antes de comparar."""
    t = llano(s).strip()
    m = re.match(r'^(.*?)\s*\((el|la|los|las)\)$', t)
    return ('%s %s' % (m.group(2), m.group(1))) if m else t


def marca_de(txt):
    t = llano(txt)
    for clave, canon in MARCA.items():
        if re.search(r'(^|[^a-z])' + clave + r'([^a-z]|$)', t):
            return canon
    return None


def campo(fila, *nombres):
    """El registro ha cambiado de nombres de campo con los anos. Se busca por
       nombre normalizado, no por la cadena exacta, y si no esta se dice."""
    idx = {llano(k).replace(' ', '').replace('.', ''): v for k, v in fila.items()}
    for n in nombres:
        v = idx.get(llano(n).replace(' ', '').replace('.', ''))
        if v not in (None, ''):
            return v
    return None


def numero(v):
    """«28,4567» -> 28.4567. Coma decimal, que es como lo manda el registro."""
    if v is None:
        return None
    try:
        return float(str(v).strip().replace(',', '.'))
    except ValueError:
        return None


def cargar_registro():
    # Lo baja el flujo de GitHub Actions .github/workflows/registro-gasolineras.yml,
    # porque desde este contenedor la API del MITECO da 000. Se guarda tal cual lo
    # manda el Ministerio, sin tocar.
    ficheros = ([os.path.join(RAIZ, 'registro', 'gasolineras-canarias.json')]
                if os.path.exists(os.path.join(RAIZ, 'registro', 'gasolineras-canarias.json'))
                else sorted(glob.glob(os.path.join(DIR, 'miteco_provincia38_*.json'))))
    if not ficheros:
        print('PARO: no encuentro el registro.')
        print('      Lanza el flujo «Registro gasolineras» en Actions, que lo baja')
        print('      a registro/gasolineras-canarias.json. Desde aqui la API da 000.')
        sys.exit(2)
    ruta = ficheros[-1]
    d = json.load(open(ruta, encoding='utf-8-sig'))   # el fichero puede traer BOM
    lista = None
    for k, v in (d.items() if isinstance(d, dict) else []):
        if isinstance(v, list) and v and isinstance(v[0], dict):
            lista = v
            break
    if lista is None and isinstance(d, list):
        lista = d
    if not lista:
        sys.exit('PARO: %s no trae ninguna lista de estaciones' % ruta)
    print('registro: %s · %s · %d estaciones' % (os.path.basename(ruta), d.get('Fecha'), len(lista)))

    out, fuera, sin_coord, no_publico = [], 0, 0, 0
    for f in lista:
        lat = numero(campo(f, 'Latitud'))
        lng = numero(campo(f, 'Longitud (WGS84)', 'Longitud'))
        if lat is None or lng is None:
            sin_coord += 1
            continue
        if not (CAJA[0] <= lat <= CAJA[1] and CAJA[2] <= lng <= CAJA[3]):
            fuera += 1        # La Palma, La Gomera, El Hierro
            continue
        venta = campo(f, 'Tipo Venta')
        if venta and llano(venta).strip() not in ('p', 'publico', 'publica'):
            no_publico += 1
            continue
        rot = campo(f, 'Rótulo', 'Rotulo') or ''
        out.append({
            'ideess': str(campo(f, 'IDEESS') or ''),
            'rotulo': rot,
            'marca': marca_de(rot),
            'direccion': campo(f, 'Dirección', 'Direccion') or '',
            'cp': str(campo(f, 'C.P.', 'CP') or ''),
            'localidad': campo(f, 'Localidad') or '',
            'municipio_registro': campo(f, 'Municipio') or '',
            'horario': campo(f, 'Horario') or '',
            'lat': lat, 'lng': lng,
            'municipio_poligono': M.de(lat, lng),
        })
    print('  en la caja de Tenerife: %d  ·  de otras islas: %d  ·  sin coordenada: %d'
          % (len(out), fuera, sin_coord))
    if no_publico:
        print('  descartadas por no ser de venta al publico: %d' % no_publico)
    discrepan = [e for e in out if e['municipio_poligono'] and
                 muni_llano(e['municipio_poligono']) != muni_llano(e['municipio_registro'])]
    print('  el municipio del registro y el del poligono discrepan en %d' % len(discrepan))
    return out, discrepan


def gasolineras_app():
    js = ("const{PLACES}=require('./tools/cargar');console.log(JSON.stringify("
          "PLACES.filter(p=>p.category==='gasolinera').map(p=>({id:p.id,name:p.name,"
          "lat:p.lat,lng:p.lng,ideess:p.ideess||null,address:p.address||'',"
          "cat:(p.cat&&p.cat.es)||''}))))")
    o = subprocess.run(['node', '-e', js], cwd=RAIZ, capture_output=True, text=True)
    if o.returncode:
        sys.exit(o.stderr.strip() or 'no puedo leer PLACES')
    return json.loads(o.stdout)


def calle_de(lat, lng, radio=150):
    """Las calles con nombre alrededor de un punto, de mas cerca a mas lejos."""
    import osm_cerca as o
    vs = o.vias((lat, lng), radio)
    return [(v[0], k[0]) for k, v in sorted(vs.items(), key=lambda x: x[1][0]) if k[0]]


def sin_registro():
    """Provisional: las capturas contra los surtidores del mapa del repo."""
    caps = json.load(open(os.path.join(DIR, 'capturas_google.json'),
                          encoding='utf-8'))['capturas']
    fuel = [e for e in gf.cargar() if 'fuel' in (e.get('fclass') or [])]
    for e in fuel:
        e['marca_osm'] = marca_de(e.get('name'))
        e['muni_pol'] = M.de(e['lat'], e['lng'])
    print('surtidores en el mapa: %d  ·  con marca reconocible: %d'
          % (len(fuel), sum(1 for e in fuel if e['marca_osm'])))
    print('capturas del lote 1: %d\n' % len(caps))

    out = {}
    for k in sorted(caps):
        c = caps[k]
        mi = marca_de(c.get('marca') or c.get('nombre_google'))
        muni = c.get('municipio_en_direccion')
        cand = [e for e in fuel if mi and e['marca_osm'] == mi]
        if muni:
            enmuni = [e for e in cand if e['muni_pol'] and
                      llano(e['muni_pol']).startswith(llano(muni)[:8])]
            if enmuni:
                cand = enmuni
        # la calle de la direccion, sin el numero ni el CP
        via = llano(re.split(r',', c.get('direccion_google') or '')[0])
        via = re.sub(r'^(c|c/|calle|av|avda|avenida|carr|ctra|carretera|cam|camino|urb|pl|plaza)\.?\s+',
                     '', via).strip()
        marcados = []
        for e in cand:
            calles = calle_de(e['lat'], e['lng'])
            casa = any(via and via[:9] in llano(n) for _, n in calles[:6])
            marcados.append((0 if casa else 1, e, calles[:2]))
        marcados.sort(key=lambda x: x[0])
        casan = [m for m in marcados if m[0] == 0]
        out[k] = {
            'captura': {'nombre': c.get('nombre_google'), 'marca': c.get('marca'),
                        'direccion': c.get('direccion_google'), 'cp': c.get('cp'),
                        'telefono': c.get('telefono_google')},
            'estado': ('una sola, y la calle casa' if len(casan) == 1 else
                       'varias con la calle' if len(casan) > 1 else
                       'ninguna casa por calle' if cand else 'la marca no esta en el mapa'),
            'candidatos': [{'nombre_osm': e.get('name'), 'lat': e['lat'], 'lng': e['lng'],
                            'municipio_poligono': e['muni_pol'], 'osm': e.get('osm'),
                            'calles': [n for _, n in cl], 'la_calle_casa': (n0 == 0)}
                           for n0, e, cl in marcados[:3]],
            'AVISO': 'PROVISIONAL. Coordenada de OSM, no del registro oficial. Sin IDEESS.',
        }
        m0 = marcados[0] if marcados else None
        print('  %-10s %-26s %-22s %s' % (
            k, (c.get('nombre_google') or '')[:26], out[k]['estado'],
            '' if not m0 else '%s · %s' % ((m0[1].get('name') or '?')[:18],
                                           (m0[2][0][1] if m0[2] else '?')[:26])))
    ruta = os.path.join(DIR, 'capturas_contra_el_mapa_PROVISIONAL.json')
    json.dump({'_': ['PROVISIONAL, mientras no llega el registro oficial del MITECO.',
                     'Las coordenadas son de OpenStreetMap, NO son oficiales y no traen IDEESS.',
                     'Sirve para saber CUAL es cada estacion, no para escribir coordenadas.'],
               'capturas': out}, open(ruta, 'w', encoding='utf-8'),
              ensure_ascii=False, indent=1)
    print('\nescrito %s' % ruta)
    return 0


def main():
    if '--sin-registro' in sys.argv:
        return sin_registro()
    reg, discrepan = cargar_registro()
    app = gasolineras_app()
    print('gasolineras en la app: %d\n' % len(app))

    ver = {}
    for p in app:
        mi = marca_de(p['name'])
        cerca = sorted(((gf.metros(p['lat'], p['lng'], e['lat'], e['lng']), e) for e in reg),
                       key=lambda x: x[0])
        dentro = [(d, e) for d, e in cerca if d <= 300]
        misma = [(d, e) for d, e in dentro if mi and e['marca'] == mi]
        if misma and misma[0][0] <= 150:
            estado, prueba = 'confirmada', misma[0]
        elif misma:
            estado, prueba = 'corregir_coordenada', misma[0]
        elif dentro:
            estado, prueba = 'marca_distinta', dentro[0]
        else:
            estado, prueba = 'no_existe_en_registro', (cerca[0] if cerca else (None, None))
        d, e = prueba
        ver[p['id']] = {
            'estado': estado,
            'app': {'name': p['name'], 'lat': p['lat'], 'lng': p['lng'],
                    'marca_segun_el_nombre': mi, 'address': p['address']},
            'registro_mas_cercano': (None if e is None else {
                'ideess': e['ideess'], 'rotulo': e['rotulo'], 'marca': e['marca'],
                'direccion': e['direccion'], 'municipio_registro': e['municipio_registro'],
                'municipio_poligono': e['municipio_poligono'], 'horario': e['horario'],
                'lat': e['lat'], 'lng': e['lng'], 'a_metros': round(d)}),
            'estaciones_a_300_m': len(dentro),
        }
        print('  %-22s %-22s %s' % (
            p['id'], estado,
            '' if e is None else '%s a %d m (%s)' % (e['rotulo'][:24], round(d), e['marca'])))

    # ── las capturas de Jerome, localizadas en el registro ───────────────────
    cap_path = os.path.join(DIR, 'capturas_google.json')
    caps = {}
    if os.path.exists(cap_path):
        caps = json.load(open(cap_path, encoding='utf-8'))['capturas']
    loc = {}
    for k, c in caps.items():
        mi = marca_de(c.get('marca') or c.get('nombre_google'))
        muni = muni_llano(c.get('municipio') or '')
        # NUNCA la marca sola: hay 49 DISA en la isla. La primera version cogia la
        # primera de la marca cuando el CP no casaba, y mando la «Shell Las
        # Dehesas» de Los Realejos a una SHELL de Adeje. Se acota siempre.
        por_cp = [e for e in reg if c.get('cp') and e['cp'] == c['cp']
                  and (not mi or e['marca'] == mi)]
        por_muni = [e for e in reg if muni and muni_llano(e['municipio_registro']) == muni
                    and (not mi or e['marca'] == mi)]
        cand = por_cp or por_muni
        # si siguen siendo varias, el rotulo del cotejo de Canarias7 desempata
        r7 = (c.get('registro_c7') or {}).get('rotulo')
        if len(cand) > 1 and r7:
            clave = [w for w in llano(r7).replace('.', ' ').split()
                     if len(w) >= 4 and (not mi or w != mi)]
            afinan = [e for e in cand if any(w in llano(e['rotulo']) for w in clave)]
            if len(afinan) == 1:
                cand = afinan
        loc[k] = {'captura': {kk: c.get(kk) for kk in
                              ('nombre_google', 'marca', 'direccion_google', 'cp', 'telefono_google')},
                  'candidatos_en_el_registro': [
                      {'ideess': e['ideess'], 'rotulo': e['rotulo'], 'direccion': e['direccion'],
                       'cp': e['cp'], 'municipio_poligono': e['municipio_poligono'],
                       'horario': e['horario'], 'lat': e['lat'], 'lng': e['lng']}
                      for e in cand[:5]],
                  'como': ('cp+marca' if por_cp else 'municipio+marca' if por_muni else None),
                  'estado': 'sin_registro' if not cand else
                            ('una' if len(cand) == 1 else 'varias: hay que elegir')}

    salida = {'_': ['Verificacion de las gasolineras contra el registro oficial del MITECO.',
                    'NADA DE ESTO ESTA APLICADO: index.html no se toca.',
                    'Los precios no entran en la app, son datos perecederos.'],
              'fichas_de_la_app': ver,
              'capturas_localizadas': loc,
              'municipio_registro_vs_poligono': [
                  {'ideess': e['ideess'], 'rotulo': e['rotulo'],
                   'registro': e['municipio_registro'], 'poligono': e['municipio_poligono']}
                  for e in discrepan]}
    p1 = os.path.join(DIR, 'gasolineras_verificacion.json')
    json.dump(salida, open(p1, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

    usados = {v['registro_mas_cercano']['ideess'] for v in ver.values()
              if v['estado'] in ('confirmada', 'corregir_coordenada') and v['registro_mas_cercano']}
    altas = {}
    for k, l in loc.items():
        if l['estado'] != 'una':          # ambigua o sin registro: NO se da de alta
            continue
        for c in l['candidatos_en_el_registro'][:1]:
            if c['ideess'] in usados:
                continue
            altas['gas-%s' % re.sub(r'[^a-z0-9]+', '-',
                                    llano((c['rotulo'] or '') + '-' + (c['direccion'] or ''))).strip('-')[:40]] = {
                'de_la_captura': k, 'ideess': c['ideess'], 'rotulo': c['rotulo'],
                'direccion': c['direccion'], 'municipio': c['municipio_poligono'],
                'horario': c['horario'], 'lat': c['lat'], 'lng': c['lng'],
                'telefono_de_la_captura': caps[k].get('telefono_google'),
                'aviso_telefono': caps[k].get('telefono_nota')}
    p2 = os.path.join(DIR, 'gasolineras_altas.json')
    json.dump({'_': ['Altas propuestas, SOLO de estaciones con registro oficial.',
                     'El telefono sale de la captura de Google, no del registro: solo con OK.'],
               'altas': altas}, open(p2, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

    print('\nresumen:')
    for est in ('confirmada', 'corregir_coordenada', 'marca_distinta', 'no_existe_en_registro'):
        print('  %-24s %d' % (est, sum(1 for v in ver.values() if v['estado'] == est)))
    print('  altas propuestas         %d' % len(altas))
    print('\nescritos %s\n         %s' % (p1, p2))
    return 0


if __name__ == '__main__':
    sys.exit(main())
