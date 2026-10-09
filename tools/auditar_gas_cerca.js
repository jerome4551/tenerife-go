/*
  auditar_gas_cerca.js — el boton «la gasolinera mas barata cerca de mi», en la
  app de verdad, con la posicion simulada.

      python3 -m http.server 8820 &      (desde la raiz del repo)
      node tools/auditar_gas_cerca.js 8820

  No usa la red: los precios salen de tools/precios_gasolineras.py pasado por
  el registro del repo con la fecha puesta a hoy, como en
  auditar_precios_gasolineras.py, y la app los recibe por una ruta simulada.

  MIRA
    en los diez idiomas   la fila de la pestaña Servicios (y que no sale en
                          otra pestaña), el panel (titulo, fecha, radios),
                          que cada lista a 5, 10 y 20 km es la que da un
                          calculo hecho aparte (las 3 mas baratas y las que
                          empatan con la tercera, en linea recta), que nada se
                          sale por los lados, y que la fila lleva a la ficha
                          de esa gasolinera con el mismo precio.
    el de la barra        el ⛽€ al lado del dado (lo pidio Jerome: «esta muy
                          escondido»): abre el panel, su title y aria-label en
                          cada idioma, y la barra de arriba no se sale de la
                          pantalla de 320 a 412 px.
    el boton del mapa     solo con «Gasolineras» o «Gasolineras mas baratas»
                          en el filtro; abre el panel; sin pisar nada; y una
                          gasolinera que el filtro esconde se puede abrir.
    lo que sale mal       fuera de Tenerife, sin permiso de ubicacion, precios
                          de mas de 2 dias, fichero sin «estaciones»: no abre
                          y dice por que.
    el idioma             cambiarlo con el panel abierto lo repinta.
    en vivo               (desde el 7 de octubre la app pide los precios al
                          Ministerio, como el tiempo a Open-Meteo) con el
                          Ministerio simulado: que la cuenta que hace el movil
                          es IDENTICA a la de tools/precios_gasolineras.py
                          con el mismo registro; que se usa en vivo; que si
                          el primer dominio falla va al segundo; que si fallan
                          los dos se queda el fichero; que unos precios viejos
                          no pisan a unos nuevos; que un globo abierto no se
                          cierra al llegar los precios y se rellena; y que con
                          el fichero caducado el boton sigue funcionando.
    cada ficha            Jerome, 7 de octubre: «puedes poner los precios si
                          estan actualizados a cada gasolinera». En las 211
                          (globo y ficha, cuatro idiomas): su precio exacto en
                          cada combustible que lo tiene, ninguna linea en el
                          que no, y con precios de mas de 2 dias, ni uno en
                          ninguna.

  Sale con 1 si algo falla.
*/
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
const os = require('os'), path = require('path'), { execFileSync } = require('child_process');
const RAIZ = path.join(__dirname, '..');
const PUERTO = process.argv[2] || '8820';
// los precios: el guion de verdad, con el registro del repo puesto a hoy
const S = fs.mkdtempSync(path.join(os.tmpdir(), 'gas-cerca-'));
execFileSync('python3', ['-c', [
  'import json, datetime as dt, sys',
  'from zoneinfo import ZoneInfo',
  "d = json.load(open(sys.argv[1], encoding='utf-8-sig'))",
  "d['Fecha'] = dt.datetime.now(ZoneInfo('Europe/Madrid')).strftime('%d/%m/%Y %H:%M:%S')",
  "json.dump(d, open(sys.argv[2], 'w', encoding='utf-8'), ensure_ascii=False)"].join('\n'),
  path.join(RAIZ, 'registro', 'gasolineras-canarias.json'), path.join(S, 'registro.json')]);
execFileSync('python3', [path.join(RAIZ, 'tools', 'precios_gasolineras.py'), '--registro', path.join(S, 'registro.json'),
  '--forzar', '--salida', path.join(S, 'pc_frescos.json')], { cwd: RAIZ });
{
  const d = JSON.parse(fs.readFileSync(path.join(S, 'pc_frescos.json')));
  const v = JSON.parse(JSON.stringify(d));
  v.fecha = new Date(Date.now() - 3 * 86400000).toISOString().replace(/\.\d+Z$/, 'Z');
  fs.writeFileSync(path.join(S, 'pc_viejos.json'), JSON.stringify(v));
  const h = JSON.parse(JSON.stringify(d));
  const enMunicipio = new Set();
  Object.values(h.municipios).forEach(m => ['g95', 'diesel'].forEach(c => (m[c] || []).forEach(x => enMunicipio.add(x.id))));
  const libres = Object.keys(h.estaciones).filter(i => !enMunicipio.has(i)).sort();
  delete h.estaciones[libres[0]];               // sin ningun precio
  delete h.estaciones[libres[1]].g95;           // sin el de 95
  fs.writeFileSync(path.join(S, 'pc_huecos.json'), JSON.stringify(h));
  delete d.estaciones;
  fs.writeFileSync(path.join(S, 'pc_sinest.json'), JSON.stringify(d));
}
const SC = { latitude: 28.4636, longitude: -16.2518 };   // Santa Cruz, plaza de España aprox.
const MADRID = { latitude: 40.4168, longitude: -3.7038 };
/* El Ministerio simulado: «ok» devuelve el registro del repo con la fecha de
   hoy (el mismo del que salio pc_frescos.json con el guion de Python),
   «falla» un 503 en los dos dominios, «primero» falla el primer dominio y
   responde el segundo. */
const MINISTERIO = /serviciosmin\.gob\.es|minetur\.gob\.es/;
async function abrir(b, { lang = 'es', w = 360, h = 740, geo = SC, permiso = true, fichero = 'pc_frescos.json', ministerio = 'falla' } = {}) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, serviceWorkers: 'block',
    geolocation: geo, permissions: permiso ? ['geolocation'] : [] });
  const p = await ctx.newPage();
  const err = []; p.on('pageerror', e => err.push(e.message));
  await p.addInitScript(() => { try { localStorage.setItem('tenerife.tour.seen', '1'); localStorage.setItem('tgo_consent', JSON.stringify({ v: 'denied', t: Date.now() })); } catch (e) {} });
  await p.route('**/datos/precios-gasolineras.json', r => r.fulfill({ status: 200, contentType: 'application/json', body: fs.readFileSync(S + '/' + fichero) }));
  const pedidas = [];
  await p.route(MINISTERIO, r => {
    const u = r.request().url(); pedidas.push(u);
    const bien = ministerio === 'ok' || (ministerio === 'primero' && /minetur/.test(u));
    return bien ? r.fulfill({ status: 200, contentType: 'application/json; charset=utf-8',
                              headers: { 'Access-Control-Allow-Origin': '*' }, body: fs.readFileSync(S + '/registro.json') })
                : r.fulfill({ status: 503, headers: { 'Access-Control-Allow-Origin': '*' }, body: 'no' });
  });
  p.__pedidas = pedidas;
  await p.goto('http://127.0.0.1:' + PUERTO + '/index.html', { waitUntil: 'networkidle' });
  await p.waitForTimeout(600);
  await p.click('.v19-w-lang[data-lang="' + lang + '"]'); await p.waitForTimeout(300);
  await p.click('#v19-welcome-start'); await p.waitForTimeout(3000);
  return { ctx, p, err };
}
// lo que deberia salir, calculado aparte
function esperado(datos, places, pos, radio, comb) {
  const R = 6371, rad = d => d * Math.PI / 180;
  const km = (a, b, c, d) => { const x = Math.sin(rad(c - a) / 2) ** 2 + Math.cos(rad(a)) * Math.cos(rad(c)) * Math.sin(rad(d - b) / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); };
  const c = places.filter(q => q.category === 'gasolinera' && datos.estaciones[q.id] && typeof datos.estaciones[q.id][comb] === 'number')
    .map(q => ({ id: q.id, precio: datos.estaciones[q.id][comb], km: km(pos.latitude, pos.longitude, q.lat, q.lng) }))
    .filter(x => x.km <= radio).sort((a, b) => a.precio - b.precio || a.km - b.km);
  if (c.length <= 3) return c.map(x => x.id);
  return c.filter(x => x.precio <= c[2].precio).map(x => x.id);
}
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const datos = JSON.parse(fs.readFileSync(S + '/pc_frescos.json'));
  let fallos = 0;
  const mal = t => { fallos++; console.log('  FALLO', t); };
  for (const lang of ['es', 'en', 'fr', 'de', 'it', 'nl', 'zh', 'zht', 'bg', 'pl']) {
    const { ctx, p, err } = await abrir(b, { lang });
    const r = await p.evaluate(async () => {
      const o = {};
      o.fabAntes = document.getElementById('gas-cerca-fab').hidden;
      toggleCategorySheet();
      _activeCatTab = CAT_GROUPS[0].id; _buildCatSheet();
      o.filaEnOtraPestana = !document.getElementById('cat-sheet-gas-row').hidden;
      _activeCatTab = 'servicios'; _buildCatSheet();
      const fila = document.getElementById('cat-sheet-gas-row');
      o.fila = fila.hidden ? 'OCULTA' : fila.innerText.replace(/\n/g, ' | ');
      fila.click();
      await new Promise(r => setTimeout(r, 1200));
      const pan = document.getElementById('gas-cerca-panel');
      o.abierto = pan.classList.contains('open');
      o.hojaCerrada = !document.getElementById('cat-sheet').classList.contains('open');
      o.titulo = pan.querySelector('.nearby-stops-title').innerText;
      o.fecha = document.getElementById('gas-cerca-fecha').innerText;
      o.radios = document.getElementById('gas-cerca-radios').innerText.replace(/\n/g, ' ');
      const lee = () => { const s = {}; let k = null;
        document.querySelectorAll('#gas-cerca-lista > *').forEach(e => {
          if (e.classList.contains('gas-cerca-comb')) { k = e.innerText; s[k] = []; }
          else if (e.dataset.id) s[k].push(e.dataset.id);
          else s[k].push('VACIO:' + e.innerText);
        }); return s; };
      o.r10 = lee();
      o.filas = [...document.querySelectorAll('#gas-cerca-lista .gas-cerca-fila')].slice(0, 2).map(e => e.innerText.replace(/\n/g, ' · '));
      let fuera = 0; pan.querySelectorAll('*').forEach(e => { const q = e.getBoundingClientRect(); if (q.width && (q.right > innerWidth + 1 || q.left < -1)) fuera++; });
      o.fuera = fuera;
      document.querySelectorAll('.gas-cerca-radio')[0].click(); o.r5 = lee();
      document.querySelectorAll('.gas-cerca-radio')[2].click(); o.r20 = lee();
      document.querySelectorAll('.gas-cerca-radio')[1].click();
      o.places = places.filter(q => q.category === 'gasolinera').map(q => ({ id: q.id, category: q.category, lat: q.lat, lng: q.lng }));
      return o;
    });
    // comprobar contra el calculo aparte
    for (const [rk, radio] of [['r5', 5], ['r10', 10], ['r20', 20]]) {
      const secs = Object.values(r[rk]);
      ['g95', 'diesel'].forEach((comb, i) => {
        const e = esperado(datos, r.places, { latitude: 28.4636, longitude: -16.2518 }, radio, comb);
        const v = secs[i] || [];
        const ok = e.length ? JSON.stringify(v) === JSON.stringify(e) : (v.length === 1 && v[0].startsWith('VACIO:'));
        if (!ok) mal(lang + ' ' + rk + ' ' + comb + ' sale ' + JSON.stringify(v) + ' y deberia ' + JSON.stringify(e));
      });
    }
    if (!r.fabAntes) mal(lang + ': el boton del mapa sale sin filtro');
    if (r.filaEnOtraPestana) mal(lang + ': la fila sale fuera de Servicios');
    if (!r.abierto || !r.hojaCerrada) mal(lang + ': el panel no abre o la hoja no cierra');
    if (r.fuera) mal(lang + ': ' + r.fuera + ' elementos se salen');
    // fila -> ficha con el mismo precio
    const f = await p.evaluate(async () => {
      const fila = document.querySelector('#gas-cerca-lista .gas-cerca-fila');
      const id = fila.dataset.id, precio = fila.querySelector('.gas-cerca-precio').innerText;
      fila.click();
      await new Promise(r => setTimeout(r, 2200));
      return { id, precio, panel: document.getElementById('gas-cerca-panel').classList.contains('open'),
        ficha: _detailPlaceId, info: document.getElementById('detail-sheet-info').innerText.replace(/\n/g, ' | ') };
    });
    if (f.panel || f.ficha !== f.id || !f.info.includes(f.precio)) mal(lang + ': la ficha no es la de la fila o no dice ' + f.precio + ': ' + JSON.stringify(f));
    console.log(lang.padEnd(3), '| fila:', r.fila, '\n    titulo:', r.titulo, '| fecha:', r.fecha, '| radios:', r.radios,
      '\n    10 km:', JSON.stringify(Object.fromEntries(Object.entries(r.r10).map(([k, v]) => [k, v.length]))), '|', r.filas.join(' ‖ '),
      '\n    ficha:', f.info.slice(0, 160), '| errores:', err.length, err.slice(0, 2).join(' / '));
    if (err.length) mal(lang + ': errores JS ' + err.join(' / '));
    await ctx.close();
  }
  // el boton de la barra de arriba, al lado del dado
  for (const lang of ['es', 'en', 'fr', 'de', 'it', 'nl', 'zh', 'zht', 'bg', 'pl']) {
    const { ctx, p, err } = await abrir(b, { lang });
    const r = await p.evaluate(async () => {
      const bt = document.getElementById('gas-top-btn');
      const o = { title: bt.title, aria: bt.getAttribute('aria-label'), quiere: tx('gasCercaBoton'),
        alLado: bt.previousElementSibling && bt.previousElementSibling.id };
      bt.click(); await new Promise(r => setTimeout(r, 1200));
      o.abre = document.getElementById('gas-cerca-panel').classList.contains('open');
      return o;
    });
    if (r.title !== r.quiere || r.aria !== r.quiere || r.alLado !== 'dice-btn' || !r.abre)
      mal('barra ' + lang + ': ' + JSON.stringify(r));
    if (err.length) mal('barra ' + lang + ': errores JS ' + err.join(' / '));
    await ctx.close();
  }
  for (const w of [320, 360, 375, 390, 412]) {
    const { ctx, p } = await abrir(b, { w, h: 740 });
    const r = await p.evaluate(() => {
      const tr = document.querySelector('.topbar-right');
      const fuera = [...tr.children].filter(e => { const q = e.getBoundingClientRect(); return q.width && (q.right > innerWidth + 0.5 || q.left < -0.5); }).map(e => e.id || e.className);
      return { fuera, desborda: tr.scrollWidth > tr.clientWidth + 1 };
    });
    console.log('barra ' + w + ' px: ' + JSON.stringify(r));
    if (r.fuera.length || r.desborda) mal('la barra de arriba se sale a ' + w + ' px: ' + JSON.stringify(r));
    await ctx.close();
  }
  // el boton del mapa, en movil y en ordenador
  for (const [w, h] of [[360, 740], [1280, 800]]) {
    const { ctx, p, err } = await abrir(b, { w, h });
    const r = await p.evaluate(async () => {
      const o = {};
      selectCategory('gasolinera'); await new Promise(r => setTimeout(r, 300));
      const b = document.getElementById('gas-cerca-fab');
      o.conGas = !b.hidden; const q = b.getBoundingClientRect(); o.caja = [q.left, q.top, q.right, q.bottom].map(Math.round);
      o.texto = b.innerText;
      // ¿pisa algo? lo que hay en el centro de cada borde
      o.pisa = [[q.left + 2, q.top + q.height / 2], [q.right - 2, q.top + q.height / 2]].map(([x, y]) => { const e = document.elementFromPoint(x, y); return e && !b.contains(e) ? (e.className || e.tagName) : ''; }).filter(Boolean);
      selectCategory('gasolinera'); await new Promise(r => setTimeout(r, 300));
      o.sinGas = b.hidden;
      selectCategory('gasolinera_barata'); await new Promise(r => setTimeout(r, 300));
      o.conBarata = !b.hidden;
      selectCategory('gasolinera_barata'); selectCategory('farmacia'); await new Promise(r => setTimeout(r, 300));
      o.conFarmacia = b.hidden;
      abrirGasCerca(); await new Promise(r => setTimeout(r, 1200));
      o.abre = document.getElementById('gas-cerca-panel').classList.contains('open');
      // una fila que el filtro «mas baratas» esconde: se suman las gasolineras
      const est = PRECIOS_GAS.datos.estaciones;
      const fila = [...document.querySelectorAll('#gas-cerca-lista .gas-cerca-fila')].find(e => !placeMatchesCat(places.find(x => x.id === e.dataset.id), selectedCategories));
      o.escondida = fila ? fila.dataset.id : null;
      if (fila) { fila.click(); await new Promise(r => setTimeout(r, 2200)); o.filtro = [...selectedCategories]; o.marcador = !!markerMap[o.escondida]; }
      return o;
    });
    console.log('fab', w, JSON.stringify(r), 'errores:', err.length);
    if (!r.conGas || !r.sinGas || !r.conBarata || !r.conFarmacia || !r.abre || r.pisa.length) mal('boton del mapa ' + w + ': ' + JSON.stringify(r));
    if (!r.escondida || (!r.filtro.includes('gasolinera') || !r.marcador)) mal('fila escondida por el filtro ' + w);
    await ctx.close();
  }
  // los casos raros
  for (const [nom, o, espera] of [
    ['fuera de Tenerife', { geo: MADRID }, 'gpsOutside'],
    ['sin permiso', { permiso: false }, 'gpsDenied'],
    ['precios viejos', { fichero: 'pc_viejos.json' }, 'viejos'],
    ['sin estaciones', { fichero: 'pc_sinest.json' }, 'gasPreciosNo'],
  ]) {
    const { ctx, p, err } = await abrir(b, o);
    const r = await p.evaluate(async (espera) => {
      abrirGasCerca(); await new Promise(r => setTimeout(r, 1500));
      const gps = document.getElementById('gps-toast'), lay = document.getElementById('layer-toast');
      const txt = (gps.classList.contains('visible') ? gps.innerText : '') + '|' + (lay ? lay.textContent : '');
      const quiere = espera === 'viejos' ? tx('gasPreciosViejos', { f: fechaPreciosGas() }) : espera.startsWith('gps') ? t()[espera] : tx(espera);
      return { txt, quiere, abierto: document.getElementById('gas-cerca-panel').classList.contains('open') };
    }, espera);
    const ok = !r.abierto && r.txt.includes(r.quiere);
    console.log(nom.padEnd(18), ok ? 'bien' : 'MAL', JSON.stringify(r), 'errores:', err.length);
    if (!ok) mal(nom);
    await ctx.close();
  }
  // el precio en la ficha y en el globo de cada gasolinera
  for (const [lang, fichero] of [['es', 'pc_huecos.json'], ['en', 'pc_frescos.json'], ['zh', 'pc_frescos.json'],
                                 ['bg', 'pc_frescos.json'], ['es', 'pc_viejos.json']]) {
    const datosF = JSON.parse(fs.readFileSync(path.join(S, fichero)));
    const { ctx, p, err } = await abrir(b, { lang, fichero });
    const r = await p.evaluate(async ({ datosF, viejos }) => {
      const LOC = { es: 'es-ES', en: 'en-GB', fr: 'fr-FR', de: 'de-DE', it: 'it-IT', nl: 'nl-NL', zh: 'zh-CN', zht: 'zh-TW', bg: 'bg-BG', pl: 'pl-PL' };
      const euro = new Intl.NumberFormat(LOC[currentLang], { style: 'currency', currency: 'EUR', minimumFractionDigits: 3, maximumFractionDigits: 3 });
      const mun = {};
      Object.values(datosF.municipios).forEach(m => ['g95', 'diesel'].forEach(c => (m[c] || []).forEach(x => { (mun[x.id] = mun[x.id] || {})[c] = x.precio; })));
      const gas = places.filter(x => x.category === 'gasolinera');
      setCategory('gasolinera'); updateMarkers({ immediate: true });
      const mal = []; let conPrecio = 0, sinPrecio = 0;
      for (const x of gas) {
        const quiere = [];
        ['g95', 'diesel'].forEach(c => {
          const pr = ((datosF.estaciones || {})[x.id] || {})[c] ?? (mun[x.id] || {})[c];
          if (!viejos && typeof pr === 'number') quiere.push(tx(c === 'g95' ? 'gasPrecioG95' : 'gasPrecioDiesel') + ': ' + euro.format(pr));
        });
        quiere.length ? conPrecio++ : sinPrecio++;
        openDetailSheet(x.id);
        const ficha = document.getElementById('detail-sheet-info').innerText;
        const m = markerMap[x.id];
        // el globo se fabrica al abrirlo (htmlGlobo): getContent() es la funcion que lo hace
        const c0 = m ? m.getPopup().getContent() : '', c = typeof c0 === 'function' ? c0(m) : c0;
        const tmp = document.createElement('div'); tmp.innerHTML = typeof c === 'string' ? c : c.innerHTML;
        const globo = tmp.innerText || tmp.textContent;
        for (const [donde, txt] of [['ficha', ficha], ['globo', globo]]) {
          const filas = (txt.match(/💶/g) || []).length;
          if (filas !== quiere.length) mal.push(x.id + ' ' + donde + ': ' + filas + ' linea(s) de precio y deberian ser ' + quiere.length);
          quiere.forEach(q => { if (!txt.includes(q)) mal.push(x.id + ' ' + donde + ': no dice «' + q + '»'); });
          const fecha = tx('gasPrecioFecha', { f: fechaPreciosGas() });
          if (!!quiere.length !== txt.includes(fecha)) mal.push(x.id + ' ' + donde + ': la fecha ' + (quiere.length ? 'falta' : 'sobra'));
        }
      }
      closeDetailSheet();
      return { n: gas.length, conPrecio, sinPrecio, mal };
    }, { datosF, viejos: fichero === 'pc_viejos.json' });
    console.log('fichas ' + lang.padEnd(3) + ' ' + fichero.padEnd(16) + r.n + ' gasolineras · ' + r.conPrecio + ' con precio · ' +
                r.sinPrecio + ' sin · ' + r.mal.length + ' fallo(s) · errores: ' + err.length);
    r.mal.slice(0, 6).forEach(x => mal('fichas ' + lang + ' ' + fichero + ': ' + x));
    if (r.mal.length > 6) mal('fichas ' + lang + ': y ' + (r.mal.length - 6) + ' mas');
    if (fichero === 'pc_viejos.json' ? r.conPrecio : r.conPrecio < 0.8 * r.n) mal('fichas ' + lang + ' ' + fichero + ': ' + r.conPrecio + ' con precio');
    if (fichero === 'pc_huecos.json' && r.sinPrecio !== 1) mal('fichas: la gasolinera sin precio no se ha mirado');
    if (err.length) mal('fichas ' + lang + ': errores JS ' + err.join(' / '));
    await ctx.close();
  }
  // ── EN VIVO ──────────────────────────────────────────────────────────
  {
    const py = JSON.parse(fs.readFileSync(path.join(S, 'pc_frescos.json')));
    const reg = JSON.parse(fs.readFileSync(path.join(S, 'registro.json')));
    const mu = JSON.parse(fs.readFileSync(path.join(RAIZ, 'datos', 'gasolineras-municipio.json'))).municipios;
    // 1 · la misma cuenta que el guion de Python, con el mismo registro
    const { ctx, p, err } = await abrir(b, { ministerio: 'ok' });
    // 0 · cada pieza contra Python, tambien donde los datos de hoy no llegan
    //     (ningun municipio tiene justo 8 ni 15 gasolineras; nadie cambia la
    //     hora un 7 de octubre)
    const PRECIOS = ['', '1,449', '1.449', ' 1,5 ', '0,4', '0,5', '3,5', '3,6', 'abc', '1,5abc', '2'];
    const FECHAS = ['07/10/2026 22:14:08', '7/10/2026 0:48:44', '15/01/2026 09:00:00', '29/03/2026 01:59:59',
      '29/03/2026 02:30:00', '29/03/2026 03:00:00', '25/10/2026 01:59:59', '25/10/2026 02:30:00', '25/10/2026 03:00:00'];
    const pyRef = JSON.parse(execFileSync('python3', ['-c', [
      'import json, sys, datetime as dt',
      "sys.path.insert(0, 'tools')",
      'import precios_gasolineras as P',
      'precios, fechas = json.loads(sys.argv[1]), json.loads(sys.argv[2])',
      'f = lambda s: int(dt.datetime.strptime(s.strip(), "%d/%m/%Y %H:%M:%S").replace(tzinfo=P.MADRID).timestamp() * 1000)',
      "print(json.dumps({'cuantas': [P.cuantas(n) for n in range(41)], 'precio': [P.precio(x) for x in precios], 'fecha': [f(x) for x in fechas]}))"
    ].join('\n'), JSON.stringify(PRECIOS), JSON.stringify(FECHAS)], { cwd: RAIZ }).toString());
    const jsRef = await p.evaluate(({ PRECIOS, FECHAS }) => ({
      cuantas: [...Array(41).keys()].map(n => cuantasGas(n)),
      precio: PRECIOS.map(x => precioGas(x)),
      fecha: FECHAS.map(x => fechaMinisterioUtc(x)) }), { PRECIOS, FECHAS });
    for (const k of ['cuantas', 'precio', 'fecha']) {
      const a = JSON.stringify(jsRef[k]), c = JSON.stringify(pyRef[k]);
      console.log('en vivo · ' + k + ' contra Python: ' + (a === c ? 'igual' : 'DISTINTO'));
      if (a !== c) mal('en vivo: «' + k + '» no es como en Python:\n         app    ' + a + '\n         Python ' + c);
    }
    const js = await p.evaluate(({ reg, mu }) => construirPreciosGas(reg, mu), { reg, mu });
    for (const k of ['fecha', 'fecha_ministerio', 'municipios', 'estaciones']) {
      if (JSON.stringify(js[k]) !== JSON.stringify(py[k])) mal('en vivo: «' + k + '» no sale igual que en tools/precios_gasolineras.py');
    }
    console.log('en vivo · la cuenta del movil y la del guion: ' + (js.error ? 'ERROR ' + js.error : Object.keys(js.municipios).length + ' municipios, ' + Object.keys(js.estaciones).length + ' gasolineras'));
    // 2 · al abrir el boton se piden en vivo y se usan
    const r = await p.evaluate(async () => { abrirGasCerca(); await new Promise(r => setTimeout(r, 2500));
      return { fuente: PRECIOS_GAS.fuente, abierto: document.getElementById('gas-cerca-panel').classList.contains('open') }; });
    console.log('en vivo · boton con el Ministerio respondiendo: ' + JSON.stringify(r) + ' · peticiones: ' + p.__pedidas.length);
    if (r.fuente !== 'vivo' || !r.abierto || p.__pedidas.length !== 1) mal('en vivo: el boton no usa los precios del Ministerio: ' + JSON.stringify(r));
    // 3 · media hora sin volver a pedir
    await p.evaluate(async () => { cerrarGasCerca(); abrirGasCerca(); await new Promise(r => setTimeout(r, 1500)); });
    if (p.__pedidas.length !== 1) mal('en vivo: vuelve a pedir antes de media hora (' + p.__pedidas.length + ' peticiones)');
    // 4 · unos precios mas viejos no pisan a los nuevos
    const pisa = await p.evaluate(() => { const d = JSON.parse(JSON.stringify(PRECIOS_GAS.datos));
      d.fecha = new Date(Date.parse(d.fecha) - 3600e3).toISOString().replace(/\.\d{3}Z$/, 'Z');
      const antes = PRECIOS_GAS.datos.fecha; const r = aplicarPreciosGas(d, 'fichero'); return { r, igual: PRECIOS_GAS.datos.fecha === antes }; });
    if (pisa.r !== false || !pisa.igual) mal('en vivo: unos precios mas viejos pisaron a los nuevos');
    if (err.length) mal('en vivo: errores JS ' + err.join(' / '));
    await ctx.close();
  }
  for (const [nom, o, fuente] of [
    ['primer dominio caido', { ministerio: 'primero' }, 'vivo'],
    ['Ministerio caido, fichero bueno', { ministerio: 'falla' }, 'fichero'],
  ]) {
    const { ctx, p, err } = await abrir(b, o);
    const r = await p.evaluate(async () => { abrirGasCerca(); await new Promise(r => setTimeout(r, 2500));
      return { fuente: PRECIOS_GAS.fuente, abierto: document.getElementById('gas-cerca-panel').classList.contains('open') }; });
    console.log('en vivo · ' + nom + ': ' + JSON.stringify(r) + ' · peticiones: ' + p.__pedidas.length);
    if (r.fuente !== fuente || !r.abierto) mal('en vivo · ' + nom + ': ' + JSON.stringify(r));
    if (err.length) mal('en vivo · ' + nom + ': errores JS ' + err.join(' / '));
    await ctx.close();
  }
  // 5 · fichero caducado (el cron de GitHub no paso) y Ministerio bueno: el boton funciona
  {
    const { ctx, p, err } = await abrir(b, { fichero: 'pc_viejos.json', ministerio: 'ok' });
    const r = await p.evaluate(async () => { abrirGasCerca(); await new Promise(r => setTimeout(r, 2500));
      return { fuente: PRECIOS_GAS.fuente, estado: PRECIOS_GAS.estado, abierto: document.getElementById('gas-cerca-panel').classList.contains('open') }; });
    console.log('en vivo · fichero caducado y Ministerio bueno: ' + JSON.stringify(r));
    if (r.fuente !== 'vivo' || r.estado !== 'frescos' || !r.abierto) mal('en vivo · fichero caducado: ' + JSON.stringify(r));
    // y la categoria «mas baratas», que sin precios frescos decia que no los habia
    if (err.length) mal('en vivo · fichero caducado: errores JS ' + err.join(' / '));
    await ctx.close();
  }
  {
    const { ctx, p, err } = await abrir(b, { fichero: 'pc_viejos.json', ministerio: 'ok' });
    const r = await p.evaluate(async () => {
      toggleCategorySheet(); _activeCatTab = 'servicios'; _buildCatSheet();
      document.querySelector('#cat-grid [data-category="gasolinera_barata"]').click();
      await new Promise(r => setTimeout(r, 2500));
      return { sel: selectedCategories.has('gasolinera_barata'), n: places.filter(x => placeInCat(x, 'gasolinera_barata')).length };
    });
    console.log('en vivo · «mas baratas» con el fichero caducado: ' + JSON.stringify(r));
    if (!r.sel || !r.n) mal('en vivo · «mas baratas» con el fichero caducado no se filtra: ' + JSON.stringify(r));
    if (err.length) mal('en vivo · categoria: errores JS ' + err.join(' / '));
    await ctx.close();
  }
  // 6 · un globo de gasolinera abierto no se cierra cuando llegan los precios
  {
    const { ctx, p, err } = await abrir(b, { w: 1280, h: 800, fichero: 'pc_viejos.json', ministerio: 'ok' });
    const r = await p.evaluate(async () => {
      setCategory('gasolinera'); updateMarkers({ immediate: true });
      await new Promise(r => setTimeout(r, 2500));       // llegan los precios en vivo por el filtro
      _gasVivo.ok = 0; _gasVivo.intento = 0;               // como si hubiera pasado media hora
      PRECIOS_GAS.datos = null; PRECIOS_GAS.estado = 'sin'; PRECIOS_GAS.porId = {};
      const id = 'gas-14353-santa-cruz-de-tenerife', m = markerMap[id];
      clusterGroup.zoomToShowLayer(m, () => m.openPopup());
      await new Promise(r => setTimeout(r, 2500));
      const g = document.querySelector('.leaflet-popup .gas-precios');
      return { abierto: !!document.querySelector('.leaflet-popup'), filas: g ? (g.innerText.match(/💶/g) || []).length : -1, fuente: PRECIOS_GAS.fuente };
    });
    console.log('en vivo · globo abierto al llegar los precios: ' + JSON.stringify(r));
    if (!r.abierto || r.filas < 2 || r.fuente !== 'vivo') mal('en vivo · el globo se cerro o no se relleno: ' + JSON.stringify(r));
    if (err.length) mal('en vivo · globo: errores JS ' + err.join(' / '));
    await ctx.close();
  }
  // cambio de idioma con el panel abierto
  {
    const { ctx, p } = await abrir(b, {});
    const r = await p.evaluate(async () => {
      abrirGasCerca(); await new Promise(r => setTimeout(r, 1200));
      setLang('de'); await new Promise(r => setTimeout(r, 800));
      return { titulo: document.getElementById('gas-cerca-titulo').innerText, radio: document.querySelector('.gas-cerca-radio-lbl').innerText,
        comb: document.querySelector('.gas-cerca-comb').innerText, fecha: document.getElementById('gas-cerca-fecha').innerText };
    });
    console.log('idioma en vivo', JSON.stringify(r));
    if (r.titulo !== 'Günstigste Tankstellen in Ihrer Nähe' || !r.radio.startsWith('Luftlinie') || !r.comb.includes('Benzin')) mal('cambio de idioma');
    await ctx.close();
  }
  console.log('  fallos ...................................... ' + fallos);
  await b.close();
  fs.rmSync(S, { recursive: true, force: true });
  process.exit(fallos ? 1 : 0);
})().catch(e => { console.error(e); fs.rmSync(S, { recursive: true, force: true }); process.exit(1); });
