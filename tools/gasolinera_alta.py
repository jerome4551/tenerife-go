#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
gasolinera_alta.py — mete en la app las gasolineras de UN municipio.

    python3 tools/gasolinera_alta.py Garachico --ver     que haria, sin tocar nada
    python3 tools/gasolinera_alta.py Garachico           lo hace
    python3 tools/gasolinera_alta.py Garachico --rehacer las que YA estan, las
                                    vuelve a escribir desde el registro (para eso
                                    se guarda el IDEESS en cada ficha)

QUE TOCA, Y EN ESTE ORDEN
  index.html                        la ficha, con el castellano
  idiomas/{en,fr,de,it,nl,zh,zht,bg}.json   una linea por ficha
  idiomas/pl-lugares/10-gasolineras.json    el polaco, que es FUENTE: el
                                            idiomas/pl.json se monta despues con
                                            tools/lugares_idioma.js montar pl
  idiomas/etiquetas-sin-traducir.json       las etiquetas nuevas, declaradas
  datos/gasolineras/sesiones.json           la sesion, a «hecha»

LO QUE NO HACE
  · No inventa nada: todo sale de tools/gasolinera_ficha.py, que lee el registro
    oficial. Los precios NO entran: caducan en 24 h.
  · No pisa nada sin --rehacer. Si un id ya esta en la app, lo dice y no lo
    toca. Con --rehacer reescribe SOLO bloques que el mismo genero: comprueba
    que el bloque viejo lleva el mismo ideess antes de cambiarlo.
  · No deja a medias: si falla a mitad, deja los ficheros como estaban.
  · No monta el polaco ni pasa la auditoria: eso se hace a mano despues, para
    poder leer lo que sale.
"""
import json
import os
import re
import shutil
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(RAIZ, 'tools'))
import gasolinera_ficha as F   # noqa: E402

OTROS = ['en', 'fr', 'de', 'it', 'nl', 'zh', 'zht', 'bg']
PL_FUENTE = 'idiomas/pl-lugares/10-gasolineras.json'
ANCLA = '  { id:"gas-tf5-los-realejos"'   # las gasolineras van juntas, detras de esta


def una_linea(d):
    return '{\n' + ',\n'.join(' %s: %s' % (json.dumps(k, ensure_ascii=False),
                                           json.dumps(v, ensure_ascii=False))
                              for k, v in d.items()) + '\n}\n'


def js(s):
    return '"%s"' % s.replace('\\', '\\\\').replace('"', '\\"')


def bloque(f):
    """La ficha tal como se escribe en index.html, al estilo de la casa."""
    return ('  { id:%s, category:"gasolinera", name:%s, emoji:"⛽", color:"#dc2626"'
            ', lat:%s, lng:%s, ideess:%s,\n'
            '    hours:{ es:%s },\n'
            '    desc:{ es:%s },\n'
            '    cat:{ es:%s },\n'
            '    tags:[%s] },\n') % (
        js(f['id']), js(f['name']), f['lat'], f['lng'], js(f['ideess']),
        js(f['idiomas']['es']['hours']), js(f['idiomas']['es']['desc']),
        js(f['idiomas']['es']['cat']), ','.join(js(t) for t in f['tags']))


def main():
    a = [x for x in sys.argv[1:] if not x.startswith('--')]
    ver = '--ver' in sys.argv
    if not a:
        sys.exit(__doc__.strip())
    muni = ' '.join(a)
    fichas = [f for f in F.cargar() if F.llano(f['municipio']) == F.llano(muni)]
    if not fichas:
        sys.exit('no hay ninguna estacion del registro en «%s»' % muni)

    src = open(os.path.join(RAIZ, 'index.html'), encoding='utf-8').read()
    rehacer = '--rehacer' in sys.argv
    ya = [f['id'] for f in fichas if '{ id:"%s"' % f['id'] in src]
    if ya and not rehacer:
        print('YA ESTAN en index.html, no las toco: %s' % ', '.join(ya))
        fichas = [f for f in fichas if f['id'] not in ya]
    if not fichas:
        return 0
    # Las que ya estan se reescriben EN SU SITIO, y solo si el bloque viejo es
    # uno de los nuestros: mismo id y mismo ideess. Si no, PARA.
    for f in [f for f in fichas if f['id'] in ya]:
        i = src.index('  { id:"%s"' % f['id'])
        j = src.index('\n', src.index('\n    tags:[', i) + 1) + 1
        viejo = src[i:j]
        if 'ideess:"%s"' % f['ideess'] not in viejo or viejo.count('{ id:') != 1:
            sys.exit('PARO: el bloque de %s no es el que genero esta herramienta.' % f['id'])
        if viejo != bloque(f):
            print('   rehecha  %-34s %s' % (f['id'], f['name']))
        src = src[:i] + bloque(f) + src[j:]
    nuevas = [f for f in fichas if f['id'] not in ya]
    print('%s: %d alta(s) nueva(s), %d rehecha(s)' % (muni, len(nuevas), len(fichas) - len(nuevas)))
    for f in nuevas:
        print('   %-24s %s' % (f['ideess'], f['name']))

    if ANCLA not in src:
        sys.exit('PARO: no encuentro el ancla «%s» en index.html. No improviso.' % ANCLA)
    corte = src.index('\n', src.index(ANCLA))
    # El ancla es una ficha de varias lineas: se busca donde acaba de verdad.
    fin = src.index('\n', src.index('tags:', corte))
    nuevo = src[:fin + 1] + ''.join(bloque(f) for f in nuevas) + src[fin + 1:]

    etq = json.load(open(os.path.join(RAIZ, 'idiomas/etiquetas-sin-traducir.json'),
                         encoding='utf-8'))
    clave_sitio = next(k for k in etq if 'nombre de sitio' in k)
    faltan = sorted({t for f in fichas for t in f['tags'][1:]}
                    - {x for v in etq.values() for x in v})
    if ver:
        print('\n-- index.html, lo que se mete:\n%s' % ''.join(bloque(f) for f in nuevas))
        print('-- etiquetas nuevas a declarar: %s' % (', '.join(faltan) or 'ninguna'))
        for L in OTROS + ['pl']:
            f = fichas[0]
            print('-- %-3s %s' % (L, json.dumps(f['idiomas'][L], ensure_ascii=False)))
        return 0

    copias = {}
    try:
        for rel, texto in [('index.html', nuevo)]:
            p = os.path.join(RAIZ, rel)
            copias[p] = p + '.antes'
            shutil.copy2(p, copias[p])
            open(p, 'w', encoding='utf-8').write(texto)
        for L in OTROS:
            p = os.path.join(RAIZ, 'idiomas/%s.json' % L)
            copias[p] = p + '.antes'
            shutil.copy2(p, copias[p])
            d = json.load(open(p, encoding='utf-8'))
            for f in fichas:
                d[f['id']] = f['idiomas'][L]
            open(p, 'w', encoding='utf-8').write(una_linea(d))
        p = os.path.join(RAIZ, PL_FUENTE)
        d = json.load(open(p, encoding='utf-8')) if os.path.exists(p) else {}
        if os.path.exists(p):
            copias[p] = p + '.antes'
            shutil.copy2(p, copias[p])
        for f in fichas:
            d[f['id']] = f['idiomas']['pl']
        open(p, 'w', encoding='utf-8').write(json.dumps(d, ensure_ascii=False, indent=1) + '\n')
        if faltan:
            p = os.path.join(RAIZ, 'idiomas/etiquetas-sin-traducir.json')
            copias[p] = p + '.antes'
            shutil.copy2(p, copias[p])
            etq[clave_sitio] = sorted(set(etq[clave_sitio]) | set(faltan))
            open(p, 'w', encoding='utf-8').write(
                json.dumps(etq, ensure_ascii=False, indent=1) + '\n')
    except Exception as e:
        for p, c in copias.items():
            shutil.copy2(c, p)
            os.remove(c)
        sys.exit('PARO y lo dejo como estaba: %s' % e)
    for c in copias.values():
        os.remove(c)
    print('\nhecho. Ahora, a mano y mirando lo que sale:')
    print('   node tools/lugares_idioma.js montar pl')
    print('   bash tools/auditar.sh')
    print('y cuando este en verde, marcar la sesion de %s como hecha.' % muni)
    return 0


if __name__ == '__main__':
    sys.exit(main())
