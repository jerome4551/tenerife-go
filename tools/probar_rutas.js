#!/usr/bin/env node
/* probar_rutas.js — el panel de Rutas con trayectos de verdad, a horas fijas
 * y en los diez idiomas (12 de octubre de 2026).
 *
 * POR QUE EXISTE. Jerome pidio que el tour explicara el boton Rutas. Al
 * recorrerlo para escribirlo salio lo que ningun control miraba, porque
 * ninguno pedia una ruta:
 *   · de noche, entre La Laguna y el Puerto de la Cruz, «A→B» decia que no
 *     habia guagua: el planificador solo miraba las 8 paradas mas cercanas, y
 *     en el centro de La Laguna las 8 son de guaguas urbanas. La 102 no
 *     entraba nunca;
 *   · y lo decia con la frase de la guagua del Teide: «la guagua 206, 104,
 *     100... al Teide sale una vez al dia y ya ha salido hoy ()», con la hora
 *     vacia. La 104 es nocturna: aun no habia salido;
 *   · en castellano para los diez idiomas: «Toca un marcador del mapa como
 *     Origen», «Calcular ruta» en cuanto se calculaba una, «No hay paradas a
 *     menos de 2 km del origen» y el texto que se comparte del itinerario.
 *
 * QUE MIRA:
 *   · trayectos conocidos a horas fijas (se fija la hora de Canarias): que
 *     haya guagua cuando la hay, y que cuando no la hay se diga el horario de
 *     las lineas que unen los dos puntos, no una frase de otra linea;
 *   · que tarde poco (cada plan, por debajo de 500 ms);
 *   · en los diez idiomas, lo que se ve: el aviso al elegir origen, el boton
 *     tras calcular, el mensaje de sin parada y el de fuera de horario, y el
 *     texto que se comparte. Cada uno es la fila de su idioma, y en los nueve
 *     que no son castellano no es igual al castellano.
 *
 *     node tools/probar_rutas.js [puerto]
 */
'use strict';
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const PUERTO = process.argv[2] || '8766';
const BASE = 'http://127.0.0.1:' + PUERTO + '/index.html';
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const IDIOMAS = ((html.match(/SUPPORTED_LANGS\s*=\s*\[([^\]]*)\]/) || [, ''])[1])
  .split(',').map(x => x.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);

let malos = 0, total = 0;
const caso = (nombre, ok, detalle) => {
  total++;
  if (!ok) malos++;
  console.log((ok ? '  ok   ' : ' FALLA ') + nombre + (ok || !detalle ? '' : '\n        ' + String(detalle).slice(0, 400)));
};

(async () => {
  const nav = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
  const pg = await ctx.newPage();
  const errores = [];
  pg.on('pageerror', e => errores.push(e.message));
  pg.on('dialog', d => d.dismiss().catch(() => {}));
  // sin red de fuera: la ruta en coche sale con la estimacion de respaldo
  await pg.route('**/router.project-osrm.org/**', r => r.abort());
  await pg.route('**/nominatim.openstreetmap.org/**', r => r.abort());
  await pg.addInitScript(() => { try { localStorage.setItem('tenerife.tour.seen', '99'); localStorage.setItem('tenerife.welcome.seen', '1'); localStorage.setItem('tgo_consent', JSON.stringify({ v: 'denied', t: Date.now() })); } catch (e) {} });
  await pg.goto(BASE, { waitUntil: 'networkidle' });
  await pg.waitForFunction(() => typeof findBestBusPlan === 'function' && typeof TITSA_LINES !== 'undefined' && TITSA_LINES.length > 0, null, { timeout: 30000 });

  console.log('=== trayectos conocidos, a hora fija ===');
  const plan = (a, b, hhmm) => pg.evaluate(([a, b, hhmm]) => {
    const [h, m] = hhmm.split(':').map(Number);
    window.horaCanaria = () => h * 60 + m;
    const A = places.find(p => p.id === a), B = places.find(p => p.id === b);
    if (!A || !B) return { falta: !A ? a : b };
    const t0 = performance.now();
    const p = findBestBusPlan(paradasPorLinea(A.lat, A.lng), paradasPorLinea(B.lat, B.lng));
    return { ms: Math.round(performance.now() - t0),
      directa: p.direct ? p.direct.line.numero : null,
      transbordo: p.transfer ? p.transfer.line1.numero + '+' + p.transfer.line2.numero : null,
      fueraDirectas: (p.fueraDirectas || []).map(l => l.numero) };
  }, [a, b, hhmm]);
  const hay = r => !!(r.directa || r.transbordo);
  const desc = r => JSON.stringify(r);

  let r = await plan('ciudad-laguna', 'ciudad-puerto-cruz', '21:55');
  caso('La Laguna → Puerto de la Cruz a las 21:55: hay guagua (la 102 circula hasta las 23:40)', hay(r), desc(r));
  caso('…y la encuentra en menos de 500 ms', r.ms < 500, r.ms + ' ms');
  r = await plan('ciudad-laguna', 'ciudad-puerto-cruz', '03:00');
  caso('La Laguna → Puerto de la Cruz a las 03:00: hay guagua (la nocturna 104)', hay(r), desc(r));
  r = await plan('ciudad-laguna', 'ciudad-puerto-cruz', '10:00');
  caso('La Laguna → Puerto de la Cruz a las 10:00: directa', !!r.directa, desc(r));
  r = await plan('ciudad-santa-cruz', 'ciudad-laguna', '12:00');
  caso('Santa Cruz → La Laguna a las 12:00: directa', !!r.directa, desc(r));
  caso('…en menos de 500 ms', r.ms < 500, r.ms + ' ms');
  r = await plan('ciudad-puerto-cruz', 'teide-teleforico', '12:00');
  caso('Puerto de la Cruz → Teleférico a las 12:00: sin guagua, y la 348 apuntada como fuera de horario', !hay(r) && r.fueraDirectas.includes('348'), desc(r));
  r = await plan('ciudad-puerto-cruz', 'teide-teleforico', '08:00');
  caso('Puerto de la Cruz → Teleférico a las 08:00: la 348', r.directa === '348', desc(r));

  console.log('\n=== lo que se ve, en los diez idiomas ===');
  const dentro = async (L) => pg.evaluate(async (L) => {
    setLang(L);
    const espera = ms => new Promise(res => setTimeout(res, ms));
    const limpio = s => String(s || '').replace(/\s+/g, ' ').trim();
    const sinAst = s => s.replace(/\*/g, '');
    const out = { L };
    const fija = (a, b, hhmm) => {
      const [h, m] = hhmm.split(':').map(Number); window.horaCanaria = () => h * 60 + m;
      clearRoute();
      pickingMode = 'origin'; onMarkerClickForRoute(places.find(p => p.id === a));
      pickingMode = 'dest'; onMarkerClickForRoute(places.find(p => p.id === b));
    };
    if (!routePanelOpen) toggleRoutePanel();
    switchRouteTab('ab');
    // el aviso al elegir el origen
    activatePick('origin');
    out.aviso = limpio(document.getElementById('pick-toast-msg').textContent);
    out.avisoFila = limpio(sinAst(tx('routeToastOrigen')));
    out.avisoNegrita = limpio((document.querySelector('#pick-toast-msg strong') || {}).textContent);
    cancelPicking();
    // fuera de horario: Puerto de la Cruz → Teleférico a las 12:00
    fija('ciudad-puerto-cruz', 'teide-teleforico', '12:00');
    await calculateRoute(); await espera(50);
    out.boton = limpio(document.getElementById('route-btn-go').textContent);
    out.botonFila = limpio(tx('routeCalcular'));
    out.fuera = limpio(document.getElementById('route-bus-detail').textContent);
    // lo que va antes de la lista: en chino los dos puntos son «：»
    out.fueraEsperado = limpio(String((UI_TX.busFueraHorario || {})[L] || '').split('{lineas}')[0]);
    out.vuelta = tx('busVuelta');
    // sin parada cerca del origen: el Teide
    fija('teide', 'ciudad-laguna', '12:00');
    await calculateRoute(); await espera(50);
    out.sinParada = limpio(document.getElementById('route-bus-detail').textContent);
    const sep = (['en', 'zh', 'zht'].indexOf(L) >= 0) ? '.' : ',';
    out.sinParadaFila = limpio(tx('busSinParadaOrigen', { km: String(BUS_PLAN.MAX_WALK_KM).replace('.', sep) }));
    // ninguna linea une los dos puntos (con un transbordo como mucho)
    fija('nucleo-los-cristianos', 'masca', '12:00');
    await calculateRoute(); await espera(50);
    out.sinLinea = limpio(document.getElementById('route-bus-detail').textContent);
    out.sinLineaFila = limpio(tx('busSinConexion'));
    // con guagua: los minutos en su unidad
    fija('ciudad-laguna', 'ciudad-puerto-cruz', '10:00');
    await calculateRoute(); await espera(50);
    out.conGuagua = limpio(document.getElementById('route-bus-summary').textContent) + ' | ' + limpio(document.getElementById('route-bus-detail').textContent);
    out.cocheKm = limpio(document.getElementById('route-car-dist').textContent);
    out.cocheMin = limpio(document.getElementById('route-car-time').textContent);
    out.decimal = (1.5).toLocaleString(PRECIOS_GAS_LOCALE[L]).replace(/\d/g, '');
    out.min = tx('routeMin');
    clearRoute();
    // lo que se comparte del itinerario
    switchRouteTab('planner');
    dpiSelectTime('fullday');
    document.querySelectorAll('#dpi-zone-grid .dp-zone-card').forEach(c => { if (c.dataset.zone === 'naturaleza') dpiToggleZone(c); });
    dpiConfirmZones();
    dpiSelectTransport('coche', document.querySelector('#dpi-transport-grid .dp-time-card[data-opt="coche"]'));
    await espera(1300);
    let compartido = null; const v = navigator.share;
    navigator.share = d => { compartido = d; return Promise.resolve(); };
    try { dpShare(); } catch (e) { compartido = { text: 'ERROR ' + e }; }
    navigator.share = v;
    out.compartido = compartido;
    out.compartidoTitulo = tx('dpCompartirTitulo'); out.compartidoPie = tx('dpCompartirPie');
    out.duracion = (DP_TIMES.find(o => o.id === 'fullday').tx[L] || [])[0];
    dpiReset(); closeRoutePanel();
    return out;
  }, L);

  const res = {};
  for (const L of IDIOMAS) res[L] = await dentro(L);
  for (const L of IDIOMAS) {
    const d = res[L], es = res.es;
    caso(`[${L}] aviso al elegir origen: su fila, con la palabra en negrita`, d.aviso === d.avisoFila && !!d.avisoNegrita && d.avisoFila.includes(d.avisoNegrita), JSON.stringify([d.aviso, d.avisoFila, d.avisoNegrita]));
    caso(`[${L}] el boton tras calcular dice «${d.botonFila}»`, d.boton === d.botonFila, d.boton);
    caso(`[${L}] fuera de horario: su frase, la 348 con su «${d.vuelta}», sin hora vacia`,
      d.fuera.startsWith(d.fueraEsperado) && /348 \(\d{1,2}:\d{2}, /.test(d.fuera) && d.fuera.includes(d.vuelta) && !/\(\)/.test(d.fuera), d.fuera);
    caso(`[${L}] sin parada cerca: su frase, con el tope de BUS_PLAN`, d.sinParada === d.sinParadaFila, JSON.stringify([d.sinParada, d.sinParadaFila]));
    caso(`[${L}] ninguna linea: su frase, y no vacia`, !!d.sinLineaFila && d.sinLinea === d.sinLineaFila, JSON.stringify([d.sinLinea, d.sinLineaFila]));
    caso(`[${L}] coche: km con «${d.decimal}» y la estimacion como «~N»`, /^\d+\D\d$/.test(d.cocheKm) && d.cocheKm.includes(d.decimal) && /^~\d+$/.test(d.cocheMin), JSON.stringify([d.cocheKm, d.cocheMin]));
    caso(`[${L}] con guagua: minutos en «${d.min}»`, d.conGuagua.includes(' ' + d.min) && (d.min === 'min' || !/\bmin\b/.test(d.conGuagua)), d.conGuagua);
    const t = (d.compartido && d.compartido.text) || '';
    caso(`[${L}] lo que se comparte: titulo, duracion y pie en su idioma`,
      !!d.compartido && d.compartido.title === d.compartidoTitulo && t.includes(d.compartidoTitulo + ' — ' + d.duracion) && t.includes(d.compartidoPie) && /\n1\. /.test(t), t);
    if (L !== 'es') {
      const iguales = ['aviso', 'boton', 'fuera', 'sinParada', 'sinLinea'].filter(k => d[k] === es[k]);
      caso(`[${L}] nada igual que en castellano`, iguales.length === 0 && (d.compartido || {}).title !== (es.compartido || {}).title, iguales.join(', '));
    }
  }
  caso('sin errores de pagina', errores.length === 0, errores.join(' / '));
  await nav.close();
  console.log('\n' + (malos ? malos + ' de ' + total + ' fallan' : total + ' de ' + total));
  process.exit(malos ? 1 : 0);
})().catch(e => { console.error(e && e.stack || e); process.exit(2); });
