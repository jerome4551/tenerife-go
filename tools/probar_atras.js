#!/usr/bin/env node
/* El boton (o el gesto) «atras» del movil en los paneles del mapa (20 de noviembre de 2026, prueba de los dos moviles,
 * bloque 2). Quien llega a la app desde otra web y abre algo espera que «atras» cierre lo abierto, no salir de la app.
 * Hasta hoy, en 13 de 16 pantallas, «atras» sacaba de la app (en la de Android, la cerraba): solo el SOS, el perfil y
 * la isla en 3D ponian su entrada en el historial.
 *
 * Se llega desde otra web (la de antes en el historial) y, panel por panel: se abre con el dedo (o con la funcion que
 * llama su boton), se pulsa «atras» y se mira que la app sigue y que el panel se ha cerrado. Y ademas:
 *   · cerrar con su ✕ no deja una entrada muerta: el «atras» siguiente sale de la app;
 *   · dos paneles, uno encima del otro: cada «atras» cierra el de arriba;
 *   · un modulo encima de un panel (el perfil sobre la ficha) y un panel encima de un modulo (la cuenta sobre el
 *     perfil): cada «atras» cierra lo de arriba y deja lo de abajo;
 *   · la ficha que da paso a «Paradas cerca» (se cierra una y se abre otra a la vez): un «atras» cierra la segunda y
 *     el siguiente sale de la app;
 *   · un modulo que se cierra con su propio «atras» y abre a la vez un panel de aqui: en el SOS, tocar un aviso de la
 *     AEMET (los de prueba de tools/avisos_prueba.js) deja a la vista el panel de los avisos; un «atras» lo cierra y
 *     el siguiente sale de la app;
 *   · cero errores de pagina.
 *
 *     node tools/probar_atras.js PUERTO      (con la app servida en ese puerto, como en tools/auditar.sh) */
'use strict';
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const PUERTO = process.argv[2] || '8766';
const APP = 'http://127.0.0.1:' + PUERTO + '/index.html';
const ANTES = 'http://antes.prueba/';
const AVISOS = require('./avisos_prueba').ficheros().conAvisos;
let bien = 0, malos = 0;
const ok = (c, txt, det) => {
  if (c) { bien++; console.log('  OK  ' + txt); }
  else { malos++; console.log('  MAL ' + txt + (det !== undefined ? '   -> ' + (typeof det === 'string' ? det : JSON.stringify(det)).slice(0, 300) : '')); }
};

/* [nombre, como se abre, como se sabe que esta abierto] */
const PANELES = [
  ['la ficha de un lugar', p => p.evaluate(() => openDetailSheet('teide')), () => document.getElementById('detail-sheet').classList.contains('open')],
  ['el buscador, con resultados', async p => { await p.tap('#search-input'); await p.keyboard.type('playa'); await p.waitForTimeout(500); }, () => document.getElementById('search-suggestions').classList.contains('open')],
  ['las categorias', p => p.tap('#category-btn'), () => document.getElementById('cat-sheet').classList.contains('open')],
  ['las guaguas', p => p.tap('#bus-quick-btn'), () => document.getElementById('bus-panel').classList.contains('open')],
  ['las rutas', p => p.tap('#v19-nav-routes'), () => document.getElementById('route-panel').classList.contains('open')],
  ['paradas cerca', p => p.evaluate(() => openNearbyStopsFor(28.4682, -16.2546, 'Plaza de España')), () => document.getElementById('nearby-stops-panel').classList.contains('open')],
  ['el asistente', p => p.tap('#v19-nav-chat'), () => document.getElementById('chat-panel').classList.contains('open')],
  ['el estado del mar', p => p.tap('#mar-btn'), () => document.getElementById('mar-panel').style.display === 'block'],
  ['los microclimas', p => p.tap('#mc-btn'), () => document.getElementById('mc-panel').style.display === 'block'],
  ['las fiestas', p => p.tap('#fi-btn'), () => document.getElementById('fi-panel').style.display === 'flex'],
  ['los avisos del tiempo', p => p.evaluate(() => toggleWxPanel()), () => document.getElementById('wx-panel').style.display === 'block'],
  ['los logros', p => p.tap('.tg-trophy-fab'), () => !!document.querySelector('.tg-badges-overlay.open')],
  ['la gasolinera mas barata', p => p.tap('#gas-top-btn'), () => document.getElementById('gas-cerca-panel').classList.contains('open')],
  ['«Organice su dia»', p => p.evaluate(() => openDayPlanner()), () => document.getElementById('dp-overlay').classList.contains('open')],
  ['entrar / crear cuenta', p => p.evaluate(() => openAuthModal()), () => document.getElementById('auth-modal-backdrop').classList.contains('show')],
  ['la privacidad', p => p.evaluate(() => openPrivacyPanel()), () => document.getElementById('privacy-panel').classList.contains('open')],
  ['el cielo de Tenerife', async p => { await p.tap('#cielo-btn'); await p.waitForFunction(() => window.TG_CIELO && TG_CIELO.estado.abierto, null, { timeout: 20000 }); }, () => { const c = document.getElementById('cielo-panel'); return !!c.style.display && c.style.display !== 'none'; }],
  ['el SOS (ya lo hacia bien)', async p => { await p.tap('#v19-nav-sos'); await p.waitForFunction(() => window.TG_SOS && TG_SOS.estado.abierto, null, { timeout: 20000 }); }, () => !!(window.TG_SOS && TG_SOS.estado.abierto)],
  ['el perfil (ya lo hacia bien)', async p => { await p.tap('#v19-nav-account'); await p.waitForFunction(() => window.TG_PERFIL && document.getElementById('perfil-panel') && !document.getElementById('perfil-panel').hidden, null, { timeout: 20000 }); }, () => { const x = document.getElementById('perfil-panel'); return !!(x && !x.hidden); }],
];

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const ctx = await b.newContext({ viewport: { width: 360, height: 780 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'es-ES',
    serviceWorkers: 'block', geolocation: { latitude: 28.4682, longitude: -16.2546, accuracy: 20 }, permissions: ['geolocation'] });
  await ctx.route('**/*', r => {
    const u = r.request().url();
    if (u.startsWith('http://127.0.0.1:' + PUERTO + '/')) return r.continue();
    if (u.startsWith(ANTES)) return r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: '<!doctype html><title>Antes</title><p>la web de antes</p>' });
    return r.abort();
  });
  await ctx.addInitScript(() => { try {
    localStorage.setItem('tenerife.tour.seen', '99'); localStorage.setItem('tgo_consent', JSON.stringify({ v: 'denied', t: Date.now() }));
    localStorage.setItem('tg_lang', 'es'); localStorage.setItem('tenerife.cuerpo.3d', 'no');
  } catch (e) {} });
  const p = await ctx.newPage();
  const errores = [];
  p.on('pageerror', e => errores.push(e.message));
  p.on('dialog', d => d.dismiss().catch(() => {}));
  const enApp = () => p.url().startsWith(APP);
  /* desde la web de antes a la app, lista para tocar (con un toque ya dado: Chrome no deja que «atras» se salte las
     entradas de una pagina que la persona ha tocado) */
  async function entrar() {
    await p.goto(ANTES, { waitUntil: 'load' });
    await p.goto(APP, { waitUntil: 'load', timeout: 90000 });
    await p.waitForFunction(() => typeof setLang === 'function' && typeof places !== 'undefined' && places.length > 0, null, { timeout: 60000 });
    if (await p.locator('#v19-welcome:not(.hidden)').count()) { await p.tap('#v19-welcome-start').catch(() => {}); await p.waitForTimeout(800); }
    await p.evaluate(() => document.querySelectorAll('.v19-tour, .v19-tour-prompt, .v19-tour-overlay').forEach(e => e.remove()));
    await p.tap('#map', { position: { x: 30, y: 300 } }).catch(() => {});
    await p.waitForTimeout(600);
  }
  const atras = async () => { await p.goBack({ timeout: 6000 }).catch(() => {}); await p.waitForTimeout(900); };

  console.log('\n── «atras» con cada panel abierto ──');
  for (const [nombre, abrir, abierto] of PANELES) {
    try {
      await entrar();
      await abrir(p); await p.waitForTimeout(800);
      const antes = await p.evaluate(abierto);
      await atras();
      const sigue = enApp();
      const cerrado = sigue ? !(await p.evaluate(abierto)) : null;
      ok(antes && sigue && cerrado, nombre + ': «atras» lo cierra y la app sigue', { abierto: antes, sigueEnLaApp: sigue, cerrado });
    } catch (e) { ok(false, nombre + ': la prueba no pudo con el', e.message.split('\n')[0]); }
  }

  console.log('\n── lo que va con el historial ──');
  try {
    /* cerrar con su ✕ (aqui, tocar fuera de la ficha) no deja una entrada muerta */
    await entrar();
    await p.evaluate(() => openDetailSheet('teide')); await p.waitForTimeout(700);
    await p.tap('#detail-overlay', { position: { x: 180, y: 60 } }); await p.waitForTimeout(900);
    const cerrada = await p.evaluate(() => !document.getElementById('detail-sheet').classList.contains('open'));
    await atras();
    ok(cerrada && p.url().startsWith(ANTES), 'la ficha cerrada con el dedo no deja una entrada muerta: el «atras» siguiente sale de la app', { cerrada, url: p.url() });
  } catch (e) { ok(false, 'cerrar con el dedo: la prueba no pudo', e.message.split('\n')[0]); }
  try {
    /* dos paneles: la ficha y, encima, las rutas */
    await entrar();
    await p.evaluate(() => openDetailSheet('teide')); await p.waitForTimeout(600);
    await p.evaluate(() => toggleRoutePanel()); await p.waitForTimeout(700);
    const dos = await p.evaluate(() => ({ f: document.getElementById('detail-sheet').classList.contains('open'), r: document.getElementById('route-panel').classList.contains('open') }));
    await atras();
    const uno = enApp() && await p.evaluate(() => ({ f: document.getElementById('detail-sheet').classList.contains('open'), r: document.getElementById('route-panel').classList.contains('open') }));
    await atras();
    const cero = enApp() && await p.evaluate(() => ({ f: document.getElementById('detail-sheet').classList.contains('open'), r: document.getElementById('route-panel').classList.contains('open') }));
    await atras();
    ok(dos.f && dos.r && uno && uno.f && !uno.r && cero && !cero.f && !cero.r && p.url().startsWith(ANTES),
      'dos paneles (la ficha y las rutas encima): el primer «atras» cierra las rutas, el segundo la ficha, el tercero sale', { dos, uno, cero, url: p.url() });
  } catch (e) { ok(false, 'dos paneles: la prueba no pudo', e.message.split('\n')[0]); }
  try {
    /* un modulo encima de un panel: el perfil sobre la ficha (la ficha tapa la barra de abajo: se abre con su funcion) */
    await entrar();
    await p.evaluate(() => openDetailSheet('teide')); await p.waitForTimeout(600);
    await p.evaluate(() => abrirPerfil()); await p.waitForFunction(() => { const x = document.getElementById('perfil-panel'); return x && !x.hidden; }, null, { timeout: 20000 });
    await p.waitForTimeout(500);
    const est = () => p.evaluate(() => { const x = document.getElementById('perfil-panel'); return { perfil: !!(x && !x.hidden), ficha: document.getElementById('detail-sheet').classList.contains('open') }; });
    const a0 = await est(); await atras(); const a1 = enApp() ? await est() : null; await atras(); const a2 = enApp() ? await est() : null;
    ok(a0.perfil && a0.ficha && a1 && !a1.perfil && a1.ficha && a2 && !a2.ficha, 'el perfil encima de la ficha: el primer «atras» cierra el perfil y deja la ficha; el segundo, la ficha', { a0, a1, a2 });
  } catch (e) { ok(false, 'el perfil encima de la ficha: la prueba no pudo', e.message.split('\n')[0]); }
  try {
    /* un panel encima de un modulo: la cuenta sobre el perfil */
    await entrar();
    await p.tap('#v19-nav-account'); await p.waitForFunction(() => { const x = document.getElementById('perfil-panel'); return x && !x.hidden; }, null, { timeout: 20000 });
    await p.waitForTimeout(400);
    await p.evaluate(() => openAuthModal()); await p.waitForTimeout(600);
    const est = () => p.evaluate(() => { const x = document.getElementById('perfil-panel'); return { perfil: !!(x && !x.hidden), cuenta: document.getElementById('auth-modal-backdrop').classList.contains('show') }; });
    const c0 = await est(); await atras(); const c1 = enApp() ? await est() : null; await atras(); const c2 = enApp() ? await est() : null;
    ok(c0.perfil && c0.cuenta && c1 && c1.perfil && !c1.cuenta && c2 && !c2.perfil && !c2.cuenta, 'la cuenta encima del perfil: el primer «atras» cierra la cuenta y deja el perfil; el segundo, el perfil', { c0, c1, c2 });
  } catch (e) { ok(false, 'la cuenta encima del perfil: la prueba no pudo', e.message.split('\n')[0]); }
  try {
    /* se cierra uno y se abre otro a la vez: la ficha da paso a «Paradas cerca» */
    await entrar();
    await p.evaluate(() => { closeDetailSheet(); openDetailSheet('teide'); }); await p.waitForTimeout(600);
    await p.evaluate(() => { closeDetailSheet(); openNearbyStopsFor(28.27, -16.64, 'Teide'); }); await p.waitForTimeout(700);
    const s0 = await p.evaluate(() => ({ ficha: document.getElementById('detail-sheet').classList.contains('open'), paradas: document.getElementById('nearby-stops-panel').classList.contains('open') }));
    await atras();
    const s1 = enApp() ? await p.evaluate(() => ({ ficha: document.getElementById('detail-sheet').classList.contains('open'), paradas: document.getElementById('nearby-stops-panel').classList.contains('open') })) : null;
    await atras();
    ok(!s0.ficha && s0.paradas && s1 && !s1.ficha && !s1.paradas && p.url().startsWith(ANTES),
      'la ficha que da paso a «Paradas cerca»: un «atras» cierra las paradas, y el siguiente sale de la app (sin entrada muerta)', { s0, s1, url: p.url() });
  } catch (e) { ok(false, 'el paso de un panel a otro: la prueba no pudo', e.message.split('\n')[0]); }
  try {
    /* un modulo que se cierra con su propio «atras» (history.go(-1)) y abre a la vez un panel de aqui: en el SOS, tocar
       un aviso de la AEMET cierra el SOS y deja a la vista el panel de los avisos (20 de noviembre de 2026) */
    await p.route('**/datos/avisos-aemet.json', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(AVISOS) }));
    await entrar();
    await p.waitForFunction(() => typeof wxEstado !== 'undefined' && wxEstado === 'ok', null, { timeout: 8000 }).catch(() => {});
    await p.tap('#v19-nav-sos');
    await p.waitForFunction(() => window.TG_SOS && TG_SOS.estado.abierto && document.querySelectorAll('#sos-aemet .wx-linea-btn').length > 0, null, { timeout: 20000 });
    await p.locator('#sos-aemet .wx-linea-btn').first().tap(); await p.waitForTimeout(1200);
    const estadoSos = () => p.evaluate(() => ({ sos: !!(window.TG_SOS && TG_SOS.estado.abierto), avisos: document.getElementById('wx-panel').style.display === 'block' }));
    const a0 = await estadoSos();
    await atras();
    const a1 = enApp() ? await estadoSos() : null;
    await atras();
    ok(!a0.sos && a0.avisos && a1 && !a1.sos && !a1.avisos && p.url().startsWith(ANTES),
      'en el SOS, un aviso de la AEMET deja a la vista el panel de los avisos; un «atras» lo cierra y el siguiente sale de la app', { a0, a1, url: p.url() });
    await p.unroute('**/datos/avisos-aemet.json');
  } catch (e) { ok(false, 'el SOS y los avisos: la prueba no pudo', e.message.split('\n')[0]); }

  ok(errores.length === 0, 'cero errores de pagina', errores.slice(0, 3).join(' | '));
  console.log('\n' + bien + ' bien, ' + malos + ' mal');
  await b.close();
  process.exit(malos ? 1 : 0);
})().catch(e => { console.error('FALLO', e.message); process.exit(2); });
