#!/usr/bin/env node
/* auditar_cielo.js — el panel «Cielo de Tenerife» (17 de octubre de 2026).
 *
 *     python3 -m http.server 8766 &        (desde la raiz, como auditar.sh)
 *     node tools/auditar_cielo.js 8766 [--fuentes=/tmp/fuentes-cielo]
 *     node tools/auditar_cielo.js                  solo lo que no necesita navegador
 *     node tools/auditar_cielo.js 8766 --solo=6,8  solo esas partes del navegador
 *
 * POR QUE EXISTE. El panel no se carga al arrancar la app: modulos/cielo.js,
 * el motor (vendor/astronomy.browser.min.js) y el catalogo (datos/cielo.json)
 * se piden la primera vez que alguien lo abre. Ninguno de los controles que
 * recorren la app lo abre por su cuenta, y lo que ensena no esta escrito en
 * ningun sitio donde se pueda cotejar a ojo: el eclipse, la hora del maximo
 * de las Geminidas o la noche sin Luna se CALCULAN en el movil. Un calculo
 * mal hecho no da error: da una hora que parece buena. Por eso los calculos
 * se cotejan aqui con lo que publican el IMCCE, la IMO y otros.
 *
 * QUE MIRA
 *   1. el catalogo: el que sale de sus fuentes con commit fijado
 *      (tools/cielo_construir.js --comprobar, si estan bajadas con
 *      tools/cielo_fuentes.sh); si no, que dice venir de esos commits.
 *   2. el observatorio: la misma coordenada en el modulo, en el catalogo, en
 *      tools/cielo_construir.js y en la ficha «observatorio» de places[].
 *   3. los textos: cada fila de CIELO_UI, de las siete del boton (UI_TX) y de
 *      las tablas de nombres, con los diez idiomas, los mismos {marcadores}
 *      en cada forma de plural, tres formas en polaco y una en chino, y el
 *      alfabeto de cada idioma. Que exista cada fila que pide el codigo, y
 *      que no sobre ninguna. Que el catalogo tenga nombre para lo que ensena.
 *   4. la carga perezosa: lo que pide el cargador existe, no va en una
 *      etiqueta de arranque, el motor no usa eval (la CSP no lo deja) y la
 *      nubosidad se pide a un sitio que la CSP permite. El precache y el
 *      «sin red» del service worker los mira tools/auditar_sw.js (9c).
 *   5. los niveles: lo que cualquier guia dice que se ve a simple vista, con
 *      prismaticos o con telescopio, sale asi; y 47 Tucanae, que el PDF de
 *      partida daba como visible, no sale: desde Tenerife no asoma nunca.
 *   6. los calculos, con el motor de la app y en el navegador, contra fuentes
 *      de fuera (cada una con su pagina, abajo).
 *   7. las cinco pestanas en los diez idiomas y en dos moviles: sin
 *      undefined, NaN ni {marcadores} sin rellenar, sin nada que se salga
 *      del panel, sin filas que falten (tx() devuelve '' sin avisar) y sin
 *      errores de pagina. Los filtros del calendario y del catalogo, la luz
 *      roja, la carta del cielo y el cambio de idioma con el panel abierto.
 *      Y que cada ficha del catalogo diga lo que dice datos/cielo.json: una
 *      cifra equivocada no es un texto roto, es un texto perfecto.
 *   8. sin conexion de verdad: con un servidor propio que se apaga despues de
 *      que el service worker haya instalado la app, el panel tiene que abrir.
 *   9. «Apunta al cielo» y la ficha (20 de octubre de 2026): la declinacion
 *      magnetica del WMM2025 contra la tabla de prueba de la NOAA y contra
 *      el calculo de tools/cielo_wmm.js; los sensores, simulados (la
 *      orientacion que la API DeviceOrientation daria apuntando a Jupiter),
 *      tienen que nombrar a Jupiter en el circulo; la busqueda, la flecha y
 *      el «ahi esta»; la camara falsa de Chromium detras del cielo; la ficha
 *      de cada clase de astro en los diez idiomas sin texto roto, con cada
 *      cifra calculada aqui aparte (temperatura de Ballesteros, luminosidad,
 *      distancia, lunas de Jupiter); y Wikipedia, con una respuesta falsa:
 *      el resumen en el idioma del lector por los enlaces entre idiomas, la
 *      licencia y nada que no venga de la API.
 *  10. lo que piden las reseñas de las apps del cielo (21 de octubre de
 *      2026, APPS-DEL-CIELO-COMPETENCIA.md): los retrogrados contra dos
 *      tablas publicadas; las fases contra el motor y contra el eclipse de
 *      Luna del IMCCE; las horas dorada y azul con el Sol a 6, −4 y −6
 *      grados, calculado aparte; el indice de la noche recalculado aparte
 *      en tres noches; el .ics (RFC 5545: CRLF, 75 octetos, UTC, VALARM);
 *      los avisos puestos, ensenados y quitados; la fecha libre; el
 *      recorrido; las capturas (PNG, y la descarga de verdad); la guia; la
 *      precision de iOS en el chip; la comprobacion de la brujula con los
 *      sensores simulados 10 grados desviados (y que la corrige); y que la
 *      Luna llena aclara el cielo mas que la nueva (lunaLuz iba al reves).
 *
 * Sale con 1 si algo falla.
 */
'use strict';
const fs = require('fs'), path = require('path'), { execFileSync, spawn } = require('child_process');
const RAIZ = path.dirname(__dirname);
const args = process.argv.slice(2);
const PUERTO = args.find(a => /^\d+$/.test(a));
const FUENTES = (args.find(a => a.startsWith('--fuentes=')) || '').slice(10) || process.env.FUENTES_CIELO || '/tmp/fuentes-cielo';
/* --solo=6,8: solo esas partes del navegador (para probar a mano; auditar.sh las pasa todas) */
const SOLO = (args.find(a => a.startsWith('--solo=')) || '').slice(7).split(',').filter(Boolean);
const toca = n => !SOLO.length || SOLO.includes(String(n));
const lee = f => fs.readFileSync(path.join(RAIZ, f), 'utf8');
const index = lee('index.html'), modulo = lee('modulos/cielo.js');
const D = JSON.parse(lee('datos/cielo.json'));

let fallos = 0, hechos = 0;
function ok(cond, txt, detalle) {
  hechos++;
  if (cond) console.log('  OK  ' + txt);
  else { fallos++; console.log('  MAL ' + txt + (detalle !== undefined && detalle !== '' ? '   -> ' + detalle : '')); }
  return !!cond;
}
const nota = txt => console.log('  --  ' + txt);
const titulo = txt => console.log('\n=== ' + txt + ' ===');

/* Los idiomas, de SUPPORTED_LANGS: escritos aqui se quedarian viejos el dia
   que entre otro y el control daria verde sin haberlo mirado. */
const IDI = ((index.match(/SUPPORTED_LANGS\s*=\s*\[([^\]]*)\]/) || [, ''])[1])
  .split(',').map(x => x.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
if (!IDI.includes('es')) { console.error('no encuentro SUPPORTED_LANGS en index.html'); process.exit(2); }

/* Un objeto literal entero a partir de su llave, saltando cadenas y
   comentarios (como tablasDelFuente en auditar_web.js). */
function objetoEn(src, i) {
  let d = 0, q = null;
  for (let k = i; k < src.length; k++) {
    const c = src[k];
    if (q) { if (c === '\\') { k++; continue; } if (c === q) q = null; continue; }
    if (c === '/' && src[k + 1] === '/') { k = src.indexOf('\n', k); if (k < 0) return null; continue; }
    if (c === '/' && src[k + 1] === '*') { k = src.indexOf('*/', k) + 1; continue; }
    if (c === '"' || c === "'" || c === '`') { q = c; continue; }
    if (c === '{') d++;
    else if (c === '}') { d--; if (d === 0) return src.slice(i, k + 1); }
  }
  return null;
}
function literal(src, marca) {
  const i = src.indexOf(marca);
  if (i < 0) return null;
  const t = objetoEn(src, src.indexOf('{', i + marca.length - 1));
  try { return t ? eval('(' + t + ')') : null; } catch (e) { return null; }
}
const tablaModulo = n => literal(modulo, 'var ' + n + ' = {');

/* ════════ 1. el catalogo ════════ */
titulo('1. el catalogo (datos/cielo.json)');
{
  const pines = {};
  for (const m of lee('tools/cielo_fuentes.sh').matchAll(/^traer\s+(\w+)\s+\S+\s+([0-9a-f]{40})/gm)) pines[m[1]] = m[2];
  const dice = D.fuentes || {};
  const mismos = Object.keys(pines).length > 0 && Object.keys(pines).every(k => dice[k] === pines[k]) &&
                 Object.keys(dice).every(k => pines[k] === dice[k]);
  ok(mismos, 'dice venir de los commits que fija tools/cielo_fuentes.sh (' + Object.keys(pines).join(', ') + ')',
     JSON.stringify(dice) + ' vs ' + JSON.stringify(pines));
  if (fs.existsSync(path.join(FUENTES, 'astro', 'source', 'js', 'astronomy.js'))) {
    let salida = '', rc = 0;
    try { salida = execFileSync('node', [path.join(RAIZ, 'tools', 'cielo_construir.js'), FUENTES, '--comprobar'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }); }
    catch (e) { rc = e.status || 1; salida = String(e.stdout || '') + String(e.stderr || ''); }
    ok(rc === 0, 'es exactamente el que sale de las fuentes (cielo_construir.js --comprobar)', salida.trim().split('\n').slice(-3).join(' | '));
    const motor = fs.readFileSync(path.join(RAIZ, 'vendor', 'astronomy.browser.min.js'));
    const deLaFuente = fs.readFileSync(path.join(FUENTES, 'astro', 'source', 'js', 'astronomy.browser.min.js'));
    ok(motor.equals(deLaFuente), 'vendor/astronomy.browser.min.js es el del commit fijado, byte a byte');
  } else {
    nota('sin las fuentes en ' + FUENTES + ': no se rehace el catalogo (bash tools/cielo_fuentes.sh ' + FUENTES + ')');
  }
  ok(D.licencia && /CC BY-SA 4\.0/.test(D.licencia), 'lleva su licencia (CC BY-SA 4.0, por HYG y OpenNGC)', D.licencia);
  /* El panel le pone a cada objeto su vector en .v al cargar (preparar()).
     Un dato que se llamara «v» se pisaria sin avisar: el 17 de octubre de
     2026 las 51 estrellas decian «su brillo varia entre...» con las cifras
     del vector, porque la variabilidad de HYG venia en «v». */
  const pisados = [];
  for (const col of ['estrellas', 'objetos', 'dobles', 'variables']) (D[col] || []).forEach(x => { if ('v' in x) pisados.push(col + ' ' + (x.id || x.h)); });
  Object.entries(D.con || {}).forEach(([k, c]) => { if ('v' in c) pisados.push('con ' + k); });
  ok(!pisados.length, 'ningun registro trae un campo «v»: el panel guarda ahi el vector de cada objeto', pisados.slice(0, 5).join(', '));
  /* Lo que entro el 20 de octubre de 2026 para la ficha y «Apunta al cielo» */
  const est8 = D.est.filter(e => e.length !== 8 || (e[5] !== null && !(e[5] > 0)) || (e[7] !== null && typeof e[7] !== 'string'));
  ok(D.est.length > 2000 && !est8.length, 'cada estrella de la carta trae [ra, dec, mag, B−V, HIP, años luz, designacion, tipo espectral] (' + D.est.length + ')', JSON.stringify(est8.slice(0, 2)));
  const conDes = D.est.filter(e => e[6]).length, conSp = D.est.filter(e => e[7]).length;
  ok(conDes > 1800 && conSp > 2600, 'y casi todas con designacion (' + conDes + ') y tipo espectral (' + conSp + ')');
  const iau = D.nombresIAU || {};
  const enCat = new Set(D.estrellas.map(e => e.h));
  const mal = Object.keys(iau).filter(h => enCat.has(+h) || !D.est.some(e => e[4] === +h) || typeof iau[h] !== 'string' || !iau[h]);
  ok(Object.keys(iau).length > 200 && !mal.length, 'nombresIAU: ' + Object.keys(iau).length + ' nombres de la UAI de estrellas de la carta que no estan en el catalogo', mal.slice(0, 5).join(', '));
  ok(D.estrellas.every(e => e.lum === null || e.lum > 0) && D.estrellas.filter(e => e.lum).length >= 45, 'las estrellas con nombre traen su luminosidad en soles (HYG)');
  const sinGen = Object.entries(D.con).filter(([k, c]) => !c.gen).map(([k]) => k);
  ok(!sinGen.length && D.con.Ori.gen === 'Orionis', 'cada constelacion trae su genitivo latino (Ori: «' + D.con.Ori.gen + '»)', sinGen.join(', '));
  /* La declinacion magnetica: el WMM2025, contra la tabla de prueba de la
     NOAA (WMM2025testvalues.pdf) y en Izaña contra el calculo aqui. */
  const W = require(path.join(RAIZ, 'tools', 'cielo_wmm.js'));
  const cof = fs.existsSync(path.join(FUENTES, 'wmm', 'pygeomag', 'wmm', 'WMM_2025.COF')) ? W.leerCOF(fs.readFileSync(path.join(FUENTES, 'wmm', 'pygeomag', 'wmm', 'WMM_2025.COF'), 'utf8')) : null;
  const dec = D.declinacion || {};
  ok(dec.modelo === 'WMM-2025' && Array.isArray(dec.anios) && dec.anios.length === 6 && dec.anios[0][0] === 2025 && dec.anios[5][0] === 2030 &&
     dec.anios.every(a => a[1] < -2 && a[1] > -5) && dec.anios.every((a, i) => !i || a[1] > dec.anios[i - 1][1]),
     'la declinacion magnetica en Izaña: WMM-2025, de 2025 a 2030, unos ' + (dec.anios ? dec.anios[0][1] : '?') + '° (oeste) y acercandose a cero', JSON.stringify(dec));
  if (cof) {
    const malNOAA = W.comprobar(cof);
    ok(!malNOAA.length, 'tools/cielo_wmm.js da los ' + W.PRUEBAS_NOAA.length + ' valores de prueba de la NOAA a 0,01° y 0,1 nT', malNOAA.slice(0, 2).join(' · '));
    const d26 = W.campo(cof, D.obs.lat, D.obs.lon, D.obs.h / 1000, 2026).D;
    ok(Math.abs(d26 - dec.anios[1][1]) < 0.002, 'y en Izaña a 1-1-2026 lo mismo que el catalogo (' + d26.toFixed(3) + '°)');
  } else nota('sin ' + FUENTES + '/wmm: la tabla de la NOAA se pasa al rehacer el catalogo (cielo_construir.js)');
}

/* ════════ 2. el observatorio ════════ */
titulo('2. el observador: el Observatorio del Teide, el mismo en los cuatro sitios');
{
  const num = m => m ? m.slice(1, 4).map(Number) : null;
  const enModulo = num(modulo.match(/var OBS = \{ lat: ([\d.-]+), lon: ([\d.-]+), h: (\d+) \}/));
  const enConstruir = num(lee('tools/cielo_construir.js').match(/const OBS = \{ lat: ([\d.-]+), lon: ([\d.-]+), h: (\d+) \}/));
  const enDatos = D.obs ? [D.obs.lat, D.obs.lon, D.obs.h] : null;
  const ficha = index.match(/id:"observatorio"[^\n]*?lat:([\d.-]+), lng:([\d.-]+)/);
  const enFicha = ficha ? [Number(ficha[1]), Number(ficha[2])] : null;
  const igual = (a, b) => a && b && a.every((x, i) => x === b[i]);
  ok(enModulo && igual(enModulo, enConstruir) && igual(enModulo, enDatos), 'modulos/cielo.js, tools/cielo_construir.js y datos/cielo.json',
     JSON.stringify({ modulo: enModulo, construir: enConstruir, datos: enDatos }));
  ok(enFicha && enModulo && enFicha[0] === enModulo[0] && enFicha[1] === enModulo[1], 'y la ficha «observatorio» de places[]', JSON.stringify(enFicha));
}

/* ════════ 3. los textos ════════ */
titulo('3. los textos, en los ' + IDI.length + ' idiomas');
const CIELO_UI = tablaModulo('CIELO_UI') || {};
const INI = '/* ── CIELO DE TENERIFE: textos ── */', FIN = '/* ── fin CIELO DE TENERIFE: textos ── */';
const bloqueTx = index.includes(INI) ? index.slice(index.indexOf(INI), index.indexOf(FIN)) : '';
const CASCARA = literal(bloqueTx, 'Object.assign(UI_TX, {') || {};
const INI_M = '<!-- ══ CIELO DE TENERIFE ══ -->', FIN_M = '<!-- ══ fin CIELO DE TENERIFE ══ -->';
const cascaraSrc = index.includes(INI_M) ? index.slice(index.indexOf(INI_M), index.indexOf(FIN_M)) : '';
const TABLAS = ['CIELO_CON', 'CIELO_EST', 'CIELO_DOB', 'CIELO_CUERPO', 'CIELO_LLU', 'CIELO_TIPO', 'CIELO_OBJ', 'CIELO_DESC'];
const T = {}; TABLAS.forEach(n => { T[n] = tablaModulo(n) || {}; });
const tour = {};
for (const k of ['tourCieloT', 'tourCieloP']) tour[k] = literal(index, '"' + k + '": {');
{
  ok(Object.keys(CIELO_UI).length > 200, 'CIELO_UI se lee de modulos/cielo.js', Object.keys(CIELO_UI).length + ' filas');
  ok(Object.keys(CASCARA).length === 7, 'las siete filas del boton y del «cargando» estan en index.html', Object.keys(CASCARA).join(', '));
  const HAN = /[㐀-鿿]/, CIR = /[Ѐ-ӿ]/;
  const marcas = s => (s.match(/\{[a-z]+\}/g) || []).sort().join(',');
  const mal = [];
  function revisar(donde, f) {
    if (!f || typeof f.es !== 'string') { mal.push(donde + ': sin castellano'); return; }
    const m0 = marcas(f.es.split('|')[0]);
    for (const l of IDI) {
      const v = f[l];
      if (typeof v !== 'string' || !v.trim()) { mal.push(donde + '.' + l + ': falta'); continue; }
      if (v !== v.trim()) mal.push(donde + '.' + l + ': espacio al borde');
      if (/[  ]{2}/.test(v)) mal.push(donde + '.' + l + ': espacio doble');
      if (v.includes('"')) mal.push(donde + '.' + l + ': comilla doble ASCII (van «» o “”)');
      const formas = v.split('|');
      if (formas.length > 1 && !v.includes('{n}')) mal.push(donde + '.' + l + ': «|» sin {n}: tx() no partiria las formas');
      formas.forEach(x => { if (marcas(x) !== m0) mal.push(donde + '.' + l + ': {marcadores} ' + (marcas(x) || '(ninguno)') + ' y no ' + (m0 || '(ninguno)')); });
      if (l === 'pl' && f.es.includes('|') && formas.length !== 3) mal.push(donde + '.pl: el plural polaco pide tres formas');
      if ((l === 'zh' || l === 'zht') && formas.length !== 1) mal.push(donde + '.' + l + ': el chino no tiene plural');
      if (l === 'zh' || l === 'zht') {
        if (!HAN.test(v)) mal.push(donde + '.' + l + ': sin un solo hanzi');
        if (/[㐀-鿿][,:;!?]/.test(v) || /\([㐀-鿿]/.test(v) || /[㐀-鿿]\)/.test(v)) mal.push(donde + '.' + l + ': signo latino junto a un hanzi');
        if (CIR.test(v)) mal.push(donde + '.' + l + ': cirilico');
      } else if (l === 'bg') {
        if (!CIR.test(v)) mal.push(donde + '.bg: sin cirilico');
        if (HAN.test(v)) mal.push(donde + '.bg: hanzi');
        if (/[Ѐ-ӿ][A-Za-z]|[A-Za-z][Ѐ-ӿ]/.test(v)) mal.push(donde + '.bg: letra latina pegada a una cirilica (o/о, a/а...): ' + v.slice(0, 40));
        if (/[̀́]/.test(v)) mal.push(donde + '.bg: acento de pronunciacion');
      } else if (HAN.test(v) || CIR.test(v)) mal.push(donde + '.' + l + ': alfabeto de otro idioma');
    }
  }
  for (const [k, f] of Object.entries(CIELO_UI)) revisar(k, f);
  for (const [k, f] of Object.entries(CASCARA)) revisar(k, f);
  for (const [k, f] of Object.entries(tour)) revisar(k, f);
  for (const n of TABLAS) for (const [k, f] of Object.entries(T[n])) revisar(n + '.' + k, f);
  const nFilas = Object.keys(CIELO_UI).length + Object.keys(CASCARA).length + 2 + TABLAS.reduce((a, n) => a + Object.keys(T[n]).length, 0);
  ok(!mal.length, nFilas + ' filas: diez idiomas, {marcadores} por forma de plural, alfabeto de cada uno', mal.slice(0, 8).join(' · ') + (mal.length > 8 ? ' · y ' + (mal.length - 8) + ' mas' : ''));
  ok(tour.tourCieloT && tour.tourCieloP && /\{ sel: '#cielo-btn',[^}]*k: 'tourCielo'/.test(index), 'el tour tiene su paso (#cielo-btn) y sus dos filas');

  /* Las filas que pide el codigo. T('Clave') es tx('cieloClave'), y tx()
     devuelve '' si no hay fila, sin avisar: el texto desaparece. Las que se
     arman en tiempo de ejecucion van por familias, con sus sufijos tal y como
     estan en el codigo (RUMBOS, FASES...); las de una lista ('EvElongTarde',
     'SitioUcanca'...) se ven como cadenas sueltas del codigo. */
  const filas = new Set(Object.keys(CIELO_UI).concat(Object.keys(CASCARA)).map(k => k.replace(/^cielo/, '')));
  const pedidas = new Set([...modulo.matchAll(/\bT\('([A-Za-z0-9]+)'\s*[,)]/g)].map(m => m[1]));
  for (const m of (cascaraSrc + modulo).matchAll(/\btx\('cielo([A-Za-z0-9]+)'/g)) pedidas.add(m[1]);
  for (const m of cascaraSrc.matchAll(/data-tx(?:-aria|-title)?="cielo([A-Za-z0-9]+)"/g)) pedidas.add(m[1]);
  const arr = n => { const m = modulo.match(new RegExp('var ' + n + ' = \\[([^\\]]*)\\]')); return m ? [...m[1].matchAll(/'([^']+)'/g)].map(x => x[1]) : null; };
  const FAMILIAS = {
    Rumbo: arr('RUMBOS'), Hacia: arr('RUMBOS'), Fase: arr('FASES'),
    Pes: [...((modulo.match(/var PESTANAS = \[([^;]*)\];/) || [, ''])[1]).matchAll(/\['(\w+)'/g)].map(x => x[1][0].toUpperCase() + x[1].slice(1)),
    Cond: ['Buenas', 'Regulares', 'Malas'],
    Var: ['EA', 'EB', 'DCEP', 'M', 'SR', 'GCAS', 'RCB', 'RV', 'NR', 'Otra'],
    EvEclipseSol: ['Total', 'Anular', 'Hibrido', 'Parcial'],
    EvEclipseLuna: ['Total', 'Parcial', 'Penumbral'],
    /* la ficha: el color por letra espectral (claseMK: /[OBAFGKM]/) y la
       clase de luminosidad (I a V; VI se queda sin nombre) */
    Color: ['O', 'B', 'A', 'F', 'G', 'K', 'M'],
    Lum: ['I', 'II', 'III', 'IV', 'V'],
    /* el indice de la noche (21 de octubre): la palabra, de indiceNoche() */
    Indice: [...(modulo.match(/valor >= 9 \? '(\w+)' : valor >= 7 \? '(\w+)' : valor >= 5 \? '(\w+)' : valor >= 3 \? '(\w+)' : '(\w+)'/) || []).slice(1)]
  };
  ok(Object.values(FAMILIAS).every(v => v && v.length) && FAMILIAS.Indice.length === 5, 'las familias se leen del codigo (RUMBOS, FASES, PESTANAS, las palabras del indice)');
  /* y si manana el codigo arma otra (T('Algo' + x)), que no pase sin mirar */
  const prefijos = [...new Set([...modulo.matchAll(/\bT\('([A-Za-z0-9]+)'\s*\+/g)].map(m => m[1]))];
  const sinFamilia = prefijos.filter(x => !FAMILIAS[x]);
  ok(!sinFamilia.length, 'cada T(\'Prefijo\' + ...) del codigo tiene su familia aqui (' + prefijos.join(', ') + ')', sinFamilia.join(', '));
  for (const [pre, sufs] of Object.entries(FAMILIAS)) (sufs || []).forEach(s => pedidas.add(pre + s));
  const sueltas = new Set([...modulo.matchAll(/'([A-Z][A-Za-z0-9]*)'/g)].map(m => m[1]).filter(s => filas.has(s)));
  for (const s of [...sueltas]) if (/^Sitio[A-Z]/.test(s) && !s.endsWith('Txt')) pedidas.add(s + 'Txt');   // T(s[1] + 'Txt')
  const faltan = [...pedidas].filter(k => !filas.has(k));
  ok(!faltan.length, 'cada fila que pide el codigo existe (' + pedidas.size + ' pedidas)', faltan.map(k => 'cielo' + k).join(', '));
  const sobran = [...filas].filter(k => !pedidas.has(k) && !sueltas.has(k));
  ok(!sobran.length, 'y no sobra ninguna que nadie pida', sobran.map(k => 'cielo' + k).join(', '));

  /* Lo que el catalogo ensena, con nombre en los diez */
  const m = [];
  for (const c of Object.keys(D.con)) if (!T.CIELO_CON[c]) m.push('constelacion ' + c);
  for (const c of Object.keys(T.CIELO_CON)) if (!D.con[c]) m.push('CIELO_CON.' + c + ' no esta en el catalogo');
  for (const e of D.estrellas) if (!T.CIELO_EST[String(e.h)]) m.push('estrella ' + e.h + ' ' + e.n);
  const ids = new Set(D.objetos.map(o => o.id)), dob = new Set(D.dobles.map(d => d.id)), llu = new Set(D.lluvias.map(l => l.id));
  for (const l of llu) if (!T.CIELO_LLU[l]) m.push('lluvia ' + l);
  for (const k of Object.keys(T.CIELO_LLU)) if (!llu.has(k)) m.push('CIELO_LLU.' + k + ' no esta en el catalogo');
  for (const t of new Set(D.objetos.map(o => o.t))) if (!T.CIELO_TIPO[t]) m.push('tipo ' + t);
  for (const k of Object.keys(T.CIELO_OBJ)) if (!ids.has(k)) m.push('CIELO_OBJ.' + k + ' no esta en el catalogo');
  for (const k of Object.keys(T.CIELO_DOB)) if (!dob.has(k)) m.push('CIELO_DOB.' + k + ' no esta en el catalogo');
  for (const k of Object.keys(T.CIELO_DESC))
    if (!(ids.has(k) || (k.startsWith('d-') && dob.has(k.slice(2))) || (/^h\d+$/.test(k) && D.estrellas.some(e => 'h' + e.h === k)))) m.push('CIELO_DESC.' + k + ' sin objeto');
  const cuerpos = ['Sun', 'Moon'].concat(arr('PLANETAS') || []);
  for (const c of cuerpos) if (!T.CIELO_CUERPO[c]) m.push('cuerpo ' + c);
  for (const l of ['Io', 'Europa', 'Ganymede', 'Callisto']) if (!T.CIELO_CUERPO[l]) m.push('luna de Jupiter ' + l);
  ok(!m.length, 'el catalogo tiene nombre para todo lo que ensena: ' + Object.keys(D.con).length + ' constelaciones, ' + D.estrellas.length +
     ' estrellas, ' + llu.size + ' lluvias, ' + Object.keys(T.CIELO_TIPO).length + ' tipos, ' + cuerpos.length + ' cuerpos', m.slice(0, 8).join(' · '));
}

/* ════════ 4. la carga perezosa ════════ */
titulo('4. la carga perezosa y lo que pide el navegador');
{
  const decl = [...index.matchAll(/CARGA-PEREZOSA:\s*([\w./-]+\.js)/g)].map(m => m[1]);
  ok(decl.length === 1 && decl[0] === 'modulos/cielo.js', 'index.html declara CARGA-PEREZOSA: modulos/cielo.js (tools/fuente.js lo pega al fuente)', decl.join(', '));
  ok(/var MODULO = '\.\/modulos\/cielo\.js'/.test(cascaraSrc), 'el cargador pide ese mismo fichero');
  ok(!/<script[^>]+src=["'](?:\.\/)?modulos\/cielo\.js/.test(index), 'y no va en una etiqueta de arranque: si fuera, la carga perezosa no serviria de nada');
  let sintaxis = true; try { execFileSync('node', ['--check', path.join(RAIZ, 'modulos', 'cielo.js')], { stdio: 'pipe' }); } catch (e) { sintaxis = String(e.stderr || e).slice(0, 200); }
  ok(sintaxis === true, 'modulos/cielo.js es JavaScript valido', sintaxis);
  ok(!/<\/script/i.test(modulo), 'modulos/cielo.js no trae «</script» (tools/fuente.js lo pega en linea)');
  for (const f of ['vendor/astronomy.browser.min.js', 'datos/cielo.json'])
    ok(modulo.includes("'./" + f + "'") && fs.existsSync(path.join(RAIZ, f)), 'el panel pide ./' + f + ' y existe');
  const motor = lee('vendor/astronomy.browser.min.js');
  ok(!/\beval\s*\(|new Function\s*\(|\bFunction\s*\(\s*['"]/.test(motor), 'el motor no usa eval ni new Function: la CSP no lleva unsafe-eval');
  const lic = fs.existsSync(path.join(RAIZ, 'vendor', 'LICENSE-astronomy.txt')) ? lee('vendor/LICENSE-astronomy.txt') : '';
  ok(/MIT License/.test(lic) && /Don Cross/.test(lic), 'vendor/LICENSE-astronomy.txt: la licencia MIT del motor, con su autor');
  const csp = (index.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/) || [, ''])[1];
  const conecta = (csp.match(/connect-src ([^;]+)/) || [, ''])[1].split(/\s+/);
  /* lo que se PIDE (fetch), no los enlaces que se ensenan para abrir fuera */
  const hosts = [...modulo.matchAll(/(?:fetch\(\s*|var url = )'https:\/\/([a-z0-9.-]+)\//g)].map(m => m[1]);
  const fetchs = [...modulo.matchAll(/\bfetch\(\s*([^)]{0,60})/g)].map(m => m[1].trim());
  ok(hosts.length > 0 && hosts.every(h => conecta.includes('https://' + h)), 'lo que el panel pide fuera (' + [...new Set(hosts)].join(', ') + ') esta en el connect-src de la CSP', conecta.join(' '));
  ok(fetchs.every(x => /^'\.\/datos\/cielo\.json'|^url\b/.test(x)), 'y no pide nada mas: el catalogo, la nubosidad y Wikipedia (fetch: ' + fetchs.join(' · ') + ')');
  /* Wikipedia (20 de octubre de 2026): la ficha pide el resumen a
     <idioma>.wikipedia.org y los enlaces entre idiomas a en.wikipedia.org;
     la foto viene de upload.wikimedia.org (img-src https:). */
  const imgs = (csp.match(/img-src ([^;]+)/) || [, ''])[1].split(/\s+/);
  ok(modulo.includes(".wikipedia.org/api/rest_v1/page/summary/") && modulo.includes("en.wikipedia.org/w/api.php?action=query") &&
     conecta.includes('https://*.wikipedia.org') && imgs.includes('https:'), 'Wikipedia: el resumen y los enlaces entre idiomas van a *.wikipedia.org (connect-src) y la foto por img-src https:');
  ok(/origin=\*/.test(modulo) && /seguraWiki\(/.test(modulo) && !/innerHTML/.test(modulo), 'la API se pide con origin=* (CORS), cada URL pasa por seguraWiki() y el modulo no usa innerHTML');
  /* la camara y los sensores: Permissions-Policy los deja para el propio origen */
  const pp = (index.match(/http-equiv="Permissions-Policy" content="([^"]+)"/) || [, ''])[1];
  ok(/camera=\(self\)/.test(pp) && /accelerometer=\(self\)/.test(pp) && /gyroscope=\(self\)/.test(pp) && /magnetometer=\(self\)/.test(pp) && /microphone=\(\)/.test(pp),
     'Permissions-Policy: camera, accelerometer, gyroscope y magnetometer en (self); el microfono sigue en ()', pp);
  ok(/getUserMedia\(\{ video: \{ facingMode/.test(modulo) && !/audio: true/.test(modulo), 'la camara se pide sin audio y la de atras (facingMode environment)');
  const priv = JSON.parse(lee('idiomas/privacidad/es.json'));
  ok(/Apunta al cielo/.test(priv.ppDatosSensoresTxt || '') && /Apunta al cielo/.test(priv.ppDatosCamaraTxt || '') && /astro/.test(priv.ppTercWiki || ''),
     'la politica de privacidad habla de los sensores, de la camara y del resumen de Wikipedia del astro');
  /* 21 de octubre: los avisos, los .ics y las capturas, en los diez idiomas */
  const sinIcs = IDI.filter(L => { const j = JSON.parse(lee('idiomas/privacidad/' + L + '.json')); return !/\.ics/.test(j.ppDatosPrefTxt || '') || !/📸/.test(j.ppDatosCamaraTxt || ''); });
  ok(!sinIcs.length, 'y de los avisos, los .ics y la captura 📸, en los ' + IDI.length + ' idiomas', sinIcs.join(', '));
  ok(/lunaLuz = luna\.alt > -2 \? \(1 \+ Math\.cos\(luna\.fase \* RAD\)\) \/ 2/.test(modulo),
     'la luz de la Luna en la carta es (1 + cos fase) / 2: 0 con Luna nueva y 1 con llena (el 20 de octubre iba al reves)');
  ok(/function nocheDeHoy\(\) \{ var ahora = new Date\(\); return partes\(ahora\)\.hour < 7/.test(modulo),
     '«esta noche» cambia a la noche que viene a las 7 de la manana, no a mediodia');
  ok(/t0 = A\.MakeTime\(instanteLocal\(n\.fecha, 12, 0\)\)/.test(modulo) && /SearchAltitude\(S_, o, -1, t0, 1, 6\)/.test(modulo) && /SearchAltitude\(S_, o, -1, t0, 1, -4\)/.test(modulo),
     'las horas para fotos buscan el Sol a 6° y a −4° con el motor (hora dorada y azul, definicion de PhotoPills)');
}

/* ════════ 5. los niveles ════════ */
titulo('5. el instrumento de cada objeto, contra lo que dice cualquier guia');
{
  const o = id => D.objetos.find(x => x.id === id) || {};
  const d = id => D.dobles.find(x => x.id === id) || {};
  const esperado = [
    ['M31', 1, 'galaxia de Andromeda'], ['M42', 1, 'nebulosa de Orion'], ['M45', 1, 'Pleyades'], ['M44', 1, 'el Pesebre'],
    ['C14', 1, 'doble cumulo de Perseo'], ['M13', 2, 'cumulo de Hercules'], ['M57', 3, 'nebulosa del Anillo'], ['M1', 3, 'nebulosa del Cangrejo']];
  const mal = esperado.filter(([id, n]) => o(id).niv !== n).map(([id, n, nom]) => id + ' (' + nom + ') sale ' + o(id).niv + ' y no ' + n);
  ok(!mal.length, 'a simple vista M31, M42, M45, M44 y C14; con prismaticos M13; con telescopio M57 y M1', mal.join(' · '));
  ok(d('mizar-alcor').niv === 1 && d('albireo').niv === 2 && d('mizar').niv === 3,
     'Mizar y Alcor a simple vista, Albireo con prismaticos, Mizar A y B con telescopio',
     JSON.stringify(['mizar-alcor', 'albireo', 'mizar'].map(k => d(k).niv)));
  const tuc = o('C106');
  ok(tuc.id && tuc.niv === null && tuc.alt < 0, '47 Tucanae (C106) no sale en el catalogo: desde Izaña no asoma nunca (altura maxima ' + tuc.alt + '°)');
}

if (!PUERTO) {
  nota('sin puerto: se salta todo lo que va en el navegador (6, 7 y 8)');
  fin();
} else {
  navegador().then(fin, e => { fallos++; console.log('  MAL el navegador no termino   -> ' + (e && e.stack || e)); fin(); });
}

function fin() {
  console.log('\n  ' + (fallos ? fallos + ' MAL de ' + hechos : hechos + ' controles, todos en verde') + '\n');
  process.exit(fallos ? 1 : 0);
}

/* ════════ 6, 7 y 8: en el navegador ════════ */
async function navegador() {
  const { chromium } = require('/opt/node22/lib/node_modules/playwright');
  /* la camara falsa de Chromium: un video de prueba, sin pedir permiso, para la parte 9 */
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-proxy-server', '--no-sandbox', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
  try {
    if (toca(6)) await calculos(b);
    if (toca(7)) await pantallas(b);
    if (toca(8)) await sinConexion(b);
    if (toca(9)) await apunta(b);
    if (toca(10)) await quejas(b);
  } finally { await b.close(); }
}

/* La app abierta y el panel cargado. La bienvenida se pasa como lo hace
   barrido_pantallas.js; las nubes (Open-Meteo) no se piden: sin red de
   fuera, la tarjeta no sale, que es lo que tiene que pasar. */
async function abrirApp(b, ancho, alto, puerto, sw, opc) {
  const ctx = await b.newContext(Object.assign({ viewport: { width: ancho, height: alto }, serviceWorkers: sw ? 'allow' : 'block' }, opc || {}));
  const p = await ctx.newPage();
  const err = [];
  p.on('pageerror', e => err.push(e.message));
  await p.addInitScript(() => { try { localStorage.setItem('tenerife.tour.seen', '99'); localStorage.setItem('tgo_consent', JSON.stringify({ v: 'denied', t: Date.now() })); } catch (e) {} });
  if (!sw) await p.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => r.abort());
  await p.goto('http://127.0.0.1:' + (puerto || PUERTO) + '/index.html', { waitUntil: 'load', timeout: 60000 });
  await p.waitForTimeout(800);
  if (await p.$('.v19-w-lang[data-lang="es"]')) { await p.click('.v19-w-lang[data-lang="es"]'); await p.waitForTimeout(200); await p.click('#v19-welcome-start'); }
  await p.waitForTimeout(1500);
  return { ctx, p, err };
}

/* ── 6. los calculos, contra fuentes de fuera ─────────────────────────────
   Con el motor que lleva la app (vendor/) y con el calendario del panel tal
   cual (TG_CIELO.eventos desde un dia fijo, para que no dependa de hoy).
     · eclipse de Sol del 2 de agosto de 2027 en Güímar, snowy.es: 78,72 %,
       primer contacto 09:32:53, maximo 10:33:40 y ultimo 11:41:36 en hora
       peninsular (CEST, UTC+2), el Sol a 26,0°. Se calcula en la coordenada
       de la ficha «ciudad-guimar»: snowy.es no publica la suya.
       https://snowy.es/eclipse-2027/guimar
       El panel lo calcula en Izaña, a unos 10 km: ahi el margen es mayor.
     · eclipse total de Luna del 31 de diciembre de 2028, IMCCE: P1 14:03:54,
       U1 15:07:41, U2 16:16:25, maximo 16:52:06, U3 17:27:49, U4 18:36:34,
       P4 19:40:12 (UTC). En Izaña la Luna sale ya eclipsada, a las 18:21.
       https://promenade.imcce.fr/fr/images/pdf/elu-31dec2028.pdf
     · Geminidas de 2026: maximo el 14 de diciembre hacia las 14:00 UTC (IMO,
       citado por Star Walk). https://starwalk.space/en/news/66D7B9E5-6774-F3A1-8478-732832D52E24
     · Cuadrantidas de 2027: el 4 de enero hacia las 3:30 UTC (Star Walk).
       https://starwalk.space/en/news/20056067-5690-9270-BC92-E3218DE7E486
     · Marte y Jupiter, 16 de noviembre de 2026: a 1,193°, en Leo (Sky Tonight).
       https://sky-tonight.com/object/close-approach/Mars-Jupiter-2026-11-16 */
async function calculos(b) {
  titulo('6. los calculos, contra el IMCCE, la IMO, snowy.es y Sky Tonight');
  const { ctx, p, err } = await abrirApp(b, 390, 844);
  const r = await p.evaluate(async () => {
    await window.TG_CIELO_CARGAR(); await TG_CIELO.cargar();
    const A = Astronomy, iso = d => d ? new Date(d).toISOString() : null;
    const g = places.find(x => x.id === 'ciudad-guimar');
    const eg = A.SearchLocalSolarEclipse(new Date('2027-07-01T00:00:00Z'), new A.Observer(g.lat, g.lng, 0));
    const ev27 = TG_CIELO.eventos('2027-01-01');
    const sol = ev27.find(e => e.tipo === 'eclipseSol' && iso(e.t).startsWith('2027-08-02'));
    const ev28 = TG_CIELO.eventos('2028-06-01');
    const luna = ev28.find(e => e.tipo === 'eclipseLuna' && iso(e.t).startsWith('2028-12-31'));
    const ev26 = TG_CIELO.eventos('2026-10-17');
    const gem = ev26.find(e => e.tipo === 'lluvia' && e.l.id === 'GEM');
    const qua = ev26.find(e => e.tipo === 'lluvia' && e.l.id === 'QUA');
    const mj = ev26.find(e => e.tipo === 'conjuncion' && e.a === 'Mars' && e.b === 'Jupiter');
    const mjCon = mj ? A.Constellation(A.Equator(A.Body.Mars, A.MakeTime(mj.t), new A.Observer(28.2987, -16.5106, 2390), false, true).ra,
                                       A.Equator(A.Body.Mars, A.MakeTime(mj.t), new A.Observer(28.2987, -16.5106, 2390), false, true).dec).symbol : null;
    return {
      guimar: { obsc: eg.obscuration, c1: iso(eg.partial_begin.time.date), max: iso(eg.peak.time.date), c4: iso(eg.partial_end.time.date), alt: eg.peak.altitude, kind: eg.kind },
      sol: sol ? { obsc: sol.obsc, c1: iso(sol.ini.time.date), max: iso(sol.pico.time.date), c4: iso(sol.fin.time.date), alt: sol.pico.altitude, global: sol.global } : null,
      luna: luna ? { kind: luna.kind, p1: iso(luna.p1), u1: iso(luna.u1), u2: iso(luna.u2), max: iso(luna.t), u3: iso(luna.u3), u4: iso(luna.u4), p4: iso(luna.p4), salePone: luna.salePone, entero: luna.entero } : null,
      gem: gem ? iso(gem.t) : null, qua: qua ? iso(qua.t) : null,
      mj: mj ? { t: iso(mj.t), sep: mj.sep, con: mjCon } : null
    };
  });
  const seg = (a, bb) => Math.abs(new Date(a) - new Date(bb)) / 1000;
  const fuera = (pares, tol) => pares.filter(([n, a, bb]) => !a || seg(a, bb) > tol).map(([n, a, bb]) => n + ' ' + (a ? Math.round((new Date(a) - new Date(bb)) / 1000) + ' s' : 'no sale'));
  const SNOWY = { obsc: 78.72, c1: '2027-08-02T07:32:53Z', max: '2027-08-02T08:33:40Z', c4: '2027-08-02T09:41:36Z', alt: 26.0 };
  const g = r.guimar;
  let f = fuera([['C1', g.c1, SNOWY.c1], ['maximo', g.max, SNOWY.max], ['C4', g.c4, SNOWY.c4]], 30);
  ok(!f.length && Math.abs(g.obsc * 100 - SNOWY.obsc) <= 0.5 && Math.abs(g.alt - SNOWY.alt) <= 0.3,
     'eclipse de Sol 2027 en Güímar: ' + (g.obsc * 100).toFixed(2) + ' % (snowy.es 78,72), contactos a ±30 s, Sol a ' + g.alt.toFixed(1) + '°',
     f.join(' · ') + ' ' + JSON.stringify(g));
  if (ok(r.sol, 'el calendario del panel trae el eclipse de Sol del 2 de agosto de 2027')) {
    f = fuera([['C1', r.sol.c1, SNOWY.c1], ['maximo', r.sol.max, SNOWY.max], ['C4', r.sol.c4, SNOWY.c4]], 60);
    ok(!f.length && Math.abs(r.sol.obsc * 100 - SNOWY.obsc) <= 1 && Math.abs(r.sol.alt - SNOWY.alt) <= 1 && r.sol.global === 'total',
       '  desde Izaña: ' + (r.sol.obsc * 100).toFixed(1) + ' %, contactos a ±60 s de los de Güímar, total en la franja (global «' + r.sol.global + '»)',
       f.join(' · ') + ' ' + JSON.stringify(r.sol));
  }
  const IMCCE = { p1: '2028-12-31T14:03:54Z', u1: '2028-12-31T15:07:41Z', u2: '2028-12-31T16:16:25Z', max: '2028-12-31T16:52:06Z',
                  u3: '2028-12-31T17:27:49Z', u4: '2028-12-31T18:36:34Z', p4: '2028-12-31T19:40:12Z' };
  if (ok(r.luna, 'el calendario trae el eclipse total de Luna del 31 de diciembre de 2028 (en Izaña la Luna sale eclipsada)')) {
    f = fuera(Object.keys(IMCCE).map(k => [k.toUpperCase(), r.luna[k], IMCCE[k]]), 90);
    ok(!f.length && r.luna.kind === 'total' && r.luna.salePone === 'Sale' && r.luna.entero === false,
       '  sus siete contactos a ±90 s de los del IMCCE, total, y «sale ya eclipsada»', f.join(' · ') + ' ' + JSON.stringify(r.luna));
  }
  ok(r.gem && seg(r.gem, '2026-12-14T14:00:00Z') <= 3600, 'Geminidas 2026: maximo a menos de una hora del de la IMO (14 dic., 14:00 UTC)', r.gem);
  ok(r.qua && seg(r.qua, '2027-01-04T03:30:00Z') <= 3600, 'Cuadrantidas 2027: a menos de una hora del de Star Walk (4 ene., 3:30 UTC)', r.qua);
  ok(r.mj && Math.abs(r.mj.sep - 1.193) <= 0.02 && seg(r.mj.t, '2026-11-16T02:00:00Z') <= 86400 && r.mj.con === 'Leo',
     'Marte y Jupiter: ' + (r.mj ? r.mj.sep.toFixed(3) : '?') + '° en ' + (r.mj && r.mj.con) + ' (Sky Tonight: 1,193°, en Leo, 16 nov. 2026)', JSON.stringify(r.mj));
  ok(!err.length, 'sin errores de pagina', err.slice(0, 3).join(' · '));
  await ctx.close();
}

/* ── 7. las cinco pestanas, en los diez idiomas y en dos moviles ──────────
   La noche fija es la del 13 de diciembre de 2026, la de las Geminidas.
   Lo que va oculto hasta tocarlo (el detalle de cada objeto) se abre antes
   de mirar, para que tambien cuente. */
async function pantallas(b) {
  titulo('7. las cinco pestanas, en los ' + IDI.length + ' idiomas, a 320 y a 390 px');
  const problemas = [], errores = [];
  let vistas = 0;
  for (const [ancho, alto] of [[390, 844], [320, 568]]) {
    const { ctx, p, err } = await abrirApp(b, ancho, alto);
    await p.evaluate(async () => {
      window.__faltan = new Set();
      const tx0 = window.tx;
      window.tx = function (k, v) { const r = tx0.apply(this, arguments); if (/^cielo/.test(k) && !r) window.__faltan.add(k); return r; };
      await window.TG_CIELO_CARGAR(); await TG_CIELO.cargar();
      /* lo que se mira en cada vista: textos rotos, botones vacios y lo que se sale */
      window.__mira = () => {
        const panel = document.getElementById('cielo-panel'), cuerpo = document.getElementById('cielo-cuerpo');
        panel.querySelectorAll('.cielo-item').forEach(i => i.classList.add('abierto'));
        const txt = panel.innerText, out = [];
        const roto = txt.match(/undefined|NaN|\[object Object\]|\{[a-z]+\}/g);
        if (roto) out.push('texto roto: ' + [...new Set(roto)].join(', '));
        if (!txt.trim()) out.push('panel vacio');
        const caja = panel.getBoundingClientRect();
        if (caja.right > innerWidth + 1 || caja.left < -1) out.push('el panel se sale de la pantalla (' + Math.round(caja.left) + '..' + Math.round(caja.right) + ' de ' + innerWidth + ')');
        if (cuerpo.scrollWidth > cuerpo.clientWidth + 1) out.push('el contenido es mas ancho que el panel (' + cuerpo.scrollWidth + ' > ' + cuerpo.clientWidth + ')');
        for (const e of panel.querySelectorAll('button')) {
          const vis = e.checkVisibility ? e.checkVisibility() : !!e.offsetParent;
          if (!vis) continue;
          if (!e.textContent.trim() && !e.querySelector('svg,img') && !e.getAttribute('aria-label')) out.push('boton vacio');
          if (e.scrollWidth > e.clientWidth + 1 && e.closest('#cielo-pestanas')) out.push('pestana cortada: «' + e.textContent.trim() + '»');
        }
        panel.querySelectorAll('.cielo-item').forEach(i => i.classList.remove('abierto'));
        return out;
      };
    });
    for (const L of IDI) {
      const r = await p.evaluate(async L => {
        setLang(L);
        const out = [];
        const vista = async (nombre, antes) => {
          try { if (antes) await antes(); } catch (e) { out.push([nombre, 'error: ' + e.message]); return; }
          await new Promise(r => setTimeout(r, nombre.startsWith('mapa') ? 500 : 60));
          n++;
          __mira().forEach(x => out.push([nombre, x]));
        };
        const S = TG_CIELO.estado;
        let n = 0;
        for (const t of ['noche', 'calendario', 'catalogo', 'mapa', 'donde']) await vista(t, () => TG_CIELO.ver(t, '2026-12-13'));
        /* los filtros, pulsando los botones de verdad */
        await TG_CIELO.ver('calendario', '2026-12-13');
        const chipsCal = [...document.querySelectorAll('#cielo-cuerpo .cielo-chips')[0].querySelectorAll('button')].map(x => x.textContent);
        for (let i = 0; i < chipsCal.length; i++) await vista('calendario: ' + chipsCal[i], async () => { document.querySelectorAll('#cielo-cuerpo .cielo-chips')[0].querySelectorAll('button')[i].click(); });
        S.cal = 'todo';
        await TG_CIELO.ver('catalogo', '2026-12-13');
        const nTipos = document.querySelectorAll('#cielo-cuerpo .cielo-chips')[0].querySelectorAll('button').length;
        for (let i = 0; i < nTipos; i++) await vista('catalogo: tipo ' + i, async () => { document.querySelectorAll('#cielo-cuerpo .cielo-chips')[0].querySelectorAll('button')[i].click(); });
        S.cat.tipo = 'todo'; await TG_CIELO.ver('catalogo', '2026-12-13');
        const nNiv = document.querySelectorAll('#cielo-cuerpo .cielo-chips')[1].querySelectorAll('button').length;
        for (let i = 0; i < nNiv; i++) await vista('catalogo: nivel ' + i, async () => { document.querySelectorAll('#cielo-cuerpo .cielo-chips')[1].querySelectorAll('button')[i].click(); });
        S.cat.nivel = 0; S.cat.estaNoche = false; S.cat.busca = '';
        await vista('catalogo: buscar «orion»', async () => { S.cat.busca = 'orion'; await TG_CIELO.ver('catalogo', '2026-12-13'); });
        S.cat.busca = '';
        /* otra noche: la de hoy, que es la que se abre sin tocar nada */
        await vista('noche de hoy', async () => { S.fecha = null; await TG_CIELO.ver('noche'); });
        TG_CIELO.cerrar();
        return { out, n };
      }, L);
      vistas += r.n;
      r.out.forEach(([v, x]) => problemas.push(L + ' · ' + ancho + ' px · ' + v + ': ' + x));
    }
    const faltan = await p.evaluate(() => [...window.__faltan]);
    ok(!faltan.length, ancho + ' px: ninguna fila pedida que no exista (tx() la devolveria vacia)', faltan.join(', '));
    err.forEach(e => errores.push(ancho + ' px: ' + e));
    if (ancho === 390) { await extras(p); await fichas(p); }
    await ctx.close();
  }
  ok(!problemas.length, vistas + ' vistas sin texto roto, sin botones vacios y sin nada que se salga', problemas.slice(0, 10).join('\n        ') + (problemas.length > 10 ? '\n        y ' + (problemas.length - 10) + ' mas' : ''));
  ok(!errores.length, 'sin errores de pagina', errores.slice(0, 3).join(' · '));
}

/* la luz roja, la carta del cielo y el cambio de idioma con el panel abierto */
async function extras(p) {
  const r = await p.evaluate(async () => {
    const out = {};
    setLang('es');
    await TG_CIELO.ver('noche', '2026-12-13');
    /* el idioma cambia con el panel abierto: se repinta solo (TG_IDIOMA) */
    setLang('de'); await new Promise(r => setTimeout(r, 300));
    out.titulo = document.getElementById('cielo-titulo').textContent;
    out.pestana = document.querySelector('#cielo-pestanas button').textContent;
    out.esperado = [UI_TX.cieloTitulo.de, UI_TX.cieloPesNoche.de];
    setLang('es');
    /* la luz roja: se pone, se va al cerrar, vuelve al abrir y se recuerda */
    const rojo = document.getElementById('cielo-rojo');
    out.rojoVisible = !rojo.hidden;
    rojo.click();
    out.rojoPuesto = document.documentElement.classList.contains('cielo-rojo') && rojo.getAttribute('aria-pressed') === 'true';
    TG_CIELO.cerrar();
    out.rojoAlCerrar = document.documentElement.classList.contains('cielo-rojo');
    await TG_CIELO.ver('noche', '2026-12-13');
    out.rojoAlAbrir = document.documentElement.classList.contains('cielo-rojo');
    try { out.rojoGuardado = localStorage.getItem('tgo_cielo_rojo'); } catch (e) {}
    rojo.click();
    out.rojoQuitado = !document.documentElement.classList.contains('cielo-rojo');
    /* la noche sin Luna: el total es la suma de los tramos que se ensenan
       (contando muestras de cinco minutos salian 5 minutos de mas) */
    out.sinLuna = [];
    for (const f of ['2026-12-13', '2026-10-17', '2027-01-04', '2027-06-21']) {
      await TG_CIELO.ver('noche', f);
      const filas = [...document.querySelectorAll('#cielo-cuerpo .cielo-fila')].map(x => [...x.children].map(y => y.textContent));
      const val = k => (filas.find(x => x[0] === UI_TX['cielo' + k].es) || [])[1] || '';
      const tot = val('SinLuna').match(/(\d+) h (\d+) min/);
      const tramos = [...val('SinLunaDe').matchAll(/(\d\d):(\d\d)–(\d\d):(\d\d)/g)]
        .reduce((a, m) => a + ((+m[3] * 60 + +m[4]) - (+m[1] * 60 + +m[2]) + 1440) % 1440, 0);
      out.sinLuna.push({ f, total: tot ? +tot[1] * 60 + +tot[2] : null, tramos, texto: val('SinLuna') + ' / ' + val('SinLunaDe') });
    }
    /* la carta: de dia se va a la noche cerrada, y pinta estrellas */
    await TG_CIELO.ver('mapa', '2026-12-13');
    await new Promise(r => setTimeout(r, 600));
    const n = TG_CIELO.noche('2026-12-13'), t = TG_CIELO.estado.mapa.t;
    out.mapaDeNoche = !!t && t >= n.oscuro.date && t <= n.claro.date;
    const cv = document.querySelector('#cielo-cuerpo canvas');
    if (cv) {
      const c = cv.getContext('2d'), d = c.getImageData(0, 0, cv.width, cv.height).data;
      let claros = 0; for (let i = 0; i < d.length; i += 4) if (d[i] + d[i + 1] + d[i + 2] > 450) claros++;
      out.mapaPuntos = claros; out.mapaTam = [cv.width, cv.height];
    }
    TG_CIELO.cerrar();
    return out;
  });
  ok(r.titulo === r.esperado[0] && r.pestana.includes(r.esperado[1]), 'con el panel abierto, al pasar al aleman se repinta en aleman', JSON.stringify([r.titulo, r.pestana]));
  ok(r.rojoVisible && r.rojoPuesto && !r.rojoAlCerrar && r.rojoAlAbrir && r.rojoGuardado === '1' && r.rojoQuitado,
     'la luz roja: se pone, se quita al cerrar el panel, vuelve al abrirlo y se recuerda', JSON.stringify(r));
  const sl = r.sinLuna.filter(x => x.total !== null);
  ok(sl.length >= 3 && sl.every(x => Math.abs(x.total - x.tramos) <= 2), 'la noche sin Luna suma lo que dicen sus tramos (' + sl.length + ' noches)',
     JSON.stringify(r.sinLuna));
  ok(r.mapaDeNoche && r.mapaPuntos > 200, 'la carta del cielo se abre en plena noche y pinta estrellas (' + r.mapaPuntos + ' pixeles claros en ' + (r.mapaTam || []).join('×') + ')', JSON.stringify(r));
}

/* Lo que dice cada ficha del catalogo, contra datos/cielo.json leido aqui, en
   crudo. Los demas controles miran que no haya «undefined» ni «NaN», pero una
   cifra equivocada es texto perfecto: el 17 de octubre de 2026 las 51
   estrellas decian «Su brillo varía entre mag. 0,9 y −0,3» (Sirio) con las
   componentes de su vector, y solo siete varian. Se mira en castellano, con
   el mismo formato que el panel: magnitudes con un decimal y el menos
   tipografico. */
async function fichas(p) {
  const crudo = {
    est: D.estrellas.map(e => ({ h: e.h, alt: e.alt, sp: e.sp, vr: e.vr || null })),
    vari: D.variables.map(v => ({ h: v.h, max: v.max, min: v.min, per: v.per, tipo: v.tipo })),
    dob: D.dobles.map(d => ({ id: d.id, sep: d.sep, m1: d.m1, m2: d.m2 })),
    obj: D.objetos.filter(o => o.niv).map(o => ({ id: o.id, alt: o.alt, m: o.m, tam: o.tam || null })),
    con: Object.entries(D.con).map(([k, c]) => ({ k, n6v: c.n6v, vis: c.vis })),
    lat: D.obs.lat
  };
  const r = await p.evaluate(async crudo => {
    setLang('es');
    const num = (x, d) => Number(x).toLocaleString('es-ES', { minimumFractionDigits: d, maximumFractionDigits: d });
    const mag = m => { const q = Math.round(m * 10) / 10 + 0; return q < 0 ? '−' + num(-q, 1) : num(q, 1); };
    const U = k => UI_TX['cielo' + k].es;
    const fila = (k, v) => Object.keys(v).reduce((s, x) => s.split('{' + x + '}').join(v[x]), U(k));
    const S = TG_CIELO.estado, mal = [], vistas = { est: 0, var: 0, dob: 0, obj: 0, con: 0 };
    S.cat.nivel = 0; S.cat.busca = ''; S.cat.estaNoche = false;
    const mirar = async (tipo, comprobar) => {
      S.cat.tipo = tipo; await TG_CIELO.ver('catalogo', '2026-12-13');
      const items = [...document.querySelectorAll('#cielo-cuerpo .cielo-item')];
      const lista = TG_CIELO.catalogo().filter(x => x.tipo === tipo);
      if (items.length !== Math.min(lista.length, 250)) mal.push(tipo + ': ' + items.length + ' fichas para ' + lista.length);
      items.forEach((it, i) => { it.classList.add('abierto'); comprobar(lista[i], it.innerText); });
    };
    const pide = (donde, txt, frase) => { if (!txt.includes(frase)) mal.push(donde + ': falta «' + frase + '»'); };
    const prefijoRango = U('VariableRango').split('{a}')[0];
    await mirar('estrellas', (x, txt) => {
      const e = crudo.est.find(y => y.h === x.o.h); vistas.est++;
      if (!e) { mal.push('estrella ' + x.o.h + ' no esta en datos/cielo.json'); return; }
      pide(x.nombre, txt, fila('AltMax', { alt: num(e.alt, 0) }));
      if (e.sp) pide(x.nombre, txt, fila('Espectro', { s: e.sp }));
      if (e.vr) pide(x.nombre, txt, fila('VariableRango', { a: mag(e.vr[1]), b: mag(e.vr[2]) }));
      else if (txt.includes(prefijoRango)) mal.push(x.nombre + ': dice que varia y en el catalogo no varia');
    });
    await mirar('variables', (x, txt) => {
      const v = crudo.vari.find(y => y.h === x.o.h); vistas.var++;
      if (!v) { mal.push('variable ' + x.o.h + ' no esta en datos/cielo.json'); return; }
      pide(x.nombre, txt, fila('VariableRango', { a: mag(v.max), b: mag(v.min) }));
      if (v.per && v.tipo !== 'NR') pide(x.nombre, txt, fila('Periodo', { d: num(v.per, v.per < 20 ? 2 : 0) }));
    });
    await mirar('sistemas', (x, txt) => {
      const d = crudo.dob.find(y => y.id === x.o.id); vistas.dob++;
      if (!d) { mal.push('doble ' + x.o.id + ' no esta en datos/cielo.json'); return; }
      if (d.sep !== null) pide(x.nombre, txt, d.sep >= 120 ? fila('SeparacionMin', { s: num(d.sep / 60, 1) }) : fila('Separacion', { s: num(d.sep, d.sep < 100 ? 1 : 0) }));
      if (d.m1 !== null && d.m2 !== null) pide(x.nombre, txt, fila('Componentes', { a: mag(d.m1), b: mag(d.m2) }));
    });
    const arco = x => num(x, x < 10 ? 1 : 0) + '′';
    for (const tipo of ['cumulos', 'nebulosas', 'galaxias']) await mirar(tipo, (x, txt) => {
      const o = crudo.obj.find(y => y.id === x.o.id); vistas.obj++;
      if (!o) { mal.push('objeto ' + x.o.id + ' no esta en datos/cielo.json'); return; }
      const nom = x.nombre || x.des;
      pide(nom, txt, fila('AltMax', { alt: num(o.alt, 0) }));
      if (o.m !== null) pide(nom, txt, fila('Mag', { m: mag(o.m) }));
      if (o.tam) pide(nom, txt, fila('Tamano', { t: o.tam[1] ? arco(o.tam[0]) + ' × ' + arco(o.tam[1]) : arco(o.tam[0]) }));
    });
    await mirar('constelaciones', (x, txt) => {
      const c = crudo.con.find(y => y.k === x.ab); vistas.con++;
      if (!c) { mal.push('constelacion ' + x.ab + ' no esta en datos/cielo.json'); return; }
      pide(x.nombre, txt, fila('ConEstrellas', { n: String(c.n6v) }));
      if (c.vis === 'p') pide(x.nombre, txt, fila('ConParcialDet', { d: '−' + num(90 - crudo.lat, 0) }));
    });
    S.cat.tipo = 'todo';
    TG_CIELO.cerrar();
    return { mal, vistas };
  }, crudo);
  ok(!r.mal.length && r.vistas.est === D.estrellas.length && r.vistas.var === D.variables.length && r.vistas.dob === D.dobles.length &&
     r.vistas.obj === D.objetos.filter(o => o.niv).length && r.vistas.con === Object.keys(D.con).length,
     'cada ficha dice lo que dice el catalogo: ' + r.vistas.est + ' estrellas (' + D.estrellas.filter(e => e.vr).length + ' variables), ' +
     r.vistas.var + ' variables, ' + r.vistas.dob + ' sistemas, ' + r.vistas.obj + ' objetos y ' + r.vistas.con +
     ' constelaciones: altura, brillo, tamaño, periodo, separacion y estrellas',
     r.mal.slice(0, 6).join(' · ') + (r.mal.length > 6 ? ' · y ' + (r.mal.length - 6) + ' mas' : ''));
}

/* ── 8. sin conexion de verdad ───────────────────────────────────────────
   Un servidor solo para esto: se carga la app, el service worker instala
   (y precachea el panel sin que nadie lo haya abierto), y el servidor se
   APAGA. Despues se recarga y se abre el panel. Si algo del panel no
   estuviera en el cache, no habria de donde sacarlo. */
async function sinConexion(b) {
  titulo('8. sin conexion: el servidor apagado, como en el Teide');
  const puerto = Number(PUERTO) + 7;
  const srv = spawn('python3', ['-m', 'http.server', String(puerto), '--bind', '127.0.0.1'], { cwd: RAIZ, stdio: 'ignore' });
  try {
    for (let i = 0; i < 50; i++) {
      try { await new Promise((ok_, mal) => require('http').get('http://127.0.0.1:' + puerto + '/sw.js', r => { r.resume(); ok_(); }).on('error', mal)); break; }
      catch (e) { await new Promise(r => setTimeout(r, 100)); }
    }
    const { ctx, p, err } = await abrirApp(b, 390, 844, puerto, true);
    const listo = await p.evaluate(async () => {
      const reg = await navigator.serviceWorker.ready;
      for (let i = 0; i < 100; i++) {
        const ya = await Promise.all(['./modulos/cielo.js', './vendor/astronomy.browser.min.js', './datos/cielo.json', './index.html'].map(u => caches.match(new URL(u, location.href).href)));
        if (ya.every(Boolean)) return { activo: !!reg.active };
        await new Promise(r => setTimeout(r, 200));
      }
      return { activo: !!reg.active, falta: true };
    });
    ok(listo.activo && !listo.falta, 'el service worker instala la app y deja el panel en el cache sin abrirlo', JSON.stringify(listo));
    srv.kill(); await new Promise(r => setTimeout(r, 300));
    await p.reload({ waitUntil: 'load' });
    await p.waitForTimeout(1500);
    const r = await p.evaluate(async () => {
      if (typeof TG_CIELO_CARGAR !== 'function') return { app: false };
      try { await window.TG_CIELO_CARGAR(); await TG_CIELO.ver('noche', '2026-12-13'); } catch (e) { return { app: true, error: String(e) }; }
      const txt = document.getElementById('cielo-panel').innerText;
      return { app: true, motor: typeof Astronomy !== 'undefined', datos: !!TG_CIELO.estado.datos, fallo: TG_CIELO.estado.fallo,
               luna: txt.includes(UI_TX.cieloLuna ? UI_TX.cieloLuna.es : 'Luna'), error: txt.includes(UI_TX.cieloErrorCarga.es) };
    });
    ok(r.app && r.motor && r.datos && !r.fallo && r.luna && !r.error, 'con el servidor apagado, el panel abre: motor, catalogo y la noche calculada', JSON.stringify(r));
    ok(!err.filter(e => !/Failed to fetch|NetworkError|ERR_/i.test(e)).length, 'sin errores de pagina (fuera de los de red)', err.slice(0, 3).join(' · '));
    await ctx.close();
  } finally { try { srv.kill(); } catch (e) {} }
}

/* ── 9. «Apunta al cielo» y la ficha ──────────────────────────────────────
   Los sensores se simulan con los eventos que la API DeviceOrientation (W3C)
   daria: alpha es el rumbo (a la izquierda, 360 − az) respecto al norte
   MAGNETICO -asi lo da Chrome en Android (deviceorientationabsolute) y
   webkitCompassHeading en iOS («relative to magnetic north», Apple)-, y
   beta la inclinacion: 90 es de pie, mas de 90 es la camara mirando al
   cielo. El panel corrige la declinacion del WMM2025 (datos/cielo.json), asi
   que para apuntar a un astro con azimut verdadero A se simula el rumbo
   magnetico A − D. La camara es la falsa de Chromium (un video de prueba).
   Wikipedia se responde aqui con JSON falso, con un titulo en aleman por
   los enlaces entre idiomas, una foto con URL no segura (tiene que
   rechazarse) y texto con <script> (tiene que salir como texto). */
async function apunta(b) {
  titulo('9. «Apunta al cielo», la ficha y Wikipedia');
  const { ctx, p, err } = await abrirApp(b, 390, 844, null, false, { permissions: ['camera'], isMobile: true, hasTouch: true });
  const WIKI = {
    'en/Alpha_Orionis': { type: 'standard', title: 'Betelgeuse', titles: { canonical: 'Betelgeuse' }, description: 'Red supergiant star in the constellation Orion',
      extract: 'Betelgeuse is a red supergiant star of spectral type M1-2 and one of the largest stars visible to the naked eye.',
      thumbnail: { source: 'https://upload.wikimedia.org/wikipedia/commons/thumb/x/Betelgeuse.jpg/320px-Betelgeuse.jpg' },
      content_urls: { desktop: { page: 'https://en.wikipedia.org/wiki/Betelgeuse' }, mobile: { page: 'https://en.m.wikipedia.org/wiki/Betelgeuse' } } },
    'de/Beteigeuze': { type: 'standard', title: 'Beteigeuze', description: 'Stern im Sternbild Orion',
      extract: 'Beteigeuze ist ein Roter Überriese im Sternbild Orion. <script>alert(1)</script> Er ist einer der größten bekannten Sterne.',
      thumbnail: { source: 'javascript:alert(1)' }, content_urls: { mobile: { page: 'https://de.m.wikipedia.org/wiki/Beteigeuze' } } },
    'en/Jupiter': { type: 'standard', title: 'Jupiter', titles: { canonical: 'Jupiter' }, description: 'Fifth planet from the Sun', extract: 'Jupiter is the fifth planet from the Sun and the largest in the Solar System.',
      content_urls: { mobile: { page: 'https://en.m.wikipedia.org/wiki/Jupiter' } } },
    'en/Castor_(star)': { type: 'standard', title: 'Castor (star)', description: 'Star system in the constellation Gemini', extract: 'Castor is a sextuple star system in the constellation Gemini.', content_urls: { mobile: { page: 'https://en.m.wikipedia.org/wiki/Castor_(star)' } } },
    'en/Alpha_Geminorum': { type: 'standard', title: 'Castor (star)', description: 'Star system in the constellation Gemini', extract: 'Castor is a sextuple star system in the constellation Gemini.', content_urls: { mobile: { page: 'https://en.m.wikipedia.org/wiki/Castor_(star)' } } },
    'en/Messier_42': { type: 'standard', title: 'Orion Nebula', description: 'Diffuse nebula in the constellation Orion', extract: 'The Orion Nebula is a diffuse nebula situated in the Milky Way.', content_urls: { mobile: { page: 'https://en.m.wikipedia.org/wiki/Orion_Nebula' } } },
    'en/Vega': { type: 'standard', title: 'Vega', description: 'Brand of electric vehicles', extract: 'Vega is a brand.', content_urls: { mobile: { page: 'https://en.m.wikipedia.org/wiki/Vega' } } },
    'en/Alpha_Lyrae': { type: 'disambiguation', title: 'Alpha Lyrae', description: 'Topics referred to by the same term', extract: 'Alpha Lyrae may refer to:', content_urls: { mobile: { page: 'https://en.m.wikipedia.org/wiki/Alpha_Lyrae' } } },
  };
  const pedidas = [];
  await p.route(/wikipedia\.org/, r => {
    const u = new URL(r.request().url()); pedidas.push(u.host + u.pathname + u.search);
    let m = u.pathname.match(/^\/api\/rest_v1\/page\/summary\/(.+)$/);
    if (m) {
      const k = u.host.split('.')[0] + '/' + decodeURIComponent(m[1]);
      return WIKI[k] ? r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(WIKI[k]) }) : r.fulfill({ status: 404, contentType: 'application/json', body: '{"type":"https://mediawiki.org/wiki/HyperSwitch/errors/not_found"}' });
    }
    if (u.pathname === '/w/api.php' && u.searchParams.get('prop') === 'langlinks') {
      const t = u.searchParams.get('titles'), l = u.searchParams.get('lllang');
      const ll = t === 'Betelgeuse' && l === 'de' ? [{ lang: 'de', title: 'Beteigeuze' }] : [];
      return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ batchcomplete: true, query: { pages: [{ title: t, langlinks: ll }] } }) });
    }
    return r.abort();
  });
  await p.evaluate(async () => { await window.TG_CIELO_CARGAR(); await TG_CIELO.cargar(); });
  /* la declinacion que usa el panel: la del catalogo, interpolada */
  const dec = await p.evaluate(() => ({ hoy: TG_CIELO.declinacion(new Date()), a: TG_CIELO.declinacion(new Date('2026-01-01T00:00:00Z')), m: TG_CIELO.declinacion(new Date('2026-07-02T12:00:00Z')), fin: TG_CIELO.declinacion(new Date('2035-01-01T00:00:00Z')) }));
  const an = D.declinacion.anios;
  ok(Math.abs(dec.a - an[1][1]) < 1e-9 && Math.abs(dec.m - (an[1][1] + an[2][1]) / 2) < 0.002 && dec.fin === an[5][1],
     'el panel interpola la declinacion del catalogo (1-1-2026: ' + dec.a + '°, mitad de 2026: ' + dec.m.toFixed(3) + '°, pasado 2030 se queda en ' + dec.fin + '°)', JSON.stringify(dec));
  /* la ficha, en castellano, con las cifras calculadas aqui aparte */
  const f = await p.evaluate(() => {
    setLang('es');
    const D = TG_CIELO.estado.datos, A = Astronomy, t = new Date('2026-12-13T22:00:00Z');
    const txt = sel => TG_CIELO.ficha(sel, t).innerText;
    const bet = D.estrellas.find(e => e.n === 'Betelgeuse'), sir = D.estrellas.find(e => e.n === 'Sirius');
    const m42 = D.objetos.find(o => o.id === 'M42');
    const lj = TG_CIELO.lunasJupiter(t);
    const g = A.GeoVector(A.Body.Moon, A.MakeTime(t), true), dLuna = Math.sqrt(g.x * g.x + g.y * g.y + g.z * g.z) * A.KM_PER_AU;
    const gj = A.GeoVector(A.Body.Jupiter, A.MakeTime(t), true), dJup = Math.sqrt(gj.x * gj.x + gj.y * gj.y + gj.z * gj.z) * A.KM_PER_AU;
    const fichaJ = TG_CIELO.ficha({ planeta: 'Jupiter' }, t);
    return { bet: txt({ k: 'est', rec: bet, v: bet.v }), sir: txt({ k: 'est', rec: sir, v: sir.v }), luna: txt({ planeta: 'Moon' }), sol: txt({ planeta: 'Sun' }),
             jup: fichaJ.innerText, jupCirculos: fichaJ.querySelectorAll('svg.cielo-lunas-j circle').length, m42: txt({ k: 'obj', rec: m42, v: m42.v }), ori: txt({ con: 'Ori' }),
             betK: TG_CIELO.kelvinBV(bet.bv), betClase: TG_CIELO.claseMK(bet.sp), lj: lj.lunas.map(l => [l.k, l.e, l.n, l.atras]), dLuna, dJup,
             carta7: txt({ est: D.est.find(e => e[6] === '7 Cet') }), anio: new Date().getFullYear() };
  });
  const bet = D.estrellas.find(e => e.n === 'Betelgeuse'), sir = D.estrellas.find(e => e.n === 'Sirius');
  const kelvin = bv => 4600 * (1 / (0.92 * bv + 1.7) + 1 / (0.92 * bv + 0.62));       // Ballesteros 2012
  const num = (x, d) => Number(x).toLocaleString('es-ES', { minimumFractionDigits: d, maximumFractionDigits: d });
  const dos = x => { const q = Math.pow(10, Math.floor(Math.log10(x)) - 1); return Math.round(x / q) * q; };
  const pide = (donde, txt, frase, lista) => { if (!txt.includes(frase)) lista.push(donde + ': falta «' + frase + '»'); };
  const mal = [];
  pide('Betelgeuse', f.bet, 'Tipo espectral: ' + bet.sp, mal);
  pide('Betelgeuse', f.bet, 'Clase: supergigante', mal);
  pide('Betelgeuse', f.bet, 'Color: rojo anaranjado, con una temperatura de unos ' + num(Math.round(kelvin(bet.bv) / 100) * 100, 0) + ' K', mal);
  pide('Betelgeuse', f.bet, 'Está a unos ' + num(dos(bet.al), 0) + ' años luz: la luz que ves salió de ella hace unos ' + num(dos(bet.al), 0) + ' años', mal);
  pide('Betelgeuse', f.bet, 'Brilla como unos ' + num(dos(bet.lum), 0) + ' soles', mal);
  pide('Betelgeuse', f.bet, 'Su brillo varía entre mag. ' + num(bet.vr[1], 1) + ' y ' + num(bet.vr[2], 1), mal);
  pide('Betelgeuse', f.bet, 'Altura máxima desde Tenerife: ' + num(bet.alt, 0) + '°', mal);
  pide('Betelgeuse', f.bet, 'Esta noche', mal); pide('Betelgeuse', f.bet, 'sale a las ', mal); pide('Betelgeuse', f.bet, 'se pone a las ', mal);
  pide('Sirio', f.sir, 'Está a ' + num(sir.al, 1) + ' años luz: la luz que ves salió de ella en ' + (f.anio - Math.round(sir.al)), mal);
  pide('Sirio', f.sir, 'Brilla como unos ' + num(dos(sir.lum), 0) + ' soles', mal);
  pide('Sirio', f.sir, 'Clase: enana, como el Sol', mal);
  pide('Sirio', f.sir, 'Es la estrella más brillante de Can Mayor', mal);
  if (/más brillante/.test(f.bet)) mal.push('Betelgeuse: dice que es la mas brillante de Orion, y es Rigel (HYG)');
  if (/varía/.test(f.sir)) mal.push('Sirio: dice que varía');
  pide('Luna', f.luna, 'A ' + num(Math.round(f.dLuna / 100) * 100, 0) + ' km: su luz tarda ' + num(f.dLuna / 299792.458, 2) + ' segundos', mal);
  pide('Luna', f.luna, 'Edad de la Luna: ', mal); pide('Luna', f.luna, '% iluminada', mal);
  pide('Sol', f.sol, 'Nunca mires el Sol', mal);
  pide('Júpiter', f.jup, 'A ' + num(f.dJup / 1e6, 0) + ' millones de km de la Tierra', mal);
  pide('Júpiter', f.jup, 'Sus cuatro lunas grandes ahora', mal);
  /* Calisto llega a unos 26 radios de Jupiter (unos 10 minutos de arco); el
     eje de las lunas se ve inclinado respecto al ecuador celeste hasta unos
     23 grados (la eclíptica), asi que el norte-sur llega a un tercio del
     este-oeste */
  if (f.jupCirculos !== 4 || f.lj.length !== 4 || f.lj.some(l => !isFinite(l[1]) || !isFinite(l[2]) || Math.abs(l[1]) > 700 || Math.abs(l[2]) > 0.45 * Math.abs(l[1]) + 40)) mal.push('lunas de Jupiter: ' + JSON.stringify(f.lj) + ' / ' + f.jupCirculos + ' circulos');
  pide('M42', f.m42, 'mag. ' + num(D.objetos.find(o => o.id === 'M42').m, 1), mal); pide('M42', f.m42, 'Tamaño aparente: ', mal); pide('M42', f.m42, 'Nebulosa', mal);
  pide('Orión', f.ori, 'Estrellas a simple vista (hasta mag. 6) que salen sobre el horizonte: ' + D.con.Ori.n6v, mal);
  pide('7 Cet', f.carta7, 'Tipo espectral: ' + D.est.find(e => e[6] === '7 Cet')[7], mal);
  const roto = [f.bet, f.sir, f.luna, f.sol, f.jup, f.m42, f.ori, f.carta7].join('\n').match(/undefined|NaN|\[object|\{[a-z]+\}/g);
  if (roto) mal.push('texto roto: ' + roto.join(', '));
  ok(!mal.length, 'la ficha dice lo que dan el catalogo y el motor: Betelgeuse, Sirio, la Luna, el Sol, Jupiter y sus lunas, M42, Orion y una estrella de la carta (7 Cet)', mal.slice(0, 6).join(' · '));
  /* en los diez idiomas: sin texto roto, y los mismos datos (mismo numero de lineas) */
  const porIdioma = await p.evaluate(IDI => {
    const D = TG_CIELO.estado.datos, t = new Date('2026-12-13T22:00:00Z'), out = {};
    const bet = D.estrellas.find(e => e.n === 'Betelgeuse'), m42 = D.objetos.find(o => o.id === 'M42');
    for (const L of IDI) {
      setLang(L);
      out[L] = [{ k: 'est', rec: bet, v: bet.v }, { planeta: 'Moon' }, { planeta: 'Jupiter' }, { k: 'obj', rec: m42, v: m42.v }, { con: 'Ori' }, { est: D.est.find(e => e[6] === '7 Cet') }]
        .map(sel => { const e = TG_CIELO.ficha(sel, t); return { li: e.querySelectorAll('li').length, txt: e.innerText }; });
    }
    setLang('es');
    return out;
  }, IDI);
  const malL = [];
  for (const L of IDI) porIdioma[L].forEach((x, i) => {
    const r = x.txt.match(/undefined|NaN|\[object|\{[a-z]+\}/g); if (r) malL.push(L + ' ficha ' + i + ': ' + r.join(','));
    if (x.li !== porIdioma.es[i].li) malL.push(L + ' ficha ' + i + ': ' + x.li + ' datos y en castellano ' + porIdioma.es[i].li);
  });
  ok(!malL.length, 'las seis fichas en los ' + IDI.length + ' idiomas: sin texto roto y con los mismos datos que en castellano', malL.slice(0, 6).join(' · '));
  /* Wikipedia: en aleman por los enlaces entre idiomas; lo no seguro, fuera */
  const w = await p.evaluate(async () => {
    const D = TG_CIELO.estado.datos, t = new Date('2026-12-13T22:00:00Z'), out = {};
    const bet = D.estrellas.find(e => e.n === 'Betelgeuse'), vega = D.estrellas.find(e => e.n === 'Vega'), castor = D.estrellas.find(e => e.n === 'Castor');
    const espera = async (e, ms) => { for (let i = 0; i < ms / 50; i++) { if (e.querySelector('.cielo-wiki-txt') || e.__sin) return; await new Promise(r => setTimeout(r, 50)); } };
    const mira = e => { const w = e.querySelector('.cielo-wiki'); if (!w || !w.children.length) return null;
      const img = w.querySelector('img'), a = w.querySelector('a'), p = w.querySelector('.cielo-wiki-txt');
      return { txt: p ? p.textContent : '', lang: p ? p.getAttribute('lang') : null, img: img ? img.getAttribute('src') : null, href: a ? a.href : null, lic: (w.querySelector('.cielo-wiki-lic') || {}).textContent || '', scripts: w.querySelectorAll('script').length, cab: (w.querySelector('.cielo-wiki-cab') || {}).textContent || '' }; };
    setLang('de');
    let e = TG_CIELO.ficha({ k: 'est', rec: bet, v: bet.v }, t); document.body.appendChild(e); await espera(e, 4000); out.de = mira(e); e.remove();
    setLang('en');
    e = TG_CIELO.ficha({ k: 'est', rec: bet, v: bet.v }, t); document.body.appendChild(e); await espera(e, 4000); out.en = mira(e); e.remove();
    e = TG_CIELO.ficha({ planeta: 'Jupiter' }, t); document.body.appendChild(e); await espera(e, 4000); out.jup = mira(e); e.remove();
    e = TG_CIELO.ficha({ k: 'est', rec: vega, v: vega.v }, t); document.body.appendChild(e); await new Promise(r => setTimeout(r, 1500)); out.vega = mira(e); e.remove();
    e = TG_CIELO.ficha({ k: 'est', rec: castor, v: castor.v }, t); document.body.appendChild(e); await espera(e, 4000); out.castor = mira(e); e.remove();
    setLang('fr');
    e = TG_CIELO.ficha({ k: 'est', rec: bet, v: bet.v }, t); document.body.appendChild(e); await espera(e, 4000); out.fr = mira(e); e.remove();
    setLang('es');
    try { out.cache = Object.keys(JSON.parse(localStorage.getItem('tgo_cielo_wiki_v1') || '{}')); } catch (x) { out.cache = []; }
    return out;
  });
  ok(w.de && /Beteigeuze ist ein Roter Überriese/.test(w.de.txt) && w.de.txt.includes('<script>alert(1)</script>') && w.de.scripts === 0 && w.de.lang === 'de' &&
     w.de.img === null && w.de.href === 'https://de.m.wikipedia.org/wiki/Beteigeuze' && /CC BY-SA 4\.0/.test(w.de.lic) && !/englisch/i.test(w.de.cab),
     'en aleman: el resumen de de.wikipedia por los enlaces entre idiomas, el <script> como texto, la foto con URL no segura rechazada, el enlace y la licencia', JSON.stringify(w.de));
  ok(w.en && /red supergiant/.test(w.en.txt) && w.en.img === WIKI['en/Alpha_Orionis'].thumbnail.source && w.en.href === 'https://en.m.wikipedia.org/wiki/Betelgeuse',
     'en ingles: el resumen, la foto (upload.wikimedia.org) y el enlace', JSON.stringify(w.en));
  ok(w.fr && /red supergiant/.test(w.fr.txt) && w.fr.lang === 'en' && /anglais/.test(w.fr.cab), 'en frances, sin articulo en frances: el ingles, y se dice', JSON.stringify(w.fr));
  ok(w.jup && /fifth planet/.test(w.jup.txt), 'Jupiter: el articulo del planeta', JSON.stringify(w.jup));
  ok(w.vega === null, 'Vega: «Alpha Lyrae» es una desambiguacion y «Vega» no es de astronomia en la respuesta falsa: no sale nada', JSON.stringify(w.vega));
  ok(w.castor && /sextuple star/.test(w.castor.txt), 'Castor: «Alpha Geminorum» lleva a la estrella', JSON.stringify(w.castor));
  ok(w.cache.includes('h27989|de') && w.cache.includes('h27989|en') && w.cache.every(k => new RegExp('\\|(' + IDI.join('|') + ')$').test(k)),
     'lo leido se guarda en el movil 30 dias (tgo_cielo_wiki_v1: ' + w.cache.length + ' resumenes, por astro e idioma)', w.cache.join(', '));
  const pedidasMal = pedidas.filter(x => !/^(en|de|fr)\.wikipedia\.org\/(api\/rest_v1\/page\/summary\/|w\/api\.php\?)/.test(x));
  ok(pedidas.length > 0 && !pedidasMal.length, 'solo se pidio el resumen y los enlaces entre idiomas (' + pedidas.length + ' peticiones)', pedidasMal.join(' · '));
  /* «Apunta al cielo» con los sensores simulados: a lo mas brillante que este arriba */
  const v = await p.evaluate(async () => {
    const A = Astronomy, D = TG_CIELO.estado.datos, o = new A.Observer(D.obs.lat, D.obs.lon, D.obs.h), t = A.MakeTime(new Date());
    const horiz = (ra, dec) => { const h = A.Horizon(t, o, ra, dec, 'normal'); return { alt: h.altitude, az: h.azimuth }; };
    const cand = [];
    setLang('es');
    for (const pl of ['Jupiter', 'Venus', 'Saturn', 'Mars', 'Moon']) { const eq = A.Equator(A.Body[pl], t, o, true, true); const h = horiz(eq.ra, eq.dec); if (h.alt > 12) cand.push({ sel: { planeta: pl }, nombre: TG_CIELO.cosa({ planeta: pl }).nombre, h }); }
    if (!cand.length) for (const e of D.estrellas.slice(0, 12)) { const h = horiz(e.ra / 15, e.dec); if (h.alt > 12) { const sel = { k: 'est', rec: e, v: e.v }; cand.push({ sel, nombre: TG_CIELO.cosa(sel).nombre, h }); break; } }
    if (!cand.length) return { nada: true };
    const c = cand[0], dec = TG_CIELO.declinacion(new Date());
    const magnetico = az => (az - dec + 360) % 360;                  // azimut verdadero -> rumbo de la brujula
    const evento = (az, alt) => { const ev = new Event('deviceorientationabsolute'); Object.assign(ev, { alpha: (360 - magnetico(az)) % 360, beta: 90 + alt, gamma: 0, absolute: true }); window.dispatchEvent(ev); };
    const espera = ms => new Promise(r => setTimeout(r, ms));
    TG_CIELO.vista({ sinGuia: true });
    await espera(200);
    const out = { nombre: c.nombre, h: c.h, dec };
    out.sinSensor = document.querySelector('#cielo-vista .cv-aviso').textContent;
    evento(c.h.az, c.h.alt); await espera(700);
    out.centro = document.querySelector('#cielo-vista .cv-nombre').innerText;
    out.sensores = document.querySelector('#cielo-vista .cv-chip[aria-pressed="true"]') ? document.querySelector('#cielo-vista .cv-chip[aria-pressed="true"]').textContent : '';
    /* 60 grados a un lado: ya no esta en el circulo; se busca, y la flecha dice cuanto falta */
    evento(c.h.az + 60, c.h.alt); await espera(500);
    out.centroLejos = document.querySelector('#cielo-vista .cv-nombre').innerText;
    document.querySelectorAll('#cielo-vista .cv-btn')[2].click(); await espera(200);
    out.busqueda = !document.querySelector('#cielo-vista .cv-busqueda').hidden;
    const inp = document.querySelector('#cielo-vista .cv-busqueda input'); inp.value = c.nombre.slice(0, 4); inp.dispatchEvent(new Event('input')); await espera(100);
    const it = [...document.querySelectorAll('#cielo-vista .cv-busqueda-item')].find(x => x.textContent.includes(c.nombre));
    out.encontrado = !!it; if (it) it.click();
    await espera(600);
    out.objetivo = document.querySelector('#cielo-vista .cv-objetivo').innerText;
    const a = c.h.alt * Math.PI / 180, dAz = 60 * Math.PI / 180;
    out.separacion = Math.acos(Math.sin(a) * Math.sin(a) + Math.cos(a) * Math.cos(a) * Math.cos(dAz)) * 180 / Math.PI;
    evento(c.h.az, c.h.alt); await espera(700);
    out.objetivoCerca = document.querySelector('#cielo-vista .cv-objetivo').innerText;
    out.cerca = document.querySelector('#cielo-vista .cv-objetivo').classList.contains('cerca');
    /* la camara falsa */
    document.querySelectorAll('#cielo-vista .cv-btn')[1].click(); await espera(1500);
    out.camara = { video: !document.querySelector('#cielo-vista video').hidden, avisa: document.querySelector('#cielo-vista .cv-aviso').textContent.slice(0, 40) };
    const cv = document.querySelector('#cielo-vista canvas'), g = cv.getContext('2d'), d = g.getImageData(0, 0, cv.width, cv.height).data;
    let claros = 0; for (let i = 0; i < d.length; i += 4) if (d[i] + d[i + 1] + d[i + 2] > 450) claros++;
    out.camara.pintado = claros;
    document.querySelectorAll('#cielo-vista .cv-btn')[1].click(); await espera(300);
    out.camaraFuera = document.querySelector('#cielo-vista video').hidden;
    /* la hoja con la ficha, tocando el nombre */
    document.querySelector('#cielo-vista .cv-nombre').click(); await espera(600);
    const hoja = document.querySelector('#cielo-vista .cv-hoja');
    out.hoja = hoja.hidden ? null : hoja.innerText.slice(0, 200);
    /* a mano, sin sensores: el cielo sigue al dedo */
    document.querySelectorAll('#cielo-vista .cv-chip')[1].click(); await espera(100);
    out.aMano = document.querySelectorAll('#cielo-vista .cv-chip')[1].textContent;
    TG_CIELO.cerrarVista();
    out.cerrada = !document.getElementById('cielo-vista');
    return out;
  });
  if (v.nada) nota('ahora mismo no hay planeta ni estrella brillante a mas de 12 grados: se salta la prueba de los sensores');
  else {
    ok(v.centro.includes(v.nombre), 'apuntando a ' + v.nombre + ' (az ' + v.h.az.toFixed(0) + '°, alt ' + v.h.alt.toFixed(0) + '°, brujula corregida ' + v.dec.toFixed(2) + '°), el circulo lo nombra', v.centro);
    ok(/Sensores/.test(v.sensores), 'y la vista pasa sola a los sensores al recibir el primer dato', v.sensores);
    ok(!v.centroLejos.includes(v.nombre), '60 grados a un lado ya no esta en el circulo', v.centroLejos);
    const g = (v.objetivo.match(/(\d+)°/) || [])[1];
    ok(v.busqueda && v.encontrado && g && Math.abs(+g - v.separacion) <= 3, 'buscado en 🔍, la flecha dice a cuantos grados queda (' + g + '°, calculado aqui ' + v.separacion.toFixed(1) + '°)', v.objetivo);
    ok(v.cerca && /Ahí está/.test(v.objetivoCerca), 'y al volver a apuntarle: «¡Ahí está!»', v.objetivoCerca);
    ok(v.camara.video && v.camara.pintado > 50 && v.camaraFuera, 'la camara (falsa) arranca detras del cielo, se sigue pintando encima (' + v.camara.pintado + ' pixeles claros) y se apaga al quitarla', JSON.stringify(v.camara));
    ok(v.hoja && v.hoja.includes(v.nombre), 'tocando el nombre sale su ficha en la hoja de abajo', v.hoja);
    ok(/A mano/.test(v.aMano) && v.cerrada, 'se puede pasar a mano, y la vista se cierra', v.aMano);
  }
  /* iOS: deviceorientation relativo + webkitCompassHeading. El rumbo que
     vale es el de la brujula: con un alpha cualquiera, apuntar al norte
     verdadero es un heading de −D (D negativa: unos 3,7° al este). */
  const ios = await p.evaluate(async () => {
    const espera = ms => new Promise(r => setTimeout(r, ms));
    /* Chromium tiene deviceorientationabsolute: se le pide al panel el
       camino de iOS (deviceorientation + webkitCompassHeading) */
    TG_CIELO.vista({ evento: 'deviceorientation', sinGuia: true }); await espera(150);
    const dec = TG_CIELO.declinacion(new Date());
    const ev = (alpha, beta, h) => { const e = new Event('deviceorientation'); Object.assign(e, { alpha, beta, gamma: 0, absolute: false, webkitCompassHeading: h, webkitCompassAccuracy: 10 }); window.dispatchEvent(e); };
    const H = (0 - dec + 360) % 360;                            // la brujula apuntando al norte verdadero
    ev(37, 50, H); await espera(300);                           // inclinado hacia delante: se toma la diferencia
    ev(37, 130, H); await espera(600);                          // la camara 40 grados arriba, mismo rumbo
    const s = TG_CIELO.sensores();
    /* con alpha 37 el rumbo del movil en su marco es 360 − 37 = 323; la
       diferencia esperada es H − 323 */
    const out = { n: s.n, ios: s.ios, off: s.offIOS, abs: s.abs, esperado: ((H - 323) + 540) % 360 - 180 };
    TG_CIELO.cerrarVista();
    return out;
  });
  ok(ios.n === 2 && ios.abs === false && typeof ios.off === 'number' && Math.abs(ios.off - ios.esperado) < 0.5,
     'iOS: deviceorientation relativo + webkitCompassHeading: la diferencia con la brujula (' + (ios.off || 0).toFixed(1) + '°) se toma con el movil inclinado hacia delante y lleva al rumbo de la brujula', JSON.stringify(ios));
  ok(!err.filter(e => !/Failed to fetch|NetworkError|ERR_/i.test(e)).length, 'sin errores de pagina', err.slice(0, 3).join(' · '));
  await ctx.close();
}

/* ── 10. lo que piden las reseñas (21 de octubre de 2026) ─────────────────
   Fuentes de fuera:
     · Retrogrados (fechas de los puntos estacionarios, en hora del este de
       EE. UU.): cafeastrology.com/retrogrades.html (Mercurio, Venus, Marte,
       Jupiter y Saturno 2026-2027) y farmersalmanac.com/mercury-retrograde
       (Mercurio 2026 y 2027): coinciden entre si. Aqui, a ±1,5 dias del
       mediodia de esa fecha (la hora no la publican y hay 4-5 h de zona).
     · Hora dorada y azul: photopills.com/glossary/g y /b: 6° a −4° y −4° a
       −6° (centro del Sol).
     · El eclipse total de Luna del 31-12-2028 (IMCCE, maximo 16:52:06 UTC):
       la Luna llena del calendario tiene que caer cerca.
     · RFC 5545 (iCalendar): lineas de 75 octetos plegadas con CRLF y un
       espacio; comas, puntos y coma y barras escapados; DTSTART en UTC. */
async function quejas(b) {
  titulo('10. lo que piden las reseñas: retrogrados, fases, fotos, indice, .ics, avisos, fecha, recorrido, captura y brujula');
  const { ctx, p, err } = await abrirApp(b, 390, 844, null, false, { permissions: ['camera'], isMobile: true, hasTouch: true });
  await p.evaluate(async () => { await window.TG_CIELO_CARGAR(); await TG_CIELO.cargar(); setLang('es'); });
  /* retrogrados */
  const retro = await p.evaluate(() => TG_CIELO.eventos('2026-10-17').filter(e => e.tipo === 'retro').map(e => ({ p: e.p, ini: e.ini, t: e.t.toISOString(), otro: e.otro && e.otro.toISOString(), con: e.con })));
  const TABLA = [['Mercury', true, '2026-10-24'], ['Mercury', false, '2026-11-13'], ['Venus', false, '2026-11-13'], ['Saturn', false, '2026-12-10'],
                 ['Jupiter', true, '2026-12-12'], ['Mars', true, '2027-01-10'], ['Mercury', true, '2027-02-09'], ['Mercury', false, '2027-03-03'],
                 ['Mars', false, '2027-04-01'], ['Jupiter', false, '2027-04-12'], ['Mercury', true, '2027-06-10'], ['Mercury', false, '2027-07-04'],
                 ['Saturn', true, '2027-08-09'], ['Mercury', true, '2027-10-07']];
  const cerca = (iso, dia) => Math.abs(new Date(iso) - new Date(dia + 'T12:00:00Z')) <= 1.5 * 864e5;
  const faltan = TABLA.filter(([pl, ini, dia]) => !retro.some(r => r.p === pl && r.ini === ini && cerca(r.t, dia))).map(x => x.join(' '));
  const sobran = retro.filter(r => !TABLA.some(([pl, ini, dia]) => r.p === pl && r.ini === ini && cerca(r.t, dia))).map(r => r.p + ' ' + r.ini + ' ' + r.t.slice(0, 10));
  ok(!faltan.length && !sobran.length && retro.length === TABLA.length,
     'retrogrados: los ' + TABLA.length + ' puntos estacionarios de Mercurio, Venus, Marte, Jupiter y Saturno hasta octubre de 2027, a ±1,5 dias de las dos tablas publicadas',
     'faltan: ' + faltan.join(' · ') + ' | sobran: ' + sobran.join(' · '));
  const pares = retro.filter(r => r.ini && r.otro).every(r => retro.some(q => q.p === r.p && !q.ini && q.t === r.otro) || new Date(r.otro) > new Date('2027-10-17'));
  ok(pares && retro.every(r => r.otro && r.con), 'cada principio sabe su final y cada final su principio, y todos llevan constelacion', JSON.stringify(retro.filter(r => !r.otro || !r.con)));
  /* fases: contra el motor aparte y contra el eclipse del IMCCE */
  const fases = await p.evaluate(() => {
    const A = Astronomy, ev = TG_CIELO.eventos('2028-12-01').filter(e => e.tipo === 'fase');
    const aparte = []; let q = A.SearchMoonQuarter(new Date('2028-12-01T00:00:00Z'));
    while (q && aparte.length < ev.length) { aparte.push({ q: q.quarter, t: q.time.date.toISOString() }); q = A.NextMoonQuarter(q); }
    return { ev: ev.map(e => ({ q: e.q, t: e.t.toISOString() })), aparte, n26: TG_CIELO.eventos('2026-10-17').filter(e => e.tipo === 'fase').length };
  });
  const llena = fases.ev.find(e => e.q === 2 && e.t.startsWith('2028-12-31'));
  ok(fases.ev.length >= 48 && fases.ev.every((e, i) => fases.aparte[i] && e.q === fases.aparte[i].q && e.t === fases.aparte[i].t) && fases.n26 >= 48,
     'fases: las cuatro de cada mes, las mismas que da SearchMoonQuarter aparte (' + fases.ev.length + ' en 12 meses)');
  ok(llena && Math.abs(new Date(llena.t) - new Date('2028-12-31T16:52:06Z')) <= 2 * 3600000,
     'la Luna llena del 31-12-2028 (' + (llena ? llena.t.slice(11, 16) : '?') + ' UTC) cae a menos de 2 h del maximo del eclipse total del IMCCE (16:52)', JSON.stringify(llena));
  /* horas para fotos: el Sol, calculado aparte, a 6, −4 y −6 grados */
  const fotos = await p.evaluate(() => {
    const A = Astronomy, D = TG_CIELO.estado.datos, o = new A.Observer(D.obs.lat, D.obs.lon, D.obs.h);
    /* altura geometrica del centro del Sol, sin refraccion: la de los crepusculos (y la que busca SearchAltitude) */
    const alt = t => { const eq = A.Equator(A.Body.Sun, t, o, true, true); return A.Horizon(t, o, eq.ra, eq.dec).altitude; };
    const out = {};
    for (const f of ['2026-12-13', '2027-06-21']) { const h = TG_CIELO.fotos(f); out[f] = {}; for (const k in h) out[f][k] = [alt(h[k][0]), alt(h[k][1]), h[k][0].date.toISOString(), h[k][1].date.toISOString()]; }
    return out;
  });
  const ESP = { doradaT: [6, -4], azulT: [-4, -6], azulM: [-6, -4], doradaM: [-4, 6] };
  const malF = [];
  for (const f in fotos) for (const k in ESP) { const x = fotos[f][k]; if (!x || Math.abs(x[0] - ESP[k][0]) > 0.05 || Math.abs(x[1] - ESP[k][1]) > 0.05 || new Date(x[3]) <= new Date(x[2])) malF.push(f + ' ' + k + ': ' + JSON.stringify(x)); }
  ok(!malF.length, 'horas dorada y azul (13-12-2026 y 21-6-2027): en cada borde el centro del Sol esta a 6°, −4° o −6° geometricos (±0,05°, calculado aparte) y van en orden', malF.join(' · '));
  /* el indice, recalculado aparte en tres noches: con Luna creciente fina, llena y nueva */
  const idx = await p.evaluate(() => ['2026-12-13', '2026-12-24', '2026-11-09'].map(f => { const n = TG_CIELO.noche(f), x = TG_CIELO.indice(f);
    return { f, valor: x.valor, palabra: x.palabra, oscuro: (n.claro.ut - n.oscuro.ut) * 24, sinLuna: n.sinLuna, ilum: n.ilum, nubes: x.nubes }; }));
  const aparte = x => { const frac = Math.min(x.sinLuna, x.oscuro) / x.oscuro; return Math.max(0, Math.min(10, Math.round(10 * (1 - (1 - frac) * Math.min(1, 0.2 + x.ilum))))); };
  const malI = idx.filter(x => x.nubes !== null || x.valor !== aparte(x) || x.palabra !== (x.valor >= 9 ? 'Excelente' : x.valor >= 7 ? 'Buena' : x.valor >= 5 ? 'Regular' : x.valor >= 3 ? 'Floja' : 'Mala'));
  ok(!malI.length && idx[2].valor === 10 && idx[1].valor <= 2 && idx[0].valor >= 8,
     'indice de la noche: ' + idx.map(x => x.f + ' → ' + x.valor + ' (' + x.palabra + ')').join(', ') + ': el mismo que sale de la formula aparte; Luna nueva 10, llena 0-2, sin nubes porque no hay prevision', JSON.stringify(malI));
  const tarjeta = await p.evaluate(async () => { await TG_CIELO.ver('noche', '2026-12-13'); const c = document.querySelector('.cielo-indice'); return c ? c.parentNode.innerText : ''; });
  ok(/Índice de la noche/.test(tarjeta) && new RegExp('\\b' + idx[0].valor + '\\b').test(tarjeta) && /Excelente|Buena/.test(tarjeta) && /Cómo se calcula/.test(tarjeta) && /Compartir/.test(tarjeta),
     'la tarjeta ensena el numero, la palabra, como se calcula y «Compartir»', tarjeta.slice(0, 160));
  /* el .ics: dos eventos, parseados aqui */
  const ics = await p.evaluate(() => { const ev = TG_CIELO.eventos('2026-10-17'); const g = ev.find(e => e.tipo === 'lluvia' && e.l.id === 'GEM'), s = TG_CIELO.eventos('2027-01-01').find(e => e.tipo === 'eclipseSol');
    return { gem: TG_CIELO.ics(g), gemMejor: new Date(Astronomy.MakeTime(g.mejor.u).date).toISOString(), sol: TG_CIELO.ics(s), solC1: s.ini.time.date.toISOString(), solC4: s.fin.time.date.toISOString() }; });
  const octetos = l => Buffer.byteLength(l, 'utf8');
  const parsea = txt => { const lineas = txt.split('\r\n'); const des = []; for (const l of lineas) { if (l.startsWith(' ')) des[des.length - 1] += l.slice(1); else des.push(l); } return { lineas, des }; };
  const fechaIcs = d => new Date(d).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const revisa = (txt, nombre, ini, fin) => {
    const { lineas, des } = parsea(txt), mal = [];
    if (!/\r\n$/.test(txt) || /(^|[^\r])\n/.test(txt)) mal.push('saltos sin CRLF');
    const largas = lineas.filter(l => octetos(l) > 75); if (largas.length) mal.push(largas.length + ' lineas de mas de 75 octetos');
    for (const k of ['BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT', 'END:VEVENT', 'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', 'END:VALARM', 'END:VCALENDAR', 'GEO:28.2987;-16.5106']) if (!des.includes(k)) mal.push('falta ' + k);
    const get = k => (des.find(l => l.startsWith(k + ':')) || '').slice(k.length + 1);
    if (get('DTSTART') !== fechaIcs(ini)) mal.push('DTSTART ' + get('DTSTART') + ' y no ' + fechaIcs(ini));
    if (get('DTEND') !== fechaIcs(fin)) mal.push('DTEND ' + get('DTEND') + ' y no ' + fechaIcs(fin));
    if (!/^[A-Za-z0-9-]+@jerome4551\.github\.io$/.test(get('UID'))) mal.push('UID ' + get('UID'));
    if (!/Hora de Canarias: \d\d:\d\d/.test(get('DESCRIPTION').replace(/\\n/g, '\n'))) mal.push('DESCRIPTION sin la hora de Canarias');
    if (/[^\\][,;]/.test(get('LOCATION'))) mal.push('LOCATION sin escapar');
    if (!get('SUMMARY')) mal.push('sin SUMMARY');
    return mal.length ? nombre + ': ' + mal.join(', ') : '';
  };
  const malIcs = [revisa(ics.gem, 'Geminidas', new Date(new Date(ics.gemMejor).getTime() - 3600000), new Date(new Date(ics.gemMejor).getTime() + 3600000)), revisa(ics.sol, 'eclipse 2027', ics.solC1, ics.solC4)].filter(Boolean);
  ok(!malIcs.length, '.ics de las Geminidas (una hora a cada lado del mejor momento) y del eclipse de 2027 (de C1 a C4): RFC 5545, CRLF, 75 octetos, UTC, VALARM −1 dia, escapes, UID', malIcs.join(' | '));
  /* los avisos: ponerlo, verlo arriba en «esta noche» la vispera (con el
     reloj de la pagina puesto en el 12 de diciembre), quitarlos todos */
  await p.exposeFunction('__vispera', async () => { await p.clock.setFixedTime(new Date('2026-12-12T20:00:00Z')); });
  const av = await p.evaluate(async () => {
    const espera = ms => new Promise(r => setTimeout(r, ms));
    TG_CIELO.quitarAvisos();
    const g = TG_CIELO.eventos().find(e => e.tipo === 'lluvia' && e.l.id === 'GEM');
    await TG_CIELO.ver('calendario'); await espera(200);
    const fila = [...document.querySelectorAll('#cielo-cuerpo .cielo-item')].find(x => /Gemínidas/.test(x.textContent));
    const b = fila && fila.querySelectorAll('.cielo-aviso-btns button')[1];
    const out = { botonAntes: b && b.textContent };
    if (b) { b.click(); await espera(150); }
    out.botonDespues = b && b.textContent; out.nota = b && (b.parentNode.querySelector('.cielo-nota-aviso') || {}).textContent;
    out.guardados = TG_CIELO.avisos(); out.id = TG_CIELO.idEvento(g);
    out.misAvisosCal = /Mis avisos/.test(document.querySelector('#cielo-cuerpo').innerText.slice(0, 400));
    /* la vispera: el reloj de la pagina puesto en el 12 de diciembre (page.clock), «esta noche» lo ensena arriba del todo */
    await window.__vispera(); await TG_CIELO.ver('noche', '2026-12-12'); await espera(200);
    out.vispera = document.querySelector('#cielo-cuerpo').innerText.slice(0, 500);
    const q = document.querySelector('#cielo-cuerpo .cielo-tarjeta .cielo-boton'); out.quitarTxt = q && q.textContent;
    await TG_CIELO.ver('calendario'); await espera(200);
    const todos = [...document.querySelectorAll('#cielo-cuerpo .cielo-boton')].find(x => /Quitar todos/.test(x.textContent));
    if (todos) { todos.click(); await espera(150); }
    out.trasQuitar = TG_CIELO.avisos().length; out.clave = localStorage.getItem('tgo_cielo_avisos_v1');
    out.misAvisosTras = /Mis avisos/.test(document.querySelector('#cielo-cuerpo').innerText.slice(0, 400));
    return out;
  });
  ok(/Recordármelo/.test(av.botonAntes || '') && /Quitar/.test(av.botonDespues || '') && /Guardado/.test(av.nota || '') && av.guardados.length === 1 && av.guardados[0].id === av.id && av.misAvisosCal,
     'un aviso en las Geminidas: el boton pasa a «Quitar», se guarda en el movil (' + av.id + ') y sale en «Mis avisos»', JSON.stringify(av).slice(0, 300));
  ok(/Mis avisos/.test(av.vispera) && /Gemínidas/.test(av.vispera) && /Quitar/.test(av.quitarTxt || ''), 'la vispera sale arriba del todo en «Esta noche», con su «Quitar»', av.vispera.slice(0, 200));
  ok(av.trasQuitar === 0 && av.clave === null && !av.misAvisosTras, '«Quitar todos los avisos» los quita de verdad (localStorage vacio y la tarjeta fuera)', JSON.stringify({ n: av.trasQuitar, clave: av.clave }));
  await p.clock.setSystemTime(new Date());        // el reloj, de vuelta a hoy
  /* la fecha libre en la carta, y el recorrido */
  const fecha = await p.evaluate(async () => {
    const espera = ms => new Promise(r => setTimeout(r, ms));
    await TG_CIELO.ver('mapa', '2026-12-13'); await espera(400);
    TG_CIELO.cambiarFecha('2027-08-02'); await espera(500);
    const S = TG_CIELO.estado, n = TG_CIELO.noche('2027-08-02');
    const out = { fecha: S.fecha, etiqueta: document.querySelector('.cielo-mapa-hora').textContent, input: document.querySelector('.cielo-fecha-input').value, t: S.mapa.t && S.mapa.t.toISOString(), oscuro: n.oscuro.date.toISOString() };
    TG_CIELO.cambiarFecha('mañana'); out.malFecha = S.fecha;
    return out;
  });
  ok(fecha.fecha === '2027-08-02' && fecha.input === '2027-08-02' && fecha.t === fecha.oscuro && /2 ago/.test(fecha.etiqueta) && fecha.malFecha === '2027-08-02',
     'fecha libre: 2027-08-02 pone la carta al empezar la noche cerrada de ese dia (' + fecha.etiqueta + '); una fecha mal escrita no cambia nada', JSON.stringify(fecha));
  const rec = await p.evaluate(async () => {
    const espera = ms => new Promise(r => setTimeout(r, ms));
    const A = Astronomy, D = TG_CIELO.estado.datos, o = new A.Observer(D.obs.lat, D.obs.lon, D.obs.h);
    TG_CIELO.cambiarFecha('2026-12-13'); await espera(300);
    const t = new Date('2026-12-14T00:00:00Z'), bet = D.estrellas.find(e => e.n === 'Betelgeuse');
    const jup = TG_CIELO.trayectoria({ planeta: 'Jupiter' }, t), est = TG_CIELO.trayectoria({ k: 'est', rec: bet, v: bet.v }, t);
    /* cada punto de Jupiter, contra el motor aparte */
    let peor = 0;
    for (const q of jup) { const tt = A.MakeTime(q.u), eq = A.Equator(A.Body.Jupiter, tt, o, true, true), h = A.Horizon(tt, o, eq.ra, eq.dec, 'normal');
      const alt = Math.asin(q.e[2]) * 180 / Math.PI, az = (Math.atan2(q.e[0], q.e[1]) * 180 / Math.PI + 360) % 360;
      peor = Math.max(peor, Math.abs(alt - h.altitude), Math.abs(((az - h.azimuth + 540) % 360) - 180)); }
    const S = TG_CIELO.estado;
    /* el lienzo se lee cada vez: TG_CIELO.ver('mapa') lo crea de nuevo. Dorado: mas rojo que verde que azul, y rojo lejos del azul (la linea va al 62 %) */
    const dorados = () => { const cv = S.mapa.canvas, d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i] > 120 && d[i] > d[i + 1] && d[i + 1] > d[i + 2] && d[i] - d[i + 2] > 60) n++; return n; };
    S.mapa.sel = { planeta: 'Jupiter' }; S.mapa.az = 110; S.mapa.alt = 30; S.mapa.fov = 110; await TG_CIELO.ver('mapa', '2026-12-13'); await espera(500);
    const antes = dorados();
    const b = [...document.querySelectorAll('.cielo-sel .cielo-boton')].find(x => /recorrido/.test(x.textContent)); if (b) b.click(); await espera(500);
    const despues = dorados(), nota = (document.querySelector('.cielo-sel .cielo-nota') || {}).textContent || '';
    const b2 = [...document.querySelectorAll('.cielo-sel .cielo-boton')].find(x => /Quitar el recorrido/.test(x.textContent)); if (b2) b2.click(); await espera(300);
    return { n: jup.length, horas: jup.filter(x => x.hora).length, minAlt: Math.min(...jup.map(x => Math.asin(x.e[2]) * 180 / Math.PI)), peor, est: est.length, estHoras: est.filter(x => x.hora).length, boton: !!b, antes, despues, nota, quitado: !!b2, rastro: S.mapa.rastro };
  });
  ok(rec.n > 60 && rec.horas >= 12 && rec.minAlt >= -3.6 && rec.peor < 0.02 && rec.est > 60 && rec.estHoras >= 12,
     'recorrido: Jupiter (' + rec.n + ' puntos, ' + rec.horas + ' horas en punto) y Betelgeuse (' + rec.est + '), cada punto a menos de 0,02° del motor aparte y nada mas de 3,5° bajo el horizonte', JSON.stringify(rec));
  ok(rec.boton && rec.despues > rec.antes + 150 && /recorrido de Júpiter/.test(rec.nota) && rec.quitado && rec.rastro === null,
     'en la ficha, «Ver su recorrido» lo pinta en la carta (' + (rec.despues - rec.antes) + ' pixeles dorados mas), la nota lo dice y «Quitar» lo quita', JSON.stringify({ antes: rec.antes, despues: rec.despues, nota: rec.nota }));
  /* las capturas: PNG de verdad, y la descarga (sin Web Share en Chromium sin cabeza) */
  const descargas = [];
  p.on('download', d => { descargas.push(d.suggestedFilename()); d.cancel().catch(() => {}); });
  const cap = await p.evaluate(async () => {
    const b = await TG_CIELO.capturarMapa();
    const buf = b ? new Uint8Array(await b.arrayBuffer()).slice(0, 8) : [];
    return { type: b && b.type, size: b && b.size, png: Array.from(buf).join(',') === '137,80,78,71,13,10,26,10', share: typeof navigator.share };
  });
  await p.waitForTimeout(600);
  ok(cap.png && cap.type === 'image/png' && cap.size > 20000, 'captura de la carta: un PNG de verdad (' + Math.round(cap.size / 1024) + ' kB)', JSON.stringify(cap));
  ok(descargas.some(n => /^tenerife-go-cielo-2026-12-13\.png$/.test(n)), 'sin hoja de compartir (navigator.share ' + cap.share + '), se descarga con su nombre: ' + descargas.join(', '));
  const capN = await p.evaluate(async () => { const c = TG_CIELO.imagenNoche('2026-12-13'); return { w: c.width, h: c.height }; });
  ok(capN.w === 1080 && capN.h === 1350, 'la imagen del indice para compartir mide 1080 × 1350', JSON.stringify(capN));
  /* la vista: guia, precision de iOS, comprobacion con la brujula 10 grados desviada, captura con la camara */
  const vista = await p.evaluate(async () => {
    const espera = ms => new Promise(r => setTimeout(r, ms));
    try { localStorage.removeItem('tgo_cielo_guia'); localStorage.removeItem('tgo_cielo_ajuste'); } catch (e) {}
    const A = Astronomy, D = TG_CIELO.estado.datos, o = new A.Observer(D.obs.lat, D.obs.lon, D.obs.h), t = A.MakeTime(new Date()), out = {};
    TG_CIELO.vista({}); await espera(300);
    const guia = document.querySelector('#cielo-vista .cv-guia');
    out.guia = !guia.hidden; out.guiaTxt = guia.innerText;
    out.pasos = guia.querySelectorAll('.cv-guia-paso').length;
    guia.querySelector('.cielo-boton').click(); await espera(100);
    out.guiaCerrada = guia.hidden; out.guiaGuardada = localStorage.getItem('tgo_cielo_guia');
    const dec = TG_CIELO.declinacion(new Date());
    const magnetico = az => (az - dec + 360) % 360;
    const evento = (az, alt) => { const ev = new Event('deviceorientationabsolute'); Object.assign(ev, { alpha: (360 - magnetico(az)) % 360, beta: 90 + alt, gamma: 0, absolute: true }); window.dispatchEvent(ev); };
    evento(200, 40); await espera(500);
    out.chipAntes = document.querySelectorAll('#cielo-vista .cv-chip')[1].textContent;
    out.chipComprobar = [...document.querySelectorAll('#cielo-vista .cv-chip')].filter(x => !x.hidden).map(x => x.textContent).join(' | ');
    const ref = TG_CIELO.comprobar(); await espera(200);
    out.ref = ref && TG_CIELO.cosa(ref).nombre;
    out.banner = document.querySelector('#cielo-vista .cv-comprobar').innerText;
    let h;
    if (ref.planeta) { const eq = A.Equator(A.Body[ref.planeta], t, o, true, true); const x = A.Horizon(t, o, eq.ra, eq.dec, 'normal'); h = { alt: x.altitude, az: x.azimuth }; }
    else { const x = A.Horizon(t, o, ref.est[0] / 15, ref.est[1], 'normal'); h = { alt: x.altitude, az: x.azimuth }; }
    /* lejos: 30 grados a un lado, «Ya» no corrige y lo dice */
    evento(h.az + 40, h.alt); await espera(600);
    out.lejos = TG_CIELO.comprobarYa(); out.lejosAviso = document.querySelector('#cielo-vista .cv-aviso').textContent; out.lejosAjuste = TG_CIELO.ajuste();
    /* el movil apunta de verdad a la referencia; la brujula, 10 grados desviada, dice az+10 */
    evento(h.az + 10, h.alt); await espera(700);
    out.r = TG_CIELO.comprobarYa(); await espera(200);
    out.ajuste = TG_CIELO.ajuste(); out.aviso = document.querySelector('#cielo-vista .cv-aviso').textContent;
    out.chip = document.querySelectorAll('#cielo-vista .cv-chip')[1].textContent; out.bannerFuera = document.querySelector('#cielo-vista .cv-comprobar').hidden;
    out.guardado = localStorage.getItem('tgo_cielo_ajuste');
    await espera(700);
    out.centro = document.querySelector('#cielo-vista .cv-nombre').innerText;
    /* la captura con la camara falsa puesta */
    document.querySelectorAll('#cielo-vista .cv-btn')[1].click(); await espera(1200);
    const b = await TG_CIELO.capturarVista();
    out.cap = { type: b && b.type, size: b && b.size, video: !document.querySelector('#cielo-vista video').hidden };
    document.querySelectorAll('#cielo-vista .cv-btn')[1].click(); await espera(200);
    TG_CIELO.cerrarVista(); await espera(100);
    /* la segunda vez, sin guia; y la precision de iOS en el chip */
    TG_CIELO.vista({ evento: 'deviceorientation' }); await espera(200);
    out.guia2 = !document.querySelector('#cielo-vista .cv-guia').hidden;
    const ev = new Event('deviceorientation'); Object.assign(ev, { alpha: 37, beta: 50, gamma: 0, absolute: false, webkitCompassHeading: 100, webkitCompassAccuracy: 15 }); window.dispatchEvent(ev);
    await espera(900);
    out.chipIOS = document.querySelectorAll('#cielo-vista .cv-chip')[1].textContent; out.chipTitulo = document.querySelectorAll('#cielo-vista .cv-chip')[1].title;
    TG_CIELO.cerrarVista();
    return out;
  });
  ok(vista.guia && vista.pasos === 3 && /Antes de apuntar/.test(vista.guiaTxt) && /imanes/.test(vista.guiaTxt) && /ocho/.test(vista.guiaTxt) && /Comprobar la brújula/.test(vista.guiaTxt) && /° al oeste/.test(vista.guiaTxt) && vista.guiaCerrada && vista.guiaGuardada === '1' && vista.guia2 === false,
     'la guia de 20 segundos sale la primera vez (imanes, el ocho, comprobar, la declinacion), «Entendido» la cierra y no vuelve a salir', JSON.stringify({ guia: vista.guia, pasos: vista.pasos, cerrada: vista.guiaCerrada, g: vista.guiaGuardada, g2: vista.guia2 }));
  ok(/Comprobar la brújula/.test(vista.chipComprobar) && vista.ref && /dentro del círculo y toca «Ya»/.test(vista.banner) && vista.banner.includes(vista.ref),
     'con los sensores sale el chip «Comprobar la brújula»; al tocarlo pide poner ' + vista.ref + ' en el circulo', vista.banner);
  ok(vista.lejos === undefined || vista.lejos === null, 'a 40 grados, «Ya» no corrige nada', JSON.stringify(vista.lejos));
  ok(/queda a \d+° del círculo/.test(vista.lejosAviso) && Math.abs(vista.lejosAjuste) < 0.01, '…y lo dice: ' + vista.lejosAviso.slice(0, 70), JSON.stringify(vista.lejosAjuste));
  ok(vista.r && Math.abs(vista.r.dAz + 10) < 0.3 && Math.abs(vista.r.dAlt) < 0.3 && Math.abs(vista.ajuste + 10) < 0.3 && Math.abs(parseFloat(vista.guardado) + 10) < 0.3,
     'con la brujula 10° desviada y ' + vista.ref + ' en el circulo, «Ya» mide −10,0° y corrige el ajuste (guardado en el movil)', JSON.stringify({ r: vista.r, ajuste: vista.ajuste, guardado: vista.guardado }));
  ok(/iba 10° desviada/.test(vista.aviso) && / ✓$/.test(vista.chip) && vista.bannerFuera && vista.centro.includes(vista.ref),
     'lo dice («' + vista.aviso.slice(0, 40) + '…»), el chip queda «' + vista.chip + '» y el circulo ya nombra a ' + vista.ref, JSON.stringify({ aviso: vista.aviso, chip: vista.chip, centro: vista.centro }));
  ok(vista.cap.video && vista.cap.type === 'image/png' && vista.cap.size > 20000, 'la captura de la vista con la camara (falsa) debajo es un PNG (' + Math.round(vista.cap.size / 1024) + ' kB)', JSON.stringify(vista.cap));
  ok(/±15°/.test(vista.chipIOS) && /Precisión de la brújula: ±15°/.test(vista.chipTitulo), 'iOS: la precision de la brujula (webkitCompassAccuracy 15) sale en el chip: «' + vista.chipIOS + '»', vista.chipTitulo);
  /* la Luna llena aclara el cielo: la misma vista (hacia la Luna, alta) con
     Luna llena y con Luna nueva, y la media del lienzo tiene que ser mayor */
  const luz = await p.evaluate(async () => {
    const espera = ms => new Promise(r => setTimeout(r, ms));
    const A = Astronomy, D = TG_CIELO.estado.datos, o = new A.Observer(D.obs.lat, D.obs.lon, D.obs.h), S = TG_CIELO.estado;
    const media = () => { const cv = S.mapa.canvas, d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let s = 0; for (let i = 0; i < d.length; i += 16) s += d[i] + d[i + 1] + d[i + 2]; return s / (d.length / 16) / 3; };
    const out = {};
    for (const [k, iso] of [['llena', '2026-12-24T02:00:00Z'], ['nueva', '2026-11-09T22:00:00Z']]) {
      const t = A.MakeTime(new Date(iso)), eq = A.Equator(A.Body.Moon, t, o, true, true), h = A.Horizon(t, o, eq.ra, eq.dec, 'normal');
      S.mapa.sel = null; S.mapa.rastro = null; S.mapa.cenital = false; S.mapa.az = h.azimuth; S.mapa.alt = 40; S.mapa.fov = 100;
      await TG_CIELO.ver('mapa', iso.slice(0, 10)); S.mapa.t = new Date(iso); S.mapa.porDefecto = false; S.mapa.desfase = 0; await TG_CIELO.ver('mapa', iso.slice(0, 10)); await espera(500);
      out[k] = { alt: h.altitude, ilum: A.Illumination(A.Body.Moon, t).phase_fraction, media: media() };
    }
    return out;
  });
  ok(luz.llena.alt > 30 && luz.llena.ilum > 0.98 && luz.nueva.ilum < 0.03 && luz.llena.media > luz.nueva.media * 1.2,
     'la Luna llena (' + Math.round(luz.llena.ilum * 100) + ' %, a ' + luz.llena.alt.toFixed(0) + '°) aclara el cielo de la carta: media ' + luz.llena.media.toFixed(1) + ' frente a ' + luz.nueva.media.toFixed(1) + ' con Luna nueva', JSON.stringify(luz));
  ok(!err.filter(e => !/Failed to fetch|NetworkError|ERR_/i.test(e)).length, 'sin errores de pagina', err.slice(0, 3).join(' · '));
  await ctx.close();
}
