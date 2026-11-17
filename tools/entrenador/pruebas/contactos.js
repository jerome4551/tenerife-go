#!/usr/bin/env node
/* Los contactos de cada coreografía, sin navegador: ¿pisa el suelo o lo atraviesa?, ¿la mano que se apoya en la pared la toca?,
   ¿se le mete una mano en un muslo? Con las medidas del dibujo (20-figura.js: zapaAPlano, manoAPlano, miembroAPlano, troncoAPlano,
   cabezaAPlano, manoEnMuslo: la distancia de lo que se pinta a un plano, o lo que una mano se mete en un muslo) y el Director de
   verdad (lo clavado, el rodeo de los muslos y lo apartado, en su sitio).

     node tools/entrenador/pruebas/contactos.js                 las 282, y lo que se sale de los límites (sale con 1 si hay algo)
     node tools/entrenador/pruebas/contactos.js <id> [<id>…]    de esos ejercicios, todas las medidas

   Dos pasadas:
   · mide(T, id): cada tramo de la repetición y de las secuencias, en 25 instantes, y cada postura que se mantiene. De cada cosa
     (zapatilla, mano, antebrazo, brazo, muslo, pierna, tronco, cabeza) lo más hundido en el suelo y en cada pared (0, toca; negativo,
     dentro); de cada mano, lo más que se mete en un muslo (positivo, dentro), en movimiento y quieta; de la mano que se apoya (la que
     la coreografía pone de plano contra algo: m: { palma, dedos }), a cuánto queda de su suelo, su pared o su banco; y las manos
     abiertas que en una postura mantenida miran de cerca a una pared o al suelo sin tocarlos.
   · video(T, id, pasos): el vídeo como se ve, cuadro a cuadro (30 por segundo), con la vida (respira, se balancea, llega por
     partes): lo que una mano se mete en un muslo, quieto y en cualquier cuadro, y lo que cambia de un cuadro al siguiente lo que el
     Director la aparta (no puede dar tirones).
   juzga(m, v) dice qué se sale de LIMITES. Lo usa tools/auditar_entrenador.js (sección 1).

   El suelo es y = 0; las paredes, las del material ('pared'); los bancos planos, su tapa. Lo demás (un escalón, un cajón, la silla)
   no se mide aquí. */
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
/* un Director de verdad sobre un escenario de mentira (no pinta) */
function director(T, co) {
  const esc = { material: (co.material || []).map(q => { try { return new T.MATERIAL[q[0]]({ defs: nodo() }, q[1] || {}); } catch (e) { return { colocar() {} }; } }), poner() {}, detras: nodo(), encima: nodo(), cam: new T.Camara(),
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
  const uno = (E, donde, quieta, nombre) => {
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
  for (const [s, et, curva] of tramosDe(T, co)) {
    if (!d.K[s.de] || !d.K[s.a]) { R.error = 'postura que no existe: ' + s.de + ' o ' + s.a; continue; }
    for (let q = 0; q <= 24; q++) { d.metas = []; uno(d.enTramo(s, curva(q / 24)), et + ':' + r1(q / 24) + ' (' + s.de + '→' + s.a + ')', (q === 24 || q === 0) && s.de === s.a, s.a); }
  }
  for (const n of quietasDe(co)) { if (!d.K[n]) continue; d.metas = []; uno(d.enTramo({ de: n, a: n, clavos: d.suelto(n) ? [] : (co.clavosEn && co.clavosEn[n]) || undefined }, 1), 'postura ' + n, true, n); }
  R.huecos = Object.keys(huecos).map(c => c + ' a ' + huecos[c] + ' cm');
  return R;
}

/* el vídeo como se ve: cada paso de la ficha, lo que dura su texto, con el Director entero (la vida, lo clavado, el rodeo, lo
   apartado y su deslizar). pasos: los de la ficha en castellano (para lo que dura cada uno) */
function video(T, id, pasos, fps) {
  const co = T.COREO[id], d = director(T, co), DT = 1 / (fps || 30), R = { 'mano-muslo-vida': [-1e9, ''], 'mano-muslo-quieta-vida': [-1e9, ''], tiron: [0, ''], cuadros: 0 };
  const lar = v => Math.sqrt(dot(v, v));
  let ult = null; const suave0 = d.suave;
  d.suave = function (E0, E1, dt, cl) { const E = suave0.call(this, E0, E1, dt, cl); ult = { E0, E }; return E; };
  (co.pasos || ['a']).forEach((a, i, L) => {
    if (a === 'nota') return;
    const dur = Math.max(4.4, 1.9 + ((pasos && pasos[i]) || '').length * 0.058), deCerca = i === 0 || L[i - 1] === 'nota';
    /* como el reproductor (80-reproductor.js) */
    if (a === 'rep' || (a && a.rep != null)) { if (deCerca) { d.aPostura(d.inicio, 0); d.cuadro(0.001, true); } if (d.modo !== 'rep') { d.aRep(deCerca ? 0 : 0.6); if (a.rep != null) d.tau = a.rep; } }
    else if (a && a.sec) { if (deCerca || !d.E) { d.aPostura(a.desde || d.inicio, 0); d.cuadro(0.001, true); } d.aSecuencia(a.sec, a.desde); }
    else d.aPostura(typeof a === 'string' ? a : d.inicio, deCerca ? 0 : 0.7);
    let ant = null;
    for (let n = 0, N = Math.round(dur / DT); n < N; n++) {
      d.cuadro(DT, false); R.cuadros++;
      const donde = 'paso ' + (i + 1) + ', ' + (n * DT).toFixed(2) + ' s' + (d.modo === 'postura' ? ' (postura ' + d.meta + ')' : d.modo === 'sec' ? ' (' + d.secDe + '→' + d.secA + ')' : ' (repetición)'), quieto = d.modo === 'postura' && d.w >= 1, ap = {};
      for (const k of ['i', 'd']) {
        ap[k] = sub(ult.E[k].mun, ult.E0[k].mun);
        if (ant) { const s = lar(sub(ap[k], ant[k])) / DT; if (s > R.tiron[0]) R.tiron = [r1(s), 'mano ' + k + ' · ' + donde]; }
        for (const m of ['i', 'd']) { const z = T.manoEnMuslo(ult.E, k, m); if (z > R['mano-muslo-vida'][0]) R['mano-muslo-vida'] = [r1(z), 'mano ' + k + ' en el muslo ' + m + ' · ' + donde]; if (quieto && z > R['mano-muslo-quieta-vida'][0]) R['mano-muslo-quieta-vida'] = [r1(z), 'mano ' + k + ' en el muslo ' + m + ' · ' + donde]; }
      }
      ant = ap;
    }
  });
  return R;
}

/* los límites (cm). Lo que se apoya, toca: una zapatilla o una mano no se hunden más de 1 cm en el suelo ni en una pared, y la mano
   que la coreografía apoya de plano queda a menos de 1 cm de su superficie. El cuerpo es blando y se dibuja con volumen: tumbado, el
   tronco y la cabeza (con su tupé) se asientan unos 3,4 cm, y una rodilla o un codo apoyados, hasta 2,2. La mano no se mete en un
   muslo más de 1 cm quieta, ni más de 2 de paso. Y lo que el Director aparta una mano no cambia más deprisa de 95 cm/s (su tope
   son 90: 60-director.js, VAP) */
const LIMITES = {
  'zapa-suelo': -1.0, 'zapa-pared': -1.0, 'mano-suelo': -1.0, 'mano-pared': -1.0,
  'cuerpo-suelo': -2.5, 'cuerpo-pared': -2.5, 'tronco-suelo': -4.0, 'tronco-pared': -3.0, 'cabeza-suelo': -4.0, 'cabeza-pared': -3.5,
  'apoyada': 1.0, 'mano-muslo': 2.0, 'mano-muslo-quieta': 1.0, 'mano-muslo-vida': 3.0, 'mano-muslo-quieta-vida': 1.0, 'tiron': 95
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
  'tiron': 'la mano da un tirón (cm/s)', 'hueco': 'una mano abierta, cerca de una superficie y sin tocarla', 'error': 'no se pudo medir'
};
module.exports = { carga, mide, video, juzga, LIMITES, NOMBRE };

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
