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
 * SE BUSCA POR `es`, NO POR `zht`. Buscar por zht parecia mas comodo -es el
 * ultimo de los ocho- pero dejaba fuera justo las filas que hay que
 * encontrar: una fila a la que le falte zht no tiene zht, asi que el control
 * no la veia ni como completa ni como hueco. Con eso, 107 horarios de lugar
 * daban verde en los ocho idiomas teniendo 84 sin chino y 33 sin italiano ni
 * neerlandes. Toda fila de idioma tiene `es`, porque el castellano es el
 * original.
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
const IDI = IDI_BASE.concat(['bg']);
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

/* EXCEPCIONES DECLARADAS EN EL PROPIO FUENTE.
   Hay una tabla que NO se traduce y no es un descuido: los titulos exactos de
   articulo de Wikipedia. Un titulo inventado no devuelve el articulo. En vez
   de llevar esa lista dentro de la herramienta -donde envejece y nadie la ve-
   la excepcion se declara al lado de la tabla con un comentario
   "SIN-TRADUCIR: <nombre>", y aqui se lee. Asi el que lee el codigo ve por
   que, y el control no canta lobo cada vez que se ejecuta. */
const exentas = [];
for (const m of src.matchAll(/SIN-TRADUCIR:\s*([A-Za-z_$][\w$]*)/g)) {
  const re = new RegExp('(?:const|let|var)\\s+' + m[1].replace(/\$/g, '\\$') + '\\s*=\\s*\\{', 'g');
  let d;
  while ((d = re.exec(src))) {
    const ini = re.lastIndex - 1;
    const o = objetos.find(x => x.ini === ini);
    if (o) exentas.push({ nom: m[1], ini: o.ini, fin: o.fin });
  }
}
const esExenta = o => exentas.some(e => o.ini >= e.ini && o.fin <= e.fin);
const filas = [];
const dentroDeOtra = [];
for (const o of objetos) {
  if (o.fin - o.ini > 200000) continue;
  const t = src.slice(o.ini, o.fin);
  if (!/(?:^|[{,\s])(?:es|"es"|'es')\s*:/.test(t)) continue;
  let v; try { v = eval('(' + t + ')'); } catch (e) { continue; }
  if (v.es === undefined || typeof v.es === 'function') continue;
  /* Si el valor de `es` es un objeto de claves, esto no es una fila: es una
     TABLA entera "por idioma" (LANGS, UI_TX, AUTH_STRINGS...). De esas se
     ocupa inventario_idiomas.js, que sabe mirar clave a clave. Contarlas
     aqui ademas hacia cantar lobo: AUTH_STRINGS no tiene zht a proposito,
     porque LANGS.zht se clona de zh y luego se le aplican ZHT_OVERRIDES. */
  if (v.es && typeof v.es === 'object' && !Array.isArray(v.es)) continue;
  /* con un solo idioma no es una fila de idioma: es un objeto que casualmente
     tiene una clave `es`. Con dos ya hay traduccion que vigilar. */
  if (IDI.filter(l => v[l] !== undefined).length < 2) continue;
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
  if (OBJ && f.v[OBJ] === undefined && !esExenta(f)) { por[z].sin++; huecos.push({ z, l: f.l, es: String(f.v.es).slice(0, 60) }); }
}
const P = (t, v) => console.log('  ' + String(t).padEnd(40, '.') + ' ' + v);
console.log('=== filas de idioma en todo index.html ===');
P('total', filas.length);
/* Lo que antes no se veia: filas a las que les falta uno de los OCHO base.
   No es cosa del idioma nuevo; son huecos que llevaban ahi desde antes. */
const cojas = filas.filter(f => !IDI_BASE.every(l => f.v[l] !== undefined) && !esExenta(f));
P('a las que les falta un idioma base', cojas.length);
if (exentas.length) {
  const dentroExentas = filas.filter(esExenta).length;
  P('exentas por declaracion en el fuente', dentroExentas + '   (' + [...new Set(exentas.map(e => e.nom))].join(', ') + ')');
}
if (cojas.length) {
  const por = {};
  cojas.forEach(f => {
    IDI_BASE.forEach(l => { if (f.v[l] === undefined) por[l] = (por[l] || 0) + 1; });
  });
  console.log('      ' + IDI_BASE.filter(l => por[l]).map(l => l + ': ' + por[l]).join(' · '));
}
for (const z of ['interfaz', 'places[]'])
  P(z, por[z].n + (OBJ ? '   sin ' + OBJ + ': ' + por[z].sin : ''));
if (OBJ) {
  const sin = por['interfaz'].sin + por['places[]'].sin;
  P('completas en ' + OBJ, filas.length - sin);
  if (LISTA) huecos.forEach(h => console.log('   ' + h.z.padEnd(9) + ' linea ' + String(h.l).padStart(6) + '  ' + h.es));
  process.exitCode = (por['interfaz'].sin || cojas.length) ? 1 : 0;
}
