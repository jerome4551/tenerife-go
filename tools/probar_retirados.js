#!/usr/bin/env node
/* probar_retirados.js — las fichas que ya no están en la app (17 de noviembre de 2026; Jérôme: «3 si», «4 quítalo»).
 *
 * Una ficha que se junta con otra o se quita deja su id en los favoritos de quien la tenía, en el móvil y en la nube.
 * index.html los descarta al leerlos (LUGARES_RETIRADOS, en loadFavorites y en AppFavorites.replaceAll): si no,
 * seguían contando en el número de favoritos sin verse en ninguna parte. Aquí, sin navegador:
 *   · la lista existe, no está vacía y cada id tiene la forma de un id de ficha;
 *   · NINGUNO es una ficha de la app: descartar el favorito de una ficha que existe sería perderlo;
 *   · los dos sitios que leen favoritos los descartan;
 *   · ninguno sigue en los ficheros de idioma (idiomas/<l>.json, idiomas/pl-lugares/), en el registro de lo
 *     verificado (datos/verificado.json) ni en la tabla del mar (las playas).
 *     node tools/probar_retirados.js */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const RAIZ = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
let malos = 0, total = 0;
const prueba = (nombre, ok, detalle) => { total++; if (!ok) malos++; console.log((ok ? '  OK  ' : ' MAL  ') + nombre + (ok || !detalle ? '' : '  ← ' + detalle)); };

const m = src.match(/const LUGARES_RETIRADOS = new Set\(\[([\s\S]*?)\]\);/);
const ids = m ? [...m[1].matchAll(/'([^']*)'/g)].map(x => x[1]) : [];
prueba('LUGARES_RETIRADOS está en index.html y lleva ' + ids.length + ' ids', !!m && ids.length > 0);
prueba('cada uno con la forma de un id de ficha', ids.every(id => /^[a-z0-9][a-z0-9-]{1,63}$/.test(id)), ids.filter(id => !/^[a-z0-9][a-z0-9-]{1,63}$/.test(id)).join(', '));
prueba('sin repetidos', new Set(ids).size === ids.length);

const i = src.indexOf('const places = ['), o = src.indexOf('[', i);
let d = 0, q = null, fin = 0;
for (let k = o; k < src.length; k++) {
  const c = src[k], p = src[k - 1];
  if (q) { if (c === q && p !== '\\') q = null; continue; }
  if (c === '"' || c === "'" || c === '`') { q = c; continue; }
  if (c === '[') d++; else if (c === ']') { d--; if (d === 0) { fin = k + 1; break; } }
}
const places = vm.runInNewContext('(' + src.slice(o, fin) + ')');
const vivos = new Set(places.map(p => p.id));
const siguen = ids.filter(id => vivos.has(id));
prueba('ninguno es una ficha de la app (' + places.length + ' fichas)', !siguen.length, siguen.join(', '));

prueba('loadFavorites y AppFavorites.replaceAll los descartan',
  (src.match(/favorites = new Set\(safe\.filter\(function\(id\) \{ return !LUGARES_RETIRADOS\.has\(id\); \}\)\);/g) || []).length === 2 &&
  !/favorites = new Set\(safe\);/.test(src));

const restos = [];
for (const f of fs.readdirSync(path.join(RAIZ, 'idiomas')).filter(f => /^[a-z]+\.json$/.test(f))) {
  const j = JSON.parse(fs.readFileSync(path.join(RAIZ, 'idiomas', f), 'utf8'));
  ids.forEach(id => { if (Object.prototype.hasOwnProperty.call(j, id)) restos.push('idiomas/' + f + ': ' + id); });
}
for (const f of fs.readdirSync(path.join(RAIZ, 'idiomas', 'pl-lugares')).filter(f => f.endsWith('.json'))) {
  const j = JSON.parse(fs.readFileSync(path.join(RAIZ, 'idiomas', 'pl-lugares', f), 'utf8'));
  ids.forEach(id => { if (Object.prototype.hasOwnProperty.call(j, id)) restos.push('pl-lugares/' + f + ': ' + id); });
}
const ver = JSON.parse(fs.readFileSync(path.join(RAIZ, 'datos', 'verificado.json'), 'utf8'));
ids.forEach(id => { if (ver.coordenada && Object.prototype.hasOwnProperty.call(ver.coordenada, id)) restos.push('datos/verificado.json: ' + id); });
ids.forEach(id => { if (src.includes("'" + id + "':")) restos.push('index.html (una tabla con su id): ' + id); });
prueba('ninguno sigue en los idiomas, en lo verificado ni en las tablas de index.html', !restos.length, restos.join(' · '));

console.log('\n' + total + ' controles' + (malos ? ', ' + malos + ' EN ROJO' : ', todos en verde'));
process.exit(malos ? 1 : 0);
