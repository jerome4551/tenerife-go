#!/usr/bin/env node
/* barrido_idiomas.js — TODA fila de idioma del fuente, viva donde viva.
 *
 * POR QUE HACE FALTA ADEMAS DE inventario_idiomas.js:
 * el inventario busca "const NOMBRE = {", asi que solo ve tablas con nombre.
 * No ve las filas metidas dentro de listas: GL_DATA (el glosario canario),
 * VIS_BADGES, SUMMIT... ni las de places[]. Anadir el bulgaro dio verde en el
 * inventario con el glosario entero sin traducir. Aqui se recorre el fichero
 * de una pasada y se recoge todo objeto que tenga los ocho idiomas base como
 * claves directas, tenga nombre o no.
 *
 * SE BUSCA POR `es`, NO POR `zht`. Buscar por zht parecia mas comodo -es el
 * ultimo de los ocho- pero dejaba fuera justo las filas que hay que
 * encontrar: una fila a la que le falte zht no tiene zht, asi que el control
 * no la veia ni como completa ni como hueco. Con eso, 107 horarios de lugar
 * daban verde en los ocho idiomas teniendo 84 sin chino y 33 sin italiano ni
 * neerlandes. Toda fila de idioma tiene `es`, porque el castellano es el
 * original.
 *
 *     node tools/barrido_idiomas.js            reparto de todas las filas
 *     node tools/barrido_idiomas.js bg         que le falta a ese idioma
 *     node tools/barrido_idiomas.js bg --lista donde estan los huecos
 */
'use strict';
const fs = require('fs');
const path = require('path');
const src = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const IDI_BASE = ['es','en','fr','de','it','nl','zh','zht'];
const IDI = IDI_BASE.concat(['bg']);
const OBJ = process.argv[2] && process.argv[2][0] !== '-' ? process.argv[2] : null;
const LISTA = process.argv.indexOf('--lista') !== -1;

/* SE ANALIZA EL JAVASCRIPT DE VERDAD, no se cuentan llaves.
   Antes esto era una pasada hacia delante con una pila de llaves, saltando
   lo que hubiera entre comillas. Parecia suficiente y no lo era: en
   `.replace(/"/g, '&quot;')` la comilla que va DENTRO de la expresion
   regular abria una cadena que no se cerraba hasta la siguiente comilla,
   7.849 caracteres mas alla. Con las plantillas de acento invertido pasaba
   lo mismo y peor: un salto se comio 97.094 caracteres de un tirón.
   Resultado: el barrido no veia MAR_COSTAS, MAR_NIVELES, MC_ZONES ni las
   descripciones de las fiestas, y daba "sin bg: 0" sobre 419 filas cuando
   las filas eran 515 y a 93 les faltaba el bulgaro. Verde sobre lo que no
   habia mirado, que es el peor resultado que puede dar un control.
   acorn viene con eslint, que ya esta instalado; si no estuviera, esto
   tiene que REVENTAR, no seguir a ojo. */
let acorn;
try { acorn = require('/opt/node22/lib/node_modules/eslint/node_modules/acorn'); }
catch (e) {
  console.error('no se encuentra acorn. Sin analizador no se puede barrer este');
  console.error('fichero: contar llaves a mano ya dio verde sobre lo que no miraba.');
  process.exit(2);
}

const linea = i => src.slice(0, i).split('\n').length;

/* cada <script> propio del fichero; los de type que no sea JavaScript
   -el ld+json de la cabecera- no se analizan, y se dice cuantos son. */
const bloques = [];
{
  const re = /<script\b([^>]*)>/gi;
  let m, otros = 0;
  while ((m = re.exec(src))) {
    const attrs = m[1];
    const ini = m.index + m[0].length;
    const fin = src.indexOf('</script>', ini);
    if (fin < 0) continue;
    re.lastIndex = fin;
    if (/\bsrc\s*=/i.test(attrs)) continue;
    const tipo = (attrs.match(/type\s*=\s*["']([^"']+)["']/i) || [])[1];
    if (tipo && !/^(text|application)\/(java|ecma)script$|^module$/i.test(tipo)) { otros++; continue; }
    bloques.push({ ini, fin });
  }
  if (otros) console.log('  (' + otros + ' bloque(s) <script> que no son JavaScript, no se analizan)');
}

/* las filas: todo objeto literal con una clave `es` de texto */
const crudas = [];
for (const b of bloques) {
  const code = src.slice(b.ini, b.fin);
  let ast;
  try { ast = acorn.parse(code, { ecmaVersion: 'latest', sourceType: 'script' }); }
  catch (e) {
    console.error('NO SE PUDO ANALIZAR el <script> de la linea ' + linea(b.ini) + ': ' + e.message);
    process.exitCode = 1;
    continue;
  }
  (function anda(n) {
    if (!n || typeof n !== 'object') return;
    if (Array.isArray(n)) { n.forEach(anda); return; }
    if (n.type === 'ObjectExpression') {
      const claves = new Map();
      for (const p of n.properties) {
        if (p.type !== 'Property' || p.computed) continue;
        const k = p.key.type === 'Identifier' ? p.key.name
                : (p.key.type === 'Literal' ? String(p.key.value) : null);
        if (k) claves.set(k, p.value);
      }
      const v = claves.get('es');
      if (v) {
        const texto = v.type === 'Literal' && typeof v.value === 'string' ? v.value
                    : (v.type === 'TemplateLiteral' && !v.expressions.length ? v.quasis[0].value.cooked : null);
        /* con un solo idioma no es una fila de idioma: es un objeto que
           casualmente tiene una clave `es`. Con dos ya hay traduccion que
           vigilar. Y si el valor de `es` es un objeto, esto es una TABLA
           entera "por idioma" -LANGS, UI_TX-, de la que se ocupa
           inventario_idiomas.js, que sabe mirar clave a clave. */
        if (texto !== null) {
          const val = {};
          for (const l of IDI) if (claves.has(l)) {
            const x = claves.get(l);
            val[l] = x.type === 'Literal' ? x.value
                   : (x.type === 'TemplateLiteral' && !x.expressions.length ? x.quasis[0].value.cooked : '');
          }
          if (Object.keys(val).length >= 2) crudas.push({ ini: b.ini + n.start, fin: b.ini + n.end, v: val });
        }
      }

      /* SEGUNDA FORMA DE FILA: el idioma en el SUFIJO de la clave.
         Las 23 categorias del mapa y los 11 grupos del panel de filtros no
         escriben {es:…, en:…} sino {labelEs:…, labelEn:…, labelZht:…}. Este
         barrido buscaba `es` como clave directa, asi que esas 34 filas no las
         veia ninguna herramienta de idioma: estaban completas por casualidad
         -nadie las tocaba- y el idioma decimo las dejo al descubierto, con un
         `pl: "?"` literal que habria salido en el menu del mapa.
         Se reconoce cualquier base, no solo `label`: si manana alguien
         escribe tituloEs/tituloEn, esto lo ve el primer dia. */
      {
        const fam = new Map();
        for (const [k, valor] of claves) {
          const m = /^(.+?)(Zht|Es|En|Fr|De|It|Nl|Zh|Bg|Pl)$/.exec(k);
          if (!m) continue;
          const base = m[1], suf = m[2].toLowerCase();
          if (IDI.indexOf(suf) < 0) continue;
          if (!fam.has(base)) fam.set(base, {});
          const x = valor;
          fam.get(base)[suf] = x.type === 'Literal' ? x.value
                             : (x.type === 'TemplateLiteral' && !x.expressions.length ? x.quasis[0].value.cooked : '');
        }
        for (const [base, val] of fam) {
          if (val.es === undefined || Object.keys(val).length < 2) continue;
          if (typeof val.es !== 'string') continue;
          crudas.push({ ini: b.ini + n.start, fin: b.ini + n.end, v: val, sufijo: base });
        }
      }
    }
    for (const k of Object.keys(n)) if (k !== 'type' && k !== 'start' && k !== 'end') anda(n[k]);
  })(ast);
}

/* EXCEPCIONES DECLARADAS EN EL PROPIO FUENTE.
   Hay una tabla que NO se traduce y no es un descuido: los titulos exactos de
   articulo de Wikipedia. Un titulo inventado no devuelve el articulo. En vez
   de llevar esa lista dentro de la herramienta -donde envejece y nadie la ve-
   la excepcion se declara al lado de la tabla con un comentario
   "SIN-TRADUCIR: <nombre>", y aqui se lee. Asi el que lee el codigo ve por
   que, y el control no canta lobo cada vez que se ejecuta. */
const exentas = [];
for (const m of src.matchAll(/SIN-TRADUCIR:\s*([A-Za-z_$][\w$]*)/g)) {
  const re = new RegExp('(?:const|let|var)\\s+' + m[1].replace(/\$/g, '\\$') + '\\s*=\\s*\\{', 'g');
  let d;
  while ((d = re.exec(src))) {
    const abre = re.lastIndex - 1;
    /* hasta donde llega esa tabla: la fila mas lejana que empiece dentro */
    const dentro = crudas.filter(c => c.ini > abre).sort((a, b) => a.ini - b.ini);
    if (!dentro.length) continue;
    let fin = abre;
    for (const c of dentro) { if (c.ini - fin > 4000) break; fin = c.fin; }
    exentas.push({ nom: m[1], ini: abre, fin });
  }
}
const esExenta = o => exentas.some(e => o.ini >= e.ini && o.fin <= e.fin);
const filas = crudas.map(c => ({ ini: c.ini, fin: c.fin, v: c.v, l: linea(c.ini) }))
                    .sort((a, b) => a.ini - b.ini);

/* de que parte del fichero es cada fila: places[] es el grueso y se mide aparte */
const iniPlaces = src.search(/(?:const|let|var)\s+places\s*=\s*\[/);
const finPlaces = iniPlaces < 0 ? -1 : (function () {
  let d = 0;
  for (let k = src.indexOf('[', iniPlaces); k < src.length; k++) {
    const c = src[k];
    if (c === '"' || c === "'" || c === '`') { const q = c; for (k++; k < src.length; k++) { if (src[k] === '\\') { k++; continue; } if (src[k] === q) break; } continue; }
    if (c === '[') d++; else if (c === ']') { d--; if (!d) return k; }
  }
  return -1;
})();
const zona = f => (iniPlaces >= 0 && f.ini > iniPlaces && f.fin < finPlaces) ? 'places[]' : 'interfaz';

const por = { 'places[]': { n: 0, sin: 0 }, 'interfaz': { n: 0, sin: 0 } };
const huecos = [];
for (const f of filas) {
  const z = zona(f); por[z].n++;
  if (OBJ && f.v[OBJ] === undefined && !esExenta(f)) { por[z].sin++; huecos.push({ z, l: f.l, es: String(f.v.es).slice(0, 60) }); }
}
const P = (t, v) => console.log('  ' + String(t).padEnd(40, '.') + ' ' + v);
console.log('=== filas de idioma en todo index.html ===');
P('total', filas.length);
/* Lo que antes no se veia: filas a las que les falta uno de los OCHO base.
   No es cosa del idioma nuevo; son huecos que llevaban ahi desde antes. */
const cojas = filas.filter(f => !IDI_BASE.every(l => f.v[l] !== undefined) && !esExenta(f));
P('a las que les falta un idioma base', cojas.length);
if (exentas.length) {
  const dentroExentas = filas.filter(esExenta).length;
  P('exentas por declaracion en el fuente', dentroExentas + '   (' + [...new Set(exentas.map(e => e.nom))].join(', ') + ')');
}
if (cojas.length) {
  const por = {};
  cojas.forEach(f => {
    IDI_BASE.forEach(l => { if (f.v[l] === undefined) por[l] = (por[l] || 0) + 1; });
  });
  console.log('      ' + IDI_BASE.filter(l => por[l]).map(l => l + ': ' + por[l]).join(' · '));
}
for (const z of ['interfaz', 'places[]'])
  P(z, por[z].n + (OBJ ? '   sin ' + OBJ + ': ' + por[z].sin : ''));

/* ── LO QUE YA NO ESTA EN ESTE FICHERO ────────────────────────────────────
   Los ocho idiomas de places[] viven en idiomas/*.json. Esta herramienta
   barre index.html, asi que al mudarlos paso de mirar 2.160 filas a mirar
   419 Y DIO VERDE: no porque estuviera bien, sino porque lo que faltaba
   habia salido de su vista. Un control que aprueba lo que ya no mira da
   permiso para seguir, que es el peor resultado posible.
   Asi que la cuenta se completa aqui, leyendo los ficheros, y si no estan
   se dice en voz alta en vez de callar. El detalle -que falta y donde- lo
   mira tools/auditar_idiomas_fuera.js. */
let fuera = 0, sinFichero = [];
{
  const dir = path.join(__dirname, '..', 'idiomas');
  const IDI_FUERA = IDI_BASE.filter(l => l !== 'es').concat(['bg']);
  for (const l of [...new Set(IDI_FUERA)]) {
    const f = path.join(dir, l + '.json');
    if (!fs.existsSync(f)) { sinFichero.push(l); continue; }
    try {
      const d = JSON.parse(fs.readFileSync(f, 'utf8'));
      if (l === (OBJ || 'en')) for (const id in d) fuera += Object.keys(d[id]).length;
    } catch (e) { sinFichero.push(l + '(ilegible)'); }
  }
  P('filas de places[] que viven en idiomas/*.json', fuera);
  if (sinFichero.length) P('FICHEROS DE IDIOMA QUE FALTAN', sinFichero.join(' '));
  P('total mirado, dentro y fuera', filas.length + fuera);
}

if (OBJ) {
  const sin = por['interfaz'].sin + por['places[]'].sin;
  P('completas en ' + OBJ, filas.length - sin + fuera);
  if (LISTA) huecos.forEach(h => console.log('   ' + h.z.padEnd(9) + ' linea ' + String(h.l).padStart(6) + '  ' + h.es));
  process.exitCode = (por['interfaz'].sin || cojas.length || sinFichero.length) ? 1 : 0;
}
