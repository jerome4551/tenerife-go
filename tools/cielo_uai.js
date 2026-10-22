#!/usr/bin/env node
/* cielo_uai.js — el nombre en chino, chino tradicional y bulgaro de las
 * estrellas de la carta con nombre de la UAI que no estan en el catalogo
 * (datos/cielo.json, nombresIAU), sacado de las traducciones de Stellarium:
 * la tabla CIELO_UAI de modulos/cielo.js. Desde el 22 de octubre de 2026
 * (Jerome: «si es verificado, sí»).
 *
 *     node tools/cielo_uai.js /tmp/fuentes-cielo              escribe CIELO_UAI en modulos/cielo.js
 *     node tools/cielo_uai.js /tmp/fuentes-cielo --comprobar  para si no es la que sale de las fuentes
 *
 * Las fuentes las baja tools/cielo_fuentes.sh (Stellarium, con su commit fijado):
 *   stel/po/stellarium-sky/{zh_CN,zh_TW,bg}.po      los nombres (common_star_names.fab)
 *   stel/po/stellarium-skycultures/zh_CN.po         la cultura celeste china («Chinese
 *                                                   name for HIP …, native: …»), para cotejar
 *
 * La regla, la misma con la que se hizo CIELO_EST:
 *   · chino y chino tradicional: el nombre tradicional, sin el latino detras
 *     (con o sin parentesis, pegado o con espacio; a veces es otro nombre
 *     latino de la misma estrella: Schedar trae «Mesartim») y sin los alias
 *     entre corchetes («天樞[北斗一]»); si trae dos nombres chinos (la
 *     posicion y el nombre propio, «太微右垣五 西上相»), el nombre propio,
 *     como CIELO_EST con Porrima («东上相»);
 *   · bulgaro: sin los acentos de pronunciacion, sin la explicacion entre
 *     parentesis («Теребелум (Свредел)») y con la letra latina que se cuela
 *     en una palabra cirilica («Аспидискe») cambiada por la cirilica.
 * Si no queda un nombre en su escritura (la entrada solo trae el latino, o
 * viene vacia), Stellarium no lo traduce: se queda el de la UAI, y el
 * barrido de pantallas lo acepta con su motivo (idiomas/pantalla-aceptado.json).
 *
 * Las erratas de las traducciones, cada una con lo que la resuelve: el
 * chino simplificado y el tradicional tienen que ser el mismo nombre, y
 * cuando no lo son decide la cultura celeste china de Stellarium.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const FUENTES = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : (process.env.FUENTES_CIELO || '/tmp/fuentes-cielo');
const COMPROBAR = process.argv.includes('--comprobar');
const MODULO = path.join(RAIZ, 'modulos', 'cielo.js');

const ERRATAS = {
  zh: {
    'Suhail': ['天记', 'zh_CN dice «天纪»; zh_TW «天記» y la cultura china «天记» (HIP 44816)'],
    'Jabbah': ['键闭', 'zh_CN dice «建闭»; zh_TW «鍵閉» y la cultura china «键闭» (HIP 79374)'],
    'Rasalhague': ['候', 'zh_CN dice «侯»; zh_TW «候» y la cultura china «候», el Astrologo (HIP 86032)'],
    'Kochab': ['帝', 'zh_CN da la posicion, «北极二»; el nombre propio es «帝», el de zh_TW y el de la cultura china (HIP 72607)']
  },
  zht: {
    'Xuange': ['玄戈', 'zh_TW dice «元戈», la forma que esquivaba el caracter 玄; la UAI lo llama Xuange (玄戈), y asi lo dicen zh_CN y la cultura china'],
    'Wasat': ['天樽二', 'zh_TW dice «天罇二», con la variante antigua del caracter; zh_CN y la cultura china, «天樽»']
  }
};

/* ── los .po ─────────────────────────────────────────────────────────── */
function leerPo(ruta) {
  const out = new Map();
  let ctx = null, id = null, str = null, campo = null;
  const cerrar = () => { if (id !== null && str !== null) out.set((ctx === null ? '' : ctx + '\u0004') + id, str); };
  const cad = s => JSON.parse(s.trim());
  for (const linea of fs.readFileSync(ruta, 'utf8').split('\n')) {
    if (linea.startsWith('msgctxt ')) { cerrar(); ctx = cad(linea.slice(8)); id = str = null; campo = 'ctx'; }
    else if (linea.startsWith('msgid ')) { if (campo !== 'ctx') { cerrar(); ctx = null; } id = cad(linea.slice(6)); str = null; campo = 'id'; }
    else if (linea.startsWith('msgstr ')) { str = cad(linea.slice(7)); campo = 'str'; }
    else if (linea.startsWith('"')) { if (campo === 'id') id += cad(linea); else if (campo === 'str') str += cad(linea); else if (campo === 'ctx') ctx += cad(linea); }
    else if (!linea.trim()) { cerrar(); ctx = id = str = campo = null; }
  }
  cerrar();
  return out;
}

/* ── la regla ────────────────────────────────────────────────────────── */
const CJK = '㐀-鿿豈-﫿';
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function sinLatino(s, latin) {
  s = s.trim();
  s = s.replace(new RegExp('\\s*[\\(（]\\s*' + esc(latin) + '\\s*[\\)）]\\s*$', 'i'), '');
  s = s.replace(new RegExp('\\s*' + esc(latin) + '\\s*$', 'i'), '');
  s = s.replace(/\s+[A-Za-z][A-Za-z\s'’.-]*$/, '');               // otro nombre latino detras
  return s.trim();
}
function zhCN(v, latin) {
  const p = sinLatino(v, latin).split(/\s+/).filter(Boolean);
  return p.length > 1 ? p[p.length - 1] : (p[0] || '');
}
function zhTW(v, latin) {
  let s = v.trim();
  const m = s.match(new RegExp('^' + esc(latin) + '\\s*[\\(（](.+)[\\)）]$', 'i'));    // «Sirius (天狼)»
  if (m) s = m[1];
  s = sinLatino(s, latin).replace(/\[[^\]]*\]/g, '').trim();
  const p = s.split(/\s+/).filter(Boolean);
  return p.length > 1 ? p[0] : (p[0] || '');
}
const HOMO = { e: 'е', a: 'а', o: 'о', p: 'р', c: 'с', x: 'х', y: 'у' };
function bulgaro(v) {
  let s = v.replace(/ѝ/g, 'и').replace(/ѐ/g, 'е');    // ѝ ѐ
  s = s.normalize('NFD').replace(/[̀́]/g, '').normalize('NFC').trim();
  s = s.replace(/\s*\([^)]*\)\s*$/, '');                                   // la explicacion
  return s.split(/\s+/).map(w => /[А-Яа-я]/.test(w) ? w.replace(/[eaopcxy]/g, c => HOMO[c]) : w).join(' ');
}
const bueno = (l, s) => l === 'bg' ? /^[А-Яа-я][А-Яа-я\- ]*$/.test(s || '') : new RegExp('^[' + CJK + ']+[A-Z]?$').test(s || '');

/* ── la tabla ────────────────────────────────────────────────────────── */
function tablaModulo(src, nombre) {
  const i = src.indexOf('var ' + nombre + ' = {');
  if (i < 0) return null;
  const j = src.indexOf('\n  };', i);
  return (new Function('return ' + src.slice(i + ('var ' + nombre + ' = ').length, j + 4).replace(/\/\*[\s\S]*?\*\//g, '')))();
}
function construir() {
  const D = JSON.parse(fs.readFileSync(path.join(RAIZ, 'datos', 'cielo.json'), 'utf8'));
  const EST = tablaModulo(fs.readFileSync(MODULO, 'utf8'), 'CIELO_EST') || {};
  const P = path.join(FUENTES, 'stel', 'po', 'stellarium-sky');
  const pos = { zh: leerPo(path.join(P, 'zh_CN.po')), zht: leerPo(path.join(P, 'zh_TW.po')), bg: leerPo(path.join(P, 'bg.po')) };
  const reglas = { zh: zhCN, zht: zhTW, bg: (v) => bulgaro(v) };
  const out = { zh: {}, zht: {}, bg: {} }, quedan = { zh: [], zht: [], bg: [] };
  const hips = Object.keys(D.nombresIAU).filter(h => !(EST[h] && EST[h].zh && EST[h].bg)).sort((a, b) => a - b);
  for (const h of hips) {
    const n = D.nombresIAU[h];
    for (const l of ['zh', 'zht', 'bg']) {
      const v = pos[l].get(n);                         // la estrella va sin contexto (Atlas trae ademas el de la luna)
      let r = v === undefined ? '' : reglas[l](v, n);
      if (ERRATAS[l] && ERRATAS[l][n]) r = ERRATAS[l][n][0];
      if (bueno(l, r)) out[l][h] = r; else quedan[l].push(n);
    }
  }
  return { D, out, quedan, hips };
}
/* el cotejo: el chino y el tradicional, el mismo nombre (lo que no casa
   tiene que ser una errata declarada); y lo que la cultura china de
   Stellarium dice de una estrella, igual que la tabla */
function cotejar(D, out) {
  const fallos = [];
  const cult = fs.readFileSync(path.join(FUENTES, 'stel', 'po', 'stellarium-skycultures', 'zh_CN.po'), 'utf8');
  const nat = {};
  for (const m of cult.matchAll(/^#\. Chinese name for HIP\s+(\d+), native: (\S+)\s*$/gm)) (nat[m[1]] = nat[m[1]] || new Set()).add(m[2].replace(/\[[^\]]*\]$/, ''));
  for (const [l, err] of Object.entries(ERRATAS)) for (const [n, [v]] of Object.entries(err)) {
    const h = Object.keys(D.nombresIAU).find(k => D.nombresIAU[k] === n);
    if (!h) fallos.push('errata de ' + n + ': no esta en nombresIAU');
    else if (l === 'zh' && !(nat[h] && nat[h].has(v))) fallos.push('errata de ' + n + ': la cultura china no dice «' + v + '»');
  }
  for (const [h, v] of Object.entries(out.zh)) if (nat[h] && !nat[h].has(v)) fallos.push(D.nombresIAU[h] + ': la tabla dice «' + v + '» y la cultura china ' + [...nat[h]].join('/'));
  return { fallos, cotejados: Object.keys(out.zh).filter(h => nat[h]).length };
}
function texto(out) {
  const lineas = ['  var CIELO_UAI = {'];
  const ls = ['zh', 'zht', 'bg'];
  ls.forEach((l, i) => {
    const pares = Object.entries(out[l]).map(([h, v]) => JSON.stringify(h) + ': ' + JSON.stringify(v));
    lineas.push('    ' + l + ': {');
    for (let k = 0; k < pares.length; k += 8) lineas.push('      ' + pares.slice(k, k + 8).join(', ') + (k + 8 < pares.length ? ',' : ''));
    lineas.push('    }' + (i < ls.length - 1 ? ',' : ''));
  });
  lineas.push('  };');
  return lineas.join('\n');
}

const { D, out, quedan, hips } = construir();
const { fallos, cotejados } = cotejar(D, out);
const nuevo = texto(out);
const src = fs.readFileSync(MODULO, 'utf8');
const ini = src.indexOf('  var CIELO_UAI = {');
const fin = ini < 0 ? -1 : src.indexOf('\n  };', ini) + 5;
console.log('=== CIELO_UAI: los nombres de la UAI de la carta en chino, chino tradicional y bulgaro (Stellarium) ===');
console.log('  ' + hips.length + ' estrellas con nombre de la UAI fuera del catalogo; con nombre: zh ' + Object.keys(out.zh).length
  + ', zht ' + Object.keys(out.zht).length + ', bg ' + Object.keys(out.bg).length + '; cotejados con la cultura china: ' + cotejados);
for (const l of ['zh', 'zht', 'bg']) console.log('  sin traduccion en ' + l + ' (' + quedan[l].length + '): ' + quedan[l].join(', '));
if (fallos.length) { console.log('\n*** ' + fallos.join('\n*** ')); process.exit(1); }
if (COMPROBAR) {
  const igual = ini >= 0 && src.slice(ini, fin) === nuevo;
  console.log('  ' + (igual ? 'OK ' : 'MAL') + ' modulos/cielo.js lleva exactamente la tabla que sale de las fuentes');
  const acept = JSON.parse(fs.readFileSync(path.join(RAIZ, 'idiomas', 'pantalla-aceptado.json'), 'utf8'));
  const enLista = l => new Set(Object.values(acept).filter(v => v && typeof v === 'object' && !Array.isArray(v)).flatMap(v => v[l] || []));
  const sinAceptar = ['zh', 'zht', 'bg'].flatMap(l => quedan[l].filter(n => !enLista(l).has(n)).map(n => l + ':' + n));
  console.log('  ' + (sinAceptar.length ? 'MAL' : 'OK ') + ' lo que se queda con el nombre de la UAI esta aceptado en idiomas/pantalla-aceptado.json'
    + (sinAceptar.length ? ': falta ' + sinAceptar.join(', ') : ''));
  process.exit(igual && !sinAceptar.length ? 0 : 1);
}
if (ini < 0) throw new Error('no encuentro CIELO_UAI en modulos/cielo.js: hay que ponerla detras de CIELO_EST');
fs.writeFileSync(MODULO, src.slice(0, ini) + nuevo + src.slice(fin));
console.log('  modulos/cielo.js: CIELO_UAI escrita');
