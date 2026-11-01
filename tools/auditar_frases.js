#!/usr/bin/env node
/* auditar_frases.js — la frase diaria, en los diez idiomas.
 *
 *     node tools/auditar_frases.js
 *
 * POR QUE EXISTE
 *   frases.json no lo miraba ningun control. Tenia las 365 frases en ocho
 *   idiomas y ninguna en bulgaro ni en polaco, asi que enviar-notificacion.js
 *   caia en su red de seguridad -"si no esta la frase en tu idioma, mandale la
 *   castellana"- y quien habia elegido bulgaro recibia la notificacion diaria
 *   en castellano, todos los dias. El codigo del envio estaba bien; el dato
 *   estaba vacio, y la auditoria salia en verde porque no lo leia nadie.
 *
 * QUE COMPRUEBA
 *   1. La lista de idiomas la saca de SUPPORTED_LANGS de index.html. Escrita a
 *      mano aqui, el idioma numero once volveria a entrar sin control.
 *   2. El titulo y las 365 frases tienen texto en todos ellos.
 *   3. Repite la cuenta de enviar-notificacion.js dia a dia -los 366 de un ano
 *      bisiesto- y exige que la red de seguridad no salte ni una vez: es la
 *      unica forma de probar lo que de verdad le llega al movil.
 *   4. El alfabeto encaja con el idioma: el bulgaro en cirilico, el chino en
 *      han, y los de alfabeto latino sin cirilico ni han. Asi se ve un texto
 *      pegado en la casilla equivocada.
 *   5. Ninguna traduccion es identica a la castellana, que es la huella que
 *      deja rellenar el hueco copiando.
 */
'use strict';
const fs   = require('fs');
const path = require('path');
const raiz = path.join(__dirname, '..');

let fallos = 0;
const mal = m => { console.log('  FALLO: ' + m); fallos++; };

/* 1 — los idiomas, del fuente */
const html = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8');
const m = html.match(/SUPPORTED_LANGS\s*=\s*\[([^\]]*)\]/);
if (!m) { console.log('  FALLO: no encuentro SUPPORTED_LANGS en index.html'); process.exit(1); }
const LANGS = m[1].split(',').map(s => s.replace(/['"\s]/g, '')).filter(Boolean);
console.log(`  idiomas declarados en index.html: ${LANGS.length} (${LANGS.join(' ')})`);

const CONT = JSON.parse(fs.readFileSync(path.join(raiz, 'frases.json'), 'utf8'));
const F = CONT.frases || [];
console.log(`  frases en frases.json: ${F.length}`);
if (!F.length) mal('frases.json no tiene frases');

/* 2 — titulo y frases completos */
const vacio = t => typeof t !== 'string' || !t.trim();
for (const L of LANGS) if (vacio((CONT.titulo || {})[L])) mal(`el titulo no tiene ${L}`);

const huecos = {};
F.forEach((f, i) => {
  for (const L of LANGS) if (vacio(f[L])) (huecos[L] = huecos[L] || []).push(i);
});
for (const L of LANGS) {
  const h = huecos[L] || [];
  if (h.length) mal(`${L}: ${h.length} frase(s) sin texto (primeras: ${h.slice(0, 5).join(', ')})`);
}
if (!Object.keys(huecos).length) console.log(`  todas las frases tienen los ${LANGS.length} idiomas`);

/* 3 — la cuenta real del envio, dia a dia */
// Copiada de enviar-notificacion.js a proposito: si alli cambia el reparto y
// aqui no, este control lo canta en vez de seguirle la corriente en silencio.
const dayOfYear = (y, mo, d) =>
  Math.floor((Date.UTC(y, mo - 1, d) - Date.UTC(y, 0, 0)) / 86400000);

if (F.length) {
  const cayeron = new Set();
  const usados  = new Set();
  const BISIESTO = 2028;                       // 366 dias: el caso largo
  for (let dia = 1; dia <= 366; dia++) {
    const fecha = new Date(Date.UTC(BISIESTO, 0, dia));
    const idx = dayOfYear(fecha.getUTCFullYear(), fecha.getUTCMonth() + 1, fecha.getUTCDate()) % F.length;
    usados.add(idx);
    const frase = F[idx];
    if (!frase) { cayeron.add('indice ' + idx + ' fuera de la lista'); continue; }
    for (const L of LANGS) {
      // Esta es la linea de enviar-notificacion.js, tal cual.
      const lang = (frase[L] ? L : 'es');
      if (lang !== L) cayeron.add(L);
    }
  }
  if (cayeron.size) mal(`la red de seguridad salta y manda castellano a: ${[...cayeron].sort().join(' ')}`);
  else console.log('  los 366 dias del ano bisiesto salen en el idioma de cada uno');
  const sinUsar = F.length - usados.size;
  if (sinUsar > 0) console.log(`  aviso: ${sinUsar} frase(s) no le tocan a ningun dia`);
}

/* 4 — el alfabeto de cada idioma */
const CIRILICO = /[Ѐ-ӿ]/;
const HAN      = /[㐀-䶿一-鿿]/;
const perfil = {
  bg:  { exige: CIRILICO, prohibe: [['han', HAN]],                       nombre: 'cirilico' },
  zh:  { exige: HAN,      prohibe: [['cirilico', CIRILICO]],             nombre: 'han' },
  zht: { exige: HAN,      prohibe: [['cirilico', CIRILICO]],             nombre: 'han' },
};
const LATINO = ['es', 'en', 'fr', 'de', 'it', 'nl', 'pl'];
for (const L of LATINO) perfil[L] = { prohibe: [['cirilico', CIRILICO], ['han', HAN]] };
// El polaco es el que mas cerca cae del castellano: si alguien rellena el
// hueco a medias, lo que queda son signos que en polaco no existen.
perfil.pl = { prohibe: [['cirilico', CIRILICO], ['han', HAN], ['signos del castellano', /[¿¡ñ]/]] };

for (const L of LANGS) {
  const p = perfil[L];
  if (!p) { console.log(`  aviso: no se que alfabeto exigirle a ${L}`); continue; }
  const textos = F.map((f, i) => [i, f[L]]).filter(([, t]) => typeof t === 'string' && t.trim());
  if (p.exige) {
    const sin = textos.filter(([, t]) => !p.exige.test(t)).map(([i]) => i);
    if (sin.length) mal(`${L}: ${sin.length} frase(s) sin ${p.nombre} (primeras: ${sin.slice(0, 5).join(', ')})`);
  }
  for (const [comoSeLlama, re] of p.prohibe) {
    const con = textos.filter(([, t]) => re.test(t)).map(([i]) => i);
    if (con.length) mal(`${L}: ${con.length} frase(s) con ${comoSeLlama} (primeras: ${con.slice(0, 5).join(', ')})`);
  }
}

/* 5 — ninguna frase repetida que en castellano no lo este */
// Dos frases castellanas parecidas se traducen facil con la misma linea, y
// entonces a quien lee en ese idioma le sale el mismo dia dos veces al ano
// mientras en castellano son dos frases distintas.
const distintasEs = new Set(F.map(f => String(f.es || '').trim())).size;
for (const L of LANGS) {
  if (L === 'es') continue;
  const d = new Set(F.map(f => String(f[L] || '').trim())).size;
  if (d < distintasEs) mal(`${L}: ${distintasEs - d} frase(s) repetidas que en castellano son distintas`);
}

/* 5 — ninguna copiada del castellano */
const copiadas = {};
F.forEach((f, i) => {
  for (const L of LANGS) {
    if (L === 'es') continue;
    if (typeof f[L] === 'string' && typeof f.es === 'string' && f[L].trim() === f.es.trim())
      (copiadas[L] = copiadas[L] || []).push(i);
  }
});
for (const L of Object.keys(copiadas))
  mal(`${L}: ${copiadas[L].length} frase(s) identicas a la castellana (primeras: ${copiadas[L].slice(0, 5).join(', ')})`);
for (const L of LANGS) {
  if (L === 'es') continue;
  const t = (CONT.titulo || {})[L], e = (CONT.titulo || {}).es;
  if (typeof t === 'string' && t.trim() === String(e).trim()) mal(`el titulo en ${L} es el castellano`);
}
if (!Object.keys(copiadas).length) console.log('  ninguna traduccion repite el texto castellano');

console.log(fallos === 0 ? '  OK' : `  ${fallos} fallo(s)`);
process.exit(fallos ? 1 : 0);
