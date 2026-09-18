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
const ctx = { places: [], LANGS: LANGS, currentLang: 'es' };
const vm = require('vm');
vm.createContext(ctx);
ctx.fetch = global.fetch;
vm.runInContext(modulo + '\n' + core + '\nthis.TG_FAQ=TG_FAQ;this.chatNorm=chatNorm;this.chatTokens=chatTokens;'
              + 'this.chatMatchKB=chatMatchKB;this.CHAT_KB=CHAT_KB;this.chatDetectCats=chatDetectCats;'
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
  ['pl', 'gdzie rezerwuję pozwolenie', 'Tenerife ON'],
  ['zh', 'guagua是什么意思',            'guagua'],
  ['bg', 'колко е висок тейде',        '3715'],
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
  console.log('\n' + malos + ' fallos de ' + (CASOS.length + mirados)
    + (saltadas ? '   (' + saltadas + ' saltada(s) por idioma que la app no tiene)' : ''));
  process.exit(malos ? 1 : 0);
})();
