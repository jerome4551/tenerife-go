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
 * 1.3 LA POLITICA DE PRIVACIDAD, CON DIRECCION PROPIA
 *   · en los diez idiomas, a 390x844 y a 360x740: «Version web» y «Borrar tu
 *     cuenta» encima de «Privacidad · RGPD», traducidos, a sus paginas y sin
 *     tapar la leyenda, el zoom, el boton de informacion, el credito del
 *     mapa ni la barra de abajo;
 *   · el panel: la frase de la AEPD con el enlace DENTRO y en su sitio en
 *     cada idioma, la base legal con sus dos enfasis, la publicidad citando
 *     la etiqueta que se ve en el mapa, y jsDelivr con su politica (Google
 *     Fonts ya no recibe nada);
 *   · privacidad.html se lee entera sin JavaScript, idioma a idioma, y dice
 *     LO MISMO que el panel de la app en ese idioma, letra a letra.
 *
 * 1.4 «PATROCINADO» EN LOS PINES DE PAGO
 *   · en los diez idiomas, el globo de un pin de pago dice la etiqueta de
 *     ese idioma, sin estrella delante, y la fecha de la promocion en el
 *     formato del idioma y con su «hasta» traducido (era «hasta 2026-12-31»
 *     en los diez).
 *
 * 1.6 OPENSTREETMAP
 *   · con la capa de calles, el credito dice «© OpenStreetMap» con enlace a
 *     su pagina de derechos y licencia. (Lo del service worker -sus teselas
 *     solo por red y fuera de Cache Storage- esta en auditar_sw.js, y que sin
 *     red el mapa cae a la isla, en auditar_mapa.js.)
 *
 * 1.7 OPEN-METEO (30 de octubre de 2026)
 *   · junto a cada dato suyo, el credito con sus enlaces (Open-Meteo.com y
 *     CC BY 4.0) y quien hace los modelos: el tiempo, DWD, NOAA y ECMWF; el
 *     mar, la frase de Copernicus Marine. En el pie del panel del mar y en el
 *     de los microclimas (los dos igual que tgoCreditoMeteo, a 390 y a 360 px,
 *     sin pisar el boton de al lado), en «El mar aquí» del globo (con el mar,
 *     el tiempo o los dos, segun lo que llegue), debajo del mar de los charcos
 *     (una vez, aunque se abra otra vez), en las nubes y el indice de la noche
 *     (este, solo si cuenta las nubes) y escrito en la imagen que se comparte;
 *     a 11 px como minimo e igual en los diez idiomas (data-sin-traducir).
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
  const nav = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const abrir = async (cfg) => {
    const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
    const pg = await ctx.newPage();
    const errores = [];
    pg.on('pageerror', e => errores.push(e.message));
    // el SDK de verdad no entra: se queda el falso
    await pg.route('**/vendor/supabase.js', r => r.abort());
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
      /* seis desde el 22 de octubre de 2026: el SOS (el panel de emergencias) */
      !r.tienda && r.visibles.length === 6 && r.visibles.includes('v19-nav-sos') && !r.visibles.includes('v19-nav-shop') && r.cortados.length === 0 && !r.desborda,
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

  console.log('\n=== 1.3 la politica de privacidad, con direccion propia ===');
  const sinEspacios = t => String(t || '').replace(/\s+/g, '');
  const primeraDiferencia = (a, b) => {
    a = sinEspacios(a); b = sinEspacios(b);
    let i = 0; while (i < a.length && a[i] === b[i]) i++;
    return i >= a.length && i >= b.length ? '' : 'difieren en ' + i + ': «' + a.slice(Math.max(0, i - 30), i + 40) + '» / «' + b.slice(Math.max(0, i - 30), i + 40) + '»';
  };
  const textoPanel = {};
  for (const [ancho, alto] of [[390, 844], [360, 740]]) {
    const ctx = await nav.newContext({ viewport: { width: ancho, height: alto }, serviceWorkers: 'block' });
    const pg = await ctx.newPage();
    const errores = [];
    pg.on('pageerror', e => errores.push(e.message));
    await pg.route('**/vendor/supabase.js', r => r.abort());
    await pg.addInitScript(supabaseFalso, { user: null });
    await pg.goto(BASE, { waitUntil: 'networkidle' });
    await pg.waitForFunction(() => window.AppAuth && window.AppAuth.isReady(), null, { timeout: 30000 });
    try { await pg.click('#v19-welcome-start', { timeout: 3000 }); } catch (e) {}
    await pg.waitForTimeout(900);
    for (const L of IDIOMAS) {
      await pg.evaluate(l => setLang(l), L);
      await pg.waitForTimeout(250);
      const r = await pg.evaluate(() => {
        const caja = el => { const b = el.getBoundingClientRect(); return { l: b.left, t: b.top, r: b.right, b: b.bottom }; };
        const vis = el => !!el && getComputedStyle(el).display !== 'none' && getComputedStyle(el).visibility !== 'hidden' &&
          el.getBoundingClientRect().width > 0;
        const choca = (a, b) => a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b;
        const web = document.getElementById('pp-enlace-web'), borrar = document.getElementById('pp-enlace-borrar');
        const pildora = document.querySelector('.pp-pie > button.pp-link');
        const mios = [['version web', web], ['borrar su cuenta', borrar], ['Privacidad · RGPD', pildora]];
        const vecinos = [['la leyenda', '#map-legend-toggle'], ['el zoom', '.leaflet-control-zoom'], ['el boton de informacion', '.pwa-fab'],
                         ['el credito del mapa', '.leaflet-control-attribution'], ['la barra de abajo', '.v19-bottom-nav']]
          .map(([n, sel]) => [n, document.querySelector(sel)]).filter(([, el]) => vis(el));
        const choques = [];
        for (const [n1, m] of mios) for (const [n2, el] of vecinos) if (choca(caja(m), caja(el))) choques.push(n1 + ' tapa ' + n2);
        for (let i = 0; i < mios.length; i++) for (let j = i + 1; j < mios.length; j++)
          if (choca(caja(mios[i][1]), caja(mios[j][1]))) choques.push(mios[i][0] + ' encima de ' + mios[j][0]);
        const W = document.documentElement.clientWidth;
        const fuera = mios.filter(([, m]) => { const c = caja(m); return c.l < 0 || c.r > W; }).map(([n]) => n);
        const comoCastellano = ['ppEnlaceWeb', 'cuentaBorrarPagina', 'ppEnlace', 'ppDerReclamar', 'ppBaseLi1', 'ppPubQue']
          .filter(k => currentLang !== 'es' && tx(k) === UI_TX[k].es);
        openPrivacyPanel();
        const hoja = document.querySelector('#privacy-panel .pp-sheet').cloneNode(true);
        hoja.querySelector('.pp-close').remove(); hoja.querySelector('h2').remove();
        const der = document.querySelector('#privacy-panel [data-tx-hueco="ppDerReclamar"]');
        const base = document.querySelector('#privacy-panel [data-tx-hueco="ppBaseLi1"]');
        const pub = document.querySelector('#privacy-panel [data-tx="ppPubQue"]');
        const out = {
          web: { texto: web.textContent.trim(), fila: tx('ppEnlaceWeb'), href: web.getAttribute('href'), blank: web.target === '_blank', vis: vis(web) },
          borrar: { texto: borrar.textContent.trim(), fila: tx('cuentaBorrarPagina'), href: borrar.getAttribute('href'), blank: borrar.target === '_blank', vis: vis(borrar) },
          pildora: { texto: pildora.textContent.trim(), fila: tx('ppEnlace'), vis: vis(pildora) },
          choques, fuera, comoCastellano,
          texto: hoja.textContent,
          aepd: document.querySelectorAll('#privacy-panel a[href="https://www.aepd.es"]').length,
          der: der ? der.textContent : null, derEsperado: tx('ppDerReclamar').replace('{aepd}', 'AEPD'),
          derEnlaceDentro: !!(der && der.querySelector('a[href="https://www.aepd.es"]')),
          base: base ? base.textContent : null,
          baseEsperado: tx('ppBaseLi1').replace('{interes}', tx('ppBaseInteres')).replace('{contrato}', tx('ppBaseContrato')),
          baseEm: base ? base.querySelectorAll('em').length : 0,
          pub: pub ? pub.textContent : '', etiqueta: tx('adRecommend'),
          /* ni jsDelivr ni Google Fonts: la libreria de Supabase y las
             tipografias viven en vendor/ y no reciben nada (22-10-2026) */
          jsdelivr: /jsDelivr/i.test(document.getElementById('privacy-panel').textContent),
          google: /Google Fonts/.test(document.getElementById('privacy-panel').textContent)
        };
        closePrivacyPanel();
        return out;
      });
      const q = comillas(L);
      caso(`[${L} ${ancho}] «${r.web.texto}» y «${r.borrar.texto}» encima de «${r.pildora.texto}»: traducidos, a sus paginas y sin tapar nada`,
        r.web.vis && r.borrar.vis && r.pildora.vis && r.web.texto === r.web.fila && r.borrar.texto === r.borrar.fila &&
        r.pildora.texto === r.pildora.fila && r.web.href === 'privacidad.html' && r.borrar.href === 'borrar-cuenta.html' &&
        r.web.blank && r.borrar.blank && r.choques.length === 0 && r.fuera.length === 0 && r.comoCastellano.length === 0,
        JSON.stringify({ web: r.web, borrar: r.borrar, pildora: r.pildora, choques: r.choques, fuera: r.fuera, comoCastellano: r.comoCastellano }));
      /* y con un filtro puesto (21-10-2026): la pildora «Mostrando… lugares» iba a
         120 px y los enlaces de arriba la pisaban en los diez idiomas y en todos
         los anchos; aqui no se veia porque se miraba sin filtro */
      const rf = await pg.evaluate(async () => {
        setCategory('playa');
        await new Promise(res => setTimeout(res, 300));
        const caja = el => { const b = el.getBoundingClientRect(); return { l: b.left, t: b.top, r: b.right, b: b.bottom }; };
        const vis = el => !!el && getComputedStyle(el).display !== 'none' && getComputedStyle(el).visibility !== 'hidden' && el.getBoundingClientRect().width > 0;
        const choca = (a, b) => a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b;
        const pild = document.getElementById('filter-status');
        const otros = [['version web', '#pp-enlace-web'], ['borrar su cuenta', '#pp-enlace-borrar'], ['Privacidad · RGPD', '.pp-pie > button.pp-link'],
          ['la leyenda', '#map-legend-toggle'], ['el zoom', '.leaflet-control-zoom'], ['el trofeo', '.tg-trophy-fab'], ['el boton de informacion', '.pwa-fab'],
          ['el credito del mapa', '.leaflet-control-attribution'], ['la barra de abajo', '.v19-bottom-nav']]
          .map(([n, s]) => [n, document.querySelector(s)]).filter(([, el]) => vis(el));
        const out = { vis: vis(pild), texto: pild.textContent.trim().slice(0, 60), choques: otros.filter(([, el]) => choca(caja(pild), caja(el))).map(([n]) => n) };
        clearAllFilters();
        await new Promise(res => setTimeout(res, 200));
        return out;
      });
      caso(`[${L} ${ancho}] con un filtro puesto, la pildora «${rf.texto}» no pisa los enlaces ni los botones de alrededor`,
        rf.vis && rf.choques.length === 0, JSON.stringify(rf));
      if (ancho !== 390) continue;
      textoPanel[L] = r.texto;
      caso(`[${L}] el panel: la frase de la AEPD, con el enlace dentro y en su sitio («${(r.der || '').trim()}»)`,
        r.der === r.derEsperado && r.derEnlaceDentro && r.aepd === 1, JSON.stringify([r.der, r.derEsperado, r.derEnlaceDentro, r.aepd]));
      caso(`[${L}] el panel: la base legal, con sus dos enfasis («${(r.base || '').trim()}»)`,
        r.base === r.baseEsperado && r.baseEm === 2, JSON.stringify([r.base, r.baseEsperado, r.baseEm]));
      caso(`[${L}] el panel: la publicidad cita la etiqueta que se ve en el mapa (${q[0]}${r.etiqueta}${q[1]})`,
        !!r.etiqueta && r.pub.includes(q[0] + r.etiqueta + q[1]), JSON.stringify([r.pub, r.etiqueta]));
      caso(`[${L}] el panel: ni jsDelivr ni Google Fonts (la libreria de la cuenta y las tipografias van dentro)`,
        !r.jsdelivr && !r.google, JSON.stringify([r.jsdelivr, r.google]));
    }
    caso(`sin errores de pagina (politica, ${ancho})`, errores.length === 0, errores.join(' / '));
    await ctx.close();
  }

  // ── privacidad.html, SIN JavaScript: entera, idioma a idioma, igual que el panel
  {
    const POL = 'http://127.0.0.1:' + PUERTO + '/privacidad.html';
    const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
    const pg = await ctx.newPage();
    await pg.goto(POL, { waitUntil: 'load' });
    const r0 = await pg.evaluate(`(${seccionesVistas})()`);
    const t0 = await pg.title();
    const tituloDe = L => R.valor('UI.ppTitulo', L).replace(/^[^\p{L}\p{N}]+/u, '');
    caso(`sin JavaScript y sin #idioma: se ve el castellano, solo el, con el nombre de la app en el titulo («${t0}»)`,
      r0 === 'es' && t0 === 'Tenerife Go — ' + tituloDe('es'), JSON.stringify([r0, t0]));
    for (const L of IDIOMAS) {
      await pg.goto(POL + '#' + L, { waitUntil: 'load' });
      const r = await pg.evaluate(id => {
        const s = document.getElementById(id);
        const c = s.cloneNode(true);
        c.querySelector('nav').remove(); c.querySelector('h1').remove(); c.querySelector('.pie').remove();
        return { vistas: [...document.querySelectorAll('section.idioma')].filter(x => getComputedStyle(x).display !== 'none').map(x => x.id),
                 h1: s.querySelector('h1').textContent, texto: c.textContent,
                 borrar: !!s.querySelector('a[href="borrar-cuenta.html#' + id + '"]'),
                 ancho: document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1 };
      }, L);
      const dif = primeraDiferencia(r.texto, textoPanel[L]);
      caso(`[${L}] privacidad.html#${L} sin JavaScript: solo ese idioma, su titulo, y LO MISMO que el panel de la app en ese idioma`,
        r.vistas.join() === L && r.h1 === tituloDe(L) && !!textoPanel[L] && dif === '' && r.borrar && r.ancho,
        JSON.stringify({ vistas: r.vistas, h1: r.h1, dif, borrar: r.borrar, ancho: r.ancho }));
    }
    await ctx.close();
  }
  // ── con JavaScript: se abre en el idioma de la app, o en el del navegador
  for (const [locale, guardado, espera] of [['de-DE', 'nl', 'nl'], ['fr-FR', null, 'fr']]) {
    const ctx = await nav.newContext({ locale });
    const pg = await ctx.newPage();
    if (guardado) await pg.addInitScript(l => { try { localStorage.setItem('tg_lang', l); } catch (e) {} }, guardado);
    await pg.goto('http://127.0.0.1:' + PUERTO + '/privacidad.html', { waitUntil: 'load' });
    await pg.waitForTimeout(200);
    const r = await pg.evaluate(`({ hash: location.hash, vistas: (${seccionesVistas})(), titulo: document.title, lang: document.documentElement.lang })`);
    caso(`privacidad.html con JavaScript, navegador ${locale}${guardado ? ' y la app en ' + guardado : ''}: abre en ${espera}`,
      r.hash === '#' + espera && r.vistas === espera && r.lang === espera &&
      r.titulo === 'Tenerife Go — ' + R.valor('UI.ppTitulo', espera).replace(/^[^\p{L}\p{N}]+/u, ''), JSON.stringify(r));
    await ctx.close();
  }

  console.log('\n=== 1.4 «Patrocinado» en los pines de pago ===');
  {
    const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
    const pg = await ctx.newPage();
    const errores = [];
    pg.on('pageerror', e => errores.push(e.message));
    await pg.route('**/vendor/supabase.js', r => r.abort());
    await pg.addInitScript(supabaseFalso, { user: null });
    await pg.goto(BASE, { waitUntil: 'networkidle' });
    await pg.waitForFunction(() => window.AppAuth && window.AppAuth.isReady(), null, { timeout: 30000 });
    for (const L of IDIOMAS) {
      await pg.evaluate(l => setLang(l), L);
      await pg.waitForTimeout(150);
      const r = await pg.evaluate(() => {
        // un anuncio como los que llegan de Supabase (promo_until es una fecha)
        adsPublicCache = [{ id: 'prueba', emoji: '🍷', name: 'Bodega de prueba', tagline: 'Cata', zone: 'La Orotava',
                            lat: 28.39, lng: -16.52, promoText: '2x1', promoUntil: '2026-12-31', visible: true, i18n: null }];
        renderAdMarkers();
        const html = adMarkers.length ? adMarkers[0].getPopup().getContent() : '';
        const d = document.createElement('div'); d.innerHTML = html;
        const cat = d.querySelector('.popup-cat'), promo = d.querySelector('.popup-promo-badge');
        const fecha = new Intl.DateTimeFormat(PRECIOS_GAS_LOCALE[currentLang], { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' })
          .format(new Date(Date.UTC(2026, 11, 31)));
        const out = { n: adMarkers.length, cat: cat ? cat.textContent.trim() : null, promo: promo ? promo.textContent.trim().replace(/\s+/g, ' ') : null,
                      etiqueta: tx('adRecommend'), es: UI_TX.adRecommend.es, hasta: tx('adHasta', { f: fecha }).replace(/\s+/g, ' '), fecha };
        adsPublicCache = []; renderAdMarkers();
        return out;
      });
      caso(`[${L}] el globo del pin de pago: «${r.cat}» y «${r.promo}»`,
        r.n === 1 && r.cat === r.etiqueta + ' · La Orotava' && !/⭐|★/.test(r.cat) && (L === 'es' || r.etiqueta !== r.es) &&
        r.promo === '🎁 2x1 · ' + r.hasta && !r.promo.includes('2026-12-31') && /31/.test(r.fecha) && /12/.test(r.fecha) &&
        (L === 'es' || !/hasta/.test(r.promo)), JSON.stringify(r));
    }
    caso('sin errores de pagina (pines de pago)', errores.length === 0, errores.join(' / '));
    await ctx.close();
  }

  console.log('\n=== 1.6 OpenStreetMap: el credito, con enlace ===');
  {
    const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
    const pg = await ctx.newPage();
    const errores = [];
    pg.on('pageerror', e => errores.push(e.message));
    await pg.route('**/vendor/supabase.js', r => r.abort());
    /* Desde aqui no se llega a tile.openstreetmap.org: sin esto las teselas
       fallarian y la app pasaria sola a la isla. Se le da una imagen local. */
    const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
    await pg.route(/tile\.openstreetmap\.org/, r => r.fulfill({ status: 200, contentType: 'image/png', body: PNG }));
    await pg.addInitScript(supabaseFalso, { user: null });
    await pg.goto(BASE, { waitUntil: 'networkidle' });
    try { await pg.click('#v19-welcome-start', { timeout: 3000 }); } catch (e) {}
    await pg.waitForTimeout(600);
    await pg.evaluate(() => { setLang('es'); setStyleFromMenu('streets'); });
    await pg.waitForTimeout(800);
    const r = await pg.evaluate(() => {
      const att = document.querySelector('.leaflet-control-attribution');
      const a = att && att.querySelector('a[href="https://www.openstreetmap.org/copyright"]');
      const b = att && att.getBoundingClientRect();
      return { capa: currentLayer, texto: att ? att.textContent.replace(/\s+/g, ' ').trim() : null,
               enlace: a ? a.textContent.trim() : null, nueva: a ? a.target === '_blank' && /noopener/.test(a.rel) : false,
               visible: !!b && b.width > 0 && b.bottom <= window.innerHeight };
    });
    caso(`con la capa de calles, el credito dice «© OpenStreetMap» y enlaza a su pagina de derechos y licencia («${r.texto}»)`,
      r.capa === 'streets' && r.enlace === 'OpenStreetMap' && /© OpenStreetMap/.test(r.texto) && r.nueva && r.visible, JSON.stringify(r));
    caso('sin errores de pagina (credito del mapa)', errores.length === 0, errores.join(' / '));
    await ctx.close();
  }

  console.log('\n=== 1.7 Open-Meteo: el credito, con enlace, junto a cada dato ===');
  {
    const TIEMPO = 'Open-Meteo.com · CC BY 4.0 · DWD · NOAA · ECMWF';
    const COPERNICUS = 'Generated using E.U. Copernicus Marine Service Information';
    const MAR = 'Open-Meteo.com · CC BY 4.0 · ECMWF · ' + COPERNICUS;
    const AMBOS = TIEMPO + ' · ' + COPERNICUS;
    const ENLACES = [['https://open-meteo.com/', 'Open-Meteo.com'], ['https://creativecommons.org/licenses/by/4.0/', 'CC BY 4.0']];
    const enlacesDe = q => ENLACES.concat(q === TIEMPO ? [] : [['https://marine.copernicus.eu/', COPERNICUS]]);
    const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
    const pg = await ctx.newPage();
    const errores = [];
    pg.on('pageerror', e => errores.push(e.message));
    await pg.route('**/vendor/supabase.js', r => r.abort());
    const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
    await pg.route(/tile\.openstreetmap\.org/, r => r.fulfill({ status: 200, contentType: 'image/png', body: PNG }));
    /* Desde aqui no se llega a Open-Meteo: un mar en calma, un alisio y unas
       nubes, para cada punto que se pida (las nubes, desde ayer a las 00 UTC y
       cuatro dias, para que caigan en la noche que toque) */
    const T0 = new Date(); T0.setUTCHours(0, 0, 0, 0); T0.setUTCDate(T0.getUTCDate() - 1);
    const horas = [...Array(96)].map((_, i) => new Date(T0.getTime() + i * 3600000).toISOString().slice(0, 16));
    const servir = (r, uno) => {
      const u = new URL(r.request().url()), n = (u.searchParams.get('latitude') || '').split(',').length;
      return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(n > 1 ? [...Array(n)].map(() => uno(u)) : uno(u)) });
    };
    const unMar = u => Object.assign({ current: { wave_height: 0.5, wave_period: 7, swell_wave_height: 0.3, swell_wave_period: 8, sea_surface_temperature: 22 } },
      u.searchParams.get('hourly') ? { hourly: { time: horas.slice(24, 48), wave_height: horas.slice(24, 48).map(() => 0.5), wave_period: horas.slice(24, 48).map(() => 7),
        swell_wave_height: horas.slice(24, 48).map(() => 0.3), swell_wave_period: horas.slice(24, 48).map(() => 8) } } : {});
    let nubesFallan = false;
    await pg.route(u => u.hostname === 'marine-api.open-meteo.com', r => servir(r, unMar));
    await pg.route(u => u.hostname === 'api.open-meteo.com', r => {
      const u = new URL(r.request().url());
      if (u.searchParams.get('hourly')) return nubesFallan ? r.fulfill({ status: 503, body: 'no' })
        : servir(r, () => ({ hourly: { time: horas, cloud_cover_low: horas.map(() => 40), cloud_cover_mid: horas.map(() => 10), cloud_cover_high: horas.map(() => 20) } }));
      return servir(r, () => ({ current: { temperature_2m: 22, weather_code: 1, wind_speed_10m: 12, wind_direction_10m: 45, cloud_cover: 20, is_day: 1, uv_index: 5 },
                                current_units: { wind_speed_10m: 'km/h' } }));
    });
    await pg.addInitScript(supabaseFalso, { user: null });
    await pg.addInitScript(() => { try { ['tgo_mar_cache_v1', 'tgo_bano_cache_v2', 'tgo_sea_cache_v1', 'tgo_cielo_nubes_v1'].forEach(k => localStorage.removeItem(k)); } catch (e) {} });
    await pg.goto(BASE, { waitUntil: 'networkidle' });
    try { await pg.click('#v19-welcome-start', { timeout: 3000 }); } catch (e) {}
    await pg.waitForFunction(() => typeof setLang === 'function' && typeof markerMap !== 'undefined', null, { timeout: 30000 });
    await pg.evaluate(() => setLang('es'));
    /* lo que se ve de un credito: el texto, los enlaces, la letra y donde cae */
    const leer = (raiz, junto) => pg.evaluate(([raiz, junto]) => {
      const e = typeof raiz === 'string' ? document.querySelector(raiz) : null;
      if (!e) return null;
      const r = e.getBoundingClientRect(), b = junto ? document.querySelector(junto) : null, rb = b && b.getBoundingClientRect();
      return { texto: e.textContent.replace(/\s+/g, ' ').trim(), exento: !!e.closest('[data-sin-traducir]'),
               enlaces: [...e.querySelectorAll('a')].map(a => [a.getAttribute('href'), a.textContent, a.target === '_blank' && /noopener/.test(a.rel)]),
               px: parseFloat(getComputedStyle(e).fontSize), visible: r.width > 0 && r.height > 0,
               dentro: r.left >= -0.5 && r.right <= innerWidth + 0.5, pisa: rb ? !(r.right <= rb.left + 0.5 || r.bottom <= rb.top || r.top >= rb.bottom) : false };
    }, [raiz, junto]);
    const bien = (x, q) => !!x && x.texto === q && x.exento && x.px >= 11 && x.visible && x.dentro && !x.pisa
      && JSON.stringify(x.enlaces.map(a => [a[0], a[1]])) === JSON.stringify(enlacesDe(q)) && x.enlaces.every(a => a[2]);
    // la funcion dice lo que se espera, y los pies del HTML dicen lo mismo que la funcion
    const fn = await pg.evaluate(() => typeof tgoCreditoMeteo !== 'function' ? null
      : ['tiempo', 'mar', 'ambos'].map(q => { const d = tgoCreditoMeteo(q); return [d.textContent, d.innerHTML]; }));
    caso('tgoCreditoMeteo: el tiempo, «' + TIEMPO + '»; el mar, «' + MAR + '»; los dos, juntos',
      !!fn && fn[0][0] === TIEMPO && fn[1][0] === MAR && fn[2][0] === AMBOS, fn ? JSON.stringify(fn.map(x => x[0])) : 'no hay tgoCreditoMeteo');
    const pies = await pg.evaluate(() => [document.querySelector('#mar-panel .mar-source').innerHTML, document.querySelector('#mc-panel .mc-source').innerHTML]);
    caso('los pies del panel del mar y de los microclimas, igual que tgoCreditoMeteo (los dos y el tiempo)',
      !!fn && pies[0] === fn[2][1] && pies[1] === fn[0][1], JSON.stringify(pies));
    // el panel del mar y el de los microclimas, abiertos, a 390 y a 360 px
    await pg.evaluate(() => document.getElementById('mar-btn').click());
    await pg.waitForFunction(() => document.querySelectorAll('#mar-list .mar-row').length > 0, null, { timeout: 15000 });
    for (const [w, h] of [[390, 844], [360, 740]]) {
      await pg.setViewportSize({ width: w, height: h }); await pg.waitForTimeout(250);
      const x = await leer('#mar-panel .mar-source', '#mar-refresh');
      caso(`[${w} px] el panel del mar: «${AMBOS}», con sus enlaces, a ${x && x.px} px, sin pisar ↻`, bien(x, AMBOS), JSON.stringify(x));
    }
    await pg.evaluate(() => document.getElementById('mar-close').click());
    await pg.setViewportSize({ width: 390, height: 844 });
    await pg.evaluate(() => document.getElementById('mc-btn').click());
    await pg.waitForFunction(() => document.querySelectorAll('#mc-list .mc-row, #mc-list > *').length > 0, null, { timeout: 15000 });
    for (const [w, h] of [[390, 844], [360, 740]]) {
      await pg.setViewportSize({ width: w, height: h }); await pg.waitForTimeout(250);
      const x = await leer('#mc-panel .mc-source', '#mc-refresh');
      caso(`[${w} px] los microclimas: «${TIEMPO}», con sus enlaces, sin pisar «Actualizar»`, bien(x, TIEMPO), JSON.stringify(x));
    }
    await pg.evaluate(() => document.getElementById('mc-close').click());
    await pg.setViewportSize({ width: 390, height: 844 });
    // «El mar aquí», en el globo de una playa, en castellano y en chino
    const globo = async id => {
      await pg.evaluate(id => { const p = places.find(q => q.id === id); map.setView([p.lat, p.lng], 15, { animate: false }); }, id);
      await pg.waitForTimeout(400);
      await pg.evaluate(id => markerMap[id].openPopup(), id);
      await pg.waitForFunction(id => !!document.querySelector('.popup-sea-wrap[data-place-id="' + id + '"] .popup-sea-toggle'), id, { timeout: 10000 });
      await pg.evaluate(id => document.querySelector('.popup-sea-wrap[data-place-id="' + id + '"] .popup-sea-toggle').click(), id);
      await pg.waitForFunction(id => { const d = document.querySelector('.popup-sea-wrap[data-place-id="' + id + '"] .popup-sea-details'); return d && d.dataset.loaded === 'done'; }, id, { timeout: 10000 });
      const x = await leer('.popup-sea-wrap[data-place-id="' + id + '"] .popup-sea-details .om-credito');
      await pg.evaluate(() => map.closePopup());
      return x;
    };
    for (const L of ['es', 'zh']) {
      await pg.evaluate(L => setLang(L), L);
      const x = await globo('el-duque');
      caso(`[${L}] «El mar aquí» (Playa del Duque): «${AMBOS}», con sus enlaces`, bien(x, AMBOS), JSON.stringify(x));
    }
    await pg.evaluate(() => setLang('es'));
    const solo = await pg.evaluate(() => {
      const p = places.find(q => q.id === 'el-duque'), m = { current: { wave_height: 0.5 } }, w = { current: { wind_speed_10m: 12 } };
      const de = h => { const d = document.createElement('div'); d.innerHTML = h; const c = d.querySelectorAll('.om-credito'); return c.length === 1 ? c[0].textContent : c.length + ' creditos'; };
      return [de(seaBuildHtml(m, null, p)), de(seaBuildHtml(null, w, p))];
    });
    caso('«El mar aquí» solo con el mar, el credito del mar; solo con el tiempo, el del tiempo', solo[0] === MAR && solo[1] === TIEMPO, JSON.stringify(solo));
    // el mar de los charcos y piscinas naturales: debajo, una vez
    const charco = await pg.evaluate(() => (places.find(p => p.category === 'piscinas' && markerMap[p.id]) || {}).id);
    const piscina = async () => {
      await pg.evaluate(id => { const p = places.find(q => q.id === id); map.setView([p.lat, p.lng], 15, { animate: false }); }, charco);
      await pg.waitForTimeout(400);
      await pg.evaluate(id => markerMap[id].openPopup(), charco);
      await pg.waitForFunction(() => !!document.querySelector('.popup-inner .popup-sea.sea-calm'), null, { timeout: 10000 });
      const r = await pg.evaluate(() => {
        const b = document.querySelector('.popup-inner .popup-sea'), s = b.nextElementSibling;
        if (s && s.classList.contains('om-credito')) s.id = 'om-credito-charco';
        return { tras: !!s && s.classList.contains('om-credito'), n: b.parentNode.querySelectorAll(':scope > .om-credito').length };
      });
      const x = await leer('#om-credito-charco');
      await pg.evaluate(() => map.closePopup());
      return Object.assign(r, { x });
    };
    const p1 = await piscina(), p2 = await piscina();
    caso(`el mar del charco (${charco}): debajo, «${MAR}», con sus enlaces; y una sola vez al abrirlo otra vez`,
      p1.tras && p1.n === 1 && bien(p1.x, MAR) && p2.tras && p2.n === 1 && bien(p2.x, MAR), JSON.stringify([p1, p2]));
    // el cielo: las nubes, el indice y la imagen, en castellano y en bulgaro
    await pg.evaluate(async () => { await window.TG_CIELO_CARGAR(); await TG_CIELO.cargar(); });
    const noche = async L => {
      await pg.evaluate(L => setLang(L), L);
      await pg.evaluate(() => TG_CIELO.ver('noche'));
      await pg.waitForFunction(() => !!TG_CIELO.estado.nubes, null, { timeout: 10000 });
      await pg.evaluate(() => TG_CIELO.ver('noche'));
      return pg.evaluate(() => {
        const marca = (sel, id) => { const t = [...document.querySelectorAll('#cielo-panel .cielo-tarjeta')].find(t => t.querySelector(sel)); const c = t && t.querySelector('.om-credito'); if (c) c.id = id; return !!t; };
        return { nubes: marca('.cielo-nubes', 'om-credito-nubes'), indice: marca('.cielo-indice', 'om-credito-indice') };
      });
    };
    for (const L of ['es', 'bg']) {
      const t = await noche(L);
      const xn = await leer('#om-credito-nubes'), xi = await leer('#om-credito-indice');
      caso(`[${L}] el cielo, «Esta noche»: en las nubes y en el indice, «${TIEMPO}», con sus enlaces`, t.nubes && t.indice && bien(xn, TIEMPO) && bien(xi, TIEMPO), JSON.stringify({ t, xn, xi }));
      await pg.evaluate(() => { document.querySelectorAll('#om-credito-nubes, #om-credito-indice').forEach(e => e.removeAttribute('id')); });
    }
    const textos = () => pg.evaluate(() => {
      const C = CanvasRenderingContext2D.prototype, o = C.fillText, out = [];
      C.fillText = function (s) { out.push(String(s)); return o.apply(this, arguments); };
      try { TG_CIELO.imagenNoche(TG_CIELO.estado.fecha); } finally { C.fillText = o; }   // la noche que se mira, 'AAAA-MM-DD'
      return out;
    });
    const conNubes = await textos();
    caso('la imagen de la noche, con las nubes: «' + TIEMPO + '» escrito, encima de «Tenerife Go · tenerifego.app»',
      conNubes.includes(TIEMPO) && conNubes.indexOf(TIEMPO) === conNubes.indexOf('Tenerife Go · tenerifego.app') - 1, JSON.stringify(conNubes.slice(-4)));
    // sin prevision de nubes: ni en el indice ni en la imagen
    nubesFallan = true;
    await pg.evaluate(() => { try { localStorage.removeItem('tgo_cielo_nubes_v1'); } catch (e) {} TG_CIELO.estado.nubes = null; return TG_CIELO.ver('noche'); });
    const sin = await pg.evaluate(() => {
      const t = [...document.querySelectorAll('#cielo-panel .cielo-tarjeta')].find(t => t.querySelector('.cielo-indice'));
      return { indice: !!t, credito: !!(t && t.querySelector('.om-credito')), nubes: !![...document.querySelectorAll('#cielo-panel .cielo-nubes')].length };
    });
    const sinNubes = await textos();
    caso('sin prevision de nubes: el indice sin credito, ni tarjeta de nubes, ni credito en la imagen',
      sin.indice && !sin.credito && !sin.nubes && !sinNubes.some(s => /Open-Meteo/.test(s)), JSON.stringify({ sin, fin: sinNubes.slice(-3) }));
    // igual en los diez idiomas: el pie del mar, tal cual
    const porIdioma = [];
    for (const L of IDIOMAS) {
      const t = await pg.evaluate(L => { setLang(L); return [document.querySelector('#mar-panel .mar-source').textContent, document.querySelector('#mc-panel .mc-source').textContent]; }, L);
      if (t[0] !== AMBOS || t[1] !== TIEMPO) porIdioma.push(L + ': ' + t.join(' / '));
    }
    caso('en los ' + IDIOMAS.length + ' idiomas, los dos pies dicen lo mismo (nombres propios y la frase de Copernicus)', IDIOMAS.length === 10 && !porIdioma.length, porIdioma.join(' · '));
    caso('sin errores de pagina (creditos de Open-Meteo)', errores.length === 0, errores.join(' / '));
    await ctx.close();
  }

  await nav.close();
  console.log('\n' + (malos ? malos + ' de ' + total + ' fallan' : total + ' de ' + total));
  process.exit(malos ? 1 : 0);
})().catch(e => { console.error(e && e.stack || e); process.exit(2); });
