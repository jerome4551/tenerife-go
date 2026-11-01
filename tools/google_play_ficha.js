#!/usr/bin/env node
/* google_play_ficha.js — la ficha de Google Play (datos/google-play/ficha.json),
 * en los diez idiomas. Desde el 30 de octubre de 2026.
 *
 * DE DONDE SALE (no hay texto nuevo: todo esta ya repasado idioma a idioma)
 *   · el titulo y la descripcion completa, de la ficha de la App Store
 *     (datos/app-store/ficha.json, que coteja auditar_app_store.js con los
 *     datos), quitada la frase de los negocios patrocinados. En Google Play
 *     se contesta que la app no tiene anuncios mientras no haya ninguno
 *     (Jerome, 30 de octubre: «De momento no tenemos ninguno»), y esa frase lo
 *     contradiria. El dia que haya uno, «Contiene anuncios: Si» y la frase de
 *     vuelta (GOOGLE-PLAY.md, «Anuncios»);
 *   · la descripcion breve, del texto promocional de la App Store: sus dos
 *     primeras frases sin «en su bolsillo», que no cabe en 80. En aleman y en
 *     neerlandes no cabe ni asi, y «sin conexion» pasa a «offline», como lo
 *     dice ya la app en esos idiomas («Sie funktioniert jetzt offline»,
 *     «Werkt nu offline»);
 *   · en-US, de la variante americana de la App Store (favorites, labeled).
 *
 * LO QUE PIDE GOOGLE (Play Console, ficha principal de Play Store): titulo
 * hasta 30 caracteres, descripcion breve hasta 80, completa hasta 4000.
 * Si un ancla no aparece una vez justa en la ficha de la App Store, para.
 *
 *     node tools/google_play_ficha.js              la coteja (lo pasa auditar.sh)
 *     node tools/google_play_ficha.js --escribir   la rehace desde la de la App Store
 *     node tools/google_play_ficha.js --ver en-US  los tres textos de un idioma de Play, para copiarlos
 */
'use strict';
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const ORIGEN = path.join(RAIZ, 'datos', 'app-store', 'ficha.json');
const DESTINO = path.join(RAIZ, 'datos', 'google-play', 'ficha.json');
const AS = JSON.parse(fs.readFileSync(ORIGEN, 'utf8'));

/* los idiomas de la app y su codigo en Play Console (el bulgaro si esta en Play) */
const PLAY = { es: ['es-ES'], en: ['en-GB', 'en-US'], fr: ['fr-FR'], de: ['de-DE'], it: ['it-IT'], nl: ['nl-NL'],
  zh: ['zh-CN'], zht: ['zh-TW'], bg: ['bg'], pl: ['pl-PL'] };
/* la frase de los patrocinados, tal cual esta en cada descripcion */
const PATROCINIO = {
  'es-ES': 'Sin redes publicitarias de terceros: los negocios que pagan una promoción van marcados como patrocinados. ',
  'en-GB': 'No third-party ad networks: businesses that pay for a promotion are labelled as sponsored. ',
  'en-US': 'No third-party ad networks: businesses that pay for a promotion are labeled as sponsored. ',
  'fr-FR': 'Aucune régie publicitaire tierce : les commerces qui paient une promotion sont signalés comme sponsorisés. ',
  'de-DE': 'Keine Werbenetzwerke von Dritten: Betriebe, die für eine Promotion zahlen, sind als gesponsert gekennzeichnet. ',
  'it-IT': 'Nessuna rete pubblicitaria di terzi: le attività che pagano una promozione sono contrassegnate come sponsorizzate. ',
  'nl-NL': 'Geen advertentienetwerken van derden: bedrijven die voor een promotie betalen, zijn gemarkeerd als gesponsord. ',
  'zh-CN': '没有第三方广告网络：付费推广的商家会标注为「赞助」。',
  'zh-TW': '沒有第三方廣告網路：付費推廣的商家會標示為「贊助」。',
  'bg': 'Без рекламни мрежи на трети страни: обектите, които плащат за промоция, са отбелязани като спонсорирани. ',
  'pl-PL': 'Bez sieci reklamowych firm trzecich: firmy, które płacą za promocję, są oznaczone jako sponsorowane. '
};
/* la breve: lo que se quita del texto promocional y, en aleman y neerlandes, el cambio */
const BOLSILLO = { es: ' en su bolsillo', en: ' in your pocket', fr: ' dans votre poche', de: ' in Ihrer Tasche', it: ' in tasca',
  nl: ' op zak', zh: '，尽在口袋', zht: '，盡在口袋', bg: ' в джоба ви', pl: ' w kieszeni' };
const OFFLINE = { de: ['Funktioniert ohne Verbindung.', 'Funktioniert offline.'], nl: ['Werkt zonder verbinding.', 'Werkt offline.'] };
const LIMITES = { titulo: 30, corta: 80, larga: 4000 };

const una = (texto, ancla, donde) => {
  const n = texto.split(ancla).length - 1;
  if (n !== 1) { console.log('PARA: «' + ancla.trim().slice(0, 60) + '» sale ' + n + ' veces en ' + donde + ' (se esperaba una)'); process.exit(1); }
  return texto;
};
function rehacer() {
  const idiomas = {};
  for (const [l, locs] of Object.entries(PLAY)) {
    const x = AS.idiomas[l];
    if (!x) { console.log('PARA: la ficha de la App Store no tiene ' + l); process.exit(1); }
    for (const loc of locs) {
      const v = loc === 'en-US' ? Object.assign({}, x, (x.variantes || {})['en-US']) : x;
      const larga = una(v.descripcion, PATROCINIO[loc], loc + ' (descripcion)').replace(PATROCINIO[loc], '');
      let corta = una(v.promocion, BOLSILLO[l], loc + ' (texto promocional)').replace(BOLSILLO[l], '');
      if (OFFLINE[l]) corta = una(corta, OFFLINE[l][0], loc + ' (texto promocional)').replace(OFFLINE[l][0], OFFLINE[l][1]);
      const m = corta.match(/^(.+?[.。])\s*(.+?[.。])/);
      if (!m) { console.log('PARA: el texto promocional de ' + loc + ' no tiene dos frases'); process.exit(1); }
      corta = (l === 'zh' || l === 'zht') ? m[1] + m[2] : m[1] + ' ' + m[2];
      idiomas[loc] = { idioma: l, titulo: v.nombre, corta, larga };
    }
  }
  return idiomas;
}

const ver = (process.argv.find(a => a.startsWith('--ver')) || '') && process.argv[process.argv.indexOf('--ver') + 1];
if (process.argv.includes('--escribir')) {
  const ficha = {
    _comentario: 'La ficha de Tenerife Go en Google Play, en los diez idiomas de la app. La hace y la coteja tools/google_play_ficha.js '
      + 'desde la de la App Store (datos/app-store/ficha.json), sin texto nuevo: la descripcion completa es la misma sin la frase de '
      + 'los negocios patrocinados (en Play se contesta «sin anuncios» mientras no haya ninguno) y la breve, el texto promocional sin '
      + '«en su bolsillo». Limites de Play: titulo 30, breve 80, completa 4000. Lo demas que pide Play Console, en GOOGLE-PLAY.md.',
    categoria: 'Viajes y guías locales',
    correo: 'tenerife.go.app@gmail.com',
    web: 'https://tenerifego.app/',
    urlPrivacidad: 'https://tenerifego.app/privacidad.html',
    urlBorrarCuenta: 'https://tenerifego.app/borrar-cuenta.html',
    contieneAnuncios: false,
    idiomas: rehacer()
  };
  fs.mkdirSync(path.dirname(DESTINO), { recursive: true });
  fs.writeFileSync(DESTINO, JSON.stringify(ficha, null, 1) + '\n');
  console.log('escrita ' + path.relative(RAIZ, DESTINO) + ': ' + Object.keys(ficha.idiomas).length + ' fichas');
  process.exit(0);
}
const F = JSON.parse(fs.readFileSync(DESTINO, 'utf8'));
if (ver) {
  const x = F.idiomas[ver];
  if (!x) { console.log('no hay ficha ' + ver + ' (hay: ' + Object.keys(F.idiomas).join(', ') + ')'); process.exit(1); }
  console.log('— Nombre de la aplicación (' + x.titulo.length + '/30)\n' + x.titulo + '\n\n— Descripción breve (' + [...x.corta].length + '/80)\n'
    + x.corta + '\n\n— Descripción completa (' + [...x.larga].length + '/4000)\n' + x.larga);
  process.exit(0);
}

/* ── la comprobacion ─────────────────────────────────────────────── */
let mal = 0;
const ok = (c, que, detalle) => { if (!c) mal++; console.log((c ? '  OK   ' : '  MAL  ') + que + (detalle && !c ? '\n         ' + detalle : '')); };
console.log('=== la ficha de Google Play (datos/google-play/ficha.json) ===');
const hecha = rehacer();
const locs = Object.values(PLAY).flat();
ok(JSON.stringify(Object.keys(F.idiomas)) === JSON.stringify(locs), 'las ' + locs.length + ' fichas de Play, una por idioma de la app (en-GB y en-US en ingles)', Object.keys(F.idiomas).join(' '));
const distintas = locs.filter(loc => JSON.stringify(F.idiomas[loc]) !== JSON.stringify(hecha[loc]));
ok(!distintas.length, 'cada ficha es la de la App Store de ese idioma: la completa sin la frase de los patrocinados y la breve del texto promocional (si cambia aquella, --escribir)', distintas.join(', '));
const largos = [];
for (const loc of locs) for (const [k, max] of Object.entries(LIMITES)) {
  const n = [...((F.idiomas[loc] || {})[k] || '')].length;
  if (!n || n > max) largos.push(loc + ' ' + k + ' ' + n + '/' + max);
}
ok(!largos.length, 'los limites de Play: titulo hasta 30, breve hasta 80, completa hasta 4000', largos.join(', '));
const anuncios = locs.filter(loc => /patrocin|sponsor|gesponsor|赞助|贊助|спонсор/i.test(F.idiomas[loc].larga + F.idiomas[loc].corta));
ok(F.contieneAnuncios === false && !anuncios.length, 'sin anuncios declarados y sin hablar de patrocinados (si llega el primero: GOOGLE-PLAY.md, «Anuncios»)', anuncios.join(', '));
const promete = locs.filter(loc => /sin anuncios|no ads|sans pub|keine werbung|senza pubblicit|geen advertenties|无广告|無廣告|без реклам|bez reklam/i.test(F.idiomas[loc].larga + F.idiomas[loc].corta));
ok(!promete.length, 'y sin prometer «sin anuncios»: la politica dice que puede haber negocios patrocinados', promete.join(', '));
const paginas = [[F.urlPrivacidad, 'privacidad.html'], [F.urlBorrarCuenta, 'borrar-cuenta.html'], [F.web, 'index.html']];
ok(paginas.every(([u, f]) => u === 'https://tenerifego.app/' + (f === 'index.html' ? '' : f) && fs.existsSync(path.join(RAIZ, f))),
  'la politica, la pagina de borrar la cuenta y la web, en tenerifego.app y en el repositorio', paginas.map(p => p[0]).join(' '));
ok(/@/.test(F.correo) && fs.readFileSync(path.join(RAIZ, 'privacidad.html'), 'utf8').includes(F.correo), 'el correo de contacto es el de la politica (' + F.correo + ')');
if (mal) { console.log('\n*** ' + mal + ' cosa(s) mal ***'); process.exit(1); }
console.log('  todo en verde');
