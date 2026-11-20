#!/usr/bin/env node
/* probar_contraste_grupos.js — los números de los grupos del mapa se leen (20 de noviembre de 2026, prueba de los dos
 * móviles, bloque 6; Jérôme, con las dos capturas: «Con el negro se nota más los números»).
 *
 * EL HUECO QUE TAPA
 *   La cifra de cada grupo (--gold-light, #F5C76B) iba sobre un círculo dorado casi transparente
 *   (rgba(212,175,55,0.18)): encima del mapa de OSM se leía a 1,24:1 sobre tierra y a 1,07:1 sobre el mar, y para un
 *   texto así lo mínimo es 4,5:1. Ahora el círculo es oscuro, rgba(15,17,23,0.85), con el mismo borde dorado.
 *
 * COMO
 *   En la app, con los grupos ya pintados en el mapa: el color de la cifra y el del círculo, leídos de la página (los
 *   de un grupo de verdad y los de los tres tamaños), y el contraste de la cifra sobre el círculo puesto encima de
 *   blanco, lo más claro que puede haber debajo (lo peor para un círculo oscuro), y de negro. Los dos, 4,5:1 o más.
 *   Y el borde dorado de siempre, la cifra en su color y cero errores de página. Sin teselas: lo que se mide no
 *   depende del mapa que haya debajo.
 *
 *     node tools/probar_contraste_grupos.js PUERTO      (con la app servida en ese puerto, como en tools/auditar.sh)
 */
'use strict';
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const PUERTO = process.argv[2] || '8766';
const APP = 'http://127.0.0.1:' + PUERTO + '/index.html';
let bien = 0, mal = 0;
const ver = (c, t, d) => { if (c) { bien++; console.log('  OK  ' + t); } else { mal++; console.log('  MAL ' + t + (d !== undefined ? '   -> ' + d : '')); } };

/* contraste WCAG 2.x: luminancia relativa de sRGB */
const lin = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const contraste = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const encima = ([r, g, b, al], [R, G, B]) => [r * al + R * (1 - al), g * al + G * (1 - al), b * al + B * (1 - al)];
function color(s) {
  const m = String(s).match(/rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)(?:[ ,/]+([\d.]+))?\s*\)/);
  return m ? [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]] : null;
}
const f = x => x.toFixed(2).replace('.', ',');

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true,
    locale: 'es-ES', serviceWorkers: 'block' });
  await ctx.route('**/*', r => r.request().url().startsWith('http://127.0.0.1:' + PUERTO + '/') ? r.continue() : r.abort());
  await ctx.addInitScript(() => { try {
    localStorage.setItem('tenerife.tour.seen', '99'); localStorage.setItem('tgo_consent', JSON.stringify({ v: 'denied', t: Date.now() }));
    localStorage.setItem('tg_lang', 'es');
  } catch (e) {} });
  const p = await ctx.newPage();
  const errores = [];
  p.on('pageerror', e => errores.push(e.message));
  await p.goto(APP, { waitUntil: 'load', timeout: 90000 });
  if (await p.locator('#v19-welcome:not(.hidden)').count()) { await p.tap('#v19-welcome-start').catch(() => {}); await p.waitForTimeout(800); }
  await p.waitForSelector('.marker-cluster-custom', { timeout: 60000 });
  await p.waitForTimeout(800);
  const m = await p.evaluate(() => {
    const leer = el => { const cs = getComputedStyle(el), sp = el.querySelector('span'), cz = sp ? getComputedStyle(sp) : null;
      return { fondo: cs.backgroundColor, borde: cs.borderTopColor, ancho: cs.borderTopWidth, cifra: cz && cz.color }; };
    const real = document.querySelector('.marker-cluster-custom');
    const out = { grupos: document.querySelectorAll('.marker-cluster-custom').length, real: leer(real), tam: {} };
    for (const t of ['cluster-sm', 'cluster-md', 'cluster-lg']) {
      const d = document.createElement('div'); d.className = 'marker-cluster-custom ' + t;
      d.innerHTML = '<div><span>88</span></div>'; d.style.position = 'absolute'; d.style.left = '-200px';
      document.body.appendChild(d); out.tam[t] = leer(d); d.remove();
    }
    return out;
  });
  console.log('── los grupos del mapa ──');
  ver(m.grupos > 0, 'el mapa pinta grupos al abrir', m.grupos + ' grupos');
  const casos = [['un grupo del mapa', m.real]].concat(Object.entries(m.tam).map(([t, v]) => ['un grupo ' + t, v]));
  for (const [nombre, v] of casos) {
    const fondo = color(v.fondo), cifra = color(v.cifra);
    if (!fondo || !cifra) { ver(false, nombre + ': se leen sus colores', JSON.stringify(v)); continue; }
    const sobreBlanco = contraste(cifra, encima(fondo, [255, 255, 255]));
    const sobreNegro = contraste(cifra, encima(fondo, [0, 0, 0]));
    ver(sobreBlanco >= 4.5, nombre + ': la cifra sobre el círculo, con blanco debajo (lo peor), ' + f(sobreBlanco) + ':1', 'pide 4,5:1 · fondo ' + v.fondo);
    ver(sobreNegro >= 4.5, nombre + ': y con negro debajo, ' + f(sobreNegro) + ':1', 'pide 4,5:1 · fondo ' + v.fondo);
    ver(/^rgba?\(212, 175, 55/.test(v.borde) && v.ancho === '2px', nombre + ': el borde dorado de siempre (2 px, #D4AF37)', v.borde + ' ' + v.ancho);
    ver(/^rgba?\(245, 199, 107/.test(v.cifra), nombre + ': la cifra en su dorado claro (#F5C76B)', v.cifra);
  }
  ver(errores.length === 0, 'cero errores de página', errores.slice(0, 3).join(' · '));
  await b.close();
  console.log('\n' + bien + ' bien, ' + mal + ' mal');
  process.exit(mal ? 1 : 0);
})().catch(e => { console.error('REVENTÓ', e); process.exit(2); });
