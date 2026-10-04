#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
revisar_gasolineras.py — cada ficha de gasolinera, contra el registro, campo a campo.

    python3 tools/revisar_gasolineras.py                       todas las enlazadas
    python3 tools/revisar_gasolineras.py "Santa Cruz de Tenerife" "San Cristóbal de La Laguna"

ES INDEPENDIENTE A PROPOSITO
  No importa NADA de gasolinera_ficha.py. Lee el registro crudo del MITECO y las
  fichas tal como estan en index.html y en los diez idiomas, y compara. Si usara
  las funciones de la plantilla, solo comprobaria que la plantilla esta de
  acuerdo consigo misma.

QUE MIRA, EN CADA FICHA
  coordenada    la del registro, al millonesimo
  municipio     el de la ficha es el que dice el registro
  horario       el castellano sale del «Horario» del registro; en los otros
                nueve, ni una letra de dia en castellano y las mismas cifras
  combustibles  los que nombra la ficha son EXACTAMENTE los campos de precio que
                traen dato. Un campo con dato que nadie sabe nombrar es FALLO.
  nombre        cada palabra sale del registro (rotulo, direccion, localidad,
                municipio) o del vocabulario de vias. Nada inventado.
  direccion     con su CP, cada palabra del registro, y el km de un parentesis
                («(CTRA. GRAL. DEL SUR km 4)») con su carretera, no con la calle
  marca         el segundo trozo del «cat» esta en el rotulo
  precios       ni un precio ni un «€» en ningun texto
  idiomas       desc, cat y hours en los diez, y el polaco fuente = pl.json
Y POR MUNICIPIO
  cada estacion del registro tiene UNA ficha, ni cero ni dos
  ningun par de gasolineras a menos de 20 m
"""
import json
import math
import os
import re
import subprocess
import sys
import unicodedata

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDIOMAS = ['en', 'fr', 'de', 'it', 'nl', 'zh', 'zht', 'bg', 'pl']

# Campo de precio del registro -> como lo nombra el castellano de la ficha.
# AdBlue no esta: es un aditivo, no un combustible. Va aparte, en «Además:
# AdBlue.», y se mira por separado.
NOMBRE = {
    'Precio Gasolina 95 E5': 'gasolina 95',
    'Precio Gasolina 95 E5 Premium': 'gasolina 95 premium',
    'Precio Gasolina 98 E5': 'gasolina 98',
    'Precio Gasoleo A': 'gasóleo A',
    'Precio Gasoleo Premium': 'gasóleo premium',
    'Precio Diésel Renovable': 'diésel renovable',
    'Precio Gases licuados del petróleo': 'GLP',
    'Precio Gas Natural Comprimido': 'gas natural comprimido',
}
NO_ES_COMBUSTIBLE = {'Precio Adblue'}
# Palabras que la ficha puede tener sin que esten escritas asi en el registro:
# el tipo de via desatado (CR -> Carretera...) y el km.
VIAS = set('carretera poligono general industrial calle avenida autopista autovia '
           'km via urbanizacion plaza camino paseo glorieta moeve'.split())
ES_DIAS = re.compile(r'(?<![A-Za-zÀ-ÿ])[LMXJVSD](?:-[LMXJVSD])?(?![A-Za-zÀ-ÿ])')


def llano(s):
    s = unicodedata.normalize('NFD', (s or '').lower())
    return ''.join(c for c in s if unicodedata.category(c) != 'Mn')


def piezas(s):
    return re.findall(r'[a-z]+|\d+', llano(s))


def metros(a, b, c, d):
    R = 6371000.0
    p1, p2 = math.radians(a), math.radians(c)
    dp, dl = math.radians(c - a), math.radians(d - b)
    h = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * R * math.asin(math.sqrt(h))


def muni_registro(s):
    t = (s or '').strip()
    m = re.match(r'^(.*?)\s*\((El|La|Los|Las)\)$', t, re.I)
    return '%s %s' % (m.group(2), m.group(1)) if m else t


def horario_es(txt):
    out = []
    for tramo in (txt or '').split(';'):
        tramo = tramo.strip()
        if not tramo:
            continue
        cod, hora = [x.strip() for x in tramo.split(':', 1)]
        hora = '24 h' if hora.upper() == '24H' else re.sub(r'(^|-)(\d):', r'\g<1>0\2:', hora)
        out.append('%s %s' % (cod, hora))
    return ' · '.join(out)


def num(x):
    return float(str(x).replace(',', '.'))


def fichas_app():
    js = ("const{PLACES}=require('./tools/cargar');console.log(JSON.stringify("
          "PLACES.filter(p=>p.category==='gasolinera').map(p=>({id:p.id,name:p.name,"
          "lat:p.lat,lng:p.lng,ideess:p.ideess||null,tags:p.tags||[],address:p.address||null,"
          "desc:p.desc&&p.desc.es,cat:p.cat&&p.cat.es,hours:p.hours&&p.hours.es}))))")
    o = subprocess.run(['node', '-e', js], cwd=RAIZ, capture_output=True, text=True)
    if o.returncode:
        sys.exit(o.stderr.strip())
    return json.loads(o.stdout)


def main():
    sel = [llano(m) for m in sys.argv[1:]]
    reg = json.load(open(os.path.join(RAIZ, 'registro', 'gasolineras-canarias.json'),
                         encoding='utf-8-sig'))
    porid = {str(x['IDEESS']): x for x in reg['ListaEESSPrecio']}
    app = fichas_app()
    idi = {L: json.load(open(os.path.join(RAIZ, 'idiomas', L + '.json'), encoding='utf-8'))
           for L in IDIOMAS}
    plf = json.load(open(os.path.join(RAIZ, 'idiomas', 'pl-lugares', '10-gasolineras.json'),
                         encoding='utf-8'))
    print('registro del %s · %d fichas de gasolinera en la app' % (reg.get('Fecha'), len(app)))
    corr = json.load(open(os.path.join(RAIZ, 'datos', 'gasolineras', 'correcciones-registro.json'),
                          encoding='utf-8'))
    erratas = corr.get('erratas', {})
    # Horarios de UN dia («L: 24H», solo el lunes) que Jerome comprobo: valen solo
    # mientras el registro siga diciendo exactamente lo que se corrigio.
    def hor(e):
        c = corr.get('horarios', {}).get(str(e['IDEESS']))
        return c['se_escribe'] if c and c['registro'] == e['Horario'].strip() else e['Horario']
    glos = [json.load(open(os.path.join(RAIZ, 'idiomas', 'etiquetas', '%s.json' % L), encoding='utf-8'))
            for L in IDIOMAS]
    fav = os.path.join(RAIZ, 'datos', 'gasolineras', 'avisos.json')
    avisos = {k: x for k, x in json.load(open(fav, encoding='utf-8')).items()
              if k != '_'} if os.path.exists(fav) else {}

    fallos, mirados = [], 0
    def mal(fid, que):
        fallos.append((fid, que))

    nuevas = [p for p in app if p['ideess'] and p['id'].startswith('gas-%s-' % p['ideess'])]
    for p in nuevas:
        e = porid.get(p['ideess'])
        if e is None:
            mal(p['id'], 'su IDEESS %s NO esta en el registro' % p['ideess'])
            continue
        muni = muni_registro(e['Municipio'])
        if sel and llano(muni) not in sel:
            continue
        mirados += 1
        # coordenada
        d = metros(p['lat'], p['lng'], num(e['Latitud']), num(e['Longitud (WGS84)']))
        if d > 0.2:
            mal(p['id'], 'coordenada a %.1f m de la del registro' % d)
        # municipio
        if not any(llano(t) == llano(muni) for t in p['tags']):
            mal(p['id'], 'el registro dice municipio «%s» y las etiquetas %s' % (muni, p['tags']))
        if llano(muni) not in llano(p['desc']):
            mal(p['id'], 'el desc no nombra su municipio «%s»' % muni)
        # horario castellano
        esperado = horario_es(hor(e))
        if p['hours'] != esperado:
            mal(p['id'], 'horario «%s», el registro da «%s»' % (p['hours'], esperado))
        cifras = sorted(re.findall(r'\d', esperado))
        # combustibles
        con = {k for k in e if k.startswith('Precio') and (e[k] or '').strip()}
        raros = con - set(NOMBRE) - NO_ES_COMBUSTIBLE
        for k in sorted(raros):
            mal(p['id'], 'el registro trae «%s» y la revision no sabe nombrarlo' % k)
        debe = {NOMBRE[k] for k in con if k in NOMBRE}
        m = re.search(r'Combustibles: ([^.]*)\.', p['desc'] or '')
        dice = set(re.split(r', | y ', m.group(1))) if m else set()
        if dice != debe:
            if debe - dice:
                mal(p['id'], 'le FALTA: %s' % ', '.join(sorted(debe - dice)))
            if dice - debe:
                mal(p['id'], 'le SOBRA: %s' % ', '.join(sorted(dice - debe)))
        # AdBlue: lo dice quien lo vende y SOLO quien lo vende
        vende = bool((e.get('Precio Adblue') or '').strip())
        dice_ad = 'AdBlue' in (p['desc'] or '')
        if vende and not dice_ad:
            mal(p['id'], 'el registro dice que vende AdBlue y la ficha no')
        if dice_ad and not vende:
            mal(p['id'], 'la ficha dice AdBlue y el registro no lo trae')
        # nombre: nada inventado
        fuente = set(piezas(' '.join([e['Rótulo'], e['Dirección'], e['Localidad'],
                                      muni, e['IDEESS']]))) | VIAS
        # Lo que trae una errata corregida con fuente y OK de Jerome tambien
        # sale «del registro»: del registro corregido, y esta documentado.
        for malo, x in erratas.items():
            if malo in e['Dirección']:
                fuente |= set(piezas(x['se_escribe']))
        # El campo Margen (D / I) es del registro: «margen derecho» o «izquierdo»,
        # el que diga ESTA estacion, nunca el otro.
        fuente |= set(piezas({'D': 'margen derecho', 'I': 'margen izquierdo'}.get(
            (e.get('Margen') or '').strip(), '')))
        for w in piezas(p['name']):
            if w not in fuente:
                mal(p['id'], 'el nombre lleva «%s», que no sale del registro' % w)
        # direccion: la pedia el LEEME y las primeras 104 salieron sin ella
        cp = (e.get('C.P.') or '').strip()
        kc = corr.get('cp', {}).get(str(e['IDEESS']))
        if kc and kc['registro'] == cp:     # corregido con fuente: ver correcciones-registro.json
            cp = kc['se_escribe']
        if not p.get('address'):
            mal(p['id'], 'no tiene direccion')
        else:
            if cp not in p['address']:
                mal(p['id'], 'la direccion no lleva su codigo postal %s' % cp)
            fuente_d = fuente | set(piezas(e.get('Provincia'))) | set(piezas(cp))
            for w in piezas(p['address']):
                if w not in fuente_d:
                    mal(p['id'], 'la direccion lleva «%s», que no sale del registro' % w)
            # Si el registro pone el km DENTRO de un parentesis con otra carretera
            # («C/ LA CAMPANA, S/N (CTRA. GRAL. DEL SUR km 4)»), ese km no es de la
            # calle: la direccion no puede pegarlo detras de ella, fuera del parentesis.
            if re.search(r'\(\s*(CTRA|CARRETERA|CRTA|CR|GRAL|GENERAL|AUTOPISTA|AUTOVIA|TF)\b'
                         r'[^()]*\b(KM|PK)\b', e['Dirección'], re.I) and \
               re.search(r'\bkm\b', p['address']) and \
               not re.search(r'\([^()]*\bkm\b[^()]*\)', p['address']):
                mal(p['id'], 'el km del registro es de la carretera del parentesis y '
                             'la direccion se lo pone a la calle')
        # Ningun nombre propio de la ficha (marca, municipio) como etiqueta si el
        # glosario lo traduce como otra cosa: «Océano» salia «海洋».
        for tg in p['tags']:
            if tg in (muni, ((p['cat'] or '').split(' · ') + [''])[1]) and \
               any(tg in g and g[tg] != tg for g in glos):
                mal(p['id'], 'la etiqueta «%s» es un nombre propio y el glosario la traduce' % tg)
        # marca
        trozos = (p['cat'] or '').split(' · ')
        av = avisos.get(p['ideess'])
        primero = av['cat']['es'] if av else 'Gasolinera'
        if av and not (p['desc'] or '').startswith(av['desc']['es']):
            mal(p['id'], 'tiene aviso en avisos.json y la descripcion no empieza por el')
        if len(trozos) != 2 or trozos[0] != primero:
            mal(p['id'], 'cat raro: «%s»' % p['cat'])
        elif not set(piezas(trozos[1])) <= (set(piezas(e['Rótulo'])) | {'moeve'}):
            mal(p['id'], 'la marca «%s» no esta en el rotulo «%s»' % (trozos[1], e['Rótulo']))
        # idiomas
        for L in IDIOMAS:
            t = idi[L].get(p['id'])
            if not t or not all((t.get(c) or '').strip() for c in ('desc', 'cat', 'hours')):
                mal(p['id'], '%s: le falta desc, cat u hours' % L)
                continue
            if ES_DIAS.search(t['hours']):
                mal(p['id'], '%s: dia en castellano en «%s»' % (L, t['hours']))
            if sorted(re.findall(r'\d', t['hours'])) != cifras:
                mal(p['id'], '%s: horario con otras cifras: «%s»' % (L, t['hours']))
            if vende != ('AdBlue' in t['desc']):
                mal(p['id'], '%s: el AdBlue no cuadra con el castellano' % L)
            todo = ' '.join(t.values())
            if '€' in todo or re.search(r'\d[,.]\d{3}\b', todo):
                mal(p['id'], '%s: parece un precio' % L)
        if plf.get(p['id']) != idi['pl'].get(p['id']):
            mal(p['id'], 'pl.json no es lo que dice idiomas/pl-lugares')
        if '€' in (p['desc'] or '') + (p['name'] or ''):
            mal(p['id'], 'un precio en castellano')

    espera = json.load(open(os.path.join(RAIZ, 'datos', 'gasolineras',
                                         'correcciones-registro.json'),
                            encoding='utf-8')).get('en_espera', {})
    # Las fichas ANTIGUAS enlazadas por su ideess: su texto es el de antes y se
    # rehace en la sesion 91, pero el ENLACE se mira ya. Contaban como «estacion
    # con su ficha» sin que nadie comprobara que el enlace fuera bueno.
    viejas = [p for p in app if p['ideess'] and p not in nuevas]
    for p in viejas:
        e = porid.get(p['ideess'])
        if e is None:
            mal(p['id'], 'enlazada a %s, que NO esta en el registro' % p['ideess'])
            continue
        muni = muni_registro(e['Municipio'])
        if sel and llano(muni) not in sel:
            continue
        d = metros(p['lat'], p['lng'], num(e['Latitud']), num(e['Longitud (WGS84)']))
        rot = set(piezas(e['Rótulo'])) | ({'cepsa', 'moeve'} if {'cepsa', 'moeve'} & set(piezas(e['Rótulo'])) else set())
        marca = rot & set(piezas(p['name'])) & {'bp', 'disa', 'repsol', 'shell', 'cepsa', 'moeve',
                                                   'tgas', 'pcan', 'plenergy', 'oceano', 'petroprix'}
        # Sin marca en el rotulo: vale que el nombre propio del rotulo este en el
        # nombre de la ficha («ESTACIÓN ABADES KM 44» / «Estación Abades (TF-1
        # km 44)»). Escrito aqui otra vez, no importado: el revisor es aparte.
        GEN = set('estacion estaciones servicio servicios es e s de del la el los las km sl sa'.split())
        rotulo_sin_marca = not (rot & {'bp', 'disa', 'repsol', 'shell', 'cepsa', 'moeve', 'tgas',
                                       'pcan', 'plenergy', 'oceano', 'petroprix'})
        propio = {w for w in piezas(e['Rótulo']) if not w.isdigit()} - GEN
        if rotulo_sin_marca and propio and propio <= set(piezas(p['name'])):
            marca = propio
        print('  antigua enlazada: %-22s -> %s a %.0f m, %s' % (
            p['id'], p['ideess'], d, ('misma marca' if not rotulo_sin_marca else 'sin marca, mismo nombre')
            if marca else 'MARCA DISTINTA O SIN MARCA'))
        if d > 150:     # LEEME: <=150 m, confirmada; 150-300 m se corrige la coordenada
            mal(p['id'], 'enlazada a %s, que esta a %.0f m' % (p['ideess'], d))
        # Su horario tambien sale del registro: el nombre y la descripcion se
        # rehacen en la sesion 91, pero un horario falso no espera. «Repsol TF-1
        # Granadilla» decia 24 h y el registro dice 06:00 a 00:00.
        esperado = horario_es(hor(e))
        if p['hours'] != esperado:
            mal(p['id'], 'horario «%s», el registro da «%s»' % (p['hours'], esperado))
        cifras = sorted(re.findall(r'\d', esperado))
        for L in IDIOMAS:
            h = (idi[L].get(p['id']) or {}).get('hours') or ''
            if ES_DIAS.search(h) or sorted(re.findall(r'\d', h)) != cifras:
                mal(p['id'], '%s: horario «%s» no cuadra con el registro' % (L, h))
        if not marca:
            mal(p['id'], 'enlazada a %s («%s») y su nombre no dice esa marca' % (p['ideess'], e['Rótulo']))

    # por municipio: cada estacion UNA ficha; las que estan en espera, NINGUNA
    enlaz = {}
    for p in app:
        if p['ideess']:
            enlaz.setdefault(p['ideess'], []).append(p['id'])
    munis = sorted({muni_registro(x['Municipio']) for x in porid.values()
                    if llano(muni_registro(x['Municipio'])) in sel}) if sel else []
    for mu in munis:
        ests = [x for x in porid.values() if llano(muni_registro(x['Municipio'])) == llano(mu)
                and x.get('Tipo Venta') == 'P']
        for x in ests:
            n = enlaz.get(str(x['IDEESS']), [])
            debe = 0 if str(x['IDEESS']) in espera else 1
            if len(n) != debe:
                mal('(%s)' % mu, 'la estacion %s tiene %d fichas %s%s' % (
                    x['IDEESS'], len(n), n, ' y esta EN ESPERA' if debe == 0 else ''))
        ne = sum(1 for x in ests if str(x['IDEESS']) in espera)
        print('  %-28s %2d estaciones del registro, %2d con su ficha%s' % (
            mu, len(ests), sum(1 for x in ests if len(enlaz.get(str(x['IDEESS']), [])) == 1),
            ', %d en espera' % ne if ne else ''))
    # pares demasiado cerca
    for i, a in enumerate(app):
        for b in app[i + 1:]:
            d = metros(a['lat'], a['lng'], b['lat'], b['lng'])
            if d < 20:
                mal(a['id'], 'a %.0f m de %s' % (d, b['id']))

    # Un horario de UN solo dia («L: 24H») casi seguro que es un fallo del registro:
    # no se arregla solo (el LEEME manda el registro), pero se ve, con su ficha.
    for p in app:
        e = porid.get(p['ideess'] or '')
        if e and re.fullmatch(r'[LMXJVSD]: .*', hor(e).strip()):
            print('  aviso: %s, el registro da un solo dia («%s»), sin comprobar'
                  % (p['id'], e['Horario'].strip()))
    print('  fichas revisadas campo a campo .............. %d' % mirados)
    print('  hallazgos ................................... %d' % len(fallos))
    for f, q in fallos:
        print('    %-40s %s' % (f, q))
    if fallos:
        print('\n  Si el registro se acaba de volver a descargar, lo normal es que una')
        print('  estacion haya cambiado de horario o de combustibles. El remedio es')
        print('  re-sincronizar su municipio desde el registro, no tocar la ficha a mano:')
        print('      python3 tools/gasolinera_alta.py "<municipio>" --rehacer')
    return 1 if fallos else 0


if __name__ == '__main__':
    sys.exit(main())
