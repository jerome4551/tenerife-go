#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Elementos orbitales de la Estacion Espacial y los satelites brillantes, para
el panel «Cielo de Tenerife» (21 de octubre de 2026).

POR QUE EXISTE. La pregunta mas repetida de cualquier noche es «¿cuando pasa
la Estacion?», y hasta hoy la app mandaba a la aplicacion de la NASA. Los
pasos se pueden calcular en el movil (SGP4, vendor/satellite.js) si se tienen
los elementos orbitales (TLE) recientes: cambian cada dia por el rozamiento
con la atmosfera, asi que un robot de GitHub los baja a diario y los deja en
datos/satelites.json, que la app lee de su propio dominio (CelesTrak no manda
cabeceras CORS para una web cualquiera, y aunque las mandara, no es cosa de
pedirselos desde cada movil).

DE DONDE SALE. CelesTrak (T.S. Kelso), el servicio publico de elementos
orbitales del catalogo de la Fuerza Espacial de EE. UU.:
  https://celestrak.org/NORAD/elements/gp.php?CATNR=<numero>&FORMAT=tle
Tres objetos: la Estacion Espacial Internacional (25544), la estacion china
Tiangong (48274, el modulo Tianhe) y el telescopio Hubble (20580). Starlink
no: son trenes de dias que luego se dispersan, y dan mas quejas que alegrias.
CelesTrak pide no abusar: tres peticiones al dia.

COMO NO SE ENSENA NADA FALSO.
  · Cada TLE se comprueba: dos lineas de 69 caracteres, el numero de
    catalogo que toca, y la suma de control de cada linea (modulo 10). Una
    linea mal copiada no entra.
  · Si la descarga falla o algo no cuadra, NO se escribe nada: el fichero se
    queda con sus ultimos elementos buenos y su fecha, y la app, al ver la
    epoca vieja (mas de 7 dias), deja de ensenar pasos y dice por que.
  · Nunca se sustituye un elemento por otro de epoca anterior.
  · Si CelesTrak devuelve los mismos elementos que ya hay, no se reescribe
    el fichero (y el robot no deja un commit vacio).
  · La app calcula los pasos para Izaña con esos elementos; aqui no se
    calcula ni se inventa ningun paso.

Uso:
  python3 tools/satelites_traer.py                          baja y escribe si toca
  python3 tools/satelites_traer.py --tle FICHERO [--ahora 2026-10-21T12:00:00Z]
                                                            sin red: lee un fichero con las lineas (pruebas)
  python3 tools/satelites_traer.py --salida OTRO.json       escribe en otro sitio
"""
import argparse
import datetime as dt
import json
import os
import sys
import time
import urllib.request

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SALIDA = os.path.join(RAIZ, 'datos', 'satelites.json')
FUENTE = 'https://celestrak.org/NORAD/elements/gp.php?CATNR={n}&FORMAT=tle'
UA = 'TenerifeGo/1.0 (+https://jerome4551.github.io/tenerife-go/)'
# numero de catalogo, clave en la app, nombre con el que lo llama CelesTrak
OBJETOS = [(25544, 'iss', 'ISS (ZARYA)'), (48274, 'tiangong', 'CSS (TIANHE)'), (20580, 'hubble', 'HST')]
MAX_DIAS = 7                    # la app no ensena pasos con elementos mas viejos


def suma_control(linea):
    s = 0
    for c in linea[:68]:
        if c.isdigit():
            s += int(c)
        elif c == '-':
            s += 1
    return s % 10


def epoca(l1):
    """La epoca de la linea 1 (año de dos cifras y dia del año con decimales), en UTC."""
    aa = int(l1[18:20])
    anio = 2000 + aa if aa < 57 else 1900 + aa
    dias = float(l1[20:32])
    return dt.datetime(anio, 1, 1, tzinfo=dt.timezone.utc) + dt.timedelta(days=dias - 1)


def comprobar(num, l1, l2):
    if len(l1) != 69 or len(l2) != 69:
        raise ValueError(f'{num}: lineas de {len(l1)} y {len(l2)} caracteres')
    if l1[0] != '1' or l2[0] != '2':
        raise ValueError(f'{num}: no empiezan por 1 y 2')
    if l1[2:7].strip() != str(num) or l2[2:7].strip() != str(num):
        raise ValueError(f'{num}: el numero de catalogo no es ese ({l1[2:7]} / {l2[2:7]})')
    for l in (l1, l2):
        if not l[68].isdigit() or suma_control(l) != int(l[68]):
            raise ValueError(f'{num}: suma de control mal en «{l}»')
    return epoca(l1)


def partir(texto):
    """Lineas 1 y 2 de cada objeto que haya en un texto TLE (con o sin linea de nombre)."""
    lineas = [l.rstrip('\r\n') for l in texto.splitlines() if l.strip()]
    out = {}
    for i, l in enumerate(lineas):
        if l.startswith('1 ') and i + 1 < len(lineas) and lineas[i + 1].startswith('2 '):
            num = int(l[2:7])
            nombre = lineas[i - 1].strip() if i > 0 and not lineas[i - 1].startswith(('1 ', '2 ')) else ''
            out[num] = (nombre, l, lineas[i + 1])
    return out


def bajar(num):
    req = urllib.request.Request(FUENTE.format(n=num), headers={'User-Agent': UA})
    for intento in range(3):
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                return r.read().decode('utf-8', 'replace')
        except Exception as e:                      # noqa: BLE001
            if intento == 2:
                raise
            time.sleep(15 * (intento + 1))


def leer_actual(ruta):
    try:
        with open(ruta, encoding='utf-8') as f:
            return json.load(f)
    except Exception:                                # noqa: BLE001
        return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--tle', help='fichero con las lineas (sin red)')
    ap.add_argument('--ahora', help='instante UTC para las pruebas (2026-10-21T12:00:00Z)')
    ap.add_argument('--salida', default=SALIDA)
    ap.add_argument('--via', default='', help='por donde llegaron las lineas, si no fue CelesTrak directamente')
    a = ap.parse_args()
    ahora = dt.datetime.strptime(a.ahora, '%Y-%m-%dT%H:%M:%SZ').replace(tzinfo=dt.timezone.utc) if a.ahora else dt.datetime.now(dt.timezone.utc)

    if a.tle:
        with open(a.tle, encoding='utf-8') as f:
            trozos = partir(f.read())
    else:
        trozos = {}
        for num, _, _ in OBJETOS:
            trozos.update(partir(bajar(num)))
    actual = leer_actual(a.salida)
    viejos = {s['id']: s for s in (actual or {}).get('sat', [])}

    sat = []
    for num, clave, nombre_ct in OBJETOS:
        if num not in trozos:
            print(f'falta el {num} ({clave}): no se escribe nada', file=sys.stderr)
            sys.exit(1)
        nombre, l1, l2 = trozos[num]
        ep = comprobar(num, l1, l2)
        if ep > ahora + dt.timedelta(days=1):
            print(f'{num}: epoca en el futuro ({ep:%Y-%m-%d}): no se escribe nada', file=sys.stderr)
            sys.exit(1)
        if num in viejos and viejos[num].get('epoca', '') > ep.strftime('%Y-%m-%dT%H:%M:%SZ'):
            print(f'{num}: los elementos nuevos son mas viejos que los que hay ({viejos[num]["epoca"]}); se quedan los de antes', file=sys.stderr)
            s = viejos[num]
        else:
            s = {'id': num, 'clave': clave, 'nombre': nombre or nombre_ct, 'l1': l1, 'l2': l2, 'epoca': ep.strftime('%Y-%m-%dT%H:%M:%SZ')}
        sat.append(s)

    if actual and all(viejos.get(s['id'], {}).get('l1') == s['l1'] and viejos.get(s['id'], {}).get('l2') == s['l2'] for s in sat):
        print('sin elementos nuevos: ' + ', '.join(f"{s['clave']} (epoca {s['epoca'][:16]})" for s in sat) + '; no se toca ' + a.salida)
        return

    salida = {
        'fuente': 'CelesTrak (celestrak.org/NORAD/elements/gp.php, FORMAT=tle); tools/satelites_traer.py',
        'obtenido': ahora.strftime('%Y-%m-%dT%H:%M:%SZ'),
        'objetos': 'Estacion Espacial Internacional (25544), estacion china Tiangong (48274, Tianhe) y telescopio Hubble (20580)',
        'maxDias': MAX_DIAS,
        'sat': sat,
    }
    if a.via:
        salida['via'] = a.via
    os.makedirs(os.path.dirname(a.salida), exist_ok=True)
    with open(a.salida, 'w', encoding='utf-8') as f:
        json.dump(salida, f, ensure_ascii=False, indent=1)
        f.write('\n')
    print('escrito ' + a.salida + ': ' + ', '.join(f"{s['clave']} (epoca {s['epoca'][:10]})" for s in sat))


if __name__ == '__main__':
    main()
