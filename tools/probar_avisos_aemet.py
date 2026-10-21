#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Pruebas de tools/avisos_aemet.py con copias reales de AEMET (tools/pruebas/aemet/).

Cada caso arma en memoria un canal y un .tar.gz a partir de las copias, le
cambia lo que dice el caso, ejecuta el lector en una carpeta temporal y mira
lo que escribe (o que NO escribe). Nada de esto toca datos/avisos-aemet.json.

  python3 tools/probar_avisos_aemet.py      -> «N de N» y codigo 0 si todo bien
"""
import io
import json
import os
import re
import subprocess
import sys
import tarfile
import tempfile

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
COP = os.path.join(RAIZ, 'tools', 'pruebas', 'aemet')
LECTOR = os.path.join(RAIZ, 'tools', 'avisos_aemet.py')
RSS = open(os.path.join(COP, 'CAP_AFAP6596_RSS.xml'), 'rb').read()
RSS_ESP = open(os.path.join(COP, 'CAP_AFAE_RSS.xml'), 'rb').read()
TAR = open(os.path.join(COP, 'Z_CAP_C_LEMM_20261011215001_AFAP6596.tar.gz'), 'rb').read()
AMARILLO = open(os.path.join(COP, 'Z_CAP_C_LEMM_20261012091605_AFAZ645403PRP11217.xml'), 'rb').read()
# Lo que AEMET pone en el canal cuando no hay avisos; cuando los hay, el caso
# lo cambia por un titulo que no dice «No hay avisos».
HAY = RSS.replace(b'No hay avisos para Tenerife', b'Hay avisos para Tenerife')

fallos, total = [], 0


def verdes():
    tf = tarfile.open(fileobj=io.BytesIO(TAR), mode='r:gz')
    return [(m.name, tf.extractfile(m).read()) for m in tf.getmembers() if m.isfile()]


def tar_con(*extra, sin_verdes=False):
    buf = io.BytesIO()
    with tarfile.open(fileobj=buf, mode='w:gz') as tf:
        for nombre, datos in ([] if sin_verdes else verdes()) + list(extra):
            ti = tarfile.TarInfo(nombre)
            ti.size = len(datos)
            tf.addfile(ti, io.BytesIO(datos))
    return buf.getvalue()


def a_tenerife(xml, zona=b'659601'):
    """El aviso real de Mallorca, con su zona cambiada a una de Tenerife."""
    return xml.replace(b'<value>645403</value>', b'<value>' + zona + b'</value>')


def correr(rss, tar, ahora, previo=None):
    with tempfile.TemporaryDirectory() as d:
        r, t, s = (os.path.join(d, x) for x in ('c.xml', 'e.tar.gz', 'avisos.json'))
        open(r, 'wb').write(rss)
        open(t, 'wb').write(tar)
        if previo is not None:
            open(s, 'w', encoding='utf-8').write(previo)
        p = subprocess.run([sys.executable, LECTOR, '--rss', r, '--tar', t, '--ahora', ahora, '--salida', s],
                           capture_output=True, text=True)
        texto = open(s, encoding='utf-8').read() if os.path.exists(s) else None
        return p.returncode, p.stdout + p.stderr, texto


def caso(nombre, cond, detalle=''):
    global total
    total += 1
    if cond:
        print(f'  ok   {nombre}')
    else:
        fallos.append(nombre)
        print(f'  MAL  {nombre}  {detalle}')


print('=== lector de avisos de AEMET (copias reales del 11 y 12 de octubre de 2026) ===')

# 1. El estado real: ningun aviso, alcance hasta el 14 a las 23:59.
rc, sal, txt = correr(RSS, TAR, '2026-10-12T15:00:00Z')
d = json.loads(txt) if txt else {}
caso('estado real: escribe, 0 avisos', rc == 0 and d.get('avisos') == [], sal)
caso('estado real: alcance 2026-10-14T23:59:59+01:00', d.get('aemet', {}).get('alcance') == '2026-10-14T23:59:59+01:00', d.get('aemet'))
caso('estado real: hora de comprobacion = la de la ejecucion', d.get('consultado') == '2026-10-12T15:00:00Z', d.get('consultado'))
caso('estado real: fuente y canal oficiales',
     d.get('canal', '').endswith('/CAP_AFAP6596_RSS.xml') and d.get('fuente', '').startswith('AEMET'), d.get('canal'))

# 2. Un aviso amarillo real (Mallorca) puesto en el Norte de Tenerife.
rc, sal, txt = correr(HAY, tar_con(('amarillo.xml', a_tenerife(AMARILLO))), '2026-10-12T15:00:00Z')
d = json.loads(txt) if txt else {}
av = (d.get('avisos') or [{}])[0]
caso('amarillo: se lee uno', rc == 0 and len(d.get('avisos', [])) == 1, sal)
caso('amarillo: nivel, fenomeno y parametro del CAP',
     av.get('nivel') == 'amarillo' and av.get('fenomeno') == 'PR' and av.get('parametro') == 'P1' and av.get('valor') == '20 mm', av)
caso('amarillo: probabilidad «10%-40%»', av.get('probabilidad') == '10%-40%', av.get('probabilidad'))
caso('amarillo: zona 659601', [z['codigo'] for z in av.get('zonas', [])] == ['659601'], av.get('zonas'))
caso('amarillo: inicio y fin tal cual los da AEMET',
     av.get('inicio') == '2026-10-12T14:00:00+02:00' and av.get('fin') == '2026-10-12T18:59:59+02:00', (av.get('inicio'), av.get('fin')))
caso('amarillo: texto en castellano y en ingles de AEMET',
     av.get('es', {}).get('descripcion') == 'Precipitación acumulada en una hora: 20 mm.'
     and av.get('en', {}).get('descripcion') == 'One-hour accumulated precipitation: 20 mm.', (av.get('es'), av.get('en')))

# 3. El mismo, cuando ya ha terminado: no sale.
rc, sal, txt = correr(HAY, tar_con(('amarillo.xml', a_tenerife(AMARILLO))), '2026-10-12T17:00:00Z')
d = json.loads(txt) if txt else {}
caso('caducado (fin 18:59:59+02:00, ahora 17:00Z): no sale', rc == 0 and d.get('avisos') == [], sal)

# 4. Mensaje de retirada (anexo 3): caduca en el mismo instante en que se emite.
ret = a_tenerife(AMARILLO).replace(b'<expires>2026-10-12T18:59:59+02:00</expires>',
                                   b'<expires>2026-10-12T11:16:05+02:00</expires>')
rc, sal, txt = correr(HAY, tar_con(('retirada.xml', ret)), '2026-10-12T09:00:00Z')
d = json.loads(txt) if txt else {}
caso('retirada (expires = effective): no es un aviso', rc == 0 and d.get('avisos') == [], sal)

# 5. Sustituido: otro mensaje lo cita en <references>.
ident = re.search(rb'<identifier>([^<]+)</identifier>', AMARILLO).group(1)
nuevo = (a_tenerife(AMARILLO)
         .replace(ident, b'2.49.0.0.724.0.ES.20261012100000.PRUEBA')
         .replace(b'<references>', b'<references>http://www.aemet.es,' + ident + b',2026-10-12T09:16:05-00:00 ', 1))
rc, sal, txt = correr(HAY, tar_con(('viejo.xml', a_tenerife(AMARILLO)), ('nuevo.xml', nuevo)), '2026-10-12T15:00:00Z')
d = json.loads(txt) if txt else {}
ids = [a['id'] for a in d.get('avisos', [])]
caso('sustituido por otro mensaje: solo queda el nuevo', rc == 0 and ids == ['2.49.0.0.724.0.ES.20261012100000.PRUEBA'], ids)

# 6. Zona de otra isla: no es de Tenerife.
rc, sal, txt = correr(RSS, tar_con(('mallorca.xml', AMARILLO)), '2026-10-12T15:00:00Z')
d = json.loads(txt) if txt else {}
caso('aviso de Mallorca: no entra', rc == 0 and d.get('avisos') == [], sal)

# 7. Costa: la zona con C al final es de Tenerife.
rc, sal, txt = correr(HAY, tar_con(('costa.xml', a_tenerife(AMARILLO, b'659603C'))), '2026-10-12T15:00:00Z')
d = json.loads(txt) if txt else {}
caso('zona costera 659603C: entra', rc == 0 and [z['codigo'] for a in d.get('avisos', []) for z in a['zonas']] == ['659603C'], sal)

# 7b. El contorno de la zona, tal cual lo da AEMET. El <area> de la costa este,
#     sur y oeste de Tenerife sale del mensaje real de costeros del 11 de octubre
#     (el verde que va en el .tar.gz) y se pone en el aviso de Mallorca en lugar
#     del suyo: zona, nombre y contorno son entonces los de AEMET para Tenerife.
COSTEROS = next(datos for nombre, datos in verdes() if nombre.endswith('COCO1423.xml'))
AREA_TF = re.search(rb'<area>(?:(?!</area>).)*?<value>659603C</value>(?:(?!</area>).)*?</area>', COSTEROS, re.S).group(0)
POL_TF = re.search(rb'<polygon>([^<]*)</polygon>', AREA_TF).group(1).decode()


def con_area(area):
    return re.sub(rb'<area>.*?</area>', lambda m: area, AMARILLO, flags=re.S)


rc, sal, txt = correr(HAY, tar_con(('costa.xml', con_area(AREA_TF))), '2026-10-12T15:00:00Z')
d = json.loads(txt) if txt else {}
zs = [z for a in d.get('avisos', []) for z in a['zonas']]
caso('contorno: el de AEMET, tal cual, en su zona',
     rc == 0 and len(zs) == 1 and zs[0].get('codigo') == '659603C' and zs[0].get('poligonos') == [POL_TF], (sal, zs))
caso('contorno: es el de Tenerife (38 pares, cerrado)', len(POL_TF.split()) == 38 and POL_TF.split()[0] == POL_TF.split()[-1], POL_TF[:80])

# 7c. Un contorno sin la forma de CAP 1.2 no se guarda (y el aviso si).
for nombre, malo in (('abierto (sin el ultimo par)', POL_TF.rsplit(' ', 1)[0]),
                     ('con letras', POL_TF.replace('28.27,-16.85', '28.27,oeste')),
                     ('de tres pares', '28.1,-16.5 28.2,-16.6 28.1,-16.5'),
                     ('fuera del planeta', POL_TF.replace('28.27,-16.85', '128.27,-16.85'))):
    area = AREA_TF.replace(POL_TF.encode(), malo.encode())
    rc, sal, txt = correr(HAY, tar_con(('costa.xml', con_area(area))), '2026-10-12T15:00:00Z')
    d = json.loads(txt) if txt else {}
    zs = [z for a in d.get('avisos', []) for z in a['zonas']]
    caso(f'contorno {nombre}: el aviso entra sin contorno, y se dice',
         rc == 0 and len(zs) == 1 and 'poligonos' not in zs[0] and 'AVISO: zona 659603C' in sal, (sal, zs))

# 7d. Dos contornos y uno malo: ninguno, para que la zona no se quede corta.
dos = AREA_TF.replace(b'</polygon>', b'</polygon>\n      <polygon>28.1,-16.5 28.2,x 28.1,-16.5 28.1,-16.5</polygon>', 1)
rc, sal, txt = correr(HAY, tar_con(('costa.xml', con_area(dos))), '2026-10-12T15:00:00Z')
d = json.loads(txt) if txt else {}
zs = [z for a in d.get('avisos', []) for z in a['zonas']]
caso('dos contornos y uno malo: no se guarda ninguno', rc == 0 and len(zs) == 1 and 'poligonos' not in zs[0], (sal, zs))

# 8. AEMET dice «No hay avisos» y aqui sale uno: algo se ha leido mal, no se escribe.
PREVIO = '{"consultado": "2026-10-12T10:00:00Z", "avisos": [], "marca": "previo"}\n'
rc, sal, txt = correr(RSS, tar_con(('amarillo.xml', a_tenerife(AMARILLO))), '2026-10-12T15:00:00Z', PREVIO)
caso('contradiccion con el canal: para y deja el fichero como estaba', rc == 1 and txt == PREVIO, sal)

# 9. Fichero roto o vacio: para y no toca nada.
rc, sal, txt = correr(RSS, b'esto no es un tar', '2026-10-12T15:00:00Z', PREVIO)
caso('.tar.gz roto: para y no escribe', rc == 1 and txt == PREVIO, sal)
rc, sal, txt = correr(RSS, tar_con(sin_verdes=True), '2026-10-12T15:00:00Z', PREVIO)
caso('.tar.gz sin mensajes: para y no escribe', rc == 1 and txt == PREVIO, sal)
rc, sal, txt = correr(HAY, tar_con(('amarillo.xml', a_tenerife(AMARILLO)), sin_verdes=True), '2026-10-12T15:00:00Z', PREVIO)
caso('sin los mensajes verdes de Tenerife: para (no se sabe el alcance)', rc == 1 and txt == PREVIO, sal)

# 10. Canal que no es el de Tenerife.
rc, sal, txt = correr(RSS_ESP, TAR, '2026-10-12T15:00:00Z', PREVIO)
caso('canal de toda Espana: para', rc == 1 and txt == PREVIO, sal)

# 11. Nivel que el anexo no contempla.
raro = a_tenerife(AMARILLO).replace(b'<value>amarillo</value>', b'<value>violeta</value>')
rc, sal, txt = correr(HAY, tar_con(('raro.xml', raro)), '2026-10-12T15:00:00Z', PREVIO)
caso('nivel desconocido: para', rc == 1 and txt == PREVIO, sal)

# 12. Latido: sin cambios, no se reescribe antes de 3 horas; despues, si.
rc, sal, txt1 = correr(RSS, TAR, '2026-10-12T15:00:00Z')
rc2, sal2, txt2 = correr(RSS, TAR, '2026-10-12T16:00:00Z', txt1)
caso('sin cambios a la hora: no reescribe', rc2 == 0 and txt2 == txt1 and 'no se reescribe' in sal2, sal2)
rc3, sal3, txt3 = correr(RSS, TAR, '2026-10-12T18:30:00Z', txt1)
caso('sin cambios a las 3 h 30 min: reescribe con la hora nueva',
     rc3 == 0 and json.loads(txt3)['consultado'] == '2026-10-12T18:30:00Z', sal3)
rc4, sal4, txt4 = correr(HAY, tar_con(('amarillo.xml', a_tenerife(AMARILLO))), '2026-10-12T15:10:00Z', txt1)
caso('con cambios a los 10 min: reescribe enseguida', rc4 == 0 and len(json.loads(txt4)['avisos']) == 1, sal4)

print(f'\n{total - len(fallos)} de {total}')
sys.exit(1 if fallos else 0)
