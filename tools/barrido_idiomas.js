#!/usr/bin/env node
/* barrido_idiomas.js — TODA fila de idioma del fuente, viva donde viva.
 *
 * POR QUE HACE FALTA ADEMAS DE inventario_idiomas.js:
 * el inventario busca "const NOMBRE = {", asi que solo ve tablas con nombre.
 * No ve las filas metidas dentro de listas: GL_DATA (el glosario canario),
 * VIS_BADGES, SUMMIT... ni las de places[]. Anadir el bulgaro dio verde en el
 * inventario con el glosario entero sin traducir. Aqui se recorre el fichero
 * de una pasada y se recoge todo objeto que tenga los ocho idiomas base como
 * claves directas, tenga nombre o no.
 *
 *     node tools/barrido_idiomas.js            reparto de todas las filas
 *     node tools/barrido_idiomas.js bg         que le falta a ese idioma
 *     node tools/barrido_idiomas.js bg --lista donde estan los huecos
 */
'use strict';
const fs = require('fs');
const path = require('path');
const src = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const IDI_BASE = ['es','en','fr','de','it','nl','zh','zht'];
const OBJ = process.argv[2] && process.argv[2][0] !== '-' ? process.argv[2] : null;
const LISTA = process.argv.indexOf('--lista') !== -1;

/* Una pasada hacia delante con pila de llaves. Hacia atras no vale: para
   saber si una comilla abre o cierra hay que venir desde el principio. */
const pila = [];        // {ini, claves:Set}
const objetos = [];     // {ini, fin}
for (let k = 0; k < src.length; k++) {
  const c = src[k];
  if (c === '"' || c === "'" || c === '`') {
    const q = c;
    for (k++; k < src.length; k++) { if (src[k] === '\\') { k++; continue; } if (src[k] === q) break; }
    continue;
  }
  if (c === '/' && src[k+1] === '/') { k = src.indexOf('\n', k); if (k < 0) break; continue; }
  if (c === '/' && src[k+1] === '*') { k = src.indexOf('*/', k) + 1; continue; }
  if (c === '{') { pila.push(k); continue; }
  if (c === '}') { const a = pila.pop(); if (a !== undefined) objetos.push({ ini: a, fin: k + 1 }); continue; }
}
/* de dentro afuera: la fila de idioma es el objeto MAS PEQUENO que los tiene */
objetos.sort((a, b) => (a.fin - a.ini) - (b.fin - b.ini));
const linea = i => src.slice(0, i).split('\n').length;
const filas = [];
const dentroDeOtra = [];
for (const o of objetos) {
  if (o.fin - o.ini > 200000) continue;
  const t = src.slice(o.ini, o.fin);
  if (!/(?:^|[{,\s])(?:zht|"zht"|'zht')\s*:/.test(t)) continue;
  let v; try { v = eval('(' + t + ')'); } catch (e) { continue; }
  if (!IDI_BASE.every(l => v[l] !== undefined)) continue;
  if (dentroDeOtra.some(f => o.ini > f.ini && o.fin < f.fin)) continue;  // ya contada por fuera
  filas.push({ ini: o.ini, fin: o.fin, v, l: linea(o.ini) });
  dentroDeOtra.push(o);
}
filas.sort((a, b) => a.ini - b.ini);

/* de que parte del fichero es cada fila: places[] es el grueso y se mide aparte */
const iniPlaces = src.search(/(?:const|let|var)\s+places\s*=\s*\[/);
const finPlaces = iniPlaces < 0 ? -1 : (function () {
  let d = 0;
  for (let k = src.indexOf('[', iniPlaces); k < src.length; k++) {
    const c = src[k];
    if (c === '"' || c === "'" || c === '`') { const q = c; for (k++; k < src.length; k++) { if (src[k] === '\\') { k++; continue; } if (src[k] === q) break; } continue; }
    if (c === '[') d++; else if (c === ']') { d--; if (!d) return k; }
  }
  return -1;
})();
const zona = f => (iniPlaces >= 0 && f.ini > iniPlaces && f.fin < finPlaces) ? 'places[]' : 'interfaz';

const por = { 'places[]': { n: 0, sin: 0 }, 'interfaz': { n: 0, sin: 0 } };
const huecos = [];
for (const f of filas) {
  const z = zona(f); por[z].n++;
  if (OBJ && f.v[OBJ] === undefined) { por[z].sin++; huecos.push({ z, l: f.l, es: String(f.v.es).slice(0, 60) }); }
}
const P = (t, v) => console.log('  ' + String(t).padEnd(40, '.') + ' ' + v);
console.log('=== filas de idioma en todo index.html ===');
P('total', filas.length);
for (const z of ['interfaz', 'places[]'])
  P(z, por[z].n + (OBJ ? '   sin ' + OBJ + ': ' + por[z].sin : ''));
if (OBJ) {
  const sin = por['interfaz'].sin + por['places[]'].sin;
  P('completas en ' + OBJ, filas.length - sin);
  if (LISTA) huecos.forEach(h => console.log('   ' + h.z.padEnd(9) + ' linea ' + String(h.l).padStart(6) + '  ' + h.es));
  process.exitCode = por['interfaz'].sin ? 1 : 0;
}
