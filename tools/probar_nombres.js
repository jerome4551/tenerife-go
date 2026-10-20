#!/usr/bin/env node
/* probar_nombres.js — el asistente encuentra cada lugar por su nombre, en los
 * diez idiomas.
 *
 * EL HUECO QUE TAPA
 *   El 20 de octubre de 2026 se le pregunto al asistente por cada uno de los
 *   980 lugares, con su nombre, en seis idiomas. En castellano no encontraba
 *   170; en chino, 638. Ningun control lo miraba: probar_faq.js corre sin
 *   lugares y probar_movil.js hace 25 preguntas. Por dentro:
 *     · «Playa La Arena», «Golf del Sur», «Hospital del Sur de Tenerife»: todas
 *       sus palabras son de categoria o de zona y salia la lista de la
 *       categoria, nunca el lugar;
 *     · «masca在哪里»: el chino no deja espacio y el nombre quedaba pegado;
 *     · «Arona», «Adeje», «Arico», «Arafo»: el nombre era demasiado corto para
 *       contar como nombre entero;
 *     · «Castillo de San Miguel»: empataba con dos campos de golf de San Miguel
 *       de Abona y ganaba el que iba antes en el fichero.
 *
 * COMO
 *   La app entera en un navegador, como probar_movil.js. Para cada idioma, la
 *   pregunta es la del boton «¿Dónde está Masca?» de ese idioma, con el nombre
 *   del lugar en lugar de Masca; en chino, ademas, pegada («X在哪里»), que es
 *   como se escribe. Lo que se exige:
 *     · por el NOMBRE ENTERO, cada lugar sale: su ficha, o la lista para elegir
 *       cuando hay otro que se llama igual («Playa San Juan» la playa y el
 *       pueblo). Uno solo que no salga y el control se pone en rojo;
 *     · por el nombre CORTO, sin el parentesis ni lo que va detras de « — »
 *       («Farmacia Anaga» por «Farmacia Anaga (Santa Cruz)»), se cuenta y se
 *       dice, sin exigir: muchos cortos son de verdad de varios lugares
 *       («Parapente» son seis despegues) y entonces lo bueno es la lista.
 *
 *     node tools/probar_nombres.js [puerto]
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const PUERTO = process.argv[2] || '8777';
const BASE = 'http://127.0.0.1:' + PUERTO + '/index.html';
const IDIOMAS = ['es', 'en', 'fr', 'de', 'it', 'nl', 'zh', 'zht', 'bg', 'pl'];

(async () => {
  const nav = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const pg = await (await nav.newContext({ serviceWorkers: 'block' })).newPage();
  await pg.route('**/cdn.jsdelivr.net/**', r => r.abort());
  await pg.addInitScript(() => {
    try { localStorage.setItem('tenerife.tour.seen', '99'); localStorage.setItem('tenerife.welcome.seen', '1'); } catch (e) {}
  });
  await pg.goto(BASE, { waitUntil: 'networkidle' });
  let mal = 0;
  console.log('=== cada lugar, preguntado por su nombre ===');
  for (const L of IDIOMAS) {
    /* Hasta que no llega faq/<idioma>.json, TG_FAQ sigue con las entradas
       del idioma de antes: esperar a «hay entradas» no basta, y se pregunta
       en bulgaro con la base china. Se espera a ver un rotulo de ESTE idioma. */
    const rotulo = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'faq', L + '.json'), 'utf8')).e[0].l;
    await pg.evaluate(l => setLang(l), L);
    const llego = await pg.waitForFunction(([l, rot]) => currentLang === l &&
      TG_FAQ.entradas().some(x => x.keys.indexOf(rot) >= 0), [L, rotulo], { timeout: 15000 }).then(() => true, () => false);
    if (!llego) { console.log('  MAL  [' + L + '] no llega faq/' + L + '.json'); mal++; continue; }
    const r = await pg.evaluate(() => {
      const boton = (chatT('qrHome') || [])[2];
      const rotulo = Array.isArray(boton) ? boton[0] : boton;
      if (!rotulo || rotulo.indexOf('Masca') < 0) return { error: 'el boton «¿Dónde está Masca?» no lleva «Masca»: ' + rotulo };
      const plantillas = [rotulo.split('Masca').join('{x}')];
      if (currentLang === 'zh') plantillas.push('{x}在哪里');
      if (currentLang === 'zht') plantillas.push('{x}在哪裡');
      const sale = (a, id) => (a.kind === 'poi' && a.p && a.p.id === id) ||
        (a.kind === 'poiList' && (a.list || []).some(q => q.id === id));
      const corto = n => n.replace(/\s*\([^)]*\)\s*$/, '').replace(/\s+[—-]\s+.*$/, '').trim();
      const out = { plantillas, entero: 0, fallan: [], corto: 0, cortoElegir: 0, total: places.length };
      for (const pl of plantillas) {
        for (const p of places) {
          chatPending = null;
          const a = chatResolve(pl.split('{x}').join(p.name));
          if (sale(a, p.id)) out.entero++;
          else out.fallan.push(p.id + ' «' + p.name + '» → ' + a.kind + (a.p ? ':' + a.p.id : '') + (a.item ? ':' + a.item.id : ''));
        }
      }
      for (const p of places) {
        chatPending = null;
        const a = chatResolve(plantillas[0].split('{x}').join(corto(p.name)));
        if (a.kind === 'poi' && a.p && a.p.id === p.id) out.corto++;
        else if (sale(a, p.id)) out.cortoElegir++;
      }
      return out;
    });
    if (r.error) { console.log('  MAL  [' + L + '] ' + r.error); mal++; continue; }
    const pedidas = r.total * r.plantillas.length;
    const ok = r.entero === pedidas;
    if (!ok) mal++;
    console.log((ok ? '  ok   ' : '  MAL  ') + ('[' + L + ']').padEnd(6) + ' nombre entero: ' + r.entero + ' de ' + pedidas +
      '  (' + r.plantillas.map(x => '«' + x + '»').join(' y ') + ')');
    console.log('        nombre corto, sin exigir: ' + r.corto + ' su ficha, ' + r.cortoElegir + ' para elegir entre los que se llaman igual, de ' + r.total);
    for (const f of r.fallan.slice(0, 12)) console.log('        no sale: ' + f);
    if (r.fallan.length > 12) console.log('        … y ' + (r.fallan.length - 12) + ' mas');
  }
  await nav.close();
  console.log(mal ? '\n*** ' + mal + ' idioma(s) donde el asistente no encuentra algun lugar por su nombre ***'
                  : '\nel asistente encuentra cada lugar por su nombre, en los diez idiomas');
  process.exit(mal ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
