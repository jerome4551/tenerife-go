#!/usr/bin/env node
/* La mano y el antebrazo contra la cabeza, en el vídeo cuadro a cuadro (en castellano): lo que le falta a la cabeza (el pelo con el
   cráneo, la quijada, el mentón, la nariz, las orejas y las púas del tupé: lo mismo que mide «cabeza-barra») para tocar la mano (de la
   muñeca a las yemas, radio 2) y el antebrazo (del codo a la muñeca, radio 3). Negativo: se le mete.
     node tools/entrenador/pruebas/manocabeza.js [todos | id,id…] [umbral = -4.5: se listan los que bajan de él]
   No es un control: la mano en la nuca, en la cabeza o junto a la oreja se mete adrede (hasta 12 cm: el antebrazo pasa por detrás del
   pelo), y eso no lo distingue. Sirve para mirar los que salgan: lo que no puede ser es una mano que cruza la cara DE PASO, entre dos
   posturas (22-11-2026, el abrazo del bloque 16: de la cruz al abrazo, las manos subían y pasaban por la boca, 8,7 cm dentro; se
   arregló con una postura de paso). Con todos tarda un minuto. */
'use strict';
const fs = require('fs'), path = require('path');
const RAIZ = path.resolve(__dirname, '../../..'), arg = process.argv[2] || 'todos', UMB = +(process.argv[3] || -4.5);
const C = require('./contactos.js'), T = C.carga();
const ids = arg === 'todos' ? Object.keys(T.COREO) : /\.json$/.test(arg) ? JSON.parse(fs.readFileSync(arg, 'utf8')) : arg.split(',');
const TX = JSON.parse(fs.readFileSync(path.join(RAIZ, 'datos/cuerpo/ejercicios-es.json'), 'utf8'));
const R = [];
for (const id of ids) {
  const co = T.COREO[id]; if (!co) { console.log(id + ': SIN COREOGRAFÍA'); continue; }
  if (!TX[id]) { console.log(id + ': SIN FICHA'); continue; }
  const d = C.director(T, co), DT = 1 / 30, pasos = TX[id][1];
  let peor = [1e9, ''];
  (co.pasos || ['a']).forEach((a, i, LL) => {
    if (a === 'nota') return;
    const du = Math.max(4.4, 1.9 + (pasos[i] || '').length * 0.058, (a && a.dura) || 0), deCerca = i === 0 || LL[i - 1] === 'nota';
    const rep = a === 'rep' || (a && a.rep != null);
    /* como el reproductor (80-reproductor.js) */
    if (rep) { if (deCerca) { d.aPostura(d.inicio, 0); d.cuadro(0.001, true); } if (d.modo !== 'rep') { d.aRep(deCerca ? 0 : 0.6); if (a.rep != null) d.tau = a.rep; } }
    else if (a && a.sec) { if (deCerca || !d.E) { d.aPostura(a.desde || d.inicio, 0); d.cuadro(0.001, true); } d.aSecuencia(a.sec, a.desde); }
    else d.aPostura(typeof a === 'string' ? a : d.inicio, deCerca ? 0 : 0.7);
    for (let q = 0, N = Math.round(du / DT); q < N; q++) {
      d.cuadro(DT, false);
      const E = d.E, donde = 'paso ' + (i + 1) + ', ' + (q * DT).toFixed(2) + ' s' + (rep ? ' (repetición)' : '');
      for (const k of ['i', 'd']) {
        const L = E[k], gm = T.cabezaACilindro(E, L.mun, L.dedos, 2), ga = T.cabezaACilindro(E, L.cod, L.mun, 3);
        if (gm < peor[0]) peor = [gm, 'mano ' + k + ' · ' + donde];
        if (ga < peor[0]) peor = [ga, 'antebrazo ' + k + ' · ' + donde];
      }
    }
  });
  R.push([peor[0], id, peor[1]]);
}
R.sort((a, b) => a[0] - b[0]);
const L = R.filter(r => r[0] < UMB);
for (const r of L) console.log(r[0].toFixed(1).padStart(6) + '  ' + r[1].padEnd(46) + r[2]);
console.log(R.length + ' vídeos · por debajo de ' + UMB + ' cm: ' + L.length + (R.length ? ' · el que más: ' + R[0][0].toFixed(1) + ' (' + R[0][1] + ')' : ''));
