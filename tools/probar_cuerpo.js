#!/usr/bin/env node
/* probar_cuerpo.js — «Su cuerpo» dentro de la app: se abre desde la pestaña Cuerpo del perfil y
 * se usa de verdad, en los diez idiomas.
 *
 *     node tools/probar_cuerpo.js PUERTO
 *
 * Son las pruebas de la entrega del cuerpo (probar_prototipo.js: las del 24 de octubre de 2026 y,
 * desde el 31, las 166 del diseño nuevo), pasadas del prototipo a la app el 31 de octubre: el
 * idioma se cambia con setLang(); y el ejemplo se escribe en tenerife.cuerpo como lo escribia el
 * prototipo (series inventadas, solo para la prueba), y su «Empezar vacío» lo quita. Lo que solo
 * tenia sentido en el prototipo, la pagina sin historial, se cambia por lo de la app:
 *   - desde el 1 de noviembre de 2026, «Su cuerpo» va dentro de la pestaña Cuerpo del perfil, sin
 *     tocar nada y con el personaje en pequeño al lado del titulo (1, 3 y 7); con una hoja abierta,
 *     lo demas del perfil queda inerte y no se desplaza, y la hoja sale abajo aunque el perfil este
 *     desplazado (5); sin hoja, Escape y «atras» son los del perfil, y cambiar de pestaña no lo
 *     duplica (10); con «Su cuerpo» cargado antes que el perfil, el Escape de una hoja la cierra
 *     solo a ella (10d); y un «atras» de varios pasos de golpe cierra todo lo que quedaba encima
 *     (12);
 *   - si el modulo no llega, la tarjeta de la pestaña lo dice, y con red otra vez su «Abrir» lo
 *     pone (10b); con un modulo o un perfil de antes (guardados sin conexion), se abre encima,
 *     como entonces (10c);
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
 *     dando la suya (19d).
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
async function contexto(b) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block', locale: 'es-ES' });
  await ctx.route('**/*', r => r.request().url().startsWith('http://127.0.0.1') ? r.continue() : r.abort());
  await ctx.addInitScript(() => {
    try { localStorage.setItem('tenerife.tour.seen', '99'); localStorage.setItem('tgo_consent', JSON.stringify({ v: 'denied', t: Date.now() })); } catch (e) {}
  });
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
/* «Su cuerpo», ya dentro de la pestaña Cuerpo: desde el 1 de noviembre de 2026 se pone solo al
   enseñar la pestaña, y la tarjeta se va */
async function suCuerpo(pg) {
  await pg.waitForFunction(() => window.TG_CUERPO && TG_CUERPO.abierto() && TG_CUERPO.dentro() && document.getElementById('tgp-cuerpo').hidden, null, { timeout: 15000 });
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

  // 1. arranca sin errores, dentro de la pestaña Cuerpo y sin tocar nada, con el personaje en
  //    pequeño al lado del título
  prueba('sin errores al abrir', errores.length === 0, errores.join(' | '));
  const r1 = await pg.evaluate(() => {
    const p = document.getElementById('cuerpo-panel'), m = document.getElementById('tgc-mini'), t = document.getElementById('tgc-titulo');
    const rm = m.getBoundingClientRect(), rt = t.getBoundingClientRect();
    return { sitio: p.parentNode && p.parentNode.id, visible: !p.hidden && p.offsetParent !== null, tarjeta: document.getElementById('tgp-cuerpo').hidden,
      n: document.querySelectorAll('#cuerpo-panel').length, rol: p.getAttribute('role'), modal: p.hasAttribute('aria-modal'), nivel: t.getAttribute('aria-level'),
      atras: document.getElementById('tgc-back').offsetParent === null, inerte: document.getElementById('perfil-panel').inert, estado: JSON.stringify(history.state),
      mini: !!m.querySelector('svg') && m.getAttribute('aria-hidden') === 'true' && m.offsetParent !== null,
      alLado: rm.width > 40 && rm.right <= rt.left + 1 && rm.top < rt.bottom && rm.bottom > rt.top };
  });
  prueba('dentro de la pestaña Cuerpo sin tocar nada: en su sitio, una sola vez y sin la tarjeta', r1.sitio === 'tgp-cuerpo-sitio' && r1.visible && r1.tarjeta && r1.n === 1, JSON.stringify(r1));
  prueba('dentro: un apartado del perfil (región, sin aria-modal, título de nivel 2) y sin su «atrás»', r1.rol === 'region' && !r1.modal && r1.nivel === '2' && r1.atras, JSON.stringify(r1));
  prueba('dentro: el perfil no queda inerte, y ninguna entrada propia en el historial', r1.inerte === false && r1.estado === '{"tgPerfil":1}', JSON.stringify(r1));
  prueba('el personaje en pequeño, al lado del título, sin nada que leer (aria-hidden)', r1.mini && r1.alLado, JSON.stringify(r1));

  // 2. cada selector de TEXTOS da un solo elemento y cada clave existe en los 10 idiomas
  const r2 = await pg.evaluate(() => {
    const p = document.getElementById('cuerpo-panel'), malos = [];
    p.querySelectorAll('[data-tx],[data-tx-aria],[data-tx-ph]').forEach(n => ['data-tx', 'data-tx-aria', 'data-tx-ph'].forEach(at => { const k = n.getAttribute(at); if (k && !UI_TX[k]) malos.push('sin fila ' + k); }));
    return { n: p.querySelectorAll('[data-tx],[data-tx-aria]').length, ph: p.querySelectorAll('[data-tx-ph]').length, malos };
  });
  /* desde el 3 de noviembre, con «Comida», «Preguntar» y «Su deporte»: 109 y 2 (el del buscador de
     ejercicios y el de la pregunta) */
  prueba('textos fijos puestos (109 elementos, con la línea de la IA, y 2 placeholders)', r2.n === 109 && r2.ph === 2, r2.n + '/' + r2.ph);
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
        /* dentro de la pestaña, lo que manda es la pantalla: la lámina sale hasta el borde, por el
           margen del perfil, como en la pantalla de antes por el suyo. Nada pasa de ese borde (ni a la
           derecha ni a la izquierda) y el perfil no se desplaza de lado */
        const p = document.getElementById('cuerpo-panel'), pp = document.getElementById('perfil-panel'), b = pp.getBoundingClientRect();
        const vacios = [...p.querySelectorAll('#tgc [data-tx]')].filter(n => n.offsetParent !== null && !n.textContent.trim()).map(n => n.id || n.className);
        const anchos = [...p.querySelectorAll('#tgc *')].filter(n => { if (n.offsetParent === null) return false; const x = n.getBoundingClientRect(); return x.right > b.right + 0.5 || x.left < b.left - 0.5; })
          .map(n => n.id || (typeof n.className === 'string' ? n.className : '') || n.tagName).slice(0, 5);
        return { vacios, anchos, psw: pp.scrollWidth, pcw: pp.clientWidth, lang: p.getAttribute('lang') };
      });
      prueba(`${l}/${m}: sin textos vacíos`, r.vacios.length === 0, r.vacios.join(','));
      prueba(`${l}/${m}: sin desborde: nada pasa del borde de la pantalla y el perfil no se desplaza de lado`, r.psw <= r.pcw && r.anchos.length === 0, `${r.psw}>${r.pcw} ${r.anchos.join(',')}`);
      prueba(`${l}: lang del panel`, r.lang === (l === 'zht' ? 'zh-Hant' : l === 'zh' ? 'zh-Hans' : l), r.lang);
    }
  }
  const pl = await pg.evaluate(() => { currentLang = 'pl'; const r = [1, 2, 5, 12, 22, 25].map(n => tx('cuerpoNSeries', { n })); currentLang = 'es'; return r; });
  prueba('polaco: seria/serie/serii', pl.join('|') === '1 seria|2 serie|5 serii|12 serii|22 serie|25 serii', pl.join('|'));
  await idioma(pg, 'es'); await pg.evaluate(() => document.getElementById('tgc-modo-m').click());

  // 4. el ejemplo: niveles del mapa y cuentas del resumen
  await ejemplo(pg); await pg.waitForTimeout(200);
  const r4 = await pg.evaluate(() => ({
    series: document.getElementById('tgc-st-series').textContent, grupos: document.getElementById('tgc-st-grupos').textContent,
    dias: document.getElementById('tgc-st-dias').textContent,
    niveles: Object.fromEntries([...document.querySelectorAll('#tgc-lista .tgc-fila')].map(b => [b.dataset.g, b.querySelector('.tgc-nivel').className.slice(-1)])),
    zonas: document.querySelectorAll('#tgc-cara-frente .tgf-z').length, zonasE: document.querySelectorAll('#tgc-cara-espalda .tgf-z').length
  }));
  prueba('resumen: 76 series', r4.series === '76', r4.series);
  prueba('resumen: 11/12 grupos', r4.grupos === '11/12', r4.grupos);
  prueba('resumen: 5/7 días', r4.dias === '5/7', r4.dias);
  prueba('niveles del ejemplo', JSON.stringify(r4.niveles) === JSON.stringify({ pecho: '2', dorsal: '2', espalda_alta: '1', hombros: '2', biceps: '1', triceps: '2', antebrazo: '0', core: '1', gluteos: '3', cuadriceps: '2', isquios: '1', pantorrilla: '2' }), JSON.stringify(r4.niveles));
  prueba('zonas de frente y de espaldas', r4.zonas > 20 && r4.zonasE > 20, r4.zonas + '/' + r4.zonasE);
  const grFrente = await pg.evaluate(() => [...new Set([...document.querySelectorAll('#tgc-cara-frente .tgf-z')].map(z => z.dataset.g))].sort().join(','));
  const grEsp = await pg.evaluate(() => [...new Set([...document.querySelectorAll('#tgc-cara-espalda .tgf-z')].map(z => z.dataset.g))].sort().join(','));
  const todos = [...new Set((grFrente + ',' + grEsp).split(','))].sort().join(',');
  prueba('los 12 grupos están en el dibujo', todos.split(',').length === 12, todos);

  // 4a. (6-11-2026, el bloque 1 del rediseño) en «Músculos», el maniquí lleva la cabeza de la persona en
  //     las dos vistas: arriba, encima de todo y sin recibir toques (lo de debajo es el dibujo, no ella).
  //     Y los colores de la leyenda y de las barras son los niveles del dibujo
  const r4x = await pg.evaluate(() => {
    const pp = document.getElementById('perfil-panel'), antes = pp.scrollTop;
    const cab = v => [...document.querySelectorAll('#tgc-cara-' + v + ' .tgf-cabeza')];
    const f = cab('frente'), e = cab('espalda'), todas = f.concat(e);
    const hex = c => '#' + c.match(/\d+/g).slice(0, 3).map(x => (+x).toString(16).padStart(2, '0')).join('').toUpperCase();
    const N = TG_FIGURA.MUSC.nivel.map(c => c.toUpperCase());
    let arriba = false, debajo = false;
    if (f[0]) {
      f[0].scrollIntoView({ block: 'center' });
      const c = f[0].getBoundingClientRect(), svg = f[0].ownerSVGElement.getBoundingClientRect();
      arriba = c.top >= svg.top - 1 && c.bottom < svg.top + svg.height * 0.25 && c.width > 20;
      const bajo = document.elementFromPoint(c.left + c.width / 2, c.top + c.height / 2);
      debajo = !!bajo && !bajo.closest('.tgf-cabeza') && !!bajo.closest('#tgc-cara-frente');
    }
    pp.scrollTop = antes;
    return { n: f.length + '/' + e.length, toques: todas.every(x => getComputedStyle(x).pointerEvents === 'none'),
      ultima: todas.every(x => x.ownerSVGElement.lastElementChild === x), arriba, debajo,
      ojos: (f[0] ? f[0].querySelectorAll('[fill="#FBF8F3"]').length : -1) + '/' + (e[0] ? e[0].querySelectorAll('[fill="#FBF8F3"]').length : -1),
      css: [0, 1, 2, 3].map(i => getComputedStyle(document.getElementById('cuerpo-panel')).getPropertyValue('--n' + i).trim().toUpperCase()).join(' '), dibujo: N.join(' '),
      leyenda: [0, 1, 2, 3].map(i => hex(getComputedStyle(document.getElementById('tgc-ley-' + i).previousElementSibling).backgroundColor)).join(' '),
      barras: [...document.querySelectorAll('#tgc-lista .tgc-fila .tgc-nivel')].map(i => hex(getComputedStyle(i).backgroundColor) === N[+i.className.slice(-1)]) };
  });
  prueba('músculos: el maniquí lleva la cabeza de la persona, una en cada vista', r4x.n === '1/1', r4x.n);
  prueba('músculos: la cabeza, arriba, encima de todo y sin recibir toques (debajo, el dibujo)', r4x.arriba && r4x.ultima && r4x.toques && r4x.debajo, JSON.stringify(r4x));
  prueba('músculos: de frente, con sus ojos; de espaldas, sin ellos', r4x.ojos === '2/0', r4x.ojos);
  prueba('los colores de la pantalla (--n0 a --n3) son los niveles del dibujo', r4x.css === r4x.dibujo, r4x.css + ' / ' + r4x.dibujo);
  prueba('la leyenda y las 12 barras, con el color de su nivel', r4x.leyenda === r4x.dibujo && r4x.barras.length === 12 && r4x.barras.every(Boolean), r4x.leyenda + ' / ' + r4x.barras.join(','));

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

  // 4c. los 12 grupos como barras: el largo es el de las series, todas igual de largas, la marca del 10 en el mismo sitio
  const r4d = await pg.evaluate(() => {
    const filas = [...document.querySelectorAll('#tgc-lista .tgc-fila')];
    const caja = filas.map(b => b.querySelector('.tgc-barra').getBoundingClientRect());
    const marcas = filas.map(b => b.querySelector('.tgc-barra-ref')).filter(Boolean).map(m => m.getBoundingClientRect().left);
    const s = n => Number(n.querySelector('.tgc-fila-n').textContent.match(/\d+/)[0]);
    const prop = filas.every(b => { const w = parseFloat(b.querySelector('.tgc-barra .tgc-nivel').style.width); return Math.abs(w - 100 * s(b) / 20) < 0.11; });
    return { n: filas.length, iguales: caja.every(r => Math.abs(r.width - caja[0].width) < 0.5 && Math.abs(r.left - caja[0].left) < 0.5),
             marcas: marcas.length, enSuSitio: marcas.every(x => Math.abs(x - marcas[0]) < 0.5), prop, ref: !document.getElementById('tgc-ref').hidden,
             nombre: filas[0].textContent.replace(/\s+/g, ' ').trim() };
  });
  prueba('grupos: 12 barras del mismo largo', r4d.n === 12 && r4d.iguales, JSON.stringify(r4d));
  prueba('grupos: el largo de cada barra son sus series (escala de 20)', r4d.prop);
  prueba('grupos: la marca del 10 en el mismo sitio en las 12 (adultos)', r4d.marcas === 12 && r4d.enSuSitio && r4d.ref);
  prueba('grupos: el botón dice el grupo, las series y cuándo', r4d.nombre === 'Pecho 8 series hoy', r4d.nombre);
  // de 14 a 17 años (perfil con el año de nacimiento): la recomendación de la OMS para su edad y sin la marca del 10
  await pg.evaluate(() => { localStorage.setItem('tenerife.perfil', JSON.stringify({ nacimiento: new Date().getFullYear() - 15 })); TG_CUERPO.repintar(); });
  const r4e = await pg.evaluate(() => ({ marcas: document.querySelectorAll('#tgc-lista .tgc-barra-ref').length, ref: document.getElementById('tgc-ref').hidden,
    reco: document.getElementById('tgc-reco').textContent }));
  prueba('menores: sin la marca del 10 ni su texto, con la recomendación de su edad', r4e.marcas === 0 && r4e.ref && /5 a 17|3 días/.test(r4e.reco), JSON.stringify(r4e));
  await pg.evaluate(() => { localStorage.removeItem('tenerife.perfil'); TG_CUERPO.repintar(); });

  // 5. la hoja: tocar el pecho en el dibujo, anotar, borrar y deshacer. Con el perfil desplazado:
  //    la hoja sale abajo de la pantalla y el velo la cubre entera; lo demás del perfil queda inerte
  //    y no se desplaza, y al cerrarla todo vuelve como estaba
  await pg.evaluate(() => { document.getElementById('perfil-panel').scrollTop = 500; }); await pg.waitForTimeout(100);
  await pg.evaluate(() => { const z = document.querySelector('#tgc-cara-frente .tgf-z[data-g="pecho"]'); z.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
  await pg.waitForTimeout(300);
  prueba('la hoja se abre desde el dibujo', await pg.evaluate(() => !document.getElementById('tgc-hoja').hidden && document.getElementById('tgc-hoja-tit').textContent === 'Pecho'));
  prueba('el foco va a la hoja', await pg.evaluate(() => document.activeElement && document.activeElement.id === 'tgc-hoja-tit'));
  prueba('lo de debajo, inerte', await pg.evaluate(() => document.getElementById('tgc').inert === true));
  /* con la hoja ya subida (3 de noviembre de 2026): su animacion (tgc-sube, 320 ms) la trae desde
     28 px mas abajo, y a los 300 ms todavia le faltaban hasta 0,8 px; con el procesador ocupado,
     hasta 17,6, y «sale abajo de la pantalla» salia en rojo a ratos */
  await pg.evaluate(() => Promise.all(document.getElementById('tgc-hoja').getAnimations().map(a => a.finished)));
  const r5a = await pg.evaluate(() => {
    const pp = document.getElementById('perfil-panel'), h = document.getElementById('tgc-hoja').getBoundingClientRect(), v = document.getElementById('tgc-velo').getBoundingClientRect();
    const inerte = s => !!document.querySelector(s).closest('[inert]');
    return { abajo: Math.abs(h.bottom - innerHeight) <= 1, velo: v.top <= 0 && v.bottom >= innerHeight && v.left <= 0 && v.right >= innerWidth, desplazado: pp.scrollTop,
      cab: inerte('#perfil-panel .tgp-top'), pestanas: inerte('#tgp-tabs'), datos: inerte('#tgp-datos'), hoja: inerte('#tgc-hoja'), quieto: getComputedStyle(pp).overflowY };
  });
  prueba('dentro: con el perfil desplazado, la hoja sale abajo de la pantalla y el velo la cubre entera', r5a.abajo && r5a.velo && r5a.desplazado === 500, JSON.stringify(r5a));
  prueba('dentro: lo demás del perfil (la cabecera, las pestañas, «Sus datos») inerte, la hoja no; y el perfil no se desplaza', r5a.cab && r5a.pestanas && r5a.datos && !r5a.hoja && r5a.quieto === 'hidden', JSON.stringify(r5a));
  prueba('selección marcada en el dibujo', await pg.evaluate(() => document.querySelectorAll('#tgc-cara-frente .tgf-marca path').length > 0));
  prueba('la hoja lleva el maniquí con su grupo encendido (el tono del nivel 3) y sin cabeza de persona', await pg.evaluate(() => {
    const z = [...document.querySelectorAll('#tgc-hoja-mini .tgf-z')];
    return z.length > 10 && z.filter(x => x.dataset.g === 'pecho').every(x => /-n3\)$/.test(x.getAttribute('fill'))) && z.filter(x => x.dataset.g !== 'pecho').every(x => /-n0\)$/.test(x.getAttribute('fill'))) &&
      document.querySelectorAll('#tgc-hoja-mini .tgf-cabeza').length === 0;
  }));
  await pg.click('#tgc-mas'); await pg.click('#tgc-mas');
  prueba('paso: 5', await pg.evaluate(() => document.getElementById('tgc-n').value) === '5');
  await pg.click('#tgc-ayer'); await pg.click('#tgc-guardar'); await pg.waitForTimeout(150);
  const r5 = await pg.evaluate(() => { const s = TG_CUERPO.estado().series, x = s[s.length - 1]; return { x, guardado: JSON.parse(localStorage.getItem('tenerife.cuerpo')).series.length, n: s.length, toast: document.getElementById('tgc-toast-txt').textContent }; });
  const ayer = await pg.evaluate(() => { const d = new Date(); d.setDate(d.getDate() - 1); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); });
  prueba('anotado: 5 series de pecho ayer', r5.x.g === 'pecho' && r5.x.n === 5 && r5.x.d === ayer, JSON.stringify(r5.x));
  prueba('guardado en el dispositivo', r5.guardado === r5.n);
  prueba('aviso de anotado', r5.toast === 'Pecho: 5 series anotadas', r5.toast);
  prueba('el pecho sube a 13 series (nivel 3)', await pg.evaluate(() => document.getElementById('tgc-h-series').textContent === '13' && document.getElementById('tgc-hoja-nivel').classList.contains('n3')));
  const nAntes = r5.n;
  await pg.click('.tgc-hist-x'); await pg.waitForTimeout(100);
  prueba('borrar una anotación', await pg.evaluate(() => TG_CUERPO.estado().series.length) === nAntes - 1);
  await pg.click('#tgc-toast-btn'); await pg.waitForTimeout(100);
  prueba('deshacer la borrada', await pg.evaluate(() => TG_CUERPO.estado().series.length) === nAntes);
  // el foco no sale de la hoja
  await pg.focus('#tgc-hoja-cerrar');
  for (let i = 0; i < 25; i++) await pg.keyboard.press('Tab');
  prueba('el foco se queda en la hoja', await pg.evaluate(() => document.getElementById('tgc-hoja').contains(document.activeElement)));
  await pg.keyboard.press('Escape'); await pg.waitForTimeout(150);
  prueba('Escape cierra la hoja, y el perfil sigue abierto', await pg.evaluate(() => document.getElementById('tgc-hoja').hidden && TG_CUERPO.abierto() && !document.getElementById('perfil-panel').hidden));
  prueba('lo de debajo vuelve a funcionar: nada inerte en el perfil, que se desplaza otra vez desde donde estaba', await pg.evaluate(() => { const pp = document.getElementById('perfil-panel');
    return document.getElementById('tgc').inert === false && document.querySelectorAll('#perfil-panel [inert]').length === 0 && getComputedStyle(pp).overflowY === 'auto' && Math.abs(pp.scrollTop - 500) <= 1; }));

  // 6. «Músculos»: las dos vistas a la vez, con su pie; «Girar» solo en «Aspecto»
  const r6 = await pg.evaluate(() => {
    const f = document.getElementById('tgc-cara-frente'), e = document.getElementById('tgc-cara-espalda'), rf = f.getBoundingClientRect(), re = e.getBoundingClientRect();
    return { ocultas: [f, e].map(x => x.getAttribute('aria-hidden')).join(','), lado: rf.right <= re.left + 1 && Math.abs(rf.top - re.top) < 1 && rf.width > 100,
             pies: ['tgc-cap-frente', 'tgc-cap-espalda'].map(i => document.getElementById(i).offsetParent !== null && document.getElementById(i).textContent).join('|'),
             girar: document.getElementById('tgc-girar').offsetParent === null };
  });
  prueba('músculos: las dos vistas, una al lado de la otra y las dos legibles', r6.ocultas === 'false,false' && r6.lado, JSON.stringify(r6));
  prueba('músculos: cada vista con su pie', r6.pies === 'de frente|de espaldas', r6.pies);
  prueba('músculos: sin «Girar»', r6.girar);
  await pg.click('#tgc-modo-a'); await pg.waitForTimeout(100);
  prueba('aspecto: una sola vista legible', await pg.evaluate(() => document.getElementById('tgc-cara-frente').getAttribute('aria-hidden') === 'false' && document.getElementById('tgc-cara-espalda').getAttribute('aria-hidden') === 'true'));
  prueba('aspecto: el personaje de siempre, sin cabeza aparte', await pg.evaluate(() => document.querySelectorAll('#tgc-giro svg').length === 2 && document.querySelectorAll('#tgc-giro .tgf-cabeza').length === 0));
  await pg.click('#tgc-girar'); await pg.waitForTimeout(100);
  prueba('girar: de espaldas', await pg.evaluate(() => document.getElementById('tgc-giro').classList.contains('is-espalda') &&
    document.getElementById('tgc-cara-espalda').getAttribute('aria-hidden') === 'false' && document.getElementById('tgc-cara-frente').getAttribute('aria-hidden') === 'true' &&
    document.getElementById('tgc-girar').getAttribute('aria-label') === 'Ver de frente' && document.getElementById('tgc-vista').textContent === 'de espaldas'));
  await pg.click('#tgc-girar');
  await pg.click('#tgc-modo-m'); await pg.waitForTimeout(100);

  // 7. el aspecto: cambiar y que se guarde
  await pg.click('#tgc-modo-a'); await pg.waitForTimeout(100);
  await pg.click('label:has(#tgc-pelo-afro)'); await pg.click('label:has(#tgc-arriba-tirantes)'); await pg.click('label:has(#tgc-piel-8)');
  await pg.click('label:has(#tgc-protesis-pierna_izq)');
  const r7 = await pg.evaluate(() => ({ a: TG_CUERPO.estado().aspecto, g: JSON.parse(localStorage.getItem('tenerife.cuerpo')).aspecto }));
  prueba('aspecto cambiado', r7.a.pelo === 'afro' && r7.a.arriba === 'tirantes' && r7.a.piel === 8 && r7.a.protesis === 'pierna_izq', JSON.stringify(r7.a));
  prueba('aspecto guardado', JSON.stringify(r7.a) === JSON.stringify(r7.g));
  prueba('el personaje en pequeño, con el aspecto nuevo', await pg.evaluate(() => {
    const t = document.createElement('span');
    t.innerHTML = TG_FIGURA.svg({ vista: 'frente', modo: 'aspecto', aspecto: TG_CUERPO.estado().aspecto, id: 'tgc-mini', viewBox: '110 20 180 300' });
    return !!document.querySelector('#tgc-mini svg') && document.getElementById('tgc-mini').innerHTML === t.innerHTML;
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
    const n = document.querySelectorAll('#tgc-cara-frente .tgf-z[data-g="pantorrilla"]').length;
    const todas = (TG_FIGURA.svg({ vista: 'frente', modo: 'musculos', aspecto: Object.assign({}, TG_CUERPO.estado().aspecto, { protesis: 'no' }), id: 'q' }).match(/data-g="pantorrilla"/g) || []).length;
    return n > 0 && n * 2 === todas;
  }));
  // (6-11-2026) la cabeza del maniquí es la del aspecto elegido: la misma que da el dibujo con «cara»
  prueba('músculos: la cabeza del maniquí, con el aspecto elegido', await pg.evaluate(() => {
    const a = TG_CUERPO.estado().aspecto, t = document.createElement('span');
    return ['frente', 'espalda'].every(v => {
      t.innerHTML = TG_FIGURA.svg({ vista: v, modo: 'musculos', cara: true, aspecto: a, id: 'tgc-' + v });
      const mia = document.querySelector('#tgc-cara-' + v + ' .tgf-cabeza'), suya = t.querySelector('.tgf-cabeza');
      return !!mia && !!suya && mia.outerHTML === suya.outerHTML && document.querySelector('#tgc-' + v + '-pielc stop[offset="0.55"]').getAttribute('stop-color') === TG_FIGURA.PIEL[a.piel];
    });
  }));

  // 7b. (6-11-2026) el pelo largo cae sobre la espalda alta al 30 %: no se queda con el toque, que llega
  //     al músculo de debajo y abre la hoja de su grupo. Con un toque de verdad, en su punto de la pantalla
  const pp7 = await pg.evaluate(() => document.getElementById('perfil-panel').scrollTop);
  await pg.evaluate(() => { const e = JSON.parse(localStorage.getItem('tenerife.cuerpo')); e.aspecto = Object.assign(TG_FIGURA.normaliza(null), { pelo: 'largo' }); localStorage.setItem('tenerife.cuerpo', JSON.stringify(e)); TG_CUERPO.abrir(); });
  await pg.waitForTimeout(200);
  const r7c = await pg.evaluate(() => {
    const cab = document.querySelector('#tgc-cara-espalda .tgf-cabeza');
    if (!cab) return null;
    cab.scrollIntoView({ block: 'center' });
    const c = cab.getBoundingClientRect();
    for (const z of document.querySelectorAll('#tgc-cara-espalda .tgf-z')) {
      const r = z.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
      if (x > c.left && x < c.right && y > c.top && y < c.bottom && document.elementFromPoint(x, y) === z) return { x, y, g: z.dataset.g };
    }
    return null;
  });
  prueba('pelo largo: debajo del pelo hay músculo, y es él quien recibe el toque', !!r7c, JSON.stringify(r7c));
  if (r7c) {
    await pg.mouse.click(r7c.x, r7c.y); await pg.waitForTimeout(300);
    prueba('pelo largo: tocar ahí abre la hoja de ese grupo', await pg.evaluate(g => {
      const z = [...document.querySelectorAll('#tgc-hoja-mini .tgf-z')].filter(x => /-n3\)$/.test(x.getAttribute('fill')));
      return !document.getElementById('tgc-hoja').hidden && z.length > 0 && z.every(x => x.dataset.g === g);
    }, r7c.g), r7c.g);
    await pg.keyboard.press('Escape'); await pg.waitForTimeout(150);
  }
  await pg.evaluate(y => { document.getElementById('perfil-panel').scrollTop = y; }, pp7);

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

  // 8b. la lámina vacía dice qué hacer; con series, no; la entrada (barrido y barras que crecen) solo al abrir
  await vacio(pg); await pg.waitForTimeout(150);
  const r8b = await pg.evaluate(() => ({ visible: document.getElementById('tgc-pista').offsetParent !== null, txt: document.getElementById('tgc-pista-txt').textContent,
    entra: document.getElementById('tgc').classList.contains('tgc-entra') }));
  prueba('vacío: la lámina invita a anotar', r8b.visible && r8b.txt === 'Toque un músculo del dibujo o de la lista para anotar series.', JSON.stringify(r8b));
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

  // 10. dentro de la pestaña y sin hoja abierta, Escape y «atrás» son los del perfil: lo cierran
  //     entero, y al volver a abrirlo «Su cuerpo» sigue en su pestaña. Ir a otra pestaña y volver
  //     no lo duplica
  await pg.evaluate(() => TG_PERFIL.pestana('viaje')); await pg.waitForTimeout(150);
  const r10a = await pg.evaluate(() => ({ cuerpo: document.getElementById('cuerpo-panel').offsetParent === null, viaje: !document.getElementById('tgp-p-viaje').hidden }));
  await pg.evaluate(() => TG_PERFIL.pestana('cuerpo')); await pg.waitForTimeout(250);
  const r10v = await pg.evaluate(() => ({ n: document.querySelectorAll('#cuerpo-panel').length, sitio: document.getElementById('cuerpo-panel').parentNode.id,
    visible: document.getElementById('cuerpo-panel').offsetParent !== null, tarjeta: document.getElementById('tgp-cuerpo').hidden, estado: JSON.stringify(history.state) }));
  prueba('en Viaje no se ve; de vuelta en Cuerpo, en su sitio, una sola vez, sin la tarjeta y sin entradas en el historial', r10a.cuerpo && r10a.viaje && r10v.n === 1 &&
    r10v.sitio === 'tgp-cuerpo-sitio' && r10v.visible && r10v.tarjeta && r10v.estado === '{"tgPerfil":1}', JSON.stringify([r10a, r10v]));
  await pg.evaluate(() => { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); });
  await pg.keyboard.press('Escape'); await pg.waitForTimeout(250);
  prueba('Escape, sin hoja abierta, es del perfil: lo cierra entero', await pg.evaluate(() => document.getElementById('perfil-panel').hidden && !document.getElementById('perfil-panel').inert));
  await pg.evaluate(() => abrirPerfil()); await suCuerpo(pg);
  prueba('el perfil se vuelve a abrir en su pestaña Cuerpo, con «Su cuerpo» dentro y nada inerte', await pg.evaluate(() => TG_PERFIL.estado().pestana === 'cuerpo' && TG_CUERPO.dentro() &&
    document.getElementById('cuerpo-panel').offsetParent !== null && document.querySelectorAll('#perfil-panel [inert]').length === 0));
  await pg.goBack(); await pg.waitForTimeout(250);
  prueba('«atrás» cierra el perfil, sin salir de la app', await pg.evaluate(() => document.getElementById('perfil-panel').hidden && typeof abrirPerfil === 'function') && pg.url().endsWith('/index.html'), pg.url());

  // 10b. (la app) si el módulo no llega, la tarjeta de la pestaña lo dice; con red otra vez, su
  //      «Abrir» lo pone en su sitio
  {
    const c2 = await contexto(b), p2 = await c2.newPage(), e2 = []; vigilar(p2, e2);
    await p2.route('**/modulos/cuerpo.js', r => r.abort());
    await abrirApp(p2); await abrirPerfilCuerpo(p2); await p2.waitForTimeout(800);
    const r10b = await p2.evaluate(() => ({ tarjeta: !document.getElementById('tgp-cuerpo').hidden, aviso: !document.getElementById('tgp-cuerpo-error').hidden,
      txt: document.getElementById('tgp-cuerpo-error').textContent, cuerpo: !!window.TG_CUERPO, perfil: !document.getElementById('perfil-panel').hidden }));
    prueba('sin el módulo: la tarjeta de la pestaña lo dice, y el perfil sigue abierto', r10b.tarjeta && r10b.aviso && /conexión/.test(r10b.txt) && !r10b.cuerpo && r10b.perfil, JSON.stringify(r10b));
    await p2.unroute('**/modulos/cuerpo.js');
    await p2.click('#tgp-cuerpo-abrir');
    await suCuerpo(p2).catch(() => {});
    prueba('…y con red otra vez, su «Abrir» lo pone en su sitio, y la tarjeta y el aviso se van', await p2.evaluate(() => !!window.TG_CUERPO && TG_CUERPO.dentro() &&
      document.getElementById('cuerpo-panel').parentNode.id === 'tgp-cuerpo-sitio' && document.getElementById('tgp-cuerpo').hidden && document.getElementById('tgp-cuerpo-error').hidden));
    prueba('…sin errores de página', e2.filter(x => !/cuerpo\.js/.test(x)).length === 0, e2.join(' | '));
    await c2.close();
  }

  // 10c. (la app) con versiones mezcladas, guardadas sin conexión: un módulo de antes del 1 de
  //      noviembre, que no sabe ir dentro (sin incrustar), deja la tarjeta, y su «Abrir» abre su
  //      pantalla encima, como entonces; y con un perfil sin sitio para él, abrirCuerpo también
  {
    const c4 = await contexto(b), p4 = await c4.newPage(), e4 = []; vigilar(p4, e4);
    await p4.route('**/modulos/cuerpo.js', async r => {
      const res = await r.fetch(), s = await res.text();
      await r.fulfill({ status: 200, contentType: 'text/javascript; charset=utf-8', body: s.replace('    incrustar: incrustar,\n', '') });
    });
    await abrirApp(p4); await abrirPerfilCuerpo(p4); await p4.waitForTimeout(800);
    const v1 = await p4.evaluate(() => ({ antes: !!window.TG_CUERPO && typeof TG_CUERPO.incrustar !== 'function', tarjeta: !document.getElementById('tgp-cuerpo').hidden,
      aviso: !document.getElementById('tgp-cuerpo-error').hidden }));
    prueba('un módulo de antes: la tarjeta, sin aviso', v1.antes && v1.tarjeta && !v1.aviso, JSON.stringify(v1));
    await p4.click('#tgp-cuerpo-abrir'); await p4.waitForTimeout(400);
    const v2 = await p4.evaluate(() => ({ abierto: TG_CUERPO.abierto(), dentro: TG_CUERPO.dentro(), encima: document.getElementById('cuerpo-panel').parentNode === document.body,
      inerte: document.getElementById('perfil-panel').inert }));
    prueba('…y su «Abrir» abre la pantalla encima, con el perfil inerte debajo', v2.abierto && !v2.dentro && v2.encima && v2.inerte === true, JSON.stringify(v2));
    await p4.keyboard.press('Escape'); await p4.waitForTimeout(250);
    prueba('…y Escape la cierra y deja el perfil abierto', await p4.evaluate(() => !TG_CUERPO.abierto() && !document.getElementById('perfil-panel').hidden && !document.getElementById('perfil-panel').inert));
    prueba('…sin errores de página', e4.length === 0, e4.join(' | '));
    await c4.close();
    const c6 = await contexto(b), p6 = await c6.newPage(), e6 = []; vigilar(p6, e6);
    await p6.route('**/modulos/perfil.js', async r => {
      const res = await r.fetch(), s = await res.text();
      await r.fulfill({ status: 200, contentType: 'text/javascript; charset=utf-8', body: s.replace('<div class="tgp-cuerpo-sitio" id="tgp-cuerpo-sitio"></div>', '') });
    });
    await abrirApp(p6);
    await p6.evaluate(() => window.abrirCuerpo({ modo: 'aspecto' })); await p6.waitForTimeout(400);
    const v3 = await p6.evaluate(() => ({ sinSitio: !document.getElementById('tgp-cuerpo-sitio'), abierto: TG_CUERPO.abierto(), dentro: TG_CUERPO.dentro(),
      encima: document.getElementById('cuerpo-panel').parentNode === document.body, aspecto: document.getElementById('tgc').classList.contains('is-aspecto'),
      perfil: !document.getElementById('perfil-panel').hidden }));
    prueba('un perfil sin sitio para «Su cuerpo»: abrirCuerpo lo abre encima, en el modo pedido', v3.sinSitio && v3.abierto && !v3.dentro && v3.encima && v3.aspecto && v3.perfil, JSON.stringify(v3));
    prueba('…sin errores de página', e6.length === 0, e6.join(' | '));
    await c6.close();
  }

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
    const v5 = await p8.evaluate(() => ({ hoja: document.getElementById('tgc-hoja').hidden, perfil: !document.getElementById('perfil-panel').hidden,
      inertes: document.querySelectorAll('#perfil-panel [inert]').length }));
    prueba('«Su cuerpo» cargado antes que el perfil: Escape con una hoja abierta cierra solo la hoja, y el perfil sigue abierto', antes && v4 && v5.hoja && v5.perfil && v5.inertes === 0,
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
  prueba('«atrás» de dos pasos desde la ficha: se cierran la ficha y la hoja; el perfil, abierto y sin nada inerte', await pg.evaluate(() => document.getElementById('tgc-hoja').hidden &&
    !document.getElementById('perfil-panel').hidden && document.querySelectorAll('#perfil-panel [inert]').length === 0 && JSON.stringify(history.state) === '{"tgPerfil":1}'));
  await pg.click('.tgc-fila[data-g="' + grupoEj + '"]'); await pg.waitForSelector('.tgc-ej-fila');
  await pg.click('.tgc-ej-fila[data-id="' + ej.id + '"]'); await pg.waitForTimeout(150);
  await pg.evaluate(() => history.go(-3)); await pg.waitForTimeout(350);
  const r12m = await pg.evaluate(() => ({ perfil: document.getElementById('perfil-panel').hidden, hoja: document.getElementById('tgc-hoja').hidden }));
  await pg.evaluate(() => abrirPerfil()); await suCuerpo(pg);
  const r12n = await pg.evaluate(() => ({ hoja: document.getElementById('tgc-hoja').hidden, inertes: document.querySelectorAll('#perfil-panel [inert]').length,
    desplaza: getComputedStyle(document.getElementById('perfil-panel')).overflowY }));
  prueba('«atrás» de tres pasos desde la ficha: también el perfil; al volver a abrirlo, sin hoja, sin nada inerte y se desplaza', r12m.perfil && r12m.hoja && r12n.hoja &&
    r12n.inertes === 0 && r12n.desplaza === 'auto', JSON.stringify([r12m, r12n]));
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
  //     verdad, que va en la misma pestaña: «Su cuerpo» se repinta en el acto, sin salir de ella.
  //     Sin la marca del 10 ni su texto, y con la recomendación de su edad; con un año de adulto,
  //     o sin año, la marca vuelve
  {
    const c5 = await contexto(b), p5 = await c5.newPage(), e5 = []; vigilar(p5, e5);
    await abrirApp(p5); await abrirPerfilCuerpo(p5); await suCuerpo(p5);
    const anio = await p5.evaluate(() => new Date().getFullYear());
    const conAnio = async (v) => {
      await p5.fill('#tgp-nac', v); await p5.click('#tgp-save'); await p5.waitForTimeout(200);
      const guardado = await p5.evaluate(() => (JSON.parse(localStorage.getItem('tenerife.perfil')) || {}).nacimiento);
      return Object.assign({ guardado }, await p5.evaluate(() => ({ marcas: document.querySelectorAll('#tgc-lista .tgc-barra-ref').length,
        ref: !document.getElementById('tgc-ref').hidden, reco: document.getElementById('tgc-reco').textContent })));
    };
    const m15 = await conAnio(String(anio - 15));
    prueba('perfil con 15 años: sin la marca del 10 ni su texto, y la recomendación de 5 a 17 años', m15.guardado === anio - 15 && m15.marcas === 0 && !m15.ref && /^La OMS \(2020\) recomienda de 5 a 17 años/.test(m15.reco), JSON.stringify(m15));
    const a15 = await conAnio(String(anio - 30));
    prueba('perfil con 30 años: la marca en los 12 grupos, su texto y la recomendación de adultos', a15.guardado === anio - 30 && a15.marcas === 12 && a15.ref && /recomiendan a los adultos/.test(a15.reco), JSON.stringify(a15));
    const s15 = await conAnio('');
    prueba('perfil sin año: como un adulto', s15.guardado === null && s15.marcas === 12 && s15.ref && /recomiendan a los adultos/.test(s15.reco), JSON.stringify(s15));
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

  // 17. (la app) el iPhone con isla dinámica (1 de noviembre de 2026): 59 px arriba. El perfil ya
  //     los deja con su padding-top, y su cabecera, pegada, se queda en ellos sin sumarlos otra vez
  //     (antes bajaba a 118, y en la pantalla de «Su cuerpo» tapaba «Músculos | Aspecto»). Encima, en
  //     la franja de la hora, una del color de la cabecera: lo que sube ya no pasa por debajo de la
  //     hora. En la pestaña, «Músculos | Aspecto» a la vista bajo la barra de las pestañas, y en
  //     «Aspecto», al bajar, el personaje pegado justo debajo de esa barra. Chromium simula el margen
  //     (Emulation.setSafeAreaInsetsOverride).
  {
    const c7 = await b.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, serviceWorkers: 'block', locale: 'es-ES' });
    await c7.route('**/*', r => r.request().url().startsWith('http://127.0.0.1') ? r.continue() : r.abort());
    await c7.addInitScript(() => { try { localStorage.setItem('tenerife.tour.seen', '99'); localStorage.setItem('tgo_consent', JSON.stringify({ v: 'denied', t: Date.now() })); } catch (e) {} });
    const p7 = await c7.newPage(); const e7 = []; vigilar(p7, e7);
    const cdp7 = await c7.newCDPSession(p7);
    let simula = true;
    try { await cdp7.send('Emulation.setSafeAreaInsetsOverride', { insets: { top: 59, topMax: 59, bottom: 34, bottomMax: 34, left: 0, leftMax: 0, right: 0, rightMax: 0 } }); } catch (e) { simula = false; }
    prueba('isla dinámica: Chromium simula el margen del iPhone (59 px arriba)', simula);
    if (simula) {
      await abrirApp(p7); await abrirPerfilCuerpo(p7); await suCuerpo(p7); await p7.waitForTimeout(600);
      const medir = () => p7.evaluate(() => { const r = s => { const x = document.querySelector(s).getBoundingClientRect(); return [Math.round(x.top), Math.round(x.bottom)]; };
        const pp = document.getElementById('perfil-panel'), f = getComputedStyle(pp, '::before');
        return { margen: parseFloat(getComputedStyle(pp).paddingTop), cab: r('#perfil-panel .tgp-top'), barra: r('#tgp-tabs'), modos: r('#cuerpo-panel .tgc-modos'),
          franja: [f.position, f.top, f.height, f.zIndex, f.pointerEvents].join(' '), color: f.backgroundColor, cabColor: getComputedStyle(pp.querySelector('.tgp-top')).backgroundColor }; });
      const hasta = (dy) => p7.evaluate(dy => { const pp = document.getElementById('perfil-panel'), s = document.getElementById('tgp-cuerpo-sitio');
        pp.scrollTop = s.getBoundingClientRect().top - pp.getBoundingClientRect().top + pp.scrollTop + dy; }, dy);
      await hasta(-200); await p7.waitForTimeout(250);
      const a7 = await medir();
      prueba('isla dinámica: la cabecera del perfil justo debajo del margen, y «Músculos | Aspecto» a la vista, debajo de la barra de las pestañas', a7.margen === 59 &&
        Math.abs(a7.cab[0] - 59) <= 1 && a7.barra[0] >= a7.cab[1] && a7.modos[0] >= a7.barra[1] && a7.modos[1] <= 852, JSON.stringify(a7));
      await p7.evaluate(() => { document.getElementById('perfil-panel').scrollTop += 600; }); await p7.waitForTimeout(250);
      const b7 = await medir();
      prueba('isla dinámica: al bajar, la cabecera y la barra se quedan pegadas justo debajo del margen', Math.abs(b7.cab[0] - 59) <= 1 && Math.abs(b7.barra[0] - b7.cab[1]) <= 1, JSON.stringify(b7));
      prueba('isla dinámica: en la franja de la hora, una fija de 59 px, del color de la cabecera, por encima de lo que se desplaza y sin recibir toques', b7.franja === 'fixed 0px 59px 6 none' &&
        b7.color === b7.cabColor && !/rgba\(0, 0, 0, 0\)|transparent/.test(b7.color), JSON.stringify(b7));
      await p7.evaluate(() => { document.getElementById('perfil-panel').scrollTop = 0; document.getElementById('tgc-modo-a').click(); }); await p7.waitForTimeout(500);
      await hasta(400); await p7.waitForTimeout(250);
      const c7m = await p7.evaluate(() => { const t = document.getElementById('tgp-tabs').getBoundingClientRect(), e = document.querySelector('#cuerpo-panel .tgc-escena').getBoundingClientRect();
        return { barra: [Math.round(t.top), Math.round(t.bottom)], escena: Math.round(e.top) }; });
      prueba('isla dinámica: en «Aspecto», al bajar, el personaje se queda pegado justo debajo de la barra de las pestañas', Math.abs(c7m.escena - c7m.barra[1]) <= 1 && c7m.barra[0] > 59, JSON.stringify(c7m));
    }
    prueba('isla dinámica: sin errores de página', e7.length === 0, e7.join(' | '));
    await c7.close();
  }

  // 18. (la app) lo nuevo de la entrega del 1 de noviembre, dentro de la pestaña (3 de noviembre de
  //     2026): «Preguntar», el panel SOS encima desde una respuesta, «Comida», «Su deporte»,
  //     abrirCuerpo() con un modo o una pregunta, y el idioma con «Preguntar» abierto
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
      escena: document.getElementById('tgc-escena').hidden, sitio: document.getElementById('cuerpo-panel').parentNode.id,
      estado: document.getElementById('tgc-asis-estado').textContent, pie: document.getElementById('tgc-ia').textContent, ia: UI_TX.cuerpoAsisRevisado.es,
      sugeridas: document.querySelectorAll('#tgc-sugeridas .tgc-chip-preg').length, estadoHist: JSON.stringify(history.state) }));
    prueba('«Preguntar», dentro de la pestaña: su vista, sin el personaje, con preguntas sugeridas y sin entrada propia en el historial', r18.pulsado === 'true' && r18.vista && r18.escena
      && r18.sitio === 'tgp-cuerpo-sitio' && r18.sugeridas > 0 && r18.estadoHist === '{"tgPerfil":1}', JSON.stringify(r18));
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
      const pn = document.getElementById('perfil-panel'), ch = document.getElementById('tgc-charla'), f = document.getElementById('tgc-preg-form');
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
        perfil: !document.getElementById('perfil-panel').hidden, cuerpo: TG_CUERPO.abierto() && TG_CUERPO.dentro() && cp.offsetParent !== null,
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

    // abrirCuerpo() con un modo o una pregunta: dentro de la pestaña, como abrir()
    await p8.evaluate(() => abrirCuerpo({ modo: 'comida' })); await p8.waitForTimeout(300);
    const m1 = await p8.evaluate(() => ({ c: document.getElementById('tgc-modo-c').getAttribute('aria-pressed'), sitio: document.getElementById('cuerpo-panel').parentNode.id,
      perfil: !document.getElementById('perfil-panel').hidden, n: document.querySelectorAll('#cuerpo-panel').length }));
    prueba('abrirCuerpo({ modo: «comida» }) la pone en «Comida», dentro de la pestaña', m1.c === 'true' && m1.sitio === 'tgp-cuerpo-sitio' && m1.perfil && m1.n === 1, JSON.stringify(m1));
    await p8.evaluate(q => abrirCuerpo({ pregunta: q }), PRIV.q);
    await p8.waitForFunction(t => { const r = document.querySelector('#tgc-charla .tgc-turno:last-child .tgc-resp-t');
      return r && r.textContent === t && document.getElementById('tgc-modo-p').getAttribute('aria-pressed') === 'true'; }, PRIV.r.t, { timeout: 15000 }).catch(() => {});
    const m2 = await p8.evaluate(() => ({ p: document.getElementById('tgc-modo-p').getAttribute('aria-pressed'), r: (document.querySelector('#tgc-charla .tgc-turno:last-child .tgc-resp-t') || {}).textContent,
      sitio: document.getElementById('cuerpo-panel').parentNode.id }));
    prueba('abrirCuerpo({ pregunta }) la pone en «Preguntar», dentro de la pestaña, y ya responde', m2.p === 'true' && m2.r === PRIV.r.t && m2.sitio === 'tgp-cuerpo-sitio', JSON.stringify(m2));

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

  // 20. (la app) al bajar por la pestaña, la cabecera y la barra de pestañas del perfil quedan
  //     encima de lo que pasa por debajo, también de la cabecera de «Su cuerpo», en los cuatro
  //     modos (3 de noviembre de 2026: su .tgc-top guardaba el z-index 6 de la pantalla aparte y,
  //     como elemento de una rejilla, se pintaba encima del título del perfil y de sus pestañas)
  {
    const c10 = await contexto(b), p10 = await c10.newPage(), e10 = []; vigilar(p10, e10);
    await abrirApp(p10); await abrirPerfilCuerpo(p10); await suCuerpo(p10);
    const malos = [];
    for (const m of ['m', 'a', 'c', 'p']) {
      await p10.click('#tgc-modo-' + m); await p10.waitForTimeout(250);
      for (const dy of [10, 50, 90]) {
        await p10.evaluate(dy => {
          const pp = document.getElementById('perfil-panel'), cab = pp.querySelector('.tgp-top'), top = document.querySelector('#cuerpo-panel .tgc-top');
          pp.scrollTop += top.getBoundingClientRect().top - (cab.getBoundingClientRect().top + dy);
        }, dy);
        await p10.waitForTimeout(120);
        const r = await p10.evaluate(() => {
          const cab = document.querySelector('#perfil-panel .tgp-top'), tabs = document.getElementById('tgp-tabs'), mal = [];
          const rc = cab.getBoundingClientRect(), rt = tabs.getBoundingClientRect();
          for (const [x, y] of [[90, rc.top + rc.height / 2], [250, rc.top + rc.height / 2], [80, rt.top + rt.height / 2], [195, rt.top + rt.height / 2], [310, rt.top + rt.height / 2]]) {
            const e = document.elementFromPoint(x, y);
            if (!(e && (e.closest('.tgp-top') || e.closest('#tgp-tabs')))) mal.push(Math.round(x) + ',' + Math.round(y) + ' ' + (e ? (e.id || String(e.className) || e.tagName) : 'nada'));
          }
          return { mal, cuerpoDebajo: document.querySelector('#cuerpo-panel .tgc-top').getBoundingClientRect().top < rt.bottom };
        });
        if (!r.cuerpoDebajo) malos.push(m + ' ' + dy + ': la cabecera de «Su cuerpo» no llegó a pasar por debajo');
        r.mal.forEach(x => malos.push(m + ' ' + dy + ': ' + x));
      }
    }
    prueba('al bajar, la cabecera y las pestañas del perfil quedan encima de «Su cuerpo», en los cuatro modos', malos.length === 0, malos.slice(0, 4).join(' · '));
    /* y las dos esquinas de arriba de la barra, pegada: por fuera de su curva se ve el fondo de la
       cabecera, no lo que pasa por debajo (3 de noviembre de 2026: asomaba el borde del personaje
       en pequeño). Se mira en los pixeles de una captura: esos recortes no reciben toques */
    await p10.click('#tgc-modo-m'); await p10.waitForTimeout(250);
    await p10.evaluate(() => { const pp = document.getElementById('perfil-panel'), cab = pp.querySelector('.tgp-top'), top = document.querySelector('#cuerpo-panel .tgc-top');
      pp.scrollTop += top.getBoundingClientRect().top - (cab.getBoundingClientRect().top + 40); });
    await p10.waitForTimeout(300);
    const geo = await p10.evaluate(() => { const t = document.getElementById('tgp-tabs').getBoundingClientRect();
      return { x: t.left, y: t.top, r: t.right, pegada: document.getElementById('perfil-panel').classList.contains('tgp-con-barra'),
        fondo: getComputedStyle(document.documentElement).getPropertyValue('--dark').trim() }; });
    const y0 = Math.floor(geo.y), png = await p10.screenshot({ clip: { x: 0, y: y0, width: 390, height: 4 } });
    const px = await p10.evaluate(async ([b64, puntos]) => {
      const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
      const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
      const g = c.getContext('2d'); g.drawImage(img, 0, 0);
      return puntos.map(([x, y]) => Array.from(g.getImageData(x, y, 1, 1).data.slice(0, 3)));
    }, [png.toString('base64'), [[Math.round(geo.x + 1), Math.round(geo.y - y0 + 1)], [Math.round(geo.r - 2), Math.round(geo.y - y0 + 1)]]]);
    const hex = (geo.fondo.match(/^#([0-9a-f]{6})$/i) || [])[1], fondo = hex ? [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16)) : null;
    const igual = p => fondo && p.every((v, i) => Math.abs(v - fondo[i]) <= 6);
    prueba('con la barra pegada, por fuera de la curva de sus dos esquinas de arriba se ve el fondo de la cabecera (' + geo.fondo + '), no lo que pasa por debajo',
      geo.pegada && px.length === 2 && px.every(igual), JSON.stringify({ geo, px }));
    prueba('…sin errores de página', e10.length === 0, e10.join(' | '));
    await c10.close();
  }

  prueba('ningún error en toda la prueba', errores.length === 0, errores.join(' | '));
  console.log('\n  ' + (ok + mal) + ' controles, ' + (mal ? mal + ' en rojo' : 'todos en verde'));
  await b.close();
  process.exit(mal ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
