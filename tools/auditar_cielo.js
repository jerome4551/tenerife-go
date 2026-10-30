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
 *      licencia y nada que no venga de la API; sin articulo en su idioma, lo
 *      dice en su idioma y nada en ingles; sin red, no dice nada.
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
 *  11. la Estacion Espacial y los satelites brillantes (21 de octubre de
 *      2026): el motor SGP4 (vendor/satellite.js) contra los 33 casos de
 *      verificacion oficiales (tools/sgp4_verificacion.json), y byte a byte
 *      contra sus fuentes si estan bajadas (tools/satelites_fuentes.sh);
 *      datos/satelites.json (tres objetos, lineas de 69 caracteres, sumas de
 *      control, epocas); el robot sin red (no escribe con una linea mal ni
 *      con elementos mas viejos, ni reescribe los mismos); el flujo y el
 *      service worker. En el navegador, con el reloj de la pagina a la noche
 *      siguiente a la epoca: cada paso cumple la regla (mas de 10 grados,
 *      al Sol, cielo oscuro), y la lista entera se recalcula AQUI APARTE
 *      (GMST y Sol de Astronomy Engine, ECEF y acimut/altura a mano, umbra
 *      cilindrica) y tiene que salir la misma; la tarjeta, el filtro del
 *      calendario, la carta (el punto pintado), «Apunta al cielo» (nombra
 *      al satelite y lo encuentra la busqueda), la ficha, el .ics con la
 *      alarma a media hora, el aviso; con elementos de 10 dias, lo dice y no
 *      ensena pasos; y los diez idiomas sin texto roto ni palabras repetidas.
 *  12. la noche guiada, el sistema solar hoy, la luz roja completa y «sin red
 *      en el Teide» (21 de octubre de 2026, tercer bloque): cada parada de
 *      la guia recalculada aparte (altura con el motor desde las coordenadas
 *      del catalogo, los umbrales de cada clase, los planetas por brillo, las
 *      tres estrellas mas brillantes), «Llevame» con la flecha, otras noches
 *      (la Via Lactea sin Luna, las Perseidas con el radiante que sube mas
 *      tarde, las Geminidas); el sistema solar contra los elementos
 *      keplerianos de la JPL (tools/elementos_planetas.json, Standish)
 *      calculados aqui aparte en cuatro fechas, Tenerife hacia el Sol a
 *      mediodia y al contrario a medianoche, el lienzo pintado, la hoja de
 *      Jupiter con la distancia y la elongacion recalculadas, las vistas, el
 *      tiempo; la luz roja (la pista de noche y no de dia, «Activar», el
 *      regulador en el panel y en la vista, theme-color puesto y devuelto);
 *      sin red (el aviso con la fecha de los elementos, la comprobacion en
 *      «Donde ir» y, en la parte 8, que con el service worker diga
 *      «guardado»); y los diez idiomas.
 *  13. las curiosidades y la ficha del planeta (22 de octubre de 2026, quinto
 *      bloque): la copia de datos/planetas.json que lleva el modulo
 *      (CIELO_PLANETAS) igual al JSON; los periodos orbitales de la NASA
 *      contra la tercera ley de Kepler con la a de la JPL; que cada frase
 *      que compara («el mas pequeño», «menos denso que el agua», «gira al
 *      reves», «el mas frio», «las mas lentas de esta lista») se cumpla en
 *      los numeros de donde sale; el cuerpo padre de cada lluvia (cometa o
 *      asteroide) como lo dicen la NASA y la IMO; en el navegador, las
 *      fichas de Jupiter (la hoja de la NASA), la Luna (perigeo y apogeo
 *      cotejados con la distancia del motor), el Sol, Canopus y la Polar
 *      (la geometria de la latitud), Omega Centauri, la ISS, las once
 *      lluvias en el calendario (plegadas, con su fuente como enlace), la
 *      luz zodiacal en su temporada y no fuera de ella (y la Luna recalculada
 *      aparte), la sombra del Teide con la hora de la puesta; y los diez
 *      idiomas sin texto roto.
 *  14. las 88 constelaciones (22 de octubre de 2026, sexto bloque): la copia
 *      de datos/constelaciones.json que lleva el modulo (CIELO_CONS) igual
 *      al JSON; las 88 areas suman la esfera entera (41.253 grados
 *      cuadrados) y los puestos van del 1 al 88 en el orden de las areas; el
 *      origen de cada una es una de las siete categorias y el año cuadra con
 *      ella (47 de Ptolomeo + 3 de Argo, 12 de Keyser, 4 de Plancius, 7 de
 *      Hevelius, 14 de Lacaille, Coma Berenices); la estrella mas brillante
 *      de la lista de la UAI es la misma que la del catalogo (HYG) cuando el
 *      catalogo la nombra; 88 filas cieloCurCon*, cada una con la pagina de
 *      donde sale (Star Tales de Ian Ridpath en 87, Wikipedia en Orion) y
 *      las dos tablas de la UAI; lo que cuatro de ellas dicen de Tenerife
 *      (Canopus, Alfa y Omega Centauri, la Cruz del Sur, el Carro), contra la
 *      latitud del observatorio y el catalogo; en el navegador, las fichas
 *      de Orion, Hydra, Crux, Camelopardalis, Coma Berenices, Puppis y la
 *      Osa Mayor (origen, tamaño, curiosidad y sus tres fuentes), el
 *      catalogo, y los diez idiomas. Y desde la tarde del 22, un fichero por
 *      idioma (idiomas/cielo/<l>.json): las 88 claves en los diez, ninguna
 *      en el modulo, la cita de cada una en datos/constelaciones.json, el
 *      cargador, el service worker y tools/fuente.js; en el navegador, que
 *      se pide solo el del idioma, que sin el no sale la de otro idioma, y
 *      (parte 8) que abierto una vez con conexion queda para el Teide.
 *  15. la noche guiada en voz alta (22 de octubre de 2026, septimo bloque):
 *      sin navegador, que el lector de los lugares presta al cielo sus
 *      codigos de idioma y solo voces del dispositivo (localService), que el
 *      bloque de la voz no pide nada a la red, la pausa que dice la nota,
 *      donde se para y donde se queda en pausa, la regla de plural de la app
 *      contra la de CLDR y lo que se oye concordando con el numero en los
 *      diez idiomas («1 grado», «32 stopnie», «5 przystanków»), y el polaco
 *      de las cifras de la ficha. En el navegador, con una voz falsa que
 *      apunta cada frase: la intro, cada parada (lo que dice es lo que pone
 *      la tarjeta: el nombre, la clase, la hora si es otra, la direccion y
 *      la altura, lo que se ve) y el final; la voz del dispositivo y no la de
 *      red; la parada que se lee, marcada; la cuenta atras; «Pausa», «Seguir»
 *      (vuelve a leer la parada), «Siguiente» y «Parar»; la pantalla
 *      encendida solo mientras lee; que se para al cerrar el panel, al
 *      cambiar de noche o de idioma, y se queda en pausa con «Llévame», en
 *      otra pestaña, con la pagina oculta o si el lector de los lugares la
 *      corta; sin voz para el idioma, la nota y no el boton; con las voces
 *      sin cargar, se intenta; una voz que falla o que no empieza, el aviso;
 *      y los diez idiomas, cada uno con su voz y sin texto roto.
 *  16. la revision del 22 de octubre de 2026 (octavo bloque, REVISION-22-10-
 *      2026.md): «Donde ir» contra sus fuentes (el «por lo general» del IAC, la
 *      Ley del Cielo y su reglamento, los cinco sitios de Turismo de
 *      Tenerife, el Observatorio de dia), las normas del Parque Nacional para
 *      la noche (Decreto 182/2025: telescopio, luces, dormir, excursiones), los
 *      enlaces nuevos (BOC, AEMET, IAC) y los que cambian (HYG en Codeberg, el
 *      IGN), el brillo del cielo del IAC, las seis fichas del Teide sin el
 *      permiso «gratuito», el teleferico a «~14 €», Pico Viejo «sin permiso» ni
 *      el «astroturismo nocturno»; las lluvias con la Luna arriba parte de la
 *      noche (las Leonidas de 2026 y las Perseidas de 2027: «desde que se pone
 *      la Luna (03:58)»; las Draconidas de 2028: «hasta que sale»), la
 *      letra del panel a 11 px como minimo y el trato de usted en las tarjetas
 *      de «Donde ir». Sin navegador (16a) y en la pantalla, en los diez
 *      idiomas (16).
 *
 * Sale con 1 si algo falla.
 */
'use strict';
const fs = require('fs'), path = require('path'), { execFileSync, spawn } = require('child_process');
const RAIZ = path.dirname(__dirname);
const args = process.argv.slice(2);
const PUERTO = args.find(a => /^\d+$/.test(a));
const FUENTES = (args.find(a => a.startsWith('--fuentes=')) || '').slice(10) || process.env.FUENTES_CIELO || '/tmp/fuentes-cielo';
const FUENTES_SAT = (args.find(a => a.startsWith('--fuentes-satelites=')) || '').slice(20) || process.env.FUENTES_SATELITES || '/tmp/fuentes-satelites';
/* --solo=6,8: solo esas partes del navegador (para probar a mano; auditar.sh las pasa todas) */
const SOLO = (args.find(a => a.startsWith('--solo=')) || '').slice(7).split(',').filter(Boolean);
const toca = n => !SOLO.length || SOLO.includes(String(n));
const lee = f => fs.readFileSync(path.join(RAIZ, f), 'utf8');
const index = lee('index.html'), modulo = lee('modulos/cielo.js');
const D = JSON.parse(lee('datos/cielo.json'));
const SATJSON = JSON.parse(lee('datos/satelites.json'));     // 11a y 11

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
  /* Esos nombres, en chino, chino tradicional y bulgaro (22 de octubre de
     2026): CIELO_UAI, de las traducciones de Stellarium. Siempre, que cada
     uno sea de una estrella de nombresIAU y este en su escritura; con las
     fuentes, que la tabla sea exactamente la que sale de ellas (la regla,
     las erratas y el cotejo con la cultura china: tools/cielo_uai.js). */
  const UAI = tablaModulo('CIELO_UAI') || {};
  const uaiMal = [];
  for (const [l, t] of Object.entries(UAI)) for (const [h, v] of Object.entries(t)) {
    const escritura = l === 'bg' ? /^[А-Яа-я][А-Яа-я\- ]*$/ : /^[\u3400-\u9fff\uf900-\ufaff]+[A-Z]?$/;
    if (!iau[h] || !escritura.test(v)) uaiMal.push(l + ' ' + h + ' ' + v);
  }
  ok(['zh', 'zht', 'bg'].every(l => Object.keys(UAI[l] || {}).length > 200) && !uaiMal.length,
     'CIELO_UAI: los nombres de la UAI en chino (' + Object.keys(UAI.zh || {}).length + '), chino tradicional (' + Object.keys(UAI.zht || {}).length
     + ') y bulgaro (' + Object.keys(UAI.bg || {}).length + '), cada uno de una estrella de nombresIAU y en su escritura', uaiMal.slice(0, 5).join(', '));
  if (fs.existsSync(path.join(FUENTES, 'stel', 'po', 'stellarium-sky', 'zh_CN.po'))) {
    let salida = '', rc = 0;
    try { salida = execFileSync('node', [path.join(RAIZ, 'tools', 'cielo_uai.js'), FUENTES, '--comprobar'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }); }
    catch (e) { rc = e.status || 1; salida = String(e.stdout || '') + String(e.stderr || ''); }
    ok(rc === 0, 'y es exactamente la que sale de las traducciones de Stellarium, con sus erratas cotejadas (cielo_uai.js --comprobar)', salida.trim().split('\n').slice(-3).join(' | '));
  } else nota('sin ' + FUENTES + '/stel: CIELO_UAI no se coteja con Stellarium (bash tools/cielo_fuentes.sh ' + FUENTES + ')');
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
/* Las 88 curiosidades de las constelaciones van un fichero por idioma
   (idiomas/cielo/<l>.json, 22-10-2026): se juntan aqui con CIELO_UI, fila a
   fila, para que las partes 3 y 14a las miren como antes. */
const CUR_IDIOMAS = {};
for (const l of IDI) {
  let d = {}; try { d = JSON.parse(lee('idiomas/cielo/' + l + '.json')); } catch (e) {}
  for (const [k, v] of Object.entries(d)) (CUR_IDIOMAS[k] = CUR_IDIOMAS[k] || {})[l] = v;
}
const FILAS_EN_MODULO = Object.keys(CIELO_UI).length;
Object.assign(CIELO_UI, CUR_IDIOMAS);
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
  /* El calendario y los avisos dicen lo que hacen (22-10-2026). El .ics de un
     paso avisa media hora antes y el de lo demas, el dia antes: la nota de
     cada uno y la de «Mis avisos» tienen que decir eso. Y ninguna que
     Tenerife Go no tiene servidor: lo tiene (la notificacion diaria,
     .github/workflows/notificacion-diaria.yml). */
  {
    const trig = (modulo.match(/'TRIGGER:' \+ \(e\.tipo === 'paso' \? '(-PT\d+M)' : '(-P\d+D)'\)/) || []).slice(1);
    const usaPaso = /T\(e\.tipo === 'paso' \? 'IcsListoPaso' : 'IcsListo'\)/.test(modulo);
    const u = k => (CIELO_UI[k] || {}).es || '';
    const servidor = fs.existsSync(path.join(RAIZ, '.github', 'workflows', 'notificacion-diaria.yml'));
    ok(trig[0] === '-PT30M' && trig[1] === '-P1D' && usaPaso && /media hora antes/.test(u('cieloIcsListoPaso')) && /el día antes/.test(u('cieloIcsListo'))
       && /el día antes/.test(u('cieloAvisosNota')) && /media hora antes/.test(u('cieloAvisosNota')) && !(servidor && /no tiene ningun|sin un servidor/i.test(u('cieloAvisosNota'))),
       'el calendario dice cuando avisa: los pasos media hora antes (' + trig[0] + '), lo demas el dia antes (' + trig[1] + '), en la nota de cada uno y en «Mis avisos»; y ningun texto dice que Tenerife Go no tiene servidor',
       JSON.stringify({ trig, usaPaso, paso: u('cieloIcsListoPaso'), nota: u('cieloAvisosNota') }));
  }

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
    Indice: [...(modulo.match(/valor >= 9 \? '(\w+)' : valor >= 7 \? '(\w+)' : valor >= 5 \? '(\w+)' : valor >= 3 \? '(\w+)' : '(\w+)'/) || []).slice(1)],
    /* los satelites (21 de octubre): el nombre y el brillo de cada clave de datos/satelites.json */
    SatNombre: SATJSON.sat.map(s => s.clave[0].toUpperCase() + s.clave.slice(1)),
    SatBrillo: SATJSON.sat.map(s => s.clave[0].toUpperCase() + s.clave.slice(1)),
    /* las curiosidades (22 de octubre, quinto bloque): por cuerpo (los de
       CIELO_PLANETAS mas el Sol), por satelite y por lluvia del catalogo;
       CurSur y CurPolar se piden sueltas */
    Cur: Object.keys(JSON.parse((modulo.match(/var CIELO_PLANETAS = (\{.*\});\n/) || [, '{"cuerpos":{}}'])[1]).cuerpos).concat(['Sun'])
      .concat(SATJSON.sat.map(s => s.clave[0].toUpperCase() + s.clave.slice(1))).concat(D.lluvias.map(l => l.id)),
    /* las 88 constelaciones (22 de octubre, sexto bloque): el origen por su
       categoria (ORIGEN_FILA del codigo) y la curiosidad por la abreviatura
       del catalogo */
    ConOrigen: [...((modulo.match(/var ORIGEN_FILA = \{([^}]*)\}/) || [, ''])[1]).matchAll(/'(\w+)'/g)].map(x => x[1]),
    CurCon: Object.keys(D.con)
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
  /* el cielo ya no es la unica carga perezosa (el perfil trae las suyas y el
     panel SOS, modulos/emergencias.js, la suya, 22 de octubre de 2026): aqui,
     que la del cielo esta y una vez */
  ok(decl.filter(d => d === 'modulos/cielo.js').length === 1, 'index.html declara CARGA-PEREZOSA: modulos/cielo.js, una vez (tools/fuente.js lo pega al fuente)', decl.join(', '));
  ok(/var MODULO = '\.\/modulos\/cielo\.js'/.test(cascaraSrc), 'el cargador pide ese mismo fichero');
  ok(!/<script[^>]+src=["'](?:\.\/)?modulos\/cielo\.js/.test(index), 'y no va en una etiqueta de arranque: si fuera, la carga perezosa no serviria de nada');
  let sintaxis = true; try { execFileSync('node', ['--check', path.join(RAIZ, 'modulos', 'cielo.js')], { stdio: 'pipe' }); } catch (e) { sintaxis = String(e.stderr || e).slice(0, 200); }
  ok(sintaxis === true, 'modulos/cielo.js es JavaScript valido', sintaxis);
  ok(!/<\/script/i.test(modulo), 'modulos/cielo.js no trae «</script» (tools/fuente.js lo pega en linea)');
  for (const f of ['vendor/astronomy.browser.min.js', 'datos/cielo.json', 'vendor/satellite.js', 'datos/satelites.json'])
    ok(modulo.includes("'./" + f + "'") && fs.existsSync(path.join(RAIZ, f)), 'el panel pide ./' + f + ' y existe');
  const motor = lee('vendor/astronomy.browser.min.js');
  ok(!/\beval\s*\(|new Function\s*\(|\bFunction\s*\(\s*['"]/.test(motor), 'el motor no usa eval ni new Function: la CSP no lleva unsafe-eval');
  const lic = fs.existsSync(path.join(RAIZ, 'vendor', 'LICENSE-astronomy.txt')) ? lee('vendor/LICENSE-astronomy.txt') : '';
  ok(/MIT License/.test(lic) && /Don Cross/.test(lic), 'vendor/LICENSE-astronomy.txt: la licencia MIT del motor, con su autor');
  const csp = (index.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/) || [, ''])[1];
  const conecta = (csp.match(/connect-src ([^;]+)/) || [, ''])[1].split(/\s+/);
  /* lo que se PIDE (fetch), no los enlaces que se ensenan para abrir fuera */
  const hosts = [...modulo.matchAll(/(?:fetch\(\s*|var url = )'https:\/\/([a-z0-9.-]+)\//g)].map(m => m[1]);
  /* `pedir` es fetch o, dentro de la aplicacion de las tiendas, tgoFetchDatos (index.html): la copia viva primero y la de dentro si no llega */
  const fetchs = [...modulo.matchAll(/\b(?:fetch|pedir)\(\s*([^)]{0,60})/g)].map(m => m[1].trim());
  ok(hosts.length > 0 && hosts.every(h => conecta.includes('https://' + h)), 'lo que el panel pide fuera (' + [...new Set(hosts)].join(', ') + ') esta en el connect-src de la CSP', conecta.join(' '));
  ok(fetchs.length >= 5 && fetchs.every(x => /^'\.\/datos\/cielo\.json'|^'\.\/datos\/satelites\.json'|^url\b|^rutaCurCon\(l\)?$/.test(x)), 'y no pide nada mas: el catalogo, los elementos de los satelites, la nubosidad, Wikipedia y las curiosidades de las constelaciones en su idioma (fetch: ' + fetchs.join(' · ') + ')');
  ok(/var pedir = typeof tgoFetchDatos === 'function' \? tgoFetchDatos : fetch;/.test(modulo) && /function tgoFetchDatos\(ruta, opc\)/.test(index) && /if \(!window\.TGO_NATIVO\) return fetch\(ruta, opc\);/.test(index),
     'los elementos de los satelites se piden con tgoFetchDatos (index.html): en la web es fetch tal cual; en la aplicacion de las tiendas, la copia viva primero');
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
  /* el nombre de la funcion, el de la app (desde el 22-10-2026, de usted: «Apunte al cielo») */
  const apuntaEs = (CIELO_UI.cieloApunta || {}).es || '\u0000';
  ok((priv.ppDatosSensoresTxt || '').includes('«' + apuntaEs + '»') && (priv.ppDatosCamaraTxt || '').includes('«' + apuntaEs + '»') && /astro/.test(priv.ppTercWiki || ''),
     'la politica de privacidad habla de los sensores y de la camara de «' + apuntaEs + '» (el rotulo de la app) y del resumen de Wikipedia del astro');
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

/* ════════ 11a. los satelites, sin navegador ════════ */
titulo('11a. la Estacion Espacial y los satelites: el motor SGP4, los elementos orbitales, el robot y el flujo');
{
  const pines = {};
  for (const m of lee('tools/satelites_fuentes.sh').matchAll(/^traer\s+(\w+)\s+\S+\s+([0-9a-f]{40})/gm)) pines[m[1]] = m[2];
  const cab = lee('vendor/satellite.js').slice(0, 800);
  ok(pines.satjs && cab.includes(pines.satjs) && /satellite\.js 7\.1\.0/.test(cab) && /MIT/.test(cab),
     'vendor/satellite.js dice venir del commit que fija tools/satelites_fuentes.sh (' + (pines.satjs || '?').slice(0, 10) + '), satellite.js 7.1.0, MIT', cab.slice(0, 100));
  ok(fs.existsSync(path.join(RAIZ, 'vendor', 'LICENSE-satellite.txt')) && /MIT License/.test(lee('vendor/LICENSE-satellite.txt')), 'y lleva su licencia, vendor/LICENSE-satellite.txt');
  const SAT = require(path.join(RAIZ, 'vendor', 'satellite.js'));
  ok(['twoline2satrec', 'propagate', 'sgp4', 'gstime', 'eciToEcf', 'ecfToLookAngles', 'eciToGeodetic', 'sunPos', 'shadowFraction', 'jday'].every(f => typeof SAT[f] === 'function') && SAT.version === '7.1.0',
     'carga en Node y trae lo que usa el panel (twoline2satrec, propagate, gstime, eciToEcf, ecfToLookAngles, sunPos, shadowFraction…), version ' + SAT.version);
  /* los 33 casos oficiales, con el motor del repositorio */
  const VER = JSON.parse(lee('tools/sgp4_verificacion.json'));
  ok(pines.pysgp4 && (VER.fuente || '').includes(pines.pysgp4) && VER.casos.length === 33 && VER.casos.filter(c => c.esperaError).length === 1,
     'tools/sgp4_verificacion.json: los 33 casos de verificacion de SGP4 (uno espera el error 3), del commit de python-sgp4 que fija satelites_fuentes.sh');
  let n = 0, peor = 0; const malos = [];
  for (const c of VER.casos) {
    const rec = SAT.twoline2satrec(c.l1, c.l2);
    if (c.esperaError) { n++; const r = SAT.sgp4(rec, 0); if (rec.error !== c.esperaError && r !== null) malos.push(c.satnum + ': esperaba el error ' + c.esperaError + ' y da ' + rec.error); continue; }
    for (const f of c.filas) {
      const r = SAT.sgp4(rec, f[0]); n++;
      if (!r || !r.position) { malos.push(c.satnum + ' @' + f[0] + ': sin resultado (error ' + rec.error + ')'); continue; }
      const d = Math.max(Math.abs(r.position.x - f[1]), Math.abs(r.position.y - f[2]), Math.abs(r.position.z - f[3]));
      const dv = Math.max(Math.abs(r.velocity.x - f[4]), Math.abs(r.velocity.y - f[5]), Math.abs(r.velocity.z - f[6]));
      peor = Math.max(peor, d);
      if (d > 1e-6 || dv > 1e-7) malos.push(c.satnum + ' @' + f[0] + ': ' + d.toExponential(2) + ' km, ' + dv.toExponential(2) + ' km/s');
    }
  }
  ok(!malos.length && n === 97, 'el motor da los ' + n + ' vectores de verificacion (posicion y velocidad TEME) a 1e-6 km y 1e-7 km/s; desviacion maxima ' + peor.toExponential(1) + ' km', malos.slice(0, 3).join(' · '));
  if (fs.existsSync(path.join(FUENTES_SAT, 'satjs', 'src', 'index.ts')) && fs.existsSync(path.join(FUENTES_SAT, 'pysgp4', 'sgp4', 'tcppver.out'))) {
    let salida = '', rc = 0;
    try { salida = execFileSync('node', [path.join(RAIZ, 'tools', 'satelites_construir.js'), FUENTES_SAT, '--comprobar'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }); }
    catch (e) { rc = e.status || 1; salida = String(e.stdout || '') + String(e.stderr || ''); }
    ok(rc === 0, 'vendor/satellite.js, su licencia y sgp4_verificacion.json son exactamente los que salen de las fuentes (satelites_construir.js --comprobar, todos los instantes de tcppver.out)', salida.trim().split('\n').slice(-3).join(' | '));
  } else nota('sin las fuentes en ' + FUENTES_SAT + ': no se recompila el motor (bash tools/satelites_fuentes.sh ' + FUENTES_SAT + '; hace falta tsc)');
  /* datos/satelites.json */
  const suma = l => { let t = 0; for (const ch of l.slice(0, 68)) { if (/\d/.test(ch)) t += +ch; else if (ch === '-') t += 1; } return t % 10; };
  const epocaTle = l1 => { const aa = +l1.slice(18, 20), anio = aa < 57 ? 2000 + aa : 1900 + aa, dias = parseFloat(l1.slice(20, 32)); return new Date(Date.UTC(anio, 0, 1) + (dias - 1) * 864e5); };
  const ESPERADOS = [[25544, 'iss'], [48274, 'tiangong'], [20580, 'hubble']];
  const malSat = [];
  (SATJSON.sat || []).forEach(x => {
    if (x.l1.length !== 69 || x.l2.length !== 69) malSat.push(x.clave + ': lineas de ' + x.l1.length + '/' + x.l2.length);
    if (x.l1[0] !== '1' || x.l2[0] !== '2' || +x.l1.slice(2, 7) !== x.id || +x.l2.slice(2, 7) !== x.id) malSat.push(x.clave + ': numero de catalogo');
    if (suma(x.l1) !== +x.l1[68] || suma(x.l2) !== +x.l2[68]) malSat.push(x.clave + ': suma de control');
    if (Math.abs(epocaTle(x.l1) - new Date(x.epoca)) > 1000) malSat.push(x.clave + ': epoca ' + x.epoca + ' y la linea dice ' + epocaTle(x.l1).toISOString());
    if (new Date(x.epoca) > new Date(SATJSON.obtenido)) malSat.push(x.clave + ': epoca posterior a «obtenido»');
    const rec = SAT.twoline2satrec(x.l1, x.l2); if (rec.error) malSat.push(x.clave + ': el motor no lo traga (error ' + rec.error + ')');
  });
  ok(Array.isArray(SATJSON.sat) && SATJSON.sat.length === 3 && ESPERADOS.every(([id, k]) => SATJSON.sat.some(x => x.id === id && x.clave === k)) && SATJSON.maxDias === 7 && /celestrak/i.test(SATJSON.fuente || '') && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/.test(SATJSON.obtenido || '') && !malSat.length,
     'datos/satelites.json: la ISS (25544), Tiangong (48274) y el Hubble (20580), de CelesTrak, lineas de 69 caracteres con la suma de control, epoca la de la linea 1 (' + (SATJSON.sat || []).map(x => x.clave + ' ' + (x.epoca || '').slice(0, 16)).join(', ') + '), maxDias 7', malSat.join(' · '));
  const edad = (Date.now() - Math.max(...(SATJSON.sat || []).map(x => new Date(x.epoca).getTime()))) / 864e5;
  nota('los elementos del repositorio tienen ' + edad.toFixed(1) + ' dias' + (edad > 7 ? ': la app no ensenaria pasos con ellos hasta que el robot los renueve (.github/workflows/satelites.yml)' : ''));
  /* el robot, sin red: lo mismo que hay (no reescribe), una linea mal (no escribe), elementos mas viejos (se quedan los de antes) */
  {
    const os = require('os'), tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tgo-sat-')), tle = path.join(tmp, 'a.tle'), out = path.join(tmp, 'salida.json');
    const texto = SATJSON.sat.map(x => x.nombre + '\n' + x.l1 + '\n' + x.l2).join('\n') + '\n';
    const corre = (argumentos) => { const r = require('child_process').spawnSync('python3', ['-I', path.join(RAIZ, 'tools', 'satelites_traer.py')].concat(argumentos), { encoding: 'utf8' }); return { rc: r.status, txt: String(r.stdout || '') + String(r.stderr || '') }; };
    const ahora = new Date(new Date(SATJSON.obtenido).getTime() + 3600000).toISOString().replace(/\.\d{3}/, '');
    fs.writeFileSync(tle, texto);
    const r1 = corre(['--tle', tle, '--ahora', ahora, '--salida', out]);
    const escrito = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, 'utf8')) : null;
    ok(r1.rc === 0 && escrito && JSON.stringify(escrito.sat) === JSON.stringify(SATJSON.sat) && escrito.maxDias === 7 && escrito.obtenido === ahora,
       'el robot (satelites_traer.py --tle) escribe con esas lineas exactamente los mismos elementos que hay en datos/satelites.json', r1.txt.slice(-200));
    const r2 = corre(['--tle', tle, '--ahora', ahora, '--salida', out]);
    ok(r2.rc === 0 && /sin elementos nuevos/.test(r2.txt) && JSON.parse(fs.readFileSync(out, 'utf8')).obtenido === ahora, 'con los mismos elementos no reescribe el fichero (el robot no deja commits vacios)', r2.txt.slice(-200));
    const mala = texto.replace(SATJSON.sat[0].l2, SATJSON.sat[0].l2.slice(0, 20) + (SATJSON.sat[0].l2[20] === '5' ? '6' : '5') + SATJSON.sat[0].l2.slice(21));
    fs.writeFileSync(tle, mala);
    const antes = fs.readFileSync(out, 'utf8'), r3 = corre(['--tle', tle, '--ahora', ahora, '--salida', out]);
    ok(r3.rc !== 0 && /suma de control/.test(r3.txt) && fs.readFileSync(out, 'utf8') === antes, 'con una cifra cambiada en una linea (la suma de control ya no cuadra) sale con error y no toca el fichero', r3.txt.slice(-200));
    const vieja = texto.replace(SATJSON.sat[1].l1, SATJSON.sat[1].l1.slice(0, 20) + String(Math.max(1, parseInt(SATJSON.sat[1].l1.slice(20, 23), 10) - 3)).padStart(3, '0') + SATJSON.sat[1].l1.slice(23));
    const arregla = l => { let t = 0; for (const ch of l.slice(0, 68)) { if (/\d/.test(ch)) t += +ch; else if (ch === '-') t += 1; } return l.slice(0, 68) + (t % 10); };
    const viejaOk = vieja.split('\n').map(l => l.startsWith('1 ') || l.startsWith('2 ') ? arregla(l) : l).join('\n');
    fs.writeFileSync(tle, viejaOk);
    const r4 = corre(['--tle', tle, '--ahora', ahora, '--salida', out]);
    const tras = JSON.parse(fs.readFileSync(out, 'utf8'));
    ok(r4.rc === 0 && /mas viejos que los que hay/.test(r4.txt) && tras.sat[1].l1 === SATJSON.sat[1].l1, 'con elementos de tres dias antes para uno, avisa y se queda con los que habia', r4.txt.slice(-200));
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  /* el flujo, el service worker y el modulo */
  const wf = lee('.github/workflows/satelites.yml');
  ok((wf.match(/^\s+- cron: '/gm) || []).length === 2 && /workflow_dispatch/.test(wf) && /python3 tools\/satelites_traer\.py/.test(wf) && /git add datos\/satelites\.json/.test(wf) && /contents: write/.test(wf) && /concurrency:/.test(wf),
     '.github/workflows/satelites.yml: dos lineas de cron y a mano, corre el robot, guarda solo datos/satelites.json, con permiso de escritura y sin solaparse');
  const sw = lee('sw.js');
  ok(/'\.\/vendor\/satellite\.js'/.test(sw) && /'\.\/datos\/satelites\.json'/.test(sw) && /endsWith\('\/datos\/satelites\.json'\)/.test(sw),
     'sw.js: el motor y los elementos van en el precache, y los elementos se piden primero a la red (si la hay) para tenerlos frescos');
  ok(/var SAT_MIN_ALT = 10, SAT_SOL_BAJO = -6/.test(modulo) && /pedir\('\.\/datos\/satelites\.json'\)/.test(modulo) && /s\.src = '\.\/vendor\/satellite\.js'/.test(modulo) && !/https?:\/\/[^'"\s]*celestrak/i.test(modulo),
     'el modulo: 10° y Sol a −6°, lee los elementos y el motor de su propio dominio y no llama a CelesTrak desde el movil');
  ok(!/vendor\/satellite\.js/.test(index.replace(/<!--[\s\S]*?-->/g, '')), 'vendor/satellite.js no va en ninguna etiqueta de arranque de index.html (se pide al abrir el panel)');
  ok(/SAT_WP = \{ iss: \['International Space Station'\], tiangong: \['Tiangong space station'\], hubble: \['Hubble Space Telescope'\] \}/.test(modulo), 'la ficha pide a Wikipedia los articulos que son (International Space Station, Tiangong space station, Hubble Space Telescope)');
}

/* ════════ 12a. la noche guiada y el sistema solar, sin navegador ════════ */
titulo('12a. la noche guiada y el sistema solar hoy: los elementos de la JPL y lo fijo del modulo');
const ELEM = JSON.parse(lee('tools/elementos_planetas.json'));
/* la posicion heliocentrica con los elementos keplerianos de la JPL (Standish), en la ecliptica J2000: lo que la pagina de la JPL explica, tal cual */
function standish(nombre, fecha) {
  const el = ELEM.cuerpos[nombre], RAD = Math.PI / 180, jd = fecha.getTime() / 864e5 + 2440587.5, T = (jd - 2451545.0) / 36525;
  const a = el[0] + el[1] * T, e = el[2] + el[3] * T, I = el[4] + el[5] * T, L = el[6] + el[7] * T, wb = el[8] + el[9] * T, O = el[10] + el[11] * T;
  const w = wb - O; const M = ((L - wb) % 360 + 540) % 360 - 180, es = e / RAD; let En = M + es * Math.sin(M * RAD);
  for (let i = 0; i < 60; i++) { const dE = (M - (En - es * Math.sin(En * RAD))) / (1 - e * Math.cos(En * RAD)); En += dE; if (Math.abs(dE) < 1e-8) break; }
  const xp = a * (Math.cos(En * RAD) - e), yp = a * Math.sqrt(1 - e * e) * Math.sin(En * RAD);
  const cw = Math.cos(w * RAD), sw = Math.sin(w * RAD), cO = Math.cos(O * RAD), sO = Math.sin(O * RAD), cI = Math.cos(I * RAD), sI = Math.sin(I * RAD);
  const x = (cw * cO - sw * sO * cI) * xp + (-sw * cO - cw * sO * cI) * yp, y = (cw * sO + sw * cO * cI) * xp + (-sw * sO + cw * cO * cI) * yp, z = sw * sI * xp + cw * sI * yp;
  return { x, y, z, r: Math.hypot(x, y, z), lon: (Math.atan2(y, x) / RAD + 360) % 360 };
}
{
  const cuerpos = ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];
  ok(/ssd\.jpl\.nasa\.gov\/planets\/approx_pos/.test(ELEM.fuente || '') && cuerpos.every(b => Array.isArray(ELEM.cuerpos[b]) && ELEM.cuerpos[b].length === 12 && ELEM.cuerpos[b].every(Number.isFinite)) && ELEM.columnas.length === 12,
     'tools/elementos_planetas.json: los ocho planetas con sus 12 numeros (Tabla 1 de la JPL, 1800-2050), con la pagina de donde salen');
  /* la Tierra: afelio y perihelio de la tabla, 0,983 y 1,017 UA; y Mercurio excentrico (0,206) */
  const tierra = ELEM.cuerpos.Earth, merc = ELEM.cuerpos.Mercury;
  ok(Math.abs(tierra[0] * (1 - tierra[2]) - 0.9833) < 0.001 && Math.abs(tierra[0] * (1 + tierra[2]) - 1.0167) < 0.001 && Math.abs(merc[2] - 0.2056) < 0.001,
     'y dicen lo que dice cualquier libro: la Tierra entre 0,983 y 1,017 UA del Sol, Mercurio con excentricidad 0,206');
  /* los periodos con que el modulo muestrea cada orbita, contra la tercera ley de Kepler con la a de la JPL */
  const per = literal(modulo, 'var SIS_PERIODO = {') || {};
  const malP = cuerpos.filter(b => !per[b] || Math.abs(per[b] / (365.25636 * Math.pow(ELEM.cuerpos[b][0], 1.5)) - 1) > 0.005).map(b => b + ' ' + per[b]);
  ok(!malP.length && Object.keys(per).length === 8, 'los periodos siderales del modulo (SIS_PERIODO) cumplen la tercera ley de Kepler con la a de la JPL a menos del 0,5 %', malP.join(', '));
  ok(/A\.HelioVector\(A\.Body\[b\], t\)/.test(modulo) && /Rotation_EQJ_ECL\(\)/.test(modulo) && /A\.ObserverVector\(t, obs\(\), false\)/.test(modulo) && /SIS_CUERPOS = \['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'\]/.test(modulo),
     'el modulo saca las posiciones de HelioVector giradas a la ecliptica J2000, y Tenerife de ObserverVector; los ocho planetas');
  ok(/'tgo_cielo_brillo'/.test(modulo) && /'tgo_cielo_rojo_pista'/.test(modulo) && /setProperty\('--cielo-brillo'/.test(modulo) && /brightness\(var\(--cielo-brillo, 0\.82\)\)/.test(index) && /setAttribute\('content', '#2a0000'\)/.test(modulo),
     'la luz roja: el brillo y la pista se guardan en el movil, el filtro lee --cielo-brillo y la barra del sistema se pone en rojo oscuro');
  ok(/FICHEROS_PANEL = \['\.\/index\.html', '\.\/modulos\/cielo\.js', '\.\/vendor\/astronomy\.browser\.min\.js', '\.\/datos\/cielo\.json', '\.\/vendor\/satellite\.js', '\.\/datos\/satelites\.json'\]/.test(modulo),
     'la comprobacion de la cache mira los seis ficheros del panel (los mismos que precachea sw.js)');
  const CORE = (lee('sw.js').match(/const CORE = \[([\s\S]*?)\];/) || [, ''])[1];
  ok(['./index.html', './modulos/cielo.js', './vendor/astronomy.browser.min.js', './datos/cielo.json', './vendor/satellite.js', './datos/satelites.json'].every(f => CORE.includes("'" + f + "'")), 'y los seis estan en el CORE de sw.js');
}

/* ════════ 13a. las curiosidades: las cifras de la NASA y lo que dicen las frases ════════ */
titulo('13a. las curiosidades y la ficha del planeta: datos/planetas.json, su copia en el modulo y las frases');
const PLJ = JSON.parse(lee('datos/planetas.json'));
{
  const m = modulo.match(/var CIELO_PLANETAS = (\{.*\});\n/);
  let copia = null; try { copia = m && JSON.parse(m[1]); } catch (e) {}
  ok(copia && JSON.stringify(copia.cuerpos) === JSON.stringify(PLJ.cuerpos) && JSON.stringify(copia.sol) === JSON.stringify(PLJ.sol) && copia.fecha === PLJ.fecha,
     'CIELO_PLANETAS (modulos/cielo.js) es la copia exacta de datos/planetas.json (los nueve cuerpos y el Sol, con su fecha)');
  ok(/nssdc\.gsfc\.nasa\.gov\/planetary\/factsheet\/index\.html/.test(PLJ.url) && /^\d{4}-\d{2}-\d{2}$/.test(PLJ.fecha) && /sunfact\.html/.test(PLJ.sol.url) && /^\d{4}-\d{2}-\d{2}$/.test(PLJ.sol.fecha) && /^\d{4}-\d{2}-\d{2}$/.test(PLJ.leido),
     'el JSON dice de donde sale cada tabla (Planetary Fact Sheet y Sun Fact Sheet de la NSSDCA), de cuando es y cuando se leyo: ' + PLJ.fecha + ' / ' + PLJ.sol.fecha + ', leido el ' + PLJ.leido);
  const C = PLJ.cuerpos, PLANETAS = ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];
  const campos = ['diametro_km', 'gravedad_ms2', 'rotacion_h', 'dia_h', 'periodo_d', 'periodo_sideral_d', 'temp_c', 'oblicuidad_deg', 'lunas', 'anillos', 'velocidad_kms', 'masa_e24kg', 'densidad_kgm3'];
  const faltan = PLANETAS.filter(b => !C[b] || campos.some(k => C[b][k] === undefined || C[b][k] === null)).concat(!C.Moon || campos.filter(k => k !== 'periodo_sideral_d').some(k => C.Moon[k] === undefined || C.Moon[k] === null) ? ['Moon'] : []);
  ok(!faltan.length, 'los ocho planetas y la Luna con los campos que usan la ficha y las curiosidades', faltan.join(', '));
  /* los periodos orbitales de la NASA contra Kepler con la a de la JPL (elementos_planetas.json): P = 365,25636 · a^1,5 */
  const malK = PLANETAS.filter(b => !C[b].periodo_sideral_d || Math.abs(C[b].periodo_sideral_d / (365.25636 * Math.pow(ELEM.cuerpos[b][0], 1.5)) - 1) > 0.002).map(b => b + ' ' + C[b].periodo_sideral_d);
  ok(!malK.length, 'los ocho periodos siderales de la NASA (hoja de cada planeta) cumplen la tercera ley de Kepler con la a de la JPL a menos del 0,2 % (dos fuentes distintas, la misma fisica)', malK.join(', '));
  const malTrop = PLANETAS.filter(b => { const q = C[b].periodo_d / C[b].periodo_sideral_d; return !(q > 0.99 && q < 1.001); }).map(b => b + ' ' + C[b].periodo_d + '/' + C[b].periodo_sideral_d);
  ok(!malTrop.length && /anioDe\(p\)/.test(modulo) && /periodo_sideral_d \|\| p\.periodo_d/.test(modulo), 'la tabla resumen trae el periodo tropico (igual o algo menor, Neptuno 59.800 frente a 60.189); la app enseña como «un año» el sideral', malTrop.join(', '));
  /* la distancia media al Sol de la NASA contra la a de la JPL (menos del 1 %) */
  const malD = PLANETAS.filter(b => Math.abs(C[b].dist_sol_mkm / (ELEM.cuerpos[b][0] * 149.597870) - 1) > 0.01).map(b => b + ' ' + C[b].dist_sol_mkm);
  ok(!malD.length, 'y la distancia media al Sol de la NASA coincide con la a de la JPL a menos del 1 %', malD.join(', '));
  /* lo que afirma cada frase, en los numeros de los que sale */
  const min = k => PLANETAS.reduce((a, b) => C[b][k] < C[a][k] ? b : a), max = k => PLANETAS.reduce((a, b) => C[b][k] > C[a][k] ? b : a);
  const afirma = [
    [min('diametro_km') === 'Mercury' && max('velocidad_kms') === 'Mercury', 'Mercurio «el mas pequeño y el mas rapido»'],
    [Math.abs(C.Mercury.dia_h / 24 / C.Mercury.periodo_sideral_d - 2) < 0.005, 'el dia solar de Mercurio dura «dos de sus años», justos con el año sideral que enseña la app (' + (C.Mercury.dia_h / 24 / C.Mercury.periodo_sideral_d).toFixed(3) + ')'],
    [C.Venus.rotacion_h < 0 && C.Venus.oblicuidad_deg > 170 && PLANETAS.filter(b => C[b].rotacion_h < 0).join() === 'Venus,Uranus' && Math.abs(C.Venus.rotacion_h) / 24 > C.Venus.periodo_d && max('temp_c') === 'Venus' && C.Venus.temp_c > C.Mercury.temp_c && C.Venus.presion_bar > 50,
     'Venus «gira al reves, como Urano» (en la tabla solo ellos dos rotan en negativo), su vuelta dura mas que su año, «el mas caliente, mas que Mercurio», 92 bares'],
    [Math.abs(C.Mars.dia_h - 24) < 1 && C.Mars.lunas === 2, 'Marte: dia «casi como el nuestro», dos lunas'],
    [max('diametro_km') === 'Jupiter' && min('dia_h') === 'Jupiter', 'Jupiter «el mayor» y «el que mas deprisa gira»'],
    [C.Saturn.densidad_kgm3 < 1000 && max('lunas') === 'Saturn', 'Saturno «menos denso que el agua» y con mas lunas que ninguno'],
    [C.Uranus.oblicuidad_deg > 90 && C.Uranus.oblicuidad_deg < 100 && Math.abs(C.Earth.oblicuidad_deg - 23.4) < 0.1, 'Urano «tumbado» (97,8°) frente a los 23° de la Tierra'],
    [max('dist_sol_mkm') === 'Neptune' && min('temp_c') === 'Neptune' && Math.abs(C.Neptune.dist_sol_mkm * 1e6 / 299792.458 / 3600 - 4.18) < 0.05, 'Neptuno «el mas lejano» y «el mas frio»; su luz tarda 4 h 11 min'],
    [Math.abs(C.Moon.rotacion_h / 24 - C.Moon.periodo_d) < 0.05, 'la Luna: rotacion igual a su periodo orbital («la misma cara»)'],
    [Math.abs(C.Earth.velocidad_kms * 4 - 119) < 5, 'la Tierra recorre «mas de cien kilometros» en los segundos de leer una frase (29,8 km/s)'],
    [Math.abs(PLJ.sol.radio_x_tierra - 109.2) < 0.01 && PLJ.sol.masa_x_tierra === 332900 && Math.abs(PLJ.sol.rotacion_h / 24 - 25.4) < 0.05 && Math.abs(PLJ.sol.temp_k - 273.15 - 5500) < 60,
     'el Sol: 109 radios terrestres, 332.900 masas, 25,4 dias de rotacion, unos 5.500 °C'],
    [PLJ.sol.masa_e24kg / (PLJ.sol.masa_e24kg + PLANETAS.reduce((a, b) => a + C[b].masa_e24kg, 0)) > 0.99, 'y «mas del 99 %» de la masa del sistema solar (Sol frente a Sol + ocho planetas)']
  ];
  const malA = afirma.filter(x => !x[0]).map(x => x[1]);
  ok(!malA.length, 'las ' + afirma.length + ' comparaciones de las curiosidades se cumplen en las cifras de la NASA de las que salen', malA.join(' · '));
  /* las lluvias: el cuerpo padre del catalogo (IMO) y lo que dicen las frases */
  const LL = {}; D.lluvias.forEach(l => { LL[l.id] = l; });
  const padre = id => (LL[id].padre || [])[0] || '';
  const esCometa = p => /^(\d+P|[PCDXI])\//.test(p);
  const malLl = [];
  if (esCometa(padre('QUA')) || !/2003 EH1/.test(padre('QUA'))) malLl.push('QUA: ' + padre('QUA'));
  if (esCometa(padre('GEM')) || !/3200/.test(padre('GEM'))) malLl.push('GEM: ' + padre('GEM'));
  ['LYR', 'ETA', 'SDA', 'CAP', 'PER', 'DRA', 'ORI', 'LEO', 'URS'].forEach(id => { if (!esCometa(padre(id))) malLl.push(id + ': ' + padre(id)); });
  ['ETA', 'ORI'].forEach(id => { if (!/1P\/Halley/.test(padre(id))) malLl.push(id + ' no es de Halley'); });
  if (!/109P/.test(padre('PER')) || !/55P/.test(padre('LEO')) || !/21P/.test(padre('DRA')) || !/8P\/Tuttle/.test(padre('URS')) || !/96P/.test(padre('SDA')) || !/C\/1861 G1/.test(padre('LYR')) || !/169P/.test(padre('CAP'))) malLl.push('un cuerpo padre no es el de la NASA/IMO');
  ok(!malLl.length, 'el cuerpo padre de las once lluvias (lista de la IMO, en el catalogo) es el que dice la NASA: dos asteroides (2003 EH1, Faeton) y nueve cometas, Halley dos veces', malLl.join(' · '));
  const vmin = D.lluvias.reduce((a, l) => l.v < a.v ? l : a), vmax = D.lluvias.reduce((a, l) => l.v > a.v ? l : a);
  ok(vmin.id === 'DRA' && vmax.id === 'LEO' && LL.ETA.v >= 60 && LL.ORI.v >= 60, 'las Draconidas son «las mas lentas de esta lista» (' + vmin.v + ' km/s), las Leonidas «las mas rapidas de esta lista» (' + vmax.v + '), Eta Acuaridas y Orionidas a 60 o mas');
  /* las fuentes de cada curiosidad, en el modulo: https, y una por lluvia */
  const urls = (modulo.match(/FUENTES_LLU = \{([\s\S]*?)\n  \};/) || [, ''])[1];
  const sinFuente = D.lluvias.map(l => l.id).filter(id => !new RegExp('\\n    ' + id + ': \\[').test(urls));
  ok(!sinFuente.length && !/http:\/\//.test(urls), 'las once lluvias tienen su fuente (NASA, AMS, Wikipedia, UCM), todas https', sinFuente.join(', '));
  const txt = tablaModulo('CIELO_UI') || {};
  const cur = Object.keys(txt).filter(k => /^cieloCur(?!Fuente|Con[A-Z])[A-Z]/.test(k));   // las 88 de las constelaciones (cieloCurCon*) van en la parte 14a
  ok(cur.length === 26, '26 curiosidades en CIELO_UI (Sol, Luna, ocho planetas, tres satelites, once lluvias, el sur y la Polar)', cur.length + ': ' + cur.join(' '));
  ok(/'Cur' \+ c\.cuerpo/.test(modulo) && /'Cur' \+ l\.id/.test(modulo) && /SearchLunarApsis/.test(modulo) && /NextLunarApsis/.test(modulo) && /DEC_SUR = -40/.test(modulo) && /HIP_POLAR = 11767/.test(modulo),
     'el modulo saca la curiosidad del cuerpo y de la lluvia por su clave, el perigeo y el apogeo del motor, y el sur desde -40° de declinacion; la Polar por su HIP');
}

/* ════════ 14a. las 88 constelaciones: el JSON, su copia y lo que dicen las filas ════════ */
titulo('14a. las 88 constelaciones: datos/constelaciones.json, su copia en el modulo, las areas, los origenes');
{
  const CJ = JSON.parse(lee('datos/constelaciones.json'));
  const m = modulo.match(/var CIELO_CONS = (\{.*\});\n/);
  let copia = null; try { copia = m && JSON.parse(m[1]); } catch (e) {}
  const sinCitas = o => { const r = {}; for (const [a, c] of Object.entries(o)) { const x = Object.assign({}, c); delete x.cita; r[a] = x; } return r; };
  ok(copia && JSON.stringify(copia.con) === JSON.stringify(sinCitas(CJ.con)) && copia.leido === CJ.leido, 'CIELO_CONS (modulos/cielo.js) es la copia exacta de datos/constelaciones.json sin las citas (88 constelaciones)');
  const abs = Object.keys(CJ.con), cat = Object.keys(D.con);
  ok(abs.length === 88 && abs.every(a => D.con[a]) && cat.every(a => CJ.con[a]), 'las 88 abreviaturas son las del catalogo (datos/cielo.json)');
  const suma = abs.reduce((t, a) => t + CJ.con[a].area, 0);
  ok(Math.abs(suma - 41252.96) < 0.1, 'las 88 areas suman la esfera entera: ' + suma.toFixed(3) + ' grados cuadrados (4π sr = 41.252,96)');
  const porArea = abs.slice().sort((a, b) => CJ.con[b].area - CJ.con[a].area);
  const malR = porArea.filter((a, i) => CJ.con[a].rango !== i + 1);
  ok(!malR.length && CJ.con.Hya.rango === 1 && CJ.con.Cru.rango === 88, 'los puestos van del 1 (Hydra, ' + CJ.con.Hya.area + ') al 88 (Crux, ' + CJ.con.Cru.area + ') en el orden de las areas', malR.join(', '));
  const ORI = { ptolomeo: [47, null], keyser: [12, 1598], plancius: [4, null], hevelius: [7, 1690], lacaille: [14, 1756], argo: [3, 1756], vopel: [1, 1536] };
  const cuenta = {}; abs.forEach(a => { cuenta[CJ.con[a].origen] = (cuenta[CJ.con[a].origen] || 0) + 1; });
  const malO = abs.filter(a => { const c = CJ.con[a], o = ORI[c.origen]; return !o || (o[1] !== null && c.anio !== o[1]) || (c.origen === 'ptolomeo' && c.anio !== null) || (c.origen === 'plancius' && ![1589, 1592, 1613].includes(c.anio)); });
  ok(!malO.length && Object.keys(ORI).every(k => cuenta[k] === ORI[k][0]), 'el origen de cada una es una de siete categorias y el año cuadra: ' + Object.entries(cuenta).map(x => x.join(' ')).join(', '), malO.join(', '));
  ok(['Pup', 'Vel', 'Car'].every(a => CJ.con[a].origen === 'argo') && CJ.con.Com.origen === 'vopel' && CJ.con.Cru.anio === 1589 && CJ.con.Col.anio === 1592 && CJ.con.Cam.anio === 1613 && CJ.con.Mon.anio === 1613,
     'Puppis, Vela y Carina vienen de Argo Navis; Coma Berenices de Vopel; Crux 1589, Columba 1592, Camelopardalis y Monoceros 1613 (Plancius)');
  /* la estrella mas brillante de la lista de la UAI contra la del catalogo (HYG): el mismo nombre cuando el catalogo lo tiene */
  const iau = {}; for (const [h, n] of Object.entries(D.nombresIAU || {})) iau[Number(h)] = n;
  const est = {}; D.estrellas.forEach(e => { est[e.h] = e.n; });
  const norm = x => String(x).toLowerCase().replace(/[^a-z]/g, '');
  const excep = { Cas: 'γ Cas (variable, mag. 2,15 en HYG) frente a Schedar (2,24): las dos valen', Lib: 'Zubeneschamali (UAI) / Zubeneschemali (la tabla): la misma estrella',
                  Cen: 'Alpha Centauri (la tabla nombra el sistema) / Rigil Kentaurus (UAI, su estrella principal, α¹ Cen): la misma' };
  const malB = [], comparadas = [];
  for (const a of abs) {
    const b = CJ.con[a].brillante, alfa = D.con[a].alfa, n = iau[alfa] || est[alfa];
    if (/^[α-ω]/.test(b) || !n) continue;
    comparadas.push(a);
    if (norm(n) !== norm(b) && !excep[a]) malB.push(a + ': ' + b + ' / ' + n);
  }
  /* 51 comparadas: de las 88, 24 dan la mas brillante con letra griega y 13
     con un nombre que el catalogo no lleva (no salen desde Tenerife o la UAI
     las nombro en 2023-2025: Paradys, Xami, Uridim, Alaybasan...) */
  ok(!malB.length && comparadas.length >= 50, 'la estrella mas brillante de la lista de la UAI es la del catalogo en las ' + comparadas.length + ' que el catalogo nombra (salvo ' + Object.keys(excep).join(', ') + ', explicadas)', malB.join(' · '));
  /* de donde sale cada curiosidad: la pagina de Star Tales (Ian Ridpath) que se
     leyo; Corvus y Crater comparten una; Orion, cuya pagina no se dejo leer,
     sale de Wikipedia (ridpath null, wiki) */
  const pag = a => CJ.con[a].ridpath || CJ.con[a].wiki;
  const malU = abs.filter(a => { const c = CJ.con[a]; return c.ridpath ? (!/^https:\/\/www\.ianridpath\.com\/startales\/[a-z]+\.html?$/.test(c.ridpath) || !!c.wiki) : !/^https:\/\/en\.wikipedia\.org\/wiki\/\S+$/.test(c.wiki || ''); });
  ok(!malU.length && abs.filter(a => !CJ.con[a].ridpath).join() === 'Ori' && CJ.con.Crv.ridpath === CJ.con.Crt.ridpath && new Set(abs.map(pag)).size === 87,
     'cada una con la pagina de su curiosidad: Star Tales (Ian Ridpath) en 87 (Corvus y Crater comparten la suya) y Wikipedia en Orion: 87 paginas', malU.join(', '));
  ok(CJ.fuentes && /\/IAU_designated_constellations$/.test(CJ.fuentes.origen) && /\/IAU_designated_constellations_by_solid_angle$/.test(CJ.fuentes.area),
     'las dos tablas de la UAI en Wikipedia (el origen y el tamaño) estan en el JSON, y la ficha las enlaza');
  /* las fuentes de mas: la pagina de Wikipedia de una estrella cuya curiosidad
     corrige a Star Tales con un nombre que la UAI aprobo despues */
  const conMas = abs.filter(a => CJ.con[a].mas);
  const malMas = conMas.filter(a => !CJ.con[a].mas.every(f => Array.isArray(f) && f.length === 2 && /^Wikipedia: /.test(f[0]) && /^https:\/\/en\.wikipedia\.org\/wiki\/\S+$/.test(f[1])));
  ok(!malMas.length && conMas.join() === 'Lup,Tri', 'Lupus y Triangulum llevan ademas la pagina de su estrella mas brillante (Uridim, 2024; Alaybasan, 2025)', malMas.join(', ') + ' / ' + conMas.join(', '));
  const txt = CIELO_UI;
  const sinFila = abs.filter(a => !txt['cieloCurCon' + a] || IDI.some(l => !txt['cieloCurCon' + a][l]));
  ok(!sinFila.length, 'las 88 filas cieloCurCon* existen en los ' + IDI.length + ' idiomas (y la parte 3 ya miro sus diez idiomas)', sinFila.join(', '));
  /* un fichero por idioma (22-10-2026, tarde): las 88 van ahi y solo ahi */
  const claves88 = abs.map(a => 'cieloCurCon' + a);
  const malIdi = IDI.filter(l => { let d = null; try { d = JSON.parse(lee('idiomas/cielo/' + l + '.json')); } catch (e) {}
    return !d || Object.keys(d).join() !== claves88.join() || Object.values(d).some(v => typeof v !== 'string' || !v.trim() || /[<>]/.test(v)); });
  ok(!malIdi.length, 'idiomas/cielo/<l>.json en los ' + IDI.length + ' idiomas: las 88 claves en el orden de CIELO_CONS, cada una un texto sin etiquetas', malIdi.join(', '));
  const quedan = (modulo.match(/^\s*"cieloCurCon[A-Za-z]+"\s*:/gm) || []).length;
  ok(quedan === 0 && FILAS_EN_MODULO + 88 === Object.keys(CIELO_UI).length, 'y ninguna se queda en modulos/cielo.js: nadie las baja dos veces (CIELO_UI, ' + FILAS_EN_MODULO + ' filas)', quedan + ' filas cieloCurCon en el modulo');
  const sinCita = abs.filter(a => typeof CJ.con[a].cita !== 'string' || CJ.con[a].cita.length < 40 || !/«[^»]+»/.test(CJ.con[a].cita) || !/^(Star Tales, |Orion: )/.test(CJ.con[a].cita));
  ok(!sinCita.length && copia && abs.every(a => copia.con[a] && copia.con[a].cita === undefined), 'cada una con su cita en datos/constelaciones.json (lo que dice su pagina, entre «»), y la copia del modulo sin las citas', sinCita.join(', '));
  ok(/function rutaCurCon\(l\) \{ return '\.\/idiomas\/cielo\/' \+ l \+ '\.json'; \}/.test(modulo) && /var t = CUR_CON\[lang\(\)\];\s*if \(!t\) \{ S\.conFalta = true; cargarCurCon\(\); return null; \}/.test(modulo) && /cargarCurCon\(\);\n  \}\n  function cerrar\(\)/.test(modulo),
     'el modulo pide idiomas/cielo/<idioma de quien mira>.json al abrir el panel y, mientras no llega, la ficha sale sin curiosidad: nunca la de otro idioma');
  ok(/FICHEROS_PANEL\.concat\(\[rutaCurCon\(lang\(\)\)\]\)/.test(modulo), '«Antes de subir al Teide» cuenta tambien el fichero de las curiosidades del idioma');
  const RE_SW = '/\\/(idiomas\\/(etiquetas\\/|cielo\\/)?|faq\\/)[a-z]{2,3}\\.json$/';
  const reSw = /\/(idiomas\/(etiquetas\/|cielo\/)?|faq\/)[a-z]{2,3}\.json$/;
  ok(lee('sw.js').includes(RE_SW) && IDI.every(l => reSw.test('/tenerife-go/idiomas/cielo/' + l + '.json')) && !reSw.test('/tenerife-go/idiomas/cielo/fuentes.json'),
     'el service worker las sirve red primero y las guarda, como idiomas/<l>.json: en el Teide estan');
  const F = require('./fuente'), pi = F.porIdioma();
  ok(pi.length === 1 && pi[0].nombre === 'IDIOMAS_CIELO' && (pi[0].texto.match(/^    "cieloCurCon/gm) || []).length === 88 && F.html().includes('var IDIOMAS_CIELO = {'),
     'tools/fuente.js las junta en IDIOMAS_CIELO, 88 filas de diez idiomas, para las herramientas que barren el fuente');
  /* lo que las curiosidades dicen de Tenerife, contra el catalogo: la latitud
     del observatorio (datos/cielo.json, obs) y la declinacion de cada estrella.
     Culminacion al sur: 90 - lat + dec; paso por debajo del polo: dec - (90 - lat).
     Una frase nueva que nombre Tenerife sin entrar en esta tabla, sale en rojo. */
  const LAT = D.obs.lat, culm = dec => 90 - LAT + dec, bajo = dec => dec - (90 - LAT);
  const est1 = n => (D.estrellas.find(e => e.n === n) || {}).dec;
  const bay = b => (D.est.find(e => e[6] === b) || [])[1];
  const c80 = (D.objetos.find(o => o.id === 'C80') || {}).dec;
  const cruz = [].concat(...(D.lin.Cru || [])).map(q => culm(q[1])).sort((x, y) => x - y);
  const carro = ['α UMa', 'β UMa', 'γ UMa', 'δ UMa', 'ε UMa', 'ζ UMa', 'η UMa'].map(bay);
  const TF = {
    Car: [culm(est1('Canopus')) > 3 && culm(est1('Canopus')) < 15, 'Canopus culmina a ' + culm(est1('Canopus')).toFixed(1) + '° («asoma unos grados»)'],
    Cen: [culm(est1('Rigil Kentaurus')) > 0 && culm(est1('Rigil Kentaurus')) < 2 && Math.round(culm(c80)) === 14,
          'Rigil Kentaurus a ' + culm(est1('Rigil Kentaurus')).toFixed(1) + '° («apenas roza») y Omega Centauri a ' + culm(c80).toFixed(1) + '° («unos 14°»)'],
    Cru: [cruz.length === 4 && cruz[0] < 0 && cruz.slice(1).every(x => x > 0 && x < 5), 'la Cruz culmina a ' + cruz.map(x => x.toFixed(1)).join(', ') + '°: asoman tres, a menos de 5°, y Acrux no sale'],
    UMa: [carro.every(d => typeof d === 'number') && carro.some(d => bajo(d) < 0), 'del Carro se ponen ' + carro.filter(d => bajo(d) < 0).length + ' de sus 7 estrellas («una parte se esconde»)']
  };
  /* «ninguna tiene nombre»: solo si la lista de la UAI da su estrella mas
     brillante con letra griega (sin nombre propio). Star Tales es de antes de
     los nombres de 2022-2025, y asi salieron Uridim (Lupus) y Alaybasan
     (Triangulum), que la fila decia sin nombre. */
  const SIN_NOMBRE = /ninguna (?:de sus estrellas )?tiene nombre|no tiene nombre/;
  const dicenSin = abs.filter(a => SIN_NOMBRE.test((txt['cieloCurCon' + a] || {}).es || ''));
  const malSin = dicenSin.filter(a => !/^[α-ω]/.test(CJ.con[a].brillante));
  ok(!malSin.length && dicenSin.length >= 3, 'las ' + dicenSin.length + ' que dicen que sus estrellas no tienen nombre (' + dicenSin.join(', ') + ') tienen la mas brillante con letra griega en la lista de la UAI', malSin.map(a => a + ': ' + CJ.con[a].brillante).join(', '));
  const conTF = abs.filter(a => /Tenerife/.test((txt['cieloCurCon' + a] || {}).es || ''));
  const malTF = conTF.filter(a => !TF[a] || !TF[a][0]);
  ok(!malTF.length && conTF.join() === Object.keys(TF).join() && /14°/.test((txt.cieloCurConCen || {}).es || ''),
     'lo que dicen de Tenerife lo confirma el catalogo (latitud ' + LAT + '): ' + Object.values(TF).map(x => x[1]).join(' · '), 'mal: ' + malTF.join(', ') + ' · nombran Tenerife: ' + conTF.join(', '));
  ok(/datosConstelacion\(c\.ab, L\)/.test(modulo) && /datosConstelacion\(x\.ab, d\)/.test(modulo) && /curiosidadConstelacion\(c\.ab\)/.test(modulo),
     'la ficha y el catalogo llevan el origen y el tamaño, y la curiosidad sale por la abreviatura');
}

/* ════════ 15a. la noche guiada en voz alta, sin navegador ════════ */
titulo('15a. la noche guiada en voz alta: el lector de index.html, las voces del dispositivo y el plural de lo que se oye');
{
  /* el lector de los lugares (AUDIO-GUIA) es el que presta las voces */
  const LOCALE = literal(index, 'var TTS_LOCALE = {') || {};
  const ESPERA = { es: 'es-ES', en: 'en-GB', fr: 'fr-FR', de: 'de-DE', it: 'it-IT', nl: 'nl-NL', zh: 'zh-CN', zht: 'zh-TW', bg: 'bg-BG', pl: 'pl-PL' };
  ok(IDI.every(l => LOCALE[l] === ESPERA[l]) && Object.keys(LOCALE).length === IDI.length,
     'TTS_LOCALE (index.html): un codigo de voz por idioma de la app, los diez (' + IDI.map(l => LOCALE[l]).join(', ') + ')', JSON.stringify(LOCALE));
  const tts = index.slice(index.indexOf('AUDIO-GUIA TTS'), index.indexOf('BOTON WEBCAM URL'));
  ok(/window\.TG_VOZ = \{\s*locale: function \(lg\) \{ return TTS_LOCALE\[lg\] \|\| TTS_LOCALE\[ttsLang\(\)\]; \},\s*hayVoces: function \(\) \{ loadVoices\(\); return voices\.length > 0; \},\s*vozLocal: function \(lg\) \{ loadVoices\(\); return pickVoice\(TTS_LOCALE\[lg\] \|\| TTS_LOCALE\[ttsLang\(\)\], true\); \},\s*parar: ttsStop\s*\};/.test(tts)
     && (tts.match(/if \(soloLocal && voices\[i\]\.localService === false\) continue;/g) || []).length === 2 && /function pickVoice\(locale, soloLocal\)/.test(tts),
     'el lector de los lugares presta al cielo su codigo de idioma, sus voces y su «parar» (window.TG_VOZ); vozLocal solo da voces del dispositivo (localService), en las dos pasadas de pickVoice');
  /* el bloque de la voz en el modulo: sin red, solo voces del dispositivo */
  const vozSrc = modulo.slice(modulo.indexOf('/* ── LA NOCHE GUIADA EN VOZ ALTA'), modulo.indexOf('/* ── EL SISTEMA SOLAR HOY'));
  const red = ['fetch(', 'XMLHttpRequest', 'sendBeacon', 'WebSocket', 'import(', 'getVoices'].filter(x => vozSrc.includes(x));
  ok(vozSrc.length > 3000 && !red.length && /V\.vozLocal\(VOZ\.lang\)/.test(vozSrc) && /u\.lang = V\.locale\(VOZ\.lang\)/.test(vozSrc) && !/\.voice = (?!v;)/.test(vozSrc),
     'el modulo no pide nada a la red para leer y la unica voz que pone es la que da vozLocal (las del dispositivo)', red.join(', '));
  const pausa = Number((vozSrc.match(/var VOZ_PAUSA = (\d+)/) || [])[1]);
  ok(pausa === 30 && /T\('VozNota', \{ s: VOZ_PAUSA \}\)/.test(vozSrc) && /VOZ\.cuenta = VOZ_PAUSA/.test(vozSrc) && /\{s\} segundos/.test((CIELO_UI.cieloVozNota || {}).es || ''),
     'la pausa entre paradas (' + pausa + ' s) es la que dice la nota de debajo del boton');
  /* donde se para y donde se queda en pausa */
  const cuerpo = n => { const i = modulo.indexOf(n); return i < 0 ? '' : modulo.slice(i, modulo.indexOf('\n  }\n', i)); };
  const sitios = {
    'cerrar el panel → parar': /vozParar\(\);/.test(cuerpo('  function cerrar() {\n    var p = document.getElementById(\'cielo-panel\');')),
    'cambiar de noche → parar': /vozParar\(\);/.test(cuerpo('  function cambiarFecha(f) {')),
    'cambiar de idioma → parar': /TG_IDIOMA\.registrar\('cielo de Tenerife', function \(\) \{ vozParar\(\);/.test(modulo),
    '«Apunte al cielo» → pausa': /vozPausar\(\);/.test(cuerpo('  function abrirVista(opc) {')),
    'salir de «Esta noche» → pausa': /if \(S\.pestana !== 'noche'\) vozPausar\(\);/.test(cuerpo('  function pintar() {')),
    'la pagina oculta → pausa': /addEventListener\('visibilitychange', function \(\) \{ if \(document\.hidden\) vozPausar\(\); \}\)/.test(modulo),
    'otro lector corta la frase → pausa': /if \(er === 'interrupted' \|\| er === 'canceled'\) vozPausar\(\); else vozFallo\(\);/.test(vozSrc)
  };
  ok(Object.values(sitios).every(Boolean), 'se para al cerrar el panel, al cambiar de noche o de idioma; se queda en pausa al abrir «Apunte al cielo», al salir de «Esta noche», con la pagina oculta o si otro lector la corta',
     Object.entries(sitios).filter(([, v]) => !v).map(([k]) => k).join(' · '));
  ok(/\.cielo-voz-btns \{ display: flex;/.test(index) && /\.cielo-parada-activa \{/.test(index) && /navigator\.wakeLock\.request\('screen'\)/.test(vozSrc),
     'los botones y la parada que se lee tienen su estilo (index.html), y la pantalla no se apaga mientras lee (Wake Lock)');
  /* el plural de lo que se oye, en cada idioma, con la regla de CLDR
     (Intl.PluralRules) y con la de la app (PLURAL_FORMA de index.html) */
  const pfSrc = index.slice(index.indexOf('var PLURAL_FORMA = {'), index.indexOf('function plural(clave, n)'));
  const ctxPF = { currentLang: 'es' }; require('vm').runInNewContext(pfSrc, ctxPF);
  const formaApp = (l, n) => { ctxPF.currentLang = l; return ctxPF.pluralIdx(n, 3); };
  const malPF = [];
  for (let n = 0; n <= 230; n++) {
    const cat = new Intl.PluralRules('pl').select(n), esp = cat === 'one' ? 0 : cat === 'few' ? 1 : 2;
    if (formaApp('pl', n) !== esp) malPF.push('pl ' + n + ': ' + formaApp('pl', n) + ' y CLDR ' + cat);
    for (const l of ['es', 'en', 'fr', 'de', 'it', 'nl', 'bg']) { const e2 = n === 1 ? 0 : 1; if (formaApp(l, n) !== e2) malPF.push(l + ' ' + n); }
  }
  ok(!malPF.length, 'la regla de plural de la app (PLURAL_FORMA) es la de CLDR en polaco de 0 a 230 (1 · 2-4 salvo 12-14 · el resto) y la de dos formas en los demas', malPF.slice(0, 5).join(', '));
  const forma = (k, l, n) => { const v = (CIELO_UI[k] || {})[l] || '', f = v.split('|'); return f[Math.min(formaApp(l, n), f.length - 1)].split('{n}').join(String(n)); };
  const PALABRA = {
    cieloVozDonde: { es: ['1 grado ', '35 grados '], en: ['1 degree ', '35 degrees '], fr: ['1 degré ', '35 degrés '], de: ['1 Grad ', '35 Grad '], it: ['1 grado ', '35 gradi '],
                     nl: ['1 graad ', '35 graden '], zh: ['1度', '35度'], zht: ['1度', '35度'], bg: ['1 градус ', '35 градуса '], pl: ['1 stopień ', '35 stopni ', '32 stopnie ', '12 stopni ', '22 stopnie '] },
    cieloVozIntro: { es: ['1 parada.', '8 paradas,'], en: ['1 stop.', '8 stops,'], fr: ['1 étape.', '8 étapes,'], de: ['1 Station.', '8 Stationen,'], it: ['1 tappa.', '8 tappe,'],
                     nl: ['1 halte.', '8 haltes,'], zh: ['共1站', '共8站'], zht: ['共1站', '共8站'], bg: ['1 спирка.', '8 спирки,'], pl: ['1 przystanek.', '8 przystanków,', '3 przystanki,', '4 przystanki,', '5 przystanków,'] },
    cieloGuiaIntro: { pl: ['1 przystanek ', '8 przystanków ', '3 przystanki ', '4 przystanki ', '5 przystanków '] }
  };
  const malPal = [];
  for (const [k, porIdioma] of Object.entries(PALABRA)) for (const [l, lista] of Object.entries(porIdioma)) for (const esp of lista) {
    const n = Number(esp.match(/\d+/)[0]), t = forma(k, l, n);
    if (!t.includes(esp)) malPal.push(k + '.' + l + ' n=' + n + ': «' + t.slice(0, 70) + '» sin «' + esp.trim() + '»');
  }
  ok(!malPal.length, 'lo que se oye concuerda con el numero: «1 grado», «35 grados»; en polaco «1 stopień», «32 stopnie», «12 stopni», «3 przystanki», «5 przystanków» (VozDonde, VozIntro y la entrada de la tarjeta)', malPal.slice(0, 4).join(' · '));
  /* la hora va como etiqueta: «a las 01:10» seria «a la una» */
  const horaMal = ['cieloVozIntro', 'cieloVozHoraParada'].filter(k => /(?:las|la) \{t\}/.test((CIELO_UI[k] || {}).es || ''));
  ok(!horaMal.length && /Hora de referencia: \{t\}/.test((CIELO_UI.cieloVozIntro || {}).es || ''), 'la hora que se oye va como etiqueta («Hora de referencia: 21:40»), sin «a las»', horaMal.join(', '));
  /* el polaco que ya no concuerda mal (22-10-2026, septimo bloque): ningun
     numero que cambia lleva detras un sustantivo que tenga que concordar */
  const PL_MAL = /\{[a-z]+\}\s+(?:lat\b(?! temu)|Słońc\b|obiektów|gwiazd\b|gwiazdozbiorów|meteorów|stopni kwadratowych|dni\b|sekund\b|barów)/;
  const plMal = ['cieloFichaLuzAnio', 'cieloFichaLuzUnos', 'cieloFichaLum', 'cieloFichaEdadLuna', 'cieloOrbitaRapida', 'cieloDistancia', 'cieloNotaMessier', 'cieloLluviaThz', 'cieloConArea', 'cieloFichaDistLuna', 'cieloCurVenus', 'cieloGuiaIntro']
    .filter(k => PL_MAL.test((CIELO_UI[k] || {}).pl || '') || /widzisz|Dotknij|cię\b/.test((CIELO_UI[k] || {}).pl || '')
      || (k === 'cieloGuiaIntro' && ((CIELO_UI[k] || {}).pl || '').split('|').length !== 3));
  ok(!plMal.length, 'el polaco de las cifras: «Odległość w latach świetlnych: 8,6», «Zawiera: obiekty Messiera (109)…», la entrada de la noche guiada en tres formas; sin «8,6 lat» ni «594 stopni»', plMal.join(', '));
  /* lo que se oye, de usted en los diez idiomas (Jerome, 21-10-2026: «Usted en
     toda la app»): la voz no puede pasar del usted de las filas nuevas al tu
     de las de siempre en la misma parada. Las filas que se leen y las
     descripciones de CIELO_DESC (la parada de un objeto); los huecos ({dir})
     no cuentan. */
  const HABLADAS = ['cieloGuiaParada', 'cieloVozIntro', 'cieloVozDonde', 'cieloVozHoraParada', 'cieloVozFin', 'cieloGuiaLuna', 'cieloGuiaVenus', 'cieloGuiaMarte',
    'cieloGuiaJupiter', 'cieloGuiaSaturno', 'cieloGuiaMercurio', 'cieloGuiaPlanetaLuz', 'cieloGuiaObjeto', 'cieloGuiaVia', 'cieloGuiaPaso', 'cieloGuiaLluvia',
    'cieloFichaLuzAnio', 'cieloFichaLuzUnos', 'cieloIluminada', 'cieloEnCon'];
  const TU = {
    es: /(?<![\p{L}])(?:tú|ves|puedes|mira|espera|busca)(?![\p{L}])/iu, fr: /(?<![\p{L}])(?:tu|te|toi|ton|ta|tes|vois|regarde|attends)(?![\p{L}])/iu,
    de: /(?<![\p{L}])(?:du|dich|dir|dein\w*|schau|warte|siehst)(?![\p{L}])/iu, it: /(?<![\p{L}])(?:tu|ti|tuo|tua|vedi|puoi|guarda|aspetta)(?![\p{L}])/iu,
    nl: /(?<![\p{L}])(?:je|jij|jou|jouw)(?![\p{L}])/iu, bg: /(?<![\p{L}])(?:ти|теб|твой|твоя|виждаш|можеш|гледай|чакай)(?![\p{L}])/iu,
    pl: /(?<![\p{L}])(?:ty|ci|cię|twój|twoja|widzisz|poznasz|zobaczysz|patrz|czekaj|dotknij)(?![\p{L}])/iu, zh: /你/u, zht: /你/u
  };
  const DESC = tablaModulo('CIELO_DESC') || {};
  const tuMal = [];
  for (const [k, f] of HABLADAS.map(k => [k, CIELO_UI[k] || {}]).concat(Object.entries(DESC).map(([k, f]) => ['CIELO_DESC.' + k, f])))
    for (const [l, re] of Object.entries(TU)) { const t = String(f[l] || '').replace(/\{[a-z0-9]+\}/gi, ''); const m = t.match(re); if (m) tuMal.push(k + '.' + l + ': «' + m[0] + '»'); }
  ok(HABLADAS.every(k => CIELO_UI[k]) && Object.keys(DESC).length >= 12 && !tuMal.length,
     'lo que se oye va de usted en los diez idiomas: las ' + HABLADAS.length + ' filas que lee la voz y las ' + Object.keys(DESC).length + ' descripciones de CIELO_DESC, sin las marcas del tu', tuMal.slice(0, 6).join(' · '));
  /* «jakieś {n} lat temu» (FichaLuzUnos, de 100 años luz para arriba): la
     distancia va a dos cifras (distancia()), asi que acaba en 0 y en polaco
     es siempre «lat»; y la luz de la Luna, con dos decimales: «1,28 sekundy» */
  const fDist = (modulo.match(/function distancia\(al\) \{[\s\S]*?\n  \}/) || [''])[0];
  const distancia = new Function('numero', fDist + '; return distancia;')((x, d) => Number(x).toLocaleString('pl-PL', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }));
  const alts = D.estrellas.map(e => e.al).concat(D.est.map(e => e[5])).filter(a => a >= 100);
  const noLat = [...new Set(alts.map(a => distancia(a)))].filter(v => new Intl.PluralRules('pl').select(Number(v.replace(/\D/g, ''))) !== 'many');
  ok(alts.length > 500 && !noLat.length && /T\('FichaLuzUnos', \{ n: distancia\(e\.al\) \}\)/.test(modulo) && /s: numero\(dk \/ C, 2\)/.test(modulo) && / sekundy/.test((CIELO_UI.cieloFichaDistLuna || {}).pl || ''),
     'y «jakieś {n} lat temu» sale bien con las ' + alts.length + ' distancias del catalogo de 100 años luz para arriba (todas a dos cifras, acaban en 0: «lat»); la luz de la Luna va con dos decimales: «sekundy»', noLat.slice(0, 5).join(', '));
}

/* ════════ 16a. la revision del 22 de octubre, sin navegador ════════ */
titulo('16a. «Donde ir» contra sus fuentes, las normas del Parque Nacional, las fichas del Teide, la Luna en las lluvias y la letra');
{
  const es = k => (CIELO_UI[k] || {}).es || '';
  /* los textos, contra lo que dicen sus fuentes (REVISION-22-10-2026.md, 2.2) */
  ok(/queda por lo general muy por debajo de las cumbres/.test(es('cieloPorQueTxt')) && !/quedan por encima de la capa de inversión/.test(es('cieloPorQueTxt')),
     '«Por que»: la capa de inversion queda «por lo general» por debajo de las cumbres (el folleto del IAC: «generally remains well below the mountain peaks»)', es('cieloPorQueTxt').slice(0, 80));
  ok(/^La Ley del Cielo \(Ley 31\/1988\) y su reglamento protegen/.test(es('cieloLeyCielo')) && /El alumbrado exterior solo se regula en La Palma/.test(es('cieloLeyCielo')) && !/contaminación lumínica/.test(es('cieloLeyCielo')),
     'la Ley del Cielo: las rutas aereas van con su reglamento (R. D. 243/1992, art. 25) y el alumbrado solo se regula en La Palma y en la parte de Tenerife que se ve desde alli (la ley, en Tenerife, «excepto en lo concerniente a la iluminación de exteriores»)', es('cieloLeyCielo').slice(0, 90));
  const sit = [...((modulo.match(/var SITIOS = \[([\s\S]*?)\];/) || [, ''])[1]).matchAll(/'(Sitio\w+)'/g)].map(m => m[1]);
  ok(sit.slice(0, 5).join() === 'SitioUcanca,SitioRuleta,SitioParador,SitioGuajara,SitioTabonal' && /^Los cinco primeros/.test(es('cieloSitiosFuente')),
     'los cinco primeros sitios son los que recomienda Turismo de Tenerife en julio de 2023 (Guajara, el Parador, Ucanca, el Tabonal Negro y La Ruleta), y la nota dice «cinco»', sit.join(', '));
  ok(/^A 2\.390 m\./.test(es('cieloSitioIzanaTxt')) && /Las visitas son de día; de noche no se visita, y no se admiten menores de 8 años\./.test(es('cieloSitioIzanaTxt'))
     && / hay que reservar antes la zona de vivac en Tenerife ON\.$/.test(es('cieloSitioGuajaraTxt')) && / Tiene acreditación Starlight desde 2015\.$/.test(es('cieloSitioParadorTxt')),
     'Izaña a 2.390 m y de dia (Volcano Teide: «El observatorio no se puede visitar en horario nocturno.», «no admite menores de 8 años»); Guajara, con la zona de vivac reservada en Tenerife ON; el Parador, acreditado Starlight en 2015');
  /* las filas nuevas, en los diez idiomas y con sus cifras */
  const NUEVAS = ['cieloBrilloCielo', 'cieloRutaPaneles', 'cieloNormas', 'cieloNorma1', 'cieloNorma2', 'cieloNorma3', 'cieloNorma4', 'cieloNormasFuente',
                  'cieloEnlacePrug', 'cieloEnlaceAemetTeide', 'cieloEnlaceBrillo', 'cieloCondBuenasDesde', 'cieloCondBuenasHasta'];
  const faltaN = NUEVAS.filter(k => !CIELO_UI[k] || IDI.some(l => !String(CIELO_UI[k][l] || '').trim()));
  ok(!faltaN.length, 'las ' + NUEVAS.length + ' filas nuevas estan en los diez idiomas', faltaN.join(', '));
  const cifra = (k, re) => IDI.filter(l => !re.test(String((CIELO_UI[k] || {})[l] || '')));
  const malC = [].concat(cifra('cieloBrilloCielo', /21[,.]20[\s\S]*21[,.]70/).map(l => 'BrilloCielo.' + l), cifra('cieloNorma4', /\b30\b/).map(l => 'Norma4.' + l),
    cifra('cieloNorma1', /TF-21/).map(l => 'Norma1.' + l), cifra('cieloNormasFuente', /182\/2025[\s\S]*240[\s\S]*6\.2\.1[\s\S]*6\.2\.5[\s\S]*6\.3\.2\.5[\s\S]*6\.3\.2\.7[\s\S]*6\.3\.3/).map(l => 'NormasFuente.' + l));
  ok(!malC.length, 'y con sus cifras en los diez: el brillo del IAC (21,20 y 21,70), los 30 de un grupo, la TF-21 y el decreto con sus apartados', malC.join(', '));
  /* las normas, contra el decreto */
  const n1 = es('cieloNorma1');
  const sitiosTel = ['La Ruleta', 'Parador', 'Cañada Blanca', 'TF-21', 'estación base', 'Altavista', 'Minas de San José', 'Portillo Alto'];
  ok(sitiosTel.every(s => n1.includes(s)) && !/Ucanca|Tabonal|Guajara/.test(n1),
     'el telescopio, solo donde dice el 6.3.2.5 (' + sitiosTel.join(', ') + '); ni Ucanca, ni el Tabonal, ni Guajara', n1.slice(0, 120));
  ok(/linternas de mano y los frontales\. Los punteros láser, solo en las observaciones guiadas\./.test(es('cieloNorma2'))
     && /No se puede acampar ni dormir en el coche o la autocaravana\./.test(es('cieloNorma3')) && /zonas de vivac, con reserva previa en Tenerife ON/.test(es('cieloNorma3')) && !/permiso/.test(es('cieloNorma3') + es('cieloSitioGuajaraTxt'))
     && /grupos de 30 personas como máximo y guía acreditado/.test(es('cieloNorma4')),
     'las luces (6.2.5: linternas, frontales y laser solo guiado), dormir (6.2.1: ni acampada ni pernoctacion en vehiculos; el vivac, 6.3.2.7, con comunicacion previa: la reserva de Tenerife ON, no un «permiso») y las excursiones (6.3.3: grupos de 30 como maximo con guia acreditado)');
  /* la pestana pinta las normas, el brillo y la ruta, con sus enlaces */
  const donde = (modulo.match(/function pintarDonde\(c\) \{[\s\S]*?\n  \}\n/) || [''])[0];
  const URLS = {
    URL_PRUG: 'https://www.gobiernodecanarias.org/boc/2025/240/4148.html',
    URL_AEMET_TEIDE: 'https://www.aemet.es/documentos/es/eltiempo/prediccion/montana/boletin_montana/BM_Teide.pdf'
  };
  ok(Object.entries(URLS).every(([k, u]) => modulo.includes("var " + k + " = '" + u + "';"))
     && /var tn = tarjeta\(T\('Normas'\)\);/.test(donde) && /\['Norma1', 'Norma2', 'Norma3', 'Norma4'\]/.test(donde) && /T\('NormasFuente'\)/.test(donde)
     && /enlaces\(\[\['EnlacePrug', URL_PRUG\]\]\)/.test(donde) && /enlaces\(\[\['EnlaceAemetTeide', URL_AEMET_TEIDE\]\]\)/.test(donde)
     && /T\('BrilloCielo'\)/.test(donde) && /T\('RutaPaneles'\)/.test(donde),
     '«Donde ir» pinta la tarjeta de las normas (con el BOC), el enlace a la prediccion de AEMET bajo los consejos, el brillo del cielo y la ruta de los paneles');
  ok(donde.includes("['EnlaceBrillo', 'https://iac.es/en/observatorios-de-canarias/sky-quality/sky-quality-parameters/night-sky-background']")
     && donde.includes("['EnlaceEclipsesIgn', 'https://astronomia.ign.es/eclipses-de-sol-y-luna']") && donde.includes("['CreditoHyg', 'https://codeberg.org/astronexus/hyg']")
     && !/github\.com\/astronexus|web\/guest\/eclipses/.test(donde),
     'los enlaces: el brillo del cielo del IAC, los eclipses del IGN en su direccion de ahora y HYG en Codeberg (el GitHub esta archivado)');
  /* las seis fichas del Teide (index.html y los nueve idiomas), sin lo que la revision vio mal */
  const FT = ['pico-teide-cumbre', 'montana-blanca', 'mir-rambleta-teide', 'ruta-pico-viejo', 'sendero-pico-viejo', 'observatorio'];
  const descEs = id => (index.match(new RegExp('\\{ id:"' + id + '",[^\\n]*\\n\\s*desc:\\{ es:"((?:[^"\\\\]|\\\\.)*)" \\}')) || [, ''])[1];
  const MAL_ES = /Permiso gratuito|~\s?14\s?€|No requiere permiso|astroturismo nocturno|Mejor observatorio solar|Sendero 10 \(TF-6\)|mucho agua/;
  const malT = FT.filter(id => !descEs(id) || MAL_ES.test(descEs(id)) || (id !== 'observatorio' && !/Tenerife ON/.test(descEs(id))));
  ok(!malT.length && /de noche no se visita/.test(descEs('observatorio')) && /desde 42 € no residente y desde 10,50 € residente/.test(descEs('mir-rambleta-teide')),
     'las seis fichas del Teide, en castellano: la autorizacion en Tenerife ON (no «permiso gratuito»), el teleferico desde 42 € y desde 10,50 € (no «~14 €»; volcanoteide.com: «Price FROM»), Pico Viejo con reserva y el Observatorio de dia', malT.join(', '));
  const MAL_OTRO = /~\s?14\s?€|€\s?14\b|14\s?€\s|14 ?欧元|14 ?歐元|TF-6/;
  const malTi = [];
  for (const l of IDI.filter(l => l !== 'es')) {
    const J = JSON.parse(lee('idiomas/' + l + '.json'));
    for (const id of FT) { const t = (J[id] || {}).desc || ''; if (!t || MAL_OTRO.test(t) || (id !== 'observatorio' && !/Tenerife ON/.test(t)) || (id === 'observatorio' && !/volcanoteide\.com/.test(t))) malTi.push(l + '.' + id); }
  }
  ok(!malTi.length, 'y en los otros nueve idiomas (idiomas/<l>.json): Tenerife ON, sin el teleferico a 14 € ni el «TF-6»', malTi.join(', '));
  /* 24 de octubre de 2026 (AUDITORIA-FINAL.md, noveno bloque): lo que las fuentes cambiaron en
     estas fichas y en la de Las Narices. Las siete islas no se ven a la vez (Volcano Teide nombra
     cuatro, y las del oeste, desde el mirador de Pico Viejo, PNT 12); el crater de Pico Viejo esta
     a unos 3.100 m (Tenerife ON, PNT 09), no a 3.135; el PNT 07 ya pide reserva, con tarifa de 09:00
     a 17:00; y el «Sendero del Sanatorio a Pico Viejo» de 20 km no existe: el del Sanatorio es el
     PNT 16 */
  const FT2 = ['pico-teide-cumbre', 'montana-blanca', 'mir-rambleta-teide', 'ruta-pico-viejo', 'sendero-pico-viejo', 'mir-narices-teide'];
  const VIEJO = /siete islas|seven Canary|sept îles|sieben Kanarischen|sette isole|zeven Canarische|七座|седемте Канарски|siedem Wysp|3[.,  ]?135(?!\d)|360 ?°|360度|Sanatorio a Pico Viejo|20 km|5-10 ?°C|5至10|Menos concurrido|Less crowded|Moins fréquenté|Weniger überfüllt|Meno affollato|Minder druk|比泰德峰人少|По-малко посещаван|Mniej uczęszczany|七峡谷|七峽谷|toestemming vragen|vraagt (?:vooraf |een aparte )?toestemming/i;
  const textos = { es: {} };
  for (const id of FT2) textos.es[id] = descEs(id);
  for (const l of IDI.filter(l => l !== 'es')) { const J = JSON.parse(lee('idiomas/' + l + '.json')); textos[l] = {}; for (const id of FT2) textos[l][id] = (J[id] || {}).desc || ''; }
  const mal24 = [];
  for (const l of Object.keys(textos)) {
    const t = textos[l];
    for (const id of FT2) { const m = t[id].match(VIEJO); if (!t[id] || m) mal24.push(l + '.' + id + (m ? ' «' + m[0] + '»' : ' vacia')); }
    if (!/TF-21/.test(t['sendero-pico-viejo']) || !/PNT 04/.test(t['sendero-pico-viejo']) || !/4[.,]58/.test(t['sendero-pico-viejo'])) mal24.push(l + '.sendero-pico-viejo sin el PNT 16 (de la TF-21 al PNT 04, 4,58 km)');
    if (!/07:00/.test(t['montana-blanca']) || !/09:00/.test(t['montana-blanca']) || !/17:00/.test(t['montana-blanca'])) mal24.push(l + '.montana-blanca sin la reserva del PNT 07');
    if (!/PNT 12/.test(t['mir-rambleta-teide']) || !/0[.,]72/.test(t['mir-rambleta-teide'])) mal24.push(l + '.mir-rambleta-teide sin el mirador de Pico Viejo');
    if (!/3[., ]?100/.test(t['ruta-pico-viejo']) || !/800/.test(t['ruta-pico-viejo']) || !/3[., ]?100/.test(t['mir-narices-teide'])) mal24.push(l + ' sin el crater a unos 3.100 m');
  }
  ok(!mal24.length && /name:"Sendero del Sanatorio \(PNT 16\)", emoji:"[^"]*", color:"#6d4c41", lat:28\.253674, lng:-16\.625022,/.test(index)
     && !/zie je/.test(textos.nl['mir-narices-teide']) && /Ноздрите на Тейде · 2661 м/.test(lee('idiomas/bg.json')),
     'las fichas del Teide en los diez idiomas, con lo que dicen las fuentes del 24 de octubre: cuatro islas a la vista y no siete, el crater de Pico Viejo a unos 3.100 m, la reserva del PNT 07 y el Sanatorio, que es el PNT 16, con la salida de su mapa',
     mal24.slice(0, 8).join(' · '));
  /* las lluvias con la Luna arriba parte de la noche */
  ok(/if \(lunaAlt < 0 && luz >= 0\.3\) \{\s*var po = A\.SearchRiseSet\(A\.Body\.Moon, obs\(\), -1, n\.oscuro, n\.claro\.ut - n\.oscuro\.ut\);\s*if \(po && po\.ut < mejor\.u\) lunaPone = po\.date;/.test(modulo)
     && /T\('CondBuenasDesde', \{ h: hora\(e\.lunaPone\) \}\)/.test(modulo) && /T\('CondBuenasHasta', \{ h: hora\(e\.lunaSale\) \}\)/.test(modulo)
     && ['cieloCondBuenasDesde', 'cieloCondBuenasHasta'].every(k => IDI.every(l => /\{h\}/.test((CIELO_UI[k] || {})[l] || ''))) && !/ las \{h\}/.test(es('cieloCondBuenasDesde') + es('cieloCondBuenasHasta')),
     'lluvias: con la Luna a mas del 30 % y bajo el horizonte en el mejor momento, se dice desde que se pone o hasta que sale, con su hora entre parentesis (sin «a las», que con la 01:xx seria «a la»)');
  /* la letra: el bloque del final, a 11 px, y el contraste */
  const css = (index.match(/\/\* 22 de octubre, octavo bloque: ningun texto del panel por debajo de 11 px[\s\S]*?<\/style>/) || [''])[0];
  ok(/#cielo-panel \.cielo-pestanas button, #cielo-panel \.cielo-nota,[\s\S]*?\{ font-size: 0\.6875rem; \}/.test(css) && /#cielo-panel \.cielo-nota:not\(\.cielo-nota-aviso\),[\s\S]*?\{ color: rgba\(255,255,255,0\.62\); \}/.test(css)
     && /#cielo-panel \.cielo-enlaces button small \{ overflow-wrap: anywhere; \}/.test(css),
     'la letra del panel, a 0.6875rem (11 px) como minimo, lo que pide Apple para iOS («11 pt»); las notas, fuentes y direcciones, a 4,5:1; y las direcciones largas, cortadas dentro del boton (la medida, en la parte 16)');
  /* el trato de usted en las tarjetas de «Donde ir» */
  const TU = {
    fr: /(?<![\p{L}])(?:tu|te|toi|ton|ta|tes)(?![\p{L}])/iu,
    de: /(?<![\p{L}])(?:du|dich|dir|dein\w*|schau|nimm|prüfe|parke|bleib|fahr|schalte|nutze)(?![\p{L}])/iu,
    it: /(?<![\p{L}])(?:tu|ti|tuo|tua|vedi|porta|spegni|usa|parcheggia|esci|scendi|controlla|guarda|mostra|nascondi)(?![\p{L}])|di’/iu,
    nl: /(?<![\p{L}])(?:je|jij|jou|jouw)(?![\p{L}])/iu,
    bg: /(?<![\p{L}])(?:ти|теб|твой|твоя|виждаш|можеш|покажи|скрий|виж|вземи|изключи|паркирай|провери|гледай|чакай)(?![\p{L}])/iu,
    pl: /(?<![\p{L}])(?:ty|ci|cię|twój|twoja|twoim|weź|zgaś|parkuj|zjeżdżaj|sprawdź|patrz|pokaż|ukryj)(?![\p{L}])/iu,
    zh: /你/u, zht: /你/u
  };
  const DONDE = Object.keys(CIELO_UI).filter(k => /^cielo(PorQue|LeyCielo|BrilloCielo|Starlight|Sitio|Sitios|VerEnElMapa|VerEnMapa|Recorrido|RutaPaneles|Consejo|AvisoSol|Normas?|Equipo|CreditosTxt|CondBuenas)/.test(k));
  const tuD = [];
  /* los botones («Ver en el mapa», el recorrido) son rotulos: en italiano, bulgaro y polaco van en
     imperativo, como el resto de los botones de la app, y los mira tools/auditar_registro.js con
     ROTULOS_IT, ROTULOS_BG y ROTULOS_PL (23 de octubre de 2026, al juntar el octavo bloque) */
  const BOTON = /^cielo(VerEnElMapa|VerEnMapa|Recorrido)/;
  for (const k of DONDE) if (!BOTON.test(k)) for (const [l, re] of Object.entries(TU)) { const t = String(CIELO_UI[k][l] || '').replace(/\{[a-z0-9]+\}/gi, ''); const m = t.match(re); if (m) tuD.push(k + '.' + l + ': «' + m[0] + '»'); }
  ok(DONDE.length >= 40 && !tuD.length, 'las ' + DONDE.filter(k => !BOTON.test(k)).length + ' filas de «Donde ir» (con la Luna de las lluvias), de usted en los diez idiomas; los botones de la ficha, «Ver en el mapa del cielo» y el recorrido, en imperativo como los demas rotulos (auditar_registro.js)', tuD.slice(0, 6).join(' · '));
}

if (!PUERTO) {
  nota('sin puerto: se salta todo lo que va en el navegador (6 a 16)');
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
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium',
    args: ['--no-proxy-server', '--no-sandbox', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
  try {
    if (toca(6)) await calculos(b);
    if (toca(7)) await pantallas(b);
    if (toca(8)) await sinConexion(b);
    if (toca(9)) await apunta(b);
    if (toca(10)) await quejas(b);
    if (toca(11)) await satelites(b);
    if (toca(12)) await tercerBloque(b);
    if (toca(13)) await quintoBloque(b);
    if (toca(14)) await sextoBloque(b);
    if (toca(15)) await vozAlta(b);
    if (toca(16)) await octavoBloque(b);
  } finally { await b.close(); }
}

/* ── 16. la revision del 22 de octubre, en la pantalla ─────────────────────
   «Donde ir» en los diez idiomas: la tarjeta de las normas con sus cuatro
   frases y el enlace al BOC, los enlaces nuevos y los cambiados, sin texto
   roto, ningun texto por debajo de 11 px (tambien en «Esta noche») y ninguna
   direccion que se salga de su boton. Y las Perseidas de 2027 en el .ics de
   cada idioma: la Luna (86 %) se pone a las 03:58, hora de Canarias, y se
   dice «desde que se pone la Luna (03:58)»; las Cuadrantidas de 2027 (11 %),
   como antes. */
async function octavoBloque(b) {
  titulo('16. la revision del 22 de octubre en la pantalla: «Donde ir», la letra y la Luna de las lluvias, en los diez idiomas');
  const { ctx, p, err } = await abrirApp(b, 390, 844, null, false, { isMobile: true, hasTouch: true });
  await p.clock.setFixedTime(new Date('2026-10-22T21:00:00Z'));
  await p.evaluate(async () => { await window.TG_CIELO_CARGAR(); await TG_CIELO.cargar(); });
  const DIRS = ['www.gobiernodecanarias.org/boc/2025/240/4148.html', 'www.aemet.es/documentos/es/eltiempo/prediccion/montana/boletin_montana/BM_Teide.pdf',
                'iac.es/en/observatorios-de-canarias/sky-quality/sky-quality-parameters/night-sky-background', 'codeberg.org/astronexus/hyg', 'astronomia.ign.es/eclipses-de-sol-y-luna'];
  const malP = [], malL = [], resumen = [];
  for (const l of IDI) {
    const x = await p.evaluate(async ({ l, normas }) => {
      setLang(l); await TG_CIELO.ver('donde'); await new Promise(r => setTimeout(r, 300));
      const cuerpo = document.getElementById('cielo-cuerpo'), panel = document.getElementById('cielo-panel');
      const tarjetas = [...cuerpo.querySelectorAll('.cielo-tarjeta')];
      const tn = tarjetas.find(t => (t.querySelector('h3, .cielo-tarjeta-tit, .cielo-h') || t.firstElementChild || {}).textContent === normas) || tarjetas.find(t => t.textContent.indexOf(normas) === 0);
      const dirs = [...cuerpo.querySelectorAll('.cielo-enlaces button small')].map(s => s.textContent);
      const salen = [...cuerpo.querySelectorAll('.cielo-enlaces button')].filter(bt => bt.scrollWidth > bt.clientWidth + 1).map(bt => bt.textContent.slice(0, 40));
      const minimo = vista => { let m = 99, q = ''; const w = document.createTreeWalker(vista, NodeFilter.SHOW_TEXT); let n;
        while ((n = w.nextNode())) { if (!n.textContent.trim()) continue; const e = n.parentElement; const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue;
          const px = parseFloat(getComputedStyle(e).fontSize); if (px < m) { m = px; q = e.className + ' «' + n.textContent.trim().slice(0, 20) + '»'; } } return { m, q }; };
      const enDonde = minimo(panel);
      await TG_CIELO.ver('noche'); await new Promise(r => setTimeout(r, 300));
      const enNoche = minimo(panel);
      await TG_CIELO.ver('donde'); await new Promise(r => setTimeout(r, 200));
      return { normas: !!tn, li: tn ? tn.querySelectorAll('li').length : 0, texto: cuerpo.innerText, dirs, salen, enDonde, enNoche };
    }, { l, normas: (CIELO_UI.cieloNormas || {})[l] });
    if (!x.normas || x.li !== 4) malP.push(l + ': la tarjeta de las normas (' + x.li + ' frases)');
    const faltan = DIRS.filter(d => !x.dirs.includes(d));
    if (faltan.length) malP.push(l + ': faltan los enlaces ' + faltan.join(', '));
    if (/\{[a-z]+\}|undefined|NaN/.test(x.texto)) malP.push(l + ': texto roto');
    for (const k of ['cieloNorma1', 'cieloNorma2', 'cieloNorma3', 'cieloNorma4', 'cieloNormasFuente', 'cieloBrilloCielo', 'cieloRutaPaneles'])
      if (!x.texto.includes(CIELO_UI[k][l])) malP.push(l + ': no se ve ' + k);
    if (x.salen.length) malP.push(l + ': se sale del boton: ' + x.salen.join(' · '));
    if (x.enDonde.m < 10.99 || x.enNoche.m < 10.99) malL.push(l + ': ' + Math.min(x.enDonde.m, x.enNoche.m) + ' px (' + (x.enDonde.m < x.enNoche.m ? x.enDonde.q : x.enNoche.q) + ')');
    resumen.push(l + ' ' + x.enDonde.m + '/' + x.enNoche.m + ' px');
  }
  ok(!malP.length, '«Donde ir» en los diez idiomas: las normas del Parque (cuatro frases y su fuente), el brillo del cielo, la ruta de los paneles, los enlaces al BOC, a AEMET, al IAC, a Codeberg y al IGN, sin texto roto y sin direcciones que se salgan del boton', malP.slice(0, 4).join(' · '));
  ok(!malL.length, 'ningun texto del panel por debajo de 11 px, en «Donde ir» y en «Esta noche», en los diez idiomas (' + resumen.slice(0, 3).join(', ') + '…)', malL.slice(0, 4).join(' · '));
  /* las lluvias con la Luna arriba parte de la noche, en el .ics de cada idioma: las Leonidas
     de 2026 (la Luna al 58 % se pone a la 01:09) y las Perseidas de 2027 (al 86 %, a las 03:58),
     «desde que se pone»; las Draconidas de 2028 (al 77 %, sale a las 22:49), «hasta que sale»,
     la unica rama que no sale en el calendario de ahora; y las Cuadrantidas de 2027 (al 11 %),
     «Buenas condiciones» a secas. Las horas, del motor de la app (hora de Canarias). */
  const malI = [];
  for (const l of IDI) {
    const r = await p.evaluate((l) => {
      setLang(l);
      const ev = TG_CIELO.eventos('2027-06-01').concat(TG_CIELO.eventos('2026-11-01'));
      const ev28 = TG_CIELO.eventos('2028-07-01');
      const una = (lista, id, y) => lista.find(e => e.tipo === 'lluvia' && e.l.id === id && e.t.getUTCFullYear() === y);
      const des = e => { const m = /DESCRIPTION:([\s\S]*?)\r?\n[A-Z-]+[:;]/.exec(TG_CIELO.ics(e)); return m ? m[1].replace(/\r?\n /g, '').replace(/\\n/g, '\n').replace(/\\([,;\\])/g, '$1') : ''; };
      const de = e => e ? { pone: e.lunaPone && e.lunaPone.toISOString(), sale: e.lunaSale && e.lunaSale.toISOString(), d: des(e) } : null;
      return { leo: de(una(ev, 'LEO', 2026)), per: de(una(ev, 'PER', 2027)), dra: de(una(ev28, 'DRA', 2028)), qua: de(una(ev, 'QUA', 2027)) };
    }, l);
    const fila = (k, h) => (CIELO_UI[k] || {})[l].replace('{h}', h), buenas = (CIELO_UI.cieloCondBuenas || {})[l];
    for (const [n, x, pone, sale, texto] of [['las Leonidas de 2026', r.leo, '2026-11-18T01:09', null, fila('cieloCondBuenasDesde', '01:09')],
                                             ['las Perseidas de 2027', r.per, '2027-08-13T02:58', null, fila('cieloCondBuenasDesde', '03:58')],
                                             ['las Draconidas de 2028', r.dra, null, '2028-10-08T21:49', fila('cieloCondBuenasHasta', '22:49')]]) {
      if (!x || (pone ? !(x.pone || '').startsWith(pone) || x.sale : x.pone || !(x.sale || '').startsWith(sale))) malI.push(l + ': ' + n + ', la Luna ' + JSON.stringify(x && { pone: x.pone, sale: x.sale }));
      else if (!x.d.includes(texto)) malI.push(l + ': ' + n + ' no dicen «' + texto + '»');
    }
    if (!r.qua || r.qua.pone || r.qua.sale || !r.qua.d.includes(buenas)) malI.push(l + ': las Cuadrantidas no dicen «' + buenas + '» a secas');
  }
  ok(!malI.length, 'las lluvias con la Luna arriba parte de la noche, en el .ics de los diez idiomas: las Leonidas de 2026 y las Perseidas de 2027, «' + (CIELO_UI.cieloCondBuenasDesde || {}).es.replace('{h}', '03:58') + '» (la 01:09 y las 03:58, hora de Canarias); las Draconidas de 2028, «' + (CIELO_UI.cieloCondBuenasHasta || {}).es.replace('{h}', '22:49') + '»; las Cuadrantidas de 2027 (Luna al 11 %), «Buenas condiciones» a secas', malI.slice(0, 4).join(' · '));
  ok(!err.length, 'sin errores de pagina', err.slice(0, 3).join(' · '));
  await ctx.close();
}

/* La app abierta y el panel cargado. La bienvenida se pasa como lo hace
   barrido_pantallas.js; las nubes (Open-Meteo) no se piden: sin red de
   fuera, la tarjeta no sale, que es lo que tiene que pasar. */
async function abrirApp(b, ancho, alto, puerto, sw, opc, init) {
  const ctx = await b.newContext(Object.assign({ viewport: { width: ancho, height: alto }, serviceWorkers: sw ? 'allow' : 'block' }, opc || {}));
  const p = await ctx.newPage();
  const err = [];
  p.on('pageerror', e => err.push(e.message));
  await p.addInitScript(() => { try { localStorage.setItem('tenerife.tour.seen', '99'); localStorage.setItem('tgo_consent', JSON.stringify({ v: 'denied', t: Date.now() })); } catch (e) {} });
  if (init) await p.addInitScript(init);          // lo que la pagina tiene que encontrar ya puesto (la voz falsa de la parte 15)
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
        const ya = await Promise.all(['./modulos/cielo.js', './vendor/astronomy.browser.min.js', './datos/cielo.json', './index.html', './vendor/satellite.js', './datos/satelites.json'].map(u => caches.match(new URL(u, location.href).href)));
        if (ya.every(Boolean)) return { activo: !!reg.active };
        await new Promise(r => setTimeout(r, 200));
      }
      return { activo: !!reg.active, falta: true };
    });
    ok(listo.activo && !listo.falta, 'el service worker instala la app y deja el panel en el cache sin abrirlo', JSON.stringify(listo));
    /* las curiosidades de las constelaciones van un fichero por idioma: se
       guardan la primera vez que se abre el panel con conexion («abra el
       panel una vez con conexion y se guarda solo») */
    const cur = await p.evaluate(async () => {
      for (let i = 0; i < 50 && !navigator.serviceWorker.controller; i++) await new Promise(r => setTimeout(r, 100));
      await window.TG_CIELO_CARGAR(); TG_CIELO.abrir(); await TG_CIELO.curiosidades();
      const u = new URL('./idiomas/cielo/es.json', location.href).href;
      for (let i = 0; i < 50; i++) { if (await caches.match(u)) break; await new Promise(r => setTimeout(r, 100)); }
      TG_CIELO.cerrar();
      return { guardado: !!(await caches.match(u)), otro: !!(await caches.match(new URL('./idiomas/cielo/en.json', location.href).href)) };
    });
    ok(cur.guardado && !cur.otro, 'abierto una vez con conexion, el fichero de las curiosidades del idioma queda guardado (y solo el suyo)', JSON.stringify(cur));
    srv.kill(); await new Promise(r => setTimeout(r, 300));
    await p.reload({ waitUntil: 'load' });
    await p.waitForTimeout(1500);
    const r = await p.evaluate(async () => {
      if (typeof TG_CIELO_CARGAR !== 'function') return { app: false };
      try { await window.TG_CIELO_CARGAR(); await TG_CIELO.ver('noche', '2026-12-13'); } catch (e) { return { app: true, error: String(e) }; }
      const txt = document.getElementById('cielo-panel').innerText;
      await TG_CIELO.curiosidades();
      const ori = TG_CIELO.ficha({ con: 'Ori' }, new Date()).querySelector('.cielo-curio-txt');
      return { app: true, motor: typeof Astronomy !== 'undefined', datos: !!TG_CIELO.estado.datos, fallo: TG_CIELO.estado.fallo,
               luna: txt.includes(UI_TX.cieloLuna ? UI_TX.cieloLuna.es : 'Luna'), error: txt.includes(UI_TX.cieloErrorCarga.es),
               curiosidad: ori ? ori.innerText.length : 0 };
    });
    ok(r.app && r.motor && r.datos && !r.fallo && r.luna && !r.error, 'con el servidor apagado, el panel abre: motor, catalogo y la noche calculada', JSON.stringify(r));
    ok(r.curiosidad > 60, 'y la ficha de Orion lleva su curiosidad, sacada de lo guardado', JSON.stringify(r));
    /* 21 de octubre, tercer bloque: «Antes de subir al Teide» tiene que decir que esta guardado */
    const off = await p.evaluate(async () => {
      const espera = ms => new Promise(r => setTimeout(r, ms));
      const listo = await TG_CIELO.cacheListo();
      await TG_CIELO.ver('donde'); await espera(800);
      const e = document.querySelector('#cielo-cuerpo .cielo-offline');
      return { listo, texto: e ? e.innerText : '', ok: !!(e && e.classList.contains('cielo-offline-ok')) };
    });
    ok(off.listo === true && off.ok && /Guardado en el móvil/.test(off.texto), '«Antes de subir al Teide» comprueba la cache del movil y dice que el panel esta guardado', JSON.stringify(off));
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
   rechazarse) y texto con <script> (tiene que salir como texto). En
   frances no hay enlace: la ficha lo dice en frances, sin nada en ingles
   (Jerome, 21-10-2026). Y los enlaces al italiano no llegan (la red se
   corta): no se sabe, asi que no se dice nada ni se guarda. */
async function apunta(b) {
  titulo('9. «Apunte al cielo», la ficha y Wikipedia');
  const { ctx, p, err } = await abrirApp(b, 390, 844, null, false, { permissions: ['camera', 'accelerometer', 'gyroscope', 'magnetometer'], isMobile: true, hasTouch: true });
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
      if (l === 'it') return r.abort('internetdisconnected');
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
  pide('Betelgeuse', f.bet, 'Está a unos ' + num(dos(bet.al), 0) + ' años luz: la luz que ve salió de ella hace unos ' + num(dos(bet.al), 0) + ' años', mal);
  pide('Betelgeuse', f.bet, 'Brilla como unos ' + num(dos(bet.lum), 0) + ' soles', mal);
  pide('Betelgeuse', f.bet, 'Su brillo varía entre mag. ' + num(bet.vr[1], 1) + ' y ' + num(bet.vr[2], 1), mal);
  pide('Betelgeuse', f.bet, 'Altura máxima desde Tenerife: ' + num(bet.alt, 0) + '°', mal);
  pide('Betelgeuse', f.bet, 'Esta noche', mal); pide('Betelgeuse', f.bet, 'sale a las ', mal); pide('Betelgeuse', f.bet, 'se pone a las ', mal);
  pide('Sirio', f.sir, 'Está a ' + num(sir.al, 1) + ' años luz: la luz que ve salió de ella en ' + (f.anio - Math.round(sir.al)), mal);
  pide('Sirio', f.sir, 'Brilla como unos ' + num(dos(sir.lum), 0) + ' soles', mal);
  pide('Sirio', f.sir, 'Clase: enana, como el Sol', mal);
  pide('Sirio', f.sir, 'Es la estrella más brillante de Can Mayor', mal);
  if (/más brillante/.test(f.bet)) mal.push('Betelgeuse: dice que es la mas brillante de Orion, y es Rigel (HYG)');
  if (/varía/.test(f.sir)) mal.push('Sirio: dice que varía');
  pide('Luna', f.luna, 'A ' + num(Math.round(f.dLuna / 100) * 100, 0) + ' km: su luz tarda ' + num(f.dLuna / 299792.458, 2) + ' segundos', mal);
  pide('Luna', f.luna, 'Edad de la Luna: ', mal); pide('Luna', f.luna, '% iluminada', mal);
  pide('Sol', f.sol, 'Nunca mire el Sol', mal);
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
    const espera = async (e, ms) => { for (let i = 0; i < ms / 50; i++) { if (e.querySelector('.cielo-wiki-txt, .cielo-wiki-no') || e.__sin) return; await new Promise(r => setTimeout(r, 50)); } };
    const mira = e => { const w = e.querySelector('.cielo-wiki'); if (!w || !w.children.length) return null;
      const img = w.querySelector('img'), a = w.querySelector('a'), p = w.querySelector('.cielo-wiki-txt');
      return { txt: p ? p.textContent : '', lang: p ? p.getAttribute('lang') : null, img: img ? img.getAttribute('src') : null, href: a ? a.href : null, lic: (w.querySelector('.cielo-wiki-lic') || {}).textContent || '', scripts: w.querySelectorAll('script').length, cab: (w.querySelector('.cielo-wiki-cab') || {}).textContent || '', no: (w.querySelector('.cielo-wiki-no') || {}).textContent || '' }; };
    setLang('de');
    let e = TG_CIELO.ficha({ k: 'est', rec: bet, v: bet.v }, t); document.body.appendChild(e); await espera(e, 4000); out.de = mira(e); e.remove();
    setLang('en');
    e = TG_CIELO.ficha({ k: 'est', rec: bet, v: bet.v }, t); document.body.appendChild(e); await espera(e, 4000); out.en = mira(e); e.remove();
    e = TG_CIELO.ficha({ planeta: 'Jupiter' }, t); document.body.appendChild(e); await espera(e, 4000); out.jup = mira(e); e.remove();
    e = TG_CIELO.ficha({ k: 'est', rec: vega, v: vega.v }, t); document.body.appendChild(e); await new Promise(r => setTimeout(r, 1500)); out.vega = mira(e); e.remove();
    e = TG_CIELO.ficha({ k: 'est', rec: castor, v: castor.v }, t); document.body.appendChild(e); await espera(e, 4000); out.castor = mira(e); e.remove();
    setLang('fr');
    e = TG_CIELO.ficha({ k: 'est', rec: bet, v: bet.v }, t); document.body.appendChild(e); await espera(e, 4000); out.fr = mira(e); e.remove();
    setLang('it');
    e = TG_CIELO.ficha({ k: 'est', rec: bet, v: bet.v }, t); document.body.appendChild(e); await new Promise(r => setTimeout(r, 1500)); out.it = mira(e); e.remove();
    setLang('es');
    try { const c = JSON.parse(localStorage.getItem('tgo_cielo_wiki_v1') || '{}'); out.cache = Object.keys(c); out.cacheFr = (c['h27989|fr'] || {}).r || null; } catch (x) { out.cache = []; }
    return out;
  });
  ok(w.de && /Beteigeuze ist ein Roter Überriese/.test(w.de.txt) && w.de.txt.includes('<script>alert(1)</script>') && w.de.scripts === 0 && w.de.lang === 'de' &&
     w.de.img === null && w.de.href === 'https://de.m.wikipedia.org/wiki/Beteigeuze' && /CC BY-SA 4\.0/.test(w.de.lic) && !/englisch/i.test(w.de.cab),
     'en aleman: el resumen de de.wikipedia por los enlaces entre idiomas, el <script> como texto, la foto con URL no segura rechazada, el enlace y la licencia', JSON.stringify(w.de));
  ok(w.en && /red supergiant/.test(w.en.txt) && w.en.img === WIKI['en/Alpha_Orionis'].thumbnail.source && w.en.href === 'https://en.m.wikipedia.org/wiki/Betelgeuse',
     'en ingles: el resumen, la foto (upload.wikimedia.org) y el enlace', JSON.stringify(w.en));
  ok(w.fr && w.fr.no === 'Pas d’article dans votre langue.' && /Wikipédia/.test(w.fr.cab) && !w.fr.txt && w.fr.img === null && w.fr.href === null && !w.fr.lic && !/supergiant|anglais/i.test(JSON.stringify(w.fr)),
     'en frances, sin articulo en frances: lo dice en frances, y nada en ingles (ni texto, ni foto, ni enlace)', JSON.stringify(w.fr));
  ok(w.it === null && !w.cache.includes('h27989|it'), 'en italiano, sin red para los enlaces entre idiomas: no se sabe si hay articulo, asi que no se dice nada ni se guarda', JSON.stringify(w.it));
  ok(w.jup && /fifth planet/.test(w.jup.txt), 'Jupiter: el articulo del planeta', JSON.stringify(w.jup));
  ok(w.vega === null, 'Vega: «Alpha Lyrae» es una desambiguacion y «Vega» no es de astronomia en la respuesta falsa: no sale nada', JSON.stringify(w.vega));
  ok(w.castor && /sextuple star/.test(w.castor.txt), 'Castor: «Alpha Geminorum» lleva a la estrella', JSON.stringify(w.castor));
  ok(w.cacheFr && w.cacheFr.sin === true && !w.cacheFr.texto, 'y «no hay articulo en francés» se recuerda como tal (en el Teide, sin cobertura, se sigue diciendo), sin texto en ingles guardado', JSON.stringify(w.cacheFr));
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
    /* El Chromium de las pruebas desde el 30-10-2026 (el 153) tiene, como
       Safari, DeviceOrientationEvent.requestPermission, y la vista pide el
       permiso de los sensores. Por eso el contexto concede tambien los
       sensores (accelerometer, gyroscope, magnetometer) y no solo la camara:
       Playwright, al conceder una lista, deniega lo demas, y con el permiso
       denegado la vista no escucha (lo que pasaria en un movil que lo
       deniega). Y como la vista empieza a escuchar cuando el navegador
       contesta, unos milisegundos despues, se espera a que escuche
       (VS.tipoEv) antes de mandarle lecturas. */
    const VS = TG_CIELO.vista({ sinGuia: true });
    await espera(200); for (let i = 0; i < 100 && !VS.tipoEv && !VS.sinSensor; i++) await espera(20);
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
    const VS = TG_CIELO.vista({ evento: 'deviceorientation', sinGuia: true }); await espera(150); for (let i = 0; i < 100 && !VS.tipoEv && !VS.sinSensor; i++) await espera(20);
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
  const { ctx, p, err } = await abrirApp(b, 390, 844, null, false, { permissions: ['camera', 'accelerometer', 'gyroscope', 'magnetometer'], isMobile: true, hasTouch: true });
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
    if (!/^[A-Za-z0-9-]+@tenerifego\.app$/.test(get('UID'))) mal.push('UID ' + get('UID'));
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
    /* «Añadir a mi calendario» (22-10-2026): aqui no hay hoja de compartir,
       se descarga, y la nota de debajo dice cuando avisa (−1 dia) */
    const bc = fila && fila.querySelectorAll('.cielo-aviso-btns button')[0];
    out.calTxt = bc && bc.textContent;
    if (bc) { bc.click(); await espera(300); }
    out.notaCal = bc && bc.nextSibling && bc.nextSibling.classList && bc.nextSibling.classList.contains('cielo-nota-aviso') ? bc.nextSibling.textContent : null;
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
  ok(/Añadir a mi calendario/.test(av.calTxt || '') && /el día antes/.test(av.notaCal || '') && !/media hora/.test(av.notaCal || ''),
     '«Añadir a mi calendario» en las Geminidas: la nota dice que el calendario avisa el dia antes, que es su alarma (−1 dia)', av.notaCal);
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
    const A = Astronomy, D = TG_CIELO.estado.datos, o = new A.Observer(D.obs.lat, D.obs.lon, D.obs.h), out = {};
    let t = A.MakeTime(new Date());
    const VS = TG_CIELO.vista({}); await espera(300); for (let i = 0; i < 100 && !VS.tipoEv && !VS.sinSensor; i++) await espera(20);
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
    let ref = TG_CIELO.comprobar(); await espera(200);
    /* Con el Sol entre −3 y 8 grados (al amanecer y al atardecer) no hay con
       que comprobar, y la app lo dice. La prueba lo mira y sigue con el reloj
       de la pagina dos horas despues (o antes), con el Sol ya alto o la noche
       cerrada: si no, la parte entera dependia de la hora a la que se pasara
       (el 22 de octubre de 2026, al amanecer, se cayo leyendo ref.planeta). */
    const ahoraDeVerdad = Date.now;
    out.sinReferencia = null; out.relojMovido = 0;
    if (!ref) {
      out.sinReferencia = document.querySelector('#cielo-vista .cv-aviso').textContent;
      for (const m of [120, -120, 240, -240]) {
        Date.now = () => ahoraDeVerdad.call(Date) + m * 60000;
        ref = TG_CIELO.comprobar(); await espera(200);
        if (ref) { out.relojMovido = m; break; }
      }
      t = A.MakeTime(new Date(Date.now()));
    }
    out.ref = ref && TG_CIELO.cosa(ref).nombre;
    out.banner = document.querySelector('#cielo-vista .cv-comprobar').innerText;
    let h;
    if (ref.planeta) { const eq = A.Equator(A.Body[ref.planeta], t, o, true, true); const x = A.Horizon(t, o, eq.ra, eq.dec, 'normal'); h = { alt: x.altitude, az: x.azimuth }; }
    else { const x = A.Horizon(t, o, ref.est[0] / 15, ref.est[1], 'normal'); h = { alt: x.altitude, az: x.azimuth }; }
    /* lejos: 40 grados de cielo de verdad, «Ya» no corrige y lo dice. En altura y
       no en rumbo: 40 grados de rumbo son menos de cielo cuanto mas alta esta la
       referencia, y el 21-10-2026 a las 22:40, con la Luna a unos 52 grados,
       quedaban 24,6, dentro de los 25 que la app acepta: la app corrigio, como
       debe, y la prueba salio en rojo por la hora a la que se paso */
    evento(h.az, h.alt >= 0 ? h.alt - 40 : h.alt + 40); await espera(600);
    out.lejos = TG_CIELO.comprobarYa(); out.lejosAviso = document.querySelector('#cielo-vista .cv-aviso').textContent; out.lejosAjuste = TG_CIELO.ajuste();
    /* el movil apunta de verdad a la referencia; la brujula, 10 grados desviada, dice az+10 */
    evento(h.az + 10, h.alt); await espera(700);
    out.r = TG_CIELO.comprobarYa(); await espera(200);
    out.ajuste = TG_CIELO.ajuste(); out.aviso = document.querySelector('#cielo-vista .cv-aviso').textContent;
    out.chip = document.querySelectorAll('#cielo-vista .cv-chip')[1].textContent; out.bannerFuera = document.querySelector('#cielo-vista .cv-comprobar').hidden;
    out.guardado = localStorage.getItem('tgo_cielo_ajuste');
    await espera(700);
    out.centro = document.querySelector('#cielo-vista .cv-nombre').innerText;
    Date.now = ahoraDeVerdad;
    /* la captura con la camara falsa puesta */
    document.querySelectorAll('#cielo-vista .cv-btn')[1].click(); await espera(1200);
    const b = await TG_CIELO.capturarVista();
    out.cap = { type: b && b.type, size: b && b.size, video: !document.querySelector('#cielo-vista video').hidden };
    document.querySelectorAll('#cielo-vista .cv-btn')[1].click(); await espera(200);
    TG_CIELO.cerrarVista(); await espera(100);
    /* la segunda vez, sin guia; y la precision de iOS en el chip */
    const VS2 = TG_CIELO.vista({ evento: 'deviceorientation' }); await espera(200); for (let i = 0; i < 100 && !VS2.tipoEv && !VS2.sinSensor; i++) await espera(20);
    out.guia2 = !document.querySelector('#cielo-vista .cv-guia').hidden;
    const ev = new Event('deviceorientation'); Object.assign(ev, { alpha: 37, beta: 50, gamma: 0, absolute: false, webkitCompassHeading: 100, webkitCompassAccuracy: 15 }); window.dispatchEvent(ev);
    await espera(900);
    out.chipIOS = document.querySelectorAll('#cielo-vista .cv-chip')[1].textContent; out.chipTitulo = document.querySelectorAll('#cielo-vista .cv-chip')[1].title;
    TG_CIELO.cerrarVista();
    return out;
  });
  ok(vista.guia && vista.pasos === 3 && /Antes de apuntar/.test(vista.guiaTxt) && /imanes/.test(vista.guiaTxt) && /ocho/.test(vista.guiaTxt) && /Comprobar la brújula/.test(vista.guiaTxt) && /° al oeste/.test(vista.guiaTxt) && vista.guiaCerrada && vista.guiaGuardada === '1' && vista.guia2 === false,
     'la guia de 20 segundos sale la primera vez (imanes, el ocho, comprobar, la declinacion), «Entendido» la cierra y no vuelve a salir', JSON.stringify({ guia: vista.guia, pasos: vista.pasos, cerrada: vista.guiaCerrada, g: vista.guiaGuardada, g2: vista.guia2 }));
  if (vista.sinReferencia !== null) ok(/no hay nada brillante sobre el horizonte/.test(vista.sinReferencia) && vista.relojMovido !== 0,
     'con el Sol bajo no hay con que comprobar y la app lo dice («' + vista.sinReferencia.slice(0, 60) + '…»); la prueba sigue con el reloj ' + (vista.relojMovido / 60) + ' h movido', vista.sinReferencia);
  ok(/Comprobar la brújula/.test(vista.chipComprobar) && vista.ref && /dentro del círculo y toque «Ya»/.test(vista.banner) && vista.banner.includes(vista.ref),
     'con los sensores sale el chip «Comprobar la brújula»; al tocarlo pide poner ' + vista.ref + ' en el circulo', vista.banner);
  ok(vista.lejos === undefined || vista.lejos === null, 'a 40 grados, «Ya» no corrige nada', JSON.stringify(vista.lejos));
  ok(/queda a \d+° del círculo/.test(vista.lejosAviso) && Math.abs(vista.lejosAjuste) < 0.01, '…y lo dice: ' + vista.lejosAviso.slice(0, 70), JSON.stringify(vista.lejosAjuste));
  ok(vista.r && Math.abs(vista.r.dAz + 10) < 0.3 && Math.abs(vista.r.dAlt) < 0.3 && Math.abs(vista.ajuste + 10) < 0.3 && Math.abs(parseFloat(vista.guardado) + 10) < 0.3,
     'con la brujula 10° desviada y ' + vista.ref + ' en el circulo, «Ya» mide −10,0° y corrige el ajuste (guardado en el movil)', JSON.stringify({ r: vista.r, ajuste: vista.ajuste, guardado: vista.guardado }));
  ok(/iba 10° desviada/.test(vista.aviso) && / ✓$/.test(vista.chip) && vista.bannerFuera && vista.centro.includes(vista.ref),
     'lo dice («' + vista.aviso.slice(0, 40) + '…»), el chip queda «' + vista.chip + '» y el circulo ya nombra a ' + vista.ref, JSON.stringify({ aviso: vista.aviso, chip: vista.chip, centro: vista.centro }));
  ok(vista.cap.video && vista.cap.type === 'image/png' && vista.cap.size > 20000, 'la captura de la vista con la camara (falsa) debajo es un PNG (' + Math.round(vista.cap.size / 1024) + ' kB)', JSON.stringify(vista.cap));
  ok(/±15°/.test(vista.chipIOS) && /Precisión de la brújula: ±15°/.test(vista.chipTitulo), 'iOS: la precision de la brujula (webkitCompassAccuracy 15) sale en el chip: «' + vista.chipIOS + '»', vista.chipTitulo);
  /* La brujula muy torcida (24-10-2026, la prueba del Hubble de Jerome: con la
     Luna a 35 grados, el rumbo del movil iba 43 grados desviado, y «Ya» habria
     contestado «queda a 35° del circulo» con la Luna dentro). A esa hora y con
     esa Luna: con la altura bien, «Ya» corrige los 43 grados; con la altura 10
     grados mal, no, porque podria ser otra cosa; y mientras se comprueba con la
     Luna no hay flecha, que apuntaria justo a donde va desviado. */
  const torcida = await p.evaluate(async () => {
    const espera = ms => new Promise(r => setTimeout(r, ms));
    const A = Astronomy, D = TG_CIELO.estado.datos, o = new A.Observer(D.obs.lat, D.obs.lon, D.obs.h), out = {};
    const ahoraDeVerdad = Date.now, T0 = Date.parse('2026-10-24T20:05:00Z');
    const dec = TG_CIELO.declinacion(new Date(T0));
    const magnetico = az => (az - dec + 360) % 360;
    const evento = (az, alt) => { const ev = new Event('deviceorientationabsolute'); Object.assign(ev, { alpha: (360 - magnetico(az)) % 360, beta: 90 + alt, gamma: 0, absolute: true }); window.dispatchEvent(ev); };
    const t = A.MakeTime(new Date(T0)), eq = A.Equator(A.Body.Moon, t, o, true, true), x = A.Horizon(t, o, eq.ra, eq.dec, 'normal');
    out.luna = { alt: x.altitude, az: x.azimuth };
    const aviso = () => document.querySelector('#cielo-vista .cv-aviso').textContent;
    try {
      Date.now = () => T0;
      for (const [k, dAlt] of [['bien', 0], ['mal', 10]]) {
        TG_CIELO.cerrarVista(); try { localStorage.removeItem('tgo_cielo_ajuste'); } catch (e) {}
        const V = TG_CIELO.vista({ sinGuia: true }); await espera(300); for (let i = 0; i < 100 && !V.tipoEv && !V.sinSensor; i++) await espera(20);
        evento(x.azimuth + 43, x.altitude + dAlt); await espera(700);
        const ref = TG_CIELO.comprobar(); await espera(200);
        out[k] = { ref: ref && ref.planeta, flecha: !!(V && V.V && V.V.objetivo) };
        out[k].r = TG_CIELO.comprobarYa() || null; await espera(200);
        out[k].ajuste = TG_CIELO.ajuste(); out[k].aviso = aviso();
      }
    } finally { Date.now = ahoraDeVerdad; }
    TG_CIELO.cerrarVista(); try { localStorage.removeItem('tgo_cielo_ajuste'); } catch (e) {}
    return out;
  });
  ok(torcida.bien.ref === 'Moon' && !torcida.bien.flecha && torcida.bien.r && Math.abs(torcida.bien.r.dAz + 43) < 0.5 && Math.abs(torcida.bien.ajuste + 43) < 0.5 && /iba 43° desviada/.test(torcida.bien.aviso),
     'la brujula 43° torcida (la prueba del Hubble, 24-10-2026, con la Luna a ' + Math.round(torcida.luna.alt) + '°): con la Luna en el circulo y la altura bien, «Ya» corrige los 43° y lo dice; mientras se comprueba con la Luna no hay flecha', JSON.stringify(torcida.bien));
  ok(torcida.mal.ref === 'Moon' && !torcida.mal.r && Math.abs(torcida.mal.ajuste) < 0.01 && /queda a \d+° del círculo/.test(torcida.mal.aviso),
     '…y con la altura 10° mal no corrige nada (podria ser otra cosa) y lo dice: «' + torcida.mal.aviso.slice(0, 50) + '…»', JSON.stringify(torcida.mal));
  /* El aviso de un satelite en la sombra de la Tierra (24-10-2026: el Hubble
     entro en la sombra a las 21:03:16 y el aviso siguio con «siga la flecha»,
     sin decir que ya no se podia ver). Con los elementos de hoy: un momento en que
     un satelite esta alto y a oscuras, y otro en que esta alto y al Sol. */
  const sombraSat = await p.evaluate(async () => {
    const espera = ms => new Promise(r => setTimeout(r, ms));
    await TG_CIELO.satelites();
    const out = {}, ahoraDeVerdad = Date.now, t0 = ahoraDeVerdad.call(Date);
    let enSombra = null, alSol = null;
    for (const clave of ['iss', 'tiangong', 'hubble']) {
      for (let s = 0; s < 3 * 86400 && !(enSombra && alSol); s += 20) {
        const f = new Date(t0 + s * 1000), d = TG_CIELO.dondeSat(clave, f);
        if (!d || d.alt < 15) continue;
        if (!d.sol && !enSombra) enSombra = { clave, t: f.getTime(), alt: d.alt };
        if (d.sol && !alSol) alSol = { clave, t: f.getTime(), alt: d.alt };
      }
    }
    const banner = () => (document.querySelector('#cielo-vista .cv-objetivo') || {}).textContent || '';
    try {
      for (const [k, c] of [['sombra', enSombra], ['sol', alSol]]) {
        if (!c) { out[k] = null; continue; }
        Date.now = () => c.t;
        TG_CIELO.cerrarVista();
        TG_CIELO.vista({ objetivo: { sat: c.clave }, sinGuia: true }); await espera(900);
        out[k] = { clave: c.clave, alt: Math.round(c.alt), hora: new Date(c.t).toISOString().slice(0, 16), txt: banner() };
      }
    } finally { Date.now = ahoraDeVerdad; }
    TG_CIELO.cerrarVista();
    return out;
  });
  ok(sombraSat.sombra && /Ahora está en la sombra de la Tierra: no se ve/.test(sombraSat.sombra.txt) && !/siga la flecha|Ahí está/.test(sombraSat.sombra.txt),
     'un satelite alto y en la sombra de la Tierra (' + (sombraSat.sombra ? sombraSat.sombra.clave + ' a ' + sombraSat.sombra.alt + '°, ' + sombraSat.sombra.hora + ' UTC' : '?') + '): el aviso dice que no se ve, no «siga la flecha»', JSON.stringify(sombraSat.sombra));
  ok(sombraSat.sol && /siga la flecha|Ahí está/.test(sombraSat.sol.txt) && !/sombra/.test(sombraSat.sol.txt),
     '…y al Sol (' + (sombraSat.sol ? sombraSat.sol.clave + ' a ' + sombraSat.sol.alt + '°' : '?') + '), el aviso de siempre: «' + (sombraSat.sol ? sombraSat.sol.txt.slice(0, 50) : '') + '»', JSON.stringify(sombraSat.sol));
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

/* ── 11. la Estacion Espacial y los satelites, en el navegador ────────────
   El reloj de la pagina se pone a las 18:00 UTC del dia siguiente a la epoca
   mas nueva de datos/satelites.json: asi el control vale igual el dia que
   se corre, con los elementos que haya. La lista de pasos se recalcula aqui
   aparte (en Node): GMST y Sol de Astronomy Engine, ECEF y acimut/altura a
   mano, umbra cilindrica; la propagacion SGP4 es la misma biblioteca, ya
   cotejada en 11a con los vectores oficiales. */
async function satelites(b) {
  titulo('11. la Estacion Espacial y los satelites: pasos, tarjeta, calendario, carta, vista, ficha, .ics, avisos, idiomas');
  const { ctx, p, err } = await abrirApp(b, 390, 844, null, false, { permissions: ['camera', 'accelerometer', 'gyroscope', 'magnetometer'], isMobile: true, hasTouch: true });
  const epocaMax = Math.max(...SATJSON.sat.map(x => new Date(x.epoca).getTime()));
  const e = new Date(epocaMax), T0 = new Date(Date.UTC(e.getUTCFullYear(), e.getUTCMonth(), e.getUTCDate() + 1, 18, 0, 0));
  await p.clock.setFixedTime(T0);
  await p.evaluate(async () => { await window.TG_CIELO_CARGAR(); await TG_CIELO.cargar(); setLang('es'); TG_CIELO.estado.fecha = null; TG_CIELO.abrir(); await TG_CIELO.satelites(); });
  nota('reloj de la pagina: ' + T0.toISOString() + ' (epoca mas nueva ' + e.toISOString().slice(0, 16) + 'Z)');
  const r = await p.evaluate(() => {
    const S = TG_CIELO.estado, A = Astronomy, o = new A.Observer(S.datos.obs.lat, S.datos.obs.lon, S.datos.obs.h);
    const solAlt = d => { const t = A.MakeTime(d), eq = A.Equator(A.Body.Sun, t, o, true, false); return A.Horizon(t, o, eq.ra, eq.dec, '').altitude; };
    const pasos = TG_CIELO.pasosProximos().map(x => {
      const enMax = TG_CIELO.dondeSat(x.s.clave, x.max.t), enIni = TG_CIELO.dondeSat(x.s.clave, x.ini.t), enFin = TG_CIELO.dondeSat(x.s.clave, x.fin.t);
      return { sat: x.s.clave, ini: x.ini.t.getTime(), max: x.max.t.getTime(), fin: x.fin.t.getTime(), altIni: x.ini.alt, altMax: x.max.alt, altFin: x.fin.alt, azMax: x.max.az, dur: x.dur, desdeSombra: x.desdeSombra, aSombra: x.aSombra, crepIni: !!x.ini.crep, crepFin: !!x.fin.crep,
               solMax: enMax.sol, sombraMax: enMax.sombra, solIni: enIni.sol, solFin: enFin.sol, solObsIni: solAlt(x.ini.t), solObsFin: solAlt(x.fin.t), solObsMax: solAlt(x.max.t) };
    });
    return { fecha: S.fecha, ahora: Date.now(), sats: S.sat.datos.sat.map(x => ({ clave: x.clave, epoca: x.epocaMs, error: x.rec.error })), pasos, hoy: TG_CIELO.pasos(S.fecha).length };
  });
  ok(r.sats.length === 3 && r.sats.every(x => !x.error), 'los tres satelites cargan en el panel (' + r.sats.map(x => x.clave).join(', ') + ')', JSON.stringify(r.sats));
  ok(r.pasos.length >= 1, r.pasos.length + ' pasos visibles en las siete noches desde el ' + r.fecha + ' (' + r.hoy + ' esta noche)', 'ninguno: raro con tres satelites y siete noches');
  const malPaso = [];
  r.pasos.forEach((x, i) => {
    const q = x.sat + ' ' + new Date(x.max).toISOString().slice(0, 16);
    if (!(x.ini < x.max && x.max <= x.fin)) malPaso.push(q + ': orden de instantes');
    if (!(x.dur >= 20 && Math.abs((x.fin - x.ini) / 1000 - x.dur) < 1.5)) malPaso.push(q + ': duracion ' + x.dur);
    if (!(x.altMax >= 10 && x.altMax >= x.altIni - 0.01 && x.altMax >= x.altFin - 0.01)) malPaso.push(q + ': el maximo no es el maximo');
    /* ya arriba al oscurecer (o aun arriba al amanecer): el paso empieza (acaba) con el Sol a −6° */
    if (!x.desdeSombra && !x.crepIni && Math.abs(x.altIni - 10) > 0.3) malPaso.push(q + ': aparece a ' + x.altIni.toFixed(2) + '° y no a 10°');
    if (!x.aSombra && !x.crepFin && Math.abs(x.altFin - 10) > 0.3) malPaso.push(q + ': se pierde a ' + x.altFin.toFixed(2) + '° y no a 10°');
    if (x.crepIni && !(x.altIni >= 10 && Math.abs(x.solObsIni + 6) < 0.1)) malPaso.push(q + ': «ya arriba al oscurecer» sin el Sol a −6° (' + x.solObsIni.toFixed(2) + ')');
    if (x.crepFin && !(x.altFin >= 10 && Math.abs(x.solObsFin + 6) < 0.1)) malPaso.push(q + ': «se pierde en el amanecer» sin el Sol a −6° (' + x.solObsFin.toFixed(2) + ')');
    if (x.desdeSombra && !(x.altIni >= 10 && x.solIni)) malPaso.push(q + ': sale de la sombra pero no esta al Sol y arriba');
    if (x.aSombra && !(x.altFin >= 10 && x.solFin)) malPaso.push(q + ': entra en la sombra pero no esta al Sol y arriba');
    if (!(x.solMax && x.sombraMax < 1)) malPaso.push(q + ': en el maximo no esta al Sol');
    if (!(x.solObsIni < -5.95 && x.solObsFin < -5.95 && x.solObsMax < -6)) malPaso.push(q + ': el Sol del observador no esta bajo −6°');
    if (i && x.max < r.pasos[i - 1].max) malPaso.push(q + ': desordenado');
    if (x.fin < r.ahora - 3600000) malPaso.push(q + ': ya pasado');
  });
  ok(!malPaso.length, 'cada paso cumple la regla: aparece y se pierde a 10° (o en la sombra de la Tierra), el maximo es el mas alto, el satelite al Sol y el Sol del Teide bajo −6°, en orden y por venir', malPaso.slice(0, 4).join(' · '));
  /* la lista entera, recalculada aparte */
  const cruce = pasosAparte(T0, r.pasos);
  ok(!cruce.mal.length, 'recalculados aqui aparte (GMST y Sol de Astronomy Engine, ECEF y acimut/altura a mano, umbra cilindrica): los mismos ' + r.pasos.length + ' pasos a ±10 s y ±1,5° en el maximo (' + cruce.n + ' de los de aqui con mas de un minuto, todos en la app); acimut y altura en cada maximo a ' + cruce.peor.toFixed(3) + '°', cruce.mal.slice(0, 4).join(' · '));
  /* la tarjeta de esta noche y el filtro del calendario */
  const ui = await p.evaluate(async () => {
    const espera = ms => new Promise(r => setTimeout(r, ms));
    const S = TG_CIELO.estado, out = {};
    await TG_CIELO.ver('noche'); await espera(300);
    const h = [...document.querySelectorAll('#cielo-panel .cielo-tarjeta h3')].find(x => /🛰/.test(x.textContent)), t = h && h.closest('.cielo-tarjeta');
    out.tarjeta = t ? { texto: t.innerText, filas: t.querySelectorAll('.cielo-item').length, botones: t.querySelectorAll('button').length } : null;
    out.hoy = TG_CIELO.pasos(S.fecha).length;
    S.cal = 'satelites'; await TG_CIELO.ver('calendario'); await espera(300);
    const c = document.getElementById('cielo-cuerpo');
    out.cal = { filas: c.querySelectorAll('.cielo-item').length, noches: c.querySelectorAll('.cielo-mes-cab').length, texto: c.innerText, chip: !!document.querySelector('#cielo-panel .cielo-filtro[aria-pressed="true"], #cielo-panel button[aria-pressed="true"]') };
    out.n = TG_CIELO.pasosProximos().length;
    /* la septima noche, de Sol a −6° a Sol a −6°, como la calcula el panel */
    const A = Astronomy, o = new A.Observer(S.datos.obs.lat, S.datos.obs.lon, S.datos.obs.h);
    const t0 = A.MakeTime(new Date(Date.parse(S.fecha + 'T12:00:00Z') + 6 * 864e5)), tarde = A.SearchAltitude(A.Body.Sun, o, -1, t0, 1, -6), manana = tarde && A.SearchAltitude(A.Body.Sun, o, +1, tarde, 1, -6);
    out.ultimaFuera = !!manana && S.sat.datos.sat.some(s => Math.abs(manana.date.getTime() - s.epocaMs) > S.sat.datos.maxDias * 864e5);
    return out;
  });
  ok(ui.tarjeta && ui.tarjeta.filas === ui.hoy && /La Estación Espacial y otros satélites/.test(ui.tarjeta.texto) && /CelesTrak/.test(ui.tarjeta.texto) && /SGP4/.test(ui.tarjeta.texto) && (ui.hoy ? ui.tarjeta.botones === 3 * ui.hoy && /Aparece a las|Sale de la sombra|Ya arriba/.test(ui.tarjeta.texto) && /Más alto a las \d\d:\d\d: \d+°/.test(ui.tarjeta.texto) : /no pasa ninguno/.test(ui.tarjeta.texto)),
     'la tarjeta de «Esta noche»: ' + ui.hoy + ' paso(s) con sus tres botones, de donde salen los elementos y como se calcula', ui.tarjeta && ui.tarjeta.texto.slice(0, 200));
  ok(ui.cal.filas === ui.n && ui.n === r.pasos.length && ui.cal.noches >= 1 && ui.cal.noches <= 7 && /NOCHE DEL/.test(ui.cal.texto) && (!ui.ultimaFuera || /solo se calculan hasta 7 días/.test(ui.cal.texto)),
     'el calendario con el filtro «Satélites»: los ' + ui.n + ' pasos agrupados en ' + ui.cal.noches + ' noches' + (ui.ultimaFuera ? ', y dice que las ultimas noches se quedan sin elementos de menos de 7 dias' : ''), JSON.stringify({ filas: ui.cal.filas, n: ui.n, noches: ui.cal.noches }));
  /* la carta en el maximo del primer paso, la vista, la busqueda y la ficha */
  const primero = r.pasos[0];
  if (primero) {
    await p.clock.setFixedTime(new Date(primero.max));
    const carta = await p.evaluate(async (q) => {
      const espera = ms => new Promise(r => setTimeout(r, ms));
      const S = TG_CIELO.estado, out = { sat: q.sat };
      await TG_CIELO.ver('noche'); await espera(300);
      const h = [...document.querySelectorAll('#cielo-panel .cielo-tarjeta h3')].find(x => /🛰/.test(x.textContent));
      const bt = h && [...h.closest('.cielo-tarjeta').querySelectorAll('button')].find(b => /🗺/.test(b.textContent));
      if (!bt) return out; bt.click(); await espera(1200);
      out.pestana = S.pestana; out.sel = S.mapa.sel; out.t = S.mapa.t && new Date(S.mapa.t).getTime();
      const d = (S.mapa.dianas || []).find(x => x.sel && x.sel.sat === q.sat);
      if (d) {
        const cv = S.mapa.canvas, g = cv.getContext('2d'), im = g.getImageData(Math.max(0, Math.round(d.x) - 4), Math.max(0, Math.round(d.y) - 4), 9, 9).data;
        let mx = 0; for (let i = 0; i < im.length; i += 4) mx = Math.max(mx, im[i], im[i + 1], im[i + 2]);
        out.diana = { x: d.x, y: d.y, brillo: mx, dentro: d.x > 0 && d.y > 0 && d.x < cv.width && d.y < cv.height };
      }
      /* la ficha abierta en la carta */
      out.ficha = document.querySelector('#cielo-panel .cielo-ficha, #cielo-panel .cielo-hoja') ? document.querySelector('#cielo-panel .cielo-ficha, #cielo-panel .cielo-hoja').innerText : '';
      /* «Apunta al cielo»: los sensores al satelite */
      const x = TG_CIELO.dondeSat(q.sat, new Date()), dec = TG_CIELO.declinacion(new Date());
      const VS = TG_CIELO.vista({ sinGuia: true }); await espera(300); for (let i = 0; i < 100 && !VS.tipoEv && !VS.sinSensor; i++) await espera(20);
      const ev = new Event('deviceorientationabsolute'); Object.assign(ev, { alpha: (360 - ((x.az - dec + 360) % 360)) % 360, beta: 90 + x.alt, gamma: 0, absolute: true }); window.dispatchEvent(ev);
      await espera(900);
      out.centro = document.querySelector('#cielo-vista .cv-nombre').innerText;
      out.donde = { alt: x.alt, az: x.az, sol: x.sol };
      /* la busqueda encuentra al Hubble por su nombre y a la ISS por sus siglas */
      document.querySelectorAll('#cielo-vista .cv-btn')[2].click(); await espera(200);
      const inp = document.querySelector('#cielo-vista .cv-busqueda input');
      inp.value = 'Hubble'; inp.dispatchEvent(new Event('input')); await espera(100);
      out.buscaHubble = [...document.querySelectorAll('#cielo-vista .cv-busqueda-item')].map(x => x.textContent);
      inp.value = 'ISS'; inp.dispatchEvent(new Event('input')); await espera(100);
      const it = [...document.querySelectorAll('#cielo-vista .cv-busqueda-item')].find(x => /Estación Espacial Internacional/.test(x.textContent));
      out.buscaIss = !!it; if (it) it.click(); await espera(500);
      out.objetivo = document.querySelector('#cielo-vista .cv-objetivo') ? document.querySelector('#cielo-vista .cv-objetivo').innerText : '';
      TG_CIELO.cerrarVista(); await espera(100);
      /* la ficha de cada uno, con la hora del proximo paso */
      out.fichas = {};
      for (const s of S.sat.datos.sat) {
        const f = TG_CIELO.ficha({ sat: s.clave }, new Date()); out.fichas[s.clave] = f.innerText || f.textContent;
      }
      out.proximos = {}; S.sat.datos.sat.forEach(s => { const pr = TG_CIELO.pasosProximos().filter(z => z.s === s && z.fin.t > new Date())[0]; out.proximos[s.clave] = pr ? { h: pr.ini.t.getTime(), alt: Math.round(pr.max.alt) } : null; });
      return out;
    }, primero);
    const nom = { iss: 'Estación Espacial Internacional', tiangong: 'Estación espacial china Tiangong', hubble: 'Telescopio espacial Hubble' };
    ok(carta.pestana === 'mapa' && carta.sel && carta.sel.sat === primero.sat && Math.abs(carta.t - primero.max) < 1000 && carta.diana && carta.diana.dentro && carta.diana.brillo > 150,
       '«Ver en el mapa del cielo» abre la carta en el maximo del paso con ' + nom[primero.sat] + ' seleccionado y pintado (brillo ' + (carta.diana && carta.diana.brillo) + ')', JSON.stringify({ pestana: carta.pestana, sel: carta.sel, diana: carta.diana }));
    ok(carta.donde && carta.donde.alt > 10 && carta.donde.sol && carta.centro.includes(nom[primero.sat]) && /Satélite artificial/.test(carta.centro),
       '«Apunte al cielo» con los sensores hacia el satelite (' + carta.donde.alt.toFixed(0) + '° de altura) lo nombra en el circulo: «' + carta.centro.split('\n')[0] + '»', carta.centro);
    ok(carta.buscaHubble.some(x => /Telescopio espacial Hubble/.test(x)) && carta.buscaIss && /Estación Espacial Internacional/.test(carta.objetivo),
       'la busqueda encuentra «Hubble» y «ISS», y la flecha apunta a la Estacion', JSON.stringify({ h: carta.buscaHubble, iss: carta.buscaIss, obj: carta.objetivo.slice(0, 60) }));
    const hora = ms => new Intl.DateTimeFormat('es-ES', { timeZone: 'Atlantic/Canary', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(ms));
    const malF = [];
    for (const k of ['iss', 'tiangong', 'hubble']) {
      const f = carta.fichas[k], pr = carta.proximos[k];
      if (!f.includes(nom[k]) || !/Satélite artificial/.test(f) || !/A \d[\d.]* km de altura, a \d,\d km\/s/.test(f) || !/Elementos orbitales del/.test(f) || /undefined|NaN|\{/.test(f)) malF.push(k + ': ' + f.slice(0, 120));
      if (pr ? !(f.includes('Próximo paso visible') && f.includes('aparece a las ' + hora(pr.h)) && f.includes('sube hasta ' + pr.alt + '°')) : !/Sin pasos visibles/.test(f)) malF.push(k + ' proximo paso: ' + f.slice(0, 200));
    }
    ok(!malF.length, 'la ficha de cada uno: nombre, «Satélite artificial», altura y velocidad, el proximo paso visible (o que no hay en siete noches) y la fecha de los elementos', malF.join(' | '));
    /* el .ics y el aviso del primer paso */
    const ics = await p.evaluate(() => { const x = TG_CIELO.pasosProximos()[0]; TG_CIELO.quitarAvisos(); TG_CIELO.ponerAviso(x); const av = TG_CIELO.avisos(); const id = TG_CIELO.idEvento(x); TG_CIELO.quitarAvisos(); return { txt: TG_CIELO.ics(x), ini: x.ini.t.toISOString(), fin: x.fin.t.toISOString(), nAvisos: av.length, avId: av[0] && av[0].id, id }; });
    const des = []; for (const l of ics.txt.split('\r\n')) { if (l.startsWith(' ')) des[des.length - 1] += l.slice(1); else des.push(l); }
    const get = k => (des.find(l => l.startsWith(k + ':')) || '').slice(k.length + 1);
    const fechaIcs = d => new Date(d).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const malIcs = [];
    if (!/\r\n$/.test(ics.txt) || ics.txt.split('\r\n').some(l => Buffer.byteLength(l, 'utf8') > 75)) malIcs.push('CRLF o 75 octetos');
    if (get('DTSTART') !== fechaIcs(ics.ini) || get('DTEND') !== fechaIcs(ics.fin)) malIcs.push('DTSTART/DTEND ' + get('DTSTART') + ' ' + get('DTEND'));
    if (!des.includes('TRIGGER:-PT30M') || !/Dentro de media hora/.test(get('DESCRIPTION') + des.join('\n'))) malIcs.push('alarma: ' + des.filter(l => /TRIGGER|media hora/.test(l)).join(' '));
    if (!/paso visible/.test(get('SUMMARY')) || !new RegExp(nom[primero.sat]).test(get('SUMMARY'))) malIcs.push('SUMMARY ' + get('SUMMARY'));
    if (!/Aparece a las|Sale de la sombra|Ya arriba/.test(get('DESCRIPTION').replace(/\\n/g, '\n')) || !/Más alto/.test(get('DESCRIPTION')) || /undefined/.test(ics.txt)) malIcs.push('DESCRIPTION ' + get('DESCRIPTION').slice(0, 80));
    if (!/^paso-[a-z]+-\d{4}-\d\d-\d\dT\d\d@tenerifego\.app$/.test(get('UID'))) malIcs.push('UID ' + get('UID'));
    ok(!malIcs.length && ics.nAvisos === 1 && ics.avId === ics.id && /^paso\|[a-z]+\|\d{4}-\d\d-\d\dT\d\d$/.test(ics.id),
       'el .ics del paso: de la aparicion a la desaparicion, alarma media hora antes, el nombre y el detalle; y el aviso en la app se pone y se quita (id ' + ics.id + ')', malIcs.join(' | ') + ' avisos ' + ics.nAvisos);
    /* la nota al descargar el .ics de un paso (22-10-2026): decia «con un
       aviso el dia antes», y su alarma es media hora antes */
    const notaPaso = await p.evaluate(async () => {
      const espera = ms => new Promise(r => setTimeout(r, ms));
      TG_CIELO.estado.cal = 'satelites'; await TG_CIELO.ver('calendario'); await espera(300);
      const bc = [...document.querySelectorAll('#cielo-cuerpo .cielo-aviso-btns button')].find(x => /📅/.test(x.textContent));
      if (bc) { bc.click(); await espera(300); }
      return bc && bc.nextSibling && bc.nextSibling.classList && bc.nextSibling.classList.contains('cielo-nota-aviso') ? bc.nextSibling.textContent : null;
    });
    ok(/media hora antes/.test(notaPaso || '') && !/el día antes/.test(notaPaso || ''), '«Añadir a mi calendario» en un paso: la nota dice que el calendario avisa media hora antes, que es la alarma del .ics', notaPaso);
  }
  /* con elementos de diez dias: lo dice y no ensena pasos */
  await p.clock.setFixedTime(new Date(epocaMax + 10 * 864e5));
  const viejo = await p.evaluate(async () => {
    const espera = ms => new Promise(r => setTimeout(r, ms));
    const S = TG_CIELO.estado; S.fecha = null; S.sat.pasos = {}; TG_CIELO.cerrar(); TG_CIELO.abrir(); await TG_CIELO.ver('noche'); await espera(300);
    const h = [...document.querySelectorAll('#cielo-panel .cielo-tarjeta h3')].find(x => /🛰/.test(x.textContent)), t = h && h.closest('.cielo-tarjeta');
    const out = { tarjeta: t ? t.innerText : '', filas: t ? t.querySelectorAll('.cielo-item').length : -1, pasos: TG_CIELO.pasosProximos().length };
    S.cal = 'satelites'; await TG_CIELO.ver('calendario'); await espera(300);
    out.cal = document.getElementById('cielo-cuerpo').innerText; out.calFilas = document.querySelectorAll('#cielo-cuerpo .cielo-item').length;
    out.ficha = TG_CIELO.ficha({ sat: 'iss' }, new Date()).innerText;
    return out;
  });
  ok(viejo.filas === 0 && viejo.pasos === 0 && /solo se calculan hasta 7 días/.test(viejo.tarjeta) && viejo.calFilas === 0 && /solo se calculan hasta 7 días/.test(viejo.cal) && /Sin pasos visibles/.test(viejo.ficha) && !/km de altura/.test(viejo.ficha),
     'diez dias despues de la epoca, sin elementos nuevos: la tarjeta, el calendario y la ficha dicen que los pasos solo se calculan hasta 7 dias, y no ensenan ninguno ni posicion', JSON.stringify({ filas: viejo.filas, pasos: viejo.pasos, t: viejo.tarjeta.slice(0, 100), cal: viejo.cal.slice(0, 80) }));
  /* los diez idiomas: tarjeta, calendario, ficha y un paso en la carta, sin texto roto ni palabras repetidas */
  await p.clock.setFixedTime(T0);
  const idiomas = await p.evaluate(async (IDI) => {
    const espera = ms => new Promise(r => setTimeout(r, ms));
    const S = TG_CIELO.estado, out = {}; S.fecha = null; S.sat.pasos = {}; TG_CIELO.cerrar(); TG_CIELO.abrir();
    const x = TG_CIELO.pasosProximos()[0];
    for (const L of IDI) {
      setLang(L); await espera(50);
      await TG_CIELO.ver('noche'); await espera(150);
      const h = [...document.querySelectorAll('#cielo-panel .cielo-tarjeta h3')].find(y => /🛰/.test(y.textContent));
      const tarjeta = h ? h.closest('.cielo-tarjeta').innerText : '';
      S.cal = 'satelites'; await TG_CIELO.ver('calendario'); await espera(150);
      const cal = document.getElementById('cielo-cuerpo').innerText;
      const fichas = S.sat.datos.sat.map(s => TG_CIELO.ficha({ sat: s.clave }, new Date()).innerText).join('\n');
      const ics = x ? TG_CIELO.ics(x) : '';
      out[L] = { tarjeta, cal, fichas, ics, titulo: h ? h.textContent : '' };
    }
    setLang('es');
    return out;
  }, IDI);
  const malIdi = [];
  for (const L of IDI) {
    const t = idiomas[L], todo = [t.tarjeta, t.cal, t.fichas, t.ics].join('\n');
    if (!t.tarjeta || !t.cal || !t.fichas) malIdi.push(L + ': falta algo');
    if (/undefined|NaN|\{[a-z]+\}|\[object/.test(todo)) malIdi.push(L + ': texto roto');
    if (!/[^\x00-\x7F]/.test(t.titulo) && !['en', 'nl'].includes(L) && L !== 'it') { /* el titulo puede ser ASCII en algunos idiomas */ }
    const rep = todo.match(/\b([^\s\d]{2,} [^\s\d]{2,}) \1\b/u); if (rep) malIdi.push(L + ': «' + rep[0] + '» repetido');
    if (!/CelesTrak/.test(t.tarjeta) || !/SGP4/.test(t.tarjeta)) malIdi.push(L + ': la tarjeta no dice de donde salen los elementos');
    if (IDI.indexOf(L) && t.tarjeta === idiomas[IDI[0]].tarjeta) malIdi.push(L + ': la tarjeta sale igual que en ' + IDI[0]);
    if (!/TRIGGER:-PT30M/.test(t.ics)) malIdi.push(L + ': .ics sin la alarma de media hora');
  }
  ok(!malIdi.length, 'en los ' + IDI.length + ' idiomas: tarjeta, calendario, fichas y .ics sin texto roto, sin palabras repetidas (el rumbo lleva ya su preposicion) y cada uno en su idioma', malIdi.slice(0, 4).join(' · '));
  ok(!err.filter(e => !/Failed to fetch|NetworkError|ERR_/i.test(e)).length, 'sin errores de pagina', err.slice(0, 3).join(' · '));
  await ctx.close();
}

/* Los pasos recalculados aparte, en Node. Devuelve los fallos del cruce con
   la lista de la app (pasos), cuantos de los de aqui duran mas de un minuto
   y la peor diferencia de acimut/altura en los maximos de la app. */
function pasosAparte(T0, pasos) {
  const SAT = require(path.join(RAIZ, 'vendor', 'satellite.js')), A = require(path.join(RAIZ, 'vendor', 'astronomy.browser.min.js'));
  const OBS = D.obs, RAD = Math.PI / 180, RT = 6378.137, F = 1 / 298.257223563, obs = new A.Observer(OBS.lat, OBS.lon, OBS.h);
  const lat = OBS.lat * RAD, lon = OBS.lon * RAD, e2 = F * (2 - F), N = RT / Math.sqrt(1 - e2 * Math.sin(lat) ** 2), h = OBS.h / 1000;
  const RO = [(N + h) * Math.cos(lat) * Math.cos(lon), (N + h) * Math.cos(lat) * Math.sin(lon), (N * (1 - e2) + h) * Math.sin(lat)];
  const donde = (rec, d) => {
    const pv = SAT.propagate(rec, d); if (!pv || !pv.position) return null;
    const t = A.MakeTime(d), g = A.SiderealTime(t) * 15 * RAD, r = pv.position, c = Math.cos(g), s = Math.sin(g);
    const ecef = [c * r.x + s * r.y, -s * r.x + c * r.y, r.z], d3 = [ecef[0] - RO[0], ecef[1] - RO[1], ecef[2] - RO[2]];
    const ee = -Math.sin(lon) * d3[0] + Math.cos(lon) * d3[1];
    const nn = -Math.sin(lat) * Math.cos(lon) * d3[0] - Math.sin(lat) * Math.sin(lon) * d3[1] + Math.cos(lat) * d3[2];
    const uu = Math.cos(lat) * Math.cos(lon) * d3[0] + Math.cos(lat) * Math.sin(lon) * d3[1] + Math.sin(lat) * d3[2];
    const dist = Math.hypot(ee, nn, uu), alt = Math.asin(uu / dist) / RAD, az = (Math.atan2(ee, nn) / RAD + 360) % 360;
    const sv = A.RotateVector(A.Rotation_EQJ_EQD(t), A.GeoVector(A.Body.Sun, t, true)), sn = Math.hypot(sv.x, sv.y, sv.z), sh = [sv.x / sn, sv.y / sn, sv.z / sn];
    const dot = r.x * sh[0] + r.y * sh[1] + r.z * sh[2], perp = Math.hypot(r.x - dot * sh[0], r.y - dot * sh[1], r.z - dot * sh[2]);
    const eq = A.Equator(A.Body.Sun, t, obs, true, false), solAlt = A.Horizon(t, obs, eq.ra, eq.dec, '').altitude;
    return { alt, az, sol: !(dot < 0 && perp < RT), solAlt };
  };
  /* las siete noches desde la de T0 (hora canaria), cada una de Sol a −6° a Sol a −6° */
  const partes = new Intl.DateTimeFormat('en-GB', { timeZone: 'Atlantic/Canary', hour: 'numeric', hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(T0).reduce((o, x) => (o[x.type] = x.value, o), {});
  let dia0 = Date.UTC(+partes.year, +partes.month - 1, +partes.day, 12); if (+partes.hour < 7) dia0 -= 864e5;
  const noches = [];
  for (let i = 0; i < 7; i++) {
    const t0 = A.MakeTime(new Date(dia0 + i * 864e5)), tarde = A.SearchAltitude(A.Body.Sun, obs, -1, t0, 1, -6), manana = tarde && A.SearchAltitude(A.Body.Sun, obs, +1, tarde, 1, -6);
    if (tarde && manana) noches.push([tarde.date.getTime(), manana.date.getTime()]);
  }
  const mios = [];
  for (const s of SATJSON.sat) {
    const rec = SAT.twoline2satrec(s.l1, s.l2), ep = new Date(s.epoca).getTime();
    for (const [ini, fin] of noches) {
      if (Math.abs(ini - ep) > SATJSON.maxDias * 864e5 || Math.abs(fin - ep) > SATJSON.maxDias * 864e5) continue;
      const visible = ms => { const x = donde(rec, new Date(ms)); return !!x && x.alt >= 10 && x.sol && x.solAlt < -6; };
      let tramo = [];
      const cerrar = () => {
        if (!tramo.length) return; const m = tramo; tramo = [];
        let a = m[0], b = a - 10000; for (let i = 0; i < 20 && a - b > 500; i++) { const c = (a + b) / 2; if (visible(c)) a = c; else b = c; }
        let a2 = m[m.length - 1], b2 = a2 + 10000; for (let i = 0; i < 20 && b2 - a2 > 500; i++) { const c = (a2 + b2) / 2; if (visible(c)) a2 = c; else b2 = c; }
        let tMax = m[0], altMax = -99;
        for (let u = Math.max(ini, a); u <= Math.min(fin, a2); u += 1000) { const y = donde(rec, new Date(u)); if (y && y.alt > altMax) { altMax = y.alt; tMax = u; } }
        mios.push({ sat: s.clave, ini: Math.max(ini, a), max: tMax, altMax, fin: Math.min(fin, a2), dur: (Math.min(fin, a2) - Math.max(ini, a)) / 1000 });
      };
      for (let t = ini; t <= fin; t += 10000) { if (visible(t)) tramo.push(t); else cerrar(); }
      cerrar();
    }
  }
  const mal = []; let peor = 0;
  for (const x of pasos) {
    const m = mios.find(y => y.sat === x.sat && Math.abs(y.max - x.max) <= 10000);
    if (!m) { mal.push(x.sat + ' ' + new Date(x.max).toISOString().slice(0, 16) + ' no sale aqui'); continue; }
    /* si el maximo es el borde de la sombra (entra en ella subiendo, o sale
       bajando), su altura es la de ese instante, y aqui la sombra es un
       cilindro y en la app la umbra de satellite.js: unos segundos de
       diferencia, y el satelite sube medio grado por segundo (Hubble, 27 de
       octubre de 2026: 63,6° aqui y 65,4° en la app, 4 s). Ahi lo que se
       compara es la hora del borde (±10 s, abajo) y la posicion en el mismo
       instante (`peor`, 0,05°), no la altura maxima. */
    const enBorde = (x.aSombra && x.max === x.fin) || (x.desdeSombra && x.max === x.ini);
    if ((!enBorde && Math.abs(m.altMax - x.altMax) > 1.5) || Math.abs(m.ini - x.ini) > 10000 || Math.abs(m.fin - x.fin) > 10000) mal.push(x.sat + ' ' + new Date(x.max).toISOString().slice(0, 16) + ': aqui ' + m.altMax.toFixed(1) + '° ' + new Date(m.ini).toISOString().slice(11, 19) + '-' + new Date(m.fin).toISOString().slice(11, 19) + ' y en la app ' + x.altMax.toFixed(1) + '° ' + new Date(x.ini).toISOString().slice(11, 19) + '-' + new Date(x.fin).toISOString().slice(11, 19));
    const rec = SAT.twoline2satrec(SATJSON.sat.find(s => s.clave === x.sat).l1, SATJSON.sat.find(s => s.clave === x.sat).l2), y = donde(rec, new Date(x.max));
    const dAz = Math.abs(((y.az - x.azMax + 540) % 360) - 180);
    peor = Math.max(peor, Math.abs(y.alt - x.altMax), dAz * Math.cos(x.altMax * RAD));
  }
  if (peor > 0.05) mal.push('acimut/altura en los maximos a ' + peor.toFixed(3) + '° (mas de 0,05)');
  let n = 0;
  for (const m of mios) if (m.dur >= 60) { n++; if (!pasos.some(x => x.sat === m.sat && Math.abs(x.max - m.max) <= 10000)) mal.push(m.sat + ' ' + new Date(m.max).toISOString().slice(0, 16) + ' (' + Math.round(m.dur) + ' s, ' + m.altMax.toFixed(0) + '°) falta en la app'); }
  return { mal, n, peor, mios: mios.length };
}

/* ── 12. la noche guiada, el sistema solar, la luz roja completa y sin red ──
   El reloj de la pagina, como en la 11: las 18:00 UTC del dia siguiente a la
   epoca mas nueva de datos/satelites.json (asi la guia de esa noche puede
   llevar el paso de un satelite). Cada parada se recalcula aqui con el motor
   desde las coordenadas del catalogo; el sistema solar, en Node, con los
   elementos de la JPL. */
async function tercerBloque(b) {
  titulo('12. la noche guiada, el sistema solar hoy, la luz roja completa y sin red en el Teide');
  const { ctx, p, err } = await abrirApp(b, 390, 844, null, false, { permissions: ['camera', 'accelerometer', 'gyroscope', 'magnetometer'], isMobile: true, hasTouch: true });
  const epocaMax = Math.max(...SATJSON.sat.map(x => new Date(x.epoca).getTime()));
  const e0 = new Date(epocaMax), T0 = new Date(Date.UTC(e0.getUTCFullYear(), e0.getUTCMonth(), e0.getUTCDate() + 1, 18, 0, 0));
  await p.clock.setFixedTime(T0);
  await p.evaluate(async () => {
    try { localStorage.removeItem('tgo_cielo_rojo'); localStorage.removeItem('tgo_cielo_rojo_pista'); localStorage.removeItem('tgo_cielo_brillo'); } catch (e) {}
    await window.TG_CIELO_CARGAR(); await TG_CIELO.cargar(); setLang('es'); TG_CIELO.estado.fecha = null; TG_CIELO.estado.rojo = false; TG_CIELO.abrir(); await TG_CIELO.satelites();
  });
  nota('reloj de la pagina: ' + T0.toISOString());
  /* ── la noche guiada ── */
  const g = await p.evaluate(() => {
    const A = Astronomy, S = TG_CIELO.estado, D = S.datos, o = new A.Observer(D.obs.lat, D.obs.lon, D.obs.h);
    const tg = TG_CIELO.instanteGuia(), P = TG_CIELO.guia(), tm = A.MakeTime(tg), rot = A.Rotation_EQJ_HOR(tm, o);
    /* coordenadas J2000 del catalogo: el vector girado al horizonte de la fecha (precesion y nutacion dentro), con refraccion */
    const horV = (v, t) => { const r = A.RotateVector(t ? A.Rotation_EQJ_HOR(t, o) : rot, new A.Vector(v[0], v[1], v[2], tm)); const sph = A.HorizonFromVector(r, 'normal'); return { alt: sph.lat, az: sph.lon }; };
    const unit = (ra, dec) => { const a = ra * Math.PI / 180, d = dec * Math.PI / 180; return [Math.cos(d) * Math.cos(a), Math.cos(d) * Math.sin(a), Math.sin(d)]; };
    const hor = (ra, dec, t) => horV(unit(ra, dec), t);
    const cuerpo = (b, t) => { const eq = A.Equator(A.Body[b], t || tm, o, true, true); const h = A.Horizon(t || tm, o, eq.ra, eq.dec, 'normal'); return { alt: h.altitude, az: h.azimuth }; };
    const paradas = P.map(x => {
      let ind = null, extra = {};
      const t = x.t ? A.MakeTime(x.t) : tm;
      if (x.sel.planeta) { ind = cuerpo(x.sel.planeta, t); extra.mag = x.sel.planeta === 'Moon' ? null : A.Illumination(A.Body[x.sel.planeta], tm).mag; }
      else if (x.sel.k === 'est') { ind = hor(x.sel.rec.ra, x.sel.rec.dec, t); extra.hip = x.sel.rec.h; extra.m = x.sel.rec.m; }
      else if (x.sel.k) { ind = hor(x.sel.rec.ra, x.sel.rec.dec, t); extra.niv = x.sel.rec.niv; }
      else if (x.sel.con === 'Sgr') { ind = hor(266.405, -28.936, t); }
      else if (x.sel.sat) { const d = TG_CIELO.dondeSat(x.sel.sat, x.t); ind = d && { alt: d.alt, az: d.az }; extra.sol = d && d.sol; }
      else if (x.sel.v) { ind = horV(x.sel.v, t); }
      return { clave: x.clave, nombre: x.nombre, des: x.des || '', sub: x.sub, que: x.que || '', alt: x.h.alt, az: x.h.az, t: x.t ? x.t.toISOString() : null, ind, extra };
    });
    /* lo que deberia salir, calculado aparte: planetas por brillo, las tres estrellas mas brillantes altas */
    const pl = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'].map(b => ({ b, h: cuerpo(b), mag: A.Illumination(A.Body[b], tm).mag })).filter(x => x.h.alt >= 10 && x.mag <= 2).sort((a, b) => a.mag - b.mag).map(x => x.b);
    const es = D.estrellas.map(e => ({ h: e.h, m: e.m, alt: hor(e.ra, e.dec).alt })).filter(x => x.alt >= 15).sort((a, b) => a.m - b.m).slice(0, 3).map(x => x.h);
    const luna = cuerpo('Moon'), ilum = A.Illumination(A.Body.Moon, tm).phase_fraction;
    /* la tarjeta */
    const h3 = [...document.querySelectorAll('#cielo-panel .cielo-tarjeta h3')].find(x => /🌠/.test(x.textContent)), tarjeta = h3 && h3.closest('.cielo-tarjeta');
    return { tg: tg.toISOString(), paradas, pl, es, luna, ilum, tarjeta: tarjeta ? { texto: tarjeta.innerText, filas: tarjeta.querySelectorAll('.cielo-parada').length, botones: tarjeta.querySelectorAll('.cielo-parada button').length } : null };
  });
  const horaCan = iso => new Intl.DateTimeFormat('es-ES', { timeZone: 'Atlantic/Canary', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(iso));
  ok(g.paradas.length >= 3 && g.paradas.length <= 8, g.paradas.length + ' paradas para la noche del ' + g.tg.slice(0, 10) + ' a las ' + horaCan(g.tg) + ' (' + g.paradas.map(x => x.clave + ':' + x.nombre).join(', ') + ')');
  const ORDEN = ['luna', 'planeta', 'estrella', 'objeto', 'via', 'paso', 'lluvia'], UMBRAL = { luna: 5, planeta: 10, estrella: 15, objeto: 20, via: 10, paso: 10, lluvia: 10 };
  const malG = [];
  g.paradas.forEach((x, i) => {
    if (i && ORDEN.indexOf(x.clave) < ORDEN.indexOf(g.paradas[i - 1].clave)) malG.push(x.nombre + ': fuera de orden');
    if (!x.ind) malG.push(x.nombre + ': sin posicion aparte');
    else { const dAz = Math.abs(((x.ind.az - x.az + 540) % 360) - 180); if (Math.abs(x.ind.alt - x.alt) > 0.3 || dAz * Math.cos(x.alt * Math.PI / 180) > 0.3) malG.push(x.nombre + ': la app dice ' + x.alt.toFixed(1) + '°/' + x.az.toFixed(1) + '° y aparte sale ' + x.ind.alt.toFixed(1) + '°/' + x.ind.az.toFixed(1) + '°'); }
    if (x.alt < UMBRAL[x.clave] - 0.01) malG.push(x.nombre + ': a ' + x.alt.toFixed(1) + '°, bajo el umbral de ' + UMBRAL[x.clave]);
    if (!x.que || !x.sub && x.clave !== 'lluvia') malG.push(x.nombre + ': sin texto');
    if (x.clave === 'planeta' && x.extra.mag > 2) malG.push(x.nombre + ': magnitud ' + x.extra.mag);
    if (x.clave === 'paso' && !x.extra.sol) malG.push(x.nombre + ': el satelite no esta al Sol en el maximo');
  });
  const plApp = g.paradas.filter(x => x.clave === 'planeta').map(x => x.sub && x.nombre), plEsp = g.pl;
  const planetasApp = g.paradas.filter(x => x.clave === 'planeta');
  if (planetasApp.length !== plEsp.length) malG.push('planetas: la app da ' + planetasApp.length + ' y aparte salen ' + plEsp.join(','));
  const esApp = g.paradas.filter(x => x.clave === 'estrella').map(x => x.extra.hip);
  if (JSON.stringify(esApp) !== JSON.stringify(g.es)) malG.push('estrellas: la app ' + esApp.join(',') + ' y aparte ' + g.es.join(','));
  const conLuna = g.luna.alt > 5 && g.ilum > 0.05;
  if (conLuna !== g.paradas.some(x => x.clave === 'luna')) malG.push('la Luna (' + g.luna.alt.toFixed(0) + '°, ' + Math.round(g.ilum * 100) + ' %) ' + (conLuna ? 'falta' : 'sobra'));
  ok(!malG.length, 'cada parada, recalculada aparte con el motor desde el catalogo: su altura y acimut a 0,3°, por encima del umbral de su clase, en orden; los planetas por brillo (mag ≤ 2) y las tres estrellas con nombre mas brillantes por encima de 15°, exactamente las que salen aparte', malG.slice(0, 4).join(' · '));
  ok(g.tarjeta && g.tarjeta.filas === g.paradas.length && g.tarjeta.botones === 2 * g.paradas.length && g.tarjeta.texto.includes(horaCan(g.tg)) && /Llévame/.test(g.tarjeta.texto) && /PARADA 1 DE|Parada 1 de/i.test(g.tarjeta.texto) && /Cambie la noche/.test(g.tarjeta.texto),
     'la tarjeta «Su noche guiada»: una fila por parada con «Llévame» y «Ver en el mapa del cielo», la hora de referencia y como se hace', g.tarjeta && JSON.stringify({ filas: g.tarjeta.filas, botones: g.tarjeta.botones }));
  /* «Llevame» y «Ver en el mapa» */
  const lleva = await p.evaluate(async () => {
    const espera = ms => new Promise(r => setTimeout(r, ms));
    const h3 = [...document.querySelectorAll('#cielo-panel .cielo-tarjeta h3')].find(x => /🌠/.test(x.textContent)), t = h3.closest('.cielo-tarjeta');
    const filas = [...t.querySelectorAll('.cielo-parada')], out = {};
    const nombre = filas[0].querySelector('.cielo-item-nom').childNodes[0].textContent;
    filas[0].querySelectorAll('button')[0].click(); await espera(900);
    const v = document.getElementById('cielo-vista');
    out.vista = !!v; out.objetivo = v ? document.querySelector('#cielo-vista .cv-objetivo').innerText : ''; out.nombre = nombre;
    TG_CIELO.cerrarVista(); await espera(200);
    /* «Ver en el mapa» de la ultima parada */
    const ult = filas[filas.length - 1], nomUlt = ult.querySelector('.cielo-item-nom').childNodes[0].textContent;
    ult.querySelectorAll('button')[1].click(); await espera(800);
    out.pestana = TG_CIELO.estado.pestana; out.sel = JSON.stringify(TG_CIELO.estado.mapa.sel || null).slice(0, 80); out.nomUlt = nomUlt;
    out.ficha = document.querySelector('#cielo-panel .cielo-ficha') ? document.querySelector('#cielo-panel .cielo-ficha').innerText.slice(0, 120) : '';
    await TG_CIELO.ver('noche'); await espera(300);
    return out;
  });
  ok(lleva.vista && lleva.objetivo.includes(lleva.nombre) && lleva.pestana === 'mapa' && lleva.sel !== 'null' && lleva.ficha.includes(lleva.nomUlt),
     '«Llévame» abre «Apunte al cielo» con la flecha puesta en ' + lleva.nombre + '; «Ver en el mapa del cielo» abre la carta con ' + lleva.nomUlt + ' seleccionado', JSON.stringify(lleva));
  /* otras noches: las Perseidas con Luna nueva (12-8-2026: la Via Lactea y el radiante que sube mas tarde), las Geminidas (13-12-2026) */
  const otras = await p.evaluate(() => {
    const A = Astronomy, D = TG_CIELO.estado.datos, o = new A.Observer(D.obs.lat, D.obs.lon, D.obs.h);
    const f = (fecha) => { const tg = TG_CIELO.instanteGuia(fecha), P = TG_CIELO.guia(fecha); return { tg: tg.toISOString(), claves: P.map(x => x.clave + ':' + (x.des || x.nombre) + (x.t ? '@' + x.t.toISOString().slice(11, 16) : '')),
      lluvia: P.filter(x => x.clave === 'lluvia').map(x => { const t = A.MakeTime(x.t || tg); const l = D.lluvias.find(q => q.id === x.des); const a = l.ra * Math.PI / 180, d = l.dec * Math.PI / 180; const r = A.RotateVector(A.Rotation_EQJ_HOR(t, o), new A.Vector(Math.cos(d) * Math.cos(a), Math.cos(d) * Math.sin(a), Math.sin(d), t)); const hh = A.HorizonFromVector(r, 'normal'); return { id: x.des, alt: x.h.alt, aparte: hh.lat, t: x.t ? x.t.toISOString() : null, que: x.que.slice(0, 60) }; })[0] || null,
      luna: (function () { const t = A.MakeTime(tg); const eq = A.Equator(A.Body.Moon, t, o, true, true); return { alt: A.Horizon(t, o, eq.ra, eq.dec, 'normal').altitude, ilum: A.Illumination(A.Body.Moon, t).phase_fraction }; })() }; };
    return { per: f('2026-08-12'), gem: f('2026-12-13') };
  });
  ok(otras.per.claves.some(c => c.startsWith('via:')) && otras.per.lluvia && otras.per.lluvia.id === 'PER' && Math.abs(otras.per.lluvia.alt - otras.per.lluvia.aparte) < 0.3 && otras.per.lluvia.alt >= 10 && otras.per.luna.ilum < 0.05 && /Perseidas/.test(otras.per.lluvia.que),
     'la noche de las Perseidas (12-8-2026, Luna nueva): la Via Lactea y la lluvia (radiante a ' + (otras.per.lluvia && otras.per.lluvia.alt.toFixed(0)) + '°' + (otras.per.lluvia && otras.per.lluvia.t ? ', que sube a las ' + horaCan(otras.per.lluvia.t) : '') + ') estan entre las paradas', JSON.stringify(otras.per));
  ok(otras.gem.lluvia && otras.gem.lluvia.id === 'GEM' && Math.abs(otras.gem.lluvia.alt - otras.gem.lluvia.aparte) < 0.3 && otras.gem.lluvia.alt >= 10,
     'la de las Geminidas (13-12-2026): la lluvia esta, con el radiante recalculado aparte', JSON.stringify(otras.gem));
  /* ── el sistema solar ── */
  const FECHAS = ['2026-10-21T20:30:00Z', '2027-06-01T00:00:00Z', '2031-01-01T00:00:00Z', '2020-03-15T00:00:00Z'];
  const sis = await p.evaluate((FECHAS) => FECHAS.map(f => { const s = TG_CIELO.sistema(new Date(f)); const o = {}; Object.keys(s.cuerpos).forEach(k => { o[k] = { lon: s.cuerpos[k].lon, r: s.cuerpos[k].r, z: s.cuerpos[k].z }; }); return { f, cuerpos: o, obs: s.obs }; }), FECHAS);
  const malS = []; let peorL = 0, peorR = 0;
  sis.forEach(x => {
    Object.keys(x.cuerpos).forEach(b => {
      const st = standish(b, new Date(x.f)), dl = Math.abs(((st.lon - x.cuerpos[b].lon + 540) % 360) - 180), dr = Math.abs(st.r / x.cuerpos[b].r - 1);
      peorL = Math.max(peorL, dl); peorR = Math.max(peorR, dr);
      if (dl > 0.2 || dr > 0.005) malS.push(b + ' ' + x.f.slice(0, 10) + ': ' + dl.toFixed(3) + '° / ' + (dr * 100).toFixed(2) + ' %');
    });
  });
  ok(!malS.length, 'las posiciones heliocentricas de los ocho planetas en cuatro fechas (2020 a 2031), contra los elementos keplerianos de la JPL calculados aqui aparte: longitud a ' + peorL.toFixed(3) + '° y distancia al ' + (peorR * 100).toFixed(2) + ' % (la propia tabla vale a menos de medio grado)', malS.slice(0, 3).join(' · '));
  /* Tenerife sobre la Tierra: hacia el Sol a mediodia solar, al contrario a medianoche (el 21-10-2026 el mediodia solar en Izaña cae hacia las 12:51 UTC: 12:00 + 66 min de longitud - 15 min de ecuacion del tiempo) */
  const ten = await p.evaluate(() => ['2026-10-21T12:51:00Z', '2026-10-22T00:51:00Z'].map(f => { const s = TG_CIELO.sistema(new Date(f)), E = s.cuerpos.Earth; return { f, hacia: -(s.obs.x * E.x + s.obs.y * E.y) / Math.hypot(s.obs.x, s.obs.y) / Math.hypot(E.x, E.y) }; }));
  ok(ten[0].hacia > 0.9 && ten[1].hacia < -0.9, 'Tenerife sobre la Tierra: mira al Sol al mediodia solar (coseno ' + ten[0].hacia.toFixed(2) + ') y al lado contrario a medianoche (' + ten[1].hacia.toFixed(2) + ')', JSON.stringify(ten));
  /* el lienzo y la hoja de Jupiter */
  const lienzo = await p.evaluate(async () => {
    const espera = ms => new Promise(r => setTimeout(r, ms));
    const A = Astronomy, S = TG_CIELO.estado, out = {};
    await TG_CIELO.ver('noche'); await espera(400);
    const h3 = [...document.querySelectorAll('#cielo-panel .cielo-tarjeta h3')].find(x => /🪐/.test(x.textContent)), t = h3 && h3.closest('.cielo-tarjeta');
    if (!t) return { sin: true };
    t.scrollIntoView(); await espera(300);
    const cv = t.querySelector('canvas.cielo-sistema'), g = cv.getContext('2d'), d = g.getImageData(0, 0, cv.width, cv.height).data;
    let claros = 0; for (let i = 0; i < d.length; i += 4) if (d[i] + d[i + 1] + d[i + 2] > 300) claros++;
    out.claros = claros; out.px = cv.width; out.dianas = (S.sis.dianas || []).length;
    const fecha = new Date(S.sis.t); out.fecha = fecha.toISOString();
    /* tocar Jupiter en la vista exterior */
    [...t.querySelectorAll('.cielo-sis-chips .cielo-chip')].find(x => x.getAttribute('data-vista') === 'ext').click(); await espera(200);
    const dInt = JSON.stringify(S.sis.dianas.map(q => [Math.round(q.x), Math.round(q.y)]));
    const dj = S.sis.dianas.find(q => q.b === 'Jupiter'), r = cv.getBoundingClientRect();
    cv.dispatchEvent(new MouseEvent('click', { clientX: r.left + dj.x, clientY: r.top + dj.y, bubbles: true })); await espera(300);
    out.sel = S.sis.sel; out.hoja = t.querySelector('.cielo-sis-hoja').innerText;
    const tm = A.MakeTime(fecha), gv = A.GeoVector(A.Body.Jupiter, tm, true), hv = A.HelioVector(A.Body.Jupiter, tm);
    out.distTierra = Math.hypot(gv.x, gv.y, gv.z); out.distSol = Math.hypot(hv.x, hv.y, hv.z); out.elong = A.AngleFromSun(A.Body.Jupiter, tm);
    out.minLuz = Math.round(out.distTierra * 499.004784 / 60);
    /* un mes mas, y el tiempo corriendo */
    const antes = S.sis.t; [...t.querySelectorAll('.cielo-sis-chips .cielo-chip')].find(x => /\+ 1/.test(x.textContent)).click(); await espera(150);
    out.unMes = (S.sis.t - antes) / 864e5; out.fechaTxt = t.querySelector('.cielo-sis-fecha').textContent;
    const bplay = [...t.querySelectorAll('.cielo-sis-chips .cielo-chip')].find(x => x.textContent === '▶' || x.textContent === '⏸');
    const t1 = S.sis.t; bplay.click(); await espera(600); const t2 = S.sis.t; bplay.click(); await espera(200); const t3 = S.sis.t; await espera(300);
    out.corrio = (t2 - t1) / 864e5; out.paro = S.sis.t === t3 && !S.sis.corre;
    const dExt = JSON.stringify(S.sis.dianas.map(q => [Math.round(q.x), Math.round(q.y)]));
    out.vistasDistintas = dInt !== dExt;
    [...t.querySelectorAll('.cielo-sis-chips .cielo-chip')].find(x => /Hoy/.test(x.textContent)).click(); await espera(150);
    out.hoy = Math.abs(S.sis.t - Date.now()) < 2000;
    return out;
  });
  const num = s => { const m = s && s.match(/(\d+(?:[.,]\d+)?)/); return m ? parseFloat(m[1].replace(',', '.')) : NaN; };
  const hojaL = (lienzo.hoja || '').split('\n');
  const lineaSol = hojaL.find(l => /del Sol$/.test(l)) || '', lineaTierra = hojaL.find(l => /de la Tierra/.test(l)) || '', lineaElong = hojaL.find(l => /nuestro cielo/.test(l)) || '';
  ok(!lienzo.sin && lienzo.claros > 200 && lienzo.dianas === 8 && lienzo.sel === 'Jupiter' && /Júpiter/.test(lienzo.hoja) && Math.abs(num(lineaSol) - lienzo.distSol) < 0.011 && Math.abs(num(lineaTierra) - lienzo.distTierra) < 0.011 && new RegExp('tarda ' + lienzo.minLuz + ' min').test(lineaTierra) && Math.abs(num(lineaElong) - lienzo.elong) < 0.51,
     'el lienzo esta pintado (' + lienzo.claros + ' pixeles claros, 8 planetas tocables); Jupiter tocado: a ' + lienzo.distSol.toFixed(2) + ' UA del Sol, ' + lienzo.distTierra.toFixed(2) + ' de la Tierra (' + lienzo.minLuz + ' min de luz), a ' + lienzo.elong.toFixed(0) + '° del Sol, lo mismo que sale aparte', (lienzo.hoja || '').slice(0, 160));
  ok(Math.abs(lienzo.unMes - 30) < 0.01 && /2026|2027/.test(lienzo.fechaTxt) && lienzo.corrio > 5 && lienzo.corrio < 60 && lienzo.paro && lienzo.vistasDistintas && lienzo.hoy,
     '«+ 1 mes» mueve 30 dias, ▶ hace correr el tiempo (' + lienzo.corrio.toFixed(0) + ' dias en 0,6 s) y para, «Hasta Neptuno» cambia la escala, «Hoy» vuelve', JSON.stringify({ unMes: lienzo.unMes, corrio: lienzo.corrio, paro: lienzo.paro, vistas: lienzo.vistasDistintas, hoy: lienzo.hoy }));
  /* los nombres del sistema solar no se pisan (21-10-2026: en la vista exterior
     «Júpiter» caia encima de «Tierra» y «Saturno» de «Neptuno», y asi salia en las
     capturas de la App Store): diez idiomas, dos anchos, 24 meses, las dos vistas;
     ni entre ellos, ni sobre otro planeta, el Sol o Aries, ni fuera del lienzo */
  const etq = await p.evaluate(() => {
    const choca = (a, z) => a.l < z.r && z.l < a.r && a.t < z.d && z.t < a.d;
    const antes = currentLang, S = TG_CIELO.estado, guarda = { t: S.sis.t, base: S.sis.base, vista: S.sis.vista };
    const malos = []; let lienzos = 0, nombres = 0;
    for (const L of ['es', 'en', 'fr', 'de', 'it', 'nl', 'zh', 'zht', 'bg', 'pl']) {
      setLang(L);
      for (const ancho of [300, 360]) {
        const cv = document.createElement('canvas'); cv.style.width = ancho + 'px'; document.body.appendChild(cv);
        for (let m = 0; m < 24; m++) for (const vista of ['int', 'ext']) {
          const f = new Date(Date.UTC(2026, m, 13, 20)), x = TG_CIELO.lienzoSistema(cv, f, vista), e = x.etiquetas;
          lienzos++; nombres += e.length;
          const donde = L + ' ' + ancho + ' ' + f.toISOString().slice(0, 7) + ' ' + vista + ' ';
          for (let i = 0; i < e.length; i++) {
            if (e[i].l < 0 || e[i].r > x.lado || e[i].t < 0 || e[i].d > x.lado) malos.push(donde + e[i].b + ' fuera');
            for (let j = i + 1; j < e.length; j++) if (choca(e[i], e[j])) malos.push(donde + e[i].b + '/' + e[j].b);
            for (const o of x.obstaculos) if (o.b !== e[i].b && choca(e[i], o)) malos.push(donde + e[i].b + ' sobre ' + (o.b || 'el Sol o Aries'));
          }
        }
        cv.remove();
      }
    }
    setLang(antes); S.sis.t = guarda.t; S.sis.base = guarda.base; S.sis.vista = guarda.vista;
    return { lienzos, nombres, malos };
  });
  ok(etq.lienzos === 960 && etq.nombres > 4000 && !etq.malos.length, 'los nombres del sistema solar no se pisan: ' + etq.nombres + ' en ' + etq.lienzos + ' lienzos (10 idiomas, 300 y 360 px, 24 meses, las dos vistas), ni entre ellos ni sobre otro planeta, el Sol o Aries', etq.malos.slice(0, 6).join(' · '));
  /* ── la luz roja completa: ya de noche (tres horas despues), con el panel recien abierto ── */
  await p.clock.setFixedTime(new Date(T0.getTime() + 3 * 3600000));
  const rojo = await p.evaluate(async () => {
    const espera = ms => new Promise(r => setTimeout(r, ms));
    const out = {}, meta = document.querySelector('meta[name="theme-color"]');
    out.temaAntes = meta.getAttribute('content');
    TG_CIELO.estado._pistaDada = false; TG_CIELO.cerrar(); TG_CIELO.abrir(); await espera(500);
    const s = Astronomy.Equator(Astronomy.Body.Sun, Astronomy.MakeTime(new Date()), new Astronomy.Observer(28.2987, -16.5106, 2390), true, true);
    out.sol = Astronomy.Horizon(Astronomy.MakeTime(new Date()), new Astronomy.Observer(28.2987, -16.5106, 2390), s.ra, s.dec, 'normal').altitude;
    const barra = document.getElementById('cielo-pista'); out.pista = barra ? barra.innerText : null;
    if (barra) { barra.querySelectorAll('button')[0].click(); await espera(200); }
    out.clase = document.documentElement.classList.contains('cielo-rojo'); out.tema = meta.getAttribute('content');
    const sl = document.getElementById('cielo-brillo'); out.slider = sl ? !sl.hidden : null;
    if (sl) { sl.value = '0.5'; sl.dispatchEvent(new Event('input')); await espera(50); }
    out.variable = getComputedStyle(document.documentElement).getPropertyValue('--cielo-brillo').trim();
    out.filtro = getComputedStyle(document.getElementById('cielo-panel')).filter;
    out.guardado = localStorage.getItem('tgo_cielo_brillo'); out.pistaGuardada = localStorage.getItem('tgo_cielo_rojo_pista'); out.rojoGuardado = localStorage.getItem('tgo_cielo_rojo');
    TG_CIELO.vista({ sinGuia: true }); await espera(300);
    const vb = document.querySelector('#cielo-vista .cv-brillo'); out.vistaSlider = vb ? !vb.hidden : null; out.vistaValor = vb && vb.value;
    TG_CIELO.cerrarVista(); await espera(100);
    TG_CIELO.cerrar(); await espera(100); out.temaCerrado = meta.getAttribute('content'); out.claseCerrado = document.documentElement.classList.contains('cielo-rojo');
    TG_CIELO.abrir(); await espera(300); out.temaAbierto = meta.getAttribute('content'); out.pista2 = !!document.getElementById('cielo-pista');
    TG_CIELO.rojo(false); await espera(50); out.sliderFuera = document.getElementById('cielo-brillo').hidden; out.temaApagado = meta.getAttribute('content');
    return out;
  });
  ok(rojo.sol < -6 && rojo.pista && /Es de noche/.test(rojo.pista) && rojo.clase && rojo.tema === '#2a0000' && rojo.slider === true && rojo.variable === '0.5' && /brightness\(0\.5\)/.test(rojo.filtro) && rojo.guardado === '0.5' && rojo.pistaGuardada === '1' && rojo.rojoGuardado === '1',
     'de noche (Sol a ' + rojo.sol.toFixed(0) + '°) y con la luz blanca sale la pista; «Activar» pone la pantalla en rojo, la barra del sistema en rojo oscuro, el regulador a la vista, y el brillo (0,5) se aplica y se guarda', JSON.stringify(rojo));
  ok(rojo.vistaSlider === true && rojo.vistaValor === '0.5' && rojo.claseCerrado === false && rojo.temaCerrado === rojo.temaAntes && rojo.temaAbierto === '#2a0000' && rojo.pista2 === false && rojo.sliderFuera === true && rojo.temaApagado === rojo.temaAntes,
     'el regulador esta tambien en «Apunte al cielo»; al cerrar el panel vuelve el color de la barra y al abrirlo la pista ya no sale; al apagar la luz roja, regulador fuera y barra devuelta', JSON.stringify(rojo));
  /* de dia no hay pista */
  await p.clock.setFixedTime(new Date(T0.getTime() - 6 * 3600000));
  const dia = await p.evaluate(async () => { const espera = ms => new Promise(r => setTimeout(r, ms)); try { localStorage.removeItem('tgo_cielo_rojo_pista'); } catch (e) {} TG_CIELO.estado._pistaDada = false; TG_CIELO.cerrar(); TG_CIELO.abrir(); await espera(400); const s = Astronomy.Equator(Astronomy.Body.Sun, Astronomy.MakeTime(new Date()), new Astronomy.Observer(28.2987, -16.5106, 2390), true, true); return { pista: !!document.getElementById('cielo-pista'), sol: Astronomy.Horizon(Astronomy.MakeTime(new Date()), new Astronomy.Observer(28.2987, -16.5106, 2390), s.ra, s.dec, 'normal').altitude }; });
  ok(dia.pista === false && dia.sol > -6, 'de dia (Sol a ' + dia.sol.toFixed(0) + '°) la pista no sale', JSON.stringify(dia));
  await p.clock.setFixedTime(T0);
  /* ── sin red ── */
  await ctx.setOffline(true);
  const red = await p.evaluate(async () => {
    const espera = ms => new Promise(r => setTimeout(r, ms));
    await espera(300); await TG_CIELO.ver('noche'); await espera(300);
    const chip = document.querySelector('#cielo-cuerpo .cielo-sinred');
    await TG_CIELO.ver('donde'); await espera(800);
    const off = document.querySelector('#cielo-cuerpo .cielo-offline');
    return { onLine: navigator.onLine, chip: chip ? chip.innerText : null, offline: off ? off.innerText : null, offlineNo: !!(off && off.classList.contains('cielo-offline-no')), listo: await TG_CIELO.cacheListo() };
  });
  await ctx.setOffline(false);
  const chipFuera = await p.evaluate(async () => { const espera = ms => new Promise(r => setTimeout(r, ms)); await espera(300); await TG_CIELO.ver('noche'); await espera(300); return !document.querySelector('#cielo-cuerpo .cielo-sinred'); });
  const fElem = new Intl.DateTimeFormat('es-ES', { timeZone: 'Atlantic/Canary', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(epocaMax));
  ok(red.onLine === false && red.chip && /Sin conexión/.test(red.chip) && red.chip.includes(fElem) && /nubes y Wikipedia/.test(red.chip) && chipFuera,
     'sin conexion, «Esta noche» dice que el cielo se calcula igual, que faltan las nubes y Wikipedia y de cuando son los elementos (' + fElem + '); con conexion, el aviso se va', JSON.stringify(red).slice(0, 200));
  ok(red.listo === false && red.offlineNo && /Aún no está guardado/.test(red.offline || ''), 'sin service worker (como en esta prueba), «Antes de subir al Teide» dice que aun no esta guardado; con el, la parte 8 comprueba que diga «guardado»', JSON.stringify({ listo: red.listo, texto: red.offline }));
  /* ── los diez idiomas ── */
  const idiomas = await p.evaluate(async (IDI) => {
    const espera = ms => new Promise(r => setTimeout(r, ms));
    const S = TG_CIELO.estado, out = {}; S.sis.sel = 'Jupiter';
    for (const L of IDI) {
      setLang(L); await espera(50);
      await TG_CIELO.ver('noche'); await espera(200);
      const q = e => { const h = [...document.querySelectorAll('#cielo-panel .cielo-tarjeta h3')].find(x => e.test(x.textContent)); return h ? h.closest('.cielo-tarjeta').innerText : ''; };
      await espera(100);
      const guia = q(/🌠/), sistema = q(/🪐/);
      await TG_CIELO.ver('donde'); await espera(300);
      const donde = q(/📶/);
      out[L] = { guia, sistema, donde };
    }
    setLang('es');
    return out;
  }, IDI);
  const malIdi = [];
  for (const L of IDI) {
    const t = idiomas[L], todo = [t.guia, t.sistema, t.donde].join('\n');
    if (!t.guia || !t.sistema || !t.donde) malIdi.push(L + ': falta una tarjeta');
    if (/undefined|NaN|\{[a-z]+\}|\[object/.test(todo)) malIdi.push(L + ': texto roto');
    const rep = todo.match(/\b([^\s\d]{3,} [^\s\d]{3,}) \1\b/u); if (rep) malIdi.push(L + ': «' + rep[0] + '» repetido');
    if (IDI.indexOf(L) && t.guia === idiomas[IDI[0]].guia) malIdi.push(L + ': la guia sale igual que en ' + IDI[0]);
    if (!/Astronomy Engine/.test(t.sistema)) malIdi.push(L + ': el sistema solar no dice de donde sale');
    if (!/\d/.test(t.sistema)) malIdi.push(L + ': la hoja de Jupiter sin cifras');
  }
  ok(!malIdi.length, 'en los ' + IDI.length + ' idiomas: la noche guiada, el sistema solar (con la hoja de Jupiter) y «Antes de subir al Teide» sin texto roto, sin palabras repetidas y cada uno en su idioma', malIdi.slice(0, 4).join(' · '));
  ok(!err.filter(e => !/Failed to fetch|NetworkError|ERR_/i.test(e)).length, 'sin errores de pagina', err.slice(0, 3).join(' · '));
  await ctx.close();
}

/* ── 13. las curiosidades, en la pantalla ────────────────────────────── */
async function quintoBloque(b) {
  titulo('13. las curiosidades y la ficha del planeta, en la pantalla');
  const { ctx, p, err } = await abrirApp(b, 390, 844, null, false, { isMobile: true, hasTouch: true });
  const T0 = new Date(Date.UTC(2026, 9, 22, 20, 0, 0));          // 22-10-2026, 20:00 UTC: Luna gibosa creciente, de noche en Izaña
  await p.clock.setFixedTime(T0);
  const r = await p.evaluate(async () => {
    const espera = ms => new Promise(r => setTimeout(r, ms));
    await window.TG_CIELO_CARGAR(); await TG_CIELO.cargar(); setLang('es'); TG_CIELO.estado.fecha = null; TG_CIELO.abrir(); await TG_CIELO.satelites().catch(() => {});
    const A = Astronomy, D = TG_CIELO.estado.datos, out = {}, ahora = new Date();
    const ficha = sel => TG_CIELO.ficha(sel, ahora);
    const txt = e => e ? e.innerText : '';
    const canopus = D.estrellas.find(e => e.h === 30438), polar = D.estrellas.find(e => e.h === 11767), omega = D.objetos.find(o => o.C === 80);
    /* Jupiter: la hoja de la NASA y la curiosidad */
    const fj = ficha({ planeta: 'Jupiter' });
    out.jupiter = { hoja: txt(fj.querySelector('.cielo-ficha-pl')), li: fj.querySelectorAll('.cielo-ficha-pl li').length, curio: txt(fj.querySelector('.cielo-curio')), fuentes: [...fj.querySelectorAll('.cielo-fuente button')].map(x => x.textContent) };
    /* la Luna: perigeo y apogeo, y la distancia del motor en esas fechas y un dia antes y despues */
    const fl = ficha({ planeta: 'Moon' });
    const ap = A.SearchLunarApsis(A.MakeTime(ahora)), ap2 = A.NextLunarApsis(ap);
    const dist = t => { const v = A.GeoVector(A.Body.Moon, t, true); return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z) * A.KM_PER_AU; };
    out.luna = { texto: txt(fl), curio: txt(fl.querySelector('.cielo-curio')),
      apsides: [ap, ap2].map(a => ({ kind: a.kind, km: a.dist_km, d: dist(a.time), antes: dist(a.time.AddDays(-1)), despues: dist(a.time.AddDays(1)), dias: a.time.ut - A.MakeTime(ahora).ut })) };
    out.sol = txt(ficha({ planeta: 'Sun' }).querySelector('.cielo-curio'));
    out.venus = txt(ficha({ planeta: 'Venus' }).querySelector('.cielo-curio'));
    out.canopus = { curio: txt(ficha({ k: 'est', rec: canopus }).querySelector('.cielo-curio')), dec: canopus.dec, alt: canopus.alt };
    out.polar = { curio: txt(ficha({ k: 'est', rec: polar }).querySelector('.cielo-curio')), lat: D.obs.lat };
    out.omega = { curio: txt(ficha({ k: 'obj', rec: omega }).querySelector('.cielo-curio')), dec: omega.dec, alt: omega.alt };
    out.betelgeuse = !!ficha({ k: 'est', rec: D.estrellas.find(e => e.h === 27989) }).querySelector('.cielo-curio');
    out.sat = {}; ['iss', 'tiangong', 'hubble'].forEach(k => { const f = ficha({ sat: k }); out.sat[k] = { curio: txt(f.querySelector('.cielo-curio')), fuentes: [...f.querySelectorAll('.cielo-fuente button')].map(x => x.textContent) }; });
    /* las lluvias */
    out.lluvias = D.lluvias.map(l => ({ id: l.id, v: l.v, padre: TG_CIELO.lluviaPadre(l.id), curio: TG_CIELO.curiosidadLluvia(l.id).txt, fuentes: TG_CIELO.curiosidadLluvia(l.id).fuentes.map(x => x[0]) }));
    /* el calendario: plegadas, se abren, con su fuente */
    TG_CIELO.estado.cal = 'lluvia'; await TG_CIELO.ver('calendario', '2026-10-22'); await espera(300);
    const bts = [...document.querySelectorAll('#cielo-panel .cielo-curio-cab button')];
    out.cal = { filas: document.querySelectorAll('#cielo-panel .cielo-item').length, botones: bts.length, cerradas: document.querySelectorAll('#cielo-panel .cielo-curio-cuerpo[hidden]').length };
    bts.forEach(x => x.click()); await espera(100);
    out.cal.abiertas = document.querySelectorAll('#cielo-panel .cielo-curio-cuerpo:not([hidden])').length;
    out.cal.fuentes = document.querySelectorAll('#cielo-panel .cielo-fuente button').length;
    out.cal.padres = [...document.querySelectorAll('#cielo-panel .cielo-item-sub')].filter(x => /restos del/.test(x.textContent)).length;
    /* el panel se repinta solo (satelites, fecha): las abiertas siguen abiertas */
    await TG_CIELO.ver('calendario', '2026-10-22'); await espera(300);
    out.cal.trasPintar = document.querySelectorAll('#cielo-panel .cielo-curio-cuerpo:not([hidden])').length;
    document.querySelectorAll('#cielo-panel .cielo-curio-cab button').forEach(x => x.click()); await espera(100);
    out.cal.cerradasOtraVez = document.querySelectorAll('#cielo-panel .cielo-curio-cuerpo[hidden]').length;
    /* la luz zodiacal: en su temporada y no fuera; la Luna recalculada aparte */
    const o = new A.Observer(D.obs.lat, D.obs.lon, D.obs.h);
    const lunaMolesta = (f, tarde) => {
      const n = TG_CIELO.noche(f), t = tarde ? n.oscuro.AddDays(0.75 / 24) : n.claro.AddDays(-0.75 / 24);
      const eq = A.Equator(A.Body.Moon, t, o, true, true), h = A.Horizon(t, o, eq.ra, eq.dec, 'normal');
      return h.altitude > 0 && A.Illumination(A.Body.Moon, t).phase_fraction > 0.25;
    };
    out.zod = {};
    for (const [f, tarde] of [['2027-02-20', true], ['2027-03-10', true], ['2027-09-20', false], ['2027-10-15', false], ['2026-10-22', false]]) {
      const z = TG_CIELO.zodiacal(f); out.zod[f] = { txt: txt(z), molesta: lunaMolesta(f, tarde) };
    }
    out.zodFuera = ['2027-01-20', '2027-04-05', '2027-06-20', '2027-08-15', '2027-11-20', '2026-12-13'].map(f => f + ':' + (TG_CIELO.zodiacal(f) ? 'si' : 'no'));
    /* la sombra del Teide con la hora de la puesta del dia */
    const n22 = TG_CIELO.noche('2026-10-22');
    const hh = new Intl.DateTimeFormat('es-ES', { timeZone: 'Atlantic/Canary', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(n22.ocaso.date);
    out.sombra = { txt: txt(TG_CIELO.sombra('2026-10-22')), ocaso: hh };
    /* la tarjeta «Para fotos» de una noche de febrero: zodiacal y sombra dentro */
    await TG_CIELO.ver('noche', '2027-02-20'); await espera(300);
    const hf = [...document.querySelectorAll('#cielo-panel .cielo-tarjeta h3')].find(x => /📷/.test(x.textContent));
    out.fotos = hf ? hf.closest('.cielo-tarjeta').querySelectorAll('.cielo-curio').length : -1;
    /* el sistema solar: la hoja de la Tierra (que no tiene ficha) y la de Jupiter con su curiosidad plegada */
    TG_CIELO.estado.sis.vista = 'ext'; TG_CIELO.estado.sis.sel = 'Earth'; await TG_CIELO.ver('noche', '2026-10-22'); await espera(400);
    const hojaT = document.querySelector('#cielo-panel .cielo-sis-hoja');
    out.sistema = { tierra: hojaT ? (hojaT.querySelector('.cielo-curio-txt') || {}).textContent || '' : null, plegada: hojaT ? !!hojaT.querySelector('.cielo-curio-cuerpo[hidden]') : null };
    TG_CIELO.estado.sis.sel = 'Jupiter'; await TG_CIELO.ver('noche', '2026-10-22'); await espera(400);
    const hojaJ = document.querySelector('#cielo-panel .cielo-sis-hoja');
    out.sistema.jupiter = hojaJ ? (hojaJ.querySelector('.cielo-curio-txt') || {}).textContent || '' : null;
    TG_CIELO.estado.sis.sel = null;
    /* el catalogo: Canopus con su curiosidad dentro del detalle */
    await TG_CIELO.ver('catalogo', '2026-10-22'); await espera(300);
    const bus = document.querySelector('#cielo-panel input[type="search"], #cielo-panel .cielo-busca input, #cielo-panel input');
    if (bus) { bus.value = 'Canop'; bus.dispatchEvent(new Event('input', { bubbles: true })); await espera(300); }
    const it = [...document.querySelectorAll('#cielo-panel .cielo-item')].find(x => /Canop/.test(x.textContent));
    out.catalogo = it ? { curio: txt(it.querySelector('.cielo-curio')), oculta: !it.classList.contains('abierto') } : null;
    return out;
  });
  const J = r.jupiter;
  ok(J.li === 7 && /142\.984/.test(J.hoja) && /11,2/.test(J.hoja) && /9,9 h/.test(J.hoja) && /11,9 años/.test(J.hoja) && /95/.test(J.hoja) && /−110/.test(J.hoja) && /23,1/.test(J.hoja) && /anillos/i.test(J.hoja) && /2025/.test(J.hoja),
     'la ficha de Jupiter lleva la hoja de la NASA: siete lineas (142.984 km = 11,2 Tierras, 9,9 h, 11,9 años, 95 lunas, −110 °C, 23,1 m/s², anillos) y la fecha de la tabla', J.hoja);
  ok(/11,2/.test(J.curio) && /9,9 h/.test(J.curio) && /95/.test(J.curio) && J.fuentes.some(f => /Planetary Fact Sheet/.test(f)) && J.fuentes.length >= 2, 'y la curiosidad («el mayor», «el que mas deprisa gira») con la misma fuente como enlace', J.curio + ' | ' + J.fuentes.join(', '));
  const L = r.luna, apsOK = L.apsides.every(a => a.d < a.antes && a.d < a.despues ? a.kind === 0 : (a.d > a.antes && a.d > a.despues && a.kind === 1)) && L.apsides.every(a => a.dias > 0 && a.dias < 29) && L.apsides.some(a => a.kind === 0) && L.apsides.some(a => a.kind === 1);
  ok(apsOK && /perigeo/.test(L.texto) && /apogeo/.test(L.texto) && L.apsides.every(a => new RegExp(Math.round(a.km / 100) * 100 >= 1e5 ? String(Math.round(a.km / 100) * 100).replace(/(\d{3})$/, '.$1') : '').test(L.texto)),
     'la Luna: perigeo y apogeo que vienen (' + L.apsides.map(a => (a.kind ? 'apogeo ' : 'perigeo ') + Math.round(a.km) + ' km en ' + a.dias.toFixed(1) + ' d').join(', ') + '), cada uno un minimo o maximo de la distancia del motor y en la ficha con sus km', L.texto.slice(0, 200));
  ok(/27,3 días/.test(L.curio) && /3,8 cm/.test(L.curio) && /Apolo/.test(L.curio), 'y su curiosidad: la misma cara (27,3 dias), 3,8 cm al año, las huellas del Apolo', L.curio);
  ok(/109/.test(r.sol) && /332\.900/.test(r.sol) && /5500/.test(r.sol) && /16° del ecuador da una vuelta en 25,4 días/.test(r.sol) && /99 %/.test(r.sol), 'el Sol: 109 radios, 332.900 masas, 5500 °C, 25,4 dias a 16° del ecuador (el periodo de la hoja), mas del 99 % (Sun Fact Sheet)', r.sol);
  ok(/243 días/.test(r.venus) && /224,7 días/.test(r.venus) && /464 °C/.test(r.venus) && /92 bares/.test(r.venus), 'Venus: 243 dias de vuelta, 224,7 de año, 464 °C, 92 bares', r.venus);
  const lim = d => Math.round(90 - Math.abs(d)), culm = d => Math.round(90 - 28.2987 + d);
  ok(new RegExp('\\b' + lim(r.canopus.dec) + '°').test(r.canopus.curio) && new RegExp('\\b' + culm(r.canopus.dec) + '°').test(r.canopus.curio) && Math.abs(culm(r.canopus.dec) - r.canopus.alt) < 1 && /40°/.test(r.canopus.curio) && /49°/.test(r.canopus.curio),
     'Canopus (dec ' + r.canopus.dec.toFixed(1) + '°): «nunca sale al norte de los ' + lim(r.canopus.dec) + '°», culmina a ' + culm(r.canopus.dec) + '° (la altura maxima del catalogo: ' + r.canopus.alt + '°), con Madrid y Paris', r.canopus.curio);
  ok(new RegExp('\\b' + lim(r.omega.dec) + '°').test(r.omega.curio) && new RegExp('\\b' + culm(r.omega.dec) + '°').test(r.omega.curio) && Math.abs(culm(r.omega.dec) - r.omega.alt) < 1, 'Omega Centauri (objeto, dec ' + r.omega.dec.toFixed(1) + '°): lo mismo, ' + lim(r.omega.dec) + '° y ' + culm(r.omega.dec) + '°', r.omega.curio);
  ok(/\b28°/.test(r.polar.curio) && Math.round(r.polar.lat) === 28 && /es la latitud del lugar/.test(r.polar.curio) && !/navegantes/.test(r.polar.curio) && !r.betelgeuse, 'la Polar: su altura es la latitud (28°), sin lo de los navegantes, que no tiene fuente; Betelgeuse (dec +7°) no lleva curiosidad', r.polar.curio);
  const S_ = r.sat;
  ok(/8 km\/s/.test(S_.iss.curio) && /90 minutos/.test(S_.iss.curio) && /16/.test(S_.iss.curio) && /109 m/.test(S_.iss.curio) && /2000/.test(S_.iss.curio) && S_.iss.fuentes.join() === 'NASA ↗',
     'la ISS: 8 km/s, 90 minutos, 16 amaneceres, 109 m, desde 2000, fuente NASA', S_.iss.curio);
  ok(/palacio celestial/.test(S_.tiangong.curio) && /29 de abril de 2021/.test(S_.tiangong.curio) && /tres módulos/.test(S_.tiangong.curio) && /volumen presurizado es poco más de un tercio/.test(S_.tiangong.curio) && /seis meses/.test(S_.tiangong.curio) && S_.tiangong.fuentes.length === 2,
     'Tiangong: «palacio celestial», 29-4-2021, tres modulos, un tercio del volumen presurizado de la ISS, seis meses; Wikipedia y The Planetary Society', S_.tiangong.curio);
  ok(/Discovery/.test(S_.hubble.curio) && /24 de abril de 1990/.test(S_.hubble.curio) && /610 km/.test(S_.hubble.curio) && /13 m/.test(S_.hubble.curio) && /1,2 millones/.test(S_.hubble.curio) && S_.hubble.fuentes.length === 2,
     'el Hubble: Discovery, 24-4-1990, 610 km, 13 m, 1,2 millones de observaciones; dos paginas de la NASA', S_.hubble.curio);
  const malLl = r.lluvias.filter(l => !l.curio || /\{[a-z]+\}|undefined|NaN/.test(l.curio) || !l.padre || !l.fuentes.length || (l.curio.indexOf('{v}') < 0 && /km\/s/.test(l.curio) && !new RegExp('\\b' + l.v + ' km/s').test(l.curio))).map(l => l.id);
  ok(!malLl.length && r.lluvias.length === 11, 'las once lluvias: cuerpo padre, curiosidad con la velocidad del catalogo y fuente', malLl.join(', '));
  const qua = r.lluvias.find(l => l.id === 'QUA'), gem = r.lluvias.find(l => l.id === 'GEM'), per = r.lluvias.find(l => l.id === 'PER');
  const sda = r.lluvias.find(l => l.id === 'SDA');
  ok(/^Se cree que son restos del cometa 96P\/Machholz/.test(sda.padre) && /se cree/.test(sda.curio) && r.lluvias.filter(l => /^Se cree/.test(l.padre)).length === 1,
     'las Delta Acuaridas, «se cree que son restos del cometa 96P/Machholz», como su curiosidad (la NASA lo da como sospechado); las otras diez, sin el «se cree»', sda.padre);
  ok(/asteroide 2003 EH1/.test(qua.padre) && /asteroide \(3200\) Phaethon/.test(gem.padre) && /cometa 109P\/Swift-Tuttle/.test(per.padre) && /San Lorenzo/.test(per.curio) && /133 años/.test(per.curio) && /59 km\/s/.test(per.curio),
     'Cuadrantidas y Geminidas «restos del asteroide», Perseidas «del cometa 109P/Swift-Tuttle», con San Lorenzo, 133 años y 59 km/s', [qua.padre, gem.padre, per.padre].join(' | '));
  ok(r.cal.filas >= 11 && r.cal.botones === r.cal.filas && r.cal.cerradas === r.cal.botones && r.cal.abiertas === r.cal.botones && r.cal.fuentes >= r.cal.botones && r.cal.padres === r.cal.filas,
     'el calendario de lluvias: ' + r.cal.filas + ' filas, cada una con el cuerpo padre y «¿Sabias que...?» plegado, que se abre y enseña su fuente', JSON.stringify(r.cal));
  ok(r.cal.trasPintar === r.cal.botones && r.cal.cerradasOtraVez === r.cal.botones, 'las abiertas siguen abiertas cuando el panel se vuelve a pintar, y se cierran al tocar otra vez', JSON.stringify(r.cal));
  const malZ = Object.keys(r.zod).filter(f => !r.zod[f].txt || (r.zod[f].molesta ? !/la tapa con su luz/.test(r.zod[f].txt) : !/no molesta/.test(r.zod[f].txt)));
  ok(!malZ.length && /oeste/.test(r.zod['2027-02-20'].txt) && /oeste/.test(r.zod['2027-03-10'].txt) && /este/.test(r.zod['2027-09-20'].txt) && /este/.test(r.zod['2027-10-15'].txt) && /Britannica/.test(r.zod['2027-02-20'].txt),
     'la luz zodiacal: al oeste en febrero-marzo, al este en septiembre-octubre, y si la Luna molesta coincide con la Luna recalculada aparte en las cinco noches (' + Object.keys(r.zod).map(f => f + (r.zod[f].molesta ? ' tapa' : ' libre')).join(', ') + ')', malZ.join(', '));
  ok(r.zodFuera.every(x => /:no$/.test(x)), 'y fuera de temporada (enero, abril, junio, agosto, noviembre, diciembre) no sale', r.zodFuera.join(' '));
  ok(new RegExp(r.sombra.ocaso.replace(':', '[:.]')).test(r.sombra.txt) && /triangular/.test(r.sombra.txt) && /perspectiva/.test(r.sombra.txt) && /cinturón de Venus/.test(r.sombra.txt) && /TWAN/.test(r.sombra.txt) && /APOD/.test(r.sombra.txt) && /Atmospheric Optics/.test(r.sombra.txt),
     'las sombras del atardecer: la del Teide con la puesta de sol del dia (' + r.sombra.ocaso + '), triangular por perspectiva (TWAN, APOD), y la de la Tierra con el cinturon de Venus (Atmospheric Optics)', r.sombra.txt);
  ok(r.fotos === 2, 'la tarjeta «Para fotos» del 20 de febrero lleva la luz zodiacal y la sombra', String(r.fotos));
  ok(r.catalogo && /37°/.test(r.catalogo.curio) && r.catalogo.oculta, 'en el catalogo, Canopus lleva la curiosidad dentro de su detalle (plegado hasta tocar)', JSON.stringify(r.catalogo));
  ok(r.sistema && /29,8 km\/s/.test(r.sistema.tierra) && /107\.280/.test(r.sistema.tierra) && r.sistema.plegada && /11,2/.test(r.sistema.jupiter), 'en el sistema solar, la hoja de la Tierra lleva su curiosidad (29,8 km/s, 107.280 km/h) y la de Jupiter la suya, plegadas', JSON.stringify(r.sistema));
  /* los diez idiomas: las fichas de Jupiter, la Luna, el Sol, Canopus y la ISS, y una lluvia */
  const idiomas = await p.evaluate(async (IDI) => {
    const espera = ms => new Promise(r => setTimeout(r, ms));
    const D = TG_CIELO.estado.datos, out = {}, ahora = new Date(), canopus = D.estrellas.find(e => e.h === 30438);
    for (const L of IDI) {
      setLang(L); await espera(30);
      const f = sel => TG_CIELO.ficha(sel, ahora);
      const t = {};
      const fj = f({ planeta: 'Jupiter' }); t.hoja = fj.querySelector('.cielo-ficha-pl').innerText; t.jup = fj.querySelector('.cielo-curio').innerText;
      t.luna = f({ planeta: 'Moon' }).innerText; t.sol = f({ planeta: 'Sun' }).querySelector('.cielo-curio').innerText;
      t.canopus = f({ k: 'est', rec: canopus }).querySelector('.cielo-curio').innerText; t.iss = f({ sat: 'iss' }).querySelector('.cielo-curio').innerText;
      t.per = TG_CIELO.curiosidadLluvia('PER').txt + ' ' + TG_CIELO.lluviaPadre('PER'); t.zod = TG_CIELO.zodiacal('2027-02-20').innerText; t.sombra = TG_CIELO.sombra('2026-10-22').innerText;
      out[L] = t;
    }
    setLang('es');
    return out;
  }, IDI);
  const malIdi = [];
  for (const L of IDI) {
    const t = idiomas[L], todo = Object.values(t).join('\n');
    if (/undefined|NaN|\{[a-z]+\}|\[object/.test(todo)) malIdi.push(L + ': texto roto');
    if (Object.values(t).some(x => !x || x.length < 20)) malIdi.push(L + ': falta un bloque');
    const rep = todo.match(/\b([^\s\d]{3,} [^\s\d]{3,}) \1\b/u); if (rep) malIdi.push(L + ': «' + rep[0] + '» repetido');
    if (IDI.indexOf(L) && t.jup === idiomas[IDI[0]].jup) malIdi.push(L + ': Jupiter sale igual que en ' + IDI[0]);
    if (!/142[.,\s\u00a0\u202f]?984/.test(t.hoja)) malIdi.push(L + ': la hoja de Jupiter sin el diametro');
    if (!/59/.test(t.per) || !/133/.test(t.per) || !/109P/.test(t.per)) malIdi.push(L + ': las Perseidas sin 59 km/s, 133 años o 109P');
    if (!/28/.test(t.zod)) malIdi.push(L + ': la luz zodiacal sin los 28° de Tenerife');
    if (!/↗/.test(t.jup) || !/↗/.test(t.iss)) malIdi.push(L + ': sin el enlace de la fuente');
  }
  ok(!malIdi.length, 'en los ' + IDI.length + ' idiomas: la hoja y la curiosidad de Jupiter, la Luna, el Sol, Canopus, la ISS, las Perseidas, la luz zodiacal y la sombra sin texto roto ni repeticiones, cada uno en su idioma', malIdi.slice(0, 5).join(' · '));
  ok(!err.filter(e => !/Failed to fetch|NetworkError|ERR_/i.test(e)).length, 'sin errores de pagina', err.slice(0, 3).join(' · '));
  await ctx.close();
}

/* ── 14. las constelaciones, en la pantalla ─────────────────────────────── */
async function sextoBloque(b) {
  titulo('14. las 88 constelaciones, en la pantalla');
  const { ctx, p, err } = await abrirApp(b, 390, 844, null, false, { isMobile: true, hasTouch: true });
  await p.clock.setFixedTime(new Date(Date.UTC(2026, 9, 22, 20, 0, 0)));
  const r = await p.evaluate(async () => {
    const espera = ms => new Promise(r => setTimeout(r, ms));
    await window.TG_CIELO_CARGAR(); await TG_CIELO.cargar(); setLang('es'); TG_CIELO.estado.fecha = null; TG_CIELO.abrir();
    await TG_CIELO.curiosidades('es');
    const out = {}, ahora = new Date();
    const txt = e => e ? e.innerText : '';
    for (const ab of ['Ori', 'Hya', 'Cru', 'Cam', 'Com', 'Pup', 'UMa']) {
      const f = TG_CIELO.ficha({ con: ab }, ahora);
      out[ab] = { datos: [...f.querySelectorAll('.cielo-ficha-datos li')].map(x => x.textContent), curio: txt(f.querySelector('.cielo-curio-txt')), fuentes: [...f.querySelectorAll('.cielo-fuente button')].map(x => x.textContent) };
    }
    /* el catalogo: Orion en «constelaciones» con el detalle */
    TG_CIELO.estado.cat.tipo = 'constelaciones'; TG_CIELO.estado.cat.busca = 'Ori';
    await TG_CIELO.ver('catalogo', '2026-10-22'); await espera(300);
    const it = [...document.querySelectorAll('#cielo-panel .cielo-item')].find(x => /Ori/.test(x.textContent) && /✳️/.test(x.textContent));
    TG_CIELO.estado.cat.tipo = 'todo'; TG_CIELO.estado.cat.busca = '';
    out.catalogo = it ? { mas: txt(it.querySelector('.cielo-item-mas')), curio: txt(it.querySelector('.cielo-curio')) } : null;
    return out;
  });
  const O = r.Ori;
  ok(O.datos.some(x => /Ptolomeo/.test(x) && /siglo II/.test(x)) && O.datos.some(x => /594 grados cuadrados/.test(x) && /n\.º 26 de 88/.test(x)), 'Orion: «una de las 48 de Ptolomeo», 594 grados cuadrados, la n.º 26 de 88', O.datos.join(' | '));
  ok(O.curio.length > 60 && O.fuentes.length === 3 && /^Wikipedia ↗/.test(O.fuentes[0]) && /origen/.test(O.fuentes[1]) && /tamaño/.test(O.fuentes[2]),
     'y su curiosidad con sus tres fuentes: Wikipedia (la pagina de Orion en Star Tales no se dejo leer), y las tablas de la UAI del origen y del tamaño', O.curio + ' | ' + O.fuentes.join(', '));
  ok(['Hya', 'Cru', 'Cam', 'Com', 'Pup', 'UMa'].every(a => r[a].fuentes.length === 3 && /^Star Tales \(Ian Ridpath\) ↗/.test(r[a].fuentes[0])),
     'las otras seis, con Star Tales (Ian Ridpath) delante', ['Hya', 'Cru', 'Cam', 'Com', 'Pup', 'UMa'].map(a => a + ': ' + r[a].fuentes.join(', ')).join(' // ').slice(0, 300));
  ok(r.Hya.datos.some(x => /1303 grados/.test(x) && /n\.º 1 de 88/.test(x)) && r.Cru.datos.some(x => /68 grados/.test(x) && /n\.º 88 de 88/.test(x)), 'Hydra la n.º 1 (1303) y Crux la n.º 88 (68)', r.Hya.datos.join(' | ') + ' // ' + r.Cru.datos.join(' | '));
  ok(r.Cam.datos.some(x => /Plancius en 1613/.test(x)) && r.Com.datos.some(x => /Vopel \(1536\)/.test(x)) && r.Pup.datos.some(x => /Argo Navis/.test(x) && /1756/.test(x)) && r.UMa.datos.some(x => /Ptolomeo/.test(x)),
     'Camelopardalis (Plancius, 1613), Coma Berenices (Vopel, 1536), Puppis (Argo Navis, Lacaille 1756), la Osa Mayor (Ptolomeo)', [r.Cam.datos, r.Com.datos, r.Pup.datos].map(x => x.join(' | ')).join(' // '));
  ok(['Ori', 'Hya', 'Cru', 'Cam', 'Com', 'Pup', 'UMa'].every(a => r[a].curio && !/\{[a-z]+\}|undefined/.test(r[a].curio)), 'las siete fichas con curiosidad y sin texto roto');
  ok(r.catalogo && /Ptolomeo/.test(r.catalogo.mas) && /594/.test(r.catalogo.mas) && r.catalogo.curio.length > 60, 'en el catalogo, Orion lleva origen, tamaño y curiosidad en su detalle', JSON.stringify(r.catalogo).slice(0, 200));
  /* los diez idiomas: tres constelaciones */
  const idiomas = await p.evaluate(async (IDI) => {
    const espera = ms => new Promise(r => setTimeout(r, ms));
    const out = {}, ahora = new Date();
    for (const L of IDI) {
      setLang(L); await TG_CIELO.curiosidades(L); await espera(30);
      out[L] = {};
      for (const ab of ['Ori', 'Cru', 'Lac']) { const f = TG_CIELO.ficha({ con: ab }, ahora); out[L][ab] = f.innerText; }
    }
    setLang('es');
    return out;
  }, IDI);
  const malIdi = [];
  for (const L of IDI) {
    const t = idiomas[L], todo = Object.values(t).join('\n');
    if (/undefined|NaN|\{[a-z]+\}|\[object/.test(todo)) malIdi.push(L + ': texto roto');
    const rep = todo.match(/\b([^\s\d]{3,} [^\s\d]{3,}) \1\b/u); if (rep) malIdi.push(L + ': «' + rep[0] + '» repetido');
    if (IDI.indexOf(L) && t.Ori === idiomas[IDI[0]].Ori) malIdi.push(L + ': Orion sale igual que en ' + IDI[0]);
    if (!/594/.test(t.Ori) || !/26/.test(t.Ori) || !/88/.test(t.Ori)) malIdi.push(L + ': Orion sin su tamaño');
    if (!/1690/.test(t.Lac)) malIdi.push(L + ': Lacerta sin el 1690 de Hevelius');
    if (!/↗/.test(t.Cru)) malIdi.push(L + ': Crux sin el enlace de la fuente');
  }
  ok(!malIdi.length, 'en los ' + IDI.length + ' idiomas: Orion, Crux y Lacerta con origen, tamaño y curiosidad, cada una en su idioma', malIdi.slice(0, 5).join(' · '));
  ok(!err.filter(e => !/Failed to fetch|NetworkError|ERR_/i.test(e)).length, 'sin errores de pagina', err.slice(0, 3).join(' · '));
  await ctx.close();
  /* Un fichero por idioma (22-10-2026, tarde): en una pagina nueva, que el
     panel pida solo el del idioma de quien mira; que al cambiar de idioma
     pida el nuevo; y que si un idioma no llega (aqui, el aleman con 404) la
     ficha salga sin curiosidad, no con la de otro idioma. */
  const n2 = await abrirApp(b, 390, 844, null, false, { isMobile: true, hasTouch: true });
  const pedidos = [];
  n2.p.on('request', q => { const m = q.url().match(/\/idiomas\/cielo\/([a-z]+)\.json/); if (m) pedidos.push(m[1]); });
  await n2.p.route(/\/idiomas\/cielo\/de\.json$/, r => r.fulfill({ status: 404, body: '' }));
  const r2 = await n2.p.evaluate(async () => {
    const espera = ms => new Promise(r => setTimeout(r, ms));
    setLang('fr'); await window.TG_CIELO_CARGAR(); await TG_CIELO.cargar(); TG_CIELO.abrir();
    for (let i = 0; i < 50 && !TG_CIELO.ficha({ con: 'Ori' }, new Date()).querySelector('.cielo-curio-txt'); i++) await espera(100);
    const fr = TG_CIELO.ficha({ con: 'Ori' }, new Date());
    const out = { fr: fr.querySelector('.cielo-curio-txt') ? fr.querySelector('.cielo-curio-txt').innerText : '' };
    setLang('bg'); await espera(100);
    for (let i = 0; i < 50 && !TG_CIELO.ficha({ con: 'Ori' }, new Date()).querySelector('.cielo-curio-txt'); i++) await espera(100);
    const bg = TG_CIELO.ficha({ con: 'Ori' }, new Date());
    out.bg = bg.querySelector('.cielo-curio-txt') ? bg.querySelector('.cielo-curio-txt').innerText : '';
    setLang('de'); await TG_CIELO.curiosidades('de'); await espera(300);
    const de = TG_CIELO.ficha({ con: 'Ori' }, new Date());
    out.de = { curio: !!de.querySelector('.cielo-curio'), texto: de.innerText };
    TG_CIELO.cerrar(); setLang('es');
    return out;
  });
  const vistos = [...new Set(pedidos)];
  const esperado = l => (JSON.parse(lee('idiomas/cielo/' + l + '.json')).cieloCurConOri || '\u0000').trim();
  ok(vistos.join() === 'fr,bg,de' && r2.fr.trim() === esperado('fr') && r2.bg.trim() === esperado('bg'),
     'el panel pide solo el fichero del idioma de quien mira (frances; al pasar a bulgaro, el bulgaro): ' + vistos.join(', '), JSON.stringify({ vistos, fr: r2.fr.slice(0, 60), bg: r2.bg.slice(0, 60) }));
  ok(!r2.de.curio && /Herkunft/.test(r2.de.texto) && !/Sabías|Did you know|Le saviez|你知道/.test(r2.de.texto),
     'sin el fichero del aleman (404), la ficha de Orion sale en aleman sin curiosidad: nunca la de otro idioma', r2.de.texto.slice(0, 200));
  await n2.ctx.close();
}

/* ── 15. la noche guiada en voz alta, en la pantalla ─────────────────────
   Chromium sin cabeza no tiene voces: la pagina recibe, antes de cargar, una
   speechSynthesis falsa que apunta cada frase (texto, idioma, voz, velocidad)
   y la «dice» en unos milisegundos, con voces de los diez idiomas (y dos de
   red, que no se tienen que usar), y un Wake Lock que cuenta lo que se pide
   y lo que se suelta. La noche es la de la parte 12, con los satelites. */
const VOZ_FALSA = () => {
  const reg = { dichos: [], cortes: 0, pedidos: 0, soltados: 0, modo: 'normal', ms: 120 };
  reg.todas = [
    { name: 'Google español', lang: 'es-ES', localService: false, default: false, voiceURI: 'red-es' },
    { name: 'Mónica', lang: 'es-ES', localService: true, default: true, voiceURI: 'es' },
    { name: 'Daniel', lang: 'en-GB', localService: true, voiceURI: 'en' },
    { name: 'Thomas', lang: 'fr-FR', localService: true, voiceURI: 'fr' },
    { name: 'Anna', lang: 'de-DE', localService: true, voiceURI: 'de' },
    { name: 'Alice', lang: 'it-IT', localService: true, voiceURI: 'it' },
    { name: 'Xander', lang: 'nl_NL', localService: true, voiceURI: 'nl' },          // con guion bajo, como algunos Android
    { name: 'Tingting', lang: 'zh-CN', localService: true, voiceURI: 'zh' },
    { name: 'Meijia', lang: 'zh-TW', localService: true, voiceURI: 'zht' },
    { name: 'Daria', lang: 'bg-BG', localService: true, voiceURI: 'bg' },
    { name: 'Zosia', lang: 'pl-PL', localService: true, voiceURI: 'pl' },
    { name: 'Google Nederlands', lang: 'nl-NL', localService: false, voiceURI: 'red-nl' }
  ];
  reg.voces = reg.todas.slice();
  let cola = [], actual = null;
  const S = {
    speaking: false, pending: false, paused: false,
    getVoices: () => reg.voces.slice(),
    speak(u) { reg.dichos.push({ text: u.text, lang: u.lang, voz: u.voice ? u.voice.name : null, rate: u.rate }); cola.push(u); S.pending = true; sig(); },
    cancel() {
      reg.cortes++;
      const v = [actual].concat(cola).filter(Boolean); cola = []; actual = null; S.speaking = false; S.pending = false;
      v.forEach(u => setTimeout(() => u.onerror && u.onerror({ error: 'interrupted' }), 0));
    },
    pause() {}, resume() {}, addEventListener() {}, removeEventListener() {}
  };
  function sig() {
    if (actual || !cola.length) { S.pending = cola.length > 0; return; }
    actual = cola.shift(); S.pending = cola.length > 0;
    const u = actual;
    if (reg.modo === 'mudo') return;                     // no empieza nunca
    S.speaking = true;
    if (reg.modo === 'error') { setTimeout(() => { if (actual !== u) return; actual = null; S.speaking = false; if (u.onerror) u.onerror({ error: 'synthesis-failed' }); sig(); }, 20); return; }
    setTimeout(() => { if (actual === u && u.onstart) u.onstart({}); }, 5);
    setTimeout(() => { if (actual !== u) return; actual = null; S.speaking = false; if (u.onend) u.onend({}); sig(); }, reg.ms);
  }
  Object.defineProperty(window, 'speechSynthesis', { value: S, configurable: true, writable: true });
  window.SpeechSynthesisUtterance = function (t) { this.text = t; this.lang = ''; this.voice = null; this.rate = 1; };
  const lock = { request: () => { reg.pedidos++; const sen = { released: false, release: () => { if (!sen.released) { sen.released = true; reg.soltados++; } return Promise.resolve(); } }; return Promise.resolve(sen); } };
  try { Object.defineProperty(navigator, 'wakeLock', { value: lock, configurable: true }); } catch (e) {}
  window.__voz = reg;
};
async function vozAlta(b) {
  titulo('15. la noche guiada en voz alta, en la pantalla');
  const { ctx, p, err } = await abrirApp(b, 390, 844, null, false, { isMobile: true, hasTouch: true }, VOZ_FALSA);
  const epocaMax = Math.max(...SATJSON.sat.map(x => new Date(x.epoca).getTime()));
  const e0 = new Date(epocaMax), T0 = new Date(Date.UTC(e0.getUTCFullYear(), e0.getUTCMonth(), e0.getUTCDate() + 1, 18, 0, 0));
  await p.clock.setFixedTime(T0);
  await p.evaluate(async () => { await window.TG_CIELO_CARGAR(); await TG_CIELO.cargar(); setLang('es'); TG_CIELO.estado.fecha = null; TG_CIELO.abrir(); await TG_CIELO.satelites(); });
  /* la primera hora, de 20 en 20 minutos y de esa noche a dos mas tarde, en
     que la guia lleva un paso de satelite por venir: asi se oye tambien el
     paso. Hay noches sin ninguno; si en tres no sale, se informa. */
  const fechaCan = t => new Intl.DateTimeFormat('en-CA', { timeZone: 'Atlantic/Canary', year: 'numeric', month: '2-digit', day: '2-digit' }).format(t);
  let T1 = null;
  for (let d = 0; d <= 2 && !T1; d++) for (let k = 0; k <= 15 && !T1; k++) {
    const t = new Date(T0.getTime() + d * 864e5 + k * 20 * 60000);
    await p.clock.setFixedTime(t);
    if (await p.evaluate(f => TG_CIELO.guia(f).some(x => x.clave === 'paso'), fechaCan(t))) T1 = t;
  }
  const conPaso = !!T1; T1 = T1 || T0;
  await p.clock.setFixedTime(T1);
  await p.evaluate(async f => { await TG_CIELO.ver('noche', f); }, fechaCan(T1));
  nota('reloj de la pagina: ' + T1.toISOString() + (conPaso ? ' (desde la noche de la parte 12, la primera hora con un paso de satelite en la guia)' : ' (la noche de la parte 12: en tres noches ninguna hora con un paso de satelite en la guia)'));
  /* en la pagina: esperar, leer la tarjeta y lo que deberia decir cada parada */
  const AYUDA = () => {
    window.__a = {
      espera: ms => new Promise(r => setTimeout(r, ms)),
      hasta: async (f, ms) => { const t = performance.now(); while (!f()) { if (performance.now() - t > (ms || 8000)) return false; await new Promise(r => setTimeout(r, 25)); } return true; },
      caja: () => { const c = document.getElementById('cielo-voz'); return c ? c.innerText.replace(/\s+/g, ' ').trim() : null; },
      boton: q => document.querySelector('#cielo-voz [data-voz="' + q + '"]'),
      /* cada parada como la pinta la tarjeta: el nombre, la clase, la linea
         «hora: altura, direccion» y lo que se ve; y la hora de referencia */
      tarjeta: () => {
        const g = document.getElementById('cielo-guia');
        const ref = (g.querySelector('.cielo-p').textContent.match(/(\d\d:\d\d)/) || [])[1];
        const paradas = [...g.querySelectorAll('.cielo-parada')].map(it => {
          const subs = [...it.querySelectorAll('.cielo-item-sub')].filter(x => !x.classList.contains('cielo-parada-que')).map(x => x.textContent);
          const arriba = subs[subs.length - 1], sub = subs.length > 1 ? subs[0] : '';
          const q = it.querySelector('.cielo-parada-que');
          return { n: it.getAttribute('data-parada'), ico: it.querySelector('.cielo-item-ico').textContent, nombre: it.querySelector('.cielo-item-nom').childNodes[0].textContent,
                   sub, arriba, hora: (arriba.match(/^(\d\d:\d\d)/) || [])[1], alt: Number((arriba.match(/(\d+)°/) || [])[1]), dir: arriba.split(/, |，/).pop(), que: q ? q.textContent : '' };
        });
        return { ref, paradas, activa: [...g.querySelectorAll('.cielo-parada-activa')].map(x => x.getAttribute('data-parada')) };
      },
      /* lo que tiene que contener la frase de una parada, de lo que pinta la tarjeta */
      espero: (x, i, total, ref) => {
        const piezas = [tx('cieloGuiaParada', { i: i + 1, n: total }), x.nombre];
        if (!/🛰/u.test(x.ico) && x.sub) piezas.push(x.sub.replace(/\s*·\s*/g, currentLang.startsWith('zh') ? '，' : ', '));
        if (x.hora !== ref) piezas.push(tx('cieloVozHoraParada', { t: x.hora }));
        piezas.push(tx('cieloVozDonde', { r: x.dir, n: x.alt }));
        if (x.que) piezas.push(x.que);
        return piezas;
      },
      contiene: (t, piezas) => { let desde = 0; const faltan = []; piezas.forEach(pz => { const k = t.toLocaleLowerCase().indexOf(pz.toLocaleLowerCase().replace(/[.。]$/, ''), desde); if (k < 0) faltan.push(pz); else desde = k; }); return faltan; }
    };
  };
  await p.evaluate(AYUDA);
  /* ── una noche entera, en castellano ── */
  const r = await p.evaluate(async () => {
    const A = window.__a, V = window.__voz, out = {};
    out.antes = { caja: A.caja(), dentro: !!document.querySelector('#cielo-guia #cielo-voz'), estado: TG_CIELO.voz().estado, tg: typeof window.TG_VOZ };
    const tj = A.tarjeta(); out.tarjeta = tj;
    TG_CIELO.vozTiempos(2, 3000); V.ms = 1000;      // cada frase dura 1 s: da tiempo a mirar mientras lee
    A.boton('leer').click();
    out.alTocar = { dichos: V.dichos.length, estado: TG_CIELO.voz().estado };          // la intro sale dentro del toque
    await A.hasta(() => V.dichos.length >= 2);
    await A.espera(150);
    out.parada1 = { estado: TG_CIELO.voz(), activa: A.tarjeta().activa, caja: A.caja(), pedidos: V.pedidos, soltados: V.soltados };
    await A.hasta(() => TG_CIELO.voz().estado === 'esperando'); await A.espera(100);
    out.espera = { estado: TG_CIELO.voz(), caja: A.caja() };
    await A.hasta(() => V.dichos.length >= 3); await A.espera(100);
    const n3 = V.dichos.length, cortes = V.cortes;
    A.boton('pausa').click(); await A.espera(100);
    out.pausa = { estado: TG_CIELO.voz(), caja: A.caja(), cortes: V.cortes - cortes, pedidos: V.pedidos, soltados: V.soltados, seguir: !!A.boton('seguir') };
    await A.espera(2600);
    out.pausa.nuevas = V.dichos.length - n3;
    A.boton('seguir').click(); await A.hasta(() => V.dichos.length > n3); await A.espera(100);
    out.seguir = { igual: V.dichos[V.dichos.length - 1].text === V.dichos[n3 - 1].text, estado: TG_CIELO.voz() };
    const n4 = V.dichos.length, c4 = V.cortes;
    A.boton('siguiente').click();
    await A.hasta(() => V.dichos.length > n4, 1500);
    out.siguiente = { cortes: V.cortes - c4, i: TG_CIELO.voz().i, nuevo: V.dichos.length > n4 ? V.dichos[V.dichos.length - 1].text.slice(0, 40) : null };
    TG_CIELO.vozTiempos(1, 1500); V.ms = 40;
    await A.hasta(() => TG_CIELO.voz().estado === 'parado', 60000);
    out.fin = { estado: TG_CIELO.voz(), caja: A.caja(), activa: A.tarjeta().activa, pedidos: V.pedidos, soltados: V.soltados };
    out.dichos = V.dichos.slice();
    return out;
  });
  const P = r.tarjeta.paradas, N = P.length;
  ok(r.antes.tg === 'object' && r.antes.dentro && r.antes.estado === 'parado' && /^🔊 Leer en voz alta Lo leen las voces instaladas en el dispositivo, sin red: así puede mirar al cielo y no a la pantalla\. Tras cada parada hay 30 segundos para buscarla/.test(r.antes.caja),
     'la tarjeta «Su noche guiada» lleva el boton «Leer en voz alta» y la nota (las voces del dispositivo, sin red, 30 segundos por parada)', r.antes.caja);
  const intro = r.dichos[0] || {};
  ok(r.alTocar.dichos === 1 && intro.text === 'Noche guiada: ' + N + ' paradas, de lo más fácil a lo más fino. Hora de referencia: ' + r.tarjeta.ref + '. Tras cada una, una pausa para buscarla en el cielo.'
     && intro.lang === 'es-ES' && intro.voz === 'Mónica' && intro.rate === 0.95,
     'al tocar, en el acto: «Noche guiada: ' + N + ' paradas… Hora de referencia: ' + r.tarjeta.ref + '…», en es-ES con la voz del dispositivo (Mónica) y no con la de red que va antes en la lista', JSON.stringify(intro));
  /* cada parada dice lo que pone la tarjeta, en orden */
  const malP = [];
  const paradasDichas = r.dichos.slice(1).map(d => d.text).filter(t => /^Parada \d+ de \d+\./.test(t));
  const espero = await p.evaluate(({ P, N, ref }) => P.map((x, i) => window.__a.espero(x, i, N, ref)), { P, N, ref: r.tarjeta.ref });
  const orden = paradasDichas.map(t => Number(t.match(/^Parada (\d+)/)[1]));
  P.forEach((x, i) => {
    const t = paradasDichas.find(s => s.startsWith('Parada ' + (i + 1) + ' de ' + N + '.'));
    if (!t) { malP.push('falta la parada ' + (i + 1)); return; }
    const piezas = espero[i];
    let desde = 0; const faltan = [];
    piezas.forEach(pz => { const k = t.toLocaleLowerCase('es').indexOf(pz.toLocaleLowerCase('es').replace(/\.$/, ''), desde); if (k < 0) faltan.push(pz); else desde = k; });
    if (faltan.length) malP.push((i + 1) + ': falta «' + faltan.join('» «') + '» en «' + t.slice(0, 120) + '»');
    if (/[·{}]|undefined|NaN|\s{2}|\p{Extended_Pictographic}/u.test(t)) malP.push((i + 1) + ': texto roto «' + t.slice(0, 80) + '»');
    if (/🛰/u.test(x.ico) && x.sub && t.includes(x.sub)) malP.push((i + 1) + ': el paso lee su franja de horas');
  });
  ok(!malP.length && paradasDichas.length >= N && orden.slice(0, 4).join() === '1,2,2,3' && orden.includes(N) && orden.slice(3).every((k, i, a) => !i || k === a[i - 1] + 1),
     'las ' + N + ' paradas, cada una con lo que pone su tarjeta y en ese orden: «Parada k de ' + N + '», el nombre, la clase, la hora si no es la de referencia, «Mire hacia…, a … grados sobre el horizonte» con la altura y la direccion de la tarjeta, y lo que se ve',
     malP.slice(0, 3).join(' · ') + ' · orden ' + orden.join(','));
  const conHora = P.filter(x => x.hora !== r.tarjeta.ref).map(x => x.nombre);
  nota('paradas: ' + P.map(x => x.ico + ' ' + x.nombre + ' (' + x.alt + '°, ' + x.dir + (x.hora !== r.tarjeta.ref ? ', a las ' + x.hora : '') + ')').join(' · '));
  if (conPaso) ok(conHora.length >= 1 && P.some(x => /🛰/u.test(x.ico)), 'esa noche hay un paso de satelite (no lee su franja de horas: ya va en lo que se ve) y ' + conHora.length + ' parada(s) con su propia hora («Hora de esta parada: …»)', conHora.join(', '));
  else nota('sin paso de satelite en la guia: lo del paso no se oye esta vez (' + conHora.length + ' parada(s) con su propia hora)');
  ok(r.parada1.estado.estado === 'hablando' && r.parada1.estado.i === 0 && r.parada1.activa.join() === '0' && /^⏸️ Pausa ⏭️ Siguiente ⏹️ Parar 🔊 Parada 1 de /.test(r.parada1.caja) && r.parada1.pedidos === 1 && r.parada1.soltados === 0,
     'mientras lee la primera: la tarjeta la marca (y solo a ella), «Pausa · Siguiente · Parar», «🔊 Parada 1 de ' + N + '» y la pantalla encendida (Wake Lock pedido)', JSON.stringify(r.parada1));
  ok(r.espera.estado.estado === 'esperando' && /⏳ Siguiente parada en [12] s$/.test(r.espera.caja), 'entre parada y parada, la cuenta atras («Siguiente parada en 2 s»)', r.espera.caja);
  ok(r.pausa.estado.estado === 'pausa' && r.pausa.cortes >= 1 && r.pausa.nuevas === 0 && r.pausa.seguir && /⏸️ En pausa\. «Seguir» vuelve a leer esta parada\.$/.test(r.pausa.caja) && r.pausa.soltados === r.pausa.pedidos,
     '«Pausa» corta la frase, no lee nada mas en 2,6 s, ofrece «Seguir» y deja apagarse la pantalla', JSON.stringify(r.pausa));
  ok(r.seguir.igual && r.seguir.estado.estado === 'hablando', '«Seguir» vuelve a leer la misma parada', JSON.stringify(r.seguir));
  ok(r.siguiente.cortes >= 1 && r.siguiente.nuevo && r.siguiente.nuevo.startsWith('Parada ' + (r.seguir.estado.i + 2) + ' de'), '«Siguiente» corta la que lee y pasa a la otra', JSON.stringify(r.siguiente));
  const ult = r.dichos[r.dichos.length - 1] || {};
  ok(ult.text === 'Fin de la noche guiada.' && r.fin.estado.estado === 'parado' && !r.fin.activa.length && /^🔊 Leer en voz alta/.test(r.fin.caja) && r.fin.pedidos >= 2 && r.fin.soltados === r.fin.pedidos,
     'al acabar: «Fin de la noche guiada.», vuelve el boton, ninguna parada marcada y la pantalla otra vez libre (' + r.fin.pedidos + ' Wake Lock pedidos, ' + r.fin.soltados + ' soltados)', JSON.stringify({ ult: ult.text, fin: r.fin }));
  /* ── lo que la para y lo que la deja en pausa ── */
  const cortes = await p.evaluate(async () => {
    const A = window.__a, V = window.__voz, out = {};
    TG_CIELO.vozTiempos(30, 1500); V.ms = 4000;
    const empezar = async () => {
      await TG_CIELO.ver('noche'); await A.espera(150);
      if (TG_CIELO.voz().estado !== 'parado') { A.boton('parar').click(); await A.espera(50); }
      const n0 = V.dichos.length;
      A.boton('leer').click(); await A.hasta(() => TG_CIELO.voz().estado === 'hablando' && V.dichos.length > n0);
    };
    await empezar(); TG_CIELO.cerrar(); await A.espera(100);
    out.cerrar = TG_CIELO.voz().estado;
    await empezar(); const f0 = TG_CIELO.estado.fecha; TG_CIELO.cambiarFecha('2026-12-13'); await A.espera(100);
    out.fecha = TG_CIELO.voz().estado; TG_CIELO.cambiarFecha(f0);
    await empezar(); document.querySelector('#cielo-guia .cielo-parada button').click(); await A.espera(400);
    out.llevame = { estado: TG_CIELO.voz().estado, vista: !!document.getElementById('cielo-vista') }; TG_CIELO.cerrarVista(); await A.espera(200);
    await empezar(); const pes = [...document.querySelectorAll('#cielo-pestanas button')].find(x => x.getAttribute('aria-selected') !== 'true'); pes.click(); await A.espera(200);
    out.pestana = { estado: TG_CIELO.voz().estado, pestana: TG_CIELO.estado.pestana };
    await empezar();
    Object.defineProperty(document, 'hidden', { value: true, configurable: true }); Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
    document.dispatchEvent(new Event('visibilitychange')); await A.espera(100);
    out.oculta = TG_CIELO.voz().estado;
    delete document.hidden; delete document.visibilityState;
    await empezar(); window.TG_VOZ.parar(); await A.espera(150);
    out.otroLector = TG_CIELO.voz().estado;
    await empezar(); setLang('fr'); await A.espera(400);
    out.idioma = { estado: TG_CIELO.voz().estado, caja: A.caja() }; setLang('es'); await A.espera(300);
    TG_CIELO.vozTiempos(2, 1500); V.ms = 120;
    return out;
  });
  ok(cortes.cerrar === 'parado' && cortes.fecha === 'parado' && cortes.idioma.estado === 'parado' && /^🔊 Lecture à voix haute/.test(cortes.idioma.caja),
     'se para al cerrar el panel, al cambiar de noche y al cambiar de idioma (y el boton sale en el idioma nuevo: «Lecture à voix haute»)', JSON.stringify(cortes));
  ok(cortes.llevame.estado === 'pausa' && cortes.llevame.vista && cortes.pestana.estado === 'pausa' && cortes.pestana.pestana !== 'noche' && cortes.oculta === 'pausa' && cortes.otroLector === 'pausa',
     'y se queda en pausa con «Llévame» (abre «Apunte al cielo»), en otra pestaña, con la pagina oculta y si el lector de los lugares corta la frase', JSON.stringify(cortes));
  /* ── sin voz, voces que llegan tarde, una voz que falla ── */
  const voces = await p.evaluate(async () => {
    const A = window.__a, V = window.__voz, out = {};
    V.voces = V.todas.filter(v => !(v.voiceURI === 'nl'));                      // en neerlandes, solo la de red
    setLang('nl'); await A.espera(300); await TG_CIELO.ver('noche'); await A.espera(150);
    out.nl = { caja: A.caja(), boton: !!A.boton('leer') };
    V.voces = []; setLang('es'); await A.espera(300); await TG_CIELO.ver('noche'); await A.espera(150);
    out.vacias = { boton: !!A.boton('leer') };
    const n0 = V.dichos.length; A.boton('leer').click(); await A.hasta(() => V.dichos.length > n0);
    out.vacias.dicho = V.dichos[V.dichos.length - 1]; out.vacias.dicho = { lang: out.vacias.dicho.lang, voz: out.vacias.dicho.voz };
    A.boton('parar').click(); await A.espera(100);
    V.voces = V.todas.slice();
    V.modo = 'error'; A.boton('leer').click(); await A.hasta(() => TG_CIELO.voz().estado === 'parado'); await A.espera(100);
    out.error = { estado: TG_CIELO.voz(), caja: A.caja() };
    V.modo = 'mudo'; TG_CIELO.vozTiempos(2, 1200); A.boton('leer').click(); await A.espera(300);
    out.mudo = { antes: TG_CIELO.voz().estado };
    await A.hasta(() => TG_CIELO.voz().estado === 'parado', 4000); await A.espera(100);
    out.mudo.despues = TG_CIELO.voz(); out.mudo.caja = A.caja();
    V.modo = 'normal'; window.speechSynthesis.cancel();
    return out;
  });
  ok(!voces.nl.boton && /^🔇 Dit apparaat heeft geen stem voor deze taal\./.test(voces.nl.caja || ''), 'sin voz del dispositivo para el idioma (en neerlandes solo hay una de red): la nota de como instalarla y ningun boton', JSON.stringify(voces.nl));
  ok(voces.vacias.boton && voces.vacias.dicho.lang === 'es-ES' && voces.vacias.dicho.voz === null, 'si el navegador aun no ha dicho que voces tiene (Safari las da tarde), el boton esta y lee con el idioma puesto (es-ES)', JSON.stringify(voces.vacias));
  ok(voces.error.estado.estado === 'parado' && voces.error.estado.fallo && /⚠️ La voz del dispositivo no ha podido leer el texto\. Pruebe otra vez\./.test(voces.error.caja),
     'una voz que falla (synthesis-failed): se para y lo dice', voces.error.caja);
  ok(voces.mudo.antes === 'hablando' && voces.mudo.despues.estado === 'parado' && voces.mudo.despues.fallo && /⚠️ La voz del dispositivo no ha podido leer/.test(voces.mudo.caja),
     'una voz que no llega a empezar: a los ' + (voces.mudo.despues.vigia / 1000) + ' s se para con el mismo aviso, no se queda colgada', JSON.stringify(voces.mudo));
  /* ── los diez idiomas ── */
  const LOCALE = literal(index, 'var TTS_LOCALE = {') || {};
  const VOZ_DE = { es: 'Mónica', en: 'Daniel', fr: 'Thomas', de: 'Anna', it: 'Alice', nl: 'Xander', zh: 'Tingting', zht: 'Meijia', bg: 'Daria', pl: 'Zosia' };
  const malI = [], resumen = [];
  for (const l of IDI) {
    const x = await p.evaluate(async (l) => {
      const A = window.__a, V = window.__voz;
      TG_CIELO.vozTiempos(1, 1500); V.ms = 60;
      setLang(l); await A.espera(300); await TG_CIELO.ver('noche'); await A.espera(150);
      const tj = A.tarjeta(), n0 = V.dichos.length;
      A.boton('leer').click();
      await A.hasta(() => V.dichos.length >= n0 + 3, 10000);
      const caja = A.caja();
      A.boton('parar').click(); await A.espera(100);
      const d = V.dichos.slice(n0, n0 + 3);
      return { tj, d, caja, espero: A.espero(tj.paradas[0], 0, tj.paradas.length, tj.ref), espero2: A.espero(tj.paradas[1], 1, tj.paradas.length, tj.ref), estado: TG_CIELO.voz().estado };
    }, l);
    const zh = l === 'zh' || l === 'zht';
    const roto = t => /[·{}|]|undefined|NaN|\s{2}|\p{Extended_Pictographic}/u.test(t) || (zh && /\. /.test(t));
    const falta = (t, piezas) => { let desde = 0; return piezas.filter(pz => { const k = t.toLocaleLowerCase().indexOf(pz.toLocaleLowerCase().replace(/[.。]$/, ''), desde); if (k < 0) return true; desde = k; return false; }); };
    if (x.d.length < 3) { malI.push(l + ': ' + x.d.length + ' frases'); continue; }
    if (x.d.some(d => d.lang !== LOCALE[l] || d.voz !== VOZ_DE[l] || d.rate !== 0.95)) malI.push(l + ': voz ' + x.d.map(d => d.lang + '/' + d.voz).join(','));
    if (x.d.some(d => roto(d.text))) malI.push(l + ': texto roto «' + x.d.find(d => roto(d.text)).text.slice(0, 80) + '»');
    if (!x.d[0].text.includes(String(x.tj.paradas.length)) || !x.d[0].text.includes(x.tj.ref)) malI.push(l + ': la intro sin ' + x.tj.paradas.length + ' paradas o sin ' + x.tj.ref + ': «' + x.d[0].text.slice(0, 80) + '»');
    const f1 = falta(x.d[1].text, x.espero), f2 = falta(x.d[2].text, x.espero2);
    if (f1.length || f2.length) malI.push(l + ': falta «' + f1.concat(f2).join('» «').slice(0, 120) + '»');
    if (zh && !x.d[1].text.includes('。')) malI.push(l + ': sin «。»');
    if (x.estado !== 'parado') malI.push(l + ': «Parar» no para');
    resumen.push(l + ' «' + x.d[1].text.slice(0, 48) + '…»');
  }
  ok(!malI.length, 'en los diez idiomas: su voz (' + IDI.map(l => LOCALE[l]).join(', ') + '), la intro con las paradas y la hora, las dos primeras paradas con lo que pone su tarjeta, sin texto roto (en chino, con «。»)', malI.slice(0, 4).join(' · '));
  nota(resumen.slice(0, 4).join(' · '));
  ok(!err.length, 'sin errores de pagina', err.slice(0, 3).join(' · '));
  await ctx.close();
}
