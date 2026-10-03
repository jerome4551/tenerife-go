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
 'g95p': {'es': 'gasolina 95 premium', 'en': 'premium petrol 95', 'fr': 'essence 95 premium',
          'de': 'Premium-Benzin 95', 'it': 'benzina 95 premium', 'nl': 'premium benzine 95',
          'zh': '优质95号汽油', 'zht': '優質95號汽油', 'bg': 'бензин 95 премиум',
          'pl': 'benzyna 95 premium'},
 'renovable': {'es': 'diésel renovable', 'en': 'renewable diesel', 'fr': 'gazole renouvelable',
               'de': 'erneuerbarer Diesel', 'it': 'gasolio rinnovabile',
               'nl': 'hernieuwbare diesel', 'zh': '可再生柴油', 'zht': '可再生柴油',
               'bg': 'възобновяем дизел', 'pl': 'odnawialny olej napędowy'},
 'gnc': {'es': 'gas natural comprimido', 'en': 'compressed natural gas',
         'fr': 'gaz naturel comprimé', 'de': 'komprimiertes Erdgas',
         'it': 'gas naturale compresso', 'nl': 'gecomprimeerd aardgas',
         'zh': '压缩天然气', 'zht': '壓縮天然氣', 'bg': 'компресиран природен газ',
         'pl': 'sprężony gaz ziemny'},
 'glp': {'es': 'GLP', 'en': 'LPG', 'fr': 'GPL', 'de': 'Autogas', 'it': 'GPL',
         'nl': 'LPG', 'zh': '液化石油气', 'zht': '液化石油氣', 'bg': 'газ LPG',
         'pl': 'LPG'},
 'dospuntos': {'zh': '：', 'zht': '：'},
 # El AdBlue no es un combustible -es un aditivo para el escape de los diesel-
 # asi que no va en la lista de «Combustibles»: va aparte, con la misma forma de
 # etiqueta y dos puntos, que no declina nada. «AdBlue» es lo que pone en el
 # surtidor y se escribe igual en los diez. Lo pidio Jerome el 3 de octubre.
 'ademas': {'es': 'Además', 'en': 'Also', 'fr': 'Également', 'de': 'Außerdem',
            'it': 'Inoltre', 'nl': 'Ook', 'zh': '另有', 'zht': '另有', 'bg': 'Също',
            'pl': 'Także'},   # el chino usa los suyos, de ancho completo
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
    'autovia': 'Autovía',
    'crt': 'Carretera',                 # «CARRETERA CRT GRAL ICOD-S/C»
    'ind': 'Industrial', 'ind.': 'Industrial',   # «PG IND. AÑAZA»
    'carretea': 'Carretera',         # errata del registro, 1 caso
    'urbanitzacion': 'Urbanización',   # el registro lo escribe asi
}
# Siglas: se quedan en mayusculas porque no son palabras. Sin esta lista,
# «E.S. LA CALETA» salia «E.s. la Caleta» y «BP» salia «Bp».
SIGLAS = {'BP', 'ES', 'SL', 'SA', 'KM', 'GLP', 'CC', 'II', 'III', 'IV'}
# En un nombre de via el articulo va en minuscula («Avenida de las Palmitas»);
# en un nombre propio NO («La Caleta», «El Gomero»). La preposicion va en
# minuscula en los dos casos («Santa Cruz de Tenerife», «Red de Combustibles»).
PREPOSICIONES = {'de', 'del', 'y', 'e', 'en', 'a', 'al'}
ARTICULOS = {'la', 'las', 'el', 'los'}
# Lo que en un rotulo no dice nada: todas son gasolineras y el `cat` ya lo dice.
GENERICO = re.compile(r'(?i)^(e\.s\.|es|estaci[oó]n(\s+de\s+servicios?)?)\s+')

# Acentos y texto ilegible del registro: viven en un fichero de DATOS, no aqui,
# para que se sigan aplicando cada vez que el registro se descarga de nuevo.
# Ver el «_» de ese fichero para el porque de cada cosa.
_CORR = json.load(open(os.path.join(RAIZ, 'datos', 'gasolineras',
                                    'correcciones-registro.json'), encoding='utf-8'))
ACENTOS = _CORR['acentos']
EN_ESPERA = set(_CORR.get('en_espera', {}))   # no se generan: ver el fichero
ILEGIBLE = list(_CORR['ilegible'])

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
        cod = re.match(r'(?i)^TF-?(\d+)$', crudo)
        if cod:
            out.append('TF-%s' % cod.group(1))
            continue
        if crudo.upper() in SIGLAS or re.match(r'^(?:[A-ZÁ-Ú]\.)+$', p) \
           or re.match(r'^\d', crudo):
            out.append(p if p.isupper() or '.' in p else p.upper())
            continue
        # Una abreviatura con barra se queda en mayusculas: «S/C» es Santa Cruz y
        # no se despliega (seria interpretar), pero «S/c» no es nada.
        trozo = '-'.join(t.upper() if '/' in t else
                         ACENTOS.get(llano(t), t[:1].upper() + t[1:].lower())
                         for t in p.split('-'))
        if out and llano(out[-1]) == llano(trozo):
            continue                       # «CARRETERA CARRETERA»
        # Dos tipos de via seguidos: el de verdad es el segundo. «CR AUTOPISTA
        # DEL NORTE» es la autopista; «CALLE AVENIDA DE LOS PUEBLOS», la avenida;
        # «CALLE BULEVAR CHAJOFE», el bulevar. No se inventa nada: se quita una
        # palabra que sobra y todo lo que queda sigue saliendo del registro.
        TIPOS = ('calle', 'avenida', 'carretera', 'autopista', 'autovia', 'bulevar',
                 'camino', 'paseo', 'plaza', 'glorieta', 'via')
        if len(out) == 1 and llano(out[0]) in TIPOS and llano(trozo) in TIPOS \
           and llano(trozo) != llano(out[0]):
            out[0] = trozo
            continue
        if out and llano(trozo) == llano(out[0]) and llano(trozo) in (
                'autopista', 'autovía', 'autovia', 'carretera', 'calle', 'avenida'):
            continue       # «AUTOPISTA TF1 AUTOPISTA SUR»: el tipo de via, otra vez
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
    for malo in ILEGIBLE:             # no se corrige: se corta
        t = t.split(malo)[0]
    # Las abreviaturas con punto se desatan ANTES de cortar por el punto. Sin
    # esto «PG IND. AÑAZA PARC-39» se quedaba en «Polígono IND»: el punto de
    # «IND.» parecia el final de una frase. Y se desatan CON un espacio detras:
    # el registro las pega («CTRA.GRAL.ADEJE», «CRA.GRAL.LA ZAMORA») y sin el
    # espacio salia «Carreteragral.adeje».
    for corto, largo in (('IND.', 'INDUSTRIAL'), ('CTRA.', 'CARRETERA'),
                         ('CRA.', 'CARRETERA'), ('GRAL.', 'GENERAL'),
                         ('AVDA.', 'AVENIDA'), ('POL.', 'POLIGONO')):
        t = re.sub(r'(?i)\b%s\s*' % re.escape(corto), largo + ' ', t)
    # Y cualquier otra abreviatura de VIAL escrita con punto: «CRTRA. VALLE SAN
    # LORENZO» se quedaba en «Carretera» a secas, porque el punto de «CRTRA.»
    # parecia el final de una frase y se comia el resto.
    for corto, largo in VIAL.items():
        if not corto.endswith('.') and corto.isalpha():
            t = re.sub(r'(?i)\b%s\.\s*' % re.escape(corto), largo.upper() + ' ', t)
    t = re.sub(r'(?i)\bTF\s+(\d+)', r'TF-\1', t)      # «TF 154» es la TF-154
    t = re.split(r'(?i)\s+MANZ\b', t)[0]              # la manzana, como la parcela
    # La urbanizacion y la parcela son el barrio y el numero, no la calle.
    t = re.split(r'(?i)[\s,-]*\b(URB|PARC|BARRIO|BLOQUE)\b\.?', t)[0]
    t = re.sub(r'(?i)\s*KM\.?\s*[\d,\.-]*.*$', '', t)  # desde «KM.» hasta el final
    t = re.sub(r'(?i)\.?\s*\bPK\b.*$', '', t)            # «.PK 38.8»: punto kilometrico
    t = re.split(r'\s{2}EN\s{2}|\s+EN\s{2}|\s{2}EN\s+', t)[0]  # el separador raro
    t = dar_vuelta(t)
    t = re.split(r'[(]', t)[0]        # el parentesis, cerrado o no: es el barrio
    t = dar_vuelta(t)                 # «AVENIDA PASO EL (LOS MAJUELOS)» -> «EL PASO»
    # Bloques de parcela: no son la calle y alargan el nombre del pin. Van ANTES
    # del corte por coma, porque «MZ. 13» lleva punto dentro.
    t = re.split(r'(?i)\s+(MZ|PC|PARCELA|FINCA|NAVE|LOCAL|EDIF)\.?\s*\d', t)[0]
    t = re.split(r',', t)[0]          # detras de la coma va el numero, no la via
    t = re.split(r'(?i)\s+N[º°O]\.?\s*\d', t)[0]   # «... LAS GALLETAS Nº2»: el numero
    t = re.split(r'\.\s+(?=[A-ZÁ-Ú])', t)[0]   # «TEJINA DE GUIA. GUIA DE ISORA»
    # «S7N» es como el registro escribe «S/N» en una de ellas.
    t = re.split(r'(?i)\s+S[/.]?7?N\.?\b', t)[0]   # «S/N», «S.N.», «S7N»
    t = re.sub(r'\s*-\s*', '-', t)   # «SANTA CRUZ - SAN ANDRES» y «SANTA CRUZ-SAN
    #                                 ANDRES» son la misma via escrita de dos formas
    r = municipios_bien(titulo(t.strip(' ,.-')))
    return _ACENTOS.get(llano(r), r)


# Los municipios se escriben como los escribe el Cabildo, no como el registro.
# El registro va sin acentos («GUIMAR», «ICOD»): cuando el nombre de un municipio
# aparece dentro del texto de la calle se le pone la grafia oficial. Es una
# correccion CON FUENTE, no un acento adivinado. Los nombres de persona de las
# calles se dejan como los escribe el registro: ahi no tengo fuente.
_MUNIS = None
_ACENTOS = {}


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


def tiene_adblue(e):
    return bool((e.get('Precio Adblue') or '').strip())


def combustibles(e):
    """Los que el registro trae con precio. El campo vacio = no lo sirve.

       El registro tiene 23 campos de precio. En Tenerife traen dato 9: estos
       8 combustibles y el AdBlue, que es un aditivo y no va en «Combustibles».
       La plantilla miraba solo 5 y se dejaba el diesel renovable (39
       estaciones), la gasolina 95 premium (2) y el gas natural comprimido (1):
       lo cazo tools/revisar_gasolineras.py, que falla si un campo con dato no
       sabe nombrarlo."""
    hay = []
    for campo, clave in [('Precio Gasolina 95 E5', 'g95'),
                         ('Precio Gasolina 95 E5 Premium', 'g95p'),
                         ('Precio Gasolina 98 E5', 'g98'),
                         ('Precio Gasoleo A', 'gasoleo'),
                         ('Precio Gasoleo Premium', 'premium'),
                         ('Precio Diésel Renovable', 'renovable'),
                         ('Precio Gases licuados del petróleo', 'glp'),
                         ('Precio Gas Natural Comprimido', 'gnc')]:
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


def es_autopista(direccion):
    """En la autopista o la autovia, segun el registro. Tambien cuando la escribe
       como «CR AUTOPISTA DEL NORTE, KM. 10,2»: sin eso esa BP de La Laguna se
       quedaba sin su km."""
    t = (direccion or '').strip()
    if re.match(r'(?i)^((CR|CRTRA|CARRETERA)\s+)?(AUTOPISTA|AUTOV[IÍ]A)\b', t):
        return True
    # «CARRETERA TF-1 KM. 54»: es autopista si ese km cae en el tramo que el
    # PROPIO REGISTRO llama autopista o autovia en esa via (ver _TRAMOS). No se
    # da por hecho que un TF entero sea autopista: el TF-5 deja de serlo en Los
    # Realejos, y la primera version de esta regla le ponia el km a dos
    # estaciones de La Guancha y San Juan de la Rambla que estan mas alla.
    m = re.match(r'(?i)^(CR|CRTRA|CARRETERA)\s+TF-?(\d+)\b', t)
    km = km_de(t)
    if m and km and m.group(2) in _TRAMOS:
        a, b = _TRAMOS[m.group(2)]
        return a <= float(km.replace(',', '.')) <= b
    return False


_TRAMOS = {}


def tramos_autopista(registro):
    """Via -> (km minimo, km maximo) de las estaciones que el registro escribe
       «AUTOPISTA TF-n» o «AUTOVIA TF-n» con su km. Es el tramo de autopista
       segun el registro, sin saber nada de carreteras por mi cuenta."""
    out = {}
    for x in registro:
        d = (x.get('Dirección') or '').strip()
        m = re.match(r'(?i)^(AUTOPISTA|AUTOV[IÍ]A)\s+(?:\w+\s+)?TF-?(\d+)\b', d)
        km = km_de(d)
        if m and km:
            k = float(km.replace(',', '.'))
            a, b = out.get(m.group(2), (k, k))
            out[m.group(2)] = (min(a, k), max(b, k))
    return out


def km_de(direccion):
    m = re.search(r'(?i)\bKM\.?\s*(\d+(?:[,\.]\d+)?)', direccion or '')
    return m.group(1) if m else None


def localidad_de(e, muni):
    """La localidad del registro, del derecho y sin el parentesis final cuando
       solo repite el municipio o la provincia: «PLAYA DE LAS AMERICAS (ARONA)»,
       «AEROPUERTO REINA SOFIA (SANTA CRUZ DE TENERIFE)». Si ES el municipio, con
       la grafia del Cabildo."""
    t = (e.get('Localidad') or '').strip()
    m = re.match(r'^(.*?)\s*\(([^)]+)\)$', t)
    if m and llano(m.group(2)) in (llano(muni), llano(e.get('Provincia'))):
        t = m.group(1)
    loc = titulo(dar_vuelta(t), via=False)
    return muni if llano(loc) == llano(muni) else loc


def direccion(e, muni):
    """La direccion del registro, para la linea 📍 de la ficha. El LEEME de las
       gasolineras la pedia («coordenadas, direccion y horario, del registro») y
       las primeras 104 fichas salieron sin ella: el nombre lleva la calle, pero
       no el numero ni el codigo postal. Lo encontro la revision de los bloques
       05 y 06. Va igual en los diez idiomas, como en las 94 fichas que ya la
       tenian: una direccion no se traduce."""
    raw = (e.get('Dirección') or '').strip()
    calle = calle_corta(raw)
    km = km_de(raw)
    # El portal es lo que va detras de la primera coma... quitando ANTES el km:
    # el registro escribe los km con coma decimal («KM. 38,8») y el decimal salia
    # como portal: «Icod-S/C, 8 km 38,8», «TF-333, 300 km 0,300».
    sin_km = re.sub(r'(?i)(\.?\s*\bPK\b|\s*\bKM\b).*$', '', raw)
    m = re.match(r'^[^,]*,\s*(\d+[A-Za-z]?)\b', sin_km)   # el portal, si lo hay
    num = m.group(1) if m else None
    if num and km and num == km.split(',')[0]:
        num = None                     # «GUAZA,380 KM. 380»: el numero es el km
    t = calle + (', %s' % num if num else '') + (' km %s' % km if km else '')
    loc = localidad_de(e, muni)
    lugar = '%s %s' % ((e.get('C.P.') or '').strip(), loc)
    if llano(loc) != llano(muni):
        lugar += ', %s' % muni
    return '%s, %s' % (t, lugar.strip())


def ficha(e, muni, sufijo=''):
    """e es la estacion tal como viene del registro. muni, el del poligono."""
    municipios_bien('')            # deja _MUNIS cargado
    rot = (e.get('Rótulo') or '').strip()
    marca = marca_de(rot)
    base = marca or rotulo_corto(rot)
    calle = calle_corta(e.get('Dirección'))
    loc = localidad_de(e, muni)
    comb = combustibles(e)
    km = km_de(e.get('Dirección'))
    if es_autopista(e.get('Dirección')) and km:
        calle = '%s km %s' % (calle, km)
    nombre = '%s · %s' % (base, calle)
    if sufijo:
        # La localidad NO se usa para desempatar si es el nombre de OTRO
        # municipio. El registro pone «EL ROSARIO» de localidad en una estacion
        # que el poligono del Cabildo sitúa 599 m DENTRO de Santa Cruz: la ficha
        # se llamaba «... (El Rosario)» y afirmaba un municipio que no es el
        # suyo. Lo cazo el control del municipio. En ese caso se pasa al km.
        if llano(loc) != llano(muni) and llano(loc) in {llano(m) for m in _MUNIS}:
            sufijo = 'km'
        else:
            # Si la localidad ES el municipio, se escribe como lo escribe el
            # Cabildo: el registro pone «GUIMAR» y «SANTA URSULA», sin acento.
            nombre += ' (%s)' % (muni if llano(loc) == llano(muni) else loc)
    if sufijo == 'km':
        nombre = '%s · %s km %s' % (base, calle, km) if km and 'km ' not in calle \
                 else '%s · %s (%s)' % (base, calle, e['IDEESS'])
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
        'address': direccion(e, muni),
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
            if tiene_adblue(e):
                desc += '%s%sAdBlue%s' % (V['ademas'][L], V['dospuntos'][L], V['punto'][L])
        else:
            desc = '%s, %s.' % (calle, muni)
            sep = ' :' if L == 'fr' else ':'   # el frances deja espacio antes
            if fuel:
                desc += ' %s%s %s.' % (V['combustibles'][L], sep, fuel)
            if tiene_adblue(e):
                desc += ' %s%s AdBlue.' % (V['ademas'][L], sep)
        h, crudas = horario(e.get('Horario'), L)
        f['idiomas'][L] = {'desc': desc, 'cat': '%s · %s' % (V['gasolinera'][L], base),
                           'hours': h}
        if L == 'es':
            f['horas_crudas'] = crudas
    return f


def acentos_del_registro(calles):
    """llano(calle) -> la variante que el registro escribe con mas acentos."""
    mapa = {}
    for c in calles:
        k = llano(c)
        tildes = sum(1 for ch in c if ch not in llano(c))
        if k not in mapa or tildes > mapa[k][0]:
            mapa[k] = (tildes, c)
    return {k: v[1] for k, v in mapa.items()}


def cargar(seleccion=None):
    """Devuelve las fichas, ya resueltos los nombres que chocan."""
    import gasolineras as G
    reg, _ = G.cargar_registro()
    muni = {x['ideess']: x['municipio_poligono'] for x in reg}
    crudo = json.load(open(os.path.join(RAIZ, 'registro', 'gasolineras-canarias.json'),
                           encoding='utf-8-sig'))['ListaEESSPrecio']
    # Las que estan EN ESPERA no se generan nunca: asi ni un --rehacer las mete.
    mios = [x for x in crudo if str(x.get('IDEESS')) in muni
            and str(x.get('IDEESS')) not in EN_ESPERA]
    # Primero sin sufijo, para ver cual choca con cual. Son 2 de 212.
    # Tres pasadas: a secas, con la localidad y con el km. Lo que siga chocando
    # lleva el IDEESS, que es unico por definicion. De las 212 solo hacen falta
    # las tres pasadas para 4 estaciones, y el IDEESS para 2: dos REPSOL con la
    # misma direccion exacta («CARRETERA TF-1 KM. 54») a 83 m una de otra.
    # Primera pasada solo para saber como escribe el registro cada calle.
    global _ACENTOS, _TRAMOS
    _TRAMOS = tramos_autopista(mios)
    _ACENTOS = acentos_del_registro(
        [calle_corta(x.get('Dirección')) for x in mios])
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
