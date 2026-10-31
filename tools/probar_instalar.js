#!/usr/bin/env node
/* probar_instalar.js — instalar la app desde el movil: el banner y sus pasos
 * (31 de octubre de 2026).
 *
 * POR QUE EXISTE. Jerome abrio tenerifego.app desde Instagram en el iPhone:
 * «Abre safari y de ahí no podemos instalar nada o no vi como. También la
 * pantalla instalar se queda ahí y no desaparece cuando empuja instalar».
 * Era el navegador de Instagram, desde el que no se puede añadir nada a la
 * pantalla de inicio, y los pasos hablaban del boton Compartir de Safari. Y
 * el banner, con «left: 50%» y sin ancho, ocupaba media pantalla: el texto se
 * partia palabra a palabra y, al esconderlo, seguia asomando encima de la
 * barra de abajo.
 *
 * QUE MIRA, con los textos de PWA_TX tal cual estan en index.html:
 *   · en los diez idiomas, en Safari del iPhone: el banner sale, con sus
 *     textos, de margen a margen, sin desbordar ni tapar la barra de abajo;
 *     «Instalar» lo esconde del todo (fuera de la pantalla y sin verse) y
 *     ensena los pasos de Safari, con lo de iOS 26 («•••»);
 *   · en los diez idiomas, en el navegador de Instagram: el banner dice que
 *     desde ahi no se puede y como seguir; sus dos pasos (salir al navegador
 *     y, alli, añadirla) y «Copiar el enlace», que copia la direccion sin lo
 *     que añade la otra app (?fbclid=…);
 *   · el cambio de idioma con el banner a la vista lo vuelve a rotular;
 *   · Facebook y una vista web sin marca tambien son «navegador de otra app»;
 *     en Android, el de Instagram tambien, con sus pasos de Chrome; Chrome en
 *     el iPhone, con los suyos;
 *   · sin banner: la app ya instalada, despues de cerrarlo con «×» (y al
 *     volver), y Chrome de Android sin beforeinstallprompt, como antes;
 *   · a 320 y a 430 px, con los textos mas largos, dentro de la pantalla;
 *   · y ningun error de pagina.
 *
 *     node tools/probar_instalar.js [puerto]
 */
'use strict';
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');
const PUERTO = process.argv[2] || '8766';
const BASE = 'http://127.0.0.1:' + PUERTO + '/index.html';
const RAIZ = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
const IDIOMAS = ((html.match(/SUPPORTED_LANGS\s*=\s*\[([^\]]*)\]/) || [, ''])[1])
  .split(',').map(x => x.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);

/* PWA_TX, leida del fuente: del «var PWA_TX = {» a su «};» */
const T = (() => {
  const i = html.indexOf('var PWA_TX = {');
  const j = html.indexOf('\n  };', i);
  if (i < 0 || j < 0) { console.error('no se encuentra PWA_TX en index.html'); process.exit(2); }
  return eval('(' + html.slice(i + 'var PWA_TX = '.length, j + '\n  }'.length) + ')');
})();
const plano = s => String(s).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

const IOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko)';
const UA = {
  safari: IOS + ' Version/18.0 Mobile/15E148 Safari/604.1',
  instagram: IOS + ' Mobile/15E148 Instagram 350.0.0.0.0 (iPhone15,2; iOS 18_0; es_ES; es; scale=3.00; 1179x2556; 600000000)',
  facebook: IOS + ' Mobile/15E148 [FBAN/FBIOS;FBAV/480.0.0.0;FBDV/iPhone15,2;FBMD/iPhone;FBSN/iOS;FBSV/18.0;FBLC/es_ES]',
  vistaWeb: IOS + ' Mobile/15E148',
  chromeIos: IOS + ' CriOS/130.0.6723.90 Mobile/15E148 Safari/604.1',
  instagramAndroid: 'Mozilla/5.0 (Linux; Android 14; Pixel 8 Build/AP2A.240805.005; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/130.0.6723.86 Mobile Safari/537.36 Instagram 350.0.0.0.0 Android (34/14; 420dpi; 1080x2400; Google/google; Pixel 8; shiba; shiba; es_ES; 600000000)',
  chromeAndroid: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36'
};

let malos = 0, total = 0;
const caso = (nombre, ok, detalle) => {
  total++;
  if (!ok) malos++;
  console.log((ok ? '  ok   ' : ' FALLA ') + nombre + (ok || !detalle ? '' : '\n        ' + String(detalle).slice(0, 600)));
};
const errores = [];

let browser;
/* una pagina como la abre quien llega: el idioma en la bienvenida y «Empezar» */
async function abrir(ua, L, op) {
  op = op || {};
  const ctx = await browser.newContext({ viewport: { width: op.ancho || 390, height: 844 }, userAgent: ua, isMobile: true, hasTouch: true,
    locale: 'es-ES', serviceWorkers: 'block', permissions: ['clipboard-read', 'clipboard-write'] });
  const p = await ctx.newPage();
  p.on('pageerror', e => errores.push((L || '') + ' ' + e.message));
  await p.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => r.abort());
  await p.addInitScript(inst => {
    try { localStorage.setItem('tenerife.tour.seen', '99'); } catch (e) {}
    if (inst) Object.defineProperty(navigator, 'standalone', { get: () => true });
  }, !!op.instalada);
  await p.goto(BASE + (op.consulta || ''), { waitUntil: 'load' });
  await p.waitForTimeout(300);
  const lang = await p.$('.v19-w-lang[data-lang="' + (L || 'es') + '"]');
  if (lang) { await lang.click(); await p.waitForTimeout(150); }
  const empezar = await p.$('#v19-welcome-start');
  if (empezar) await empezar.click().catch(() => {});
  return { ctx, p };
}
const sale = (p, ms) => p.waitForSelector('.pwa-install-banner.show', { timeout: ms || 10000 }).then(() => true, () => false);
const medir = p => p.evaluate(() => {
  const el = document.querySelector('.pwa-install-banner');
  if (!el) return null;
  const r = el.getBoundingClientRect(), cs = getComputedStyle(el), nav = document.querySelector('.v19-bottom-nav');
  const caja = el.querySelector('.pwa-ib-text');
  const nr = nav ? nav.getBoundingClientRect() : null;
  return { izq: r.left, der: r.right, arriba: r.top, abajo: r.bottom, ancho: r.width, alto: r.height, vw: innerWidth, vh: innerHeight,
    visible: cs.visibility, navArriba: nr && nr.height ? nr.top : null,
    titulo: caja.querySelector('b').textContent, linea: caja.lastChild.textContent,
    boton: el.querySelector('.pwa-ib-install').textContent, cerrar: el.querySelector('.pwa-ib-close').getAttribute('aria-label'),
    desborda: caja.scrollWidth > caja.clientWidth + 1 || el.scrollWidth > el.clientWidth + 1 };
});
const ventana = p => p.evaluate(() => {
  const bd = document.querySelector('.pwa-modal-backdrop');
  if (!bd || !bd.classList.contains('show')) return null;
  const m = bd.querySelector('.pwa-modal');
  return { titulo: m.querySelector('h3').textContent, pasos: [...m.querySelectorAll('.pwa-pasos li, .pwa-paso')].map(x => x.textContent.replace(/\s+/g, ' ').trim()),
    botones: [...m.querySelectorAll('button')].map(b => b.textContent) };
});
/* de margen a margen, dentro de la pantalla, sin desbordar y por encima de la barra de abajo */
const bienPuesto = (m, anchoMin, altoMax) => m && m.visible === 'visible' && m.izq >= 8 && m.der <= m.vw - 8 && m.ancho >= anchoMin
  && m.alto <= altoMax && !m.desborda && (m.navArriba === null || m.abajo <= m.navArriba + 0.5);
const escondido = m => m && m.visible === 'hidden' && m.arriba >= m.vh;

async function enTandas(lista, n, fn) {
  for (let i = 0; i < lista.length; i += n) await Promise.all(lista.slice(i, i + n).map(fn));
}

(async () => {
  browser = await chromium.launch();
  try {
    console.log('=== Safari del iPhone, en los ' + IDIOMAS.length + ' idiomas ===');
    const safari = {};
    await enTandas(IDIOMAS, 5, async L => {
      const { ctx, p } = await abrir(UA.safari, L);
      const r = { sale: await sale(p) };
      r.m = await medir(p);
      if (r.sale) {
        await p.click('.pwa-install-banner .pwa-ib-install'); await p.waitForTimeout(900);
        r.despues = await medir(p); r.v = await ventana(p);
        const okb = await p.$('.pwa-modal-ok'); if (okb) { await okb.click(); await p.waitForTimeout(200); }
        r.cerrada = await ventana(p) === null;
      }
      safari[L] = r; await ctx.close();
    });
    for (const L of IDIOMAS) {
      const r = safari[L], m = r.m || {};
      caso(L + ': el banner sale con sus textos («' + m.titulo + '», «' + m.linea + '», «' + m.boton + '»), de margen a margen (' + Math.round(m.ancho) + ' px), sin desbordar y por encima de la barra de abajo',
        r.sale && m.titulo === T.instalarNombre[L] && m.linea === T.accesoRapido[L] && m.boton === T.instalar[L] && m.cerrar === T.cerrar[L] && bienPuesto(m, 340, 120), JSON.stringify(m));
      caso(L + ': «Instalar» lo esconde del todo y ensena los pasos de Safari, con «•••»',
        escondido(r.despues) && r.v && r.v.titulo === T.instTitulo[L] && r.v.pasos.length === 1 && r.v.pasos[0] === plano(T.instIos[L]) && /•••/.test(r.v.pasos[0])
        && r.v.botones.join('|') === T.instOk[L] && r.cerrada, JSON.stringify({ despues: r.despues, v: r.v }));
    }

    console.log('\n=== el navegador de Instagram en el iPhone, en los ' + IDIOMAS.length + ' idiomas ===');
    const insta = {};
    await enTandas(IDIOMAS, 5, async L => {
      const { ctx, p } = await abrir(UA.instagram, L, { consulta: '?fbclid=prueba#mapa' });
      const r = { sale: await sale(p) };
      r.m = await medir(p);
      if (r.sale) {
        await p.click('.pwa-install-banner .pwa-ib-install'); await p.waitForTimeout(900);
        r.despues = await medir(p); r.v = await ventana(p);
        const c = await p.$('.pwa-modal-copiar');
        if (c) {
          await c.click(); await p.waitForTimeout(300);
          r.copiado = await p.evaluate(() => navigator.clipboard.readText()).catch(e => 'error: ' + e.message);
          r.boton = await c.textContent(); r.desactivado = await c.evaluate(b => b.disabled);
        }
      }
      insta[L] = r; await ctx.close();
    });
    for (const L of IDIOMAS) {
      const r = insta[L], m = r.m || {};
      caso(L + ': el banner dice que desde ahi no se puede («' + m.linea + '») y «' + m.boton + '», de margen a margen y sin desbordar',
        r.sale && m.titulo === T.instalarNombre[L] && m.linea === T.enAppIos[L] && m.boton === T.verComo[L] && bienPuesto(m, 340, 130), JSON.stringify(m));
      caso(L + ': al tocarlo se esconde y salen los dos pasos (⋯ y Safari) con «Copiar el enlace»',
        escondido(r.despues) && r.v && r.v.titulo === T.instTitulo[L] && r.v.pasos.length === 2 && r.v.pasos[0] === plano(T.instAppIos[L]) && r.v.pasos[1] === plano(T.instIos[L])
        && r.v.botones.join('|') === T.copiarEnlace[L] + '|' + T.instOk[L], JSON.stringify({ despues: r.despues, v: r.v }));
      caso(L + ': «Copiar el enlace» copia la direccion sin «?fbclid» ni «#» y dice «' + r.boton + '»',
        r.copiado === BASE && r.boton === T.enlaceCopiado[L] && r.desactivado === true, JSON.stringify({ copiado: r.copiado, boton: r.boton }));
    }

    console.log('\n=== el cambio de idioma, con el banner a la vista ===');
    for (const [ua, nombre, de, a, linea] of [[UA.safari, 'Safari', 'es', 'de', 'accesoRapido'], [UA.instagram, 'Instagram', 'es', 'bg', 'enAppIos']]) {
      const { ctx, p } = await abrir(ua, de);
      const s = await sale(p);
      await p.evaluate(l => setLang(l), a); await p.waitForTimeout(300);
      const m = await medir(p);
      caso(nombre + ': de ' + de + ' a ' + a + ', el banner pasa a «' + (m && m.titulo) + '» / «' + (m && m.linea) + '»',
        s && m && m.titulo === T.instalarNombre[a] && m.linea === T[linea][a] && m.cerrar === T.cerrar[a], JSON.stringify(m));
      await ctx.close();
    }

    console.log('\n=== otros navegadores ===');
    for (const [ua, nombre] of [[UA.facebook, 'Facebook en el iPhone'], [UA.vistaWeb, 'una vista web sin marca en el iPhone']]) {
      const { ctx, p } = await abrir(ua, 'es');
      const s = await sale(p), m = await medir(p);
      caso(nombre + ': tambien es el navegador de otra app («' + (m && m.linea) + '»)', s && m && m.linea === T.enAppIos.es && m.boton === T.verComo.es, JSON.stringify(m));
      await ctx.close();
    }
    {
      const { ctx, p } = await abrir(UA.instagramAndroid, 'es');
      const s = await sale(p), m = await medir(p);
      let v = null;
      if (s) { await p.click('.pwa-install-banner .pwa-ib-install'); await p.waitForTimeout(900); v = await ventana(p); }
      caso('Instagram en Android: sale (alli no llega beforeinstallprompt), «' + (m && m.linea) + '», y sus pasos: ⋮ y Chrome',
        s && m && m.linea === T.enAppAnd.es && m.boton === T.verComo.es && v && v.pasos.length === 2 && v.pasos[0] === plano(T.instAppAnd.es) && v.pasos[1] === plano(T.instAnd.es)
        && v.botones.join('|') === T.copiarEnlace.es + '|' + T.instOk.es, JSON.stringify({ m, v }));
      await ctx.close();
    }
    {
      const { ctx, p } = await abrir(UA.chromeIos, 'es');
      const s = await sale(p), m = await medir(p);
      let v = null;
      if (s) { await p.click('.pwa-install-banner .pwa-ib-install'); await p.waitForTimeout(900); v = await ventana(p); }
      caso('Chrome en el iPhone: el banner de siempre y sus pasos («Compartir»; si no esta, Safari)',
        s && m && m.linea === T.accesoRapido.es && m.boton === T.instalar.es && v && v.pasos.length === 1 && v.pasos[0] === plano(T.instIosOtro.es), JSON.stringify({ m, v }));
      await ctx.close();
    }

    console.log('\n=== sin banner ===');
    {
      const { ctx, p } = await abrir(UA.safari, 'es', { instalada: true });
      caso('la app ya instalada (navigator.standalone): no sale', !(await sale(p, 7000)));
      await ctx.close();
    }
    {
      const { ctx, p } = await abrir(UA.safari, 'es');
      const s = await sale(p);
      await p.click('.pwa-install-banner .pwa-ib-close'); await p.waitForTimeout(900);
      const m = await medir(p), guardado = await p.evaluate(() => localStorage.getItem('tf_pwa_install_dismissed'));
      caso('«×» lo esconde del todo y se acuerda', s && escondido(m) && guardado === '1', JSON.stringify({ m, guardado }));
      await p.reload({ waitUntil: 'load' });
      caso('y al volver, no sale', !(await sale(p, 7000)));
      await ctx.close();
    }
    {
      const { ctx, p } = await abrir(UA.chromeAndroid, 'es');
      caso('Chrome de Android sin beforeinstallprompt: no sale, como antes', !(await sale(p, 7000)));
      await ctx.close();
    }

    console.log('\n=== a 320 y a 430 px, con los textos mas largos ===');
    const largo = k => IDIOMAS.reduce((a, L) => (T.instalarNombre[L] + T[k][L] + (k === 'enAppIos' ? T.verComo[L] : T.instalar[L])).length
      > (T.instalarNombre[a] + T[k][a] + (k === 'enAppIos' ? T.verComo[a] : T.instalar[a])).length ? L : a, IDIOMAS[0]);
    for (const [ua, nombre, k] of [[UA.safari, 'Safari', 'accesoRapido'], [UA.instagram, 'Instagram', 'enAppIos']]) {
      const L = largo(k);
      for (const ancho of [320, 430]) {
        const { ctx, p } = await abrir(ua, L, { ancho });
        const s = await sale(p), m = await medir(p);
        caso(nombre + ' a ' + ancho + ' px, en ' + L + ' (el mas largo): dentro de la pantalla, sin desbordar (' + (m && Math.round(m.ancho)) + ' x ' + (m && Math.round(m.alto)) + ')',
          s && bienPuesto(m, Math.min(480, ancho - 24) - 1, 150), JSON.stringify(m));
        await ctx.close();
      }
    }
    caso('sin errores de pagina', errores.length === 0, errores.join(' / '));
  } finally {
    await browser.close();
  }
  console.log('\n' + (malos ? malos + ' de ' + total + ' fallan' : total + ' de ' + total));
  process.exit(malos ? 1 : 0);
})().catch(e => { console.error(e && e.stack || e); process.exit(2); });
