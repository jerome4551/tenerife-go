#!/usr/bin/env node
/* completar_cat.js — devuelve a las etiquetas `cat` los trozos que perdieron.
 *
 * La etiqueta `cat` es una lista separada por "·": "Golf · 9 Hoyos · Arona ·
 * Principiantes · Familias". Al traducir se cayeron trozos por el camino
 * -el frances dejo "Golf · 9 Trous · Arona · Debutants" y se quedo sin
 * "Familias"- en 439 fichas repartidas por siete idiomas. El bulgaro es el
 * unico que no perdio ninguno.
 *
 * NO SE INVENTA NINGUNA TRADUCCION. El glosario sale del propio catalogo:
 * de las fichas donde el numero de trozos SI cuadra se saca la pareja
 * (trozo en castellano -> trozo en ese idioma), posicion a posicion. Si un
 * trozo tiene dos traducciones distintas en el corpus, o no aparece en
 * ninguna ficha cuadrada, la ficha NO se toca y se apunta para mirarla a
 * mano. Preferir lo que ya esta escrito antes que escribir algo nuevo es
 * justo lo que impide que este programa se invente nada.
 *
 *     node tools/completar_cat.js <idioma>            solo mira y cuenta
 *     node tools/completar_cat.js <idioma> --escribe  escribe
 */
'use strict';
const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const LANG = process.argv[2];
const ESCRIBE = process.argv.indexOf('--escribe') !== -1;
const VER = process.argv.indexOf('--ver') !== -1;

const src = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
const i = src.indexOf('const places = ['), o = src.indexOf('[', i);
let d = 0, q = null, fin = 0;
for (let k = o; k < src.length; k++) {
  const c = src[k], p = src[k - 1];
  if (q) { if (c === q && p !== '\\') q = null; continue; }
  if (c === '"' || c === "'" || c === '`') { q = c; continue; }
  if (c === '[') d++; else if (c === ']') { d--; if (d === 0) { fin = k + 1; break; } }
}
const PLACES = eval('(' + src.slice(o, fin) + ')');
const ruta = path.join(RAIZ, 'idiomas', LANG + '.json');
if (!fs.existsSync(ruta)) { console.error('no hay idiomas/' + LANG + '.json'); process.exit(1); }
const D = JSON.parse(fs.readFileSync(ruta, 'utf8'));

const partir = t => String(t).split('·').map(x => x.trim()).filter(Boolean);

/* 1. el glosario, sacado de las fichas que cuadran */
const vistos = new Map();                       // trozo es -> Map(trozo tr -> veces)
for (const p of PLACES) {
  if (!p.cat || typeof p.cat.es !== 'string') continue;
  const tr = (D[p.id] || {}).cat;
  if (typeof tr !== 'string') continue;
  const a = partir(p.cat.es), b = partir(tr);
  if (a.length !== b.length) continue;
  for (let k = 0; k < a.length; k++) {
    if (!vistos.has(a[k])) vistos.set(a[k], new Map());
    const m = vistos.get(a[k]);
    m.set(b[k], (m.get(b[k]) || 0) + 1);
  }
}
/* El glosario que sale del catalogo no llega a todo: hay trozos que no
   aparecen en NINGUNA ficha cuadrada -"Apoyo", "Familias", "PADI"- y por
   eso hace falta un suplemento escrito a mano, uno por idioma, en
   idiomas/glosario-cat/<lang>.json. Se aplica solo donde el automatico no
   llega, y si dice algo distinto de lo que ya esta escrito en el catalogo,
   se avisa y MANDA EL CATALOGO: lo que ya esta traducido y en uso pesa mas
   que lo que yo escriba aqui. */
const glosario = new Map();
const ambiguos = [];
for (const [es, m] of vistos) {
  if (m.size === 1) { glosario.set(es, [...m.keys()][0]); continue; }
  /* dos traducciones distintas para el mismo trozo: se queda la que gana por
     goleada -3 a 1 o mas-, y si no, no se usa. */
  const orden = [...m.entries()].sort((x, y) => y[1] - x[1]);
  if (orden[0][1] >= orden[1][1] * 3) glosario.set(es, orden[0][0]);
  else ambiguos.push(es + ' -> ' + orden.map(([k, v]) => k + '(' + v + ')').join(' / '));
}

const supl = path.join(RAIZ, 'idiomas', 'glosario-cat', LANG + '.json');
const choques = [];
if (fs.existsSync(supl)) {
  const extra = JSON.parse(fs.readFileSync(supl, 'utf8'));
  for (const k of Object.keys(extra)) {
    if (glosario.has(k) && glosario.get(k) !== extra[k]) {
      choques.push(k + ': el catalogo dice "' + glosario.get(k) + '" y el suplemento "' + extra[k] + '"');
      continue;
    }
    if (!glosario.has(k)) glosario.set(k, extra[k]);
  }
}

/* 2. reconstruir */
let arreglados = 0, sinGlosario = [], igualQueAntes = 0;
for (const p of PLACES) {
  if (!p.cat || typeof p.cat.es !== 'string') continue;
  const tr = (D[p.id] || {}).cat;
  if (typeof tr !== 'string') continue;
  const a = partir(p.cat.es), b = partir(tr);
  if (a.length === b.length) continue;
  const falta = a.filter(s => !glosario.has(s));
  if (falta.length) { sinGlosario.push(p.id + '  ' + p.cat.es + '   [sin glosario: ' + falta.join(' | ') + ']'); continue; }

  /* SE CONSERVA LO QUE YA ESTA ESCRITO y solo se mete lo que falta. Rehacer
     la etiqueta entera con el glosario parecia mas limpio y era peor: el
     neerlandes decia "Laurierbos", que es la palabra neerlandesa, y el
     glosario lo habria cambiado por el latin "Laurisilva". Lo ya traducido
     manda; el glosario solo rellena huecos.
     El hueco se reconoce asi: si el trozo que toca en la traduccion es la
     traduccion de un trozo castellano POSTERIOR, entonces el de ahora no
     esta y hay que meterlo. */
  const out = [];
  let j = 0;
  for (let k = 0; k < a.length; k++) {
    const esperado = glosario.get(a[k]);
    if (j < b.length && b[j] === esperado) { out.push(b[j++]); continue; }
    const esDeOtro = j < b.length && a.slice(k + 1).some(x => glosario.get(x) === b[j]);
    if (j < b.length && !esDeOtro) { out.push(b[j++]); continue; }
    out.push(esperado);
  }
  while (j < b.length) out.push(b[j++]);   // nunca se tira nada de lo que habia

  /* y con el separador que ya usaba esa etiqueta: el chino escribe varias
     sin espacios alrededor del punto volado. */
  const sep = /\S·\S/.test(tr) ? '·' : ' · ';
  const nuevo = out.join(sep);
  if (nuevo === tr) { igualQueAntes++; continue; }
  if (VER) console.log('  ' + p.cat.es + '\n    antes: ' + tr + '\n    ahora: ' + nuevo);
  if (ESCRIBE) D[p.id].cat = nuevo;
  arreglados++;
}

console.log('=== ' + LANG + ' ===');
console.log('  trozos distintos en el glosario....... ' + glosario.size);
console.log('  trozos con dos traducciones y sin ganar ' + ambiguos.length);
console.log('  choques entre el suplemento y el catalogo  ' + choques.length);
choques.forEach(c => console.log('     CHOQUE ' + c));
console.log('  etiquetas reconstruidas............... ' + arreglados);
console.log('  etiquetas que no se tocan por falta de glosario  ' + sinGlosario.length);
if (sinGlosario.length && !ESCRIBE) sinGlosario.slice(0, 40).forEach(s => console.log('     ' + s));
if (ambiguos.length && !ESCRIBE) ambiguos.slice(0, 20).forEach(s => console.log('     AMBIGUO ' + s));

if (ESCRIBE) {
  fs.writeFileSync(ruta, '{\n' + Object.keys(D).map(k => ' ' + JSON.stringify(k) + ': ' + JSON.stringify(D[k])).join(',\n') + '\n}\n');
  console.log('  escrito idiomas/' + LANG + '.json');
}
