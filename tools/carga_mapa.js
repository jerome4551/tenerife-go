#!/usr/bin/env node
/* carga_mapa.js — cuanto se espera al mapa de detalle, por ancho de banda.
 *
 *     python3 -m http.server 8830 --bind 127.0.0.1 &
 *     node tools/carga_mapa.js 8830
 *
 * POR QUE ESTO Y NO UNA PRUEBA DE CAMPO
 *   La decision "z14 o z15" se dejo esperando a medir la carga en 5G y en una
 *   barra. Chromium estrangula la red de verdad por CDP, asi que la medida se
 *   puede hacer aqui y no hace falta subir a Anaga con el movil.
 *
 * LO QUE MIDE, SEPARADO A PROPOSITO
 *   bajada  — transferir el fichero entero. La app lo necesita COMPLETO antes
 *             de pintar nada: se monta un Blob y de ahi sale el PMTiles.
 *   montaje — leer la cabecera y construir el lector sobre el Blob. Sale ~3 ms,
 *             o sea que la espera es transferencia y nada mas.
 *
 * z15 VA POR REGLA DE TRES, Y ESO TIENE UNA TRAMPA
 *   El 24,5 MB de z15 no esta medido en ninguna parte: es un numero recordado.
 *   La columna z15 es la bajada de z14 multiplicada por 24,5/11,43 = 2,14, asi
 *   que hereda esa incertidumbre. Para saberlo de verdad hay que lanzar el
 *   workflow con maxzoom=15 y solo_probar=true, que da el tamano sin commitear.
 */
'use strict';
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const PUERTO = process.argv[2] || 8830;
const BYTES = require('fs').statSync(__dirname + '/../mapa/tenerife-osm.pmtiles').size;
const RAZON_Z15 = 24.5 / (BYTES / 1048576);
const REDES = [['5G bueno', 100], ['5G normal', 50], ['4G bueno', 20],
               ['4G flojo', 5], ['una barra', 2], ['muy mala señal', 0.5]];

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
                                    args: ['--no-proxy-server', '--no-sandbox'] });
  console.log('fichero: ' + (BYTES / 1048576).toFixed(2) + ' MB · razon z15 estimada: ×' + RAZON_Z15.toFixed(2) + '\n');
  console.log('red'.padEnd(16) + 'Mbps'.padStart(6) + 'z14 real'.padStart(12) + 'z15 (regla 3)'.padStart(16) + 'montaje'.padStart(10));
  console.log('-'.repeat(60));
  for (const [nom, mbps] of REDES) {
    const ctx = await b.newContext({ serviceWorkers: 'block' });
    const p = await ctx.newPage();
    await p.goto('http://127.0.0.1:' + PUERTO + '/index.html', { waitUntil: 'domcontentloaded' });
    const cdp = await ctx.newCDPSession(p);
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', {
      offline: false, latency: 50,
      downloadThroughput: mbps * 1e6 / 8, uploadThroughput: mbps * 1e6 / 8 });
    const r = await p.evaluate(async () => {
      const t0 = performance.now();
      const blob = await (await fetch('/mapa/tenerife-osm.pmtiles')).blob();
      const t1 = performance.now();
      const fuente = { getKey: () => 'x',
        getBytes: (o, n) => blob.slice(o, o + n).arrayBuffer().then(d => ({ data: d })) };
      await new pmtiles.PMTiles(fuente).getHeader();
      return { bajada: t1 - t0, montaje: performance.now() - t1 };
    });
    const seg = s => (s / 1000).toFixed(1) + ' s';
    console.log(nom.padEnd(16) + String(mbps).padStart(6) +
                seg(r.bajada).padStart(12) + seg(r.bajada * RAZON_Z15).padStart(16) +
                (r.montaje.toFixed(0) + ' ms').padStart(10));
    await ctx.close();
  }
  await b.close();
})();
