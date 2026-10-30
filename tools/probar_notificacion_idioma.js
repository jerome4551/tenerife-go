#!/usr/bin/env node
/* probar_notificacion_idioma.js — la notificacion diaria llega en el idioma de
 * cada movil, en los diez idiomas, y lo sigue si se cambia.
 *
 * EL HUECO QUE TAPA
 *   Jerome, 20 de octubre de 2026: «¿verificaste que las notificaciones se
 *   envían en cada idioma seleccionado en cada perfil?». No del todo: la
 *   suscripcion se guardaba con el idioma del momento de activarla y, al
 *   cambiar de idioma, la app no se lo decia a nadie hasta la siguiente vez
 *   que se abriera, y entonces guardar_push_sub() lo ignoraba (la
 *   suscripcion ya existia). Quien la activo en ingles y paso al aleman
 *   seguia recibiendo la frase en ingles. auditar_frases.js miraba que las
 *   frases estuvieran en los diez idiomas, pero no que cada movil recibiera
 *   la del suyo.
 *
 * COMO, EN DOS MITADES
 *   1. La app, en un navegador, haciendose pasar por instalada y con el
 *      permiso concedido (el service worker y el push, de mentira: aqui no
 *      hay movil). Se escucha lo que manda a guardar_push_sub():
 *        · al abrir, la suscripcion sale con el idioma de la app;
 *        · al cambiar a cada uno de los otros nueve, sale otra vez, con el
 *          nuevo; volver a elegir el mismo no manda nada;
 *        · la tarjeta que pide el permiso (pushPedir) y los avisos de PUSH_TX
 *          salen en el idioma de la app (los dos viven dentro de una funcion:
 *          la app los deja en window.TG_PUSH para esto).
 *   2. enviar-notificacion.js, con Supabase y web-push de mentira: diez
 *      suscripciones, una por idioma, mas una con un idioma que no existe y
 *      otra sin idioma. Cada una tiene que recibir el titulo y la frase del
 *      dia de SU idioma, sacados de frases.json por cuenta propia; las dos
 *      raras, la castellana. Nada sale de la maquina.
 *   3. el envio con 2.345 suscripciones, detras de una Supabase de mentira que
 *      da como mucho 1.000 filas por peticion, como la de verdad (Max rows):
 *      a cada una le llega una, y solo una (23 de octubre de 2026: leidas de
 *      una vez, a partir de la mil y una no le llegaba a nadie).
 *
 *   Lo que esto no puede ver es la base de datos real: que guardar_push_sub()
 *   apunte el idioma nuevo depende de supabase/push-idioma.sql, que se
 *   ejecuta en Supabase (y se probo en un PostgreSQL 16 de verdad, ver
 *   AUDITORIA-FINAL.md).
 *
 *     node tools/probar_notificacion_idioma.js [puerto]
 */
'use strict';
const fs = require('fs');
const path = require('path');
const Module = require('module');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const RAIZ = path.join(__dirname, '..');
const PUERTO = process.argv[2] || '8777';
const BASE = 'http://127.0.0.1:' + PUERTO + '/index.html';

const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
const IDIOMAS = (html.match(/SUPPORTED_LANGS\s*=\s*\[([^\]]*)\]/) || [, ''])[1]
  .split(',').map(s => s.replace(/['"\s]/g, '')).filter(Boolean);
const FRASES = JSON.parse(fs.readFileSync(path.join(RAIZ, 'frases.json'), 'utf8'));

let mal = 0;
const ver = (ok, que, detalle) => {
  if (!ok) mal++;
  console.log((ok ? '  ok   ' : '  MAL  ') + que + (detalle ? '  ' + detalle : ''));
};

async function laApp() {
  console.log('=== 1 · la app: con que idioma guarda la suscripcion ===');
  const nav = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const ctx = await nav.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } });
  const pg = await ctx.newPage();
  await pg.route('**/vendor/supabase.js', r => r.abort());
  const llamadas = [];
  await pg.route('**/rest/v1/rpc/guardar_push_sub', r => {
    try { llamadas.push(JSON.parse(r.request().postData() || '{}')); } catch (e) { llamadas.push({ roto: true }); }
    r.fulfill({ status: 204, body: '' });
  });
  await pg.addInitScript(() => {
    try {
      localStorage.setItem('tenerife.tour.seen', '99');
      localStorage.setItem('tenerife.welcome.seen', '1');
      localStorage.setItem('tg_lang', 'es');
    } catch (e) {}
    // instalada en la pantalla de inicio
    const mm = window.matchMedia.bind(window);
    window.matchMedia = q => /display-mode:\s*standalone/.test(q)
      ? { matches: true, media: q, onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent() { return false; } }
      : mm(q);
    // el permiso, ya concedido
    window.Notification = function () {};
    window.Notification.permission = 'granted';
    window.Notification.requestPermission = async () => 'granted';
    window.PushManager = function () {};
    // un service worker y una suscripcion de mentira
    const sub = { endpoint: 'https://push.prueba.invalid/tg-1',
      toJSON() { return { endpoint: this.endpoint, keys: { p256dh: 'BPRUEBA', auth: 'APRUEBA' } }; } };
    const reg = { pushManager: { getSubscription: async () => sub, subscribe: async () => sub },
      addEventListener() {}, update: async () => {}, installing: null, waiting: null, active: null };
    Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: {
      ready: Promise.resolve(reg), register: async () => reg, addEventListener() {},
      getRegistrations: async () => [], controller: null } });
  });
  await pg.goto(BASE, { waitUntil: 'networkidle' });
  const espera = async (n, ms) => { const t = Date.now() + ms; while (llamadas.length < n && Date.now() < t) await pg.waitForTimeout(50); };

  await espera(1, 8000);
  ver(llamadas.length >= 1 && llamadas[0].p_lang === 'es', 'al abrir en castellano, se guarda con «es»',
      llamadas.length ? '(p_lang: ' + llamadas[0].p_lang + ')' : '(no se llamo a guardar_push_sub)');
  ver(llamadas.every(c => c.p_endpoint && c.p_p256dh && c.p_auth), 'cada llamada lleva el endpoint y las dos claves');

  for (const L of IDIOMAS.filter(l => l !== 'es')) {
    const antes = llamadas.length;
    await pg.evaluate(l => setLang(l), L);
    await espera(antes + 1, 5000);
    const ultima = llamadas[llamadas.length - 1] || {};
    ver(llamadas.length === antes + 1 && ultima.p_lang === L, 'al pasar a «' + L + '», se vuelve a guardar con «' + L + '»',
        '(llamadas nuevas: ' + (llamadas.length - antes) + ', p_lang: ' + ultima.p_lang + ')');
  }
  {
    const antes = llamadas.length, L = IDIOMAS[IDIOMAS.length - 1];
    await pg.evaluate(l => setLang(l), L);
    await pg.waitForTimeout(800);
    ver(llamadas.length === antes, 'elegir otra vez el mismo idioma no manda nada', '(llamadas nuevas: ' + (llamadas.length - antes) + ')');
  }

  /* lo que se le ensena a la persona: la tarjeta que pide el permiso */
  for (const L of IDIOMAS) {
    await pg.evaluate(l => setLang(l), L);
    const r = await pg.evaluate(() => {
      if (typeof TG_PUSH === 'undefined') return { textos: [], quiere: [], error: 'la app no deja window.TG_PUSH' };
      try { localStorage.removeItem('tgo_push_asked'); } catch (e) {}
      TG_PUSH.pedir();
      const tarjetas = [...document.body.children].filter(d => d.style && d.style.zIndex === '9800');
      const t = tarjetas[tarjetas.length - 1];
      const textos = t ? [...t.querySelectorAll('div,button')].filter(x => !x.children.length).map(x => x.textContent) : [];
      if (t) t.remove();
      const quiere = ['titulo', 'texto', 'no', 'si'].map(k => TG_PUSH.textos[k][currentLang]);
      return { textos, quiere };
    });
    const ok = !r.error && r.quiere.every(Boolean) && r.quiere.every(q => r.textos.indexOf(q) >= 0);
    ver(ok, '[' + L + '] la tarjeta del permiso, en su idioma', ok ? '' : JSON.stringify(r));
  }
  {
    const r = await pg.evaluate(langs => {
      if (typeof TG_PUSH === 'undefined') return { claves: 0, fallos: ['la app no deja window.TG_PUSH'] };
      const fallos = [];
      const T = TG_PUSH.textos;
      for (const k of Object.keys(T)) for (const l of langs) {
        const v = T[k][l];
        if (!v) fallos.push(k + '.' + l + ' vacio');
        else if (l !== 'es' && v === T[k].es) fallos.push(k + '.' + l + ' igual que el castellano');
      }
      /* y las filas de UI_TX del boton de Cuenta y de sus avisos */
      const FILAS = ['pushBtnActivar', 'pushActivando', 'pushActivadas', 'pushHazInstalar', 'pushNoNavegador', 'noSePudoActivar'];
      for (const k of FILAS) for (const l of langs) {
        const v = UI_TX[k] && UI_TX[k][l];
        if (!v) fallos.push('UI_TX.' + k + '.' + l + ' vacio');
        else if (l !== 'es' && v === UI_TX[k].es) fallos.push('UI_TX.' + k + '.' + l + ' igual que el castellano');
      }
      return { claves: Object.keys(T).length, filas: FILAS.length, fallos };
    }, IDIOMAS);
    ver(!r.fallos.length, 'los ' + r.claves + ' textos de PUSH_TX y las ' + r.filas + ' filas del boton de Cuenta, en los ' +
        IDIOMAS.length + ' idiomas y ninguno copiado del castellano', r.fallos.join(', '));
  }

  /* EL BOTON SIN CUENTA (21 de octubre de 2026). Jerome: «4 si». Hasta
     entonces «Activar notificaciones» solo estaba con la sesion iniciada, y
     quien no tenia cuenta y contesto «Ahora no» a la tarjeta no tenia por
     donde activarlas. Ahora tambien esta en «Continuar como invitado»: se
     abre Cuenta sin sesion, se pasa a esa pestaña, el boton se ve con su
     rotulo del idioma, y al tocarlo guarda la suscripcion con el idioma de
     la app y lo dice debajo. */
  for (const L of IDIOMAS) {
    // cambiar de idioma ya vuelve a guardar la suscripcion (arriba): se espera a esa
    const n0 = llamadas.length;
    await pg.evaluate(l => setLang(l), L);
    await espera(n0 + 1, 5000);
    await pg.waitForTimeout(200);
    // la linea que dejo la vuelta anterior, ya en el idioma nuevo
    if (L !== IDIOMAS[0]) {
      const m = await pg.evaluate(() => ({ t: document.getElementById('auth-push-msg-invitado').textContent, q: UI_TX.pushActivadas[currentLang] }));
      ver(m.t === m.q, '[' + L + '] al cambiar de idioma, la linea de debajo del boton cambia con el', m.t === m.q ? '' : JSON.stringify(m));
    }
    const antes = llamadas.length;
    const r = await pg.evaluate(() => {
      openAuthModal();
      document.getElementById('auth-tab-guest').click();
      const b = document.getElementById('auth-push-btn-invitado');
      const panel = document.getElementById('auth-form-guest');
      const ve = !!b && !!b.offsetParent && panel.contains(b) && getComputedStyle(b).visibility !== 'hidden';
      const rotulo = b ? b.textContent.trim() : null;
      if (b) b.click();
      return { ve, rotulo, quiere: UI_TX.pushBtnActivar[currentLang], ok: UI_TX.pushActivadas[currentLang],
               pestana: document.getElementById('auth-tab-guest').textContent.trim() };
    });
    await espera(antes + 1, 5000);
    const ultima = llamadas[llamadas.length - 1] || {};
    await pg.waitForTimeout(150);
    const msg = await pg.evaluate(() => (document.getElementById('auth-push-msg-invitado') || {}).textContent || '');
    await pg.evaluate(() => closeAuthModal());
    const ok = r.ve && r.rotulo === r.quiere && llamadas.length === antes + 1 && ultima.p_lang === L && msg === r.ok;
    ver(ok, '[' + L + '] sin cuenta, «' + r.quiere + '» en «' + r.pestana + '»: guarda con «' + L + '» y lo dice',
        ok ? '' : JSON.stringify({ r, llamadas: llamadas.length - antes, p_lang: ultima.p_lang, msg }));
  }
  await nav.close();

  /* Y donde no se puede (un navegador sin push): el boton sin cuenta sale
     apagado y dice por que, como el de la sesion iniciada. */
  const nav2 = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const pg2 = await (await nav2.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } })).newPage();
  await pg2.route('**/vendor/supabase.js', r => r.abort());
  await pg2.addInitScript(() => {
    try { localStorage.setItem('tenerife.tour.seen', '99'); localStorage.setItem('tenerife.welcome.seen', '1'); localStorage.setItem('tg_lang', 'de'); } catch (e) {}
    try { delete window.PushManager; } catch (e) {}
  });
  await pg2.goto(BASE, { waitUntil: 'networkidle' });
  const r2 = await pg2.evaluate(() => {
    openAuthModal();
    document.getElementById('auth-tab-guest').click();
    const b = document.getElementById('auth-push-btn-invitado');
    return { apagado: !!b && b.disabled, msg: (document.getElementById('auth-push-msg-invitado') || {}).textContent || '',
             quiere: tx('pushNoNavegador'), lang: currentLang };
  });
  ver(r2.apagado && r2.msg === r2.quiere && r2.lang === 'de', '[de] sin push en el navegador: el boton sin cuenta, apagado y con el motivo',
      JSON.stringify(r2));
  await nav2.close();
}

/* lo que hace PostgREST con ?order=…&offset=…&limit=…: el trozo pedido, y nunca
   mas de Max rows (1.000 en cada proyecto de Supabase) */
const MAX_FILAS = 1000;
function pagina(lista, u) {
  const q = new URL(u).searchParams, orden = (q.get('order') || '').split('.')[0];
  const l = orden ? lista.slice().sort((a, b) => a[orden] < b[orden] ? -1 : a[orden] > b[orden] ? 1 : 0) : lista;
  const desde = Number(q.get('offset') || 0), cuantas = Math.min(Number(q.get('limit') || Infinity), MAX_FILAS);
  return l.slice(desde, desde + cuantas);
}

async function elEnvio() {
  console.log('\n=== 2 · el envio: que frase le llega a cada idioma ===');
  // web-push de mentira: apunta lo que se enviaria
  const enviados = [];
  const cargar = Module._load;
  Module._load = function (pedido, ...resto) {
    if (pedido === 'web-push') return {
      setVapidDetails() {},
      sendNotification: async (sub, payload) => { enviados.push({ endpoint: sub.endpoint, p: JSON.parse(payload) }); }
    };
    return cargar.call(this, pedido, ...resto);
  };
  // un martes de octubre a las 9:30 de Canarias (8:30 UTC, horario de verano)
  const AHORA = Date.parse('2026-10-20T08:30:00Z');
  const RealDate = Date;
  global.Date = class extends RealDate {
    constructor(...a) { if (!a.length) super(AHORA); else super(...a); }
    static now() { return AHORA; }
  };
  const subs = IDIOMAS.map(l => ({ endpoint: 'https://push.prueba.invalid/' + l, p256dh: 'k', auth: 'a', lang: l }))
    .concat([{ endpoint: 'https://push.prueba.invalid/xx', p256dh: 'k', auth: 'a', lang: 'xx' },
             { endpoint: 'https://push.prueba.invalid/nulo', p256dh: 'k', auth: 'a', lang: null }]);
  global.fetch = async (url) => {
    const u = String(url);
    if (u.includes('push_sends?select')) return { ok: true, status: 200, json: async () => [{ sent_date: '2026-10-19' }] };
    if (u.includes('push_sends')) return { ok: true, status: 201, text: async () => '' };
    if (u.includes('push_subs')) return { ok: true, status: 200, json: async () => pagina(subs, u) };
    return { ok: false, status: 500, text: async () => 'peticion no esperada: ' + u };
  };
  Object.assign(process.env, { SUPABASE_URL: 'https://ejemplo.supabase.invalid', SUPABASE_SERVICE_KEY: 'simulada',
    VAPID_PUBLIC: 'simulada', VAPID_PRIVATE: 'simulada', FORCE: '' });
  const log = console.log; const lineas = [];
  console.log = (...a) => lineas.push(a.join(' '));
  require(path.join(RAIZ, 'enviar-notificacion.js'));
  const t = RealDate.now() + 5000;
  while (enviados.length < subs.length && RealDate.now() < t) await new Promise(r => setTimeout(r, 20));
  await new Promise(r => setTimeout(r, 50));
  console.log = log;

  // la frase del dia, por cuenta propia: 20 de octubre de 2026 es el dia 293
  const dia = Math.floor((RealDate.UTC(2026, 9, 20) - RealDate.UTC(2026, 0, 0)) / 86400000);
  const frase = FRASES.frases[dia % FRASES.frases.length];
  ver(enviados.length === subs.length, 'sale una por suscripcion', '(' + enviados.length + ' de ' + subs.length + ')');
  for (const s of subs) {
    const quiere = (s.lang && frase[s.lang]) ? s.lang : 'es';
    const e = enviados.find(x => x.endpoint === s.endpoint);
    const ok = !!e && e.p.lang === quiere && e.p.title === FRASES.titulo[quiere] && e.p.body === frase[quiere];
    ver(ok, 'la suscripcion en «' + s.lang + '» recibe el titulo y la frase en «' + quiere + '»',
        ok ? '«' + e.p.body.slice(0, 50) + (e.p.body.length > 50 ? '…' : '') + '»' : JSON.stringify(e && e.p));
  }
  if (mal) console.log('   (lo que dijo el envio: ' + lineas.join(' · ') + ')');
}

async function muchos() {
  console.log('\n=== 3 · el envio con mas suscripciones de las que Supabase da en una peticion ===');
  const enviados = [];
  const cargar = Module._load;
  Module._load = function (pedido, ...resto) {
    if (pedido === 'web-push') return {
      setVapidDetails() {},
      sendNotification: async (sub, payload) => { enviados.push(sub.endpoint); }
    };
    return cargar.call(this, pedido, ...resto);
  };
  const subs = [];
  for (let i = 0; i < 2345; i++) subs.push({ endpoint: 'https://push.prueba.invalid/m' + String(i).padStart(5, '0'), p256dh: 'k', auth: 'a', lang: IDIOMAS[i % IDIOMAS.length] });
  let peticiones = 0;
  global.fetch = async (url) => {
    const u = String(url);
    if (u.includes('push_sends?select')) return { ok: true, status: 200, json: async () => [{ sent_date: '2026-10-19' }] };
    if (u.includes('push_sends')) return { ok: true, status: 201, text: async () => '' };
    if (u.includes('push_subs')) { peticiones++; return { ok: true, status: 200, json: async () => pagina(subs, u) }; }
    return { ok: false, status: 500, text: async () => 'peticion no esperada: ' + u };
  };
  const log = console.log; const lineas = [];
  console.log = (...a) => lineas.push(a.join(' '));
  delete require.cache[require.resolve(path.join(RAIZ, 'enviar-notificacion.js'))];
  require(path.join(RAIZ, 'enviar-notificacion.js'));
  /* Date sigue parado en el martes de la prueba 2: el plazo, con el reloj de verdad */
  const t = performance.now() + 20000;
  while (enviados.length < subs.length && performance.now() < t) await new Promise(r => setTimeout(r, 20));
  await new Promise(r => setTimeout(r, 100));
  console.log = log;
  const unicos = new Set(enviados);
  ver(enviados.length === subs.length && unicos.size === subs.length && subs.every(x => unicos.has(x.endpoint)),
      'a cada una de las 2.345 le llega una, y solo una', '(' + enviados.length + ' envios, ' + unicos.size + ' distintas, en ' + peticiones + ' peticiones de lectura)');
  ver(lineas.some(l => l.includes('Suscripciones: 2345')), 'y el registro del envio dice las 2.345', lineas.find(l => l.includes('Suscripciones')) || '');
  if (mal) console.log('   (lo que dijo el envio: ' + lineas.slice(0, 6).join(' · ') + ')');
}

/* ── 4, 5 y 6 · el consejo del domingo y el aviso del semaforo (24 de octubre
   de 2026). Los dos salen de las filas del panel SOS: aqui se leen por cuenta
   propia, del modulo, y se compara lo que le llega a cada idioma. ── */
const SOS_SRC = fs.readFileSync(path.join(RAIZ, 'modulos', 'emergencias.js'), 'utf8');
const FSOS = {};
for (const m of SOS_SRC.matchAll(/^\s*"(\w+)"\s*:\s*(\{"es":.*\})\s*,?\s*$/gm)) { try { FSOS[m[1]] = JSON.parse(m[2]); } catch (e) { /* no es una fila */ } }
const SOS_LOC = JSON.parse(/var SOS_LOCALE = (\{[^}]*\});/.exec(SOS_SRC)[1]);
const APP = 'https://jerome4551.github.io/tenerife-go/';
const os = require('os');

/* Corre enviar-notificacion.js con el reloj parado en `ahora`, Supabase y
   web-push de mentira y los argumentos de `modo`; devuelve lo que se envio. */
async function correr(modo, ahora, subs, env) {
  const enviados = [];
  const cargar = Module._load;
  Module._load = function (pedido, ...resto) {
    if (pedido === 'web-push') return {
      setVapidDetails() {},
      sendNotification: async (sub, payload, op) => { enviados.push({ endpoint: sub.endpoint, p: JSON.parse(payload), op }); }
    };
    return cargar.call(this, pedido, ...resto);
  };
  const RealDate = global.Date, T = Date.parse(ahora);
  const Real = RealDate.__real || RealDate;
  global.Date = class extends Real {
    constructor(...a) { if (!a.length) super(T); else super(...a); }
    static now() { return T; }
  };
  global.Date.__real = Real;
  global.fetch = async (url) => {
    const u = String(url);
    if (u.includes('push_sends?select')) return { ok: true, status: 200, json: async () => [{ sent_date: '2026-10-01' }] };
    if (u.includes('push_sends')) return { ok: true, status: 201, text: async () => '' };
    if (u.includes('push_subs')) return { ok: true, status: 200, json: async () => pagina(subs, u) };
    return { ok: false, status: 500, text: async () => 'peticion no esperada: ' + u };
  };
  const antesEnv = {};
  for (const [k, v] of Object.entries(env || {})) { antesEnv[k] = process.env[k]; process.env[k] = v; }
  const antesArgv = process.argv.slice();
  process.argv = [process.argv[0], 'enviar-notificacion.js'].concat(modo);
  const log = console.log; const lineas = [];
  console.log = (...a) => lineas.push(a.join(' '));
  try {
    delete require.cache[require.resolve(path.join(RAIZ, 'enviar-notificacion.js'))];
    require(path.join(RAIZ, 'enviar-notificacion.js'));
    const t = performance.now() + 15000;
    while (enviados.length < subs.length && performance.now() < t && modo[0] !== '--semaforo-decidir') await new Promise(r => setTimeout(r, 20));
    await new Promise(r => setTimeout(r, 60));
  } finally {
    console.log = log;
    process.argv = antesArgv;
    for (const [k, v] of Object.entries(antesEnv)) { if (v === undefined) delete process.env[k]; else process.env[k] = v; }
    global.Date = Real;
    Module._load = cargar;
  }
  return { enviados, lineas };
}
const subsIdiomas = pre => IDIOMAS.map(l => ({ endpoint: 'https://push.prueba.invalid/' + pre + l, p256dh: 'k', auth: 'a', lang: l }))
  .concat([{ endpoint: 'https://push.prueba.invalid/' + pre + 'xx', p256dh: 'k', auth: 'a', lang: 'xx' },
           { endpoint: 'https://push.prueba.invalid/' + pre + 'nulo', p256dh: 'k', auth: 'a', lang: null }]);

/* Los doce consejos, en su orden, copiados de enviar-notificacion.js a
   proposito: cambiar la lista alli sin mirar aqui lo canta este control. Solo
   filas que informan sin asustar (Jerome, 24 de octubre: «que no sea una
   alarma que asuste a la gente»). */
const CONSEJOS = [['esalert', 'sosGuiaEsAlert', 'sosEsa2'], ['visita', 'sosGuiaVisita', 'sosVis1'], ['esalert', 'sosGuiaEsAlert', 'sosEsa1'],
  ['semaforo', 'sosGuiaSemaforo', 'sosSemIntro'], ['plan', 'sosGuiaPlan', 'sosPlan1'], ['visita', 'sosGuiaVisita', 'sosVis3'],
  ['esalert', 'sosGuiaEsAlert', 'sosEsa5'], ['mochila', 'sosGuiaMochila', 'sosMocIntro'], ['visita', 'sosGuiaVisita', 'sosVis4'],
  ['montana', 'sosGuiaMontana', 'sosMon1'], ['esalert', 'sosGuiaEsAlert', 'sosEsa3'], ['esalert', 'sosGuiaEsAlert', 'sosEsa8']];

async function elDomingo() {
  console.log('\n=== 4 · los domingos, un consejo del panel SOS en vez de la frase ===');
  const guias = new Set([...SOS_SRC.matchAll(/\{ id: '([a-z]+)', t: '(sosGuia\w+)'/g)].map(m => m[1] + '/' + m[2]));
  for (const [g, t, f] of CONSEJOS) {
    const faltan = IDIOMAS.filter(l => !(FSOS[t] && FSOS[t][l]) || !(FSOS[f] && FSOS[f][l]));
    ok2(!faltan.length && guias.has(g + '/' + t), 'el consejo ' + g + '/' + f + ': su guia existe y sus dos filas estan en los ' + IDIOMAS.length + ' idiomas', faltan.join(' '));
  }
  // doce domingos seguidos desde el primero, y el decimotercero vuelve al primero
  for (let i = 0; i <= CONSEJOS.length; i++) {
    const dia = new Date(Date.UTC(2026, 9, 25 + 7 * i, 9, 30));
    const c = CONSEJOS[i % CONSEJOS.length];
    const subs = subsIdiomas('d' + i + '-');
    const { enviados, lineas } = await correr([], dia.toISOString(), subs, { FORCE: '' });
    const malos = [];
    for (const s of subs) {
      const l = (s.lang && FRASES.frases[0][s.lang]) ? s.lang : 'es';
      const e = enviados.find(x => x.endpoint === s.endpoint);
      const quiere = { title: FRASES.titulo[l], body: FSOS[c[1]][l] + '\n' + FSOS[c[2]][l], url: APP + '#sos-' + c[0], lang: l };
      if (!e || e.p.title !== quiere.title || e.p.body !== quiere.body || e.p.url !== quiere.url || e.p.lang !== l || e.p.tag !== undefined) malos.push(s.lang + ': ' + JSON.stringify(e && e.p));
    }
    ok2(enviados.length === subs.length && !malos.length, dia.toISOString().slice(0, 10) + ' (domingo): «' + FSOS[c[1]].es + '» · ' + c[2] +
        ', en el idioma de cada uno, con el titulo de cada dia y lleva a #sos-' + c[0], malos.slice(0, 2).join(' | ') + (malos.length ? '' : '') + (enviados.length !== subs.length ? ' (' + enviados.length + ' envios) ' + lineas.join(' · ') : ''));
  }
  // un lunes, la frase de siempre
  {
    const subs = subsIdiomas('lunes-');
    const { enviados } = await correr([], '2026-11-02T09:30:00Z', subs, { FORCE: '' });
    const dia = Math.floor((Date.UTC(2026, 10, 2) - Date.UTC(2026, 0, 0)) / 86400000);
    const frase = FRASES.frases[dia % FRASES.frases.length];
    ok2(enviados.length === subs.length && enviados.every(e => e.p.body === frase[e.p.lang] && e.p.url === APP), 'un lunes, la frase del dia de siempre');
  }
}

async function elSemaforoDecide() {
  console.log('\n=== 5 · el semaforo: cuando se avisa y cuando no ===');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tgo-aviso-'));
  const SEM = path.join(dir, 'semaforo.json'), EST = path.join(dir, 'estado.json'), AV = path.join(dir, 'aviso.json');
  const caso = async (que, actual, antes, ahora, quiereEstado, quiereAviso) => {
    fs.writeFileSync(SEM, JSON.stringify(actual));
    if (antes) fs.writeFileSync(EST, JSON.stringify(antes)); else { try { fs.unlinkSync(EST); } catch (e) {} }
    const { lineas } = await correr(['--semaforo-decidir', AV], ahora, [], { SEMAFORO_JSON: SEM, AVISO_ESTADO: EST });
    const estado = fs.existsSync(EST) ? JSON.parse(fs.readFileSync(EST, 'utf8')) : null;
    const aviso = fs.existsSync(AV) ? JSON.parse(fs.readFileSync(AV, 'utf8')) : null;
    const bien = JSON.stringify(estado) === JSON.stringify(quiereEstado) && JSON.stringify(aviso) === JSON.stringify(quiereAviso);
    ok2(bien, que, bien ? '«' + (lineas[0] || '') + '»' : JSON.stringify({ estado, aviso, lineas }));
  };
  const V23 = { boletin: '2026-10-23', color: 'verde' }, A30 = { boletin: '2026-10-30', color: 'amarillo' };
  await caso('la primera vez solo apunta el color: encenderlo no avisa', V23, null, '2026-10-24T10:00:00Z', V23, null);
  await caso('sigue verde con un boletin nuevo: nada', { boletin: '2026-10-30', color: 'verde' }, V23, '2026-10-30T10:00:00Z', V23, null);
  await caso('de verde a amarillo, de dia: se apunta y se avisa', A30, V23, '2026-10-30T10:00:00Z', A30, { boletin: '2026-10-30', color: 'amarillo', antes: 'verde' });
  await caso('de verde a amarillo a las 23 h de Canarias: espera a la primera vuelta del dia', A30, V23, '2026-10-30T23:30:00Z', V23, null);
  await caso('de verde a amarillo a las 7 h: tambien espera', A30, V23, '2026-10-31T07:10:00Z', V23, null);
  await caso('un boletin de hace mas de 8 dias no avisa (se apunta)', { boletin: '2026-10-10', color: 'amarillo' }, { boletin: '2026-10-02', color: 'verde' }, '2026-10-30T10:00:00Z', { boletin: '2026-10-10', color: 'amarillo' }, null);
  await caso('de amarillo a verde: tambien se avisa', { boletin: '2026-11-06', color: 'verde' }, A30, '2026-11-06T09:00:00Z', { boletin: '2026-11-06', color: 'verde' }, { boletin: '2026-11-06', color: 'verde', antes: 'amarillo' });
  await caso('un boletin anterior al ya avisado no avisa', V23, A30, '2026-10-31T10:00:00Z', A30, null);
  await caso('un fichero que no se entiende no avisa ni apunta', { boletin: '2026-10-30', color: 'morado' }, V23, '2026-10-30T10:00:00Z', V23, null);
  fs.rmSync(dir, { recursive: true, force: true });
}

async function elSemaforoEnvia() {
  console.log('\n=== 6 · el aviso del semaforo: que le llega a cada idioma ===');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tgo-aviso-'));
  const AV = path.join(dir, 'aviso.json');
  for (const color of ['amarillo', 'verde']) {
    const aviso = { boletin: '2026-10-30', color, antes: color === 'verde' ? 'amarillo' : 'verde' };
    fs.writeFileSync(AV, JSON.stringify(aviso));
    const subs = subsIdiomas('s-' + color + '-');
    const { enviados, lineas } = await correr(['--semaforo-enviar', AV], '2026-10-30T10:00:00Z', subs, {});
    const C = color.charAt(0).toUpperCase() + color.slice(1);
    const malos = [];
    for (const s of subs) {
      const l = IDIOMAS.indexOf(s.lang) >= 0 ? s.lang : 'es';
      const fecha = new Intl.DateTimeFormat(SOS_LOC[l], { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Atlantic/Canary' }).format(new Date(Date.UTC(2026, 9, 30, 12)));
      const quiere = { title: FSOS.sosGuiaSemaforo[l],
        body: FSOS.sosSemaforoBoletin[l].replace('{f}', fecha).replace('{c}', FSOS['sosColor_' + color][l]) + '\n' + FSOS['sosSem' + C + 'Q'][l],
        url: APP + '#sos-semaforo', lang: l, tag: 'tgo-semaforo' };
      const e = enviados.find(x => x.endpoint === s.endpoint);
      if (!e || JSON.stringify(e.p) !== JSON.stringify(quiere) || e.op.TTL !== 24 * 3600 || /[{}]/.test(e.p.body)) malos.push(s.lang + ': ' + JSON.stringify(e && e.p));
    }
    ok2(enviados.length === subs.length && !malos.length, 'semaforo ' + color + ': a cada idioma, «' + FSOS.sosGuiaSemaforo.es + '», la linea del boletin con su fecha y lo que pide el color, y lleva a #sos-semaforo',
        malos.slice(0, 2).join(' | ') + (enviados.length !== subs.length ? ' (' + enviados.length + ' envios) ' + lineas.join(' · ') : ''));
    if (color === 'amarillo') {
      const es = enviados.find(x => x.p.lang === 'es');
      console.log('         es: ' + (es ? es.p.title + ' · ' + es.p.body.replace('\n', ' · ') : '-'));
    }
  }
  // con mas suscripciones de las que Supabase da en una peticion
  {
    fs.writeFileSync(AV, JSON.stringify({ boletin: '2026-10-30', color: 'amarillo', antes: 'verde' }));
    const subs = [];
    for (let i = 0; i < 1500; i++) subs.push({ endpoint: 'https://push.prueba.invalid/sm' + String(i).padStart(5, '0'), p256dh: 'k', auth: 'a', lang: IDIOMAS[i % IDIOMAS.length] });
    const { enviados } = await correr(['--semaforo-enviar', AV], '2026-10-30T10:00:00Z', subs, {});
    const unicos = new Set(enviados.map(e => e.endpoint));
    ok2(enviados.length === 1500 && unicos.size === 1500, 'con 1.500 suscripciones, a cada una le llega el aviso una vez', enviados.length + ' envios, ' + unicos.size + ' distintas');
  }
  fs.rmSync(dir, { recursive: true, force: true });
}
const ok2 = (cond, que, detalle) => ver(cond, que, cond ? (detalle && detalle.startsWith('«') ? detalle : '') : detalle);

(async () => {
  await laApp();
  await elEnvio();
  await muchos();
  await elDomingo();
  await elSemaforoDecide();
  await elSemaforoEnvia();
  console.log(mal ? '\n*** ' + mal + ' comprobacion(es) de la notificacion en su idioma, en rojo ***'
                  : '\ncada movil recibe la notificacion en su idioma, y la sigue si lo cambia');
  process.exit(mal ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
