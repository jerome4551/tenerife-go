#!/usr/bin/env node
/* poner_traduccion.js — mete un idioma en las filas de idioma de index.html,
 * localizando cada fila POR LO QUE DICE, no por su posicion.
 *
 *     node tools/poner_traduccion.js idiomas/ro-fuente/interfaz.json --probar   dice lo que haria
 *     node tools/poner_traduccion.js idiomas/ro-fuente/interfaz.json            lo hace
 *     node tools/poner_traduccion.js ... --estricto      ademas, para si main tiene filas
 *                                                       nuevas que el fichero no trae
 *
 * POR QUE OTRA HERRAMIENTA Y NO poner_idioma.js. Aquella empareja la fila
 * N de una tabla con el texto N de su lista: si entre la traduccion y la
 * entrega alguien cambia el castellano de una fila (o quita una y anade otra
 * en la misma tabla), los numeros cuadran y el texto entra donde no es, sin
 * aviso. Aqui cada texto lleva el castellano que traduce y la fila se busca
 * por tabla + clave + castellano; si el castellano de main ya no es ese, la
 * fila no casa y NO SE ESCRIBE NADA. Es lo mismo que ya se aprendio con las
 * huellas md5: anclar en el contenido, no en el sitio.
 *
 * El fichero (lo escribe la entrega, no se edita a mano):
 *   { "idioma": "ro",
 *     "filas": [ { "tabla", "clave", "es", "ro" } ],      la fila: tabla (nombre de la
 *              variable o «(anonima)»), clave (la propiedad que la contiene) y su
 *              castellano entero; el texto nuevo puede ser cadena, lista u objeto,
 *              con la misma forma que el castellano. {"__codigo__": "x.y"} mete
 *              codigo tal cual (la fila de getCatGroupLabel: «ro: group.labelRo»)
 *     "especiales": { "FREQ_I18N": { castellano: texto },  las frecuencias de linea
 *                     "labelRo":   { labelEs: texto } }      los rotulos labelXx
 *   }
 *
 * Cada texto entra detras de la ultima clave de su fila, con el mismo estilo
 * de clave (con o sin comillas), de atras hacia delante para que los
 * desplazamientos no se muevan. Si una fila ya tiene el idioma con ESE texto,
 * se da por puesta (se puede pasar dos veces); con otro texto, no se toca y
 * se para. Antes de escribir se vuelve a analizar cada bloque tocado: si uno
 * no compila, no se escribe nada.
 *
 * SOLO index.html, como poner_idioma.js. Los modulos y los ficheros de
 * idioma llevan sus propias entregas.
 */
'use strict';
const fs = require('fs'), path = require('path');
const acorn = require('./acorn_local');
const RAIZ = path.dirname(__dirname);
const args = process.argv.slice(2);
const FICH = args.find(a => !a.startsWith('--'));
const PROBAR = args.includes('--probar'), ESTRICTO = args.includes('--estricto');
if (!FICH) { console.error('uso: node tools/poner_traduccion.js <fichero.json> [--probar] [--estricto]'); process.exit(2); }
const D = JSON.parse(fs.readFileSync(FICH, 'utf8'));
const L = D.idioma;
if (!/^[a-z]{2,3}$/.test(L || '')) { console.error('el fichero no dice su idioma'); process.exit(2); }
const LCAP = L[0].toUpperCase() + L.slice(1);
/* "fichero": "datos/titsa.js" en el JSON: un fichero de JavaScript entero en vez de los
   <script> de index.html (las notas de linea de las guaguas viven ahi desde el 9-10-2026) */
const RUTA = path.join(RAIZ, D.fichero || 'index.html');
const ES_JS = /\.js$/.test(RUTA);

const src = fs.readFileSync(RUTA, 'utf8');
const EXENTAS = new Set([...src.matchAll(/SIN-TRADUCIR:\s*([A-Za-z_$][\w$]*)/g)].map(m => m[1]));

/* los bloques <script> en linea, como faltan_pl.js y poner_idioma.js (los que no
   compilan son trozos de un comentario que nombra <script>: se saltan igual) */
const bloques = [];
if (ES_JS) bloques.push({ ini: 0, fin: src.length, js: src });
else { const re = /<script\b([^>]*)>/gi; let m;
  while ((m = re.exec(src))) {
    if (/src=/i.test(m[1])) continue;
    if (/type=/i.test(m[1]) && !/javascript|module/i.test(m[1])) continue;
    const ini = m.index + m[0].length, fin = src.indexOf('</script>', ini);
    if (fin > 0) bloques.push({ ini, fin, js: src.slice(ini, fin) });
  } }
const linea = i => src.slice(0, i).split('\n').length;
const nombreClave = p => (p.key.name !== undefined ? p.key.name : p.key.value);

function valor(js, n) {
  if (!n) return undefined;
  if (n.type === 'Literal') return n.value;
  if (n.type === 'TemplateLiteral') {
    if (n.expressions.length) return { __plantilla__: js.slice(n.start, n.end) };
    return n.quasis.map(q => q.value.cooked).join('');
  }
  if (n.type === 'ArrayExpression') return n.elements.map(e => valor(js, e));
  if (n.type === 'ObjectExpression') {
    const o = {};
    for (const p of n.properties) {
      if (p.type !== 'Property') { o['__' + p.type + '__'] = js.slice(p.start, p.end); continue; }
      o[nombreClave(p)] = valor(js, p.value);
    }
    return o;
  }
  if (n.type === 'BinaryExpression' && n.operator === '+') {
    const a = valor(js, n.left), b = valor(js, n.right);
    if (typeof a === 'string' && typeof b === 'string') return a + b;
  }
  return { __codigo__: js.slice(n.start, n.end) };
}

/* ── las filas de idioma de index.html, con el mismo recorrido de siempre ── */
const filas = [];           // { tabla, clave, es, tiene, valorL, fin, comillas, ln, bloque }
const freq = [];            // FREQ_I18N: { es, tiene, valorL, fin, comillaSimple }
const rotulos = [];         // objetos con labelPl: { es, tiene, valorL, fin }
bloques.forEach((b, bi) => {
  let ast; try { ast = acorn.parse(b.js, { ecmaVersion: 'latest' }); } catch (e) { return; }
  (function walk(n, nom, clave) {
    if (!n || typeof n !== 'object') return;
    if (n.type === 'ObjectExpression') {
      const props = n.properties.filter(p => p.type === 'Property');
      const cl = props.map(nombreClave);
      if (cl.includes('labelPl') && cl.includes('labelEs')) {
        const pPl = props.find(p => nombreClave(p) === 'labelPl'), pL = props.find(p => nombreClave(p) === 'label' + LCAP);
        const pEs = props.find(p => nombreClave(p) === 'labelEs');
        rotulos.push({ es: valor(b.js, pEs.value), tiene: !!pL, valorL: pL ? valor(b.js, pL.value) : undefined,
                       fin: b.ini + pPl.end, ln: linea(b.ini + n.start), bloque: bi,
                       comillaSimple: b.js[pPl.value.start] === "'" });
      }
      if (cl.includes('es') && cl.includes('en') && cl.includes('fr')) {
        const t = nom || '(anonima)';
        if (!EXENTAS.has(t)) {
          const ultima = props[props.length - 1];
          const pL = props.find(p => nombreClave(p) === L);
          const iniLinea = b.js.lastIndexOf('\n', ultima.start) + 1;
          const sangria = /^[ \t]*$/.test(b.js.slice(iniLinea, ultima.start)) ? b.js.slice(iniLinea, ultima.start) : null;
          filas.push({ tabla: t, clave: clave || null, es: valor(b.js, props.find(p => nombreClave(p) === 'es').value),
                       tiene: !!pL, valorL: pL ? valor(b.js, pL.value) : undefined,
                       fin: b.ini + ultima.end, comillas: b.js[ultima.key.start] === '"' || b.js[ultima.key.start] === "'",
                       /* una fila de varias lineas con su idioma en un objeto (LANGS, AUTH_STRINGS):
                          el nuevo va en su linea y con la misma sangria, como los otros */
                       variasLineas: b.js.slice(n.start, n.end).includes('\n') && sangria !== null, sangria,
                       ln: linea(b.ini + n.start), bloque: bi });
        }
        return;
      }
    }
    /* FREQ_I18N: { 'castellano': { en, fr, …, bg } } — la clave ES el castellano */
    if (n.type === 'VariableDeclarator' && n.id && n.id.name === 'FREQ_I18N' && n.init && n.init.type === 'ObjectExpression') {
      for (const p of n.init.properties) {
        if (p.type !== 'Property' || !p.value || p.value.type !== 'ObjectExpression') continue;
        const ps = p.value.properties.filter(q => q.type === 'Property');
        const pL = ps.find(q => nombreClave(q) === L), ult = ps[ps.length - 1];
        freq.push({ es: nombreClave(p), tiene: !!pL, valorL: pL ? valor(b.js, pL.value) : undefined,
                    fin: b.ini + ult.end, ln: linea(b.ini + p.start), bloque: bi, comillaSimple: b.js[ult.value.start] === "'" });
      }
    }
    let nuevo = nom;
    if (n.type === 'VariableDeclarator' && n.id && n.id.name) nuevo = n.id.name;
    for (const k in n) {
      if (k === 'start' || k === 'end' || k === 'loc') continue;
      const v = n[k];
      const cl = (n.type === 'Property' && k === 'value') ? nombreClave(n) : (n.type === 'Property' ? clave : (n.type === 'ArrayExpression' ? clave : null));
      if (Array.isArray(v)) v.forEach((x, i) => walk(x, nuevo, n.type === 'ArrayExpression' ? (clave || '') + '[' + i + ']' : cl));
      else if (v && typeof v === 'object' && v.type) walk(v, nuevo, cl);
    }
  })(ast, null, null);
});

/* ── emparejar ─────────────────────────────────────────────────────────── */
const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const llave = (t, c, es) => t + '\u0000' + c + '\u0000' + JSON.stringify(es);
const libres = new Map();
for (const f of filas) { const k = llave(f.tabla, f.clave, f.es); if (!libres.has(k)) libres.set(k, []); libres.get(k).push(f); }

function forma(es, tr) {      // misma forma que el castellano
  if (tr && typeof tr === 'object' && !Array.isArray(tr) && tr.__codigo__ !== undefined) return es && es.__codigo__ !== undefined;
  if (typeof es === 'string') return typeof tr === 'string';
  if (Array.isArray(es)) return Array.isArray(tr) && tr.length === es.length && es.every((x, i) => forma(x, tr[i]));
  if (es && typeof es === 'object') {
    if (!tr || typeof tr !== 'object' || Array.isArray(tr)) return false;
    const a = Object.keys(es).sort(), b = Object.keys(tr).sort();
    return igual(a, b) && a.every(k => forma(es[k], tr[k]));
  }
  return igual(es, tr);
}
function literal(v, simple) {
  if (v && typeof v === 'object' && !Array.isArray(v) && v.__codigo__ !== undefined) return v.__codigo__;
  if (typeof v === 'string' && simple) return "'" + v.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n') + "'";
  return JSON.stringify(v);
}

const errores = [], insertar = [];
let yaEstaban = 0;
for (const e of D.filas || []) {
  if (!forma(e.es, e.ro)) { errores.push(`${e.tabla}/${e.clave}: el texto no tiene la forma de su castellano`); continue; }
  const cola = libres.get(llave(e.tabla, e.clave, e.es));
  if (!cola || !cola.length) { errores.push(`${e.tabla}/${e.clave}: no hay en index.html ninguna fila con ese castellano (¿ha cambiado?): ${JSON.stringify(e.es).slice(0, 90)}`); continue; }
  const f = cola.shift();
  if (f.tiene) {
    if (igual(f.valorL, e.ro)) { yaEstaban++; continue; }
    errores.push(`${e.tabla}/${e.clave} (L${f.ln}): ya tiene ${L} con otro texto; no se pisa`); continue;
  }
  const clave = (f.comillas ? JSON.stringify(L) : L);
  const esObjeto = e.ro && typeof e.ro === 'object' && e.ro.__codigo__ === undefined;
  const txt = (f.variasLineas && esObjeto)
    ? ',\n' + f.sangria + clave + ': ' + JSON.stringify(e.ro, null, 2).split('\n').join('\n' + f.sangria)
    : ', ' + clave + ': ' + literal(e.ro, false);
  if (/<\/script/i.test(txt)) { errores.push(`${e.tabla}/${e.clave}: el texto trae «</script»`); continue; }
  insertar.push({ fin: f.fin, txt, bloque: f.bloque });
}
const sinTexto = filas.filter(f => !f.tiene && !insertar.some(i => i.fin === f.fin));

const ESP = D.especiales || {};
let freqN = 0, rotN = 0;
if (ESP.FREQ_I18N) {
  const porEs = new Map(freq.map(f => [f.es, f]));
  for (const [es, tr] of Object.entries(ESP.FREQ_I18N)) {
    const f = porEs.get(es);
    if (!f) { errores.push(`FREQ_I18N: no hay frecuencia «${es}» en index.html`); continue; }
    if (f.tiene) { if (f.valorL === tr) { yaEstaban++; continue; } errores.push(`FREQ_I18N «${es}»: ya tiene ${L} con otro texto`); continue; }
    insertar.push({ fin: f.fin, txt: ', ' + L + ': ' + literal(tr, f.comillaSimple), bloque: f.bloque }); freqN++;
  }
  const faltan = freq.filter(f => !f.tiene && !(f.es in ESP.FREQ_I18N));
  if (faltan.length) sinTexto.push(...faltan.map(f => ({ tabla: 'FREQ_I18N', clave: f.es, ln: f.ln })));
}
if (ESP['label' + LCAP]) {
  const T = ESP['label' + LCAP];
  for (const r of rotulos) {
    if (!(r.es in T)) { sinTexto.push({ tabla: 'label' + LCAP, clave: r.es, ln: r.ln }); continue; }
    if (r.tiene) { if (r.valorL === T[r.es]) { yaEstaban++; continue; } errores.push(`label${LCAP} «${r.es}» (L${r.ln}): ya tiene otro texto`); continue; }
    insertar.push({ fin: r.fin, txt: ', label' + LCAP + ': ' + literal(T[r.es], r.comillaSimple), bloque: r.bloque }); rotN++;
  }
  const usados = new Set(rotulos.map(r => r.es));
  for (const es of Object.keys(T)) if (!usados.has(es)) errores.push(`label${LCAP}: no hay rotulo «${es}» en index.html`);
}

console.log(`filas de idioma en ${path.relative(RAIZ, RUTA)}: ${filas.length} (exentas: ${[...EXENTAS].join(', ')})`);
console.log(`textos a meter: ${insertar.length} (${insertar.length - freqN - rotN} filas, ${freqN} frecuencias, ${rotN} rotulos label${LCAP}) · ya estaban: ${yaEstaban}`);
if (sinTexto.length) {
  console.log(`\nFILAS SIN ${L.toUpperCase()} QUE EL FICHERO NO TRAE (${sinTexto.length}): caen al ingles hasta que se traduzcan`);
  for (const f of sinTexto.slice(0, 60)) console.log(`  L${f.ln}  ${f.tabla}/${f.clave}`);
  if (sinTexto.length > 60) console.log('  …');
  if (ESTRICTO) errores.push(sinTexto.length + ' filas sin texto (--estricto)');
}
if (errores.length) {
  console.error('\n' + errores.map(e => '  ✗ ' + e).join('\n'));
  console.error(`\n${errores.length} problema(s): no se ha escrito nada`);
  process.exit(1);
}

/* ── escribir: de atras hacia delante, y comprobando que cada bloque compila ── */
insertar.sort((a, b) => b.fin - a.fin);
let out = src;
for (const ins of insertar) out = out.slice(0, ins.fin) + ins.txt + out.slice(ins.fin);
function compilan(t) {          // cuantos bloques <script> en linea compilan
  if (ES_JS) { try { acorn.parse(t, { ecmaVersion: 'latest' }); return 1; } catch (e) { return 0; } }
  const re = /<script\b([^>]*)>/gi; let m, n = 0;
  while ((m = re.exec(t))) {
    if (/src=/i.test(m[1])) continue;
    if (/type=/i.test(m[1]) && !/javascript|module/i.test(m[1])) continue;
    const ini = m.index + m[0].length, fin = t.indexOf('</script>', ini);
    try { acorn.parse(t.slice(ini, fin), { ecmaVersion: 'latest' }); n++; } catch (e) { /* trozo de comentario */ }
  }
  return n;
}
{ const antes = compilan(src), despues = compilan(out);
  if (despues !== antes) { console.error(`compilaban ${antes} bloques y ahora ${despues}: no se ha escrito nada`); process.exit(1); }
  console.log(`bloques <script> que compilan: ${antes} antes y ${despues} despues`); }
if (PROBAR) { console.log('\n--probar: todo casa; no se ha escrito nada'); process.exit(0); }
fs.writeFileSync(RUTA, out);
console.log(`\n${path.relative(RAIZ, RUTA)}: ${insertar.length} textos en ${L} (${Buffer.byteLength(src)} -> ${Buffer.byteLength(out)} bytes)`);
