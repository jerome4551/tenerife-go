#!/usr/bin/env node
/* inventario_idiomas.js — que tablas de idioma hay, cuantas filas y quien
 * tiene hueco. Reutiliza la misma extraccion que tools/auditar_web.js: las
 * tablas que viven dentro de una funcion no se alcanzan desde el navegador y
 * hay que sacarlas del fuente por emparejamiento de llaves.
 *
 *     node tools/inventario_idiomas.js           resumen
 *     node tools/inventario_idiomas.js bg        que le falta a ese idioma
 */
'use strict';
/* DOS LISTAS, Y NO ES REDUNDANCIA.
   IDI_BASE es la que IDENTIFICA una tabla de idiomas; IDI es la que tiene que
   estar COMPLETA. Al anadir el bulgaro se metio en la unica lista que habia, y
   como la deteccion de las tablas "por idioma" exige que esten todos, ninguna
   de esas 20 tablas se reconocio: el informe paso de 31 tablas y 460 filas a
   11 y 199, y con el 261 filas dejaron de vigilarse. Un idioma nuevo no puede
   cegar al control que comprueba los idiomas. */
const IDI_BASE = ['es','en','fr','de','it','nl','zh','zht'];
const fs = require('fs');
const path = require('path');
const src = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const OBJETIVO = process.argv[2] || null;
const IDI = ['es','en','fr','de','it','nl','zh','zht','bg'];

const NOMBRES = [...new Set([...src.matchAll(/^\s*(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:\{|Object\.assign)/gm)].map(m => m[1]))];

function objetoEn(i) {
  let d = 0, q = null;
  for (let k = i; k < src.length; k++) {
    const c = src[k];
    if (q) { if (c === q && src[k-1] !== '\\') q = null; continue; }
    if (c === '/' && src[k+1] === '/') { k = src.indexOf('\n', k); if (k < 0) return null; continue; }
    if (c === '/' && src[k+1] === '*') { k = src.indexOf('*/', k) + 1; continue; }
    if (c === '"' || c === "'" || c === '`') { q = c; continue; }
    if (c === '{') d++;
    else if (c === '}') { d--; if (!d) return src.slice(i, k + 1); }
  }
  return null;
}
const esFila = x => x && typeof x === 'object' && !Array.isArray(x) && typeof x.es === 'string';

const tablas = [];
for (const nom of NOMBRES) {
  const re = new RegExp('(?:const|let|var)\\s+' + nom.replace(/\$/g, '\\$') + '\\s*=\\s*\\{', 'g');
  let m, mejor = null;
  while ((m = re.exec(src))) { const t = objetoEn(re.lastIndex - 1); if (t && (!mejor || t.length > mejor.length)) mejor = t; }
  if (!mejor) continue;
  let v; try { v = eval('(' + mejor + ')'); } catch (e) { continue; }
  const ks = Object.keys(v); if (!ks.length) continue;
  const f = ks.filter(k => esFila(v[k]));
  if (f.length && f.length >= ks.length * 0.6) {
    const t = {}; f.forEach(k => t[k] = v[k]);
    tablas.push({ nom, forma: 'por clave', filas: t }); continue;
  }
  if (IDI_BASE.every(l => v[l] !== undefined)) {
    const t = {};
    if (IDI_BASE.every(l => v[l] && typeof v[l] === 'object' && !Array.isArray(v[l]))) {
      const cl = new Set(); IDI_BASE.forEach(l => Object.keys(v[l]).forEach(k => cl.add(k)));
      cl.forEach(k => { const fila = {}; IDI.forEach(l => { if (v[l] && typeof v[l][k] === 'string') fila[l] = v[l][k]; }); t[k] = fila; });
    } else { const fila = {}; IDI.forEach(l => { if (typeof v[l] === 'string') fila[l] = v[l]; }); t['(fila unica)'] = fila; }
    tablas.push({ nom, forma: 'por idioma', filas: t });
  }
}

let total = 0, falta = 0;
tablas.sort((a, b) => Object.keys(b.filas).length - Object.keys(a.filas).length);
for (const t of tablas) {
  const n = Object.keys(t.filas).length; total += n;
  let sin = 0;
  if (OBJETIVO) sin = Object.values(t.filas).filter(f => typeof f[OBJETIVO] !== 'string' || !f[OBJETIVO].trim()).length;
  falta += sin;
  console.log('  ' + t.nom.padEnd(24) + t.forma.padEnd(12) + String(n).padStart(4) + ' filas' +
              (OBJETIVO ? (sin ? '   le faltan ' + sin + ' en ' + OBJETIVO : '   completo en ' + OBJETIVO) : ''));
}
console.log('  ' + '-'.repeat(56));
console.log('  ' + tablas.length + ' tablas · ' + total + ' filas' +
            (OBJETIVO ? ' · sin ' + OBJETIVO + ': ' + falta : ''));
