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
            '    address:%s,\n'
            '    hours:{ es:%s },\n'
            '    desc:{ es:%s },\n'
            '    cat:{ es:%s },\n'
            '    tags:[%s] },\n') % (
        js(f['id']), js(f['name']), f['lat'], f['lng'], js(f['ideess']), js(f['address']),
        js(f['idiomas']['es']['hours']), js(f['idiomas']['es']['desc']),
        js(f['idiomas']['es']['cat']), ','.join(js(t) for t in f['tags']))


def retirar(ideess):
    """Quita de la app la ficha GENERADA de una estacion: index.html, los nueve
       idiomas y el polaco fuente. Es el gemelo del alta, para no tocar cinco
       ficheros a mano. Solo retira fichas «gas-<ideess>-...»: las antiguas no
       las genero esta herramienta y no las toca."""
    src = open(os.path.join(RAIZ, 'index.html'), encoding='utf-8').read()
    m = re.search(r'  \{ id:"(gas-%s-[a-z0-9-]+)"' % re.escape(ideess), src)
    if not m:
        sys.exit('no hay ninguna ficha generada de la estacion %s' % ideess)
    fid = m.group(1)
    i = m.start()
    j = src.index('\n', src.index('\n    tags:[', i) + 1) + 1
    blq = src[i:j]
    if 'ideess:"%s"' % ideess not in blq or blq.count('{ id:') != 1:
        sys.exit('PARO: el bloque de %s no es el que genero esta herramienta' % fid)
    open(os.path.join(RAIZ, 'index.html'), 'w', encoding='utf-8').write(src[:i] + src[j:])
    for L in OTROS:
        p = os.path.join(RAIZ, 'idiomas/%s.json' % L)
        d = json.load(open(p, encoding='utf-8'))
        d.pop(fid, None)
        open(p, 'w', encoding='utf-8').write(una_linea(d))
    p = os.path.join(RAIZ, PL_FUENTE)
    d = json.load(open(p, encoding='utf-8'))
    d.pop(fid, None)
    open(p, 'w', encoding='utf-8').write(json.dumps(d, ensure_ascii=False, indent=1) + '\n')
    print('retirada %s de index.html, de los nueve idiomas y del polaco fuente' % fid)
    print('ahora: node tools/lugares_idioma.js montar pl')


def horas_antiguas(ver=False):
    """El HORARIO de las fichas antiguas enlazadas, desde el registro y en los
       diez idiomas. Solo el horario: el nombre y la descripcion se rehacen en la
       sesion 91. Hace falta ya porque un horario equivocado no es estilo, es un
       dato falso: «Repsol TF-1 Granadilla» decia 24 h y el registro dice 06:00 a
       00:00 (la de 24 h es su gemela del otro lado de la autopista)."""
    import gasolineras as G
    crudo = json.load(open(os.path.join(RAIZ, 'registro', 'gasolineras-canarias.json'),
                           encoding='utf-8-sig'))['ListaEESSPrecio']
    porid = {str(x['IDEESS']): x for x in crudo}
    src = open(os.path.join(RAIZ, 'index.html'), encoding='utf-8').read()
    viejas = re.findall(r'\{ id:"(gas-[a-z0-9-]+)"[^\n]*?ideess:"(\d+)"', src)
    viejas = [(i, d) for i, d in viejas if not i.startswith('gas-%s-' % d)]
    idi = {L: json.load(open(os.path.join(RAIZ, 'idiomas/%s.json' % L), encoding='utf-8'))
           for L in OTROS}
    plf = {}
    for f in sorted(os.listdir(os.path.join(RAIZ, 'idiomas', 'pl-lugares'))):
        plf[f] = json.load(open(os.path.join(RAIZ, 'idiomas', 'pl-lugares', f), encoding='utf-8'))
    for fid, ide in viejas:
        h = {L: F.horario(porid[ide]['Horario'], L)[0] for L in F.IDIOMAS}
        i = src.index('  { id:"%s"' % fid)
        j = src.find('\n  { id:', i + 5)
        blq = src[i:j]
        m = re.search(r'hours:\{ es:"([^"]*)" \}', blq)
        if not m:
            sys.exit('PARO: %s no tiene «hours:{ es:"..." }» como se esperaba' % fid)
        print('  %-22s «%s» -> «%s»' % (fid, m.group(1), h['es']))
        nuevo = blq.replace(m.group(0), 'hours:{ es:"%s" }' % h['es'], 1)
        # La direccion, tambien del registro: «Repsol TF-1 Granadilla» decia
        # «TF-1 km 31» y el registro dice km 54; «BP Guaza», «TF-1 km 21» y es
        # la TF-66 km 79.
        muni = next(x['municipio_poligono'] for x in G.cargar_registro()[0] if x['ideess'] == ide)
        dire = F.direccion(porid[ide], muni)
        ma = re.search(r'address:"([^"]*)"', nuevo)
        if ma:
            print('  %-22s 📍 «%s» -> «%s»' % ('', ma.group(1), dire))
            nuevo = nuevo.replace(ma.group(0), 'address:%s' % js(dire), 1)
        else:
            nuevo = nuevo.replace(' ideess:"%s",' % ide, ' ideess:"%s", address:%s,' % (ide, js(dire)), 1)
        # Una etiqueta «24H» en una estacion que el registro NO da abierta 24 h
        # es falsa: se quita. Las que si abren 24 h la conservan.
        if 'L-D: 24H' not in porid[ide]['Horario']:
            mt = re.search(r'tags:\[[^\]]*\]', nuevo)
            if mt and re.search(r'"24[hH]"', mt.group(0)):
                print('  %-22s etiqueta «24H» quitada: el registro da %s' % ('', porid[ide]['Horario']))
                nuevo = nuevo.replace(mt.group(0), re.sub(r',?"24[hH]"', '', mt.group(0)).replace('[,', '['), 1)
        src = src[:i] + nuevo + src[j:]
        for L in OTROS:
            if fid not in idi[L] or 'hours' not in idi[L][fid]:
                sys.exit('PARO: %s no tiene horario en %s' % (fid, L))
            idi[L][fid]['hours'] = h[L]
        donde = [f for f, d in plf.items() if fid in d]
        if len(donde) != 1:
            sys.exit('PARO: el polaco de %s esta en %d ficheros' % (fid, len(donde)))
        plf[donde[0]][fid]['hours'] = h['pl']
    if ver:
        return 0
    open(os.path.join(RAIZ, 'index.html'), 'w', encoding='utf-8').write(src)
    for L in OTROS:
        open(os.path.join(RAIZ, 'idiomas/%s.json' % L), 'w', encoding='utf-8').write(una_linea(idi[L]))
    for f, d in plf.items():
        p = os.path.join(RAIZ, 'idiomas', 'pl-lugares', f)
        nuevo = json.dumps(d, ensure_ascii=False, indent=1) + '\n'
        viejo = open(p, encoding='utf-8').read()
        if json.loads(viejo) != d:          # solo se escribe el que cambia
            open(p, 'w', encoding='utf-8').write(nuevo)
    print('hecho. Ahora: node tools/lugares_idioma.js montar pl')
    return 0


def main():
    if '--horas-antiguas' in sys.argv:
        return horas_antiguas('--ver' in sys.argv)
    if '--retirar' in sys.argv:
        return retirar(sys.argv[sys.argv.index('--retirar') + 1])
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

    # Las estaciones que ya cubre una ficha ANTIGUA no se dan de alta: saldrian
    # duplicadas. A la ficha antigua solo se le pone el ideess, que es un enlace
    # invisible, para que el control sepa que esta cubierta. El nombre al estilo
    # nuevo se le cambia en su turno, la sesion 91 (Jerome, 2 de octubre).
    # Se enlaza SOLO si es la misma marca y esta a menos de 50 m; si no, PARA.
    import gasolineras as G
    import gasolineras_plan as GP
    reg, _ = G.cargar_registro()
    recl = GP.reclamadas(reg)
    enlazar = []
    for f in [f for f in fichas if f['ideess'] in recl]:
        r = recl[f['ideess']]
        if r['a_metros'] >= 50 or not r['misma_marca']:
            sys.exit('PARO: %s la reclama %s a %d m, %s. Eso se mira a mano.' % (
                f['ideess'], r['id'], r['a_metros'],
                'misma marca' if r['misma_marca'] else 'OTRA MARCA'))
        enlazar.append((r['id'], f['ideess'], r['a_metros']))
        print('   ya la cubre %-22s (a %d m): no se duplica, se enlaza con ideess %s'
              % (r['id'], r['a_metros'], f['ideess']))
    fichas = [f for f in fichas if f['ideess'] not in recl]
    # Y las que una ficha ANTIGUA ya lleva enlazadas por su ideess, tampoco. Sin
    # esto, al rehacer La Laguna despues de enlazar gas-tf2-lalaguna y
    # gas-tf5-lalaguna, sus dos estaciones ya no las «reclamaba» nadie por
    # distancia (las enlazadas no reclaman) y se dieron de alta OTRA VEZ: 841
    # lugares en vez de 839. Lo cazo la cifra de auditar_datos.js.
    enlazadas = {m.group(2): m.group(1) for m in re.finditer(
        r'\{ id:"([^"]+)"[^\n]*?ideess:"(\d+)"', src)}
    for f in [f for f in fichas if f['ideess'] in enlazadas
              and enlazadas[f['ideess']] != f['id']]:
        print('   ya la cubre %-22s (enlazada): no se duplica' % enlazadas[f['ideess']])
    fichas = [f for f in fichas if enlazadas.get(f['ideess'], f['id']) == f['id']]
    for vid, ide, _ in enlazar:
        i = src.index('  { id:"%s"' % vid)
        k = src.index('\n', i)
        if 'ideess:' in src[i:src.index('tags:', i)]:
            sys.exit('PARO: %s ya tiene ideess' % vid)
        src = src[:k] + ' ideess:"%s",' % ide + src[k:]
    if enlazar and not fichas:
        if '--ver' not in sys.argv:
            open(os.path.join(RAIZ, 'index.html'), 'w', encoding='utf-8').write(src)
        return 0
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
    # Solo se declaran «sin traducir» las etiquetas que NO estan traducidas en
    # los glosarios: la marca y el municipio, que son nombres propios. Antes se
    # declaraba toda etiqueta que no estuviera ya en la lista, y al llevar la
    # Repsol Barroso el aviso del Teide se declararon «Montaña», «Importante» y
    # «Última», que SI estan traducidas: una declaracion falsa que habria tapado
    # el dia que faltara su traduccion.
    glos = [json.load(open(os.path.join(RAIZ, 'idiomas', 'etiquetas', '%s.json' % L),
                           encoding='utf-8')) for L in OTROS + ['pl']]
    traducida = lambda t: all(t in g for g in glos) or bool(re.match(r'^TF-\d+$', t))  # un codigo no se declara como sitio
    faltan = sorted({t for f in fichas for t in f['tags'][1:] if not traducida(t)}
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
