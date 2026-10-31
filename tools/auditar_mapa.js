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

/* El estilo de los mapas de la isla tal como esta en index.html: los colores compartidos y
   las funciones que arman las reglas. Lo usan el bloque 1 (que capas pide) y el bloque 8 (el
   dibujo), sobre una pagina que solo carga vendor/. */
function estiloDeLaApp() {
  const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
  const trozo = re => { const m = html.match(re); if (!m) throw new Error('no esta en index.html: ' + re); return m[0]; };
  return [
    trozo(/\nconst MAPA_MAR = '#[0-9a-f]{6}', MAPA_TIERRA = '#[0-9a-f]{6}';\n/),
    trozo(/\nfunction rotuloConMargen\(sim, m\) \{[\s\S]*?\n\}\n/),
    trozo(/\nfunction estiloIslaDetallada\(P, idioma\) \{[\s\S]*?\n\}\n/),
    trozo(/\nfunction estiloIslaBase\(P\) \{[\s\S]*?\n\}\n/)
  ].join('\n').replace(/^const /m, 'var ');
}

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
    executablePath: '/opt/pw-browsers/chromium',
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
       coincidiendo con lo que pide el estilo de la app (estiloIslaDetallada,
       en index.html, desde el 24 de octubre de 2026; antes era el flavor
       'light' del bundle). Si cambia, esto lo canta en vez de dejar el
       verificador mintiendo. */
    await page.addScriptTag({ content: estiloDeLaApp() });
    const estilo = await page.evaluate(() => {
      const c = estiloIslaDetallada(protomapsL, 'es');
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
       'la lista de capas de verificar_osm.py es la que pide el estilo de la app',
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
      executablePath: '/opt/pw-browsers/chromium',
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
      executablePath: '/opt/pw-browsers/chromium',
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
      executablePath: '/opt/pw-browsers/chromium',
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
      executablePath: '/opt/pw-browsers/chromium',
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
    ok(/updateWhenZooming: false/.test(fIsla) && !/updateWhenZooming: true/.test(fIsla) && (fIsla.match(/P\.leafletLayer\(/g) || []).length === 1,
       'las dos capas de la isla (base y detalle, una sola llamada a leafletLayer) no pintan a mitad del pellizco');
    ok(/requestIdleCallback[\s\S]{0,120}ponerFondoIsla\(\)/.test(html) && /map\.on\('zoomstart', function \(\) \{ if \(!_fondoIsla\) ponerFondoIsla\(\); \}\)/.test(html),
       'se pone cuando el arranque termina, y se vuelve a mirar al primer zoom');

    const PNG = fs.readFileSync(path.join(RAIZ, 'icon-192.png'));   // una imagen cualquiera hace de tesela
    const browser6 = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-proxy-server', '--no-sandbox'] });
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
    const browser7 = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-proxy-server', '--no-sandbox'] });
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

  /* ── BLOQUE 8 · el dibujo del mapa (24 de octubre de 2026, noche) ──

     Jerome: «sigue trabajando sobre el mapa para dibujarlo lo mejor posible». El mapa detallado
     se pintaba con el flavor 'light' de protomaps-leaflet: mar cian, todas las vias blancas e
     iguales, los senderos blancos y casi invisibles, la mitad de la isla verde (los espacios
     protegidos, rellenos), sin barcos, teleferico, picos ni matriculas. Ahora lo pinta un estilo
     propio, estiloIslaDetallada (index.html), sobre los mismos datos. Aqui: que la app lo usa en
     los dos mapas de la isla y en el fondo, con el mar y la tierra de las teselas de OSM; que no
     queda ninguna via ni ningun uso del suelo de los datos sin su regla; y, pintando de verdad
     el fichero de OSM (o el banco de pruebas), que los senderos se ven, que salen los picos con
     su altitud y las matriculas, una sola por tramo, y que el mar es del color del fondo. Con el
     flavor 'light' los senderos no se ven: la medida sabe ponerse en rojo. */
  console.log('\n════════ el mapa · bloque 8, el dibujo ════════\n');
  {
    const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
    const fIsla = (html.match(/function construirIsla\(blob, clave, detallado, zMax\) \{[\s\S]*?\n\}\n/) || [''])[0];
    const fFondo = (html.match(/function ponerFondoIsla\(\) \{[\s\S]*?\n\}\n/) || [''])[0];
    const fBase = (html.match(/\nfunction estiloIslaBase\(P\) \{[\s\S]*?\n\}\n/) || [''])[0];
    const fDet = (html.match(/\nfunction estiloIslaDetallada\(P, idioma\) \{[\s\S]*?\n\}\n/) || [''])[0];
    ok(/estiloIslaDetallada\(P, idioma\)/.test(fIsla) && /estiloIslaBase\(P\)/.test(fIsla) && !/flavor/.test(fIsla),
       'los dos mapas de la isla se pintan con el estilo de la app, sin el flavor de protomaps-leaflet');
    /* el mar y la tierra de openstreetmap-carto (style/style.mss: @water-color #aad3df,
       @land-color #f2efe9), en los tres: asi, al hacer zoom con las calles, el fondo que asoma
       mientras llegan las teselas no cambia de color al llegar */
    ok(/\nconst MAPA_MAR = '#aad3df', MAPA_TIERRA = '#f2efe9';\n/.test(html),
       'el mar y la tierra son los de las teselas de OpenStreetMap (#aad3df y #f2efe9)');
    ok(/backgroundColor: MAPA_MAR/.test(fFondo) && /fill: MAPA_TIERRA/.test(fFondo)
       && /backgroundColor: MAPA_MAR/.test(fBase) && /fill: MAPA_TIERRA/.test(fBase)
       && /fill: MAPA_MAR/.test(fDet) && /fill: MAPA_TIERRA/.test(fDet) && /backgroundColor: MAPA_MAR/.test(fDet),
       'el fondo de la isla, el mapa base y el detallado comparten esos dos colores');
    ok(!/#a8c8e0|#eef1e6|#80deea/i.test(fFondo + fIsla + fBase + fDet),
       'no queda ninguno de los colores de antes (#a8c8e0, #eef1e6, el cian #80deea)');
    ok(/currentLang === 'zht' \? 'zh-Hant' : currentLang === 'zh' \? 'zh-Hans'/.test(fIsla) && /const nombre = \/\^zh\/\.test\(idioma\) \? \['name'\] : \['name:' \+ idioma, 'name'\];/.test(fDet),
       'los rotulos, en el idioma de la app; en chino, en castellano (el chino del fichero no vale: mas abajo)');

    const REAL = fs.existsSync(path.join(RAIZ, 'mapa/tenerife-osm.pmtiles'));
    const FICH = REAL ? 'mapa/tenerife-osm.pmtiles' : 'tools/datos/prueba-osm.pmtiles';
    const browser8 = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-proxy-server', '--no-sandbox'] });
    try {
      const page = await browser8.newPage({ viewport: { width: 512, height: 512 }, deviceScaleFactor: 1 });
      const errores = []; page.on('pageerror', e => errores.push(e.message));
      // la pagina, en el mismo origen que el servidor: si no, leer el .pmtiles con fetch lo tumba CORS
      await page.goto('http://127.0.0.1:' + PUERTO + '/vendor/leaflet.css');
      await page.setContent(`
        <link rel="stylesheet" href="http://127.0.0.1:${PUERTO}/vendor/leaflet.css">
        <style>html,body{margin:0}#m{width:512px;height:512px}</style><div id="m"></div>
        <script src="http://127.0.0.1:${PUERTO}/vendor/leaflet.js"><\/script>
        <script src="http://127.0.0.1:${PUERTO}/vendor/pmtiles.js"><\/script>
        <script src="http://127.0.0.1:${PUERTO}/vendor/protomaps-leaflet.js"><\/script>`, { waitUntil: 'networkidle' });
      await page.addScriptTag({ content: estiloDeLaApp() });
      const r = await page.evaluate(async ([URL_F]) => {
        const blob = await (await fetch(URL_F)).blob();
        const fuente = k => ({ getKey: () => k, getBytes: (o, n) => blob.slice(o, o + n).arrayBuffer().then(d => ({ data: d })) });
        const estilo = estiloIslaDetallada(protomapsL, 'es');
        const capa = protomapsL.leafletLayer(Object.assign({ url: new pmtiles.PMTiles(fuente('a')), maxDataZoom: 14 }, estilo));
        const view = [...capa.views.values()][0];
        const tesela = (la, ln, z) => { const n = 2 ** z; return { x: Math.floor((ln + 180) / 360 * n), y: Math.floor((1 - Math.log(Math.tan(la * Math.PI / 180) + 1 / Math.cos(la * Math.PI / 180)) / Math.PI) / 2 * n), z }; };
        /* cada via y cada uso del suelo de los datos, con su regla */
        const sinVia = new Set(), sinUso = new Set(), clases = new Set();
        const pintaVia = estilo.paintRules.filter(x => x.dataLayer === 'roads');
        const pintaUso = estilo.paintRules.filter(x => x.dataLayer === 'landuse' && x.symbolizer.constructor.name === 'PolygonSymbolizer');
        for (const [la, ln] of [[28.4145, -16.5449], [28.531, -16.282], [28.049, -16.719], [28.4682, -16.2546], [28.258, -16.625], [28.247, -16.838], [28.0444, -16.5725], [28.487, -16.315]]) {
          for (const z of [12, 13, 14]) {
            let t; try { t = await view.getDisplayTile(tesela(la, ln, z)); } catch (e) { continue; }
            for (const f of (t.data.get('roads') || [])) {
              const k = f.props.kind + '/' + (f.props.kind_detail || '');
              if (!pintaVia.some(x => !x.filter || x.filter(16, f))) sinVia.add(k); else clases.add(k);
            }
            for (const f of (t.data.get('landuse') || [])) if (!pintaUso.some(x => !x.filter || x.filter(16, f))) sinUso.add(f.props.kind);
          }
        }
        /* el chino del fichero: name:zh-Hans y name:zh-Hant, no name:zh */
        const chino = { hans: 0, hant: 0, zh: 0, copia: 0 };
        { let t; try { t = await view.getDisplayTile(tesela(28.4682, -16.2546, 10)); } catch (e) {}
          for (const f of ((t && t.data.get('places')) || [])) { if (f.props['name:zh-Hans']) chino.hans++; if (f.props['name:zh-Hant']) chino.hant++; if (f.props['name:zh']) chino.zh++; if (f.props['name:zh-Hant'] && f.props['name:zh-Hant'] === f.props['name:zh-Hans']) chino.copia++; } }
        /* pintar de verdad: senderos en Anaga a z15, picos en las Cañadas a z14, matriculas a z12 */
        const map = L.map('m', { zoomControl: false, attributionControl: false, fadeAnimation: false });
        const pixeles = async (c, z, cual) => {
          map.setView(c, z, { animate: false });
          for (let i = 0; i < 100; i++) { await new Promise(r => setTimeout(r, 50)); const ts = Object.values((cual || capa)._tiles || {}); if (ts.length && ts.every(x => x.loaded)) break; }
          await new Promise(r => setTimeout(r, 400));
          /* solo lo que se ve: Leaflet guarda teselas de alrededor fuera de la pantalla */
          let total = 0; const cuenta = {};
          const M = document.getElementById('m').getBoundingClientRect();
          for (const cv of document.querySelectorAll('#m canvas')) {
            const R = cv.getBoundingClientRect(); if (!R.width || getComputedStyle(cv).opacity === '0') continue;
            const x0 = Math.max(R.left, M.left), y0 = Math.max(R.top, M.top), x1 = Math.min(R.right, M.right), y1 = Math.min(R.bottom, M.bottom);
            if (x1 <= x0 || y1 <= y0) continue;
            const ex = cv.width / R.width, ey = cv.height / R.height;
            const d = cv.getContext('2d').getImageData(Math.floor((x0 - R.left) * ex), Math.floor((y0 - R.top) * ey), Math.max(1, Math.floor((x1 - x0) * ex)), Math.max(1, Math.floor((y1 - y0) * ey))).data;
            for (let i = 0; i < d.length; i += 4) { total++; const k = d[i] + ',' + d[i + 1] + ',' + d[i + 2]; cuenta[k] = (cuenta[k] || 0) + 1; }
          }
          return { total, cuenta };
        };
        const cerca = (cuenta, hex, tol) => { const r0 = parseInt(hex.slice(1, 3), 16), g0 = parseInt(hex.slice(3, 5), 16), b0 = parseInt(hex.slice(5, 7), 16); let n = 0; for (const [k, v] of Object.entries(cuenta)) { const [r, g, b] = k.split(',').map(Number); if (Math.abs(r - r0) + Math.abs(g - g0) + Math.abs(b - b0) <= tol) n += v; } return n; };
        capa.addTo(map);
        const anaga = await pixeles([28.531, -16.282], 15);
        const senderos = 100 * cerca(anaga.cuenta, '#a0522d', 24) / anaga.total;
        const rotulos = (z, nombre) => {
          const i = capa.labelRules.findIndex(x => x.symbolizer.constructor.name === nombre);
          const idx = capa.labelers.getIndex(z); const out = [];
          if (idx) for (const set of idx.current.values()) for (const l of set) if (l.order === i) out.push(l);
          return out;
        };
        await pixeles([28.262, -16.615], 14);
        const picos = rotulos(14, 'SimboloPico').length;
        await pixeles([28.4145, -16.5449], 12);
        const refs = rotulos(12, 'SimboloRef');
        let repetidas = 0;
        for (let a = 0; a < refs.length; a++) for (let b = a + 1; b < refs.length; b++)
          if (refs[a].deduplicationKey === refs[b].deduplicationKey && refs[a].anchor.dist(refs[b].anchor) < 300) repetidas++;
        const mar = await pixeles([28.52, -16.55], 12);
        const delMar = 100 * cerca(mar.cuenta, MAPA_MAR, 3) / mar.total;
        capa.remove();
        /* lo mismo con el flavor 'light' de antes */
        const light = protomapsL.leafletLayer({ url: new pmtiles.PMTiles(fuente('b')), maxDataZoom: 14, flavor: 'light', lang: 'es' });
        light.addTo(map);
        const anagaL = await pixeles([28.531, -16.282], 15, light);
        const senderosLight = 100 * cerca(anagaL.cuenta, '#a0522d', 24) / anagaL.total;
        return { sinVia: [...sinVia], sinUso: [...sinUso], clases: clases.size, senderos: +senderos.toFixed(2), senderosLight: +senderosLight.toFixed(2),
                 picos, refs: refs.length, repetidas, delMar: +delMar.toFixed(1), chino };
      }, ['http://127.0.0.1:' + PUERTO + '/' + FICH]);
      ok(r.sinVia.length === 0, 'todas las vias de los datos (' + r.clases + ' tipos en 8 sitios, z12-z14) tienen su regla', r.sinVia.join(', '));
      const PERMITIDOS = ['national_park', 'nature_reserve', 'protected_area', 'other'];
      ok(r.sinUso.every(k => PERMITIDOS.includes(k)),
         'todos los usos del suelo tienen su color, salvo los espacios protegidos (del Parque Nacional, solo el borde)', r.sinUso.join(', '));
      ok(r.senderos >= 0.15, 'los senderos se ven: ' + r.senderos + ' % de la pantalla en Anaga a z15 es de su color (' + FICH + ')', JSON.stringify(r));
      ok(r.senderosLight < 0.05, 'y con el flavor light de antes, ' + r.senderosLight + ' %: la medida sabe ponerse en rojo', JSON.stringify(r));
      if (REAL) {
        ok(r.picos >= 3, 'salen los picos con su altitud: ' + r.picos + ' en las Cañadas a z14', JSON.stringify(r));
        ok(r.refs >= 2 && r.repetidas === 0, 'salen las matriculas de las carreteras (' + r.refs + ' en el Puerto a z12), ninguna repetida a menos de 300 px', JSON.stringify(r));
      }
      if (REAL) ok(r.chino.hans > 0 && r.chino.hant > 0 && r.chino.zh === 0,
         'y el fichero trae el chino asi: ' + r.chino.hans + ' sitios con name:zh-Hans alrededor de Santa Cruz a z10, ' + r.chino.zh + ' con name:zh', JSON.stringify(r.chino));
      /* si un dia el fichero trae el tradicional de verdad, esto lo canta: entonces se puede mirar
         otra vez si el mapa en chino usa sus nombres */
      if (REAL) ok(r.chino.hant > 0 && r.chino.copia === r.chino.hant,
         'pero en name:zh-Hant trae los mismos caracteres simplificados que en name:zh-Hans (' + r.chino.copia + ' de ' + r.chino.hant + '): por eso en chino los rotulos van en castellano', JSON.stringify(r.chino));

      /* La altitud de los picos y los rotulos en chino (31 de octubre de 2026). La altitud sale con
         los metros como los escribe la app en cada idioma: sus fichas del Teide dicen 3715 м en
         bulgaro, 3715米 en chino y 3715公尺 en chino tradicional. Y en chino los rotulos van en
         castellano. Lo mismo con el estilo tal como llego el 24 de octubre (las claves del fichero
         y ' m' en todos): la medida sabe ponerse en rojo. */
      const LENGUAS = ((html.match(/const SUPPORTED_LANGS = \[([^\]]*)\]/) || ['', ''])[1].match(/'([a-z]+)'/g) || []).map(x => x.replace(/'/g, ''));
      const ANTES = fDet.replace('function estiloIslaDetallada(P, idioma) {', 'function estiloIslaDetalladaAntes(P, idioma) {')
        .replace("const nombre = /^zh/.test(idioma) ? ['name'] : ['name:' + idioma, 'name'];", "const nombre = ['name:' + idioma, 'name'];")
        .replace('Math.round(p.elevation) + METROS', "Math.round(p.elevation) + ' m'");
      const sustituido = /estiloIslaDetalladaAntes/.test(ANTES) && ANTES.includes("const nombre = ['name:' + idioma, 'name'];") && ANTES.includes("Math.round(p.elevation) + ' m'");
      await page.addScriptTag({ content: ANTES });
      const r2 = await page.evaluate(async ([URL_F, LENGUAS]) => {
        const idiomaDe = l => (l === 'zht' ? 'zh-Hant' : l === 'zh' ? 'zh-Hans' : l);   // como construirIsla
        /* el rotulo de un pico de 3715 m, en cada idioma */
        const altitud = (fn, l) => {
          const est = fn(protomapsL, idiomaDe(l));
          const regla = est.labelRules.find(x => x.symbolizer.constructor.name === 'SimboloPico');
          const ctx = document.createElement('canvas').getContext('2d'), textos = [];
          const lab = regla.symbolizer.place({ scratch: ctx }, [[{ x: 100, y: 100 }]], { props: { name: 'Teide', elevation: 3715 } });
          const f0 = ctx.fillText;
          ctx.fillText = function (t, x, y) { textos.push(String(t)); return f0.call(this, t, x, y); };
          lab[0].draw(ctx);
          return textos.join(' / ');
        };
        const alt = {}, altAntes = {};
        for (const l of LENGUAS) { alt[l] = altitud(estiloIslaDetallada, l); altAntes[l] = altitud(estiloIslaDetalladaAntes, l); }
        /* los rotulos que se pintan de verdad alrededor de Santa Cruz a z11 */
        const blob = await (await fetch(URL_F)).blob();
        const div = document.createElement('div');
        div.style.cssText = 'width:512px;height:512px;position:absolute;left:0;top:600px';
        document.body.appendChild(div);
        const mapa = L.map(div, { zoomControl: false, attributionControl: false, fadeAnimation: false }).setView([28.4682, -16.2546], 11, { animate: false });
        const pintados = async (fn, l, k) => {
          const fuente = { getKey: () => k, getBytes: (o, n) => blob.slice(o, o + n).arrayBuffer().then(d => ({ data: d })) };
          const capa = protomapsL.leafletLayer(Object.assign({ url: new pmtiles.PMTiles(fuente), maxDataZoom: 14 }, fn(protomapsL, idiomaDe(l))));
          const textos = [], C = CanvasRenderingContext2D.prototype, f0 = C.fillText;
          C.fillText = function (t) { textos.push(String(t)); return f0.apply(this, arguments); };
          try {
            capa.addTo(mapa);
            for (let i = 0; i < 100; i++) { await new Promise(r => setTimeout(r, 50)); const ts = Object.values(capa._tiles || {}); if (ts.length && ts.every(x => x.loaded)) break; }
            await new Promise(r => setTimeout(r, 400));
          } finally { C.fillText = f0; capa.remove(); }
          return [...new Set(textos)];
        };
        const han = /[\u3400-\u9fff]/;
        const res = {};
        for (const [nom, fn, l, k] of [['zh', estiloIslaDetallada, 'zh', 'c'], ['zht', estiloIslaDetallada, 'zht', 'd'], ['es', estiloIslaDetallada, 'es', 'e'], ['zhtAntes', estiloIslaDetalladaAntes, 'zht', 'f']]) {
          const t = await pintados(fn, l, k);
          // «Santa Cruz de Tenerife» va en dos lineas (maxLineChars 14), y cada una se pinta aparte
          res[nom] = { textos: t.length, han: t.filter(x => han.test(x)), santaCruz: t.includes('Santa Cruz de') && t.includes('Tenerife') };
        }
        mapa.remove();
        return { alt, altAntes, res };
      }, ['http://127.0.0.1:' + PUERTO + '/' + FICH, LENGUAS]);
      const METROS_APP = { bg: ' м', zh: '米', zht: '公尺' };
      const fichaTeide = l => fs.readFileSync(path.join(RAIZ, l === 'es' ? 'index.html' : 'idiomas/' + l + '.json'), 'utf8');
      const malAlt = LENGUAS.filter(l => r2.alt[l] !== 'Teide / 3715' + (METROS_APP[l] || ' m'));
      const sinFicha = LENGUAS.filter(l => !new RegExp('715\\s?' + (METROS_APP[l] || ' m').trim() + '(?![A-Za-z])').test(fichaTeide(l)));
      ok(LENGUAS.length === 10 && malAlt.length === 0 && sinFicha.length === 0,
         'la altitud de los picos, con los metros de cada idioma, los de sus fichas del Teide: ' + LENGUAS.map(l => l + ' «' + (r2.alt[l] || '').split(' / ')[1] + '»').join(', '),
         JSON.stringify({ malAlt, sinFicha, alt: r2.alt }));
      const altRojo = LENGUAS.filter(l => r2.altAntes[l] !== 'Teide / 3715' + (METROS_APP[l] || ' m'));
      ok(sustituido && altRojo.join() === 'zh,zht,bg',
         'y con el estilo tal como llego (3715 m en todos), ' + altRojo.join(', ') + ' salen mal: la medida sabe ponerse en rojo', JSON.stringify(r2.altAntes));
      const RZ = r2.res;
      ok(RZ.es.santaCruz && RZ.zh.santaCruz && RZ.zht.santaCruz && RZ.zh.han.length === 0 && RZ.zht.han.length === 0 && RZ.zh.textos > 5,
         'en chino, los rotulos en castellano: alrededor de Santa Cruz a z11 se pintan ' + RZ.zh.textos + ' textos, ninguno en caracteres chinos, y la ciudad sale «Santa Cruz de Tenerife», como en castellano', JSON.stringify(RZ));
      ok(sustituido && RZ.zhtAntes.han.length > 0 && !RZ.zhtAntes.santaCruz,
         'y con las claves del fichero, el chino tradicional pintaba en simplificado (' + RZ.zhtAntes.han.join(', ') + '): la medida sabe ponerse en rojo', JSON.stringify(RZ.zhtAntes));
      ok(r.delMar >= 90, 'el mar se pinta del color del fondo (' + r.delMar + ' % de la pantalla, mar adentro)', JSON.stringify(r));
      ok(errores.length === 0, 'sin errores de pagina', errores.slice(0, 3).join(' | '));
    } finally {
      await browser8.close();
    }
  }

  /* ── BLOQUE 9 · los gestos de zoom de los moviles (24 de octubre de 2026, noche) ──

     Jerome: «mira si el zoom puede hacerse mejor todavía». Leaflet acerca medio nivel con el
     doble toque (zoomDelta, que aqui es 0,5), y no trae el toque con dos dedos (alejar) ni el
     zoom con un dedo (doble toque y arrastrar). La app los añade (gestosZoom). Aqui, con toques
     de verdad (Input.dispatchTouchEvent) en un movil emulado: cada gesto hace lo suyo y el punto
     tocado se queda en su sitio; un toque, arrastrar y pellizcar siguen como estaban. Y en una
     pagina con la Leaflet de vendor/ sola y las mismas opciones, los mismos toques: medio nivel,
     el mapa arrastrado y nada: la medida sabe ponerse en rojo. */
  console.log('\n════════ el mapa · bloque 9, los gestos ════════\n');
  {
    const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
    const leafletV = fs.readFileSync(path.join(RAIZ, 'vendor', 'leaflet.js'), 'utf8');
    ok(leafletV.includes('_onDoubleClick:function(t){var e=this._map,i=e.getZoom(),n=e.options.zoomDelta,i=t.originalEvent.shiftKey?i-n:i+n;"center"===e.options.doubleClickZoom?e.setZoom(i):e.setZoomAround(t.containerPoint,i)}'),
       'la Leaflet de vendor/ acerca zoomDelta con el doble clic: es lo que la app sustituye');
    const dbl = (html.match(/L\.Map\.DoubleClickZoom\.prototype\._onDoubleClick = function \(e\) \{[\s\S]*?\n\};\n/) || [''])[0];
    ok(/z2 = e\.originalEvent\.shiftKey \? z - 1 : z \+ 1;/.test(dbl) && /m\.setZoomAround\(e\.containerPoint, z2\)/.test(dbl) && html.indexOf(dbl) < html.indexOf("map = L.map('map', {"),
       'la app acerca un nivel entero con el doble clic, alrededor del punto (antes de crear el mapa)');
    ok(/\n\}\);\ngestosZoom\(map\);\n/.test(html) && /function gestosZoom\(map\) \{/.test(html),
       'y pone los gestos en cuanto crea el mapa');

    const PNG = fs.readFileSync(path.join(RAIZ, 'icon-192.png'));
    const browser9 = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-proxy-server', '--no-sandbox'] });
    try {
      const probar = async (ctx, page) => {
        const cdp = await ctx.newCDPSession(page);
        const toque = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map((q, i) => ({ x: q[0], y: q[1], id: i + 1, radiusX: 4, radiusY: 4, force: 1 })) });
        const espera = ms => new Promise(r => setTimeout(r, ms));
        const uno = async (x, y) => { await toque('touchStart', [[x, y]]); await espera(60); await toque('touchEnd', []); };
        const G = {
          'un toque': { p: [195, 300], f: () => uno(195, 300) },
          'doble toque': { p: [150, 300], f: async () => { await uno(150, 300); await espera(120); await uno(150, 300); } },
          'doble toque y abajo 120 px': { p: [240, 260], f: async () => { await uno(240, 260); await espera(120); await toque('touchStart', [[240, 260]]); await espera(40); for (let i = 1; i <= 15; i++) { await toque('touchMove', [[240, 260 + 8 * i]]); await espera(16); } await espera(40); await toque('touchEnd', []); } },
          'doble toque y arriba 180 px': { p: [200, 420], f: async () => { await uno(200, 420); await espera(120); await toque('touchStart', [[200, 420]]); await espera(40); for (let i = 1; i <= 15; i++) { await toque('touchMove', [[200, 420 - 12 * i]]); await espera(16); } await espera(40); await toque('touchEnd', []); } },
          'toque con dos dedos': { p: [200, 320], f: async () => { await toque('touchStart', [[150, 300], [250, 340]]); await espera(80); await toque('touchEnd', []); } },
          'arrastrar 100 px': { p: null, f: async () => { await toque('touchStart', [[200, 400]]); await espera(30); for (let i = 1; i <= 12; i++) { await toque('touchMove', [[200, 400 + 100 * i / 12]]); await espera(16); } await toque('touchEnd', []); } },
          'pellizcar x2': { p: [200, 330], f: () => cdp.send('Input.synthesizePinchGesture', { x: 200, y: 330, scaleFactor: 2, relativeSpeed: 600, gestureSourceType: 'touch' }) }
        };
        const caja = await page.evaluate(() => { const r = map.getContainer().getBoundingClientRect(); return { x: r.left, y: r.top }; });
        const res = {};
        for (const [nombre, g] of Object.entries(G)) {
          await page.evaluate(() => { map.setView([28.43, -16.545], 13, { animate: false }); });
          await espera(700);
          const pc = g.p ? [g.p[0] - caja.x, g.p[1] - caja.y] : null;
          const a = await page.evaluate(pc => ({ z: map.getZoom(), c: map.getCenter(), ll: pc && map.containerPointToLatLng(pc), clics: window.__clics }), pc);
          await g.f();
          await espera(900);
          const d = await page.evaluate(a => { const q = a.ll && map.latLngToContainerPoint(a.ll); const c0 = map.latLngToContainerPoint(a.c); return { z: map.getZoom(), q: q && [q.x, q.y], mov: c0.distanceTo(map.getSize().divideBy(2)), clics: window.__clics - a.clics }; }, a);
          res[nombre] = { dz: +(d.z - a.z).toFixed(2), deriva: pc && d.q ? +Math.hypot(d.q[0] - pc[0], d.q[1] - pc[1]).toFixed(1) : null, mov: +d.mov.toFixed(0), clics: d.clics };
        }
        return res;
      };
      const ctx = await browser9.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
      const page = await ctx.newPage();
      const errores = []; page.on('pageerror', e => errores.push(e.message));
      await page.route(/tile\.openstreetmap\.org/, r => r.fulfill({ status: 200, contentType: 'image/png', body: PNG }));
      await page.route(/^https?:\/\/(?!127\.0\.0\.1)(?!.*tile\.openstreetmap\.org)/, r => r.abort());
      await page.addInitScript(() => { try { localStorage.setItem('tenerife.tour.seen', '99'); localStorage.setItem('tgo_consent', JSON.stringify({ v: 'denied', t: Date.now() })); } catch (e) {} });
      await page.goto('http://127.0.0.1:' + PUERTO + '/index.html', { waitUntil: 'load' });
      if (await page.$('.v19-w-lang[data-lang="es"]')) { await page.click('.v19-w-lang[data-lang="es"]'); await page.waitForTimeout(200); await page.click('#v19-welcome-start'); }
      await page.waitForTimeout(1200);
      await page.evaluate(() => { window.__clics = 0; map.on('click', () => window.__clics++); });
      const app = await probar(ctx, page);
      const t = JSON.stringify;
      ok(app['un toque'].dz === 0 && app['un toque'].clics === 1, 'un toque: ni zoom ni movimiento, y la app recibe su clic', t(app['un toque']));
      ok(app['doble toque'].dz === 1 && app['doble toque'].deriva <= 1, 'doble toque: acerca un nivel entero y el punto tocado no se mueve (' + app['doble toque'].deriva + ' px)', t(app['doble toque']));
      ok(app['doble toque y abajo 120 px'].dz === 1 && app['doble toque y abajo 120 px'].deriva <= 1, 'doble toque y arrastrar hacia abajo 120 px: acerca un nivel, alrededor del punto tocado', t(app['doble toque y abajo 120 px']));
      ok(app['doble toque y arriba 180 px'].dz === -1.5 && app['doble toque y arriba 180 px'].deriva <= 1, 'doble toque y arrastrar hacia arriba 180 px: aleja nivel y medio, alrededor del punto tocado', t(app['doble toque y arriba 180 px']));
      ok(app['toque con dos dedos'].dz === -1 && app['toque con dos dedos'].deriva <= 1 && app['toque con dos dedos'].clics === 0, 'toque con dos dedos: aleja un nivel, alrededor del punto entre los dedos', t(app['toque con dos dedos']));
      ok(app['arrastrar 100 px'].dz === 0 && Math.abs(app['arrastrar 100 px'].mov - 100) <= 2, 'arrastrar con un dedo sigue moviendo el mapa, sin zoom', t(app['arrastrar 100 px']));
      ok(app['pellizcar x2'].dz >= 1 && app['pellizcar x2'].deriva <= 1, 'y el pellizco sigue acercando, con el punto entre los dedos quieto', t(app['pellizcar x2']));
      /* un segundo dedo a mitad del zoom con un dedo: se ignora, y el pellizco de despues funciona */
      const borde = await (async () => {
        const cdp = await ctx.newCDPSession(page);
        const toque = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map((q, i) => ({ x: q[0], y: q[1], id: i + 1, radiusX: 4, radiusY: 4, force: 1 })) });
        const espera = ms => new Promise(r => setTimeout(r, ms));
        await page.evaluate(() => map.setView([28.43, -16.545], 13, { animate: false })); await espera(600);
        await toque('touchStart', [[200, 300]]); await espera(60); await toque('touchEnd', []); await espera(120);
        await toque('touchStart', [[200, 300]]); await espera(40);
        for (let i = 1; i <= 6; i++) { await toque('touchMove', [[200, 300 + 10 * i]]); await espera(16); }
        await toque('touchStart', [[200, 360], [300, 500]]); await espera(40);
        for (let i = 1; i <= 6; i++) { await toque('touchMove', [[200, 360 + 5 * i], [300, 500 + 20 * i]]); await espera(16); }
        await toque('touchEnd', []); await espera(900);
        const z1 = await page.evaluate(() => map.getZoom());
        await page.evaluate(() => map.setView([28.43, -16.545], 13, { animate: false })); await espera(600);
        await cdp.send('Input.synthesizePinchGesture', { x: 200, y: 330, scaleFactor: 2, relativeSpeed: 600, gestureSourceType: 'touch' });
        await espera(900);
        return { z1, pellizco: await page.evaluate(() => map.getZoom()) };
      })();
      ok(borde.z1 === 13.5 && borde.pellizco > 13.9, 'un segundo dedo a mitad del zoom con un dedo se ignora (60 px, medio nivel), y el pellizco de despues funciona', t(borde));
      /* un toque en un marcador sigue siendo de Leaflet: abre su ventana y no hay zoom */
      const marcador = await (async () => {
        const cdp = await ctx.newCDPSession(page);
        const toque = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map((q, i) => ({ x: q[0], y: q[1], id: i + 1, radiusX: 4, radiusY: 4, force: 1 })) });
        await page.evaluate(() => { map.closePopup(); map.setView([28.4145, -16.5449], 15, { animate: false }); window.__pop = 0; map.on('popupopen', () => window.__pop++); });
        await page.waitForTimeout(1500);
        const m = await page.evaluate(() => {
          const r = [...document.querySelectorAll('.leaflet-marker-icon')].filter(e => !e.classList.contains('marker-cluster'))
            .map(e => e.getBoundingClientRect()).find(r => r.top > 150 && r.bottom < 700 && r.left > 20 && r.right < 370);
          return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null;
        });
        if (!m) return null;
        const z0 = await page.evaluate(() => map.getZoom());
        await toque('touchStart', [[m.x, m.y]]); await page.waitForTimeout(60); await toque('touchEnd', []); await page.waitForTimeout(800);
        return await page.evaluate(z0 => ({ ventanas: window.__pop, dz: map.getZoom() - z0 }), z0);
      })();
      ok(marcador && marcador.ventanas === 1 && marcador.dz === 0, 'un toque en un marcador sigue abriendo su ventana, sin zoom', t(marcador));
      ok(errores.length === 0, 'sin errores de pagina', errores.slice(0, 3).join(' | '));
      await ctx.close();

      /* la Leaflet de vendor/ sola, con las opciones de zoom de la app */
      const ctx2 = await browser9.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
      const page2 = await ctx2.newPage();
      await page2.setContent(`
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
        <link rel="stylesheet" href="http://127.0.0.1:${PUERTO}/vendor/leaflet.css">
        <style>html,body{margin:0}#m{width:390px;height:788px;margin-top:56px}</style><div id="m"></div>
        <script src="http://127.0.0.1:${PUERTO}/vendor/leaflet.js"><\/script>`, { waitUntil: 'networkidle' });
      await page2.evaluate(() => { window.map = L.map('m', { zoomSnap: 0.5, zoomDelta: 0.5, zoomControl: false }).setView([28.43, -16.545], 13); window.__clics = 0; map.on('click', () => window.__clics++); });
      const sola = await probar(ctx2, page2);
      ok(sola['doble toque'].dz === 0.5 && sola['doble toque y abajo 120 px'].dz === 0 && sola['doble toque y abajo 120 px'].mov >= 100 && sola['toque con dos dedos'].dz === 0,
         'y con la Leaflet de vendor/ sola: medio nivel, el mapa arrastrado y nada; la medida sabe ponerse en rojo', t({ doble: sola['doble toque'], arrastre: sola['doble toque y abajo 120 px'], dos: sola['toque con dos dedos'] }));
      await ctx2.close();
    } finally {
      await browser9.close();
    }
  }

  console.log('\n  ' + (fallos ? fallos + ' MAL de ' + hechos : hechos + ' controles, todos en verde') + '\n');
  process.exit(fallos ? 1 : 0);
})();
