#!/usr/bin/env node
/* partir_idiomas.js — saca de index.html los ocho idiomas de places[].
 *
 * POR QUE: el 92% de lo que pesan los idiomas esta en places[] (1.862 kB de
 * 2.020), y son textos que NO se ven hasta que alguien abre un globo. La
 * interfaz -los otros 158 kB- se queda dentro del fichero a proposito: esa si
 * se ve en el primer pintado y no puede parpadear.
 *
 * QUE HACE: deja en index.html el castellano y escribe idiomas/<lang>.json
 * con los otros ocho. A partir de ahi esos ficheros SON la fuente de verdad
 * de esos textos; no hay copia en index.html que se pueda desincronizar.
 *
 * Formato: una linea por lugar, con su id de clave.
 *     { "teresitas": {"desc":"...","cat":"...","hours":"..."}, ... }
 * El id es unico y esta comprobado en auditar_datos.js. Un lugar que falte en
 * el fichero cae en castellano solo, que es lo que ya hace localized().
 *
 * LO QUE HACE QUE ESTO SEA SEGURO: antes de escribir nada, vuelve a montar
 * places[] a partir del index.html recortado mas los ocho ficheros y lo
 * compara CAMPO A CAMPO con el original. Si sobra o falta un solo caracter,
 * no escribe. Mover 13.928 textos a mano no se puede revisar leyendo.
 *
 *     node tools/partir_idiomas.js              dice lo que haria
 *     node tools/partir_idiomas.js --escribir   lo hace
 */
'use strict';
const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const RUTA = path.join(RAIZ, 'index.html');
const DIR = path.join(RAIZ, 'idiomas');
const ESCRIBIR = process.argv.indexOf('--escribir') !== -1;

const IDI = ['en', 'fr', 'de', 'it', 'nl', 'zh', 'zht', 'bg'];
const CAMPOS = ['desc', 'cat', 'hours', 'aviso'];

const src = fs.readFileSync(RUTA, 'utf8');

/* ── donde empieza y acaba places[] ──────────────────────────────────────
   Con pila de llaves y mirando las comillas: un corchete dentro de un texto
   no cierra nada. Hacia atras no se puede, hay que venir del principio. */
function span(decl, abre) {
  const i = src.indexOf(decl);
  if (i < 0) throw new Error('no encuentro ' + decl);
  const o = src.indexOf(abre, i);
  const cierra = abre === '[' ? ']' : '}';
  let d = 0, q = null;
  for (let k = o; k < src.length; k++) {
    const c = src[k], p = src[k - 1];
    if (q) { if (c === q && p !== '\\') q = null; continue; }
    if (c === '"' || c === "'" || c === '`') { q = c; continue; }
    if (c === abre) d++;
    else if (c === cierra) { d--; if (d === 0) return [o, k + 1]; }
  }
  throw new Error('no cierra ' + decl);
}
const [PI, PF] = span('const places = [', '[');

/* ── los objetos de idioma que hay que vaciar ────────────────────────────
   Se buscan por su NOMBRE DE CAMPO, no por tener un `es` dentro. Dentro de
   places[] hay mas objetos y no se les toca: lo que sale son exactamente
   desc, cat, hours y parking.aviso, que es lo que dijo el recuento. */
function objetosDeCampo() {
  const out = [];
  const re = /(^|[{,\s])(desc|cat|hours|aviso)\s*:\s*\{/g;
  re.lastIndex = PI;
  let m;
  while ((m = re.exec(src)) && m.index < PF) {
    const abre = src.indexOf('{', m.index + m[1].length + m[2].length);
    let d = 0, q = null, fin = -1;
    for (let k = abre; k < PF; k++) {
      const c = src[k], p = src[k - 1];
      if (q) { if (c === q && p !== '\\') q = null; continue; }
      if (c === '"' || c === "'" || c === '`') { q = c; continue; }
      if (c === '{') d++;
      else if (c === '}') { d--; if (d === 0) { fin = k + 1; break; } }
    }
    if (fin < 0) throw new Error('objeto ' + m[2] + ' sin cerrar en ' + m.index);
    out.push({ campo: m[2], ini: abre, fin });
    re.lastIndex = fin;
  }
  return out;
}

/* ── los valores de idioma dentro de uno de esos objetos ─────────────────── */
function valores(ini, fin) {
  const out = [];
  const re = /(,?\s*)(["']?)(es|en|fr|de|it|nl|zh|zht|bg)\2(\s*:\s*)/g;
  re.lastIndex = ini;
  let m;
  while ((m = re.exec(src)) && m.index < fin) {
    const i = m.index + m[0].length;
    const q = src[i];
    if (q !== '"' && q !== "'" && q !== '`') { continue; }
    let k = i + 1;
    for (; k < src.length; k++) { if (src[k] === '\\') { k++; continue; } if (src[k] === q) break; }
    out.push({ lang: m[3], desde: m.index, hasta: k + 1, crudo: src.slice(i, k + 1) });
    re.lastIndex = k + 1;
  }
  return out;
}

/* ── el id del lugar al que pertenece una posicion ───────────────────────
   Se busca el `id:"..."` mas cercano hacia atras. places[] escribe el id lo
   primero de cada lugar, y auditar_datos.js comprueba que los 804 son
   unicos y cumplen [a-z0-9-]. */
const IDS = [];
{
  const re = /\bid\s*:\s*"([a-z0-9-]+)"/g;
  re.lastIndex = PI;
  let m;
  while ((m = re.exec(src)) && m.index < PF) IDS.push({ pos: m.index, id: m[1] });
}
function idDe(pos) {
  let lo = 0, hi = IDS.length - 1, r = null;
  while (lo <= hi) {
    const md = (lo + hi) >> 1;
    if (IDS[md].pos <= pos) { r = IDS[md]; lo = md + 1; } else hi = md - 1;
  }
  return r && r.id;
}

/* ── recoger ─────────────────────────────────────────────────────────────── */
const objetos = objetosDeCampo();
const datos = {};                      // lang -> id -> campo -> texto
IDI.forEach(l => { datos[l] = {}; });
const quitar = [];                     // trozos a borrar del fuente
let nValores = 0, sinId = 0;

for (const o of objetos) {
  const id = idDe(o.ini);
  if (!id) { sinId++; continue; }
  for (const v of valores(o.ini, o.fin)) {
    if (v.lang === 'es') continue;     // el castellano se queda
    const txt = JSON.parse(v.crudo[0] === "'"
      ? '"' + v.crudo.slice(1, -1).replace(/\\'/g, "'").replace(/"/g, '\\"') + '"'
      : v.crudo);
    (datos[v.lang][id] = datos[v.lang][id] || {})[o.campo] = txt;
    quitar.push(v);
    nValores++;
  }
}

console.log('objetos de idioma en places[] : ' + objetos.length);
console.log('  sin id reconocible          : ' + sinId);
console.log('valores a sacar               : ' + nValores);
IDI.forEach(l => {
  const n = Object.keys(datos[l]).length;
  const c = Object.values(datos[l]).reduce((a, x) => a + Object.keys(x).length, 0);
  console.log('  ' + l.padEnd(4) + String(n).padStart(4) + ' lugares · ' + String(c).padStart(5) + ' textos');
});
if (sinId) { console.log('\nHAY OBJETOS SIN ID: no se escribe nada.'); process.exit(1); }
/* SEGURO CONTRA LA SEGUNDA PASADA.
   Esto es una mudanza, no una tarea que se repita. Volver a ejecutarlo sobre
   un index.html YA partido no encuentra nada que sacar... y escribiria ocho
   ficheros vacios encima de los buenos. Perder las 13.928 traducciones por
   teclear dos veces el mismo comando no puede depender de acordarse. */
if (nValores === 0) {
  console.log('\nNo hay ningun idioma que sacar: index.html ya esta partido.');
  console.log('No se escribe nada, para no vaciar idiomas/*.json.');
  process.exit(0);
}

/* ── recortar el fuente ──────────────────────────────────────────────────── */
quitar.sort((a, b) => a.desde - b.desde);
let nuevo = '', ult = 0;
for (const v of quitar) { nuevo += src.slice(ult, v.desde); ult = v.hasta; }
nuevo += src.slice(ult);

/* ── la comprobacion que lo hace seguro ───────────────────────────────────
   Se monta places[] desde el fuente recortado, se le pegan los ocho
   ficheros y se compara campo a campo con el original. */
function evaluarPlaces(texto) {
  const [a, b] = (function () {
    const i = texto.indexOf('const places = [');
    const o = texto.indexOf('[', i);
    let d = 0, q = null;
    for (let k = o; k < texto.length; k++) {
      const c = texto[k], p = texto[k - 1];
      if (q) { if (c === q && p !== '\\') q = null; continue; }
      if (c === '"' || c === "'" || c === '`') { q = c; continue; }
      if (c === '[') d++; else if (c === ']') { d--; if (d === 0) return [o, k + 1]; }
    }
    throw new Error('places[] no cierra');
  })();
  return eval('(' + texto.slice(a, b) + ')');
}
const antes = evaluarPlaces(src);
const despues = evaluarPlaces(nuevo);
if (antes.length !== despues.length) {
  console.log('\nel recorte cambia el numero de lugares: ' + antes.length + ' -> ' + despues.length);
  process.exit(1);
}
const trozo = (p, campo) => campo === 'aviso' ? (p.parking && p.parking.aviso) : p[campo];
let mal = 0, comparados = 0;
for (let i = 0; i < antes.length; i++) {
  const A = antes[i], B = despues[i];
  if (A.id !== B.id) { console.log('descuadre de id en ' + i); mal++; break; }
  for (const campo of CAMPOS) {
    const fa = trozo(A, campo);
    if (!fa) continue;
    const fb = trozo(B, campo) || {};
    for (const l of ['es'].concat(IDI)) {
      comparados++;
      const esperado = fa[l];
      const real = l === 'es' ? fb[l] : (datos[l][A.id] || {})[campo];
      if (esperado !== real) {
        if (mal < 5) console.log('  DISTINTO ' + A.id + '.' + campo + '.' + l);
        mal++;
      }
    }
  }
}
console.log('\ncampos comparados al volver a montarlo: ' + comparados + ' · distintos: ' + mal);
if (mal) { console.log('NO se escribe nada.'); process.exit(1); }

/* ── escribir ────────────────────────────────────────────────────────────── */
function serializar(obj) {
  const ids = Object.keys(obj);
  return '{\n' + ids.map(id => ' ' + JSON.stringify(id) + ': ' + JSON.stringify(obj[id]))
    .join(',\n') + '\n}\n';
}
const antesB = Buffer.byteLength(src, 'utf8');
const despuesB = Buffer.byteLength(nuevo, 'utf8');
console.log('index.html: ' + (antesB / 1024 / 1024).toFixed(2) + ' MB -> ' +
            (despuesB / 1024 / 1024).toFixed(2) + ' MB');
let suma = 0;
for (const l of IDI) suma += Buffer.byteLength(serializar(datos[l]), 'utf8');
console.log('los ocho ficheros suman: ' + (suma / 1024).toFixed(0) + ' kB');

if (!ESCRIBIR) { console.log('\n(prueba: no se ha escrito nada. --escribir para hacerlo)'); process.exit(0); }
fs.mkdirSync(DIR, { recursive: true });
for (const l of IDI) fs.writeFileSync(path.join(DIR, l + '.json'), serializar(datos[l]));
fs.writeFileSync(RUTA, nuevo);
console.log('\nescrito: index.html y idiomas/{' + IDI.join(',') + '}.json');
