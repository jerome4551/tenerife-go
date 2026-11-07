#!/usr/bin/env node
/* auditar_desborde.js — lo que se sale de la pantalla, y el texto del POPUP.
 *
 * DOS HUECOS QUE TAPA, Y LOS DOS SALIERON DE UNA FOTO DEL MOVIL
 *
 * 1. EL POPUP DEL MAPA NO LO MIRABA NADIE. El control de idioma compara el
 *    DOM de la pagina quieta entre dos idiomas. El popup de un pin solo
 *    existe cuando tocas el pin, asi que «Ver descripcion completa» llevaba
 *    quien sabe cuanto saliendo en castellano en los otros nueve idiomas y
 *    todos los controles daban verde. Aqui se ABRE un pin y se mira dentro.
 *
 * 2. NADIE MEDIA SI ALGO SE SALE POR LA DERECHA. Una etiqueta larga en
 *    bulgaro empujaba la tercera pestaña del panel de rutas fuera de la
 *    pantalla. El texto estaba bien traducido: lo que fallaba era que no
 *    cabia, y eso solo se ve midiendo, y midiendo EN CADA IDIOMA.
 *
 * Y UN TERCERO, QUE SALIO DEL IPHONE DE JEROME: el desplegable del idioma de
 * la barra no se veia en Safari (estaba dentro de una caja con scroll), y
 * aqui, en Chromium, si. Se mira la estructura que rompe Safari y se usa la
 * lista con el dedo (bloque 4).
 *
 *     node tools/auditar_desborde.js [puerto]
 */
'use strict';
const { chromium, devices } = require('/opt/node22/lib/node_modules/playwright');
const IDIOMAS = ['es', 'en', 'fr', 'de', 'it', 'nl', 'zh', 'zht', 'bg', 'pl'];
const ANCHO = 360, ALTO = 740;           // un movil estrecho de los de verdad
const MARGEN = 2;                        // px de tolerancia por redondeo

(async () => {
  const puerto = process.argv[2] || '8777';
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: ANCHO, height: ALTO } });
  const errores = [];
  p.on('pageerror', e => errores.push(e.message));
  await p.goto('http://127.0.0.1:' + puerto + '/index.html', { waitUntil: 'networkidle' });
  await p.waitForTimeout(2500);

  let fallos = 0;
  const popups = {}, favs = {};
  const P = (t, v) => console.log('  ' + String(t).padEnd(46, '.') + ' ' + v);
  console.log('=== lo que se sale de la pantalla, y el texto del popup ===');
  P('ancho de pantalla usado', ANCHO + ' px');

  for (const L of IDIOMAS) {
    const r = await p.evaluate(async ({ lang, ancho, margen }) => {
      setLang(lang);
      await new Promise(r2 => setTimeout(r2, 350));
      const o = { desborde: [], popup: null };

      /* 1 · abrir el panel de rutas, que es donde estaba el boton cortado */
      try { if (typeof openRoutePanel === 'function') openRoutePanel(); } catch (e) {}
      await new Promise(r2 => setTimeout(r2, 300));

      /* medir TODO lo visible: si el borde derecho pasa del ancho, se sale */
      for (const el of document.querySelectorAll('body *')) {
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden' || !el.offsetParent) continue;
        if (cs.position === 'fixed' && cs.left === 'auto' && cs.right === 'auto') continue;
        /* Los adornos animados salen de la pantalla a proposito y lo declaran
           con aria-hidden. Lo que rompe la lectura es salirse por la DERECHA,
           que es lo unico que se mira. */
        if (el.closest('[aria-hidden="true"]')) continue;
        /* Si un ancestro lo RECORTA, no se sale de la pantalla: esta
           escondido dentro de una caja. Es el caso del mapa, que dibuja
           marcadores fuera de la vista a proposito y los tapa con
           overflow:hidden. Marcarlos seria cantar en cada movimiento del
           mapa, y un control que canta siempre no lo mira nadie. */
        let recortado = false;
        for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
          const ca = getComputedStyle(a);
          if (ca.overflow !== 'visible' || ca.overflowX !== 'visible') { recortado = true; break; }
        }
        if (recortado) continue;
        const r2 = el.getBoundingClientRect();
        if (r2.width === 0 || r2.height === 0) continue;
        if (r2.right > ancho + margen) {
          const padre = el.parentElement;
          /* solo el elemento mas hondo: si el padre tambien se sale, es el mismo fallo */
          if (padre && padre.getBoundingClientRect().right > ancho + margen) continue;
          o.desborde.push({
            sel: el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') +
                 (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/)[0] : ''),
            se_sale: Math.round(r2.right - ancho),
            texto: (el.textContent || '').trim().slice(0, 40)
          });
        }
      }
      try { if (typeof closeRoutePanel === 'function') closeRoutePanel(); } catch (e) {}
      await new Promise(r2 => setTimeout(r2, 200));

      /* 2 · abrir un pin y leer lo que dice su popup */
      const pl = places.find(x => x.id === 'teide') || places[0];
      const mk = (typeof markerMap !== 'undefined') ? markerMap[pl.id] : null;
      if (mk && mk.openPopup) {
        try {
          if (typeof clusterGroup !== 'undefined' && clusterGroup.hasLayer(mk))
            clusterGroup.zoomToShowLayer(mk, () => mk.openPopup());
          else mk.openPopup();
        } catch (e) {}
      }
      await new Promise(r2 => setTimeout(r2, 500));
      const hint = document.querySelector('.popup-tap-hint');
      o.popup = hint ? hint.textContent.trim() : null;

      /* 3 · LA HOJA DE DETALLE. Tampoco la miraba nadie: las etiquetas salian
         en castellano en los diez idiomas («GASOLINERA · INTERIOR · SUR ·
         MONTAÑA») porque se pintaban a pelo y no por TG_ETIQUETAS, como el
         globo; y el boton decia «Favorito» en los diez, tambien en ingles.
         Lo encontro una foto en chino. Cada etiqueta tiene que decir lo que
         dice TG_ETIQUETAS en ese idioma. */
      o.hoja = { mal: [], fav: null };
      try {
        const fx = places.find(x => x.id === 'gas-tf51-vilaflor') || pl;
        /* Ida y vuelta por el castellano, y la ficha abierta ANTES de que
           llegue el glosario: los dos casos que dejaban las etiquetas en
           castellano. Despues se espera a que el glosario este, y la ficha
           que ya estaba abierta tiene que haberse repintado sola. */
        if (lang !== 'es') { setLang('es'); await new Promise(r2 => setTimeout(r2, 250)); setLang(lang); }
        openDetailSheet(fx.id);
        const t0 = Date.now();
        while (lang !== 'es' && TG_ETIQUETAS.de('Gasolinera') === 'Gasolinera' && Date.now() - t0 < 6000)
          await new Promise(r2 => setTimeout(r2, 100));
        if (lang !== 'es' && TG_ETIQUETAS.de('Gasolinera') === 'Gasolinera')
          o.hoja.mal.push('el glosario no llega tras ir y volver por el castellano');
        await new Promise(r2 => setTimeout(r2, 300));
        const chips = [...document.querySelectorAll('#detail-sheet-tags .popup-tag')].map(e => e.textContent);
        (fx.tags || []).forEach((tg, k) => {
          const debe = TG_ETIQUETAS.de(tg);
          if (chips[k] !== debe) o.hoja.mal.push(tg + ' -> «' + chips[k] + '» (debe «' + debe + '»)');
        });
        /* Si el glosario del idioma aun no ha llegado, TG_ETIQUETAS devuelve el
           castellano y la comparacion de arriba da verde comparando castellano
           con castellano. Vilaflor lleva «Gasolinera», «Sur» y «Montaña», que
           se traducen en los nueve: alguna TIENE que cambiar. */
        if (lang !== 'es' && chips.length && chips.every((c, k) => c === fx.tags[k]))
          o.hoja.mal.push('ninguna etiqueta cambia: ' + chips.slice(0, 4).join(' · '));
        /* El horario de una gasolinera (sale del registro oficial, IDEESS)
           estaba guardado en los diez idiomas y no se pintaba en ningun sitio.
           Tiene que salir, en el idioma de la pantalla. Y uno sin fuente (un
           camping) no tiene que salir. */
        const t1 = Date.now();
        while (fx.hours && !fx.hours[lang] && Date.now() - t1 < 6000)
          await new Promise(r2 => setTimeout(r2, 100));
        openDetailSheet(fx.id);
        await new Promise(r2 => setTimeout(r2, 200));
        const info = (document.getElementById('detail-sheet-info') || {}).textContent || '';
        if (fx.ideess && fx.hours && !info.includes('🕐 ' + fx.hours[lang]))
          o.hoja.mal.push('horario: la ficha dice «' + info.trim().slice(0, 60) + '», debe «🕐 ' + fx.hours[lang] + '»');
        const sinFuente = places.find(x => x.hours && !x.ideess && x.category === 'camping');
        if (sinFuente) {
          openDetailSheet(sinFuente.id);
          await new Promise(r2 => setTimeout(r2, 200));
          if (((document.getElementById('detail-sheet-info') || {}).textContent || '').includes('🕐'))
            o.hoja.mal.push('horario sin fuente pintado: ' + sinFuente.id);
          openDetailSheet(fx.id);
        }
        const fl = document.getElementById('detail-fav-lbl');
        o.hoja.fav = fl ? fl.textContent.trim() : null;
        if (typeof closeDetailSheet === 'function') closeDetailSheet();
      } catch (e) { o.hoja.mal.push('no se pudo abrir: ' + e.message); }
      return o;
    }, { lang: L, ancho: ANCHO, margen: MARGEN });

    if (r.hoja.mal.length) {
      fallos++;
      console.log('  MAL  ' + L.padEnd(4) + 'hoja de detalle: ' + r.hoja.mal.length + ' fallo(s) (etiquetas u horario)');
      r.hoja.mal.slice(0, 4).forEach(x => console.log('           ' + x));
    }
    if (L !== 'es' && r.hoja.fav === 'Favorito') {
      fallos++;
      console.log('  MAL  ' + L.padEnd(4) + 'el boton de favoritos dice «Favorito», en castellano');
    }
    favs[L] = r.hoja.fav;

    if (r.desborde.length) {
      fallos++;
      console.log('  MAL  ' + L.padEnd(4) + r.desborde.length + ' elemento(s) fuera de la pantalla');
      r.desborde.slice(0, 4).forEach(d =>
        console.log('           ' + d.sel.padEnd(34) + '+' + d.se_sale + ' px   «' + d.texto + '»'));
    } else {
      console.log('  ok   ' + L.padEnd(4) + 'nada se sale por los lados');
    }
    if (r.popup !== null) { popups[L] = r.popup; console.log('       popup: «' + r.popup + '»'); }
  }

  /* 4 · EL DESPLEGABLE DEL IDIOMA DE LA BARRA, con el dedo.
     Jerome, el 7 de noviembre de 2026: el boton de cambiar de idioma de
     arriba, junto al mapa, «de momento no funciona». En el iPhone la lista
     no se veia: vivia dentro de .topbar-right, que en el movil lleva
     overflow-x:auto, y Safari recorta un position:fixed que este dentro de
     una caja con scroll (fallo 160953 de WebKit, abierto en 2026). Chromium
     si lo dejaba ver, y por eso aqui todo salia en verde. Asi que se mira la
     estructura, que es lo que rompe Safari (ningun elemento fijo dentro de
     una caja con scroll, ni dentro de una caja posicionada que recorte y
     lleve z-index), y despues se usa la lista como una persona: en un
     iPhone pequeno con el aviso de instalar a la vista (antes tapaba los
     tres ultimos idiomas) y en un movil tumbado, donde los diez no caben y
     la lista tiene que deslizarse sin cerrarse. */
  const malIdioma = [];
  const pasoIdioma = [];
  for (const caso of [
    { nombre: 'iPhone pequeno, 320 x 568', opc: { ...devices['iPhone SE'] }, aviso: true },
    { nombre: 'movil tumbado, 740 x 330', opc: { viewport: { width: 740, height: 330 }, isMobile: true, hasTouch: true }, aviso: false },
  ]) {
    const ctx = await b.newContext({ ...caso.opc, locale: 'es-ES', serviceWorkers: 'block' });
    const q = await ctx.newPage();
    const errQ = [];
    q.on('pageerror', e => errQ.push(e.message));
    try {
      await q.goto('http://127.0.0.1:' + puerto + '/index.html', { waitUntil: 'load', timeout: 60000 });
      await q.waitForTimeout(1500);
      /* la bienvenida y, la primera vez, la oferta del recorrido: como una persona */
      if (await q.isVisible('#v19-welcome-start')) { await q.tap('#v19-welcome-start'); await q.waitForTimeout(1200); }
      if (await q.$('.v19t-prompt .v19t-ghost')) { await q.tap('.v19t-prompt .v19t-ghost'); await q.waitForTimeout(600); }
      const est = await q.evaluate(() => {
        const nombre = e => e.id ? '#' + e.id : e.tagName.toLowerCase() + (e.classList.length ? '.' + [...e.classList].join('.') : '');
        const mal = [];
        for (const e of document.querySelectorAll('body *')) {
          if (getComputedStyle(e).position !== 'fixed') continue;
          for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) {
            const ca = getComputedStyle(a);
            const scroll = /auto|scroll/.test(ca.overflowX + ca.overflowY);
            const recortaConZ = /hidden|clip/.test(ca.overflowX + ca.overflowY) && ca.position !== 'static' && ca.zIndex !== 'auto';
            if (scroll || recortaConZ) { mal.push(nombre(e) + ' dentro de ' + nombre(a) + ' (overflow ' + ca.overflowX + '/' + ca.overflowY + ')'); break; }
          }
        }
        const dd = document.getElementById('lang-dropdown');
        return { mal, padre: dd && dd.parentElement ? nombre(dd.parentElement) : null };
      });
      est.mal.forEach(x => malIdioma.push(caso.nombre + ': elemento fijo que Safari recorta: ' + x));
      if (est.padre !== 'body') malIdioma.push(caso.nombre + ': el desplegable cuelga de ' + est.padre + ', no de <body>');
      let aviso = '';
      if (caso.aviso) {
        try { await q.waitForSelector('.pwa-install-banner.show', { timeout: 8000 }); aviso = ', con el aviso de instalar a la vista'; }
        catch (e) { aviso = ' (el aviso de instalar no salio)'; }
      }
      const bt = await q.evaluate(() => { const r = document.getElementById('lang-btn').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
      await q.touchscreen.tap(bt.x, bt.y);
      await q.waitForTimeout(500);
      const ab = await q.evaluate(() => {
        const dd = document.getElementById('lang-dropdown'), r = dd.getBoundingClientRect();
        return { abierto: dd.classList.contains('open') && getComputedStyle(dd).display !== 'none',
                 dentro: r.left >= 0 && r.top >= 0 && r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1,
                 desliza: dd.scrollHeight > dd.clientHeight + 1, r: [r.left, r.top, r.right, r.bottom].map(Math.round), vw: innerWidth, vh: innerHeight };
      });
      if (!ab.abierto) { malIdioma.push(caso.nombre + ': al tocar el boton la lista no se abre'); continue; }
      if (!ab.dentro) malIdioma.push(caso.nombre + ': la lista se sale de la pantalla ' + JSON.stringify(ab.r) + ' en ' + ab.vw + ' x ' + ab.vh);
      if (!caso.aviso && !ab.desliza) malIdioma.push(caso.nombre + ': los diez no caben y la lista no se desliza');
      /* cada idioma, traido a la vista dentro de la lista: lo que hay bajo su centro tiene que ser el */
      const tapados = await q.evaluate(async () => {
        const dd = document.getElementById('lang-dropdown'), mal = [];
        for (const o of dd.querySelectorAll('.lang-option')) {
          o.scrollIntoView({ block: 'nearest' });
          await new Promise(r => setTimeout(r, 60));
          const r = o.getBoundingClientRect(), e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
          if (!e || !dd.contains(e)) mal.push(o.textContent.replace(/\s+/g, ' ').trim() + ' tapado por ' + (e ? (e.id ? '#' + e.id : e.tagName.toLowerCase() + '.' + [...e.classList].join('.')) : 'nada'));
        }
        return { mal, sigue: dd.classList.contains('open') };
      });
      tapados.mal.forEach(x => malIdioma.push(caso.nombre + aviso + ': ' + x));
      if (!tapados.sigue) malIdioma.push(caso.nombre + ': deslizar la lista la cierra');
      /* y el ultimo, con el dedo: la app pasa al polaco y la lista se cierra */
      const ult = await q.evaluate(() => { const o = [...document.querySelectorAll('#lang-dropdown .lang-option')].pop(); o.scrollIntoView({ block: 'nearest' }); const r = o.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
      await q.waitForTimeout(150);
      await q.touchscreen.tap(ult.x, ult.y);
      await q.waitForTimeout(600);
      const tras = await q.evaluate(() => ({ lang: currentLang, html: document.documentElement.lang, abierto: document.getElementById('lang-dropdown').classList.contains('open') }));
      if (tras.lang !== 'pl' || tras.html !== 'pl') malIdioma.push(caso.nombre + ': tocar «Polski» deja la app en ' + tras.lang + ' / ' + tras.html);
      if (tras.abierto) malIdioma.push(caso.nombre + ': tras elegir, la lista sigue abierta');
      errQ.forEach(x => malIdioma.push(caso.nombre + ': error de pagina: ' + x));
      pasoIdioma.push(caso.nombre + aviso + (ab.desliza ? ', la lista se desliza' : ''));
    } catch (e) {
      malIdioma.push(caso.nombre + ': la prueba se cayo: ' + e.message.split('\n')[0]);
    } finally {
      await ctx.close();
    }
  }
  if (malIdioma.length) {
    fallos++;
    console.log('  MAL  el desplegable del idioma de la barra: ' + malIdioma.length + ' fallo(s)');
    malIdioma.slice(0, 8).forEach(x => console.log('           ' + x));
  } else {
    console.log('  ok   el desplegable del idioma, con el dedo, fuera de toda caja con scroll y sin nada encima: ' + pasoIdioma.join(' · '));
  }

  /* El popup en castellano y el de los otros nueve no pueden decir lo MISMO:
     si coinciden es que el texto esta escrito a pelo y no pasa por el idioma,
     que es justo lo que pasaba con «Ver descripcion completa». */
  const iguales = Object.entries(popups).filter(([L, t]) => L !== 'es' && t === popups.es).map(([L]) => L);
  P('idiomas cuyo popup dice lo mismo que el castellano', iguales.length + (iguales.length ? '  (' + iguales.join(' ') + ')' : ''));
  if (iguales.length) fallos++;
  const sinPopup = IDIOMAS.filter(L => !popups[L]);
  if (sinPopup.length) { P('idiomas en los que no se pudo abrir el popup', sinPopup.join(' ')); fallos++; }
  P('boton de favoritos de la hoja de detalle', IDIOMAS.map(L => L + ' «' + favs[L] + '»').join('  '));
  P('errores de pagina', errores.length);
  if (errores.length) fallos++;
  console.log('\n' + (fallos ? '*** ' + fallos + ' idioma(s) con algo fuera de sitio ***'
                             : 'nada se sale y el popup habla en su idioma'));
  await b.close();
  process.exit(fallos ? 1 : 0);
})();
