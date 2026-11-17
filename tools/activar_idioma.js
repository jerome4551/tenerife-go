#!/usr/bin/env node
/* activar_idioma.js — el interruptor de un idioma nuevo en index.html.
 *
 *     node tools/activar_idioma.js ro --probar        dice lo que haria
 *     node tools/activar_idioma.js ro                 lo hace (EL ULTIMO BLOQUE; mientras falten
 *                                                     sus ficheros por idioma, se niega)
 *     node tools/activar_idioma.js ro --copia <dir>   en una copia de la app, para
 *                                                     verla en ese idioma sin tocar el repo
 *
 * QUE TOCA, y nada mas:
 *   · SUPPORTED_LANGS: el idioma, detras del ultimo
 *   · el desplegable de la barra (.lang-option) y los chips de la bienvenida
 *     (.v19-w-lang): su opcion, detras de la ultima, en el mismo orden que
 *     SUPPORTED_LANGS (los checks se emparejan por posicion)
 *   · PLURAL_FORMA: su regla de plural, si la tiene (la de CLDR)
 *   · FI_LOCALE, TTS_LOCALE y PRECIOS_GAS_LOCALE: su codigo de region
 *   · el "inLanguage" de JSON-LD
 *
 * Los textos NO: entran antes, con tools/poner_traduccion.js y las entregas
 * de cada modulo. Este interruptor va el ultimo, cuando todo esta: un idioma
 * a medias no se ofrece (IDIOMAS_INCOMPLETOS).
 *
 * Si alguna de las anclas no esta como se espera, no escribe nada.
 */
'use strict';
const fs = require('fs'), path = require('path');
const args = process.argv.slice(2);
const L = args[0];
const PROBAR = args.includes('--probar');
const iCopia = args.indexOf('--copia');
const RAIZ = iCopia >= 0 ? path.resolve(args[iCopia + 1]) : path.dirname(__dirname);
const RUTA = path.join(RAIZ, 'index.html');

/* Lo de cada idioma que se puede activar. Lo que no sabe la maquina, se escribe aqui. */
const IDIOMAS = {
  ro: {
    bandera: '🇷🇴', nombre: 'Română', chip: 'RO', region: 'ro-RO', jsonld: 'ro',
    /* CLDR, rumano: one = 1 · few = 0 y los que acaban en 01-19 (2-19, 101-119…) · other = el resto
       (20-99, 100, 120…), que lleva «de»: «1 loc», «5 locuri», «980 de locuri», «1012 locuri». */
    plural: "ro: function (n) {\n    if (n === 1) return 0;\n    var c = n % 100;\n    return (n === 0 || (c >= 1 && c <= 19)) ? 1 : 2;\n  },"
  }
};
const C = IDIOMAS[L];
if (!C) { console.error('no se como activar «' + L + '». Idiomas: ' + Object.keys(IDIOMAS).join(', ')); process.exit(2); }

/* En el repo (sin --copia ni --probar) solo se activa un idioma entero: el
   interruptor va el ULTIMO. Mientras falten sus ficheros por idioma, no escribe
   nada (nota 41: los bloques del rumano van de uno en uno y nadie debe ver un
   idioma a medias). */
if (iCopia < 0 && !PROBAR) {
  const faltan = ['idiomas/' + L + '.json', 'idiomas/cielo/' + L + '.json', 'faq/' + L + '.json']
    .filter(f => !fs.existsSync(path.join(RAIZ, f)));
  if (faltan.length) {
    console.error('«' + L + '» esta a medias: faltan ' + faltan.join(', ') + '.\n' +
      'El interruptor va el ultimo bloque (RUMANO-PLAN.md). Para verlo ahora, en una copia: --copia <dir>.\nno se ha escrito nada');
    process.exit(3);
  }
}

let s = fs.readFileSync(RUTA, 'utf8');
const fallos = [], hechos = [];
function cambia(nombre, re, fn) {
  const m = s.match(re);
  if (!m) { fallos.push(nombre + ': no encuentro su ancla'); return; }
  const nuevo = fn(m);
  if (nuevo === null) { hechos.push(nombre + ': ya estaba'); return; }
  s = s.slice(0, m.index) + nuevo + s.slice(m.index + m[0].length);
  hechos.push(nombre);
}

cambia('SUPPORTED_LANGS', /const SUPPORTED_LANGS = \[([^\]]*)\];/, m => {
  const l = m[1].split(',').map(x => x.trim().replace(/^['"]|['"]$/g, ''));
  if (l.includes(L)) return null;
  return "const SUPPORTED_LANGS = [" + m[1] + ",'" + L + "'];";
});
/* el desplegable: la ultima .lang-option del bloque, con su comentario; se mete detras */
cambia('desplegable .lang-option', /(  <div class="lang-option" onclick="setLang\('([a-z]+)'\)">\n    <span class="lang-option-flag">[^<]*<\/span>\n    <span class="lang-option-name"[^>]*>[^<]*<\/span>\n    <span class="lang-option-check" id="check-[a-z]+" style="display:none">✓<\/span>\n  <\/div>\n)(<\/div>)/, m => {
  if (s.includes("setLang('" + L + "')\">")) return null;
  return m[1] + '  <div class="lang-option" onclick="setLang(\'' + L + '\')">\n' +
    '    <span class="lang-option-flag">' + C.bandera + '</span>\n' +
    '    <span class="lang-option-name" data-sin-traducir="cada idioma se escribe en su propia lengua">' + C.nombre + '</span>\n' +
    '    <span class="lang-option-check" id="check-' + L + '" style="display:none">✓</span>\n' +
    '  </div>\n' + m[3];
});
cambia('chips de la bienvenida', /(      <button type="button" class="v19-w-lang" data-lang="[a-z]+" onclick="setLang\('[a-z]+'\)" data-sin-traducir="codigo de idioma">[^<]*<\/button>\n)(    <\/div>\n    <button type="button" class="v19-w-btn")/, m => {
  if (s.includes('class="v19-w-lang" data-lang="' + L + '"')) return null;
  return m[1] + '      <button type="button" class="v19-w-lang" data-lang="' + L + '" onclick="setLang(\'' + L + '\')" data-sin-traducir="codigo de idioma">' + C.chip + '</button>\n' + m[2];
});
if (C.plural) cambia('PLURAL_FORMA', /var PLURAL_FORMA = \{\n/, m => {
  if (new RegExp('var PLURAL_FORMA = \\{[\\s\\S]{0,800}\\n  ' + L + ': function').test(s)) return null;
  return m[0] + '  ' + C.plural + '\n';
});
cambia('PRECIOS_GAS_LOCALE', /const PRECIOS_GAS_LOCALE = \{([^}]*)\};/, m => {
  if (new RegExp('\\b' + L + ":'").test(m[1])) return null;
  return 'const PRECIOS_GAS_LOCALE = {' + m[1].replace(/\s*$/, '') + ", " + L + ":'" + C.region + "' };";
});
cambia('FI_LOCALE', /var FI_LOCALE = \{([^}]*)\};/, m => {
  if (new RegExp('\\b' + L + ':').test(m[1])) return null;
  return 'var FI_LOCALE = {' + m[1].replace(/\s*$/, '') + ', ' + L + ': "' + C.region + '" };';
});
cambia('TTS_LOCALE', /(var TTS_LOCALE = \{[\s\S]*?)(\n  \};)/, m => {
  if (new RegExp('\\b' + L + ": '").test(m[1])) return null;
  return m[1] + ", " + L + ": '" + C.region + "'" + m[2];
});
cambia('JSON-LD inLanguage', /("inLanguage": \[)([^\]]*)(\])/, m => {
  if (m[2].includes('"' + C.jsonld + '"')) return null;
  return m[1] + m[2] + ', "' + C.jsonld + '"' + m[3];
});

console.log(hechos.map(h => '  · ' + h).join('\n'));
if (fallos.length) { console.error(fallos.map(f => '  ✗ ' + f).join('\n') + '\nno se ha escrito nada'); process.exit(1); }
if (PROBAR) { console.log('--probar: no se ha escrito nada'); process.exit(0); }
fs.writeFileSync(RUTA, s);
console.log(RUTA + ': «' + L + '» activado');
