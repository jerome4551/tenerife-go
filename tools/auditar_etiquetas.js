#!/usr/bin/env node
/* auditar_etiquetas.js — los chips del globo, en los nueve idiomas.
 *
 * Los `tags` de cada ficha salen debajo del nombre en el globo del mapa y
 * son texto suelto dentro de un array, no un objeto {es:..., en:...}. Por
 * eso ningun control los miraba, y estuvieron 593 etiquetas en castellano
 * para todo el mundo: en bulgaro el globo decia "Уебкамера на живо" y justo
 * debajo "Webcam · En directo · Teide".
 *
 * REGLA: cada etiqueta distinta tiene que estar traducida en los ocho
 * ficheros, O declarada en idiomas/etiquetas-sin-traducir.json con su
 * motivo, O ser reconocible sola como nombre de sitio del propio catalogo.
 * Lo que no encaje en ninguna de las tres, se canta.
 *
 * SE GUARDA TAMBIEN LO QUE SE ESCRIBE IGUAL. Al principio no: si el italiano
 * decia "Cala" como el castellano, se omitia la fila. Y entonces el hueco
 * tenia dos lecturas -"se escribe igual" y "se me olvido"- que es justo lo
 * que un control no puede permitirse. Ahora falta = falta.
 * Lo que no lleva fila son los nombres de sitio y las marcas, que se
 * reconocen solos o van declarados aparte con su motivo.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const LISTA = process.argv.indexOf('--lista') !== -1;

const src = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');

/* Los idiomas salen del fuente, no de una lista escrita aqui. Esta lista
   decia ['en','fr','de','it','nl','zh','zht','bg'] y el dia que entro un
   idioma nuevo el control siguio dando verde sin haberlo mirado, que es
   exactamente lo que este fichero existe para impedir. Se leen los de
   SUPPORTED_LANGS -el castellano no, que es el original contra el que se
   mide- incluidos los que todavia estan a medias: un idioma a medias no se
   ofrece, pero sus etiquetas se vigilan igual mientras se escriben. */
const IDI = ((src.match(/SUPPORTED_LANGS\s*=\s*\[([^\]]*)\]/) || [, ''])[1])
  .split(',').map(x => x.trim().replace(/^['"]|['"]$/g, ''))
  .filter(l => l && l !== 'es');
if (!IDI.length) { console.error('no se encuentra SUPPORTED_LANGS en index.html'); process.exit(2); }
const i = src.indexOf('const places = ['), o = src.indexOf('[', i);
let d = 0, q = null, fin = 0;
for (let k = o; k < src.length; k++) {
  const c = src[k], p = src[k - 1];
  if (q) { if (c === q && p !== '\\') q = null; continue; }
  if (c === '"' || c === "'" || c === '`') { q = c; continue; }
  if (c === '[') d++; else if (c === ']') { d--; if (d === 0) { fin = k + 1; break; } }
}
const PLACES = eval('(' + src.slice(o, fin) + ')');

/* los nombres de sitio salen del propio catalogo, como en auditar_idioma.js */
const LUGARES = new Set();
for (const p of PLACES) {
  if (p.cat && typeof p.cat.es === 'string') {
    const t = p.cat.es.split(/[·()]/).map(x => x.trim()).filter(Boolean);
    for (const x of t.slice(1)) LUGARES.add(x);
  }
}
/* NO VALE "todas sus palabras salen en algun nombre de ficha". Se probo y
   era demasiado ancho: "Casa del Vino" hacia que "Vino" pasara por nombre
   propio, y con el "Museo" de "Museo Etnografico", la "Farmacia" de
   "Farmacia Anaga" y la "Webcam" de "Webcam Teide" igual. Doscientas
   cuarenta y tres etiquetas corrientes se colaban como si fueran sitios, y
   el control las daba por buenas sin haberlas mirado. Ahora solo cuenta
   como sitio lo que el catalogo nombra COMO zona: el municipio o el barrio
   que va detras del punto volado en `cat`. Todo lo demas, o se traduce o se
   declara. */
const esSitio = t => LUGARES.has(t);

const cuenta = new Map();
for (const p of PLACES) for (const t of (p.tags || [])) cuenta.set(t, (cuenta.get(t) || 0) + 1);

const TAB = {};
let sinFichero = [];
for (const l of IDI) {
  const f = path.join(RAIZ, 'idiomas', 'etiquetas', l + '.json');
  if (!fs.existsSync(f)) { sinFichero.push(l); continue; }
  TAB[l] = JSON.parse(fs.readFileSync(f, 'utf8'));
}
const declarado = new Set();
const fDecl = path.join(RAIZ, 'idiomas', 'etiquetas-sin-traducir.json');
if (fs.existsSync(fDecl)) {
  const D = JSON.parse(fs.readFileSync(fDecl, 'utf8'));
  for (const motivo of Object.keys(D)) for (const t of D[motivo]) declarado.add(t);
}

const P = (t, v) => console.log('  ' + String(t).padEnd(44, '.') + ' ' + v);
console.log('=== etiquetas del globo ===');
P('etiquetas distintas', cuenta.size);
P('apariciones en las fichas', [...cuenta.values()].reduce((a, b) => a + b, 0));
if (sinFichero.length) { P('FICHEROS QUE FALTAN', sinFichero.join(' ')); process.exitCode = 1; }

let sitio = 0, decl = 0, trad = 0;
const huecos = [], acortos = [];
for (const [t] of cuenta) {
  if (declarado.has(t)) { decl++; continue; }
  if (esSitio(t)) { sitio++; continue; }
  const faltan = IDI.filter(l => TAB[l] && !TAB[l][t]);
  if (faltan.length === IDI.length) { huecos.push(t); continue; }
  if (faltan.length) { acortos.push(t + '  (sin ' + faltan.join(' ') + ')'); continue; }
  trad++;
}
P('reconocidas solas como nombre de sitio', sitio);
P('declaradas sin traducir, con motivo', decl);
P('traducidas en los ' + IDI.length + ' idiomas', trad);
P('SIN TRADUCIR Y SIN DECLARAR', huecos.length);
P('traducidas a medias', acortos.length);
if (LISTA || huecos.length || acortos.length) {
  (LISTA ? huecos : huecos.slice(0, 40)).forEach(t => console.log('     falta entera: ' + t));
  (LISTA ? acortos : acortos.slice(0, 40)).forEach(t => console.log('     a medias:     ' + t));
}

/* UNA FILA QUE SE QUEDA EN CASTELLANO. Que la fila exista no basta: alguien
   puede pegar el castellano y el control daria verde. Y no vale prohibirlo a
   secas, porque "Bar", "Cala" o "Camping" se escriben igual de verdad en
   varios idiomas.
   La regla que si distingue las dos cosas no necesita declarar nada:
     - en chino y bulgaro, que no usan el alfabeto latino, dejar el castellano
       es SIEMPRE un olvido, salvo un codigo como "4x4" o "BMX";
     - en los cinco de alfabeto latino NO SE PUEDE COMPROBAR, y se probo.
       La idea era: si otro idioma latino la tradujo y este la dejo igual, es
       que se la olvido. Sale mal por el italiano, que comparte con el
       castellano media lengua: "faro", "costa", "vino", "cresta", "alto",
       "remoto" y "religioso" son italiano correcto y la regla los cantaba
       todos, junto con "Bus" en ingles, aleman y neerlandes, "Zoo" en tres,
       "Marina" en cuatro y "Lava" en dos. Veintinueve avisos y ni uno bueno.
       Una regla que no distingue un prestamo de un olvido no se queda. */
const OTROS = ['zh', 'zht', 'bg'];
const CODIGOS = /^[\d.,x+]+$|^[A-Z]{2,4}$|^[A-Z]{2,4}[\s-]?\d/;
const enCastellano = [];
for (const [t] of cuenta) {
  if (declarado.has(t) || esSitio(t)) continue;
  if (CODIGOS.test(t)) continue;
  for (const l of OTROS) if (TAB[l] && TAB[l][t] === t) enCastellano.push(l + ': ' + t);
}
P('se quedan en castellano', enCastellano.length);
if (enCastellano.length) {
  (LISTA ? enCastellano : enCastellano.slice(0, 40)).forEach(x => console.log('     ' + x));
  process.exitCode = 1;
}

/* y al reves: una fila en el fichero que ya no use ninguna ficha solo sirve
   para engordar lo que se descarga */
let sobran = 0;
for (const l of IDI) if (TAB[l]) for (const t of Object.keys(TAB[l])) if (!cuenta.has(t)) sobran++;
P('filas que ya no usa ninguna ficha', sobran);

if (huecos.length || acortos.length || sinFichero.length) process.exitCode = 1;
