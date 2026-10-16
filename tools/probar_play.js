#!/usr/bin/env node
/* probar_play.js — lo que hace falta para Google Play (LANZAMIENTO-PLAY.md,
 * Fase 1), en un navegador de verdad. Desde el 16 de octubre de 2026.
 *
 * 1.1 LA TIENDA, FUERA DE LA VISTA
 *   · en los diez idiomas, a 390x844: la barra de abajo sin el boton de la
 *     tienda, y los cinco que quedan dentro de la pantalla y con su rotulo
 *     entero; el boton «Administrador» con su rotulo traducido;
 *   · ni la tienda ni la cesta se abren desde ninguna parte, tampoco con
 *     articulos de antes guardados en el movil;
 *   · ninguna de las siete tarjetas inventadas ni el hueco de AdSense;
 *   · «⚙️ Administrador», en la cuenta: lo ve un administrador y nadie mas, y
 *     abre su panel.
 *
 * 1.2 BORRAR LA CUENTA
 *   · en los diez idiomas: «Eliminar cuenta» debajo de «Cerrar sesion», la
 *     confirmacion con sus tres textos, y «Cancelar» que no borra nada;
 *   · si el servidor no borra (false, error o sin red): la sesion sigue y
 *     sale el enlace a borrar-cuenta.html, en el idioma de la app;
 *   · si borra: una sola llamada, cierre de sesion SOLO local
 *     (signOut({ scope: 'local' })) y el mensaje de hecho;
 *   · la politica dice como borrarla, con los botones tal cual y el enlace;
 *   · borrar-cuenta.html se lee entera SIN JavaScript, idioma a idioma, con
 *     los cuatro botones que cita escritos como en la app; y con JavaScript
 *     se abre sola en el idioma de la app, o en el del navegador.
 *
 * Supabase no esta aqui: se le da a la app un cliente falso, con la sesion y
 * las respuestas que toca en cada caso (sin sesion, con sesion normal, con
 * sesion de administrador). La app lo usa igual que el de verdad.
 *
 *     node tools/probar_play.js [puerto]
 */
'use strict';
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');
const PUERTO = process.argv[2] || '8766';
const BASE = 'http://127.0.0.1:' + PUERTO + '/index.html';
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const IDIOMAS = ((html.match(/SUPPORTED_LANGS\s*=\s*\[([^\]]*)\]/) || [, ''])[1])
  .split(',').map(x => x.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);

let malos = 0, total = 0;
const caso = (nombre, ok, detalle) => {
  total++;
  if (!ok) malos++;
  console.log((ok ? '  ok   ' : ' FALLA ') + nombre + (ok || !detalle ? '' : '\n        ' + String(detalle).slice(0, 600)));
};

/* El cliente falso de Supabase. Va dentro de la pagina (addInitScript), asi
   que no puede usar nada de fuera: lo que necesita, en `cfg`. */
function supabaseFalso(cfg) {
  // respuestas: lo que contesta cada rpc; la prueba lo cambia en marcha.
  // 'lanzar' imita que no hay red: la llamada revienta.
  window.__sb = { rpcs: [], signOuts: [], respuestas: Object.assign({}, cfg.rpc || {}) };
  const vacio = { data: [], error: null };
  const consulta = () => {
    const q = {};
    for (const m of ['select', 'eq', 'neq', 'in', 'order', 'limit', 'match', 'is', 'delete', 'update'])
      q[m] = () => q;
    q.upsert = async () => vacio; q.insert = async () => vacio;
    q.single = async () => ({ data: null, error: null });
    q.maybeSingle = async () => ({ data: null, error: null });
    q.then = (ok, mal) => Promise.resolve(vacio).then(ok, mal);
    return q;
  };
  const oyentes = [];
  const cliente = {
    auth: {
      getSession: async () => ({ data: { session: cfg.user ? { user: cfg.user } : null }, error: null }),
      onAuthStateChange: cb => { oyentes.push(cb); return { data: { subscription: { unsubscribe() {} } } }; },
      signOut: async opts => {
        window.__sb.signOuts.push(opts || null);
        oyentes.forEach(cb => { try { cb('SIGNED_OUT', null); } catch (e) {} });
        return { error: null };
      },
      signInWithPassword: async () => ({ data: null, error: { message: 'prueba' } }),
      signUp: async () => ({ data: null, error: { message: 'prueba' } })
    },
    from: () => consulta(),
    rpc: async nombre => {
      window.__sb.rpcs.push(nombre);
      if (nombre === 'es_admin') return { data: !!cfg.esAdmin, error: null };
      const resp = window.__sb.respuestas[nombre];
      if (resp === 'lanzar') throw new TypeError('Failed to fetch');
      if (resp !== undefined) return resp;
      return { data: null, error: { message: 'rpc ' + nombre + ' no simulada' } };
    }
  };
  Object.defineProperty(window, 'supabase', { value: { createClient: () => cliente }, writable: false });
  // articulos de antes en la cesta: no pueden sacarla a la vista
  try {
    localStorage.setItem('tenerife.cart.anonymous', JSON.stringify([{ id: 'camiseta', name: 'Camiseta', price: 24.99, qty: 2 }]));
    localStorage.setItem('tenerife.tour.seen', '99');
    localStorage.setItem('tenerife.welcome.seen', '1');
    localStorage.setItem('tgo_consent', JSON.stringify({ v: 'denied', t: Date.now() }));
    localStorage.setItem('tenerife.lang', cfg.lang || 'es');
  } catch (e) {}
}

(async () => {
  const nav = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const abrir = async (cfg) => {
    const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
    const pg = await ctx.newPage();
    const errores = [];
    pg.on('pageerror', e => errores.push(e.message));
    // el SDK de verdad no entra: se queda el falso
    await pg.route('**/cdn.jsdelivr.net/**', r => r.abort());
    await pg.route('**/router.project-osrm.org/**', r => r.abort());
    await pg.addInitScript(supabaseFalso, cfg);
    await pg.goto(BASE, { waitUntil: 'networkidle' });
    await pg.waitForFunction(() => window.AppAuth && window.AppAuth.isReady(), null, { timeout: 30000 });
    // siempre: sin esto arranca en el idioma del navegador (en la prueba, ingles)
    await pg.evaluate(l => setLang(l), cfg.lang || 'es');
    await pg.waitForTimeout(300);
    return { ctx, pg, errores };
  };

  console.log('\n=== 1.1 la tienda, fuera de la vista ===');
  // ── la barra de abajo y el rotulo del administrador, en los diez idiomas
  for (const L of IDIOMAS) {
    const { ctx, pg, errores } = await abrir({ lang: L, user: null });
    const r = await pg.evaluate(() => {
      const vis = el => !!el && getComputedStyle(el).display !== 'none' && el.getBoundingClientRect().width > 0;
      const barra = document.querySelector('.v19-bottom-nav');
      const items = [...barra.querySelectorAll('.v19-nav-item')];
      const visibles = items.filter(vis);
      const anchoVentana = document.documentElement.clientWidth;
      const cortados = visibles.filter(b => {
        const sp = b.querySelector('span[id^="nav-lbl-"]');
        const rb = b.getBoundingClientRect();
        return !sp || sp.scrollWidth > sp.clientWidth + 1 || rb.left < -1 || rb.right > anchoVentana + 1;
      }).map(b => b.id + ': ' + (b.querySelector('span[id^="nav-lbl-"]') || {}).textContent);
      const adm = document.getElementById('auth-admin-btn');
      return {
        tienda: vis(document.getElementById('v19-nav-shop')),
        visibles: visibles.map(b => b.id),
        rotulos: visibles.map(b => (b.querySelector('span[id^="nav-lbl-"]') || {}).textContent),
        cortados, desborda: barra.scrollWidth > barra.clientWidth + 1,
        admRotulo: adm ? adm.textContent.trim() : null,
        admFila: (UI_TX.admBtnAdmin || {})[currentLang] || ''
      };
    });
    caso(`[${L}] la barra de abajo, sin la tienda: ${r.visibles.length} botones dentro y con su rotulo entero (${r.rotulos.join(' · ')})`,
      !r.tienda && r.visibles.length === 5 && !r.visibles.includes('v19-nav-shop') && r.cortados.length === 0 && !r.desborda,
      JSON.stringify(r));
    caso(`[${L}] el boton de administrador, con su rotulo en el idioma («${r.admRotulo}»)`, !!r.admRotulo && r.admRotulo === r.admFila, JSON.stringify([r.admRotulo, r.admFila]));
    caso(`[${L}] sin errores de pagina`, errores.length === 0, errores.join(' / '));
    await ctx.close();
  }

  // ── ni la tienda ni la cesta se abren, ni hay nada inventado
  {
    const { ctx, pg, errores } = await abrir({ lang: 'es', user: null });
    const r = await pg.evaluate(async () => {
      const espera = ms => new Promise(res => setTimeout(res, ms));
      const abierto = id => { const el = document.getElementById(id); return !!el && (el.classList.contains('open') || el.getAttribute('aria-hidden') === 'false'); };
      const cesta = document.getElementById('cart-btn');
      const out = {};
      out.cestaGuardada = getCart().length;
      out.cestaAlArrancar = cesta.classList.contains('visible') || getComputedStyle(cesta).display !== 'none' && getComputedStyle(cesta).opacity !== '0' && cesta.classList.contains('visible');
      try { openShopPanel(); } catch (e) {}
      await espera(400);
      out.tienda = abierto('shop-panel');
      try { openCartPanel(); } catch (e) {}
      try { document.getElementById('shop-cart-header-btn').click(); } catch (e) {}
      try { document.getElementById('cart-btn').click(); } catch (e) {}
      try { document.getElementById('v19-nav-shop').click(); } catch (e) {}
      await espera(400);
      out.cesta = abierto('cart-panel');
      out.tienda2 = abierto('shop-panel');
      updateCartUI();
      out.botonCesta = cesta.classList.contains('visible');
      out.tarjetas = document.querySelectorAll('[data-excursion-id], [data-souvenir-id]').length;
      // el texto de la pagina, no sus comentarios ni sus scripts
      const textos = []; const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let n; while ((n = w.nextNode())) { const p = n.parentElement; if (p && !p.closest('script,style')) textos.push(n.nodeValue); }
      out.adsense = !!document.getElementById('shop-ad-slot') || /AdSense/i.test(textos.join(' '));
      out.tiendaActiva = typeof TIENDA_ACTIVA === 'undefined' ? 'sin constante' : TIENDA_ACTIVA;
      return out;
    });
    caso('TIENDA_ACTIVA existe y vale false', r.tiendaActiva === false, JSON.stringify(r));
    caso(`con ${r.cestaGuardada} articulo(s) de antes en la cesta, el boton de la cesta no sale`, r.cestaGuardada > 0 && !r.cestaAlArrancar && !r.botonCesta, JSON.stringify(r));
    caso('ni la tienda ni la cesta se abren: ni por su funcion, ni por sus botones', !r.tienda && !r.tienda2 && !r.cesta, JSON.stringify(r));
    caso('ninguna tarjeta inventada ni el hueco de AdSense', r.tarjetas === 0 && !r.adsense, JSON.stringify(r));
    caso('sin errores de pagina (tienda)', errores.length === 0, errores.join(' / '));
    await ctx.close();
  }

  // ── «⚙️ Administrador», en la cuenta: solo para quien lo es
  const cuenta = async (cfg, nombre) => {
    const { ctx, pg, errores } = await abrir(Object.assign({ lang: 'es' }, cfg));
    await pg.waitForFunction(u => !!window.AppAuth.isLoggedIn() === u, !!cfg.user, { timeout: 10000 }).catch(() => {});
    const r = await pg.evaluate(async () => {
      const espera = ms => new Promise(res => setTimeout(res, ms));
      openAuthModal(); await espera(400);
      const b = document.getElementById('auth-admin-btn');
      const out = { logueado: window.AppAuth.isLoggedIn(), enLaCuenta: !!b && !!b.closest('#auth-form-logged'),
                    visible: !!b && !b.hidden && b.getBoundingClientRect().height > 0, rpcs: window.__sb.rpcs.slice() };
      if (out.visible) {
        b.click(); await espera(500);
        out.panel = document.getElementById('admin-overlay').classList.contains('open');
        out.cuentaCerrada = !document.getElementById('auth-modal-backdrop').classList.contains('show');
        out.vista = getComputedStyle(document.getElementById('admin-main-view')).display;
      }
      return out;
    });
    await ctx.close();
    return Object.assign(r, { errores, nombre });
  };
  {
    const sin = await cuenta({ user: null }, 'sin sesion');
    caso('sin sesion: el boton de administrador no sale', !sin.visible && sin.enLaCuenta, JSON.stringify(sin));
    const normal = await cuenta({ user: { id: 'u-normal', email: 'normal@prueba.es' }, esAdmin: false }, 'cuenta normal');
    caso('con una cuenta normal: no sale (la base de datos dice que no es administradora)',
      normal.logueado && !normal.visible && normal.rpcs.includes('es_admin'), JSON.stringify(normal));
    const admin = await cuenta({ user: { id: 'u-admin', email: 'admin@prueba.es' }, esAdmin: true }, 'administrador');
    caso('con la cuenta de administrador: sale en la cuenta, y abre su panel',
      admin.logueado && admin.visible && admin.enLaCuenta && admin.panel && admin.cuentaCerrada && admin.vista === 'block', JSON.stringify(admin));
    caso('sin errores de pagina (cuenta)', [sin, normal, admin].every(x => x.errores.length === 0),
      [sin, normal, admin].map(x => x.nombre + ': ' + x.errores.join(' / ')).join(' | '));
  }

  console.log('\n=== 1.2 borrar la cuenta ===');
  const R = require('./rotulos_app');
  const comillas = L => (L === 'zh' || L === 'zht') ? ['「', '」'] : ['«', '»'];
  // ── en la app, en los diez idiomas: el boton, la confirmacion, los fallos y el borrado
  for (const L of IDIOMAS) {
    const { ctx, pg, errores } = await abrir({ lang: L, user: { id: 'u-' + L, email: L + '@prueba.es' }, esAdmin: false });
    await pg.waitForFunction(() => window.AppAuth.isLoggedIn(), null, { timeout: 10000 }).catch(() => {});
    const r = await pg.evaluate(async () => {
      const espera = ms => new Promise(res => setTimeout(res, ms));
      const $ = id => document.getElementById(id);
      const vis = el => !!el && !el.hidden && getComputedStyle(el).display !== 'none' && el.getBoundingClientRect().height > 0;
      const entero = el => el.scrollWidth <= el.clientWidth + 1;
      const fila = k => (UI_TX[k] || {})[currentLang] || '';
      const claves = ['cuentaBorrarBtn', 'cuentaBorrarAviso', 'cuentaBorrarSi', 'cuentaBorrarNo', 'cuentaBorrada', 'cuentaBorrarError', 'cuentaBorrarPagina'];
      const out = { fila: {}, comoCastellano: [] };
      for (const k of claves) {
        out.fila[k] = fila(k);
        if (currentLang !== 'es' && out.fila[k] === (UI_TX[k] || {}).es) out.comoCastellano.push(k);
      }
      openAuthModal(); await espera(400);
      const btn = $('auth-borrar-btn'), caja = $('auth-borrar-confirm'), si = $('auth-borrar-si'),
            no = $('auth-borrar-no'), msg = $('auth-borrar-msg'), salir = $('auth-logout-btn');
      out.btn = { visible: vis(btn), texto: btn.textContent.trim(), entero: entero(btn),
                  debajo: salir.getBoundingClientRect().bottom <= btn.getBoundingClientRect().top + 1 };
      out.cajaAntes = vis(caja);
      // 1. confirmar y cancelar
      btn.click(); await espera(150);
      out.confirma = { visible: vis(caja), aviso: caja.querySelector('p').textContent.trim(), si: si.textContent.trim(),
                       no: no.textContent.trim(), btnEscondido: !vis(btn), enteros: [si, no].every(entero) };
      no.click(); await espera(150);
      const llamadas = () => window.__sb.rpcs.filter(n => n === 'borrar_mi_cuenta').length;
      out.cancelar = { caja: vis(caja), btn: vis(btn), llamadas: llamadas(), sesion: window.AppAuth.isLoggedIn() };
      // 2. el servidor no borra: false (administrador o sin sesion), un error, o no hay red
      out.fallos = [];
      for (const resp of [{ data: false, error: null },
                          { data: null, error: { message: 'permission denied for table users', code: '42501' } },
                          'lanzar']) {
        window.__sb.respuestas.borrar_mi_cuenta = resp;
        btn.click(); await espera(100); si.click(); await espera(400);
        const a = msg.querySelector('a');
        out.fallos.push({ resp: typeof resp === 'string' ? resp : JSON.stringify(resp), visible: vis(msg),
                          error: msg.classList.contains('error'), texto: msg.textContent.trim(),
                          enlace: a ? { href: a.getAttribute('href'), texto: a.textContent.trim(), blank: a.target === '_blank' } : null,
                          sesion: window.AppAuth.isLoggedIn(), signOuts: window.__sb.signOuts.length, caja: vis(caja) });
      }
      // 3. el servidor borra
      window.__sb.respuestas.borrar_mi_cuenta = { data: true, error: null };
      const antes = llamadas();
      btn.click(); await espera(100); si.click(); await espera(500);
      const lm = $('auth-login-msg');
      out.borrada = { llamadas: llamadas() - antes, signOuts: JSON.stringify(window.__sb.signOuts),
                      sesion: window.AppAuth.isLoggedIn(), login: $('auth-form-login').classList.contains('active'),
                      msg: lm.textContent.trim(), exito: lm.classList.contains('success') && vis(lm) };
      // 4. la politica: como borrarla, con los botones de la app y el enlace
      closeAuthModal(); openPrivacyPanel(); await espera(300);
      const pp = document.querySelector('#privacy-panel [data-tx="ppConsCuenta"]');
      const enl = pp && pp.parentElement.querySelector('a[href="borrar-cuenta.html"]');
      out.politica = { texto: pp ? pp.textContent : '', enlace: enl ? enl.textContent.trim() : null,
                       cuenta: fila('navAccount'), eliminar: fila('cuentaBorrarBtn') };
      return out;
    });
    const f = r.fila, q = comillas(L);
    caso(`[${L}] «${r.btn.texto}», debajo de «Cerrar sesion», con su rotulo entero; los siete textos traducidos`,
      r.btn.visible && r.btn.texto === f.cuentaBorrarBtn && r.btn.debajo && r.btn.entero && !r.cajaAntes &&
      Object.values(f).every(Boolean) && r.comoCastellano.length === 0, JSON.stringify([r.btn, r.cajaAntes, r.comoCastellano, f]));
    caso(`[${L}] la confirmacion, en el idioma: aviso, «${r.confirma.si}» y «${r.confirma.no}»`,
      r.confirma.visible && r.confirma.aviso === f.cuentaBorrarAviso && r.confirma.si === f.cuentaBorrarSi &&
      r.confirma.no === f.cuentaBorrarNo && r.confirma.btnEscondido && r.confirma.enteros, JSON.stringify(r.confirma));
    caso(`[${L}] «Cancelar» no llama al servidor y deja todo como estaba`,
      !r.cancelar.caja && r.cancelar.btn && r.cancelar.llamadas === 0 && r.cancelar.sesion, JSON.stringify(r.cancelar));
    caso(`[${L}] si el servidor no borra (false, error o sin red): la sesion sigue y sale el enlace a borrar-cuenta.html#${L}`,
      r.fallos.length === 3 && r.fallos.every(x => x.visible && x.error && x.texto.startsWith(f.cuentaBorrarError) && x.enlace &&
        x.enlace.href === 'borrar-cuenta.html#' + L && x.enlace.texto === f.cuentaBorrarPagina && x.enlace.blank &&
        x.sesion && x.signOuts === 0 && !x.caja), JSON.stringify(r.fallos));
    caso(`[${L}] si borra: una llamada, cierre de sesion solo en este dispositivo y «${r.borrada.msg}»`,
      r.borrada.llamadas === 1 && r.borrada.signOuts === '[{"scope":"local"}]' && !r.borrada.sesion &&
      r.borrada.login && r.borrada.msg === f.cuentaBorrada && r.borrada.exito, JSON.stringify(r.borrada));
    caso(`[${L}] la politica dice como borrarla: ${q[0]}${r.politica.cuenta}${q[1]} → ${q[0]}${r.politica.eliminar}${q[1]}, y el enlace a la pagina`,
      r.politica.texto.includes(q[0] + r.politica.cuenta + q[1]) && r.politica.texto.includes(q[0] + r.politica.eliminar + q[1]) &&
      r.politica.enlace === f.cuentaBorrarPagina, JSON.stringify(r.politica));
    caso(`[${L}] sin errores de pagina (borrar la cuenta)`, errores.length === 0, errores.join(' / '));
    await ctx.close();
  }

  // ── borrar-cuenta.html, SIN JavaScript: se lee entera, idioma a idioma
  const PAG = 'http://127.0.0.1:' + PUERTO + '/borrar-cuenta.html';
  const seccionesVistas = () => [...document.querySelectorAll('section.idioma')]
    .filter(s => getComputedStyle(s).display !== 'none').map(s => s.id).join();
  {
    const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
    const pg = await ctx.newPage();
    await pg.goto(PAG, { waitUntil: 'load' });
    const r0 = await pg.evaluate(`(${seccionesVistas})()`);
    const t0 = await pg.title();
    caso(`sin JavaScript y sin #idioma: se ve el castellano, solo el, y el titulo lleva el nombre de la app («${t0}»)`,
      r0 === 'es' && t0 === 'Tenerife Go — ' + R.valor('UI.cuentaBorrarPagina', 'es'), JSON.stringify([r0, t0]));
    for (const L of IDIOMAS) {
      await pg.goto(PAG + '#' + L, { waitUntil: 'load' });
      const r = await pg.evaluate(id => {
        const s = document.getElementById(id);
        const vistas = [...document.querySelectorAll('section.idioma')].filter(x => getComputedStyle(x).display !== 'none').map(x => x.id);
        return { vistas, h1: s.querySelector('h1').textContent, texto: s.innerText,
                 mail: [...s.querySelectorAll('a[href^="mailto:"]')].map(a => a.getAttribute('href')),
                 ancho: document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1 };
      }, L);
      const q = comillas(L);
      const botones = ['UI.navAccount', 'LANGS.authLogoutBtn', 'UI.cuentaBorrarBtn', 'UI.cuentaBorrarSi'].map(k => q[0] + R.valor(k, L) + q[1]);
      const faltan = botones.filter(b => !r.texto.includes(b));
      caso(`[${L}] borrar-cuenta.html#${L} sin JavaScript: solo ese idioma, su titulo, los botones tal cual (${botones.join(' ')}) y el correo`,
        r.vistas.join() === L && r.h1 === R.valor('UI.cuentaBorrarPagina', L) && faltan.length === 0 && r.mail.length === 1 &&
        /^mailto:tenerife\.go\.app@gmail\.com\?subject=\S+$/.test(r.mail[0]) && r.ancho,
        JSON.stringify({ vistas: r.vistas, h1: r.h1, faltan, mail: r.mail, ancho: r.ancho }));
    }
    await pg.goto(PAG + '#de', { waitUntil: 'load' });
    await pg.click('#de nav a[href="#pl"]');
    const r1 = await pg.evaluate(`(${seccionesVistas})()`);
    caso('sin JavaScript, el enlace «Polski» cambia de idioma', r1 === 'pl', r1);
    await ctx.close();
  }
  // ── con JavaScript: se abre sola en el idioma de la app, o en el del navegador
  for (const [locale, guardado, espera] of [['de-DE', 'it', 'it'], ['de-DE', null, 'de'], ['ja-JP', null, 'en'], ['es-ES', 'zht', 'zht']]) {
    const ctx = await nav.newContext({ locale });
    const pg = await ctx.newPage();
    if (guardado) await pg.addInitScript(l => { try { localStorage.setItem('tg_lang', l); } catch (e) {} }, guardado);
    await pg.goto(PAG, { waitUntil: 'load' });
    await pg.waitForTimeout(200);
    const r = await pg.evaluate(`({ hash: location.hash, vistas: (${seccionesVistas})(), titulo: document.title, lang: document.documentElement.lang })`);
    const lang = { zh: 'zh-Hans', zht: 'zh-Hant' }[espera] || espera;
    caso(`con JavaScript, navegador ${locale}${guardado ? ' y la app en ' + guardado : ''}: abre en ${espera}, con el titulo y el lang de ese idioma`,
      r.hash === '#' + espera && r.vistas === espera && r.titulo === 'Tenerife Go — ' + R.valor('UI.cuentaBorrarPagina', espera) && r.lang === lang,
      JSON.stringify(r));
    await ctx.close();
  }

  await nav.close();
  console.log('\n' + (malos ? malos + ' de ' + total + ' fallan' : total + ' de ' + total));
  process.exit(malos ? 1 : 0);
})().catch(e => { console.error(e && e.stack || e); process.exit(2); });
