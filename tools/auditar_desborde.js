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
 * Y LAS CAJAS DONDE SE ESCRIBE (bloque 6, nota 48, 4a): desde el 17 de noviembre de 2026
 * la pagina se puede ampliar con dos dedos, y el iPhone amplia solo al tocar una caja con
 * la letra de menos de 16 px: ninguna baja de 16, y a 320 px nada se corta ni se sale.
 *
 *     node tools/auditar_desborde.js [puerto]
 */
'use strict';
const { chromium, devices } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
const path = require('path');
const IDIOMAS = ['es', 'en', 'fr', 'de', 'it', 'nl', 'zh', 'zht', 'bg', 'pl', 'ro'];
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

      /* 2 · abrir un pin y leer lo que dice su popup.
         Se espera a que ESE popup este abierto, hasta 5 s, y se lee dentro de el (19 de noviembre de 2026). Antes se
         miraba a los 500 ms justos, en todo el documento. Desde que el mapa abre con la isla entera (a 360 px, zoom 9;
         antes 8,5), el salto al grupo del Teide (zoom 13) es de 4 niveles y Leaflet lo anima (zoomAnimationThreshold:
         4): con la cola de markercluster, el popup sale a los 0,6 s (antes, sin animar, a los 0,35 s), y a los 500 ms
         la prueba no lo encontraba. Lo que se mira es lo que dice, no lo rapido que sale. Y antes se cierra el que
         hubiera abierto, para no leer el del idioma anterior mientras se apaga. */
      const pl = places.find(x => x.id === 'teide') || places[0];
      const mk = (typeof markerMap !== 'undefined') ? markerMap[pl.id] : null;
      if (mk && mk.openPopup) {
        try {
          map.closePopup();
          if (typeof clusterGroup !== 'undefined' && clusterGroup.hasLayer(mk))
            clusterGroup.zoomToShowLayer(mk, () => mk.openPopup());
          else mk.openPopup();
        } catch (e) {}
        const tP = Date.now();
        while (!mk.isPopupOpen() && Date.now() - tP < 5000)
          await new Promise(r2 => setTimeout(r2, 100));
      }
      const caja = (mk && mk.isPopupOpen && mk.isPopupOpen()) ? mk.getPopup().getElement() : null;
      const hint = caja ? caja.querySelector('.popup-tap-hint') : null;
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
           se traducen en los otros diez: alguna TIENE que cambiar. */
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
     tres ultimos idiomas) y en un movil tumbado, donde los once no caben y
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
      if (!caso.aviso && !ab.desliza) malIdioma.push(caso.nombre + ': los once no caben y la lista no se desliza');
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
      if (tras.lang !== 'ro' || tras.html !== 'ro') malIdioma.push(caso.nombre + ': tocar «Română» deja la app en ' + tras.lang + ' / ' + tras.html);
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

  /* 5 · LA MARCA DE LA BARRA, ENTERA O SOLO EL LOGO. Decision del dueño, el
     15 de noviembre de 2026: «TENERIFE GO» no se queda recortado con «…»
     cuando no cabe al lado del logo; se queda solo el logo. Antes se
     recortaba de 320 a 450 px y de 501 a 650 px. Se mira en muchos anchos:
     o el nombre entero o el texto escondido (1 px), el eslogan nunca
     recortado, el h1 siempre en la pagina para los lectores de pantalla, la
     barra dentro de la pantalla; y en la misma pagina, al cambiar de ancho,
     la marca va y vuelve sola. */
  const malMarca = [], vistoMarca = {}, frescaEs = {};
  const mideMarca = () => {
    const m = document.querySelector('.topbar-brand'), h = m.querySelector('h1');
    const s = m.querySelector('.topbar-brand-text span'), txt = m.querySelector('.topbar-brand-text');
    const ve = e => !!e && e.getClientRects().length > 0 && getComputedStyle(e).display !== 'none';
    const logo = m.classList.contains('solo-logo');
    return { logo, ancho: Math.round(txt.getBoundingClientRect().width), quitado: getComputedStyle(txt).display === 'none',
             nombre: h.textContent.trim(), corta: !logo && h.scrollWidth > h.clientWidth + 1,
             esloganCorta: !logo && ve(s) && s.scrollWidth > s.clientWidth + 1,
             fuera: Math.round(document.querySelector('.topbar-right').getBoundingClientRect().right) > innerWidth + 1 };
  };
  const anchosMarca = { es: [320, 360, 390, 430, 460, 480, 500, 501, 600, 650, 700, 768, 1280] };
  for (const L of IDIOMAS) if (L !== 'es') anchosMarca[L] = [360, 600, 768];
  for (const L of IDIOMAS) {
    const fila = [];
    for (const w of anchosMarca[L]) {
      const ctx = await b.newContext({ viewport: { width: w, height: 800 }, serviceWorkers: 'block' });
      const q = await ctx.newPage(), errM = [];
      q.on('pageerror', e => errM.push(e.message));
      try {
        await q.addInitScript(l => { try { localStorage.setItem('tenerife.tour.seen', '99'); localStorage.setItem('tg_lang', l); } catch (e) {} }, L);
        await q.goto('http://127.0.0.1:' + puerto + '/index.html', { waitUntil: 'load', timeout: 60000 });
        await q.waitForFunction(() => typeof setLang === 'function', null, { timeout: 30000 });
        if (await q.isVisible('#v19-welcome-start')) { await q.click('#v19-welcome-start'); }
        await q.evaluate(l => setLang(l), L);
        await q.waitForTimeout(1200);
        const r = await q.evaluate(mideMarca);
        const ojo = [];
        if (r.corta) ojo.push('«TENERIFE GO» recortado con «…»');
        if (r.esloganCorta) ojo.push('el eslogan recortado');
        if (r.logo && r.ancho > 1) ojo.push('solo el logo, pero el texto ocupa ' + r.ancho + ' px');
        if (r.quitado || r.nombre !== 'TENERIFE GO') ojo.push('el h1 ya no esta en la pagina');
        if (r.fuera) ojo.push('los botones se salen de la pantalla');
        errM.forEach(x => ojo.push('error de pagina: ' + x));
        ojo.forEach(x => malMarca.push(L + ' a ' + w + ' px: ' + x));
        fila.push(w + (r.logo ? ' logo' : ' entera'));
        if (L === 'es') frescaEs[w] = r.logo ? 'logo' : 'entera';
      } catch (e) {
        malMarca.push(L + ' a ' + w + ' px: la prueba se cayo: ' + e.message.split('\n')[0]);
      } finally {
        await ctx.close();
      }
    }
    vistoMarca[L] = fila.join(', ');
  }
  {
    const ctx = await b.newContext({ viewport: { width: 360, height: 800 }, serviceWorkers: 'block' });
    const q = await ctx.newPage(), errM = [];
    q.on('pageerror', e => errM.push(e.message));
    try {
      await q.addInitScript(() => { try { localStorage.setItem('tenerife.tour.seen', '99'); localStorage.setItem('tg_lang', 'es'); } catch (e) {} });
      await q.goto('http://127.0.0.1:' + puerto + '/index.html', { waitUntil: 'load', timeout: 60000 });
      await q.waitForFunction(() => typeof setLang === 'function', null, { timeout: 30000 });
      if (await q.isVisible('#v19-welcome-start')) { await q.click('#v19-welcome-start'); }
      await q.waitForTimeout(1200);
      const pasos = [];
      /* lo que sale al cambiar de ancho tiene que ser lo mismo que al abrir
         la pagina en ese ancho (arriba), en las dos direcciones */
      for (const w of [360, 480, 600, 768, 390, 1280, 320]) {
        await q.setViewportSize({ width: w, height: 800 });
        await q.waitForTimeout(400);
        const r = await q.evaluate(mideMarca);
        pasos.push(w + (r.logo ? ' logo' : ' entera'));
        if (r.corta || r.esloganCorta) malMarca.push('al pasar a ' + w + ' px en la misma pagina: queda recortada');
        if (frescaEs[w] && frescaEs[w] !== (r.logo ? 'logo' : 'entera')) malMarca.push('al pasar a ' + w + ' px en la misma pagina queda ' + (r.logo ? 'solo el logo' : 'entera') + ', y abriendola en ese ancho, ' + (frescaEs[w] === 'logo' ? 'solo el logo' : 'entera'));
      }
      errM.forEach(x => malMarca.push('al cambiar de ancho: error de pagina: ' + x));
      vistoMarca['cambiando el ancho'] = pasos.join(', ');
    } catch (e) {
      malMarca.push('al cambiar de ancho: la prueba se cayo: ' + e.message.split('\n')[0]);
    } finally {
      await ctx.close();
    }
  }
  if (malMarca.length) {
    fallos++;
    console.log('  MAL  la marca de la barra: ' + malMarca.length + ' fallo(s)');
    malMarca.slice(0, 10).forEach(x => console.log('           ' + x));
  } else {
    console.log('  ok   la marca de la barra, entera o solo el logo, nunca recortada: ' + IDIOMAS.map(L => L + ' ' + vistoMarca[L]).join(' · ') + '; cambiando el ancho en la misma pagina: ' + vistoMarca['cambiando el ancho']);
  }

  /* 6 · LAS CAJAS DONDE SE ESCRIBE, A 16 PX, Y LA PAGINA QUE SE PUEDE AMPLIAR.
     Nota 48, 4a (Jerome, 17 de noviembre de 2026: «A»). Hasta ese dia la pagina no dejaba ampliar con dos
     dedos (user-scalable=no). Sin eso, el iPhone (Safari y la app de la App Store, que usa WKWebView) amplia la
     pagina solo al tocar una caja con la letra de menos de 16 px, y la deja ampliada: por eso ninguna baja de
     16 px. Se mira:
     a) en el disco, la etiqueta viewport de las cuatro paginas: ni user-scalable=no ni maximum-scale por
        debajo de 2 (WCAG 2.2, 1.4.4); y que las cajas de copiar que se fabrican al vuelo lleven sus 16 px;
     b) en una pagina con todo abierto (el buscador, la ruta, las paradas, el asistente, la cuenta, el perfil,
        «Su cuerpo» con su «Evolucion», y el cielo con su catalogo, su fecha y «Apunta al cielo»): la letra de
        TODAS las cajas, se vean o no;
     c) en los once idiomas a 320 px, en cada pantalla con cajas (desde el 18-11-2026, tambien «Musculos» de «Su
        cuerpo», con la zona del tiempo y el deporte): la letra de las que se ven, que el ejemplo
        (placeholder) quepa entero, que nada de su fila se salga, y que la fecha de «Su evolucion» quepa con el
        formato del iPhone (dateStyle medium, el mismo CLDR), la mas ancha del año en los once idiomas y en
        ingles de EE. UU.; la fecha, tambien a 375 px, el primer ancho en que va al lado del peso. */
  const malCaja = [], vistoCaja = [];
  {
    const RAIZ = path.join(__dirname, '..');
    for (const f of ['index.html', '404.html', 'privacidad.html', 'borrar-cuenta.html']) {
      const h = fs.readFileSync(path.join(RAIZ, f), 'utf8');
      const vs = [...h.matchAll(/<meta\s+name="viewport"\s+content="([^"]*)"/gi)].map(m => m[1].toLowerCase().replace(/\s+/g, ''));
      if (vs.length !== 1) { malCaja.push(f + ': ' + vs.length + ' etiquetas viewport (tiene que haber una)'); continue; }
      if (/(^|,)user-scalable=(no|0)(,|$)/.test(vs[0])) malCaja.push(f + ': la etiqueta viewport no deja ampliar (user-scalable=no)');
      const mx = vs[0].match(/(^|,)maximum-scale=([\d.]+)/);
      if (mx && parseFloat(mx[2]) < 2) malCaja.push(f + ': maximum-scale=' + mx[2] + ', por debajo de 2');
    }
    const lineas = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8').split('\n');
    let copiar = 0;
    lineas.forEach((l, i) => {
      if (!/createElement\(['"]textarea['"]\)/.test(l)) return;
      copiar++;
      if (!lineas.slice(i, i + 6).some(x => /\.style\.fontSize\s*=\s*['"]16px['"]/.test(x))) malCaja.push('index.html, linea ' + (i + 1) + ': una caja de copiar sin sus 16 px');
    });
    vistoCaja.push('viewport de las 4 paginas', copiar + ' cajas de copiar');
  }
  const cajasDe = (escondidas) => {
    const NO = /^(hidden|checkbox|radio|range|file|button|submit|reset|color|image)$/i;
    const cv = document.createElement('canvas').getContext('2d');
    return [...document.querySelectorAll('input, select, textarea')].filter(e => !(e.tagName === 'INPUT' && NO.test(e.type)))
      .filter(e => { if (escondidas) return true; const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.opacity !== '0'; })
      .map(e => {
        const cs = getComputedStyle(e);
        const nombre = e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/).join('.') : '');
        if (escondidas) return { nombre, px: parseFloat(cs.fontSize) };
        const hueco = e.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
        let ejemplo = 0;
        if (e.placeholder) { const ph = getComputedStyle(e, '::placeholder'); cv.font = [ph.fontStyle, ph.fontWeight, ph.fontSize, ph.fontFamily].join(' '); ejemplo = cv.measureText(e.placeholder).width; }
        /* la fila: ni la caja ni sus hermanos (el boton →, enviar…) pasan el borde derecho de la fila, de sus
           cuatro contenedores ni de la pantalla */
        const pa = e.parentElement; let sale = 0;
        for (let a = pa, k = 0; k < 5 && a && a !== document.body; k++, a = a.parentElement) {
          const ra = a.getBoundingClientRect();
          for (const h of pa.children) { const rh = h.getBoundingClientRect(); if (rh.width > 0) sale = Math.max(sale, rh.right - ra.right, rh.right - innerWidth); }
        }
        const o = { nombre, px: parseFloat(cs.fontSize), hueco: Math.round(hueco), ejemplo: Math.round(ejemplo), ph: e.placeholder || '', sale: Math.round(sale) };
        if (e.type === 'date') {
          cv.font = [cs.fontStyle, cs.fontWeight, cs.fontSize, cs.fontFamily].join(' ');
          let ancha = { w: 0, t: '' };
          for (const loc of ['es-ES', 'en-US', 'en-GB', 'fr-FR', 'de-DE', 'it-IT', 'nl-NL', 'zh-CN', 'zh-TW', 'bg-BG', 'pl-PL'])
            for (let m = 0; m < 12; m++) { const t = new Intl.DateTimeFormat(loc, { dateStyle: 'medium' }).format(new Date(2026, m, 28, 12)); const w = cv.measureText(t).width; if (w > ancha.w) ancha = { w, t }; }
          o.fecha = { w: Math.round(ancha.w), t: ancha.t };
        }
        return o;
      });
  };
  /* las pantallas: cada una abre lo suyo en una pagina nueva; la de «Evolucion» y la del cielo pasan por
     varios pasos y miden en cada uno */
  const abrirSuCuerpo = async q => {
    await q.evaluate(() => abrirPerfil());
    await q.waitForFunction(() => window.TG_PERFIL && document.getElementById('perfil-panel') && !document.getElementById('perfil-panel').hidden, null, { timeout: 20000 });
    await q.evaluate(() => TG_PERFIL.pestana('cuerpo'));
    await q.waitForFunction(() => window.TG_CUERPO && document.querySelector('#tgp-cuerpo-mini svg'), null, { timeout: 30000 });
    await q.evaluate(() => { if (!TG_CUERPO.abierto()) document.getElementById('tgp-cuerpo-abrir').click(); });
    await q.waitForFunction(() => TG_CUERPO.abierto() && !document.getElementById('cuerpo-panel').hidden, null, { timeout: 20000 });
  };
  /* «Musculos», la vista de entrada de «Su cuerpo», con la zona del tiempo de «Hoy en la isla» y el deporte (18-11-2026:
     con la letra a 16 px, a 320 px la zona se salia en frances y el deporte en bulgaro; lo vio probar_cuerpo.js) */
  const abrirMusculos = async q => {
    await abrirSuCuerpo(q);
    await q.evaluate(() => document.getElementById('tgc-modo-m').click());
    await q.waitForFunction(() => !document.getElementById('tgc-vista-musculos').hidden && document.getElementById('tgc-hoy-zona') && document.getElementById('tgc-dep-sel'), null, { timeout: 20000 });
    await q.waitForTimeout(400);
  };
  const abrirEvolucion = async q => {
    await abrirSuCuerpo(q);
    /* el boton «Evolucion», pulsado desde la pagina: en la pagina con todo abierto, otras ventanas lo tapan */
    await q.evaluate(() => document.getElementById('tgc-modo-e').click());
    await q.waitForFunction(() => !document.getElementById('tgc-vista-evolucion').hidden && document.getElementById('tgp-peso-fecha'), null, { timeout: 20000 });
    await q.waitForTimeout(400);
    await q.evaluate(() => { const f = document.getElementById('tgp-peso-fecha'); if (f) f.scrollIntoView({ block: 'center' }); });
  };
  const cieloPasos = async (q, mide) => {
    await q.evaluate(async () => { await window.TG_CIELO_CARGAR(); await TG_CIELO.cargar(); });
    await q.evaluate(() => TG_CIELO.ver('catalogo')); await q.waitForTimeout(400); await mide('cielo, catalogo');
    /* otra noche, para que salga tambien «Hoy»; y el campo de la fecha a la vista, como donde el navegador no
       sabe abrir el calendario (showPicker) */
    await q.evaluate(() => TG_CIELO.ver('noche', '2026-12-13')); await q.waitForTimeout(300); await mide('cielo, la fecha escondida');
    await q.evaluate(() => document.querySelector('.cielo-fecha-input').classList.add('visto')); await q.waitForTimeout(150); await mide('cielo, la fecha a la vista');
    await q.evaluate(() => document.querySelector('.cielo-fecha-input').classList.remove('visto'));   // que no se mida otra vez debajo de la vista
    await q.evaluate(() => TG_CIELO.vista({})); await q.waitForTimeout(500);
    await q.evaluate(() => { const bt = [...document.querySelectorAll('#cielo-vista button')].find(x => x.textContent.trim() === '🔍'); if (bt) bt.click(); });
    await q.waitForTimeout(300); await mide('cielo, «Apunta al cielo»');
  };
  const PANTALLAS = {
    mapa: q => q.evaluate(() => openSearch({ stopPropagation() {}, preventDefault() {}, target: document.getElementById('search-input-wrap') })),
    ruta: q => q.evaluate(() => { openRoutePanel(); switchRouteTab('ab'); }),
    guagua: q => q.evaluate(() => toggleBusPanel()),
    asistente: q => q.evaluate(() => openChatPanel()),
    cuenta: q => q.evaluate(() => (window.openAuthModal || openAuthModal)()),
    musculos: abrirMusculos,
    evolucion: abrirEvolucion,
  };
  const paginaCaja = async (w, L, errC) => {
    const ctx = await b.newContext({ viewport: { width: w, height: 780 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
    await ctx.route('**/*', r => { let h = ''; try { h = new URL(r.request().url()).host; } catch (e) {} return h === '127.0.0.1:' + puerto ? r.continue() : r.abort(); });
    await ctx.addInitScript(l => { try {
      localStorage.setItem('tenerife.tour.seen', '99'); localStorage.setItem('tenerife.welcome.seen', '1'); localStorage.setItem('tenerife.cuerpo.3d', 'no');
      localStorage.setItem('tgo_consent', JSON.stringify({ v: 'denied', t: Date.now() })); localStorage.setItem('tg_lang', l);
    } catch (e) {} window.TG_CUERPO_SIN_FIESTA = true; }, L);
    const q = await ctx.newPage();
    q.on('pageerror', e => errC.push(e.message));
    await q.goto('http://127.0.0.1:' + puerto + '/index.html', { waitUntil: 'load', timeout: 60000 });
    await q.waitForFunction(l => typeof setLang === 'function' && typeof places !== 'undefined' && places.length > 100 && currentLang === l, L, { timeout: 30000 });
    await q.evaluate(() => document.querySelectorAll('.v19-tour, .v19-tour-prompt, .v19-tour-overlay, #v19-welcome').forEach(e => e.remove()));
    return { ctx, q };
  };
  /* b) todas las cajas, se vean o no */
  {
    const errC = [], letra = new Map();
    let pg = null;
    try {
      pg = await paginaCaja(390, 'es', errC);
      const q = pg.q;
      const anota = async () => { for (const c of await q.evaluate(cajasDe, true)) letra.set(c.nombre, Math.min(c.px, letra.has(c.nombre) ? letra.get(c.nombre) : 99)); };
      for (const k of ['mapa', 'ruta', 'guagua', 'asistente', 'cuenta']) { await PANTALLAS[k](q); await q.waitForTimeout(250); await anota(); }
      await abrirEvolucion(q); await anota();
      await cieloPasos(q, anota);
      const peq = [...letra].filter(([, px]) => px < 16);
      peq.forEach(([n, px]) => malCaja.push('letra de ' + px + ' px: ' + n));
      vistoCaja.push(letra.size + ' cajas, se vean o no');
    } catch (e) { malCaja.push('todas las cajas: la prueba se cayo: ' + e.message.split('\n')[0]); }
    finally { if (pg) await pg.ctx.close(); }
    errC.forEach(x => malCaja.push('todas las cajas: error de pagina: ' + x));
  }
  /* c) en los once idiomas a 320 px (y la fecha, tambien a 375) */
  {
    let medidas = 0;
    const casos = [];
    for (const L of IDIOMAS) for (const k of [...Object.keys(PANTALLAS), 'cielo']) casos.push([320, L, k]);
    casos.push([375, 'es', 'evolucion']);
    for (const [w, L, k] of casos) {
      const errC = []; let pg = null;
      try {
        pg = await paginaCaja(w, L, errC);
        const q = pg.q;
        const mide = async donde => {
          for (const c of await q.evaluate(cajasDe, false)) {
            medidas++;
            const d = L + ' a ' + w + ' px, ' + donde + ', ' + c.nombre + ': ';
            if (c.px < 16) malCaja.push(d + 'letra de ' + c.px + ' px');
            if (c.ph && c.ejemplo > c.hueco + 0.5) malCaja.push(d + 'el ejemplo «' + c.ph + '» no cabe (' + c.ejemplo + ' px en ' + c.hueco + ')');
            if (c.sale > 1) malCaja.push(d + 'algo de su fila se sale ' + c.sale + ' px');
            if (c.fecha && c.fecha.w > c.hueco + 0.5) malCaja.push(d + 'la fecha «' + c.fecha.t + '» no cabe (' + c.fecha.w + ' px en ' + c.hueco + ')');
          }
        };
        if (k === 'cielo') await cieloPasos(q, mide);
        else { await PANTALLAS[k](q); await q.waitForTimeout(k === 'evolucion' ? 100 : 700); await mide(k); }
      } catch (e) { malCaja.push(L + ' a ' + w + ' px, ' + k + ': la prueba se cayo: ' + e.message.split('\n')[0]); }
      finally { if (pg) await pg.ctx.close(); }
      errC.forEach(x => malCaja.push(L + ' a ' + w + ' px, ' + k + ': error de pagina: ' + x));
    }
    vistoCaja.push(medidas + ' cajas a la vista en ' + casos.length + ' pantallas (once idiomas a 320 px y la fecha a 375)');
  }
  if (malCaja.length) {
    fallos++;
    console.log('  MAL  las cajas donde se escribe (16 px) y el zoom: ' + malCaja.length + ' fallo(s)');
    malCaja.slice(0, 14).forEach(x => console.log('           ' + x));
  } else {
    console.log('  ok   las cajas donde se escribe, a 16 px, y la pagina se puede ampliar: ' + vistoCaja.join(' · '));
  }

  /* El popup en castellano y el de los otros diez no pueden decir lo MISMO:
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
