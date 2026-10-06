#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
auditar_precios_gasolineras.py — el fichero de precios lo escribe un robot dos
veces al dia (.github/workflows/precios-gasolineras.yml) y nadie lo mira antes
de que llegue a la app. Esto lo mira:

  1. Que tools/precios_gasolineras.py sigue funcionando: lo pasa, sin red, por
     el registro del repo con la fecha cambiada a hoy, y comprueba lo que sale.
  2. Si ya hay datos/precios-gasolineras.json: que cada id es una gasolinera de
     la app, que cada municipio lleva las que dice la regla de Jerome (menos de
     3, ninguna; 3-7, una; 8-14, dos; 15 o mas, tres; los empates, todos), que
     van de mas barata a mas cara y que ningun precio es absurdo.
  3. Que index.html no lleva ningun precio de gasolina (LEEME: son perecederos).

Sale con 1 si algo falla. No escribe nada en el repo.
"""
import datetime as dt
import json
import os
import re
import subprocess
import sys
import tempfile
from zoneinfo import ZoneInfo

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(RAIZ, 'tools'))
import precios_gasolineras as P   # noqa: E402

fallos = []


def mal(t):
    fallos.append(t)
    print('  FALLO: ' + t)


def revisar(d, fichas, nombre):
    porid = {f['id']: f for f in fichas}
    import municipio as M
    cuenta = {}
    for f in fichas:
        cuenta.setdefault(M.de(f['lat'], f['lng']), []).append(f)
    if not re.match(r'^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$', d.get('fecha') or ''):
        mal('%s: fecha rara %r' % (nombre, d.get('fecha')))
    for mu, l in cuenta.items():
        k = P.cuantas(len(l))
        m = d['municipios'].get(mu)
        if not k:
            if m:
                mal('%s: %s tiene %d gasolineras y no deberia salir' % (nombre, mu, len(l)))
            continue
        if not m:
            mal('%s: falta %s (%d gasolineras)' % (nombre, mu, len(l)))
            continue
        if m['cuantas'] != k or m['gasolineras'] != len(l):
            mal('%s: %s dice %s de %s; la regla da %d de %d' % (nombre, mu, m['cuantas'], m['gasolineras'], k, len(l)))
        for comb in ('g95', 'diesel'):
            x = m.get(comb) or []
            ps = [y['precio'] for y in x]
            if ps != sorted(ps):
                mal('%s: %s %s no va de mas barata a mas cara' % (nombre, mu, comb))
            if len(x) > k and len(set(ps[k - 1:])) != 1:      # de mas, solo si empatan con la ultima
                mal('%s: %s %s lleva %d con la regla en %d y sin empate' % (nombre, mu, comb, len(x), k))
            for y in x:
                f = porid.get(y['id'])
                if not f:
                    mal('%s: %s no es una gasolinera de la app' % (nombre, y['id']))
                elif f['ideess'] != y['ideess'] or M.de(f['lat'], f['lng']) != mu:
                    mal('%s: %s no es de %s o no es la estacion %s' % (nombre, y['id'], mu, y['ideess']))
                if not 0.5 < y['precio'] < 3.5:
                    mal('%s: %s a %s el litro' % (nombre, y['id'], y['precio']))


def main():
    print('=== precios de las gasolineras ===')
    fichas = P.fichas_de_la_app()
    # 1 · el guion, sin red, con el registro del repo puesto a hoy
    d = json.load(open(os.path.join(RAIZ, 'registro', 'gasolineras-canarias.json'), encoding='utf-8-sig'))
    d['Fecha'] = dt.datetime.now(ZoneInfo('Europe/Madrid')).strftime('%d/%m/%Y %H:%M:%S')
    with tempfile.TemporaryDirectory() as tmp:
        f = os.path.join(tmp, 'registro.json')
        json.dump(d, open(f, 'w', encoding='utf-8'), ensure_ascii=False)
        s = os.path.join(tmp, 'precios.json')
        o = subprocess.run([sys.executable, os.path.join(RAIZ, 'tools', 'precios_gasolineras.py'),
                            '--registro', f, '--forzar', '--salida', s], capture_output=True, text=True)
        if o.returncode:
            mal('el guion no funciona: %s' % (o.stderr or o.stdout).strip())
        else:
            prueba = json.load(open(s, encoding='utf-8'))
            revisar(prueba, fichas, 'prueba')
            print('  el guion, con el registro del repo a hoy: %d municipios' % len(prueba['municipios']))
    # 2 · el fichero de verdad, si ya existe
    real = os.path.join(RAIZ, 'datos', 'precios-gasolineras.json')
    if os.path.exists(real):
        r = json.load(open(real, encoding='utf-8'))
        revisar(r, fichas, 'datos/precios-gasolineras.json')
        print('  datos/precios-gasolineras.json: precios del %s (franja %s), %d municipios'
              % (r.get('fecha_ministerio'), r.get('franja'), len(r.get('municipios', {}))))
    else:
        print('  datos/precios-gasolineras.json: aun no lo ha escrito el flujo (la app lo dice y no ensena precios)')
    # 3 · ningun precio dentro de index.html
    src = open(os.path.join(RAIZ, 'index.html'), encoding='utf-8').read()
    for m in re.finditer(r'\{ id:"gas-[^\n]*', src):
        if re.search(r'€|\b1[,.]\d{3}\b', m.group(0)):
            mal('index.html lleva un precio en %s' % m.group(0)[:60])
    print('  fallos ...................................... %d' % len(fallos))
    return 1 if fallos else 0


if __name__ == '__main__':
    sys.exit(main())
