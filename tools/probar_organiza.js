#!/usr/bin/env node
/* probar_organiza.js — «Organiza tu día», entero, en los diez idiomas
 * (13 de octubre de 2026).
 *
 * POR QUE EXISTE. Jerome: «Cámbialo también en organiza tu día. Verifica el
 * mismo tiempo todo los idioma en organiza tu día». Al recorrerlo:
 *   · entre parada y parada ponia siempre el mismo tiempo, un rotulo fijo
 *     («En guagua ~25 min»): del Teide a Arico, «~25 min» en guagua;
 *   · solo ocho de las catorce tarjetas tenian titulo de itinerario; con
 *     varias elegidas salia el nombre interno en castellano para todos
 *     («🌿 Natur · deporte»);
 *   · con un itinerario a la vista, cambiar de idioma lo dejaba en el
 *     anterior.
 *
 * QUE MIRA, en cada idioma, con el azar fijo (el mismo itinerario en todos):
 *   · paso 1, 2 y 3: cada rotulo es el de su tabla en ese idioma (tiempos,
 *     las catorce tarjetas con su subtitulo, transportes, titulos, «Cambiar
 *     tiempo», «Crear itinerario» con una tarjeta y con dos);
 *   · paso 4, con los cuatro transportes: el titulo, las acciones de cada
 *     parada y sus «title», la pausa para comer, los botones de abajo y su
 *     «title»/«aria-label», el GPX;
 *   · cada tramo, calculado otra vez aqui por su cuenta: en coche y en bici
 *     con la estimacion de las carreteras de Tenerife, a pie con el rodeo de
 *     las aceras, en guagua con lineas que existen; y que no sean todos
 *     iguales;
 *   · el titulo con cada una de las catorce tarjetas, y con tres a la vez;
 *   · Senderismo en la tarjeta Deporte y no en Naturaleza (Jerome);
 *   · cambiar de idioma con el itinerario abierto deja lo mismo que pintarlo
 *     de cero en ese idioma;
 *   · y entre idiomas: ningun texto con letras igual que en castellano, salvo
 *     nombres de sitio y los que son iguales de verdad («Picnic & BBQ»).
 *
 * Y desde el mismo dia, por la tarde, Norte, Sur o «Me da igual» (Jerome: «la
 * isla es grande, si voy de los cristianos a Santa Cruz son más de 50km»):
 *   · el paso de la zona en cada idioma, y sus dos «atras»;
 *   · con Norte o con Sur, ninguna parada de la otra zona (tampoco la comida);
 *     en castellano, ademas, las catorce tarjetas por cinco azares en cada
 *     zona; el titulo dice la zona;
 *   · Museos en el Sur (son dos): el aviso de que no hay mas, y estan todos;
 *     en el Norte, sin aviso;
 *   · «🔄 Otro» se queda en la zona y en lo elegido, y coge uno de los cinco
 *     mas cercanos a la parada que cambia.
 *
 *     node tools/probar_organiza.js [puerto]
 *     node tools/probar_organiza.js [puerto] de,zh     solo esos (y el castellano)
 */
'use strict';
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');
const PUERTO = process.argv[2] || '8766';
const BASE = 'http://127.0.0.1:' + PUERTO + '/index.html';
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const TODOS = ((html.match(/SUPPORTED_LANGS\s*=\s*\[([^\]]*)\]/) || [, ''])[1])
  .split(',').map(x => x.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
const SOLO = (process.argv[3] || '').split(',').filter(Boolean);
const IDIOMAS = SOLO.length ? TODOS.filter(l => l === 'es' || SOLO.includes(l)) : TODOS;
/* los textos del boton GPX viven dentro de su modulo y la pagina no los ve:
   se leen del fuente */
const GPX_T = require('./rotulos_app').grab('var GPX_T = {');
/* lo que es igual de verdad en castellano y en otro idioma: en todos, y en
   uno solo («Cultura» es tambien italiano) */
const IGUALES_DE_VERDAD = new Set(['Picnic & BBQ', 'GPX', '📥 GPX',
  // los pueblos del subtitulo de Norte y Sur: nombres de sitio
  'Santa Cruz, Puerto de la Cruz', 'Los Cristianos, Costa Adeje']);
const IGUAL_EN = { it: new Set(['Cultura']) };

let malos = 0, total = 0;
const caso = (nombre, ok, detalle) => {
  total++;
  if (!ok) malos++;
  console.log((ok ? '  ok   ' : ' FALLA ') + nombre + (ok || !detalle ? '' : '\n        ' + String(detalle).slice(0, 500)));
};

/* lo que se mira en la pagina: todo con el azar fijo */
const RECORRER = async () => {
  const espera = ms => new Promise(res => setTimeout(res, ms));
  const limpio = s => String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
  const L = currentLang;
  const sem = { v: 7 };
  Math.random = () => { sem.v = (sem.v * 16807) % 2147483647; return (sem.v - 1) / 2147483646; };
  const t = (tabla, k) => (tabla[k] && (tabla[k][L] || '')) || '';
  const out = { L, pasos: {}, itinerarios: {}, titulos: {}, textos: {}, zonas: {} };
  const textos = (nombre) => {
    const raiz = document.getElementById('route-panel');
    const vis = el => el && (el.checkVisibility ? el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) : !!el.offsetParent);
    const w = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT); let n; const a = [];
    while ((n = w.nextNode())) { const el = n.parentElement; if (!el || !vis(el)) continue; const x = limpio(n.textContent); if (x.length > 1) a.push(x); }
    for (const el of raiz.querySelectorAll('[title],[aria-label],[placeholder]')) if (vis(el)) for (const at of ['title', 'aria-label', 'placeholder']) { const v = el.getAttribute(at); if (v) a.push('[' + at + '] ' + limpio(v)); }
    out.textos[nombre] = a;
  };
  const abrir = () => { dpiReset(); if (!routePanelOpen) toggleRoutePanel(); switchRouteTab('planner'); };
  // ── paso 1
  abrir(); await espera(150);
  out.pasos.p1 = {
    titulo: limpio(document.getElementById('dpi-time-title').textContent), tituloFila: t(DP_UI, 'timeTitle'),
    tarjetas: [...document.querySelectorAll('#dpi-time-grid .dp-time-card')].map(c => [limpio(c.querySelector('.dp-time-label').textContent), limpio(c.querySelector('.dp-time-sub').textContent)]),
    tarjetasFila: DP_TIMES.map(o => o.tx[L] || []),
  };
  textos('paso 1');
  // ── paso 2
  dpiSelectTime('fullday'); await espera(80);
  const atras1 = document.querySelector('#dpi-step-2 button[onclick*="dpiGoBack(1)"]');
  out.pasos.p2 = {
    titulo: [limpio(document.getElementById('dpi-step-title-main').textContent), limpio(document.getElementById('dpi-step-title-sub').textContent)],
    tituloFila: DP_STEP_TITLE[L] || [],
    atras: limpio(atras1 && atras1.textContent), atrasFila: t(DP_UI, 'backTime'),
    tarjetas: [...document.querySelectorAll('#dpi-zone-grid .dp-zone-card')].map(c => [c.dataset.zone, limpio(c.querySelector('.dp-zone-label').textContent), limpio(c.querySelector('.dp-zone-sub').textContent)]),
    tarjetasFila: DP_CARDS.map(c => [c.id].concat(c.tx[L] || [])),
  };
  const tarjeta = id => document.querySelector('#dpi-zone-grid .dp-zone-card[data-zone="' + id + '"]');
  dpiToggleZone(tarjeta('naturaleza'));
  out.pasos.p2.crear1 = limpio(document.getElementById('dpi-confirm-btn').textContent);
  out.pasos.p2.crear1Fila = t(DP_UI, 'createBtn');
  dpiToggleZone(tarjeta('playa'));
  out.pasos.p2.crear2 = limpio(document.getElementById('dpi-confirm-btn').textContent);
  out.pasos.p2.crear2Fila = tx('dpiCrearVarios', { n: 2 });
  textos('paso 2');
  // ── la zona: Norte, Sur o «Me da igual»
  dpiConfirmZones(); await espera(80);
  const atrasZ = document.querySelector('#dpi-step-zona button[onclick*="dpiGoBack(2)"]');
  const activo = () => (document.querySelector('.dpi-step.active') || {}).id;
  out.pasos.pz = {
    activo: activo(),
    titulo: limpio(document.getElementById('dpi-zona-title').textContent), tituloFila: t(DP_UI, 'zonaTitle'),
    atras: limpio(atrasZ && atrasZ.textContent), atrasFila: t(DP_UI, 'backActivities'),
    tarjetas: [...document.querySelectorAll('#dpi-zona-grid .dp-time-card')].map(c => [c.dataset.opt, c.querySelector('.dp-time-icon').textContent, limpio(c.querySelector('.dp-time-label').textContent), limpio(c.querySelector('.dp-time-sub').textContent)]),
    tarjetasFila: DP_ZONAS.map(o => [o.id, o.icon].concat(o.tx[L] || [])),
    norteSurRuta: [(LANGS[L] || {}).daytripZoneNorth, (LANGS[L] || {}).daytripZoneSouth],
  };
  textos('paso zona');
  // ── paso 3
  dpiSelectZona('igual'); await espera(80);
  out.pasos.pz.tras = activo();
  const atras2 = document.querySelector('#dpi-step-3 button[onclick*="dpiGoBack(\'zona\')"]');
  out.pasos.p3 = {
    titulo: limpio(document.getElementById('dpi-transport-title').textContent), tituloFila: t(DP_UI, 'transportTitle'),
    atras: limpio(atras2 && atras2.textContent), atrasFila: t(DP_UI, 'backZona'),
    tarjetas: [...document.querySelectorAll('#dpi-transport-grid .dp-time-card')].map(c => [limpio(c.querySelector('.dp-time-label').textContent), limpio(c.querySelector('.dp-time-sub').textContent)]),
    tarjetasFila: DP_TRANSPORT.map(o => o.tx[L] || []),
    preparando: limpio(document.querySelector('#dpi-loading [data-tx="dpiPreparando"]').textContent), preparandoFila: tx('dpiPreparando'),
  };
  textos('paso 3');
  // los «atras»: del transporte a la zona, y de la zona a las actividades
  dpiGoBack('zona'); out.pasos.pz.atrasDesde3 = activo();
  dpiGoBack(2); out.pasos.pz.atrasDesdeZona = activo();
  // ── paso 4, con cada transporte
  const genera = async (tiempo, zonas, modo, zona) => {
    sem.v = 7;
    abrir(); dpiSelectTime(tiempo);
    zonas.forEach(z => dpiToggleZone(tarjeta(z)));
    dpiConfirmZones();
    dpiSelectZona(zona || 'igual');
    dpiSelectTransport(modo, document.querySelector('#dpi-transport-grid .dp-time-card[data-opt="' + modo + '"]'));
    await espera(1150);
    const pie = document.querySelector('#dpi-step-4 .dpi-footer');
    const av = document.getElementById('dpi-zona-aviso');
    const r = {
      titulo: limpio(document.getElementById('dpi-result-title').textContent),
      aviso: av && !av.hidden ? limpio(av.textContent) : '',
      paradas: dpCurrentStops.map(p => ({ id: p.id, lat: p.lat, lng: p.lng, cat: p.category, zona: DP_ZONA_DE.get(p.id) || '' })),
      nombres: [...document.querySelectorAll('#dpi-itinerary .dp-stop-name')].map(e => limpio(e.textContent)),
      tramos: [...document.querySelectorAll('#dpi-itinerary .dp-sep-text')].map(e => limpio(e.textContent)),
      lineas: [...document.querySelectorAll('#dpi-itinerary .dp-sep-text .line-badge')].map(e => limpio(e.textContent)),
      acciones: [...document.querySelectorAll('#dpi-itinerary .dp-stop')].map(s => ({
        ver: limpio((s.querySelector('.dp-stop-tag') || {}).textContent), llegar: limpio((s.querySelector('.dp-nav-btn') || {}).textContent),
        otro: limpio((s.querySelector('.dp-swap-btn') || {}).textContent), otroTitle: (s.querySelector('.dp-swap-btn') || { getAttribute: () => '' }).getAttribute('title'),
        meta: limpio((s.querySelector('.dp-stop-meta') || {}).textContent), desc: limpio((s.querySelector('.dp-stop-desc') || {}).textContent) })),
      pie: pie ? [...pie.querySelectorAll('button')].map(b => [b.getAttribute('title') || '', b.getAttribute('aria-label') || '']) : [],
      gpx: limpio((document.getElementById('gpx-day-btn') || {}).textContent),
    };
    return r;
  };
  for (const modo of ['coche', 'guagua', 'pie', 'bici']) {
    out.itinerarios[modo] = await genera(modo === 'pie' ? 'halfday' : 'fullday', ['cultura', 'gastronomia'], modo);
    textos('itinerario ' + modo);
  }
  out.filas = {
    verMapa: t(DP_UI, 'verMapa'), comoLlegar: tx('comoLlegarNav'), otro: t(DP_UI, 'otroLugar'), cambiarEste: t(DP_UI, 'cambiarEste'),
    pausa: t(DP_UI, 'pausaComida'), min: tx('routeMin'), km: tx('unidadKm'), sinGuagua: tx('dpSinGuagua'),
    pie: [[tx('tRegenerar'), ''], ['', tx('ariaVolverAtras')], [tx('tGuardarRutaDia'), ''], [tx('tGuardarFavoritos'), ''], ['', tx('ariaCompartirItinerario')]],
    decimal: (1.5).toLocaleString(PRECIOS_GAS_LOCALE[L]).replace(/\d/g, ''),
    lineasExisten: TITSA_LINES.map(l => String(l.numero)),
  };
  // ── el titulo con cada tarjeta, y con tres a la vez
  for (const c of DP_CARDS) {
    const r = await genera('afternoon', [c.id], 'coche');
    out.titulos[c.id] = { titulo: r.titulo, fila: c.id === 'mix' ? t(DP_UI, 'zMix') : c.icon + ' ' + (c.tx[L] || [])[0] };
  }
  {
    const r = await genera('afternoon', ['deporte', 'aventura', 'petfriendly'], 'coche');
    out.titulos.tres = { titulo: r.titulo, fila: ['deporte', 'aventura', 'petfriendly'].map(id => { const c = DP_CARDS.find(x => x.id === id); return c.icon + ' ' + c.tx[L][0]; }).join(' · ') };
  }
  out.deporte = DP_ZONES.deporte.slice(); out.naturaleza = DP_ZONES.naturaleza.slice();
  // ── Norte y Sur
  const etZona = id => { const o = DP_ZONAS.find(x => x.id === id); return o.icon + ' ' + o.tx[L][0]; };
  const etTarjetas = ids => ids.map(id => { const c = DP_CARDS.find(x => x.id === id); return c.icon + ' ' + c.tx[L][0]; }).join(' · ');
  for (const zona of ['norte', 'sur']) {
    const r = await genera('fullday', ['playa', 'gastronomia'], 'coche', zona);
    r.tituloFila = etTarjetas(['playa', 'gastronomia']) + ' · ' + etZona(zona);
    out.zonas[zona] = r;
    textos('itinerario ' + zona);
  }
  // «🔄 Otro» en el Sur, parada por parada
  {
    const hav = (a, b) => haversineKm(a.lat, a.lng, b.lat, b.lng);
    const cambios = [];
    for (let i = 0; i < dpCurrentStops.length; i++) {
      const antes = dpCurrentStops[i], usados = new Set(dpUsedIds);
      const cats = dpiCategorias().concat([antes.category]);
      const cand = places.filter(p => cats.includes(p.category) && !usados.has(p.id) && p.name && p.lat && p.lng && DP_ZONA_DE.get(p.id) === 'sur')
        .map(p => ({ id: p.id, cat: p.category, d: hav(antes, p) })).sort((a, b) => a.d - b.d);
      const misma = cand.filter(x => x.cat === antes.category);
      const esperados = (misma.length ? misma : cand).slice(0, 5).map(x => x.id);
      dpiSwapOne(i);
      const despues = dpCurrentStops[i];
      cambios.push({ antes: antes.id, despues: despues.id, zona: DP_ZONA_DE.get(despues.id) || '', esperado: esperados.includes(despues.id), esperados });
    }
    out.zonas.otro = cambios;
  }
  for (const zona of ['sur', 'norte']) {
    const r = await genera('fullday', ['museo'], 'coche', zona);
    r.hay = places.filter(p => DP_ZONES.museo.includes(p.category) && DP_ZONA_DE.get(p.id) === zona).map(p => p.id);
    r.avisoFila = tx('dpZonaSinMas');
    out.zonas['museo-' + zona] = r;
    if (zona === 'sur') textos('itinerario museos en el sur');
  }
  // en castellano, las catorce tarjetas por cinco azares en cada zona
  if (L === 'es') {
    const malas = []; let n = 0;
    for (const c of DP_CARDS) for (const zona of ['norte', 'sur']) for (let k = 1; k <= 5; k++) {
      sem.v = 1000 + k;
      dpiReset(); dpiTime = 'fullday'; dpiSelectedZones = [c.id]; dpiZone = c.id; dpiZona = zona; dpiTransport = 'coche';
      dpiGenerate(); n++;
      dpCurrentStops.forEach(p => { if (DP_ZONA_DE.get(p.id) !== zona) malas.push(c.id + '/' + zona + ': ' + p.id); });
    }
    out.zonas.azar = { n, malas };
    out.zonas.sinZona = places.filter(p => !DP_ZONA_DE.has(p.id)).map(p => p.id);
  }
  closeRoutePanel();
  return out;
};

(async () => {
  const nav = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const abrirPagina = async (L) => {
    const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
    const pg = await ctx.newPage();
    const errores = [];
    pg.on('pageerror', e => errores.push(e.message));
    await pg.route('**/router.project-osrm.org/**', r => r.abort());
    await pg.addInitScript(l => { try { localStorage.setItem('tenerife.tour.seen', '99'); localStorage.setItem('tenerife.welcome.seen', '1'); localStorage.setItem('tgo_consent', JSON.stringify({ v: 'denied', t: Date.now() })); localStorage.setItem('tenerife.lang', l); } catch (e) {} }, L);
    await pg.goto(BASE, { waitUntil: 'networkidle' });
    await pg.waitForFunction(() => typeof dpiRenderCards === 'function' && typeof TITSA_LINES !== 'undefined' && TITSA_LINES.length > 0, null, { timeout: 30000 });
    await pg.evaluate(l => setLang(l), L);
    await pg.waitForTimeout(400);
    return { ctx, pg, errores };
  };
  const res = {};
  for (const L of IDIOMAS) {
    const { ctx, pg, errores } = await abrirPagina(L);
    res[L] = await pg.evaluate(RECORRER);
    res[L].errores = errores;
    // cambiar de idioma con el itinerario abierto: se pinta en castellano y se pasa a L
    if (L !== 'es') {
      res[L].cambio = await pg.evaluate(async (L) => {
        const espera = ms => new Promise(r => setTimeout(r, ms));
        setLang('es'); await espera(300);
        let v = 7; Math.random = () => { v = (v * 16807) % 2147483647; return (v - 1) / 2147483646; };
        dpiReset(); if (!routePanelOpen) toggleRoutePanel(); switchRouteTab('planner');
        dpiSelectTime('fullday');
        ['cultura', 'gastronomia'].forEach(z => dpiToggleZone(document.querySelector('#dpi-zone-grid .dp-zone-card[data-zone="' + z + '"]')));
        dpiConfirmZones(); dpiSelectZona('igual'); dpiSelectTransport('coche', document.querySelector('#dpi-transport-grid .dp-time-card[data-opt="coche"]'));
        await espera(1150);
        setLang(L); await espera(400);
        const limpio = s => String(s || '').replace(/\s+/g, ' ').trim();
        return { titulo: limpio(document.getElementById('dpi-result-title').textContent),
          tramos: [...document.querySelectorAll('#dpi-itinerary .dp-sep-text')].map(e => limpio(e.textContent)),
          ver: limpio((document.querySelector('#dpi-itinerary .dp-stop-tag') || {}).textContent),
          desc: [...document.querySelectorAll('#dpi-itinerary .dp-stop-desc')].map(e => limpio(e.textContent)) };
      }, L);
    }
    await ctx.close();
  }
  await nav.close();

  // ── lo que tiene que dar cada tramo, calculado aqui otra vez
  const hav = (a, b) => { const R = 6371, r = x => x * Math.PI / 180, dl = r(b.lat - a.lat), dn = r(b.lng - a.lng);
    const s = Math.sin(dl / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dn / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(s)); };
  const coche = recta => { const f = recta < 15 ? [1.6, 35] : recta < 40 ? [1.45, 42] : [1.25, 60]; const km = recta * f[0]; return { km, min: Math.round(km / f[1] * 60) }; };
  const fmt = (n, dec) => n.toFixed(1).replace('.', dec);

  for (const L of IDIOMAS) {
    const d = res[L], F = d.filas;
    console.log('\n=== ' + L + ' ===');
    const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    caso(`[${L}] paso 1: titulo y los cuatro tiempos`, d.pasos.p1.titulo === d.pasos.p1.tituloFila && igual(d.pasos.p1.tarjetas, d.pasos.p1.tarjetasFila), JSON.stringify(d.pasos.p1));
    caso(`[${L}] paso 2: titulo, «Cambiar tiempo» y las ${d.pasos.p2.tarjetasFila.length} tarjetas`, igual(d.pasos.p2.titulo, d.pasos.p2.tituloFila) && d.pasos.p2.atras === d.pasos.p2.atrasFila && igual(d.pasos.p2.tarjetas, d.pasos.p2.tarjetasFila), JSON.stringify(d.pasos.p2).slice(0, 500));
    caso(`[${L}] paso 2: «Crear itinerario» con una tarjeta y con dos`, d.pasos.p2.crear1 === d.pasos.p2.crear1Fila && d.pasos.p2.crear2 === d.pasos.p2.crear2Fila && !!d.pasos.p2.crear1 && !!d.pasos.p2.crear2, JSON.stringify([d.pasos.p2.crear1, d.pasos.p2.crear2]));
    const pz = d.pasos.pz;
    caso(`[${L}] zona: el paso sale tras las actividades, con titulo, «${pz.atrasFila}» y Norte, Sur y «${(pz.tarjetasFila[2] || [])[2]}»`,
      pz.activo === 'dpi-step-zona' && pz.titulo === pz.tituloFila && !!pz.titulo && pz.atras === pz.atrasFila && igual(pz.tarjetas, pz.tarjetasFila) && pz.tarjetas.length === 3,
      JSON.stringify(pz).slice(0, 500));
    caso(`[${L}] zona: Norte y Sur se llaman como en «Ruta del día»`, igual([pz.tarjetas[0][2], pz.tarjetas[1][2]], pz.norteSurRuta), JSON.stringify([pz.tarjetas.map(x => x[2]), pz.norteSurRuta]));
    caso(`[${L}] zona: al elegirla, el transporte; «atras» vuelve a la zona y de ahi a las actividades`,
      pz.tras === 'dpi-step-3' && pz.atrasDesde3 === 'dpi-step-zona' && pz.atrasDesdeZona === 'dpi-step-2', JSON.stringify([pz.tras, pz.atrasDesde3, pz.atrasDesdeZona]));
    caso(`[${L}] paso 3: titulo, «Cambiar zona», transportes y «Preparando…»`, d.pasos.p3.titulo === d.pasos.p3.tituloFila && d.pasos.p3.atras === d.pasos.p3.atrasFila && igual(d.pasos.p3.tarjetas, d.pasos.p3.tarjetasFila) && d.pasos.p3.preparando === d.pasos.p3.preparandoFila, JSON.stringify(d.pasos.p3).slice(0, 400));
    for (const modo of ['coche', 'guagua', 'pie', 'bici']) {
      const it = d.itinerarios[modo];
      const n = it.paradas.length;
      caso(`[${L}] ${modo}: ${n} paradas, ${it.tramos.length} tramos`, n >= 2 && it.tramos.length === n - 1, JSON.stringify(it.tramos));
      const malTramo = [];
      for (let i = 0; i < it.tramos.length; i++) {
        const a = it.paradas[i], b = it.paradas[i + 1], recta = hav(a, b), x = it.tramos[i];
        let esperado = null;
        if (modo === 'coche') { const c = coche(recta); esperado = '~' + c.min + ' ' + F.min + ' · ' + fmt(c.km, F.decimal) + ' ' + F.km; }
        else if (modo === 'pie') { const km = recta * 1.3; esperado = '~' + Math.round(km / 4.5 * 60) + ' ' + F.min + ' · ' + fmt(km, F.decimal) + ' ' + F.km; }
        else if (modo === 'bici') { esperado = fmt(coche(recta).km, F.decimal) + ' ' + F.km; }
        if (esperado !== null) { if (x !== esperado) malTramo.push(x + ' ≠ ' + esperado); }
        else if (x !== F.sinGuagua && !new RegExp('^~\\d+ ' + F.min.replace('.', '\\.') + ' · ').test(x)) malTramo.push(x);
      }
      caso(`[${L}] ${modo}: cada tramo es el calculado`, malTramo.length === 0, malTramo.join(' | '));
      if (modo === 'guagua') caso(`[${L}] guagua: las lineas de los tramos existen`, it.lineas.length > 0 && it.lineas.every(l => F.lineasExisten.includes(l)), it.lineas.join(','));
      if (it.tramos.length >= 3) caso(`[${L}] ${modo}: los tramos no son todos iguales`, new Set(it.tramos).size > 1, it.tramos.join(' | '));
      const acc = it.acciones;
      caso(`[${L}] ${modo}: acciones de cada parada en su idioma`, acc.every(a => a.ver === F.verMapa && a.llegar === F.comoLlegar && a.otro === F.otro && a.otroTitle === F.cambiarEste),
        JSON.stringify(acc[0]));
      caso(`[${L}] ${modo}: minutos de visita en «${F.min}»`, acc.every(a => new RegExp('~\\d+ ' + F.min.replace('.', '\\.')).test(a.meta)), acc.map(a => a.meta).join(' | '));
      const comida = acc.filter(a => a.meta.includes(F.pausa));
      if (modo !== 'pie' || comida.length) caso(`[${L}] ${modo}: la pausa para comer dice «${F.pausa}»`, comida.length >= 1, acc.map(a => a.meta).join(' | '));
      caso(`[${L}] ${modo}: botones de abajo, su «title» y su «aria-label»`, igual(it.pie, F.pie), JSON.stringify(it.pie));
      const gpx = (GPX_T[L] || {}).btnDay;
      caso(`[${L}] ${modo}: el boton GPX dice «${gpx}»`, !!gpx && it.gpx === gpx, it.gpx);
    }
    const tit = Object.entries(d.titulos).filter(([, v]) => v.titulo !== v.fila);
    caso(`[${L}] titulo del itinerario con cada tarjeta (${Object.keys(d.titulos).length - 1}) y con tres a la vez`, tit.length === 0, tit.map(([k, v]) => k + ': «' + v.titulo + '» y no «' + v.fila + '»').join(' | '));
    for (const zona of ['norte', 'sur']) {
      const z = d.zonas[zona], fuera = z.paradas.filter(p => p.zona !== zona);
      caso(`[${L}] ${zona}: las ${z.paradas.length} paradas (con la comida) son de esa zona`, z.paradas.length >= 4 && fuera.length === 0, fuera.map(p => p.id + '=' + (p.zona || 'sin zona')).join(', '));
      caso(`[${L}] ${zona}: el titulo dice la zona («${z.tituloFila}»)`, z.titulo === z.tituloFila && !z.aviso, JSON.stringify([z.titulo, z.aviso]));
    }
    {
      const o = d.zonas.otro, mal = o.filter(x => x.zona !== 'sur' || !x.esperado || x.despues === x.antes);
      caso(`[${L}] «Otro» en el Sur: ${o.length} cambios, en el Sur, en lo elegido y entre los cinco mas cercanos`, o.length >= 4 && mal.length === 0, JSON.stringify(mal).slice(0, 400));
      const ms = d.zonas['museo-sur'], mn = d.zonas['museo-norte'];
      const museosSur = ms.paradas.filter(p => p.cat !== 'gastronomia').map(p => p.id).sort();
      caso(`[${L}] Museos en el Sur: estan los ${ms.hay.length} que hay y lo dice («${ms.avisoFila}»)`,
        ms.hay.length > 0 && JSON.stringify(museosSur) === JSON.stringify(ms.hay.slice().sort()) && ms.aviso === ms.avisoFila && !!ms.aviso, JSON.stringify([museosSur, ms.hay, ms.aviso]));
      caso(`[${L}] Museos en el Norte: sin aviso, que hay ${mn.hay.length}`, !mn.aviso && mn.paradas.every(p => p.zona === 'norte'), JSON.stringify([mn.aviso, mn.paradas.map(p => p.id)]));
    }
    if (d.zonas.azar) {
      caso(`[es] ${d.zonas.azar.n} itinerarios (catorce tarjetas, Norte y Sur, cinco azares): ninguna parada de la otra zona`, d.zonas.azar.malas.length === 0, d.zonas.azar.malas.slice(0, 8).join(' | '));
      caso(`[es] todos los lugares tienen zona`, d.zonas.sinZona.length === 0, d.zonas.sinZona.slice(0, 8).join(', '));
    }
    caso(`[${L}] Senderismo en la tarjeta Deporte y no en Naturaleza`, d.deporte.includes('senderismo') && !d.naturaleza.includes('senderismo'), JSON.stringify([d.deporte, d.naturaleza]));
    if (d.cambio) {
      const c = d.cambio, it = d.itinerarios.coche;
      caso(`[${L}] cambiar de idioma con el itinerario abierto: queda en ${L}`, c.titulo === it.titulo && JSON.stringify(c.tramos) === JSON.stringify(it.tramos) && c.ver === F.verMapa && JSON.stringify(c.desc) === JSON.stringify(it.acciones.map(a => a.desc)),
        JSON.stringify({ c: [c.titulo, c.ver, c.tramos[0], c.desc[0]], debe: [it.titulo, F.verMapa, it.tramos[0], (it.acciones[0] || {}).desc] }));
    }
    caso(`[${L}] sin errores de pagina`, d.errores.length === 0, d.errores.join(' / '));
  }

  // ── entre idiomas: nada con letras igual que en castellano
  console.log('\n=== textos iguales que en castellano ===');
  const nombres = new Set();
  for (const L of IDIOMAS) for (const m of ['coche', 'guagua', 'pie', 'bici']) res[L].itinerarios[m].nombres.forEach(n => nombres.add(n));
  for (const L of IDIOMAS) for (const r of Object.values(res[L].zonas)) if (r && r.nombres) r.nombres.forEach(n => nombres.add(n));
  for (const L of IDIOMAS) {
    if (L === 'es') continue;
    const iguales = [];
    for (const [estado, ts] of Object.entries(res[L].textos)) {
      const es = new Set(res.es.textos[estado] || []);
      for (const x of ts) {
        const sin = x.replace(/^\[[a-z-]+\] /, '');
        if (!es.has(x) || nombres.has(sin) || IGUALES_DE_VERDAD.has(sin) || (IGUAL_EN[L] && IGUAL_EN[L].has(sin))) continue;
        if (!/\p{L}{3,}/u.test(sin.replace(/\b(min|km|TITSA|GPS|GPX|A→B)\b/g, ''))) continue;
        iguales.push(estado + ': «' + x.slice(0, 70) + '»');
      }
    }
    caso(`[${L}] ningun texto con letras igual que en castellano`, iguales.length === 0, [...new Set(iguales)].slice(0, 8).join(' | '));
  }

  console.log('\n' + (malos ? malos + ' de ' + total + ' fallan' : total + ' de ' + total));
  process.exit(malos ? 1 : 0);
})().catch(e => { console.error(e && e.stack || e); process.exit(2); });
