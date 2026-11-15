#!/usr/bin/env python3
"""revisar_rumano.py — el rumano, texto a texto contra su castellano.

No traduce ni juzga el estilo: busca lo que se puede comprobar sin dudar y
lista lo que hay que leer. Se escribio para el rumano (ro) de la nota 41 y
vale para todos los bloques que vienen (fichas, modulos, «Su cuerpo»).

ERRORES (no se entrega con uno solo):
  · forma distinta: un objeto con otras claves, una lista de otro largo
  · {marcadores} distintos, etiquetas HTML distintas, saltos de linea
    distintos, espacios al principio o al final distintos, *marcas* distintas
  · las letras: ş ţ Ş Ţ con cedilla (en rumano es la coma: ș ț Ș Ț,
    U+0219/U+021B), ã (de un teclado portugues), â al principio de palabra
  · la comilla doble ASCII (") dentro de un texto: en rumano „…” y, dentro
    de otra cita, «…»
  · comillas „ y ” descompensadas
  · un numero de 20 o mas (o acabado en 00) delante de un sustantivo sin
    «de»: «20 de minute», «48 de ore», pero «12 ore» y «2.150 m»
  · una fila con varias formas («|») que no trae las tres del rumano:
    1 loc · 2-19 locuri · 20+ de locuri (la regla de CLDR)
  · espacio antes de «?», «!», «:» o «;» (eso es frances, no rumano)
  · palabras castellanas sueltas (y, que, para, con, más, también...)
    fuera de los nombres propios y las citas declaradas
  · el tuteo: tu, te, ți, tău, poți, vrei, ai... y el imperativo de tu al
    principio de frase (Atinge, Alege, Încearcă...): la app trata de
    dumneavoastră (Jerome, 21-10-2026: «Usted en toda la app»)

AVISOS (se leen uno a uno):
  · «î» dentro de palabra que no va tras un prefijo conocido (ne-, re-,
    pre-, bine-, nemai-...): en rumano va «â» dentro de palabra
  · largo muy distinto del castellano (corte o relleno)
  · cifras del castellano que no salen en el rumano
  · «{n} palabra» sin formas: hay que mirar que el numero no pase de 19

    python3 revisar_rumano.py idiomas/ro-fuente/interfaz.json
    python3 revisar_rumano.py --pares fichero.json    [{"id","es","ro"}...]
Sale con 1 si hay algun error.
"""
import json, re, sys, unicodedata

# ── utilidades ────────────────────────────────────────────────────────────
LETRA = r'A-Za-zÀ-ÖØ-öø-ɏḀ-ỿ'
PAL = re.compile(r'[' + LETRA + r']+')
EMOJI = re.compile(r'[\U0001F000-\U0001F1E5\U0001F200-\U0001FAFF☀-➿⬀-⯿←-⇿⌀-⏿Ⓜ〰〽㊗㊙]')
MARC = re.compile(r'\{[A-Za-z0-9_]+\}')
ETIQ = re.compile(r'</?[a-zA-Z][^>]*>')
UNIDADES = {'km', 'm', 'min', 'h', 's', 'mm', 'cm', 'mb', 'kb', 'gb', 'kg', 'g', 'l', 'ml', 'kcal', 'kj', '°c', 'km/h', 'm/s', 'hpa',
            'x', 'mph', 'ft', 'mi', 'lb', 'oz', 'w', 'kw', 'v', 'a', 'mg', 'µg', 'ug', 'iu', 'ui', 'am', 'pm', 'gr', 'cal', 'bpm'}
# palabras castellanas que no existen en rumano (con «la», «de», «el», «a», «o» no se puede: tambien son rumanas)
CASTELLANO = {'y', 'que', 'para', 'con', 'sin', 'más', 'también', 'aquí', 'usted', 'está', 'están', 'pero', 'muy', 'del', 'los', 'las',
              'uno', 'por', 'cuando', 'donde', 'dónde', 'hasta', 'desde', 'hoy', 'mañana', 'lugar', 'lugares', 'playa', 'playas',
              'según', 'sobre', 'entre', 'cerca', 'todo', 'toda', 'todos', 'todas', 'puede', 'hay', 'ver', 'cómo', 'qué', 'porque',
              'su', 'nuestro', 'otra', 'otro', 'mismo', 'misma', 'ahora', 'siempre', 'nunca', 'después', 'antes', 'bien', 'menos'}
# el tuteo: pronombres, posesivos y verbos de tu
TUTEO = re.compile(r'(?<![' + LETRA + r'])(tu|te|ți|tău|tale|tine|ție|poți|vrei|știi|ești|faci|ai|aveai|vei|găsești|alegi|vezi|mergi|'
                   r'trebuie să (?:atingi|alegi|faci|mergi)|dacă vrei|ai nevoie|îți|ți-|te-|ai-)(?![' + LETRA + r'])', re.I)
IMPERATIVO_TU = re.compile(r'(?:^|[.!?¿¡:;—–(„«\n]\s*|[\U0001F000-\U0001FAFF☀-➿]️?\s+)'
                           r'(Atinge|Alege|Încearcă|Apasă|Caută|Deschide|Închide|Verifică|Adaugă|Șterge|Folosește|Vezi|Scrie|Activează|'
                           r'Descarcă|Instalează|Evită|Mergi|Fă|Ia|Pune|Ține|Consultă|Rezervă|Cumpără|Trimite|Partajează|Distribuie|'
                           r'Explorează|Descoperă|Bucură-te|Calculează|Creează|Schimbă|Elimină|Salvează|Introdu|Urmează|Respectă|Păstrează|Bea)'
                           r'(?![' + LETRA + r'])')
# tras una cifra, lo que no es un sustantivo contado (conjunciones, preposiciones, verbos)
NO_SUSTANTIVO = {'de', 'și', 'sau', 'ori', 'din', 'dintre', 'la', 'în', 'pe', 'cu', 'fără', 'până', 'spre', 'către', 'după', 'prin',
                 'pentru', 'iar', 'dar', 'ca', 'decât', 'mai', 'a', 'al', 'ale', 'ai', 'este', 'sunt', 'e', 'era', 'au', 'are', 'avea',
                 'sau', 'ori', 'și', 'nu', 'se', 'ca', 'cât', 'față', 'peste', 'sub', 'lângă', 'pe', 'înainte', 'înapoi', 'î.hr.', 'd.hr.'}
# las fechas se escriben sin «de»: «1 decembrie», «23 iunie» (DOOM)
MESES = {'ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie',
         'decembrie', 'ian.', 'feb.', 'mar.', 'apr.', 'iun.', 'iul.', 'aug.', 'sept.', 'oct.', 'nov.', 'dec.'}
PREFIJOS_I = ('ne', 're', 'pre', 'bine', 'nemai', 'dez', 'des', 'răs', 'răz', 'sub', 'supra', 'auto', 'anti', 'semi', 'contra', 'între', 'după', 'de', 'co', 'post', 'pro', 'în', 'nemaiîn', 'reîn', 'neîn')

def formas(s):
    return s.split('|')

def marcadores(s):
    return sorted(MARC.findall(s))

def cifras(s):
    """los numeros de un texto, sin separadores: 2.150 / 2,150 / 2 150 -> 2150; 1,5 / 1.5 -> 1.5"""
    out = []
    for m in re.finditer(r'\d+(?:[.,  ]\d+)*', s):
        t = m.group(0)
        # miles con punto/coma/espacio de tres cifras
        if re.fullmatch(r'\d{1,3}(?:[.,  ]\d{3})+', t):
            out.append(re.sub(r'\D', '', t))
        else:
            out.append(t.replace(',', '.').replace(' ', '').replace(' ', ''))
    return out

def necesita_de(n):
    n = int(n)
    c = n % 100
    return n != 0 and (c == 0 or c >= 20)

class Informe:
    def __init__(self):
        self.err, self.avi = [], []
    def e(self, ctx, msg):
        self.err.append(ctx + ': ' + msg)
    def a(self, ctx, msg):
        self.avi.append(ctx + ': ' + msg)

def revisar_texto(es, ro, ctx, R, exentos=(), plural_ok=False):
    """plural_ok: la fila pasa por un formateador que elige la forma por el numero
    (chatFmt con {n} o {N}; tx() con {n}): el rumano puede traer sus tres formas
    aunque el castellano no las necesite («980 de locuri» / «1012 locuri»)."""
    if not isinstance(ro, str):
        R.e(ctx, 'no es un texto'); return
    if not ro.strip() and es.strip():
        R.e(ctx, 'vacio'); return
    # espacios en los bordes
    le = len(es) - len(es.lstrip()); lr = len(ro) - len(ro.lstrip())
    te = len(es) - len(es.rstrip()); tr = len(ro) - len(ro.rstrip())
    if (le > 0) != (lr > 0) or (te > 0) != (tr > 0):
        R.e(ctx, 'espacios al principio o al final distintos: es=%r ro=%r' % (es[:3] + '…' + es[-3:], ro[:3] + '…' + ro[-3:]))
    # formas de plural
    fe, fr = formas(es), formas(ro)
    if len(fe) > 1 and len(fr) != 3:
        R.e(ctx, 'el castellano trae %d formas de plural y el rumano %d (el rumano pide 3: 1 · 2-19 · 20+ «de»)' % (len(fe), len(fr)))
    if len(fe) == 1 and len(fr) > 1 and not (plural_ok and len(fr) == 3 and re.search(r'\{[nN]\}', ro)):
        R.e(ctx, 'el rumano trae «|» y el castellano no (solo vale en filas que eligen la forma por el numero)')
    if len(fr) == 3:
        num = '{n}' if '{n}' in ro else ('{N}' if '{N}' in ro else None)
        if num:
            if re.search(re.escape(num) + r'\s+de\s', fr[0]) or re.search(re.escape(num) + r'\s+de\s', fr[1]):
                R.e(ctx, 'la forma de 1 o la de 2-19 lleva «de»')
            if not re.search(re.escape(num) + r'\s+de\s', fr[2]):
                R.a(ctx, 'la tercera forma (20+) no lleva «de» detras del numero: ' + fr[2][:80])
        elif not fr[2].startswith('de '):
            R.a(ctx, 'la tercera forma (20+) no empieza por «de»: ' + fr[2][:80])
    # forma a forma, contra la del castellano
    for i, f in enumerate(fr):
        base = fe[min(i, len(fe) - 1)]
        sub = ctx + ('' if len(fr) == 1 else ' (forma %d)' % (i + 1))
        if marcadores(f) != marcadores(base):
            R.e(sub, 'marcadores distintos: es %s · ro %s' % (marcadores(base), marcadores(f)))
        if sorted(ETIQ.findall(base)) != sorted(ETIQ.findall(f)):
            R.e(sub, 'etiquetas HTML distintas: %s · %s' % (sorted(ETIQ.findall(base)), sorted(ETIQ.findall(f))))
        if base.count('\n') != f.count('\n'):
            R.e(sub, 'saltos de linea: es %d · ro %d' % (base.count('\n'), f.count('\n')))
        if base.count('*') != f.count('*'):
            R.e(sub, 'asteriscos: es %d · ro %d' % (base.count('*'), f.count('*')))
        ee, er = sorted(EMOJI.findall(base)), sorted(EMOJI.findall(f))
        if ee != er:
            R.e(sub, 'emojis distintos: %s · %s' % (''.join(ee), ''.join(er)))
        if len(base) > 25:
            r = len(f) / max(1, len(base))
            if r > 1.6 or r < 0.55:
                R.a(sub, 'largo %.2f del castellano' % r)
    # letras
    for c, bien in (('ş', 'ș'), ('ţ', 'ț'), ('Ş', 'Ș'), ('Ţ', 'Ț')):
        if c in ro:
            R.e(ctx, 'letra con cedilla %r (U+%04X): en rumano es %r (U+%04X)' % (c, ord(c), bien, ord(bien)))
    if 'ã' in ro or 'Ã' in ro:
        R.e(ctx, '«ã» no existe en rumano (es «ă»)')
    if unicodedata.normalize('NFC', ro) != ro:
        R.e(ctx, 'el texto no esta en NFC (letra descompuesta)')
    for m in PAL.finditer(ro):
        w = m.group(0)
        wl = w.lower()
        if wl.startswith('â') and w not in exentos:
            R.e(ctx, '«â» al principio de palabra: %s (va «î»)' % w)
        if 'î' in wl[1:-1]:
            k = wl.index('î', 1)
            if not any(wl[:k].endswith(p) for p in PREFIJOS_I):
                R.a(ctx, '«î» dentro de palabra: %s (¿no va «â»?)' % w)
        if wl in ('sînt', 'sîntem', 'sînteți', 'romînia', 'romîn', 'romînă', 'romînesc'):
            R.e(ctx, 'grafia anterior a 1993: %s' % w)
    # comillas y signos
    if '"' in ro:
        R.e(ctx, 'comilla doble ASCII (") dentro del texto')
    if ro.count('„') != ro.count('”'):
        R.e(ctx, 'comillas „ ” descompensadas (%d/%d)' % (ro.count('„'), ro.count('”')))
    if re.search(r'\s[?!:;](?:\s|$)', ro):
        R.e(ctx, 'espacio antes de ? ! : o ; (en rumano va pegado)')
    if '  ' in ro and '  ' not in es:
        R.e(ctx, 'espacio doble')
    # castellano suelto (fuera de citas, parentesis y nombres declarados)
    sinCitas = re.sub(r'„[^”]*”|«[^»]*»|\([^)]*\)', ' ', ro)
    sinCitas = MARC.sub(' ', sinCitas)   # {y}, {t}...: marcadores, no palabras (bloque del cielo)
    for fr_ in FRASES_EXENTAS:
        sinCitas = sinCitas.replace(fr_, ' ')
    for m in PAL.finditer(sinCitas):
        w = m.group(0)
        if w in CASTELLANO and w not in exentos:
            R.e(ctx, 'palabra castellana suelta: «%s»' % w)
    # el tuteo
    for m in TUTEO.finditer(sinCitas):
        if m.group(0) not in exentos:
            R.e(ctx, 'tuteo: «%s»' % m.group(0))
    m = IMPERATIVO_TU.search(sinCitas)
    if m and m.group(1) not in exentos:
        R.e(ctx, 'imperativo de tu: «%s» (de dumneavoastră: -ți)' % m.group(1))
    # el «de» de los numeros
    for m in re.finditer(r'(?<![\d.,{])(\d{1,3}(?:\.\d{3})*|\d+)(?![\d.,:/])\s+([' + LETRA + r'][' + LETRA + r'/°.]*)', ro):
        n, w = m.group(1).replace('.', ''), m.group(2)
        if w.lower() in UNIDADES or w.lower().rstrip('.') in UNIDADES or w.lower() in NO_SUSTANTIVO or w.lower() in MESES or w[0].isupper() or not necesita_de(n):
            continue
        R.e(ctx, '«%s %s» sin «de» (%s pide «de»: «%s de %s»)' % (n, w, n, n, w))
    for m in re.finditer(r'\{([nN])\}\s+([a-zăâîșț]+)', ro):
        if len(fr) == 1 and m.group(2) not in UNIDADES and m.group(2) not in NO_SUSTANTIVO:
            R.a(ctx, '«{%s} %s» sin formas de plural: compruebe que el numero no pasa de 19' % (m.group(1), m.group(2)))
    # cualquier otra cifra del codigo delante de «milioane», «mii» o «miliarde» (bloque del cielo: «La {d} milioane
    # de km» salia «159 milioane» en la ficha de Marte): o lleva siempre decimales o el sustantivo va delante
    for m in re.finditer(r'\{(\w+)\}\s+(milioane|mii|miliarde)\b', ro):
        if m.group(1) not in ('n', 'N'):
            R.a(ctx, '«{%s} %s»: desde 20 pide «de»; compruebe que la cifra lleva siempre decimales' % (m.group(1), m.group(2)))
    ce, cr = cifras(es), cifras(ro)
    falt = [c for c in ce if c not in cr]
    if falt:
        R.a(ctx, 'cifras del castellano que no estan: %s' % falt)

def revisar(es, ro, ctx, R, exentos=(), plural_ok=False):
    if isinstance(es, dict):
        if not isinstance(ro, dict):
            R.e(ctx, 'el castellano es un objeto y el rumano no'); return
        if set(es) != set(ro):
            R.e(ctx, 'claves distintas: faltan %s, sobran %s' % (sorted(set(es) - set(ro)), sorted(set(ro) - set(es))))
        if '__codigo__' in es:
            return
        for k in es:
            if k in ro:
                revisar(es[k], ro[k], ctx + '.' + str(k), R, exentos, plural_ok)
    elif isinstance(es, list):
        if not isinstance(ro, list) or len(ro) != len(es):
            R.e(ctx, 'lista de otro largo'); return
        for i, (a, b) in enumerate(zip(es, ro)):
            revisar(a, b, ctx + '[%d]' % i, R, exentos, plural_ok)
    elif isinstance(es, str):
        revisar_texto(es, ro, ctx, R, exentos, plural_ok)
    else:
        if es != ro:
            R.e(ctx, 'valor distinto: %r · %r' % (es, ro))

# Tablas cuyos textos pasan por un formateador que elige la forma de plural por
# el numero aunque el castellano no la necesite: chatFmt() (index.html) lo hace
# con {n} y, si no lo hay, con {N}.
PLURAL_POR_NUMERO = {'CHAT_STR'}
FRASES_EXENTAS = (
    'Subdirección de Protección Civil y Emergencias',   # organismo oficial, por su nombre
    'Roque de los Muchachos',   # el observatorio de La Palma, por su nombre (bloque del cielo)
)
# Lo que se queda como esta, con su motivo: nombres propios, citas en
# castellano que la ficha explica y la voz de quien usa la app.
EXENTOS = {
    'Surprinde-mă',           # «Sorpréndeme»: lo dice quien usa la app, como en castellano
    'Subdirección', 'Protección', 'Civil', 'Emergencias', 'Infoplayas', 'Canarias',
    'ten+móvil', 'móvil',     # nombre de la app de TITSA
    'mago',                   # «traje de mago», el traje tradicional, explicado al lado
    'Lo', 'Divino',           # «Lo Divino», canto tradicional
    'coso',                   # nombre del desfile del Carnaval, explicado al lado
    'del', 'Socorro',         # «Fecioarei del Socorro»: advocacion
    'Playa', 'Jardín',        # nombre propio
}

def main():
    a = sys.argv[1:]
    R = Informe()
    if a and a[0] == '--pares':
        pares = json.load(open(a[1], encoding='utf-8'))
        for p in pares:
            revisar(p['es'], p['ro'], str(p.get('id')), R, EXENTOS | set(p.get('exentos', [])))
        n = len(pares)
    else:
        d = json.load(open(a[0], encoding='utf-8'))
        for f in d['filas']:
            revisar(f['es'], f['ro'], '%s/%s' % (f['tabla'], f['clave']), R, EXENTOS, plural_ok=(f['tabla'] in PLURAL_POR_NUMERO))
        esp = d.get('especiales', {})
        for k, v in esp.get('FREQ_I18N', {}).items():
            revisar_texto(k, v, 'FREQ_I18N/' + k, R, EXENTOS)
        for k, v in esp.get('labelRo', {}).items():
            revisar_texto(k, v, 'labelRo/' + k, R, EXENTOS)
        n = len(d['filas'])
    for x in R.avi:
        print('  aviso  ' + x)
    for x in R.err:
        print('  ERROR  ' + x)
    print('\n%d filas · %d errores · %d avisos' % (n, len(R.err), len(R.avi)))
    sys.exit(1 if R.err else 0)

if __name__ == '__main__':
    main()
