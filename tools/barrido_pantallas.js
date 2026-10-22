#!/usr/bin/env node
/* barrido_pantallas.js — lo que se VE en pantalla, en los diez idiomas.
 *
 *     python3 -m http.server 8820 &      (desde la raiz del repo)
 *     node tools/barrido_pantallas.js 8820 [--lista]
 *
 * POR QUE: los demas controles de idioma miran el fuente (tablas, filas,
 * ficheros) o, como auditar_sin_traducir.js, solo la pagina de arranque y
 * solo en bulgaro. El 7 de octubre Jerome vio cosas sin traducir y este
 * barrido encontro de donde venian, en sitios que ninguno de ellos abria:
 *   · 200 etiquetas de ficha en castellano en los nueve idiomas («Permiso»,
 *     «Familia», «Teleferico»...), que auditar_etiquetas.js daba por nombres
 *     de sitio;
 *   · los botones de los aeropuertos del panel de guaguas ponian «Süd», en
 *     aleman, en italiano, neerlandes, chino, bulgaro y polaco;
 *   · la barra del filtro decia «Mostrando» en italiano.
 *
 * COMO: abre la app en cada idioma, recorre 70 y pico paneles (categorias,
 * guaguas, rutas, mar, microclimas, fiestas, el cielo, asistente, cuenta, el
 * tour entero, «la gasolinera mas barata cerca de mi»...) y una ficha de cada
 * categoria, y apunta todo texto visible y todo title/aria-label/placeholder.
 * Quita los nombres propios (los de places[], sus direcciones, las lineas y
 * paradas de TITSA y las etiquetas declaradas en
 * idiomas/etiquetas-sin-traducir.json) y canta:
 *   · lo que sale IGUAL que en castellano y lleva tilde o eñe;
 *   · palabras castellanas que no son de ese idioma («mostrando», «horario»,
 *     «guaguas», «permiso»...);
 *   · en chino y bulgaro, un texto latino identico al de otro idioma (asi se
 *     vio el «Süd» aleman dentro del chino);
 *   · un boton o enlace con el mismo emoji dos veces seguidas. El de «Como
 *     llegar en bus» de cada ficha decia «🚏 🚏» en los diez idiomas desde el
 *     18 de septiembre hasta el 12 de octubre: el boton traia su 🚏 y el texto
 *     que le ponia openDetailSheet traia otro. Son dos nodos de texto, asi que
 *     el barrido de textos no lo podia ver: se mira el boton entero.
 * Lo que no es un hueco va declarado en idiomas/pantalla-aceptado.json, con
 * su motivo. Sale con 1 si algo falla.
 */
'use strict';
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs'), os = require('os'), path = require('path'), { execFileSync } = require('child_process');
const RAIZ = path.join(__dirname, '..');
const PUERTO = process.argv[2] && process.argv[2][0] !== '-' ? process.argv[2] : '8820';
const LISTA = process.argv.includes('--lista');
/* --solo=es,de,zh  para probar a mano con menos idiomas (el castellano hace falta siempre) */
const SOLO = (process.argv.find(a => a.startsWith('--solo=')) || '').slice(7).split(',').filter(Boolean);
const src = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
const IDI = ((src.match(/SUPPORTED_LANGS\s*=\s*\[([^\]]*)\]/) || [, ''])[1])
  .split(',').map(x => x.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
if (!IDI.includes('es')) { console.error('no se encuentra SUPPORTED_LANGS en index.html'); process.exit(2); }
if (SOLO.length) IDI.splice(0, IDI.length, ...IDI.filter(l => l === 'es' || SOLO.includes(l)));

/* los precios, para que el panel «cerca de mi» se abra: el guion de verdad
   con el registro del repo puesto a hoy, como en auditar_gas_cerca.js */
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'barrido-'));
execFileSync('python3', ['-c', [
  'import json, datetime as dt, sys',
  'from zoneinfo import ZoneInfo',
  "d = json.load(open(sys.argv[1], encoding='utf-8-sig'))",
  "d['Fecha'] = dt.datetime.now(ZoneInfo('Europe/Madrid')).strftime('%d/%m/%Y %H:%M:%S')",
  "json.dump(d, open(sys.argv[2], 'w', encoding='utf-8'), ensure_ascii=False)"].join('\n'),
  path.join(RAIZ, 'registro', 'gasolineras-canarias.json'), path.join(TMP, 'registro.json')]);
execFileSync('python3', [path.join(RAIZ, 'tools', 'precios_gasolineras.py'), '--registro', path.join(TMP, 'registro.json'),
  '--forzar', '--salida', path.join(TMP, 'precios.json')], { cwd: RAIZ });
const PRECIOS = fs.readFileSync(path.join(TMP, 'precios.json'));
/* los avisos de AEMET, con dos en pie (uno naranja en la costa y uno
   amarillo de lluvias), para que el punto del 🌊, su panel y las lineas de
   los paneles del tiempo y del mar salgan en cada idioma: tools/avisos_prueba.js */
const AVISOS = JSON.stringify(require('./avisos_prueba').ficheros().conAvisos);
fs.rmSync(TMP, { recursive: true, force: true });
const ESTADOS = `
window.__estados = [
  ['principal', async () => {}],
  ['capas', async () => { document.getElementById('layers-btn').click(); }],
  ['idiomas', async () => { document.getElementById('lang-btn').click(); }],
  ...CAT_GROUPS.map(g => ['categorias:' + g.id, async () => { toggleCategorySheet(); _activeCatTab = g.id; _buildCatSheet(); }]),
  ['filtro gasolineras', async () => { setCategory('gasolinera'); }],
  ['gasolineras cerca', async () => { abrirGasCerca(); await espera(1500); }],
  ['rutas:planner', async () => { toggleRoutePanel(); switchRouteTab('planner'); }],
  ['rutas:day', async () => { toggleRoutePanel(); switchRouteTab('day'); }],
  ['rutas:ab', async () => { toggleRoutePanel(); switchRouteTab('ab'); }],
  /* Rutas USADAS, no solo abiertas (12 de octubre de 2026): el aviso al elegir
     origen, el boton tras calcular, el mensaje de sin parada y el texto que se
     comparte del itinerario salian en castellano en los diez idiomas, y ningun
     estado de este barrido llegaba hasta ahi. */
  ['rutas:itinerario', async () => { toggleRoutePanel(); switchRouteTab('planner'); dpiSelectTime('fullday');
      document.querySelectorAll('#dpi-zone-grid .dp-zone-card').forEach(c => { if (['naturaleza', 'playa'].includes(c.dataset.zone)) dpiToggleZone(c); });
      dpiConfirmZones(); dpiSelectTransport('guagua', document.querySelector('#dpi-transport-grid .dp-time-card[data-opt="guagua"]'));
      await espera(1300);
      let c = null; const v = navigator.share; navigator.share = d => { c = d; return Promise.resolve(); };
      try { dpShare(); } catch (e) {} navigator.share = v;
      window.__extra = c ? [c.title, c.text] : []; }],
  /* Norte, Sur o «Me da igual» (13 de octubre de 2026): el paso, y un
     itinerario en el Sur con el aviso de que no hay mas (Museos: dos). */
  ['rutas:organiza, la zona', async () => { toggleRoutePanel(); switchRouteTab('planner'); dpiSelectTime('fullday');
      dpiToggleZone(document.querySelector('#dpi-zone-grid .dp-zone-card[data-zone="museo"]')); dpiConfirmZones(); }],
  ['rutas:itinerario en el Sur, sin mas lugares', async () => { toggleRoutePanel(); switchRouteTab('planner'); dpiSelectTime('fullday');
      dpiToggleZone(document.querySelector('#dpi-zone-grid .dp-zone-card[data-zone="museo"]')); dpiConfirmZones(); dpiSelectZona('sur');
      dpiSelectTransport('coche', document.querySelector('#dpi-transport-grid .dp-time-card[data-opt="coche"]'));
      await espera(1300); }],
  ['rutas:ruta del dia con paradas', async () => { toggleRoutePanel(); switchRouteTab('day'); selectDayTripZone('north');
      toggleDayTripStop('anaga'); toggleDayTripStop('ciudad-laguna'); }],
  ['rutas:A→B eligiendo origen', async () => { toggleRoutePanel(); switchRouteTab('ab'); activatePick('origin'); }],
  ['rutas:A→B calculada', async () => { await __ruta('ciudad-laguna', 'ciudad-puerto-cruz', 10 * 60); }],
  ['rutas:A→B sin parada cerca', async () => { await __ruta('teide', 'ciudad-laguna', 12 * 60); }],
  ['rutas:A→B fuera de horario', async () => { await __ruta('ciudad-puerto-cruz', 'teide-teleforico', 12 * 60); }],
  ['paradas cerca', async () => { showNearbyStops(28.4636, -16.2518); }],
  ['bus', async () => { toggleBusPanel(); }],
  ['mar', async () => { document.getElementById('mar-btn').click(); await espera(1500); }],
  ['microclimas', async () => { document.getElementById('mc-btn').click(); await espera(1500); }],
  ['avisos AEMET', async () => { await fetchWxAlerts(); toggleWxPanel(); }],
  ['fiestas', async () => { document.getElementById('fi-btn').click(); await espera(800); }],
  /* El cielo de Tenerife (17 de octubre de 2026): sus cinco pestanas, con
     el detalle de cada objeto abierto. El panel no esta hasta que se abre
     (modulos/cielo.js): TG_CIELO.ver lo carga y espera. La noche, fija: la de
     las Geminidas de 2026. */
  ...['noche', 'calendario', 'catalogo', 'mapa', 'donde'].map(t => ['cielo:' + t, async () => {
      await window.TG_CIELO_CARGAR(); await TG_CIELO.ver(t, '2026-12-13'); await espera(t === 'mapa' ? 600 : 200);
      document.querySelectorAll('#cielo-panel .cielo-item').forEach(i => i.classList.add('abierto')); }]),
  /* La ficha de un astro en la carta (20 de octubre de 2026): una estrella
     con nombre, la Luna y un objeto. Wikipedia no se pide (sin red de fuera). */
  ...[['estrella', D => ({ est: D.est.find(e => e[4] === 27989) })], ['luna', () => ({ planeta: 'Moon' })], ['objeto', D => ({ obj: D.objetos.find(o => o.id === 'M42') })]].map(([n, f]) => ['cielo:ficha ' + n, async () => {
      await window.TG_CIELO_CARGAR(); await TG_CIELO.ver('mapa', '2026-12-13'); await espera(400);
      TG_CIELO.estado.mapa.sel = f(TG_CIELO.estado.datos); await TG_CIELO.ver('mapa', '2026-12-13'); await espera(500); }]),
  /* «Apunta al cielo», con los sensores simulados apuntando al sur y 40
     grados arriba: la hoja de lo que haya en el circulo, y la busqueda. Lo
     que se ve se recoge del DOM (las designaciones van marcadas). */
  ['cielo:apunta', async () => {
      await window.TG_CIELO_CARGAR(); await TG_CIELO.cargar(); TG_CIELO.vista({ sinGuia: true }); await espera(200);
      const ev = new Event('deviceorientationabsolute'); Object.assign(ev, { alpha: 180, beta: 130, gamma: 0, absolute: true }); window.dispatchEvent(ev);
      await espera(900);
      document.querySelector('#cielo-vista .cv-nombre').click(); await espera(500); }],
  ['cielo:apunta buscar', async () => {
      await window.TG_CIELO_CARGAR(); await TG_CIELO.cargar(); TG_CIELO.vista({ sinGuia: true }); await espera(300);
      document.querySelectorAll('#cielo-vista .cv-btn')[2].click(); await espera(300); }],
  /* Lo del 21 de octubre de 2026: la guia de la brujula, la comprobacion con
     un astro (el chip y el cartel de «Ya»), las fases en el calendario y un
     aviso puesto (la tarjeta «Mis avisos» y los botones de cada evento). */
  ['cielo:apunta guia', async () => {
      await window.TG_CIELO_CARGAR(); await TG_CIELO.cargar(); try { localStorage.removeItem('tgo_cielo_guia'); } catch (e) {}
      TG_CIELO.vista({}); await espera(400); }],
  ['cielo:apunta comprobar', async () => {
      await window.TG_CIELO_CARGAR(); await TG_CIELO.cargar(); TG_CIELO.vista({ sinGuia: true }); await espera(200);
      const ev = new Event('deviceorientationabsolute'); Object.assign(ev, { alpha: 180, beta: 130, gamma: 0, absolute: true }); window.dispatchEvent(ev);
      await espera(500); TG_CIELO.comprobar(); await espera(400); }],
  ['cielo:calendario fases', async () => {
      await window.TG_CIELO_CARGAR(); TG_CIELO.estado.cal = 'luna'; await TG_CIELO.ver('calendario', '2026-12-13'); await espera(300); }],
  /* Los satelites (21 de octubre de 2026): el calendario con el filtro
     «Satelites» (los pasos de las proximas siete noches, o el aviso de que
     los elementos tienen mas de 7 dias: el texto que toque hoy), y la ficha
     de la Estacion Espacial en la carta. La tarjeta va en 'cielo:noche'. */
  ['cielo:calendario satelites', async () => {
      await window.TG_CIELO_CARGAR(); await TG_CIELO.cargar(); await TG_CIELO.satelites().catch(function () {});
      TG_CIELO.estado.cal = 'satelites'; await TG_CIELO.ver('calendario', '2026-12-13'); await espera(400); }],
  ['cielo:ficha satelite', async () => {
      await window.TG_CIELO_CARGAR(); await TG_CIELO.cargar(); await TG_CIELO.satelites().catch(function () {});
      await TG_CIELO.ver('mapa', '2026-12-13'); await espera(400);
      TG_CIELO.estado.mapa.sel = { sat: 'iss' }; await TG_CIELO.ver('mapa', '2026-12-13'); await espera(500); }],
  /* El tercer bloque del 21 de octubre: la noche guiada y el sistema solar van
     en 'cielo:noche'; aqui, el sistema solar «Hasta Neptuno» con la hoja de
     Jupiter abierta, y «Donde ir» ya lleva «Antes de subir al Teide». */
  ['cielo:sistema jupiter', async () => {
      await window.TG_CIELO_CARGAR(); await TG_CIELO.cargar();
      TG_CIELO.estado.sis.vista = 'ext'; TG_CIELO.estado.sis.sel = 'Jupiter'; await TG_CIELO.ver('noche', '2026-12-13'); await espera(500);
      const h = [...document.querySelectorAll('#cielo-panel .cielo-tarjeta h3')].find(x => /🪐/.test(x.textContent)); if (h) h.closest('.cielo-tarjeta').scrollIntoView(); await espera(200); }],
  /* El quinto bloque del 22 de octubre: la hoja de la NASA y «¿Sabias que...?»
     en la ficha de Jupiter, la curiosidad del sur en la de Canopus, las once
     lluvias del calendario con su curiosidad abierta y la fuente, y «Para
     fotos» en febrero con la luz zodiacal y la sombra del Teide. */
  ['cielo:ficha jupiter', async () => {
      await window.TG_CIELO_CARGAR(); await TG_CIELO.ver('mapa', '2026-12-13'); await espera(400);
      TG_CIELO.estado.mapa.sel = { planeta: 'Jupiter' }; await TG_CIELO.ver('mapa', '2026-12-13'); await espera(500);
      const f = document.querySelector('#cielo-panel .cielo-ficha-pl'); if (f) f.scrollIntoView(); await espera(200); }],
  ['cielo:ficha canopus', async () => {
      await window.TG_CIELO_CARGAR(); await TG_CIELO.ver('mapa', '2026-12-13'); await espera(400);
      TG_CIELO.estado.mapa.sel = { est: TG_CIELO.estado.datos.est.find(e => e[4] === 30438) }; await TG_CIELO.ver('mapa', '2026-12-13'); await espera(500);
      const f = document.querySelector('#cielo-panel .cielo-curio'); if (f) f.scrollIntoView(); await espera(200); }],
  ['cielo:calendario lluvias', async () => {
      await window.TG_CIELO_CARGAR(); TG_CIELO.estado.cal = 'lluvia'; await TG_CIELO.ver('calendario', '2026-12-13'); await espera(300);
      document.querySelectorAll('#cielo-panel .cielo-curio-cab button').forEach(b => b.click()); await espera(200); }],
  ['cielo:noche febrero', async () => {
      await window.TG_CIELO_CARGAR(); await TG_CIELO.ver('noche', '2027-02-20'); await espera(400);
      const h = [...document.querySelectorAll('#cielo-panel .cielo-tarjeta h3')].find(x => /📷/.test(x.textContent)); if (h) h.closest('.cielo-tarjeta').scrollIntoView(); await espera(200); }],
  /* El sexto bloque del 22 de octubre: las 88 constelaciones con su origen,
     su tamaño y su curiosidad. Orion en la carta (la de Wikipedia, con las
     Tres Marias y las Orionidas) y, en el catalogo de constelaciones,
     Lupus abierto (Uridim, con la pagina de su estrella como fuente). */
  ['cielo:ficha orion', async () => {
      await window.TG_CIELO_CARGAR(); await TG_CIELO.curiosidades(); await TG_CIELO.ver('mapa', '2026-12-13'); await espera(400);
      TG_CIELO.estado.mapa.sel = { con: 'Ori' }; await TG_CIELO.ver('mapa', '2026-12-13'); await espera(500);
      const f = document.querySelector('#cielo-panel .cielo-curio'); if (f) f.scrollIntoView(); await espera(200); }],
  ['cielo:catalogo lupus', async () => {
      await window.TG_CIELO_CARGAR(); await TG_CIELO.curiosidades(); TG_CIELO.estado.cat.tipo = 'constelaciones'; TG_CIELO.estado.cat.busca = 'Lup';
      await TG_CIELO.ver('catalogo', '2026-12-13'); await espera(300);
      document.querySelectorAll('#cielo-panel .cielo-item').forEach(i => i.classList.add('abierto'));
      document.querySelectorAll('#cielo-panel .cielo-curio-cab button').forEach(b => { if (b.getAttribute('aria-expanded') !== 'true') b.click(); });
      await espera(200); TG_CIELO.estado.cat.tipo = 'todo'; TG_CIELO.estado.cat.busca = ''; }],
  ['cielo:calendario avisos', async () => {
      await window.TG_CIELO_CARGAR(); TG_CIELO.estado.cal = 'todo'; await TG_CIELO.ver('calendario', '2026-12-13'); await espera(300);
      const g = TG_CIELO.eventos().find(e => e.tipo === 'lluvia' && e.l.id === 'GEM'); if (g) TG_CIELO.ponerAviso(g);
      await TG_CIELO.ver('calendario', '2026-12-13'); await espera(300); }],
  /* 'tienda' salio el 16 de octubre de 2026: la tienda no se ve
     (TIENDA_ACTIVA, LANZAMIENTO-PLAY.md 1.1). Que no se abra lo mira
     probar_play.js. */
  ['asistente', async () => { openChatPanel(); await espera(800); }],
  ['cuenta', async () => { openAuthModal(); }],
  ['favoritos', async () => { document.getElementById('v19-nav-fav').click(); }],
  ['nav rutas', async () => { document.getElementById('v19-nav-routes').click(); }],
  ['leyenda', async () => { const b = document.getElementById('map-legend-toggle'); if (b) b.click(); }],
  ['tour', async () => { window.v19StartTour(); await espera(500);
      const t = []; for (let i = 0; i < 14; i++) { t.push(document.getElementById('v19-tour').innerText); const n = document.querySelector('#v19-tour .v19t-next'); if (!n || !document.getElementById('v19-tour').classList.contains('open')) break; n.click(); await espera(250); }
      window.__extra = t; }],
];
window.espera = ms => new Promise(r => setTimeout(r, ms));
/* una ruta A→B entre dos lugares a una hora de Canarias fija (la del
   planificador de guaguas depende de la hora: sin fijarla, el barrido veria
   cosas distintas segun cuando se pase) */
window.__ruta = async (a, b, min) => {
  toggleRoutePanel(); switchRouteTab('ab'); clearRoute();
  pickingMode = 'origin'; onMarkerClickForRoute(places.find(p => p.id === a));
  pickingMode = 'dest'; onMarkerClickForRoute(places.find(p => p.id === b));
  const h = window.horaCanaria; window.horaCanaria = () => min;
  try { await calculateRoute(); } finally { window.horaCanaria = h; }
};
window.__cierra = async () => {
  for (const f of ['closeDetailSheet','closeCategorySheet','cerrarGasCerca','closeNearbyStops','closeRoutePanel','closeBusPanel','closeShopPanel','closeChatPanel','closeAuthModal']) { try { window[f] && window[f](); } catch (e) {} }
  try { map.closePopup(); } catch (e) {}
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  document.body.click();
  try { window.TG_CIELO && TG_CIELO.cerrar(); } catch (e) {}
  try { if (window.TG_CIELO) { TG_CIELO.quitarAvisos(); TG_CIELO.estado.cal = 'todo'; TG_CIELO.estado.mapa.rastro = null; } } catch (e) {}
  for (const id of ['mar-panel','mc-panel','fi-panel','wx-panel','cielo-panel']) { const e = document.getElementById(id); if (e) e.style.display = 'none'; }
  for (const s of ['#mar-close','#mc-close','#fi-close','.mar-close','.mc-close','.fi-close']) { const e = document.querySelector(s); if (e && e.offsetParent) try { e.click(); } catch (x) {} }
  try { clearAllFilters(); } catch (e) {}
  // lo que dejan los estados de rutas: la ruta, las paradas del dia, el itinerario
  try { clearRoute(); } catch (e) {}
  try { dayTripStops.splice(0); renderMyRoute(); updateDayTripBadge(); } catch (e) {}
  try { dpiReset(); } catch (e) {}
  await espera(250);
};
window.__repetido = el => {
  const t = (el.textContent || '').replace(/\\s+/g, ' ').trim();
  return /(\\p{Extended_Pictographic})\\uFE0F?\\s*\\1/u.test(t) ? t : null;
};
window.__repetidos = (raiz) => {
  const vis = el => el && (el.checkVisibility ? el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) : !!el.offsetParent);
  const out = [];
  for (const el of (raiz || document).querySelectorAll('button, a, [role=button]')) {
    if (!raiz && !vis(el)) continue;
    const t = __repetido(el);
    if (t) out.push(t);
  }
  return out;
};
window.__textos = () => {
  const vis = el => el && (el.checkVisibility ? el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) : !!el.offsetParent);
  const out = new Set();
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = w.nextNode())) {
    const el = n.parentElement;
    if (!el || /^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE)$/.test(el.tagName)) continue;
    if (el.closest('[data-sin-traducir]')) continue;
    if (!vis(el)) continue;
    const t = (n.textContent || '').replace(/\\s+/g, ' ').trim();
    if (t.length >= 2) out.add(t);
  }
  for (const el of document.querySelectorAll('[title],[aria-label],[placeholder],img[alt]')) {
    if (el.closest('[data-sin-traducir]') || !vis(el)) continue;
    for (const a of ['title', 'aria-label', 'placeholder', 'alt']) { const v = el.getAttribute(a); if (v && v.trim().length >= 2) out.add('[' + a + '] ' + v.trim()); }
  }
  return [...out];
};
`;

async function recorrer(b, L) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block',
    geolocation: { latitude: 28.4636, longitude: -16.2518 }, permissions: ['geolocation'] });
  const p = await ctx.newPage();
  const err = []; p.on('pageerror', e => err.push(e.message));
  await p.addInitScript(() => { try { localStorage.setItem('tenerife.tour.seen', '99'); localStorage.setItem('tgo_consent', JSON.stringify({ v: 'denied', t: Date.now() })); } catch (e) {} });
  await p.route('**/datos/precios-gasolineras.json', r => r.fulfill({ status: 200, contentType: 'application/json', body: PRECIOS }));
  await p.route('**/datos/avisos-aemet.json', r => r.fulfill({ status: 200, contentType: 'application/json', body: AVISOS }));
  // sin red de fuera: la ruta en coche sale con la estimacion de respaldo, igual en cada pasada
  await p.route('**/router.project-osrm.org/**', r => r.abort());
  await p.route('**/nominatim.openstreetmap.org/**', r => r.abort());
  await p.goto('http://127.0.0.1:' + PUERTO + '/index.html', { waitUntil: 'networkidle' });
  await p.waitForTimeout(600);
  await p.click('.v19-w-lang[data-lang="' + L + '"]'); await p.waitForTimeout(300);
  await p.click('#v19-welcome-start'); await p.waitForTimeout(3500);
  await p.evaluate(ESTADOS);
  const n = await p.evaluate(() => __estados.length);
  const porEstado = {}, repetidos = [];
  for (let i = 0; i < n; i++) {
    const r = await p.evaluate(async i => {
      const [nom, f] = __estados[i];
      window.__extra = null;
      try { await f(); } catch (e) { return { nom, error: String(e) }; }
      await espera(500);
      const t = __textos();
      const rep = __repetidos();
      if (window.__extra) window.__extra.forEach(x => x.split('\n').forEach(y => y.trim().length > 1 && t.push(y.trim())));
      await __cierra();
      return { nom, t, rep };
    }, i);
    if (r.error) err.push(r.nom + ': ' + r.error);
    porEstado[r.nom] = r.t || [];
    (r.rep || []).forEach(t => repetidos.push([r.nom, t]));
  }
  const fichas = await p.evaluate(async () => {
    const ids = [], vistas = new Set();
    for (const x of places) if (!vistas.has(x.category)) { vistas.add(x.category); ids.push(x.id); }
    places.filter(q => ['7677', '7951', '14353'].includes(String(q.ideess))).forEach(q => ids.push(q.id));
    const out = {}, rep = [];
    for (const id of ids) {
      const x = places.find(q => q.id === id);
      openDetailSheet(id); await espera(120);
      const t = new Set(document.getElementById('detail-sheet').innerText.split('\n').map(s => s.trim()).filter(s => s.length > 1));
      __repetidos(document.getElementById('detail-sheet')).forEach(x => rep.push(['ficha ' + id, x]));
      closeDetailSheet();
      setCategory(x.category); updateMarkers({ immediate: true });
      const m = markerMap[id];
      if (m) {
        // el globo se fabrica al abrirlo (htmlGlobo): getContent() es la funcion que lo hace
        const c0 = m.getPopup().getContent(), c = typeof c0 === 'function' ? c0(m) : c0;
        const d = document.createElement('div'); d.style.cssText = 'position:fixed;left:0;top:0;width:300px;z-index:-1';
        d.innerHTML = typeof c === 'string' ? c : c.outerHTML; document.body.appendChild(d);
        d.innerText.split('\n').map(s => s.trim()).filter(s => s.length > 1).forEach(s => t.add(s));
        __repetidos(d).forEach(x => rep.push(['globo ' + id, x]));
        d.remove();
      }
      out['ficha ' + id] = [...t];
    }
    clearAllFilters();
    return { out, rep };
  });
  Object.assign(porEstado, fichas.out);
  fichas.rep.forEach(x => repetidos.push(x));
  const nombres = await p.evaluate(() => {
    const s = new Set();
    places.forEach(x => { if (x.name) s.add(x.name); if (x.address) s.add(x.address); });
    try { TITSA_LINES.forEach(l => { s.add(l.nombre); s.add(l.numero); (l.paradas || []).forEach(q => s.add(q.nombre)); }); } catch (e) {}
    return [...s].filter(x => x && String(x).length > 2);
  });
  await ctx.close();
  return { porEstado, err, nombres, repetidos };
}

/* palabras castellanas que no son nombre propio ni palabra de otro idioma:
   sin articulos ni preposiciones, que salen en mil nombres de sitio */
const FUERTES = new Set(('más muy hoy horario abierto abierta cerrado cerrada precio precios cómo llegar lugares buscar ' +
  'todos todas mostrar mostrando cerrar ruta rutas día días aquí está están qué dónde cuándo también gasolina gasolinera ' +
  'gasolineras farmacias playas senderos miradores isla tiempo lluvia guagua guaguas parada paradas línea líneas mejor ' +
  'mejores barata baratas barato ubicación posición permiso aparcamiento baños accesible pueblo horas minutos semana desde ' +
  'hasta según después antes ahora abre cierra lunes martes miércoles jueves viernes sábado domingo enero febrero marzo ' +
  'abril mayo junio julio agosto septiembre octubre noviembre diciembre añadir quitar reservar necesario necesaria ' +
  'obligatorio obligatoria coche niños perros familia lujo volcánico histórico teleférico cumbre acantilados ' +
  /* «Toca un marcador del mapa como Origen» salio en castellano en los diez
     idiomas sin que nada cantara: sin tildes y sin ninguna palabra de esta
     lista (12 de octubre de 2026) */
  'toca marcador origen').split(' '));
/* las que tambien son palabra de ese idioma */
/* «lunes» es el plural frances de luna (las de Jupiter), no el dia de la semana (22-10-2026) */
const CHOCA = { it: ['marzo', 'agosto'], nl: ['ver'], pl: ['parada'], fr: ['lunes'] };
const LATINOS = IDI.filter(l => !['zh', 'zht', 'bg'].includes(l));

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const res = {};
  let nombres = [];
  for (const L of IDI) { res[L] = await recorrer(b, L); if (!nombres.length) nombres = res[L].nombres; }
  await b.close();

  const decl = Object.values(JSON.parse(fs.readFileSync(path.join(RAIZ, 'idiomas', 'etiquetas-sin-traducir.json'), 'utf8'))).flat();
  const acept = JSON.parse(fs.readFileSync(path.join(RAIZ, 'idiomas', 'pantalla-aceptado.json'), 'utf8'));
  const aceptado = {};
  for (const [motivo, porIdioma] of Object.entries(acept)) if (motivo !== '_')
    for (const [l, ts] of Object.entries(porIdioma)) ts.forEach(t => (aceptado[l] = aceptado[l] || new Set()).add(t));
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const N = [...new Set(nombres.concat(decl))].filter(x => x && x.length > 2).sort((a, c) => c.length - a.length);
  const trozos = []; for (let i = 0; i < N.length; i += 300) trozos.push(new RegExp(N.slice(i, i + 300).map(esc).join('|'), 'gi'));
  const sinNombres = t => { let s = t; for (const r of trozos) s = s.replace(r, ' '); return s; };

  let total = 0, errores = 0;
  const P = (t, v) => console.log('  ' + String(t).padEnd(44, '.') + ' ' + v);
  console.log('=== lo que se ve en pantalla, en los ' + IDI.length + ' idiomas ===');
  P('pantallas y fichas por idioma', Object.keys(res.es.porEstado).length);
  for (const L of IDI) {
    errores += res[L].err.length;
    const rep = new Map();
    for (const [est, t] of res[L].repetidos) { if (!rep.has(t)) rep.set(t, []); rep.get(t).push(est); }
    total += rep.size;
    P(L + ' · botones con un emoji repetido', rep.size);
    [...rep].slice(0, LISTA ? 1e9 : 8).forEach(([t, est]) => console.log('       «' + t.slice(0, 100) + '» en ' + est.slice(0, 3).join(', ') + (est.length > 3 ? ' y ' + (est.length - 3) + ' mas' : '')));
    if (L === 'es') continue;
    const malos = new Map();
    for (const [est, ts] of Object.entries(res[L].porEstado)) {
      const esSet = new Set(res.es.porEstado[est] || []);
      for (const t of ts) {
        if (aceptado[L] && aceptado[L].has(t.replace(/^\[[a-z-]+\] /, ''))) continue;
        const limpio = sinNombres(t.replace(/^\[[a-z-]+\] /, ''));
        const pal = (limpio.toLowerCase().match(/[\p{L}]+/gu) || []);
        const m = [];
        if (esSet.has(t) && /[áéíóúñ¿¡]/i.test(limpio) && pal.some(w => w.length > 3)) m.push('igual que en castellano');
        const f = [...new Set(pal.filter(w => FUERTES.has(w) && !(CHOCA[L] || []).includes(w)))];
        if (f.length) m.push('castellano: ' + f.join(','));
        if (!LATINOS.includes(L) && /[a-zäöüß]{3,}/i.test(limpio)) {
          const de = LATINOS.filter(x => x !== 'es' && res[x] && (res[x].porEstado[est] || []).includes(t));
          if (de.length) m.push('igual que en ' + de.join('/'));
        }
        if (!m.length) continue;
        if (!malos.has(t)) malos.set(t, { m: m.join(' | '), est: [] });
        malos.get(t).est.push(est);
      }
    }
    total += malos.size;
    P(L + ' · textos sin traducir', malos.size + (res[L].err.length ? '   (' + res[L].err.length + ' error(es) de pagina)' : ''));
    [...malos].slice(0, LISTA ? 1e9 : 8).forEach(([t, v]) => console.log('       «' + t.slice(0, 100) + '» [' + v.m + '] en ' + v.est.slice(0, 3).join(', ')));
    res[L].err.slice(0, 3).forEach(e => console.log('       error: ' + e));
  }
  P('total', total + ' · errores de pagina ' + errores);
  process.exit(total || errores ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
