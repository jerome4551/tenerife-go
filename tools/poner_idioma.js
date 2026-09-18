#!/usr/bin/env node
/* Mete un idioma nuevo en las filas de idioma de index.html.
 *
 * Las filas no se editan a mano: son 614 repartidas por 36.000 lineas, muchas
 * dentro de listas y sin nombre de tabla al que agarrarse. Aqui se localizan
 * con acorn -el mismo analizador que el barrido- y se escribe justo detras de
 * la ultima clave de idioma que ya tenga cada una, de atras hacia delante
 * para que los desplazamientos no se muevan bajo los pies.
 *
 * La traduccion se da en idiomas/<lang>-fuente/<TABLA>.json, una lista en el
 * MISMO ORDEN en que `node tools/faltan_pl.js <lang> <TABLA>` la enumera. Si
 * el numero no cuadra no se escribe nada: mas vale no tocar el fichero que
 * dejarlo con los textos corridos una posicion.
 *
 *     node tools/poner_idioma.js pl            mete todas las tablas que haya
 *     node tools/poner_idioma.js pl UI_TX      solo esa
 *     node tools/poner_idioma.js pl --listar   que tablas tienen fuente
 */
'use strict';
const fs = require('fs'), path = require('path');
const acorn = require('/opt/node22/lib/node_modules/eslint/node_modules/acorn');
const RAIZ = path.dirname(__dirname);
const RUTA = path.join(RAIZ, 'index.html');
const LANG = process.argv[2];
const SOLO = process.argv[3] && process.argv[3][0] !== '-' ? process.argv[3] : null;
const LISTAR = process.argv.indexOf('--listar') !== -1;
if (!LANG) { console.error('falta el idioma'); process.exit(2); }
const DIR = path.join(RAIZ, 'idiomas', LANG + '-fuente');

if (LISTAR) {
  if (!fs.existsSync(DIR)) { console.log('no hay ' + DIR); process.exit(0); }
  for (const f of fs.readdirSync(DIR).sort())
    console.log('  ' + f.replace(/\.json$/, '') + '  ' + JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')).length);
  process.exit(0);
}

const src = fs.readFileSync(RUTA, 'utf8');
const bloques = [];
{
  const re = /<script\b([^>]*)>/gi; let m;
  while ((m = re.exec(src))) {
    if (/src=/i.test(m[1])) continue;
    if (/type=/i.test(m[1]) && !/javascript|module/i.test(m[1])) continue;
    const ini = m.index + m[0].length, fin = src.indexOf('</script>', ini);
    if (fin > 0) bloques.push({ ini, js: src.slice(ini, fin) });
  }
}

/* Todas las filas que no tienen el idioma, en el mismo orden en que las
   enumera faltan_pl.js: el recorrido del arbol es el mismo. */
const filas = [];
for (const b of bloques) {
  let ast; try { ast = acorn.parse(b.js, { ecmaVersion: 'latest' }); } catch (e) { continue; }
  (function walk(n, nom) {
    if (!n || typeof n !== 'object') return;
    if (n.type === 'ObjectExpression') {
      const props = n.properties.filter(p => p.type === 'Property');
      const cl = props.map(p => p.key.name || p.key.value);
      if (cl.includes('es') && cl.includes('en') && cl.includes('fr')) {
        if (!cl.includes(LANG)) {
          const ultima = props[props.length - 1];
          filas.push({ tabla: nom || '(anonima)', fin: b.ini + ultima.end,
                       linea: src.slice(0, b.ini + n.start).split('\n').length,
                       es: props.find(p => (p.key.name || p.key.value) === 'es') });
        }
        return;
      }
    }
    let nuevo = nom;
    if (n.type === 'VariableDeclarator' && n.id && n.id.name) nuevo = n.id.name;
    for (const k in n) {
      if (k === 'start' || k === 'end' || k === 'loc') continue;
      const v = n[k];
      if (Array.isArray(v)) v.forEach(x => walk(x, nuevo));
      else if (v && typeof v === 'object' && v.type) walk(v, nuevo);
    }
  })(ast, null);
}

const porTabla = {};
for (const f of filas) (porTabla[f.tabla] = porTabla[f.tabla] || []).push(f);

const tablas = SOLO ? [SOLO] : Object.keys(porTabla).filter(t => fs.existsSync(path.join(DIR, t + '.json')));
if (!tablas.length) { console.log('no hay ninguna traduccion que meter en ' + DIR); process.exit(0); }

const aInsertar = [];
let fallo = false;
for (const t of tablas) {
  const fich = path.join(DIR, t + '.json');
  if (!fs.existsSync(fich)) { console.error('falta ' + fich); fallo = true; continue; }
  const textos = JSON.parse(fs.readFileSync(fich, 'utf8'));
  const dest = porTabla[t] || [];
  if (textos.length !== dest.length) {
    console.error(t + ': el fuente trae ' + textos.length + ' textos y faltan ' + dest.length + ' filas');
    fallo = true; continue;
  }
  dest.forEach((f, i) => {
    if (textos[i] === null || textos[i] === undefined) { console.error(t + '[' + i + ']: sin texto'); fallo = true; return; }
    aInsertar.push({ fin: f.fin, txt: ', ' + LANG + ': ' + JSON.stringify(textos[i]) });
  });
  console.log('  ' + t.padEnd(22) + ' ' + dest.length + ' filas');
}
if (fallo) { console.error('\nno se ha escrito nada'); process.exit(1); }

aInsertar.sort((a, b) => b.fin - a.fin);      // de atras hacia delante
let out = src;
for (const ins of aInsertar) out = out.slice(0, ins.fin) + ins.txt + out.slice(ins.fin);
fs.writeFileSync(RUTA, out);
console.log('\n' + aInsertar.length + ' filas con ' + LANG);
