#!/usr/bin/env node
/* La mano que agarra una barra (m: { barra, palma }) y la cara de la barra en la que queda. La palma sale perpendicular a la barra y
   al antebrazo, y «palma» solo dice cuál de las dos caras: si en algún momento del tramo queda de canto, la mano da media vuelta
   de golpe (LEEME, «Lo que salta, lo que se dobla y lo que gira de golpe»). De un tramo, por mano: la cara que continúa sin soltar
   desde la postura de salida (al empezar y al acabar: es la «palma» que hay que decir en la de llegada), lo menos que la palma
   dicha manda por el camino (1, del todo; 0, nada; negativo, la otra cara) y cuántas veces salta la mano.
     node tools/entrenador/pruebas/rama.js <id> <de> <a> */
'use strict';
const C = require('./contactos.js'), T = C.carga(), co = T.COREO[process.argv[2]];
if (!co) { console.error('uso: node rama.js <id> <postura de salida> <postura de llegada>'); process.exit(2); }
const d = C.director(T, co), de = process.argv[3], a = process.argv[4];
const sub = (x, y) => [x[0] - y[0], x[1] - y[1], x[2] - y[2]], dot = (x, y) => x[0] * y[0] + x[1] * y[1] + x[2] * y[2], lar = x => Math.sqrt(dot(x, x)), uni = x => { const l = lar(x) || 1; return x.map(v => v / l); };
const cruz = (x, y) => [x[1] * y[2] - x[2] * y[1], x[2] * y[0] - x[0] * y[2], x[0] * y[1] - x[1] * y[0]];
const f = v => '[' + v.map(x => x.toFixed(2)).join(',') + ']';
for (const k of ['i', 'd']) {
  let ant = null, min = 9, salta = 0, antP = null;
  for (let n = 0; n <= 100; n++) {
    d.metas = []; const E = d.enTramo({ de, a, clavos: co.clavos || [] }, n / 100), L = E[k], lw = uni(sub(L.mun, L.cod)), m = E.S.m[k]; let q = uni(cruz(m.bar, lw));
    if (ant ? dot(q, ant) < 0 : dot(q, L.mano.palma) < 0) q = q.map(v => -v);
    ant = q; min = Math.min(min, dot(q, uni(m.pal)));
    if (antP && dot(antP, L.mano.palma) < 0.5) salta++; antP = L.mano.palma;
    if (n === 0 || n === 100) console.log(k, n / 100, 'rama', f(q), 'palma que sale', f(L.mano.palma), 'bar', f(m.bar));
  }
  console.log(k, 'lo menos que la palma dicha dice el lado (1: del todo; 0: nada; <0: el otro):', min.toFixed(2), '· saltos de la palma:', salta);
}
