#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Avisos meteorologicos de AEMET para Tenerife, para la app.

POR QUE EXISTE (12 de octubre de 2026). La pildora de avisos de la app llevaba
meses sin funcionar: pedia desde el navegador la prevision del municipio de
Santa Cruz (localidad_38038.xml), que ni siquiera son avisos, y AEMET no deja
que una web de otro dominio lea sus ficheros (no manda cabeceras CORS), asi que
la peticion fallaba siempre, la lista salia vacia y la pildora no aparecia
nunca. Nadie lo veia porque «sin avisos» y «no funciona» se pintaban igual.
Jerome: «Solucionalo, y ¿como deja datos correctos si no tiene acceso?».

DE DONDE SALE. Del canal oficial y sin clave del Plan Meteoalerta de AEMET para
la isla de Tenerife:
  https://www.aemet.es/documentos_d/eltiempo/prediccion/avisos/rss/CAP_AFAP6596_RSS.xml
(listado en https://www.aemet.es/es/rss_info/avisos/coo, «Tenerife», p=6596).
Su primer elemento es un .tar.gz con TODOS los avisos vigentes de la isla en
formato CAP 1.2 (Plan Meteoalerta, anexo 3, «METEOALERTA_ANX3_CAP.pdf», version
de 31-may-2022). Lo que se usa de ese anexo:
  · nivel: parametro «AEMET-Meteoalerta nivel» = verde (SIN aviso), amarillo,
    naranja o rojo. Los verdes solo dicen hasta donde llega la prediccion.
  · fenomeno: eventCode «FF;nombre». En Canarias hay nueve: PR lluvias,
    NE nevadas, VI vientos, TO tormentas, AT temperaturas maximas, BT minimas,
    CO costeros, VS polvo en suspension y NI nieblas.
  · parametro: «PP;nombre;valor unidad» (RM rachas maximas 70 km/h...).
  · zona: geocode «AEMET-Meteoalerta zona». Tenerife: 659601 Norte, 659602
    Area metropolitana, 659603 Este, sur y oeste; con una C al final, su costa.
  · contorno de la zona: <polygon> de su <area>, «lat,lon lat,lon ...»
    (CAP 1.2: cuatro pares como poco, el ultimo igual al primero). Se guarda
    tal cual, como «poligonos» de la zona, desde el 21 de octubre de 2026: con
    el la app sabe que playas caen dentro de un aviso costero. Uno que no
    tenga esa forma no se guarda, y la app trata entonces el aviso como si
    fuera de toda la costa: nunca se queda corta.
  · las zonas de la isla: las de todos los mensajes del fichero, tambien los
    de sin aviso, que traen todas («zonas_isla», desde el 21 de octubre de
    2026). Con ellas la app escribe «Toda la isla» cuando un aviso las tiene
    todas, en lugar de nombrarlas una a una.
  · un mensaje que caduca en el mismo instante en que se emite (expires igual
    a effective) NO es un aviso: es como AEMET retira los anteriores.
  · los mensajes que otro mensaje cita en <references> estan sustituidos.
  · texto (description, instruction) en es-ES y en-GB.
AEMET permite reutilizar sus datos citandola: https://www.aemet.es/es/nota_legal

COMO NO SE ENSENA NADA FALSO.
  · Si la descarga o la lectura falla, NO se escribe nada: el fichero se queda
    con su ultima comprobacion buena y su hora («consultado»), y la app, al
    ver que esa hora es vieja, dice que no ha podido comprobar desde entonces
    y manda a aemet.es. Nunca «sin avisos» sin hora.
  · Cada aviso lleva su fin oficial: la app quita por su cuenta los que ya han
    terminado, aunque este fichero no se haya podido renovar.
  · Si AEMET dice «No hay avisos para Tenerife» y aqui sale alguno, o al
    reves, algo se ha leido mal: se para sin escribir.
  · No se inventa ni se traduce nada aqui: los nombres de fenomeno, parametro,
    nivel y zona los traduce la app con su tabla por codigo, y el texto de
    AEMET va tal cual en castellano y en ingles, que son los que da AEMET.

Uso:
  python3 tools/avisos_aemet.py                       baja y escribe si toca
  python3 tools/avisos_aemet.py --rss R.xml --tar T.tar.gz --ahora 2026-10-12T12:00:00Z
                                                      sin red (pruebas)
  python3 tools/avisos_aemet.py --salida OTRO.json    escribe en otro sitio
"""
import argparse
import datetime as dt
import io
import json
import os
import re
import sys
import tarfile
import time
import urllib.request
import xml.etree.ElementTree as ET

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SALIDA = os.path.join(RAIZ, 'datos', 'avisos-aemet.json')
CANAL = 'https://www.aemet.es/documentos_d/eltiempo/prediccion/avisos/rss/CAP_AFAP6596_RSS.xml'
WEB = 'https://www.aemet.es/es/eltiempo/prediccion/avisos?p=6596'
ISLA = '6596'                      # prefijo de las zonas de Tenerife
NIVELES = ('amarillo', 'naranja', 'rojo')
FENOMENOS_CANARIAS = ('PR', 'NE', 'VI', 'TO', 'AT', 'BT', 'CO', 'VS', 'NI')
# Sin cambios, el fichero se reescribe cada 3 horas solo para renovar la hora
# de comprobacion; la app da los avisos por no comprobados a las 6 horas.
LATIDO = dt.timedelta(hours=3)
CAP = '{urn:oasis:names:tc:emergency:cap:1.2}'
# Sin cabecera Origin: el cortafuegos de aemet.es rechaza las peticiones que
# la llevan («Request Rejected», comprobado el 12/10/2026 desde GitHub).
UA = 'TenerifeGo/1.0 (+https://tenerifego.app/)'


class Parar(Exception):
    """Algo no cuadra: no se escribe nada."""


def bajar(url, tope=5_000_000):
    ultimo = None
    for intento in range(3):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': UA})
            with urllib.request.urlopen(req, timeout=60) as r:
                b = r.read(tope + 1)
            if len(b) > tope:
                raise Parar(f'{url}: mas de {tope} bytes')
            if b'Request Rejected' in b[:400]:
                raise Parar(f'{url}: el cortafuegos de AEMET rechazo la peticion')
            return b
        except Parar:
            raise
        except Exception as e:  # red: se reintenta
            ultimo = e
            time.sleep(10 * (intento + 1))
    raise Parar(f'{url}: {ultimo}')


def fecha(s):
    """ISO 8601 con zona («2026-10-11T21:50:01-00:00») -> datetime con zona."""
    if not s:
        raise Parar('fecha vacia')
    d = dt.datetime.fromisoformat(s.strip().replace('Z', '+00:00'))
    if d.tzinfo is None:
        raise Parar(f'fecha sin zona horaria: {s}')
    return d


def leer_canal(rss):
    try:
        raiz = ET.fromstring(rss)
    except ET.ParseError as e:
        raise Parar(f'el canal no es XML: {e}')
    canal = raiz.find('channel')
    if canal is None:
        raise Parar('el canal no tiene <channel>')
    titulo_canal = (canal.findtext('title') or '').strip()
    if 'Tenerife' not in titulo_canal:
        raise Parar(f'no es el canal de Tenerife: {titulo_canal!r}')
    item = canal.find('item')
    if item is None:
        raise Parar('el canal no trae ningun elemento')
    enlace = (item.findtext('link') or '').strip()
    if not re.match(r'^https://www\.aemet\.es/documentos_d/eltiempo/prediccion/avisos/cap/[A-Za-z0-9_]+\.tar\.gz$', enlace):
        raise Parar(f'el primer elemento no es el fichero de estado completo: {enlace!r}')
    return {
        'titulo': (item.findtext('title') or '').strip(),
        'enlace': enlace,
        'fichero': enlace.rsplit('/', 1)[1],
        'publicado': fecha(item.findtext('pubDate')).isoformat(),
    }


def param(info, nombre):
    for p in info.findall(CAP + 'parameter'):
        if (p.findtext(CAP + 'valueName') or '').strip() == nombre:
            return (p.findtext(CAP + 'value') or '').strip()
    return ''


def prob_limpia(v):
    """«40%-70%» se queda; si trae letras (p. ej. «mayor 70%») solo se traduce
    lo que el anexo dice que puede venir, y si no se reconoce no se ensena."""
    v = v.strip()
    if not v:
        return ''
    if re.fullmatch(r'\d{1,3}\s*%\s*-\s*\d{1,3}\s*%', v):
        return re.sub(r'\s+', '', v)
    m = re.fullmatch(r'(?:mayor|mayor que|>)\s*(\d{1,3})\s*%', v, re.I)
    if m:
        return '>' + m.group(1) + '%'
    return ''


def leer_cap(xml_bytes, nombre):
    try:
        al = ET.fromstring(xml_bytes)
    except ET.ParseError as e:
        raise Parar(f'{nombre}: no es XML: {e}')
    if al.tag != CAP + 'alert':
        raise Parar(f'{nombre}: no es un mensaje CAP 1.2')
    ident = (al.findtext(CAP + 'identifier') or '').strip()
    if not ident:
        raise Parar(f'{nombre}: mensaje sin identificador')
    refs = []
    for r in (al.findtext(CAP + 'references') or '').split():
        partes = r.split(',')
        if len(partes) >= 2:
            refs.append(partes[1])
    infos = {}
    for info in al.findall(CAP + 'info'):
        lengua = (info.findtext(CAP + 'language') or '').strip()
        infos[lengua] = info
    if 'es-ES' not in infos:
        raise Parar(f'{nombre}: sin texto en castellano')
    return {
        'id': ident,
        'enviado': fecha(al.findtext(CAP + 'sent')),
        'estado': (al.findtext(CAP + 'status') or '').strip(),
        'tipo': (al.findtext(CAP + 'msgType') or '').strip(),
        'refs': refs,
        'infos': infos,
    }


PAR = re.compile(r'(-?\d{1,3}(?:\.\d+)?),(-?\d{1,3}(?:\.\d+)?)')


def poligono_limpio(s):
    """El <polygon> de AEMET si tiene la forma de CAP 1.2; si no, None."""
    pares = (s or '').split()
    if len(pares) < 4:
        return None
    puntos = []
    for p in pares:
        m = PAR.fullmatch(p)
        if not m:
            return None
        la, lo = float(m.group(1)), float(m.group(2))
        if not (-90 <= la <= 90 and -180 <= lo <= 180):
            return None
        puntos.append((la, lo))
    if puntos[0] != puntos[-1]:
        return None
    return ' '.join(pares)


def zonas_de(info):
    out = []
    for a in info.findall(CAP + 'area'):
        for g in a.findall(CAP + 'geocode'):
            if (g.findtext(CAP + 'valueName') or '').strip() == 'AEMET-Meteoalerta zona':
                pols = [poligono_limpio(p.text) for p in a.findall(CAP + 'polygon')]
                out.append(((g.findtext(CAP + 'value') or '').strip(), (a.findtext(CAP + 'areaDesc') or '').strip(),
                            [p for p in pols if p], len(pols)))
    return out


def zona_json(codigo, nombre, poligonos, leidos):
    """Con todos sus contornos, o con ninguno: con uno de menos la zona se
    quedaria corta y una playa de dentro pareceria de fuera."""
    z = {'codigo': codigo, 'nombre_es': nombre}
    if leidos and len(poligonos) == leidos:
        z['poligonos'] = poligonos
    elif leidos:
        print(f'AVISO: zona {codigo}: {leidos - len(poligonos)} de {leidos} contornos sin la forma de CAP 1.2; '
              'no se guarda ninguno y la app tratara el aviso como de toda la costa')
    else:
        print(f'AVISO: zona {codigo} sin contorno; la app tratara el aviso como de toda la costa')
    return z


def textos(info):
    if info is None:
        return None
    return {
        'descripcion': (info.findtext(CAP + 'description') or '').strip(),
        'instruccion': (info.findtext(CAP + 'instruction') or '').strip(),
    }


def construir(rss_bytes, tar_bytes, ahora):
    canal = leer_canal(rss_bytes)
    try:
        tf = tarfile.open(fileobj=io.BytesIO(tar_bytes), mode='r:gz')
        miembros = [m for m in tf.getmembers() if m.isfile() and m.name.endswith('.xml')]
    except (tarfile.TarError, OSError) as e:
        raise Parar(f'{canal["fichero"]}: no es un .tar.gz legible: {e}')
    if not miembros:
        raise Parar(f'{canal["fichero"]}: no trae ningun mensaje')
    mensajes = [leer_cap(tf.extractfile(m).read(), m.name) for m in miembros]

    sustituidos = {r for m in mensajes for r in m['refs']}
    avisos, alcance, verdes_tf, zonas_isla = [], None, 0, set()
    for m in mensajes:
        if m['estado'] != 'Actual' or m['id'] in sustituidos:
            continue
        es = m['infos']['es-ES']
        en = m['infos'].get('en-GB')
        nivel = param(es, 'AEMET-Meteoalerta nivel').lower()
        zonas = [z for z in zonas_de(es) if z[0].startswith(ISLA)]
        if not zonas:
            continue
        zonas_isla.update(z[0] for z in zonas)
        inicio = fecha(es.findtext(CAP + 'onset'))
        fin = fecha(es.findtext(CAP + 'expires'))
        efectivo = fecha(es.findtext(CAP + 'effective'))
        if nivel == 'verde':
            verdes_tf += 1
            if alcance is None or fin > alcance:
                alcance = fin
            continue
        if nivel not in NIVELES:
            raise Parar(f'{m["id"]}: nivel desconocido {nivel!r}')
        # Mensaje de retirada (anexo 3, msgType): caduca al emitirse.
        if fin <= efectivo or fin <= m['enviado']:
            continue
        if fin <= ahora:
            continue
        cod_fen, _, nom_fen = (es.findtext(CAP + 'eventCode/' + CAP + 'value') or '').partition(';')
        cod_fen = cod_fen.strip()
        if not re.fullmatch(r'[A-Z]{2}', cod_fen):
            raise Parar(f'{m["id"]}: fenomeno ilegible')
        if cod_fen not in FENOMENOS_CANARIAS:
            print(f'AVISO: fenomeno {cod_fen} ({nom_fen}) no previsto para Canarias; la app lo ensenara con el nombre de AEMET')
        par = param(es, 'AEMET-Meteoalerta parametro').split(';')
        aviso = {
            'id': m['id'],
            'nivel': nivel,
            'fenomeno': cod_fen,
            'fenomeno_es': nom_fen.strip(),
            'parametro': par[0].strip() if par and par[0].strip() else '',
            'parametro_es': par[1].strip() if len(par) >= 2 else '',
            'valor': par[2].strip() if len(par) >= 3 else '',
            'probabilidad': prob_limpia(param(es, 'AEMET-Meteoalerta probabilidad')),
            'zonas': [zona_json(*z) for z in zonas],
            'inicio': inicio.isoformat(),
            'fin': fin.isoformat(),
            'emitido': m['enviado'].astimezone(dt.timezone.utc).isoformat().replace('+00:00', 'Z'),
            'es': textos(es),
        }
        t_en = textos(en)
        if t_en and (t_en['descripcion'] or t_en['instruccion']):
            aviso['en'] = t_en
        avisos.append(aviso)

    if verdes_tf == 0:
        # Siempre vienen los «sin aviso» de cada fenomeno con las zonas de la
        # isla: si no hay ninguno, el fichero no es el que se espera.
        raise Parar('el fichero no trae los mensajes de nivel verde de Tenerife: no se puede saber hasta donde llega')
    dice_ninguno = 'No hay avisos' in canal['titulo']
    if dice_ninguno and avisos:
        raise Parar(f'AEMET dice «{canal["titulo"]}» y aqui salen {len(avisos)} avisos: algo se ha leido mal')

    orden = {'rojo': 0, 'naranja': 1, 'amarillo': 2}
    avisos.sort(key=lambda a: (a['inicio'], orden[a['nivel']], a['fenomeno'], a['zonas'][0]['codigo']))
    return {
        'fuente': 'AEMET. Agencia Estatal de Meteorología. Plan Meteoalerta, avisos para Tenerife.',
        'canal': CANAL,
        'web': WEB,
        'aemet': {
            'fichero': canal['fichero'],
            'publicado': canal['publicado'],
            'titulo': canal['titulo'],
            'alcance': alcance.isoformat() if alcance else None,
            'zonas_isla': sorted(zonas_isla),
        },
        'consultado': ahora.astimezone(dt.timezone.utc).replace(microsecond=0).isoformat().replace('+00:00', 'Z'),
        'avisos': avisos,
    }


def sin_hora(d):
    return {k: v for k, v in d.items() if k != 'consultado'}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--rss')
    ap.add_argument('--tar')
    ap.add_argument('--ahora')
    ap.add_argument('--salida', default=SALIDA)
    a = ap.parse_args()
    ahora = fecha(a.ahora) if a.ahora else dt.datetime.now(dt.timezone.utc)
    try:
        if a.rss or a.tar:
            if not (a.rss and a.tar):
                raise Parar('--rss y --tar van juntos')
            rss = open(a.rss, 'rb').read()
            tar = open(a.tar, 'rb').read()
        else:
            rss = bajar(CANAL, 200_000)
            tar = bajar(leer_canal(rss)['enlace'])
        nuevo = construir(rss, tar, ahora)
    except Parar as e:
        print(f'PARADO, no se escribe nada: {e}')
        return 1

    viejo = None
    if os.path.exists(a.salida):
        try:
            viejo = json.load(open(a.salida, encoding='utf-8'))
        except Exception:
            viejo = None
    hace = None
    if viejo and viejo.get('consultado'):
        try:
            hace = ahora - fecha(viejo['consultado'])
        except Parar:
            hace = None
    if viejo and sin_hora(viejo) == sin_hora(nuevo) and hace is not None and dt.timedelta(0) <= hace < LATIDO:
        print(f'Sin cambios; la ultima comprobacion escrita es de hace {int(hace.total_seconds() // 60)} min: no se reescribe')
        return 0
    os.makedirs(os.path.dirname(a.salida), exist_ok=True)
    tmp = a.salida + '.tmp'
    with open(tmp, 'w', encoding='utf-8') as fh:
        json.dump(nuevo, fh, ensure_ascii=False, indent=1)
        fh.write('\n')
    os.replace(tmp, a.salida)
    n = len(nuevo['avisos'])
    print(f'Escrito {os.path.relpath(a.salida, RAIZ)}: {n} aviso(s) para Tenerife; '
          f'AEMET: «{nuevo["aemet"]["titulo"]}» ({nuevo["aemet"]["fichero"]}); alcance {nuevo["aemet"]["alcance"]}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
