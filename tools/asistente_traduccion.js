#!/usr/bin/env node
/* asistente_traduccion.js — el asistente de «Su cuerpo» (sus respuestas escritas, con sus fuentes) de un idioma nuevo,
 * ANCLADO EN EL CASTELLANO.
 *
 *   node tools/asistente_traduccion.js ro --probar            dice cuantas respuestas casan, cuales han cambiado y cuantas faltan
 *   node tools/asistente_traduccion.js ro --probar --lista    y cuales faltan, una a una
 *   node tools/asistente_traduccion.js ro                     escribe datos/cuerpo/asistente-ro.json (solo si estan todas y
 *                                                             todas casan)
 *   node tools/asistente_traduccion.js ro --comprobar         que datos/cuerpo/asistente-ro.json es el que saldria hoy
 *
 * Lee idiomas/<lang>-fuente/asistente-*.json (los trozos del rumano: bloques R17 a R20). Cada respuesta lleva su id, EL
 * CASTELLANO QUE TRADUCE (todo lo que se traduce, como en datos/cuerpo/asistente-es.json) y su traduccion, con la misma forma:
 *
 *   { "idioma": "ro", "respuestas": [ { "id": "cuanta-agua",
 *       "es": { "q": "…", "r": { "t": "…", "p": ["…"], "n": "…" }, "f": ["titulo", …], "v": ["…"], "k": ["…"], "u": [] },
 *       "ro": { "q": "…", "r": { "t": "…", "p": ["…"], "n": "…" }, "f": ["titlu", …], "v": ["…"], "k": ["…"], "u": [] } } ] }
 *
 * Se traduce la pregunta (q), la respuesta (r: t, p, n, c; en las que calculan, cada caso de r.casos, con sus marcas {n}
 * tal cual), el titulo de cada fuente (f[].titulo), las variantes (v) y las claves (k) con que el buscador la encuentra, y,
 * en las urgencias, sus patrones (u: expresiones regulares en ese idioma, que el buscador pasa por las mismas letras que el
 * texto). Lo demas (cat, tipo, edad, cert, rel, links y, de cada fuente, url, fecha, tipo, leido y resumen) es de todos los
 * idiomas: se copia del castellano de hoy.
 *
 * POR QUE ANCLADO. Si entre la traduccion y la entrega cambia el castellano de una respuesta (una cifra, un parrafo, una
 * fuente mas, una variante), la traduccion vieja diria otra cosa, o tendria una fuente de menos. Aqui cada respuesta se
 * compara con lo que asistente-es.json dice HOY: si su castellano cambio, esa respuesta no casa, se dice que parte y NO SE
 * ESCRIBE NADA. Es lo que hacen tools/ejercicios_traduccion.js con los ejercicios y tools/lugares_traduccion.js con las
 * fichas de los lugares.
 *
 * Mientras falten respuestas (los bloques que vienen), --probar da 0 si todo lo que hay casa, y sin --probar no se escribe:
 * un asistente a medias no se ofrece (la app usa el castellano si no hay asistente-<lang>.json). El fichero que escribe
 * tiene la forma de asistente-es.json (las claves en el mismo orden, en una linea, sin salto al final). Despues de cada
 * construir.py de «Su cuerpo», si ese construir.py no escribe este idioma, se vuelve a pasar esta herramienta (--comprobar
 * dice si hace falta).
 */
'use strict';
const fs = require('fs'), path = require('path');
const RAIZ = path.join(__dirname, '..');
const args = process.argv.slice(2);
const L = args.find(a => !a.startsWith('--'));
const PROBAR = args.includes('--probar'), LISTA = args.includes('--lista'), COMPROBAR = args.includes('--comprobar');
if (!/^[a-z]{2,3}$/.test(L || '') || L === 'es') {
  console.error('uso: node tools/asistente_traduccion.js <idioma> [--probar [--lista] | --comprobar]'); process.exit(2);
}
const CUERPO = path.join(RAIZ, 'datos', 'cuerpo');
const leer = f => JSON.parse(fs.readFileSync(f, 'utf8'));

/* el castellano de hoy y lo que de cada respuesta se traduce */
const ES = leer(path.join(CUERPO, 'asistente-es.json'));
const porId = new Map(ES.respuestas.map(r => [r.id, r]));
const traducible = r => ({ q: r.q, r: r.r, f: r.f.map(x => x.titulo), v: r.v, k: r.k, u: r.u });
const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const limpio = s => typeof s === 'string' && s.length > 0 && s.trim() === s && !/ {2}/.test(s);
const marcas = s => (String(s).match(/\{[A-Za-z_]+\}/g) || []).sort().join(' ');
/* las letras con que el buscador mira un patron de urgencia (letras() de modulos/cuerpo.js) */
const MAPA = { 'ł': 'l', 'ß': 'ss', 'ø': 'o', 'đ': 'd', 'æ': 'ae', 'œ': 'oe' };
const letras = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[łßøđæœ]/g, c => MAPA[c] || c);

/* lo que la app lee de cada texto (indexarAsistente, en modulos/cuerpo.js): lo que pase de ahi se corta sin avisar */
const TOPE = { q: 200, v: 200, k: 60, u: 1200, f: 200, t: 600, c: 600, n: 600, p: 400 };
const tope = donde => { const m = donde.match(/ (q|v|k|u)$/) || donde.match(/ (f)\[\d+\]$/) || donde.match(/\.([tcnp])(?:\[\d+\])?$/); return m ? TOPE[m[1]] : Infinity; };
/* que el texto t tenga la forma del castellano e: las mismas claves, las mismas listas y las mismas marcas {n} */
function forma(e, t, donde, mal) {
  if (typeof e === 'string') {
    if (!limpio(t)) mal.push(donde + ': vacio, sin texto o con espacios de mas');
    else if (marcas(e) !== marcas(t)) mal.push(donde + ': las marcas {…} no son las del castellano (' + (marcas(e) || 'ninguna') + ')');
    else if (t.length > tope(donde)) mal.push(donde + ': ' + t.length + ' caracteres; la app solo lee ' + tope(donde));
  } else if (Array.isArray(e)) {
    if (!Array.isArray(t) || t.length !== e.length) mal.push(donde + ': ' + (Array.isArray(t) ? t.length : 'sin') + ' elementos y el castellano tiene ' + e.length);
    else e.forEach((x, i) => forma(x, t[i], donde + '[' + i + ']', mal));
  } else if (e && typeof e === 'object') {
    if (!t || typeof t !== 'object' || Array.isArray(t) || !igual(Object.keys(e).sort(), Object.keys(t).sort())) mal.push(donde + ': no tiene las claves del castellano (' + Object.keys(e).join(', ') + ')');
    else Object.keys(e).forEach(k => forma(e[k], t[k], donde + '.' + k, mal));
  }
}
/* las variantes y las claves: textos limpios, alguno y ninguno repetido; los patrones (u), textos que pueden empezar o
   acabar en un espacio (es parte del patron: «… arrastra a »), ninguno vacio ni repetido */
function lista(t, donde, mal, patrones) {
  const vale = patrones ? (s => typeof s === 'string' && s.length > 0) : limpio;
  if (!Array.isArray(t) || (!patrones && !t.length) || !t.every(vale)) mal.push(donde + ': tiene que ser una lista de textos' + (patrones ? '' : ' limpios, con alguno'));
  else if (new Set(t).size !== t.length) mal.push(donde + ': un texto repetido');
  else t.forEach((x, i) => { if (x.length > tope(donde)) mal.push(donde + '[' + i + ']: ' + x.length + ' caracteres; la app solo lee ' + tope(donde)); });
}

/* los trozos */
const DIR = path.join(RAIZ, 'idiomas', L + '-fuente');
const ficheros = fs.existsSync(DIR) ? fs.readdirSync(DIR).filter(f => /^asistente-[\w-]+\.json$/.test(f)).sort() : [];
if (!ficheros.length) { console.error('no hay idiomas/' + L + '-fuente/asistente-*.json'); process.exit(2); }
const tiene = new Map(), malos = [], cambiadas = [], sobran = [], preguntas = new Map();
for (const f of ficheros) {
  const D = leer(path.join(DIR, f));
  if (D.idioma !== L || !Array.isArray(D.respuestas)) { malos.push(f + ': no es un fichero de ' + L + ' con «respuestas»'); continue; }
  let n = 0;
  for (const x of D.respuestas) {
    const donde = f + ' · ' + (x && x.id);
    if (!x || typeof x.id !== 'string' || !x.es || typeof x.es !== 'object' || !x[L] || typeof x[L] !== 'object') { malos.push(donde + ': sin id, sin castellano o sin texto'); continue; }
    if (tiene.has(x.id)) { malos.push(donde + ': ya estaba en ' + tiene.get(x.id).f); continue; }
    const hoy = porId.get(x.id);
    if (!hoy) { sobran.push(donde + ': esa respuesta ya no esta en datos/cuerpo/asistente-es.json'); continue; }
    const e = traducible(hoy), dif = [];
    if (!igual(x.es.q, e.q)) dif.push('la pregunta');
    if (!igual(x.es.r, e.r)) {
      const ks = new Set([...Object.keys(e.r), ...Object.keys(x.es.r || {})]);
      for (const k of ks) if (!igual((x.es.r || {})[k], e.r[k])) dif.push('la respuesta (r.' + k + ')');
    }
    if (!igual(x.es.f, e.f)) dif.push('las fuentes (' + (Array.isArray(x.es.f) ? x.es.f.length : 0) + ' entonces, ' + e.f.length + ' hoy)');
    if (!igual(x.es.v, e.v)) dif.push('las variantes');
    if (!igual(x.es.k, e.k)) dif.push('las claves');
    if (!igual(x.es.u, e.u)) dif.push('los patrones de urgencia');
    if (dif.length) { cambiadas.push({ donde, que: dif.join(', ') }); continue; }
    const t = x[L], mal = [];
    if (!igual(Object.keys(t).sort(), ['f', 'k', 'q', 'r', 'u', 'v'])) mal.push(donde + ': tiene que llevar q, r, f, v, k y u (y nada mas)');
    else {
      forma(e.q, t.q, donde + ' q', mal);
      forma(e.r, t.r, donde + ' r', mal);
      forma(e.f, t.f, donde + ' f', mal);
      lista(t.v, donde + ' v', mal);
      lista(t.k, donde + ' k', mal);
      lista(t.u, donde + ' u', mal, true);
      if (Array.isArray(t.u) && (t.u.length > 0) !== (e.u.length > 0)) mal.push(donde + ' u: ' + (e.u.length ? 'el castellano tiene patrones de urgencia y aqui no hay' : 'el castellano no tiene patrones de urgencia'));
      if (Array.isArray(t.u)) t.u.forEach((p, i) => { try { new RegExp(letras(p), 'iu'); } catch (err) { mal.push(donde + ' u[' + i + ']: no es una expresion regular: ' + err.message); } });
      if (!mal.length && preguntas.has(t.q)) mal.push(donde + ': la pregunta «' + t.q + '» ya la tiene ' + preguntas.get(t.q));
    }
    if (mal.length) { malos.push(...mal); continue; }
    preguntas.set(t.q, x.id);
    tiene.set(x.id, { f, t });
    n++;
  }
  console.log('  ' + f + ': ' + D.respuestas.length + ' respuestas, ' + n + ' casan');
}
const ids = ES.respuestas.map(r => r.id), faltan = ids.filter(i => !tiene.has(i));
console.log('casan ' + tiene.size + ' de ' + ids.length + ' respuestas de datos/cuerpo/asistente-es.json; faltan ' + faltan.length);
malos.forEach(x => console.log('  MAL  ' + x));
sobran.forEach(x => console.log('  SOBRA  ' + x));
cambiadas.forEach(x => console.log('  CAMBIO EL CASTELLANO  ' + x.donde + ': ' + x.que + ' (esa respuesta se traduce otra vez)'));
if (LISTA) faltan.forEach(i => console.log('  falta  ' + i));
const problemas = malos.length + sobran.length + cambiadas.length;

const ruta = path.join(CUERPO, 'asistente-' + L + '.json');
if (PROBAR) {
  console.log(problemas ? '--probar: ' + problemas + ' cosas que no valen (arriba); no se ha escrito nada'
                        : '--probar: todo lo que hay casa' + (faltan.length ? ' (faltan los bloques que vienen)' : '; se puede escribir'));
  process.exit(problemas ? 1 : 0);
}
if (COMPROBAR && !problemas && faltan.length) {
  const existe = fs.existsSync(ruta);
  console.log('--comprobar: faltan ' + faltan.length + ' respuestas (los bloques que vienen) y datos/cuerpo/asistente-' + L + '.json '
    + (existe ? 'existe: no es el que sale de las fuentes' : 'todavia no existe, como debe'));
  process.exit(existe ? 1 : 0);
}
if (problemas || faltan.length) {
  console.error((problemas ? problemas + ' cosas que no valen' : '') + (problemas && faltan.length ? ' y ' : '')
    + (faltan.length ? faltan.length + ' respuestas sin traducir' : '') + ': no se ha escrito nada');
  process.exit(1);
}
/* datos/cuerpo/asistente-<lang>.json, con la forma de asistente-es.json: las claves en su orden, lo traducido en su sitio */
const enOrden = (e, t) => (e && typeof e === 'object' && !Array.isArray(e))
  ? Object.fromEntries(Object.keys(e).map(k => [k, enOrden(e[k], t[k])])) : t;
const salida = {};
for (const k of Object.keys(ES)) {
  if (k === 'idioma') salida[k] = L;
  else if (k === 'respuestas') salida[k] = ES.respuestas.map(r => {
    const t = tiene.get(r.id).t, o = {};
    for (const c of Object.keys(r)) {
      if (c === 'q' || c === 'v' || c === 'k' || c === 'u') o[c] = t[c];
      else if (c === 'r') o[c] = enOrden(r.r, t.r);
      else if (c === 'f') o[c] = r.f.map((x, i) => Object.fromEntries(Object.keys(x).map(z => [z, z === 'titulo' ? t.f[i] : x[z]])));
      else o[c] = r[c];
    }
    return o;
  });
  else salida[k] = ES[k];
}
const texto = JSON.stringify(salida);
if (COMPROBAR) {
  const hay = fs.existsSync(ruta) ? fs.readFileSync(ruta, 'utf8') : null;
  console.log(hay === texto ? '--comprobar: datos/cuerpo/asistente-' + L + '.json al dia'
    : '--comprobar: datos/cuerpo/asistente-' + L + '.json ' + (hay === null ? 'no existe' : 'no es el que sale de las fuentes')
      + ' (node tools/asistente_traduccion.js ' + L + ')');
  process.exit(hay === texto ? 0 : 1);
}
fs.writeFileSync(ruta, texto);
console.log(ruta + '  ' + ids.length + ' respuestas · ' + Math.round(Buffer.byteLength(texto) / 1024) + ' kB');
