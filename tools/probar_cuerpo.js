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
 *   - el bloque 5 («Hoy en la isla» y «Cruce la isla», 24), el 6 (los sellos y la postal, 25) y el 7 (el
 *     movimiento deporte a deporte: los datos de cada uno, la intensidad y la meta, «Por deporte», el
 *     buceo y el avión, y lo que cada persona elige contar para el GR 131, 26).
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
/* opc: tresD (el 3D encendido), fiesta (las celebraciones de los sellos; sin ella, TG_CUERPO_SIN_FIESTA, para que la
   tarjeta no se plante encima de lo que cada control toca), blob (deja pasar blob: y data:, la imagen de la postal),
   corta (una RegExp de lo que se corta), contexto (opciones del contexto) */
async function contexto(b, opc) {
  opc = opc || {};
  const ctx = await b.newContext(Object.assign({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block', locale: 'es-ES' }, opc.contexto || {}));
  await ctx.route('**/*', r => { const u = r.request().url(); return (u.startsWith('http://127.0.0.1') || (opc.blob && /^(blob|data):/.test(u))) && !(opc.corta && opc.corta.test(u)) ? r.continue() : r.abort(); });
  await ctx.addInitScript(o => {
    try { localStorage.setItem('tenerife.tour.seen', '99'); localStorage.setItem('tgo_consent', JSON.stringify({ v: 'denied', t: Date.now() })); if (!o.tresD) localStorage.setItem('tenerife.cuerpo.3d', 'no'); } catch (e) {}
    if (!o.fiesta) window.TG_CUERPO_SIN_FIESTA = true;
  }, { tresD: !!opc.tresD, fiesta: !!opc.fiesta });
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
   series; una anotacion por grupo principal. Con la pantalla abierta, abrir() vuelve a leerlo.
   mas (8-11-2026, bloque 6): lo demas que se guarda con el ejemplo; mas.mov va como filas
   [hace cuantos dias, tipo, minutos, km] (bloque 7: y, si hace falta, un quinto con lo demas de la
   anotacion, { int, des }) y lo demas (sellos, deporte, gr…) tal cual */
async function ejemplo(pg, mas) {
  await pg.evaluate(mas => {
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
    const g = { v: 1, aspecto: TG_FIGURA.normaliza(null), series };
    if (mas) Object.keys(mas).forEach(k => { g[k] = k === 'mov' ? mas.mov.map((x, i) => Object.assign({ d: hace(x[0]), tipo: x[1], min: x[2], km: x[3], t: t + 500 + i }, x[4] || {})) : mas[k]; });
    localStorage.setItem('tenerife.cuerpo', JSON.stringify(g));
    TG_CUERPO.abrir();
  }, mas || null);
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
     6), «Anotar movimiento» y su hoja (17) y sin las tres cifras de antes (3), 128; desde el 8 (bloque 5), con
     «Hoy en la isla» (el título y la etiqueta de la zona), «Cruce la isla» (el título y «Esquema») y con la nota de
     la hoja del movimiento puesta por código (dos notas), 131; desde el 8 (bloque 6), con «Sus sellos» (el título y el
     subtítulo) y «Su postal» (el título, el texto y «Crear mi postal»), 136; desde el 8 (bloque 7), con el desnivel
     (su nombre y sus «−» y «+»), la intensidad (su nombre, «Moderada» e «Intensa»), «Por deporte» y lo que cuenta
     para la travesía («Cuentan para su travesía», «A pie» y «siempre», para el lector), 146; desde el 8 (bloque 8), con
     «Su compañero de travesía» (el título, «A pie», «En bici» y la ayuda) y «Senderos de la isla» (el título), 151; y 2 placeholders (el
     del buscador de ejercicios y el de la pregunta) */
  prueba('textos fijos puestos (166 elementos, con la línea de la IA, desde el 10-11-2026 la pestaña «Evolución» y, desde el 12-11-2026, «Repeticiones» y «Peso (kg)» de la ficha, «En casa» de sus filtros y los cinco de «¿Qué entreno hoy?» y el título de «Su fuerza»; desde la nota 34, los cinco de las rutinas: «¿A qué nivel entrena?», «Su sesión de hoy», «¿Sin mancuernas, disco o banco?», «sin banda» y «cómo calentar» (166); y 2 placeholders)', r2.n === 166 && r2.ph === 2, r2.n + '/' + r2.ph);
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
           los lados a propósito, recortados por la escena. Ni lo de dentro de una tira que se desliza
           de lado (overflow-x auto o scroll: la de los sellos, 8-11-2026, bloque 6) */
        const p = document.getElementById('cuerpo-panel'), b = p.getBoundingClientRect();
        const vacios = [...p.querySelectorAll('#tgc [data-tx], #tgc-modos [data-tx]')].filter(n => n.getClientRects().length && !n.textContent.trim()).map(n => n.id || n.className);
        const enTira = n => { for (let a = n.parentElement; a && a !== p; a = a.parentElement) { const o = getComputedStyle(a).overflowX; if (o === 'auto' || o === 'scroll') return true; } return false; };
        const anchos = [...p.querySelectorAll('#tgc *, #tgc-modos *')].filter(n => { if (!n.getClientRects().length || n.closest('svg')) return false; const x = n.getBoundingClientRect(); return (x.right > b.right + 0.5 || x.left < b.left - 0.5) && !enTira(n); })
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
  prueba('metas: 0 de 150 min (el ejemplo no tiene; desde el bloque 7, «intensos ×2»: para un adulto, cada minuto intenso cuenta por dos), sin cumplir, con la raya vacía', r4.mov.n === '0' && r4.mov.de === 'de 150 min (intensos ×2)' && !r4.mov.hecha && !r4.mov.ok && r4.mov.raya === '0%' && r4.mov.nombre === 'Minutos de movimiento', JSON.stringify(r4.mov));
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
  // (#120, 12-11-2026; Jérôme: «guarda los kilos y las repeticiones») las repeticiones y el peso de la ficha:
  // opcionales, comprobados, con «la última vez» (en los diez idiomas, con la coma de cada uno) y en el historial
  await pg.click('.tgc-ej-fila[data-id="' + ej.id + '"]'); await pg.waitForTimeout(150);
  const leerFicha = () => pg.evaluate(() => ({ ult: document.getElementById('tgc-ej-ultima').textContent, oculto: document.getElementById('tgc-ej-ultima').hidden,
    reps: document.getElementById('tgc-ej-reps').value, kg: document.getElementById('tgc-ej-kg').value, ayuda: document.getElementById('tgc-ej-carga-ayuda').textContent,
    lReps: document.getElementById('tgc-ej-reps-l').textContent, lKg: document.getElementById('tgc-ej-kg-l').textContent,
    malR: document.getElementById('tgc-ej-reps').getAttribute('aria-invalid'), malK: document.getElementById('tgc-ej-kg').getAttribute('aria-invalid'),
    toast: document.getElementById('tgc-toast-txt').textContent }));
  const c1a = await leerFicha();
  prueba('kilos: la ficha dice «La última vez, hoy: 4 series» y no rellena repeticiones ni peso que no se anotaron', !c1a.oculto && c1a.ult === 'La última vez, hoy: 4 series' && c1a.reps === '' && c1a.kg === '', JSON.stringify(c1a));
  prueba('kilos: «Repeticiones», «Peso (kg)» y la ayuda, que nombra «Evolución»', c1a.lReps === 'Repeticiones' && c1a.lKg === 'Peso (kg)' &&
    c1a.ayuda === 'Las repeticiones y el peso son opcionales: con ellos verá cómo progresa, en «Evolución».', JSON.stringify(c1a));
  const antesC1 = await pg.evaluate(() => TG_CUERPO.estado().series.length);
  for (const [reps, kg, cual] of [['0', '', 'r'], ['201', '', 'r'], ['2.5', '', 'r'], ['10', 'abc', 'k'], ['10', '501', 'k'], ['10', '-5', 'k'], ['10', '0', 'k'], ['10', '12,345', 'k']]) {
    await pg.fill('#tgc-ej-reps', reps); await pg.fill('#tgc-ej-kg', kg); await pg.click('#tgc-ej-guardar'); await pg.waitForTimeout(80);
    const m = await leerFicha();
    prueba('kilos: «' + reps + '» y «' + kg + '» no se guardan, y se dice cuál no vale', m.toast === 'Revise las repeticiones (un número entero de 1 a 200) y el peso en kilos (por ejemplo, 12,5).' &&
      (cual === 'r' ? m.malR === 'true' : m.malK === 'true' && m.malR === null) && await pg.evaluate(n => TG_CUERPO.estado().series.length === n, antesC1), JSON.stringify(m));
  }
  await pg.fill('#tgc-ej-reps', '10'); await pg.fill('#tgc-ej-kg', '12,5'); await pg.click('#tgc-ej-guardar'); await pg.waitForTimeout(150);
  const c1b = await pg.evaluate(() => { const s = TG_CUERPO.estado().series; return { nuevas: s.slice(-3), n: s.length, guardado: JSON.parse(localStorage.getItem('tenerife.cuerpo')).series.slice(-3) }; });
  const nuevasC1 = c1b.nuevas.slice(-ej.g.length), guardadasC1 = c1b.guardado.slice(-ej.g.length);
  prueba('kilos: 10 repeticiones y 12,5 kg, en cada grupo principal, guardados', c1b.n === antesC1 + ej.g.length && nuevasC1.every((x, k) => x.e === ej.id && x.g === ej.g[k] && x.n === 4 && x.r === 10 && x.kg === 12.5) &&
    guardadasC1.every(x => x.r === 10 && x.kg === 12.5), JSON.stringify(c1b));
  const c1c = await leerFicha();
  prueba('kilos: «La última vez, hoy: 4 × 10 con 12,5 kg», y las cifras se quedan para la serie siguiente', c1c.ult === 'La última vez, hoy: 4 × 10 con 12,5 kg' && c1c.reps === '10' && c1c.kg === '12,5' && c1c.malR === null && c1c.malK === null, JSON.stringify(c1c));
  /* cada idioma con su frase y sus dos etiquetas (en italiano, «Peso (kg)» se escribe igual que en castellano) */
  const ESPERA_C1 = { en: ['Last time, today: 4 × 10 at 12.5 kg', 'Reps', 'Weight (kg)'], fr: ['La dernière fois, aujourd’hui : 4 × 10 à 12,5 kg', 'Répétitions', 'Poids (kg)'],
    de: ['Letztes Mal, heute: 4 × 10 mit 12,5 kg', 'Wiederholungen', 'Gewicht (kg)'], it: ['L’ultima volta, oggi: 4 × 10 con 12,5 kg', 'Ripetizioni', 'Peso (kg)'],
    nl: ['Vorige keer, vandaag: 4 × 10 met 12,5 kg', 'Herhalingen', 'Gewicht (kg)'], zh: ['上次（今天）：4 组 × 10 次，12.5公斤', '次数', '重量（公斤）'],
    zht: ['上次（今天）：4 組 × 10 次，12.5公斤', '次數', '重量（公斤）'], bg: ['Последния път, днес: 4 × 10 с 12,5 кг', 'Повторения', 'Тежест (кг)'],
    pl: ['Ostatnio, dziś: 4 × 10, 12,5 kg', 'Powtórzenia', 'Ciężar (kg)'] };
  for (const [l, e] of Object.entries(ESPERA_C1)) {
    await idioma(pg, l);
    const m = await leerFicha();
    prueba('kilos, ' + l + ': «' + e[0] + '», «' + e[1] + '» y «' + e[2] + '», y la ayuda en su idioma', m.ult === e[0] && m.lReps === e[1] && m.lKg === e[2] && m.ayuda && m.ayuda.indexOf('{') < 0 &&
      m.ayuda !== c1a.ayuda, JSON.stringify(m));
  }
  await idioma(pg, 'es');
  await pg.keyboard.press('Escape'); await pg.waitForTimeout(150);
  const c1d = await pg.evaluate(() => { const f = document.querySelector('#tgc-hist .tgc-hist-n'); return f ? f.firstChild.textContent : null; });
  prueba('kilos: el historial del grupo dice «4 × 10 con 12,5 kg»', c1d === '4 × 10 con 12,5 kg', c1d);
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
  // (#120) lo guardado: repeticiones y peso solo con ejercicio, enteras de 1 a 200 y de más de 0 a 500 kg, a la centésima
  await pg.evaluate(() => { localStorage.setItem('tenerife.cuerpo', JSON.stringify({ v: 1, series: [
    { d: '2026-10-20', g: 'pecho', n: 3, r: 10, kg: 20 },
    { d: '2026-10-21', g: 'pecho', n: 3, e: 'press-banca', r: 0, kg: -1 },
    { d: '2026-10-22', g: 'pecho', n: 3, e: 'press-banca', r: 2.5, kg: 501 },
    { d: '2026-10-23', g: 'pecho', n: 3, e: 'press-banca', r: '10', kg: '20' },
    { d: '2026-10-24', g: 'pecho', n: 3, e: 'press-banca', r: 201, kg: 0 },
    { d: '2026-10-25', g: 'pecho', n: 3, e: 'press-banca', r: 12, kg: 12.345 },
    { d: '2026-10-26', g: 'pecho', n: 3, e: 'press-banca', r: 200, kg: 500 }] })); TG_CUERPO.abrir(); });
  const c1e = await pg.evaluate(() => TG_CUERPO.estado().series.map(x => [x.r === undefined ? '-' : x.r, x.kg === undefined ? '-' : x.kg]));
  prueba('kilos, lo guardado: sin ejercicio, ni repeticiones ni peso; lo que no vale, fuera; el peso a la centésima', JSON.stringify(c1e) === JSON.stringify([['-', '-'], ['-', '-'], ['-', '-'], ['-', '-'], ['-', '-'], [12, 12.35], [200, 500]]), JSON.stringify(c1e));

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
  //     verdad: desde el 10-11-2026 (#99), en la pestaña «Evolución» de «Su cuerpo» (se escribe, se guarda y
  //     se vuelve a «Músculos», que se pinta otra vez al salir de «Evolución»). Sin la referencia del 10 (ni en
  //     «Las cifras» ni en la hoja), y con la recomendación de su edad; con un año de adulto, o sin año, vuelve
  {
    const c5 = await contexto(b), p5 = await c5.newPage(), e5 = []; vigilar(p5, e5);
    await abrirApp(p5); await abrirPerfilCuerpo(p5); await suCuerpo(p5);
    const anio = await p5.evaluate(() => new Date().getFullYear());
    const conAnio = async (v) => {
      await p5.click('#tgc-modo-e'); await p5.waitForTimeout(250);
      await p5.fill('#tgp-nac', v); await p5.click('#tgp-save'); await p5.waitForTimeout(200);
      const guardado = await p5.evaluate(() => (JSON.parse(localStorage.getItem('tenerife.perfil')) || {}).nacimiento);
      await p5.click('#tgc-modo-m'); await p5.waitForTimeout(250);
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
    /* (12-11-2026) las comillas de dentro se escriben a la manera de cada idioma («Borrar los datos de “Su cuerpo”»,
       «Изтрий данните от „Вашето тяло“», 「删除『我的身体』数据」): se compara sin mirar de qué tipo son. Antes, una cita
       con comillas dentro no se miraba, y el búlgaro de «borrar-datos» seguía citando el botón de antes, «Изтриване…» */
    const sinComillas = t => String(t).replace(/[«»“”„‟‘’‚「」『』]/g, '"');
    const porEs = {}; for (const [k, v] of Object.entries(UI)) (porEs[sinComillas(v.es)] = porEs[sinComillas(v.es)] || []).push(k);
    const usos = []; for (const [donde, t] of Object.entries(T.es)) for (const c of citas(t)) if (porEs[sinComillas(c)]) usos.push([donde, porEs[sinComillas(c)]]);
    const malas = [];
    for (const [donde, ks] of usos) for (const l of L.slice(1)) {
      const t = sinComillas(T[l][donde] || '');
      if (!ks.some(k => t.includes(sinComillas(UI[k][l]))))
        malas.push(l + ' ' + donde + ': «' + ks.map(k => UI[k][l]).join('» o «') + '»');
    }
    prueba('las respuestas y las guías que citan un texto de la pantalla (' + usos.length + ' citas) lo citan tal cual en los diez idiomas', usos.length >= 20 && !malas.length, malas.slice(0, 4).join(' · '));
    /* (12-11-2026, #120) «progresar» decía «La app guarda cuántas series hace, no el peso»: desde #120 guarda también
       las repeticiones y el peso. Ahora manda a «Su fuerza», en la pestaña «Evolución», con sus nombres tal cual */
    const malProg = L.filter(l => { const x = lee('asistente-' + l + '.json').respuestas.find(r => r.id === 'progresar'), t = sinComillas(((x || {}).r || {}).p ? x.r.p[3] : '');
      return !t.includes(sinComillas(UI.cuerpoFuerzaTit[l])) || !t.includes(sinComillas(UI.cuerpoModoEvolucion[l])); });
    prueba('«progresar» ya no dice que la app no guarda el peso: manda a «Su fuerza», en «Evolución», en los diez idiomas', !malProg.length, malProg.join(' '));
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
  //     (8-11-2026) Nadar y bici también suman km (Jerome: «Cuentan también»); antes, solo a pie. Y los km, al metro
  //     (tres decimales) y un tope por anotación: 200 en bici, 100 en los demás (antes, un decimal y 60)
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
    /* (bloque 7) lo anotado antes, sin intensidad, cuenta como moderado: 35 + 150 + 30, sin nada por dos */
    prueba('movimiento: 215 de 150 min (intensos ×2), cumplida, con la raya llena; lo anotado sin intensidad cuenta como moderado', m23.n === '215' && m23.de === 'de 150 min (intensos ×2)' && m23.hecha && m23.raya === '100%', JSON.stringify(m23));
    prueba('el sol: los siete rayos, también los de los días que solo tienen movimiento (hace 3 y hace 5)', r23.rayos === '1111111', r23.rayos);
    prueba('la semana: el punto del movimiento en hoy, hace 3 y hace 5', r23.conMov === '0101001', r23.conMov);
    /* (bloque 7) la línea del día dice las series y el tiempo; cada deporte, con su distancia, va debajo (sin partir
       una cifra de su unidad: con espacios duros, que aquí se leen como espacios) */
    const sp = t => String(t).replace(/\u00a0/g, ' ');
    prueba('hoy: «10 series · 35 min», y debajo sus grupos y «Caminar: 35 min y 3 km»', /: 10 series · 35 min$/.test(r23.hoy) && sp(r23.hoyG) === 'Pecho, Hombros, Tríceps · Caminar: 35 min y 3 km' && r23.ariaHoy === r23.hoy, r23.hoy + ' | ' + r23.hoyG);
    prueba('hace 3 días, solo movimiento: «2 h 30 min» (sin «0 series»)', /: 2 h 30 min$/.test(r23.ariaHace3), r23.ariaHace3);
    await p23.click('#tgc-dias7 li:nth-child(4) .tgc-dia'); await p23.waitForTimeout(80);
    prueba('…y al tocarlo, debajo dice «Senderismo: 150 min y 9,5 km»', await p23.evaluate(() => document.getElementById('tgc-dia-grupos').textContent.replace(/\u00a0/g, ' ') === 'Senderismo: 150 min y 9,5 km' && /2 h 30 min$/.test(document.getElementById('tgc-dia-txt').textContent)));
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
    prueba('la hoja: el título, la frase, los catorce deportes con su icono (Caminar elegido; desde el bloque 7, la bici con los de tierra y los del mar juntos), 30 min, 2,5 km, hoy, y el botón dice lo que va a anotar', h23.tit === 'Anotar movimiento' && /lo que haga en la isla cuenta/.test(h23.lema)
      && h23.tipos === 'caminar:true:Caminar:1,senderismo:false:Senderismo:1,correr:false:Correr:1,bici:false:Bici:1,nadar:false:Nadar:1,kayak:false:Kayak:1,sup:false:Pádel surf:1,surf:false:Surf:1,windsurf:false:Windsurf y kitesurf:1,buceo:false:Buceo:1,golf:false:Golf:1,padel:false:Pádel:1,escalada:false:Escalada:1,otro:false:Otro deporte:1' && h23.min === '30' && h23.km === '2,5' && !h23.kmFila && h23.kmL === 'Kilómetros' && h23.hoy === 'true'
      && h23.boton === 'Anotar 30 min y 2,5 km' && /GR 131/.test(h23.nota), JSON.stringify(h23));   /* desde el bloque 5, la nota de a pie habla del GR 131 */
    prueba('lo último anotado: las tres, de hoy hacia atrás, con el tipo, los minutos y la distancia (a nado, en metros desde el bloque 7)', h23.hist === 'Caminar · 35 min y 3 km | Senderismo · 150 min y 9,5 km | Nadar · 30 min y 1000 m', h23.hist);
    await p23.click('#tgc-mov-tipos .tgc-tipo[data-tipo="nadar"]'); await p23.waitForTimeout(60);
    const hojaMov = () => p23.evaluate(() => ({ kmFila: document.getElementById('tgc-mov-km-fila').hidden, min: document.getElementById('tgc-mov-min').value, km: document.getElementById('tgc-mov-km').value, menos: document.getElementById('tgc-mov-km-menos').disabled, mas: document.getElementById('tgc-mov-km-mas').disabled,
      boton: document.getElementById('tgc-mov-guardar-txt').textContent, pulsado: document.querySelector('#tgc-mov-tipos .tgc-tipo[aria-pressed="true"]').dataset.tipo }));
    /* los km se escriben solo si su campo se ve: sin él, la prueba sale en rojo y no se para */
    const escribeKm = async v => { if (await p23.isVisible('#tgc-mov-km')) { await p23.fill('#tgc-mov-km', v); await p23.dispatchEvent('#tgc-mov-km', 'change'); } await p23.waitForTimeout(60); };
    const n23 = await hojaMov();
    prueba('Nadar: con el campo de la distancia (desde el 8-11-2026; en metros desde el bloque 7), en 0 y con «−» apagado, 30 min, y el botón solo dice los minutos', !n23.kmFila && n23.km === '0' && n23.menos && n23.min === '30' && n23.boton === 'Anotar 30 min' && n23.pulsado === 'nadar', JSON.stringify(n23));
    await p23.click('#tgc-mov-tipos .tgc-tipo[data-tipo="bici"]'); await p23.waitForTimeout(60);
    const bi23 = await hojaMov();
    await escribeKm('42,5');
    const bk23 = await hojaMov();
    prueba('Bici: con el campo de los kilómetros, en 0, 60 min; escritos 42,5 km, el botón los dice', !bi23.kmFila && bi23.km === '0' && bi23.min === '60' && bi23.boton === 'Anotar 60 min' && bi23.pulsado === 'bici'
      && !bk23.kmFila && bk23.km === '42,5' && !bk23.menos && bk23.boton === 'Anotar 60 min y 42,5 km', JSON.stringify([bi23, bk23]));
    await escribeKm('250'); const bt23 = await hojaMov();
    await p23.click('#tgc-mov-tipos .tgc-tipo[data-tipo="caminar"]'); await p23.waitForTimeout(60); await escribeKm('150'); const ct23 = await hojaMov();
    prueba('el tope de una anotación: en bici, 200 km («250» se queda en 200, con «+» apagado); caminando, 100', bt23.km === '200' && bt23.mas && bt23.boton === 'Anotar 60 min y 200 km'
      && ct23.pulsado === 'caminar' && ct23.km === '100' && ct23.mas, JSON.stringify([bt23, ct23]));
    await p23.click('#tgc-mov-tipos .tgc-tipo[data-tipo="senderismo"]'); await p23.waitForTimeout(60);
    const s23 = await p23.evaluate(() => ({ min: document.getElementById('tgc-mov-min').value, km: document.getElementById('tgc-mov-km').value, kmFila: document.getElementById('tgc-mov-km-fila').hidden }));
    prueba('Senderismo propone 120 min y 8 km', s23.min === '120' && s23.km === '8' && !s23.kmFila, JSON.stringify(s23));
    await p23.click('#tgc-mov-min-mas'); await p23.click('#tgc-mov-km-menos'); await p23.waitForTimeout(60);
    const pm23 = await p23.evaluate(() => ({ min: document.getElementById('tgc-mov-min').value, km: document.getElementById('tgc-mov-km').value, boton: document.getElementById('tgc-mov-guardar-txt').textContent }));
    prueba('«+» suma 5 minutos y «−» quita medio kilómetro: 125 min y 7,5 km', pm23.min === '125' && pm23.km === '7,5' && pm23.boton === 'Anotar 125 min y 7,5 km', JSON.stringify(pm23));
    await p23.fill('#tgc-mov-min', '7'); await p23.dispatchEvent('#tgc-mov-min', 'change');
    await p23.fill('#tgc-mov-km', '4,2567'); await p23.dispatchEvent('#tgc-mov-km', 'change'); await p23.waitForTimeout(60);
    const red23 = await p23.evaluate(() => document.getElementById('tgc-mov-km').value);
    await p23.fill('#tgc-mov-km', '4,25'); await p23.dispatchEvent('#tgc-mov-km', 'change'); await p23.waitForTimeout(60);
    const esc23 = await p23.evaluate(() => ({ min: document.getElementById('tgc-mov-min').value, km: document.getElementById('tgc-mov-km').value }));
    prueba('escritos a mano: 7 minutos, y «4,25» km (con coma) se queda en 4,25: al metro («4,2567» da 4,257)', esc23.min === '7' && esc23.km === '4,25' && red23 === '4,257', JSON.stringify([esc23, red23]));
    await p23.fill('#tgc-mov-min', '0'); await p23.dispatchEvent('#tgc-mov-min', 'change'); await p23.fill('#tgc-mov-km', 'abc'); await p23.dispatchEvent('#tgc-mov-km', 'change'); await p23.waitForTimeout(60);
    const mal23 = await p23.evaluate(() => ({ min: document.getElementById('tgc-mov-min').value, km: document.getElementById('tgc-mov-km').value }));
    prueba('un 0 en los minutos o letras en los km no valen: se queda lo de antes', mal23.min === '7' && mal23.km === '4,25', JSON.stringify(mal23));
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
    /* (bloque 7) el senderismo se propone intenso (6 MET en el Compendio): sus 7 min cuentan por dos, 215 + 14 */
    prueba('«Anotar» guarda ayer (senderismo, 7 min, 4,25 km) en tenerife.cuerpo, cierra la hoja y avisa con «Deshacer»; la meta, 229 (intenso, por dos)', g23.n === 4 && g23.u === 'senderismo,7,4.25,true,true' && g23.guardado === 4 && g23.cerrada && g23.toast === 'Senderismo: 7 min y 4,25 km anotados' && g23.deshacer === 'Deshacer' && g23.min === '229' && g23.estado === '{"tgPerfil":1,"tgCuerpo":1}', JSON.stringify(g23));
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
    prueba('en bici también se guardan los km: bici, 60 min y 42,5 km; avisa «Bici: 60 min y 42,5 km anotados», la meta sube a 335 (la bici se propone intensa: 60 por dos) y hoy dice «10 series · 1 h 35 min»', b23.n === 4 && b23.u === 'bici,60,42.5' && b23.guardado === 42.5
      && b23.toast === 'Bici: 60 min y 42,5 km anotados' && b23.min === '335' && /: 10 series · 1 h 35 min$/.test(b23.hoy), JSON.stringify(b23));
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
      g.mov = [{ d: hace(0), tipo: 'patinete', min: 30, km: 1 }, { d: hace(0), tipo: 'caminar', min: 0, km: 1 }, { d: hace(0), tipo: 'caminar', min: 601, km: 1 }, { d: hace(0), tipo: 'caminar', min: 30, km: 150 },
        { d: hace(0), tipo: 'nadar', min: 30, km: 5 }, { d: hace(-3), tipo: 'caminar', min: 30, km: 1 }, { d: 'ayer', tipo: 'caminar', min: 30, km: 1 }, 'nada', { d: hace(1), tipo: 'correr', min: 25.5, km: 4 }, { d: hace(1), tipo: 'correr', min: 25, km: -4, t: 'x' },
        { d: hace(2), tipo: 'bici', min: 60, km: 250 }, { d: hace(2), tipo: 'bici', min: 90, km: 123.4567 }];
      localStorage.setItem('tenerife.cuerpo', JSON.stringify(g)); TG_CUERPO.abrir();
    });
    await p23.waitForTimeout(250);
    const v23 = await p23.evaluate(() => TG_CUERPO.estado().mov.map(x => [x.tipo, x.min, x.km, x.t].join(':')).join(' | ') + ' // ' + document.getElementById('tgc-st-min').textContent);
    prueba('roto: quedan 5 (150 km caminando → 100; en bici, 250 → 200 y 123,4567 → 123,457; a nado, con sus 5 km; km negativos → 0; t raro → 0); fuera un tipo desconocido, 0 y 601 min, fechas de mañana o mal escritas, medio minuto y un texto',
      v23 === 'caminar:30:100:0 | nadar:30:5:0 | correr:25:0:0 | bici:60:200:0 | bici:90:123.457:0 // 235', v23);

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
    /* (bloque 7) cada deporte con lo suyo, y los minutos que cuentan para la meta */
    prueba('el asistente dice el movimiento de la semana, deporte a deporte («Nadar: 30 min y 1000 m»), y los minutos que cuentan para la meta (215 de 150)', a23.some(t => t === 'Movimiento anotado en 7 días: Caminar: 35 min y 3 km, Senderismo: 150 min y 9,5 km, Nadar: 30 min y 1000 m. Para su meta cuentan 215 de 150 minutos.'), a23.join(' | '));
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

  // 24. (8-11-2026, bloque 5) la isla. «Hoy en la isla»: el tiempo de UNA zona de las seis del panel del sol
  //     (Costa Adeje por defecto, elegida en un desplegable y recordada en tenerife.cuerpo.hoy; sin geolocalización),
  //     pedido a Open-Meteo (los mismos servicios que la app; con mar solo en las zonas de costa) y cacheado 30 min:
  //     los chips (UV con su categoría de la OMS por el entero que se enseña, grados, mar, viento, lluvia o nieve),
  //     los avisos de AEMET vigentes hoy que tocan la zona (con las funciones de la app), el consejo del día (la
  //     semana y el sol de la OMS con las cuatro horas alrededor del mediodía solar de la zona) y la fuente con su
  //     hora; sin red, lo último guardado con «de hace N h»; sin nada, «Sin datos». «Cruce la isla»: el GR 131
  //     (85,55 km, decisión 5) con TODOS los km a pie anotados, en un esquema (la costa real, las seis paradas en su
  //     sitio y una curva entre ellas, con la etiqueta «Esquema»), la cuenta, la barra y la siguiente parada; al
  //     anotar con km, el marcador avanza animado; si hay trazado oficial (datos/cuerpo/gr131-trazado.json), se
  //     dibuja ese y se quita «Esquema»; uno malo se descarta. Las notas de la hoja del movimiento. Y todo en los
  //     diez idiomas, con la política de privacidad nombrando la zona
  {
    const fs = require('fs'), path = require('path');
    const M24 = fs.readFileSync(path.join(__dirname, '..', 'modulos', 'cuerpo.js'), 'utf8');
    /* las paradas y el total, del módulo (la misma fuente que lee tools/gr131_trazado.py) */
    const gr = M24.match(/var GR131 = \{ total: ([\d.]+), paradas: \[([\s\S]*?)\] \};/);
    const PARADAS = [...gr[2].matchAll(/\{ id: '(\w+)', nombre: '([^']+)', corto: '[^']+', km: ([\d.]+), lat: ([\d.\-]+), lon: ([\d.\-]+) \}/g)].map(m => ({ id: m[1], nombre: m[2], km: +m[3], lat: +m[4], lon: +m[5] }));
    const COSTA = (M24.match(/var COSTA = '([^']+)';/) || [])[1] || '';
    const costaPts = COSTA.split(' ').map(x => x.split(',').map(Number));
    prueba('el módulo: el GR 131 de 85,55 km con sus seis paradas en orden de km, de La Esperanza (0) a Arona (85,55), todas dentro de Tenerife', +gr[1] === 85.55 && PARADAS.length === 6 && PARADAS[0].id === 'esperanza' && PARADAS[5].id === 'arona' && PARADAS[5].km === 85.55
      && PARADAS.every((p, i) => (!i || p.km > PARADAS[i - 1].km) && p.lat > 28 && p.lat < 28.6 && p.lon > -16.95 && p.lon < -16.1), JSON.stringify(PARADAS.map(p => p.id + ':' + p.km)));
    prueba('la costa del esquema: de 200 a 400 puntos «lat,lon», todos dentro de la isla (tools/cuerpo_isla.py la saca de los límites municipales)', costaPts.length >= 200 && costaPts.length <= 400 && costaPts.every(p => p.length === 2 && p[0] > 27.98 && p[0] < 28.61 && p[1] > -16.95 && p[1] < -16.1), costaPts.length + ' puntos');

    /* Open-Meteo de pega: por la latitud de la URL se sabe la zona; Costa Adeje de día con mar, el Teide de noche con nieve */
    const TIEMPO = { current: { temperature_2m: 24.3, uv_index: 8.6, wind_speed_10m: 15.2, weather_code: 1, is_day: 1 }, daily: { uv_index_max: [9.1] } };
    const TEIDE = { current: { temperature_2m: 3.8, uv_index: 0, wind_speed_10m: 42, weather_code: 73, is_day: 0 }, daily: { uv_index_max: [7.6] } };
    const MAR = { current: { sea_surface_temperature: 21.4, wave_height: 0.8 } };
    const peticiones = [];
    let red = true;
    const c24 = await contexto(b), p24 = await c24.newPage(), e24 = []; vigilar(p24, e24);
    await p24.route('https://api.open-meteo.com/**', r => { peticiones.push(r.request().url()); if (!red) return r.abort(); r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(/latitude=28\.22/.test(r.request().url()) ? TEIDE : TIEMPO) }); });
    await p24.route('https://marine-api.open-meteo.com/**', r => { peticiones.push(r.request().url()); if (!red) return r.abort(); r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MAR) }); });
    await p24.addInitScript(() => { window.__geo = 0; if (navigator.geolocation) { const g = navigator.geolocation; ['getCurrentPosition', 'watchPosition'].forEach(k => { const o = g[k].bind(g); g[k] = function () { window.__geo++; return o.apply(g, arguments); }; }); } });
    await abrirApp(p24); await abrirPerfilCuerpo(p24); await suCuerpo(p24);
    await ejemplo(p24);
    const conMov24 = async (mov) => {
      await p24.evaluate(mov => {
        const ymd = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        const hace = n => { const d = new Date(); d.setDate(d.getDate() - n); return ymd(d); };
        const g = JSON.parse(localStorage.getItem('tenerife.cuerpo')), t = Date.now() - 5e5;
        g.mov = mov.map((x, i) => ({ d: hace(x[0]), tipo: x[1], min: x[2], km: x[3], t: t + i }));
        localStorage.setItem('tenerife.cuerpo', JSON.stringify(g)); TG_CUERPO.abrir();
      }, mov);
      await p24.waitForTimeout(300);
    };
    /* hoy 3 km a pie, hace 3 una caminata de 9,5, hace 5 a nado (con 5 km escritos: no cuentan) y hace 12 una travesía de 21 */
    await conMov24([[0, 'caminar', 35, 3], [3, 'senderismo', 150, 9.5], [5, 'nadar', 30, 5], [12, 'senderismo', 240, 21]]);
    await p24.waitForFunction(() => document.querySelectorAll('#tgc-hoy-chips .tgc-hoy-chip').length > 0, null, { timeout: 5000 }).catch(() => {});
    const leer24 = () => p24.evaluate(() => {
      const g = id => document.getElementById(id), sel = g('tgc-hoy-zona');
      return { orden: [...g('tgc-vista-musculos').querySelectorAll(':scope > section')].map(s => s.className.split(' ')[0]).join(' '),
        zonas: [...sel.options].map(o => o.value + ':' + o.textContent + ':' + o.getAttribute('data-sin-traducir')).join(','), zona: sel.value, zonaL: g('tgc-hoy-zona-l').textContent,
        chips: [...document.querySelectorAll('#tgc-hoy-chips .tgc-hoy-chip')].map(c => c.className.replace('tgc-hoy-chip', '').trim() + '=' + c.textContent.trim() + (c.querySelector('svg') ? '' : ' SIN-ICONO')),
        estado: g('tgc-hoy-estado').textContent, estadoOculto: g('tgc-hoy-estado').hidden, avisos: [...document.querySelectorAll('#tgc-hoy-aviso p')].map(p => p.textContent), avisoOculto: g('tgc-hoy-aviso').hidden,
        consejo: g('tgc-hoy-consejo').textContent, fuente: g('tgc-hoy-fuente').textContent, cache: localStorage.getItem('tenerife.cuerpo.hoy'),
        credito: g('tgc-hoy-credito').hidden ? '' : g('tgc-hoy-credito').textContent.replace(/\s+/g, ' ').trim(),
        creditoA: [...document.querySelectorAll('#tgc-hoy-credito a')].map(a => a.getAttribute('href') + '|' + a.textContent + '|' + a.target + '|' + a.rel).join(','),
        creditoSin: !!document.querySelector('#tgc-hoy-credito .om-credito[data-sin-traducir]'), creditoColor: (() => { const e = document.querySelector('#tgc-hoy-credito .om-credito'); return e ? getComputedStyle(e).color : ''; })(),
        fuenteColor: getComputedStyle(g('tgc-hoy-fuente')).color,
        km: g('tgc-isla-km').textContent, de: g('tgc-isla-de').textContent, sig: g('tgc-isla-sig').textContent, sub: g('tgc-isla-sub').textContent, esquema: !g('tgc-isla-esquema').hidden,
        svgs: document.querySelectorAll('#tgc-mapa svg').length, aria: document.querySelector('#tgc-mapa svg').getAttribute('aria-label'), rol: document.querySelector('#tgc-mapa svg').getAttribute('role'),
        paradas: [...document.querySelectorAll('#tgc-mapa .tgc-isla-parada')].map(p => p.querySelector('text').textContent + (p.classList.contains('pasada') ? '*' : '')).join(','),
        teide: !!document.querySelector('#tgc-mapa .tgc-isla-teide') && document.querySelector('#tgc-mapa .tgc-isla-teide-t').textContent, ruta: document.querySelector('#tgc-mapa .tgc-isla-ruta').getAttribute('stroke-dasharray'),
        marca: g('tgc-isla-marca').getAttribute('transform'), hecha: (g('tgc-isla-hecha').getAttribute('d') || '').length, barra: g('tgc-tramo-hecho').style.width, puntos: document.querySelectorAll('#tgc-tramo b').length,
        pasadasBarra: document.querySelectorAll('#tgc-tramo b.pasada').length, cifras: g('tgc-cifras-isla').textContent, geo: window.__geo,
        desborde: g('cuerpo-panel').scrollWidth > g('cuerpo-panel').clientWidth };
    });
    const r24 = await leer24();
    prueba('en «Músculos», el orden de la maqueta: la semana, «Hoy en la isla», «Cruce la isla» (y desde el bloque 8, «Senderos de la isla») y los 12 grupos', /tgc-semana tgc-hoy-isla tgc-isla tgc-send tgc-grupos/.test(r24.orden), r24.orden);
    prueba('la zona: las seis del panel del sol, sin traducir (nombres propios), Costa Adeje por defecto, con su etiqueta', r24.zonas === 'adeje:Costa Adeje:nombre propio,medano:El Médano:nombre propio,gigantes:Los Gigantes:nombre propio,puerto:Puerto de la Cruz:nombre propio,santacruz:Santa Cruz:nombre propio,teide:Teide:nombre propio' && r24.zona === 'adeje' && r24.zonaL === 'Zona del tiempo', r24.zonas + ' ' + r24.zona);
    prueba('los chips de Costa Adeje: «UV 9 · muy alto» (8,6 → 9, la categoría del entero, con su color), 24°, Mar 21° y 15 km/h, cada uno con su icono; sin lluvia ni nieve (código 1)', r24.chips.join('|') === 'uv uv-muyalto=UV 9 · muy alto|=24°|=Mar 21°|=15 km/h', r24.chips.join('|'));
    /* a la una, «a la 01:10» (tx, 12-11-2026) */
    prueba('la fuente con su hora («Open-Meteo, a las HH:MM»; a la una, «a la 01:MM»), sin estado (hay datos) y sin geolocalización', /^Open-Meteo, a (las (?!01:)\d\d|la 01):\d\d$/.test(r24.fuente) && r24.estadoOculto && r24.geo === 0, r24.fuente + ' geo ' + r24.geo);
    /* el crédito de Open-Meteo, junto a sus datos (el de la app, tgoCreditoMeteo): con el mar, el del tiempo y la frase de Copernicus */
    const CR_TIEMPO = 'Open-Meteo.com · CC BY 4.0 · DWD · NOAA · ECMWF', CR_COPERNICUS = 'Generated using E.U. Copernicus Marine Service Information';
    const CR_A = 'https://open-meteo.com/|Open-Meteo.com|_blank|noopener,https://creativecommons.org/licenses/by/4.0/|CC BY 4.0|_blank|noopener';
    prueba('el crédito de Open-Meteo junto a sus datos, el de los paneles de la app: con el mar de Costa Adeje, «' + CR_TIEMPO + ' · ' + CR_COPERNICUS + '», con sus tres enlaces (en otra pestaña), sin traducir, en el color de la fuente (no en el blanco de los paneles oscuros)',
      r24.credito === CR_TIEMPO + ' · ' + CR_COPERNICUS && r24.creditoA === CR_A + ',https://marine.copernicus.eu/|' + CR_COPERNICUS + '|_blank|noopener' && r24.creditoSin && r24.creditoColor === r24.fuenteColor, JSON.stringify([r24.credito, r24.creditoA, r24.creditoColor, r24.fuenteColor]));
    const pet = peticiones.filter(u => /latitude=28\.078/.test(u));
    prueba('dos peticiones para Costa Adeje, con sus coordenadas, la hora de Canarias y los campos de la app (temperatura, UV, viento, código, día; del mar, temperatura y ola)', pet.length === 2 && pet.some(u => /api\.open-meteo\.com\/v1\/forecast\?latitude=28\.078&longitude=-16\.737&timezone=Atlantic%2FCanary&current=temperature_2m,uv_index,wind_speed_10m,weather_code,is_day&daily=uv_index_max&forecast_days=1$/.test(u))
      && pet.some(u => /marine-api\.open-meteo\.com\/v1\/marine\?latitude=28\.078&longitude=-16\.737&timezone=Atlantic%2FCanary&current=sea_surface_temperature,wave_height$/.test(u)), pet.join(' | '));
    const cache24 = JSON.parse(r24.cache || 'null');
    prueba('lo guardado en tenerife.cuerpo.hoy: la zona, la hora y los datos (temp 24,3; UV 8,6; máx 9,1; viento 15,2; código 1; día; mar 21,4; ola 0,8)', cache24 && cache24.zona === 'adeje' && Date.now() - cache24.t < 60000 && JSON.stringify(cache24.d) === '{"temp":24.3,"uv":8.6,"uvMax":9.1,"viento":15.2,"codigo":1,"dia":true,"mar":21.4,"ola":0.8}', r24.cache);
    /* el consejo: la semana cumplida (el ejemplo con el movimiento: 5 días con fuerza, 215 min) y el sol de la OMS por el UV máximo
       del día (9,1 → 9: evitar el sol del mediodía), con las cuatro horas alrededor del mediodía solar de Costa Adeje en hora
       de Canarias, redondeadas al cuarto de hora hacia fuera: entre 3 h 45 y 4 h 30, y con las 12:45 dentro (el mediodía solar
       a −16,74° cae entre las 12:50 y las 13:23 según el día del año) */
    const horas = r24.consejo.match(/de (\d\d):(\d\d) a (\d\d):(\d\d)\)/), minA = horas && (+horas[1] * 60 + +horas[2]), minB = horas && (+horas[3] * 60 + +horas[4]);
    prueba('el consejo: «Semana cumplida…» y «Con un UV máximo de 9 hoy, la OMS pide evitar el sol del mediodía (aquí, de HH:MM a HH:MM): sombra, camiseta, crema y sombrero.»', /^Semana cumplida: fuerza y movimiento\. Lo que haga hoy es de regalo\. Con un UV máximo de 9 hoy, la OMS pide evitar el sol del mediodía \(aquí, de \d\d:\d\d a \d\d:\d\d\): sombra, camiseta, crema y sombrero\.$/.test(r24.consejo), r24.consejo);
    prueba('…las horas: cuatro alrededor del mediodía solar de la zona (de 3 h 45 a 4 h 30, con las 12:45 dentro, a cuartos de hora)', horas && minB - minA >= 225 && minB - minA <= 270 && minA <= 12 * 60 + 45 && minB >= 12 * 60 + 45 && minA % 15 === 0 && minB % 15 === 0, horas && horas[0]);
    /* la isla */
    prueba('«Cruce la isla»: 33,5 km a pie de todos los tiempos (3 + 9,5 + 21; los 5 a nado no cuentan) de 85,55, dos paradas pasadas (La Esperanza y La Caldera), la siguiente El Portillo a 9,4 km', r24.km === '33,5' && r24.de === 'de 85,55 km' && r24.sig === 'Siguiente parada: El Portillo, a 9,4\u00a0km.' && r24.paradas === 'La Esperanza*,La Caldera*,El Portillo,Guajara,Vilaflor,Arona' && r24.pasadasBarra === 1 && r24.puntos === 5, JSON.stringify([r24.km, r24.de, r24.sig, r24.paradas, r24.pasadasBarra, r24.puntos]));
    prueba('el mapa: un solo dibujo (role img, con su aria-label y los km), el esquema (etiqueta «Esquema», la ruta a puntos), el Teide, el marcador movido y el trazo hecho, y la barra al 39,16 %', r24.svgs === 1 && r24.rol === 'img' && r24.aria === 'Esquema de Tenerife con el GR 131, de La Esperanza a Arona. Lleva 33,5 km.' && r24.esquema && r24.ruta === '0.1 4.6' && r24.teide === 'Teide' && /^translate\(/.test(r24.marca) && r24.hecha > 20 && /^39\.1\d*%$/.test(r24.barra), JSON.stringify([r24.svgs, r24.rol, r24.aria, r24.esquema, r24.ruta, r24.teide, r24.marca, r24.hecha, r24.barra]));
    prueba('el subtítulo y «Las cifras»: los 85,55 km de Tenerife ON, las paradas a los km acumulados de los tramos de Webtenerife y Arona, el final, a 85,55, la costa de los límites municipales del Cabildo (2015, CC BY), OpenStreetMap (ODbL) y que el trazado entre paradas es un esquema', r24.sub === 'El GR 131, de La Esperanza a Arona, con los kilómetros que anote aquí.' && /mide 85,55 km \(Tenerife ON, Cabildo de Tenerife\)/.test(r24.cifras) && /Las paradas están a los kilómetros acumulados de los tramos de Webtenerife \(La Caldera 29,8 · El Portillo 42,9 · Degollada de Guajara 56,0 · Vilaflor 67,3\), y Arona, el final, a 85,55\./.test(r24.cifras) && /la costa sale de los límites municipales del Cabildo de Tenerife \(2015, CC BY\) y las paradas, de OpenStreetMap/.test(r24.cifras) && /OpenStreetMap, ODbL/.test(r24.cifras) && /es un esquema, no el sendero\.$/.test(r24.cifras), r24.cifras);
    prueba('nada pasa del borde', !r24.desborde);

    /* la zona cambia a Teide: una sola petición (sin mar), de noche: el UV máximo del día (7,6 → 8: evitar el sol), 4 °C, 42 km/h y nieve (código 73); se recuerda */
    const antes = peticiones.length;
    await p24.selectOption('#tgc-hoy-zona', 'teide'); await p24.waitForTimeout(600);
    const t24 = await leer24();
    prueba('Teide: una petición más (solo el tiempo, sin mar), chips «UV máx. hoy 8», 4°, 42 km/h y «Nieve» (sin mar ni UV actual: es de noche), y la zona guardada', peticiones.length - antes === 1 && /latitude=28\.22/.test(peticiones[peticiones.length - 1]) && t24.chips.join('|') === 'uv=UV máx. hoy 8|=4°|=42 km/h|tiempo=Nieve' && t24.zona === 'teide' && JSON.parse(t24.cache).zona === 'teide', JSON.stringify([peticiones.length - antes, t24.chips, t24.zona]));
    prueba('…y el consejo mira el entero (7,6 → 8): «evitar el sol del mediodía»', /Con un UV máximo de 8 hoy, la OMS pide evitar el sol del mediodía/.test(t24.consejo), t24.consejo);
    prueba('…y en el Teide, sin mar, el crédito del tiempo solo («' + CR_TIEMPO + '», dos enlaces)', t24.credito === CR_TIEMPO && t24.creditoA === CR_A, JSON.stringify([t24.credito, t24.creditoA]));
    /* otra vez Costa Adeje: dentro de los 30 min no se vuelve a pedir nada; el tiempo sale de la caché */
    await p24.selectOption('#tgc-hoy-zona', 'adeje'); await p24.waitForTimeout(600);
    const antes2 = peticiones.length;
    await p24.evaluate(() => { TG_CUERPO.cerrar(); }); await p24.waitForTimeout(200); await suCuerpo(p24); await p24.waitForTimeout(300);
    const v24 = await leer24();
    prueba('cerrar y abrir dentro de los 30 min: ninguna petición nueva, los chips de la caché', peticiones.length === antes2 && v24.chips.length === 4 && v24.zona === 'adeje', (peticiones.length - antes2) + ' ' + v24.chips.join('|'));

    /* «Borrar los datos» se lleva también la zona y el tiempo guardados (la política dice que lo borra todo): vuelve Costa Adeje y se pide de nuevo */
    await p24.selectOption('#tgc-hoy-zona', 'teide'); await p24.waitForTimeout(600);
    const antes3 = peticiones.length;
    await p24.evaluate(() => document.getElementById('tgc-borrar').click()); await p24.evaluate(() => document.getElementById('tgc-borrar-si').click()); await p24.waitForTimeout(700);
    const bz = await leer24();
    prueba('«Borrar los datos» borra también tenerife.cuerpo.hoy: vuelve Costa Adeje, se pide otra vez y los chips llegan; 0 km en la isla', bz.cache !== null && JSON.parse(bz.cache).zona === 'adeje' && bz.zona === 'adeje' && peticiones.length > antes3 && bz.chips.length === 4 && bz.km === '0', JSON.stringify([bz.zona, bz.cache && JSON.parse(bz.cache).zona, peticiones.length - antes3, bz.chips.length, bz.km]));
    await ejemplo(p24); await conMov24([[0, 'caminar', 35, 3], [3, 'senderismo', 150, 9.5], [5, 'nadar', 30, 5], [12, 'senderismo', 240, 21]]);

    /* los avisos de AEMET: uno naranja de lluvia que cubre el sur (con el polígono de la zona «Este, sur y oeste» de AEMET), otro
       del mismo fenómeno que no debe repetirse, uno amarillo de viento solo en el norte; los de mañana no salen. Con wxDatos
       puesto a mano (el fichero de la app cambia cada día) */
    await p24.evaluate(() => {
      const hoy = new Date(), ini = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 0, 0, 0).toISOString(), fin = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59).toISOString();
      const man = new Date(hoy.getTime() + 864e5), ini2 = new Date(man.getFullYear(), man.getMonth(), man.getDate(), 0, 0, 0).toISOString(), fin2 = new Date(man.getFullYear(), man.getMonth(), man.getDate(), 23, 59, 59).toISOString();
      const SUR = ['28.27,-16.85 28.31,-16.79 28.27,-16.7 28.21,-16.68 28.2,-16.64 28.25,-16.55 28.28,-16.54 28.31,-16.5 28.35,-16.48 28.39,-16.44 28.34,-16.39 28.34,-16.36 28.31,-16.36 28.2,-16.42 28.14,-16.44 28.08,-16.49 28.03,-16.55 28.03,-16.6 28.0,-16.64 28.0,-16.68 28.01,-16.71 28.05,-16.71 28.05,-16.74 28.09,-16.74 28.11,-16.77 28.21,-16.84 28.27,-16.85'];
      const NORTE = ['28.49,-16.43 28.43,-16.39 28.39,-16.44 28.35,-16.48 28.31,-16.5 28.28,-16.54 28.25,-16.55 28.2,-16.64 28.21,-16.68 28.27,-16.7 28.31,-16.79 28.27,-16.85 28.31,-16.88 28.34,-16.92 28.36,-16.92 28.37,-16.86 28.39,-16.83 28.38,-16.81 28.37,-16.75 28.38,-16.7 28.4,-16.67 28.39,-16.6 28.42,-16.55 28.42,-16.52 28.44,-16.47 28.49,-16.43'];
      window.__wxAntes = wxDatos;
      wxDatos = { avisos: [
        { id: 'a1', nivel: 'naranja', fenomeno: 'PR', inicio: ini, fin: fin, zonas: [{ codigo: '659603', nombre_es: 'Este, sur y oeste de Tenerife', poligonos: SUR }] },
        { id: 'a2', nivel: 'amarillo', fenomeno: 'PR', inicio: ini, fin: fin, zonas: [{ codigo: '659603', nombre_es: 'Este, sur y oeste de Tenerife', poligonos: SUR }] },
        { id: 'a3', nivel: 'amarillo', fenomeno: 'VI', inicio: ini, fin: fin, zonas: [{ codigo: '659601', nombre_es: 'Norte de Tenerife', poligonos: NORTE }] },
        { id: 'a4', nivel: 'rojo', fenomeno: 'TO', inicio: ini2, fin: fin2, zonas: [{ codigo: '659603', nombre_es: 'Este, sur y oeste de Tenerife', poligonos: SUR }] }
      ] };
      TG_CUERPO.repintar();
    });
    await p24.waitForTimeout(200);
    const av24 = await leer24();
    prueba('los avisos de AEMET en Costa Adeje: el naranja de lluvias de hoy («⚠️ Aviso naranja · Lluvias · AEMET» y «De 00:00 a 23:59»), uno solo por fenómeno, sin el de viento del norte ni el rojo de mañana', !av24.avisoOculto && av24.avisos.length === 1 && /^⚠️ Aviso naranja · Lluvias · AEMET 🕐 De 00:00 a 23:59$/.test(av24.avisos[0]) && !!(await p24.$('#tgc-hoy-aviso .tgc-aviso-naranja')), JSON.stringify(av24.avisos));
    await p24.selectOption('#tgc-hoy-zona', 'puerto'); await p24.waitForTimeout(600);
    const av24b = await leer24();
    prueba('en Puerto de la Cruz (norte): el amarillo de vientos, y no el del sur', av24b.avisos.length === 1 && /^⚠️ Aviso amarillo · Vientos · AEMET/.test(av24b.avisos[0]), JSON.stringify(av24b.avisos));
    await p24.evaluate(() => { wxDatos = { avisos: [] }; TG_CUERPO.repintar(); }); await p24.waitForTimeout(100);
    prueba('sin avisos, la línea no está', await p24.evaluate(() => document.getElementById('tgc-hoy-aviso').hidden && !document.querySelectorAll('#tgc-hoy-aviso p').length));
    await p24.evaluate(() => { wxDatos = window.__wxAntes; });
    await p24.selectOption('#tgc-hoy-zona', 'adeje'); await p24.waitForTimeout(600);

    /* el consejo según la semana: sin nada, el primer paso; con fuerza a medias, los días que faltan y los grupos sin anotar (los de su deporte si lo eligió); con la fuerza hecha y pocos minutos, los minutos */
    await p24.evaluate(() => { localStorage.setItem('tenerife.cuerpo', JSON.stringify({ v: 1, series: [], mov: [] })); TG_CUERPO.abrir(); }); await p24.waitForTimeout(300);
    const c1 = await leer24();
    prueba('sin nada anotado: «Un buen primer paso…» más el sol; 0 km, La Caldera a 29,8 km, La Esperanza pasada (el inicio), barra al 0 %', /^Un buen primer paso: toque una zona de su cuerpo y anote lo que haga hoy\. Con un UV máximo de 9 hoy/.test(c1.consejo) && c1.km === '0' && c1.sig === 'Siguiente parada: La Caldera, a 29,8\u00a0km.' && c1.paradas.startsWith('La Esperanza*,La Caldera,') && c1.barra === '0%' && c1.aria.endsWith('Lleva 0 km.'), JSON.stringify([c1.consejo, c1.km, c1.sig, c1.barra]));
    await p24.evaluate(() => {
      const ymd = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      localStorage.setItem('tenerife.cuerpo', JSON.stringify({ v: 1, series: [{ d: ymd(new Date()), g: 'pecho', n: 3, t: 1 }], mov: [], deporte: 'senderismo' })); TG_CUERPO.abrir();
    }); await p24.waitForTimeout(300);
    const c2 = await leer24();
    prueba('un día de fuerza (pecho) y senderismo elegido: «Le falta 1 día de fuerza…» y «Para Senderismo y caminar, aún sin anotar: Cuádriceps, Glúteos y cadera, Pantorrillas y espinillas.» (los grupos prioritarios de su deporte, como los nombra el módulo)', /^Le falta 1 día de fuerza para cerrar la semana\. Para Senderismo y caminar, aún sin anotar: Cuádriceps, Glúteos y cadera, Pantorrillas y espinillas\. Con un UV máximo de 9 hoy/.test(c2.consejo), c2.consejo);
    await p24.evaluate(() => {
      const ymd = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      const ayer = new Date(); ayer.setDate(ayer.getDate() - 1);
      localStorage.setItem('tenerife.cuerpo', JSON.stringify({ v: 1, series: [{ d: ymd(new Date()), g: 'pecho', n: 3, t: 1 }, { d: ymd(ayer), g: 'dorsal', n: 3, t: 2 }], mov: [{ d: ymd(new Date()), tipo: 'caminar', min: 40, km: 3, t: 3 }] })); TG_CUERPO.abrir();
    }); await p24.waitForTimeout(300);
    const c3 = await leer24();
    prueba('dos días de fuerza y 40 min: «Le faltan 110 minutos de movimiento para cerrar la semana.»', /^Le faltan 110 minutos de movimiento para cerrar la semana\. Con un UV máximo de 9 hoy/.test(c3.consejo), c3.consejo);
    /* de 5 a 17 años: 3 días y 420 min */
    await p24.evaluate(() => { localStorage.setItem('tenerife.perfil', JSON.stringify({ nacimiento: new Date().getFullYear() - 15 })); TG_CUERPO.repintar(); }); await p24.waitForTimeout(200);
    const c4 = await leer24();
    prueba('con 15 años: «Le falta 1 día de fuerza…» (la meta es 3)', /^Le falta 1 día de fuerza para cerrar la semana\./.test(c4.consejo), c4.consejo);
    await p24.evaluate(() => { localStorage.removeItem('tenerife.perfil'); TG_CUERPO.repintar(); });

    /* anotar movimiento con km: el marcador avanza animado (1,4 s) hasta los km nuevos; la isla se enseña */
    await conMov24([[0, 'caminar', 35, 3], [3, 'senderismo', 150, 9.5], [12, 'senderismo', 240, 21]]);
    const marcaAntes = await p24.evaluate(() => document.getElementById('tgc-isla-marca').getAttribute('transform'));
    await p24.click('#tgc-mov-btn'); await p24.waitForTimeout(350);
    await p24.click('#tgc-mov-tipos .tgc-tipo[data-tipo="senderismo"]'); await p24.fill('#tgc-mov-km', '5'); await p24.dispatchEvent('#tgc-mov-km', 'change');
    const notaPie = await p24.evaluate(() => document.getElementById('tgc-mov-nota').textContent);
    await p24.click('#tgc-mov-tipos .tgc-tipo[data-tipo="nadar"]'); await p24.waitForTimeout(60);
    const notaNado = await p24.evaluate(() => document.getElementById('tgc-mov-nota').textContent);
    prueba('la nota de la hoja: a pie, «Los kilómetros a pie avanzan su travesía del GR 131.»; a nado (bloques 7 y encima), «Suma minutos y distancia a su semana. Por el agua se rodea la isla, no se cruza: su distancia no cuenta para el GR 131.»', notaPie === 'Los kilómetros a pie avanzan su travesía del GR 131.' && notaNado === 'Suma minutos y distancia a su semana. Por el agua se rodea la isla, no se cruza: su distancia no cuenta para el GR 131.', notaPie + ' | ' + notaNado);
    await p24.click('#tgc-mov-tipos .tgc-tipo[data-tipo="senderismo"]'); await p24.fill('#tgc-mov-km', '5'); await p24.dispatchEvent('#tgc-mov-km', 'change'); await p24.waitForTimeout(60);
    await p24.click('#tgc-mov-guardar'); await p24.waitForTimeout(250);
    const medio = await p24.evaluate(() => ({ marca: document.getElementById('tgc-isla-marca').getAttribute('transform'), km: document.getElementById('tgc-isla-km').textContent }));
    await p24.waitForTimeout(1700);
    const fin24 = await p24.evaluate(() => ({ marca: document.getElementById('tgc-isla-marca').getAttribute('transform'), km: document.getElementById('tgc-isla-km').textContent, sig: document.getElementById('tgc-isla-sig').textContent, barra: document.getElementById('tgc-tramo-hecho').style.width }));
    prueba('anotar 5 km a pie: 38,5 km, El Portillo a 4,4 km, la barra al 45 %, y el marcador se mueve (a los 250 ms ya no está donde estaba; a los 2 s, quieto en los 38,5)', fin24.km === '38,5' && fin24.sig === 'Siguiente parada: El Portillo, a 4,4\u00a0km.' && /^45\.0\d*%$/.test(fin24.barra) && medio.marca !== marcaAntes && fin24.marca !== marcaAntes, JSON.stringify([marcaAntes, medio, fin24]));
    await p24.evaluate(() => { TG_CUERPO.repintar(); }); await p24.waitForTimeout(50);
    prueba('…y al volver a pintar sin anotar, el marcador no se mueve del sitio', await p24.evaluate(m => document.getElementById('tgc-isla-marca').getAttribute('transform') === m, fin24.marca));
    /* la travesía entera */
    await conMov24([[1, 'senderismo', 300, 40], [8, 'senderismo', 300, 30], [20, 'caminar', 200, 16]]);
    const fin24b = await leer24();
    prueba('86 km a pie: «Ha cruzado la isla: de La Esperanza a Arona.» (desde el bloque 7, sin «a pie»: puede contar también la bici), las seis paradas pasadas y la barra al 100 %', fin24b.km === '86' && fin24b.sig === 'Ha cruzado la isla: de La Esperanza a Arona.' && fin24b.paradas.split(',').every(p => /\*$/.test(p)) && fin24b.barra === '100%' && fin24b.pasadasBarra === 5, JSON.stringify([fin24b.km, fin24b.sig, fin24b.paradas, fin24b.barra]));

    /* sin red: con la caché vieja (3 h), los chips de la caché y «de hace 3 h (sin conexión ahora)»; sin caché, «Sin datos…» y el consejo solo con la semana */
    red = false;
    await p24.evaluate(() => { const c = JSON.parse(localStorage.getItem('tenerife.cuerpo.hoy')); c.t = Date.now() - 3 * 36e5; localStorage.setItem('tenerife.cuerpo.hoy', JSON.stringify(c)); });
    await p24.reload({ waitUntil: 'load' }); await abrirApp(p24); await abrirPerfilCuerpo(p24); await suCuerpo(p24); await p24.waitForTimeout(700);
    const sr = await leer24();
    prueba('sin red, con lo guardado hace 3 h: los chips de entonces y «Open-Meteo, de hace 3 h (sin conexión ahora)»; sin estado', sr.chips.length === 4 && sr.fuente === 'Open-Meteo, de hace 3 h (sin conexión ahora)' && sr.estadoOculto, JSON.stringify([sr.chips, sr.fuente, sr.estado]));
    await p24.evaluate(() => { localStorage.removeItem('tenerife.cuerpo.hoy'); });
    await p24.reload({ waitUntil: 'load' }); await abrirApp(p24); await abrirPerfilCuerpo(p24); await suCuerpo(p24); await p24.waitForTimeout(700);
    const sn = await leer24();
    prueba('sin red y sin nada guardado: ningún chip, «Sin datos del tiempo ahora. Compruebe la conexión.», sin fuente ni crédito, y el consejo solo con la semana (sin sol)', sn.chips.length === 0 && sn.estado === 'Sin datos del tiempo ahora. Compruebe la conexión.' && !sn.estadoOculto && sn.fuente === '' && sn.credito === '' && !/OMS/.test(sn.consejo) && sn.consejo.length > 10, JSON.stringify([sn.chips, sn.estado, sn.fuente, sn.consejo]));
    red = true;

    /* el trazado oficial: un fichero válido (recto entre paradas, con los km clavados) quita «Esquema» y dibuja la línea seguida con su fuente en «Las cifras»; uno malo (km que retroceden) se descarta */
    const trazado = (malo) => { const pts = []; for (let i = 0; i < PARADAS.length - 1; i++) { const a = PARADAS[i], b = PARADAS[i + 1]; for (let k = 0; k < 20; k++) { const f = k / 20; pts.push([+(a.lat + (b.lat - a.lat) * f).toFixed(5), +(a.lon + (b.lon - a.lon) * f).toFixed(5), +(a.km + (b.km - a.km) * f).toFixed(2)]); } } pts.push([PARADAS[5].lat, PARADAS[5].lon, 85.55]); if (malo) pts[40][2] = 10; return { fuente: 'PRUEBA (no oficial)', generado: '2026-11-08', puntos: pts }; };
    let bueno = true;
    await p24.route('**/datos/cuerpo/gr131-trazado.json', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(trazado(!bueno)) }));
    await p24.reload({ waitUntil: 'load' }); await abrirApp(p24); await abrirPerfilCuerpo(p24); await suCuerpo(p24); await p24.waitForTimeout(700);
    const of24 = await leer24();
    prueba('con el trazado oficial: sin «Esquema», la ruta seguida (sin puntos), 101 vértices, un solo dibujo, y «Las cifras» con su fuente («El trazado del GR 131 del mapa es el oficial: PRUEBA (no oficial).»)', !of24.esquema && of24.ruta === null && of24.svgs === 1 && /El trazado del GR 131 del mapa es el oficial: PRUEBA \(no oficial\)\.$/.test(of24.cifras) && !/es un esquema/.test(of24.cifras)
      && (await p24.evaluate(() => document.querySelector('#tgc-mapa .tgc-isla-ruta').getAttribute('d').split('L').length)) === 101 && of24.paradas === 'La Esperanza*,La Caldera*,El Portillo*,Guajara*,Vilaflor*,Arona*', JSON.stringify([of24.esquema, of24.ruta, of24.svgs, of24.cifras.slice(-90)]));
    bueno = false;
    await p24.reload({ waitUntil: 'load' }); await abrirApp(p24); await abrirPerfilCuerpo(p24); await suCuerpo(p24); await p24.waitForTimeout(700);
    const mal24 = await leer24();
    prueba('un trazado malo (los km retroceden) se descarta: sigue el esquema', mal24.esquema && mal24.ruta === '0.1 4.6' && /es un esquema, no el sendero\.$/.test(mal24.cifras), JSON.stringify([mal24.esquema, mal24.ruta]));
    await p24.unroute('**/datos/cuerpo/gr131-trazado.json');

    /* los diez idiomas: nada vacío, nada en castellano fuera del castellano (menos los nombres propios), sin desborde; y la política de privacidad nombra la zona de «Hoy en la isla» */
    await p24.reload({ waitUntil: 'load' }); await abrirApp(p24); await abrirPerfilCuerpo(p24); await suCuerpo(p24); await ejemplo(p24);
    await conMov24([[0, 'caminar', 35, 3], [3, 'senderismo', 150, 9.5], [12, 'senderismo', 240, 21]]);
    await p24.waitForFunction(() => document.querySelectorAll('#tgc-hoy-chips .tgc-hoy-chip').length > 0, null, { timeout: 5000 }).catch(() => {});
    const esTx24 = {};
    for (const l of ['es', 'en', 'fr', 'de', 'it', 'nl', 'zh', 'zht', 'bg', 'pl']) {
      await idioma(p24, l); await p24.waitForTimeout(100);
      const t = await p24.evaluate(l => {
        const g = id => document.getElementById(id).textContent.trim();
        return { tit: g('tgc-hoy-tit'), zonaL: g('tgc-hoy-zona-l'), chips: [...document.querySelectorAll('#tgc-hoy-chips .tgc-hoy-chip')].map(c => c.textContent.trim()).join(' | '), consejo: g('tgc-hoy-consejo'), fuente: g('tgc-hoy-fuente'),
          islaTit: g('tgc-isla-tit'), sub: g('tgc-isla-sub'), esquema: g('tgc-isla-esquema'), de: g('tgc-isla-de'), sig: g('tgc-isla-sig'), aria: document.querySelector('#tgc-mapa svg').getAttribute('aria-label'), cifras: g('tgc-cifras-isla'),
          zonas: [...document.getElementById('tgc-hoy-zona').options].map(o => o.textContent).join(','), privacidad: UI_TX.ppDatosCuerpoTxt[l], hoyTit: UI_TX.cuerpoHoyTitulo[l],
          desborde: document.getElementById('cuerpo-panel').scrollWidth > document.getElementById('cuerpo-panel').clientWidth, lang: document.getElementById('cuerpo-panel').getAttribute('lang') };
      }, l);
      if (l === 'es') Object.assign(esTx24, t);
      const claves = ['tit', 'zonaL', 'chips', 'consejo', 'fuente', 'islaTit', 'sub', 'esquema', 'de', 'sig', 'aria', 'cifras'];
      const vacias = claves.filter(k => !t[k]), iguales = l === 'es' ? [] : claves.filter(k => t[k] === esTx24[k]);
      prueba(l + ': «Hoy en la isla» y «Cruce la isla» con todos sus textos' + (l === 'es' ? '' : ', en su idioma') + ', las seis zonas con su nombre propio, sin desborde, y la política de privacidad nombra la zona de «' + t.hoyTit + '»',
        !vacias.length && !iguales.length && t.zonas === 'Costa Adeje,El Médano,Los Gigantes,Puerto de la Cruz,Santa Cruz,Teide' && !t.desborde && t.privacidad.indexOf(t.hoyTit) > 0 && /85[.,]55/.test(t.de) && /85[.,]55/.test(t.cifras) && t.lang === (l === 'zht' ? 'zh-Hant' : l === 'zh' ? 'zh-Hans' : l), JSON.stringify({ vacias, iguales, zonas: t.zonas, desborde: t.desborde, priv: t.privacidad.indexOf(t.hoyTit) }));
    }
    await idioma(p24, 'es');
    prueba('bloque 5: sin errores de página', e24.length === 0, e24.join(' | '));
    await c24.close();
  }

  // 25. (8-11-2026, bloque 6) los sellos y la postal. Once sellos que se consiguen una vez y se quedan en el dispositivo
  //     con su fecha (tenerife.cuerpo, sellos): el primer paso, los días de fuerza y los minutos de la semana (por la meta
  //     de la edad: 2 y 150; de 5 a 17 años, 3 y 420), el sol entero, los 12 grupos, 10 km a pie y las cinco paradas del
  //     GR 131. El que se cumple por primera vez se celebra con una tarjeta (diálogo modal, con la pantalla inerte debajo;
  //     varios de golpe, una sola tarjeta con los tres últimos dibujados); con una hoja abierta, la celebración espera a
  //     que se cierre y la hoja del grupo lo dice en una línea; «Seguir», Escape y TG_CUERPO.cerrarFiesta la cierran y el
  //     foco vuelve. «Su postal»: la vista previa (la escena y el personaje), «Crear mi postal» hace una imagen PNG de
  //     1080 × 1350 en un lienzo y la enseña en la tarjeta para guardarla con el dedo, compartirla (Web Share con ficheros,
  //     donde lo haya) o descargarla (tenerife-go-mi-semana.png); de noche, con la banda oscura. «Borrar los datos» se los
  //     lleva. En los diez idiomas, con la política de privacidad nombrando los sellos; a 320 px; con el 3D (la foto del
  //     motor en la vista previa y en la postal, y la sonrisa); y con «reducir movimiento», sin rayos
  {
    const fs25 = require('fs'), path25 = require('path'), os25 = require('os');
    const L25 = ['es', 'en', 'fr', 'de', 'it', 'nl', 'zh', 'zht', 'bg', 'pl'];
    const MOV25 = [[0, 'caminar', 35, 3], [3, 'senderismo', 150, 9.5], [12, 'senderismo', 240, 21]];   /* 33,5 km a pie: La Caldera pasada, El Portillo a 9,4 */
    const leer25 = (p) => p.evaluate(() => {
      const g = id => document.getElementById(id), f = g('tgc-fiesta'), q = (s, r) => (r || f).querySelector(s), a = document.activeElement;
      const mini = g('tgc-postal-mini');
      return { orden: [...g('tgc-vista-musculos').querySelectorAll(':scope > section')].map(s => s.className.split(' ')[0]).join(' '),
        sellos: [...document.querySelectorAll('#tgc-sellos-lista .tgc-sello')].map(li => ({ id: li.dataset.id, falta: li.classList.contains('falta'), nuevo: li.classList.contains('nuevo'), svg: !!li.querySelector('svg'),
          nom: li.querySelector('.tgc-sello-nom').textContent, cond: li.querySelector('.tgc-sello-cond').textContent, sr: li.querySelector('.tgc-sr').textContent, anillo: [...li.querySelectorAll('textPath')].map(t => t.textContent).join('/') })),
        n: g('tgc-sellos-n').textContent, fiesta: !f.hidden, dentro: f.classList.contains('dentro'), tit: (q('#tgc-fiesta-tit') || {}).textContent, txt: (q('#tgc-fiesta-txt') || {}).textContent,
        botones: [...f.querySelectorAll('#tgc-fiesta-botones button')].map(b => b.textContent + (b.classList.contains('gold') ? '*' : '')), rayos: f.querySelectorAll('.tgc-fiesta-rayos i').length,
        varios: f.querySelectorAll('.tgc-fiesta-varios svg').length, grande: f.querySelectorAll('.tgc-fiesta-tarj > svg').length, dialogo: !!q('.tgc-fiesta-tarj[role="dialog"][aria-modal="true"][aria-labelledby="tgc-fiesta-tit"]'),
        foco: a ? (a.id ? '#' + a.id : a.className.split(' ')[0] + (a.dataset && a.dataset.g ? '[' + a.dataset.g + ']' : '') + (a.closest('#tgc-fiesta') ? ' (fiesta: ' + a.textContent + ')' : '')) : '', inerte: g('tgc').inert && g('tgc-modos').inert,
        hojaSello: g('tgc-hoja-sello').textContent, hojaSelloOculto: g('tgc-hoja-sello').hidden, abierto: TG_CUERPO.abierto(),
        guardado: (JSON.parse(localStorage.getItem('tenerife.cuerpo') || '{}').sellos) || null, hoyTxt: new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date()),
        hoyYmd: (d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'))(new Date()),
        postal: { tit: g('tgc-postal-tit').textContent, p: g('tgc-postal-p').textContent, btn: g('tgc-postal-btn-txt').textContent, desactivado: g('tgc-postal-btn').disabled, miniSvg: mini.querySelectorAll('svg').length, miniImg: mini.querySelectorAll('img').length,
          miniFig: !!mini.querySelector('.tgc-postal-mini-fig'), miniHtml: mini.innerHTML.length, idsRepetidos: [...mini.querySelectorAll('[id]')].filter(e => document.querySelectorAll('#' + CSS.escape(e.id)).length > 1).map(e => e.id) },
        desborde: g('cuerpo-panel').scrollWidth > g('cuerpo-panel').clientWidth };
    });
    /* la tarjeta de la postal: su imagen, sus botones, y unos píxeles de la imagen (la banda de las cifras, abajo) */
    const postal25 = (p) => p.evaluate(() => {
      const im = document.querySelector('#tgc-fiesta img.tgc-postal-img'); if (!im) return null;
      const c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight; const x = c.getContext('2d'); x.drawImage(im, 0, 0);
      const px = (X, Y) => [...x.getImageData(X, Y, 1, 1).data].slice(0, 3);
      const colores = new Set(); for (let i = 0; i < 20; i++) colores.add(px(60 + i * 48, 200 + i * 40).join(','));
      return { src: im.src.slice(0, 5), nat: im.naturalWidth + 'x' + im.naturalHeight, alt: im.alt, completa: im.complete, banda: px(540, 1350 - 252 + 20), banda2: px(200, 1350 - 60), cielo: px(540, 40), colores: colores.size,
        tit: document.getElementById('tgc-fiesta-tit').textContent, txt: document.getElementById('tgc-fiesta-txt').textContent, botones: [...document.querySelectorAll('#tgc-fiesta-botones button')].map(b => b.textContent),
        share: !!(navigator.share && navigator.canShare), rayos: document.querySelectorAll('#tgc-fiesta .tgc-fiesta-rayos i').length, rect: (r => ({ l: Math.round(r.left), r: Math.round(r.right), t: Math.round(r.top), b: Math.round(r.bottom) }))(document.querySelector('#tgc-fiesta .tgc-fiesta-tarj').getBoundingClientRect()) };
    });
    const esperarPostal = (p) => p.waitForFunction(() => { const im = document.querySelector('#tgc-fiesta img.tgc-postal-img'); return !document.getElementById('tgc-fiesta').hidden && im && im.complete && im.naturalWidth > 0; }, null, { timeout: 20000 });
    const claro = c => c.every(v => v > 200), oscuro = c => c.every(v => v < 80);

    const c25 = await contexto(b, { fiesta: true, blob: true, contexto: { acceptDownloads: true } }), p25 = await c25.newPage(), e25 = []; vigilar(p25, e25);
    await abrirApp(p25); await abrirPerfilCuerpo(p25); await suCuerpo(p25);
    await vacio(p25); await p25.waitForTimeout(200);
    const v25 = await leer25(p25);
    prueba('en «Músculos», tras los 12 grupos, «Sus sellos» y «Su postal»', /tgc-grupos tgc-sellos tgc-postal$/.test(v25.orden), v25.orden);
    prueba('sin nada anotado: los 11 sellos pendientes («0 de 11»), cada uno con su dibujo, su nombre, su condición y «Pendiente.» para el lector de pantalla; nada guardado, ninguna celebración',
      v25.sellos.length === 11 && v25.sellos.every(s => s.falta && !s.nuevo && s.svg && s.nom && s.cond && s.sr === 'Pendiente.' && s.anillo === '') && v25.n === '0 de 11' && !v25.fiesta && v25.guardado === null, JSON.stringify([v25.n, v25.fiesta, v25.guardado, v25.sellos.map(s => s.sr)]));
    prueba('los nombres y las condiciones: Primer paso (Su primera anotación), 2 días de fuerza (En 7 días), 150 minutos (De movimiento en 7 días), Sol entero (Fuerza y movimiento), Doce de doce (Los 12 grupos en 7 días), 10 km de travesía (Camino del GR 131; «a pie» hasta el bloque 7) y las cinco paradas del GR 131 con su km (29,8 · 42,9 · 56,0 · 67,3 · 85,55)',
      v25.sellos.map(s => s.id + ':' + s.nom + '/' + s.cond).join('|') === 'primer:Primer paso/Su primera anotación|fuerza:2 días de fuerza/En 7 días|mov:150 minutos/De movimiento en 7 días|sol:Sol entero/Fuerza y movimiento|doce:Doce de doce/Los 12 grupos en 7 días|km10:10 km de travesía/Camino del GR 131|e1:La Caldera/GR 131 · km 29,8|e2:El Portillo/GR 131 · km 42,9|e3:Guajara/GR 131 · km 56,0|e4:Vilaflor/GR 131 · km 67,3|e5:Arona/GR 131 · km 85,55',
      v25.sellos.map(s => s.id + ':' + s.nom + '/' + s.cond).join('|'));
    prueba('«Su postal»: el título, el texto, «Crear mi postal» y la vista previa (la escena y el personaje dibujados, sin ids repetidos en la página)', v25.postal.tit === 'Su postal' && v25.postal.p === 'Su semana en una imagen, para guardarla o enviarla.' && v25.postal.btn === 'Crear mi postal' && !v25.postal.desactivado
      && v25.postal.miniSvg >= 2 && v25.postal.miniFig && v25.postal.miniImg === 0 && v25.postal.idsRepetidos.length === 0, JSON.stringify(v25.postal));
    prueba('nada pasa del borde', !v25.desborde);

    /* el ejemplo con 33,5 km a pie: seis sellos de golpe, con el foco puesto antes en el botón del tema (ahí tiene que volver) */
    await p25.focus('#tgc-tema');
    await ejemplo(p25, { mov: MOV25 }); await p25.waitForTimeout(500);
    const s1 = await leer25(p25);
    prueba('el ejemplo con 33,5 km a pie: seis sellos de golpe (Primer paso, 2 días de fuerza, 150 minutos, Sol entero, 10 km a pie y La Caldera), guardados con la fecha de hoy, marcados «nuevo», «6 de 11»; «Doce de doce» (11 grupos en 7 días) y las otras paradas, pendientes',
      s1.sellos.filter(s => !s.falta).map(s => s.id).join() === 'primer,fuerza,mov,sol,km10,e1' && s1.sellos.filter(s => !s.falta).every(s => s.nuevo && s.sr === 'Conseguido el ' + s1.hoyTxt + '.' && s.anillo === 'TENERIFE GO/' + s1.hoyTxt.toUpperCase()) && s1.sellos.filter(s => s.falta).every(s => !s.nuevo)
      && s1.n === '6 de 11' && s1.guardado && Object.keys(s1.guardado).sort().join() === 'e1,fuerza,km10,mov,primer,sol' && Object.values(s1.guardado).every(f => f === s1.hoyYmd), JSON.stringify([s1.n, s1.guardado, s1.sellos.filter(s => !s.falta).map(s => s.sr + ' ' + s.anillo)]));
    prueba('la celebración: una tarjeta (diálogo modal con su título) con los tres últimos sellos dibujados, «6 sellos nuevos», la lista y la frase del último («… La Caldera. Etapa 1 del GR 131 cumplida. Lleva 33,5 km de travesía.»), 14 rayos, un solo botón «Seguir» (de oro) con el foco, y la pantalla inerte debajo',
      s1.fiesta && s1.dentro && s1.dialogo && s1.varios === 3 && s1.grande === 0 && s1.tit === '6 sellos nuevos' && s1.txt === 'Primer paso, 2 días de fuerza, 150 minutos, Sol entero, 10 km de travesía, La Caldera. Etapa 1 del GR 131 cumplida. Lleva 33,5\u00a0km de travesía.' && s1.rayos === 14 && s1.botones.join() === 'Seguir*' && /fiesta: Seguir/.test(s1.foco) && s1.inerte,
      JSON.stringify([s1.fiesta, s1.dentro, s1.dialogo, s1.varios, s1.grande, s1.tit, s1.txt, s1.rayos, s1.botones, s1.foco, s1.inerte]));
    await p25.click('#tgc-fiesta-botones button'); await p25.waitForTimeout(500);
    const s2 = await leer25(p25);
    prueba('«Seguir» cierra la tarjeta: nada inerte, el foco vuelve al botón del tema, la pantalla sigue abierta y los sellos se quedan', !s2.fiesta && !s2.inerte && s2.foco === '#tgc-tema' && s2.abierto && s2.n === '6 de 11', JSON.stringify([s2.fiesta, s2.inerte, s2.foco, s2.abierto, s2.n]));

    /* al volver a abrir la app, siguen; y aunque pase la semana (todo lo anotado hace 10 días más), siguen con su fecha */
    await p25.reload({ waitUntil: 'load' }); await abrirApp(p25); await abrirPerfilCuerpo(p25); await suCuerpo(p25); await p25.waitForTimeout(400);
    const s3 = await leer25(p25);
    prueba('al volver a abrir la app: los seis sellos siguen, con «Conseguido el <hoy>.», sin la marca de nuevo y sin celebración (ya se celebraron)', s3.n === '6 de 11' && !s3.fiesta && s3.sellos.filter(s => !s.falta).length === 6 && s3.sellos.every(s => !s.nuevo) && s3.sellos.filter(s => !s.falta).every(s => s.sr === 'Conseguido el ' + s3.hoyTxt + '.'), JSON.stringify([s3.n, s3.fiesta, s3.sellos.map(s => s.sr)]));
    await p25.evaluate(() => {
      const ymd = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      const atras = s => { const p = s.split('-').map(Number), d = new Date(p[0], p[1] - 1, p[2]); d.setDate(d.getDate() - 10); return ymd(d); };
      const g = JSON.parse(localStorage.getItem('tenerife.cuerpo')); g.series.forEach(s => { s.d = atras(s.d); }); g.mov.forEach(m => { m.d = atras(m.d); }); localStorage.setItem('tenerife.cuerpo', JSON.stringify(g)); TG_CUERPO.abrir();
    }); await p25.waitForTimeout(400);
    const s4 = await leer25(p25);
    const semana4 = await p25.evaluate(() => document.querySelectorAll('#tgc-cielo .tgc-rayo.on, #tgc-cielo .tgc-rayo.encendido').length + ' rayos encendidos; ' + document.querySelectorAll('#tgc-lista .tgc-fila.con').length + ' grupos con series');
    prueba('pasada la semana (todo lo anotado, 10 días más atrás): la semana en cero (ningún grupo con series en 7 días) y los seis sellos siguen con su fecha, sin celebración', s4.n === '6 de 11' && !s4.fiesta && /; 0 grupos/.test(semana4) && s4.sellos.filter(s => !s.falta).every(s => s.sr === 'Conseguido el ' + s4.hoyTxt + '.'), JSON.stringify([s4.n, s4.fiesta, semana4]));
    /* de 5 a 17 años: los sellos de la semana se llaman por la meta de su edad */
    await p25.evaluate(() => { localStorage.setItem('tenerife.perfil', JSON.stringify({ nacimiento: new Date().getFullYear() - 15 })); TG_CUERPO.repintar(); }); await p25.waitForTimeout(200);
    const s5 = await leer25(p25);
    prueba('con 15 años (perfil con el año de nacimiento): «3 días de fuerza» y «420 minutos» (las metas de la OMS para su edad); el que ya tenía sigue conseguido', s5.sellos[1].nom === '3 días de fuerza' && s5.sellos[2].nom === '420 minutos' && !s5.sellos[1].falta && !s5.sellos[2].falta && s5.n === '6 de 11', JSON.stringify([s5.sellos[1], s5.sellos[2], s5.n]));
    await p25.evaluate(() => { localStorage.removeItem('tenerife.perfil'); TG_CUERPO.repintar(); }); await p25.waitForTimeout(100);

    /* con una hoja abierta, la celebración espera: el ejemplo de hoy (11 grupos en 7 días), la hoja de los antebrazos (el que falta) y «+ 1 serie» */
    await ejemplo(p25, { mov: MOV25, sellos: s1.guardado }); await p25.waitForTimeout(300);
    await p25.click('#tgc-lista .tgc-fila[data-g="antebrazo"]'); await p25.waitForTimeout(450);
    const h0 = await leer25(p25);
    await p25.click('#tgc-guardar'); await p25.waitForTimeout(400);
    const h1 = await leer25(p25);
    prueba('con la hoja de un grupo abierta, «+ 1 serie» completa los 12 grupos: el sello se guarda y se pinta («7 de 11»), la hoja dice «Sello nuevo: Doce de doce» y la tarjeta espera (no se planta encima de la hoja)',
      h0.hojaSelloOculto && !h1.fiesta && h1.n === '7 de 11' && !h1.hojaSelloOculto && h1.hojaSello === 'Sello nuevo: Doce de doce' && h1.guardado && h1.guardado.doce === Object.values(h1.guardado)[0] && h1.sellos[4].id === 'doce' && !h1.sellos[4].falta, JSON.stringify([h0.hojaSelloOculto, h1.fiesta, h1.n, h1.hojaSello, h1.hojaSelloOculto]));
    await p25.keyboard.press('Escape'); await p25.waitForTimeout(500);
    const h2 = await leer25(p25);
    prueba('al cerrar la hoja (Escape): la tarjeta de «Doce de doce» con su sello grande, «Ha trabajado los 12 grupos musculares en 7 días.» y «Seguir»; la línea de la hoja se vacía', h2.fiesta && h2.grande === 1 && h2.varios === 0 && h2.tit === 'Doce de doce' && h2.txt === 'Ha trabajado los 12 grupos musculares en 7 días.' && h2.botones.join() === 'Seguir*' && h2.inerte && h2.hojaSelloOculto && h2.hojaSello === '',
      JSON.stringify([h2.fiesta, h2.grande, h2.varios, h2.tit, h2.txt, h2.botones, h2.inerte, h2.hojaSello, h2.hojaSelloOculto]));
    await p25.click('#tgc-fiesta-botones button'); await p25.waitForTimeout(500);
    const h3 = await leer25(p25);
    /* el foco: la rejilla se volvió a pintar con la serie, así que el botón del grupo de antes de la hoja ya no existe y la tarjeta se abrió sin nada enfocado; al cerrarla, el foco va a la flecha de la cabecera */
    prueba('«Seguir»: nada inerte y el foco en la flecha de la cabecera (el botón del grupo de antes de la hoja se volvió a pintar con la serie: ya no existe)', !h3.fiesta && !h3.inerte && h3.foco === '#tgc-back', h3.foco);

    /* «Anotar movimiento» con km que cruzan una parada: la tarjeta de la parada en cuanto se cierra la hoja; Escape la cierra */
    await p25.click('#tgc-mov-btn'); await p25.waitForTimeout(400);
    await p25.click('#tgc-mov-tipos .tgc-tipo[data-tipo="senderismo"]'); await p25.fill('#tgc-mov-km', '10'); await p25.dispatchEvent('#tgc-mov-km', 'change'); await p25.waitForTimeout(80);
    await p25.click('#tgc-mov-guardar'); await p25.waitForTimeout(900);
    const m1 = await leer25(p25);
    prueba('anotar 10 km a pie (33,5 → 43,5, pasado El Portillo, 42,9): la tarjeta «El Portillo» con «Etapa 2 del GR 131 cumplida. Lleva 43,5 km de travesía.», «8 de 11»', m1.fiesta && m1.grande === 1 && m1.tit === 'El Portillo' && m1.txt === 'Etapa 2 del GR 131 cumplida. Lleva 43,5\u00a0km de travesía.' && m1.n === '8 de 11' && m1.inerte, JSON.stringify([m1.fiesta, m1.tit, m1.txt, m1.n]));
    await p25.keyboard.press('Escape'); await p25.waitForTimeout(500);
    const m2 = await leer25(p25);
    prueba('Escape cierra solo la tarjeta: la pantalla sigue abierta, nada inerte, el foco en «Anotar movimiento»', !m2.fiesta && m2.abierto && !m2.inerte && m2.foco === '#tgc-mov-btn', JSON.stringify([m2.fiesta, m2.abierto, m2.inerte, m2.foco]));
    /* TG_CUERPO.cerrarFiesta, para quien ponga la pantalla desde fuera: una tarjeta puesta a mano, y cerrada */
    await ejemplo(p25, { mov: MOV25.concat([[1, 'senderismo', 200, 14]]), sellos: Object.assign({}, h1.guardado, { e2: null }) }); await p25.waitForTimeout(500);
    const m3 = await leer25(p25);
    await p25.evaluate(() => TG_CUERPO.cerrarFiesta()); await p25.waitForTimeout(400);
    const m4 = await leer25(p25);
    prueba('un sello guardado mal (fecha nula) se descarta al leer y se vuelve a conseguir (la tarjeta de «El Portillo» otra vez); TG_CUERPO.cerrarFiesta() la cierra', m3.fiesta && m3.tit === 'El Portillo' && !m4.fiesta && !m4.inerte && m4.n === '8 de 11', JSON.stringify([m3.fiesta, m3.tit, m4.fiesta, m4.n]));

    /* la postal: el botón se apaga mientras se prepara, la tarjeta con la imagen (1080 × 1350), «Guardar la imagen» (sin Web Share aquí) la descarga y la tarjeta sigue; «Cerrar» */
    await p25.evaluate(() => { const r = document.getElementById('tgc-postal'); document.getElementById('cuerpo-panel').scrollTop = r.offsetTop - 72;
      window.__btnTx = []; new MutationObserver(() => { const t = document.getElementById('tgc-postal-btn-txt').textContent + (document.getElementById('tgc-postal-btn').disabled ? ' (apagado)' : ''); if (window.__btnTx[window.__btnTx.length - 1] !== t) window.__btnTx.push(t); })
        .observe(document.getElementById('tgc-postal-btn'), { subtree: true, childList: true, characterData: true, attributes: true }); });
    await p25.waitForTimeout(200);
    const [descarga] = await Promise.all([p25.waitForEvent('download', { timeout: 15000 }).catch(() => null), (async () => {
      await p25.click('#tgc-postal-btn'); await esperarPostal(p25); await p25.waitForTimeout(300);
      const po = await postal25(p25), btnTx = await p25.evaluate(() => window.__btnTx), po2 = await leer25(p25);
      prueba('«Crear mi postal»: el botón pasa a «Preparando…» (apagado) y vuelve; la tarjeta con la imagen (blob, 1080 × 1350, con su alt), «Su postal», «Mantenga el dedo sobre la imagen para guardarla.», sin rayos, y los botones «Guardar la imagen» (sin Web Share con ficheros en este navegador; con él, «Compartir») y «Cerrar»',
        btnTx.join('|') === 'Preparando… (apagado)|Crear mi postal' && po && po.src === 'blob:' && po.nat === '1080x1350' && po.completa && po.alt === 'Postal: su personaje ante el Teide, con sus días de fuerza, sus minutos y sus kilómetros.' && po.tit === 'Su postal' && po.txt === 'Mantenga el dedo sobre la imagen para guardarla.' && po.rayos === 0
        && po.botones.join('|') === (po.share ? 'Compartir' : 'Guardar la imagen') + '|Cerrar' && po2.botones[0].endsWith('*') && po2.inerte && po2.dialogo, JSON.stringify([btnTx, po && [po.src, po.nat, po.alt, po.tit, po.txt, po.rayos, po.botones, po.share], po2.botones]));
      prueba('la imagen de día: la banda de las cifras clara, el cielo pintado y muchos colores (no un lienzo vacío)', po && claro(po.banda) && claro(po.banda2) && !oscuro(po.cielo) && !claro(po.cielo) && po.colores >= 8, JSON.stringify(po && [po.banda, po.banda2, po.cielo, po.colores]));
      await p25.click('#tgc-fiesta-botones button:first-child'); await p25.waitForTimeout(600);
    })()]);
    let png25 = null;
    if (descarga) { const ruta = path25.join(os25.tmpdir(), 'tgc-postal-' + process.pid + '.png'); await descarga.saveAs(ruta); png25 = fs25.readFileSync(ruta); fs25.unlinkSync(ruta); }
    const pd = await leer25(p25);
    prueba('«Guardar la imagen» descarga tenerife-go-mi-semana.png (un PNG de 1080 × 1350, de más de 100 kB) y la tarjeta sigue abierta', !!descarga && descarga.suggestedFilename() === 'tenerife-go-mi-semana.png' && png25 && png25.length > 100000 && png25.slice(0, 8).toString('hex') === '89504e470d0a1a0a' && png25.readUInt32BE(16) === 1080 && png25.readUInt32BE(20) === 1350 && pd.fiesta,
      JSON.stringify([!!descarga, descarga && descarga.suggestedFilename(), png25 && png25.length, pd.fiesta]));
    await p25.click('#tgc-fiesta-botones button:last-child'); await p25.waitForTimeout(500);
    const pc = await leer25(p25);
    prueba('«Cerrar» cierra la tarjeta de la postal: nada inerte y el foco de vuelta en «Crear mi postal»', !pc.fiesta && !pc.inerte && pc.foco === '#tgc-postal-btn', JSON.stringify([pc.fiesta, pc.inerte, pc.foco]));
    /* de noche: la vista previa se vuelve a pintar y la postal lleva la banda oscura */
    await p25.click('#tgc-tema'); await p25.waitForTimeout(500);
    const pn0 = await leer25(p25);
    await p25.click('#tgc-postal-btn'); await esperarPostal(p25); await p25.waitForTimeout(300);
    const pn = await postal25(p25);
    prueba('con el tema Noche: la vista previa se vuelve a pintar (otra escena) y la postal lleva la banda oscura, con la imagen igual de grande', pn0.postal.miniHtml !== pc.postal.miniHtml && pn && pn.nat === '1080x1350' && oscuro(pn.banda) && oscuro(pn.banda2) && pn.colores >= 8, JSON.stringify([pn0.postal.miniHtml, pc.postal.miniHtml, pn && [pn.banda, pn.banda2, pn.colores]]));
    await p25.click('#tgc-fiesta-botones button:last-child'); await p25.waitForTimeout(400);
    await p25.click('#tgc-tema'); await p25.waitForTimeout(400);

    /* los diez idiomas: las dos secciones, los once sellos (los seis de la semana con nombre y condición en su idioma; las paradas, nombre propio y «GR 131 · km» con
       el número de su idioma), «8 de 11», la fecha del borde en su idioma, las 42 filas nuevas con sus plurales (pl 3, zh y zht 1, el resto 2), sin desborde, y la
       política de privacidad nombrando los sellos */
    const esTx25 = {}, SELLO_PRIV = { es: 'sellos', en: 'stamps', fr: 'tampons', de: 'Stempel', it: 'timbri', nl: 'stempels', zh: '印章', zht: '印章', bg: 'печати', pl: 'pieczątki' };
    for (const l of L25) {
      await idioma(p25, l); await p25.waitForTimeout(120);
      const t = await p25.evaluate(l => {
        const g = id => document.getElementById(id).textContent.trim();
        const filas = Object.keys(UI_TX).filter(k => /^cuerpo(Sello|Sellos|Postal|Seguir|Compartir|GuardarImagen|CerrarB)/.test(k));
        return { tit: g('tgc-sellos-tit'), sub: g('tgc-sellos-sub'), n: g('tgc-sellos-n'), pTit: g('tgc-postal-tit'), pTxt: g('tgc-postal-p'), pBtn: g('tgc-postal-btn-txt'),
          sellos: [...document.querySelectorAll('#tgc-sellos-lista .tgc-sello')].map(li => ({ id: li.dataset.id, falta: li.classList.contains('falta'), nom: li.querySelector('.tgc-sello-nom').textContent, cond: li.querySelector('.tgc-sello-cond').textContent, sr: li.querySelector('.tgc-sr').textContent, anillo: [...li.querySelectorAll('textPath')].map(x => x.textContent) })),
          filas: filas.length, vacias: filas.filter(k => !UI_TX[k][l]), plurales: ['cuerpoSelloN_fuerza', 'cuerpoSelloN_mov', 'cuerpoSellosNuevos', 'cuerpoSelloT_fuerza', 'cuerpoPostalLDias'].map(k => UI_TX[k][l].split('|').length).join(''),
          pendiente: UI_TX.cuerpoSelloPendiente[l], privacidad: UI_TX.ppDatosCuerpoTxt[l], desborde: document.getElementById('cuerpo-panel').scrollWidth > document.getElementById('cuerpo-panel').clientWidth, lang: document.getElementById('cuerpo-panel').getAttribute('lang') };
      }, l);
      if (l === 'es') Object.assign(esTx25, t);
      const semana = t.sellos.slice(0, 6), paradas = t.sellos.slice(6), vacias = [...(['tit', 'sub', 'n', 'pTit', 'pTxt', 'pBtn'].filter(k => !t[k])), ...t.sellos.filter(s => !s.nom || !s.cond || !s.sr).map(s => s.id)];
      const iguales = l === 'es' ? [] : [...(['tit', 'sub', 'pTit', 'pTxt', 'pBtn'].filter(k => t[k] === esTx25[k])), ...semana.filter((s, i) => s.nom === esTx25.sellos[i].nom || s.cond === esTx25.sellos[i].cond).map(s => s.id)];
      const km = { e1: '29', e2: '42', e3: '56', e4: '67', e5: '85' };
      prueba(l + ': «' + t.tit + '» y «' + t.pTit + '» con todos sus textos' + (l === 'es' ? '' : ', en su idioma') + ', «' + t.n + '», los sellos de la semana nombrados en su idioma, las paradas con «GR 131» y su km, la fecha del borde, las 42 filas nuevas con sus plurales, sin desborde, y la política de privacidad con «' + SELLO_PRIV[l] + '»',
        !vacias.length && !iguales.length && /8/.test(t.n) && /11/.test(t.n) && paradas.every(s => /GR 131/.test(s.cond) && s.cond.indexOf(km[s.id]) >= 0) && t.sellos.filter(s => !s.falta).every(s => s.anillo.length === 2 && s.anillo[0] === 'TENERIFE GO' && s.anillo[1].length >= 6 && s.sr !== t.pendiente && s.sr.length > 8)
        && t.sellos.filter(s => s.falta).every(s => s.sr === t.pendiente && !s.anillo.length) && t.filas === 42 && !t.vacias.length && t.plurales === (l === 'pl' ? '33333' : /^zh/.test(l) ? '11111' : '22222') && !t.desborde && t.privacidad.indexOf(SELLO_PRIV[l]) > 0 && t.lang === (l === 'zht' ? 'zh-Hant' : l === 'zh' ? 'zh-Hans' : l),
        JSON.stringify({ vacias, iguales, n: t.n, filas: t.filas, vaciasTx: t.vacias, plurales: t.plurales, desborde: t.desborde, priv: t.privacidad.indexOf(SELLO_PRIV[l]), anillo: t.sellos[0].anillo, paradas: paradas.map(s => s.cond) }));
    }
    await idioma(p25, 'es');

    /* «Borrar los datos» se lleva los sellos */
    await p25.evaluate(() => document.getElementById('tgc-borrar').click()); await p25.evaluate(() => document.getElementById('tgc-borrar-si').click()); await p25.waitForTimeout(600);
    const bz25 = await leer25(p25);
    prueba('«Borrar los datos»: los sellos fuera (ninguno guardado, «0 de 11», todos pendientes) y sin celebración', bz25.guardado === null && bz25.n === '0 de 11' && bz25.sellos.every(s => s.falta) && !bz25.fiesta, JSON.stringify([bz25.guardado, bz25.n, bz25.fiesta]));
    prueba('bloque 6: sin errores de página', e25.length === 0, e25.join(' | '));
    await c25.close();

    /* a 320 px: la tarjeta de la celebración y la de la postal caben, y nada pasa del borde */
    const c25b = await contexto(b, { fiesta: true, blob: true, contexto: { viewport: { width: 320, height: 568 } } }), p25b = await c25b.newPage(), e25b = []; vigilar(p25b, e25b);
    await abrirApp(p25b); await abrirPerfilCuerpo(p25b); await suCuerpo(p25b);
    await ejemplo(p25b, { mov: MOV25 }); await p25b.waitForTimeout(500);
    const e320 = await p25b.evaluate(() => { const r = document.querySelector('#tgc-fiesta .tgc-fiesta-tarj').getBoundingClientRect(), p = document.getElementById('cuerpo-panel');
      return { fiesta: !document.getElementById('tgc-fiesta').hidden, l: Math.round(r.left), r: Math.round(r.right), t: Math.round(r.top), b: Math.round(r.bottom), desborde: p.scrollWidth > p.clientWidth, tit: document.getElementById('tgc-fiesta-tit').textContent }; });
    prueba('a 320 × 568: la tarjeta de los seis sellos cabe en la pantalla (sus 24 px de margen a cada lado, arriba y abajo dentro de 568) y nada pasa del borde', e320.fiesta && e320.l >= 16 && e320.r <= 304 && e320.t >= 0 && e320.b <= 568 && !e320.desborde && e320.tit === '6 sellos nuevos', JSON.stringify(e320));
    await p25b.click('#tgc-fiesta-botones button'); await p25b.waitForTimeout(400);
    await p25b.evaluate(() => { const r = document.getElementById('tgc-postal'); document.getElementById('cuerpo-panel').scrollTop = r.offsetTop - 72; }); await p25b.waitForTimeout(200);
    const p320 = await p25b.evaluate(() => { const b = document.getElementById('tgc-postal-btn').getBoundingClientRect(), m = document.getElementById('tgc-postal-mini'), s = document.getElementById('tgc-sellos-lista'), p = document.getElementById('cuerpo-panel');
      return { btnDentro: b.left >= 0 && b.right <= 320, btnAlto: Math.round(b.height), mini: m.offsetWidth + 'x' + m.offsetHeight, sellosDeslizan: s.scrollWidth > s.clientWidth, desborde: p.scrollWidth > p.clientWidth }; });
    await p25b.click('#tgc-postal-btn'); await esperarPostal(p25b); await p25b.waitForTimeout(300);
    const pp320 = await postal25(p25b);
    prueba('a 320: «Crear mi postal» cabe (44 px de alto o más), la vista previa a 80 × 100, los sellos se deslizan en su tira sin ensanchar la página, y la tarjeta de la postal cabe entera', p320.btnDentro && p320.btnAlto >= 44 && p320.mini === '80x100' && p320.sellosDeslizan && !p320.desborde && pp320 && pp320.nat === '1080x1350' && pp320.rect.l >= 16 && pp320.rect.r <= 304 && pp320.rect.t >= 0 && pp320.rect.b <= 568, JSON.stringify([p320, pp320 && pp320.rect]));
    prueba('a 320: sin errores de página', e25b.length === 0, e25b.join(' | '));
    await c25b.close();

    /* con «reducir movimiento»: la tarjeta sin rayos y sin la animación del sello */
    const c25r = await contexto(b, { fiesta: true, contexto: { reducedMotion: 'reduce' } }), p25r = await c25r.newPage(), e25r = []; vigilar(p25r, e25r);
    await abrirApp(p25r); await abrirPerfilCuerpo(p25r); await suCuerpo(p25r);
    await ejemplo(p25r, { mov: MOV25 }); await p25r.waitForTimeout(400);
    const rm = await leer25(p25r);
    const anim = await p25r.evaluate(() => [document.querySelector('#tgc-sellos-lista .tgc-sello.nuevo svg'), document.querySelector('#tgc-fiesta .tgc-fiesta-varios svg')].map(e => getComputedStyle(e).animationDuration + ' ' + getComputedStyle(e).transitionDuration));
    prueba('con «reducir movimiento»: la tarjeta sale igual, sin rayos, y las animaciones del sello nuevo y de los sellos de la tarjeta duran 0,01 ms (la regla general de la pantalla)', rm.fiesta && rm.tit === '6 sellos nuevos' && rm.rayos === 0 && anim.every(a => a.split(' ').every(v => parseFloat(v) < 0.001)), JSON.stringify([rm.fiesta, rm.tit, rm.rayos, anim]));
    prueba('con «reducir movimiento»: sin errores de página', e25r.length === 0, e25r.join(' | '));
    await c25r.close();

    /* con el 3D encendido: la vista previa y la postal llevan la foto del motor, y la celebración le saca una sonrisa */
    const c25t = await contexto(b, { fiesta: true, blob: true, tresD: true }), p25t = await c25t.newPage(), e25t = []; vigilar(p25t, e25t);
    await abrirApp(p25t); await abrirPerfilCuerpo(p25t); await suCuerpo(p25t);
    const activo25 = await p25t.waitForFunction(() => ['activo', 'reserva'].includes(TG_CUERPO.tresD().estado), null, { timeout: 60000 }).then(() => true).catch(() => false);
    await p25t.waitForTimeout(700);
    const est25 = await p25t.evaluate(() => TG_CUERPO.tresD().estado);
    await ejemplo(p25t, { mov: MOV25 }); await p25t.waitForTimeout(600);
    const t3 = await leer25(p25t), son25 = await p25t.evaluate(() => { const t = TG_CUERPO.tresD(); return t.motor ? t.motor.estado.sonr : null; });
    prueba('con el 3D activo: la celebración le saca una sonrisa al personaje y la vista previa de la postal lleva la foto del motor (una imagen, no el dibujo)', activo25 && est25 === 'activo' && t3.fiesta && son25 > 0.3 && t3.postal.miniImg === 1 && t3.postal.miniSvg === 1, JSON.stringify([activo25, est25, t3.fiesta, son25, t3.postal.miniImg, t3.postal.miniSvg]));
    await p25t.click('#tgc-fiesta-botones button'); await p25t.waitForTimeout(400);
    await p25t.click('#tgc-postal-btn'); await esperarPostal(p25t); await p25t.waitForTimeout(300);
    const p3 = await postal25(p25t);
    prueba('con el 3D activo: la postal sale igual (1080 × 1350, la banda clara, muchos colores)', p3 && p3.nat === '1080x1350' && claro(p3.banda) && p3.colores >= 8, JSON.stringify(p3 && [p3.nat, p3.banda, p3.colores]));
    prueba('con el 3D: sin errores de página', e25t.length === 0, e25t.join(' | '));
    await c25t.close();
  }

  // 26. (8-11-2026, bloque 7) el movimiento, deporte a deporte. Jerome, 8-11: «todos los deportes que tenemos en la app y
  //     incluido el gimnasio deben coger datos diferentes, que son deportes diferentes»; y para el GR 131, «dejar la
  //     posibilidad a cada usuario de elegir». Catorce deportes en la hoja, cada uno con lo suyo: los minutos y la
  //     intensidad (la que propone el Compendio de Actividades Físicas de 2024: desde 6 MET, intensa); la distancia, en km
  //     (caminar, senderismo, correr, bici y kayak) o en metros (nadar); el desnivel (senderismo y correr); nada más en los
  //     demás. Para la meta de un adulto, cada minuto intenso cuenta por dos (OMS 2020); a un menor, no; lo anotado antes,
  //     sin intensidad, cuenta como moderado. «Por deporte»: las veces, el tiempo, la distancia, el ritmo (correr, por km;
  //     nadar, por 100 m), la velocidad (bici y kayak) y el desnivel; el buceo, con lo que aconseja la DAN antes de volar
  //     (12 h tras una inmersión; 18 tras varias en un día o en días seguidos). «Cruce la isla»: a pie, siempre; la bici,
  //     si la persona la elige (se guarda); el nado y el kayak, nunca (Jerome, 8-11: «A pie y bici»). «Su deporte» propone el suyo en la hoja. El asistente, «Las
  //     cifras» y la política lo dicen. Lo guardado roto, campo a campo; en los diez idiomas; a 320 px y de noche
  {
    const c26 = await contexto(b), p26 = await c26.newPage(), e26 = []; vigilar(p26, e26);
    await abrirApp(p26); await abrirPerfilCuerpo(p26); await suCuerpo(p26);
    const L26 = ['es', 'en', 'fr', 'de', 'it', 'nl', 'zh', 'zht', 'bg', 'pl'];
    /* la semana del ejemplo: hoy, dos inmersiones; ayer, a correr con desnivel; hace 2, un sendero largo; hace 3, a nado y
       surf; hace 5, en bici; y hace 12, otro sendero (fuera de la semana, dentro de la travesía) */
    const MOV26 = [[0, 'buceo', 48, 0, { int: 'v' }], [0, 'buceo', 42, 0, { int: 'v' }], [1, 'correr', 32, 5.4, { int: 'v', des: 60 }], [2, 'senderismo', 270, 13.2, { int: 'v', des: 950 }],
      [3, 'nadar', 35, 1.4, { int: 'v' }], [3, 'surf', 90, 0, { int: 'm' }], [5, 'bici', 75, 24, { int: 'v' }], [12, 'senderismo', 240, 21]];
    const leer26 = (p) => p.evaluate(() => {
      const g = id => document.getElementById(id), m = g('tgc-meta-mov');
      return { deps: [...document.querySelectorAll('#tgc-deps-lista .tgc-dep')].map(li => li.dataset.tipo + ': ' + li.querySelector('.tgc-dep-nom').textContent + ' / ' + li.querySelector('.tgc-dep-cifras').textContent.replace(/ /g, ' ')),
        depsIco: [...document.querySelectorAll('#tgc-deps-lista .tgc-dep')].every(li => li.querySelector('.tgc-dep-ico svg')),
        dan: (document.querySelector('#tgc-deps-lista .tgc-dep-dan') || {}).textContent || '', depsOculto: g('tgc-deps').hidden, depsTit: g('tgc-deps-tit').textContent,
        min: m.querySelector('.tgc-meta-n b').textContent, de: m.querySelector('.tgc-meta-de').textContent, hecha: m.classList.contains('hecha'), larga: m.querySelector('.tgc-meta-n').classList.contains('larga'),
        lineas: m.querySelector('.tgc-meta-n b').getClientRects().length,
        hoy: g('tgc-dia-txt').textContent, hoyG: g('tgc-dia-grupos').textContent.replace(/ /g, ' '),
        km: g('tgc-isla-km').textContent, sig: g('tgc-isla-sig').textContent, grL: g('tgc-gr-l').textContent, grPie: g('tgc-gr-pie').textContent, grSiempre: g('tgc-gr-siempre').textContent,
        grRol: g('tgc-gr').getAttribute('role') + ':' + g('tgc-gr').getAttribute('aria-labelledby'),
        gr: [...document.querySelectorAll('#tgc-gr-ops .tgc-gr-op')].map(b => b.dataset.gr + ':' + b.getAttribute('aria-pressed') + ':' + b.querySelector('.tgc-gr-txt').textContent).join(','),
        guardadoGr: JSON.stringify((JSON.parse(localStorage.getItem('tenerife.cuerpo') || '{}')).gr || null),
        cifrasInt: g('tgc-cifras-int').textContent, cifrasDan: g('tgc-cifras-dan').textContent,
        desborde: g('cuerpo-panel').scrollWidth > g('cuerpo-panel').clientWidth };
    });
    const hoja26 = (p) => p.evaluate(() => {
      const g = id => document.getElementById(id), pul = document.querySelector('#tgc-mov-tipos .tgc-tipo[aria-pressed="true"]');
      return { sel: pul && pul.dataset.tipo, min: g('tgc-mov-min').value, km: g('tgc-mov-km-fila').hidden ? null : g('tgc-mov-km').value, kmL: g('tgc-mov-km-l').textContent,
        des: g('tgc-mov-des-fila').hidden ? null : g('tgc-mov-des').value, desL: g('tgc-mov-des-l') ? g('tgc-mov-des-l').textContent : '',
        int: g('tgc-mov-int-v').getAttribute('aria-pressed') === 'true' ? 'v' : (g('tgc-mov-int-m').getAttribute('aria-pressed') === 'true' ? 'm' : '?'),
        intM: g('tgc-mov-int-m').textContent.trim(), intV: g('tgc-mov-int-v').textContent.trim(), intL: g('tgc-mov-int-l') ? g('tgc-mov-int-l').textContent : '',
        ayuda: g('tgc-mov-int-ayuda').textContent, nota: g('tgc-mov-nota').textContent, boton: g('tgc-mov-guardar-txt').textContent,
        ariaKmMas: g('tgc-mov-km-mas').getAttribute('aria-label'), ariaDesMas: g('tgc-mov-des-mas').getAttribute('aria-label'), ariaDesMenos: g('tgc-mov-des-menos').getAttribute('aria-label'),
        n: document.querySelectorAll('#tgc-mov-tipos .tgc-tipo').length, iconos: [...document.querySelectorAll('#tgc-mov-tipos .tgc-tipo')].every(b => b.querySelector('svg')),
        tipos: [...document.querySelectorAll('#tgc-mov-tipos .tgc-tipo span')].map(x => x.textContent).join(','),
        hist: [...document.querySelectorAll('#tgc-mov-hist .tgc-hist-fila')].map(li => li.querySelector('.tgc-hist-n').textContent + ' @' + li.querySelector('.tgc-hist-x').getAttribute('aria-label')),
        desborde: g('tgc-hoja').scrollWidth > g('tgc-hoja').clientWidth + 1 };
    });
    const sp26 = t => String(t).replace(/ /g, ' ');
    const ultimo26 = () => p26.evaluate(() => { const m = TG_CUERPO.estado().mov, u = m[m.length - 1], gu = JSON.parse(localStorage.getItem('tenerife.cuerpo')).mov.slice(-1)[0];
      return { u: JSON.stringify([u.tipo, u.min, u.km, u.int, u.des === undefined ? '-' : u.des]), g: JSON.stringify([gu.tipo, gu.min, gu.km, gu.int, gu.des === undefined ? '-' : gu.des]), toast: document.getElementById('tgc-toast-txt').textContent, min: document.getElementById('tgc-st-min').textContent }; });

    await ejemplo(p26, { mov: MOV26, deporte: 'buceo' });
    const r26 = await leer26(p26);
    prueba('«Por deporte»: una fila por deporte de la semana, en el orden de la hoja y con su icono: las veces, el tiempo, la distancia (a nado, en metros), el ritmo (correr, por km; nadar, por 100 m), la velocidad (bici) y el desnivel',
      r26.depsTit === 'Por deporte' && !r26.depsOculto && r26.depsIco && r26.deps.join(' | ') === 'senderismo: Senderismo / 1 vez · 4 h 30 min · 13,2 km · 950 m de desnivel | correr: Correr / 1 vez · 32 min · 5,4 km · 5:56 min/km · 60 m de desnivel | bici: Bici / 1 vez · 1 h 15 min · 24 km · 19,2 km/h | nadar: Nadar / 1 vez · 35 min · 1400 m · 2:30 min/100 m | surf: Surf / 1 vez · 1 h 30 min | buceo: Buceo / 2 inmersiones · 1 h 30 min', r26.deps.join(' | '));
    prueba('el buceo: con dos inmersiones hoy, lo que aconseja la DAN antes de volar (18 horas desde la última) y que, con cualquier síntoma, pida atención médica', r26.dan === 'Si va a volar: tras varias inmersiones en un día o en varios días de buceo, la DAN aconseja esperar al menos 18 horas desde la última. Si nota cualquier síntoma, pida atención médica antes de volar.', r26.dan);
    prueba('la meta de un adulto: 592 minutos de verdad y 1094 para la meta (502 intensos por dos y 90 de surf, moderado), «de 150 min (intensos ×2)», cumplida; la cifra, una talla menor y en una sola línea', r26.min === '1094' && r26.de === 'de 150 min (intensos ×2)' && r26.hecha && r26.larga && r26.lineas === 1, JSON.stringify([r26.min, r26.de, r26.hecha, r26.larga, r26.lineas]));
    prueba('hoy: «10 series · 1 h 30 min» (las series del ejemplo y el tiempo de las dos inmersiones) y debajo, tras los grupos, «Buceo: 90 min»', /: 10 series · 1 h 30 min$/.test(r26.hoy) && / · Buceo: 90 min$/.test(r26.hoyG), r26.hoy + ' | ' + r26.hoyG);
    prueba('«Las cifras»: de dónde sale la intensidad (CDC, el Compendio de 2024, desde 6 MET, la OMS de 2020 y el «por dos») y lo del buceo y el avión (DAN, taller de 2002)', /CDC/.test(r26.cifrasInt) && /Compendio de Actividades Físicas de 2024/.test(r26.cifrasInt) && /6 MET/.test(r26.cifrasInt) && /OMS \(2020\)/.test(r26.cifrasInt) && /por dos/.test(r26.cifrasInt)
      && /12 horas/.test(r26.cifrasDan) && /18/.test(r26.cifrasDan) && /DAN, taller de 2002/.test(r26.cifrasDan), r26.cifrasInt + ' | ' + r26.cifrasDan);

    /* «Cruce la isla»: a pie, siempre; la bici, a elección (un botón con aria-pressed, guardado); el nado y el kayak, nunca
       (Jerome, 8-11-2026: «A pie y bici»; por el agua la isla se rodea, no se cruza) */
    prueba('«Cruce la isla»: 39,6 km a pie (13,2 + 5,4 + 21: la bici no cuenta si no se elige, y el nado nunca), «Cuentan para su travesía» (un grupo con su nombre), «A pie» siempre y un botón sin pulsar: En bici',
      r26.km === '39,6' && r26.grL === 'Cuentan para su travesía' && r26.grRol === 'group:tgc-gr-l' && r26.grPie === 'A pie' && r26.grSiempre === 'siempre' && r26.gr === 'bici:false:En bici' && (r26.guardadoGr === 'null' || r26.guardadoGr === '[]'),
      JSON.stringify([r26.km, r26.grL, r26.grRol, r26.grPie, r26.grSiempre, r26.gr, r26.guardadoGr]));
    const gr26 = async id => { await p26.click('#tgc-gr-ops .tgc-gr-op[data-gr="' + id + '"]'); await p26.waitForTimeout(1600); return leer26(p26); };
    const gb = await gr26('bici');
    prueba('«En bici» pulsado: sus 24 km suman (63,6), la siguiente parada se acerca (Vilaflor, a 3,7 km), el botón lo dice (aria-pressed) y se guarda', gb.km === '63,6' && gb.sig === 'Siguiente parada: Vilaflor, a 3,7\u00a0km.' && gb.gr === 'bici:true:En bici' && gb.guardadoGr === '["bici"]', JSON.stringify([gb.km, gb.sig, gb.gr, gb.guardadoGr]));
    prueba('a nado y en kayak no se cruza la isla: no hay botón para ellos, solo el de la bici', await p26.evaluate(() => !document.querySelector('#tgc-gr-ops [data-gr="nadar"]') && !document.querySelector('#tgc-gr-ops [data-gr="kayak"]') && document.querySelectorAll('#tgc-gr-ops .tgc-gr-op').length === 1));
    const gq = await gr26('bici');
    prueba('quitar la bici: 39,6 otra vez, nada guardado', gq.km === '39,6' && gq.gr === 'bici:false:En bici' && gq.guardadoGr === '[]', JSON.stringify([gq.km, gq.gr, gq.guardadoGr]));
    prueba('la isla, «Por deporte» y la meta: nada pasa del borde', !gq.desborde);

    /* la hoja: «Su deporte» (buceo) propone el buceo; cada deporte, sus campos y su intensidad */
    await p26.click('#tgc-mov-btn'); await p26.waitForTimeout(350);
    const hb = await hoja26(p26);
    prueba('la hoja: catorce deportes con su icono; con «Su deporte» en el buceo, propone el buceo: 45 min, intensa, sin distancia ni desnivel, la nota de la DAN y «Anotar 45 min»', hb.n === 14 && hb.iconos && hb.sel === 'buceo' && hb.min === '45' && hb.km === null && hb.des === null && hb.int === 'v'
      && hb.nota === 'Antes de volar, la DAN aconseja esperar al menos 12 horas tras una inmersión, y 18 tras varias en un día o en varios días de buceo.' && hb.boton === 'Anotar 45 min', JSON.stringify(hb));
    prueba('la intensidad: «Moderada» e «Intensa», con la prueba del habla y, para un adulto, que cada minuto intenso cuenta por dos (OMS)', hb.intL === 'Intensidad' && hb.intM === 'Moderada' && hb.intV === 'Intensa'
      && hb.ayuda === 'Moderada: puede hablar, pero no cantar. Intensa: no puede decir más de unas palabras sin parar a respirar. Para su meta, cada minuto intenso cuenta por dos (OMS).', JSON.stringify([hb.intL, hb.intM, hb.intV, hb.ayuda]));
    const cada = [];
    for (const t of ['caminar', 'senderismo', 'correr', 'bici', 'nadar', 'kayak', 'sup', 'surf', 'windsurf', 'buceo', 'golf', 'padel', 'escalada', 'otro']) {
      await p26.click('#tgc-mov-tipos .tgc-tipo[data-tipo="' + t + '"]'); await p26.waitForTimeout(40);
      const h = await hoja26(p26); cada.push([h.sel, h.min, h.km === null ? '-' : h.kmL + ' ' + h.km, h.des === null ? '-' : h.des, h.int, h.nota].join(':'));
    }
    const PIE = 'Los kilómetros a pie avanzan su travesía del GR 131.', ELIGE = 'Su distancia no cuenta para el GR 131, salvo que lo elija en «Cruce la isla».', AGUA = 'Suma minutos y distancia a su semana. Por el agua se rodea la isla, no se cruza: su distancia no cuenta para el GR 131.', MIN = 'Suma minutos a su semana.', DAN = hb.nota;
    const ESPERADO = ['caminar:30:Kilómetros 2,5:-:m:' + PIE, 'senderismo:120:Kilómetros 8:0:v:' + PIE, 'correr:30:Kilómetros 5:0:v:' + PIE, 'bici:60:Kilómetros 0:-:v:' + ELIGE, 'nadar:30:Metros 0:-:v:' + AGUA,
      'kayak:60:Kilómetros 0:-:m:' + AGUA, 'sup:60:-:-:v:' + MIN, 'surf:90:-:-:m:' + MIN, 'windsurf:90:-:-:m:' + MIN, 'buceo:45:-:-:v:' + DAN, 'golf:240:-:-:m:' + MIN, 'padel:90:-:-:m:' + MIN, 'escalada:120:-:-:v:' + MIN, 'otro:30:-:-:m:' + MIN];
    const malos26 = ESPERADO.filter((x, i) => cada[i] !== x);
    prueba('cada deporte, lo suyo: los minutos que propone; la distancia en km (caminar, senderismo, correr, bici, kayak) o en metros (nadar); el desnivel (senderismo y correr); la intensidad del Compendio (desde 6 MET, intensa); y su nota (a pie, el GR 131; la bici, «salvo que lo elija»; el nado y el kayak, que por el agua la isla se rodea; el buceo, la DAN; los demás, los minutos)',
      !malos26.length, malos26.map(x => cada[ESPERADO.indexOf(x)]).join(' || '));

    /* a nado, en metros: de 50 en 50; escritos 1500; moderada; «Anotar» lo guarda en km, al metro */
    await p26.click('#tgc-mov-tipos .tgc-tipo[data-tipo="nadar"]'); await p26.click('#tgc-mov-km-mas'); await p26.waitForTimeout(40);
    const n1 = await hoja26(p26);
    await p26.fill('#tgc-mov-km', '1500'); await p26.dispatchEvent('#tgc-mov-km', 'change'); await p26.waitForTimeout(40);
    const n2 = await hoja26(p26);
    await p26.fill('#tgc-mov-km', '12000'); await p26.dispatchEvent('#tgc-mov-km', 'change'); await p26.waitForTimeout(40);
    const n3 = await hoja26(p26);
    await p26.fill('#tgc-mov-km', '1500'); await p26.dispatchEvent('#tgc-mov-km', 'change');
    await p26.click('#tgc-mov-int-m'); await p26.waitForTimeout(40);
    const n4 = await hoja26(p26);
    prueba('a nado, en metros: «+» suma 50 («50 metros más»), escritos 1500 el botón dice «Anotar 30 min y 1500 m», 12000 se queda en 10000 (el tope, 10 km) y «Moderada» se marca',
      n1.km === '50' && n1.ariaKmMas === '50 metros más' && n1.boton === 'Anotar 30 min y 50 m' && n2.km === '1500' && n2.boton === 'Anotar 30 min y 1500 m' && n3.km === '10000' && n4.km === '1500' && n4.int === 'm', JSON.stringify([n1.km, n1.ariaKmMas, n1.boton, n2.km, n2.boton, n3.km, n4.km, n4.int]));
    await p26.click('#tgc-mov-guardar'); await p26.waitForTimeout(450);
    const u1 = await ultimo26();
    prueba('«Anotar»: nadar, 30 min, 1,5 km, moderada (en la memoria y en tenerife.cuerpo), «Nadar: 30 min y 1500 m anotados», y la meta sube 30 (moderado): 1124', u1.u === '["nadar",30,1.5,"m","-"]' && u1.g === u1.u && u1.toast === 'Nadar: 30 min y 1500 m anotados' && u1.min === '1124', JSON.stringify(u1));

    /* a correr, con desnivel: de 50 en 50, tope 4000, letras no; intensa; lo último anotado lo dice */
    await p26.click('#tgc-mov-btn'); await p26.waitForTimeout(350);
    await p26.click('#tgc-mov-tipos .tgc-tipo[data-tipo="correr"]'); await p26.click('#tgc-mov-des-mas'); await p26.click('#tgc-mov-des-mas'); await p26.waitForTimeout(40);
    const d1 = await hoja26(p26);
    await p26.fill('#tgc-mov-des', '5000'); await p26.dispatchEvent('#tgc-mov-des', 'change'); await p26.waitForTimeout(40);
    const d2 = await hoja26(p26);
    await p26.fill('#tgc-mov-des', 'abc'); await p26.dispatchEvent('#tgc-mov-des', 'change'); await p26.waitForTimeout(40);
    const d3 = await hoja26(p26);
    await p26.fill('#tgc-mov-des', '250'); await p26.dispatchEvent('#tgc-mov-des', 'change'); await p26.waitForTimeout(40);
    const d4 = await hoja26(p26);
    prueba('el desnivel, a correr: «Desnivel positivo (m)», «+» de 50 en 50 («50 metros más»; 100), 5000 se queda en 4000, letras no (4000) y escritos 250; intensa', d1.desL === 'Desnivel positivo (m)' && d1.des === '100' && d1.ariaDesMas === '50 metros más' && d1.ariaDesMenos === '50 metros menos'
      && d2.des === '4000' && d3.des === '4000' && d4.des === '250' && d4.int === 'v', JSON.stringify([d1.desL, d1.des, d1.ariaDesMas, d2.des, d3.des, d4.des, d4.int]));
    await p26.click('#tgc-mov-guardar'); await p26.waitForTimeout(450);
    const u2 = await ultimo26();
    prueba('«Anotar»: correr, 30 min, 5 km, intensa, 250 m de desnivel; la meta sube 60 (intenso, por dos): 1184', u2.u === '["correr",30,5,"v",250]' && u2.g === u2.u && u2.toast === 'Correr: 30 min y 5 km anotados' && u2.min === '1184', JSON.stringify(u2));
    await p26.click('#tgc-mov-btn'); await p26.waitForTimeout(350);
    const hh = await hoja26(p26);
    prueba('lo último anotado: «Correr · 30 min y 5 km · 250 m de desnivel» con la marca «Intensa», y la × lo dice entero («… · Intensa»); el nado, sin marca', /^Correr · 30 min y 5 km · 250 m de desnivelIntensa @Borrar: Correr · 30 min y 5 km · 250 m de desnivel · Intensa, /.test(sp26(hh.hist[0])) && /^Nadar · 30 min y 1500 m @/.test(sp26(hh.hist[1])), hh.hist.slice(0, 2).join(' || '));
    /* el golf: sin distancia ni desnivel, moderado */
    await p26.click('#tgc-mov-tipos .tgc-tipo[data-tipo="golf"]'); await p26.waitForTimeout(40);
    await p26.click('#tgc-mov-guardar'); await p26.waitForTimeout(450);
    const u3 = await ultimo26();
    prueba('el golf: 240 min, moderado, sin km ni desnivel; la meta, 1424', u3.u === '["golf",240,0,"m","-"]' && u3.toast === 'Golf: 240 min anotados' && u3.min === '1424', JSON.stringify(u3));

    /* de 5 a 17 años: nada por dos (892 minutos de verdad, de 420), y la ayuda no dice lo de «por dos» */
    await p26.evaluate(() => { localStorage.setItem('tenerife.perfil', JSON.stringify({ nacimiento: new Date().getFullYear() - 15 })); TG_CUERPO.repintar(); }); await p26.waitForTimeout(100);
    const j26 = await leer26(p26);
    await p26.click('#tgc-mov-btn'); await p26.waitForTimeout(350);
    const jh = await hoja26(p26);
    prueba('con 15 años: 892 de 420 min de movimiento (los minutos de verdad: a un menor, nada cuenta por dos) y la ayuda de la intensidad sin el «por dos»', j26.min === '892' && j26.de === 'de 420 min de movimiento' && j26.hecha && jh.ayuda === 'Moderada: puede hablar, pero no cantar. Intensa: no puede decir más de unas palabras sin parar a respirar.', JSON.stringify([j26.min, j26.de, jh.ayuda]));
    await p26.keyboard.press('Escape'); await p26.waitForTimeout(150);
    await p26.evaluate(() => { localStorage.removeItem('tenerife.perfil'); TG_CUERPO.repintar(); });

    /* «Su deporte» propone el suyo: el mar, a nado; el ciclismo, la bici; la carrera, correr; sin deporte, caminar. Elegido en
       su lista con la pantalla abierta, la hoja propone el nuevo (lo de la última vez se olvida) */
    const propone = [];
    for (const [dep, tipo] of [['mar', 'nadar'], ['ciclismo', 'bici'], ['carrera', 'correr'], ['surf', 'surf'], ['golf', 'golf'], ['otro', 'otro'], ['', 'caminar']]) {
      await p26.selectOption('#tgc-dep-sel', dep); await p26.waitForTimeout(150);
      await p26.click('#tgc-mov-btn'); await p26.waitForTimeout(300);
      const h = await hoja26(p26); propone.push((dep || '(nada)') + '→' + h.sel + (h.sel === tipo ? '' : ' (y no ' + tipo + ')'));
      await p26.keyboard.press('Escape'); await p26.waitForTimeout(120);
    }
    prueba('«Su deporte» propone el suyo en la hoja: el mar, a nado; el ciclismo, la bici; la carrera, correr; el surf, el golf y «Otro», los suyos; sin deporte, caminar', !propone.some(x => / \(y no /.test(x)), propone.join(', '));

    /* el buceo y el avión (la DAN: 12 h tras una sola inmersión; 18 tras varias en un día o varios días de buceo): una
       inmersión ayer, 12 h; una hace 3 días, nada (ya pasaron); una hoy y otra ayer, 18 h; una ayer y otra hace 4 días, 18 h */
    const danCon = async mov => { await ejemplo(p26, { mov }); return (await leer26(p26)).dan; };
    const dn1 = await danCon([[1, 'buceo', 50, 0, { int: 'v' }]]), dn2 = await danCon([[3, 'buceo', 50, 0, { int: 'v' }]]), dn3 = await danCon([[0, 'buceo', 50, 0, { int: 'v' }], [1, 'buceo', 40, 0, { int: 'v' }]]),
      dn4 = await danCon([[1, 'buceo', 50, 0, { int: 'v' }], [4, 'buceo', 45, 0, { int: 'v' }]]);
    prueba('el buceo y el avión: una inmersión ayer, «al menos 12 horas»; una hace 3 días, nada (ya pasaron las 18 h); una hoy y otra ayer, y una ayer y otra hace 4 días (varios días de buceo en la semana), «18 horas»',
      dn1 === 'Si va a volar: la DAN aconseja esperar al menos 12 horas desde la última inmersión. Si nota cualquier síntoma, pida atención médica antes de volar.' && dn2 === '' && /18 horas/.test(dn3) && /18 horas/.test(dn4), JSON.stringify([dn1, dn2, dn3, dn4]));

    /* el asistente: «¿Cómo voy esta semana?», deporte a deporte, y los minutos que cuentan para la meta */
    await ejemplo(p26, { mov: MOV26 });
    await p26.click('#tgc-modo-p'); await p26.waitForFunction(() => { const f = document.getElementById('tgc-preg-form'); return f && !f.hidden; }, null, { timeout: 15000 }).catch(() => {});
    await p26.fill('#tgc-preg', '¿Cómo voy esta semana?'); await p26.click('#tgc-preg-enviar');
    await p26.waitForFunction(() => document.querySelectorAll('#tgc-charla .tgc-turno .tgc-resp-t').length > 0, null, { timeout: 15000 }).catch(() => {}); await p26.waitForTimeout(150);
    const a26 = await p26.evaluate(() => [...document.querySelectorAll('#tgc-charla .tgc-turno:last-child .tgc-resp-p li')].map(li => li.textContent));
    prueba('el asistente: «Movimiento anotado en 7 días: Senderismo: 270 min y 13,2 km, …, Buceo: 90 min. Para su meta cuentan 1094 de 150 minutos.»',
      a26.some(t => t === 'Movimiento anotado en 7 días: Senderismo: 270 min y 13,2 km, Correr: 32 min y 5,4 km, Bici: 75 min y 24 km, Nadar: 35 min y 1400 m, Surf: 90 min, Buceo: 90 min. Para su meta cuentan 1094 de 150 minutos.'), a26.join(' | '));
    await p26.click('#tgc-modo-m'); await p26.waitForTimeout(150);

    /* lo guardado roto: la intensidad que no es 'v' o 'm' (o falta), moderada; el desnivel, solo en los que lo piden, de 1 a
       4000; la distancia, solo en los que la piden, con su tope (a nado, 10 km); lo elegido para el GR 131, de la lista y sin repetir */
    await p26.evaluate(() => {
      const ymd = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      const g = JSON.parse(localStorage.getItem('tenerife.cuerpo')), h = ymd(new Date());
      g.mov = [{ d: h, tipo: 'caminar', min: 30, km: 2, int: 'x', des: 300 }, { d: h, tipo: 'senderismo', min: 60, km: 4, int: 'v', des: 5000 }, { d: h, tipo: 'correr', min: 30, km: 5, des: -5 },
        { d: h, tipo: 'golf', min: 120, km: 3, int: 'v' }, { d: h, tipo: 'nadar', min: 30, km: 12 }, { d: h, tipo: 'escalada', min: 60, int: 'V', des: 200 }, { d: h, tipo: 'senderismo', min: 60, km: 3, des: 120.6 }];
      g.gr = ['bici', 'bici', 'coche', 'nadar', 7];
      localStorage.setItem('tenerife.cuerpo', JSON.stringify(g)); TG_CUERPO.abrir();
    });
    await p26.waitForTimeout(250);
    const v26 = await p26.evaluate(() => { const s = TG_CUERPO.estado(); return s.mov.map(x => [x.tipo, x.min, x.km, x.int, x.des === undefined ? '-' : x.des].join(':')).join(' | ') + ' // ' + JSON.stringify(s.gr); });
    prueba('roto: la intensidad rara o que falta, moderada; el desnivel fuera donde no va (caminar, escalada) o si es negativo, 5000 → 4000 y 120,6 → 121; los km del golf, fuera; a nado, 12 km → 10; para el GR 131, solo la bici, una vez (el nado, fuera: no se elige)',
      v26 === 'caminar:30:2:m:- | senderismo:60:4:v:4000 | correr:30:5:m:- | golf:120:0:v:- | nadar:30:10:m:- | escalada:60:0:m:- | senderismo:60:3:m:121 // ["bici"]', v26);
    await p26.click('#tgc-mov-btn'); await p26.waitForTimeout(350);
    await p26.click('#tgc-mov-tipos .tgc-tipo[data-tipo="bici"]'); await p26.waitForTimeout(40);
    const hbe = await hoja26(p26);
    await p26.keyboard.press('Escape'); await p26.waitForTimeout(300);
    prueba('con la bici elegida, su nota en la hoja: «Su distancia también cuenta para su travesía del GR 131: lo eligió en «Cruce la isla».»', hbe.nota === 'Su distancia también cuenta para su travesía del GR 131: lo eligió en «Cruce la isla».', hbe.nota);
    await p26.evaluate(() => { const g = JSON.parse(localStorage.getItem('tenerife.cuerpo')); g.gr = 'bici'; localStorage.setItem('tenerife.cuerpo', JSON.stringify(g)); TG_CUERPO.abrir(); }); await p26.waitForTimeout(150);
    prueba('…y si lo elegido no es una lista, nada elegido', await p26.evaluate(() => JSON.stringify(TG_CUERPO.estado().gr) === '[]'));

    /* en los diez idiomas: la semana por deporte, la isla y la hoja con sus textos (nada vacío, nada en castellano fuera del
       castellano, sin marcadores ni «|» sueltos), los plurales de cada idioma, y la política con el GR 131 */
    await ejemplo(p26, { mov: MOV26 });
    const es26 = {};
    for (const l of L26) {
      await idioma(p26, l);
      const v = await leer26(p26);
      await p26.click('#tgc-mov-btn'); await p26.waitForTimeout(250);
      await p26.click('#tgc-mov-tipos .tgc-tipo[data-tipo="nadar"]'); await p26.waitForTimeout(40);
      const hn = await hoja26(p26);
      await p26.click('#tgc-mov-tipos .tgc-tipo[data-tipo="correr"]'); await p26.waitForTimeout(40);
      const hc = await hoja26(p26);
      await p26.click('#tgc-mov-tipos .tgc-tipo[data-tipo="buceo"]'); await p26.waitForTimeout(40);
      const hb2 = await hoja26(p26);
      const ui = await p26.evaluate(l => ({ veces: UI_TX.cuerpoVeces[l].split('|').length, inm: UI_TX.cuerpoInmersiones[l].split('|').length, priv: UI_TX.ppDatosCuerpoTxt[l],
        lang: document.getElementById('cuerpo-panel').getAttribute('lang') }), l);
      await p26.keyboard.press('Escape'); await p26.waitForTimeout(120);
      const t = { deps: v.deps.join(' // '), dan: v.dan, depsTit: v.depsTit, grL: v.grL, gr: v.gr, grPie: v.grPie, cifrasInt: v.cifrasInt, cifrasDan: v.cifrasDan, de: v.de,
        kmL: hn.kmL, notaNado: hn.nota, ariaKm: hn.ariaKmMas, desL: hc.desL, ariaDes: hc.ariaDesMas, notaPie: hc.nota, intL: hc.intL, intM: hc.intM, intV: hc.intV, ayuda: hc.ayuda, notaBuceo: hb2.nota, tipos: hc.tipos };
      if (l === 'es') Object.assign(es26, t);
      const vacias = Object.keys(t).filter(k => !t[k]), iguales = l === 'es' ? [] : Object.keys(t).filter(k => t[k] === es26[k]);
      const sueltos = Object.keys(t).filter(k => /[{}|]/.test(t[k]));
      const formas = ui.veces === (l === 'pl' ? 3 : /^zh/.test(l) ? 1 : 2) && ui.inm === ui.veces;
      prueba(l + ': «Por deporte», la isla con lo que cuenta para la travesía y la hoja (metros, desnivel, intensidad, las notas) con todos sus textos' + (l === 'es' ? '' : ', en su idioma') + ', sin marcadores sueltos, con los plurales del idioma, sin desborde, y la política con el GR 131',
        !vacias.length && !iguales.length && !sueltos.length && formas && !v.desborde && !hn.desborde && !hc.desborde && ui.priv.indexOf('GR 131') > 0 && /GR 131/.test(t.notaNado) && t.dan.length > 40,
        JSON.stringify({ vacias, iguales, sueltos, formas: [ui.veces, ui.inm], desborde: [v.desborde, hn.desborde, hc.desborde], priv: ui.priv.indexOf('GR 131'), lang: ui.lang }));
    }
    await idioma(p26, 'es');
    prueba('la política (es): el movimiento con el deporte, la intensidad, la distancia, el desnivel y si se elige contar la bici para el GR 131', await p26.evaluate(() => /la intensidad/.test(UI_TX.ppDatosCuerpoTxt.es) && /el desnivel/.test(UI_TX.ppDatosCuerpoTxt.es) && /si elige contar la bici para el GR 131/.test(UI_TX.ppDatosCuerpoTxt.es)));
    prueba('bloque 7: sin errores de página', e26.length === 0, e26.join(' | '));
    await c26.close();

    /* a 320 px y de noche: la cifra de la meta en una línea, los botones de la travesía elegidos como «A pie», y nada pasa del borde */
    const c26b = await contexto(b, { contexto: { viewport: { width: 320, height: 568 } } }), p26b = await c26b.newPage(), e26b = []; vigilar(p26b, e26b);
    await abrirApp(p26b); await abrirPerfilCuerpo(p26b); await suCuerpo(p26b);
    await p26b.click('#tgc-tema'); await p26b.waitForTimeout(200);
    await ejemplo(p26b, { mov: MOV26, gr: [] });
    await idioma(p26b, 'en'); await p26b.waitForTimeout(500);   /* el color de los botones cambia con una transición corta */
    /* un solo botón (la bici): su color sin pulsar, antes de pulsarlo */
    const no320 = await p26b.evaluate(() => getComputedStyle(document.querySelector('#tgc-gr-ops .tgc-gr-op[aria-pressed="false"]')).backgroundColor);
    await p26b.click('#tgc-gr-ops .tgc-gr-op[data-gr="bici"]'); await p26b.waitForTimeout(1700);
    const n320 = await leer26(p26b);
    const col = await p26b.evaluate(() => { const a = getComputedStyle(document.querySelector('.tgc-gr-fijo')), b = getComputedStyle(document.querySelector('#tgc-gr-ops .tgc-gr-op[aria-pressed="true"]')), c = { backgroundColor: '' };
      const si = document.querySelector('#tgc-gr-ops .tgc-gr-op[aria-pressed="true"] .tgc-gr-si'), ico = document.querySelector('#tgc-gr-ops .tgc-gr-op[aria-pressed="true"] .tgc-gr-ico');
      return { fijo: a.backgroundColor + '/' + a.color, si: b.backgroundColor + '/' + b.color, no: c.backgroundColor, marca: getComputedStyle(si).display !== 'none' && getComputedStyle(ico).display === 'none', tema: TG_CUERPO.tema() }; });
    col.no = no320;
    await p26b.click('#tgc-mov-btn'); await p26b.waitForTimeout(300);
    await p26b.click('#tgc-mov-tipos .tgc-tipo[data-tipo="senderismo"]'); await p26b.waitForTimeout(40);
    const h320 = await hoja26(p26b);
    prueba('a 320 px, de noche y en inglés: «1,094» en una línea, «Por deporte» y la isla sin desborde, la hoja (senderismo, con desnivel e intensidad) tampoco; la bici elegida, del color de «A pie» y con su marca en lugar del icono',
      n320.min === '1,094' && n320.lineas === 1 && !n320.desborde && !h320.desborde && h320.des === '0' && col.tema === 'noche' && col.si === col.fijo && col.no !== col.si.split('/')[0] && col.marca, JSON.stringify([n320.min, n320.lineas, n320.desborde, h320.desborde, h320.des, col]));
    prueba('a 320 px: sin errores de página', e26b.length === 0, e26b.join(' | '));
    await c26b.close();
  }

  // 27. (8-11-2026, bloque 8) el mapa de «Cruce la isla» con su relieve, el compañero de travesía y «Senderos de la isla».
  //     Jerome, 8-11: «No me gusta la línea. Quiero algo interactivo que adelante con la gente […] Un bici si en bici […]
  //     Caminando puedes hacer diferentes personajes, como un perro canario (presa canario), un lagarto, una persona. ¿La mapa
  //     puedes poner diferentes rutas? Para que la gente pueda intentar lograr un 100 %». El fondo: dos WebP (de día y de
  //     noche, que se cambian con el tema) con la costa de COSTA debajo; el Teide con su altitud, la escala y el norte, sin
  //     que ninguna etiqueta tape un punto. La ruta:
  //     la funda, lo que falta a puntos rojos, lo hecho del color del movimiento. El compañero: el de a pie elegido sin nada
  //     anotado; la bici elegida si lo último que cuenta es en bici; a nado o en kayak, el de antes (no cuentan); mira hacia donde va; anda mientras
  //     avanza; los colores de «Aspecto»; el selector, guardado y validado. Los senderos: los de la guía (places[], «senderismo»),
  //     por zonas; marcar y desmarcar; la cuenta, el porcentaje (hacia abajo) y la barra; los puntos del mapa (uno lleva a su
  //     fila); las celebraciones; lo guardado validado; «Borrar los datos» se lo lleva; «Las cifras» con las dos notas de
  //     Copernicus palabra por palabra; la política; y los diez idiomas sin desborde a 320 px
  {
    const c27 = await contexto(b), p27 = await c27.newPage(), e27 = []; vigilar(p27, e27);
    await abrirApp(p27); await abrirPerfilCuerpo(p27); await suCuerpo(p27);
    await vacio(p27); await p27.waitForTimeout(300);
    const leer27 = () => p27.evaluate(() => {
      const g = id => document.getElementById(id), svg = document.querySelector('#tgc-mapa svg'), arte = g('tgc-isla-comp').querySelector('.tgc-comp-arte');
      return {
        ims: [...svg.querySelectorAll('image.tgc-isla-relieve')].map(i => i.getAttribute('href') + ':' + getComputedStyle(i).display),
        costa: !!svg.querySelector('.tgc-isla-tierra'), alt: g('tgc-isla-alt').textContent, km10: g('tgc-isla-km10').textContent, norte: g('tgc-isla-norte').textContent,
        funda: !!svg.querySelector('.tgc-isla-funda'), ruta: svg.querySelector('.tgc-isla-ruta').getAttribute('stroke-dasharray'), rutaColor: getComputedStyle(svg.querySelector('.tgc-isla-ruta')).stroke,
        hechaColor: getComputedStyle(g('tgc-isla-hecha')).stroke, mov: getComputedStyle(document.getElementById('cuerpo-panel')).getPropertyValue('--mov').trim(),
        comp: g('tgc-isla-marca').getAttribute('data-comp'), giro: g('tgc-isla-giro').getAttribute('transform'), filtro: arte ? arte.getAttribute('filter') : '', html: g('tgc-isla-comp').innerHTML,
        pie: [...document.querySelectorAll('#tgc-comp-pie .tgc-comp-op')].map(x => x.dataset.comp + (x.getAttribute('aria-pressed') === 'true' ? '*' : '') + ':' + x.textContent).join(','),
        bici: [...document.querySelectorAll('#tgc-comp-bici .tgc-comp-op')].map(x => x.dataset.comp + (x.getAttribute('aria-pressed') === 'true' ? '*' : '')).join(','), biciVisible: !g('tgc-comp-bici-f').hidden,
        puntos: svg.querySelectorAll('.tgc-isla-sendero').length, puntosHechos: svg.querySelectorAll('.tgc-isla-sendero.hecho').length,
        pc: g('tgc-send-pc').textContent, de: g('tgc-send-de').textContent, barra: g('tgc-send-hecho').style.width, sub: g('tgc-send-sub').textContent,
        zonas: [...document.querySelectorAll('#tgc-send-lista details')].map(d => d.dataset.zona + ':' + d.querySelector('.tgc-send-zc').textContent).join(','),
        filas: document.querySelectorAll('#tgc-send-lista .tgc-send-op').length, cifrasMapa: g('tgc-cifras-mapa').textContent, cifrasSend: g('tgc-cifras-send').textContent,
        orden: [...g('tgc-vista-musculos').querySelectorAll(':scope > section')].map(s => s.className.split(' ')[0]).join(' '),
        guardado: JSON.parse(localStorage.getItem('tenerife.cuerpo') || 'null')
      };
    });
    const v0 = await leer27();
    const totalSend = await p27.evaluate(() => places.filter(p => p.category === 'senderismo').length), grSend = await p27.evaluate(() => places.filter(p => p.category === 'senderismo' && /\bGR-? ?131\b/.test(p.name)).length);
    const fondos = await p27.evaluate(() => Promise.all(['dia', 'noche'].map(t => new Promise(r => { const i = new Image(); i.onload = () => r(i.naturalWidth + 'x' + i.naturalHeight); i.onerror = () => r('error'); i.src = './datos/cuerpo/isla-relieve-' + t + '.webp'; }))));
    prueba('el fondo: los dos relieves (de día a la vista, de noche escondido), 1074 × 906 los dos, y la costa debajo por si no cargan', v0.ims.join(',') === './datos/cuerpo/isla-relieve-dia.webp:inline,./datos/cuerpo/isla-relieve-noche.webp:none' && fondos.join(',') === '1074x906,1074x906' && v0.costa, JSON.stringify([v0.ims, fondos, v0.costa]));
    prueba('el Teide con su altitud («3715 m»), la escala («10 km») y el norte («N»)', v0.alt === '3715 m' && v0.km10 === '10 km' && v0.norte === 'N', JSON.stringify([v0.alt, v0.km10, v0.norte]));
    /* ninguna etiqueta del mapa tapa un punto de sendero o una parada (la caja entera del texto, con 1,2 de margen alrededor
       de cada punto): con la altitud del Teide a la izquierda del pico, la salida de Pico Viejo caía encima de la cifra */
    const choques27 = await p27.evaluate(() => {
      const svg = document.querySelector('#tgc-mapa svg'), caja = el => { const k = el.getBBox(); return { x0: k.x, y0: k.y, x1: k.x + k.width, y1: k.y + k.height, n: el.textContent }; };
      const etiquetas = [...svg.querySelectorAll('.tgc-isla-teide-t, #tgc-isla-alt, .tgc-isla-parada text, #tgc-isla-km10, #tgc-isla-norte')].map(caja);
      const puntos = [...svg.querySelectorAll('.tgc-isla-sendero .punto')].map(c => ({ x: +c.getAttribute('cx'), y: +c.getAttribute('cy'), r: +c.getAttribute('r') + 1.2, n: c.parentNode.getAttribute('data-id') }))
        .concat([...svg.querySelectorAll('.tgc-isla-parada circle:not(.nucleo)')].map(c => ({ x: +c.getAttribute('cx'), y: +c.getAttribute('cy'), r: +c.getAttribute('r') + 1, n: 'parada ' + c.parentNode.getAttribute('data-km') })));
      const mal = [];
      etiquetas.forEach(e => puntos.forEach(p => { if (Math.hypot(Math.max(e.x0, Math.min(p.x, e.x1)) - p.x, Math.max(e.y0, Math.min(p.y, e.y1)) - p.y) < p.r) mal.push(e.n + ' × ' + p.n); }));
      return { mal, etiquetas: etiquetas.length, puntos: puntos.length };
    });
    prueba('ninguna etiqueta del mapa (el Teide y su altitud, las seis paradas, la escala y el norte) tapa un punto de sendero o una parada', !choques27.mal.length && choques27.etiquetas === 10 && choques27.puntos === totalSend - grSend + 6, JSON.stringify(choques27));
    prueba('la ruta: la funda, lo que falta a puntos rojos (el esquema) y lo hecho del color del movimiento', v0.funda && v0.ruta === '0.1 4.6' && /^rgb\(200, 49, 43\)$/.test(v0.rutaColor) && v0.hechaColor === 'rgb(11, 124, 134)', JSON.stringify([v0.funda, v0.ruta, v0.rutaColor, v0.hechaColor]));
    prueba('sin nada anotado: el compañero de a pie de serie (senderista), mirando hacia donde va la ruta (al suroeste: girado), con su contorno de pegatina', v0.comp === 'persona' && v0.giro === 'scale(-1 1)' && v0.filtro === 'url(#tgc-pegatina)' && /class="pierna-a"/.test(v0.html), JSON.stringify([v0.comp, v0.giro, v0.filtro]));
    prueba('«Su compañero de travesía»: a pie, senderista (elegido), presa canario y lagarto tizón; la fila de la bici, escondida (la bici no cuenta)', v0.pie === 'persona*:Senderista,perro:Presa canario,lagarto:Lagarto tizón' && !v0.biciVisible, JSON.stringify([v0.pie, v0.biciVisible]));
    prueba('en «Músculos»: la semana, «Hoy en la isla», «Cruce la isla», «Senderos de la isla» y los 12 grupos', /tgc-semana tgc-hoy-isla tgc-isla tgc-send tgc-grupos/.test(v0.orden), v0.orden);

    /* elegir el presa canario: se guarda, el mapa lo pone y el botón lo dice */
    await p27.click('#tgc-comp-pie .tgc-comp-op[data-comp="perro"]'); await p27.waitForTimeout(150);
    const v1 = await leer27();
    prueba('elegir el presa canario: se guarda (comp.pie), va por el mapa y su botón queda pulsado', v1.guardado && v1.guardado.comp && v1.guardado.comp.pie === 'perro' && v1.comp === 'perro' && /^persona:Senderista,perro\*:Presa canario/.test(v1.pie), JSON.stringify([v1.guardado && v1.guardado.comp, v1.comp, v1.pie]));
    prueba('…y da un saltito en el mapa', await p27.evaluate(() => document.getElementById('tgc-isla-marca').classList.contains('salta')));

    /* según lo último anotado que cuenta: bici (si cuenta) o a pie; el nado y el kayak no cuentan nunca (Jerome, 8-11-2026:
       «A pie y bici»: por el agua la isla se rodea, no se cruza) */
    const conComp = async (mov, gr, comp, aspecto) => { await ejemplo(p27, Object.assign({ mov, gr, comp }, aspecto ? { aspecto } : {})); await p27.waitForTimeout(250); return leer27(); };
    const b1 = await conComp([[2, 'caminar', 60, 5], [0, 'bici', 60, 20]], ['bici'], { pie: 'perro', bici: 'electrica' });
    prueba('lo último en bici, con la bici elegida para la travesía: va la bici eléctrica elegida; la fila de la bici sale, con la eléctrica pulsada', b1.comp === 'electrica' && b1.biciVisible && b1.bici === 'carretera,montana,electrica*', JSON.stringify([b1.comp, b1.biciVisible, b1.bici]));
    const b2 = await conComp([[2, 'bici', 60, 20], [0, 'senderismo', 120, 8]], ['bici'], { pie: 'lagarto', bici: 'montana' });
    prueba('lo último a pie (senderismo), aunque antes fuera en bici: va el de a pie elegido (el lagarto tizón)', b2.comp === 'lagarto', b2.comp);
    const b3 = await conComp([[2, 'caminar', 60, 5], [0, 'bici', 60, 20]], [], { pie: 'perro', bici: 'montana' });
    prueba('lo último en bici, pero la bici no cuenta para la travesía: va el de a pie (el presa canario) y la fila de la bici no sale', b3.comp === 'perro' && !b3.biciVisible, JSON.stringify([b3.comp, b3.biciVisible]));
    const b4 = await conComp([[1, 'caminar', 60, 5], [0, 'nadar', 40, 1.5]], ['nadar'], { pie: 'perro', bici: 'montana' });
    const b5 = await conComp([[1, 'caminar', 60, 5], [0, 'kayak', 60, 6]], ['kayak'], { pie: 'perro', bici: 'montana' });
    prueba('lo último a nado o en kayak (aunque lo guardado diga que cuentan: al leerlo, para el GR 131 solo queda la bici): el compañero sigue siendo el de a pie, el presa canario',
      b4.comp === 'perro' && b5.comp === 'perro', JSON.stringify([b4.comp, b5.comp]));
    const b6 = await conComp([[0, 'caminar', 60, 5]], [], { pie: 'persona', bici: 'carretera' }, Object.assign({}, await p27.evaluate(() => TG_FIGURA.normaliza(null)), { piel: 9, arribaColor: 3, abajoColor: 6, peloColor: 0, calzadoColor: 8 }));
    const F27 = await p27.evaluate(() => ({ piel: TG_FIGURA.PIEL[9], arriba: TG_FIGURA.ROPA_COLOR[3], abajo: TG_FIGURA.ROPA_COLOR[6], pelo: TG_FIGURA.PELO_COLOR[0], calzado: TG_FIGURA.ROPA_COLOR[8] }));
    prueba('la persona lleva los colores de «Aspecto» (piel, ropa de arriba y de abajo, pelo y calzado), en el mapa y en su botón', b6.comp === 'persona' && Object.values(F27).every(c => b6.html.indexOf(c) >= 0) &&
      await p27.evaluate(c => document.querySelector('#tgc-comp-pie .tgc-comp-op[data-comp="persona"]').innerHTML.indexOf(c) >= 0, F27.piel), JSON.stringify(F27));
    /* (encima del bloque 8) el compañero va por encima de los textos del mapa: la etiqueta que le queda debajo (una parada, el
       Teide o su altitud) se aclara mientras él está ahí y vuelve al irse. Como en las capturas del 9-11: a pie a 29,2 km, el
       senderista sobre «La Caldera»; en bici a 53,2 km, la de montaña sobre «3715 m». A 10 km no hay ninguna debajo. Y nunca
       una aclarada sin el compañero encima, ni una con él encima sin aclarar (las cajas en pantalla, ya quieto) */
    const etisDe = async pg => { await pg.waitForTimeout(450); return pg.evaluate(() => {
      const c = document.getElementById('tgc-isla-comp').getBoundingClientRect(), r = [];
      document.querySelectorAll('#tgc-mapa svg .tgc-isla-teide-t, #tgc-isla-alt, #tgc-mapa svg .tgc-isla-parada text').forEach(t => {
        const k = t.getBoundingClientRect(), encima = k.width > 0 && k.left < c.right && k.right > c.left && k.top < c.bottom && k.bottom > c.top;
        r.push({ n: t.textContent, encima, op: Number(getComputedStyle(t).opacity) });
      });
      return { aclaradas: r.filter(x => x.op < 0.5).map(x => x.n), malAclaradas: r.filter(x => (x.op < 0.5) !== x.encima).map(x => x.n + (x.encima ? ' (encima, sin aclarar)' : ' (aclarada sin nada encima)')), ops: r.map(x => x.n + ':' + x.op).join(',') };
    }); };
    await conComp([[0, 'senderismo', 300, 29.2]], [], { pie: 'persona', bici: 'carretera' }); const et1 = await etisDe(p27);
    prueba('a pie a 29,2 km, el senderista encima de «La Caldera»: la etiqueta se aclara; las demás, no', et1.aclaradas.indexOf('La Caldera') >= 0 && !et1.malAclaradas.length, JSON.stringify(et1));
    await conComp([[1, 'senderismo', 120, 10], [0, 'bici', 200, 43.2]], ['bici'], { pie: 'persona', bici: 'montana' }); const et2 = await etisDe(p27);
    prueba('en bici a 53,2 km, la de montaña encima de la altitud del Teide: «3715 m» se aclara; las que no tiene encima, no', et2.aclaradas.indexOf('3715 m') >= 0 && !et2.malAclaradas.length, JSON.stringify(et2));
    await conComp([[0, 'senderismo', 200, 10]], [], { pie: 'lagarto', bici: 'carretera' }); const et3 = await etisDe(p27);
    prueba('a 10 km, sin ninguna etiqueta debajo: ninguna aclarada (y «3715 m», que lo estaba, vuelve)', !et3.aclaradas.length && !et3.malAclaradas.length, JSON.stringify(et3));
    /* …y con «reducir movimiento», con el mapa ya pintado: ahí la app hace de cada cambio una transición de 0,01 ms y lo que se lee
       en el momento es lo de antes (la primera versión del arreglo iba un paso por detrás). A pie a 29,2 km; pulsar «En bici» (la
       bici, 24 km más: 53,2, la de montaña junto al Teide): «3715 m» aclarada y «La Caldera» ya no */
    {
      const cR = await contexto(b, { contexto: { reducedMotion: 'reduce' } }), pR = await cR.newPage(), eR = []; vigilar(pR, eR);
      await abrirApp(pR); await abrirPerfilCuerpo(pR); await suCuerpo(pR);
      await ejemplo(pR, { mov: [[1, 'senderismo', 300, 29.2], [0, 'bici', 60, 24]], gr: [], comp: { pie: 'persona', bici: 'montana' } });
      const r1 = await etisDe(pR);
      prueba('con «reducir movimiento», a pie a 29,2 km: «La Caldera» aclarada; las demás, no', r1.aclaradas.indexOf('La Caldera') >= 0 && !r1.malAclaradas.length, JSON.stringify(r1));
      await pR.click('#tgc-gr-ops .tgc-gr-op[data-gr="bici"]');
      const r2 = await etisDe(pR), cmp2 = await pR.evaluate(() => document.getElementById('tgc-isla-marca').getAttribute('data-comp') + ' ' + document.getElementById('tgc-isla-km').textContent);
      prueba('…y al pulsar «En bici» (la de montaña, 53,2 km): «3715 m» aclarada y «La Caldera» ya no, sin esperar a otro pintado', cmp2 === 'montana 53,2' && r2.aclaradas.indexOf('3715 m') >= 0 && r2.aclaradas.indexOf('La Caldera') < 0 && !r2.malAclaradas.length, cmp2 + ' ' + JSON.stringify(r2));
      prueba('…sin errores de página', !eR.length, eR.join(' | '));
      await cR.close();
    }
    const roto = await p27.evaluate(() => { localStorage.setItem('tenerife.cuerpo', JSON.stringify({ v: 1, comp: { pie: 'gato', bici: '<b>' }, senderos: { 'prtf-1-mercedes-cruz-carmen': '2020-01-01', 'Mal Id': '2026-01-01', 'montana-blanca': '2999-01-01', 'sendero-chinyero': 'ayer' } })); TG_CUERPO.abrir(); return JSON.parse(localStorage.getItem('tenerife.cuerpo') || 'null'); });
    await p27.waitForTimeout(200);
    const v2 = await leer27();
    prueba('lo guardado roto: un compañero que no está → los de serie; de los senderos, solo el id bien escrito con su fecha (ni ids raros, ni fechas futuras, ni «ayer»)', v2.comp === 'persona' && /^persona\*/.test(v2.pie) && v2.de === '1 de ' + totalSend + ' senderos', JSON.stringify([v2.comp, v2.pie, v2.de, roto && roto.senderos]));

    /* «Senderos de la isla» */
    await vacio(p27); await p27.waitForTimeout(250);
    const s0 = await leer27();
    const zonaDe = await p27.evaluate(() => { const r = {}; document.querySelectorAll('#tgc-send-lista details').forEach(d => d.querySelectorAll('.tgc-send-op').forEach(b => { r[b.dataset.id] = d.dataset.zona; })); return r; });
    prueba('los senderos son los de la guía: ' + totalSend + ' filas (places[], «senderismo»), un punto en el mapa por cada uno menos las ' + grSend + ' etapas del GR 131 (que son la ruta)', totalSend >= 30 && s0.filas === totalSend && s0.puntos === totalSend - grSend && s0.sub === 'Los ' + totalSend + ' senderos de la guía. Márquelos cuando los haga y llegue al 100 %.', JSON.stringify([totalSend, s0.filas, s0.puntos, s0.sub]));
    prueba('por zonas, en este orden: Anaga, Teno, Teide, Norte y Sur, con su cuenta («0 de N»), que suman todos', /^anaga:0 de \d+,teno:0 de \d+,teide:0 de \d+,norte:0 de \d+,sur:0 de \d+$/.test(s0.zonas) && s0.zonas.split(',').reduce((a, z) => a + Number(z.split(' de ')[1]), 0) === totalSend, s0.zonas);
    prueba('cada sendero en su zona: PR-TF 1 en Anaga, Teno Alto en Teno, Montaña Blanca en Teide, Chinyero en Norte, el tramo 5 del GR 131 en Sur', zonaDe['prtf-1-mercedes-cruz-carmen'] === 'anaga' && zonaDe['sendero-teno-baracan'] === 'teno' && zonaDe['montana-blanca'] === 'teide' && zonaDe['sendero-chinyero'] === 'norte' && zonaDe['gr131-tramo5-vilaflor-arona'] === 'sur', JSON.stringify(zonaDe));
    prueba('sin ninguno: «0 %», «0 de ' + totalSend + ' senderos», la barra a cero', s0.pc.replace(/\s/g, '') === '0%' && s0.de === '0 de ' + totalSend + ' senderos' && s0.barra === '0%', JSON.stringify([s0.pc, s0.de, s0.barra]));
    await p27.evaluate(() => { document.querySelector('#tgc-send-lista details[data-zona="anaga"]').open = true; });
    await p27.click('#tgc-send-lista .tgc-send-op[data-id="prtf-1-mercedes-cruz-carmen"]'); await p27.waitForTimeout(150);
    const s1 = await leer27();
    const fila1 = await p27.evaluate(() => { const b = document.querySelector('#tgc-send-lista .tgc-send-op[data-id="prtf-1-mercedes-cruz-carmen"]'); return { pres: b.getAttribute('aria-pressed'), meta: b.querySelector('.tgc-send-meta').textContent, hoy: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) }; });
    const pc1 = Math.floor(1 / totalSend * 100);
    prueba('marcar PR-TF 1: pulsado, «Hecho el (hoy)», ' + pc1 + ' % (hacia abajo), «1 de ' + totalSend + ' senderos», Anaga «1 de …», su punto del mapa en verde y guardado con la fecha de hoy', fila1.pres === 'true' && fila1.meta === 'Hecho el ' + fila1.hoy && s1.pc.replace(/\s/g, '') === pc1 + '%' && s1.de === '1 de ' + totalSend + ' senderos' && /^anaga:1 de /.test(s1.zonas) && s1.puntosHechos === 1 && s1.guardado.senderos['prtf-1-mercedes-cruz-carmen'] === await p27.evaluate(() => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }), JSON.stringify([fila1, s1.pc, s1.de, s1.zonas.split(',')[0], s1.puntosHechos]));
    await p27.click('#tgc-send-lista .tgc-send-op[data-id="prtf-1-mercedes-cruz-carmen"]'); await p27.waitForTimeout(120);
    const s2 = await leer27();
    prueba('…y desmarcarlo: vuelve a 0, sin punto verde y sin nada guardado', s2.de === '0 de ' + totalSend + ' senderos' && s2.puntosHechos === 0 && !Object.keys(s2.guardado.senderos).length, JSON.stringify([s2.de, s2.puntosHechos, s2.guardado.senderos]));
    /* el porcentaje, hacia abajo: con todos menos uno no dice 100 */
    const ids = await p27.evaluate(() => places.filter(p => p.category === 'senderismo').map(p => p.id));
    const conSend = async n => { await p27.evaluate(l => { const g = JSON.parse(localStorage.getItem('tenerife.cuerpo') || '{"v":1}'); g.senderos = {}; l.forEach(id => { g.senderos[id] = '2026-11-01'; }); localStorage.setItem('tenerife.cuerpo', JSON.stringify(g)); TG_CUERPO.abrir(); }, ids.slice(0, n)); await p27.waitForTimeout(150); return leer27(); };
    const casi = await conSend(totalSend - 1), todo = await conSend(totalSend);
    prueba('el porcentaje va hacia abajo: con ' + (totalSend - 1) + ' de ' + totalSend + ', «' + Math.floor((totalSend - 1) / totalSend * 100) + ' %» (no 100); con todos, «100 %», la barra llena y todas las zonas completas', casi.pc.replace(/\s/g, '') === Math.floor((totalSend - 1) / totalSend * 100) + '%' && todo.pc.replace(/\s/g, '') === '100%' && todo.barra === '100%' && await p27.evaluate(() => [...document.querySelectorAll('#tgc-send-lista details')].every(d => d.classList.contains('completa'))), JSON.stringify([casi.pc, todo.pc, todo.barra]));
    /* un punto del mapa lleva a su fila: abre su zona y la enfoca */
    await vacio(p27); await p27.waitForTimeout(200);
    await p27.evaluate(() => { const g = document.querySelector('#tgc-mapa .tgc-isla-sendero[data-id="sendero-teno-baracan"] .toque'); g.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
    await p27.waitForTimeout(400);
    prueba('tocar un punto del mapa (Teno Alto): se abre Teno y la fila queda enfocada', await p27.evaluate(() => document.querySelector('#tgc-send-lista details[data-zona="teno"]').open && document.activeElement && document.activeElement.dataset.id === 'sendero-teno-baracan'));
    /* «Las cifras» y la política */
    const cop = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, '..', 'mapa', 'tenerife-relieve.json'), 'utf8')).fuente;
    prueba('«Las cifras»: el fondo del mapa (Copernicus GLO-30, OpenStreetMap ODbL, las líneas del mar no son profundidades) con las dos notas de Copernicus palabra por palabra; y de dónde salen los senderos', s0.cifrasMapa.indexOf('«' + cop.credito + '»') >= 0 && s0.cifrasMapa.indexOf('«' + cop.responsabilidad + '»') >= 0 && /Copernicus GLO-30/.test(s0.cifrasMapa) && /OpenStreetMap, ODbL/.test(s0.cifrasMapa) && /no profundidades/.test(s0.cifrasMapa) && s0.cifrasSend === 'Los senderos son los ' + totalSend + ' de la guía, con el nombre, el punto de salida y los datos de su ficha. Lo que marca como hecho lo apunta usted y se queda solo en este aparato.', s0.cifrasMapa.slice(0, 120));
    prueba('la política (es): los senderos marcados como hechos y el compañero de la travesía', await p27.evaluate(() => /los senderos que marque como hechos \(con su fecha\), el compañero que elija para la travesía/.test(UI_TX.ppDatosCuerpoTxt.es)));
    /* «Borrar los datos» se lleva el compañero y los senderos */
    await conComp([[0, 'caminar', 60, 5]], [], { pie: 'lagarto', bici: 'montana' });
    await p27.evaluate(() => { const g = JSON.parse(localStorage.getItem('tenerife.cuerpo')); g.senderos = { 'montana-blanca': '2026-11-01' }; localStorage.setItem('tenerife.cuerpo', JSON.stringify(g)); TG_CUERPO.abrir(); });
    await p27.waitForTimeout(150);
    await p27.evaluate(() => { document.getElementById('tgc-borrar').click(); document.getElementById('tgc-borrar-si').click(); }); await p27.waitForTimeout(250);
    const v3 = await leer27();
    prueba('«Borrar los datos de «Su cuerpo»» se lleva el compañero y los senderos (vuelve el senderista, 0 senderos)', v3.comp === 'persona' && /^0 de /.test(v3.de) && (!v3.guardado || !v3.guardado.senderos || !Object.keys(v3.guardado.senderos).length), JSON.stringify([v3.comp, v3.de]));
    /* el compañero anda mientras avanza: anotar 4 km a pie */
    await conComp([[1, 'caminar', 60, 10]], [], { pie: 'perro', bici: 'carretera' });
    await p27.click('#tgc-mov-btn'); await p27.waitForTimeout(350);
    await p27.click('#tgc-mov-tipos .tgc-tipo[data-tipo="caminar"]'); await p27.fill('#tgc-mov-km', '4'); await p27.dispatchEvent('#tgc-mov-km', 'change'); await p27.waitForTimeout(60);
    await p27.click('#tgc-mov-guardar'); await p27.waitForTimeout(300);
    const andando = await p27.evaluate(() => ({ anda: document.getElementById('tgc-isla-marca').classList.contains('anda'), comp: document.getElementById('tgc-isla-marca').getAttribute('data-comp'), anim: getComputedStyle(document.querySelector('#tgc-isla-comp .pierna-a')).animationName }));
    await p27.waitForTimeout(1700);
    const quieto = await p27.evaluate(() => ({ anda: document.getElementById('tgc-isla-marca').classList.contains('anda'), anim: getComputedStyle(document.querySelector('#tgc-isla-comp .pierna-a')).animationName }));
    prueba('anotar 4 km a pie: el presa canario anda mientras avanza (las patas se mueven) y a los 2 s se para', andando.anda && andando.comp === 'perro' && andando.anim === 'tgc-paso' && !quieto.anda && quieto.anim === 'none', JSON.stringify([andando, quieto]));
    /* de noche: el relieve de noche */
    await p27.click('#tgc-tema'); await p27.waitForTimeout(200);
    const n27 = await leer27();
    prueba('de noche: el relieve de noche a la vista y el de día escondido', n27.ims.join(',') === './datos/cuerpo/isla-relieve-dia.webp:none,./datos/cuerpo/isla-relieve-noche.webp:inline', n27.ims.join(','));
    await p27.click('#tgc-tema'); await p27.waitForTimeout(150);
    /* los diez idiomas: nada vacío, nada en castellano fuera del castellano */
    const malos27 = [];
    for (const l of ['es', 'en', 'fr', 'de', 'it', 'nl', 'zh', 'zht', 'bg', 'pl']) {
      await idioma(p27, l);
      const r = await p27.evaluate(() => {
        const g = id => document.getElementById(id);
        return { tit: g('tgc-comp-l').textContent, ayuda: g('tgc-comp-ayuda').textContent, send: g('tgc-send-tit').textContent, sub: g('tgc-send-sub').textContent, de: g('tgc-send-de').textContent,
          nombres: [...document.querySelectorAll('#tgc-comp-pie .tgc-comp-nom, #tgc-comp-bici .tgc-comp-nom')].map(n => n.textContent), norte: g('tgc-isla-norte').textContent, alt: g('tgc-isla-alt').textContent,
          zonas: [...document.querySelectorAll('#tgc-send-lista .tgc-send-zn')].map(n => n.textContent), cifras: g('tgc-cifras-mapa').textContent };
      });
      const textos = [r.tit, r.ayuda, r.send, r.sub, r.de, r.norte, r.alt, r.cifras].concat(r.nombres);
      if (textos.some(t => !t || !t.trim())) malos27.push(l + ': vacío');
      if (l !== 'es' && [r.tit, r.ayuda, r.send, r.sub].some(t => /compañero|Senderos de la isla|Márquelos/.test(t))) malos27.push(l + ': castellano');
      if (/^zh/.test(l) && ![r.tit, r.send, r.sub, r.norte].every(t => /[一-鿿]/.test(t))) malos27.push(l + ': sin chino');
      if (l === 'bg' && ![r.tit, r.send, r.sub, r.norte].every(t => /[Ѐ-ӿ]/.test(t))) malos27.push(l + ': sin cirílico');
      if (r.zonas.length !== 5) malos27.push(l + ': zonas ' + r.zonas.length);
    }
    await idioma(p27, 'es');
    prueba('los textos del bloque 8 en los diez idiomas: nada vacío, nada en castellano fuera del castellano, el chino en chino y el búlgaro en cirílico', malos27.length === 0, malos27.join(' | '));
    prueba('bloque 8: sin errores de página', e27.length === 0, e27.join(' | '));
    await c27.close();

    /* las celebraciones: el primero, el 25 % y el 100 % */
    const c27f = await contexto(b, { fiesta: true }), p27f = await c27f.newPage(), e27f = []; vigilar(p27f, e27f);
    await abrirApp(p27f); await abrirPerfilCuerpo(p27f); await suCuerpo(p27f); await vacio(p27f); await p27f.waitForTimeout(250);
    const fiesta = async () => { await p27f.waitForTimeout(450); const r = await p27f.evaluate(() => { const f = document.getElementById('tgc-fiesta'); const n = t => (t || '').replace(/\u00a0/g, ' '); return { abierta: !f.hidden, tit: n((f.querySelector('#tgc-fiesta-tit') || {}).textContent), txt: n((f.querySelector('#tgc-fiesta-txt') || {}).textContent), arte: !!f.querySelector('.tgc-send-arte') }; }); await p27f.keyboard.press('Escape'); await p27f.waitForTimeout(350); return r; };
    await p27f.evaluate(() => { document.querySelector('#tgc-send-lista details[data-zona="anaga"]').open = true; });
    await p27f.click('#tgc-send-lista .tgc-send-op[data-id="prtf-1-mercedes-cruz-carmen"]');
    const f1 = await fiesta();
    prueba('el primer sendero: la celebración «Su primer sendero» («PR-TF 1 · Las Mercedes — Cruz del Carmen: el primero de los ' + totalSend + ' senderos de la guía.»), con su dibujo', f1.abierta && f1.tit === 'Su primer sendero' && f1.txt === 'PR-TF 1 · Las Mercedes — Cruz del Carmen: el primero de los ' + totalSend + ' senderos de la guía.' && f1.arte, JSON.stringify(f1));
    const cuarto = Math.ceil(totalSend / 4);
    await p27f.evaluate(l => { const g = JSON.parse(localStorage.getItem('tenerife.cuerpo')); l.forEach(id => { g.senderos[id] = '2026-11-01'; }); localStorage.setItem('tenerife.cuerpo', JSON.stringify(g)); TG_CUERPO.abrir(); }, ids.filter(id => id !== 'prtf-1-mercedes-cruz-carmen' && id !== 'montana-blanca').slice(0, cuarto - 2));
    await p27f.waitForTimeout(200);
    await p27f.evaluate(() => { document.querySelector('#tgc-send-lista details[data-zona="teide"]').open = true; });
    await p27f.click('#tgc-send-lista .tgc-send-op[data-id="montana-blanca"]');
    const f2 = await fiesta();
    prueba('al pasar del 25 %: «El 25 % de los senderos» y «Lleva ' + cuarto + ' de ' + totalSend + '. Cada sendero, una parte nueva de la isla.»', f2.abierta && f2.tit === 'El 25 % de los senderos' && f2.txt === 'Lleva ' + cuarto + ' de ' + totalSend + '. Cada sendero, una parte nueva de la isla.', JSON.stringify(f2));
    await p27f.evaluate(l => { const g = JSON.parse(localStorage.getItem('tenerife.cuerpo')); l.forEach(id => { g.senderos[id] = '2026-11-01'; }); localStorage.setItem('tenerife.cuerpo', JSON.stringify(g)); TG_CUERPO.abrir(); }, ids.filter(id => id !== 'sendero-chinyero'));
    await p27f.waitForTimeout(200);
    await p27f.evaluate(() => { document.querySelector('#tgc-send-lista details[data-zona="norte"]').open = true; });
    await p27f.click('#tgc-send-lista .tgc-send-op[data-id="sendero-chinyero"]');
    const f3 = await fiesta();
    prueba('el último: «Todos los senderos» y «Ha hecho los ' + totalSend + ' senderos de la guía: el 100 %.»', f3.abierta && f3.tit === 'Todos los senderos' && f3.txt === 'Ha hecho los ' + totalSend + ' senderos de la guía: el 100 %.', JSON.stringify(f3));
    prueba('las celebraciones: sin errores de página', e27f.length === 0, e27f.join(' | '));
    await c27f.close();

    /* a 320 px, de noche y en alemán (los textos más largos): nada pasa del borde */
    const c27b = await contexto(b, { contexto: { viewport: { width: 320, height: 568 } } }), p27b = await c27b.newPage(), e27b = []; vigilar(p27b, e27b);
    await abrirApp(p27b); await abrirPerfilCuerpo(p27b); await suCuerpo(p27b);
    await p27b.click('#tgc-tema'); await p27b.waitForTimeout(150);
    await ejemplo(p27b, { mov: [[1, 'caminar', 60, 5], [0, 'bici', 60, 20]], gr: ['bici'], comp: { pie: 'perro', bici: 'montana' }, senderos: { 'montana-blanca': '2026-11-01' } });
    for (const l of ['de', 'bg', 'pl']) {
      await idioma(p27b, l); await p27b.waitForTimeout(150);
      await p27b.evaluate(() => document.querySelectorAll('#tgc-send-lista details').forEach(d => { d.open = true; }));
      const r = await p27b.evaluate(() => {
        const p = document.getElementById('cuerpo-panel'), b = p.getBoundingClientRect();
        const anchos = [...p.querySelectorAll('#tgc-isla *, #tgc-send *')].filter(n => { if (!n.getClientRects().length || n.closest('svg')) return false; const x = n.getBoundingClientRect(); return x.right > b.right + 0.5 || x.left < b.left - 0.5; }).map(n => n.id || (typeof n.className === 'string' ? n.className : '') || n.tagName).slice(0, 5);
        return { anchos, psw: p.scrollWidth, pcw: p.clientWidth };
      });
      prueba('a 320 px, de noche, en ' + l + ': «Cruce la isla» (con las dos filas del compañero) y «Senderos de la isla» (todas las zonas abiertas) sin desborde', r.psw <= r.pcw && r.anchos.length === 0, `${r.psw}>${r.pcw} ${r.anchos.join(',')}`);
    }
    prueba('a 320 px: sin errores de página', e27b.length === 0, e27b.join(' | '));
    await c27b.close();
  }

  // 28. (10-11-2026, #99; Jerome: «Que todo sea juntos») la pestaña «Evolución»: «Sus datos» y «Su evolución» del perfil,
  //     dentro de «Su cuerpo». En la pestaña Cuerpo del perfil, solo la tarjeta; la barra, de cinco, en orden y sin
  //     rótulos cortados (360 y 390 px, diez idiomas); las dos tarjetas, prestadas (las mismas, no una copia), con los
  //     colores de Día y de Noche; los km, juntos: los de antes del perfil (con «Borrar») y los de «Anotar
  //     movimiento» (con el nombre de su deporte; el surf, sin km, no cuenta); «Anotar movimiento» abre la hoja y lo
  //     anotado suma; un peso guardado avisa en el aviso de «Su cuerpo»; al cerrar, vuelven al perfil, ocultas; al
  //     volver a abrir, otra vez en «Evolución»; un tipo de deporte con HTML no entra; y sin TG_PERFIL.prestar (el
  //     prototipo), la pestaña no sale
  {
    const ymd = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    const hace = n => { const d = new Date(); d.setDate(d.getDate() - n); return ymd(d); };
    const perfil = { v: 1, nombre: 'Alex', avatar: '', unidades: 'metric', altura_cm: 178, nacimiento: 1990, objetivo_kg: 78, creado: hace(30), rango: 30, tab: 'km', pestana: 'cuerpo',
      medidas: [0, 3, 6, 9].map(n => ({ d: hace(n), kg: 80 - n / 10 })), km: [{ id: 'antes-1-a1b2c3d4e5f6', d: hace(2), km: 4.2 }, { id: 'antes-2-a1b2c3d4e5f6', d: hace(20), km: 10 }] };
    const T0 = Date.now() - 3600e3;
    const cuerpo = { v: 1, series: [], gr: [], mov: [[0, 'bici', 60, 24], [1, 'senderismo', 300, 29.2], [3, 'nadar', 30, 0.05], [0, 'surf', 90, 0], [4, '<img src=x onerror=alert(1)>', 30, 7]]
      .map((x, i) => ({ d: hace(x[0]), tipo: x[1], min: x[2], km: x[3], int: 'm', t: T0 + i })) };
    /* los de «Su cuerpo» que valen: 24 + 29,2 + 0,05 (el tipo con HTML no es un deporte de la lista: «Su cuerpo» no lo lee).
       En metros, como los cuenta el perfil: 4,2 + 24 + 29,2 + 0,05 son 57.450 m, «57,5 km» (con los decimales de la
       máquina daba 57,4499… y salía «57,4») */
    const M = { total: 4200 + 10000 + 24000 + 29200 + 50, siete: 4200 + 24000 + 29200 + 50, hoy: 24000 };
    const NOMBRE = { es: 'Evolución', en: 'Progress', fr: 'Évolution', de: 'Verlauf', it: 'Progressi', nl: 'Voortgang', zh: '进展', zht: '進展', bg: 'Напредък', pl: 'Postępy' };
    const TOT = { es: 'Total', en: 'Total', fr: 'Total', de: 'Gesamt', it: 'Totale', nl: 'Totaal', zh: '累计', zht: '累計', bg: 'Общо', pl: 'Łącznie' };
    const c28 = await contexto(b), p28 = await c28.newPage(), e28 = []; vigilar(p28, e28);
    await c28.addInitScript(([p, c]) => { try { if (!sessionStorage.getItem('s28')) { localStorage.setItem('tenerife.perfil', p); localStorage.setItem('tenerife.cuerpo', c); sessionStorage.setItem('s28', '1'); } } catch (e) {} },
      [JSON.stringify(perfil), JSON.stringify(cuerpo)]);
    await abrirApp(p28); await abrirPerfilCuerpo(p28);
    await p28.waitForFunction(() => window.TG_CUERPO, null, { timeout: 15000 }); await p28.waitForTimeout(200);
    const tab = await p28.evaluate(() => ({ datos: document.getElementById('tgp-datos').hidden, evo: document.getElementById('tgp-evo').hidden, tarjeta: !!document.getElementById('tgp-cuerpo').getClientRects().length,
      padre: document.getElementById('tgp-datos').parentNode.id }));
    prueba('28: en la pestaña Cuerpo del perfil, solo la tarjeta de «Su cuerpo» («Sus datos» y «Su evolución», ocultas en su sitio)', tab.datos && tab.evo && tab.tarjeta && tab.padre === 'tgp-p-cuerpo', JSON.stringify(tab));
    await suCuerpo(p28);
    const barra = () => p28.evaluate(() => [...document.querySelectorAll('#tgc-modos button')].filter(x => x.getClientRects().length).map(x => {
      const t = x.querySelector('.txt'), rg = document.createRange(); rg.selectNodeContents(t);
      const lineas = new Set([...rg.getClientRects()].map(q => Math.round(q.top))).size;
      return { id: x.id, txt: t.textContent, partida: lineas > 1 && !/\s/.test(t.textContent.trim()), fuera: t.scrollWidth > t.clientWidth + 1 || x.scrollWidth > x.clientWidth + 1 };
    }));
    const b0 = await barra();
    prueba('28: la barra, de cinco y en orden: Músculos · Aspecto · Comida · Evolución · Preguntar', b0.map(x => x.id).join() === 'tgc-modo-m,tgc-modo-a,tgc-modo-c,tgc-modo-e,tgc-modo-p', b0.map(x => x.txt).join(' · '));
    await p28.evaluate(() => { window.__antes28 = [document.getElementById('tgp-datos'), document.getElementById('tgp-evo')]; });
    await p28.click('#tgc-modo-e'); await p28.waitForTimeout(300);
    const v = await p28.evaluate(() => {
      const nodos = window.__antes28;
      const m = document.getElementById('tgc-evo-montaje'), d = document.getElementById('tgp-datos'), e = document.getElementById('tgp-evo');
      return { vista: !document.getElementById('tgc-vista-evolucion').hidden, escena: document.getElementById('tgc-escena').hidden, pulsado: document.getElementById('tgc-modo-e').getAttribute('aria-pressed'),
        dentro: m.contains(d) && m.contains(e) && !d.hidden && !e.hidden, mismos: d === nodos[0] && e === nodos[1], unaVez: document.querySelectorAll('#tgp-datos, #tgp-evo').length === 2,
        fondo: getComputedStyle(e).backgroundColor, titulo: getComputedStyle(e.querySelector('h2')).color };
    });
    prueba('28: «Evolución»: las dos tarjetas del perfil dentro (las mismas, sin copia), sin la escena, con el botón pulsado', v.vista && v.escena && v.pulsado === 'true' && v.dentro && v.mismos && v.unaVez, JSON.stringify(v));
    prueba('28: de Día, con los colores de «Su cuerpo»: la tarjeta blanca y el título en su tinta', v.fondo === 'rgb(255, 255, 255)' && v.titulo === 'rgb(18, 35, 58)', v.fondo + ' / ' + v.titulo);
    /* los km, juntos */
    await p28.click('#tgp-evo-tabs [data-tab="km"]'); await p28.waitForTimeout(250);
    const km = () => p28.evaluate(() => ({ v: [...document.querySelectorAll('#tgp-km-tiles .tgp-tile .v')].map(t => t.textContent), k: [...document.querySelectorAll('#tgp-km-tiles .tgp-tile .k')].map(t => t.textContent),
      filas: [...document.querySelectorAll('#tgp-km-log li')].map(li => ({ km: li.children[1].textContent, x: !!li.querySelector('.x'), q: (li.querySelector('.q') || {}).textContent || '' })),
      html: !!document.querySelector('#tgp-evo img, #tgp-evo [onerror]') }));
    const f = m => new Intl.NumberFormat('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(Math.round(m / 100) / 10) + ' km';
    const k1 = await km();
    prueba('28: los km juntos: 7 días, hoy y «Total» (los de antes y los de «Anotar movimiento»; el surf, sin km, y el tipo con HTML, fuera)', JSON.stringify(k1.v) === JSON.stringify([f(M.siete), f(M.hoy), f(M.total)]) && k1.v[0] === '57,5 km' && k1.k[2] === 'Total', JSON.stringify(k1));
    prueba('28: la lista: los de antes con «Borrar»; los de «Su cuerpo», con el nombre de su deporte; sin HTML de nadie', k1.filas.length === 5 && k1.filas.filter(x => x.x).length === 2 &&
      k1.filas.filter(x => !x.x).map(x => x.q).join() === 'Bici,Senderismo,Nadar' && !k1.html, JSON.stringify(k1.filas));
    /* «Anotar movimiento»: la hoja; caminar, con sus km, y el total sube */
    await p28.click('#tgp-km-anotar'); await p28.waitForTimeout(400);
    const h = await p28.evaluate(() => ({ hoja: !document.getElementById('tgc-hoja').hidden, mov: !document.getElementById('tgc-pag-mov').hidden }));
    await p28.click('#tgc-mov-tipos .tgc-tipo[data-tipo="caminar"]'); await p28.waitForTimeout(150);
    const kmC = await p28.evaluate(() => Number(String(document.getElementById('tgc-mov-km').value).replace(',', '.')));
    await p28.click('#tgc-mov-guardar'); await p28.waitForTimeout(500);
    const k2 = await km(), foco = await p28.evaluate(() => document.activeElement && document.activeElement.id);
    prueba('28: «Anotar movimiento» abre la hoja de «Su cuerpo»; lo anotado (caminar, ' + kmC + ' km) suma en el momento, y el foco vuelve al botón', h.hoja && h.mov && kmC > 0 &&
      k2.v[2] === f(M.total + Math.round(kmC * 1000)) && k2.filas[0].q === 'Caminar' && foco === 'tgp-km-anotar', JSON.stringify({ h, k2: k2.v, primera: k2.filas[0], foco }));
    /* un peso: «Guardado ✓», en el aviso de «Su cuerpo» */
    await p28.click('#tgp-evo-tabs [data-tab="peso"]'); await p28.waitForTimeout(150);
    await p28.fill('#tgp-peso-nuevo', '79,6'); await p28.click('#tgp-add-peso button[type="submit"]'); await p28.waitForTimeout(250);
    const av = await p28.evaluate(() => ({ t: document.getElementById('tgc-toast').classList.contains('show') ? document.getElementById('tgc-toast-txt').textContent : '', esp: tx('perfilGuardado'),
      kg: (JSON.parse(localStorage.getItem('tenerife.perfil')).medidas || []).filter(m => m.kg === 79.6).length }));
    prueba('28: un peso guardado en «Evolución» se guarda en el perfil, y «Guardado ✓» sale en el aviso de «Su cuerpo»', av.t === av.esp && av.kg === 1, JSON.stringify(av));
    /* Noche */
    await p28.click('#tgc-tema'); await p28.waitForTimeout(200);
    const n = await p28.evaluate(() => ({ fondo: getComputedStyle(document.getElementById('tgp-evo')).backgroundColor, titulo: getComputedStyle(document.querySelector('#tgp-evo h2')).color,
      esquema: getComputedStyle(document.getElementById('tgc-evo-montaje')).colorScheme }));
    await p28.click('#tgc-tema'); await p28.waitForTimeout(150);
    prueba('28: de Noche, también los de «Su cuerpo»: la tarjeta en su azul de noche, el título claro y los controles oscuros', n.fondo === 'rgb(27, 35, 48)' && n.titulo === 'rgb(240, 236, 228)' && n.esquema === 'dark', JSON.stringify(n));
    /* los diez idiomas: la barra a 390 y a 360, y los textos de las dos tarjetas */
    const malI = [];
    for (const L of Object.keys(NOMBRE)) {
      await idioma(p28, L); await p28.waitForTimeout(150);
      await p28.click('#tgp-evo-tabs [data-tab="km"]'); await p28.waitForTimeout(120);
      for (const w of [390, 360]) {
        await p28.setViewportSize({ width: w, height: 844 }); await p28.waitForTimeout(120);
        (await barra()).filter(x => x.partida || x.fuera).forEach(x => malI.push(L + '@' + w + ' barra: ' + x.txt));
      }
      const r = await p28.evaluate(() => {
        const m = document.getElementById('tgc-evo-montaje'), out = [];
        m.querySelectorAll('[data-tx]').forEach(n => { if (n.getClientRects().length && !n.textContent.trim()) out.push('vacío ' + n.getAttribute('data-tx')); });
        const w = document.createTreeWalker(m, NodeFilter.SHOW_TEXT); let t;
        while ((t = w.nextNode())) { const s = t.data.trim(); if (s && /\b(perfil|cuerpo|medida)[A-Z]\w+/.test(s)) out.push('clave ' + s); }
        m.querySelectorAll('*').forEach(e => { if (!e.getClientRects().length || e.closest('svg, .tgp-tip')) return; const q = e.getBoundingClientRect(); if (q.right > innerWidth + 1 || q.left < -1) out.push('fuera ' + (e.id || e.className)); });
        return { out, nombre: document.querySelector('#tgc-modo-e .txt').textContent, total: document.querySelectorAll('#tgp-km-tiles .tgp-tile .k')[2].textContent,
          anotar: document.querySelector('#tgp-km-anotar span').textContent, hoja: tx('cuerpoMovAnotar') };
      });
      r.out.forEach(x => malI.push(L + ': ' + x));
      if (r.nombre !== NOMBRE[L]) malI.push(L + ': la pestaña dice «' + r.nombre + '»');
      if (r.total !== TOT[L]) malI.push(L + ': «Total» dice «' + r.total + '»');
      if (r.anotar !== r.hoja) malI.push(L + ': el botón dice «' + r.anotar + '» y la hoja «' + r.hoja + '»');
    }
    await idioma(p28, 'es'); await p28.setViewportSize({ width: 390, height: 844 }); await p28.waitForTimeout(150);
    prueba('28: en los diez idiomas: la pestaña con su nombre, sin cortar a 390 ni a 360 px; «Total» y «Anotar movimiento» (el mismo de la hoja), traducidos; nada vacío, ninguna clave suelta, nada fuera', !malI.length, malI.slice(0, 8).join(' | '));
    /* cerrar: vuelven al perfil, ocultas; al abrir otra vez, en «Evolución» y prestadas otra vez */
    await p28.keyboard.press('Escape'); await p28.waitForTimeout(400);
    const c1 = await p28.evaluate(() => ({ abierto: TG_CUERPO.abierto(), padres: [document.getElementById('tgp-datos').parentNode.id, document.getElementById('tgp-evo').parentNode.id].join(),
      ocultas: document.getElementById('tgp-datos').hidden && document.getElementById('tgp-evo').hidden, clase: document.getElementById('tgc-evo-montaje').classList.contains('tgp'), perfil: !document.getElementById('perfil-panel').hidden }));
    prueba('28: al cerrar «Su cuerpo» (Escape), las dos vuelven a la pestaña Cuerpo del perfil, ocultas, y el perfil sigue abierto', !c1.abierto && c1.padres === 'tgp-p-cuerpo,tgp-p-cuerpo' && c1.ocultas && !c1.clase && c1.perfil, JSON.stringify(c1));
    await suCuerpo(p28);
    const c2 = await p28.evaluate(() => ({ e: document.getElementById('tgc-modo-e').getAttribute('aria-pressed'), dentro: document.getElementById('tgc-evo-montaje').contains(document.getElementById('tgp-evo')) }));
    prueba('28: al volver a abrir, sigue en «Evolución», con las dos dentro', c2.e === 'true' && c2.dentro, JSON.stringify(c2));
    /* sin TG_PERFIL.prestar (como en el prototipo): la pestaña no sale y no se puede pedir */
    await p28.keyboard.press('Escape'); await p28.waitForTimeout(300);
    const sin = await p28.evaluate(() => {
      const p = TG_PERFIL.prestar; TG_PERFIL.prestar = undefined;
      TG_CUERPO.abrir({ modo: 'evolucion' });
      const r = { boton: document.getElementById('tgc-modo-e').hidden, musculos: document.getElementById('tgc-modo-m').getAttribute('aria-pressed'), vista: document.getElementById('tgc-vista-evolucion').hidden };
      TG_CUERPO.cerrar(); TG_PERFIL.prestar = p; return r;
    });
    await p28.waitForTimeout(300);
    prueba('28: sin TG_PERFIL.prestar (el prototipo), «Evolución» no sale, y pedirla abre «Músculos»', sin.boton && sin.musculos === 'true' && sin.vista, JSON.stringify(sin));
    prueba('28: sin errores de página', e28.length === 0, e28.join(' | '));
    await c28.close();
  }

  // 29. (12-11-2026, #120; Jérôme: «A y B si») «¿Qué entreno hoy?» en «Músculos», con lo anotado: cada grupo dos veces
  //     por semana, la segunda cuando ya están todos, y nunca antes de 48 horas (lo de hoy o de ayer descansa); delante,
  //     los prioritarios de su deporte y luego el que hace más que no se trabaja; el caso de Jérôme (pecho el lunes: el
  //     miércoles no sale pecho); el sitio de cada día (en casa, con el material que marque), guardado y con los
  //     ejercicios de ese sitio al abrir un grupo; «¿Por qué?», con las dos respuestas y sus fuentes; diez idiomas; y lo
  //     guardado que no vale, fuera
  {
    const ymd = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    const hace = n => { const d = new Date(); d.setDate(d.getDate() - n); return ymd(d); };
    const c29 = await contexto(b), p29 = await c29.newPage(), e29 = []; vigilar(p29, e29);
    await abrirApp(p29); await abrirPerfilCuerpo(p29); await suCuerpo(p29);
    const G29 = await p29.evaluate(() => TG_FIGURA.GRUPOS.slice());
    /* filas [hace cuántos días, grupo, series]; lo demás (deporte, sitio, material) tal cual */
    const poner = (filas, extra) => p29.evaluate(([f, ex]) => {
      const T0 = Date.now() - 5e6;
      localStorage.setItem('tenerife.cuerpo', JSON.stringify(Object.assign({ v: 1, series: f.map((x, i) => ({ d: x[0], g: x[1], n: x[2], t: T0 + i })) }, ex || {})));
      TG_CUERPO.abrir();
    }, [filas.map(x => [hace(x[0]), x[1], x[2]]), extra || null]).then(() => p29.waitForTimeout(200));
    const nombres = () => p29.evaluate(() => Object.fromEntries([...document.querySelectorAll('#tgc-lista .tgc-fila')].map(b => [b.dataset.g, b.querySelector('.tgc-fila-nom').firstChild.textContent])));
    const plan = () => p29.evaluate(() => ({
      abierto: !document.getElementById('tgc-plan-cuerpo').hidden, exp: document.getElementById('tgc-plan-btn').getAttribute('aria-expanded'),
      btn: document.getElementById('tgc-plan-btn-txt').textContent, res: document.getElementById('tgc-plan-resumen').textContent,
      tit: document.getElementById('tgc-plan-tit').textContent, txt: document.getElementById('tgc-plan-txt').textContent,
      lista: !document.getElementById('tgc-plan-lista').hidden,
      grupos: [...document.querySelectorAll('#tgc-plan-lista .tgc-plan-g')].map(b => b.dataset.g),
      prio: [...document.querySelectorAll('#tgc-plan-lista .tgc-plan-g.prio')].map(b => b.dataset.g),
      metas: Object.fromEntries([...document.querySelectorAll('#tgc-plan-lista .tgc-plan-g')].map(b => [b.dataset.g, b.querySelector('.tgc-plan-g-meta').textContent])),
      desc: document.getElementById('tgc-plan-descansan').hidden ? null : document.getElementById('tgc-plan-descansan').textContent,
      sitios: [...document.querySelectorAll('#tgc-plan-sitios button')].map(b => b.dataset.sitio + ':' + b.getAttribute('aria-pressed')),
      casaTxt: (document.querySelector('#tgc-plan-sitios [data-sitio="casa"]') || {}).textContent,
      mat: !document.getElementById('tgc-plan-mat').hidden, matAbierto: document.getElementById('tgc-plan-mat').open,
      matSel: document.getElementById('tgc-plan-mat-sel').hidden ? null : document.getElementById('tgc-plan-mat-sel').textContent, mats: [...document.querySelectorAll('#tgc-plan-mats button')].map(b => b.dataset.mat + ':' + b.getAttribute('aria-pressed')),
      donde: document.getElementById('tgc-plan-donde').textContent, porque: document.getElementById('tgc-plan-porque').textContent }));
    const abrirPlan = async () => { if (!(await plan()).abierto) { await p29.click('#tgc-plan-btn'); await p29.waitForTimeout(250); } };
    const N = await nombres();
    const lis = gs => gs.map(g => N[g]).join(', ');
    const D48 = 'Para un mismo grupo, el ACSM (2011) aconsejaba al menos 48 horas entre sesiones.';
    const OMS = 'La OMS recomienda a los adultos ejercicios de fuerza al menos 2 días por semana, con todos los grupos musculares principales, y de 5 a 17 años, al menos 3 días.';
    const SUAVE = 'Descansar no es estar quieto: caminar o moverse suave en los días libres también suma para la salud.';
    const sin = (gs, quita) => gs.filter(g => quita.indexOf(g) < 0);

    // sin nada anotado: un primer día de cuerpo completo, con los seis grupos del asistente y el nivel inicial
    await poner([]);
    const NADA = ['pecho', 'dorsal', 'hombros', 'core', 'cuadriceps', 'isquios'];
    const p0 = await plan();
    prueba('29: el botón «¿Qué entreno hoy?», cerrado, con «Para hoy: …» debajo', p0.btn === '¿Qué entreno hoy?' && !p0.abierto && p0.exp === 'false' && p0.res === 'Para hoy: ' + lis(NADA) + '.', JSON.stringify(p0));
    await abrirPlan();
    const p0b = await plan();
    prueba('29: sin nada anotado, «Hoy le tocan» los seis del primer día, de nivel inicial; nadie descansa', p0b.abierto && p0b.exp === 'true' && p0b.tit === 'Hoy le tocan' &&
      p0b.txt === 'Todavía no tiene nada anotado. Para empezar, un día de cuerpo completo con ejercicios de nivel inicial:' && JSON.stringify(p0b.grupos) === JSON.stringify(NADA) && p0b.desc === null, JSON.stringify(p0b));
    prueba('29: «¿Dónde entrena hoy?», cuatro sitios y ninguno elegido; el material, escondido', p0b.donde === '¿Dónde entrena hoy?' &&
      p0b.sitios.join() === 'gimnasio:false,casa:false,fuera:false,calistenia:false' && p0b.casaTxt === 'En casa' && !p0b.mat && p0b.porque === '¿Por qué?', JSON.stringify(p0b));
    await p29.click('#tgc-plan-lista [data-g="pecho"]'); await p29.waitForSelector('.tgc-ej-fila', { timeout: 8000 }); await p29.waitForTimeout(150);
    const h0 = await p29.evaluate(() => ({ tit: document.getElementById('tgc-hoja-tit').textContent, niv: document.querySelector('#tgc-ej-niv [aria-pressed="true"]').dataset.v,
      ent: document.querySelector('#tgc-ej-ent [aria-pressed="true"]').dataset.v, niveles: [...new Set([...document.querySelectorAll('.tgc-ej-fila .tgc-ej-niv')].map(e => e.textContent))] }));
    prueba('29: el primer día, «Pecho» abre su hoja con el nivel inicial y todos los sitios', h0.tit === N.pecho && h0.niv === '1' && h0.ent === 'todos' && h0.niveles.join() === 'Inicial', JSON.stringify(h0));
    await p29.keyboard.press('Escape'); await p29.waitForTimeout(250);

    // el caso de Jérôme: pecho el lunes; el miércoles (dos días después) no sale pecho, y no descansa (ya pasaron 48 h)
    await poner([[2, 'pecho', 4]]);
    const p1 = await plan();
    prueba('29: Jérôme: pecho hace 2 días; hoy no sale pecho, salen los otros 11 y nadie descansa', JSON.stringify(p1.grupos) === JSON.stringify(sin(G29, ['pecho'])) && p1.desc === null &&
      p1.txt === 'Los grupos sin series en los últimos 7 días.', JSON.stringify(p1));

    // hoy o ayer: descansa (48 horas); los demás, primero el que hace más que no se trabaja
    await poner([[0, 'pecho', 3], [1, 'dorsal', 3], [3, 'hombros', 3], [20, 'biceps', 3], [12, 'triceps', 3], [9, 'core', 3]].concat(sin(G29, ['pecho', 'dorsal', 'hombros', 'biceps', 'triceps', 'core']).map(g => [8, g, 2])));
    const p2 = await plan();
    const esp2 = ['biceps', 'triceps', 'core'].concat(sin(G29, ['pecho', 'dorsal', 'hombros', 'biceps', 'triceps', 'core']));
    prueba('29: el que hace más que no se trabaja, primero (20, 12 y 9 días; los de 8, en su orden)', JSON.stringify(p2.grupos) === JSON.stringify(esp2), JSON.stringify(p2.grupos));
    prueba('29: lo de hoy y ayer descansa: «Descansan hoy (los trabajó ayer u hoy): Pecho, Dorsales.» y las 48 horas del ACSM', p2.desc === 'Descansan hoy (los trabajó ayer u hoy): ' + lis(['pecho', 'dorsal']) + '. ' + D48, p2.desc);
    prueba('29: cada grupo dice cuándo se trabajó por última vez', p2.metas.biceps.indexOf('hace 20 días') >= 0 && p2.metas.core.indexOf('hace 9 días') >= 0, JSON.stringify(p2.metas));

    // todos una vez: la segunda vuelta, sin los que llevan dos días ni los de hoy y ayer
    await poner(G29.map(g => [3, g, 3]).concat([[1, 'pecho', 3], [1, 'espalda_alta', 3]]));
    const p3 = await plan();
    prueba('29: con los 12 trabajados, la segunda vez: los que llevan un día, sin los que descansan', JSON.stringify(p3.grupos) === JSON.stringify(sin(G29, ['pecho', 'espalda_alta'])) &&
      p3.tit === 'Hoy le tocan' && p3.txt === 'Ya ha trabajado los 12 grupos en los últimos 7 días; estos, un solo día. ' + OMS && p3.res === 'Para hoy: ' + lis(sin(G29, ['pecho', 'espalda_alta'])) + '.', JSON.stringify(p3));
    // todos ayer: lo que queda descansa
    await poner(G29.map(g => [1, g, 3]));
    const p4 = await plan();
    prueba('29: todo trabajado ayer: «Hoy, descanso», sin lista, y descansan los 12', p4.tit === 'Hoy, descanso' && !p4.lista && p4.grupos.length === 0 && p4.res === 'Hoy, descanso o actividad suave.' &&
      p4.txt === 'Lo que le queda lo trabajó ayer u hoy. ' + SUAVE && p4.desc === 'Descansan hoy (los trabajó ayer u hoy): ' + lis(G29) + '. ' + D48, JSON.stringify(p4));
    // todos dos días: hecho
    await poner(G29.map(g => [5, g, 3]).concat(G29.map(g => [3, g, 3])));
    const p5 = await plan();
    prueba('29: los 12 con dos días o más: «Hoy, descanso» y nadie descansa por las 48 horas', p5.tit === 'Hoy, descanso' && p5.grupos.length === 0 && p5.desc === null &&
      p5.txt === 'Ha trabajado los 12 grupos al menos 2 días en los últimos 7. ' + SUAVE, JSON.stringify(p5));

    // con un deporte: sus prioritarios delante (la misma marca que la lista de los 12)
    const dep = await p29.evaluate(() => [...document.querySelectorAll('#tgc-dep-sel option')].map(o => o.value).filter(Boolean)[0]);
    await poner([[2, 'pecho', 4]], { deporte: dep });
    const prio = await p29.evaluate(() => [...document.querySelectorAll('#tgc-lista .tgc-fila.prio')].map(b => b.dataset.g));
    const p6 = await plan();
    const esp6 = prio.filter(g => g !== 'pecho').concat(sin(G29, prio.concat(['pecho'])));
    prueba('29: con «' + dep + '», sus prioritarios delante y marcados, y la frase que lo dice', prio.length > 0 && JSON.stringify(p6.grupos) === JSON.stringify(esp6) &&
      JSON.stringify(p6.prio) === JSON.stringify(prio.filter(g => g !== 'pecho')) && p6.txt === 'Los grupos sin series en los últimos 7 días. Delante, los prioritarios para su deporte.', JSON.stringify({ prio, p6 }));

    // el sitio del día y el material de casa: se guardan y filtran los ejercicios
    await poner([[0, 'pecho', 3]]);
    const datos29 = await p29.evaluate(async () => (await (await fetch('datos/cuerpo/ejercicios.json')).json()).ejercicios);
    const cuenta = (g, f) => datos29.filter(x => x.g.includes(g) && f(x)).length;
    const casaCon = tiene => x => x.m.every(m => m === 'ninguno' || m === 'pared' || tiene.includes(m));
    await p29.click('#tgc-plan-sitios [data-sitio="gimnasio"]'); await p29.waitForTimeout(150);
    const p7 = await plan();
    prueba('29: «Gimnasio», elegido y guardado; cada grupo con sus ejercicios de gimnasio', p7.sitios.join() === 'gimnasio:true,casa:false,fuera:false,calistenia:false' &&
      await p29.evaluate(() => JSON.parse(localStorage.getItem('tenerife.cuerpo')).sitio === 'gimnasio') && p7.metas.dorsal.indexOf(cuenta('dorsal', x => x.e.includes('gimnasio')) + ' ejercicios') === 0, JSON.stringify(p7.metas));
    await p29.click('#tgc-plan-sitios [data-sitio="casa"]'); await p29.waitForTimeout(150);
    const p8 = await plan();
    prueba('29: «En casa»: «¿Qué tiene en casa?», abierto, con 16 materiales sin marcar; dorsales, «ningún ejercicio con lo que tiene»', p8.mat && p8.matAbierto && p8.matSel === null && p8.mats.length === 16 && p8.mats.every(m => /:false$/.test(m)) &&
      cuenta('dorsal', casaCon([])) === 0 && p8.metas.dorsal.indexOf('ningún ejercicio con lo que tiene') === 0, JSON.stringify(p8));
    await p29.click('#tgc-plan-mats [data-mat="barra_dominadas"]'); await p29.waitForTimeout(150);
    const p9 = await plan(), nDor = cuenta('dorsal', casaCon(['barra_dominadas']));
    prueba('29: con la barra de dominadas, dorsales ya tiene ' + nDor + ' ejercicios, el material se guarda y la lista sigue abierta mientras marca', nDor > 0 && p9.metas.dorsal.indexOf(nDor + ' ejercicio') === 0 &&
      p9.matAbierto && p9.matSel === 'Barra de dominadas' &&
      JSON.stringify(await p29.evaluate(() => JSON.parse(localStorage.getItem('tenerife.cuerpo')).material)) === '["barra_dominadas"]', JSON.stringify(p9.metas));
    await p29.click('#tgc-plan-lista [data-g="dorsal"]'); await p29.waitForSelector('.tgc-ej-fila', { timeout: 8000 }); await p29.waitForTimeout(150);
    const h9 = await p29.evaluate(() => ({ ent: document.querySelector('#tgc-ej-ent [aria-pressed="true"]').dataset.v, ids: [...document.querySelectorAll('.tgc-ej-fila')].map(b => b.dataset.id),
      ayuda: document.getElementById('tgc-ej-casa-ayuda').hidden ? null : document.getElementById('tgc-ej-casa-ayuda').textContent }));
    const esp9 = datos29.filter(x => x.g.includes('dorsal') && casaCon(['barra_dominadas'])(x)).map(x => x.id);
    prueba('29: «Dorsales» abre su hoja «En casa», con esos ejercicios y la frase que lo explica', h9.ent === 'casa' && JSON.stringify(h9.ids) === JSON.stringify(esp9) &&
      h9.ayuda === 'En casa: los ejercicios con el material que marcó en «¿Qué entreno hoy?».', JSON.stringify(h9));
    await p29.keyboard.press('Escape'); await p29.waitForTimeout(250);

    // al volver otro día con el material ya marcado, la lista sale plegada y la línea dice lo marcado
    await p29.evaluate(() => { TG_CUERPO.cerrar(); }); await p29.waitForTimeout(300);
    await p29.reload({ waitUntil: 'load' }); await abrirApp(p29); await abrirPerfilCuerpo(p29); await suCuerpo(p29); await abrirPlan();
    const p10 = await plan();
    prueba('29: otro día, «En casa» sigue elegido y su material plegado, con «Barra de dominadas» a la vista', p10.sitios.indexOf('casa:true') >= 0 && p10.mat && !p10.matAbierto &&
      p10.matSel === 'Barra de dominadas', JSON.stringify(p10));
    // la continuidad en la ficha: al abrir un ejercicio, sus series, repeticiones y peso de la última vez
    await poner([[3, 'pecho', 5]]);
    await p29.evaluate(() => { const e = JSON.parse(localStorage.getItem('tenerife.cuerpo')); e.series[0].e = 'press-banca-barra'; e.series[0].r = 8; e.series[0].kg = 42.5; localStorage.setItem('tenerife.cuerpo', JSON.stringify(e)); TG_CUERPO.abrir(); });
    await p29.waitForTimeout(200);
    await p29.click('#tgc-lista .tgc-fila[data-g="pecho"]'); await p29.waitForSelector('.tgc-ej-fila', { timeout: 8000 });
    await p29.click('#tgc-ej-ent [data-v="todos"]'); await p29.click('.tgc-ej-fila[data-id="press-banca-barra"]'); await p29.waitForTimeout(250);
    const f10 = await p29.evaluate(() => ({ n: document.getElementById('tgc-ej-n').value, r: document.getElementById('tgc-ej-reps').value, kg: document.getElementById('tgc-ej-kg').value,
      ult: document.getElementById('tgc-ej-ultima').textContent }));
    prueba('29: la ficha sigue donde lo dejó: 5 series, 8 repeticiones y 42,5 kg, como la última vez', f10.n === '5' && f10.r === '8' && f10.kg === '42,5' &&
      f10.ult === 'La última vez, hace 3 días: 5 × 8 con 42,5 kg', JSON.stringify(f10));
    await p29.keyboard.press('Escape'); await p29.waitForTimeout(150); await p29.keyboard.press('Escape'); await p29.waitForTimeout(250);
    await poner([[0, 'pecho', 3]], { sitio: 'casa', material: ['barra_dominadas'] }); await abrirPlan();
    // «¿Por qué?»: «Preguntar», con las dos respuestas y sus fuentes
    await p29.click('#tgc-plan-porque');
    await p29.waitForFunction(() => document.querySelectorAll('#tgc-charla .tgc-resp').length >= 2, null, { timeout: 10000 }).catch(() => {});
    await p29.waitForTimeout(200);
    const q29 = await p29.evaluate(() => ({ modo: document.getElementById('tgc-modo-p').getAttribute('aria-pressed'), charla: document.getElementById('tgc-charla').textContent,
      fuentes: document.querySelectorAll('#tgc-charla .tgc-resp-f').length }));
    prueba('29: «¿Por qué?» abre «Preguntar» con «¿Cuántas veces por semana trabajo cada músculo?» y «¿Cuántos días de descanso necesito?», con sus fuentes',
      q29.modo === 'true' && q29.charla.indexOf('¿Cuántas veces por semana trabajo cada músculo?') >= 0 && q29.charla.indexOf('¿Cuántos días de descanso necesito?') >= 0 && q29.fuentes >= 2, JSON.stringify(q29).slice(0, 300));
    await p29.click('#tgc-modo-m'); await p29.waitForTimeout(250);

    // diez idiomas: el botón es la pregunta del asistente; sus textos, sin marcas sueltas ni castellano fuera del castellano
    const Q = { en: 'What should I train today?', fr: 'Qu’est-ce que j’entraîne aujourd’hui ?', de: 'Was trainiere ich heute?', it: 'Cosa alleno oggi?', nl: 'Wat train ik vandaag?',
      zh: '今天练什么？', zht: '今天練什麼？', bg: 'Какво да тренирам днес?', pl: 'Co dziś trenować?' };
    const es29 = await plan();
    for (const [l, q] of Object.entries(Q)) {
      await idioma(p29, l);
      const m = await plan();
      const txts = [m.res, m.tit, m.txt, m.donde, m.porque, m.casaTxt].concat(Object.values(m.metas));
      prueba('29, ' + l + ': «' + q + '», y la tarjeta en su idioma', m.btn === q && txts.every(t => t && t.indexOf('{') < 0) &&
        [m.tit, m.txt, m.donde, m.porque, m.casaTxt].every((t, i) => t !== [es29.tit, es29.txt, es29.donde, es29.porque, es29.casaTxt][i]), JSON.stringify(m).slice(0, 400));
    }
    await idioma(p29, 'es');

    // lo guardado: el sitio, de la lista; el material, de la lista y sin repetir
    await p29.evaluate(() => { localStorage.setItem('tenerife.cuerpo', JSON.stringify({ v: 1, series: [], sitio: 'piscina', material: ['mancuernas', 'mancuernas', '<img src=x>', 'maquina', 'banda'] })); TG_CUERPO.abrir(); });
    const v29 = await p29.evaluate(() => { const e = TG_CUERPO.estado(); return { sitio: e.sitio, material: e.material }; });
    prueba('29: lo guardado que no vale, fuera: un sitio que no es de la lista, materiales repetidos, con HTML o de gimnasio', v29.sitio === '' && JSON.stringify(v29.material) === '["mancuernas","banda"]', JSON.stringify(v29));
    prueba('29: sin errores de página', e29.length === 0, e29.join(' | '));
    await c29.close();
  }

  // 30. (12-11-2026, #120) «¿Qué entreno hoy?» en «Preguntar», con el mismo cálculo que la tarjeta de «Músculos»:
  //     cada caso con su texto (los nuevos: la segunda vez de la semana y el descanso de 48 horas), «en casa» entre los
  //     filtros, la fuente de las 48 horas (Garber et al., ACSM 2011) entre sus fuentes, los grupos como botones que abren
  //     su hoja con el sitio de hoy (el primer día, con el nivel inicial), y los diez idiomas
  {
    const ymd = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    const hace = n => { const d = new Date(); d.setDate(d.getDate() - n); return ymd(d); };
    const c30 = await contexto(b), p30 = await c30.newPage(), e30 = []; vigilar(p30, e30);
    await abrirApp(p30); await abrirPerfilCuerpo(p30); await suCuerpo(p30);
    const G30 = await p30.evaluate(() => TG_FIGURA.GRUPOS.slice());
    const N30 = await p30.evaluate(() => Object.fromEntries([...document.querySelectorAll('#tgc-lista .tgc-fila')].map(b => [b.dataset.g, b.querySelector('.tgc-fila-nom').firstChild.textContent])));
    const sin = (gs, quita) => gs.filter(g => quita.indexOf(g) < 0);
    const lis = gs => gs.map(g => N30[g]).join(', ');
    const poner = (filas, extra) => p30.evaluate(([f, ex]) => {
      const T0 = Date.now() - 5e6;
      localStorage.setItem('tenerife.cuerpo', JSON.stringify(Object.assign({ v: 1, series: f.map((x, i) => ({ d: x[0], g: x[1], n: x[2], t: T0 + i })) }, ex || {})));
      TG_CUERPO.abrir();
    }, [filas.map(x => [hace(x[0]), x[1], x[2]]), extra || null]).then(() => p30.waitForTimeout(200));
    /* la pregunta, ya hecha (su chip de «Preguntar»), y la última tarjeta de respuesta */
    const preguntar = async () => {
      await p30.click('#tgc-modo-p');
      await p30.waitForFunction(() => document.querySelector('#tgc-sugeridas .tgc-chip-preg[data-id="que-entreno-hoy"]'), null, { timeout: 10000 });
      await p30.evaluate(() => { const v = document.getElementById('tgc-asis-vaciar'); if (v && !v.hidden) v.click(); });
      await p30.click('#tgc-sugeridas .tgc-chip-preg[data-id="que-entreno-hoy"]');
      await p30.waitForFunction(() => document.querySelectorAll('#tgc-charla .tgc-resp').length >= 1, null, { timeout: 8000 });
      await p30.waitForTimeout(150);
      return p30.evaluate(() => {
        const rs = document.querySelectorAll('#tgc-charla .tgc-resp'), r = rs[rs.length - 1];
        return { t: (r.querySelector('.tgc-resp-t') || {}).textContent, p: [...r.querySelectorAll('.tgc-resp-p li')].map(x => x.textContent),
          grupos: [...r.querySelectorAll('.tgc-resp-links button[data-plan]')].map(x => x.dataset.g), plan: [...new Set([...r.querySelectorAll('.tgc-resp-links button[data-plan]')].map(x => x.dataset.plan))],
          botones: [...r.querySelectorAll('.tgc-resp-links button[data-plan]')].map(x => x.textContent),
          fuentes: [...r.querySelectorAll('.tgc-resp-f li a')].map(a => a.textContent) };
      });
    };
    const D48 = 'Para un mismo grupo, el ACSM (2011) aconsejaba al menos 48 horas entre sesiones.';
    const OMS = 'La OMS recomienda a los adultos ejercicios de fuerza al menos 2 días por semana, con todos los grupos musculares principales, y de 5 a 17 años, al menos 3 días.';

    await poner([[0, 'pecho', 3], [1, 'dorsal', 3], [3, 'hombros', 3]]);
    const a1 = await preguntar();
    const esp1 = sin(G30, ['pecho', 'dorsal', 'hombros']);
    prueba('30: lo que falta, como en la tarjeta: «Le faltan por trabajar en los últimos 7 días: …», y un botón por grupo', a1.t === 'Le faltan por trabajar en los últimos 7 días: ' + lis(esp1) + '.' &&
      JSON.stringify(a1.grupos) === JSON.stringify(esp1) && a1.plan.join() === 'faltan' && a1.botones[0] === 'Ver ' + N30[esp1[0]], JSON.stringify(a1).slice(0, 400));
    prueba('30: los filtros que nombra, con «en casa»', a1.p[0] === 'Toque cualquiera de esos grupos para ver sus ejercicios, con filtros por gimnasio, en casa, fuera o calistenia y por nivel.', a1.p[0]);
    prueba('30: sus tres fuentes, con la de las 48 horas (Garber et al., ACSM 2011)', a1.fuentes.length === 3 && /Garber/.test(a1.fuentes[2]), JSON.stringify(a1.fuentes));

    await poner(G30.map(g => [3, g, 3]).concat([[1, 'pecho', 3]]));
    const a2 = await preguntar();
    const esp2 = sin(G30, ['pecho']);
    prueba('30: la segunda vez de la semana, con la OMS y las 48 horas', a2.t === 'Ya ha trabajado los 12 grupos en los últimos 7 días. Para la segunda vez de la semana le tocan: ' + lis(esp2) + '.' &&
      a2.p[0] === OMS && a2.p[1] === D48 + ' Los que trabajó ayer u hoy no salen.' && JSON.stringify(a2.grupos) === JSON.stringify(esp2) && a2.plan.join() === 'segunda', JSON.stringify(a2).slice(0, 500));

    await poner(G30.map(g => [1, g, 3]));
    const a3 = await preguntar();
    prueba('30: lo que queda, trabajado ayer u hoy: descanso, sin botones de grupo', a3.t === 'Lo que le queda lo trabajó ayer u hoy: ' + lis(G30) + '. Hoy puede descansar o moverse suave.' &&
      a3.p[0] === D48 && a3.grupos.length === 0, JSON.stringify(a3).slice(0, 400));

    await poner(G30.map(g => [5, g, 3]).concat(G30.map(g => [3, g, 3])));
    const a4 = await preguntar();
    prueba('30: los 12 con dos días o más: la respuesta de siempre, «Ha trabajado los 12 grupos…»', /^Ha trabajado los 12 grupos en los últimos 7 días/.test(a4.t) && a4.grupos.length === 0, JSON.stringify(a4).slice(0, 300));

    // el primer día: los seis grupos del texto, como botones, con el nivel inicial al abrirlos; y el sitio de hoy
    await poner([], { sitio: 'fuera' });
    const a5 = await preguntar();
    prueba('30: sin nada anotado, los seis grupos del primer día como botones', JSON.stringify(a5.grupos) === JSON.stringify(['pecho', 'dorsal', 'hombros', 'core', 'cuadriceps', 'isquios']) && a5.plan.join() === 'nada', JSON.stringify(a5).slice(0, 300));
    await p30.click('#tgc-charla .tgc-resp:last-child .tgc-resp-links button[data-g="core"]');
    await p30.waitForSelector('.tgc-ej-fila', { timeout: 8000 }); await p30.waitForTimeout(150);
    const h5 = await p30.evaluate(() => ({ tit: document.getElementById('tgc-hoja-tit').textContent, niv: document.querySelector('#tgc-ej-niv [aria-pressed="true"]').dataset.v,
      ent: document.querySelector('#tgc-ej-ent [aria-pressed="true"]').dataset.v, modo: document.getElementById('tgc-modo-m').getAttribute('aria-pressed') }));
    prueba('30: «Ver Abdomen…» abre su hoja en «Músculos», «Fuera» (el sitio de hoy) y el nivel inicial', h5.tit === N30.core && h5.niv === '1' && h5.ent === 'fuera' && h5.modo === 'true', JSON.stringify(h5));
    await p30.keyboard.press('Escape'); await p30.waitForTimeout(250);

    // diez idiomas: la respuesta en su idioma, sin marcas sueltas, y los botones «Ver …» traducidos
    await poner([[0, 'pecho', 3]]);
    const aEs = await preguntar();
    for (const l of ['en', 'fr', 'de', 'it', 'nl', 'zh', 'zht', 'bg', 'pl']) {
      await idioma(p30, l);
      const a = await preguntar();
      prueba('30, ' + l + ': la respuesta y sus botones en su idioma', a.t && a.t.indexOf('{') < 0 && a.t !== aEs.t && a.p.every(x => x.indexOf('{') < 0) && a.grupos.length === 11 &&
        a.botones.every(x => x && x.indexOf('Ver ') !== 0 && x.indexOf('{') < 0) && a.fuentes.length === 3, JSON.stringify(a).slice(0, 300));
    }
    await idioma(p30, 'es');
    prueba('30: sin errores de página', e30.length === 0, e30.join(' | '));
    await c30.close();
  }

  // 31. (12-11-2026, #120) «Su fuerza», en «Evolución»: cada ejercicio anotado con repeticiones o peso, el más reciente
  //     primero, con cuántas veces, la última, la mejor marca (el peso más alto; sin peso, las más repeticiones) y la
  //     primera, y su línea pequeña; lo anotado sin repeticiones ni peso no sale; sin nada, la ayuda; diez idiomas
  {
    const ymd = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    const hace = n => { const d = new Date(); d.setDate(d.getDate() - n); return ymd(d); };
    const c31 = await contexto(b), p31 = await c31.newPage(), e31 = []; vigilar(p31, e31);
    await abrirApp(p31); await abrirPerfilCuerpo(p31); await suCuerpo(p31);
    /* [hace cuántos días, ejercicio, grupo, series, repeticiones, kg] */
    const F = [[20, 'press-banca-barra', 'pecho', 3, 10, 40], [10, 'press-banca-barra', 'pecho', 3, 8, 45], [3, 'press-banca-barra', 'pecho', 3, 10, 45],
      [1, 'press-banca-barra', 'pecho', 4, 6, 50], [5, 'dominadas', 'dorsal', 3, 6, 0], [2, 'dominadas', 'dorsal', 3, 8, 0], [4, 'curl-mancuernas', 'biceps', 3, 0, 0]];
    const leer31 = () => p31.evaluate(() => ({
      tit: document.getElementById('tgc-fuerza-tit').textContent, ayuda: document.getElementById('tgc-fuerza-ayuda').hidden ? null : document.getElementById('tgc-fuerza-ayuda').textContent,
      lista: !document.getElementById('tgc-fuerza-lista').hidden,
      ej: [...document.querySelectorAll('#tgc-fuerza-lista .tgc-fuerza-ej')].map(li => ({ nom: li.querySelector('.tgc-fuerza-nom').textContent, veces: li.querySelector('.tgc-fuerza-veces').textContent,
        datos: [...li.querySelectorAll('.tgc-fuerza-datos li')].map(x => x.textContent), mejor: (li.querySelector('.tgc-fuerza-datos .mejor') || {}).textContent,
        puntos: (li.querySelector('.tgc-fuerza-linea polyline') || { getAttribute: () => '' }).getAttribute('points').split(' ').filter(Boolean).length,
        bolita: !!li.querySelector('.tgc-fuerza-linea circle') })),
      visible: !!document.getElementById('tgc-fuerza').getClientRects().length }));
    // sin nada con repeticiones ni peso: la ayuda
    await p31.evaluate(() => { localStorage.setItem('tenerife.cuerpo', JSON.stringify({ v: 1, series: [] })); TG_CUERPO.abrir(); });
    await p31.click('#tgc-modo-e'); await p31.waitForTimeout(300);
    const v0 = await leer31();
    prueba('31: «Su fuerza» en «Evolución»; sin nada anotado con repeticiones o peso, la ayuda', v0.visible && v0.tit === 'Su fuerza' && !v0.lista && v0.ej.length === 0 &&
      v0.ayuda === 'Cuando anote un ejercicio con sus repeticiones o su peso, aquí verá cómo progresa: la primera vez, la última y la mejor.', JSON.stringify(v0));
    await p31.click('#tgc-modo-m'); await p31.waitForTimeout(200);
    await p31.evaluate(f => {
      const ymd = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      const hace = n => { const d = new Date(); d.setDate(d.getDate() - n); return ymd(d); };
      const T0 = Date.now() - 5e6;
      const series = f.map((x, i) => { const s = { d: hace(x[0]), g: x[2], n: x[3], t: T0 + i * 100, e: x[1] }; if (x[4]) s.r = x[4]; if (x[5]) s.kg = x[5]; return s; });
      localStorage.setItem('tenerife.cuerpo', JSON.stringify({ v: 1, series })); TG_CUERPO.abrir();
    }, F);
    await p31.click('#tgc-modo-e');
    await p31.waitForFunction(() => document.querySelectorAll('#tgc-fuerza-lista .tgc-fuerza-ej').length === 2 && !/^[a-z0-9-]+$/.test(document.querySelector('#tgc-fuerza-lista .tgc-fuerza-nom').textContent), null, { timeout: 8000 }).catch(() => {});
    const nombres31 = await p31.evaluate(async () => { const d = await (await fetch('datos/cuerpo/ejercicios-es.json')).json(); return { press: d['press-banca-barra'][0], dom: d['dominadas'][0] }; });
    const v1 = await leer31();
    const [pr, dm] = v1.ej;
    prueba('31: dos ejercicios, el más reciente primero (el curl, sin repeticiones ni peso, no sale)', v1.ej.length === 2 && pr.nom === nombres31.press && dm.nom === nombres31.dom && !v1.ayuda, JSON.stringify(v1).slice(0, 300));
    prueba('31: press de banca: 4 veces; la última y la mejor, 4 × 6 con 50 kg; la primera, 3 × 10 con 40 kg', pr.veces === '4 veces' &&
      /^Última vez: 4 × 6 con 50 kg \(.+\)$/.test(pr.datos[0]) && /^Mejor marca: 4 × 6 con 50 kg \(.+\)$/.test(pr.datos[1]) && /^Primera vez: 3 × 10 con 40 kg \(.+\)$/.test(pr.datos[2]) &&
      pr.mejor === pr.datos[1], JSON.stringify(pr));
    prueba('31: dominadas, sin peso: la mejor marca, la de más repeticiones (3 × 8)', dm.veces === '2 veces' && /^Última vez: 3 × 8 \(.+\)$/.test(dm.datos[0]) &&
      /^Mejor marca: 3 × 8 \(.+\)$/.test(dm.datos[1]) && /^Primera vez: 3 × 6 \(.+\)$/.test(dm.datos[2]), JSON.stringify(dm));
    prueba('31: la línea pequeña: 4 pesos del press y 2 repeticiones de las dominadas, con el último punto marcado', pr.puntos === 4 && dm.puntos === 2 && pr.bolita && dm.bolita, JSON.stringify([pr.puntos, dm.puntos]));
    // a igual peso, la de más repeticiones es la mejor
    await p31.click('#tgc-modo-m'); await p31.waitForTimeout(200);
    await p31.evaluate(() => {
      const ymd = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      const hace = n => { const d = new Date(); d.setDate(d.getDate() - n); return ymd(d); };
      const T0 = Date.now() - 5e6;
      localStorage.setItem('tenerife.cuerpo', JSON.stringify({ v: 1, series: [{ d: hace(6), g: 'cuadriceps', n: 3, t: T0, e: 'sentadilla-trasera-barra', r: 12, kg: 60 },
        { d: hace(2), g: 'cuadriceps', n: 3, t: T0 + 100, e: 'sentadilla-trasera-barra', r: 8, kg: 60 }] })); TG_CUERPO.abrir();
    });
    await p31.click('#tgc-modo-e'); await p31.waitForTimeout(400);
    const v2 = await leer31();
    prueba('31: a igual peso, la mejor marca es la de más repeticiones (3 × 12 con 60 kg, no la última)', v2.ej.length === 1 && /^Mejor marca: 3 × 12 con 60 kg \(.+\)$/.test(v2.ej[0].datos[1]) &&
      /^Última vez: 3 × 8 con 60 kg/.test(v2.ej[0].datos[0]), JSON.stringify(v2.ej));
    // diez idiomas
    const TIT = { en: 'Your strength', fr: 'Votre force', de: 'Ihre Kraft', it: 'Forza', nl: 'Uw kracht', zh: '我的力量', zht: '我的力量', bg: 'Вашата сила', pl: 'Siła' };
    for (const [l, t] of Object.entries(TIT)) {
      await idioma(p31, l);
      const m = await leer31();
      prueba('31, ' + l + ': «' + t + '», con sus fechas y cifras en su idioma', m.tit === t && m.ej.length === 1 && m.ej[0].datos.every(x => x && x.indexOf('{') < 0) &&
        m.ej[0].datos[1] !== v2.ej[0].datos[1] && m.ej[0].veces.indexOf('{') < 0, JSON.stringify(m.ej).slice(0, 300));
    }
    await idioma(p31, 'es');
    prueba('31: sin errores de página', e31.length === 0, e31.join(' | '));
    await c31.close();
  }

  // 32. (12-11-2026, #120) la política de privacidad dice lo que «Su cuerpo» guarda de nuevo, en los diez idiomas: las
  //     repeticiones y el peso, y el sitio donde entrena con el material de casa, citando el botón «¿Qué entreno hoy?»
  //     tal cual (cuerpoPlanBtn); y la app lleva ese mismo texto (index.html, que escribe tools/generar_privacidad.py)
  {
    const fs = require('fs'), path = require('path');
    const s = fs.readFileSync(path.join(__dirname, '..', 'modulos', 'cuerpo.js'), 'utf8');
    const UI = {}; { const i = s.indexOf('var CUERPO_UI = {'), j = s.indexOf('\n  };', i);
      for (const l of s.slice(i, j).split('\n')) { const m = l.match(/^\s*"(cuerpo[A-Za-z0-9_]+)": (\{.*\}),?$/); if (m) UI[m[1]] = JSON.parse(m[2]); } }
    const CARGA = { es: 'si los escribe, las repeticiones y el peso', en: 'if you enter them, the reps and the weight', fr: 'si vous les indiquez, les répétitions et le poids',
      de: 'wenn Sie sie angeben, die Wiederholungen und das Gewicht', it: 'se li scrive, le ripetizioni e il peso', nl: 'als u die invult, de herhalingen en het gewicht',
      zh: '您填写的次数与重量', zht: '您填寫的次數與重量', bg: 'повторенията и тежестта, ако ги въведете', pl: 'powtórzenia i ciężar, jeśli zostaną podane' };
    const SITIO = { es: 'el sitio donde entrena y el material que marque para casa', en: 'the place where you train and the equipment you tick for home',
      fr: 'le lieu où vous vous entraînez et le matériel coché pour la maison', de: 'den Ort, an dem Sie trainieren, und die Geräte, die Sie für zu Hause markieren',
      it: 'il luogo dove si allena e gli attrezzi segnati per casa', nl: 'de plek waar u traint en het materiaal dat u voor thuis aanvinkt',
      zh: '选择的训练地点和在家可用的器材', zht: '選擇的訓練地點和在家可用的器材', bg: 'мястото, където тренирате, и уредите, които отбележите за вкъщи',
      pl: 'miejsce treningu i sprzęt zaznaczony jako dostępny w domu' };
    const idx = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
    const mal32 = [];
    for (const l of Object.keys(CARGA)) {
      const t = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'idiomas', 'privacidad', l + '.json'), 'utf8')).ppDatosCuerpoTxt;
      const bt = UI.cuerpoPlanBtn[l], cita = /^zh/.test(l) ? '「' + bt + '」' : '«' + bt + '»';
      if (!t.includes(CARGA[l])) mal32.push(l + ': las repeticiones y el peso');
      if (!t.includes(SITIO[l])) mal32.push(l + ': el sitio y el material');
      if (!t.includes(cita)) mal32.push(l + ': ' + cita);
      if (!idx.includes(JSON.stringify(t).slice(1, -1))) mal32.push(l + ': index.html no lleva el texto de idiomas/privacidad');
    }
    prueba('32: la política de privacidad dice, en los diez idiomas, las repeticiones y el peso, el sitio y el material de casa, y cita «¿Qué entreno hoy?» tal cual; la app lleva ese texto',
      Object.keys(CARGA).length === 10 && !mal32.length, mal32.join(' · '));
  }

  // 33. (12-11-2026) «Preguntar»: lo que dice cada fuente, entre comillas una sola vez. 163 citas de cada idioma ya traían
  //     las suyas («…» […] «…») y salían dobles («« … »»); las que no las traen, entre comillas, como antes
  {
    const c33 = await contexto(b), p33 = await c33.newPage(), e33 = []; vigilar(p33, e33);
    await abrirApp(p33); await abrirPerfilCuerpo(p33); await suCuerpo(p33);
    await p33.click('#tgc-modo-p');
    await p33.waitForFunction(() => document.querySelector('#tgc-sugeridas .tgc-chip-preg[data-id="que-entreno-hoy"]'), null, { timeout: 10000 });
    await p33.click('#tgc-sugeridas .tgc-chip-preg[data-id="que-entreno-hoy"]');
    await p33.waitForFunction(() => document.querySelectorAll('#tgc-charla .tgc-resp').length >= 1, null, { timeout: 8000 });
    await p33.waitForTimeout(150);
    const q33 = await p33.evaluate(() => [...document.querySelectorAll('#tgc-charla .tgc-resp-leido')].map(p => p.lastChild.textContent));
    const d33 = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, '..', 'datos', 'cuerpo', 'asistente-es.json'), 'utf8')).respuestas.find(r => r.id === 'que-entreno-hoy').f.map(f => f.leido);
    prueba('33: «Preguntar»: lo que dice cada fuente, entre comillas una sola vez (las 3 de «¿Qué entreno hoy?»: 1 sin comillas en los datos y 2 que ya las traen)',
      q33.length === 3 && d33.filter(t => /^«/.test(t)).length === 2 && q33.every(t => /^«/.test(t) && /»$/.test(t) && !/««|»»/.test(t)) &&
      q33.every((t, i) => t === (/^«/.test(d33[i]) ? d33[i] : '«' + d33[i] + '»')), JSON.stringify(q33.map(t => t.slice(0, 30) + '…' + t.slice(-10))));
    prueba('33: sin errores de página', e33.length === 0, e33.join(' | '));
    await c33.close();
  }

  // 34. (12-11-2026, nota 34; Jérôme: «2 si cámbialo») «progresar» da la regla del ACSM de 2009, leída en su PDF: subir
  //     el peso un 2–10 % cuando, con el mismo peso, salen 1 o 2 repeticiones más de las marcadas en dos sesiones
  //     seguidas (menos en los músculos pequeños y más en los grandes); su fuente, la primera, con lo leído; certeza
  //     moderada (una postura de consenso); y ya no dice que no hay regla; en los diez idiomas
  {
    const fs = require('fs'), path = require('path');
    const REGLA = { es: ['El ACSM (2009) da una regla', '1 o 2 repeticiones más', 'dos sesiones seguidas', 'entre un 2 y un 10 %'],
      en: ['The ACSM (2009) gives a rule', '1 or 2 more repetitions', 'two sessions in a row', 'by 2 to 10%'],
      fr: ['L’ACSM (2009) donne une règle', '1 ou 2 répétitions de plus', 'deux séances de suite', 'de 2 à 10 %'],
      de: ['Das ACSM (2009) nennt eine Regel', '1 oder 2 Wiederholungen mehr', 'zwei Einheiten hintereinander', 'um 2 bis 10 %'],
      it: ['L’ACSM (2009) dà una regola', '1 o 2 ripetizioni in più', 'due sedute di fila', 'dal 2 al 10 %'],
      nl: ['Het ACSM (2009) geeft een regel', '1 of 2 herhalingen meer', 'twee sessies achter elkaar', 'met 2 tot 10 %'],
      zh: ['ACSM（2009）给出了一条规则', '多做 1 到 2 次', '连续两次训练', '增加 2% 到 10%'],
      zht: ['ACSM（2009）給出了一條規則', '多做 1 到 2 次', '連續兩次訓練', '增加 2% 到 10%'],
      bg: ['ACSM (2009) дава правило', '1 или 2 повторения повече', 'две поредни тренировки', 'с 2 до 10 %'],
      pl: ['ACSM (2009) podaje regułę', '1 lub 2 powtórzenia więcej', 'dwa kolejne treningi', 'o 2–10%'] };
    const VIEJO = /no dan una regla|do not give a rule|pas de règle chiffrée|keine Regel mit Zahlen|non danno una regola|geen regel met cijfers|没有给出带数字的规则|沒有給出具體數字的規則|не дават правило|nie podają reguły/;
    const mal34 = [];
    for (const [l, trozos] of Object.entries(REGLA)) {
      const r = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'datos', 'cuerpo', 'asistente-' + l + '.json'), 'utf8')).respuestas.find(x => x.id === 'progresar');
      if (!r) { mal34.push(l + ': sin «progresar»'); continue; }
      for (const t of trozos) if (!r.r.t.includes(t)) mal34.push(l + ': falta «' + t + '»');
      if (VIEJO.test(r.r.t)) mal34.push(l + ': sigue diciendo que no hay regla');
      if (r.f.length !== 3 || r.f[0].url !== 'https://sfu.ca/~ryand/kin343/ACSMresistance.pdf' || !r.f[0].leido.includes('2–10% increase in load be applied') ||
          !r.f[0].leido.includes('lower percent for small muscle mass exercises') || !/2009/.test(r.f[0].titulo)) mal34.push(l + ': la fuente del ACSM de 2009');
      if (r.cert !== 'moderada') mal34.push(l + ': certeza ' + r.cert);
      if (r.r.p.length !== 4) mal34.push(l + ': ' + r.r.p.length + ' puntos');
    }
    prueba('34: «progresar» da la regla del ACSM de 2009 (2–10 %, 1 o 2 repeticiones más, dos sesiones seguidas), con su fuente la primera y lo leído, en los diez idiomas',
      Object.keys(REGLA).length === 10 && !mal34.length, mal34.join(' · '));
  }

  // 35. (12-11-2026, nota 34; Jérôme: «3 si», «4 si», «Si todo en verde sube») las rutinas en «¿Qué entreno hoy?»: el
  //     nivel (después del sitio, guardado; «A tope» solo a mayores de edad, con la nota de la edad), la sesión de hoy (la
  //     A el primer día; la misma si hoy ya hizo algo de ella; la siguiente si no), lo que descansa (48 horas) y el día de
  //     descanso, cada pauta con sus cifras, la frase de esfuerzo y las fuentes con lo leído; en casa, lo que se puede con
  //     lo marcado y los sustitutos; fuera, sin banda, a calistenia; una fila abre su ficha; diez idiomas; y lo guardado
  //     que no vale, fuera
  {
    const fs = require('fs'), path = require('path');
    const DAT = n => JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'datos', 'cuerpo', n), 'utf8'));
    const RU = DAT('rutinas.json'), NOM = DAT('ejercicios-es.json');
    const s35 = fs.readFileSync(path.join(__dirname, '..', 'modulos', 'cuerpo.js'), 'utf8');
    const UI = {}; { const i = s35.indexOf('var CUERPO_UI = {'), j = s35.indexOf('\n  };', i);
      for (const l of s35.slice(i, j).split('\n')) { const m = l.match(/^\s*"(cuerpo[A-Za-z0-9_]+)": (\{.*\}),?$/); if (m) UI[m[1]] = JSON.parse(m[2]); } }
    const ymd = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    const hace = n => { const d = new Date(); d.setDate(d.getDate() - n); return ymd(d); };
    const ANIO = new Date().getFullYear();
    const S = id => RU.s.find(s => s.id === id);
    const rg = v => v[0] === v[1] ? String(v[0]) : v[0] + '–' + v[1];
    /* la pauta como debe leerse en castellano: «2–3 × 8–12 · Descanso: 1–2 min», «2–3 × 10–30 s», «3 × 5 × 20–30 s» */
    const pautaEs = k => { const q = RU.p[k]; let o = q.r ? rg(q.s) + ' × ' + rg(q.r) + (q.t ? ' × ' + rg(q.t) + ' s' : '') : rg(q.s) + ' × ' + rg(q.t) + ' s';
      if (q.d) o += ' · Descanso: ' + (q.d[0] % 60 === 0 && q.d[1] % 60 === 0 ? rg([q.d[0] / 60, q.d[1] / 60]) + ' min' : rg(q.d) + ' s'); return o; };
    const c35 = await contexto(b), p35 = await c35.newPage(), e35 = []; vigilar(p35, e35);
    await abrirApp(p35); await abrirPerfilCuerpo(p35); await suCuerpo(p35);
    /* lo anotado: [hace cuántos días, ejercicio], una fila por grupo principal (como anota la ficha); el año de nacimiento, en el perfil */
    const poner = (ejs, extra, nac) => p35.evaluate(([f, ex, na]) => {
      const T0 = Date.now() - 5e6;
      localStorage.setItem('tenerife.cuerpo', JSON.stringify(Object.assign({ v: 1, series: f.map((x, i) => ({ d: x[0], g: x[1], n: 3, t: T0 + i, e: x[2] })) }, ex || {})));
      const pf = JSON.parse(localStorage.getItem('tenerife.perfil') || '{}'); if (na) pf.nacimiento = na; else delete pf.nacimiento;
      localStorage.setItem('tenerife.perfil', JSON.stringify(pf));
      TG_CUERPO.abrir();
    }, [ejs.flatMap(([n, id]) => RU.x[id][0].map(g => [hace(n), g, id])), extra || null, nac || null]).then(() => p35.waitForTimeout(250));
    const leer = () => p35.evaluate(() => {
      const $ = id => document.getElementById(id), vis = id => !$(id).hidden;
      return {
        abierto: vis('tgc-plan-cuerpo'), res: $('tgc-plan-resumen').textContent,
        nivelVis: vis('tgc-plan-nivel-f'), nivelTit: $('tgc-plan-nivel-tit').textContent,
        niveles: [...document.querySelectorAll('#tgc-plan-niveles button')].map(b => b.dataset.nivel + ':' + b.textContent + ':' + b.getAttribute('aria-pressed')),
        edad: vis('tgc-plan-edad') ? $('tgc-plan-edad').textContent : null,
        ses: vis('tgc-ses'), sesTit: $('tgc-ses-tit').textContent, sesNom: $('tgc-ses-nom').textContent,
        esf: vis('tgc-ses-esf') ? $('tgc-ses-esf').textContent : null,
        sust: vis('tgc-ses-sust') ? [...$('tgc-ses-sust-txt').children].filter(x => x.tagName === 'P').map(x => x.textContent) : null,
        sustTit: $('tgc-ses-sust-tit').textContent,
        banda: vis('tgc-ses-banda') ? $('tgc-ses-banda').textContent : null, calentar: $('tgc-ses-calentar').textContent,
        ejs: [...document.querySelectorAll('#tgc-ses-lista > li')].map(li => ({ id: li.querySelector('.tgc-ses-ej-btn').dataset.id,
          nom: li.querySelector('.tgc-ses-ej-nom').textContent, pauta: li.querySelector('.tgc-ses-ej-pauta').textContent,
          esf: (li.querySelector('.tgc-ses-ej-esf') || {}).textContent || null, no: (li.querySelector('.tgc-ses-no') || {}).textContent || null,
          alt: (li.querySelector('.tgc-ses-alt summary') || {}).textContent || null, alts: [...li.querySelectorAll('.tgc-ses-alts button')].map(x => x.dataset.id + ':' + x.textContent) })),
        fsum: (document.querySelector('#tgc-ses-f .tgc-resp-f summary') || {}).textContent || null,
        fuentes: [...document.querySelectorAll('#tgc-ses-f .tgc-resp-f li')].map(li => ({ c: li.querySelector('a').textContent, u: li.querySelector('a').getAttribute('href'),
          rel: li.querySelector('a').rel, tg: li.querySelector('a').target, l: li.querySelector('.tgc-resp-leido').lastChild.textContent })),
        tit: vis('tgc-plan-tit') ? $('tgc-plan-tit').textContent : null, txt: vis('tgc-plan-txt') ? $('tgc-plan-txt').textContent : null,
        lista: vis('tgc-plan-lista'), desc: vis('tgc-plan-descansan') ? $('tgc-plan-descansan').textContent : null,
        sitios: [...document.querySelectorAll('#tgc-plan-sitios button')].filter(x => x.getAttribute('aria-pressed') === 'true').map(x => x.dataset.sitio) };
    });
    const abrirPlan = async () => { if (!(await leer()).abierto) { await p35.click('#tgc-plan-btn'); await p35.waitForTimeout(250); } };
    const esperarSes = () => p35.waitForFunction(() => !document.getElementById('tgc-ses').hidden && document.querySelectorAll('#tgc-ses-lista > li').length > 0, null, { timeout: 10000 }).catch(() => {});
    const ESF = RU.p['n1-general'].x.es, TOPE = RU.p['tope-musculo'].x.es;
    const fuentesDe = id => { const ks = []; S(id).e.forEach(z => RU.p[z[1]].f.forEach(k => { if (ks.indexOf(k) < 0) ks.push(k); })); return ks; };

    // sin sitio, no se pregunta el nivel; con el sitio, los cuatro niveles (sin año de nacimiento, también «A tope») y el plan por grupos
    await poner([], { sitio: '' }); await abrirPlan();
    const a0 = await leer();
    prueba('35: sin sitio elegido no se pregunta el nivel, y no hay sesión', !a0.nivelVis && !a0.ses && a0.edad === null, JSON.stringify(a0).slice(0, 300));
    await poner([], { sitio: 'gimnasio' }); await abrirPlan();
    const a1 = await leer();
    prueba('35: con el sitio, «¿A qué nivel entrena?» con Inicial, Intermedio, Avanzado y «A tope», ninguno elegido; sin nivel, el plan por grupos de siempre',
      a1.nivelVis && a1.nivelTit === '¿A qué nivel entrena?' && JSON.stringify(a1.niveles) === JSON.stringify(['1:Inicial:false', '2:Intermedio:false', '3:Avanzado:false', '4:A tope:false']) &&
      !a1.ses && a1.tit === 'Hoy le tocan' && a1.lista && a1.edad === null, JSON.stringify(a1).slice(0, 400));

    // el nivel se guarda al tocarlo; el primer día, la sesión A, con cada ejercicio, su pauta, la frase de esfuerzo y las fuentes
    await p35.click('#tgc-plan-niveles [data-nivel="1"]'); await esperarSes();
    const a2 = await leer(), g1a = S('gimnasio-1-a'), st2 = await p35.evaluate(() => TG_CUERPO.estado().nivel);
    const fk = fuentesDe('gimnasio-1-a');
    prueba('35: «Inicial» se guarda (nivel 1) y sale «Su sesión de hoy», «Sesión A · Inicial»; arriba, cerrado, «Para hoy: Sesión A · Inicial.»; sin el plan por grupos',
      st2 === 1 && a2.ses && a2.sesTit === 'Su sesión de hoy' && a2.sesNom === 'Sesión A · Inicial' && a2.res === 'Para hoy: Sesión A · Inicial.' &&
      a2.tit === null && a2.txt === null && !a2.lista && a2.desc === null && a2.niveles[0] === '1:Inicial:true', JSON.stringify(a2).slice(0, 400));
    prueba('35: los ' + g1a.e.length + ' ejercicios de la sesión A del gimnasio, en su orden, con su nombre y su pauta («' + pautaEs('n1-general') + '»), sin «Hoy no»',
      a2.ejs.length === g1a.e.length && a2.ejs.every((e, i) => e.id === g1a.e[i][0] && e.nom === NOM[e.id][0] && e.pauta === pautaEs(g1a.e[i][1]) && !e.no),
      JSON.stringify(a2.ejs.map(e => e.id + ' ' + e.pauta)).slice(0, 400));
    prueba('35: la frase de esfuerzo, una vez arriba («' + ESF.slice(0, 40) + '…»); las alternativas de cada uno, con su nombre; «Antes de empezar: cómo calentar»; ni sustitutos ni banda',
      a2.esf === ESF && a2.ejs.every(e => !e.esf) && a2.ejs.every((e, i) => JSON.stringify(e.alts) === JSON.stringify(g1a.e[i][2].map(x => x + ':' + NOM[x][0])) && (e.alts.length ? e.alt === 'Alternativas' : e.alt === null)) &&
      a2.calentar === 'Antes de empezar: cómo calentar' && a2.sust === null && a2.banda === null, JSON.stringify([a2.esf, a2.ejs[0]]).slice(0, 300));
    prueba('35: las ' + fk.length + ' fuentes de sus cifras, con su nombre corto, su enlace (pestaña nueva, noopener) y lo leído entre comillas',
      a2.fsum === fk.length + ' fuentes' && a2.fuentes.length === fk.length && a2.fuentes.every((f, i) => f.c === RU.f[fk[i]].c && f.u === RU.f[fk[i]].u && /^https:\/\//.test(f.u) &&
        f.tg === '_blank' && /noopener/.test(f.rel) && f.l === RU.f[fk[i]].l && /^«/.test(f.l) && /»$/.test(f.l)), JSON.stringify(a2.fuentes.map(f => f.c)));

    // hoy ya hizo algo de la A: sigue la A, sin «Hoy no»; la A ayer (un ejercicio): la B, con «Hoy no» solo en lo de esos grupos
    await poner([[0, 'prensa-piernas']], { sitio: 'gimnasio', nivel: 1 }); await esperarSes();
    const a3 = await leer();
    prueba('35: con algo de la sesión A anotado hoy, la sesión de hoy sigue siendo la A, sin «Hoy no» en nada', a3.sesNom === 'Sesión A · Inicial' && a3.ejs.every(e => !e.no), a3.sesNom);
    await poner([[1, 'prensa-piernas']], { sitio: 'gimnasio', nivel: 1 }); await esperarSes();
    const a4 = await leer(), g1b = S('gimnasio-1-b'), ayerG = RU.x['prensa-piernas'][0];
    const noEsperado = g1b.e.filter(z => RU.x[z[0]][0].some(g => ayerG.indexOf(g) >= 0)).map(z => z[0]);
    prueba('35: con la A ayer, la B; «Hoy no: este grupo se trabajó ayer u hoy (48 horas).» solo en lo de cuádriceps y glúteos (' + noEsperado.join(', ') + ')',
      a4.sesNom === 'Sesión B · Inicial' && a4.ejs.length === g1b.e.length && noEsperado.length > 0 &&
      JSON.stringify(a4.ejs.filter(e => e.no).map(e => e.id)) === JSON.stringify(noEsperado) && a4.ejs.filter(e => e.no).every(e => e.no === 'Hoy no: este grupo se trabajó ayer u hoy (48 horas).'),
      JSON.stringify(a4.ejs.map(e => e.id + (e.no ? ' NO' : ''))).slice(0, 400));
    // la A entera ayer: todo lo de la B descansa: «Hoy, descanso»; la A entera hace dos días: la B, sin «Hoy no»
    await poner(g1a.e.map(z => [1, z[0]]), { sitio: 'gimnasio', nivel: 1 }); await p35.waitForTimeout(300);
    const a5 = await leer();
    prueba('35: con la A entera ayer, todo lo de la B descansa: «Hoy, descanso», sin sesión; cerrado, «Hoy, descanso o actividad suave.»',
      !a5.ses && a5.tit === 'Hoy, descanso' && a5.txt === 'Lo que le queda lo trabajó ayer u hoy. Descansar no es estar quieto: caminar o moverse suave en los días libres también suma para la salud.' &&
      a5.res === 'Hoy, descanso o actividad suave.' && !a5.lista && /^Descansan hoy/.test(a5.desc || ''), JSON.stringify(a5).slice(0, 400));
    await poner(g1a.e.map(z => [2, z[0]]), { sitio: 'gimnasio', nivel: 1 }); await esperarSes();
    const a6 = await leer();
    prueba('35: con la A entera hace dos días, la B y nada descansa', a6.sesNom === 'Sesión B · Inicial' && a6.ejs.every(e => !e.no), a6.sesNom);
    // seis días seguidos con fuerza anotada (uno de cada sesión de «A tope», de lunes a sábado): el séptimo, descanso total
    // (el consenso ECSS/ACSM, 2013); con algo anotado hoy, la sesión de hoy
    const top = ['gimnasio-3-tope-k', 'gimnasio-3-tope-j', 'gimnasio-3-tope-i', 'gimnasio-3-tope-h', 'gimnasio-3-tope-g', 'gimnasio-3-tope-f'].map(S);
    await poner(top.map((s, i) => [i + 1, s.e[0][0]]), { sitio: 'gimnasio', nivel: 4 }); await p35.waitForTimeout(300);
    const a6b = await leer(), SEMANA = 'Lleva 6 días seguidos entrenando: hoy, descanso total. El consenso sobre sobreentrenamiento (ECSS/ACSM, 2013) aconseja a los deportistas al menos un día de descanso total a la semana.';
    prueba('35: con fuerza anotada los 6 días anteriores, «Hoy, descanso» y «' + SEMANA.slice(0, 45) + '…»; cerrado, «Hoy, descanso o actividad suave.»',
      !a6b.ses && a6b.tit === 'Hoy, descanso' && a6b.txt === SEMANA && a6b.res === 'Hoy, descanso o actividad suave.', JSON.stringify([a6b.ses, a6b.tit, a6b.txt, a6b.res]));
    await poner(top.map((s, i) => [i + 1, s.e[0][0]]).concat([[0, top[0].e[0][0]]]), { sitio: 'gimnasio', nivel: 4 }); await esperarSes();
    const a6c = await leer();
    prueba('35: con algo de la sesión anotado también hoy, la sesión de hoy (la K, la última hecha)', a6c.ses && a6c.sesNom === 'Sesión K · A tope', a6c.sesNom);
    await poner(top.slice(1).map((s, i) => [i + 2, s.e[0][0]]), { sitio: 'gimnasio', nivel: 4 }); await esperarSes();
    const a6d = await leer();
    prueba('35: con 5 de los 6 días anteriores (ayer sin nada), hay sesión', a6d.ses && !a6d.txt, JSON.stringify([a6d.ses, a6d.sesNom, a6d.txt]));

    // en casa: lo que se puede con lo marcado (o la alternativa que sí), los sustitutos y las pautas de segundos
    const c1a = S('casa-1-a'), puede = (id, mat) => RU.x[id][1].every(m => m === 'ninguno' || m === 'pared' || mat.indexOf(m) >= 0);
    const enCasa = mat => c1a.e.map(z => { const t = [z[0]].concat(z[2]), v = t.filter(id => puede(id, mat)); return (v.length ? v : t)[0]; });
    await poner([], { sitio: 'casa', material: [], nivel: 1 }); await esperarSes();
    const a7 = await leer(), MS = ['mancuernas', 'disco', 'banco', 'general'];
    prueba('35: en casa sin nada marcado, cada ejercicio el de la sesión o su primera alternativa sin material (' + enCasa([]).filter((id, i) => id !== c1a.e[i][0]).join(', ') + ')',
      a7.sesNom === 'Sesión A · Inicial' && JSON.stringify(a7.ejs.map(e => e.id)) === JSON.stringify(enCasa([])) && enCasa([]).some((id, i) => id !== c1a.e[i][0]), JSON.stringify(a7.ejs.map(e => e.id)));
    prueba('35: en casa, «¿Sin mancuernas, disco o banco?» con los cuatro textos de los sustitutos (y sus fuentes)',
      a7.sustTit === '¿Sin mancuernas, disco o banco?' && JSON.stringify(a7.sust) === JSON.stringify(MS.map(m => RU.h[m].t.es)), JSON.stringify(a7.sust).slice(0, 300));
    const hom = a7.ejs.find(e => e.id === 'empuje-isometrico-hombro-pared'), pla = a7.ejs.find(e => e.id === 'plancha-antebrazos');
    prueba('35: las pautas de segundos: «3 × 5 × 20–30 s» (empuje isométrico, NHS) y «2–3 × 10–30 s» (plancha, Harvard)', hom && hom.pauta === '3 × 5 × 20–30 s' && pla && pla.pauta === '2–3 × 10–30 s',
      JSON.stringify([hom, pla]));
    await poner([], { sitio: 'casa', material: ['mancuernas', 'banco'], nivel: 1 }); await esperarSes();
    const a8 = await leer();
    prueba('35: en casa con mancuernas y banco marcados, los ejercicios de la sesión tal cual', JSON.stringify(a8.ejs.map(e => e.id)) === JSON.stringify(enCasa(['mancuernas', 'banco'])) &&
      JSON.stringify(enCasa(['mancuernas', 'banco'])) === JSON.stringify(c1a.e.map(z => z[0])), JSON.stringify(a8.ejs.map(e => e.id)));

    // fuera, con banda en la sesión: el botón lleva a la sesión de calistenia del mismo nivel
    await poner([], { sitio: 'fuera', nivel: 2 }); await esperarSes();
    const a9 = await leer();
    prueba('35: fuera (Intermedio), «¿Sin banda elástica? …» a la vista', a9.sesNom === 'Sesión A · Intermedio' && JSON.stringify(a9.ejs.map(e => e.id)) === JSON.stringify(S('fuera-2-a').e.map(z => z[0])) &&
      a9.banda === '¿Sin banda elástica? Haga la sesión de calistenia del mismo nivel, en un parque con barras.', JSON.stringify([a9.sesNom, a9.banda]));
    await p35.click('#tgc-ses-banda'); await esperarSes();
    const a10 = await leer(), st10 = await p35.evaluate(() => TG_CUERPO.estado().sitio);
    prueba('35: «sin banda» pasa a «Calistenia» (guardado) y enseña su sesión A de Intermedio', st10 === 'calistenia' && JSON.stringify(a10.sitios) === '["calistenia"]' &&
      a10.sesNom === 'Sesión A · Intermedio' && JSON.stringify(a10.ejs.map(e => e.id)) === JSON.stringify(S('calistenia-2-a').e.map(z => z[0])) && a10.banda === null, JSON.stringify([st10, a10.sitios, a10.sesNom]));

    // «A tope»: la sesión F, con la frase de «A tope» arriba y, en el ejercicio pesado del día, la suya
    await poner([], { sitio: 'gimnasio', nivel: 4 }); await esperarSes();
    const a11 = await leer(), g4f = S('gimnasio-3-tope-f');
    const pesado = g4f.e.filter(z => z[1] === 'n3-fuerza').map(z => z[0]);
    prueba('35: «A tope», «Sesión F · A tope», con «' + TOPE.slice(0, 30) + '…» arriba y, en el ejercicio pesado (' + pesado.join(', ') + '), «Pare cada serie…»',
      a11.sesNom === 'Sesión F · A tope' && a11.esf === TOPE && pesado.length === 1 && a11.ejs.filter(e => e.esf).map(e => e.id).join() === pesado.join() &&
      a11.ejs.find(e => e.id === pesado[0]).esf === ESF && a11.ejs.find(e => e.id === pesado[0]).pauta === pautaEs('n3-fuerza'), JSON.stringify([a11.sesNom, a11.esf, a11.ejs.map(e => e.esf)]).slice(0, 400));

    // la edad: menores, sin «A tope» y con la respuesta de la NSCA; «A tope» guardado de un menor no vale; desde 65, la nota de mayores
    await poner([], { sitio: 'gimnasio', nivel: 4 }, ANIO - 15); await p35.waitForTimeout(300);
    const a12 = await leer();
    prueba('35: con 14 o 15 años, sin «A tope»; «A tope» guardado no vale (ningún nivel elegido, sin sesión); «Tiene menos de 18 años: antes de entrenar, lea esto.»',
      JSON.stringify(a12.niveles) === JSON.stringify(['1:Inicial:false', '2:Intermedio:false', '3:Avanzado:false']) && !a12.ses && a12.edad === 'Tiene menos de 18 años: antes de entrenar, lea esto.',
      JSON.stringify([a12.niveles, a12.ses, a12.edad]));
    await p35.click('#tgc-plan-edad');
    await p35.waitForFunction(() => document.querySelectorAll('#tgc-charla .tgc-resp').length >= 1, null, { timeout: 10000 }).catch(() => {});
    const q12 = await p35.evaluate(() => ({ modo: document.getElementById('tgc-modo-p').getAttribute('aria-pressed'), charla: document.getElementById('tgc-charla').textContent }));
    prueba('35: la nota de menores abre «Preguntar» con «¿Pueden los adolescentes hacer pesas?»', q12.modo === 'true' && q12.charla.includes('¿Pueden los adolescentes hacer pesas?'), q12.charla.slice(0, 200));
    await p35.click('#tgc-modo-m'); await p35.waitForTimeout(200);
    await poner([], { sitio: 'gimnasio', nivel: 3 }, ANIO - 70); await abrirPlan(); await esperarSes();
    const a13 = await leer();
    prueba('35: con 69 o 70 años, los cuatro niveles y «Tiene 65 años o más: antes de «A tope», lea esto.»', a13.niveles.length === 4 && a13.edad === 'Tiene 65 años o más: antes de «A tope», lea esto.' && a13.ses,
      JSON.stringify([a13.niveles, a13.edad]));
    await p35.click('#tgc-plan-edad');
    await p35.waitForFunction(() => document.querySelectorAll('#tgc-charla .tgc-resp').length >= 1, null, { timeout: 10000 }).catch(() => {});
    const q13 = await p35.evaluate(() => document.getElementById('tgc-charla').textContent);
    prueba('35: la nota de mayores abre «Preguntar» con «Tengo más de 65 años: ¿qué ejercicio me conviene?»', q13.includes('Tengo más de 65 años: ¿qué ejercicio me conviene?'), q13.slice(0, 200));
    await p35.click('#tgc-modo-m'); await p35.waitForTimeout(200);

    // «Antes de empezar: cómo calentar» abre su respuesta; una fila de la sesión abre la ficha de su ejercicio
    await poner([], { sitio: 'gimnasio', nivel: 1 }); await abrirPlan(); await esperarSes();
    await p35.click('#tgc-ses-calentar');
    await p35.waitForFunction(() => document.querySelectorAll('#tgc-charla .tgc-resp').length >= 1, null, { timeout: 10000 }).catch(() => {});
    const q14 = await p35.evaluate(() => document.getElementById('tgc-charla').textContent);
    prueba('35: «Antes de empezar: cómo calentar» abre «¿Cómo caliento antes de entrenar?»', q14.includes('¿Cómo caliento antes de entrenar?'), q14.slice(0, 200));
    await p35.click('#tgc-modo-m'); await p35.waitForTimeout(200); await abrirPlan(); await esperarSes();
    await p35.click('#tgc-ses-lista > li:nth-child(3) .tgc-ses-ej-btn');
    await p35.waitForFunction(() => !document.getElementById('tgc-pag-ej').hidden, null, { timeout: 8000 }).catch(() => {});
    const f15 = await p35.evaluate(() => ({ ej: !document.getElementById('tgc-pag-ej').hidden, nom: document.getElementById('tgc-ej-nom').textContent }));
    prueba('35: tocar la tercera fila abre la ficha de «' + NOM[g1a.e[2][0]][0] + '»', f15.ej && f15.nom === NOM[g1a.e[2][0]][0], JSON.stringify(f15));
    await p35.keyboard.press('Escape'); await p35.waitForTimeout(150); await p35.keyboard.press('Escape'); await p35.waitForTimeout(250);

    // los diez idiomas: los rótulos, el nombre de la sesión, los niveles, las pautas, el esfuerzo y los nombres de los ejercicios
    await poner([], { sitio: 'gimnasio', nivel: 1 }); await abrirPlan(); await esperarSes();
    for (const l of ['en', 'fr', 'de', 'it', 'nl', 'zh', 'zht', 'bg', 'pl']) {
      await idioma(p35, l); await p35.waitForTimeout(300); await esperarSes();
      await p35.waitForFunction(n => { const x = document.querySelector('#tgc-ses-lista .tgc-ses-ej-nom'); return x && !x.textContent.includes(n); }, NOM[g1a.e[0][0]][0], { timeout: 8000 }).catch(() => {});
      const m = await leer(), NL = DAT('ejercicios-' + l + '.json');
      const nom = (UI.cuerpoRutSesion[l]).replace('{letra}', 'A').replace('{nivel}', UI.cuerpoNivel_1[l]);
      const sr = UI.cuerpoCargaSR[l].replace('{series}', '2–3').replace('{reps}', '8–12'), dsc = UI.cuerpoRutDesc[l].replace('{t}', UI.cuerpoMin[l].replace('{n}', '1–2'));
      const textos = [m.res, m.nivelTit, m.sesTit, m.sesNom, m.esf, m.calentar].concat(m.niveles, m.ejs.map(e => e.pauta), m.ejs.map(e => e.nom));
      prueba('35, ' + l + ': la sesión en su idioma («' + nom + '», «' + sr + ' · ' + dsc + '»), con los niveles, el esfuerzo y los nombres de los ejercicios',
        m.sesTit === UI.cuerpoRutHoy[l] && m.sesNom === nom && m.nivelTit === UI.cuerpoPlanNivel[l] && m.calentar === UI.cuerpoRutCalentar[l] &&
        JSON.stringify(m.niveles.map(x => x.split(':')[1])) === JSON.stringify([UI.cuerpoNivel_1[l], UI.cuerpoNivel_2[l], UI.cuerpoNivel_3[l], UI.cuerpoNivelTope[l]]) &&
        m.esf === RU.p['n1-general'].x[l] && m.ejs[0].pauta === sr + ' · ' + dsc && m.ejs.every(e => e.nom === (NL[e.id] || NOM[e.id])[0]) &&
        textos.every(t => t && t.indexOf('{') < 0), JSON.stringify([m.sesNom, m.ejs[0], m.esf]).slice(0, 300));
    }
    await idioma(p35, 'es');

    // lo guardado: el nivel, solo 1 a 4 (un número; ni texto ni otro valor)
    const v35 = [];
    for (const n of [7, 0, '2', 2.5, null, 4]) {
      await p35.evaluate(n => { localStorage.setItem('tenerife.cuerpo', JSON.stringify({ v: 1, series: [], sitio: 'gimnasio', nivel: n })); TG_CUERPO.abrir(); }, n);
      v35.push(await p35.evaluate(() => TG_CUERPO.estado().nivel));
    }
    prueba('35: lo guardado que no vale, fuera: el nivel solo de 1 a 4 (7, 0, «2», 2,5 y nada se quedan sin nivel; 4 vale)', JSON.stringify(v35) === '[0,0,0,0,0,4]', JSON.stringify(v35));
    prueba('35: sin errores de página', e35.length === 0, e35.join(' | '));
    await c35.close();
  }

  prueba('ningún error en toda la prueba', errores.length === 0, errores.join(' | '));
  console.log('\n  ' + (ok + mal) + ' controles, ' + (mal ? mal + ' en rojo' : 'todos en verde'));
  await b.close();
  process.exit(mal ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
