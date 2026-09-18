#!/usr/bin/env node
/* Saca de index.html los textos castellanos de los lugares, y monta el
 * idiomas/<lang>.json de un idioma nuevo a partir de los trozos escritos.
 *
 *   node tools/lugares_idioma.js volcar            todos, a un fichero
 *   node tools/lugares_idioma.js volcar 3          solo el trozo 3 (de 100)
 *   node tools/lugares_idioma.js montar pl         junta idiomas/pl-lugares/*.json
 *
 * El volcado es un fichero de trabajo: sale de index.html y se vuelve a sacar
 * cuando haga falta, asi que no se guarda en el repositorio (.gitignore).
 *
 * El montaje NO escribe nada si el resultado no coincide exactamente, id por
 * id y campo por campo, con lo que index.html pide. Un fichero de idioma al
 * que le falte una descripcion no da error en la app: ese lugar sale en
 * castellano y nadie se entera.
 */
'use strict';
const fs = require('fs'), path = require('path');
const RAIZ = path.join(__dirname, '..');
const CAMPOS = ['desc', 'cat', 'hours', 'aviso'];
const TROZO = 100;

function places() {
  const src = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
  const i = src.indexOf('const places = [');
  if (i < 0) { console.error('no encuentro places'); process.exit(2); }
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
const filas = [];
for (const p of P) for (const c of CAMPOS) {
  const f = campoDe(p, c);
  if (f && typeof f.es === 'string') filas.push({ id: p.id, nombre: p.name, campo: c, es: f.es });
}

const accion = process.argv[2];
if (accion === 'volcar') {
  const n = process.argv[3] ? parseInt(process.argv[3], 10) : null;
  const ids = [...new Set(filas.map(f => f.id))];
  const sel = n ? ids.slice((n - 1) * TROZO, n * TROZO) : ids;
  const out = {};
  for (const f of filas) if (sel.indexOf(f.id) >= 0) {
    (out[f.id] = out[f.id] || { _nombre: f.nombre })[f.campo] = f.es;
  }
  const ruta = path.join(RAIZ, 'idiomas', 'es-lugares' + (n ? '-' + n : '') + '.json');
  fs.writeFileSync(ruta, JSON.stringify(out, null, 1));
  console.log(ruta + '  ' + Object.keys(out).length + ' lugares, '
            + filas.filter(f => sel.indexOf(f.id) >= 0).length + ' textos');
  console.log('trozos de ' + TROZO + ': ' + Math.ceil(ids.length / TROZO));
  process.exit(0);
}

if (accion === 'montar') {
  const L = process.argv[3];
  if (!L) { console.error('falta el idioma'); process.exit(2); }
  const dir = path.join(RAIZ, 'idiomas', L + '-lugares');
  if (!fs.existsSync(dir)) { console.error('no existe ' + dir); process.exit(2); }
  const junto = {};
  for (const f of fs.readdirSync(dir).sort()) {
    if (!/\.json$/.test(f)) continue;
    const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    for (const id in d) {
      if (junto[id]) { console.error(f + ': ' + id + ' ya estaba en otro trozo'); process.exit(1); }
      junto[id] = d[id];
    }
  }
  // lo que index.html pide, exactamente
  const debe = new Map();
  for (const f of filas) {
    if (!debe.has(f.id)) debe.set(f.id, new Set());
    debe.get(f.id).add(f.campo);
  }
  const fallos = [];
  for (const [id, campos] of debe) {
    const mio = junto[id];
    if (!mio) { fallos.push(id + ': no esta'); continue; }
    for (const c of campos) if (!mio[c] || !String(mio[c]).trim()) fallos.push(id + '.' + c + ': vacio');
    for (const c of Object.keys(mio)) {
      if (c === '_nombre') continue;
      if (!campos.has(c)) fallos.push(id + '.' + c + ': sobra, index.html no lo pide');
    }
  }
  for (const id of Object.keys(junto)) if (!debe.has(id)) fallos.push(id + ': sobra, no es un lugar');
  if (fallos.length) {
    fallos.slice(0, 30).forEach(x => console.error('  ' + x));
    console.error('(' + fallos.length + ' fallos) no se ha escrito nada');
    process.exit(1);
  }
  const salida = {};
  for (const [id, campos] of debe) {
    salida[id] = {};
    for (const c of CAMPOS) if (campos.has(c)) salida[id][c] = junto[id][c];
  }
  const ruta = path.join(RAIZ, 'idiomas', L + '.json');
  fs.writeFileSync(ruta, JSON.stringify(salida, null, 1));
  const n = Object.values(salida).reduce((a, v) => a + Object.keys(v).length, 0);
  console.log(ruta + '  ' + Object.keys(salida).length + ' lugares · ' + n + ' textos · '
            + Math.round(fs.statSync(ruta).size / 1024) + ' kB');
  process.exit(0);
}
console.error('uso: volcar [n] | montar <lang>');
process.exit(2);
