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
  const IDI = ['es','en','fr','de','it','nl','zh','zht','bg'];
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
  const IDI = ['es','en','fr','de','it','nl','zh','zht','bg'];
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
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  await page.goto('http://127.0.0.1:' + PUERTO + '/index.html', { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(5000);
  await page.evaluate(n => { window.__N__ = n; }, NOMBRES);

  const r = await page.evaluate(u => {
    const IDI = ['es','en','fr','de','it','nl','zh','zht','bg'];
    /* Esta copia corre DENTRO del navegador, asi que necesita su propia
       IDI_BASE: la del proceso de Node no llega aqui. Misma razon que arriba,
       detectar con la base y exigir con la lista completa. */
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
  for (const l of ['es','en','fr','de','it','nl','zh','zht','bg']) {
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
  console.log('  filas a las que les falta un idioma: %d', n(r.incompletas));
  r.incompletas.slice(0, 6).forEach(x => console.log('      ' + x));
  console.log('  cadenas vacias                   : %d', n(r.vacias));
  console.log('  {marcadores} descuadrados        : %d', n(r.interp));
  console.log('  etiquetas HTML descuadradas      : %d', n(r.html));
  console.log('  espacios dobles reales           : %d', n(r.dobles));
  console.log('  signos latinos pegados a un hanzi: %d', n(r.hanzi));
  r.hanzi.slice(0, 5).forEach(x => console.log('      ' + x));
  console.log('\n=== los 8 renderizados ===');
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
    const IDI = ['es','en','fr','de','it','nl','zh','zht','bg'], out = { claves: [], cesta: [], boton: [] };
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
  console.log('  ' + (sinClave.length ? 'MAL' : 'OK ') + ' las 7 claves de espera y de tienda, en los 8 idiomas');
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
    return { n: es.length, sinClave,  huerfanos,
             vacios: en.filter(t => !t).length,
             igualEn: es.filter((t, i) => t === en[i]).length,
             igualZht: es.filter((t, i) => t === zht[i]).length };
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
  const okCambia = tienda.n >= 20 && tienda.igualEn <= 4 && tienda.igualZht <= 2;
  console.log('  ' + (okT ? 'OK ' : 'MAL') + ' los ' + tienda.n + ' nodos con data-tx tienen clave y no quedan huerfanos  (' +
              'sin clave ' + tienda.sinClave.length + ' · huerfanos ' + tienda.huerfanos + ' · vacios en ' + tienda.vacios + ')');
  tienda.sinClave.slice(0, 5).forEach(k => console.log('      <--  ' + k));
  console.log('  ' + (okCambia ? 'OK ' : 'MAL') + ' el texto cambia de verdad al cambiar de idioma  (' +
              'iguales al es: en ' + tienda.igualEn + ' · zht ' + tienda.igualZht + ' de ' + tienda.n + ')');
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
    const orden = [...document.querySelectorAll('.lang-option')].map(codigo);
    const mal = [];
    for (const l of orden) {
      if (!l) continue;
      setLang(l);
      const act = [...document.querySelectorAll('.lang-option')].filter(e => e.classList.contains('active')).map(codigo);
      const tick = [...document.querySelectorAll('.lang-option-check')].filter(e => e.style.display !== 'none').map(e => e.id);
      if (act.length !== 1 || act[0] !== l || tick.length !== 1 || tick[0] !== 'check-' + l)
        mal.push(l + ' -> marcado ' + (act.join(',') || 'ninguno') + ' / tick ' + (tick.join(',') || 'ninguno'));
    }
    setLang('es');
    return { orden, mal, n: orden.filter(Boolean).length };
  });
  console.log('\n=== selector de idioma ===');
  const okSel = sel.mal.length === 0 && sel.n >= 9;
  console.log('  ' + (okSel ? 'OK ' : 'MAL') + ' las ' + sel.n + ' opciones marcan la suya   (' + sel.orden.join(' ') + ')');
  sel.mal.forEach(m => console.log('      <--  ' + m));
  if (!okSel) docMal = 1;

  console.log('\n=== rendimiento ===');
  console.log('  aeropuerto sur: %d lineas · %d capas · %d ms', perf.lineas, perf.capas, perf.ms);
  console.log('\npageerrors: ' + errs.length);
  errs.slice(0, 5).forEach(e => console.log('   ' + e));
  await b.close();
  process.exit((errs.length || docMal) ? 1 : 0);
})();
