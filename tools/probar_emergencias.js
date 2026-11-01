#!/usr/bin/env node
/* probar_emergencias.js — el panel 🆘 EMERGENCIAS de verdad, en Chromium.
 *
 *     python3 -m http.server 8766 &      (desde la raiz del repo)
 *     node tools/probar_emergencias.js 8766
 *
 * En los diez idiomas: la barra de abajo, con el SOS, cabe a 320 y 360 px
 * (ningun boton fuera ni rotulo cortado); el boton SOS abre el panel, salen
 * las 19 guias de «Que hacer si…» en sus siete grupos y las 7 filas de
 * «Preparese», los telefonos de Salvamento Maritimo, del 012 (el numero
 * largo) y de toxicologia, y los cinco enlaces oficiales de «Que pasa
 * ahora»; cada una de las 25 guias abre con su titulo
 * y sus fuentes y «atras» vuelve; nada se sale de la pantalla a 360, 390 y
 * 430 px; ningun texto castellano fuera del castellano; «Ver mis
 * coordenadas» da la posicion; «Hospitales en el mapa» cierra y deja el
 * filtro puesto; cambiar de idioma con el panel abierto lo repinta; «Vea
 * tambien» lleva de una guia a otra y «atras» vuelve al inicio.
 * Los avisos de AEMET (los de prueba de tools/avisos_prueba.js): salen en
 * «Que pasa ahora» y en el resumen de arriba, del color del peor, y tocar
 * uno cierra el panel y deja a la vista el de los avisos de la app.
 * Con los robots encendidos (bloque 3 de la nota; aqui con datos de prueba
 * que sirve la propia prueba): las alertas del Gobierno de Canarias con su
 * hora, el boletin con su fecha y su luz, los terremotos, el resumen de
 * arriba (alertas de hoy, semaforo, terremoto de magnitud 3 o mas) y el punto
 * del boton; con los datos viejos, sin color, sin lista y sin punto; con
 * datos rotos, nada.
 * Y tres casos que no se ven a simple vista:
 *   · el modulo no llega (red cortada sin cache): el panel lo dice, ofrece
 *     reintentar y el boton rojo del 112 sigue ahi, con su tel:112;
 *   · index.html#sos abre el panel (el atajo del icono en Android);
 *   · sin red y con el service worker: el panel abre de la cache.
 * Cero errores de pagina. Sale con 1 si algo falla.
 */
'use strict';
let chromium;
try { chromium = require('playwright').chromium; } catch (e) { chromium = require('/opt/node22/lib/node_modules/playwright').chromium; }
const PUERTO = process.argv[2] || '8766';
const BASE = 'http://127.0.0.1:' + PUERTO + '/index.html';
const LANGS = ['es', 'en', 'fr', 'de', 'it', 'nl', 'zh', 'zht', 'bg', 'pl'];
/* las guias las da el propio modulo (TG_SOS.guias): 25 desde la noche del 22 */
let GUIAS = null;
const BALDOSAS = 19, FILAS = 7;
const CASTELLANO = ['Llamar al 112', 'Qué hacer', 'Prepárese', 'La mochila de emergencia', 'Fuentes', 'Gratis y las 24 horas', 'Revisado el', 'Qué pasa ahora',
  'Si se lo piden las autoridades', 'Alguien en apuros', 'Bañarse con seguridad', 'Vea también', 'Salvamento Marítimo', 'Planes de emergencia oficiales',
  'Incendio forestal', 'Lluvias e inundaciones', 'Calor y calima', 'Avisos de AEMET para Tenerife',
  'Si alguien se encuentra mal', 'Primeros auxilios', 'En el edificio y en la calle', 'Fuego en un edificio', 'Fiestas y aglomeraciones'];
const AVISOS = require('./avisos_prueba').ficheros().conAvisos;
const SIN_AVISOS = require('./avisos_prueba').ficheros().sinAvisos;

let fallos = 0, hechos = 0;
function ok(c, txt, det) { hechos++; if (c) console.log('  OK  ' + txt); else { fallos++; console.log('  MAL ' + txt + (det !== undefined ? '   -> ' + JSON.stringify(det) : '')); } }

const DESBORDE = () => {
  const w = document.documentElement.clientWidth, malos = [];
  const sc = document.getElementById('sos-scroll');
  if (sc && sc.scrollWidth > sc.clientWidth + 1) malos.push('scroll ' + sc.scrollWidth + '>' + sc.clientWidth);
  document.querySelectorAll('#sos-panel *').forEach(e => {
    const r = e.getBoundingClientRect();
    if (!r.width) return;
    if (r.right > w + 1 || r.left < -1) malos.push((e.id || String(e.className) || e.tagName) + ' ' + Math.round(r.left) + '..' + Math.round(r.right));
  });
  return malos.slice(0, 4);
};

/* La barra de abajo con el SOS: seis botones (siete si se abre la tienda,
   TIENDA_ACTIVA), ninguno fuera de la pantalla y ningun rotulo cortado. */
const BARRA = () => {
  const nav = document.querySelector('.v19-bottom-nav');
  const W = document.documentElement.clientWidth;
  const vis = [...nav.querySelectorAll('.v19-nav-item')].filter(e => getComputedStyle(e).display !== 'none');
  const fuera = [], cortas = [];
  vis.forEach(e => {
    const r = e.getBoundingClientRect(), lab = e.querySelector('span[id^="nav-lbl"]');
    if (r.left < -1 || r.right > W + 1) fuera.push(e.id);
    if (lab && (lab.scrollWidth > lab.clientWidth + 1 || lab.getBoundingClientRect().width > r.width + 1)) cortas.push(e.id + ':' + lab.textContent);
  });
  return { n: vis.length, desborda: nav.scrollWidth > nav.clientWidth + 1, fuera, cortas };
};

async function abrirApp(b, L, opc) {
  opc = opc || {};
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: opc.sw ? 'allow' : 'block',
    geolocation: { latitude: 28.4636, longitude: -16.2518 }, permissions: ['geolocation'] });
  const p = await ctx.newPage();
  const errores = []; p.on('pageerror', e => errores.push(e.message));
  await p.addInitScript(() => { try { localStorage.setItem('tenerife.tour.seen', '99'); localStorage.setItem('tgo_consent', JSON.stringify({ v: 'denied', t: Date.now() })); } catch (e) {} });
  await p.route('**/router.project-osrm.org/**', r => r.abort());
  await p.route('**/nominatim.openstreetmap.org/**', r => r.abort());
  if (opc.antes) await opc.antes(p);
  await p.goto(BASE + (opc.hash || ''), { waitUntil: 'networkidle' });
  await p.waitForTimeout(500);
  if (!opc.hash && await p.isVisible('#v19-welcome-start')) {
    await p.click('.v19-w-lang[data-lang="' + L + '"]'); await p.waitForTimeout(200);
    await p.click('#v19-welcome-start'); await p.waitForTimeout(1500);
  }
  return { ctx, p, errores };
}

(async () => {
  const b = await chromium.launch();

  for (const L of LANGS) {
    console.log('— ' + L);
    const { ctx, p, errores } = await abrirApp(b, L);
    ok(await p.isVisible('#v19-nav-sos'), L + ': el boton SOS se ve en la barra de abajo');
    for (const ancho of [320, 360]) {
      await p.setViewportSize({ width: ancho, height: 700 });
      const r = await p.evaluate(BARRA);
      ok(r.n >= 6 && !r.desborda && !r.fuera.length && !r.cortas.length, L + ': la barra de abajo, con el SOS, cabe a ' + ancho + ' px (' + r.n + ' botones)', r);
    }
    await p.setViewportSize({ width: 390, height: 844 });
    await p.click('#v19-nav-sos');
    await p.waitForFunction(() => window.TG_SOS && document.querySelectorAll('.sos-baldosa').length === 19, null, { timeout: 8000 }).catch(() => {});
    ok(await p.isVisible('#sos-panel'), L + ': el panel se abre');
    if (!GUIAS) GUIAS = await p.evaluate(() => TG_SOS.guias.map(g => g.id));
    ok(GUIAS.length === 25, L + ': veinticinco guias en el modulo', GUIAS.length);
    ok(await p.locator('.sos-baldosa').count() === BALDOSAS, L + ': ' + BALDOSAS + ' guias en «Que hacer si…»');
    ok(await p.locator('.sos-subh').count() === 7, L + ': en siete grupos');
    ok(await p.locator('.sos-fila').count() === FILAS, L + ': ' + FILAS + ' filas en «Preparese»');
    ok(await p.locator('.sos-tarjeta-112 a[href="tel:900202202"]').count() === 1, L + ': Salvamento Maritimo se marca desde la tarjeta del 112');
    ok(await p.locator('.sos-tarjeta-112 a[href="tel:+34922470012"]').count() === 1, L + ': el 012, por su numero largo (vale desde un movil extranjero)');
    ok(await p.locator('.sos-tarjeta-112 a[href="tel:+34915620420"]').count() === 1, L + ': el Servicio de Informacion Toxicologica se marca desde la tarjeta del 112');
    ok(await p.locator('#sos-ahora .sos-enlace').count() === 5, L + ': cinco enlaces oficiales en «Que pasa ahora»');
    ok(await p.getAttribute('#sos-112', 'href') === 'tel:112', L + ': el boton rojo llama al 112');
    const titulo = await p.innerText('#sos-titulo');
    ok(titulo.trim() === await p.evaluate(() => tx('sosTitulo')), L + ': titulo del panel en su idioma', titulo);
    if (L !== 'es') {
      const texto = await p.innerText('#sos-panel');
      const quedan = CASTELLANO.filter(f => texto.includes(f));
      ok(!quedan.length, L + ': ningun texto castellano en el inicio', quedan);
    }
    for (const ancho of [360, 390, 430]) {
      await p.setViewportSize({ width: ancho, height: 800 });
      const d = await p.evaluate(DESBORDE);
      ok(!d.length, L + ': el inicio cabe a ' + ancho + ' px', d);
    }
    await p.setViewportSize({ width: 390, height: 844 });
    let guiasMal = [];
    for (const g of GUIAS) {
      await p.evaluate(g => TG_SOS.ver(g), g); await p.waitForTimeout(40);
      const v = await p.getAttribute('#sos-cuerpo', 'data-vista');
      const conFuentes = g === 'canales' || await p.locator('.sos-fuentes li').count() > 0;
      const d = await p.evaluate(DESBORDE);
      const txt = L === 'es' ? '' : await p.innerText('#sos-cuerpo');
      const quedan = CASTELLANO.filter(f => txt.includes(f));
      if (v !== g || !conFuentes || d.length || quedan.length) guiasMal.push({ g, v, conFuentes, d, quedan });
      await p.click('#sos-atras'); await p.waitForTimeout(120);
      if (await p.getAttribute('#sos-cuerpo', 'data-vista') !== 'inicio') guiasMal.push({ g, atras: 'no vuelve' });
    }
    ok(!guiasMal.length, L + ': las ' + GUIAS.length + ' guias abren, llevan fuentes, caben y «atras» vuelve', guiasMal.slice(0, 2));
    if (L === 'es' || L === 'pl') {
      await p.evaluate(() => TG_SOS.ver('playa')); await p.waitForTimeout(60);
      await p.locator('.sos-ir').first().click(); await p.waitForTimeout(120);
      const v2 = await p.getAttribute('#sos-cuerpo', 'data-vista');
      await p.click('#sos-atras'); await p.waitForTimeout(200);
      ok(v2 === 'rescate' && await p.getAttribute('#sos-cuerpo', 'data-vista') === 'inicio', L + ': «Vea tambien» lleva a otra guia y «atras» vuelve al inicio', v2);
    }
    if (L === 'es' || L === 'zh') {
      await p.click('.sos-chip-fuerte'); await p.waitForTimeout(800);
      const coords = await p.locator('.sos-coords-num').innerText().catch(() => '');
      ok(coords === '28.46360, -16.25180', L + ': «Ver mis coordenadas» da la posicion', coords);
    }
    if (L === 'de') {
      await p.evaluate(() => setLang('fr')); await p.waitForTimeout(150);
      ok((await p.innerText('#sos-titulo')).trim() === 'Urgences', 'de→fr con el panel abierto: se repinta');
    }
    await p.click('#sos-hospitales'); await p.waitForTimeout(900);
    ok(!(await p.isVisible('#sos-panel')), L + ': «Hospitales en el mapa» cierra el panel');
    ok(await p.evaluate(() => typeof selectedCategories !== 'undefined' && selectedCategories.has('hospital')), L + ': y deja puesto el filtro de hospitales');
    ok(!errores.length, L + ': sin errores de pagina', errores.slice(0, 3));
    await ctx.close();
  }

  console.log('— los avisos de AEMET en el panel (los de prueba de tools/avisos_prueba.js)');
  {
    const { ctx, p, errores } = await abrirApp(b, 'de', { antes: async p => {
      await p.route('**/datos/avisos-aemet.json', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(AVISOS) }));
    } });
    await p.waitForFunction(() => typeof wxEstado !== 'undefined' && wxEstado === 'ok', null, { timeout: 8000 }).catch(() => {});
    await p.click('#v19-nav-sos');
    await p.waitForFunction(() => window.TG_SOS && document.querySelectorAll('.sos-baldosa').length === 19, null, { timeout: 8000 }).catch(() => {});
    ok(await p.locator('#sos-aemet .wx-linea-btn').count() === 2, 'los dos avisos de AEMET, en «Que pasa ahora»');
    const res = await p.locator('#sos-resumen .sos-res-btn').first().getAttribute('class').catch(() => '');
    ok(/sos-res-naranja/.test(res || '') && (await p.innerText('#sos-resumen')).includes(await p.evaluate(() => tx('wxHayAvisos', { n: 2 }))), 'y arriba, en el resumen, del color del peor (naranja) y en su idioma', res);
    const texto = await p.innerText('#sos-panel');
    ok(!CASTELLANO.filter(f => texto.includes(f)).length, 'en aleman, nada en castellano', CASTELLANO.filter(f => texto.includes(f)));
    await p.locator('#sos-aemet .wx-linea-btn').first().click(); await p.waitForTimeout(800);
    ok(!(await p.isVisible('#sos-panel')) && await p.isVisible('#wx-panel'), 'tocar un aviso cierra el panel y deja a la vista el de los avisos');
    ok(!errores.length, 'sin errores de pagina', errores.slice(0, 3));
    await ctx.close();
  }

  console.log('— con los robots encendidos (datos de prueba, servidos por la propia prueba)');
  {
    const AHORA = Date.now();
    const iso = ms => new Date(ms).toISOString().replace(/\.\d{3}Z$/, 'Z');
    const dia = ms => new Date(ms).toISOString().slice(0, 10);
    const datos = {
      sismos: { fuente: 'IGN', consultado: iso(AHORA - 30 * 60000), sismos: [
        { id: 'es2099p1', t: iso(AHORA - 2 * 3600000), lat: 28.27, lon: -16.64, m: 3.2, lugar: 'PRUEBA CAÑADAS DEL TEIDE', url: 'https://www.ign.es/' },
        { id: 'es2099p2', t: iso(AHORA - 30 * 3600000), lat: 28.6, lon: -16.05, m: 1.4, lugar: 'PRUEBA ATLÁNTICO-CANARIAS', url: 'https://www.ign.es/' }] },
      semaforo: { fuente: 'INVOLCAN', consultado: iso(AHORA - 3600000), boletin: dia(AHORA - 2 * 86400000), color: 'amarillo' },
      alertas: { fuente: 'Gobierno de Canarias', consultado: iso(AHORA - 20 * 60000), alertas: [
        { t: iso(AHORA - 3 * 3600000), titulo: 'PRUEBA · El Gobierno de Canarias declara la prealerta por lluvias en Tenerife', enlace: 'https://www3.gobiernodecanarias.org/noticias/prueba-1/' },
        { t: iso(AHORA - 3 * 86400000), titulo: 'PRUEBA · El Gobierno de Canarias finaliza la prealerta por viento', enlace: 'https://www3.gobiernodecanarias.org/noticias/prueba-2/' },
        { t: iso(AHORA - 9 * 86400000), titulo: 'PRUEBA · Una nota de hace nueve dias', enlace: 'https://www3.gobiernodecanarias.org/noticias/prueba-3/' },
        { t: iso(AHORA - 3600000), titulo: 'PRUEBA · Una nota de otra web', enlace: 'https://ejemplo.com/x' }] }
    };
    const { ctx, p, errores } = await abrirApp(b, 'es', { antes: async p => {
      await p.route('**/datos/sismos-ign.json', r => r.fulfill({ status: 200, contentType: 'application/json', body: typeof datos.sismos === 'string' ? datos.sismos : JSON.stringify(datos.sismos) }));
      await p.route('**/datos/semaforo-involcan.json', r => r.fulfill({ status: 200, contentType: 'application/json', body: typeof datos.semaforo === 'string' ? datos.semaforo : JSON.stringify(datos.semaforo) }));
      await p.route('**/datos/alertas-canarias.json', r => r.fulfill({ status: 200, contentType: 'application/json', body: typeof datos.alertas === 'string' ? datos.alertas : JSON.stringify(datos.alertas) }));
      /* y AEMET, sin avisos: el resumen de arriba lleva tambien los suyos, y con
         los de verdad del dia «ningun resumen» salia en rojo (el 30 de octubre
         de 2026, los dos amarillos del 1 de noviembre) */
      await p.route('**/datos/avisos-aemet.json', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(SIN_AVISOS) }));
    } });
    const punto = async () => p.evaluate(() => { const e = document.getElementById('v19-nav-sos-punto'); return e.hidden ? '' : e.className; });
    const encender = async () => { await p.evaluate(() => { window.SOS_DATOS = ['./datos/sismos-ign.json', './datos/semaforo-involcan.json', './datos/alertas-canarias.json']; TG_SOS_PUNTO(); }); await p.waitForTimeout(700); };
    const abrirVivo = async () => {
      await p.click('#v19-nav-sos');
      await p.waitForFunction(() => window.TG_SOS && document.querySelectorAll('.sos-baldosa').length === 19, null, { timeout: 8000 }).catch(() => {});
      await p.evaluate(() => TG_SOS.cargarVivo()); await p.waitForTimeout(400);
    };
    const prefijo = (k, v) => p.evaluate(([k, v]) => TG_SOS.t(k, v).split('@@')[0], [k, v]);

    await encender();
    ok((await punto()).includes('sos-punto-amarillo'), 'boletin amarillo de hace 2 dias: el punto del SOS sale, amarillo', await punto());
    await abrirVivo();
    const vivo = await p.innerText('#sos-vivo').catch(() => '');
    ok(vivo.includes(await prefijo('sosSemaforoBoletin', { f: '@@', c: '' })) && vivo.includes(await p.evaluate(() => TG_SOS.t('sosColor_amarillo'))), '«Que pasa ahora» dice el boletin, con su fecha y su color', vivo.slice(0, 160));
    ok(await p.locator('#sos-vivo .sos-luz-amarillo').count() === 1, 'con la luz de su color');
    ok(await p.locator('#sos-vivo .sos-sismo').count() === 2, 'y los dos terremotos');
    ok(await p.locator('#sos-vivo .sos-alerta').count() === 2, 'las alertas del Gobierno de Canarias de los ultimos 7 dias (2: ni la de hace 9 dias ni la de otra web)');
    ok(await p.locator('#sos-vivo .sos-alerta-t[lang="es"][data-sin-traducir]').count() === 2 && (await p.getAttribute('#sos-vivo .sos-alerta', 'href')).startsWith('https://www3.gobiernodecanarias.org/noticias/'), 'el titular tal cual, en castellano, con su enlace a la nota');
    const resumen = await p.locator('#sos-resumen .sos-res-btn').evaluateAll(bs => bs.map(b => b.className));
    ok(resumen.some(c => /sos-res-amarillo/.test(c)) && resumen.some(c => /sos-res-info/.test(c)) && resumen.some(c => /sos-res-sismo/.test(c)),
      'arriba, el resumen: el semaforo amarillo, la alerta de hoy y el terremoto', resumen);
    await p.click('#sos-resumen .sos-res-sismo'); await p.waitForTimeout(150);
    ok(await p.getAttribute('#sos-cuerpo', 'data-vista') === 'sismo', 'el del terremoto de magnitud 3,2 lleva a la guia de terremotos');
    await p.evaluate(() => TG_SOS.cerrar()); await p.waitForTimeout(700);

    datos.semaforo.boletin = dia(AHORA - 10 * 86400000);
    datos.sismos.consultado = iso(AHORA - 8 * 3600000);
    datos.alertas.consultado = iso(AHORA - 8 * 3600000);
    await encender();
    ok(!(await punto()), 'boletin de hace 10 dias y comprobacion de hace 8 horas: sin punto', await punto());
    await abrirVivo();
    const viejo = await p.innerText('#sos-vivo').catch(() => '');
    ok(await p.locator('#sos-vivo .sos-luz').count() === 0 && viejo.includes(await prefijo('sosSemaforoViejo', { f: '@@' })), 'el boletin viejo, sin color y mandando al de INVOLCAN', viejo.slice(0, 160));
    ok(viejo.includes(await prefijo('sosSismosViejo', { f: '@@' })) && await p.locator('#sos-vivo .sos-sismo').count() === 0, 'los terremotos, «no se ha podido comprobar desde…», sin lista ni aviso');
    ok(viejo.includes(await prefijo('sosAlertasViejo', { f: '@@' })) && await p.locator('#sos-vivo .sos-alerta').count() === 0, 'las alertas, igual: sin lista y diciendo desde cuando');
    ok(!(await p.isVisible('#sos-resumen')), 'y arriba, ningun resumen');
    await p.evaluate(() => TG_SOS.cerrar()); await p.waitForTimeout(700);

    datos.semaforo = { fuente: 'INVOLCAN', consultado: iso(AHORA), boletin: dia(AHORA), color: 'morado' };
    datos.sismos = '{ esto no es json';
    datos.alertas = { consultado: 'ayer', alertas: 'nada' };
    await p.evaluate(() => { TG_SOS.estado.sismos = null; TG_SOS.estado.semaforo = null; TG_SOS.estado.alertas = null; });
    await encender();
    ok(!(await punto()), 'con datos rotos (un color que no existe, un JSON que no se lee): sin punto');
    await abrirVivo();
    ok(await p.evaluate(() => document.getElementById('sos-vivo').hidden), 'y en el panel, nada');
    ok(!errores.length, 'sin errores de pagina', errores.slice(0, 3));
    await ctx.close();
  }

  console.log('— el modulo no llega');
  {
    const { ctx, p, errores } = await abrirApp(b, 'es', { antes: async p => { await p.route('**/modulos/emergencias.js', r => r.abort()); } });
    await p.click('#v19-nav-sos'); await p.waitForTimeout(800);
    ok(await p.isVisible('#sos-panel'), 'el panel se abre igual');
    ok((await p.innerText('#sos-cuerpo')).includes(await p.evaluate(() => tx('sosErrorCarga'))), 'dice que no pudo abrir la seccion');
    ok(await p.locator('.sos-estado button').count() === 1, 'y ofrece reintentar');
    ok(await p.isVisible('#sos-112') && await p.getAttribute('#sos-112', 'href') === 'tel:112', 'el boton rojo del 112 sigue ahi');
    await p.click('#sos-cerrar'); await p.waitForTimeout(300);
    ok(!(await p.isVisible('#sos-panel')), 'la X lo cierra sin el modulo');
    ok(!errores.length, 'sin errores de pagina', errores);
    await ctx.close();
  }

  console.log('— index.html#sos');
  {
    const { ctx, p, errores } = await abrirApp(b, 'en', { hash: '#sos' });
    await p.waitForTimeout(1200);
    ok(await p.isVisible('#sos-panel'), 'el atajo #sos abre el panel, tambien por encima de la bienvenida');
    await p.evaluate(() => TG_SOS.cerrar()); await p.waitForTimeout(600);
    ok(!(await p.isVisible('#sos-panel')), 'y al cerrarlo se sigue con la app');
    ok(!errores.length, 'sin errores de pagina', errores);
    await ctx.close();
  }

  /* El consejo del domingo y el aviso del semaforo (24 de octubre de 2026)
     llevan a una guia. Con la app ya abierta, sw.js no la recarga: le manda a
     la pagina {tgo: 'abrir', url} (tools/auditar_sw.js prueba esa mitad). */
  console.log('— la notificacion, con la app ya abierta');
  {
    const { ctx, p, errores } = await abrirApp(b, 'es');
    const manda = d => p.evaluate(x => { navigator.serviceWorker.dispatchEvent(new MessageEvent('message', { data: x })); }, d);
    const vista = () => p.evaluate(() => { const c = document.getElementById('sos-cuerpo'); return c ? c.getAttribute('data-vista') : null; });
    await manda({ tgo: 'abrir', url: BASE + '#sos-esalert' }); await p.waitForTimeout(1500);
    ok(await p.isVisible('#sos-panel') && await vista() === 'esalert', 'el consejo del domingo abre su guia (#sos-esalert)', await vista());
    await p.evaluate(() => TG_SOS.cerrar()); await p.waitForTimeout(500);
    await manda({ tgo: 'abrir', url: BASE + '#sos-semaforo' }); await p.waitForTimeout(800);
    ok(await p.isVisible('#sos-panel') && await vista() === 'semaforo', 'el aviso del semaforo abre la suya (#sos-semaforo)', await vista());
    await p.evaluate(() => TG_SOS.cerrar()); await p.waitForTimeout(500);
    await manda({ tgo: 'abrir', url: BASE + '#bus=110' }); await manda({ tgo: 'otra', url: BASE + '#sos' }); await manda('#sos');
    await p.waitForTimeout(800);
    ok(!(await p.isVisible('#sos-panel')), 'un mensaje que no es eso no abre nada');
    ok(!errores.length, 'sin errores de pagina', errores);
    await ctx.close();
  }

  console.log('— sin red, con el service worker');
  {
    const { ctx, p, errores } = await abrirApp(b, 'es', { sw: true });
    const listo = await p.evaluate(async () => {
      await navigator.serviceWorker.ready;
      for (let i = 0; i < 60; i++) { if (await caches.match('./modulos/emergencias.js')) return true; await new Promise(r => setTimeout(r, 250)); }
      return false;
    });
    ok(listo, 'el service worker deja modulos/emergencias.js en la cache');
    await ctx.setOffline(true);
    await p.reload({ waitUntil: 'domcontentloaded' }); await p.waitForTimeout(1500);
    if (await p.isVisible('#v19-welcome-start')) { await p.click('#v19-welcome-start'); await p.waitForTimeout(800); }
    await p.click('#v19-nav-sos');
    await p.waitForFunction(() => window.TG_SOS && document.querySelectorAll('.sos-baldosa').length === 19, null, { timeout: 8000 }).catch(() => {});
    ok(await p.locator('.sos-baldosa').count() === 19, 'sin red, el panel abre con sus guias');
    ok(!errores.length, 'sin errores de pagina', errores.slice(0, 3));
    await ctx.close();
  }

  await b.close();
  console.log('\n' + hechos + ' controles · ' + (fallos ? fallos + ' fallo(s)' : 'EN VERDE'));
  process.exit(fallos ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
