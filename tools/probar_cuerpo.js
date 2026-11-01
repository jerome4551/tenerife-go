#!/usr/bin/env node
/* probar_cuerpo.js — «Su cuerpo» dentro de la app: se abre desde la pestaña Cuerpo del perfil y
 * se usa de verdad, en los diez idiomas.
 *
 *     node tools/probar_cuerpo.js PUERTO
 *
 * Son las pruebas de la entrega del cuerpo (probar_prototipo.js: las del 24 de octubre de 2026 y,
 * desde el 31, las 166 del diseño nuevo), pasadas del prototipo a la app el 31 de octubre: el
 * idioma se cambia con setLang(); el ejemplo se escribe en tenerife.cuerpo como lo escribia el
 * prototipo (series inventadas, solo para la prueba), y su «Empezar vacío» lo quita; y la tarjeta
 * es la del perfil. Lo que solo tenia sentido en el prototipo, la pagina sin historial, se cambia
 * por lo de la app:
 *   - «Su cuerpo» va encima del perfil: el perfil queda inerte debajo, y Escape y «atras» cierran
 *     «Su cuerpo» y dejan el perfil abierto, en su pestaña Cuerpo (10);
 *   - si el modulo no llega, la tarjeta lo dice, y con red otra vez se abre (10b);
 *   - la seguridad (13): un fichero de ejercicios con HTML en un nombre y en un paso, y con
 *     enlaces javascript: y http: en las fuentes, no ejecuta nada: el nombre y el paso salen como
 *     texto y esos dos enlaces no salen; lo guardado con HTML, tampoco;
 *   - las fuentes en cada idioma (14): las notas que la entrega escribio en castellano en los
 *     titulos de las 961 fuentes («conjunto de datos», «folleto…», «barra»…) salen traducidas en
 *     los nueve idiomas, sin navegador (con la tabla y la funcion del propio modulo) y en una
 *     ficha de verdad en tres idiomas;
 *   - los menores (15): el prototipo escribe el año de nacimiento a mano en tenerife.perfil (4c);
 *     aqui se escribe en el formulario del perfil, el de verdad, y se guarda con su boton: con 15
 *     años, ni la marca del 10 ni su texto, y la recomendacion de su edad; con 30, o sin año, la
 *     marca vuelve.
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
/* la tarjeta «Su cuerpo» del perfil: «Abrir» */
async function tarjeta(pg) {
  await pg.click('#tgp-cuerpo-abrir');
  await pg.waitForFunction(() => window.TG_CUERPO && TG_CUERPO.abierto(), null, { timeout: 15000 });
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
  await abrirApp(pg); await abrirPerfilCuerpo(pg); await tarjeta(pg);

  // 1. arranca sin errores y con la pantalla abierta
  prueba('sin errores al abrir', errores.length === 0, errores.join(' | '));
  prueba('pantalla abierta', await pg.evaluate(() => TG_CUERPO.abierto() && !document.getElementById('cuerpo-panel').hidden));

  // 2. cada selector de TEXTOS da un solo elemento y cada clave existe en los 10 idiomas
  const r2 = await pg.evaluate(() => {
    const p = document.getElementById('cuerpo-panel'), malos = [];
    p.querySelectorAll('[data-tx],[data-tx-aria],[data-tx-ph]').forEach(n => ['data-tx', 'data-tx-aria', 'data-tx-ph'].forEach(at => { const k = n.getAttribute(at); if (k && !UI_TX[k]) malos.push('sin fila ' + k); }));
    return { n: p.querySelectorAll('[data-tx],[data-tx-aria]').length, ph: p.querySelectorAll('[data-tx-ph]').length, malos };
  });
  prueba('textos fijos puestos (77 elementos, con la línea de la IA, y 1 placeholder)', r2.n === 77 && r2.ph === 1, r2.n + '/' + r2.ph);
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
        const p = document.getElementById('cuerpo-panel');
        const vacios = [...p.querySelectorAll('#tgc [data-tx]')].filter(n => n.offsetParent !== null && !n.textContent.trim()).map(n => n.id || n.className);
        const anchos = [...p.querySelectorAll('#tgc *')].filter(n => n.offsetParent !== null && n.getBoundingClientRect().right > p.getBoundingClientRect().right + 0.5).map(n => n.id || n.className || n.tagName).slice(0, 5);
        return { vacios, anchos, sw: p.scrollWidth, cw: p.clientWidth, lang: p.getAttribute('lang') };
      });
      prueba(`${l}/${m}: sin textos vacíos`, r.vacios.length === 0, r.vacios.join(','));
      prueba(`${l}/${m}: sin desborde`, r.sw <= r.cw && r.anchos.length === 0, `${r.sw}>${r.cw} ${r.anchos.join(',')}`);
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

  // 5. la hoja: tocar el pecho en el dibujo, anotar, borrar y deshacer
  await pg.evaluate(() => { const z = document.querySelector('#tgc-cara-frente .tgf-z[data-g="pecho"]'); z.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
  await pg.waitForTimeout(300);
  prueba('la hoja se abre desde el dibujo', await pg.evaluate(() => !document.getElementById('tgc-hoja').hidden && document.getElementById('tgc-hoja-tit').textContent === 'Pecho'));
  prueba('el foco va a la hoja', await pg.evaluate(() => document.activeElement && document.activeElement.id === 'tgc-hoja-tit'));
  prueba('lo de debajo, inerte', await pg.evaluate(() => document.getElementById('tgc').inert === true));
  prueba('selección marcada en el dibujo', await pg.evaluate(() => document.querySelectorAll('#tgc-cara-frente .tgf-marca path').length > 0));
  prueba('la hoja lleva el maniquí con su grupo en oro', await pg.evaluate(() => {
    const z = [...document.querySelectorAll('#tgc-hoja-mini .tgf-z')];
    return z.length > 10 && z.filter(x => x.dataset.g === 'pecho').every(x => /-n3\)$/.test(x.getAttribute('fill'))) && z.filter(x => x.dataset.g !== 'pecho').every(x => /-n0\)$/.test(x.getAttribute('fill')));
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
  prueba('Escape cierra la hoja', await pg.evaluate(() => document.getElementById('tgc-hoja').hidden && TG_CUERPO.abierto()));
  prueba('lo de debajo vuelve a funcionar', await pg.evaluate(() => document.getElementById('tgc').inert === false));

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

  // 10. Escape y «atrás» cierran la pantalla; se vuelve al perfil, que sigue abierto en su pestaña Cuerpo
  await pg.keyboard.press('Escape'); await pg.waitForTimeout(200);
  prueba('Escape cierra la pantalla, y el perfil sigue abierto, en su pestaña Cuerpo y ya no inerte', await pg.evaluate(() => !TG_CUERPO.abierto() && document.getElementById('cuerpo-panel').hidden &&
    !document.getElementById('perfil-panel').hidden && TG_PERFIL.estado().pestana === 'cuerpo' && !document.getElementById('perfil-panel').inert));
  await tarjeta(pg);
  prueba('se vuelve a abrir desde la tarjeta del perfil, con el perfil inerte debajo', await pg.evaluate(() => TG_CUERPO.abierto() && document.getElementById('perfil-panel').inert === true));
  await pg.goBack(); await pg.waitForTimeout(250);
  prueba('«atrás» cierra la pantalla, y el perfil sigue abierto', await pg.evaluate(() => !TG_CUERPO.abierto() && !document.getElementById('perfil-panel').hidden));
  await pg.goBack(); await pg.waitForTimeout(250);
  prueba('otro «atrás» cierra el perfil, sin salir de la app', await pg.evaluate(() => document.getElementById('perfil-panel').hidden && typeof abrirPerfil === 'function') && pg.url().endsWith('/index.html'), pg.url());

  // 10b. (la app) si el módulo no llega, la tarjeta lo dice; con red otra vez, se abre
  {
    const c2 = await contexto(b), p2 = await c2.newPage(), e2 = []; vigilar(p2, e2);
    await p2.route('**/modulos/cuerpo.js', r => r.abort());
    await abrirApp(p2); await abrirPerfilCuerpo(p2);
    await p2.click('#tgp-cuerpo-abrir'); await p2.waitForTimeout(800);
    const r10b = await p2.evaluate(() => ({ aviso: !document.getElementById('tgp-cuerpo-error').hidden, txt: document.getElementById('tgp-cuerpo-error').textContent,
      cuerpo: !!window.TG_CUERPO, perfil: !document.getElementById('perfil-panel').hidden }));
    prueba('sin el módulo: la tarjeta lo dice y el perfil sigue abierto', r10b.aviso && /conexión/.test(r10b.txt) && !r10b.cuerpo && r10b.perfil, JSON.stringify(r10b));
    await p2.unroute('**/modulos/cuerpo.js');
    await p2.click('#tgp-cuerpo-abrir');
    await p2.waitForFunction(() => window.TG_CUERPO && TG_CUERPO.abierto(), null, { timeout: 15000 }).catch(() => {});
    prueba('…y con red otra vez, se abre y el aviso se va', await p2.evaluate(() => !!window.TG_CUERPO && TG_CUERPO.abierto() && document.getElementById('tgp-cuerpo-error').hidden));
    prueba('…sin errores de página', e2.filter(x => !/cuerpo\.js/.test(x)).length === 0, e2.join(' | '));
    await c2.close();
  }

  // 12. los ejercicios: lista del grupo, filtros, ficha, anotar desde la ficha, atrás por niveles
  await abrirApp(pg); await abrirPerfilCuerpo(pg); await tarjeta(pg);
  await ejemplo(pg); await pg.waitForTimeout(150);
  const datos = await pg.evaluate(async () => { const r = await fetch('datos/ejercicios.json'); return r.json(); });
  const datosEs = await pg.evaluate(async () => { const r = await fetch('datos/ejercicios-es.json'); return r.json(); });
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
    zonasPrim: document.querySelectorAll('#tgc-ej-figuras .tgf-z').length }));
  prueba('ficha: se abre', r12b.visible && r12b.foco === 'tgc-ej-nom' && r12b.etiqueta === 'tgc-ej-nom');
  prueba('ficha: nombre y pasos de los datos', r12b.nombre === datosEs[ej.id][0] && r12b.pasos === datosEs[ej.id][1].length, r12b.nombre);
  prueba('ficha: fuentes enlazadas, en otra pestaña y sin opener', r12b.enlaces.length === ej.f.length && r12b.enlaces.every(e => /^https:\/\//.test(e[0]) && e[1] === '_blank' && /noopener/.test(e[2])));
  prueba('ficha: el maniquí de frente y de espaldas', r12b.zonasPrim > 40);
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
  // «atrás» por niveles: ficha → grupo → pantalla
  await pg.click('.tgc-ej-fila[data-id="' + ej.id + '"]'); await pg.waitForTimeout(150);
  await pg.goBack(); await pg.waitForTimeout(200);
  prueba('«atrás» desde la ficha: el grupo', await pg.evaluate(() => !document.getElementById('tgc-hoja').hidden && document.getElementById('tgc-pag-ej').hidden));
  await pg.goBack(); await pg.waitForTimeout(200);
  prueba('«atrás» desde el grupo: la pantalla', await pg.evaluate(() => document.getElementById('tgc-hoja').hidden && TG_CUERPO.abierto()));
  // cerrar con la ficha abierta quita las dos entradas del historial de una vez
  const h1 = await pg.evaluate(() => history.length);
  await pg.click('.tgc-fila[data-g="' + grupoEj + '"]'); await pg.waitForSelector('.tgc-ej-fila');
  await pg.click('.tgc-ej-fila[data-id="' + ej.id + '"]'); await pg.waitForTimeout(150);
  await pg.click('#tgc-ej-cerrar'); await pg.waitForTimeout(250);
  prueba('cerrar desde la ficha: hoja cerrada y pantalla abierta', await pg.evaluate(() => document.getElementById('tgc-hoja').hidden && TG_CUERPO.abierto()));
  await pg.click('.tgc-fila[data-g="' + grupoEj + '"]'); await pg.waitForTimeout(150);
  await pg.goBack(); await pg.waitForTimeout(200);
  prueba('…y el historial sigue bien (atrás cierra la hoja, no la pantalla)', await pg.evaluate(() => document.getElementById('tgc-hoja').hidden && TG_CUERPO.abierto()));
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
    const dl = await pg.evaluate(async (l) => { const r = await fetch('datos/ejercicios-' + l + '.json'); return r.json(); }, l);
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
    await p3.route('**/datos/ejercicios.json', async r => {
      const res = await r.fetch(), d = JSON.parse(await res.text()), x = d.ejercicios.find(e => e.id === ID);
      x.f = [['malo', 'javascript:window.__xss=1'], ['inseguro', 'http://ejemplo.invalid/'], x.f[0]];
      await r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(d) });
    });
    await p3.route('**/datos/ejercicios-es.json', async r => {
      const res = await r.fetch(), d = JSON.parse(await res.text());
      d[ID][0] = '<img src=x onerror="window.__xss=2">Press malo';
      d[ID][1][0] = '<b onclick="window.__xss=3">paso</b> con marcas';
      await r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(d) });
    });
    await abrirApp(p3);
    await p3.evaluate(() => localStorage.setItem('tenerife.cuerpo', JSON.stringify({ v: 1, aspecto: { pelo: '<img src=x onerror="window.__xss=4">' },
      series: [{ d: '2026-10-20', g: 'pecho', n: 3, e: '<img src=x onerror="window.__xss=5">' }, { d: '2026-10-21', g: '<svg onload="window.__xss=6">', n: 2 }] })));
    await abrirPerfilCuerpo(p3); await tarjeta(p3);
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
    const d = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'datos', 'ejercicios.json'), 'utf8'));
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
  //     verdad: sin la marca del 10 ni su texto, y con la recomendación de su edad; con un año de
  //     adulto, o sin año, la marca vuelve
  {
    const c5 = await contexto(b), p5 = await c5.newPage(), e5 = []; vigilar(p5, e5);
    await abrirApp(p5); await abrirPerfilCuerpo(p5);
    const anio = await p5.evaluate(() => new Date().getFullYear());
    const conAnio = async (v) => {
      if (await p5.evaluate(() => !!(window.TG_CUERPO && TG_CUERPO.abierto()))) { await p5.keyboard.press('Escape'); await p5.waitForTimeout(250); }
      await p5.fill('#tgp-nac', v); await p5.click('#tgp-save'); await p5.waitForTimeout(200);
      const guardado = await p5.evaluate(() => (JSON.parse(localStorage.getItem('tenerife.perfil')) || {}).nacimiento);
      await tarjeta(p5);
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

  prueba('ningún error en toda la prueba', errores.length === 0, errores.join(' | '));
  console.log('\n  ' + (ok + mal) + ' controles, ' + (mal ? mal + ' en rojo' : 'todos en verde'));
  await b.close();
  process.exit(mal ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
