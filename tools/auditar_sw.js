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

/* `Peticion`: el Request con el que corre sw.js. El de Node no acepta rutas
   relativas ('./datos/cielo.json'), y la instalacion pide el precache asi:
   para probarla hace falta uno que las resuelva contra el sitio (9c). */
/* `fuente`: otro texto de sw.js en vez del del repositorio (9e lo usa para
   probar las dos huellas del relieve). */
function cargarSW(fetchFalso, Peticion = Request, fuente) {
  const cachesFalso = new CachesFalso();
  const manejadores = {};
  const self_ = {
    addEventListener: (t, f) => { (manejadores[t] = manejadores[t] || []).push(f); },
    skipWaiting: () => {}, clients: { claim: async () => {}, matchAll: async () => [] },
    registration: { showNotification: async () => {} }
  };
  const src = fuente || fs.readFileSync(path.join(RAIZ, 'sw.js'), 'utf8');
  new Function('self', 'caches', 'fetch', 'Request', 'Response', 'URL', src)(
    self_, cachesFalso, fetchFalso, Peticion, Response, URL);
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

/* Las teselas que se guardan son las de Esri. Las de OpenStreetMap van solo
   por red desde el 16 de octubre de 2026 (LANZAMIENTO-PLAY.md 1.6): su
   politica no permite usarlas sin conexion. */
const OSM    = 'https://a.tile.openstreetmap.org/14/7800/6300.png';
const ESRI   = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/14/6300/7800';
const esri = (z, y, x) => 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/' + z + '/' + y + '/' + x;

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
    const rOsm = await pedir(sw, OSM);
    await pedir(sw, ESRI);
    const c = await sw.cachesFalso.open('tgo-teselas-v1');
    ok((await c.keys()).length === 1, 'con red, la tesela de Esri se guarda al pasar', (await c.keys()).length);
    ok(rOsm === null, 'la de OpenStreetMap no pasa por el service worker: solo red, como pide su politica de teselas');
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
    const conRed = await pedir(sw, ESRI);         // el usuario la mira con wifi
    ok(conRed && conRed.type === 'opaque', 'con red se sirve la de la red, sin cambiar nada de antes');
    hayRed = false;                               // modo avion
    const r = await pedir(sw, ESRI);
    ok(r && r.headers.get('x-prueba') === 'si', 'sin red, una tesela de Esri ya vista sale del cache', r && r.type);
    const r2 = await pedir(sw, esri(16, 1, 1));
    ok(r2 && r2.type === 'error', 'sin red, una tesela nunca vista falla limpia (no cuelga)', r2 && r2.type);
    // una de OSM guardada por una version de antes: sin red NO se contesta desde Cache Storage
    await (await sw.cachesFalso.open('tgo-teselas-v1')).put(new Request(OSM), opaca());
    const r3 = await pedir(sw, OSM);
    ok(r3 === null, 'sin red, una tesela de OSM no sale de Cache Storage aunque este guardada (la app pasa a «Isla offline»)');
  }

  // ── 4. el tope se aplica, y se van las mas viejas ──
  {
    const sw = cargarSW(async () => opaca());
    for (let i = 0; i < 1400; i++) await pedir(sw, esri(16, 1, i));
    const c = await sw.cachesFalso.open('tgo-teselas-v1');
    const ks = await c.keys();
    ok(ks.length <= 1200, 'el cache del mapa no crece sin freno (tope 1200)', ks.length);
    ok(!(await c.match(new Request(esri(16, 1, 0)))), 'al llenarse se va la mas vieja');
    ok(!!(await c.match(new Request(esri(16, 1, 1399)))), 'y se queda la mas nueva');
  }

  // ── 5. actualizar la app NO borra el mapa descargado ──
  {
    const sw = cargarSW(async () => opaca());
    await pedir(sw, ESRI);
    const cs = sw.cachesFalso;
    await cs.open('tgo-v5-viejo');                       // una version anterior
    // y una tesela de OSM que guardo una version de antes del 16 de octubre
    await (await cs.open('tgo-teselas-v1')).put(new Request(OSM), opaca());
    const esperas = [];
    for (const f of sw.manejadores.activate) f({ waitUntil: p => esperas.push(p) });
    await Promise.all(esperas);
    const nombres = await cs.keys();
    ok(nombres.includes('tgo-teselas-v1'), 'tras actualizar la app, el mapa guardado sigue ahi', nombres.join(','));
    ok(!nombres.includes('tgo-v5-viejo'), 'y el cache de la version vieja se va');
    const tc = await cs.open('tgo-teselas-v1');
    ok(!(await tc.match(new Request(OSM))) && !!(await tc.match(new Request(ESRI))),
       'al activar se van las teselas de OSM guardadas antes, y las de Esri se quedan');
  }

  // ── 6. lo que NO debe cachearse sigue sin cachearse ──
  {
    const sw = cargarSW(async () => new Response('x'));
    for (const u of ['https://nominatim.openstreetmap.org/search?q=x',
                     'https://api.open-meteo.com/v1/forecast?latitude=28',
                     'https://xyz.supabase.co/rest/v1/perfiles',
                     'https://router.project-osrm.org/route/v1/driving/1,2;3,4',
                     'https://api.pwnedpasswords.com/range/5BAA6']) {
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

  /* ── 9. la red de guaguas va con la app ──

     datos/titsa.js salio de index.html el 9 de octubre de 2026 y la app lo
     carga al arrancar. Dos cosas que solo se ven aqui:
       · tiene que estar en el precache: si no, quien abre la app sin
         conexion se queda sin guaguas;
       · y tiene que servirse RED PRIMERO, como index.html: con
         `cached || fetch` la primera red guardada se quedaria para siempre,
         que es el fallo que ya tuvo la prevision del tiempo. */
  {
    const src = fs.readFileSync(path.join(RAIZ, 'sw.js'), 'utf8');
    const core = (src.match(/const CORE = \[([\s\S]*?)\];/) || [, ''])[1];
    ok(/'\.\/datos\/titsa\.js'/.test(core), 'datos/titsa.js esta en el precache (CORE)');
    const basica = txt => { const r = new Response(txt, { status: 200 }); Object.defineProperty(r, 'type', { value: 'basic' }); return r; };
    let version = 'red-1', hayRed = true;
    const sw = cargarSW(async () => { if (!hayRed) throw new Error('sin red'); return basica(version); });
    const U = 'https://tenerifego.app/datos/titsa.js';
    const espera = () => new Promise(r => setTimeout(r, 20));
    const r1 = await pedir(sw, U); await espera();
    ok(r1 && await r1.text() === 'red-1', 'con red, la red de guaguas sale de la red');
    version = 'red-2';
    const r2 = await pedir(sw, U); await espera();
    const t2 = r2 && await r2.text();
    ok(t2 === 'red-2', 'red primero: una red nueva llega aunque ya haya otra guardada', t2);
    hayRed = false;
    const r3 = await pedir(sw, U);
    const t3 = r3 && await r3.text();
    ok(t3 === 'red-2', 'sin red, sale la ultima guardada', t3);
  }

  /* ── 9b. las paginas que pide Google Play, red primero ──

     borrar-cuenta.html y privacidad.html (LANZAMIENTO-PLAY.md 1.2 y 1.3)
     son texto legal: si la politica cambia, nadie se puede quedar leyendo
     la vieja porque la primera que entro se quedo en el cache. */
  {
    const basica = txt => { const r = new Response(txt, { status: 200 }); Object.defineProperty(r, 'type', { value: 'basic' }); return r; };
    const espera = () => new Promise(r => setTimeout(r, 20));
    for (const pag of ['borrar-cuenta.html', 'privacidad.html']) {
      let version = 'texto-1', hayRed = true;
      const sw = cargarSW(async () => { if (!hayRed) throw new Error('sin red'); return basica(version); });
      const U = 'https://tenerifego.app/' + pag;
      await pedir(sw, U); await espera();
      version = 'texto-2';
      const r2 = await pedir(sw, U); await espera();
      const t2 = r2 && await r2.text();
      ok(t2 === 'texto-2', pag + ': red primero, el texto nuevo llega aunque ya haya otro guardado', t2);
      hayRed = false;
      const r3 = await pedir(sw, U);
      const t3 = r3 && await r3.text();
      ok(t3 === 'texto-2', pag + ': sin red, sale la ultima guardada', t3);
    }
  }

  /* ── 9c. el cielo de Tenerife, en el Teide y sin cobertura ──

     El panel (modulos/cielo.js), su motor de calculo y su catalogo no se
     piden al arrancar la app: los pide el panel la primera vez que se abre
     (17 de octubre de 2026). Donde se usan es en las Cañadas y en Izaña, que
     es justo donde no hay cobertura, asi que:
       · los tres tienen que entrar en el precache al INSTALAR, sin que nadie
         haya abierto el panel antes;
       · sin red, los tres salen del cache;
       · el modulo y el catalogo, red primero (cambian con la app); el motor,
         de vendor/, como las otras librerias. */
  {
    const src = fs.readFileSync(path.join(RAIZ, 'sw.js'), 'utf8');
    const core = (src.match(/const CORE = \[([\s\S]*?)\];/) || [, ''])[1];
    const CIELO = ['modulos/cielo.js', 'vendor/astronomy.browser.min.js', 'datos/cielo.json'];
    for (const f of CIELO) ok(core.includes("'./" + f + "'"), f + ' esta en el precache (CORE)');
    const SITIO = 'https://tenerifego.app/';
    class Peticion extends Request {
      constructor(u, o) { super(typeof u === 'string' ? new URL(u, SITIO).href : u, o); }
    }
    const basica = txt => { const r = new Response(txt, { status: 200 }); Object.defineProperty(r, 'type', { value: 'basic' }); return r; };
    const espera = () => new Promise(r => setTimeout(r, 20));
    let version = 'red-1', hayRed = true;
    const sw = cargarSW(async () => { if (!hayRed) throw new Error('sin red'); return basica(version); }, Peticion);
    const esperas = [];
    for (const f of sw.manejadores.install) f({ waitUntil: p => esperas.push(p) });
    await Promise.all(esperas);
    const app = await sw.cachesFalso.open((src.match(/const CACHE = '([^']+)'/) || [])[1]);
    for (const f of CIELO) ok(!!(await app.match(new Request(SITIO + f))), 'al instalar la app, ' + f + ' entra en el cache sin abrir el panel');
    hayRed = false;
    for (const f of CIELO) {
      const r = await pedir(sw, SITIO + f);
      ok(r && r.status === 200, 'sin red, ' + f + ' sale del cache', r && r.status);
    }
    hayRed = true;
    for (const f of ['modulos/cielo.js', 'datos/cielo.json']) {
      version = 'red-1'; await pedir(sw, SITIO + f); await espera();
      version = 'red-2';
      const r2 = await pedir(sw, SITIO + f); await espera();
      const t2 = r2 && await r2.text();
      ok(t2 === 'red-2', f + ': red primero, una version nueva llega aunque ya haya otra guardada', t2);
    }
  }

  /* ── 9d. las notificaciones: cada una con su tag, y al tocarla, su guia ──
     El consejo del domingo y el aviso del semaforo (24 de octubre de 2026)
     llevan a una guia del panel SOS. Con la app cerrada, se abre con esa
     direccion; con la app ya abierta, traerla al frente no basta: el service
     worker le dice a la pagina que guia abrir. */
  {
    const SITIO = 'https://tenerifego.app/';
    const sw = cargarSW(async () => { throw new Error('sin red'); });
    const mostradas = [];
    sw.self_.registration.showNotification = async (t, o) => { mostradas.push({ t, o }); };
    const empujar = async datos => {
      let p = null;
      for (const f of sw.manejadores.push || []) f({ data: { json: () => datos, text: () => JSON.stringify(datos) }, waitUntil: x => { p = x; } });
      await p;
      return mostradas[mostradas.length - 1];
    };
    const d = await empujar({ title: 'Buenos días ☀️', body: 'frase', url: SITIO, lang: 'es' });
    ok(d && d.t === 'Buenos días ☀️' && d.o.tag === 'tgo-diaria' && d.o.data.url === SITIO,
       'la frase de cada dia sale con su tag de siempre (tgo-diaria) y su direccion', JSON.stringify(d && d.o));
    const g = await empujar({ title: 'El semáforo volcánico', body: 'b', url: SITIO + '#sos-semaforo', lang: 'es', tag: 'tgo-semaforo' });
    ok(g && g.o.tag === 'tgo-semaforo' && g.o.data.url === SITIO + '#sos-semaforo',
       'el aviso del semaforo sale con su tag (no borra la frase del dia) y lleva a #sos-semaforo', JSON.stringify(g && g.o));

    const tocar = async (abiertas, url) => {
      sw.self_.registration.scope = SITIO;
      const hechas = { mensajes: [], foco: 0, abre: [] };
      const ventanas = abiertas.map(u => ({ url: u, focus: async () => { hechas.foco++; }, postMessage: m => hechas.mensajes.push(m) }));
      sw.self_.clients.matchAll = async () => ventanas;
      sw.self_.clients.openWindow = async u => { hechas.abre.push(u); };
      let p = null;
      for (const f of sw.manejadores.notificationclick || []) f({ notification: { close() {}, data: { url } }, waitUntil: x => { p = x; } });
      await p;
      return hechas;
    };
    const guia = SITIO + '#sos-esalert';
    const a = await tocar([SITIO + 'index.html'], guia);
    ok(a.foco === 1 && a.abre.length === 0 && a.mensajes.length === 1 && a.mensajes[0].tgo === 'abrir' && a.mensajes[0].url === guia,
       'con la app abierta, tocar el consejo la trae al frente y le dice que abra su guia', JSON.stringify(a));
    const c = await tocar([], guia);
    ok(c.abre.length === 1 && c.abre[0] === guia && c.foco === 0, 'con la app cerrada, la abre en la guia del consejo', JSON.stringify(c));
    const o = await tocar(['https://otro.sitio.invalid/'], guia);
    ok(o.abre.length === 1 && o.mensajes.length === 0, 'una ventana de otro sitio no recibe nada: se abre la app', JSON.stringify(o));
  }

  /* ── 9e. el relieve de «La isla en 3D» (31 de octubre de 2026) ──
     Con RELIEVE_HUELLA = 'ninguno' (el relieve aun no se ha generado), la
     instalacion no pide sus tres ficheros: serian tres 404 cada vez. Con una
     huella, los guarda los tres con el modulo: es lo que deja el 3D sin
     conexion desde el primer dia. */
  {
    const src = fs.readFileSync(path.join(RAIZ, 'sw.js'), 'utf8');
    const SITIO = 'https://tenerifego.app/';
    class Peticion extends Request {
      constructor(u, o) { super(typeof u === 'string' ? new URL(u, SITIO).href : u, o); }
    }
    const linea = /^const RELIEVE_HUELLA = '([^']*)';$/m;
    ok(linea.test(src), 'sw.js lleva la huella del relieve (const RELIEVE_HUELLA)', (src.match(linea) || [])[1]);
    const guardados = async huella => {
      const sw = cargarSW(async () => { throw new Error('sin red'); }, Peticion, src.replace(linea, "const RELIEVE_HUELLA = '" + huella + "';"));
      const esperas = [];
      for (const f of sw.manejadores.install) f({ waitUntil: p => esperas.push(p) });
      await Promise.all(esperas);
      const app = await sw.cachesFalso.open((src.match(/const CACHE = '([^']+)'/) || [])[1]);
      const urls = (await app.keys()).map(r => r.url);
      return { relieve: urls.filter(u => /\/mapa\/tenerife-relieve/.test(u)).length, modulo: urls.some(u => /\/modulos\/isla3d\.js$/.test(u)) };
    };
    const sin = await guardados('ninguno'), con = await guardados('0123456789abcdef');
    ok(sin.relieve === 0 && sin.modulo, 'sin relieve generado (huella «ninguno»), la instalacion no pide sus tres ficheros', JSON.stringify(sin));
    ok(con.relieve === 3 && con.modulo, 'con relieve, la instalacion guarda los tres con el modulo (sin conexion desde el primer dia)', JSON.stringify(con));
  }

  /* ── 9f. «Su cuerpo», sin cobertura (3 de noviembre de 2026; lo trajo la sesion de «Su cuerpo») ──

     La pantalla (modulos/cuerpo.js) se pide al abrir la pestaña Cuerpo del
     perfil, y sus datos (datos/cuerpo/: los ejercicios, uno comun y uno por
     idioma, las respuestas del asistente y las guias de los deportes, una por
     idioma), al abrir la biblioteca o la hoja de un grupo, «Preguntar» o un
     deporte. Asi que:
       · el modulo entra en el precache al INSTALAR, como el perfil, y sin red
         sale del cache; red primero (cambia con la app);
       · los datos NO entran al instalar (son los diez idiomas y cada persona
         lee uno): se guardan la primera vez que se piden con red, y desde
         ahi salen tambien sin ella; red primero, para que unas respuestas
         nuevas lleguen a quien ya tiene las viejas;
       · un fichero de datos que nunca se pidio, sin red, falla limpio: la
         pantalla lo dice y deja volver a intentarlo. */
  {
    const src = fs.readFileSync(path.join(RAIZ, 'sw.js'), 'utf8');
    const core = (src.match(/const CORE = \[([\s\S]*?)\];/) || [, ''])[1].replace(/\/\*[\s\S]*?\*\//g, '');
    ok(core.includes("'./modulos/cuerpo.js'"), '«Su cuerpo»: modulos/cuerpo.js esta en el precache (CORE)');
    /* (10-11-2026) Jero y sus tours: sin conexion desde el primer dia (el tour del cielo se abre
       donde se mira el cielo), y «red primero», abajo, con los demas modulos */
    ok(core.includes("'./modulos/guia.js'"), 'los tours: modulos/guia.js esta en el precache (CORE)');
    ok(!/datos\/cuerpo/.test(core), '«Su cuerpo»: y sus datos no, se guardan al usarlos');
    const SITIO = 'https://tenerifego.app/';
    class Peticion extends Request {
      constructor(u, o) { super(typeof u === 'string' ? new URL(u, SITIO).href : u, o); }
    }
    const basica = txt => { const r = new Response(txt, { status: 200 }); Object.defineProperty(r, 'type', { value: 'basic' }); return r; };
    const espera = () => new Promise(r => setTimeout(r, 20));
    let version = 'red-1', hayRed = true;
    const sw = cargarSW(async () => { if (!hayRed) throw new Error('sin red'); return basica(version); }, Peticion);
    const esperas = [];
    for (const f of sw.manejadores.install) f({ waitUntil: p => esperas.push(p) });
    await Promise.all(esperas);
    const app = await sw.cachesFalso.open((src.match(/const CACHE = '([^']+)'/) || [])[1]);
    ok(!!(await app.match(new Request(SITIO + 'modulos/cuerpo.js'))), '«Su cuerpo»: al instalar la app, modulos/cuerpo.js entra en el cache sin abrir la pestaña');
    ok(!(await app.match(new Request(SITIO + 'datos/cuerpo/asistente-es.json'))) && !(await app.match(new Request(SITIO + 'datos/cuerpo/ejercicios.json')))
      && !(await app.match(new Request(SITIO + 'datos/cuerpo/deportes-es.json'))), '«Su cuerpo»: y ningun fichero de datos/cuerpo/');
    hayRed = false;
    const r0 = await pedir(sw, SITIO + 'modulos/cuerpo.js');
    ok(r0 && r0.status === 200, '«Su cuerpo»: sin red, modulos/cuerpo.js sale del cache', r0 && r0.status);
    const nunca = await pedir(sw, SITIO + 'datos/cuerpo/asistente-de.json');
    ok(!nunca, '«Su cuerpo»: sin red, un fichero de datos que nunca se pidio falla limpio (no cuelga) y la pantalla lo dice', nunca && nunca.status);
    hayRed = true;
    ok(!!(await app.match(new Request(SITIO + 'modulos/guia.js'))), 'los tours: al instalar la app, modulos/guia.js entra en el cache sin abrir ningun tour');
    hayRed = false;
    const rg = await pedir(sw, SITIO + 'modulos/guia.js');
    ok(rg && rg.status === 200, 'los tours: sin red, modulos/guia.js sale del cache', rg && rg.status);
    hayRed = true;
    for (const f of ['modulos/guia.js', 'modulos/cuerpo.js', 'datos/cuerpo/ejercicios.json', 'datos/cuerpo/ejercicios-bg.json', 'datos/cuerpo/asistente-zht.json', 'datos/cuerpo/deportes-pl.json']) {
      version = 'red-1';
      const r1 = await pedir(sw, SITIO + f); await espera();
      const t1 = r1 && await r1.text();
      version = 'red-2';
      const r2 = await pedir(sw, SITIO + f); await espera();
      const t2 = r2 && await r2.text();
      ok(t1 === 'red-1' && t2 === 'red-2', f + ': red primero, una version nueva llega aunque ya haya otra guardada', t1 + ' / ' + t2);
      hayRed = false;
      const r3 = await pedir(sw, SITIO + f);
      const t3 = r3 && await r3.text();
      ok(t3 === 'red-2', f + ': sin red, sale la ultima guardada', t3);
      hayRed = true;
    }
  }

  /* ── 9g. El personaje en 3D, sin cobertura (7 de noviembre de 2026, bloque 3 del rediseño) ──

     El motor (modulos/cuerpo3d.js) y los datos (datos/cuerpo3d/) se piden al
     abrir «Su cuerpo», si hay WebGL 2 (decision 9 de Jerome: el 3D se baja al
     abrir «Su cuerpo» por primera vez, no con la app). Asi que:
       · ni el motor ni los datos entran en el precache;
       · el motor y el indice (datos/cuerpo3d/indice.json), red primero: cambian
         con la app, y con `cached || fetch` un indice nuevo no llegaria nunca;
       · los demas ficheros de datos/cuerpo3d/ llevan la huella de su contenido en
         el nombre (un dato nuevo es un fichero nuevo, que nombra un indice nuevo):
         con lo de por defecto, cache primero, se piden una sola vez y sin red salen;
       · sin red y sin haber abierto nunca «Su cuerpo», el motor falla limpio y la
         pantalla deja el dibujo. */
  {
    const src = fs.readFileSync(path.join(RAIZ, 'sw.js'), 'utf8');
    const core = (src.match(/const CORE = \[([\s\S]*?)\];/) || [, ''])[1].replace(/\/\*[\s\S]*?\*\//g, '');
    ok(!/cuerpo3d/.test(core), 'el 3D: ni modulos/cuerpo3d.js ni datos/cuerpo3d/ estan en el precache (se piden al abrir «Su cuerpo»)');
    const I3 = JSON.parse(fs.readFileSync(path.join(RAIZ, 'datos', 'cuerpo3d', 'indice.json'), 'utf8'));
    const nombres = Object.keys(I3.ficheros).map(k => I3.ficheros[k].f);
    ok(nombres.length === 71 && nombres.every(n => /^[a-z0-9_-]+\.[0-9a-f]{8}\.(bin|webp|png)$/.test(n)) && nombres.every(n => fs.existsSync(path.join(RAIZ, 'datos', 'cuerpo3d', n))),
      'el 3D: el indice nombra 71 ficheros, todos con su huella en el nombre y todos en datos/cuerpo3d/', nombres.length);
    const SITIO = 'https://tenerifego.app/';
    class Peticion extends Request {
      constructor(u, o) { super(typeof u === 'string' ? new URL(u, SITIO).href : u, o); }
    }
    const basica = txt => { const r = new Response(txt, { status: 200 }); Object.defineProperty(r, 'type', { value: 'basic' }); return r; };
    const espera = () => new Promise(r => setTimeout(r, 20));
    let version = 'red-1', hayRed = true, pedidas = 0;
    const sw = cargarSW(async () => { pedidas++; if (!hayRed) throw new Error('sin red'); return basica(version); }, Peticion);
    const esperas = [];
    for (const f of sw.manejadores.install) f({ waitUntil: p => esperas.push(p) });
    await Promise.all(esperas);
    const app = await sw.cachesFalso.open((src.match(/const CACHE = '([^']+)'/) || [])[1]);
    ok(!(await app.match(new Request(SITIO + 'modulos/cuerpo3d.js'))) && !(await app.match(new Request(SITIO + 'datos/cuerpo3d/indice.json'))), 'el 3D: al instalar la app no entra nada suyo en el cache');
    hayRed = false;
    const r0 = await pedir(sw, SITIO + 'modulos/cuerpo3d.js');
    ok(!r0, 'el 3D: sin red y sin haberlo abierto nunca, el motor falla limpio (la pantalla deja el dibujo)', r0 && r0.status);
    hayRed = true;
    for (const f of ['modulos/cuerpo3d.js', 'datos/cuerpo3d/indice.json']) {
      version = 'red-1';
      const r1 = await pedir(sw, SITIO + f); await espera();
      const t1 = r1 && await r1.text();
      version = 'red-2';
      const r2 = await pedir(sw, SITIO + f); await espera();
      const t2 = r2 && await r2.text();
      ok(t1 === 'red-1' && t2 === 'red-2', f + ': red primero, una version nueva llega aunque ya haya otra guardada', t1 + ' / ' + t2);
      hayRed = false;
      const r3 = await pedir(sw, SITIO + f);
      const t3 = r3 && await r3.text();
      ok(t3 === 'red-2', f + ': sin red, sale la ultima guardada', t3);
      hayRed = true;
    }
    /* un fichero con huella: la primera vez va a la red y se guarda; la segunda, del cache, sin pedirla */
    const fh = 'datos/cuerpo3d/' + I3.ficheros.cuerpo.f;
    version = 'huella-1'; pedidas = 0;
    /* (del cache sale el mismo objeto cada vez: se lee una copia) */
    const texto = async r => r && await r.clone().text();
    const h1 = await pedir(sw, SITIO + fh); await espera();
    const th1 = await texto(h1), p1 = pedidas;
    version = 'huella-2';
    const h2 = await pedir(sw, SITIO + fh); await espera();
    const th2 = await texto(h2), p2 = pedidas;
    ok(th1 === 'huella-1' && th2 === 'huella-1' && p1 === 1 && p2 === 1, fh + ': cache primero, se pide a la red una sola vez', th1 + ' / ' + th2 + ' / ' + p1 + ',' + p2);
    hayRed = false;
    const h3 = await pedir(sw, SITIO + fh);
    ok(await texto(h3) === 'huella-1', fh + ': sin red, sale del cache');
    hayRed = true;
  }

  /* ── 10. la unica suposicion que el ambito falso no puede comprobar ──

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
        executablePath: '/opt/pw-browsers/chromium',
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

  /* ── 11. al volver a la app, se busca version nueva (8 de noviembre de 2026) ──

     El iPhone deja la app instalada dormida y, al volver, sigue la misma
     pagina. index.html solo preguntaba por una version nueva al arrancar: una
     hora despues de publicar el 3D de «Su cuerpo», Jerome seguia con la de
     antes. Ahora pregunta tambien al volver a la vista, si hace 5 minutos o mas
     de la ultima vez, y si la hay sale el aviso de siempre, con «Recargar».

     Se prueba en Chromium con la app de verdad (index.html y sw.js), servida
     por un servidor propio en otro puerto que cambia sw.js cuando se le pide
     (un comentario al final, como cualquier publicacion) y cuenta las veces
     que se pide. «Volver a la vista» es el evento visibilitychange con la
     pagina visible; los 5 minutos se adelantan con Date.now. */
  if (PUERTO) {
    const http = require('http');
    const P3 = Number(PUERTO) + 2;
    let versionSW = 1, pedidasSW = 0;
    const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.css': 'text/css; charset=utf-8',
      '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };
    const srv = http.createServer((req, res) => {
      let p;
      try { p = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname); } catch (e) { res.writeHead(400); return res.end(); }
      if (p.endsWith('/')) p += 'index.html';
      if (p === '/sw.js') {
        pedidasSW++;
        res.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8', 'Cache-Control': 'no-cache' });
        return res.end(fs.readFileSync(path.join(RAIZ, 'sw.js'), 'utf8') + '\n// prueba de la version ' + versionSW + '\n');
      }
      const f = path.resolve(RAIZ, '.' + p);
      if (!f.startsWith(RAIZ + path.sep) || !fs.existsSync(f) || !fs.statSync(f).isFile()) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'Content-Type': TIPOS[path.extname(f)] || 'application/octet-stream' });
      fs.createReadStream(f).pipe(res);
    });
    await new Promise(r => srv.listen(P3, '127.0.0.1', r));
    let browser;
    try {
      const { chromium } = require('/opt/node22/lib/node_modules/playwright');
      browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-proxy-server', '--no-sandbox'] });
      const ctx = await browser.newContext({ serviceWorkers: 'allow', locale: 'es-ES' });
      await ctx.route('**/*', r => r.request().url().startsWith('http://127.0.0.1:' + P3 + '/') ? r.continue() : r.abort());
      await ctx.addInitScript(() => { try { localStorage.setItem('tenerife.tour.seen', '99'); localStorage.setItem('tgo_consent', JSON.stringify({ v: 'denied', t: Date.now() })); } catch (e) {} });
      const page = await ctx.newPage();
      await page.goto('http://127.0.0.1:' + P3 + '/index.html', { waitUntil: 'load', timeout: 60000 });
      await page.waitForFunction(() => !!(navigator.serviceWorker.controller && window.__pwaRegistration), null, { timeout: 90000 });
      const volver = () => page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
      const aviso = () => page.evaluate(() => !!document.querySelector('.pwa-toast.show'));
      /* la pregunta del arranque (reg.update() justo despues de registrar) va en cola detras de la instalacion y
         puede llegar segundos despues: se espera a que sw.js lleve 3 s sin pedirse, con la instalacion acabada,
         antes de cambiarlo (si no, esa pregunta tardia veria la version nueva y la prueba no distinguiria nada) */
      for (let ultimo = -1, quieto = 0; quieto < 6;) {
        await page.waitForTimeout(500);
        const libre = await page.evaluate(() => { const r = window.__pwaRegistration; return !r.installing && !r.waiting && !!r.active; });
        if (pedidasSW === ultimo && libre) quieto++; else { ultimo = pedidasSW; quieto = 0; }
      }
      const arranque = { pedidas: pedidasSW, aviso: await aviso() };
      ok(arranque.pedidas >= 1 && !arranque.aviso, 'al abrir la app se pregunta por la version (sin aviso: es la misma)', JSON.stringify(arranque));
      const antes = pedidasSW;
      versionSW = 2;
      /* a los pocos segundos de abrir: no se vuelve a preguntar */
      await volver(); await page.waitForTimeout(2500);
      const pronto = { pedidas: pedidasSW - antes, aviso: await aviso() };
      ok(pronto.pedidas === 0 && !pronto.aviso, 'al volver a la app antes de 5 minutos no se pregunta otra vez por una version nueva', JSON.stringify(pronto));
      /* oculta: tampoco */
      await page.evaluate(() => { const real = Date.now.bind(Date); Date.now = () => real() + 6 * 60000; });
      await page.evaluate(() => { Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' }); document.dispatchEvent(new Event('visibilitychange')); });
      await page.waitForTimeout(1500);
      const oculta = { pedidas: pedidasSW - antes, aviso: await aviso() };
      ok(oculta.pedidas === 0 && !oculta.aviso, 'al irse de la app (pagina oculta) no se pregunta', JSON.stringify(oculta));
      /* pasados 5 minutos, al volver a la vista: se pregunta y, con un sw.js nuevo, sale el aviso con «Recargar» */
      await page.evaluate(() => { delete document.visibilityState; });
      await volver();
      const salio = await page.waitForFunction(() => !!document.querySelector('.pwa-toast.show'), null, { timeout: 60000 }).then(() => true).catch(() => false);
      const luego = await page.evaluate(() => { const t = document.querySelector('.pwa-toast'), b = t && t.querySelector('.pwa-toast-reload');
        return { visible: document.visibilityState, boton: b ? b.textContent.trim() : null }; });
      ok(salio && pedidasSW - antes === 1 && !!luego.boton,
        'al volver a la app pasados 5 minutos se pregunta, y con una version nueva sale el aviso con «' + luego.boton + '»', JSON.stringify({ salio, pedidas: pedidasSW - antes, ...luego }));
      /* y otra vuelta enseguida no vuelve a preguntar */
      const tras = pedidasSW;
      await volver(); await page.waitForTimeout(1500);
      ok(pedidasSW === tras, 'una vuelta mas, enseguida, no pregunta otra vez', pedidasSW - tras);
    } catch (err) {
      fallos++; hechos++;
      console.log('  MAL no se pudo comprobar la busqueda de version al volver   -> ' + err.message);
    } finally {
      if (browser) await browser.close();
      srv.close();
    }
  }

  console.log('\n  ' + (fallos ? fallos + ' MAL de ' + hechos : hechos + ' controles, todos en verde') + '\n');
  process.exit(fallos ? 1 : 0);
})();
