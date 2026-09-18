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
        /* Que caiga en otra entrada del FAQ no siempre es un fallo: «¿Qué ver
           en La Laguna?» y «¿Qué pueblos bonitos hay?» se pisan de verdad. Se
           avisa solo si acaba en CHAT_KB, que esta en castellano, porque eso
           si deja al usuario sin su idioma. */
        const esDelFaq = pool.some(p => p.answer === r.item.answer);
        if (!esDelFaq) { perdidas++; mal(L + '/' + e.id + ': «' + e.l + '» acaba en CHAT_KB, en castellano'); }
      }
    }
  }
  console.log('  entradas.................. ' + ids.length + ' x ' + IDIOMAS.length + ' idiomas = ' + mirado);
  console.log('  idiomas................... ' + IDIOMAS.join(' '));
  console.log('  se llega a ellas.......... ' + (mirado - perdidas) + ' de ' + mirado);
  console.log(fallos ? '\n' + fallos + ' fallos' : '\nbase de conocimiento en verde');
  process.exit(fallos ? 1 : 0);
})();
