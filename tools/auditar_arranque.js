#!/usr/bin/env node
/* auditar_arranque.js — el texto que se queda en el idioma de ARRANQUE.
 *
 * EL HUECO QUE TAPA: auditar_sin_traducir.js pinta la pagina y luego llama a
 * setLang. Eso mide el CAMBIO de idioma, que es el camino que funciona. El
 * que falla es el otro: arrancar YA en un idioma. El idioma se resuelve al
 * principio del fichero y despues applyLateTexts() solo hace una pasada de
 * applyUiTx() -los nodos con data-tx-. Todo lo que setLang escribe leyendo
 * LANGS a mano (el rotulo de la capa del mapa, entre otros) no lo toca nadie
 * al arrancar, asi que se queda con el castellano que trae el marcado.
 *
 * No se ve nunca probando a mano, porque en cuanto tocas el selector de
 * idioma se arregla solo y ya no vuelve a pasar en esa sesion. Lo sufre
 * justo quien nunca toca el selector: el que entra con el movil en su idioma
 * y lo ve bien todo menos ese boton.
 *
 * COMO SE MIDE SIN ADIVINAR: se carga la pagina dos veces por idioma. Una
 * arrancando en el (localStorage tg_lang) y otra arrancando en castellano y
 * pidiendo el idioma con setLang. Lo que salga distinto entre las dos fotos
 * es texto que el arranque no repinta. No hace falta saber que textos son:
 * el propio setLang es la referencia.
 *
 *     node tools/auditar_arranque.js [puerto] [--lista]
 */
'use strict';
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const PUERTO = process.argv[2] && process.argv[2][0] !== '-' ? process.argv[2] : '8777';
const LISTA = process.argv.indexOf('--lista') !== -1;

const FOTO = () => {
  const FUERA = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE']);
  const camino = el => {
    const partes = [];
    for (let n = el; n && n.tagName && n.tagName !== 'BODY'; n = n.parentElement) {
      const i = n.parentElement ? [].indexOf.call(n.parentElement.children, n) : 0;
      partes.unshift(n.tagName + (n.id ? '#' + n.id : '') + ':' + i);
    }
    return partes.join('/');
  };
  const exento = el => !!(el.closest && el.closest('[data-sin-traducir]'));
  const out = {};
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = w.nextNode())) {
    const el = n.parentElement;
    if (!el || FUERA.has(el.tagName) || exento(el)) continue;
    const t = (n.textContent || '').replace(/\s+/g, ' ').trim();
    if (t.length < 2) continue;
    out[camino(el) + '#' + [].indexOf.call(el.childNodes, n)] = t;
  }
  for (const el of document.querySelectorAll('*')) {
    if (FUERA.has(el.tagName) || exento(el)) continue;
    for (const a of ['title', 'aria-label', 'placeholder', 'alt']) {
      const v = el.getAttribute(a);
      if (!v) continue;
      const t = v.replace(/\s+/g, ' ').trim();
      if (t.length >= 2) out[camino(el) + '@' + a] = t;
    }
  }
  return out;
};

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const url = 'http://127.0.0.1:' + PUERTO + '/index.html';

  /* Los idiomas salen del fuente, no de una lista aqui: el dia que entre uno
     nuevo este control lo mira sin que nadie se acuerde de tocarlo.
     Se lee del fichero, que es de donde lo leen los demas controles.

     Los de IDIOMAS_INCOMPLETOS se quedan fuera a proposito: setLang los
     rechaza y devuelve ingles, asi que pintarlos aqui solo mediria que el
     rechazo funciona, y de eso ya se encarga el control de datos. */
  const html = require('fs').readFileSync(
    require('path').join(__dirname, '..', 'index.html'), 'utf8');
  const lista = re => (html.match(re) || [, ''])[1]
    .split(',').map(x => x.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
  const SOP = lista(/SUPPORTED_LANGS\s*=\s*\[([^\]]*)\]/);
  const MEDIAS = lista(/IDIOMAS_INCOMPLETOS\s*=\s*\[([^\]]*)\]/);
  const IDIOMAS = SOP.filter(l => l !== 'es' && !MEDIAS.includes(l));
  if (!IDIOMAS.length) { console.log('no se encontro SUPPORTED_LANGS'); process.exit(1); }
  if (MEDIAS.length) console.log('  (a medias, no se miran: ' + MEDIAS.join(' ') + ')');

  async function pinta(lang, arrancando) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
    await ctx.addInitScript(l => {
      try { localStorage.setItem('tg_lang', l); } catch (e) {}
    }, arrancando ? lang : 'es');
    const p = await ctx.newPage();
    const errs = [];
    p.on('pageerror', e => errs.push(String(e)));
    await p.goto(url, { waitUntil: 'load' });
    await p.waitForTimeout(3200);
    if (!arrancando) {
      await p.evaluate(l => setLang(l), lang);
      await p.waitForTimeout(1200);
    }
    const f = await p.evaluate(FOTO);
    await ctx.close();
    return { f, errs };
  }

  console.log('=== texto que se queda en el idioma de arranque ===');
  let malos = 0, mirados = 0, errores = 0;
  const vistos = new Map();       // texto congelado -> idiomas donde pasa
  for (const lang of IDIOMAS) {
    const A = await pinta(lang, true);    // arranca en el idioma
    const B = await pinta(lang, false);   // arranca en es y cambia
    errores += A.errs.length + B.errs.length;
    let n = 0;
    for (const k in B.f) {
      if (!(k in A.f)) continue;          // el nodo no existe en las dos: no se compara
      mirados++;
      if (A.f[k] === B.f[k]) continue;
      n++;
      const clave = B.f[k] + '  <=  ' + A.f[k];
      if (!vistos.has(clave)) vistos.set(clave, []);
      vistos.get(clave).push(lang);
    }
    malos += n;
    console.log('  ' + lang.padEnd(4) + (n ? n + ' nodo(s) sin repintar' : 'igual que tras setLang'));
  }
  console.log('  nodos comparados............................. ' + mirados);
  console.log('  textos distintos al arrancar................. ' + vistos.size);
  console.log('  errores de pagina............................ ' + errores);
  if (vistos.size) {
    console.log('\n  deberia · se queda:');
    for (const [t, ls] of vistos) {
      console.log('   [' + ls.join(' ') + ']  ' + t.slice(0, 120));
      if (!LISTA && vistos.size > 12) break;
    }
  }
  await b.close();
  process.exit(vistos.size || errores ? 1 : 0);
})();
