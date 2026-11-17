#!/usr/bin/env python3
# Monta la página de muestra (un solo fichero, para publicarla o abrirla en el móvil): la plantilla,
# con el motor, sus trozos y los datos dentro. Antes: python3 tools/entrenador/muestra.py
#     python3 tools/entrenador/muestra/construir.py [salida.html]
import pathlib, sys, re
aqui = pathlib.Path(__file__).resolve().parent
repo = aqui.parents[2]
motor = (repo / 'modulos' / 'entrenador.js').read_text(encoding='utf-8')
# (16-11-2026) las coreografías van por trozos en modulos/entrenador/ y la app los pide al abrir una ficha; aquí, que es
# un solo fichero y no puede pedir nada, van todos pegados detrás del motor (los que él nombra en su cabecera)
trozos = re.findall(r'CARGA-PEREZOSA: modulos/entrenador/([a-z0-9-]+\.[0-9a-f]{8}\.js)', motor)
assert trozos, 'el motor no nombra ningún trozo'
motor = '\n'.join([motor] + [(repo / 'modulos' / 'entrenador' / t).read_text(encoding='utf-8') for t in trozos])
datos = (aqui.parent / 'pruebas' / 'datos-muestra.js').read_text(encoding='utf-8')
assert '</script' not in motor.lower() and '</script' not in datos.lower()
s = (aqui / 'plantilla.html').read_text(encoding='utf-8')
assert s.count('/*__MOTOR__*/') == 1 and s.count('/*__DATOS__*/') == 1 and s.count('/*__PESO__*/0') == 1
s = s.replace('/*__MOTOR__*/', motor).replace('/*__DATOS__*/', datos).replace('/*__PESO__*/0', str(round(len(motor.encode('utf-8')) / 1024)))
out = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else aqui / 'jerome-entrenador.html'
out.write_text(s, encoding='utf-8')
print(out, len(s.encode('utf-8')), 'bytes')
