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
      /* se copia CUALQUIER valor, no solo cadenas: hay filas que son listas
         (I18N.steps, CHAT_STR.qrHome, HM_T.items, DP_STEP_TITLE, texts) y al
         filtrar por typeof 'string' desaparecian de la tabla, asi que ningun
         idioma podia estar ni bien ni mal en ellas. */
      cl.forEach(k => { const fila = {}; IDI.forEach(l => { if (v[l] && v[l][k] !== undefined) fila[l] = v[l][k]; }); t[k] = fila; });
    } else { const fila = {}; IDI.forEach(l => { if (v[l] !== undefined) fila[l] = v[l]; }); t['(fila unica)'] = fila; }
    tablas.push({ nom, forma: 'por idioma', filas: t });
  }
}

/* UN HUECO NO ES SOLO UNA CADENA QUE FALTA.
   La prueba era typeof === 'string', y hay filas cuyo valor es una lista
   (I18N.steps, CHAT_STR.qrHome, HM_T.items, DP_STEP_TITLE, texts): con esa
   prueba salian como huecos aunque estuvieran, y —lo grave— habrian salido
   como huecos tambien si de verdad faltaran, sin que se pudiera distinguir.
   Ahora vale cualquier valor cuya FORMA coincida con la de alguno de los
   idiomas base, y la forma distinta se cuenta aparte. */
function forma(v) {
  if (v === null || v === undefined) return 'nada';
  if (Array.isArray(v)) return '[' + v.map(forma).join(',') + ']';
  if (typeof v === 'object') return '{' + Object.keys(v).sort().map(k => k + ':' + forma(v[k])).join(',') + '}';
  return typeof v;
}
function vacio(v) {
  if (typeof v === 'string') return !v.trim();
  if (Array.isArray(v)) return !v.length || v.some(vacio);
  if (v && typeof v === 'object') return !Object.keys(v).length || Object.keys(v).some(k => vacio(v[k]));
  return v === null || v === undefined;
}
function estado(fila, idi) {
  const v = fila[idi];
  if (v === undefined || vacio(v)) return 'falta';
  const buenas = IDI_BASE.filter(l => fila[l] !== undefined).map(l => forma(fila[l]));
  if (!buenas.length) return 'bien';
  return buenas.indexOf(forma(v)) === -1 ? 'forma' : 'bien';
}

let total = 0, falta = 0, torcidas = 0;
tablas.sort((a, b) => Object.keys(b.filas).length - Object.keys(a.filas).length);
for (const t of tablas) {
  const n = Object.keys(t.filas).length; total += n;
  let sin = 0, mal = 0;
  if (OBJETIVO) for (const f of Object.values(t.filas)) {
    const e = estado(f, OBJETIVO);
    if (e === 'falta') sin++; else if (e === 'forma') mal++;
  }
  falta += sin; torcidas += mal;
  let cola = '';
  if (OBJETIVO) cola = sin || mal
    ? '   ' + [sin ? 'le faltan ' + sin : '', mal ? mal + ' con forma distinta' : ''].filter(Boolean).join(' y ') + ' en ' + OBJETIVO
    : '   completo en ' + OBJETIVO;
  console.log('  ' + t.nom.padEnd(24) + t.forma.padEnd(12) + String(n).padStart(4) + ' filas' + cola);
}
console.log('  ' + '-'.repeat(56));
console.log('  ' + tablas.length + ' tablas · ' + total + ' filas' +
            (OBJETIVO ? ' · sin ' + OBJETIVO + ': ' + falta +
              (torcidas ? ' · con forma distinta: ' + torcidas : '') : ''));
