#!/usr/bin/env node
/* Detalles de pantalla de la prueba de los dos moviles (20 de noviembre de 2026, bloque 7), con la app de verdad:
 *   1. el buscador: el contador («64 lugares») no se ve con la lista abierta, que ya da la cifra en su cabecera, y
 *      vuelve al cerrarla con la busqueda puesta (Intro); el campo no pinta un aro dorado dentro de la pildora, que
 *      ya se pone dorada; las direcciones de la ruta tampoco, y su borde marca el foco en dorado entero;
 *   2. el asistente en el iPhone instalado: la caja de escribir queda por encima de la barra de inicio (zona segura
 *      de abajo de 34 px), y en un Android sin zona segura sigue con sus 20 px de siempre;
 *   3. «Abriendo el mapa de la isla…» sale con el aviso normal de las capas, no con el rojo de los errores; y un
 *      error quita el aviso normal que hubiera, que sale en el mismo sitio;
 *   4. ningun alert() en el codigo (solo en los comentarios) y los avisos que eran alert() salen con el aviso propio,
 *      sin ninguna ventana del sistema: el de favoritos (status) y el de los campos obligatorios (alert);
 *   5. cero errores de pagina.
 *     node tools/probar_detalles_movil.js PUERTO      (con la app servida en ese puerto, como en tools/auditar.sh) */
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const RAIZ = path.dirname(__dirname);
const PUERTO = process.argv[2] || '8766';
const APP = 'http://127.0.0.1:' + PUERTO + '/index.html';
const TESELA = fs.readFileSync(path.join(RAIZ, 'icon-192.png'));
let bien = 0, malos = 0;
const ok = (c, txt, det) => {
  if (c) { bien++; console.log('  OK  ' + txt); }
  else { malos++; console.log('  MAL ' + txt + (det !== undefined ? '   -> ' + (typeof det === 'string' ? det : JSON.stringify(det)).slice(0, 400) : '')); }
};

/* alert( fuera de los comentarios: /* … *\/ y // (que no sea el de una direccion, como https://) */
function alertsEnCodigo(texto) {
  const fuera = [];
  for (const m of texto.matchAll(/\balert\s*\(/g)) {
    const antes = texto.slice(0, m.index);
    if (antes.lastIndexOf('/*') > antes.lastIndexOf('*/')) continue;
    const linea = antes.slice(antes.lastIndexOf('\n') + 1);
    if (/(^|[^:])\/\//.test(linea)) continue;
    fuera.push(antes.split('\n').length + ': ' + (linea + texto.slice(m.index, m.index + 40)).trim().slice(0, 90));
  }
  return fuera;
}

(async () => {
  console.log('── en el codigo ──');
  const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
  const enHtml = alertsEnCodigo(html);
  ok(enHtml.length === 0, 'index.html no llama a alert() (' + enHtml.length + ')', enHtml.slice(0, 4).join(' | '));
  const modulos = fs.readdirSync(path.join(RAIZ, 'modulos')).filter(f => f.endsWith('.js'));
  const enModulos = [];
  for (const f of modulos) for (const x of alertsEnCodigo(fs.readFileSync(path.join(RAIZ, 'modulos', f), 'utf8'))) enModulos.push(f + ':' + x);
  ok(enModulos.length === 0, 'ni los ' + modulos.length + ' modulos (' + enModulos.length + ')', enModulos.slice(0, 4).join(' | '));

  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const errores = [];
  async function abrir(viewport, seguras) {
    const ctx = await b.newContext({ viewport, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'es-ES', serviceWorkers: 'block' });
    /* las teselas llegan (una imagen local hace de tesela): asi el mapa del arranque se queda en las calles */
    await ctx.route('**/*', r => {
      const u = r.request().url();
      if (u.startsWith('http://127.0.0.1:' + PUERTO + '/')) return r.continue();
      if (/^https:\/\/[abc]\.tile\.openstreetmap\.org\//.test(u)) return r.fulfill({ status: 200, contentType: 'image/png', body: TESELA });
      return r.abort();
    });
    await ctx.addInitScript(() => { try {
      localStorage.setItem('tenerife.tour.seen', '99'); localStorage.setItem('tgo_consent', JSON.stringify({ v: 'denied', t: Date.now() }));
      localStorage.setItem('tg_lang', 'es');
    } catch (e) {} });
    const p = await ctx.newPage();
    const dialogos = [];
    p.on('dialog', d => { dialogos.push(d.type() + ': ' + d.message()); d.dismiss().catch(() => {}); });
    p.on('pageerror', e => errores.push(e.message));
    const cdp = await ctx.newCDPSession(p);
    await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: seguras });
    await p.goto(APP, { waitUntil: 'load', timeout: 90000 });
    await p.waitForFunction(() => typeof setLang === 'function' && typeof places !== 'undefined' && places.length > 0, null, { timeout: 60000 });
    if (await p.locator('#v19-welcome:not(.hidden)').count()) { await p.click('#v19-welcome-start').catch(() => {}); await p.waitForTimeout(800); }
    await p.evaluate(() => document.querySelectorAll('.v19-tour, .v19-tour-prompt, .v19-tour-overlay').forEach(e => e.remove()));
    await p.waitForTimeout(600);
    return { ctx, p, dialogos };
  }

  /* ── el iPhone, con su isla dinamica y su barra de inicio ── */
  console.log('\n── el iPhone (zonas seguras 62/34) ──');
  {
    const { ctx, p, dialogos } = await abrir({ width: 402, height: 874 }, { top: 62, bottom: 34, left: 0, right: 0 });

    /* 1. el buscador */
    await p.evaluate(() => openSearch());
    await p.waitForTimeout(600);
    await p.fill('#search-input', 'playa');
    await p.waitForTimeout(700);
    const abierta = await p.evaluate(() => {
      const c = document.getElementById('search-results-count'), l = document.getElementById('search-suggestions');
      const w = document.getElementById('search-input-wrap'), i = document.getElementById('search-input');
      return { lista: l.classList.contains('open'), texto: c.textContent, opacidad: getComputedStyle(c).opacity,
               aro: getComputedStyle(i).outlineStyle, foco: document.activeElement === i, pildora: getComputedStyle(w).borderTopColor };
    });
    ok(abierta.lista && abierta.texto && abierta.opacidad === '0', 'con la lista abierta, el contador no se ve', abierta);
    ok(abierta.foco && abierta.aro === 'none', 'el campo del buscador, con el foco, sin aro dorado dentro de la pildora', abierta);
    ok(abierta.pildora === 'rgb(212, 175, 55)', 'y la pildora marca el foco en dorado', abierta.pildora);
    await p.press('#search-input', 'Enter');
    await p.waitForTimeout(700);
    const cerrada = await p.evaluate(() => {
      const c = document.getElementById('search-results-count');
      return { lista: document.getElementById('search-suggestions').classList.contains('open'), texto: c.textContent, opacidad: getComputedStyle(c).opacity };
    });
    ok(!cerrada.lista && cerrada.texto && cerrada.opacidad === '1', 'al cerrarla con Intro y la busqueda puesta, el contador vuelve: «' + cerrada.texto + '»', cerrada);
    await p.evaluate(() => clearSearch());
    await p.evaluate(() => { toggleRoutePanel(); switchRouteTab('ab'); });
    await p.waitForTimeout(800);
    const dir = await p.evaluate(() => {
      const i = document.getElementById('addr-origin-input'); i.focus();
      const s = getComputedStyle(i);
      return { visible: i.checkVisibility(), foco: document.activeElement === i, aro: s.outlineStyle, borde: s.borderTopColor };
    });
    ok(dir.visible && dir.foco && dir.aro === 'none' && dir.borde === 'rgb(201, 168, 76)',
      'la direccion de la ruta, con el foco: sin aro, con su borde en dorado entero', dir);
    await p.evaluate(() => { document.activeElement.blur(); closeRoutePanel(); });
    await p.waitForTimeout(400);

    /* 2. el asistente */
    await p.evaluate(() => openChatPanel());
    await p.waitForTimeout(1000);
    const chat = await p.evaluate(() => {
      const i = document.getElementById('chat-input'), r = i.getBoundingClientRect();
      return { abajo: Math.round(r.bottom), alto: innerHeight, relleno: getComputedStyle(i.closest('.chat-input-row')).paddingBottom };
    });
    ok(chat.abajo <= chat.alto - 34, 'la caja del asistente queda por encima de la barra de inicio (' + chat.abajo + ' de ' + chat.alto + ', con 34 de zona segura)', chat);
    await p.evaluate(() => closeChatPanel());
    await p.waitForTimeout(400);

    /* 3. «Abriendo el mapa de la isla…» */
    const isla = await p.evaluate(() => {
      const antes = !!layers.isla;
      setStyle('isla');
      const t = document.getElementById('layer-toast'), m = document.getElementById('layer-msg');
      return { antes, aviso: t && t.style.display !== 'none' ? t.textContent : null, quiere: tx('capaIslaCargando'),
               rojo: !!m && m.style.display !== 'none' };
    });
    ok(!isla.antes && isla.aviso === isla.quiere && !isla.rojo, '«' + isla.quiere + '» sale con el aviso de las capas, no con el rojo', isla);
    const puesta = await p.waitForFunction(() => currentLayer === 'isla', null, { timeout: 20000 }).then(() => true, () => false);
    ok(puesta, 'y la isla se pone');
    const pisa = await p.evaluate(() => {
      showLayerToast('uno'); showLayerMsg('dos');
      const t = document.getElementById('layer-toast'), m = document.getElementById('layer-msg');
      const r = { normal: t.style.display, error: m.style.display };
      m.style.display = 'none';
      return r;
    });
    ok(pisa.normal === 'none' && pisa.error === 'block', 'un error quita el aviso normal que hubiera en el mismo sitio', pisa);

    /* 4. los avisos que eran alert() */
    await p.evaluate(() => toggleFavoritesView());   /* contexto nuevo: sin favoritos */
    await p.waitForTimeout(300);
    const fav = await p.evaluate(() => {
      const a = document.getElementById('aviso-app'), r = a ? a.getBoundingClientRect() : null;
      return { texto: a && a.textContent, quiere: t().favEmpty, rol: a && a.getAttribute('role'), vivo: a && a.getAttribute('aria-live'),
               z: a && getComputedStyle(a).zIndex, dentro: !!r && r.left >= 0 && r.right <= innerWidth && r.bottom <= innerHeight - 34 };
    });
    ok(fav.texto === fav.quiere && fav.rol === 'status' && fav.vivo === 'polite', 'sin favoritos: el aviso propio, con su texto y role="status"', fav);
    ok(+fav.z >= 100000 && fav.dentro, 'encima de todo (z ' + fav.z + ') y dentro de la pantalla, por encima de la barra de inicio', fav);
    await p.evaluate(() => { openShopPanel(); });
    await p.waitForTimeout(600);
    await p.evaluate(() => { const f = document.getElementById('shop-register-form'); if (f && !f.classList.contains('open')) toggleRegisterForm(); submitBusinessRegistration(); });
    await p.waitForTimeout(300);
    const campos = await p.evaluate(() => {
      const a = document.getElementById('aviso-app');
      return { texto: a && a.textContent, quiere: tx('camposObligatorios'), rol: a && a.getAttribute('role'), vivo: a && a.getAttribute('aria-live'),
               fondo: a && getComputedStyle(a).backgroundColor, letra: a && getComputedStyle(a).color };
    });
    ok(campos.texto === campos.quiere && campos.rol === 'alert' && campos.vivo === 'assertive', 'un campo obligatorio vacio: el aviso propio en su variante de error (role="alert")', campos);
    await p.evaluate(() => { try { closeShopPanel(); } catch (e) {} });
    ok(dialogos.length === 0, 'ninguna ventana del sistema (alert) en todo el recorrido', dialogos.join(' | '));
    await ctx.close();
  }

  /* ── un Android sin zona segura: el asistente, con sus 20 px de siempre ── */
  console.log('\n── un Android de 360 px ──');
  {
    const { ctx, p } = await abrir({ width: 360, height: 780 }, { top: 0, bottom: 0, left: 0, right: 0 });
    await p.evaluate(() => openChatPanel());
    await p.waitForTimeout(1000);
    const relleno = await p.evaluate(() => getComputedStyle(document.querySelector('.chat-input-row')).paddingBottom);
    ok(relleno === '20px', 'sin zona segura, la fila de escribir del asistente sigue con 20 px abajo', relleno);
    await ctx.close();
  }
  ok(errores.length === 0, 'cero errores de pagina', errores.slice(0, 3).join(' | '));
  console.log('\n' + bien + ' bien, ' + malos + ' mal');
  await b.close();
  process.exit(malos ? 1 : 0);
})().catch(e => { console.error('FALLO', e.message); process.exit(2); });
