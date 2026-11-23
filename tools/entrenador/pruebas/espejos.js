#!/usr/bin/env node
/* Las posturas «del otro lado»: ¿las manos también son el reflejo? De cada pareja de posturas de un vídeo cuyo esqueleto (respecto de
   la pelvis) es el reflejo una de otra, lo que se apartan las yemas de los dedos (cm) y la palma (grados) de donde les toca. Y en las
   posturas simétricas (el esqueleto es su propio reflejo), lo que se aparta una mano de ser el reflejo de la otra.
     node tools/entrenador/pruebas/espejos.js [todos | id,id…] [umbral en cm = 0.3]
   Sale con 1 si alguna pareja reflejada pasa del umbral. Lo de las posturas simétricas solo se lista (1,5 cm o más): hay ejercicios
   que lo hacen adrede (la desviación radial y cubital con peso: trabaja una mano; los círculos de muñecas con los dedos entrelazados:
   las dos giran hacia el mismo lado). Con todos tarda un minuto.
   (23-11-2026: reflejo(), en 10-esqueleto.js, no daba la vuelta a lo que se ladea la muñeca, y en nueve vídeos la mano de la postura
   reflejada quedaba ladeada al revés, con las yemas de 4 a 28 cm de su sitio. Ninguna otra medida lo veía: la mano no se metía en nada.) */
'use strict';
const C = require('./contactos.js'), T = C.carga();
const arg = process.argv[2] || 'todos', UMB = +(process.argv[3] || 0.3), ids = arg === 'todos' ? Object.keys(T.COREO) : arg.split(',');
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], lar = a => Math.sqrt(dot(a, a)), mx = a => [-a[0], a[1], a[2]];
const ang = (u, v) => Math.acos(Math.max(-1, Math.min(1, dot(u, v) / ((lar(u) * lar(v)) || 1)))) * 180 / Math.PI;
const OTRO = { i: 'd', d: 'i' }, PTS = ['hom', 'cod', 'mun', 'cad', 'rod', 'tob'];
let parejas = 0, simetricas = 0; const mal = [], sim = [];
for (const id of ids) {
  const co = T.COREO[id]; if (!co) { console.log(id + ': SIN COREOGRAFÍA'); continue; }
  const d = C.director(T, co), ns = Object.keys(d.K), peor = [0, '', 0], s = [];
  for (let a = 0; a < ns.length; a++) {
    const A = d.K[ns[a]]; if (!A || !A.i || !A.i.dedos) continue;
    /* ¿es simétrica consigo misma? */
    let asim = 0; for (const k of ['i', 'd']) for (const p of PTS) asim = Math.max(asim, lar(sub(mx(sub(A[k][p], A.pel)), sub(A[OTRO[k]][p], A.pel))));
    if (asim < 0.3) { simetricas++; const dy = lar(sub(mx(sub(A.i.dedos, A.pel)), sub(A.d.dedos, A.pel))); if (dy >= 1.5) s.push(ns[a] + ' ' + dy.toFixed(1)); }
    if (asim < 2) continue;
    for (let b = a + 1; b < ns.length; b++) {
      const B = d.K[ns[b]]; if (!B || !B.i || !B.i.dedos) continue;
      let es = lar(sub(mx(sub(A.cab, A.pel)), sub(B.cab, B.pel))) <= 0.5;
      for (const k of ['i', 'd']) for (const p of PTS) if (es && lar(sub(mx(sub(A[k][p], A.pel)), sub(B[OTRO[k]][p], B.pel))) > 0.35) es = false;
      if (!es) continue;
      parejas++;
      for (const k of ['i', 'd']) {
        const dy = lar(sub(mx(sub(A[k].dedos, A.pel)), sub(B[OTRO[k]].dedos, B.pel)));
        if (dy > peor[0]) { peor[0] = dy; peor[1] = ns[a] + ' ↔ ' + ns[b] + ' · la mano ' + k + ' de ' + ns[a]; peor[2] = ang(mx(A[k].mano.palma), B[OTRO[k]].mano.palma); }
      }
    }
  }
  if (peor[0] >= UMB) mal.push([peor[0], id, peor[1], peor[2]]);
  if (s.length) sim.push([id, s]);
}
mal.sort((a, b) => b[0] - a[0]);
for (const r of mal) console.log(r[0].toFixed(1).padStart(6) + ' cm  ' + r[3].toFixed(0).padStart(4) + '°  ' + r[1].padEnd(46) + r[2]);
console.log(ids.length + ' vídeos · parejas de posturas reflejadas: ' + parejas + ' · vídeos con las yemas a ' + UMB + ' cm o más de su reflejo: ' + mal.length);
for (const r of sim) console.log('   en posturas simétricas, una mano no es el reflejo de la otra (yemas, cm): ' + r[0].padEnd(40) + r[1].join(' · '));
console.log('posturas simétricas: ' + simetricas + ' · vídeos en que una mano no es el reflejo de la otra (1,5 cm o más): ' + sim.length);
process.exit(mal.length ? 1 : 0);
