#!/usr/bin/env node
/* El movimiento, medido sin navegador como lo mide la auditoría (pruebas/auditoria.html), en cada cuadro del vídeo en castellano:
   · lo clavado: lo que se aparta cada muñeca o tobillo clavado de su meta (sin contar mientras pasa de una postura a otra)  ≤ 0,02 cm
   · el cuerpo (la cadera, la cabeza): lo más que se mueve de un cuadro al siguiente                                        ≤ 14 cm
   · una mano o un pie (la muñeca, el tobillo): lo mismo                                                                    ≤ 36 cm
     node tools/entrenador/pruebas/movimiento.js [todos | id,id…] [detalle]
   Tarda 40 segundos con todos; la auditoría entera (que lo mide en el reproductor de verdad y en dos idiomas, y es la que vale),
   50 minutos. (22-11-2026) Nació de tres vídeos que `contactos.js` daba por buenos y la auditoría no: una mano que subía 52 cm en
   un cuadro (la sentadilla con salto), una postura de paso a la que el brazo clavado no llegaba (la dominada comando) y un brazo
   estirado justo hasta su apoyo, que al respirar se quedaba corto (subir las manos por la pared). Sale con 1 si algo se pasa. */
'use strict';
const fs = require('fs'), path = require('path');
const RAIZ = path.resolve(__dirname, '../../..'), arg = process.argv[2] || 'todos', DET = !!process.argv[3];
const C = require('./contactos.js'), T = C.carga();
const ids = arg === 'todos' ? Object.keys(T.COREO) : /\.json$/.test(arg) ? JSON.parse(fs.readFileSync(arg, 'utf8')) : arg.split(',');
const TX = JSON.parse(fs.readFileSync(path.join(RAIZ, 'datos/cuerpo/ejercicios-es.json'), 'utf8'));
const nodo = () => ({ style: {}, childNodes: [], classList: { add() {}, remove() {}, toggle() {} }, setAttribute() {}, getAttribute() { return ''; }, appendChild(c) { return c; }, insertBefore(c) { return c; }, removeChild() {}, get firstChild() { return null; } });
function director(co) {
  const esc = { material: (co.material || []).map(q => { try { return new T.MATERIAL[q[0]]({ defs: nodo() }, q[1] || {}); } catch (e) { return { colocar() {} }; } }), poner() {}, detras: nodo(), encima: nodo(), cam: new T.Camara(),
    cab: { emocion() {}, parpadea() {}, m: {}, habla: 0, t: 0, paso() {}, hablar() {} }, fig: {}, pintar() {} };
  const d = new T.Director(esc); d.cargar(co); d.pintarRastro = () => {}; d.pintarMarcas = () => {};
  return d;
}
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const NOM = ['cadera', 'cabeza', 'mano i', 'mano d', 'pie i', 'pie d'];
let mal = 0, tope = { clavo: 0, salto: 0, saltoM: 0 };
for (const id of ids) {
  const co = T.COREO[id]; if (!co) { console.log(id + ': SIN COREOGRAFÍA'); continue; }
  if (!TX[id]) { console.log(id + ': SIN FICHA'); continue; }
  const d = director(co), DT = 1 / 30, pasos = TX[id][1], m = { clavo: [0, ''], salto: [0, ''], saltoM: [0, ''] };
  (co.pasos || ['a']).forEach((a, i, LL) => {
    if (a === 'nota') return;
    const du = Math.max(4.4, 1.9 + (pasos[i] || '').length * 0.058, (a && a.dura) || 0), deCerca = i === 0 || LL[i - 1] === 'nota';
    let antes = null;
    if (a === 'rep' || (a && a.rep != null)) { if (deCerca) { d.aPostura(d.inicio, 0); d.cuadro(0.001, true); } if (d.modo !== 'rep') { d.aRep(deCerca ? 0 : 0.6); if (a.rep != null) d.tau = a.rep; } }
    else if (a && a.sec) { if (deCerca || !d.E) { d.aPostura(a.desde || d.inicio, 0); d.cuadro(0.001, true); } d.aSecuencia(a.sec, a.desde); }
    else d.aPostura(typeof a === 'string' ? a : d.inicio, deCerca ? 0 : 0.7);
    if (!deCerca && d.E) antes = [d.E.pel, d.E.cab, d.E.i.mun, d.E.d.mun, d.E.i.tob, d.E.d.tob].map(p => p.slice());
    for (let q = 0, N = Math.round(du / DT); q < N; q++) {
      d.cuadro(DT, false);
      const E = d.E, donde = 'paso ' + (i + 1) + ', ' + (q * DT).toFixed(2) + ' s';
      if (d.w >= 1) (d.metas || []).forEach(mm => { const L = E[mm[0].charAt(1)], e = dist(mm[0].charAt(0) === 't' ? L.tob : L.mun, mm[1]); if (e > m.clavo[0]) m.clavo = [e, mm[0] + ', ' + donde]; });
      const ahora = [E.pel, E.cab, E.i.mun, E.d.mun, E.i.tob, E.d.tob].map(p => p.slice());
      if (antes) ahora.forEach((p, j) => { const e = dist(p, antes[j]), k = j < 2 ? 'salto' : 'saltoM'; if (e > m[k][0]) m[k] = [e, NOM[j] + ', ' + donde]; });
      antes = ahora;
    }
  });
  const f = [];
  if (m.clavo[0] > 0.02) f.push('lo clavado se mueve ' + m.clavo[0].toFixed(3) + ' cm (' + m.clavo[1] + ')');
  if (m.salto[0] > 14) f.push('el cuerpo da un salto de ' + m.salto[0].toFixed(1) + ' cm (' + m.salto[1] + ')');
  if (m.saltoM[0] > 36) f.push('una mano o un pie da un salto de ' + m.saltoM[0].toFixed(1) + ' cm (' + m.saltoM[1] + ')');
  for (const k in tope) tope[k] = Math.max(tope[k], m[k][0]);
  if (f.length) mal++;
  if (DET || f.length) console.log(id.padEnd(40) + (f.length ? ' MAL: ' + f.join(' · ') : ' clavo ' + m.clavo[0].toFixed(3) + ' · cuerpo ' + m.salto[0].toFixed(1) + ' (' + m.salto[1] + ') · mano o pie ' + m.saltoM[0].toFixed(1) + ' (' + m.saltoM[1] + ')'));
}
console.log(ids.length + ' vídeos · fuera: ' + mal + ' · lo más: lo clavado ' + tope.clavo.toFixed(3) + ' cm, el cuerpo ' + tope.salto.toFixed(1) + ' cm por cuadro, una mano o un pie ' + tope.saltoM.toFixed(1));
process.exit(mal ? 1 : 0);
