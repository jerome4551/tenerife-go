#!/usr/bin/env node
/* probar_nombres.js — el asistente encuentra cada lugar por su nombre y cada
 * categoria por su rotulo, en los once idiomas.
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
 *   Y tres categorias del mapa -Parkings, Ayuda & Apoyo y Puertos
 *   Comerciales- no las conocia: el asistente tenia su propia lista de
 *   categorias, y al anadir una al mapa nadie la anadia alli.
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
 *       («Parapente» son seis despegues) y entonces lo bueno es la lista;
 *     · cada categoria del menu del mapa, pedida con su rotulo de ese idioma,
 *       saca la lista de esa categoria («Gasolineras más baratas», que no
 *       tiene lugares propios, la de las gasolineras: CHAT_CAT_TAMBIEN).
 *
 *     node tools/probar_nombres.js [puerto]
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const PUERTO = process.argv[2] || '8777';
const BASE = 'http://127.0.0.1:' + PUERTO + '/index.html';
const IDIOMAS = ['es', 'en', 'fr', 'de', 'it', 'nl', 'zh', 'zht', 'bg', 'pl', 'ro'];

(async () => {
  const nav = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const pg = await (await nav.newContext({ serviceWorkers: 'block' })).newPage();
  await pg.route('**/vendor/supabase.js', r => r.abort());
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
      /* las categorias del menu, por su rotulo */
      const rot = (LANGS[currentLang] || {}).categories || {};
      const destino = {};
      const tambien = (typeof CHAT_CAT_TAMBIEN !== 'undefined') ? CHAT_CAT_TAMBIEN : {};
      for (const k of Object.keys(tambien)) for (const k2 of tambien[k]) destino[k2] = k;
      out.cats = Object.keys(categoriesBase).length; out.catsMal = [];
      for (const k of Object.keys(categoriesBase)) {
        chatPending = null;
        const a = rot[k] ? chatResolve(rot[k]) : { kind: 'sin rotulo' };
        const quiere = destino[k] || k;
        if (!(a.kind === 'cat' && a.cats.keys.indexOf(quiere) >= 0))
          out.catsMal.push(k + ' «' + (rot[k] || '') + '» → ' + a.kind + (a.cats ? ':' + a.cats.keys.join('+') : '') + (a.item ? ':' + a.item.id : '') + (a.p ? ':' + a.p.id : ''));
      }
      return out;
    });
    if (r.error) { console.log('  MAL  [' + L + '] ' + r.error); mal++; continue; }
    const pedidas = r.total * r.plantillas.length;
    const ok = r.entero === pedidas && !r.catsMal.length;
    if (!ok) mal++;
    console.log((ok ? '  ok   ' : '  MAL  ') + ('[' + L + ']').padEnd(6) + ' nombre entero: ' + r.entero + ' de ' + pedidas +
      '  (' + r.plantillas.map(x => '«' + x + '»').join(' y ') + ')');
    console.log('        nombre corto, sin exigir: ' + r.corto + ' su ficha, ' + r.cortoElegir + ' para elegir entre los que se llaman igual, de ' + r.total);
    for (const f of r.fallan.slice(0, 12)) console.log('        no sale: ' + f);
    if (r.fallan.length > 12) console.log('        … y ' + (r.fallan.length - 12) + ' mas');
    console.log('        categorias por su rotulo: ' + (r.cats - r.catsMal.length) + ' de ' + r.cats);
    for (const f of r.catsMal) console.log('        no la saca: ' + f);
  }
  /* LOS DOS NOMBRES REPETIDOS (nota 48, 4f; Jérôme: «sí»). «Playa San Juan» es la playa y es el pueblo, en la misma
     coordenada, y «Mesa del Mar» son las piscinas y el núcleo de casas de al lado. El del pueblo y el del núcleo llevan
     su paréntesis en el idioma de la app donde se ENSEÑA el nombre: el globo, la hoja de detalle, las sugerencias del
     buscador y la lista del asistente para elegir. La playa y las piscinas, sin paréntesis. Lo esperado va escrito
     aquí, como lo trajo la nota (textos-48.json, «sufijos_nombre»): no se lee de la app, que es lo que se prueba. */
  const SUFIJOS = {
    es: ['pueblo', 'núcleo'], en: ['village', 'village'], fr: ['village', 'village'], de: ['Ort', 'Ort'],
    it: ['paese', 'località'], nl: ['dorp', 'dorp'], zh: ['镇', '居民区'], zht: ['鎮', '居民區'],
    bg: ['селище', 'селище'], pl: ['miejscowość', 'osiedle'], ro: ['localitate', 'localitate'] };
  console.log('\n=== los dos nombres repetidos, con su paréntesis en cada idioma ===');
  for (const L of IDIOMAS) {
    await pg.evaluate(l => setLang(l), L);
    const r = await pg.evaluate(([l, suf]) => {
      const zh = l === 'zh' || l === 'zht';
      const con = (n, s) => zh ? n + '（' + s + '）' : n + ' (' + s + ')';
      const quiere = { 'nucleo-playa-san-juan': con('Playa San Juan', suf[0]), 'nucleo-mesa-mar': con('Mesa del Mar', suf[1]),
                       'san-juan': 'Playa San Juan', 'mesa-mar': 'Mesa del Mar' };
      const mal = [], limpio = s => String(s || '').replace(/\s+/g, ' ').trim();
      for (const id of Object.keys(quiere)) {
        const p = places.find(x => x.id === id);
        if (!p) { mal.push(id + ': no está en places'); continue; }
        const q = quiere[id], emoji = p.emoji || '';
        const d = document.createElement('div'); d.innerHTML = htmlGlobo(p);
        const globo = limpio((d.querySelector('.popup-name') || {}).textContent);
        if (globo !== limpio(emoji + ' ' + q)) mal.push(id + ' en el globo: «' + globo + '»');
        const lista = chatBuildReply({ kind: 'poiList', list: [p] }).pois || [];
        if (!lista[0] || lista[0].name !== q) mal.push(id + ' en la lista del asistente: «' + (lista[0] && lista[0].name) + '»');
      }
      /* el buscador: «Playa San Juan» saca las dos, cada una con su nombre */
      const inp = document.getElementById('search-input');
      inp.value = 'Playa San Juan'; inp.dispatchEvent(new Event('input', { bubbles: true }));
      const sug = [...document.querySelectorAll('#search-suggestions .suggestion .suggestion-name')].map(e => limpio(e.textContent));
      for (const id of ['san-juan', 'nucleo-playa-san-juan'])
        if (sug.indexOf(quiere[id]) < 0) mal.push(id + ' en el buscador: no sale «' + quiere[id] + '» (salen ' + JSON.stringify(sug.slice(0, 6)) + ')');
      inp.value = ''; inp.dispatchEvent(new Event('input', { bubbles: true }));
      return { mal, globo: quiere };
    }, [L, SUFIJOS[L]]);
    /* la hoja de detalle solo se abre en móvil: en un viewport estrecho, la del pueblo */
    await pg.setViewportSize({ width: 390, height: 844 });
    const hoja = await pg.evaluate(() => { openDetailSheet('nucleo-playa-san-juan'); return (document.getElementById('detail-sheet-name') || {}).textContent || ''; });
    await pg.evaluate(() => { try { closeDetailSheet(); } catch (e) {} });
    await pg.setViewportSize({ width: 1280, height: 800 });
    if (String(hoja).replace(/\s+/g, ' ').trim().indexOf(r.globo['nucleo-playa-san-juan']) < 0) r.mal.push('nucleo-playa-san-juan en la hoja de detalle: «' + hoja + '»');
    if (r.mal.length) mal++;
    console.log((r.mal.length ? '  MAL  ' : '  ok   ') + ('[' + L + ']').padEnd(6) + ' «' + r.globo['nucleo-playa-san-juan'] + '» y «' + r.globo['nucleo-mesa-mar'] +
      '»; la playa y las piscinas, sin paréntesis (globo, hoja, buscador y asistente)');
    for (const f of r.mal) console.log('        ' + f);
  }
  /* EL BUSCADOR TAMBIÉN POR ETIQUETAS (nota 48, 4h; Jérôme: «sí»). En cada idioma se busca de verdad, tecleando en
     la caja, una etiqueta de una ficha que NO sale ni en su nombre, ni en su alias, ni en su categoría: así solo la
     puede encontrar la etiqueta. Una vez traducida (la del fichero idiomas/etiquetas/<idioma>.json, la que se ve en
     la ficha) y otra en castellano, que es como están escritas. Se escoge la que menos fichas saca (como mucho 8,
     las sugerencias que se enseñan), y tiene que salir en los tres sitios: las sugerencias, los marcadores mientras
     se escribe y el Intro. */
  console.log('\n=== el buscador, también por las etiquetas: traducidas y en castellano ===');
  for (const L of IDIOMAS) {
    await pg.evaluate(l => setLang(l), L);
    const r = await pg.evaluate(async l => {
      const esperar = ms => new Promise(res => setTimeout(res, ms));
      /* Hasta que llega idiomas/etiquetas/<idioma>.json, TG_ETIQUETAS sigue con la tabla del idioma de antes:
         se espera a que de() devuelva, para todas las filas del fichero que sirve la web, lo que dice ESE fichero. */
      if (l !== 'es') {
        const tabla = await (await fetch('idiomas/etiquetas/' + l + '.json', { cache: 'no-cache' })).json();
        const filas = Object.keys(tabla), t0 = Date.now();
        while (!filas.every(k => TG_ETIQUETAS.de(k) === tabla[k])) {
          if (Date.now() - t0 > 15000) return { error: 'no llega idiomas/etiquetas/' + l + '.json' };
          await esperar(100);
        }
      }
      const CJK = /[㐀-鿿]/;
      const fuera = new Map(), dentro = new Map();
      for (const p of places) {
        fuera.set(p, [p.name, p.alias || '', p.cat ? (p.cat[currentLang] || p.cat.en || p.cat.es || '') : '', localized(p.cat)].map(sinTildes).join('\n'));
        dentro.set(p, (p.tags || []).map(e => sinTildes(e) + '\n' + sinTildes(TG_ETIQUETAS.de(e))).join('\n'));
      }
      const total = q => { let n = 0; for (const p of places) if (fuera.get(p).includes(q) || dentro.get(p).includes(q)) n++; return n; };
      const escoger = traducida => {
        let mejor = null;
        for (const p of places) for (const e of (p.tags || [])) {
          const vista = traducida ? TG_ETIQUETAS.de(e) : e;
          if (traducida && vista === e) continue;
          const q = sinTildes(vista).trim();
          if (q.length < (CJK.test(q) ? 2 : 4) || fuera.get(p).includes(q)) continue;
          const n = total(q);
          if (n <= 8 && (!mejor || n < mejor.n)) mejor = { id: p.id, etiqueta: vista, n: n };
          if (mejor && mejor.n === 1) return mejor;
        }
        return mejor;
      };
      const probar = async c => {
        const inp = document.getElementById('search-input');
        inp.value = c.etiqueta; inp.dispatchEvent(new Event('input', { bubbles: true }));
        await esperar(700);
        const sug = [...document.querySelectorAll('#search-suggestions .suggestion')].some(d => (d.getAttribute('onclick') || '').indexOf("'" + c.id + "'") >= 0);
        const marcador = !!markerMap[c.id];
        inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        await esperar(300);
        const intro = searchLocked && searchLockedIds.has(c.id);
        inp.value = ''; inp.dispatchEvent(new Event('input', { bubbles: true }));
        await esperar(300);
        return Object.assign({ sug: sug, marcador: marcador, intro: intro }, c);
      };
      const casos = [];
      if (l !== 'es') { const c = escoger(true); if (!c) return { error: 'ninguna etiqueta traducida que solo la encuentre a ella' }; casos.push(Object.assign({ como: 'traducida' }, await probar(c))); }
      const c2 = escoger(false); if (!c2) return { error: 'ninguna etiqueta en castellano que solo la encuentre a ella' };
      casos.push(Object.assign({ como: 'en castellano' }, await probar(c2)));
      return { casos: casos };
    }, L);
    if (r.error) { console.log('  MAL  [' + L + '] ' + r.error); mal++; continue; }
    if (r.casos.some(c => !(c.sug && c.marcador && c.intro))) mal++;
    for (const c of r.casos) {
      const bien = c.sug && c.marcador && c.intro;
      console.log((bien ? '  ok   ' : '  MAL  ') + ('[' + L + ']').padEnd(6) + ' ' + c.como + ': «' + c.etiqueta + '» → ' + c.id + ' (' + c.n + ' ficha' + (c.n === 1 ? '' : 's') +
        ')   sugerencias ' + (c.sug ? 'sí' : 'NO') + ' · marcadores ' + (c.marcador ? 'sí' : 'NO') + ' · Intro ' + (c.intro ? 'sí' : 'NO'));
    }
  }
  await nav.close();
  console.log(mal ? '\n*** ' + mal + ' idioma(s) donde el asistente no encuentra algun lugar por su nombre o alguna categoria por su rotulo, o un nombre repetido sale sin su paréntesis, o el buscador no encuentra por una etiqueta ***'
                  : '\nel asistente encuentra cada lugar por su nombre y cada categoria por su rotulo, en los once idiomas');
  process.exit(mal ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
