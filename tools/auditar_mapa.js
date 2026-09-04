#!/usr/bin/env node
/* El mapa sin conexion, bloque a bloque.
 *
 *   python3 -m http.server 8766 & node tools/auditar_mapa.js [puerto]
 *
 * BLOQUE 1 - el motor: que las dos piezas de vendor/ cargan con la version de
 * Leaflet que usa la app, exponen lo que hace falta, no piden nada a la red y
 * el service worker las guarda desde el primer arranque. Sin conexion no se
 * puede ir a buscar el motor del mapa: o esta precargado, o no hay mapa.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const RAIZ = path.dirname(__dirname);
const PUERTO = process.argv[2] || 8766;
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

let fallos = 0, hechos = 0;
function ok(cond, txt, detalle) {
  hechos++;
  if (cond) console.log('  OK  ' + txt);
  else { fallos++; console.log('  MAL ' + txt + (detalle !== undefined ? '   -> ' + detalle : '')); }
}

(async () => {
  console.log('\n════════ mapa sin conexion · bloque 1, el motor ════════\n');

  const sw = fs.readFileSync(path.join(RAIZ, 'sw.js'), 'utf8');
  for (const f of ['vendor/pmtiles.js', 'vendor/protomaps-leaflet.js']) {
    ok(fs.existsSync(path.join(RAIZ, f)), 'existe ' + f);
    ok(sw.includes("'./" + f + "'"), 'el service worker precarga ' + f);
  }
  ok(fs.existsSync(path.join(RAIZ, 'vendor/LICENSE-protomaps.txt')),
     'la licencia BSD-3 de Protomaps viaja con los ficheros');

  /* Nada de esto puede pedir a la red por su cuenta: un Worker, un eval o un
     import dinamico dejarian el mapa muerto sin conexion, y ademas la CSP de
     la app no los deja pasar. */
  for (const f of ['vendor/pmtiles.js', 'vendor/protomaps-leaflet.js']) {
    const t = fs.readFileSync(path.join(RAIZ, f), 'utf8');
    ok(!/new Worker\(|new Function\(|[^.\w]eval\(/.test(t), f + ' no usa Worker, Function ni eval');
  }

  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-proxy-server', '--no-sandbox']
  });
  try {
    const page = await browser.newPage();
    const errores = [];
    page.on('pageerror', e => errores.push(e.message));
    const fuera = [];
    page.on('request', r => { const u = new URL(r.url()); if (u.hostname !== '127.0.0.1') fuera.push(r.url()); });

    await page.setContent(`
      <link rel="stylesheet" href="http://127.0.0.1:${PUERTO}/vendor/leaflet.css">
      <div id="m" style="width:400px;height:300px"></div>
      <script src="http://127.0.0.1:${PUERTO}/vendor/leaflet.js"><\/script>
      <script src="http://127.0.0.1:${PUERTO}/vendor/pmtiles.js"><\/script>
      <script src="http://127.0.0.1:${PUERTO}/vendor/protomaps-leaflet.js"><\/script>
    `, { waitUntil: 'networkidle' });

    const r = await page.evaluate(() => ({
      leaflet: typeof L !== 'undefined' ? L.version : null,
      pmtiles: typeof pmtiles !== 'undefined' ? Object.keys(pmtiles).sort() : null,
      pl:      typeof protomapsL !== 'undefined' ? Object.keys(protomapsL) : null
    }));

    ok(r.leaflet && r.leaflet.indexOf('1.9') === 0, 'Leaflet 1.9.x, que es con la que se ha probado', r.leaflet);
    ok(!!r.pmtiles && r.pmtiles.includes('PMTiles'), 'pmtiles expone PMTiles', r.pmtiles && r.pmtiles.join(','));
    // La fuente propia es lo que permitira leer el mapa guardado en el movil
    // en vez de pedirlo por rangos a la red.
    ok(!!r.pmtiles && r.pmtiles.includes('FetchSource'), 'pmtiles expone FetchSource (el molde de una fuente propia)',
       r.pmtiles && r.pmtiles.join(','));
    for (const k of ['leafletLayer', 'PmtilesSource', 'paintRules', 'labelRules'])
      ok(!!r.pl && r.pl.includes(k), 'protomapsL expone ' + k);
    ok(errores.length === 0, 'cargan sin un solo error de pagina', errores.join(' | '));
    ok(fuera.length === 0, 'no piden nada fuera del propio origen', fuera.join(' | '));
  } finally {
    await browser.close();
  }

  console.log('\n  ' + (fallos ? fallos + ' MAL de ' + hechos : hechos + ' controles, todos en verde') + '\n');
  process.exit(fallos ? 1 : 0);
})();
