#!/usr/bin/env node
/* Auditoria de datos: catalogo, lineas, paradas, trazado y lugares.
 * Solo lee.   node tools/auditar_datos.js   */
'use strict';
const { LINES, CAT, PLACES, km, distanciaAVia, norm } = require('./cargar');
const P = (t, v) => console.log('  ' + String(t).padEnd(46, '.') + ' ' + v);
let fallos = 0;
const debe = (t, v, ok) => { P(t, v); if (!ok) fallos++; };

console.log('=== catalogo ===');
const cat = Object.entries(CAT);
debe('paradas', cat.length, cat.length === 2514);
debe('sin municipio', cat.filter(([, p]) => !p.m).length, cat.every(([, p]) => p.m));
debe('sin nombre', cat.filter(([, p]) => !(p.n || '').trim()).length, cat.every(([, p]) => (p.n || '').trim()));
debe('claves no numericas', cat.filter(([k]) => !/^\d+$/.test(k)).length, cat.every(([k]) => /^\d+$/.test(k)));
debe('fuera de la caja de Tenerife',
     cat.filter(([, p]) => p.la < 27.95 || p.la > 28.62 || p.lo < -16.98 || p.lo > -16.05).length, true);
const muni = {}; cat.forEach(([, p]) => muni[p.m] = (muni[p.m] || 0) + 1);
debe('municipios distintos', Object.keys(muni).length, Object.keys(muni).length === 31);
const coord = {}; cat.forEach(([k, p]) => { const q = p.la + ',' + p.lo; (coord[q] = coord[q] || []).push(k); });
P('coordenada duplicada exacta', Object.values(coord).filter(a => a.length > 1).length + '  (viene de stops.txt)');

/* El indice parada -> lineas. No se puede deducir de las secuencias: cada
   linea guarda un recorrido y TITSA publica varios patrones por linea. */
const conL = cat.filter(([, p]) => Array.isArray(p.l) && p.l.length);
debe('con indice de lineas (campo l)', conL.length, conL.length === cat.length);
const numsApp = new Set(LINES.map(l => String(l.numero)));
const huerfanas = cat.flatMap(([k, p]) => (p.l || []).filter(n => !numsApp.has(n)).map(n => k + '→' + n));
debe('numeros del indice sin linea en la app', huerfanas.length, huerfanas.length === 0);
huerfanas.slice(0, 5).forEach(x => console.log('      ' + x));
const refs = cat.reduce((a, [, p]) => a + ((p.l || []).length), 0);
P('referencias linea-parada del indice', refs);
/* el indice nunca puede decir MENOS que las secuencias: seria perder servicio */
const seq = {};
LINES.forEach(l => (l.paradas || []).forEach(s => { if (s.stopId) (seq[s.stopId] = seq[s.stopId] || new Set()).add(String(l.numero)); }));
let pierden = 0;
for (const k in seq) { const t = new Set((CAT[k] || {}).l || []); for (const n of seq[k]) if (!t.has(n)) pierden++; }
debe('lineas que la secuencia ve y el indice no', pierden, pierden === 0);

console.log('\n=== lineas ===');
debe('lineas', LINES.length, LINES.length === 183);
const ids = LINES.map(l => l.id);
debe('ids repetidos', ids.length - new Set(ids).size, ids.length === new Set(ids).size);
const nums = {}; LINES.forEach(l => (nums[l.numero] = nums[l.numero] || []).push(l.id));
debe('numeros compartidos', Object.values(nums).filter(a => a.length > 1).length, true);
debe('lineas con menos de 2 paradas', LINES.filter(l => (l.paradas || []).length < 2).length, true);
debe('lineas sin via', LINES.filter(l => !Array.isArray(l.via) || l.via.length < 2).length, true);
debe('lineas sin frecuencia', LINES.filter(l => !l.frecuencia).length, true);
debe('lineas sin precio', LINES.filter(l => !l.precio).length, true);
const tipos = {}; LINES.forEach(l => tipos[l.tipo] = (tipos[l.tipo] || 0) + 1);
P('por tipo', JSON.stringify(tipos));

console.log('\n=== paradas y trazado ===');
const tot = LINES.reduce((a, l) => a + l.paradas.length, 0);
debe('referencias de parada', tot, tot === 6263);
const pid = LINES.flatMap(l => l.paradas.map(p => p.id));
debe('ids de parada repetidos', pid.length - new Set(pid).size, pid.length === new Set(pid).size);
debe('referencias huerfanas', LINES.flatMap(l => l.paradas).filter(p => p.stopId && !CAT[p.stopId]).length, true);
debe('paradas sin municipio', LINES.flatMap(l => l.paradas).filter(p => !p.municipio).length, true);
let rep = 0; LINES.forEach(l => { for (let i = 1; i < l.paradas.length; i++) if (l.paradas[i].stopId && l.paradas[i].stopId === l.paradas[i-1].stopId) rep++; });
debe('parada repetida consecutiva', rep, rep === 0);
const pts = LINES.reduce((a, l) => a + (l.via ? l.via.length : 0), 0);
let malos = 0, fueraV = 0;
LINES.forEach(l => (l.via || []).forEach(v => {
  if (!Array.isArray(v) || v.length !== 2 || !isFinite(v[0]) || !isFinite(v[1])) malos++;
  else if (v[0] < 27.95 || v[0] > 28.62 || v[1] < -16.98 || v[1] > -16.05) fueraV++;
}));
P('puntos de via', pts);
debe('puntos de via mal formados o fuera', malos + fueraV, malos + fueraV === 0);
const lejos = [];
LINES.forEach(l => {
  if (!Array.isArray(l.via) || l.via.length < 2) return;
  l.paradas.forEach(p => {
    const m = distanciaAVia([p.lat, p.lng], l.via);   // al SEGMENTO, nunca al vertice
    if (m > 200) lejos.push([l.numero, p.nombre, Math.round(m)]);
  });
});
debe('paradas a mas de 200 m de su trazado', lejos.length + ' de ' + tot, lejos.length <= 5);
lejos.sort((a, b) => b[2] - a[2]).slice(0, 6).forEach(x => console.log('      %s  «%s»  %d m', x[0], x[1], x[2]));
let saltoSinVia = 0;
LINES.forEach(l => { const v = Array.isArray(l.via) && l.via.length > 1;
  for (let i = 1; i < l.paradas.length; i++) {
    const d = km([l.paradas[i-1].lat, l.paradas[i-1].lng], [l.paradas[i].lat, l.paradas[i].lng]);
    if (d > 8 && !v) saltoSinVia++;
  } });
debe('saltos > 8 km dibujados como recta', saltoSinVia, saltoSinVia === 0);

/* El tranvia va aparte: sus paradas salen del CSV de Metropolitano y 20 de las
   21 de L1 son vertice exacto de la polilinea publicada. */
console.log('\n=== tranvia ===');
LINES.filter(l => l.tipo === 'tranvia').forEach(l => {
  const ds = l.paradas.map(p => distanciaAVia([p.lat, p.lng], l.via));
  const vert = l.paradas.filter(p => l.via.some(v => km(v, [p.lat, p.lng]) * 1000 < 0.5)).length;
  const largo = l.via.reduce((a, _, i) => i ? a + km(l.via[i-1], l.via[i]) : 0, 0);
  P(l.id + ': paradas · vertice exacto', l.paradas.length + ' · ' + vert);
  P(l.id + ': km del trazado', largo.toFixed(2));
  debe(l.id + ': parada mas lejos de la via (m)', Math.max(...ds).toFixed(1), Math.max(...ds) < 10);
});

console.log('\n=== lugares ===');
debe('lugares', PLACES.length, PLACES.length === 765);
['id','name','emoji','color','lat','lng','desc','category'].forEach(c =>
  debe('sin ' + c, PLACES.filter(p => p[c] === undefined || p[c] === '').length, PLACES.every(p => p[c] !== undefined && p[c] !== '')));
debe('ids que no cumplen [a-z0-9-]', PLACES.filter(p => !/^[a-z0-9-]+$/.test(p.id)).length, true);
debe('fuera de la caja de Tenerife',
     PLACES.filter(p => p.lat < 27.95 || p.lat > 28.62 || p.lng < -16.98 || p.lng > -16.05).length, true);
const urls = []; PLACES.forEach(p => Object.values(p).forEach(v => { if (typeof v === 'string' && /^https?:/.test(v)) urls.push(v); }));
debe('urls sin cifrar', urls.filter(u => u.startsWith('http://')).length + ' de ' + urls.length, !urls.some(u => u.startsWith('http://')));

console.log('\n=== rotulos repetidos ===');
const por = {}; Object.entries(CAT).forEach(([k, p]) => (por[norm(p.n)] = por[norm(p.n)] || []).push(k));
const dup = Object.entries(por).filter(([, a]) => a.length > 1);
P('rotulos usados por 2+ paradas', dup.length + '  (' + dup.reduce((a, [, x]) => a + x.length, 0) + ' paradas)');
const pares = dup.filter(([, a]) => { let m = 0; for (let i = 0; i < a.length; i++) for (let j = i+1; j < a.length; j++)
  m = Math.max(m, km([CAT[a[i]].la, CAT[a[i]].lo], [CAT[a[j]].la, CAT[a[j]].lo])); return m < 0.08; });
P('de esos, pares ida/vuelta a menos de 80 m', pares.length);

console.log('\n' + (fallos ? '*** ' + fallos + ' control(es) fuera de lo esperado ***' : 'todo dentro de lo esperado'));
process.exit(fallos ? 1 : 0);
