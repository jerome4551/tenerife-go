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
  const nav = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await nav.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } });
  const pg = await ctx.newPage();
  await pg.route('**/cdn.jsdelivr.net/**', r => r.abort());
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
  await nav.close();
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
    if (u.includes('push_subs')) return { ok: true, status: 200, json: async () => subs };
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

(async () => {
  await laApp();
  await elEnvio();
  console.log(mal ? '\n*** ' + mal + ' comprobacion(es) de la notificacion en su idioma, en rojo ***'
                  : '\ncada movil recibe la notificacion en su idioma, y la sigue si lo cambia');
  process.exit(mal ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
