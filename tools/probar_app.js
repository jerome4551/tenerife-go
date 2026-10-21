#!/usr/bin/env node
/* probar_app.js — la app para las tiendas (app/www/, con la marca TGO_NATIVO)
 * en un navegador de verdad. Desde el 21 de octubre de 2026 («P4»).
 *
 * Aqui no hay Mac ni Xcode: lo que SI se puede comprobar es que index.html,
 * con la unica linea que la app anade (window.TGO_NATIVO = true), se
 * comporta como tiene que comportarse dentro de WKWebView, y que sin esa
 * linea (la web) todo sigue igual que antes. Se sirve app/www/ en otro
 * puerto (el montado por app_preparar.js) y la raiz en el de auditar.sh.
 *
 * CON LA MARCA (app/www/)
 *   · window.TGO_NATIVO es true; no hay service worker registrado tras la
 *     carga (navigator.serviceWorker.getRegistrations() vacio);
 *   · con el User-Agent de un iPhone, pasados los 4 s el banner de instalar
 *     NO sale (en la web, con el mismo UA, sale: control);
 *   · el boton flotante de la PWA (.pwa-fab) no se ensena;
 *   · el boton «Activar notificaciones» y su mensaje van hidden (WKWebView
 *     no tiene Web Push); en la web, no;
 *   · los datos que cambian a diario se piden PRIMERO a la web viva
 *     (https://jerome4551.github.io/tenerife-go/datos/…): los avisos de
 *     AEMET con dos avisos en la copia viva y ninguno en la de dentro ->
 *     wxDatos trae dos; si la viva no responde (red cortada), da HTTP 500 o
 *     se cuelga mas de 8 s -> la copia de dentro (ninguno, con la fecha del
 *     fichero de app/www/); los precios de las gasolineras, igual; y los
 *     elementos de los satelites del panel del cielo (modulos/cielo.js),
 *     igual: vivos primero y, sin red, los de dentro;
 *   · la CSP deja esas peticiones (si no las dejara, no llegarian a la
 *     ruta interceptada: eso es lo que se cuenta);
 *   · el mapa detallado: detalleEnServidor() dice null (nada que
 *     descargar) y detalleGuardado() devuelve el fichero que viaja dentro;
 *   · el panel del cielo se abre y calcula (TG_CIELO.ver('noche')), con los
 *     satelites: la app entera sin service worker;
 *   · el enlace de compartir un lugar apunta a la web viva (eso ya lo hacia
 *     el codigo con capacitor://; aqui se comprueba con la marca).
 *
 * SIN LA MARCA (la raiz, la web): TGO_NATIVO es false, el banner sale con el
 * UA de iPhone, el boton de push esta a la vista, los avisos se piden a
 * datos/avisos-aemet.json del propio origen y a ningun otro sitio.
 *
 *     node tools/probar_app.js 8766           (auditar.sh; app/www/ en el 8766+1)
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const RAIZ = path.join(__dirname, '..');
const PUERTO = Number(process.argv[2] || 8766);
const PUERTO_APP = PUERTO + 1;
const WWW = path.join(RAIZ, 'app', 'www');
const VIVA = 'https://jerome4551.github.io/tenerife-go/';
const AVISOS = require('./avisos_prueba').ficheros();
const UA_IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';

let mal = 0;
const ok = (c, que, detalle) => {
  if (!c) mal++;
  console.log((c ? '  OK   ' : '  MAL  ') + que + (!c && detalle !== undefined ? '\n         ' + String(detalle).slice(0, 300) : ''));
  return c;
};
const espera = ms => new Promise(r => setTimeout(r, ms));

async function pagina(ctx, puerto, extra) {
  const p = await ctx.newPage();
  const errores = []; p.on('pageerror', e => errores.push(e.message));
  await p.addInitScript(() => { try { localStorage.setItem('tenerife.tour.seen', '99'); localStorage.setItem('tgo_consent', JSON.stringify({ v: 'denied', t: Date.now() })); } catch (e) {} });
  await p.route('**/router.project-osrm.org/**', r => r.abort());
  await p.route('**/nominatim.openstreetmap.org/**', r => r.abort());
  if (extra) await extra(p);
  await p.goto('http://127.0.0.1:' + puerto + '/index.html', { waitUntil: 'networkidle' });
  await p.waitForTimeout(500);
  await p.click('.v19-w-lang[data-lang="es"]'); await p.waitForTimeout(200);
  await p.click('#v19-welcome-start'); await p.waitForTimeout(2500);
  return { p, errores };
}

(async () => {
  /* app/www/ montado hoy, y servido aparte */
  const prep = require('child_process').spawnSync('node', [path.join(RAIZ, 'tools', 'app_preparar.js')], { encoding: 'utf8' });
  ok(prep.status === 0 && fs.existsSync(path.join(WWW, 'index.html')), 'app/www/ montado con tools/app_preparar.js', prep.stdout + prep.stderr);
  const srv = spawn('python3', ['-m', 'http.server', String(PUERTO_APP), '--bind', '127.0.0.1'], { cwd: WWW, stdio: 'ignore' });
  await espera(1500);
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-proxy-server'] });
  try {
    const vivos = [];   // lo que se pide a la web viva
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, userAgent: UA_IPHONE, hasTouch: true,
      geolocation: { latitude: 28.4636, longitude: -16.2518 }, permissions: ['geolocation'] });
    const dentro = JSON.parse(fs.readFileSync(path.join(WWW, 'datos', 'avisos-aemet.json'), 'utf8'));
    const satDentro = JSON.parse(fs.readFileSync(path.join(WWW, 'datos', 'satelites.json'), 'utf8'));
    const satVivo = Object.assign({}, satDentro, { fuente: 'COPIA VIVA DE PRUEBA' });
    let modo = 'vivo';   // vivo | corte | error500 | cuelgue
    const rutaViva = async r => {
      const u = r.request().url();
      vivos.push(u.slice(VIVA.length));
      if (modo === 'corte') return r.abort('failed');
      if (modo === 'error500') return r.fulfill({ status: 500, body: 'no' });
      if (modo === 'cuelgue') { await espera(9500); return r.abort('timedout'); }
      if (/avisos-aemet\.json$/.test(u)) return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(AVISOS.conAvisos) });
      if (/satelites\.json$/.test(u)) return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(satVivo) });
      if (/precios-gasolineras\.json$/.test(u)) return r.fulfill({ status: 200, contentType: 'application/json', body: fs.readFileSync(path.join(WWW, 'datos', 'precios-gasolineras.json')) });
      return r.fulfill({ status: 404, body: '' });
    };
    const { p, errores } = await pagina(ctx, PUERTO_APP, async p => { await p.route(VIVA + '**', rutaViva); });

    console.log('=== con la marca (app/www/): lo que la app de las tiendas hace distinto ===');
    ok(await p.evaluate(() => window.TGO_NATIVO === true), 'window.TGO_NATIVO es true');
    const regs = await p.evaluate(() => navigator.serviceWorker ? navigator.serviceWorker.getRegistrations().then(r => r.length) : -1);
    ok(regs === 0, 'ningun service worker registrado tras la carga (' + regs + ')');
    await p.waitForTimeout(4500);
    ok(!(await p.$('.pwa-install-banner.show')), 'con User-Agent de iPhone, pasados 4 s no sale el banner de instalar');
    ok(!(await p.$('.pwa-fab.visible')), 'el boton flotante de la PWA no se ensena');
    const push = await p.evaluate(() => { const b = document.getElementById('auth-push-btn'), m = document.getElementById('auth-push-msg'); return [b && b.hidden, m && m.hidden]; });
    ok(push[0] === true && push[1] === true, '«Activar notificaciones» y su mensaje van hidden (WKWebView no tiene Web Push)');
    ok(errores.length === 0, 'sin errores de pagina', errores.join(' | '));

    /* los avisos de AEMET: vivos primero */
    vivos.length = 0;
    await p.evaluate(() => fetchWxAlerts());
    let wx = await p.evaluate(() => ({ n: wxDatos && wxDatos.avisos.length, c: wxDatos && wxDatos.consultado, e: wxEstado }));
    ok(vivos.includes('datos/avisos-aemet.json') && wx.n === 2, 'los avisos de AEMET se piden a la web viva primero: dos avisos de la copia viva (la de dentro no trae ninguno)', JSON.stringify([vivos, wx]));
    ok(/^datos\//.test(vivos[0] || ''), 'y la peticion viva es a ' + VIVA + 'datos/… (la CSP la deja pasar)', vivos.join(','));
    modo = 'corte';
    await p.evaluate(() => fetchWxAlerts());
    wx = await p.evaluate(() => ({ n: wxDatos && wxDatos.avisos.length, c: wxDatos && wxDatos.consultado }));
    ok(wx.n === dentro.avisos.length && wx.c === dentro.consultado, 'sin red hacia fuera: la copia de dentro (' + dentro.avisos.length + ' avisos, consultado ' + dentro.consultado + ')', JSON.stringify(wx));
    modo = 'vivo'; await p.evaluate(() => fetchWxAlerts());
    modo = 'error500';
    await p.evaluate(() => fetchWxAlerts());
    wx = await p.evaluate(() => ({ n: wxDatos && wxDatos.avisos.length, c: wxDatos && wxDatos.consultado }));
    ok(wx.n === dentro.avisos.length && wx.c === dentro.consultado, 'la viva responde HTTP 500: la copia de dentro', JSON.stringify(wx));
    modo = 'vivo'; await p.evaluate(() => fetchWxAlerts());
    modo = 'cuelgue';
    const t0 = Date.now();
    await p.evaluate(() => fetchWxAlerts());
    const tardo = Date.now() - t0;
    wx = await p.evaluate(() => ({ n: wxDatos && wxDatos.avisos.length, c: wxDatos && wxDatos.consultado }));
    ok(wx.n === dentro.avisos.length && wx.c === dentro.consultado && tardo >= 7500 && tardo < 12000,
       'la viva se cuelga: a los 8 s, la copia de dentro (tardo ' + (tardo / 1000).toFixed(1) + ' s)', JSON.stringify(wx));
    modo = 'vivo';

    /* los precios de las gasolineras */
    vivos.length = 0;
    await p.evaluate(() => cargarPreciosGas());
    await p.waitForTimeout(800);
    ok(vivos.includes('datos/precios-gasolineras.json'), 'los precios de las gasolineras se piden a la web viva primero', vivos.join(','));

    /* el mapa detallado */
    const det = await p.evaluate(async () => [await detalleEnServidor(), await detalleGuardado().then(b => b && b.size)]);
    ok(det[0] === null && det[1] > 1000000, 'el mapa detallado: nada que descargar (null) y el fichero de dentro como guardado (' + det[1] + ' bytes)', JSON.stringify(det));

    /* el panel del cielo, con los satelites vivos */
    vivos.length = 0;
    const cielo = await p.evaluate(async () => {
      await window.TG_CIELO_CARGAR(); await TG_CIELO.cargar();
      const d = await TG_CIELO.satelites();
      await TG_CIELO.ver('noche', '2026-12-13'); await new Promise(r => setTimeout(r, 400));
      return { fuente: d && d.fuente, tarjetas: document.querySelectorAll('#cielo-panel .cielo-tarjeta').length };
    });
    ok(vivos.includes('datos/satelites.json') && cielo.fuente === 'COPIA VIVA DE PRUEBA' && cielo.tarjetas > 3,
       'el panel del cielo abre y calcula sin service worker, y los elementos de los satelites vienen de la copia viva (' + cielo.tarjetas + ' tarjetas)', JSON.stringify([vivos, cielo]));
    /* «Antes de subir al Teide» (Donde ir): dentro de la app los seis ficheros viajan en el paquete, asi que dice «guardado» sin cache ni service worker */
    const teide = await p.evaluate(async () => {
      await TG_CIELO.ver('donde', '2026-12-13'); await new Promise(r => setTimeout(r, 700));
      const e = document.querySelector('#cielo-panel .cielo-offline'); return e ? [e.className, e.textContent.slice(0, 60), await TG_CIELO.cacheListo()] : null;
    });
    ok(teide && /cielo-offline-ok/.test(teide[0]) && /^✓ /.test(teide[1]) && teide[2] === true, '«Antes de subir al Teide» dice «guardado en el movil» (todo viaja dentro; cacheListo() true sin cache)', JSON.stringify(teide));
    /* el enlace de compartir */
    const enlace = await p.evaluate(() => JSON.stringify(buildShareData(places[0])));
    ok(/https:\/\/jerome4551\.github\.io\/tenerife-go\/#lugar=/.test(enlace) && !/127\.0\.0\.1/.test(enlace), 'el enlace de compartir un lugar apunta a la web viva, no al origen de la app', enlace);
    ok(errores.length === 0, 'sin errores de pagina al final', errores.join(' | '));
    await p.close();

    /* la copia de dentro de los satelites, sin red hacia fuera (otra pagina: el modulo guarda los elementos una vez) */
    modo = 'corte';
    const { p: p2, errores: e2 } = await pagina(ctx, PUERTO_APP, async p => { await p.route(VIVA + '**', rutaViva); });
    const sat2 = await p2.evaluate(async () => { await window.TG_CIELO_CARGAR(); await TG_CIELO.cargar(); const d = await TG_CIELO.satelites(); return d && d.fuente; });
    ok(sat2 === satDentro.fuente, 'sin red hacia fuera, los elementos de los satelites son los de dentro', sat2);
    ok(e2.length === 0, 'sin errores de pagina', e2.join(' | '));
    await p2.close();
    await ctx.close();

    console.log('=== sin la marca (la raiz, la web): nada cambia ===');
    const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 }, userAgent: UA_IPHONE, hasTouch: true, serviceWorkers: 'block',
      geolocation: { latitude: 28.4636, longitude: -16.2518 }, permissions: ['geolocation'] });
    const fuera = [];
    const { p: w, errores: ew } = await pagina(ctx2, PUERTO, async p => {
      await p.route(VIVA + '**', r => { fuera.push(r.request().url()); return r.abort(); });
    });
    ok(await w.evaluate(() => window.TGO_NATIVO === false), 'window.TGO_NATIVO es false');
    await w.waitForTimeout(4500);
    ok(!!(await w.$('.pwa-install-banner.show')), 'con User-Agent de iPhone, el banner de instalar sale a los 4 s (control)');
    const pushW = await w.evaluate(() => { const b = document.getElementById('auth-push-btn'); return b && b.hidden; });
    ok(pushW === false, '«Activar notificaciones» no va hidden');
    const propios = [];
    w.on('request', r => { if (/avisos-aemet\.json/.test(r.url())) propios.push(r.url()); });
    await w.evaluate(() => fetchWxAlerts());
    ok(propios.length === 1 && propios[0].startsWith('http://127.0.0.1:' + PUERTO + '/') && fuera.length === 0,
       'los avisos se piden al propio origen y a ningun otro sitio', JSON.stringify([propios, fuera]));
    ok(ew.length === 0, 'sin errores de pagina', ew.join(' | '));
    await ctx2.close();
  } finally {
    await browser.close();
    srv.kill();
  }
  console.log(mal ? '\n*** ' + mal + ' control(es) en rojo ***' : '\n  todo en verde');
  process.exit(mal ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
