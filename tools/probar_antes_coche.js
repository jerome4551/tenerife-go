#!/usr/bin/env node
/* probar_antes_coche.js — «Antes de salir» y «Mi coche y mi posición», de
 * verdad, en Chromium (20 de noviembre de 2026).
 *
 *     python3 -m http.server 8766 &      (desde la raiz del repo)
 *     node tools/probar_antes_coche.js 8766
 *
 * En los once idiomas, cada uno elegido en la bienvenida: la
 * tarjeta del panel de Rutas, «Hoy» y «Reservas», la hoja del coche y «Enviar
 * mi posición»; que nada se sale a 360 y 402 px, que no queda castellano
 * fuera del castellano y que ningun aviso se corta en un ordinal o una
 * abreviatura («Seit dem 1.», «2026 г.», «2026 r.»).
 * En castellano, todo lo que se puede tocar:
 *   · «Antes de salir»: los lugares con su estado, las notas, enlaces https,
 *     el «atras» del movil (cierra y deja el panel de Rutas), dos toques
 *     seguidos en «volver» (un solo «atras»), «Ver en el mapa» y los
 *     enlaces #antes y #antes-reservas;
 *   · «Mi coche»: sin coche no se carga nada al arrancar; «Aparqué aquí»
 *     guarda la posicion, el 🚗 y el punto dorado; «Volver a pie» abre la app
 *     de mapas del movil, a pie (Apple en iPhone, Google en lo demas); la
 *     nota se guarda y sale como texto (con una nota hostil); recien guardado
 *     no dice «A 10 m»; al volver a abrir la app, el coche sigue y dice a
 *     cuanto esta; «Enviar mi posición» (coordenadas, WhatsApp, SMS, copiar);
 *     el «atras», el fondo y Escape cierran; «Borrar» pide dos toques; fuera
 *     de Tenerife no guarda; con poca precision avisa; sin permiso lo dice;
 *     los datos rotos en el dispositivo se descartan y no vuelven a pedir el
 *     modulo; el enlace #coche;
 *   · y el foco: al titulo al abrir, a «Volver a pie» tras guardar, a
 *     «Enviar» tras buscar, a «Aparqué aquí» tras borrar.
 * Sin red: el modulo que no llega (los dos lo dicen y ofrecen reintentar), y
 * con el service worker los dos abren de la cache.
 * Cero errores de pagina. Sale con 1 si algo falla.
 */
'use strict';
let chromium;
try { chromium = require('playwright').chromium; } catch (e) { chromium = require('/opt/node22/lib/node_modules/playwright').chromium; }
const PUERTO = process.argv[2] || '8766';
const BASE = 'http://127.0.0.1:' + PUERTO + '/index.html';
const LANGS = ['es', 'en', 'fr', 'de', 'it', 'nl', 'zh', 'zht', 'bg', 'pl', 'ro'];
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1';
const ANDROID = 'Mozilla/5.0 (Linux; Android 15; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/28.0 Chrome/130.0.0.0 Mobile Safari/537.36';
/* lo que no puede quedar en castellano en otro idioma */
const CASTELLANO = ['Antes de salir', 'Senderos cerrados', 'Avisos oficiales', 'Lugares con aviso', 'Comprobado el', 'Reservar en', 'Ver en el mapa',
  'Mi coche', 'Aparqué aquí', 'Volver a pie', 'Enviar mi posición', 'Buscar mi posición', 'Guardado hoy', 'Se guarda solo en este dispositivo'];
const PLAZA = { latitude: 28.4682, longitude: -16.2546, accuracy: 20 };   /* Plaza de España, Santa Cruz */

let fallos = 0, hechos = 0;
function ok(c, txt, det) { hechos++; if (c) console.log('  OK  ' + txt); else { fallos++; console.log('  MAL ' + txt + (det !== undefined ? '   -> ' + JSON.stringify(det).slice(0, 400) : '')); } }
const espera = ms => new Promise(r => setTimeout(r, ms));

/* lo que se sale por los lados o se corta, dentro de un panel */
const DESBORDE = sel => {
  const w = document.documentElement.clientWidth, malos = [];
  const raiz = document.querySelector(sel); if (!raiz) return ['no esta ' + sel];
  raiz.querySelectorAll('*').forEach(e => {
    if (!e.getClientRects().length || e.closest('.coche-vivo')) return;
    const r = e.getBoundingClientRect();
    if (r.width && (r.right > w + 1 || r.left < -1)) malos.push((e.id || String(e.className) || e.tagName) + ' ' + Math.round(r.left) + '..' + Math.round(r.right));
    const cs = getComputedStyle(e);
    if ((cs.overflowX === 'hidden' || cs.textOverflow === 'ellipsis') && e.clientWidth > 1 && e.scrollWidth > e.clientWidth + 1 && !/scroll/.test(String(e.className)))
      malos.push('cortado ' + (e.id || String(e.className)) + ' ' + e.clientWidth + '<' + e.scrollWidth);
  });
  return malos.slice(0, 4);
};

async function abrirApp(b, L, opc) {
  opc = opc || {};
  const ancho = opc.ancho || 402;
  const ctx = await b.newContext({ viewport: { width: ancho, height: ancho > 380 ? 874 : 780 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2,
    userAgent: opc.ios ? IPHONE : ANDROID, serviceWorkers: opc.sw ? 'allow' : 'block', timezoneId: 'Atlantic/Canary', locale: 'es-ES',
    geolocation: opc.geo || PLAZA, permissions: opc.sinPermiso ? [] : ['geolocation', 'clipboard-read', 'clipboard-write'] });
  const p = await ctx.newPage();
  const errores = []; p.on('pageerror', e => errores.push(e.message));
  await p.addInitScript(([coche]) => {
    try { localStorage.setItem('tenerife.tour.seen', '99'); localStorage.setItem('tgo_consent', JSON.stringify({ v: 'denied', t: Date.now() })); } catch (e) {}
    if (coche) try { localStorage.setItem('tenerife.coche', coche); } catch (e) {}
  }, [opc.coche || null]);
  await p.route('**/*', r => {
    const u = r.request().url();
    if (u.startsWith('http://127.0.0.1:' + PUERTO + '/')) {
      if (opc.cortar && opc.cortar.test(u)) return r.abort('internetdisconnected');
      return r.continue();
    }
    if (/^(data|blob):/.test(u)) return r.continue();
    return r.abort('internetdisconnected');
  });
  await p.goto(BASE + (opc.hash || ''), { waitUntil: 'load' });
  await p.waitForTimeout(700);
  if (!opc.hash && await p.isVisible('#v19-welcome-start')) {
    await p.tap('.v19-w-lang[data-lang="' + L + '"]'); await p.waitForTimeout(200);
    await p.tap('#v19-welcome-start'); await p.waitForTimeout(1800);
  }
  return { ctx, p, errores };
}
const abrirAntesTarjeta = async p => {
  await p.tap('#v19-nav-routes'); await p.waitForTimeout(600);
  await p.tap('#antes-tarjeta');
  await p.waitForFunction(() => window.TG_ANTES && TG_ANTES.estado.abierto, null, { timeout: 8000 });
  await p.waitForTimeout(500);
};
const abrirCoche = async p => {
  await p.tap('#coche-btn');
  await p.waitForFunction(() => window.TG_COCHE && TG_COCHE.estado.abierto, null, { timeout: 8000 });
  await p.waitForTimeout(400);
};
const cocheGuardado = () => JSON.stringify({ v: 1, lat: 28.4682, lng: -16.2546, acc: 12, t: new Date(Date.now() - 3600e3).toISOString(), nota: '' });

(async () => {
  const b = await chromium.launch({ args: ['--no-proxy-server'] });

  /* ── los idiomas ── */
  for (const L of LANGS) {
    console.log('— ' + L);
    const { ctx, p, errores } = await abrirApp(b, L, { coche: cocheGuardado() });
    await p.tap('#v19-nav-routes'); await p.waitForTimeout(600);
    const tarjeta = await p.innerText('#antes-tarjeta');
    ok(tarjeta.includes(await p.evaluate(() => tx('antesTitulo'))), L + ': la tarjeta del panel de Rutas, en su idioma', tarjeta);
    ok(!(await p.evaluate(DESBORDE, '#antes-tarjeta')).length, L + ': la tarjeta cabe', await p.evaluate(DESBORDE, '#antes-tarjeta'));
    await p.tap('#antes-tarjeta');
    await p.waitForFunction(() => window.TG_ANTES && TG_ANTES.estado.abierto, null, { timeout: 8000 }).catch(() => {});
    await p.waitForTimeout(500);
    ok(await p.isVisible('#antes-panel'), L + ': «Antes de salir» se abre');
    const cortadas = await p.evaluate(() => TG_ANTES.grupos().map(g => g.frase).filter(f => f && /(?:^|\s)(?:\d{1,2}|г|r|ca|Ctra)\.$/.test(f)));
    ok(!cortadas.length, L + ': ningun aviso cortado en un ordinal o una abreviatura', cortadas);
    for (const pest of ['hoy', 'reservas']) {
      if (pest === 'reservas') { await p.tap('#antes-pest-reservas'); await p.waitForTimeout(400); }
      for (const ancho of [360, 402]) {
        await p.setViewportSize({ width: ancho, height: 800 });
        const d = await p.evaluate(DESBORDE, '#antes-panel');
        ok(!d.length, L + ': «' + pest + '» cabe a ' + ancho + ' px', d);
      }
      if (L !== 'es') {
        const t = await p.innerText('#antes-panel');
        const quedan = CASTELLANO.filter(f => t.includes(f));
        ok(!quedan.length, L + ': ningun texto castellano en «' + pest + '»', quedan);
      }
    }
    await p.evaluate(() => cerrarAntes()); await p.waitForTimeout(600);
    await p.evaluate(() => closeRoutePanel()); await p.waitForTimeout(300);
    await abrirCoche(p);
    await p.tap('#coche-buscar');
    await p.waitForFunction(() => TG_COCHE.estado.envioEstado === 'ok', null, { timeout: 8000 }).catch(() => {});
    for (const ancho of [360, 402]) {
      await p.setViewportSize({ width: ancho, height: 800 });
      const d = await p.evaluate(DESBORDE, '#coche-panel');
      ok(!d.length, L + ': la hoja del coche cabe a ' + ancho + ' px', d);
    }
    const tc = await p.innerText('#coche-panel');
    ok(tc.includes(await p.evaluate(() => tx('cocheTitulo'))), L + ': la hoja, en su idioma');
    if (L !== 'es') { const quedan = CASTELLANO.filter(f => tc.includes(f)); ok(!quedan.length, L + ': ningun texto castellano en la hoja', quedan); }
    const aria = await p.evaluate(() => [document.getElementById('coche-btn').getAttribute('aria-label'), tx('cocheTitulo')]);
    ok(aria[0] === aria[1], L + ': el boton del mapa se llama como la hoja', aria);
    ok(!errores.length, L + ': sin errores de pagina', errores.slice(0, 3));
    await ctx.close();
  }

  /* ── «Antes de salir», en castellano ── */
  console.log('— «Antes de salir»');
  {
    const { ctx, p, errores } = await abrirApp(b, 'es', { ios: true });
    ok(await p.evaluate(() => !window.TG_ANTES && !window.TG_COCHE), 'sin coche guardado, ningun modulo nuevo se carga al arrancar');
    await abrirAntesTarjeta(p);
    ok(await p.evaluate(() => document.activeElement && document.activeElement.id) === 'antes-titulo', 'al abrir, el foco va al titulo');
    const hoy = await p.evaluate(() => ({ lugares: document.querySelectorAll('#antes-cuerpo .antes-lugar').length, estados: [...document.querySelectorAll('#antes-cuerpo .antes-pildora')].map(e => e.className.replace('antes-pildora ', '')),
      enlaces: [...document.querySelectorAll('#antes-cuerpo a[href]')].map(a => a.href), aemet: !!document.querySelector('#antes-cuerpo .antes-aemet'), alertas: !!document.getElementById('antes-alertas') }));
    ok(hoy.lugares > 0 && hoy.estados.length > 0, '«Hoy»: los lugares cerrados, restringidos o con reserva, con su estado', hoy.estados);
    ok(hoy.aemet && hoy.alertas, '«Hoy»: los avisos de AEMET y las alertas del Gobierno de Canarias');
    ok(hoy.enlaces.length && hoy.enlaces.every(u => /^https:\/\//.test(u)), '«Hoy»: todos los enlaces son https', hoy.enlaces.filter(u => !/^https:/.test(u)));
    await p.tap('#antes-pest-reservas'); await p.waitForTimeout(400);
    const res = await p.evaluate(() => ({ filas: document.querySelectorAll('#antes-cuerpo .antes-res').length, notas: document.querySelectorAll('#antes-cuerpo .antes-notas li').length,
      enlaces: [...document.querySelectorAll('#antes-cuerpo a[href]')].map(a => a.href), conReserva: TG_ANTES.conReserva().length }));
    ok(res.filas > 0 && res.notas === 3, '«Reservas»: los lugares con reserva y las tres notas', res);
    ok(res.enlaces.every(u => /^https:\/\//.test(u)), '«Reservas»: enlaces https', res.enlaces.filter(u => !/^https:/.test(u)));
    await p.goBack(); await p.waitForTimeout(700);
    ok(await p.evaluate(() => document.getElementById('antes-panel').hidden), 'el «atras» del movil cierra «Antes de salir»');
    ok(await p.evaluate(() => document.getElementById('route-panel').classList.contains('open') && location.pathname.endsWith('index.html')), '…y deja el panel de Rutas abierto, sin salir de la app');
    await p.tap('#antes-tarjeta'); await p.waitForTimeout(600);
    await p.evaluate(() => { const x = document.getElementById('antes-cerrar'); x.click(); x.click(); });
    await p.waitForTimeout(900);
    ok(await p.evaluate(() => document.getElementById('antes-panel').hidden && location.pathname.endsWith('index.html')), 'dos toques seguidos en «volver»: un solo «atras»');
    await p.tap('#antes-tarjeta'); await p.waitForTimeout(600);
    const lugar = await p.evaluate(() => { const x = document.querySelector('#antes-cuerpo .antes-lugar'); x.click(); return x.textContent; });
    await p.waitForTimeout(2600);
    const tras = await p.evaluate(() => ({ cerrado: document.getElementById('antes-panel').hidden, rutas: document.getElementById('route-panel').classList.contains('open'), globo: !!document.querySelector('.leaflet-popup') }));
    ok(tras.cerrado && !tras.rutas && tras.globo, '«Ver en el mapa» cierra todo y abre el lugar en el mapa (' + lugar + ')', tras);
    ok(!errores.length, 'sin errores de pagina', errores.slice(0, 3));
    await ctx.close();
    for (const [hash, pest] of [['#antes', 'hoy'], ['#antes-reservas', 'reservas']]) {
      const a = await abrirApp(b, 'es', { hash });
      await a.p.waitForTimeout(1500);
      ok(await a.p.evaluate(pest => !!(window.TG_ANTES && TG_ANTES.estado.abierto && TG_ANTES.estado.pest === pest), pest), 'el enlace ' + hash + ' abre «Antes de salir» en «' + pest + '»');
      await a.ctx.close();
    }
  }

  /* ── «Mi coche y mi posición», en castellano ── */
  for (const ios of [true, false]) {
    console.log('— «Mi coche» (' + (ios ? 'iPhone' : 'Android') + ')');
    const { ctx, p, errores } = await abrirApp(b, 'es', { ios });
    const caja = await p.evaluate(() => { const r = id => { const e = document.getElementById(id); if (!e || e.hidden) return null; const x = e.getBoundingClientRect(); return [Math.round(x.left), Math.round(x.top), Math.round(x.width)]; }; return { coche: r('coche-btn'), isla3d: r('isla3d-btn') }; });
    ok(caja.coche && caja.coche[2] === 38 && (!caja.isla3d || (caja.coche[1] >= caja.isla3d[1] + 44 && caja.coche[0] === caja.isla3d[0])), 'el boton del coche, debajo del «3D» y en su columna', caja);
    await abrirCoche(p);
    ok(await p.evaluate(() => document.activeElement && document.activeElement.id) === 'coche-titulo', 'al abrir, el foco va al titulo de la hoja');
    await p.tap('#coche-guardar');
    await p.waitForFunction(() => !!localStorage.getItem('tenerife.coche'), null, { timeout: 8000 }).catch(() => {});
    await p.waitForTimeout(500);
    const g = await p.evaluate(() => ({ ls: JSON.parse(localStorage.getItem('tenerife.coche') || 'null'), marca: !!document.querySelector('.leaflet-marker-icon.coche-marca'),
      punto: document.getElementById('coche-btn').classList.contains('guardado'), volver: (document.getElementById('coche-volver') || {}).href || '',
      foco: document.activeElement && document.activeElement.id, texto: document.getElementById('coche-cuerpo').innerText }));
    ok(g.ls && Math.abs(g.ls.lat - 28.4682) < 1e-4 && Math.abs(g.ls.lng + 16.2546) < 1e-4 && g.ls.acc === 20, '«Aparqué aquí» guarda la posicion y su precision', g.ls);
    ok(g.marca && g.punto, 'el 🚗 en el mapa y el punto dorado en el boton', g);
    const pie = ios ? 'https://maps.apple.com/?daddr=28.468200,-16.254600&dirflg=w' : 'https://www.google.com/maps/dir/?api=1&destination=28.468200,-16.254600&travelmode=walking';
    ok(g.volver === pie, '«Volver a pie» abre ' + (ios ? 'Mapas de Apple' : 'Google Maps') + ', a pie', g.volver);
    ok(g.foco === 'coche-volver', 'tras guardar, el foco pasa a «Volver a pie»', g.foco);
    /* La una va en singular (txLaUna de index.html: «a la 01:55»; las demás horas, «a las 13:55»). La prueba solo
       aceptaba «a las» y se ponía roja entre la 01:00 y la 01:59 (auditoría del 22-11-2026 a las 01:55). */
    ok(/Guardado hoy a (la 01|las (?!01)\d\d):\d\d/.test(g.texto) && !/en línea recta/.test(g.texto), 'recien guardado: la hora, y no «A 10 m»', g.texto.slice(0, 120));
    if (ios) {
      const una = await p.evaluate(() => [TG_COCHE.t('cocheHoy', { h: '01:30' }), TG_COCHE.t('cocheHoy', { h: '13:30' })]);
      ok(una[0] === 'Guardado hoy a la 01:30' && una[1] === 'Guardado hoy a las 13:30', 'la hora de guardado, con su artículo: «a la 01:30», «a las 13:30»', una);
    }
    await p.tap('#coche-nota');
    await p.keyboard.type('Planta -2 <img src=x onerror=window.PWNED=1> plaza 47');
    await p.evaluate(() => document.activeElement.blur()); await p.waitForTimeout(200);
    const nota = await p.evaluate(() => ({ ls: JSON.parse(localStorage.getItem('tenerife.coche')).nota, pwned: !!window.PWNED, imgs: document.querySelectorAll('#coche-panel img').length }));
    ok(nota.ls === 'Planta -2 <img src=x onerror=window.PWNED=1> plaza 47' && !nota.pwned && !nota.imgs, 'la nota se guarda tal cual y sale como texto', nota);
    await p.tap('#coche-buscar');
    await p.waitForFunction(() => TG_COCHE.estado.envioEstado === 'ok', null, { timeout: 8000 }).catch(() => {});
    const env = await p.evaluate(() => ({ out: (document.querySelector('#coche-cuerpo output') || {}).textContent, share: !!navigator.share,
      wa: (document.getElementById('coche-enviar') || {}).href || '', sms: (document.getElementById('coche-sms') || {}).href || '', foco: document.activeElement && document.activeElement.id }));
    ok(env.out === '28.46820, -16.25460', '«Buscar mi posición»: las coordenadas', env.out);
    ok(env.foco === 'coche-enviar', 'tras buscar, el foco pasa a «Enviar»', env.foco);
    const MSG = 'Estoy aquí: 28.46820, -16.25460 (±20 m)\nhttps://www.google.com/maps/search/?api=1&query=28.46820,-16.25460';
    if (!env.share) {
      ok(decodeURIComponent(env.wa.split('text=')[1] || '') === MSG, 'sin hoja de compartir: WhatsApp con el mensaje y el enlace', env.wa.slice(0, 80));
      ok(decodeURIComponent(env.sms.split('body=')[1] || '') === MSG, '…y SMS con el mismo mensaje', env.sms.slice(0, 60));
    }
    await p.tap('#coche-copiar'); await p.waitForTimeout(300);
    ok(await p.evaluate(async () => { try { return await navigator.clipboard.readText(); } catch (e) { return ''; } }) === MSG, '«Copiar» deja el mensaje en el portapapeles');
    await p.tap('#coche-ver'); await p.waitForTimeout(1000);
    const cen = await p.evaluate(() => { const c = map.getCenter(); return { lat: c.lat, lng: c.lng, z: map.getZoom(), cerrado: document.getElementById('coche-panel').hidden }; });
    ok(cen.cerrado && Math.abs(cen.lat - 28.4682) < 0.002 && cen.z >= 16, '«Ver en el mapa» cierra la hoja y centra el coche', cen);
    /* a unos 310 m, al volver a abrir la app */
    await ctx.setGeolocation({ latitude: 28.4710, longitude: -16.2546, accuracy: 15 });
    await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(800);
    if (await p.isVisible('#v19-welcome-start')) { await p.tap('#v19-welcome-start'); }
    await p.waitForTimeout(3500);
    ok(await p.evaluate(() => !!window.TG_COCHE && !!document.querySelector('.coche-marca') && document.getElementById('coche-btn').classList.contains('guardado')), 'al volver a abrir la app, el coche sigue en el mapa');
    await abrirCoche(p); await p.waitForTimeout(600);
    const re = await p.evaluate(() => ({ nota: (document.getElementById('coche-nota') || {}).value, txt: document.getElementById('coche-cuerpo').innerText }));
    ok(re.nota === nota.ls && /A 3[01]0 m en línea recta/.test(re.txt), 'la nota sigue, y con el permiso ya dado dice a cuanto esta el coche', re.txt.slice(0, 100));
    await p.goBack(); await p.waitForTimeout(700);
    ok(await p.evaluate(() => document.getElementById('coche-panel').hidden && location.pathname.endsWith('index.html')), 'el «atras» del movil cierra la hoja, sin salir de la app');
    await abrirCoche(p);
    await p.mouse.click(20, 80); await p.waitForTimeout(700);
    ok(await p.evaluate(() => document.getElementById('coche-panel').hidden), 'tocar el fondo oscuro cierra la hoja');
    await abrirCoche(p);
    await p.keyboard.press('Escape'); await p.waitForTimeout(700);
    ok(await p.evaluate(() => document.getElementById('coche-panel').hidden), 'Escape cierra la hoja');
    await abrirCoche(p);
    await p.tap('#coche-borrar'); await p.waitForTimeout(200);
    ok(await p.evaluate(() => !!localStorage.getItem('tenerife.coche') && document.getElementById('coche-borrar').textContent === '¿Borrar? Toque otra vez'), 'el primer toque en «Borrar» solo pregunta');
    await p.tap('#coche-borrar'); await p.waitForTimeout(300);
    const bo = await p.evaluate(() => ({ ls: localStorage.getItem('tenerife.coche'), marca: !!document.querySelector('.coche-marca'), punto: document.getElementById('coche-btn').classList.contains('guardado'), foco: document.activeElement && document.activeElement.id }));
    ok(!bo.ls && !bo.marca && !bo.punto && bo.foco === 'coche-guardar', 'el segundo lo borra todo, y el foco vuelve a «Aparqué aquí»', bo);
    await ctx.setGeolocation({ latitude: 40.4168, longitude: -3.7038, accuracy: 15 });
    await p.tap('#coche-guardar'); await p.waitForTimeout(800);
    ok(await p.evaluate(() => !localStorage.getItem('tenerife.coche') && /fuera de Tenerife/.test(document.getElementById('coche-cuerpo').innerText)), 'fuera de Tenerife no se guarda, y lo dice');
    await ctx.setGeolocation({ latitude: 28.0567, longitude: -16.7155, accuracy: 120 });
    await p.tap('#coche-guardar'); await p.waitForTimeout(800);
    ok(await p.evaluate(() => /Precisión baja \(±120 m\)/.test(document.getElementById('coche-cuerpo').innerText)), 'con poca precision, avisa');
    ok(!errores.length, 'sin errores de pagina', errores.slice(0, 3));
    await ctx.close();
  }
  {
    const { ctx, p, errores } = await abrirApp(b, 'es', { sinPermiso: true });
    await abrirCoche(p);
    await p.tap('#coche-guardar'); await p.waitForTimeout(1500);
    ok(await p.evaluate(() => /No se pudo saber dónde está/.test(document.getElementById('coche-cuerpo').innerText) && /No se pudo saber/.test(document.getElementById('coche-vivo').textContent)), 'sin permiso de ubicacion: lo dice (tambien al lector de pantalla)');
    ok(!errores.length, 'sin errores de pagina', errores.slice(0, 3));
    await ctx.close();
  }
  for (const roto of ['esto no es JSON', '{"v":1,"lat":40.4,"lng":-3.7,"acc":10,"t":"2026-11-20T10:00:00Z"}', '{"v":1,"lat":"28.4","lng":-16.2,"acc":10,"t":"2026-11-20T10:00:00Z"}', '{"v":1,"lat":28.4,"lng":-16.2,"acc":10,"t":"nunca"}']) {
    const { ctx, p, errores } = await abrirApp(b, 'es', { coche: roto });
    await p.waitForTimeout(3500);
    ok(await p.evaluate(() => !localStorage.getItem('tenerife.coche') && !document.querySelector('.coche-marca')) && !errores.length, 'un dato roto se descarta sin romper nada: ' + roto.slice(0, 40));
    await ctx.close();
  }
  {
    const a = await abrirApp(b, 'es', { hash: '#coche' });
    await a.p.waitForTimeout(1500);
    ok(await a.p.evaluate(() => !!(window.TG_COCHE && TG_COCHE.estado.abierto)), 'el enlace #coche abre la hoja del coche');
    await a.ctx.close();
  }

  /* ── sin red ── */
  console.log('— sin red');
  {
    const { ctx, p, errores } = await abrirApp(b, 'es', { cortar: /\/modulos\/(antes|micoche)\.js/ });
    await p.tap('#v19-nav-routes'); await p.waitForTimeout(500);
    await p.tap('#antes-tarjeta'); await p.waitForTimeout(1200);
    ok(await p.evaluate(() => /No se pudo abrir esta sección/.test(document.getElementById('antes-cuerpo').innerText) && !!document.querySelector('#antes-cuerpo .antes-estado button')), 'si el modulo no llega, «Antes de salir» lo dice y ofrece reintentar');
    await p.evaluate(() => cerrarAntes()); await p.evaluate(() => closeRoutePanel()); await p.waitForTimeout(300);
    await p.tap('#coche-btn'); await p.waitForTimeout(1200);
    ok(await p.evaluate(() => /No se pudo abrir esta sección/.test(document.getElementById('coche-cuerpo').innerText) && !!document.querySelector('#coche-cuerpo .coche-estado button')), '…y la hoja del coche tambien');
    ok(!errores.length, 'sin errores de pagina', errores.slice(0, 3));
    await ctx.close();
  }
  {
    const { ctx, p, errores } = await abrirApp(b, 'es', { sw: true });
    const listo = await p.evaluate(async () => {
      await navigator.serviceWorker.ready;
      for (let i = 0; i < 80; i++) { if (await caches.match('./modulos/antes.js') && await caches.match('./modulos/micoche.js')) return true; await new Promise(r => setTimeout(r, 250)); }
      return false;
    });
    ok(listo, 'el service worker deja los dos modulos en la cache al instalarse');
    await ctx.setOffline(true);
    await p.reload({ waitUntil: 'domcontentloaded' }); await p.waitForTimeout(1500);
    if (await p.isVisible('#v19-welcome-start')) { await p.tap('#v19-welcome-start'); await p.waitForTimeout(800); }
    await abrirAntesTarjeta(p).catch(() => {});
    ok(await p.evaluate(() => !!(window.TG_ANTES && TG_ANTES.estado.abierto) && document.querySelectorAll('#antes-cuerpo .antes-lugar').length > 0), 'sin red, «Antes de salir» abre de la cache');
    await p.evaluate(() => { cerrarAntes(); closeRoutePanel(); }); await p.waitForTimeout(600);
    await abrirCoche(p).catch(() => {});
    ok(await p.evaluate(() => !!(window.TG_COCHE && TG_COCHE.estado.abierto)), 'sin red, la hoja del coche abre de la cache');
    ok(!errores.length, 'sin errores de pagina', errores.slice(0, 3));
    await ctx.close();
  }

  await b.close();
  console.log('\n' + hechos + ' controles · ' + (fallos ? fallos + ' fallo(s)' : 'EN VERDE'));
  process.exit(fallos ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
