#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Convierte los bloques de la base de conocimiento en un fichero por idioma.

Entrada : faq/fuente/*.json             los bloques tal y como se redactaron
          faq/fuente/bg/*.json          el suplemento en bulgaro, por id
          faq/fuente/intenciones/*.json el vocabulario de intencion de cada
                                        idioma: «donde esta», «que hacer»,
                                        «cerca de mi», «cuantos lugares»

Salida  : faq/<idioma>.json  lo que descarga el movil, solo su idioma
          faq/indice.json    cat/volatil/bloque; solo lo leen los controles

El bulgaro va aparte a proposito. Los bloques llegan escritos de una pieza
y se vuelven a mandar corregidos; si el bulgaro estuviera dentro se perderia
en cada reenvio y el diff no dejaria ver que cambio. Asi el bloque original
se queda como llego y el suplemento se funde al generar.

No inventa nada: si un idioma le falta a una entrada, se planta.
"""
import json, glob, os, sys, collections

RAIZ   = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FUENTE = os.path.join(RAIZ, 'faq', 'fuente')
DESTINO= os.path.join(RAIZ, 'faq')

def main():
    ficheros = sorted(glob.glob(os.path.join(FUENTE, '*.json')))
    if not ficheros:
        print('No hay bloques en faq/fuente/'); return 1

    entradas, indice, idiomas = [], {}, None
    for f in ficheros:
        d = json.load(open(f, encoding='utf-8'))
        meta = d['meta']
        langs = list(meta['idiomas'])
        if idiomas is None: idiomas = langs
        elif idiomas != langs:
            print('Los bloques no declaran los mismos idiomas:', idiomas, 'vs', langs); return 1
        if meta['entradas'] != len(d['entradas']):
            print(f'{os.path.basename(f)}: meta dice {meta["entradas"]} entradas y hay {len(d["entradas"])}'); return 1

        # suplemento en bulgaro: mismo nombre de bloque, dentro de fuente/bg/
        corto = os.path.basename(f).replace('faq-kb-bloque-', '')
        sup_r = os.path.join(FUENTE, 'bg', corto)
        if not os.path.exists(sup_r):
            print(f'falta el bulgaro de {corto} en faq/fuente/bg/'); return 1
        sup = json.load(open(sup_r, encoding='utf-8'))
        sobran = set(sup) - {e['id'] for e in d['entradas']}
        if sobran:
            print(f'{corto}: el bulgaro trae ids que el bloque no tiene: {sorted(sobran)}'); return 1

        for e in d['entradas']:
            b = sup.get(e['id'])
            if not b:
                print(f'falta el bulgaro de {e["id"]}'); return 1
            e['label']['bg'], e['keys']['bg'], e['a']['bg'] = b['l'], b['k'], b['a']
            entradas.append(e)
            indice[e['id']] = {'cat': e['cat'], 'volatil': bool(e['volatil']),
                               'bloque': meta['bloque'], 'version': meta['version']}

    idiomas = idiomas + ['bg']

    # ── controles antes de escribir nada ──────────────────────────────
    ids = [e['id'] for e in entradas]
    rep = [i for i, c in collections.Counter(ids).items() if c > 1]
    if rep: print('ids repetidos:', rep); return 1
    conj = set(ids)

    fallos = []
    for e in entradas:
        for campo in ('label', 'keys', 'a'):
            for L in idiomas:
                v = e[campo].get(L)
                if not v: fallos.append(f'{e["id"]}.{campo}.{L} vacio')
        for fo in e.get('follow', []):
            if fo not in conj: fallos.append(f'{e["id"]}.follow -> {fo} no existe')
    if fallos:
        print('\n'.join(fallos[:40])); print(f'({len(fallos)} fallos)'); return 1

    # una clave no puede estar en dos entradas del mismo idioma
    choques = collections.defaultdict(list)
    for e in entradas:
        for L, ks in e['keys'].items():
            for k in ks: choques[(L, k.strip().lower())].append(e['id'])
    col = {k: v for k, v in choques.items() if len(v) > 1}
    if col:
        for k, v in list(col.items())[:20]: print('clave repetida', k, v)
        print(f'({len(col)} choques)'); return 1

    # ── escritura ─────────────────────────────────────────────────────
    for L in idiomas:
        filas = [{'id': e['id'], 'p': e['prio'],
                  'k': [k.strip().lower() for k in e['keys'][L]],
                  'l': e['label'][L], 'a': e['a'][L],
                  'f': e.get('follow', [])} for e in entradas]
        salida = {'v': 1, 'lang': L, 'e': filas}

        # vocabulario de intencion y sinonimos de categoria de ese idioma.
        # El castellano y el ingles no lo llevan: los suyos estan dentro de
        # index.html desde siempre y duplicarlos seria mantener dos listas.
        inte = os.path.join(FUENTE, 'intenciones', L + '.json')
        if L in ('es', 'en'):
            if os.path.exists(inte):
                print(f'{L}: el vocabulario de intencion del castellano y el ingles vive en index.html'); return 1
        elif not os.path.exists(inte):
            print(f'falta faq/fuente/intenciones/{L}.json'); return 1
        else:
            d = json.load(open(inte, encoding='utf-8'))
            sobran = set(d) - {'where', 'what', 'near', 'nearTok', 'count', 'cats'}
            if sobran:
                print(f'{L}: claves que no existen en el vocabulario: {sorted(sobran)}'); return 1
            for campo in ('where', 'what', 'near', 'nearTok', 'count'):
                if not d.get(campo):
                    print(f'{L}: el vocabulario no trae «{campo}»'); return 1
            salida['i'] = {k: d[k] for k in ('where', 'what', 'near', 'nearTok', 'count')}
            if d.get('cats'):
                salida['c'] = d['cats']

        ruta = os.path.join(DESTINO, L + '.json')
        with open(ruta, 'w', encoding='utf-8') as fh:
            json.dump(salida, fh, ensure_ascii=False, separators=(',', ':'))
        print(f'  faq/{L}.json  {len(filas)} entradas  {os.path.getsize(ruta)//1024} kB')

    with open(os.path.join(DESTINO, 'indice.json'), 'w', encoding='utf-8') as fh:
        json.dump({'v': 1, 'idiomas': idiomas, 'entradas': indice}, fh, ensure_ascii=False, indent=1)
    print(f'{len(entradas)} entradas, {len(idiomas)} idiomas: {" ".join(idiomas)}')
    return 0

sys.exit(main())
