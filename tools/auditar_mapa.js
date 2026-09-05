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

    /* Que capas pide de verdad el estilo, y por que propiedad filtra.
       tools/verificar_osm.py lleva esa lista escrita para poder decidir sin
       navegador si un .pmtiles se va a ver; aqui se comprueba que sigue
       coincidiendo con lo que el bundle pide. Si se actualiza vendor/ y
       cambia, esto lo canta en vez de dejar el verificador mintiendo. */
    const estilo = await page.evaluate(() => {
      const c = protomapsL.leafletLayer({ flavor: 'light', url: 'x' });
      const reglas = c.paintRules.concat(c.labelRules);
      const capas = [...new Set(reglas.map(r => r.dataLayer))].sort();
      const rasgo = props => ({ props, geomType: 2, geom: [], numVertices: 0, bbox: {} });
      const pasan = props => reglas.filter(r => r.dataLayer === 'roads' &&
        (!r.filter || (() => { try { return r.filter(14, rasgo(props)); } catch (e) { return false; } })())).length;
      return { capas, conKind: pasan({ kind: 'path' }), conPmapKind: pasan({ 'pmap:kind': 'path' }) };
    });
    const enPy = fs.readFileSync(path.join(RAIZ, 'tools/verificar_osm.py'), 'utf8')
      .match(/CAPAS_DEL_ESTILO = \{([^}]*)\}/);
    const lista = enPy ? enPy[1].match(/'([a-z]+)'/g).map(x => x.replace(/'/g, '')).sort() : [];
    ok(JSON.stringify(lista) === JSON.stringify(estilo.capas),
       'la lista de capas de verificar_osm.py es la que pide el bundle',
       JSON.stringify(lista) + ' vs ' + JSON.stringify(estilo.capas));

    /* La generacion del esquema, medida y no supuesta. El estilo de v4 filtra
       por `kind`; el de v3 filtraba por `pmap:kind`. El numero de version del
       paquete -protomaps-leaflet 5.1.0- es el de la LIBRERIA, no el del
       esquema, y confundirlos lleva a bajar de version algo que ya esta
       bien. */
    ok(estilo.conKind > 0 && estilo.conPmapKind === 0,
       'el estilo filtra por `kind`: es esquema v4, el mismo de los builds diarios',
       'kind=' + estilo.conKind + ' pmap:kind=' + estilo.conPmapKind);
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

  /* ── BLOQUE 3 · la capa dentro de la app ──

     Lo delicado: que entre sola cuando no hay red, que no se pelee con el
     usuario y que con conexion no cambie nada de lo de antes. */
  console.log('\n════════ mapa sin conexion · bloque 3, la capa en la app ════════\n');
  {
    const browser3 = await chromium.launch({
      executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
      args: ['--no-proxy-server', '--no-sandbox']
    });
    try {
      const page = await browser3.newPage({ viewport: { width: 420, height: 760 } });
      const errores = [];
      page.on('pageerror', e => errores.push(e.message));
      const peticiones = [];
      page.on('request', r => {
        const h = r.headers();
        peticiones.push({ url: r.url().replace('http://127.0.0.1:' + PUERTO, ''), rango: h['range'] || null });
      });
      await page.goto('http://127.0.0.1:' + PUERTO + '/index.html', { waitUntil: 'load' });
      await page.waitForTimeout(2500);

      const base = await page.evaluate(() => ({
        motor: typeof pmtiles !== 'undefined' && typeof protomapsL !== 'undefined',
        opcion: getComputedStyle(document.getElementById('lopt-isla')).display,
        capa: currentLayer,
        ids: LAYER_IDS,
        // sin tocar nada, la capa NO se ha descargado: son 1,1 MB que quien
        // tiene cobertura no necesita
        descargada: !!layers.isla
      }));
      ok(base.motor, 'el motor vectorial carga dentro de la app');
      ok(base.opcion === 'flex', 'la opcion «Isla offline» aparece en el menu de capas', base.opcion);
      ok(base.capa === 'streets', 'con red se arranca en Calles, igual que siempre', base.capa);
      ok(!base.descargada, 'el fichero NO se descarga al arrancar: solo cuando hace falta');
      ok(JSON.stringify(base.ids) === JSON.stringify(['streets', 'satellite', 'topo', 'isla']),
         'la lista de capas vive en un solo sitio', base.ids.join(','));

      // Las etiquetas, en los 8. La capa nueva no puede quedarse en español.
      const et = await page.evaluate(() => {
        const out = {};
        for (const l of ['es', 'en', 'fr', 'de', 'it', 'nl', 'zh', 'zht']) { setLang(l); out[l] = t().isla; }
        setLang('es');
        return out;
      });
      const vacios = Object.keys(et).filter(l => !et[l] || !et[l].trim());
      ok(vacios.length === 0, 'la capa tiene nombre en los 8 idiomas', vacios.join(','));
      ok(new Set(Object.values(et)).size >= 6, 'y no es el mismo texto repetido en todos',
         JSON.stringify(et));

      // Elegir la isla a mano: se descarga, se pinta y queda elegida.
      const aMano = await page.evaluate(async () => {
        setStyleFromMenu('isla');
        await new Promise(r => setTimeout(r, 3000));
        return { capa: currentLayer, descargada: !!layers.isla, aMano: _capaElegidaAMano,
                 etiqueta: document.getElementById('layers-active-label').textContent,
                 marca: getComputedStyle(document.getElementById('lcheck-isla')).display };
      });
      ok(aMano.capa === 'isla' && aMano.descargada, 'al elegirla, se descarga y se pone', JSON.stringify(aMano));
      ok(aMano.marca !== 'none', 'y el menu la marca con su ✓', aMano.marca);
      ok(aMano.aMano === true, 'elegir a mano deja constancia: ya no se le cambia sola');

      /* Elegida a mano, quedarse sin red NO debe moverla. Es la regla que
         evita que la app se pelee con el usuario. */
      const trasCaerse = await page.evaluate(async () => {
        window.dispatchEvent(new Event('offline'));
        await new Promise(r => setTimeout(r, 300));
        const a = currentLayer;
        // y volver a haber red tampoco la saca de donde el usuario la puso
        window.dispatchEvent(new Event('online'));
        await new Promise(r => setTimeout(r, 300));
        return { sinRed: a, conRed: currentLayer };
      });
      ok(trasCaerse.sinRed === 'isla' && trasCaerse.conRed === 'isla',
         'si el usuario eligio capa, ni caerse la red ni volver se la cambian', JSON.stringify(trasCaerse));

      /* Y ahora al reves: sin haber elegido nada, caerse la red lleva a la
         isla, y volver la red devuelve la capa que habia. */
      const solo = await page.evaluate(async (puerto) => {
        /* Se le da a la capa de calles una URL local que SI responde. Desde
           este contenedor las teselas de OSM no se alcanzan, asi que al
           volver la red fallarian seis veces y el propio automatismo
           devolveria a la isla: se estaria midiendo la falta de red del
           contenedor, no la logica. Con una imagen local que existe, el
           unico camino que queda vivo es el que se quiere probar. */
        layers.streets.setUrl('http://127.0.0.1:' + puerto + '/vendor/images/marker-icon.png');
        _capaElegidaAMano = false;
        setStyle('streets');
        await new Promise(r => setTimeout(r, 400));
        window.dispatchEvent(new Event('offline'));
        await new Promise(r => setTimeout(r, 600));
        const sinRed = currentLayer;
        window.dispatchEvent(new Event('online'));
        await new Promise(r => setTimeout(r, 900));
        return { sinRed, conRed: currentLayer, recuerdo: _capaAntesDeCaerse };
      }, PUERTO);
      ok(solo.sinRed === 'isla', 'sin red y sin eleccion del usuario, entra sola la isla', JSON.stringify(solo));
      ok(solo.conRed === 'streets', 'y al volver la red, vuelve la capa que habia', JSON.stringify(solo));
      ok(solo.recuerdo === null, 'y se olvida el recuerdo, para no devolverla dos veces', String(solo.recuerdo));

      /* ── NI UNA PETICION POR RANGO ──

         PMTiles normalmente lee el archivo a trozos con cabeceras Range, y
         eso obliga a que el hosting haga byte serving. Si no lo hace, el
         mapa sale en blanco SIN dar error: es el mismo fallo silencioso de
         siempre.

         Aqui no se depende de eso: el fichero se pide entero y las lecturas
         por rango las resuelve blob.slice() en memoria del navegador. Pero
         eso hay que probarlo, no leerlo: basta con que alguien pase una URL
         en vez de un PMTiles para que vuelva la dependencia sin que nada
         falle en local. */
      const conRango = peticiones.filter(p => p.rango);
      ok(conRango.length === 0, 'ni una sola peticion con cabecera Range',
         conRango.slice(0, 3).map(p => p.url + ' [' + p.rango + ']').join(' | '));
      const alPmtiles = peticiones.filter(p => /\.pmtiles/.test(p.url));
      ok(alPmtiles.length > 0 && alPmtiles.every(p => !p.rango),
         'el .pmtiles se pide entero, de una vez (' + alPmtiles.length + ' peticion/es)',
         JSON.stringify(alPmtiles.slice(0, 3)));
      const fuente = await page.evaluate(() => {
        // y que nadie haya vuelto a pasar una URL suelta, que es lo que
        // enchufaria el FetchSource de pmtiles y con el las peticiones Range
        return String(construirIsla).indexOf("url: new pmtiles.PMTiles") > 0;
      });
      ok(fuente, 'la capa se construye siempre sobre un PMTiles propio, nunca sobre una URL');

      ok(errores.length === 0, 'todo lo anterior, sin una sola excepcion', errores.join(' | '));
    } finally {
      await browser3.close();
    }
  }

  /* ── LA PRUEBA DE VERDAD ──

     Todo lo anterior mide piezas. Esto mide lo que le pasa a una persona:
     abre la app con cobertura, se queda sin red y vuelve a abrirla. Es
     exactamente lo que fallo —"quise usar la app offline y no apareció el
     mapa"— y es lo unico que de verdad hay que garantizar.

     Con setOffline el navegador corta de verdad: no es un evento simulado. */
  console.log('\n════════ mapa sin conexion · la prueba de verdad ════════\n');
  {
    const browser4 = await chromium.launch({
      executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
      args: ['--no-proxy-server', '--no-sandbox']
    });
    try {
      const ctx = await browser4.newContext({ viewport: { width: 420, height: 760 } });
      const page = await ctx.newPage();
      const errores = [];
      page.on('pageerror', e => errores.push(e.message));

      await page.goto('http://127.0.0.1:' + PUERTO + '/index.html', { waitUntil: 'load' });
      await page.waitForFunction(() => navigator.serviceWorker && navigator.serviceWorker.controller,
                                 { timeout: 25000 }).catch(() => {});
      await page.waitForTimeout(7000);   // que termine de precargar

      const guardado = await page.evaluate(async () => {
        const ks = await caches.keys(); const todo = [];
        for (const k of ks) { const c = await caches.open(k); (await c.keys()).forEach(r => todo.push(r.url.replace(location.origin, ''))); }
        return todo;
      });
      for (const f of ['/index.html', '/vendor/leaflet.js', '/vendor/pmtiles.js',
                       '/vendor/protomaps-leaflet.js', '/mapa/tenerife-base.pmtiles']) {
        ok(guardado.some(u => u === f || u === f.replace('/index.html', '/')),
           'queda guardado antes de perder la red: ' + f);
      }

      await ctx.setOffline(true);
      await page.reload({ waitUntil: 'load' }).catch(() => {});
      await page.waitForTimeout(7000);

      const r = await page.evaluate(() => ({
        online: navigator.onLine,
        hayMapa: typeof map !== 'undefined' && !!map,
        capa: typeof currentLayer !== 'undefined' ? currentLayer : null,
        islaLista: typeof layers !== 'undefined' && !!layers.isla,
        lienzos: document.querySelectorAll('#map canvas').length,
        lugares: typeof places !== 'undefined' ? places.length : 0
      }));

      ok(r.online === false, 'el navegador esta sin red de verdad', String(r.online));
      ok(r.hayMapa, 'la app arranca entera sin red');
      ok(r.capa === 'isla', 'y se pone sola en el mapa de la isla', String(r.capa));
      ok(r.islaLista, 'el .pmtiles se ha leido del cache, no de la red');
      ok(r.lienzos > 0, 'HAY MAPA PINTADO: ' + r.lienzos + ' teselas dibujadas', r.lienzos);
      ok(r.lugares === 765, 'y los 765 lugares siguen encima', r.lugares);
      ok(errores.length === 0, 'sin una sola excepcion en todo el recorrido', errores.slice(0, 3).join(' | '));
    } finally {
      await browser4.close();
    }
  }

  /* ── BLOQUE 4 · el mapa detallado de OSM, opcional ──

     El fichero de verdad lo genera el usuario y no cabe aqui. Para poder
     probar la maquinaria entera -mirar si esta, descargarlo con barra,
     guardarlo, releerlo del cache, estilarlo con el flavor de Protomaps,
     rehacer la capa y borrarlo- se pone un banco de pruebas con el mismo
     esquema, generado por tools/mapa_prueba_osm.py, y se quita al terminar. */
  console.log('\n════════ mapa sin conexion · bloque 4, el detalle de OSM ════════\n');
  {
    const FIXTURE = path.join(RAIZ, 'tools/datos/prueba-osm.pmtiles');
    const DESTINO = path.join(RAIZ, 'mapa/tenerife-osm.pmtiles');
    const NOMBRE_FIXTURE = 'BANCO DE PRUEBAS';

    /* Red de seguridad: si una ejecucion anterior murio a medias, el banco de
       pruebas se pudo quedar puesto haciendose pasar por el mapa de verdad. */
    if (fs.existsSync(DESTINO)) {
      const cabeza = fs.readFileSync(DESTINO).toString('latin1');
      ok(!cabeza.includes(NOMBRE_FIXTURE),
         'mapa/tenerife-osm.pmtiles no es un banco de pruebas olvidado',
         'lleva la marca ' + NOMBRE_FIXTURE + ': borralo');
    }
    const habiaAntes = fs.existsSync(DESTINO);
    ok(fs.existsSync(FIXTURE), 'existe el banco de pruebas tools/datos/prueba-osm.pmtiles');

    const browser5 = await chromium.launch({
      executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
      args: ['--no-proxy-server', '--no-sandbox']
    });
    try {
      const page = await browser5.newPage({ viewport: { width: 420, height: 760 } });
      const errores = [];
      page.on('pageerror', e => errores.push(e.message));

      // ── sin el fichero: no se ofrece nada y se usa el mapa base ──
      if (!habiaAntes) {
        await page.goto('http://127.0.0.1:' + PUERTO + '/index.html', { waitUntil: 'load' });
        await page.waitForTimeout(2500);
        const sin = await page.evaluate(async () => {
          const enServidor = await detalleEnServidor();
          document.querySelector('.pwa-fab').click();
          await new Promise(r => setTimeout(r, 600));
          const caja = document.getElementById('pwa-detalle');
          await islaCapa();
          return { enServidor, panel: caja ? caja.innerHTML.trim() : null,
                   detallada: !!layers.isla._tgoDetallada };
        });
        ok(sin.enServidor === null, 'si el fichero no esta, detalleEnServidor devuelve null', JSON.stringify(sin.enServidor));
        ok(sin.panel === '', 'y el panel no ensena nada del mapa detallado', sin.panel);
        ok(sin.detallada === false, 'la capa offline usa el mapa base', String(sin.detallada));
      }

      // ── con el fichero puesto ──
      fs.copyFileSync(FIXTURE, DESTINO);
      const tam = fs.statSync(DESTINO).size;

      await page.goto('http://127.0.0.1:' + PUERTO + '/index.html', { waitUntil: 'load' });
      await page.waitForTimeout(2500);

      const conFichero = await page.evaluate(async () => {
        const enServidor = await detalleEnServidor();
        document.querySelector('.pwa-fab').click();
        await new Promise(r => setTimeout(r, 800));
        const btn = document.querySelector('.pwa-btn-detalle');
        return { bytes: enServidor && enServidor.bytes, boton: btn ? btn.textContent : null };
      });
      ok(conFichero.bytes === tam, 'el HEAD devuelve el tamano real, sin gastar datos',
         conFichero.bytes + ' vs ' + tam);
      ok(/\d+ MB|\d+ Mo/.test(conFichero.boton || ''), 'el boton dice cuanto ocupa antes de descargar', conFichero.boton);

      // ── descargarlo, con barra ──
      const bajado = await page.evaluate(async () => {
        const pasos = [];
        await descargarDetalle(p => pasos.push(p));
        const guardado = await detalleGuardado();
        const ks = await caches.keys();
        olvidarIslaCapa();
        await islaCapa();
        return { pasos: pasos.length, ultimo: pasos[pasos.length - 1],
                 bytes: guardado ? guardado.size : 0,
                 cache: ks.includes('tgo-mapa-osm-v1'),
                 detallada: !!layers.isla._tgoDetallada };
      });
      ok(bajado.bytes === tam, 'se guarda entero y se relee del cache', bajado.bytes + ' vs ' + tam);
      ok(bajado.cache, 'en su propio cache, tgo-mapa-osm-v1');
      ok(bajado.pasos > 0 && bajado.ultimo > 0, 'la descarga informa del avance', JSON.stringify(bajado));
      ok(bajado.detallada === true, 'y la capa offline pasa a usar el detalle', String(bajado.detallada));

      // que de verdad se pinta con el estilo de Protomaps
      /* No basta con contar lienzos: si el esquema del fichero y el del
         estilo no son de la misma generacion, los lienzos existen y estan
         VACIOS. Es el fallo silencioso del bloque 4, asi que se miden los
         pixeles que no son el color de fondo que declara el propio estilo. */
      const pintado = await page.evaluate(async () => {
        try { document.querySelector('.pwa-modal-close').click(); } catch (e) {}
        setStyleFromMenu('isla');
        await new Promise(r => setTimeout(r, 3000));
        map.setView([28.487, -16.315], 13);
        await new Promise(r => setTimeout(r, 3000));
        const cs = document.querySelectorAll('#map canvas');
        const hex = (layers.isla.backgroundColor || '#cccccc').replace('#', '');
        const fondo = [parseInt(hex.slice(0,2),16), parseInt(hex.slice(2,4),16), parseInt(hex.slice(4,6),16)];
        let total = 0, pintados = 0;
        for (const c of cs) {
          const g = c.getContext('2d');
          if (!g || !c.width) continue;
          const d = g.getImageData(0, 0, c.width, c.height).data;
          for (let i = 0; i < d.length; i += 4) {
            total++;
            if (Math.abs(d[i]-fondo[0]) + Math.abs(d[i+1]-fondo[1]) + Math.abs(d[i+2]-fondo[2]) > 12) pintados++;
          }
        }
        return { capa: currentLayer, lienzos: cs.length,
                 pct: total ? +(pintados * 100 / total).toFixed(2) : 0 };
      });
      ok(pintado.capa === 'isla' && pintado.lienzos > 0,
         'la capa detallada se pone y crea lienzos (' + pintado.lienzos + ')', JSON.stringify(pintado));
      ok(pintado.pct >= 0.5,
         'Y NO ESTA EN BLANCO: ' + pintado.pct + ' % de pixeles pintados con el estilo de la app',
         JSON.stringify(pintado) + ' — si sale ~0, el esquema del fichero y el del estilo no se entienden');

      // ── cambiar de idioma rehace la capa, que rotula en el idioma fijado ──
      const idioma = await page.evaluate(async () => {
        const antes = layers.isla;
        setLang('de');
        await new Promise(r => setTimeout(r, 1500));
        const rehecha = layers.isla !== antes;
        setLang('es');
        await new Promise(r => setTimeout(r, 1500));
        return { rehecha };
      });
      ok(idioma.rehecha, 'cambiar de idioma rehace la capa detallada, que rotula en el suyo');

      // ── borrarlo ──
      const borrado = await page.evaluate(async () => {
        await borrarDetalle();
        olvidarIslaCapa();
        await islaCapa();
        const ks = await caches.keys();
        return { cache: ks.includes('tgo-mapa-osm-v1'), detallada: !!layers.isla._tgoDetallada };
      });
      ok(!borrado.cache, 'al borrarlo, el cache desaparece');
      ok(borrado.detallada === false, 'y la capa offline vuelve al mapa base');

      ok(errores.length === 0, 'todo el recorrido, sin una sola excepcion', errores.slice(0, 3).join(' | '));
    } finally {
      await browser5.close();
      // El banco de pruebas NO se queda. Si se quedara, se estaria sirviendo
      // un mapa falso como si fuera el bueno.
      if (!habiaAntes) { try { fs.unlinkSync(DESTINO); } catch (e) {} }
    }
    ok(habiaAntes || !fs.existsSync(DESTINO), 'el banco de pruebas se retira al terminar');
  }

  console.log('\n  ' + (fallos ? fallos + ' MAL de ' + hechos : hechos + ' controles, todos en verde') + '\n');
  process.exit(fallos ? 1 : 0);
})();
