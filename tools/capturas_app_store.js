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
 * encima despues). La noche del cielo es fija (la de las Geminidas de 2026)
 * para que las capturas sean las mismas en cada pasada; los avisos de AEMET
 * y los precios salen de las copias de prueba, como en barrido_pantallas.js.
 *
 *     node tools/capturas_app_store.js 8766                 es y en
 *     node tools/capturas_app_store.js 8766 --idiomas=todos  los diez
 *     node tools/capturas_app_store.js 8766 --idiomas=fr,de
 *
 * Deja capturas-app-store/<idioma>/<aparato>-<n>-<estado>.png (fuera de git).
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const RAIZ = path.join(__dirname, '..');
const PUERTO = process.argv[2] || '8766';
const SALIDA = path.join(RAIZ, 'capturas-app-store');
const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
const TODOS = ((html.match(/SUPPORTED_LANGS\s*=\s*\[([^\]]*)\]/) || [, ''])[1]).split(',').map(x => x.trim().replace(/['"]/g, '')).filter(Boolean);
const arg = (process.argv.find(a => a.startsWith('--idiomas=')) || '').slice(10);
const IDIOMAS = !arg ? ['es', 'en'] : arg === 'todos' ? TODOS : arg.split(',');
const AVISOS = JSON.stringify(require('./avisos_prueba').ficheros().conAvisos);

const APARATOS = [
  { nombre: 'iphone', viewport: { width: 402, height: 874 }, escala: 3, movil: true },
  { nombre: 'ipad', viewport: { width: 1032, height: 1376 }, escala: 2, movil: true },
];
/* los estados: lo que mejor cuenta la app, en el orden en que la tienda los ensena */
const ESTADOS = `window.__capturas = [
  ['mapa', async () => { setCategory('playa'); await espera(800); try { map.setView([28.29, -16.55], 10, { animate: false }); } catch (e) {} await espera(1200); }],
  ['ficha', async () => { openDetailSheet('teresitas'); await espera(800); }],
  ['guaguas', async () => { showNearbyStops(28.4636, -16.2518); await espera(1500); }],
  ['organiza', async () => { toggleRoutePanel(); switchRouteTab('planner'); dpiSelectTime('fullday');
      document.querySelectorAll('#dpi-zone-grid .dp-zone-card').forEach(c => { if (['naturaleza', 'playa'].includes(c.dataset.zone)) dpiToggleZone(c); });
      dpiConfirmZones(); dpiSelectTransport('guagua', document.querySelector('#dpi-transport-grid .dp-time-card[data-opt="guagua"]')); await espera(1500); }],
  ['cielo', async () => { await window.TG_CIELO_CARGAR(); await TG_CIELO.cargar(); await TG_CIELO.satelites().catch(function () {});
      await TG_CIELO.ver('noche', '2026-12-13'); await espera(800); }],
  ['apunta', async () => { await window.TG_CIELO_CARGAR(); await TG_CIELO.cargar(); TG_CIELO.vista({ sinGuia: true }); await espera(300);
      const ev = new Event('deviceorientationabsolute'); Object.assign(ev, { alpha: 180, beta: 130, gamma: 0, absolute: true }); window.dispatchEvent(ev); await espera(1200); }],
  ['sistema', async () => { await window.TG_CIELO_CARGAR(); await TG_CIELO.cargar();
      TG_CIELO.estado.sis.vista = 'ext'; TG_CIELO.estado.sis.sel = 'Jupiter'; await TG_CIELO.ver('noche', '2026-12-13'); await espera(500);
      const h = [...document.querySelectorAll('#cielo-panel .cielo-tarjeta h3')].find(x => /🪐/.test(x.textContent)); if (h) h.closest('.cielo-tarjeta').scrollIntoView(); await espera(400); }],
];
window.espera = ms => new Promise(r => setTimeout(r, ms));`;

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-proxy-server', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
  let n = 0;
  try {
    for (const L of IDIOMAS) {
      for (const ap of APARATOS) {
        const ctx = await browser.newContext({ viewport: ap.viewport, deviceScaleFactor: ap.escala, isMobile: ap.movil, hasTouch: true, serviceWorkers: 'block',
          geolocation: { latitude: 28.4636, longitude: -16.2518 }, permissions: ['geolocation', 'camera'] });
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
        for (let i = 0; i < cuantos; i++) {
          if (i > 0) await arrancar();
          const nombre = await p.evaluate(async i => { const [nom, f] = __capturas[i]; await f(); return nom; }, i);
          const f = path.join(dir, ap.nombre + '-' + (i + 1) + '-' + nombre + '.png');
          await p.screenshot({ path: f, type: 'png' });
          n++;
        }
        await ctx.close();
        console.log('  ' + L + ' ' + ap.nombre + ': ' + cuantos + ' capturas (' + ap.viewport.width * ap.escala + '×' + ap.viewport.height * ap.escala + ')');
      }
    }
  } finally { await browser.close(); }
  console.log(n + ' capturas en ' + SALIDA);
})().catch(e => { console.error(e); process.exit(2); });
