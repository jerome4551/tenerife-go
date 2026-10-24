#!/usr/bin/env node
/* probar_bus_acceso.js — «Solo accesibles en bus», usado de verdad, en un
 * navegador (24 de octubre de 2026).
 *
 * POR QUE EXISTE. Jerome: «verifica un poco lo de este botón si busca bien
 * las líneas cerca». Al usarlo salieron cuatro cosas que ningun control
 * miraba:
 *   · la busqueda miraba solo las paradas de line.paradas, que guarda UN
 *     recorrido por linea. TITSA publica varios (861 patrones para 181
 *     lineas), y el campo `l` del catalogo de paradas los cuenta todos. Con un
 *     recorrido solo se dejaba 520 parejas linea-lugar de 6.701, en 94 lineas:
 *     la Catedral de La Laguna con la 274 (su parada Dean Palahi, a 94 m; la
 *     mas cercana del recorrido guardado, a 685 m) o el Mirador de Humboldt con
 *     la 104 (67 m frente a 1.408 m);
 *   · sin ninguna linea encendida el mapa se quedaba vacio, aunque el
 *     comentario del codigo decia «mostrar aviso, no ocultar todo», y el aviso
 *     era «🚏 Activa una línea de bus», en castellano y de tu, en los diez
 *     idiomas;
 *   · el interruptor de la fila de las categorias no se encendia nunca: leia
 *     window._busAccessFilterActive, que nadie escribia;
 *   · con el filtro puesto, los botones de los aeropuertos encendian sus
 *     lineas y el mapa se quedaba con lo de antes;
 *   · y al abrir las categorias la fila cambiaba de nombre: de «Solo
 *     accesibles en bus» a «Accesible en bus (500 m)», con los 500 m dos veces.
 *
 * QUE MIRA:
 *   1. sin lineas: el mapa entero, el aviso de su idioma en los diez (y de
 *      usted: no es igual al castellano en los otros nueve) y el interruptor
 *      encendido, tambien para un lector de pantalla (aria-checked);
 *   2. con cada linea de una muestra (la 274, la 104, la 934, el tranvia y
 *      una de cada quince), los lugares del mapa son justo los que estan a
 *      500 m o menos de alguna de sus paradas, contados aqui por su cuenta con
 *      el catalogo de datos/titsa.js (tools/cargar.js, la red hidratada);
 *   3. los botones de los aeropuertos y la busqueda de paradas, con el filtro
 *      puesto, rehacen el mapa con lo que toca;
 *   4. el interruptor con el teclado (Intro y espacio) y «Quitar filtros»; y
 *      su nombre con las categorias abiertas, el de la fila catSoloBus en los
 *      diez idiomas (al abrirlas se le escribia encima «Accesible en bus
 *      (500 m)», el rotulo del interruptor viejo, que no se ve);
 *   5. que no tarde: las lineas del aeropuerto sur contra todos los
 *      lugares, por debajo de 400 ms.
 *
 *     node tools/probar_bus_acceso.js [puerto]
 */
'use strict';
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const PUERTO = process.argv[2] || '8766';
const BASE = 'http://127.0.0.1:' + PUERTO + '/index.html';
const fs = require('fs'), path = require('path');
const { LINES, CAT, PLACES } = require('./cargar');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const IDIOMAS = ((html.match(/SUPPORTED_LANGS\s*=\s*\[([^\]]*)\]/) || [, ''])[1])
  .split(',').map(x => x.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);

let malos = 0, total = 0;
const caso = (nombre, ok, detalle) => {
  total++;
  if (!ok) malos++;
  console.log((ok ? '  ok   ' : ' FALLA ') + nombre + (ok || !detalle ? '' : '\n        ' + String(detalle).slice(0, 500)));
};

/* La cuenta de aqui, sin la app: las paradas de una linea son las del
   catalogo que la nombran en `l` (todos sus patrones) y, el tranvia, que no
   esta en el catalogo, las de su recorrido. Distancia por el circulo maximo. */
const RADIO = 500, R = 6371000, rad = Math.PI / 180;
const hav = (a, b, c, d) => {
  const x = Math.sin((c - a) * rad / 2) ** 2 + Math.cos(a * rad) * Math.cos(c * rad) * Math.sin((d - b) * rad / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
};
const paradasDe = id => {
  const l = LINES.find(x => x.id === id);
  if (!l) throw new Error('no existe la linea ' + id);
  if (l.tipo === 'tranvia') return l.paradas.map(p => ({ lat: p.lat, lng: p.lng }));
  return Object.values(CAT).filter(p => (p.l || []).includes(l.numero)).map(p => ({ lat: p.la, lng: p.lo }));
};
const esperados = ids => {
  const ps = ids.flatMap(paradasDe);
  return new Set(PLACES.filter(pl => ps.some(s => hav(pl.lat, pl.lng, s.lat, s.lng) <= RADIO)).map(pl => pl.id));
};
const diferencia = (vistos, esp) => {
  const sobran = vistos.filter(x => !esp.has(x)), faltan = [...esp].filter(x => !vistos.includes(x));
  return { sobran, faltan, ok: !sobran.length && !faltan.length };
};

(async () => {
  const nav = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
  const pg = await ctx.newPage();
  const errores = [];
  pg.on('pageerror', e => errores.push(e.message));
  pg.on('dialog', d => d.dismiss().catch(() => {}));
  await pg.addInitScript(() => { try { localStorage.setItem('tenerife.tour.seen', '99'); localStorage.setItem('tenerife.welcome.seen', '1'); localStorage.setItem('tgo_consent', JSON.stringify({ v: 'denied', t: Date.now() })); } catch (e) {} });
  await pg.goto(BASE, { waitUntil: 'networkidle' });
  await pg.waitForFunction(() => typeof TITSA_LINES !== 'undefined' && TITSA_LINES.length > 0 && typeof updateMarkers === 'function' && typeof places !== 'undefined' && places.length > 0, null, { timeout: 30000 });
  /* updateMarkers() espera 60 ms para agrupar cambios: aqui se pide el mapa
     ya hecho, como lo ve quien lo usa un instante despues */
  const visto = () => pg.evaluate(async () => {
    await new Promise(r => setTimeout(r, 250));
    const enMapa = new Set(activeMarkers);
    const fila = document.getElementById('cat-sheet-bus-row');
    const pill = document.querySelector('#filter-status-text .bus-access-pill');
    return { ids: places.filter(p => markerMap[p.id] && enMapa.has(markerMap[p.id])).map(p => p.id),
             n: activeMarkers.length, total: places.length, lineas: Array.from(busActiveLines),
             filtro: showOnlyBusAccessible, filaActiva: fila.classList.contains('active'),
             aria: fila.getAttribute('aria-checked'), role: fila.getAttribute('role'),
             pill: pill ? pill.textContent.replace(/\s+/g, ' ').trim() : null };
  });
  caso('el mapa arranca con los ' + PLACES.length + ' lugares del fuente', (await visto()).total === PLACES.length);

  console.log('\n=== 1 · sin ninguna linea encendida ===');
  await pg.evaluate(() => { clearAllBusLines(); if (!showOnlyBusAccessible) toggleBusAccessFilter(); });
  let v = await visto();
  caso('el mapa no se vacia: siguen los ' + v.total + ' lugares', v.filtro && v.n === v.total, JSON.stringify({ n: v.n, total: v.total }));
  caso('el interruptor de la fila de las categorias, encendido (clase y aria-checked)', v.filaActiva && v.aria === 'true' && v.role === 'switch', JSON.stringify(v));
  const filaEs = await pg.evaluate(() => UI_TX.busAccesoSinLineas && UI_TX.busAccesoSinLineas.es);
  for (const L of IDIOMAS) {
    const r = await pg.evaluate(async (L) => {
      setLang(L);
      updateFilterStatus();
      await new Promise(res => setTimeout(res, 120));
      const pill = document.querySelector('#filter-status-text .bus-access-pill');
      return { pill: pill ? pill.textContent.replace(/\s+/g, ' ').trim() : null, fila: (UI_TX.busAccesoSinLineas || {})[L] };
    }, L);
    const ok = !!r.fila && r.pill === '🚏 ' + r.fila && (L === 'es' || r.fila !== filaEs) && !/Activa una l[ií]nea/.test(r.pill || '');
    caso(`[${L}] el aviso «${r.pill}» es la fila busAccesoSinLineas de su idioma`, ok, JSON.stringify(r));
  }
  await pg.evaluate(() => setLang('es'));

  console.log('\n=== 2 · los lugares de cada linea, contados aqui por su cuenta ===');
  const muestra = ['bus-274', 'bus-104N', 'bus-934', 'tram-L1'];
  LINES.filter(l => l.tipo !== 'tranvia').forEach((l, i) => { if (i % 15 === 7 && !muestra.includes(l.id)) muestra.push(l.id); });
  for (const id of muestra) {
    await pg.evaluate(id => { clearAllBusLines(); toggleBusLine(id); }, id);
    v = await visto();
    const esp = esperados([id]);
    const d = diferencia(v.ids, esp);
    caso(`${id}: ${v.ids.length} lugares en el mapa, los ${esp.size} a 500 m o menos de sus paradas`, d.ok,
         'sobran ' + d.sobran.slice(0, 6).join(', ') + ' · faltan ' + d.faltan.slice(0, 6).join(', '));
  }
  const conLinea = async (id, lugar) => {
    await pg.evaluate(id => { clearAllBusLines(); toggleBusLine(id); }, id);
    return (await visto()).ids.includes(lugar);
  };
  caso('con la 274 sale la Catedral de La Laguna (parada Deán Palahí, a 94 m)', await conLinea('bus-274', 'catedral-laguna'));
  caso('con la 104 sale el Mirador de Humboldt (su parada, a 67 m)', await conLinea('bus-104N', 'mirador-humboldt'));
  caso('con la 934 salen el Palacio de Carta y el Castillo de San Cristóbal', await conLinea('bus-934', 'palacio-carta') && await conLinea('bus-934', 'castillo-san-cristobal'));

  console.log('\n=== 3 · los otros caminos que encienden lineas, con el filtro puesto ===');
  await pg.evaluate(() => { clearAllBusLines(); activateAirportLines('south'); });
  v = await visto();
  let esp = esperados(v.lineas);
  let d = diferencia(v.ids, esp);
  caso(`los botones del aeropuerto sur rehacen el mapa: ${v.lineas.length} lineas, ${v.ids.length} lugares`, v.lineas.length > 0 && d.ok,
       'sobran ' + d.sobran.slice(0, 6).join(', ') + ' · faltan ' + d.faltan.slice(0, 6).join(', '));
  await pg.evaluate(() => {
    clearAllBusLines();
    const x = busTodasLasParadas().find(p => p.lines.some(l => l.id === 'bus-111'));
    goToBusStop(x.stop, x.lines);
  });
  v = await visto();
  esp = esperados(v.lineas);
  d = diferencia(v.ids, esp);
  caso(`ir a una parada desde el buscador enciende su linea y rehace el mapa (${v.lineas.join(', ')}: ${v.ids.length} lugares)`, v.lineas.length === 1 && d.ok,
       'sobran ' + d.sobran.slice(0, 6).join(', ') + ' · faltan ' + d.faltan.slice(0, 6).join(', '));
  await pg.evaluate(() => { clearAllBusLines(); toggleBusLine('bus-111'); selectedCategories.add('playa'); updateMarkers(); });
  v = await visto();
  const playas = new Set(PLACES.filter(p => p.category === 'playa').map(p => p.id));
  esp = new Set([...esperados(['bus-111'])].filter(x => playas.has(x)));
  d = diferencia(v.ids, esp);
  caso(`se suma a las categorias: con «Playas» y la 111, las ${esp.size} playas a 500 m o menos`, d.ok,
       'sobran ' + d.sobran.slice(0, 6).join(', ') + ' · faltan ' + d.faltan.slice(0, 6).join(', '));
  await pg.evaluate(() => { selectedCategories.delete('playa'); updateMarkers(); });

  console.log('\n=== 4 · el interruptor ===');
  await pg.evaluate(() => clearAllFilters());
  v = await visto();
  caso('«Quitar filtros» lo apaga, y la fila tambien (aria-checked="false")', !v.filtro && !v.filaActiva && v.aria === 'false', JSON.stringify(v));
  await pg.evaluate(() => { if (!document.getElementById('cat-sheet').classList.contains('open')) toggleCategorySheet(); });
  await pg.focus('#cat-sheet-bus-row');
  await pg.keyboard.press('Enter');
  v = await visto();
  caso('con el teclado, Intro lo enciende', v.filtro && v.filaActiva && v.aria === 'true', JSON.stringify(v));
  await pg.focus('#cat-sheet-bus-row');
  await pg.keyboard.press(' ');
  v = await visto();
  caso('y el espacio lo apaga', !v.filtro && !v.filaActiva && v.aria === 'false', JSON.stringify(v));

  /* y su nombre, con las categorias abiertas, el de la fila catSoloBus en
     los diez idiomas: al abrirlas se le escribia encima «Accesible en bus
     (500 m)» (busAccessToggleLabel), que no es el que cita el asistente */
  for (const L of IDIOMAS) {
    const r = await pg.evaluate(async (L) => {
      setLang(L);
      if (document.getElementById('cat-sheet').classList.contains('open')) closeCategorySheet();
      toggleCategorySheet();
      await new Promise(res => setTimeout(res, 120));
      const out = { visto: document.getElementById('cat-sheet-bus-label').textContent.trim(), fila: UI_TX.catSoloBus[L] };
      closeCategorySheet();
      return out;
    }, L);
    caso(`[${L}] con las categorias abiertas, la fila se llama «${r.visto}» (catSoloBus)`, r.visto === r.fila, JSON.stringify(r));
  }
  await pg.evaluate(() => setLang('es'));

  console.log('\n=== 5 · que no tarde ===');
  const ms = await pg.evaluate(() => {
    clearAllBusLines(); activateAirportLines('south');
    _busAccesoCache = { clave: null, paradas: [] };
    const t0 = performance.now();
    let n = 0;
    for (const p of places) if (placeHasActiveBusStop(p)) n++;
    return { ms: Math.round(performance.now() - t0), n, lineas: busActiveLines.size };
  });
  caso(`las ${ms.lineas} lineas del aeropuerto sur contra los ${PLACES.length} lugares: ${ms.ms} ms (${ms.n} accesibles)`, ms.ms < 400, ms.ms + ' ms');

  caso('sin errores de pagina', errores.length === 0, errores.join(' | '));
  await nav.close();
  console.log('\n' + total + ' controles · ' + (malos ? malos + ' EN ROJO' : 'EN VERDE'));
  process.exit(malos ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
