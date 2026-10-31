#!/usr/bin/env node
// probar_figura.js — el dibujo de «Su cuerpo»: cada opción del aspecto, en las dos vistas y los dos
// modos, da un SVG sano (sin NaN, sin undefined, con ids únicos, dentro del lienzo) y la validación
// de lo guardado aguanta.
//
//     node tools/probar_figura.js
//
// La prueba de la entrega del cuerpo (24 de octubre de 2026, 45 pruebas), tal cual, salvo de donde
// lee el dibujo: alli, de figura.js, figura-aspecto.js y figura-svg.js; aqui, del trozo de
// modulos/cuerpo.js que los lleva (construir.py los pega uno detras de otro, entre la tabla de
// textos y la pantalla). Se ejecuta sin navegador, en un contexto aparte. 31 de octubre de 2026.
const fs = require('fs'), path = require('path'), vm = require('vm');
const ctx = {}; vm.createContext(ctx);
const MODULO = fs.readFileSync(path.join(__dirname, '..', 'modulos', 'cuerpo.js'), 'utf8');
const INI = MODULO.indexOf('/* figura.js —'), FIN = MODULO.indexOf('/* ── la pantalla «Su cuerpo» ── */');
if (INI < 0 || FIN < INI) { console.error('no encuentro el dibujo dentro de modulos/cuerpo.js'); process.exit(2); }
vm.runInContext(MODULO.slice(INI, FIN), ctx);
const T = ctx.TG_FIGURA, G = ctx.TG_FIGURA_GEO;
let ok = 0, mal = 0;
function prueba(n, c, x) { if (c) ok++; else { mal++; console.log('MAL  ' + n + (x ? '  ' + x : '')); } }

const base = T.normaliza(null);
const casos = [];
for (const k of Object.keys(T.OPC)) for (const v of T.OPC[k]) casos.push(Object.assign({}, base, { [k]: v }));
for (const k of ['piel', 'peloColor', 'arribaColor', 'abajoColor', 'calzadoColor']) {
  const n = { piel: T.PIEL, peloColor: T.PELO_COLOR }[k] || T.ROPA_COLOR;
  for (let i = 0; i < n.length; i++) casos.push(Object.assign({}, base, { [k]: i }));
}
// combinaciones cruzadas que tocan las mismas piezas
for (const fig of ['a', 'b']) for (const comp of [0, 1, 2]) for (const pro of T.OPC.protesis) for (const arriba of T.OPC.arriba)
  casos.push(Object.assign({}, base, { fig, comp, protesis: pro, arriba, abajo: arriba === 'top' ? 'mallas' : 'largo', calzado: 'botas' }));
for (const pelo of T.OPC.pelo) for (const cabeza of T.OPC.cabeza) casos.push(Object.assign({}, base, { pelo, cabeza, barba: 'larga', gafas: 'sol', audifono: 'ambos' }));

let n = 0;
for (const a of casos) for (const vista of ['frente', 'espalda']) for (const modo of ['aspecto', 'musculos']) {
  const s = T.svg({ vista, modo, aspecto: a, id: 'x', niveles: { pecho: 3, core: 1 }, sel: modo === 'musculos' ? 'pecho' : null, etiqueta: 'Su "personaje" <prueba>' });
  n++;
  if (/NaN|undefined|Infinity/.test(s)) { prueba('sin NaN ' + JSON.stringify(a) + vista + modo, false); continue; }
  const ids = [...s.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
  if (new Set(ids).size !== ids.length) prueba('ids únicos ' + vista + modo, false, ids.join(','));
  const nums = [...s.matchAll(/\sd="([^"]+)"/g)].flatMap(m => m[1].split(/[MCLQZ ,]+/).filter(Boolean).map(Number));
  const fuera = nums.filter(v => !(v > -20 && v < 820));
  if (fuera.length) prueba('dentro del lienzo ' + JSON.stringify(a) + vista + modo, false, fuera.slice(0, 5).join(','));
  if (!s.includes('aria-label="Su &quot;personaje&quot; &lt;prueba&gt;"')) prueba('etiqueta escapada', false);
}
prueba(`${n} dibujos generados`, n > 400, String(n));

// los músculos: los 12 grupos y los ~35 músculos, en las seis siluetas, cada uno con su grupo
prueba('GRUPOS: los 12 de siempre', JSON.stringify(T.GRUPOS) === JSON.stringify(['pecho', 'dorsal', 'espalda_alta', 'hombros', 'biceps', 'triceps', 'antebrazo', 'core', 'gluteos', 'cuadriceps', 'isquios', 'pantorrilla']));
prueba('MUSCULOS: entre 25 y 40, sin repetir', T.MUSCULOS.length >= 25 && T.MUSCULOS.length <= 40 && new Set(T.MUSCULOS.map(m => m.id)).size === T.MUSCULOS.length, String(T.MUSCULOS.length));
prueba('MUSCULOS: cada uno en un grupo conocido', T.MUSCULOS.every(m => T.GRUPOS.includes(m.g)));
for (const pequeno of ['manguito', 'serrato', 'romboides', 'redondo_mayor', 'braquial', 'braquiorradial', 'sartorio', 'tibial_anterior', 'peroneos', 'gluteo_medio'])
  prueba('músculo pequeño dibujado: ' + pequeno, T.MUSCULOS.some(m => m.id === pequeno));
for (const fig of ['a', 'b']) for (const comp of [0, 1, 2]) {
  const g = new Set(), m = new Set(), par = new Set();
  for (const v of ['frente', 'espalda']) {
    const s = T.svg({ vista: v, modo: 'musculos', aspecto: Object.assign({}, base, { fig, comp }), id: 'z' });
    for (const q of s.matchAll(/class="tgf-z" data-g="([a-z_]+)" data-m="([a-z_]+)"/g)) { g.add(q[1]); m.add(q[2]); par.add(q[2] + '>' + q[1]); }
  }
  prueba(`zonas de los 12 grupos (${fig}${comp})`, g.size === 12 && T.GRUPOS.every(x => g.has(x)), [...g].join(','));
  prueba(`todos los músculos dibujados (${fig}${comp})`, m.size === T.MUSCULOS.length, m.size + '/' + T.MUSCULOS.length);
  prueba(`cada músculo con un solo grupo (${fig}${comp})`, par.size === m.size);
}
// los niveles pintan por grupo: con el pecho al 3, todas las zonas del pecho llevan el degradado n3 y ninguna otra
{
  const s = T.svg({ vista: 'frente', modo: 'musculos', aspecto: base, id: 'n', niveles: { pecho: 3 } });
  const zs = [...s.matchAll(/<path d="[^"]+" class="tgf-z" data-g="([a-z_]+)" data-m="[a-z_]+" fill="url\(#n-n(\d)\)"/g)];
  prueba('niveles por grupo', zs.length > 20 && zs.every(z => (z[1] === 'pecho') === (z[2] === '3')), String(zs.length));
}
// prótesis: se quita la zona del lado que toca y no la del otro
for (const [pro, grupo] of [['pierna_izq', 'pantorrilla'], ['pierna_der', 'pantorrilla'], ['brazo_izq', 'antebrazo'], ['brazo_der', 'antebrazo']]) {
  const cuenta = a => (T.svg({ vista: 'frente', modo: 'musculos', aspecto: a, id: 'p' }).match(new RegExp('data-g="' + grupo + '"', 'g')) || []).length;
  const sin = cuenta(base), con = cuenta(Object.assign({}, base, { protesis: pro }));
  prueba('prótesis ' + pro + ' quita la mitad de las zonas de ' + grupo, con * 2 === sin, sin + '→' + con);
}
// el lado: «izquierda» de la persona va a la derecha del dibujo de frente y a la izquierda de espaldas
const xMedio = (s, re) => { const m = s.match(re); if (!m) return null; const xs = m[1].split(/[MCLZ ]+/).filter(Boolean).map(Number).filter((v, i) => i % 2 === 0); return xs.reduce((a, b) => a + b, 0) / xs.length; };
const reAud = /<g fill="#C9CED6"><path d="([^"]+)"\/>/;
const f1 = T.svg({ vista: 'frente', aspecto: Object.assign({}, base, { audifono: 'izq' }), id: 'a1' });
const e1 = T.svg({ vista: 'espalda', aspecto: Object.assign({}, base, { audifono: 'izq' }), id: 'a2' });
prueba('audífono izquierdo: a la derecha del dibujo de frente', xMedio(f1, reAud) > 200, String(xMedio(f1, reAud)));
prueba('audífono izquierdo: a la izquierda de espaldas', xMedio(e1, reAud) < 200, String(xMedio(e1, reAud)));
// la validación de lo guardado
const raro = T.normaliza({ fig: 'c', comp: 7, piel: -1, pelo: 'mohicano', peloColor: 1.5, barba: null, cabeza: {}, gafas: 'sol', arribaColor: '3', __proto__: { x: 1 } });
prueba('normaliza: lo malo vuelve a su valor de serie', raro.fig === 'a' && raro.comp === 1 && raro.piel === base.piel && raro.pelo === base.pelo && raro.peloColor === base.peloColor && raro.barba === 'no' && raro.cabeza === 'no' && raro.arribaColor === base.arribaColor, JSON.stringify(raro));
prueba('normaliza: lo bueno se queda', raro.gafas === 'sol');
prueba('normaliza: solo los campos conocidos', Object.keys(raro).sort().join() === Object.keys(base).sort().join());
prueba('normaliza: tono no realista (11)', T.normaliza({ piel: 10 }).piel === 10 && T.normaliza({ piel: 11 }).piel === base.piel);
// el id del recorte no admite nada raro
prueba('id saneado', !T.svg({ id: '"><script>' }).includes('<script>'));
prueba('viewBox saneado', T.svg({ viewBox: '0 0 400 800" onload="x' }).includes('viewBox="0 0 400 800"'));
console.log(`${ok} bien, ${mal} mal`);
process.exit(mal ? 1 : 0);
