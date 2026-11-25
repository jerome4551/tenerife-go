#!/usr/bin/env node
/* probar_pase.js — el «Pase de viaje», de verdad, en Chromium (21 de noviembre de 2026).
 *
 *     python3 -m http.server 8766 &      (desde la raiz del repo)
 *     node tools/probar_pase.js 8766
 *
 * Las tablas: los textos de modulos/pase.js y modulos/horizonte.js, en los once idiomas, sin
 * huecos, con las mismas {marcas} que el castellano y sin nada igual al castellano salvo nombres
 * propios y unidades (IGUALES); la declinacion, la de datos/cielo.json; las cimas de las otras
 * islas, las de las reseñas del IGN; las paradas de las rutas, lugares de la app con descripcion;
 * los sitios de la busqueda del tesoro, a mas de 150 m unos de otros; la costa del mapa pequeño,
 * sobre la costa del relieve.
 * En los once idiomas, cada uno elegido en la bienvenida: la tarjeta del pasaporte, el «Pase», las rutas, una
 * ruta, la busqueda y «¿Qué estoy viendo?»; que nada se sale a 360 y 402 px y que no queda
 * castellano fuera del castellano.
 * En castellano, todo lo que se puede tocar:
 *   · la tarjeta es la primera de «Viaje» y abre el «Pase» encima del pasaporte; dos toques
 *     seguidos en «volver» son un solo «atras» (el pasaporte sigue abierto); Escape; los enlaces
 *     #pase, #pase-rutas y #pase-tesoro;
 *   · «¿Qué estoy viendo?»: desde el Mirador de Humboldt se ven el Teide y La Palma; desde el de
 *     Cherfe (elegido en la hoja, buscando), La Gomera y El Hierro; con los sensores la vista
 *     sigue al movil, el Teide se nombra en la mira, arrastrar ajusta y «↺» lo quita; la lista;
 *     la camara; el «atras» cierra primero la hoja y luego la vista; fuera de Tenerife pide un
 *     mirador; un relieve que no llega intacto no pinta nada;
 *   · las rutas: las cuatro; la de Teno con sus avisos de la carretera y del vertigo y el enlace a
 *     «Antes de salir» (que se abre encima); a OSRM solo van las paradas, nunca la posicion, y
 *     el dibujo se guarda y no se vuelve a pedir; «▶» lee una parada; «Empezar la ruta»: pantalla
 *     encendida, cada parada al llegar, las que se pasan de largo, «Saltar», el final y, en Teno,
 *     el paso a la busqueda del tesoro; sin permiso de ubicacion lo dice;
 *   · la busqueda: lejos, lo dice y ofrece como llegar; con el GPS fino, cada sitio se encuentra
 *     al llegar y con el GPS grueso no; «Estoy aquí» lejos dice cuanto falta; «Me rindo» lo dice
 *     y ofrece el camino a pie; lo encontrado sigue al volver a abrir la app; «Empezar de nuevo»
 *     lo borra; datos rotos en el dispositivo, fuera.
 * Si el modulo no llega: el «Pase» (o «¿Qué estoy viendo?») lo dice y se puede reintentar.
 * Sin red, con el service worker: el «Pase» y «¿Qué estoy viendo?» abren de la cache.
 * Cero errores de pagina. Sale con 1 si algo falla.
 */
'use strict';
let chromium;
try { chromium = require('playwright').chromium; } catch (e) { chromium = require('/opt/node22/lib/node_modules/playwright').chromium; }
const fs = require('fs');
const path = require('path');
const PUERTO = process.argv[2] || '8766';
const BASE = 'http://127.0.0.1:' + PUERTO + '/index.html';
const RAIZ = path.join(__dirname, '..');
const LANGS = ['es', 'en', 'fr', 'de', 'it', 'nl', 'zh', 'zht', 'bg', 'pl', 'ro'];
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1';
const ANDROID = 'Mozilla/5.0 (Linux; Android 15; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/28.0 Chrome/130.0.0.0 Mobile Safari/537.36';
/* lo que no puede quedar en castellano en otro idioma */
const CASTELLANO = ['Pase de viaje', 'Gratis por ahora', 'Rutas en coche', 'Búsqueda del tesoro', '¿Qué estoy viendo?', 'Empezar la ruta', 'Cómo llegar',
  'Quien conduce', 'Próxima parada', 'Pista 1 de', 'Una ayuda', 'Me rindo', 'Estoy aquí', 'Mi posición', 'Lo que se ve', 'Arrastre para girar',
  'Calculando', 'Esperando', 'paradas', 'En esta ruta', 'Se juega a pie'];
/* textos que pueden ser iguales al castellano: nombres propios, unidades y marcas */
const IGUALES = /^(paseRuta_anaga|paseTesoroDonde|paseKm|paseM|paseDur|paseDurMin|hzKm|hzM|hzTeide|hzIsla_(gc|go|lp|hi)|hzRumbo[A-Z]+|hzTipoCima|hzA|paseA)$/;
const PLAZA = { latitude: 28.4682, longitude: -16.2546, accuracy: 20 };          /* Plaza de España, Santa Cruz */
const HUMBOLDT = { latitude: 28.4078, longitude: -16.5072, accuracy: 10 };       /* Mirador de Humboldt (su ficha) */
const MADRID = { latitude: 40.4168, longitude: -3.7038, accuracy: 20 };
const SENSORES = ['accelerometer', 'gyroscope', 'magnetometer'];

let fallos = 0, hechos = 0;
function ok(c, txt, det) { hechos++; if (c) console.log('  OK  ' + txt); else { fallos++; console.log('  MAL ' + txt + (det !== undefined ? '   -> ' + JSON.stringify(det).slice(0, 400) : '')); } }
const espera = ms => new Promise(r => setTimeout(r, ms));

/* lo que se sale por los lados o se corta, dentro de un panel */
const DESBORDE = sel => {
  const w = document.documentElement.clientWidth, malos = [];
  const raiz = document.querySelector(sel); if (!raiz) return ['no esta ' + sel];
  raiz.querySelectorAll('*').forEach(e => {
    if (!e.getClientRects().length || e.closest('svg')) return;
    const r = e.getBoundingClientRect();
    if (r.width && (r.right > w + 1 || r.left < -1)) malos.push((e.id || String(e.className) || e.tagName) + ' ' + Math.round(r.left) + '..' + Math.round(r.right));
    const cs = getComputedStyle(e);
    if ((cs.overflowX === 'hidden' || cs.textOverflow === 'ellipsis') && e.clientWidth > 1 && e.scrollWidth > e.clientWidth + 1 && !/scroll|hz-tit|pase-titulo/.test(String(e.className) + e.id))
      malos.push('cortado ' + (e.id || String(e.className)) + ' ' + e.clientWidth + '<' + e.scrollWidth);
  });
  return malos.slice(0, 4);
};

/* OSRM de mentira: una ruta recta entre los puntos pedidos, con la forma de la API de verdad */
function respuestaOsrm(url) {
  const co = decodeURIComponent(url.split('/driving/')[1].split('?')[0]).split(';').map(s => s.split(',').map(Number));
  const d = (a, b) => { const R = 6371008.8, r = Math.PI / 180, x = Math.sin((b[1] - a[1]) * r / 2) ** 2 + Math.cos(a[1] * r) * Math.cos(b[1] * r) * Math.sin((b[0] - a[0]) * r / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); };
  const legs = []; let tot = 0;
  for (let i = 1; i < co.length; i++) { const m = d(co[i - 1], co[i]) * 1.4; legs.push({ distance: m, duration: m / 13.9 }); tot += m; }
  return JSON.stringify({ code: 'Ok', routes: [{ distance: tot, duration: tot / 13.9, legs, geometry: { type: 'LineString', coordinates: co } }] });
}

async function abrirApp(b, L, opc) {
  opc = opc || {};
  const ancho = opc.ancho || 402;
  const ctx = await b.newContext({ viewport: { width: ancho, height: ancho > 380 ? 874 : 780 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2,
    userAgent: opc.ios ? IPHONE : ANDROID, serviceWorkers: opc.sw ? 'allow' : 'block', timezoneId: 'Atlantic/Canary', locale: 'es-ES',
    geolocation: opc.geo || PLAZA, permissions: opc.sinPermiso ? SENSORES : ['geolocation'].concat(SENSORES) });
  const p = await ctx.newPage();
  const errores = []; p.on('pageerror', e => errores.push(e.message));
  p.osrm = [];
  await p.addInitScript(([tesoro]) => {
    try { localStorage.setItem('tenerife.tour.seen', '99'); localStorage.setItem('tgo_consent', JSON.stringify({ v: 'denied', t: Date.now() })); } catch (e) {}
    if (tesoro) try { localStorage.setItem('tenerife.pase.tesoro', tesoro); } catch (e) {}
    /* la pantalla encendida: se cuenta cuantas veces se pide */
    window.__despierto = 0;
    /* la voz: una de mentira que «habla» un segundo y medio por frase y apunta lo que dice (la de
       Chromium sin voces falla al instante y no deja ver nada) */
    window.__dicho = [];
    try {
      const falsa = { speaking: false, pending: false, paused: false, onvoiceschanged: null, getVoices: () => [],
        speak(u) { window.__dicho.push({ t: u.text, l: u.lang }); this.speaking = true; const yo = this; u.__reloj = setTimeout(() => { yo.speaking = false; if (u.onend) u.onend({}); }, 1500); },
        cancel() { this.speaking = false; }, pause() {}, resume() {}, addEventListener() {}, removeEventListener() {} };
      Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: falsa });
    } catch (e) {}
    try { Object.defineProperty(navigator, 'wakeLock', { configurable: true, value: { request: () => { window.__despierto++; return Promise.resolve({ release: () => Promise.resolve(), addEventListener() {} }); } } }); } catch (e) {}
  }, [opc.tesoro || null]);
  await p.route('**/*', r => {
    const u = r.request().url();
    if (u.startsWith('http://127.0.0.1:' + PUERTO + '/')) {
      if (opc.cortar && opc.cortar.test(u)) return r.abort('internetdisconnected');
      if (opc.cambiar && opc.cambiar[0].test(u)) return r.fulfill({ status: 200, contentType: 'image/png', body: fs.readFileSync(path.join(RAIZ, opc.cambiar[1])) });
      return r.continue();
    }
    if (/^(data|blob):/.test(u)) return r.continue();
    if (/^https:\/\/router\.project-osrm\.org\/route\/v1\/driving\//.test(u) && opc.osrm !== false) {
      p.osrm.push(u);
      return r.fulfill({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: respuestaOsrm(u) });
    }
    return r.abort('internetdisconnected');
  });
  await p.goto(BASE + (opc.hash || ''), { waitUntil: 'load' });
  await p.waitForTimeout(700);
  if (!opc.hash) await bienvenida(p, L);
  return { ctx, p, errores };
}
/* la bienvenida sale en cada arranque (tambien al recargar) y tapa lo de debajo: se elige el idioma y «Empezar» */
async function bienvenida(p, L) {
  await p.waitForSelector('#v19-welcome-start', { state: 'visible', timeout: 4000 }).catch(() => {});
  if (!await p.evaluate(() => { const w = document.getElementById('v19-welcome'); return !!(w && !w.classList.contains('hidden') && w.getClientRects().length); })) return;
  await p.tap('.v19-w-lang[data-lang="' + L + '"]'); await p.waitForTimeout(200);
  await p.tap('#v19-welcome-start'); await p.waitForTimeout(1800);
}
/* el pasaporte, en «Viaje», y su tarjeta «Pase de viaje» */
const abrirPasaporte = async p => {
  await p.evaluate(() => TG_PERFIL_CARGAR().then(() => { TG_PERFIL.abrir(); if (TG_PERFIL.pestana) TG_PERFIL.pestana('viaje'); }));
  await p.waitForSelector('#tgp-pase-abrir', { state: 'visible', timeout: 8000 });
  await p.waitForTimeout(300);
};
const abrirPase = async p => {
  await abrirPasaporte(p);
  await p.tap('#tgp-pase-abrir');
  await p.waitForFunction(() => window.TG_PASE && TG_PASE.abierto(), null, { timeout: 8000 });
  await p.waitForTimeout(400);
};
const botonPase = (p, re) => p.evaluate(src => { const r = new RegExp(src); const b = [...document.querySelectorAll('#pase-cuerpo button, #pase-cuerpo a')].find(x => r.test(x.textContent) || r.test(x.getAttribute('aria-label') || '')); if (!b) return false; b.setAttribute('data-prueba', '1'); return true; }, re.source)
  .then(async hay => { if (hay) { await p.tap('[data-prueba="1"]'); await p.evaluate(() => { const b = document.querySelector('[data-prueba="1"]'); if (b) b.removeAttribute('data-prueba'); }); } return hay; });
const vista = p => p.evaluate(() => { const v = TG_HORIZONTE._prueba.vista(); if (!v) return null;
  return { lect: v.lectN.textContent, sub: v.lectS.textContent, vistos: v.R ? v.R.vistos.map(x => x.t) : null, estado: v.estado.hidden ? '' : v.estT.textContent,
           desde: v.desdeN.textContent, sens: v.V.sensores, ajuste: v.ajuste, rumbo: v.cRumbo.textContent, hoja: !v.hoja.hidden, cam: v.V.camara }; });
/* hasta que hay calculo, o un aviso sin barra (fuera de Tenerife, relieve mal leido…) */
const esperarCalculo = p => p.waitForFunction(() => { const v = window.TG_HORIZONTE && TG_HORIZONTE._prueba.vista(); return !!(v && (v.R || (!v.estado.hidden && v.barra.hidden))); }, null, { timeout: 15000 }).catch(() => {});
const girar = (p, alpha) => p.evaluate(a => { for (let i = 0; i < 8; i++) window.dispatchEvent(new DeviceOrientationEvent('deviceorientationabsolute', { alpha: a, beta: 90, gamma: 0, absolute: true })); }, alpha);

(async () => {
  const b = await chromium.launch({ args: ['--no-proxy-server', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });

  /* ── las tablas ── */
  {
    console.log('— las tablas');
    const { ctx, p, errores } = await abrirApp(b, 'es', { geo: HUMBOLDT });
    await p.evaluate(() => Promise.all([TG_PASE_CARGAR(), TG_HORIZONTE_CARGAR()]));
    const t = await p.evaluate(() => ({ pase: TG_PASE.filas, hz: TG_HORIZONTE.filas, cargador: ['paseTitulo', 'paseGratis', 'paseNoAbre', 'paseTarjeta'].map(k => [k, UI_TX[k]]) }));
    const filas = Object.assign({}, t.pase, t.hz); t.cargador.forEach(([k, v]) => { filas[k] = v; });
    const huecos = [], marcas = [], iguales = [];
    for (const [k, v] of Object.entries(filas)) {
      const m0 = (v.es.match(/\{[a-z]+\}/g) || []).sort().join();
      for (const L of LANGS) {
        if (!v[L] || !String(v[L]).trim()) { huecos.push(k + '.' + L); continue; }
        if ((v[L].match(/\{[a-z]+\}/g) || []).sort().join() !== m0) marcas.push(k + '.' + L);
        if (L !== 'es' && v[L] === v.es && !IGUALES.test(k)) iguales.push(k + '.' + L);
      }
    }
    ok(Object.keys(filas).length > 140, 'los textos del «Pase» y de «¿Qué estoy viendo?»: ' + Object.keys(filas).length + ' filas');
    ok(!huecos.length, 'ningun texto vacio en los once idiomas', huecos.slice(0, 8));
    ok(!marcas.length, 'las mismas {marcas} que el castellano', marcas.slice(0, 8));
    ok(!iguales.length, 'nada igual al castellano salvo nombres propios y unidades', iguales.slice(0, 8));
    const cielo = JSON.parse(fs.readFileSync(path.join(RAIZ, 'datos', 'cielo.json'), 'utf8')).declinacion.anios;
    const decl = await p.evaluate(() => TG_HORIZONTE._prueba.decl);
    ok(JSON.stringify(decl) === JSON.stringify(cielo), 'la declinacion, la de datos/cielo.json (WMM2025)', decl);
    const islas = await p.evaluate(() => TG_HORIZONTE._prueba.islas);
    const dms = (g, m, s) => g + m / 60 + s / 3600;
    const RESEÑAS = { gc: [dms(27, 57, 42.93989), -dms(15, 34, 18.38392)], go: [dms(28, 6, 35.04), -dms(17, 14, 54.06)], lp: [dms(28, 45, 16), -dms(17, 53, 6)], hi: [dms(27, 43, 45.48353), -dms(18, 2, 25.69146)] };
    ok(islas.length === 4 && islas.every(x => RESEÑAS[x.id] && Math.abs(x.lat - RESEÑAS[x.id][0]) < 1e-9 && Math.abs(x.lng - RESEÑAS[x.id][1]) < 1e-9), 'las cimas de las otras islas, en las coordenadas de las reseñas del IGN', islas.map(x => x.id));
    const rutas = await p.evaluate(() => TG_PASE._prueba.rutas.map(r => ({ id: r.id, n: r.paradas.length, P: TG_PASE._prueba.paradasDe(r).map(x => { const d = TG_PASE._prueba.textoLugar(x); return [x.id, !!(d && d.txt.length > 40 && d.lg === 'es')]; }) })));
    ok(rutas.length === 4 && rutas.every(r => r.P.length === r.n && r.P.every(x => x[1])), 'las cuatro rutas: cada parada es un lugar de la app, con su descripcion para leer', rutas.map(r => r.id + ':' + r.P.filter(x => x[1]).length + '/' + r.n));
    const tes = await p.evaluate(() => TG_PASE._prueba.tesoro.paradas);
    let cerca = [];
    for (let i = 0; i < tes.length; i++) for (let j = i + 1; j < tes.length; j++) { const d = await p.evaluate(([a, c]) => TG_PASE._prueba.distGC(a, c), [tes[i], tes[j]]); if (d < 150) cerca.push(tes[i].id + '-' + tes[j].id + ' ' + Math.round(d)); }
    ok(tes.length === 3 && !cerca.length, 'los tres sitios de la busqueda, a mas de 150 m unos de otros', cerca);
    /* la costa del mapa pequeño, sobre la costa del relieve (canal «costa» entre 96 y 160: unos 130 m) */
    const costa = await p.evaluate(async () => {
      const P = TG_HORIZONTE._prueba; await P.cargarRelieve(); const D = P.relieve(), R = 6378137, malos = [];
      TG_PASE._prueba.contorno.forEach(([lng, lat]) => {
        const i = Math.round((R * lng * Math.PI / 180 - D.x0) / D.paso - 0.5), j = Math.round((D.y0 - R * Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360))) / D.paso - 0.5);
        let mejor = 999; for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) { const c = D.costa[(j + dj) * D.w + i + di]; mejor = Math.min(mejor, Math.abs(c - 128)); }
        if (mejor > 32) malos.push([lng, lat, mejor]);
      });
      return { n: TG_PASE._prueba.contorno.length, malos: malos.slice(0, 5) };
    });
    ok(costa.n > 200 && !costa.malos.length, 'la costa del mapa pequeño: ' + costa.n + ' vertices, todos sobre la costa del relieve', costa.malos);
    ok(!errores.length, 'las tablas: sin errores de pagina', errores.slice(0, 3));
    await ctx.close();
  }

  /* ── los idiomas ── */
  for (const L of LANGS) {
    console.log('— ' + L);
    const { ctx, p, errores } = await abrirApp(b, L, { geo: HUMBOLDT });
    await abrirPasaporte(p);
    const tarjeta = await p.innerText('#tgp-pase');
    ok(tarjeta.includes(await p.evaluate(() => tx('paseTitulo'))) && tarjeta.includes(await p.evaluate(() => tx('paseGratis'))), L + ': la tarjeta del pasaporte, en su idioma', tarjeta.slice(0, 120));
    await p.tap('#tgp-pase-abrir');
    await p.waitForFunction(() => window.TG_PASE && TG_PASE.abierto(), null, { timeout: 8000 }).catch(() => {});
    await p.waitForTimeout(400);
    for (const nombre of ['el «Pase»', 'las rutas', 'una ruta', 'la busqueda']) {
      if (nombre === 'las rutas') { await p.evaluate(() => document.querySelectorAll('#pase-cuerpo .pase-tarjeta .pase-btn')[1].click()); await p.waitForTimeout(400); }
      if (nombre === 'una ruta') { await p.evaluate(() => document.querySelectorAll('.pase-ruta-item')[2].click()); await p.waitForTimeout(700); }
      if (nombre === 'la busqueda') { await p.goBack(); await p.waitForTimeout(300); await p.goBack(); await p.waitForTimeout(300); await p.evaluate(() => document.querySelectorAll('#pase-cuerpo .pase-tarjeta .pase-btn')[2].click()); await p.waitForTimeout(800); }
      for (const ancho of [360, 402]) {
        await p.setViewportSize({ width: ancho, height: 800 });
        const d = await p.evaluate(DESBORDE, '#pase-panel');
        ok(!d.length, L + ': ' + nombre + ' cabe a ' + ancho + ' px', d);
      }
      if (L !== 'es') { const tt = await p.innerText('#pase-panel'); const quedan = CASTELLANO.filter(f => tt.includes(f)); ok(!quedan.length, L + ': ningun texto castellano en ' + nombre, quedan); }
    }
    await p.goBack(); await p.waitForTimeout(400);
    await p.setViewportSize({ width: 402, height: 874 });
    await p.tap('#pase-cuerpo .pase-tarjeta .pase-btn');
    await esperarCalculo(p);
    await p.waitForTimeout(400);
    const v = await vista(p);
    ok(v && v.vistos && v.vistos.length > 5, L + ': «¿Qué estoy viendo?» calcula lo que se ve', v && v.estado);
    for (const ancho of [360, 402]) {
      await p.setViewportSize({ width: ancho, height: 800 }); await p.waitForTimeout(150);
      const d = await p.evaluate(DESBORDE, '#hz-vista');
      ok(!d.length, L + ': «¿Qué estoy viendo?» cabe a ' + ancho + ' px', d);
    }
    await p.tap('#hz-vista .hz-arriba .hz-btn:last-child'); await p.waitForTimeout(300);
    const th = await p.innerText('#hz-vista');
    if (L !== 'es') { const quedan = CASTELLANO.filter(f => th.includes(f)); ok(!quedan.length, L + ': ningun texto castellano en «¿Qué estoy viendo?»', quedan); }
    ok(th.includes(await p.evaluate(() => TG_HORIZONTE.t('hzListaTit'))), L + ': la lista de lo que se ve, en su idioma');
    ok(!errores.length, L + ': sin errores de pagina', errores.slice(0, 3));
    await ctx.close();
  }

  /* ── la tarjeta, el «atras», Escape y los enlaces ── */
  {
    console.log('— la tarjeta, el «atras», Escape y los enlaces');
    const { ctx, p, errores } = await abrirApp(b, 'es', { geo: HUMBOLDT, ios: true });
    await abrirPasaporte(p);
    ok(await p.evaluate(() => document.getElementById('tgp-p-viaje').firstElementChild.id === 'tgp-pase'), 'la tarjeta «Pase de viaje» es la primera de «Viaje»');
    await p.tap('#tgp-pase-abrir');
    await p.waitForFunction(() => window.TG_PASE && TG_PASE.abierto(), null, { timeout: 8000 });
    await p.waitForTimeout(300);
    ok(await p.evaluate(() => { const r = document.getElementById('pase-panel').getBoundingClientRect(); const e = document.elementFromPoint(r.width / 2, r.height / 2); return !!(e && e.closest('#pase-panel')); }), 'el «Pase» se abre encima del pasaporte');
    ok(await p.evaluate(() => document.activeElement && document.activeElement.id === 'pase-titulo'), 'el foco, al titulo');
    ok(await p.evaluate(() => document.querySelectorAll('#pase-cuerpo .pase-tarjeta').length === 3 && [...document.querySelectorAll('#pase-cuerpo .pase-gratis')].every(x => x.textContent === 'Gratis por ahora')), 'las tres cosas, y las tres «Gratis por ahora»');
    await p.evaluate(() => document.querySelectorAll('#pase-cuerpo .pase-tarjeta .pase-btn')[1].click()); await p.waitForTimeout(300);
    await p.keyboard.press('Escape'); await p.waitForTimeout(400);
    ok(await p.evaluate(() => TG_PASE.abierto() && document.getElementById('pase-titulo').textContent === 'Pase de viaje' && !!document.querySelector('#perfil-panel:not([hidden])')), 'Escape vuelve a la pantalla de antes (y el pasaporte de debajo sigue abierto)');
    await p.evaluate(() => { const b = document.getElementById('pase-atras'); b.click(); b.click(); }); await p.waitForTimeout(900);
    ok(await p.evaluate(() => !TG_PASE.abierto() && !!document.querySelector('#perfil-panel:not([hidden])')), 'dos toques seguidos en «volver»: un solo «atras» (el pasaporte sigue)');
    ok(!errores.length, 'sin errores de pagina', errores.slice(0, 3));
    await ctx.close();
    for (const [hash, que, comprobar] of [['#pase', 'el «Pase»', () => document.getElementById('pase-titulo').textContent === 'Pase de viaje'],
                                         ['#pase-rutas', 'las rutas', () => document.querySelectorAll('.pase-ruta-item').length === 4],
                                         ['#pase-tesoro', 'la busqueda', () => !!document.querySelector('.pase-pista')]]) {
      const a = await abrirApp(b, 'es', { hash, geo: PLAZA });
      await a.p.waitForFunction(() => window.TG_PASE && TG_PASE.abierto(), null, { timeout: 8000 }).catch(() => {});
      await a.p.waitForTimeout(500);
      ok(await a.p.evaluate(comprobar), 'el enlace ' + hash + ' abre ' + que);
      await a.ctx.close();
    }
  }

  /* ── «¿Qué estoy viendo?», en castellano ── */
  {
    console.log('— «¿Qué estoy viendo?»');
    const { ctx, p, errores } = await abrirApp(b, 'es', { geo: HUMBOLDT });
    await abrirPase(p);
    await p.tap('#pase-cuerpo .pase-tarjeta .pase-btn');
    await esperarCalculo(p);
    await p.waitForTimeout(300);
    let v = await vista(p);
    ok(v && v.vistos && v.vistos.includes('Teide') && v.vistos.includes('La Palma'), 'desde el Mirador de Humboldt se ven el Teide y La Palma', v && v.vistos && v.vistos.slice(0, 8));
    ok(v && v.desde === 'Mi posición', 'desde «Mi posición»', v && v.desde);
    /* los sensores: la vista mira al Teide */
    const teide = await p.evaluate(() => { const x = TG_HORIZONTE._prueba.rotulos().find(r => r.t === 'Teide'); const y = new Date(); const a = TG_HORIZONTE._prueba.decl; return { az: x.az, d: a[1][1] + (a[2][1] - a[1][1]) * ((y - new Date(Date.UTC(2026, 0, 1))) / 31557600000) }; });
    await girar(p, (360 - (teide.az - teide.d)) % 360);
    await p.waitForTimeout(500);
    await girar(p, (360 - (teide.az - teide.d)) % 360);
    await p.waitForTimeout(700);
    v = await vista(p);
    ok(v.sens, 'con los sensores, la vista sigue al movil');
    ok(v.lect === 'Teide' && /Cima · 3\.715 m · a 20 km/.test(v.sub), 'apuntando al Teide, se nombra en la mira (con la altitud de su ficha)', [v.lect, v.sub, v.rumbo]);
    /* arrastrar ajusta; «↺» lo quita */
    await p.evaluate(() => { const c = document.querySelector('#hz-vista .hz-lienzo'), r = c.getBoundingClientRect(); const ev = (t, x) => c.dispatchEvent(new PointerEvent(t, { pointerId: 7, clientX: x, clientY: r.height / 2, bubbles: true, pointerType: 'touch' })); ev('pointerdown', 150); ev('pointermove', 190); ev('pointermove', 230); ev('pointerup', 230); });
    await p.waitForTimeout(300);
    v = await vista(p);
    ok(Math.abs(v.ajuste) > 3 && await p.isVisible('#hz-vista .hz-chips button.hz-chip'), 'arrastrar ajusta la brujula y sale «↺»', v.ajuste);
    await p.tap('#hz-vista .hz-chips button.hz-chip'); await p.waitForTimeout(300);
    v = await vista(p);
    ok(v.ajuste === 0, '«↺» quita el ajuste');
    /* la lista */
    await p.tap('#hz-vista .hz-arriba .hz-btn:last-child'); await p.waitForTimeout(300);
    const filas = await p.evaluate(() => [...document.querySelectorAll('#hz-vista .hz-hoja .hz-fila b')].map(x => x.textContent));
    ok(filas.includes('Teide') && filas.includes('La Palma'), 'la lista de lo que se ve', filas.slice(0, 6));
    ok(await p.evaluate(() => /Obra derivada de MDT05-cob1 2008-2015 CC-BY 4\.0 scne\.es/.test(document.querySelector('#hz-vista .hz-hoja').innerText) && /OpenStreetMap/.test(document.querySelector('#hz-vista .hz-hoja').innerText)), 'la lista cita el relieve del IGN y OpenStreetMap');
    /* el «atras»: primero la hoja, luego la vista */
    await p.goBack(); await p.waitForTimeout(400);
    v = await vista(p);
    ok(v && !v.hoja, 'el «atras» cierra la hoja y deja la vista');
    /* la camara (la de mentira de Chromium) */
    await p.tap('#hz-vista .hz-arriba .hz-btn:nth-child(3)'); await p.waitForTimeout(1500);
    v = await vista(p);
    ok(v.cam && await p.isVisible('#hz-vista .hz-video'), 'la camara se enciende');
    await p.tap('#hz-vista .hz-arriba .hz-btn:nth-child(3)'); await p.waitForTimeout(400);
    ok(!(await vista(p)).cam && await p.evaluate(() => !document.querySelector('#hz-vista .hz-video').srcObject), 'y se apaga');
    /* desde otro sitio: la hoja, buscando */
    await p.tap('#hz-vista .hz-desde'); await p.waitForTimeout(300);
    await p.fill('#hz-vista .hz-hoja input', 'cherfe'); await p.waitForTimeout(200);
    const opciones = await p.evaluate(() => [...document.querySelectorAll('#hz-vista .hz-hoja .hz-fila b')].map(x => x.textContent));
    ok(opciones.length === 1 && /Cherfe/.test(opciones[0]), 'buscar «cherfe» deja un mirador', opciones);
    await p.tap('#hz-vista .hz-hoja .hz-fila'); await esperarCalculo(p); await p.waitForTimeout(1200);
    v = await vista(p);
    ok(/Cherfe/.test(v.desde) && v.vistos && ['La Gomera', 'El Hierro', 'La Palma'].every(x => v.vistos.includes(x)), 'desde el Mirador de Cherfe se ven La Gomera, El Hierro y La Palma', v && [v.desde, v.vistos && v.vistos.filter(x => /La |El /.test(x))]);
    await p.goBack(); await p.waitForTimeout(600);
    ok(await p.evaluate(() => !document.getElementById('hz-vista') && TG_PASE.abierto()), 'el «atras» cierra la vista y deja el «Pase»');
    ok(await p.evaluate(() => !document.documentElement.classList.contains('hz-abierto')), 'y no queda nada de la vista');
    ok(!errores.length, 'sin errores de pagina', errores.slice(0, 3));
    await ctx.close();
    /* fuera de Tenerife */
    const f = await abrirApp(b, 'es', { geo: MADRID });
    await abrirPase(f.p);
    await f.p.tap('#pase-cuerpo .pase-tarjeta .pase-btn'); await f.p.waitForTimeout(2500);
    v = await vista(f.p);
    ok(v && /fuera de Tenerife/.test(v.estado) && await f.p.isVisible('#hz-vista .hz-estado button'), 'fuera de Tenerife, pide un mirador', v && v.estado);
    await f.ctx.close();
    /* un relieve que no llega intacto (el PNG de sombras en su lugar): no pinta nada */
    const m = await abrirApp(b, 'es', { geo: HUMBOLDT, cambiar: [/mapa\/tenerife-relieve\.png/, 'mapa/tenerife-relieve-ao.png'] });
    await abrirPase(m.p);
    await m.p.tap('#pase-cuerpo .pase-tarjeta .pase-btn'); await m.p.waitForTimeout(3000);
    v = await vista(m.p);
    ok(v && /no se ha leído bien/.test(v.estado) && !v.vistos, 'un relieve que no cuadra con sus sumas no pinta nada', v && v.estado);
    await m.ctx.close();
  }

  /* ── las rutas en coche, en castellano ── */
  {
    console.log('— las rutas en coche');
    const { ctx, p, errores } = await abrirApp(b, 'es', { geo: PLAZA });
    await abrirPase(p);
    await p.evaluate(() => document.querySelectorAll('#pase-cuerpo .pase-tarjeta .pase-btn')[1].click()); await p.waitForTimeout(400);
    ok(await p.evaluate(() => document.querySelectorAll('.pase-ruta-item').length === 4), 'las cuatro rutas');
    await p.evaluate(() => document.querySelectorAll('.pase-ruta-item')[2].click()); await p.waitForTimeout(1200);
    const avisos = await p.evaluate(() => [...document.querySelectorAll('#pase-cuerpo .pase-caja li')].map(x => x.textContent));
    ok(avisos.length === 2 && /Carretera de montaña/.test(avisos.join()) && /acantilados/.test(avisos.join()), 'Teno: los avisos de la carretera y del vertigo, los de sus fichas', avisos);
    ok(await p.evaluate(() => /Quien conduce no toca el móvil/.test(document.getElementById('pase-cuerpo').innerText)), 'quien conduce no toca el movil');
    ok(p.osrm.length === 1, 'el dibujo de la carretera se pide a OSRM una vez', p.osrm.length);
    const pedidas = p.osrm[0] ? decodeURIComponent(p.osrm[0].split('/driving/')[1].split('?')[0]).split(';') : [];
    const paradas = await p.evaluate(() => TG_PASE._prueba.paradasDe(TG_PASE._prueba.rutas[2]).map(x => (+x.lng).toFixed(5) + ',' + (+x.lat).toFixed(5)));
    ok(JSON.stringify(pedidas) === JSON.stringify(paradas), 'a OSRM van solo las ocho paradas, nunca la posicion', pedidas.length);
    ok(await p.evaluate(() => { const o = JSON.parse(localStorage.getItem('tenerife.pase.trazado.v1.teno') || 'null'); return !!(o && o.c.length > 1 && o.tramos.length === 7); }), 'el dibujo se guarda en el dispositivo');
    ok(await p.evaluate(() => /km · unos/.test(document.querySelector('#pase-cuerpo .pase-dato').textContent) && /OSRM/.test(document.querySelector('.pase-creditos').textContent)), 'con el dibujo, los km y el tiempo, y OSRM citado');
    await p.goBack(); await p.waitForTimeout(300);
    await p.evaluate(() => document.querySelectorAll('.pase-ruta-item')[2].click()); await p.waitForTimeout(800);
    ok(p.osrm.length === 1, 'al volver a la ruta no se vuelve a pedir');
    /* «Antes de salir», encima */
    await botonPase(p, /Antes de salir/); await p.waitForTimeout(1200);
    ok(await p.evaluate(() => { const a = document.getElementById('antes-panel'); if (!a || a.hidden) return false; const e = document.elementFromPoint(200, 300); return !!(e && e.closest('#antes-panel')); }), '«Antes de salir» se abre encima del «Pase»');
    await p.evaluate(() => cerrarAntes()); await p.waitForTimeout(600);
    ok(await p.evaluate(() => TG_PASE.abierto() && !!document.querySelector('.pase-paradas')), 'y al cerrarlo, la ruta sigue');
    /* «▶» */
    await p.tap('.pase-paradas li:nth-child(3) .pase-escuchar'); await p.waitForTimeout(200);
    const sonando = await p.evaluate(() => document.querySelector('.pase-paradas li:nth-child(3) .pase-escuchar').textContent === '■');
    await p.waitForFunction(() => __dicho.length >= 2, null, { timeout: 5000 }).catch(() => {});
    ok(sonando && await p.evaluate(() => { const m = TG_PASE._prueba.paradasDe(TG_PASE._prueba.rutas.find(r => r.id === 'teno')).find(x => x.id === 'masca'), d = TG_PASE._prueba.textoLugar(m);
      return __dicho[0].t === 'Masca.' && __dicho[0].l === 'es-ES' && __dicho[1].t === d.txt; }), '«▶» lee la parada: su nombre y, despues, su descripcion', await p.evaluate(() => __dicho.slice(0, 2).map(x => x.t.slice(0, 60))));
    await p.tap('.pase-paradas li:nth-child(3) .pase-escuchar'); await p.waitForTimeout(200);
    ok(await p.evaluate(() => document.querySelector('.pase-paradas li:nth-child(3) .pase-escuchar').textContent === '▶'), 'y «■» la para');
    /* «Empezar la ruta» */
    await botonPase(p, /Empezar la ruta/); await p.waitForTimeout(600);
    ok(await p.evaluate(() => window.__despierto >= 1), 'la pantalla se queda encendida');
    const est = () => p.evaluate(() => { const M = TG_PASE._prueba.estado().marcha; return M ? { i: M.i, est: M.est.slice(), fin: M.fin, prox: document.querySelector('.pase-prox-n').textContent, texto: M.texto } : null; });
    const P = await p.evaluate(() => TG_PASE._prueba.paradasDe(TG_PASE._prueba.rutas[2]).map(x => ({ latitude: +x.lat, longitude: +x.lng })));
    await ctx.setGeolocation(Object.assign({ accuracy: 15 }, P[0])); await p.waitForTimeout(1500);
    let e = await est();
    ok(e && e.est[0] === 'hecha' && e.i === 1 && /Cherfe/.test(e.prox) && /Santiago del Teide/.test(e.texto), 'al llegar a la primera parada se lee, y la siguiente es Cherfe', e);
    await p.waitForFunction(() => __dicho.some(x => /^Próxima parada/.test(x.t)), null, { timeout: 12000 }).catch(() => {});
    const dicho = await p.evaluate(() => __dicho.map(x => x.t));
    ok(dicho.some(x => /^Teno: Masca y Garachico\. 8 paradas\. La primera: Santiago del Teide\.$/.test(x)) && dicho.includes('Santiago del Teide.') && dicho.some(x => /^Próxima parada: Mirador de Cherfe, a \d/.test(x)),
       'la voz: al empezar, la ruta; al llegar, la parada, su descripcion y la siguiente (con los km de la carretera)', dicho.slice(-4).map(x => x.slice(0, 70)));
    await ctx.setGeolocation(Object.assign({ accuracy: 15 }, P[3])); await p.waitForTimeout(1500);
    e = await est();
    ok(e.est[1] === 'saltada' && e.est[2] === 'saltada' && e.est[3] === 'hecha' && e.i === 4, 'las paradas que se pasan de largo quedan saltadas', e.est);
    await botonPase(p, /^Saltar$/); await p.waitForTimeout(300);
    e = await est();
    ok(e.est[4] === 'saltada' && e.i === 5, '«Saltar» pasa a la siguiente');
    await ctx.setGeolocation(Object.assign({ accuracy: 15 }, P[7])); await p.waitForTimeout(1500);
    e = await est();
    ok(e.fin && e.est[7] === 'hecha', 'en la ultima parada, la ruta termina', e);
    ok(await p.evaluate(() => /Garachico: hay una búsqueda del tesoro/.test(document.querySelector('.pase-fin').innerText)), 'al acabar Teno, la busqueda del tesoro de Garachico');
    await botonPase(p, /Búsqueda del tesoro/); await p.waitForTimeout(800);
    ok(await p.evaluate(() => !!document.querySelector('.pase-pista') && !TG_PASE._prueba.estado().marcha), 'que se abre (y la ruta ya no vigila el GPS)');
    await p.goBack(); await p.waitForTimeout(500);
    ok(await p.evaluate(() => TG_PASE.abierto() && document.getElementById('pase-titulo').textContent === 'Pase de viaje'), 'el «atras» desde la busqueda vuelve al «Pase»');
    ok(!errores.length, 'sin errores de pagina', errores.slice(0, 3));
    await ctx.close();
    /* sin permiso de ubicacion */
    const s = await abrirApp(b, 'es', { sinPermiso: true });
    await abrirPase(s.p);
    await s.p.evaluate(() => document.querySelectorAll('#pase-cuerpo .pase-tarjeta .pase-btn')[1].click()); await s.p.waitForTimeout(300);
    await s.p.evaluate(() => document.querySelectorAll('.pase-ruta-item')[0].click()); await s.p.waitForTimeout(600);
    await botonPase(s.p, /Empezar la ruta/); await s.p.waitForTimeout(1500);
    ok(await s.p.evaluate(() => /Sin permiso para la ubicación/.test(document.querySelector('.pase-gps').textContent)), 'sin permiso de ubicacion, lo dice (y se puede ir con «Saltar»)');
    await s.ctx.close();
  }

  /* ── la busqueda del tesoro, en castellano ── */
  {
    console.log('— la busqueda del tesoro');
    const { ctx, p, errores } = await abrirApp(b, 'es', { geo: PLAZA, ios: true });
    await abrirPase(p);
    await p.evaluate(() => document.querySelectorAll('#pase-cuerpo .pase-tarjeta .pase-btn')[2].click()); await p.waitForTimeout(1500);
    let t = await p.innerText('#pase-cuerpo');
    ok(/Está a \d+ km de Garachico/.test(t) && await p.evaluate(() => /maps\.apple\.com\/\?daddr=28\.37317\d*,-16\.76464\d*&dirflg=d/.test(document.querySelector('.pase-lejos a').href)), 'lejos, lo dice y ofrece como llegar (Mapas de Apple en iPhone)', t.slice(0, 200));
    const T = await p.evaluate(() => TG_PASE._prueba.tesoro.paradas.map(x => ({ latitude: x.lat, longitude: x.lng })));
    await ctx.setGeolocation(Object.assign({ accuracy: 80 }, T[0])); await p.waitForTimeout(1500);
    t = await p.innerText('#pase-cuerpo');
    ok(!/Encontrada/.test(t) && /margen de 80 m/.test(t), 'con el GPS grueso (80 m), no se da por encontrada y lo dice');
    await ctx.setGeolocation({ latitude: T[0].latitude + 0.0009, longitude: T[0].longitude, accuracy: 6 }); await p.waitForTimeout(1200);
    await botonPase(p, /Estoy aquí/); await p.waitForTimeout(1500);
    t = await p.innerText('#pase-cuerpo');
    ok(/Aún no: le quedan 100 m/.test(t), '«Estoy aquí» lejos dice cuanto falta', t.slice(0, 300));
    await botonPase(p, /Me rindo/); await p.waitForTimeout(300);
    ok(await p.evaluate(() => /Es: Convento de San Francisco/.test(document.getElementById('pase-cuerpo').innerText) && /dirflg=w/.test([...document.querySelectorAll('#pase-cuerpo a')].map(a => a.href).join())), '«Me rindo» lo dice y ofrece el camino a pie');
    for (let i = 0; i < 3; i++) {
      await ctx.setGeolocation(Object.assign({ accuracy: 6 }, T[i])); await p.waitForTimeout(1500);
      t = await p.innerText('#pase-cuerpo');
      ok(/¡Encontrada!/.test(t), 'el sitio ' + (i + 1) + ' se encuentra al llegar', t.slice(0, 160));
      if (i < 2) { await botonPase(p, /Siguiente pista/); await p.waitForTimeout(400); }
    }
    ok(/¡Tesoro encontrado! Ha resuelto las 3 pistas de Garachico\./.test(t), 'las tres: el tesoro');
    ok(await p.evaluate(() => JSON.parse(localStorage.getItem('tenerife.pase.tesoro')).hechas.length === 3), 'se guarda solo que pistas estan encontradas');
    await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(700); await bienvenida(p, 'es');
    await abrirPase(p);
    await p.evaluate(() => document.querySelectorAll('#pase-cuerpo .pase-tarjeta .pase-btn')[2].click()); await p.waitForTimeout(800);
    ok(/¡Tesoro encontrado!/.test(await p.innerText('#pase-cuerpo')), 'al volver a abrir la app, sigue encontrado');
    await botonPase(p, /Empezar de nuevo/); await p.waitForTimeout(500);
    ok(await p.evaluate(() => !localStorage.getItem('tenerife.pase.tesoro') && /Pista 1 de 3/.test(document.getElementById('pase-cuerpo').innerText)), '«Empezar de nuevo» lo borra');
    ok(!errores.length, 'sin errores de pagina', errores.slice(0, 3));
    await ctx.close();
    const r = await abrirApp(b, 'es', { geo: PLAZA, tesoro: '{"v":1,"id":"garachico","hechas":["<img src=x onerror=alert(1)>","castillo","castillo"]}' });
    await abrirPase(r.p);
    await r.p.evaluate(() => document.querySelectorAll('#pase-cuerpo .pase-tarjeta .pase-btn')[2].click()); await r.p.waitForTimeout(800);
    ok(await r.p.evaluate(() => JSON.stringify(TG_PASE._prueba.leerTesoro()) === '["castillo"]' && !document.querySelector('#pase-cuerpo img')), 'datos rotos en el dispositivo: fuera lo que no es una pista, sin repetir');
    ok(!r.errores.length, 'sin errores de pagina', r.errores.slice(0, 3));
    await r.ctx.close();
  }

  /* ── si el modulo no llega ── */
  {
    console.log('— si el modulo no llega');
    const a = await abrirApp(b, 'es', { geo: HUMBOLDT, cortar: /modulos\/pase\.js/ });
    await abrirPasaporte(a.p);
    await a.p.tap('#tgp-pase-abrir'); await a.p.waitForTimeout(1500);
    ok(await a.p.evaluate(() => !document.getElementById('pase-panel').hidden && /No se pudo abrir\. Compruebe la conexión/.test(document.getElementById('pase-cuerpo').innerText) && [...document.querySelectorAll('#pase-cuerpo button')].some(x => /Reintentar/.test(x.textContent))),
       'si modulos/pase.js no llega, el «Pase» lo dice y ofrece reintentar', await a.p.evaluate(() => document.getElementById('pase-cuerpo').innerText.slice(0, 160)));
    await a.p.tap('#pase-atras'); await a.p.waitForTimeout(500);
    ok(await a.p.evaluate(() => document.getElementById('pase-panel').hidden && !!document.querySelector('#perfil-panel:not([hidden])')), '…y la flecha lo cierra (el pasaporte sigue)');
    ok(!a.errores.length, 'sin errores de pagina', a.errores.slice(0, 3));
    await a.ctx.close();
    const h = await abrirApp(b, 'es', { geo: HUMBOLDT, cortar: /modulos\/horizonte\.js/ });
    await abrirPase(h.p);
    await h.p.tap('#pase-cuerpo .pase-tarjeta .pase-btn'); await h.p.waitForTimeout(1500);
    ok(await h.p.evaluate(() => !window.TG_HORIZONTE && TG_PASE.abierto() && /No se pudo abrir/.test(document.getElementById('pase-cuerpo').innerText)), 'si modulos/horizonte.js no llega, el «Pase» lo dice y sigue abierto');
    ok(!h.errores.length, 'sin errores de pagina', h.errores.slice(0, 3));
    await h.ctx.close();
  }

  /* ── sin red, con el service worker ── */
  {
    console.log('— sin red');
    const { ctx, p, errores } = await abrirApp(b, 'es', { geo: HUMBOLDT, sw: true });
    await p.evaluate(() => navigator.serviceWorker && navigator.serviceWorker.ready);
    await p.waitForFunction(() => caches.keys().then(ks => Promise.all(ks.map(k => caches.open(k).then(c => c.keys())))).then(ls => ls.flat().some(r => /modulos\/horizonte\.js$/.test(r.url))), null, { timeout: 30000 }).catch(() => {});
    await p.waitForTimeout(3000);
    await ctx.setOffline(true);
    await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(700); await bienvenida(p, 'es');
    await p.evaluate(() => abrirPase());
    await p.waitForFunction(() => window.TG_PASE && TG_PASE.abierto(), null, { timeout: 8000 }).catch(() => {});
    ok(await p.evaluate(() => !!(window.TG_PASE && TG_PASE.abierto())), 'sin red, el «Pase» abre de la cache');
    await p.tap('#pase-cuerpo .pase-tarjeta .pase-btn');
    await esperarCalculo(p); await p.waitForTimeout(500);
    const v = await vista(p);
    ok(v && v.vistos && v.vistos.includes('Teide'), 'y «¿Qué estoy viendo?», con el relieve de la cache', v && v.estado);
    ok(!errores.length, 'sin errores de pagina', errores.slice(0, 3));
    await ctx.close();
  }

  await b.close();
  console.log('\n' + (hechos - fallos) + '/' + hechos + ' controles bien' + (fallos ? '; ' + fallos + ' MAL' : ''));
  process.exit(fallos ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
