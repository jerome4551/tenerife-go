#!/usr/bin/env node
/* Los avisos de AEMET en la app, en un navegador de verdad y en los diez
 * idiomas (12 de octubre de 2026).
 *
 * La pildora llevo meses sin salir y nadie lo vio, porque «no hay avisos» y
 * «no funciona» se pintaban igual. Esta prueba sirve a la app, en lugar de
 * datos/avisos-aemet.json, ficheros con la forma exacta que escribe
 * tools/avisos_aemet.py (el texto de los avisos es el de un aviso real de
 * AEMET; las horas se ponen alrededor de ahora para que esten en pie) y mira
 * lo que sale en pantalla:
 *
 *   · con avisos: pildora del color del peor, tarjetas con el nivel, el
 *     fenomeno, el parametro, la zona y la hora en el idioma de la app, el
 *     texto oficial en ingles o en castellano (y dicho), linea en el panel
 *     del tiempo y aviso costero en el del mar;
 *   · ningun rotulo en castellano fuera del castellano;
 *   · comprobacion de hace 7 horas: lo dice, y no dice «sin avisos»;
 *   · aviso que ya termino: no sale;
 *   · sin fichero: lo dice y manda a aemet.es, sin pildora;
 *   · la cruz esconde la pildora hasta que cambian los avisos;
 *   · al cambiar de idioma se vuelve a pintar.
 *
 *     node tools/probar_avisos.js [puerto]
 */
'use strict';
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const PUERTO = process.argv[2] || '8777';
const BASE = 'http://127.0.0.1:' + PUERTO + '/index.html';
const IDIOMAS = ['es', 'en', 'fr', 'de', 'it', 'nl', 'zh', 'zht', 'bg', 'pl'];

const { ficheros } = require('./avisos_prueba');
const { amarillo, conAvisos, sinAvisos, viejo, caducado } = ficheros();

let malos = 0, total = 0;
const caso = (nombre, ok, detalle) => {
  total++;
  if (!ok) malos++;
  console.log((ok ? '  ok   ' : ' FALLA ') + nombre + (ok || !detalle ? '' : '\n        ' + detalle));
};

(async () => {
  const nav = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true,
                                     serviceWorkers: 'block' });

  async function abrir(fichero, lang) {
    const pg = await ctx.newPage();
    const errores = [];
    pg.on('pageerror', e => errores.push(e.message));
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
  const visible = (pg, sel) => pg.evaluate(s => { const e = document.querySelector(s); return !!e && getComputedStyle(e).display !== 'none'; }, sel);

  console.log('=== con un aviso naranja costero y uno amarillo de lluvias, en los diez idiomas ===');
  for (const L of IDIOMAS) {
    const { pg, errores } = await abrir(conAvisos, L);
    const pillVis = await visible(pg, '#wx-pill');
    const pillCls = await pg.evaluate(() => document.getElementById('wx-pill').className);
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
    const esperado = {};
    for (const k of ['wxFen_CO', 'wxFen_PR', 'wxNivel_naranja', 'wxNivel_amarillo', 'wxZona_659601', 'wxZona_659603',
                     'wxCosta', 'wxPar_P1', 'wxProb', 'wxHoraCanarias', 'wxTextoAemet', 'wxHayAvisos'])
      esperado[k] = await T(pg, k, L);
    const [co, pr] = tarjetas;
    const linea = await txt(pg, '#mc-avisos');
    const mar = await txt(pg, '#mar-avisos');
    const formasHay = esperado.wxHayAvisos.split('|');
    const lineaOk = formasHay.some(f => linea && linea.includes(f.replace('{n}', '2')));
    const okTarjetas = tarjetas.length === 2 && co && pr
      && co.titulo === esperado.wxFen_CO && co.nivel === esperado.wxNivel_naranja
      && co.zonas === esperado.wxCosta.replace('{z}', esperado.wxZona_659603)
      && pr.titulo === esperado.wxFen_PR && pr.nivel === esperado.wxNivel_amarillo && pr.zonas === esperado.wxZona_659601
      && pr.param.includes(esperado.wxPar_P1 + ': 20 mm') && pr.param.includes(esperado.wxProb.replace('{p}', '10%-40%'))
      && pr.hora.includes(esperado.wxHoraCanarias) && pr.etiqueta === esperado.wxTextoAemet
      && pr.desc === (L === 'en' ? amarillo.en.descripcion : amarillo.es.descripcion)
      && pr.marcado === (L !== 'es' && L !== 'en');
    caso(`[${L}] pildora naranja y dos tarjetas en su idioma`, pillVis && /wx-naranja/.test(pillCls) && okTarjetas,
         JSON.stringify({ pillVis, pillCls, tarjetas, esperado }).slice(0, 900));
    // ningun rotulo de la app en castellano fuera del castellano
    if (L !== 'es') {
      const app = tarjetas.map(t => t.app).join(' | ') + ' | ' + linea + ' | ' + mar;
      const cast = ['Aviso ', 'Lluvias', 'Costeros', 'Norte de Tenerife', 'Probabilidad', 'hora de Canarias', 'Texto de AEMET', 'Comprobado']
        .filter(p => app.includes(p));
      caso(`[${L}] sin rotulos en castellano`, cast.length === 0, cast.join(', ') + ' en: ' + app.slice(0, 300));
    }
    caso(`[${L}] linea del panel del tiempo: «2 avisos»`, lineaOk, linea);
    caso(`[${L}] panel del mar: el aviso costero`, !!mar && mar.includes(esperado.wxNivel_naranja) && !mar.includes(esperado.wxNivel_amarillo), mar);
    caso(`[${L}] sin errores de pagina`, errores.length === 0, errores.join(' / '));
    await pg.close();
  }

  console.log('\n=== sin avisos, comprobado hace 10 minutos ===');
  for (const L of ['es', 'de', 'zh']) {
    const { pg } = await abrir(sinAvisos, L);
    const linea = await txt(pg, '#mc-avisos');
    const hasta = (await T(pg, 'wxSinAvisosHasta', L)).split('{f}')[0];
    const comp = (await T(pg, 'wxComprobado', L)).split('{h}')[0];
    caso(`[${L}] sin pildora`, !(await visible(pg, '#wx-pill')));
    caso(`[${L}] «sin avisos hasta…» y la hora de la comprobacion`, !!linea && linea.includes(hasta.trim()) && linea.includes(comp.trim()), linea);
    await pg.close();
  }

  console.log('\n=== comprobacion de hace 7 horas ===');
  for (const L of ['es', 'fr', 'pl']) {
    const { pg } = await abrir(viejo, L);
    const linea = await txt(pg, '#mc-avisos');
    const sin = (await T(pg, 'wxSinComprobar', L)).split('{h}')[0];
    const nada = await T(pg, 'wxSinAvisos', L);
    await pg.evaluate(() => toggleWxPanel());
    const estado = await visible(pg, '#wx-estado');
    caso(`[${L}] dice que no se ha podido comprobar desde entonces`, !!linea && linea.includes(sin.trim()), linea);
    caso(`[${L}] y NO dice «sin avisos»`, !!linea && !linea.includes(nada), linea);
    caso(`[${L}] el panel lo dice arriba, con el enlace a aemet.es`, estado
         && /aemet\.es/.test(await pg.evaluate(() => document.querySelector('#wx-estado a').href)));
    await pg.close();
  }

  console.log('\n=== un aviso que ya termino ===');
  {
    const { pg } = await abrir(caducado, 'es');
    caso('[es] no sale la pildora', !(await visible(pg, '#wx-pill')));
    caso('[es] no se cuenta', !/aviso de AEMET/.test(await txt(pg, '#mc-avisos') || ''), await txt(pg, '#mc-avisos'));
    await pg.close();
  }

  console.log('\n=== sin fichero (404) ===');
  for (const L of ['es', 'it']) {
    const { pg } = await abrir(404, L);
    const linea = await txt(pg, '#mc-avisos');
    caso(`[${L}] lo dice`, !!linea && linea.includes(await T(pg, 'wxNoDisponible', L)), linea);
    caso(`[${L}] sin pildora`, !(await visible(pg, '#wx-pill')));
    caso(`[${L}] con enlace a aemet.es`, await pg.evaluate(() => !!document.querySelector('#mc-avisos a[href*="aemet.es"]')));
    await pg.close();
  }

  console.log('\n=== la cruz y el cambio de idioma ===');
  {
    const { pg } = await abrir(conAvisos, 'es');
    await pg.evaluate(() => document.getElementById('wx-pill-close').click());
    await pg.evaluate(() => renderWxAlerts());
    caso('la cruz esconde la pildora y sigue escondida', !(await visible(pg, '#wx-pill')));
    await pg.evaluate(() => { wxDatos.avisos = wxDatos.avisos.concat([Object.assign({}, wxDatos.avisos[0], { id: 'otro', zonas: [{ codigo: '659602', nombre_es: 'x' }], fenomeno: 'VI' })]); renderWxAlerts(); });
    caso('con un aviso nuevo vuelve a salir', await visible(pg, '#wx-pill'));
    await pg.evaluate(() => setLang('fr'));
    const fr = await T(pg, 'wxHayAvisos', 'fr');
    const linea = await txt(pg, '#mc-avisos');
    caso('al pasar a frances, la linea se vuelve a pintar en frances', fr.split('|').some(f => linea.includes(f.replace('{n}', '3'))), linea);
    await pg.close();
  }

  await nav.close();
  console.log('\n' + (malos ? malos + ' de ' + total + ' fallan' : total + ' de ' + total));
  process.exit(malos ? 1 : 0);
})();
