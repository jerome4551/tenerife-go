#!/usr/bin/env node
/* auditar_tour.js — los tours con Jero, enteros, en los diez idiomas.
 *
 * POR QUE EXISTE. El 11 de octubre de 2026 Jerome pidio rehacer el tour
 * («añadimos cosas») y «verifica que se traduce en cada idioma. Sin
 * errores». El tour de antes llevaba los pasos en listas dentro de un objeto
 * propio, y ningun control de idioma las leia: un mes diciendo «mas de 700
 * lugares verificados» con 975 en el mapa. Desde entonces los textos son
 * filas de diez idiomas (las leen los controles de idioma) y esto mira lo que
 * solo se ve abriendolo: el tour de verdad, en un navegador.
 *
 * EL 10 DE NOVIEMBRE DE 2026 el tour paso a tener un presentador («un
 * personaje animado de mí», Jero) y a ser dos: el de la app, por capitulos, y
 * el del panel del cielo. Todo vive en modulos/guia.js, que se pide cuando
 * hace falta. Este control se rehizo con ellos. Y esa misma tarde, con el
 * bloque 8 de «Su cuerpo» ya en main, llego el tercero: el de esa pantalla.
 *
 * QUE HACE, por idioma:
 *   · entra como alguien nuevo (elige el idioma en la bienvenida y pulsa
 *     «Comenzar»): tiene que salir Jero con la pregunta del tour;
 *   · recorre el tour de la app con «Siguiente» en cuatro tamaños de movil
 *     (320×568, 360×640, 390×844, 412×915) y en cada paso mira:
 *       - texto sin {…} por sustituir, sin «undefined», «NaN» ni «null», y
 *         el mismo texto, entero, para los lectores de pantalla;
 *       - que lo que se señala este en pantalla (el foco no queda en el
 *         centro) y que ni el bocadillo ni Jero lo tapen;
 *       - que el bocadillo y Jero quepan enteros en la pantalla, que no se
 *         salga nada por dentro y que ningun boton se parta en dos lineas;
 *       - que Jero este y señale: una mano con el dedo estirado y ese brazo
 *         fuera del aro. Donde no cabe, Jero se queda en miniatura en la
 *         esquina del bocadillo y mira hacia lo que explica: eso solo se
 *         admite en los dos moviles pequeños (320×568 y 360×640);
 *       - las cifras que se cuentan: los lugares del mapa, los idiomas, las
 *         costas del panel del mar y los pasos;
 *   · los pasos de Rutas abren el panel en su pestaña, y al terminar o saltar
 *     el tour el panel tiene que quedar cerrado;
 *   · al terminar, que quede guardada la version del tour;
 *   · quien vio un tour anterior (guardado «1» o «2») ve «novedades»;
 *   · el menu de visitas («Ver el tour» en la leyenda): las tres visitas, cada
 *     una con los pasos que de verdad tiene, los capitulos, el boton de cerrar
 *     con su texto, que en el movil mas pequeño se vea entero (o se pueda
 *     recorrer entero), y que un capitulo empieza en su primer paso;
 *   · el tour del cielo: la primera vez, el boton de Jero se ofrece con un
 *     globito; el tour recorre las cinco pestañas en los cuatro tamaños, con
 *     lo mismo de arriba en cada paso; la luz roja se enciende en su paso y se
 *     apaga al salir; al terminar queda guardado y el globito no vuelve. Se
 *     recorre DE NOCHE (el reloj de la pagina, a las 23:30 UTC): asi el panel
 *     ofrece la luz roja en su barra, y se mira que la visita la aparte
 *     mientras dura y la devuelva al acabar, sin darla por vista. Y la
 *     cabecera del panel con la luz roja: durante la visita, sin el regulador
 *     de brillo; fuera de ella, con los cinco (el titulo, Jero, «Luz roja»,
 *     el regulador y la ✕) sin que nada pise a nada ni se salga, en los
 *     cuatro tamaños;
 *   · con el movil tumbado (844×390, en castellano): los tres tours enteros,
 *     con lo mismo de arriba en cada paso; apaisado y bajo, el bocadillo va
 *     al lado de lo que señala, y el ultimo paso tiene que caber entero;
 *   · el tour de «Su cuerpo»: la pantalla se abre como la abre la app
 *     (abrirCuerpo); lleva el boton de Jero dentro de su escena (se lo pone el
 *     cargador de index.html: modulos/cuerpo.js no se toca) y la primera vez
 *     se ofrece con su globito; el tour baja por la pantalla en los cuatro
 *     tamaños, con lo mismo de arriba en cada paso, y ademas: no cambia de
 *     vista, no abre hojas, no pide datos a la red (ni las respuestas del
 *     asistente, ni los ejercicios, ni mas piezas del 3D) y no escribe nada en
 *     lo guardado de «Su cuerpo»; al terminar la pantalla sigue abierta y
 *     arriba, queda guardado y el globito no vuelve.
 * Antes de abrir el navegador, sin el: cada texto que el modulo pide existe
 * (en GUIA_UI o en las filas de la app que cita), el nombre de «Su cuerpo» es
 * el del modulo en los diez idiomas (en el menu y en cada frase que la
 * nombra) y lo que el tour señala en esa pantalla sigue estando en
 * modulos/cuerpo.js con ese nombre.
 * Y en castellano, ademas: con movimiento (Jero vivo, el texto que se escribe
 * y la estela), la voz con una voz falsa que apunta lo que se lee (sin
 * emojis, en el idioma, y pasa sola al paso siguiente), sin el modulo (la
 * app sigue y lo dice) y, en «Su cuerpo»: por el camino de verdad (Cuenta, la
 * pestaña Cuerpo y «Abrir»), Escape cierra el tour y nada mas, «atras» cierra
 * la pantalla y el tour se va con ella, el boton es uno y se ve tambien en
 * «Aspecto» (desde ahi el tour vuelve a «Músculos»), el tema Noche, y sin el
 * modulo de la pantalla la visita lo dice.
 * Y al final, entre idiomas: ningun texto puede ser igual que el castellano
 * (en los otros nueve) ni que el ingles (en los otros ocho). tx() cae al
 * ingles si a una fila le falta el idioma: sin esta comparacion, una fila
 * sin polaco saldria en ingles y todo lo demas daria verde.
 *
 *     node tools/auditar_tour.js [puerto]            (auditar.sh levanta el servidor)
 *     node tools/auditar_tour.js [puerto] pl,de      solo esos (mas castellano e ingles,
 *                                                    que son contra los que se compara)
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const PUERTO = process.argv[2] || '8766';
const RAIZ = path.join(__dirname, '..');
const URL_APP = 'http://127.0.0.1:' + PUERTO + '/index.html';
const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
const TODOS = ((html.match(/SUPPORTED_LANGS\s*=\s*\[([^\]]*)\]/) || [, ''])[1])
  .split(',').map(x => x.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
const SOLO = (process.argv[3] || '').split(',').filter(Boolean);
/* «aparte» en lugar de los idiomas: solo lo de sin navegador y las pruebas en castellano (movimiento, voz, globitos…) */
const SOLO_APARTE = process.argv[3] === 'aparte';
const IDIOMAS = SOLO.length ? TODOS.filter(l => SOLO.includes(l) || l === 'es' || l === 'en') : TODOS;
if (!TODOS.length) { console.error('no encuentro SUPPORTED_LANGS en index.html'); process.exit(2); }
const TAMANOS = [[320, 568], [360, 640], [390, 844], [412, 915]];
/* y uno tumbado, en castellano (aparte): apaisado y bajo, el bocadillo va al lado de lo que señala */
const TUMBADO = '844×390';
const VERSION = 3;
const ROTO = /[{}]|undefined|NaN|null/;
const CONSENT = () => { try { localStorage.setItem('tgo_consent', JSON.stringify({ v: 'denied', t: Date.now() })); } catch (e) {} };

/* ── sin navegador ── */
function estatico() {
  const out = [];
  const lee = f => fs.readFileSync(path.join(RAIZ, f), 'utf8');
  const guia = lee('modulos/guia.js'), cielo = lee('modulos/cielo.js'), cuerpo = lee('modulos/cuerpo.js'), perfil = lee('modulos/perfil.js');
  const fila = (src, k) => { const m = src.match(new RegExp('"' + k + '":\\s*(\\{[^\\n]*?\\})\\s*,?\\s*\\n')); if (!m) return null; try { return JSON.parse(m[1]); } catch (e) { try { return (new Function('return ' + m[1]))(); } catch (e2) { return null; } } };
  /* (el titulo del paso de «Evolución» es el de su tarjeta, perfilEvolucion, que vive en el perfil) */
  const esta = k => [guia, html, cielo, cuerpo, perfil].some(src => new RegExp('"' + k + '":\\s*\\{').test(src));
  /* 1 · cada texto que el modulo pide */
  const motor = guia.slice(guia.indexOf('var CLAVE_APP'));
  const pide = new Set();
  for (const m of motor.matchAll(/\bT\('(\w+)'/g)) pide.add(m[1]);
  for (const m of motor.matchAll(/\b(?:titulo|fin|nt|np|t|p): '(\w+)'/g)) pide.add(m[1]);
  for (const m of motor.matchAll(/\bpes\('(\w+)'\)/g)) pide.add(m[1]);
  for (const m of motor.matchAll(/\{ k: '(guiaCap\w+)'/g)) pide.add(m[1]);
  let pasos = 0;
  let chistes = 0;
  for (const m of motor.matchAll(/\{ sel: [^\n]*?\bk: '(\w+)'([^\n]*)/g)) { pasos++; pide.add(m[1] + 'P'); if (!/\bt: '/.test(m[2])) pide.add(m[1] + 'T'); if (/\bchiste: true/.test(m[2])) { chistes++; pide.add(m[1] + 'C'); } }
  const faltan = [...pide].filter(k => !esta(k));
  if (pasos < 50) out.push('solo encuentro ' + pasos + ' pasos en modulos/guia.js: el control ya no sabe leerlos');
  if (faltan.length) out.push('textos que el modulo pide y no existen: ' + faltan.join(', '));
  /* 1b · los chistes («Algunos chistes», Jerome, 10-11-2026): que sigan ahi, y ninguno en los pasos serios */
  if (chistes < 12) out.push('solo quedan ' + chistes + ' pasos con chiste en los tres tours');
  for (const k of ['tourSos', 'tourMar', 'guiaCuComida', 'guiaCuPrivado', 'guiaCuHoy', 'guiaCuEvolucion']) if (new RegExp("k: '" + k + "'[^\\n]*chiste: true").test(motor)) out.push('el paso «' + k + '» es serio y lleva un chiste');
  /* 1c · cada cara que pide un paso (emo, emoC) es uno de los gestos que Jero sabe poner */
  const emoTxt = (guia.match(/var EMO = \{([\s\S]*?)\n  \};/) || [, ''])[1], gestos = new Set([...emoTxt.matchAll(/^\s*(\w+):\s*\{/gm)].map(m => m[1]));
  if (gestos.size < 8) out.push('solo encuentro ' + gestos.size + ' gestos en EMO: el control ya no sabe leerlos');
  const pedidos = new Set([...motor.matchAll(/\bemoC?: '(\w+)'/g)].map(m => m[1]));
  for (const g of pedidos) if (!gestos.has(g)) out.push('un paso pide la cara «' + g + '», que no existe');
  /* 1d · la mano que señala es un indice: sale del lado del pulgar (no del centro del puño), con el
     pulgar a la vista y los otros tres dedos doblados. Con un solo dedo en el centro parecia otro
     gesto (Jerome, 10-11-2026). Y nunca pasa por delante de la cara. */
  const senala = (guia.match(/'<g class="tgg-m tgg-m-senala"[\s\S]*?MUNECA \+ '<\/g>'/) || [''])[0];
  const ix = Number((guia.match(/var INDICE_X = (-?[\d.]+)/) || [])[1]);
  if (!senala) out.push('no encuentro el dibujo de la mano que señala');
  else {
    if (!/dedo\(INDICE_X, [^)]*'tgg-indice'\)/.test(senala)) out.push('la mano que señala ya no lleva su indice (tgg-indice)');
    if (!/class="tgg-pulgar"/.test(senala)) out.push('la mano que señala ya no enseña el pulgar');
    if ((senala.match(/class="tgg-doblado"/g) || []).length !== 3) out.push('la mano que señala ya no lleva tres dedos doblados');
  }
  if (!(ix <= -6)) out.push('el indice de la mano que señala esta en el centro de la mano (INDICE_X = ' + ix + '): asi parecia otro gesto');
  if (!/a1 = lado === 'i' \? Math\.min\(a1, 168\) : Math\.max\(a1, -168\)/.test(guia)) out.push('el brazo que señala ya no evita pasar por delante de la cara');
  /* 1e · de noche, la primera vez, el panel del cielo ofrece la luz roja en una barra encima de su
     cuerpo (#cielo-pista), y la visita la aparta mientras dura: si el panel le cambia el nombre, o el
     tour deja de apartarla, se dice aqui (en el navegador se mira de verdad, con el reloj de noche) */
  if (!/barra\.id = 'cielo-pista'/.test(cielo)) out.push('modulos/cielo.js ya no llama #cielo-pista a la barra que ofrece la luz roja: la visita del cielo no sabra apartarla');
  if (!/#cielo-panel\.tgg-de-visita #cielo-pista, #cielo-panel\.tgg-de-visita #cielo-brillo \{ display: none !important; \}/.test(guia)) out.push('los estilos del tour ya no apartan la barra de la luz roja ni el regulador de brillo (#cielo-panel.tgg-de-visita #cielo-pista, … #cielo-brillo)');
  if (!/html\.cielo-rojo #cielo-panel:not\(\.tgg-de-visita\) \.cielo-cab \{ flex-wrap: wrap;/.test(html)) out.push('index.html ya no pone en dos renglones la cabecera del panel del cielo con la luz roja en los moviles estrechos (o lo hace tambien durante la visita)');
  if (!/alEmpezar: function \(\) \{[^}]*classList\.add\('tgg-de-visita'\)/.test(guia) || !/alAcabar: function \(\) \{[^}]*classList\.remove\('tgg-de-visita'\)/.test(guia)) out.push('la visita del cielo ya no pone y quita la clase que aparta la barra de la luz roja (tgg-de-visita)');
  /* 2 · el nombre de «Su cuerpo» en el menu de visitas es el del modulo */
  const mio = fila(guia, 'guiaCuTitulo'), suyo = fila(cuerpo, 'cuerpoTitulo');
  if (!mio || !suyo) out.push('no encuentro guiaCuTitulo o cuerpoTitulo');
  else for (const l of TODOS) if (mio[l] !== suyo[l]) out.push('«Su cuerpo» en ' + l + ': el menu dice «' + mio[l] + '» y la pantalla «' + suyo[l] + '»');
  /* 2b · y las frases que la nombran la llaman igual: si su modulo le cambia el titulo, aqui se ve en cuales */
  let nombran = 0;
  if (mio && suyo) {
    const filas = [...guia.matchAll(/^\s*"(\w+)":\s*(\{[^\n]*\})\s*,?\s*$/gm)].map(m => { try { return [m[1], JSON.parse(m[2])]; } catch (e) { return null; } }).filter(Boolean);
    const boton = fila(html, 'cuerpoTourBtn'); if (boton) filas.push(['cuerpoTourBtn', boton]);
    for (const [k, f] of filas) {
      if (!f || typeof f.es !== 'string' || !f.es.includes('«' + suyo.es + '»')) continue;
      nombran++;
      for (const l of TODOS) if (!String(f[l] || '').includes(suyo[l])) out.push(k + ' en ' + l + ': nombra «' + suyo.es + '» y no con el titulo de su pantalla («' + suyo[l] + '»)');
    }
    if (nombran < 4) out.push('solo encuentro ' + nombran + ' frases que nombren «' + suyo.es + '»: el control ya no sabe leerlas');
  }
  /* 3 · lo que el tour señala en «Su cuerpo» sigue en su modulo, con ese nombre */
  const bloque = guia.slice(guia.indexOf('TOURS.cuerpo = {'));
  const ids = new Set();
  for (const m of guia.slice(guia.indexOf('function cuerpo()')).matchAll(/#(tgc-[\w-]+)|\$\('(tgc-[\w-]+|cuerpo-panel)'\)/g)) ids.add(m[1] || m[2]);
  const sinId = [...ids].filter(id => id !== 'cuerpo-panel' && !new RegExp('id="' + id + '"').test(cuerpo));
  if (ids.size < 20) out.push('solo encuentro ' + ids.size + ' nombres de «Su cuerpo» en el tour: el control ya no sabe leerlos');
  if (sinId.length) out.push('el tour de «Su cuerpo» señala lo que ya no esta en modulos/cuerpo.js: ' + sinId.join(', '));
  if (!/panel\.id = 'cuerpo-panel'/.test(cuerpo)) out.push('modulos/cuerpo.js ya no llama «cuerpo-panel» a su pantalla');
  for (const api of ['abierto:', 'cerrarFiesta:']) if (!cuerpo.slice(cuerpo.indexOf('window.TG_CUERPO = {')).includes(api)) out.push('TG_CUERPO ya no tiene «' + api.replace(':', '') + '», que el tour usa');
  if (!/window\.abrirCuerpo = abrirCuerpo/.test(html)) out.push('index.html ya no ofrece abrirCuerpo(), que el tour usa');
  if (!bloque.includes("vive: cuAbierto")) out.push('el tour de «Su cuerpo» ya no se cierra con su pantalla');
  return { fallos: out, textos: pide.size, pasos, ids: ids.size, nombran, chistes, gestos: gestos.size };
}

/* lo que el paso enseña, leido de la pagina */
const LEER = () => {
  const r = document.getElementById('v19-tour');
  const card = r.querySelector('.v19t-card'), hole = r.querySelector('.v19t-hole'), jero = r.querySelector('.tgg-unidad > .tgg-jero');
  const rc = n => { const q = n.getBoundingClientRect(); return { left: q.left, top: q.top, right: q.right, bottom: q.bottom, width: q.width, height: q.height }; };
  hole.style.transition = 'none'; void hole.offsetWidth;
  const hr = rc(hole);
  hole.style.transition = '';
  const sinHueco = hole.classList.contains('none');
  const sale = [...card.querySelectorAll('h3, p, button, .tgg-cab, .tgg-cap')]
    .filter(e => e.offsetParent && e.scrollWidth > e.clientWidth + 1).map(e => e.className || e.tagName);
  const txt = s => (card.querySelector(s) || {}).textContent || '';
  const ve = b => b.offsetParent && getComputedStyle(b).visibility !== 'hidden' && getComputedStyle(b).display !== 'none';
  const pie = [...card.querySelectorAll('.v19t-foot button')].filter(ve);
  /* un boton partido en dos lineas: sus trozos de texto caen a alturas distintas */
  const partidos = pie.filter(b => {
    const rg = document.createRange(); rg.selectNodeContents(b);
    return new Set([...rg.getClientRects()].map(x => Math.round(x.top))).size > 1; }).map(b => b.textContent);
  const nv = card.querySelector('.v19t-nuevo');
  return {
    titulo: txt('h3'), cuerpo: txt('.tgg-texto'), num: txt('.v19t-num'), sr: txt('.tgg-sr'),
    chiste: (c => c && getComputedStyle(c).display !== 'none' ? c.textContent : '')(card.querySelector('.tgg-chiste')),
    nuevo: nv && ve(nv) ? nv.textContent : '', botones: pie.map(b => b.textContent),
    saltar: (card.querySelector('.v19t-skip') || { getAttribute() { return ''; } }).getAttribute('aria-label') || '',
    tarjeta: rc(card), jero: jero && getComputedStyle(jero).display !== 'none' ? rc(jero) : null,
    hueco: sinHueco ? null : hr, fantasma: sinHueco && hr.width > 1, sale, partidos,
    pisa: r.getAttribute('data-pisa') === '1', nivel: +r.getAttribute('data-jero') || 0,
    estado: window.TG_GUIA.estado(), vw: innerWidth, vh: innerHeight
  };
};

const corta = (a, b) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > 0.5 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 0.5;
const dentro = (t, d) => t.left >= -1 && t.top >= -1 && t.right <= d.vw + 1 && t.bottom <= d.vh + 1;
const cuad = t => [t.left, t.top, t.right, t.bottom].map(Math.round).join(',');

function problemasDelPaso(donde, i, d, S, tam) {
  const out = [], ultimo = i === S - 1;
  const todo = [d.titulo, d.cuerpo, d.chiste, d.nuevo, d.saltar].concat(d.botones).join(' ¦ ');
  if (!d.titulo.trim() || !d.cuerpo.trim()) out.push(donde + ': texto vacio');
  if (ROTO.test(todo)) out.push(donde + ': texto roto «' + todo.slice(0, 90) + '»');
  if (d.num !== (i + 1) + '/' + S) out.push(donde + ': contador «' + d.num + '»');
  if (!d.sr.includes(d.titulo) || !d.sr.includes(d.cuerpo) || !d.sr.includes(d.chiste)) out.push(donde + ': el lector de pantalla no recibe el paso entero');
  /* un paso con chiste lo cuenta con otra cara */
  if (d.chiste && (!d.estado.jero || d.estado.jero.emocion === 'contento')) out.push(donde + ': el chiste se cuenta con la cara de siempre');
  if (!dentro(d.tarjeta, d)) out.push(donde + ': el bocadillo se sale de la pantalla (' + cuad(d.tarjeta) + ' en ' + d.vw + '×' + d.vh + ')');
  if (!d.jero) out.push(donde + ': Jero no esta');
  if (d.jero && !dentro(d.jero, d)) out.push(donde + ': Jero se sale de la pantalla (' + cuad(d.jero) + ' en ' + d.vw + '×' + d.vh + ')');
  if (d.sale.length) out.push(donde + ': se sale el texto de ' + d.sale.join(', '));
  if (d.partidos.length) out.push(donde + ': boton partido en dos lineas: ' + d.partidos.join(', '));
  if (d.fantasma) out.push(donde + ': queda abierto el hueco del paso anterior, sin oscurecer');
  if (!d.saltar.trim()) out.push(donde + ': el boton de saltar no tiene nombre');
  if (d.botones.some(x => !x.trim())) out.push(donde + ': hay un boton sin texto');
  if (ultimo) {
    if (d.hueco) out.push(donde + ': el ultimo paso señala algo');
    return out;
  }
  if (!d.hueco) { out.push(donde + ': lo que se señala no esta en pantalla (foco en el centro)'); return out; }
  if (d.pisa || corta(d.tarjeta, d.hueco)) out.push(donde + ': el bocadillo tapa lo que señala');
  if (d.jero && corta(d.jero, d.hueco)) out.push(donde + ': Jero tapa lo que señala');
  if (d.hueco.height < 40 || d.hueco.width < 40) out.push(donde + ': el foco es demasiado pequeño (' + Math.round(d.hueco.width) + '×' + Math.round(d.hueco.height) + ')');
  if (d.nivel === 3) { if (tam !== '320×568' && tam !== '360×640' && tam !== TUMBADO) out.push(donde + ': Jero no cabe entero y sale en miniatura (solo se admite en los dos moviles pequeños y con el movil tumbado)'); }
  else {
    /* un boton se señala con el indice; algo grande, con la mano abierta de presentador */
    const j = d.estado.jero, apunta = m => m === 'senala' || m === 'palma', lado = j && (apunta(j.mano.i) ? 'i' : apunta(j.mano.d) ? 'd' : null);
    const grande = d.hueco.width > Math.min(d.vw * 0.62, 300) && d.hueco.height > 64;
    if (!lado) out.push(donde + ': Jero no señala');
    else {
      if (j.dentro[lado]) out.push(donde + ': el brazo que señala no sale del aro');
      if (j.mano[lado] !== (grande ? 'palma' : 'senala')) out.push(donde + ': señala con «' + j.mano[lado] + '» algo de ' + Math.round(d.hueco.width) + '×' + Math.round(d.hueco.height) + ' (el indice es para los botones; la mano abierta, para lo grande)');
    }
  }
  return out;
}

/* Un boton que no se puede pulsar (fuera de la pantalla, tapado) es un FALLO
   del tour, no del control: se apunta y se sigue. */
async function pulsa(p, sel) { try { await p.click(sel, { timeout: 4000 }); return true; } catch (e) { return false; } }
const listo = (p, ms) => p.waitForFunction(() => { const t = document.getElementById('v19-tour'); return t && t.getAttribute('data-listo') === '1'; }, null, { timeout: ms || 6000 }).then(() => true, () => false);
/* en miniatura Jero tapa la esquina del bocadillo a proposito: lo que no puede es tapar lo que se señala */
const textoPaso = d => [d.titulo, d.cuerpo, d.chiste, d.nuevo].filter(Boolean).concat(d.botones).join(' ¦ ');

async function entra(b, L, opc) {
  opc = opc || {};
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block', reducedMotion: opc.movimiento ? 'no-preference' : 'reduce',
                                   locale: 'es-ES', timezoneId: 'Atlantic/Canary' });
  if (opc.antes) await ctx.addInitScript(opc.antes, opc.dato);
  await ctx.addInitScript(CONSENT);
  if (opc.sinModulo) await ctx.route('**/modulos/guia.js', r => r.abort());
  if (opc.sinCuerpo) await ctx.route('**/modulos/cuerpo.js', r => r.abort());
  const p = await ctx.newPage();
  const err = []; p.on('pageerror', e => err.push(e.message));
  await p.goto(URL_APP, { waitUntil: 'networkidle' });
  await p.waitForTimeout(500);
  await p.click('.v19-w-lang[data-lang="' + L + '"]'); await p.waitForTimeout(250);
  await p.click('#v19-welcome-start');
  return { ctx, p, err };
}

/* la cabecera del panel del cielo: lo que se ve en ella, lo que se pisa y lo que se sale (el titulo, por su texto) */
const MEDIR_CABECERA = () => {
  const c = document.querySelector('#cielo-panel .cielo-cab'), cr = c.getBoundingClientRect();
  const hijos = [...c.children].filter(e => !e.hidden && getComputedStyle(e).display !== 'none').map(e => {
    let r = e.getBoundingClientRect();
    if (e.classList.contains('cielo-titulo')) { const g = document.createRange(); g.selectNodeContents(e); r = g.getBoundingClientRect(); }
    return { n: e.id || e.className, l: r.left, t: r.top, r: r.right, b: r.bottom }; });
  const pisa = [];
  for (let i = 0; i < hijos.length; i++) for (let j = i + 1; j < hijos.length; j++) { const a = hijos[i], z = hijos[j];
    if (Math.min(a.r, z.r) - Math.max(a.l, z.l) > 1 && Math.min(a.b, z.b) - Math.max(a.t, z.t) > 1) pisa.push(a.n + ' y ' + z.n); }
  return { pisa, fuera: hijos.filter(h => h.r > cr.right + 0.5 || h.l < cr.left - 0.5).map(h => h.n), n: hijos.length, regulador: hijos.some(h => h.n === 'cielo-brillo') };
};

/* recorre el tour abierto, de principio a fin, y devuelve lo de cada paso */
async function recorre(p, L, nombre, tam, fallos, extra) {
  const pasos = [];
  const S = await p.evaluate(() => window.TG_GUIA.estado().pasos);
  for (let i = 0; i < S; i++) {
    if (!(await listo(p))) { fallos.push(L + ' ' + nombre + ' ' + tam + ' paso ' + (i + 1) + ': no termina de colocarse'); break; }
    if (extra && extra.espera) { await p.waitForTimeout(extra.espera); await listo(p); }
    const d = await p.evaluate(LEER);
    pasos.push(d);
    fallos.push(...problemasDelPaso(L + ' ' + nombre + ' ' + tam + ' paso ' + (i + 1) + ' (' + d.estado.paso + ')', i, d, S, tam));
    if (extra && extra.enPaso) await extra.enPaso(d, i, S);
    if (i < S - 1 && !(await pulsa(p, '#v19-tour .v19t-next'))) {
      fallos.push(L + ' ' + nombre + ' ' + tam + ' paso ' + (i + 1) + ': no se puede pulsar «Siguiente» (fuera de la pantalla o tapado)'); break;
    }
  }
  return { S, pasos };
}

async function idioma(b, L) {
  const fallos = [], textos = {}, sinJero = {};
  let menuN = [];
  /* ── 1 · alguien nuevo: la pregunta y el tour de la app ── */
  const { ctx, p, err } = await entra(b, L);
  try { await p.waitForSelector('.v19t-prompt', { timeout: 8000 }); }
  catch (e) { fallos.push(L + ': no sale la pregunta del tour al entrar'); await ctx.close(); return { fallos, textos, sinJero }; }
  const cifras = await p.evaluate(() => ({ n: places.length, L: nIdiomasListos(), C: window.TGO_MAR.costas.length }));
  const preg = await p.evaluate(() => { const c = document.querySelector('.v19t-prompt');
    return { t: c.querySelector('h3').textContent, c: c.querySelector('p').textContent, botones: [...c.querySelectorAll('button')].map(x => x.textContent),
             nuevo: !!c.querySelector('.v19t-nuevo'), jero: !!c.querySelector('.tgg-jero svg'), cabe: (() => { const q = c.querySelector('.v19t-card').getBoundingClientRect(); return q.left >= 0 && q.right <= innerWidth && q.bottom <= innerHeight; })() }; });
  textos['pregunta'] = preg.t + ' ¦ ' + preg.c + ' ¦ ' + preg.botones.join(' ¦ ');
  if (preg.nuevo) fallos.push(L + ': alguien nuevo ve la etiqueta de novedades');
  if (!preg.jero) fallos.push(L + ': la pregunta sale sin Jero');
  if (!preg.cabe) fallos.push(L + ': la pregunta no cabe en la pantalla');
  if (ROTO.test(textos['pregunta'])) fallos.push(L + ': pregunta rota «' + textos['pregunta'].slice(0, 90) + '»');
  if (preg.botones.length !== 2 || preg.botones.some(x => !x.trim())) fallos.push(L + ': la pregunta tiene que llevar sus dos botones, con texto («' + preg.botones.join('», «') + '»)');
  const Sdicho = +((preg.c.match(/\d+/) || [])[0] || 0);
  await p.click('.v19t-prompt .v19t-next');
  if (!(await p.waitForSelector('#v19-tour.open', { timeout: 6000 }).then(() => true, () => false))) { fallos.push(L + ': «Ver el tour» no lo abre'); await ctx.close(); return { fallos, textos, sinJero }; }
  for (const [w, h] of TAMANOS) {
    const tam = w + '×' + h;
    await p.setViewportSize({ width: w, height: h });
    await p.evaluate(() => window.v19StartTour());
    await p.waitForSelector('#v19-tour.open', { timeout: 6000 }).catch(() => {});
    const { S, pasos } = await recorre(p, L, 'app', tam, fallos);
    if (S < 20) fallos.push(L + ' ' + tam + ': el tour de la app tiene ' + S + ' pasos');
    sinJero[tam] = pasos.filter(d => d.nivel === 3).length;
    if (w === 390) {
      if (Sdicho !== S) fallos.push(L + ': la pregunta dice ' + Sdicho + ' pasos y el tour tiene ' + S);
      pasos.forEach((d, i) => { textos['app ' + d.estado.paso] = textoPaso(d); });
      const cuerpos = pasos.map(d => d.cuerpo).join(' ');
      if (!pasos[0] || !pasos[0].cuerpo.includes(String(cifras.n))) fallos.push(L + ' paso 1: no dice los ' + cifras.n + ' lugares');
      if (!cuerpos.includes(String(cifras.L))) fallos.push(L + ': ningun paso dice los ' + cifras.L + ' idiomas');
      if (!cuerpos.includes(String(cifras.C))) fallos.push(L + ': ningun paso dice las ' + cifras.C + ' costas');
      const caps = new Set(pasos.map(d => d.estado.paso)).size;
      if (caps !== S) fallos.push(L + ': hay pasos repetidos');
    }
    // el ultimo «Siguiente» cierra y guarda la version
    if (!(await pulsa(p, '#v19-tour.open .v19t-next'))) { fallos.push(L + ' ' + tam + ': no se puede pulsar el ultimo boton del tour de la app (fuera de la pantalla o tapado)'); await p.evaluate(() => window.TG_GUIA.cerrar()); continue; }
    const fin = await p.evaluate(() => ({ g: localStorage.getItem('tenerife.tour.seen'), abierto: window.TG_GUIA.estado().abierto, rutas: routePanelOpen }));
    if (!(Number(fin.g) >= VERSION)) fallos.push(L + ' ' + tam + ': al terminar se guarda «' + fin.g + '»');
    if (fin.abierto) fallos.push(L + ' ' + tam + ': el tour no se cierra al terminar');
    if (fin.rutas) fallos.push(L + ' ' + tam + ': al terminar el tour se queda abierto el panel de rutas');
  }
  await p.setViewportSize({ width: 390, height: 844 });
  /* saltar el tour con el panel de rutas abierto por el: tiene que cerrarse */
  {
    await p.evaluate(() => window.v19StartTour());
    let llego = false, pestana = '';
    for (let i = 0; i < 40 && !llego; i++) {
      await listo(p);
      llego = await p.evaluate(() => routePanelOpen);
      if (llego) pestana = await p.evaluate(() => (document.querySelector('.route-tab.active') || {}).id);
      else if (!(await pulsa(p, '#v19-tour .v19t-next'))) break;
    }
    if (!llego) fallos.push(L + ': ningun paso abre el panel de rutas');
    else {
      if (pestana !== 'tab-planner') fallos.push(L + ': el primer paso de rutas abre la pestaña «' + pestana + '»');
      await pulsa(p, '#v19-tour .v19t-skip');
      if (await p.evaluate(() => routePanelOpen)) fallos.push(L + ': al saltar el tour se queda abierto el panel de rutas');
      if (await p.evaluate(() => window.TG_GUIA.estado().abierto)) fallos.push(L + ': «saltar» no cierra el tour');
    }
  }
  /* ── 2 · el menu de visitas, desde la leyenda ── */
  {
    await p.click('#map-legend-toggle').catch(() => {});
    await p.click('#leg-tour').catch(() => fallos.push(L + ': no se puede pulsar «Ver el tour» en la leyenda'));
    const sale = await p.waitForSelector('.tgg-menu', { timeout: 6000 }).then(() => true, () => false);
    if (!sale) fallos.push(L + ': «Ver el tour» no abre el menu de visitas');
    else {
      const m = await p.evaluate(() => { const c = document.querySelector('.tgg-menu');
        return { t: c.querySelector('h3').textContent, p: c.querySelector('p').textContent, ops: [...c.querySelectorAll('.tgg-op')].map(x => x.innerText.replace(/\s+/g, ' ').trim()),
                 chips: [...c.querySelectorAll('.tgg-chip')].map(x => x.textContent), cerrar: c.querySelector('.v19t-ghost').textContent,
                 leyenda: document.getElementById('map-legend').classList.contains('hidden') }; });
      textos['menu'] = [m.t, m.p].concat(m.ops, m.chips, [m.cerrar]).join(' ¦ ');
      if (ROTO.test(textos['menu'])) fallos.push(L + ': menu roto «' + textos['menu'].slice(0, 90) + '»');
      if (m.ops.length !== 3) fallos.push(L + ': el menu ofrece ' + m.ops.length + ' visitas (se esperan la app, el cielo y «Su cuerpo»)');
      if (!m.cerrar.trim()) fallos.push(L + ': el boton de cerrar el menu sale sin texto');
      menuN = m.ops.map(x => +((x.match(/\d+/) || [])[0] || 0));
      if (m.chips.length !== 5) fallos.push(L + ': el menu enseña ' + m.chips.length + ' capitulos de la app (son cinco)');
      if (!m.leyenda) fallos.push(L + ': la leyenda se queda abierta debajo del menu');
      /* en el movil mas pequeño, con tres visitas y cinco capitulos, el menu tiene que verse entero o poder
         recorrerse entero: ni la cabeza de Jero cortada por arriba ni el boton de cerrar fuera de la pantalla */
      await p.evaluate(() => window.TG_GUIA.cerrar());
      await p.setViewportSize({ width: 320, height: 568 });
      await p.evaluate(() => window.v19TourMenu());
      await p.waitForSelector('.tgg-menu', { timeout: 6000 }).catch(() => {});
      const peq = await p.evaluate(() => { const c = document.querySelector('.tgg-menu'); if (!c) return null;
        const j = c.querySelector('.tgg-jero'), k = c.querySelector('.v19t-card'), g = c.querySelector('.v19t-ghost');
        c.scrollTop = 0; const arriba = Math.min(j.getBoundingClientRect().top, k.getBoundingClientRect().top);
        c.scrollTop = 1e6; const abajo = g.getBoundingClientRect().bottom, q = k.getBoundingClientRect(); c.scrollTop = 0;
        return { arriba, abajo, izq: q.left, der: q.right, H: innerHeight, W: innerWidth }; });
      if (!peq) fallos.push(L + ': en 320×568 no sale el menu de visitas');
      else if (peq.arriba < -1 || peq.abajo > peq.H + 1 || peq.izq < -1 || peq.der > peq.W + 1)
        fallos.push(L + ': en 320×568 el menu de visitas no se ve entero, ni desplazandolo (arriba ' + Math.round(peq.arriba) + ', abajo ' + Math.round(peq.abajo) + ' de ' + peq.H + ')');
      await p.evaluate(() => window.TG_GUIA.cerrar());
      await p.setViewportSize({ width: 390, height: 844 });
      /* al cambiar de tamaño el mapa recoloca sus marcadores: hasta que acaba, el paso de los marcadores puede no contarse */
      await p.waitForTimeout(600);
      await p.evaluate(() => window.v19TourMenu());
      await p.waitForSelector('.tgg-menu', { timeout: 6000 }).catch(() => {});
      menuN[0] = await p.evaluate(() => { const o = document.querySelector('.tgg-menu .tgg-op'); return o ? +((o.innerText.match(/\d+/) || [])[0] || 0) : 0; });
      await p.click('.tgg-menu .tgg-chip:nth-child(3)');
      await p.waitForSelector('#v19-tour.open', { timeout: 6000 }).catch(() => {});
      await listo(p);
      const e = await p.evaluate(() => window.TG_GUIA.estado());
      if (e.paso !== 'tourGuaguas') fallos.push(L + ': el tercer capitulo empieza en «' + e.paso + '» y no en las guaguas');
      /* los pasos de la app dependen de lo que hay en pantalla (un marcador a la vista, el «ⓘ»): el menu y el tour que abre se cuentan en el mismo momento */
      if (menuN[0] !== e.pasos) fallos.push(L + ': el menu dice ' + menuN[0] + ' pasos para la app y el tour que abre tiene ' + e.pasos);
      await pulsa(p, '#v19-tour .v19t-skip');
    }
  }
  if (err.length) fallos.push(L + ': errores de pagina: ' + err.slice(0, 3).join(' | '));
  await ctx.close();

  /* ── 3 · quien vio un tour anterior: novedades, con la etiqueta, en su idioma ── */
  for (const antes of ['1', '2']) {
    const v = await entra(b, L, { antes: g => { try { localStorage.setItem('tenerife.tour.seen', g); } catch (e) {} }, dato: antes });
    try {
      await v.p.waitForSelector('.v19t-prompt', { timeout: 8000 });
      const nov = await v.p.evaluate(() => { const c = document.querySelector('.v19t-prompt');
        return { t: c.querySelector('h3').textContent, c: c.querySelector('p').textContent, nuevo: (c.querySelector('.v19t-nuevo') || {}).textContent || '' }; });
      textos['novedades'] = nov.t + ' ¦ ' + nov.c + ' ¦ ' + nov.nuevo;
      if (ROTO.test(textos['novedades'])) fallos.push(L + ': novedades rotas «' + textos['novedades'].slice(0, 90) + '»');
      if (!nov.nuevo) fallos.push(L + ': las novedades salen sin la etiqueta (guardado «' + antes + '»)');
      if (nov.t === preg.t) fallos.push(L + ': quien vio el tour «' + antes + '» ve la misma pregunta que alguien nuevo');
      await v.p.click('.v19t-prompt .v19t-ghost');
      const g = await v.p.evaluate(() => localStorage.getItem('tenerife.tour.seen'));
      if (Number(g) !== VERSION) fallos.push(L + ': «Ahora no» guarda «' + g + '»');
    } catch (e) { fallos.push(L + ': quien vio el tour «' + antes + '» no ve las novedades'); }
    await v.ctx.close();
  }

  /* ── 4 · el tour del cielo ── */
  {
    const c = await entra(b, L, { antes: g => { try { localStorage.setItem('tenerife.tour.seen', g); } catch (e) {} }, dato: String(VERSION) });
    const q = c.p;
    await q.waitForTimeout(900);
    if (await q.$('.v19t-prompt')) fallos.push(L + ': quien ya vio el tour de la app vuelve a ver la pregunta');
    /* DE NOCHE. La primera vez que se abre de noche, el panel ofrece la luz roja en una barra encima de
       su cuerpo (#cielo-pista, unos 80 px). Le quitaba el sitio a la visita justo cuando mas se va a
       ver: en 320×568 el bocadillo tapaba lo que señalaba, y este control pasaba de dia y no de noche
       (10-11-2026, al pasar la auditoria entera a las 21 h). El reloj de la pagina se pone a las 23:30
       UTC de hoy (en Tenerife el Sol esta mas de 6° bajo el horizonte a esa hora todo el año), asi la
       barra esta siempre; y se mira que la visita la aparte mientras dura y la devuelva al acabar. */
    const noche = new Date(); noche.setUTCHours(23, 30, 0, 0);
    await q.clock.setFixedTime(noche);
    const barra = () => q.evaluate(() => { const x = document.getElementById('cielo-pista'); if (!x) return null;
      return { ve: x.getBoundingClientRect().height > 0 && getComputedStyle(x).display !== 'none', dada: localStorage.getItem('tgo_cielo_rojo_pista') }; });
    await q.click('#cielo-btn');
    const cargo = await q.waitForFunction(() => window.TG_CIELO && window.TG_CIELO.estado && window.TG_CIELO.estado.datos, null, { timeout: 30000 }).then(() => true, () => false);
    if (!cargo) fallos.push(L + ': el panel del cielo no carga');
    else {
      const pista = await q.waitForSelector('.tgg-pista', { timeout: 8000 }).then(n => n.textContent(), () => null);
      if (!pista) fallos.push(L + ': Jero no se ofrece la primera vez que se abre el panel del cielo');
      else { textos['pista'] = pista; if (ROTO.test(pista)) fallos.push(L + ': pista rota «' + pista + '»'); }
      const nombre = await q.evaluate(() => document.getElementById('cielo-tour-btn').getAttribute('aria-label'));
      textos['boton del cielo'] = nombre || '';
      const b0 = await q.waitForSelector('#cielo-pista', { timeout: 6000 }).then(() => barra(), () => null);
      if (!b0 || !b0.ve) fallos.push(L + ': de noche (reloj de la pagina a las 23:30 UTC) el panel del cielo no ofrece la luz roja (#cielo-pista): no se puede mirar que la visita la aparte');
      for (const [w, h] of TAMANOS) {
        const tam = w + '×' + h;
        await q.setViewportSize({ width: w, height: h });
        if (w === TAMANOS[0][0]) { if (!(await pulsa(q, '#cielo-tour-btn'))) { fallos.push(L + ': no se puede pulsar el boton de Jero del panel del cielo'); break; } }
        else await q.evaluate(() => window.v19TourCielo());
        if (!(await q.waitForSelector('#v19-tour.open', { timeout: 15000 }).then(() => true, () => false))) { fallos.push(L + ' ' + tam + ': el tour del cielo no se abre'); break; }
        const b1 = await barra();
        if (b1 && b1.ve) fallos.push(L + ' ' + tam + ': la visita del cielo no aparta la barra de la luz roja (#cielo-pista)');
        let rojoEnSuPaso = null, rojoFuera = false;
        const { S, pasos } = await recorre(q, L, 'cielo', tam, fallos, { espera: 420, enPaso: async d => {
          const rojo = await q.evaluate(() => document.documentElement.classList.contains('cielo-rojo'));
          if (d.estado.paso === 'guiaCiRoja') rojoEnSuPaso = rojo; else if (rojo) rojoFuera = true;
          /* Durante la visita, con la luz encendida por su paso, la cabecera es la de siempre: el regulador
             de brillo, que no se puede tocar con la visita encima, se aparta (si no, en un movil estrecho
             la cabecera va en dos renglones y le quita el sitio a la visita). Y nada pisa a nada. */
          if (d.estado.paso === 'guiaCiRoja' && rojo) {
            const cab = await q.evaluate(MEDIR_CABECERA);
            if (cab.regulador) fallos.push(L + ' ' + tam + ': durante la visita del cielo, con la luz roja, el regulador de brillo sigue en la cabecera');
            if (cab.pisa.length) fallos.push(L + ' ' + tam + ': en el paso de la luz roja, en la cabecera del panel del cielo se pisan ' + cab.pisa.join('; '));
            if (cab.fuera.length) fallos.push(L + ' ' + tam + ': en el paso de la luz roja, se sale de la cabecera del panel del cielo ' + cab.fuera.join(', '));
          }
        } });
        if (S < 10) fallos.push(L + ' ' + tam + ': el tour del cielo tiene ' + S + ' pasos');
        sinJero['cielo ' + tam] = pasos.filter(d => d.nivel === 3).length;
        if (rojoEnSuPaso === false) fallos.push(L + ' ' + tam + ': en el paso de la luz roja no se enciende');
        if (rojoFuera) fallos.push(L + ' ' + tam + ': la luz roja se queda encendida fuera de su paso');
        if (w === 390) {
          if (menuN.length > 1 && menuN[1] !== S) fallos.push(L + ': el menu dice ' + menuN[1] + ' pasos para el cielo y el tour tiene ' + S);
          pasos.forEach(d => { textos['cielo ' + d.estado.paso] = textoPaso(d); });
          const pest = new Set(pasos.map(d => d.estado.paso)).size;
          if (pest !== S) fallos.push(L + ': el tour del cielo repite pasos');
        }
        if (!(await pulsa(q, '#v19-tour.open .v19t-next'))) { fallos.push(L + ' ' + tam + ': no se puede pulsar el ultimo boton del tour del cielo (fuera de la pantalla o tapado)'); await q.evaluate(() => window.TG_GUIA.cerrar()); continue; }
        const fin = await q.evaluate(() => ({ g: localStorage.getItem('tenerife.tour.cielo'), app: localStorage.getItem('tenerife.tour.seen'), abierto: window.TG_GUIA.estado().abierto,
          panel: document.getElementById('cielo-panel').style.display === 'flex', rojo: document.documentElement.classList.contains('cielo-rojo'), pes: window.TG_CIELO.estado.pestana }));
        if (fin.g !== '1') fallos.push(L + ' ' + tam + ': al terminar el tour del cielo se guarda «' + fin.g + '»');
        if (Number(fin.app) !== VERSION) fallos.push(L + ' ' + tam + ': el tour del cielo cambia lo guardado del de la app («' + fin.app + '»)');
        if (fin.abierto) fallos.push(L + ' ' + tam + ': el tour del cielo no se cierra al terminar');
        if (!fin.panel) fallos.push(L + ' ' + tam + ': al terminar el tour del cielo se cierra el panel');
        if (fin.rojo) fallos.push(L + ' ' + tam + ': al terminar el tour del cielo se queda la luz roja');
        const b2 = await barra();
        if (b0 && b0.ve && (!b2 || !b2.ve)) fallos.push(L + ' ' + tam + ': al terminar el tour del cielo no vuelve la barra de la luz roja');
        /* Y FUERA DE LA VISITA, con la luz roja puesta: la cabecera lleva tambien el regulador de brillo, y
           con el boton de Jero ya no cabia en un renglon en un movil estrecho: el boton pisaba el titulo (a
           320 px en cuatro idiomas; en bulgaro, hasta 381). Por debajo de 390 px va en dos renglones
           (index.html). Que esten los cinco, que nada pise a nada y que nada se salga. */
        if (!fin.abierto && !fin.rojo && !(await pulsa(q, '#cielo-rojo'))) fallos.push(L + ' ' + tam + ': al acabar la visita del cielo no se puede tocar «Luz roja»');
        else if (!fin.abierto && !fin.rojo) {
          await q.waitForTimeout(250);
          const cab = await q.evaluate(MEDIR_CABECERA);
          if (cab.n !== 5 || !cab.regulador) fallos.push(L + ' ' + tam + ': con la luz roja, la cabecera del panel del cielo lleva ' + cab.n + ' cosas (se esperan el titulo, Jero, «Luz roja», el regulador y la ✕)');
          if (cab.pisa.length) fallos.push(L + ' ' + tam + ': con la luz roja, en la cabecera del panel del cielo se pisan ' + cab.pisa.join('; '));
          if (cab.fuera.length) fallos.push(L + ' ' + tam + ': con la luz roja, se sale de la cabecera del panel del cielo ' + cab.fuera.join(', '));
          await pulsa(q, '#cielo-rojo'); await q.waitForTimeout(150);
          if (await q.evaluate(() => document.documentElement.classList.contains('cielo-rojo'))) fallos.push(L + ' ' + tam + ': la luz roja no se apaga al volver a tocar su boton');
        }
        if (b2 && b2.dada !== null) fallos.push(L + ' ' + tam + ': el tour del cielo da por vista la barra de la luz roja (guarda «' + b2.dada + '»)');
      }
      await q.setViewportSize({ width: 390, height: 844 });
      /* visto el tour, el globito no vuelve */
      await q.click('#cielo-cerrar').catch(() => {});
      await q.click('#cielo-btn').catch(() => {});
      await q.waitForTimeout(1900);
      if (await q.$('.tgg-pista')) fallos.push(L + ': Jero se vuelve a ofrecer en el panel del cielo despues de ver su tour');
    }
    if (c.err.length) fallos.push(L + ': errores de pagina en el tour del cielo: ' + c.err.slice(0, 3).join(' | '));
    await c.ctx.close();
  }

  /* ── 5 · el tour de «Su cuerpo» ── */
  {
    const c = await entra(b, L, { antes: g => { try { localStorage.setItem('tenerife.tour.seen', g); } catch (e) {} }, dato: String(VERSION) });
    const q = c.p;
    const pedidos = []; q.on('request', r => { const u = r.url(); if (/\/datos\/cuerpo|\/modulos\//.test(u)) pedidos.push(u.replace(/^.*?:\d+\//, '')); });
    await q.waitForTimeout(700);
    await q.evaluate(() => window.abrirCuerpo());
    const abre = await q.waitForFunction(() => window.TG_CUERPO && window.TG_CUERPO.abierto() && !!document.getElementById('cuerpo-tour-btn'), null, { timeout: 30000 }).then(() => true, () => false);
    if (!abre) fallos.push(L + ': «Su cuerpo» no se abre, o se abre sin el boton de Jero');
    else {
      const pista = await q.waitForSelector('.tgg-pista', { timeout: 9000 }).then(n => n.textContent(), () => null);
      if (!pista) fallos.push(L + ': Jero no se ofrece la primera vez que se abre «Su cuerpo»');
      else { textos['pista del cuerpo'] = pista; if (ROTO.test(pista)) fallos.push(L + ': pista rota «' + pista + '»'); }
      const bot = await q.evaluate(() => { const x = document.getElementById('cuerpo-tour-btn'), r = x.getBoundingClientRect(), e = document.getElementById('tgc-escena').getBoundingClientRect(), g = document.getElementById('tgc-girar').getBoundingClientRect();
        return { nombre: x.getAttribute('aria-label') || '', dentro: r.left >= e.left && r.right <= e.right && r.top >= e.top && r.bottom <= e.bottom && r.width >= 40, pisaGirar: Math.min(r.right, g.right) - Math.max(r.left, g.left) > 0 && Math.min(r.bottom, g.bottom) - Math.max(r.top, g.top) > 0 }; });
      textos['boton del cuerpo'] = bot.nombre;
      if (!bot.nombre.trim()) fallos.push(L + ': el boton de Jero de «Su cuerpo» no tiene nombre');
      if (!bot.dentro) fallos.push(L + ': el boton de Jero no queda dentro de la escena de «Su cuerpo»');
      if (bot.pisaGirar) fallos.push(L + ': el boton de Jero pisa «Girar»');
      const guardado = () => q.evaluate(() => ({ datos: localStorage.getItem('tenerife.cuerpo'), tema: localStorage.getItem('tenerife.cuerpo.tema') }));
      const antes = await guardado();
      for (const [w, h] of TAMANOS) {
        const tam = w + '×' + h;
        await q.setViewportSize({ width: w, height: h });
        await q.waitForTimeout(250);
        if (w === TAMANOS[0][0]) { if (!(await pulsa(q, '#cuerpo-tour-btn'))) { fallos.push(L + ': no se puede pulsar el boton de Jero de «Su cuerpo»'); break; } }
        else await q.evaluate(() => window.v19TourCuerpo());
        if (!(await q.waitForSelector('#v19-tour.open', { timeout: 15000 }).then(() => true, () => false))) { fallos.push(L + ' ' + tam + ': el tour de «Su cuerpo» no se abre'); break; }
        const desde = pedidos.length;
        let otraVista = false, hoja = false, cerrada = false;
        const { S, pasos } = await recorre(q, L, 'cuerpo', tam, fallos, { espera: 420, enPaso: async () => {
          const e = await q.evaluate(() => ({ m: document.getElementById('tgc-modo-m').getAttribute('aria-pressed'), velo: !document.getElementById('tgc-velo').hidden, fiesta: !document.getElementById('tgc-fiesta').hidden, abierta: window.TG_CUERPO.abierto() }));
          if (e.m !== 'true') otraVista = true; if (e.velo || e.fiesta) hoja = true; if (!e.abierta) cerrada = true;
        } });
        if (S < 12) fallos.push(L + ' ' + tam + ': el tour de «Su cuerpo» tiene ' + S + ' pasos');
        sinJero['cuerpo ' + tam] = pasos.filter(d => d.nivel === 3).length;
        if (otraVista) fallos.push(L + ' ' + tam + ': el tour de «Su cuerpo» cambia de vista (entrar en «Aspecto» o en «Preguntar» pide datos a la red)');
        if (hoja) fallos.push(L + ' ' + tam + ': el tour de «Su cuerpo» abre una hoja o deja una celebracion encima');
        if (cerrada) fallos.push(L + ' ' + tam + ': «Su cuerpo» se cierra a media visita');
        const pidio = pedidos.slice(desde).filter(u => /datos\/cuerpo/.test(u));
        if (pidio.length) fallos.push(L + ' ' + tam + ': el tour de «Su cuerpo» pide datos a la red: ' + pidio.slice(0, 3).join(', '));
        if (w === 390) {
          if (menuN.length > 2 && menuN[2] !== S) fallos.push(L + ': el menu dice ' + menuN[2] + ' pasos para «Su cuerpo» y el tour tiene ' + S);
          pasos.forEach(d => { textos['cuerpo ' + d.estado.paso] = textoPaso(d); });
          if (new Set(pasos.map(d => d.estado.paso)).size !== S) fallos.push(L + ': el tour de «Su cuerpo» repite pasos');
          if (!pasos[0] || !pasos[0].cuerpo.includes(String(S))) fallos.push(L + ': el primer paso de «Su cuerpo» no dice sus ' + S + ' pasos');
        }
        if (!(await pulsa(q, '#v19-tour.open .v19t-next'))) { fallos.push(L + ' ' + tam + ': no se puede pulsar el ultimo boton del tour de «Su cuerpo» (fuera de la pantalla o tapado)'); await q.evaluate(() => window.TG_GUIA.cerrar()); continue; }
        const fin = await q.evaluate(() => ({ g: localStorage.getItem('tenerife.tour.cuerpo'), app: localStorage.getItem('tenerife.tour.seen'), abierto: window.TG_GUIA.estado().abierto,
          pantalla: window.TG_CUERPO.abierto(), arriba: document.getElementById('cuerpo-panel').scrollTop, m: document.getElementById('tgc-modo-m').getAttribute('aria-pressed') }));
        if (fin.g !== '1') fallos.push(L + ' ' + tam + ': al terminar el tour de «Su cuerpo» se guarda «' + fin.g + '»');
        if (Number(fin.app) !== VERSION) fallos.push(L + ' ' + tam + ': el tour de «Su cuerpo» cambia lo guardado del de la app («' + fin.app + '»)');
        if (fin.abierto) fallos.push(L + ' ' + tam + ': el tour de «Su cuerpo» no se cierra al terminar');
        if (!fin.pantalla) fallos.push(L + ' ' + tam + ': al terminar el tour se cierra «Su cuerpo»');
        if (fin.arriba > 2) fallos.push(L + ' ' + tam + ': al terminar el tour, «Su cuerpo» no queda arriba (' + Math.round(fin.arriba) + ' px)');
        if (fin.m !== 'true') fallos.push(L + ' ' + tam + ': al terminar el tour, «Su cuerpo» no queda en «Músculos»');
      }
      await q.setViewportSize({ width: 390, height: 844 });
      const despues = await guardado();
      if (despues.datos !== antes.datos || despues.tema !== antes.tema) fallos.push(L + ': el tour escribe en lo guardado de «Su cuerpo» («' + String(despues.datos).slice(0, 60) + '», tema «' + despues.tema + '»)');
      /* visto el tour, el globito no vuelve, y el boton sigue siendo uno */
      await q.evaluate(() => window.TG_CUERPO.cerrar());
      await q.waitForTimeout(300);
      await q.evaluate(() => window.abrirCuerpo());
      await q.waitForTimeout(2600);
      if (await q.$('.tgg-pista')) fallos.push(L + ': Jero se vuelve a ofrecer en «Su cuerpo» despues de ver su tour');
      const cuantos = await q.evaluate(() => document.querySelectorAll('.cuerpo-tour-btn').length);
      if (cuantos !== 1) fallos.push(L + ': al volver a abrir «Su cuerpo» hay ' + cuantos + ' botones de Jero');
    }
    if (c.err.length) fallos.push(L + ': errores de pagina en el tour de «Su cuerpo»: ' + c.err.slice(0, 3).join(' | '));
    await c.ctx.close();
  }
  return { fallos, textos, sinJero };
}

/* ── en castellano: con movimiento, con voz y sin el modulo ── */
async function aparte(b) {
  const fallos = [];
  /* con movimiento: Jero vive, el texto se escribe y la estela une el dedo con el foco */
  {
    const { ctx, p, err } = await entra(b, 'es', { movimiento: true });
    await p.waitForSelector('.v19t-prompt', { timeout: 8000 }).catch(() => fallos.push('con movimiento: no sale la pregunta'));
    await p.click('.v19t-prompt .v19t-next').catch(() => {});
    await p.waitForSelector('#v19-tour.open', { timeout: 6000 }).catch(() => {});
    const antes = await p.evaluate(() => ({ dicho: document.querySelector('.tgg-dicho').textContent.length, resto: document.querySelector('.tgg-pordecir').textContent.length }));
    if (!(await listo(p, 8000))) fallos.push('con movimiento: el primer paso no termina de colocarse');
    await p.waitForFunction(() => !document.querySelector('.tgg-pordecir').textContent, null, { timeout: 8000 }).catch(() => fallos.push('con movimiento: el texto no termina de escribirse'));
    const d = await p.evaluate(() => ({ e: window.TG_GUIA.estado(), estela: !!document.querySelector('.tgg-rastro.ve'), d: document.querySelector('.tgg-rastro').getAttribute('d') || '' }));
    if (antes.resto === 0) fallos.push('con movimiento: el texto sale escrito de golpe');
    if (!d.e.jero.vivo) fallos.push('con movimiento: Jero no se mueve');
    if (d.e.jero.mano.i !== 'senala' && d.e.jero.mano.d !== 'senala') fallos.push('con movimiento: Jero no señala');
    if (!d.estela || !/^M[\d.-]+,[\d.-]+ Q/.test(d.d)) fallos.push('con movimiento: no hay estela del dedo al foco');
    /* la mano que señala, tal como queda dibujada: el pulgar a un lado del indice, los tres dedos doblados
       al otro, y el indice bien mas largo que ellos. Un dedo solo en medio del puño parecia otro gesto. */
    const mano = await p.evaluate(() => {
      const lado = window.TG_GUIA.estado().jero.mano.i === 'senala' ? 'i' : 'd';
      const m = document.querySelector('#v19-tour .tgg-brazo-' + lado + ' .tgg-m-senala');
      if (!m || getComputedStyle(m).display === 'none') return null;
      const caja = n => { const b = n.getBBox(); return { x0: b.x, x1: b.x + b.width, y1: b.y + b.height }; };
      const i = m.querySelector('.tgg-indice'), pu = m.querySelector('.tgg-pulgar'), ds = [...m.querySelectorAll('.tgg-doblado')];
      if (!i || !pu) return { falta: true };
      return { i: caja(i), pu: caja(pu), ds: ds.map(caja) };
    });
    if (!mano || mano.falta) fallos.push('con movimiento: la mano que señala no lleva su indice y su pulgar');
    else {
      if (mano.ds.length !== 3) fallos.push('con movimiento: la mano que señala lleva ' + mano.ds.length + ' dedos doblados y son tres');
      if (mano.ds.some(q => q.x0 < mano.i.x1 - 0.6)) fallos.push('con movimiento: el indice no esta en el borde de la mano: tiene dedos doblados a los dos lados');
      if (!(mano.pu.x0 < mano.i.x0 - 8)) fallos.push('con movimiento: el pulgar no se ve a su lado del indice');
      if (mano.ds.some(q => mano.i.y1 - q.y1 < 18)) fallos.push('con movimiento: el indice apenas sobresale de los dedos doblados');
    }
    /* un toque en el texto lo escribe entero */
    await p.click('#v19-tour .v19t-next'); await p.waitForTimeout(120);
    await p.click('#v19-tour .v19t-cuerpo'); await p.waitForTimeout(60);
    if (await p.evaluate(() => document.querySelector('.tgg-pordecir').textContent.length)) fallos.push('con movimiento: tocar el texto no lo escribe entero');
    /* un paso con chiste (el del dado): primero lo que explica, con su cara; despues, el aparte, con otra */
    await p.click('#v19-tour .v19t-next');
    const ch = () => p.evaluate(() => { const c = document.querySelector('#v19-tour .tgg-chiste'), t = document.querySelector('#v19-tour .tgg-texto');
      return { paso: window.TG_GUIA.estado().paso, cara: window.TG_GUIA.estado().jero.emocion, hay: !!c && getComputedStyle(c).display !== 'none',
               falta: t.querySelector('.tgg-pordecir').textContent.length, dicho: c ? c.querySelector('.tgg-dicho').textContent.length : 0, resto: c ? c.querySelector('.tgg-pordecir').textContent.length : 0 }; });
    await p.waitForFunction(() => { const t = document.querySelector('#v19-tour .tgg-texto .tgg-dicho'); return t && t.textContent.length > 3; }, null, { timeout: 6000 }).catch(() => {});
    const c1 = await ch();
    if (c1.paso !== 'tourDado' || !c1.hay) fallos.push('con movimiento: el paso del dado ya no lleva chiste (' + c1.paso + ')');
    else {
      if (!(c1.falta > 0 && c1.dicho === 0 && c1.resto > 0)) fallos.push('con movimiento: el chiste no espera a que acabe el texto');
      if (c1.cara !== 'pensativo') fallos.push('con movimiento: el paso del dado empieza con la cara «' + c1.cara + '»');
      await p.waitForFunction(() => { const c = document.querySelector('#v19-tour .tgg-chiste'); return c && !c.querySelector('.tgg-pordecir').textContent && c.querySelector('.tgg-dicho').textContent.length > 3; }, null, { timeout: 9000 }).catch(() => fallos.push('con movimiento: el chiste no termina de escribirse'));
      const c2 = await ch();
      if (c2.cara !== 'picaro') fallos.push('con movimiento: el chiste se cuenta con la cara «' + c2.cara + '» y no con la suya');
      const fx = await p.evaluate(() => { const j = document.querySelector('#v19-tour .tgg-unidad > .tgg-jero'); return { emo: j.getAttribute('data-emo'), ojo: (j.querySelector('.tgg-ojo-blanco').getAttribute('d') || '').length }; });
      if (fx.emo !== 'picaro' || fx.ojo < 20) fallos.push('con movimiento: la cara del chiste no llega al dibujo');
    }
    /* Escape cierra y guarda */
    await p.keyboard.press('Escape');
    const fin = await p.evaluate(() => ({ a: window.TG_GUIA.estado().abierto, g: localStorage.getItem('tenerife.tour.seen') }));
    if (fin.a || Number(fin.g) !== VERSION) fallos.push('con movimiento: Escape no cierra y guarda (' + fin.a + ', «' + fin.g + '»)');
    if (err.length) fallos.push('con movimiento: errores de pagina: ' + err.slice(0, 3).join(' | '));
    await ctx.close();
  }
  /* con el movil lento: un cuadro cada 50 ms (20 por segundo). Los muelles de Jero no se desbocan: a
     ese paso los de los parpados se iban al techo, y de las gafas salian dos barras blancas hasta
     arriba de la pantalla (se vio en las capturas del tour de «Su cuerpo», el 10-11-2026) */
  {
    const { ctx, p, err } = await entra(b, 'es', { movimiento: true, antes: () => {
      let id = 0; const vivos = new Map();
      window.requestAnimationFrame = f => { const n = ++id; vivos.set(n, setTimeout(() => { vivos.delete(n); f(performance.now()); }, 50)); return n; };
      window.cancelAnimationFrame = n => { clearTimeout(vivos.get(n)); vivos.delete(n); };
    } });
    await p.waitForSelector('.v19t-prompt', { timeout: 8000 }).catch(() => fallos.push('movil lento: no sale la pregunta'));
    await p.click('.v19t-prompt .v19t-next').catch(() => {});
    await p.waitForSelector('#v19-tour.open', { timeout: 6000 }).catch(() => {});
    const mira = () => p.evaluate(() => {
      const j = document.querySelector('#v19-tour .tgg-unidad > .tgg-jero'); if (!j) return null;
      const ojos = [...j.querySelectorAll('.tgg-ojo-blanco')].map(o => { const q = o.getBBox(); return [q.width, q.height]; });
      const tr = [...j.querySelectorAll('.tgg-ceja-i, .tgg-ceja-d, .tgg-cabeza, .tgg-hueso1, .tgg-hueso2')].map(n => n.getAttribute('transform') || '');
      return { ojos, raro: tr.filter(t => /NaN|Infinity|e\+/.test(t) || (t.match(/-?\d+(\.\d+)?/g) || []).some(v => Math.abs(+v) > 1000)) };
    });
    for (let i = 0; i < 6; i++) {            // del buscador a los marcadores, con el chiste del dado y el asombro del 3D por el camino
      await listo(p, 9000); await p.waitForTimeout(2200);
      const m = await mira();
      if (!m) { fallos.push('movil lento: Jero no esta'); break; }
      if (m.ojos.some(o => o[0] > 26 || o[1] > 34)) fallos.push('movil lento, paso ' + (i + 1) + ': los parpados se desbocan (ojos de ' + m.ojos.map(o => o.map(Math.round).join('×')).join(' y ') + ')');
      if (m.raro.length) fallos.push('movil lento, paso ' + (i + 1) + ': un muelle se desboca (' + m.raro[0].slice(0, 60) + ')');
      await p.click('#v19-tour .v19t-next').catch(() => {});
    }
    if (err.length) fallos.push('movil lento: errores de pagina: ' + err.slice(0, 3).join(' | '));
    await ctx.close();
  }
  /* la voz, con una voz falsa que apunta lo que se le pide leer */
  for (const L of ['es', 'pl', 'zht']) {
    const { ctx, p, err } = await entra(b, L, { antes: () => {
      const dichas = []; window.__dichas = dichas; window.__cancel = 0;
      class U { constructor(t) { this.text = t; this.lang = ''; this.rate = 1; this.voice = null; } }
      const voces = ['es-ES', 'en-GB', 'fr-FR', 'de-DE', 'it-IT', 'nl-NL', 'zh-CN', 'zh-TW', 'bg-BG', 'pl-PL'].map(l => ({ lang: l, name: 'voz ' + l, localService: true, default: false, voiceURI: l }));
      const s = { speaking: false, pending: false, paused: false, getVoices: () => voces,
        speak(u) { dichas.push({ text: u.text, lang: u.lang }); s.speaking = true; window.__ultima = u; setTimeout(() => u.onstart && u.onstart({}), 0); },
        cancel() { window.__cancel++; s.speaking = false; }, pause() {}, resume() {}, addEventListener() {}, removeEventListener() {} };
      Object.defineProperty(window, 'speechSynthesis', { value: s, configurable: true });
      window.SpeechSynthesisUtterance = U;
    } });
    await p.waitForSelector('.v19t-prompt', { timeout: 8000 }).catch(() => {});
    await p.click('.v19t-prompt .v19t-next').catch(() => {});
    await p.waitForSelector('#v19-tour.open', { timeout: 6000 }).catch(() => {});
    await listo(p);
    const hay = await p.evaluate(() => { const v = document.querySelector('#v19-tour .tgg-voz'); return !!v && getComputedStyle(v).display !== 'none' && !!v.getAttribute('aria-label'); });
    if (!hay) { fallos.push('voz ' + L + ': con una voz instalada no sale el boton de escuchar'); await ctx.close(); continue; }
    if (await p.evaluate(() => window.__dichas.length)) fallos.push('voz ' + L + ': habla sin que nadie se lo pida');
    await p.click('#v19-tour .tgg-voz'); await p.waitForTimeout(150);
    const uno = await p.evaluate(() => ({ dichas: window.__dichas.slice(), t: document.querySelector('#v19-tour h3').textContent, c: document.querySelector('#v19-tour .tgg-texto').textContent,
      pulsado: document.querySelector('#v19-tour .tgg-voz').getAttribute('aria-pressed'), loc: window.TG_VOZ.locale(currentLang) }));
    const u = uno.dichas[0];
    if (uno.dichas.length !== 1 || !u) fallos.push('voz ' + L + ': al encenderla no lee el paso (' + uno.dichas.length + ' frases)');
    else {
      if (!u.text.includes(uno.t)) fallos.push('voz ' + L + ': no lee el titulo del paso');
      if (u.lang !== uno.loc) fallos.push('voz ' + L + ': lee en «' + u.lang + '» y no en «' + uno.loc + '»');
      if (/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u.test(u.text)) fallos.push('voz ' + L + ': lee emojis');
      if (ROTO.test(u.text)) fallos.push('voz ' + L + ': lee un texto roto');
    }
    if (uno.pulsado !== 'true') fallos.push('voz ' + L + ': el boton no queda marcado');
    /* al acabar la frase, pasa solo al paso siguiente y lo lee */
    await p.evaluate(() => { const u2 = window.__ultima; window.speechSynthesis.speaking = false; if (u2 && u2.onend) u2.onend({}); });
    await p.waitForFunction(() => window.TG_GUIA.estado().i === 1 && window.__dichas.length === 2, null, { timeout: 6000 }).catch(() => fallos.push('voz ' + L + ': al acabar de leer no pasa al paso siguiente'));
    /* y el siguiente lleva chiste: tambien se lee */
    await p.evaluate(() => { const u2 = window.__ultima; window.speechSynthesis.speaking = false; if (u2 && u2.onend) u2.onend({}); });
    await p.waitForFunction(() => window.TG_GUIA.estado().i === 2 && window.__dichas.length === 3, null, { timeout: 6000 }).catch(() => fallos.push('voz ' + L + ': no llega leyendo al tercer paso'));
    const tres = await p.evaluate(() => ({ u: window.__dichas[2], c: (document.querySelector('#v19-tour .tgg-chiste') || {}).textContent || '' }));
    if (!tres.c.trim()) fallos.push('voz ' + L + ': el tercer paso ya no lleva chiste');
    else if (!tres.u || !tres.u.text.includes(tres.c.trim())) fallos.push('voz ' + L + ': no lee el chiste del paso');
    /* «Atras» con la voz puesta lee el paso al que se vuelve; apagarla calla */
    await p.click('#v19-tour .tgg-voz'); await p.waitForTimeout(100);
    const fin = await p.evaluate(() => ({ voz: window.TG_GUIA.estado().voz, cancel: window.__cancel, n: window.__dichas.length }));
    if (fin.voz || fin.cancel < 1) fallos.push('voz ' + L + ': apagarla no la calla');
    await p.click('#v19-tour .v19t-next'); await p.waitForTimeout(700);
    if (await p.evaluate(() => window.__dichas.length) !== fin.n) fallos.push('voz ' + L + ': apagada, sigue leyendo');
    if (err.length) fallos.push('voz ' + L + ': errores de pagina: ' + err.slice(0, 3).join(' | '));
    await ctx.close();
  }
  /* CON EL MOVIL TUMBADO (844×390), los tres tours enteros. El control recorria cuatro moviles de pie, y
     tumbado casi nunca cabe nada ni encima ni debajo de lo que se señala: el bocadillo lo tapaba en
     varios pasos, Jero salia en miniatura en casi todos y el ultimo paso se salia por abajo, con su
     boton a medias (10-11-2026; el tour de antes, sin personaje, cabia mejor). Ahora, apaisado y bajo, el
     bocadillo va al lado de lo que señala (de una tarjeta ancha se enseña su lado izquierdo) y el ultimo
     paso se aprieta hasta caber. Se mira lo mismo que de pie en cada paso; la miniatura se admite. */
  for (const tour of ['app', 'cielo', 'cuerpo']) {
    const { ctx, p, err } = await entra(b, 'es', { antes: g => { try { localStorage.setItem('tenerife.tour.seen', g); } catch (e) {} }, dato: String(VERSION) });
    try {
      await p.setViewportSize({ width: 844, height: 390 });
      await p.waitForTimeout(700);
      await p.evaluate(t => (t === 'app' ? window.v19StartTour() : t === 'cielo' ? window.v19TourCielo() : window.v19TourCuerpo()), tour);
      if (!(await p.waitForSelector('#v19-tour.open', { timeout: 30000 }).then(() => true, () => false))) fallos.push('tumbado: el tour «' + tour + '» no se abre');
      else {
        const { S, pasos } = await recorre(p, 'es', tour + ' tumbado', TUMBADO, fallos, { espera: 420 });
        if (pasos.length !== S) fallos.push('tumbado: el tour «' + tour + '» se queda en el paso ' + pasos.length + ' de ' + S);
        /* el de la app es el que se ofrece al entrar: ahi, ni en miniatura */
        const mini = pasos.filter(d => d.nivel === 3).length;
        if (tour === 'app' && mini) fallos.push('tumbado: en el tour de la app Jero sale en miniatura en ' + mini + ' paso(s), y de lado cabe a su tamaño');
        /* y el ultimo paso, que no señala nada: entero, con su boton dentro de la pantalla */
        const fin = await p.evaluate(() => { const n = document.querySelector('#v19-tour .v19t-next'), r = n.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth; });
        if (!fin) fallos.push('tumbado: en el ultimo paso del tour «' + tour + '» el boton de terminar no cabe en la pantalla');
      }
    } catch (e) { fallos.push('tumbado: la prueba del tour «' + tour + '» no pudo seguir: ' + String(e.message).split('\n')[0]); }
    if (err.length) fallos.push('tumbado: errores de pagina en el tour «' + tour + '»: ' + err.slice(0, 3).join(' | '));
    await ctx.close();
  }
  /* el globito del cielo sale una vez por dispositivo, se vea o no el tour */
  {
    const { ctx, p, err } = await entra(b, 'es', { antes: g => { try { if (!localStorage.getItem('tenerife.tour.seen')) localStorage.setItem('tenerife.tour.seen', g); } catch (e) {} }, dato: String(VERSION) });
    await p.click('#cielo-btn');
    await p.waitForSelector('.tgg-pista', { timeout: 30000 }).catch(() => fallos.push('el globito: no sale la primera vez'));
    const g1 = await p.evaluate(() => localStorage.getItem('tenerife.tour.cielo'));
    if (g1 !== '0') fallos.push('el globito: al enseñarlo se guarda «' + g1 + '» y no «0»');
    await p.reload({ waitUntil: 'networkidle' });
    await p.click('#v19-welcome-start').catch(() => {});
    await p.waitForTimeout(700);
    await p.click('#cielo-btn');
    await p.waitForFunction(() => window.TG_CIELO && window.TG_CIELO.estado.datos, null, { timeout: 30000 }).catch(() => {});
    await p.waitForTimeout(2200);
    if (await p.$('.tgg-pista')) fallos.push('el globito: vuelve a salir la segunda vez');
    await p.click('#cielo-tour-btn').catch(() => {});
    if (!(await p.waitForSelector('#v19-tour.open', { timeout: 8000 }).then(() => true, () => false))) fallos.push('el globito: ofrecido y no visto, el boton de Jero ya no abre el tour del cielo');
    if (err.length) fallos.push('el globito: errores de pagina: ' + err.slice(0, 3).join(' | '));
    await ctx.close();
  }
  /* «Su cuerpo», por el camino de verdad: Cuenta, la pestaña Cuerpo y «Abrir» */
  {
    const { ctx, p, err } = await entra(b, 'es', { antes: g => { try { if (!localStorage.getItem('tenerife.tour.seen')) localStorage.setItem('tenerife.tour.seen', g); } catch (e) {} }, dato: String(VERSION) });
    const C = 'en «Su cuerpo»: ';
    const como = () => p.evaluate(() => ({ tour: window.TG_GUIA ? window.TG_GUIA.estado().abierto : false, paso: window.TG_GUIA ? window.TG_GUIA.estado().paso : null,
      pantalla: !!(window.TG_CUERPO && window.TG_CUERPO.abierto()), perfil: (() => { const x = document.getElementById('perfil-panel'); return !!x && !x.hidden; })(),
      m: (document.getElementById('tgc-modo-m') || { getAttribute() { return null; } }).getAttribute('aria-pressed') }));
    const abreTour = async () => { await p.click('#cuerpo-tour-btn'); const si = await p.waitForSelector('#v19-tour.open', { timeout: 15000 }).then(() => true, () => false); if (si) await listo(p); return si; };
    await p.waitForTimeout(600);
    await p.click('#v19-nav-account').catch(() => {});
    await p.waitForSelector('#tgp-tab-cuerpo', { timeout: 30000 }).catch(() => fallos.push(C + 'el perfil no se abre desde «Cuenta»'));
    await p.click('#tgp-tab-cuerpo').catch(() => {});
    await p.click('#tgp-cuerpo-abrir').catch(() => fallos.push(C + 'no se puede pulsar «Abrir» en la pestaña Cuerpo'));
    const hay = await p.waitForFunction(() => window.TG_CUERPO && window.TG_CUERPO.abierto() && !!document.getElementById('cuerpo-tour-btn'), null, { timeout: 30000 }).then(() => true, () => false);
    if (!hay) fallos.push(C + 'abierta desde el perfil, no lleva el boton de Jero');
    else {
      /* el globito, una vez por dispositivo: al enseñarlo se guarda «0» */
      await p.waitForSelector('.tgg-pista', { timeout: 9000 }).catch(() => fallos.push(C + 'el globito no sale la primera vez'));
      const g1 = await p.evaluate(() => localStorage.getItem('tenerife.tour.cuerpo'));
      if (g1 !== '0') fallos.push(C + 'al enseñar el globito se guarda «' + g1 + '» y no «0»');
      /* Escape cierra el tour y nada mas («Su cuerpo» oye su Escape en la captura de window) */
      if (!(await abreTour())) fallos.push(C + 'el boton de Jero no abre el tour');
      else {
        await pulsa(p, '#v19-tour .v19t-next'); await listo(p);
        await p.keyboard.press('Escape'); await p.waitForTimeout(350);
        const e = await como();
        if (e.tour || !e.pantalla || !e.perfil) fallos.push(C + 'Escape tiene que cerrar el tour y nada mas (tour ' + e.tour + ', pantalla ' + e.pantalla + ', perfil ' + e.perfil + ')');
        const g2 = await p.evaluate(() => localStorage.getItem('tenerife.tour.cuerpo'));
        if (g2 !== '1') fallos.push(C + 'salir del tour con Escape guarda «' + g2 + '»');
      }
      /* «atras» cierra la pantalla, y el tour se va con ella; el perfil sigue */
      if (await abreTour()) {
        await p.goBack().catch(() => {}); await p.waitForTimeout(800);
        const e = await como();
        if (e.tour || e.pantalla || !e.perfil) fallos.push(C + '«atras» tiene que cerrar la pantalla y el tour, y dejar el perfil (tour ' + e.tour + ', pantalla ' + e.pantalla + ', perfil ' + e.perfil + ')');
      }
      /* al volver a abrirla: un boton, y ya sin globito */
      await p.click('#tgp-cuerpo-abrir').catch(() => {});
      await p.waitForFunction(() => window.TG_CUERPO.abierto(), null, { timeout: 8000 }).catch(() => {});
      await p.waitForTimeout(2400);
      const n = await p.evaluate(() => ({ b: document.querySelectorAll('.cuerpo-tour-btn').length, pista: !!document.querySelector('.tgg-pista') }));
      if (n.b !== 1) fallos.push(C + 'al volver a abrirla hay ' + n.b + ' botones de Jero');
      if (n.pista) fallos.push(C + 'el globito vuelve a salir');
      /* en «Aspecto» el boton se ve, y desde ahi el tour vuelve a «Músculos»; en «Comida» no hay escena ni boton */
      await p.click('#tgc-modo-a'); await p.waitForTimeout(700);
      if (!(await p.evaluate(() => { const r = document.getElementById('cuerpo-tour-btn').getBoundingClientRect(); return r.width > 0 && r.bottom <= innerHeight && r.top >= 0; }))) fallos.push(C + 'en «Aspecto» el boton de Jero no se ve');
      if (await abreTour()) {
        const e = await como();
        if (e.m !== 'true' || e.paso !== 'guiaCuPersonaje') fallos.push(C + 'desde «Aspecto», el tour no vuelve a «Músculos» (vista ' + e.m + ', paso ' + e.paso + ')');
        await p.keyboard.press('Escape'); await p.waitForTimeout(300);
      } else fallos.push(C + 'desde «Aspecto», el boton de Jero no abre el tour');
      await p.click('#tgc-modo-c'); await p.waitForTimeout(400);
      if (await p.evaluate(() => document.getElementById('cuerpo-tour-btn').getClientRects().length > 0)) fallos.push(C + 'en «Comida» el boton de Jero se queda a la vista sin escena');
      /* «Evolución» (10-11-2026): las dos tarjetas del perfil, sin escena. Su pestaña tiene que estar (el tour
         la señala en su paso) y, dentro, tampoco se queda el boton de Jero a la vista */
      if (!(await p.$('#tgc-modo-e'))) fallos.push(C + 'no esta la pestaña «Evolución» (#tgc-modo-e), que el tour señala');
      else {
        await p.click('#tgc-modo-e'); await p.waitForTimeout(600);
        if (await p.evaluate(() => document.getElementById('cuerpo-tour-btn').getClientRects().length > 0)) fallos.push(C + 'en «Evolución» el boton de Jero se queda a la vista sin escena');
      }
      await p.click('#tgc-modo-m'); await p.waitForTimeout(400);
      /* el tema Noche, de punta a punta */
      await p.click('#tgc-tema'); await p.waitForTimeout(400);
      if (await abreTour()) {
        await recorre(p, 'es', 'cuerpo (Noche)', '390×844', fallos, { espera: 300 });
        await pulsa(p, '#v19-tour.open .v19t-next');
        const t = await p.evaluate(() => ({ tema: window.TG_CUERPO.tema(), abierto: window.TG_GUIA.estado().abierto }));
        if (t.tema !== 'noche' || t.abierto) fallos.push(C + 'tras el tour en Noche: tema «' + t.tema + '», tour abierto ' + t.abierto);
      } else fallos.push(C + 'en el tema Noche, el boton de Jero no abre el tour');
    }
    if (err.length) fallos.push(C + 'errores de pagina: ' + err.slice(0, 3).join(' | '));
    await ctx.close();
  }
  /* con una celebracion encima (un sello recien conseguido), el globito espera: no se gasta debajo de ella */
  {
    const { ctx, p, err } = await entra(b, 'es', { antes: g => { try {
      localStorage.setItem('tenerife.tour.seen', g);
      if (!localStorage.getItem('tenerife.cuerpo')) { const d = new Date(), hoy = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        localStorage.setItem('tenerife.cuerpo', JSON.stringify({ v: 1, series: [{ d: hoy, g: 'pecho', n: 3 }] })); }
    } catch (e) {} }, dato: String(VERSION) });
    const C = 'el globito de «Su cuerpo» con un sello recien conseguido: ';
    await p.waitForTimeout(600);
    await p.evaluate(() => window.abrirCuerpo());
    const hay = await p.waitForFunction(() => window.TG_CUERPO && window.TG_CUERPO.abierto() && !!document.getElementById('cuerpo-tour-btn'), null, { timeout: 30000 }).then(() => true, () => false);
    if (!hay) fallos.push(C + '«Su cuerpo» no se abre');
    else {
      await p.waitForTimeout(3200);
      const e1 = await p.evaluate(() => ({ fiesta: !document.getElementById('tgc-fiesta').hidden, pista: !!document.querySelector('.tgg-pista'), g: localStorage.getItem('tenerife.tour.cuerpo') }));
      if (!e1.fiesta) fallos.push(C + 'la prueba ya no provoca una celebracion al abrir (hay que rehacerla)');
      else {
        if (e1.pista || e1.g !== null) fallos.push(C + 'se ofrece debajo de la celebracion (globito ' + e1.pista + ', guardado «' + e1.g + '»)');
        await p.evaluate(() => { window.TG_CUERPO.cerrarFiesta(); window.TG_CUERPO.cerrar(); });
        await p.waitForTimeout(400);
        await p.evaluate(() => window.abrirCuerpo());
        const sale = await p.waitForSelector('.tgg-pista', { timeout: 9000 }).then(() => true, () => false);
        const g2 = await p.evaluate(() => localStorage.getItem('tenerife.tour.cuerpo'));
        if (!sale || g2 !== '0') fallos.push(C + 'cerrada la celebracion, a la vez siguiente no se ofrece (globito ' + sale + ', guardado «' + g2 + '»)');
      }
    }
    if (err.length) fallos.push(C + 'errores de pagina: ' + err.slice(0, 3).join(' | '));
    await ctx.close();
  }
  /* sin el modulo de «Su cuerpo» (sin conexion y sin guardar todavia): la visita lo dice y no se abre nada */
  {
    const { ctx, p, err } = await entra(b, 'es', { sinCuerpo: true, antes: g => { try { localStorage.setItem('tenerife.tour.seen', g); } catch (e) {} }, dato: String(VERSION) });
    await p.waitForTimeout(700);
    await p.click('#map-legend-toggle').catch(() => {});
    await p.click('#leg-tour').catch(() => {});
    await p.waitForSelector('.tgg-menu', { timeout: 8000 }).catch(() => fallos.push('sin «Su cuerpo»: no sale el menu de visitas'));
    await p.evaluate(() => { const o = document.querySelectorAll('.tgg-menu .tgg-op'); if (o.length) o[o.length - 1].click(); });
    const aviso = await p.waitForFunction(() => { const t = document.getElementById('layer-toast'); return t && t.textContent; }, null, { timeout: 15000 }).then(h => h.jsonValue(), () => '');
    const esperado = await p.evaluate(() => tx('tourSinModulo'));
    if (!aviso || aviso !== esperado) fallos.push('sin «Su cuerpo»: la visita no dice que no se ha podido cargar («' + aviso + '»)');
    if (await p.evaluate(() => window.TG_GUIA.estado().abierto)) fallos.push('sin «Su cuerpo»: el tour se abre sin su pantalla');
    if (err.length) fallos.push('sin «Su cuerpo»: errores de pagina: ' + err.slice(0, 3).join(' | '));
    await ctx.close();
  }
  /* sin el modulo (sin conexion y sin guardar todavia): la app sigue y lo dice */
  {
    const { ctx, p, err } = await entra(b, 'es', { sinModulo: true });
    await p.waitForTimeout(2500);
    if (await p.$('.v19t-prompt')) fallos.push('sin el modulo: sale la pregunta');
    const mapa = await p.evaluate(() => typeof map !== 'undefined' && !!map && document.getElementById('v19-welcome').classList.contains('hidden'));
    if (!mapa) fallos.push('sin el modulo: la app no arranca');
    await p.click('#map-legend-toggle').catch(() => {});
    await p.click('#leg-tour').catch(() => {});
    const aviso = await p.waitForFunction(() => { const t = document.getElementById('layer-toast'); return t && t.textContent; }, null, { timeout: 6000 }).then(h => h.jsonValue(), () => '');
    const esperado = await p.evaluate(() => tx('tourSinModulo'));
    if (!aviso || aviso !== esperado) fallos.push('sin el modulo: «Ver el tour» no dice que no se ha podido cargar («' + aviso + '»)');
    await p.click('#cielo-btn').catch(() => {});
    await p.waitForFunction(() => window.TG_CIELO && window.TG_CIELO.estado.datos, null, { timeout: 30000 }).catch(() => fallos.push('sin el modulo: el panel del cielo no carga'));
    await p.waitForTimeout(1500);
    if (await p.$('.tgg-pista')) fallos.push('sin el modulo: sale la pista del cielo');
    /* «Su cuerpo» se abre igual, con su boton (lo pone el cargador), sin pista, y el boton dice que el tour no ha llegado */
    await p.click('#cielo-cerrar').catch(() => {});
    await p.evaluate(() => { const t = document.getElementById('layer-toast'); if (t) t.textContent = ''; window.abrirCuerpo(); });
    const cu = await p.waitForFunction(() => window.TG_CUERPO && window.TG_CUERPO.abierto() && !!document.getElementById('cuerpo-tour-btn'), null, { timeout: 30000 }).then(() => true, () => false);
    if (!cu) fallos.push('sin el modulo: «Su cuerpo» no se abre con su boton de Jero');
    else {
      await p.waitForTimeout(2200);
      if (await p.$('.tgg-pista')) fallos.push('sin el modulo: sale la pista de «Su cuerpo»');
      await p.click('#cuerpo-tour-btn').catch(() => {});
      const av2 = await p.waitForFunction(() => { const t = document.getElementById('layer-toast'); return t && t.textContent; }, null, { timeout: 6000 }).then(h => h.jsonValue(), () => '');
      if (av2 !== esperado) fallos.push('sin el modulo: el boton de Jero de «Su cuerpo» no dice que no se ha podido cargar («' + av2 + '»)');
    }
    if (err.length) fallos.push('sin el modulo: errores de pagina: ' + err.slice(0, 3).join(' | '));
    await ctx.close();
  }
  return fallos;
}

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const P = (k, v) => console.log('  ' + String(k).padEnd(52, '.') + ' ' + v);
  console.log('=== los tours con Jero, en los ' + IDIOMAS.length + ' idiomas ===');
  const res = {};
  let total = 0;
  const est = estatico();
  P('sin navegador: ' + est.textos + ' textos pedidos, ' + est.pasos + ' pasos (' + est.chistes + ' con chiste), ' + est.gestos + ' gestos de cara, la mano que señala, la barra de la luz roja, ' + est.ids + ' nombres de «Su cuerpo» y ' + est.nombran + ' frases que la nombran', est.fallos.length ? est.fallos.length + ' fallo(s)' : 'bien');
  est.fallos.forEach(x => console.log('       ' + x));
  total += est.fallos.length;
  for (const L of (SOLO_APARTE ? [] : IDIOMAS)) {
    try { res[L] = await idioma(b, L); }
    catch (e) { res[L] = { fallos: [L + ': la prueba no pudo seguir: ' + String(e && e.message || e).split('\n')[0]], textos: {}, sinJero: {} }; }
    total += res[L].fallos.length;
    const ks = Object.keys(res[L].textos), sj = res[L].sinJero;
    const peq = Object.keys(sj).filter(k => sj[k]).map(k => k + ': ' + sj[k]).join(', ');
    P(L + ' · app ' + ks.filter(k => k.startsWith('app ')).length + ' pasos, cielo ' + ks.filter(k => k.startsWith('cielo ')).length + ', cuerpo ' + ks.filter(k => k.startsWith('cuerpo ')).length + ', en ' + TAMANOS.length + ' tamaños',
      (res[L].fallos.length ? res[L].fallos.length + ' fallo(s)' : 'bien') + (peq ? ' — Jero en miniatura por falta de sitio (' + peq + ')' : ''));
    res[L].fallos.slice(0, 14).forEach(f => console.log('       ' + f));
  }
  let ap = [];
  try { ap = await aparte(b); } catch (e) { ap = ['las pruebas de movimiento, voz, «Su cuerpo» y sin los modulos no pudieron seguir: ' + String(e && e.message || e).split('\n')[0]]; }
  P('con movimiento (y con el movil lento), con voz (es, pl, zht), con el movil tumbado, los globitos, «Su cuerpo» por dentro y sin los modulos', ap.length ? ap.length + ' fallo(s)' : 'bien');
  ap.slice(0, 14).forEach(f => console.log('       ' + f));
  total += ap.length;
  await b.close();
  // entre idiomas: nada igual al castellano ni (salvo el propio) al ingles
  const iguales = [];
  for (const L of (SOLO_APARTE ? [] : IDIOMAS)) {
    if (L === 'es') continue;
    for (const [k, v] of Object.entries(res[L].textos)) {
      const es = (res.es && res.es.textos[k]) || '', en = (res.en && res.en.textos[k]) || '';
      if (v === es) iguales.push(L + ' ' + k + ': igual que el castellano');
      else if (L !== 'en' && v === en) iguales.push(L + ' ' + k + ': igual que el ingles');
      else {
        const pv = v.split(' ¦ '), pe = es.split(' ¦ '), pn = en.split(' ¦ ');
        pv.forEach((x, j) => {
          if (x && x === pe[j] && !/^[\d\s/.,]+$/.test(x)) iguales.push(L + ' ' + k + ' trozo ' + (j + 1) + ' «' + x.slice(0, 40) + '»: igual que el castellano');
          else if (x && L !== 'en' && x === pn[j] && !/^[\d\s/.,]+$/.test(x)) iguales.push(L + ' ' + k + ' trozo ' + (j + 1) + ' «' + x.slice(0, 40) + '»: igual que el ingles');
        });
      }
    }
    if (res.es && Object.keys(res[L].textos).length !== Object.keys(res.es.textos).length && !res[L].fallos.length)
      iguales.push(L + ': enseña ' + Object.keys(res[L].textos).length + ' textos y el castellano ' + Object.keys(res.es.textos).length);
  }
  P('textos iguales al castellano o al ingles', iguales.length);
  iguales.slice(0, 30).forEach(x => console.log('       ' + x));
  total += iguales.length;
  console.log(total ? '\n  ' + total + ' fallo(s)' : '\n  OK');
  process.exitCode = total ? 1 : 0;
})().catch(e => { console.error(e && e.stack || e); process.exit(2); });
