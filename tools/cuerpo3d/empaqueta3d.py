#!/usr/bin/env python3
"""Empaqueta los datos del cuerpo 3D para la app: de datos3d.js (lo que escribe construir3d.py,
una sola línea con todo en base64) a datos/cuerpo3d/, ficheros binarios sueltos que el motor
(modulos/cuerpo3d.js) pide uno a uno, solo los del aspecto elegido.

    python3 tools/cuerpo3d/empaqueta3d.py [datos3d.js] [datos/cuerpo3d]

Lo que escribe (72 ficheros, 7-11-2026):
  indice.json                 lo pequeño (variantes, alturas, hitos, músculos, grupos, cabeceras de
                              las mallas) y la lista de ficheros con sus bytes y su sha256
  cuerpo.<huella>.bin         lo común del cuerpo, los ojos, las cejas y las pestañas: triángulos,
                              UV, soldadura, los gestos y las máscaras de las partes
  cuerpo-<variante>.<h>.bin   las posiciones de esas cuatro mallas en una variante (a0…b2)
  pelo-<peinado>.<h>.bin      lo común de un peinado, y pelo-<peinado>-<variante>.<h>.bin sus posiciones
  zapatillas.<h>.bin          lo común de las zapatillas, y zapatillas-<variante>.<h>.bin sus posiciones
  tex-<clave>.<h>.webp|png    las texturas, tal cual venían (webp; el mapa de músculos, png)

Cada .bin es un contenedor propio: «TG3D», la longitud de una cabecera JSON (uint32 LE), la
cabecera ({"v":1,"f":"cuerpo","sec":[["cuerpo.tri", desplazamiento, bytes], …]}) y las secciones,
cada una alineada a 4 bytes, con el mismo contenido byte a byte que llevaba la base64.

La huella (8 hex del sha256 del contenido) va en el nombre: un fichero nuevo tiene un nombre nuevo,
y el service worker puede guardar estos para siempre (indice.json, que los nombra, va «red
primero»). Antes de escribir se borra lo que hubiera de una pasada anterior en la carpeta.
"""
import base64
import datetime
import hashlib
import json
import os
import re
import struct
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(os.path.dirname(AQUI))
MAGIA = b'TG3D'

# qué mallas van en cada fichero común (y su fichero de variante, con {v})
FICHEROS = [
    ('cuerpo', ['cuerpo', 'ojos', 'cejas', 'pestanas']),
    ('pelo-corto', ['pelo_corto']), ('pelo-medio', ['pelo_medio']), ('pelo-largo', ['pelo_largo']),
    ('pelo-afro', ['pelo_afro']), ('pelo-coleta', ['pelo_coleta']), ('pelo-trenzas', ['pelo_trenzas']),
    ('zapatillas', ['cz_zapatillas']),
]


def lee(ruta):
    txt = open(ruta, encoding='utf8').read()
    m = re.match(r'\s*window\.TG_C3D_DATOS\s*=\s*', txt)
    if m:
        txt = txt[m.end():].rstrip().rstrip(';')
    return json.loads(txt)


def b64(s):
    return base64.b64decode(s)


def contenedor(nombre, secciones):
    """secciones: lista de (nombre, bytes) → el fichero entero."""
    cab, cuerpo, pos = [], [], 0
    for n, b in secciones:
        cab.append([n, pos, len(b)])
        relleno = (-len(b)) % 4
        cuerpo.append(b + b'\0' * relleno)
        pos += len(b) + relleno
    h = json.dumps({'v': 1, 'f': nombre, 'sec': cab}, separators=(',', ':')).encode('utf8')
    h += b' ' * ((-(len(MAGIA) + 4 + len(h))) % 4)
    return MAGIA + struct.pack('<I', len(h)) + h + b''.join(cuerpo)


def datos_uri(s):
    m = re.match(r'data:image/(webp|png);base64,', s)
    if not m:
        raise SystemExit('textura que no es data:image/webp|png: ' + s[:40])
    return m.group(1), b64(s[m.end():])


def main(entrada, salida):
    D = lee(entrada)
    if D.get('v') != 1:
        raise SystemExit('version de datos3d.js que no conozco: ' + str(D.get('v')))
    os.makedirs(salida, exist_ok=True)
    # lo de la pasada anterior (solo lo que este guion escribe)
    for f in os.listdir(salida):
        if f == 'indice.json' or re.match(r'^[a-z0-9_-]+\.[0-9a-f]{8}\.(bin|webp|png)$', f):
            os.remove(os.path.join(salida, f))
    ficheros = {}

    def escribe(clave, ext, contenido):
        h = hashlib.sha256(contenido).hexdigest()
        nombre = clave + '.' + h[:8] + '.' + ext
        open(os.path.join(salida, nombre), 'wb').write(contenido)
        ficheros[clave] = {'f': nombre, 'bytes': len(contenido), 'sha256': h}
        return nombre

    I = {'v': 1, 'hecho': datetime.date.today().isoformat(), 'variantes': D['variantes'], 'alto': D['alto'], 'media': D['media'],
         'hitos': D['hitos'], 'musculos': D['musculos'], 'grupos': D['grupos'], 'partes': sorted(D.get('partes', {})),
         'gestos': {}, 'mallas': {}, 'tex': {}, 'ficheros': ficheros}
    for malla, G in (D.get('gestos') or {}).items():
        I['gestos'][malla] = {g: {'s': x['s'], 'n': x['n']} for g, x in G.items()}
    vistas = set()
    for fich, mallas in FICHEROS:
        comun, por_var = [], {v: [] for v in D['variantes']}
        for m in mallas:
            d = D['mallas'][m]
            vistas.add(m)
            I['mallas'][m] = {k: d[k] for k in ('nv', 'nt', 'ns', 'q', 'mat') if k in d}
            if 'tex' in d:
                I['mallas'][m]['tex'] = d['tex']
            I['mallas'][m]['fich'] = fich
            I['mallas'][m]['fichVar'] = fich + '-{v}'
            comun += [(m + '.tri', b64(d['tri'])), (m + '.uv', b64(d['uv'])), (m + '.sold', b64(d['sold']))]
            for g, x in ((D.get('gestos') or {}).get(m) or {}).items():
                comun += [('gestos.' + m + '.' + g + '.i', b64(x['i'])), ('gestos.' + m + '.' + g + '.d', b64(x['d']))]
            for v in D['variantes']:
                por_var[v].append((m + '.pos', b64(d['pos'][v])))
        if fich == 'cuerpo':
            for k in I['partes']:
                comun.append(('partes.' + k, b64(D['partes'][k])))
        escribe(fich, 'bin', contenedor(fich, comun))
        for v in D['variantes']:
            escribe(fich + '-' + v, 'bin', contenedor(fich + '-' + v, por_var[v]))
    sobran = set(D['mallas']) - vistas
    if sobran:
        raise SystemExit('mallas sin fichero: ' + ', '.join(sorted(sobran)))
    for clave, s in D['tex'].items():
        ext, contenido = datos_uri(s)
        I['tex'][clave] = escribe('tex-' + clave, ext, contenido)
    txt = json.dumps(I, separators=(',', ':'), ensure_ascii=False)
    open(os.path.join(salida, 'indice.json'), 'w', encoding='utf8').write(txt)
    total = sum(x['bytes'] for x in ficheros.values())
    print('indice.json', len(txt), 'bytes;', len(ficheros), 'ficheros,', total, 'bytes en total')
    return I


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else os.path.join(AQUI, 'datos3d.js'),
         sys.argv[2] if len(sys.argv) > 2 else os.path.join(RAIZ, 'datos', 'cuerpo3d'))
