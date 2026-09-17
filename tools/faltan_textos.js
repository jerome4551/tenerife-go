#!/usr/bin/env node
/* faltan_textos.js — descripciones a las que les falta contenido.
 *
 * Al traducir largo se cae el final sin que nadie lo note: el texto sigue
 * leyendose bien, solo que dice menos. En la cumbre del Teide el castellano
 * avisa de que puede bajar de 0°C y hay que llevar abrigo; el frances y el
 * italiano no lo dicen. No es un matiz de estilo, es informacion que el
 * visitante no recibe, y en ese caso ademas es de seguridad.
 *
 * COMO SE MIDE, Y POR QUE NO CONTANDO FRASES. Primero se conto frases, y
 * daba seis fallos en bulgaro que no existian: el castellano escribe "Av.",
 * "Ctra.", "C.C." y "s. XVIII", y cada punto de esos parte una frase de
 * mentira. Lo que si aguanta es la PROPORCION DE LONGITUD contra la mediana
 * DE ESE IDIOMA: el chino dice lo mismo en un tercio de caracteres y el
 * neerlandes en uno y uno, asi que cada idioma se compara consigo mismo y no
 * con una cifra inventada. Por debajo del 70% de su propia mediana, falta
 * texto.
 *
 *     node tools/faltan_textos.js de           cuantas y cuales
 *     node tools/faltan_textos.js de 12        las 12 peores, enteras
 *     node tools/faltan_textos.js de --ids     solo los identificadores
 */
'use strict';
const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const LANG = process.argv[2];
const N = /^\d+$/.test(process.argv[3] || '') ? Number(process.argv[3]) : 0;
const SOLO_IDS = process.argv.indexOf('--ids') !== -1;
const DESDE = Number((process.argv.find(a => a.startsWith('--desde=')) || '').split('=')[1] || 0);

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
const D = JSON.parse(fs.readFileSync(path.join(RAIZ, 'idiomas', LANG + '.json'), 'utf8'));

const filas = [];
for (const p of PLACES) {
  if (!p.desc || typeof p.desc.es !== 'string' || p.desc.es.length < 80) continue;
  const tr = (D[p.id] || {}).desc;
  if (typeof tr !== 'string') continue;
  filas.push({ id: p.id, es: p.desc.es, tr, r: tr.length / p.desc.es.length });
}
filas.sort((a, b) => a.r - b.r);
const mediana = filas[Math.floor(filas.length / 2)].r;
const corte = mediana * 0.70;
const malas = filas.filter(f => f.r < corte);

if (SOLO_IDS) { console.log(malas.map(f => f.id).join('\n')); process.exit(0); }
console.log('=== ' + LANG + ' · mediana ' + mediana.toFixed(2) + ' · corte ' + corte.toFixed(2) + ' ===');
console.log('    descripciones con texto de menos: ' + malas.length + ' de ' + filas.length);
if (!N) {
  malas.slice(0, 30).forEach(f => console.log('  ' + f.r.toFixed(2) + '  ' + f.id));
  if (malas.length > 30) console.log('  ... y ' + (malas.length - 30) + ' mas');
  process.exit(0);
}
malas.slice(DESDE, DESDE + N).forEach((f, n) => {
  console.log('\n### ' + (DESDE + n + 1) + ' · ' + f.id + '  (' + f.r.toFixed(2) + ')');
  console.log('ES: ' + f.es);
  console.log('TR: ' + f.tr);
});
