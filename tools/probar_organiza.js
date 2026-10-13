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
 *     mas cercanos a la parada que cambia;
 *   · el Teide (sus dos fichas), su teleferico y los Roques de Garcia, en el
 *     Norte y en el Sur; La Ruleta y Masca, solo en el Norte (Jerome: «el
 *     teid debe salir en sur y norte, igual por su teleférico, Roque garcia.
 *     El resto es norte»).
 *
 * Y nunca dos paradas del mismo sitio (Jerome: «Hazlo y bien pensado»): se
 * mira aqui con su propio codigo, no con el de la app. Mismo sitio: la misma
 * coordenada exacta, el mismo nombre a menos de 1 km o el Teide (el volcan,
 * la cumbre y su ficha con perro). En castellano:
 *   · las 57 parejas con la misma coordenada, el Teide y «Mesa del Mar» son
 *     un sitio para la app; el Drago y la Casa del Drago, o Masca y su
 *     mirador, no;
 *   · 210 itinerarios (catorce tarjetas, Norte, Sur y toda la isla, cinco
 *     azares) y «Naturaleza» en el Sur con sesenta azares: ninguno repite;
 *   · kayak y pesca en el Sur, siete fichas en cinco sitios: salen cinco
 *     paradas, una por sitio, y el aviso de que no hay mas;
 *   · «🔄 Otro» no trae nunca el mismo sitio ni repite otro del itinerario;
 *   · y en las sugerencias de «Ruta del día», cada sitio una vez.
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
      paradas: dpCurrentStops.map(p => ({ id: p.id, lat: p.lat, lng: p.lng, cat: p.category, zonas: ['norte', 'sur'].filter(z => DP_ZONA_DE[z].has(p.id)) })),
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
  /* «el mismo sitio», con codigo propio: la misma coordenada exacta, el mismo
     nombre (sin emojis, tildes ni mayusculas) a menos de 1 km, o el Teide */
  const km = (a, b) => { const R = 6371, r = x => x * Math.PI / 180, dl = r(b.lat - a.lat), dn = r(b.lng - a.lng);
    const h = Math.sin(dl / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dn / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };
  const pliega = n => String(n).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  const TEIDE = ['teide', 'pico-teide-cumbre', 'teide-petfriendly'];
  const mismo = (a, b) => a.id === b.id || (a.lat === b.lat && a.lng === b.lng) || (pliega(a.name) === pliega(b.name) && km(a, b) <= 1) || (TEIDE.includes(a.id) && TEIDE.includes(b.id));
  const repetidos = lista => { const r = []; for (let i = 0; i < lista.length; i++) for (let j = i + 1; j < lista.length; j++) if (mismo(lista[i], lista[j])) r.push(lista[i].id + '=' + lista[j].id); return r; };
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
      const cand = places.filter(p => cats.includes(p.category) && !usados.has(p.id) && p.name && p.lat && p.lng && DP_ZONA_DE.sur.has(p.id) && !dpCurrentStops.some(st => dpMismoSitio(st, p)))
        .map(p => ({ id: p.id, cat: p.category, d: hav(antes, p) })).sort((a, b) => a.d - b.d);
      const misma = cand.filter(x => x.cat === antes.category);
      const esperados = (misma.length ? misma : cand).slice(0, 5).map(x => x.id);
      dpiSwapOne(i);
      const despues = dpCurrentStops[i];
      cambios.push({ antes: antes.id, despues: despues.id, enSur: DP_ZONA_DE.sur.has(despues.id), esperado: esperados.includes(despues.id), esperados,
        mismoSitio: mismo(antes, despues), repetidos: repetidos(dpCurrentStops) });
    }
    out.zonas.otro = cambios;
  }
  for (const zona of ['sur', 'norte']) {
    const r = await genera('fullday', ['museo'], 'coche', zona);
    r.hay = places.filter(p => DP_ZONES.museo.includes(p.category) && DP_ZONA_DE[zona].has(p.id)).map(p => p.id);
    r.avisoFila = tx('dpZonaSinMas');
    out.zonas['museo-' + zona] = r;
    if (zona === 'sur') textos('itinerario museos en el sur');
  }
  // en castellano, las catorce tarjetas por cinco azares en cada zona
  if (L === 'es') {
    const malas = [], dobles = []; let n = 0;
    for (const c of DP_CARDS) for (const zona of ['norte', 'sur', 'igual']) for (let k = 1; k <= 5; k++) {
      sem.v = 1000 + k;
      dpiReset(); dpiTime = 'fullday'; dpiSelectedZones = [c.id]; dpiZone = c.id; dpiZona = zona; dpiTransport = 'coche';
      dpiGenerate(); n++;
      dpCurrentStops.forEach(p => { if (zona !== 'igual' && !DP_ZONA_DE[zona].has(p.id)) malas.push(c.id + '/' + zona + ': ' + p.id); });
      repetidos(dpCurrentStops).forEach(x => dobles.push(c.id + '/' + zona + ': ' + x));
    }
    out.zonas.azar = { n, malas, dobles };
    // «Naturaleza» en el Sur, sesenta azares: el Teide, una vez como mucho
    const teide = [];
    for (let k = 1; k <= 60; k++) {
      sem.v = k;
      dpiReset(); dpiTime = 'halfday'; dpiSelectedZones = ['naturaleza']; dpiZone = 'naturaleza'; dpiZona = 'sur'; dpiTransport = 'coche';
      dpiGenerate();
      const t = dpCurrentStops.filter(p => TEIDE.includes(p.id)).map(p => p.id);
      if (t.length > 1 || repetidos(dpCurrentStops).length) teide.push(k + ': ' + dpCurrentStops.map(p => p.id).join(','));
    }
    out.zonas.teide60 = teide;
    // los datos: lo que la app junta y lo que no
    const plan = new Set(); DP_CARDS.forEach(c => c.cats.forEach(x => plan.add(x))); plan.add('gastronomia');
    const P = places.filter(p => plan.has(p.category) && p.name && p.lat && p.lng);
    let parejas = 0; const sueltas = [];
    for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) if (P[i].lat === P[j].lat && P[i].lng === P[j].lng) {
      parejas++; if (!dpMismoSitio(P[i], P[j])) sueltas.push(P[i].id + '/' + P[j].id); }
    const id = x => places.find(p => p.id === x);
    const juntos = [['teide', 'pico-teide-cumbre'], ['teide', 'teide-petfriendly'], ['mesa-mar', 'nucleo-mesa-mar']];
    const separados = [['icod', 'restaurante-drago'], ['puertito-los-abrigos', 'zona-mariscos-los-abrigos'], ['masca', 'mirador-maska'], ['teide', 'teide-teleforico'], ['teide', 'mir-rambleta-teide']];
    out.zonas.datos = { parejas, sueltas,
      juntos: juntos.map(([a, b]) => [a, b, !!id(a) && !!id(b) && dpMismoSitio(id(a), id(b))]),
      separados: separados.map(([a, b]) => [a, b, !!id(a) && !!id(b) && !dpMismoSitio(id(a), id(b))]),
      grupoExiste: DP_MISMO_SITIO.every(g => g.every(x => !!id(x))) };
    // kayak y pesca en el Sur: siete fichas, cinco sitios
    DP_ZONES.__prueba = ['kayak', 'pesca'];
    sem.v = 7;
    dpiReset(); dpiTime = 'fullday'; dpiSelectedZones = ['__prueba']; dpiZone = '__prueba'; dpiZona = 'sur'; dpiTransport = 'coche';
    document.querySelectorAll('.dpi-step').forEach(x => x.classList.remove('active'));
    document.getElementById('dpi-step-4').classList.add('active');
    dpiGenerate();
    const fichas = places.filter(p => DP_ZONES.__prueba.includes(p.category) && DP_ZONA_DE.sur.has(p.id));
    const sitiosPropios = [];
    fichas.forEach(p => { if (!sitiosPropios.some(q => mismo(p, q))) sitiosPropios.push(p); });
    const paradas = dpCurrentStops.filter(p => p.category !== 'gastronomia');
    const av = document.getElementById('dpi-zona-aviso');
    // «Otro» sin otro sitio libre: no cambia
    const antes = dpCurrentStops.map(p => p.id).join(',');
    for (let i = 0; i < dpCurrentStops.length; i++) if (dpCurrentStops[i].category !== 'gastronomia') dpiSwapOne(i);
    out.zonas.kayakPesca = { fichas: fichas.length, sitios: sitiosPropios.length, paradas: paradas.map(p => p.id), repetidos: repetidos(dpCurrentStops),
      aviso: av && !av.hidden ? av.textContent.trim() : '', avisoFila: tx('dpZonaSinMas'),
      otroIgual: antes === dpCurrentStops.map(p => p.id).join(','), otroRepite: repetidos(dpCurrentStops) };
    delete DP_ZONES.__prueba;
    // «Ruta del día»: en sus sugerencias, cada sitio una vez
    out.zonas.rutaDia = Object.keys(DAY_TRIP_ZONES).map(z => {
      selectDayTripZone(z);
      const ids = [...document.querySelectorAll('#daytrip-catalog-list .catalog-item-add')]
        .map(b => ((b.getAttribute('onclick') || '').match(/toggleDayTripStop\('([^']+)'\)/) || [])[1]).filter(Boolean);
      const vistos = ids.map(i => places.find(p => p.id === i)).filter(Boolean);
      const lista = DAY_TRIP_ZONES[z].suggestionIds.map(i => places.find(p => p.id === i)).filter(Boolean);
      const sitios = []; lista.forEach(p => { if (!sitios.some(q => mismo(p, q))) sitios.push(p); });
      return { z, items: vistos.length, sitios: sitios.length, fichas: lista.length, repetidos: repetidos(vistos) };
    });
    currentDayTripZone = null;
    out.zonas.sinZona = places.filter(p => !DP_ZONA_DE.norte.has(p.id) && !DP_ZONA_DE.sur.has(p.id)).map(p => p.id);
  }
  /* el Teide, su teleferico y los Roques de Garcia, en las dos; lo demas de
     Las Cañadas y Masca, solo en el Norte: con el mismo filtro que usa el
     itinerario y la tarjeta que los trae */
  {
    const entra = (zona, tarjeta, id) => { dpiZona = zona; const cats = DP_ZONES[tarjeta];
      return places.some(p => p.id === id && cats.includes(p.category) && dpiEnZona(p)); };
    const dos = [['naturaleza', 'teide'], ['naturaleza', 'pico-teide-cumbre'], ['familia', 'teide-teleforico'], ['naturaleza', 'roques-garcia']];
    const norte = [['naturaleza', 'mirador-ruleta-canadas'], ['naturaleza', 'llano-ucanca'], ['naturaleza', 'masca'], ['naturaleza', 'acantilados-gigantes']];
    out.zonas.lasDos = {
      dos: dos.map(([t, id]) => [id, entra('norte', t, id), entra('sur', t, id)]),
      norte: norte.map(([t, id]) => [id, entra('norte', t, id), entra('sur', t, id)]),
    };
    dpiZona = 'igual';
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
      const z = d.zonas[zona], fuera = z.paradas.filter(p => !p.zonas.includes(zona));
      caso(`[${L}] ${zona}: las ${z.paradas.length} paradas (con la comida) son de esa zona`, z.paradas.length >= 4 && fuera.length === 0, fuera.map(p => p.id + '=' + (p.zonas.join('+') || 'sin zona')).join(', '));
      caso(`[${L}] ${zona}: el titulo dice la zona («${z.tituloFila}»)`, z.titulo === z.tituloFila && !z.aviso, JSON.stringify([z.titulo, z.aviso]));
    }
    {
      const o = d.zonas.otro, mal = o.filter(x => !x.enSur || !x.esperado || x.despues === x.antes || x.mismoSitio || x.repetidos.length);
      caso(`[${L}] «Otro» en el Sur: ${o.length} cambios, en el Sur, en lo elegido, entre los cinco mas cercanos y sin repetir sitio`, o.length >= 4 && mal.length === 0, JSON.stringify(mal).slice(0, 400));
      const ms = d.zonas['museo-sur'], mn = d.zonas['museo-norte'];
      const museosSur = ms.paradas.filter(p => p.cat !== 'gastronomia').map(p => p.id).sort();
      caso(`[${L}] Museos en el Sur: estan los ${ms.hay.length} que hay y lo dice («${ms.avisoFila}»)`,
        ms.hay.length > 0 && JSON.stringify(museosSur) === JSON.stringify(ms.hay.slice().sort()) && ms.aviso === ms.avisoFila && !!ms.aviso, JSON.stringify([museosSur, ms.hay, ms.aviso]));
      caso(`[${L}] Museos en el Norte: sin aviso, que hay ${mn.hay.length}`, !mn.aviso && mn.paradas.every(p => p.zonas.includes('norte')), JSON.stringify([mn.aviso, mn.paradas.map(p => p.id)]));
      const ld = d.zonas.lasDos;
      caso(`[${L}] el Teide (sus dos fichas), su teleferico y los Roques de Garcia salen en el Norte y en el Sur`, ld.dos.every(([, n, s]) => n && s), JSON.stringify(ld.dos));
      caso(`[${L}] La Ruleta, el Llano de Ucanca, Masca y los Acantilados de Los Gigantes, solo en el Norte`, ld.norte.every(([, n, s]) => n && !s), JSON.stringify(ld.norte));
    }
    if (d.zonas.azar) {
      caso(`[es] ${d.zonas.azar.n} itinerarios (catorce tarjetas, Norte, Sur y toda la isla, cinco azares): ninguna parada de la otra zona`, d.zonas.azar.malas.length === 0, d.zonas.azar.malas.slice(0, 8).join(' | '));
      caso(`[es] los mismos ${d.zonas.azar.n}: ninguno con dos paradas del mismo sitio`, d.zonas.azar.dobles.length === 0, d.zonas.azar.dobles.slice(0, 8).join(' | '));
      caso(`[es] «Naturaleza» en el Sur con sesenta azares: el Teide, una vez como mucho, y nada repetido`, d.zonas.teide60.length === 0, d.zonas.teide60.slice(0, 4).join(' | '));
      const dt = d.zonas.datos;
      caso(`[es] las ${dt.parejas} parejas con la misma coordenada exacta son un sitio para la app`, dt.parejas === 57 && dt.sueltas.length === 0, JSON.stringify([dt.parejas, dt.sueltas.slice(0, 6)]));
      caso(`[es] el Teide (volcan, cumbre y su ficha con perro) y las dos «Mesa del Mar», un sitio cada uno`, dt.grupoExiste && dt.juntos.every(x => x[2]), JSON.stringify(dt.juntos));
      caso(`[es] lo cercano que es otra cosa sigue aparte (el Drago y su restaurante, Masca y su mirador, el Teide y su teleferico)`, dt.separados.every(x => x[2]), JSON.stringify(dt.separados));
      const kp = d.zonas.kayakPesca;
      caso(`[es] kayak y pesca en el Sur (${kp.fichas} fichas, ${kp.sitios} sitios): ${kp.sitios} paradas, una por sitio, y el aviso`,
        kp.fichas > kp.sitios && kp.sitios < 6 && kp.paradas.length === kp.sitios && kp.repetidos.length === 0 && kp.aviso === kp.avisoFila, JSON.stringify(kp));
      caso(`[es] kayak y pesca en el Sur: «Otro» sin otro sitio libre no cambia a uno repetido`, kp.otroIgual && kp.otroRepite.length === 0, JSON.stringify(kp));
      const rd = d.zonas.rutaDia;
      caso(`[es] «Ruta del día»: en las sugerencias, cada sitio una vez (${rd.map(x => x.z + ' ' + x.items + ' de ' + x.fichas).join(', ')})`,
        rd.length === 3 && rd.every(x => x.items === x.sitios && x.repetidos.length === 0) && rd.some(x => x.fichas > x.sitios), JSON.stringify(rd));
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
