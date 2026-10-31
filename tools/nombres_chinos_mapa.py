#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
nombres_chinos_mapa.py — En chino, los pueblos del mapa con el nombre de las fichas.

    python3 tools/nombres_chinos_mapa.py               # escribe el bloque en index.html
    python3 tools/nombres_chinos_mapa.py --comprobar   # el bloque de index.html, ¿al dia?

POR QUE
  El 31 de octubre de 2026, el mapa de la isla dejo de pintar en chino los
  nombres que trae el fichero de OpenStreetMap: son pocos (8 pueblos de
  Tenerife), en name:zh-Hant vienen los mismos caracteres simplificados que en
  name:zh-Hans, y en simplificado cinco de los ocho no son los de las fichas
  de la app (劳罗塔瓦 donde las fichas dicen 拉奥罗塔瓦). Jerome, ese mismo dia, a
  «¿Quieres que el mapa en chino use los nombres de las fichas?»: «si».

DE DONDE SALE CADA NOMBRE
  Las fichas no traducen el titulo de un lugar, pero si el pueblo con el que
  acaba su categoria: la del Mirador de Humboldt (mirador-humboldt),
  «Mirador · La Orotava», es «观景台 · 拉奥罗塔瓦» en idiomas/zh.json y
  «觀景台 · 拉奧羅塔瓦» en idiomas/zht.json. De cada ficha
  cuya categoria tiene las mismas partes en castellano, en chino y en chino
  tradicional sale una pareja (chino, tradicional) para ese pueblo, y el
  pueblo se queda con la pareja que mas fichas usan. Nada mas:
  - si la «traduccion» es el castellano tal cual, no cuenta;
  - si dos parejas empatan, se desempata por las veces que sale cada una en
    todo el fichero de su idioma (sin contar las veces que va dentro de la
    otra: 布埃纳维斯塔 dentro de 北布埃纳维斯塔), y si aun empatan, el guion
    PARA: no elige;
  - en tradicional no puede quedar un caracter que las propias fichas
    escriben solo en simplificado (sale de comparar letra a letra las
    categorias de las dos), ni al reves.

QUE NOMBRES ENTRAN
  Solo los que salen en el mapa: los rotulos del mapa detallado
  (mapa/tenerife-osm.pmtiles, capa places, propiedad name) y los del mapa base
  (mapa/tenerife-base.pmtiles, capa sitio, propiedad nombre). En el mapa
  salen los nombres oficiales, y algunas fichas usan el corto: ALIAS dice que
  pueblo es cada uno (el oficial tiene que salir en el mapa y el corto no; si
  no, el guion PARA). Lo que no sale en ninguna ficha se queda en castellano.

Los .pmtiles se leen con pmtiles y mapbox_vector_tile (tools/requisitos.txt),
como auditar_ubicacion.py.
"""
import collections
import gzip
import io
import json
import os
import re
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HTML = os.path.join(RAIZ, 'index.html')
OSM = os.path.join(RAIZ, 'mapa', 'tenerife-osm.pmtiles')
BASE = os.path.join(RAIZ, 'mapa', 'tenerife-base.pmtiles')

# El nombre oficial, el que sale en el mapa, y el corto que usan las fichas.
ALIAS = {
    'Santa Cruz de Tenerife': ['Santa Cruz'],
    'San Cristóbal de La Laguna': ['La Laguna'],
    'Granadilla de Abona': ['Granadilla'],
    'Icod de los Vinos': ['Icod'],
    'La Matanza de Acentejo': ['La Matanza'],
    'Puerto de la Cruz': ['Puerto Cruz'],
    'San Juan de la Rambla': ['San Juan Rambla'],
    'Playa de las Américas': ['Las Américas'],
    'Valle de San Lorenzo': ['Valle San Lorenzo'],
}

INI = '/* >>> nombres chinos del mapa'
FIN = '/* <<< nombres chinos del mapa */'


def para(msg):
    print('  PARA: ' + msg)
    sys.exit(1)


def categorias():
    """{id: categoria en castellano}, de places[] en index.html."""
    s = io.open(HTML, encoding='utf-8').read()
    blk = s[s.index('const places = ['):]
    out = {}
    for m in re.finditer(r'\{\s*id:\s*"([^"]+)"(.*?)\n\s*tags:', blk, re.S):
        c = re.search(r'cat:\s*\{\s*es:\s*"([^"]*)"', m.group(2))
        if c:
            out[m.group(1)] = c.group(1)
    return out


def nombres_del_mapa():
    """Los rotulos de lugar de los dos mapas: {nombre: 'detallado'|'base'|'los dos'}."""
    from pmtiles.reader import Reader, MmapSource, all_tiles
    import mapbox_vector_tile as mvt
    vistos = collections.defaultdict(set)
    for fich, capa, prop, cual in ((OSM, 'places', 'name', 'detallado'), (BASE, 'sitio', 'nombre', 'base')):
        if not os.path.exists(fich):
            para('no esta %s' % os.path.relpath(fich, RAIZ))
        with open(fich, 'rb') as f:
            for _, data in all_tiles(Reader(MmapSource(f)).get_bytes):
                if data[:2] == b'\x1f\x8b':
                    data = gzip.decompress(data)
                for ft in mvt.decode(data).get(capa, {}).get('features', []):
                    n = ft['properties'].get(prop)
                    if isinstance(n, str) and n:
                        vistos[n].add(cual)
    return {n: ('los dos' if len(v) == 2 else next(iter(v))) for n, v in vistos.items()}


def calcular():
    cats = categorias()
    zh = json.load(io.open(os.path.join(RAIZ, 'idiomas', 'zh.json'), encoding='utf-8'))
    zht = json.load(io.open(os.path.join(RAIZ, 'idiomas', 'zht.json'), encoding='utf-8'))
    txt_zh = io.open(os.path.join(RAIZ, 'idiomas', 'zh.json'), encoding='utf-8').read()
    txt_zht = io.open(os.path.join(RAIZ, 'idiomas', 'zht.json'), encoding='utf-8').read()

    parejas = collections.defaultdict(collections.Counter)   # terminacion -> {(zh, zht): fichas}
    simp, trad = set(), set()                                 # letras que cambian entre los dos
    for pid, ces in cats.items():
        a = (zh.get(pid) or {}).get('cat', '')
        b = (zht.get(pid) or {}).get('cat', '')
        se, sa, sb = ces.split(' · '), a.split(' · '), b.split(' · ')
        if len(se) < 2 or not (len(se) == len(sa) == len(sb)):
            continue
        for x, y in zip(sa, sb):
            if len(x) == len(y):
                for c1, c2 in zip(x, y):
                    if c1 != c2:
                        simp.add(c1)
                        trad.add(c2)
        e, x, y = se[-1].strip(), sa[-1].strip(), sb[-1].strip()
        if x and y and x != e and y != e:
            parejas[e][(x, y)] += 1
    solo_simp, solo_trad = simp - trad, trad - simp

    mapa = nombres_del_mapa()
    for oficial, cortos in ALIAS.items():
        if oficial not in mapa:
            para('ALIAS: «%s» no sale en el mapa' % oficial)
        for c in cortos:
            if c in mapa:
                para('ALIAS: «%s» sale en el mapa con ese nombre: no es un alias' % c)

    tabla, dudas = {}, []
    for nombre in sorted(mapa):
        votos = collections.Counter(parejas.get(nombre, {}))
        for c in ALIAS.get(nombre, []):
            votos.update(parejas.get(c, {}))
        if not votos:
            continue
        def veces(par):
            # las veces que sale en los dos ficheros, sin las que va dentro de otra candidata
            z, t = par
            n = txt_zh.count(z) + txt_zht.count(t)
            for (z2, t2) in votos:
                if (z2, t2) != par and z in z2:
                    n -= txt_zh.count(z2)
                if (z2, t2) != par and t in t2:
                    n -= txt_zht.count(t2)
            return n
        orden = sorted(votos.items(), key=lambda kv: (-kv[1], -veces(kv[0])))
        (z1, t1), n1 = orden[0]
        if len(orden) > 1:
            (z2, t2), n2 = orden[1]
            if n1 == n2 and veces((z1, t1)) == veces((z2, t2)):
                para('«%s»: %s y %s empatan (%d fichas cada uno, y las mismas veces en los ficheros)' % (nombre, z1, z2, n1))
            dudas.append((nombre, [(z, t, n) for (z, t), n in orden]))
        malas = sorted(set(t1) & solo_simp) + sorted(set(z1) & solo_trad)
        if malas:
            para('«%s»: %s / %s lleva %s, que las fichas escriben en el otro chino' % (nombre, z1, t1, ''.join(malas)))
        tabla[nombre] = (z1, t1, n1, mapa[nombre])
    return tabla, dudas


def bloque(tabla):
    filas = ',\n'.join("  '%s': ['%s', '%s']" % (n.replace("'", "\\'"), z, t) for n, (z, t, _, _) in sorted(tabla.items()))
    return (INI + ' · los escribe tools/nombres_chinos_mapa.py: NO SE TOCAN A MANO.\n'
            '   En chino, los pueblos del mapa llevan el nombre que les dan las fichas de la app (el\n'
            '   pueblo con el que acaba su categoria: la del Mirador de Humboldt, «Mirador · La\n'
            '   Orotava», es «观景台 · 拉奥罗塔瓦»), el que mas fichas usan: [chino, chino tradicional].\n'
            '   Lo que no esta aqui, en castellano.\n'
            '   Jerome, 31 de octubre de 2026. */\n'
            'const MAPA_NOMBRES_ZH = {\n' + filas + '\n};\n' + FIN)


def main():
    tabla, dudas = calcular()
    nuevo = bloque(tabla)
    s = io.open(HTML, encoding='utf-8').read()
    a, b = s.find(INI), s.find(FIN)
    if a < 0 or b < a or s.count(INI) != 1 or s.count(FIN) != 1:
        print('  no encuentro las marcas «%s» y «%s» en index.html (una vez cada una)' % (INI, FIN))
        return 1
    actual = s[a:b + len(FIN)]

    det = sum(1 for v in tabla.values() if v[3] in ('detallado', 'los dos'))
    bas = sum(1 for v in tabla.values() if v[3] in ('base', 'los dos'))
    print('  pueblos del mapa con nombre chino en las fichas: %d (en el detallado %d, en el base %d)' % (len(tabla), det, bas))
    print('    con alias (el oficial en el mapa, el corto en las fichas): %s' % ', '.join(
        '%s ← %s' % (o, '/'.join(c)) for o, c in ALIAS.items() if o in tabla))
    if dudas:
        print('    donde las fichas no dicen todas lo mismo, el que mas usan:')
        for n, op in dudas:
            print('      %-28s %s' % (n, ' · '.join('%s %d' % (z, k) for z, t, k in op)))
    print('  los nombres: ' + ', '.join('%s %s/%s' % (n, z, t) for n, (z, t, _, _) in sorted(tabla.items())))

    if '--comprobar' not in sys.argv[1:]:
        if actual == nuevo:
            print('  index.html ya estaba al dia')
        else:
            io.open(HTML, 'w', encoding='utf-8').write(s[:a] + nuevo + s[b + len(FIN):])
            print('  escrito en index.html')
        return 0
    if actual != nuevo:
        print('  EL BLOQUE DE index.html NO ESTA AL DIA (python3 tools/nombres_chinos_mapa.py)')
        return 1
    print('  el bloque de index.html es el que sale de las fichas: si')
    return 0


if __name__ == '__main__':
    sys.exit(main())
