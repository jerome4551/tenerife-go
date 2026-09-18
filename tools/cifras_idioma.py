#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Las cifras de un idioma tienen que ser las del castellano.

Un numero mal copiado en una traduccion no da error en ninguna parte: la
app lo pinta tal cual y el turista se encuentra un telefono que no existe,
un precio que no es o una altura inventada. Este control compara, texto por
texto, las cifras del castellano con las del idioma.

DOS REGLAS QUE SALIERON DE MEDIR, no de suponer:

1. Solo se miran las cifras de tres digitos o mas, y las decimales. Con
   todas, el control dio 25 avisos y NI UNO era un error: eran numeros que
   el polaco escribe con palabra -«24h» es «cala dobe», «5 estrellas» es
   «pieciogwiazdkowych», «100 mejores» es «w setce»-. Un control que canta
   lobo se acaba ignorando. Las cifras grandes -precios, anios, telefonos,
   alturas, capacidades- no se escriben nunca con palabra, y son justo las
   que hacen dano si se copian mal.

2. El separador de millares cambia de idioma: el castellano escribe 67.230
   y el polaco 67 230. Sin contemplarlo, los 14 avisos que quedaban eran los
   14 el mismo falso positivo.

    python3 tools/cifras_idioma.py pl
"""
import json, glob, os, re, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LANG = sys.argv[1] if len(sys.argv) > 1 else None
if not LANG:
    print('uso: python3 tools/cifras_idioma.py <idioma>'); sys.exit(2)

fes = os.path.join(RAIZ, 'idiomas', 'es-lugares.json')
if not os.path.exists(fes):
    print('falta el volcado: node tools/lugares_idioma.js volcar'); sys.exit(2)
es = json.load(open(fes, encoding='utf-8'))

destino = os.path.join(RAIZ, 'idiomas', LANG + '.json')
trozos  = sorted(glob.glob(os.path.join(RAIZ, 'idiomas', LANG + '-lugares', '*.json')))
otro = {}
if os.path.exists(destino):
    otro = json.load(open(destino, encoding='utf-8'))
for f in trozos:
    otro.update(json.load(open(f, encoding='utf-8')))
if not otro:
    print('no hay nada que mirar de ' + LANG); sys.exit(2)

# 67.230 · 67 230 · 67,5 → la misma cifra
MILES = re.compile(r'(?<=\d)[ . ](?=\d{3}\b)')
def cifras(s):
    s = MILES.sub('', str(s))
    out = []
    for m in re.finditer(r'\d[\d,.]*', s):
        t = m.group(0).rstrip('.,')
        d = re.sub(r'[.,]', '', t)
        if len(d) >= 3 or ',' in t or '.' in t:
            out.append(d)
    return sorted(out)

malos, mirados = [], 0
for k, v in otro.items():
    if k not in es: continue
    for campo, txt in v.items():
        if campo == '_nombre': continue
        o = es[k].get(campo)
        if o is None: continue
        mirados += 1
        a, b = cifras(o), cifras(txt)
        if a != b: malos.append((k, campo, a, b, str(o), str(txt)))

print('=== cifras de ' + LANG + ' contra el castellano ===')
print('  textos comparados........................... ' + str(mirados))
print('  con cifras que no cuadran................... ' + str(len(malos)))
for k, campo, a, b, o, t in malos[:20]:
    print('     ' + k + '.' + campo)
    print('       es ' + str(a))
    print('       ' + LANG + ' ' + str(b))
    print('       <- ' + o[:110])
    print('       -> ' + t[:110])
sys.exit(1 if malos else 0)
