#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
verificar_bloques.py — verificacion de las sesiones 00 a 31 de las gasolineras,
bloque a bloque, contra TODO lo que pide el LEEME y lo que se ha ido aprendiendo.

    python3 tools/verificar_bloques.py            informe en pantalla
    python3 tools/verificar_bloques.py --md F     y ademas en el fichero F

POR QUE OTRA HERRAMIENTA
  revisar_gasolineras.py mira cada ficha campo a campo contra el registro, y la
  auditoria mira la app. Pero cada revision de bloques encontro algo que ninguna
  de las dos miraba (un km fuera de orden, un CP de otro municipio, un «TF-82»
  que no era la TF-82, un horario de un solo dia, un horario que no se pintaba).
  Esto junta todas esas pruebas y las pasa a los 212 de una vez, para poder
  repetirlas cada vez que se descargue un registro nuevo.

QUE MIRA (cada prueba dice de donde sale)
  LEEME       venta al publico; Cepsa siempre como Moeve; ningun telefono; ni
              precios ni valoraciones; comillas ASCII; IDEESS en cada ficha;
              el municipio del poligono = el del registro; cada captura de
              Jerome acaba en una ficha.
  cobertura   cada estacion del registro, UNA ficha; ninguna ficha sin estacion.
  revisor     revisar_gasolineras.py, que no importa nada de la plantilla.
  plantilla   cada ficha generada es EXACTAMENTE lo que la plantilla genera hoy,
              en los diez idiomas: ningun cambio de regla sin aplicar.
  antiguas    las 14 de antes: enlazadas a <=150 m, misma marca, horario y
              direccion del registro. Lo que su nombre o su texto dice de mas,
              para la sesion 91.
  osm         (contraste, NUNCA fuente) via rodada cerca del pin; la marca de la
              gasolinera de OSM mas cercana; y el codigo de carretera del NOMBRE
              tiene que ser una carretera que pase junto al pin («Solo me gusta
              cuando ponen tf1 cuando esta en la tf1»).
  km          por carretera, los km del registro en orden con la distancia.
  cp          un mismo CP en dos municipios lejanos.
  horario     de un solo dia sin comprobar, o con algun dia sin abrir.
  vecinos     otra ficha de la app a menos de 25 m.
  sesiones    sesiones.json dice lo mismo que la app.
  bloque 00   el vocabulario de la plantilla, en los diez idiomas.

  No escribe nada en el repo salvo, si se pide, el informe --md.
"""
import collections
import json
import math
import os
import re
import subprocess
import sys
import unicodedata

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(RAIZ, 'tools'))
import gasolineras as GR          # noqa: E402
import gasolinera_ficha as F      # noqa: E402
import osm_cerca as O             # noqa: E402
import geofabrik_cerca as GF      # noqa: E402

IDIOMAS = ['es', 'en', 'fr', 'de', 'it', 'nl', 'zh', 'zht', 'bg', 'pl']
DG = os.path.join(RAIZ, 'datos', 'gasolineras')
MARCAS_OSM = ['moeve', 'cepsa', 'disa', 'repsol', 'shell', 'bp', 'tgas', 'pcan', 'plenergy',
              'galp', 'oceano', 'h2go', 'petroprix', 'ballenoil', 'esergui', 'avia']


def llano(s):
    s = unicodedata.normalize('NFD', s or '')
    return ''.join(c for c in s if unicodedata.category(c) != 'Mn').lower().strip()


def metros(a, b, c, d):
    return GF.metros(a, b, c, d)


def app_gasolineras():
    js = ("const{PLACES}=require('./tools/cargar');console.log(JSON.stringify(PLACES.map(p=>({"
          "id:p.id,category:p.category,name:p.name,lat:p.lat,lng:p.lng,ideess:p.ideess||null,"
          "address:p.address||null,hours:p.hours||null,desc:p.desc||null,cat:p.cat||null,"
          "tags:p.tags||[],phone:p.phone||null,color:p.color||null,emoji:p.emoji||null}))))")
    o = subprocess.run(['node', '-e', js], cwd=RAIZ, capture_output=True, text=True)
    if o.returncode:
        sys.exit(o.stderr.strip())
    return json.loads(o.stdout)


def revisor(munis):
    o = subprocess.run(['python3', os.path.join(RAIZ, 'tools', 'revisar_gasolineras.py')] + munis,
                       cwd=RAIZ, capture_output=True, text=True)
    cob, fallos, avisos, en = {}, [], [], False
    for ln in o.stdout.splitlines():
        m = re.match(r'^\s{2}(\S.*?)\s+(\d+) estaciones del registro,\s+(\d+) con su ficha', ln)
        if m:
            cob[m.group(1).strip()] = (int(m.group(2)), int(m.group(3)))
        if 'aviso:' in ln:
            avisos.append(ln.strip())
        if re.match(r'^\s+hallazgos \.+ \d+', ln):
            en = True
            continue
        if en and re.match(r'^\s{4}\S', ln):
            fallos.append(ln.strip())
    return cob, fallos, avisos, o.returncode


def codigos(nombre):
    """Codigos de carretera de un nombre: «TF-82», «C-820»."""
    return re.findall(r'\b((?:TF|C)-\d+)\b', nombre or '')


def main():
    md = sys.argv[sys.argv.index('--md') + 1] if '--md' in sys.argv else None
    out = []

    def P(s=''):
        print(s)
        out.append(s)

    reg, discrepan = GR.cargar_registro()
    porid = {e['ideess']: e for e in reg}
    crudo = {str(x['IDEESS']): x for x in json.load(open(os.path.join(RAIZ, 'registro', 'gasolineras-canarias.json'),
                                                        encoding='utf-8-sig'))['ListaEESSPrecio']}
    gen = {g['ideess']: g for g in F.cargar()}
    todas = app_gasolineras()
    app = [p for p in todas if p['category'] == 'gasolinera']
    otras = [p for p in todas if p['category'] != 'gasolinera']
    idi = {L: json.load(open(os.path.join(RAIZ, 'idiomas', L + '.json'), encoding='utf-8'))
           for L in IDIOMAS if L != 'es'}
    ses = json.load(open(os.path.join(DG, 'sesiones.json'), encoding='utf-8'))['sesiones']
    corr = json.load(open(os.path.join(DG, 'correcciones-registro.json'), encoding='utf-8'))
    cap = json.load(open(os.path.join(DG, 'capturas_google.json'), encoding='utf-8'))['capturas']

    def texto(p, campo, L):
        v = p.get(campo) or {}
        if L == 'es':
            return v.get('es')
        return (idi[L].get(p['id']) or {}).get(campo) or v.get(L)

    def es_generada(p):
        return bool(p['ideess']) and p['id'].startswith('gas-%s-' % p['ideess'])

    # ---------------------------------------------------------------- por bloque
    muni_de = {}                                   # id de ficha -> municipio del poligono
    for p in app:
        if p['ideess'] in porid:
            muni_de[p['id']] = porid[p['ideess']]['municipio_poligono']
    bloque = {}                                    # municipio -> clave de sesion
    for k, v in ses.items():
        if v.get('municipio'):
            bloque[v['municipio']] = k
    H = collections.defaultdict(list)              # clave de sesion -> hallazgos
    I = collections.defaultdict(list)              # clave de sesion -> para mirar (no fallos)

    def de(p_o_e):
        mu = muni_de.get(p_o_e) if isinstance(p_o_e, str) else p_o_e.get('municipio_poligono')
        return bloque.get(mu, '??')

    # LEEME ------------------------------------------------------------------
    for e in reg:
        if e['municipio_poligono'] and GR.muni_llano(e['municipio_poligono']) != GR.muni_llano(e['municipio_registro']):
            H[de(e)].append('LEEME: %s, el poligono dice %s y el registro %s' % (e['ideess'], e['municipio_poligono'], e['municipio_registro']))
        if (crudo[e['ideess']].get('Tipo Venta') or 'P') != 'P':
            H[de(e)].append('LEEME: %s no es de venta al publico' % e['ideess'])
    for p in app:
        b = de(p['id'])
        # Las 14 antiguas rehacen nombre y texto en la sesion 91 («Cambialo cuando
        # es turno por las antiguas fichas»): lo suyo se apunta para alli, no falla.
        R = H if es_generada(p) else I
        n91 = '' if es_generada(p) else ' · para la 91'
        if not p['ideess']:
            H[b].append('LEEME: %s no lleva IDEESS' % p['id'])
        if p['phone']:
            R[b].append('LEEME: %s lleva telefono %s, que no sale de ninguna captura ni tiene OK de Jerome (no se ensena)%s'
                        % (p['id'], p['phone'], n91))
        if '"' in (p['name'] or ''):
            H[b].append('LEEME: %s, comillas ASCII en el nombre' % p['id'])
        cepsa = [L for L in IDIOMAS if re.search(r'(?i)\bcepsa\b', ' '.join(filter(None, [
            p['name'], texto(p, 'desc', L), texto(p, 'cat', L)] + p['tags'])))]
        if cepsa:
            R[b].append('LEEME: %s dice «Cepsa» (es Moeve) en %d idioma(s)%s' % (p['id'], len(cepsa), n91))
        for L in IDIOMAS:
            t = ' '.join(filter(None, [p['name'], texto(p, 'desc', L), texto(p, 'cat', L), texto(p, 'hours', L)] + p['tags']))
            if re.search(r'€|\d+[,.]\d{3}\s*(€|eur)|★|valoraci|rese[nñ]a', t, re.I):
                H[b].append('LEEME: %s (%s) parece llevar un precio o una valoracion' % (p['id'], L))

    # cobertura -------------------------------------------------------------
    con = collections.defaultdict(list)
    for p in app:
        if p['ideess']:
            con[p['ideess']].append(p['id'])
    espera = set(corr.get('en_espera', {}))
    for e in reg:
        n = con.get(e['ideess'], [])
        debe = 0 if e['ideess'] in espera else 1
        if len(n) != debe:
            H[de(e)].append('cobertura: %s tiene %d fichas %s' % (e['ideess'], len(n), n))
    for p in app:
        if p['ideess'] and p['ideess'] not in porid:
            H[de(p['id'])].append('cobertura: %s lleva el IDEESS %s, que no esta en el registro' % (p['id'], p['ideess']))

    # revisor independiente --------------------------------------------------
    munis = sorted({v['municipio'] for v in ses.values() if v.get('municipio')})
    cob, fallos, avisos_rev, rc = revisor(munis)
    for f in fallos:
        fid = f.split()[0]
        H[de(fid) if fid in muni_de else bloque.get(fid.strip('()'), '??')].append('revisor: ' + f)
    for a in avisos_rev:
        fid = a.split()[1].rstrip(',')
        I[de(fid)].append('revisor: ' + a)

    # plantilla --------------------------------------------------------------
    for p in app:
        if not p['ideess']:
            continue
        g = gen.get(p['ideess'])
        if not g:
            H[de(p['id'])].append('plantilla: %s no sale de la plantilla' % p['id'])
            continue
        par = [('nombre', p['name'], g['name']), ('direccion', p['address'], g['address']),
               ('etiquetas', p['tags'], g['tags']), ('color', p['color'], g['color'])]
        # Las 14 antiguas (sesion 91) conservan su id y su pin; lo demas, igual.
        if es_generada(p):
            par += [('id', p['id'], g['id']), ('coordenada', (p['lat'], p['lng']), (g['lat'], g['lng']))]
        for c in ('desc', 'cat', 'hours'):
            for L in IDIOMAS:
                par.append(('%s.%s' % (c, L), texto(p, c, L), g['idiomas'][L][c]))
        for c, a, b in par:
            if a != b:
                H[de(p['id'])].append('plantilla: %s, %s: app «%s», plantilla «%s»' % (p['id'], c, a, b))

    # antiguas ---------------------------------------------------------------
    for p in app:
        if es_generada(p) or not p['ideess'] or p['ideess'] not in porid:
            continue
        e = porid[p['ideess']]
        b = de(p['id'])
        d = metros(p['lat'], p['lng'], e['lat'], e['lng'])
        if d > 150:
            H[b].append('antigua: %s a %.0f m de su estacion' % (p['id'], d))
        g = gen[p['ideess']]
        if (p['hours'] or {}).get('es') != g['idiomas']['es']['hours']:
            H[b].append('antigua: %s, horario «%s», registro «%s»' % (p['id'], (p['hours'] or {}).get('es'), g['idiomas']['es']['hours']))
        if p['address'] != g['address']:
            H[b].append('antigua: %s, direccion «%s», registro «%s»' % (p['id'], p['address'], g['address']))
        I[b].append('antigua: %s «%s» -> %s %s a %.0f m, con su id y su pin de siempre' % (p['id'], p['name'], p['ideess'], e['rotulo'].strip(), d))

    # osm --------------------------------------------------------------------
    E = GF.cargar()
    fuel = [x for x in (E if isinstance(E, list) else sum(E.values(), [])) if 'fuel' in x.get('fclass', [])]
    lejos_max = collections.defaultdict(float)
    for p in app:
        b = de(p['id'])
        V = O.vias((p['lat'], p['lng']), 160)
        rod = sorted(V.items(), key=lambda t: t[1][0])
        dmin = rod[0][1][0] if rod else 9e9
        lejos_max[b] = max(lejos_max[b], dmin)
        if dmin > 60:
            I[b].append('osm: %s, la via mas cercana a %.0f m' % (p['id'], dmin))
        refs = {}
        for (nom, ref, det), (d, q, kind) in rod:
            for r in (ref or '').replace(';', ' ').split():
                refs[r] = min(refs.get(r, 9e9), d)
        for c in codigos(p['name']):
            if c in corr.get('codigos_carretera', {}):
                I[b].append('osm: %s, «%s»: OSM no lo tiene, pero esta comprobado (correcciones-registro.json)' % (p['id'], c))
                continue
            if c.startswith('C-'):
                I[b].append('osm: %s, «%s» en el nombre es un codigo antiguo: OSM no lo tiene' % (p['id'], c))
                continue
            ok = [r for r in refs if r == c or (r.startswith(c) and not r[len(c)].isdigit())]
            if not ok:
                cerca = ', '.join('%s %.0f m' % (r, d) for r, d in sorted(refs.items(), key=lambda t: t[1])[:3])
                (H if es_generada(p) else I)[b].append(
                    'osm: %s se llama «%s» y no hay ninguna %s a menos de 160 m (cerca: %s)%s'
                    % (p['id'], p['name'], c, cerca or 'nada', '' if es_generada(p) else ' · para la 91'))
        if re.search(r'(?i)autopista|autov[ií]a|\bkm\b', p['name'] or ''):
            mot = [d for (nom, ref, det), (d, q, kind) in rod if det in ('motorway', 'motorway_link', 'trunk', 'trunk_link')
                   or re.search(r'(?i)autopista|autov[ií]a', nom or '')]
            if not mot and re.search(r'(?i)autopista|autov[ií]a', p['name'] or ''):
                (H if es_generada(p) else I)[b].append('osm: %s dice autopista y no hay ninguna a menos de 160 m' % p['id'])
        if p['ideess'] in porid:
            cer = sorted((metros(p['lat'], p['lng'], x['lat'], x['lng']), x) for x in fuel)
            if cer and cer[0][0] <= 60:
                mo = llano(cer[0][1]['name'])
                mm = ['moeve' if m == 'cepsa' else m for m in MARCAS_OSM if re.search(r'\b%s\b' % m, mo)]
                mr = llano(porid[p['ideess']]['rotulo'])
                mr = 'moeve' if 'cepsa' in mr else mr
                if mm and not any(m in mr for m in mm):
                    I[b].append('osm: %s, el registro dice «%s» y OSM, a %.0f m, «%s»'
                                % (p['id'], porid[p['ideess']]['rotulo'].strip(), cer[0][0], cer[0][1]['name']))

    # coordenada del registro: sin gasolinera de OSM en el pin, pero con una de
    # SU marca cerca que ninguna otra estacion del registro explica. Asi salio la
    # Moeve «Llano Azul» (Arona): su pin cae junto al Monkey Park, a 118 m de
    # cualquier via, y OSM tiene una Moeve a 496 m en su carretera. Contraste para
    # que Jerome lo mire; la coordenada no se toca sin fuente y su OK.
    for e in reg:
        if any(metros(e['lat'], e['lng'], x['lat'], x['lng']) <= 60 for x in fuel):
            continue
        mr = 'moeve' if 'cepsa' in llano(e['rotulo']) else llano(e['rotulo'])
        for x in fuel:
            d = metros(e['lat'], e['lng'], x['lat'], x['lng'])
            if d > 1500:
                continue
            mo = llano(x['name'])
            mm = ['moeve' if m == 'cepsa' else m for m in MARCAS_OSM if re.search(r'\b%s\b' % m, mo)]
            if not mm or not any(m in mr for m in mm):
                continue
            libre = min(metros(x['lat'], x['lng'], o['lat'], o['lng']) for o in reg)
            if libre > 250:
                I[de(e)].append('coordenada: %s (%s, «%s»): ninguna gasolinera de OSM en el pin; «%s», de su marca, '
                                'a %.0f m (%.6f, %.6f), sin ninguna estacion del registro a menos de %.0f m'
                                % (e['ideess'], e['rotulo'].strip(), e['direccion'].strip(), x['name'], d, x['lat'], x['lng'], libre))

    # km en orden ------------------------------------------------------------
    SERIES = [('TF-1', r'\bTF-?1\b(?![\d])|AUTOPISTA (DEL )?SUR|AUTOPISTA TENERIFE SUR'),
              ('TF-5', r'\bTF-?5\b(?![\d])|AUTOPISTA (DEL )?NORTE|AUTOPISTA NORTE|EL TORREON'),
              ('Carretera General del Norte / C-820', r'GENERAL DEL NORTE|GRAL\.? DEL\s+NORTE|GENERAL NORTE|C[- ]?820|ICOD-S/C|CARRETERA DEL NORTE'),
              ('Carretera General del Sur / C-822', r'GENERAL DEL SUR|GRAL\.? DEL SUR|C[- ]?822|TF-?28\b')]
    codigos_reg = collections.Counter(c for e in reg for c in set(re.findall(r'\bTF-?\d+\b', F.calle_corta(e['direccion']).upper().replace('TF ', 'TF-'))))
    for c, n in codigos_reg.items():
        c = c.replace('TF', 'TF-').replace('--', '-')
        if n >= 2 and c not in ('TF-1', 'TF-5', 'TF-28'):
            SERIES.append((c, r'\b%s\b(?![\d])' % c.replace('-', '-?')))
    for nombre, rx in SERIES:
        ser = []
        for e in reg:
            raw = e['direccion'].upper()
            for malo, x in corr.get('erratas', {}).items():
                raw = raw.replace(malo, x['se_escribe'])
            if not re.search(rx, raw):
                continue
            if e['ideess'] in corr.get('km_contradicho', {}):
                continue
            km = F.km_de(raw)
            if km:
                ser.append((float(str(km).replace(',', '.')), e))
        if len(ser) < 3:
            continue
        ser.sort(key=lambda t: t[0])
        base = ser[0][1]
        prev = -1
        for km, e in ser:
            d = metros(base['lat'], base['lng'], e['lat'], e['lng']) / 1000
            if d + 0.4 < prev:
                I[de(e)].append('km: %s (%s) «%s», km %s, a %.1f km de la del km %s: va antes que la anterior de la serie %s'
                                % (e['ideess'], e['rotulo'].strip(), e['direccion'].strip(), km, d, ser[0][0], nombre))
            prev = max(prev, d)

    # cp ---------------------------------------------------------------------
    porcp = collections.defaultdict(list)
    for e in reg:
        c = e['cp']
        k = corr.get('cp', {}).get(e['ideess'])
        if k and k['registro'] == c:
            c = k['se_escribe']
        porcp[c].append(e)
    for c, l in porcp.items():
        for e in l:
            otros = [x for x in l if x['municipio_poligono'] != e['municipio_poligono']]
            if otros and min(metros(e['lat'], e['lng'], x['lat'], x['lng']) for x in otros) > 10000:
                mas = [x for x in l if x['municipio_poligono'] == e['municipio_poligono']]
                I[de(e)].append('cp: %s (%s) lleva el %s, que el registro da tambien en %s, a mas de 10 km (%d de %d en su municipio)'
                                % (e['ideess'], e['rotulo'].strip(), c, sorted({x['municipio_poligono'] for x in otros}), len(mas), len(l)))

    # horario ----------------------------------------------------------------
    for e in reg:
        h = F.horario_del_registro(crudo[e['ideess']])
        if re.fullmatch(r'[LMXJVSD]: .*', h.strip()):
            H[de(e)].append('horario: %s da un solo dia («%s») sin comprobar' % (e['ideess'], h))
        dias = set()
        for trozo in h.split(';'):
            m = re.match(r'\s*([LMXJVSD])(?:-([LMXJVSD]))?:', trozo)
            if m:
                o = 'LMXJVSD'
                a, z = o.index(m.group(1)), o.index(m.group(2) or m.group(1))
                dias |= set(o[a:z + 1])
        falta = [d for d in 'LMXJVSD' if d not in dias]
        if falta and not re.fullmatch(r'[LMXJVSD]: .*', h.strip()):
            I[de(e)].append('horario: %s (%s) no abre %s segun el registro («%s»)'
                            % (e['ideess'], e['rotulo'].strip(), '-'.join(falta), h))

    # vecinos ----------------------------------------------------------------
    nombres = collections.Counter(p['name'] for p in app)
    for p in app:
        b = de(p['id'])
        if nombres[p['name']] > 1:
            H[b].append('vecinos: hay %d fichas que se llaman «%s»' % (nombres[p['name']], p['name']))
        for q in otras:
            if q['lat'] and abs(q['lat'] - p['lat']) < 0.0004 and abs(q['lng'] - p['lng']) < 0.0004:
                d = metros(p['lat'], p['lng'], q['lat'], q['lng'])
                if d < 25:
                    I[b].append('vecinos: %s a %.0f m de %s (%s)' % (p['id'], d, q['id'], q['category']))

    # capturas ---------------------------------------------------------------
    enlace = {}
    for fich in ('gasolineras_altas.json', 'gasolineras_verificacion.json'):
        def walk(o):
            if isinstance(o, dict):
                if o.get('de_la_captura') and o.get('ideess'):
                    enlace.setdefault(o['de_la_captura'], set()).add(str(o['ideess']))
                for v in o.values():
                    walk(v)
            elif isinstance(o, list):
                for v in o:
                    walk(v)
        walk(json.load(open(os.path.join(DG, fich), encoding='utf-8')))
    def ll(t):
        return re.sub(r'[^a-z0-9]', '', llano(t))
    sin = []
    for k in cap:
        ids = set(enlace.get(k, set()))
        if cap[k].get('ideess_registro'):          # casada a mano, con su porque al lado
            ids.add(str(cap[k]['ideess_registro']))
        c7 = ll((cap[k].get('registro_c7') or {}).get('direccion'))
        if not ids and c7:
            ids = {i for i, x in crudo.items() if i in porid and ll(x['Dirección']) == c7}
        if not ids:
            mk = GR.marca_de(cap[k].get('nombre_google') or '') or GR.marca_de(cap[k].get('marca') or '')
            ids = {e['ideess'] for e in reg if mk and e['marca'] == mk and e['cp'] == cap[k].get('cp')}
        if not ids:
            sin.append(k)
        for i in ids:
            if not con.get(i):
                H[de(porid[i]) if i in porid else '??'].append('captura: %s -> %s, sin ficha' % (k, i))

    # sesiones.json ------------------------------------------------------------
    for k, v in ses.items():
        mu = v.get('municipio')
        if not mu:
            continue
        est = [e for e in reg if e['municipio_poligono'] == mu]
        fi = [p for p in app if muni_de.get(p['id']) == mu]
        nuevas = [p for p in fi if es_generada(p)]
        if v.get('estaciones') != len(est):
            H[k].append('sesiones: dice %s estaciones y el registro tiene %d' % (v.get('estaciones'), len(est)))
        ah = v.get('altas_hechas')
        ah = len(ah) if isinstance(ah, list) else ah
        if v.get('estado') == 'hecha' and ah != len(nuevas):
            H[k].append('sesiones: dice %s altas hechas y la app tiene %d fichas nuevas' % (ah, len(nuevas)))

    # bloque 00 --------------------------------------------------------------
    for clave, val in F.V.items():
        if not isinstance(val, dict):
            continue
        for L in IDIOMAS:
            if not val.get(L) and clave not in ('coma', 'punto', 'dospuntos'):
                H['00-plantilla'].append('vocabulario: «%s» no tiene %s' % (clave, L))
        for L in IDIOMAS:
            if L not in ('es',) and val.get(L) and val.get(L) == val.get('es') and \
               re.search(r'[a-zñáéíóú]{4,}', val.get('es') or '') and clave not in ('premium',):
                I['00-plantilla'].append('vocabulario: «%s» en %s es igual que en castellano («%s»)' % (clave, L, val[L]))
    for L in IDIOMAS:
        if len(F.DIAS.get(L, [])) != 7:
            H['00-plantilla'].append('dias: %s no tiene los 7' % L)

    # ---------------------------------------------------------------- informe
    P('# Verificacion de los bloques 00 a 31')
    P('')
    P('Registro del %s · %d estaciones de Tenerife · %d fichas de gasolinera en la app (%d nuevas, %d antiguas)'
      % (json.load(open(os.path.join(RAIZ, 'registro', 'gasolineras-canarias.json'), encoding='utf-8-sig'))['Fecha'],
         len(reg), len(app), sum(es_generada(p) for p in app), sum(not es_generada(p) for p in app)))
    P('Revisor independiente: %d hallazgos (salida %d). Capturas de Jerome: %d, sin estacion del registro: %d %s'
      % (len(fallos), rc, len(cap), len(sin), sin))
    P('')
    P('| bloque | estaciones | fichas | nuevas | antiguas | via mas lejana | fallos | para mirar |')
    P('|---|---|---|---|---|---|---|---|')
    for k in sorted(ses):
        if not k[:2].isdigit() or int(k[:2]) > 31:
            continue
        mu = ses[k].get('municipio')
        est = [e for e in reg if e['municipio_poligono'] == mu] if mu else []
        fi = [p for p in app if mu and muni_de.get(p['id']) == mu]
        P('| %s | %d | %d | %d | %d | %s | **%d** | %d |' % (
            k, len(est), len(fi), sum(es_generada(p) for p in fi), sum(not es_generada(p) for p in fi),
            ('%.0f m' % lejos_max[k]) if fi else '-', len(H[k]), len(I[k])))
    for k in sorted(set(H) | set(I)):
        P('')
        P('## %s' % k)
        for x in H[k]:
            P('- **FALLO** ' + x)
        for x in I[k]:
            P('- ' + x)
    total = sum(len(v) for v in H.values())
    P('')
    P('FALLOS: %d' % total)
    if md:
        open(md, 'w', encoding='utf-8').write('\n'.join(out) + '\n')
    return 1 if total else 0


if __name__ == '__main__':
    sys.exit(main())
