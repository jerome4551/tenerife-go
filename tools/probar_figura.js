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
//
// Desde el 6 de noviembre de 2026 (el bloque 1 del rediseño): cada dibujo de «Músculos» se hace
// tambien con «cara», la cabeza de la persona encima del maniqui; y se miran los niveles (tres
// tonos que no se confunden), el ambiente (TG_FIGURA.AMB), la cabeza y la cinturilla recta.
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
for (const a of casos) for (const vista of ['frente', 'espalda']) for (const modo of ['aspecto', 'musculos']) for (const cara of (modo === 'musculos' ? [false, true] : [false])) {
  const s = T.svg({ vista, modo, cara, aspecto: a, id: 'x', niveles: { pecho: 3, core: 1 }, sel: modo === 'musculos' ? 'pecho' : null, etiqueta: 'Su "personaje" <prueba>' });
  n++;
  if (/NaN|undefined|Infinity/.test(s)) { prueba('sin NaN ' + JSON.stringify(a) + vista + modo + (cara ? ' con cara' : ''), false); continue; }
  const ids = [...s.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
  if (new Set(ids).size !== ids.length) prueba('ids únicos ' + vista + modo + (cara ? ' con cara' : ''), false, ids.join(','));
  const nums = [...s.matchAll(/\sd="([^"]+)"/g)].flatMap(m => m[1].split(/[MCLQZ ,]+/).filter(Boolean).map(Number));
  const fuera = nums.filter(v => !(v > -20 && v < 820));
  if (fuera.length) prueba('dentro del lienzo ' + JSON.stringify(a) + vista + modo + (cara ? ' con cara' : ''), false, fuera.slice(0, 5).join(','));
  if (!s.includes('aria-label="Su &quot;personaje&quot; &lt;prueba&gt;"')) prueba('etiqueta escapada', false);
}
prueba(`${n} dibujos generados`, n > 600, String(n));

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
// (6-11-2026) los niveles: tres tonos que no se confunden. La claridad (OKLab) sube en cada nivel y la
// distancia entre vecinos es de 0,15 o mas (los tres oros de antes se quedaban en 0,144 y 0,146)
{
  const lin = c => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const lab = h => {
    const [r, g, b] = [1, 3, 5].map(i => lin(parseInt(h.slice(i, i + 2), 16)));
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b), m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b), s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    return [0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s, 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s];
  };
  const dist = (a, b) => Math.hypot(...lab(a).map((v, i) => v - lab(b)[i]));
  const N = T.MUSC.nivel;
  prueba('niveles: cuatro, y la claridad sube en cada uno', N.length === 4 && [0, 1, 2].every(i => lab(N[i + 1])[0] > lab(N[i])[0] + 0.08), N.map(c => lab(c)[0].toFixed(2)).join(' · '));
  prueba('niveles: los vecinos no se confunden (OKLab, 0,15 o más)', dist(N[1], N[2]) >= 0.15 && dist(N[2], N[3]) >= 0.15, dist(N[1], N[2]).toFixed(3) + ' · ' + dist(N[2], N[3]).toFixed(3));
  prueba('niveles: cada uno con su luz y su sombra', Array.isArray(T.LUZ) && T.LUZ.length === 4 && T.LUZ.every(l => l.length === 4));
}
// (6-11-2026) el ambiente (la luz de detras, el brillo y la sombra del suelo) esta en TG_FIGURA.AMB:
// el dibujo lo usa en los dos modos, se puede cambiar (para un tema claro) y, al devolverlo, vuelve
if (!T.AMB) prueba('ambiente: TG_FIGURA.AMB existe', false);
else {
  const A = T.AMB, antes = Object.assign({}, A);
  const dib = modo => T.svg({ vista: 'frente', modo, aspecto: base, id: 'm', niveles: { pecho: 3 } });
  const trozo = (c, o) => 'fill="' + c + '" opacity="' + o + '"';
  const m0 = dib('musculos'), p0 = dib('aspecto');
  prueba('ambiente: el de hoy, en «Músculos» y en el personaje', m0.includes(trozo(A.halo, A.haloOp)) && m0.includes(trozo(A.suelo, A.sueloOp)) && m0.includes(trozo(A.brillo, A.brilloOp)) && p0.includes(trozo(A.halo, A.haloOp)) && p0.includes(trozo(A.suelo, A.sueloOp)));
  Object.assign(A, { halo: '#FFFFFF', haloOp: 0.6, suelo: '#4A2C12', sueloOp: 0.3 });
  const m1 = dib('musculos'), p1 = dib('aspecto');
  prueba('ambiente: al cambiarlo, cambian los dos dibujos', [m1, p1].every(x => x.includes(trozo('#FFFFFF', 0.6)) && x.includes(trozo('#4A2C12', 0.3))) && m1 !== m0 && p1 !== p0);
  Object.assign(A, antes);
  prueba('ambiente: al devolverlo, los dibujos de antes', dib('musculos') === m0 && dib('aspecto') === p0);
}
// (6-11-2026) «cara»: en «Músculos», la cabeza de la persona encima del maniqui
{
  const a = Object.assign({}, base, { gafas: 'gafas', audifono: 'ambos', barba: 'corta' });
  const con = v => T.svg({ vista: v, modo: 'musculos', aspecto: a, id: 'c', cara: true, niveles: { pecho: 3 } });
  const sin = v => T.svg({ vista: v, modo: 'musculos', aspecto: a, id: 'c', niveles: { pecho: 3 } });
  const cuenta = (s, re) => (s.match(re) || []).length;
  for (const v of ['frente', 'espalda']) {
    const c = con(v), z = sin(v);
    prueba(`cara: una cabeza, encima de todo y sin toques (${v})`, cuenta(c, /<g class="tgf-cabeza" pointer-events="none">/g) === 1 && c.lastIndexOf('class="tgf-cabeza"') > c.lastIndexOf('class="tgf-z"'));
    prueba(`cara: sin «cara», el maniquí de siempre (${v})`, cuenta(z, /tgf-cabeza/g) === 0);
    prueba(`cara: las mismas zonas, con y sin (${v})`, cuenta(c, /class="tgf-z"/g) === cuenta(z, /class="tgf-z"/g) && cuenta(c, /class="tgf-z"/g) > 20, String(cuenta(c, /class="tgf-z"/g)));
    prueba(`cara: los dos audífonos (${v})`, cuenta(c, /<g fill="#C9CED6">/g) === 2);
  }
  prueba('cara: de frente, los ojos; de espaldas, no', cuenta(con('frente'), /#FBF8F3/g) === 2 && cuenta(con('espalda'), /#FBF8F3/g) === 0);
  const opc = { vista: 'frente', modo: 'aspecto', aspecto: a, id: 'c' };
  prueba('cara: en «Aspecto» no cambia nada', T.svg(Object.assign({ cara: true }, opc)) === T.svg(opc));
  // el pelo largo: entero hasta el menton y al 30 % por debajo, para no tapar el cuello ni la espalda alta
  const largo = T.svg({ vista: 'espalda', modo: 'musculos', aspecto: Object.assign({}, base, { pelo: 'largo' }), id: 'c', cara: true });
  prueba('cara: el pelo, entero hasta el mentón y al 30 % por debajo', /<g clip-path="url\(#c-pelo-a\)">/.test(largo) && /<g clip-path="url\(#c-pelo-b\)" opacity="0\.3">/.test(largo));
  // con gorra o pañuelo, sin pelo suelto y con su tela
  const gorra = T.svg({ vista: 'frente', modo: 'musculos', aspecto: Object.assign({}, base, { pelo: 'largo', cabeza: 'gorra' }), id: 'c', cara: true });
  prueba('cara: con gorra, la gorra y ningún pelo suelto', gorra.includes('url(#c-cabezac)') && !gorra.includes('c-pelo-a'));
}
// (6-11-2026) la cinturilla del pantalon es recta: cuatro puntos, sin curvas (abombada, asomaba por los
// lados de la camiseta). En las seis siluetas y con cada prenda de abajo
{
  let rectas = 0, vistas = 0; const malas = [];
  for (const fig of ['a', 'b']) for (const comp of [0, 1, 2]) for (const abajo of T.OPC.abajo) {
    const s = T.svg({ vista: 'frente', modo: 'aspecto', aspecto: Object.assign({}, base, { fig, comp, abajo }), id: 'w' });
    const c = [...s.matchAll(/<path d="([^"]+)" fill="#[0-9a-fA-F]{6}" opacity="0\.8"\/>/g)].map(m => m[1]);
    vistas++;
    if (c.length === 1 && /^M[\d.]+ [\d.]+(L[\d.]+ [\d.]+){3}Z$/.test(c[0])) rectas++; else malas.push(fig + comp + ' ' + abajo + ': ' + c.join(' | '));
  }
  prueba(`la cinturilla, recta en las ${vistas} combinaciones`, vistas >= 24 && rectas === vistas, malas.slice(0, 3).join(' ; '));
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
