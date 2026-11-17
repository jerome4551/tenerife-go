#!/usr/bin/env node
/* auditar_escrituras.js — texto de un idioma escrito en el alfabeto de otro.
 *
 * EL HUECO QUE TAPA: auditar_sin_traducir.js busca el texto que no cambia al
 * cambiar de idioma, y barrido_idiomas.js que cada fila tenga sus diez
 * idiomas. Ninguno ve una fila que SÍ cambia, pero al idioma equivocado: el
 * 11 de noviembre de 2026, en chino tradicional, la categoría de las mascotas
 * salía en búlgaro («Зона за любимци 🐾», en ZHT_OVERRIDES.categories).
 *
 * COMO: con la página cargada, recorre LANGS y las tablas constantes de
 * index.html con las diez lenguas (LANGS[l], o {clave: {es, en, …}}), y marca
 * cirílico fuera del búlgaro y caracteres chinos fuera de zh y zht. Si no
 * llegan LANGS y UI_TX, o salen menos de 8000 textos (el 11 de noviembre,
 * 9268 en 13 tablas), es que la página no cargó: también falla.
 *
 * Y SIN NAVEGADOR (12 de noviembre de 2026), lo que la página no tiene al
 * cargar: las filas de diez idiomas de todo el fuente, con los módulos de
 * carga perezosa (tools/fuente.js: el tour, el cielo, el perfil, «Su cuerpo»,
 * el vídeo del entrenador, el SOS, el 3D…), y los ficheros de un idioma
 * (las fichas, las etiquetas, la política, el asistente, «Su cuerpo»…). Lo
 * mismo, y además EL NOMBRE: en búlgaro y en chino, Jérôme va en la forma de
 * su idioma («Жером», «热罗姆», «熱羅姆»), nunca en letra latina (Jérôme, 11 de
 * noviembre: «En la forma correcta de la traducción»). Lo trajo el vídeo del
 * entrenador, con seis textos así que nada vigilaba. Si salen menos filas o
 * textos de los que hay (el 12 de noviembre, 2745 filas y 156.765 textos en 88
 * ficheros), o falta un fichero, también falla.
 *
 *     node tools/auditar_escrituras.js [puerto]
 *     node tools/auditar_escrituras.js --sin-navegador     solo lo de sin navegador
 */
'use strict';
const fs = require('fs'), path = require('path');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const PUERTO = process.argv[2] && process.argv[2][0] !== '-' ? process.argv[2] : '8777';
const RAIZ = path.join(__dirname, '..');
// las tablas: cada «const|let|var NOMBRE =» y «window.NOMBRE =» de index.html con nombre en mayúsculas (UI_TX se hace
// con Object.assign, así que no basta con buscar «= {»)
const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
const TABLAS = [...new Set([...html.matchAll(/^\s*(?:(?:const|let|var) |window\.)([A-Z][A-Z0-9_]+) *=(?!=)/gm)].map(m => m[1]))];
const IMPRESCINDIBLES = ['LANGS', 'UI_TX'];
const L10 = ['es', 'en', 'fr', 'de', 'it', 'nl', 'zh', 'zht', 'bg', 'pl'];
const CIR = /[Ѐ-ӿ]/, CJK = /[㐀-鿿]/, NOMBRE = /j[eé]r[oô]me/i;
const escrituraMal = (l, s) => (l !== 'bg' && CIR.test(s)) || (l !== 'zh' && l !== 'zht' && CJK.test(s));
const nombreMal = (l, s) => (l === 'bg' || l === 'zh' || l === 'zht') && NOMBRE.test(s);
// los ficheros de un idioma (el castellano de las fichas y de las etiquetas vive en index.html)
const DE_UN_IDIOMA = l => ['idiomas/' + l + '.json', 'idiomas/etiquetas/' + l + '.json', 'idiomas/privacidad/' + l + '.json',
  'idiomas/borrar-cuenta/' + l + '.json', 'idiomas/cielo/' + l + '.json', 'faq/' + l + '.json', 'datos/cuerpo/ejercicios-' + l + '.json',
  'datos/cuerpo/asistente-' + l + '.json', 'datos/cuerpo/deportes-' + l + '.json'];
const NO_EXISTEN = new Set(['idiomas/es.json', 'idiomas/etiquetas/es.json']);

function sinNavegador() {
  let fallos = 0, filas = 0, textos = 0, ficheros = 0;
  const mal = [], mira = (l, s, donde) => {
    if (escrituraMal(l, s)) mal.push(l + ' · ' + donde + ' · en el alfabeto de otro idioma: «' + s.slice(0, 60) + '»');
    if (nombreMal(l, s)) mal.push(l + ' · ' + donde + ' · el nombre en letra latina: «' + s.slice(0, 60) + '»');
  };
  const F = require('./fuente');
  for (const m of F.html().matchAll(/^\s*"?([A-Za-z0-9_$-]+)"?\s*:\s*(\{"es": .*\}),?\s*$/gm)) {
    let d; try { d = JSON.parse(m[2]); } catch (e) { continue; }
    if (L10.filter(l => typeof d[l] === 'string').length < 8) continue;
    filas++;
    for (const l of L10) if (typeof d[l] === 'string') mira(l, d[l], m[1]);
  }
  for (const l of L10) for (const f of DE_UN_IDIOMA(l)) {
    const ruta = path.join(RAIZ, f);
    if (!fs.existsSync(ruta)) { if (!NO_EXISTEN.has(f)) { console.log('  FALLO  falta ' + f); fallos++; } continue; }
    ficheros++;
    const anda = (o, donde) => {
      if (typeof o === 'string') { textos++; mira(l, o, f + ' ' + donde); }
      else if (o && typeof o === 'object') for (const k of Object.keys(o)) anda(o[k], donde + '.' + k);
    };
    anda(JSON.parse(fs.readFileSync(ruta, 'utf8')), '');
  }
  console.log('sin navegador: ' + filas + ' filas de diez idiomas en todo el fuente · ' + textos + ' textos en ' + ficheros + ' ficheros de un idioma');
  if (filas < 2500 || textos < 150000) { console.log('  FALLO  menos filas o textos de los que hay: algo no se leyó'); fallos++; }
  if (mal.length) { fallos += mal.length; mal.forEach(x => console.log('  FALLO  ' + x)); }
  else console.log('  OK  ni un texto en el alfabeto de otro idioma, y el nombre en búlgaro y en chino en la forma de su idioma');
  return fallos;
}

if (process.argv.includes('--sin-navegador')) {
  const f = sinNavegador();
  console.log(f ? '\nEN ROJO: ' + f : '\ntodo en verde');
  process.exit(f ? 1 : 0);
}

(async () => {
  let fallos = sinNavegador();
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  try {
    const ctx = await b.newContext({ serviceWorkers: 'block' });
    await ctx.route('**/*', q => { const u = q.request().url(); return /^http:\/\/127\.0\.0\.1:\d+\//.test(u) || /^(data|blob):/.test(u) ? q.continue() : q.abort(); });
    const p = await ctx.newPage();
    const errs = []; p.on('pageerror', e => errs.push(String(e)));
    await p.goto('http://127.0.0.1:' + PUERTO + '/index.html', { waitUntil: 'load', timeout: 90000 });
    await p.waitForTimeout(2500);
    const r = await p.evaluate(TABLAS => {
      const CIR = /[Ѐ-ӿ]/, CJK = /[㐀-鿿]/, L10 = ['es', 'en', 'fr', 'de', 'it', 'nl', 'zh', 'zht', 'bg', 'pl'];
      const mal = (l, s) => (l !== 'bg' && CIR.test(s)) || (l !== 'zh' && l !== 'zht' && CJK.test(s));
      const out = [], vistos = new Set();
      let filas = 0, tablas = 0;
      const tabla = n => { try { return (0, eval)(n); } catch (e) { try { return window[n]; } catch (e2) { return undefined; } } };
      const vistas = [];
      function walk(o, l, ruta, prof) {
        if (prof > 6 || o == null) return;
        if (typeof o === 'string') { filas++; if (mal(l, o)) out.push(l + ' · ' + ruta + ' · «' + o.slice(0, 60) + '»'); return; }
        if (typeof o !== 'object' || vistos.has(o)) return; vistos.add(o);
        for (const k of Object.keys(o)) walk(o[k], l, ruta + '.' + k, prof + 1);
      }
      for (const n of TABLAS) {
        const v = tabla(n); if (!v || typeof v !== 'object') continue;
        if (L10.filter(l => l in v).length >= 8) { tablas++; vistas.push(n); for (const l of L10) if (v[l]) walk(v[l], l, n + '.' + l, 0); continue; }
        let es = false;
        for (const k of Object.keys(v).slice(0, 5000)) {
          const e = v[k];
          if (e && typeof e === 'object' && L10.filter(l => l in e).length >= 8) {
            es = true;
            for (const l of L10) if (typeof e[l] === 'string') { filas++; if (mal(l, e[l])) out.push(l + ' · ' + n + '.' + k + ' · «' + e[l].slice(0, 60) + '»'); }
          }
        }
        if (es) { tablas++; vistas.push(n); }
      }
      return { out, filas, tablas, vistas };
    }, TABLAS);
    console.log('tablas con las diez lenguas: ' + r.tablas + ' · textos mirados: ' + r.filas);
    const faltan = IMPRESCINDIBLES.filter(n => r.vistas.indexOf(n) < 0);
    if (faltan.length || r.filas < 8000) { console.log('  FALLO  la página no cargó sus tablas (faltan: ' + (faltan.join(', ') || 'ninguna') + '; textos: ' + r.filas + ')'); fallos++; }
    if (r.out.length) { fallos += r.out.length; r.out.forEach(x => console.log('  FALLO  ' + x)); }
    else console.log('  OK  ningún texto en el alfabeto de otro idioma (cirílico solo en búlgaro; chino solo en zh y zht)');
    if (errs.length) { console.log('  FALLO  errores de página: ' + errs.slice(0, 3).join(' | ')); fallos++; }
  } finally { await b.close(); }
  console.log(fallos ? '\nEN ROJO: ' + fallos : '\ntodo en verde');
  process.exit(fallos ? 1 : 0);
})();
