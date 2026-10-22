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
 *
 * QUE MIRA (parte 2, la pantalla: modulos/perfil.js)
 *   6. las 144 filas de PERFIL_UI (78 de la pantalla, 11 de sets, 55 de
 *      avatares), con lo que comprobaba validar_i18n.py del encargo: los diez
 *      idiomas y ninguno en blanco; los mismos {marcadores} que el castellano;
 *      ni comillas dobles ASCII ni guiones blandos u otros invisibles; los
 *      plurales con sus formas (3 en polaco, 1 en chino) y {n} en cada una;
 *      ni simplificado en el chino tradicional ni al reves; ninguna palabra
 *      bulgara con letras latinas; ninguna fila copiada del castellano; el
 *      texto del permiso nombra «Acepto» tal cual; una fila por set y por
 *      avatar, y ninguna de mas; ninguna clave que ya tenga la app.
 *   7. cada fila que pide el codigo o el cuerpo (sus claves van en TEXTOS)
 *      existe (las de la app, en UI_TX; authLoggedAs y authLogoutBtn, en los
 *      diez de LANGS), y ninguna fila de PERFIL_UI sobra.
 *   8. lo que la pantalla nunca hace (la nota del encargo, «Lo que no hay que
 *      hacer»): ni type="number"; innerHTML solo con los dibujos del catalogo,
 *      su propio cuerpo y el degradado de la grafica; ni la ubicacion ni las
 *      visitas comprobadas cerca de la nube; en la nube, solo las tablas de
 *      perfil.sql; y la fila del permiso solo la crea «Acepto».
 *   9. los enganches con la app: los dos botones de «Cuenta» abren el perfil;
 *      el cargador declara los dos modulos y pide avatares.js antes;
 *      tenerife.perfil es la misma clave en los dos; sw.js los precarga y los
 *      pide «red primero»; AppAuth.logout y el evento tg-sesion al entrar y
 *      al salir; el boton de notificaciones, un par mas (TG_PUSH.anadirBoton);
 *      y nada del prototipo (selector de idioma, «Ejemplo», «Demo»).
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

/* ── parte 2: la pantalla ─────────────────────────────────────────────── */
const ROT = require('./rotulos_app');
const MOD = lee('modulos/perfil.js');
const SW = lee('sw.js');
/* El codigo sin sus comentarios (que nombran lo que no se usa para explicarlo):
   se recorre saltando lo que va entre comillas, como hace rotulos_app.grab().
   Sirve para este modulo, que no tiene expresiones regulares con comillas ni
   con «//» dentro. */
function sinComentarios(src) {
  let out = '', q = null;
  for (let k = 0; k < src.length; k++) {
    const c = src[k];
    if (q) { out += c; if (c === '\\') { out += src[k + 1] || ''; k++; } else if (c === q) q = null; continue; }
    if (c === '/' && src[k + 1] === '*') { k = src.indexOf('*/', k + 2) + 1; continue; }
    if (c === '/' && src[k + 1] === '/') { const fin = src.indexOf('\n', k); k = (fin < 0 ? src.length : fin) - 1; continue; }
    if (c === '"' || c === "'" || c === '`') q = c;
    out += c;
  }
  return out;
}
const CODIGO = sinComentarios(MOD);
console.log('\n=== el perfil: la pantalla (modulos/perfil.js) ===');
let PUI = {};
try { PUI = ROT.grab('var PERFIL_UI = {', 0, MOD); } catch (e) { PUI = {}; }
const claves = Object.keys(PUI);
ok(claves.length === 144, 'PERFIL_UI: 144 filas', claves.length);
ok(claves.filter(k => k.startsWith('perfilSet_')).length === 11 && claves.filter(k => k.startsWith('perfilAv_')).length === 55, '11 filas de sets y 55 de avatares (y 78 de la pantalla)');
ok(/\n  Object\.assign\(UI_TX, PERFIL_UI\);\n/.test(MOD), 'se funden en UI_TX con Object.assign(UI_TX, PERFIL_UI), como CIELO_UI');
const IDI = ['es', 'en', 'fr', 'de', 'it', 'nl', 'zh', 'zht', 'bg', 'pl'];
ok(JSON.stringify(IDI) === JSON.stringify(LENGUAS), 'los diez idiomas son los de SUPPORTED_LANGS', LENGUAS.join(','));
/* Parejas simplificado/tradicional que de verdad difieren (las de validar_i18n.py del encargo) */
const PAREJAS = '们們这這个個为為说說时時国國会會对對来來发發东東车車长長门門问問间間关關开開头頭实實现現点點让讓过過还還进進没沒种種样樣' +
  '机機体體动動后後处處经經学學写寫业業线線网網数數据據资資载載设設计計号號页頁区區级級观觀览覽历歷亲親认認识識语語读讀选選择擇' +
  '钟鐘灯燈笼籠饺餃壶壺鸟鳥鹳鸛猫貓图圖书書馆館价價钱錢买買卖賣际際饮飲汉漢齐齊尔爾维維罗羅马馬乐樂园園场場术術战戰胜勝击擊纪紀' +
  '录錄类類显顯标標题題帐帳户戶账賬删刪钥鑰锁鎖轻輕龙龍树樹鲸鯨领領费費丽麗兰蘭诺諾亚亞热熱带帶岛島屿嶼记記变變护護续續统統总總' +
  '连連当當务務办辦阶階组組织織协協议議权權证證运運营營项項码碼导導边邊缘緣频頻广廣阔闊备備杂雜职職责責详詳细細状狀态態测測试試' +
  '评評论論荐薦讯訊兽獸竞競剧劇蜡蠟烛燭无無销銷内內奥奧铁鐵塔塔鸡雞欧歐萨薩时時诞誕节節庆慶盖蓋饭飯饼餅虾蝦贝貝鲜鮮汤湯' +
  '确確访訪视視云雲届屆换換试試将將储儲遗遺' +
  '酱醬鱼魚绿綠蓝藍红紅黄黃紫紫银銀钻鑽宝寶轮輪桥橋楼樓馆館厅廳传傳统統单單双雙叶葉华華丝絲绣繡纸紙剪剪伞傘杯杯壶壺饺餃';
const SOLO_S = new Set(), SOLO_T = new Set();
for (let i = 0; i < [...PAREJAS].length; i += 2) { const a = [...PAREJAS][i], c = [...PAREJAS][i + 1]; if (a !== c) { SOLO_S.add(a); SOLO_T.add(c); } }
const IGUAL_ACEPTADO = new Set(['Teide', 'Paella', 'Croissant', 'Pizza', 'Gelato', 'Corgi', 'Panda', 'Lavanda', 'Pierogi', 'Martenitsa', 'Jiaozi', 'Dim sum', 'Bubble tea', 'Guagua', 'Macarons', 'Kilómetros']);
const marcadores = t => [...new Set((t.match(/\{[a-z]+\}/g) || []))].sort().join(',');
const malFilas = [];
for (const k of claves) {
  const v = PUI[k];
  if (!/^[A-Za-z0-9_]+$/.test(k)) malFilas.push(k + ': clave rara');
  if (!v || typeof v !== 'object') { malFilas.push(k + ': no es una fila'); continue; }
  const falta = IDI.filter(l => !String(v[l] || '').trim()), sobra = Object.keys(v).filter(l => !IDI.includes(l));
  if (falta.length) malFilas.push(k + ': faltan ' + falta.join(','));
  if (sobra.length) malFilas.push(k + ': idiomas de mas ' + sobra.join(','));
  const es = v.es || '', mEs = marcadores(es);
  for (const l of IDI) {
    const t = String(v[l] || '');
    if (t.includes('"')) malFilas.push(k + '.' + l + ': comilla doble ASCII');
    if (/[\u00ad\u200b-\u200f\u2028\u2029\u2060\ufeff]/.test(t)) malFilas.push(k + '.' + l + ': guion blando u otro invisible');
    if (marcadores(t) !== mEs) malFilas.push(k + '.' + l + ': marcadores ' + marcadores(t) + ' y en es ' + mEs);
    if (es.includes('|') || t.includes('|')) {
      const formas = t.split('|'), pide = l === 'pl' ? 3 : (l === 'zh' || l === 'zht' ? 1 : 2);
      if (formas.length !== pide) malFilas.push(k + '.' + l + ': ' + formas.length + ' formas de plural, pide ' + pide);
      if (es.includes('{n}') && formas.some(f => !f.includes('{n}'))) malFilas.push(k + '.' + l + ': una forma sin {n}');
    }
    if (l === 'zht') { const x = [...t].filter(c => SOLO_S.has(c)); if (x.length) malFilas.push(k + '.zht: simplificado ' + x.join('')); }
    if (l === 'zh') { const x = [...t].filter(c => SOLO_T.has(c)); if (x.length) malFilas.push(k + '.zh: tradicional ' + x.join('')); }
    if (l === 'bg') for (const w of t.match(/[\p{L}\p{N}_]+/gu) || []) if (/[\u0400-\u04ff]/.test(w) && /[A-Za-z]/.test(w)) malFilas.push(k + '.bg: «' + w + '» mezcla letras latinas y cirilicas');
    if (l !== 'es' && t === es && /[áéíóúñ¿¡]/i.test(es) && !IGUAL_ACEPTADO.has(es)) malFilas.push(k + '.' + l + ': igual que el castellano «' + t + '»');
  }
}
ok(!malFilas.length, 'las 144 filas: diez idiomas, marcadores, sin comillas dobles ni invisibles, plurales, chino de cada escritura, bulgaro sin letras latinas, nada copiado del castellano', malFilas.slice(0, 6).join(' · '));
const permiso = PUI.perfilNubeConsentimiento || {}, acepto = PUI.perfilNubeAcepto || {};
const sinAcepto = IDI.filter(l => !String(permiso[l] || '').includes('«' + acepto[l] + '»') && !String(permiso[l] || '').includes('「' + acepto[l] + '」'));
ok(acepto.es && !sinAcepto.length, 'el texto del permiso nombra el boton «Acepto» tal cual en cada idioma', sinAcepto.join(','));
const filaAv = new Set(ids.map(i => 'perfilAv_' + i.replace(/-/g, '_'))), filaSet = new Set(idsSet.map(i => 'perfilSet_' + i));
const sinFila = [...filaAv, ...filaSet].filter(k => !PUI[k]);
const deMas = claves.filter(k => (k.startsWith('perfilAv_') && !filaAv.has(k)) || (k.startsWith('perfilSet_') && !filaSet.has(k)));
ok(!sinFila.length && !deMas.length, 'una fila por set y por avatar del catalogo, y ninguna de mas', sinFila.concat(deMas).join(', '));
/* la app sin el perfil: UI_TX de index.html (sus trozos) y CIELO_UI */
const APP_UI = Object.assign({}, ROT.grab('const UI_TX = Object.assign('));
for (let pos = 0; ;) { const i = index.indexOf('Object.assign(UI_TX, {', pos); if (i < 0) break; Object.assign(APP_UI, ROT.grab('Object.assign(UI_TX, {', i)); pos = i + 10; }
Object.assign(APP_UI, ROT.grab('var CIELO_UI = {', 0, lee('modulos/cielo.js')));
const choca = claves.filter(k => APP_UI[k]);
ok(!choca.length, 'ninguna clave de PERFIL_UI choca con una de la app (UI_TX, CIELO_UI)', choca.join(', '));

/* 7. lo que se pide existe y nada sobra */
const CUERPO = (MOD.match(/var CUERPO = `([\s\S]*?)`;/) || [, ''])[1];
const ESTILOS = (MOD.match(/var ESTILOS = `([\s\S]*?)`;/) || [, ''])[1];
ok(CUERPO.length > 5000 && ESTILOS.length > 15000, 'el cuerpo y los estilos van dentro del modulo, como cadenas', CUERPO.length + ' / ' + ESTILOS.length);
const pedidasTx = new Set([...CODIGO.matchAll(/\btx\('([A-Za-z0-9_]+)'(?!\s*\+)/g)].map(m => m[1]));
/* las claves de los textos fijos del cuerpo van en TEXTOS, no en la cadena (ver modulos/perfil.js) */
const TEXTOS = (MOD.match(/var TEXTOS = \[([\s\S]*?)\n  \];/) || [, ''])[1];
const pedidasCuerpo = new Set([...TEXTOS.matchAll(/\['[^'\n]+', '(?:tx|aria|ph)', '([A-Za-z0-9_]+)'\]/g)].map(m => m[1]));
const pedidasCuenta = new Set([...CODIGO.matchAll(/\btxCuenta\('([A-Za-z0-9_]+)'/g)].map(m => m[1]));
const noEstan = [...pedidasTx, ...pedidasCuerpo].filter(k => !PUI[k] && !APP_UI[k]);
ok(pedidasTx.size && pedidasCuerpo.size && !noEstan.length, 'cada tx(…) y cada clave de TEXTOS (los textos fijos del cuerpo) tiene su fila (en PERFIL_UI o, las de la app, en UI_TX)', noEstan.join(', '));
const LANGS_APP = ROT.LANGS;
const cuentaMal = [...pedidasCuenta].filter(k => IDI.some(l => !String((LANGS_APP[l] || {})[k] || '').trim()));
ok(pedidasCuenta.size === 2 && !cuentaMal.length, 'authLoggedAs y authLogoutBtn, de AUTH_STRINGS con t(), en los diez idiomas', [...pedidasCuenta].join(',') + ' ' + cuentaMal.join(','));
const literales = new Set([...CODIGO.matchAll(/'(perfil[A-Za-z0-9_]+)'/g)].map(m => m[1]));
const sobran = claves.filter(k => !k.startsWith('perfilSet_') && !k.startsWith('perfilAv_') && !pedidasTx.has(k) && !pedidasCuerpo.has(k) && !literales.has(k));
ok(!sobran.length, 'ninguna fila de la pantalla sobra (todas las pide el codigo o el cuerpo)', sobran.join(', '));

/* 8. lo que la pantalla nunca hace */
ok(!/type\s*=\s*["']?number/i.test(CUERPO) && !/\.type\s*=\s*['"]number|setAttribute\(\s*['"]type['"]\s*,\s*['"]number/.test(CODIGO), 'ningun campo type="number" («81,5» se convertia en 815)');
const html = [...MOD.matchAll(/\.innerHTML\s*=\s*([^;\n]+)/g)].map(m => m[1].trim());
const htmlMal = html.filter(x => !/^AV\.svg\(/.test(x) && x !== 'CUERPO' && !/^'<linearGradient id="tgp-area"[^']*'$/.test(x));
ok(html.length === 4 && !htmlMal.length, 'innerHTML solo con los dibujos del catalogo, el cuerpo y el degradado de la grafica (nada de la persona ni de la nube)', htmlMal.join(' | ') || html.length);
ok(!/geolocation|getCurrentPosition|watchPosition|tenerife\.visitas/.test(CODIGO), 'ni la ubicacion ni las visitas comprobadas: el perfil solo cuenta las que le da AppLogros');
const tablas = [...new Set([...MOD.matchAll(/\.from\('([a-z_]+)'\)/g)].map(m => m[1]))].sort();
ok(tablas.join(',') === 'caminatas,perfiles,pesos', 'en la nube, solo las tablas de perfil.sql (perfiles, pesos, caminatas)', tablas.join(','));
const inserts = (MOD.match(/\.insert\(/g) || []).length, altas = (MOD.match(/\.alta = true/g) || []).length;
const enciende = (MOD.match(/function nubeEncender\(\) \{[\s\S]*?\n  \}/) || [''])[0];
ok(inserts === 1 && /from\('perfiles'\)\.insert\(alta\)/.test(MOD) && altas === 1 && /c\.alta = true/.test(enciende), 'la fila del permiso (perfiles) solo la crea «Acepto»: un insert, y la marca de alta solo la pone nubeEncender()', inserts + ' / ' + altas);
ok(/var EDAD_NUBE = 14;/.test(MOD) && /var EDAD_ADULTO = 20;/.test(MOD), 'la nube desde los 14 años (LOPDGDD, art. 7) y las categorias del IMC desde los 20 (OMS)');
ok(!/<\/script/i.test(MOD), 'modulos/perfil.js no trae «</script» (tools/fuente.js lo pega en linea)');
const prototipo = ['sembrar', 'LANG_NAMES', 'PROTO', 'EXTRA', 'BADGES', 'LOCALE', 'st.lang', 'st.demo', 'tgp-lang', 'tgp-demo', 'protoIdioma', 'protoEjemplo', 'protoCopiar', 'tgp-modal', 'tgp.v4']
  .filter(x => new RegExp('(^|[^\\w.-])' + x.replace(/[.-]/g, '\\$&') + '(?![\\w-])').test(CODIGO));
ok(!prototipo.length, 'nada del prototipo: ni selector de idioma, ni «Ejemplo», ni «Demo», ni datos sembrados, ni la ventana de descarga', prototipo.join(', '));

/* 9. los enganches con la app */
ok(/var KEY = 'tenerife\.perfil';/.test(MOD) && /localStorage\.getItem\('tenerife\.perfil'\)/.test(index), 'tenerife.perfil: la misma clave en el modulo y en el cargador del avatar');
const decl = [...index.matchAll(/CARGA-PEREZOSA:\s*([\w./-]+\.js)/g)].map(m => m[1]);
ok(decl.includes('modulos/avatares.js') && decl.includes('modulos/perfil.js'), 'index.html declara CARGA-PEREZOSA de modulos/avatares.js y modulos/perfil.js', decl.join(', '));
ok(/cargaPerfil = cargar\(\)\.then\(/.test(index) && /var MODULO_PERFIL = '\.\/modulos\/perfil\.js'/.test(index), 'el cargador pide avatares.js antes que perfil.js (perfil.js lo lee en cuanto corre)');
ok(/id="auth-btn" onclick="abrirPerfil\(\)"/.test(index) && /id="v19-nav-account" type="button" aria-label="Cuenta" onclick="abrirPerfil\(\)"/.test(index) && /window\.abrirPerfil = abrirPerfil;/.test(index),
  'los dos botones de «Cuenta» (arriba y en la barra de abajo) abren el perfil');
ok(/function abrirPerfil\(\) \{\s*cargarPerfil\(\)\.then\(function \(\) \{ window\.TG_PERFIL\.abrir\(\); \},\s*function \(\) \{ if \(typeof openAuthModal === 'function'\) openAuthModal\(\); \}\);/.test(index),
  'si el modulo no llega, se abre la ficha de la cuenta (lo que abrian antes)');
const core = (SW.match(/const CORE = \[([\s\S]*?)\];/) || [, ''])[1];
ok(/'\.\/modulos\/avatares\.js'/.test(core) && /'\.\/modulos\/perfil\.js'/.test(core), 'sw.js precarga los dos modulos (CORE)');
ok(/url\.pathname\.endsWith\('\/modulos\/avatares\.js'\)/.test(SW) && /url\.pathname\.endsWith\('\/modulos\/perfil\.js'\)/.test(SW), 'y los pide «red primero», como el cielo');
ok(/\n    logout:        \(\) => doLogout\(\),\n    openLogin:     \(\) => \{ try \{ openAuthModal\(\); \} catch \(_\) \{\} \}\n  \};/.test(index), 'AppAuth.logout, antes de openLogin (la ultima, sin coma)');
const fin = f => (index.match(new RegExp('(?:async )?function ' + f + '\\([^)]*\\) \\{[\\s\\S]*?\\n  \\}')) || [''])[0];
ok(/window\.dispatchEvent\(new Event\('tg-sesion'\)\);\n  \}$/.test(fin('handleSignedIn')) && /window\.dispatchEvent\(new Event\('tg-sesion'\)\);\n  \}$/.test(fin('handleSignedOut')),
  'el evento tg-sesion, al final de handleSignedIn y de handleSignedOut');
ok(/window\.TG_PUSH = \{ pedir: pushPedir, textos: PUSH_TX, anadirBoton: pushAnadirBoton \};/.test(index) && /function pushAnadirBoton\(boton, mensaje\)/.test(index) && /P\.anadirBoton\('tgp-push', 'tgp-push-msg'\)/.test(MOD),
  'el boton de notificaciones del perfil es un par mas de los de la cuenta (TG_PUSH.anadirBoton): se esconde igual en la app de la tienda');
ok(/TG_IDIOMA\.registrar\('perfil'/.test(MOD), 'el perfil se apunta al cambio de idioma (TG_IDIOMA)');

console.log('\n  ' + cuenta + ' controles, ' + (fallos ? fallos + ' con fallo' : 'todos en verde'));
process.exit(fallos ? 1 : 0);
