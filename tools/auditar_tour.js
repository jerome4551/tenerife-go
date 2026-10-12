#!/usr/bin/env node
/* auditar_tour.js — el tour de bienvenida, entero, en los diez idiomas.
 *
 * POR QUE EXISTE. El 11 de octubre de 2026 Jerome pidio rehacer el tour
 * («añadimos cosas») y «verifica que se traduce en cada idioma. Sin
 * errores». El tour de antes llevaba los pasos en listas dentro de un objeto
 * propio, y ningun control de idioma las leia: un mes diciendo «mas de 700
 * lugares verificados» con 975 en el mapa. Ahora los textos son filas de
 * UI_TX (las leen los controles de idioma) y esto mira lo que solo se ve
 * abriendolo: el tour de verdad, en un navegador.
 *
 * QUE HACE, por idioma:
 *   · entra como alguien nuevo (elige el idioma en la bienvenida y pulsa
 *     «Comenzar»): tiene que salir la pregunta del tour;
 *   · lo recorre con «Siguiente» en cuatro tamaños de movil (320×568,
 *     360×640, 390×844, 412×915) y en cada paso mira:
 *       - texto sin {…} por sustituir, sin «undefined», «NaN» ni «null»;
 *       - que el boton del paso se enfoque (el foco no queda en el centro);
 *       - que la tarjeta quepa entera en la pantalla, que no se salga nada
 *         por dentro y que no tape el boton que señala;
 *       - las cifras que se cuentan: los lugares del mapa, los idiomas, las
 *         costas del panel del mar y los pasos;
 *   · los pasos de Rutas abren el panel en su pestaña: se espera a que haya
 *     entrado (data-listo) para medir, y al terminar o saltar el tour el
 *     panel tiene que quedar cerrado;
 *   · al terminar, que quede guardada la version del tour;
 *   · quien vio el tour viejo (guardado «1») ve «novedades» con la etiqueta.
 * Y al final, entre idiomas: ningun texto puede ser igual que el castellano
 * (en los otros nueve) ni que el ingles (en los otros ocho). tx() cae al
 * ingles si a una fila le falta el idioma: sin esta comparacion, una fila
 * sin polaco saldria en ingles y todo lo demas daria verde.
 *
 *     node tools/auditar_tour.js [puerto]            (auditar.sh levanta el servidor)
 *     node tools/auditar_tour.js [puerto] pl,de      solo esos (mas castellano e ingles,
 *                                                    que son contra los que se compara)
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const PUERTO = process.argv[2] || '8766';
const RAIZ = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
const TODOS = ((html.match(/SUPPORTED_LANGS\s*=\s*\[([^\]]*)\]/) || [, ''])[1])
  .split(',').map(x => x.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
const SOLO = (process.argv[3] || '').split(',').filter(Boolean);
const IDIOMAS = SOLO.length ? TODOS.filter(l => SOLO.includes(l) || l === 'es' || l === 'en') : TODOS;
if (!TODOS.length) { console.error('no encuentro SUPPORTED_LANGS en index.html'); process.exit(2); }
const TAMANOS = [[320, 568], [360, 640], [390, 844], [412, 915]];

/* lo que el paso enseña, leido de la pagina */
const LEER = () => {
  const r = document.getElementById('v19-tour');
  const card = r.querySelector('.v19t-card'), hole = r.querySelector('.v19t-hole');
  const cr = card.getBoundingClientRect();
  /* el foco se mueve con una transicion de 0,35 s: se para un instante para
     medir donde ACABA, no por donde va */
  hole.style.transition = 'none'; void hole.offsetWidth;
  const hr = hole.getBoundingClientRect();
  hole.style.transition = '';
  const hueco = hole.classList.contains('none') ? null : { left: hr.left, top: hr.top, right: hr.right, bottom: hr.bottom };
  const sale = [...card.querySelectorAll('h3, p, button, .v19t-cab')]
    .filter(e => e.offsetParent && e.scrollWidth > e.clientWidth + 1).map(e => e.className || e.tagName);
  const txt = s => (card.querySelector(s) || {}).textContent || '';
  /* un boton partido en dos lineas: sus trozos de texto caen a alturas distintas */
  const partidos = [...card.querySelectorAll('button')].filter(b => b.offsetParent).filter(b => {
    const rg = document.createRange(); rg.selectNodeContents(b);
    return new Set([...rg.getClientRects()].map(x => Math.round(x.top))).size > 1; }).map(b => b.textContent);
  /* el hueco «none» tiene que quedar a cero: si no, se ve sin oscurecer lo que
     señalaba el paso anterior */
  const fantasma = hole.classList.contains('none') && hr.width > 1;
  return {
    titulo: txt('h3'), cuerpo: txt('p'), num: txt('.v19t-num'),
    nuevo: getComputedStyle(card.querySelector('.v19t-nuevo')).display !== 'none' ? txt('.v19t-nuevo') : '',
    botones: [...card.querySelectorAll('button')].filter(b => b.offsetParent && getComputedStyle(b).visibility !== 'hidden').map(b => b.textContent),
    tarjeta: { left: cr.left, top: cr.top, right: cr.right, bottom: cr.bottom },
    hueco, sale, partidos, fantasma, vw: innerWidth, vh: innerHeight
  };
};

function problemasDelPaso(L, tam, i, d, cifras) {
  const out = [], donde = L + ' ' + tam + ' paso ' + (i + 1);
  const todo = [d.titulo, d.cuerpo, d.nuevo].concat(d.botones).join(' ¦ ');
  if (!d.titulo.trim() || !d.cuerpo.trim()) out.push(donde + ': texto vacio');
  if (/[{}]|undefined|NaN|null/.test(todo)) out.push(donde + ': texto roto «' + todo.slice(0, 90) + '»');
  if (d.num !== (i + 1) + '/' + cifras.S) out.push(donde + ': contador «' + d.num + '»');
  const t = d.tarjeta;
  if (t.left < -1 || t.top < -1 || t.right > d.vw + 1 || t.bottom > d.vh + 1)
    out.push(donde + ': la tarjeta se sale de la pantalla (' + [t.left, t.top, t.right, t.bottom].map(Math.round).join(',') + ' en ' + d.vw + '×' + d.vh + ')');
  if (d.sale.length) out.push(donde + ': se sale el texto de ' + d.sale.join(', '));
  if (d.partidos.length) out.push(donde + ': boton partido en dos lineas: ' + d.partidos.join(', '));
  if (d.fantasma) out.push(donde + ': queda abierto el hueco del paso anterior, sin oscurecer');
  if (i < cifras.S - 1) {
    if (!d.hueco) out.push(donde + ': el boton del paso no esta en pantalla (foco en el centro)');
    else {
      const h = d.hueco, solapa = Math.min(t.right, h.right) - Math.max(t.left, h.left) > 0 && Math.min(t.bottom, h.bottom) - Math.max(t.top, h.top) > 0;
      if (solapa) out.push(donde + ': la tarjeta tapa el boton que señala');
    }
  }
  return out;
}

/* Un boton que no se puede pulsar (fuera de la pantalla, tapado) es un FALLO
   del tour, no del control: se apunta y se sigue. Sin esto, la averia de la
   tarjeta encima del boton tumbaba la prueba entera, y auditar.sh lo habria
   contado como «control que no se pudo ejecutar», no como lo que es. */
async function pulsa(p, sel) { try { await p.click(sel, { timeout: 4000 }); return true; } catch (e) { return false; } }
/* el paso que abre el panel de rutas vuelve a medir el foco cuando el panel
   ha entrado: hasta entonces el tour lleva data-listo="0" */
const listo = p => p.waitForFunction(() => (document.getElementById('v19-tour').getAttribute('data-listo') || '1') === '1', null, { timeout: 4000 }).catch(() => {});

async function idioma(b, L) {
  const fallos = [], textos = {};
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
  const p = await ctx.newPage();
  const err = []; p.on('pageerror', e => err.push(e.message));
  await p.addInitScript(() => { try { localStorage.setItem('tgo_consent', JSON.stringify({ v: 'denied', t: Date.now() })); } catch (e) {} });
  await p.goto('http://127.0.0.1:' + PUERTO + '/index.html', { waitUntil: 'networkidle' });
  await p.waitForTimeout(600);
  await p.click('.v19-w-lang[data-lang="' + L + '"]'); await p.waitForTimeout(300);
  await p.click('#v19-welcome-start');
  // alguien nuevo: tiene que salir la pregunta
  try { await p.waitForSelector('.v19t-prompt', { timeout: 6000 }); }
  catch (e) { fallos.push(L + ': no sale la pregunta del tour al entrar'); await ctx.close(); return { fallos, textos }; }
  const cifras = await p.evaluate(() => ({ n: places.length, L: nIdiomasListos(), C: window.TGO_MAR.costas.length,
    S: +((document.querySelector('.v19t-prompt p') || {}).textContent || '').replace(/\D+/g, ' ').trim().split(' ')[0] || 0 }));
  const preg = await p.evaluate(() => ({ t: document.querySelector('.v19t-prompt h3').textContent, c: document.querySelector('.v19t-prompt p').textContent,
    botones: [...document.querySelectorAll('.v19t-prompt button')].map(x => x.textContent), nuevo: !!document.querySelector('.v19t-prompt .v19t-nuevo') }));
  textos['pregunta'] = preg.t + ' ¦ ' + preg.c + ' ¦ ' + preg.botones.join(' ¦ ');
  if (preg.nuevo) fallos.push(L + ': alguien nuevo ve la etiqueta de novedades');
  if (/[{}]|undefined|NaN|null/.test(textos['pregunta'])) fallos.push(L + ': pregunta rota «' + textos['pregunta'].slice(0, 90) + '»');
  await p.click('.v19t-prompt .v19t-next');
  await p.waitForSelector('#v19-tour.open', { timeout: 4000 });
  const S = await p.evaluate(() => document.querySelector('.v19t-num').textContent.split('/')[1] | 0);
  if (S < 2) { fallos.push(L + ': el tour no tiene pasos'); await ctx.close(); return { fallos, textos }; }
  if (cifras.S !== S) fallos.push(L + ': la pregunta dice ' + cifras.S + ' pasos y el tour tiene ' + S);
  cifras.S = S;
  for (const [w, h] of TAMANOS) {
    const tam = w + '×' + h;
    await p.setViewportSize({ width: w, height: h });
    await p.evaluate(() => window.v19StartTour());
    await p.waitForTimeout(250);
    for (let i = 0; i < S; i++) {
      await listo(p);
      const d = await p.evaluate(LEER);
      fallos.push(...problemasDelPaso(L, tam, i, d, cifras));
      if (w === 390) textos['paso ' + (i + 1)] = d.titulo + ' ¦ ' + d.cuerpo + (d.nuevo ? ' ¦ ' + d.nuevo : '') + ' ¦ ' + d.botones.join(' ¦ ');
      if (w === 390 && i === 0 && !d.cuerpo.includes(String(cifras.n))) fallos.push(L + ' paso 1: no dice los ' + cifras.n + ' lugares');
      if (w === 390 && /\{L\}/.test(d.cuerpo)) fallos.push(L + ': {L} sin sustituir');
      if (i < S - 1 && !(await pulsa(p, '#v19-tour .v19t-next'))) {
        fallos.push(L + ' ' + tam + ' paso ' + (i + 1) + ': no se puede pulsar «Siguiente» (fuera de la pantalla o tapado)');
        break;
      }
      await p.waitForTimeout(60);
    }
    // el ultimo «Siguiente» cierra y guarda la version
    if (!(await pulsa(p, '#v19-tour.open .v19t-next'))) {
      await p.evaluate(() => { const r = document.getElementById('v19-tour'); if (r) r.classList.remove('open'); });
      continue;
    }
    const guardado = await p.evaluate(() => localStorage.getItem('tenerife.tour.seen'));
    if (!(Number(guardado) >= 2)) fallos.push(L + ' ' + tam + ': al terminar se guarda «' + guardado + '»');
    if (await p.evaluate(() => routePanelOpen)) fallos.push(L + ' ' + tam + ': al terminar el tour se queda abierto el panel de rutas');
  }
  /* saltar el tour con el panel de rutas abierto por el: tiene que cerrarse */
  {
    await p.evaluate(() => window.v19StartTour());
    await p.waitForTimeout(250);
    let llego = false;
    for (let i = 0; i < 30 && !llego; i++) {
      llego = await p.evaluate(() => routePanelOpen);
      if (!llego && !(await pulsa(p, '#v19-tour .v19t-next'))) break;
      await listo(p);
    }
    if (!llego) fallos.push(L + ': ningun paso abre el panel de rutas');
    else {
      const tab = await p.evaluate(() => (document.querySelector('.route-tab.active') || {}).id);
      if (tab !== 'tab-planner') fallos.push(L + ': el primer paso de rutas abre la pestaña «' + tab + '»');
      await pulsa(p, '#v19-tour .v19t-skip');
      if (await p.evaluate(() => routePanelOpen)) fallos.push(L + ': al saltar el tour se queda abierto el panel de rutas');
    }
  }
  // las cifras de los pasos que las llevan
  const cuerpos = Object.values(textos).join(' ');
  if (!cuerpos.includes(String(cifras.L))) fallos.push(L + ': ningun paso dice los ' + cifras.L + ' idiomas');
  if (!cuerpos.includes(String(cifras.C))) fallos.push(L + ': ningun paso dice las ' + cifras.C + ' costas');
  if (err.length) fallos.push(L + ': errores de pagina: ' + err.slice(0, 3).join(' | '));
  await ctx.close();

  // quien vio el tour viejo: novedades, con la etiqueta, en su idioma
  const ctx2 = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
  const p2 = await ctx2.newPage();
  await p2.addInitScript(() => { try { localStorage.setItem('tenerife.tour.seen', '1'); localStorage.setItem('tgo_consent', JSON.stringify({ v: 'denied', t: Date.now() })); } catch (e) {} });
  await p2.goto('http://127.0.0.1:' + PUERTO + '/index.html', { waitUntil: 'networkidle' });
  await p2.waitForTimeout(600);
  await p2.click('.v19-w-lang[data-lang="' + L + '"]'); await p2.waitForTimeout(300);
  await p2.click('#v19-welcome-start');
  try {
    await p2.waitForSelector('.v19t-prompt', { timeout: 6000 });
    const nov = await p2.evaluate(() => ({ t: document.querySelector('.v19t-prompt h3').textContent, c: document.querySelector('.v19t-prompt p').textContent,
      nuevo: (document.querySelector('.v19t-prompt .v19t-nuevo') || {}).textContent || '' }));
    textos['novedades'] = nov.t + ' ¦ ' + nov.c + ' ¦ ' + nov.nuevo;
    if (!nov.nuevo) fallos.push(L + ': las novedades salen sin la etiqueta');
    if (nov.t === preg.t) fallos.push(L + ': quien vio el tour viejo ve la misma pregunta que alguien nuevo');
  } catch (e) { fallos.push(L + ': quien vio el tour viejo no ve las novedades'); }
  await ctx2.close();
  return { fallos, textos };
}

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const P = (k, v) => console.log('  ' + String(k).padEnd(44, '.') + ' ' + v);
  console.log('=== el tour de bienvenida, en los ' + IDIOMAS.length + ' idiomas ===');
  const res = {};
  let total = 0;
  for (const L of IDIOMAS) {
    try { res[L] = await idioma(b, L); }
    catch (e) { res[L] = { fallos: [L + ': la prueba no pudo seguir: ' + String(e && e.message || e).split('\n')[0]], textos: {} }; }
    total += res[L].fallos.length;
    P(L + ' · ' + Object.keys(res[L].textos).filter(k => k.startsWith('paso')).length + ' pasos en ' + TAMANOS.length + ' tamaños', res[L].fallos.length ? res[L].fallos.length + ' fallo(s)' : 'bien');
    res[L].fallos.slice(0, 12).forEach(f => console.log('       ' + f));
  }
  await b.close();
  // entre idiomas: nada igual al castellano ni (salvo el propio) al ingles
  const iguales = [];
  for (const L of IDIOMAS) {
    if (L === 'es') continue;
    for (const [k, v] of Object.entries(res[L].textos)) {
      const es = (res.es && res.es.textos[k]) || '', en = (res.en && res.en.textos[k]) || '';
      if (v === es) iguales.push(L + ' ' + k + ': igual que el castellano');
      else if (L !== 'en' && v === en) iguales.push(L + ' ' + k + ': igual que el ingles');
      else {
        const pv = v.split(' ¦ '), pe = es.split(' ¦ '), pn = en.split(' ¦ ');
        pv.forEach((x, j) => {
          if (x && x === pe[j] && !/^[\d\s/.,]+$/.test(x)) iguales.push(L + ' ' + k + ' trozo ' + (j + 1) + ' «' + x.slice(0, 40) + '»: igual que el castellano');
          else if (x && L !== 'en' && x === pn[j] && !/^[\d\s/.,]+$/.test(x)) iguales.push(L + ' ' + k + ' trozo ' + (j + 1) + ' «' + x.slice(0, 40) + '»: igual que el ingles');
        });
      }
    }
  }
  P('textos iguales al castellano o al ingles', iguales.length);
  iguales.slice(0, 30).forEach(x => console.log('       ' + x));
  total += iguales.length;
  console.log(total ? '\n  ' + total + ' fallo(s)' : '\n  OK');
  process.exitCode = total ? 1 : 0;
})().catch(e => { console.error(e && e.stack || e); process.exit(2); });
