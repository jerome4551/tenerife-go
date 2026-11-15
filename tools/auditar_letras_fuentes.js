#!/usr/bin/env node
/* auditar_letras_fuentes.js — ¿tienen las letras de la app las letras de cada idioma?
 *
 * La app trae sus letras (vendor/fuentes/*.woff2: Cormorant Garamond y DM Sans),
 * troceadas por unicode-range. Si a una le falta una letra, el navegador la pinta
 * con otra fuente del sistema: no da error, se ve una letra de otra familia en
 * mitad de la palabra. En rumano importa de verdad: ș y ț llevan COMA debajo
 * (U+0219, U+021B), y la cedilla (ş, ţ) es otra letra, la turca.
 *
 * Abre cada woff2 (brotli con el zlib de node, sin dependencias), lee su tabla
 * cmap y comprueba, para cada familia y peso, que las letras pedidas caen en el
 * unicode-range de algun trozo de vendor/fuentes.css Y que ese trozo las tiene.
 *
 *     node tools/auditar_letras_fuentes.js            el rumano: ă â î ș ț Ă Â Î Ș Ț y „ ” « » – — …
 *     node tools/auditar_letras_fuentes.js "ąęł"      otras letras
 */
'use strict';
const fs = require('fs'), path = require('path'), zlib = require('zlib');
const RAIZ = path.dirname(__dirname);
const LETRAS = [...(process.argv[2] || 'ăâîșțĂÂÎȘȚ„”«»–—…’')];

const TAGS = ['cmap', 'head', 'hhea', 'hmtx', 'maxp', 'name', 'OS/2', 'post', 'cvt ', 'fpgm', 'glyf', 'loca', 'prep', 'CFF ', 'VORG', 'EBDT',
  'EBLC', 'gasp', 'hdmx', 'kern', 'LTSH', 'PCLT', 'VDMX', 'vhea', 'vmtx', 'BASE', 'GDEF', 'GPOS', 'GSUB', 'EBSC', 'JSTF', 'MATH', 'CBDT', 'CBLC',
  'COLR', 'CPAL', 'SVG ', 'sbix', 'acnt', 'avar', 'bdat', 'bloc', 'bsln', 'cvar', 'fdsc', 'feat', 'fmtx', 'fvar', 'gvar', 'hsty', 'just', 'lcar',
  'mort', 'morx', 'opbd', 'prop', 'trak', 'Zapf', 'Silf', 'Glat', 'Gloc', 'Feat', 'Sill'];

function base128(b, o) {
  let v = 0;
  for (let i = 0; i < 5; i++) { const x = b[o.i++]; v = (v * 128) + (x & 0x7f); if (!(x & 0x80)) return v; }
  throw new Error('UIntBase128 mal formado');
}
/* los puntos de codigo que trae la tabla cmap de un woff2 */
function cmapWoff2(file) {
  const b = fs.readFileSync(file);
  if (b.toString('latin1', 0, 4) !== 'wOF2') throw new Error(file + ': no es woff2');
  const numTables = b.readUInt16BE(12), compLen = b.readUInt32BE(20);
  const o = { i: 48 }, tablas = [];
  for (let t = 0; t < numTables; t++) {
    const flags = b[o.i++];
    const tag = (flags & 0x3f) === 63 ? b.toString('latin1', o.i, (o.i += 4)) : TAGS[flags & 0x3f];
    const ver = flags >> 6;
    const orig = base128(b, o);
    let largo = orig;
    const transformada = (tag === 'glyf' || tag === 'loca') ? ver === 0 : (tag === 'hmtx' ? ver === 1 : false);
    if (transformada) largo = base128(b, o);
    tablas.push({ tag, largo });
  }
  const datos = zlib.brotliDecompressSync(b.subarray(o.i, o.i + compLen));
  let off = 0, cmap = null;
  for (const t of tablas) { if (t.tag === 'cmap') { cmap = datos.subarray(off, off + t.largo); break; } off += t.largo; }
  if (!cmap) throw new Error(file + ': sin cmap');
  const puntos = new Set();
  const n = cmap.readUInt16BE(2);
  for (let k = 0; k < n; k++) {
    const pid = cmap.readUInt16BE(4 + k * 8), eid = cmap.readUInt16BE(6 + k * 8), so = cmap.readUInt32BE(8 + k * 8);
    if (!((pid === 3 && (eid === 1 || eid === 10)) || pid === 0)) continue;
    const fmt = cmap.readUInt16BE(so);
    if (fmt === 4) {
      const seg = cmap.readUInt16BE(so + 6) / 2, ends = so + 14, starts = ends + seg * 2 + 2, deltas = starts + seg * 2, ranges = deltas + seg * 2;
      for (let s = 0; s < seg; s++) {
        const e = cmap.readUInt16BE(ends + s * 2), st = cmap.readUInt16BE(starts + s * 2), d = cmap.readInt16BE(deltas + s * 2), ro = cmap.readUInt16BE(ranges + s * 2);
        for (let c = st; c <= e && c !== 0xffff; c++) {
          let g;
          if (ro === 0) g = (c + d) & 0xffff;
          else { const gi = ranges + s * 2 + ro + (c - st) * 2; g = cmap.readUInt16BE(gi); if (g) g = (g + d) & 0xffff; }
          if (g) puntos.add(c);
        }
      }
    } else if (fmt === 12) {
      const ng = cmap.readUInt32BE(so + 12);
      for (let g = 0; g < ng; g++) {
        const a = cmap.readUInt32BE(so + 16 + g * 12), z = cmap.readUInt32BE(so + 20 + g * 12), gid = cmap.readUInt32BE(so + 24 + g * 12);
        for (let c = a; c <= z; c++) if (gid + (c - a)) puntos.add(c);
      }
    }
  }
  return puntos;
}
function rango(u) {      // "U+0100-02BA, U+0304" -> [[a,b]...]
  return u.split(',').map(x => x.trim().replace(/^U\+/i, '')).filter(Boolean).map(x => {
    const [a, b] = x.split('-'); return [parseInt(a, 16), parseInt(b || a, 16)];
  });
}
const css = fs.readFileSync(path.join(RAIZ, 'vendor', 'fuentes.css'), 'utf8');
const caras = [];
for (const m of css.matchAll(/@font-face\s*\{([^}]*)\}/g)) {
  const c = m[1];
  const fam = (c.match(/font-family:\s*'([^']+)'/) || [])[1], peso = (c.match(/font-weight:\s*(\d+)/) || [])[1];
  const url = (c.match(/url\(([^)]+)\)/) || [])[1], ur = (c.match(/unicode-range:\s*([^;]+);/) || [])[1];
  if (fam && url && ur) caras.push({ fam, peso, url, rangos: rango(ur), fichero: path.join(RAIZ, 'vendor', url) });
}
const cache = new Map();
let mal = 0;
const grupos = new Map();
for (const c of caras) { const k = c.fam + ' ' + c.peso; if (!grupos.has(k)) grupos.set(k, []); grupos.get(k).push(c); }
for (const [k, cs] of grupos) {
  const faltan = [];
  for (const ch of LETRAS) {
    const cp = ch.codePointAt(0);
    /* el navegador usa el PRIMER trozo cuyo unicode-range la incluye... y si ese no
       la tiene, el siguiente que tambien la incluya; si ninguno, la del sistema */
    const quien = cs.filter(c => c.rangos.some(([a, b]) => cp >= a && cp <= b));
    const tiene = quien.some(c => { if (!cache.has(c.fichero)) cache.set(c.fichero, cmapWoff2(c.fichero)); return cache.get(c.fichero).has(cp); });
    if (!tiene) faltan.push(ch + ' U+' + cp.toString(16).toUpperCase().padStart(4, '0') + (quien.length ? ' (en su trozo no esta)' : ' (ningun trozo la cubre)'));
  }
  console.log((faltan.length ? '  MAL ' : '  OK  ') + k.padEnd(26) + (faltan.length ? 'le faltan: ' + faltan.join(', ') : 'las ' + LETRAS.length + ' letras'));
  if (faltan.length) mal++;
}
if (mal) { console.log('\n' + mal + ' familia(s) sin todas las letras: se pintarian con otra fuente'); process.exit(1); }
console.log('\nTodas las letras pedidas estan en las fuentes de la app.');
