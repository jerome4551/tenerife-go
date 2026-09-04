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

  /* ── BLOQUE 2 · el mapa base que viaja dentro de la app ──

     Lo genera tools/mapa_base.py con datos que ya estaban en el repositorio:
     la costa de GSHHG, los `via` de las 183 lineas y los nucleos de places[].
     No se descarga nada de fuera y no se inventa ninguna coordenada. */
  console.log('\n════════ mapa sin conexion · bloque 2, el mapa base ════════\n');

  const MAPA = 'mapa/tenerife-base.pmtiles';
  const hay = fs.existsSync(path.join(RAIZ, MAPA));
  ok(hay, 'existe ' + MAPA);
  if (hay) {
    const bytes = fs.statSync(path.join(RAIZ, MAPA)).size;
    ok(bytes < 4e6, 'cabe en el precache sin que duela (' + (bytes / 1e6).toFixed(1) + ' MB)', bytes);
    ok(sw.includes("'./" + MAPA + "'"), 'el service worker lo precarga: sin eso no hay mapa en el monte');
    /* Reproducible: se comprueba sobre el fichero, no sobre el generador.
       gzip mete la hora dentro de cada bloque, y dos de ellos -el directorio
       raiz y los metadatos- los comprime la libreria pmtiles por su cuenta.
       Si alguno lleva hora, regenerar da 1,1 MB de diff binario sin que haya
       cambiado un solo dato. La falsa alarma es despreciable: la posibilidad
       de que 1f 8b 08 salga por azar en 1 MB es de 0,06 veces. */
    const bin = fs.readFileSync(path.join(RAIZ, MAPA));
    let bloques = 0, conHora = 0;
    for (let i = 0; i + 8 < bin.length; i++) {
      if (bin[i] === 0x1f && bin[i + 1] === 0x8b && bin[i + 2] === 0x08) {
        bloques++;
        if (bin.readUInt32LE(i + 4) !== 0) conHora++;
      }
    }
    ok(bloques > 100 && conHora === 0,
       'ningun bloque gzip lleva la hora dentro: regenerar da el mismo fichero',
       bloques + ' bloques, ' + conHora + ' con hora');

    const browser2 = await chromium.launch({
      executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
      args: ['--no-proxy-server', '--no-sandbox']
    });
    try {
      const page = await browser2.newPage({ viewport: { width: 900, height: 640 } });
      const errores = [];
      page.on('pageerror', e => errores.push(e.message));
      /* Se filtran los fallos de red de origenes de fuera: al abrir index.html
         aqui dentro, las teselas de OSM y las APIs del tiempo salen por el
         proxy del contenedor y dan ERR_CERT_AUTHORITY_INVALID. Es del
         entorno, no de la app. Lo que si cuenta es cualquier excepcion de
         JavaScript, que se recoge aparte en 'pageerror'. */
      page.on('console', m => {
        if (m.type() !== 'error') return;
        const t = m.text();
        if (/Failed to load resource|favicon/.test(t)) return;
        errores.push(t.slice(0, 120));
      });

      await page.goto('http://127.0.0.1:' + PUERTO + '/index.html', { waitUntil: 'domcontentloaded' });
      const r = await page.evaluate(async (puerto) => {
        const cargar = s => new Promise((ok2, no) => { const e = document.createElement('script'); e.src = s; e.onload = ok2; e.onerror = no; document.head.appendChild(e); });
        await cargar('http://127.0.0.1:' + puerto + '/vendor/pmtiles.js');
        await cargar('http://127.0.0.1:' + puerto + '/vendor/protomaps-leaflet.js');

        /* El fichero entero de una vez, SIN peticiones por rango. Pesa poco,
           lo guarda el service worker como cualquier otro recurso y asi vale
           en cualquier hosting estatico —python -m http.server no sirve
           rangos, y GitHub Pages no se puede comprobar desde aqui—. */
        const blob = await (await fetch('http://127.0.0.1:' + puerto + '/mapa/tenerife-base.pmtiles')).blob();
        const fuente = { getKey: () => 'prueba',
                         getBytes: (o, n) => blob.slice(o, o + n).arrayBuffer().then(data => ({ data })) };
        const pm = new pmtiles.PMTiles(fuente);
        const cab = await pm.getHeader();
        const meta = await pm.getMetadata();
        // Santa Cruz en z12, y un trozo de oceano al sur de la isla.
        const tierra = await pm.getZxy(12, 1863, 1709);   // Santa Cruz
        const mar = await pm.getZxy(12, 1859, 1719);      // oceano al suroeste
        return {
          minZoom: cab.minZoom, maxZoom: cab.maxZoom, tipo: cab.tileType,
          bytes: blob.size,
          capas: (meta.vector_layers || []).map(v => v.id).sort(),
          tierra: !!(tierra && tierra.data && tierra.data.byteLength),
          mar: !!(mar && mar.data && mar.data.byteLength),
          centro: [cab.centerLat, cab.centerLon]
        };
      }, PUERTO);

      ok(r.tipo === 1, 'el archivo declara vector tiles (MVT)', r.tipo);
      ok(r.minZoom === 6 && r.maxZoom === 13, 'zoom 6 a 13; de ahi para arriba reescala el renderizador',
         r.minZoom + '-' + r.maxZoom);
      ok(JSON.stringify(r.capas) === JSON.stringify(['carretera', 'sitio', 'tierra']),
         'lleva las tres capas: tierra, carretera y sitio', r.capas.join(','));
      ok(r.tierra, 'una tesela de Santa Cruz trae datos');
      ok(!r.mar, 'una tesela de mar abierto no ocupa sitio', r.mar);
      ok(Math.abs(r.centro[0] - 28.275) < 0.01 && Math.abs(r.centro[1] + 16.53) < 0.01,
         'el centro declarado es Tenerife', r.centro.join(','));
      ok(errores.length === 0, 'se lee y se abre sin un solo error', errores.join(' | '));
    } finally {
      await browser2.close();
    }
  }

  console.log('\n  ' + (fallos ? fallos + ' MAL de ' + hechos : hechos + ' controles, todos en verde') + '\n');
  process.exit(fallos ? 1 : 0);
})();
