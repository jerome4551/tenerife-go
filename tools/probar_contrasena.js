#!/usr/bin/env node
/* probar_contrasena.js — la contraseña al crear la cuenta (10 de noviembre de 2026; Jerome, opción «B» para las
 * contraseñas filtradas, que el plan gratuito de Supabase no trae). En un navegador de verdad, con un Supabase falso y la
 * respuesta de Have I Been Pwned de pega: la red de verdad no se toca.
 *   · con menos de 8 caracteres: el aviso de los 8, y ni se pregunta al servicio ni se crea la cuenta;
 *   · una contraseña que ha salido en filtraciones: su aviso, y no se crea la cuenta;
 *   · a Have I Been Pwned solo le llegan los 5 primeros caracteres de la huella SHA-1 (la ruta /range/XXXXX, con
 *     Add-Padding), nunca la contraseña ni el correo, ni cookies ni de dónde viene (Referer);
 *   · una que no ha salido (tampoco si su huella viene en el relleno, con la cuenta 0): se crea la cuenta, una vez;
 *   · si el servicio no contesta: se crea igual (no se impide por eso);
 *   · al entrar en una cuenta que ya existe no se pregunta nada, y una de 6 sigue valiendo;
 *   · los tres textos nuevos, en los diez idiomas, y el aviso en el idioma de la app; el campo de crear cuenta pide 8 y
 *     su texto de ayuda lo dice.
 *     node tools/probar_contrasena.js PUERTO */
'use strict';
const { chromium } = require('playwright');
const crypto = require('crypto');

const PUERTO = process.argv[2] || '8766';
const BASE = 'http://127.0.0.1:' + PUERTO + '/index.html';
const IDIOMAS = ['es', 'en', 'fr', 'de', 'it', 'nl', 'zh', 'zht', 'bg', 'pl'];
const HIBP = 'https://api.pwnedpasswords.com/';

let malos = 0, total = 0;
const prueba = (nombre, ok, detalle) => {
  total++;
  if (!ok) malos++;
  console.log((ok ? '  ok   ' : ' FALLA ') + nombre + (ok || !detalle ? '' : '\n        ' + String(detalle).slice(0, 600)));
};

const sha1 = s => crypto.createHash('sha1').update(s, 'utf8').digest('hex').toUpperCase();
/* una respuesta como las de verdad: entre 800 y 1000 líneas «SUFIJO:CUENTA», con relleno de cuenta 0 */
function respuesta(prefijo, extra) {
  const lineas = [];
  for (let i = 0; i < 850; i++) lineas.push(crypto.createHash('sha1').update(prefijo + ':' + i).digest('hex').toUpperCase().slice(5) + ':' + (i % 3 ? i : 0));
  extra.forEach(x => lineas.push(x));
  return lineas.sort().join('\r\n');
}

/* El Supabase falso (dentro de la página, sin nada de fuera): apunta cada cuenta que se intenta crear y cada entrada */
function supabaseFalso(cfg) {
  window.__sb = { signUps: [], entradas: [] };
  const vacio = { data: [], error: null };
  const consulta = () => {
    const q = {};
    for (const m of ['select', 'eq', 'neq', 'in', 'order', 'limit', 'match', 'is', 'delete', 'update']) q[m] = () => q;
    q.upsert = async () => vacio; q.insert = async () => vacio;
    q.single = async () => ({ data: null, error: null });
    q.maybeSingle = async () => ({ data: null, error: null });
    q.then = (ok, mal) => Promise.resolve(vacio).then(ok, mal);
    return q;
  };
  const cliente = {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      signOut: async () => ({ error: null }),
      signInWithPassword: async o => { window.__sb.entradas.push({ largo: (o.password || '').length }); return { data: null, error: { message: 'Invalid login credentials' } }; },
      signUp: async o => { window.__sb.signUps.push({ email: o.email, largo: (o.password || '').length }); return { data: { user: null, session: null }, error: null }; }
    },
    from: () => consulta(),
    rpc: async () => ({ data: null, error: null })
  };
  Object.defineProperty(window, 'supabase', { value: { createClient: () => cliente }, writable: false });
  try {
    localStorage.setItem('tenerife.tour.seen', '99');
    localStorage.setItem('tenerife.welcome.seen', '1');
    localStorage.setItem('tgo_consent', JSON.stringify({ v: 'denied', t: Date.now() }));
    localStorage.setItem('tenerife.lang', cfg.lang || 'es');
  } catch (e) {}
}

(async () => {
  const nav = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  /* modo: 'filtrada', 'limpia', 'relleno' (la huella viene, con la cuenta 0) o 'cae' (el servicio no contesta) */
  const abrir = async (lang) => {
    const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
    const pg = await ctx.newPage();
    const st = { errores: [], pedidas: [], modo: 'limpia', clave: '' };
    pg.on('pageerror', e => st.errores.push(e.message));
    await pg.route('**/vendor/supabase.js', r => r.abort());
    await pg.route('**/router.project-osrm.org/**', r => r.abort());
    await pg.route(HIBP + '**', r => {
      const q = r.request(), h = q.headers();
      if (q.method() === 'OPTIONS') return r.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'Add-Padding', 'access-control-allow-methods': 'GET' } });
      st.pedidas.push({ url: q.url(), metodo: q.method(), h });
      if (st.modo === 'cae') return r.abort('internetdisconnected');
      const huella = sha1(st.clave), prefijo = q.url().slice((HIBP + 'range/').length);
      const extra = st.modo === 'filtrada' ? [huella.slice(5) + ':12345'] : st.modo === 'relleno' ? [huella.slice(5) + ':0'] : [];
      return r.fulfill({ status: 200, contentType: 'text/plain; charset=utf-8', headers: { 'access-control-allow-origin': '*' }, body: respuesta(prefijo, extra) });
    });
    await pg.addInitScript(supabaseFalso, { lang });
    await pg.goto(BASE, { waitUntil: 'networkidle' });
    await pg.waitForFunction(() => window.AppAuth && window.AppAuth.isReady(), null, { timeout: 30000 });
    await pg.evaluate(l => setLang(l), lang);
    await pg.waitForTimeout(300);
    return { ctx, pg, st };
  };
  const crear = async (pg, st, email, clave, modo) => {
    st.modo = modo; st.clave = clave;
    await pg.evaluate(() => { openAuthModal(); });
    await pg.click('#auth-tab-signup');
    await pg.fill('#auth-signup-email', email);
    await pg.fill('#auth-signup-password', clave);
    const antes = st.pedidas.length;
    await pg.evaluate(() => { document.getElementById('auth-signup-msg').textContent = ''; window.__sb.signUps.length = 0; });
    await pg.click('#auth-signup-submit');
    await pg.waitForFunction(() => document.getElementById('auth-signup-msg').textContent.trim() !== '', null, { timeout: 15000 }).catch(() => {});
    await pg.waitForTimeout(150);
    const r = await pg.evaluate(() => ({ msg: document.getElementById('auth-signup-msg').textContent.trim(), cuentas: window.__sb.signUps.slice() }));
    r.pedidas = st.pedidas.slice(antes);
    return r;
  };
  const T = (pg, l) => pg.evaluate(l => { const o = LANGS[l] || {}; return { ph8: o.authPasswordPlaceholder8, corta8: o.authErrorCorta8, filtrada: o.authErrorFiltrada, ph6: o.authPasswordPlaceholder }; }, l);

  console.log('\n=== 1. crear la cuenta, en castellano ===');
  {
    const { ctx, pg, st } = await abrir('es');
    const tx = await T(pg, 'es');
    const csp = await pg.evaluate(() => (document.querySelector('meta[http-equiv="Content-Security-Policy"]') || {}).content || '');
    prueba('la CSP deja pedir a Have I Been Pwned (connect-src https://api.pwnedpasswords.com)', /connect-src [^;]*https:\/\/api\.pwnedpasswords\.com[ ;]/.test(csp));
    const campo = await pg.evaluate(() => { const e = document.getElementById('auth-signup-password'), i = document.getElementById('auth-login-password'); return { min: e.minLength, ph: e.placeholder, minEntrar: i.minLength, phEntrar: i.placeholder }; });
    prueba('el campo de crear cuenta pide 8 y lo dice («' + campo.ph + '»); el de entrar sigue en 6', campo.min === 8 && campo.ph === tx.ph8 && /8/.test(campo.ph) && campo.minEntrar === 6 && campo.phEntrar === tx.ph6, JSON.stringify(campo));

    const c7 = await crear(pg, st, 'prueba@ejemplo.com', 'Abc1234', 'limpia');
    prueba('con 7 caracteres: «' + tx.corta8 + '», sin preguntar al servicio y sin crear la cuenta', c7.msg === tx.corta8 && !c7.pedidas.length && !c7.cuentas.length, JSON.stringify(c7));

    const mala = 'password1234';
    const cf = await crear(pg, st, 'prueba@ejemplo.com', mala, 'filtrada');
    prueba('una contraseña que ha salido en filtraciones: «' + tx.filtrada + '», y no se crea la cuenta', cf.msg === tx.filtrada && !cf.cuentas.length, JSON.stringify(cf));
    const p = cf.pedidas[0] || { url: '', h: {} }, h = p.h || {};
    prueba('a Have I Been Pwned le llega una sola petición: GET /range/ con los 5 primeros caracteres de la huella SHA-1 (' + sha1(mala).slice(0, 5) + ')',
      cf.pedidas.length === 1 && p.metodo === 'GET' && p.url === HIBP + 'range/' + sha1(mala).slice(0, 5), JSON.stringify(cf.pedidas.map(x => x.url)));
    const sale = JSON.stringify(cf.pedidas);
    prueba('con el relleno pedido (Add-Padding: true), sin la contraseña, ni su huella entera, ni el correo, ni cookies, ni Referer',
      String(h['add-padding']).toLowerCase() === 'true' && sale.indexOf(mala) < 0 && sale.indexOf(sha1(mala)) < 0 && sale.indexOf(sha1(mala).slice(5)) < 0 &&
      sale.indexOf('prueba@ejemplo.com') < 0 && !h.cookie && !h.referer, JSON.stringify(h));

    const buena = 'Mirador-de-Anaga-2026';
    const cl = await crear(pg, st, 'buena@ejemplo.com', buena, 'limpia');
    prueba('una que no ha salido: se crea la cuenta, una vez, con su correo', cl.cuentas.length === 1 && cl.cuentas[0].email === 'buena@ejemplo.com' && cl.cuentas[0].largo === buena.length && cl.pedidas.length === 1, JSON.stringify(cl));
    const cr = await crear(pg, st, 'relleno@ejemplo.com', buena, 'relleno');
    prueba('si su huella viene en el relleno (con la cuenta 0), no cuenta como filtrada: se crea', cr.cuentas.length === 1 && cr.msg !== tx.filtrada, JSON.stringify(cr));
    const cc = await crear(pg, st, 'sinred@ejemplo.com', buena, 'cae');
    prueba('si el servicio no contesta, no se impide crear la cuenta', cc.cuentas.length === 1 && cc.pedidas.length === 1, JSON.stringify(cc));

    /* entrar en una cuenta que ya existe: nada de Have I Been Pwned, y una de 6 sigue valiendo */
    st.modo = 'limpia';
    await pg.evaluate(() => { openAuthModal(); });
    await pg.click('#auth-tab-login');
    await pg.fill('#auth-login-email', 'vieja@ejemplo.com');
    await pg.fill('#auth-login-password', 'abc123');
    const antes = st.pedidas.length;
    await pg.click('#auth-login-submit');
    await pg.waitForFunction(() => document.getElementById('auth-login-msg').textContent.trim() !== '', null, { timeout: 15000 }).catch(() => {});
    const ent = await pg.evaluate(() => window.__sb.entradas.slice());
    prueba('al entrar no se pregunta a Have I Been Pwned, y una contraseña de 6 llega a Supabase como antes', st.pedidas.length === antes && ent.length === 1 && ent[0].largo === 6, JSON.stringify({ pedidas: st.pedidas.length - antes, ent }));
    prueba('sin errores de página', !st.errores.length, st.errores.join(' | '));
    await ctx.close();
  }

  console.log('\n=== 2. los textos nuevos, en los diez idiomas ===');
  {
    const { ctx, pg, st } = await abrir('es');
    const tx = {};
    for (const l of IDIOMAS) tx[l] = await T(pg, l);
    const faltan = IDIOMAS.filter(l => !tx[l].ph8 || !tx[l].corta8 || !tx[l].filtrada);
    prueba('los tres textos (la ayuda de los 8, el aviso de los 8 y el de la filtrada), en los diez idiomas', !faltan.length, faltan.join(', '));
    const iguales = IDIOMAS.filter(l => l !== 'es' && (tx[l].corta8 === tx.es.corta8 || tx[l].filtrada === tx.es.filtrada || tx[l].ph8 === tx.es.ph8));
    prueba('ninguno copiado del castellano', !iguales.length, iguales.join(', '));
    const conOcho = IDIOMAS.filter(l => !/8/.test(tx[l].ph8) || !/8/.test(tx[l].corta8));
    prueba('la ayuda y el aviso dicen 8 en los diez', !conOcho.length, conOcho.join(', '));
    const alfabeto = [['zh', /[一-鿿]/], ['zht', /[一-鿿]/], ['bg', /[Ѐ-ӿ]/]].filter(([l, re]) => !re.test(tx[l].filtrada) || !re.test(tx[l].corta8));
    prueba('en chino, chino tradicional y búlgaro, con su alfabeto', !alfabeto.length, alfabeto.map(x => x[0]).join(', '));
    prueba('el chino tradicional, con los suyos (no el simplificado)', tx.zht.filtrada !== tx.zh.filtrada && tx.zht.corta8 !== tx.zh.corta8, JSON.stringify([tx.zh.filtrada, tx.zht.filtrada]));
    await ctx.close();
    /* y el aviso sale en el idioma de la app: en alemán y en búlgaro */
    for (const l of ['de', 'bg']) {
      const a = await abrir(l), t = await T(a.pg, l);
      const r = await crear(a.pg, a.st, 'prueba@ejemplo.com', 'password1234', 'filtrada');
      const ph = await a.pg.evaluate(() => document.getElementById('auth-signup-password').placeholder);
      prueba('en ' + l + ': el aviso de la filtrada en su idioma («' + t.filtrada + '») y la ayuda de los 8 («' + ph + '»)', r.msg === t.filtrada && ph === t.ph8 && !r.cuentas.length, JSON.stringify(r));
      prueba('en ' + l + ': sin errores de página', !a.st.errores.length, a.st.errores.join(' | '));
      await a.ctx.close();
    }
  }

  await nav.close();
  console.log('\n' + total + ' controles' + (malos ? ', ' + malos + ' EN ROJO' : ', todos en verde'));
  process.exit(malos ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
