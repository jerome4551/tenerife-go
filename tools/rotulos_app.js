#!/usr/bin/env node
/* Los rotulos de la app en los diez idiomas, sacados de index.html tal y como
 * se pintan: LANGS (con AUTH_STRINGS y el chino tradicional encima del
 * simplificado, igual que en la pagina), UI_TX entera (sus once trozos) y las
 * tablas de los modulos que llevan su propio texto (escuchar, visitado,
 * glosario, aviso de version nueva, la tarjeta que pide el permiso de las
 * notificaciones). Y los de modulos/cielo.js y modulos/perfil.js, que al
 * cargarse meten los suyos en UI_TX (CIELO_UI, PERFIL_UI): sus pestañas y sus
 * botones tambien se citan. Y los del panel de emergencias
 * (modulos/emergencias.js, EMERG_UI), que van en su propia tabla.
 *
 * Lo usa auditar_faq.js: las respuestas del asistente sobre la app citan
 * botones entre comillas, y si un boton cambia de nombre la respuesta tiene
 * que cambiar con el. Cada entrada declara en "rotulos" que botones cita.
 *
 *     const R = require('./rotulos_app');  R.valor('LANGS.addFav', 'de')
 */
'use strict';
const fs = require('fs'), path = require('path');
const RAIZ = path.dirname(__dirname);
const SRC = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');

/* El literal que empieza tras `decl`, entero, respetando comillas y
   comentarios. Si `decl` acaba en «(» son los argumentos de un Object.assign.
   Por defecto en index.html; `texto`, otro fichero. */
function grab(decl, desde, texto) {
  const src = texto || SRC;
  const i = src.indexOf(decl, desde || 0);
  if (i < 0) throw new Error('no esta en ' + (texto ? 'el fichero pedido' : 'index.html') + ': ' + decl);
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
  const i = SRC.indexOf('Object.assign(UI_TX, {', pos);
  if (i < 0) break;
  Object.assign(UI, grab('Object.assign(UI_TX, {', i));
  pos = i + 10;
}
Object.assign(UI, grab('var CIELO_UI = {', 0, fs.readFileSync(path.join(RAIZ, 'modulos', 'cielo.js'), 'utf8')));
Object.assign(UI, grab('var PERFIL_UI = {', 0, fs.readFileSync(path.join(RAIZ, 'modulos', 'perfil.js'), 'utf8')));
const TABLAS = {
  LANGS: null, UI,
  TTS: grab('var TTS_I18N = {'),
  VIS: grab('var VIS_I18N = {'),
  PWA: grab('var PWA_TX = {'),
  PUSH: grab('var PUSH_TX = {'),
  GLT: grab('var GL_T = {'),
  /* 23-10-2026: los modulos que el asistente cita desde ese dia. La
     leyenda (su «Ver el tour» no es el de UI_TX: en aleman, italiano,
     neerlandes y chino dice otra cosa), el GPX, «¿Donde hace sol ahora?»,
     «Fiestas y tradiciones», «Como moverse» y el planificador. Las cinco
     primeras van por idioma (LEG_I18N.de.tour), como LANGS; DP_UI, por
     clave, como UI_TX. */
  LEG: grab('var LEG_I18N = {'),
  GPX: grab('var GPX_T = {'),
  MC: grab('var MC_T = {'),
  FI: grab('var FI_T = {'),
  HM: grab('var HM_T = {'),
  DP: grab('const DP_UI = {'),
  /* 24-10-2026: el panel de emergencias (SOS). EMERG_UI vive en
     modulos/emergencias.js y no se funde en UI_TX (el modulo la lee con su
     propio T()), asi que va aparte, por clave como UI_TX. Las ocho filas del
     armazon (el titulo, «Llamar al 112»…) siguen en UI_TX. */
  EMERG: grab('var EMERG_UI = {', 0, fs.readFileSync(path.join(RAIZ, 'modulos', 'emergencias.js'), 'utf8'))
};
const POR_IDIOMA = ['LEG', 'GPX', 'MC', 'FI', 'HM'];

/* 'LANGS.addFav' · 'UI.tourVer' · 'TTS.play' · 'VIS.mark' · 'PWA.recargar' · 'PUSH.titulo' · 'GLT'
   · 'LEG.tour' · 'GPX.btn' · 'MC.title' · 'FI.title' · 'HM.label' · 'DP.otroLugar' · 'EMERG.sosQueHacer' */
function valor(clave, L) {
  const [t, k] = clave.split('.');
  if (t === 'LANGS') return (LANGS[L] || {})[k];
  if (t === 'GLT') return TABLAS.GLT[L];
  const tabla = TABLAS[t];
  if (!tabla) throw new Error('tabla de rotulos desconocida: ' + clave);
  if (POR_IDIOMA.indexOf(t) >= 0) return (tabla[L] || {})[k];
  return (tabla[k] || {})[L];
}
module.exports = { valor, LANGS, UI, TABLAS, POR_IDIOMA, grab };
