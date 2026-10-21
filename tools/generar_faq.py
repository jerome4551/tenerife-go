#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Convierte los bloques de la base de conocimiento en un fichero por idioma.

Entrada : faq/fuente/*.json             los bloques tal y como se redactaron
          faq/fuente/bg/*.json          el suplemento en bulgaro, por id
          faq/fuente/intenciones/*.json el vocabulario de intencion de cada
                                        idioma: «donde esta», «que hacer»,
                                        «cerca de mi», «cuantos lugares»
          faq/fuente/claves/<idioma>.json claves de busqueda de mas para
                                        entradas que ya existen, por id
          faq/fuente/nativo/respuestas.json la respuesta de la app de las tiendas
                                        (window.TGO_NATIVO), por id y por
                                        idioma, donde la de la web no seria
                                        verdad dentro de ella; sale como "n"

Salida  : faq/<idioma>.json  lo que descarga el movil, solo su idioma
          faq/indice.json    cat/volatil/bloque; solo lo leen los controles

El bulgaro va aparte a proposito. Los bloques llegan escritos de una pieza
y se vuelven a mandar corregidos; si el bulgaro estuviera dentro se perderia
en cada reenvio y el diff no dejaria ver que cambio. Asi el bloque original
se queda como llego y el suplemento se funde al generar.

Las claves de mas van aparte por lo mismo: al retirar CHAT_KB (12/10/2026)
hubo que darle a entradas de los bloques preguntas que antes contestaba el, y
meterlas dentro del bloque las perderia en el siguiente reenvio. Son solo
claves de busqueda, ningun texto que lea el usuario.

Una entrada con "contacto": true sale con "c": 1 y el asistente pinta debajo
el boton para escribirle a Jerome (la de «algo falla»).

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
            # los rotulos de la app que cita la respuesta: los mira auditar_faq.js
            if e.get('rotulos'): indice[e['id']]['rotulos'] = e['rotulos']
            if e.get('contacto'): indice[e['id']]['contacto'] = True

    idiomas = idiomas + ['bg']

    # claves de mas, por idioma y por id; un id que no existe es un error
    porid = {e['id']: e for e in entradas}
    for L in idiomas:
        f = os.path.join(FUENTE, 'claves', L + '.json')
        if not os.path.exists(f): continue
        extra = json.load(open(f, encoding='utf-8'))
        for id_, ks in extra.items():
            if id_.startswith('_'): continue
            if id_ not in porid:
                print(f'claves/{L}.json: {id_} no es ninguna entrada'); return 1
            ya = porid[id_]['keys'][L]
            nuevas = [k for k in ks if k not in ya]
            if len(nuevas) != len(ks):
                print(f'claves/{L}.json: {id_} repite claves que la entrada ya tiene'); return 1
            porid[id_]['keys'][L] = ya + nuevas

    # la respuesta de la app de las tiendas: dentro no hay Web Push ni service
    # worker y no se instala desde el navegador. Un id que no existe o un
    # idioma que falta es un error, como en las claves.
    nativo = {}
    fn = os.path.join(FUENTE, 'nativo', 'respuestas.json')
    if os.path.exists(fn):
        for id_, porL in json.load(open(fn, encoding='utf-8')).items():
            if id_.startswith('_'): continue
            if id_ not in porid:
                print(f'nativo/respuestas.json: {id_} no es ninguna entrada'); return 1
            faltan = [L for L in idiomas if not str(porL.get(L, '')).strip()]
            sobran = sorted(set(porL) - set(idiomas))
            if faltan or sobran:
                print(f'nativo/respuestas.json: {id_} sin {faltan} o con idiomas que la app no tiene {sobran}'); return 1
            nativo[id_] = porL
            indice[id_]['nativo'] = True

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
        filas = []
        for e in entradas:
            fila = {'id': e['id'], 'p': e['prio'],
                    'k': [k.strip().lower() for k in e['keys'][L]],
                    'l': e['label'][L], 'a': e['a'][L],
                    'f': e.get('follow', [])}
            if e.get('contacto'): fila['c'] = 1
            if e['id'] in nativo: fila['n'] = nativo[e['id']][L]
            filas.append(fila)
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
            # favs y orden (12/10/2026): «ordena mis favoritos por distancia»,
            # que exc-03 prometia y el asistente no sabia hacer. ayuda: la
            # palabra de ayuda a secas, frases enteras (112, emergencia o la
            # ayuda de la app, para elegir).
            INTENCIONES = ('where', 'what', 'near', 'nearTok', 'count', 'favs', 'orden', 'ayuda')
            sobran = set(d) - set(INTENCIONES) - {'cats', 'zonas'}
            if sobran:
                print(f'{L}: claves que no existen en el vocabulario: {sorted(sobran)}'); return 1
            for campo in INTENCIONES:
                if not d.get(campo):
                    print(f'{L}: el vocabulario no trae «{campo}»'); return 1
            salida['i'] = {k: d[k] for k in INTENCIONES}
            if d.get('cats'):
                salida['c'] = d['cats']
            # las zonas («nord», «Süden», «北部»): las de castellano e ingles
            # viven en index.html (CHAT_ZONE_W)
            if d.get('zonas'):
                if set(d['zonas']) != {'norte', 'sur', 'este', 'oeste', 'centro'}:
                    print(f'{L}: las zonas son norte, sur, este, oeste y centro: {sorted(d["zonas"])}'); return 1
                salida['z'] = d['zonas']

        ruta = os.path.join(DESTINO, L + '.json')
        with open(ruta, 'w', encoding='utf-8') as fh:
            json.dump(salida, fh, ensure_ascii=False, separators=(',', ':'))
        print(f'  faq/{L}.json  {len(filas)} entradas  {os.path.getsize(ruta)//1024} kB')

    with open(os.path.join(DESTINO, 'indice.json'), 'w', encoding='utf-8') as fh:
        json.dump({'v': 1, 'idiomas': idiomas, 'entradas': indice}, fh, ensure_ascii=False, indent=1)
    print(f'{len(entradas)} entradas, {len(idiomas)} idiomas: {" ".join(idiomas)}')
    return 0

sys.exit(main())
