#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Barrido de seguridad y codificacion. Solo lee.
    python3 tools/auditar_seguridad.py
Marca con <-- lo que hay que mirar a mano: no todo lo marcado es un fallo."""
import io, re, os, sys, unicodedata, collections

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
s  = io.open(os.path.join(RAIZ, 'index.html'), encoding='utf8').read()
sw = io.open(os.path.join(RAIZ, 'sw.js'), encoding='utf8').read()

print('=== codificacion ===')
print('  NFC puro                     : %s' % ('si' if s == unicodedata.normalize('NFC', s) else 'NO'))
print('  U+FFFD / controles / CRLF    : %d / %d / %d'
      % (s.count('�'),
         sum(1 for c in s if ord(c) < 32 and c not in '\n\t'),
         s.count('\r\n')))
print('  subrogados sueltos           : %d' % sum(1 for c in s if 0xD800 <= ord(c) <= 0xDFFF))
print('  tabuladores                  : %d' % s.count('\t'))
INV = {0x00A0:'NBSP', 0x200B:'ZWSP', 0x200D:'ZWJ', 0xFEFF:'BOM', 0x00AD:'SHY', 0x202F:'NNBSP'}
inv = ['U+%04X %s x%d' % (c, n, s.count(chr(c))) for c, n in sorted(INV.items()) if s.count(chr(c))]
print('  invisibles                   : %s' % (', '.join(inv) or 'ninguno'))
print('  mojibake (Ã©, Ã±, â€)         : %d' % sum(s.count(x) for x in ('Ã©','Ã±','â€','Ã¡','Ã³')))

print('\n=== inyeccion ===')
for f in ('eval(', 'new Function(', 'document.write('):
    print('  %-18s           : %d' % (f, s.count(f)))
proto = len(re.findall(r'__proto__|constructor\s*\[|prototype\s*\[', s))
print('  __proto__ / constructor[]    : %d' % proto)
anc = re.findall(r'<a\b[^>]*>', s)
tb  = [a for a in anc if 'target' in a and '_blank' in a]
print('  target="_blank" sin noopener : %d de %d' % (len([a for a in tb if 'noopener' not in a]), len(tb)))
# el argumento puede llevar parentesis dentro (encodeURIComponent), asi que
# se equilibran en vez de cortar en el primer ')': si no, marca falsos positivos
def args_de(txt, ini):
    d = 0
    for k in range(ini, len(txt)):
        if txt[k] == '(': d += 1
        elif txt[k] == ')':
            d -= 1
            if d == 0: return txt[ini+1:k]
    return ''
wo = [args_de(s, m.end()-1) for m in re.finditer(r'window\.open\s*\(', s)]
print('  window.open sin noopener     : %d de %d' % (len([o for o in wo if 'noopener' not in o]), len(wo)))

print('\n  interpolacion dentro de atributos peligrosos (revisar a mano):')
for atr in ('href', 'src', 'action', 'formaction', 'srcdoc', 'style'):
    hits = re.findall(r'%s\s*=\s*"[^"]*\$\{[^"]*"' % atr, s)
    vistos = set()
    for h in hits:
        for i in re.findall(r'\$\{([^}]*)\}', h):
            k = i.strip()[:64]
            if k in vistos: continue
            vistos.add(k)
            seguro = ('escapeAttr' in i or 'encodeURI' in i
                      or re.fullmatch(r"[\w.]+\s*\?\s*'[^']*'\s*:\s*'[^']*'", i.strip()) is not None
                      or re.fullmatch(r'[\w.]+\s*(?:\*|\+|-)?\s*[\w.\'"]*', i.strip()) is not None)
            print('    %-6s %-8s %s' % ('' if seguro else '<--', atr, k))

print('\n=== bloque de guaguas: nada sin escapar ===')
crudo = [l for l in re.findall(r'.*\$\{(?:stop|line|l)\.(?:nombre|numero|municipio|color)[^\n]*', s)
         if 'escapeHtml' not in l and 'escapeAttr' not in l]
print('  interpolaciones sin escapar  : %d' % len(crudo))
for c in crudo[:5]: print('    ' + c.strip()[:110])

print('\n=== textos visibles escritos a pelo ===')
# La auditoria de idiomas solo mira las tablas: no ve un literal en español
# metido en una plantilla. Este control es el que caza esos.
ES = (r'(?:l\u00ednea|paradas?|l\u00edneas|sin resultados|cargando|buscar|guagua|'
      r'aqu\u00ed|volver|cerrar|siguiente|ninguna|no hay|elegir|toca|pulsa)')
fijos = []
for m in re.finditer(r'\.(?:textContent|innerText|placeholder)\s*=\s*'
                     r'(`[^`]{0,220}`|\'[^\']{0,220}\'|"[^"]{0,220}")', s):
    lit = m.group(1)
    if not re.search(ES, lit, re.I): continue
    # el acceso al idioma puede ir ANTES del literal, como fallback
    ctx = s[max(0, m.start() - 120):m.end()]
    if re.search(r'L_\.|\bt\(\)|\btx\(|LANGS|\|\|', ctx): continue
    fijos.append((s.count('\n', 0, m.start()) + 1, lit.replace('\n', ' ')[:88]))
print('  literales en español sin pasar por el idioma: %d' % len(fijos))
for ln, t in fijos[:10]:
    print('    <--  linea %-6d %s' % (ln, t))

print('\n=== tipografia china ===')
# En chino no se deja espacio detras de los signos de ancho completo, ni se
# usan los latinos pegados a un hanzi. Lo segundo lo mira auditar_web.js
# sobre las tablas; esto barre el fuente entero, plantillas incluidas.
esp = re.findall(r'[\u3002\uff0c\uff1b\uff1a\uff01\uff1f] [\u3400-\u9fff]', s)
print('  espacio detras de un signo chino : %d' % len(esp))
for e in sorted(set(esp))[:6]:
    i = s.find(e)
    print('    <--  ...%s...' % s[max(0,i-28):i+12].replace('\n', ' '))

print('\n=== service worker ===')
print('  tipos de mensaje aceptados   : %s' % ', '.join(sorted(set(re.findall(r"d\.type === '(\w+)'", sw))) or ['-']))
print('  clients.claim / skipWaiting  : %s / %s' % ('si' if 'clients.claim' in sw else 'no',
                                                    'si' if 'skipWaiting' in sw else 'no'))

print('\n=== CSP ===')
m = re.search(r'Content-Security-Policy" content="([^"]+)"', s)
if not m: print('  *** no hay meta CSP ***')
else:
    for d in [x.strip() for x in m.group(1).split(';') if x.strip()]:
        aviso = ''
        if d.startswith('script-src') and "'unsafe-inline'" in d: aviso = '  <-- permite JS inline'
        if "'unsafe-eval'" in d: aviso = '  <-- permite eval'
        print('    %s%s' % (d[:92], aviso))
    for falta in ('frame-ancestors', 'form-action', 'base-uri', 'object-src'):
        print('    %-16s %s' % (falta, 'presente' if falta in m.group(1) else 'AUSENTE'))
