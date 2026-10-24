#!/usr/bin/env node
/* probar_perfil.js — la pantalla «Su perfil», en la app y en un navegador (22 de octubre de 2026).
 *
 *     node tools/probar_perfil.js PUERTO
 *
 * POR QUE EXISTE. tools/auditar_perfil.js mira el codigo sin navegador; aqui se
 * usa la pantalla de verdad, dentro de la app, como la usaria alguien. Son las
 * pruebas con las que se verifico el encargo (PARA-CLAUDE-CODE-PERFIL.md), que
 * venian para el prototipo, pasadas a la app, y lo que pide la nota encima:
 *   1. las regresiones de la verificacion (pruebas/regresiones.py, 51): «Guardar»
 *      no inventa un peso, 176 cm ida y vuelta, el IMC y su categoria, la nota de
 *      menos de 20 años, «81,5» y «815», los plurales, borrar un km, la descarga,
 *      borrar los datos con confirmacion, el set Tenerife y el interruptor;
 *   1b. el selector de los 47 sets (las 9 del 23 de octubre, de la 28 a la 36): el
 *      pais del navegador primero, «Todos los paises» en orden, el buscador sin
 *      tildes y en ingles, elegir un pais, un avatar de Europa que vuelve al abrir,
 *      Escape, el cambio de idioma con la lista abierta, «Sorpréndeme» y nada
 *      fuera de sitio a 360 px; y los cortes de los nombres (cortes_nombres.py):
 *      los 284 de avatar (235 y 49 de oro) y los 47 de set, en los diez idiomas,
 *      ninguna palabra mas ancha que su caja y, en la tira, dos lineas como mucho;
 *      y la fecha de los de oro, que quepa en su boton, tambien en «De oro»;
 *   1c. los de oro y el movimiento (las 10 del 23 de octubre por la tarde, de la
 *      37 a la 46): fuera de su dia, candado y fecha, y tocarlo dice cuando; el dia
 *      de su fiesta, el punto, «Hoy», la nota, y se coge; sigue siendo suyo pasada
 *      la fiesta y al volver a abrir; «De oro» con las banderas y la cuenta;
 *      «Sorpréndeme» nunca da uno de oro; Tenerife cerrado con su de oro en su
 *      fiesta; las fiestas de varios dias; la descarga con los de oro; y tocar un
 *      avatar lo mueve, nada con «reducir movimiento». La fecha de hoy se cambia con
 *      el reloj del navegador (clock.setFixedTime): la app no tiene otra;
 *   2. la nube con permiso (pruebas/nube.py, 33), contra una nube de mentira que
 *      se porta como supabase/perfil.sql (RLS, 23503, cascade, check, columnas):
 *      tools/perfil_nube_de_prueba.js, la demo-nube.js del encargo, que solo en
 *      esta prueba hace de window.AppAuth;
 *   2b. la nube con mucho dato (23 de octubre de 2026): Supabase devuelve como
 *      mucho 1.000 filas por consulta, y la nube de mentira hace lo mismo; con
 *      1.500 pesos y 1.200 caminatas en la cuenta, un movil nuevo los recibe
 *      todos, la vuelta siguiente no quita ninguno, y con un tope mas bajo
 *      tambien llegan;
 *   2c. el tope (nube.py, 34-37): 2.000 pesos y 2.000 caminatas llegan; con el
 *      tope lleno, uno de un dia nuevo no se anota y lo dice debajo del campo, y
 *      cambiar el peso de un dia que ya lo tiene si, y sube;
 *   3. las visitas comprobadas en el mapa (pruebas/probar_visitas.py, 11);
 *   4. lo de la nota: los 284 avatares pintados; uno de cada set, en el heroe y en
 *      el boton de la cuenta; los dos botones de «Cuenta» abren el perfil; cada
 *      texto fijo del cuerpo (TEXTOS) da con su elemento y su clave; y en los
 *      diez idiomas, a 360, 390 y 430 px: ningun rotulo con una palabra partida,
 *      nada fuera de la pantalla, ningun texto vacio, nada en castellano fuera del
 *      castellano y ningun error;
 *   4b. los de oro en pantalla (barrido_oro.py): diez idiomas, tres anchos y cinco
 *      estados (hoy; «De oro»; el 1 de marzo de 2027, Baba Marta y los dos
 *      Mărțișor, en «De oro» y en el set bulgaro; y el Carnaval de 2027 con
 *      Tenerife cerrado): ni marcadores sueltos, ni «undefined», ni castellano fuera
 *      del castellano, ni palabras cortadas, ni nada fuera de la pantalla, y cada
 *      distintivo de oro dentro de su boton. Con PERFIL_CAPTURAS=<carpeta>, las
 *      capturas a 390 px del 1 de marzo y del Carnaval en los diez idiomas.
 * Las peticiones que no son a 127.0.0.1 se cortan: nada sale de aqui.
 */
'use strict';
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
const path = require('path');

const PUERTO = process.argv[2] || 8766;
const URL = 'http://127.0.0.1:' + PUERTO + '/index.html';
const NUBE = fs.readFileSync(path.join(__dirname, 'perfil_nube_de_prueba.js'), 'utf8');
/* las claves de los textos fijos del cuerpo (TEXTOS, en modulos/perfil.js): [selector, como, clave] */
const TEXTOS = [...((fs.readFileSync(path.join(__dirname, '..', 'modulos', 'perfil.js'), 'utf8').match(/var TEXTOS = \[([\s\S]*?)\n  \];/) || [, ''])[1])
  .matchAll(/\['([^'\n]+)', '(tx|aria|ph)', '([A-Za-z0-9_]+)'\]/g)].map(m => [m[1], m[2], m[3]]);
/* los idiomas, los de la app (SUPPORTED_LANGS): si un dia hay uno mas, tambien se prueba */
const LENG = ((fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8').match(/SUPPORTED_LANGS\s*=\s*\[([^\]]*)\]/) || [, ''])[1])
  .split(',').map(x => x.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
if (LENG[0] !== 'es' || LENG.length < 2) { console.error('no se encuentra SUPPORTED_LANGS en index.html'); process.exit(2); }
let fallos = 0, cuenta = 0;
function ok(cond, que, detalle) {
  cuenta++;
  if (cond) console.log('  OK  ' + que);
  else { fallos++; console.log('  MAL ' + que + (detalle !== undefined ? '   -> ' + JSON.stringify(detalle).slice(0, 500) : '')); }
}
const ymd = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const dia = n => { const d = new Date(); d.setDate(d.getDate() - n); return ymd(d); };
const HOY = dia(0);
const mismoInstante = (a, b) => Math.abs(Date.parse(String(a).replace(/(\.\d{3})\d+/, '$1')) - Date.parse(String(b).replace(/(\.\d{3})\d+/, '$1'))) < 2;
/* Los datos de ejemplo del prototipo (su sembrar()): 15 pesos bajando despacio en 45
   dias y una semana de paseos. Las pruebas de la nube cuentan con ellos. */
function ejemplo() {
  const d = new Date(); d.setDate(d.getDate() - 44);
  const medidas = []; let seed = 7;
  for (let i = 0; i < 45; i += 3) {
    seed = (seed * 9301 + 49297) % 233280; const ruido = (seed / 233280 - 0.5) * 0.8;
    const f = new Date(d); f.setDate(d.getDate() + i);
    medidas.push({ d: ymd(f), kg: Math.round((83.4 - i * 0.045 + ruido) * 10) / 10 });
  }
  const kms = [4.2, 0, 7.8, 3.1, 0, 11.4, 5.6], km = [];
  for (let j = 6; j >= 0; j--) if (kms[6 - j]) km.push({ id: 'ejemplo-caminata-' + j + '-' + Math.random().toString(36).slice(2, 10), d: dia(j), km: kms[6 - j] });
  const c = new Date(); c.setMonth(c.getMonth() - 1);
  return { v: 1, nombre: 'Alex', avatar: '', unidades: 'metric', altura_cm: 178, nacimiento: 1990, objetivo_kg: 78, medidas, km, creado: ymd(c), rango: 30, tab: 'peso', editado: null, nube: null, colas: {} };
}

async function contexto(b, opc) {
  const ctx = await b.newContext(Object.assign({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block', locale: 'es-ES', acceptDownloads: true }, opc || {}));
  await ctx.route('**/*', r => r.request().url().startsWith('http://127.0.0.1') ? r.continue() : r.abort());
  await ctx.addInitScript(() => {
    try { localStorage.setItem('tenerife.tour.seen', '99'); localStorage.setItem('tgo_consent', JSON.stringify({ v: 'denied', t: Date.now() })); } catch (e) {}
  });
  return ctx;
}
/* la app cargada y la bienvenida pasada (sale siempre la primera vez) */
async function abrirApp(pg, lengua) {
  await pg.goto(URL, { waitUntil: 'load' });
  await pg.waitForFunction(() => typeof abrirPerfil === 'function' && typeof setLang === 'function' && typeof places !== 'undefined' && places.length > 100 && window.AppLogros, null, { timeout: 30000 });
  if (await pg.locator('#v19-welcome:not(.hidden)').count()) {
    if (lengua) { const b = pg.locator('.v19-w-lang[data-lang="' + lengua + '"]'); if (await b.count()) { await b.click(); await pg.waitForTimeout(200); } }
    await pg.click('#v19-welcome-start'); await pg.waitForTimeout(1800);
  }
  await pg.evaluate(() => document.querySelectorAll('.v19-tour, .v19-tour-prompt, .v19-tour-overlay').forEach(e => e.remove()));
}
async function abrirPerfilYa(pg) {
  await pg.evaluate(() => abrirPerfil());
  await pg.waitForFunction(() => window.TG_PERFIL && document.getElementById('perfil-panel') && !document.getElementById('perfil-panel').hidden, null, { timeout: 15000 });
  await pg.waitForTimeout(300);
}
/* la nube de mentira, en lugar del AppAuth de la app (solo en esta prueba) */
async function conNube(pg) {
  await pg.addScriptTag({ content: NUBE });
  /* el boton de administrador lo decide esAdmin() (rpc es_admin): aqui, lo que diga la prueba */
  await pg.evaluate(() => { window.__admin = false; window.esAdmin = function () { return Promise.resolve(window.__admin === true); }; });
}
const errores = pg => { const e = []; pg.on('pageerror', x => e.push(String(x))); pg.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) e.push('console: ' + m.text()); }); return e; };

/* ── 1. las regresiones ───────────────────────────────────────────────── */
async function regresiones(b) {
  console.log('\n=== 1. las regresiones de la verificacion (regresiones.py) ===');
  const ctx = await contexto(b), pg = await ctx.newPage(), errs = errores(pg);
  await abrirApp(pg, 'es');
  /* 12 lugares marcados y 3 de ellos comprobados (los del prototipo) */
  await pg.evaluate(hoy => {
    const ids = places.slice(0, 12).map(p => p.id);
    localStorage.setItem('tenerife.visited', JSON.stringify(ids));
    localStorage.setItem('tenerife.visitas', JSON.stringify(ids.slice(0, 3).map(id => ({ id, d: hoy }))));
    localStorage.removeItem('tenerife.perfil');
  }, HOY);
  await conNube(pg); await pg.evaluate(() => TGP_DEMO_NUBE.reiniciar());
  await abrirPerfilYa(pg);
  const E = f => pg.evaluate(f);
  const n0 = await E('TG_PERFIL.estado().medidas.length');
  await pg.fill('#tgp-nac', '1990'); await pg.click('#tgp-save'); await pg.waitForTimeout(250);
  ok(await E('TG_PERFIL.estado().medidas.length') === n0 && await E(`TG_PERFIL.estado().medidas.every(m => m.d !== '${HOY}')`), '1 «Guardar» no inventa un peso de hoy');
  await pg.fill('#tgp-altura', '176'); await pg.click('#tgp-save'); await pg.waitForTimeout(200);
  await pg.click('#tgp-unidades button[data-u="imperial"]'); await pg.waitForTimeout(120); await pg.click('#tgp-unidades button[data-u="metric"]'); await pg.waitForTimeout(120);
  ok(await E('TG_PERFIL.estado().altura_cm') === 176, '2 176 cm ida y vuelta', await E('TG_PERFIL.estado().altura_cm'));
  await pg.fill('#tgp-altura', '180'); await pg.fill('#tgp-peso', '80,9'); await pg.waitForTimeout(150);
  const imc = [await pg.innerText('#tgp-imc-val'), await E(`document.getElementById('tgp-imc-cat').textContent`)];
  ok(imc[0] === '25,0' && imc[1] === 'Sobrepeso', '3 IMC 24,97 -> 25,0 Sobrepeso', imc);
  await pg.fill('#tgp-nac', String(new Date().getFullYear() - 14)); await pg.fill('#tgp-altura', '165'); await pg.fill('#tgp-peso', '70'); await pg.waitForTimeout(150);
  ok(await E(`document.getElementById('tgp-imc-cat').hidden && !document.getElementById('tgp-imc-joven').hidden`), '4 con 14 años: sin categoria y con la nota', await E(`document.getElementById('tgp-imc-joven').textContent`));
  await pg.fill('#tgp-altura', '250,5'); await pg.waitForTimeout(100);
  ok((await pg.innerText('#tgp-altura-h')).includes('Entre'), '5 fuera de rango lo dice', await pg.innerText('#tgp-altura-h'));
  await E('TG_PERFIL.cerrar()'); await pg.waitForTimeout(300); await abrirPerfilYa(pg);
  await pg.click('#tgp-peso-nuevo'); await pg.keyboard.type('81,5'); await pg.click('#tgp-add-peso button[type=submit]'); await pg.waitForTimeout(200);
  ok(JSON.stringify(await E(`TG_PERFIL.estado().medidas.filter(m => m.d === '${HOY}').map(m => m.kg)`)) === '[81.5]', '6 «81,5» guarda 81,5');
  await pg.click('#tgp-peso-nuevo'); await pg.keyboard.type('815'); await pg.click('#tgp-add-peso button[type=submit]'); await pg.waitForTimeout(200);
  ok(JSON.stringify(await E(`TG_PERFIL.estado().medidas.filter(m => m.d === '${HOY}').map(m => m.kg)`)) === '[81.5]', '7 «815» no se guarda', await pg.innerText('#tgp-peso-nuevo-h'));
  for (const [L, esp] of [['en', '1 place'], ['pl', '1 miejsce'], ['fr', '1 lieu'], ['bg', '1 място'], ['es', '1 lugar']]) {
    await E(`setLang('${L}')`); await pg.waitForTimeout(250);
    const t = (await pg.innerText('.tgp-stamp >> nth=0')).split('\n').pop();
    ok(t === esp, '8 plural ' + L, t);
  }
  await E(`setLang('pl')`); await pg.waitForTimeout(200);
  ok((await pg.innerText('#tgp-progress-txt')).includes('miejsc do osiągnięcia'), '8b plural pl 13', await pg.innerText('#tgp-progress-txt'));
  await E(`setLang('es')`); await pg.waitForTimeout(200);
  await pg.click('#tgp-evo-tabs button[data-tab="km"]'); await pg.waitForTimeout(120);
  for (const v of ['1,1', '9,9']) { await pg.fill('#tgp-km-nuevo', v); await pg.click('#tgp-add-km button[type=submit]'); await pg.waitForTimeout(120); }
  const antes = await E(`TG_PERFIL.estado().km.filter(k => k.d === '${HOY}').map(k => k.km)`);
  const filas = pg.locator('#tgp-km-log li'); let idx = -1;
  for (let i = 0; i < await filas.count(); i++) if ((await filas.nth(i).innerText()).includes('9,9')) { idx = i; break; }
  await filas.nth(idx).locator('.x').click(); await pg.waitForTimeout(120);
  const despues = await E(`TG_PERFIL.estado().km.filter(k => k.d === '${HOY}').map(k => k.km)`);
  ok(JSON.stringify(despues.sort()) === JSON.stringify(antes.filter(x => x !== 9.9).sort()), '9 borrar km borra el pulsado', { antes, despues });
  const rep = await E(`(() => { const c = {}; document.querySelectorAll('[id]').forEach(e => c[e.id] = (c[e.id] || 0) + 1); return Object.entries(c).filter(([k, v]) => v > 1); })()`);
  ok(!rep.length, '10 ningun id repetido en toda la pagina', rep);
  const ids = await E('TG_PERFIL.estado().km.map(k => k.id)');
  ok(ids.length > 0 && new Set(ids).size === ids.length && ids.every(i => typeof i === 'string' && i.length >= 16), '17 cada caminata con su id, distinto y largo (es su clave en la nube)', ids.slice(0, 3));
  const [descarga] = await Promise.all([pg.waitForEvent('download', { timeout: 8000 }), pg.click('#tgp-export')]);
  const exp = JSON.parse(fs.readFileSync(await descarga.path(), 'utf8'));
  ok(descarga.suggestedFilename() === 'tenerife-go-perfil.json' && exp.v === 1 && exp.perfil && Array.isArray(exp.pesos) && exp.caminatas.length && exp.caminatas.every(c => c.id && c.d && c.km),
    '18 la descarga es tenerife-go-perfil.json, con v:1 y el id de cada caminata', { nombre: descarga.suggestedFilename(), v: exp.v });
  await E(`setLang('en')`); await pg.waitForTimeout(150);
  const fechas = await E(`[...document.querySelectorAll('#perfil-panel input[type=date]')].map(e => e.getAttribute('aria-label'))`);
  ok(fechas.length === 2 && fechas.every(t => t === 'Date'), '11 en ingles, los campos de fecha no dicen «Fecha»', fechas);
  await E(`setLang('es')`); await pg.waitForTimeout(150);
  ok(await E(`getComputedStyle(document.getElementById('tgp-borrar-confirm')).display`) === 'none', '14 la confirmacion de borrar empieza cerrada (se ve de verdad, no solo el atributo)');
  await pg.click('#tgp-borrar-local'); await pg.waitForTimeout(100);
  ok(await E(`getComputedStyle(document.getElementById('tgp-borrar-local')).display`) === 'none', '16 el boton de borrar se esconde mientras se confirma');
  const visible = await E(`!document.getElementById('tgp-borrar-confirm').hidden`); await pg.click('#tgp-borrar-si'); await pg.waitForTimeout(200);
  ok(visible && await E('TG_PERFIL.estado().medidas.length === 0 && TG_PERFIL.estado().km.length === 0 && !TG_PERFIL.estado().nombre'), '12 borrar datos del perfil (con confirmacion)', await pg.innerText('#tgp-toast'));
  ok(await E(`getComputedStyle(document.getElementById('tgp-imc')).display`) === 'none', '15 sin datos, la caja del IMC no se ve');
  await pg.click('.tgp-set[data-set="tf"]'); await pg.waitForTimeout(150);
  const nota = await pg.innerText('#tgp-lock-note');
  /* los cinco, bloqueados; sus tres de oro no (tocarlos dice cuando se consiguen). Si hoy es
     la fiesta de uno de ellos, la nota es la suya, que corre mas prisa (1c lo prueba con fecha) */
  const tf19 = await E(`(() => { const h = new Date(), hoy = h.getFullYear() + '-' + String(h.getMonth() + 1).padStart(2, '0') + '-' + String(h.getDate()).padStart(2, '0');
    const cinco = [...document.querySelectorAll('#tgp-strip .tgp-av:not(.is-oro)')], oros = [...document.querySelectorAll('#tgp-strip .tgp-av.is-oro')];
    return { fiesta: TG_AVATARES.oros.some(a => a.set === 'tf' && TG_AVATARES.disponible(a.id, hoy)),
      cinco: cinco.length === 5 && cinco.every(b => b.disabled), oros: oros.length === 3 && oros.every(b => !b.disabled && (b.classList.contains('is-cerrado') || !!b.querySelector('.tgp-oro-hoy'))) }; })()`);
  const why19 = await E(`getComputedStyle(document.getElementById('tgp-lock-why')).display`) !== 'none';
  ok((tf19.fiesta ? nota.includes('¡es hoy!') : nota.includes('(3 de 10)') && why19) && tf19.cinco && tf19.oros,
    '19 el set Tenerife empieza cerrado: «(3 de 10)», la explicacion y los cinco bloqueados; sus tres de oro, no (con su fecha)', [nota, tf19]);
  await E(`(() => { const v = JSON.parse(localStorage.getItem('tenerife.visited')); localStorage.setItem('tenerife.visitas', JSON.stringify(v.slice(0, 10).map(id => ({ id, d: '${HOY}' })))); TG_PERFIL.repintar(); })()`);
  await pg.waitForTimeout(200); await pg.click('.tgp-set[data-set="tf"]'); await pg.waitForTimeout(150);
  const libre = await E(`[...document.querySelectorAll('#tgp-strip .tgp-av')].every(b => !b.disabled)`);
  await pg.click('#tgp-strip .tgp-av >> nth=0'); await pg.waitForTimeout(200);
  ok(libre && await E('TG_PERFIL.estado().avatar') === 'tf-teide' && await E(`getComputedStyle(document.getElementById('tgp-lock-why')).display`) === 'none', '20 con 10 visitas comprobadas se abre y se puede elegir', await E('TG_PERFIL.estado().avatar'));
  await E(`(() => { const v = JSON.parse(localStorage.getItem('tenerife.visited')); localStorage.setItem('tenerife.visitas', JSON.stringify(v.slice(0, 3).map(id => ({ id, d: '${HOY}' })))); TG_PERFIL.repintar(); })()`);
  await pg.waitForTimeout(150);
  const sw = () => pg.locator('#tgp-nube').getAttribute('aria-checked');
  ok(await pg.locator('#tgp-nube').count() === 1 && await sw() === 'false', '21 con sesion, el interruptor de la nube sale apagado');
  /* 24/10/2026: sin año de nacimiento no se puede dar el permiso (y con menos de 16, tampoco: n22) */
  const dis0 = await E(`document.getElementById('tgp-nube').disabled`), sub0 = await pg.innerText('#tgp-nube-box .sub');
  await pg.click('#tgp-nube', { force: true }); await pg.waitForTimeout(100);
  ok(dis0 && sub0.includes('año de nacimiento') && sub0.includes('16 años') && await E(`getComputedStyle(document.getElementById('tgp-nube-confirm')).display`) === 'none',
    '21b sin año de nacimiento el interruptor no se enciende y pide el año', [dis0, sub0]);
  await pg.fill('#tgp-nac', '1990'); await pg.click('#tgp-save'); await pg.waitForTimeout(200);
  await pg.click('#tgp-nube'); await pg.waitForTimeout(120);
  const vis = await E(`getComputedStyle(document.getElementById('tgp-nube-confirm')).display`);
  await pg.click('#tgp-nube-no'); await pg.waitForTimeout(120);
  ok(vis !== 'none' && await sw() === 'false' && await E('TG_PERFIL.estado().nube') === null, '22 encenderlo pide el permiso; «Cancelar» lo deja apagado', vis);
  await pg.click('#tgp-nube'); await pg.waitForTimeout(120); await pg.click('#tgp-nube-si');
  await pg.waitForFunction(() => !Object.keys(TG_PERFIL.estado().colas).length, null, { timeout: 9000 }); await pg.waitForTimeout(150);
  ok(await sw() === 'true' && await E(`TG_PERFIL.estado().nube.desde.slice(0, 10) === new Date().toISOString().slice(0, 10)`) && (await pg.innerText('#tgp-cuenta-status')).includes('su perfil y sus progresos') && await E(`TGP_DEMO_NUBE.tabla('perfiles').length`) === 1,
    '23 «Acepto»: encendido, con la fecha del permiso y el texto de la nube', await pg.innerText('#tgp-cuenta-status'));
  await pg.click('#tgp-borrar-local'); await pg.waitForTimeout(120);
  ok((await pg.innerText('#tgp-borrar-texto')).includes('y de su cuenta'), '24 con la nube, borrar el perfil avisa de que se borra tambien de la cuenta', await pg.innerText('#tgp-borrar-texto'));
  await pg.click('#tgp-borrar-no'); await pg.waitForTimeout(100);
  await pg.click('#tgp-nube'); await pg.waitForTimeout(120);
  const vis2 = await E(`getComputedStyle(document.getElementById('tgp-nube-quitar')).display`);
  await pg.click('#tgp-nube-quitar-si'); await pg.waitForTimeout(900);
  ok(vis2 !== 'none' && await sw() === 'false' && (await pg.innerText('#tgp-toast')).includes('Borrado de la nube'), '25 apagarlo pide confirmar y borra la copia de la nube', [vis2, await pg.innerText('#tgp-toast')]);
  await E('TGP_DEMO_NUBE.sesion(false)'); await pg.waitForTimeout(150);
  ok(await pg.locator('#tgp-nube').count() === 0 && await E(`getComputedStyle(document.getElementById('tgp-nube-box')).display`) === 'none', '26 sin sesion no hay interruptor');
  await E('TGP_DEMO_NUBE.sesion(true)'); await pg.waitForTimeout(150);
  await E('TGP_DEMO_NUBE.red(false)'); await pg.click('#tgp-nube'); await pg.waitForTimeout(100); await pg.click('#tgp-nube-si'); await pg.waitForTimeout(500);
  ok(await E('TG_PERFIL.estado().nube') !== null && (await pg.innerText('#tgp-toast')).includes('lo volverá a intentar') && await E('TG_PERFIL.estado().colas[TGP_DEMO_NUBE.uids[0]].alta') === true,
    '27 sin red, el permiso queda dado y avisa de que se reintentara', await pg.innerText('#tgp-toast'));
  await E('TGP_DEMO_NUBE.red(true)');
  ok(!errs.length, '13 sin errores', errs);
  await ctx.close();
}

/* ── 1b. el selector de los 47 sets (23 de octubre de 2026) ─────────────── */
async function selector(b) {
  console.log('\n=== 1b. el selector de los 47 sets: el pais del navegador y «Todos los paises» (regresiones.py, 28-36) ===');
  /* 28. Con la region de la etiqueta del navegador, su set; sin ella, la lengua cuando es de un
     solo pais (uk, cs, nb); y si no, el del idioma de la app. Uno por uno, en un movil nuevo. */
  const vistos = {}, malos28 = [];
  for (const [loc, esperado] of [['sv-SE', 'se'], ['de-AT', 'at'], ['nl-BE', 'be'], ['fr-CH', 'ch'], ['en-IE', 'ie'], ['pt-PT', 'pt'], ['el-CY', 'cy'],
    ['ro-MD', 'md'], ['ru-RU', 'ru'], ['en-GB', 'en'], ['zh-TW', 'zht'], ['uk', 'ua'], ['cs', 'cz'], ['nb', 'no'],
    ['ru', null], ['pt-BR', null], ['en-US', null], ['sr', null], ['el', null]]) {
    const ctx = await contexto(b, { locale: loc }), pg = await ctx.newPage(), errs = errores(pg);
    await abrirApp(pg, null);
    await abrirPerfilYa(pg);
    const r = await pg.evaluate(() => ({
      nav: navigator.languages.join(','), lang: currentLang, avatar: TG_PERFIL.estado().avatar,
      primero: (document.querySelector('#tgp-sets .tgp-set') || { dataset: {} }).dataset.set,
      heroe: (document.querySelector('#tgp-meta .tgp-chip.set .flag') || {}).textContent
    }));
    const esp = esperado || (r.lang && await pg.evaluate(l => !!TG_AVATARES.set(l), r.lang) ? r.lang : 'es');
    const bandera = await pg.evaluate(s => TG_AVATARES.set(s).bandera, esp);
    vistos[loc] = r.primero + (r.heroe === bandera ? '' : ' heroe ' + r.heroe);
    if (r.primero !== esp || r.heroe !== bandera || r.avatar || errs.length) malos28.push({ loc, esp, r, errs });
    await ctx.close();
  }
  ok(!malos28.length, '28 el set del navegador va primero, y su primer avatar en el heroe (sin region que lo diga, el del idioma de la app); no se guarda nada', malos28.length ? malos28 : vistos);

  const ctx = await contexto(b), pg = await ctx.newPage(), errs = errores(pg);
  await abrirApp(pg, 'es');
  await pg.evaluate(() => { localStorage.removeItem('tenerife.perfil'); localStorage.removeItem('tenerife.visitas'); });
  await abrirPerfilYa(pg);
  const E = f => pg.evaluate(f);
  /* 29 */
  await pg.click('#tgp-paises-btn'); await pg.waitForTimeout(200);
  const nombres = await E(`[...document.querySelectorAll('#tgp-paises-grid .tgp-pais')].map(b => [b.dataset.set, b.querySelector('.name').textContent])`);
  const orden = await E(`(l => { const c = new Intl.Collator(PRECIOS_GAS_LOCALE.es); const r = l.slice(1).map(x => x[1]); return r.every((x, i) => i === 0 || c.compare(r[i - 1], x) <= 0); })(${JSON.stringify(nombres)})`);
  ok(nombres.length === 47 && nombres[0][0] === 'tf' && orden && await E('TG_AVATARES.total') === 235 && await pg.getAttribute('#tgp-paises-btn', 'aria-expanded') === 'true',
    '29 «Todos los paises»: los 47, Tenerife primero y los demas por orden alfabetico del idioma', [nombres.length, nombres.slice(0, 3), orden]);
  /* 30 */
  const res = {};
  for (const q of ['belgica', 'BÉLG', 'switz', 'zzz']) {
    await pg.fill('#tgp-buscar', q); await pg.waitForTimeout(80);
    res[q] = [await E(`[...document.querySelectorAll('#tgp-paises-grid .tgp-pais')].map(b => b.dataset.set).join(',')`), await E(`getComputedStyle(document.getElementById('tgp-paises-nada')).display`)];
  }
  ok(res.belgica[0] === 'be' && res['BÉLG'][0] === 'be' && res.switz[0] === 'ch' && res.zzz[0] === '' && res.zzz[1] !== 'none' && res.belgica[1] === 'none',
    '30 el buscador no distingue tildes ni mayusculas, vale en ingles y dice si no hay ninguno', res);
  /* 31 */
  await pg.fill('#tgp-buscar', ''); await pg.waitForTimeout(80);
  await pg.click('#tgp-paises-grid .tgp-pais[data-set="pt"]'); await pg.waitForTimeout(300);
  const chips = await E(`[...document.querySelectorAll('#tgp-sets .tgp-set')].map(b => b.dataset.set + (b.getAttribute('aria-pressed') === 'true' ? '*' : ''))`);
  const tira = await E(`[...document.querySelectorAll('#tgp-strip .tgp-av')].map(b => b.dataset.id)`);
  ok(chips.includes('pt*') && tira.length === 6 && tira.every(x => x.startsWith('pt-')) && tira.filter(x => x.includes('-oro-')).length === 1 && !tira[4].includes('-oro-') && tira[5].includes('-oro-')
     && await E(`document.getElementById('tgp-paises').hidden`) && await pg.getAttribute('#tgp-paises-btn', 'aria-expanded') === 'false',
    '31 elegir un pais lo pone en las pestañas, abre su tira (sus cinco y, detras, su de oro) y cierra la lista', [chips, tira]);
  /* 32: elegido, y la app entera vuelve a abrirse */
  await pg.click('#tgp-strip .tgp-av >> nth=2'); await pg.waitForTimeout(300);
  await abrirApp(pg, 'es');
  await pg.waitForFunction(() => document.querySelector('#auth-btn .tg-avatar-cuenta'), null, { timeout: 15000 }).catch(() => {});
  const boton = await E(`(document.querySelector('#auth-btn .tg-avatar-cuenta') || { dataset: {} }).dataset.id`);
  await abrirPerfilYa(pg);
  ok(await E('TG_PERFIL.estado().avatar') === 'pt-tranvia' && (await pg.innerText('#tgp-meta')).includes('Tranvía de Lisboa') && boton === 'pt-tranvia'
    && (await E(`[...document.querySelectorAll('#tgp-sets .tgp-set')].map(b => b.dataset.set)`)).filter(x => x === 'pt').length === 1,
    '32 un avatar de Europa se guarda y vuelve al abrir la app: en el boton de la cuenta, en el heroe y en las pestañas', [await E('TG_PERFIL.estado().avatar'), boton, await pg.innerText('#tgp-meta')]);
  /* 33: Escape en el buscador y en un pais de la lista cierra la lista, no el perfil; fuera de ella, el perfil */
  await pg.click('#tgp-paises-btn'); await pg.waitForTimeout(150); await pg.focus('#tgp-buscar'); await pg.keyboard.press('Escape'); await pg.waitForTimeout(150);
  const a33 = [await E(`document.getElementById('tgp-paises').hidden`), await E('document.activeElement.id'), await E(`!document.getElementById('perfil-panel').hidden`)];
  await pg.click('#tgp-paises-btn'); await pg.waitForTimeout(150); await pg.focus('#tgp-paises-grid .tgp-pais[data-set="ie"]'); await pg.keyboard.press('Escape'); await pg.waitForTimeout(150);
  const b33 = [await E(`document.getElementById('tgp-paises').hidden`), await E('document.activeElement.id'), await E(`!document.getElementById('perfil-panel').hidden`)];
  ok(a33.join() === 'true,tgp-paises-btn,true' && b33.join() === 'true,tgp-paises-btn,true', '33 Escape cierra la lista y no el perfil (desde el buscador y desde un pais), y el foco vuelve al boton', { buscador: a33, pais: b33 });
  await pg.keyboard.press('Escape'); await pg.waitForTimeout(250);
  ok(await E(`document.getElementById('perfil-panel').hidden`), '33b con la lista cerrada, Escape cierra el perfil como siempre');
  await abrirPerfilYa(pg);
  /* 34 */
  await pg.click('#tgp-paises-btn'); await pg.waitForTimeout(150); await E(`setLang('de')`); await pg.waitForTimeout(300);
  const de = await E(`[...document.querySelectorAll('#tgp-paises-grid .tgp-pais .name')].map(n => n.textContent)`);
  const deUi = [await pg.innerText('#tgp-paises-btn'), await pg.getAttribute('#tgp-buscar', 'placeholder')];
  ok(!await E(`document.getElementById('tgp-paises').hidden`) && de.includes('Schweiz') && de.includes('Österreich') && !de.includes('Suiza') && /Alle Länder/.test(deUi[0]) && deUi[1] === 'Land suchen',
    '34 con la lista abierta, cambiar de idioma la repinta (los paises, el boton y el buscador)', [de.slice(0, 5), deUi]);
  /* 35 */
  await E(`setLang('es')`); await pg.waitForTimeout(200); await pg.click('#tgp-paises-btn'); await pg.waitForTimeout(100);
  const sets = new Set();
  for (let i = 0; i < 30; i++) { await pg.click('#tgp-random'); await pg.waitForTimeout(30); sets.add(await E('TG_AVATARES.porId(TG_PERFIL.estado().avatar).set')); }
  const LENG10 = ['es', 'en', 'de', 'fr', 'it', 'nl', 'pl', 'bg', 'zh', 'zht'];
  ok(!sets.has('tf') && [...sets].some(s => !LENG10.includes(s)), '35 «Sorpréndeme» elige tambien entre los de Europa, nunca del set cerrado', [...sets].sort());
  ok(!errs.length, '35b sin errores', errs);
  await ctx.close();

  /* 36 y los cortes de los nombres (cortes_nombres.py), a 360 px y en los diez idiomas */
  const fuera36 = {}, cortes = {};
  const c2 = await contexto(b, { viewport: { width: 360, height: 800 } }), p2 = await c2.newPage(), e2 = errores(p2);
  await abrirApp(p2, 'es');
  await abrirPerfilYa(p2);
  const MIDE = sel => p2.evaluate(sel => {
    const cv = document.createElement('canvas').getContext('2d'), out = [];
    document.querySelectorAll(sel).forEach(e => {
      const cs = getComputedStyle(e); cv.font = cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
      const ancho = e.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      e.textContent.trim().split(/\s+/).flatMap(w => w.split(/(?<=-)/)).forEach(w => {
        const m = /[　-鿿]/.test(w) ? 0 : cv.measureText(w).width;
        if (m > ancho + 0.5) out.push(w + ' ' + m.toFixed(0) + '>' + ancho.toFixed(0));
      });
      if (e.classList.contains('name') && e.closest('.tgp-av')) {
        const r = document.createRange(); r.selectNodeContents(e);
        const filas = new Set([...r.getClientRects()].map(x => Math.round(x.top)));
        if (filas.size > 2) out.push(filas.size + ' lineas: ' + e.textContent);
      }
    });
    return out;
  }, sel);
  /* la fecha de los de oro («17 mar», «14–17 feb», ✓): en una linea, dentro de su boton */
  const FECHAS = () => p2.evaluate(() => [...document.querySelectorAll('#tgp-strip .tgp-av .tgp-oro-fecha')]
    .filter(e => e.scrollWidth > e.closest('.tgp-av').clientWidth + 0.5).map(e => 'fecha: ' + e.textContent + ' ' + e.scrollWidth + '>' + e.closest('.tgp-av').clientWidth));
  const ids = await p2.evaluate(() => TG_AVATARES.sets.map(s => s.id));
  for (const L of LENG) {
    await p2.evaluate(l => setLang(l), L); await p2.waitForTimeout(300);
    await p2.click('#tgp-paises-btn'); await p2.waitForTimeout(200);
    const m = await p2.evaluate(() => {
      const r = [];
      if (document.documentElement.scrollWidth > innerWidth) r.push('pagina ' + document.documentElement.scrollWidth);
      document.querySelectorAll('#tgp-paises-grid .tgp-pais .name, #tgp-sets .tgp-set, #tgp-paises-btn').forEach(n => { if (n.scrollWidth > n.clientWidth + 1) r.push(n.textContent); });
      const g = document.getElementById('tgp-paises-grid').getBoundingClientRect(), k = document.getElementById('tgp-avatares').getBoundingClientRect();
      if (g.right > k.right + 0.5) r.push('lista fuera de la tarjeta');
      return r;
    });
    if (m.length) fuera36[L] = m;
    const malos = (await MIDE('#tgp-paises-grid .tgp-pais .name')).map(x => 'lista: ' + x);
    await p2.click('#tgp-paises-btn'); await p2.waitForTimeout(80);
    for (const s of ids) {
      await p2.click('#tgp-paises-btn'); await p2.waitForTimeout(60);
      await p2.click('#tgp-paises-grid .tgp-pais[data-set="' + s + '"]'); await p2.waitForTimeout(60);
      (await MIDE('#tgp-strip .tgp-av .name')).forEach(x => malos.push(s + ': ' + x));
      (await FECHAS()).forEach(x => malos.push(s + ': ' + x));
    }
    await p2.click('.tgp-set[data-set="oro"]'); await p2.waitForTimeout(120);
    (await MIDE('#tgp-strip .tgp-av .name')).concat(await FECHAS()).forEach(x => malos.push('oro: ' + x));
    if (malos.length) cortes[L] = malos;
  }
  ok(!Object.keys(fuera36).length && !e2.length, '36 a 360 px, en los diez idiomas, nada se sale (la lista, las pestañas y el boton)', [fuera36, e2]);
  ok(!Object.keys(cortes).length, '36b los 284 nombres de avatar (235 y 49 de oro) y los 47 de set, en los diez idiomas a 360 px: ninguna palabra mas ancha que su caja, en la tira dos lineas como mucho, y la fecha de los de oro en su boton, tambien en «De oro»', cortes);
  await c2.close();
}

/* ── 1c. los de oro y el movimiento al tocarlos (regresiones.py, 37-46) ── */
/* La fecha de hoy: la app la lee del movil (hoy()), y aqui se cambia con el reloj del
   navegador, a mediodia en UTC, que en la isla es el mismo dia. Despues, TG_PERFIL.repintar(),
   como al volver a abrir el perfil. */
async function fechaOro(pg, d) {
  await pg.clock.setFixedTime(new Date(d + 'T12:00:00Z'));
  await pg.evaluate(() => TG_PERFIL.repintar()); await pg.waitForTimeout(150);
}
/* un set, por su pestaña o, si no esta entre ellas, por «Todos los paises» */
async function abrirSet(pg, s) {
  if (await pg.locator('#tgp-sets .tgp-set[data-set="' + s + '"]').count()) await pg.click('#tgp-sets .tgp-set[data-set="' + s + '"]');
  else { await pg.click('#tgp-paises-btn'); await pg.waitForTimeout(120); await pg.click('#tgp-paises-grid .tgp-pais[data-set="' + s + '"]'); }
  await pg.waitForTimeout(150);
}
async function oro(b) {
  console.log('\n=== 1c. los de oro y el movimiento al tocarlos (regresiones.py, 37-46) ===');
  const ctx = await contexto(b, { timezoneId: 'Atlantic/Canary' }), pg = await ctx.newPage(), errs = errores(pg);
  await abrirApp(pg, 'es');
  /* 12 lugares marcados y 3 comprobados: el set Tenerife, cerrado */
  await pg.evaluate(hoy => {
    const ids = places.slice(0, 12).map(p => p.id);
    localStorage.setItem('tenerife.visited', JSON.stringify(ids));
    localStorage.setItem('tenerife.visitas', JSON.stringify(ids.slice(0, 3).map(id => ({ id, d: hoy }))));
    localStorage.removeItem('tenerife.perfil');
  }, HOY);
  await abrirPerfilYa(pg);
  const E = f => pg.evaluate(f);
  /* las fechas de la prueba, del catalogo: un dia sin ninguna fiesta, el primero con una sola
     de fuera de Tenerife, y el primero de una de Tenerife (desde el 1 de enero de 2027) */
  const plan = await E(`(() => { const A = TG_AVATARES; let d = new Date(Date.UTC(2027, 0, 1)), libre = null, fiesta = null, id = null, tf = null, tfId = null;
    for (let i = 0; i < 800; i++, d.setUTCDate(d.getUTCDate() + 1)) {
      const s = d.toISOString().slice(0, 10), hoy = A.oros.filter(a => A.disponible(a.id, s));
      if (!hoy.length && !libre) libre = s;
      const uno = hoy.filter(a => a.set !== 'tf' && !A.oros.some(c => c !== a && A.disponible(c.id, s)));
      if (uno.length && !fiesta) { fiesta = s; id = uno[0].id; }
      const t = hoy.filter(a => a.set === 'tf'); if (t.length && !tf) { tf = s; tfId = t[0].id; }
    }
    return { libre, fiesta, id, tf, tfId, n: A.oros.length }; })()`);
  const bt = '#tgp-strip .tgp-av[data-id="' + plan.id + '"]';
  /* 37 */
  await fechaOro(pg, plan.libre); await abrirSet(pg, plan.id.split('-')[0]);
  const cerrado = await E(`(b => !!b && b.classList.contains('is-cerrado') && !!b.querySelector('.tgp-oro-candado') && !!b.querySelector('.tgp-oro-fecha') && !b.disabled)(document.querySelector('${bt}'))`);
  const aria = await pg.getAttribute(bt, 'aria-label'), antes = await E('TG_PERFIL.estado().avatar');
  await pg.click(bt); await pg.waitForTimeout(150);
  const t37 = await pg.innerText('#tgp-toast'), no = await E(`document.querySelector('${bt}').classList.contains('tga-no')`);
  ok(cerrado && aria.includes('avatar de oro') && t37.includes('solo se consigue') && await E('TG_PERFIL.estado().avatar') === antes && no && !(await E('Object.keys(TG_PERFIL.estado().oro)')).includes(plan.id),
    '37 fuera de su dia, el de oro sale con candado y su fecha; tocarlo dice cuando y no lo elige', [plan, cerrado, aria, t37, no]);
  /* 38 */
  await fechaOro(pg, plan.fiesta); await abrirSet(pg, plan.id.split('-')[0]);
  const hoyChip = await E(`document.querySelector('#tgp-sets .tgp-set[data-set="oro"]').classList.contains('is-hoy')`);
  const insignia = await E(`!!document.querySelector('${bt} .tgp-oro-hoy')`), nota38 = await pg.innerText('#tgp-lock-note');
  await pg.click(bt); await pg.waitForTimeout(250);
  const e38 = await E('JSON.parse(JSON.stringify(TG_PERFIL.estado()))'), juega = await E(`document.getElementById('tgp-ava-big').classList.contains('tga-play')`);
  ok(hoyChip && insignia && nota38.includes('¡es hoy!') && e38.oro[plan.id] === plan.fiesta && e38.avatar === plan.id && (await pg.innerText('#tgp-toast')).includes('para siempre') && juega,
    '38 el dia de su fiesta: punto en «De oro», «Hoy», la nota lo dice, y tocarlo lo coge (con la fecha) y lo mueve', [hoyChip, insignia, nota38, e38.oro, juega]);
  /* 39 */
  await fechaOro(pg, plan.libre > plan.fiesta ? plan.libre : '2030-01-02'); await abrirSet(pg, plan.id.split('-')[0]);
  await pg.click('#tgp-strip .tgp-av:not(.is-oro) >> nth=0'); await pg.waitForTimeout(200);
  const mio = await E(`(b => !b.classList.contains('is-cerrado') && !!b.querySelector('.tgp-oro-fecha') && b.querySelector('.tgp-oro-fecha').textContent.indexOf('✓') >= 0)(document.querySelector('${bt}'))`);
  await pg.click(bt); await pg.waitForTimeout(200);
  ok(mio && await E('TG_PERFIL.estado().avatar') === plan.id, '39 pasada la fiesta sigue siendo suyo: sin candado, con ✓, y se vuelve a elegir', mio);
  /* 40 */
  await abrirApp(pg, 'es'); await abrirPerfilYa(pg); await fechaOro(pg, '2030-01-02');
  ok(await E('TG_PERFIL.estado().avatar') === plan.id && (await E('Object.keys(TG_PERFIL.estado().oro)')).includes(plan.id) && (await pg.innerText('#tgp-meta')).includes('🏅'),
    '40 al volver a abrir la app, el de oro sigue elegido y sigue siendo suyo (y el heroe lleva la medalla)', await pg.innerText('#tgp-meta'));
  /* 41 */
  await pg.click('#tgp-sets .tgp-set[data-set="oro"]'); await pg.waitForTimeout(250);
  const tira = await E(`[...document.querySelectorAll('#tgp-strip .tgp-av')].map(b => [b.dataset.id, (b.querySelector('.tgp-oro-fecha') || {}).textContent || '', (b.querySelector('.tgp-oro-bandera') || {}).textContent || ''])`);
  const banderas = await E('Object.fromEntries(TG_AVATARES.oros.map(a => [a.id, TG_AVATARES.set(a.set).bandera]))'), nota41 = await pg.innerText('#tgp-lock-note');
  ok(tira.length === plan.n && tira.every(([i, , fl]) => i.includes('-oro-') && fl === banderas[i]) && tira[tira.length - 1][0] === plan.id && tira[tira.length - 1][1].includes('✓') && nota41.includes('1 de ' + plan.n),
    '41 «De oro»: los 49, cada uno con la bandera de su set, los suyos al final, y la cuenta', [tira.length, tira.slice(0, 3), tira[tira.length - 1], nota41]);
  /* 42 */
  const vistos = new Set();
  for (let i = 0; i < 60; i++) { await pg.click('#tgp-random'); await pg.waitForTimeout(20); vistos.add(await E('TG_PERFIL.estado().avatar')); }
  ok(![...vistos].some(v => v.includes('-oro-')), '42 «Sorpréndeme» nunca da uno de oro', [...vistos].sort().slice(0, 8));
  /* 43 */
  await fechaOro(pg, plan.tf); await abrirSet(pg, 'tf');
  const b5 = await E(`[...document.querySelectorAll('#tgp-strip .tgp-av:not(.is-oro)')].every(b => b.disabled)`);
  await pg.click('#tgp-strip .tgp-av[data-id="' + plan.tfId + '"]'); await pg.waitForTimeout(250);
  ok(b5 && await E('TG_PERFIL.estado().avatar') === plan.tfId, '43 Tenerife cerrado (3 visitas): sus cinco bloqueados, pero su de oro se coge en su fiesta', [b5, await E('TG_PERFIL.estado().avatar')]);
  /* 44 */
  const largas = await E(`(() => { const A = TG_AVATARES, r = [];
    A.oros.filter(a => (a.oro.dias || 1) > 1).forEach(a => { const v = A.ventana(a.id, 2027), d = new Date(v.desde + 'T00:00:00Z'), dias = [];
      for (let i = -1; i <= a.oro.dias; i++) { const x = new Date(d); x.setUTCDate(d.getUTCDate() + i); dias.push(A.disponible(a.id, x.toISOString().slice(0, 10))); }
      r.push([a.id, dias]); });
    return r; })()`);
  ok(largas.length >= 5 && largas.every(([, d]) => d[0] === false && d[d.length - 1] === false && d.slice(1, -1).every(Boolean)),
    '44 las fiestas de varios dias: se puede todos sus dias, ni el de antes ni el de despues', largas);
  /* 45 */
  const [descarga] = await Promise.all([pg.waitForEvent('download', { timeout: 8000 }), pg.click('#tgp-export')]);
  const exp = JSON.parse(fs.readFileSync(await descarga.path(), 'utf8'));
  ok((exp.avatares_oro || {})[plan.id] === plan.fiesta && plan.tfId in (exp.avatares_oro || {}), '45 la descarga lleva los de oro conseguidos, con su fecha', exp.avatares_oro);
  ok(!errs.length, '45b sin errores', errs);
  await ctx.close();
  /* 46: tocar mueve; con «reducir movimiento», nada */
  const c2 = await contexto(b, { reducedMotion: 'reduce' }), p2 = await c2.newPage(), e2 = errores(p2);
  await abrirApp(p2, 'es'); await p2.evaluate(() => localStorage.removeItem('tenerife.perfil')); await abrirPerfilYa(p2);
  await p2.click('#tgp-strip .tgp-av >> nth=1'); await p2.waitForTimeout(100); await p2.click('#tgp-strip .tgp-av >> nth=1'); await p2.waitForTimeout(100);
  await p2.click('#tgp-ava-big', { force: true }); await p2.waitForTimeout(50);
  const sin = await p2.evaluate(() => !document.querySelector('.tga-play'));
  await c2.close();
  const c3 = await contexto(b), p3 = await c3.newPage(), e3 = errores(p3);
  await abrirApp(p3, 'es'); await p3.evaluate(() => localStorage.removeItem('tenerife.perfil')); await abrirPerfilYa(p3);
  await p3.click('#tgp-strip .tgp-av >> nth=1'); await p3.waitForTimeout(100);
  const b1 = await p3.evaluate(() => !!document.querySelector('#tgp-strip .tgp-av.is-on.tga-play') && document.getElementById('tgp-ava-big').classList.contains('tga-play'));
  await p3.waitForTimeout(1600); const fin = await p3.evaluate(() => !document.querySelector('.tga-play'));
  await p3.click('#tgp-ava-big', { force: true }); await p3.waitForTimeout(50);
  const b2 = await p3.evaluate(() => document.getElementById('tgp-ava-big').classList.contains('tga-play'));
  const anim = await p3.evaluate(() => { const m = document.querySelector('#tgp-ava-big .tga-m'); return m ? getComputedStyle(m).animationName : ''; });
  await c3.close();
  ok(b1 && fin && b2 && anim && anim !== 'none' && sin && !e2.length && !e3.length, '46 tocar un avatar lo mueve un segundo (el elegido y el del heroe), y nada con «reducir movimiento»', [b1, fin, b2, anim, sin, e2, e3]);
}

/* ── 2. la nube con permiso ───────────────────────────────────────────── */
async function nube(b) {
  console.log('\n=== 2. la nube con permiso (nube.py), contra una nube que se porta como perfil.sql ===');
  const ctx = await contexto(b), pg = await ctx.newPage(), errs = errores(pg);
  const datos = ejemplo();
  await ctx.addInitScript(d => { try { if (!sessionStorage.getItem('perfil-sembrado')) { localStorage.setItem('tenerife.perfil', d); sessionStorage.setItem('perfil-sembrado', '1'); } } catch (e) {} }, JSON.stringify(datos));
  await abrirApp(pg, 'es');
  await conNube(pg); await pg.evaluate(() => TGP_DEMO_NUBE.reiniciar());
  await abrirPerfilYa(pg); await pg.evaluate(() => TG_PERFIL.esperar());
  const E = f => pg.evaluate(f);
  const [U1, U2] = await E('TGP_DEMO_NUBE.uids');
  const st = () => E('JSON.parse(JSON.stringify(TG_PERFIL.estado()))');
  const nubeDe = async (t, uid) => (await E(`TGP_DEMO_NUBE.tabla('${t}')`)).filter(f => f.user_id === (uid || U1));
  const colaVacia = (ms) => pg.waitForFunction(() => !Object.keys(TG_PERFIL.estado().colas).length, null, { timeout: ms || 9000 });
  const toast = () => pg.innerText('#tgp-toast');
  const sw = () => pg.locator('#tgp-nube').getAttribute('aria-checked');
  const s0 = await st();
  ok(await sw() === 'false' && s0.nube === null && !(await E(`TGP_DEMO_NUBE.tabla('perfiles')`)).length, 'n1 de entrada: con sesion, apagada y nada en la nube');
  await pg.click('#tgp-nube'); await pg.waitForTimeout(100);
  const texto = await pg.innerText('#tgp-nube-confirm p');
  ok(['peso objetivo', 'fecha de alta', 'con la fecha de cada uno', 'al tocar «Acepto»', 'copia guardada en su cuenta'].every(x => texto.includes(x)), 'n2 el permiso nombra todo lo que sube y el boton tal cual', texto);
  await pg.click('#tgp-nube-si'); await colaVacia(); await pg.waitForTimeout(200);
  const s1 = await st(), fp = await nubeDe('perfiles'), fw = await nubeDe('pesos'), fk = await nubeDe('caminatas');
  const orden = a => JSON.stringify(a.slice().sort());
  ok(await sw() === 'true' && s1.nube.uid === U1 && s1.nube.ok === true && fp.length === 1 && mismoInstante(fp[0].consentido_en, s1.nube.desde)
     && fp[0].nombre === 'Alex' && fp[0].nacimiento === 1990 && fp[0].altura_cm === 178 && fp[0].objetivo_kg === 78 && fp[0].creado === s1.creado
     && orden(fw.map(f => f.fecha + ' ' + f.kg)) === orden(s1.medidas.map(m => m.d + ' ' + m.kg))
     && orden(fk.map(f => f.id + ' ' + f.fecha + ' ' + f.km)) === orden(s1.km.map(k => k.id + ' ' + k.d + ' ' + k.km))
     && (await toast()).includes('Guardado en su cuenta'),
     'n3 «Acepto»: encendida, fila de perfiles con la fecha del permiso y todo subido', { fila: fp, pesos: fw.length, caminatas: fk.length, toast: await toast() });
  const COLS = ['user_id', 'consentido_en', 'nombre', 'avatar', 'unidades', 'altura_cm', 'nacimiento', 'objetivo_kg', 'creado', 'updated_at'];
  ok(fp.every(f => Object.keys(f).every(k => COLS.includes(k))) && fw.every(f => Object.keys(f).sort().join() === 'fecha,kg,user_id') && fk.every(f => Object.keys(f).sort().join() === 'fecha,id,km,user_id'),
    'n4 en la nube solo las columnas de perfil.sql (las visitas no suben)', Object.keys(fp[0] || {}));
  await pg.fill('#tgp-peso-nuevo', '80,2'); await pg.click('#tgp-add-peso button[type=submit]'); await colaVacia();
  ok(JSON.stringify((await nubeDe('pesos')).filter(f => f.fecha === HOY).map(f => f.kg)) === '[80.2]', 'n5 un peso nuevo sube solo');
  await pg.click('#tgp-evo-tabs button[data-tab="km"]'); await pg.waitForTimeout(100);
  const borrado = await pg.locator('#tgp-km-log li .x').first().getAttribute('data-id');
  await pg.locator('#tgp-km-log li .x').first().click(); await colaVacia();
  ok(borrado && (await nubeDe('caminatas')).every(f => f.id !== borrado) && (await nubeDe('caminatas')).length === (await st()).km.length, 'n6 un km borrado se borra en la nube', borrado);
  const tAntes = (await nubeDe('perfiles'))[0].updated_at;
  await pg.click('#tgp-name-edit'); await pg.fill('.tgp-name-input', 'Alexandra'); await pg.keyboard.press('Enter'); await colaVacia();
  ok((await nubeDe('perfiles'))[0].nombre === 'Alexandra' && (await nubeDe('perfiles'))[0].updated_at !== tAntes, 'n7 el nombre cambiado sube (update, con updated_at nuevo)');
  await E('TGP_DEMO_NUBE.red(false)');
  await pg.click('#tgp-evo-tabs button[data-tab="peso"]'); await pg.fill('#tgp-peso-fecha', dia(1)); await pg.fill('#tgp-peso-nuevo', '79,9'); await pg.click('#tgp-add-peso button[type=submit]');
  await pg.waitForTimeout(2600);
  let c = ((await st()).colas || {})[U1] || {};
  ok(c.pesos && dia(1) in c.pesos && JSON.stringify((await nubeDe('pesos')).filter(f => f.fecha === dia(1)).map(f => f.kg)) !== '[79.9]', 'n8 sin red: no llega a la nube y espera en la cola', c);
  await E('TGP_DEMO_NUBE.red(true)'); await colaVacia();
  ok(JSON.stringify((await nubeDe('pesos')).filter(f => f.fecha === dia(1)).map(f => f.kg)) === '[79.9]' && !Object.keys((await st()).colas).length, 'n9 vuelve la red: sube y la cola se vacia');
  /* otro movil cambia la nube */
  const w = await nubeDe('pesos'), fpp = await nubeDe('perfiles'); let k = await nubeDe('caminatas');
  w.push({ user_id: U1, fecha: dia(3), kg: 77.7 }); const quitado = k[0].id; k = k.slice(1);
  fpp[0].nombre = 'Sasha'; fpp[0].updated_at = new Date().toISOString();
  const otrosPesos = (await E(`TGP_DEMO_NUBE.tabla('pesos')`)).filter(f => f.user_id !== U1);
  await pg.evaluate(([w, k, f]) => { TGP_DEMO_NUBE.poner('pesos', w); TGP_DEMO_NUBE.poner('caminatas', k); TGP_DEMO_NUBE.poner('perfiles', f); }, [w.concat(otrosPesos), k, fpp]);
  let r = await E('TG_PERFIL.sincronizar()'); await pg.waitForTimeout(150);
  const s4 = await st();
  ok(r === 'ok' && s4.medidas.some(m => m.d === dia(3) && m.kg === 77.7) && s4.km.every(x => x.id !== quitado) && s4.nombre === 'Sasha' && await pg.innerText('#tgp-name') === 'Sasha',
    'n10 llega lo de otro movil: un peso nuevo, un km borrado y el nombre (y se repinta)', { r, nombre: s4.nombre });
  await E(`(() => { TGP_DEMO_NUBE.poner('perfiles', []); TGP_DEMO_NUBE.poner('pesos', []); TGP_DEMO_NUBE.poner('caminatas', []); })()`);
  const nLocal = (await st()).medidas.length;
  r = await E('TG_PERFIL.sincronizar()'); await pg.waitForTimeout(150);
  ok(r === 'retirado' && (await st()).nube === null && await sw() === 'false' && (await st()).medidas.length === nLocal, 'n11 retirado en otro movil: se apaga aqui, lo local se queda', { r });
  await pg.fill('#tgp-peso-nuevo', '78,8'); await pg.click('#tgp-add-peso button[type=submit]'); await pg.waitForTimeout(2600);
  ok(!(await E(`TGP_DEMO_NUBE.tabla('perfiles')`)).length && !(await E(`TGP_DEMO_NUBE.tabla('pesos')`)).length && !Object.keys((await st()).colas).length, 'n12 despues, un cambio aqui no sube nada (sin permiso no hay fila)');
  await pg.click('#tgp-nube'); await pg.click('#tgp-nube-si'); await colaVacia();
  ok((await nubeDe('perfiles')).length === 1 && (await nubeDe('pesos')).length === (await st()).medidas.length, 'n13 encender otra vez lo vuelve a subir todo');
  await pg.click('#tgp-nube'); await pg.waitForTimeout(100);
  const vis = await E(`getComputedStyle(document.getElementById('tgp-nube-quitar')).display`);
  await pg.click('#tgp-nube-quitar-si'); await pg.waitForTimeout(900);
  ok(vis !== 'none' && !(await nubeDe('perfiles')).length && !(await nubeDe('pesos')).length && !(await nubeDe('caminatas')).length && (await st()).nube === null && (await st()).medidas.length > 0 && (await toast()).includes('Borrado de la nube'),
    'n14 retirar: confirma, borra la fila (cascade) y aqui sigue todo', await toast());
  await pg.click('#tgp-nube'); await pg.click('#tgp-nube-si'); await colaVacia();
  await E('TGP_DEMO_NUBE.red(false)');
  await pg.click('#tgp-nube'); await pg.click('#tgp-nube-quitar-si'); await pg.waitForTimeout(900);
  c = ((await st()).colas || {})[U1] || {};
  ok((await st()).nube === null && c.baja === true && (await nubeDe('perfiles')).length === 1 && (await toast()).includes('en cuanto haya conexión'), 'n15 sin red: apagada ya aqui, el borrado pendiente y lo dice', { toast: await toast(), cola: c });
  await E('TGP_DEMO_NUBE.red(true)'); await colaVacia();
  ok(!(await nubeDe('perfiles')).length && !(await nubeDe('pesos')).length && !Object.keys((await st()).colas).length, 'n16 vuelve la red: la copia de la nube se borra');
  await pg.click('#tgp-nube'); await pg.click('#tgp-nube-si'); await colaVacia();
  await pg.click('#tgp-borrar-local'); const aviso = await pg.innerText('#tgp-borrar-texto'); await pg.click('#tgp-borrar-si'); await pg.waitForTimeout(900);
  ok(aviso.includes('y de su cuenta') && !(await nubeDe('perfiles')).length && !(await nubeDe('pesos')).length && !(await st()).medidas.length && (await st()).nube === null && await sw() === 'false' && (await toast()).includes('y de su cuenta'),
    'n17 borrar el perfil con la nube: de aqui y de la cuenta', { aviso, toast: await toast() });
  /* otra cuenta en el mismo movil (antes, el año de nacimiento, que se fue con el perfil) */
  await pg.fill('#tgp-nac', '1990'); await pg.click('#tgp-save'); await pg.waitForTimeout(150);
  await pg.fill('#tgp-peso-nuevo', '70'); await pg.click('#tgp-add-peso button[type=submit]'); await pg.waitForTimeout(150);
  await pg.click('#tgp-nube'); await pg.click('#tgp-nube-si'); await colaVacia();
  await E('TGP_DEMO_NUBE.cuenta(1)'); await pg.waitForTimeout(700);
  ok(await sw() === 'false' && (await pg.innerText('#tgp-cuenta-who')).includes('otra@example.com'), 'n18 entra otra cuenta: su interruptor sale apagado', await pg.innerText('#tgp-cuenta-who'));
  await pg.fill('#tgp-peso-fecha', dia(2)); await pg.fill('#tgp-peso-nuevo', '71'); await pg.click('#tgp-add-peso button[type=submit]'); await pg.waitForTimeout(2600);
  ok(!(await nubeDe('perfiles', U2)).length && !(await nubeDe('pesos', U2)).length && (await nubeDe('pesos', U1)).every(f => f.fecha !== dia(2)) && (await st()).nube.ok === false, 'n19 un cambio con la otra cuenta no sube a ninguna');
  await E('TGP_DEMO_NUBE.cuenta(0)'); await E('TG_PERFIL.sincronizar()'); await colaVacia();
  ok(JSON.stringify((await nubeDe('pesos')).filter(f => f.fecha === dia(2)).map(f => f.kg)) === '[71]' && (await st()).nube.ok === true, 'n20 vuelve la cuenta del permiso: se juntan los dos lados (lo de este movil sube a la suya)');
  /* primera vez en un movil con datos en la nube */
  await E('TGP_DEMO_NUBE.sesion(false)'); await pg.waitForTimeout(300);
  const ayer = new Date(Date.now() - 86400000).toISOString();
  await pg.evaluate(([U1, ayer, d40, d4, d5, d6]) => {
    TGP_DEMO_NUBE.poner('perfiles', [{ user_id: U1, consentido_en: ayer, nombre: 'Desde la nube', avatar: 'fr-torre', unidades: 'metric', altura_cm: 170, nacimiento: 1985, objetivo_kg: null, creado: d40, updated_at: ayer }]);
    TGP_DEMO_NUBE.poner('pesos', [{ user_id: U1, fecha: d4, kg: 75.0 }, { user_id: U1, fecha: d5, kg: 99.9 }, { user_id: U1, fecha: d6, kg: 76.0 }]);
    TGP_DEMO_NUBE.poner('caminatas', [{ user_id: U1, id: 'nube-caminata-0001', fecha: d5, km: 3.3 }]);
  }, [U1, ayer, dia(40), dia(4), dia(5), dia(6)]);
  /* un movil «nuevo», con los datos de ejemplo y sin sesion */
  await pg.evaluate(d => localStorage.setItem('tenerife.perfil', d), JSON.stringify(ejemplo()));
  await abrirApp(pg, 'es'); await conNube(pg); await abrirPerfilYa(pg);
  await pg.click('#tgp-name-edit'); await pg.fill('.tgp-name-input', 'Del móvil'); await pg.keyboard.press('Enter'); await pg.waitForTimeout(100);
  const localAntes = await st(), kg5 = localAntes.medidas.filter(m => m.d === dia(5)).map(m => m.kg);
  await pg.click('#tgp-entrar');   /* «Crear cuenta o entrar»: aqui la nube de mentira entra directo */
  await E('TG_PERFIL.sincronizar()'); await colaVacia();
  const s10 = await st(), w10 = await nubeDe('pesos');
  ok(await sw() === 'true' && s10.nube.uid === U1 && mismoInstante(s10.nube.desde, ayer)
     && s10.nombre === 'Del móvil' && (await nubeDe('perfiles'))[0].nombre === 'Del móvil'
     && s10.altura_cm === localAntes.altura_cm && s10.creado === dia(40)
     && s10.medidas.some(m => m.d === dia(4) && m.kg === 75) && s10.medidas.some(m => m.d === dia(6) && m.kg === 76)
     && kg5.length === 1 && JSON.stringify(s10.medidas.filter(m => m.d === dia(5)).map(m => m.kg)) === JSON.stringify(kg5) && JSON.stringify(w10.filter(f => f.fecha === dia(5)).map(f => f.kg)) === JSON.stringify(kg5)
     && s10.medidas.every(m => w10.some(f => f.fecha === m.d && f.kg === m.kg))
     && s10.km.some(x => x.id === 'nube-caminata-0001'),
     'n21 al entrar, el permiso de la cuenta (dado en otro movil) enciende este y junta los dos lados', { nombre: s10.nombre, creado: s10.creado, nube: w10.length, aqui: s10.medidas.length });
  await pg.click('#tgp-nube'); await pg.click('#tgp-nube-quitar-si'); await pg.waitForTimeout(900);
  await pg.fill('#tgp-nac', String(new Date().getFullYear() - 10)); await pg.click('#tgp-save'); await pg.waitForTimeout(200);
  const dis = await E(`document.getElementById('tgp-nube').disabled`), sub = await pg.innerText('#tgp-nube-box .sub');
  await pg.click('#tgp-nube', { force: true }); await pg.waitForTimeout(100);
  ok(dis && sub.includes('a partir de los 16 años') && await E(`getComputedStyle(document.getElementById('tgp-nube-confirm')).display`) === 'none', 'n22 con 10 años: el interruptor no se puede encender y dice por que', [dis, sub]);
  await pg.fill('#tgp-nac', '1990'); await pg.click('#tgp-save'); await pg.waitForTimeout(200);
  ok(!(await E(`document.getElementById('tgp-nube').disabled`)) && (await pg.innerText('#tgp-nube-box .sub')).includes('perderlos'), 'n23 con un año adulto vuelve a poder encenderse');
  await pg.click('#tgp-nube'); await pg.click('#tgp-nube-si'); await colaVacia();
  await E('TGP_DEMO_NUBE.red(false)'); await pg.fill('#tgp-peso-fecha', dia(4)); await pg.fill('#tgp-peso-nuevo', '74,4'); await pg.click('#tgp-add-peso button[type=submit]'); await pg.waitForTimeout(2600);
  await E('TG_PERFIL.esperar()');
  await E('TGP_DEMO_NUBE.red(true, true)');   /* vuelve la red sin aviso: lo envia «Cerrar sesion» */
  await pg.click('#tgp-logout');
  await pg.waitForFunction(() => !AppAuth.isLoggedIn(), null, { timeout: 6000 }); await pg.waitForTimeout(200);
  ok(JSON.stringify((await nubeDe('pesos')).filter(f => f.fecha === dia(4)).map(f => f.kg)) === '[74.4]' && !(await E('TGP_DEMO_NUBE.estado()')).sesion && (await st()).medidas.some(m => m.d === dia(4)),
    'n24 «Cerrar sesion» envia antes lo pendiente; lo del movil se queda');
  ok(await pg.locator('#tgp-nube').count() === 0 && (await pg.innerText('#tgp-cuenta-status')).includes('solo en este dispositivo'), 'n25 sin sesion: ni interruptor ni subidas', await pg.innerText('#tgp-cuenta-status'));
  await E('TGP_DEMO_NUBE.sesion(true)'); await pg.waitForTimeout(500);
  const SEL = ['#tgp-nube-box .lbl', '#tgp-nube-box .sub', '#tgp-nube-confirm p', '#tgp-nube-quitar p', '#tgp-cuenta-status', '#tgp-borrar-texto'];
  const leer = () => pg.evaluate(sel => sel.map(s => (document.querySelector(s) || {}).textContent || ''), SEL);
  await E(`setLang('es')`); await pg.waitForTimeout(150); const ES = await leer(); const malos = [];
  for (const L of LENG.slice(1)) {
    await E(`setLang('${L}')`); await pg.waitForTimeout(150);
    (await leer()).forEach((t, i) => { if (!t.trim() || t.trim().startsWith('perfil') || t === ES[i]) malos.push([L, SEL[i], t.slice(0, 60)]); });
  }
  await E(`setLang('es')`); await pg.waitForTimeout(150);
  ok(!malos.length, 'n26 los textos de la nube en los diez idiomas', malos);
  await colaVacia(); await E('TG_PERFIL.sincronizar()');
  await pg.fill('#tgp-peso-fecha', dia(7)); await pg.fill('#tgp-peso-nuevo', '73,3'); await pg.click('#tgp-add-peso button[type=submit]');
  await colaVacia(); await pg.waitForTimeout(200);
  ok(JSON.stringify((await nubeDe('pesos')).filter(f => f.fecha === dia(7)).map(f => f.kg)) === '[73.3]', 'n28 un peso anotado mientras sube otra vuelta llega tambien');
  const manana = (() => { const d = new Date(); d.setDate(d.getDate() + 1); return ymd(d); })();
  await pg.evaluate(([f, U1]) => TGP_DEMO_NUBE.poner('pesos', TGP_DEMO_NUBE.tabla('pesos').concat([{ user_id: U1, fecha: f, kg: 72.2 }])), [manana, U1]);
  r = await E('TG_PERFIL.sincronizar()'); await pg.fill('#tgp-peso-fecha', dia(8)); await pg.fill('#tgp-peso-nuevo', '72,5'); await pg.click('#tgp-add-peso button[type=submit]'); await colaVacia();
  ok((await st()).medidas.every(m => m.d !== manana) && JSON.stringify((await nubeDe('pesos')).filter(f => f.fecha === manana).map(f => f.kg)) === '[72.2]', 'n29 un peso con fecha de «mañana» (otro huso) no se enseña aqui ni se borra de la nube', { r });
  const fRara = await nubeDe('perfiles'); fRara[0].avatar = 'xx-nada'; fRara[0].nombre = 'N'.repeat(60); fRara[0].altura_cm = 999; fRara[0].updated_at = new Date().toISOString();
  await pg.evaluate(([f, U1, d9]) => { TGP_DEMO_NUBE.poner('perfiles', f); TGP_DEMO_NUBE.poner('pesos', TGP_DEMO_NUBE.tabla('pesos').concat([{ user_id: U1, fecha: d9, kg: 9999 }])); }, [fRara, U1, dia(9)]);
  await E('TG_PERFIL.sincronizar()'); await pg.waitForTimeout(200); const s16 = await st();
  ok(s16.avatar === '' && s16.nombre.length === 24 && s16.altura_cm === null && s16.medidas.every(m => m.d !== dia(9)), 'n30 lo raro de la nube se descarta: avatar que no existe, nombre largo, altura fuera de rango, peso imposible', { avatar: s16.avatar, nombre: s16.nombre, altura: s16.altura_cm });
  if (await sw() === 'false') { await pg.click('#tgp-nube'); await pg.click('#tgp-nube-si'); }
  await colaVacia(); await E('TG_PERFIL.sincronizar()');
  await E('TGP_DEMO_NUBE.red(false)');
  await pg.click('#tgp-borrar-local'); await pg.click('#tgp-borrar-si'); await E('TG_PERFIL.esperar()'); await pg.waitForTimeout(150);
  const t17 = await toast();
  ok(t17.startsWith('Datos del perfil borrados de este dispositivo.') && t17.includes('en cuanto haya conexión') && (await nubeDe('perfiles')).length === 1 && !(await st()).medidas.length, 'n32 sin red: el aviso dice las dos cosas (borrado aqui; la cuenta, en cuanto haya conexion)', t17);
  await E('TGP_DEMO_NUBE.red(true)'); await colaVacia();
  ok(!(await nubeDe('perfiles')).length && !(await nubeDe('pesos')).length && !(await nubeDe('caminatas')).length, 'n33 vuelve la red: la copia de la cuenta se borra');
  await E(`(() => { window.__admin = true; window.dispatchEvent(new Event('tg-sesion')); })()`); await pg.waitForTimeout(250); const con = await pg.locator('#tgp-admin').count();
  await E(`(() => { window.__admin = false; window.dispatchEvent(new Event('tg-sesion')); })()`); await pg.waitForTimeout(250); const sin = await pg.locator('#tgp-admin').count();
  ok(con === 1 && sin === 0, 'n31 el boton de administrador sale solo si esAdmin() dice que si (como pintarBotonAdmin)', [con, sin]);
  ok(!errs.length, 'n27 sin errores JS ni de consola', errs);
  await ctx.close();
}

/* ── 2b. la nube con mucho dato ───────────────────────────────────────── */
async function volumen(b) {
  console.log('\n=== 2b. la nube con mucho dato: mas filas de las que Supabase da en una consulta ===');
  const ctx = await contexto(b), pg = await ctx.newPage(), errs = errores(pg);
  const vacio = Object.assign(ejemplo(), { medidas: [], km: [] });
  await ctx.addInitScript(d => { try { if (!sessionStorage.getItem('perfil-sembrado')) { localStorage.setItem('tenerife.perfil', d); sessionStorage.setItem('perfil-sembrado', '1'); } } catch (e) {} }, JSON.stringify(vacio));
  await abrirApp(pg, 'es');
  await conNube(pg); await pg.evaluate(() => TGP_DEMO_NUBE.reiniciar());
  const E = f => pg.evaluate(f);
  const [U1] = await E('TGP_DEMO_NUBE.uids');
  /* tres años de pesos diarios y casi otros tantos de caminatas, puestos «desde otro movil» con su permiso */
  const ayer = new Date(Date.now() - 86400000).toISOString();
  const pesos = [], caminatas = [];
  for (let n = 1; n <= 1500; n++) pesos.push({ user_id: U1, fecha: dia(n), kg: Math.round((70 + (n % 40) / 4) * 10) / 10 });
  for (let n = 1; n <= 1200; n++) caminatas.push({ user_id: U1, id: 'vol-caminata-' + String(n).padStart(5, '0'), fecha: dia(n), km: Math.round((2 + n % 15) * 10) / 10 });
  await pg.evaluate(([U1, ayer, d1600, pesos, caminatas]) => {
    TGP_DEMO_NUBE.poner('perfiles', [{ user_id: U1, consentido_en: ayer, nombre: 'Muchos datos', avatar: null, unidades: 'metric', altura_cm: 175, nacimiento: 1980, objetivo_kg: 75, creado: d1600, updated_at: ayer }]);
    TGP_DEMO_NUBE.poner('pesos', pesos); TGP_DEMO_NUBE.poner('caminatas', caminatas);
  }, [U1, ayer, dia(1600), pesos, caminatas]);
  await abrirPerfilYa(pg);
  const st = () => E('JSON.parse(JSON.stringify(TG_PERFIL.estado()))');
  const enNube = async t => (await E(`TGP_DEMO_NUBE.tabla('${t}')`)).filter(f => f.user_id === U1);
  const colaVacia = () => pg.waitForFunction(() => !Object.keys(TG_PERFIL.estado().colas).length, null, { timeout: 30000 });
  let r = await E('TG_PERFIL.sincronizar()'); await colaVacia();
  let s1 = await st();
  const iguales = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
  const fechas = s => s.medidas.map(m => m.d + ' ' + m.kg).sort(), ids = s => s.km.map(k => k.id).sort();
  ok(r === 'ok' && s1.medidas.length === 1500 && s1.km.length === 1200 && iguales(fechas(s1), pesos.map(f => f.fecha + ' ' + f.kg).sort()) && iguales(ids(s1), caminatas.map(f => f.id).sort()),
    'v1 un movil nuevo recibe los 1.500 pesos y las 1.200 caminatas de la cuenta (Supabase da 1.000 por consulta)', { r, pesos: s1.medidas.length, caminatas: s1.km.length });
  r = await E('TG_PERFIL.sincronizar()'); await colaVacia();
  const s2 = await st();
  ok(r === 'ok' && s2.medidas.length === 1500 && s2.km.length === 1200 && (await enNube('pesos')).length === 1500 && (await enNube('caminatas')).length === 1200,
    'v2 la vuelta siguiente no quita nada, ni aqui ni en la nube', { r, aqui: [s2.medidas.length, s2.km.length], nube: [(await enNube('pesos')).length, (await enNube('caminatas')).length] });
  await E('TGP_DEMO_NUBE.maxFilas(300)');
  await pg.evaluate(([U1, f]) => TGP_DEMO_NUBE.poner('pesos', TGP_DEMO_NUBE.tabla('pesos').concat([{ user_id: U1, fecha: f, kg: 71.1 }])), [U1, dia(1501)]);
  r = await E('TG_PERFIL.sincronizar()'); await colaVacia();
  const s3 = await st();
  ok(r === 'ok' && s3.medidas.length === 1501 && s3.medidas.some(m => m.d === dia(1501) && m.kg === 71.1) && s3.km.length === 1200 && (await enNube('pesos')).length === 1501,
    'v3 con un tope mas bajo en el proyecto (300 por consulta) llegan igual, y lo nuevo de otro movil tambien', { r, pesos: s3.medidas.length, caminatas: s3.km.length });
  await E('TGP_DEMO_NUBE.maxFilas(1000)');
  ok(!errs.length, 'v4 sin errores JS ni de consola', errs);
  await ctx.close();
}

/* ── 2c. el tope: 2.000 pesos y 2.000 caminatas (nube.py, 34-37) ─────────── */
async function tope(b) {
  console.log('\n=== 2c. el tope: 2.000 pesos y 2.000 caminatas por cuenta, como perfil.sql ===');
  const ctx = await contexto(b), pg = await ctx.newPage(), errs = errores(pg);
  const vacio = Object.assign(ejemplo(), { medidas: [], km: [] });
  await ctx.addInitScript(d => { try { if (!sessionStorage.getItem('perfil-sembrado')) { localStorage.setItem('tenerife.perfil', d); sessionStorage.setItem('perfil-sembrado', '1'); } } catch (e) {} }, JSON.stringify(vacio));
  await abrirApp(pg, 'es');
  await conNube(pg); await pg.evaluate(() => TGP_DEMO_NUBE.reiniciar());
  const E = f => pg.evaluate(f);
  const [U1] = await E('TGP_DEMO_NUBE.uids');
  const ayer = new Date(Date.now() - 86400000).toISOString();
  const pesos = [], caminatas = [];
  for (let n = 1; n <= 2000; n++) pesos.push({ user_id: U1, fecha: dia(n), kg: 70 });
  for (let n = 0; n < 2000; n++) caminatas.push({ user_id: U1, id: 'tope-caminata-' + String(n).padStart(6, '0'), fecha: dia(1 + n % 300), km: 5 });
  await pg.evaluate(([U1, ayer, d, p, c]) => {
    TGP_DEMO_NUBE.poner('perfiles', [{ user_id: U1, consentido_en: ayer, nombre: 'Tope', avatar: null, unidades: 'metric', altura_cm: 175, nacimiento: 1980, objetivo_kg: 75, creado: d, updated_at: ayer }]);
    TGP_DEMO_NUBE.poner('pesos', p); TGP_DEMO_NUBE.poner('caminatas', c);
  }, [U1, ayer, dia(2100), pesos, caminatas]);
  await abrirPerfilYa(pg);
  const st = () => E('JSON.parse(JSON.stringify(TG_PERFIL.estado()))');
  const enNube = async t => (await E(`TGP_DEMO_NUBE.tabla('${t}')`)).filter(f => f.user_id === U1);
  const colaVacia = () => pg.waitForFunction(() => !Object.keys(TG_PERFIL.estado().colas).length, null, { timeout: 30000 });
  await E('TG_PERFIL.sincronizar()'); await colaVacia();
  const s0 = await st();
  ok(s0.medidas.length === 2000 && s0.km.length === 2000, 'n34 2.000 pesos y 2.000 caminatas de la cuenta llegan todos (dos paginas de 1.000)', [s0.medidas.length, s0.km.length]);
  const cifras = t => t.replace(/[\s.  ,]/g, '');
  await pg.click('#tgp-evo-tabs button[data-tab="peso"]'); await pg.waitForTimeout(100);
  await pg.fill('#tgp-peso-fecha', HOY); await pg.fill('#tgp-peso-nuevo', '69,5'); await pg.click('#tgp-add-peso button[type=submit]'); await pg.waitForTimeout(400);
  const ayuda = await pg.innerText('#tgp-peso-nuevo-h'), s1 = await st();
  ok(s1.medidas.length === 2000 && ayuda.includes('el máximo') && cifras(ayuda).includes('2000') && (await enNube('pesos')).every(f => f.fecha !== HOY) && !Object.keys(s1.colas).length,
    'n35 con 2.000 pesos, el de un dia nuevo no se anota: lo dice debajo del campo y no sube nada', ayuda);
  await pg.fill('#tgp-peso-fecha', dia(5)); await pg.fill('#tgp-peso-nuevo', '68,8'); await pg.click('#tgp-add-peso button[type=submit]'); await colaVacia();
  const p5 = (await enNube('pesos')).filter(f => f.fecha === dia(5)).map(f => f.kg);
  ok(JSON.stringify(p5) === '[68.8]' && (await enNube('pesos')).length === 2000 && (await st()).medidas.length === 2000,
    'n36 en el tope, cambiar el peso de un dia que ya lo tiene si se puede, y sube (upsert: no suma filas)', p5);
  await pg.click('#tgp-evo-tabs button[data-tab="km"]'); await pg.waitForTimeout(100);
  await pg.fill('#tgp-km-fecha', HOY); await pg.fill('#tgp-km-nuevo', '3'); await pg.click('#tgp-add-km button[type=submit]'); await pg.waitForTimeout(400);
  const ayudaK = await pg.innerText('#tgp-km-nuevo-h'), s3 = await st();
  ok(s3.km.length === 2000 && ayudaK.includes('el máximo') && (await enNube('caminatas')).length === 2000 && !Object.keys(s3.colas).length,
    'n37 con 2.000 caminatas no se anota otra: lo dice debajo del campo y no sube nada', ayudaK);
  ok(!errs.length, 'n37b sin errores JS ni de consola', errs);
  await ctx.close();
}

/* ── 3. las visitas comprobadas ───────────────────────────────────────── */
async function visitas(b) {
  console.log('\n=== 3. las visitas comprobadas, en el mapa (probar_visitas.py) ===');
  const TEIDE = { latitude: 28.2726, longitude: -16.6429, accuracy: 20 };
  const LEJOS = { latitude: 28.4636, longitude: -16.2518, accuracy: 20 };   // Santa Cruz
  const ctx = await contexto(b, { viewport: { width: 1280, height: 900 }, geolocation: TEIDE, permissions: ['geolocation'] });
  const pg = await ctx.newPage(), errs = [];
  pg.on('pageerror', e => errs.push(String(e)));
  await abrirApp(pg, 'es');
  for (let i = 0; i < 3; i++) { await pg.keyboard.press('Escape'); await pg.waitForTimeout(200); }
  async function abrir(pid) { await pg.evaluate(id => { try { map.closePopup(); } catch (e) {} goToPlace(id); }, pid); await pg.waitForTimeout(1200); return pg.locator('.leaflet-popup .popup-visit-btn'); }
  const lista = () => pg.evaluate(() => JSON.parse(localStorage.getItem('tenerife.visitas') || '[]'));
  let btn = await abrir('teide');
  ok(await btn.count() === 1, 'v1 la ficha del Teide tiene «Marcar visitado»', await btn.count());
  await btn.first().click(); await pg.waitForTimeout(1500);
  let v = await lista();
  ok(v.some(x => x.id === 'teide'), 'v2 marcado estando alli: queda comprobada', v);
  ok(v.every(x => Object.keys(x).sort().join() === 'd,id'), 'v3 solo id y dia, sin posicion', v);
  ok(await pg.locator('.tg-toast', { hasText: 'Visita comprobada' }).count() >= 1, 'v4 sale «✓ Visita comprobada»');
  ok(JSON.stringify(await pg.evaluate(() => AppLogros.comprobadas())) === '["teide"]', 'v5 AppLogros.comprobadas() la da');
  await btn.first().click(); await pg.waitForTimeout(600);
  ok(!(await lista()).some(x => x.id === 'teide'), 'v6 desmarcar la quita', await lista());
  await ctx.setGeolocation(LEJOS);
  btn = await abrir('anaga'); await btn.first().click(); await pg.waitForTimeout(1500);
  ok((await pg.evaluate(() => AppLogros.visitados())).includes('anaga') && !(await pg.evaluate(() => AppLogros.comprobadas())).includes('anaga'), 'v7 marcado lejos: visitado, pero no comprobado', await lista());
  await ctx.setGeolocation({ latitude: 28.5462, longitude: -16.1802, accuracy: 30 });
  await abrir('anaga'); await pg.waitForTimeout(1500);
  ok((await pg.evaluate(() => AppLogros.comprobadas())).includes('anaga'), 'v8 al volver a abrir su ficha estando alli, se comprueba sola (permiso ya dado)', await lista());
  await ctx.setGeolocation({ latitude: 28.5462, longitude: -16.1802, accuracy: 900 });
  await pg.evaluate(() => localStorage.setItem('tenerife.visitas', '[]'));
  await abrir('anaga'); await pg.waitForTimeout(1500);
  ok(!(await pg.evaluate(() => AppLogros.comprobadas())).includes('anaga'), 'v9 con una lectura imprecisa (900 m) no se comprueba', await lista());
  await pg.evaluate(() => localStorage.setItem('tenerife.visitas', JSON.stringify([{ id: 'teide', d: '2099-01-01' }, { id: 'no-existe', d: '2026-01-01' }, { id: 'anaga', d: '2026-10-01' }, { id: 'anaga', d: '2026-10-02' }, 'x', { id: 'anaga' }])));
  ok(JSON.stringify(await pg.evaluate(() => AppLogros.comprobadas())) === '["anaga"]', 'v10 lo leido se valida: ni futuro, ni lugares que no existen, ni repetidos', await pg.evaluate(() => AppLogros.comprobadas()));
  ok(!errs.length, 'v11 sin errores de pagina', errs);
  await ctx.close();
}

/* ── 4. lo de la nota: avatares, botones, diez idiomas y tres anchos ──── */
async function pantalla(b) {
  console.log('\n=== 4. los avatares, los botones y los diez idiomas a 360, 390 y 430 px ===');
  const ctx = await contexto(b), pg = await ctx.newPage(), errs = errores(pg);
  await abrirApp(pg, 'es');
  await pg.evaluate(hoy => {
    const ids = places.slice(0, 10).map(p => p.id);
    localStorage.setItem('tenerife.visited', JSON.stringify(ids));
    localStorage.setItem('tenerife.visitas', JSON.stringify(ids.map(id => ({ id, d: hoy }))));   /* el set Tenerife, abierto */
    localStorage.removeItem('tenerife.perfil');
  }, HOY);
  await pg.click('#v19-nav-account');
  await pg.waitForFunction(() => window.TG_PERFIL && !document.getElementById('perfil-panel').hidden, null, { timeout: 15000 });
  ok(!(await pg.evaluate(() => document.getElementById('auth-modal-backdrop').classList.contains('show'))), 'p1 «Cuenta» de la barra de abajo abre el perfil (no la ficha de la cuenta)');
  await pg.evaluate(() => TG_PERFIL.cerrar()); await pg.waitForTimeout(250);
  await pg.evaluate(() => document.getElementById('auth-btn').click()); await pg.waitForTimeout(400);
  ok(await pg.evaluate(() => !document.getElementById('perfil-panel').hidden && !document.getElementById('auth-modal-backdrop').classList.contains('show')), 'p2 el boton de la cuenta de arriba (#auth-btn) tambien abre el perfil');
  /* los textos fijos del cuerpo: cada selector de TEXTOS da con un solo elemento, y montar() le puso su clave */
  const textosMal = await pg.evaluate(T => T.filter(([sel, como, clave]) => {
    const n = document.querySelectorAll('#perfil-panel ' + sel);
    return n.length !== 1 || n[0].getAttribute(como === 'tx' ? 'data-tx' : 'data-tx-' + como) !== clave;
  }).map(t => t[0]), TEXTOS);
  ok(TEXTOS.length > 30 && !textosMal.length, 'p2b los ' + TEXTOS.length + ' textos fijos del cuerpo (TEXTOS): cada selector da con un solo elemento, y lleva su clave', textosMal);
  /* los 284 avatares (235 y 49 de oro), set a set, pintados de verdad: cada set se abre desde «Todos los paises» */
  const sets = await pg.evaluate(() => TG_AVATARES.sets.map(s => s.id));
  const pintados = [], elegidos = [];
  for (const s of sets) {
    await pg.click('#tgp-paises-btn'); await pg.waitForTimeout(80);
    await pg.click('#tgp-paises-grid .tgp-pais[data-set="' + s + '"]'); await pg.waitForTimeout(150);
    const r = await pg.evaluate(() => [...document.querySelectorAll('#tgp-strip .tgp-av')].map(b => { const sv = b.querySelector('svg.tg-avatar'), q = sv && sv.getBoundingClientRect(); return { id: b.dataset.id, ok: !!(q && q.width > 30 && q.height > 30 && sv.querySelector('clipPath') && sv.querySelector('linearGradient')), libre: !b.disabled }; }));
    r.forEach(x => { if (x.ok) pintados.push(x.id); });
    const primero = r[0];
    if (primero && primero.libre) {
      await pg.click('#tgp-strip .tgp-av >> nth=0'); await pg.waitForTimeout(450);
      const e = await pg.evaluate(id => ({
        estado: TG_PERFIL.estado().avatar,
        heroe: !!document.querySelector('#tgp-ava-big svg.tg-avatar'),
        boton: (document.querySelector('#auth-btn .tg-avatar-cuenta') || {}).dataset ? document.querySelector('#auth-btn .tg-avatar-cuenta').dataset.id : null,
        guardado: JSON.parse(localStorage.getItem('tenerife.perfil') || '{}').avatar
      }), primero.id);
      if (e.estado === primero.id && e.heroe && e.boton === primero.id && e.guardado === primero.id) elegidos.push(s); else elegidos.push(s + ':MAL ' + JSON.stringify(e));
    } else elegidos.push(s + ':cerrado');
  }
  ok(pintados.length === 284 && new Set(pintados).size === 284, 'p3 los 284 avatares se pintan en la tira, cada uno con su recorte y su degradado', pintados.length);
  ok(elegidos.length === 47 && elegidos.every(x => !x.includes(':')), 'p4 uno de cada uno de los 47 sets (Tenerife incluido, con 10 visitas comprobadas): queda elegido, en el heroe, guardado y en el boton de la cuenta', elegidos.filter(x => x.includes(':')));
  await ctx.close();

  /* los diez idiomas, a tres anchos, con datos en cada parte */
  const ROTULOS = '.tgp-tile .k, .tgp-tile .v, .tgp-stamp .nm, .tgp-stamp .th, .tgp-set, .tgp-mas, .tgp-pais .name, .tgp-btn, .tgp-chip, .tgp-card h2, .tgp-top h1, .tgp-field label, .tgp-seg button, .tgp-ranges button, .tgp-legend span, .tgp-lema, .tgp-eyebrow';
  for (const ancho of [360, 390, 430]) {
    const c2 = await contexto(b, { viewport: { width: ancho, height: 900 } }), p2 = await c2.newPage(), e2 = errores(p2);
    await c2.addInitScript(d => { try { localStorage.setItem('tenerife.perfil', d); } catch (e) {} }, JSON.stringify(ejemplo()));
    await abrirApp(p2, 'es');
    await p2.evaluate(hoy => { const ids = places.slice(0, 12).map(p => p.id); localStorage.setItem('tenerife.visited', JSON.stringify(ids)); localStorage.setItem('tenerife.visitas', JSON.stringify(ids.slice(0, 3).map(id => ({ id, d: hoy })))); localStorage.setItem('tenerife.badges', JSON.stringify(['primer', 'explorador'])); }, HOY);
    await abrirPerfilYa(p2);
    /* con «Todos los paises» abierto: sus 47 nombres, en cada idioma, tambien se miran */
    await p2.click('#tgp-paises-btn'); await p2.waitForTimeout(200);
    let es = null; const partidas = [], fuera = [], vacios = [], castellano = [];
    for (const L of LENG) {
      await p2.evaluate(l => setLang(l), L); await p2.waitForTimeout(450);
      const r = await p2.evaluate(([sel, l]) => {
        const panel = document.getElementById('perfil-panel'), out = { partidas: [], fuera: [], vacios: [], textos: [] };
        /* una palabra de un rotulo que acaba en dos lineas. Cortar en el guion de un
           compuesto es correcto («Teneriffa-/Legende»): se mira cada trozo entre
           espacios y guiones; lo que no puede pasar es un corte sin guion. En chino
           se puede pasar de linea entre dos caracteres cualesquiera: cada uno es un
           trozo («波斯尼亚和黑塞哥维那», en la lista de paises). */
        panel.querySelectorAll(sel).forEach(el => {
          const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let n;
          while ((n = w.nextNode())) {
            const re = /[\u3000-\u9fff\uf900-\ufaff]|[^\s\-\u2010\u3000-\u9fff\uf900-\ufaff]+/g; let m;
            while ((m = re.exec(n.data))) {
              const rg = document.createRange(); rg.setStart(n, m.index); rg.setEnd(n, m.index + m[0].length);
              const tops = new Set([...rg.getClientRects()].filter(q => q.width > 0).map(q => Math.round(q.top)));
              if (tops.size > 1) out.partidas.push(m[0]);
            }
          }
        });
        /* nada se sale por los lados (las filas que se desplazan de lado y lo decorativo, aparte) */
        if (panel.scrollWidth > innerWidth + 1) out.fuera.push('scrollWidth ' + panel.scrollWidth);
        panel.querySelectorAll('*').forEach(e => {
          if (e.closest('.tgp-strip, .tgp-hero, .tgp-toast, .tgp-tip') || e.closest('[hidden]')) return;
          const q = e.getBoundingClientRect(); if (q.width && (q.right > innerWidth + 1 || q.left < -1)) out.fuera.push((e.className && e.className.baseVal === undefined ? e.className : e.tagName) + ' ' + Math.round(q.left) + '-' + Math.round(q.right));
        });
        panel.querySelectorAll('[data-tx]').forEach(e => { if (!e.textContent.trim() && !e.closest('[hidden]')) out.vacios.push(e.getAttribute('data-tx')); });
        const w2 = document.createTreeWalker(panel, NodeFilter.SHOW_TEXT); let t;
        while ((t = w2.nextNode())) { const s = t.data.trim(); if (s && t.parentElement && !t.parentElement.closest('[hidden]') && getComputedStyle(t.parentElement).display !== 'none') out.textos.push(s); }
        return out;
      }, [ROTULOS, L]);
      r.partidas.forEach(x => partidas.push(L + ':' + x)); r.fuera.forEach(x => fuera.push(L + ':' + x)); r.vacios.forEach(x => vacios.push(L + ':' + x));
      if (L === 'es') es = new Set(r.textos);
      else r.textos.forEach(x => { if (es.has(x) && /[áéíóúñ¿¡]/i.test(x)) castellano.push(L + ':' + x); });
    }
    ok(!partidas.length, 'p5 a ' + ancho + ' px, en los diez idiomas: ningun rotulo con una palabra partida en dos lineas (sin guion)', [...new Set(partidas)].slice(0, 12));
    ok(!fuera.length, 'p6 a ' + ancho + ' px: nada se sale de la pantalla', [...new Set(fuera)].slice(0, 12));
    ok(!vacios.length, 'p7 a ' + ancho + ' px: ningun texto vacio', vacios.slice(0, 12));
    ok(!castellano.length, 'p8 a ' + ancho + ' px: nada en castellano fuera del castellano', [...new Set(castellano)].slice(0, 12));
    ok(!e2.length, 'p9 a ' + ancho + ' px: sin errores', e2);
    await c2.close();
  }
}

/* ── 4b. los de oro en pantalla (barrido_oro.py) ───────────────────────── */
/* lo que miraba barrido_oro.py en el prototipo: los textos que se ven (y los aria-label y
   placeholder), las palabras mas anchas que su caja, lo que se sale, y los distintivos de oro
   dentro de su boton (2 px de margen: el candado y la bandera asoman a proposito por la
   esquina del dibujo, no del boton) */
const JS_ORO = () => {
  const raiz = document.getElementById('tgp'), textos = [], cortes = [], desborde = [];
  const w = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
  while (w.nextNode()) {
    const n = w.currentNode, el = n.parentElement, t = n.textContent.trim();
    if (!t || !el || el.closest('select')) continue;
    const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
    if (r.width === 0 || cs.visibility === 'hidden' || el.closest('[hidden]')) continue;
    textos.push(t);
  }
  raiz.querySelectorAll('[aria-label], [placeholder]').forEach(e => ['aria-label', 'placeholder'].forEach(a => { const v = e.getAttribute(a); if (v) textos.push('@' + a + ':' + v); }));
  const cv = document.createElement('canvas').getContext('2d');
  raiz.querySelectorAll('.tgp-tile .k, .tgp-av .name, .tgp-oro-hoy, .tgp-oro-fecha, .tgp-stamp .nm, .tgp-stamp .th, .tgp-set span, .tgp-chip span, .tgp-btn, .tgp-seg button, .tgp-ranges button, label, .tgp-imc .cat, .tgp-nube .lbl, .tgp-nube .sub, .tgp-lock-why, .tgp-lock-note, .tgp-confirm p').forEach(e => {
    if (!e.offsetParent) return;
    const cs = getComputedStyle(e); cv.font = cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
    const ls = parseFloat(cs.letterSpacing) || 0, ancho = e.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    let txt = e.textContent.trim(); if (cs.textTransform === 'uppercase') txt = txt.toUpperCase();
    txt.split(/\s+/).flatMap(x => x.split(/(?<=-)/)).filter(x => !/[　-鿿]/.test(x)).forEach(x => { const m = cv.measureText(x).width + ls * x.length; if (m > ancho + 0.5) cortes.push(e.className + ' «' + x + '» ' + m.toFixed(0) + '>' + ancho.toFixed(0)); });
  });
  raiz.querySelectorAll('*').forEach(e => {
    if (e.closest('.tgp-strip') || e.closest('.tgp-sets') || e.closest('.tgp-log') || e.tagName === 'svg' || e.closest('svg')) return;
    const cs = getComputedStyle(e); if (cs.display === 'none') return;
    if (e.children.length === 0 && e.textContent.trim() && e.scrollWidth > e.clientWidth + 1 && cs.overflow !== 'visible') desborde.push(e.className + ' «' + e.textContent.trim().slice(0, 40) + '»');
    const r = e.getBoundingClientRect(); if (r.right > innerWidth + 1 && !e.closest('.tgp-hero')) desborde.push('fuera: ' + (e.id || e.className) + ' ' + Math.round(r.right));
  });
  raiz.querySelectorAll('#tgp-strip .tgp-av.is-oro').forEach(bo => { const rb = bo.getBoundingClientRect();
    bo.querySelectorAll('.tgp-oro-hoy, .tgp-oro-fecha, .tgp-oro-bandera, .tgp-oro-candado').forEach(x => { const r = x.getBoundingClientRect();
      if (r.width && (r.left < rb.left - 2 || r.right > rb.right + 2 || r.top < rb.top - 2 || r.bottom > rb.bottom + 2)) desborde.push('distintivo fuera de su boton: ' + x.className + ' «' + x.textContent + '» en ' + bo.dataset.id); }); });
  /* en el prototipo la pantalla era la pagina; en la app es su panel, encima del mapa */
  return { textos, cortes: [...new Set(cortes)], desborde: [...new Set(desborde)].slice(0, 12), sw: document.getElementById('perfil-panel').scrollWidth - innerWidth };
};
async function barridoOro(b) {
  console.log('\n=== 4b. los de oro en pantalla: diez idiomas, tres anchos y cinco estados (barrido_oro.py) ===');
  const CAPTURAS = process.env.PERFIL_CAPTURAS || '';
  /* nombres propios que ese idioma deja en castellano a proposito (los revisores de cada idioma; tambien en IGUAL_UI de auditar_idioma.js) */
  const ACEPTADOS = { nl: new Set(['Día de Canarias']) };
  const hallazgos = {}; let pantallas = 0;
  for (const ancho of [360, 390, 430]) {
    const ctx = await contexto(b, { viewport: { width: ancho, height: 900 }, timezoneId: 'Atlantic/Canary' }), pg = await ctx.newPage(), errs = errores(pg);
    await abrirApp(pg, 'es');
    await pg.evaluate(() => { localStorage.removeItem('tenerife.perfil'); localStorage.removeItem('tenerife.visitas'); });   /* Tenerife, cerrado */
    await abrirPerfilYa(pg);
    let base = new Set();
    for (const L of LENG) {
      await pg.evaluate(l => setLang(l), L); await pg.waitForTimeout(300);
      for (const estado of ['hoy', 'deoro', 'fiesta', 'carnaval']) {
        if (estado === 'hoy') await fechaOro(pg, HOY);
        else if (estado === 'deoro') { await fechaOro(pg, HOY); await abrirSet(pg, 'oro'); }
        else if (estado === 'fiesta') { await fechaOro(pg, '2027-03-01'); await abrirSet(pg, 'oro'); }
        else { await fechaOro(pg, '2027-02-21'); await abrirSet(pg, 'tf'); }
        for (const paso of (estado === 'fiesta' ? [null, 'bg'] : [null])) {
          if (paso) await abrirSet(pg, paso);
          pantallas++;
          const r = await pg.evaluate(JS_ORO), k = L + '@' + ancho, h = hallazgos[k] || (hallazgos[k] = []);
          if (L === 'es') r.textos.forEach(t => base.add(t));
          r.textos.forEach(t => {
            if (/\{[a-z]+\}/.test(t)) h.push(estado + ' marcador: ' + t);
            if (/\bundefined\b|\bNaN\b|\bnull\b|\[object/.test(t)) h.push(estado + ' raro: ' + t);
            if (L !== 'es' && base.has(t) && !(ACEPTADOS[L] && ACEPTADOS[L].has(t)) && /[áéíóúñ¿¡]/i.test(t)) h.push(estado + ' igual que en castellano: ' + t);
          });
          r.cortes.forEach(x => h.push(estado + ' cortada: ' + x)); r.desborde.forEach(x => h.push(estado + ' ' + x));
          if (r.sw > 0) h.push(estado + ' scroll de lado: ' + r.sw);
          if (CAPTURAS && ancho === 390 && (estado === 'fiesta' || estado === 'carnaval')) {
            await pg.locator('#tgp-strip').scrollIntoViewIfNeeded(); await pg.waitForTimeout(80);
            const y = await pg.evaluate(() => Math.max(0, document.querySelector('#tgp-sets').getBoundingClientRect().top - 60));
            await pg.screenshot({ path: path.join(CAPTURAS, L + '-' + estado + (paso ? '-' + paso : '') + '.png'), clip: { x: 0, y, width: ancho, height: 420 } });
          }
        }
      }
    }
    if (errs.length) hallazgos['errores@' + ancho] = errs;
    await ctx.close();
  }
  const malos = Object.entries(hallazgos).filter(([, v]) => v.length);
  ok(pantallas === 150 && !malos.length, '4b los de oro, en ' + pantallas + ' pantallas (diez idiomas, tres anchos y cinco estados): ni marcadores sueltos, ni castellano fuera del castellano, ni palabras cortadas, ni nada fuera de la pantalla, y cada distintivo de oro dentro de su boton',
    Object.fromEntries(malos.map(([k, v]) => [k, [...new Set(v)].slice(0, 6)])));
}

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-proxy-server'] });
  try {
    await regresiones(b);
    await selector(b);
    await oro(b);
    await nube(b);
    await volumen(b);
    await tope(b);
    await visitas(b);
    await pantalla(b);
    await barridoOro(b);
  } finally { await b.close(); }
  console.log('\n  ' + cuenta + ' controles, ' + (fallos ? fallos + ' con fallo' : 'todos en verde'));
  process.exit(fallos ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
