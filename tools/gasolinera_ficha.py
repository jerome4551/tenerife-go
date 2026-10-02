#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
gasolinera_ficha.py — el molde de una ficha de gasolinera, en los 10 idiomas.

    python3 tools/gasolinera_ficha.py --municipio Garachico
    python3 tools/gasolinera_ficha.py 7749 11286        por IDEESS
    python3 tools/gasolinera_ficha.py --vocabulario     solo las palabras, para revisarlas

POR QUE UN MOLDE Y NO 1.980 TEXTOS A MANO
  Son 198 altas por 10 idiomas. Escritas una a una no se acaban nunca y saldrian
  desiguales. Pero una gasolinera no necesita prosa: lo unico que hay que decir
  es la marca, la calle, el municipio, que combustibles sirve y a que horas. Eso
  son DOCE PALABRAS y los siete dias de la semana. Se traducen una vez, se
  revisan una vez, y las 198 se rellenan con los datos del registro oficial.

  Lo que hay que revisar, entonces, es el VOCABULARIO (V y DIAS). Si esta bien,
  las 198 estan bien. `--vocabulario` lo saca solo para eso.

DE DONDE SALE CADA COSA
  rotulo, direccion, localidad, horario, coordenada, IDEESS   registro del MITECO
  municipio                                                   poligono del Cabildo
  combustibles      de que campos «Precio *» traen dato. El campo esta vacio
                    cuando la estacion no sirve ese combustible.
  NINGUN PRECIO entra en la ficha: caduca en 24 h (LEEME de gasolineras).

LOS TOPONIMOS SE QUEDAN EN CASTELLANO EN LOS 10 IDIOMAS
  «Garachico» y «Carretera Icod-Buenavista» no se traducen ni se transcriben al
  chino ni al bulgaro, y es a proposito:
    · es lo que pone en las senales de la carretera y en Google Maps, que es
      donde el conductor lo va a leer;
    · no existe transcripcion revisada de los 31 municipios (idiomas/glosario-cat
      no tiene bg ni pl, y del chino solo cubre 4 de 31), asi que escribirlas yo
      seria inventarmelas, y eso no se hace;
    · es la regla que ya tiene la app escrita en tools/auditar_idioma.js:408.
  El control de alfabeto pide que el chino TENGA han y el bulgaro TENGA cirilico,
  no que no tenga latin: las palabras traducidas de alrededor lo cumplen.

EL NOMBRE ES «MARCA · CALLE» Y ESO SE DECIDIO CONTANDO
  Sobre las 212 del registro: marca+calle da 210 nombres distintos (chocan 2),
  marca+localidad choca en 80 y marca+municipio en 133 (15 «DISA · Santa Cruz»
  seguidos no le sirven a nadie). Cuando dos coinciden se le anade la localidad.
"""
import json
import os
import re
import sys
import unicodedata

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(RAIZ, 'tools'))

IDIOMAS = ['es', 'en', 'fr', 'de', 'it', 'nl', 'zh', 'zht', 'bg', 'pl']

# ── EL VOCABULARIO ───────────────────────────────────────────────────────────
# Esto es lo que hay que revisar. Doce palabras.
V = {
 'gasolinera': {'es': 'Gasolinera', 'en': 'Petrol station', 'fr': 'Station-service',
                'de': 'Tankstelle', 'it': 'Distributore', 'nl': 'Tankstation',
                'zh': '加油站', 'zht': '加油站', 'bg': 'Бензиностанция',
                'pl': 'Stacja paliw'},
 'combustibles': {'es': 'Combustibles', 'en': 'Fuels', 'fr': 'Carburants',
                  'de': 'Kraftstoffe', 'it': 'Carburanti', 'nl': 'Brandstoffen',
                  'zh': '燃料', 'zht': '燃料', 'bg': 'Горива', 'pl': 'Paliwa'},
 'g95': {'es': 'gasolina 95', 'en': 'petrol 95', 'fr': 'essence 95', 'de': 'Benzin 95',
         'it': 'benzina 95', 'nl': 'benzine 95', 'zh': '95号汽油', 'zht': '95號汽油',
         'bg': 'бензин 95', 'pl': 'benzyna 95'},
 'g98': {'es': 'gasolina 98', 'en': 'petrol 98', 'fr': 'essence 98', 'de': 'Benzin 98',
         'it': 'benzina 98', 'nl': 'benzine 98', 'zh': '98号汽油', 'zht': '98號汽油',
         'bg': 'бензин 98', 'pl': 'benzyna 98'},
 'gasoleo': {'es': 'gasóleo A', 'en': 'diesel', 'fr': 'gazole', 'de': 'Diesel',
             'it': 'gasolio', 'nl': 'diesel', 'zh': '柴油', 'zht': '柴油',
             'bg': 'дизел', 'pl': 'olej napędowy'},
 'premium': {'es': 'gasóleo premium', 'en': 'premium diesel', 'fr': 'gazole premium',
             'de': 'Premium-Diesel', 'it': 'gasolio premium', 'nl': 'premiumdiesel',
             'zh': '优质柴油', 'zht': '優質柴油', 'bg': 'премиум дизел',
             'pl': 'olej napędowy premium'},
 'glp': {'es': 'GLP', 'en': 'LPG', 'fr': 'GPL', 'de': 'Autogas', 'it': 'GPL',
         'nl': 'LPG', 'zh': '液化石油气', 'zht': '液化石油氣', 'bg': 'газ LPG',
         'pl': 'LPG'},
 'dospuntos': {'zh': '：', 'zht': '：'},   # el chino usa los suyos, de ancho completo
 'y': {'es': 'y', 'en': 'and', 'fr': 'et', 'de': 'und', 'it': 'e', 'nl': 'en',
       'zh': '和', 'zht': '和', 'bg': 'и', 'pl': 'i'},
 'coma': {'zh': '、', 'zht': '、'},     # el chino enumera con ideografica, no con «,»
 'punto': {'zh': '。', 'zht': '。'},
 'veinticuatro': {'es': '24 h', 'en': '24 h', 'fr': '24 h', 'de': '24 Std.',
                  'it': '24 h', 'nl': '24 u', 'zh': '24小时', 'zht': '24小時',
                  'bg': '24 ч', 'pl': '24 h'},
}
# Los siete dias abreviados. Las letras del castellano (L M X J V S D) no valen
# en ningun otro idioma: cada uno lleva las suyas.
DIAS = {
 'es':  ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
 'en':  ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
 'fr':  ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
 'de':  ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
 'it':  ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'],
 'nl':  ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'],
 'zh':  ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
 'zht': ['週一', '週二', '週三', '週四', '週五', '週六', '週日'],
 'bg':  ['Пон', 'Вто', 'Сря', 'Чет', 'Пет', 'Съб', 'Нед'],
 'pl':  ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'],
}
CODIGO = {'L': 0, 'M': 1, 'X': 2, 'J': 3, 'V': 4, 'S': 5, 'D': 6}
GUION = {'zh': '至', 'zht': '至'}      # el chino no usa el guion para los rangos

# ── COMO SE LEE EL REGISTRO ──────────────────────────────────────────────────
# El registro escribe TODO EN MAYUSCULAS, abrevia el tipo de via, y en 24 de las
# 212 de Tenerife el campo «Direccion» viene sucio: el tipo de via repetido
# («CARRETERA CARRETERA GENERAL DEL SUR»), parentesis sin cerrar («TF-66(GUAZA-
# GALLE KM. 2»), un «  EN  » usado como separador («AVENIDA AYYO DE  EN  ADEJE»),
# el articulo pospuesto («CALLE MILAGROSA (LA)», «CARRETERA ROSARIO (DEL)») y
# «S/N» en medio de la frase. No se puede volcar tal cual en un pin.
#
# Son 24 casos de un conjunto CERRADO de 212: las reglas de abajo se pueden
# comprobar una a una mirando las 212 salidas, y es lo que se hizo. El texto
# original del registro NO SE PIERDE: va en `direccion_registro`.
VIAL = {
    'cr': 'Carretera', 'crtra': 'Carretera', 'ctra': 'Carretera', 'ctra.': 'Carretera',
    'pg': 'Polígono', 'pol': 'Polígono',
    'c/': 'Calle', 'gral': 'General', 'gral.': 'General',
    'poligono': 'Polígono',          # el registro va sin acentos
    'carretea': 'Carretera',         # errata del registro, 1 caso
    'urbanitzacion': 'Urbanización',   # el registro lo escribe asi
}
# Siglas: se quedan en mayusculas porque no son palabras. Sin esta lista,
# «E.S. LA CALETA» salia «E.s. la Caleta» y «BP» salia «Bp».
SIGLAS = {'BP', 'ES', 'SL', 'SA', 'KM', 'GLP', 'IND', 'CC', 'II', 'III', 'IV'}
# En un nombre de via el articulo va en minuscula («Avenida de las Palmitas»);
# en un nombre propio NO («La Caleta», «El Gomero»). La preposicion va en
# minuscula en los dos casos («Santa Cruz de Tenerife», «Red de Combustibles»).
PREPOSICIONES = {'de', 'del', 'y', 'e', 'en', 'a', 'al'}
ARTICULOS = {'la', 'las', 'el', 'los'}
# Lo que en un rotulo no dice nada: todas son gasolineras y el `cat` ya lo dice.
GENERICO = re.compile(r'(?i)^(e\.s\.|es|estaci[oó]n(\s+de\s+servicios?)?)\s+')

# Las marcas, tal como se escriben. CEPSA se llama ahora MOEVE y en el registro
# estan las dos: la misma empresa con el rotulo a medio cambiar.
MARCAS = [('MOEVE', 'Moeve'), ('CEPSA', 'Moeve'), ('DISA', 'DISA'), ('REPSOL', 'Repsol'),
          ('SHELL', 'Shell'), ('PETROPRIX', 'Petroprix'), ('PLENERGY', 'Plenergy'),
          ('TGAS', 'Tgas'), ('PCAN', 'Pcan'), ('OCÉANO', 'Océano'), ('OCEANO', 'Océano'),
          ('GMOIL', 'GMOil'), ('CANARY OIL', 'Canary Oil'), ('H2EXAGON', 'H2exagon'),
          ('H2GO', 'H2GO'), ('BP', 'BP')]


def llano(s):
    s = unicodedata.normalize('NFD', (s or '').lower())
    return ''.join(c for c in s if unicodedata.category(c) != 'Mn')


def marca_de(rotulo):
    """La marca, o None si el rotulo es el nombre propio de la estacion. De las
       212 hay 8 sin marca: «E.S. LA CALETA», «EL ESCOBONAL», «RED DE
       COMBUSTIBLES CANARIOS»... En esas el nombre de la ficha es el rotulo."""
    t = ' %s ' % llano(rotulo).replace('.', ' ').replace('-', ' ')
    for clave, bonito in MARCAS:
        if ' %s ' % llano(clave) in t:
            return bonito
    return None


def titulo(s, via=True):
    """De MAYUSCULAS a mayuscula inicial, respetando siglas y guiones:
       «CR ICOD-BUENAVISTA» -> «Carretera Icod-Buenavista».
       via=True para nombres de via (baja articulos y preposiciones),
       via=False para nombres propios (baja solo preposiciones): sin esa
       distincion salia «E.S. la Caleta» y «Santa Cruz De Tenerife»."""
    out = []
    for i, p in enumerate(re.split(r'\s+', (s or '').strip())):
        if not p:
            continue
        crudo = p.strip('.,')
        if i and llano(crudo) in PREPOSICIONES:
            out.append(llano(crudo))
            continue
        # El articulo va en minuscula SOLO detras de una preposicion. «Avenida
        # de las Palmitas» si; «Calle La Campana», «Guaza Los Cristianos» y
        # «Polígono Plan Parcial El Carretón» no, que ahi empieza el nombre.
        if via and i and llano(crudo) in ARTICULOS and out \
           and llano(out[-1]) in PREPOSICIONES:
            out.append(llano(crudo))
            continue
        exp = VIAL.get(llano(p)) or VIAL.get(llano(crudo))
        if exp:
            # «CARRETERA CTRA. GRAL. DEL NORTE»: si la palabra ya esta, no se
            # repite. Sin esto salia «Carretera Carretera General del Sur».
            if not out or llano(out[-1]) != llano(exp):
                out.append(exp)
            continue
        if crudo.upper() in SIGLAS or re.match(r'^(?:[A-ZÁ-Ú]\.)+$', p) \
           or re.match(r'^TF-?\d+$', crudo, re.I) or re.match(r'^\d', crudo):
            out.append(p if p.isupper() or '.' in p else p.upper())
            continue
        trozo = '-'.join(t[:1].upper() + t[1:].lower() for t in p.split('-'))
        if out and llano(out[-1]) == llano(trozo):
            continue                       # «CARRETERA CARRETERA»
        out.append(trozo)
    while out and llano(out[-1]) in PREPOSICIONES:
        out.pop()                          # «Avenida Ayyo de» -> «Avenida Ayyo»
    return ' '.join(out)


def dar_vuelta(s):
    """El registro pospone el articulo, de cuatro formas distintas:
       «ARENAS (LAS)», «BALDIOS, LOS», «CARRETERA ROSARIO (DEL) KM. 186» y
       «AVENIDA PASO EL (LOS MAJUELOS)». Se ponen del derecho."""
    t = (s or '').strip()
    art = r'(EL|LA|LOS|LAS|DEL|DE\s+LA|DE\s+LOS)'
    m = re.match(r'(?i)^(.*?)[,]?\s*\(%s\)\s*(.*)$' % art, t) \
        or re.match(r'(?i)^(.*?),\s*%s\s*()$' % art, t) \
        or re.match(r'(?i)^(.*?)\s+%s\s*()$' % art, t)
    if not m:
        return t
    cuerpo, articulo, resto = m.group(1).strip(), m.group(2), (m.group(3) or '').strip()
    # El tipo de via se queda delante: «CARRETERA ROSARIO (DEL)» es «CARRETERA
    # DEL ROSARIO», no «DEL CARRETERA ROSARIO».
    trozos = cuerpo.split()
    if trozos and llano(trozos[0]) in ('carretera', 'calle', 'avenida', 'plaza',
                                       'camino', 'paseo', 'cr', 'c/', 'via', 'vía'):
        return '%s %s %s %s' % (trozos[0], articulo, ' '.join(trozos[1:]), resto)
    return ('%s %s %s' % (articulo, cuerpo, resto)).strip()


def calle_corta(direccion):
    """La via sola, que es lo que va en el nombre del pin: sin numero, sin
       kilometro, sin el barrio entre parentesis y sin la basura del registro."""
    t = (direccion or '').strip()
    t = re.sub(r'(?i)\s*KM\.?\s*[\d,\.-]*.*$', '', t)  # desde «KM.» hasta el final
    t = re.split(r'\s{2}EN\s{2}|\s+EN\s{2}|\s{2}EN\s+', t)[0]  # el separador raro
    t = dar_vuelta(t)
    t = re.split(r'[(]', t)[0]        # el parentesis, cerrado o no: es el barrio
    t = dar_vuelta(t)                 # «AVENIDA PASO EL (LOS MAJUELOS)» -> «EL PASO»
    # Bloques de parcela: no son la calle y alargan el nombre del pin. Van ANTES
    # del corte por coma, porque «MZ. 13» lleva punto dentro.
    t = re.split(r'(?i)\s+(MZ|PC|PARCELA|FINCA|NAVE|LOCAL|EDIF)\.?\s*\d', t)[0]
    t = re.split(r',', t)[0]          # detras de la coma va el numero, no la via
    t = re.split(r'\.\s+(?=[A-ZÁ-Ú])', t)[0]   # «TEJINA DE GUIA. GUIA DE ISORA»
    # «S7N» es como el registro escribe «S/N» en una de ellas.
    t = re.split(r'(?i)\s+S/?7?N\b', t)[0]
    return municipios_bien(titulo(t.strip(' ,.-')))


# Los municipios se escriben como los escribe el Cabildo, no como el registro.
# El registro va sin acentos («GUIMAR», «ICOD»): cuando el nombre de un municipio
# aparece dentro del texto de la calle se le pone la grafia oficial. Es una
# correccion CON FUENTE, no un acento adivinado. Los nombres de persona de las
# calles se dejan como los escribe el registro: ahi no tengo fuente.
_MUNIS = None


def municipios_bien(txt):
    global _MUNIS
    if _MUNIS is None:
        import gasolineras as G
        reg, _ = G.cargar_registro()
        _MUNIS = sorted({x['municipio_poligono'] for x in reg}, key=len, reverse=True)
    for m in _MUNIS:
        if llano(m) != m.lower():      # solo los que llevan acento o mayuscula interna
            txt = re.sub(re.escape(llano(m)), m, txt, flags=re.I) \
                if llano(m) in llano(txt) else txt
    return txt


def rotulo_corto(rot):
    """«ESTACIÓN DE SERVICIO EL GOMERO» -> «El Gomero». Quita lo que no
       identifica (todas son estaciones de servicio: el `cat` ya lo dice) y la
       forma juridica. Sin esto el nombre del pin pasaba de 66 caracteres."""
    t = re.sub(r'(?i),?\s*S\.?L\.?$|,?\s*S\.?A\.?$', '', (rot or '').strip())
    t = re.sub(r'(?i)\s*KM\.?\s*[\d,\.]+\s*$', '', t)
    corto = GENERICO.sub('', t).strip()
    return titulo(corto or t, via=False)


def combustibles(e):
    """Los que el registro trae con precio. El campo vacio = no lo sirve."""
    hay = []
    for campo, clave in [('Precio Gasolina 95 E5', 'g95'),
                         ('Precio Gasolina 98 E5', 'g98'),
                         ('Precio Gasoleo A', 'gasoleo'),
                         ('Precio Gasoleo Premium', 'premium'),
                         ('Precio Gases licuados del petróleo', 'glp')]:
        if (e.get(campo) or '').strip():
            hay.append(clave)
    return hay


def horario(txt, L):
    """«L-S: 06:00-22:00; D: 07:00-10:00» al idioma que toque. Si una pieza no
       se entiende NO SE INVENTA: se devuelve tal cual y se cuenta como cruda,
       para que se vea y se mire a mano."""
    dias, g, crudas = DIAS[L], GUION.get(L, '-'), []
    piezas = []
    for tramo in (txt or '').split(';'):
        tramo = tramo.strip()
        if not tramo:
            continue
        m = re.match(r'^([A-ZÁ-Ú]+(?:-[A-ZÁ-Ú]+)?):\s*(.+)$', tramo)
        if not m:
            piezas.append(tramo)
            crudas.append(tramo)
            continue
        cod, hora = m.group(1), m.group(2).strip()
        if '-' in cod:
            a, b = cod.split('-')
            if a not in CODIGO or b not in CODIGO:
                piezas.append(tramo)
                crudas.append(tramo)
                continue
            etiqueta = '%s%s%s' % (dias[CODIGO[a]], g, dias[CODIGO[b]])
        elif cod in CODIGO:
            etiqueta = dias[CODIGO[cod]]
        else:
            piezas.append(tramo)
            crudas.append(tramo)
            continue
        if hora.upper() == '24H':
            hora = V['veinticuatro'][L]
        else:
            hora = re.sub(r'(^|[^\d])(\d):', r'\g<1>0\g<2>:', hora).replace('-', g)
        piezas.append('%s %s' % (etiqueta, hora))
    return ' · '.join(piezas), crudas


def ficha(e, muni, sufijo=''):
    """e es la estacion tal como viene del registro. muni, el del poligono."""
    rot = (e.get('Rótulo') or '').strip()
    marca = marca_de(rot)
    base = marca or rotulo_corto(rot)
    calle = calle_corta(e.get('Dirección'))
    loc = titulo(dar_vuelta(e.get('Localidad')), via=False)
    comb = combustibles(e)
    nombre = '%s · %s' % (base, calle)
    if sufijo:
        nombre += ' (%s)' % loc
    if sufijo == 'km':
        km = re.search(r'(?i)KM\.?\s*([\d,\.]+)', e.get('Dirección') or '')
        nombre = '%s · %s km %s' % (base, calle, km.group(1)) if km else \
                 '%s · %s (%s)' % (base, calle, e['IDEESS'])
    elif sufijo == 'ideess':
        nombre = '%s · %s (%s)' % (base, calle, e['IDEESS'])
    f = {
        'id': 'gas-%s-%s' % (e['IDEESS'], re.sub(r'[^a-z0-9]+', '-', llano(muni)).strip('-')),
        'ideess': str(e['IDEESS']),
        'category': 'gasolinera', 'emoji': '⛽', 'color': '#dc2626',
        'name': nombre,
        'lat': round(float(str(e['Latitud']).replace(',', '.')), 6),
        'lng': round(float(str(e['Longitud (WGS84)']).replace(',', '.')), 6),
        'marca': marca, 'municipio': muni, 'localidad': loc,
        'direccion_registro': (e.get('Dirección') or '').strip(),   # el original, sin tocar
        'cp': (e.get('C.P.') or '').strip(),
        'tags': ['Gasolinera'] + ([base] if base else []) + [muni],
        'idiomas': {}, 'horas_crudas': [],
    }
    for L in IDIOMAS:
        lista = [V[c][L] for c in comb]
        coma = V['coma'].get(L, ', ')
        if len(lista) > 1:
            fuel = coma.join(lista[:-1]) + ('' if L in ('zh', 'zht') else ' ') \
                   + V['y'][L] + ('' if L in ('zh', 'zht') else ' ') + lista[-1]
        else:
            fuel = lista[0] if lista else ''
        # El desc no lleva ni verbo ni preposicion, y es a proposito. «Oferuje
        # benzyna 95» esta mal en polaco (pide acusativo), el frances necesita
        # articulo («sur la Carretera») y el castellano tambien («en LA
        # carretera»), y el articulo depende del tipo de via. Una etiqueta y una
        # lista en nominativo no declina nada y es correcta en los diez.
        if L in ('zh', 'zht'):
            desc = '%s（%s）%s' % (calle, muni, V['punto'][L])
            if fuel:
                desc += '%s%s%s%s' % (V['combustibles'][L], V['dospuntos'][L],
                                      fuel, V['punto'][L])
        else:
            desc = '%s, %s.' % (calle, muni)
            if fuel:
                sep = ' :' if L == 'fr' else ':'   # el frances deja espacio antes
                desc += ' %s%s %s.' % (V['combustibles'][L], sep, fuel)
        h, crudas = horario(e.get('Horario'), L)
        f['idiomas'][L] = {'desc': desc, 'cat': '%s · %s' % (V['gasolinera'][L], base),
                           'hours': h}
        if L == 'es':
            f['horas_crudas'] = crudas
    return f


def cargar(seleccion=None):
    """Devuelve las fichas, ya resueltos los nombres que chocan."""
    import gasolineras as G
    reg, _ = G.cargar_registro()
    muni = {x['ideess']: x['municipio_poligono'] for x in reg}
    crudo = json.load(open(os.path.join(RAIZ, 'registro', 'gasolineras-canarias.json'),
                           encoding='utf-8-sig'))['ListaEESSPrecio']
    mios = [x for x in crudo if str(x.get('IDEESS')) in muni]
    # Primero sin sufijo, para ver cual choca con cual. Son 2 de 212.
    # Tres pasadas: a secas, con la localidad y con el km. Lo que siga chocando
    # lleva el IDEESS, que es unico por definicion. De las 212 solo hacen falta
    # las tres pasadas para 4 estaciones, y el IDEESS para 2: dos REPSOL con la
    # misma direccion exacta («CARRETERA TF-1 KM. 54») a 83 m una de otra.
    out, pendientes = [], list(mios)
    for paso in ('', 'loc', 'km', 'ideess'):
        cuenta = {}
        for x in pendientes:
            cuenta.setdefault(ficha(x, muni[str(x['IDEESS'])], paso)['name'], []).append(x)
        quedan = []
        for nombre, grupo in cuenta.items():
            if len(grupo) == 1 or paso == 'ideess':
                out += [ficha(x, muni[str(x['IDEESS'])], paso) for x in grupo]
            else:
                quedan += grupo
        pendientes = quedan
        if not pendientes:
            break
    if seleccion is not None:
        out = [f for f in out if f['ideess'] in seleccion
               or llano(f['municipio']) == llano(seleccion if isinstance(seleccion, str) else '')]
    return sorted(out, key=lambda f: (f['municipio'], f['name']))


def main():
    a = sys.argv[1:]
    if a and a[0] == '--vocabulario':
        for clave, fila in V.items():
            print('%-13s %s' % (clave, '  '.join('%s=%s' % (k, v) for k, v in fila.items())))
        for L in IDIOMAS:
            print('%-13s %s' % ('dias ' + L, ' '.join(DIAS[L])))
        return 0
    if a and a[0] == '--municipio':
        sel = ' '.join(a[1:])
    elif a:
        sel = set(a)
    else:
        sys.exit(__doc__.strip())
    f = cargar(sel)
    if not f:
        sys.exit('no encuentro ninguna estacion con eso')
    print(json.dumps(f, ensure_ascii=False, indent=1))
    return 0


if __name__ == '__main__':
    sys.exit(main())
