#!/usr/bin/env node
/* meter_idioma.js — mete un idioma EN EL FUENTE, fila por fila.
 *
 * POR QUE EN EL FUENTE Y NO CON UN Object.assign DETRAS DE LA TABLA:
 * una mezcla en tiempo de ejecucion funciona en el navegador, pero las
 * herramientas (inventario_idiomas.js, barrido_idiomas.js, auditar_web.js,
 * auditar_seguridad.py) leen el fichero. Un control que no puede ver la
 * verdad es peor que el hueco: da verde sobre lo que no ha mirado. Asi que
 * el idioma nuevo entra donde estan los otros, detras de zht.
 *
 *     node tools/meter_idioma.js bg plan.json [--probar]
 *
 * El plan tiene dos partes y las dos son opcionales:
 *   tablas:  { NOMBRE: { forma: "por idioma"|"por clave", valores: {...} } }
 *   sueltas: { "<numero de linea>": valor }      filas que no viven en una
 *            tabla con nombre (GL_DATA, DP_CARDS, VIS_BADGES, notas de linea)
 */
'use strict';
const fs = require('fs');
const path = require('path');
const RUTA = path.join(__dirname, '..', 'index.html');
const IDIOMA = process.argv[2];
const PLAN = process.argv[3];
const REF = 'zht';
const PROBAR = process.argv.indexOf('--probar') !== -1;
if (!IDIOMA || !PLAN) { console.log('uso: node tools/meter_idioma.js <idioma> <plan.json> [--probar]'); process.exit(2); }

let src = fs.readFileSync(RUTA, 'utf8');
const plan = JSON.parse(fs.readFileSync(PLAN, 'utf8'));
const IDI_BASE = ['es','en','fr','de','it','nl','zh','zht'];

/* ── lectura de literales ─────────────────────────────────────────── */
function finCadena(t, i) {
  const q = t[i];
  for (let k = i + 1; k < t.length; k++) { if (t[k] === '\\') { k++; continue; } if (t[k] === q) return k + 1; }
  throw new Error('cadena sin cerrar en ' + i);
}
function finValor(t, i) {
  while (/\s/.test(t[i])) i++;
  const c = t[i];
  if (c === '"' || c === "'" || c === '`') return finCadena(t, i);
  if (c === '{' || c === '[') {
    const abre = c, cierra = c === '{' ? '}' : ']';
    let d = 0;
    for (let k = i; k < t.length; k++) {
      const x = t[k];
      if (x === '"' || x === "'" || x === '`') { k = finCadena(t, k) - 1; continue; }
      if (x === '/' && t[k+1] === '/') { k = t.indexOf('\n', k); continue; }
      if (x === '/' && t[k+1] === '*') { k = t.indexOf('*/', k) + 1; continue; }
      if (x === abre) d++; else if (x === cierra) { d--; if (!d) return k + 1; }
    }
    throw new Error('bloque sin cerrar en ' + i);
  }
  let k = i;
  while (k < t.length && ',}\n'.indexOf(t[k]) === -1) k++;
  while (k > i && /\s/.test(t[k-1])) k--;
  return k;
}
function entradas(t, ini) {
  const res = []; let i = ini + 1;
  for (;;) {
    while (i < t.length && (/\s/.test(t[i]) || t[i] === ',')) i++;
    if (t[i] === '/' && t[i+1] === '/') { i = t.indexOf('\n', i); continue; }
    if (t[i] === '/' && t[i+1] === '*') { i = t.indexOf('*/', i) + 2; continue; }
    if (t[i] === '}' || i >= t.length) return res;
    const claveIni = i;
    let clave, entrecomillada = false;
    if (t[i] === '"' || t[i] === "'") { const f = finCadena(t, i); clave = t.slice(i + 1, f - 1); entrecomillada = true; i = f; }
    else { let k = i; while (/[\w$]/.test(t[k])) k++; clave = t.slice(i, k); i = k; }
    while (/\s/.test(t[i])) i++;
    if (t[i] !== ':') throw new Error('esperaba ":" tras ' + clave + ' en ' + i);
    i++; while (/\s/.test(t[i])) i++;
    const valIni = i, valFin = finValor(t, i);
    res.push({ clave, entrecomillada, claveIni, valIni, valFin });
    i = valFin;
  }
}
/* ── escritura ────────────────────────────────────────────────────── */
const IDENT = /^[A-Za-z_$][\w$]*$/;
function cadena(s, q) {
  let r = '';
  for (const ch of s) {
    if (ch === q || ch === '\\') r += '\\' + ch;
    else if (ch === '\n') r += '\\n'; else if (ch === '\r') r += '\\r'; else if (ch === '\t') r += '\\t';
    else if (ch === ' ') r += '\\u2028'; else if (ch === ' ') r += '\\u2029';
    else r += ch;
  }
  return q + r + q;
}
function serie(v, q, comillarClaves) {
  if (typeof v === 'string') return cadena(v, q);
  if (Array.isArray(v)) return '[' + v.map(x => serie(x, q, comillarClaves)).join(',') + ']';
  if (v && typeof v === 'object')
    return '{' + Object.keys(v).map(k => (comillarClaves || !IDENT.test(k) ? cadena(k, q) : k) + ':' + serie(v[k], q, comillarClaves)).join(',') + '}';
  return JSON.stringify(v);
}
function estilo(t, e) {
  let i = e.claveIni - 1, sangria = '';
  while (i >= 0 && (t[i] === ' ' || t[i] === '\t')) { sangria = t[i] + sangria; i--; }
  const propiaLinea = i >= 0 && t[i] === '\n';
  const trozo = t.slice(e.valIni, e.valFin);
  const q = (trozo.match(/'/g) || []).length > (trozo.match(/"/g) || []).length ? "'" : (trozo[0] === "'" ? "'" : '"');
  return { propiaLinea, sangria, q, entrecomillada: e.entrecomillada, espacio: /:\s/.test(t.slice(e.claveIni, e.valIni)) };
}
function corte(ref, valor) {
  const st = estilo(src, ref);
  const clave = st.entrecomillada ? cadena(IDIOMA, st.q) : IDIOMA;
  const cuerpo = serie(valor, st.q, st.entrecomillada);
  const texto = st.propiaLinea
    ? ',\n' + st.sangria + clave + ':' + (st.espacio ? ' ' : '') + cuerpo
    : ', ' + clave + ':' + (st.espacio ? ' ' : '') + cuerpo;
  return { pos: ref.valFin, texto };
}

const cortes = [], aviso = [];
/* Una tabla no siempre es un solo objeto. UI_TX se declara como
   Object.assign({...},{...},{...}) y despues recibe diez Object.assign mas:
   buscar "UI_TX = {" solo habria encontrado el primer trozo y las filas de
   los demas se habrian quedado sin idioma sin que nadie lo dijera. Aqui se
   recogen TODOS los objetos literales que componen la tabla. */
function trozosDe(nom) {
  const esc = nom.replace(/\$/g, '\\$');
  const trozos = [];
  const decl = new RegExp('(?:const|let|var)\\s+' + esc + '\\s*=\\s*(Object\\.assign\\s*\\(|\\{)', 'g');
  let m;
  while ((m = decl.exec(src))) {
    if (m[1] === '{') { trozos.push(m.index + m[0].length - 1); continue; }
    const p = src.indexOf('(', m.index + m[0].length - 1);
    let d = 0, k = p;
    for (; k < src.length; k++) {
      const c = src[k];
      if (c === '"' || c === "'" || c === '`') { k = finCadena(src, k) - 1; continue; }
      if (c === '(') d++; else if (c === ')') { d--; if (!d) break; }
      else if (c === '{' && d === 1) { trozos.push(k); k = finValor(src, k) - 1; }
    }
  }
  const asig = new RegExp('Object\\.assign\\(\\s*' + esc + '\\s*,\\s*\\{', 'g');
  while ((m = asig.exec(src))) trozos.push(src.indexOf('{', m.index + m[0].length - 1));
  return [...new Set(trozos)].sort((a, b) => a - b);
}
/* ── tablas con nombre ────────────────────────────────────────────── */
for (const nom of Object.keys(plan.tablas || {})) {
  const trozos = trozosDe(nom);
  if (!trozos.length) { aviso.push(nom + ': no encontrada'); continue; }
  const top = [];
  for (const tr of trozos) { let e; try { e = entradas(src, tr); } catch (err) { continue; } top.push(...e); }
  const ini = trozos[0];
  const t = plan.tablas[nom];
  if (t.forma === 'por idioma') {
    const ref = top.find(e => e.clave === REF);
    if (!ref) { aviso.push(nom + ': sin ' + REF); continue; }
    let valor;
    if (t.valores['(fila unica)'] !== undefined) valor = t.valores['(fila unica)'];
    else {
      valor = {};
      for (const e of entradas(src, ref.valIni)) {
        if (t.valores[e.clave] === undefined) aviso.push(nom + ' · falta ' + e.clave);
        else valor[e.clave] = t.valores[e.clave];
      }
      for (const k of Object.keys(t.valores)) if (valor[k] === undefined) aviso.push(nom + ' · sobra ' + k);
    }
    cortes.push(corte(ref, valor));
  } else {
    for (const k of Object.keys(t.valores)) {
      const cand = top.filter(e => e.clave === k);
      if (!cand.length) { aviso.push(nom + ' · fila ' + k + ' no encontrada'); continue; }
      /* si la clave se escribe dos veces gana la ultima, como en ejecucion */
      const fila = cand[cand.length - 1];
      const ref = entradas(src, fila.valIni).find(e => e.clave === REF);
      if (!ref) { aviso.push(nom + ' · ' + k + ': sin ' + REF); continue; }
      cortes.push(corte(ref, t.valores[k]));
    }
  }
}
/* ── filas sueltas, localizadas por linea ─────────────────────────── */
if (plan.sueltas && Object.keys(plan.sueltas).length) {
  const pila = [], objetos = [];
  for (let k = 0; k < src.length; k++) {
    const c = src[k];
    if (c === '"' || c === "'" || c === '`') { const q = c; for (k++; k < src.length; k++) { if (src[k] === '\\') { k++; continue; } if (src[k] === q) break; } continue; }
    if (c === '/' && src[k+1] === '/') { k = src.indexOf('\n', k); if (k < 0) break; continue; }
    if (c === '/' && src[k+1] === '*') { k = src.indexOf('*/', k) + 1; continue; }
    if (c === '{') pila.push(k);
    else if (c === '}') { const a = pila.pop(); if (a !== undefined) objetos.push({ ini: a, fin: k + 1 }); }
  }
  objetos.sort((a, b) => (a.fin - a.ini) - (b.fin - b.ini));
  const linea = i => src.slice(0, i).split('\n').length;
  const porLinea = {};
  const dentro = [];
  for (const o of objetos) {
    if (o.fin - o.ini > 200000) continue;
    const t = src.slice(o.ini, o.fin);
    if (!/(?:^|[{,\s])(?:zht|"zht"|'zht')\s*:/.test(t)) continue;
    let v; try { v = eval('(' + t + ')'); } catch (e) { continue; }
    if (!IDI_BASE.every(l => v[l] !== undefined)) continue;
    if (dentro.some(f => o.ini > f.ini && o.fin < f.fin)) continue;
    dentro.push(o);
    const L = linea(o.ini);
    (porLinea[L] = porLinea[L] || []).push(o);
  }
  for (const L of Object.keys(plan.sueltas)) {
    const cand = porLinea[L];
    if (!cand) { aviso.push('suelta linea ' + L + ': no hay fila de idioma ahi'); continue; }
    if (cand.length > 1) { aviso.push('suelta linea ' + L + ': ' + cand.length + ' filas en la misma linea, no se puede senalar una'); continue; }
    const ref = entradas(src, cand[0].ini).find(e => e.clave === REF);
    if (!ref) { aviso.push('suelta linea ' + L + ': sin ' + REF); continue; }
    cortes.push(corte(ref, plan.sueltas[L]));
  }
}
if (aviso.length) { console.log('PROBLEMAS:'); aviso.forEach(a => console.log('   ' + a)); process.exit(1); }
cortes.sort((a, b) => b.pos - a.pos);
for (const c of cortes) src = src.slice(0, c.pos) + c.texto + src.slice(c.pos);
console.log('inserciones:', cortes.length);
if (PROBAR) console.log('(prueba, no se escribe)');
else { fs.writeFileSync(RUTA, src); console.log('escrito'); }
