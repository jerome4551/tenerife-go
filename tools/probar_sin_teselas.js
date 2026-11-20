#!/usr/bin/env node
/* El mapa del arranque, sin teselas (20 de noviembre de 2026, prueba de los dos moviles, bloque 4).
 * Con cobertura mala o el wifi de un hotel sin internet, el movil dice que hay red (navigator.onLine) pero las teselas
 * de OpenStreetMap no llegan: el mapa se quedaba gris. El paso solo a la «Isla offline» estaba en setStyle(), y la capa
 * del arranque entra con addTo(), sin ese aviso. Aqui, con la app de verdad:
 *   · las teselas de OSM no llegan: la capa pasa sola a la isla, con su aviso;
 *   · llegan: se queda en las calles;
 *   · una de cada tres falla: se queda en las calles (hacen falta seis fallos seguidos);
 *   · cero errores de pagina.
 *     node tools/probar_sin_teselas.js PUERTO      (con la app servida en ese puerto, como en tools/auditar.sh) */
'use strict';
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const PUERTO = process.argv[2] || '8766';
const APP = 'http://127.0.0.1:' + PUERTO + '/index.html';
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
let bien = 0, malos = 0;
const ok = (c, txt, det) => {
  if (c) { bien++; console.log('  OK  ' + txt); }
  else { malos++; console.log('  MAL ' + txt + (det !== undefined ? '   -> ' + (typeof det === 'string' ? det : JSON.stringify(det)).slice(0, 300) : '')); }
};

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const errores = [];
  /* modo: 'nada' (no llega ninguna), 'todas' (llegan), 'una-de-tres' (falla una de cada tres) */
  async function abrir(modo) {
    const ctx = await b.newContext({ viewport: { width: 360, height: 780 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'es-ES', serviceWorkers: 'block' });
    let n = 0, pedidas = 0;
    await ctx.route('**/*', r => {
      const u = r.request().url();
      if (u.startsWith('http://127.0.0.1:' + PUERTO + '/')) return r.continue();
      if (/^https:\/\/[abc]\.tile\.openstreetmap\.org\//.test(u)) {
        pedidas++;
        if (modo === 'nada' || (modo === 'una-de-tres' && ++n % 3 === 0)) return r.abort('internetdisconnected');
        return r.fulfill({ status: 200, contentType: 'image/png', body: PNG });
      }
      return r.abort();
    });
    await ctx.addInitScript(() => { try {
      localStorage.setItem('tenerife.tour.seen', '99'); localStorage.setItem('tgo_consent', JSON.stringify({ v: 'denied', t: Date.now() }));
      localStorage.setItem('tg_lang', 'es');
    } catch (e) {} });
    const p = await ctx.newPage();
    p.on('pageerror', e => errores.push(e.message));
    await p.goto(APP, { waitUntil: 'load', timeout: 90000 });
    await p.waitForFunction(() => typeof setLang === 'function' && typeof map !== 'undefined', null, { timeout: 60000 });
    return { ctx, p, pedidas: () => pedidas };
  }
  const capa = p => p.evaluate(() => ({ capa: currentLayer, enLinea: navigator.onLine }));

  /* 1) no llega ninguna: a la isla, sola */
  {
    const { ctx, p, pedidas } = await abrir('nada');
    const fue = await p.waitForFunction(() => currentLayer === 'isla', null, { timeout: 20000, polling: 200 }).then(() => true).catch(() => false);
    const r = await capa(p);
    ok(fue && r.enLinea, 'sin teselas de OSM y con el movil «en linea», la capa del arranque pasa sola a la isla (' + pedidas() + ' teselas pedidas)', r);
    await ctx.close();
  }
  /* 2) llegan todas: se queda en las calles */
  {
    const { ctx, p, pedidas } = await abrir('todas');
    await p.waitForTimeout(8000);
    const r = await capa(p);
    ok(r.capa === 'streets', 'con las teselas llegando, se queda en las calles (' + pedidas() + ' teselas)', r);
    await ctx.close();
  }
  /* 3) falla una de cada tres: se queda en las calles */
  {
    const { ctx, p, pedidas } = await abrir('una-de-tres');
    await p.evaluate(() => map.setZoom(map.getZoom() + 1));
    await p.waitForTimeout(8000);
    const r = await capa(p);
    ok(r.capa === 'streets', 'si falla una de cada tres, no cambia: hacen falta seis fallos seguidos (' + pedidas() + ' teselas)', r);
    await ctx.close();
  }
  ok(errores.length === 0, 'cero errores de pagina', errores.slice(0, 3).join(' | '));
  console.log('\n' + bien + ' bien, ' + malos + ' mal');
  await b.close();
  process.exit(malos ? 1 : 0);
})().catch(e => { console.error('FALLO', e.message); process.exit(2); });
