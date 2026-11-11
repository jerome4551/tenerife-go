#!/usr/bin/env node
/* auditar_entrenador.js — Jérôme, el entrenador: el vídeo de cada ejercicio de «Su cuerpo»
 * (modulos/entrenador.js, 11 de noviembre de 2026).
 *
 *     python3 -m http.server 8766 &      (desde la raíz del repo)
 *     node tools/auditar_entrenador.js 8766
 *
 * 1. Sin navegador:
 *    · el módulo es el que sale de sus fuentes (tools/entrenador/construir.py --comprobar);
 *    · cada coreografía es de un ejercicio que existe, y tiene un tramo por cada paso de su ficha,
 *      en los diez idiomas;
 *    · LA FICHA NO HA CAMBIADO desde que se hizo la coreografía: la huella de sus pasos en
 *      castellano es la apuntada (si cambia un paso, la coreografía se revisa antes de volver a
 *      construir; mientras tanto esto queda en rojo);
 *    · cada coreografía, por dentro: las posturas que nombra existen, lo clavado se entiende, el
 *      material es de los que hay, y ninguna postura clave da un número imposible ni mete un pie
 *      bajo el suelo;
 *    · los textos propios (TG_ENTRENADOR.textos), en los diez idiomas y con sus {huecos};
 *    · el módulo: sin eval, sin console.log, y sin innerHTML que reciba un texto de la ficha;
 *    · los enganches: el CARGA-PEREZOSA y la ruta en index.html, el precache y «red primero» en
 *      sw.js, y la ficha de modulos/cuerpo.js (el hueco del vídeo, y que se quita al salir).
 * 2. En Chromium, móvil emulado (320 de ancho, el más estrecho): el vídeo de CADA ejercicio, entero,
 *    cuadro a cuadro, en castellano y en otro idioma (los nueve van rotando): acaba, dura lo que
 *    tiene que durar, lo que se lee en cada paso es el paso de la ficha, palabra por palabra, no
 *    hay ningún NaN en el dibujo y nada se sale de ancho.
 * 3. En la app de verdad: «Su cuerpo» → un grupo → una ficha con coreografía: el vídeo sale, no
 *    arranca solo, se pone en marcha al tocarlo, sigue al cambiar de tema, no se reinicia al
 *    guardar unas series y se quita al volver; en una ficha sin coreografía no sale nada.
 * Cero errores de página. Sale con 1 si algo falla.
 */
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process'), crypto = require('crypto'), vm = require('vm');
const RAIZ = path.join(__dirname, '..');
const PUERTO = process.argv[2] || '8766';
const SITIO = 'http://127.0.0.1:' + PUERTO + '/';
const LANGS = ['es', 'en', 'fr', 'de', 'it', 'nl', 'zh', 'zht', 'bg', 'pl'];
const HUECO = /\{(\w+)\}/g;
let fallos = 0, hechos = 0;
function ok(c, txt, det) { hechos++; if (c) console.log('  OK  ' + txt); else { fallos++; console.log('  MAL ' + txt + (det !== undefined ? '   -> ' + (typeof det === 'string' ? det : JSON.stringify(det)) : '')); } }
function info(txt) { console.log('  ··  ' + txt); }
const lee = f => fs.readFileSync(path.join(RAIZ, f), 'utf8');
const huella = pasos => crypto.createHash('sha256').update(pasos.join('\n'), 'utf8').digest('hex').slice(0, 12);

(async () => {
  console.log('════ 1. el módulo, las coreografías y los enganches (sin navegador) ════');
  const mod = lee('modulos/entrenador.js');
  const cons = cp.spawnSync('python3', [path.join(RAIZ, 'tools', 'entrenador', 'construir.py'), '--comprobar'], { encoding: 'utf8' });
  ok(cons.status === 0, 'modulos/entrenador.js es el que sale de tools/entrenador/src/ (construir.py --comprobar)', (cons.stdout || cons.stderr || '').trim().slice(0, 200));
  /* el módulo, cargado sin navegador: solo define cosas */
  const caja = { window: {}, document: {}, Math, Object, Array, JSON, String, Number, RegExp, Error, console: { log() {} } };
  vm.runInNewContext(mod, caja, { filename: 'modulos/entrenador.js' });
  const E = caja.window.TG_ENTRENADOR;
  ok(E && typeof E.tiene === 'function' && typeof E.montar === 'function' && typeof E.ids === 'function', 'TG_ENTRENADOR: tiene, montar, ids');
  const ids = E.ids(), T = E._;
  const EJ = {}; JSON.parse(lee('datos/cuerpo/ejercicios.json')).ejercicios.forEach(e => { EJ[e.id] = e; });
  const TX = {}; LANGS.forEach(l => { TX[l] = JSON.parse(lee('datos/cuerpo/ejercicios-' + l + '.json')); });
  info(ids.length + ' ejercicios con vídeo, de ' + Object.keys(EJ).length);
  ok(ids.length > 0 && ids.every(id => EJ[id]), 'cada coreografía es de un ejercicio que existe', ids.filter(id => !EJ[id]));
  const sinPasos = [], otraFicha = [];
  ids.forEach(id => {
    const n = (T.COREO[id].pasos || []).length;
    LANGS.forEach(l => { const t = TX[l][id]; if (!t || !Array.isArray(t[1]) || t[1].length !== n) sinPasos.push(id + ' (' + l + ': ' + (t && t[1] ? t[1].length : 'no está') + ' pasos, la coreografía ' + n + ')'); });
    if (TX.es[id] && E.huellas[id] !== huella(TX.es[id][1])) otraFicha.push(id);
  });
  ok(!sinPasos.length, 'cada coreografía tiene un tramo por cada paso de su ficha, en los diez idiomas', sinPasos.slice(0, 6));
  ok(!otraFicha.length && Object.keys(E.huellas).length === ids.length, 'las fichas no han cambiado desde que se hicieron sus coreografías (la huella de los pasos en castellano)', otraFicha);
  ok(ids.every(id => E.tiene(id, TX.es[id][1].length)) && !E.tiene(ids[0], TX.es[ids[0]][1].length + 1) && !E.tiene('no-existe') && !E.tiene('toString') && !E.tiene('constructor'),
    'tiene(id, pasos): sí con los pasos de la ficha; no con otros, ni con un ejercicio sin coreografía');
  /* cada coreografía, por dentro */
  const mal = [];
  const CLAVO = /^([mt][id])(?:@(\d+):(-?[\d.]+))?(?:=(-?[\d.]+),(-?[\d.]+),(-?[\d.]+))?$/;
  const finito = v => Array.isArray(v) && v.length === 3 && v.every(q => typeof q === 'number' && isFinite(q));
  ids.forEach(id => {
    const co = T.COREO[id], P = co.posturas || {}, hay = n => typeof n === 'string' && !!P[n], peros = [];
    const usadas = new Set(), clavos = [].concat(co.clavos || []);
    const tramos = l => (l || []).forEach(s => { usadas.add(s[0]); if (s[1] != null && !(s[1] > 0)) peros.push('un tramo sin duración'); if (s[2] != null && !T.CURVA[s[2]]) peros.push('curva ' + s[2]); if (s[3]) s[3].forEach(c => clavos.push(c)); });
    usadas.add(co.inicio || 'a'); tramos(co.rep);
    (co.pasos || []).forEach(p => { if (typeof p === 'string') { if (p !== 'rep' && p !== 'nota') usadas.add(p); } else if (p && p.sec) { if (p.desde) usadas.add(p.desde); tramos(p.sec); } else if (!(p && p.rep != null)) peros.push('un paso que no se entiende'); });
    ['encuadra', 'reposo', 'sinClavos'].forEach(k => (co[k] || []).forEach(n => usadas.add(n)));
    if (co.isometrico) usadas.add(co.isometrico);
    usadas.forEach(n => { if (!hay(n)) peros.push('postura «' + n + '» no existe'); });
    if ((co.pasos || []).some(p => p === 'rep' || (p && p.rep != null)) && !(co.rep || []).length) peros.push('pasos con repetición, sin repetición');
    clavos.forEach(c => { const m = CLAVO.exec(c); if (!m) peros.push('clavo ' + c); else if (m[2] != null && !(co.material || [])[Number(m[2])]) peros.push('clavo ' + c + ': no hay ese material'); });
    (co.esfuerzo || []).forEach(i => { if (!(i >= 0 && i < (co.rep || []).length)) peros.push('esfuerzo ' + i); });
    if (co.rastro && !T.PUNTOS[co.rastro]) peros.push('rastro ' + co.rastro);
    (co.material || []).forEach(m => { if (!T.MATERIAL[m[0]]) peros.push('material ' + m[0]); });
    if (!Array.isArray(co.vista) || co.vista.length < 1 || co.vista.length > 2 || !co.vista.every(v => typeof v === 'number')) peros.push('vista');
    /* las posturas clave: todo número, y los pies no bajan del suelo (ni de lo que pisan) */
    Object.keys(P).forEach(n => {
      let S; try { S = T.resolver(P[n]); } catch (e) { peros.push('postura ' + n + ': ' + e.message); return; }
      ['i', 'd'].forEach(k => {
        ['hom', 'cod', 'mun', 'cad', 'rod', 'tob', 'talon', 'dedosPie', 'dedos'].forEach(q => { if (!finito(S[k][q])) peros.push('postura ' + n + ': ' + q + ' ' + k + ' sin número'); });
        /* la zapatilla, como se dibuja (20-figura.js): dos bolas, la del talón y la de la puntera, y la suela 1,7 cm más abajo; plana pisa a −2,0 */
        if (finito(S[k].suela) && finito(S[k].punta) && finito(S[k].arriba)) {
          const en = (a, u) => S[k].suela[1] + S[k].punta[1] * a + S[k].arriba[1] * u, bajo = Math.min(en(-2.2, 5.0) - 5.3, en(13.8, 3.8) - 3.9) - 1.7 * Math.abs(S[k].arriba[1]);
          if (bajo < -3.2) peros.push('postura ' + n + ': la zapatilla ' + k + ' se hunde ' + (-bajo).toFixed(1) + ' cm en el suelo');
        }
      });
      if (!finito(S.pel) || !finito(S.cab)) peros.push('postura ' + n + ': el tronco sin número');
    });
    if (peros.length) mal.push(id + ': ' + Array.from(new Set(peros)).slice(0, 4).join('; '));
  });
  ok(!mal.length, 'las ' + ids.length + ' coreografías, por dentro: posturas, tramos, clavos, material, y ninguna postura imposible', mal.slice(0, 6));
  /* los textos propios */
  const filas = Object.keys(E.textos), cojos = [];
  filas.forEach(k => {
    const f = E.textos[k], h = (f.es || '').match(HUECO) || [];
    LANGS.forEach(l => {
      const v = f[l];
      if (typeof v !== 'string' || !v.trim()) { cojos.push(k + ' (' + l + ')'); return; }
      const hv = v.match(HUECO) || [];
      if (hv.slice().sort().join() !== h.slice().sort().join()) cojos.push(k + ' (' + l + '): huecos');
      if (/"/.test(v)) cojos.push(k + ' (' + l + '): comillas dobles ASCII');
    });
  });
  ok(filas.length >= 20 && !cojos.length, 'los textos del vídeo (' + filas.length + ' filas), en los diez idiomas y con sus {huecos}', cojos.slice(0, 6));
  ok(LANGS.every(l => /Jérôme/.test(E.textos.entCon[l])) && !/\bJero\b/.test(mod.replace(/\/\*[\s\S]*?\*\//g, '')), 'el personaje se llama Jérôme en los diez idiomas (y ya no «Jero»)');
  ok(!/\beval\s*\(|new Function|console\.log/.test(mod), 'el módulo: sin eval, sin new Function, sin console.log');
  const conHtml = mod.split('\n').filter(l => /\.innerHTML\s*=/.test(l));
  ok(conHtml.length > 0 && conHtml.every(l => !/datos\.|\.texto|\bnombre\b|pasos|etiquetas|\btx\b/.test(l.replace(/\/\*.*?\*\//g, ''))), 'innerHTML (' + conHtml.length + ' veces) solo recibe dibujos e iconos del propio módulo, nunca un texto de la ficha',
    conHtml.filter(l => /datos\.|\.texto|\bnombre\b|pasos|etiquetas|\btx\b/.test(l)).map(l => l.trim().slice(0, 90)));
  /* los enganches */
  const idx = lee('index.html'), sw = lee('sw.js'), cuerpo = lee('modulos/cuerpo.js');
  ok((idx.match(/CARGA-PEREZOSA: modulos\/entrenador\.js/g) || []).length === 1, 'index.html declara CARGA-PEREZOSA: modulos/entrenador.js, una vez');
  ok(/window\.TG_CUERPO_ENTRENADOR = '\.\/modulos\/entrenador\.js';/.test(idx), 'index.html da la ruta del módulo (TG_CUERPO_ENTRENADOR)');
  const core = (/const CORE = \[([\s\S]*?)\n\];/.exec(sw) || [])[1] || sw;
  ok(core.includes("'./modulos/entrenador.js'"), 'sw.js: el módulo está en el precache (sale sin conexión desde el primer día)');
  ok(/url\.pathname\.endsWith\('\/modulos\/entrenador\.js'\)/.test(sw), 'sw.js: y «red primero», como modulos/cuerpo.js (una coreografía corregida llega a quien ya lo tenía)');
  ok(/id="tgc-ej-video" hidden/.test(cuerpo) && /function videoEj\(/.test(cuerpo) && /E\.tiene\(x\.id, t\.pasos\.length\)/.test(cuerpo), 'modulos/cuerpo.js: el hueco del vídeo en la ficha, y solo con los pasos con los que se coreografió');
  ok((cuerpo.match(/quitarVideoEj\(\);/g) || []).length >= 3, 'modulos/cuerpo.js: el vídeo se quita al volver a la lista y al cerrar la hoja');
  ok(!/videoEjR\.reproducir\(|auto: true/.test(cuerpo), 'modulos/cuerpo.js: el vídeo no arranca solo');

  let chromium;
  try { chromium = require('playwright').chromium; } catch (e) {
    try { chromium = require('/opt/node22/lib/node_modules/playwright').chromium; } catch (e2) { chromium = require('/opt/npm-tools/node_modules/playwright').chromium; }
  }
  const opc = { args: ['--no-sandbox', '--disable-gpu'] };
  if (fs.existsSync('/usr/bin/google-chrome')) opc.executablePath = '/usr/bin/google-chrome';
  const nav = await chromium.launch(opc);
  const errores = [];
  const vigila = pg => { pg.on('pageerror', e => errores.push(String(e).slice(0, 200))); pg.on('console', m => { if (m.type() === 'error' && !/ERR_|Failed to load resource/.test(m.text())) errores.push('consola: ' + m.text().slice(0, 200)); }); };

  console.log('\n════ 2. el vídeo de cada ejercicio, entero (Chromium, 320 de ancho) ════');
  {
    const ctx = await nav.newContext({ viewport: { width: 320, height: 640 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
    const pg = await ctx.newPage(); vigila(pg);
    await pg.goto(SITIO + 'tools/entrenador/pruebas/auditoria.html');
    const total = await pg.evaluate(l => window.preparar(l), LANGS);
    info('datos de ' + total + ' ejercicios');
    const peros = []; let pasados = 0, cuadros = 0;
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      for (const l of ['es', LANGS[1 + (i % 9)]]) {
        const m = await pg.evaluate(a => window.montar(a[0], a[1], a[2]), [id, l, i % 2 ? 'noche' : 'dia']);
        if (!m) { peros.push(id + ' (' + l + '): no se monta'); continue; }
        const r = await pg.evaluate(() => window.entero());
        const esperados = Math.round(m.dur * 30), q = [];
        if (!r.fin) q.push('no acaba');
        /* cada tramo acaba en el primer cuadro que pasa de su duración: uno de más por tramo, como mucho */
        if (r.cuadros < esperados || r.cuadros > esperados + m.pasos.length + 3) q.push('dura ' + r.cuadros + ' cuadros y no ' + esperados);
        m.pasos.forEach((p, k) => { if (typeof r.leido[k] !== 'string' || !r.leido[k].endsWith(p)) q.push('el paso ' + (k + 1) + ' no se lee tal cual'); });
        if (r.titulo !== (E.textos.entTurno[l])) q.push('el cierre');
        if (r.raros) q.push(r.raros + ' cuadros con NaN en el dibujo');
        if (r.nodos < 40) q.push('el dibujo, casi vacío (' + r.nodos + ' nodos)');
        if (r.ancho > r.vista) q.push('se sale de ancho: ' + r.ancho + ' > ' + r.vista);
        if (r.modos.indexOf('busto') < 0) q.push('sin plano de cerca');
        if (q.length) peros.push(id + ' (' + l + '): ' + q.join('; ')); else pasados++;
        cuadros += r.cuadros;
      }
    }
    ok(!peros.length && pasados === ids.length * 2, 'los ' + ids.length + ' vídeos, enteros, en castellano y en otro idioma (' + pasados + ' pases, ' + cuadros + ' cuadros): acaban, duran lo suyo, se lee el paso de la ficha palabra por palabra, sin NaN y sin salirse de ancho', peros.slice(0, 8));
    /* con «reducir movimiento»: se monta y se pasa igual */
    const ctx2 = await nav.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', serviceWorkers: 'block' });
    const pg2 = await ctx2.newPage(); vigila(pg2);
    await pg2.goto(SITIO + 'tools/entrenador/pruebas/auditoria.html');
    await pg2.evaluate(l => window.preparar(l), ['es']);
    const m2 = await pg2.evaluate(a => window.montar(a, 'es', 'dia'), ids[0]), r2 = await pg2.evaluate(() => window.entero());
    ok(!!m2 && r2.fin && !r2.raros, 'con «reducir movimiento» del sistema: el vídeo se monta y se pasa entero');
    await ctx.close(); await ctx2.close();
  }

  console.log('\n════ 3. en la app: la ficha de un ejercicio ════');
  {
    const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
    const pg = await ctx.newPage(); vigila(pg);
    const Q = (f, a) => pg.evaluate(f, a), espera = ms => pg.waitForTimeout(ms);
    await pg.goto(SITIO + 'index.html', { waitUntil: 'domcontentloaded' });
    await espera(2500);
    await Q(() => { const l = document.querySelector('.v19-w-lang[data-lang="es"]'); if (l) l.click(); }); await espera(300);
    await Q(() => { const s = document.getElementById('v19-welcome-start'); if (s) s.click(); }); await espera(1500);
    const abierto = await Q(() => window.abrirCuerpo().then(() => true, () => false)); await espera(2500);
    ok(abierto, '«Su cuerpo» se abre');
    const conVideo = ids.filter(id => EJ[id].g[0] === 'pecho')[0] || ids[0], grupo = EJ[conVideo].g[0];
    await Q(g => document.querySelector('#cuerpo-panel .tgc-fila[data-g="' + g + '"]').click(), grupo); await espera(1800);
    ok(await Q(() => !window.TG_ENTRENADOR), 'el módulo no se pide hasta abrir una ficha');
    await Q(id => document.querySelector('#tgc-ej-lista .tgc-ej-fila[data-id="' + id + '"]').click(), conVideo); await espera(1800);
    const v = await Q(() => { const c = document.getElementById('tgc-ej-video'), r = c.getBoundingClientRect(), h = document.getElementById('tgc-hoja').getBoundingClientRect(); return { ve: !c.hidden, n: c.querySelectorAll('.tgv').length, ancho: r.width, dentro: r.left >= h.left - 1 && r.right <= h.right + 1, suena: !!c.querySelector('.tgv-gran') && !c.querySelector('.tgv-gran').hidden }; });
    ok(v.ve && v.n === 1 && v.ancho > 250 && v.dentro, 'la ficha de «' + conVideo + '» trae su vídeo, dentro de la hoja', v);
    ok(v.suena, 'no arranca solo: espera con su botón');
    await Q(() => document.querySelector('#tgc-ej-video .tgv-gran').click()); await espera(1200);
    ok(await Q(() => document.querySelector('#tgc-ej-video .tgv-gran').hidden && parseFloat(document.querySelector('#tgc-ej-video .tgv-barras b').style.width) > 0), 'al tocarlo, se pone en marcha');
    const temaAntes = await Q(() => document.getElementById('cuerpo-panel').getAttribute('data-tema'));
    await Q(() => document.getElementById('tgc-tema').click()); await espera(600);
    const temas = await Q(() => [document.getElementById('cuerpo-panel').getAttribute('data-tema'), document.querySelector('#tgc-ej-video .tgv').getAttribute('data-tema')]);
    ok(temas[0] !== temaAntes && temas[0] === temas[1], 'al cambiar de tema, el vídeo cambia con la pantalla (y no se reinicia)', temas);
    await Q(() => { document.querySelector('#tgc-ej-video .tgv').setAttribute('data-marca', '1'); document.getElementById('tgc-ej-guardar').click(); }); await espera(800);
    ok(await Q(() => { const r = document.querySelectorAll('#tgc-ej-video .tgv'); return r.length === 1 && r[0].getAttribute('data-marca') === '1'; }), 'guardar unas series no reinicia el vídeo');
    await Q(() => document.getElementById('tgc-ej-volver').click()); await espera(600);
    ok(await Q(() => document.getElementById('tgc-ej-video').hidden && !document.querySelector('.tgv')), 'al volver a la lista, el vídeo se quita');
    const sin = await Q(() => { const f = Array.from(document.querySelectorAll('#tgc-ej-lista .tgc-ej-fila')).filter(b => !window.TG_ENTRENADOR.tiene(b.dataset.id))[0]; if (!f) return ''; f.click(); return f.dataset.id; }); await espera(900);
    ok(!sin || await Q(() => document.getElementById('tgc-ej-video').hidden && !document.querySelector('.tgv')), 'en una ficha sin coreografía («' + sin + '») no sale nada: queda como estaba');
    await ctx.close();
  }
  await nav.close();
  ok(!errores.length, 'cero errores de página', errores.slice(0, 5));
  console.log('\n' + (fallos ? '  ' + fallos + ' de ' + hechos + ' controles EN ROJO' : '  ' + hechos + ' controles, todos en verde'));
  process.exit(fallos ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
