#!/usr/bin/env node
/* lugares_traduccion.js — las fichas de los lugares de un idioma nuevo, ANCLADAS EN EL CASTELLANO.
 *
 *   node tools/lugares_traduccion.js ro --probar      dice cuantas casan, cuales han cambiado y cuantas faltan
 *   node tools/lugares_traduccion.js ro --probar --lista   y cuales faltan, una a una
 *   node tools/lugares_traduccion.js ro               monta idiomas/ro.json (solo si estan todas y todas casan)
 *
 * Lee idiomas/<lang>-fuente/lugares-*.json (los trozos del rumano: bloques R5 a R9). Cada texto lleva su
 * tabla («places»), su clave («teide.desc») y EL CASTELLANO QUE TRADUCE, como las filas de
 * tools/poner_traduccion.js:
 *
 *   { "idioma": "ro", "filas": [ { "tabla": "places", "clave": "teide.desc", "es": "…", "forma": "texto", "ro": "…" } ] }
 *
 * POR QUE NO tools/lugares_idioma.js montar. Aquel junta trozos sin castellano: si entre la traduccion y
 * la entrega alguien cambia la descripcion de una ficha en index.html, el texto viejo entra igual y nadie
 * se entera (una ficha con una traduccion de otra cosa no da error en la app). Aqui cada texto se compara
 * con lo que index.html dice HOY: si el castellano de una ficha cambio, esa fila no casa, se dice cual es
 * y NO SE ESCRIBE NADA. Es lo mismo que poner_traduccion.js hace con la interfaz.
 *
 * Mientras falten fichas (los bloques que vienen), --probar da 0 si todo lo que hay casa, y montar no
 * escribe: un idioma a medias no se ofrece, y tools/activar_idioma.js no activa el idioma mientras no exista
 * idiomas/<lang>.json. El fichero que escribe es el de los otros idiomas, una linea por ficha, con el mismo
 * formato que lugares_idioma.js montar.
 */
'use strict';
const fs = require('fs'), path = require('path');
const RAIZ = path.join(__dirname, '..');
const CAMPOS = ['desc', 'cat', 'hours', 'aviso'];
const args = process.argv.slice(2);
const L = args.find(a => !a.startsWith('--'));
const PROBAR = args.includes('--probar'), LISTA = args.includes('--lista');
if (!/^[a-z]{2,3}$/.test(L || '')) { console.error('uso: node tools/lugares_traduccion.js <idioma> [--probar] [--lista]'); process.exit(2); }

/* los lugares de index.html, como los lee lugares_idioma.js */
function places() {
  const src = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
  const i = src.indexOf('const places = [');
  if (i < 0) { console.error('no encuentro places en index.html'); process.exit(2); }
  const o = src.indexOf('[', i);
  let d = 0, q = null, fin = -1;
  for (let k = o; k < src.length; k++) {
    const c = src[k], p = src[k - 1];
    if (q) { if (c === q && p !== '\\') q = null; continue; }
    if (c === '"' || c === "'" || c === '`') { q = c; continue; }
    if (c === '[') d++; else if (c === ']') { d--; if (d === 0) { fin = k + 1; break; } }
  }
  if (fin < 0) { console.error('places no cierra'); process.exit(2); }
  return eval('(' + src.slice(o, fin) + ')');
}
const campoDe = (p, c) => c === 'aviso' ? (p.parking && p.parking.aviso) : p[c];

const P = places();
const debe = new Map();                        // «id.campo» -> el castellano de hoy, en el orden de index.html
for (const p of P) for (const c of CAMPOS) {
  const f = campoDe(p, c);
  if (f && typeof f.es === 'string') debe.set(p.id + '.' + c, f.es);
}
const ids = new Set(P.map(p => p.id));

/* los trozos */
const DIR = path.join(RAIZ, 'idiomas', L + '-fuente');
const ficheros = fs.existsSync(DIR) ? fs.readdirSync(DIR).filter(f => /^lugares-[\w-]+\.json$/.test(f)).sort() : [];
if (!ficheros.length) { console.error('no hay idiomas/' + L + '-fuente/lugares-*.json'); process.exit(2); }
const tiene = new Map(), malos = [], cambiadas = [], sobran = [];
for (const f of ficheros) {
  const D = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  if (D.idioma !== L || !Array.isArray(D.filas)) { malos.push(f + ': no es un fichero de ' + L + ' con «filas»'); continue; }
  let n = 0;
  for (const r of D.filas) {
    const donde = f + ' · ' + r.clave;
    const m = /^(.+)\.(desc|cat|hours|aviso)$/.exec(r.clave || '');
    if (r.tabla !== 'places' || !m) { malos.push(donde + ': tabla o clave que no son de una ficha'); continue; }
    if (typeof r.es !== 'string' || typeof r[L] !== 'string' || !r[L].trim()) { malos.push(donde + ': sin castellano o sin texto'); continue; }
    if (tiene.has(r.clave)) { malos.push(donde + ': ya estaba en ' + tiene.get(r.clave).f); continue; }
    if (!ids.has(m[1])) { sobran.push(donde + ': ese lugar ya no esta en index.html'); continue; }
    if (!debe.has(r.clave)) { sobran.push(donde + ': index.html ya no pide ese campo'); continue; }
    if (debe.get(r.clave) !== r.es) { cambiadas.push({ donde, antes: r.es, ahora: debe.get(r.clave) }); continue; }
    tiene.set(r.clave, { f, texto: r[L] });
    n++;
  }
  console.log('  ' + f + ': ' + D.filas.length + ' textos, ' + n + ' casan');
}
const faltan = [...debe.keys()].filter(k => !tiene.has(k));
const lugaresFaltan = new Set(faltan.map(k => k.replace(/\.(desc|cat|hours|aviso)$/, '')));
console.log('casan ' + tiene.size + ' de ' + debe.size + ' textos de index.html (' + P.length + ' lugares); faltan '
  + faltan.length + ' textos de ' + lugaresFaltan.size + ' lugares');
malos.forEach(x => console.log('  MAL  ' + x));
sobran.forEach(x => console.log('  SOBRA  ' + x));
cambiadas.forEach(x => console.log('  CAMBIO EL CASTELLANO  ' + x.donde + '\n      entonces: ' + x.antes.slice(0, 160)
  + '\n      hoy:      ' + x.ahora.slice(0, 160) + '\n      (esa fila se traduce otra vez)'));
if (LISTA) faltan.forEach(k => console.log('  falta  ' + k));
const problemas = malos.length + sobran.length + cambiadas.length;

if (PROBAR) {
  console.log(problemas ? '--probar: ' + problemas + ' filas que no valen (arriba); no se ha escrito nada'
                        : '--probar: todo lo que hay casa' + (faltan.length ? ' (faltan los bloques que vienen)' : '; se puede montar'));
  process.exit(problemas ? 1 : 0);
}
if (problemas || faltan.length) {
  console.error((problemas ? problemas + ' filas que no valen' : '') + (problemas && faltan.length ? ' y ' : '')
    + (faltan.length ? faltan.length + ' textos sin traducir' : '') + ': no se ha escrito nada');
  process.exit(1);
}
/* idiomas/<lang>.json, una linea por ficha, en el orden de index.html, con el formato de lugares_idioma.js */
const salida = {};
for (const p of P) for (const c of CAMPOS) {
  const k = p.id + '.' + c;
  if (tiene.has(k)) (salida[p.id] = salida[p.id] || {})[c] = tiene.get(k).texto;
}
const fila = v => '{' + Object.entries(v).map(([c, t]) => JSON.stringify(c) + ': ' + JSON.stringify(t)).join(', ') + '}';
const ruta = path.join(RAIZ, 'idiomas', L + '.json');
fs.writeFileSync(ruta, '{\n' + Object.entries(salida).map(([k, v]) => ' ' + JSON.stringify(k) + ': ' + fila(v)).join(',\n') + '\n}\n');
console.log(ruta + '  ' + Object.keys(salida).length + ' lugares · ' + tiene.size + ' textos · '
  + Math.round(fs.statSync(ruta).size / 1024) + ' kB');
