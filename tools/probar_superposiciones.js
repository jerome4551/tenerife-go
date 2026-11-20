#!/usr/bin/env node
/* Lo que queda encima de cada panel del mapa (20 de noviembre de 2026, prueba de los dos moviles, bloque 3).
 * La prueba vio el panel de guaguas tapado: la «Leyenda», el 🏆, la ⓘ y los enlaces de abajo se pintaban encima (el 🏆
 * tapaba el interruptor de una linea) y, en el iPhone, el panel empezaba debajo de la barra de arriba, con su ✕ sin poder
 * tocarse. Aqui, en dos moviles —el iPhone con su isla dinamica y su barra de inicio (zonas seguras de 62 y 34 px) y un
 * Android de 360 px—, panel por panel:
 *   · ningun boton flotante del mapa se pinta encima del panel (se mira el punto del centro de cada uno);
 *   · la barra de arriba no tapa el borde de arriba del panel (o el panel va por debajo de ella, o por encima);
 *   · su ✕ es lo de encima en su sitio y queda fuera de la zona de la isla dinamica.
 * Y lo que tiene que seguir encima del panel de guaguas: su aviso de «compartir» y «Paradas cerca».
 *     node tools/probar_superposiciones.js PUERTO      (con la app servida en ese puerto, como en tools/auditar.sh) */
'use strict';
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const PUERTO = process.argv[2] || '8766';
const APP = 'http://127.0.0.1:' + PUERTO + '/index.html';
let bien = 0, malos = 0;
const ok = (c, txt, det) => {
  if (c) { bien++; console.log('  OK  ' + txt); }
  else { malos++; console.log('  MAL ' + txt + (det !== undefined ? '   -> ' + (typeof det === 'string' ? det : JSON.stringify(det)).slice(0, 400) : '')); }
};
const MOVILES = [
  ['el iPhone (zonas seguras 62/34)', { width: 402, height: 874 }, { top: 62, bottom: 34, left: 0, right: 0 }],
  ['un Android de 360 px', { width: 360, height: 780 }, { top: 0, bottom: 0, left: 0, right: 0 }],
];
/* [nombre, como se abre, el panel, como se cierra] */
const PANELES = [
  ['las guaguas', () => toggleBusPanel(), '#bus-panel', () => closeBusPanel()],
  ['las rutas', () => toggleRoutePanel(), '#route-panel', () => closeRoutePanel()],
  ['el asistente', () => openChatPanel(), '#chat-panel', () => closeChatPanel()],
  ['el estado del mar', () => document.getElementById('mar-btn').click(), '#mar-panel', () => { document.getElementById('mar-panel').style.display = 'none'; }],
  ['los avisos del tiempo', () => toggleWxPanel(), '#wx-panel', () => { document.getElementById('wx-panel').style.display = 'none'; }],
  ['los microclimas', () => document.getElementById('mc-btn').click(), '#mc-panel', () => { document.getElementById('mc-panel').style.display = 'none'; }],
  ['las fiestas', () => document.getElementById('fi-btn').click(), '#fi-panel', () => { document.getElementById('fi-panel').style.display = 'none'; }],
  ['paradas cerca', () => openNearbyStopsFor(28.4682, -16.2546, 'Plaza de España'), '#nearby-stops-panel', () => closeNearbyStops()],
  ['las categorias', () => toggleCategorySheet(), '#cat-sheet', () => closeCategorySheet()],
  ['la ficha de un lugar', () => openDetailSheet('teide'), '#detail-sheet', () => closeDetailSheet()],
];
const FLOTANTES = ['.map-legend-toggle', '.tg-trophy-fab', '.pwa-fab', '.pp-pie a', '.leaflet-control-zoom', '#isla3d-btn', '#cielo-btn',
  '#category-btn', '#search-input-wrap', '.leaflet-control-attribution', '#mar-btn', '#mc-btn', '#fi-btn', '#gas-top-btn', '#bus-quick-btn'];

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const errores = [];
  for (const [movil, viewport, seguras] of MOVILES) {
    console.log('\n── ' + movil + ' ──');
    const ctx = await b.newContext({ viewport, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'es-ES', serviceWorkers: 'block' });
    await ctx.route('**/*', r => r.request().url().startsWith('http://127.0.0.1:' + PUERTO + '/') ? r.continue() : r.abort());
    await ctx.addInitScript(() => { try {
      localStorage.setItem('tenerife.tour.seen', '99'); localStorage.setItem('tgo_consent', JSON.stringify({ v: 'denied', t: Date.now() }));
      localStorage.setItem('tg_lang', 'es');
    } catch (e) {} });
    const p = await ctx.newPage();
    p.on('pageerror', e => errores.push(e.message));
    const cdp = await ctx.newCDPSession(p);
    await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: seguras });
    await p.goto(APP, { waitUntil: 'load', timeout: 90000 });
    await p.waitForFunction(() => typeof setLang === 'function' && typeof places !== 'undefined' && places.length > 0, null, { timeout: 60000 });
    if (await p.locator('#v19-welcome:not(.hidden)').count()) { await p.click('#v19-welcome-start').catch(() => {}); await p.waitForTimeout(800); }
    await p.evaluate(() => document.querySelectorAll('.v19-tour, .v19-tour-prompt, .v19-tour-overlay').forEach(e => e.remove()));
    await p.waitForTimeout(800);
    for (const [nombre, abrir, sel, cerrar] of PANELES) {
      await p.evaluate(abrir); await p.waitForTimeout(1200);
      const r = await p.evaluate(([sel, flotantes, segArriba]) => {
        const pan = document.querySelector(sel);
        if (!pan || !pan.checkVisibility()) return { abierto: false };
        const pr = pan.getBoundingClientRect();
        /* el borde de arriba: lo que se ve en su centro, 4 px por dentro, tiene que ser del panel */
        const b0 = document.elementFromPoint(pr.left + pr.width / 2, pr.top + 4);
        const bordeVisto = !!b0 && pan.contains(b0);
        const encima = [];
        for (const s of flotantes) for (const f of document.querySelectorAll(s)) {
          if (pan.contains(f) || !f.checkVisibility({ checkOpacity: true })) continue;
          const fr = f.getBoundingClientRect(); if (fr.width < 1 || fr.height < 1) continue;
          const cx = fr.left + fr.width / 2, cy = fr.top + fr.height / 2;
          if (cx < pr.left || cx > pr.right || cy < pr.top || cy > pr.bottom) continue;
          const t = document.elementFromPoint(cx, cy);
          if (t && (t === f || f.contains(t))) encima.push(s);
        }
        const x = [...pan.querySelectorAll('button')].find(b => /cerrar|close/i.test(b.getAttribute('aria-label') || '') || /^[✕×]$/.test(b.textContent.trim()));
        let cerrarTocable = null;
        if (x) { const cr = x.getBoundingClientRect(), cy = cr.top + cr.height / 2; const t = document.elementFromPoint(cr.left + cr.width / 2, cy); cerrarTocable = !!t && (t === x || x.contains(t)) && cy >= segArriba + 4; }
        return { abierto: true, arriba: Math.round(pr.top), bordeVisto, encima, cerrarTocable };
      }, [sel, FLOTANTES, seguras.top]);
      ok(r.abierto && !r.encima.length && r.bordeVisto && r.cerrarTocable !== false,
        movil + ', ' + nombre + ': nada encima de el, su borde de arriba se ve' + (r.cerrarTocable ? ' y su ✕ se toca' : ''), r);
      await p.evaluate(cerrar); await p.waitForTimeout(400);
    }
    /* encima del panel de guaguas tiene que seguir lo que se abre desde el: su aviso de «compartir»
       (el que dice que hay que activar una linea) y «Paradas cerca» */
    await p.evaluate(() => toggleBusPanel()); await p.waitForTimeout(1000);
    const arriba = await p.evaluate(() => {
      const el = document.getElementById('bus-share-toast');
      showBusToast('prueba');
      if (!el || !el.checkVisibility()) return { aviso: false, visto: false };
      /* el aviso no recibe toques (pointer-events: none) y elementFromPoint se lo salta: para mirar si es lo de
         encima, se le dejan recibir un momento */
      el.style.pointerEvents = 'auto';
      const r = el.getBoundingClientRect(), t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      el.style.pointerEvents = '';
      return { aviso: !!t && (t === el || el.contains(t)), visto: true };
    });
    await p.evaluate(() => openNearbyStopsFor(28.4682, -16.2546, 'Plaza de España')); await p.waitForTimeout(1200);
    const paradas = await p.evaluate(() => {
      const el = document.getElementById('nearby-stops-panel');
      if (!el || !el.checkVisibility()) return false;
      const r = el.getBoundingClientRect(), t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return !!t && el.contains(t);
    });
    ok(arriba.aviso, movil + ', el aviso de «compartir» se ve encima del panel de guaguas', arriba);
    ok(paradas, movil + ', «Paradas cerca» se ve encima del panel de guaguas', { paradas });
    await p.evaluate(() => { closeNearbyStops(); closeBusPanel(); }); await p.waitForTimeout(400);
    await ctx.close();
  }
  ok(errores.length === 0, 'cero errores de pagina', errores.slice(0, 3).join(' | '));
  console.log('\n' + bien + ' bien, ' + malos + ' mal');
  await b.close();
  process.exit(malos ? 1 : 0);
})().catch(e => { console.error('FALLO', e.message); process.exit(2); });
