#!/usr/bin/env node
/* auditar_sin_traducir.js — el texto que NO cambia al cambiar de idioma.
 *
 * EL HUECO QUE TAPA: auditar_seguridad.py mira literales de JavaScript y
 * auditar_web.js mira las tablas de idiomas. Ninguno de los dos ve el texto
 * escrito directamente en el marcado. Parte de ese texto es solo relleno que
 * applyUiTx() repinta al arrancar —y entonces no falla nada—, y parte no lo
 * repinta nadie: sale en castellano en los nueve idiomas.
 *
 * COMO SE DISTINGUEN SIN ADIVINAR: se pinta la pagina en castellano, se
 * apunta cada nodo de texto, se pide el bulgaro y se vuelve a mirar. El
 * bulgaro se escribe en cirilico, asi que lo traducido cambia de alfabeto.
 * Lo que sigue igual es, o un nombre propio (una playa, una linea de TITSA,
 * un pueblo), o un hueco. Los nombres propios se sacan de places[],
 * TITSA_LINES y el catalogo de paradas, no de una lista a mano.
 *
 *     node tools/auditar_sin_traducir.js [puerto] [--lista]
 */
'use strict';
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const PUERTO = process.argv[2] && process.argv[2][0] !== '-' ? process.argv[2] : '8777';
const LISTA = process.argv.indexOf('--lista') !== -1;

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('http://127.0.0.1:' + PUERTO + '/index.html', { waitUntil: 'load' });
  await p.waitForTimeout(3500);

  const foto = () => p.evaluate(() => {
    const FUERA = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE']);
    const camino = el => {
      const partes = [];
      for (let n = el; n && n.tagName && n.tagName !== 'BODY'; n = n.parentElement) {
        const i = n.parentElement ? [].indexOf.call(n.parentElement.children, n) : 0;
        partes.unshift(n.tagName + (n.id ? '#' + n.id : '') + ':' + i);
      }
      return partes.join('/');
    };
    const out = [];
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n, i = 0;
    while ((n = w.nextNode())) {
      const el = n.parentElement;
      if (!el || FUERA.has(el.tagName)) continue;
      const t = (n.textContent || '').replace(/\s+/g, ' ').trim();
      if (t.length < 2) continue;
      out.push({ k: camino(el) + '#' + (i++), t, id: el.id || el.className || el.tagName });
    }
    for (const el of document.querySelectorAll('*')) {
      if (FUERA.has(el.tagName)) continue;
      for (const a of ['title', 'aria-label', 'placeholder', 'alt']) {
        const v = el.getAttribute(a);
        if (!v) continue;
        const t = v.replace(/\s+/g, ' ').trim();
        if (t.length < 2) continue;
        out.push({ k: camino(el) + '@' + a, t, id: el.id || el.className || el.tagName, atr: a });
      }
    }
    return out;
  });

  await p.evaluate(() => { try { IDIOMAS_INCOMPLETOS.length = 0; } catch (e) {} setLang('es'); });
  await p.waitForTimeout(900);
  const a = await foto();
  await p.evaluate(() => setLang('bg'));
  await p.waitForTimeout(1200);
  const c = await foto();

  /* nombres propios: salen de los datos, no de una lista escrita a mano */
  const propios = await p.evaluate(() => {
    const s = new Set();
    const meter = x => { if (typeof x === 'string' && x.trim()) s.add(x.replace(/\s+/g, ' ').trim()); };
    try { places.forEach(pl => { meter(pl.nombre); meter(pl.municipio); }); } catch (e) {}
    try { TITSA_LINES.forEach(l => { meter(l.nombre); meter(String(l.numero)); }); } catch (e) {}
    try { Object.values(TITSA_PARADAS).forEach(q => meter(q.n)); } catch (e) {}
    return [...s];
  });
  const esPropio = t => {
    if (propios.includes(t)) return true;
    /* "Playa de Benijo · Anaga" y demas compuestos: si cada trozo es propio */
    const trozos = t.split(/\s*[·—–|>→,]\s*/).filter(x => x.length > 1);
    return trozos.length > 1 && trozos.every(x => propios.includes(x));
  };

  const antes = new Map(a.map(x => [x.k, x]));
  const quietos = [];
  for (const x of c) {
    const y = antes.get(x.k);
    if (!y || y.t !== x.t) continue;            // cambio: esta traducido
    if (/[Ѐ-ӿ]/.test(x.t)) continue;  // ya es cirilico
    if (esPropio(x.t)) continue;                // nombre propio
    if (!/[A-Za-zÀ-ÿ]{2,}/.test(x.t)) continue; // cifras, simbolos, emoji
    quietos.push(x);
  }
  const admin = await p.evaluate(() => {
    const e = document.querySelector('#admin-panel, #adminPanel, [id*="admin" i]');
    return e ? [...e.querySelectorAll('*')].map(x => x.id || x.className || x.tagName) : [];
  });
  const privId = await p.evaluate(() => {
    const e = document.querySelector('#privacy-panel, #privacyPanel, [id*="privacy" i]');
    return e ? [...e.querySelectorAll('*')].map(x => x.id || x.className || x.tagName) : [];
  });
  const zona = x => admin.includes(x.id) ? 'admin' : privId.includes(x.id) ? 'privacidad' : 'interfaz';
  const grupo = { interfaz: [], privacidad: [], admin: [] };
  quietos.forEach(x => grupo[zona(x)].push(x));

  const P = (t, v) => console.log('  ' + String(t).padEnd(46, '.') + ' ' + v);
  console.log('=== texto que no cambia de es a bg y no es nombre propio ===');
  P('nodos de texto y atributos mirados', c.length);
  P('nombres propios reconocidos', propios.length);
  P('en la interfaz', grupo.interfaz.length);
  P('en la politica de privacidad (aparte)', grupo.privacidad.length);
  P('en el panel de administrador (no cuenta)', grupo.admin.length);
  P('errores de pagina', errs.length);
  if (LISTA) for (const z of ['interfaz', 'privacidad'])
    grupo[z].forEach(x => console.log('   ' + z.padEnd(11) + (x.atr || 'texto').padEnd(11) + String(x.id).slice(0, 24).padEnd(26) + x.t.slice(0, 58)));
  if (grupo.interfaz.length) console.log('      <--  MAL: eso sale igual en los nueve idiomas');
  process.exitCode = grupo.interfaz.length ? 1 : 0;
  await b.close();
})();
