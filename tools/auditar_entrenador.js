#!/usr/bin/env node
/* auditar_entrenador.js — Jérôme, el entrenador: el vídeo de cada ejercicio de «Su cuerpo»
 * (modulos/entrenador.js, 11 de noviembre de 2026).
 *
 *     python3 -m http.server 8766 &      (desde la raíz del repo)
 *     node tools/auditar_entrenador.js 8766
 *
 * 1. Sin navegador:
 *    · el módulo es el que sale de sus fuentes (tools/entrenador/construir.py --comprobar);
 *    · cada coreografía es de un ejercicio que existe, y tiene un tramo por cada paso de su ficha,
 *      en los diez idiomas;
 *    · LA FICHA NO HA CAMBIADO desde que se hizo la coreografía: la huella de sus pasos en
 *      castellano es la apuntada (si cambia un paso, la coreografía se revisa antes de volver a
 *      construir; mientras tanto esto queda en rojo);
 *    · cada coreografía, por dentro: las posturas que nombra existen, lo clavado se entiende, el
 *      material es de los que hay, y ninguna postura clave da un número imposible ni mete un pie
 *      bajo el suelo;
 *    · los gestos del presentador (saluda, la visera, «¡vamos!», el consejo, el pulgar…): sus posturas
 *      existen, ninguna mano levantada se sale del cuadro y ninguna va más deprisa de lo que se ve;
 *    · la voz: con las voces que enseña un iPhone (las «Eloquence», robóticas), un PC o un Android,
 *      nunca se elige una robótica ni una de red, y si no hay ninguna que valga no se ofrece;
 *    · los textos propios (TG_ENTRENADOR.textos), en los diez idiomas y con sus {huecos};
 *    · el módulo: sin eval, sin console.log, y sin innerHTML que reciba un texto de la ficha;
 *    · los enganches: el CARGA-PEREZOSA y la ruta en index.html, el precache y «red primero» en
 *      sw.js, y la ficha de modulos/cuerpo.js (el hueco del vídeo, y que se quita al salir).
 * 2. En Chromium, móvil emulado (320 de ancho, el más estrecho): el vídeo de CADA ejercicio, entero,
 *    cuadro a cuadro, en castellano y en otro idioma (los nueve van rotando): acaba, dura lo que
 *    tiene que durar, lo que se lee en cada paso es el paso de la ficha, palabra por palabra, no
 *    hay ningún NaN en el dibujo y nada se sale de ancho. Y EL MOVIMIENTO, medido en cada cuadro:
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
 *    guardar unas series y se quita al volver; en una ficha sin coreografía no sale nada.
 * Cero errores de página. Sale con 1 si algo falla.
 */
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process'), crypto = require('crypto'), vm = require('vm');
const RAIZ = path.join(__dirname, '..');
const PUERTO = process.argv[2] || '8766';
const SITIO = 'http://127.0.0.1:' + PUERTO + '/';
const LANGS = ['es', 'en', 'fr', 'de', 'it', 'nl', 'zh', 'zht', 'bg', 'pl'];
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
  ok(cons.status === 0, 'modulos/entrenador.js es el que sale de tools/entrenador/src/ (construir.py --comprobar)', (cons.stdout || cons.stderr || '').trim().slice(0, 200));
  /* el módulo, cargado sin navegador: solo define cosas */
  const caja = { window: {}, document: {}, Math, Object, Array, JSON, String, Number, RegExp, Error, console: { log() {} } };
  vm.runInNewContext(mod, caja, { filename: 'modulos/entrenador.js' });
  const E = caja.window.TG_ENTRENADOR;
  ok(E && typeof E.tiene === 'function' && typeof E.montar === 'function' && typeof E.ids === 'function', 'TG_ENTRENADOR: tiene, montar, ids');
  const ids = E.ids(), T = E._;
  const EJ = {}; JSON.parse(lee('datos/cuerpo/ejercicios.json')).ejercicios.forEach(e => { EJ[e.id] = e; });
  const TX = {}; LANGS.forEach(l => { TX[l] = JSON.parse(lee('datos/cuerpo/ejercicios-' + l + '.json')); });
  info(ids.length + ' ejercicios con vídeo, de ' + Object.keys(EJ).length);
  ok(ids.length > 0 && ids.every(id => EJ[id]), 'cada coreografía es de un ejercicio que existe', ids.filter(id => !EJ[id]));
  const sinPasos = [], otraFicha = [];
  ids.forEach(id => {
    const n = (T.COREO[id].pasos || []).length;
    LANGS.forEach(l => { const t = TX[l][id]; if (!t || !Array.isArray(t[1]) || t[1].length !== n) sinPasos.push(id + ' (' + l + ': ' + (t && t[1] ? t[1].length : 'no está') + ' pasos, la coreografía ' + n + ')'); });
    if (TX.es[id] && E.huellas[id] !== huella(TX.es[id][1])) otraFicha.push(id);
  });
  ok(!sinPasos.length, 'cada coreografía tiene un tramo por cada paso de su ficha, en los diez idiomas', sinPasos.slice(0, 6));
  ok(!otraFicha.length && Object.keys(E.huellas).length === ids.length, 'las fichas no han cambiado desde que se hicieron sus coreografías (la huella de los pasos en castellano)', otraFicha);
  ok(ids.every(id => E.tiene(id, TX.es[id][1].length)) && !E.tiene(ids[0], TX.es[ids[0]][1].length + 1) && !E.tiene('no-existe') && !E.tiene('toString') && !E.tiene('constructor'),
    'tiene(id, pasos): sí con los pasos de la ficha; no con otros, ni con un ejercicio sin coreografía');
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
    if (co.isometrico) usadas.add(co.isometrico);
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
      ['un PC con una voz de red y una del sistema', PC, [v('Google español', 'es-ES', 'Google español', false), v('Microsoft Helena - Spanish (Spain)', 'es-ES', 'Microsoft Helena - Spanish (Spain)')], 'es', 'Microsoft Helena - Spanish (Spain)', false],
      ['un PC que solo tiene voces de red', PC, [v('Google español', 'es-ES', 'Google español', false)], 'es', null, false],
      ['un Android', ANDROID, [v('español España', 'es_ES', 'español España'), v('English United Kingdom', 'en_GB', 'English United Kingdom')], 'es', 'español España', false]
    ];
    const malas = [];
    casos.forEach(c => { let r; try { r = con(c[1], c[2]).voces(c[3]); } catch (e) { malas.push(c[0] + ': ' + e.message); return; } if (r.elegida !== c[4] || r.sistema !== c[5]) malas.push(c[0] + ': elige ' + JSON.stringify(r.elegida) + (r.sistema ? ' (la del sistema)' : '')); });
    ok(!malas.length, 'la voz (' + casos.length + ' aparatos de prueba): nunca una robótica («Eloquence») ni una de red; si el iPhone no enseña otra, pone él la suya; si no hay ninguna que valga, no se ofrece', malas);
    ok(!/TG_VOZ\.vozLocal/.test(mod), 'el vídeo ya no coge «la primera voz del idioma» (TG_VOZ.vozLocal): elige la suya');
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
  ok(filas.length >= 20 && !cojos.length, 'los textos del vídeo (' + filas.length + ' filas), en los diez idiomas y con sus {huecos}', cojos.slice(0, 6));
  /* el nombre, en la forma de cada idioma, como en el tour (Jérôme, 11-11-2026: «En la forma correcta de la traducción»):
     «Jérôme» en los de letra latina; en búlgaro y en chino, la suya y nunca la latina */
  const NOMBRE = { bg: 'Жером', zh: '热罗姆', zht: '熱羅姆' };
  ok(LANGS.every(l => E.textos.entCon[l].includes(NOMBRE[l] || 'Jérôme') && (!NOMBRE[l] || !/J[eé]r[oô]me/i.test(E.textos.entCon[l])))
     && !/\bJero\b/.test(mod.replace(/\/\*[\s\S]*?\*\//g, '')), 'el personaje se llama Jérôme en los diez idiomas, en la forma de cada uno («Жером», «热罗姆», «熱羅姆»), y ya no «Jero»');
  ok(!/\beval\s*\(|new Function|console\.log/.test(mod), 'el módulo: sin eval, sin new Function, sin console.log');
  const conHtml = mod.split('\n').filter(l => /\.innerHTML\s*=/.test(l));
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
  {
    const ctx = await nav.newContext({ viewport: { width: 320, height: 640 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
    await soloLocal(ctx);
    const pg = await ctx.newPage(); vigila(pg);
    await pg.goto(SITIO + 'tools/entrenador/pruebas/auditoria.html');
    const total = await pg.evaluate(l => window.preparar(l), LANGS);
    info('datos de ' + total + ' ejercicios');
    const peros = [], gestos = {}, tope = {}, dibujo = [], plegados = []; let pasados = 0, cuadros = 0, mirados = 0, girados = 0, borron = 99;
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      for (const l of ['es', LANGS[1 + (i % 9)]]) {
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
        if (dq.length) dibujo.push(id + ' (vista ' + (r.vistaN + 1) + '): ' + dq.join('; '));
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
    ok(!peros.length && pasados === ids.length * 2, 'los ' + ids.length + ' vídeos, enteros, en castellano y en otro idioma (' + pasados + ' pases, ' + cuadros + ' cuadros): acaban, duran lo suyo, se lee el paso de la ficha palabra por palabra, sin NaN y sin salirse de ancho', peros.slice(0, 8));
    info('el movimiento, lo más de todo: lo clavado se mueve ' + tope.clavo + ' cm; el cuerpo, ' + tope.salto + ' cm en un cuadro (a 30 por segundo); una mano, ' + tope.saltoM + ' cm; la cabeza cabecea ' + tope.cabRep + '° en una repetición y ' + tope.cabBusto + '° al entrar; el tupé, ' + tope.pelo + '°');
    const delMov = peros.filter(p => /clavado|salto|respira|muelle|sale del cuadro/.test(p));
    ok(!delMov.length, 'el movimiento, medido en cada cuadro de los ' + ids.length + ' vídeos: lo clavado no se mueve (el pie en el suelo, la mano en la barra) aunque respire y reparta el peso; nada se teletransporta; respira; los muelles no se pasan; de cerca ninguna mano se sale', delMov.slice(0, 6));
    ok(!dibujo.length && mirados > 100000 && girados >= ids.length - 1, 'el dibujo, medido en cada cuadro y desde las dos vistas de cada ejercicio (' + girados + ' pases desde la de «Girar»; ' + mirados + ' puntos del tronco mirados): el tronco entero cabe en su silueta (también visto de pies a cabeza), el estampado no se queda a medio borrar, un músculo encendido no se queda en un borrón (el menor, ' + borron + ' cm de semieje) y los avisos duran lo que una mirada', dibujo.slice(0, 6));
    /* no es un control (una mano delante del hombro es lo natural en un curl o en un press visto de frente): es la lista de lo que conviene mirar a ojo al elegir la vista */
    info('para mirar a ojo — en la primera vista, el brazo de este lado plegado sobre sí mismo y con el hombro tras la mano más del 20 % de la repetición: ' + (plegados.length ? plegados.join(', ') : 'ninguno'));
    const faltan = []; ['cabecera', 'cierre'].forEach(mo => T.GESTOS_DE[mo].forEach(g => { if (!gestos[mo + ':' + g]) faltan.push(mo + ':' + g); }));
    ok(!faltan.length && Object.keys(gestos).every(g => /^(cabecera|cierre|consejo):/.test(g)), 'los gestos se reparten: cada ejercicio tiene el suyo en la cabecera y en el cierre, y salen todos (' + Object.keys(gestos).map(g => g.split(':')[1] + ' ' + gestos[g]).join(', ') + ')', faltan);
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
    const Q = (f, a) => pg.evaluate(f, a), espera = ms => pg.waitForTimeout(ms);
    await pg.goto(SITIO + 'index.html', { waitUntil: 'domcontentloaded' });
    await espera(2500);
    await Q(() => { const l = document.querySelector('.v19-w-lang[data-lang="es"]'); if (l) l.click(); }); await espera(300);
    await Q(() => { const s = document.getElementById('v19-welcome-start'); if (s) s.click(); }); await espera(1500);
    const abierto = await Q(() => window.abrirCuerpo().then(() => true, () => false)); await espera(2500);
    ok(abierto, '«Su cuerpo» se abre');
    const conVideo = ids.filter(id => EJ[id].g[0] === 'pecho')[0] || ids[0], grupo = EJ[conVideo].g[0];
    await Q(g => document.querySelector('#cuerpo-panel .tgc-fila[data-g="' + g + '"]').click(), grupo); await espera(1800);
    ok(await Q(() => !window.TG_ENTRENADOR), 'el módulo no se pide hasta abrir una ficha');
    await Q(id => document.querySelector('#tgc-ej-lista .tgc-ej-fila[data-id="' + id + '"]').click(), conVideo); await espera(1800);
    const v = await Q(() => { const c = document.getElementById('tgc-ej-video'), r = c.getBoundingClientRect(), h = document.getElementById('tgc-hoja').getBoundingClientRect(); return { ve: !c.hidden, n: c.querySelectorAll('.tgv').length, ancho: r.width, dentro: r.left >= h.left - 1 && r.right <= h.right + 1, suena: !!c.querySelector('.tgv-gran') && !c.querySelector('.tgv-gran').hidden }; });
    ok(v.ve && v.n === 1 && v.ancho > 250 && v.dentro, 'la ficha de «' + conVideo + '» trae su vídeo, dentro de la hoja', v);
    ok(v.suena, 'no arranca solo: espera con su botón');
    await Q(() => document.querySelector('#tgc-ej-video .tgv-gran').click()); await espera(1200);
    ok(await Q(() => document.querySelector('#tgc-ej-video .tgv-gran').hidden && parseFloat(document.querySelector('#tgc-ej-video .tgv-barras b').style.width) > 0), 'al tocarlo, se pone en marcha');
    const temaAntes = await Q(() => document.getElementById('cuerpo-panel').getAttribute('data-tema'));
    await Q(() => document.getElementById('tgc-tema').click()); await espera(600);
    const temas = await Q(() => [document.getElementById('cuerpo-panel').getAttribute('data-tema'), document.querySelector('#tgc-ej-video .tgv').getAttribute('data-tema')]);
    ok(temas[0] !== temaAntes && temas[0] === temas[1], 'al cambiar de tema, el vídeo cambia con la pantalla (y no se reinicia)', temas);
    await Q(() => { document.querySelector('#tgc-ej-video .tgv').setAttribute('data-marca', '1'); document.getElementById('tgc-ej-guardar').click(); }); await espera(800);
    ok(await Q(() => { const r = document.querySelectorAll('#tgc-ej-video .tgv'); return r.length === 1 && r[0].getAttribute('data-marca') === '1'; }), 'guardar unas series no reinicia el vídeo');
    await Q(() => document.getElementById('tgc-ej-volver').click()); await espera(600);
    ok(await Q(() => document.getElementById('tgc-ej-video').hidden && !document.querySelector('.tgv')), 'al volver a la lista, el vídeo se quita');
    const sin = await Q(() => { const f = Array.from(document.querySelectorAll('#tgc-ej-lista .tgc-ej-fila')).filter(b => !window.TG_ENTRENADOR.tiene(b.dataset.id))[0]; if (!f) return ''; f.click(); return f.dataset.id; }); await espera(900);
    ok(!sin || await Q(() => document.getElementById('tgc-ej-video').hidden && !document.querySelector('.tgv')), 'en una ficha sin coreografía («' + sin + '») no sale nada: queda como estaba');
    await ctx.close();
  }
  await nav.close();
  ok(!errores.length, 'cero errores de página', errores.slice(0, 5));
  console.log('\n' + (fallos ? '  ' + fallos + ' de ' + hechos + ' controles EN ROJO' : '  ' + hechos + ' controles, todos en verde'));
  process.exit(fallos ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
