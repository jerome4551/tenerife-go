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
