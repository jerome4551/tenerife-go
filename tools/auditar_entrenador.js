#!/usr/bin/env node
/* auditar_entrenador.js — Jérôme, el entrenador: el vídeo de cada ejercicio de «Su cuerpo»
 * (modulos/entrenador.js, 11 de noviembre de 2026).
 *
 *     python3 -m http.server 8766 &      (desde la raíz del repo)
 *     node tools/auditar_entrenador.js 8766
 *     node tools/auditar_entrenador.js 8766 72           un pase PARCIAL: en la sección 2, solo los vídeos del trozo src/72-*.js,
 *                                                        y en la 4 (Samsung Internet), todos esos y no tres de muestra
 *     node tools/auditar_entrenador.js 8766 id1,id2      o solo esos ejercicios (mientras se hace un bloque; la entrega se audita entera)
 *
 * 1. Sin navegador:
 *    · el módulo y sus trozos son los que salen de sus fuentes (tools/entrenador/construir.py --comprobar);
 *    · POR TROZOS (16 de noviembre de 2026: el motor y las coreografías del bloque 1 van en modulos/entrenador.js y las
 *      demás, por grupos, en modulos/entrenador/<grupo>.<huella>.js): lo que el motor trae él solo; pedir(id); que cada
 *      trozo es el fichero que su nombre dice (la huella es la de su contenido) y no hay otros; que cada trozo recibe del
 *      motor todo lo que usa de él (la lista de lo que el motor declara, contada de verdad); y que al llegar un trozo
 *      aparecen sus coreografías y solo esas;
 *    · cada coreografía es de un ejercicio que existe, y tiene un tramo por cada paso de su ficha,
 *      en los once idiomas;
 *    · LA FICHA NO HA CAMBIADO desde que se hizo la coreografía: la huella de sus pasos en
 *      castellano es la apuntada (si cambia un paso, la coreografía se revisa antes de volver a
 *      construir; mientras tanto esto queda en rojo);
 *    · cada coreografía, por dentro: las posturas que nombra existen, lo clavado se entiende, el
 *      material es de los que hay, y ninguna postura clave da un número imposible ni mete un pie
 *      bajo el suelo;
 *    · LOS CONTACTOS (16 de noviembre de 2026), en cada tramo, en cada postura mantenida y en el vídeo cuadro a cuadro
 *      (tools/entrenador/pruebas/contactos.js): ninguna zapatilla ni ninguna mano se hunde más de 1 cm en el suelo o en
 *      una pared; la mano que se apoya, toca; el cuerpo no atraviesa el suelo ni las paredes; las manos no se meten en
 *      los muslos, y lo que el Director las aparta no da tirones; y (20 de noviembre de 2026) ninguna barra, tubo, asa o
 *      ramal de cuerda del material se le mete en la cabeza, y el pie que no se mueve no se va por el camino; y (bloque 15)
 *      nada del cuerpo se hunde en una pelota —un fitball, un balón medicinal—, y el fitball no se queda en el aire;
 *    · LO QUE SALTA, LO QUE SE DOBLA Y LO QUE GIRA DE GOLPE (22 de noviembre de 2026), en el vídeo cuadro a cuadro: las rodillas no
 *      doblan hacia atrás; ninguna rodilla ni ningún codo cambian de lado, y nada cambia de sitio, de un cuadro al siguiente;
 *      la mano no gira de golpe; lo que va recto y clavado no se dobla de paso; y los tramos enlazan;
 *    · los gestos del presentador (saluda, la visera, «¡vamos!», el consejo, el pulgar…): sus posturas
 *      existen, ninguna mano levantada se sale del cuadro y ninguna va más deprisa de lo que se ve;
 *    · la voz: con las voces que enseña un iPhone (las «Eloquence», robóticas), un PC o un Android,
 *      nunca se elige una robótica ni una de red, y si no hay ninguna que valga no se ofrece;
 *    · los textos propios (TG_ENTRENADOR.textos), en los once idiomas y con sus {huecos};
 *    · el módulo: sin eval, sin console.log, y sin innerHTML que reciba un texto de la ficha;
 *    · los enganches: el CARGA-PEREZOSA y la ruta en index.html, el precache y «red primero» en
 *      sw.js, y la ficha de modulos/cuerpo.js (el hueco del vídeo, y que se quita al salir). Y los de los trozos: que
 *      «Su cuerpo» pide la coreografía antes de preguntar por ella y guarda los trozos para verlos sin conexión, que
 *      viajan en el paquete de las tiendas (tools/app_preparar.js), que tools/fuente.js los ve, y que sw.js, sin
 *      tocarlo y con caches y red de mentira, los guarda al pedirlos y después los sirve sin red.
 * 2. En Chromium. LOS TROZOS (pruebas/trozos.html: el motor solo, como lo carga la app): no se pide ninguno hasta que hace
 *    falta; pedir(id) trae el suyo, una vez, y ningún otro; si no llega o llega vacío, falla, y al pedirlo otra vez, llega;
 *    todo() trae los que faltan. Y móvil emulado (320 de ancho, el más estrecho): el vídeo de CADA ejercicio, entero,
 *    cuadro a cuadro, en castellano y en otro idioma (los otros diez van rotando): acaba, dura lo que
 *    tiene que durar, lo que se lee en cada paso es el paso de la ficha, palabra por palabra, no
 *    hay ningún NaN en el dibujo y nada se sale de ancho; LA LEYENDA DE MÚSCULOS (16 de noviembre de 2026) va en su fila bajo el
 *    vídeo (en una pantalla baja, detrás de la tarjeta del paso) y, con los nombres de la app en los once idiomas, no pisa el dibujo, el paso ni los mandos, ni se sale de ancho; Jérôme no se sale del cuadro; y el dibujo está hecho solo de lo
 *    que el canvas de Samsung Internet sabe copiar (trazados, círculos, elipses y rectángulos). Y CADA SECUENCIA CABE EN SU PASO, en
 *    los once idiomas: un paso dura lo que se tarda en leer su texto, no lo que dure su acción, y una secuencia más larga se
 *    quedaría a medias al entrar el paso siguiente (la cuenta se coteja con lo que dura cada paso en el reproductor). Y A CÁMARA LENTA
 *    («½×», 14 de noviembre de 2026) se ve lo mismo, más despacio: el paso dura lo que su movimiento, la repetición va al acabar cada
 *    paso por el mismo punto, y de cerca todo dura lo mismo (con unos de muestra; en un pase parcial, con todos los que se piden).
 *    Y EL MOVIMIENTO, medido en cada cuadro:
 *    lo clavado no se mueve (el pie en el suelo, la mano en la barra) aunque Jérôme respire y
 *    reparta el peso; nada se teletransporta de un cuadro al siguiente; respira; la cabeza y el
 *    tupé no se pasan de vueltas; y de cerca ninguna mano se sale del cuadro. Y EL DIBUJO, también en
 *    cada cuadro y desde las dos vistas (en castellano, la primera; en el otro idioma, la de «Girar»):
 *    el tronco entero cabe en su silueta, el estampado no se queda a medio borrar, un músculo encendido
 *    no se queda en un borrón y los avisos duran lo que una mirada. Y LA CABEZA, que es una
 *    sola y gira de verdad: vista desde 72 lados, sin números imposibles, con los rasgos que tocan
 *    (de frente, los dos ojos; de perfil, uno; de espaldas, ninguno y el nudo de la cinta).
 * 3. En la app de verdad: «Su cuerpo» → un grupo → una ficha con coreografía: el vídeo sale, no
 *    arranca solo, se pone en marcha al tocarlo, sigue al cambiar de tema, no se reinicia al
 *    guardar unas series y se quita al volver; en una ficha sin coreografía no sale nada. LOS TROZOS EN LA APP (16 de
 *    noviembre de 2026): para una ficha del bloque 1 se pide el motor y ningún trozo; para una cuya coreografía va en un
 *    trozo, ese y solo ese; si el trozo no llega, la ficha queda como estaba (sin vídeo y sin botón). Y CON EL SERVICE
 *    WORKER DE VERDAD (lo demás va sin él), en un navegador aparte que no resuelve ningún nombre de fuera: al abrir con
 *    conexión la lista de un grupo se guardan todos los trozos sin poner en marcha el motor, y el de un motor anterior se
 *    quita de la cache; después, sin conexión, una ficha de un trozo que nunca se abrió trae su vídeo, y también
 *    arrancando la app sin conexión. Y GUARDARLOS ES APARTE (17 de noviembre de 2026): con «ahorrar datos», o por una
 *    conexión 2g, no se guarda ninguno; y donde el navegador no deja ni leer navigator.serviceWorker (lanza un error),
 *    la lista de ejercicios y el vídeo salen igual.
 * 4. Con Samsung Internet (12 de noviembre de 2026): el vídeo en un canvas que copia su SVG (su modo oscuro
 *    repinta los SVG): el mismo dibujo, se repinta solo, el modo oscuro forzado no lo cambia; en otro navegador, nada.
 *    Entero, con tres ejercicios de muestra; en un pase parcial, con todos los que se piden.
 * Cero errores de página. Sale con 1 si algo falla.
 */
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process'), crypto = require('crypto'), vm = require('vm');
const RAIZ = path.join(__dirname, '..');
const PUERTO = process.argv[2] || '8766';
const MARGEN = 4;                         /* px (de los 400 de ancho del dibujo) que le tienen que quedar a Jérôme hasta el borde del cuadro */
/* lo que el canvas de Samsung Internet copia del dibujo (tools/entrenador/src/85-lienzo.js: ruta y pieza); una pieza de otro tipo
   (line, polygon, polyline, text, use, image…), o con máscara o filtro, allí no se pintaría, y nadie lo vería en Chromium */
const COPIA = ['g', 'path', 'circle', 'ellipse', 'rect', 'defs', 'clipPath', 'linearGradient', 'radialGradient', 'stop', 'title', 'desc'];
const SOLO = process.argv[3] || '';       /* '72' (un trozo de coreografías) o 'id1,id2': un pase parcial de la sección 2 */
const SITIO = 'http://127.0.0.1:' + PUERTO + '/';
const LANGS = ['es', 'en', 'fr', 'de', 'it', 'nl', 'zh', 'zht', 'bg', 'pl', 'ro'];
const HUECO = /\{(\w+)\}/g;
let fallos = 0, hechos = 0;
function ok(c, txt, det) { hechos++; if (c) console.log('  OK  ' + txt); else { fallos++; console.log('  MAL ' + txt + (det !== undefined ? '   -> ' + (typeof det === 'string' ? det : JSON.stringify(det)) : '')); } }
function info(txt) { console.log('  ··  ' + txt); }
const lee = f => fs.readFileSync(path.join(RAIZ, f), 'utf8');
const huella = pasos => crypto.createHash('sha256').update(pasos.join('\n'), 'utf8').digest('hex').slice(0, 12);

(async () => {
  console.log('════ 1. el módulo, las coreografías y los enganches (sin navegador) ════');
  const mod = lee('modulos/entrenador.js');
  const cons = cp.spawnSync('python3', [path.join(RAIZ, 'tools', 'entrenador', 'construir.py'), '--comprobar'], { encoding: 'utf8' });
  ok(cons.status === 0, 'modulos/entrenador.js y sus trozos (modulos/entrenador/) son los que salen de tools/entrenador/src/ (construir.py --comprobar)', (cons.stdout || cons.stderr || '').trim().slice(0, 300));
  /* el módulo, cargado sin navegador: solo define cosas. Primero el motor solo; sus trozos, más abajo y de uno en uno */
  const MOTOR = require('./entrenador/pruebas/motor.js');
  const caja = { window: {}, document: {}, Math, Object, Array, JSON, String, Number, RegExp, Error, console: { log() {} } };
  const E = MOTOR.carga(caja, null, false);
  ok(E && typeof E.tiene === 'function' && typeof E.montar === 'function' && typeof E.ids === 'function' && typeof E.pedir === 'function' && typeof E.trozos === 'function' && typeof E.todo === 'function',
    'TG_ENTRENADOR: pedir, tiene, montar, ids, trozos, todo');
  const ids = E.ids(), T = E._;
  const EJ = {}; JSON.parse(lee('datos/cuerpo/ejercicios.json')).ejercicios.forEach(e => { EJ[e.id] = e; });
  const TX = {}; LANGS.forEach(l => { TX[l] = JSON.parse(lee('datos/cuerpo/ejercicios-' + l + '.json')); });
  info(ids.length + ' ejercicios con vídeo, de ' + Object.keys(EJ).length);
  /* POR TROZOS (16 de noviembre de 2026). modulos/entrenador.js lleva el motor y las coreografías del bloque 1; las demás van por
     grupos en modulos/entrenador/<grupo>.<huella>.js y en la app se piden al abrir una ficha (TG_ENTRENADOR.pedir). Aquí, sin
     navegador: lo que el motor trae él solo; que cada trozo es el fichero que su nombre dice (la huella es la de su contenido) y
     que en la carpeta no hay otros; que cada trozo recibe del motor todo lo que usa de él; y que al llegar un trozo aparecen sus
     coreografías y solo esas. Lo que pasa en un navegador (qué se pide y cuándo, y si un trozo no llega), en la sección 2 */
  const nucleoIds = Object.keys(T.COREO), deTrozo = ids.filter(id => nucleoIds.indexOf(id) < 0);
  const TROZOS = E.trozos(), dirT = path.join(RAIZ, 'modulos', 'entrenador'), trozoDe = {};
  {
    ok(nucleoIds.length > 0 && deTrozo.length > 0 && new Set(ids).size === ids.length && ids.slice(0, nucleoIds.length).join() === nucleoIds.join()
       && nucleoIds.every(id => E.tiene(id)) && deTrozo.every(id => !E.tiene(id) && E.montar({}, { id: id, pasos: (TX.es[id] || [0, []])[1] }) === null),
      'el motor solo: trae las ' + nucleoIds.length + ' coreografías del bloque 1; de las otras ' + deTrozo.length + ' sabe cuáles son (ids), pero no las tiene ni las monta hasta que llega su trozo');
    const p1 = await E.pedir(nucleoIds[0]), p2 = await E.pedir('no-existe'), p3 = await E.pedir('toString');
    let p4 = 'llegó'; try { await E.pedir(deTrozo[0]); } catch (e) { p4 = 'falla'; }
    ok(p1 === true && p2 === false && p3 === false && p4 === 'falla' && !E.tiene(deTrozo[0]),
      'pedir(id): sí para una del motor, no para un ejercicio sin coreografía, y falla limpio si su trozo no se puede traer (aquí no hay de dónde)', [p1, p2, p3, p4]);
    const enCarpeta = fs.existsSync(dirT) ? fs.readdirSync(dirT).sort() : [], sha8 = f => crypto.createHash('sha256').update(fs.readFileSync(path.join(dirT, f))).digest('hex').slice(0, 8);
    const malNombre = TROZOS.filter(f => !/^[a-z0-9-]+\.[0-9a-f]{8}$/.test(f) || !fs.existsSync(path.join(dirT, f + '.js')) || sha8(f + '.js') !== f.split('.')[1]);
    ok(TROZOS.length > 0 && !malNombre.length && enCarpeta.join() === TROZOS.map(f => f + '.js').sort().join(),
      'los ' + TROZOS.length + ' trozos que nombra el motor están en modulos/entrenador/, cada uno con la huella de su contenido en el nombre, y en la carpeta no hay más',
      { mal: malNombre, sobran: enCarpeta.filter(f => TROZOS.indexOf(f.replace(/\.js$/, '')) < 0) });
    const declarados = (mod.match(/CARGA-PEREZOSA: modulos\/entrenador\/[a-z0-9-]+\.[0-9a-f]{8}\.js/g) || []).map(q => q.replace(/^.*\//, '').replace(/\.js$/, ''));
    ok(declarados.join() === TROZOS.join(), 'el motor los declara en su cabecera (CARGA-PEREZOSA), los mismos y en el mismo orden: de ahí los leen tools/fuente.js, el paquete de las tiendas y «Su cuerpo» para guardarlos', declarados);
    /* lo que el motor declara de verdad en su nivel de arriba: sus fuentes, sin la envoltura, corridos en el ámbito global de un
       contexto nuevo (lo que se declara allí con var o function queda como propiedad del global). construir.py saca esa lista
       leyendo el texto; si se le escapara un nombre, un trozo lo usaría sin recibirlo y fallaría al llegar o, peor, a mitad de un vídeo */
    const esFuenteTrozo = n => /^7[1-9a-z][0-9a-z]*-[a-z0-9-]+\.js$/.test(n), fuentesSrc = fs.readdirSync(path.join(RAIZ, 'tools/entrenador/src')).filter(n => /\.js$/.test(n)).sort();
    const nodoG = () => ({ style: {}, setAttribute() {}, appendChild(c) { return c; } });
    const globalM = { window: {}, document: { createElementNS: nodoG, createElement: nodoG }, Math, Object, Array, JSON, String, Number, RegExp, Error, console: { log() {} } }, antesG = new Set(Object.keys(globalM));
    vm.runInContext("'use strict';\n" + fuentesSrc.filter(n => !esFuenteTrozo(n)).map(n => lee('tools/entrenador/src/' + n)).join('\n'), vm.createContext(globalM), { filename: 'tools/entrenador/src (el motor)' });
    const declara = Object.keys(globalM).filter(k => !antesG.has(k)), sinRecibir = [], idsDeFuente = {};
    fuentesSrc.filter(esFuenteTrozo).forEach(n => {
      const nombre = n.replace(/^7[0-9a-z]+-/, '').replace(/\.js$/, ''), f = TROZOS.filter(q => q.split('.')[0] === nombre)[0], fuente = lee('tools/entrenador/src/' + n);
      if (!f) { sinRecibir.push(n + ': no tiene trozo'); return; }
      const js = fs.readFileSync(path.join(dirT, f + '.js'), 'utf8'), corte = js.indexOf(fuente.slice(0, 80)), cab = corte > 0 ? js.slice(0, corte) : '';
      const recibe = new Set(((/\n    var ([\s\S]*?);\n/.exec(cab) || [0, ''])[1]).split(',').map(q => q.trim().split(' = N.')[0])), usa = new Set(fuente.match(/[A-Za-z_$][\w$]*/g));
      if (!cab) sinRecibir.push(f + ': no lleva dentro su fuente (' + n + ')');
      declara.filter(k => usa.has(k) && !recibe.has(k)).forEach(k => sinRecibir.push(f + ': usa ' + k + ' y no lo recibe'));
      idsDeFuente[f] = (fuente.match(/^\s*COREO(?:\['[a-z0-9-]+'\]|\.[a-z0-9_]+) = /gm) || []).map(q => (/\['([a-z0-9-]+)'\]/.exec(q) || /\.([a-z0-9_]+) = /.exec(q))[1]);
    });
    ok(declara.length > 200 && !sinRecibir.length && Object.keys(idsDeFuente).length === TROZOS.length,
      'cada trozo recibe del motor todo lo que usa de él (el motor declara ' + declara.length + ' nombres, contados de verdad y no leyendo el texto)', sinRecibir.slice(0, 6));
    /* y ahora llegan, de uno en uno */
    const malLlega = []; let llevan = nucleoIds.slice();
    TROZOS.forEach(f => {
      const antes = Object.keys(T.COREO), hAntes = Object.keys(E.huellas).length, suyas = idsDeFuente[f] || [];
      try { vm.runInContext(fs.readFileSync(path.join(dirT, f + '.js'), 'utf8'), caja, { filename: 'modulos/entrenador/' + f + '.js' }); } catch (e) { malLlega.push(f + ': ' + e.message); return; }
      const nuevas = Object.keys(T.COREO).filter(id => antes.indexOf(id) < 0);
      if (nuevas.join() !== suyas.join()) malLlega.push(f + ': trae ' + nuevas.length + ' coreografías y su fuente tiene ' + suyas.length);
      if (!suyas.every(id => E.tiene(id) && typeof E.huellas[id] === 'string') || Object.keys(E.huellas).length !== hAntes + suyas.length) malLlega.push(f + ': tiene() o las huellas de sus pasos');
      llevan = llevan.concat(suyas); suyas.forEach(id => { trozoDe[id] = f; });
      if (!ids.filter(id => llevan.indexOf(id) < 0).every(id => !E.tiene(id))) malLlega.push(f + ': deja ver coreografías de un trozo que no ha llegado');
    });
    let otro = false;
    E._trozo('no-es-de-este-motor', () => { otro = true; return {}; }); E._trozo(TROZOS[0].split('.')[0], () => { otro = true; return {}; });
    ok(!malLlega.length && llevan.join() === ids.join() && Object.keys(T.COREO).join() === ids.join() && !otro && (await E.pedir(deTrozo[0])) === true,
      'al llegar cada trozo aparecen sus coreografías y solo esas, en el orden de ids(); uno que no es de este motor, o que ya llegó, no hace nada', malLlega.slice(0, 6));
  }
  if (Object.keys(T.COREO).length !== ids.length) { console.log('\n  Faltan coreografías (un trozo no ha llegado entero): lo demás no se puede mirar.\n  ' + fallos + ' de ' + hechos + ' controles EN ROJO'); process.exit(1); }
  /* el motor y sus trozos, juntos: lo que se mira en todo el texto del módulo */
  const modTodo = [mod].concat(TROZOS.map(f => fs.readFileSync(path.join(dirT, f + '.js'), 'utf8'))).join('\n');
  /* un pase parcial: los vídeos que se pasan cuadro a cuadro (lo demás se comprueba igual, de todos) */
  let idsVideo = ids;
  if (/^\d[\da-z]$/.test(SOLO)) {
    const trozo = fs.readdirSync(path.join(RAIZ, 'tools/entrenador/src')).filter(n => n.indexOf(SOLO + '-') === 0)[0], fuente = trozo ? lee('tools/entrenador/src/' + trozo) : '';
    idsVideo = ids.filter(id => fuente.indexOf("COREO['" + id + "'] = ") >= 0 || fuente.indexOf('COREO.' + id + ' = ') >= 0);
  } else if (SOLO) idsVideo = SOLO.split(',').filter(id => ids.indexOf(id) >= 0);
  const PARCIAL = idsVideo.length !== ids.length;
  if (SOLO && !idsVideo.length) { console.log('  MAL «' + SOLO + '» no es un trozo de coreografías ni una lista de ejercicios con vídeo'); process.exit(1); }
  if (PARCIAL) info('PASE PARCIAL: cuadro a cuadro, solo ' + idsVideo.length + ' de los ' + ids.length + ' vídeos');
  ok(ids.length > 0 && ids.every(id => EJ[id]), 'cada coreografía es de un ejercicio que existe', ids.filter(id => !EJ[id]));
  const sinPasos = [], otraFicha = [];
  ids.forEach(id => {
    const n = (T.COREO[id].pasos || []).length;
    LANGS.forEach(l => { const t = TX[l][id]; if (!t || !Array.isArray(t[1]) || t[1].length !== n) sinPasos.push(id + ' (' + l + ': ' + (t && t[1] ? t[1].length : 'no está') + ' pasos, la coreografía ' + n + ')'); });
    if (TX.es[id] && E.huellas[id] !== huella(TX.es[id][1])) otraFicha.push(id);
  });
  ok(!sinPasos.length, 'cada coreografía tiene un tramo por cada paso de su ficha, en los once idiomas', sinPasos.slice(0, 6));
  ok(!otraFicha.length && Object.keys(E.huellas).length === ids.length, 'las fichas no han cambiado desde que se hicieron sus coreografías (la huella de los pasos en castellano)', otraFicha);
  ok(ids.every(id => E.tiene(id, TX.es[id][1].length)) && !E.tiene(ids[0], TX.es[ids[0]][1].length + 1) && !E.tiene('no-existe') && !E.tiene('toString') && !E.tiene('constructor'),
    'tiene(id, pasos): sí con los pasos de la ficha; no con otros, ni con un ejercicio sin coreografía');
  /* (15-11-2026) el índice con el que «Su cuerpo» pone 🎬 en las listas sin pedir este módulo: los mismos ejercicios, y con
     ellos tiene() dice que sí; si sobrara uno, la lista prometería un vídeo que la ficha no enseña, y si faltara, se perdería */
  let CV = null; try { CV = JSON.parse(lee('datos/cuerpo/con-video.json')).pasos; } catch (e) {}
  const cvIds = CV && typeof CV === 'object' ? Object.keys(CV) : [];
  ok(!!CV && cvIds.length === ids.length && ids.every(id => CV[id] === TX.es[id][1].length) && cvIds.every(id => E.tiene(id, CV[id])),
    'datos/cuerpo/con-video.json: los ' + ids.length + ' ejercicios con vídeo y los pasos de su ficha, y con ellos tiene() dice que sí',
    { sobran: cvIds.filter(id => ids.indexOf(id) < 0).slice(0, 5), faltan: ids.filter(id => !CV || !(id in CV)).slice(0, 5) });
  /* cada coreografía, por dentro */
  const mal = [];
  const CLAVO = /^([mt][id])(?:@(\d+):(-?[\d.]+))?(?:=(-?[\d.]+),(-?[\d.]+),(-?[\d.]+))?$/;
  const finito = v => Array.isArray(v) && v.length === 3 && v.every(q => typeof q === 'number' && isFinite(q));
  ids.forEach(id => {
    const co = T.COREO[id], P = co.posturas || {}, hay = n => typeof n === 'string' && !!P[n], peros = [];
    const usadas = new Set(), clavos = [].concat(co.clavos || []);
    const tramos = l => (l || []).forEach(s => { usadas.add(s[0]); if (s[1] != null && !(s[1] > 0)) peros.push('un tramo sin duración'); if (s[2] != null && !T.CURVA[s[2]]) peros.push('curva ' + s[2]); if (s[3]) s[3].forEach(c => clavos.push(c)); });
    usadas.add(co.inicio || 'a'); tramos(co.rep);
    (co.pasos || []).forEach(p => { if (typeof p === 'string') { if (p !== 'rep' && p !== 'nota') usadas.add(p); } else if (p && p.sec) { if (p.desde) usadas.add(p.desde); tramos(p.sec); } else if (!(p && p.rep != null)) peros.push('un paso que no se entiende'); });
    ['encuadra', 'reposo', 'sinClavos'].forEach(k => (co[k] || []).forEach(n => usadas.add(n)));
    /* lo clavado mientras mantiene una postura, si no es lo de siempre (clavosEn: { postura: [clavos] }) */
    if (co.clavosEn != null && (typeof co.clavosEn !== 'object' || Array.isArray(co.clavosEn))) peros.push('clavosEn');
    else Object.keys(co.clavosEn || {}).forEach(n => { usadas.add(n); if (!Array.isArray(co.clavosEn[n])) peros.push('clavosEn.' + n); else co.clavosEn[n].forEach(c => clavos.push(c)); });
    if (co.isometrico) usadas.add(co.isometrico);
    /* lo tenso (tensos: ['ti', 'td', 'mi', 'md']): de lo que la coreografía lleva clavado */
    if (co.tensos != null && (!Array.isArray(co.tensos) || co.tensos.some(q => !/^[mt][id]$/.test(q) || !clavos.some(c => String(c).slice(0, 2) === q)))) peros.push('tensos');
    usadas.forEach(n => { if (!hay(n)) peros.push('postura «' + n + '» no existe'); });
    if ((co.pasos || []).some(p => p === 'rep' || (p && p.rep != null)) && !(co.rep || []).length) peros.push('pasos con repetición, sin repetición');
    clavos.forEach(c => { const m = CLAVO.exec(c); if (!m) peros.push('clavo ' + c); else if (m[2] != null && !(co.material || [])[Number(m[2])]) peros.push('clavo ' + c + ': no hay ese material'); });
    (co.esfuerzo || []).forEach(i => { if (!(i >= 0 && i < (co.rep || []).length)) peros.push('esfuerzo ' + i); });
    if (co.rastro && !T.PUNTOS[co.rastro]) peros.push('rastro ' + co.rastro);
    (co.material || []).forEach(m => { if (!T.MATERIAL[m[0]]) peros.push('material ' + m[0]); });
    /* una vista es un rumbo, o [rumbo, picado] si esa se mira desde otra altura */
    const num = v => typeof v === 'number' && isFinite(v);
    if (!Array.isArray(co.vista) || co.vista.length < 1 || co.vista.length > 2 || !co.vista.every(v => num(v) || (Array.isArray(v) && v.length === 2 && num(v[0]) && num(v[1]) && v[1] >= 0 && v[1] <= 60))) peros.push('vista');
    if (co.picado != null && !(num(co.picado) && co.picado >= 0 && co.picado <= 60)) peros.push('picado');
    /* las posturas clave: todo número, y los pies no bajan del suelo (ni de lo que pisan) */
    Object.keys(P).forEach(n => {
      let S; try { S = T.resolver(P[n]); } catch (e) { peros.push('postura ' + n + ': ' + e.message); return; }
      ['i', 'd'].forEach(k => {
        ['hom', 'cod', 'mun', 'cad', 'rod', 'tob', 'talon', 'dedosPie', 'dedos'].forEach(q => { if (!finito(S[k][q])) peros.push('postura ' + n + ': ' + q + ' ' + k + ' sin número'); });
        /* la zapatilla, como se dibuja (bajoZapa, en 20-figura.js: el punto más bajo de su piso, que se dobla por la bola del pie): plana pisa a 0 */
        if (finito(S[k].suela) && finito(S[k].punta) && finito(S[k].arriba)) {
          const bajo = T.bajoZapa(S[k], k);
          if (!(bajo > -1.2)) peros.push('postura ' + n + ': la zapatilla ' + k + ' se hunde ' + (-bajo).toFixed(1) + ' cm en el suelo');
        }
      });
      if (!finito(S.pel) || !finito(S.cab)) peros.push('postura ' + n + ': el tronco sin número');
    });
    if (peros.length) mal.push(id + ': ' + Array.from(new Set(peros)).slice(0, 4).join('; '));
  });
  ok(!mal.length, 'las ' + ids.length + ' coreografías, por dentro: posturas, tramos, clavos, material, y ninguna postura imposible', mal.slice(0, 6));
  /* LOS CONTACTOS (16 de noviembre de 2026). Lo de arriba mira las posturas clave; esto, también lo que pasa entre dos, y con todo
     lo que se dibuja (no solo los pies): tools/entrenador/pruebas/contactos.js recorre cada tramo de la repetición y de las secuencias
     con el Director de verdad, y el vídeo entero cuadro a cuadro con Jérôme respirando, y mide con las cuentas del dibujo. Lo que se
     apoya, toca; y nada atraviesa el suelo, una pared ni un muslo. Los límites, en CT.LIMITES (cm) */
  const CT = require('./entrenador/pruebas/contactos.js'), TC = CT.carga(), fuera = {};
  ids.forEach(id => {
    let malC; try { malC = CT.juzga(CT.mide(TC, id), CT.video(TC, id, TX.es[id] ? TX.es[id][1] : [])); } catch (e) { malC = [{ que: 'error', v: 0, donde: e.message }]; }
    malC.forEach(q => { (fuera[q.que] = fuera[q.que] || []).push(id + ': ' + (q.v ? q.v + (/gira|dobla/.test(q.que) ? '° · ' : ' cm · ') : '') + q.donde); });
  });
  const deC = (...c) => [].concat(...c.map(q => fuera[q] || []));
  ok(!deC('error').length, 'los contactos de las ' + ids.length + ' coreografías se pueden medir (cada tramo, cada postura mantenida y el vídeo cuadro a cuadro)', deC('error').slice(0, 4));
  ok(!deC('zapa-suelo', 'zapa-pared').length, 'el camino de los pies: en ningún tramo ni postura una zapatilla se hunde más de 1 cm en el suelo ni en una pared', deC('zapa-suelo', 'zapa-pared').slice(0, 6));
  ok(!deC('mano-suelo', 'mano-pared').length, 'las manos: ninguna se hunde más de 1 cm en el suelo ni en una pared', deC('mano-suelo', 'mano-pared').slice(0, 6));
  ok(!deC('apoyada', 'hueco').length, 'la mano que se apoya (en el suelo, en una pared, en un banco o en una pelota) toca: queda a menos de 1 cm; y ninguna mano abierta se queda delante de una superficie sin tocarla', deC('apoyada', 'hueco').slice(0, 6));
  ok(!deC('cuerpo-suelo', 'cuerpo-pared', 'tronco-suelo', 'tronco-pared', 'cabeza-suelo', 'cabeza-pared').length, 'el cuerpo no atraviesa el suelo ni las paredes (brazos y piernas, ni 2,5 cm; tumbado, el tronco y la cabeza se asientan menos de 4)',
    deC('cuerpo-suelo', 'cuerpo-pared', 'tronco-suelo', 'tronco-pared', 'cabeza-suelo', 'cabeza-pared').slice(0, 6));
  ok(!deC('mano-muslo', 'mano-muslo-quieta', 'mano-muslo-vida', 'mano-muslo-quieta-vida').length, 'las manos no se meten en los muslos: quietas, ni 1 cm (tampoco en el vídeo, mientras respira y se balancea); de paso, ni 2',
    deC('mano-muslo', 'mano-muslo-quieta', 'mano-muslo-vida', 'mano-muslo-quieta-vida').slice(0, 6));
  ok(!deC('tiron').length, 'lo que el Director aparta una mano de un muslo no da tirones (cambia a menos de ' + CT.LIMITES.tiron + ' cm/s)', deC('tiron').slice(0, 6));
  /* LA CABEZA Y LAS BARRAS (20 de noviembre de 2026). Nada de lo de arriba miraba el material que no es suelo, pared ni banco: en
     nueve vídeos una barra o los ramales de una cuerda le cruzaban la cabeza (hasta 13 cm) y la auditoría salía verde. Ahora al
     material se le hace pintar con Cilindro.pon espiado y se mide la cabeza contra cada cilindro que dibuja, sea de lo que sea */
  ok(!deC('cabeza-barra', 'cabeza-barra-vida').length, 'la cabeza y las barras: ningún cilindro del material (una barra, un tubo o un asa de una máquina, un mango, un ramal de cuerda) se le mete en la cabeza más de ' +
    String(-CT.LIMITES['cabeza-barra']).replace('.', ',') + ' cm en ningún tramo ni postura, ni más de ' + String(-CT.LIMITES['cabeza-barra-vida']).replace('.', ',') + ' en el vídeo cuadro a cuadro', deC('cabeza-barra', 'cabeza-barra-vida').slice(0, 6));
  ok(!deC('pie-deriva').length, 'el pie que no se mueve, no se va: el tobillo que acaba un tramo donde lo empezó no se aparta más de ' + CT.LIMITES['pie-deriva'] + ' cm por el camino (lo que apoya y no se mueve va clavado)', deC('pie-deriva').slice(0, 6));
  /* LO QUE SALTA, LO QUE SE DOBLA Y LO QUE GIRA DE GOLPE (22 de noviembre de 2026). Todo lo de arriba mira dónde está cada cosa en un
     instante; nada miraba cómo llega de un cuadro al siguiente, y el vídeo se ve seguido. Con el vídeo entero, cuadro a cuadro, salió
     lo que no se veía en ninguna postura: rodillas que doblaban hacia atrás un instante (33 vídeos), rodillas y codos que cambiaban
     de lado de un cuadro al siguiente (30), manos que daban media vuelta de golpe (83), piernas y brazos clavados y rectos que se
     doblaban de paso (66) y tramos que no enlazaban con el siguiente (8). Lo de fondo se arregló en el motor (60-director.js: lo
     tenso; 10-esqueleto.js: la rodilla, hacia delante; sinGolpe: la mano gira como mucho 600°/s) y el resto, vídeo a vídeo */
  ok(!deC('rodilla-reves', 'rodilla-reves-vida').length, 'las rodillas no doblan hacia atrás: ninguna cae más de ' + String(CT.LIMITES['rodilla-reves']).replace('.', ',') + ' cm por detrás de la línea de su pierna, en ningún tramo ni postura ni en el vídeo cuadro a cuadro',
    deC('rodilla-reves', 'rodilla-reves-vida').slice(0, 6));
  ok(!deC('lado', 'pico').length, 'nada salta: de un cuadro al siguiente, ninguna rodilla ni ningún codo cambian de lado (' + String(CT.LIMITES.lado).replace('.', ',') + ' cm de más sobre lo que viaja su miembro) y ningún punto del cuerpo cambia de sitio de golpe (se mueve más de dos veces y media lo que en el cuadro de antes y en el de después, y 2 cm)',
    deC('lado', 'pico').slice(0, 6));
  ok(!deC('mano-gira', 'mano-gira-rep').length, 'la mano no gira de golpe: en lo que se ve, como mucho ' + CT.LIMITES['mano-gira'] + '° de un cuadro al siguiente; y dentro de la repetición, lo que el Director tiene que frenarla no pasa de ' + CT.LIMITES['mano-gira-rep'] + '° (si pasa, es que la postura no dice hacia dónde mira la palma)',
    deC('mano-gira', 'mano-gira-rep').slice(0, 6));
  ok(!deC('dobla-clavado', 'dobla-rep-viaja', 'dobla-rep-libre', 'dobla-rep').length, 'lo recto no se dobla de paso: la pierna o el brazo clavados que van rectos en las dos posturas de un tramo no se doblan más de ' + CT.LIMITES['dobla-clavado'] + '° por el camino; y en la repetición, lo clavado que viaja, ni ' +
    CT.LIMITES['dobla-rep-viaja'] + '°, lo libre, ni ' + CT.LIMITES['dobla-rep-libre'] + '°, y nada se dobla de paso ' + CT.LIMITES['dobla-rep'] + '° más que en sus dos puntas (lo que se dobla tanto lo dice una postura)',
    deC('dobla-clavado', 'dobla-rep-viaja', 'dobla-rep-libre', 'dobla-rep').slice(0, 6));
  ok(!deC('enlace').length, 'los tramos enlazan: donde acaba un tramo empieza el siguiente, y donde acaba una secuencia, la postura en la que se queda (ningún punto del cuerpo a más de ' + String(CT.LIMITES.enlace).replace('.', ',') + ' cm)', deC('enlace').slice(0, 6));
  /* LAS PELOTAS (bloque 15, 20 de noviembre de 2026). El fitball y el balón medicinal tampoco son suelo, pared ni banco: se espía
     Esfera.pon igual que Cilindro.pon y se mide cada pieza del cuerpo, tal como se dibuja, contra cada pelota que pinta el material
     (20-figura.js, piezaAEsfera). El fitball es blando y cede un poco; lo que no puede es quedarse solo: siempre lleva algo encima */
  ok(!deC('pelota-cuerpo', 'pelota-mano').length, 'las pelotas: nada del cuerpo se hunde más de ' + String(-CT.LIMITES['pelota-cuerpo']).replace('.', ',') + ' cm en un fitball ni en un balón medicinal, en ningún tramo ni postura (las manos que lo sujetan o se apoyan en él, ni ' +
    String(-CT.LIMITES['pelota-mano']).replace('.', ',') + ')', deC('pelota-cuerpo', 'pelota-mano').slice(0, 6));
  ok(!deC('pelota-posada').length, 'el fitball no se queda en el aire: en todo momento tiene algo del cuerpo posado, a menos de ' + String(CT.LIMITES['pelota-posada']).replace('.', ',') + ' cm', deC('pelota-posada').slice(0, 6));
  /* cada secuencia cabe en su paso. Un paso dura lo que se tarda en leer su texto (80-reproductor.js: 4,4 s como poco, y 0,058 s por
     letra, o 0,16 por carácter en chino), no lo que dure su acción (salvo que el paso lo diga con «dura»: entonces, eso como poco);
     cuando entra el paso siguiente, la secuencia que no ha acabado se queda a medias (y «vuelve despacio» no llega a verse). Se mira
     en los once idiomas: manda el texto más corto. Lo que sobra tras la última postura, si es quedarse quieto en ella (mantener), no
     cuenta: eso sí puede pasar de largo. Y si el paso viene de un plano de cerca (el primero, tras la cabecera; o el que sigue a un
     consejo), su acción arranca cuando la cortinilla tapa: 0,25 s después.
     Se da por bueno en la sección 2, con la cuenta cotejada con lo que dura cada paso en el reproductor de verdad. */
  const CORTINILLA = 0.25;
  const durPaso = (l, tx, p) => Math.max(4.4, 1.9 + tx.length * (/^zh/.test(l) ? 0.16 : 0.058), (p && p.dura) || 0);
  const noCaben = []; let secuencias = 0, conSec = 0, justa = [99, ''];
  ids.forEach(id => {
    const co = T.COREO[id]; let alguna = false;
    (co.pasos || []).forEach((p, k) => {
      if (!p || !Array.isArray(p.sec) || !p.sec.length) return;
      const sec = p.sec, n = sec.length, total = sec.reduce((a, q) => a + q[1], 0);
      const antes = n > 1 ? sec[n - 2][0] : (p.desde || co.inicio || 'a'), util = total - (sec[n - 1][0] === antes ? sec[n - 1][1] : 0);
      let corto = null;
      LANGS.forEach(l => { const t = TX[l][id]; if (!t || !Array.isArray(t[1]) || typeof t[1][k] !== 'string') return; const d = durPaso(l, t[1][k], p); if (!corto || d < corto[1]) corto = [l, d]; });
      if (!corto) return;
      const hay = corto[1] - (k === 0 || co.pasos[k - 1] === 'nota' ? CORTINILLA : 0);
      secuencias++; alguna = true;
      if (hay - util < justa[0]) justa = [hay - util, id + ', paso ' + (k + 1) + ' (' + corto[0] + ')'];
      if (util > hay - 0.05) noCaben.push(id + ', paso ' + (k + 1) + ': ' + util.toFixed(2) + ' s de secuencia y en el paso hay ' + hay.toFixed(2) + ' s en ' + corto[0]);
    });
    if (alguna) conSec++;
  });
  /* los gestos del presentador */
  {
    const G = T.GESTOS, PR = T.PRESENTA, peros = [], dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    /* la postura de un nombre (las que entran por el otro lado son las mismas, reflejadas: a efectos de prisa y de alcance, iguales) */
    const base = n => n.replace(/^(asoma|entra)D(0?)$/, '$1$2'), K = n => T.resolver(PR[base(n)]);
    const B = T.BUSTO, esc = B.esc * (1 + B.acerca), enX = x => T.ANCHO / 2 + x * esc, enY = y => B.oy + B.baja - (y - B.mira[1]) * esc;
    const momentos = Object.keys(T.GESTOS_DE);
    momentos.forEach(m => T.GESTOS_DE[m].forEach(g => { if (!G[g]) peros.push(m + ': el gesto «' + g + '» no existe'); }));
    Object.keys(G).forEach(g => {
      const q = G[g]; let de = q.desde, t = 0;
      if (!PR[base(de)]) { peros.push(g + ': sale de «' + de + '», que no existe'); return; }
      if (!Array.isArray(q.cara) || !q.cara.every(c => T.EMO[c[1]] && c[0] >= 0)) peros.push(g + ': una cara que no existe');
      q.sec.forEach(s => {
        if (!PR[base(s[0])]) { peros.push(g + ': postura «' + s[0] + '» no existe'); return; }
        if (!(s[1] > 0) || (s[2] && !T.CURVA[s[2]])) peros.push(g + ': tramo «' + s[0] + '» sin duración o con una curva que no existe');
        const A = K(de), Z = K(s[0]), cur = T.CURVA[s[2] || 'suave'], n = Math.max(1, Math.round(s[1] * 30)), entrada = /^(asoma|entra)/.test(s[0]);
        let ant = null, prisa = 0;
        for (let i = 0; i <= n; i++) {
          /* la prisa de la mano, respecto al cuerpo (al entrar por un lado, el cuerpo lleva la suya) */
          const X = de === s[0] ? A : T.mezclar(A, Z, cur(i / n)), pts = [X.i.mun, X.d.mun].map(p => [p[0] - X.pel[0], p[1] - X.pel[1], p[2] - X.pel[2]]);
          if (ant) pts.forEach((p, j) => { prisa = Math.max(prisa, dist(p, ant[j])); });
          ant = pts;
          /* una mano levantada, dentro del cuadro (menos mientras entra por un lado) */
          if (!entrada) ['i', 'd'].forEach(k => {
            const L = X[k]; if (L.mun[1] < 104) return;
            const al = X.S.m[k].c > 0.6 ? 9 : 16, x = enX(L.mun[0] + L.mano.dir[0] * al), y = enY(L.mun[1] + L.mano.dir[1] * al);
            if (x < 4 || x > T.ANCHO - 4 || y < 56) peros.push(g + ': en «' + s[0] + '» la mano ' + k + ' se sale del cuadro (' + x.toFixed(0) + ', ' + y.toFixed(0) + ')');
          });
        }
        /* más de 14 cm en un treintavo de segundo (4 m/s) ya no se ve: es un salto */
        if (prisa > 14) peros.push(g + ': hacia «' + s[0] + '» la mano va a ' + prisa.toFixed(1) + ' cm por cuadro');
        de = s[0]; t += s[1];
      });
      if (t > 3.2) peros.push(g + ': dura ' + t.toFixed(2) + ' s');
    });
    ok(!peros.length && momentos.length === 3 && momentos.every(m => T.GESTOS_DE[m].length >= 2), 'los gestos del presentador (' + Object.keys(G).length + '): sus posturas y sus caras existen, las manos no se salen del cuadro ni van a saltos', Array.from(new Set(peros)).slice(0, 6));
  }
  /* la voz: qué elige con las voces que enseña cada aparato */
  {
    const con = (ua, voces) => { const c = { window: { speechSynthesis: { getVoices: () => voces } }, navigator: { userAgent: ua }, document: {}, Math, Object, Array, JSON, String, Number, RegExp, Error, console: { log() {} } }; vm.runInNewContext(mod, c); return c.window.TG_ENTRENADOR; };
    const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1';
    const PC = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
    const ANDROID = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36';
    const elo = lang => ['Eddy', 'Flo', 'Grandma', 'Grandpa', 'Reed', 'Rocko', 'Sandy', 'Shelley'].map(n => ({ name: n + ' (' + lang + ')', lang, voiceURI: 'com.apple.eloquence.' + lang + '.' + n, localService: true }));
    const v = (name, lang, uri, local) => ({ name, lang, voiceURI: uri, localService: local !== false });
    const monica = v('Mónica', 'es-ES', 'com.apple.voice.compact.es-ES.Monica'), jorge = v('Jorge', 'es-ES', 'com.apple.voice.compact.es-ES.Jorge');
    /* [aparato, las voces que enseña, idioma, qué voz se espera (null: ninguna elegida), ¿que ponga el sistema la suya?] */
    const casos = [
      ['un iPhone que solo enseña las robóticas', IPHONE, elo('es-ES').concat(elo('es-MX')), 'es', null, true],
      ['un iPhone con las robóticas y Mónica', IPHONE, elo('es-ES').concat([monica]), 'es', 'Mónica', false],
      ['un iPhone con Mónica y Jorge (a igual calidad, la de hombre)', IPHONE, elo('es-ES').concat([monica, jorge]), 'es', 'Jorge', false],
      ['un iPhone con una voz premium', IPHONE, elo('es-ES').concat([jorge, v('Marisol (Premium)', 'es-ES', 'com.apple.voice.premium.es-ES.Marisol')]), 'es', 'Marisol (Premium)', false],
      ['un iPhone que aún no ha dicho qué voces tiene', IPHONE, [], 'es', null, true],
      ['un iPhone, en inglés, con robóticas y de broma', IPHONE, elo('en-GB').concat(elo('en-US'), [v('Zarvox', 'en-US', 'com.apple.speech.synthesis.voice.Zarvox'), v('Bad News', 'en-US', 'com.apple.speech.synthesis.voice.BadNews')]), 'en', null, true],
      ['un iPhone sin ninguna voz en búlgaro', IPHONE, elo('es-ES').concat([monica]), 'bg', null, false],
      /* el rumano (el interruptor del rumano, 22-11-2026): la voz del iPhone, Ioana; y sin ella, ninguna */
      ['un iPhone con Ioana, en rumano', IPHONE, elo('es-ES').concat([monica, v('Ioana', 'ro-RO', 'com.apple.voice.compact.ro-RO.Ioana')]), 'ro', 'Ioana', false],
      ['un iPhone sin ninguna voz en rumano', IPHONE, elo('es-ES').concat([monica]), 'ro', null, false],
      ['un PC con una voz de red y una del sistema', PC, [v('Google español', 'es-ES', 'Google español', false), v('Microsoft Helena - Spanish (Spain)', 'es-ES', 'Microsoft Helena - Spanish (Spain)')], 'es', 'Microsoft Helena - Spanish (Spain)', false],
      ['un PC que solo tiene voces de red', PC, [v('Google español', 'es-ES', 'Google español', false)], 'es', null, false],
      ['un Android', ANDROID, [v('español España', 'es_ES', 'español España'), v('English United Kingdom', 'en_GB', 'English United Kingdom')], 'es', 'español España', false]
    ];
    const malas = [];
    casos.forEach(c => { let r; try { r = con(c[1], c[2]).voces(c[3]); } catch (e) { malas.push(c[0] + ': ' + e.message); return; } if (r.elegida !== c[4] || r.sistema !== c[5]) malas.push(c[0] + ': elige ' + JSON.stringify(r.elegida) + (r.sistema ? ' (la del sistema)' : '')); });
    ok(!malas.length, 'la voz (' + casos.length + ' aparatos de prueba): nunca una robótica («Eloquence») ni una de red; si el iPhone no enseña otra, pone él la suya; si no hay ninguna que valga, no se ofrece', malas);
    ok(!/TG_VOZ\.vozLocal/.test(modTodo), 'el vídeo ya no coge «la primera voz del idioma» (TG_VOZ.vozLocal): elige la suya');
  }
  /* los textos propios */
  const filas = Object.keys(E.textos), cojos = [];
  filas.forEach(k => {
    const f = E.textos[k], h = (f.es || '').match(HUECO) || [];
    LANGS.forEach(l => {
      const v = f[l];
      if (typeof v !== 'string' || !v.trim()) { cojos.push(k + ' (' + l + ')'); return; }
      const hv = v.match(HUECO) || [];
      if (hv.slice().sort().join() !== h.slice().sort().join()) cojos.push(k + ' (' + l + '): huecos');
      if (/"/.test(v)) cojos.push(k + ' (' + l + '): comillas dobles ASCII');
    });
  });
  ok(filas.length >= 20 && !cojos.length, 'los textos del vídeo (' + filas.length + ' filas), en los once idiomas y con sus {huecos}', cojos.slice(0, 6));
  /* el nombre, en la forma de cada idioma, como en el tour (Jérôme, 11-11-2026: «En la forma correcta de la traducción»):
     «Jérôme» en los de letra latina; en búlgaro y en chino, la suya y nunca la latina */
  const NOMBRE = { bg: 'Жером', zh: '热罗姆', zht: '熱羅姆' };
  ok(LANGS.every(l => E.textos.entCon[l].includes(NOMBRE[l] || 'Jérôme') && (!NOMBRE[l] || !/J[eé]r[oô]me/i.test(E.textos.entCon[l])))
     && !/\bJero\b/.test(modTodo.replace(/\/\*[\s\S]*?\*\//g, '')), 'el personaje se llama Jérôme en los once idiomas, en la forma de cada uno («Жером», «热罗姆», «熱羅姆»), y ya no «Jero»');
  ok(!/\beval\s*\(|new Function|console\.log|document\.write/.test(modTodo), 'el módulo y sus trozos: sin eval, sin new Function, sin console.log, sin document.write');
  const conHtml = modTodo.split('\n').filter(l => /\.innerHTML\s*=/.test(l));
  ok(conHtml.length > 0 && conHtml.every(l => !/datos\.|\.texto|\bnombre\b|pasos|etiquetas|\btx\b/.test(l.replace(/\/\*.*?\*\//g, ''))), 'innerHTML (' + conHtml.length + ' veces) solo recibe dibujos e iconos del propio módulo, nunca un texto de la ficha',
    conHtml.filter(l => /datos\.|\.texto|\bnombre\b|pasos|etiquetas|\btx\b/.test(l)).map(l => l.trim().slice(0, 90)));
  /* los enganches */
  const idx = lee('index.html'), sw = lee('sw.js'), cuerpo = lee('modulos/cuerpo.js');
  ok((idx.match(/CARGA-PEREZOSA: modulos\/entrenador\.js/g) || []).length === 1, 'index.html declara CARGA-PEREZOSA: modulos/entrenador.js, una vez');
  ok(/window\.TG_CUERPO_ENTRENADOR = '\.\/modulos\/entrenador\.js';/.test(idx), 'index.html da la ruta del módulo (TG_CUERPO_ENTRENADOR)');
  const core = (/const CORE = \[([\s\S]*?)\n\];/.exec(sw) || [])[1] || sw;
  ok(core.includes("'./modulos/entrenador.js'"), 'sw.js: el módulo está en el precache (sale sin conexión desde el primer día)');
  ok(/url\.pathname\.endsWith\('\/modulos\/entrenador\.js'\)/.test(sw), 'sw.js: y «red primero», como modulos/cuerpo.js (una coreografía corregida llega a quien ya lo tenía)');
  ok(/id="tgc-ej-video" hidden/.test(cuerpo) && /function videoEj\(/.test(cuerpo) && /E\.tiene\(x\.id, t\.pasos\.length\)/.test(cuerpo), 'modulos/cuerpo.js: el hueco del vídeo en la ficha, y solo con los pasos con los que se coreografió');
  ok((cuerpo.match(/quitarVideoEj\(\);/g) || []).length >= 3, 'modulos/cuerpo.js: el vídeo se quita al volver a la lista y al cerrar la hoja');
  ok(!/videoEjR\.reproducir\(|auto: true/.test(cuerpo), 'modulos/cuerpo.js: el vídeo no arranca solo');
  /* (16-11-2026) por trozos */
  ok(/typeof E0\.pedir === 'function' \? E0\.pedir\(x\.id\) : null/.test(cuerpo) && cuerpo.indexOf('E0.pedir(x.id)') < cuerpo.indexOf('E.tiene(x.id, t.pasos.length)'),
    'modulos/cuerpo.js: antes de preguntar si lo tiene, pide la coreografía del ejercicio (y con un motor de una pieza sigue como estaba)');
  ok(/function guardarVideos\(/.test(cuerpo) && /navigator\.serviceWorker && navigator\.serviceWorker\.controller/.test(cuerpo) && /con\.saveData \|\| \/2g\/\.test\(String\(con\.effectiveType/.test(cuerpo) && /navigator\.onLine === false/.test(cuerpo),
    'modulos/cuerpo.js: con conexión y con service worker, guarda los trozos para verlos sin conexión; no, si el móvil pide ahorrar datos o va por una conexión 2g');
  ok(/\['modulos\/entrenador', f => /.test(lee('tools/app_preparar.js')), 'tools/app_preparar.js: los trozos viajan en el paquete de las tiendas (allí no hay service worker que los guarde)');
  { const vistos = require('./fuente').perezosos().map(f => f.ruta);
    ok(TROZOS.every(f => vistos.indexOf('modulos/entrenador/' + f + '.js') >= 0), 'las herramientas que barren el fuente ven los trozos (tools/fuente.js los lee de la cabecera del motor)', vistos.filter(r => /entrenador/.test(r))); }
  /* el service worker de verdad (sw.js), con caches y red de mentira. Los trozos no van en la precarga ni en la lista de «red
     primero»: llevan la huella en el nombre, así que les vale lo de por defecto. Se guardan la primera vez que se piden y desde
     entonces salen de la cache sin tocar la red; uno que nunca se pidió, sin red, falla limpio. El motor sigue como estaba */
  {
    class CacheM { constructor() { this.m = new Map(); } k(r) { return typeof r === 'string' ? r : r.url; } async put(r, x) { this.m.set(this.k(r), x); } async match(r) { const x = this.m.get(this.k(r)); return x ? x.clone() : undefined; }
      async delete(r) { return this.m.delete(this.k(r)); } async keys() { return Array.from(this.m.keys()).map(u => new Request(u)); } async add() {} }
    const cs = new Map(), cachesM = { open: async n => { if (!cs.has(n)) cs.set(n, new CacheM()); return cs.get(n); }, keys: async () => Array.from(cs.keys()), delete: async n => cs.delete(n),
      match: async r => { for (const c of cs.values()) { const x = await c.match(r); if (x) return x; } return undefined; } };
    let red = [], hayRed = true; const man = {}, WEB = 'https://tenerifego.app/', pausa = ms => new Promise(r => setTimeout(r, ms));
    const fetchM = async r => { const u = typeof r === 'string' ? r : r.url; red.push(u); if (!hayRed) throw new TypeError('sin red'); const x = new Response('lo de ' + u, { status: 200 }); Object.defineProperty(x, 'type', { value: 'basic' }); return x; };
    let cargado = true;
    try { new Function('self', 'caches', 'fetch', 'Request', 'Response', 'URL', sw)({ addEventListener: (t, f) => { (man[t] = man[t] || []).push(f); }, skipWaiting() {}, clients: { claim: async () => {}, matchAll: async () => [] }, registration: { showNotification: async () => {} } },
      cachesM, fetchM, Request, Response, URL); } catch (e) { cargado = false; }
    const pide = async u => { let p = null; (man.fetch || []).forEach(f => f({ request: new Request(u), respondWith: x => { p = x; }, waitUntil() {} })); red = []; try { const r = p ? await p : null; await pausa(15); return { st: r && r.status === 200 ? 200 : 0, red: red.length }; } catch (e) { return { st: 0, red: red.length }; } };
    const uT = WEB + 'modulos/entrenador/' + TROZOS[0] + '.js', uM = WEB + 'modulos/entrenador.js', pasos = [];
    pasos.push(await pide(uT));                       /* la primera vez: de la red, y se guarda */
    hayRed = false; pasos.push(await pide(uT));       /* sin red: de la cache */
    hayRed = true; pasos.push(await pide(uT));        /* con red otra vez: de la cache, sin pedirlo */
    hayRed = false; pasos.push(await pide(WEB + 'modulos/entrenador/' + TROZOS[TROZOS.length - 1] + '.js'));   /* uno que nunca se pidió, sin red */
    hayRed = true; pasos.push(await pide(uM)); pasos.push(await pide(uM));   /* el motor: red primero, cada vez */
    hayRed = false; pasos.push(await pide(uM));
    ok(cargado && !/modulos\/entrenador\//.test(core) && JSON.stringify(pasos) === JSON.stringify([{ st: 200, red: 1 }, { st: 200, red: 0 }, { st: 200, red: 0 }, { st: 0, red: 1 }, { st: 200, red: 1 }, { st: 200, red: 1 }, { st: 200, red: 1 }]),
      'sw.js (sin tocarlo): un trozo no va en la precarga; se guarda al pedirlo y después sale de la cache sin tocar la red, también sin conexión; uno que nunca se pidió, sin red, falla limpio; y el motor, «red primero» y con respaldo', pasos);
  }

  let chromium;
  try { chromium = require('playwright').chromium; } catch (e) {
    try { chromium = require('/opt/node22/lib/node_modules/playwright').chromium; } catch (e2) { chromium = require('/opt/npm-tools/node_modules/playwright').chromium; }
  }
  const opc = { args: ['--no-sandbox', '--disable-gpu'] };
  if (fs.existsSync('/usr/bin/google-chrome')) opc.executablePath = '/usr/bin/google-chrome';
  const nav = await chromium.launch(opc);
  /* solo el sitio de prueba: lo de fuera (el tiempo, Supabase, las fuentes de letra…) se corta, como en las demás
     auditorías; así la prueba no manda nada a nadie y no depende de la red (12 de noviembre de 2026) */
  const soloLocal = ctx => ctx.route('**/*', r => { const u = r.request().url(); return u.startsWith(SITIO) || /^(data|blob):/.test(u) ? r.continue() : r.abort(); });
  const errores = [];
  const vigila = pg => { pg.on('pageerror', e => errores.push(String(e).slice(0, 200))); pg.on('console', m => { if (m.type() === 'error' && !/ERR_|Failed to load resource/.test(m.text())) errores.push('consola: ' + m.text().slice(0, 200)); }); };

  console.log('\n════ 2. el vídeo de cada ejercicio, entero (Chromium, 320 de ancho) ════');
  /* LOS TROZOS, EN UN NAVEGADOR (16 de noviembre de 2026): el motor cargado como lo carga la app, con su etiqueta y nada más
     (pruebas/trozos.html). Qué se pide y cuándo, y qué pasa si un trozo no llega */
  {
    const ctx = await nav.newContext({ viewport: { width: 390, height: 700 }, serviceWorkers: 'block' });
    await soloLocal(ctx);
    const pg = await ctx.newPage(); vigila(pg);
    const pedidos = []; pg.on('request', r => { const m = /\/modulos\/entrenador\/([a-z0-9-]+\.[0-9a-f]{8})\.js$/.exec(r.url()); if (m) pedidos.push(m[1]); });
    await pg.goto(SITIO + 'tools/entrenador/pruebas/trozos.html');
    const fA = TROZOS[0], deA = deTrozo.filter(id => trozoDe[id] === fA), fB = TROZOS[1], deB = deTrozo.filter(id => trozoDe[id] === fB);
    const t0 = await pg.evaluate(a => ({ n: window.TG_ENTRENADOR.ids().length, nucleo: window.TG_ENTRENADOR.tiene(a[0]), trozo: window.TG_ENTRENADOR.tiene(a[1]) }), [nucleoIds[0], deA[0]]);
    ok(t0.n === ids.length && t0.nucleo && !t0.trozo && pedidos.length === 0, 'en el navegador, el motor solo: sabe de las ' + ids.length + ' y no pide ningún trozo mientras nadie pida una coreografía', [t0, pedidos]);
    const tres = await pg.evaluate(a => Promise.all([window.TG_ENTRENADOR.pedir(a[0]), window.TG_ENTRENADOR.pedir(a[1]), window.TG_ENTRENADOR.pedir(a[0])])
      .then(r => ({ r: r.join(), suyas: window.TG_ENTRENADOR.tiene(a[0]) && window.TG_ENTRENADOR.tiene(a[1]), otra: window.TG_ENTRENADOR.tiene(a[2]) })), [deA[0], deA[deA.length - 1], deB[0]]);
    ok(tres.r === 'true,true,true' && tres.suyas && !tres.otra && pedidos.join() === fA, 'pedir(id) trae el trozo de ese ejercicio (una sola vez, aunque se pida tres) y ningún otro', [tres, pedidos]);
    const datosDe = id => ({ id: id, nombre: TX.es[id][0], pasos: TX.es[id][1], pasosEs: TX.es[id][1], prim: EJ[id].g, sec: EJ[id].s, nombres: {}, etiquetas: [], entorno: EJ[id].e[0], nivel: EJ[id].n });
    const monta = await pg.evaluate(d => { const r = window.TG_ENTRENADOR.montar(document.getElementById('caja'), d, { idioma: 'es' }), n = document.querySelectorAll('#caja .tgv').length; if (r) r.quitar(); return { r: !!r, n: n }; }, datosDe(deA[0]));
    ok(monta.r && monta.n === 1, 'y con su trozo, el vídeo de «' + deA[0] + '» se monta', monta);
    /* un trozo que no llega (sin red) y uno que llega vacío: pedir() falla y tiene() sigue diciendo que no; al pedirlo otra vez, llega */
    const urlB = '**/modulos/entrenador/' + fB + '.js', intento = () => pg.evaluate(id => window.TG_ENTRENADOR.pedir(id).then(() => 'llega', () => 'falla').then(r => r + (window.TG_ENTRENADOR.tiene(id) ? ' y lo tiene' : ' y no lo tiene')), deB[0]);
    await ctx.route(urlB, r => r.abort());
    const f1 = await intento(); await ctx.unroute(urlB);
    await ctx.route(urlB, r => r.fulfill({ status: 200, contentType: 'text/javascript', body: '/* vacío */' }));
    const f2 = await intento(); await ctx.unroute(urlB);
    const f3 = await intento();
    ok(f1 === 'falla y no lo tiene' && f2 === 'falla y no lo tiene' && f3 === 'llega y lo tiene' && pedidos.filter(f => f === fB).length === 3,
      'un trozo que no llega, o que llega vacío: pedir() falla y tiene() sigue diciendo que no; al pedirlo otra vez, llega', [f1, f2, f3, pedidos]);
    const faltan = await pg.evaluate(l => window.TG_ENTRENADOR.todo().then(() => l.filter(id => !window.TG_ENTRENADOR.tiene(id)).length), ids);
    ok(faltan === 0 && TROZOS.every(f => pedidos.filter(q => q === f).length === (f === fB ? 3 : 1)), 'todo() trae los que faltan, cada uno una vez, y entonces están las ' + ids.length, [faltan, pedidos]);
    await ctx.close();
  }
  {
    const ctx = await nav.newContext({ viewport: { width: 320, height: 640 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
    await soloLocal(ctx);
    const pg = await ctx.newPage(); vigila(pg);
    await pg.goto(SITIO + 'tools/entrenador/pruebas/auditoria.html');
    const total = await pg.evaluate(l => window.preparar(l), LANGS);
    info('datos de ' + total + ' ejercicios');
    /* LA LEYENDA DE MÚSCULOS (16 de noviembre de 2026). Iba dentro del dibujo, abajo a la izquierda, y tapaba a Jérôme (los pies, las
       manos, las piernas) en muchos vídeos según el idioma: ahora va en su fila, debajo. Se mira en los once idiomas y con los nombres
       que pone la app (los de modulos/cuerpo.js; antes esta página ponía el identificador, que es más corto): que no pise el dibujo,
       que ninguna píldora se salga del ancho del reproductor (a 320 px, el móvil más estrecho) y que cada una lleve su nombre */
    const GRUPOS = {};
    { const re = /"cuerpoG_(\w+)":\s*(\{[^}]*\})/g, fuente = lee('modulos/cuerpo.js'); let mm;
      while ((mm = re.exec(fuente))) { try { const o = JSON.parse(mm[2]); LANGS.forEach(l => { if (typeof o[l] === 'string' && o[l]) (GRUPOS[l] = GRUPOS[l] || {})[mm[1]] = o[l]; }); } catch (e) {} } }
    await pg.evaluate(n => window.nombrar(n), GRUPOS);
    const leyMal = []; let leyVistas = 0, leyAlta = [0, ''];
    for (const id of idsVideo) {
      const grupos = EJ[id].g.concat(EJ[id].s);
      for (const l of LANGS) {
        const m = await pg.evaluate(a => window.montar(a[0], a[1], 'dia'), [id, l]);
        if (!m) { leyMal.push(id + ' (' + l + '): no se monta'); continue; }
        const y = await pg.evaluate(() => window.leyenda()), q = []; leyVistas++;
        if (y.dentro || y.pisa) q.push('pisa el dibujo (' + y.pisa + ' px²)');
        if (y.pisaPie || !y.antesDeMandos) q.push('pisa la tarjeta del paso o los mandos (' + y.pisaPie + ' px²)');
        if (!y.tras) q.push('en una pantalla baja tiene que ir detrás de la tarjeta del paso');
        if (y.sale > 0.5) q.push('se sale ' + y.sale + ' px del ancho del reproductor');
        if (y.ancho > y.vista) q.push('la página se ensancha a ' + y.ancho + ' px');
        if (!y.n || y.textos.some(t => !t || grupos.indexOf(t) >= 0)) q.push('una píldora sin su nombre: ' + y.textos.join(' | '));
        if (grupos.some(g => !(GRUPOS[l] || {})[g])) q.push('un grupo sin nombre en la app');
        if (y.alto > leyAlta[0]) leyAlta = [y.alto, id + ' (' + l + ')'];
        if (q.length) leyMal.push(id + ' (' + l + '): ' + q.join('; '));
      }
    }
    /* y en una pantalla alta (390 × 844, un iPhone), justo debajo del vídeo y delante de la tarjeta del paso: con unos cuantos, en dos idiomas */
    await pg.setViewportSize({ width: 390, height: 844 });
    const leyAltaP = []; let leyVistasP = 0;
    for (const id of idsVideo.filter((x, i) => i % Math.max(1, Math.floor(idsVideo.length / 12)) === 0).slice(0, 12)) {
      for (const l of ['es', 'pl']) {
        if (!(await pg.evaluate(a => window.montar(a[0], a[1], 'dia'), [id, l]))) { leyAltaP.push(id + ' (' + l + '): no se monta'); continue; }
        const y = await pg.evaluate(() => window.leyenda()); leyVistasP++;
        if (y.dentro || y.pisa || y.pisaPie || !y.antesDeMandos || y.tras || y.sale > 0.5 || y.ancho > y.vista || y.bajo < 0 || y.bajo > 16) leyAltaP.push(id + ' (' + l + '): ' + JSON.stringify(y).slice(0, 160));
      }
    }
    await pg.setViewportSize({ width: 320, height: 640 });
    ok(Object.keys(GRUPOS).length === LANGS.length && !leyMal.length && leyVistas === idsVideo.length * LANGS.length && !leyAltaP.length && leyVistasP > 0,
      'la leyenda de músculos, con los nombres de la app en los once idiomas (' + leyVistas + ' vistas, a 320 × 640): en su fila, sin pisar el dibujo, la tarjeta del paso ni los mandos, ni salirse de ancho; en esa pantalla, que es baja, detrás de la tarjeta del paso, y en una alta (' + leyVistasP + ' vistas a 390 × 844), justo debajo del vídeo', leyMal.concat(leyAltaP).slice(0, 6));
    info('la leyenda más alta: ' + leyAlta[0] + ' px · ' + leyAlta[1]);
    const peros = [], gestos = {}, tope = {}, dibujo = [], plegados = [], salen = [], arrimados = [], piezas = {}, noCopia = [], otraDur = []; let pasados = 0, cuadros = 0, mirados = 0, girados = 0, borron = 99, encuadrados = 0, cotejados = 0;
    for (let n = 0; n < idsVideo.length; n++) {
      /* el idioma y el tema de cada uno, los de siempre (por su puesto entre todos), se pase entero o por partes: el otro
         idioma, por turno entre los que no son el castellano (desde el interruptor del rumano, 22-11-2026, diez; contado
         de LANGS, para que otro idioma no se quede fuera) */
      const id = idsVideo[n], i = ids.indexOf(id);
      for (const l of ['es', LANGS[1 + (i % (LANGS.length - 1))]]) {
        const m = await pg.evaluate(a => window.montar(a[0], a[1], a[2]), [id, l, i % 2 ? 'noche' : 'dia']);
        if (!m) { peros.push(id + ' (' + l + '): no se monta'); continue; }
        /* en castellano, desde la primera vista; en el otro idioma, desde la de «Girar» */
        const r = await pg.evaluate(v => window.entero(v), l === 'es' ? 0 : 1);
        /* el dibujo */
        const dq = [], db = r.dib; mirados += db.mirados; if (r.vistaN === 1) girados++; borron = Math.min(borron, db.borron);
        if (db.estampaSeguidos > 20) dq.push('el estampado se queda a medio borrar ' + db.estampaSeguidos + ' cuadros seguidos');
        if (db.marca > T.MARCA_DUR + 0.3) dq.push('un aviso se queda ' + db.marca + ' s encima');
        if (db.borron < 2.6) dq.push('un músculo encendido se queda en un borrón de ' + db.borron + ' cm');
        if (db.fuera) dq.push('el tronco se sale de su silueta (' + db.fuera + ' puntos; ' + db.fueraEn + ')');
        if (r.vistaN === 0 && db.pleg > 20) plegados.push(id + ' ' + db.pleg + ' %');
        /* el cuerpo, entero dentro del cuadro y sin tocar el borde (le quedan MARGEN px, de los 400 del dibujo) en cada momento
           que se mira: uno de cada ocho cuadros, fuera de los planos de cerca */
        encuadrados += db.salidos; arrimados.push([-db.sale, id + ' (vista ' + (r.vistaN + 1) + ') ' + (-db.sale).toFixed(1) + ' px ' + db.saleEn]);
        if (db.salidos && -db.sale < MARGEN) salen.push(id + ' (vista ' + (r.vistaN + 1) + '): ' + (db.sale > 0 ? 'se sale ' + db.sale + ' px ' : 'le quedan ' + (-db.sale).toFixed(1) + ' px ') + db.saleEn);
        if (dq.length) dibujo.push(id + ' (vista ' + (r.vistaN + 1) + '): ' + dq.join('; '));
        /* de qué está hecho el dibujo: solo de lo que el canvas de Samsung Internet sabe copiar (sección 4) */
        const raras = (r.tipos || []).filter(t => { piezas[t] = 1; return COPIA.indexOf(t) < 0; });
        if (raras.length || r.ajenos || !(r.tipos || []).length) noCopia.push(id + ': ' + (raras.length ? '<' + raras.join('>, <') + '>' : r.ajenos ? r.ajenos + ' piezas con máscara o filtro' : 'sin medir'));
        /* lo que dura cada paso en el reproductor es lo que dice la cuenta de arriba (con la que se mira que cada secuencia quepa) */
        if (!Array.isArray(m.durs) || m.durs.length !== m.pasos.length) otraDur.push(id + ' (' + l + '): sin las duraciones de sus pasos');
        else m.durs.forEach((d, k) => { const pk = (T.COREO[id].pasos || [])[k]; cotejados++; if (Math.abs(d - durPaso(l, m.pasos[k], pk)) > 1e-9) otraDur.push(id + ' (' + l + '), paso ' + (k + 1) + ': dura ' + d + ' s y la cuenta da ' + durPaso(l, m.pasos[k], pk)); });
        const esperados = Math.round(m.dur * 30), q = [];
        if (!r.fin) q.push('no acaba');
        /* cada tramo acaba en el primer cuadro que pasa de su duración: uno de más por tramo, como mucho */
        if (r.cuadros < esperados || r.cuadros > esperados + m.pasos.length + 3) q.push('dura ' + r.cuadros + ' cuadros y no ' + esperados);
        m.pasos.forEach((p, k) => { if (typeof r.leido[k] !== 'string' || !r.leido[k].endsWith(p)) q.push('el paso ' + (k + 1) + ' no se lee tal cual'); });
        if (r.titulo !== (E.textos.entTurno[l])) q.push('el cierre');
        if (r.raros) q.push(r.raros + ' cuadros con NaN en el dibujo');
        if (r.nodos < 40) q.push('el dibujo, casi vacío (' + r.nodos + ' nodos)');
        if (r.ancho > r.vista) q.push('se sale de ancho: ' + r.ancho + ' > ' + r.vista);
        if (r.modos.indexOf('busto') < 0) q.push('sin plano de cerca');
        /* el movimiento */
        const mv = r.mov; r.gestos.forEach(g => { gestos[g] = (gestos[g] || 0) + 1; });
        if (!(mv.clavo <= 0.02)) q.push('lo clavado se mueve ' + mv.clavo + ' cm (' + mv.clavoEn + ')');
        if (!(mv.salto <= 14)) q.push('el cuerpo da un salto de ' + mv.salto + ' cm en un cuadro (' + mv.saltoEn + ')');
        if (!(mv.saltoM <= 36)) q.push('una mano o un pie da un salto de ' + mv.saltoM + ' cm en un cuadro (' + mv.saltoMEn + ')');
        if (!(mv.aireMax - mv.aireMin > 0.8)) q.push('no respira');
        if (!(mv.cabRep <= 4.5 && mv.cabBusto <= 10.5 && mv.pelo <= 11 && mv.brazo <= 17)) q.push('un muelle se pasa: cabeza ' + mv.cabRep + '° en la repetición y ' + mv.cabBusto + '° de cerca, tupé ' + mv.pelo + '°, brazo ' + mv.brazo + '°');
        if (mv.fuera) q.push('de cerca, una mano se sale del cuadro (' + mv.fuera + ' cuadros)');
        ['clavo', 'salto', 'saltoM', 'cabRep', 'cabBusto', 'pelo'].forEach(k => { tope[k] = Math.max(tope[k] || 0, mv[k]); });
        if (q.length) peros.push(id + ' (' + l + '): ' + q.join('; ')); else pasados++;
        cuadros += r.cuadros;
      }
    }
    ok(!peros.length && pasados === idsVideo.length * 2, 'los ' + idsVideo.length + ' vídeos, enteros, en castellano y en otro idioma (' + pasados + ' pases, ' + cuadros + ' cuadros): acaban, duran lo suyo, se lee el paso de la ficha palabra por palabra, sin NaN y sin salirse de ancho', peros.slice(0, 8));
    ok(!noCaben.length && !otraDur.length && secuencias > 0 && cotejados >= idsVideo.length * 2, 'cada secuencia cabe en su paso, en los once idiomas (' + secuencias + ' secuencias de ' + conSec + ' ejercicios; la más justa, con ' + justa[0].toFixed(2) + ' s de margen: ' + justa[1] + '): un paso dura lo que se tarda en leerlo, no lo que dure su acción, y una secuencia más larga se quedaría a medias; la cuenta es la del reproductor (cotejada en ' + cotejados + ' pasos de estos ' + idsVideo.length + ' vídeos)', noCaben.concat(otraDur).slice(0, 8));
    /* a cámara lenta («½×») se ve lo mismo que a velocidad normal, más despacio. El reloj del reproductor va a la velocidad de lo que se
       está viendo: un ejercicio, a la del Director (0,45); de cerca (la cabecera, un consejo, el cierre), a la suya. Así el paso de un
       ejercicio dura lo que su movimiento, la secuencia acaba dentro de él y la repetición va, al acabar cada paso y cada tanda, por el
       mismo punto que a velocidad normal; y de cerca todo dura lo mismo. La cortinilla de un cambio de plano (0,25 s hasta que tapa) va
       con lo que tapa: despacio al dejar un ejercicio, a su velocidad al dejar un plano de cerca. Hasta el 14-11-2026 cada paso duraba lo
       mismo con «½×» y el movimiento se quedaba a medias. Las repeticiones no se comparan contándolas (una cuenta entera cambia con un
       cuadro de diferencia), sino por dónde van, en segundos del ejercicio, con un cuadro de margen por cada paso que lleve la tanda.
       Entero, con unos de muestra (el de la secuencia más justa, el de la más larga, el de la repetición más larga, uno con consejo, el
       primero y el pino contra la pared); en un pase parcial, con todos los que se piden. Con el botón de verdad */
    {
      const util = p => { const sec = p.sec, n = sec.length, antes = n > 1 ? sec[n - 2][0] : (p.desde || 'a'); return sec.reduce((a, q) => a + q[1], 0) - (sec[n - 1][0] === antes ? sec[n - 1][1] : 0); };
      const mayor = f => ids.map(id => [f(T.COREO[id]), id]).sort((a, b) => b[0] - a[0])[0][1];
      const LENTOS = PARCIAL ? idsVideo : [...new Set([justa[1].split(',')[0], mayor(co => Math.max(0, ...(co.pasos || []).filter(p => p && p.sec).map(util))), mayor(co => (co.rep || []).reduce((a, q) => a + q[1], 0)),
        ids.find(id => (T.COREO[id].pasos || []).indexOf('nota') >= 0), ids[0], 'pino-pared'].filter(id => id && ids.indexOf(id) >= 0))];
      const CORTE = 0.25, margen = k => 0.036 * k + 0.012, cercaDe = z => z.tipo !== 'paso' || z.nota;
      const malL = []; let secL = 0, repL = 0, cercaL = 0, velL = 0, tandasL = 0, peorRep = 0, otraCuenta = 0;
      for (const id of LENTOS) {
        await pg.evaluate(a => window.montar(a, 'es', 'dia'), id); const a = await pg.evaluate(() => window.pase(false));
        await pg.evaluate(a => window.montar(a, 'es', 'dia'), id); const b = await pg.evaluate(() => window.pase(true));
        const q = [];
        if (!a.fin || !b.fin) q.push('no acaba');
        if (a.lento || a.vel !== 1 || !b.lento || !(b.vel > 0.2 && b.vel < 0.8) || b.pulsado !== 'true') q.push('el botón «½×» no pone la cámara lenta (velocidad ' + b.vel + ')');
        if (a.tramos.length !== b.tramos.length) q.push('no tiene los mismos tramos');
        else a.tramos.forEach((x, k) => {
          /* lo que tiene que durar a cámara lenta: el tramo de un ejercicio, 1/vel veces lo suyo; uno de cerca, lo mismo. Y si el tramo entra
             con cortinilla (viene de un plano distinto), ese cuarto de segundo es de lo que había antes y va a su velocidad */
          const y = b.tramos[k], cerca = cercaDe(x), corta = k > 0 && cercaDe(a.tramos[k - 1]) !== cerca, masCorte = corta ? CORTE / b.vel - CORTE : 0;
          const debe = cerca ? x.dur + masCorte : x.dur / b.vel - masCorte;
          if (x.falta > 0.02) q.push('a velocidad normal, la secuencia del tramo ' + k + ' se queda a ' + x.falta + ' s de acabar');
          if (y.falta > 0.02) q.push('a cámara lenta, la secuencia del tramo ' + k + ' se queda a ' + y.falta + ' s de acabar');
          if (Math.abs(x.real - x.dur) > 0.05) q.push('a velocidad normal, el tramo ' + k + ' dura ' + x.real + ' s y no ' + x.dur.toFixed(2));
          if (Math.abs(y.real - debe) > 0.05) q.push('a cámara lenta, el tramo ' + k + (cerca ? ' (de cerca)' : '') + ' dura ' + y.real + ' s y no ' + debe.toFixed(2));
          /* de cerca, el gesto del presentador va a su velocidad: al acabar el tramo ha andado lo mismo */
          if (cerca && (x.gesto == null || y.gesto == null || Math.abs(y.gesto - x.gesto) > 0.08)) q.push('a cámara lenta, el gesto del tramo ' + k + ' (de cerca) va por ' + y.gesto + ' s y a velocidad normal por ' + x.gesto);
          /* al acabar un paso de repeticiones, la tanda va por el mismo punto */
          if (!x.rep !== !y.rep || (x.rep && x.rep.k !== y.rep.k)) q.push('a cámara lenta, el tramo ' + k + ' no acaba en la misma tanda de repeticiones');
          else if (x.rep) { peorRep = Math.max(peorRep, Math.abs(x.rep.va - y.rep.va)); if (Math.abs(x.rep.va - y.rep.va) > margen(x.rep.k)) q.push('al acabar el tramo ' + k + ', la repetición va a cámara lenta por ' + y.rep.va + ' s y a velocidad normal por ' + x.rep.va); }
          if (x.sec) secL++; if (cerca) cercaL++;
        });
        /* y al acabar cada tanda (con lo que avanza debajo de la cortinilla que la tapa) */
        if (a.tandas.length !== b.tandas.length) q.push('a cámara lenta hay ' + b.tandas.length + ' tandas de repeticiones y a velocidad normal ' + a.tandas.length);
        else a.tandas.forEach((x, i) => { const y = b.tandas[i]; tandasL++; peorRep = Math.max(peorRep, Math.abs(x.va - y.va)); if (x.k !== y.k || Math.abs(x.va - y.va) > margen(x.k + 1)) q.push('la tanda ' + (i + 1) + ' de repeticiones acaba a cámara lenta en ' + y.va + ' s y a velocidad normal en ' + x.va); });
        if (Math.abs(a.reps - b.reps) > 1) q.push('a cámara lenta se cuentan ' + b.reps + ' repeticiones y a velocidad normal ' + a.reps);
        if (a.reps !== b.reps) otraCuenta++;
        repL += b.reps; velL = b.vel;
        if (q.length) malL.push(id + ': ' + q.slice(0, 3).join('; '));
      }
      ok(!malL.length && LENTOS.length > 0 && (PARCIAL || (secL > 0 && repL > 0 && tandasL > 0 && cercaL > LENTOS.length * 2)), 'a cámara lenta («½×», con su botón) se ve lo mismo que a velocidad normal, más despacio (' + LENTOS.length + ' vídeos' + (PARCIAL ? '' : ' de muestra') + ', con ' + secL + ' secuencias, ' + tandasL + ' tandas de repeticiones y ' + repL + ' repeticiones): cada secuencia acaba dentro de su paso; al acabar cada paso y cada tanda, la repetición va por el mismo punto (la mayor diferencia, ' + peorRep.toFixed(3) + ' s' + (otraCuenta ? '; en ' + otraCuenta + ' la cuenta entera cambia en una, por un cuadro' : '') + '); el paso de un ejercicio dura ' + (1 / (velL || 1)).toFixed(2) + ' veces lo suyo y de cerca (la cabecera, los consejos y el cierre: ' + cercaL + ' tramos) todo dura lo mismo y el gesto va a su velocidad; la cortinilla de un cambio de plano va con lo que tapa', malL.slice(0, 6));
    }
    info('el movimiento, lo más de todo: lo clavado se mueve ' + tope.clavo + ' cm; el cuerpo, ' + tope.salto + ' cm en un cuadro (a 30 por segundo); una mano, ' + tope.saltoM + ' cm; la cabeza cabecea ' + tope.cabRep + '° en una repetición y ' + tope.cabBusto + '° al entrar; el tupé, ' + tope.pelo + '°');
    const delMov = peros.filter(p => /clavado|salto|respira|muelle|sale del cuadro/.test(p));
    ok(!delMov.length, 'el movimiento, medido en cada cuadro de los ' + idsVideo.length + ' vídeos: lo clavado no se mueve (el pie en el suelo, la mano en la barra) aunque respire y reparta el peso; nada se teletransporta; respira; los muelles no se pasan; de cerca ninguna mano se sale', delMov.slice(0, 6));
    ok(!dibujo.length && mirados > (PARCIAL ? 1000 : 100000) && girados >= idsVideo.length - 1, 'el dibujo, medido en cada cuadro y desde las dos vistas de cada ejercicio (' + girados + ' pases desde la de «Girar»; ' + mirados + ' puntos del tronco mirados): el tronco entero cabe en su silueta (también visto de pies a cabeza), el estampado no se queda a medio borrar, un músculo encendido no se queda en un borrón (el menor, ' + borron + ' cm de semieje) y los avisos duran lo que una mirada', dibujo.slice(0, 6));
    arrimados.sort((a, b) => a[0] - b[0]);
    ok(!salen.length && encuadrados > (PARCIAL ? 100 : 10000), 'Jérôme no se sale del cuadro ni toca su borde: fuera de los planos de cerca, todo lo que se dibuja de su cuerpo queda dentro, a ' + MARGEN + ' px o más del borde, en las dos vistas de cada ejercicio (' + encuadrados + ' momentos mirados)', salen.slice(0, 8));
    info('los que más se arriman al borde del cuadro: ' + arrimados.slice(0, 6).map(a => a[1]).join(' · '));
    ok(!noCopia.length && Object.keys(piezas).length >= 6, 'el dibujo de los ' + idsVideo.length + ' vídeos está hecho solo de lo que el canvas de Samsung Internet copia (' + Object.keys(piezas).sort().join(', ') + '): trazados, círculos, elipses y rectángulos, en grupos, con sus degradados y recortes, sin máscaras ni filtros; otra cosa, en ese navegador no se vería', [...new Set(noCopia)].slice(0, 8));
    /* no es un control (una mano delante del hombro es lo natural en un curl o en un press visto de frente): es la lista de lo que conviene mirar a ojo al elegir la vista */
    info('para mirar a ojo — en la primera vista, el brazo de este lado plegado sobre sí mismo y con el hombro tras la mano más del 20 % de la repetición: ' + (plegados.length ? plegados.join(', ') : 'ninguno'));
    const faltan = []; ['cabecera', 'cierre'].forEach(mo => T.GESTOS_DE[mo].forEach(g => { if (!gestos[mo + ':' + g]) faltan.push(mo + ':' + g); }));
    ok((PARCIAL || !faltan.length) && Object.keys(gestos).every(g => /^(cabecera|cierre|consejo):/.test(g)), 'los gestos se reparten: cada ejercicio tiene el suyo en la cabecera y en el cierre, y salen todos (' + Object.keys(gestos).map(g => g.split(':')[1] + ' ' + gestos[g]).join(', ') + ')', faltan);
    /* la cabeza: una sola, con volumen, vista desde todos los lados */
    await pg.evaluate(a => window.montar(a, 'es', 'dia'), ids[0]);
    const cg = await pg.evaluate(() => window.cabezaGira()), f = cg.frente || {}, pf = cg.perfil || {}, es = cg.espalda || {};
    ok(cg.vistas === 72 && !cg.raros && f.ojos === 2 && f.bocas === 2 && f.gafas && !f.nudo && !f.nuca && f.cinta && f.pelo && f.piel
      && pf.ojos === 1 && pf.bocas === 1 && pf.cinta
      && es.ojos === 0 && es.bocas === 0 && !es.gafas && es.nudo && es.nuca && es.cinta,
      'la cabeza gira de verdad (' + cg.vistas + ' vistas: cada 15°, y desde arriba y desde abajo): sin números imposibles; de frente, los dos ojos y la boca entera; de perfil, un ojo y media boca; de espaldas, ni cara ni gafas, y el nudo de la cinta', cg);
    ok(!/tgh-perfil|tgh-espalda|tgh-frente/.test(mod), 'ya no hay tres dibujos de cabeza (de frente, de perfil y de espaldas) entre los que saltar');
    /* con «reducir movimiento»: se monta y se pasa igual */
    const ctx2 = await nav.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', serviceWorkers: 'block' });
    await soloLocal(ctx2);
    const pg2 = await ctx2.newPage(); vigila(pg2);
    await pg2.goto(SITIO + 'tools/entrenador/pruebas/auditoria.html');
    await pg2.evaluate(l => window.preparar(l), ['es']);
    const m2 = await pg2.evaluate(a => window.montar(a, 'es', 'dia'), ids[0]), r2 = await pg2.evaluate(() => window.entero());
    ok(!!m2 && r2.fin && !r2.raros, 'con «reducir movimiento» del sistema: el vídeo se monta y se pasa entero');
    await ctx.close(); await ctx2.close();
  }

  console.log('\n════ 3. en la app: la ficha de un ejercicio ════');
  {
    const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
    await soloLocal(ctx);
    const pg = await ctx.newPage(); vigila(pg);
    /* (16-11-2026) lo que se pide del vídeo: el motor (modulos/entrenador.js) y sus trozos (modulos/entrenador/…) */
    const pedidosApp = []; pg.on('request', r => { const u = r.url(); if (/\/modulos\/entrenador(\.js|\/)/.test(u)) pedidosApp.push(u.replace(SITIO, '')); });
    const trozosApp = () => pedidosApp.filter(u => /^modulos\/entrenador\//.test(u));
    const Q = (f, a) => pg.evaluate(f, a), espera = ms => pg.waitForTimeout(ms);
    /* la app, «Su cuerpo» y la lista de un grupo (en una página cualquiera) */
    const hastaElGrupo = async (p, g) => {
      await p.goto(SITIO + 'index.html', { waitUntil: 'domcontentloaded' });
      await p.waitForTimeout(2500);
      await p.evaluate(() => { const l = document.querySelector('.v19-w-lang[data-lang="es"]'); if (l) l.click(); }); await p.waitForTimeout(300);
      await p.evaluate(() => { const b = document.getElementById('v19-welcome-start'); if (b) b.click(); }); await p.waitForTimeout(1500);
      const abre = await p.evaluate(() => window.abrirCuerpo().then(() => true, () => false)); await p.waitForTimeout(2500);
      if (g) { await p.evaluate(q => document.querySelector('#cuerpo-panel .tgc-fila[data-g="' + q + '"]').click(), g); await p.waitForTimeout(1800); }
      return abre;
    };
    const fichaDe = (p, id) => p.evaluate(q => document.querySelector('#tgc-ej-lista .tgc-ej-fila[data-id="' + q + '"]').click(), id);
    /* ¿se ha puesto en marcha? (el botón grande se va y la barra avanza). Se espera a que pase, con un tope: con una espera fija de
       1,2 s, una máquina cargada daba un rojo que no era (16-11-2026) */
    const enMarcha = p => p.waitForFunction(() => { const b = document.querySelector('#tgc-ej-video .tgv-gran'), w = document.querySelector('#tgc-ej-video .tgv-barras b'); return !!b && b.hidden && !!w && parseFloat(w.style.width) > 0; }, null, { timeout: 8000 }).then(() => true, () => false);
    const conVideo = (PARCIAL ? idsVideo[0] : ids.filter(id => EJ[id].g[0] === 'pecho')[0]) || ids[0], grupo = EJ[conVideo].g[0];
    const abierto = await hastaElGrupo(pg, '');
    ok(abierto, '«Su cuerpo» se abre');
    await Q(g => document.querySelector('#cuerpo-panel .tgc-fila[data-g="' + g + '"]').click(), grupo); await espera(1800);
    ok(await Q(() => !window.TG_ENTRENADOR) && pedidosApp.length === 0, 'el módulo no se pide hasta abrir una ficha', pedidosApp);
    await fichaDe(pg, conVideo);
    await pg.waitForFunction(() => document.querySelector('#tgc-ej-video .tgv'), null, { timeout: 15000 }).catch(() => {}); await espera(600);
    const v = await Q(() => { const c = document.getElementById('tgc-ej-video'), r = c.getBoundingClientRect(), h = document.getElementById('tgc-hoja').getBoundingClientRect(); return { ve: !c.hidden, n: c.querySelectorAll('.tgv').length, ancho: r.width, dentro: r.left >= h.left - 1 && r.right <= h.right + 1, suena: !!c.querySelector('.tgv-gran') && !c.querySelector('.tgv-gran').hidden }; });
    ok(v.ve && v.n === 1 && v.ancho > 250 && v.dentro, 'la ficha de «' + conVideo + '» trae su vídeo, dentro de la hoja', v);
    ok(pedidosApp.filter(u => u === 'modulos/entrenador.js').length === 1 && trozosApp().join() === (trozoDe[conVideo] ? 'modulos/entrenador/' + trozoDe[conVideo] + '.js' : ''),
      trozoDe[conVideo] ? 'para ella se han pedido el motor y el trozo de ese ejercicio, y ningún otro' : 'es del bloque 1: para ella se ha pedido el motor, una vez, y ningún trozo', pedidosApp);
    ok(v.suena, 'no arranca solo: espera con su botón');
    await Q(() => document.querySelector('#tgc-ej-video .tgv-gran').click());
    ok(await enMarcha(pg), 'al tocarlo, se pone en marcha'); await espera(600);
    const temaAntes = await Q(() => document.getElementById('cuerpo-panel').getAttribute('data-tema'));
    await Q(() => document.getElementById('tgc-tema').click()); await espera(600);
    const temas = await Q(() => [document.getElementById('cuerpo-panel').getAttribute('data-tema'), document.querySelector('#tgc-ej-video .tgv').getAttribute('data-tema')]);
    ok(temas[0] !== temaAntes && temas[0] === temas[1], 'al cambiar de tema, el vídeo cambia con la pantalla (y no se reinicia)', temas);
    await Q(() => { document.querySelector('#tgc-ej-video .tgv').setAttribute('data-marca', '1'); document.getElementById('tgc-ej-guardar').click(); }); await espera(800);
    ok(await Q(() => { const r = document.querySelectorAll('#tgc-ej-video .tgv'); return r.length === 1 && r[0].getAttribute('data-marca') === '1'; }), 'guardar unas series no reinicia el vídeo');
    await Q(() => document.getElementById('tgc-ej-volver').click()); await espera(600);
    ok(await Q(() => document.getElementById('tgc-ej-video').hidden && !document.querySelector('.tgv')), 'al volver a la lista, el vídeo se quita');
    /* (16-11-2026) una ficha cuya coreografía va en un trozo: su trozo se pide al abrirla, y solo ese */
    const enTrozo = await Q(l => l.filter(id => document.querySelector('#tgc-ej-lista .tgc-ej-fila[data-id="' + id + '"]'))[0] || '', deTrozo.filter(id => EJ[id].g[0] === grupo && id !== conVideo));
    {
      const unicos = l => l.filter((x, i) => l.indexOf(x) === i).sort().join(), deben = unicos([trozoDe[conVideo], trozoDe[enTrozo]].filter(Boolean).map(f => 'modulos/entrenador/' + f + '.js'));
      if (enTrozo) { await fichaDe(pg, enTrozo); await pg.waitForFunction(() => document.querySelector('#tgc-ej-video .tgv'), null, { timeout: 15000 }).catch(() => {}); await espera(400); }
      const vt = await Q(() => { const c = document.getElementById('tgc-ej-video'); return { ve: !c.hidden, n: c.querySelectorAll('.tgv').length, boton: !document.getElementById('tgc-ej-vervideo').hidden }; });
      ok(!!enTrozo && vt.ve && vt.n === 1 && vt.boton && unicos(trozosApp()) === deben && trozosApp().length === deben.split(',').length && pedidosApp.filter(u => u === 'modulos/entrenador.js').length === 1,
        'la ficha de «' + enTrozo + '», cuya coreografía va en un trozo, trae su vídeo: el trozo se pide al abrirla, y solo ese', [vt, pedidosApp]);
      await Q(() => { const b = document.querySelector('#tgc-ej-video .tgv-gran'); if (b) b.click(); });
      ok(await enMarcha(pg), 'y al tocarlo se pone en marcha');
      await Q(() => document.getElementById('tgc-ej-volver').click()); await espera(600);
    }
    const sin = await Q(l => { const f = Array.from(document.querySelectorAll('#tgc-ej-lista .tgc-ej-fila')).filter(b => l.indexOf(b.dataset.id) < 0)[0]; if (!f) return ''; f.click(); return f.dataset.id; }, ids); await espera(900);
    ok(!sin || await Q(() => document.getElementById('tgc-ej-video').hidden && !document.querySelector('.tgv')), 'en una ficha sin coreografía («' + sin + '») no sale nada: queda como estaba');
    await ctx.close();
    if (enTrozo) {
      /* (16-11-2026) EL TROZO NO LLEGA (sin conexión y sin haberlo guardado): la ficha queda como estaba, sin vídeo y sin botón, con su
         nombre y sus pasos; y una del bloque 1, a continuación, sí trae el suyo */
      const ctxF = await nav.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
      await soloLocal(ctxF); await ctxF.route('**/modulos/entrenador/*.js', r => r.abort());
      const pf = await ctxF.newPage(); vigila(pf);
      await hastaElGrupo(pf, grupo);
      await fichaDe(pf, enTrozo); await pf.waitForTimeout(2500);
      const kf = await pf.evaluate(() => ({ video: !document.getElementById('tgc-ej-video').hidden || !!document.querySelector('.tgv'), boton: !document.getElementById('tgc-ej-vervideo').hidden,
        pasos: document.querySelectorAll('#tgc-ej-pasos li').length, nombre: document.getElementById('tgc-ej-nom').textContent }));
      ok(!kf.video && !kf.boton && kf.pasos === TX.es[enTrozo][1].length && kf.nombre === TX.es[enTrozo][0], 'si el trozo no llega, la ficha de «' + enTrozo + '» queda como estaba: sin vídeo y sin botón, con su nombre y sus pasos', kf);
      await pf.evaluate(() => document.getElementById('tgc-ej-volver').click()); await pf.waitForTimeout(600);
      /* una del bloque 1 de esa misma lista (la de antes, si lo era: en un pase parcial puede no serlo) */
      const delMotor = trozoDe[conVideo] ? await pf.evaluate(l => l.filter(id => document.querySelector('#tgc-ej-lista .tgc-ej-fila[data-id="' + id + '"]'))[0] || '', nucleoIds) : conVideo;
      if (delMotor) { await fichaDe(pf, delMotor); await pf.waitForFunction(() => document.querySelector('#tgc-ej-video .tgv'), null, { timeout: 15000 }).catch(() => {}); }
      ok(!delMotor || await pf.evaluate(() => !document.getElementById('tgc-ej-video').hidden && document.querySelectorAll('#tgc-ej-video .tgv').length === 1), delMotor ? 'y la de «' + delMotor + '», que va con el motor, trae su vídeo aunque no llegue ningún trozo' : 'en esa lista no hay ninguna del bloque 1 con la que probarlo');
      await ctxF.close();
      /* (17-11-2026) GUARDAR LOS TROZOS ES APARTE. Se hace al cargar los ejercicios y al llegar el motor, y nada de lo que le pase
         puede salir hacia ellos. Aquí, lo peor: un navegador en el que solo leer navigator.serviceWorker lanza un error (pasa en una
         página metida en un marco aislado). Desde que «Su cuerpo» está abierto, cada lectura lanza: la lista de ejercicios sale, y
         el vídeo de una ficha (el motor y su trozo) también; y se ha leído las dos veces (si no, la prueba no probaría nada) */
      {
        const ctxR = await nav.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
        await soloLocal(ctxR);
        await ctxR.addInitScript(() => { try { const d = Object.getOwnPropertyDescriptor(Navigator.prototype, 'serviceWorker');
          Object.defineProperty(Navigator.prototype, 'serviceWorker', { configurable: true, get() { if (window.__tgSinSW) { window.__tgSinSW++; throw new DOMException('The operation is insecure.', 'SecurityError'); } return d && d.get ? d.get.call(this) : undefined; } }); } catch (e) {} });
        const pr = await ctxR.newPage(); vigila(pr);
        const abreR = await hastaElGrupo(pr, '');
        await pr.evaluate(() => { window.__tgSinSW = 1; });
        await pr.evaluate(g => document.querySelector('#cuerpo-panel .tgc-fila[data-g="' + g + '"]').click(), grupo); await pr.waitForTimeout(1800);
        const filasR = await pr.evaluate(() => document.querySelectorAll('#tgc-ej-lista .tgc-ej-fila').length);
        if (filasR) { await fichaDe(pr, enTrozo); await pr.waitForFunction(() => document.querySelector('#tgc-ej-video .tgv'), null, { timeout: 15000 }).catch(() => {}); }
        const kr = await pr.evaluate(() => ({ video: !document.getElementById('tgc-ej-video').hidden && document.querySelectorAll('#tgc-ej-video .tgv').length === 1, boton: !document.getElementById('tgc-ej-vervideo').hidden,
          pasos: document.querySelectorAll('#tgc-ej-pasos li').length, leido: (window.__tgSinSW || 1) - 1 }));
        ok(abreR && filasR > 0 && kr.video && kr.boton && kr.pasos === TX.es[enTrozo][1].length && kr.leido >= 2,
          'guardar los trozos es aparte: en un navegador que no deja ni leer navigator.serviceWorker (lanza un error; leído ' + kr.leido + ' veces), la lista de ejercicios sale y la ficha de «' + enTrozo + '» trae su vídeo', { abreR, filasR, kr });
        await ctxR.close();
      }
      /* (16-11-2026) CON EL SERVICE WORKER DE VERDAD, Y DESPUÉS SIN CONEXIÓN. Las demás pruebas van sin service worker; esta, con él,
         en un navegador aparte que no resuelve ningún nombre de fuera ni usa el proxy del entorno (no sale nada a ninguna parte). Al abrir «Su cuerpo» con
         conexión, los trozos se van guardando solos sin que el motor se ponga en marcha, y el de un motor anterior se quita; después,
         sin conexión, una ficha de un trozo que nunca se abrió trae su vídeo, y también arrancando la app sin conexión */
      const nav2 = await chromium.launch(Object.assign({}, opc, { args: opc.args.concat(['--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1', '--proxy-server=direct://']) }));
      const ctxS = await nav2.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, serviceWorkers: 'allow' });
      const ps = await ctxS.newPage(), errS = []; ps.on('pageerror', e => errS.push(String(e).slice(0, 200)));
      await ps.goto(SITIO + 'index.html', { waitUntil: 'domcontentloaded' }); await ps.waitForTimeout(2500);
      await ps.evaluate(() => { const l = document.querySelector('.v19-w-lang[data-lang="es"]'); if (l) l.click(); }); await ps.waitForTimeout(300);
      await ps.evaluate(() => { const b = document.getElementById('v19-welcome-start'); if (b) b.click(); });
      const manda = await ps.waitForFunction(() => !!(navigator.serviceWorker && navigator.serviceWorker.controller), null, { timeout: 120000 }).then(() => true, () => false);
      const CACHE_APP = (/const CACHE = '([^']+)'/.exec(sw) || [])[1] || '';
      await ps.evaluate(async n => { const c = await caches.open(n); await c.put('/modulos/entrenador/viejo.00000000.js', new Response('de un motor anterior')); await c.put('/modulos/entrenador/apuntes.js', new Response('no es un trozo')); await c.put('/modulos/otra/cosa.00000000.js', new Response('tampoco')); }, CACHE_APP).catch(() => {});
      const enCache = () => ps.evaluate(async l => { const r = { trozos: 0, viejo: !!(await caches.match('/modulos/entrenador/viejo.00000000.js')) }; for (const f of l) if (await caches.match('/modulos/entrenador/' + f + '.js')) r.trozos++; return r; }, TROZOS).catch(() => ({ trozos: -1, viejo: true }));
      const abreS = manda && await ps.evaluate(() => window.abrirCuerpo().then(() => true, () => false));
      await ps.waitForTimeout(2500);
      const antesS = await enCache();
      /* los ejercicios se piden al abrir la lista de un grupo: con ellos llega el índice de los vídeos, y entonces se guardan los trozos */
      if (abreS) await ps.evaluate(g => { const f = document.querySelector('#cuerpo-panel .tgc-fila[data-g="' + g + '"]'); if (f) f.click(); }, grupo);
      let cacheS = antesS;
      for (let i = 0; abreS && i < 120 && !(cacheS.trozos === TROZOS.length && !cacheS.viejo); i++) { await ps.waitForTimeout(500); cacheS = await enCache(); }
      const queda = await ps.evaluate(async () => ({ motorParado: !window.TG_ENTRENADOR, apuntes: !!(await caches.match('/modulos/entrenador/apuntes.js')), cosa: !!(await caches.match('/modulos/otra/cosa.00000000.js')), motor: !!(await caches.match('/modulos/entrenador.js')) }));
      ok(manda && abreS && antesS.trozos === 0 && antesS.viejo && cacheS.trozos === TROZOS.length && !cacheS.viejo && queda.motorParado && queda.apuntes && queda.cosa && queda.motor,
        'con el service worker de verdad: al abrir con conexión la lista de un grupo de «Su cuerpo» se guardan los ' + TROZOS.length + ' trozos, sin poner en marcha el motor, y el trozo de un motor anterior se quita de la cache (y nada más)', { manda, abreS, antesS, cacheS, queda });
      /* sin conexión: una ficha de un trozo que nunca se abrió */
      await ctxS.setOffline(true);
      const verSin = async (p, g) => {
        const id = await p.evaluate(a => { const f = document.querySelector('#cuerpo-panel .tgc-fila[data-g="' + a[0] + '"]'); if (f) f.click(); return new Promise(ok => setTimeout(() => ok(a[1].filter(q => document.querySelector('#tgc-ej-lista .tgc-ej-fila[data-id="' + q + '"]'))[0] || ''), 1800)); }, [g, deTrozo.filter(q => EJ[q].g[0] === g)]);
        if (!id) return { id: '', ve: false };
        await fichaDe(p, id); await p.waitForFunction(() => document.querySelector('#tgc-ej-video .tgv'), null, { timeout: 15000 }).catch(() => {});
        await p.evaluate(() => { const b = document.querySelector('#tgc-ej-video .tgv-gran'); if (b) b.click(); });
        const anda = await enMarcha(p), ve = await p.evaluate(() => { const c = document.getElementById('tgc-ej-video'); return !c.hidden && c.querySelectorAll('.tgv').length === 1; });
        return { id: id, ve: ve, anda: anda };
      };
      const s1 = manda ? await verSin(ps, 'hombros') : { id: '' };
      ok(!!s1.id && s1.ve && s1.anda, 'después, sin conexión, la ficha de «' + s1.id + '» (de un trozo que nunca se abrió) trae su vídeo y se pone en marcha', s1);
      /* y arrancando la app sin conexión */
      let s2 = { id: '' };
      if (manda) {
        await ps.reload({ waitUntil: 'domcontentloaded' }).catch(() => {}); await ps.waitForTimeout(3000);
        await ps.evaluate(() => { const b = document.getElementById('v19-welcome-start'); if (b && b.offsetParent) b.click(); }).catch(() => {}); await ps.waitForTimeout(800);
        const abre2 = await ps.evaluate(() => typeof window.abrirCuerpo === 'function' ? window.abrirCuerpo().then(() => true, () => false) : false).catch(() => false); await ps.waitForTimeout(2500);
        s2 = abre2 ? await verSin(ps, 'biceps') : { id: '', abre: false };
      }
      ok(!!s2.id && s2.ve && s2.anda, 'y arrancando la app sin conexión, la de «' + s2.id + '» también', s2);
      /* (17-11-2026) Y NO SE GUARDA NADA SI EL MÓVIL PIDE AHORRAR DATOS, NI POR UNA CONEXIÓN 2G. Otra vez con conexión y con la
         cache sin ningún trozo. Con «ahorrar datos», al cargar los ejercicios (la lista de un grupo): pasados 5 s no se ha pedido
         ni guardado ninguno. Y cambiando a una conexión 2g, al abrir una ficha del bloque 1 (llega el motor, que es la otra ocasión
         en que se guardan): tampoco. Que sin eso sí se guardan lo dice el control de arriba, en este mismo navegador */
      let s3 = { a: null, b: null };
      if (manda) {
        await ctxS.setOffline(false);
        await ctxS.addInitScript(() => { try { Object.defineProperty(Navigator.prototype, 'connection', { configurable: true, get() { return window.__tgCon || { saveData: true, effectiveType: '4g' }; } }); } catch (e) {} });
        await ps.evaluate(async n => { const c = await caches.open(n); for (const k of await c.keys()) if (/\/modulos\/entrenador\//.test(k.url)) await c.delete(k); }, CACHE_APP).catch(() => {});
        await ps.reload({ waitUntil: 'domcontentloaded' }).catch(() => {}); await ps.waitForTimeout(3000);
        await ps.evaluate(() => { const b = document.getElementById('v19-welcome-start'); if (b && b.offsetParent) b.click(); }).catch(() => {}); await ps.waitForTimeout(800);
        const abre3 = await ps.evaluate(() => typeof window.abrirCuerpo === 'function' ? window.abrirCuerpo().then(() => true, () => false) : false).catch(() => false); await ps.waitForTimeout(2500);
        const pedS = []; ps.on('request', r => { const u = r.url(); if (/\/modulos\/entrenador\//.test(u)) pedS.push(u.replace(SITIO, '')); });
        const estado = () => ps.evaluate(() => ({ manda: !!(navigator.serviceWorker && navigator.serviceWorker.controller), ahorro: !!(navigator.connection && navigator.connection.saveData), tipo: String(navigator.connection && navigator.connection.effectiveType),
          filas: document.querySelectorAll('#tgc-ej-lista .tgc-ej-fila').length, motor: !!window.TG_ENTRENADOR, video: !document.getElementById('tgc-ej-video').hidden && document.querySelectorAll('#tgc-ej-video .tgv').length === 1 })).catch(() => ({}));
        if (abre3) await ps.evaluate(g => { const f = document.querySelector('#cuerpo-panel .tgc-fila[data-g="' + g + '"]'); if (f) f.click(); }, grupo);
        await ps.waitForTimeout(1800 + 5000);
        s3.a = Object.assign(await estado(), { abre: abre3, enCache: (await enCache()).trozos, pedidos: pedS.length });
        await ps.evaluate(() => { window.__tgCon = { saveData: false, effectiveType: '2g' }; });
        const delMotorS = await ps.evaluate(l => l.filter(id => document.querySelector('#tgc-ej-lista .tgc-ej-fila[data-id="' + id + '"]'))[0] || '', nucleoIds);
        if (delMotorS) { await fichaDe(ps, delMotorS); await ps.waitForFunction(() => document.querySelector('#tgc-ej-video .tgv'), null, { timeout: 15000 }).catch(() => {}); await ps.waitForTimeout(5000); }
        s3.b = Object.assign(await estado(), { id: delMotorS, enCache: (await enCache()).trozos, pedidos: pedS.length });
      }
      const a3 = s3.a || {}, b3 = s3.b || {};
      ok(a3.abre && a3.manda && a3.ahorro === true && a3.filas > 0 && a3.enCache === 0 && a3.pedidos === 0 && !a3.motor
        && !!b3.id && b3.manda && b3.ahorro === false && b3.tipo === '2g' && b3.motor && b3.video && b3.enCache === 0 && b3.pedidos === 0,
        'y no se guarda ninguno si el móvil pide ahorrar datos (al cargar los ejercicios) ni por una conexión 2g (al llegar el motor, con la ficha de «' + (b3.id || '') + '»)', s3);
      ok(errS.length === 0, 'con el service worker y sin conexión: cero errores de página', errS.slice(0, 4));
      await nav2.close();
    }
  }

  console.log('\n════ 4. Samsung Internet: el vídeo en un canvas, con sus mismos colores ════');
  /* (12 de noviembre de 2026) Con su modo oscuro, Samsung Internet repinta los SVG y no hace caso de color-scheme (en el
     tour le ponía a Jérôme la cara casi negra); allí el vídeo se pinta en un canvas a partir de su propio SVG
     (tools/entrenador/src/85-lienzo.js, el mismo arreglo que el del tour). Con el user-agent de ese móvil: hay canvas y el
     SVG queda invisible; en cuatro momentos (la cabecera, el primer paso, uno del medio y el cierre) de tres ejercicios,
     de día y de noche, el canvas es el mismo dibujo que el SVG; con el vídeo en marcha, el canvas se repinta solo; con el
     modo oscuro forzado de Chromium (lo que hace Samsung) el SVG cambia y el canvas no; y con otro navegador, ni canvas
     ni SVG tocado. El parpadeo va con Math.random: aquí, con una semilla fija, para que el mismo momento sea el mismo
     dibujo en los dos navegadores. */
  {
    const UA_SAMSUNG = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/30.0 Chrome/143.0.0.0 Mobile Safari/537.36';
    const SEMILLA = '(() => { let s = 20261112; Math.random = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; })();';
    /* entero: tres ejercicios (el primero, el press de banca y el último), de día y de noche. En un pase parcial: todos los
       que se piden, cada uno con su tema (el primero, de día, que es con el que se compara el modo oscuro forzado), para
       ver con ese navegador el material nuevo de un bloque antes de entregarlo */
    const MUESTRA = PARCIAL ? idsVideo : [...new Set([ids[0], ids.find(i => /^press-banca/.test(i)), ids[ids.length - 1]].filter(Boolean))];
    const TEMAS = id => !PARCIAL ? ['dia', 'noche'] : [id !== MUESTRA[0] && ids.indexOf(id) % 2 ? 'noche' : 'dia'];
    const IGUAL = d => d.media < 3 && d.mucho < 1;
    const CIFRAS = d => 'diferencia media ' + d.media.toFixed(2) + ', ' + d.mucho.toFixed(2) + ' % de píxeles muy distintos';
    /* dos capturas de la escena (base64), comparadas en la propia página: la diferencia media (0-255) y el % de píxeles
       muy distintos (más de 64), con una moviéndose hasta M píxeles hacia cada lado (el canvas va en su propia capa y el
       navegador puede ponerlo un píxel más allá: lo midió el tour), y vale la mejor */
    const compara = (pg, a, b, M) => pg.evaluate(async ([a, b, M]) => {
      const px = async u => { const im = new Image(); im.src = 'data:image/png;base64,' + u; await im.decode();
        const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const g = c.getContext('2d'); g.drawImage(im, 0, 0); return g.getImageData(0, 0, im.width, im.height); };
      const A = await px(a), B = await px(b), W = Math.min(A.width, B.width), H = Math.min(A.height, B.height);
      let mejor = null;
      for (let dy = -M; dy <= M; dy++) for (let dx = -M; dx <= M; dx++) {
        let suma = 0, mucho = 0, n = 0;
        for (let y = M; y < H - M; y++) for (let x = M; x < W - M; x++) {
          const ia = ((y + dy) * A.width + x + dx) * 4, ib = (y * B.width + x) * 4;
          const m = Math.max(Math.abs(A.data[ia] - B.data[ib]), Math.abs(A.data[ia + 1] - B.data[ib + 1]), Math.abs(A.data[ia + 2] - B.data[ib + 2]));
          suma += m; if (m > 64) mucho++; n++;
        }
        if (!mejor || suma / n < mejor.media) mejor = { media: suma / n, mucho: 100 * mucho / n };
      }
      return mejor;
    }, [a, b, M]);
    /* va a un momento (tramo n, s segundos dentro), a 30 cuadros por segundo, con todo lo animado por CSS parado, y pinta */
    const IR = ([n, s]) => {
      const R = window.R; R.irA(n);
      for (let k = 0; k < Math.round(s * 30); k++) R.avanzar(1 / 30);
      document.getAnimations().forEach(a => a.pause());
      const e = R.raiz.querySelector('.tgv-escena'), svg = e.querySelector('svg.tge-svg'), cv = e.querySelector('canvas.tgv-lienzo');
      /* en las capturas, solo el dibujo: los rótulos de encima son HTML, y el modo oscuro forzado los cambia aparte */
      for (const k of e.children) if (k !== svg && k !== cv) k.style.visibility = 'hidden';
      if (e.tgvLienzo) e.tgvLienzo.dibujar();
      const b = e.getBoundingClientRect();
      return { samsung: !!window.TG_ENTRENADOR.samsung, lienzo: !!cv, op: getComputedStyle(svg).opacity, caja: [b.x, b.y, b.width, b.height] };
    };
    const VER = svg => { const e = document.querySelector('.tgv-escena'); e.querySelector('svg.tge-svg').style.opacity = svg ? '1' : '0'; e.querySelector('canvas.tgv-lienzo').style.visibility = svg ? 'hidden' : ''; };
    const fotos = async (pg, r) => {
      const clip = { x: Math.ceil(r.caja[0]), y: Math.ceil(r.caja[1]), width: Math.floor(r.caja[2]) - 1, height: Math.floor(r.caja[3]) - 1 };
      const lienzo = (await pg.screenshot({ clip })).toString('base64');
      await pg.evaluate(VER, true);
      const svg = (await pg.screenshot({ clip })).toString('base64');
      await pg.evaluate(VER, false);
      return { lienzo, svg };
    };
    const oscuro = await chromium.launch(Object.assign({}, opc, { args: opc.args.concat(['--blink-settings=forceDarkModeEnabled=true']) }));
    const malS = [], refs = {}, medidas = [];
    let momentos = 0, coste = null;
    try {
      for (const [modo, b] of [['samsung', nav], ['otro', nav], ['forzado', oscuro]]) {
        const ctx = await b.newContext(Object.assign({ viewport: { width: 360, height: 780 }, deviceScaleFactor: 2, serviceWorkers: 'block' }, modo === 'otro' ? {} : { userAgent: UA_SAMSUNG }));
        await soloLocal(ctx);
        await ctx.addInitScript(SEMILLA);
        const pg = await ctx.newPage(); vigila(pg);
        await pg.goto(SITIO + 'tools/entrenador/pruebas/auditoria.html');
        await pg.evaluate(l => window.preparar(l), ['es']);
        for (const id of (modo === 'samsung' ? MUESTRA : [MUESTRA[0]])) for (const tema of (modo === 'samsung' ? TEMAS(id) : ['dia'])) {
          const m = await pg.evaluate(a => window.montar(a[0], 'es', a[1]), [id, tema]);
          if (!m) { malS.push(modo + ': ' + id + ' no se monta'); continue; }
          const N = m.pasos.length;
          for (const mo of [[0, 1.2], [1, 0.8], [1 + Math.floor(N / 2), 2.0], [N + 1, 1.0]]) {
            const r = await pg.evaluate(IR, mo), donde = modo + ' · ' + id + ' (' + tema + ') · tramo ' + mo[0] + ' a ' + mo[1] + ' s';
            if (modo === 'otro') { if (r.samsung || r.lienzo || r.op !== '1') malS.push('otro navegador, ' + donde + ': ni canvas ni SVG invisible (' + JSON.stringify(r) + ')'); continue; }
            if (!r.samsung || !r.lienzo || r.op !== '0') { malS.push(donde + ': falta el canvas o el SVG no está invisible (' + JSON.stringify(r) + ')'); continue; }
            const f = await fotos(pg, r), k = id + '|' + tema + '|' + mo.join('/');
            momentos++;
            /* con Samsung, el canvas es el mismo dibujo que su SVG; con el modo oscuro forzado el SVG se oscurece (eso es
               lo que hace ese modo) y lo que vale es que el canvas no cambie y el SVG sí, contra el mismo momento sin él */
            if (modo === 'samsung') {
              const d = await compara(pg, f.lienzo, f.svg, 2);
              medidas.push(d.media);
              if (!IGUAL(d)) malS.push(donde + ': el canvas no es el mismo dibujo que el SVG (' + CIFRAS(d) + ')');
              refs[k] = f;
            } else if (!refs[k]) malS.push(donde + ': falta el mismo momento sin el modo oscuro forzado');
            else {
              const dl = await compara(pg, f.lienzo, refs[k].lienzo, 2), ds = await compara(pg, f.svg, refs[k].svg, 0);
              if (!IGUAL(dl)) malS.push(donde + ': con el modo oscuro forzado, el canvas cambia (' + CIFRAS(dl) + ')');
              if (!(ds.media >= 8)) malS.push(donde + ': la prueba no vale, el SVG tampoco cambia con el modo oscuro forzado (' + CIFRAS(ds) + ')');
            }
          }
          if (modo === 'samsung' && id === MUESTRA[0] && tema === 'dia') {
            /* el vídeo en marcha: el canvas se repinta solo, sin pedírselo */
            await pg.evaluate(() => { document.getAnimations().forEach(a => a.play()); window.R.irA(1); window.R.reproducir(); });
            await pg.waitForTimeout(1500);
            await pg.evaluate(() => window.R.pausar());
            await pg.waitForTimeout(400);
            const r = await pg.evaluate(() => { document.getAnimations().forEach(a => a.pause()); const e = document.querySelector('.tgv-escena'), b = e.getBoundingClientRect();
              for (const k of e.children) if (k.localName !== 'svg' && k.localName !== 'canvas') k.style.visibility = 'hidden';
              return { caja: [b.x, b.y, b.width, b.height] }; });
            const f = await fotos(pg, r), d = await compara(pg, f.lienzo, f.svg, 2);
            if (!IGUAL(d)) malS.push('samsung · ' + id + ': con el vídeo en marcha el canvas no se repinta solo (' + CIFRAS(d) + ')');
            /* lo que cuesta pintarlo: 60 cuadros, solo el canvas, y con la CPU frenada ×4 */
            const mide = () => pg.evaluate(() => { const R = window.R, e = R.raiz.querySelector('.tgv-escena'); R.irA(2); let t = 0; for (let k = 0; k < 60; k++) { R.avanzar(1 / 30); const t0 = performance.now(); e.tgvLienzo.dibujar(); t += performance.now() - t0; } return t / 60; });
            const normal = await mide(), cdp = await ctx.newCDPSession(pg);
            await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
            const frenada = await mide();
            await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
            coste = [normal, frenada];
          }
        }
        await ctx.close();
      }
    } finally { await oscuro.close(); }
    ok(!malS.length && momentos >= MUESTRA.reduce((n, id) => n + TEMAS(id).length, 0) * 4 + 4, 'Samsung Internet: el vídeo en un canvas (' + (PARCIAL ? 'los ' + MUESTRA.length + ' del pase parcial' : MUESTRA.join(', ')) + '; ' + momentos + ' momentos, de día y de noche, y con el modo oscuro forzado): el mismo dibujo que el SVG (la mayor diferencia media, ' + (medidas.length ? Math.max(...medidas).toFixed(2) : '–') + ' de 255), se repinta solo con el vídeo en marcha, el modo oscuro no lo cambia y en otro navegador no hay canvas', malS.slice(0, 6));
    if (coste) info('pintar el canvas, un cuadro: ' + coste[0].toFixed(1) + ' ms de media; con la CPU frenada ×4, ' + coste[1].toFixed(1) + ' ms (como mucho 30 veces por segundo)');
  }
  await nav.close();
  ok(!errores.length, 'cero errores de página', errores.slice(0, 5));
  console.log('\n' + (fallos ? '  ' + fallos + ' de ' + hechos + ' controles EN ROJO' : '  ' + hechos + ' controles, todos en verde') + (PARCIAL ? '   (PASE PARCIAL: ' + idsVideo.length + ' de ' + ids.length + ' vídeos; la entrega se audita entera)' : ''));
  process.exit(fallos ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
