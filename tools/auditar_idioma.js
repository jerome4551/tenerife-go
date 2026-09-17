#!/usr/bin/env node
/* auditar_idioma.js — UN idioma, de arriba abajo.
 *
 * POR QUE HACE FALTA: revisar_traduccion.py revisa una TANDA antes de
 * meterla, y solo se ha usado con el bulgaro. Los otros siete idiomas
 * entraron antes de que ese revisor existiera, asi que sus 1.741 textos de
 * lugar nunca han pasado por ninguna comprobacion: un ⚠️ perdido, una cifra
 * cambiada o un horario distinto llevan ahi desde el primer dia.
 *
 * Mira lo que se puede perder SIN QUE NADIE LO NOTE, no si suena bien:
 *   · un aviso ⚠️ que desaparece        el peligro deja de avisarse
 *   · una cifra que cambia              300 plazas pasan a ser 30
 *   · un horario distinto               el turista llega y esta cerrado
 *   · un {marcador} que se pierde       sale "{n} plazas" literal
 *   · etiquetas HTML descuadradas       el <b> se come el resto del texto
 *   · texto identico al castellano      se quedo sin traducir
 *   · alfabeto que no toca              cirilico en aleman, han en frances
 *   · demasiado corto o demasiado largo se comio o se invento una frase
 *
 *     node tools/auditar_idioma.js de
 *     node tools/auditar_idioma.js de --lista     todos los casos, no 6
 */
'use strict';
const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const LANG = (process.argv[2] || '').toLowerCase();
const LISTA = process.argv.indexOf('--lista') !== -1;
const IDI = ['es','en','fr','de','it','nl','zh','zht','bg'];
if (IDI.indexOf(LANG) === -1) {
  console.log('uso: node tools/auditar_idioma.js <' + IDI.join('|') + '> [--lista]');
  process.exit(2);
}

/* ── que alfabeto le toca a cada uno ──────────────────────────────────────
   No es un adorno: un texto en cirilico dentro del aleman, o un han dentro
   del frances, es una fila pegada en el sitio equivocado. */
const ESCRITURA = {
  es:  { debe: null,            prohibe: /[Ѐ-ӿ一-鿿]/ },
  en:  { debe: null,            prohibe: /[Ѐ-ӿ一-鿿]/ },
  fr:  { debe: null,            prohibe: /[Ѐ-ӿ一-鿿]/ },
  de:  { debe: null,            prohibe: /[Ѐ-ӿ一-鿿]/ },
  it:  { debe: null,            prohibe: /[Ѐ-ӿ一-鿿]/ },
  nl:  { debe: null,            prohibe: /[Ѐ-ӿ一-鿿]/ },
  zh:  { debe: /[一-鿿]/, prohibe: /[Ѐ-ӿ]/ },
  zht: { debe: /[一-鿿]/, prohibe: /[Ѐ-ӿ]/ },
  bg:  { debe: /[Ѐ-ӿ]/, prohibe: null }
};
/* Cuanto puede encoger una traduccion respecto al castellano antes de que
   sea sospechosa. El chino escribe lo mismo en la mitad de caracteres, asi
   que un unico numero para los ocho daria falsas alarmas a mansalva. */
const MINIMO = { en: 0.5, fr: 0.55, de: 0.5, it: 0.55, nl: 0.5, zh: 0.18, zht: 0.18, bg: 0.45 };

/* ── NORMALIZAR ANTES DE COMPARAR ────────────────────────────────────────
   Comparar las cifras en crudo no vale, y no por poco: en ingles dio 73
   diferencias de las que casi todas eran mias. Tres motivos, y los tres hay
   que quitarlos SIN dejar de mirar lo que tapan.

   1. El reloj. El castellano escribe 13:00-19:00 y el ingles 1pm-7pm. Son
      la misma hora. Borrarlas y ya seria perder justo lo que mas duele -un
      horario mal traducido manda al turista a una puerta cerrada-, asi que
      se pasan las dos a minutos desde medianoche y se comparan de verdad.
      En "1-4pm" el 1 no lleva meridiano: lo hereda del 4.
   2. El telefono. El castellano pone "922 57 48 06" y el ingles le anade el
      prefijo "+34". Se saca aparte, se le quita el 34 y todo lo que no sea
      digito, y se comparan los numeros que quedan.
   3. Los siglos. "siglo XVII" en ingles es "17th century". El numero romano
      se pasa a arabigo en los dos lados. */
const ROMANOS = { M:1000, CM:900, D:500, CD:400, C:100, XC:90, L:50, XL:40, X:10, IX:9, V:5, IV:4, I:1 };
function romanoANumero(r) {
  let n = 0, i = 0;
  while (i < r.length) {
    const dos = r.substr(i, 2);
    if (ROMANOS[dos]) { n += ROMANOS[dos]; i += 2; }
    else if (ROMANOS[r[i]]) { n += ROMANOS[r[i]]; i++; }
    else return null;
  }
  return n;
}
const enMinutos = (h, m, mer) => {
  h = Number(h); m = Number(m || 0);
  if (mer === 'pm' && h < 12) h += 12;
  if (mer === 'am' && h === 12) h = 0;
  return h * 60 + m;
};
function sacarHoras(txt, esCampoHoras) {
  const out = [];
  let t = String(txt);
  const mete = (h, m, mer) => { out.push(enMinutos(h, m, mer)); };

  /* 1. RANGO CON MERIDIANO AL FINAL, que es como escribe el ingles:
        "1-4pm", "7:30-11pm", "9am-10pm". El primero hereda del segundo. */
  t = t.replace(/(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)?\s*[-–—]\s*(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)\b/gi,
    (m, h1, m1, mer1, h2, m2, mer2) => {
      mer2 = mer2.toLowerCase();
      mete(h1, m1, (mer1 || mer2).toLowerCase());
      mete(h2, m2, mer2);
      return ' ';
    });

  /* 2. RANGO DE 24 H CON SUFIJO, que es como escribe casi todo lo demas:
        "7-16h", "7h-22h", "de 9 a 22h", "7-16 Uhr", "7-16 uur".
        El sufijo puede estar en los dos numeros o solo en el segundo, y el
        separador puede ser un guion o la palabra "a"/"to"/"bis"/"tot".
        OJO: la palabra "horas" NO cuenta. "5-6 horas" es lo que dura un
        sendero, no la hora a la que abre, y meterla dio catorce falsas
        alarmas seguidas. */
  t = t.replace(
    /(\d{1,2})(?::(\d{2}))?\s*(?:h|Uhr|uur|ч|時|时)?\s*(?:[-–—]|\ba\b|\bto\b|\bbis\b|\btot\b)\s*(\d{1,2})(?::(\d{2}))?\s*(?:h|Uhr|uur|u|ч|時|时)\b/gi,
    (m, h1, m1, h2, m2) => {
      if (Number(h1) > 23 || Number(h2) > 23) return m;     // "24h" no es una hora
      mete(h1, m1, null); mete(h2, m2, null);
      return ' ';
    });

  /* NO se intenta leer "10h00" ni "1h40". Se probo, y sale peor: en frances
     "10h00" son las diez de la manana pero "1h40" es lo que dura una ruta en
     bici, y en castellano pasa igual. La regla arreglaba 20 casos en frances
     y estropeaba 30 repartidos por aleman, neerlandes, chino y bulgaro. Un
     control que para arreglar una cosa rompe otra no se queda. */

  /* 3. SUELTAS CON MERIDIANO: "1pm", "11:30am" */
  t = t.replace(/(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)\b/gi,
    (m, h, mm, mer) => { mete(h, mm, mer.toLowerCase()); return ' '; });

  /* 3b. EN EL CAMPO `hours`, UN RANGO PELADO ES UN HORARIO.
        "Mon-Fri 8-19" no lleva sufijo ninguno, pero en un campo que solo
        contiene horarios no puede ser otra cosa. Fuera de ese campo NO se
        aplica: "4-5 personas" o "10-15 min" romperian la cuenta. */
  if (esCampoHoras) {
    t = t.replace(/(?<![\d:])(\d{1,2})(?:[:.](\d{2}))?\s*[-–—]\s*(\d{1,2})(?:[:.](\d{2}))?(?![\d:])/g,
      (m, h1, m1, h2, m2) => {
        if (Number(h1) > 23 || Number(h2) > 23) return m;
        mete(h1, m1, null); mete(h2, m2, null);
        return ' ';
      });
  }

  /* 4. Y EL RELOJ DE 24 H CON DOS PUNTOS: "13:00" */
  t = t.replace(/(\d{1,2}):(\d{2})/g, (m, h, mm) => { mete(h, mm, null); return ' '; });

  return [out.sort((x, y) => x - y), t];
}
function sacarTelefonos(txt) {
  const out = [];
  const t = String(txt).replace(/☎\s*([+\d][\d\s().-]{6,})/g, (m, num) => {
    out.push(num.replace(/[^\d]/g, '').replace(/^34(?=\d{9})/, ''));
    return ' ';
  });
  return [out.sort(), t];
}
function sinRomanos(txt) {
  return String(txt)
    .replace(/\b(?:siglos?|ss?\.)\s*([IVXLCDM]{1,7})\b/gi,
      (m, r) => { const n = romanoANumero(r.toUpperCase()); return n ? ' ' + n + ' ' : m; })
    /* Y la forma abreviada, que es la que usa cada idioma en un rotulo
       corto: "XVIIe" en frances, "XVII sec." en italiano, "17. Jhd." en
       aleman. Sin esto, "Castillo · S. XVII" parecia perder el 17. */
    /* El sufijo es OBLIGATORIO. Se probo dejarlo opcional para coger
       "XVIIe" y salio caro: sin sufijo la regla convierte CUALQUIER palabra
       que se lea como numero romano, y "PADI 5★ IDC" pasaba a "PADI 5★ 601"
       -I=1, D=500, C=100- antes de comparar nada. Una regla que cambia el
       texto que va a mirar es lo peor que puede tener un control. La forma
       francesa "XVIIe" va en su propia alternativa, con la e de marca. */
    .replace(/\b([IVXLCDM]{2,7})\.?\s*(?:century|C\.|Jahrhundert|Jhd\.?|siècle|s\.|secolo|sec\.|eeuw|век|世纪|世紀)/g,
      (m, r) => { const n = romanoANumero(r); return n ? ' ' + n + ' ' : m; })
    .replace(/\b([IVXLCDM]{2,7})(?:e|er|ème)\b/g,
      (m, r) => { const n = romanoANumero(r); return n ? ' ' + n + ' ' : m; });
}
const reloj = ms => ms.map(m => String(Math.floor(m / 60)).padStart(2, '0') + ':' +
                                String(m % 60).padStart(2, '0')).join(' ');
/* El chino no escribe 210.000: escribe 21万, que son 21 decenas de millar.
   Y 3,5万 son 35.000. Sin esto, cada cifra grande en chino parecia perdida. */
function sinMiriadas(t) {
  return String(t).replace(/(\d+(?:[.,]\d+)?)\s*[万萬]/g, (m, n) =>
    ' ' + Math.round(parseFloat(String(n).replace(',', '.')) * 10000) + ' ');
}
const cifras = s => {
  s = sinMiriadas(sinRomanos(String(s)));
  /* El separador de millares cambia con el idioma: 1.024 en castellano,
     1,024 en ingles y 1 024 -con espacio- en frances y bulgaro. Se quitan
     los tres, o "1 024" se leia como el numero 024 y no casaba con nada. */
  s = s.replace(/(?<=\d)[\s  ](?=\d{3}(?!\d))/g, '');
  s = s.replace(/[.,]/g, '');
  return (s.match(/\d{2,}/g) || []).sort();
};
const marcas = s => (String(s).match(/\{[a-z]+\}/gi) || []).sort();
const etiquetas = s => {
  const o = (String(s).match(/<([a-z]+)(?:\s[^>]*)?>/gi) || []).map(x => x.replace(/[<>/]|\s.*/g, '').toLowerCase());
  const c = (String(s).match(/<\/([a-z]+)>/gi) || []).map(x => x.replace(/[<>/]/g, '').toLowerCase());
  return o.sort().join(',') + '|' + c.sort().join(',');
};
const igual = (a, b) => String(a).replace(/\s+/g, ' ').trim() === String(b).replace(/\s+/g, ' ').trim();

const hallazgos = [];
const apunta = (tipo, donde, txt) => hallazgos.push({ tipo, donde, txt });

/* ── 1. los textos de lugar, que viven en idiomas/<lang>.json ───────────── */
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
const PLACES = eval('(' + src.slice(PI, PF) + ')');
const CAMPOS = ['desc', 'cat', 'hours', 'aviso'];
const trozo = (p, campo) => campo === 'aviso' ? (p.parking && p.parking.aviso) : p[campo];

let fuera = {};
if (LANG !== 'es') {
  const f = path.join(RAIZ, 'idiomas', LANG + '.json');
  if (!fs.existsSync(f)) { console.log('FALTA idiomas/' + LANG + '.json'); process.exit(1); }
  fuera = JSON.parse(fs.readFileSync(f, 'utf8'));
}

let nLugar = 0;
for (const p of PLACES) {
  for (const campo of CAMPOS) {
    const fila = trozo(p, campo);
    if (!fila || typeof fila.es !== 'string') continue;
    const es = fila.es;
    const tr = LANG === 'es' ? es : (fuera[p.id] || {})[campo];
    const donde = p.id + '.' + campo;
    if (typeof tr !== 'string' || !tr.trim()) { apunta('FALTA', donde, es.slice(0, 60)); continue; }
    nLugar++;
    mirar(es, tr, donde, campo);
  }
}

/* ── 2. los textos de interfaz, que siguen dentro de index.html ─────────── */
const pila = [], objetos = [];
for (let k = 0; k < src.length; k++) {
  const c = src[k];
  if (c === '"' || c === "'" || c === '`') { const q = c; for (k++; k < src.length; k++) { if (src[k] === '\\') { k++; continue; } if (src[k] === q) break; } continue; }
  if (c === '/' && src[k+1] === '/') { k = src.indexOf('\n', k); if (k < 0) break; continue; }
  if (c === '/' && src[k+1] === '*') { k = src.indexOf('*/', k) + 1; continue; }
  if (c === '{') pila.push(k);
  else if (c === '}') { const a = pila.pop(); if (a !== undefined) objetos.push({ ini: a, fin: k + 1 }); }
}
objetos.sort((a, b) => (a.fin - a.ini) - (b.fin - b.ini));
/* ── EXCEPCIONES DECLARADAS EN EL PROPIO FUENTE ───────────────────────────
   Hay una tabla que NO se traduce y no es un descuido: wikiTitleOverrides
   son los titulos EXACTOS de articulo de Wikipedia, y un titulo inventado no
   devuelve el articulo, devuelve nada. La excepcion se declara al lado de la
   tabla con "SIN-TRADUCIR: <nombre>" y se lee desde aqui, igual que hacen
   barrido_idiomas.js y auditar_web.js. Sin esto, este control cantaba 15
   filas por idioma que ya estaban miradas y decididas: un control que avisa
   de lo que ya se sabe acaba leyendose por encima. */
const EXENTAS = [];
for (const m of src.matchAll(/SIN-TRADUCIR:\s*(\S+)/g)) {
  const nom = m[1];
  const decl = new RegExp('(?:const|let|var)\\s+' + nom.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*=\\s*\\{');
  const d = decl.exec(src);
  if (!d) continue;
  const o = src.indexOf('{', d.index);
  let n = 0, qq = null, f = -1;
  for (let k = o; k < src.length; k++) {
    const c = src[k], pv = src[k - 1];
    if (qq) { if (c === qq && pv !== '\\') qq = null; continue; }
    if (c === '"' || c === "'" || c === '`') { qq = c; continue; }
    if (c === '{') n++; else if (c === '}') { n--; if (n === 0) { f = k + 1; break; } }
  }
  if (f > 0) EXENTAS.push({ nom, ini: o, fin: f });
}
const esExenta = o => EXENTAS.some(e => o.ini >= e.ini && o.fin <= e.fin);
const dentroYa = [];
let nUi = 0;
for (const o of objetos) {
  if (o.ini > PI && o.fin < PF) continue;                 // places[] ya mirado
  if (esExenta(o)) continue;                             // declarado en el fuente
  if (dentroYa.some(f => o.ini > f.ini && o.fin < f.fin)) continue;
  let v;
  try { v = eval('(' + src.slice(o.ini, o.fin) + ')'); } catch (e) { continue; }
  if (!v || typeof v !== 'object' || typeof v.es !== 'string') continue;
  dentroYa.push(o);
  const linea = src.slice(0, o.ini).split('\n').length;
  const tr = LANG === 'es' ? v.es : v[LANG];
  if (typeof tr !== 'string' || !tr.trim()) { apunta('FALTA', 'interfaz:' + linea, String(v.es).slice(0, 60)); continue; }
  nUi++;
  mirar(v.es, tr, 'interfaz:' + linea);
}

function mirar(es, tr, donde, campo) {
  if (('⚠️' in {}) === false) { /* nada: solo para que quede claro que se compara abajo */ }
  if (es.includes('⚠️') !== tr.includes('⚠️')) apunta('AVISO', donde, es.slice(0, 55));
  /* el orden importa: primero las horas, luego el telefono, y las cifras
     sobre lo que queda. Si no, un "13:00" cuenta ademas como el numero 13. */
  const esH = campo === 'hours';
  const [ha, esSinH] = sacarHoras(es, esH), [hb, trSinH] = sacarHoras(tr, esH);
  if (ha.join() !== hb.join()) apunta('HORAS', donde, reloj(ha) + ' vs ' + reloj(hb) + ' :: ' + es.slice(0, 45));
  const [ta, esSinT] = sacarTelefonos(esSinH), [tb, trSinT] = sacarTelefonos(trSinH);
  if (ta.join() !== tb.join()) apunta('TELEFONO', donde, ta + ' vs ' + tb + ' :: ' + es.slice(0, 45));
  const a = cifras(esSinT), b = cifras(trSinT);
  if (a.join() !== b.join()) apunta('CIFRAS', donde, a + ' vs ' + b + ' :: ' + es.slice(0, 45));
  const ma = marcas(es), mb = marcas(tr);
  if (ma.join() !== mb.join()) apunta('MARCADOR', donde, ma + ' vs ' + mb + ' :: ' + es.slice(0, 45));
  if (etiquetas(es) !== etiquetas(tr)) apunta('ETIQUETAS', donde, etiquetas(es) + ' vs ' + etiquetas(tr));
  if (LANG !== 'es') {
    const esc = ESCRITURA[LANG];
    if (esc.debe && !esc.debe.test(tr)) apunta('SIN-SU-ALFABETO', donde, tr.slice(0, 50));
    if (esc.prohibe && esc.prohibe.test(tr)) apunta('ALFABETO-AJENO', donde, tr.slice(0, 50));
    if (igual(es, tr) && es.replace(/[^A-Za-zÀ-ÿ]/g, '').length >= 12) apunta('IGUAL-AL-CASTELLANO', donde, es.slice(0, 55));
    const min = MINIMO[LANG] || 0.45;
    if (tr.length < es.length * min) apunta('MUY-CORTA', donde, tr.length + ' vs ' + es.length + ' :: ' + es.slice(0, 40));
  }
}

/* ── informe ─────────────────────────────────────────────────────────────── */
const porTipo = {};
hallazgos.forEach(h => (porTipo[h.tipo] = porTipo[h.tipo] || []).push(h));
console.log('=== ' + LANG + ' ===');
console.log('  textos de lugar mirados....... ' + nLugar);
console.log('  textos de interfaz mirados.... ' + nUi +
            (EXENTAS.length ? '   (exentas: ' + EXENTAS.map(e => e.nom).join(', ') + ')' : ''));
console.log('  hallazgos..................... ' + hallazgos.length);
for (const t of Object.keys(porTipo).sort()) {
  console.log('    ' + t.padEnd(20) + String(porTipo[t].length).padStart(5));
  (LISTA ? porTipo[t] : porTipo[t].slice(0, 6)).forEach(h =>
    console.log('       ' + h.donde.padEnd(26) + ' ' + String(h.txt).slice(0, 96)));
  if (!LISTA && porTipo[t].length > 6) console.log('       ... y ' + (porTipo[t].length - 6) + ' mas (--lista)');
}
process.exit(hallazgos.length ? 1 : 0);
