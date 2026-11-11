#!/usr/bin/env python3
# Lo que las páginas de prueba, la muestra y la grabación necesitan de la app, en un fichero:
# los textos de los ejercicios con vídeo (10 idiomas), sus datos y los rótulos de «Su cuerpo».
#     python3 tools/entrenador/muestra.py     escribe tools/entrenador/pruebas/datos-muestra.js
import json, re, pathlib, sys
aqui = pathlib.Path(__file__).resolve().parent
repo = aqui.parents[1]
coreo = (aqui / 'src' / '70-coreografias.js').read_text(encoding='utf-8')
ids = [a or b for a, b in re.findall(r"^\s*COREO(?:\['([a-z0-9-]+)'\]|\.([a-z0-9_]+)) = \{", coreo, re.M)]
E = {e['id']: e for e in json.loads((repo / 'datos/cuerpo/ejercicios.json').read_text(encoding='utf-8'))['ejercicios']}
falta = [i for i in ids if i not in E]
if falta: sys.exit('coreografías sin ficha: ' + ', '.join(falta))
IDIOMAS = ['es', 'en', 'fr', 'de', 'it', 'nl', 'zh', 'zht', 'bg', 'pl']
TX = {l: json.loads((repo / ('datos/cuerpo/ejercicios-%s.json' % l)).read_text(encoding='utf-8')) for l in IDIOMAS}
ej = {}
for i in ids:
    e = E[i]
    ej[i] = {'g': e['g'], 's': [x for x in e['s'] if x not in e['g']], 'e': e['e'], 'm': e['m'], 'n': e['n'], 't': e['t'], 'tx': {l: TX[l][i] for l in IDIOMAS if i in TX[l]}}
src = (repo / 'modulos/cuerpo.js').read_text(encoding='utf-8')
ui = {}
for m in re.finditer(r'^\s*"(cuerpo(?:G|Ent|Nivel|Mat|Tipo)_[a-z0-9_]+|cuerpoEjercicios|cuerpoComoSeHace|cuerpoMusculos|cuerpoPrincipal|cuerpoSecundario)": (\{.*?\}),?\s*$', src, re.M):
    ui[m.group(1)] = json.loads(m.group(2))
out = 'window.TG_MUESTRA = ' + json.dumps({'ui': ui, 'ej': ej, 'total': len(E)}, ensure_ascii=False, separators=(',', ':')) + ';\n'
(aqui / 'pruebas' / 'datos-muestra.js').write_text(out, encoding='utf-8')
print('tools/entrenador/pruebas/datos-muestra.js:', len(ids), 'ejercicios,', len(ui), 'rótulos,', len(out.encode()), 'bytes')
