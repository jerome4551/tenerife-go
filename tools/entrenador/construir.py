#!/usr/bin/env python3
# Junta los trozos de tools/entrenador/src/ en modulos/entrenador.js (un solo fichero, sin dependencias).
#     python3 tools/entrenador/construir.py              lo escribe
#     python3 tools/entrenador/construir.py --comprobar  dice si el que hay es el que sale de sus fuentes (sale con 1 si no)
# Antes apunta en src/90-huellas.js la huella de los pasos en castellano de cada ejercicio con
# coreografía (los 12 primeros caracteres del sha256 de sus pasos, unidos con un salto de línea):
# si la ficha cambia, tools/auditar_entrenador.js lo dice y la coreografía se revisa.
import pathlib, sys, re, json, hashlib
aqui = pathlib.Path(__file__).resolve().parent
repo = aqui.parents[1]
# las coreografías van en los trozos 7x (70, el bloque 1; 71, pecho; …), una por ejercicio: COREO['id'] = …
coreo = '\n'.join(t.read_text(encoding='utf-8') for t in sorted((aqui / 'src').glob('7*.js')))
ids = [a or b for a, b in re.findall(r"^\s*COREO(?:\['([a-z0-9-]+)'\]|\.([a-z0-9_]+)) = ", coreo, re.M)]
assert ids and len(ids) == len(set(ids)), 'ids repetidos o ninguno'
es = json.loads((repo / 'datos' / 'cuerpo' / 'ejercicios-es.json').read_text(encoding='utf-8'))
faltan = [i for i in ids if i not in es]
assert not faltan, 'coreografías sin ficha: %s' % faltan
def huella(pasos): return hashlib.sha256('\n'.join(pasos).encode('utf-8')).hexdigest()[:12]
huellas = '  /* las huellas de los pasos (las escribe construir.py) */\n  var HUELLAS = ' + json.dumps({i: huella(es[i][1]) for i in ids}, ensure_ascii=False, separators=(', ', ': ')) + ';\n'
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
   TG_ENTRENADOR.tiene(id, nPasos) · TG_ENTRENADOR.montar(caja, datos, opc) → reproductor
   (reproducir, pausar, irA, tema, quitar) · TG_ENTRENADOR.ids() · .huellas · .textos (los diez idiomas).
   innerHTML solo recibe constantes de este fichero (dibujos e iconos); los textos de la ficha
   entran con textContent.

   NO EDITAR A MANO: lo hace tools/entrenador/construir.py juntando los trozos de tools/entrenador/src/. */
(function () {
  'use strict';
'''
PIE = '''
})();
'''
trozos = {t.name: t.read_text(encoding='utf-8') for t in (aqui / 'src').glob('*.js')}
# dos funciones con el mismo nombre en trozos distintos: la segunda pisa a la primera sin avisar
vistas = {}
for nombre in sorted(trozos):
    for f in re.findall(r'^  function ([A-Za-z0-9_$]+)', trozos[nombre], re.M):
        assert f not in vistas, 'la función %s está en %s y en %s' % (f, vistas[f], nombre)
        vistas[f] = nombre
trozos['90-huellas.js'] = huellas
out = CAB + '\n'.join(trozos[n] for n in sorted(trozos)) + PIE
destino = repo / 'modulos' / 'entrenador.js'
if '--comprobar' in sys.argv:
    igual = destino.exists() and destino.read_text(encoding='utf-8') == out
    print('modulos/entrenador.js', 'es el que sale de tools/entrenador/src/' if igual else 'NO es el que sale de tools/entrenador/src/ (o la ficha de algún ejercicio ha cambiado): python3 tools/entrenador/construir.py')
    sys.exit(0 if igual else 1)
(aqui / 'src' / '90-huellas.js').write_text(huellas, encoding='utf-8')
destino.write_text(out, encoding='utf-8')
print('modulos/entrenador.js', len(out.encode('utf-8')), 'bytes,', len(trozos), 'trozos,', len(ids), 'coreografías')
