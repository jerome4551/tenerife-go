#!/usr/bin/env node
/* Auditoria que necesita navegador: idiomas (despues de que AUTH_STRINGS y
 * ZHT_OVERRIDES se fusionen en tiempo de ejecucion), arranque y rendimiento.
 *
 *   python3 -m http.server 8766 & node tools/auditar_web.js [puerto]
 *
 * Las tablas se declaran con `const`, asi que NO estan en window: hay que
 * alcanzarlas por nombre desde el ambito global. Un barrido de window solo
 * encuentra 2 de las 30. */
'use strict';
/* DOS LISTAS, Y NO ES REDUNDANCIA.
   IDI_BASE es la que IDENTIFICA una tabla de idiomas; IDI es la que tiene que
   estar COMPLETA. Al anadir el bulgaro se metio en la unica lista que habia, y
   como la deteccion de las tablas "por idioma" exige que esten todos, ninguna
   de esas 20 tablas se reconocio: el informe paso de 31 tablas y 460 filas a
   11 y 199, y con el 261 filas dejaron de vigilarse. Un idioma nuevo no puede
   cegar al control que comprueba los idiomas. */
const IDI_BASE = ['es','en','fr','de','it','nl','zh','zht'];
const path = require('path');
const fs = require('fs');
const RAIZ = path.dirname(__dirname);
const PUERTO = process.argv[2] || 8766;
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const src = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
/* IDI sale de SUPPORTED_LANGS del fuente, no de una lista a mano: escrita
   aqui se queda vieja el dia que entre un idioma y el control da verde sobre
   lo que no ha mirado. IDI_BASE, en cambio, NO se toca (ver arriba).
   La copia que corre dentro del navegador lee SUPPORTED_LANGS directamente,
   que alli se alcanza por su nombre. */
const IDI = ((src.match(/SUPPORTED_LANGS\s*=\s*\[([^\]]*)\]/) || [, ''])[1])
  .split(',').map(x => x.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
if (!IDI.length) { console.error('no encuentro SUPPORTED_LANGS en index.html'); process.exit(1); }
const NOMBRES = [...new Set([...src.matchAll(/^\s*(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:\{|Object\.assign)/gm)].map(m => m[1]))];
const USADAS = [...new Set([...src.matchAll(/\bL_\.(\w+)/g), ...src.matchAll(/\bt\(\)\.(\w+)/g), ...src.matchAll(/\bL\(\)\.(\w+)/g)].map(m => m[1]))];

/* Las tablas que viven dentro de una funcion o IIFE no se alcanzan desde el
   navegador: se sacan del fuente por emparejamiento de llaves y se evaluan. */
function objetoEn(i) {
  let d = 0, q = null;
  for (let k = i; k < src.length; k++) {
    const c = src[k];
    if (q) { if (c === q && src[k-1] !== '\\') q = null; continue; }
    if (c === '/' && src[k+1] === '/') { k = src.indexOf('\n', k); if (k < 0) return null; continue; }
    if (c === '/' && src[k+1] === '*') { k = src.indexOf('*/', k) + 1; continue; }
    if (c === '"' || c === "'" || c === '`') { q = c; continue; }
    if (c === '{') d++;
    else if (c === '}') { d--; if (d === 0) return src.slice(i, k + 1); }
  }
  return null;
}
function tablasDelFuente() {
  /* Pedia `es` Y `en` para dar una entrada por fila. El resultado era que una
     fila a la que le faltaba precisamente el ingles no la veia NADIE: en
     wikiTitleOverrides hay cuatro con solo `es` -teresitas, el-duque, benijo
     y playa-americas- y el control contaba 15 filas incompletas donde hay 19.
     Era mas ciego cuanto peor estaba el dato. Basta con `es`, que es lo que
     marca una fila de idiomas; de que el objeto sea una tabla y no otra cosa
     se encarga el umbral del 60 % de mas abajo. */
  const esFila = x => x && typeof x === 'object' && !Array.isArray(x) && typeof x.es === 'string';
  const out = {};
  for (const nom of NOMBRES) {
    const re = new RegExp('(?:const|let|var)\\s+' + nom.replace(/\$/g, '\\$') + '\\s*=\\s*\\{', 'g');
    let m, mejor = null;
    while ((m = re.exec(src))) { const t = objetoEn(re.lastIndex - 1); if (t && (!mejor || t.length > mejor.length)) mejor = t; }
    if (!mejor) continue;
    let v; try { v = eval('(' + mejor + ')'); } catch (e) { continue; }
    if (!v || typeof v !== 'object') continue;
    const ks = Object.keys(v); if (!ks.length) continue;
    const filas = ks.filter(k => esFila(v[k]));
    if (filas.length && filas.length >= ks.length * 0.6) { const t = {}; filas.forEach(k => t[k] = v[k]); out[nom] = t; continue; }
    if (IDI_BASE.every(l => v[l] !== undefined)) {
      const t = {};
      if (IDI_BASE.every(l => v[l] && typeof v[l] === 'object' && !Array.isArray(v[l]))) {
        const cl = new Set(); IDI_BASE.forEach(l => Object.keys(v[l]).forEach(k => cl.add(k)));
        cl.forEach(k => { const f = {}; IDI.forEach(l => { if (v[l] && typeof v[l][k] === 'string') f[l] = v[l][k]; }); t[k] = f; });
      } else { const f = {}; IDI.forEach(l => { if (typeof v[l] === 'string') f[l] = v[l]; }); t['(fila unica)'] = f; }
      out[nom] = t;
    }
  }
  return out;
}
function revisar(tablas, o) {
  for (const [nom, t] of Object.entries(tablas)) for (const [k, f] of Object.entries(t)) {
    if (typeof f.es !== 'string') continue;
    o.filas++;
    const faltan = IDI.filter(l => typeof f[l] !== 'string');
    if (faltan.length) o.incompletas.push(nom + '.' + k + ' → ' + faltan.join(','));
    const mEs = (f.es.match(/\{\w+\}/g) || []).sort().join(',');
    const hEs = (f.es.match(/<\/?[a-z][^>]*>/gi) || []).map(x => x.toLowerCase()).sort().join('');
    for (const l of IDI) {
      const v = f[l]; if (l === 'es' || typeof v !== 'string') continue;
      if (!v.trim()) { o.vacias.push(nom + '.' + k + '.' + l); continue; }
      if ((v.match(/\{\w+\}/g) || []).sort().join(',') !== mEs) o.interp.push(nom + '.' + k + '.' + l);
      if ((v.match(/<\/?[a-z][^>]*>/gi) || []).map(x => x.toLowerCase()).sort().join('') !== hEs) o.html.push(nom + '.' + k + '.' + l);
      if (/[  ]{2}/.test(v)) o.dobles.push(nom + '.' + k + '.' + l);
      if ((l === 'zh' || l === 'zht') && /[㐀-鿿]/.test(v) &&
          (/[㐀-鿿][,:;!?]/.test(v) || /\([㐀-鿿]/.test(v) || /[㐀-鿿]\)/.test(v)))
        o.hanzi.push(nom + '.' + k + '.' + l + '  ' + v.slice(0, 30));
    }
  }
}

(async () => {
  const b = await chromium.launch({ executablePath: CHROME, args: ['--no-proxy-server', '--no-sandbox'] });
  const ctx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 1200, height: 900 } });
  const page = await ctx.newPage();
  /* Lo que el navegador pide de verdad. Hace falta para comprobar que el
     arranque no sale a buscar fuentes a Google: eso no se ve mirando la
     pagina ya cargada. */
  const urlsPedidas = [];
  page.on('request', r => urlsPedidas.push(r.url()));
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  await page.goto('http://127.0.0.1:' + PUERTO + '/index.html', { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(5000);
  await page.evaluate(n => { window.__N__ = n; }, NOMBRES);

  const r = await page.evaluate(u => {
    /* Esta copia corre DENTRO del navegador, asi que necesita su propia
       IDI_BASE: la del proceso de Node no llega aqui. Misma razon que arriba,
       detectar con la base y exigir con la lista completa. IDI si se puede
       leer del propio fuente: SUPPORTED_LANGS es un const del modulo y aqui
       se alcanza por su nombre -no esta en window-. */
    const IDI = (typeof SUPPORTED_LANGS !== 'undefined') ? SUPPORTED_LANGS.slice() : [];
    const IDI_BASE = ['es','en','fr','de','it','nl','zh','zht'];
    const o = { arranque: {}, tablas: 0, filas: 0, incompletas: [], vacias: [], interp: [],
                html: [], hanzi: [], pedidas: [], dobles: [], alcanzadas: [] };
    o.arranque = { mapa: !!document.getElementById('map'),
      lugares: typeof places !== 'undefined' ? places.length : -1,
      lineas: typeof TITSA_LINES !== 'undefined' ? TITSA_LINES.length : -1,
      catalogo: typeof TITSA_PARADAS !== 'undefined' ? Object.keys(TITSA_PARADAS).length : -1,
      paradas: typeof TITSA_LINES !== 'undefined' ? TITSA_LINES.reduce((a,l)=>a+(l.paradas||[]).length,0) : -1,
      hidratado: typeof TITSA_LINES !== 'undefined' && TITSA_LINES.every(l => typeof (l.paradas||[])[0] !== 'string') };
    const esFila = x => x && typeof x === 'object' && !Array.isArray(x) && typeof x.es === 'string';
    const tablas = {};
    for (const g of window.__N__) {
      let v; try { v = eval(g); } catch (e) { continue; }
      if (!v || typeof v !== 'object' || Array.isArray(v)) continue;
      const ks = Object.keys(v); if (!ks.length) continue;
      const filas = ks.filter(k => esFila(v[k]));
      if (filas.length && filas.length >= ks.length * 0.6) { const t = {}; filas.forEach(k => t[k] = v[k]); tablas[g] = t; continue; }
      if (IDI_BASE.every(l => v[l] && typeof v[l] === 'object' && !Array.isArray(v[l]))) {
        const t = {}, cl = new Set(); IDI_BASE.forEach(l => Object.keys(v[l]).forEach(k => cl.add(k)));
        cl.forEach(k => { const f = {}; IDI.forEach(l => { if (v[l] && typeof v[l][k] === 'string') f[l] = v[l][k]; }); t[k] = f; });
        tablas[g] = t;
      }
    }
    o.tablas = Object.keys(tablas).length;
    o.alcanzadas = Object.keys(tablas);
    for (const [nom, t] of Object.entries(tablas)) for (const [k, f] of Object.entries(t)) {
      if (typeof f.es !== 'string') continue;
      o.filas++;
      const faltan = IDI.filter(l => typeof f[l] !== 'string');
      if (faltan.length) o.incompletas.push(nom + '.' + k + ' → ' + faltan.join(','));
      const mEs = (f.es.match(/\{\w+\}/g) || []).sort().join(',');
      const hEs = (f.es.match(/<\/?[a-z][^>]*>/gi) || []).map(x => x.toLowerCase()).sort().join('');
      for (const l of IDI) {
        const v = f[l]; if (l === 'es' || typeof v !== 'string') continue;
        if (!v.trim()) { o.vacias.push(nom + '.' + k + '.' + l); continue; }
        if ((v.match(/\{\w+\}/g) || []).sort().join(',') !== mEs) o.interp.push(nom + '.' + k + '.' + l);
        if ((v.match(/<\/?[a-z][^>]*>/gi) || []).map(x => x.toLowerCase()).sort().join('') !== hEs) o.html.push(nom + '.' + k + '.' + l);
        if (/[  ]{2}/.test(v)) o.dobles.push(nom + '.' + k + '.' + l);
        /* en chino los signos van de ancho completo: una coma latina pegada a
           un hanzi es un fallo de tipografia, no una variante */
        if ((l === 'zh' || l === 'zht') && /[㐀-鿿]/.test(v) &&
            (/[㐀-鿿][,:;!?]/.test(v) || /\([㐀-鿿]/.test(v) || /[㐀-鿿]\)/.test(v)))
          o.hanzi.push(nom + '.' + k + '.' + l + '  ' + v.slice(0, 30));
      }
    }
    if (window.LANGS) u.forEach(k => {
      const sin = IDI.filter(l => !LANGS[l] || LANGS[l][k] === undefined);
      if (sin.length && sin.length < 8) o.pedidas.push(k + ' → ' + sin.join(','));
    });
    return o;
  }, USADAS);

  /* las del fuente, que el navegador no alcanza */
  const est = tablasDelFuente();
  const yaVistas = new Set();      // no contar dos veces las que si se alcanzan
  const soloFuente = {};
  for (const [k, v] of Object.entries(est)) if (!r.alcanzadas.includes(k)) soloFuente[k] = v;
  r.tablas += Object.keys(soloFuente).length;
  revisar(soloFuente, r);

  const idi = [];
  for (const l of IDI) {
    idi.push([l, await page.evaluate(async lang => {
      if (typeof setLang === 'function') setLang(lang);
      await new Promise(r => setTimeout(r, 250));
      const txt = document.body.innerText;
      return { vacios: [...document.querySelectorAll('button,[data-i18n]')].filter(e => e.offsetParent && !e.textContent.trim() && !e.querySelector('img,svg')).length,
               undef: (txt.match(/undefined|\[object Object\]|NaN/g) || []).length,
               llaves: (txt.match(/\{[a-z]+\}/g) || []).length };
    }, l)]);
  }
  const perf = await page.evaluate(() => {
    const t0 = performance.now();
    const sur = TITSA_LINES.filter(l => lineServesAirport(l, 'south'));
    sur.forEach(l => drawBusLine(l.id));
    const ms = Math.round(performance.now() - t0);
    const capas = busLayerGroup ? busLayerGroup.getLayers().length : -1;
    sur.forEach(l => removeBusLineFromMap(l.id));
    return { lineas: sur.length, ms, capas };
  });

  const n = a => a.length;
  console.log('arranque: ' + JSON.stringify(r.arranque));
  console.log('\n=== idiomas ===');
  console.log('  tablas alcanzadas / filas con es : %d / %d', r.tablas, r.filas);
  /* Ese par de numeros esta escrito tambien en AUDITORIA-FINAL.md, donde
     caduca sin que nada avise: decia 404 filas con 422 dentro. Se coteja. */
  let docMal = 0;
  try {
    const doc = fs.readFileSync(path.join(RAIZ, 'AUDITORIA-FINAL.md'), 'utf8');
    const d = doc.match(/## Idiomas · (\d+) tablas, (\d+) filas/);
    const bien = d && Number(d[1]) === r.tablas && Number(d[2]) === r.filas;
    console.log('  ' + (bien ? 'OK ' : 'MAL') + ' AUDITORIA-FINAL.md dice lo mismo' +
                (bien ? '' : '   -> dice ' + (d ? d[1] + ' / ' + d[2] : '(no lo encuentra)')));
    if (!bien) docMal = 1;
  } catch (e) { console.log('  --  no se pudo leer AUDITORIA-FINAL.md'); }
  console.log('  claves que el codigo pide y faltan: %d %s', n(r.pedidas), r.pedidas.slice(0,4).join(' '));
  /* Las excepciones se declaran en el fuente con un comentario
     "SIN-TRADUCIR: <tabla>", no en una lista dentro de esta herramienta.
     wikiTitleOverrides son titulos EXACTOS de articulo de Wikipedia: uno
     inventado no devuelve el articulo, devuelve nada. Separarlas es lo que
     hace que la cifra de al lado vuelva a significar algo. */
  let exentas = [];
  try {
    const html = require('fs').readFileSync(require('path').join(__dirname, '..', 'index.html'), 'utf8');
    exentas = [...html.matchAll(/SIN-TRADUCIR:\s*([A-Za-z_$][\w$]*)/g)].map(m => m[1]);
  } catch (e) {}
  const esExenta = x => exentas.some(t => String(x).indexOf(t + '.') === 0);
  const huecos = r.incompletas.filter(x => !esExenta(x));
  const fuera  = r.incompletas.filter(esExenta);
  console.log('  filas a las que les falta un idioma: %d', n(huecos));
  huecos.slice(0, 6).forEach(x => console.log('      ' + x));
  if (fuera.length)
    console.log('  exentas por declaracion en el fuente: %d   (%s)', fuera.length, [...new Set(exentas)].join(', '));
  console.log('  cadenas vacias                   : %d', n(r.vacias));
  console.log('  {marcadores} descuadrados        : %d', n(r.interp));
  console.log('  etiquetas HTML descuadradas      : %d', n(r.html));
  r.html.slice(0, 10).forEach(x => console.log('      ' + x));
  console.log('  espacios dobles reales           : %d', n(r.dobles));
  r.dobles.slice(0, 5).forEach(x => console.log('      ' + x));
  console.log('  signos latinos pegados a un hanzi: %d', n(r.hanzi));
  r.hanzi.slice(0, 5).forEach(x => console.log('      ' + x));
  console.log('\n=== los %d renderizados ===', idi.length);
  idi.forEach(([l, v]) => console.log('  %s  vacios %d · undefined %d · {marcador} %d', l.padEnd(4), v.vacios, v.undef, v.llaves));
  /* ── los avisos de seguridad se VEN ──
     `warn` no pintaba nada en ninguna playa: el banner se suprimia si el POI
     tenia panel de mar -que lo tiene toda la costa- y el panel ensena un
     texto generico, plegado y dependiente de la API marina. 50 avisos
     invisibles. Se comprueba abriendo dos fichas: una con aviso y otra sin
     el. */
  const avisos = await page.evaluate(async () => {
    const conW = places.find(p => p.warn === 'mar' && p.category === 'playa');
    const sinW = places.find(p => !p.warn && p.category === 'playa');
    const abrir = async id => {
      const q = places.find(x => x.id === id);
      map.setView([q.lat, q.lng], 16);
      await new Promise(r => setTimeout(r, 700));
      selectPlaceFromSuggestion(id);
      await new Promise(r => setTimeout(r, 1600));
      const pop = document.querySelector('.leaflet-popup .popup-inner');
      const b = pop && pop.querySelector('.popup-warn');
      return { texto: b ? b.textContent.trim() : '', panel: pop ? !!pop.querySelector('.popup-sea-wrap') : false };
    };
    const a = await abrir(conW.id), b = await abrir(sinW.id);
    return { conId: conW.id, con: a, sinId: sinW.id, sin: b };
  });
  const okCon = avisos.con.texto.length > 20 && avisos.con.panel;
  const okSin = avisos.sin.texto === '';
  console.log('\n=== avisos de seguridad ===');
  console.log('  ' + (okCon ? 'OK ' : 'MAL') + ' una playa con warn ensena el banner aunque tenga panel de mar   (' +
              avisos.conId + ': ' + (avisos.con.texto.slice(0, 46) || '(vacio)') + ')');
  console.log('  ' + (okSin ? 'OK ' : 'MAL') + ' una playa sin warn no lo ensena   (' + avisos.sinId + ')');
  if (!okCon || !okSin) docMal = 1;

  /* ── lo que se pinta al vuelo, en el idioma de quien mira ──
     Estos tres salian fijos en castellano para los ocho idiomas y ningun
     control los veia, porque iban por innerHTML o eran una palabra suelta
     sin acento. El rotulo del boton de comprar era el peor: tx('shopBuy')
     lo pintaba traducido, y addSouvenirToCart lo devolvia a "Comprar"
     1,5 s despues de hacer clic, para siempre.
     Y el nombre del souvenir se sacaba del titulo quitando la palabra
     "PROXIMAMENTE" -que applyUiTx traduce-, asi que en ingles el producto
     entraba en la cesta como "Camiseta Tenerife Go COMING SOON" con un id
     distinto por idioma: el mismo articulo abria una linea nueva en cada
     uno en vez de sumar unidades. */
  const vivo = await page.evaluate(async () => {
    const IDI = (typeof SUPPORTED_LANGS !== 'undefined') ? SUPPORTED_LANGS.slice() : [];
    const out = { claves: [], cesta: [], boton: [] };
    for (const l of ['es','en','zht']) {
      setLang(l);
      const btn = document.querySelector('.excursion-card .souvenir-buy-btn');
      const rot = btn.textContent.trim();
      const antes = getCart().length;
      addSouvenirToCart(btn);
      const c = getCart();
      const ult = c[c.length - 1];
      out.cesta.push({ l, nombre: ult.name, id: ult.id, nuevos: c.length - antes,
                       lineas: c.length, qty: ult.qty,
                       pinta: (ult.txKey && tx(ult.txKey)) || ult.name });
      out.boton.push({ l, rot });
      await new Promise(r => setTimeout(r, 1700));
      out.boton[out.boton.length - 1].tras = btn.textContent.trim();
    }
    for (const k of ['photoLoading','routeCalculating','routeBusSearch','gpsNoSupport',
                     'authNotConfigured','camposObligatorios','shopAdded'])
      out.claves.push({ k, faltan: IDI.filter(l => !(UI_TX[k] && (UI_TX[k][l] || '').trim())) });
    /* con typeof: si la funcion no existe todavia, este control tiene que
       decir MAL, no reventar el proceso y llevarse por delante los otros
       tres resultados de este bloque. */
    out.wiki = IDI.map(l => (typeof wikiDominio === 'function' ? wikiDominio(l) : '(sin funcion)'));
    return out;
  });
  console.log('\n=== lo que se pinta al vuelo ===');
  const sinClave = vivo.claves.filter(c => c.faltan.length);
  console.log('  ' + (sinClave.length ? 'MAL' : 'OK ') +
    ' las ' + vivo.claves.length + ' claves de espera y de tienda, en los ' + IDI.length + ' idiomas');
  sinClave.forEach(c => console.log('      ' + c.k + ' → falta ' + c.faltan.join(',')));
  const botMal = vivo.boton.filter(b => b.tras !== b.rot);
  console.log('  ' + (botMal.length ? 'MAL' : 'OK ') + ' el boton de comprar vuelve a su rotulo traducido   (' +
              vivo.boton.map(b => b.l + ': ' + b.rot + '→' + b.tras).join(' · ') + ')');
  const ETIQ = /PR[OÓ]XIMAMENTE|COMING SOON|BINNENKORT|DEMN[AÄ]CHST|PROSSIMAMENTE|BIENT[OÔ]T|即將|即将/i;
  const cesMal = vivo.cesta.filter(c => ETIQ.test(c.nombre) || c.id !== vivo.cesta[0].id);
  /* Anadir el mismo articulo en tres idiomas tiene que dejar UNA linea con
     tres unidades. Si el id volviera a salir del nombre traducido, saldrian
     tres lineas de una unidad: es el fallo que ya ha entrado dos veces, la
     primera por la etiqueta PROXIMAMENTE y la segunda al traducir los
     titulos. */
  const fundeMal = vivo.cesta[2].lineas !== vivo.cesta[0].lineas || vivo.cesta[2].qty !== 3;
  /* Y la cesta tiene que pintarse en el idioma de quien mira, no en el de
     quien hizo clic: por eso se guarda la clave y no la etiqueta. */
  const pintaMal = vivo.cesta[1].pinta === vivo.cesta[0].pinta;
  console.log('  ' + (cesMal.length ? 'MAL' : 'OK ') + ' el souvenir entra con el mismo id en los 3   (' +
              vivo.cesta.map(c => c.l + ': ' + c.id).join(' · ') + ')');
  console.log('  ' + (fundeMal ? 'MAL' : 'OK ') + ' anadirlo en tres idiomas suma unidades, no abre lineas   (' +
              vivo.cesta[2].lineas + ' linea(s) · ' + vivo.cesta[2].qty + ' unidades)');
  console.log('  ' + (pintaMal ? 'MAL' : 'OK ') + ' la cesta se pinta en el idioma de quien mira   (' +
              vivo.cesta.map(c => c.l + ': "' + c.pinta + '"').join(' · ') + ')');
  if (fundeMal || pintaMal) docMal = 1;
  const wikiMal = vivo.wiki[7] !== 'zh';
  console.log('  ' + (wikiMal ? 'MAL' : 'OK ') + ' zht pide zh.wikipedia.org, que existe   (' + vivo.wiki.join(' ') + ')');
  if (sinClave.length || botMal.length || cesMal.length || wikiMal) docMal = 1;

  /* ── la rama angular de scorePlaya tiene que EJECUTARSE ──
     El propio comentario del codigo lo avisa: el objeto que se puntua no es
     la fila de PLAYAS_ORIENTACION, se copia campo a campo en dos sitios. Si
     `deducida` no llega, la rama angular no corre, no falla nada y las 87
     vuelven a puntuar por texto. Con 87 de 99 filas dependiendo de ella,
     esto tiene que estar vigilado y no leido. */
  const ori = await page.evaluate(() => {
    const ids = Object.keys(PLAYAS_ORIENTACION);
    const banio = places.filter(p => p.category === 'playa' || p.category === 'piscinas');
    const ded = { ori: 'S', badWind: [], deducida: true };
    const man = { ori: 'S', badWind: ['S'], deducida: false };
    return {
      filas: ids.length, banio: banio.length,
      sinOri: banio.filter(p => !PLAYAS_ORIENTACION[p.id]).length,
      huerfanas: ids.filter(i => !places.some(p => p.id === i)).length,
      cara: scorePlaya(ded, 180, 25),      // viento de cara: la angular resta 60
      terral: scorePlaya(ded, 0, 25),      // terral: la angular suma 20
      mano: scorePlaya(man, 180, 25)
    };
  });
  console.log('\n=== orientaciones de playa ===');
  const okCob = ori.sinOri === 0 && ori.huerfanas === 0;
  const okAng = ori.cara === 40 && ori.terral === 120;
  console.log('  ' + (okCob ? 'OK ' : 'MAL') + ' las ' + ori.banio + ' zonas de bano tienen ori, y ninguna fila cuelga  (' +
              ori.filas + ' filas · ' + ori.sinOri + ' sin ori · ' + ori.huerfanas + ' huerfanas)');
  console.log('  ' + (okAng ? 'OK ' : 'MAL') + ' la rama angular se ejecuta de verdad  (de cara ' + ori.cara +
              ' · terral ' + ori.terral + ' · a mano ' + ori.mano + ')');
  if (!okCob || !okAng) docMal = 1;

  /* ── los textos que se repintan por data-tx ──
     Empezo con las 7 tarjetas de la tienda y ahora lleva tambien el boton de
     activar notificaciones. Cualquier nodo que se marque entra solo.

     Eran HTML fijo en castellano para los ocho idiomas: 7 titulos, 7
     descripciones y 14 detalles. Ahora cada nodo lleva su clave en data-tx.
     Lo que se vigila no es que existan las claves -eso ya lo mira el control
     de datos- sino que el texto CAMBIE al cambiar de idioma: si alguien anade
     una tarjeta sin data-tx, o con una clave que no existe, no falla nada y
     esa tarjeta se queda en castellano para siempre. */
  const tienda = await page.evaluate(() => {
    const leer = () => [...document.querySelectorAll('[data-tx]')].map(e => e.textContent.trim());
    setLang('es'); const es = leer();
    setLang('en'); const en = leer();
    setLang('zht'); const zht = leer();
    setLang('es');
    const sinClave = [...document.querySelectorAll('[data-tx]')]
      .filter(e => !UI_TX[e.dataset.tx]).map(e => e.dataset.tx);
    // nodos de tarjeta estatica que se quedaron sin marcar
    const huerfanos = [...document.querySelectorAll('.excursion-card .excursion-desc')]
      .filter(e => !e.dataset.tx && !/^\s*$/.test(e.textContent)).length;
    /* Un nodo que sale igual en castellano y en ingles NO es un fallo si la
       tabla dice lo mismo en los dos: "Total" se escribe igual, y "Friendly
       Zone" o el nombre de la tienda son marca. Lo que hay que cazar es el
       nodo que NO SE REPINTA, y ese se distingue porque la tabla dice cosas
       distintas y en pantalla sale la misma. */
    const claves = [...document.querySelectorAll('[data-tx]')].map(e => e.dataset.tx);
    const debeCambiar = (i, l) => {
      const f = UI_TX[claves[i]];
      return !!(f && typeof f[l] === 'string' && typeof f.es === 'string' && f[l] !== f.es);
    };
    return { n: es.length, sinClave,  huerfanos,
             vacios: en.filter(t => !t).length,
             igualEn: es.filter((t, i) => t === en[i] && debeCambiar(i, 'en')).length,
             igualZht: es.filter((t, i) => t === zht[i] && debeCambiar(i, 'zht')).length,
             coincidenPorTabla: es.filter((t, i) => t === en[i] && !debeCambiar(i, 'en')).length };
  });
  console.log('\n=== textos marcados con data-tx ===');
  const okT = tienda.sinClave.length === 0 && tienda.huerfanos === 0 && tienda.vacios === 0;
  /* Coincidir con el castellano no es de por si un fallo -"Pack Tenerife Go"
     es igual en frances-, pero que coincidan MUCHOS si: querria decir que el
     repintado no se esta ejecutando. */
  /* `tienda.n > 0` no sobra: sin el, un fichero SIN NINGUN data-tx daba
     "iguales 0 de 0" y el control aprobaba sin haber mirado nada. Es el
     aprobado vacio de siempre, y aqui se dio de verdad al probarlo contra el
     codigo anterior. Las 7 tarjetas dan 28 nodos; menos de 20 es que algo se
     ha perdido por el camino. */
  /* Ya no se admite ningun nodo sin repintar: el margen de antes existia
     porque la comprobacion no sabia distinguir una coincidencia de la tabla
     de un nodo muerto. Ahora si lo sabe, asi que el limite es cero. */
  const okCambia = tienda.n >= 20 && tienda.igualEn === 0 && tienda.igualZht === 0;
  console.log('  ' + (okT ? 'OK ' : 'MAL') + ' los ' + tienda.n + ' nodos con data-tx tienen clave y no quedan huerfanos  (' +
              'sin clave ' + tienda.sinClave.length + ' · huerfanos ' + tienda.huerfanos + ' · vacios en ' + tienda.vacios + ')');
  tienda.sinClave.slice(0, 5).forEach(k => console.log('      <--  ' + k));
  console.log('  ' + (okCambia ? 'OK ' : 'MAL') + ' el texto cambia de verdad al cambiar de idioma  (' +
              'sin repintar: en ' + tienda.igualEn + ' · zht ' + tienda.igualZht + ' de ' + tienda.n +
              ' · coinciden porque la tabla lo dice: ' + tienda.coincidenPorTabla + ')');
  if (!okT || !okCambia) docMal = 1;

  /* ── el selector de idioma ──
     setLang marca la opcion activa POR INDICE:
       querySelectorAll('.lang-option').forEach((el,i) =>
         el.classList.toggle('active', SUPPORTED_LANGS[i] === lang))
     Si alguien reordena el HTML o anade una opcion en medio, el tick aparece
     en el idioma equivocado y no falla nada. Asi que se comprueba lo que de
     verdad importa: que al pedir un idioma se marque ESE. */
  const sel = await page.evaluate(() => {
    const codigo = el => (/setLang\('([a-z]+)'\)/.exec(el.getAttribute('onclick') || '') || [])[1];
    const todas = [...document.querySelectorAll('.lang-option')];
    const dd = document.getElementById('lang-dropdown');
    /* Ninguna opcion puede vivir FUERA del desplegable. Al anadir el bulgaro
       se inserto detras del cierre de `.lang-dropdown` en vez de dentro, y se
       quedo flotando en la cabecera, saliendose de la pantalla. El HTML era
       valido y nada fallaba: solo se veia mirando el movil. */
    const fuera = todas.filter(e => !dd.contains(e)).map(codigo);
    /* Y un idioma sin terminar no puede estar ni visible ni alcanzable: ni en
       el menu, ni por localStorage, ni por el idioma del telefono. */
    const incompletos = (typeof IDIOMAS_INCOMPLETOS !== 'undefined') ? IDIOMAS_INCOMPLETOS : [];
    const visiblesIncompletos = todas.filter(e => incompletos.indexOf(codigo(e)) !== -1 &&
                                                  getComputedStyle(e).display !== 'none').map(codigo);
    const pegan = [];
    incompletos.forEach(l => { setLang(l); if (currentLang === l) pegan.push(l); });
    const orden = todas.map(codigo);
    const mal = [];
    for (const l of orden) {
      if (!l || incompletos.indexOf(l) !== -1) continue;
      setLang(l);
      const act = [...document.querySelectorAll('.lang-option')].filter(e => e.classList.contains('active')).map(codigo);
      const tick = [...document.querySelectorAll('.lang-option-check')].filter(e => e.style.display !== 'none').map(e => e.id);
      if (act.length !== 1 || act[0] !== l || tick.length !== 1 || tick[0] !== 'check-' + l)
        mal.push(l + ' -> marcado ' + (act.join(',') || 'ninguno') + ' / tick ' + (tick.join(',') || 'ninguno'));
    }
    /* ── EL OTRO SELECTOR ──
       Hay DOS listas de idiomas en el marcado, no una: el desplegable de la
       barra y los chips de la pantalla de bienvenida (.v19-w-lang), que es
       la primera que ve nadie. Este control solo miraba el desplegable, asi
       que al entrar el polaco la bienvenida se quedo en nueve y en verde.
       Lo cazo el usuario, no la auditoria. Ahora se comparan LAS DOS contra
       SUPPORTED_LANGS, que es la unica lista que manda.
       El desplegable ademas por ORDEN, porque setLang marca por indice; los
       chips por data-lang, que es como los marca updateWelcomeTexts. */
    const chips = [...document.querySelectorAll('.v19-w-lang')];
    const bienvenida = chips.map(e => e.getAttribute('data-lang'));
    const malChip = [];
    for (const l of SUPPORTED_LANGS) {
      if (incompletos.indexOf(l) !== -1) continue;
      setLang(l);
      const on = chips.filter(e => e.classList.contains('on')).map(e => e.getAttribute('data-lang'));
      if (on.length !== 1 || on[0] !== l) malChip.push(l + ' -> ' + (on.join(',') || 'ninguno'));
    }
    setLang('es');
    return { orden, mal, n: orden.filter(Boolean).length, fuera, visiblesIncompletos, pegan, incompletos,
             soportados: SUPPORTED_LANGS.slice(), bienvenida, malChip };
  });
  console.log('\n=== selector de idioma ===');
  /* n >= 9 era un numero escrito: con nueve opciones y diez idiomas daba OK.
     Ahora se le exige que sean LOS de SUPPORTED_LANGS, en su orden. */
  const okOrden = sel.orden.join(',') === sel.soportados.join(',');
  const okSel = sel.mal.length === 0 && okOrden;
  console.log('  ' + (okSel ? 'OK ' : 'MAL') + ' cada opcion terminada marca la suya   (' + sel.orden.join(' ') + ')');
  if (!okOrden) console.log('      <--  el desplegable dice [' + sel.orden.join(' ') +
                            '] y SUPPORTED_LANGS [' + sel.soportados.join(' ') + ']');
  const okBien = sel.bienvenida.join(',') === sel.soportados.join(',') && sel.malChip.length === 0;
  console.log('  ' + (okBien ? 'OK ' : 'MAL') + ' la pantalla de bienvenida ensena los mismos   (' +
              sel.bienvenida.join(' ') + ')');
  if (sel.bienvenida.join(',') !== sel.soportados.join(','))
    console.log('      <--  falta(n) ' + (sel.soportados.filter(l => sel.bienvenida.indexOf(l) === -1).join(',') || '-') +
                ' / sobra(n) ' + (sel.bienvenida.filter(l => sel.soportados.indexOf(l) === -1).join(',') || '-'));
  sel.malChip.forEach(m => console.log('      <--  chip ' + m));
  sel.mal.forEach(m => console.log('      <--  ' + m));
  const okFuera = sel.fuera.length === 0;
  console.log('  ' + (okFuera ? 'OK ' : 'MAL') + ' ninguna opcion vive fuera del desplegable' +
              (okFuera ? '' : '   <--  ' + sel.fuera.join(',')));
  const okInc = sel.visiblesIncompletos.length === 0 && sel.pegan.length === 0;
  console.log('  ' + (okInc ? 'OK ' : 'MAL') + ' los idiomas sin terminar no se ven ni se pegan   (' +
              (sel.incompletos.join(',') || 'ninguno') + ')');
  if (sel.visiblesIncompletos.length) console.log('      <--  visibles: ' + sel.visiblesIncompletos.join(','));
  if (sel.pegan.length) console.log('      <--  se quedan puestos: ' + sel.pegan.join(','));
  if (!okSel || !okBien || !okFuera || !okInc) docMal = 1;

  /* ── el saludo del asistente ──
     Se pintaba atado a `chatHistory.length===0`, y chatHistory solo guarda lo
     que se habla: el saludo del bot no entra ahi. La condicion era cierta
     siempre, asi que cada apertura apilaba otro saludo, y ademas se quedaba
     congelado en el idioma en que se pinto: un usuario polaco abria el
     asistente y leia el saludo en castellano.
     No lo cazaba nadie porque el panel se pinta al abrirlo, y los controles
     que comparan idiomas miran la pagina tal cual esta. Asi que se abre. */
  const saludo = await page.evaluate(async () => {
    const leer = () => [...document.querySelectorAll('#chat-messages .chat-bubble')]
      .filter(e => (e.innerText || '').trim()).map(e => (e.innerText || '').trim());
    const esperar = ms => new Promise(r => setTimeout(r, ms));
    const o = { repes: 0, malIdioma: [], tras: [] };
    setLang('es'); await esperar(400);
    openChatPanel(); await esperar(1400);
    closeChatPanel(); openChatPanel(); await esperar(1400);
    closeChatPanel(); openChatPanel(); await esperar(1400);
    o.repes = leer().length;                      // tres aperturas, un saludo
    for (const l of SUPPORTED_LANGS) {
      setLang(l); await esperar(1300);
      const b = leer();
      const esperado = (chatT('welcome') || '').split('\n')[0].trim();
      const remite = '\u{1F334} ' + chatT('senderName');
      if (b.length !== 1 || b[0].indexOf(esperado) < 0 || b[0].indexOf(remite) < 0)
        o.malIdioma.push(l + ' -> ' + (b.length) + ' burbuja(s): ' + (b[0] || '').slice(0, 40));
    }
    /* Y con conversacion por medio NO se toca: reescribir lo que alguien ya
       leyo en otro idioma seria cambiarle el historial por detras. */
    setLang('es'); await esperar(900);
    processUserMessage('playas'); await esperar(2400);
    const antes = leer().length;
    setLang('bg'); await esperar(1400);
    o.tras = [antes, leer().length];
    setLang('es'); closeChatPanel();
    return o;
  }).catch(e => ({ err: String(e).slice(0, 120), repes: -1, malIdioma: ['(no se pudo abrir)'], tras: [] }));
  console.log('\n=== el saludo del asistente ===');
  const okRepe = saludo.repes === 1;
  console.log('  ' + (okRepe ? 'OK ' : 'MAL') + ' tres aperturas dejan UN saludo, no tres   (' + saludo.repes + ')');
  const okIdi = saludo.malIdioma.length === 0;
  console.log('  ' + (okIdi ? 'OK ' : 'MAL') + ' el saludo y su remite siguen al idioma en los ' +
              (saludo.malIdioma.length ? '' : '') + 'diez');
  saludo.malIdioma.forEach(m => console.log('      <--  ' + m));
  const okHist = saludo.tras.length === 2 && saludo.tras[0] === saludo.tras[1] && saludo.tras[0] > 1;
  console.log('  ' + (okHist ? 'OK ' : 'MAL') + ' con conversacion por medio no se reescribe   (' +
              saludo.tras.join(' -> ') + ')');
  if (saludo.err) console.log('      <--  ' + saludo.err);
  if (!okRepe || !okIdi || !okHist) docMal = 1;

  /* ── EL TEXTO QUE SE VUELVE CASTELLANO AL USAR LA APP ──
     Todos los controles de idioma de este proyecto FOTOGRAFIAN la pagina
     quieta. Por eso daban verde sobre cinco rotulos que estan bien al
     arrancar y se reescriben en castellano en cuanto alguien toca:
       · el chip «Solo este» de las categorias, que se crea al vuelo
       · «+N mas - sigue escribiendo» del buscador
       · la pista 🅰️/🅱️ de la ruta, que el marcado pinta traducida con
         data-tx y activatePick() machacaba con un literal
       · el boton de la reserva, «Pagar»/«Anadir a la cesta»
       · el boton del planificador cuando eliges mas de una actividad,
         que dpApplyUiTexts() deja traducido y dpiSelectZone machacaba
     Asi que este control TOCA. Se pide bulgaro, que cambia de alfabeto: si
     despues de usar la app queda algo en alfabeto latino donde deberia
     haber cirilico, es que alguien lo reescribio. */
  const tocado = await page.evaluate(async () => {
    const esperar = ms => new Promise(r => setTimeout(r, ms));
    const LATIN = /^[^\u0400-\u04ff]*$/;      // ni una letra cirilica
    const o = [];
    const mira = (que, txt) => {
      const t = String(txt || '').replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}\d\s\u2192\u2026+\-/·()]/gu, '');
      if (t && LATIN.test(t)) o.push(que + ': ' + String(txt).slice(0, 44));
    };
    setLang('bg'); await esperar(1000);

    toggleCategorySheet(); await esperar(700);
    const solo = document.querySelector('.cat-chip-solo');
    mira('chip «solo este»', solo && solo.textContent);
    toggleCategorySheet(); await esperar(300);

    const inp = document.getElementById('search-input');
    if (inp) { inp.value = 'pla'; inp.dispatchEvent(new Event('input', { bubbles: true })); }
    await esperar(700);
    const sug = document.querySelector('.no-results');
    if (sug && /\+?\d/.test(sug.textContent)) mira('buscador «+N mas»', sug.textContent);
    if (inp) { inp.value = ''; inp.dispatchEvent(new Event('input', { bubbles: true })); }

    activatePick('origin'); await esperar(250);
    mira('pista de ruta A', (document.getElementById('route-pick-hint') || {}).textContent);
    activatePick('dest'); await esperar(250);
    mira('pista de ruta B', (document.getElementById('route-pick-hint') || {}).textContent);

    try { updateBookingCTA(); } catch (e) {}
    mira('boton de reserva', (document.getElementById('booking-cta-btn') || {}).textContent);

    const cards = [...document.querySelectorAll('#dpi-zone-grid .dp-zone-card')];
    if (cards.length >= 2) {
      cards[0].click(); await esperar(200);
      mira('planificador, una', (document.getElementById('dpi-confirm-btn') || {}).textContent);
      cards[1].click(); await esperar(200);
      mira('planificador, varias', (document.getElementById('dpi-confirm-btn') || {}).textContent);
      cards[0].click(); cards[1].click();
    } else o.push('(no encuentro las tarjetas del planificador)');
    setLang('es');
    return o;
  }).catch(e => ['(no se pudo recorrer: ' + String(e).slice(0, 80) + ')']);
  console.log('\n=== texto que se vuelve castellano al USAR la app ===');
  console.log('  ' + (tocado.length ? 'MAL' : 'OK ') + ' seis rotulos que se reescriben al tocar siguen en su idioma');
  tocado.forEach(t => console.log('      <--  ' + t));
  if (tocado.length) docMal = 1;

  /* ── LO QUE ESCRIBE EL ADMINISTRADOR ──
     El nombre y la descripcion de un anuncio, una excursion o un souvenir
     los escribe el administrador una vez y en castellano. Antes se
     pintaban tal cual en los diez idiomas. Ahora la traduccion viaja en
     la columna `i18n` de la fila.
     No hay Supabase aqui, asi que se inyectan filas como las que devuelve
     el servidor: una traducida, una sin traducir -tiene que caer al
     castellano, no quedarse en blanco- y una que intenta colar HTML, para
     que el camino nuevo no se salte el escapado. */
  const tiendaI18n = await page.evaluate(async () => {
    const esperar = ms => new Promise(r => setTimeout(r, ms));
    exPublicCache = [
      { id: 'a', emoji: '🔥', name: 'Barbacoa entre amigos', desc: 'Coge tu movil y escribe a tu gente',
        duration: '4 horas', location: 'Tenerife', diff: 'Alta', price: 0, maxp: 0, visible: true,
        i18n: { bg: { name: 'Барбекю между приятели', desc: 'Вземи телефона си.' } } },
      { id: 'b', emoji: '🌋', name: 'Sin traducir', desc: 'Esta no tiene i18n',
        duration: '90 min', location: 'Anaga', diff: 'Media', price: 1, maxp: 0, visible: true, i18n: {} },
      { id: 'c', emoji: '💀', name: '<img src=x onerror=alert(1)>', desc: '"><script>alert(2)</script>',
        duration: '2 días', location: 'X', diff: 'Fácil', price: 1, maxp: 0, visible: true,
        i18n: { bg: { name: '<svg onload=alert(3)>' } } }
    ];
    const leer = () => {
      const c = document.getElementById('shop-tab-content-excursions');
      return [...c.querySelectorAll('[data-admin="1"]')].map(x => ({
        t: x.querySelector('.excursion-title').textContent,
        d: x.querySelector('.excursion-desc').textContent,
        m: [...x.querySelectorAll('.excursion-meta span')].map(s => s.textContent.trim()).join(' ')
      }));
    };
    const o = { mal: [] };
    setLang('bg'); renderShopExcursions(); await esperar(300);
    let f = leer();
    if (!/Барбекю/.test(f[0].t)) o.mal.push('la traducida no sale en bulgaro: ' + f[0].t);
    if (f[1].t !== 'Sin traducir') o.mal.push('la no traducida no cae al castellano: ' + f[1].t);
    if (!/часа/.test(f[0].m)) o.mal.push('«4 horas» no se traduce: ' + f[0].m);
    if (!/мин/.test(f[1].m)) o.mal.push('«90 min» no se traduce: ' + f[1].m);
    if (!/дни/.test(f[2].m)) o.mal.push('«2 días» no se traduce: ' + f[2].m);
    if (!/Висока/.test(f[0].m)) o.mal.push('la dificultad no se traduce: ' + f[0].m);
    if (!/Tenerife/.test(f[0].m)) o.mal.push('el sitio deberia quedarse como esta: ' + f[0].m);
    setLang('pl'); renderShopExcursions(); await esperar(300);
    f = leer();
    if (!/Grill|Barbacoa/.test(f[0].t)) o.mal.push('sin polaco deberia caer al castellano: ' + f[0].t);
    if (!/Wysoka/.test(f[0].m)) o.mal.push('la dificultad no se traduce al polaco: ' + f[0].m);
    const c = document.getElementById('shop-tab-content-excursions');
    o.img = c.querySelectorAll('img').length;
    o.svg = c.querySelectorAll('svg').length;
    o.scr = c.querySelectorAll('script').length;
    exPublicCache = []; renderShopExcursions(); setLang('es');
    return o;
  }).catch(e => ({ mal: ['(no se pudo probar: ' + String(e).slice(0, 90) + ')'], img: 0, svg: 0, scr: 0 }));
  console.log('\n=== la tienda, en el idioma de quien mira ===');
  const okTI = tiendaI18n.mal.length === 0;
  console.log('  ' + (okTI ? 'OK ' : 'MAL') + ' traduce lo traducido, cae al castellano lo que no, y la duracion y la dificultad salen solas');
  tiendaI18n.mal.forEach(m => console.log('      <--  ' + m));
  const okXI = !tiendaI18n.img && !tiendaI18n.svg && !tiendaI18n.scr;
  console.log('  ' + (okXI ? 'OK ' : 'MAL') + ' el camino nuevo no se salta el escapado   (img ' +
              tiendaI18n.img + ' · svg ' + tiendaI18n.svg + ' · script ' + tiendaI18n.scr + ')');
  if (!okTI || !okXI) docMal = 1;

  /* ── EL ARRANQUE NO ESPERA A NADIE DE FUERA ──
     Dos etiquetas del <head> frenaban la app antes de pintar nada:
       · el <script> de Supabase sin `defer`, que PARA el parseo del HTML
         hasta que jsDelivr contesta
       · el <link> a fonts.googleapis.com, que bloquea el primer pintado y
         ademas dejaba la app sin su tipografia al quedarse sin cobertura
     Medido: el primer pintado paso de 836 a 324 ms con CPU normal y de 948
     a 544 ms con CPU de movil en 5G.
     Esto no se ve mirando la pagina ya cargada, asi que se mira el <head>
     y se cuenta lo que el navegador pidio de verdad. */
  const cab = await page.evaluate(() => {
    const sc = [...document.querySelectorAll('head script[src]')];
    const ln = [...document.querySelectorAll('head link[rel="stylesheet"]')];
    return {
      /* Se exige solo a los de OTRO dominio. Los de ./vendor/ tambien
         bloquean, y a proposito: `map = L.map(...)` corre en el nivel
         superior de un <script> en linea, o sea DURANTE el parseo, asi que
         Leaflet tiene que estar ya. Aplazarlos pide mover la creacion del
         mapa a una funcion, que es otra faena. Ademas son del propio
         origen y el service worker los precachea: a partir de la segunda
         visita salen del cache. Se listan aparte para que la exencion
         este escrita y no sea un silencio. */
      bloqueantes: sc.filter(e => !e.defer && !e.async && !e.src.startsWith(location.origin))
                     .map(e => e.src.slice(0, 60)),
      propios: sc.filter(e => !e.defer && !e.async && e.src.startsWith(location.origin))
                 .map(e => e.src.split('/').pop()),
      hojasDeFuera: ln.filter(e => !e.href.startsWith(location.origin)).map(e => e.href.slice(0, 60)),
      fuentes: [...document.fonts].filter(f => f.status === 'loaded').length
    };
  });
  const aGoogle = urlsPedidas.filter(u => /fonts\.(googleapis|gstatic)\.com/.test(u));
  console.log('\n=== el arranque no espera a nadie de fuera ===');
  const okBlq = cab.bloqueantes.length === 0;
  console.log('  ' + (okBlq ? 'OK ' : 'MAL') + ' ningun script DE FUERA para el parseo del HTML' +
              (okBlq ? '' : '   <--  ' + cab.bloqueantes.join(' ')));
  console.log('      (del propio origen y precacheados, si bloquean: ' + cab.propios.join(' ') + ')');
  const okHoja = cab.hojasDeFuera.length === 0;
  console.log('  ' + (okHoja ? 'OK ' : 'MAL') + ' ninguna hoja de estilo viene de otro dominio' +
              (okHoja ? '' : '   <--  ' + cab.hojasDeFuera.join(' ')));
  const okG = aGoogle.length === 0;
  console.log('  ' + (okG ? 'OK ' : 'MAL') + ' cero peticiones de fuentes a Google   (' + aGoogle.length + ')');
  const okF = cab.fuentes >= 4;
  console.log('  ' + (okF ? 'OK ' : 'MAL') + ' las fuentes del proyecto cargan   (' + cab.fuentes + ' cargadas)');
  if (!okBlq || !okHoja || !okG || !okF) docMal = 1;

  /* ── EL ITINERARIO DE «ORGANIZA TU DIA» ──
     Salia entero en castellano aunque la app estuviera en bulgaro: la
     descripcion se pedia como `place.desc.es || place.desc.en` -el
     castellano PRIMERO- y el titulo, los rotulos de transito y los botones
     estaban escritos a pelo en el render.
     Se genera de verdad y se mira lo que queda en pantalla. El bulgaro
     cambia de alfabeto, asi que lo que siga en latino, o es nombre propio
     o no esta traducido. */
  const itin = await page.evaluate(async () => {
    const esperar = ms => new Promise(r => setTimeout(r, ms));
    const LATIN = t => !/[\u0400-\u04ff]/.test(String(t || '')
      .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}\d\s~·:.,()\/\u2192\u2026\u2715-]/gu, ''));
    const o = { mal: [] };
    setLang('bg'); await esperar(900);
    // los dos renders: el de «Organiza tu dia» y el de «Ruta del dia»
    dpiTime = '4h'; dpiZone = 'mix'; dpiSelectedZones = ['mix']; dpiTransport = 'bici';
    dpiGenerate(); await esperar(1600);
    const mira = (donde, titId, listId) => {
      const t = document.getElementById(titId);
      const c = document.getElementById(listId);
      const s1 = c && c.querySelector('.dp-stop');
      if (!s1) { o.mal.push(donde + ': no se genero ninguna parada'); return; }
      if (LATIN(t.textContent)) o.mal.push(donde + ' titulo: ' + t.textContent.slice(0, 34));
      const d = s1.querySelector('.dp-stop-desc').textContent;
      if (LATIN(d)) o.mal.push(donde + ' descripcion: ' + d.slice(0, 40));
      [...s1.querySelectorAll('.dp-stop-actions span')].forEach(x => {
        if (x.textContent.trim() && x.textContent.trim() !== '\u2715' && LATIN(x.textContent))
          o.mal.push(donde + ' boton: ' + x.textContent.trim());
      });
      const sep = c.querySelector('.dp-sep-text');
      if (sep && LATIN(sep.textContent)) o.mal.push(donde + ' transito: ' + sep.textContent.trim());
    };
    mira('organiza tu dia', 'dpi-result-title', 'dpi-itinerary');
    dpZone = 'mix';
    renderItinerary(places.filter(x => x.desc && x.name).slice(0, 4));
    await esperar(400);
    mira('ruta del dia', 'dp-result-title', 'dp-itinerary');
    /* Y el corte: se hacia DESPUES de escapar, asi que un corte a los 100
       caracteres podia caer dentro de un «&quot;» y dejar «&qu» a la vista. */
    const trampa = { id: 'x', name: 'x', emoji: '\u2600',
      desc: { es: '"' + 'a'.repeat(96) + '" y & mas', bg: '"' + '\u0431'.repeat(96) + '" \u0438 & \u043e\u0449\u0435' },
      category: 'mirador' };
    renderItinerary([trampa, trampa]);
    await esperar(300);
    const rec = document.querySelector('#dp-itinerary .dp-stop-desc');
    if (rec && /&(?:[a-z]{1,6}|#\d{1,5});?$/i.test(rec.textContent.replace(/\u2026$/, '')))
      o.mal.push('el corte parte una entidad HTML: ' + rec.textContent.slice(-14));
    if (rec && /&(amp|quot|lt|gt|#39);/.test(rec.textContent))
      o.mal.push('se escapa dos veces: ' + rec.textContent.slice(0, 30));
    setLang('es');
    return o;
  }).catch(e => ({ mal: ['(no se pudo generar: ' + String(e).slice(0, 90) + ')'] }));
  console.log('\n=== el itinerario de «organiza tu dia» ===');
  const okIt = itin.mal.length === 0;
  console.log('  ' + (okIt ? 'OK ' : 'MAL') + ' titulo, descripcion, botones y transito salen en el idioma de quien mira');
  itin.mal.forEach(m => console.log('      <--  ' + m));
  if (!okIt) docMal = 1;

  /* ── EL PLURAL ──
     La regla era `n === 1 ? singular : plural` para los diez idiomas, y
     ademas cuatro filas no llevaban ni singular: el castellano decia
     «Max. 1 personas» y «1 dias». El polaco tiene TRES formas y con dos
     no acierta nunca.
     Se comprueban los casos que separan una regla buena de una mala:
     el 1, el 2, el 5 y las trampas polacas -12, que va con el genitivo
     aunque acabe en 2 -y 112, que es el mismo caso a tres cifras-, y 22,
     que no. Ninguno sale del numero de lugares: no deben caducar. */
  const plu = await page.evaluate(async () => {
    const esperar = ms => new Promise(r => setTimeout(r, ms));
    const o = { mal: [] };
    const casos = [
      ['es', 'contadorLugares', 1, '1 lugar'], ['es', 'contadorLugares', 5, '5 lugares'],
      ['en', 'contadorLugares', 1, '1 place'],
      ['bg', 'contadorLugares', 1, '1 \u043c\u044f\u0441\u0442\u043e'], ['bg', 'contadorLugares', 5, '5 \u043c\u0435\u0441\u0442\u0430'],
      ['pl', 'contadorLugares', 1, '1 miejsce'],
      ['pl', 'contadorLugares', 2, '2 miejsca'],
      ['pl', 'contadorLugares', 5, '5 miejsc'],
      ['pl', 'contadorLugares', 12, '12 miejsc'],
      ['pl', 'contadorLugares', 22, '22 miejsca'],
      ['pl', 'contadorLugares', 112, '112 miejsc'],
      ['pl', 'contadorResultados', 5, '5 wynik\u00f3w']
    ];
    for (const [l, k, n, esperado] of casos) {
      setLang(l); await esperar(90);
      const dio = plural(k, n);
      if (dio !== esperado) o.mal.push(l + ' ' + k + ' n=' + n + ': «' + dio + '» y deberia «' + esperado + '»');
    }
    /* Y las filas con la frase entera, que van por tx() y no por plural() */
    const frases = [
      ['es', 'shopMaxPeople', 1, 'M\u00e1x. 1 persona'],
      ['en', 'shopDays', 1, '1 day'],
      ['pl', 'shopMaxPeople', 1, 'Maks. 1 osoba'],
      ['pl', 'shopMaxPeople', 2, 'Maks. 2 osoby'],
      ['pl', 'shopMaxPeople', 5, 'Maks. 5 os\u00f3b'],
      ['zh', 'shopMaxPeople', 1, '\u6700\u591a 1 \u4eba']
    ];
    for (const [l, k, n, esperado] of frases) {
      setLang(l); await esperar(90);
      const dio = tx(k, { n: n });
      if (dio !== esperado) o.mal.push(l + ' ' + k + ' n=' + n + ': «' + dio + '» y deberia «' + esperado + '»');
    }
    setLang('es');
    return o;
  }).catch(e => ({ mal: ['(no se pudo probar: ' + String(e).slice(0, 90) + ')'] }));
  console.log('\n=== el plural, idioma por idioma ===');
  const okPl = plu.mal.length === 0;
  console.log('  ' + (okPl ? 'OK ' : 'MAL') + ' 18 casos, incluidas las tres formas del polaco y sus trampas (12, 22, 804)');
  plu.mal.forEach(m => console.log('      <--  ' + m));
  if (!okPl) docMal = 1;

  /* ── ACCESIBILIDAD: lo minimo, que nunca se habia mirado ──
     No es una auditoria WCAG entera: son las dos cosas que dejan a alguien
     fuera del todo. Un pulsable sin nombre accesible no existe para un
     lector de pantalla, y un campo sin etiqueta se anuncia como «selector
     de fecha» a secas. El tamano de las zonas tocables se MIDE y se
     informa, pero no falla: cambiarlo es tocar el diseno. */
  const acc = await page.evaluate(() => {
    const vis = el => { const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden'; };
    const nombre = el => (el.getAttribute('aria-label') || el.getAttribute('title') ||
      (el.innerText || '').trim() || el.getAttribute('alt') || '').trim();
    const o = { sinNombre: [], sinEtiqueta: [], imgSinAlt: 0, pequenos: 0, pequenosNoEnlace: [] };
    for (const el of document.querySelectorAll('button, a[href], [role="button"], [onclick]')) {
      if (!vis(el)) continue;
      if (!nombre(el)) o.sinNombre.push(((el.id || el.className || el.tagName) + '').slice(0, 44));
      const r = el.getBoundingClientRect();
      if (r.width < 24 || r.height < 24) {
        o.pequenos++;
        /* Un enlace dentro de una frase esta exento en WCAG 2.2; los
           botones sueltos no, y esos son los que se listan. */
        if (el.tagName !== 'A') o.pequenosNoEnlace.push(((el.id || el.className) + '').slice(0, 30) +
          ' ' + Math.round(r.width) + 'x' + Math.round(r.height));
      }
    }
    for (const el of document.querySelectorAll('img')) if (vis(el) && !el.hasAttribute('alt')) o.imgSinAlt++;
    for (const el of document.querySelectorAll('input, select, textarea')) {
      if (!vis(el)) continue;
      const tiene = el.getAttribute('aria-label') || el.getAttribute('placeholder') ||
        (el.id && document.querySelector('label[for="' + CSS.escape(el.id) + '"]')) || el.closest('label');
      if (!tiene) o.sinEtiqueta.push((el.id || el.name || el.type || 'input').slice(0, 34));
    }
    return o;
  });
  console.log('\n=== accesibilidad, lo minimo ===');
  const okN = acc.sinNombre.length === 0;
  console.log('  ' + (okN ? 'OK ' : 'MAL') + ' todo lo que se pulsa tiene nombre accesible   (' + acc.sinNombre.length + ' sin el)');
  [...new Set(acc.sinNombre)].slice(0, 6).forEach(x => console.log('      <--  ' + x));
  const okE = acc.sinEtiqueta.length === 0;
  console.log('  ' + (okE ? 'OK ' : 'MAL') + ' todo campo de formulario tiene etiqueta   (' + acc.sinEtiqueta.length + ' sin ella)');
  [...new Set(acc.sinEtiqueta)].slice(0, 6).forEach(x => console.log('      <--  ' + x));
  const okI = acc.imgSinAlt === 0;
  console.log('  ' + (okI ? 'OK ' : 'MAL') + ' toda imagen visible declara alt   (' + acc.imgSinAlt + ' sin el)');
  console.log('  --  zonas tocables menores de 24x24: ' + acc.pequenos +
              ' (' + acc.pequenosNoEnlace.length + ' no son enlaces de texto) — se informa, no falla');
  [...new Set(acc.pequenosNoEnlace)].slice(0, 6).forEach(x => console.log('          ' + x));
  if (!okN || !okE || !okI) docMal = 1;

  console.log('\n=== rendimiento ===');
  console.log('  aeropuerto sur: %d lineas · %d capas · %d ms', perf.lineas, perf.capas, perf.ms);
  console.log('\npageerrors: ' + errs.length);
  errs.slice(0, 5).forEach(e => console.log('   ' + e));
  await b.close();
  process.exit((errs.length || docMal) ? 1 : 0);
})();
