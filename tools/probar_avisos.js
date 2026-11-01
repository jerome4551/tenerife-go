#!/usr/bin/env node
/* Los avisos de AEMET en la app, en un navegador de verdad y en los diez
 * idiomas (12 de octubre de 2026; desde el 21, en el boton del mar).
 *
 * La pildora llevo meses sin salir y nadie lo vio, porque «no hay avisos» y
 * «no funciona» se pintaban igual. Esta prueba sirve a la app, en lugar de
 * datos/avisos-aemet.json, ficheros con la forma exacta que escribe
 * tools/avisos_aemet.py (el texto de los avisos es el de un aviso real de
 * AEMET; los contornos de las costas, los de AEMET; las horas se ponen
 * alrededor de ahora para que esten en pie), y en lugar de Open-Meteo un mar
 * en calma y alisio flojo en toda la isla, para que «Báñese hoy aquí» tenga
 * playas que recomendar. Y mira lo que sale en pantalla:
 *
 *   · con avisos: el punto del 🌊 del color del peor (y dicho para quien no
 *     lo ve), arriba del panel del mar cada aviso con su nivel, fenomeno,
 *     zona y hora, y lo mismo en el panel del tiempo; tarjetas con el
 *     parametro y el texto oficial en ingles o en castellano (y dicho); en
 *     ningun sitio la pildora de antes;
 *   · un aviso en las tres zonas de la isla, en una linea: «Toda la isla»
 *     (la tarjeta las nombra); sin la lista de zonas, las nombra;
 *   · con un costero en el sur (contorno real de AEMET): las costas del sur
 *     lo llevan, «la más tranquila» no es una de ellas, y «Báñese hoy aquí»
 *     no recomienda ninguna playa de esa zona y lo dice; sin el costero, si
 *     las recomendaba (si no, la prueba no probaria nada);
 *   · el globo de una playa: «⚠️ AEMET» en «El mar aquí» y el aviso lo primero
 *     al abrirlo, solo en la costa del aviso y solo mientras dura (aunque el
 *     mar salga de la cache); los demas dias, el globo de siempre;
 *   · costeros en las tres costas: ninguna playa, y dice por que; uno sin
 *     contorno cuenta para toda la costa; uno de mañana sale arriba y no
 *     quita playas;
 *   · ningun rotulo en castellano fuera del castellano;
 *   · comprobacion de hace 7 horas: lo dice, y no dice «sin avisos»;
 *   · aviso que ya termino: no sale;
 *   · sin fichero: lo dice y manda a aemet.es, sin punto;
 *   · al cambiar de idioma se vuelve a pintar.
 *
 *     node tools/probar_avisos.js [puerto] [es,de]   (solo esos idiomas en la vuelta de los diez)
 */
'use strict';
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const PUERTO = process.argv[2] || '8777';
const BASE = 'http://127.0.0.1:' + PUERTO + '/index.html';
const SOLO = (process.argv[3] || '').split(',').filter(Boolean);
const IDIOMAS = ['es', 'en', 'fr', 'de', 'it', 'nl', 'zh', 'zht', 'bg', 'pl'].filter(l => !SOLO.length || SOLO.includes(l));

const { ficheros } = require('./avisos_prueba');
const F = ficheros();
const { amarillo, naranjaCosta, conAvisos, sinAvisos, viejo, caducado, tresCostas, sinContorno, deManana } = F;
const soloLluvia = Object.assign({}, conAvisos, { avisos: [amarillo] });
// las costas del panel del mar que toca el contorno de AEMET del sur (659603C)
const COSTAS_SUR = ['sureste', 'sur', 'oeste'];

let malos = 0, total = 0;
const caso = (nombre, ok, detalle) => {
  total++;
  if (!ok) malos++;
  console.log((ok ? '  ok   ' : ' FALLA ') + nombre + (ok || !detalle ? '' : '\n        ' + detalle));
};

/* Open-Meteo: mar en calma (0,5 m, 7 s) y alisio de 12 km/h en cada punto
   que se pida, con las 24 horas si las pide el panel del mar. */
function unMar(horas) {
  const o = { current: { wave_height: 0.5, wave_period: 7, swell_wave_height: 0.3, swell_wave_period: 8 } };
  if (horas) {
    const t = [...Array(24)].map((_, h) => '2026-10-21T' + String(h).padStart(2, '0') + ':00');
    o.hourly = { time: t, wave_height: t.map(() => 0.5), wave_period: t.map(() => 7),
                 swell_wave_height: t.map(() => 0.3), swell_wave_period: t.map(() => 8) };
  }
  return o;
}
async function openMeteo(pg) {
  const n = u => (u.searchParams.get('latitude') || '').split(',').length;
  const servir = (r, uno) => {
    const u = new URL(r.request().url());
    const body = n(u) > 1 ? [...Array(n(u))].map(uno) : uno();
    return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  };
  await pg.route(u => u.hostname === 'marine-api.open-meteo.com',
    r => servir(r, () => unMar(!!new URL(r.request().url()).searchParams.get('hourly'))));
  await pg.route(u => u.hostname === 'api.open-meteo.com',
    r => servir(r, () => ({ current: { wind_speed_10m: 12, wind_direction_10m: 45 }, current_units: { wind_speed_10m: 'km/h' } })));
}

(async () => {
  const nav = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true,
                                     serviceWorkers: 'block' });

  async function abrir(fichero, lang) {
    const pg = await ctx.newPage();
    const errores = [];
    pg.on('pageerror', e => errores.push(e.message));
    // las caches del mar y de «Báñese hoy aquí» son del contexto: fuera, que cada pagina pida lo suyo
    await pg.addInitScript(() => { try { localStorage.removeItem('tgo_mar_cache_v1'); localStorage.removeItem('tgo_bano_cache_v2'); } catch (e) {} });
    await openMeteo(pg);
    await pg.route('**/datos/avisos-aemet.json', r => fichero === 404
      ? r.fulfill({ status: 404, body: 'no' })
      : r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(fichero) }));
    await pg.goto(BASE, { waitUntil: 'load' });
    await pg.waitForFunction(() => typeof setLang === 'function' && typeof renderWxAlerts === 'function', null, { timeout: 30000 });
    await pg.evaluate(l => { try { setLang(l); } catch (e) {} }, lang);
    await pg.evaluate(() => fetchWxAlerts());
    return { pg, errores };
  }
  const T = (pg, clave, lang) => pg.evaluate(([k, l]) => (UI_TX[k] || {})[l] || '', [clave, lang]);
  const txt = (pg, sel) => pg.evaluate(s => { const e = document.querySelector(s); return e ? e.textContent : null; }, sel);
  const visible = (pg, sel) => pg.evaluate(s => { const e = document.querySelector(s); return !!e && !e.hidden && getComputedStyle(e).display !== 'none'; }, sel);
  const punto = pg => pg.evaluate(() => {
    const p = document.getElementById('mar-btn-punto'), b = document.getElementById('mar-btn');
    const d = document.getElementById(b.getAttribute('aria-describedby') || '');
    return { ve: !p.hidden && getComputedStyle(p).display !== 'none', cls: p.className, dice: d ? d.textContent : null,
             dentro: b.contains(p), pildora: !!document.getElementById('wx-pill') };
  });
  // abre el panel del mar y espera a que esten sus costas y «Báñese hoy aquí»
  async function panelMar(pg) {
    await pg.evaluate(() => { const p = document.getElementById('mar-panel'); if (p.style.display !== 'block') document.getElementById('mar-btn').click(); });
    await pg.waitForFunction(() => document.querySelectorAll('#mar-list .mar-row').length > 0, null, { timeout: 15000 });
    await pg.evaluate(() => renderBanoHoy());
    return pg.evaluate(() => {
      const filas = [...document.querySelectorAll('#mar-list .mar-row')].map(r => ({
        nombre: r.querySelector('.mar-name').textContent, aemet: (r.querySelector('.mar-aemet') || {}).textContent || '' }));
      const best = (document.querySelector('#mar-list .mar-best') || {}).textContent || '';
      const h = document.getElementById('bano-hoy-holder');
      const playas = [...h.querySelectorAll('[data-bano-id]')].map(b => {
        const p = places.find(q => q.id === b.getAttribute('data-bano-id'));
        return { id: p.id, lat: p.lat, lng: p.lng, enAviso: TGO_AVISOS.costerosEn(p.lat, p.lng).length };
      });
      const nombres = ids => TGO_MAR.costas.filter(c => ids.includes(c.id)).map(c => c.nm[currentLang] || c.nm.es);
      return { filas, best: best.split(': ').pop(), playas, nota: (h.querySelector('.bano-hoy-aemet') || {}).textContent || '',
               nada: (h.querySelector('.bano-hoy-nada') || {}).textContent || '', nombresSur: nombres(['sureste', 'sur', 'oeste']),
               arriba: [...document.querySelectorAll('#mar-avisos .wx-linea-btn')].map(b => b.textContent),
               primero: (document.getElementById('mar-panel').firstElementChild || {}).id };
    });
  }

  console.log('=== con un aviso naranja costero y uno amarillo de lluvias, en los diez idiomas ===');
  for (const L of IDIOMAS) {
    const { pg, errores } = await abrir(conAvisos, L);
    const pt = await punto(pg);
    await pg.evaluate(() => toggleWxPanel());
    const tarjetas = await pg.evaluate(() => [...document.querySelectorAll('#wx-alerts-list .wx-alert-card')].map(c => ({
      titulo: c.querySelector('.wx-alert-title').textContent, nivel: c.querySelector('.wx-alert-badge').textContent,
      zonas: c.querySelector('.wx-alert-zonas').textContent,
      param: (c.querySelector('.wx-alert-param') || {}).textContent || '',
      hora: c.querySelector('.wx-alert-time').textContent,
      etiqueta: (c.querySelector('.wx-alert-oficial') || {}).textContent || '',
      desc: (c.querySelector('.wx-alert-desc') || {}).textContent || '',
      marcado: !!(c.querySelector('.wx-alert-desc') || { hasAttribute: () => false }).hasAttribute('data-sin-traducir'),
      // todo lo que la app escribe en la tarjeta, sin el texto oficial de AEMET
      app: [...c.children].filter(x => !/wx-alert-(desc|instr)/.test(x.className)).map(x => x.textContent).join(' | '),
    })));
    await pg.evaluate(() => toggleWxPanel());
    const esperado = {};
    for (const k of ['wxFen_CO', 'wxFen_PR', 'wxNivel_naranja', 'wxNivel_amarillo', 'wxZona_659601', 'wxZona_659603',
                     'wxCosta', 'wxPar_P1', 'wxProb', 'wxHoraCanarias', 'wxTextoAemet', 'wxHayAvisos', 'wxDeA', 'banoHoyAemet'])
      esperado[k] = await T(pg, k, L);
    const [co, pr] = tarjetas;
    const linea = await txt(pg, '#mc-avisos');
    const formasHay = esperado.wxHayAvisos.split('|');
    const dosAvisos = s => formasHay.some(f => s && s.includes(f.replace('{n}', '2')));
    const okTarjetas = tarjetas.length === 2 && co && pr
      && co.titulo === esperado.wxFen_CO && co.nivel === esperado.wxNivel_naranja
      && co.zonas === esperado.wxCosta.replace('{z}', esperado.wxZona_659603)
      && pr.titulo === esperado.wxFen_PR && pr.nivel === esperado.wxNivel_amarillo && pr.zonas === esperado.wxZona_659601
      && pr.param.includes(esperado.wxPar_P1 + ': 20 mm') && pr.param.includes(esperado.wxProb.replace('{p}', '10%-40%'))
      && pr.hora.includes(esperado.wxHoraCanarias) && pr.etiqueta === esperado.wxTextoAemet
      && pr.desc === (L === 'en' ? amarillo.en.descripcion : amarillo.es.descripcion)
      && pr.marcado === (L !== 'es' && L !== 'en');
    caso(`[${L}] el punto del 🌊, naranja, y dicho: «2 avisos»; sin pildora`,
         pt.ve && pt.dentro && /wx-naranja/.test(pt.cls) && dosAvisos(pt.dice) && !pt.pildora, JSON.stringify(pt));
    caso(`[${L}] dos tarjetas en su idioma`, okTarjetas, JSON.stringify({ tarjetas, esperado }).slice(0, 900));
    /* el panel del tiempo, con los avisos enteros como el del mar (Jerome, 21
       de octubre: «quiero la AEMET ahí», con una captura de ese panel) */
    const lineasTiempo = await pg.evaluate(() => [...document.querySelectorAll('#mc-avisos .wx-linea-btn')].map(b => b.textContent));

    const m = await panelMar(pg);
    const deA = esperado.wxDeA.split('{a}')[0];
    caso(`[${L}] panel del mar: los dos avisos lo primero, el peor arriba, con zona y hora`,
         m.primero === 'mar-avisos' && m.arriba.length === 2
         && m.arriba[0].includes(esperado.wxNivel_naranja) && m.arriba[0].includes(esperado.wxFen_CO)
         && m.arriba[0].includes(esperado.wxCosta.replace('{z}', esperado.wxZona_659603))
         && m.arriba[1].includes(esperado.wxNivel_amarillo) && m.arriba[1].includes(esperado.wxFen_PR)
         && m.arriba[1].includes(esperado.wxZona_659601) && m.arriba.every(a => a.includes('🕐 ' + deA)),
         JSON.stringify({ primero: m.primero, arriba: m.arriba }));
    caso(`[${L}] panel del tiempo: los mismos dos avisos, enteros`,
         lineasTiempo.length === 2 && JSON.stringify(lineasTiempo) === JSON.stringify(m.arriba) && !dosAvisos(linea),
         JSON.stringify({ lineasTiempo, linea }));
    const conAviso = m.filas.filter(f => f.aemet).map(f => f.nombre).sort();
    caso(`[${L}] el costero del sur en sus costas (${COSTAS_SUR.join(', ')}) y en ninguna otra`,
         JSON.stringify(conAviso) === JSON.stringify(m.nombresSur.slice().sort())
         && m.filas.filter(f => f.aemet).every(f => f.aemet.includes(esperado.wxNivel_naranja) && f.aemet.includes('AEMET')),
         JSON.stringify(m.filas));
    caso(`[${L}] «la costa más tranquila» no es una con aviso`, !!m.best && !m.nombresSur.includes(m.best), m.best);
    caso(`[${L}] «Báñese hoy aquí»: tres playas, ninguna en la zona del aviso, y lo dice`,
         m.playas.length === 3 && m.playas.every(p => !p.enAviso) && m.nota === esperado.banoHoyAemet,
         JSON.stringify({ playas: m.playas, nota: m.nota }));
    // ningun rotulo de la app en castellano fuera del castellano
    if (L !== 'es') {
      const app = [tarjetas.map(t => t.app).join(' | '), linea, lineasTiempo.join(' | '), m.arriba.join(' | '), pt.dice,
                   m.filas.map(f => f.aemet).join(' | '), m.nota].join(' | ');
      const cast = ['Aviso ', 'Lluvias', 'Costeros', 'Fenómenos', 'Norte de Tenerife', 'Probabilidad', 'hora de Canarias',
                    'Texto de AEMET', 'Comprobado', 'Quedan fuera', ' De ']
        .filter(p => app.includes(p));
      caso(`[${L}] sin rotulos en castellano`, cast.length === 0, cast.join(', ') + ' en: ' + app.slice(0, 300));
    }
    caso(`[${L}] sin errores de pagina`, errores.length === 0, errores.join(' / '));
    await pg.close();
  }

  console.log('\n=== sin el costero, «Báñese hoy aquí» SI recomendaba playas de esa zona ===');
  {
    const { pg } = await abrir(soloLluvia, 'es');
    const m = await panelMar(pg);
    const enSur = await pg.evaluate(([ps, av]) => ps.filter(p => wxAvisoEn(av, p.lat, p.lng)).map(p => p.id), [m.playas, naranjaCosta]);
    caso('[es] con solo el de lluvias, alguna de las tres es de la costa del aviso del sur', enSur.length > 0,
         JSON.stringify(m.playas.map(p => p.id)));
    caso('[es] y no dice que haya quitado ninguna', m.nota === '' && m.filas.every(f => !f.aemet), JSON.stringify(m));
    await pg.close();
  }

  console.log('\n=== costeros en las tres costas ===');
  {
    const { pg } = await abrir(tresCostas, 'es');
    const m = await panelMar(pg);
    caso('[es] ninguna playa, y dice que es por AEMET', m.playas.length === 0 && m.nada === await T(pg, 'banoHoyNingunaAemet', 'es') && m.nota === '',
         JSON.stringify({ playas: m.playas, nada: m.nada, nota: m.nota }));
    caso('[es] las siete costas con su aviso, y ninguna «más tranquila»', m.filas.length === 7 && m.filas.every(f => f.aemet) && !m.best,
         JSON.stringify({ filas: m.filas, best: m.best }));
    for (const L of ['en', 'pl']) {
      await pg.evaluate(l => setLang(l), L);
      const n = await panelMar(pg);
      caso(`[${L}] lo mismo, en su idioma`, n.nada === await T(pg, 'banoHoyNingunaAemet', L), n.nada);
    }
    await pg.close();
  }

  console.log('\n=== un costero que llega sin contorno cuenta para toda la costa ===');
  {
    const { pg } = await abrir(sinContorno, 'es');
    const m = await panelMar(pg);
    caso('[es] las siete costas con su aviso', m.filas.length === 7 && m.filas.every(f => f.aemet), JSON.stringify(m.filas));
    caso('[es] ninguna playa recomendada', m.playas.length === 0 && m.nada === await T(pg, 'banoHoyNingunaAemet', 'es'), m.nada);
    await pg.close();
  }

  console.log('\n=== un costero de mañana: sale arriba con su hora y no quita nada hoy ===');
  {
    const { pg } = await abrir(deManana, 'es');
    const m = await panelMar(pg);
    const pt = await punto(pg);
    caso('[es] arriba, con su hora', m.arriba.length === 1 && m.arriba[0].includes('🕐 De '), JSON.stringify(m.arriba));
    caso('[es] el punto del 🌊 si: el aviso esta en pie', pt.ve && /wx-naranja/.test(pt.cls), JSON.stringify(pt));
    caso('[es] ninguna costa con aviso para hoy, tres playas, sin nota', m.filas.every(f => !f.aemet) && m.playas.length === 3 && m.nota === '',
         JSON.stringify(m));
    await pg.close();
  }

  /* El globo de un lugar de costa (Jerome, con la propuesta delante: «Si
     Perfecto»): «⚠️ AEMET» en «El mar aquí» y el aviso lo primero al abrirlo,
     solo si esa costa tiene un costero para hoy. */
  async function globo(pg, id) {
    await pg.evaluate(id => { const p = places.find(q => q.id === id); map.setView([p.lat, p.lng], 15, { animate: false }); }, id);
    await pg.waitForTimeout(500);
    await pg.evaluate(id => markerMap[id].openPopup(), id);
    await pg.waitForFunction(id => !!document.querySelector('.popup-sea-wrap[data-place-id="' + id + '"] .popup-sea-toggle'), id, { timeout: 10000 });
    const antes = await pg.evaluate(id => {
      const b = document.querySelector('.popup-sea-wrap[data-place-id="' + id + '"] .popup-sea-toggle');
      const chip = b.querySelector('.popup-sea-aemet');
      return { chip: chip ? chip.textContent : null, clase: chip ? chip.className : '' };
    }, id);
    await pg.evaluate(id => document.querySelector('.popup-sea-wrap[data-place-id="' + id + '"] .popup-sea-toggle').click(), id);
    await pg.waitForFunction(id => { const d = document.querySelector('.popup-sea-wrap[data-place-id="' + id + '"] .popup-sea-details'); return d && d.dataset.loaded === 'done'; }, id, { timeout: 10000 });
    const det = await pg.evaluate(id => {
      const d = document.querySelector('.popup-sea-wrap[data-place-id="' + id + '"] .popup-sea-details');
      const l = d.firstElementChild;
      return { primera: l && l.classList.contains('popup-sea-aemet-linea') ? l.textContent : null,
               lineas: d.querySelectorAll('.popup-sea-aemet-linea').length, mar: !!d.querySelector('.popup-sea-item') };
    }, id);
    await pg.evaluate(() => map.closePopup());
    return Object.assign(antes, det);
  }
  console.log('\n=== el globo de una playa: «⚠️ AEMET» solo en la costa del aviso ===');
  for (const L of ['es', 'de', 'zh']) {
    const { pg, errores } = await abrir(conAvisos, L);
    const sur = await globo(pg, 'el-duque');
    const norte = await globo(pg, 'playa-jardin');
    const q = {};
    for (const k of ['wxNivel_naranja', 'wxFen_CO', 'wxDeA']) q[k] = await T(pg, k, L);
    caso(`[${L}] Playa del Duque (sur, con el costero): «⚠️ AEMET» naranja, y el aviso lo primero, con su hora`,
         sur.chip === '⚠️ AEMET' && /wx-naranja/.test(sur.clase) && sur.lineas === 1 && sur.mar
         && sur.primera.includes(q.wxNivel_naranja) && sur.primera.includes(q.wxFen_CO) && sur.primera.includes('AEMET')
         && sur.primera.includes('🕐 ' + q.wxDeA.split('{a}')[0]), JSON.stringify(sur));
    caso(`[${L}] Playa Jardín (norte): el globo de siempre`, norte.chip === null && norte.lineas === 0 && norte.mar, JSON.stringify(norte));
    if (L !== 'es') caso(`[${L}] sin rotulos en castellano`, !/Aviso |Fenómenos|De \d/.test(sur.primera || ''), sur.primera);
    caso(`[${L}] sin errores de pagina`, errores.length === 0, errores.join(' / '));
    if (L === 'es') {
      // el mar sale ya de SEA_CACHE; el aviso se mira cada vez: acabado, ya no esta
      const otra = await globo(pg, 'el-duque');
      await pg.evaluate(() => { wxDatos.avisos = wxDatos.avisos.filter(a => a.fenomeno !== 'CO'); renderWxAlerts(); });
      const acabado = await globo(pg, 'el-duque');
      caso('[es] al volver a abrirlo, con el mar de la cache, el aviso sigue', otra.chip === '⚠️ AEMET' && otra.lineas === 1, JSON.stringify(otra));
      caso('[es] y cuando el aviso ya no esta, ni etiqueta ni linea, aunque el mar venga de la cache',
           acabado.chip === null && acabado.lineas === 0 && acabado.mar, JSON.stringify(acabado));
    }
    await pg.close();
  }
  for (const [nombre, fich] of [['sin avisos', sinAvisos], ['un costero de mañana', deManana], ['sin fichero (404)', 404], ['un costero sin contorno', sinContorno]]) {
    const { pg } = await abrir(fich, 'es');
    const r = await globo(pg, 'el-duque');
    const quiere = fich === sinContorno;   // sin contorno cuenta para toda la costa
    caso(`[es] ${nombre}: ${quiere ? 'con' : 'sin'} «⚠️ AEMET» en la Playa del Duque`,
         quiere ? (r.chip === '⚠️ AEMET' && r.lineas === 1) : (r.chip === null && r.lineas === 0 && r.mar), JSON.stringify(r));
    await pg.close();
  }

  console.log('\n=== lluvias en las tres zonas, como el 21 de octubre: «Toda la isla» ===');
  for (const L of IDIOMAS) {
    const { pg } = await abrir(F.lluviaIsla, L);
    const r = await pg.evaluate(() => ({
      tiempo: [...document.querySelectorAll('#mc-avisos .wx-linea-btn')].map(b => b.textContent),
      mar: [...document.querySelectorAll('#mar-avisos .wx-linea-btn')].map(b => b.textContent),
    }));
    await pg.evaluate(() => toggleWxPanel());
    const zonasTarjeta = await txt(pg, '#wx-alerts-list .wx-alert-zonas');
    const isla = await T(pg, 'wxZonaIsla', L), nombres = [];
    for (const c of ['659601', '659602', '659603']) nombres.push(await T(pg, 'wxZona_' + c, L));
    caso(`[${L}] una linea, «${isla}», en los dos paneles; la tarjeta nombra las tres`,
         r.tiempo.length === 1 && r.mar.length === 1 && r.tiempo[0] === r.mar[0] && r.tiempo[0].includes(' · ' + isla)
         && !nombres.some(n => r.tiempo[0].includes(n)) && nombres.every(n => (zonasTarjeta || '').includes(n)),
         JSON.stringify({ r, zonasTarjeta }));
    await pg.close();
  }
  {
    const { pg } = await abrir(F.lluviaIslaSinLista, 'es');
    const l = await pg.evaluate(() => (document.querySelector('#mc-avisos .wx-linea-btn') || {}).textContent || '');
    caso('[es] un fichero sin la lista de zonas de la isla: las nombra, no dice «Toda la isla»',
         l.includes('Norte de Tenerife') && l.includes('Este, sur y oeste de Tenerife') && !l.includes('Toda la isla'), l);
    await pg.close();
  }
  {
    const { pg } = await abrir(tresCostas, 'de');
    const l = await pg.evaluate(() => (document.querySelector('#mar-avisos .wx-linea-btn') || {}).textContent || '');
    const costa = await T(pg, 'wxZonaCostaIsla', 'de');
    caso('[de] costeros en las tres costas: «' + costa + '»', l.includes(' · ' + costa), l);
    await pg.close();
  }

  console.log('\n=== sin avisos, comprobado hace 10 minutos ===');
  for (const L of ['es', 'de', 'zh']) {
    const { pg } = await abrir(sinAvisos, L);
    const linea = await txt(pg, '#mc-avisos');
    const mar = await txt(pg, '#mar-avisos');
    const hasta = (await T(pg, 'wxSinAvisosHasta', L)).split('{f}')[0];
    const comp = (await T(pg, 'wxComprobado', L)).split('{h}')[0];
    const pt = await punto(pg);
    caso(`[${L}] sin punto en el 🌊`, !pt.ve && pt.dice === '', JSON.stringify(pt));
    caso(`[${L}] «sin avisos hasta…» y la hora de la comprobacion, en los dos paneles`,
         [linea, mar].every(s => !!s && s.includes(hasta.trim()) && s.includes(comp.trim())), linea + ' / ' + mar);
    await pg.close();
  }

  console.log('\n=== comprobacion de hace 7 horas ===');
  for (const L of ['es', 'fr', 'pl']) {
    const { pg } = await abrir(viejo, L);
    const linea = await txt(pg, '#mc-avisos');
    const mar = await txt(pg, '#mar-avisos');
    const sin = (await T(pg, 'wxSinComprobar', L)).split('{h}')[0];
    const nada = await T(pg, 'wxSinAvisos', L);
    await pg.evaluate(() => toggleWxPanel());
    const estado = await visible(pg, '#wx-estado');
    caso(`[${L}] dice que no se ha podido comprobar desde entonces, en los dos paneles`,
         [linea, mar].every(s => !!s && s.includes(sin.trim())), linea + ' / ' + mar);
    caso(`[${L}] y NO dice «sin avisos»`, [linea, mar].every(s => !!s && !s.includes(nada)), linea + ' / ' + mar);
    caso(`[${L}] el panel lo dice arriba, con el enlace a aemet.es`, estado
         && /aemet\.es/.test(await pg.evaluate(() => document.querySelector('#wx-estado a').href)));
    await pg.close();
  }

  console.log('\n=== un aviso que ya termino ===');
  {
    const { pg } = await abrir(caducado, 'es');
    caso('[es] no sale el punto', !(await punto(pg)).ve);
    caso('[es] no se cuenta', !/aviso de AEMET/.test(await txt(pg, '#mc-avisos') || ''), await txt(pg, '#mc-avisos'));
    caso('[es] ni arriba del panel del mar', !(await txt(pg, '#mar-avisos') || '').includes('Lluvias'), await txt(pg, '#mar-avisos'));
    await pg.close();
  }

  console.log('\n=== sin fichero (404) ===');
  for (const L of ['es', 'it']) {
    const { pg } = await abrir(404, L);
    const linea = await txt(pg, '#mc-avisos');
    const mar = await txt(pg, '#mar-avisos');
    const no = await T(pg, 'wxNoDisponible', L);
    caso(`[${L}] lo dice, en los dos paneles`, [linea, mar].every(s => !!s && s.includes(no)), linea + ' / ' + mar);
    caso(`[${L}] sin punto`, !(await punto(pg)).ve);
    caso(`[${L}] con enlace a aemet.es`, await pg.evaluate(() => !!document.querySelector('#mc-avisos a[href*="aemet.es"]')
                                                          && !!document.querySelector('#mar-avisos a[href*="aemet.es"]')));
    await pg.close();
  }

  console.log('\n=== el cambio de idioma ===');
  {
    const { pg } = await abrir(conAvisos, 'es');
    await pg.evaluate(() => setLang('fr'));
    const fr = await T(pg, 'wxHayAvisos', 'fr');
    const linea = await txt(pg, '#mc-avisos');
    const mar = await txt(pg, '#mar-avisos');
    const pt = await punto(pg);
    caso('al pasar a frances, el panel del tiempo se vuelve a pintar en frances',
         linea.includes(await T(pg, 'wxNivel_naranja', 'fr')) && !linea.includes('Aviso naranja'), linea);
    caso('y lo de arriba del panel del mar', mar.includes(await T(pg, 'wxNivel_naranja', 'fr')) && !mar.includes('Aviso naranja'), mar);
    caso('y lo que dice el punto', fr.split('|').some(f => pt.dice === f.replace('{n}', '2')), pt.dice);
    await pg.close();
  }

  await nav.close();
  console.log('\n' + (malos ? malos + ' de ' + total + ' fallan' : total + ' de ' + total));
  process.exit(malos ? 1 : 0);
})();
