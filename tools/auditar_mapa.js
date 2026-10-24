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

      /* Las etiquetas, en todos. La capa nueva no puede quedarse en español.
         La lista sale de SUPPORTED_LANGS, que aqui dentro se alcanza por su
         nombre: escrita a mano se quedaba en nueve y el idioma decimo no lo
         miraba nadie. */
      const et = await page.evaluate(() => {
        const out = {};
        for (const l of SUPPORTED_LANGS) { setLang(l); out[l] = t().isla; }
        setLang('es');
        return out;
      });
      const vacios = Object.keys(et).filter(l => !et[l] || !et[l].trim());
      ok(vacios.length === 0, 'la capa tiene nombre en los ' + Object.keys(et).length + ' idiomas', vacios.join(','));
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
      // El numero sale del propio fichero, no escrito a mano: con 765 clavado
      // esto se puso rojo al entrar 40 playas nuevas, que es ruido, no fallo.
      const { PLACES } = require('./cargar');
      ok(r.lugares === PLACES.length, 'y los ' + PLACES.length + ' lugares siguen encima', r.lugares);
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

      /* ── con el fichero puesto ──
         Si el mapa de OSM de verdad ya esta en el repositorio, se prueba
         CONTRA EL, no contra el banco de pruebas. Copiar el banco encima lo
         machacaria, y como habiaAntes es cierto tampoco se borraria al
         terminar: el repositorio se quedaria con un mapa falso de 1,5 MB en
         lugar del bueno. */
      if (!habiaAntes) fs.copyFileSync(FIXTURE, DESTINO);
      else console.log('  --  hay un ' + path.relative(RAIZ, DESTINO) + ' de verdad (' +
                       (fs.statSync(DESTINO).size / 1e6).toFixed(1) + ' MB): se prueba contra el, no contra el banco');
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

      /* ── EL ZOOM, DE PUNTA A PUNTA ──
         protomaps-leaflet asume `maxDataZoom||15` si no se le dice. Con un
         fichero de z14 eso dejaba el mapa EN BLANCO de z16 para arriba:
         reescalaba desde un nivel que no existe. Y z16-z18 es justo donde se
         pone quien quiere ver por donde va. Ahora sale de la cabecera del
         propio fichero. */
      const zooms = await page.evaluate(async () => {
        const filas = [];
        for (let z = 6; z <= 18; z++) {
          map.setView([28.535, -16.245], z);
          await new Promise(r => setTimeout(r, 600));
          const cs = document.querySelectorAll('#map canvas');
          const hex = ((layers.isla && layers.isla.backgroundColor) || '#cccccc').replace('#', '');
          const f = [parseInt(hex.slice(0,2),16), parseInt(hex.slice(2,4),16), parseInt(hex.slice(4,6),16)];
          let total = 0, pintados = 0;
          for (const cv of cs) {
            const g = cv.getContext('2d'); if (!g || !cv.width) continue;
            const d = g.getImageData(0, 0, cv.width, cv.height).data;
            for (let i = 0; i < d.length; i += 4) { total++;
              if (Math.abs(d[i]-f[0]) + Math.abs(d[i+1]-f[1]) + Math.abs(d[i+2]-f[2]) > 12) pintados++; }
          }
          filas.push({ z, pct: total ? +(pintados * 100 / total).toFixed(1) : 0 });
        }
        return { filas, zMax: layers.isla._tgoZMax };
      });
      const enBlanco = zooms.filas.filter(f => f.pct === 0).map(f => 'z' + f.z);
      ok(zooms.zMax > 0, 'la capa toma su maxDataZoom de la cabecera del fichero', zooms.zMax);
      ok(enBlanco.length === 0,
         'ningun zoom de z6 a z18 se queda en blanco (zMax del fichero: ' + zooms.zMax + ')',
         'en blanco: ' + enBlanco.join(', '));

      ok(errores.length === 0, 'todo el recorrido, sin una sola excepcion', errores.slice(0, 3).join(' | '));
    } finally {
      await browser5.close();
      // El banco de pruebas NO se queda. Si se quedara, se estaria sirviendo
      // un mapa falso como si fuera el bueno.
      if (!habiaAntes) { try { fs.unlinkSync(DESTINO); } catch (e) {} }
    }
    ok(habiaAntes || !fs.existsSync(DESTINO), 'el banco de pruebas se retira al terminar');
  }

  /* ── BLOQUE 6 · el pellizco: ni a saltos ni a medias (24 de octubre de 2026) ──

     Jerome: «lo bueno es ver que no es lento o aparece parcialmente». Al alejar con los
     dedos, la franja nueva no tiene teselas hasta que llegan: media pantalla en blanco. Ahora
     va debajo la isla base pintada a zoom 10 (ponerFondoIsla), leida del cache del service
     worker y nunca de la red; y la capa de la isla no pinta a mitad del gesto. Aqui: que el
     fondo no descarga nada, que esta donde tiene que estar y que, con un pellizco de verdad
     (Input.synthesizePinchGesture) en un movil emulado y teselas con 150-250 ms de red, al
     soltar no queda nada en blanco; y, quitando el fondo, el mismo gesto deja huecos, para
     que se vea que la medida sabe ponerse en rojo. */
  console.log('\n════════ el mapa · bloque 6, el pellizco sin huecos ════════\n');
  {
    const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
    const fFondo = (html.match(/function ponerFondoIsla\(\) \{[\s\S]*?\n\}\n/) || [''])[0];
    const fIsla = (html.match(/function construirIsla\(blob, clave, detallado, zMax\) \{[\s\S]*?\n\}\n/) || [''])[0];
    ok(/caches\.match\(ISLA_URL\)/.test(fFondo) && /window\.TGO_NATIVO\s*\?\s*fetch\(ISLA_URL\)/.test(fFondo) && (fFondo.match(/fetch\(/g) || []).length === 1,
       'el fondo lee la isla base del cache del service worker (o del fichero de la app de las tiendas), nunca de la red');
    ok(/maxNativeZoom: 10/.test(fFondo) && /zIndex: 0/.test(fFondo) && /labelRules: \[\]/.test(fFondo) && !/openstreetmap/.test(fFondo),
       'pintado a zoom 10, debajo de todas las capas, sin rotulos y sin pedir teselas de OpenStreetMap');
    ok(/bounds: tenerifeBounds/.test(fFondo) && /devicePixelRatio: 1,/.test(fFondo),
       'solo la zona de la isla, a un pixel por pixel de tesela (256 KB por tesela, no 2,4 MB en un movil x3)');
    /* el fondo tiene siempre las 16 teselas de la zona: cambia el metodo de Leaflet que dice
       cuales pedir. Si un dia se cambia la Leaflet de vendor/ y ese metodo ya no existe o ya no
       se usa, el cambio no haria nada sin avisar: por eso se mira aqui */
    const leafletV = fs.readFileSync(path.join(RAIZ, 'vendor', 'leaflet.js'), 'utf8');
    const protoV = fs.readFileSync(path.join(RAIZ, 'vendor', 'protomaps-leaflet.js'), 'utf8');
    ok(/f\._getTiledPixelBounds = function \(\) \{\s*return L\.bounds\(map\.project\(tenerifeBounds\.getNorthWest\(\), this\._tileZoom\),\s*map\.project\(tenerifeBounds\.getSouthEast\(\), this\._tileZoom\)\);/.test(fFondo)
       && /_getTiledPixelBounds:function\(/.test(leafletV) && /this\._getTiledPixelBounds\(t\),o=this\._pxBoundsToTileRange\(e\)/.test(leafletV)
       && /this\.devicePixelRatio=\(o=r\.devicePixelRatio\)!=null\?o:window\.devicePixelRatio/.test(protoV) && /this\.tileSize=256\*this\.devicePixelRatio/.test(protoV),
       'el fondo pide siempre toda la zona, y la Leaflet y la protomaps-leaflet de vendor/ siguen usando lo que se cambia');
    ok((fIsla.match(/updateWhenZooming: false/g) || []).length === 2,
       'las dos capas de la isla (base y detalle) no pintan a mitad del pellizco');
    ok(/requestIdleCallback[\s\S]{0,120}ponerFondoIsla\(\)/.test(html) && /map\.on\('zoomstart', function \(\) \{ if \(!_fondoIsla\) ponerFondoIsla\(\); \}\)/.test(html),
       'se pone cuando el arranque termina, y se vuelve a mirar al primer zoom');

    const PNG = fs.readFileSync(path.join(RAIZ, 'icon-192.png'));   // una imagen cualquiera hace de tesela
    const browser6 = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-proxy-server', '--no-sandbox'] });
    try {
      const ctx = await browser6.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
      const page = await ctx.newPage();
      const errores = []; page.on('pageerror', e => errores.push(e.message));
      const base = []; page.on('request', r => { if (/tenerife-base\.pmtiles/.test(r.url())) base.push(r.url()); });
      let n = 0;
      await page.route(/tile\.openstreetmap\.org/, async r => { n++; await new Promise(z => setTimeout(z, 150 + (n * 37) % 100)); r.fulfill({ status: 200, contentType: 'image/png', body: PNG }); });
      await page.route(/^https?:\/\/(?!127\.0\.0\.1)(?!.*tile\.openstreetmap\.org)/, r => r.abort());
      await page.addInitScript(() => { try { localStorage.setItem('tenerife.tour.seen', '99'); localStorage.setItem('tgo_consent', JSON.stringify({ v: 'denied', t: Date.now() })); } catch (e) {} });
      await page.goto('http://127.0.0.1:' + PUERTO + '/index.html', { waitUntil: 'load' });
      await page.waitForTimeout(3000);
      const sinCache = await page.evaluate(() => ({ fondo: _fondoIsla, isla: !!layers.isla }));
      ok(sinCache.fondo === null && base.length === 0,
         'sin la isla guardada, no hay fondo y no se descarga nada al arrancar', JSON.stringify(sinCache) + ' · ' + base.length + ' peticiones');
      // lo que hace el service worker al instalarse: guardar la isla base
      await page.evaluate(async () => { const c = await caches.open('auditar-mapa-precache'); await c.put('mapa/tenerife-base.pmtiles', await fetch('mapa/tenerife-base.pmtiles')); });
      base.length = 0;
      await page.reload({ waitUntil: 'load' });
      if (await page.$('.v19-w-lang[data-lang="es"]')) { await page.click('.v19-w-lang[data-lang="es"]'); await page.waitForTimeout(200); await page.click('#v19-welcome-start'); }
      const puesto = await page.evaluate(async () => {
        for (let i = 0; i < 60 && !(_fondoIsla && _fondoIsla._map); i++) await new Promise(r => setTimeout(r, 100));
        const f = _fondoIsla && _fondoIsla._map ? _fondoIsla : null;
        return f ? { z: f.options.maxNativeZoom, zi: f.options.zIndex, debajo: +getComputedStyle(f.getContainer()).zIndex < +getComputedStyle(layers[currentLayer].getContainer()).zIndex, capa: currentLayer } : null;
      });
      ok(puesto && puesto.z === 10 && puesto.zi === 0 && puesto.debajo && base.every(u => /^http:\/\/127\.0\.0\.1/.test(u)),
         'con la isla guardada, el fondo esta puesto: zoom 10, debajo de las calles, y leido del cache', JSON.stringify(puesto));
      // como al abrir la app: la isla entera a la vista, y el fondo pintado
      const pintado = await page.evaluate(async () => {
        for (let i = 0; i < 80; i++) { const t = Object.values(_fondoIsla._tiles || {}); if (t.length && t.every(x => x.loaded)) return t.length; await new Promise(r => setTimeout(r, 100)); }
        return 0;
      });
      ok(pintado === 16, 'con la isla entera a la vista, el fondo pinta las 16 teselas de zoom 10 de la zona', pintado);
      const memoria = await page.evaluate(() => Object.values(_fondoIsla._tiles).map(t => t.el.width + 'x' + t.el.height).filter((v, i, a) => a.indexOf(v) === i));
      ok(memoria.length === 1 && memoria[0] === '256x256', 'cada tesela del fondo es un lienzo de 256 x 256, aunque el movil sea x3', memoria.join(' '));
      /* el pellizco, medido: que parte del mapa queda cubierta por teselas ya pintadas al soltar */
      const cobertura = () => page.evaluate(() => {
        const cont = document.getElementById('map').getBoundingClientRect(), rects = [];
        document.querySelectorAll('#map .leaflet-tile-loaded').forEach(el => { const r = el.getBoundingClientRect(); if (r.width > 1 && getComputedStyle(el).opacity !== '0') rects.push(r); });
        let dentro = 0, total = 0;
        for (let y = cont.top + 5; y < cont.bottom; y += 20) for (let x = cont.left + 5; x < cont.right; x += 20) { total++; if (rects.some(r => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom)) dentro++; }
        return dentro / total;
      });
      const cdp = await ctx.newCDPSession(page);
      /* cada gesto en un sitio distinto, para que las teselas del zoom nuevo no esten ya en la cache del navegador */
      /* un salto como el de abrir una ficha desde la lista (setView sin animacion, que borra las
         teselas que habia), y despues alejar con los dedos */
      const alejar = async (centro) => {
        await page.evaluate((c) => map.setView(c, 14, { animate: false }), centro);
        for (let i = 0; i < 60; i++) { if (await cobertura() >= 0.999) break; await page.waitForTimeout(100); }
        await page.waitForTimeout(400);
        const fondo = await page.evaluate(() => _fondoIsla && _fondoIsla._map ? Object.values(_fondoIsla._tiles).filter(t => t.loaded).length : -1);
        await cdp.send('Input.synthesizePinchGesture', { x: 195, y: 420, scaleFactor: 0.4, relativeSpeed: 600, gestureSourceType: 'touch' });
        return { z: await page.evaluate(() => map.getZoom()), c: await cobertura(), fondo };
      };
      const con = await alejar([28.405, -16.54]);
      ok(con.fondo === 16, 'tras el salto, el fondo vuelve a tener las 16 teselas pintadas', con.fondo);
      ok(con.z < 14 && con.c >= 0.999, 'alejar con los dedos (de 14 a ' + con.z + '): al soltar, el 100 % del mapa tiene algo pintado', (con.c * 100).toFixed(1) + ' %');
      await page.evaluate(() => { map.removeLayer(_fondoIsla); });
      const sin = await alejar([28.06, -16.72]);
      ok(sin.c < 0.9, 'y sin el fondo, el mismo gesto deja huecos (' + (sin.c * 100).toFixed(1) + ' % cubierto): la medida sabe ponerse en rojo', (sin.c * 100).toFixed(1) + ' %');
      await page.evaluate(() => { _fondoIsla.addTo(map); });
      await page.evaluate(async () => { await islaCapa(); setStyle('isla'); });
      const isla = await page.evaluate(() => ({ capa: currentLayer, uwz: layers.isla && layers.isla.options.updateWhenZooming }));
      ok(isla.capa === 'isla' && isla.uwz === false, 'la capa de la isla, puesta, no pinta a mitad del gesto', JSON.stringify(isla));
      ok(errores.length === 0, 'sin errores de pagina', errores.slice(0, 3).join(' | '));
      await ctx.close();
    } finally {
      await browser6.close();
    }
  }

  /* ── BLOQUE 7 · al soltar el pellizco: preciso y sin esperar (24 de octubre de 2026, tarde) ──

     Jerome: «El zoom se puede hacer mejor todavía, trabájalo más y preciso». Al soltar, Leaflet
     lleva el zoom al medio nivel mas cercano con una animacion de 250 ms. Lo hacia alrededor del
     centro del mapa (el punto que estaba entre los dedos se movia) y no pedia las teselas hasta
     el final. La app cambia el _onTouchEnd de Leaflet: el ajuste, alrededor del punto del
     pellizco, y las teselas, pedidas al empezar. Y las tres capas de teselas no piden nada a
     mitad del gesto (updateWhenZooming: false). Aqui: que la Leaflet de vendor/ sigue siendo la
     que se sustituye; y, con un pellizco de verdad fuera del centro, que el punto no se mueve,
     que a mitad del gesto no se pide ninguna tesela y que al soltar se piden enseguida. Y, con
     el _onTouchEnd original de Leaflet, el mismo gesto mueve el punto y espera: la medida sabe
     ponerse en rojo. */
  console.log('\n════════ el mapa · bloque 7, al soltar el pellizco ════════\n');
  {
    const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
    const leafletV = fs.readFileSync(path.join(RAIZ, 'vendor', 'leaflet.js'), 'utf8');
    const ORIGINAL = '_onTouchEnd:function(){this._moved&&this._zooming?(this._zooming=!1,r(this._animRequest),k(document,"touchmove",this._onTouchMove,this),k(document,"touchend touchcancel",this._onTouchEnd,this),this._map.options.zoomAnimation?this._map._animateZoom(this._center,this._map._limitZoom(this._zoom),!0,this._map.options.zoomSnap):this._map._resetView(this._center,this._map._limitZoom(this._zoom))):this._zooming=!1}';
    ok(leafletV.includes(ORIGINAL) && leafletV.includes('this._center=e.unproject(e.project(this._pinchStartLatLng,this._zoom).subtract(i),this._zoom)'),
       'la Leaflet de vendor/ trae el _onTouchEnd que la app sustituye, y el pellizco mantiene _pinchStartLatLng bajo los dedos');
    const fin = (html.match(/L\.Map\.TouchZoom\.prototype\._onTouchEnd = function \(\) \{[\s\S]*?\n\};\n/) || [''])[0];
    ok(/c = m\.unproject\(P\.subtract\(P\.subtract\(C\)\.divideBy\(s\)\), this\._zoom\);/.test(fin) && /m\._animateZoom\(c, z, true, false\)/.test(fin) && html.indexOf(fin) < html.indexOf("map = L.map('map', {"),
       'la app ajusta el zoom alrededor del punto del pellizco y pide las teselas al empezar la animacion (antes de crear el mapa)');
    const capasT = (html.match(/const tileOptions = \{[^\n]*\};\nconst layers = \{[\s\S]*?\n\};/) || [''])[0];
    ok(/const tileOptions = \{ bounds: tileBounds, maxZoom: 19, updateWhenZooming: false \};/.test(capasT) && /streets: L\.tileLayer\([^\n]*\.\.\.tileOptions/.test(capasT)
       && (capasT.match(/detectRetina: true, updateWhenZooming: false \}/g) || []).length === 2,
       'las tres capas de teselas (calles, satelite y relieve) no piden nada a mitad del gesto');

    const PNG = fs.readFileSync(path.join(RAIZ, 'icon-192.png'));
    const browser7 = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-proxy-server', '--no-sandbox'] });
    try {
      const ctx = await browser7.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
      const page = await ctx.newPage();
      const errores = []; page.on('pageerror', e => errores.push(e.message));
      const pedidas = [];
      let n = 0;
      await page.route(/tile\.openstreetmap\.org/, async r => { pedidas.push(Date.now()); n++; await new Promise(z => setTimeout(z, 150 + (n * 37) % 100)); r.fulfill({ status: 200, contentType: 'image/png', body: PNG }); });
      await page.route(/^https?:\/\/(?!127\.0\.0\.1)(?!.*tile\.openstreetmap\.org)/, r => r.abort());
      await page.addInitScript(() => { try { localStorage.setItem('tenerife.tour.seen', '99'); localStorage.setItem('tgo_consent', JSON.stringify({ v: 'denied', t: Date.now() })); } catch (e) {} });
      await page.goto('http://127.0.0.1:' + PUERTO + '/index.html', { waitUntil: 'load' });
      if (await page.$('.v19-w-lang[data-lang="es"]')) { await page.click('.v19-w-lang[data-lang="es"]'); await page.waitForTimeout(200); await page.click('#v19-welcome-start'); }
      /* al empezar la animacion del ajuste (zoomanim), donde esta en la pantalla el punto del
         pellizco; al acabar (zoomend), cuanto se ha movido */
      await page.evaluate(() => {
        map.on('zoomanim', () => { const ll = map.touchZoom._pinchStartLatLng; window.__soltar = { t: Date.now(), p: ll && map.latLngToContainerPoint(ll), ll: ll, z: map.getZoom() }; });
        map.on('zoomend', () => { const s = window.__soltar; if (s && s.ll && s.d == null) s.d = map.latLngToContainerPoint(s.ll).distanceTo(s.p); });
        /* el _onTouchEnd de Leaflet 1.9.4 tal cual, para comparar */
        window.__original = function () {
          if (!(this._moved && this._zooming)) { this._zooming = false; return; }
          this._zooming = false;
          L.Util.cancelAnimFrame(this._animRequest);
          L.DomEvent.off(document, 'touchmove', this._onTouchMove, this);
          L.DomEvent.off(document, 'touchend touchcancel', this._onTouchEnd, this);
          if (this._map.options.zoomAnimation) this._map._animateZoom(this._center, this._map._limitZoom(this._zoom), true, this._map.options.zoomSnap);
          else this._map._resetView(this._center, this._map._limitZoom(this._zoom));
        };
      });
      const cdp = await ctx.newCDPSession(page);
      /* un pellizco fuera del centro (90, 230): alejar de 14 hacia 12,6; cada vez en otro sitio,
         para que las teselas no esten ya en la cache del navegador */
      const gesto = async (centro, original) => {
        await page.evaluate(([c, o]) => { map.setView(c, 14, { animate: false }); if (o) map.touchZoom._onTouchEnd = window.__original; else delete map.touchZoom._onTouchEnd; window.__soltar = null; }, [centro, original]);
        await page.waitForTimeout(2500);
        const t0 = Date.now();
        await cdp.send('Input.synthesizePinchGesture', { x: 90, y: 230, scaleFactor: 0.4, relativeSpeed: 600, gestureSourceType: 'touch' });
        await page.waitForTimeout(900);
        const s = await page.evaluate(() => window.__soltar && { t: window.__soltar.t, d: window.__soltar.d, z: window.__soltar.z, zf: map.getZoom() });
        const durante = pedidas.filter(t => t >= t0 && t < s.t).length;
        const primera = pedidas.filter(t => t >= s.t).sort((a, b) => a - b)[0];
        return { d: s.d, z: s.z, zf: s.zf, durante, primera: primera ? primera - s.t : null };
      };
      const app = await gesto([28.405, -16.54], false);
      ok(app.d != null && app.d <= 1 && Math.abs(app.zf - app.z) > 0.01,
         'al soltar fuera del centro (de 14 a ' + app.z.toFixed(2) + ', ajustado a ' + app.zf + '), el punto que estaba entre los dedos no se mueve', app.d != null ? app.d.toFixed(1) + ' px' : 'sin medida');
      ok(app.durante === 0 && app.primera != null && app.primera < 150,
         'a mitad del gesto no se pide ninguna tesela, y al soltar la primera sale a los ' + app.primera + ' ms (antes de que acabe la animacion de 250 ms)', JSON.stringify(app));
      const leaflet = await gesto([28.10, -16.70], true);
      ok(leaflet.d != null && leaflet.d > 5 && leaflet.primera != null && leaflet.primera >= 240,
         'y con el _onTouchEnd original de Leaflet, el mismo gesto mueve el punto (' + (leaflet.d != null ? leaflet.d.toFixed(0) : '?') + ' px) y espera ' + leaflet.primera + ' ms para pedir: la medida sabe ponerse en rojo', JSON.stringify(leaflet));
      await page.evaluate(() => { delete map.touchZoom._onTouchEnd; });
      ok(errores.length === 0, 'sin errores de pagina', errores.slice(0, 3).join(' | '));
      await ctx.close();
    } finally {
      await browser7.close();
    }
  }

  console.log('\n  ' + (fallos ? fallos + ' MAL de ' + hechos : hechos + ' controles, todos en verde') + '\n');
  process.exit(fallos ? 1 : 0);
})();
