#!/usr/bin/env node
/* castellano_suelto.js — EL CASTELLANO QUE SE QUEDA DENTRO DE OTRO IDIOMA, y
 * las frases del castellano que la traduccion no tiene.
 *
 * POR QUE HACE FALTA. El 10 de octubre de 2026 Jerome pidio «traduce todo ya
 * y de nuevo hace auditorio con cada idioma. Una por una no dejar nada
 * atras». Los controles que habia estaban todos en verde, y aun asi quedaban:
 *   · palabras castellanas sueltas dentro del texto traducido: «ermitas» en
 *     ingles, «fincas» y «barrancos» en frances, «laguneros» en aleman e
 *     italiano, «monteverde» en seis idiomas, «Malpaís» en las etiquetas de
 *     tres, «lonja», «morcilla», «avenidas», «gorrillas»...;
 *   · frases enteras que el castellano dice y la traduccion no: 127, sobre
 *     todo en frances y aleman, que se tradujeron antes de que el castellano
 *     creciera;
 *   · traducciones resumidas, con las mismas frases pero sin los datos: la
 *     reunion abierta del ultimo lunes de Alcoholicos Anonimos, la calle del
 *     servicio de atencion a las mujeres, las muletas anfibias de las playas
 *     accesibles. 109 fichas.
 * Ningun control los veia porque ninguno lee las palabras: auditar_idioma.js
 * compara cifras, horas, avisos y marcadores; auditar_etiquetas.js mira que
 * cada etiqueta tenga fila; barrido_pantallas.js busca texto IGUAL al
 * castellano, y «Malpaís» por «Malpais» no es igual.
 *
 * QUE MIRA, por idioma, en TODO lo que lee el usuario: las fichas
 * (idiomas/<L>.json), las etiquetas, el asistente (faq/<L>.json), la
 * privacidad y las filas de idioma de todo el fuente (index.html y lo que
 * carga: tools/fuente.js).
 *   PALABRAS (alfabeto latino)
 *     · letras que ese idioma no usa y el castellano si (á í ó ú ñ ¿ ¡);
 *     · palabras corrientes del castellano que no son de ese idioma
 *       (CORRIENTES, abajo), en minuscula: con mayuscula son casi siempre
 *       parte de un nombre propio;
 *     · COPIADAS: una palabra en minuscula que esta igual en el castellano de
 *       ESE MISMO texto y que el idioma no usa en ningun otro sitio. Una
 *       palabra de verdad del idioma sale tambien donde el castellano dice
 *       otra cosa; una que solo aparece cuando el original la tiene es, casi
 *       siempre, una que nadie tradujo. Asi salieron «fincas», «lonja» o
 *       «submarino» sin tener que conocerlas de antemano.
 *   PALABRAS (bulgaro): las palabras en alfabeto latino y las palabras del
 *     castellano del mismo texto pasadas tal cual al cirilico («ромерия»,
 *     «кардонал»).
 *   PALABRAS (chino): las palabras en alfabeto latino, en minuscula, tambien
 *     pegadas a los caracteres («配mojo辣酱»).
 *   FRASES: la descripcion de una ficha con menos frases que el castellano
 *     (no en chino, que junta frases con coma y es correcto).
 *   CORTAS: la descripcion mucho mas corta de lo normal en ese idioma
 *     (menos de 0,75 de su mediana; 0,55 en chino).
 *
 * LO QUE SE QUEDA EN CASTELLANO A PROPOSITO va en
 * idiomas/castellano-aceptado.json, cada cosa con su motivo: los platos
 * (gofio, mojo, escaldón...), las palabras que el asistente explica
 * («guagua es el autobús»), los nombres locales de plantas... Regla de
 * Jerome: «Si no se traduce se deja en castellano». Una entrada puede valer
 * para todo el idioma («gofio»), solo para un texto («romería@faq
 * cul-08.l») o para los textos cuyo castellano dice un trozo
 * («fleje@es:había fleje de gente»: las filas del fuente cambian de numero de
 * linea). Y una entrada que ya no hace falta SUSPENDE: lo que esta en la
 * lista deja de mirarse, asi que una entrada de mas solo sirve para tapar la
 * proxima vez que alguien deje esa palabra sin traducir.
 *
 *     node tools/castellano_suelto.js             los nueve idiomas
 *     node tools/castellano_suelto.js fr          uno
 *     node tools/castellano_suelto.js fr --lista  todos los casos, no 12
 *     node tools/castellano_suelto.js --crudo     sin la lista de aceptadas
 */
'use strict';
const fs = require('fs');
const path = require('path');
const FUENTE = require('./fuente');
const { PLACES, LINES, CAT } = require('./cargar');
let acorn;
try { acorn = require('/opt/node22/lib/node_modules/eslint/node_modules/acorn'); }
catch (e) { console.error('Cannot find module acorn: sin el no se pueden leer las filas del fuente'); process.exit(2); }

const RAIZ = FUENTE.RAIZ;
const ARGS = process.argv.slice(2);
const LISTA = ARGS.includes('--lista');
const CRUDO = ARGS.includes('--crudo');
const src = FUENTE.html();
const lee = p => JSON.parse(fs.readFileSync(path.join(RAIZ, p), 'utf8'));

/* Los idiomas salen del fuente, no de una lista escrita aqui. */
const TODOS = ((src.match(/SUPPORTED_LANGS\s*=\s*\[([^\]]*)\]/) || [, ''])[1])
  .split(',').map(x => x.trim().replace(/^['"]|['"]$/g, '')).filter(l => l && l !== 'es');
if (!TODOS.length) { console.error('no encuentro SUPPORTED_LANGS en index.html'); process.exit(2); }
const PEDIDO = ARGS.find(a => a[0] !== '-');
if (PEDIDO && !TODOS.includes(PEDIDO)) { console.log('uso: node tools/castellano_suelto.js [' + TODOS.join('|') + '] [--lista] [--crudo]'); process.exit(2); }
const IDIOMAS = PEDIDO ? [PEDIDO] : TODOS;

/* ── 1. TODOS LOS TEXTOS DE UN IDIOMA, cada uno con su castellano ──────────── */
const SUF = { es: 'Es', en: 'En', fr: 'Fr', de: 'De', it: 'It', nl: 'Nl', zh: 'Zh', zht: 'Zht', bg: 'Bg', pl: 'Pl' };
const valor = x => x && x.type === 'Literal' && typeof x.value === 'string' ? x.value
  : (x && x.type === 'TemplateLiteral' && !x.expressions.length ? x.quasis[0].value.cooked : null);
const clave = p => p.key.type === 'Identifier' ? p.key.name : String(p.key.value);
let _filas = null;
function filasDelFuente() {
  if (_filas) return _filas;
  const out = [], decls = {}, objetos = [];
  const linea = i => FUENTE.donde(src.slice(0, i).split('\n').length);
  const re = /<script\b([^>]*)>/gi;
  let m;
  while ((m = re.exec(src))) {
    const ini = m.index + m[0].length, fin = src.indexOf('</script>', ini);
    if (fin < 0) continue;
    re.lastIndex = fin;
    if (/\bsrc\s*=/i.test(m[1])) continue;
    const tipo = (m[1].match(/type\s*=\s*["']([^"']+)["']/i) || [])[1];
    if (tipo && !/^(text|application)\/(java|ecma)script$|^module$/i.test(tipo)) continue;
    let ast;
    try { ast = acorn.parse(src.slice(ini, fin), { ecmaVersion: 'latest', sourceType: 'script' }); }
    catch (e) { console.error('NO SE PUDO ANALIZAR el <script> de ' + linea(ini) + ': ' + e.message); process.exit(2); }
    (function anda(n) {
      if (!n || typeof n !== 'object') return;
      if (Array.isArray(n)) { n.forEach(anda); return; }
      if (n.type === 'VariableDeclarator' && n.id && n.id.type === 'Identifier' && n.init && n.init.type === 'ObjectExpression')
        (decls[n.id.name] = decls[n.id.name] || []).push([ini + n.init.start, ini + n.init.end]);
      if (n.type === 'ObjectExpression') objetos.push({ n, base: ini });
      for (const k of Object.keys(n)) if (k !== 'type' && k !== 'start' && k !== 'end') anda(n[k]);
    })(ast);
  }
  /* las tablas que el fuente declara sin traducir, con su motivo al lado:
     /* SIN-TRADUCIR: <nombre> ... (codigos de idioma, formatos de fecha) */
  const exentas = [];
  for (const x of src.matchAll(/SIN-TRADUCIR:\s*([A-Za-z_$][\w$]*)/g)) for (const r of (decls[x[1]] || [])) exentas.push(r);
  const exenta = (a, b) => exentas.some(([i, f]) => a >= i && b <= f);
  for (const { n, base } of objetos) {
    if (exenta(base + n.start, base + n.end)) continue;
    const cl = new Map();
    for (const p of n.properties) if (p.type === 'Property' && !p.computed) cl.set(clave(p), p.value);
    const donde = linea(base + n.start);
    if (cl.has('es') && valor(cl.get('es')) !== null) {
      const fila = {};
      for (const l of Object.keys(SUF)) if (cl.has(l)) { const v = valor(cl.get(l)); if (v !== null) fila[l] = v; }
      if (Object.keys(fila).length >= 2) out.push({ donde: 'fila ' + donde, fila });
    }
    if (cl.has('es') && cl.get('es').type === 'ObjectExpression') {
      const plano = (o, pre, dst) => {
        for (const p of o.properties) {
          if (p.type !== 'Property') continue;
          const v = valor(p.value);
          if (v !== null) dst[pre + clave(p)] = v;
          else if (p.value.type === 'ObjectExpression') plano(p.value, pre + clave(p) + '.', dst);
        }
      };
      const porL = {};
      for (const l of Object.keys(SUF)) if (cl.has(l) && cl.get(l).type === 'ObjectExpression') { porL[l] = {}; plano(cl.get(l), '', porL[l]); }
      if (Object.keys(porL).length >= 2) for (const k of Object.keys(porL.es)) {
        const fila = {};
        for (const l of Object.keys(porL)) if (porL[l][k] !== undefined) fila[l] = porL[l][k];
        out.push({ donde: 'tabla ' + donde + ' ' + k, fila });
      }
    }
    const fam = new Map();
    for (const [k, v] of cl) {
      const mm = /^(.+?)(Zht|Es|En|Fr|De|It|Nl|Zh|Bg|Pl)$/.exec(k);
      if (!mm) continue;
      const s = valor(v);
      if (s === null) continue;
      if (!fam.has(mm[1])) fam.set(mm[1], {});
      fam.get(mm[1])[mm[2].toLowerCase()] = s;
    }
    for (const [b, f] of fam) if (f.es !== undefined && Object.keys(f).length >= 2) out.push({ donde: 'sufijo ' + donde + ' ' + b, fila: f });
  }
  return (_filas = out);
}
const usadas = new Set();
for (const p of PLACES) for (const t of (p.tags || [])) usadas.add(t);
function textos(L) {
  const r = [];
  const fichas = lee('idiomas/' + L + '.json');
  for (const p of PLACES) for (const c of ['desc', 'cat', 'hours', 'aviso']) {
    const f = c === 'aviso' ? (p.parking && p.parking.aviso) : p[c];
    const es = f && typeof f.es === 'string' ? f.es : null;
    const t = (fichas[p.id] || {})[c];
    if (typeof t === 'string') r.push({ donde: 'lugar ' + p.id + '.' + c, es, txt: t });
  }
  const et = lee('idiomas/etiquetas/' + L + '.json');
  for (const [k, v] of Object.entries(et)) if (usadas.has(k)) r.push({ donde: 'etiqueta ' + k, es: k, txt: v });
  const fq = lee('faq/' + L + '.json'), fqes = new Map(lee('faq/es.json').e.map(x => [x.id, x]));
  for (const x of fq.e) {
    const e = fqes.get(x.id) || {};
    r.push({ donde: 'faq ' + x.id + '.l', es: e.l, txt: x.l });
    r.push({ donde: 'faq ' + x.id + '.a', es: e.a, txt: x.a });
  }
  const pv = lee('idiomas/privacidad/' + L + '.json'), pves = lee('idiomas/privacidad/es.json');
  for (const [k, v] of Object.entries(pv)) if (typeof v === 'string') r.push({ donde: 'privacidad ' + k, es: pves[k], txt: v });
  for (const f of filasDelFuente()) if (typeof f.fila[L] === 'string') r.push({ donde: f.donde, es: f.fila.es, txt: f.fila[L] });
  return r;
}

/* ── 2. FUERA LOS NOMBRES PROPIOS antes de buscar palabras ─────────────────
   Un nombre de playa, de calle o de parada se escribe igual en todos los
   idiomas: no es castellano suelto. Salen del propio catalogo, no de una
   lista a mano: places[] (nombre, alias y el sitio que va al final de `cat`),
   las paradas y lineas de TITSA y las etiquetas declaradas como nombre. */
const nombres = new Set();
for (const p of PLACES) {
  if (p.name) nombres.add(p.name);
  if (p.alias) String(p.alias).split(/[,;|]/).forEach(a => a.trim() && nombres.add(a.trim()));
  if (p.cat && p.cat.es) { const tr = p.cat.es.split(/[·()]/).map(x => x.trim()).filter(Boolean); if (tr.length) nombres.add(tr[tr.length - 1]); }
}
for (const k of Object.keys(CAT)) if (CAT[k] && CAT[k].n) nombres.add(CAT[k].n);
for (const l of LINES) {
  if (l.nombre) { nombres.add(l.nombre); l.nombre.split(/\s+[—–-]\s+|\s*↔\s*|\s*\(|\)/).map(x => x.trim()).filter(x => x.length > 2).forEach(x => nombres.add(x)); }
  for (const q of (l.paradas || [])) if (q && q.nombre) nombres.add(q.nombre);
}
const DECL = lee('idiomas/etiquetas-sin-traducir.json');
for (const [k, v] of Object.entries(DECL)) if (Array.isArray(v) && !/^cifra|^codigo|^sigla/.test(k)) v.forEach(x => nombres.add(x));
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const listaNombres = [...nombres].filter(x => x && x.length >= 3).sort((a, b) => b.length - a.length);
const trozos = [];
for (let i = 0; i < listaNombres.length; i += 300)
  trozos.push(new RegExp('(?<![\\p{L}])(?:' + listaNombres.slice(i, i + 300).map(esc).join('|') + ')(?![\\p{L}])', 'gu'));
/* Los nombres que no estan en el catalogo pero se reconocen por su forma:
   «Calle Chile», «Barranco del Rey», «Roques de García», «Charco de la Laja»... */
/* la primera palabra vale con mayuscula o sin ella: el castellano escribe
   «en la calle Chile 4» y la traduccion lo copia igual */
const GENERICO = '(?:' + ['Calle', 'Avenida', 'Avda\\.', 'Av\\.', 'C\\/', 'C\\.', 'Carretera', 'Ctra\\.', 'Camino', 'Urbanizaci[oó]n',
  'Pol[ií]gono', 'Plaza', 'Paseo', 'Rambla', 'Traves[ií]a', 'Vereda', 'Glorieta', 'Playa', 'Roques?', 'Barranco', 'Monta[ñn]as?',
  'Charcos?', 'Cueva', 'Mirador', 'Iglesia', 'Ermita', 'Casa', 'Finca', 'Lomo', 'Pico', 'Punta', 'Risco', 'Degollada', 'Caser[ií]o',
  'Parque', 'Museo', 'Bodega', 'Grupo', 'Asociaci[oó]n', 'Club'].map(w => /^[A-Z]/.test(w) ? '[' + w[0] + w[0].toLowerCase() + ']' + w.slice(1) : w).join('|') + ')';
const RE_GENERICO = new RegExp('(?<![\\p{L}])' + GENERICO + '(?:\\s+(?:[\\p{Lu}\\d][\\p{L}\\d\'’ºª-]*|(?:del|de|las|la|los|el|y)(?![\\p{L}])|s\\/n))+', 'gu');
const RE_CONECTOR = /(?<![\p{L}])\p{Lu}[\p{L}'’-]*(?:\s+(?:de|del|de la|de las|de los|la|las|los|el|y)\s+\p{Lu}[\p{L}'’-]*)+/gu;
/* UN NOMBRE DEL CATALOGO SOLO SE QUITA SI EL CASTELLANO DE ESE MISMO TEXTO
   LO TIENE. Un nombre que la traduccion copia del original esta en el
   original. Sin esta condicion se escapaba la etiqueta «Malpais» traducida
   «Malpaís» en frances: «Malpaís» es el nombre de dos paradas de guagua, y el
   catalogo la borraba antes de mirarla. */
function sinNombres(t, es) {
  /* primero las formas («Avenida Juan Carlos I»), luego el catalogo: al
     reves, el catalogo se comia «Juan Carlos I» y «Avenida» se quedaba sola */
  let s = String(t).replace(/📍[^·\n]*/g, ' § ')
    .replace(/https?:\/\/\S+|\S+@\S+\.\S+|\b[\w./-]+\.(?:es|com|org|net|eu|sql|json|js)\b\S*|\{[\w.]+\}/g, ' § ')
    .replace(RE_GENERICO, ' § ').replace(RE_CONECTOR, ' § ');
  const enEs = new Map();
  const loTiene = m => {
    if (typeof es !== 'string') return true;
    if (!enEs.has(m)) enEs.set(m, new RegExp('(?<![\\p{L}])' + esc(m) + '(?![\\p{L}])', 'u').test(es));
    return enEs.get(m);
  };
  for (const re of trozos) s = s.replace(re, m => loTiene(m) ? ' § ' : m);
  return s;
}

/* ── 3. LAS REGLAS ─────────────────────────────────────────────────────── */
/* Palabras corrientes del castellano que no son palabra en ninguno de los
   idiomas de alfabeto latino de la app. En minuscula: con mayuscula van
   dentro de un nombre («Barranco del Rey»), y esos ya se quitaron arriba.
   Cada una entro porque aparecio sin traducir el 10 de octubre de 2026. */
const CORRIENTES = new Set((
  'romería romerías mirador miradores barranco barrancos malpaís malpais picón medianía medianías ermita ermitas ' +
  'finca fincas avenida avenidas lonja morcilla monteverde fayal brezal fayal-brezal tabaibal cardonal lagunero laguneros ' +
  'lagunera gorrilla gorrillas charanga charangas aeroexprés cumbre cumbres roque roques playa playas calle calles ' +
  'guachinchero guachinchera bodegón ajardinado ajardinada pirotecnia residente submarino tosca artesonado ' +
  'iglesia virgen mercadillo mercadillos charco charcos cueva cuevas montaña montañas sendero senderos degollada caserío ' +
  'pueblo pueblos barrio barrios casco'
).split(/\s+/));
/* letras del castellano que ese idioma no usa (el polaco si usa la «ó») */
const AJENAS = { pl: /[áíúñ]/i, def: /[áíóúñ]/i };
/* «¿» y «¡» se miran en el texto, no en las palabras: PAL solo coge letras,
   asi que mirandolos dentro de cada palabra esta regla no podia saltar nunca
   (lo encontro la prueba de meter «¿Czym jest...?» en el polaco). */
const ESPANOLAS = /[¿¡]\p{L}*/gu;
/* el alfabeto de cada idioma, sacado de sus propios textos */
function escrituraDe(ts) {
  let lat = 0, cir = 0, han = 0;
  for (const t of ts) for (const ch of t.txt) {
    if (/[a-zA-Z]/.test(ch)) lat++; else if (/[Ѐ-ӿ]/.test(ch)) cir++; else if (/[一-鿿]/.test(ch)) han++;
  }
  return han > lat && han > cir ? 'han' : cir > lat ? 'cirilico' : 'latino';
}
const PAL = /[\p{L}][\p{L}'’-]*[\p{L}]|[\p{L}]/gu;
const LATINA = /^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ'’-]*$/;
/* Dos expresiones y no una: juntas, con la bandera «i» de las unidades, la
   de los codigos («TF-5», «GR-131») casaba con CUALQUIER palabra en
   minuscula, y la regla del alfabeto latino en bulgaro y chino no salto nunca.
   Lo encontro la prueba de meter «mirador» a proposito en una ficha china. */
const CODIGO = /^[A-Z0-9][A-Z0-9-]*$/;
const UNIDAD = /^(?:km|min|cm|mm|kg|ml|ha|kw|kwh|cv|hp|uv|gps|wifi|wi-fi|pdf|gpx|app|apps|bus|wc|lat|lng)$/i;
/* el castellano pasado tal cual al cirilico, como lo pasaria quien no lo
   traduce: «romería» -> «ромерия», «cardonal» -> «кардонал». */
function aCirilico(w) {
  w = w.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  w = w.replace(/ch/g, 'ч').replace(/ll/g, 'й').replace(/qu/g, 'к').replace(/gu(?=[ei])/g, 'г')
    .replace(/g(?=[ei])/g, 'х').replace(/c(?=[ei])/g, 'с').replace(/ñ/g, 'н');
  const M = { a: 'а', b: 'б', c: 'к', d: 'д', e: 'е', f: 'ф', g: 'г', h: '', i: 'и', j: 'х', k: 'к', l: 'л', m: 'м', n: 'н', o: 'о',
    p: 'п', r: 'р', s: 'с', t: 'т', u: 'у', v: 'в', w: 'у', x: 'кс', y: 'й', z: 'с' };
  return w.split('').map(c => M[c] !== undefined ? M[c] : c).join('');
}
const llano = w => w.toLowerCase().replace(/я/g, 'иа').replace(/ю/g, 'иу').replace(/й/g, 'и').replace(/ь/g, '')
  .replace(/(.)\1+/g, '$1');
/* la raiz, sin la vocal final ni la «с» del plural castellano: el bulgaro
   pone su plural al castellano copiado («чаранги» por «charangas») */
const raiz = w => llano(w).replace(/с$/, '').replace(/[аеиоуъ]+$/, '');

/* ── 4. FRASES Y LONGITUD ─────────────────────────────────────────────────
   Un punto no acaba frase detras de una abreviatura que va antes de un
   nombre («C. Malpais 10», «Av. Ángel Guimerá», «ул. Ретама») ni detras de un
   dia abreviado si lo que sigue es una hora («Mo.-Fr. 9-17»). Si acaba
   detras de una unidad («17 km. Het…», «18-24°C. Open…»), de un plural con
   apostrofo («mojo's. Populair») o delante de «'s Nachts», que en neerlandes
   empieza frase con minuscula. Cada caso salio de un aviso falso. */
const ABR_NOMBRE = new Set(('C Av Avda Ctra Gral Dr Sr Sra Sto Sta St Ste Ntra Trav Urb Pol Bco Mte Hnos Pza Pl Ul ul al pl ' +
  'np tzw s ss S Nº nº n No no ул бул гр с ок напр вкл С Ст Mt Ft Rd Ave Prof Ing Bros Co Inc Ltd vs etc approx ca bzw usw vgl ggf ' +
  'evtl inkl Jh Jhd tel Tel Tél Tlf tlf Ref CC DO').split(' '));
const ABR_DIA = new Set(('Mo Di Mi Do Fr Sa So Lun Mar Mié Jue Vie Sáb Dom Mon Tue Wed Thu Fri Sat Sun Lu Ma Me Gi Ve Pn Wt Śr ' +
  'Czw Pt Nd ma di wo do vr za zo Пон Вто Сря Чет Пет Съб Нед L V S D').split(' '));
function frases(t) {
  t = String(t).replace(/📍.*/s, '').replace(/(\d)\.(\d)/g, '$1$2').replace(/\b([A-ZÁÉÍÓÚ])\.(?=[A-Z])/g, '$1');
  const n = [];
  let ini = 0;
  const re = /[.!?…]+/g;
  let m;
  while ((m = re.exec(t))) {
    const resto = t.slice(m.index + m[0].length);
    const sigue = resto.trimStart();
    if (resto.trim()) {
      if (!/^\s/.test(resto)) continue;
      const c = sigue.replace(/^["«„“(¿¡']+/, '').charAt(0);
      const nuevo = c && (c !== c.toLowerCase() || /\d/.test(c) || '⚠🕐📍☎✈🚌'.includes(c)) || /^['’]s\s/.test(sigue);
      if (!nuevo) continue;
    }
    const antes = (t.slice(0, m.index).match(/([\p{L}\d.'’°]+)$/u) || [])[1] || '';
    const ultimo = antes.split('-').pop();
    if (m[0] === '.' && antes) {
      if (ABR_NOMBRE.has(antes) || ABR_NOMBRE.has(ultimo)) continue;
      if ((ABR_DIA.has(antes) || ABR_DIA.has(ultimo)) && /^\d/.test(sigue)) continue;
    }
    n.push(t.slice(ini, m.index + m[0].length));
    ini = m.index + m[0].length;
  }
  if (t.slice(ini).trim()) n.push(t.slice(ini));
  return n.filter(p => p.trim().length > 2).length;
}
const sinFicha = s => String(s || '').replace(/📍.*/s, '');
const mediana = a => { const b = [...a].sort((x, y) => x - y); return b.length ? b[Math.floor(b.length / 2)] : 1; };

/* ── 5. LO ACEPTADO, con su motivo ─────────────────────────────────────── */
const ACEP = CRUDO ? { palabras: {}, frases: {}, cortas: {} } : lee('idiomas/castellano-aceptado.json');
function aceptadas(seccion, L) {
  const out = [];
  for (const [motivo, porL] of Object.entries(ACEP[seccion] || {}))
    for (const [l, lista] of Object.entries(porL))
      if (l === 'todos' || l === L) for (const x of lista) out.push({ x, motivo, l });
  return out;
}

/* ── 6. CADA IDIOMA ─────────────────────────────────────────────────────── */
let total = 0;
const usadasTodos = new Set();
for (const L of IDIOMAS) {
  const ts = textos(L);
  const alfa = escrituraDe(ts);
  const hall = { palabras: [], frases: [], cortas: [] };
  /* las palabras que este idioma usa por su cuenta: las que aparecen en un
     texto cuyo castellano NO las tiene */
  const propias = new Set();
  for (const t of ts) {
    const es = new Set((String(t.es || '').match(PAL) || []).map(w => w.toLowerCase()));
    /* en cirilico, «el castellano tiene esa palabra» es tenerla transliterada */
    const esCir = alfa === 'cirilico' ? new Set([...es].map(e => llano(aCirilico(e)))) : null;
    for (const w of (String(t.txt).match(PAL) || [])) {
      const lw = w.toLowerCase();
      if (esCir ? !esCir.has(llano(lw)) : !es.has(lw)) propias.add(lw);
    }
  }
  const acPal = aceptadas('palabras', L);
  const usadaAc = new Set();
  /* «palabra@donde» vale solo en ese texto; «palabra@es:trozo» en los textos
     cuyo castellano dice ese trozo. La segunda es para las filas del fuente,
     cuyo «donde» lleva el numero de linea y cambia con cada cambio de arriba. */
  const aceptada = (w, t) => {
    const lw = w.toLowerCase();
    for (const a of acPal) {
      const i = a.x.indexOf('@'), pal = i < 0 ? a.x : a.x.slice(0, i), sitio = i < 0 ? '' : a.x.slice(i + 1);
      if (pal.toLowerCase() !== lw) continue;
      const vale = !sitio || (sitio.startsWith('es:') ? String(t.es || '').includes(sitio.slice(3)) : sitio === t.donde);
      if (vale) { usadaAc.add(a.x + '|' + a.l); return true; }
    }
    return false;
  };
  for (const t of ts) {
    const limpio = sinNombres(t.txt, t.es);
    const esPal = new Set((String(t.es || '').match(PAL) || [])
      .filter(w => w === w.toLowerCase() || t.donde.startsWith('etiqueta ')).map(w => w.toLowerCase()));
    const vistas = new Set();
    /* En chino no hay espacios: «配mojo辣酱» es un solo «token» para PAL, y la
       palabra latina de dentro no se veia. Fuera del alfabeto latino se mira
       tambien cada tramo latino por separado. */
    let palabras = limpio.match(PAL) || [];
    if (alfa !== 'latino') palabras = palabras.flatMap(w => /[A-Za-zÀ-ÿ]/.test(w) && !LATINA.test(w)
      ? [w].concat(w.match(/[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ'’-]*/g) || []) : [w]);
    /* ningun otro idioma abre las preguntas ni las exclamaciones */
    for (const m of limpio.matchAll(ESPANOLAS)) {
      if (vistas.has(m[0])) continue;
      vistas.add(m[0]);
      if (!aceptada(m[0], t)) hall.palabras.push({ w: m[0], porque: 'signo castellano', donde: t.donde, txt: t.txt });
    }
    for (const w of palabras) {
      const lw = w.toLowerCase();
      if (vistas.has(lw)) continue;
      let porque = null;
      if (alfa === 'latino') {
        /* La mayuscula suele ser un nombre propio, y se deja. Salvo en dos
           sitios: las etiquetas, que son rotulos y van todas con mayuscula
           («Malpaís» por «Malpais» en tres idiomas), y el aleman, que escribe
           con mayuscula todos los sustantivos («die Laguneros»). */
        const rotulo = t.donde.startsWith('etiqueta ');
        const minus = w === lw || rotulo || (L === 'de' && !/[áíóúñ]/i.test(w));
        if ((w === lw || rotulo) && (AJENAS[L] || AJENAS.def).test(w)) porque = 'letra que el idioma no usa';
        /* en aleman, las CORRIENTES con acento tambien: «die Romería» es un
           sustantivo sin traducir, no un nombre (los nombres ya se quitaron) */
        else if ((minus || L === 'de') && CORRIENTES.has(lw)) porque = 'palabra castellana';
        /* copiada: con terminacion de plural castellano. Sin ese filtro salian
           cientos de palabras que el idioma escribe igual («hospital»,
           «social», «premium»); los restos de verdad sin plural -«lonja»,
           «submarino»- los recoge la lista de CORRIENTES. */
        else if (minus && w.length >= 5 && /(?:as|os|es)$/.test(lw) && esPal.has(lw) && !propias.has(lw)) porque = 'copiada del castellano';
      } else {
        if (LATINA.test(w) && w === lw && w.length >= 3 && !CODIGO.test(w) && !UNIDAD.test(w)) porque = 'alfabeto latino';
        /* en cirilico, las mismas dos reglas de las palabras castellanas pasadas
           tal cual: las CORRIENTES y las copiadas con plural castellano.
           Con cualquier palabra copiada salian cincuenta de mas -«футбол»,
           «пикник», «калдера»-, que el bulgaro escribe igual que el
           castellano porque las dos las tomaron de otra lengua. */
        else if (alfa === 'cirilico' && w === lw && w.length >= 5) {
          const ll = llano(w);
          const rz = raiz(w);
          for (const c of CORRIENTES) {
            const cc = aCirilico(c);
            if (llano(cc) === ll || (rz.length >= 5 && raiz(cc) === rz)) { porque = 'castellano en cirilico (' + c + ')'; break; }
          }
          if (!porque && !propias.has(lw))
            for (const e of esPal) if (e.length >= 5 && /(?:as|os|es)$/.test(e) && llano(aCirilico(e)) === ll) { porque = 'copiada en cirilico (' + e + ')'; break; }
        }
      }
      if (!porque) continue;
      vistas.add(lw);
      if (aceptada(w, t)) continue;
      hall.palabras.push({ w, porque, donde: t.donde, txt: t.txt });
    }
  }
  /* frases y longitud: solo las descripciones de las fichas, que es donde
     el castellano crecio despues de traducirlas */
  const descs = ts.filter(t => /^lugar .*\.desc$/.test(t.donde) && t.es);
  const acFr = new Set(aceptadas('frases', L).map(a => a.x)), acCo = new Set(aceptadas('cortas', L).map(a => a.x));
  const usadaFr = new Set(), usadaCo = new Set();
  if (alfa !== 'han') for (const t of descs) {
    const id = t.donde.slice(6, -5);
    const ne = frases(t.es), nl = frases(t.txt);
    if (nl < ne) { if (acFr.has(id)) usadaFr.add(id); else hall.frases.push({ id, ne, nl, es: t.es, txt: t.txt }); }
  }
  const rs = descs.filter(t => sinFicha(t.es).length >= 60).map(t => ({ t, r: sinFicha(t.txt).length / sinFicha(t.es).length }));
  const med = mediana(rs.map(x => x.r)), umbral = alfa === 'han' ? 0.55 : 0.75;
  for (const { t, r } of rs) if (r / med < umbral) {
    const id = t.donde.slice(6, -5);
    if (acCo.has(id)) usadaCo.add(id); else hall.cortas.push({ id, r: r / med, es: t.es, txt: t.txt });
  }
  /* lo aceptado que ya no hace falta */
  const sobran = [];
  if (!CRUDO) {
    for (const a of acPal) if (!usadaAc.has(a.x + '|' + a.l) && (a.l === L || a.l === 'todos')) {
      if (a.l === 'todos') continue;       // las de todos se miran al final, contra los nueve
      sobran.push('palabra ' + a.x + '  (' + a.motivo.slice(0, 50) + ')');
    }
    for (const id of acFr) if (!usadaFr.has(id)) sobran.push('frases ' + id);
    for (const id of acCo) if (!usadaCo.has(id)) sobran.push('cortas ' + id);
  }
  for (const a of acPal) if (a.l === 'todos' && usadaAc.has(a.x + '|todos')) usadasTodos.add(a.x);

  const n = hall.palabras.length + hall.frases.length + hall.cortas.length + sobran.length;
  total += n;
  const P = (k, v) => console.log('  ' + String(k).padEnd(38, '.') + ' ' + v);
  console.log('=== ' + L + ' (' + alfa + ') ===');
  P('textos mirados', ts.length);
  P('palabras en castellano', hall.palabras.length);
  P('descripciones con frases de menos', hall.frases.length);
  P('descripciones mucho mas cortas', hall.cortas.length + '   (mediana ' + med.toFixed(2) + ', umbral ' + umbral + ')');
  if (sobran.length) P('ACEPTADAS QUE YA NO HACEN FALTA', sobran.length);
  const corta = LISTA ? 1e9 : 12;
  hall.palabras.slice(0, corta).forEach(h => {
    const i = h.txt.indexOf(h.w);
    console.log('     ' + h.w.padEnd(20) + ' ' + h.porque.padEnd(26) + ' ' + h.donde.slice(0, 40).padEnd(41) + '«' + h.txt.slice(Math.max(0, i - 30), i + 40).replace(/\n/g, ' ') + '»');
  });
  hall.frases.slice(0, corta).forEach(h => console.log('     frases ' + h.id + ': castellano ' + h.ne + ', ' + L + ' ' + h.nl));
  hall.cortas.slice(0, corta).forEach(h => console.log('     corta  ' + h.id + ': ' + h.r.toFixed(2) + ' de lo normal'));
  sobran.slice(0, corta).forEach(s => console.log('     sobra  ' + s));
  if (!LISTA && n > 3 * corta) console.log('     (--lista para verlos todos)');
}
/* las aceptadas «para todos» que no salen en NINGUN idioma: solo se puede
   saber si se han mirado los nueve */
if (!CRUDO && !PEDIDO) {
  const sobranTodos = aceptadas('palabras', '__ninguno__').filter(a => a.l === 'todos' && !usadasTodos.has(a.x));
  if (sobranTodos.length) {
    console.log('=== aceptadas para todos que no sale en ningun idioma: ' + sobranTodos.length + ' ===');
    sobranTodos.forEach(a => console.log('     sobra  ' + a.x + '  (' + a.motivo.slice(0, 60) + ')'));
    total += sobranTodos.length;
  }
}
console.log(total ? '\n  ' + total + ' caso(s) que mirar' : '\n  OK');
process.exitCode = total ? 1 : 0;
