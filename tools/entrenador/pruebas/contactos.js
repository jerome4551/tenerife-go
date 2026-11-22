#!/usr/bin/env node
/* Los contactos de cada coreografía, sin navegador: ¿pisa el suelo o lo atraviesa?, ¿la mano que se apoya en la pared la toca?,
   ¿se le mete una mano en un muslo? Con las medidas del dibujo (20-figura.js: zapaAPlano, manoAPlano, miembroAPlano, troncoAPlano,
   cabezaAPlano, manoEnMuslo: la distancia de lo que se pinta a un plano, o lo que una mano se mete en un muslo) y el Director de
   verdad (lo clavado, el rodeo de los muslos y lo apartado, en su sitio).

     node tools/entrenador/pruebas/contactos.js                 todas, y lo que se sale de los límites (sale con 1 si hay algo)
     node tools/entrenador/pruebas/contactos.js <id> [<id>…]    de esos ejercicios, todas las medidas

   Dos pasadas:
   · mide(T, id): cada tramo de la repetición y de las secuencias, en 25 instantes, y cada postura que se mantiene. De cada cosa
     (zapatilla, mano, antebrazo, brazo, muslo, pierna, tronco, cabeza) lo más hundido en el suelo y en cada pared (0, toca; negativo,
     dentro); de cada mano, lo más que se mete en un muslo (positivo, dentro), en movimiento y quieta; de la mano que se apoya (la que
     la coreografía pone de plano contra algo: m: { palma, dedos }), a cuánto queda de su suelo, su pared o su banco; y las manos
     abiertas que en una postura mantenida miran de cerca a una pared o al suelo sin tocarlos. Y (20-11-2026) de la cabeza, lo que
     se le mete el cilindro del material que le pase más cerca (cabeza-barra); y del tobillo que acaba un tramo donde lo empezó,
     lo que se aparta por el camino (pie-deriva: lo que apoya y no se mueve tiene que ir clavado).
   · video(T, id, pasos): el vídeo como se ve, cuadro a cuadro (30 por segundo), con la vida (respira, se balancea, llega por
     partes): lo que una mano se mete en un muslo, quieto y en cualquier cuadro, y lo que cambia de un cuadro al siguiente lo que el
     Director la aparta (no puede dar tirones); y la cabeza contra los cilindros del material, también cuadro a cuadro.
   juzga(m, v) dice qué se sale de LIMITES. Lo usa tools/auditar_entrenador.js (sección 1).

   El suelo es y = 0; las paredes, las del material ('pared'); los bancos planos, su tapa. Lo demás (un escalón, un cajón, la silla)
   no se mide aquí, salvo la cabeza contra los CILINDROS del material, sean los que sean (la barra de dominadas, la de pesas, los
   tubos y las asas de una máquina, un mango, los ramales de una cuerda o de una cinta): al material se le hace pintar de mentira con
   Cilindro.pon espiado, así que lo que se mide es lo que se dibuja. Y (bloque 15, 20-11-2026) las PELOTAS, que se espían igual
   (Esfera.pon: el fitball y el balón medicinal): lo que el cuerpo se mete en cada una (pelota-cuerpo; las manos, que la sujetan
   o se apoyan en ella, aparte: pelota-mano), lo que le falta a lo más cercano para tocar un fitball (pelota-posada: no puede
   quedarse en el aire, siempre hay algo posado en él) y la mano apoyada de plano, que ahora también puede estarlo en una pelota.
   Los cojines, las placas y los discos no son cilindros ni esferas: no entran. */
'use strict';
const fs = require('fs'), path = require('path');
const RAIZ = path.join(__dirname, '..', '..', '..');
const nodo = () => ({ style: {}, childNodes: [], classList: { add() {}, remove() {}, toggle() {} }, setAttribute() {}, getAttribute() { return ''; }, appendChild(c) { return c; }, insertBefore(c) { return c; }, removeChild() {}, get firstChild() { return null; } });
function carga(fichero) {
  const caja = { window: {}, document: { createElementNS: nodo, createElement: nodo }, Math, Object, Array, JSON, String, Number, RegExp, Error, console: { log() {} } };
  /* el motor y, detrás, sus trozos (motor.js): todas las coreografías */
  return require('./motor.js').carga(caja, fichero)._;
}
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], cruz = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const uni = a => { const l = Math.sqrt(dot(a, a)) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const r1 = x => Math.round(x * 10) / 10;
const SUELO = { c: [0, 0, 0], n: [0, 1, 0] };
/* las paredes del material: un punto, la normal hacia el lado libre, y su paño (ancho y alto) */
function paredes(co) {
  return (co.material || []).filter(q => q[0] === 'pared').map(q => { const o = q[1] || {}, n = uni(o.normal || [0, 0, -1]); return { c: [o.x || 0, 0, o.z == null ? 40 : o.z], n, t: uni(cruz([0, 1, 0], n)), w: o.ancho || 150, h: o.alto || 215 }; });
}
/* las tapas de los bancos planos (a su altura: 44 cm si no se dice) */
function tapas(co) {
  return (co.material || []).filter(q => q[0] === 'banco' && (q[1] || {}).respaldo == null).map(q => { const o = q[1] || {}, r = (o.rumbo || 0) * Math.PI / 180; return { c: [o.en ? o.en[0] : 0, o.alto || 44, o.en ? o.en[1] : 0], n: [0, 1, 0], ux: [Math.cos(r), 0, -Math.sin(r)], uz: [Math.sin(r), 0, Math.cos(r)], a: (o.ancho || 28) / 2, l: (o.largo || 120) / 2 }; });
}
const enTapa = (P, B) => Math.abs(dot(sub(P, B.c), B.ux)) <= B.a + 3 && Math.abs(dot(sub(P, B.c), B.uz)) <= B.l + 3;
const enPano = (P, W) => Math.abs(dot(sub(P, W.c), W.t)) <= W.w / 2 + 1 && P[1] >= -1 && P[1] <= W.h + 1;
/* los cilindros y las esferas que pinta el material: se espían Cilindro.pon y Esfera.pon (50-material.js) mientras se le hace pintar */
let ESPIA = null, ESPIA_E = null;
function espiar(T) {
  const P = T.Cilindro.prototype; if (P.pon.espia) return;
  const pon = P.pon; P.pon = function (cam, p, q, r) { if (ESPIA) ESPIA.push([p.slice(), q.slice(), r]); return pon.apply(this, arguments); }; P.pon.espia = true;
  const Q = T.Esfera.prototype, ponE = Q.pon; Q.pon = function (cam, c, R) { if (ESPIA_E) ESPIA_E.push([c.slice(), R]); return ponE.apply(this, arguments); };
}
/* lo que pinta el material en un instante: { cil: [[p, q, r]…], esf: [[c, R]…] } */
function pintado(T, esc, E, ctx, colocar) {
  const cil = [], esf = []; espiar(T);
  esc.material.forEach((M, i) => {
    if (!M.pintar) { if (M.roto) throw new Error('el material ' + i + ' no se pudo montar (' + M.roto + ')'); return; }
    ESPIA = []; ESPIA_E = [];
    try { if (colocar) M.colocar(E, ctx); M.pintar(E, esc.cam, [], ctx); } finally { cil.push(...ESPIA); esf.push(...ESPIA_E); ESPIA = null; ESPIA_E = null; }
  });
  return { cil, esf };
}
/* el cuerpo y una pelota: [lo que se mete lo que más (sin las manos), qué pieza, lo que se mete la mano que más, lo que le falta a lo más cercano] */
const PIEZAS_P = [['tronco'], ['cabeza']].concat(...['i', 'd'].map(k => [['zapa', k], ['pierna', k], ['muslo', k], ['brazo', k], ['ante', k]]));
const NOM_P = { zapa: 'zapatilla', ante: 'antebrazo' };
function enPelota(T, E, c, R) {
  let cuerpo = 1e9, que = '', mano = 1e9;
  for (const q of PIEZAS_P) { const g = T.huecoPelota(E, [q], c, R); if (g < cuerpo) { cuerpo = g; que = (NOM_P[q[0]] || q[0]) + (q[1] ? ' ' + q[1] : ''); } }
  for (const k of ['i', 'd']) mano = Math.min(mano, T.huecoPelota(E, [['mano', k]], c, R));
  return [cuerpo, que, mano, Math.min(cuerpo, mano)];
}
/* lo que le falta a la cabeza para tocar el cilindro del material que le pase más cerca (negativo: se le mete), con el material como
   lo deja el Director en ese instante (ctx). colocar: si hay que ponerlo antes en su sitio (el Director, en sus cuadros, ya lo hace) */
function cabezaBarra(T, esc, E, ctx, colocar, mat) {
  let min = 1e9;
  for (const c of (mat || pintado(T, esc, E, ctx, colocar)).cil) min = Math.min(min, T.cabezaACilindro(E, c[0], c[1], c[2]));
  return min;
}
/* lo que el Director le dice al material en cada momento (60-director.js): reposo, si lo que aún no se ha cogido espera en su sitio;
   enLista(l), lo mismo para el material que trae su lista; de, de qué postura sale; a, a cuál va; u, por dónde anda el tramo (de 0 a
   1). modo: 'rep', 'sec' o 'postura' */
function ctxDe(co, modo, de, a, w) {
  const rp = co.reposo;
  return { de, a, u: modo === 'postura' ? 1 : w, reposo: !!rp && ((modo === 'postura' && rp.indexOf(de) >= 0) || (modo === 'sec' && rp.indexOf(de) >= 0 && w < 0.97)),
    enLista: l => !!l && ((modo === 'postura' && l.indexOf(de) >= 0) || (modo === 'sec' && l.indexOf(de) >= 0 && (w < 0.97 || l.indexOf(a) >= 0))) };
}
/* ── (22-11-2026) lo que se dobla, lo que salta y lo que gira de golpe ──
   doblez: lo que la rodilla (o el codo) se aparta de la línea de su miembro (de la cadera al tobillo, del hombro a la muñeca): un
   vector. flexion: cuánto se dobla, en grados (0, recto). reves: lo que la rodilla cae DETRÁS de esa línea (cm; el frente es el de
   la pelvis llevado a donde apunta la pierna: 10-esqueleto.js, frenteDePierna): una rodilla no dobla hacia atrás */
const MIEMBROS = [['rod', 'i'], ['rod', 'd'], ['cod', 'i'], ['cod', 'd']];
const lar = v => Math.sqrt(dot(v, v)), ang = (u, v) => Math.acos(Math.max(-1, Math.min(1, dot(u, v) / ((lar(u) * lar(v)) || 1)))) * 180 / Math.PI;
function flexion(E, q, k) { const L = E[k]; return q === 'rod' ? ang(sub(L.rod, L.cad), sub(L.tob, L.rod)) : ang(sub(L.cod, L.hom), sub(L.mun, L.cod)); }
function doblez(E, q, k) { const L = E[k], a = q === 'rod' ? L.cad : L.hom, m = q === 'rod' ? L.rod : L.cod, b = q === 'rod' ? L.tob : L.mun, u = uni(sub(b, a)), v = sub(m, a), t = dot(v, u); return [v[0] - u[0] * t, v[1] - u[1] * t, v[2] - u[2] * t]; }
function reves(T, E, k) { const L = E[k]; return -dot(doblez(E, 'rod', k), T.frenteDePierna(E.Bp, uni(sub(L.tob, L.cad)))); }
/* lo clavado en un tramo o en una postura: { ti: 'fijo' | 'viaja', … } (lo clavado a un agarre del material o a un punto dicho no viaja) */
function clavadoEn(lista) { const r = {}; (lista || []).forEach(c => { const m = /^([mt][id])([@=])?/.exec(String(c)); if (m) r[m[1]] = m[2] ? 'fijo' : 'viaja'; }); return r; }
/* los puntos que se siguen en el vídeo: ninguno puede moverse en un cuadro mucho más que en el de antes y en el de después */
const SEGUIDOS = [['rod', 'la rodilla'], ['cod', 'el codo'], ['mun', 'la muñeca'], ['tob', 'el tobillo'], ['hom', 'el hombro'], ['cad', 'la cadera'], ['dedos', 'las yemas'], ['dedosPie', 'la punta del pie'], ['talon', 'el talón']];
function puntosDe(E) {
  const P = { 'la cabeza': E.cab, 'la nariz': [E.cab[0] + E.Bc[1][0] * 8 + E.Bc[2][0] * 12, E.cab[1] + E.Bc[1][1] * 8 + E.Bc[2][1] * 12, E.cab[2] + E.Bc[1][2] * 8 + E.Bc[2][2] * 12] };
  for (const k of ['i', 'd']) for (const [q, n] of SEGUIDOS) P[n + ' ' + k] = E[k][q];
  return P;
}
/* lo que gira una mano sobre su antebrazo entre dos esqueletos (grados): la palma de uno y la del otro, vistas de frente al antebrazo del segundo */
function giroMano(Ea, Eb, k) {
  const lw = Eb[k].lw, pr = v => { const t = dot(v, lw); return [v[0] - lw[0] * t, v[1] - lw[1] * t, v[2] - lw[2] * t]; }, a = pr(Ea[k].mano.palma), b = pr(Eb[k].mano.palma);
  return lar(a) < 0.3 || lar(b) < 0.3 ? 0 : ang(a, b);
}
/* un Director de verdad sobre un escenario de mentira (no pinta) */
function director(T, co) {
  const esc = { material: (co.material || []).map(q => { try { return new T.MATERIAL[q[0]]({ defs: nodo() }, q[1] || {}); } catch (e) { return { colocar() {}, roto: String(e && e.message) }; } }), poner() {}, detras: nodo(), encima: nodo(), cam: new T.Camara(),
    cab: { emocion() {}, parpadea() {}, m: {}, habla: 0, t: 0, paso() {}, hablar() {} }, fig: {}, pintar() {} };
  const d = new T.Director(esc); d.cargar(co); d.pintarRastro = () => {}; d.pintarMarcas = () => {};
  return d;
}
/* los tramos de una coreografía, como los hace el Director: [{ de, a, clavos }, etiqueta, curva] */
function tramosDe(T, co) {
  const l = []; let de = co.inicio || 'a';
  (co.rep || []).forEach((s, i) => { l.push([{ de, a: s[0], clavos: s[3] }, 'rep:' + i, T.CURVA[s[2] || (s[0] === de ? 'lineal' : 'suave')] || T.CURVA.suave]); de = s[0]; });
  (co.pasos || []).forEach((p, j) => { if (p && p.sec) { let q = p.desde || co.inicio || 'a'; p.sec.forEach((s, i) => { l.push([{ de: q, a: s[0], clavos: s[3] }, (j + 1) + ':' + i, T.CURVA[s[2] || 'suave'] || T.CURVA.suave]); q = s[0]; }); } });
  return l;
}
/* las posturas que se mantienen: un paso que es una postura, donde acaba una secuencia, la isométrica y los extremos de la repetición */
function quietasDe(co) {
  const q = new Set();
  (co.pasos || []).forEach(p => { if (typeof p === 'string' && p !== 'rep' && p !== 'nota' && co.posturas[p]) q.add(p); if (p && p.sec && p.sec.length) q.add(p.sec[p.sec.length - 1][0]); });
  if (co.isometrico && co.posturas[co.isometrico]) q.add(co.isometrico);
  (co.rep || []).forEach(s => q.add(s[0]));
  if (co.inicio) q.add(co.inicio);
  return q;
}

function mide(T, id) {
  const co = T.COREO[id], d = director(T, co), PW = paredes(co), PB = tapas(co), R = {}, huecos = {};
  const peor = (c, v, donde) => { if (!(c in R) || v < R[c][0]) R[c] = [r1(v), donde]; };
  const mejor = (c, v, donde) => { if (!(c in R) || v > R[c][0]) R[c] = [r1(v), donde]; };
  const uno = (E, donde, quieta, nombre, esf) => {
    for (const k of ['i', 'd']) {
      const L = E[k], M = E.S.m[k];
      peor('zapa-suelo', T.zapaAPlano(L, k, SUELO.c, SUELO.n), 'pie ' + k + ' · ' + donde);
      peor('mano-suelo', T.manoAPlano(L, M, SUELO.c, SUELO.n), 'mano ' + k + ' · ' + donde);
      for (const q of ['muslo', 'pierna', 'brazo', 'ante']) peor('cuerpo-suelo', T.miembroAPlano(E, k, q, SUELO.c, SUELO.n), (q === 'ante' ? 'antebrazo' : q) + ' ' + k + ' · ' + donde);
      for (const W of PW) {
        const en = P => enPano(P, W), pon = (c, v, dd) => { if (v < 1e8) peor(c, v, dd); };
        pon('mano-pared', T.manoAPlano(L, M, W.c, W.n, en), 'mano ' + k + ' · ' + donde);
        pon('zapa-pared', T.zapaAPlano(L, k, W.c, W.n, en), 'pie ' + k + ' · ' + donde);
        for (const q of ['pierna', 'muslo', 'brazo', 'ante']) pon('cuerpo-pared', T.miembroAPlano(E, k, q, W.c, W.n, en), (q === 'ante' ? 'antebrazo' : q) + ' ' + k + ' · ' + donde);
      }
      for (const m of ['i', 'd']) { const v = T.manoEnMuslo(E, k, m); mejor('mano-muslo', v, 'mano ' + k + ' en el muslo ' + m + ' · ' + donde); if (quieta) mejor('mano-muslo-quieta', v, 'mano ' + k + ' en el muslo ' + m + ' · ' + donde); }
      if (!quieta) continue;
      /* la mano apoyada (de plano, dicha en el mundo): a cuánto queda de lo más cercano de lo suyo (el suelo, una pared, un banco) */
      if (M.ded && M.wd > 0.999) {
        let g = T.manoAPlano(L, M, SUELO.c, SUELO.n);
        for (const W of PW) if (enPano(L.mun, W) || enPano(L.dedos, W)) { const gw = T.manoAPlano(L, M, W.c, W.n); if (Math.abs(gw) < Math.abs(g)) g = gw; }
        for (const B of PB) if (enTapa(L.mun, B)) { const gb = T.manoAPlano(L, M, B.c, B.n); if (Math.abs(gb) < Math.abs(g)) g = gb; }
        for (const q of esf || []) { const ge = T.huecoPelota(E, [['mano', k]], q[0], q[1]); if (Math.abs(ge) < Math.abs(g)) g = ge; }      /* o en una pelota */
        if (!('apoyada' in R) || Math.abs(g) > Math.abs(R.apoyada[0])) R.apoyada = [r1(g), 'mano ' + k + ' · ' + donde];
      }
      /* la mano abierta que mira a una pared o al suelo y se queda cerca sin tocar */
      const pal = L.mano.palma, abierta = M.c < 0.5, enSuelo = Math.abs(T.manoAPlano(L, M, SUELO.c, SUELO.n)) <= 1 && -pal[1] > 0.6;
      for (const W of PW) if (!enSuelo && (enPano(L.mun, W) || enPano(L.dedos, W))) { const g = T.manoAPlano(L, M, W.c, W.n, P => enPano(P, W)), mira = -dot(pal, W.n); if (g > 0.7 && g < 12 && Math.abs(mira) > 0.6) { const c = 'pared · ' + nombre + ' ' + k; if (!(c in huecos) || g < huecos[c]) huecos[c] = r1(g); } }
      const g = T.manoAPlano(L, M, SUELO.c, SUELO.n);
      if (g > 0.7 && g < 6 && abierta && -pal[1] > 0.6) { const c = 'suelo · ' + nombre + ' ' + k; if (!(c in huecos) || g < huecos[c]) huecos[c] = r1(g); }
    }
    peor('cabeza-suelo', T.cabezaAPlano(E, SUELO.c, SUELO.n), donde); peor('tronco-suelo', T.troncoAPlano(E, SUELO.c, SUELO.n), donde);
    for (const W of PW) { const en = P => enPano(P, W); let v = T.cabezaAPlano(E, W.c, W.n, en); if (v < 1e8) peor('cabeza-pared', v, donde); v = T.troncoAPlano(E, W.c, W.n, en); if (v < 1e8) peor('tronco-pared', v, donde); }
  };
  const hayMat = d.esc.material.length > 0, lejos = (a, b) => Math.sqrt(dot(sub(a, b), sub(a, b)));
  /* el material, tal como queda en ese instante: la cabeza contra sus cilindros y el cuerpo contra sus pelotas. Devuelve las pelotas */
  const material = (E, ctx, donde) => {
    if (!hayMat) return [];
    const mat = pintado(T, d.esc, E, ctx, true), g = cabezaBarra(T, d.esc, E, ctx, false, mat);
    if (g < 1e8) peor('cabeza-barra', g, donde);
    for (const q of mat.esf) {
      const [cuerpo, que, mano, cerca] = enPelota(T, E, q[0], q[1]);
      if (cuerpo < 1e8) peor('pelota-cuerpo', cuerpo, que + ' · ' + donde);
      if (mano < 1e8) peor('pelota-mano', mano, donde);
      if (q[1] >= 20) mejor('pelota-posada', Math.min(cerca, 99), donde);          /* un fitball: algo tiene que estar posado en él */
    }
    return mat.esf;
  };
  for (const [s, et, curva] of tramosDe(T, co)) {
    if (!d.K[s.de] || !d.K[s.a]) { R.error = 'postura que no existe: ' + s.de + ' o ' + s.a; continue; }
    const modo = et.slice(0, 3) === 'rep' ? 'rep' : 'sec', tob = { i: [], d: [] }, fl = MIEMBROS.map(() => []);
    for (let q = 0; q <= 24; q++) {
      d.metas = []; const E = d.enTramo(s, curva(q / 24)), donde = et + ':' + r1(q / 24) + ' (' + s.de + '→' + s.a + ')';
      uno(E, donde, (q === 24 || q === 0) && s.de === s.a, s.a, material(E, ctxDe(co, modo, s.de, s.a, q / 24), donde));
      tob.i.push(E.i.tob); tob.d.push(E.d.tob);
      MIEMBROS.forEach((m, j) => fl[j].push(flexion(E, m[0], m[1])));
      for (const k of ['i', 'd']) mejor('rodilla-reves', reves(T, E, k), 'rodilla ' + k + ' · ' + donde);
    }
    /* lo que va recto en las dos puntas del tramo (hasta 30° de rodilla o de codo) no se dobla de paso: lo clavado que no viaja
       (el pie o la mano se quedan donde están), ni 6° (va tenso: 60-director.js); y en la repetición, lo clavado que viaja (un
       paso), ni 20, y lo libre, ni 30 (un brazo que bracea se dobla algo por el camino, y es natural). Y en la repetición nada se
       dobla de paso 45° más que en sus puntas: si de verdad se dobla tanto, que lo diga una postura */
    if (s.de !== s.a) {
      const cl = clavadoEn(s.clavos || co.clavos), A = d.K[s.de], B = d.K[s.a];
      MIEMBROS.forEach((m, j) => {
        const f = fl[j], bulto = Math.max(...f) - Math.max(f[0], f[24]), c = (m[0] === 'rod' ? 't' : 'm') + m[1], p = m[0] === 'rod' ? 'tob' : 'mun';
        const fijo = cl[c] === 'fijo' || (cl[c] && lar(sub(A[m[1]][p], B[m[1]][p])) <= 2), dd = (m[0] === 'rod' ? 'rodilla ' : 'codo ') + m[1] + ' · ' + et + ' (' + s.de + '→' + s.a + ') ' + Math.round(f[0]) + '°→' + Math.round(Math.max(...f)) + '°→' + Math.round(f[24]) + '°';
        if (Math.max(f[0], f[24]) <= 30) {
          if (fijo) mejor('dobla-clavado', bulto, dd);
          else if (modo === 'rep') mejor(cl[c] ? 'dobla-rep-viaja' : 'dobla-rep-libre', bulto, dd);
        }
        if (modo === 'rep') mejor('dobla-rep', bulto, dd);
      });
    }
    /* el tobillo que acaba el tramo donde lo empezó (a menos de 3 mm): lo que se aparta por el camino */
    if (s.de !== s.a) for (const k of ['i', 'd']) if (lejos(tob[k][0], tob[k][24]) < 0.3) mejor('pie-deriva', Math.max(...tob[k].map(p => lejos(p, tob[k][0]))), 'tobillo ' + k + ' · ' + et + ' (' + s.de + '→' + s.a + ')');
  }
  for (const n of quietasDe(co)) {
    if (!d.K[n]) continue; d.metas = [];
    const clN = d.suelto(n) ? [] : (co.clavosEn && co.clavosEn[n]) || undefined;
    const E = d.enTramo({ de: n, a: n, clavos: clN }, 1);
    uno(E, 'postura ' + n, true, n, material(E, ctxDe(co, 'postura', n, n, 1), 'postura ' + n));
    for (const k of ['i', 'd']) mejor('rodilla-reves', reves(T, E, k), 'rodilla ' + k + ' · postura ' + n);
  }
  /* (22-11-2026) los tramos enlazan: donde acaba un tramo empieza el siguiente (cada uno con lo suyo clavado), y donde acaba una
     secuencia, la postura en la que se queda (con lo que lleve clavado quieta). Si no, ahí da un tirón: en seis máquinas del bloque
     14 las manos llegaban sueltas y, al quedarse quieto, saltaban a las asas (hasta 10 cm) */
  const salto = (Ea, Eb) => { let m = 0, c = ''; const p = puntosDe(Ea), q = puntosDe(Eb); for (const n in p) { const v = lar(sub(p[n], q[n])); if (v > m) { m = v; c = n; } } return [m, c]; };
  const une = (sa, sb, eb, donde) => {
    if (!d.K[sa.de] || !d.K[sa.a] || !d.K[sb.de] || !d.K[sb.a]) return;
    d.metas = []; const Ea = d.enTramo(sa, 1); d.metas = []; const Eb = d.enTramo(sb, eb), [v, c] = salto(Ea, Eb);
    mejor('enlace', v, c + ' · ' + donde);
  };
  const quieta = n => ({ de: n, a: n, clavos: d.suelto(n) ? [] : (co.clavosEn && co.clavosEn[n]) || undefined });
  if ((co.rep || []).length > 1) { let de = co.inicio || 'a'; const tr = co.rep.map(q => { const t = { de, a: q[0], clavos: q[3] }; de = q[0]; return t; }); tr.forEach((t, i) => { const u = tr[(i + 1) % tr.length]; if (t.a === u.de) une(t, u, 0, 'rep:' + i + ' (' + t.de + '→' + t.a + ') con lo siguiente'); }); }
  (co.pasos || []).forEach((p, j) => {
    if (!p || !p.sec || !p.sec.length) return;
    let de = p.desde || co.inicio || 'a'; const tr = p.sec.map(q => { const t = { de, a: q[0], clavos: q[3] }; de = q[0]; return t; });
    tr.forEach((t, i) => { if (i + 1 < tr.length) une(t, tr[i + 1], 0, 'paso ' + (j + 1) + ':' + i + ' (' + t.de + '→' + t.a + ') con lo siguiente'); else une(t, quieta(t.a), 1, 'paso ' + (j + 1) + ':' + i + ' (' + t.de + '→' + t.a + ') con la postura ' + t.a); });
  });
  R.huecos = Object.keys(huecos).map(c => c + ' a ' + huecos[c] + ' cm');
  return R;
}

/* el vídeo como se ve: cada paso de la ficha, lo que dura su texto, con el Director entero (la vida, lo clavado, el rodeo, lo
   apartado y su deslizar). pasos: los de la ficha en castellano (para lo que dura cada uno) */
function video(T, id, pasos, fps) {
  const co = T.COREO[id], d = director(T, co), DT = 1 / (fps || 30), R = { 'mano-muslo-vida': [-1e9, ''], 'mano-muslo-quieta-vida': [-1e9, ''], tiron: [0, ''], cuadros: 0 };
  /* el escenario de mentira «pinta» el material (ya colocado por el Director) con los cilindros espiados, y se mide la cabeza */
  let barra = 1e9; if (d.esc.material.length) d.esc.pintar = (E, ctx) => { barra = cabezaBarra(T, d.esc, E, ctx, false); };
  const lar = v => Math.sqrt(dot(v, v));
  let ult = null; const suave0 = d.suave;
  d.suave = function (E0, E1, dt, cl) { const E = suave0.call(this, E0, E1, dt, cl); ult = { E0, E }; return E; };
  /* (22-11-2026) y lo que salta: de cada cuadro se guardan sus puntos, las dobleces de rodillas y codos y las palmas, tal como se
     ven; y la mano tal como sale antes de que el Director la frene (sinGolpe) */
  let crudo = null; const sg0 = d.sinGolpe;
  if (sg0) d.sinGolpe = function (E, dt) { crudo = E; return sg0.call(this, E, dt); };
  let H = [];
  const sube = (c, v, donde) => { if (!R[c] || v > R[c][0]) R[c] = [r1(v), donde]; };
  const cierra = () => {
    for (let n = 1; n < H.length; n++) {
      const a = H[n - 1], b = H[n];
      /* la rodilla o el codo que cambian de lado de golpe: la doblez se da la vuelta de un cuadro al siguiente. Cuenta lo que
         salta de más sobre lo que el propio miembro viaja en ese cuadro (la media de sus dos puntas): un brazo casi recto que
         baja deprisa y empieza a doblarse hacia otro lado no da un salto, pasa por recto */
      MIEMBROS.forEach((m, j) => {
        if (dot(a.W[j], b.W[j]) >= 0) return;
        const k = m[1], p = m[0] === 'rod' ? ['cad', 'tob'] : ['hom', 'mun'];
        const viaje = (lar(sub(b.E[k][p[0]], a.E[k][p[0]])) + lar(sub(b.E[k][p[1]], a.E[k][p[1]]))) / 2;
        sube('lado', lar(sub(b.W[j], a.W[j])) - viaje, (m[0] === 'rod' ? 'rodilla ' : 'codo ') + k + ' · ' + b.donde);
      });
      for (const k of ['i', 'd']) {
        sube('mano-gira', giroMano(a.E, b.E, k), 'mano ' + k + ' · ' + b.donde);
        /* ya dentro de la repetición, y con un cuarto de segundo para acabar lo que traiga de antes (llegar a ella desde la
           postura anterior pasa una vez; lo de dentro se repite) */
        if (b.rep) sube('mano-gira-rep', b.freno[k], 'mano ' + k + ' · ' + b.donde);
      }
      if (n < 2 || n > H.length - 2) continue;
      /* el punto que en un cuadro se mueve más de dos veces y media lo que en el de antes y en el de después, y 2 cm: no es un
         movimiento rápido (un salto acelera y frena en varios cuadros), es que algo cambia de sitio de golpe */
      const z = H[n - 2], y = H[n + 1];
      for (const c in b.P) {
        const d1 = lar(sub(a.P[c], z.P[c])), d2 = lar(sub(b.P[c], a.P[c])), d3 = lar(sub(y.P[c], b.P[c]));
        if (d2 > 2.5 * Math.max(d1, d3) + 2) sube('pico', d2 - Math.max(d1, d3), c + ' · ' + b.donde);
      }
    }
    H = [];
  };
  (co.pasos || ['a']).forEach((a, i, L) => {
    if (a === 'nota') return;
    const dur = Math.max(4.4, 1.9 + ((pasos && pasos[i]) || '').length * 0.058), deCerca = i === 0 || L[i - 1] === 'nota';
    if (deCerca) cierra();        /* un corte: lo de antes no enlaza con lo de después */
    /* como el reproductor (80-reproductor.js) */
    if (a === 'rep' || (a && a.rep != null)) { if (deCerca) { d.aPostura(d.inicio, 0); d.cuadro(0.001, true); } if (d.modo !== 'rep') { d.aRep(deCerca ? 0 : 0.6); if (a.rep != null) d.tau = a.rep; } }
    else if (a && a.sec) { if (deCerca || !d.E) { d.aPostura(a.desde || d.inicio, 0); d.cuadro(0.001, true); } d.aSecuencia(a.sec, a.desde); }
    else d.aPostura(typeof a === 'string' ? a : d.inicio, deCerca ? 0 : 0.7);
    let ant = null, dentro = 0;
    /* la repetición se mira entera dos veces, dure lo que dure el texto del paso: el empalme del final con el principio también es vídeo */
    for (let n = 0, N = Math.round((d.modo === 'rep' ? Math.max(dur, 2 * d.T + 0.5) : dur) / DT); n < N; n++) {
      barra = 1e9; crudo = null; const Ev = d.cuadro(DT, false); R.cuadros++;
      const donde = 'paso ' + (i + 1) + ', ' + (n * DT).toFixed(2) + ' s' + (d.modo === 'postura' ? ' (postura ' + d.meta + ')' : d.modo === 'sec' ? ' (' + d.secDe + '→' + d.secA + ')' : ' (repetición)'), quieto = d.modo === 'postura' && d.w >= 1, ap = {};
      if (barra < 1e8 && (!R['cabeza-barra-vida'] || barra < R['cabeza-barra-vida'][0])) R['cabeza-barra-vida'] = [r1(barra), donde];
      dentro = d.modo === 'rep' && d.w >= 1 ? dentro + 1 : 0;
      H.push({ E: Ev, P: puntosDe(Ev), W: MIEMBROS.map(m => doblez(Ev, m[0], m[1])), donde, rep: dentro > 8, freno: { i: crudo ? giroMano(crudo, Ev, 'i') : 0, d: crudo ? giroMano(crudo, Ev, 'd') : 0 } });
      for (const k of ['i', 'd']) sube('rodilla-reves-vida', reves(T, Ev, k), 'rodilla ' + k + ' · ' + donde);
      for (const k of ['i', 'd']) {
        ap[k] = sub(ult.E[k].mun, ult.E0[k].mun);
        if (ant) { const s = lar(sub(ap[k], ant[k])) / DT; if (s > R.tiron[0]) R.tiron = [r1(s), 'mano ' + k + ' · ' + donde]; }
        for (const m of ['i', 'd']) { const z = T.manoEnMuslo(ult.E, k, m); if (z > R['mano-muslo-vida'][0]) R['mano-muslo-vida'] = [r1(z), 'mano ' + k + ' en el muslo ' + m + ' · ' + donde]; if (quieto && z > R['mano-muslo-quieta-vida'][0]) R['mano-muslo-quieta-vida'] = [r1(z), 'mano ' + k + ' en el muslo ' + m + ' · ' + donde]; }
      }
      ant = ap;
    }
  });
  cierra();
  return R;
}

/* los límites (cm). Lo que se apoya, toca: una zapatilla o una mano no se hunden más de 1 cm en el suelo ni en una pared, y la mano
   que la coreografía apoya de plano queda a menos de 1 cm de su superficie. El cuerpo es blando y se dibuja con volumen: tumbado, el
   tronco y la cabeza (con su tupé) se asientan unos 3,4 cm, y una rodilla o un codo apoyados, hasta 2,2. La mano no se mete en un
   muslo más de 1 cm quieta, ni más de 2 de paso. Y lo que el Director aparta una mano no cambia más deprisa de 95 cm/s (su tope
   son 90: 60-director.js, VAP).
   La cabeza y las barras (20-11-2026): una barra puede rozarle el pelo (al subir en una dominada el tupé pasa a ras de ella: 1,8 cm
   en las del bloque 1), pero no metérsele: ni 2,5 cm en los tramos y las posturas, ni 3,5 en el vídeo, donde el tronco llega un
   instante después que la cadera y la cabeza después que el tronco (55-vida.js: en esas mismas dominadas, 3,3). Se mide hacia el
   centro de cada pieza de la cabeza (el pelo con el cráneo, la quijada, el mentón, la nariz, las orejas), y del tupé, la punta y
   la mitad de cada púa. Y el pie que no se mueve: el tobillo que acaba un tramo donde lo empezó no se aparta más de 2 cm por el
   camino (sin clavar, la mezcla de dos posturas lo pasea: en la sentadilla hack eran 4,1 cm, con la zapatilla hundida en la
   plataforma; hoy el que más, 0,8) */
const LIMITES = {
  'zapa-suelo': -1.0, 'zapa-pared': -1.0, 'mano-suelo': -1.0, 'mano-pared': -1.0,
  'cuerpo-suelo': -2.5, 'cuerpo-pared': -2.5, 'tronco-suelo': -4.0, 'tronco-pared': -3.0, 'cabeza-suelo': -4.0, 'cabeza-pared': -3.5,
  'apoyada': 1.0, 'mano-muslo': 2.0, 'mano-muslo-quieta': 1.0, 'mano-muslo-vida': 3.0, 'mano-muslo-quieta-vida': 1.0, 'tiron': 95,
  'cabeza-barra': -1.5, 'cabeza-barra-vida': -1.5, 'pie-deriva': 2.0,
  'pelota-cuerpo': -1.5, 'pelota-mano': -3.0, 'pelota-posada': 1.5,
  'rodilla-reves': 1.0, 'rodilla-reves-vida': 1.0, 'lado': 1.5, 'pico': 0,
  'dobla-clavado': 6, 'dobla-rep-libre': 30, 'dobla-rep-viaja': 20, 'dobla-rep': 45, 'enlace': 1.5,
  'mano-gira': 21, 'mano-gira-rep': 45
};
/* lo que se sale: [{ que, v, donde }] */
function juzga(m, v) {
  const mal = [], R = Object.assign({}, m, v || {});
  for (const c in LIMITES) {
    if (!(c in R)) continue;
    const x = R[c][0], lim = LIMITES[c];
    const fuera = c === 'apoyada' ? Math.abs(x) > lim : lim < 0 ? x < lim : x > lim;
    if (fuera) mal.push({ que: c, v: x, donde: R[c][1] });
  }
  (R.huecos || []).forEach(h => mal.push({ que: 'hueco', v: 0, donde: h }));
  if (R.error) mal.push({ que: 'error', v: 0, donde: R.error });
  return mal;
}
const NOMBRE = {
  'zapa-suelo': 'una zapatilla, bajo el suelo', 'zapa-pared': 'una zapatilla, dentro de la pared', 'mano-suelo': 'una mano, bajo el suelo', 'mano-pared': 'una mano, dentro de la pared',
  'cuerpo-suelo': 'un brazo o una pierna, bajo el suelo', 'cuerpo-pared': 'un brazo o una pierna, dentro de la pared', 'tronco-suelo': 'el tronco, bajo el suelo', 'tronco-pared': 'el tronco, dentro de la pared',
  'cabeza-suelo': 'la cabeza, bajo el suelo', 'cabeza-pared': 'la cabeza, dentro de la pared', 'apoyada': 'la mano apoyada no toca (o se hunde)', 'mano-muslo': 'una mano, dentro de un muslo (de paso)',
  'mano-muslo-quieta': 'una mano, dentro de un muslo (quieta)', 'mano-muslo-vida': 'una mano, dentro de un muslo (en el vídeo, de paso)', 'mano-muslo-quieta-vida': 'una mano, dentro de un muslo (en el vídeo, quieta)',
  'tiron': 'la mano da un tirón (cm/s)', 'hueco': 'una mano abierta, cerca de una superficie y sin tocarla', 'error': 'no se pudo medir',
  'cabeza-barra': 'una barra, un tubo o un cable del material, dentro de la cabeza', 'cabeza-barra-vida': 'una barra, un tubo o un cable del material, dentro de la cabeza (en el vídeo)',
  'pie-deriva': 'un pie que no se mueve, se va por el camino (hay que clavarlo)',
  'pelota-cuerpo': 'el cuerpo, dentro de una pelota', 'pelota-mano': 'una mano, dentro de una pelota', 'pelota-posada': 'el fitball, en el aire: nada posado en él',
  'rodilla-reves': 'una rodilla dobla al revés (cm detrás de la línea de la pierna)', 'rodilla-reves-vida': 'una rodilla dobla al revés (en el vídeo)',
  'lado': 'una rodilla o un codo cambian de lado de golpe (cm en un cuadro)', 'pico': 'algo cambia de sitio de golpe (cm de más en un cuadro)',
  'dobla-clavado': 'lo clavado que va recto en las dos puntas se dobla de paso (grados)', 'dobla-rep-libre': 'en la repetición, lo que va recto en las dos puntas se dobla de paso (grados)',
  'dobla-rep-viaja': 'en la repetición, el pie o la mano clavados que viajan con el miembro recto en las dos puntas lo doblan de paso (grados)',
  'dobla-rep': 'en la repetición, una rodilla o un codo se doblan de paso mucho más que en sus dos puntas (grados): falta una postura',
  'enlace': 'un tramo no acaba donde empieza lo siguiente (cm): da un tirón',
  'mano-gira': 'una mano gira de golpe (grados en un cuadro, en el vídeo)', 'mano-gira-rep': 'en la repetición, una mano da un giro que el Director tiene que frenar (grados)'
};
module.exports = { carga, mide, video, juzga, cabezaBarra, pintado, enPelota, ctxDe, director, tramosDe, quietasDe, LIMITES, NOMBRE };

if (require.main === module) {
  const T = carga(), ES = JSON.parse(fs.readFileSync(path.join(RAIZ, 'datos', 'cuerpo', 'ejercicios-es.json'), 'utf8'));
  const pedidos = process.argv.slice(2), ids = pedidos.length ? pedidos : Object.keys(T.COREO);
  let malos = 0;
  for (const id of ids) {
    if (!T.COREO[id]) { console.log(id + ': no tiene coreografía'); malos++; continue; }
    let m, v;
    try { m = mide(T, id); v = video(T, id, (ES[id] || ['', []])[1]); } catch (e) { console.log(id + ': ERROR ' + e.message); malos++; continue; }
    const mal = juzga(m, v);
    if (pedidos.length) {
      console.log(id);
      Object.keys(LIMITES).forEach(c => { const x = (c in m ? m : v)[c]; if (x && x[0] > -1e8 && x[0] < 1e8) console.log('   ' + c.padEnd(24) + String(x[0]).padStart(7) + '   ' + x[1] + (mal.some(q => q.que === c) ? '      ← FUERA (límite ' + LIMITES[c] + ')' : '')); });
      (m.huecos || []).forEach(h => console.log('   hueco: ' + h));
    } else if (mal.length) console.log(id + ': ' + mal.map(q => NOMBRE[q.que] + (q.v ? ' ' + q.v : '') + ' (' + q.donde + ')').join(' · '));
    if (mal.length) malos++;
  }
  if (!pedidos.length) console.log(malos ? malos + ' ejercicios con algo fuera de los límites' : 'los ' + ids.length + ' ejercicios, dentro de los límites');
  process.exit(malos ? 1 : 0);
}
