#!/usr/bin/env node
/* auditar_perfil.js — la pantalla «Su perfil» y sus avatares (22 de octubre de 2026).
 *
 *     node tools/auditar_perfil.js
 *
 * POR QUE EXISTE. Los avatares son dibujos SVG escritos a mano (235 y 49 de
 * oro, en modulos/avatares.js) y la app los pinta con innerHTML: un motivo con un
 * <script>, un atributo on… o un enlace seria codigo ajeno dentro de la app,
 * y uno mal cerrado romperia el boton de la cuenta. Ninguno de los controles
 * que recorren la app abre el catalogo, asi que se mira aqui, sin navegador.
 *
 * QUE MIRA (parte 1, el catalogo)
 *   1. 47 sets y 235 avatares, 5 por set, y detras de los cinco su avatar de
 *      oro (uno por set y tres en Tenerife: 49): uno por idioma de la app
 *      (SUPPORTED_LANGS), el de Tenerife («tf»), que se abre con 10 visitas
 *      comprobadas, y uno por cada uno de los 36 paises de Europa que decidio
 *      Jerome (22 de octubre: los Estados de la ONU en Europa y Chipre, sin
 *      Kosovo ni el Vaticano), con su codigo ISO 3166-1. Ni uno mas ni uno
 *      menos: un pais nuevo pasa antes por su revision (la nota del encargo).
 *   2. los ids, unicos y con la forma de un id del catalogo (la misma que
 *      exigen perfil.js al leer y perfil.sql en la nube); los de oro, y solo
 *      ellos, <set>-oro-<palabra>.
 *   3. la bandera de cada set, la misma que la del menu de idiomas; la de un
 *      pais, sus dos letras regionales.
 *   4. cada motivo, SVG bien cerrado y sin nada que ejecute ni pida nada:
 *      ni <script>, ni atributos on…, ni href, ni <image>, <text>, <use> o
 *      <foreignObject>, ni url(…) (el recorte y el degradado los pone svg());
 *      y, como validar_catalogo.py y validar_svg.py del encargo, solo
 *      etiquetas de dibujo (g, path, circle, ellipse, rect, polygon,
 *      polyline, line), sin id ni style, sin comillas simples y de 2.200
 *      bytes como mucho; «class», solo con las piezas que se mueven solas
 *      (ANIM_PIEZAS) y nunca en un elemento con transform (la animacion se lo
 *      comeria).
 *   5. dos llamadas a svg() del mismo avatar dan ids distintos: con el mismo
 *      id, si la primera copia esta dentro de algo oculto, la segunda se pinta
 *      sin fondo y sin recorte (comprobado en Chromium al verificar el encargo).
 *      Y cada avatar lleva su animacion (una de las nueve de ANIM), que svg()
 *      pone en el grupo del motivo; los de oro salen como medalla.
 *  5b. los de oro (Jerome, 23 de octubre de 2026: «Algunos que pueden salir en
 *      momento particular o eventos del pais como de oro»): la regla de la
 *      fecha de cada fiesta es de un tipo conocido y con sus campos, y da una
 *      ventana todos los años de 2026 a 2045 que empieza en su año. Las
 *      fechas mismas (las dos Pascuas, las ventanas de varios dias, la
 *      excepcion de 2027 del Carnaval) las prueba tools/probar_fechas_oro.js.
 *
 * QUE MIRA (parte 2, la pantalla: modulos/perfil.js)
 *   6. las 425 filas de PERFIL_UI (94 de la pantalla, 47 de sets, 284 de
 *      avatares: 235 y 49 de oro), con lo que comprobaba validar_i18n.py del encargo: los diez
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
 *      perfil.sql; la fila del permiso solo la crea «Acepto»; y el cuerpo, sin
 *      marcas de idioma en la cadena (auditar_seguridad.py no deja ninguna
 *      dentro de un <script>).
 *   9. los enganches con la app: los dos botones de «Cuenta» abren el perfil;
 *      el cargador declara los dos modulos y pide avatares.js antes;
 *      tenerife.perfil es la misma clave en los dos; sw.js los precarga y los
 *      pide «red primero»; AppAuth.logout y el evento tg-sesion al entrar y
 *      al salir; el boton de notificaciones, un par mas (TG_PUSH.anadirBoton);
 *      y nada del prototipo (selector de idioma, «Ejemplo», «Demo», la fecha
 *      simulada de los de oro).
 *  9c. los de oro y el movimiento, en el modulo: cada animacion y cada pieza
 *      tiene su regla en los estilos, y con «reducir movimiento» nada se mueve
 *      (jugar() no hace nada y los estilos dejan cualquier animacion en nada);
 *      «Sorpréndeme» nunca da uno de oro; la lista de los de oro conseguidos
 *      no sube a la nube (solo el avatar elegido) y va en la descarga.
 *  9b. con mucho dato, la tendencia del peso (la media de los 7 dias que
 *      acaban en cada registro) da lo mismo que la cuenta de siempre, bit a
 *      bit, tambien en zonas con cambio de hora, y lee cada fecha una vez
 *      (23 de octubre de 2026: con tres años de pesos diarios eran 2,4
 *      millones de lecturas, y abrir el perfil tardaba segundos).
 *
 * QUE MIRA (parte 3, la nube: supabase/perfil.sql)
 *  10. sin «$» (al pegarlo desde el movil llega con una barra delante y
 *      rompe el SQL); RLS en las tres tablas, cada policy solo para
 *      authenticated y con auth.uid() = user_id, ninguna para anon; y los
 *      permisos justos: revoke all y grant de las cuatro operaciones (sin
 *      TRUNCATE, que no pasa por la RLS).
 *  11. las cascadas: perfiles cuelga de auth.users, pesos y caminatas de
 *      perfiles (retirar el permiso o borrar la cuenta se lo lleva todo); y
 *      borrar-cuenta.sql lo cuenta.
 *  12. el modulo y el SQL dicen lo mismo: las columnas que pide el modulo
 *      existen, y los rangos de los check son los de RANGO.
 *  13. los topes (23 de octubre de 2026): cada peso y cada caminata con una
 *      fecha de 1900 a 2100, y como mucho 2.000 pesos y 2.000 caminatas por
 *      cuenta, la misma cifra en perfil.sql y en el modulo (TOPE_REGISTROS),
 *      que asi no deja anotar uno que la nube rechazaria.
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
const sets = AV.sets, ids = [], todos = [];
sets.forEach(s => s.avatares.forEach(a => { todos.push(a); ids.push(a.id); }));
const normales = todos.filter(a => !a.oro), oros = todos.filter(a => a.oro);
ok(sets.length === 47, '47 sets', sets.length);
ok(normales.length === 235 && AV.total === 235, '235 avatares sin contar los de oro (TG_AVATARES.total lo dice igual)', normales.length + ' / ' + AV.total);
ok(oros.length === 49 && Array.isArray(AV.oros) && AV.oros.length === 49 && AV.oros.every(a => oros.includes(a)), '49 de oro, los de TG_AVATARES.oros', oros.length + ' / ' + (AV.oros || []).length);
const malSet = sets.filter(s => s.avatares.filter(a => !a.oro).length !== 5 || s.avatares.slice(0, 5).some(a => a.oro) || s.avatares.filter(a => a.oro).length !== (s.id === 'tf' ? 3 : 1));
ok(!malSet.length, '5 avatares por set y, detras de los cinco, su de oro: uno por set y tres en Tenerife (Carnaval, Dia de Canarias y San Juan)', malSet.map(s => s.id + ':' + s.avatares.map(a => a.oro ? 'O' : 'n').join('')).join(', '));
ok(new Set(ids).size === ids.length, 'ningun id repetido');
const FORMA = /^[a-z]{2,3}-[a-z]+(-[a-z]+)*$/;
ok(ids.every(i => FORMA.test(i) && i.length >= 4 && i.length <= 24), 'cada id con la forma de un id del catalogo (la de perfil.sql: 4 a 24 letras y guiones)', ids.filter(i => !FORMA.test(i)).join(', '));
ok(sets.every(s => s.avatares.every(a => a.id.startsWith(s.id + '-'))), 'cada id empieza por el de su set');
ok(sets.every(s => s.avatares.every(a => !!a.oro === a.id.startsWith(s.id + '-oro-'))), 'los de oro, y solo ellos, se llaman <set>-oro-…', todos.filter(a => !!a.oro !== /-oro-/.test(a.id)).map(a => a.id).join(', '));
/* las nueve animaciones y las diez piezas que se mueven solas: las de avatares.js tienen
   que ser estas (las mueve perfil.css, en el modulo; ver 9c) */
const ANIM = ['bote', 'salto', 'balanceo', 'colgado', 'latido', 'vaiven', 'avance', 'giro', 'brillo'];
const PIEZAS = ['tga-girar', 'tga-humo', 'tga-chorro', 'tga-ala', 'tga-cola', 'tga-cola-d', 'tga-brilla', 'tga-ola', 'tga-onda', 'tga-sube'];
const mismas = (x, y) => Array.isArray(x) && JSON.stringify([...x].sort()) === JSON.stringify([...y].sort());
ok(mismas(AV.ANIM, ANIM) && mismas(AV.ANIM_PIEZAS, PIEZAS), 'las nueve animaciones (ANIM) y las diez piezas que se mueven solas (ANIM_PIEZAS) son las de este control', JSON.stringify([AV.ANIM, AV.ANIM_PIEZAS]));
ok(todos.every(a => ANIM.includes(a.a)), 'cada avatar lleva su animacion, una de las nueve', todos.filter(a => !ANIM.includes(a.a)).map(a => a.id + ':' + a.a).join(', '));
const idsSet = sets.map(s => s.id);
/* Los 36 paises de Europa (Jerome, 22 de octubre de 2026): los Estados de la ONU en Europa y
   Chipre, sin Kosovo (Espana no lo reconoce) ni el Vaticano. Sus codigos ISO 3166-1, como en
   validar_catalogo.py del encargo. */
const EUROPA = 'ie dk se no fi is ee lv lt at be ch lu li mc pt gr mt hr si ba rs me mk al ad sm cy cz sk hu ro md ua by ru'.split(' ');
ok(LENGUAS.length === 10 && LENGUAS.every(l => idsSet.includes(l)) && EUROPA.every(c => idsSet.includes(c)) && idsSet.every(i => i === 'tf' || LENGUAS.includes(i) || EUROPA.includes(i)),
  'un set por idioma de la app (SUPPORTED_LANGS), el de Tenerife y uno por cada uno de los 36 paises de Europa, ninguno mas', idsSet.filter(i => i !== 'tf' && !LENGUAS.includes(i) && !EUROPA.includes(i)).concat(EUROPA.filter(c => !idsSet.includes(c)).map(c => 'falta ' + c)).join(','));
const tf = AV.set('tf');
ok(tf && tf.desbloqueo === 10 && sets.filter(s => s.desbloqueo).length === 1, 'solo el set de Tenerife se desbloquea, con 10 visitas comprobadas (Jerome, 22 de octubre)', tf && tf.desbloqueo);
ok(Object.keys(MENU).length === 10, 'el menu de idiomas tiene sus diez banderas', Object.keys(MENU).join(','));
/* la de un pais, sus dos letras regionales: «ie» -> 🇮🇪 (U+1F1EE U+1F1EA) */
const regional = c => String.fromCodePoint(...[...c.toUpperCase()].map(l => 0x1F1E6 + l.charCodeAt(0) - 65));
const malBandera = sets.filter(s => s.id !== 'tf' && (LENGUAS.includes(s.id) ? MENU[s.id] : regional(s.id)) !== s.bandera)
  .map(s => s.id + ' ' + s.bandera + ' / ' + (LENGUAS.includes(s.id) ? 'menu ' + MENU[s.id] : 'letras ' + regional(s.id)));
ok(!malBandera.length && tf && tf.bandera === '🌋', 'la bandera de cada set es la del menu de idiomas (🌏 para el chino tradicional); la de un pais, sus dos letras regionales; Tenerife, 🌋', malBandera.join(' · '));
const HEX = /^#[0-9A-Fa-f]{6}$/;
ok(sets.every(s => HEX.test(s.color)) && sets.every(s => s.avatares.every(a => Array.isArray(a.g) && a.g.length === 2 && a.g.every(c => HEX.test(c)))),
  'colores de set y degradados en #RRGGBB');

const PROHIBIDO = [
  [/<script/i, '<script'], [/\son[a-z]+\s*=/i, 'atributo on…'], [/href/i, 'href'], [/<image\b/i, '<image>'],
  [/<text\b/i, '<text>'], [/<use\b/i, '<use>'], [/<foreignObject/i, '<foreignObject>'], [/url\s*\(/i, 'url(…)'],
  [/javascript:/i, 'javascript:'], [/<style/i, '<style>'], [/<!\[CDATA|<!--|<!/i, 'comentario o CDATA']
];
/* lo que mira validar_dibujo.py del encargo antes de meter un dibujo: solo estas etiquetas,
   sin id ni style (los ids los pone svg(), distintos en cada copia), sin comillas simples
   (el motivo va entre comillas simples en el JS) y 2.200 bytes como mucho, para que el
   catalogo no engorde; «class», solo con las piezas que se mueven solas, y nunca en un
   elemento con transform: la animacion le pondria el suyo encima */
const DIBUJO = new Set(['g', 'path', 'circle', 'ellipse', 'rect', 'polygon', 'polyline', 'line']);
const malMotivo = [];
sets.forEach(s => s.avatares.forEach(a => {
  for (const [re, que] of PROHIBIDO) if (re.test(a.m)) malMotivo.push(a.id + ': ' + que);
  const e = bienCerrado(a.m); if (e) malMotivo.push(a.id + ': ' + e);
  const otras = [...new Set([...a.m.matchAll(/<([a-zA-Z][\w:-]*)/g)].map(m => m[1]))].filter(x => !DIBUJO.has(x));
  if (otras.length) malMotivo.push(a.id + ': <' + otras.join('>, <') + '>');
  if (/\s(id|style)\s*=/.test(a.m)) malMotivo.push(a.id + ': id o style');
  for (const e of a.m.matchAll(/<[a-zA-Z]+\b([^>]*)>/g)) {
    const cl = (e[1].match(/\sclass="([^"]*)"/) || [])[1];
    if (cl === undefined) continue;
    if (!cl.trim() || cl.trim().split(/\s+/).some(c => !PIEZAS.includes(c))) malMotivo.push(a.id + ': class="' + cl + '"');
    if (/\stransform\s*=/.test(e[1])) malMotivo.push(a.id + ': class="' + cl + '" con transform');
  }
  if (a.m.includes("'")) malMotivo.push(a.id + ': comilla simple');
  const bytes = Buffer.byteLength(a.m, 'utf8'); if (bytes > 2200) malMotivo.push(a.id + ': ' + bytes + ' bytes');
}));
ok(!malMotivo.length, 'los 284 motivos, SVG bien cerrado y sin nada que ejecute ni pida nada: solo etiquetas de dibujo, sin id, style ni comillas simples, «class» solo con las piezas que se mueven y nunca con transform, y 2.200 bytes como mucho', malMotivo.join(' · '));

const malSvg = [];
for (const x of todos) {
  const i = x.id, a = AV.svg(i), b = AV.svg(i, { etiqueta: 'Nombre <de> "prueba" & más' });
  const idsA = [...a.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]), idsB = [...b.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  /* el degradado y el recorte; los de oro, ademas, el oro de la medalla y su recorte */
  const nIds = x.oro ? 4 : 2;
  if (idsA.length !== nIds || idsB.length !== nIds || idsA.some(y => idsB.includes(y))) malSvg.push(i + ': ids ' + idsA.join(',') + ' / ' + idsB.join(','));
  if (bienCerrado(a) || bienCerrado(b)) malSvg.push(i + ': ' + (bienCerrado(a) || bienCerrado(b)));
  if (!/aria-hidden="true"/.test(a) || !/role="img" aria-label="Nombre de prueba  más"/.test(b)) malSvg.push(i + ': etiqueta');
  if (!a.includes('<g class="tga-m tga-' + x.a + '">')) malSvg.push(i + ': sin su animacion en el grupo del motivo');
  if (!!x.oro !== /class="tg-avatar tg-oro"/.test(a) || (x.oro && !/class="tga-chispas"/.test(a))) malSvg.push(i + ': ' + (x.oro ? 'no sale como medalla' : 'sale como medalla sin ser de oro'));
}
ok(!malSvg.length, 'svg(): ids propios en cada llamada, SVG bien cerrado, oculto al lector de pantalla sin etiqueta y con la etiqueta limpia de <, >, & y comillas; el motivo, en el grupo de su animacion; los de oro, y solo ellos, como medalla con sus destellos', malSvg.slice(0, 5).join(' · '));
ok(AV.esOro(oros[0].id) === true && AV.esOro(normales[0].id) === false && AV.esOro('no-existe') === false, 'esOro() dice cuales son de oro');

/* 5b. la regla de la fecha de cada fiesta de oro (la de validar_catalogo.py del encargo) */
const TIPOS = { fija: ['mes', 'dia'], enesimo: ['mes', 'n', 'semana'], entre: ['mes', 'desde', 'hasta', 'semana'],
  pascua: ['desfase'], 'pascua-ortodoxa': ['desfase'], tabla: ['fechas'] };
const OPCIONALES = ['dias', 'si_domingo', 'excepciones'];
const MMDD = /^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
function reglaMal(r) {
  const t = r && r.tipo;
  if (!TIPOS[t]) return 'tipo ' + t;
  const claves = Object.keys(r).filter(k => k !== 'tipo');
  const sobra = claves.filter(k => !TIPOS[t].includes(k) && !OPCIONALES.includes(k)), falta = TIPOS[t].filter(k => !(k in r));
  if (sobra.length || falta.length) return 'campos de mas ' + sobra + ' o de menos ' + falta;
  const ent = (k, a, b) => Number.isInteger(r[k]) && r[k] >= a && r[k] <= b;
  if (TIPOS[t].includes('mes') && !ent('mes', 1, 12)) return 'mes';
  if (t === 'fija' && !ent('dia', 1, 31)) return 'dia';
  if ((t === 'enesimo' || t === 'entre') && !ent('semana', 1, 7)) return 'semana (1 = lunes … 7 = domingo)';
  if (t === 'enesimo' && ![-1, 1, 2, 3, 4, 5].includes(r.n)) return 'n';
  if (t === 'entre' && !(ent('desde', 1, 31) && ent('hasta', 1, 31) && r.hasta - r.desde === 6)) return 'desde/hasta (una semana justa)';
  if ((t === 'pascua' || t === 'pascua-ortodoxa') && !ent('desfase', -120, 120)) return 'desfase';
  const tablaMal = x => !x || typeof x !== 'object' || Object.entries(x).some(([y, v]) => !/^20\d\d$/.test(y) || !MMDD.test(v));
  if (t === 'tabla' && tablaMal(r.fechas)) return 'fechas';
  if ('dias' in r && !ent('dias', 1, 10)) return 'dias (1 a 10)';
  if ('si_domingo' in r && r.si_domingo !== -1 && r.si_domingo !== 1) return 'si_domingo (-1 o 1)';
  if ('excepciones' in r && tablaMal(r.excepciones)) return 'excepciones';
  return null;
}
const malOro = [];
for (const a of oros) {
  const e = reglaMal(a.oro);
  if (e) { malOro.push(a.id + ': ' + e); continue; }
  for (let y = 2026; y <= 2045; y++) {
    const v = AV.ventana(a.id, y);
    if (!v) { malOro.push(a.id + ': sin fecha en ' + y); break; }
    if (v.desde.slice(0, 4) !== String(y) || v.hasta < v.desde) { malOro.push(a.id + ': la ventana de ' + y + ' es ' + v.desde + '…' + v.hasta); break; }
  }
}
ok(!malOro.length, 'la regla de cada fiesta de oro, de un tipo conocido y con sus campos, da una ventana todos los años de 2026 a 2045 que empieza en su año (las fechas, en probar_fechas_oro.js)', malOro.join(' · '));
ok(AV.ventana(normales[0].id, 2027) === null && AV.disponible(normales[0].id, '2027-01-01') === false, 'un avatar que no es de oro no tiene ventana');
/* El martes de Carnaval: el boton de fiestas (FI_DATA, en index.html) y el avatar de oro del
   Carnaval tienen que decir el mismo dia cada año, tambien cuando Santa Cruz se aparta de la regla
   (en 2027, el 23 de febrero, y no el 9). Las funciones del boton se corren aqui tal cual. */
function funcionDe(src, nombre) {
  const i = src.indexOf('  function ' + nombre + '('); if (i < 0) return '';
  let k = src.indexOf('{', i), prof = 0;
  for (; k < src.length; k++) { if (src[k] === '{') prof++; else if (src[k] === '}' && --prof === 0) break; }
  return src.slice(i, k + 1);
}
const fiCod = ['fiEaster', 'fiAddDays', 'fiDateForYear'].map(n => funcionDe(index, n));
const fiCarn = (index.match(/\{ emoji:'🎭', date:(\{ type:'easter', off:-?\d+(?:, exc:\{[^}]*\})? \}), lat:28\.4682/) || [])[1];
const carnMal = [];
try {
  const caja = {}; vm.runInNewContext(fiCod.join('\n') + '\nthis.f = fiDateForYear;', caja);
  const spec = vm.runInNewContext('(' + fiCarn + ')');
  const dia = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  for (let y = 2026; y <= 2045; y++) {
    const boton = dia(caja.f(spec, y)), oro = (AV.ventana('tf-oro-carnaval', y) || {}).hasta;
    if (boton !== oro) carnMal.push(y + ': el boton dice ' + boton + ' y el avatar ' + oro);
  }
} catch (e) { carnMal.push(String(e)); }
ok(fiCod.every(Boolean) && fiCarn && !carnMal.length, 'el martes de Carnaval del boton de fiestas (FI_DATA de index.html) es el ultimo dia del avatar de oro del Carnaval, cada año de 2026 a 2045 (en 2027, el 23 de febrero, como lo fijo el Ayuntamiento)', carnMal.join(' · '));
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
ok(claves.length === 425, 'PERFIL_UI: 425 filas', claves.length);
ok(claves.filter(k => k.startsWith('perfilSet_')).length === 47 && claves.filter(k => k.startsWith('perfilAv_')).length === 284, '47 filas de sets y 284 de avatares, 235 y 49 de oro (y 94 de la pantalla)');
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
/* nombres que se escriben igual en todos los idiomas de letra latina (los de Europa, con
   validar_i18n.py del encargo del 23 de octubre: Péckvillchen, Svíčková y Kriváň; y los de
   oro: el nombre islandes de la iglesia, y el Dia de Canarias, que el neerlandes deja en
   castellano, como se ve en las islas) */
const IGUAL_ACEPTADO = new Set(['Teide', 'Paella', 'Croissant', 'Pizza', 'Gelato', 'Corgi', 'Panda', 'Lavanda', 'Pierogi', 'Martenitsa', 'Jiaozi', 'Dim sum', 'Bubble tea', 'Guagua', 'Macarons', 'Kilómetros',
  'Péckvillchen', 'Svíčková', 'Kriváň', 'Hallgrímskirkja', 'Día de Canarias']);
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
ok(!malFilas.length, 'las ' + claves.length + ' filas: diez idiomas, marcadores, sin comillas dobles ni invisibles, plurales, chino de cada escritura, bulgaro sin letras latinas, nada copiado del castellano', malFilas.slice(0, 6).join(' · '));
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
ok(!/data-tx/.test(CUERPO), 'el cuerpo no lleva marcas de idioma en la cadena: sus claves van en TEXTOS (fuente.py pega el modulo en un <script>, y auditar_seguridad.py no deja ninguna ahi)');
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
const prototipo = ['sembrar', 'LANG_NAMES', 'PROTO', 'EXTRA', 'BADGES', 'LOCALE', 'st.lang', 'st.demo', 'tgp-lang', 'tgp-demo', 'tgp-demo-fecha', 'tgp-demo-fiesta', 'hoyOro', 'protoIdioma', 'protoEjemplo', 'protoCopiar', 'tgp-modal', 'tgp.v4']
  .filter(x => new RegExp('(^|[^\\w.-])' + x.replace(/[.-]/g, '\\$&') + '(?![\\w-])').test(CODIGO));
ok(!prototipo.length, 'nada del prototipo: ni selector de idioma, ni «Ejemplo», ni «Demo», ni datos sembrados, ni la ventana de descarga, ni la fecha simulada de los de oro', prototipo.join(', '));

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

/* 9c. los de oro y el movimiento, en el modulo */
const ESTI = ESTILOS.replace(/\/\*[\s\S]*?\*\//g, '');
const sinRegla = ANIM.filter(a => !new RegExp('\\.tga-play \\.tga-m\\.tga-' + a + ' \\{[^}]*animation:').test(ESTI))
  .concat(PIEZAS.filter(p => !new RegExp('\\.tga-play \\.' + p + ' \\{[^}]*animation:').test(ESTI)))
  .concat([...ESTI.matchAll(/animation:\s*([a-z-]+)\s/g)].map(m => m[1]).filter(n => n !== 'none' && !new RegExp('@keyframes ' + n + ' \\{').test(ESTI)).map(n => '@keyframes ' + n));
ok(!sinRegla.length, 'cada una de las nueve animaciones y de las diez piezas tiene su regla en los estilos, y cada animacion su @keyframes', [...new Set(sinRegla)].join(', '));
const reduce = (ESTI.match(/@media \(prefers-reduced-motion: reduce\) \{\s*\.tgp \*, \.tgp \*::before, \.tgp \*::after, \.tgp-toast \{ animation-duration: \.01ms !important; animation-iteration-count: 1 !important;/) || [])[0];
ok(reduce && /var reducido = window\.matchMedia && window\.matchMedia\('\(prefers-reduced-motion: reduce\)'\)\.matches;/.test(CODIGO) && /function jugar\(n\) \{\s*if \(!n \|\| reducido\) return;/.test(CODIGO),
  'con «reducir movimiento» nada se mueve: jugar() no hace nada y los estilos dejan cualquier animacion en nada');
const sorpresa = (CODIGO.match(/\$\('tgp-random'\)\.addEventListener\('click', function \(\) \{[^\n]*\n[^\n]*/) || [''])[0];
ok(/s\.avatares\.filter\(function \(a\) \{ return !esOro\(a\); \}\)/.test(sorpresa), '«Sorpréndeme» nunca da uno de oro (son de su fiesta)', sorpresa.slice(0, 160));
const camposNube = (CODIGO.match(/function camposPerfil\(\) \{[\s\S]*?\n  \}/) || [''])[0];
ok(camposNube && !/oro/.test(camposNube) && /avatares_oro: st\.oro/.test(CODIGO) && /function avatarLibre\(a\) \{ return esOro\(a\) \? \(tieneOro\(a\.id\) \|\| oroHoy\(a\)\) : setDesbloqueado/.test(CODIGO),
  'un avatar de oro se coge solo el dia de su fiesta (o si ya es suyo); la lista de los conseguidos no sube a la nube (sube el avatar elegido) y va en la descarga');

/* 9b. con mucho dato: la tendencia del peso, la media de los 7 dias que acaban en cada
   registro. Antes se miraban todos los registros por cada uno, y con tres años de pesos
   diarios abrir el perfil tardaba segundos en un movil lento (23 de octubre de 2026). Se
   compara con aquella cuenta, tal cual estaba, valor a valor y bit a bit: en la zona de la
   isla con tres años diarios, y en cinco zonas (cuatro con cambio de hora, una de ellas de
   media hora, y la de Samoa, que se salto el 30 de diciembre de 2011) con pesos salteados,
   los bordes de la semana y fechas repetidas. Y cada fecha se lee una vez. */
const unaLinea = f => (CODIGO.match(new RegExp('\\n  function ' + f + '\\([^)]*\\) \\{[^\\n]*\\}\\n')) || [''])[0];
const TEND = (CODIGO.match(/\n  function tendencia\(ms\) \{[\s\S]*?\n  \}\n/) || [''])[0];
const DE_SIEMPRE = 'function deSiempre(ms) { return ms.map(function (m) { var v = ms.filter(function (o) { var d = dias(o.d, m.d); return d >= 0 && d <= 6; }); return v.reduce(function (s, o) { return s + o.kg; }, 0) / v.length; }); }';
const miles = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const tendMal = [], ctxT = { leidas: 0 }, tzAntes = process.env.TZ;
let comparados = 0, leidasAntes = 0, leidasAhora = 0;
try {
  vm.createContext(ctxT);
  vm.runInContext(unaLinea('fecha') + unaLinea('dias') + TEND + DE_SIEMPRE + '\nvar deVerdad = fecha; fecha = function (s) { leidas++; return deVerdad(s); };', ctxT, { filename: 'modulos/perfil.js (fecha, dias, tendencia)' });
  const dia = n => new Date(Date.UTC(2023, 9, 23 + n)).toISOString().slice(0, 10);
  const diarios = []; for (let n = 0; n <= 1095; n++) diarios.push({ d: dia(n), kg: Math.round((88 - n * 0.008 + Math.sin(n / 9)) * 10) / 10 });
  let semilla = 11; const azar = () => (semilla = (semilla * 9301 + 49297) % 233280) / 233280;
  const salteados = []; for (let n = 0, d = 0; n < 200; n++) { d += 1 + Math.floor(azar() * 9); salteados.push({ d: dia(d), kg: Math.round((60 + azar() * 50) * 10) / 10 }); }
  const juegos = {
    salteados, uno: [{ d: '2026-03-29', kg: 70.3 }],
    bordes: [['2026-03-22', 80], ['2026-03-28', 81.1], ['2026-03-29', 79.9], ['2026-04-04', 80.7], ['2026-04-05', 80.2], ['2026-10-24', 78.8], ['2026-10-25', 78.1], ['2026-11-01', 77.7]].map(([d, kg]) => ({ d, kg })),
    samoa: [['2011-12-28', 90], ['2011-12-29', 90.4], ['2011-12-30', 90.1], ['2011-12-31', 89.7], ['2012-01-01', 89.9], ['2012-01-05', 89.3]].map(([d, kg]) => ({ d, kg })),
    repetidos: [['2026-01-01', 70], ['2026-01-01', 71.3], ['2026-01-03', 70.1], ['2026-01-08', 69.9], ['2026-01-08', 70.4], ['2026-01-09', 70.2]].map(([d, kg]) => ({ d, kg }))
  };
  const comparar = (zona, nombre, ms) => {
    ctxT.leidas = 0; const a = ctxT.deSiempre(ms), la = ctxT.leidas;
    ctxT.leidas = 0; const b = ctxT.tendencia(ms), lb = ctxT.leidas;
    const i = a.findIndex((x, k) => !Object.is(x, b[k]));
    comparados += a.length;
    if (a.length !== b.length || i >= 0) tendMal.push(zona + ' ' + nombre + ' [' + i + '] ' + a[i] + ' / ' + b[i]);
    if (lb !== ms.length) tendMal.push(zona + ' ' + nombre + ': ' + lb + ' fechas leidas para ' + ms.length + ' registros');
    return [la, lb];
  };
  process.env.TZ = 'Atlantic/Canary';
  [leidasAntes, leidasAhora] = comparar('Atlantic/Canary', 'tres años diarios', diarios);
  for (const zona of ['Atlantic/Canary', 'Pacific/Auckland', 'Australia/Lord_Howe', 'America/Santiago', 'Pacific/Apia']) {
    process.env.TZ = zona;
    for (const [nombre, ms] of Object.entries(juegos)) comparar(zona, nombre, ms);
  }
} catch (e) { tendMal.push('no se pudo probar: ' + e.message); }
if (tzAntes === undefined) delete process.env.TZ; else process.env.TZ = tzAntes;
ok(TEND && comparados > 1300 && !tendMal.length, 'con mucho dato, la tendencia del peso da lo mismo que la cuenta de siempre (' + miles(comparados) + ' valores, bit a bit, en cinco zonas horarias: cuatro con cambio de hora y la de Samoa, que se salto un dia) y lee cada fecha una vez: con tres años de pesos diarios, ' + miles(leidasAhora) + ' lecturas en lugar de ' + miles(leidasAntes), tendMal.slice(0, 4).join(' · '));

/* ── parte 3: la nube (supabase/perfil.sql) ──────────────────────────── */
console.log('\n=== el perfil: la nube (supabase/perfil.sql) ===');
const SQL = fs.existsSync(path.join(RAIZ, 'supabase/perfil.sql')) ? lee('supabase/perfil.sql') : '';
ok(SQL.length > 1000, 'supabase/perfil.sql esta en el repositorio');
ok(!SQL.includes('$'), 'sin «$» en el SQL (al pegarlo desde el movil llega con una barra delante)');
const TABLAS = ['perfiles', 'pesos', 'caminatas'];
ok(TABLAS.every(tb => new RegExp('alter table public\\.' + tb + '\\s+enable row level security;').test(SQL)), 'RLS en perfiles, pesos y caminatas');
const policies = [...SQL.matchAll(/create policy (\w+) on public\.(\w+)\s+for (\w+) to (\w+)\s+((?:using|with check)[\s\S]*?);/g)];
const polMal = policies.filter(m => m[4] !== 'authenticated' || !/auth\.uid\(\) = user_id/.test(m[5]) || ((m[3] === 'insert' || m[3] === 'update') && !/with check \(auth\.uid\(\) = user_id\)/.test(m[5])));
ok(policies.length === 12 && !polMal.length && !/to anon|to public\b/i.test(SQL), '12 policies (4 por tabla), todas para authenticated con auth.uid() = user_id; ninguna para anon', policies.length + ' ' + polMal.map(m => m[1]).join(','));
ok(/revoke all on public\.perfiles, public\.pesos, public\.caminatas from anon, authenticated;/.test(SQL)
   && /grant select, insert, update, delete on public\.perfiles, public\.pesos, public\.caminatas to authenticated;/.test(SQL)
   && !/grant[^;]*(truncate|all)[^;]*;/i.test(SQL), 'los permisos, justos: revoke all y solo select, insert, update y delete para authenticated (sin TRUNCATE)');
ok(/user_id\s+uuid primary key references auth\.users\(id\) on delete cascade/.test(SQL)
   && (SQL.match(/references public\.perfiles\(user_id\) on delete cascade/g) || []).length === 2, 'las cascadas: perfiles de auth.users, y pesos y caminatas de perfiles');
ok(/public\.perfiles\s+\(perfil\.sql\), y detras pesos y caminatas/.test(lee('supabase/borrar-cuenta.sql')) && /las tres tablas que la/.test(lee('supabase/borrar-cuenta.sql')), 'borrar-cuenta.sql cuenta las tres tablas que caen con la cuenta');
/* las columnas que el modulo lee o escribe, en su tabla */
const cols = tb => { const m = SQL.match(new RegExp('create table if not exists public\\.' + tb + ' \\(([\\s\\S]*?)\\n\\);')); return m ? [...m[1].matchAll(/^\s{2}(\w+)\s+(?:uuid|text|numeric|integer|date|timestamptz)/gm)].map(x => x[1]) : []; };
const pide = {
  perfiles: (CODIGO.match(/from\('perfiles'\)\.select\('([^']+)'\)/) || [, ''])[1].split(',').map(x => x.trim()).concat(['user_id', 'consentido_en'], (CODIGO.match(/function camposPerfil\(\) \{\s*return \{([^}]*)\}/) || [, ''])[1].match(/(\w+):/g).map(x => x.slice(0, -1))),
  pesos: (CODIGO.match(/from\('pesos'\)\.select\('([^']+)'\)/) || [, ''])[1].split(',').map(x => x.trim()).concat(['user_id']),
  caminatas: (CODIGO.match(/from\('caminatas'\)\.select\('([^']+)'\)/) || [, ''])[1].split(',').map(x => x.trim()).concat(['user_id'])
};
const faltanCols = TABLAS.flatMap(tb => pide[tb].filter(c => c && !cols(tb).includes(c)).map(c => tb + '.' + c));
ok(pide.perfiles.length > 8 && !faltanCols.length, 'cada columna que el modulo lee o escribe existe en perfil.sql', faltanCols.join(', '));
/* los rangos: los mismos en el modulo (RANGO) y en los check del SQL */
const R = (CODIGO.match(/var RANGO = (\{[^;]*\});/) || [, '{}'])[1];
let RANGO = {}; try { RANGO = vm.runInNewContext('(' + R + ')'); } catch (e) {}
const chk = re => (SQL.match(re) || []).slice(1).map(Number);
const rangosMal = [];
if (JSON.stringify(chk(/altura_cm between (\d+) and (\d+)/)) !== JSON.stringify(RANGO.cm)) rangosMal.push('altura ' + chk(/altura_cm between (\d+) and (\d+)/) + ' / ' + RANGO.cm);
if (JSON.stringify(chk(/objetivo_kg between (\d+) and (\d+)/)) !== JSON.stringify(RANGO.kg)) rangosMal.push('objetivo');
if (JSON.stringify(chk(/kg between (\d+) and (\d+)\)/)) !== JSON.stringify(RANGO.kg)) rangosMal.push('pesos');
if (JSON.stringify(chk(/km between ([\d.]+) and (\d+)/)) !== JSON.stringify(RANGO.km)) rangosMal.push('km');
if (!/char_length\(nombre\) <= 24/.test(SQL) || !/slice\(0, 24\)/.test(CODIGO)) rangosMal.push('nombre 24');
if (!/char_length\(id\) between 8 and 64/.test(SQL) || !/s\.length >= 8 && s\.length <= 64/.test(CODIGO)) rangosMal.push('id de caminata 8-64');
ok(!rangosMal.length, 'los check del SQL son los rangos del modulo (altura, objetivo, pesos, km, nombre, id de caminata)', rangosMal.join(' · '));
/* 13. los topes */
const fechaSql = tb => new RegExp('alter table public\\.' + tb + ' add constraint ' + tb + '_fecha\\s+check \\(fecha between date \'1900-01-01\' and date \'2100-12-31\'\\);').test(SQL);
ok(fechaSql('pesos') && fechaSql('caminatas'), 'cada peso y cada caminata, con una fecha de 1900 a 2100 (pesos_fecha, caminatas_fecha)');
const topeApp = +((CODIGO.match(/var TOPE_REGISTROS = (\d+);/) || [])[1]);
const topesSql = [...SQL.matchAll(/group by \w\.user_id having count\(\*\) > (\d+)\) then/g)].map(m => +m[1]);
ok(topeApp === 2000 && topesSql.length === 2 && topesSql.every(n => n === topeApp) && (SQL.match(/raise exception ''[^']+'' using errcode = ''54000'';/g) || []).length === 2,
  'como mucho 2.000 pesos y 2.000 caminatas por cuenta: la misma cifra en perfil.sql (los dos disparadores, error 54000) y en el modulo (TOPE_REGISTROS)', topeApp + ' / ' + topesSql.join(','));
ok(/function pesoNoCabe\(d\) \{ return st\.medidas\.length >= TOPE_REGISTROS && !st\.medidas\.some/.test(CODIGO) && /if \(st\.km\.length >= TOPE_REGISTROS\) \{ avisoTope\('tgp-km-nuevo-h'\); return; \}/.test(CODIGO),
  'con el tope lleno, un peso de un dia nuevo o una caminata mas no se anotan (cambiar el peso de un dia que ya lo tiene, siempre)');

console.log('\n  ' + cuenta + ' controles, ' + (fallos ? fallos + ' con fallo' : 'todos en verde'));
process.exit(fallos ? 1 : 0);
