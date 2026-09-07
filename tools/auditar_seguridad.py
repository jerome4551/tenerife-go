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
# El escapado puede estar en la LINEA SIGUIENTE, cuando la plantilla parte el
# ternario. Cortando en \n, `${stop.municipio` salia como interpolacion sin
# escapar y el escapeHtml estaba justo debajo: un aviso que siempre es mentira
# ensena a ignorar el control entero. Se mira la interpolacion completa,
# emparejando las llaves.
def interp_completa(txt, i):
    d = 0
    for k in range(i, min(len(txt), i + 400)):
        if txt[k] == '{': d += 1
        elif txt[k] == '}':
            d -= 1
            if d == 0: return txt[i:k + 1]
    return txt[i:i + 400]

crudo = []
for m in re.finditer(r'\$\{(?:stop|line|l)\.(?:nombre|numero|municipio|color)', s):
    t = interp_completa(s, m.start() + 1)
    if 'escapeHtml' not in t and 'escapeAttr' not in t:
        crudo.append(t.replace('\n', ' ')[:110])
print('  interpolaciones sin escapar  : %d' % len(crudo))
for c in crudo[:5]: print('    ' + c.strip())

print('\n=== textos visibles escritos a pelo ===')
# La auditoria de idiomas solo mira las tablas: no ve un literal en español
# metido en una plantilla. Este control es el que caza esos.
#
# La primera version solo miraba .textContent/.innerText/.placeholder y una
# lista corta de palabras. Se le escaparon los 25 textos del modulo PWA, que
# iban por innerHTML, confirm() y alert(): el panel de informacion entero
# salia en español en los ocho idiomas. Ahora mira tambien los dialogos y los
# atributos, y decide si un texto es español por acentos o por dos palabras
# funcionales, en vez de por una lista de sustantivos que siempre se queda
# corta -'⏳ Localizando…' no tiene ninguna-.
# showLayerMsg y showLayerToast pintan en pantalla igual que un alert. Se
# suman a la lista porque los cuatro avisos de cambio de capa estaban fijos en
# español y ningun control los veia.
# innerHTML se anadio despues: por ahi salian el "Sin foto en Wikipedia" rojo
# de 270 fichas y los dos rotulos del panel de rutas, los tres fijos en
# castellano para los ocho idiomas. Un texto pintado por innerHTML se lee
# igual que uno pintado por textContent.
CTX = (r'(?:\.(?:textContent|innerText|innerHTML|placeholder|title|ariaLabel)\s*=\s*'
       r'|(?:confirm|alert|prompt|showLayerMsg|showLayerToast|showGpsToast)\s*\(\s*'
       r"|insertAdjacentHTML\s*\(\s*'[a-zA-Z]+'\s*,\s*"
       r"|setAttribute\s*\(\s*'(?:aria-label|title|placeholder|alt)'\s*,\s*)")
PAL = (r'\b(?:el|la|los|las|un|una|de|del|que|no|se|su|tu|con|para|por|en|y|o|es|'
       r'est[aá]|hay|más|sin|al|lo|te|ya|muy|pero|como|cuando|donde|desde|hasta|'
       r'sobre|entre|todo|toda|esta|este|esa|ese)\b')

def ini_sentencia(txt, pos):
    """Principio de la sentencia que contiene `pos`.

    La version anterior miraba 140 caracteres hacia atras a pelo, y con eso
    un `L_.clave || 'respaldo'` de DOS LINEAS MAS ARRIBA hacia que el control
    se callara ante un literal que no tenia nada que ver. Asi se le escaparon
    "Buscando paradas y lineas..." y los dos "Servicio no configurado
    todavia.": ninguno pasaba por el idioma, los tres salian en castellano en
    los ocho, y el control los daba por buenos."""
    return max(txt.rfind(';', 0, pos), txt.rfind('{', 0, pos),
               txt.rfind('}', 0, pos), txt.rfind('\n', 0, pos)) + 1

def es_espanol(t):
    if re.search(r'[áéíóúñ¿¡ÁÉÍÓÚÑ]', t):
        return True
    return len(re.findall(PAL, t, re.I)) >= 2

# El panel de administracion va SOLO en español, por decision de producto.
# Se localiza por sus marcas y no por numero de linea, que se mueve solo.
try:
    adm_ini = s.index('PANEL DE ADMINISTRACIÓN')
    adm_fin = s.index('<!-- \u2550', s.index('SISTEMA DE ADMINISTRACIÓN'))
except ValueError:
    adm_ini = adm_fin = -1

fijos = []
for m in re.finditer(CTX + r'(`[^`]{0,300}`|\'[^\']{0,300}\'|"[^"]{0,300}")', s):
    lit = m.group(1)
    if not es_espanol(lit[1:-1]): continue
    if adm_ini <= m.start() <= adm_fin: continue
    # el acceso al idioma puede ir ANTES del literal, como fallback
    ctx = s[ini_sentencia(s, m.start()):m.end()]
    if re.search(r'L_\.|\bL\(\)\.|\bt\(\)|\btx\(|\bptx\(|LANGS|\|\|', ctx): continue
    # una fila de tabla de idiomas (es:'...') no es un literal suelto
    if re.search(r"\b(?:es|en|fr|de|it|nl|zh|zht)\s*:\s*$", s[:m.end() - len(lit)]): continue
    fijos.append((s.count('\n', 0, m.start()) + 1, lit.replace('\n', ' ')[:88]))
# Plurales construidos a mano dentro de una plantilla. Es la forma que mas se
# escapa: `${n} lugar${n !== 1 ? 'es' : ''}` no tiene acentos ni dos palabras
# funcionales, asi que ninguna de las dos reglas de arriba lo ve, y sale en
# español en los ocho idiomas. Habia tres en el buscador de lugares.
SUSTANTIVOS = (r'lugar|resultado|l[ií]nea|parada|d[ií]a|hora|plaza|mesa|punto|'
               r'sitio|playa|opci[oó]n|coincidencia|elemento|foto')
for m in re.finditer(r'[^\n]*\$\{[^}]*\}\s*(?:' + SUSTANTIVOS + r')[a-z]*[^\n]{0,60}', s):
    t = m.group(0).strip()
    if re.match(r'^(?:es|en|fr|de|it|nl|zh|zht)\s*:', t):
        continue
    if re.search(r'\bL\.\w+|\btx\(|\bplural\(', t):
        continue
    fijos.append((s.count('\n', 0, m.start()) + 1, t[:88]))

# Tercera regla. Las dos de arriba no ven una palabra suelta: "Calculando…"
# no lleva acento ni dos palabras funcionales, y era el rotulo del boton de
# calcular ruta en los ocho idiomas. La lista es corta a proposito -solo
# verbos y sustantivos de interfaz- y solo se aplica donde se pinta.
INTERFAZ = (r'\b(?:cargando|buscando|guardando|enviando|calculando|descargando|'
            r'localizando|generando|comprobando|abriendo|cerrando|borrando|'
            r'copiado|guardado|enviado|reintentar|cancelar|aceptar)\b')
for m in re.finditer(CTX + r'(`[^`]{0,200}`|\'[^\'\n]{0,200}\'|"[^"\n]{0,200}")', s):
    lit = m.group(1)
    cuerpo = re.sub(r'<[^>]*>', ' ', lit[1:-1])
    cuerpo = re.sub(r'\$\{[^}]*\}', ' ', cuerpo)          # lo interpolado ya se mira aparte
    if not re.search(INTERFAZ, cuerpo, re.I): continue
    if adm_ini <= m.start() <= adm_fin: continue
    ctx = s[ini_sentencia(s, m.start()):m.end()]
    if re.search(r'L_\.|\bL\(\)\.|\bt\(\)|\btx\(|\bptx\(|LANGS|\|\|', ctx): continue
    if re.search(r"\b(?:es|en|fr|de|it|nl|zh|zht)\s*:\s*$", s[:m.end() - len(lit)]): continue
    par = (s.count('\n', 0, m.start()) + 1, lit.replace('\n', ' ')[:88])
    if par not in fijos: fijos.append(par)

# Cuarta regla: avisadores cuyo texto NO es el primer argumento
# -showMessage(elemento, tipo, texto)-. Con una expresion regular sola no
# vale: se para en el primer literal de la llamada, que es 'error', lo
# descarta por no ser español y se salta el que de verdad se lee. Aqui se
# miran TODOS los literales de la llamada.
AVISADORES = r'\b(?:showMessage|showToast|showBusToast|showShareToast|pushToast)\s*\('
for m in re.finditer(AVISADORES, s):
    fin_llamada = s.find(';', m.end())
    salto = s.find('\n', m.end())
    if fin_llamada < 0 or (0 <= salto < fin_llamada): fin_llamada = salto
    if fin_llamada < 0: continue
    llamada = s[m.end():fin_llamada]
    if re.search(r'L_\.|\bL\(\)\.|\bt\(\)|\btx\(|\bptx\(|LANGS', llamada): continue
    for lm in re.finditer(r'(`[^`]{0,300}`|\'[^\'\n]{0,300}\'|"[^"\n]{0,300}")', llamada):
        cuerpo = lm.group(1)[1:-1]
        if not es_espanol(cuerpo): continue
        if adm_ini <= m.start() <= adm_fin: continue
        par = (s.count('\n', 0, m.start()) + 1, lm.group(1)[:88])
        if par not in fijos: fijos.append(par)

print('  literales en español sin pasar por el idioma: %d' % len(fijos))
for ln, t in fijos[:12]:
    print('    <--  linea %-6d %s' % (ln, t))
# Este control SI tumba la auditoria. Un aviso que solo se imprime acaba
# ignorandose, y esto es justo lo que se cuela sin que nadie lo vea.
CON_FALLO = bool(fijos)

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


import sys
sys.exit(1 if CON_FALLO else 0)
