#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
precios_gasolineras.py — las gasolineras más baratas de CADA MUNICIPIO, desde
el registro oficial del Ministerio, para datos/precios-gasolineras.json.

    python3 tools/precios_gasolineras.py --toca          ¿toca bajar precios? (si / no)
    python3 tools/precios_gasolineras.py --registro F    escribe el fichero de precios
                                                         desde la descarga F
    python3 tools/precios_gasolineras.py --registro F --forzar   aunque no toque

LO QUE PIDIO JEROME (6 de octubre)
  No las 10 más baratas de la isla: las más baratas de cada municipio.
    · menos de 3 gasolineras ...... ninguna
    · de 3 a 7 .................... la más barata
    · de 8 a 14 ................... las 2 más baratas
    · de 15 en adelante ........... las 3 más baratas
  (dijo «de 3 a 8», «de 8 a 15» y «de 15 hasta...»: el 8 y el 15 se pisan y
  cuentan en el tramo de arriba). Gasolina 95 y diésel, cada uno por su lado.
  Los empates salen todos: si dos tienen el mismo precio que la última que
  entra, entran las dos. Dos veces al día, a las 7:00 y a las 15:00 de Canarias.

POR QUE «--toca» Y NO UN CRON A LAS 7:00
  GitHub no lanza los flujos programados a su hora: en este repo salen entre 4
  y 8 horas tarde (medido con la notificación diaria). El flujo pasa cada hora,
  y este guion mira la hora REAL de Canarias: el primer paso después de las
  7:00 baja los precios de la franja de las 7:00, el primero después de las
  15:00, los de las 15:00, y los demás no hacen nada.

LO QUE NO HACE
  · No escribe ni un precio en index.html: el LEEME de las gasolineras lo
    prohíbe («son datos perecederos»). Van en un fichero aparte, con la fecha
    del Ministerio dentro, y la app no los enseña si tienen más de 2 días.
  · No toca registro/gasolineras-canarias.json, que es el registro revisado
    del que salen las fichas: un horario nuevo o una estación nueva siguen
    entrando a mano, con revisión.
  · Si la descarga no es buena (respuesta rara, fecha vieja, pocas
    estaciones), sale con error y no escribe nada: se queda el fichero anterior.
"""
import datetime as dt
import json
import os
import subprocess
import sys
from zoneinfo import ZoneInfo

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(RAIZ, 'tools'))
SALIDA = os.path.join(RAIZ, 'datos', 'precios-gasolineras.json')
CANARIAS = ZoneInfo('Atlantic/Canary')
MADRID = ZoneInfo('Europe/Madrid')     # la «Fecha» del Ministerio va en hora peninsular
FRANJAS = (7, 15)
COMBUSTIBLES = {'g95': 'Precio Gasolina 95 E5', 'diesel': 'Precio Gasoleo A'}


def cuantas(n):
    """Cuántas salen en un municipio con n gasolineras (la regla de Jerome)."""
    return 0 if n < 3 else 1 if n < 8 else 2 if n < 15 else 3


def franja(ahora=None):
    """La última franja (7:00 o 15:00 de Canarias) que ya ha empezado."""
    ahora = (ahora or dt.datetime.now(CANARIAS)).astimezone(CANARIAS)
    pasadas = [h for h in FRANJAS if ahora.hour >= h]
    if pasadas:
        return '%s %02d:00' % (ahora.date().isoformat(), max(pasadas))
    return '%s %02d:00' % ((ahora.date() - dt.timedelta(days=1)).isoformat(), max(FRANJAS))


def toca():
    try:
        hecha = json.load(open(SALIDA, encoding='utf-8')).get('franja')
    except (OSError, ValueError):
        hecha = None
    return hecha != franja()


def precio(s):
    try:
        v = float(str(s).replace(',', '.'))
    except ValueError:
        return None
    return v if 0.5 < v < 3.5 else None      # un euro el litro no baja de 0,5 ni pasa de 3,5


def fichas_de_la_app():
    js = ("const{PLACES}=require('./tools/cargar');console.log(JSON.stringify(PLACES.filter("
          "p=>p.category==='gasolinera'&&p.ideess).map(p=>({id:p.id,ideess:String(p.ideess),lat:p.lat,lng:p.lng}))))")
    o = subprocess.run(['node', '-e', js], cwd=RAIZ, capture_output=True, text=True)
    if o.returncode:
        sys.exit('PARO: no puedo leer las fichas de la app: %s' % o.stderr.strip())
    return json.loads(o.stdout)


def construir(descarga):
    d = json.load(open(descarga, encoding='utf-8-sig'))
    if str(d.get('ResultadoConsulta', '')).strip().upper() != 'OK':
        sys.exit('PARO: el Ministerio no responde OK (%r)' % d.get('ResultadoConsulta'))
    lista = d.get('ListaEESSPrecio') or []
    try:
        fecha = dt.datetime.strptime(d['Fecha'].strip(), '%d/%m/%Y %H:%M:%S').replace(tzinfo=MADRID)
    except (KeyError, ValueError):
        sys.exit('PARO: la descarga no trae una fecha que se pueda leer (%r)' % d.get('Fecha'))
    ahora = dt.datetime.now(dt.timezone.utc)
    if ahora - fecha > dt.timedelta(hours=24) or fecha - ahora > dt.timedelta(hours=1):
        sys.exit('PARO: los precios del Ministerio son del %s: no son de hoy' % d['Fecha'])
    reg = {str(e.get('IDEESS')): e for e in lista}

    import municipio as M
    fichas = fichas_de_la_app()
    porm = {}
    for f in fichas:
        porm.setdefault(M.de(f['lat'], f['lng']), []).append(f)
    if None in porm:
        sys.exit('PARO: %d ficha(s) sin municipio' % len(porm[None]))
    con_precio = sum(1 for f in fichas if f['ideess'] in reg)
    if con_precio < 0.8 * len(fichas):
        sys.exit('PARO: solo %d de %d gasolineras de la app vienen en la descarga' % (con_precio, len(fichas)))

    municipios = {}
    for mu in sorted(porm):
        l = porm[mu]
        k = cuantas(len(l))
        if not k:
            continue
        m = {'gasolineras': len(l), 'cuantas': k}
        for clave, campo in COMBUSTIBLES.items():
            c = sorted(((precio(reg[f['ideess']].get(campo)), f) for f in l if f['ideess'] in reg),
                       key=lambda t: (t[0] is None, t[0] or 0, t[1]['id']))
            c = [(p, f) for p, f in c if p is not None]
            if not c:
                m[clave] = []
                continue
            corte = c[min(k, len(c)) - 1][0]           # el precio de la última que entra
            m[clave] = [{'id': f['id'], 'ideess': f['ideess'], 'precio': round(p, 3)}
                        for p, f in c if p <= corte]   # los empates, todos
        municipios[mu] = m
    return {
        '_': ['Lo escribe .github/workflows/precios-gasolineras.yml con tools/precios_gasolineras.py, '
              'dos veces al dia (7:00 y 15:00 de Canarias). No se edita a mano.',
              'Regla de Jerome: menos de 3 gasolineras, ninguna; de 3 a 7, la mas barata; de 8 a 14, '
              'las 2; de 15 en adelante, las 3. Gasolina 95 y diesel por separado; los empates, todos.',
              'La app no ensena estos precios si «fecha» tiene mas de 2 dias.'],
        'fuente': 'Ministerio para la Transicion Ecologica y el Reto Demografico, Geoportal de Gasolineras',
        'fecha': fecha.astimezone(dt.timezone.utc).isoformat().replace('+00:00', 'Z'),
        'fecha_ministerio': d['Fecha'].strip(),
        'franja': franja(),
        'municipios': municipios,
    }


def main():
    a = sys.argv[1:]
    if '--toca' in a:
        print('si' if toca() else 'no')
        return 0
    if '--registro' not in a:
        sys.exit(__doc__.strip())
    if not toca() and '--forzar' not in a:
        print('Ya estan los precios de la franja %s: no toca.' % franja())
        return 0
    out = construir(a[a.index('--registro') + 1])
    salida = a[a.index('--salida') + 1] if '--salida' in a else SALIDA
    with open(salida, 'w', encoding='utf-8') as fh:
        fh.write(json.dumps(out, ensure_ascii=False, indent=1, sort_keys=False) + '\n')
    n = sum(len(m['g95']) + len(m['diesel']) for m in out['municipios'].values())
    print('precios del Ministerio del %s · franja %s · %d municipios · %d lineas de precio -> %s'
          % (out['fecha_ministerio'], out['franja'], len(out['municipios']), n, os.path.relpath(salida, RAIZ)))
    return 0


if __name__ == '__main__':
    sys.exit(main())
