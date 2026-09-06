#!/usr/bin/env node
/* verificar_estilo.js — ¿este .pmtiles se ve con el estilo que lleva la app?
 *
 *   node tools/verificar_estilo.js ruta/al/fichero.pmtiles
 *
 * POR QUE NO SE COMPARAN VERSIONES
 *   Los builds de Protomaps y el paquete de estilos avanzan por su cuenta. Si
 *   no son de la misma generacion, el mapa sale EN BLANCO sin dar ningun
 *   error: el estilo busca capas que el fichero no tiene y no pinta nada.
 *
 *   Mirar el numero de version no vale: no siempre esta en los metadatos, y
 *   aunque este no dice lo que importa. Lo que importa es si ESE fichero con
 *   ESTE estilo dibuja algo, asi que se mide directamente.
 *
 * COMO SE MIDE
 *   Se monta la capa igual que index.html —vendor/protomaps-leaflet.js, un
 *   PMTiles sobre Blob, flavor 'light'— sobre varios puntos de Tenerife, y se
 *   cuentan los pixeles que NO son el color de fondo. Un mapa en blanco da
 *   cero: es exactamente el sintoma que se quiere cazar, medido tal cual.
 */
'use strict';
const fs = require('fs');
const http = require('http');
const path = require('path');
const RAIZ = path.dirname(__dirname);
/* Playwright y Chromium se buscan en dos sitios: las rutas de este contenedor
   y la instalacion normal. Asi el mismo fichero vale aqui y en el runner de
   GitHub Actions, que es donde se genera el mapa de verdad porque tiene la
   salida a red que aqui falta. */
const AQUI = '/opt/node22/lib/node_modules/playwright';
const CHROME_AQUI = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
let chromium;
try { chromium = require(AQUI).chromium; }
catch (e) { chromium = require('playwright').chromium; }
const lanzar = {
  args: ['--no-proxy-server', '--no-sandbox', '--disable-dev-shm-usage']
};
if (fs.existsSync(CHROME_AQUI)) lanzar.executablePath = CHROME_AQUI;

const PUNTOS = [
  { n: 'La Laguna', lat: 28.487, lng: -16.315, z: 14 },
  { n: 'Anaga',     lat: 28.545, lng: -16.235, z: 13 },
  { n: 'La Orotava',lat: 28.390, lng: -16.523, z: 13 },
  { n: 'la isla',   lat: 28.290, lng: -16.560, z: 10 }
];
const MINIMO = 0.5;   // % de pixeles pintados por debajo del cual es un mapa en blanco

(async () => {
  const fichero = process.argv[2];
  if (!fichero || !fs.existsSync(fichero)) {
    console.log('Uso: node tools/verificar_estilo.js ruta/al/fichero.pmtiles');
    process.exit(1);
  }
  const datos = fs.readFileSync(fichero);
  const vendor = f => fs.readFileSync(path.join(RAIZ, 'vendor', f));

  // servidor propio: asi el script vale suelto, sin montar nada aparte
  const srv = http.createServer((req, res) => {
    const u = req.url.split('?')[0];
    try {
      if (u === '/f.pmtiles') { res.writeHead(200, { 'Content-Type': 'application/octet-stream' }); return res.end(datos); }
      if (u.startsWith('/vendor/')) { res.writeHead(200, { 'Content-Type': u.endsWith('.css') ? 'text/css' : 'application/javascript' }); return res.end(vendor(path.basename(u))); }
      /* La pagina se sirve desde aqui y no con setContent: con setContent el
         documento queda en about:blank, y entonces pedir el .pmtiles es una
         peticion de otro origen que CORS tumba. */
      if (u === '/' ) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end('<!doctype html><meta charset="utf-8">'
          + '<link rel="stylesheet" href="/vendor/leaflet.css">'
          + '<style>html,body{margin:0}#m{width:500px;height:400px}</style><div id="m"></div>'
          + '<script src="/vendor/leaflet.js"><\/script>'
          + '<script src="/vendor/pmtiles.js"><\/script>'
          + '<script src="/vendor/protomaps-leaflet.js"><\/script>');
      }
    } catch (e) {}
    res.writeHead(404); res.end();
  });
  await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const puerto = srv.address().port;

  const browser = await chromium.launch(lanzar);
  let fallos = 0;
  try {
    const page = await browser.newPage({ viewport: { width: 500, height: 400 } });
    const errores = [];
    page.on('pageerror', e => errores.push(e.message));
    await page.goto('http://127.0.0.1:' + puerto + '/', { waitUntil: 'networkidle' });

    const cab = await page.evaluate(async () => {
      const blob = await (await fetch('/f.pmtiles')).blob();
      window.__blob = blob;
      const pm = new pmtiles.PMTiles({
        getKey: () => 'f',
        getBytes: (o, n) => blob.slice(o, o + n).arrayBuffer().then(d => ({ data: d }))
      });
      const h = await pm.getHeader();
      // la capa, montada EXACTAMENTE como en index.html
      window.__capa = protomapsL.leafletLayer({ url: pm, flavor: 'light', lang: 'es' });
      window.__map = L.map('m', { zoomControl: false, attributionControl: false });
      window.__capa.addTo(window.__map);
      return { minZoom: h.minZoom, maxZoom: h.maxZoom, bytes: blob.size };
    });

    // Node no entiende %-11s ni %.1f: eso es printf, no util.format.
    console.log('\n' + fichero + '  ·  ' + (cab.bytes / 1e6).toFixed(1) + ' MB  ·  z'
                + cab.minZoom + ' a z' + cab.maxZoom + '\n');
    console.log('  Se dibuja con vendor/protomaps-leaflet.js y flavor "light",');
    console.log('  igual que en la app. Se cuentan los pixeles no-fondo.\n');

    for (const p of PUNTOS) {
      const z = Math.min(p.z, cab.maxZoom);
      const r = await page.evaluate(async (o) => {
        window.__map.setView([o.lat, o.lng], o.z);
        await new Promise(r => setTimeout(r, 2500));
        const cs = document.querySelectorAll('#m canvas');
        /* El fondo se toma del color que declara el propio estilo, no del
           primer pixel: el primer pixel puede caer justo encima de una
           carretera y entonces se estaria comparando contra ella. */
        const hex = (window.__capa.backgroundColor || '#cccccc').replace('#', '');
        const fondo = [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
        let total = 0, pintados = 0;
        for (const c of cs) {
          const g = c.getContext('2d');
          if (!g || !c.width) continue;
          const d = g.getImageData(0, 0, c.width, c.height).data;
          for (let i = 0; i < d.length; i += 4) {
            total++;
            if (Math.abs(d[i] - fondo[0]) + Math.abs(d[i+1] - fondo[1]) + Math.abs(d[i+2] - fondo[2]) > 12) pintados++;
          }
        }
        return { lienzos: cs.length, total, pintados, fondo: fondo.join(',') };
      }, { lat: p.lat, lng: p.lng, z });
      const pct = r.total ? (r.pintados * 100 / r.total) : 0;
      const bien = pct >= MINIMO;
      if (!bien) fallos++;
      console.log('  ' + (bien ? 'OK ' : 'MAL') + ' ' + p.n.padEnd(11)
                  + ' z' + String(z).padEnd(3) + String(r.lienzos).padStart(2) + ' lienzos  '
                  + pct.toFixed(2).padStart(6) + ' % pintado');
    }
    if (errores.length) { fallos++; console.log('\n  MAL excepciones: ' + errores.slice(0, 3).join(' | ')); }
  } finally {
    await browser.close();
    srv.close();
  }

  console.log('\n' + '-'.repeat(60));
  if (fallos) {
    console.log('MAPA EN BLANCO en ' + fallos + ' punto(s). Este fichero con este estilo no se ve:');
    console.log('el esquema del build y el del estilo no son de la misma generacion.');
  } else {
    console.log('SE VE. El esquema del fichero y el estilo de la app se entienden.');
  }
  process.exit(fallos ? 1 : 0);
})();
