#!/usr/bin/env node
/* El camino de una postura a otra, sin navegador: recorre cada tramo de la repetición y de las secuencias de un ejercicio con el
   Director de verdad (lo clavado, en su sitio) y dice dónde una zapatilla baja del suelo, y cuánto.
   Las posturas clave las mira la auditoría; lo que pasa ENTRE dos, no. Un pie clavado va en línea recta de un tobillo al otro: si
   entre tanto gira (de plano a de puntillas, o media vuelta sobre el sitio), corta por debajo del suelo; y un pie suelto que cruza
   con la punta caída, lo roza. Se arregla con una postura intermedia (el pie a medio rodar sobre la punta, o en el aire).

     node tools/entrenador/pruebas/camino.js <id> [<id>…]         de cada ejercicio, lo más hundido y el pie clavado más despegado
     TODO=1 node tools/entrenador/pruebas/camino.js <id> [<id>…]  cada tramo en que una zapatilla baja más de 0,8 cm, y cuánto

   El suelo es y = 0: en un escalón o en un bloque las cifras salen sobre el suelo, no sobre lo que se pisa.

   Desde el 16 de noviembre de 2026 esto mismo, y lo demás que se toca (las manos, las paredes, los muslos), lo mide
   pruebas/contactos.js con el dibujo entero, y lo pasa la auditoría. Esto queda para mirar un pie tramo a tramo. */
const nodo = () => ({ style: {}, childNodes: [], setAttribute() {}, getAttribute() { return ''; }, appendChild(c) { return c; }, insertBefore(c) { return c; }, removeChild() {}, get firstChild() { return null; } });
const caja = { window: {}, document: { createElementNS: nodo, createElement: nodo }, Math, Object, Array, JSON, String, Number, RegExp, Error, console: { log() {} } };
const T = require('./motor.js').carga(caja)._, C = T.COREO, r1 = x => Math.round(x * 10) / 10;
const clavo = s => { const m = /^([mt][id])(?:@(\d+):(-?[\d.]+))?(?:=(-?[\d.]+),(-?[\d.]+),(-?[\d.]+))?$/.exec(s); return m ? { que: m[1], mat: m[2] == null ? null : Number(m[2]), x: Number(m[3] || 0), en: m[4] == null ? null : [Number(m[4]), Number(m[5]), Number(m[6])] } : null; };
function recorre(id) {
  const co = C[id]; if (!co) { console.log(id + ': no tiene coreografía'); return; }
  const esc = { material: (co.material || []).map(q => { try { return new T.MATERIAL[q[0]]({ defs: nodo() }, q[1] || {}); } catch (e) { return {}; } }), poner() {}, detras: nodo(), encima: nodo(), cam: new T.Camara() };
  const d = new T.Director(esc); d.co = co; d.K = {}; for (const n in co.posturas) d.K[n] = T.resolver(co.posturas[n]);
  const base = (co.clavos || []).map(clavo); d.clavos = base;
  const tramos = []; let de = co.inicio || 'a';
  for (const s of co.rep || []) { tramos.push(['rep', de, s]); de = s[0]; }
  (co.pasos || []).forEach((p, i) => { if (p && p.sec) { let q = p.desde || co.inicio || 'a'; for (const s of p.sec) { tramos.push(['paso ' + (i + 1), q, s]); q = s[0]; } } });
  let bajo = [1e9, ''], alto = [-1e9, '']; const malos = {};
  for (const [donde, a, s] of tramos) {
    const A = d.K[a], B = d.K[s[0]], cl = s[3] ? s[3].map(clavo) : base, curva = T.CURVA[s[2] || (a === s[0] ? 'lineal' : 'suave')] || T.CURVA.suave;
    for (let q = 0; q <= 24; q++) {
      const e = curva(q / 24); let E = a === s[0] ? A : T.mezclar(A, B, e);
      d.metas = []; E = d.clavar(E, A, B, e, cl);
      for (const k of ['i', 'd']) {
        const z = T.bajoZapa(E[k], k), sitio = donde + ' ' + a + '→' + s[0] + ' t=' + r1(q / 24) + ' pie ' + k;
        if (z < bajo[0]) bajo = [z, sitio];
        if (z < -0.8) { const c = a + '→' + s[0] + ' ' + k; if (!(malos[c] < z)) malos[c] = z; }
        if (cl.some(c => c && c.que === 't' + k) && z > alto[0]) alto = [z, sitio];
      }
    }
  }
  if (process.env.TODO) { if (Object.keys(malos).length) console.log(id + ': ' + Object.keys(malos).map(c => c + ' ' + r1(malos[c])).join(' · ')); return; }
  console.log(id.padEnd(40) + ' lo más hundido ' + r1(bajo[0]).toFixed(1).padStart(5) + ' (' + bajo[1] + ') · el pie clavado más despegado ' + (alto[0] < -1e8 ? '—' : r1(alto[0]).toFixed(1) + ' (' + alto[1] + ')'));
}
const ids = process.argv.slice(2);
if (!ids.length) { console.log('uso: node tools/entrenador/pruebas/camino.js <id> [<id>…]   (con TODO=1, cada tramo en que una zapatilla baja más de 0,8 cm)'); process.exit(1); }
for (const id of ids) { try { recorre(id); } catch (e) { console.log(id + ': ERROR ' + e.message); } }
