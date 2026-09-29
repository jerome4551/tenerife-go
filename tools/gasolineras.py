#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
gasolineras.py — las gasolineras de la app contra el REGISTRO OFICIAL.

    python3 tools/gasolineras.py

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
    ficheros = sorted(glob.glob(os.path.join(DIR, 'miteco_provincia38_*.json')))
    if not ficheros:
        print('PARO: no encuentro datos/gasolineras/miteco_provincia38_*.json')
        print('      Desde este entorno la descarga esta bloqueada (000).')
        print('      Que Jerome la baje del navegador y la suba ahi.')
        sys.exit(2)
    ruta = ficheros[-1]
    d = json.load(open(ruta, encoding='utf-8'))
    lista = None
    for k, v in (d.items() if isinstance(d, dict) else []):
        if isinstance(v, list) and v and isinstance(v[0], dict):
            lista = v
            break
    if lista is None and isinstance(d, list):
        lista = d
    if not lista:
        sys.exit('PARO: %s no trae ninguna lista de estaciones' % ruta)
    print('registro: %s · %d estaciones en la provincia 38' % (os.path.basename(ruta), len(lista)))

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
                 llano(e['municipio_poligono']) != llano(e['municipio_registro'])]
    print('  el municipio del registro y el del poligono discrepan en %d' % len(discrepan))
    return out, discrepan


def gasolineras_app():
    js = ("const{PLACES}=require('./tools/cargar');console.log(JSON.stringify("
          "PLACES.filter(p=>p.category==='gasolinera').map(p=>({id:p.id,name:p.name,"
          "lat:p.lat,lng:p.lng,address:p.address||'',cat:(p.cat&&p.cat.es)||''}))))")
    o = subprocess.run(['node', '-e', js], cwd=RAIZ, capture_output=True, text=True)
    if o.returncode:
        sys.exit(o.stderr.strip() or 'no puedo leer PLACES')
    return json.loads(o.stdout)


def main():
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
    cap_path = os.path.join(DIR, 'capturas_google_lote1.json')
    caps = {}
    if os.path.exists(cap_path):
        caps = json.load(open(cap_path, encoding='utf-8'))['capturas']
    loc = {}
    for k, c in caps.items():
        mi = marca_de(c.get('marca') or c.get('nombre_google'))
        cand = [e for e in reg
                if (not c.get('cp') or e['cp'] == c['cp']) and (not mi or e['marca'] == mi)]
        if not cand:
            cand = [e for e in reg if mi and e['marca'] == mi]
        loc[k] = {'captura': {kk: c.get(kk) for kk in
                              ('nombre_google', 'marca', 'direccion_google', 'cp', 'telefono_google')},
                  'candidatos_en_el_registro': [
                      {'ideess': e['ideess'], 'rotulo': e['rotulo'], 'direccion': e['direccion'],
                       'cp': e['cp'], 'municipio_poligono': e['municipio_poligono'],
                       'horario': e['horario'], 'lat': e['lat'], 'lng': e['lng']}
                      for e in cand[:5]],
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
