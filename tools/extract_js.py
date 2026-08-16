#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Extrae cada bloque <script> en linea de index.html a chk/NN.js para node --check.

Los bloques con src= son externos y no se extraen. El de application/ld+json no
es JavaScript: se valida como JSON y se informa aparte.

    python3 tools/extract_js.py && for f in chk/*.js; do node --check "$f" || echo "FALLO $f"; done
"""
import io, json, os, re, shutil, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HTML = os.path.join(RAIZ, 'index.html')
CHK  = os.path.join(RAIZ, 'chk')

def main():
    s = io.open(HTML, encoding='utf8').read()
    if os.path.isdir(CHK):
        shutil.rmtree(CHK)
    os.makedirs(CHK)
    ext = ld = js = 0
    fallos = []
    for i, m in enumerate(re.finditer(r'<script([^>]*)>([\s\S]*?)</script>', s), 1):
        attrs, cuerpo = m.group(1), m.group(2)
        if re.search(r'\bsrc\s*=', attrs):
            ext += 1
            continue
        if 'ld+json' in attrs:
            ld += 1
            try:
                json.loads(cuerpo)
            except Exception as e:
                fallos.append('bloque %d (ld+json): %s' % (i, e))
            continue
        js += 1
        # La linea 1 del fichero extraido = la linea del <script> en index.html,
        # para que node --check senale un numero util.
        desfase = s[:m.start(2)].count('\n')
        io.open(os.path.join(CHK, '%02d.js' % i), 'w', encoding='utf8').write(
            '\n' * desfase + cuerpo)
    print('etiquetas <script>    : %d' % (ext + ld + js))
    print('  externas (src)      : %d' % ext)
    print('  ld+json             : %d%s' % (ld, '' if not fallos else '  *** con fallos ***'))
    print('  JavaScript extraido : %d  -> %s/' % (js, os.path.relpath(CHK, RAIZ)))
    for f in fallos:
        print('  ' + f)
    return 1 if fallos else 0

if __name__ == '__main__':
    sys.exit(main())
