#!/usr/bin/env node
/* Banco de pruebas del buscador del asistente.
 *
 * Saca de index.html el bloque CHAT_CORE tal cual esta y lo hace correr con
 * los faq/<lang>.json de verdad. No copia el codigo: si manana alguien toca
 * chatNorm o chatMatchKB, esto prueba lo que haya, no lo que hubo.
 */
'use strict';
const fs = require('fs'), path = require('path');
const RAIZ = path.dirname(__dirname);
const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');

function trozo(a, b, nombre) {
  const i = html.indexOf(a), j = html.indexOf(b);
  if (i < 0 || j < 0 || j < i) { console.error('no encuentro ' + nombre); process.exit(1); }
  return html.slice(i, j + b.length);
}

// TG_FAQ entero, tal y como esta escrito en la pagina
const modulo = trozo('const TG_FAQ = (function () {', '})();\n\nTG_LUGARES_I18N.arrancar', 'TG_FAQ')
                 .replace(/\n\nTG_LUGARES_I18N\.arrancar$/, '');
const core   = trozo('/*CHAT_CORE_START*/', '/*CHAT_CORE_END*/', 'CHAT_CORE');

// fetch de mentira: lee el fichero del disco, que es lo que sirve GitHub Pages
global.fetch = function (url) {
  const f = path.join(RAIZ, url);
  return Promise.resolve(fs.existsSync(f)
    ? { ok: true, json: () => Promise.resolve(JSON.parse(fs.readFileSync(f, 'utf8'))) }
    : { ok: false, json: () => Promise.resolve(null) });
};
// LANGS de verdad: chatDetectCats busca las categorias por su nombre
// traducido y con un LANGS de mentira esto no probaria nada.
const acorn = require('/opt/node22/lib/node_modules/eslint/node_modules/acorn');
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
  if (!valor) { console.error('no encuentro ' + nombre); process.exit(1); }
  return valor;
}
const LANGS = sacarConst('LANGS');
// el chino tradicional se arma igual que en la pagina: copia del simplificado
// y encima los ZHT_OVERRIDES. Con LANGS.zht = LANGS.zh esto probaria el
// simplificado y daria por bueno un tradicional que no existe.
LANGS.zht = Object.assign(JSON.parse(JSON.stringify(LANGS.zh)), sacarConst('ZHT_OVERRIDES'));
const ctx = { places: [], LANGS: LANGS, currentLang: 'es', chatPending: null, chatLastPoiId: null };
const vm = require('vm');
vm.createContext(ctx);
ctx.fetch = global.fetch;
vm.runInContext(modulo + '\n' + core + '\nthis.TG_FAQ=TG_FAQ;this.chatNorm=chatNorm;this.chatTokens=chatTokens;'
              + 'this.chatMatchKB=chatMatchKB;this.chatDetectCats=chatDetectCats;this.chatResolve=chatResolve;'
              + 'this.chatSinEsp=chatSinEsp;', ctx);

function partes(pregunta) {
  const qn = ctx.chatNorm(pregunta);
  const toks = ctx.chatTokens(qn), tokset = {};
  for (const t of toks) { tokset[t] = 1; for (const v of [t, t.replace(/es$/, ''), t.replace(/s$/, '')]) tokset[v] = 1; }
  return { qn: qn, padded: ' ' + qn + ' ', tokset: tokset };
}
function resolver(pregunta) {
  const p = partes(pregunta);
  return ctx.chatMatchKB(p.padded, p.tokset, p.qn);
}
function categorias(pregunta) {
  const p = partes(pregunta);
  return ctx.chatDetectCats(p.padded, p.tokset, ctx.chatSinEsp(p.qn));
}

/* Las preguntas que tienen respuesta escrita en el FAQ. Las playas no estan
   aqui a proposito: son una categoria del mapa y se prueban mas abajo. */
const CASOS = [
  // idioma, pregunta, un trozo que la respuesta tiene que contener
  ['de', 'Brauche ich eine Genehmigung für den Teide Gipfel?', 'Genehmigung'],
  ['zh', '泰德峰许可',                 '许可'],
  ['pl', 'autobusy na Teneryfie',      'TITSA'],
  ['pl', 'pozwolenie na szczyt',       'pozwolenie'],
  ['bg', 'разрешително за върха',      'разрешително'],
  ['bg', 'автобуси',                   'TITSA'],
  ['zht','登頂許可',                    '許可'],
  ['fr', 'permis pour le sommet',      'autorisation'],
  ['nl', 'vergunning voor de top',     'vergunning'],
  ['it', 'permesso per la vetta',      'autorizzazione'],
  ['en', 'do i need a permit for the peak', 'authorisation'],
  ['es', 'permiso teide',              'autorización'],
  /* La forma flexionada NO se busca a proposito. «gdzie rezerwuję pozwolenie»
     comparte dos palabras con la clave «gdzie zarezerwowac pozwolenie» pero no
     las tres, y la regla de la frase descolocada exige todas. Aflojarla a dos
     cualesquiera se probo: contestaba en aleman como se sube al Teide a pie a
     quien preguntaba «Was kann man hier machen», y en bulgaro el plan de tres
     dias a quien preguntaba «какво да видя наблизо». Se prefiere una respuesta
     de menos a una respuesta equivocada, asi que aqui se prueba lo que un
     polaco escribiria de verdad, que es la clave tal cual. */
  ['pl', 'rezerwacja teide',            'Tenerife ON'],
  ['zh', 'guagua是什么意思',            'guagua'],
  ['bg', 'колко е висок тейде',        '3715'],
  /* Lo que hasta el 12 de octubre de 2026 contestaba CHAT_KB, y en castellano
     en cualquier idioma: una pregunta por idioma, con un trozo que solo esta
     en la respuesta de ese idioma. Si alguna vuelve a caer en castellano o en
     otra entrada, canta. */
  ['de', 'Teide',                       'Genehmigung'],
  ['en', 'help',                        '112'],
  ['de', 'Hilfe',                       '112'],
  ['fr', 'au secours',                  '112'],
  ['zh', '救命',                         '112'],
  ['bg', 'помощ',                        '112'],
  ['pl', 'pomoc',                       '112'],
  ['it', 'Anaga',                       'Riserva della Biosfera'],
  ['nl', 'mag ik een drone vliegen',    'AESA'],
  ['zht','露營',                         'Cabildo'],
  ['fr', 'calima',                      'Sahara'],
  ['pl', 'guachinche',                  'winiarz'],
  ['bg', 'гофио',                        'брашно'],
  ['it', 'come funziona l app',         'Fai il tour'],
  ['de', 'funktioniert die app offline','Insel offline'],
  ['en', 'how do i install the app',    'Add to Home Screen'],
  ['zh', '怎么分享',                      '分享'],
  ['nl', 'wat zijn de waarschuwingen',  'waarschuwing'],
  ['pl', 'jak zmienic jezyk',           'Słuchaj'],
  ['fr', 'que faire s il pleut',        'Cueva del Viento'],
  ['es', 'teide',                       '3.715'],
  ['es', 'bus',                         'TITSA'],
  ['es', 'la gomera',                   'Los Cristianos'],
  ['es', 'ballena',                     'Barco Azul'],
  ['es', 'no funciona',                 'Recargar'],
  /* Lo nuevo de la app que el asistente no sabia (21 de octubre de 2026):
     el panel del cielo, borrar la cuenta, la privacidad, «Patrocinado», la
     frase de cada mañana y a quien pedir ayuda si se sufre violencia. Una
     pregunta por entrada, repartidas por los diez idiomas. */
  ['es', '¿qué se ve esta noche en el cielo?', 'Esta noche'],
  ['zh', '今晚能看到什么',                 '星图'],
  ['de', 'Sternschnuppen',                'Kalender'],
  ['it', 'eclissi',                       'ISO 12312-2'],
  ['bg', 'как да изтрия профила си',      'Изтриване на профила'],
  ['en', 'delete my account',             'Yes, delete my account'],
  ['nl', 'privacy',                       'Privacy · AVG'],
  ['fr', 'que veut dire sponsorise',      'Sponsorisé'],
  ['pl', 'powiadomienia',                 'Włącz powiadomienia'],
  ['zht','通知',                           '開啟通知'],
  ['es', 'violencia de género',           '016'],
  ['en', 'domestic violence',             '016'],
  /* Los avisos de AEMET, desde el 21 de octubre de 2026 en el boton del mar:
     antes «avisos de AEMET» daba los avisos de seguridad de las fichas, y
     «Wetterwarnung» o «code oranje», nada. */
  ['es', 'avisos de AEMET',               'punto amarillo, naranja o rojo'],
  ['es', '¿dónde me baño hoy?',           'Báñate hoy aquí'],
  ['de', 'Wetterwarnung',                 'Heute hier baden'],
  ['nl', 'code oranje',                   'kustverschijnselen'],
  ['zh', '天气预警',                       '沿海风浪'],
  ['bg', 'жълт код',                      'Днес се къпете тук'],
  ['fr', 'calima',                        'poussière en suspension'],
];

let malos = 0;
(async () => {
  for (const [lang, preg, esperado] of CASOS) {
    await ctx.TG_FAQ.cambiarA(lang);
    const r = resolver(preg);
    const txt = r ? r.item.answer : '';
    const ok = r && txt.indexOf(esperado) >= 0;
    if (!ok) malos++;
    console.log((ok ? '  ok  ' : ' FALLA') + ' [' + lang + '] ' + preg
      + (r ? '   → sc=' + r.sc + '  «' + txt.slice(0, 58).replace(/\n/g, ' ') + '…»'
           : '   → SIN RESPUESTA'));
  }
  /* Las playas no estan en el FAQ: son una categoria del mapa. Lo que hay
     que probar ahi no es que haya respuesta, sino que la categoria se
     detecte, que es lo que estaba roto fuera del castellano y el ingles. */
  console.log('');
  const CATS = [
    ['zh',  '海滩',            'playa'],
    ['zh',  '徒步路线',         'senderismo'],
    ['zht', '海灘',            'playa'],
    ['bg',  'плажове',         'playa'],
    ['bg',  'панорамни места', 'mirador'],
    ['de',  'Strände',         'playa'],
    ['de',  'Aussichtspunkte', 'mirador'],
    ['fr',  'plages',          'playa'],
    ['nl',  'stranden',        'playa'],
    ['it',  'spiagge',         'playa'],
    ['pl',  'plaże',           'playa'],
    ['es',  'playas',          'playa'],
    ['en',  'beaches',         'playa'],
  ];
  /* Una categoria se busca por su nombre en LANGS, asi que un idioma que la
     app todavia no tiene no puede pasar esta prueba por mucho que su
     faq/<lang>.json exista. Se salta diciendolo, no callando: el dia que ese
     idioma entre en LANGS la prueba se activa sola. */
  let saltadas = 0, mirados = 0;
  for (const [lang, preg, esperada] of CATS) {
    if (!ctx.LANGS[lang]) {
      saltadas++;
      console.log(' salta [' + lang + '] ' + preg + '   → ese idioma no esta en LANGS todavia');
      continue;
    }
    mirados++;
    await ctx.TG_FAQ.cambiarA(lang);
    ctx.currentLang = lang;
    const c = categorias(preg);
    const ok = c.keys.indexOf(esperada) >= 0;
    if (!ok) malos++;
    console.log((ok ? '  ok  ' : ' FALLA') + ' [' + lang + '] ' + preg
      + '   → ' + (c.keys.length ? c.keys.join(',') + '  «' + c.label + '»' : 'NINGUNA CATEGORIA'));
  }
  /* Las zonas en el idioma de cada uno. La bienvenida de cada idioma invita a
     pedir «plages dans le nord»; hasta el 12 de octubre de 2026 el norte solo
     se entendia en castellano e ingles y el resto recibia la isla entera.
     Y «où est…» no puede leerse como «el este». */
  console.log('');
  const ZONAS = [
    ['fr', 'plages dans le nord', 'norte'], ['fr', "plages à l'est", 'este'], ['fr', 'où est la plage', null], ['fr', 'est', 'este', { type: 'what' }],
    ['de', 'Strände im Süden', 'sur'], ['it', 'spiagge al sud', 'sur'], ['nl', 'stranden in het westen', 'oeste'],
    ['pl', 'plaże na północy', 'norte'], ['bg', 'плажове на север', 'norte'], ['zh', '北部的海滩', 'norte'],
    ['zht', '東部的海灘', 'este'], ['es', 'playas en el norte', 'norte'], ['en', 'beaches in the south', 'sur'],
  ];
  for (const [lang, preg, esperada, pendiente] of ZONAS) {
    await ctx.TG_FAQ.cambiarA(lang);
    ctx.currentLang = lang;
    /* «est» a secas solo tiene sentido como respuesta a «¿qué zona?» */
    ctx.chatPending = pendiente || null;
    const z = (ctx.chatResolve(preg, null) || {}).zone || null;
    ctx.chatPending = null;
    const ok = z === esperada;
    if (!ok) malos++;
    console.log((ok ? '  ok  ' : ' FALLA') + ' [' + lang + '] ' + preg + '   → zona ' + (z || 'ninguna'));
  }
  mirados += ZONAS.length;
  /* «Ordena mis favoritos por distancia» (12/10/2026): exc-03 lo prometia y
     el asistente no sabia hacerlo. Tiene que entenderse en cada idioma, con
     el rotulo del boton que lo lleva (app-23) y como lo escribiria cualquiera;
     y «favoritos» a secas tiene que seguir diciendo como se guardan. */
  console.log('');
  const FAVS = [
    ['es', 'ordena mis favoritos por distancia', 'favOrdenGeo'], ['es', 'mis favoritos cerca de mí', 'favOrdenGeo'],
    ['es', 'en qué orden visito mis favoritos', 'favOrdenGeo'], ['en', 'sort my favourites by distance', 'favOrdenGeo'],
    ['en', 'favorites route', 'favOrdenGeo'], ['fr', 'trie mes favoris par distance', 'favOrdenGeo'],
    ['de', 'Sortiere meine Favoriten nach Entfernung', 'favOrdenGeo'], ['it', 'ordina i miei preferiti per distanza', 'favOrdenGeo'],
    ['nl', 'sorteer mijn favorieten op afstand', 'favOrdenGeo'], ['zh', '按距离排列我的收藏', 'favOrdenGeo'],
    ['zht', '按距離排列我的收藏', 'favOrdenGeo'], ['bg', 'Подреди любимите ми по разстояние', 'favOrdenGeo'],
    ['pl', 'Posortuj moje ulubione według odległości', 'favOrdenGeo'],
    ['es', 'favoritos', 'kb'], ['es', 'cómo guardo favoritos', 'kb'], ['de', 'Favoriten', 'kb'], ['pl', 'ulubione', 'kb'],
  ];
  for (const [lang, preg, esperada] of FAVS) {
    await ctx.TG_FAQ.cambiarA(lang);
    ctx.currentLang = lang;
    const k = (ctx.chatResolve(preg, null) || {}).kind;
    const ok = k === esperada;
    if (!ok) malos++;
    console.log((ok ? '  ok  ' : ' FALLA') + ' [' + lang + '] ' + preg + '   → ' + k);
  }
  mirados += FAVS.length;
  /* «ayuda» a secas (12/10/2026): puede ser una emergencia o la ayuda de la
     app, y se propone para elegir. Solo lo escrito entero; «pedir ayuda» y
     «ayuda con la app» siguen yendo a su respuesta, y las palabras de
     emergencia no se tocan. */
  console.log('');
  const AYUDA = [
    ['es', 'ayuda', 'elegirAyuda'], ['es', '¡Ayuda!', 'elegirAyuda'], ['es', 'necesito ayuda', 'elegirAyuda'],
    ['en', 'help', 'elegirAyuda'], ['en', 'Help me!', 'elegirAyuda'], ['fr', 'aide', 'elegirAyuda'],
    ['de', 'Hilfe', 'elegirAyuda'], ['it', 'aiuto', 'elegirAyuda'], ['nl', 'hulp', 'elegirAyuda'],
    ['zh', '帮助', 'elegirAyuda'], ['zht', '幫助', 'elegirAyuda'], ['bg', 'помощ', 'elegirAyuda'], ['pl', 'pomoc', 'elegirAyuda'],
    ['es', 'pedir ayuda', 'kb'], ['es', 'ayuda con la app', 'kb'], ['es', 'emergencia', 'kb'], ['fr', 'au secours', 'kb'],
    ['zh', '救命', 'kb'], ['en', 'sos', 'kb'],
  ];
  for (const [lang, preg, esperada] of AYUDA) {
    await ctx.TG_FAQ.cambiarA(lang);
    ctx.currentLang = lang;
    const k = (ctx.chatResolve(preg, null) || {}).kind;
    const ok = k === esperada;
    if (!ok) malos++;
    console.log((ok ? '  ok  ' : ' FALLA') + ' [' + lang + '] ' + preg + '   → ' + k);
  }
  mirados += AYUDA.length;
  console.log('\n' + malos + ' fallos de ' + (CASOS.length + mirados)
    + (saltadas ? '   (' + saltadas + ' saltada(s) por idioma que la app no tiene)' : ''));
  process.exit(malos ? 1 : 0);
})();
