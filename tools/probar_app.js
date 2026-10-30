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
 *   · los dos botones «Activar notificaciones» (el de la cuenta y el de
 *     «Continuar como invitado») y sus mensajes van hidden (WKWebView no
 *     tiene Web Push); en la web, no;
 *   · el asistente contesta con las respuestas de la app (app-06, app-07,
 *     app-27, app-29: faq/fuente/nativo/); en la web, con las suyas;
 *   · Google Analytics: hasta el 30-10-2026, solo en la web; desde entonces
 *     en ninguna parte (Jerome: «Google analítica puedes quitarlo»). En la
 *     app y en la web, sin respuesta guardada y con «aceptado» guardado de
 *     antes: ni aviso de cookies, ni gtag, ni ningun script ni peticion a
 *     Google;
 *   · los datos que cambian a diario se piden PRIMERO a la web viva
 *     (https://tenerifego.app/datos/…): los avisos de
 *     AEMET con dos avisos en la copia viva y ninguno en la de dentro ->
 *     wxDatos trae dos; si la viva no responde (red cortada), da HTTP 500 o
 *     se cuelga mas de 8 s -> la copia de dentro (ninguno, con la fecha del
 *     fichero de app/www/), y tambien si responde 200 con algo que no es
 *     JSON (un portal cautivo); los precios de las gasolineras, igual (y
 *     sin senal de quien llama: el plazo de 8 s es el del propio shim); y
 *     los elementos de los satelites del panel del cielo (modulos/cielo.js):
 *     vivos primero y, sin red, los de dentro;
 *   · la CSP deja esas peticiones (si no las dejara, no llegarian a la
 *     ruta interceptada: eso es lo que se cuenta);
 *   · el mapa detallado: detalleEnServidor() dice null (nada que
 *     descargar) y detalleGuardado() devuelve el fichero que viaja dentro;
 *   · el panel del cielo se abre y calcula (TG_CIELO.ver('noche')), con los
 *     satelites: la app entera sin service worker;
 *   · el enlace de compartir un lugar apunta a la web viva (eso ya lo hacia
 *     el codigo con capacitor://; aqui se comprueba con la marca).
 *
 * LOS DIEZ IDIOMAS, CON LA MARCA: la app arranca en cada idioma de
 *   SUPPORTED_LANGS (la bienvenida), sin service worker y con el boton de
 *   push oculto; el panel del cielo abre «Esta noche» y «Donde ir», y
 *   «Antes de subir al Teide» dice «guardado» en ese idioma; ninguna
 *   peticion al paquete da 404 (si faltara un fichero en app/www/, aqui se
 *   ve); sin errores de pagina.
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
const VIVA = 'https://tenerifego.app/';
const AVISOS = require('./avisos_prueba').ficheros();
const UA_IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const IDIOMAS = ((fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8').match(/SUPPORTED_LANGS\s*=\s*\[([^\]]*)\]/) || [, ''])[1])
  .split(',').map(x => x.trim().replace(/['"]/g, '')).filter(Boolean);

let mal = 0;
const ok = (c, que, detalle) => {
  if (!c) mal++;
  console.log((c ? '  OK   ' : '  MAL  ') + que + (!c && detalle !== undefined ? '\n         ' + String(detalle).slice(0, 300) : ''));
  return c;
};
const espera = ms => new Promise(r => setTimeout(r, ms));

async function pagina(ctx, puerto, extra, idioma) {
  const p = await ctx.newPage();
  const errores = []; p.on('pageerror', e => errores.push(e.message));
  /* lo que el paquete no tiene: un 404 del servidor de app/www/ es un fichero que falta */
  const faltan = []; p.on('response', r => { if (r.status() === 404 && r.url().startsWith('http://127.0.0.1:' + puerto + '/')) faltan.push(r.url().slice(('http://127.0.0.1:' + puerto + '/').length)); });
  await p.addInitScript(() => { try { localStorage.setItem('tenerife.tour.seen', '99'); localStorage.setItem('tgo_consent', JSON.stringify({ v: 'denied', t: Date.now() })); } catch (e) {} });
  await p.route('**/router.project-osrm.org/**', r => r.abort());
  await p.route('**/nominatim.openstreetmap.org/**', r => r.abort());
  if (extra) await extra(p);
  await p.goto('http://127.0.0.1:' + puerto + '/index.html', { waitUntil: 'networkidle' });
  await p.waitForTimeout(500);
  await p.click('.v19-w-lang[data-lang="' + (idioma || 'es') + '"]'); await p.waitForTimeout(200);
  await p.click('#v19-welcome-start'); await p.waitForTimeout(2500);
  return { p, errores, faltan };
}

(async () => {
  /* app/www/ montado hoy (--comprobar: monta y coteja, y NO reescribe las
     plantillas versionadas; si estan desfasadas, para aqui), y servido aparte */
  const prep = require('child_process').spawnSync('node', [path.join(RAIZ, 'tools', 'app_preparar.js'), '--comprobar'], { encoding: 'utf8' });
  ok(prep.status === 0 && fs.existsSync(path.join(WWW, 'index.html')), 'app/www/ montado y cotejado con tools/app_preparar.js --comprobar', (prep.stdout + prep.stderr).split('\n').filter(l => /MAL|\*\*\*/.test(l)).join(' | '));
  const srv = spawn('python3', ['-m', 'http.server', String(PUERTO_APP), '--bind', '127.0.0.1'], { cwd: WWW, stdio: 'ignore' });
  await espera(1500);
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-proxy-server'] });
  try {
    const vivos = [];   // lo que se pide a la web viva
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, userAgent: UA_IPHONE, hasTouch: true,
      geolocation: { latitude: 28.4636, longitude: -16.2518 }, permissions: ['geolocation'] });
    const dentro = JSON.parse(fs.readFileSync(path.join(WWW, 'datos', 'avisos-aemet.json'), 'utf8'));
    const satDentro = JSON.parse(fs.readFileSync(path.join(WWW, 'datos', 'satelites.json'), 'utf8'));
    const satVivo = Object.assign({}, satDentro, { fuente: 'COPIA VIVA DE PRUEBA' });
    let modo = 'vivo';   // vivo | corte | error500 | cuelgue | basura (200 con un cuerpo que no es JSON)
    const rutaViva = async r => {
      const u = r.request().url();
      vivos.push(u.slice(VIVA.length));
      if (modo === 'corte') return r.abort('failed');
      if (modo === 'error500') return r.fulfill({ status: 500, body: 'no' });
      if (modo === 'basura') return r.fulfill({ status: 200, contentType: 'application/json', body: '<html>portal cautivo</html>' });
      if (modo === 'cuelgue') { await espera(9500); return r.abort('timedout'); }
      if (/avisos-aemet\.json$/.test(u)) return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(AVISOS.conAvisos) });
      if (/satelites\.json$/.test(u)) return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(satVivo) });
      if (/precios-gasolineras\.json$/.test(u)) return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(Object.assign(JSON.parse(fs.readFileSync(path.join(WWW, 'datos', 'precios-gasolineras.json'), 'utf8')), { franja: 'COPIA VIVA DE PRUEBA' })) });
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
    /* los dos botones (21-10-2026): el de la cuenta y el de «Continuar como
       invitado», cada uno con su mensaje (PUSH_BOTONES en index.html) */
    const push = await p.evaluate(() => [['auth-push-btn', 'auth-push-msg'], ['auth-push-btn-invitado', 'auth-push-msg-invitado']].map(([bi, mi]) => { const b = document.getElementById(bi), m = document.getElementById(mi); return [bi, b ? b.hidden : 'no esta', m ? m.hidden : 'no esta']; }));
    ok(push.every(x => x[1] === true && x[2] === true), '«Activar notificaciones» (con cuenta y sin ella) y sus mensajes van hidden (WKWebView no tiene Web Push)', JSON.stringify(push));
    /* el asistente (21-10-2026): en la app, las respuestas de faq/fuente/nativo/,
       que no mandan a instalar desde el navegador ni prometen avisos */
    const nativasDe = async (pg, raiz) => {
      await pg.waitForFunction(() => typeof TG_FAQ !== 'undefined' && TG_FAQ.entradas().length > 0, null, { timeout: 15000 });
      const lang = await pg.evaluate(() => currentLang);
      const filas = JSON.parse(fs.readFileSync(path.join(raiz, 'faq', lang + '.json'), 'utf8')).e.filter(e => e.n);
      const dadas = await pg.evaluate(ids => ids.map(id => (TG_FAQ.entradas().find(e => e.id === id) || {}).answer), filas.map(e => e.id));
      return { lang, filas, dadas };
    };
    const fa = await nativasDe(p, WWW);
    ok(fa.filas.length === 4 && fa.dadas.every((a, i) => a === fa.filas[i].n),
       'el asistente da la respuesta de la app en ' + fa.filas.map(e => e.id).join(', ') + ' (' + fa.lang + '): nada de instalar desde el navegador, ni de avisos, ni de estadisticas', JSON.stringify(fa.dadas.map(a => String(a).slice(0, 50))));
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
    modo = 'basura';
    await p.evaluate(() => fetchWxAlerts());
    wx = await p.evaluate(() => ({ n: wxDatos && wxDatos.avisos.length, c: wxDatos && wxDatos.consultado }));
    ok(wx.n === dentro.avisos.length && wx.c === dentro.consultado, 'la viva responde 200 con algo que no es JSON (un portal cautivo): la copia de dentro', JSON.stringify(wx));
    modo = 'vivo';

    /* los precios de las gasolineras: sin senal de quien llama, asi que el
       plazo de 8 s lo pone el propio shim. La copia viva de prueba lleva
       otra franja, para saber cual se ha aplicado. */
    const preciosDentro = JSON.parse(fs.readFileSync(path.join(WWW, 'datos', 'precios-gasolineras.json'), 'utf8'));
    const franjaDe = () => p.evaluate(() => PRECIOS_GAS.datos && PRECIOS_GAS.datos.franja);
    vivos.length = 0;
    await p.evaluate(() => cargarPreciosGas());
    await p.waitForTimeout(800);
    ok(vivos.includes('datos/precios-gasolineras.json') && (await franjaDe()) === 'COPIA VIVA DE PRUEBA', 'los precios de las gasolineras se piden a la web viva primero (la franja de la copia viva)', vivos.join(',') + ' ' + (await franjaDe()));
    for (const m of ['corte', 'error500', 'basura']) {
      modo = m;
      await p.evaluate(() => { PRECIOS_GAS.datos = null; cargarPreciosGas(); });
      await p.waitForTimeout(800);
      ok((await franjaDe()) === preciosDentro.franja, 'precios, la viva en ' + m + ': la copia de dentro (franja ' + preciosDentro.franja + ')', String(await franjaDe()));
    }
    modo = 'cuelgue';
    const t1 = Date.now();
    await p.evaluate(() => { PRECIOS_GAS.datos = null; return new Promise(res => { cargarPreciosGas(); const i = setInterval(() => { if (PRECIOS_GAS.datos) { clearInterval(i); res(); } }, 100); setTimeout(() => { clearInterval(i); res(); }, 15000); }); });
    const tardo2 = Date.now() - t1;
    ok((await franjaDe()) === preciosDentro.franja && tardo2 >= 7500 && tardo2 < 12000, 'precios, la viva colgada: a los 8 s del temporizador propio del shim, la copia de dentro (tardo ' + (tardo2 / 1000).toFixed(1) + ' s)', (await franjaDe()) + ' ' + tardo2);
    modo = 'vivo';

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
    ok(/https:\/\/tenerifego\.app\/#lugar=/.test(enlace) && !/127\.0\.0\.1/.test(enlace), 'el enlace de compartir un lugar apunta a la web viva, no al origen de la app', enlace);
    ok(errores.length === 0, 'sin errores de pagina al final', errores.join(' | '));
    await p.close();

    /* la copia de dentro de los satelites, sin red hacia fuera (otra pagina: el modulo guarda los elementos una vez) */
    modo = 'corte';
    const { p: p2, errores: e2 } = await pagina(ctx, PUERTO_APP, async p => { await p.route(VIVA + '**', rutaViva); });
    const sat2 = await p2.evaluate(async () => { await window.TG_CIELO_CARGAR(); await TG_CIELO.cargar(); const d = await TG_CIELO.satelites(); return d && d.fuente; });
    ok(sat2 === satDentro.fuente, 'sin red hacia fuera, los elementos de los satelites son los de dentro', sat2);
    ok(e2.length === 0, 'sin errores de pagina', e2.join(' | '));
    await p2.close();

    /* Google Analytics: desde el 30-10-2026 no hay, ni en la app ni en la
       web. Paginas SIN respuesta guardada al aviso de cookies que hubo, y
       con «aceptado» guardado de antes (quien lo acepto cuando lo habia):
       ni aviso, ni gtag, ni nada hacia Google. Lo que se pida a Google se
       apunta y se corta. */
    const google = [];
    const sinAviso = async (cx, puerto, guardado) => {
      const pg = await cx.newPage();
      const errs = []; pg.on('pageerror', e => errs.push(e.message));
      await pg.route(/googletagmanager\.com|google-analytics\.com/, r => { google.push(r.request().url()); return r.abort(); });
      await pg.route(VIVA + '**', r => r.abort());
      await pg.route('**/router.project-osrm.org/**', r => r.abort());
      await pg.route('**/nominatim.openstreetmap.org/**', r => r.abort());
      /* el contexto comparte localStorage con las paginas de antes, que
         guardaron «rechazado»: sin `guardado`, se borra antes de que corra nada */
      await pg.addInitScript(v => { try { if (v) localStorage.setItem('tgo_consent', JSON.stringify({ v: v, t: Date.now() })); else localStorage.removeItem('tgo_consent'); } catch (e) {} }, guardado || '');
      /* quien acepto antes tiene ademas las cookies de Google Analytics */
      if (guardado) await cx.addCookies(['_ga', '_ga_5Q3G5RW067'].map(n => ({ name: n, value: 'GA1.1.1.1', url: 'http://127.0.0.1:' + puerto })));
      await pg.goto('http://127.0.0.1:' + puerto + '/index.html', { waitUntil: 'networkidle' });
      await pg.waitForTimeout(800);
      return { pg, errs };
    };
    const sinGa = pg => pg.evaluate(() => ({ aviso: !!document.getElementById('consent-banner'), gtag: typeof window.gtag, capa: (window.dataLayer || []).length,
      scripts: [...document.scripts].filter(s => /googletagmanager|google-analytics/.test(s.src)).length,
      respuesta: localStorage.getItem('tgo_consent'), cookies: document.cookie.split(';').map(c => c.split('=')[0].trim()).filter(n => /^_ga/.test(n)) }));
    const limpio = x => !x.aviso && x.gtag === 'undefined' && x.capa === 0 && x.scripts === 0 && x.respuesta === null && x.cookies.length === 0;
    const n1 = await sinAviso(ctx, PUERTO_APP, null);
    const ga1 = await sinGa(n1.pg);
    ok(limpio(ga1) && google.length === 0, 'sin Google Analytics en la app: ni aviso de cookies, ni gtag, ni ningun script, ni nada hacia Google', JSON.stringify([ga1, google]));
    ok(n1.errs.length === 0, 'sin errores de pagina', n1.errs.join(' | '));
    await n1.pg.close();
    const n2 = await sinAviso(ctx, PUERTO_APP, 'granted');
    const ga2 = await sinGa(n2.pg);
    ok(limpio(ga2) && google.length === 0, 'con «aceptado» guardado de antes y sus cookies (_ga, _ga_…): nada hacia Google, y la respuesta y las cookies se borran al abrir', JSON.stringify([ga2, google]));
    await n2.pg.close();
    await ctx.close();

    console.log('=== los diez idiomas, con la marca ===');
    modo = 'corte';   // sin red hacia fuera: todo lo que se ve tiene que salir del paquete
    const ctx3 = await browser.newContext({ viewport: { width: 390, height: 844 }, userAgent: UA_IPHONE, hasTouch: true,
      geolocation: { latitude: 28.4636, longitude: -16.2518 }, permissions: ['geolocation'] });
    for (const L of IDIOMAS) {
      const { p: q, errores: eq, faltan } = await pagina(ctx3, PUERTO_APP, async p => { await p.route(VIVA + '**', rutaViva); }, L);
      const r = await q.evaluate(async () => {
        const regs = navigator.serviceWorker ? await navigator.serviceWorker.getRegistrations().then(x => x.length) : -1;
        const b = document.getElementById('auth-push-btn');
        await window.TG_CIELO_CARGAR(); await TG_CIELO.cargar(); await TG_CIELO.satelites().catch(function () {});
        await TG_CIELO.ver('noche', '2026-12-13'); await new Promise(r => setTimeout(r, 500));
        const tarjetas = document.querySelectorAll('#cielo-panel .cielo-tarjeta').length;
        await TG_CIELO.ver('donde', '2026-12-13'); await new Promise(r => setTimeout(r, 700));
        const e = document.querySelector('#cielo-panel .cielo-offline');
        return { nativo: window.TGO_NATIVO === true, regs, push: b && b.hidden, tarjetas, teide: e ? [e.className, e.textContent.slice(0, 40)] : null, lang: document.documentElement.lang };
      });
      ok(r.nativo && r.regs === 0 && r.push === true && r.tarjetas > 3 && r.teide && /cielo-offline-ok/.test(r.teide[0]) && /^✓ /.test(r.teide[1]) && faltan.length === 0 && eq.length === 0,
         L + ': arranca con la marca, sin service worker, push oculto, «Esta noche» (' + r.tarjetas + ' tarjetas) y «Antes de subir al Teide» guardado («' + (r.teide ? r.teide[1].slice(2, 30) : '') + '…»), sin 404 ni errores',
         JSON.stringify({ r, faltan: faltan.slice(0, 5), errores: eq.slice(0, 3) }));
      await q.close();
    }
    await ctx3.close();
    modo = 'vivo';

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
    const pushW = await w.evaluate(() => ['auth-push-btn', 'auth-push-btn-invitado'].map(i => { const b = document.getElementById(i); return b ? b.hidden : 'no esta'; }));
    ok(pushW.every(x => x === false), '«Activar notificaciones» (con cuenta y sin ella) no va hidden', JSON.stringify(pushW));
    const fw = await nativasDe(w, RAIZ);
    ok(fw.filas.length === 4 && fw.dadas.every((a, i) => a === fw.filas[i].a), 'el asistente da la respuesta de la web en ' + fw.filas.map(e => e.id).join(', ') + ' (' + fw.lang + ')', JSON.stringify(fw.dadas.map(a => String(a).slice(0, 50))));
    const propios = [];
    w.on('request', r => { if (/avisos-aemet\.json/.test(r.url())) propios.push(r.url()); });
    await w.evaluate(() => fetchWxAlerts());
    ok(propios.length === 1 && propios[0].startsWith('http://127.0.0.1:' + PUERTO + '/') && fuera.length === 0,
       'los avisos se piden al propio origen y a ningun otro sitio', JSON.stringify([propios, fuera]));
    ok(ew.length === 0, 'sin errores de pagina', ew.join(' | '));
    /* y en la web, igual: desde el 30-10-2026 tampoco hay Google Analytics */
    const w1 = await sinAviso(ctx2, PUERTO, null);
    const gw = await sinGa(w1.pg);
    ok(limpio(gw) && google.length === 0, 'sin Google Analytics en la web: ni aviso de cookies, ni gtag, ni nada hacia Google', JSON.stringify([gw, google]));
    ok(w1.errs.length === 0, 'sin errores de pagina', w1.errs.join(' | '));
    await w1.pg.close();
    const w2 = await sinAviso(ctx2, PUERTO, 'granted');
    const gw2 = await sinGa(w2.pg);
    ok(limpio(gw2) && google.length === 0, 'en la web, con «aceptado» guardado de antes y sus cookies: nada hacia Google, y se borran al abrir', JSON.stringify([gw2, google]));
    await w2.pg.close();
    await ctx2.close();
  } finally {
    await browser.close();
    srv.kill();
  }
  console.log(mal ? '\n*** ' + mal + ' control(es) en rojo ***' : '\n  todo en verde');
  process.exit(mal ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
