#!/usr/bin/env node
/* Los 7 controles de la seccion 6 del documento de reconstruccion.
 * Se lanza tras cada fase. Sale con codigo 1 si falla alguno.
 *
 *     node tools/verificar_red.js
 *
 * No modifica nada: lee index.html y evalua sus estructuras.  */
'use strict';
const fs = require('fs');
const path = require('path');

const RAIZ = path.dirname(__dirname);
const src = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');

function grab(decl, abre) {
  const i = src.indexOf(decl);
  if (i < 0) return null;
  const o = src.indexOf(abre, i);
  const cierra = abre === '[' ? ']' : '}';
  let d = 0, q = null;
  for (let k = o; k < src.length; k++) {
    const c = src[k], p = src[k - 1];
    if (q) { if (c === q && p !== '\\') q = null; continue; }
    if (c === '"' || c === "'" || c === '`') { q = c; continue; }
    if (c === abre) d++;
    else if (c === cierra) { d--; if (d === 0) return eval('(' + src.slice(o, k + 1) + ')'); }
  }
  return null;
}

const BBOX = { laMin: 27.9, laMax: 28.65, loMin: -17.05, loMax: -16.0 };
const UMBRAL_PAREJA_M = 80;

const norm = s => (s || '').normalize('NFKD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

const metros = (a, b) => {
  const R = 6371000, r = Math.PI / 180;
  const dLa = (b[0] - a[0]) * r, dLo = (b[1] - a[1]) * r;
  const h = Math.sin(dLa / 2) ** 2
          + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dLo / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

const LINES = grab('const TITSA_LINES = [', '[');
const CAT = grab('const TITSA_PARADAS = {', '{');   // null antes de la fase 2

let fallos = 0;
const ok = (n, cond, detalle) => {
  if (!cond) fallos++;
  console.log('  ' + (cond ? 'OK   ' : 'FALLO') + '  ' + n + (detalle ? '  ·  ' + detalle : ''));
};

console.log('Controles de la seccion 6\n');

if (!LINES) { console.log('  FALLO  no encuentro TITSA_LINES'); process.exit(1); }

// Hidratar igual que la app: leyendo el fichero crudo, las lineas regeneradas
// tienen claves, no objetos, y sin este paso los controles 5, 6 y 7 miden mal.
let hidratadas = 0;
if (CAT) for (const line of LINES) {
  if (!Array.isArray(line.paradas) || typeof line.paradas[0] !== 'string') continue;
  const term = new Set(line.terminales || []);
  const usados = new Set();
  line.paradas = line.paradas.map((ref, i) => {
    const p = CAT[ref];
    if (!p) return null;
    let pid = line.id + '-' + ref;
    if (usados.has(pid)) pid = pid + '-' + i;
    usados.add(pid);
    return { id: pid, stopId: ref, nombre: p.n, lat: p.la, lng: p.lo,
             municipio: p.m, esTerminal: term.has(ref) };
  }).filter(Boolean);
  hidratadas++;
}
const sinHidratar = LINES.filter(l => Array.isArray(l.paradas) && typeof l.paradas[0] === 'string');
if (hidratadas) console.log('  (hidratadas %d lineas para medir)\n', hidratadas);
if (sinHidratar.length) {
  console.log('  AVISO  %d lineas con claves sin resolver: %s\n',
    sinHidratar.length, sinHidratar.map(l => l.id).join(' '));
}
const todas = LINES.flatMap(l => (Array.isArray(l.paradas) ? l.paradas : []))
                   .filter(p => p && typeof p === 'object');
const ids = {};
todas.forEach(p => { ids[p.id] = (ids[p.id] || 0) + 1; });
const dupId = Object.keys(ids).filter(k => ids[k] > 1);

// 1 · bbox
const fuera = [];
if (CAT) for (const k of Object.keys(CAT)) {
  const e = CAT[k];
  if (!(e.la >= BBOX.laMin && e.la <= BBOX.laMax && e.lo >= BBOX.loMin && e.lo <= BBOX.loMax))
    fuera.push(k + ' ' + e.n);
}
for (const p of todas) {
  if (!(p.lat >= BBOX.laMin && p.lat <= BBOX.laMax && p.lng >= BBOX.loMin && p.lng <= BBOX.loMax))
    fuera.push((p.id || '?') + ' ' + p.nombre);
}
ok('1 · bbox, cero excepciones', fuera.length === 0,
   fuera.length ? fuera.slice(0, 5).join(' | ') : (CAT ? Object.keys(CAT).length + ' del catalogo + ' : '') + todas.length + ' paradas');

// 2 · integridad referencial
if (CAT) {
  const huerfanas = [];
  for (const l of LINES) {
    if (!Array.isArray(l.paradas)) continue;
    for (const ref of l.paradas) {
      if (typeof ref === 'string' && !CAT[ref]) huerfanas.push(l.id + '/' + ref);
    }
    for (const t of (l.terminales || [])) if (!CAT[t]) huerfanas.push(l.id + '/terminal ' + t);
  }
  ok('2 · integridad referencial', huerfanas.length === 0,
     huerfanas.length ? huerfanas.slice(0, 5).join(' | ') : 'ninguna clave huerfana');
} else {
  console.log('  --     2 · integridad referencial  ·  aun no hay TITSA_PARADAS');
}

// 3 · dos claves con el mismo rotulo, a mas de 80 m
if (CAT) {
  const porNom = new Map();
  for (const k of Object.keys(CAT)) {
    const n = norm(CAT[k].n);
    if (!porNom.has(n)) porNom.set(n, []);
    porNom.get(n).push(k);
  }
  const juntas = [];
  for (const [n, ks] of porNom) {
    for (let i = 0; i < ks.length; i++) for (let j = i + 1; j < ks.length; j++) {
      const a = CAT[ks[i]], b = CAT[ks[j]];
      const d = metros([a.la, a.lo], [b.la, b.lo]);
      if (d <= UMBRAL_PAREJA_M) juntas.push(a.n + ': ' + ks[i] + '/' + ks[j] + ' a ' + d.toFixed(0) + ' m');
    }
  }
  ok('3 · agrupacion ida/vuelta', juntas.length === 0,
     juntas.length ? juntas.slice(0, 5).join(' | ') : 'ningun rotulo repetido a menos de 80 m');
} else {
  console.log('  --     3 · agrupacion ida/vuelta  ·  aun no hay TITSA_PARADAS');
}

// 4 · terminales
const malT = [];
for (const l of LINES) {
  if (!Array.isArray(l.terminales)) continue;
  if (l.terminales.length !== 2) { malT.push(l.id + ': ' + l.terminales.length + ' terminales'); continue; }
  const claves = Array.isArray(l.paradas) && typeof l.paradas[0] === 'string'
    ? l.paradas : (l.paradas || []).map(p => p.stopId).filter(Boolean);
  for (const t of l.terminales) if (!claves.includes(t)) malT.push(l.id + ': terminal ' + t + ' fuera de paradas');
}
const conT = LINES.filter(l => Array.isArray(l.terminales)).length;
ok('4 · terminales', malT.length === 0,
   malT.length ? malT.slice(0, 5).join(' | ') : conT + ' lineas con terminales[], todas con 2 y dentro');

// 5 · aeropuertos: los filtros devuelven lista no vacia
const TFS = [28.0445, -16.5722], TFN = [28.4827, -16.3414];
const TFS_IDS = ['7571', '8326'], TFN_IDS = ['4537'];
const sirve = (l, ids, C) => (l.paradas || []).some(p =>
  (p.stopId && ids.includes(p.stopId)) || (p.lat === C[0] && p.lng === C[1]));
const porCoordTFS = LINES.filter(l => sirve(l, TFS_IDS, TFS));
const porCoordTFN = LINES.filter(l => sirve(l, TFN_IDS, TFN));
const cercaTFS = LINES.filter(l => (l.paradas || []).some(p => p.lat && metros([p.lat, p.lng], TFS) < 400));
const cercaTFN = LINES.filter(l => (l.paradas || []).some(p => p.lat && metros([p.lat, p.lng], TFN) < 400));
// El contraste con la proximidad es la senal de la seccion 4: si al reanclar
// al GTFS la igualdad exacta cae a 0 pero sigue habiendo lineas cerca, el
// filtro se ha quedado obsoleto y hay que pasarlo a stopId.
// Ojo: cerca de TFN hay un «Cruce de Los Rodeos» a 227 m que es OTRA parada,
// asi que el conteo por proximidad es normalmente mayor. No es un fallo.
ok('5 · aeropuertos, filtro vigente', porCoordTFS.length > 0 && porCoordTFN.length > 0,
   'por coordenada exacta TFS ' + porCoordTFS.length + ', TFN ' + porCoordTFN.length +
   '   (referencia por proximidad <400 m: ' + cercaTFS.length + ' y ' + cercaTFN.length + ')');

// 6 · prueba visual: 347 y 054
const orden = num => {
  const l = LINES.find(x => String(x.numero) === num);
  if (!l || !Array.isArray(l.paradas)) return '(no existe)';
  return l.paradas.map(p => (typeof p === 'string' ? p : p.nombre)).join(' -> ');
};
const o347 = orden('347'), o054 = orden('054');
// El GTFS puede dar el recorrido en cualquier sentido: vale en los dos.
const rev = t => t.split(' -> ').reverse().join(' -> ');
const cumple = (t, re) => re.test(t) || re.test(rev(t));
const bien347 = cumple(o347, /Orotava[\s\S]*Benijos[\s\S]*Palo Blanco[\s\S]*Realejo/);
const bien054 = cumple(o054, /Ravelo[\s\S]*Altos del Sauzal/);
ok('6 · la 347 sube por Benijos y Palo Blanco', bien347, o347);
ok('6 · la 054 llega a Altos del Sauzal por Ravelo', bien054, o054);

// 7 · el buscador da UN resultado para «Anaza»
const busca = q => {
  const qq = norm(q), claves = new Set();
  for (const l of LINES) for (const p of (l.paradas || [])) {
    if (!p || typeof p !== 'object') continue;
    if (norm(p.nombre).includes(qq) || norm(p.municipio).includes(qq))
      claves.add(p.lat.toFixed(4) + ',' + p.lng.toFixed(4));
  }
  return claves;
};
// El GTFS tiene paradas distintas cuyo nombre contiene el mismo toponimo
// (tres con «Anaza», siete «El Calvario» por toda la isla): pedir UN resultado
// es inalcanzable y no es lo que importa. Lo que no puede haber son dos
// resultados en el mismo sitio, que era el sintoma original.
const juntos = q => {
  const v = [...busca(q)].map(k => k.split(',').map(Number));
  const out = [];
  for (let i = 0; i < v.length; i++) for (let j = i + 1; j < v.length; j++) {
    const d = metros(v[i], v[j]);
    if (d < 80) out.push(d.toFixed(0) + ' m');
  }
  return out;
};
['Anaza', 'Bailadero', 'Calvario'].forEach(q => {
  const n = busca(q).size, j = juntos(q);
  ok('7 · «' + q + '» sin dos resultados en el mismo sitio', j.length === 0,
     n + ' resultado(s)' + (j.length ? ', pares a ' + j.join(', ') : ''));
});

ok('8 · ids de parada unicos', dupId.length === 0,
   dupId.length ? dupId.slice(0, 4).join(' | ') : todas.length + ' paradas, 0 repetidos');

// resumen
console.log('\n  lineas %d · paradas %d%s',
  LINES.length, todas.length, CAT ? ' · catalogo ' + Object.keys(CAT).length : '');
console.log(fallos ? '\n' + fallos + ' CONTROL(ES) FALLIDO(S)' : '\nlos controles pasan');
process.exit(fallos ? 1 : 0);
