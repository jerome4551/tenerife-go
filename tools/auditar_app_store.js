#!/usr/bin/env node
/* auditar_app_store.js — la ficha de la App Store (datos/app-store/ficha.json),
 * contra lo que pide Apple y contra lo que hay. Desde el 21 de octubre de
 * 2026 («P4»).
 *
 * LO QUE PIDE APPLE (App Store Connect, «Platform version information» y
 * «App information», leidos el 21 de octubre de 2026):
 *   · nombre de 2 a 30 caracteres; subtitulo hasta 30; texto promocional
 *     hasta 170; descripcion hasta 4000, en texto plano (sin HTML);
 *     palabras clave hasta 100 BYTES, cada una de mas de dos caracteres,
 *     sin repetir el nombre de la app ni nombres de otras apps o empresas;
 *     «novedades» hasta 4000 (vacio en la primera version);
 *   · las localizaciones que existen (el bulgaro no esta: la ficha en
 *     bulgaro se guarda y en Bulgaria la tienda ensena la de en-GB);
 *   · un Support URL con datos de contacto de verdad, la politica de
 *     privacidad con direccion propia, el copyright con el ano delante.
 *   Y lo que las directrices castigan en los metadatos (2.3): mencionar
 *   otras plataformas o apps, o prometer lo que la app no hace.
 *
 * LO QUE SE COTEJA CON LO QUE HAY
 *   · las cifras de la descripcion: los lugares (places[]) y las lineas
 *     (TITSA_LINES), en los diez idiomas; «siete costas» (MAR_COSTAS) y
 *     «diez idiomas» (SUPPORTED_LANGS), cada una con su numeral en su idioma;
 *   · las fuentes que nombra (OpenStreetMap, TITSA, AEMET, Open-Meteo,
 *     CelesTrak) son las del README; que no prometa fotos (no las hay),
 *     avisos push ni «sin anuncios» (hay negocios patrocinados: la politica
 *     lo dice);
 *   · que cada idioma este en su idioma (escritura y una palabra testigo) y
 *     no sea el castellano copiado;
 *   · que las funciones que nombra («Apunta al cielo», «Organiza tu dia»,
 *     «Como llegar») lleven el nombre de la app en ese idioma, y que no
 *     prometa elegir la hora de la guagua ni el municipio de cada lugar;
 *   · que las direcciones apunten a paginas que existen y que la de soporte
 *     lleve el correo de contacto (privacidad.html lo tiene).
 *
 *     node tools/auditar_app_store.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { PLACES, LINES, RAIZ } = require('./cargar');
const R = require('./rotulos_app');

const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
const F = JSON.parse(fs.readFileSync(path.join(RAIZ, 'datos', 'app-store', 'ficha.json'), 'utf8'));
const IDIOMAS = ((html.match(/SUPPORTED_LANGS\s*=\s*\[([^\]]*)\]/) || [, ''])[1]).split(',').map(x => x.trim().replace(/['"]/g, '')).filter(Boolean);
const MAR_COSTAS = R.grab('var MAR_COSTAS = [');

let mal = 0;
const ok = (c, que, detalle) => {
  if (!c) mal++;
  console.log((c ? '  OK   ' : '  MAL  ') + que + (!c && detalle !== undefined ? '\n         ' + String(detalle).slice(0, 400) : ''));
  return c;
};
const bytes = s => Buffer.byteLength(String(s), 'utf8');

/* Las localizaciones de App Store Connect (developer.apple.com/help/app-store-connect/reference/app-store-localizations/, 21-10-2026),
   con el codigo que usa la API de App Store Connect. */
const LOCALIZACIONES = ['ar-SA', 'ca', 'zh-Hans', 'zh-Hant', 'hr', 'cs', 'da', 'nl-NL', 'en-AU', 'en-CA', 'en-GB', 'en-US', 'fi', 'fr-FR', 'fr-CA', 'de-DE', 'el', 'he', 'hi', 'hu', 'id', 'it', 'ja', 'ko', 'ms', 'no', 'pl', 'pt-BR', 'pt-PT', 'ro', 'ru', 'sk', 'es-MX', 'es-ES', 'sv', 'th', 'tr', 'uk', 'vi'];
/* la escritura y una palabra testigo de cada idioma: que cada ficha este en el suyo */
const TESTIGO = { es: /\bguaguas\b/, en: /\bbuses\b/, fr: /\bhors ligne\b/, de: /\bBusse\b/, it: /\bautobus\b/, nl: /\bbussen\b/, zh: /公交/, zht: /公車/, bg: /автобуси/, pl: /\bautobusy\b/ };
const ESCRITURA = { zh: /[一-鿿]/g, zht: /[一-鿿]/g, bg: /[Ѐ-ӿ]/g };
/* los numerales de «siete costas» y «diez idiomas» en cada idioma */
const SIETE = { es: /siete costas/, en: /seven coasts/, fr: /sept côtes/, de: /sieben Küsten/, it: /sette coste/, nl: /zeven kusten/, zh: /七处海岸/, zht: /七處海岸/, bg: /седем крайбрежия/, pl: /siedmiu wybrzeżach/ };
const DIEZ = { es: /diez idiomas/i, en: /ten languages/i, fr: /dix langues/i, de: /zehn sprachen/i, it: /dieci lingue/i, nl: /tien talen/i, zh: /十种语言/, zht: /十種語言/, bg: /десет езика/i, pl: /dziesięć języków/i };
/* lo que no puede decir: otras plataformas y apps (directrices 2.3), y promesas que la app no cumple */
const PROHIBIDO = [/android/i, /google play/i, /play store/i, /stellarium/i, /skyview/i, /sky tonight/i, /photopills/i, /star walk/i, /sky guide/i,
  /#1\b/, /n[ºo°]\s*1\b/i, /número uno/i, /number one/i, /la mejor app/i, /the best app/i, /beste app/i, /migliore app/i, /meilleure app/i,
  /\bfotos?\b/i, /\bphotos?\b/i, /\bnotificaciones push\b/i, /push notifications/i, /\bsin anuncios\b/i, /\bno ads\b/i, /ad-free/i, /sans publicité\b/i, /werbefrei/i];
const FUENTES = ['OpenStreetMap', 'TITSA', 'AEMET', 'Open-Meteo', 'CelesTrak'];
/* Las funciones que la ficha nombra, con el nombre que llevan en la app: quien
   lee «Pointez le ciel» en la tienda busca eso en la app, y la app dice
   «Pointez vers le ciel». Paso el 21 de octubre: asi en frances, «Punta il
   cielo» en italiano (la app, «Punta al cielo»), «安排一天» en chino (la app,
   «规划你的一天») y «怎么去» por «如何前往». */
const FUNCIONES = ['UI.cieloApunta', 'UI.dpTitulo', 'UI.ariaComoLlegar'];
/* Y dos promesas que la app no cumple, con las que salio la ficha: el
   planificador de guaguas calcula con la hora de ahora en Canarias
   (horaCanaria() en index.html; no hay donde elegir otra), y la ficha de un
   lugar no ensena su municipio (321 de los 980 no lo llevan ni en las
   etiquetas). */
const PROMESAS = [/a la hora que quieras/i, /at the time you choose/i, /à l'heure de votre choix/i, /zur gewünschten Uhrzeit/i, /all'ora che vuoi/i,
  /op het tijdstip dat jij kiest/i, /指定时间/, /指定時間/, /в избран от вас час/i, /o wybranej godzinie/i,
  /su municipio/i, /its municipality/i, /sa commune/i, /\bGemeinde\b/, /il comune/i, /\bgemeente\b/i, /所属市镇/, /所屬市鎮/, /община/i, /\bgmin[aąyęi]/i];   // sin \b detras: en JS \b no ve la «а» cirilica ni la «ą»

console.log('=== la ficha de la App Store, en los diez idiomas ===');
ok(Object.keys(F.idiomas).length === IDIOMAS.length && IDIOMAS.every(l => F.idiomas[l]), 'los idiomas de la ficha son los de la app (' + IDIOMAS.join(' ') + ')', Object.keys(F.idiomas).join(' '));
const tiendas = [].concat(...IDIOMAS.map(l => F.tienda[l] || []));
ok(tiendas.every(t => LOCALIZACIONES.includes(t)) && new Set(tiendas).size === tiendas.length && tiendas.length >= IDIOMAS.length - 1,
   'las localizaciones de la tienda existen en App Store Connect y no se repiten (' + tiendas.join(' ') + ')');
ok(Array.isArray(F.tienda.bg) && F.tienda.bg.length === 0 && /bulgaro/i.test(F.notaBg || ''), 'el bulgaro no tiene localizacion en la tienda, y la ficha lo dice (notaBg)');
ok(/^\d{4} \S/.test(F.copyright || ''), 'copyright con el ano delante (' + F.copyright + ')');
ok(F.urlSoporte === F.urlPrivacidad && /\/privacidad\.html$/.test(F.urlSoporte) && /^https:\/\/jerome4551\.github\.io\/tenerife-go\/$/.test(F.urlMarketing),
   'Support URL y Privacy Policy URL son privacidad.html, Marketing URL es la web');
const priv = fs.readFileSync(path.join(RAIZ, 'privacidad.html'), 'utf8');
ok(/mailto:[^"]+@[^"]+/.test(priv) && /Tenerife/.test(priv), 'privacidad.html lleva el correo de contacto y el lugar: vale como Support URL');
ok(['Travel', 'Navigation', 'Reference', 'Education', 'Weather', 'Utilities', 'Lifestyle'].includes(F.categoria) && F.categoriaSecundaria !== F.categoria,
   'categoria ' + F.categoria + ' (secundaria ' + F.categoriaSecundaria + ')');

const vistas = new Set();
for (const l of IDIOMAS) {
  const x = F.idiomas[l];
  const todo = [x.nombre, x.subtitulo, x.promocion, x.descripcion, x.palabrasClave, x.novedades].join('\n');
  const fallos = [];
  if (!(x.nombre.length >= 2 && x.nombre.length <= 30)) fallos.push('nombre ' + x.nombre.length);
  if (x.subtitulo.length > 30) fallos.push('subtitulo ' + x.subtitulo.length);
  if (x.promocion.length > 170) fallos.push('promocion ' + x.promocion.length);
  if (!(x.descripcion.length >= 500 && x.descripcion.length <= 4000)) fallos.push('descripcion ' + x.descripcion.length);
  if (/<[a-z][^>]*>/i.test(x.descripcion)) fallos.push('HTML en la descripcion');
  if (bytes(x.palabrasClave) > 100) fallos.push('palabras clave ' + bytes(x.palabrasClave) + ' bytes');
  const claves = x.palabrasClave.split(',').map(s => s.trim());
  if (claves.some(k => k.length <= 2)) fallos.push('palabra clave de dos letras o menos');
  if (new Set(claves.map(k => k.toLowerCase())).size !== claves.length) fallos.push('palabra clave repetida');
  if (claves.some(k => /^(tenerife|go)$/i.test(k))) fallos.push('el nombre de la app en las palabras clave');
  /* ni empresas ni apps de otros (directriz 2.3.7): las fuentes que la ficha cita, y TITSA tiene app propia */
  const ajenas = claves.filter(k => FUENTES.concat(['Metrotenerife']).some(f => f.toLowerCase().replace(/[^a-z]/g, '') === k.toLowerCase().replace(/[^a-z]/g, '')));
  if (ajenas.length) fallos.push('empresas en las palabras clave: ' + ajenas.join(' '));
  if (x.novedades.length > 4000) fallos.push('novedades ' + x.novedades.length);
  ok(fallos.length === 0, l + ': dentro de los limites de Apple (nombre ' + x.nombre.length + ', subtitulo ' + x.subtitulo.length + ', promocion ' + x.promocion.length
     + ', descripcion ' + x.descripcion.length + ', palabras clave ' + bytes(x.palabrasClave) + ' bytes)', fallos.join('; '));
  const malas = PROHIBIDO.filter(re => re.test(todo)).map(String);
  ok(malas.length === 0, l + ': sin otras plataformas ni apps, sin «numero uno», y sin prometer fotos, avisos push ni «sin anuncios»', malas.join(' '));
  const cifras = [];
  if (!new RegExp('(^|[^\\d.])' + PLACES.length + '([^\\d]|$)').test(x.descripcion)) cifras.push('lugares ' + PLACES.length);
  if (!new RegExp('(^|[^\\d.])' + LINES.length + '([^\\d]|$)').test(x.descripcion)) cifras.push('lineas ' + LINES.length);
  if (!(MAR_COSTAS.length === 7 && SIETE[l].test(x.descripcion))) cifras.push('costas ' + MAR_COSTAS.length);
  if (!(IDIOMAS.length === 10 && DIEZ[l].test(x.descripcion))) cifras.push('idiomas ' + IDIOMAS.length);
  ok(cifras.length === 0, l + ': las cifras son las de hoy (' + PLACES.length + ' lugares, ' + LINES.length + ' lineas, ' + MAR_COSTAS.length + ' costas, ' + IDIOMAS.length + ' idiomas)', cifras.join('; '));
  ok(FUENTES.every(f => x.descripcion.includes(f)), l + ': nombra las fuentes del README (' + FUENTES.join(', ') + ')');
  const nombres = FUNCIONES.map(k => R.valor(k, l));
  const faltan = nombres.filter(n => !n || !x.descripcion.toLowerCase().includes(n.toLowerCase()));
  ok(faltan.length === 0, l + ': las funciones con el nombre que llevan en la app («' + nombres.join('», «') + '»)', 'no estan: ' + faltan.join(' · '));
  const promete = PROMESAS.filter(re => re.test(todo)).map(String);
  ok(promete.length === 0, l + ': sin elegir la hora de la guagua ni el municipio de cada lugar (la app no los tiene)', promete.join(' '));
  const suyo = TESTIGO[l].test(x.descripcion) && (!ESCRITURA[l] || (x.descripcion.match(ESCRITURA[l]) || []).length > 100)
    && (l === 'es' || !/\bguaguas\b/.test(x.descripcion)) && (l === 'zh' || !/公交/.test(x.descripcion)) && (l === 'zht' || !/公車/.test(x.descripcion));
  ok(suyo && !vistas.has(x.descripcion), l + ': en su idioma (escritura y palabra testigo) y distinto de los demas');
  vistas.add(x.descripcion);
  ok(x.nombre === 'Tenerife Go', l + ': el nombre es «Tenerife Go» (el de manifest.webmanifest)');
}
const man = JSON.parse(fs.readFileSync(path.join(RAIZ, 'manifest.webmanifest'), 'utf8'));
ok(man.name === 'Tenerife Go', 'manifest.webmanifest: name «Tenerife Go»');

console.log(mal ? '\n*** ' + mal + ' control(es) en rojo ***' : '\n  todo en verde');
process.exit(mal ? 1 : 0);
