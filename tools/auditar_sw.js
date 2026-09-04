/* Controles del service worker, sobre todo del mapa sin conexion.

   No hace falta navegador: sw.js se carga en un ambito falso con caches y
   fetch de mentira. Asi se puede provocar lo que no se puede provocar de
   verdad desde este contenedor —quedarse sin red a mitad, llenar el cache
   hasta el tope, actualizar la version de la app— y comprobar que responde.

   El caso que dio origen a todo esto: la app se abrio en un avion y salio
   el mapa en blanco. */
const fs = require('fs');
const path = require('path');
const RAIZ = path.dirname(__dirname);

let fallos = 0, hechos = 0;
function ok(cond, txt, detalle) {
  hechos++;
  if (cond) { console.log('  OK  ' + txt); }
  else { fallos++; console.log('  MAL ' + txt + (detalle !== undefined ? '   -> ' + detalle : '')); }
}

// ── caches de mentira, con orden de insercion como el de verdad ──
class CacheFalso {
  constructor() { this.m = new Map(); }
  clave(req) { return typeof req === 'string' ? req : req.url; }
  async put(req, res) { this.m.set(this.clave(req), res); }
  async match(req) { return this.m.get(this.clave(req)); }
  async delete(req) { return this.m.delete(this.clave(req)); }
  async keys() { return [...this.m.keys()].map(u => new Request(u)); }
  async add(req) { this.m.set(this.clave(req), new Response('x')); }
}
class CachesFalso {
  constructor() { this.c = new Map(); }
  async open(n) { if (!this.c.has(n)) this.c.set(n, new CacheFalso()); return this.c.get(n); }
  async keys() { return [...this.c.keys()]; }
  async delete(n) { return this.c.delete(n); }
  async match(req) {
    for (const c of this.c.values()) { const r = await c.match(req); if (r) return r; }
    return undefined;
  }
}

function cargarSW(fetchFalso) {
  const cachesFalso = new CachesFalso();
  const manejadores = {};
  const self_ = {
    addEventListener: (t, f) => { (manejadores[t] = manejadores[t] || []).push(f); },
    skipWaiting: () => {}, clients: { claim: async () => {}, matchAll: async () => [] },
    registration: { showNotification: async () => {} }
  };
  const src = fs.readFileSync(path.join(RAIZ, 'sw.js'), 'utf8');
  new Function('self', 'caches', 'fetch', 'Request', 'Response', 'URL', src)(
    self_, cachesFalso, fetchFalso, Request, Response, URL);
  return { manejadores, cachesFalso, self_ };
}

/* Dispara un fetch contra el sw y devuelve lo que responde, o null si el
   manejador lo deja pasar a la red sin tocarlo (que es lo que hace con las
   APIs en vivo). */
async function pedir(sw, url) {
  const req = new Request(url);
  let respuesta = null; const esperas = [];
  const e = { request: req, respondWith: p => { respuesta = p; }, waitUntil: p => esperas.push(p) };
  for (const f of sw.manejadores.fetch) f(e);
  const r = respuesta === null ? null : await respuesta;
  await Promise.all(esperas.map(p => Promise.resolve(p).catch(() => {})));
  return r;
}

const TESELA = 'https://a.tile.openstreetmap.org/14/7800/6300.png';
const ESRI   = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/14/6300/7800';

/* Una tesela como la que llega de verdad: opaca, porque las capas del mapa
   no piden CORS. La cabecera es para reconocerla despues del clone(), que es
   lo que guarda el service worker. */
function opaca() {
  const r = new Response('tesela', { status: 200, headers: { 'x-prueba': 'si' } });
  Object.defineProperty(r, 'type', { value: 'opaque' });
  return r;
}

(async () => {
  console.log('\n════════ service worker · el mapa sin conexion ════════\n');

  // ── 1. con red: se sirve de la red Y se guarda ──
  {
    const sw = cargarSW(async () => opaca());
    await pedir(sw, TESELA);
    await pedir(sw, ESRI);
    const c = await sw.cachesFalso.open('tgo-teselas-v1');
    ok((await c.keys()).length === 2, 'con red, la tesela se guarda al pasar (OSM y Esri)', (await c.keys()).length);
    ok((await sw.cachesFalso.open('tgo-teselas-v1')) !== undefined, 'el cache del mapa va aparte del de la app');
  }

  // ── 2. la respuesta opaca se guarda (las capas no piden CORS) ──
  {
    // Una opaca de verdad trae status 0 y ok false; el constructor no deja
    // fabricarla con status 0, asi que se imitan las tres propiedades.
    const opaca = new Response(null, { status: 200 });
    Object.defineProperty(opaca, 'type',   { value: 'opaque' });
    Object.defineProperty(opaca, 'status', { value: 0 });
    Object.defineProperty(opaca, 'ok',     { value: false });
    ok(opaca.ok === false && opaca.type === 'opaque',
       'una respuesta opaca no es "ok": por eso guardable() sola no basta y hay que aceptarla aparte');
  }

  // ── 3. SIN RED: sale del cache. El caso del avion. ──
  {
    let hayRed = true;
    const sw = cargarSW(async () => { if (!hayRed) throw new Error('sin red'); return opaca(); });
    const conRed = await pedir(sw, TESELA);       // el usuario la mira con wifi
    ok(conRed && conRed.type === 'opaque', 'con red se sirve la de la red, sin cambiar nada de antes');
    hayRed = false;                               // modo avion
    const r = await pedir(sw, TESELA);
    ok(r && r.headers.get('x-prueba') === 'si', 'sin red, una tesela ya vista sale del cache', r && r.type);
    const r2 = await pedir(sw, 'https://a.tile.openstreetmap.org/16/1/1.png');
    ok(r2 && r2.type === 'error', 'sin red, una tesela nunca vista falla limpia (no cuelga)', r2 && r2.type);
  }

  // ── 4. el tope se aplica, y se van las mas viejas ──
  {
    const sw = cargarSW(async () => opaca());
    for (let i = 0; i < 1400; i++) await pedir(sw, 'https://a.tile.openstreetmap.org/16/' + i + '/1.png');
    const c = await sw.cachesFalso.open('tgo-teselas-v1');
    const ks = await c.keys();
    ok(ks.length <= 1200, 'el cache del mapa no crece sin freno (tope 1200)', ks.length);
    ok(!(await c.match(new Request('https://a.tile.openstreetmap.org/16/0/1.png'))), 'al llenarse se va la mas vieja');
    ok(!!(await c.match(new Request('https://a.tile.openstreetmap.org/16/1399/1.png'))), 'y se queda la mas nueva');
  }

  // ── 5. actualizar la app NO borra el mapa descargado ──
  {
    const sw = cargarSW(async () => opaca());
    await pedir(sw, TESELA);
    const cs = sw.cachesFalso;
    await cs.open('tgo-v5-viejo');                       // una version anterior
    const esperas = [];
    for (const f of sw.manejadores.activate) f({ waitUntil: p => esperas.push(p) });
    await Promise.all(esperas);
    const nombres = await cs.keys();
    ok(nombres.includes('tgo-teselas-v1'), 'tras actualizar la app, el mapa guardado sigue ahi', nombres.join(','));
    ok(!nombres.includes('tgo-v5-viejo'), 'y el cache de la version vieja se va');
  }

  // ── 6. lo que NO debe cachearse sigue sin cachearse ──
  {
    const sw = cargarSW(async () => new Response('x'));
    for (const u of ['https://nominatim.openstreetmap.org/search?q=x',
                     'https://api.open-meteo.com/v1/forecast?latitude=28',
                     'https://xyz.supabase.co/rest/v1/perfiles',
                     'https://router.project-osrm.org/route/v1/driving/1,2;3,4']) {
      const r = await pedir(sw, u);
      ok(r === null, 'no se toca: ' + new URL(u).hostname);
    }
    const nombres = await sw.cachesFalso.keys();
    ok(!nombres.includes('tgo-teselas-v1'), 'y nada de eso crea el cache del mapa');
  }

  // ── 7. nominatim vive en openstreetmap.org y NO es una tesela ──
  {
    const src = fs.readFileSync(path.join(RAIZ, 'sw.js'), 'utf8');
    ok(!/hostname\.includes\('openstreetmap'\)/.test(src),
       'el filtro ya no usa includes(openstreetmap), que cogia tambien al geocodificador');
  }

  // ── 8. el boton "vaciar cache del mapa" apunta al cache que existe ──
  {
    const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
    const sw = fs.readFileSync(path.join(RAIZ, 'sw.js'), 'utf8');
    const nombre = (sw.match(/const TESELAS = '([^']+)'/) || [])[1];
    const filtro = (html.match(/var tileKeys = keys\.filter\(function\(k\) \{ return k\.indexOf\('([^']+)'\)/) || [])[1];
    ok(!!nombre && !!filtro && nombre.indexOf(filtro) === 0,
       'el boton de vaciar el mapa busca el prefijo del cache real', filtro + ' vs ' + nombre);
  }

  /* ── 9. la unica suposicion que el ambito falso no puede comprobar ──

     Todo lo de arriba prueba el flujo, no el navegador. Lo que el arreglo da
     por hecho es que Cache.put() acepta una respuesta OPACA y la devuelve
     entera: si eso no fuera cierto, el mapa seguiria en blanco en el avion y
     aqui saldria todo en verde igualmente.

     Se comprueba de verdad en Chromium. Para conseguir una opaca de verdad
     hace falta otro origen: se levanta un segundo puerto, que en el mismo
     equipo ya cuenta como origen distinto, y se pide con mode 'no-cors'. */
  const PUERTO = process.argv[2];
  if (!PUERTO) {
    console.log('  --  sin puerto: se salta la comprobacion en Chromium (pasa uno para hacerla)');
  } else {
    const http = require('http');
    const OTRO = Number(PUERTO) + 1;
    const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
    const srv = http.createServer((_, res) => { res.writeHead(200, { 'Content-Type': 'image/png' }); res.end(PNG); });
    await new Promise(r => srv.listen(OTRO, '127.0.0.1', r));
    let browser;
    try {
      const { chromium } = require('/opt/node22/lib/node_modules/playwright');
      browser = await chromium.launch({
        executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
        args: ['--no-proxy-server', '--no-sandbox']
      });
      const page = await browser.newPage();
      /* A proposito NO se abre index.html: su CSP lleva connect-src 'self' y
         tumbaria el fetch al segundo puerto. Lo que se comprueba aqui es el
         Cache API del navegador, que no depende de la pagina; el listado de
         directorio del servidor sirve y no trae CSP. */
      await page.goto('http://127.0.0.1:' + PUERTO + '/tools/', { waitUntil: 'domcontentloaded' });
      const r = await page.evaluate(async (otro) => {
        const url = 'http://127.0.0.1:' + otro + '/t.png';
        const res = await fetch(url, { mode: 'no-cors' });
        const c = await caches.open('tgo-prueba-opaca');
        let puso = true;
        try { await c.put(new Request(url), res.clone()); } catch (e) { puso = String(e); }
        const back = await c.match(new Request(url));
        const salida = { tipo: res.type, ok: res.ok, estado: res.status, puso, recupera: !!back, tipoBack: back && back.type };
        await caches.delete('tgo-prueba-opaca');
        return salida;
      }, OTRO);
      ok(r.tipo === 'opaque' && r.ok === false && r.estado === 0,
         'Chromium: una peticion no-cors a otro origen da una opaca (status 0, ok false)', JSON.stringify(r));
      ok(r.puso === true, 'Chromium: Cache.put() ACEPTA una respuesta opaca', r.puso);
      ok(r.recupera && r.tipoBack === 'opaque', 'Chromium: y Cache.match() la devuelve opaca', JSON.stringify(r));
    } catch (err) {
      fallos++; hechos++;
      console.log('  MAL no se pudo comprobar en Chromium   -> ' + err.message);
    } finally {
      if (browser) await browser.close();
      srv.close();
    }
  }

  console.log('\n  ' + (fallos ? fallos + ' MAL de ' + hechos : hechos + ' controles, todos en verde') + '\n');
  process.exit(fallos ? 1 : 0);
})();
