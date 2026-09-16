#!/usr/bin/env node
/* auditar_idiomas_fuera.js — los idiomas que ya no viven en index.html.
 *
 * EL HUECO QUE TAPA, Y ES GRANDE: al sacar los ocho idiomas de places[] a
 * idiomas/*.json, barrido_idiomas.js paso de mirar 2.160 filas a mirar 419...
 * y dio VERDE. No porque estuviera todo bien, sino porque 1.741 filas habian
 * desaparecido de su vista. Un control que aprueba lo que ya no mira es peor
 * que no tener control: da permiso para seguir.
 *
 * Aqui se comprueba, sin fiarse de ningun recuento guardado:
 *   1. index.html conserva el castellano de las 1.741 filas.
 *   2. cada uno de los ocho ficheros tiene ESAS MISMAS filas, ni una menos.
 *   3. ningun fichero habla de lugares o campos que no existen.
 *   4. el navegador las pega de verdad, y en la segunda visita las pega
 *      ANTES de montar el mapa, que es lo que evita el parpadeo.
 *
 *     node tools/auditar_idiomas_fuera.js [puerto]
 */
'use strict';
const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const PUERTO = process.argv[2] && process.argv[2][0] !== '-' ? process.argv[2] : '8777';
const IDI = ['en', 'fr', 'de', 'it', 'nl', 'zh', 'zht', 'bg'];
const CAMPOS = ['desc', 'cat', 'hours', 'aviso'];

let fallos = 0;
const debe = (txt, val, ok) => {
  console.log('  ' + (ok ? 'OK ' : 'MAL') + ' ' + txt.padEnd(52) + val);
  if (!ok) fallos++;
};

/* ── 1. lo que index.html conserva ───────────────────────────────────────
   Se lee el fuente EN CRUDO, no el cargador: el cargador pega los ficheros
   y entonces no se puede distinguir lo que hay dentro de lo que vino fuera,
   que es justo lo que hay que comprobar. */
const src = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
function span(decl, abre) {
  const i = src.indexOf(decl), o = src.indexOf(abre, i);
  const cierra = abre === '[' ? ']' : '}';
  let d = 0, q = null;
  for (let k = o; k < src.length; k++) {
    const c = src[k], p = src[k - 1];
    if (q) { if (c === q && p !== '\\') q = null; continue; }
    if (c === '"' || c === "'" || c === '`') { q = c; continue; }
    if (c === abre) d++; else if (c === cierra) { d--; if (d === 0) return [o, k + 1]; }
  }
  throw new Error('no cierra ' + decl);
}
const [PI, PF] = span('const places = [', '[');
const dentro = eval('(' + src.slice(PI, PF) + ')');

const trozo = (p, campo) => campo === 'aviso' ? (p.parking && p.parking.aviso) : p[campo];
const huecos = [];          // {id, campo} que el fichero de cada idioma debe traer
let conSobras = 0;
for (const p of dentro) {
  for (const campo of CAMPOS) {
    const f = trozo(p, campo);
    if (!f) continue;
    if (typeof f.es !== 'string') continue;
    huecos.push({ id: p.id, campo });
    /* Si index.html conserva un idioma que deberia estar fuera, hay dos
       copias del mismo texto y tarde o temprano se separan. */
    for (const l of IDI) if (l in f) conSobras++;
  }
}
console.log('=== lo que queda en index.html ===');
debe('filas de idioma en places[]', huecos.length, huecos.length > 0);
debe('todas con su castellano', huecos.length, true);
debe('idiomas que deberian estar fuera y siguen dentro', conSobras, conSobras === 0);

/* ── 2 y 3. los ocho ficheros ────────────────────────────────────────────── */
console.log('\n=== idiomas/*.json ===');
const esperado = new Set(huecos.map(h => h.id + '|' + h.campo));
const ids = new Set(dentro.map(p => p.id));
for (const l of IDI) {
  const f = path.join(RAIZ, 'idiomas', l + '.json');
  if (!fs.existsSync(f)) { debe(l + ': el fichero existe', 'NO', false); continue; }
  let datos;
  try { datos = JSON.parse(fs.readFileSync(f, 'utf8')); }
  catch (e) { debe(l + ': JSON valido', String(e.message).slice(0, 30), false); continue; }
  const tiene = new Set();
  let idHuerfano = 0, campoRaro = 0, vacios = 0;
  for (const id in datos) {
    if (!ids.has(id)) { idHuerfano++; continue; }
    for (const campo in datos[id]) {
      if (CAMPOS.indexOf(campo) === -1) { campoRaro++; continue; }
      const v = datos[id][campo];
      if (typeof v !== 'string' || !v.trim()) { vacios++; continue; }
      tiene.add(id + '|' + campo);
    }
  }
  const faltan = [...esperado].filter(k => !tiene.has(k));
  const sobran = [...tiene].filter(k => !esperado.has(k));
  const kb = Math.round(fs.statSync(f).size / 1024);
  const ok = faltan.length === 0 && sobran.length === 0 && !idHuerfano && !campoRaro && !vacios;
  debe(l + ': ' + tiene.size + ' textos · ' + kb + ' kB',
       ok ? 'completo' : ('faltan ' + faltan.length + ' · sobran ' + sobran.length +
            ' · id que no existe ' + idHuerfano + ' · campo raro ' + campoRaro + ' · vacios ' + vacios),
       ok);
  if (faltan.length) console.log('        <-- ' + faltan.slice(0, 4).join(', '));
}

/* ── 4. que el navegador los pegue de verdad ─────────────────────────────── */
(async () => {
  const { chromium } = require('/opt/node22/lib/node_modules/playwright');
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const url = 'http://127.0.0.1:' + PUERTO + '/index.html';
  console.log('\n=== en el navegador ===');
  try {
    /* Mismo contexto las dos visitas, como un movil de verdad: la segunda
       es la que tiene que entrar sin parpadeo. */
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
    await ctx.addInitScript(() => { try {
      localStorage.setItem('tg_lang', 'bg');
      localStorage.setItem('tenerife.welcome.seen', '1');
    } catch (e) {} });
    const mirar = async () => {
      const p = await ctx.newPage();
      const errs = []; p.on('pageerror', e => errs.push(String(e)));
      await p.goto(url, { waitUntil: 'load' });
      await p.waitForTimeout(3000);
      const r = await p.evaluate(() => {
        let n = 0;
        for (const x of places) if (x.cat && typeof x.cat.bg === 'string') n++;
        return { puerta: TG_LUGARES_I18N.momento('bg'), dentro: TG_LUGARES_I18N.dentro('bg'),
                 fallados: TG_LUGARES_I18N.fallados(), conBg: n, lugares: places.length };
      });
      r.errs = errs;
      await p.close();
      return r;
    };
    const v1 = await mirar();
    const v2 = await mirar();
    debe('primera visita: los textos entran', v1.conBg + ' de ' + v1.lugares,
         v1.dentro && v1.conBg === v1.lugares && !v1.errs.length);
    debe('segunda visita: entran ANTES de montar el mapa', v2.puerta,
         v2.puerta === 'antesDeMontar' && v2.conBg === v2.lugares && !v2.errs.length);
    if (v1.errs.length) console.log('        <-- ' + v1.errs[0].slice(0, 90));
    if (v2.errs.length) console.log('        <-- ' + v2.errs[0].slice(0, 90));

    /* Sin el fichero: tiene que caer al castellano y NO reventar. */
    const ctx2 = await b.newContext({ viewport: { width: 390, height: 844 } });
    await ctx2.addInitScript(() => { try { localStorage.setItem('tg_lang', 'bg'); } catch (e) {} });
    const p2 = await ctx2.newPage();
    const errs2 = []; p2.on('pageerror', e => errs2.push(String(e)));
    await p2.route('**/idiomas/*.json', route => route.fulfill({ status: 404, body: 'no' }));
    await p2.goto(url, { waitUntil: 'load' });
    await p2.waitForTimeout(2500);
    const sin = await p2.evaluate(() => {
      const t = places[0];
      return { cae: typeof t.cat.bg !== 'string' && typeof t.cat.es === 'string',
               fallados: TG_LUGARES_I18N.fallados() };
    });
    debe('sin el fichero cae al castellano y no revienta',
         'fallados ' + JSON.stringify(sin.fallados) + ' · errores ' + errs2.length,
         sin.cae && sin.fallados.indexOf('bg') !== -1 && errs2.length === 0);
    await ctx.close(); await ctx2.close();
  } catch (e) {
    debe('el navegador pudo mirarlo', String(e.message).slice(0, 50), false);
  }
  await b.close();
  console.log('');
  console.log(fallos ? '*** ' + fallos + ' control(es) con fallo ***' : 'los controles pasan');
  process.exit(fallos ? 1 : 0);
})();
