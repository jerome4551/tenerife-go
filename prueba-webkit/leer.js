// Lee los PNG del relieve como modulos/isla3d.js (fetch, createImageBitmap o <img>, canvas 2D,
// getImageData) en WebKit, y los compara byte a byte con lo que tienen dentro. Despues abre el 3D
// de la app en un iPhone emulado y dice lo que pasa. node prueba-webkit/leer.js PUERTO
const { webkit, devices } = require('playwright');
const P = process.argv[2], B = 'http://127.0.0.1:' + P + '/';
(async () => {
  const b = await webkit.launch();
  console.log('WebKit ' + b.version() + ' en ' + process.platform);
  const ctx = await b.newContext(Object.assign({}, devices['iPhone 13'], { serviceWorkers: 'block' }));
  const p = await ctx.newPage();
  await p.goto(B + 'mapa/tenerife-relieve.json');
  const r = await p.evaluate(async () => {
    function leerPNG(url, sinBitmap) {
      return fetch(url).then(r => { if (!r.ok) throw new Error(url + ': HTTP ' + r.status); return r.blob(); }).then(b => {
        const img = () => new Promise((ok, mal) => { const u = URL.createObjectURL(b), i = new Image(); i.onload = () => { URL.revokeObjectURL(u); ok(i); }; i.onerror = () => mal(new Error('png')); i.src = u; });
        if (!sinBitmap && window.createImageBitmap) return createImageBitmap(b, { premultiplyAlpha: 'none', colorSpaceConversion: 'none' }).catch(img);
        return img();
      }).then(im => { const c = document.createElement('canvas'); c.width = im.width; c.height = im.height;
        const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(im, 0, 0);
        return { w: im.width, h: im.height, d: g.getImageData(0, 0, im.width, im.height).data, bitmap: !!(im.close) }; });
    }
    const bin = u => fetch(u).then(r => { if (!r.ok) throw new Error(u + ': HTTP ' + r.status); return r.arrayBuffer(); }).then(a => new Uint8Array(a));
    const comparar = (d, esp, canales) => {
      let mal = 0, maxd = 0; const ej = {}; const n = esp.length / canales.length;
      for (let i = 0; i < n; i++) for (let k = 0; k < canales.length; k++) {
        const e = esp[i * canales.length + k], g = d[i * 4 + canales[k]];
        if (e !== g) { mal++; maxd = Math.max(maxd, Math.abs(e - g)); const key = e + '→' + g; if (Object.keys(ej).length < 12 || ej[key]) ej[key] = (ej[key] || 0) + 1; }
      }
      return { valores: esp.length, distintos: mal, max: maxd, ejemplos: ej };
    };
    const out = {};
    const espR = await bin('/prueba-webkit/out/esperado-relieve.bin'), espA = await bin('/prueba-webkit/out/esperado-ao.bin');
    for (const sin of [false, true]) {
      const via = sin ? 'img' : 'createImageBitmap';
      const rel = await leerPNG('/mapa/tenerife-relieve.png', sin); out['relieve (RGB) por ' + via] = Object.assign({ tam: rel.w + 'x' + rel.h, bitmap: rel.bitmap }, comparar(rel.d, espR, [0, 1, 2]));
      const ao = await leerPNG('/mapa/tenerife-relieve-ao.png', sin); out['sombras (gris) por ' + via] = Object.assign({ tam: ao.w + 'x' + ao.h }, comparar(ao.d, espA, [0]));
      const aoc = await leerPNG('/prueba-webkit/out/ao-rgb.png', sin); out['sombras en RGB por ' + via] = Object.assign({ tam: aoc.w + 'x' + aoc.h }, comparar(aoc.d, espA, [0]));
    }
    return out;
  });
  for (const [k, v] of Object.entries(r)) console.log('- **' + k + '**: ' + v.tam + ', ' + v.distintos + ' de ' + v.valores + ' valores distintos (max ' + v.max + ')' + (v.distintos ? ' · ' + JSON.stringify(v.ejemplos) : ''));
  // la app de verdad: el boton 3D en un iPhone emulado
  const q = await ctx.newPage(); const err = []; q.on('pageerror', e => err.push(e.message));
  await q.goto(B + 'index.html', { waitUntil: 'load' }); await q.waitForTimeout(1500);
  for (const sel of ['.v19-w-lang[data-lang="es"]', '#v19-welcome-start', '.v19t-prompt button']) { const e = await q.$(sel); if (e && await e.isVisible()) { await e.click(); await q.waitForTimeout(900); } }
  const hay = await q.$('#isla3d-btn');
  console.log('- **la app**: boton 3D ' + (hay && await hay.isVisible() ? 'visible' : 'NO visible'));
  if (hay && await hay.isVisible()) {
    await hay.click();
    let e = null; for (let i = 0; i < 90; i++) { e = await q.evaluate(() => window.TG_ISLA3D && TG_ISLA3D._prueba.estado()); if (e && (e.listo || e.sinWebGL || (e.estado && !/Preparando|Dibujando/.test(e.estado)))) break; await q.waitForTimeout(500); }
    console.log('- **la app, al abrir el 3D**: listo=' + (e && e.listo) + ' · sin WebGL=' + (e && e.sinWebGL) + ' · estado=«' + (e && e.estado) + '» · errores de pagina: ' + err.length + (err.length ? ' ' + JSON.stringify(err.slice(0, 3)) : ''));
  }
  await b.close();
})().catch(e => { console.log('FALLO DE LA PRUEBA: ' + e.message); process.exit(1); });
