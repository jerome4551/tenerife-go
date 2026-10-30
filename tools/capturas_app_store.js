#!/usr/bin/env node
/* capturas_app_store.js — las capturas de pantalla para la App Store, de la
 * app de verdad en un navegador, en los tamanos que App Store Connect pide
 * (developer.apple.com/help/app-store-connect/reference/screenshot-specifications/,
 * leido el 21 de octubre de 2026):
 *   · iPhone con Dynamic Island (pantalla mediana), la OBLIGATORIA:
 *     1206 x 2622 (402 x 874 a 3x);
 *   · iPad de 13", obligatoria si la app va en iPad: 2064 x 2752 (1032 x 1376 a 2x).
 * PNG sin transparencia, hasta diez por tamano. Sin montaje ni rotulos: lo
 * que se ve es la app tal cual (los rotulos, si Jerome los quiere, se ponen
 * encima despues). La noche del cielo es fija (la de las Geminidas de 2026),
 * y el plan de «Organice su dia» tambien (la suerte, fija), para que las
 * capturas sean las mismas en cada pasada y en los diez idiomas; los avisos
 * de AEMET y los precios salen de las copias de prueba, como en
 * barrido_pantallas.js.
 *
 * El puerto sirve app/www/ (la app de la tienda, con la marca), no la raiz,
 * que es la web: sin el mapa detallado dentro y con el boton flotante de la
 * PWA (ⓘ, «Informacion de la app»). Si la pagina no lleva la marca, para.
 *     node tools/app_preparar.js && python3 -m http.server 8766 --directory app/www &
 *     node tools/capturas_app_store.js 8766                 es y en
 *     node tools/capturas_app_store.js 8766 --idiomas=todos  los diez
 *     node tools/capturas_app_store.js 8766 --idiomas=fr,de
 *     node tools/capturas_app_store.js 8766 --idiomas=todos --solo=ficha   solo ese estado (el numero se conserva)
 *
 * Deja capturas-app-store/<idioma>/<aparato>-<n>-<estado>.png (fuera de git).
 *
 * --play (30 de octubre de 2026): las de Google Play, de los mismos estados.
 * Play no acepta las del iPhone (de 320 a 3840 px por lado, y el lado largo
 * no puede pasar del doble del corto; PNG de 24 bits sin transparencia): un
 * movil de 432 x 768 a 2,5x, 1080 x 1920, el tamano que se suele recomendar.
 * Van a capturas-google-play/<idioma>/ (fuera de git). La app de Play es la web dentro de Chrome, instalada: se ve igual
 * que app/www/ (sin el banner de instalar ni el boton de la PWA).
 *     node tools/capturas_app_store.js 8766 --play --idiomas=es,en
 */
'use strict';
const fs = require('fs');
const path = require('path');
/* Playwright y su Chromium: los de esta maquina, o los que diga TGO_PLAYWRIGHT
   (en GitHub Actions, el paquete instalado con `npx playwright install chromium`) */
const { chromium } = require(process.env.TGO_PLAYWRIGHT || '/opt/node22/lib/node_modules/playwright');
const CHROMIUM = fs.existsSync('/opt/pw-browsers/chromium') && !process.env.TGO_PLAYWRIGHT ? '/opt/pw-browsers/chromium' : undefined;

const RAIZ = path.join(__dirname, '..');
const PUERTO = process.argv[2] || '8766';
const PLAY = process.argv.includes('--play');
const SALIDA = path.join(RAIZ, PLAY ? 'capturas-google-play' : 'capturas-app-store');
const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
const TODOS = ((html.match(/SUPPORTED_LANGS\s*=\s*\[([^\]]*)\]/) || [, ''])[1]).split(',').map(x => x.trim().replace(/['"]/g, '')).filter(Boolean);
const arg = (process.argv.find(a => a.startsWith('--idiomas=')) || '').slice(10);
const IDIOMAS = !arg ? ['es', 'en'] : arg === 'todos' ? TODOS : arg.split(',');
const SOLO = (process.argv.find(a => a.startsWith('--solo=')) || '').slice(7).split(',').filter(Boolean);
const AVISOS = JSON.stringify(require('./avisos_prueba').ficheros().conAvisos);

const APARATOS = PLAY ? [{ nombre: 'android', viewport: { width: 432, height: 768 }, escala: 2.5, movil: true }] : [
  { nombre: 'iphone', viewport: { width: 402, height: 874 }, escala: 3, movil: true },
  { nombre: 'ipad', viewport: { width: 1032, height: 1376 }, escala: 2, movil: true },
];
/* los estados: lo que mejor cuenta la app, en el orden en que la tienda los ensena */
const ESTADOS = `window.__capturas = [
  ['mapa', async () => { setCategory('playa'); await espera(800); try { map.setView([28.29, -16.55], 10, { animate: false }); } catch (e) {} await espera(1200); }],
  /* la ficha: en el movil, la hoja; en el iPad (>= 768 px) openDetailSheet no
     hace nada y lo que se ve es el globo del lugar: goToPlace abre lo que toque */
  ['ficha', async () => { setCategory('playa'); updateMarkers({ immediate: true });
      if (window.innerWidth < 768) openDetailSheet('teresitas'); else goToPlace('teresitas');
      await espera(1800);
      const hoja = document.getElementById('detail-sheet'), globo = document.querySelector('.leaflet-popup');
      if (!((hoja && hoja.getBoundingClientRect().height > 100 && /Teresitas/.test(hoja.innerText)) || (globo && /Teresitas/.test(globo.innerText)))) throw new Error('la ficha de Las Teresitas no esta a la vista'); }],
  ['guaguas', async () => { showNearbyStops(28.4636, -16.2518); await espera(1500); }],
  /* «Organice su dia» elige al azar (Math.random), y cada idioma salia con
     otro plan, alguno con lo que no se ensena: el 30 de octubre de 2026, en
     polaco, a comer en la Bodega Frontos, que su ficha da por cerrada al
     publico, y en castellano, el mirador de Las Teresitas, cerrado. Con la
     suerte fija, el mismo plan en los diez idiomas y en cada pasada: medio
     dia, Naturaleza y Playa, en guagua, semilla 67 (los Lajiales de Fasnia;
     en la 111, 42 minutos, a comer al Café al Mar de Porís de Abona; y a pie,
     su embarcadero y la Playa Grande de Abades: arriba se ven la linea y la
     pausa para comer). Si con otros datos sale un lugar con aviso (⚠️), un
     tramo sin guagua o el plan sin comida, para: otra semilla. */
  ['organiza', async () => { toggleRoutePanel(); switchRouteTab('planner'); dpiSelectTime('halfday');
      document.querySelectorAll('#dpi-zone-grid .dp-zone-card').forEach(c => { if (['naturaleza', 'playa'].includes(c.dataset.zone)) dpiToggleZone(c); });
      dpiConfirmZones();
      const generar = dpiGenerate, azar = Math.random;
      window.dpiGenerate = () => {
        let a = 67;   // mulberry32
        Math.random = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
        try { generar(); } finally { Math.random = azar; }
      };
      dpiSelectTransport('guagua', document.querySelector('#dpi-transport-grid .dp-time-card[data-opt="guagua"]')); await espera(1500);
      const conAviso = dpCurrentStops.filter(x => /^⚠️/.test((x.desc && x.desc.es) || '')).map(x => x.name);
      const tramos = [...document.querySelectorAll('#dpi-itinerary .dp-sep-text')].map(e => e.textContent.trim());
      if (conAviso.length || !tramos.length || tramos.some(t => !/~[0-9]+/.test(t)) || !dpCurrentStops.some(dpEsComida))
        throw new Error('el plan fijo de «Organice su dia» ya no vale (semilla 67): ' + (conAviso.join(', ') || (dpCurrentStops.some(dpEsComida) ? tramos.join(' / ') : 'sin comida'))); }],
  ['cielo', async () => { await window.TG_CIELO_CARGAR(); await TG_CIELO.cargar(); await TG_CIELO.satelites().catch(function () {});
      await TG_CIELO.ver('noche', '2026-12-13'); await espera(800); }],
  ['apunta', async () => { await window.TG_CIELO_CARGAR(); await TG_CIELO.cargar(); const VS = TG_CIELO.vista({ sinGuia: true }); await espera(300); for (let i = 0; i < 100 && !VS.tipoEv && !VS.sinSensor; i++) await espera(20);   // espera a que la vista escuche
      const ev = new Event('deviceorientationabsolute'); Object.assign(ev, { alpha: 180, beta: 130, gamma: 0, absolute: true }); window.dispatchEvent(ev); await espera(1200); }],
  ['sistema', async () => { await window.TG_CIELO_CARGAR(); await TG_CIELO.cargar();
      TG_CIELO.estado.sis.vista = 'ext'; TG_CIELO.estado.sis.sel = 'Jupiter'; await TG_CIELO.ver('noche', '2026-12-13'); await espera(500);
      const h = [...document.querySelectorAll('#cielo-panel .cielo-tarjeta h3')].find(x => /🪐/.test(x.textContent)); if (h) h.closest('.cielo-tarjeta').scrollIntoView(); await espera(400); }],
];
window.espera = ms => new Promise(r => setTimeout(r, ms));`;

(async () => {
  const browser = await chromium.launch({ executablePath: CHROMIUM,
    args: ['--no-proxy-server', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
  let n = 0;
  try {
    for (const L of IDIOMAS) {
      for (const ap of APARATOS) {
        const ctx = await browser.newContext({ viewport: ap.viewport, deviceScaleFactor: ap.escala, isMobile: ap.movil, hasTouch: true, serviceWorkers: 'block',
          geolocation: { latitude: 28.4636, longitude: -16.2518 }, permissions: ['geolocation', 'camera', 'accelerometer', 'gyroscope', 'magnetometer'] });   // los sensores, para «Apunte al cielo»
        const p = await ctx.newPage();
        await p.addInitScript(() => { try { localStorage.setItem('tenerife.tour.seen', '99'); localStorage.setItem('tgo_consent', JSON.stringify({ v: 'denied', t: Date.now() })); localStorage.setItem('tgo_cielo_guia', '1'); } catch (e) {} });
        await p.route('**/datos/avisos-aemet.json', r => r.fulfill({ status: 200, contentType: 'application/json', body: AVISOS }));
        await p.route('**/router.project-osrm.org/**', r => r.abort());
        await p.route('**/nominatim.openstreetmap.org/**', r => r.abort());
        /* cada estado arranca de una pagina recien abierta (los paneles se
           solapan): la bienvenida en su idioma y el mapa de la isla que viaja
           dentro (las teselas de OSM no llegan desde aqui; la isla es la que
           se ve sin red, y es un rasgo de la app) */
        const arrancar = async () => {
          await p.goto('http://127.0.0.1:' + PUERTO + '/index.html', { waitUntil: 'networkidle' });
          if (!(await p.evaluate(() => window.TGO_NATIVO === true))) {
            console.error('  el puerto ' + PUERTO + ' no sirve app/www/ (la app con la marca): las capturas serian de la web. '
              + 'node tools/app_preparar.js y servir app/www/');
            process.exit(1);
          }
          await p.waitForTimeout(600);
          await p.click('.v19-w-lang[data-lang="' + L + '"]'); await p.waitForTimeout(300);
          await p.click('#v19-welcome-start'); await p.waitForTimeout(3000);
          await p.evaluate(async () => { setStyle('isla'); await new Promise(r => setTimeout(r, 400)); setStyle('isla'); });
          await p.waitForTimeout(1500);
          /* el aviso de «abriendo el mapa de la isla» ya no hace falta en la foto; y la isla entera a la vista */
          await p.evaluate(() => { const m = document.getElementById('layer-msg'); if (m) m.style.display = 'none';
            try { map.fitBounds([[27.99, -16.93], [28.60, -16.11]], { padding: [20, 20], animate: false }); } catch (e) {} });
          await p.waitForTimeout(600);
          await p.evaluate(ESTADOS);
        };
        await arrancar();
        const dir = path.join(SALIDA, L); fs.mkdirSync(dir, { recursive: true });
        const cuantos = await p.evaluate(() => __capturas.length);
        let primero = true;
        for (let i = 0; i < cuantos; i++) {
          if (SOLO.length && !SOLO.includes(await p.evaluate(i => __capturas[i][0], i))) continue;
          if (!primero) await arrancar();
          primero = false;
          /* si un estado no llega a lo que dice (p. ej. la ficha no se abre), se para: una captura con otro nombre no vale */
          const nombre = await p.evaluate(async i => { const [nom, f] = __capturas[i]; await f(); return nom; }, i)
            .catch(e => { console.error('  ' + L + ' ' + ap.nombre + ': el estado ' + (i + 1) + ' falla: ' + e.message); process.exit(1); });
          const f = path.join(dir, ap.nombre + '-' + (i + 1) + '-' + nombre + '.png');
          await p.screenshot({ path: f, type: 'png' });
          n++;
        }
        await ctx.close();
        console.log('  ' + L + ' ' + ap.nombre + ': ' + (SOLO.length ? SOLO.length : cuantos) + ' capturas (' + ap.viewport.width * ap.escala + '×' + ap.viewport.height * ap.escala + ')');
      }
    }
  } finally { await browser.close(); }
  console.log(n + ' capturas en ' + SALIDA);
})().catch(e => { console.error(e); process.exit(2); });
