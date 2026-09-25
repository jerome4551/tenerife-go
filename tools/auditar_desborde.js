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
 *     node tools/auditar_desborde.js [puerto]
 */
'use strict';
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const IDIOMAS = ['es', 'en', 'fr', 'de', 'it', 'nl', 'zh', 'zht', 'bg', 'pl'];
const ANCHO = 360, ALTO = 740;           // un movil estrecho de los de verdad
const MARGEN = 2;                        // px de tolerancia por redondeo

(async () => {
  const puerto = process.argv[2] || '8777';
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: ANCHO, height: ALTO } });
  const errores = [];
  p.on('pageerror', e => errores.push(e.message));
  await p.goto('http://127.0.0.1:' + puerto + '/index.html', { waitUntil: 'networkidle' });
  await p.waitForTimeout(2500);

  let fallos = 0;
  const popups = {};
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
      return o;
    }, { lang: L, ancho: ANCHO, margen: MARGEN });

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

  /* El popup en castellano y el de los otros nueve no pueden decir lo MISMO:
     si coinciden es que el texto esta escrito a pelo y no pasa por el idioma,
     que es justo lo que pasaba con «Ver descripcion completa». */
  const iguales = Object.entries(popups).filter(([L, t]) => L !== 'es' && t === popups.es).map(([L]) => L);
  P('idiomas cuyo popup dice lo mismo que el castellano', iguales.length + (iguales.length ? '  (' + iguales.join(' ') + ')' : ''));
  if (iguales.length) fallos++;
  const sinPopup = IDIOMAS.filter(L => !popups[L]);
  if (sinPopup.length) { P('idiomas en los que no se pudo abrir el popup', sinPopup.join(' ')); fallos++; }
  P('errores de pagina', errores.length);
  if (errores.length) fallos++;
  console.log('\n' + (fallos ? '*** ' + fallos + ' idioma(s) con algo fuera de sitio ***'
                             : 'nada se sale y el popup habla en su idioma'));
  await b.close();
  process.exit(fallos ? 1 : 0);
})();
