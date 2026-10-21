#!/usr/bin/env node
/* Control de la base de conocimiento del asistente.
 *
 * Un control que da verde sobre lo que no ha mirado es peor que no tener
 * control, asi que este no se conforma con que los ficheros esten bien
 * formados: coge cada entrada, le hace su propia pregunta al buscador de
 * verdad -el de index.html, no una copia- y comprueba que le contesta ella.
 * Una respuesta perfectamente traducida a la que no se llega nunca no sirve
 * de nada, y eso no se ve leyendo el JSON.
 */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const acorn = require('/opt/node22/lib/node_modules/eslint/node_modules/acorn');
const RAIZ = path.dirname(__dirname);
const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
let fallos = 0;
const mal = m => { fallos++; console.log('  ' + m); };

// ── de que idiomas habla la app ───────────────────────────────────────
function sacarConst(nombre) {
  let valor = null;
  html.replace(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/g, (m, js) => {
    if (valor || js.indexOf(nombre) < 0) return m;
    let ast; try { ast = acorn.parse(js, { ecmaVersion: 'latest' }); } catch (e) { return m; }
    for (const n of ast.body) if (n.type === 'VariableDeclaration')
      for (const d of n.declarations)
        if (d.id.name === nombre) valor = eval('(' + js.slice(d.init.start, d.init.end) + ')');
    return m;
  });
  if (!valor) { console.error('no encuentro ' + nombre + ' en index.html'); process.exit(2); }
  return valor;
}
const LANGS = sacarConst('LANGS');
LANGS.zht = Object.assign(JSON.parse(JSON.stringify(LANGS.zh)), sacarConst('ZHT_OVERRIDES'));
const DELAPP = Object.keys(LANGS);

console.log('=== base de conocimiento del asistente ===');

// ── 1. hay un fichero por idioma de la app ────────────────────────────
const ficheros = {};
for (const L of DELAPP) {
  const f = path.join(RAIZ, 'faq', L + '.json');
  if (!fs.existsSync(f)) { mal('falta faq/' + L + '.json y la app habla ' + L); continue; }
  ficheros[L] = JSON.parse(fs.readFileSync(f, 'utf8'));
}
// y ninguno de mas que la app no vaya a pedir nunca
for (const f of fs.readdirSync(path.join(RAIZ, 'faq'))) {
  const m = /^([a-z]{2,3})\.json$/.exec(f);
  if (m && DELAPP.indexOf(m[1]) < 0 && m[1] !== 'pl')
    mal('faq/' + f + ' es de un idioma que la app no tiene');
}
const IDIOMAS = Object.keys(ficheros);
if (!IDIOMAS.length) { console.log('  no hay ningun fichero que mirar'); process.exit(1); }

// ── 2. las mismas entradas en todos, y ninguna a medias ───────────────
const ids = ficheros[IDIOMAS[0]].e.map(e => e.id).sort();
for (const L of IDIOMAS) {
  const d = ficheros[L];
  const mios = d.e.map(e => e.id).sort();
  if (mios.join('|') !== ids.join('|')) mal(L + ': no tiene las mismas entradas que ' + IDIOMAS[0]);
  if (d.lang !== L) mal(L + ': el fichero dice lang=' + d.lang);
  const vistas = new Map();
  for (const e of d.e) {
    if (!e.l || !e.l.trim()) mal(L + '/' + e.id + ': sin rotulo');
    if (!e.a || !e.a.trim()) mal(L + '/' + e.id + ': sin respuesta');
    if (!e.k || !e.k.length)  mal(L + '/' + e.id + ': sin claves de busqueda');
    for (const k of e.k || []) {
      if (k !== k.trim().toLowerCase()) mal(L + '/' + e.id + ': la clave «' + k + '» no esta normalizada');
      if (vistas.has(k)) mal(L + ': la clave «' + k + '» esta en ' + vistas.get(k) + ' y en ' + e.id);
      vistas.set(k, e.id);
    }
    for (const f of e.f || []) if (ids.indexOf(f) < 0) mal(L + '/' + e.id + ': follow a ' + f + ', que no existe');
  }
}

/* ── 3. lo que no puede seguir en castellano ──────────────────────────
   En chino y en bulgaro salirse del castellano es siempre un error menos
   cuando es un codigo o un nombre propio (PNT 10, TITSA, Tenerife ON). Fuera
   de esos dos alfabetos la comprobacion no vale: «faro» es italiano correcto
   y «vino» tambien, y esa regla ya se probo, dio 29 avisos y ni uno bueno. */
const ESCRITURA = { zh: /[㐀-鿿]/, zht: /[㐀-鿿]/, bg: /[Ѐ-ӿ]/ };
for (const L of Object.keys(ESCRITURA)) {
  if (!ficheros[L]) continue;
  for (const e of ficheros[L].e) {
    if (!ESCRITURA[L].test(e.a)) mal(L + '/' + e.id + ': la respuesta no tiene ni un caracter de su alfabeto');
    if (!ESCRITURA[L].test(e.l)) mal(L + '/' + e.id + ': el rotulo no tiene ni un caracter de su alfabeto');
    const propias = (e.k || []).filter(k => ESCRITURA[L].test(k)).length;
    if (!propias) mal(L + '/' + e.id + ': ninguna clave en su alfabeto, nadie la va a encontrar');
  }
}

// ── 4. se llega a cada una preguntando lo que ella misma dice ─────────
const i = html.indexOf('const TG_FAQ = (function () {');
const j = html.indexOf('/*CHAT_CORE_END*/');
const modulo = html.slice(i, html.indexOf('})();', html.indexOf('categorias: function', i)) + 5);
const core = html.slice(html.indexOf('/*CHAT_CORE_START*/'), j + 17);
const ctx = { places: [], LANGS, currentLang: 'es' };
ctx.fetch = url => {
  const f = path.join(RAIZ, url);
  return Promise.resolve(fs.existsSync(f)
    ? { ok: true, json: () => Promise.resolve(JSON.parse(fs.readFileSync(f, 'utf8'))) }
    : { ok: false, json: () => Promise.resolve(null) });
};
vm.createContext(ctx);
vm.runInContext(modulo + '\n' + core + '\nthis.TG_FAQ=TG_FAQ;this.chatNorm=chatNorm;'
  + 'this.chatTokens=chatTokens;this.chatMatchKB=chatMatchKB;this.chatSinEsp=chatSinEsp;', ctx);

function preguntar(q) {
  const qn = ctx.chatNorm(q), toks = ctx.chatTokens(qn), tokset = {};
  for (const t of toks) { tokset[t] = 1; for (const v of [t.replace(/es$/, ''), t.replace(/s$/, '')]) tokset[v] = 1; }
  return ctx.chatMatchKB(' ' + qn + ' ', tokset, qn);
}

/* ── 5. ninguna base de respuestas escrita en un solo idioma ─────────────
   Hasta el 12 de octubre de 2026 el buscador miraba ademas CHAT_KB, 79
   respuestas solo en castellano, y bastaba con que una ganara por un punto
   para contestar en castellano en cualquier idioma: «Teide», «Anaga» o el
   boton «Best beaches» lo hacian. Si alguien la vuelve a meter, aqui canta. */
if (/\bCHAT_KB\s*=/.test(html)) mal('index.html vuelve a declarar CHAT_KB: una base de respuestas fuera de faq/, en un solo idioma');
const nucleo = html.slice(html.indexOf('/*CHAT_CORE_START*/'), html.indexOf('/*CHAT_CORE_END*/'));
if (/\banswer\s*:\s*['"]/.test(nucleo)) mal('el nucleo del asistente lleva respuestas escritas a mano (answer:\'…\'); van en faq/fuente/');

/* ── 6. nada igual al castellano ni al ingles ─────────────────────────
   Si a una entrada le falta un idioma y alguien la rellena copiando, todo lo
   demas da verde. Un rotulo o una respuesta identicos al castellano (o al
   ingles, fuera del ingles) es un idioma que no se ha escrito. */
const porId = L => new Map(ficheros[L].e.map(x => [x.id, x]));
if (ficheros.es && ficheros.en) {
  const ES = porId('es'), EN = porId('en');
  for (const L of IDIOMAS) {
    if (L === 'es') continue;
    for (const x of ficheros[L].e) {
      const es = ES.get(x.id), en = EN.get(x.id);
      if (es && x.a === es.a) mal(L + '/' + x.id + ': la respuesta es la del castellano');
      if (es && x.l === es.l) mal(L + '/' + x.id + ': el rotulo es el del castellano');
      if (L !== 'en' && en && x.a === en.a) mal(L + '/' + x.id + ': la respuesta es la del ingles');
      if (L !== 'en' && en && x.l === en.l) mal(L + '/' + x.id + ': el rotulo es el del ingles');
    }
  }
}

/* ── 7. los botones que cita una respuesta existen con ese nombre ─────
   Las respuestas sobre la app dicen «toca "Añadir a favoritos"». Si el boton
   cambia de nombre en un idioma y la respuesta no, el asistente manda a
   buscar un boton que no esta. Cada entrada declara en "rotulos" que textos
   de la app cita (faq/indice.json); aqui se saca cada uno de index.html, en
   cada idioma, y la respuesta tiene que contenerlo tal cual. */
const indice = JSON.parse(fs.readFileSync(path.join(RAIZ, 'faq', 'indice.json'), 'utf8')).entradas;
const ROT = require('./rotulos_app');
let rotulosMirados = 0;
for (const [id, inf] of Object.entries(indice)) {
  for (const clave of inf.rotulos || []) {
    for (const L of IDIOMAS) {
      const x = porId(L).get(id), v = ROT.valor(clave, L);
      if (!v) { mal(id + ': ' + clave + ' no existe en ' + L); continue; }
      rotulosMirados++;
      if (x && x.a.indexOf(v) < 0) mal(L + '/' + id + ': no dice «' + v + '» (' + clave + '), que es como se llama en pantalla');
    }
  }
  // y la del boton de contacto, igual en los diez
  for (const L of IDIOMAS) {
    const x = porId(L).get(id);
    if (x && !!inf.contacto !== (x.c === 1)) mal(L + '/' + id + ': el boton de contacto no coincide con el indice');
  }
}

/* Y los que cita sin declararlos. El indice dice que botones cita cada
   entrada, pero solo los que alguien apunto: el 12 de octubre de 2026 cinco
   entradas citaban una pestaña o una categoria con un nombre que no sale en
   pantalla («Tag planen» por «Plane deinen Tag», «Uitkijkpunten» por
   «Uitzichtpunten»…), y una declaraba la fila que la pantalla no pinta.
   Aqui no hace falta declarar nada: todo lo que la respuesta en castellano
   pone entre «» y es un rotulo de la app tiene que salir, en cada idioma,
   con el rotulo de ese idioma. */
const ROT_ES = new Map();
{
  const mete = (es, fila) => { if (typeof es === 'string' && es.trim().length > 1) { const k = es.trim(); if (!ROT_ES.has(k)) ROT_ES.set(k, []); ROT_ES.get(k).push(fila); } };
  for (const k in ROT.UI) { const r = ROT.UI[k]; if (r && typeof r === 'object') mete(r.es, r); }
  for (const k in ROT.LANGS.es) { const fila = {}; for (const L in ROT.LANGS) fila[L] = (ROT.LANGS[L] || {})[k]; mete(ROT.LANGS.es[k], fila); }
  /* y las tablas de los modulos con texto propio: la tarjeta de las
     notificaciones dice «Ahora no» con su propia traduccion (PUSH_TX), que
     no es la del «Ahora no» del tour. PWA_TX no: su «Instalar aplicación»
     es el boton de la app, y app-07 cita con esas mismas palabras la opcion
     del menu de Chrome, que en cada idioma se llama como Chrome la llame. */
  for (const t of ['PUSH', 'TTS', 'VIS']) {
    const tabla = (ROT.TABLAS || {})[t] || {};
    for (const k in tabla) { const r = tabla[k]; if (r && typeof r === 'object') mete(r.es, r); }
  }
}
let citadosSueltos = 0;
for (const e of (ficheros.es ? ficheros.es.e : [])) {
  for (const m of String(e.a).matchAll(/«([^»]+)»/g)) {
    const filas = ROT_ES.get(m[1].trim());
    if (!filas) continue;
    for (const L of IDIOMAS) {
      if (L === 'es') continue;
      const x = porId(L).get(e.id);
      const buenos = [...new Set(filas.map(f => f[L]).filter(v => typeof v === 'string' && v.trim()))];
      if (!x || !buenos.length) continue;
      citadosSueltos++;
      if (!buenos.some(b => x.a.indexOf(b.trim()) >= 0))
        mal(L + '/' + e.id + ': cita «' + m[1] + '» y en pantalla se llama ' + buenos.map(b => '«' + b + '»').join(' o '));
    }
  }
}

/* ── 8. las respuestas de la app de las tiendas ───────────────────────
   Dentro de la app (window.TGO_NATIVO) no hay Web Push ni service worker y
   no se instala desde el navegador: app-06, app-07 y app-29 llevan alli su
   propia respuesta ("n", de faq/fuente/nativo/respuestas.json). Que este en todos los
   idiomas y en el suyo, distinta de la de la web, sin nombrar otras
   plataformas (Apple, directriz 2.3.10: ni en la app ni en la ficha) y con
   los rotulos de la pantalla. Y mas abajo, que con la marca el asistente
   contesta con ella y sin la marca con la de la web. */
const NATIVAS = Object.keys(indice).filter(id => indice[id].nativo);
const OTRAS_PLATAFORMAS = /android|chrome|google play|play store|安卓|谷歌/i;
for (const L of IDIOMAS) for (const x of ficheros[L].e)
  if (x.n && NATIVAS.indexOf(x.id) < 0) mal(L + '/' + x.id + ': lleva respuesta de la app y faq/indice.json no lo dice');
for (const id of NATIVAS) {
  const es = porId('es').get(id), en = porId('en').get(id);
  for (const L of IDIOMAS) {
    const x = porId(L).get(id);
    if (!x || !x.n || !x.n.trim()) { mal(L + '/' + id + ': sin respuesta de la app de las tiendas'); continue; }
    if (x.n === x.a) mal(L + '/' + id + ': la respuesta de la app es la de la web');
    if (ESCRITURA[L] && !ESCRITURA[L].test(x.n)) mal(L + '/' + id + ': la respuesta de la app no tiene ni un caracter de su alfabeto');
    if (L !== 'es' && es && x.n === es.n) mal(L + '/' + id + ': la respuesta de la app es la del castellano');
    if (L !== 'es' && L !== 'en' && en && x.n === en.n) mal(L + '/' + id + ': la respuesta de la app es la del ingles');
    if (OTRAS_PLATAFORMAS.test(x.n)) mal(L + '/' + id + ': la respuesta de la app nombra otra plataforma: ' + x.n.match(OTRAS_PLATAFORMAS)[0]);
  }
  for (const m of String(es && es.n).matchAll(/«([^»]+)»/g)) {
    const filas = ROT_ES.get(m[1].trim());
    if (!filas) continue;
    for (const L of IDIOMAS) {
      if (L === 'es') continue;
      const x = porId(L).get(id);
      const buenos = [...new Set(filas.map(f => f[L]).filter(v => typeof v === 'string' && v.trim()))];
      if (!x || !x.n || !buenos.length) continue;
      citadosSueltos++;
      if (!buenos.some(b => x.n.indexOf(b.trim()) >= 0))
        mal(L + '/' + id + ': en la app cita «' + m[1] + '» y en pantalla se llama ' + buenos.map(b => '«' + b + '»').join(' o '));
    }
  }
}
const ctxN = { places: [], LANGS, currentLang: 'es', window: { TGO_NATIVO: true }, fetch: ctx.fetch };
vm.createContext(ctxN);
vm.runInContext(modulo + '\n' + core + '\nthis.TG_FAQ=TG_FAQ;this.chatNorm=chatNorm;this.chatTokens=chatTokens;this.chatMatchKB=chatMatchKB;', ctxN);
function preguntarN(q) {
  const qn = ctxN.chatNorm(q), toks = ctxN.chatTokens(qn), tokset = {};
  for (const t of toks) { tokset[t] = 1; for (const v of [t.replace(/es$/, ''), t.replace(/s$/, '')]) tokset[v] = 1; }
  return ctxN.chatMatchKB(' ' + qn + ' ', tokset, qn);
}

const otras = [];
(async () => {
  let mirado = 0, perdidas = 0;
  for (const L of IDIOMAS) {
    await ctx.TG_FAQ.cambiarA(L);
    ctx.currentLang = L;
    const pool = ctx.TG_FAQ.entradas();
    if (pool.length !== ficheros[L].e.length) { mal(L + ': TG_FAQ cargo ' + pool.length + ' de ' + ficheros[L].e.length); continue; }
    for (const e of ficheros[L].e) {
      mirado++;
      const r = preguntar(e.l);            // su propio rotulo, que es la pregunta
      if (!r) { perdidas++; mal(L + '/' + e.id + ': «' + e.l + '» no encuentra ninguna respuesta'); }
      else if (r.item.answer !== e.a) {
        /* Su rotulo es tambien el boton de seguimiento que la lleva: si lleva
           a otra entrada, ese boton contesta otra cosa. Antes se toleraba
           («se pisan de verdad») y solo se avisaba si acababa en CHAT_KB; el
           12 de octubre de 2026 eran cero, y al meter 52 entradas nuevas
           salieron cuatro, todas por claves nuevas. Desde entonces, fallo. */
        const otra = (pool.find(p => p.answer === r.item.answer) || { keys: ['?'] }).keys.slice(-1)[0];
        otras.push(L + '/' + e.id);
        mal(L + '/' + e.id + ': su boton «' + e.l + '» lleva a «' + otra + '»');
      }
    }
  }
  let nativas = 0;
  for (const L of IDIOMAS) {
    await ctxN.TG_FAQ.cambiarA(L);
    ctxN.currentLang = L;
    for (const id of NATIVAS) {
      const x = porId(L).get(id);
      if (!x) continue;
      nativas++;
      const r = preguntarN(x.l);
      if (!r || r.item.answer !== x.n) mal(L + '/' + id + ': con la marca de la app, «' + x.l + '» no contesta con la respuesta de la app');
    }
  }
  console.log('  entradas.................. ' + ids.length + ' x ' + IDIOMAS.length + ' idiomas = ' + mirado);
  console.log('  de la app de las tiendas.. ' + NATIVAS.length + ' x ' + IDIOMAS.length + ' idiomas = ' + nativas + ' (' + NATIVAS.join(' ') + ')');
  console.log('  idiomas................... ' + IDIOMAS.join(' '));
  console.log('  se llega a ellas.......... ' + (mirado - perdidas) + ' de ' + mirado);
  console.log('  su rotulo lleva a otra.... ' + otras.length + (otras.length ? '  (' + otras.slice(0, 4).join(' · ') + (otras.length > 4 ? ' …' : '') + ')' : ''));
  console.log('  botones citados, mirados.. ' + rotulosMirados);
  console.log('  y sin declarar, mirados... ' + citadosSueltos);
  console.log(fallos ? '\n' + fallos + ' fallos' : '\nbase de conocimiento en verde');
  process.exit(fallos ? 1 : 0);
})();
