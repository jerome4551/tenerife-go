#!/usr/bin/env node
/* auditar_fuente_pl.js — que el polaco por bloques y idiomas/pl.json digan lo mismo.
 *
 *     node tools/auditar_fuente_pl.js
 *
 * POR QUE EXISTE
 *   El polaco es el unico idioma que se escribio por bloques: `idiomas/
 *   pl-lugares/01.json` a `08.json`, que se juntan con
 *       node tools/lugares_idioma.js montar pl
 *   para producir `idiomas/pl.json`. Es decir, pl-lugares NO es una copia de
 *   consulta: es la FUENTE, y montar la vuelca encima del fichero que lee la
 *   app.
 *
 *   Entre septiembre y este parche se corrigieron doce fichas tocando solo
 *   `pl.json`. La fuente se quedo con el texto viejo, asi que el dia que
 *   alguien volviera a montar el polaco, las doce volvian atras: Tabaiba y
 *   Radazul otra vez en Santa Cruz, el mirador otra vez en Santiago del
 *   Teide, la CAVIS otra vez en Santa Cruz. Y sin ruido: la app no falla
 *   cuando un texto es correcto pero viejo.
 *
 * QUE COMPRUEBA
 *   1. Ninguna ficha de pl.json falta en la fuente, y al reves.
 *   2. Cada `desc` y cada `cat` dicen exactamente lo mismo en las dos.
 *   3. Ninguna ficha esta repetida en dos bloques.
 *
 * LO QUE NO MIRA
 *   `idiomas/pl-fuente/` es otra cosa: los textos de INTERFAZ en polaco,
 *   guardados para poder revisarlos fuera del HTML. Ninguna herramienta lo
 *   lee ni lo vuelca en index.html, asi que no puede deshacer nada. Se avisa
 *   aparte de cuanto se ha quedado atras, pero no suspende.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const DIR = path.join(RAIZ, 'idiomas', 'pl-lugares');
const CAMPOS = ['desc', 'cat', 'hours', 'aviso'];

let fallos = 0;
const mal = m => { console.log('  FALLO: ' + m); fallos++; };

console.log('=== el polaco por bloques contra idiomas/pl.json ===');

const pl = JSON.parse(fs.readFileSync(path.join(RAIZ, 'idiomas', 'pl.json'), 'utf8'));
const junto = {}, deQue = {};
for (const f of fs.readdirSync(DIR).sort()) {
  if (!/\.json$/.test(f)) continue;
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  for (const id in d) {
    if (junto[id]) mal(`${id} esta en ${deQue[id]} y tambien en ${f}`);
    junto[id] = d[id]; deQue[id] = f;
  }
}
const P = t => console.log('  ' + String(t[0]).padEnd(46, '.') + ' ' + t[1]);
P(['bloques', fs.readdirSync(DIR).filter(f => /\.json$/.test(f)).length]);
P(['fichas en la fuente', Object.keys(junto).length]);
P(['fichas en idiomas/pl.json', Object.keys(pl).length]);

const faltan = Object.keys(pl).filter(id => !junto[id]);
const sobran = Object.keys(junto).filter(id => !pl[id]);
if (faltan.length) mal(`${faltan.length} ficha(s) de pl.json que la fuente no tiene: ${faltan.slice(0, 6).join(', ')}`);
if (sobran.length) mal(`${sobran.length} ficha(s) en la fuente que pl.json no tiene: ${sobran.slice(0, 6).join(', ')}`);

const distintos = [];
for (const id of Object.keys(pl)) {
  if (!junto[id]) continue;
  for (const c of CAMPOS) {
    const a = pl[id][c], b = junto[id][c];
    if (a === undefined && b === undefined) continue;
    if (String(a === undefined ? '' : a) !== String(b === undefined ? '' : b))
      distintos.push(`${id}.${c}  (${deQue[id]})`);
  }
}
if (distintos.length) {
  mal(`${distintos.length} texto(s) que no dicen lo mismo:`);
  distintos.slice(0, 20).forEach(x => console.log('           ' + x));
  console.log('         se arreglan copiando pl.json a su bloque, no al reves:');
  console.log('         la fuente es lo que manda cuando se vuelva a montar.');
} else {
  P(['textos comparados', Object.keys(pl).length * 2]);
  P(['todos dicen lo mismo', 'si']);
}

/* Aviso, no puerta: pl-fuente no lo lee ninguna herramienta. */
const FUENTE_UI = path.join(RAIZ, 'idiomas', 'pl-fuente');
if (fs.existsSync(FUENTE_UI)) {
  const src = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
  let sinRespaldo = 0, ficheros = 0;
  for (const f of fs.readdirSync(FUENTE_UI)) {
    if (!/\.json$/.test(f)) continue;
    ficheros++;
    let d; try { d = JSON.parse(fs.readFileSync(path.join(FUENTE_UI, f), 'utf8')); } catch (e) { continue; }
    const claves = Array.isArray(d) ? [] : Object.keys(d);
    for (const k of claves) if (!src.includes(k)) sinRespaldo++;
  }
  console.log(`  aviso: idiomas/pl-fuente/ son ${ficheros} ficheros de interfaz que NO lee`);
  console.log(`         ninguna herramienta; ${sinRespaldo} clave(s) suya(s) ya no estan en`);
  console.log('         index.html. No puede deshacer nada, por eso no suspende.');
}

console.log(fallos === 0 ? '  OK' : `  ${fallos} fallo(s)`);
process.exit(fallos ? 1 : 0);
