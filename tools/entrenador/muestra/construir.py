#!/usr/bin/env python3
# Monta la página de muestra (un solo fichero, para publicarla o abrirla en el móvil): la plantilla,
# con el motor y los datos dentro. Antes: python3 tools/entrenador/muestra.py
#     python3 tools/entrenador/muestra/construir.py [salida.html]
import pathlib, sys
aqui = pathlib.Path(__file__).resolve().parent
repo = aqui.parents[2]
motor = (repo / 'modulos' / 'entrenador.js').read_text(encoding='utf-8')
datos = (aqui.parent / 'pruebas' / 'datos-muestra.js').read_text(encoding='utf-8')
assert '</script' not in motor.lower() and '</script' not in datos.lower()
s = (aqui / 'plantilla.html').read_text(encoding='utf-8')
assert s.count('/*__MOTOR__*/') == 1 and s.count('/*__DATOS__*/') == 1 and s.count('/*__PESO__*/0') == 1
s = s.replace('/*__MOTOR__*/', motor).replace('/*__DATOS__*/', datos).replace('/*__PESO__*/0', str(round(len(motor.encode('utf-8')) / 1024)))
out = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else aqui / 'jerome-entrenador.html'
out.write_text(s, encoding='utf-8')
print(out, len(s.encode('utf-8')), 'bytes')
