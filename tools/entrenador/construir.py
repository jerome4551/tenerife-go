#!/usr/bin/env python3
# Junta los trozos de tools/entrenador/src/ en modulos/entrenador.js (el motor y las coreografías del bloque 1, sin
# dependencias) y en modulos/entrenador/<grupo>.<huella>.js (las demás coreografías, un fichero por grupo).
#     python3 tools/entrenador/construir.py              los escribe
#     python3 tools/entrenador/construir.py --comprobar  dice si los que hay son los que salen de sus fuentes (sale con 1 si no)
# Y escribe datos/cuerpo/con-video.json (15-11-2026, Jérôme: que los vídeos se encuentren): qué ejercicios tienen
# vídeo y cuántos pasos tiene su ficha en castellano. Con él, «Su cuerpo» pone 🎬 junto a su nombre en las listas
# sin pedir este módulo, que pesa; la ficha sigue preguntando a TG_ENTRENADOR.tiene() antes de enseñar el vídeo.
# Antes apunta en src/90-huellas.js la huella de los pasos en castellano de cada ejercicio con
# coreografía (los 12 primeros caracteres del sha256 de sus pasos, unidos con un salto de línea):
# si la ficha cambia, tools/auditar_entrenador.js lo dice y la coreografía se revisa.
#
# POR TROZOS (16-11-2026, Jérôme: partir el módulo por grupos antes de que crezca). Los fuentes src/7N-<grupo>.js con N de 1
# en adelante (71-pecho.js, 72-dorsal.js…; después del 79, 7a, 7b…) no van en modulos/entrenador.js: cada uno sale a
# modulos/entrenador/<grupo>.<huella>.js, donde <huella> son los 8 primeros caracteres del sha256 de ese fichero. El motor
# lleva la lista (TROZOS: qué fichero tiene cada ejercicio) y lo que los trozos usan de él (NUCLEO), y los pide al abrir
# una ficha (src/95-trozos.js). src/70-coreografias.js (las ayudas de todas y las 40 coreografías del bloque 1) se queda
# en el motor. Un trozo es una función encerrada (sin nada suelto en su nivel de arriba) que solo usa del motor nombres
# que no cambian después de declararse: aquí se comprueba, y lo que cada trozo importa se saca solo.
# Los trozos que ya no salen de ningún fuente se borran de modulos/entrenador/.
import pathlib, sys, re, json, hashlib
aqui = pathlib.Path(__file__).resolve().parent
repo = aqui.parents[1]
ES_TROZO = re.compile(r'^7[1-9a-z][0-9a-z]*-([a-z0-9-]+)\.js$')
RE_COREO = re.compile(r"^\s*COREO(?:\['([a-z0-9-]+)'\]|\.([a-z0-9_]+)) = ", re.M)
def ids_de(texto): return [a or b for a, b in RE_COREO.findall(texto)]
fuentes = {t.name: t.read_text(encoding='utf-8') for t in (aqui / 'src').glob('*.js')}
de_trozo = [n for n in sorted(fuentes) if ES_TROZO.match(n)]              # los que salen a modulos/entrenador/
de_motor = [n for n in sorted(fuentes) if not ES_TROZO.match(n)]
# las coreografías van en los trozos 7x (70, el bloque 1; 71, pecho; …), una por ejercicio: COREO['id'] = …
ids = [i for n in sorted(fuentes) if n.startswith('7') for i in ids_de(fuentes[n])]
assert ids and len(ids) == len(set(ids)), 'ids repetidos o ninguno'
assert all(not ids_de(fuentes[n]) for n in de_motor if not n.startswith('7')), 'una coreografía fuera de los trozos 7x'
es = json.loads((repo / 'datos' / 'cuerpo' / 'ejercicios-es.json').read_text(encoding='utf-8'))
faltan = [i for i in ids if i not in es]
assert not faltan, 'coreografías sin ficha: %s' % faltan
def huella(pasos): return hashlib.sha256('\n'.join(pasos).encode('utf-8')).hexdigest()[:12]
def huellas_js(lista): return json.dumps({i: huella(es[i][1]) for i in lista}, ensure_ascii=False, separators=(', ', ': '))
CAB_HUELLAS = '  /* las huellas de los pasos (las escribe construir.py) */\n  var HUELLAS = '
huellas = CAB_HUELLAS + huellas_js(ids) + ';\n'                             # src/90-huellas.js: todas, como siempre
con_video = ('{\n "_": "Los ejercicios con vídeo de Jérôme (modulos/entrenador.js) y cuántos pasos tiene su ficha en castellano. '
             'Lo escribe tools/entrenador/construir.py; no se edita a mano.",\n "pasos": {\n'
             + ',\n'.join('  ' + json.dumps(i) + ': ' + str(len(es[i][1])) for i in sorted(ids)) + '\n }\n}\n')

# ── lo que el motor declara en su nivel de arriba (dos espacios de sangría): function f, y var a = …, b = …; ──
IDENT = re.compile(r'[A-Za-z_$][\w$]*')
def nombres_arriba(texto):
    """(funciones, variables). Recorre cada «var» hasta su punto y coma, saltando cadenas, comentarios, expresiones
    regulares y lo que va entre paréntesis, corchetes o llaves. tools/auditar_entrenador.js coteja la lista con la de verdad."""
    fs = [m.group(1) for m in re.finditer(r'^  function ([A-Za-z_$][\w$]*)', texto, re.M)]
    vs = []
    for m in re.finditer(r'^  var ', texto, re.M):
        i, n, hondo, espera, prev = m.end(), len(texto), 0, True, ''
        while i < n:
            c = texto[i]
            if c in ' \t\r\n': i += 1; continue
            if texto.startswith('/*', i): i = texto.index('*/', i) + 2; continue
            if texto.startswith('//', i): i = texto.index('\n', i); continue
            if c in '\'"':
                j = i + 1
                while texto[j] != c: j += 2 if texto[j] == '\\' else 1
                i, prev = j + 1, 'x'; continue
            if c == '/' and prev in ('', '(', ',', '=', ':', '[', '!', '&', '|', '?', '{', '}', ';', 'return'):
                j, clase = i + 1, False
                while texto[j] != '/' or clase:
                    if texto[j] == '\\': j += 1
                    elif texto[j] == '[': clase = True
                    elif texto[j] == ']': clase = False
                    j += 1
                i = j + 1
                while texto[i].isalpha(): i += 1
                prev = 'x'; continue
            if c in '([{': hondo += 1; i += 1; prev = c; continue
            if c in ')]}': hondo -= 1; i += 1; prev = 'x'; continue
            if hondo == 0 and c == ';': break
            if hondo == 0 and c == ',': espera = True; i += 1; prev = c; continue
            mm = IDENT.match(texto, i)
            if mm:
                if hondo == 0 and espera: vs.append(mm.group(0)); espera = False
                prev = 'return' if mm.group(0) in ('return', 'typeof', 'in', 'of', 'new', 'delete', 'void', 'case') else 'x'
                i = mm.end(); continue
            prev = c; i += 1
        assert i < n, 'un var sin punto y coma'
    return fs, vs
# dos funciones con el mismo nombre en trozos distintos: la segunda pisa a la primera sin avisar
vistas, variables = {}, {}
for nombre in de_motor:
    fs, vs = nombres_arriba(fuentes[nombre])
    for f in fs + vs:
        assert f not in vistas, '%s está en %s y en %s' % (f, vistas[f], nombre)
        vistas[f] = nombre
    for v in vs: variables[v] = nombre
motor_junto = '\n'.join(fuentes[n] for n in de_motor)
def cambia(v):
    """¿Se le da otro valor a esta variable del motor en algún sitio que no sea un «var»? (Con que lo parezca, basta: es para parar.)"""
    for linea in motor_junto.split('\n'):
        for m in re.finditer(r'(?<![.\w$])' + re.escape(v) + r'\s*(?:=(?!=)|\+=|-=|\*=|/=|\+\+|--)', linea):
            if not re.search(r'\bvar\b[^;]*$', linea[:m.start()]): return True
    return False

# ── los trozos ──
CAB_TROZO = '''/* modulos/entrenador/%(nombre)s.<huella>.js — Jérôme, el entrenador: las coreografías de «%(nombre)s» (%(n)d ejercicios).
   Lo pide modulos/entrenador.js al abrir la ficha de uno de ellos (TG_ENTRENADOR.pedir); solo, no hace nada.
   <huella> son los 8 primeros caracteres del sha256 de este fichero: si cambia una coma, cambia el nombre, y cada
   motor pide los suyos. Recibe del motor lo que usa de él (N) y le devuelve las huellas de los pasos de sus fichas.

   NO EDITAR A MANO: lo hace tools/entrenador/construir.py con tools/entrenador/src/%(fuente)s. */
(function () {
  'use strict';
  var T = window.TG_ENTRENADOR;
  if (!T || typeof T._trozo !== 'function') return;
  T._trozo('%(nombre)s', function (N) {
%(importa)s
%(texto)s
    return %(huellas)s;
  });
})();
'''
trozos, nucleo, de_quien = [], set(['COREO']), {}                          # [(nombre, fichero sin .js, texto del fichero, ids)]
for fuente in de_trozo:
    nombre, texto = ES_TROZO.match(fuente).group(1), fuentes[fuente]
    assert nombre not in de_quien, 'dos fuentes para el trozo %s: %s y %s' % (nombre, de_quien[nombre], fuente)
    de_quien[nombre] = fuente
    suyos = ids_de(texto)
    assert suyos, '%s no trae ninguna coreografía' % fuente
    # encerrado: nada declarado en su nivel de arriba (lo vería como suyo todo el motor, y aquí ya no)
    fs, vs = nombres_arriba(texto)
    assert not fs and not vs, '%s declara en su nivel de arriba %s: un trozo va encerrado en su función' % (fuente, fs + vs)
    # lo que usa del motor: todo nombre suyo que aparezca en el texto (de más no importa; de menos, la auditoría lo coteja)
    usa = sorted(set(IDENT.findall(texto)) & set(vistas) | set(['COREO']))
    for v in usa:
        if v in variables and cambia(v):
            sys.exit('%s usa %s, que el motor cambia después de declararlo (%s): un trozo recibe una copia' % (fuente, v, variables[v]))
    nucleo |= set(usa)
    lineas, fila = [], '    var '
    for k, v in enumerate(usa):
        trozo = '%s = N.%s%s' % (v, v, ';' if k == len(usa) - 1 else ', ')
        if len(fila) + len(trozo) > 150: lineas.append(fila.rstrip()); fila = '        '
        fila += trozo
    lineas.append(fila)
    js = CAB_TROZO % {'nombre': nombre, 'n': len(suyos), 'fuente': fuente, 'importa': '\n'.join(lineas), 'texto': texto.rstrip('\n'), 'huellas': huellas_js(suyos)}
    assert '</script' not in js.lower()
    trozos.append((nombre, '%s.%s' % (nombre, hashlib.sha256(js.encode('utf-8')).hexdigest()[:8]), js, suyos))

CAB = '''/* modulos/entrenador.js — Jérôme, el entrenador (11 de noviembre de 2026): el vídeo de cada
   ejercicio de «Su cuerpo». Lo pide modulos/cuerpo.js al abrir la ficha de un ejercicio;
   tools/fuente.js y tools/fuente.py lo pegan al final del fuente (CARGA-PEREZOSA).

   QUÉ ES
   No son archivos de vídeo: Jérôme (el presentador de modulos/guia.js, con cuerpo entero) es un
   dibujo vectorial que se mueve. Un esqueleto en tres dimensiones (en centímetros), una cámara
   y sus piezas pintadas de lejos a cerca. Cada ejercicio tiene su coreografía (COREO), hecha a
   partir de los pasos verificados de su ficha: no añade técnica que la ficha no diga. El vídeo es
   una cabecera (Jérôme saluda), un tramo por paso (el texto de la ficha, tal cual, en el idioma
   de la app; arriba, lo que ese paso describe) y un cierre. Sin conexión, sin bibliotecas.

   CÓMO SE USA
   TG_ENTRENADOR.pedir(id) → promesa (trae la coreografía, si no está) · TG_ENTRENADOR.tiene(id, nPasos) ·
   TG_ENTRENADOR.montar(caja, datos, opc) → reproductor (reproducir, pausar, irA, tema, quitar) ·
   TG_ENTRENADOR.ids() · .trozos() · .todo() · .huellas · .textos (los diez idiomas).
   innerHTML solo recibe constantes de este fichero (dibujos e iconos); los textos de la ficha
   entran con textContent.

   POR TROZOS (16 de noviembre de 2026)
   Aquí van el motor y las %(n_motor)d coreografías del bloque 1. Las otras %(n_trozos)d van por grupos en modulos/entrenador/,
   cada fichero con la huella de su contenido en el nombre, y se piden al abrir la ficha de uno de sus ejercicios:
%(lista)s

   NO EDITAR A MANO: lo hace tools/entrenador/construir.py juntando los trozos de tools/entrenador/src/. */
(function () {
  'use strict';
'''
PIE = '''
})();
'''
en_trozos = [i for t in trozos for i in t[3]]
en_motor = [i for i in ids if i not in set(en_trozos)]
partes = dict((n, fuentes[n]) for n in de_motor)
partes['90-huellas.js'] = CAB_HUELLAS + huellas_js(en_motor) + ';\n'        # en el motor, las suyas; las demás llegan con su trozo
T95 = partes.get('95-trozos.js', '')
assert T95.count('{/*__TROZOS__*/}') == 1 and T95.count('{/*__NUCLEO__*/}') == 1, 'src/95-trozos.js: faltan los dos huecos'
partes['95-trozos.js'] = (T95
    .replace('{/*__TROZOS__*/}', '{' + ', '.join('%s: [%s, %s]' % (json.dumps(t[0]), json.dumps(t[1]), json.dumps(t[3], separators=(', ', ': '))) for t in trozos) + '}')
    .replace('{/*__NUCLEO__*/}', '{ ' + ', '.join('%s: %s' % (v, v) for v in sorted(nucleo)) + ' }'))
out = CAB % {'n_motor': len(en_motor), 'n_trozos': len(en_trozos),
             'lista': '\n'.join('     CARGA-PEREZOSA: modulos/entrenador/%s.js   (%d)' % (t[1], len(t[3])) for t in trozos)} \
      + '\n'.join(partes[n] for n in sorted(partes)) + PIE
assert '</script' not in out.lower()
destino = repo / 'modulos' / 'entrenador.js'
carpeta = repo / 'modulos' / 'entrenador'
indice = repo / 'datos' / 'cuerpo' / 'con-video.json'
quiere = {t[1] + '.js': t[2] for t in trozos}
hay = {p.name: p for p in carpeta.glob('*')} if carpeta.is_dir() else {}
if '--comprobar' in sys.argv:
    igual = destino.exists() and destino.read_text(encoding='utf-8') == out
    igual_t = sorted(hay) == sorted(quiere) and all(hay[n].read_text(encoding='utf-8') == quiere[n] for n in quiere)
    igual_h = (aqui / 'src' / '90-huellas.js').read_text(encoding='utf-8') == huellas
    igual_i = indice.exists() and indice.read_text(encoding='utf-8') == con_video
    print('modulos/entrenador.js', 'es el que sale de tools/entrenador/src/' if igual and igual_h else 'NO es el que sale de tools/entrenador/src/ (o la ficha de algún ejercicio ha cambiado): python3 tools/entrenador/construir.py')
    print('modulos/entrenador/', ('son los %d trozos que salen de tools/entrenador/src/' % len(quiere)) if igual_t else
          'NO son los trozos que salen de tools/entrenador/src/ (sobran %s; faltan o han cambiado %s): python3 tools/entrenador/construir.py'
          % (sorted(set(hay) - set(quiere)) or 'ninguno', sorted(n for n in quiere if n not in hay or hay[n].read_text(encoding='utf-8') != quiere[n]) or 'ninguno'))
    print('datos/cuerpo/con-video.json', 'es el que sale de las coreografías' if igual_i else 'NO es el que sale de las coreografías: python3 tools/entrenador/construir.py')
    sys.exit(0 if igual and igual_t and igual_h and igual_i else 1)
(aqui / 'src' / '90-huellas.js').write_text(huellas, encoding='utf-8')
destino.write_text(out, encoding='utf-8')
carpeta.mkdir(exist_ok=True)
for n, p in hay.items():
    if n not in quiere: p.unlink()
for n, js in quiere.items(): (carpeta / n).write_text(js, encoding='utf-8')
indice.write_text(con_video, encoding='utf-8')
print('modulos/entrenador.js', len(out.encode('utf-8')), 'bytes,', len(partes), 'trozos de fuente,', len(en_motor), 'coreografías')
for t in trozos: print('modulos/entrenador/%s.js' % t[1], len(t[2].encode('utf-8')), 'bytes,', len(t[3]), 'coreografías')
print('en total,', len(ids), 'coreografías y', len(out.encode('utf-8')) + sum(len(t[2].encode('utf-8')) for t in trozos), 'bytes')
