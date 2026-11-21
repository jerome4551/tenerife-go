#!/usr/bin/env node
/* probar_cifras_rectas.js — las cifras de la app, rectas.
 *
 *     node tools/probar_cifras_rectas.js            sin navegador
 *     node tools/probar_cifras_rectas.js PUERTO     y, con la app servida en 127.0.0.1:PUERTO, en un navegador
 *
 * POR QUE. La letra de los títulos, Cormorant Garamond, trae cifras de estilo antiguo, que suben y bajan de la
 * línea como las minúsculas: el 0 es un círculo pequeño, como una o, y se leía «Zona o Training», «PR-TF 1o» o
 * «2oo6». Jérôme, el 21 de noviembre de 2026 («cambian pero siguen correcto? Si es un sí pues si»): rectas, en
 * toda la app. Los números son los mismos; solo cambia la forma de las cifras, todas a la altura de las mayúsculas.
 *
 * COMO. Una sola regla en index.html, `*, *::before, *::after { font-feature-settings: "lnum" 1 !important; }`.
 * En todos los elementos y con !important porque el atajo `font:` (lo usan muchas reglas de la app y de los
 * módulos) devuelve font-feature-settings a «normal» en su propio elemento, y la herencia sola no llega.
 *
 * QUE MIRA.
 *   Sin navegador:
 *   1. que la regla está en index.html, una vez y tal cual;
 *   2. que ninguna otra regla de la app (index.html, modulos/, las fuentes del entrenador, vendor/*.css) toca
 *      font-feature-settings: es lo único que podría quitársela a algún texto;
 *   3. que los ficheros de Cormorant Garamond que pintan las cifras (los de vendor/fuentes.css cuyo unicode-range
 *      cubre 0-9) traen la función «lnum» en su tabla GSUB, con alguna sustitución: sin ella la regla no haría nada.
 *   Con PUERTO, en la app servida:
 *   4. que la letra cambia de verdad: un «0» de Cormorant a 200 px, puesto con el atajo `font:`, mide de alto lo
 *      que una H (cifra recta) con la regla, y bastante menos sin ella (estilo antiguo: el control sabe ver el fallo);
 *   5. que todo texto con Cormorant y alguna cifra, en el arranque, en la ficha de tres lugares con cifras en el
 *      nombre y en «Gasolineras más baratas cerca de usted» (los precios), lleva "lnum" en su estilo calculado.
 * Sale con 1 si algo falla. Lo que se dibuja en un <canvas> (la postal de «Su cuerpo») no lo coge ninguna regla de
 * estilo: el canvas no tiene esa propiedad. Por eso aquí no se mira.
 */
'use strict';
const fs = require('fs'), path = require('path'), zlib = require('zlib');
const RAIZ = path.join(__dirname, '..');
const PUERTO = process.argv[2];
const REGLA = '*, *::before, *::after { font-feature-settings: "lnum" 1 !important; }';
let malos = 0, bien = 0;
const ok = (c, txt, det) => {
  if (c) { bien++; console.log('  OK  ' + txt); }
  else { malos++; console.log('  MAL ' + txt + (det !== undefined ? '   -> ' + (typeof det === 'string' ? det : JSON.stringify(det)).slice(0, 400) : '')); }
};
const leer = f => fs.readFileSync(path.join(RAIZ, f), 'utf8');

/* 1 y 2 — la regla, y que nada más toque font-feature-settings */
const html = leer('index.html');
const veces = html.split(REGLA).length - 1;
ok(veces === 1, 'index.html: la regla de las cifras rectas, una vez y tal cual (' + veces + ')');
const conFfs = [];
const mirar = f => {
  const t = leer(f);
  /* una declaración o una asignación (con sus dos puntos o su =), no la palabra en un comentario */
  let n = (t.match(/font-feature-settings\s*:|fontFeatureSettings\s*[:=]|setProperty\(\s*['"]font-feature-settings/g) || []).length;
  if (f === 'index.html') n -= veces;     // la propia regla
  if (n > 0) conFfs.push(f + ' (' + n + ')');
};
['index.html'].concat(
  fs.readdirSync(path.join(RAIZ, 'modulos')).filter(f => /\.js$/.test(f)).map(f => 'modulos/' + f),
  fs.existsSync(path.join(RAIZ, 'modulos', 'entrenador')) ? fs.readdirSync(path.join(RAIZ, 'modulos', 'entrenador')).filter(f => /\.js$/.test(f)).map(f => 'modulos/entrenador/' + f) : [],
  fs.readdirSync(path.join(RAIZ, 'tools', 'entrenador', 'src')).filter(f => /\.js$/.test(f)).map(f => 'tools/entrenador/src/' + f),
  fs.readdirSync(path.join(RAIZ, 'vendor')).filter(f => /\.css$/.test(f)).map(f => 'vendor/' + f)
).forEach(mirar);
ok(conFfs.length === 0, 'ninguna otra regla de la app toca font-feature-settings', conFfs);

/* 3 — «lnum» en la tabla GSUB de los ficheros de Cormorant que pintan las cifras. woff2: tras la cabecera, el
   directorio de tablas (cada una con su etiqueta, su largo y, si va transformada, su largo transformado) y un
   bloque brotli con todas las tablas seguidas. GSUB nunca va transformada. */
const TAGS = ['cmap', 'head', 'hhea', 'hmtx', 'maxp', 'name', 'OS/2', 'post', 'cvt ', 'fpgm', 'glyf', 'loca', 'prep', 'CFF ', 'VORG', 'EBDT',
  'EBLC', 'gasp', 'hdmx', 'kern', 'LTSH', 'PCLT', 'VDMX', 'vhea', 'vmtx', 'BASE', 'GDEF', 'GPOS', 'GSUB', 'EBSC', 'JSTF', 'MATH', 'CBDT', 'CBLC',
  'COLR', 'CPAL', 'SVG ', 'sbix', 'acnt', 'avar', 'bdat', 'bloc', 'bsln', 'cvar', 'fdsc', 'feat', 'fmtx', 'fvar', 'gvar', 'hsty', 'just', 'lcar',
  'mort', 'morx', 'opbd', 'prop', 'trak', 'Zapf', 'Silf', 'Glat', 'Gloc', 'Feat', 'Sill'];
function base128(b, o) {
  let v = 0;
  for (let i = 0; i < 5; i++) { const x = b[o.i++]; v = (v * 128) + (x & 0x7f); if (!(x & 0x80)) return v; }
  throw new Error('UIntBase128 mal formado');
}
function tablaWoff2(file, cual) {
  const b = fs.readFileSync(file);
  if (b.toString('latin1', 0, 4) !== 'wOF2') throw new Error(file + ': no es woff2');
  const numTables = b.readUInt16BE(12), compLen = b.readUInt32BE(20);
  const o = { i: 48 }, tablas = [];
  for (let t = 0; t < numTables; t++) {
    const flags = b[o.i++];
    const tag = (flags & 0x3f) === 63 ? b.toString('latin1', o.i, (o.i += 4)) : TAGS[flags & 0x3f];
    const ver = flags >> 6;
    let largo = base128(b, o);
    const transformada = (tag === 'glyf' || tag === 'loca') ? ver === 0 : (tag === 'hmtx' ? ver === 1 : false);
    if (transformada) largo = base128(b, o);
    tablas.push({ tag, largo });
  }
  const datos = zlib.brotliDecompressSync(b.subarray(o.i, o.i + compLen));
  let off = 0;
  for (const t of tablas) { if (t.tag === cual) return datos.subarray(off, off + t.largo); off += t.largo; }
  return null;
}
/* las funciones de GSUB con su etiqueta y cuántas sustituciones (lookups) lleva cada una */
function funcionesGsub(g) {
  const fl = g.readUInt16BE(6), n = g.readUInt16BE(fl), out = {};
  for (let k = 0; k < n; k++) {
    const tag = g.toString('latin1', fl + 2 + k * 6, fl + 6 + k * 6), fo = g.readUInt16BE(fl + 6 + k * 6);
    out[tag] = (out[tag] || 0) + g.readUInt16BE(fl + fo + 2);
  }
  return out;
}
const css = leer('vendor/fuentes.css');
const caras = [];
for (const m of css.matchAll(/@font-face\s*\{([^}]*)\}/g)) {
  const c = m[1];
  const fam = (c.match(/font-family:\s*'([^']+)'/) || [])[1], peso = (c.match(/font-weight:\s*(\d+)/) || [])[1];
  const url = (c.match(/url\(([^)]+)\)/) || [])[1], ur = (c.match(/unicode-range:\s*([^;]+);/) || [])[1];
  if (fam !== 'Cormorant Garamond' || !url || !ur) continue;
  const rangos = ur.split(',').map(x => x.trim().replace(/^U\+/i, '')).filter(Boolean).map(x => { const [a, z] = x.split('-'); return [parseInt(a, 16), parseInt(z || a, 16)]; });
  const cifras = [...'0123456789'].every(d => rangos.some(([a, z]) => d.charCodeAt(0) >= a && d.charCodeAt(0) <= z));
  if (cifras) caras.push({ peso, url });
}
ok(caras.length >= 3, 'vendor/fuentes.css: ficheros de Cormorant Garamond que pintan las cifras: ' + caras.length + ' (' + caras.map(c => c.peso).join(', ') + ')');
for (const c of caras) {
  let f = null;
  try { const g = tablaWoff2(path.join(RAIZ, 'vendor', c.url), 'GSUB'); f = g ? funcionesGsub(g) : null; } catch (e) { f = { error: e.message }; }
  ok(!!f && f.lnum > 0, c.url + ': «lnum» en su tabla GSUB' + (f && f.lnum ? ' (' + f.lnum + ' sustitución/es)' : ''), f && Object.keys(f).join(' '));
}

if (!PUERTO) { console.log('\n' + bien + ' bien, ' + malos + ' mal (sin navegador)'); process.exit(malos ? 1 : 0); }

/* 4 y 5 — en la app servida */
const { chromium } = require('playwright');
const BASE = 'http://127.0.0.1:' + PUERTO;
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, serviceWorkers: 'block', locale: 'es-ES',
    geolocation: { latitude: 28.4682, longitude: -16.2546, accuracy: 20 }, permissions: ['geolocation'] });
  await ctx.route('**/*', r => r.request().url().startsWith(BASE + '/') ? r.continue() : r.abort());
  await ctx.addInitScript(() => { try { localStorage.setItem('tenerife.tour.seen', '99'); localStorage.setItem('tgo_consent', JSON.stringify({ v: 'denied', t: Date.now() })); } catch (e) {} });
  const p = await ctx.newPage(), err = [];
  p.on('pageerror', e => err.push(e.message));
  await p.goto(BASE + '/index.html', { waitUntil: 'load', timeout: 60000 });
  await p.waitForFunction(() => typeof places !== 'undefined' && places.length > 900 && typeof openPlaceFromHash === 'function', null, { timeout: 60000 });
  if (await p.locator('#v19-welcome:not(.hidden)').count()) { await p.click('#v19-welcome-start').catch(() => {}); await p.waitForTimeout(800); }
  await p.evaluate(() => document.querySelectorAll('.v19-tour, .v19-tour-prompt, .v19-tour-overlay').forEach(e => e.remove()));
  await p.evaluate(() => document.fonts.load('600 200px "Cormorant Garamond"', '0H'));
  await p.evaluate(() => document.fonts.ready);

  /* 4 — el alto de la tinta de «0» frente a «H», con la regla y sin ella (font-feature-settings en línea con
     !important: gana a la regla). Los cuatro, con el atajo `font:`, el caso que la herencia no cubre. */
  const alto = async (txt, sinRegla) => {
    await p.evaluate(([txt, sinRegla]) => {
      let d = document.getElementById('prueba-cifras');
      if (!d) { d = document.createElement('div'); d.id = 'prueba-cifras'; document.body.appendChild(d); }
      d.style.cssText = 'position:fixed;left:0;top:0;width:320px;height:300px;z-index:2147483647;background:#fff;color:#000;' +
        'font:600 200px/300px "Cormorant Garamond",serif;padding-left:40px' + (sinRegla ? ';font-feature-settings:normal !important' : '');
      d.textContent = txt;
    }, [txt, sinRegla]);
    await p.waitForTimeout(150);
    const png = (await p.screenshot({ clip: { x: 0, y: 0, width: 320, height: 300 } })).toString('base64');
    return p.evaluate(async png => {
      const im = new Image(); im.src = 'data:image/png;base64,' + png; await im.decode();
      const c = document.createElement('canvas'); c.width = im.width; c.height = im.height;
      const x = c.getContext('2d'); x.drawImage(im, 0, 0);
      const px = x.getImageData(0, 0, c.width, c.height).data;
      let arriba = -1, abajo = -1;
      for (let y = 0; y < c.height; y++) {
        let tinta = false;
        for (let i = 0; i < c.width && !tinta; i++) { const k = (y * c.width + i) * 4; if (px[k] < 128 && px[k + 1] < 128 && px[k + 2] < 128) tinta = true; }
        if (tinta) { if (arriba < 0) arriba = y; abajo = y; }
      }
      return arriba < 0 ? 0 : abajo - arriba + 1;
    }, png);
  };
  const h = await alto('H', false), cero = await alto('0', false), hSin = await alto('H', true), ceroSin = await alto('0', true);
  await p.evaluate(() => { const d = document.getElementById('prueba-cifras'); if (d) d.remove(); });
  ok(h > 60 && cero / h > 0.92, 'con la regla, el 0 de Cormorant mide lo que una H (' + cero + ' px frente a ' + h + ')');
  ok(hSin > 60 && ceroSin / hSin < 0.85, 'sin ella, el 0 es de estilo antiguo, más bajo (' + ceroSin + ' px frente a ' + hSin + '): el control ve el fallo');

  /* 5 — todo texto con Cormorant y alguna cifra lleva "lnum", en el arranque y en tres fichas */
  const revisa = async donde => p.evaluate(donde => {
    const malos = [], vistos = [];
    for (const e of document.querySelectorAll('body *')) {
      const cs = getComputedStyle(e);
      if (!/Cormorant/i.test(cs.fontFamily)) continue;
      const propio = [...e.childNodes].filter(n => n.nodeType === 3).map(n => n.nodeValue).join('');
      if (!/\d/.test(propio)) continue;
      const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue;
      vistos.push(propio.trim().slice(0, 30));
      if (!/"lnum"/.test(cs.fontFeatureSettings)) malos.push(donde + ': ' + (e.id || e.className || e.tagName) + ' «' + propio.trim().slice(0, 30) + '» ' + cs.fontFeatureSettings);
    }
    return { malos, vistos };
  }, donde);
  const r0 = await revisa('arranque');
  ok(r0.malos.length === 0, 'arranque: los textos con Cormorant y cifras (' + r0.vistos.length + '), todos con "lnum"', r0.malos);
  for (const id of ['gym-zona0-rosario', 'prtf-10-cruz-carmen-chinamada', 'na-grupo2006-santacruz']) {
    const hay = await p.evaluate(id => places.some(q => q.id === id), id);
    if (!hay) { ok(false, 'la ficha ' + id + ' existe'); continue; }
    await p.evaluate(id => { location.hash = 'lugar=' + id; openPlaceFromHash(); }, id);
    await p.waitForSelector('.leaflet-popup .popup-name', { timeout: 15000 }).catch(() => {});
    await p.waitForTimeout(1600);
    const nombre = await p.evaluate(() => { const e = document.querySelector('.leaflet-popup .popup-name'); return e ? [e.textContent.trim(), getComputedStyle(e).fontFeatureSettings] : null; });
    const r = await revisa(id);
    ok(!!nombre && /\d/.test(nombre[0]) && /"lnum"/.test(nombre[1]) && r.malos.length === 0,
      'la ficha «' + (nombre ? nombre[0] : id) + '»: el título y los demás textos con cifras, con "lnum"', { nombre, malos: r.malos });
    await p.evaluate(() => { if (typeof map !== 'undefined') map.closePopup(); });
  }
  /* los precios de «Gasolineras más baratas cerca de usted», con la posición de prueba en Santa Cruz */
  await p.evaluate(() => abrirGasCerca());
  await p.waitForFunction(() => { const e = document.getElementById('gas-cerca-panel'); return e && /\d,\d{3}\s*€/.test(e.textContent); }, null, { timeout: 20000 }).catch(() => {});
  await p.waitForTimeout(800);
  const rg = await revisa('gasolineras');
  const precios = rg.vistos.filter(v => /\d,\d{3}/.test(v));
  ok(precios.length > 0 && rg.malos.length === 0, 'gasolineras: los precios con Cormorant (' + precios.length + ', p. ej. «' + (precios[0] || '') + '»), con "lnum"', rg.malos.length ? rg.malos : rg.vistos.slice(0, 5));
  ok(err.length === 0, 'sin errores de página', err);
  await b.close();
  console.log('\n' + bien + ' bien, ' + malos + ' mal');
  process.exit(malos ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
