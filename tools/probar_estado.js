#!/usr/bin/env node
/* probar_estado.js — el estado de los lugares, en toda la app (30 de octubre
 * de 2026).
 *
 * POR QUE EXISTE. Jerome: «Regla general, sin excepciones por nombre: añadir
 * en el JSON por id los campos estado, fuente y verificado. El planificador
 * solo propone POIs sin estado o con estado "abierto"». Los Patos, cerrada por
 * decreto: «Fuera del planificador y de cualquier sugerencia o puntuación de
 * baño. Se queda en el mapa, con aviso de cierre». La Bodega Frontos,
 * «solo_reserva»: fuera del planificador.
 *
 * QUE MIRA, con su propia regla y no con la de la app:
 *   · los datos: cada estado es «abierto», «cerrado» o «solo_reserva», con su
 *     fuente (https) y la fecha en que se verifico (AAAA-MM-DD); y los dos de
 *     Jerome, con el suyo;
 *   · que sigan en el mapa con su aviso: su ficha, en los diez idiomas,
 *     empieza por «⚠️»;
 *   · que no se propongan en ninguna parte: «Organice su día» y su «Otro», el
 *     dado, «¿Dónde me baño hoy?», las sugerencias de «Ruta del día» y las
 *     listas del Asistente (por categoria y «qué hacer»). Con los de verdad
 *     y, para que no dependa de donde caen, poniendo un estado de prueba a
 *     lugares que si salen (y quitandoselo al acabar); con «abierto», vuelven;
 *   · y por su nombre el Asistente sigue dando su ficha.
 *
 *     node tools/probar_estado.js [puerto]
 */
'use strict';
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');
const PUERTO = process.argv[2] || '8766';
const BASE = 'http://127.0.0.1:' + PUERTO + '/index.html';
const RAIZ = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
const IDIOMAS = ((html.match(/SUPPORTED_LANGS\s*=\s*\[([^\]]*)\]/) || [, ''])[1])
  .split(',').map(x => x.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
/* los dos que verifico Jerome el 30 de octubre de 2026 */
const DE_JEROME = { 'playa-los-patos': 'cerrado', 'bodega-frontos-granadilla': 'solo_reserva' };
const ESTADOS = ['abierto', 'cerrado', 'solo_reserva'];

let malos = 0, total = 0;
const caso = (nombre, ok, detalle) => {
  total++;
  if (!ok) malos++;
  console.log((ok ? '  ok   ' : ' FALLA ') + nombre + (ok || !detalle ? '' : '\n        ' + String(detalle).slice(0, 600)));
};

const EN_LA_PAGINA = async () => {
  const NO = p => !!p && !!p.estado && p.estado !== 'abierto';
  const out = {};
  out.datos = places.filter(p => 'estado' in p || 'fuente' in p || 'verificado' in p)
    .map(p => ({ id: p.id, estado: p.estado, fuente: p.fuente, verificado: p.verificado }));
  out.noSugeribles = places.filter(NO).map(p => p.id);
  const azar = Math.random;
  const conSemilla = (s, fn) => {
    let a = s;
    Math.random = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    try { return fn(); } finally { Math.random = azar; }
  };

  /* lo que propone cada parte, en ids */
  const planificador = (tarjetas, tiempo, zona, modo, semillas) => {
    const ids = new Set();
    for (let s = 1; s <= semillas; s++) conSemilla(s, () => {
      dpiReset(); dpiTime = tiempo; dpiSelectedZones = tarjetas.slice(); dpiZone = tarjetas.length === 1 ? tarjetas[0] : 'custom'; dpiZona = zona; dpiTransport = modo;
      dpiGenerate();
      dpCurrentStops.forEach(p => ids.add(p.id));
      for (let i = 0; i < dpCurrentStops.length; i++) { dpiSwapOne(i); ids.add(dpCurrentStops[i].id); }
    });
    return [...ids];
  };
  const dado = () => dadoPool().map(p => p.id);
  const bano = async () => {
    let pedidos = [];
    const orig = window.fetchPlayasHoyCached;
    window.fetchPlayasHoyCached = async lista => { pedidos = lista.map(x => x.id); return null; };
    let holder = document.getElementById('bano-hoy-holder'), puesto = false;
    if (!holder) { holder = document.createElement('div'); holder.id = 'bano-hoy-holder'; document.body.appendChild(holder); puesto = true; }
    try { await renderBanoHoy(); } finally { window.fetchPlayasHoyCached = orig; if (puesto) holder.remove(); }
    return pedidos;
  };
  const ruta = () => Object.keys(DAY_TRIP_ZONES).flatMap(z => {
    selectDayTripZone(z);
    return [...document.querySelectorAll('#daytrip-catalog-list .catalog-item-add')]
      .map(b => ((b.getAttribute('onclick') || '').match(/toggleDayTripStop\('([^']+)'\)/) || [])[1]).filter(Boolean);
  });
  const asistente = pregunta => {
    const r = chatResolve(pregunta, null), o = chatBuildReply(r);
    let ids = [];
    const orig = window.chatShowSet;
    window.chatShowSet = lista => { ids = lista.slice(); };
    try { const a = (o.actions || [])[0]; if (a && a.run) a.run(); } finally { window.chatShowSet = orig; }
    return { kind: r.kind, ids, poi: r.p ? r.p.id : null };
  };
  const partes = {
    'Organice su día (Playa & Mar, Norte)': () => planificador(['playa'], 'halfday', 'norte', 'coche', 30),
    'Organice su día (Gastronomía, Sur)': () => planificador(['gastronomia'], 'fullday', 'sur', 'coche', 30),
    'Organice su día (Sorpréndeme, toda la isla)': () => planificador(['mix'], 'fullday', 'igual', 'coche', 20),
    'el dado': dado,
    '«¿Dónde me baño hoy?»': bano,
    'las sugerencias de «Ruta del día»': ruta,
    'el Asistente, «playas nudistas»': () => asistente('playas nudistas').ids,
    'el Asistente, «playas»': () => asistente('playas').ids,
    'el Asistente, «bodegas»': () => asistente('bodegas').ids,
    'el Asistente, «qué hacer en el norte»': () => asistente('que hacer en el norte').ids,
  };

  /* 1. con los de verdad: ninguno de los que no se sugieren */
  out.deVerdad = {};
  for (const [k, fn] of Object.entries(partes)) {
    const ids = await fn();
    out.deVerdad[k] = { n: ids.length, malos: ids.filter(id => NO(places.find(p => p.id === id))) };
  }

  /* 2. con un estado de prueba en lugares que si salen: desaparecen; con «abierto», vuelven */
  out.prueba = {};
  for (const [k, fn] of Object.entries(partes)) {
    const antes = [...new Set(await fn())].filter(id => !NO(places.find(p => p.id === id)));
    const elegidos = antes.slice(0, 3).map(id => places.find(p => p.id === id));
    const res = { elegidos: elegidos.map(p => p.id) };
    for (const estado of ['cerrado', 'solo_reserva']) {
      elegidos.forEach(p => { p.estado = estado; });
      const ids = await fn();
      res[estado] = elegidos.filter(p => ids.includes(p.id)).map(p => p.id);
    }
    elegidos.forEach(p => { p.estado = 'abierto'; });
    const ids = await fn();
    res.abierto = elegidos.filter(p => ids.includes(p.id)).map(p => p.id);
    elegidos.forEach(p => { delete p.estado; });
    out.prueba[k] = res;
  }

  /* 3. por su nombre, el Asistente sigue dando su ficha */
  out.porNombre = {
    'playa-los-patos': asistente('Playa de Los Patos'),
    'bodega-frontos-granadilla': asistente('Bodega Frontos'),
  };
  return out;
};

(async () => {
  const nav = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
  const pg = await ctx.newPage();
  const errores = [];
  pg.on('pageerror', e => errores.push(e.message));
  await pg.route('**/router.project-osrm.org/**', r => r.abort());
  await pg.addInitScript(() => { try { localStorage.setItem('tenerife.tour.seen', '99'); localStorage.setItem('tenerife.welcome.seen', '1');
    localStorage.setItem('tgo_consent', JSON.stringify({ v: 'denied', t: Date.now() })); localStorage.setItem('tenerife.lang', 'es'); } catch (e) {} });
  await pg.goto(BASE, { waitUntil: 'networkidle' });
  await pg.waitForFunction(() => typeof dpiGenerate === 'function' && typeof chatResolve === 'function' && typeof TITSA_LINES !== 'undefined' && TITSA_LINES.length > 0, null, { timeout: 30000 });
  await pg.evaluate(() => { if (typeof chatBuildIndex === 'function') chatBuildIndex(); });
  const d = await pg.evaluate(EN_LA_PAGINA);
  await nav.close();

  console.log('=== los datos ===');
  const malDato = d.datos.filter(x => !ESTADOS.includes(x.estado) || !/^https:\/\/[^\s]+$/.test(x.fuente || '')
    || !/^\d{4}-\d{2}-\d{2}$/.test(x.verificado || '') || isNaN(Date.parse(x.verificado)));
  caso(`${d.datos.length} lugares con estado: cada uno «abierto», «cerrado» o «solo_reserva», con su fuente (https) y su fecha (AAAA-MM-DD)`,
    d.datos.length > 0 && malDato.length === 0, JSON.stringify(malDato));
  const jerome = Object.entries(DE_JEROME).map(([id, e]) => { const x = d.datos.find(y => y.id === id); return [id, e, x && x.estado]; });
  caso(`los de Jerome: ${jerome.map(([id, e]) => id + ', ' + e).join('; ')}`, jerome.every(([, e, v]) => e === v), JSON.stringify(jerome));
  const sinAviso = [];
  for (const L of IDIOMAS) for (const id of d.noSugeribles) {
    const desc = L === 'es' ? ((html.split('id:"' + id + '"')[1] || '').match(/desc:\{ es:"([^"]*)"/) || [])[1]
      : (JSON.parse(fs.readFileSync(path.join(RAIZ, 'idiomas', L + '.json'), 'utf8'))[id] || {}).desc;
    if (!desc || !desc.startsWith('⚠️')) sinAviso.push(L + ' ' + id);
  }
  caso(`siguen en el mapa con su aviso: la ficha de los ${d.noSugeribles.length} que no se sugieren empieza por «⚠️» en los ${IDIOMAS.length} idiomas`,
    d.noSugeribles.length > 0 && sinAviso.length === 0, sinAviso.join(', '));

  console.log('\n=== con los de verdad, ninguno ===');
  for (const [k, v] of Object.entries(d.deVerdad)) caso(`${k}: ${v.n} lugares, ninguno de los que no se sugieren`, v.n > 0 && v.malos.length === 0, v.malos.join(', '));

  console.log('\n=== con un estado de prueba en lugares que si salen ===');
  for (const [k, v] of Object.entries(d.prueba)) {
    caso(`${k}: con «cerrado» y con «solo_reserva» desaparecen, con «abierto» vuelven (${v.elegidos.join(', ')})`,
      v.elegidos.length > 0 && v.cerrado.length === 0 && v.solo_reserva.length === 0 && v.abierto.length === v.elegidos.length, JSON.stringify(v));
  }

  console.log('\n=== por su nombre ===');
  for (const [id, v] of Object.entries(d.porNombre)) caso(`el Asistente, por su nombre, da la ficha de ${id}`, v.kind === 'poi' && v.poi === id, JSON.stringify(v));
  caso('sin errores de pagina', errores.length === 0, errores.join(' / '));

  console.log('\n' + (malos ? malos + ' de ' + total + ' fallan' : total + ' de ' + total));
  process.exit(malos ? 1 : 0);
})().catch(e => { console.error(e && e.stack || e); process.exit(2); });
