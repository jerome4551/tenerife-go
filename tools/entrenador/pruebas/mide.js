#!/usr/bin/env node
/* Mide las posturas clave de un ejercicio, sin navegador y con lo clavado en su sitio (las manos en su agarre, como en
   el vídeo): dónde quedan la cadera, la barbilla, el pecho, los hombros, los codos, los puños, las rodillas y los pies;
   cuánto se doblan el codo y la rodilla; hacia dónde mira la palma y a lo largo de qué va el puño. Para escribir una
   coreografía con números y no a ojo («la barbilla, a la altura de la barra»; «las palmas, enfrentadas»).

     node tools/entrenador/pruebas/mide.js <id>                        todas sus posturas
     node tools/entrenador/pruebas/mide.js <id> a,b                    solo esas
     node tools/entrenador/pruebas/mide.js <id> a,b agarre,codo,palma  solo los campos que empiecen así

   Avisa si a una mano le falta alcance para llegar a su agarre (el vídeo arrimaría el cuerpo, hasta 3 cm). */
const vm = require('vm'), fs = require('fs'), path = require('path');
const RAIZ = path.resolve(__dirname, '..', '..', '..');
const caja = { window: {}, document: {}, Math, Object, Array, JSON, String, Number, RegExp, Error, console: { log() {} } };
vm.runInNewContext(fs.readFileSync(path.join(RAIZ, 'modulos', 'entrenador.js'), 'utf8'), caja, { filename: 'modulos/entrenador.js' });
const T = caja.window.TG_ENTRENADOR._, id = process.argv[2], co = T.COREO[id];
if (!co) { console.error(id ? 'no hay coreografía de «' + id + '»' : 'uso: node tools/entrenador/pruebas/mide.js <id> [posturas] [campos]'); process.exit(1); }
const r1 = v => v.map(x => Math.round(x * 10) / 10), dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const angulo = (a, b, c) => { const u = [a[0] - b[0], a[1] - b[1], a[2] - b[2]], w = [c[0] - b[0], c[1] - b[1], c[2] - b[2]]; return Math.round(Math.acos(Math.max(-1, Math.min(1, (u[0] * w[0] + u[1] * w[1] + u[2] * w[2]) / (Math.hypot(...u) * Math.hypot(...w))))) * 180 / Math.PI); };
/* el material, sin escena: solo hace falta el que tiene agarres fijos (la barra de dominadas, las paralelas) */
const nodo = () => ({ style: {}, setAttribute() {}, getAttribute() {}, appendChild(c) { return c; }, insertBefore(c) { return c; } });
caja.document.createElementNS = caja.document.createElement = nodo;
const mats = (co.material || []).map(q => { try { return new T.MATERIAL[q[0]]({ defs: nodo() }, q[1] || {}); } catch (e) { return {}; } });
const CLAVO = /^([mt][id])(?:@(\d+):(-?[\d.]+))?(?:=(-?[\d.]+),(-?[\d.]+),(-?[\d.]+))?$/;
const BRAZO = T.D.brazo + T.D.antebrazo + T.D.mano;
function clavada(n) {
  let E = T.resolver(co.posturas[n]), falta = 0;
  if ((co.sinClavos || []).indexOf(n) >= 0) return { E, falta };
  const clavos = (co.clavos || []).map(s => CLAVO.exec(s)).filter(Boolean);
  const S = { p: E.S.p, B: E.S.B, col: E.S.col, cab: E.S.cab, hom: E.S.hom, b: { i: E.S.b.i, d: E.S.b.d }, q: { i: E.S.q.i, d: E.S.q.d }, m: E.S.m, t: E.S.t };
  /* dos pasadas, como el director: la muñeca se calcula con el codo de antes y se afina con el codo ya en su sitio */
  for (let pasada = 0; pasada < 2; pasada++) {
    const E2 = { S, Bt: E.Bt, Bp: E.Bp, i: E.i, d: E.d };
    clavos.forEach(m => {
      const k = m[1].charAt(1), mano = m[1].charAt(0) === 'm', mat = m[2] != null ? mats[Number(m[2])] : null;
      let meta;
      if (!mano) meta = m[4] != null ? [Number(m[4]), Number(m[5]), Number(m[6])] : E[k].tob;
      else if (mat && mat.agarre) { const g = mat.agarre(Number(m[3] || 0)); falta = Math.max(falta, dist(g, E[k].hom) - BRAZO); meta = T.munecaPara(E, k, g); }
      else if (pasada) return; else meta = m[4] != null ? [Number(m[4]), Number(m[5]), Number(m[6])] : E[k].mun;
      T.clavar(E2, m[1], meta);
    });
    E = T.armar(S);
  }
  return { E, falta };
}
const cuales = process.argv[3] ? process.argv[3].split(',') : Object.keys(co.posturas), campos = process.argv[4] ? process.argv[4].split(',') : null;
cuales.forEach(n => {
  if (!co.posturas[n]) { console.log('── ' + n + ': no existe'); return; }
  const { E, falta } = clavada(n), o = { cadera: r1(E.pel), barbilla: r1(T.PUNTOS.barbilla(E)), pecho: r1(T.PUNTOS.pecho(E)) };
  ['i', 'd'].forEach(k => {
    const L = E[k];
    o['hombro_' + k] = r1(L.hom); o['codo_' + k] = r1(L.cod); o['agarre_' + k] = r1(L.agarre); o['codo°_' + k] = angulo(L.hom, L.cod, L.mun);
    o['palma_' + k] = r1(L.mano.palma); o['puño_' + k] = r1(L.mano.eje);
    o['rodilla_' + k] = r1(L.rod); o['tobillo_' + k] = r1(L.tob); o['rodilla°_' + k] = angulo(L.cad, L.rod, L.tob); o['punta_' + k] = r1(L.dedosPie);
  });
  console.log('── ' + n + (falta > 0.05 ? '   (a una mano le FALTAN ' + falta.toFixed(1) + ' cm para llegar a su agarre)' : ''));
  Object.keys(o).forEach(k => { if (!campos || campos.some(c => k.indexOf(c) === 0)) console.log('   ' + k.padEnd(12) + JSON.stringify(o[k])); });
});
