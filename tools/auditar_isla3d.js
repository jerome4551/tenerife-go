#!/usr/bin/env node
/* auditar_isla3d.js — «La isla en 3D» (modulos/isla3d.js, 31 de octubre de 2026).
 *
 *     python3 -m http.server 8766 &      (desde la raiz del repo)
 *     node tools/auditar_isla3d.js 8766
 *
 * 1. Sin navegador: los textos (ISLA3D_UI y los tres del cargador en
 *    index.html) en los diez idiomas, con sus {huecos}, sin comillas dobles
 *    ASCII y con la paridad de siempre entre zh y zht; cada T('...') del
 *    modulo tiene su fila y no sobra ninguna; el CARGA-PEREZOSA; sw.js con
 *    los cuatro ficheros en CORE y en «red primero»; la app de las tiendas
 *    (app_preparar.js) los copia; las dos notas de la licencia del
 *    Copernicus DEM, las mismas palabra por palabra en el modulo y en
 *    relieve_construir.py, y las dos fuentes del relieve (el MDT05 del IGN y
 *    el Copernicus DEM) con el mismo credito en los dos (DEM_FUENTES y
 *    FUENTES); el relieve y su huella en sw.js e index.html
 *    (relieve_construir.py --comprobar); sin eval ni console.log ni
 *    innerHTML en el modulo.
 * 2. En Chromium, movil emulado (390 x 844, x2, tactil). Si el servidor no
 *    tiene relieve: el boton no sale y no se pide nada del 3D. Si lo tiene,
 *    con WebGL:
 *    · el boton «3D» sale, no pisa al de categorias, y abre la vista;
 *    · al entrar, la ayuda de los gestos y el credito de la fuente del
 *      relieve que dice su .json, con el enlace de OpenStreetMap: con el
 *      Copernicus DEM, las notas de la licencia enteras, que al primer gesto
 *      se pliegan y «ⓘ» las vuelve a abrir; con el MDT05 del IGN, su credito,
 *      siempre entero y sin «ⓘ»;
 *    · se dibuja: relieve, mapa encima, rotulos; mar azul y tierra que no lo es
 *      en los pixeles donde tienen que estar;
 *    · la vista entra donde estaba el mapa plano y, al volver, el mapa plano
 *      queda donde se miraba en 3D;
 *    · del punto de la pantalla al suelo y vuelta: la cumbre del Teide de la
 *      ficha sale en su sitio y a su altura del relieve;
 *    · los gestos de verdad (toques por CDP): arrastrar deja bajo el dedo el
 *      mismo punto del suelo; pellizcar acerca sin mover el punto entre los
 *      dedos; dos dedos hacia arriba inclinan; doble toque acerca; toque con
 *      dos dedos aleja; la brujula pone el norte arriba;
 *    · «2D», «atras» del movil y Escape cierran, sin dejar entradas de mas en
 *      el historial;
 *    · la luz a horas fijas, calculadas aqui con el mismo Astronomy Engine de
 *      la app: a mediodia; al atardecer, con las sombras que proyecta la
 *      cumbre del Teide hacia donde no esta el sol; de noche con luna (con
 *      sombras) y sin luna (sin ellas, que no hay luz que las haga); con la
 *      luz de mapa, sin sombras;
 *    · los diez idiomas: el titulo, los botones y el aviso de cada uno;
 *    · sin red, con el service worker: abre igual (todo de la cache);
 *    · un PNG tocado (una sola alteracion) no se dibuja: lo dice; ni un
 *      relieve de una fuente que el modulo no conoce;
 *    · con WebGL 1: dibuja igual, sin sombras proyectadas;
 *    · sin WebGL: lo dice y no revienta.
 * 3. Lo que tarda: fotogramas de un arrastre con la CPU 4 veces mas lenta
 *    (informativo; WebGL aqui es por software).
 * Cero errores de pagina. Sale con 1 si algo falla.
 */
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
let chromium;
try { chromium = require('playwright').chromium; } catch (e) {
  try { chromium = require('/opt/node22/lib/node_modules/playwright').chromium; } catch (e2) { chromium = require('/opt/npm-tools/node_modules/playwright').chromium; }
}
const RAIZ = path.join(__dirname, '..');
const PUERTO = process.argv[2] || '8766';
const BASE = 'http://127.0.0.1:' + PUERTO + '/index.html';
const LANGS = ['es', 'en', 'fr', 'de', 'it', 'nl', 'zh', 'zht', 'bg', 'pl'];
const IDEO = /[㐀-䶿一-鿿豈-﫿]/g;
const HUECO = /\{(\w+)\}/g;
const TEIDE = { lat: 28.2725, lon: -16.6422 };

let fallos = 0, hechos = 0, NOTAS = {};
/* el credito del 3D tal como se ve (corre en la pagina): el texto, el que se ve de verdad, las
   lineas que ocupa (las cajas de su texto, juntas por altura) y si «ⓘ» se ve: con .hidden no
   basta, el CSS del modulo le puede ganar (paso con el IGN el 31 de octubre de 2026) */
const LEER_CREDITOS = () => {
  const c = document.querySelector('#isla3d .i3-creditos'), m = c.querySelector('.i3-c-mas');
  const ys = [], w = document.createTreeWalker(c, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) {
    if (!n.textContent.trim()) continue;
    const r = document.createRange(); r.selectNodeContents(n);
    for (const q of r.getClientRects()) if (q.width > 0 && q.height > 0) ys.push((q.top + q.bottom) / 2);
  }
  ys.sort((a, b) => a - b);
  let lineas = 0, ult = -1e9;
  for (const y of ys) { if (y - ult > 7) lineas++; ult = y; }
  const cs = m && getComputedStyle(m);
  return { txt: c.textContent, visible: c.innerText, lineas, alto: c.getBoundingClientRect().height,
           exp: m && m.getAttribute('aria-expanded'), masSeVe: !!(m && m.getClientRects().length && cs.display !== 'none' && cs.visibility !== 'hidden') };
};
/* la fuente del relieve que sirve el servidor (su .json, fuente.id): el credito que tiene que salir */
let FUENTE = '';
function ok(c, txt, det) { hechos++; if (c) console.log('  OK  ' + txt); else { fallos++; console.log('  MAL ' + txt + (det !== undefined ? '   -> ' + (typeof det === 'string' ? det : JSON.stringify(det)) : '')); } }
function info(txt) { console.log('  ··  ' + txt); }
const lee = f => fs.readFileSync(path.join(RAIZ, f), 'utf8');

/* el literal que empieza tras `decl` (como en rotulos_app.js) */
function literal(src, decl) {
  const i = src.indexOf(decl);
  if (i < 0) return null;
  const abre = src.indexOf('{', i + decl.length - 1);
  let d = 0, q = null;
  for (let k = abre; k < src.length; k++) {
    const c = src[k];
    if (q) { if (c === '\\') { k++; continue; } if (c === q) q = null; continue; }
    if (c === '/' && src[k + 1] === '*') { k = src.indexOf('*/', k) + 1; continue; }
    if (c === '"' || c === "'") { q = c; continue; }
    if (c === '{') d++;
    else if (c === '}' && --d === 0) return JSON.parse(src.slice(abre, k + 1));
  }
  return null;
}

/* Las horas de las pruebas de la luz, con el Astronomy Engine de vendor/ (el
   mismo que usa la app), en el Teide: un atardecer de verano con el sol entre
   3 y 6 grados por el oeste, y dos noches de octubre (sol a mas de 12 grados
   bajo el horizonte), una con la luna a mas de 30 grados y otra con la luna
   a mas de 8 grados bajo el horizonte. */
function horasDeLuz() {
  const vm = require('vm');
  const caja = { Date, Math, Number, Array, Object, Error, isFinite, parseFloat, parseInt };
  vm.createContext(caja);
  vm.runInContext(lee('vendor/astronomy.browser.min.js'), caja);
  const A = caja.Astronomy, o = new A.Observer(TEIDE.lat, TEIDE.lon, 2000);
  const pos = (b, d) => { const eq = A.Equator(b, d, o, true, true); return A.Horizon(d, o, eq.ra, eq.dec, 'normal'); };
  let atardecer = null, sinLuna = null, conLuna = null;
  for (let m = 0; m < 24 * 60 && !atardecer; m += 2) {
    const d = new Date(Date.UTC(2026, 5, 21) + m * 60000), s = pos(A.Body.Sun, d);
    if (s.azimuth > 180 && s.altitude < 6 && s.altitude > 3) atardecer = { t: d.toISOString(), az: s.azimuth, alt: s.altitude };
  }
  for (let h = 0; h < 24 * 60 && !(sinLuna && conLuna); h++) {
    const d = new Date(Date.UTC(2026, 9, 1) + h * 3600000);
    if (pos(A.Body.Sun, d).altitude > -12) continue;
    const l = pos(A.Body.Moon, d).altitude;
    if (!sinLuna && l < -8) sinLuna = d.toISOString();
    if (!conLuna && l > 30) conLuna = d.toISOString();
  }
  return { atardecer, sinLuna, conLuna };
}

function sinNavegador() {
  console.log('════ 1. textos, enganches y relieve (sin navegador) ════');
  const mod = lee('modulos/isla3d.js'), idx = lee('index.html'), sw = lee('sw.js');
  const UI = literal(mod, 'var ISLA3D_UI = {') || {};
  const ini = idx.indexOf('<!-- ══ LA ISLA EN 3D');
  const fin = idx.indexOf('<!-- ══ fin LA ISLA EN 3D ══ -->');
  const bloque = ini >= 0 && fin > ini ? idx.slice(ini, fin) : '';
  ok(!!bloque, 'index.html: el bloque «LA ISLA EN 3D» (boton, estilo y cargador)');
  const CASCARA = literal(bloque, 'Object.assign(UI_TX, {') || {};
  ok(Object.keys(UI).length >= 15, 'ISLA3D_UI se lee del modulo', Object.keys(UI).length + ' filas');
  ok(['isla3dBoton', 'isla3dCargando', 'isla3dErrorCarga'].every(k => CASCARA[k]), 'las tres filas del cargador estan en index.html (salen antes de que llegue el modulo)');
  const todas = Object.assign({}, UI, CASCARA);
  const malas = [];
  for (const [k, f] of Object.entries(todas)) {
    for (const l of LANGS) if (!f[l] || typeof f[l] !== 'string' || !f[l].trim()) malas.push(k + ':' + l + ' vacia');
    const h = (f.es.match(HUECO) || []).sort().join();
    for (const l of LANGS) if (f[l] && (f[l].match(HUECO) || []).sort().join() !== h) malas.push(k + ':' + l + ' huecos');
    for (const l of LANGS) if (f[l] && f[l].indexOf('"') >= 0) malas.push(k + ':' + l + ' comilla doble');
    if (f.zh && f.zht && f.zh.replace(IDEO, '') !== f.zht.replace(IDEO, '')) malas.push(k + ': zh/zht fuera de los ideogramas');
    if (f.bg && /[a-z]{3,}/.test(f.bg.replace(/\{\w+\}|Copernicus|OpenStreetMap|WebGL|GLO-30|DEM|3D/g, ''))) malas.push(k + ':bg con letras latinas');
  }
  ok(!malas.length, 'las ' + Object.keys(todas).length + ' filas: diez idiomas, sus huecos, sin comillas dobles, zh/zht a la par, bg en cirilico', malas.slice(0, 8).join(', '));
  /* lo que pide el codigo, contra lo que hay */
  const pedidas = new Set([...mod.matchAll(/\bT\('([A-Za-z]+)'/g)].map(m => 'isla3d' + m[1])
    .concat([...mod.matchAll(/\btx\('(isla3d[A-Za-z]+)'/g)].map(m => m[1]))
    .concat([...bloque.matchAll(/\btx\('(isla3d[A-Za-z]+)'/g)].map(m => m[1]))
    .concat([...bloque.matchAll(/data-tx(?:-title|-aria)?="(isla3d[A-Za-z]+)"/g)].map(m => m[1])));
  const faltan = [...pedidas].filter(k => !todas[k]);
  const sobran = Object.keys(todas).filter(k => !pedidas.has(k));
  ok(!faltan.length, 'cada texto que pide el codigo tiene su fila (' + pedidas.size + ')', faltan.join(', '));
  ok(!sobran.length, 'y no sobra ninguna', sobran.join(', '));
  ok(/CARGA-PEREZOSA: modulos\/isla3d\.js/.test(idx), 'el CARGA-PEREZOSA, para que tools/fuente.js pegue el modulo al fuente');
  const core = (sw.match(/const CORE = \[([\s\S]*?)\];/) || [, ''])[1];
  const cuatro = ['./modulos/isla3d.js', './mapa/tenerife-relieve.json', './mapa/tenerife-relieve.png', './mapa/tenerife-relieve-ao.png'];
  ok(cuatro.every(f => core.indexOf("'" + f + "'") >= 0), 'sw.js: el modulo y los tres ficheros del relieve en CORE (sin conexion desde el primer dia)');
  ok(/endsWith\('\/modulos\/isla3d\.js'\)/.test(sw) && /\\\/mapa\\\/tenerife-relieve\(-ao\)\?\\\.\(png\|json\)\$/.test(sw),
     'sw.js: los cuatro, «red primero» (el .json y los PNG llegan juntos o no llegan)');
  ok(/tenerife-relieve\(-ao\)\?\\\.\(png\|json\)/.test(lee('tools/app_preparar.js')), 'la app de las tiendas lleva el relieve dentro (app_preparar.js)');
  ok(!/\beval\s*\(|console\.log|\.innerHTML\b|new Function/.test(mod), 'el modulo: sin eval, sin console.log, sin innerHTML');
  /* las notas que pide la licencia del Copernicus DEM (articulo 6(b) y 6(c)):
     las mismas, palabra por palabra, en el modulo y en la herramienta, que
     las escribe en el .json (y --comprobar coteja el .json) */
  const notas = cp.spawnSync('python3', ['-c', 'import sys, json; sys.path.insert(0, "tools"); import relieve_construir as r; print(json.dumps([r.NOTA_6B, r.NOTA_6C, {k: [v["credito"], v["responsabilidad"]] for k, v in r.FUENTES.items()}]))'], { cwd: RAIZ, encoding: 'utf8' });
  let n6 = null; try { n6 = JSON.parse(notas.stdout); } catch (e) {}
  const enMod = k => (mod.match(new RegExp("var " + k + " = '([^']*)';")) || [])[1];
  NOTAS = { b: enMod('DEM_NOTA'), c: enMod('DEM_RESPONSABILIDAD'), ign: enMod('IGN_NOTA'), osm: enMod('OSM_DERECHOS') };
  ok(n6 && NOTAS.b === n6[0] && NOTAS.c === n6[1] && /^produced using Copernicus WorldDEM-30 © DLR e\.V\. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA; all rights reserved$/.test(NOTAS.b),
     'las dos notas de la licencia del Copernicus DEM (6(b) y 6(c)): las mismas, palabra por palabra, en el modulo y en relieve_construir.py', { modulo: NOTAS, herramienta: n6 });
  /* el credito de cada fuente del relieve (31 de octubre de 2026, tarde: el MDT05 del IGN, con el de
     Copernicus de respaldo): las mismas fuentes y los mismos creditos en el modulo (DEM_FUENTES) y en
     la herramienta (FUENTES), y el del IGN, el de su plantilla de obra derivada con el dato de su metadato */
  const vars = { DEM_NOTA: NOTAS.b, DEM_RESPONSABILIDAD: NOTAS.c, IGN_NOTA: NOTAS.ign, "''": '' };
  const tabla = {};
  for (const m of ((mod.match(/var DEM_FUENTES = \{([\s\S]*?)\n  \};/) || [, ''])[1]).matchAll(/'([a-z0-9-]+)': \{ nota: ([A-Z_]+|''), responsabilidad: ([A-Z_]+|''), plegada: '([^']*)' \}/g))
    tabla[m[1]] = [vars[m[2]], vars[m[3]], m[4]];
  const deLaHerramienta = (n6 && n6[2]) || {};
  ok(Object.keys(tabla).sort().join() === Object.keys(deLaHerramienta).sort().join() && Object.keys(tabla).length === 2
     && Object.keys(tabla).every(k => tabla[k][0] === deLaHerramienta[k][0] && tabla[k][1] === deLaHerramienta[k][1])
     && NOTAS.ign === 'Obra derivada de MDT05-cob1 2008-2015 CC-BY 4.0 scne.es' && tabla['ign-mdt05'][2] === '' && tabla['copernicus-glo30'][2] === 'Copernicus WorldDEM-30',
     'las dos fuentes del relieve, con el mismo credito en el modulo y en relieve_construir.py: el MDT05 del IGN («' + NOTAS.ign + '», siempre entero) y el Copernicus DEM (sus dos notas, plegables)',
     { modulo: tabla, herramienta: deLaHerramienta });
  ok(NOTAS.osm === 'https://www.openstreetmap.org/copyright', 'el credito de OpenStreetMap enlaza a su pagina de derechos de autor y licencia, como el del mapa plano', NOTAS.osm);
  ok(/'isla3d': 'modulos\/isla3d\.js'|modulos\/isla3d\.js/.test(lee('tools/auditar.sh')), 'auditar.sh comprueba la sintaxis del modulo');
  const rel = cp.spawnSync('python3', [path.join(RAIZ, 'tools', 'relieve_construir.py'), '--comprobar'], { encoding: 'utf8' });
  const hay = fs.existsSync(path.join(RAIZ, 'mapa', 'tenerife-relieve.json'));
  ok(rel.status === 0, (hay ? 'el relieve: relieve_construir.py --comprobar en verde' : 'el relieve aun no esta generado: relieve_construir.py --comprobar en verde (sin relieve y la huella en «ninguno»)'),
     (rel.stdout || '').split('\n').filter(x => /FALLA/.test(x)).join(' | ') || (rel.stderr || '').slice(-300));
}

/* Lo que mira el navegador es lo que sirve el servidor: con el relieve, la
   vista entera; sin el, que el boton no salga y no se pida nada del 3D. */
async function servidorConRelieve() {
  try {
    const r = await fetch(new URL('mapa/tenerife-relieve.json', BASE));
    if (!r.ok) return false;
    const f = ((await r.json()) || {}).fuente || {};
    FUENTE = f.id || (f.nombre === 'Copernicus DEM GLO-30' ? 'copernicus-glo30' : '?');
    console.log('  (el relieve del servidor es de ' + FUENTE + ')');
    return true;
  } catch (e) { return false; }
}

async function sinRelieve() {
  console.log('════ 2. en Chromium, sin relieve en el servidor ════');
  const args = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
  let b;
  try { b = await chromium.launch({ args }); }
  catch (e) { b = await chromium.launch({ args, executablePath: process.env.CHROME || '/usr/bin/google-chrome' }); }
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'es-ES', serviceWorkers: 'block' });
  const p = await ctx.newPage();
  const errores = [], pedidos = [];
  p.on('pageerror', e => errores.push(e.message));
  p.on('request', r => { if (/isla3d|tenerife-relieve/.test(r.url())) pedidos.push(r.method() + ' ' + r.url()); });
  await p.goto(BASE, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500);
  const r = await p.evaluate(() => { const b = document.getElementById('isla3d-btn'); return { hay: !!b, oculto: !b || (b.hidden && !b.getClientRects().length), modulo: typeof window.TG_ISLA3D }; });
  ok(r.hay && r.oculto && r.modulo === 'undefined', 'sin relieve, el boton «3D» no sale y el modulo no se carga', r);
  ok(!pedidos.length, 'y no se pide nada del 3D: ni el modulo ni el relieve (en la app de las tiendas seria un 404)', pedidos);
  ok(!errores.length, 'cero errores de pagina', errores.slice(0, 5));
  await b.close();
}

async function navegador() {
  console.log('════ 2. en Chromium, movil emulado, con WebGL ════');
  const args = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
  let b;
  try { b = await chromium.launch({ args }); }
  catch (e) { b = await chromium.launch({ args, executablePath: process.env.CHROME || '/usr/bin/google-chrome' }); }
  const errores = [];
  const nueva = async (opc) => {
    const ctx = await b.newContext(Object.assign({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'es-ES', serviceWorkers: 'block' }, opc || {}));
    const p = await ctx.newPage();
    p.on('pageerror', e => errores.push(e.message));
    return { ctx, p };
  };
  /* la bienvenida (idioma y «Empezar») y la pregunta del tour, si salen */
  const bienvenida = async (p, L) => {
    const w = await p.$('.v19-w-lang[data-lang="' + (L || 'es') + '"]'); if (w && await w.isVisible()) { await w.click(); await p.waitForTimeout(250); }
    const s = await p.$('#v19-welcome-start'); if (s && await s.isVisible()) { await s.click(); await p.waitForTimeout(1800); }
    const no = await p.$('.v19t-prompt button'); if (no && await no.isVisible()) { await no.click(); await p.waitForTimeout(300); }
  };
  const arrancar = async (p, L) => {
    await p.goto(BASE, { waitUntil: 'networkidle' });
    await p.waitForTimeout(500);
    await bienvenida(p, L);
  };
  const estado = p => p.evaluate(() => window.TG_ISLA3D && TG_ISLA3D._prueba.estado());
  const esperar = async (p, cond, ms) => {
    const t0 = Date.now();
    for (;;) { const e = await estado(p); if (e && cond(e)) return e; if (Date.now() - t0 > (ms || 25000)) return e; await p.waitForTimeout(250); }
  };
  const quieto = async p => { await p.waitForTimeout(250); await p.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))); };

  /* ── el boton y la entrada ── */
  let { ctx, p } = await nueva();
  await arrancar(p, 'es');
  await p.evaluate(() => map.setView([28.2725, -16.6422], 12, { animate: false }));
  await p.waitForTimeout(300);
  const bot = await p.evaluate(() => {
    const b = document.getElementById('isla3d-btn'), c = document.getElementById('category-btn');
    if (!b) return null;
    const r = b.getBoundingClientRect(), q = c ? c.getBoundingClientRect() : null;
    // que se vea de verdad: con .hidden no basta (el CSS le puede ganar)
    return { oculto: b.hidden || !b.getClientRects().length || r.width < 30, r: [r.left, r.top, r.right, r.bottom], pisa: q ? !(r.bottom <= q.top || r.top >= q.bottom || r.right <= q.left || r.left >= q.right) : false };
  });
  ok(bot && !bot.oculto && bot.r[2] <= 390 && bot.r[0] >= 0 && !bot.pisa, 'el boton «3D» sale, dentro de la pantalla y sin pisar al de categorias', bot);
  const UI0 = literal(lee('modulos/isla3d.js'), 'var ISLA3D_UI = {');
  const historia0 = await p.evaluate(() => JSON.stringify(history.state));
  await p.click('#isla3d-btn');
  /* al entrar: la ayuda de los gestos (una vez; antes la tapaba «Dibujando el
     mapa…», que sale justo entonces) y las notas de la licencia enteras */
  await esperar(p, x => x.listo);
  const entrada = await p.evaluate(LEER_CREDITOS).then(x => p.evaluate(() => {
    const c = document.querySelector('#isla3d .i3-creditos'), a = c.querySelector('a'), r = c.getBoundingClientRect();
    return { aviso: TG_ISLA3D._prueba.estado().aviso, href: a && a.href, dentro: r.left >= 0 && r.right <= innerWidth && r.bottom <= innerHeight, historia: history.state };
  }).then(y => Object.assign(x, y)));
  ok(entrada.aviso === UI0.isla3dAyuda.es, 'al entrar, la ayuda de los gestos («' + UI0.isla3dAyuda.es + '»)', entrada.aviso);
  if (FUENTE === 'ign-mdt05')
    ok(entrada.txt.indexOf(NOTAS.ign) >= 0 && entrada.txt.indexOf('Copernicus') < 0 && entrada.href === NOTAS.osm && !entrada.masSeVe && entrada.lineas <= 2 && entrada.dentro,
       'al entrar, el credito del MDT05 del IGN entero («' + NOTAS.ign + '»), sin «ⓘ», y © OpenStreetMap con su enlace, en ' + entrada.lineas + ' lineas, dentro de la pantalla', entrada);
  else
    ok(entrada.txt.indexOf(NOTAS.b) >= 0 && entrada.txt.indexOf(NOTAS.c) >= 0 && entrada.href === NOTAS.osm && entrada.exp === 'true' && entrada.masSeVe && entrada.dentro,
       'al entrar, las dos notas de la licencia del Copernicus DEM enteras, con «ⓘ», y © OpenStreetMap con su enlace, dentro de la pantalla', entrada);
  ok(entrada.historia && entrada.historia.tgIsla3d === 1, 'abrir deja una entrada en el historial: «atras» del movil cierra el 3D y no la app', entrada.historia);
  let e = await esperar(p, x => x.listo && x.drape && x.cuadros > 3);
  ok(e && e.listo && !e.sinWebGL, 'la vista abre con WebGL (' + (e && e.gl2 ? 'WebGL 2' : 'WebGL 1') + ')', e);
  ok(e && e.drape, 'el mapa se dibuja encima del relieve (' + (e && e.drapeFuente) + ')', e);
  const ll = await p.evaluate(() => { const c = TG_ISLA3D._prueba.estado().cam; return c; });
  const centro = await p.evaluate(() => { const s = TG_ISLA3D._prueba; return s.suelo(195, 422); });
  info('camara al entrar: ' + JSON.stringify(ll));
  /* la entrada: el blanco es el centro del mapa plano */
  const blanco = await p.evaluate(() => { const c = TG_ISLA3D._prueba.estado().cam; return c; });
  const dEntrada = await p.evaluate(() => {
    const s = TG_ISLA3D._prueba, c = s.estado().cam;
    const p0 = s.pantallaDe(-16.6422, 28.2725);
    return { p0, c };
  });
  ok(dEntrada.p0 && Math.abs(dEntrada.p0[0] - 195) < 6, 'la vista entra centrada donde estaba el mapa plano (la cumbre del Teide, en el centro a lo ancho)', dEntrada);
  await p.waitForTimeout(1500);

  /* ── la cumbre del Teide: de la ficha a la pantalla y de la pantalla al suelo ── */
  await p.evaluate(() => TG_ISLA3D._prueba.irA(-16.6422, 28.2725, 9000, 30, 50));
  await quieto(p);
  const ida = await p.evaluate(() => {
    const s = TG_ISLA3D._prueba, q = s.pantallaDe(-16.6422, 28.2725);
    return { q, vuelta: q ? s.suelo(q[0], q[1]) : null, h: s.alturaEn(-16.6422, 28.2725) };
  });
  const dist = ida.vuelta ? Math.hypot((ida.vuelta[0] - TEIDE.lon) * 111320 * Math.cos(TEIDE.lat * Math.PI / 180), (ida.vuelta[1] - TEIDE.lat) * 110574) : 1e9;
  ok(ida.vuelta && dist < 60 && Math.abs(ida.vuelta[2] - ida.h) < 15, 'la cumbre del Teide: de la ficha a la pantalla y de vuelta al suelo, a ' + Math.round(dist) + ' m y a ' + (ida.vuelta ? ida.vuelta[2].toFixed(0) : '?') + ' m de altura (relieve: ' + ida.h.toFixed(0) + ' m)', ida);
  ok(ida.h > 3500 && ida.h < 3760, 'el relieve en la cumbre del Teide de la ficha: ' + ida.h.toFixed(0) + ' m (3.715 m oficiales; la celda es la media de 60 x 60 m)', ida.h);

  /* ── mar y tierra en los pixeles ── */
  await p.evaluate(() => TG_ISLA3D._prueba.irA(-16.55, 28.28, 100000, 0, 0));
  await quieto(p);
  const px = await p.evaluate(() => {
    const s = TG_ISLA3D._prueba;
    const sitios = [[-16.6, 28.55], [-16.45, 28.05], [-16.95, 28.3], [-16.64, 28.27], [-16.4, 28.45], [-16.75, 28.15]];
    const q = sitios.map(x => s.pantallaDe(x[0], x[1]));
    if (q.some(v => !v)) return null;
    const c = s.pixeles(q.map(v => [v[0], v[1]]));
    return { mar: c.slice(0, 3), tierra: c.slice(3) };
  });
  const azul = c => c && c[2] > c[0] + 25 && c[2] > c[1];
  ok(px && px.mar.every(azul) && px.tierra.every(c => c && !azul(c)), 'desde arriba: mar azul y tierra que no lo es, en sus sitios (tres y tres)', px);

  /* ── los gestos de verdad ── */
  await p.evaluate(() => TG_ISLA3D._prueba.irA(-16.52, 28.40, 12000, 0, 45));
  await quieto(p);
  const cdp = await ctx.newCDPSession(p);
  /* con su hora: el navegador de prueba pinta por software y procesa tarde,
     pero el modulo mira la hora de cada toque */
  const toques = async (tipo, pts, ts) => cdp.send('Input.dispatchTouchEvent', Object.assign({ type: tipo, touchPoints: pts.map((q, i) => ({ x: q[0], y: q[1], id: i })) }, ts ? { timestamp: ts } : {}));
  /* medir() corre con los dedos todavia puestos: despues de soltar, la
     inercia sigue moviendo la vista (a proposito) */
  const arrastre = async (pts0, pts1, pasos, medir) => {
    await toques('touchStart', pts0);
    for (let k = 1; k <= pasos; k++) {
      const f = k / pasos;
      await toques('touchMove', pts0.map((q, i) => [q[0] + (pts1[i][0] - q[0]) * f, q[1] + (pts1[i][1] - q[1]) * f]));
      await p.waitForTimeout(16);
    }
    const r = medir ? await medir() : null;
    await toques('touchEnd', []);
    await p.waitForTimeout(120);
    return r;
  };
  const sinMover = async () => { for (let k = 0; k < 60; k++) { const e2 = await estado(p); if (!e2.animando) return; await p.waitForTimeout(200); } };
  /* arrastrar: el punto del suelo bajo el dedo se queda bajo el dedo */
  const g0 = await p.evaluate(() => TG_ISLA3D._prueba.suelo(200, 500));
  const g1 = await arrastre([[200, 500]], [[150, 380]], 12, () => p.evaluate(() => TG_ISLA3D._prueba.suelo(150, 380)));
  await sinMover();
  /* y al soltar, el punto de giro pasa al suelo del centro sin mover la vista */
  const g2 = await p.evaluate(() => TG_ISLA3D._prueba.suelo(150, 380));
  const dRe = g1 && g2 ? Math.hypot((g2[0] - g1[0]) * 98000, (g2[1] - g1[1]) * 110574) : 1e9;
  const dArr = g0 && g1 ? Math.hypot((g1[0] - g0[0]) * 98000, (g1[1] - g0[1]) * 110574) : 1e9;
  ok(dArr < 25, 'arrastrar con un dedo: el sitio que estaba bajo el dedo sigue bajo el dedo (' + Math.round(dArr) + ' m)', { g0, g1 });
  info('al soltar sigue un poco por la inercia: ' + Math.round(dRe) + ' m');
  /* las notas, plegadas tras el primer gesto; «ⓘ» las abre */
  const plegadas = await p.evaluate(LEER_CREDITOS);
  if (FUENTE === 'ign-mdt05') {
    // entero no se pliega: en un movil de 390 px, dos lineas como mucho, y sin «ⓘ», que no abriria nada
    ok(plegadas.txt.indexOf(NOTAS.ign) >= 0 && !plegadas.masSeVe && /OpenStreetMap/.test(plegadas.txt) && plegadas.lineas <= 2,
       'tras el primer gesto, el credito del IGN sigue entero y sin «ⓘ», en ' + plegadas.lineas + ' lineas (' + Math.round(plegadas.alto) + ' px): «' + plegadas.visible + '»', plegadas);
  } else {
    ok(plegadas.exp === 'false' && plegadas.txt.indexOf(NOTAS.c) < 0 && /Copernicus WorldDEM-30/.test(plegadas.txt) && /OpenStreetMap/.test(plegadas.txt) && plegadas.masSeVe && plegadas.lineas === 1,
       'tras el primer gesto, las notas se pliegan a una linea, con «ⓘ» (' + Math.round(plegadas.alto) + ' px): «' + plegadas.visible + '»', plegadas);
    await p.click('#isla3d .i3-c-mas');
    await p.waitForTimeout(200);
    const otraVez = await p.evaluate(() => { const c = document.querySelector('#isla3d .i3-creditos'); return { txt: c.textContent, exp: c.querySelector('.i3-c-mas').getAttribute('aria-expanded'), etiqueta: c.querySelector('.i3-c-mas').getAttribute('aria-label') }; });
    ok(otraVez.exp === 'true' && otraVez.txt.indexOf(NOTAS.b) >= 0 && otraVez.txt.indexOf(NOTAS.c) >= 0 && otraVez.etiqueta === UI0.isla3dCreditos.es,
       '«ⓘ» las vuelve a abrir enteras (y se llama «' + otraVez.etiqueta + '»)', otraVez);
  }
  await p.evaluate(() => TG_ISLA3D._prueba.irA(-16.52, 28.40, 12000, 0, 45));
  await quieto(p);
  /* pellizcar: acerca y el punto entre los dedos no se mueve */
  const c0 = (await estado(p)).cam;
  const m0 = await p.evaluate(() => TG_ISLA3D._prueba.suelo(195, 450));
  const m1 = await arrastre([[150, 450], [240, 450]], [[95, 450], [295, 450]], 14, () => p.evaluate(() => TG_ISLA3D._prueba.suelo(195, 450)));
  await sinMover();
  await quieto(p);
  const c1 = (await estado(p)).cam;
  const m2 = await p.evaluate(() => TG_ISLA3D._prueba.suelo(195, 450));
  const dRe2 = m1 && m2 ? Math.hypot((m2[0] - m1[0]) * 98000, (m2[1] - m1[1]) * 110574) : 1e9;
  const dPel = m0 && m1 ? Math.hypot((m1[0] - m0[0]) * 98000, (m1[1] - m0[1]) * 110574) : 1e9;
  ok(c1.d < c0.d * 0.7 && dPel < 25, 'pellizcar: acerca (' + Math.round(c0.d) + ' → ' + Math.round(c1.d) + ' m) y el punto entre los dedos se queda (' + Math.round(dPel) + ' m)', { c0, c1 });
  ok(dRe2 < 8, 'al soltar el pellizco, la vista no se mueve (el punto de giro pasa al suelo del centro: ' + dRe2.toFixed(1) + ' m)', { m1, m2 });
  /* dos dedos hacia arriba: inclina */
  await arrastre([[150, 600], [240, 600]], [[150, 480], [240, 480]], 12);
  await quieto(p);
  const c2 = (await estado(p)).cam;
  ok(c2.incl > c1.incl + 0.2 && Math.abs(c2.d - c1.d) / c1.d < 0.08, 'dos dedos hacia arriba: inclina (' + (c1.incl * 57.3).toFixed(0) + '° → ' + (c2.incl * 57.3).toFixed(0) + '°) sin acercar', { c1, c2 });
  /* girar con dos dedos */
  await arrastre([[150, 450], [240, 450]], [[175, 395], [215, 505]], 12);
  await quieto(p);
  const c3 = (await estado(p)).cam;
  ok(Math.abs(c3.rumbo - c2.rumbo) > 0.4, 'girar con dos dedos: cambia el rumbo (' + (c2.rumbo * 57.3).toFixed(0) + '° → ' + (c3.rumbo * 57.3).toFixed(0) + '°)', { c2, c3 });
  /* la brujula: norte arriba */
  await p.evaluate(() => TG_ISLA3D._prueba.irA(-16.52, 28.40, 9000, 70, 45));
  await quieto(p);
  await p.click('#isla3d .i3-brujula');
  await p.waitForTimeout(700);
  await sinMover();
  const c4 = (await estado(p)).cam;
  ok(Math.abs(c4.rumbo) < 0.01, 'la brujula pone el norte arriba', c4);
  /* Los toques cortos van como eventos de puntero dentro de la pagina, con
     sus tiempos de verdad (120 ms entre toques): por CDP, el navegador de
     prueba, que pinta por software, los entregaba con medio segundo entre uno
     y otro y el doble toque no podia salir nunca. */
  const toqueCorto = (dedos, gapMs, veces) => p.evaluate(async ([dedos, gapMs, veces]) => {
    const cv = document.querySelector('#isla3d .i3-gl'), r = cv.getBoundingClientRect();
    const ev = (t, i, q) => cv.dispatchEvent(new PointerEvent(t, { pointerId: 50 + i, pointerType: 'touch', isPrimary: i === 0, clientX: r.left + q[0], clientY: r.top + q[1], bubbles: true, cancelable: true }));
    for (let v = 0; v < veces; v++) {
      dedos.forEach((q, i) => ev('pointerdown', i, q));
      await new Promise(f => setTimeout(f, 40));
      dedos.forEach((q, i) => ev('pointerup', i, q));
      if (v < veces - 1) await new Promise(f => setTimeout(f, gapMs));
    }
  }, [dedos, gapMs, veces]);
  /* doble toque: acerca */
  const d5 = c4.d;
  await toqueCorto([[200, 420]], 120, 2);
  await p.waitForTimeout(300);
  await sinMover();
  const c5 = (await estado(p)).cam;
  ok(c5.d < d5 * 0.7, 'doble toque: acerca (' + Math.round(d5) + ' → ' + Math.round(c5.d) + ' m)', c5);
  /* toque con dos dedos: aleja */
  await toqueCorto([[150, 420], [240, 420]], 0, 1);
  await p.waitForTimeout(300);
  await sinMover();
  const c6 = (await estado(p)).cam;
  ok(c6.d > c5.d * 1.5, 'toque con dos dedos: aleja (' + Math.round(c5.d) + ' → ' + Math.round(c6.d) + ' m)', c6);
  /* y un solo toque no mueve nada */
  await p.waitForTimeout(400);
  await toqueCorto([[200, 420]], 0, 1);
  await p.waitForTimeout(700);
  const c7 = (await estado(p)).cam;
  ok(Math.abs(c7.d - c6.d) < 1 && Math.abs(c7.tx - c6.tx) < 1, 'un toque suelto no mueve la vista', c7);

  /* ── volver al mapa plano: queda donde se miraba ── */
  await p.evaluate(() => TG_ISLA3D._prueba.irA(-16.25, 28.47, 6000, 40, 40));
  await quieto(p);
  await p.click('#isla3d .i3-2d');
  await p.waitForTimeout(600);
  const vuelta = await p.evaluate(() => ({ c: map.getCenter(), z: map.getZoom(), abierto: TG_ISLA3D.abierto(), historia: JSON.stringify(history.state) }));
  ok(!vuelta.abierto && Math.abs(vuelta.c.lat - 28.47) < 0.003 && Math.abs(vuelta.c.lng + 16.25) < 0.003 && vuelta.z >= 12 && vuelta.z <= 15,
     'el boton «2D» cierra y el mapa plano queda donde se miraba en 3D (zoom ' + vuelta.z + ')', vuelta);
  ok(vuelta.historia === historia0, 'y saca la entrada del historial que puso al abrir', { antes: historia0, despues: vuelta.historia });
  /* «atras» del movil, y Escape: cierran igual, sin dejar nada en el historial */
  for (const [como, hacer] of [['«atras» del movil', () => p.evaluate(() => history.back())], ['Escape', () => p.keyboard.press('Escape')]]) {
    await p.click('#isla3d-btn');
    await esperar(p, x => x.listo && x.drape && !x.animando);
    await hacer();
    await p.waitForTimeout(700);
    const r = await p.evaluate(() => ({ abierto: TG_ISLA3D.abierto(), historia: JSON.stringify(history.state), mapaVisible: !!document.getElementById('map').offsetParent }));
    ok(!r.abierto && r.historia === historia0 && r.mapaVisible, como + ' cierra el 3D y la app sigue en el mapa', r);
  }
  await ctx.close();

  /* ── la luz, a horas fijas ── */
  /* Las horas las calcula aqui el mismo Astronomy Engine de la app: un
     atardecer de verano con el sol bajo por el oeste-noroeste y dos noches de
     octubre, una con la luna alta y otra sin luna. Antes de mirar el aviso se
     toca la pantalla una vez: la ayuda de los gestos de la entrada manda
     sobre los avisos de la luz (y el aviso de la noche, con el texto exacto:
     «cualquier texto de mas de diez letras» lo daba por bueno con la ayuda). */
  const H = horasDeLuz();
  info('horas, con Astronomy Engine: ' + JSON.stringify(H));
  const conLuz = async (hora, luzSol) => {
    ({ ctx, p } = await nueva());
    await p.clock.setFixedTime(new Date(hora));
    await arrancar(p, 'es');
    await p.click('#isla3d-btn');
    await esperar(p, x => x.listo && x.drape);
    await p.evaluate(() => { const cv = document.querySelector('#isla3d .i3-gl'), r = cv.getBoundingClientRect();
      const ev = t => cv.dispatchEvent(new PointerEvent(t, { pointerId: 90, pointerType: 'touch', isPrimary: true, clientX: r.left + 200, clientY: r.top + 420, bubbles: true, cancelable: true }));
      ev('pointerdown'); ev('pointerup'); });
    if (luzSol) { await p.click('#isla3d .i3-luz'); await p.waitForTimeout(800); }
    await p.evaluate(() => TG_ISLA3D._prueba.irA(-16.64, 28.27, 30000, 0, 50));
    await quieto(p);
    await p.waitForTimeout(400);
    return estado(p);
  };
  let x = await conLuz('2026-06-21T12:30:00Z', true);
  ok(x.luz === 'sol' && !x.aviso, 'luz del sol a mediodia (21-06-2026, 13:30 en Canarias): de dia, sin aviso', x);
  await ctx.close();
  /* al atardecer: la cumbre del Teide hace sombra hacia donde no esta el sol */
  x = await conLuz(H.atardecer.t, true);
  const tarde = await p.evaluate(({ lat, lon }) => {
    const s = TG_ISLA3D._prueba, sol = s.sol(), az = sol.az * Math.PI / 180, puntos = [];
    for (const d of [500, 800, 1200]) {
      const pt = k => [lon + k * Math.sin(az) * d / (111320 * Math.cos(lat * Math.PI / 180)), lat + k * Math.cos(az) * d / 110574];
      const a = pt(1), c = pt(-1);
      puntos.push({ d, alSol: s.sombraEn(a[0], a[1]), contra: s.sombraEn(c[0], c[1]) });
    }
    return { sol, puntos };
  }, TEIDE);
  ok(!x.aviso && Math.abs(tarde.sol.alt - H.atardecer.alt) < 0.3 && Math.abs(tarde.sol.az - H.atardecer.az) < 0.5,
     'al atardecer (' + H.atardecer.t + '): el sol de la app, donde dice Astronomy Engine (' + tarde.sol.az.toFixed(1) + '°, ' + tarde.sol.alt.toFixed(1) + '° de altura)', { x, tarde });
  if (x.gl2) {
    const alSol = tarde.puntos.filter(q => q.alSol > 0.5).length, contra = tarde.puntos.filter(q => q.contra !== null && q.contra < 0.5).length;
    ok(x.sombras && alSol >= 2 && contra >= 2, 'al atardecer, sombras proyectadas: alrededor de la cumbre del Teide, a 500, 800 y 1.200 m, al sol del lado del sol (' + alSol + ' de 3) y a la sombra del otro (' + contra + ' de 3)', tarde.puntos);
  } else info('sin WebGL 2 no hay sombras proyectadas (se prueba aparte)');
  await p.click('#isla3d .i3-luz');
  await p.waitForTimeout(500);
  ok((await estado(p)).sombras === false, 'con la luz de mapa, sin sombras proyectadas: no es la luz de nada');
  await ctx.close();
  /* de noche */
  for (const [que, hora, k, sombras] of [['con la luna alta', H.conLuna, 'isla3dNoche', true], ['sin luna', H.sinLuna, 'isla3dNocheSinLuna', false]]) {
    x = await conLuz(hora, true);
    ok(x.aviso === UI0[k].es && (x.gl2 ? x.sombras === sombras : !x.sombras),
       'de noche ' + que + ' (' + hora + '): «' + x.aviso + '», ' + (sombras ? 'con las sombras de la luna' : 'sin sombras proyectadas'), x);
    if (!sombras) {
      const cielo = await p.evaluate(() => TG_ISLA3D._prueba.pixeles([[195, 110]])[0]);
      ok(cielo[0] + cielo[1] + cielo[2] < 150, 'el cielo de noche, oscuro', cielo);
    }
    await ctx.close();
  }

  /* ── los diez idiomas ── */
  const UI = literal(lee('modulos/isla3d.js'), 'var ISLA3D_UI = {');
  const malIdioma = [];
  for (const L of LANGS) {
    ({ ctx, p } = await nueva({ locale: 'es-ES' }));
    await arrancar(p, L);
    await p.click('#isla3d-btn');
    await esperar(p, x => x.listo);
    const t = await p.evaluate(() => ({ tit: document.querySelector('#isla3d .i3-titulo').textContent, luz: document.querySelector('#isla3d .i3-luz').textContent,
      volver: document.querySelector('#isla3d .i3-2d').getAttribute('aria-label'), norte: document.querySelector('#isla3d .i3-brujula').getAttribute('aria-label'),
      boton: document.getElementById('isla3d-btn').getAttribute('aria-label'), cred: document.querySelector('#isla3d .i3-creditos').textContent }));
    if (t.tit !== UI.isla3dTitulo[L]) malIdioma.push(L + ' titulo: ' + t.tit);
    if (t.luz !== UI.isla3dLuzMapa[L]) malIdioma.push(L + ' luz: ' + t.luz);
    if (t.volver !== UI.isla3dVolver[L]) malIdioma.push(L + ' volver: ' + t.volver);
    if (t.norte !== UI.isla3dNorte[L]) malIdioma.push(L + ' norte: ' + t.norte);
    if (t.cred.indexOf(UI.isla3dRelieve[L]) !== 0) malIdioma.push(L + ' creditos: ' + t.cred);
    await ctx.close();
  }
  ok(!malIdioma.length, 'los diez idiomas: titulo, botones, brujula y creditos en el idioma de la app', malIdioma.join(' | '));

  /* ── un PNG tocado no se dibuja ── */
  ({ ctx, p } = await nueva());
  await p.route('**/mapa/tenerife-relieve.png', async route => {
    const r = await route.fetch();
    const buf = Buffer.from(await r.body());
    /* el PNG tal cual pero con otro valor en una fila: se rehace con zlib */
    const zlib = require('zlib');
    const trozos = []; let o = 8;
    while (o < buf.length) { const n = buf.readUInt32BE(o), t = buf.slice(o + 4, o + 8).toString('latin1'); trozos.push([t, buf.slice(o + 8, o + 8 + n)]); o += 12 + n; }
    const idat = Buffer.concat(trozos.filter(c => c[0] === 'IDAT').map(c => c[1]));
    const raw = zlib.inflateSync(idat);
    const w = trozos[0][1].readUInt32BE(0), fila = 1 + w * 3, j = 600;
    raw[j * fila] = 0; raw[j * fila + 1 + 700 * 3 + 1] ^= 0x10;    // filtro «none» en esa fila y un byte cambiado
    const crc = require('zlib').crc32 ? (t, d) => require('zlib').crc32(Buffer.concat([Buffer.from(t, 'latin1'), d])) : null;
    const nuevo = zlib.deflateSync(raw);
    const piezas = [buf.slice(0, 8)];
    let puesto = false;
    for (const [t, d] of trozos) {
      if (t === 'IDAT') { if (puesto) continue; puesto = true; piezas.push(chunk('IDAT', nuevo)); }
      else piezas.push(chunk(t, d));
    }
    function chunk(t, d) {
      const len = Buffer.alloc(4); len.writeUInt32BE(d.length);
      const c = Buffer.alloc(4); c.writeUInt32BE(crc ? crc(t, d) >>> 0 : crc32(Buffer.concat([Buffer.from(t, 'latin1'), d])));
      return Buffer.concat([len, Buffer.from(t, 'latin1'), d, c]);
    }
    function crc32(b) { let c, crc = 0xFFFFFFFF; for (let n = 0; n < b.length; n++) { c = (crc ^ b[n]) & 0xFF; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; crc = (crc >>> 8) ^ c; } return (crc ^ 0xFFFFFFFF) >>> 0; }
    await route.fulfill({ status: 200, contentType: 'image/png', body: Buffer.concat(piezas) });
  });
  await arrancar(p, 'es');
  await p.click('#isla3d-btn');
  await p.waitForTimeout(3000);
  x = await estado(p);
  ok(x && !x.listo && /no se ha le|no se dibuja/.test(x.estado), 'un PNG con un solo valor cambiado no se dibuja, y lo dice', x);
  await ctx.close();

  /* ── un relieve de una fuente que el modulo no conoce no se dibuja: el credito
     no sale nunca del .json (DEM_FUENTES) ── */
  ({ ctx, p } = await nueva());
  await p.route('**/mapa/tenerife-relieve.json', async route => {
    // index.html pregunta antes con un HEAD (sin cuerpo): ese pasa tal cual
    if (route.request().method() !== 'GET') return route.continue();
    const r = await route.fetch();
    const j = JSON.parse(await r.text());
    j.fuente = Object.assign({}, j.fuente, { id: 'otra-fuente', credito: 'CREDITO DE OTRA FUENTE' });
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(j) });
  });
  await arrancar(p, 'es');
  await p.click('#isla3d-btn');
  await p.waitForTimeout(3000);
  x = await estado(p);
  const credOtra = await p.evaluate(() => { const c = document.querySelector('#isla3d .i3-creditos'); return c ? c.textContent : ''; });
  ok(x && !x.listo && /No se pudo abrir la isla en 3D/.test(x.estado) && credOtra.indexOf('CREDITO DE OTRA FUENTE') < 0,
     'un relieve de una fuente que el modulo no conoce no se dibuja, y lo dice', { x, credOtra });
  await ctx.close();

  /* ── el movil le quita la GPU a la pagina (iOS, en segundo plano) y se la devuelve ── */
  ({ ctx, p } = await nueva());
  await arrancar(p, 'es');
  await p.click('#isla3d-btn');
  await esperar(p, y => y.listo && y.drape);
  const perdida = await p.evaluate(async () => {
    const cv = document.querySelector('#isla3d .i3-gl');
    const gl = cv.getContext('webgl2') || cv.getContext('webgl');
    const ext = gl && gl.getExtension('WEBGL_lose_context');
    if (!ext) return null;
    ext.loseContext();
    await new Promise(r => setTimeout(r, 500));
    const d = TG_ISLA3D._prueba.estado();
    ext.restoreContext();
    return { listo: d.listo, estado: d.estado };
  });
  if (!perdida) info('este navegador no tiene WEBGL_lose_context: la perdida de la GPU, sin probar');
  else {
    const despues = await esperar(p, y => y.listo && y.drape && !y.estado, 30000);
    await p.evaluate(() => TG_ISLA3D._prueba.irA(-16.55, 28.28, 100000, 0, 0));
    await quieto(p);
    const cR = await p.evaluate(() => { const s = TG_ISLA3D._prueba, q = [[-16.6, 28.55], [-16.64, 28.27]].map(v => s.pantallaDe(v[0], v[1])); return q.some(v => !v) ? null : s.pixeles(q); });
    const azulR = c => c && c[2] > c[0] + 25 && c[2] > c[1];
    ok(!perdida.listo && perdida.estado === UI0.isla3dPerdido.es && despues && despues.listo && despues.drape && !despues.estado && cR && azulR(cR[0]) && !azulR(cR[1]),
       'si el movil le quita la GPU, lo dice; y cuando la devuelve, el 3D se rehace solo (relieve, mapa, mar y tierra)', { perdida, despues, cR });
  }
  await ctx.close();

  /* ── sin red, con el service worker ── */
  ({ ctx, p } = await nueva({ serviceWorkers: 'allow' }));
  await arrancar(p, 'es');
  await p.evaluate(() => navigator.serviceWorker && navigator.serviceWorker.ready);
  await p.waitForTimeout(2500);
  await ctx.setOffline(true);
  await p.reload({ waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(2500);
  await bienvenida(p, 'es');
  const ocultoSinRed = await p.evaluate(() => { const b = document.getElementById('isla3d-btn'); return !b || b.hidden; });
  ok(!ocultoSinRed, 'sin red, el boton «3D» sigue (el relieve esta en la cache)');
  if (!ocultoSinRed) {
    await p.click('#isla3d-btn');
    x = await esperar(p, y => y.listo && y.drape, 20000);
    ok(x && x.listo && x.drape, 'sin red abre igual: relieve y mapa de la cache', x);
  }
  await ctx.close();

  /* ── con WebGL 1 (moviles viejos): dibuja igual, sin sombras proyectadas ── */
  const b1 = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--disable-webgl2'] }).catch(() => null);
  if (b1) {
    const c1x = await b1.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
    const p1 = await c1x.newPage();
    const err1 = [];
    p1.on('pageerror', e1 => err1.push(e1.message));
    await p1.clock.setFixedTime(new Date(H.atardecer.t));
    await arrancar(p1, 'es');
    const sin2 = await p1.evaluate(() => !document.createElement('canvas').getContext('webgl2'));
    if (!sin2) info('este Chromium no deja quitar WebGL 2 (--disable-webgl2): WebGL 1 sin probar');
    else {
      await p1.click('#isla3d-btn');
      let s1 = await esperar(p1, y => y.listo && y.drape);
      await p1.click('#isla3d .i3-luz');
      await p1.waitForTimeout(800);
      await p1.evaluate(() => TG_ISLA3D._prueba.irA(-16.55, 28.28, 100000, 0, 0));
      await quieto(p1);
      s1 = await estado(p1);
      const c1 = await p1.evaluate(() => { const s = TG_ISLA3D._prueba, q = [[-16.6, 28.55], [-16.64, 28.27]].map(v => s.pantallaDe(v[0], v[1])); return q.some(v => !v) ? null : s.pixeles(q); });
      const azul1 = c => c && c[2] > c[0] + 25 && c[2] > c[1];
      ok(s1 && s1.listo && !s1.gl2 && s1.drape && !s1.sombras && c1 && azul1(c1[0]) && !azul1(c1[1]) && !err1.length,
         'con WebGL 1: dibuja relieve y mapa, mar y tierra en su sitio, sin sombras proyectadas y sin errores', { s1, c1, err1 });
    }
    await b1.close();
  }

  /* ── sin WebGL ── */
  const b2 = await chromium.launch({ args: ['--disable-webgl', '--disable-3d-apis'], executablePath: fs.existsSync('/usr/bin/google-chrome') ? '/usr/bin/google-chrome' : undefined }).catch(() => null);
  if (b2) {
    const c2x = await b2.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
    const p2 = await c2x.newPage();
    const err2 = [];
    p2.on('pageerror', e => err2.push(e.message));
    await arrancar(p2, 'es');
    await p2.click('#isla3d-btn');
    await p2.waitForTimeout(2500);
    const s2 = await p2.evaluate(() => TG_ISLA3D._prueba.estado());
    ok(s2.sinWebGL && /WebGL/.test(s2.estado) && !err2.length, 'sin WebGL: lo dice y no revienta', { s2, err2 });
    await b2.close();
  }

  /* ── lo que tarda (informativo) ── */
  ({ ctx, p } = await nueva());
  await arrancar(p, 'es');
  await p.click('#isla3d-btn');
  await esperar(p, x => x.listo && x.drape);
  await p.evaluate(() => TG_ISLA3D._prueba.irA(-16.6, 28.3, 20000, 20, 55));
  await quieto(p);
  const cdp2 = await ctx.newCDPSession(p);
  await cdp2.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await p.evaluate(() => { window.__f = []; let u = performance.now(); (function r(t) { window.__f.push(t - u); u = t; if (window.__f.length < 400) requestAnimationFrame(r); })(u); });
  const t2 = async (tipo, pts) => cdp2.send('Input.dispatchTouchEvent', { type: tipo, touchPoints: pts.map((q, i) => ({ x: q[0], y: q[1], id: i })) });
  await t2('touchStart', [[200, 600]]);
  for (let k = 1; k <= 30; k++) { await t2('touchMove', [[200 - k * 4, 600 - k * 6]]); await p.waitForTimeout(16); }
  await t2('touchEnd', []);
  const f = await p.evaluate(() => window.__f.slice(2).filter(x => x > 0).sort((a, b) => a - b));
  await cdp2.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  if (f.length) info('arrastre con la CPU x4 (WebGL por software): mediana ' + f[Math.floor(f.length / 2)].toFixed(0) + ' ms, peor ' + f[f.length - 1].toFixed(0) + ' ms por fotograma');
  await ctx.close();

  ok(!errores.length, 'cero errores de pagina', errores.slice(0, 5));
  await b.close();
}

(async () => {
  sinNavegador();
  if (await servidorConRelieve()) await navegador();
  else await sinRelieve();
  console.log('\n  ' + hechos + ' controles, ' + fallos + ' en rojo');
  process.exit(fallos ? 1 : 0);
})().catch(e => { console.log('  MAL la prueba se cayo: ' + (e && e.stack || e)); process.exit(1); });
