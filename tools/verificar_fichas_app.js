/*
  verificar_fichas_app.js — abre TODAS las fichas de gasolinera en los diez
  idiomas, en la app de verdad, y mira lo que se ve.

      python3 -m http.server 8820 &      (desde la raiz del repo)
      node tools/verificar_fichas_app.js 8820

  POR QUE
  revisar_gasolineras.py y verificar_bloques.py miran los DATOS. Pero el
  horario estuvo en los datos, en los diez idiomas, sin pintarse en ningun
  sitio, y ninguna de las dos lo vio: lo vio una foto. Esto mira la pantalla:

    hoja de detalle (movil)  nombre, categoria y descripcion en su idioma;
                             cada etiqueta como la traduce TG_ETIQUETAS;
                             «🕐 horario» en su idioma y «📍 direccion»;
                             nada que se salga por los lados.
    globo del mapa           «🕐 horario» y «📍 direccion».
    fuera del castellano     la descripcion y la categoria no pueden ser las
                             castellanas, ni el horario llevar dias en castellano.

  Sale con 1 si algo falla.
*/
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const PUERTO = process.argv[2] || '8820';
const IDIOMAS = ['es', 'en', 'fr', 'de', 'it', 'nl', 'zh', 'zht', 'bg', 'pl'];

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  let total = 0;
  for (const L of IDIOMAS) {
    const ctx = await b.newContext({ viewport: { width: 360, height: 740 } });
    const p = await ctx.newPage();
    const err = [];
    p.on('pageerror', e => err.push(e.message));
    await p.goto('http://127.0.0.1:' + PUERTO + '/index.html', { waitUntil: 'networkidle' });
    await p.waitForTimeout(1000);
    await p.click('.v19-w-lang[data-lang="' + L + '"]');
    await p.waitForTimeout(400);
    await p.click('#v19-welcome-start');
    const r = await p.evaluate(async (L) => {
      const espera = ms => new Promise(r => setTimeout(r, ms));
      const gas = places.filter(x => x.category === 'gasolinera');
      // los textos del idioma y el glosario llegan por red: se esperan
      const t0 = Date.now();
      while (L !== 'es' && Date.now() - t0 < 15000 &&
             (gas.some(x => x.hours && !x.hours[L]) || TG_ETIQUETAS.de('Gasolinera') === 'Gasolinera'))
        await espera(150);
      const mal = [];
      const DIAS_ES = /\b(L-D|L-V|L-S|S-D)\b|\bSáb\b/;
      for (const x of gas) {
        openDetailSheet(x.id);
        const q = id => (document.getElementById(id) || {}).textContent || '';
        const nombre = q('detail-sheet-name'), cat = q('detail-sheet-cat'), desc = q('detail-sheet-desc');
        const info = q('detail-sheet-info');
        const chips = [...document.querySelectorAll('#detail-sheet-tags .popup-tag')].map(e => e.textContent);
        const h = x.hours && x.hours[L];
        if (!nombre.includes(x.name)) mal.push(x.id + ': nombre «' + nombre + '»');
        if (!h) mal.push(x.id + ': sin horario en ' + L);
        else if (!info.includes('🕐 ' + h)) mal.push(x.id + ': la ficha no ensena «🕐 ' + h + '» (dice «' + info.slice(0, 50) + '»)');
        if (x.address && !info.includes('📍 ' + x.address)) mal.push(x.id + ': la ficha no ensena la direccion');
        if (desc !== (x.desc[L] || '')) mal.push(x.id + ': descripcion «' + desc.slice(0, 40) + '» en vez de la de ' + L);
        if (cat !== (x.cat[L] || '')) mal.push(x.id + ': categoria «' + cat + '» en vez de «' + x.cat[L] + '»');
        (x.tags || []).forEach((tg, k) => { if (chips[k] !== TG_ETIQUETAS.de(tg)) mal.push(x.id + ': etiqueta ' + tg + ' -> «' + chips[k] + '»'); });
        if (L !== 'es') {
          if (desc === x.desc.es) mal.push(x.id + ': descripcion en castellano');
          if (cat === x.cat.es) mal.push(x.id + ': categoria en castellano');
          if (h && DIAS_ES.test(h)) mal.push(x.id + ': horario con dias en castellano «' + h + '»');
        }
        let fuera = 0;
        document.querySelectorAll('#detail-sheet *').forEach(e => { const r = e.getBoundingClientRect(); if (r.width && r.right > innerWidth + 2) fuera++; });
        if (fuera) mal.push(x.id + ': ' + fuera + ' elemento(s) fuera de la pantalla');
      }
      if (typeof closeDetailSheet === 'function') closeDetailSheet();
      // el globo del mapa
      setCategory('gasolinera'); updateMarkers();
      let globos = 0;
      for (const x of gas) {
        const m = markerMap[x.id];
        if (!m) { mal.push(x.id + ': sin marcador en el mapa'); continue; }
        const c = m.getPopup().getContent();
        const t = typeof c === 'string' ? c : c.innerHTML;
        const h = x.hours && x.hours[L];
        if (h && !t.includes('🕐 ' + escapeHtml(h))) mal.push(x.id + ': el globo no ensena el horario');
        if (x.address && !t.includes('📍 ' + escapeHtml(x.address))) mal.push(x.id + ': el globo no ensena la direccion');
        globos++;
      }
      return { n: gas.length, globos, mal };
    }, L);
    total += r.mal.length + err.length;
    console.log((r.mal.length || err.length ? 'MAL ' : 'ok  ') + L.padEnd(4) + r.n + ' fichas y ' + r.globos +
                ' globos abiertos · ' + r.mal.length + ' fallo(s) · ' + err.length + ' error(es) de pagina');
    r.mal.slice(0, 8).forEach(x => console.log('       ' + x));
    err.slice(0, 3).forEach(x => console.log('       error: ' + x));
    await ctx.close();
  }
  await b.close();
  console.log(total ? '\n*** ' + total + ' fallo(s) ***' : '\nlas fichas de gasolinera, bien en los diez idiomas');
  process.exit(total ? 1 : 0);
})();
