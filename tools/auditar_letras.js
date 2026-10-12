#!/usr/bin/env node
/* Palabras escritas sin sus letras: «waehle» por «wähle», «Menue» por «Menü»,
 * «carre avec fleche» por «carré avec flèche». El 12 de octubre de 2026 el
 * cuadro de «Instalar la app» estaba asi en aleman y en frances, a la vista
 * de cualquiera, y ningun control lo veia: no es castellano (castellano_suelto
 * no lo busca) y la fila tenia todos sus idiomas (los barridos la daban por
 * buena). Se escribio sin acentos «para evitar problemas de codificacion»,
 * que el fichero no tiene: es UTF-8 de arriba abajo.
 *
 * No adivina: busca formas que no existen en ningun idioma de la app escritas
 * asi, la sustitucion ASCII de una letra que el aleman, el frances o el polaco
 * si tienen. Lista corta y segura; se amplia cuando aparezca otra.
 *
 *     node tools/auditar_letras.js
 */
'use strict';
const fs = require('fs'), path = require('path');
const RAIZ = path.dirname(__dirname);
const FORMAS = [
  // aleman: ae/oe/ue/ss en vez de ä/ö/ü/ß
  'waehle', 'waehlen', 'oeffne', 'oeffnen', 'menue', 'zurueck', 'naechste', 'naechsten', 'spaeter',
  'muessen', 'koennen', 'moechte', 'moechten', 'groesse', 'schoen', 'gruen', 'fuer', 'ueber', 'haeufig',
  'waehrend', 'hoehe', 'kueste', 'gebuehr', 'oeffnungszeiten',
  // frances: sin acento grave, agudo o circunflejo
  'carre avec', 'avec fleche', 'ecran d', 'l\u2019ecran', "l'ecran", 'l\u2019icone', "l'icone", 'deja vu',
  'a cote', 'tres bien', 'apres-midi', 'telecharger', 'reessayer', 'securite', 'meteo du jour',
  // polaco: sin ogonek ni kreska en palabras que solo existen con ellos
  'wlacz', 'wylacz', 'zrodlo', 'jezyk', 'miejsc na mapie: plaze'
];
/* Las claves de busqueda del asistente van sin acentos A PROPOSITO: chatNorm
   las quita al comparar, asi que «jezyk» o «securite plage» ahi son correctas
   (las escribe la gente sin acentos). Se miran solo los textos que se leen. */
const ficheros = ['index.html', 'sw.js', 'datos/titsa.js']
  .concat(fs.readdirSync(path.join(RAIZ, 'idiomas')).filter(f => f.endsWith('.json')).map(f => 'idiomas/' + f))
  .concat(fs.readdirSync(path.join(RAIZ, 'idiomas', 'etiquetas')).filter(f => f.endsWith('.json')).map(f => 'idiomas/etiquetas/' + f));
let fallos = 0, mirados = 0;
const reFormas = new RegExp('(^|[^\\p{L}])(' + FORMAS.map(f => f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')(?=$|[^\\p{L}])', 'giu');
function mirar(nombre, txt) {
  mirados++;
  for (const m of txt.matchAll(reFormas)) {
    fallos++;
    const i = m.index;
    console.log('  ' + nombre + ': «' + m[2] + '» · …' + txt.slice(Math.max(0, i - 40), i + 50).replace(/\s+/g, ' ') + '…');
  }
}
for (const f of ficheros) {
  let txt = fs.readFileSync(path.join(RAIZ, f), 'utf8');
  if (f === 'index.html') {
    /* las claves de busqueda del nucleo del asistente y los comentarios no se leen */
    txt = txt.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:'"\\])\/\/[^\n]*/g, '$1');
  }
  mirar(f, txt);
}
// el asistente: rotulos y respuestas, no las claves
for (const f of fs.readdirSync(path.join(RAIZ, 'faq')).filter(f => /^[a-z]{2,3}\.json$/.test(f))) {
  const d = JSON.parse(fs.readFileSync(path.join(RAIZ, 'faq', f), 'utf8'));
  for (const e of d.e || []) mirar('faq/' + f + ' ' + e.id, e.l + '\n' + e.a);
}
console.log('  textos mirados........ ' + mirados);
console.log(fallos ? '\n' + fallos + ' palabra(s) sin sus letras' : '  palabras sin sus letras: 0\n\n  OK');
process.exit(fallos ? 1 : 0);
