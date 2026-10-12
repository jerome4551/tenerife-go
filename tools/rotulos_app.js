#!/usr/bin/env node
/* Los rotulos de la app en los diez idiomas, sacados de index.html tal y como
 * se pintan: LANGS (con AUTH_STRINGS y el chino tradicional encima del
 * simplificado, igual que en la pagina), UI_TX entera (sus once trozos) y las
 * tablas de los modulos que llevan su propio texto (escuchar, visitado,
 * glosario, aviso de version nueva).
 *
 * Lo usa auditar_faq.js: las respuestas del asistente sobre la app citan
 * botones entre comillas, y si un boton cambia de nombre la respuesta tiene
 * que cambiar con el. Cada entrada declara en "rotulos" que botones cita.
 *
 *     const R = require('./rotulos_app');  R.valor('LANGS.addFav', 'de')
 */
'use strict';
const fs = require('fs'), path = require('path');
const src = fs.readFileSync(path.join(path.dirname(__dirname), 'index.html'), 'utf8');

/* El literal que empieza tras `decl`, entero, respetando comillas y
   comentarios. Si `decl` acaba en «(» son los argumentos de un Object.assign. */
function grab(decl, desde) {
  const i = src.indexOf(decl, desde || 0);
  if (i < 0) throw new Error('no esta en index.html: ' + decl);
  const ult = decl.trim().slice(-1);
  const abre = src.indexOf(ult === '[' || ult === '(' ? ult : '{', i + decl.length - 1);
  const ch = src[abre], cierra = ch === '[' ? ']' : ch === '(' ? ')' : '}';
  let d = 0, q = null;
  for (let k = abre; k < src.length; k++) {
    const c = src[k];
    if (q) { if (c === '\\') { k++; continue; } if (c === q) q = null; continue; }
    if (c === '/' && src[k + 1] === '/') { k = src.indexOf('\n', k); continue; }
    if (c === '/' && src[k + 1] === '*') { k = src.indexOf('*/', k) + 1; continue; }
    if (c === '"' || c === "'" || c === '`') { q = c; continue; }
    if (c === ch) d++;
    else if (c === cierra && --d === 0)
      return eval(ch === '(' ? 'Object.assign' + src.slice(abre, k + 1) : '(' + src.slice(abre, k + 1) + ')');
  }
  throw new Error('literal sin cerrar: ' + decl);
}

const LANGS = grab('const LANGS = {');
const AUTH = grab('const AUTH_STRINGS = {');
for (const l of Object.keys(AUTH)) if (LANGS[l]) Object.assign(LANGS[l], AUTH[l]);
LANGS.zht = Object.assign(JSON.parse(JSON.stringify(LANGS.zh)), grab('const ZHT_OVERRIDES = {'));
if (AUTH.zht) Object.assign(LANGS.zht, AUTH.zht);

const UI = Object.assign({}, grab('const UI_TX = Object.assign('));
for (let pos = 0; ;) {
  const i = src.indexOf('Object.assign(UI_TX, {', pos);
  if (i < 0) break;
  Object.assign(UI, grab('Object.assign(UI_TX, {', i));
  pos = i + 10;
}
const TABLAS = {
  LANGS: null, UI,
  TTS: grab('var TTS_I18N = {'),
  VIS: grab('var VIS_I18N = {'),
  PWA: grab('var PWA_TX = {'),
  GLT: grab('var GL_T = {')
};

/* 'LANGS.addFav' · 'UI.tourVer' · 'TTS.play' · 'VIS.mark' · 'PWA.recargar' · 'GLT' */
function valor(clave, L) {
  const [t, k] = clave.split('.');
  if (t === 'LANGS') return (LANGS[L] || {})[k];
  if (t === 'GLT') return TABLAS.GLT[L];
  const tabla = TABLAS[t];
  if (!tabla) throw new Error('tabla de rotulos desconocida: ' + clave);
  return (tabla[k] || {})[L];
}
module.exports = { valor, LANGS, UI, grab };
