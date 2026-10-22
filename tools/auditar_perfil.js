#!/usr/bin/env node
/* auditar_perfil.js — la pantalla «Su perfil» y sus avatares (22 de octubre de 2026).
 *
 *     node tools/auditar_perfil.js
 *
 * POR QUE EXISTE. Los avatares son dibujos SVG escritos a mano (55, en
 * modulos/avatares.js) y la app los pinta con innerHTML: un motivo con un
 * <script>, un atributo on… o un enlace seria codigo ajeno dentro de la app,
 * y uno mal cerrado romperia el boton de la cuenta. Ninguno de los controles
 * que recorren la app abre el catalogo, asi que se mira aqui, sin navegador.
 *
 * QUE MIRA (parte 1, el catalogo)
 *   1. 11 sets y 55 avatares, 5 por set: uno por idioma de la app
 *      (SUPPORTED_LANGS) y el de Tenerife («tf»), que se abre con 10 visitas
 *      comprobadas.
 *   2. los ids, unicos y con la forma de un id del catalogo (la misma que
 *      exigen perfil.js al leer y perfil.sql en la nube).
 *   3. la bandera de cada set, la misma que la del menu de idiomas.
 *   4. cada motivo, SVG bien cerrado y sin nada que ejecute ni pida nada:
 *      ni <script>, ni atributos on…, ni href, ni <image>, <text>, <use> o
 *      <foreignObject>, ni url(…) (el recorte y el degradado los pone svg()).
 *   5. dos llamadas a svg() del mismo avatar dan ids distintos: con el mismo
 *      id, si la primera copia esta dentro de algo oculto, la segunda se pinta
 *      sin fondo y sin recorte (comprobado en Chromium al verificar el encargo).
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RAIZ = path.join(__dirname, '..');
const lee = f => fs.readFileSync(path.join(RAIZ, f), 'utf8');
let fallos = 0, cuenta = 0;
function ok(cond, que, detalle) {
  cuenta++;
  if (cond) console.log('  OK  ' + que);
  else { fallos++; console.log('  MAL ' + que + (detalle ? '   -> ' + String(detalle).slice(0, 300) : '')); }
}

/* Un trozo de SVG bien cerrado: solo etiquetas (sin texto suelto), cada
   atributo con comillas dobles, y cada etiqueta abierta cerrada en orden. */
function bienCerrado(svg) {
  const pila = [];
  let pos = 0;
  const re = /<(\/?)([a-zA-Z][\w:-]*)((?:\s+[\w:-]+="[^"<>]*")*)\s*(\/?)>/g;
  let m;
  while ((m = re.exec(svg))) {
    const entre = svg.slice(pos, m.index);
    if (entre.trim()) return 'texto suelto: ' + entre.trim().slice(0, 40);
    pos = re.lastIndex;
    const [, cierra, tag, , solo] = m;
    if (cierra) { if (pila.pop() !== tag) return 'cierra </' + tag + '> sin abrir'; }
    else if (!solo) pila.push(tag);
  }
  if (svg.slice(pos).trim()) return 'sobra al final: ' + svg.slice(pos).trim().slice(0, 40);
  if (pila.length) return 'sin cerrar: <' + pila.join('>, <') + '>';
  return null;
}

const index = lee('index.html');
const src = lee('modulos/avatares.js');
const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(src, ctx, { filename: 'modulos/avatares.js' });
const AV = ctx.window.TG_AVATARES;
const LENGUAS = JSON.parse((index.match(/const SUPPORTED_LANGS = (\[[^\]]+\]);/) || [, '[]'])[1].replace(/'/g, '"'));
/* las banderas del menu de idiomas: <div class="lang-option" onclick="setLang('xx')"> <span class="lang-option-flag">🇽🇽</span>
   (la del idioma de arranque lleva ademas «active») */
const MENU = {};
for (const m of index.matchAll(/class="lang-option(?: active)?" onclick="setLang\('([a-z]{2,3})'\)">\s*<span class="lang-option-flag">([^<]+)<\/span>/g)) if (!MENU[m[1]]) MENU[m[1]] = m[2].trim();

console.log('=== el perfil: el catalogo de avatares ===');
ok(AV && Array.isArray(AV.sets), 'modulos/avatares.js expone window.TG_AVATARES con sus sets');
const sets = AV.sets, ids = [];
sets.forEach(s => s.avatares.forEach(a => ids.push(a.id)));
ok(sets.length === 11, '11 sets', sets.length);
ok(ids.length === 55 && AV.total === 55, '55 avatares (TG_AVATARES.total lo dice igual)', ids.length + ' / ' + AV.total);
ok(sets.every(s => s.avatares.length === 5), '5 avatares por set', sets.filter(s => s.avatares.length !== 5).map(s => s.id + ':' + s.avatares.length).join(', '));
ok(new Set(ids).size === ids.length, 'ningun id repetido');
const FORMA = /^[a-z]{2,3}-[a-z]+(-[a-z]+)*$/;
ok(ids.every(i => FORMA.test(i) && i.length >= 4 && i.length <= 24), 'cada id con la forma de un id del catalogo (la de perfil.sql: 4 a 24 letras y guiones)', ids.filter(i => !FORMA.test(i)).join(', '));
ok(sets.every(s => s.avatares.every(a => a.id.startsWith(s.id + '-'))), 'cada id empieza por el de su set');
const idsSet = sets.map(s => s.id);
ok(LENGUAS.length === 10 && LENGUAS.every(l => idsSet.includes(l)) && idsSet.every(i => i === 'tf' || LENGUAS.includes(i)),
  'un set por idioma de la app (SUPPORTED_LANGS) y el de Tenerife', idsSet.join(','));
const tf = AV.set('tf');
ok(tf && tf.desbloqueo === 10 && sets.filter(s => s.desbloqueo).length === 1, 'solo el set de Tenerife se desbloquea, con 10 visitas comprobadas (Jerome, 22 de octubre)', tf && tf.desbloqueo);
ok(Object.keys(MENU).length === 10, 'el menu de idiomas tiene sus diez banderas', Object.keys(MENU).join(','));
const malBandera = sets.filter(s => s.id !== 'tf' && MENU[s.id] !== s.bandera).map(s => s.id + ' ' + s.bandera + ' / menu ' + MENU[s.id]);
ok(!malBandera.length, 'la bandera de cada set es la del menu de idiomas (🌏 para el chino tradicional)', malBandera.join(' · '));
const HEX = /^#[0-9A-Fa-f]{6}$/;
ok(sets.every(s => HEX.test(s.color)) && sets.every(s => s.avatares.every(a => Array.isArray(a.g) && a.g.length === 2 && a.g.every(c => HEX.test(c)))),
  'colores de set y degradados en #RRGGBB');

const PROHIBIDO = [
  [/<script/i, '<script'], [/\son[a-z]+\s*=/i, 'atributo on…'], [/href/i, 'href'], [/<image\b/i, '<image>'],
  [/<text\b/i, '<text>'], [/<use\b/i, '<use>'], [/<foreignObject/i, '<foreignObject>'], [/url\s*\(/i, 'url(…)'],
  [/javascript:/i, 'javascript:'], [/<style/i, '<style>'], [/<!\[CDATA|<!--|<!/i, 'comentario o CDATA']
];
const malMotivo = [];
sets.forEach(s => s.avatares.forEach(a => {
  for (const [re, que] of PROHIBIDO) if (re.test(a.m)) malMotivo.push(a.id + ': ' + que);
  const e = bienCerrado(a.m); if (e) malMotivo.push(a.id + ': ' + e);
}));
ok(!malMotivo.length, 'los 55 motivos, SVG bien cerrado y sin nada que ejecute ni pida nada', malMotivo.join(' · '));

const malSvg = [];
for (const i of ids) {
  const a = AV.svg(i), b = AV.svg(i, { etiqueta: 'Nombre <de> "prueba" & más' });
  const idsA = [...a.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]), idsB = [...b.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  if (idsA.length !== 2 || idsB.length !== 2 || idsA.some(x => idsB.includes(x))) malSvg.push(i + ': ids ' + idsA.join(',') + ' / ' + idsB.join(','));
  if (bienCerrado(a) || bienCerrado(b)) malSvg.push(i + ': ' + (bienCerrado(a) || bienCerrado(b)));
  if (!/aria-hidden="true"/.test(a) || !/role="img" aria-label="Nombre de prueba  más"/.test(b)) malSvg.push(i + ': etiqueta');
}
ok(!malSvg.length, 'svg(): ids propios en cada llamada, SVG bien cerrado, oculto al lector de pantalla sin etiqueta y con la etiqueta limpia de <, >, & y comillas', malSvg.slice(0, 5).join(' · '));
ok(AV.svg('no-existe') === '' && AV.porId('no-existe') === null, 'un id que no esta en el catalogo no pinta nada');
ok(!/<\/script/i.test(src), 'modulos/avatares.js no trae «</script» (tools/fuente.js lo pega en linea)');

console.log('\n  ' + cuenta + ' controles, ' + (fallos ? fallos + ' con fallo' : 'todos en verde'));
process.exit(fallos ? 1 : 0);
