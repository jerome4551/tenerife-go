#!/usr/bin/env node
/* cielo_construir.js — datos/cielo.json, el catalogo del panel «Cielo de Tenerife».
 *
 *     bash tools/cielo_fuentes.sh /tmp/fuentes-cielo     # una vez
 *     node tools/cielo_construir.js /tmp/fuentes-cielo   # escribe datos/cielo.json
 *     node tools/cielo_construir.js /tmp/fuentes-cielo --comprobar
 *                                  # no escribe: falla si el fichero no es el que sale
 *
 * QUE HAY DENTRO. Solo numeros y designaciones: posiciones J2000, brillos,
 * tamanos, el nivel de instrumento y los meses buenos. NI UN TEXTO PARA EL
 * USUARIO: los nombres en los diez idiomas van con el codigo del panel, en
 * modulos/cielo.js, donde los ven las herramientas de idiomas (tools/fuente.js
 * lo pega al fuente; este fichero no lo lee nadie mas que el panel).
 *
 * DE DONDE SALE CADA COSA (versiones fijas en tools/cielo_fuentes.sh):
 *   estrellas, constelaciones   HYG-Database v4.1 (CC BY-SA 4.0)
 *   lineas, limites, Via Lactea d3-celestial (BSD-3)
 *   cielo profundo              OpenNGC (CC BY-SA 4.0): tipo, posicion, tamano,
 *                               numero Messier y Caldwell; la magnitud VISUAL,
 *                               del SAC 8.1 y del SEDS via d3-celestial, y si
 *                               no hay, la V y luego la B de OpenNGC
 *   dobles                      Yale Bright Star Catalogue 5 (1991)
 *   variables                   GCVS 5.1 (extracto de Stellarium, 2026-07-20)
 *   lluvias de estrellas        IMO (ver LLUVIAS, abajo)
 *   declinacion magnetica       WMM2025 (NOAA y BGS, dominio publico)
 * Por ser derivado de HYG y OpenNGC, el fichero va con CC BY-SA 4.0.
 *
 * EL NIVEL (1 simple vista, 2 prismaticos, 3 telescopio) NO SE ESCRIBE A MANO:
 * sale de la magnitud visual corregida por la altura maxima a la que el objeto
 * llega desde Tenerife (extincion, ver nivelDe). Es el instrumento MINIMO con
 * cielo oscuro, el de las cumbres; desde la costa o con Luna, uno mas.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const RAIZ = path.dirname(__dirname);
const args = process.argv.slice(2);
const F = args.find(a => !a.startsWith('--')) || '/tmp/fuentes-cielo';
const COMPROBAR = args.includes('--comprobar');
const A = require(path.join(F, 'astro/source/js/astronomy.js'));

/* El observador de referencia es el Observatorio del Teide: la ficha
   «observatorio» de places[] (28.2987, -16.5106). La isla va de 27,99 a
   28,59 de latitud: lo que cambia la altura maxima de un objeto es menos de
   0,3 grados, y se dice asi en el panel. */
const OBS = { lat: 28.2987, lon: -16.5106, h: 2390 };
const DEC_MIN = OBS.lat - 90;              // -61,7: lo que nunca sale
const R = x => x * Math.PI / 180;
const D = x => x * 180 / Math.PI;
const red = (x, n) => x === null || x === undefined || !isFinite(x) ? null : Number(x.toFixed(n));
const altMax = dec => 90 - Math.abs(OBS.lat - dec);

/* ── CSV con comillas (HYG) ─────────────────────────────────────── */
function csv(texto, sep) {
  const filas = []; let fila = [], campo = '', dentro = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (dentro) {
      if (c === '"') { if (texto[i + 1] === '"') { campo += '"'; i++; } else dentro = false; }
      else campo += c;
    } else if (c === '"') dentro = true;
    else if (c === sep) { fila.push(campo); campo = ''; }
    else if (c === '\n') { fila.push(campo.replace(/\r$/, '')); filas.push(fila); fila = []; campo = ''; }
    else campo += c;
  }
  if (campo || fila.length) { fila.push(campo); filas.push(fila); }
  const cab = filas.shift();
  return filas.filter(f => f.length === cab.length).map(f => Object.fromEntries(cab.map((k, i) => [k, f[i]])));
}
const num = s => (s === undefined || s === null || String(s).trim() === '') ? null : (isFinite(+s) ? +s : null);

/* ── Letras griegas de HYG («Gam-1» -> «γ¹») ─────────────────────── */
const GRIEGO = { Alp:'α', Bet:'β', Gam:'γ', Del:'δ', Eps:'ε', Zet:'ζ', Eta:'η', The:'θ', Iot:'ι', Kap:'κ', Lam:'λ',
  Mu:'μ', Nu:'ν', Xi:'ξ', Omi:'ο', Pi:'π', Rho:'ρ', Sig:'σ', Tau:'τ', Ups:'υ', Phi:'φ', Chi:'χ', Psi:'ψ', Ome:'ω' };
const SUPER = { 1:'¹', 2:'²', 3:'³', 4:'⁴', 5:'⁵', 6:'⁶', 7:'⁷', 8:'⁸', 9:'⁹' };
function bayer(b, flam, con) {
  if (b) {
    const m = b.match(/^([A-Za-z]+)(?:-(\d))?$/);
    if (m && GRIEGO[m[1]]) return GRIEGO[m[1]] + (m[2] ? SUPER[m[2]] : '') + ' ' + con;
  }
  return flam ? flam + ' ' + con : null;
}

/* ── Meses buenos ────────────────────────────────────────────────────
   Para cada mes (el dia 15 de 2027, que es un ano cualquiera: esto no
   caduca en decadas) se toma la noche astronomica de Izana -Sol por debajo
   de -18 grados- y se mira cada 20 minutos a que altura esta el objeto.
   Un mes es bueno si en plena noche sube al menos min(40, 0,75 de su altura
   maxima): asi un objeto del sur que no pasa de 14 grados tiene meses buenos,
   los de cuando llega a esos 14 de noche, y uno del norte necesita 40. */
const OBSA = new A.Observer(OBS.lat, OBS.lon, OBS.h);
const NOCHES = [];
for (let m = 0; m < 12; m++) {
  const t0 = A.MakeTime(new Date(Date.UTC(2027, m, 15, 12, 0, 0)));
  const ocaso = A.SearchAltitude(A.Body.Sun, OBSA, -1, t0, 1, -18);
  const alba = A.SearchAltitude(A.Body.Sun, OBSA, +1, ocaso, 1, -18);
  const lst = [];
  for (let t = ocaso.ut; t <= alba.ut; t += 20 / 1440) {
    const tt = A.MakeTime(t);
    lst.push(((A.SiderealTime(tt) + OBS.lon / 15) % 24 + 24) % 24 * 15);   // grados
  }
  NOCHES.push(lst);
}
/* J2000 -> equinoccio de 2027: 0,37 grados de precesion. Para decir si un
   mes es bueno no cambia nada, pero no cuesta hacerlo bien. */
const PREC = A.Rotation_EQJ_EQD(A.MakeTime(new Date(Date.UTC(2027, 6, 1))));
function deFecha(ra, dec) {
  const v = A.VectorFromSphere(new A.Spherical(dec, ra, 1), A.MakeTime(0));
  const w = A.RotateVector(PREC, v);
  const s = A.SphereFromVector(w);
  return [s.lon, s.lat];
}
function meses(ra, dec) {
  const [a, d] = deFecha(ra, dec);
  const am = altMax(d);
  const umbral = Math.min(40, 0.75 * am);
  let mask = 0;
  NOCHES.forEach((lst, m) => {
    let mejor = -90;
    for (const s of lst) {
      const h = D(Math.asin(Math.sin(R(OBS.lat)) * Math.sin(R(d)) + Math.cos(R(OBS.lat)) * Math.cos(R(d)) * Math.cos(R(s - a))));
      if (h > mejor) mejor = h;
    }
    if (am > 0 && mejor >= umbral) mask |= (1 << m);
  });
  return mask;
}

/* ── Extincion y nivel ───────────────────────────────────────────────
   Masa de aire de Kasten y Young (1989) y 0,2 magnitudes por masa de aire:
   un valor generico y prudente (en un sitio de alta montana suele ser algo
   menos). Solo pesa en lo que pasa bajo: a 14 grados, omega Centauri pierde
   0,6 magnitudes. */
const K_EXT = 0.2;
const masaAire = h => 1 / (Math.sin(R(h)) + 0.50572 * Math.pow(h + 6.07995, -1.6364));
function magEfectiva(m, alt) { return m + K_EXT * (masaAire(Math.max(alt, 0.5)) - 1); }

/* Umbrales (magnitud efectiva) por clase de objeto. 10x50 con cielo oscuro. */
const UMBRAL = {
  cumulo:     [5.0, 8.5],
  nebulosa:   [4.5, 8.0],
  galaxia:    [4.5, 9.0],
  planetaria: [null, 8.0],    // y ademas 3' o mas: una planetaria pequena es un punto
  doble:      [null, 8.5],
  asterismo:  [null, null],
  oscura:     [null, null]
};
function nivelDe(clase, mEf, tam) {
  const u = UMBRAL[clase];
  if (mEf === null) return null;
  if (u[0] !== null && mEf <= u[0]) return 1;
  if (u[1] !== null && mEf <= u[1] && (clase !== 'planetaria' || (tam || 0) >= 3)) return 2;
  return 3;
}

/* ════════════════ ESTRELLAS (HYG v4.1) ════════════════ */
const hyg = csv(fs.readFileSync(path.join(F, 'hyg/hyg/CURRENT/hygdata_v41.csv'), 'utf8'), ',');
const porHip = new Map();
for (const s of hyg) if (s.hip) porHip.set(+s.hip, s);
const MAG_MAPA = 5.5;

/* Las estrellas del catalogo: las de nombre propio (IAU) de magnitud 2,0 o
   menos que asoman desde Tenerife, y unas cuantas mas por lo que tienen que
   ver: un sistema famoso, una variable, la Polar. Las del sur que rozan el
   horizonte entran: «¿se ve la Cruz del Sur?» es una pregunta de verdad, y la
   respuesta es su altura maxima. */
const ESTRELLAS_EXTRA = [65378, 65477, 95947, 14576, 10826, 17702, 68756, 61084, 62434, 71683, 68702, 7588, 30438, 91262, 11767];
/* Toliman es alfa-2 Centauri: la misma estrella que se ve como Rigil
   Kentaurus. Dos filas para un punto de luz confunden. */
const ESTRELLAS_FUERA = [71681];
const nombradas = [];
for (const s of hyg) {
  if (!s.proper || s.id === '0' || !s.hip) continue;
  const m = num(s.mag), dec = num(s.dec);
  const am = altMax(dec);
  if (am <= 0) continue;
  if (ESTRELLAS_FUERA.includes(+s.hip)) continue;
  if (m <= 2.0 || ESTRELLAS_EXTRA.includes(+s.hip)) nombradas.push(s);
}
/* GCVS 5.1 (extracto de Stellarium): tipo, rango y periodo de las variables */
const gcvs = new Map();
{
  const zlib = require('zlib');
  const txt = zlib.gunzipSync(fs.readFileSync(path.join(F, 'stel/stars/hip_gaia3/gcvs.cat'))).toString('utf8');
  for (const l of txt.split('\n')) {
    if (!l || l[0] === '#') continue;
    const c = l.split('\t');
    /* c[4] es la marca de la magnitud: 0 = el minimo es una magnitud; 1 = es
       una AMPLITUD (Hadar «0,61 (0,04)»). Leerlo como minimo daria una
       estrella que «baja» de 0,61 a 0,04. */
    gcvs.set(+c[0], { des: c[1], tipo: c[2], max: num(c[3]), marca: c[4], min: num(c[5]), per: num(c[9]), sp: c[11] || '' });
  }
}
/* El tipo espectral, del BSC (Yale, 5.a ed.) cuando la estrella esta en el:
   el de HYG viene del Hipparcos y en alguna brillante no es el suyo -Capella
   sale «M1: comp», cuando es una pareja de gigantes G (G5IIIe+G0III)-. */
const bscPorHD = new Map();
for (const b of JSON.parse(fs.readFileSync(path.join(F, 'bsc/bsc5-all.json'), 'utf8'))) if (b.HD) bscPorHD.set(String(+b.HD), b);
const espectro = s => { const b = s.hd ? bscPorHD.get(String(+s.hd)) : null; return (b && b.SpType && b.SpType.trim()) || s.spect || null; };
/* HYG da la distancia en parsecs; 100000 es «sin paralaje fiable» */
const anosLuz = s => { const d = num(s.dist); return d && d < 100000 ? red(d * 3.261564, d * 3.26 < 100 ? 1 : 0) : null; };
/* Dos cifras significativas: la luminosidad sale de la distancia, y la del
   Hipparcos tiene un 10-30 % de error en las lejanas (ver distancia() en el
   panel). */
const dosCifras = x => { if (!x || !isFinite(x)) return null; const p = Math.pow(10, Math.floor(Math.log10(x)) - 1); return Number((Math.round(x / p) * p).toPrecision(2)); };

/* Las estrellas de la carta, hasta la 5,5: [ra, dec, mag, B-V, HIP, anos luz,
   designacion de Bayer o Flamsteed, tipo espectral]. Las tres ultimas son lo
   que dice la ficha al tocar una estrella sin nombre («η Ori · B1V+B2:e ·
   unos 900 anos luz»). */
const estrellasMapa = [];
for (const s of hyg) {
  const m = num(s.mag), dec = num(s.dec);
  if (s.id === '0' || m === null || m > MAG_MAPA || dec < DEC_MIN - 1) continue;
  estrellasMapa.push([red(num(s.ra) * 15, 2), red(dec, 2), red(m, 1), num(s.ci) === null ? null : red(num(s.ci), 1), s.hip ? +s.hip : 0,
                      anosLuz(s), bayer(s.bayer, s.flam, s.con), espectro(s)]);
}
estrellasMapa.sort((a, b) => a[2] - b[2] || a[0] - b[0] || a[1] - b[1]);
const catEstrellas = nombradas.map(s => {
  const dec = num(s.dec), ra = num(s.ra) * 15;
  const dist = num(s.dist);
  const v = gcvs.get(+s.hip);
  return {
    h: +s.hip, n: s.proper, b: bayer(s.bayer, s.flam, s.con), c: s.con,
    m: red(num(s.mag), 2), bv: red(num(s.ci), 2), sp: espectro(s),
    al: anosLuz(s),
    /* lum: la luminosidad VISUAL (banda V) en soles, la de HYG (de la
       magnitud absoluta, que sale de la distancia). No es la total: una
       supergigante roja echa casi todo en infrarrojo. */
    lum: dist && dist < 100000 ? dosCifras(num(s.lum)) : null,
    ra: red(ra, 3), dec: red(dec, 3), alt: red(altMax(dec), 1), mes: meses(ra, dec),
    /* solo si de verdad cambia a la vista: rango con magnitudes (marca 0) de
       al menos una decima. «vr» y no «v»: el panel le pone a cada objeto su
       vector en .v al cargar, y con «v» lo pisaba (17 de octubre de 2026: las
       51 estrellas decian «su brillo varia» con las cifras del vector). */
    vr: v && v.marca === '0' && v.min !== null && v.max !== null && v.min - v.max >= 0.1 ? [v.tipo, v.max, v.min, v.per] : null
  };
}).sort((a, b) => a.m - b.m);

/* ════════════════ CONSTELACIONES (d3-celestial + HYG) ════════════════ */
const d3 = n => JSON.parse(fs.readFileSync(path.join(F, 'd3c/data', n), 'utf8'));
const conF = d3('constellations.json').features;
const linF = d3('constellations.lines.json').features;
const limF = d3('constellations.bounds.json').features;
const ra360 = l => (l + 360) % 360;
const con = {};
for (const c of conF) {
  const id = c.id;
  const [lon, lat] = c.geometry.coordinates;
  /* n: el nombre latino de la UAI, que no se traduce (como una designacion) */
  /* gen: el genitivo latino («Orionis»), con el que se escriben las
     designaciones en Wikipedia («Alpha Orionis»): la ficha lo usa para
     encontrar el articulo */
  const e = con[id] || (con[id] = { n: id === 'Ser' ? 'Serpens' : c.properties.name, gen: c.properties.gen, ra: red(ra360(lon), 2), dec: red(lat, 2), dmin: 90, dmax: -90, et: [] });
  if (con[id].et.length) e.et.push([red(ra360(lon), 2), red(lat, 2)]);   // Serpens: dos etiquetas
  else e.et.push([red(ra360(lon), 2), red(lat, 2)]);
}
for (const b of limF) {
  const e = con[b.id];
  const anillos = b.geometry.type === 'Polygon' ? b.geometry.coordinates : b.geometry.coordinates.flat();
  for (const anillo of anillos) for (const [, lat] of anillo) { e.dmin = Math.min(e.dmin, lat); e.dmax = Math.max(e.dmax, lat); }
}
const lineas = {};
for (const l of linF) {
  const tramos = (lineas[l.id] = lineas[l.id] || []);
  for (const t of l.geometry.coordinates) tramos.push(t.map(([lo, la]) => [red(ra360(lo), 2), red(la, 2)]));
}
/* brillante y cuantas a simple vista, de HYG */
const porCon = {};
for (const s of hyg) {
  const m = num(s.mag);
  if (!s.con || s.id === '0' || m === null) continue;
  const p = porCon[s.con] || (porCon[s.con] = { alfa: null, am: 99, n6: 0, n6v: 0 });
  if (m < p.am && s.hip) { p.am = m; p.alfa = +s.hip; }
  if (m <= 6) { p.n6++; if (num(s.dec) > DEC_MIN) p.n6v++; }
}
for (const id of Object.keys(con)) {
  const e = con[id], p = porCon[id] || {};
  e.dmin = red(e.dmin, 1); e.dmax = red(e.dmax, 1);
  e.vis = e.dmin > DEC_MIN ? 't' : (e.dmax > DEC_MIN ? 'p' : 'n');
  e.alfa = p.alfa || null; e.n6 = p.n6 || 0; e.n6v = p.n6v || 0;
  e.mes = e.vis === 'n' ? 0 : meses(e.et[0][0], Math.max(e.et[0][1], DEC_MIN + 3));
}

/* ════════════════ VIA LACTEA (d3-celestial, contornos de J. R. Vieira) ════════════════
   Cinco niveles de brillo con 30.000 puntos. Se quedan los tres primeros,
   simplificados con Douglas-Peucker a 0,35 grados: a la escala de una
   pantalla de movil no se distingue, y pasa de 530 kB a unos 25. */
function dp(pts, tol) {
  if (pts.length < 3) return pts;
  const xy = []; let off = 0;
  for (let i = 0; i < pts.length; i++) {
    let lo = pts[i][0] + off;
    if (i && lo - xy[i - 1][0] > 180) { off -= 360; lo -= 360; }
    if (i && lo - xy[i - 1][0] < -180) { off += 360; lo += 360; }
    xy.push([lo, pts[i][1]]);
  }
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const pila = [[0, pts.length - 1]];
  while (pila.length) {
    const [a, b] = pila.pop();
    const cm = Math.cos(R((xy[a][1] + xy[b][1]) / 2));
    const ax = xy[a][0] * cm, ay = xy[a][1], bx = xy[b][0] * cm, by = xy[b][1];
    let dmax = -1, idx = -1;
    for (let i = a + 1; i < b; i++) {
      const px = xy[i][0] * cm, py = xy[i][1];
      const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
      let t = L ? ((px - ax) * dx + (py - ay) * dy) / L : 0; t = Math.max(0, Math.min(1, t));
      const d = Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
      if (d > dmax) { dmax = d; idx = i; }
    }
    if (dmax > tol) { keep[idx] = 1; pila.push([a, idx], [idx, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}
const via = [];
for (const f of d3('mw.json').features) {
  const nivel = +f.id.replace('ol', '');
  if (nivel > 3) continue;
  for (const poli of f.geometry.coordinates) for (const anillo of poli) {
    const s = dp(anillo, 0.35).map(([lo, la]) => [red(ra360(lo), 1), red(la, 1)]);
    if (s.length >= 4) via.push([nivel, s]);
  }
}

/* ════════════════ CIELO PROFUNDO ════════════════ */
const ong = [...csv(fs.readFileSync(path.join(F, 'openngc/database_files/NGC.csv'), 'utf8'), ';'),
             ...csv(fs.readFileSync(path.join(F, 'openngc/database_files/addendum.csv'), 'utf8'), ';')];
const hms = s => { const [h, m, x] = s.split(':').map(Number); return (h + m / 60 + x / 3600) * 15; };
const dms = s => { const g = s[0] === '-' ? -1 : 1; const [d, m, x] = s.replace(/^[+-]/, '').split(':').map(Number); return g * (d + m / 60 + x / 3600); };
/* SAC 8.1 (via d3-celestial) y SEDS: magnitudes VISUALES, las que sirven a
   quien mira. Clave normalizada: «NGC 0253» = «NGC 253» = «NGC253». */
const norm = s => String(s || '').toUpperCase().replace(/\s+/g, '').replace(/^(NGC|IC|MEL|CR|M|C)0+(\d)/, '$1$2');
const sac = new Map();
for (const x of d3('dsos.14.json').features) {
  const m = num(x.properties.mag);
  if (m === null || m >= 30) continue;
  for (const k of [x.id, x.properties.desig]) if (k && !sac.has(norm(k))) sac.set(norm(k), { m, dim: x.properties.dim });
}
const seds = new Map(d3('messier.json').features.map(x => [x.id, { m: num(x.properties.mag), dim: x.properties.dim }]));

function claseDe(t) {
  if (/^G(Pair|Trpl|Group)?$/.test(t)) return ['galaxia', 'gal'];
  if (t === 'OCl') return ['cumulo', 'abi'];
  if (t === '*Ass') return ['cumulo', 'aso'];
  if (t === 'GCl') return ['cumulo', 'glo'];
  if (t === 'Cl+N') return ['nebulosa', 'cne'];
  if (t === 'PN') return ['planetaria', 'pla'];
  if (t === 'SNR') return ['nebulosa', 'snr'];
  if (/^(HII|EmN|Neb|RfN)$/.test(t)) return ['nebulosa', 'neb'];
  if (t === 'DrkN') return ['oscura', 'osc'];
  if (t === '**') return ['doble', 'dob'];
  if (t === 'Other') return ['asterismo', 'ast'];
  return [null, null];
}

const messier = new Map(), caldwell = new Map();
for (const x of ong) {
  if (x.Type === 'Dup') continue;          // M102: OpenNGC lo da por duplicado de M101
  if (x.M) messier.set(+x.M, x);
  for (const m of (x.Identifiers || '').matchAll(/\bC (\d{3})\b/g)) caldwell.set(+m[1], x);
  if (/^C\d{3}$/.test(x.Name)) caldwell.set(+x.Name.slice(1), x);
}
/* Fuera de Messier y Caldwell, tres clasicos de prismaticos y de simple vista */
const EXTRA_DSO = ['Cl399', 'Mel111', 'B033'];

const objetos = [];
const vistos = new Set();
function anadir(x, idApp, M, C) {
  if (vistos.has(x.Name)) {                // mismo objeto con numero M y C
    const o = objetos.find(o => o.on === x.Name);
    if (C && !o.C) o.C = C;
    if (M && !o.M) o.M = M;
    return;
  }
  vistos.add(x.Name);
  const [clase, t] = claseDe(x.Type);
  const ra = hms(x.RA), dec = dms(x.Dec);
  const desig = x.Name.replace(/^(NGC|IC)0*(\d+)/, '$1 $2');
  const ids = [desig, ...(x.Identifiers || '').split(',')];
  if (M) ids.unshift('M ' + M);
  let mag = null, fm = null;
  for (const k of ids) { const s = sac.get(norm(k)); if (s) { mag = s.m; fm = 'SAC'; break; } }
  if (mag === null && M && seds.get('M' + M) && seds.get('M' + M).m !== null) { mag = seds.get('M' + M).m; fm = 'SEDS'; }
  if (mag === null && num(x['V-Mag']) !== null) { mag = num(x['V-Mag']); fm = 'OpenNGC V'; }
  if (mag === null && num(x['B-Mag']) !== null) { mag = num(x['B-Mag']) - (clase === 'galaxia' ? 0.7 : 0); fm = clase === 'galaxia' ? 'OpenNGC B-0,7' : 'OpenNGC B'; }
  const alt = altMax(dec);
  const maj = num(x.MajAx), mn = num(x.MinAx);
  const mEf = mag === null ? null : magEfectiva(mag, alt);
  objetos.push({
    id: idApp, on: x.Name, t, ra: red(ra, 3), dec: red(dec, 3), c: x.Const, M: M || null, C: C || null,
    d: /^(NGC|IC) /.test(desig) ? desig : null,
    m: red(mag, 1), fm, me: red(mEf, 1), tam: maj ? [red(maj, 1), mn ? red(mn, 1) : null] : null,
    sb: num(x.SurfBr), alt: red(alt, 1),
    niv: alt < 5 ? null : nivelDe(clase, mEf, maj), mes: alt < 5 ? 0 : meses(ra, dec),
    nom: (x['Common names'] || '').split(',')[0] || null
  });
}
for (let m = 1; m <= 110; m++) if (messier.has(m)) anadir(messier.get(m), 'M' + m, m, null);
for (let c = 1; c <= 109; c++) if (caldwell.has(c)) {
  const x = caldwell.get(c);
  anadir(x, x.M ? 'M' + (+x.M) : 'C' + c, x.M ? +x.M : null, c);
}
for (const n of EXTRA_DSO) { const x = ong.find(y => y.Name === n); if (x) anadir(x, n.replace(/^(Mel|Cl|B)0*/, (a, b) => b), null, null); }
/* El Doble Cumulo (C14) y las Hiades (C41) no traen magnitud en OpenNGC: la
   del Doble Cumulo es la de sus dos cumulos (NGC 869 y 884, SAC), y la de las
   Hiades la del SAC con su numero de Melotte. Se escribe el porque, no el
   numero. */
for (const o of objetos) if (o.m === null) {
  const alias = { C14: ['NGC 869', 'NGC 884'], C41: ['Mel 25'] }[o.id] || [];
  const ms = alias.map(k => sac.get(norm(k))).filter(Boolean).map(s => s.m);
  if (ms.length) { o.m = red(Math.min(...ms), 1); o.fm = 'SAC (' + alias.join(', ') + ')'; o.me = red(magEfectiva(o.m, o.alt), 1); o.niv = o.alt < 5 ? null : nivelDe(claseDe(ong.find(y => y.Name === o.on).Type)[0], o.me, o.tam && o.tam[0]); }
}
/* Lo que se queda sin magnitud en todas las fuentes no se queda sin nivel:
   un objeto sin cifra de brillo es, por defecto, de telescopio. La unica
   excepcion es el Cumulo de Coma (Mel 111), que no es una mancha sino un
   punado de estrellas sueltas: sus miembros mas brillantes -12, 14 y 16
   Comae- son de magnitud 4,8 a 5,0 en HYG, asi que se ve a simple vista. */
for (const o of objetos) if (o.niv === null && o.alt >= 5) {
  if (o.id === 'Mel111') {
    const ms = [12, 14, 16].map(f => hyg.find(s => s.flam === String(f) && s.con === 'Com')).map(s => num(s.mag));
    o.niv = Math.max(...ms) <= 5.5 ? 1 : 2;
    o.nm = 'nivel por sus estrellas: 12, 14 y 16 Com, V ' + ms.join(' / ') + ' (HYG)';
  } else { o.niv = 3; o.nm = 'sin magnitud en las fuentes: telescopio por defecto'; }
}

/* ════════════════ DOBLES (BSC5) ════════════════
   Los sistemas que se ensenan, por su numero HR. La separacion y la
   diferencia de brillo son las del catalogo (1991). En los pares que giran
   deprisa -periodo de menos de 2.000 anos en la nota del BSC- la separacion de
   1991 ya no es la de hoy (Castor ha pasado de 2 a unos 5 segundos), asi que
   no se da la cifra: solo el nivel, que es telescopio en todos. */
const bsc = JSON.parse(fs.readFileSync(path.join(F, 'bsc/bsc5-all.json'), 'utf8'));
const porHR = new Map(bsc.map(s => [s.HR, s]));
/* Cada sistema, escrito entero para que se pueda revisar contra el BSC:
     id     el de la app
     b      su designacion (no se traduce)
     a, c   numeros HR de las dos estrellas que se ven separadas. Una lista
            junta componentes que a esa escala son un solo punto: el ojo ve
            epsilon-1 Lyrae entera (A+B), no A; se suma su luz.
     h      HIP de la principal (para el nombre y el mapa)
     sep    'Sep' = el campo del BSC; un numero = el de la nota que se cita
     m      [m1, m2] de la nota, cuando la componente no tiene HR propio
     dm     'Dmag' = el campo del BSC (si no hay m2)
     per    periodo orbital del par, de la nota del BSC; si es de menos de
            2.000 anos y el par esta a menos de 15", la separacion de 1991 ya
            no vale (Castor ha pasado de 2" a unos 5") y no se publica */
const DOBLES = [
  { id: 'mizar-alcor', b: 'ζ UMa · 80 UMa', a: ['5054', '5055'], c: ['5062'], h: 65378, sep: 709 },  // nota HR 5054: «Alcor, HR 5062, at 709"»
  { id: 'mizar',      b: 'ζ UMa',   a: ['5054'], c: ['5055'], h: 65378, sep: 14 },                   // nota HR 5055: «Sep. 14"»
  { id: 'albireo',    b: 'β Cyg',   a: ['7417'], c: ['7418'], h: 95947, sep: 'Sep' },
  { id: 'eps-lyr',    b: 'ε¹ · ε² Lyr', a: ['7051', '7052'], c: ['7053', '7054'], h: 91919, sep: 'Sep' },  // AC 209"
  { id: 'eps1-lyr',   b: 'ε¹ Lyr',  a: ['7051'], c: ['7052'], h: 91919, sep: null, per: 1165.6 },     // nota HR 7051: «AB ... 1165.6y»
  { id: 'eps2-lyr',   b: 'ε² Lyr',  a: ['7053'], c: ['7054'], h: 91926, sep: null, per: 585 },        // nota HR 7053: «CD ... 585y»
  { id: 'castor',     b: 'α Gem',   a: ['2891'], c: ['2890'], h: 36850, sep: 'Sep', per: 511.3 },     // nota HR 2891: «511.30y»
  { id: 'almach',     b: 'γ And',   a: ['603'],  c: ['604'],  h: 9640,  sep: 'Sep' },
  { id: 'algieba',    b: 'γ Leo',   a: ['4057'], c: ['4058'], h: 50583, sep: 'Sep' },
  { id: 'polaris',    b: 'α UMi',   a: ['424'],  c: null, m: [null, 8.20], h: 11767, sep: 'Sep' },     // nota: «B, 8.20V»
  { id: 'rigel',      b: 'β Ori',   a: ['1713'], c: null, dm: 'Dmag', h: 24436, sep: 'Sep' },
  { id: 'bet-mon',    b: 'β Mon',   a: ['2356'], c: ['2357'], h: 30867, sep: 'Sep' },
  { id: 'gam-del',    b: 'γ Del',   a: ['7948'], c: ['7947'], h: 102532, sep: 'Sep' },
  { id: 'alnitak',    b: 'ζ Ori',   a: ['1948'], c: null, m: [1.88, 4.02], h: 26727, sep: 'Sep', per: 1508.6 },  // nota: «AB 1.88 ..., 4.02 ..., 1508.6y»
  { id: 'rasalgethi', b: 'α Her',   a: ['6406'], c: ['6407'], h: 84345, sep: 'Sep' },
  { id: 'del-cep',    b: 'δ Cep',   a: ['8571'], c: null, m: [null, 6.30], h: 110991, sep: 'Sep' },    // nota: «AC CPM, C at 41", 6.30V»
  { id: 'nu-dra',     b: 'ν Dra',   a: ['6555'], c: ['6554'], h: 85819, sep: 'Sep' },
  { id: 'eta-cas',    b: 'η Cas',   a: ['219'],  c: null, m: [3.45, 7.51], h: 3821, sep: 'Sep', per: 480 },  // nota: «AB 3.45 G3V, 7.51 K4Ve, 480y»
  { id: '61-cyg',     b: '61 Cyg',  a: ['8085'], c: ['8086'], h: 104214, sep: 'Sep', per: 722 },     // nota: «722y» (a 29": se publica)
  { id: 'eps-boo',    b: 'ε Boo',   a: ['5506'], c: ['5505'], h: 72105, sep: 'Sep' },
  { id: 'gam-ari',    b: 'γ Ari',   a: ['546'],  c: ['545'],  h: 8832,  sep: 'Sep' },
  { id: 'alf-cap',    b: 'α¹ · α² Cap', a: ['7754'], c: ['7747'], h: 100064, sep: 'Sep' },
  { id: 'tet-tau',    b: 'θ¹ · θ² Tau', a: ['1412'], c: ['1411'], h: 20894, sep: 'Sep' },
  { id: 'alf-lib',    b: 'α¹ · α² Lib', a: ['5531'], c: ['5530'], h: 72622, sep: 231 },               // nota HR 5530: «CPM with HR 5531 at 231"»
  { id: 'cor-caroli', b: 'α CVn',   a: ['4915'], c: ['4914'], h: 63125, sep: 'Sep' },
  { id: 'porrima',    b: 'γ Vir',   a: ['4825'], c: ['4826'], h: 61941, sep: 'Sep', per: 171.37 },    // nota: «171.37y»
  { id: 'xi-uma',     b: 'ξ UMa',   a: ['4375'], c: ['4374'], h: null, sep: 'Sep', per: 59.84 },      // nota: «59.840y»; sin HIP en HYG
  { id: '70-oph',     b: '70 Oph',  a: ['6752'], c: null, m: [4.20, 5.99], h: 88601, sep: 'Sep', per: 88.13 }  // nota: «AB 4.20 K0V, 5.99 K4V, 88.13y»
];
const decBSC = s => (s['DE-'] === '-' ? -1 : 1) * (+s.DEd + (+s.DEm) / 60 + (+s.DEs) / 3600);
const raBSC = s => (+s.RAh + (+s.RAm) / 60 + (+s.RAs) / 3600) * 15;
/* la luz de varias componentes que el ojo ve como una */
const juntar = hrs => {
  const ms = hrs.map(h => { const x = porHR.get(h); if (!x) throw new Error('BSC sin HR ' + h); return num(x.Vmag); });
  return ms.some(m => m === null) ? null : -2.5 * Math.log10(ms.reduce((f, m) => f + Math.pow(10, -0.4 * m), 0));
};
const dobles = [];
for (const x of DOBLES) {
  const s = porHR.get(x.a[0]);
  let sep = x.sep === 'Sep' ? num(s.Sep) : x.sep;
  const m1 = x.m && x.m[0] !== null ? x.m[0] : juntar(x.a);
  const m2 = x.m && x.m[1] !== null ? x.m[1] : (x.c ? juntar(x.c) : null);
  const dm = m2 !== null && m1 !== null ? Math.abs(m2 - m1) : (x.dm === 'Dmag' ? num(s.Dmag) : null);
  const per = x.per || null;
  if (per !== null && per < 2000 && (sep === null || sep < 15)) sep = null;
  const niv = sep === null ? 3 : (sep >= 180 && (m2 === null || m2 <= 6) ? 1 : (sep >= 20 && (dm === null || dm <= 3) ? 2 : 3));
  dobles.push({
    id: x.id, b: x.b, hr: [...x.a, ...(x.c || [])].map(Number), h: x.h, c: s.Constellation,
    ra: red(raBSC(s), 3), dec: red(decBSC(s), 3),
    m1: red(m1, 2), m2: red(m2, 2), dm: red(dm, 1), sep: red(sep, 1), per,
    niv, alt: red(altMax(decBSC(s)), 1), mes: meses(raBSC(s), decBSC(s))
  });
}

/* ════════════════ VARIABLES (GCVS 5.1) ════════════════ */
const VARIABLES = [14576, 10826, 110991, 92420, 97804, 97629, 48036, 107259, 27989, 4427, 77442, 92202, 78322, 84345];
const variables = VARIABLES.map(h => {
  const v = gcvs.get(h), s = porHip.get(h);
  if (!v) throw new Error('GCVS sin HIP ' + h);
  return { h, des: v.des, tipo: v.tipo, max: v.max, min: v.min, per: v.per, c: s.con,
           alt: red(altMax(num(s.dec)), 1), mes: meses(num(s.ra) * 15, num(s.dec)) };
});

/* ════════════════ LLUVIAS DE ESTRELLAS ════════════════
   λ⊙ del maximo y de la actividad, radiante (J2000), velocidad y padre:
   Stellarium, plugins/MeteorShowers/resources/MeteorShowers.json, que copia
   la lista de trabajo de la IMO. La THZ es la de los calendarios de la IMO
   2026 y 2027 (imo.net estaba en mantenimiento el 16 de octubre de 2026; se
   cotejo con sterngucker.de, que los cita). Las Taurides no entran: el
   maximo del Sur sale el 10 de octubre en un sitio y el 5 de noviembre en el
   otro, y una fecha que no se puede defender no se publica.
   La fecha del maximo NO se escribe: la app la calcula cada ano a partir de
   λ⊙, y las de 2026 y 2027 coinciden con la IMO a menos de diez minutos
   (tools/auditar_cielo.js). */
const ms = JSON.parse(fs.readFileSync(path.join(F, 'stel/plugins/MeteorShowers/resources/MeteorShowers.json'), 'utf8')).showers;
/* Stellarium no da padre a las Orionidas: es el cometa 1P/Halley, el mismo
   que el de las eta-Acuaridas (lista de lluvias establecidas del Centro de
   Datos de Meteoros de la UAI, ORI 008). */
const PADRE = { ORI: ['1P/Halley'] };
const THZ_IMO = { QUA: 80, LYR: 18, ETA: 50, SDA: 25, CAP: 5, PER: 100, DRA: null, ORI: 20, LEO: 15, GEM: 150, URS: 10 };
const lluvias = Object.keys(THZ_IMO).map(id => {
  const s = ms[id], g = s.activity.find(a => a.year === 'generic');
  return { id, l: g.peak, ini: g.start, fin: g.finish, ra: s.radiantAlpha, dec: s.radiantDelta, v: s.speed,
           r: s.pidx, thz: THZ_IMO[id], padre: PADRE[id] || (s.parentObj || '').replace(/^(Comet|Minor planet)\s+/, '').split(/ and (?:Comet |Minor planet )?/),
           alt: red(altMax(s.radiantDelta), 1) };
});

/* ════════════════ SALIDA ════════════════ */
/* Los nombres propios de la UAI de las estrellas de la carta que no estan en
   el catalogo (Mintaka, Alcyone, Thuban...): los da HYG. Van por HIP. */
const enCatalogo = new Set(catEstrellas.map(e => e.h));
const nombresIAU = {};
for (const e of estrellasMapa) { const s = porHip.get(e[4]); if (e[4] && s && s.proper && !enCatalogo.has(e[4])) nombresIAU[e[4]] = s.proper; }

/* ════════════════ DECLINACION MAGNETICA (WMM2025) ════════════════
   Para «Apunta al cielo»: la brujula del movil marca el norte magnetico. En
   Izana, el 1 de enero de cada ano de 2025 a 2030 (el modelo vale hasta 2030;
   el panel interpola). En la isla cambia menos de 0,3 grados de un extremo a
   otro (Anaga -3,45, Buenavista -3,70 a finales de 2026). */
const WMM = require('./cielo_wmm.js');
const cof = WMM.leerCOF(fs.readFileSync(path.join(F, 'wmm/pygeomag/wmm/WMM_2025.COF'), 'utf8'));
const malWMM = WMM.comprobar(cof);
if (malWMM.length) { console.log('MAL: el WMM no da la tabla de prueba de la NOAA:\n  ' + malWMM.join('\n  ')); process.exit(1); }
const declinacion = { modelo: cof.modelo, anios: [] };
for (let y = 2025; y <= 2030; y++) declinacion.anios.push([y, red(WMM.campo(cof, OBS.lat, OBS.lon, OBS.h / 1000, y).D, 3)]);

const fuentes = {};
for (const d of ['hyg', 'openngc', 'd3c', 'stel', 'astro', 'bsc', 'wmm']) {
  try { fuentes[d] = require('child_process').execSync('git -C ' + JSON.stringify(path.join(F, d)) + ' rev-parse HEAD').toString().trim(); }
  catch (e) { fuentes[d] = null; }
}
const salida = {
  v: 1,
  licencia: 'CC BY-SA 4.0: derivado de HYG-Database v4.1 y OpenNGC; lineas y Via Lactea de d3-celestial (BSD-3)',
  fuentes,
  obs: OBS,
  nivel: { k: K_EXT, umbral: UMBRAL },
  est: estrellasMapa,
  lin: lineas,
  via,
  con,
  estrellas: catEstrellas,
  nombresIAU,
  declinacion,
  objetos: objetos.map(({ on, ...o }) => o),
  dobles,
  variables,
  lluvias
};
const texto = JSON.stringify(salida);
const destino = path.join(RAIZ, 'datos/cielo.json');
console.log('estrellas del mapa (V<=' + MAG_MAPA + '): ' + estrellasMapa.length);
console.log('estrellas del catalogo: ' + catEstrellas.length);
console.log('constelaciones: ' + Object.keys(con).length + '  (total ' + Object.values(con).filter(c => c.vis === 't').length +
            ', parcial ' + Object.values(con).filter(c => c.vis === 'p').length + ', nunca ' + Object.values(con).filter(c => c.vis === 'n').length + ')');
console.log('tramos de lineas: ' + Object.values(lineas).reduce((n, t) => n + t.length, 0) + ' · poligonos de Via Lactea: ' + via.length +
            ' (' + via.reduce((n, p) => n + p[1].length, 0) + ' puntos)');
const vis = objetos.filter(o => o.niv !== null);
console.log('cielo profundo: ' + objetos.length + ' (Messier ' + objetos.filter(o => o.M).length + ', Caldwell ' + objetos.filter(o => o.C).length +
            ') · visibles (>=5 grados): ' + vis.length + ' · nivel 1/2/3: ' + [1, 2, 3].map(n => vis.filter(o => o.niv === n).length).join('/'));
console.log('dobles: ' + dobles.length + ' · variables: ' + variables.length + ' · lluvias: ' + lluvias.length);
console.log('nombres IAU en la carta (fuera del catalogo): ' + Object.keys(nombresIAU).length +
            ' · declinacion en Izana (' + declinacion.modelo + '): ' + declinacion.anios.map(a => a[0] + ' ' + a[1]).join(', '));
console.log('datos/cielo.json: ' + Buffer.byteLength(texto) + ' bytes, ' + require('zlib').gzipSync(texto).length + ' comprimidos');
if (COMPROBAR) {
  const hay = fs.existsSync(destino) ? fs.readFileSync(destino, 'utf8') : '';
  if (hay !== texto) { console.log('MAL: datos/cielo.json no es el que sale de las fuentes'); process.exit(1); }
  console.log('OK: datos/cielo.json es exactamente el que sale de las fuentes');
} else {
  fs.writeFileSync(destino, texto);
  console.log('escrito ' + path.relative(RAIZ, destino));
}
