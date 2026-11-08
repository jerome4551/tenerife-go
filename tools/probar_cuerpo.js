#!/usr/bin/env node
/* probar_cuerpo.js — «Su cuerpo» dentro de la app: se abre desde la tarjeta de la pestaña Cuerpo
 * del perfil, a pantalla completa, y se usa de verdad, en los diez idiomas.
 *
 *     node tools/probar_cuerpo.js PUERTO
 *
 * Son las pruebas de la entrega del cuerpo (probar_prototipo.js: las del 24 de octubre de 2026 y,
 * desde el 31, las 166 del diseño nuevo), pasadas del prototipo a la app el 31 de octubre: el
 * idioma se cambia con setLang(); y el ejemplo se escribe en tenerife.cuerpo como lo escribia el
 * prototipo (series inventadas, solo para la prueba), y su «Empezar vacío» lo quita. Lo que solo
 * tenia sentido en el prototipo, la pagina sin historial, se cambia por lo de la app:
 *   - desde el 6 de noviembre de 2026 (el bloque 2 del rediseño; del 1 al 6, «Su cuerpo» iba dentro
 *     de la pestaña Cuerpo del perfil), la tarjeta de la pestaña lleva el personaje en pequeño y su
 *     «Abrir» pone «Su cuerpo» encima del perfil, a pantalla completa, con su flecha de vuelta (1);
 *     arriba, la escena (el cielo, el sol de siete rayos, el Teide, las nubes y Las Cañadas) con el
 *     personaje grande dentro, en una sola vista, y «Girar» con la otra en pequeño (1, 4 y 6); el
 *     tema Día por defecto, y Noche con su boton, recordado en el dispositivo (10e); los 12 grupos
 *     en una rejilla (4c); la hoja de un grupo con su marcador, «+ 1 serie», «+3» y «−» con deshacer
 *     (5); «Las cifras», con la recomendacion, la referencia del ACSM y las fuentes (10f); Escape, la
 *     flecha y «atras» cierran la pantalla y dejan el perfil (10); la cabecera en cristal sobre la
 *     escena y opaca al bajar, y la barra de modos fija abajo (20); y a 359, 360, 430 y 820 px (21);
 *   - con «Su cuerpo» cargado antes que el perfil, el Escape de una hoja la cierra solo a ella
 *     (10d); y un «atras» de varios pasos de golpe cierra todo lo que quedaba encima (12);
 *   - si el modulo no llega, la tarjeta queda sin el personaje y «Abrir» lo dice, y con red otra
 *     vez lo pone (10b);
 *   - la seguridad (13): un fichero de ejercicios con HTML en un nombre y en un paso, y con
 *     enlaces javascript: y http: en las fuentes, no ejecuta nada: el nombre y el paso salen como
 *     texto y esos dos enlaces no salen; lo guardado con HTML, tampoco;
 *   - las fuentes en cada idioma (14): las notas que la entrega escribio en castellano en los
 *     titulos de las 961 fuentes («conjunto de datos», «folleto…», «barra»…) salen traducidas en
 *     los nueve idiomas, sin navegador (con la tabla y la funcion del propio modulo) y en una
 *     ficha de verdad en tres idiomas;
 *   - los menores (15): el prototipo escribe el año de nacimiento a mano en tenerife.perfil (4c);
 *     aqui se escribe en el formulario del perfil, el de verdad, y se guarda con su boton, y «Su
 *     cuerpo», en la misma pestaña, se repinta en el acto: con 15 años, ni la marca del 10 ni su
 *     texto, y la recomendacion de su edad; con 30, o sin año, la marca vuelve;
 *   - desde el 3 de noviembre de 2026, lo nuevo de la entrega del 1 (18), dentro de la pestaña:
 *     «Preguntar», con sus respuestas de datos/cuerpo/ y la frase de la IA; lo que se escribe, como
 *     texto (un <img onerror> ni se pinta ni se ejecuta); una urgencia, con el 112; el panel SOS
 *     encima desde una respuesta, y su «atras» y su Escape lo cierran solo a el (el perfil, «Su
 *     cuerpo» y la conversacion siguen); «Comida», apagado hasta que se enciende, con sus raciones
 *     y su borrar; «Su deporte», con su guia y sus grupos en el personaje; abrirCuerpo() con un modo
 *     o una pregunta; el idioma con «Preguntar» abierto; y sin las respuestas, su aviso y
 *     «Reintentar» (18b). Y sin navegador (19): las respuestas y las guias que citan un texto de
 *     la pantalla, y la politica de privacidad que cita el boton de borrar, lo citan tal cual, en
 *     los diez idiomas. Y al bajar por la pestaña, la cabecera y las pestañas del perfil quedan
 *     encima de «Su cuerpo», en sus cuatro modos, y por las esquinas de arriba de la barra pegada
 *     no asoma lo de debajo (20).
 *   - desde el 6 de noviembre de 2026, el bloque 1 del rediseño: en «Músculos», el maniqui lleva
 *     la cabeza de la persona en las dos vistas, arriba, encima de todo y sin recibir toques, y
 *     los colores de la leyenda y de las barras son los niveles del dibujo (4a); el maniqui
 *     pequeño de la hoja y los de la ficha de un ejercicio siguen sin cabeza (5 y 12b); en
 *     «Aspecto» no hay cabeza aparte (6); la cabeza lleva el aspecto que se elige (7); con el
 *     pelo largo, el toque llega al musculo de debajo y abre su hoja (7b); y la barra de
 *     «Comida» conserva su oro (18). Y el asistente, que decia «tres tonos de oro»: una pregunta
 *     por un color nuevo trae la respuesta de los colores, con los tres por su nombre (18); y, sin
 *     navegador, en los diez idiomas, las seis respuestas que hablan del mapa no nombran el oro
 *     ni en lo que enseñan ni en lo que usan para buscar (ni, en chino, llaman «el color mas
 *     oscuro» al nivel mas alto), dicen rosa, naranja y amarillo por ese
 *     orden, y el buscador del propio modulo lleva a su respuesta las preguntas por cada color y
 *     la de por que el amarillo empieza en 10 (19b). Y la bandera de la playa: las preguntas por
 *     la bandera amarilla o la roja llevan a la respuesta del mar en los diez idiomas (19c). Y el
 *     color del dibujo no es una urgencia: «¿por qué mi pecho está en naranja?» lleva a los colores,
 *     ninguna pregunta por el color de un grupo lleva a una urgencia, y el dolor de pecho sigue
 *     dando la suya (19d). Y el pecho apretado dicho de otra manera («mi pecho está apretado y me mareo»,
 *     «el pecho me duele mucho») da la urgencia en los diez idiomas, y las frases normales con las mismas
 *     palabras no dan ninguna (19e).
 *   - desde el 7 de noviembre de 2026, el bloque 3 del rediseño: el personaje en 3D (22), con el 3D
 *     encendido y eventos tactiles; todo lo demas corre con el 3D apagado (tenerife.cuerpo.3d = «no»),
 *     porque prueba el dibujo, que es la reserva del 3D y lo que sale donde no hay WebGL 2.
 *   - y el bloque 4 (la semana): las tres metas en vez de las tres cifras (4) y «Anotar movimiento»
 *     con su hoja, sus datos (mov), los puntos y los rayos de los dias con movimiento, los menores,
 *     lo roto, borrar, el asistente y los diez idiomas (23).
 * Sin red de fuera, sin service worker, a 390 x 844.
 */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const PUERTO = process.argv[2] || '8800';
const BASE = 'http://127.0.0.1:' + PUERTO;
let ok = 0, mal = 0;
function prueba(nombre, cond, extra) {
  if (cond) { ok++; console.log('  OK  ' + nombre); }
  else { mal++; console.log('  MAL ' + nombre + (extra ? '   -> ' + String(extra).slice(0, 400) : '')); }
}
/* con el personaje en 3D apagado (tenerife.cuerpo.3d = «no»): estas pruebas son las del dibujo, que es la
   reserva del 3D y lo que sale donde no hay WebGL 2; el 3D tiene las suyas (22), con el 3D encendido */
async function contexto(b, opc) {
  opc = opc || {};
  const ctx = await b.newContext(Object.assign({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block', locale: 'es-ES' }, opc.contexto || {}));
  await ctx.route('**/*', r => r.request().url().startsWith('http://127.0.0.1') && !(opc.corta && opc.corta.test(r.request().url())) ? r.continue() : r.abort());
  await ctx.addInitScript(tresD => {
    try { localStorage.setItem('tenerife.tour.seen', '99'); localStorage.setItem('tgo_consent', JSON.stringify({ v: 'denied', t: Date.now() })); if (!tresD) localStorage.setItem('tenerife.cuerpo.3d', 'no'); } catch (e) {}
  }, !!opc.tresD);
  return ctx;
}
/* los errores de la pagina; los fallos de carga se miran por la respuesta (asi se sabe que fichero era) */
function vigilar(pg, errores) {
  pg.on('pageerror', e => errores.push(e.message));
  pg.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errores.push('console: ' + m.text()); });
  pg.on('response', r => { if (r.status() >= 400 && r.url().startsWith(BASE) && !/favicon\.ico$/.test(r.url())) errores.push(r.status() + ' ' + r.url()); });
}
/* la app cargada y la bienvenida pasada */
async function abrirApp(pg) {
  await pg.goto(BASE + '/index.html', { waitUntil: 'load' });
  await pg.waitForFunction(() => typeof abrirPerfil === 'function' && typeof setLang === 'function' && typeof places !== 'undefined' && places.length > 100, null, { timeout: 30000 });
  if (await pg.locator('#v19-welcome:not(.hidden)').count()) { await pg.click('#v19-welcome-start'); await pg.waitForTimeout(1500); }
  await pg.evaluate(() => document.querySelectorAll('.v19-tour, .v19-tour-prompt, .v19-tour-overlay').forEach(e => e.remove()));
}
/* el perfil abierto, en su pestaña Cuerpo */
async function abrirPerfilCuerpo(pg) {
  await pg.evaluate(() => abrirPerfil());
  await pg.waitForFunction(() => window.TG_PERFIL && document.getElementById('perfil-panel') && !document.getElementById('perfil-panel').hidden, null, { timeout: 15000 });
  await pg.evaluate(() => TG_PERFIL.pestana('cuerpo')); await pg.waitForTimeout(200);
}
/* «Su cuerpo», a pantalla completa encima del perfil (6 de noviembre de 2026, bloque 2): lo abre
   «Abrir» de la tarjeta de la pestaña Cuerpo, que ya lleva el personaje en pequeño (el modulo se
   pide al enseñar la pestaña). Del 1 al 6 se ponia solo dentro de la pestaña */
async function suCuerpo(pg) {
  await pg.waitForFunction(() => window.TG_CUERPO && document.querySelector('#tgp-cuerpo-mini svg'), null, { timeout: 15000 });
  if (!(await pg.evaluate(() => TG_CUERPO.abierto()))) await pg.click('#tgp-cuerpo-abrir');
  await pg.waitForFunction(() => TG_CUERPO.abierto() && !document.getElementById('cuerpo-panel').hidden, null, { timeout: 15000 });
  await pg.waitForTimeout(300);
}
/* sin nada anotado (el «Empezar vacío» del prototipo) */
async function vacio(pg) {
  await pg.evaluate(() => { localStorage.removeItem('tenerife.cuerpo'); TG_CUERPO.abrir(); });
  await pg.waitForTimeout(150);
}
async function idioma(pg, l) { await pg.evaluate(l => setLang(l), l); await pg.waitForTimeout(150); }
/* el ejemplo del prototipo, tal cual: inventado, para ver el mapa con niveles. Cada fila: hace
   cuantos dias, el ejercicio (o null si se anoto solo el grupo), sus grupos principales y las
   series; una anotacion por grupo principal. Con la pantalla abierta, abrir() vuelve a leerlo */
async function ejemplo(pg) {
  await pg.evaluate(() => {
    const ymd = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    const hace = n => { const d = new Date(); d.setDate(d.getDate() - n); return ymd(d); };
    const S = [[0, 'press-banca-barra', ['pecho'], 4], [0, 'press-hombros-mancuernas', ['hombros'], 3], [0, 'fondos-paralelas-triceps', ['triceps'], 3],
      [1, 'hip-thrust-barra', ['gluteos'], 5], [1, 'plancha-antebrazos', ['core'], 4], [1, 'elevacion-talones-de-pie', ['pantorrilla'], 3],
      [2, 'dominadas', ['dorsal'], 4], [2, 'remo-sentado-polea', ['espalda_alta', 'dorsal'], 4], [2, 'curl-mancuernas', ['biceps'], 3],
      [4, 'sentadilla-trasera-barra', ['cuadriceps', 'gluteos'], 5], [4, 'peso-muerto-rumano-barra', ['isquios', 'gluteos'], 4],
      [4, null, ['pantorrilla'], 3], [6, 'flexion', ['pecho'], 4], [6, null, ['hombros'], 3], [6, null, ['triceps'], 3],
      [6, 'prensa-piernas', ['cuadriceps', 'gluteos'], 4], [9, 'paseo-granjero', ['antebrazo'], 2]];
    const t = Date.now() - 1e6, series = [];
    S.forEach(x => x[2].forEach(g => { const s = { d: hace(x[0]), g, n: x[3], t: t + series.length }; if (x[1]) s.e = x[1]; series.push(s); }));
    localStorage.setItem('tenerife.cuerpo', JSON.stringify({ v: 1, aspecto: TG_FIGURA.normaliza(null), series }));
    TG_CUERPO.abrir();
  });
  await pg.waitForTimeout(200);
}

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const ctx = await contexto(b);
  const pg = await ctx.newPage();
  const errores = [];
  vigilar(pg, errores);
  await abrirApp(pg); await abrirPerfilCuerpo(pg); await suCuerpo(pg);

  // 1. arranca sin errores: la tarjeta de la pestaña Cuerpo lleva el personaje en pequeño, y su «Abrir»
  //    pone «Su cuerpo» encima del perfil, a pantalla completa, con su flecha de vuelta (6-11-2026,
  //    bloque 2; decisión 2 de Jerome), en el tema Día, con la escena y el personaje grande dentro de ella
  prueba('sin errores al abrir', errores.length === 0, errores.join(' | '));
  const r1 = await pg.evaluate(() => {
    const p = document.getElementById('cuerpo-panel'), m = document.getElementById('tgp-cuerpo-mini'), t = document.getElementById('tgc-titulo'), e = document.getElementById('tgc-escena');
    const ve = n => !!n && n.getClientRects().length > 0, re = e.getBoundingClientRect(), rf = document.getElementById('tgc-fig').getBoundingClientRect(), rm = document.getElementById('tgc-modos').getBoundingClientRect();
    return { sitio: p.parentNode === document.body, visible: !p.hidden && ve(p), n: document.querySelectorAll('#cuerpo-panel').length, rol: p.getAttribute('role'), modal: p.getAttribute('aria-modal'),
      nivel: t.getAttribute('aria-level'), atras: ve(document.getElementById('tgc-back')) && document.getElementById('tgc-back').getAttribute('aria-label'),
      inerte: document.getElementById('perfil-panel').inert, estado: JSON.stringify(history.state),
      mini: !!m.querySelector('svg') && m.getAttribute('aria-hidden') === 'true', tema: p.getAttribute('data-tema'), guardado: localStorage.getItem('tenerife.cuerpo.tema'),
      cielo: !!document.querySelector('#tgc-cielo svg'), rayos: document.querySelectorAll('#tgc-cielo .tgc-rayo').length, escenaArriba: Math.round(re.top) === 0 && re.height >= 400 && re.height <= 600,
      figuraDentro: rf.top >= re.top && rf.bottom <= re.bottom + 1 && rf.height > re.height * 0.6, cabeza: document.querySelectorAll('#tgc-cara .tgf-cabeza').length,
      girar: ve(document.getElementById('tgc-girar')) && !!document.querySelector('#tgc-girar-mini svg'), modosAbajo: Math.round(rm.bottom) === innerHeight && getComputedStyle(document.getElementById('tgc-modos')).position === 'fixed' };
  });
  prueba('«Abrir» de la tarjeta: «Su cuerpo» encima del perfil, a pantalla completa, una sola vez (diálogo modal, título de nivel 1)', r1.sitio && r1.visible && r1.n === 1 && r1.rol === 'dialog' && r1.modal === 'true' && !r1.nivel, JSON.stringify(r1));
  prueba('su flecha de vuelta al perfil, el perfil inerte debajo y su entrada en el historial', r1.atras === 'Volver a su perfil' && r1.inerte === true && r1.estado === '{"tgPerfil":1,"tgCuerpo":1}', JSON.stringify(r1));
  prueba('la tarjeta de la pestaña lleva el personaje en pequeño, sin nada que leer (aria-hidden)', r1.mini, JSON.stringify(r1));
  prueba('el tema Día por defecto, sin nada guardado', r1.tema === 'dia' && r1.guardado === null, r1.tema + ' ' + r1.guardado);
  prueba('la escena arriba, de 400 a 600 px, con el cielo dibujado y sus siete rayos, y el personaje grande dentro, con su cabeza', r1.cielo && r1.rayos === 7 && r1.escenaArriba && r1.figuraDentro && r1.cabeza === 1, JSON.stringify(r1));
  prueba('«Girar» con la otra vista en pequeño, y la barra de modos fija abajo', r1.girar && r1.modosAbajo, JSON.stringify(r1));

  // 2. cada selector de TEXTOS da un solo elemento y cada clave existe en los 10 idiomas
  const r2 = await pg.evaluate(() => {
    const p = document.getElementById('cuerpo-panel'), malos = [];
    p.querySelectorAll('[data-tx],[data-tx-aria],[data-tx-ph]').forEach(n => ['data-tx', 'data-tx-aria', 'data-tx-ph'].forEach(at => { const k = n.getAttribute(at); if (k && !UI_TX[k]) malos.push('sin fila ' + k); }));
    return { n: p.querySelectorAll('[data-tx],[data-tx-aria]').length, ph: p.querySelectorAll('[data-tx-ph]').length, malos };
  });
  /* desde el 3 de noviembre, con «Comida», «Preguntar» y «Su deporte», 109; desde el 6 (bloque 2), con
     el tema, «Las cifras», «+ 1 serie», «+3» y la referencia corta, y sin el lema, los pies de las vistas
     ni el paso de la hoja, 108; desde el 7 (bloque 4), con las tres metas (su nombre y «Meta cumplida»,
     6), «Anotar movimiento» y su hoja (17) y sin las tres cifras de antes (3), 128; y 2 placeholders (el del
     buscador de ejercicios y el de la pregunta) */
  prueba('textos fijos puestos (128 elementos, con la línea de la IA, y 2 placeholders)', r2.n === 128 && r2.ph === 2, r2.n + '/' + r2.ph);
  prueba('todas las claves fijas existen', r2.malos.length === 0, r2.malos.join(', '));
  const r2b = await pg.evaluate(() => {
    const L = ['es', 'en', 'fr', 'de', 'it', 'nl', 'zh', 'zht', 'bg', 'pl'], huecos = [];
    Object.keys(UI_TX).filter(k => k.indexOf('cuerpo') === 0).forEach(k => L.forEach(l => { if (!UI_TX[k][l]) huecos.push(k + '.' + l); }));
    return huecos;
  });
  prueba('ninguna fila sin idioma', r2b.length === 0, r2b.slice(0, 8).join(', '));

  // 3. los 10 idiomas: textos visibles, sin desborde horizontal, plurales bien
  for (const l of ['es', 'en', 'fr', 'de', 'it', 'nl', 'zh', 'zht', 'bg', 'pl']) {
    await idioma(pg, l); await pg.waitForTimeout(80);
    for (const m of ['musculos', 'aspecto']) {
      await pg.evaluate(mm => document.getElementById(mm === 'musculos' ? 'tgc-modo-m' : 'tgc-modo-a').click(), m);
      await pg.waitForTimeout(60);
      const r = await pg.evaluate(() => {
        /* nada pasa del borde de la pantalla (ni a la derecha ni a la izquierda) y la pantalla no se
           desplaza de lado. Lo de dentro de un svg no se mira: el sol y las nubes del cielo salen por
           los lados a propósito, recortados por la escena */
        const p = document.getElementById('cuerpo-panel'), b = p.getBoundingClientRect();
        const vacios = [...p.querySelectorAll('#tgc [data-tx], #tgc-modos [data-tx]')].filter(n => n.getClientRects().length && !n.textContent.trim()).map(n => n.id || n.className);
        const anchos = [...p.querySelectorAll('#tgc *, #tgc-modos *')].filter(n => { if (!n.getClientRects().length || n.closest('svg')) return false; const x = n.getBoundingClientRect(); return x.right > b.right + 0.5 || x.left < b.left - 0.5; })
          .map(n => n.id || (typeof n.className === 'string' ? n.className : '') || n.tagName).slice(0, 5);
        return { vacios, anchos, psw: p.scrollWidth, pcw: p.clientWidth, lang: p.getAttribute('lang') };
      });
      prueba(`${l}/${m}: sin textos vacíos`, r.vacios.length === 0, r.vacios.join(','));
      prueba(`${l}/${m}: sin desborde: nada pasa del borde de la pantalla y la pantalla no se desplaza de lado`, r.psw <= r.pcw && r.anchos.length === 0, `${r.psw}>${r.pcw} ${r.anchos.join(',')}`);
      prueba(`${l}: lang del panel`, r.lang === (l === 'zht' ? 'zh-Hant' : l === 'zh' ? 'zh-Hans' : l), r.lang);
    }
  }
  const pl = await pg.evaluate(() => { currentLang = 'pl'; const r = [1, 2, 5, 12, 22, 25].map(n => tx('cuerpoNSeries', { n })); currentLang = 'es'; return r; });
  prueba('polaco: seria/serie/serii', pl.join('|') === '1 seria|2 serie|5 serii|12 serii|22 serie|25 serii', pl.join('|'));
  await idioma(pg, 'es'); await pg.evaluate(() => document.getElementById('tgc-modo-m').click());

  // 4. el ejemplo: niveles del mapa y las tres metas de la semana (7-11-2026, bloque 4: días con fuerza de 2,
  //    minutos de movimiento de 150 y grupos trabajados de 12, con su raya y su marca de cumplida; antes, tres cifras)
  await ejemplo(pg); await pg.waitForTimeout(200);
  const r4 = await pg.evaluate(() => {
    const meta = id => { const m = document.getElementById('tgc-meta-' + id); return { n: m.querySelector('.tgc-meta-n b').textContent, de: m.querySelector('.tgc-meta-de').textContent, hecha: m.classList.contains('hecha'), ok: !m.querySelector('.tgc-meta-ok').hidden, raya: m.querySelector('.tgc-meta-raya i').style.width, nombre: m.getAttribute('aria-label') }; };
    return {
      fuerza: meta('fuerza'), mov: meta('mov'), grupos: meta('grupos'), sinSeries: !document.getElementById('tgc-st-series'),
      niveles: Object.fromEntries([...document.querySelectorAll('#tgc-lista .tgc-fila')].map(b => [b.dataset.g, b.querySelector('.tgc-nivel').className.slice(-1)])),
      zonas: document.querySelectorAll('#tgc-cara .tgf-z').length, rayos: [...document.querySelectorAll('#tgc-cielo .tgc-rayo')].map(r => r.getAttribute('opacity') === '1' ? 1 : 0).join('')
    };
  });
  prueba('metas: 5 de 2 días con fuerza, cumplida, con la raya llena y su nombre', r4.fuerza.n === '5' && r4.fuerza.de === 'de 2 días con fuerza' && r4.fuerza.hecha && r4.fuerza.ok && r4.fuerza.raya === '100%' && r4.fuerza.nombre === 'Días con fuerza', JSON.stringify(r4.fuerza));
  prueba('metas: 0 de 150 min de movimiento (el ejemplo no tiene), sin cumplir, con la raya vacía', r4.mov.n === '0' && r4.mov.de === 'de 150 min de movimiento' && !r4.mov.hecha && !r4.mov.ok && r4.mov.raya === '0%' && r4.mov.nombre === 'Minutos de movimiento', JSON.stringify(r4.mov));
  prueba('metas: 11 de 12 grupos trabajados, sin cumplir, con la raya al 92 %', r4.grupos.n === '11' && r4.grupos.de === 'de 12 grupos trabajados' && !r4.grupos.hecha && r4.grupos.raya === '92%' && r4.grupos.nombre === 'Grupos trabajados', JSON.stringify(r4.grupos));
  prueba('metas: la cifra «Series» del resumen ya no está (las series siguen en cada grupo y en la hoja)', r4.sinSeries);
  prueba('niveles del ejemplo', JSON.stringify(r4.niveles) === JSON.stringify({ pecho: '2', dorsal: '2', espalda_alta: '1', hombros: '2', biceps: '1', triceps: '2', antebrazo: '0', core: '1', gluteos: '3', cuadriceps: '2', isquios: '1', pantorrilla: '2' }), JSON.stringify(r4.niveles));
  /* el sol: un rayo encendido por cada día con series en los últimos 7, del más antiguo (hace 6) a hoy */
  prueba('el sol: cinco rayos encendidos, los de los días con series (hace 6, 4, 2, 1 y hoy)', r4.rayos === '1010111', r4.rayos);
  /* una sola vista a la vez: la de espaldas, con «Girar» */
  const grFrente = await pg.evaluate(() => [...new Set([...document.querySelectorAll('#tgc-cara .tgf-z')].map(z => z.dataset.g))].sort().join(','));
  await pg.click('#tgc-girar'); await pg.waitForTimeout(400);
  const r4z = await pg.evaluate(() => ({ zonasE: document.querySelectorAll('#tgc-cara .tgf-z').length, grEsp: [...new Set([...document.querySelectorAll('#tgc-cara .tgf-z')].map(z => z.dataset.g))].sort().join(',') }));
  await pg.click('#tgc-girar'); await pg.waitForTimeout(400);
  prueba('zonas de frente y de espaldas', r4.zonas > 20 && r4z.zonasE > 20, r4.zonas + '/' + r4z.zonasE);
  const todos = [...new Set((grFrente + ',' + r4z.grEsp).split(','))].sort().join(',');
  prueba('los 12 grupos están en el dibujo', todos.split(',').length === 12, todos);

  // 4a. (6-11-2026, el bloque 1 del rediseño) en «Músculos», el maniquí lleva la cabeza de la persona, en
  //     la vista grande y en la pequeña de «Girar»: arriba, encima de todo y sin recibir toques (lo de
  //     debajo es el dibujo, no ella). Y los colores de la leyenda y de la rejilla son los niveles del dibujo
  const r4x = await pg.evaluate(() => {
    const f = [...document.querySelectorAll('#tgc-cara .tgf-cabeza')], e = [...document.querySelectorAll('#tgc-girar-mini .tgf-cabeza')], todas = f.concat(e);
    const hex = c => '#' + c.match(/\d+/g).slice(0, 3).map(x => (+x).toString(16).padStart(2, '0')).join('').toUpperCase();
    const N = TG_FIGURA.MUSC.nivel.map(c => c.toUpperCase());
    let arriba = false, debajo = false;
    if (f[0]) {
      const c = f[0].getBoundingClientRect(), svg = f[0].ownerSVGElement.getBoundingClientRect();
      arriba = c.top >= svg.top - 1 && c.bottom < svg.top + svg.height * 0.25 && c.width > 20;
      const bajo = document.elementFromPoint(c.left + c.width / 2, c.top + c.height / 2);
      debajo = !!bajo && !bajo.closest('.tgf-cabeza') && !!bajo.closest('#tgc-cara');
    }
    return { n: f.length + '/' + e.length, toques: todas.every(x => getComputedStyle(x).pointerEvents === 'none'),
      ultima: todas.every(x => x.ownerSVGElement.lastElementChild === x), arriba, debajo,
      ojos: (f[0] ? f[0].querySelectorAll('[fill="#FBF8F3"]').length : -1) + '/' + (e[0] ? e[0].querySelectorAll('[fill="#FBF8F3"]').length : -1),
      css: [0, 1, 2, 3].map(i => getComputedStyle(document.getElementById('cuerpo-panel')).getPropertyValue('--n' + i).trim().toUpperCase()).join(' '), dibujo: N.join(' '),
      leyenda: [0, 1, 2, 3].map(i => hex(getComputedStyle(document.getElementById('tgc-ley-' + i).previousElementSibling).backgroundColor)).join(' '),
      puntos: [...document.querySelectorAll('#tgc-lista .tgc-fila .tgc-nivel')].map(i => hex(getComputedStyle(i).backgroundColor) === N[+i.className.slice(-1)]) };
  });
  prueba('músculos: el maniquí lleva la cabeza de la persona, en la vista grande y en la pequeña de «Girar»', r4x.n === '1/1', r4x.n);
  prueba('músculos: la cabeza, arriba, encima de todo y sin recibir toques (debajo, el dibujo)', r4x.arriba && r4x.ultima && r4x.toques && r4x.debajo, JSON.stringify(r4x));
  prueba('músculos: de frente, con sus ojos; de espaldas (en «Girar»), sin ellos', r4x.ojos === '2/0', r4x.ojos);
  prueba('los colores de la pantalla (--n0 a --n3) son los niveles del dibujo', r4x.css === r4x.dibujo, r4x.css + ' / ' + r4x.dibujo);
  prueba('la leyenda y los 12 puntos de la rejilla, con el color de su nivel', r4x.leyenda === r4x.dibujo && r4x.puntos.length === 12 && r4x.puntos.every(Boolean), r4x.leyenda + ' / ' + r4x.puntos.join(','));

  // 4b. la semana día a día: 7 días, hoy marcado y elegido, sus cuentas cuadran con el resumen
  const r4b = await pg.evaluate(() => {
    const dias = [...document.querySelectorAll('#tgc-dias7 .tgc-dia')];
    const n = d => { const s = TG_CUERPO.estado().series; return s.filter(x => x.d === d).reduce((a, x) => a + x.n, 0); };
    return { n: dias.length, hoy: dias[6].getAttribute('aria-current') === 'date' && dias[6].getAttribute('aria-pressed') === 'true',
             suma: dias.reduce((a, b) => a + n(b.dataset.d), 0), conSeries: dias.filter(b => n(b.dataset.d) > 0).length,
             barras: dias.filter(b => !b.querySelector('.tgc-dia-barra').classList.contains('cero')).length,
             nombre: dias[6].getAttribute('aria-label'), txt: document.getElementById('tgc-dia-txt').textContent, grupos: document.getElementById('tgc-dia-grupos').textContent };
  });
  prueba('semana: 7 días, hoy marcado y elegido', r4b.n === 7 && r4b.hoy, JSON.stringify(r4b));
  prueba('semana: la suma de los días es la del resumen (76)', r4b.suma === 76, String(r4b.suma));
  prueba('semana: un día con barra por cada día con fuerza (5)', r4b.conSeries === 5 && r4b.barras === 5, r4b.conSeries + '/' + r4b.barras);
  prueba('semana: hoy, con sus series y sus grupos', /: 10 series$/.test(r4b.txt) && r4b.nombre === r4b.txt && r4b.grupos === 'Pecho, Hombros, Tríceps', r4b.txt + ' | ' + r4b.grupos);
  await pg.click('#tgc-dias7 li:nth-child(6) .tgc-dia'); await pg.waitForTimeout(60);
  const r4c = await pg.evaluate(() => ({ el: [...document.querySelectorAll('#tgc-dias7 .tgc-dia')].map(b => b.getAttribute('aria-pressed')).join(','),
    txt: document.getElementById('tgc-dia-txt').textContent, grupos: document.getElementById('tgc-dia-grupos').textContent }));
  prueba('semana: tocar ayer enseña ayer', r4c.el === 'false,false,false,false,false,true,false' && /: 12 series$/.test(r4c.txt) && r4c.grupos === 'Abdomen y lumbares, Glúteos y cadera, Pantorrillas y espinillas', JSON.stringify(r4c));
  await pg.click('#tgc-dias7 li:nth-child(4) .tgc-dia'); await pg.waitForTimeout(60);   // hace 3 días: el ejemplo no tiene nada
  prueba('semana: un día sin nada lo dice', await pg.evaluate(() => document.getElementById('tgc-dia-grupos').textContent === 'sin anotar' && /: 0 series$/.test(document.getElementById('tgc-dia-txt').textContent)));

  // 4c. (6-11-2026, bloque 2) los 12 grupos en una rejilla de tres columnas: cada botón, el nombre, el punto
  //     de su nivel con sus series y la última vez; los que tienen series, marcados. La referencia del ACSM
  //     (adultos) va en «Las cifras» y en la hoja de cada grupo
  const r4d = await pg.evaluate(() => {
    const filas = [...document.querySelectorAll('#tgc-lista .tgc-fila')], tops = filas.map(b => Math.round(b.getBoundingClientRect().top));
    const s = n => Number(n.querySelector('.tgc-fila-n').textContent.match(/\d+/)[0]);
    return { n: filas.length, columnas: new Set(tops.slice(0, 3)).size === 1 && tops[3] > tops[0], con: filas.filter(b => b.classList.contains('con')).length,
      bien: filas.every(b => b.classList.contains('con') === (s(b) > 0) && !!b.querySelector('.tgc-fila-dato .tgc-nivel') && !!b.querySelector('.tgc-fila-cuando')),
      nombre: filas[0].textContent.replace(/\s+/g, ' ').trim(), ref: document.getElementById('tgc-cifras-ref').hidden, hRef: document.getElementById('tgc-h-ref').hidden };
  });
  prueba('grupos: 12 botones en tres columnas, con el nombre, el punto de su nivel, las series y cuándo', r4d.n === 12 && r4d.columnas && r4d.bien, JSON.stringify(r4d));
  prueba('grupos: los 11 con series van marcados', r4d.con === 11, String(r4d.con));
  prueba('grupos: el botón dice el grupo, las series y cuándo', r4d.nombre === 'Pecho 8 series hoy', r4d.nombre);
  prueba('adultos: la referencia del ACSM, en «Las cifras» y en la hoja', !r4d.ref && !r4d.hRef, JSON.stringify(r4d));
  // de 14 a 17 años (perfil con el año de nacimiento): la recomendación de la OMS para su edad y sin la referencia del 10
  await pg.evaluate(() => { localStorage.setItem('tenerife.perfil', JSON.stringify({ nacimiento: new Date().getFullYear() - 15 })); TG_CUERPO.repintar(); });
  const r4e = await pg.evaluate(() => ({ ref: document.getElementById('tgc-cifras-ref').hidden, hRef: document.getElementById('tgc-h-ref').hidden,
    reco: document.getElementById('tgc-reco').textContent, cifras: document.getElementById('tgc-cifras-reco').textContent }));
  prueba('menores: sin la referencia del 10 (ni en «Las cifras» ni en la hoja), con la recomendación de su edad', r4e.ref && r4e.hRef && /5 a 17|3 días/.test(r4e.reco) && r4e.cifras === r4e.reco, JSON.stringify(r4e));
  await pg.evaluate(() => { localStorage.removeItem('tenerife.perfil'); TG_CUERPO.repintar(); });

  // 5. la hoja (6-11-2026, bloque 2): tocar el pecho en el dibujo; el marcador; «+ 1 serie», «+3», «−» y
  //    deshacer; borrar del historial y deshacer. La hoja sale abajo de la pantalla, el velo la cubre
  //    entera y lo de debajo (la pantalla y la barra de modos) queda inerte; al cerrarla, todo vuelve
  await pg.evaluate(() => { const z = document.querySelector('#tgc-cara .tgf-z[data-g="pecho"]'); z.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
  await pg.waitForTimeout(300);
  prueba('la hoja se abre desde el dibujo', await pg.evaluate(() => !document.getElementById('tgc-hoja').hidden && document.getElementById('tgc-hoja-tit').textContent === 'Pecho'));
  prueba('el foco va a la hoja', await pg.evaluate(() => document.activeElement && document.activeElement.id === 'tgc-hoja-tit'));
  prueba('lo de debajo, inerte: la pantalla y la barra de modos', await pg.evaluate(() => document.getElementById('tgc').inert === true && document.getElementById('tgc-modos').inert === true));
  /* con la hoja ya subida (3 de noviembre de 2026): su animacion (tgc-sube, 320 ms) la trae desde
     28 px mas abajo, y a los 300 ms todavia le faltaban hasta 0,8 px; con el procesador ocupado,
     hasta 17,6, y «sale abajo de la pantalla» salia en rojo a ratos */
  await pg.evaluate(() => Promise.all(document.getElementById('tgc-hoja').getAnimations().map(a => a.finished)));
  const r5a = await pg.evaluate(() => {
    const h = document.getElementById('tgc-hoja').getBoundingClientRect(), v = document.getElementById('tgc-velo').getBoundingClientRect();
    return { abajo: Math.abs(h.bottom - innerHeight) <= 1, alto: h.height <= innerHeight * 0.8 + 1, velo: v.top <= 0 && v.bottom >= innerHeight && v.left <= 0 && v.right >= innerWidth,
      estado: JSON.stringify(history.state) };
  });
  prueba('la hoja sale abajo de la pantalla, de un 80 % como mucho (el dibujo asoma), y el velo la cubre entera', r5a.abajo && r5a.alto && r5a.velo, JSON.stringify(r5a));
  prueba('su entrada en el historial', r5a.estado === '{"tgPerfil":1,"tgCuerpo":1,"tgCuerpoHoja":1}', r5a.estado);
  prueba('selección marcada en el dibujo', await pg.evaluate(() => document.querySelectorAll('#tgc-cara .tgf-marca path').length > 0));
  const r5m = await pg.evaluate(() => ({ n: document.getElementById('tgc-h-series').textContent, nivel: document.getElementById('tgc-h-nivel').textContent, clase: document.getElementById('tgc-hoja-nivel').className,
    puntos: document.querySelectorAll('#tgc-diez i').length, llenos: document.querySelectorAll('#tgc-diez i.si.n2').length, mas: !!document.querySelector('#tgc-diez .mas'),
    menos: document.getElementById('tgc-menos').disabled, menosAria: document.getElementById('tgc-menos').getAttribute('aria-label'), hoy: document.getElementById('tgc-hoy').getAttribute('aria-pressed'),
    btn: document.getElementById('tgc-guardar-txt').textContent, tres: document.getElementById('tgc-mas3').textContent + '|' + document.getElementById('tgc-mas3').getAttribute('aria-label'),
    dias: document.getElementById('tgc-h-dias').textContent, ultima: document.getElementById('tgc-h-ultima').textContent }));
  prueba('el marcador: 8 series, «De 5 a 9» con el punto de su color, 8 de los 10 puntos llenos; 2/7 días y «hoy»', r5m.n === '8' && r5m.nivel === 'De 5 a 9' && /n2$/.test(r5m.clase) && r5m.puntos === 10 && r5m.llenos === 8 && !r5m.mas && r5m.dias === '2/7' && r5m.ultima === 'hoy', JSON.stringify(r5m));
  prueba('«+ 1 serie» y «+3» (tres series más); «−» (una serie menos) activo, porque hoy hay series; Hoy elegido', r5m.btn === '+ 1 serie' && r5m.tres === '+3|Tres series más' && !r5m.menos && r5m.menosAria === 'Una serie menos' && r5m.hoy === 'true', JSON.stringify(r5m));
  await pg.click('#tgc-ayer'); await pg.click('#tgc-guardar'); await pg.waitForTimeout(150);
  const r5 = await pg.evaluate(() => { const s = TG_CUERPO.estado().series, x = s[s.length - 1]; return { x, guardado: JSON.parse(localStorage.getItem('tenerife.cuerpo')).series.length, n: s.length, toast: document.getElementById('tgc-toast-txt').textContent }; });
  const ayer = await pg.evaluate(() => { const d = new Date(); d.setDate(d.getDate() - 1); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); });
  prueba('«+ 1 serie» con Ayer: 1 serie de pecho ayer', r5.x.g === 'pecho' && r5.x.n === 1 && r5.x.d === ayer, JSON.stringify(r5.x));
  prueba('guardado en el dispositivo', r5.guardado === r5.n);
  prueba('aviso de anotado', r5.toast === 'Pecho: 1 serie anotada', r5.toast);
  await pg.click('#tgc-mas3'); await pg.waitForTimeout(150);
  const r5b = await pg.evaluate(() => { const s = TG_CUERPO.estado().series, x = s[s.length - 1]; return { x, n: document.getElementById('tgc-h-series').textContent, clase: document.getElementById('tgc-hoja-nivel').className,
    llenos: document.querySelectorAll('#tgc-diez i.si.n3').length, mas: (document.querySelector('#tgc-diez .mas') || {}).textContent, toast: document.getElementById('tgc-toast-txt').textContent }; });
  prueba('«+3»: 3 series más de pecho ayer; el pecho sube a 12 (nivel 3): los 10 puntos llenos, en amarillo, y «+2»', r5b.x.g === 'pecho' && r5b.x.n === 3 && r5b.x.d === ayer && r5b.n === '12' && /n3$/.test(r5b.clase) && r5b.llenos === 10 && r5b.mas === '+2' && r5b.toast === 'Pecho: 3 series anotadas', JSON.stringify(r5b));
  await pg.click('#tgc-menos'); await pg.waitForTimeout(150);
  const r5c = await pg.evaluate(() => { const s = TG_CUERPO.estado().series, x = s[s.length - 1]; return { x, n: document.getElementById('tgc-h-series').textContent, toast: document.getElementById('tgc-toast-txt').textContent,
    btn: !document.getElementById('tgc-toast-btn').hidden && document.getElementById('tgc-toast-btn').textContent, series: s.length }; });
  prueba('«−»: una serie menos, de la última anotación de ayer (de 3 a 2): 11 series, y «Deshacer» en el aviso', r5c.x.n === 2 && r5c.x.d === ayer && r5c.n === '11' && r5c.toast === 'Pecho: una serie menos' && r5c.btn === 'Deshacer', JSON.stringify(r5c));
  await pg.click('#tgc-toast-btn'); await pg.waitForTimeout(150);
  prueba('deshacer la quitada: 12 otra vez, con la anotación de 3', await pg.evaluate(() => { const s = TG_CUERPO.estado().series; return document.getElementById('tgc-h-series').textContent === '12' && s[s.length - 1].n === 3; }));
  // «−» tres veces: la anotación de 3 baja a 2, a 1 y desaparece
  for (let i = 0; i < 3; i++) { await pg.click('#tgc-menos'); await pg.waitForTimeout(120); }
  const r5d = await pg.evaluate(() => { const s = TG_CUERPO.estado().series, x = s[s.length - 1]; return { ultima: x.n + ' ' + (x.d === new Date().toISOString().slice(0, 10) ? 'hoy' : 'otro'), n: document.getElementById('tgc-h-series').textContent, series: s.length, menos: document.getElementById('tgc-menos').disabled }; });
  prueba('«−» hasta el final: la anotación se va entera (9 series), queda la de 1 de ayer, y «−» sigue activo', r5d.series === r5c.series - 1 && r5d.n === '9' && r5d.ultima === '1 otro' && !r5d.menos, JSON.stringify(r5d));
  prueba('el pecho vuelve al nivel 2', await pg.evaluate(() => document.getElementById('tgc-hoja-nivel').classList.contains('n2')));
  const nAntes = r5d.series;
  await pg.click('.tgc-hist-x'); await pg.waitForTimeout(100);
  prueba('borrar una anotación del historial', await pg.evaluate(() => TG_CUERPO.estado().series.length) === nAntes - 1);
  await pg.click('#tgc-toast-btn'); await pg.waitForTimeout(100);
  prueba('deshacer la borrada', await pg.evaluate(() => TG_CUERPO.estado().series.length) === nAntes);
  // el foco no sale de la hoja
  await pg.focus('#tgc-hoja-cerrar');
  for (let i = 0; i < 25; i++) await pg.keyboard.press('Tab');
  prueba('el foco se queda en la hoja', await pg.evaluate(() => document.getElementById('tgc-hoja').contains(document.activeElement)));
  await pg.keyboard.press('Escape'); await pg.waitForTimeout(150);
  prueba('Escape cierra la hoja; «Su cuerpo» y el perfil siguen abiertos', await pg.evaluate(() => document.getElementById('tgc-hoja').hidden && TG_CUERPO.abierto() && !document.getElementById('perfil-panel').hidden && JSON.stringify(history.state) === '{"tgPerfil":1,"tgCuerpo":1}'));
  prueba('lo de debajo vuelve a funcionar: ni la pantalla ni la barra de modos inertes, y sin selección en el dibujo', await pg.evaluate(() => document.getElementById('tgc').inert === false && document.getElementById('tgc-modos').inert === false && document.querySelectorAll('#tgc-cara .tgf-marca').length === 0));
  // desde la rejilla: un grupo sin series hoy («−» apagado), y uno que solo se ve de espaldas (el dibujo se da la vuelta)
  await pg.click('#tgc-lista .tgc-fila[data-g="antebrazo"]'); await pg.waitForTimeout(300);
  const r5e = await pg.evaluate(() => ({ tit: document.getElementById('tgc-hoja-tit').textContent, n: document.getElementById('tgc-h-series').textContent, nivel: document.getElementById('tgc-h-nivel').textContent,
    llenos: document.querySelectorAll('#tgc-diez i.si').length, menos: document.getElementById('tgc-menos').disabled }));
  await pg.click('#tgc-ayer'); await pg.waitForTimeout(100);
  const r5f = await pg.evaluate(() => document.getElementById('tgc-menos').disabled);
  prueba('desde la rejilla, los antebrazos: 0 series, «Ninguna», ningún punto lleno, y «−» apagado (hoy y ayer, sin nada que quitar)', r5e.tit === 'Antebrazos' && r5e.n === '0' && r5e.nivel === 'Ninguna' && r5e.llenos === 0 && r5e.menos && r5f, JSON.stringify(r5e));
  await pg.keyboard.press('Escape'); await pg.waitForTimeout(150);
  /* un grupo que solo se ve de espaldas (el primero que no esté en la vista de frente: con el personaje de hoy, los glúteos) */
  const soloEspalda = r4z.grEsp.split(',').find(g => !grFrente.split(',').includes(g));
  await pg.click('#tgc-lista .tgc-fila[data-g="' + soloEspalda + '"]'); await pg.waitForTimeout(500);
  const r5g = await pg.evaluate(g => ({ tit: document.getElementById('tgc-hoja-tit').textContent, nombre: tx('cuerpoG_' + g), espalda: document.getElementById('tgc-giro').classList.contains('is-espalda') && document.querySelector('#tgc-cara svg').classList.contains('tgf-espalda'),
    marca: [...document.querySelectorAll('#tgc-cara .tgf-marca')].length > 0, desplazado: document.getElementById('cuerpo-panel').scrollTop }), soloEspalda);
  prueba('desde la rejilla, un grupo que solo se ve de espaldas (' + soloEspalda + '): el dibujo se da la vuelta, con el grupo marcado, y la pantalla sube arriba', !!soloEspalda && r5g.tit === r5g.nombre && r5g.espalda && r5g.marca && r5g.desplazado === 0, JSON.stringify(r5g));
  await pg.keyboard.press('Escape'); await pg.waitForTimeout(150);
  await pg.click('#tgc-girar'); await pg.waitForTimeout(400);

  // 6. (6-11-2026, bloque 2) una sola vista, grande; «Girar» le da la vuelta y enseña la otra en pequeño,
  //    en «Músculos» y en «Aspecto»
  const vistaDe = () => pg.evaluate(() => ({ grande: document.querySelector('#tgc-cara svg').classList.contains('tgf-espalda') ? 'espalda' : 'frente',
    mini: document.querySelector('#tgc-girar-mini svg').classList.contains('tgf-espalda') ? 'espalda' : 'frente', giro: document.getElementById('tgc-giro').classList.contains('is-espalda'),
    aria: document.getElementById('tgc-girar').getAttribute('aria-label'), zonas: document.querySelectorAll('#tgc-cara .tgf-z').length, svgs: document.querySelectorAll('#tgc-giro svg').length,
    legible: document.querySelector('#tgc-cara svg').getAttribute('role') === 'img' && !!document.querySelector('#tgc-cara svg').getAttribute('aria-label') && document.querySelector('#tgc-girar-mini svg').getAttribute('aria-hidden') === 'true' }));
  if ((await vistaDe()).grande === 'espalda') { await pg.click('#tgc-girar'); await pg.waitForTimeout(400); }
  const r6 = await vistaDe();
  prueba('músculos: una sola vista, de frente, legible (con su nombre), y la de espaldas en pequeño en «Girar», sin nada que leer', r6.grande === 'frente' && r6.mini === 'espalda' && !r6.giro && r6.aria === 'Ver de espaldas' && r6.zonas > 20 && r6.svgs === 1 && r6.legible, JSON.stringify(r6));
  await pg.click('#tgc-girar'); await pg.waitForTimeout(400);
  const r6b = await vistaDe();
  prueba('girar: de espaldas, con la de frente en pequeño', r6b.grande === 'espalda' && r6b.mini === 'frente' && r6b.giro && r6b.aria === 'Ver de frente' && r6b.zonas > 20, JSON.stringify(r6b));
  await pg.click('#tgc-girar'); await pg.waitForTimeout(400);
  await pg.click('#tgc-modo-a'); await pg.waitForTimeout(300);
  const r6c = await pg.evaluate(() => ({ zonas: document.querySelectorAll('#tgc-cara .tgf-z').length, cabezas: document.querySelectorAll('#tgc-giro .tgf-cabeza').length, svgs: document.querySelectorAll('#tgc-giro svg').length,
    escena: !document.getElementById('tgc-escena').hidden, pegada: getComputedStyle(document.getElementById('tgc-escena')).position }));
  prueba('aspecto: el personaje de siempre (sin zonas ni cabeza aparte), en la escena, que se queda pegada arriba', r6c.zonas === 0 && r6c.cabezas === 0 && r6c.svgs === 1 && r6c.escena && r6c.pegada === 'sticky', JSON.stringify(r6c));
  await pg.click('#tgc-girar'); await pg.waitForTimeout(400);
  const r6d = await vistaDe();
  prueba('aspecto: «Girar» le da la vuelta', r6d.grande === 'espalda' && r6d.giro && r6d.aria === 'Ver de frente', JSON.stringify(r6d));
  await pg.click('#tgc-girar'); await pg.waitForTimeout(400);
  await pg.click('#tgc-modo-m'); await pg.waitForTimeout(100);

  // 7. el aspecto: cambiar y que se guarde
  await pg.click('#tgc-modo-a'); await pg.waitForTimeout(100);
  await pg.click('label:has(#tgc-pelo-afro)'); await pg.click('label:has(#tgc-arriba-tirantes)'); await pg.click('label:has(#tgc-piel-8)');
  await pg.click('label:has(#tgc-protesis-pierna_izq)');
  const r7 = await pg.evaluate(() => ({ a: TG_CUERPO.estado().aspecto, g: JSON.parse(localStorage.getItem('tenerife.cuerpo')).aspecto }));
  prueba('aspecto cambiado', r7.a.pelo === 'afro' && r7.a.arriba === 'tirantes' && r7.a.piel === 8 && r7.a.protesis === 'pierna_izq', JSON.stringify(r7.a));
  prueba('aspecto guardado', JSON.stringify(r7.a) === JSON.stringify(r7.g));
  /* la tarjeta del perfil es oscura: el personaje en pequeño va con el ambiente de la noche aunque la
     pantalla esté en Día, y el ambiente de la pantalla vuelve después */
  prueba('el personaje en pequeño para la tarjeta del perfil (TG_CUERPO.mini), con el aspecto nuevo y el ambiente de la noche', await pg.evaluate(() => {
    const t = document.createElement('span'), m = document.createElement('span'), A = TG_FIGURA.AMB, dia = Object.assign({}, A);
    Object.assign(A, { halo: '#7193C4', haloOp: 0.3, suelo: '#000000', sueloOp: 0.42 });
    t.innerHTML = TG_FIGURA.svg({ vista: 'frente', modo: 'aspecto', aspecto: TG_CUERPO.estado().aspecto, id: 'tgc-mini', viewBox: '110 20 180 300' });
    Object.assign(A, dia);
    TG_CUERPO.mini(m);
    return !!m.querySelector('svg') && m.innerHTML === t.innerHTML && A.halo === '#FFFFFF' && A.halo === dia.halo;
  }));
  await pg.click('label:has(#tgc-arriba-sin)');
  prueba('sin camiseta: se esconde su color', await pg.evaluate(() => document.getElementById('tgc-op-arribaColor').hidden));
  await pg.click('label:has(#tgc-calzado-descalzo)');
  prueba('descalzo: se esconde el color del calzado', await pg.evaluate(() => document.getElementById('tgc-op-calzadoColor').hidden));
  const antes = await pg.evaluate(() => JSON.stringify(TG_CUERPO.estado().aspecto));
  await pg.click('#tgc-azar');
  const r7b = await pg.evaluate(() => TG_CUERPO.estado().aspecto);
  prueba('al azar no toca la prótesis', r7b.protesis === 'pierna_izq');
  prueba('al azar cambia algo', JSON.stringify(r7b) !== antes);
  // con la prótesis, la pantorrilla izquierda no tiene zona
  await pg.click('#tgc-modo-m'); await pg.waitForTimeout(100);
  prueba('prótesis: sin zona de pantorrilla en ese lado', await pg.evaluate(() => {
    // la mitad de las de frente (con el personaje de 35 músculos, 4 de las 8: tibial, peroneos, gemelo y sóleo)
    const n = document.querySelectorAll('#tgc-cara .tgf-z[data-g="pantorrilla"]').length;
    const todas = (TG_FIGURA.svg({ vista: 'frente', modo: 'musculos', aspecto: Object.assign({}, TG_CUERPO.estado().aspecto, { protesis: 'no' }), id: 'q' }).match(/data-g="pantorrilla"/g) || []).length;
    return n > 0 && n * 2 === todas;
  }));
  // (6-11-2026) la cabeza del maniquí es la del aspecto elegido: la misma que da el dibujo con «cara», en la
  // vista grande (de frente) y en la pequeña de «Girar» (de espaldas, sin brillo)
  prueba('músculos: la cabeza del maniquí, con el aspecto elegido, en la vista grande y en la pequeña', await pg.evaluate(() => {
    const a = TG_CUERPO.estado().aspecto, t = document.createElement('span'), t2 = document.createElement('span');
    t.innerHTML = TG_FIGURA.svg({ vista: 'frente', modo: 'musculos', cara: true, aspecto: a, id: 'tgc-figura' });
    t2.innerHTML = TG_FIGURA.svg({ vista: 'espalda', modo: 'musculos', cara: true, aspecto: a, id: 'tgc-otra', brillo: false });
    const mia = document.querySelector('#tgc-cara .tgf-cabeza'), suya = t.querySelector('.tgf-cabeza'), mini = document.querySelector('#tgc-girar-mini .tgf-cabeza'), suya2 = t2.querySelector('.tgf-cabeza');
    return !!mia && !!suya && mia.outerHTML === suya.outerHTML && !!mini && !!suya2 && mini.outerHTML === suya2.outerHTML &&
      document.querySelector('#tgc-figura-pielc stop[offset="0.55"]').getAttribute('stop-color') === TG_FIGURA.PIEL[a.piel];
  }));

  // 7b. (6-11-2026) el pelo largo cae sobre la espalda alta al 30 %: no se queda con el toque, que llega
  //     al músculo de debajo y abre la hoja de su grupo. Con un toque de verdad, en su punto de la pantalla,
  //     con el dibujo de espaldas («Girar»)
  await pg.evaluate(() => { const e = JSON.parse(localStorage.getItem('tenerife.cuerpo')); e.aspecto = Object.assign(TG_FIGURA.normaliza(null), { pelo: 'largo' }); localStorage.setItem('tenerife.cuerpo', JSON.stringify(e)); TG_CUERPO.abrir(); });
  await pg.waitForTimeout(200);
  await pg.click('#tgc-girar'); await pg.waitForTimeout(400);
  const r7c = await pg.evaluate(() => {
    const cab = document.querySelector('#tgc-cara svg.tgf-espalda .tgf-cabeza');
    if (!cab) return null;
    const c = cab.getBoundingClientRect();
    for (const z of document.querySelectorAll('#tgc-cara .tgf-z')) {
      const r = z.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
      if (x > c.left && x < c.right && y > c.top && y < c.bottom && document.elementFromPoint(x, y) === z) return { x, y, g: z.dataset.g };
    }
    return null;
  });
  prueba('pelo largo: debajo del pelo hay músculo, y es él quien recibe el toque', !!r7c, JSON.stringify(r7c));
  if (r7c) {
    await pg.mouse.click(r7c.x, r7c.y); await pg.waitForTimeout(300);
    prueba('pelo largo: tocar ahí abre la hoja de ese grupo', await pg.evaluate(g => !document.getElementById('tgc-hoja').hidden && document.getElementById('tgc-hoja-tit').textContent === tx('cuerpoG_' + g) &&
      document.querySelectorAll('#tgc-cara .tgf-marca').length > 0, r7c.g), r7c.g);
    await pg.keyboard.press('Escape'); await pg.waitForTimeout(150);
  }
  await pg.click('#tgc-girar'); await pg.waitForTimeout(400);

  // 8. lo guardado, aunque venga roto, no rompe la pantalla
  await pg.evaluate(() => {
    localStorage.setItem('tenerife.cuerpo', JSON.stringify({ v: 1, aspecto: { pelo: '<img>', piel: 99, fig: 'z', comp: '2' },
      series: [{ d: '2026-13-45', g: 'pecho', n: 3 }, { d: '2026-10-20', g: 'cuello', n: 3 }, { d: '2026-10-20', g: 'pecho', n: 300 }, { d: '2026-10-20', g: 'pecho', n: 2.5 }, null, 'x',
               { d: '2026-10-21', g: 'biceps', n: 4, t: 'ayer' }] }));
    TG_CUERPO.abrir();
  });
  await pg.waitForTimeout(100);
  const r8 = await pg.evaluate(() => TG_CUERPO.estado());
  prueba('roto: aspecto de serie', r8.aspecto.pelo === 'corto' && r8.aspecto.piel === 3 && r8.aspecto.fig === 'a' && r8.aspecto.comp === 1, JSON.stringify(r8.aspecto));
  prueba('roto: solo la anotación válida', r8.series.length === 1 && r8.series[0].g === 'biceps' && r8.series[0].t === 0, JSON.stringify(r8.series));
  await pg.evaluate(() => { localStorage.setItem('tenerife.cuerpo', '{no es json'); TG_CUERPO.abrir(); });
  prueba('JSON roto: pantalla vacía y sin errores', await pg.evaluate(() => TG_CUERPO.estado().series.length === 0) && errores.length === 0, errores.join(' | '));

  // 8b. la escena vacía dice qué hacer; con series, no; la entrada (el sol que asoma, las barras que crecen y
  //     la rejilla que aparece) solo al abrir
  await vacio(pg); await pg.waitForTimeout(150);
  const r8b = await pg.evaluate(() => ({ visible: document.getElementById('tgc-pista').getClientRects().length > 0, txt: document.getElementById('tgc-pista-txt').textContent,
    entra: document.getElementById('tgc').classList.contains('tgc-entra'), rayos: [...document.querySelectorAll('#tgc-cielo .tgc-rayo')].every(r => r.getAttribute('opacity') !== '1') }));
  prueba('vacío: la escena invita a tocar el cuerpo, y ningún rayo del sol encendido', r8b.visible && r8b.txt === 'Toque su cuerpo para anotar una serie' && r8b.rayos, JSON.stringify(r8b));
  await ejemplo(pg); await pg.waitForTimeout(150);
  prueba('con series: sin la invitación', await pg.evaluate(() => document.getElementById('tgc-pista').hidden));
  await pg.waitForTimeout(1900);
  prueba('la entrada se quita sola (las barras no vuelven a crecer al anotar)', await pg.evaluate(() => !document.getElementById('tgc').classList.contains('tgc-entra')));

  // 9. borrar todo, con confirmación en la página
  await ejemplo(pg); await pg.waitForTimeout(100);
  await pg.evaluate(() => document.getElementById('tgc-borrar').click());
  prueba('borrar pide confirmación', await pg.evaluate(() => !document.getElementById('tgc-borrar-confirm').hidden));
  await pg.evaluate(() => document.getElementById('tgc-borrar-si').click());
  prueba('borrado: nada guardado', await pg.evaluate(() => localStorage.getItem('tenerife.cuerpo') === null && TG_CUERPO.estado().series.length === 0));

  // 21. (6-11-2026, bloque 2) en un móvil estrecho (359 y 360), uno ancho (430) y una tableta (820): nada
  //     pasa del borde, la escena de 400 a 700 px y a la medida de su caja (el cielo se vuelve a dibujar),
  //     el personaje dentro, y la rejilla a tres columnas (a dos por debajo de 360)
  for (const [W, H] of [[359, 740], [360, 780], [430, 932], [820, 1180]]) {
    await pg.setViewportSize({ width: W, height: H }); await pg.waitForTimeout(500);
    const r21 = await pg.evaluate(() => { const p = document.getElementById('cuerpo-panel'), e = document.getElementById('tgc-escena').getBoundingClientRect(), f = document.getElementById('tgc-fig').getBoundingClientRect();
      const tops = [...document.querySelectorAll('#tgc-lista .tgc-fila')].map(b => Math.round(b.getBoundingClientRect().top)), cols = tops.filter(t => t === tops[0]).length, c = document.querySelector('#tgc-cielo svg');
      return { ancho: p.scrollWidth <= p.clientWidth, escena: e.height >= 400 && e.height <= 700 && e.width <= innerWidth, figura: f.top >= e.top && f.bottom <= e.bottom + 1 && f.left >= e.left && f.right <= e.right, cols,
        cielo: !!c && c.getAttribute('width') === String(Math.round(document.getElementById('tgc-cielo').clientWidth)), modos: Math.round(document.getElementById('tgc-modos').getBoundingClientRect().bottom) === innerHeight }; });
    prueba(W + ' × ' + H + ': sin desborde, la escena a su medida con el personaje dentro, la barra de modos abajo, y la rejilla a ' + (W < 360 ? 'dos' : 'tres') + ' columnas', r21.ancho && r21.escena && r21.figura && r21.cols === (W < 360 ? 2 : 3) && r21.cielo && r21.modos, JSON.stringify(r21));
  }
  await pg.setViewportSize({ width: 390, height: 844 }); await pg.waitForTimeout(400);

  // 10. (6-11-2026, bloque 2) encima del perfil: Escape, la flecha y «atrás» cierran «Su cuerpo», y el
  //     perfil se queda abierto en su pestaña Cuerpo, sin nada inerte; «Abrir» lo vuelve a poner, una sola vez
  await pg.evaluate(() => { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); });
  await pg.keyboard.press('Escape'); await pg.waitForTimeout(250);
  const r10a = await pg.evaluate(() => ({ cerrado: !TG_CUERPO.abierto() && document.getElementById('cuerpo-panel').hidden, perfil: !document.getElementById('perfil-panel').hidden && !document.getElementById('perfil-panel').inert,
    pestana: TG_PERFIL.estado().pestana, estado: JSON.stringify(history.state), foco: document.activeElement && document.activeElement.id }));
  prueba('Escape, sin hoja abierta, cierra «Su cuerpo»; el perfil, abierto en Cuerpo y sin nada inerte, con el foco en «Abrir»', r10a.cerrado && r10a.perfil && r10a.pestana === 'cuerpo' && r10a.estado === '{"tgPerfil":1}' && r10a.foco === 'tgp-cuerpo-abrir', JSON.stringify(r10a));
  await suCuerpo(pg);
  await pg.click('#tgc-back'); await pg.waitForTimeout(250);
  prueba('la flecha de vuelta también', await pg.evaluate(() => !TG_CUERPO.abierto() && !document.getElementById('perfil-panel').hidden && !document.getElementById('perfil-panel').inert));
  await suCuerpo(pg);
  await pg.goBack(); await pg.waitForTimeout(250);
  prueba('y «atrás»: cierra «Su cuerpo», no el perfil', await pg.evaluate(() => !TG_CUERPO.abierto() && !document.getElementById('perfil-panel').hidden && JSON.stringify(history.state) === '{"tgPerfil":1}'));
  await pg.goBack(); await pg.waitForTimeout(250);
  prueba('otro «atrás» cierra el perfil, sin salir de la app', await pg.evaluate(() => document.getElementById('perfil-panel').hidden && typeof abrirPerfil === 'function') && pg.url().endsWith('/index.html'), pg.url());
  await pg.evaluate(() => abrirPerfil()); await pg.waitForTimeout(300);
  await pg.evaluate(() => TG_PERFIL.pestana('viaje')); await pg.waitForTimeout(150);
  await pg.evaluate(() => TG_PERFIL.pestana('cuerpo')); await pg.waitForTimeout(250);
  await suCuerpo(pg);
  prueba('de vuelta, por la tarjeta: una sola pantalla, encima, con su entrada en el historial', await pg.evaluate(() => document.querySelectorAll('#cuerpo-panel').length === 1 && TG_CUERPO.abierto() && document.getElementById('perfil-panel').inert && JSON.stringify(history.state) === '{"tgPerfil":1,"tgCuerpo":1}'));

  // 10e. (6-11-2026, bloque 2) el tema: Día por defecto; el botón pasa a Noche, se recuerda en este dispositivo
  //      (tenerife.cuerpo.tema, aparte de lo anotado), sigue al cerrar y abrir, y «Borrar los datos» no lo toca
  const temaDe = () => pg.evaluate(() => { const p = document.getElementById('cuerpo-panel'), b = document.getElementById('tgc-tema'), c = document.querySelector('#tgc-cielo svg');
    return { tema: p.getAttribute('data-tema'), api: TG_CUERPO.tema(), guardado: localStorage.getItem('tenerife.cuerpo.tema'), aria: b.getAttribute('aria-label'), pulsado: b.getAttribute('aria-pressed'),
      esquema: getComputedStyle(p).colorScheme, fondo: getComputedStyle(p).backgroundColor, cielo: c && c.style.getPropertyValue('--e-c1'),
      luna: getComputedStyle(b.querySelector('.tgc-ico-luna')).display, sol: getComputedStyle(b.querySelector('.tgc-ico-sol')).display }; });
  const t1 = await temaDe();
  prueba('tema Día: fondo claro, el botón ofrece la Noche (con la luna) y nada guardado', t1.tema === 'dia' && t1.api === 'dia' && t1.guardado === null && t1.aria === 'Cambiar al tema Noche' && t1.pulsado === 'false' && t1.esquema === 'light' && t1.fondo === 'rgb(238, 243, 248)' && t1.luna !== 'none' && t1.sol === 'none', JSON.stringify(t1));
  await pg.click('#tgc-tema'); await pg.waitForTimeout(1500);
  const t2 = await temaDe();
  prueba('un toque: tema Noche, guardado en este dispositivo, fondo oscuro, el cielo con otros colores, y el botón ofrece el Día (con el sol)', t2.tema === 'noche' && t2.api === 'noche' && t2.guardado === 'noche' && t2.aria === 'Cambiar al tema Día' && t2.pulsado === 'true' && t2.esquema === 'dark' && t2.fondo === 'rgb(15, 17, 23)' && !!t2.cielo && t2.cielo !== t1.cielo && t2.sol !== 'none' && t2.luna === 'none', JSON.stringify(t2));
  await pg.keyboard.press('Escape'); await pg.waitForTimeout(250); await suCuerpo(pg);
  prueba('al cerrar y abrir, sigue en Noche', (await temaDe()).tema === 'noche');
  await pg.evaluate(() => document.getElementById('tgc-borrar').click()); await pg.evaluate(() => document.getElementById('tgc-borrar-si').click()); await pg.waitForTimeout(150);
  prueba('«Borrar los datos de «Su cuerpo»» borra lo anotado y no toca el tema', (await temaDe()).guardado === 'noche' && await pg.evaluate(() => localStorage.getItem('tenerife.cuerpo') === null));
  await pg.click('#tgc-tema'); await pg.waitForTimeout(300);
  prueba('y de vuelta al Día, guardado', (await temaDe()).guardado === 'dia' && (await temaDe()).tema === 'dia');

  // 10f. (6-11-2026, bloque 2) «Las cifras»: desde el botón de la cabecera, desde el enlace de «Sus últimos 7
  //      días» y desde la referencia de la hoja de un grupo (que se cierra y le deja su entrada del
  //      historial); Escape, «atrás» y su «cerrar» la cierran y dejan la pantalla
  await ejemplo(pg); await pg.waitForTimeout(150);
  await pg.click('#tgc-cifras-btn'); await pg.waitForTimeout(300);
  const f1 = await pg.evaluate(() => ({ hoja: !document.getElementById('tgc-hoja').hidden, pag: !document.getElementById('tgc-pag-cifras').hidden && document.getElementById('tgc-pag-grupo').hidden, foco: document.activeElement && document.activeElement.id,
    etiqueta: document.getElementById('tgc-hoja').getAttribute('aria-labelledby'), tit: document.getElementById('tgc-cifras-tit').textContent, reco: document.getElementById('tgc-cifras-reco').textContent === document.getElementById('tgc-reco').textContent,
    ref: !document.getElementById('tgc-cifras-ref').hidden && /ACSM/.test(document.getElementById('tgc-cifras-ref').textContent), fuentes: /^Fuentes: OMS/.test(document.getElementById('tgc-fuentes').textContent),
    estado: JSON.stringify(history.state), aria: document.getElementById('tgc-cifras-btn').getAttribute('aria-label'), inerte: document.getElementById('tgc').inert && document.getElementById('tgc-modos').inert }));
  prueba('«Las cifras» desde la cabecera: su página en la hoja, con el foco en el título, la recomendación de su edad, la referencia del ACSM (adultos) y las fuentes; su entrada en el historial; lo de debajo, inerte',
    f1.hoja && f1.pag && f1.foco === 'tgc-cifras-tit' && f1.etiqueta === 'tgc-cifras-tit' && f1.tit === 'De dónde salen las cifras' && f1.reco && f1.ref && f1.fuentes && f1.estado === '{"tgPerfil":1,"tgCuerpo":1,"tgCuerpoHoja":1,"tgCuerpoCifras":1}' && f1.aria === 'De dónde salen las cifras' && f1.inerte, JSON.stringify(f1));
  await pg.keyboard.press('Escape'); await pg.waitForTimeout(250);
  prueba('Escape la cierra, y «Su cuerpo» sigue', await pg.evaluate(() => document.getElementById('tgc-hoja').hidden && TG_CUERPO.abierto() && !document.getElementById('tgc').inert && JSON.stringify(history.state) === '{"tgPerfil":1,"tgCuerpo":1}'));
  await pg.click('#tgc-cifras-link'); await pg.waitForTimeout(300);
  prueba('desde el enlace de «Sus últimos 7 días»', await pg.evaluate(() => !document.getElementById('tgc-pag-cifras').hidden && !document.getElementById('tgc-hoja').hidden && document.getElementById('tgc-cifras-link').textContent === 'Las cifras'));
  await pg.goBack(); await pg.waitForTimeout(300);
  prueba('«atrás» la cierra, y «Su cuerpo» sigue', await pg.evaluate(() => document.getElementById('tgc-hoja').hidden && TG_CUERPO.abierto() && !document.getElementById('perfil-panel').hidden));
  await pg.click('#tgc-lista .tgc-fila[data-g="pecho"]'); await pg.waitForTimeout(300);
  await pg.click('#tgc-h-ref'); await pg.waitForTimeout(400);
  const f2 = await pg.evaluate(() => ({ cifras: !document.getElementById('tgc-pag-cifras').hidden, grupo: document.getElementById('tgc-pag-grupo').hidden, estado: JSON.stringify(history.state), marca: document.querySelectorAll('#tgc-cara .tgf-marca').length, ref: document.getElementById('tgc-h-ref').textContent }));
  prueba('desde la referencia de la hoja de un grupo («' + f2.ref + '»): la hoja del grupo se cierra y «Las cifras» hereda su entrada del historial', f2.cifras && f2.grupo && f2.estado === '{"tgPerfil":1,"tgCuerpo":1,"tgCuerpoHoja":1,"tgCuerpoCifras":1}' && f2.marca === 0 && f2.ref === 'Referencia: 10 series (ACSM)', JSON.stringify(f2));
  await pg.click('#tgc-cifras-cerrar'); await pg.waitForTimeout(250);
  prueba('su «cerrar» la cierra, y el historial queda en la pantalla', await pg.evaluate(() => document.getElementById('tgc-hoja').hidden && TG_CUERPO.abierto() && JSON.stringify(history.state) === '{"tgPerfil":1,"tgCuerpo":1}'));

  // 10b. (la app) si el módulo no llega, la tarjeta queda sin el personaje y sin aviso, y es «Abrir» quien
  //      lo dice; con red otra vez, «Abrir» pone la pantalla y la tarjeta dibuja el personaje
  {
    const c2 = await contexto(b), p2 = await c2.newPage(), e2 = []; vigilar(p2, e2);
    await p2.route('**/modulos/cuerpo.js', r => r.abort());
    await abrirApp(p2); await abrirPerfilCuerpo(p2); await p2.waitForTimeout(800);
    const r10b = await p2.evaluate(() => ({ tarjeta: document.getElementById('tgp-cuerpo').getClientRects().length > 0, mini: !!document.querySelector('#tgp-cuerpo-mini svg'), aviso: !document.getElementById('tgp-cuerpo-error').hidden,
      cuerpo: !!window.TG_CUERPO, perfil: !document.getElementById('perfil-panel').hidden }));
    prueba('sin el módulo: la tarjeta, sin el personaje y sin aviso; el perfil sigue abierto', r10b.tarjeta && !r10b.mini && !r10b.aviso && !r10b.cuerpo && r10b.perfil, JSON.stringify(r10b));
    await p2.click('#tgp-cuerpo-abrir'); await p2.waitForTimeout(800);
    const r10c = await p2.evaluate(() => ({ aviso: !document.getElementById('tgp-cuerpo-error').hidden, txt: document.getElementById('tgp-cuerpo-error').textContent, cuerpo: !!window.TG_CUERPO }));
    prueba('…y «Abrir» lo dice', r10c.aviso && /conexión/.test(r10c.txt) && !r10c.cuerpo, JSON.stringify(r10c));
    await p2.unroute('**/modulos/cuerpo.js');
    await p2.click('#tgp-cuerpo-abrir');
    await p2.waitForFunction(() => window.TG_CUERPO && TG_CUERPO.abierto(), null, { timeout: 15000 }).catch(() => {});
    await p2.waitForTimeout(300);
    prueba('…y con red otra vez, su «Abrir» pone la pantalla encima, el aviso se va y la tarjeta dibuja el personaje', await p2.evaluate(() => !!window.TG_CUERPO && TG_CUERPO.abierto() && document.getElementById('cuerpo-panel').parentNode === document.body &&
      document.getElementById('tgp-cuerpo-error').hidden && !!document.querySelector('#tgp-cuerpo-mini svg')));
    prueba('…sin errores de página', e2.filter(x => !/cuerpo\.js/.test(x)).length === 0, e2.join(' | '));
    await c2.close();
  }

  // 10c. (la app) con versiones mezcladas, guardadas sin conexión: un perfil de antes del 6 de noviembre
  //      (con sitio para «Su cuerpo» dentro de la pestaña) y el módulo de hoy (sin incrustar) ya lo
  //      contemplaba el propio perfil de entonces: dejaba la tarjeta y su «Abrir» llamaba a abrir(), que es
  //      lo que hace el módulo de hoy. Y el perfil de hoy con un módulo de antes (con incrustar y sin mini)
  //      pide abrir(), que entonces abría encima. Nada que probar aquí: abrirCuerpo() con un modo, abajo (18)

  // 10d. (la app) «Su cuerpo» cargado antes que el perfil: su Escape se engancha primero en window.
  //      Con una hoja abierta, el Escape cierra solo la hoja (no lo oye nadie más: el del perfil ya
  //      no vería la hoja y cerraría también el perfil)
  {
    const c8 = await contexto(b), p8 = await c8.newPage(), e8 = []; vigilar(p8, e8);
    await abrirApp(p8);
    await p8.evaluate(() => window.TG_CUERPO_CARGAR());
    const antes = await p8.evaluate(() => !!window.TG_CUERPO && !window.TG_PERFIL);
    await abrirPerfilCuerpo(p8); await suCuerpo(p8);
    await p8.click('#tgc-lista .tgc-fila[data-g="pecho"]'); await p8.waitForTimeout(300);
    const v4 = await p8.evaluate(() => !document.getElementById('tgc-hoja').hidden);
    await p8.keyboard.press('Escape'); await p8.waitForTimeout(250);
    const v5 = await p8.evaluate(() => ({ hoja: document.getElementById('tgc-hoja').hidden, cuerpo: TG_CUERPO.abierto(), perfil: !document.getElementById('perfil-panel').hidden,
      tgc: document.getElementById('tgc').inert === false }));
    prueba('«Su cuerpo» cargado antes que el perfil: Escape con una hoja abierta cierra solo la hoja, y «Su cuerpo» y el perfil siguen abiertos', antes && v4 && v5.hoja && v5.cuerpo && v5.perfil && v5.tgc,
      JSON.stringify({ antes, v4, v5 }));
    prueba('…sin errores de página', e8.length === 0, e8.join(' | '));
    await c8.close();
  }

  // 12. los ejercicios: lista del grupo, filtros, ficha, anotar desde la ficha, atrás por niveles
  await abrirApp(pg); await abrirPerfilCuerpo(pg); await suCuerpo(pg);
  await ejemplo(pg); await pg.waitForTimeout(150);
  const datos = await pg.evaluate(async () => { const r = await fetch('datos/cuerpo/ejercicios.json'); return r.json(); });
  const datosEs = await pg.evaluate(async () => { const r = await fetch('datos/cuerpo/ejercicios-es.json'); return r.json(); });
  const grupoEj = datos.ejercicios[0].g[0];
  await pg.click('.tgc-fila[data-g="' + grupoEj + '"]');
  await pg.waitForSelector('.tgc-ej-fila', { timeout: 5000 });
  const delGrupo = datos.ejercicios.filter(x => x.g.includes(grupoEj));
  const r12 = await pg.evaluate(() => ({ filas: document.querySelectorAll('.tgc-ej-fila').length, estado: document.getElementById('tgc-ej-estado').textContent }));
  prueba('ejercicios: la lista del grupo entera', r12.filas === delGrupo.length, r12.filas + ' de ' + delGrupo.length);
  prueba('ejercicios: el recuento en el estado', r12.estado.indexOf(String(delGrupo.length)) >= 0, r12.estado);
  for (const ent of ['gimnasio', 'fuera', 'calistenia']) {
    await pg.click('#tgc-ej-ent [data-v="' + ent + '"]');
    const ids = await pg.evaluate(() => [...document.querySelectorAll('.tgc-ej-fila')].map(b => b.dataset.id));
    const esperados = delGrupo.filter(x => x.e.includes(ent)).map(x => x.id);
    prueba('filtro ' + ent, JSON.stringify(ids) === JSON.stringify(esperados), ids.length + ' frente a ' + esperados.length);
  }
  await pg.click('#tgc-ej-ent [data-v="todos"]');
  await pg.click('#tgc-ej-niv [data-v="1"]');
  const n1 = await pg.evaluate(() => [...document.querySelectorAll('.tgc-ej-fila')].map(b => b.dataset.id));
  prueba('filtro nivel 1', JSON.stringify(n1) === JSON.stringify(delGrupo.filter(x => x.n === 1).map(x => x.id)));
  await pg.click('#tgc-ej-niv [data-v="0"]');
  const ej = delGrupo[delGrupo.length - 1];
  await pg.click('.tgc-ej-fila[data-id="' + ej.id + '"]'); await pg.waitForTimeout(200);
  const r12b = await pg.evaluate(() => ({ visible: !document.getElementById('tgc-pag-ej').hidden && document.getElementById('tgc-pag-grupo').hidden,
    nombre: document.getElementById('tgc-ej-nom').textContent, pasos: document.querySelectorAll('#tgc-ej-pasos li').length,
    foco: document.activeElement && document.activeElement.id, etiqueta: document.getElementById('tgc-hoja').getAttribute('aria-labelledby'),
    enlaces: [...document.querySelectorAll('#tgc-ej-fuentes a')].map(a => [a.href, a.target, a.rel]),
    zonasPrim: document.querySelectorAll('#tgc-ej-figuras .tgf-z').length, cabezas: document.querySelectorAll('#tgc-ej-figuras .tgf-cabeza').length }));
  prueba('ficha: se abre', r12b.visible && r12b.foco === 'tgc-ej-nom' && r12b.etiqueta === 'tgc-ej-nom');
  prueba('ficha: nombre y pasos de los datos', r12b.nombre === datosEs[ej.id][0] && r12b.pasos === datosEs[ej.id][1].length, r12b.nombre);
  prueba('ficha: fuentes enlazadas, en otra pestaña y sin opener', r12b.enlaces.length === ej.f.length && r12b.enlaces.every(e => /^https:\/\//.test(e[0]) && e[1] === '_blank' && /noopener/.test(e[2])));
  prueba('ficha: el maniquí de frente y de espaldas, sin cabeza de persona', r12b.zonasPrim > 40 && r12b.cabezas === 0, r12b.zonasPrim + '/' + r12b.cabezas);
  const antes12 = await pg.evaluate(() => TG_CUERPO.estado().series.length);
  await pg.click('#tgc-ej-mas'); await pg.click('#tgc-ej-guardar'); await pg.waitForTimeout(150);
  const r12c = await pg.evaluate(() => TG_CUERPO.estado().series.slice(-3));
  const nuevas = r12c.slice(-ej.g.length);
  prueba('anotar desde la ficha: una por grupo principal, con el ejercicio', nuevas.length === ej.g.length && nuevas.every((x, k) => x.e === ej.id && x.g === ej.g[k] && x.n === 4),
    JSON.stringify(nuevas));
  prueba('anotar desde la ficha: guardado', await pg.evaluate(() => JSON.parse(localStorage.getItem('tenerife.cuerpo')).series.length) === antes12 + ej.g.length);
  await pg.keyboard.press('Escape'); await pg.waitForTimeout(150);
  prueba('Escape en la ficha vuelve al grupo', await pg.evaluate(() => !document.getElementById('tgc-hoja').hidden && !document.getElementById('tgc-pag-grupo').hidden && document.getElementById('tgc-pag-ej').hidden));
  prueba('el historial del grupo nombra el ejercicio', await pg.evaluate(n => [...document.querySelectorAll('.tgc-hist-ej')].some(e => e.textContent === n), datosEs[ej.id][0]));
  prueba('el foco vuelve a la fila del ejercicio', await pg.evaluate(id => document.activeElement && document.activeElement.dataset && document.activeElement.dataset.id === id, ej.id));
  // «atrás» por niveles: ficha → grupo → «Su cuerpo», en el perfil
  await pg.click('.tgc-ej-fila[data-id="' + ej.id + '"]'); await pg.waitForTimeout(150);
  await pg.goBack(); await pg.waitForTimeout(200);
  prueba('«atrás» desde la ficha: el grupo', await pg.evaluate(() => !document.getElementById('tgc-hoja').hidden && document.getElementById('tgc-pag-ej').hidden));
  await pg.goBack(); await pg.waitForTimeout(200);
  prueba('«atrás» desde el grupo: «Su cuerpo», con el perfil abierto', await pg.evaluate(() => document.getElementById('tgc-hoja').hidden && TG_CUERPO.abierto() && !document.getElementById('perfil-panel').hidden));
  // cerrar con la ficha abierta quita las dos entradas del historial de una vez
  const h1 = await pg.evaluate(() => history.length);
  await pg.click('.tgc-fila[data-g="' + grupoEj + '"]'); await pg.waitForSelector('.tgc-ej-fila');
  await pg.click('.tgc-ej-fila[data-id="' + ej.id + '"]'); await pg.waitForTimeout(150);
  await pg.click('#tgc-ej-cerrar'); await pg.waitForTimeout(250);
  prueba('cerrar desde la ficha: la hoja cerrada y «Su cuerpo» en su sitio', await pg.evaluate(() => document.getElementById('tgc-hoja').hidden && TG_CUERPO.abierto() && !document.getElementById('perfil-panel').hidden));
  await pg.click('.tgc-fila[data-g="' + grupoEj + '"]'); await pg.waitForTimeout(150);
  await pg.goBack(); await pg.waitForTimeout(200);
  prueba('…y el historial sigue bien («atrás» cierra la hoja, no el perfil)', await pg.evaluate(() => document.getElementById('tgc-hoja').hidden && TG_CUERPO.abierto() && !document.getElementById('perfil-panel').hidden));
  // un «atrás» de varios pasos de golpe (en el navegador, manteniéndolo pulsado): desde la ficha,
  // dos pasos cierran la ficha y la hoja; tres, también el perfil, y al volver a abrirlo no queda
  // nada abierto ni inerte
  await pg.click('.tgc-fila[data-g="' + grupoEj + '"]'); await pg.waitForSelector('.tgc-ej-fila');
  await pg.click('.tgc-ej-fila[data-id="' + ej.id + '"]'); await pg.waitForTimeout(150);
  await pg.evaluate(() => history.go(-2)); await pg.waitForTimeout(350);
  prueba('«atrás» de dos pasos desde la ficha: se cierran la ficha y la hoja; «Su cuerpo», abierto y sin nada inerte', await pg.evaluate(() => document.getElementById('tgc-hoja').hidden &&
    TG_CUERPO.abierto() && !document.getElementById('tgc').inert && JSON.stringify(history.state) === '{"tgPerfil":1,"tgCuerpo":1}'));
  await pg.click('.tgc-fila[data-g="' + grupoEj + '"]'); await pg.waitForSelector('.tgc-ej-fila');
  await pg.click('.tgc-ej-fila[data-id="' + ej.id + '"]'); await pg.waitForTimeout(150);
  await pg.evaluate(() => history.go(-3)); await pg.waitForTimeout(350);
  const r12m = await pg.evaluate(() => ({ cuerpo: TG_CUERPO.abierto(), perfil: !document.getElementById('perfil-panel').hidden && !document.getElementById('perfil-panel').inert, hoja: document.getElementById('tgc-hoja').hidden }));
  await suCuerpo(pg);
  const r12n = await pg.evaluate(() => ({ hoja: document.getElementById('tgc-hoja').hidden, inertes: document.getElementById('tgc').inert || document.getElementById('tgc-modos').inert,
    desplaza: getComputedStyle(document.getElementById('cuerpo-panel')).overflowY }));
  prueba('«atrás» de tres pasos desde la ficha: también «Su cuerpo», y el perfil queda abierto y libre; al volver a abrirla, sin hoja, sin nada inerte y se desplaza', !r12m.cuerpo && r12m.perfil && r12m.hoja && r12n.hoja &&
    !r12n.inertes && r12n.desplaza === 'auto', JSON.stringify([r12m, r12n]));
  // los datos reales: cada grupo abre su lista entera
  const porGrupo = {};
  datos.ejercicios.forEach(x => x.g.forEach(g => { porGrupo[g] = (porGrupo[g] || 0) + 1; }));
  const cuentas = {};
  for (const g of Object.keys(porGrupo)) {
    await pg.click('.tgc-fila[data-g="' + g + '"]'); await pg.waitForSelector('.tgc-ej-fila');
    cuentas[g] = await pg.evaluate(() => document.querySelectorAll('.tgc-ej-fila').length);
    await pg.keyboard.press('Escape'); await pg.waitForTimeout(80);
  }
  prueba('los 12 grupos con su lista entera', Object.keys(porGrupo).length === 12 && Object.keys(porGrupo).every(g => cuentas[g] === porGrupo[g]), JSON.stringify(cuentas));
  prueba('datos: cada ficha con nombre y de 2 a 4 pasos en castellano', datos.ejercicios.every(x => datosEs[x.id] && datosEs[x.id][0].trim() && datosEs[x.id][1].length >= 2 && datosEs[x.id][1].length <= 4));
  prueba('datos: todas las fuentes en https', datos.ejercicios.every(x => x.f.length && x.f.every(q => /^https:\/\//.test(q[1]) && q[0].trim())));
  // buscar en la lista del grupo: sin tildes, por palabras, y se vacía al abrir otro grupo
  await pg.click('.tgc-fila[data-g="gluteos"]'); await pg.waitForSelector('.tgc-ej-fila');
  await pg.fill('#tgc-ej-buscar', 'SENTADILLA bulgara');
  const rbus = await pg.evaluate(() => ({ ids: [...document.querySelectorAll('.tgc-ej-fila')].map(b => b.dataset.id), estado: document.getElementById('tgc-ej-estado').textContent,
    ph: document.getElementById('tgc-ej-buscar').getAttribute('placeholder'), aria: document.getElementById('tgc-ej-buscar').getAttribute('aria-label') }));
  const esperadosBus = datos.ejercicios.filter(x => x.g.includes('gluteos') && /sentadilla búlgara/i.test(datosEs[x.id][0])).map(x => x.id);
  prueba('buscar: sin tildes y por palabras', esperadosBus.length >= 3 && JSON.stringify(rbus.ids) === JSON.stringify(esperadosBus), rbus.ids.join(','));
  prueba('buscar: el recuento sigue a la búsqueda', rbus.estado.indexOf(String(esperadosBus.length)) >= 0, rbus.estado);
  prueba('buscar: placeholder y nombre accesible', !!rbus.ph && !!rbus.aria, rbus.ph + ' / ' + rbus.aria);
  await pg.fill('#tgc-ej-buscar', 'zzzz');
  prueba('buscar: sin resultados lo dice', await pg.evaluate(() => document.querySelectorAll('.tgc-ej-fila').length === 0 && document.getElementById('tgc-ej-estado').textContent.length > 5));
  await pg.keyboard.press('Escape'); await pg.waitForTimeout(80);
  await pg.click('.tgc-fila[data-g="pecho"]'); await pg.waitForSelector('.tgc-ej-fila');
  prueba('buscar: se vacía al abrir otro grupo', await pg.evaluate(() => document.getElementById('tgc-ej-buscar').value === '' && document.querySelectorAll('.tgc-ej-fila').length > 40));
  await pg.keyboard.press('Escape'); await pg.waitForTimeout(80);

  // una variante: el enlace a su ejercicio base lleva a él, y la base lista la variante
  const vari = datos.ejercicios.find(x => x.v && x.g[0] === datos.ejercicios.find(y => y.id === x.v).g[0]);
  await pg.click('.tgc-fila[data-g="' + vari.g[0] + '"]'); await pg.waitForSelector('.tgc-ej-fila');
  await pg.click('.tgc-ej-fila[data-id="' + vari.id + '"]'); await pg.waitForTimeout(150);
  const rv = await pg.evaluate(() => ({ base: !document.getElementById('tgc-ej-variante').hidden && document.getElementById('tgc-ej-variante').dataset.id,
    nota: document.getElementById('tgc-ej-nota').textContent }));
  prueba('ficha: enlace a su ejercicio base', rv.base === vari.v, String(rv.base));
  prueba('ficha: la nota sobre los pasos y el nivel', /orientativo/.test(rv.nota), rv.nota);
  await pg.click('#tgc-ej-variante'); await pg.waitForTimeout(150);
  const rb = await pg.evaluate(() => ({ nom: document.getElementById('tgc-ej-nom').textContent, vars: [...document.querySelectorAll('#tgc-ej-variantes button')].map(b => b.dataset.id) }));
  prueba('…y la base lista la variante', rb.nom === datosEs[vari.v][0] && rb.vars.includes(vari.id), rb.nom);
  await pg.click('#tgc-ej-cerrar'); await pg.waitForTimeout(200);
  // el ejemplo nombra el ejercicio en el historial del pecho
  await ejemplo(pg); await pg.waitForTimeout(150);
  await pg.click('.tgc-fila[data-g="pecho"]'); await pg.waitForSelector('.tgc-ej-fila');
  prueba('el ejemplo: el historial del pecho nombra el press de banca', await pg.evaluate(n => [...document.querySelectorAll('.tgc-hist-ej')].some(e => e.textContent === n), datosEs['press-banca-barra'][0]));
  await pg.keyboard.press('Escape'); await pg.waitForTimeout(80);

  // otro idioma: lo que no esté traducido sale en castellano, nunca vacío
  await idioma(pg, 'pl'); await pg.waitForTimeout(100);
  await pg.click('.tgc-fila[data-g="' + grupoEj + '"]'); await pg.waitForSelector('.tgc-ej-fila');
  prueba('otro idioma: ningún nombre de ejercicio vacío', await pg.evaluate(() => [...document.querySelectorAll('.tgc-ej-nombre')].every(e => e.textContent.trim().length > 1)));
  await pg.keyboard.press('Escape'); await pg.waitForTimeout(60);
  // cada idioma enseña los nombres de su propio fichero: la biblioteca está traducida entera
  for (const l of ['en', 'fr', 'de', 'it', 'nl', 'zh', 'zht', 'bg', 'pl']) {
    const dl = await pg.evaluate(async (l) => { const r = await fetch('datos/cuerpo/ejercicios-' + l + '.json'); return r.json(); }, l);
    await idioma(pg, l); await pg.waitForTimeout(60);
    await pg.click('.tgc-fila[data-g="' + grupoEj + '"]'); await pg.waitForSelector('.tgc-ej-fila');
    await pg.waitForFunction((n) => [...document.querySelectorAll('.tgc-ej-nombre')].some(e => e.textContent === n), dl[delGrupo[0].id][0], { timeout: 5000 }).catch(() => {});
    const rl = await pg.evaluate((args) => {
      const [ids, dl] = args, filas = [...document.querySelectorAll('.tgc-ej-fila')];
      return { n: filas.length, bien: filas.every(b => b.querySelector('.tgc-ej-nombre').textContent === dl[b.dataset.id][0]) };
    }, [delGrupo.map(x => x.id), dl]);
    prueba('idioma ' + l + ': todos los nombres de su fichero', rl.n === delGrupo.length && rl.bien && Object.keys(dl).length === datos.ejercicios.length, rl.n + ' filas');
    await pg.keyboard.press('Escape'); await pg.waitForTimeout(60);
  }
  await idioma(pg, 'es');
  // lo guardado: un ejercicio con id raro se quita, la anotación se queda
  await pg.evaluate(() => { localStorage.setItem('tenerife.cuerpo', JSON.stringify({ v: 1, series: [{ d: '2026-10-20', g: 'pecho', n: 3, e: '<b>x</b>' }, { d: '2026-10-21', g: 'pecho', n: 2, e: 'press-banca' }] })); TG_CUERPO.abrir(); });
  const r12d = await pg.evaluate(() => TG_CUERPO.estado().series);
  prueba('id de ejercicio raro: fuera; la anotación se queda', r12d.length === 2 && !('e' in r12d[0]) && r12d[1].e === 'press-banca', JSON.stringify(r12d));

  // 11. contraste de los niveles con «sin trabajar» (WCAG 1.4.11: 3:1)
  const r11 = await pg.evaluate(() => { const n = TG_FIGURA.MUSC.nivel, L = TG_FIGURA.lum; const c = (a, b) => { const x = L(a), y = L(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }; return [1, 2, 3].map(i => c(n[0], n[i])); });
  prueba('niveles con 3:1 o más frente a sin trabajar', r11.every(x => x >= 3), r11.map(x => x.toFixed(2)).join(', '));

  // 13. (la app) la seguridad: un fichero de ejercicios manipulado, y lo guardado con HTML
  {
    const c3 = await contexto(b), p3 = await c3.newPage(), e3 = []; vigilar(p3, e3);
    const ID = 'press-banca-barra';
    await p3.route('**/datos/cuerpo/ejercicios.json', async r => {
      const res = await r.fetch(), d = JSON.parse(await res.text()), x = d.ejercicios.find(e => e.id === ID);
      x.f = [['malo', 'javascript:window.__xss=1'], ['inseguro', 'http://ejemplo.invalid/'], x.f[0]];
      await r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(d) });
    });
    await p3.route('**/datos/cuerpo/ejercicios-es.json', async r => {
      const res = await r.fetch(), d = JSON.parse(await res.text());
      d[ID][0] = '<img src=x onerror="window.__xss=2">Press malo';
      d[ID][1][0] = '<b onclick="window.__xss=3">paso</b> con marcas';
      await r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(d) });
    });
    await abrirApp(p3);
    await p3.evaluate(() => localStorage.setItem('tenerife.cuerpo', JSON.stringify({ v: 1, aspecto: { pelo: '<img src=x onerror="window.__xss=4">' },
      series: [{ d: '2026-10-20', g: 'pecho', n: 3, e: '<img src=x onerror="window.__xss=5">' }, { d: '2026-10-21', g: '<svg onload="window.__xss=6">', n: 2 }] })));
    await abrirPerfilCuerpo(p3); await suCuerpo(p3);
    await p3.click('.tgc-fila[data-g="pecho"]'); await p3.waitForSelector('.tgc-ej-fila');
    const fila = await p3.evaluate(id => { const f = document.querySelector('.tgc-ej-fila[data-id="' + id + '"]'); return f ? f.querySelector('.tgc-ej-nombre').textContent : null; }, ID);
    await p3.click('.tgc-ej-fila[data-id="' + ID + '"]'); await p3.waitForTimeout(250);
    const r13 = await p3.evaluate(() => ({
      nom: document.getElementById('tgc-ej-nom').textContent, paso: (document.querySelector('#tgc-ej-pasos li') || {}).textContent,
      enlaces: [...document.querySelectorAll('#tgc-ej-fuentes a')].map(a => a.getAttribute('href')),
      marcas: document.querySelectorAll('#cuerpo-panel img, #cuerpo-panel b[onclick], #cuerpo-panel [onerror], #cuerpo-panel [onload]').length,
      xss: window.__xss, series: TG_CUERPO.estado().series.length }));
    prueba('fichero manipulado: el nombre sale como texto, en la lista y en la ficha', fila === '<img src=x onerror="window.__xss=2">Press malo' && r13.nom === fila, String(fila) + ' / ' + r13.nom);
    prueba('fichero manipulado: el paso sale como texto', r13.paso === '<b onclick="window.__xss=3">paso</b> con marcas', r13.paso);
    prueba('fichero manipulado: de las fuentes, solo la de https (fuera javascript: y http:)', r13.enlaces.length === 1 && /^https:\/\//.test(r13.enlaces[0]), r13.enlaces.join(' '));
    prueba('lo guardado con HTML: fuera el grupo raro, el ejercicio raro y el pelo raro', r13.series === 1, String(r13.series));
    prueba('ni un elemento de los inyectados en la pantalla, y nada se ejecuta', r13.marcas === 0 && r13.xss === undefined, r13.marcas + ' ' + r13.xss);
    prueba('…sin errores de página', e3.length === 0, e3.join(' | '));
    await c3.close();
  }

  // 14. (la app) las fuentes, en cada idioma: las notas en castellano de la entrega, traducidas
  {
    const fs = require('fs'), path = require('path');
    const s = fs.readFileSync(path.join(__dirname, '..', 'modulos', 'cuerpo.js'), 'utf8');
    const a = s.indexOf('var NOTAS_FUENTE = {'), b = s.indexOf('function fuenteTxt', a), c = s.indexOf('\n  }\n', b);
    const UI = {}; { const i = s.indexOf('var CUERPO_UI = {'), j = s.indexOf('\n  };', i);
      for (const l of s.slice(i, j).split('\n')) { const m = l.match(/^\s*"(cuerpo[A-Za-z0-9_]+)": (\{.*\}),?$/); if (m) UI[m[1]] = JSON.parse(m[2]); } }
    const d = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'datos', 'cuerpo', 'ejercicios.json'), 'utf8'));
    const MARCAS = /\b(conjunto|datos|artículo|profesionales|folleto|hoja|pacientes|vídeo|texto|máquina|ejercicios|fuente|comunitaria|barra|mancuernas|bandas?|poleas?|banco|fitball|fondos|biblioteca|salud|extracto|septiembre|universidad|programa|casa|copia|patrocinado|estudio)\b/i;
    /* lo que se queda: el titulo de wger tal como lo trae su conjunto de datos, y cuatro palabras que
       en italiano se escriben igual que en castellano */
    const QUEDA = /wger — Extensión de gluteos en polea/;
    const ITALIANO = new Set(['fitball', 'casa', 'copia', 'biblioteca']);
    const mal14 = [];
    let n14 = 0;
    for (const L of ['en', 'fr', 'de', 'it', 'nl', 'zh', 'zht', 'bg', 'pl']) {
      const tx = k => (UI[k] || {})[L] || '¿' + k + '?';
      const fuenteTxt = a > 0 && c > b ? new Function('tx', s.slice(a, c + 4) + '\nreturn fuenteTxt;')(tx) : (t => t);
      for (const x of d.ejercicios) for (const q of x.f) {
        n14++;
        const r = fuenteTxt(q[0]), m = r.replace(QUEDA, '').match(MARCAS);
        if (/¿cuerpo/.test(r) || (m && !(L === 'it' && ITALIANO.has(m[0].toLowerCase())))) mal14.push(L + ': ' + r);
      }
    }
    prueba('las ' + d.ejercicios.reduce((n, x) => n + x.f.length, 0) + ' fuentes, en los nueve idiomas: ninguna nota en castellano', n14 > 8000 && !mal14.length, mal14.slice(0, 4).join(' | '));
    for (const L of ['en', 'zh', 'pl']) {
      await idioma(pg, L);
      await pg.click('.tgc-fila[data-g="pecho"]'); await pg.waitForSelector('.tgc-ej-fila');
      await pg.click('.tgc-ej-fila[data-id="press-banca-barra"]'); await pg.waitForTimeout(200);
      const f14 = await pg.evaluate(() => [...document.querySelectorAll('#tgc-ej-fuentes a')].map(e => e.textContent));
      const barra = { en: '(barbell)', zh: '(杠铃)', pl: '(sztanga)' }[L];
      prueba(L + ': en la ficha, las fuentes con sus notas en ' + L + ' («' + barra + '», no «(barra)»)', f14.some(t => t.includes(barra)) && !f14.some(t => /\((barra|conjunto de datos)\)/.test(t)), f14.join(' | '));
      await pg.click('#tgc-ej-cerrar'); await pg.waitForTimeout(200);
    }
    await idioma(pg, 'es');
  }

  // 15. (la app) los menores, con el año de nacimiento escrito en el formulario del perfil, el de
  //     verdad (la pestaña Cuerpo, debajo de «Su cuerpo»: se cierra la pantalla, se escribe y se guarda,
  //     y se vuelve a abrir). Sin la referencia del 10 (ni en «Las cifras» ni en la hoja), y con la
  //     recomendación de su edad; con un año de adulto, o sin año, la referencia vuelve
  {
    const c5 = await contexto(b), p5 = await c5.newPage(), e5 = []; vigilar(p5, e5);
    await abrirApp(p5); await abrirPerfilCuerpo(p5); await suCuerpo(p5);
    const anio = await p5.evaluate(() => new Date().getFullYear());
    const conAnio = async (v) => {
      if (await p5.evaluate(() => window.TG_CUERPO && TG_CUERPO.abierto())) { await p5.keyboard.press('Escape'); await p5.waitForTimeout(250); }
      await p5.fill('#tgp-nac', v); await p5.click('#tgp-save'); await p5.waitForTimeout(200);
      const guardado = await p5.evaluate(() => (JSON.parse(localStorage.getItem('tenerife.perfil')) || {}).nacimiento);
      await suCuerpo(p5);
      return Object.assign({ guardado }, await p5.evaluate(() => ({ ref: !document.getElementById('tgc-cifras-ref').hidden, hRef: !document.getElementById('tgc-h-ref').hidden,
        reco: document.getElementById('tgc-reco').textContent, cifras: document.getElementById('tgc-cifras-reco').textContent })));
    };
    const m15 = await conAnio(String(anio - 15));
    prueba('perfil con 15 años: sin la referencia del 10, y la recomendación de 5 a 17 años (en la pantalla y en «Las cifras»)', m15.guardado === anio - 15 && !m15.ref && !m15.hRef && /^La OMS \(2020\) recomienda de 5 a 17 años/.test(m15.reco) && m15.cifras === m15.reco, JSON.stringify(m15));
    const a15 = await conAnio(String(anio - 30));
    prueba('perfil con 30 años: la referencia del ACSM y la recomendación de adultos', a15.guardado === anio - 30 && a15.ref && a15.hRef && /recomiendan a los adultos/.test(a15.reco), JSON.stringify(a15));
    const s15 = await conAnio('');
    prueba('perfil sin año: como un adulto', s15.guardado === null && s15.ref && s15.hRef && /recomiendan a los adultos/.test(s15.reco), JSON.stringify(s15));
    prueba('…sin errores de página', e5.length === 0, e5.join(' | '));
    await c5.close();
  }

  // 16. (la app) la línea del día de la semana, con los dos puntos de cada idioma, como las filas del
  //     módulo: en francés con su espacio delante, en chino los de ancho completo y sin espacios; y
  //     el botón del día se llama igual
  {
    const DOS = { fr: /^\S.*\S : 10 séries$/, zh: /^[^:：\s]+：10 组$/, zht: /^[^:：\s]+：10 組$/, de: /^\S.*\S: 10 Sätze$/ };
    await ejemplo(pg);   // hoy, 10 series
    for (const L of Object.keys(DOS)) {
      await idioma(pg, L); await pg.waitForTimeout(100);
      const r16 = await pg.evaluate(() => { const b = document.querySelector('#tgc-dias7 .tgc-dia[aria-pressed="true"]');
        return { txt: document.getElementById('tgc-dia-txt').textContent, nombre: b && b.getAttribute('aria-label') }; });
      prueba(L + ': la línea del día, con los dos puntos de su idioma («' + r16.txt + '»), y el botón del día se llama igual', DOS[L].test(r16.txt) && r16.nombre === r16.txt, JSON.stringify(r16));
    }
    await idioma(pg, 'es');
  }

  // 17. (la app) el iPhone con isla dinámica: 59 px arriba y 34 abajo (Chromium simula el margen,
  //     Emulation.setSafeAreaInsetsOverride). La escena pasa por debajo de la hora, de borde a borde; la
  //     cabecera de «Su cuerpo», no: su flecha y su título empiezan debajo del margen, también al bajar
  //     (pegada y opaca) y sin escena («Comida»); la barra de modos deja el margen de abajo; y un toque con
  //     el dedo en el pecho abre su hoja, pegada abajo
  {
    const c7 = await contexto(b, { contexto: { viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } });
    const p7 = await c7.newPage(); const e7 = []; vigilar(p7, e7);
    const cdp7 = await c7.newCDPSession(p7);
    let simula = true;
    try { await cdp7.send('Emulation.setSafeAreaInsetsOverride', { insets: { top: 59, topMax: 59, bottom: 34, bottomMax: 34, left: 0, leftMax: 0, right: 0, rightMax: 0 } }); } catch (e) { simula = false; }
    prueba('isla dinámica: Chromium simula el margen del iPhone (59 px arriba)', simula);
    if (simula) {
      await abrirApp(p7); await abrirPerfilCuerpo(p7); await suCuerpo(p7); await p7.waitForTimeout(600);
      const medir = () => p7.evaluate(() => { const r = s => { const x = document.querySelector(s).getBoundingClientRect(); return [Math.round(x.top), Math.round(x.bottom)]; };
        const t = document.getElementById('tgc-top');
        return { margen: getComputedStyle(t).paddingTop, top: r('#tgc-top'), h1: r('#tgc-titulo'), back: r('#tgc-back'), escena: r('#tgc-escena'), modos: r('#tgc-modos'), boton: r('#tgc-modo-m'),
          pegada: document.getElementById('tgc').classList.contains('pegada'), fondo: getComputedStyle(t).backgroundColor, sinEscena: document.getElementById('cuerpo-panel').classList.contains('sin-escena') }; });
      const opaca = x => !/rgba\(0, 0, 0, 0\)|transparent/.test(x);
      const a7 = await medir();
      prueba('isla dinámica: la escena desde el borde de arriba (pasa por debajo de la hora); la cabecera, en cristal, con su flecha y su título debajo del margen; la barra de modos abajo, con su margen',
        a7.margen === '59px' && a7.escena[0] === 0 && a7.top[0] === 0 && a7.back[0] >= 59 && a7.h1[0] >= 59 && a7.modos[1] === 852 && a7.boton[1] <= 852 - 34 && !a7.pegada && !opaca(a7.fondo), JSON.stringify(a7));
      await p7.evaluate(() => { document.getElementById('cuerpo-panel').scrollTop += 700; }); await p7.waitForTimeout(300);
      const b7 = await medir();
      prueba('isla dinámica: al bajar, la cabecera se queda pegada arriba, opaca, con su título debajo del margen', b7.top[0] === 0 && b7.h1[0] >= 59 && b7.pegada && opaca(b7.fondo), JSON.stringify(b7));
      await p7.click('#tgc-modo-c'); await p7.waitForTimeout(400);
      const c7m = await medir();
      prueba('isla dinámica: sin escena («Comida»), la cabecera opaca desde el borde, con su título debajo del margen', c7m.top[0] === 0 && c7m.h1[0] >= 59 && c7m.sinEscena && opaca(c7m.fondo), JSON.stringify(c7m));
      await p7.click('#tgc-modo-m'); await p7.waitForTimeout(300);
      await p7.evaluate(() => { document.getElementById('cuerpo-panel').scrollTop = 0; }); await p7.waitForTimeout(200);
      const z7 = await p7.evaluate(() => { const z = document.querySelector('#tgc-cara .tgf-z[data-g="pecho"]').getBoundingClientRect(); return [z.left + z.width / 2, z.top + z.height / 2]; });
      await p7.touchscreen.tap(z7[0], z7[1]); await p7.waitForTimeout(700);
      const d7 = await p7.evaluate(() => ({ hoja: !document.getElementById('tgc-hoja').hidden, tit: document.getElementById('tgc-hoja-tit').textContent, abajo: Math.round(document.getElementById('tgc-hoja').getBoundingClientRect().bottom) }));
      prueba('isla dinámica: un toque con el dedo en el pecho abre su hoja, pegada abajo', d7.hoja && d7.tit === 'Pecho' && d7.abajo === 852, JSON.stringify(d7));
    }
    prueba('isla dinámica: sin errores de página', e7.length === 0, e7.join(' | '));
    await c7.close();
  }

  // 18. (la app) lo nuevo de la entrega del 1 de noviembre (3 de noviembre de 2026; desde el 6, con «Su
  //     cuerpo» encima del perfil): «Preguntar», el panel SOS encima desde una respuesta, «Comida», «Su
  //     deporte», abrirCuerpo() con un modo o una pregunta, y el idioma con «Preguntar» abierto
  {
    const fs = require('fs'), path = require('path');
    const lee = f => JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'datos', 'cuerpo', f), 'utf8'));
    const A = lee('asistente-es.json'), A_DE = lee('asistente-de.json');
    const PRIV = A.respuestas.find(r => r.id === 'datos-privacidad');
    const URG = A.respuestas.find(r => r.id === 'urg-alergia') || A.respuestas.find(r => r.tipo === 'urgencia');
    const CON_SOS = A.respuestas.find(r => r.tipo !== 'urgencia' && r.tipo !== 'calculo' && r.edad === 'todos' && r.links.some(l => l.sos));
    const c8 = await contexto(b), p8 = await c8.newPage(), e8 = [], pide = [];
    let dialogos = 0;
    vigilar(p8, e8);
    p8.on('dialog', d => { dialogos++; d.dismiss().catch(() => {}); });
    p8.on('request', r => { if (r.url().startsWith(BASE)) pide.push(new URL(r.url()).pathname); });
    await abrirApp(p8); await abrirPerfilCuerpo(p8); await suCuerpo(p8);
    const preguntar = async q => {
      const n = await p8.evaluate(() => document.querySelectorAll('#tgc-charla .tgc-turno').length);
      await p8.fill('#tgc-preg', q); await p8.click('#tgc-preg-enviar');
      await p8.waitForFunction(n => document.querySelectorAll('#tgc-charla .tgc-turno').length > n, n, { timeout: 15000 }).catch(() => {});
      await p8.waitForTimeout(150);
    };
    const ultima = () => p8.evaluate(() => { const r = document.querySelector('#tgc-charla .tgc-turno:last-child .tgc-resp-t'); return r ? r.textContent : null; });

    await p8.click('#tgc-modo-p');
    await p8.waitForFunction(() => { const f = document.getElementById('tgc-preg-form'); return f && !f.hidden; }, null, { timeout: 15000 }).catch(() => {});
    const r18 = await p8.evaluate(() => ({ pulsado: document.getElementById('tgc-modo-p').getAttribute('aria-pressed'), vista: !document.getElementById('tgc-vista-preguntar').hidden,
      escena: document.getElementById('tgc-escena').hidden, sinEscena: document.getElementById('cuerpo-panel').classList.contains('sin-escena'), encima: document.getElementById('cuerpo-panel').parentNode === document.body,
      estado: document.getElementById('tgc-asis-estado').textContent, pie: document.getElementById('tgc-ia').textContent, ia: UI_TX.cuerpoAsisRevisado.es,
      sugeridas: document.querySelectorAll('#tgc-sugeridas .tgc-chip-preg').length, estadoHist: JSON.stringify(history.state) }));
    prueba('«Preguntar»: su vista, sin la escena (la cabecera, opaca), con preguntas sugeridas, encima del perfil y sin entrada propia en el historial', r18.pulsado === 'true' && r18.vista && r18.escena && r18.sinEscena
      && r18.encima && r18.sugeridas > 0 && r18.estadoHist === '{"tgPerfil":1,"tgCuerpo":1}', JSON.stringify(r18));
    prueba('…sus respuestas llegan de datos/cuerpo/asistente-es.json', pide.includes('/datos/cuerpo/asistente-es.json'), pide.filter(x => /asistente/.test(x)).join(' '));
    prueba('…y dice la IA con la frase que decidió Jerome, encima de las respuestas y al pie («' + r18.ia + '»)', /\bIA\b/.test(r18.ia) && r18.estado === r18.ia && r18.pie === r18.ia, JSON.stringify(r18));
    await preguntar(PRIV.q);
    const t18 = await ultima();
    prueba('«' + PRIV.q + '»: su respuesta, la de datos-privacidad', t18 === PRIV.r.t, t18);
    // (6-11-2026) una pregunta por un color nuevo del mapa: la respuesta de los colores, con los tres por su nombre
    const COLORES = A.respuestas.find(r => r.id === 'colores-del-mapa');
    await preguntar('¿qué es el color naranja?');
    const t18c = await ultima();
    prueba('«¿qué es el color naranja?»: la respuesta de los colores del mapa, que dice rosa, naranja y amarillo', !!COLORES && t18c === COLORES.r.t && /rosa.*naranja.*amarillo/.test(t18c || ''), t18c);
    const HOSTIL = '<img src=x onerror="window.__pwned=1"> calor';
    await preguntar(HOSTIL);
    const x18 = await p8.evaluate(H => ({ texto: [...document.querySelectorAll('#tgc-charla .tgc-yo')].some(p => p.textContent === H),
      imgs: document.querySelectorAll('#tgc-charla img').length, pwned: !!window.__pwned }), HOSTIL);
    prueba('lo que se escribe sale como texto: el <img onerror> ni se pinta ni se ejecuta', x18.texto && !x18.imgs && !x18.pwned, JSON.stringify(x18));
    await preguntar(URG.q);
    const u18 = await p8.evaluate(() => { const t = document.querySelector('#tgc-charla .tgc-turno:last-child');
      return { urg: !!(t && t.querySelector('.tgc-resp.es-urgente')), tel: !!(t && t.querySelector('a[href="tel:112"]')) }; });
    prueba('una urgencia («' + URG.q + '»): la respuesta de urgencia, con el 112 para llamar', u18.urg && u18.tel, JSON.stringify(u18));

    // la barra de la pregunta, quieta al final de la charla (3 de noviembre de 2026; Jerome, con una
    // captura del iPhone: «cuando sube la página por arriba sigue subiendo con la persona»). Iba pegada
    // abajo y, con el margen del perfil sumado, flotaba encima de las respuestas. Se mira con el final de
    // la charla a media pantalla (la barra, a la vista) y con la charla vista desde arriba: la barra no se
    // separa de la charla, y desde arriba no tapa nada
    const barra = desde => p8.evaluate(d => {
      const pn = document.getElementById('cuerpo-panel'), ch = document.getElementById('tgc-charla'), f = document.getElementById('tgc-preg-form');
      if (d === 'abajo') pn.scrollTop += ch.getBoundingClientRect().bottom - innerHeight / 2;
      else pn.scrollTop += ch.getBoundingClientRect().top - 150;
      const c = ch.getBoundingClientRect(), q = f.getBoundingClientRect();
      return { pos: getComputedStyle(f).position, hueco: Math.round(q.top - c.bottom), barra: Math.round(q.top), charlaAbajo: Math.round(c.bottom), alto: innerHeight };
    }, desde);
    const v1 = await barra('abajo'); await p8.waitForTimeout(150);
    const v2 = await barra('arriba'); await p8.waitForTimeout(150);
    prueba('la barra de la pregunta no sigue al desplazarse: quieta al final de la charla, a la vista y con la charla vista desde arriba, y desde arriba no tapa las respuestas',
      v1.pos === 'static' && v2.pos === 'static' && v1.barra > 0 && v1.barra < v1.alto && v2.charlaAbajo > v2.alto + 40 && v1.hueco === v2.hueco && v2.barra > v2.alto, JSON.stringify({ v1, v2 }));

    // el panel SOS encima, desde el enlace de una respuesta: su «atrás» y su Escape lo cierran a él solo
    await preguntar(CON_SOS.q);
    const guia = CON_SOS.links.find(l => l.sos).sos;
    const turnos = await p8.evaluate(() => document.querySelectorAll('#tgc-charla .tgc-turno').length);
    const abrirLaGuia = async () => {
      await p8.click('#tgc-charla .tgc-turno:last-child .tgc-enlace[data-sos]');
      await p8.waitForFunction(() => window.TG_SOS && !document.getElementById('sos-panel').hidden, null, { timeout: 15000 }).catch(() => {});
      await p8.waitForTimeout(300);
    };
    const como = () => p8.evaluate(() => { const e = document.elementFromPoint(195, 420), cp = document.getElementById('cuerpo-panel');
      return { sos: !document.getElementById('sos-panel').hidden, encima: !!(e && e.closest('#sos-panel')), vista: window.TG_SOS ? TG_SOS.estado.vista : null,
        perfil: !document.getElementById('perfil-panel').hidden, cuerpo: TG_CUERPO.abierto() && !cp.hidden,
        turnos: document.querySelectorAll('#tgc-charla .tgc-turno').length, preguntar: document.getElementById('tgc-modo-p').getAttribute('aria-pressed') }; });
    await abrirLaGuia();
    const s1 = await como();
    prueba('el enlace de una respuesta («' + CON_SOS.q + '») abre su guía del panel SOS («' + guia + '»), encima de todo', s1.sos && s1.encima && s1.vista === guia && s1.perfil, JSON.stringify(s1));
    for (let i = 0; i < 3 && (await como()).sos; i++) { await p8.evaluate(() => history.back()); await p8.waitForTimeout(450); }
    const s2 = await como();
    prueba('«atrás» cierra el panel SOS y deja el perfil, «Su cuerpo» y la conversación como estaban', !s2.sos && s2.perfil && s2.cuerpo && s2.turnos === turnos && s2.preguntar === 'true', JSON.stringify(s2));
    await abrirLaGuia();
    for (let i = 0; i < 3 && (await como()).sos; i++) { await p8.keyboard.press('Escape'); await p8.waitForTimeout(300); }
    const s3 = await como();
    prueba('y Escape también: cierra el panel SOS y nada más (el perfil, «Su cuerpo» y la conversación siguen)', !s3.sos && s3.perfil && s3.cuerpo && s3.turnos === turnos && s3.preguntar === 'true', JSON.stringify(s3));

    // «Comida»: apagado hasta que la persona lo enciende
    await p8.click('#tgc-modo-c'); await p8.waitForTimeout(200);
    const k1 = await p8.evaluate(() => { const e = TG_CUERPO.estado();
      return { intro: !document.getElementById('tgc-com-intro').hidden, diario: !document.getElementById('tgc-com-diario').hidden, escena: document.getElementById('tgc-escena').hidden,
        on: e.comida.on, dias: Object.keys(e.comida.d).length }; });
    prueba('«Comida»: apagado hasta que la persona lo enciende, sin nada anotado y sin el personaje', k1.intro && !k1.diario && k1.escena && !k1.on && k1.dias === 0, JSON.stringify(k1));
    await p8.click('#tgc-com-empezar'); await p8.waitForTimeout(150);
    for (let i = 0; i < 2; i++) { await p8.click('#tgc-com-dia .tgc-com-fila[data-g="frutas"] button[data-d="1"]'); await p8.waitForTimeout(120); }
    const k2 = await p8.evaluate(() => { const g = JSON.parse(localStorage.getItem('tenerife.cuerpo')).comida, f = Object.keys(g.d);
      return { on: g.on, dias: f.length, n: f.length ? g.d[f[0]].frutas : 0, cuenta: document.querySelector('#tgc-com-dia .tgc-com-fila[data-g="frutas"] .tgc-com-n').textContent,
        vivo: document.getElementById('tgc-com-vivo').textContent, debe: UI_TX.cuerpoComVivo.es.replace('{g}', UI_TX.cuerpoComG_frutas.es).replace('{n}', '2'),
        barra: (b => b ? getComputedStyle(b).backgroundColor : 'sin barra')(document.querySelector('#tgc-com-dia .tgc-com-fila[data-g="frutas"] .tgc-com-lleno')) }; });
    prueba('«Comida», encendido: dos raciones de fruta, guardadas en el dispositivo, y el lector de pantalla lo dice («' + k2.debe + '»)', k2.on && k2.dias === 1 && k2.n === 2 && k2.cuenta === '2' && k2.vivo === k2.debe, JSON.stringify(k2));
    // (6-11-2026) la barra de «Comida» no usa los niveles del mapa de músculos: sigue en su oro (#E0B44C)
    prueba('«Comida»: su barra, en el oro de siempre', k2.barra === 'rgb(224, 180, 76)', k2.barra);
    await p8.click('#tgc-com-borrar'); await p8.waitForTimeout(100); await p8.click('#tgc-com-borrar-si'); await p8.waitForTimeout(150);
    const k3 = await p8.evaluate(() => ({ d: Object.keys(TG_CUERPO.estado().comida.d).length, g: Object.keys(JSON.parse(localStorage.getItem('tenerife.cuerpo')).comida.d).length }));
    prueba('«' + await p8.evaluate(() => UI_TX.cuerpoComBorrar.es) + '», con su confirmación en la página: fuera la comida anotada', k3.d === 0 && k3.g === 0, JSON.stringify(k3));

    // «Su deporte»: su guía y sus grupos en el personaje
    await p8.click('#tgc-modo-m'); await p8.waitForTimeout(200);
    await p8.selectOption('#tgc-dep-sel', 'surf');
    await p8.waitForFunction(() => !document.getElementById('tgc-dep-ficha').hidden, null, { timeout: 15000 }).catch(() => {});
    const d18 = await p8.evaluate(() => ({ ficha: !document.getElementById('tgc-dep-ficha').hidden, secciones: document.querySelectorAll('#tgc-dep-ficha .tgc-dep-sec').length,
      guardado: JSON.parse(localStorage.getItem('tenerife.cuerpo')).deporte, prio: document.querySelectorAll('#cuerpo-panel .tgf-prio').length }));
    prueba('«Su deporte»: al elegir uno, su guía (de datos/cuerpo/deportes-es.json) y sus grupos prioritarios en el personaje', d18.ficha && d18.secciones > 0 && d18.guardado === 'surf'
      && d18.prio > 0 && pide.includes('/datos/cuerpo/deportes-es.json'), JSON.stringify(d18));

    // abrirCuerpo() con un modo o una pregunta: el perfil en su pestaña Cuerpo y «Su cuerpo» encima, en ese modo
    await p8.evaluate(() => abrirCuerpo({ modo: 'comida' })); await p8.waitForTimeout(300);
    const m1 = await p8.evaluate(() => ({ c: document.getElementById('tgc-modo-c').getAttribute('aria-pressed'), encima: document.getElementById('cuerpo-panel').parentNode === document.body && TG_CUERPO.abierto(),
      perfil: !document.getElementById('perfil-panel').hidden && TG_PERFIL.estado().pestana === 'cuerpo', n: document.querySelectorAll('#cuerpo-panel').length }));
    prueba('abrirCuerpo({ modo: «comida» }) la pone en «Comida», encima del perfil, una sola vez', m1.c === 'true' && m1.encima && m1.perfil && m1.n === 1, JSON.stringify(m1));
    await p8.evaluate(q => abrirCuerpo({ pregunta: q }), PRIV.q);
    await p8.waitForFunction(t => { const r = document.querySelector('#tgc-charla .tgc-turno:last-child .tgc-resp-t');
      return r && r.textContent === t && document.getElementById('tgc-modo-p').getAttribute('aria-pressed') === 'true'; }, PRIV.r.t, { timeout: 15000 }).catch(() => {});
    const m2 = await p8.evaluate(() => ({ p: document.getElementById('tgc-modo-p').getAttribute('aria-pressed'), r: (document.querySelector('#tgc-charla .tgc-turno:last-child .tgc-resp-t') || {}).textContent,
      encima: document.getElementById('cuerpo-panel').parentNode === document.body && TG_CUERPO.abierto() }));
    prueba('abrirCuerpo({ pregunta }) la pone en «Preguntar», encima del perfil, y ya responde', m2.p === 'true' && m2.r === PRIV.r.t && m2.encima, JSON.stringify(m2));

    // el idioma con «Preguntar» abierto
    await idioma(p8, 'de');
    await p8.waitForFunction(() => { const f = document.getElementById('tgc-preg-form'); return f && !f.hidden && document.getElementById('tgc-asis-estado').textContent === UI_TX.cuerpoAsisRevisado.de; }, null, { timeout: 15000 }).catch(() => {});
    const qDe = new Set(A_DE.respuestas.map(r => r.q));
    const i18 = await p8.evaluate(() => ({ estado: document.getElementById('tgc-asis-estado').textContent, debe: UI_TX.cuerpoAsisRevisado.de,
      chips: [...document.querySelectorAll('#tgc-sugeridas .tgc-chip-preg')].map(b => b.textContent) }));
    prueba('el idioma con «Preguntar» abierto: en alemán, las respuestas de asistente-de.json, sus preguntas sugeridas y su frase de la IA', pide.includes('/datos/cuerpo/asistente-de.json')
      && i18.estado === i18.debe && i18.chips.length > 0 && i18.chips.every(q => qDe.has(q)), JSON.stringify(i18));
    await idioma(p8, 'es');
    prueba('«Preguntar», «Comida» y «Su deporte»: ninguna ventana (alert, confirm)', dialogos === 0, String(dialogos));
    prueba('…y ningún error de página', e8.length === 0, e8.join(' | '));
    await c8.close();
  }

  // 18b. (la app) sin las respuestas (sin red y sin haberlas guardado nunca): su aviso y «Reintentar»,
  //      que con red otra vez las trae
  {
    const c9 = await contexto(b), p9 = await c9.newPage(), e9 = [];
    vigilar(p9, e9);
    let cortar = true;
    await p9.route('**/datos/cuerpo/asistente-*.json', r => cortar ? r.abort() : r.continue());
    await abrirApp(p9); await abrirPerfilCuerpo(p9); await suCuerpo(p9);
    await p9.click('#tgc-modo-p');
    await p9.waitForFunction(() => !document.getElementById('tgc-asis-reintentar').hidden, null, { timeout: 15000 }).catch(() => {});
    const o1 = await p9.evaluate(() => ({ estado: document.getElementById('tgc-asis-estado').textContent, debe: UI_TX.cuerpoAsisError.es,
      sinForm: document.getElementById('tgc-preg-form').hidden, re: !document.getElementById('tgc-asis-reintentar').hidden }));
    prueba('sin las respuestas: «' + o1.debe + '», con «Reintentar» y sin el formulario', o1.estado === o1.debe && o1.sinForm && o1.re, JSON.stringify(o1));
    cortar = false;
    await p9.click('#tgc-asis-reintentar');
    await p9.waitForFunction(() => !document.getElementById('tgc-preg-form').hidden, null, { timeout: 15000 }).catch(() => {});
    const o2 = await p9.evaluate(() => ({ form: !document.getElementById('tgc-preg-form').hidden, re: document.getElementById('tgc-asis-reintentar').hidden }));
    prueba('…y con red otra vez, «Reintentar» las trae', o2.form && o2.re, JSON.stringify(o2));
    prueba('…sin errores de página', e9.length === 0, e9.join(' | '));
    await c9.close();
  }

  // 19. (sin navegador) las respuestas y las guías que citan un texto de la pantalla («Últimas
  //     anotaciones», «Borrar lo anotado»…) lo citan tal cual, en los diez idiomas (3 de noviembre de
  //     2026: en chino tradicional, dos respuestas citaban «最近記錄» y la pantalla dice «最近紀錄»). El
  //     polaco escribe con „…” las comillas de dentro, como su norma
  {
    const fs = require('fs'), path = require('path');
    const s = fs.readFileSync(path.join(__dirname, '..', 'modulos', 'cuerpo.js'), 'utf8');
    const UI = {}; { const i = s.indexOf('var CUERPO_UI = {'), j = s.indexOf('\n  };', i);
      for (const l of s.slice(i, j).split('\n')) { const m = l.match(/^\s*"(cuerpo[A-Za-z0-9_]+)": (\{.*\}),?$/); if (m) UI[m[1]] = JSON.parse(m[2]); } }
    const L = ['es', 'en', 'fr', 'de', 'it', 'nl', 'zh', 'zht', 'bg', 'pl'];
    const SALTA = new Set(['v', 'k', 'u', 'f', 'id', 'cat', 'tipo', 'edad', 'rel', 'links', 'cert', 'gg', 'ej', 'sos']);
    const plano = (o, r, d) => {
      if (typeof o === 'string') d[r] = o;
      else if (Array.isArray(o)) o.forEach((x, i) => plano(x, r + '[' + i + ']', d));
      else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) if (!SALTA.has(k)) plano(v, r + '.' + k, d);
      return d;
    };
    const lee = f => JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'datos', 'cuerpo', f), 'utf8'));
    const T = {};
    for (const l of L) {
      const d = {};
      for (const x of lee('asistente-' + l + '.json').respuestas) plano(x, 'asistente ' + x.id, d);
      for (const x of lee('deportes-' + l + '.json').deportes) plano(Object.assign({}, x, { qs: (x.qs || []).map(q => q[1]) }), 'deporte ' + x.id, d);
      T[l] = d;
    }
    /* las citas «…», con las de dentro: «Borrar los datos de «Su cuerpo»» */
    const citas = t => { const out = [];
      for (let i = t.indexOf('«'); i >= 0; i = t.indexOf('«', i + 1)) { let n = 0, j = i; for (; j < t.length; j++) { if (t[j] === '«') n++; else if (t[j] === '»' && --n === 0) break; } out.push(t.slice(i + 1, j)); }
      return out; };
    const porEs = {}; for (const [k, v] of Object.entries(UI)) (porEs[v.es] = porEs[v.es] || []).push(k);
    const usos = []; for (const [donde, t] of Object.entries(T.es)) for (const c of citas(t)) if (porEs[c]) usos.push([donde, porEs[c]]);
    const malas = [];
    for (const [donde, ks] of usos) for (const l of L.slice(1)) {
      const t = T[l][donde] || '';
      if (!ks.some(k => t.includes(UI[k][l]) || (l === 'pl' && t.includes(UI[k][l].replace(/«([^«»]*)»/g, '„$1”')))))
        malas.push(l + ' ' + donde + ': «' + ks.map(k => UI[k][l]).join('» o «') + '»');
    }
    prueba('las respuestas y las guías que citan un texto de la pantalla (' + usos.length + ' citas) lo citan tal cual en los diez idiomas', usos.length >= 20 && !malas.length, malas.slice(0, 4).join(' · '));
    /* y la política de privacidad (ppDatosCuerpoTxt), que dice con qué botón se borra todo: ese botón, tal cual
       (3 de noviembre de 2026: en búlgaro citaba «Изтриване…», el de un módulo de antes, y la pantalla dice «Изтрий…») */
    const malPol = [];
    for (const l of L) {
      const t = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'idiomas', 'privacidad', l + '.json'), 'utf8')).ppDatosCuerpoTxt, bo = UI.cuerpoBorrar[l];
      if (!(t.includes(bo) || (l === 'pl' && t.includes(bo.replace(/«([^«»]*)»/g, '„$1”'))))) malPol.push(l + ': «' + bo + '»');
    }
    prueba('la política de privacidad cita el botón de borrar «Su cuerpo» tal cual, en los diez idiomas', !malPol.length, malPol.join(' · '));
  }

  // 19b. (sin navegador; 6 de noviembre de 2026, el bloque 1 del rediseño) los niveles del mapa ya no son de
  //      oro, y el asistente lo decía en cuatro frases («tres tonos de oro», «el tono de oro más alto»…) y en
  //      lo que usa para buscar. En los diez idiomas: las seis respuestas que hablan del mapa no nombran el
  //      oro; la de los colores y la frase del mapa dicen rosa, naranja y amarillo, por ese orden; y el
  //      buscador del propio módulo lleva a «colores-del-mapa» las preguntas por cada color y a
  //      «por-que-diez-series» la de por qué el amarillo empieza en 10
  {
    const fs = require('fs'), path = require('path'), vm = require('vm');
    const L = ['es', 'en', 'fr', 'de', 'it', 'nl', 'zh', 'zht', 'bg', 'pl'];
    const lee = l => JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'datos', 'cuerpo', 'asistente-' + l + '.json'), 'utf8')).respuestas;
    const DEL_MAPA = ['como-anotar', 'cuantas-series', 'que-cuenta-como-serie', 'colores-del-mapa', 'por-que-diez-series', 'que-entreno-hoy'];
    const sinLetra = '(?<![\\p{L}])', niLetra = '(?![\\p{L}])';
    const ORO = { es: new RegExp(sinLetra + '(oro|dorad\\p{L}*)' + niLetra, 'iu'), en: /gold/i, fr: new RegExp(sinLetra + '(or|dor[ée]e?s?)' + niLetra, 'iu'), de: /gold/i,
      it: new RegExp(sinLetra + '(oro|dorat\\p{L}*)' + niLetra, 'iu'), nl: /goud/i, zh: /金色|最深/, zht: /金色|最深/, bg: /злат/i, pl: /złot/i };   // en chino, tampoco «el más oscuro» (最深), ni en lo que enseña ni en lo que usa para buscar: el nivel más alto es ahora el más claro
    const COLOR = { es: ['rosa', 'naranja', 'amarillo'], en: ['pink', 'orange', 'yellow'], fr: ['rose', 'orange', 'jaune'], de: ['rosa', 'orange', 'gelb'], it: ['rosa', 'arancione', 'giallo'],
      nl: ['roze', 'oranje', 'geel'], zh: ['粉色', '橙色', '黄色'], zht: ['粉紅色', '橘色', '黃色'], bg: ['розово', 'оранжево', 'жълто'], pl: ['różowy', 'pomarańczowy', 'żółty'] };
    /* por idioma: una pregunta por el rosa, otra por el naranja, otra por el amarillo y la de las 10 series */
    const PREG = {
      es: ['mi brazo sale rosa', '¿qué es el color naranja?', 'qué quiere decir el amarillo', '¿por qué el amarillo empieza en 10?'],
      en: ['what does pink mean?', 'why is a muscle orange?', 'what does yellow mean?', 'why does yellow start at 10?'],
      fr: ['que veut dire le rose ?', 'pourquoi un muscle est orange ?', 'ça veut dire quoi le jaune', 'pourquoi le jaune commence à 10 ?'],
      de: ['Was bedeutet Rosa?', 'Was ist die orange Farbe?', 'Was heißt Gelb', 'Warum fängt Gelb bei 10 an?'],
      it: ['cosa significa il rosa?', 'perché un muscolo è arancione?', 'cosa vuol dire il giallo', 'perché il giallo parte da 10?'],
      nl: ['wat betekent roze?', 'waarom is een spier oranje?', 'wat betekent geel', 'waarom begint geel bij 10?'],
      zh: ['粉色是什么意思？', '为什么肌肉是橙色的？', '黄色代表什么', '为什么黄色从10开始？'],
      zht: ['粉紅色是什麼意思？', '為什麼肌肉是橘色的？', '黃色代表什麼', '為什麼黃色從10開始？'],
      bg: ['какво значи розовото', 'защо един мускул е оранжев', 'какво значи жълто', 'защо жълтото започва от 10'],
      pl: ['co oznacza różowy', 'dlaczego mięsień jest pomarańczowy', 'co znaczy żółty', 'dlaczego żółty zaczyna się od 10']
    };
    const SALTA = new Set(['u', 'f', 'id', 'cat', 'tipo', 'edad', 'rel', 'links', 'cert']);
    const todo = (o, d) => { if (typeof o === 'string') d.push(o); else if (Array.isArray(o)) o.forEach(x => todo(x, d)); else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) if (!SALTA.has(k)) todo(v, d); return d; };
    const M = fs.readFileSync(path.join(__dirname, '..', 'modulos', 'cuerpo.js'), 'utf8'), ctx = {};
    vm.createContext(ctx); vm.runInContext(M.slice(M.indexOf('/* buscador.js —'), M.indexOf('/* ── la pantalla «Su cuerpo» ── */')), ctx);
    const oro = [], orden = [], busca = []; let textos = 0, preguntas = 0;
    for (const l of L) {
      const R = lee(l), por = Object.fromEntries(R.map(r => [r.id, r]));
      for (const id of DEL_MAPA) for (const t of todo(por[id] || {}, [])) { textos++; if (ORO[l].test(t)) oro.push(l + ' ' + id + ': ' + t.slice(0, 70)); }
      const enOrden = t => { const x = String(t || '').toLowerCase(), i = COLOR[l].map(c => x.indexOf(c.toLowerCase())); return i[0] >= 0 && i[0] < i[1] && i[1] < i[2]; };
      const frases = [((por['colores-del-mapa'] || {}).r || {}).t, (((por['como-anotar'] || {}).r || {}).p || [])[1], (((por['que-cuenta-como-serie'] || {}).r || {}).p || [])[1]];
      frases.forEach(t => { if (!enOrden(t)) orden.push(l + ': ' + String(t).slice(0, 70)); });
      const b = ctx.TG_BUSCADOR.crear({ idioma: l, respuestas: R });
      PREG[l].forEach((q, i) => { for (const edad of [30, 15, null]) { preguntas++; const x = b.buscar(q, { edad }), quiere = i === 3 ? 'por-que-diez-series' : 'colores-del-mapa';
        if (!(x.mejor && x.mejor.id === quiere)) busca.push(l + ' «' + q + '» (' + edad + '): ' + (x.mejor ? x.mejor.id : x.pista)); } });
    }
    prueba('el asistente no habla ya de oro para los niveles: ni lo que enseña ni lo que usa para buscar, en las seis respuestas del mapa y los diez idiomas (' + textos + ' textos)', textos > 900 && !oro.length, oro.slice(0, 4).join(' · '));
    prueba('la respuesta de los colores y la frase del mapa dicen rosa, naranja y amarillo, por ese orden, en los diez idiomas', !orden.length, orden.slice(0, 4).join(' · '));
    prueba('el buscador lleva a su respuesta las preguntas por el rosa, el naranja y el amarillo, y la de las 10 series, en los diez idiomas (' + preguntas + ' consultas)', preguntas === 120 && !busca.length, busca.slice(0, 5).join(' · '));
  }

  // 19c. (sin navegador; 6 de noviembre de 2026) la bandera de la playa. «¿Qué significa la bandera amarilla?»
  //      llevaba, en inglés, francés, polaco y chino, a la respuesta de los colores del personaje o a la del
  //      nivel de un ejercicio: «amarillo» es palabra clave de «colores-del-mapa», y solo el castellano tenía en
  //      «nadar-en-el-mar» las variantes «¿qué significan la bandera roja y la amarilla?» y «¿qué significan las
  //      banderas en las playas de Tenerife?» y la clave «colores de la bandera». Ahora las tienen los diez
  //      idiomas, y el buscador del propio módulo lleva a la respuesta del mar, sin urgencia, las preguntas por la
  //      bandera amarilla, por la amarilla en la playa, si se puede nadar con ella y por la roja, con 30 años,
  //      con 15 y sin edad
  {
    const fs = require('fs'), path = require('path'), vm = require('vm');
    const lee = l => JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'datos', 'cuerpo', 'asistente-' + l + '.json'), 'utf8')).respuestas;
    const M = fs.readFileSync(path.join(__dirname, '..', 'modulos', 'cuerpo.js'), 'utf8'), ctx = {};
    vm.createContext(ctx); vm.runInContext(M.slice(M.indexOf('/* buscador.js —'), M.indexOf('/* ── la pantalla «Su cuerpo» ── */')), ctx);
    const BANDERA = {
      es: ['¿qué significa la bandera amarilla?', 'bandera amarilla', '¿qué quiere decir la bandera amarilla en la playa?', '¿puedo bañarme con bandera amarilla?', '¿qué significa la bandera roja?'],
      en: ['what does the yellow flag mean?', 'yellow flag', 'what does a yellow flag on the beach mean?', 'can I swim with a yellow flag?', 'what does the red flag mean?'],
      fr: ['que veut dire le drapeau jaune ?', 'drapeau jaune', 'que signifie le drapeau jaune sur la plage ?', 'peut-on se baigner avec le drapeau jaune ?', 'que veut dire le drapeau rouge ?'],
      de: ['Was bedeutet die gelbe Flagge?', 'gelbe Flagge', 'Was bedeutet die gelbe Flagge am Strand?', 'Darf ich bei gelber Flagge baden?', 'Was bedeutet die rote Flagge?'],
      it: ['cosa significa la bandiera gialla?', 'bandiera gialla', 'cosa vuol dire la bandiera gialla in spiaggia?', 'posso fare il bagno con la bandiera gialla?', 'cosa significa la bandiera rossa?'],
      nl: ['wat betekent de gele vlag?', 'gele vlag', 'wat betekent een gele vlag op het strand?', 'mag ik zwemmen bij een gele vlag?', 'wat betekent de rode vlag?'],
      zh: ['黄旗是什么意思？', '黄旗', '海滩上的黄旗是什么意思？', '挂黄旗能游泳吗？', '红旗是什么意思？'],
      zht: ['黃旗是什麼意思？', '黃旗', '海灘上的黃旗是什麼意思？', '掛黃旗可以游泳嗎？', '紅旗是什麼意思？'],
      bg: ['какво означава жълтият флаг?', 'жълт флаг', 'какво означава жълт флаг на плажа?', 'мога ли да плувам при жълт флаг?', 'какво означава червеният флаг?'],
      pl: ['co oznacza żółta flaga', 'żółta flaga', 'co oznacza żółta flaga na plaży?', 'czy mogę pływać przy żółtej fladze?', 'co oznacza czerwona flaga?']
    };
    const malas = []; let consultas = 0;
    for (const [l, qs] of Object.entries(BANDERA)) {
      const b = ctx.TG_BUSCADOR.crear({ idioma: l, respuestas: lee(l) });
      for (const q of qs) for (const edad of [30, 15, null]) {
        consultas++;
        const x = b.buscar(q, { edad });
        if (x.urgente || !(x.mejor && x.mejor.id === 'nadar-en-el-mar')) malas.push(l + ' «' + q + '» (' + edad + '): ' + (x.urgente ? 'urgencia ' + x.urgente : x.mejor ? x.mejor.id : x.pista));
      }
    }
    prueba('la bandera de la playa: la amarilla, la amarilla en la playa, si se puede nadar con ella y la roja llevan a la respuesta del mar, en los diez idiomas (' + consultas + ' consultas)', consultas === 150 && !malas.length, malas.slice(0, 5).join(' · '));
  }

  // 19d. (sin navegador; 6 de noviembre de 2026) el color del pecho no es una urgencia. «¿Por qué mi pecho está en
  //      naranja?», preguntado por el color del dibujo, llevaba en castellano a la urgencia del dolor en el pecho
  //      («pecho» pesa mucho en «urg-pecho»), con los cuatro colores. «colores-del-mapa» lleva ahora la variante
  //      «¿por qué mi pecho sale en naranja?». En los diez idiomas, la pregunta de por qué un grupo del dibujo está
  //      en un color, de tres maneras, con los 12 grupos, los 4 colores y 30 años, 15 y sin edad, no lleva nunca a
  //      una urgencia; las del pecho, en castellano, llevan a los colores. Y lo que se escribe cuando duele el
  //      pecho sigue dando la urgencia: el filtro de urgencias (sus patrones) no se ha tocado
  {
    const fs = require('fs'), path = require('path'), vm = require('vm');
    const lee = l => JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'datos', 'cuerpo', 'asistente-' + l + '.json'), 'utf8')).respuestas;
    const M = fs.readFileSync(path.join(__dirname, '..', 'modulos', 'cuerpo.js'), 'utf8'), ctx = {};
    vm.createContext(ctx); vm.runInContext(M.slice(M.indexOf('/* buscador.js —'), M.indexOf('/* ── la pantalla «Su cuerpo» ── */')), ctx);
    // los nombres de los 12 grupos, los de la pantalla (CUERPO_UI, «cuerpoG_<grupo>»)
    const G = {};
    for (const m of M.matchAll(/"cuerpoG_([a-z_]+)": (\{[^}]*\})/g)) G[m[1]] = JSON.parse(m[2]);
    const T = {
      es: ['¿por qué mi {g} está en {c}?', '{g} en {c}, ¿por qué?', '¿qué significa que mi {g} salga {c}?'],
      en: ['why is my {g} {c}?', '{g} in {c}, why?', 'what does it mean that my {g} is {c}?'],
      fr: ['pourquoi mon {g} est en {c} ?', '{g} en {c}, pourquoi ?', 'que veut dire mon {g} en {c} ?'],
      de: ['Warum ist mein {g} {c}?', '{g} in {c}, warum?', 'Was bedeutet es, wenn mein {g} {c} ist?'],
      it: ['perché il mio {g} è {c}?', '{g} in {c}, perché?', 'cosa significa se il mio {g} è {c}?'],
      nl: ['waarom is mijn {g} {c}?', '{g} in het {c}, waarom?', 'wat betekent het als mijn {g} {c} is?'],
      zh: ['为什么我的{g}是{c}？', '{g}变成{c}是什么意思', '我的{g}显示{c}代表什么'],
      zht: ['為什麼我的{g}是{c}？', '{g}變成{c}是什麼意思', '我的{g}顯示{c}代表什麼'],
      bg: ['защо {g} ми е {c}?', '{g} в {c}, защо?', 'какво означава, че {g} ми е {c}?'],
      pl: ['dlaczego {g} jest {c}?', '{g} na {c}, dlaczego?', 'co znaczy, że {g} jest {c}?']
    };
    const C = { es: ['gris', 'rosa', 'naranja', 'amarillo'], en: ['grey', 'pink', 'orange', 'yellow'], fr: ['gris', 'rose', 'orange', 'jaune'],
      de: ['grau', 'rosa', 'orange', 'gelb'], it: ['grigio', 'rosa', 'arancione', 'giallo'], nl: ['grijs', 'roze', 'oranje', 'geel'],
      zh: ['灰色', '粉色', '橙色', '黄色'], zht: ['灰色', '粉紅色', '橘色', '黃色'], bg: ['сиво', 'розово', 'оранжево', 'жълто'], pl: ['szary', 'różowy', 'pomarańczowy', 'żółty'] };
    const DUELE = ['me duele el pecho', '¿por qué me duele el pecho?', 'dolor en el pecho al correr', 'tengo presión en el pecho', 'me aprieta el pecho',
      'siento un peso en el pecho', 'pinchazo en el pecho', 'dolor de pecho y brazo izquierdo', 'creo que me está dando un infarto',
      'molestias en el pecho haciendo deporte', 'tengo el pecho apretado', 'noto opresión en el pecho', 'dolor torácico', 'me duele el pecho al respirar'];
    const aUrgencia = [], pechoMal = [], dueleMal = []; let consultas = 0;
    for (const l of Object.keys(T)) {
      const R = lee(l), tipo = Object.fromEntries(R.map(r => [r.id, r.tipo])), b = ctx.TG_BUSCADOR.crear({ idioma: l, respuestas: R });
      for (const t of T[l]) for (const gk of Object.keys(G)) for (const c of C[l]) for (const edad of [30, 15, null]) {
        const q = t.replace('{g}', l === 'de' ? G[gk][l] : G[gk][l].toLowerCase()).replace('{c}', c), x = b.buscar(q, { edad });
        consultas++;
        if (x.urgente || (x.mejor && tipo[x.mejor.id] === 'urgencia')) aUrgencia.push(l + ' «' + q + '» (' + edad + '): ' + (x.urgente || x.mejor.id));
      }
      if (l === 'es') {
        for (const c of C.es) for (const edad of [30, 15, null]) {
          const q = '¿por qué mi pecho está en ' + c + '?', x = b.buscar(q, { edad });
          if (x.urgente || !(x.mejor && x.mejor.id === 'colores-del-mapa')) pechoMal.push('«' + q + '» (' + edad + '): ' + (x.urgente || (x.mejor ? x.mejor.id : x.pista)));
        }
        for (const q of DUELE) for (const edad of [30, 15, null]) {
          const x = b.buscar(q, { edad });
          if (x.urgente !== 'urg-pecho') dueleMal.push('«' + q + '» (' + edad + '): ' + (x.urgente || '-'));
        }
      }
    }
    prueba('el color del dibujo no es una urgencia: por qué un grupo está en un color, en los diez idiomas, nunca lleva a una urgencia (' + consultas + ' consultas), y el pecho en castellano lleva a los colores', consultas === 4320 && !aUrgencia.length && !pechoMal.length, aUrgencia.concat(pechoMal).slice(0, 5).join(' · '));
    prueba('lo que se escribe cuando duele el pecho sigue dando la urgencia del pecho (' + DUELE.length + ' frases, con tres edades)', !dueleMal.length, dueleMal.slice(0, 5).join(' · '));
  }

  // 19e. (sin navegador; 7 de noviembre de 2026) el pecho apretado, dicho de otra manera, también es una urgencia.
  //      El filtro cogía «tengo el pecho apretado», pero no «mi pecho está apretado y me mareo» ni «el pecho me duele
  //      mucho»: sus patrones piden las palabras juntas, y pasaba en nueve de los diez idiomas. «urg-pecho» lleva
  //      patrones nuevos para la misma molestia con el verbo o un «muy» en medio, o con el orden al revés. Aquí: las
  //      molestias, en los diez idiomas, dan la urgencia del pecho; y las frases normales con las mismas palabras (el
  //      gimnasio, la estética, la ropa, los colores del dibujo) no dan ninguna urgencia
  {
    const fs = require('fs'), path = require('path'), vm = require('vm');
    const lee = l => JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'datos', 'cuerpo', 'asistente-' + l + '.json'), 'utf8')).respuestas;
    const M = fs.readFileSync(path.join(__dirname, '..', 'modulos', 'cuerpo.js'), 'utf8'), ctx = {};
    vm.createContext(ctx); vm.runInContext(M.slice(M.indexOf('/* buscador.js —'), M.indexOf('/* ── la pantalla «Su cuerpo» ── */')), ctx);
    const SI = {
      es: ["mi pecho está apretado y me mareo", "tengo el pecho apretado", "noto el pecho muy apretado", "el pecho me aprieta", "el pecho me duele mucho", "siento el pecho oprimido", "el pecho lo tengo apretado", "mi pecho está oprimido", "me oprime el pecho", "pecho dolorido después de correr", "tengo el pecho muy oprimido y me falta el aire", "mi pecho se siente apretado", "el pecho me arde al correr", "noto el pecho apretado al subir cuestas", "el pecho le duele a mi padre"],
      en: ["my chest is tight and I feel dizzy", "my chest feels tight", "tightness in my chest", "my chest hurts a lot", "my chest feels heavy"],
      fr: ["ma poitrine est serrée et j'ai la tête qui tourne", "j'ai la poitrine serrée", "la poitrine me fait mal", "j'ai mal à la poitrine", "la poitrine est oppressée depuis ce matin", "ma poitrine est très serrée quand je cours", "le thorax semble comprimé"],
      de: ["meine Brust ist eng und mir ist schwindelig", "Engegefühl in der Brust", "die Brust tut mir weh", "meine Brust fühlt sich eng an", "meine Brust fühlt sich so eng an", "die Brust ist ganz eng", "mein Brustkorb fühlt sich beklemmt an"],
      it: ["ho il petto stretto e mi gira la testa", "il petto mi fa male", "senso di oppressione al petto", "mi sento il petto stretto", "il torace mi fa molto male", "sento il petto oppresso", "mi sento il torace pesante", "il petto mi brucia quando corro"],
      nl: ["mijn borst voelt beklemd en ik ben duizelig", "beklemmend gevoel op de borst", "mijn borst doet pijn", "mijn borst voelt strak", "mijn borst voelt erg beklemd", "mijn borstkas is benauwd", "zijn borst voelt zwaar"],
      zh: ["胸口很紧而且头晕", "胸口发紧", "胸口闷得慌", "我胸口很闷还头晕", "胸口有点紧", "胸口突然发紧", "胸部很闷", "胸口一直紧紧的"],
      zht: ["胸口很緊而且頭暈", "胸口發緊", "胸口悶", "我胸口很悶還頭暈", "胸口有點緊", "胸部很悶", "胸口突然發緊"],
      bg: ["гърдите ми са стегнати и ми се вие свят", "стяга ме в гърдите", "болят ме гърдите", "имам стягане в гърдите", "усещам гърдите си стегнати", "гърдите ми са стегнати и се задъхвам", "чувствам гръдния кош си притиснат"],
      pl: ["mam ściśniętą klatkę piersiową i kręci mi się w głowie", "ściska mnie w klatce piersiowej", "klatka piersiowa mnie boli", "czuję ucisk w klatce piersiowej", "czuję ściśniętą klatkę", "klatka piersiowa jest ściśnięta", "mam zaciśniętą klatkę piersiową"]
    };
    const NO = {
      es: ["aprieta el pecho al final del press", "ejercicios para tener el pecho más firme", "cómo sacar pecho al correr", "press de pecho con mancuernas", "¿por qué mi pecho está en rosa?", "mi pecho está en naranja", "quiero un pecho más grande", "el pecho es el músculo que más me gusta entrenar"],
      fr: ["mon soutien-gorge de sport est trop serré", "comment muscler la poitrine", "développé couché pour la poitrine", "ma poitrine est serrée dans ma brassière", "pourquoi ma poitrine est en orange ?"],
      de: ["Wie bekomme ich eine straffe Brust?", "Brustübungen mit Kurzhanteln", "das Shirt ist an der Brust zu eng", "warum ist meine Brust orange?", "meine Brust ist größer geworden"],
      it: ["ho il petto stretto, come allargarlo?", "esercizi per il petto", "panca piana per il petto", "il mio petto è stretto e voglio allenarlo", "perché il mio petto è arancione?"],
      nl: ["mijn borst is strak getraind", "oefeningen voor de borst", "hoe krijg ik een strakke borst", "waarom is mijn borst oranje?"],
      zh: ["怎么让胸部紧致", "胸部紧实的训练", "练胸的动作有哪些", "胸肌怎么练", "为什么我的胸部是橙色的？", "胸口的颜色是什么意思"],
      zht: ["怎麼讓胸部緊緻", "胸部緊實的訓練", "練胸的動作有哪些", "為什麼我的胸部是橘色的？"],
      bg: ["как да имам стегнати гърди", "упражнения за гърди", "гърдите ми са стегнати след тренировките", "искам стегнати гърди", "защо гърдите ми са оранжеви"],
      pl: ["ćwiczenia na klatkę piersiową", "jak rozbudować klatkę piersiową", "wyciskanie na klatkę", "dlaczego moja klatka jest pomarańczowa"]
    };
    const sinUrgencia = [], falsas = []; let nSi = 0, nNo = 0;
    for (const l of ['es', 'en', 'fr', 'de', 'it', 'nl', 'zh', 'zht', 'bg', 'pl']) {
      const b = ctx.TG_BUSCADOR.crear({ idioma: l, respuestas: lee(l) });
      for (const q of SI[l] || []) { nSi++; const u = b.urgente(q); if (u !== 'urg-pecho') sinUrgencia.push(l + ' «' + q + '»: ' + (u || '-')); }
      for (const q of NO[l] || []) { nNo++; const u = b.urgente(q); if (u) falsas.push(l + ' «' + q + '»: ' + u); }
    }
    prueba('el pecho apretado, dicho de otra manera, da la urgencia del pecho en los diez idiomas (' + nSi + ' frases)', nSi === 78 && !sinUrgencia.length, sinUrgencia.slice(0, 5).join(' · '));
    prueba('las frases normales con las mismas palabras (gimnasio, estética, ropa, colores del dibujo) no dan ninguna urgencia (' + nNo + ' frases)', nNo === 46 && !falsas.length, falsas.slice(0, 5).join(' · '));
  }

  // 20. (6-11-2026, bloque 2) la cabecera de «Su cuerpo» va en cristal sobre la escena y se vuelve opaca
  //     al bajar («Músculos»; en «Aspecto», con la escena pegada arriba a la vista, sigue en cristal); sin
  //     escena («Comida» y «Preguntar»), opaca desde el principio; y la barra de modos, fija abajo en los
  //     cuatro modos, nunca tapa el final de la página
  {
    const c10 = await contexto(b), p10 = await c10.newPage(), e10 = []; vigilar(p10, e10);
    await abrirApp(p10); await abrirPerfilCuerpo(p10); await suCuerpo(p10);
    const mira = () => p10.evaluate(() => { const t = document.getElementById('tgc-top'), p = document.getElementById('cuerpo-panel'), m = document.getElementById('tgc-modos').getBoundingClientRect();
      const ultimo = [...document.querySelectorAll('#tgc .tgc-pie p, #tgc .tgc-pie button')].filter(e => e.getClientRects().length).pop();
      return { pegada: document.getElementById('tgc').classList.contains('pegada'), transparente: /rgba\(0, 0, 0, 0\)|transparent/.test(getComputedStyle(t).backgroundColor),
        sinEscena: p.classList.contains('sin-escena'), modosAbajo: Math.round(m.bottom) === innerHeight, finLibre: !!ultimo && ultimo.getBoundingClientRect().bottom <= m.top + 0.5, scroll: p.scrollTop }; });
    const malos = [];
    for (const m of ['m', 'a', 'c', 'p']) {
      await p10.click('#tgc-modo-' + m); await p10.waitForTimeout(300);
      await p10.evaluate(() => { document.getElementById('cuerpo-panel').scrollTop = 0; }); await p10.waitForTimeout(150);
      const arriba = await mira(), conEscena = m === 'm' || m === 'a';
      if (conEscena ? (arriba.pegada || !arriba.transparente || arriba.sinEscena) : (arriba.transparente || !arriba.sinEscena)) malos.push(m + ' arriba: ' + JSON.stringify(arriba));
      if (!arriba.modosAbajo) malos.push(m + ' arriba, la barra de modos: ' + JSON.stringify(arriba));
      await p10.evaluate(() => { const p = document.getElementById('cuerpo-panel'); p.scrollTop = p.scrollHeight; }); await p10.waitForTimeout(200);
      const abajo = await mira();
      const bien = m === 'm' ? abajo.pegada && !abajo.transparente : m === 'a' ? !abajo.pegada && abajo.transparente : !abajo.transparente;
      if (!bien || !abajo.modosAbajo || !abajo.finLibre) malos.push(m + ' abajo: ' + JSON.stringify(abajo));
    }
    prueba('la cabecera, en cristal sobre la escena y opaca al bajar o sin escena; la barra de modos, fija abajo y sin tapar el final, en los cuatro modos', malos.length === 0, malos.slice(0, 4).join(' · '));
    prueba('…sin errores de página', e10.length === 0, e10.join(' | '));
    await c10.close();
  }

  // 22. (7-11-2026, bloque 3) el personaje en 3D, con el 3D encendido: al abrir «Su cuerpo» se piden el motor,
  //     el índice y solo las piezas del aspecto elegido (16 peticiones, unos 0,8 MB), y el lienzo sustituye al
  //     dibujo (sin la vista pequeña de «Girar»); un toque con el dedo en un músculo abre su hoja y «+ 1 serie»
  //     le saca una sonrisa; arrastrar en horizontal gira sin abrir nada y, pasados 90°, la vista es «de
  //     espaldas»; «Girar» da la vuelta; el tema cambia la luz y el modo, el barrido; en «Aspecto», el audífono
  //     y la prótesis llegan al motor, un peinado nuevo pide sus dos ficheros antes de ponerse, lo que no está en
  //     3D sale con lo más parecido y la hoja lo dice en los diez idiomas sin desbordar, y al entrar se pide el
  //     resto (los 56 .bin); con «reducir movimiento», ni respira ni parpadea; sin WebGL 2, con el 3D apagado,
  //     sin el motor o sin un fichero de datos queda el dibujo, sin errores; y a 360 y 430 el lienzo cabe en la
  //     escena. Con eventos táctiles (el click de un dedo llega después de soltar: lección 7 de la maqueta)
  {
    const c22 = await contexto(b, { tresD: true, contexto: { hasTouch: true, isMobile: true } }), p22 = await c22.newPage(), e22 = [], pedidas = [];
    vigilar(p22, e22);
    p22.on('request', r => { if (/cuerpo3d/.test(r.url())) pedidas.push(r.url().replace(/^.*\/(modulos|datos)\//, '$1/')); });
    await abrirApp(p22); await abrirPerfilCuerpo(p22); await suCuerpo(p22);
    const t3 = () => p22.evaluate(() => { const t = TG_CUERPO.tresD(); return { estado: t.estado, vista: t.vista, lienzo: !!t.lienzo, lista: !!(t.lienzo && t.lienzo.classList.contains('lista')),
      es3d: document.getElementById('tgc-fig').classList.contains('es-3d'), pedidos: t.cargador ? t.cargador.pedidos().length : -1, asp: t.motor ? JSON.parse(JSON.stringify(t.motor.estado.asp)) : null,
      modo: t.motor && t.motor.estado.modo, angulo: t.motor && Math.round(t.motor.angulo()), cielo: t.motor && t.motor.estado.luz.cielo.map(x => +x.toFixed(2)), resp: t.motor && t.motor.estado.resp, sonr: t.motor && t.motor.estado.sonr }; });
    const activo = await p22.waitForFunction(() => ['activo', 'reserva'].includes(TG_CUERPO.tresD().estado), null, { timeout: 60000 }).then(() => true).catch(() => false);
    await p22.waitForTimeout(700);
    const a0 = await t3();
    prueba('con WebGL 2, el 3D se activa al abrir (el lienzo listo, la caja «es-3d»)', activo && a0.estado === 'activo' && a0.lienzo && a0.lista && a0.es3d, JSON.stringify(a0));
    const r22 = await p22.evaluate(() => { const f = document.getElementById('tgc-fig'), l = document.getElementById('tgc-lienzo'), rf = f.getBoundingClientRect(), rl = l.getBoundingClientRect(), re = document.getElementById('tgc-escena').getBoundingClientRect();
      return { dentro: l.parentNode === f && Math.abs(rl.width - rf.width) < 2 && Math.abs(rl.height - rf.height) < 2 && rl.bottom <= re.bottom + 1, dibujo: document.querySelectorAll('#tgc-cara svg').length, mini: document.querySelectorAll('#tgc-girar-mini svg').length,
        girar: Math.round(document.getElementById('tgc-girar').getBoundingClientRect().height), rol: l.getAttribute('role'), etiqueta: l.getAttribute('aria-label'), px: l.width + 'x' + l.height, css: Math.round(rl.width) + 'x' + Math.round(rl.height) }; });
    prueba('el lienzo ocupa la caja del personaje dentro de la escena; el dibujo y la vista pequeña de «Girar» se van, y «Girar» queda bajo (44 px)', r22.dentro && r22.dibujo === 0 && r22.mini === 0 && r22.girar === 44, JSON.stringify(r22));
    prueba('el lienzo es una imagen con la etiqueta del personaje («Su personaje, de frente» en «Músculos» sin nada anotado: «Sus músculos…»)', r22.rol === 'img' && /Sus músculos, de frente/.test(r22.etiqueta), r22.etiqueta);
    const bins = pedidas.filter(u => /\.bin$/.test(u)), tex = pedidas.filter(u => /\.(webp|png)$/.test(u));
    prueba('se piden el motor, el índice, las 6 piezas del aspecto por defecto (a1, pelo corto, zapatillas) y sus 8 texturas: 16 peticiones, nada de otras variantes ni peinados',
      pedidas.length === 16 && pedidas.includes('modulos/cuerpo3d.js') && pedidas.includes('datos/cuerpo3d/indice.json') && bins.length === 6 && tex.length === 8 && !pedidas.some(u => /-(a0|a2|b0|b1|b2)\.|pelo-(medio|largo|afro|coleta|trenzas)/.test(u)), pedidas.join(' '));
    const I22 = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, '..', 'datos', 'cuerpo3d', 'indice.json'), 'utf8'));
    const bytes = pedidas.filter(u => /datos\/cuerpo3d\/[^/]+\.[0-9a-f]{8}\./.test(u)).reduce((n, u) => { const f = Object.values(I22.ficheros).find(x => u.endsWith(x.f)); return n + (f ? f.bytes : 0); }, 0);
    prueba('lo que baja un aspecto: entre 0,7 y 0,9 MB (el índice aparte)', bytes > 700000 && bytes < 900000, bytes + ' bytes');
    /* el toque: un punto del lienzo que el motor diga que es el pecho (de frente); con el dedo */
    const punto = await p22.evaluate(() => { const t = TG_CUERPO.tresD(), l = t.lienzo, rc = l.getBoundingClientRect(), xs = [], ys = [];
      /* se mira el tercio de arriba del lienzo (la cabeza y el tronco), cada 6 px: cada toque son 17 rayos contra la malla */
      for (let y = Math.round(l.clientHeight * 0.12); y < l.clientHeight * 0.5; y += 6) for (let x = 10; x < l.clientWidth; x += 6) { const r = t.motor.toca(x, y); if (r && r.g === 'pecho') { xs.push(x); ys.push(y); } }
      /* el centro del pecho (la media de los puntos que el motor da por pecho), no su borde */
      return xs.length ? { x: rc.left + xs.reduce((a, b) => a + b) / xs.length, y: rc.top + ys.reduce((a, b) => a + b) / ys.length, n: xs.length } : null; });
    prueba('el motor encuentra el pecho de frente', !!punto, JSON.stringify(punto));
    if (punto) {
      await p22.touchscreen.tap(punto.x, punto.y); await p22.waitForTimeout(500);
      const h = await p22.evaluate(() => ({ abierta: !document.getElementById('tgc-hoja').hidden, tit: document.getElementById('tgc-hoja-tit').textContent, sel: TG_CUERPO.tresD().motor.estado.sel }));
      prueba('un toque con el dedo en el pecho abre su hoja y el motor lo marca (la hoja no recibe ese mismo toque)', h.abierta && h.tit === 'Pecho' && h.sel === 'pecho', JSON.stringify(h));
      await p22.click('#tgc-guardar'); await p22.waitForTimeout(350);
      const son = await t3();
      prueba('«+ 1 serie»: el personaje sonríe (la sonrisa sube de la de reposo)', son.sonr > 0.3, 'sonrisa ' + son.sonr);
      await p22.evaluate(() => document.getElementById('tgc-velo').click()); await p22.waitForTimeout(300);
      prueba('…y el velo cierra la hoja', await p22.evaluate(() => document.getElementById('tgc-hoja').hidden && TG_CUERPO.tresD().motor.estado.sel === null));
    }
    /* arrastrar: 120 px en horizontal con el dedo → unos 66° (0,55° por px), sin abrir la hoja; otros 120 → de espaldas */
    const centro = await p22.evaluate(() => { const r = TG_CUERPO.tresD().lienzo.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height * 0.45 }; });
    async function arrastra(dx) {
      const cdp = await c22.newCDPSession(p22);
      const pasos = 12, puntos = i => [{ x: centro.x + dx * i / pasos, y: centro.y }];
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: puntos(0) });
      for (let i = 1; i <= pasos; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: puntos(i) }); await p22.waitForTimeout(16); }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await cdp.detach();
    }
    await arrastra(120); await p22.waitForTimeout(600);
    const g1 = await t3(), hoja1 = await p22.evaluate(() => !document.getElementById('tgc-hoja').hidden);
    prueba('arrastrar 120 px con el dedo gira unos 66° (de frente aún) sin abrir ninguna hoja', g1.angulo > 50 && g1.angulo < 90 && g1.vista === 'frente' && !hoja1, g1.angulo + '° ' + g1.vista + ' hoja ' + hoja1);
    await arrastra(120); await p22.waitForTimeout(600);
    const g2 = await t3();
    prueba('otros 120: pasados los 90°, la vista es «de espaldas» y la etiqueta lo dice', Math.abs(g2.angulo) > 90 && g2.vista === 'espalda' && /de espaldas/.test(await p22.evaluate(() => TG_CUERPO.tresD().lienzo.getAttribute('aria-label'))), g2.angulo + '° ' + g2.vista);
    await p22.click('#tgc-girar'); await p22.waitForTimeout(1200);
    const g3 = await t3();
    prueba('«Girar» da la vuelta: de frente (0°) otra vez', g3.angulo === 0 && g3.vista === 'frente', g3.angulo + '° ' + g3.vista);
    await p22.click('#tgc-girar'); await p22.waitForTimeout(1200);
    const g4 = await t3();
    prueba('…y de espaldas (180°)', Math.abs(g4.angulo) === 180 && g4.vista === 'espalda', g4.angulo + '° ' + g4.vista);
    await p22.click('#tgc-girar'); await p22.waitForTimeout(1200);
    /* el tema cambia la luz; el modo, el barrido */
    const luzDia = a0.cielo;
    await p22.click('#tgc-tema'); await p22.waitForTimeout(400);
    const n1 = await t3();
    prueba('el tema Noche cambia la luz del personaje (el cielo, más oscuro)', n1.cielo[0] < luzDia[0] && n1.cielo[2] < luzDia[2], JSON.stringify([luzDia, n1.cielo]));
    await p22.click('#tgc-tema'); await p22.waitForTimeout(300);
    await p22.click('#tgc-modo-a'); await p22.waitForTimeout(300);
    const m1 = await t3();
    prueba('en «Aspecto», el motor pasa a «persona» (el personaje vestido)', m1.modo === 'persona' && m1.estado === 'activo', JSON.stringify(m1));
    /* en «Aspecto»: el audífono y la prótesis llegan al motor; un peinado nuevo pide sus dos ficheros antes de ponerse */
    await p22.evaluate(() => { document.getElementById('tgc-audifono-ambos').click(); document.getElementById('tgc-protesis-pierna_izq').click(); }); await p22.waitForTimeout(400);
    const as1 = await t3();
    prueba('el audífono en los dos oídos y la prótesis de pierna izquierda llegan al motor', as1.asp.audifono === 'ambos' && as1.asp.protesis === 'pierna_izq', JSON.stringify(as1.asp));
    const antes = pedidas.length;
    await p22.evaluate(() => document.getElementById('tgc-pelo-trenzas').click());
    await p22.waitForFunction(() => TG_CUERPO.tresD().motor.estado.asp.pelo === 'trenzas', null, { timeout: 20000 }).catch(() => {});
    await p22.waitForTimeout(300);
    const as2 = await t3(), nuevos = pedidas.slice(antes).filter(u => /pelo-trenzas/.test(u));
    prueba('las trenzas: se piden sus dos ficheros (el común y el de la variante a1) y después se ponen', as2.asp.pelo === 'trenzas' && nuevos.length === 2 && nuevos.some(u => /pelo-trenzas\.[0-9a-f]{8}\.bin$/.test(u)) && nuevos.some(u => /pelo-trenzas-a1\./.test(u)), JSON.stringify(nuevos));
    await p22.evaluate(() => { document.getElementById('tgc-pelo-rizado').click(); document.getElementById('tgc-calzado-botas').click(); });
    await p22.waitForFunction(() => TG_CUERPO.tresD().motor.estado.asp.pelo === 'afro', null, { timeout: 20000 }).catch(() => {});
    await p22.waitForTimeout(200);
    const as3 = await t3(), aviso = await p22.evaluate(() => { const a = document.getElementById('tgc-aviso-3d'); return { visible: !!a && !a.hidden && a.getClientRects().length > 0, txt: a && a.textContent }; });
    prueba('lo que no está en 3D sale con lo más parecido (rizado → afro; botas → zapatillas) y la hoja «Aspecto» lo dice', as3.asp.pelo === 'afro' && as3.asp.calzado === 'zapatillas' && aviso.visible && /rizado/.test(aviso.txt), JSON.stringify(as3.asp) + ' ' + JSON.stringify(aviso));
    const desb = [];
    for (const l of ['es', 'en', 'fr', 'de', 'it', 'nl', 'zh', 'zht', 'bg', 'pl']) {
      await idioma(p22, l); await p22.waitForTimeout(80);
      const r = await p22.evaluate(() => { const a = document.getElementById('tgc-aviso-3d'), p = document.getElementById('cuerpo-panel'), b = p.getBoundingClientRect(), x = a.getBoundingClientRect(); return { vacio: !a.textContent.trim(), fuera: x.right > b.right + 0.5 || x.left < b.left - 0.5, lado: p.scrollWidth > p.clientWidth, lang: p.getAttribute('lang') }; });
      if (r.vacio || r.fuera || r.lado) desb.push(l + ': ' + JSON.stringify(r));
    }
    await idioma(p22, 'es');
    prueba('el aviso del 3D, en los diez idiomas, sin quedar vacío ni desbordar', desb.length === 0, desb.join(' · '));
    /* al entrar en «Aspecto» se pide el resto: los 56 .bin (las texturas las pide el navegador aparte) */
    const todos = await p22.waitForFunction(() => TG_CUERPO.tresD().cargador.pedidos().length >= 56, null, { timeout: 60000 }).then(() => true).catch(() => false);
    const as4 = await t3();
    prueba('al entrar en «Aspecto» se pide el resto de los datos: los 56 ficheros de mallas', todos && as4.pedidos === 56, as4.pedidos + ' pedidos');
    await p22.evaluate(() => document.getElementById('tgc-comp-2').click()); await p22.waitForTimeout(400);
    const as5 = await t3();
    prueba('con todo ya pedido, cambiar de complexión se pone en el acto (variante a2)', as5.asp.comp === 2 && as5.asp.fig === 'a' && JSON.stringify(await p22.evaluate(() => TG_CUERPO.tresD().motor.tiene().variante)) === '"a2"', JSON.stringify(as5.asp));
    await p22.click('#tgc-modo-m'); await p22.waitForTimeout(300);
    prueba('vuelta a «Músculos»: el motor en «musculos»', (await t3()).modo === 'musculos');
    prueba('…sin errores de página en todo el recorrido en 3D', e22.length === 0, e22.join(' | '));
    await c22.close();

    /* con «reducir movimiento»: ni respira ni parpadea (vivo apagado) */
    const c22b = await contexto(b, { tresD: true, contexto: { reducedMotion: 'reduce' } }), p22b = await c22b.newPage(), e22b = []; vigilar(p22b, e22b);
    await abrirApp(p22b); await abrirPerfilCuerpo(p22b); await suCuerpo(p22b);
    await p22b.waitForFunction(() => ['activo', 'reserva'].includes(TG_CUERPO.tresD().estado), null, { timeout: 60000 }).catch(() => {});
    await p22b.waitForTimeout(1500);
    const q = await p22b.evaluate(() => { const t = TG_CUERPO.tresD(); return { estado: t.estado, resp: t.motor && t.motor.estado.resp, parp: t.motor && t.motor.estado.parp }; });
    prueba('con «reducir movimiento», el 3D está pero quieto: sin respiración ni parpadeo', q.estado === 'activo' && q.resp === 0 && q.parp === 0 && e22b.length === 0, JSON.stringify(q) + ' ' + e22b.join(' | '));
    await c22b.close();

    /* sin WebGL 2 (el contexto no se da), con el 3D apagado, sin el motor y sin un fichero de datos: el dibujo, sin errores */
    const casos = [
      ['sin WebGL 2', { tresD: true }, () => { const g = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (t) { return t === 'webgl2' ? null : g.apply(this, arguments); }; }, 'no', 0],
      ['con el 3D apagado (tenerife.cuerpo.3d = «no»)', {}, null, 'no', 0],
      ['sin el motor (modulos/cuerpo3d.js no llega)', { tresD: true, corta: /modulos\/cuerpo3d\.js/ }, null, 'no', 1],
      ['sin un fichero de datos (cuerpo-a1 no llega)', { tresD: true, corta: /cuerpo-a1\./ }, null, 'no', -1],
      /* (8-11-2026) una textura que no llega: antes el 3D se quedaba «cargando» toda la sesión (listo() no avisaba
         nunca) y al volver a abrir no se intentaba otra vez */
      ['sin una textura (la del ojo no llega)', { tresD: true, corta: /tex-ojo\./ }, null, 'no', -1]
    ];
    for (const [nombre, opc, prep, estadoQueToca, nPed] of casos) {
      const cx = await contexto(b, opc), px = await cx.newPage(), ex = [], ped = []; vigilar(px, ex);
      px.on('request', r => { if (/cuerpo3d/.test(r.url())) ped.push(r.url()); });
      if (prep) await px.addInitScript(prep);
      await abrirApp(px); await abrirPerfilCuerpo(px); await suCuerpo(px);
      /* (cuando el motor o los datos no llegan, el estado vuelve a «no»: se volverá a intentar al abrir otra vez) */
      await px.waitForFunction(() => TG_CUERPO.tresD().estado !== 'cargando', null, { timeout: 30000 }).catch(() => {});
      await px.waitForTimeout(nPed ? 1500 : 800);
      const r = await px.evaluate(() => { const t = TG_CUERPO.tresD(); return { estado: t.estado, lienzo: !!document.getElementById('tgc-lienzo'), dibujo: document.querySelectorAll('#tgc-cara svg').length, cabeza: document.querySelectorAll('#tgc-cara .tgf-cabeza').length, mini: document.querySelectorAll('#tgc-girar-mini svg').length, es3d: document.getElementById('tgc-fig').classList.contains('es-3d') }; });
      const bien = r.estado === estadoQueToca && !r.lienzo && r.dibujo === 1 && r.cabeza === 1 && r.mini === 1 && !r.es3d && (nPed < 0 ? ped.length > 1 : ped.length === nPed) && ex.filter(e => !/cuerpo3d/.test(e)).length === 0;
      prueba(nombre + ': queda el dibujo (con su cabeza y la vista pequeña), sin lienzo y sin errores', bien, JSON.stringify(r) + ' peticiones ' + ped.length + ' ' + ex.join(' | '));
      if (nPed) {
        /* cerrar y volver a abrir lo intenta otra vez (y vuelve a fallar igual, sin ruido) */
        const antes = ped.length;
        await px.evaluate(() => TG_CUERPO.cerrar()); await px.waitForTimeout(200);
        await px.evaluate(() => TG_CUERPO.abrir());
        await px.waitForFunction(() => TG_CUERPO.tresD().estado !== 'cargando', null, { timeout: 30000 }).catch(() => {});
        await px.waitForTimeout(800);
        const r2 = await px.evaluate(() => ({ estado: TG_CUERPO.tresD().estado, dibujo: document.querySelectorAll('#tgc-cara svg').length }));
        prueba(nombre + ': al abrir otra vez se vuelve a intentar, y queda el dibujo igual', ped.length > antes && r2.estado === 'no' && r2.dibujo === 1 && ex.filter(e => !/cuerpo3d/.test(e)).length === 0, JSON.stringify(r2) + ' peticiones ' + antes + '→' + ped.length);
      }
      await cx.close();
    }

    /* a 360 y 430: el lienzo cabe en la escena, sin desborde */
    for (const w of [360, 430]) {
      const cw = await contexto(b, { tresD: true, contexto: { viewport: { width: w, height: 800 } } }), pw = await cw.newPage(), ew = []; vigilar(pw, ew);
      await abrirApp(pw); await abrirPerfilCuerpo(pw); await suCuerpo(pw);
      await pw.waitForFunction(() => ['activo', 'reserva'].includes(TG_CUERPO.tresD().estado), null, { timeout: 60000 }).catch(() => {});
      await pw.waitForTimeout(800);
      const r = await pw.evaluate(() => { const t = TG_CUERPO.tresD(), l = t.lienzo, p = document.getElementById('cuerpo-panel'), re = document.getElementById('tgc-escena').getBoundingClientRect(), rl = l ? l.getBoundingClientRect() : null;
        return { estado: t.estado, dentro: !!rl && rl.left >= re.left && rl.right <= re.right && rl.top >= re.top && rl.bottom <= re.bottom + 1, alto: rl && Math.round(rl.height), lado: p.scrollWidth > p.clientWidth }; });
      prueba('a ' + w + ' px: el 3D activo, el lienzo dentro de la escena (' + r.alto + ' px de alto) y sin desplazamiento de lado', r.estado === 'activo' && r.dentro && r.alto > 300 && !r.lado && ew.length === 0, JSON.stringify(r) + ' ' + ew.join(' | '));
      await cw.close();
    }

    /* el cargador, con un fichero cambiado (7-11-2026): un índice y dos .bin hechos aquí, con su suma bien puesta, en
       los que van, junto a secciones buenas, otras con nombres que empaqueta3d.py no escribe («__proto__.tri»,
       «constructor.tri», «cuerpo.__proto__», «gestos.__proto__.parp.i», «partes.__proto__»…). Las buenas llegan;
       las otras se dejan, y nada se escribe en Object.prototype ni en Object */
    {
      const ck = await contexto(b, { tresD: true }), pk = await ck.newPage(), ek = []; vigilar(pk, ek);
      const tg3d = (f, secs) => {
        let pos = 0; const cab = [], trozos = [];
        for (const [n, lon] of secs) { const t = Buffer.alloc(lon + (-lon & 3)); for (let i = 0; i < lon; i++) t[i] = i + 1; cab.push([n, pos, lon]); trozos.push(t); pos += t.length; }
        let h = Buffer.from(JSON.stringify({ v: 1, f, sec: cab }), 'utf8'); h = Buffer.concat([h, Buffer.alloc(-h.length & 3, 0x20)]);
        const l = Buffer.alloc(4); l.writeUInt32LE(h.length, 0);
        return Buffer.concat([Buffer.from('TG3D'), l, h, ...trozos]);
      };
      const binK = {
        cuerpo: tg3d('cuerpo', [['__proto__.tri', 4], ['constructor.tri', 4], ['hasOwnProperty.tri', 4], ['cuerpo.__proto__', 4], ['cuerpo.constructor', 4], ['cuerpo.tri', 8],
          ['gestos.__proto__.parp.i', 4], ['gestos.cuerpo.__proto__.i', 4], ['gestos.cuerpo.parp.__proto__', 4], ['gestos.cuerpo.parp.i', 4], ['gestos.cuerpo.parp.d', 12],
          ['partes.__proto__', 4], ['partes.constructor', 4], ['partes.cuero', 4]]),
        'cuerpo-a1': tg3d('cuerpo-a1', [['__proto__.pos', 4], ['cuerpo.pos', 12]])
      };
      const sumaK = x => require('crypto').createHash('sha256').update(x).digest('hex');
      const fichK = {}; for (const [k, x] of Object.entries(binK)) fichK[k] = { f: k + '.' + sumaK(x).slice(0, 8) + '.bin', bytes: x.length, sha256: sumaK(x) };
      const indK = { v: 1, variantes: ['a1'], alto: {}, media: {}, hitos: {}, musculos: [], grupos: [], partes: ['cuero'], gestos: { cuerpo: { parp: { s: 1, n: 2 } } },
        mallas: { cuerpo: { nv: 1, nt: 1, ns: 1, q: [1, 0, 0, 0], mat: 'piel', fich: 'cuerpo', fichVar: 'cuerpo-{v}' } }, tex: {}, ficheros: fichK };
      await pk.route(/\/prueba-cargador\//, r => {
        const u = r.request().url();
        if (/indice\.json$/.test(u)) return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(indK) });
        const k = Object.keys(fichK).find(k => u.endsWith('/' + fichK[k].f));
        return k ? r.fulfill({ status: 200, contentType: 'application/octet-stream', body: binK[k] }) : r.fulfill({ status: 404, body: '' });
      });
      await abrirApp(pk); await abrirPerfilCuerpo(pk); await suCuerpo(pk);
      await pk.waitForFunction(() => !!window.TG_CUERPO3D, null, { timeout: 60000 }).catch(() => {});
      const rk = await pk.evaluate(async () => {
        const c = TG_CUERPO3D.cargador('prueba-cargador/'); let error = null;
        try { await c.indice(); await c.piezas({ fig: 'a', comp: 1, pelo: 'calvo', calzado: 'descalzo' }); } catch (e) { error = String(e && e.message || e); }
        const D = c.datos(), o = {}, propio = (x, k) => Object.prototype.hasOwnProperty.call(x, k);
        return { error, seguro: window.isSecureContext,
          fuera: ['tri', 'pos', 'parp', 'i', 'd', 'cuero', 'nv'].filter(k => k in o).concat(['tri', 'pos'].filter(k => propio(Object, k) || propio(Object.prototype.hasOwnProperty, k))),
          protos: [D.mallas, D.mallas.cuerpo, D.gestos, D.partes, D.mallas.cuerpo.pos].every(x => Object.getPrototypeOf(x) === Object.prototype),
          raras: ['constructor', '__proto__'].filter(k => propio(D.mallas.cuerpo, k) || propio(D.partes, k) || propio(D.gestos, k) || (D.gestos.cuerpo && propio(D.gestos.cuerpo, k)) || (D.gestos.cuerpo && D.gestos.cuerpo.parp && propio(D.gestos.cuerpo.parp, k))),
          buenas: [D.mallas.cuerpo.tri && D.mallas.cuerpo.tri.length, D.mallas.cuerpo.pos.a1 && D.mallas.cuerpo.pos.a1.length, D.gestos.cuerpo && D.gestos.cuerpo.parp && D.gestos.cuerpo.parp.i.length,
            D.gestos.cuerpo && D.gestos.cuerpo.parp && D.gestos.cuerpo.parp.d.length, D.gestos.cuerpo && D.gestos.cuerpo.parp && D.gestos.cuerpo.parp.s, D.partes.cuero && D.partes.cuero.length].join(','),
          partes: Object.keys(D.partes).join(','), pedidos: c.pedidos().join(',') };
      });
      prueba('el cargador, con secciones de nombre raro («__proto__.tri», «constructor.tri», «gestos.__proto__.parp.i», «partes.__proto__»…): las buenas llegan y las otras se dejan, sin escribir en Object.prototype ni en Object',
        rk.error === null && rk.seguro && rk.fuera.length === 0 && rk.protos && rk.raras.length === 0 && rk.buenas === '8,12,4,12,1,4' && rk.partes === 'cuero' && rk.pedidos === 'cuerpo,cuerpo-a1' && ek.length === 0,
        JSON.stringify(rk) + ' ' + ek.join(' | '));
      await ck.close();
    }

    /* el mapa de músculos en WebKit (7-11-2026): va a la tarjeta con los bytes que lee el toque (guardaIds: <img> y un
       lienzo 2D de lectura, el camino que WebKit lee exacto), nunca con la imagen misma ni con createImageBitmap, que
       en WebKit cambiaba un PNG gris en ±2 (el relieve, 1-11-2026). Esta prueba corre en Chromium, que no lo ve: se
       mira el código */
    {
      const motor = require('fs').readFileSync(require('path').join(__dirname, '..', 'modulos', 'cuerpo3d.js'), 'utf8');
      const r = {
        bytes: /if \(clave === 'mus_id'\) \{\s*guardaIds\(im\);[^}]*gl\.texImage2D\(gl\.TEXTURE_2D, 0, gl\.R8, IDS\.w, IDS\.h, 0, gl\.RED, gl\.UNSIGNED_BYTE, IDS\.d\)/.test(motor),
        lectura: /function guardaIds\(im\) \{[^}]*getContext\('2d', \{ willReadFrequently: true \}\)/.test(motor),
        imagenBitmap: /\bcreateImageBitmap\s*\(/.test(motor)
      };
      prueba('el mapa de músculos va a la tarjeta con los bytes que lee el toque, de un lienzo de lectura, y no con la imagen ni con createImageBitmap (WebKit)',
        r.bytes && r.lectura && !r.imagenBitmap, JSON.stringify(r));
    }

    /* (8-11-2026) ninguna llamada de dibujo del 3D rechazada por WebGL, tampoco en el primer cuadro. Antes, el primer
       cuadro daba tres INVALID_OPERATION («Mismatch between texture format and sampler type»): la textura de la sombra
       se quedaba en la unidad 0, la que lee uTex, y una textura nueva se creaba en la unidad activa, la 7, pisando la
       sombra. Ahora la sombra vive en la 7 y las texturas se crean en la 6, que ningún sombreador lee. Se cuenta
       getError() tras cada llamada de dibujo del lienzo del 3D (el del mapa no cuenta). Pasa cuando el cuerpo llega
       antes que el resto de las piezas, como por la red de un móvil: el primer cuadro pide entonces las texturas a
       mitad del dibujo. Aquí todo llega a la vez y aspecto() las pide antes, en la 0; por eso el pelo y las zapatillas
       se retrasan 1,5 s (sin el retraso, el motor de antes también salía en verde) */
    {
      const cg = await contexto(b, { tresD: true }), pg = await cg.newPage(), eg = []; vigilar(pg, eg);
      await pg.route(/\/datos\/cuerpo3d\/(pelo|zapatillas)[^/]*\.bin$/, async r => { await new Promise(res => setTimeout(res, 1500)); return r.continue(); });
      await pg.addInitScript(() => {
        const P = WebGL2RenderingContext.prototype; window.__gl3d = { llamadas: 0, mal: [] };
        for (const n of ['drawElements', 'drawArrays']) {
          const o = P[n];
          P[n] = function () {
            const r = o.apply(this, arguments);
            if (this.canvas && this.canvas.id === 'tgc-lienzo') {
              const g = window.__gl3d, e = this.getError(); g.llamadas++;
              if (e && g.mal.length < 10) g.mal.push(n + ' n.º ' + g.llamadas + ': ' + e);
            }
            return r;
          };
        }
      });
      await abrirApp(pg); await abrirPerfilCuerpo(pg); await suCuerpo(pg);
      await pg.waitForFunction(() => ['activo', 'reserva'].includes(TG_CUERPO.tresD().estado), null, { timeout: 60000 }).catch(() => {});
      await pg.waitForTimeout(1000);
      const rg = await pg.evaluate(() => ({ estado: TG_CUERPO.tresD().estado, llamadas: window.__gl3d.llamadas, mal: window.__gl3d.mal }));
      prueba('ninguna llamada de dibujo del 3D rechazada por WebGL, tampoco en el primer cuadro (la sombra en su unidad; las texturas nuevas, en otra)',
        rg.estado === 'activo' && rg.llamadas > 20 && rg.mal.length === 0 && eg.length === 0, JSON.stringify(rg) + ' ' + eg.join(' | '));
      await cg.close();
    }
  }

  // 23. (7-11-2026, bloque 4) la semana: las tres metas (días con fuerza de 2, minutos de movimiento de 150 y
  //     grupos de 12; de 5 a 17 años, 3 y 420) y «Anotar movimiento»: su hoja (qué ha hecho, los minutos ±5 o
  //     escritos, los km ±0,5 o escritos con coma, de los cinco tipos; hoy o ayer), «Anotar» guarda en
  //     tenerife.cuerpo (mov), cierra y avisa con «Deshacer»; lo último anotado con ×; los días con movimiento
  //     llevan su punto y encienden su rayo; el detalle del día dice minutos y km; Escape, «atrás» y el velo
  //     cierran la hoja; lo guardado roto se descarta campo a campo; «Borrar los datos» lo borra; el asistente
  //     cuenta el movimiento en «¿Cómo voy esta semana?»; y los textos nuevos, en los diez idiomas.
  //     (8-11-2026) Nadar y bici también suman km (Jerome: «Cuentan también»); antes, solo a pie
  {
    const c23 = await contexto(b), p23 = await c23.newPage(), e23 = []; vigilar(p23, e23);
    await abrirApp(p23); await abrirPerfilCuerpo(p23); await suCuerpo(p23);
    await ejemplo(p23);
    /* el ejemplo, con movimiento: hoy 35 min y 3 km caminando; hace 3, una caminata larga sin series; hace 5, a nado, 1 km */
    const conMov = async () => {
      await p23.evaluate(() => {
        const ymd = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        const hace = n => { const d = new Date(); d.setDate(d.getDate() - n); return ymd(d); };
        const g = JSON.parse(localStorage.getItem('tenerife.cuerpo')), t = Date.now() - 5e5;
        g.mov = [{ d: hace(0), tipo: 'caminar', min: 35, km: 3, t: t }, { d: hace(3), tipo: 'senderismo', min: 150, km: 9.5, t: t + 1 }, { d: hace(5), tipo: 'nadar', min: 30, km: 1, t: t + 2 }];
        localStorage.setItem('tenerife.cuerpo', JSON.stringify(g)); TG_CUERPO.abrir();
      });
      await p23.waitForTimeout(250);
    };
    await conMov();
    const metaDe = (pg, id) => pg.evaluate(id => { const m = document.getElementById('tgc-meta-' + id); return { n: m.querySelector('.tgc-meta-n b').textContent, de: m.querySelector('.tgc-meta-de').textContent, hecha: m.classList.contains('hecha'), raya: m.querySelector('.tgc-meta-raya i').style.width }; }, id);
    const r23 = await p23.evaluate(() => ({
      rayos: [...document.querySelectorAll('#tgc-cielo .tgc-rayo')].map(r => r.getAttribute('opacity') === '1' ? 1 : 0).join(''),
      conMov: [...document.querySelectorAll('#tgc-dias7 .tgc-dia')].map(b => b.classList.contains('con-mov') ? 1 : 0).join(''),
      hoy: document.getElementById('tgc-dia-txt').textContent, hoyG: document.getElementById('tgc-dia-grupos').textContent,
      ariaHoy: document.querySelector('#tgc-dias7 li:nth-child(7) .tgc-dia').getAttribute('aria-label'),
      ariaHace3: document.querySelector('#tgc-dias7 li:nth-child(4) .tgc-dia').getAttribute('aria-label'),
      leyenda: document.getElementById('tgc-dias7').getAttribute('aria-label'), pista: document.getElementById('tgc-pista').hidden,
      reco: document.getElementById('tgc-reco-mov').textContent, cifras: document.getElementById('tgc-cifras-mov').textContent
    }));
    const m23 = await metaDe(p23, 'mov');
    prueba('movimiento: 215 de 150 min, cumplida, con la raya llena', m23.n === '215' && m23.de === 'de 150 min de movimiento' && m23.hecha && m23.raya === '100%', JSON.stringify(m23));
    prueba('el sol: los siete rayos, también los de los días que solo tienen movimiento (hace 3 y hace 5)', r23.rayos === '1111111', r23.rayos);
    prueba('la semana: el punto del movimiento en hoy, hace 3 y hace 5', r23.conMov === '0101001', r23.conMov);
    prueba('hoy: «10 series · 35 min y 3 km», con sus grupos y «Caminar»', /: 10 series · 35 min y 3 km$/.test(r23.hoy) && r23.hoyG === 'Pecho, Hombros, Tríceps · Caminar' && r23.ariaHoy === r23.hoy, r23.hoy + ' | ' + r23.hoyG);
    prueba('hace 3 días, solo movimiento: «150 min y 9,5 km» (sin «0 series»)', /: 150 min y 9,5 km$/.test(r23.ariaHace3), r23.ariaHace3);
    await p23.click('#tgc-dias7 li:nth-child(4) .tgc-dia'); await p23.waitForTimeout(80);
    prueba('…y al tocarlo, debajo dice «Senderismo»', await p23.evaluate(() => document.getElementById('tgc-dia-grupos').textContent === 'Senderismo' && /150 min y 9,5 km$/.test(document.getElementById('tgc-dia-txt').textContent)));
    prueba('la leyenda de la semana nombra las series y el movimiento; la recomendación del movimiento (OMS, 150 a 300) en la caja y en «Las cifras»', /series y el movimiento/.test(r23.leyenda) && /150 a 300/.test(r23.reco) && r23.cifras === r23.reco && r23.pista, JSON.stringify(r23));

    /* la hoja */
    await p23.click('#tgc-mov-btn'); await p23.waitForTimeout(350);
    const h23 = await p23.evaluate(() => ({
      abierta: !document.getElementById('tgc-hoja').hidden && !document.getElementById('tgc-pag-mov').hidden && document.getElementById('tgc-pag-grupo').hidden,
      etiqueta: document.getElementById('tgc-hoja').getAttribute('aria-labelledby'), foco: document.activeElement && document.activeElement.id,
      tit: document.getElementById('tgc-mov-tit').textContent, lema: document.getElementById('tgc-mov-lema').textContent,
      tipos: [...document.querySelectorAll('#tgc-mov-tipos .tgc-tipo')].map(b => b.dataset.tipo + ':' + b.getAttribute('aria-pressed') + ':' + b.textContent.trim() + ':' + (b.querySelector('svg') ? 1 : 0)).join(','),
      min: document.getElementById('tgc-mov-min').value, km: document.getElementById('tgc-mov-km').value, kmFila: document.getElementById('tgc-mov-km-fila').hidden, kmL: document.getElementById('tgc-mov-km-l').textContent,
      hoy: document.getElementById('tgc-mov-hoy').getAttribute('aria-pressed'), boton: document.getElementById('tgc-mov-guardar-txt').textContent, nota: document.getElementById('tgc-mov-nota').textContent,
      hist: [...document.querySelectorAll('#tgc-mov-hist .tgc-hist-fila')].map(li => li.querySelector('.tgc-hist-n').textContent).join(' | '), inerte: document.getElementById('tgc').inert,
      estado: JSON.stringify(history.state)
    }));
    prueba('«Anotar movimiento» abre su página de la hoja, con el foco en el título y su entrada en el historial', h23.abierta && h23.etiqueta === 'tgc-mov-tit' && h23.foco === 'tgc-mov-tit' && h23.inerte && h23.estado === '{"tgPerfil":1,"tgCuerpo":1,"tgCuerpoHoja":1,"tgCuerpoMov":1}', JSON.stringify(h23));
    prueba('la hoja: el título, la frase, los cinco tipos con su icono (Caminar elegido), 30 min, 2,5 km, hoy, y el botón dice lo que va a anotar', h23.tit === 'Anotar movimiento' && /lo que haga en la isla cuenta/.test(h23.lema)
      && h23.tipos === 'caminar:true:Caminar:1,senderismo:false:Senderismo:1,correr:false:Correr:1,nadar:false:Nadar:1,bici:false:Bici:1' && h23.min === '30' && h23.km === '2,5' && !h23.kmFila && h23.kmL === 'Kilómetros' && h23.hoy === 'true'
      && h23.boton === 'Anotar 30 min y 2,5 km' && h23.nota === 'Todo suma minutos y kilómetros a su semana.', JSON.stringify(h23));
    prueba('lo último anotado: las tres, de hoy hacia atrás, con el tipo, los minutos y los km', h23.hist === 'Caminar · 35 min y 3 km | Senderismo · 150 min y 9,5 km | Nadar · 30 min y 1 km', h23.hist);
    await p23.click('#tgc-mov-tipos .tgc-tipo[data-tipo="nadar"]'); await p23.waitForTimeout(60);
    const hojaMov = () => p23.evaluate(() => ({ kmFila: document.getElementById('tgc-mov-km-fila').hidden, min: document.getElementById('tgc-mov-min').value, km: document.getElementById('tgc-mov-km').value, menos: document.getElementById('tgc-mov-km-menos').disabled,
      boton: document.getElementById('tgc-mov-guardar-txt').textContent, pulsado: document.querySelector('#tgc-mov-tipos .tgc-tipo[aria-pressed="true"]').dataset.tipo }));
    /* los km se escriben solo si su campo se ve: sin él, la prueba sale en rojo y no se para */
    const escribeKm = async v => { if (await p23.isVisible('#tgc-mov-km')) { await p23.fill('#tgc-mov-km', v); await p23.dispatchEvent('#tgc-mov-km', 'change'); } await p23.waitForTimeout(60); };
    const n23 = await hojaMov();
    prueba('Nadar: con el campo de los kilómetros (desde el 8-11-2026), en 0 y con «−» apagado, 30 min, y el botón solo dice los minutos', !n23.kmFila && n23.km === '0' && n23.menos && n23.min === '30' && n23.boton === 'Anotar 30 min' && n23.pulsado === 'nadar', JSON.stringify(n23));
    await p23.click('#tgc-mov-tipos .tgc-tipo[data-tipo="bici"]'); await p23.waitForTimeout(60);
    const bi23 = await hojaMov();
    await escribeKm('42,5');
    const bk23 = await hojaMov();
    prueba('Bici: con el campo de los kilómetros, en 0, 60 min; escritos 42,5 km, el botón los dice', !bi23.kmFila && bi23.km === '0' && bi23.min === '60' && bi23.boton === 'Anotar 60 min' && bi23.pulsado === 'bici'
      && !bk23.kmFila && bk23.km === '42,5' && !bk23.menos && bk23.boton === 'Anotar 60 min y 42,5 km', JSON.stringify([bi23, bk23]));
    await p23.click('#tgc-mov-tipos .tgc-tipo[data-tipo="senderismo"]'); await p23.waitForTimeout(60);
    const s23 = await p23.evaluate(() => ({ min: document.getElementById('tgc-mov-min').value, km: document.getElementById('tgc-mov-km').value, kmFila: document.getElementById('tgc-mov-km-fila').hidden }));
    prueba('Senderismo propone 120 min y 8 km', s23.min === '120' && s23.km === '8' && !s23.kmFila, JSON.stringify(s23));
    await p23.click('#tgc-mov-min-mas'); await p23.click('#tgc-mov-km-menos'); await p23.waitForTimeout(60);
    const pm23 = await p23.evaluate(() => ({ min: document.getElementById('tgc-mov-min').value, km: document.getElementById('tgc-mov-km').value, boton: document.getElementById('tgc-mov-guardar-txt').textContent }));
    prueba('«+» suma 5 minutos y «−» quita medio kilómetro: 125 min y 7,5 km', pm23.min === '125' && pm23.km === '7,5' && pm23.boton === 'Anotar 125 min y 7,5 km', JSON.stringify(pm23));
    await p23.fill('#tgc-mov-min', '7'); await p23.dispatchEvent('#tgc-mov-min', 'change');
    await p23.fill('#tgc-mov-km', '4,25'); await p23.dispatchEvent('#tgc-mov-km', 'change'); await p23.waitForTimeout(60);
    const esc23 = await p23.evaluate(() => ({ min: document.getElementById('tgc-mov-min').value, km: document.getElementById('tgc-mov-km').value }));
    prueba('escritos a mano: 7 minutos, y «4,25» km (con coma) queda en 4,3', esc23.min === '7' && esc23.km === '4,3', JSON.stringify(esc23));
    await p23.fill('#tgc-mov-min', '0'); await p23.dispatchEvent('#tgc-mov-min', 'change'); await p23.fill('#tgc-mov-km', 'abc'); await p23.dispatchEvent('#tgc-mov-km', 'change'); await p23.waitForTimeout(60);
    const mal23 = await p23.evaluate(() => ({ min: document.getElementById('tgc-mov-min').value, km: document.getElementById('tgc-mov-km').value }));
    prueba('un 0 en los minutos o letras en los km no valen: se queda lo de antes', mal23.min === '7' && mal23.km === '4,3', JSON.stringify(mal23));
    await p23.click('#tgc-mov-ayer'); await p23.waitForTimeout(60);
    prueba('«Ayer» se marca', await p23.evaluate(() => document.getElementById('tgc-mov-ayer').getAttribute('aria-pressed') === 'true' && document.getElementById('tgc-mov-hoy').getAttribute('aria-pressed') === 'false'));
    await p23.click('#tgc-mov-guardar'); await p23.waitForTimeout(450);
    const g23 = await p23.evaluate(() => {
      const ymd = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      const ayer = new Date(); ayer.setDate(ayer.getDate() - 1);
      const m = TG_CUERPO.estado().mov, u = m[m.length - 1], g = JSON.parse(localStorage.getItem('tenerife.cuerpo'));
      return { n: m.length, u: u && [u.tipo, u.min, u.km, u.d === ymd(ayer), u.t > 0].join(','), guardado: g.mov.length, cerrada: document.getElementById('tgc-hoja').hidden && !document.getElementById('tgc').inert,
        toast: document.getElementById('tgc-toast-txt').textContent, deshacer: document.getElementById('tgc-toast-btn').textContent, min: document.getElementById('tgc-st-min').textContent, estado: JSON.stringify(history.state) };
    });
    prueba('«Anotar» guarda ayer (senderismo, 7 min, 4,3 km) en tenerife.cuerpo, cierra la hoja y avisa con «Deshacer»', g23.n === 4 && g23.u === 'senderismo,7,4.3,true,true' && g23.guardado === 4 && g23.cerrada && g23.toast === 'Senderismo: 7 min y 4,3 km anotados' && g23.deshacer === 'Deshacer' && g23.min === '222' && g23.estado === '{"tgPerfil":1,"tgCuerpo":1}', JSON.stringify(g23));
    await p23.click('#tgc-toast-btn'); await p23.waitForTimeout(150);
    prueba('«Deshacer» quita lo anotado y las metas vuelven (215)', await p23.evaluate(() => TG_CUERPO.estado().mov.length === 3 && JSON.parse(localStorage.getItem('tenerife.cuerpo')).mov.length === 3 && document.getElementById('tgc-st-min').textContent === '215'));
    /* (8-11-2026) en bici, hoy, 60 min y 42,5 km: se guardan los km y suman al día */
    await p23.click('#tgc-mov-btn'); await p23.waitForTimeout(300);
    await p23.click('#tgc-mov-tipos .tgc-tipo[data-tipo="bici"]'); await p23.click('#tgc-mov-hoy'); await p23.waitForTimeout(60);
    await escribeKm('42,5');
    await p23.click('#tgc-mov-guardar'); await p23.waitForTimeout(450);
    const b23 = await p23.evaluate(() => {
      const m = TG_CUERPO.estado().mov, u = m[m.length - 1], g = JSON.parse(localStorage.getItem('tenerife.cuerpo'));
      return { n: m.length, u: u && [u.tipo, u.min, u.km].join(','), guardado: g.mov.length && g.mov[g.mov.length - 1].km, toast: document.getElementById('tgc-toast-txt').textContent,
        min: document.getElementById('tgc-st-min').textContent, hoy: document.querySelector('#tgc-dias7 li:nth-child(7) .tgc-dia').getAttribute('aria-label') };
    });
    prueba('en bici también se guardan los km: bici, 60 min y 42,5 km; avisa «Bici: 60 min y 42,5 km anotados» y hoy dice «10 series · 95 min y 45,5 km»', b23.n === 4 && b23.u === 'bici,60,42.5' && b23.guardado === 42.5
      && b23.toast === 'Bici: 60 min y 42,5 km anotados' && b23.min === '275' && /: 10 series · 95 min y 45,5 km$/.test(b23.hoy), JSON.stringify(b23));
    await p23.click('#tgc-toast-btn'); await p23.waitForTimeout(150);
    prueba('…y «Deshacer» la quita (215)', await p23.evaluate(() => TG_CUERPO.estado().mov.length === 3 && JSON.parse(localStorage.getItem('tenerife.cuerpo')).mov.length === 3 && document.getElementById('tgc-st-min').textContent === '215'));

    /* (8-11-2026) escrita una cifra, el primer toque en otro tipo entra: al salir del campo («change») se redibujaba
       la hoja entera y el botón tocado desaparecía. Y lo escrito se toma al escribirlo («input»): «Anotar» lo guarda
       aunque no haya «change», por si el navegador no saca del campo al tocar un botón */
    const tipoMov = () => p23.evaluate(() => ({ pulsado: document.querySelector('#tgc-mov-tipos .tgc-tipo[aria-pressed="true"]').dataset.tipo, min: document.getElementById('tgc-mov-min').value, km: document.getElementById('tgc-mov-km').value }));
    await p23.click('#tgc-mov-btn'); await p23.waitForTimeout(300);
    await p23.click('#tgc-mov-min'); await p23.fill('#tgc-mov-min', '45');
    await p23.click('#tgc-mov-tipos .tgc-tipo[data-tipo="correr"]'); await p23.waitForTimeout(60);
    const tc23 = await tipoMov();
    prueba('escritos 45 minutos, el primer toque en «Correr» entra (antes se perdía) y propone sus 30 min y 5 km', tc23.pulsado === 'correr' && tc23.min === '30' && tc23.km === '5', JSON.stringify(tc23));
    await p23.click('#tgc-mov-km'); await p23.fill('#tgc-mov-km', '6,5');
    await p23.click('#tgc-mov-tipos .tgc-tipo[data-tipo="caminar"]'); await p23.waitForTimeout(60);
    const tk23 = await tipoMov();
    prueba('escritos 6,5 km, el primer toque en «Caminar» también entra (30 min y 2,5 km)', tk23.pulsado === 'caminar' && tk23.min === '30' && tk23.km === '2,5', JSON.stringify(tk23));
    await p23.click('#tgc-mov-hoy'); await p23.waitForTimeout(60);
    await p23.evaluate(() => {
      const escribe = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); };
      escribe('tgc-mov-min', '50'); escribe('tgc-mov-km', '3,5'); document.getElementById('tgc-mov-guardar').click();
    });
    await p23.waitForTimeout(450);
    const ti23 = await p23.evaluate(() => { const m = TG_CUERPO.estado().mov, u = m[m.length - 1]; return { n: m.length, u: u && [u.tipo, u.min, u.km].join(','), toast: document.getElementById('tgc-toast-txt').textContent, min: document.getElementById('tgc-st-min').textContent }; });
    prueba('escritos 50 min y 3,5 km, «Anotar» sin salir del campo guarda lo escrito: «Caminar: 50 min y 3,5 km anotados»', ti23.n === 4 && ti23.u === 'caminar,50,3.5' && ti23.toast === 'Caminar: 50 min y 3,5 km anotados' && ti23.min === '265', JSON.stringify(ti23));
    await p23.click('#tgc-toast-btn'); await p23.waitForTimeout(150);
    prueba('…y «Deshacer» también lo quita (215)', await p23.evaluate(() => TG_CUERPO.estado().mov.length === 3 && JSON.parse(localStorage.getItem('tenerife.cuerpo')).mov.length === 3 && document.getElementById('tgc-st-min').textContent === '215'));

    /* lo último anotado: × borra, con deshacer */
    await p23.click('#tgc-mov-btn'); await p23.waitForTimeout(300);
    await p23.click('#tgc-mov-hist .tgc-hist-fila:first-child .tgc-hist-x'); await p23.waitForTimeout(150);
    const x23 = await p23.evaluate(() => ({ n: TG_CUERPO.estado().mov.length, hist: document.querySelectorAll('#tgc-mov-hist .tgc-hist-fila').length, toast: document.getElementById('tgc-toast-txt').textContent, min: document.getElementById('tgc-st-min').textContent, abierta: !document.getElementById('tgc-hoja').hidden }));
    prueba('× borra la caminata de hoy (quedan 2; 180 min), con la hoja abierta y «Deshacer»', x23.n === 2 && x23.hist === 2 && x23.toast === 'Anotación borrada' && x23.min === '180' && x23.abierta, JSON.stringify(x23));
    await p23.click('#tgc-toast-btn'); await p23.waitForTimeout(150);
    prueba('…y «Deshacer» la devuelve', await p23.evaluate(() => TG_CUERPO.estado().mov.length === 3 && document.querySelectorAll('#tgc-mov-hist .tgc-hist-fila').length === 3 && document.getElementById('tgc-st-min').textContent === '215'));
    /* Escape, «atrás» y el velo cierran la hoja, no la pantalla */
    await p23.keyboard.press('Escape'); await p23.waitForTimeout(200);
    prueba('Escape cierra la hoja del movimiento y deja «Su cuerpo»', await p23.evaluate(() => document.getElementById('tgc-hoja').hidden && TG_CUERPO.abierto() && JSON.stringify(history.state) === '{"tgPerfil":1,"tgCuerpo":1}' && document.activeElement && document.activeElement.id === 'tgc-mov-btn'));
    await p23.click('#tgc-mov-btn'); await p23.waitForTimeout(300);
    await p23.goBack(); await p23.waitForTimeout(300);
    prueba('«atrás» cierra la hoja del movimiento y deja «Su cuerpo»', await p23.evaluate(() => document.getElementById('tgc-hoja').hidden && TG_CUERPO.abierto() && !document.getElementById('perfil-panel').hidden));
    await p23.click('#tgc-mov-btn'); await p23.waitForTimeout(300);
    await p23.mouse.click(195, 60); await p23.waitForTimeout(300);
    prueba('tocar fuera (el velo) cierra la hoja del movimiento', await p23.evaluate(() => document.getElementById('tgc-hoja').hidden && TG_CUERPO.abierto()));

    /* de 5 a 17 años: 3 días y 420 min */
    await p23.evaluate(() => { localStorage.setItem('tenerife.perfil', JSON.stringify({ nacimiento: new Date().getFullYear() - 15 })); TG_CUERPO.repintar(); });
    const j23 = await p23.evaluate(() => ({ f: document.querySelector('#tgc-meta-fuerza .tgc-meta-de').textContent, m: document.querySelector('#tgc-meta-mov .tgc-meta-de').textContent, hecha: document.getElementById('tgc-meta-mov').classList.contains('hecha'),
      reco: document.getElementById('tgc-reco-mov').textContent, cifras: document.getElementById('tgc-cifras-mov').textContent }));
    prueba('menores: de 3 días con fuerza y de 420 min de movimiento (215 no la cumple), con la recomendación de la OMS para su edad (60 al día)', j23.f === 'de 3 días con fuerza' && j23.m === 'de 420 min de movimiento' && !j23.hecha && /60 minutos al día/.test(j23.reco) && /420/.test(j23.reco) && j23.cifras === j23.reco, JSON.stringify(j23));
    await p23.evaluate(() => { localStorage.removeItem('tenerife.perfil'); TG_CUERPO.repintar(); });

    /* lo guardado roto: cada campo, por su cuenta */
    await p23.evaluate(() => {
      const ymd = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      const hace = n => { const d = new Date(); d.setDate(d.getDate() - n); return ymd(d); };
      const g = JSON.parse(localStorage.getItem('tenerife.cuerpo'));
      g.mov = [{ d: hace(0), tipo: 'patinete', min: 30, km: 1 }, { d: hace(0), tipo: 'caminar', min: 0, km: 1 }, { d: hace(0), tipo: 'caminar', min: 601, km: 1 }, { d: hace(0), tipo: 'caminar', min: 30, km: 99 },
        { d: hace(0), tipo: 'nadar', min: 30, km: 5 }, { d: hace(-3), tipo: 'caminar', min: 30, km: 1 }, { d: 'ayer', tipo: 'caminar', min: 30, km: 1 }, 'nada', { d: hace(1), tipo: 'correr', min: 25.5, km: 4 }, { d: hace(1), tipo: 'correr', min: 25, km: -4, t: 'x' }];
      localStorage.setItem('tenerife.cuerpo', JSON.stringify(g)); TG_CUERPO.abrir();
    });
    await p23.waitForTimeout(250);
    const v23 = await p23.evaluate(() => TG_CUERPO.estado().mov.map(x => [x.tipo, x.min, x.km, x.t].join(':')).join(' | ') + ' // ' + document.getElementById('tgc-st-min').textContent);
    prueba('roto: quedan 3 (99 km → 60; a nado, con sus 5 km, desde el 8-11-2026; km negativos → 0; t raro → 0); fuera un tipo desconocido, 0 y 601 min, fechas de mañana o mal escritas, medio minuto y un texto', v23 === 'caminar:30:60:0 | nadar:30:5:0 | correr:25:0:0 // 85', v23);

    /* «Borrar los datos» se lleva el movimiento */
    await conMov();
    await p23.evaluate(() => document.getElementById('tgc-borrar').click()); await p23.evaluate(() => document.getElementById('tgc-borrar-si').click()); await p23.waitForTimeout(200);
    prueba('«Borrar los datos» borra también el movimiento: 0 min, ningún punto, ningún rayo', await p23.evaluate(() => TG_CUERPO.estado().mov.length === 0 && document.getElementById('tgc-st-min').textContent === '0' && !document.querySelector('#tgc-dias7 .con-mov') && [...document.querySelectorAll('#tgc-cielo .tgc-rayo')].every(r => r.getAttribute('opacity') !== '1')));

    /* el asistente: «¿Cómo voy esta semana?» cuenta el movimiento (215 min y 13,5 km, el de a nado también); sin movimiento, no lo nombra */
    await ejemplo(p23); await conMov();
    const pregunta = async q => { await p23.fill('#tgc-preg', q); await p23.click('#tgc-preg-enviar'); await p23.waitForFunction(() => document.querySelectorAll('#tgc-charla .tgc-turno .tgc-resp-t').length > 0, null, { timeout: 15000 }).catch(() => {}); await p23.waitForTimeout(150); };
    await p23.click('#tgc-modo-p'); await p23.waitForFunction(() => { const f = document.getElementById('tgc-preg-form'); return f && !f.hidden; }, null, { timeout: 15000 }).catch(() => {});
    await pregunta('¿Cómo voy esta semana?');
    const a23 = await p23.evaluate(() => [...document.querySelectorAll('#tgc-charla .tgc-turno:last-child .tgc-resp-p li')].map(li => li.textContent));
    prueba('el asistente dice el movimiento de la semana: «215 min y 13,5 km», con el km a nado (con «min», como la pantalla: «1 minutos» no)', a23.some(t => t === 'Movimiento anotado en 7 días: 215 min y 13,5 km.'), a23.join(' | '));
    await p23.evaluate(() => { const g = JSON.parse(localStorage.getItem('tenerife.cuerpo')); g.mov = []; localStorage.setItem('tenerife.cuerpo', JSON.stringify(g)); TG_CUERPO.abrir({ modo: 'preguntar' }); }); await p23.waitForTimeout(200);
    await pregunta('¿Cómo voy esta semana?');
    const a23b = await p23.evaluate(() => [...document.querySelectorAll('#tgc-charla .tgc-turno:last-child .tgc-resp-p li')].map(li => li.textContent));
    prueba('…y sin movimiento anotado, ese párrafo no sale (los demás, sí)', a23b.length === 2 && !a23b.some(t => /Movimiento anotado/.test(t)), a23b.join(' | '));
    await p23.click('#tgc-modo-m'); await p23.waitForTimeout(150);

    /* los textos nuevos, en los diez idiomas: nada vacío, nada en castellano fuera del castellano, y la hoja sin desborde */
    await conMov();
    const esTx = {};
    for (const l of ['es', 'en', 'fr', 'de', 'it', 'nl', 'zh', 'zht', 'bg', 'pl']) {
      await idioma(p23, l);
      await p23.click('#tgc-mov-btn'); await p23.waitForTimeout(250);
      const t = await p23.evaluate(() => {
        const g = id => document.getElementById(id).textContent.trim();
        const vis = [...document.querySelectorAll('#tgc-pag-mov button, #tgc-pag-mov span, #tgc-pag-mov p, #tgc-pag-mov h2, #tgc-pag-mov h3')].filter(n => n.offsetParent !== null && !n.children.length && !/^[0-9,.+−×✓ ]*$/.test(n.textContent));
        const h = document.getElementById('tgc-hoja');
        return { tit: g('tgc-mov-tit'), lema: g('tgc-mov-lema'), que: g('tgc-mov-que'), min: g('tgc-mov-min-l'), km: g('tgc-mov-km-l'), nota: g('tgc-mov-nota'), boton: g('tgc-mov-guardar-txt'),
          tipos: [...document.querySelectorAll('#tgc-mov-tipos .tgc-tipo span')].map(x => x.textContent).join(','), btn: g('tgc-mov-btn'),
          metas: [...document.querySelectorAll('.tgc-meta-de')].map(x => x.textContent).join(' / '), nombres: [...document.querySelectorAll('.tgc-meta')].map(x => x.getAttribute('aria-label')).join(' / '),
          hoy: g('tgc-dia-txt'), reco: g('tgc-reco-mov'), ariaMas: document.getElementById('tgc-mov-min-mas').getAttribute('aria-label'), ariaKm: document.getElementById('tgc-mov-km-mas').getAttribute('aria-label'),
          vacios: vis.filter(n => !n.textContent.trim()).length, desborde: h.scrollWidth > h.clientWidth + 1, lang: document.getElementById('cuerpo-panel').getAttribute('lang') };
      });
      if (l === 'es') Object.assign(esTx, t);
      const claves = ['tit', 'lema', 'que', 'min', 'km', 'nota', 'boton', 'tipos', 'btn', 'metas', 'nombres', 'hoy', 'reco', 'ariaMas', 'ariaKm'];
      const vacias = claves.filter(k => !t[k]), iguales = l === 'es' ? [] : claves.filter(k => k !== 'boton' && k !== 'min' && t[k] === esTx[k]);
      prueba(l + ': la semana y la hoja del movimiento, con todos sus textos' + (l === 'es' ? '' : ', en su idioma') + ' y sin desborde', !vacias.length && !iguales.length && !t.vacios && !t.desborde && /150|420/.test(t.metas) && /12/.test(t.metas), JSON.stringify({ vacias, iguales, vacios: t.vacios, desborde: t.desborde, metas: t.metas }));
      await p23.keyboard.press('Escape'); await p23.waitForTimeout(120);
    }
    await idioma(p23, 'es');
    prueba('bloque 4: sin errores de página', e23.length === 0, e23.join(' | '));
    await c23.close();
  }

  prueba('ningún error en toda la prueba', errores.length === 0, errores.join(' | '));
  console.log('\n  ' + (ok + mal) + ' controles, ' + (mal ? mal + ' en rojo' : 'todos en verde'));
  await b.close();
  process.exit(mal ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
