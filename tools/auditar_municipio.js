#!/usr/bin/env node
/* auditar_municipio.js — el municipio que dice la ficha contra el sitio donde cae.
 *
 * EL HUECO QUE TAPA
 *   charco-verde-realejos decia «Piscina Natural · Los Realejos» y el charco
 *   esta en La Guancha, a un municipio de distancia. Eso no lo caza ningun
 *   control de forma: la coordenada es valida, cae en tierra, esta dentro de
 *   Tenerife y tiene sus decimales. Lo unico que esta mal es que el texto
 *   nombra un sitio y el punto esta en otro, y eso solo se ve cruzando los
 *   dos datos.
 *
 * COMO SE COMPRUEBA, SIN PREGUNTAR A NADIE
 *   Las 2.514 paradas de TITSA del propio repositorio traen municipio. Se
 *   miran las de alrededor: si el municipio que dice la ficha no aparece en
 *   NINGUNA de ellas, el punto no esta donde el texto dice.
 *
 * DE DONDE SALE EL MUNICIPIO QUE DICE LA FICHA
 *   De DOS sitios, y de ninguno mas:
 *     · cualquier tramo de `cat` separado por « · », porque el municipio no
 *       siempre va al final: «Kayak Transparente · Radazul · Santa Cruz · SUP»
 *     · el parentesis del final del nombre: «... (Los Realejos)»
 *   No se busca suelto dentro del nombre, y por eso: el «Hospital
 *   Universitario Ntra. Sra. Candelaria» esta en Santa Cruz y se llama asi
 *   por la Virgen, y la «Asoc. San Miguel» es un santo antes que un
 *   municipio. Buscandolo suelto, esos tres salian como error y no lo son.
 *
 * Y SI LA FICHA SE CONTRADICE A SI MISMA
 *   Cuando el nombre dice un municipio y el cat dice otro, no hace falta ni
 *   mirar las paradas: uno de los dos esta mal. Se lista aparte.
 *
 * POR QUE ES GENEROSO A PROPOSITO
 *   Basta con que el municipio declarado salga en UNA de las paradas
 *   cercanas. En un borde municipal las paradas se mezclan, y un control que
 *   cante en cada borde se ignora a la semana. Lo que se busca es el error
 *   gordo: el que esta a un municipio entero de distancia.
 *
 * LO QUE NO PUEDE DECIR, Y LO DICE
 *   Donde no hay paradas -el Teide, Teno, Anaga profundo- no hay con que
 *   comparar. Esas fichas salen como SIN COMPROBAR, contadas y listadas. Un
 *   control que llama «verificado» a lo que no ha mirado es peor que no
 *   tenerlo.
 */
'use strict';
const { PLACES, CAT, km } = require('./cargar');

const norm = s => (s || '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

/* Como se nombra cada municipio en los textos, ademas de su nombre oficial.
   Sin esto, «Pto. Cruz» o «Realejos» no casan con nada y la ficha saldria
   como que no declara municipio, que es mentir por omision. */
const ALIAS = {
  'Adeje': ['Costa Adeje'],
  'Arona': ['Los Cristianos', 'Las Americas', 'Las Américas', 'Playa de las Américas', 'Valle San Lorenzo'],
  'Buenavista del Norte': ['Buenavista', 'Teno'],
  'Granadilla de Abona': ['Granadilla', 'El Medano', 'El Médano', 'Los Abrigos'],
  'Guía de Isora': ['Guia de Isora', 'Playa San Juan', 'Alcala', 'Alcalá'],
  'Icod de los Vinos': ['Icod'],
  'La Matanza de Acentejo': ['La Matanza'],
  'La Victoria de Acentejo': ['La Victoria'],
  'Los Realejos': ['Realejos'],
  'Puerto de la Cruz': ['Pto. Cruz', 'Pto Cruz', 'Puerto Cruz'],
  'San Cristóbal de La Laguna': ['La Laguna', 'Bajamar', 'Punta del Hidalgo', 'Tejina', 'Valle de Guerra'],
  /* «San Miguel» a secas NO: es un santo antes que un municipio, y salian
     como error una iglesia de La Laguna y otra de Santa Cruz. */
  'San Miguel de Abona': ['Golf del Sur', 'Amarilla Golf'],
  'Santa Cruz de Tenerife': ['Santa Cruz', 'San Andres', 'San Andrés', 'Taganana', 'Igueste'],
  'Santiago del Teide': ['Los Gigantes', 'Puerto Santiago', 'Masca', 'Tamaimo'],
  'Vilaflor': ['Vilaflor de Chasna'],
};

const MUNIS = [...new Set(Object.values(CAT).map(p => p.m))].sort();
/* Formas mas largas primero: «San Miguel de Abona» antes que «San Miguel»,
   para que no gane el trozo corto de otro municipio. */
const FORMAS = [];
for (const m of MUNIS) {
  FORMAS.push([norm(m), m]);
  for (const a of (ALIAS[m] || [])) FORMAS.push([norm(a), m]);
}
FORMAS.sort((a, b) => b[0].length - a[0].length);

/* Cuanta evidencia hace falta para OPINAR. Con una sola parada, o con la mas
   cercana a kilometros, la respuesta es «no se sabe», no «esta mal»: asi
   salian marcados el area de Las Raices -una parada a 2,9 km- y tres
   senderos de monte. Un control que opina sin datos se ignora a la semana. */
const RADIO = 1500;      // metros: mas alla, la parada ya no dice nada del sitio
const CUANTAS = 8;       // paradas que se miran
const MINIMO = 3;        // menos de estas alrededor: no se opina
/* Un hallazgo SUSPENDE solo si es firme: todas las paradas de alrededor del
   mismo municipio Y la mas cercana pegada. Un mirador en un puerto de
   montaña o un sendero que cruza dos terminos caen en el borde por
   definicion, y un control que cante en cada borde se ignora a la semana.
   Los del borde se listan igual: callarlos seria el fallo contrario. */
const PEGADA = 250;      // metros de la parada mas cercana para llamarlo firme

const paradas = Object.values(CAT);

function cerca(p) {
  return paradas
    .map(c => ({ m: c.m, n: c.n, d: km([p.lat, p.lng], [c.la, c.lo]) * 1000 }))
    .sort((a, b) => a.d - b.d)
    .slice(0, CUANTAS)
    .filter(x => x.d <= RADIO);
}

/* Todo lo que la ficha declara como municipio: cada tramo del cat y el
   parentesis del final del nombre. */
function declara(p) {
  const trozos = [];
  const cat = (p.cat && p.cat.es) || '';
  for (const t of cat.split(' · ')) trozos.push(['cat', norm(t.trim())]);
  const par = /\(([^()]+)\)\s*[^\p{L}]*$/u.exec(p.name || '');
  if (par) trozos.push(['nombre', norm(par[1].trim())]);
  const out = [];
  for (const [de, t] of trozos) {
    const hit = FORMAS.find(([forma]) => forma === t);
    if (hit && !out.some(x => x[1] === hit[1])) out.push([de, hit[1]]);
  }
  return out;
}

const sinDeclarar = [], sinComprobar = [], coinciden = [], mal = [], contra = [];
for (const p of PLACES) {
  const dichos = declara(p);
  if (!dichos.length) { sinDeclarar.push(p); continue; }
  if (dichos.length > 1) { contra.push([p, dichos]); continue; }
  const dice = dichos[0][1];
  const c = cerca(p);
  if (c.length < MINIMO) { sinComprobar.push([p, dice]); continue; }
  if (c.some(x => x.m === dice)) coinciden.push(p);
  else mal.push([p, dice, c]);
}

const P = (t, v) => console.log('  ' + String(t).padEnd(46, '.') + ' ' + v);
console.log('=== el municipio que dice la ficha, contra donde cae el punto ===');
P('lugares', PLACES.length);
P('  que nombran un municipio', PLACES.length - sinDeclarar.length);
P('  de esos, comprobados contra las paradas', coinciden.length + mal.length);
P('  y con menos de 3 paradas a 1,5 km: no se puede', sinComprobar.length);
P('no declaran municipio', sinDeclarar.length);
console.log('');
P('LA FICHA SE CONTRADICE A SI MISMA', contra.length);
for (const [p, d] of contra) {
  const c = cerca(p);
  console.log('      ' + p.id.padEnd(30) + d.map(x => x[0] + ' dice «' + x[1] + '»').join('  vs  '));
  console.log('      ' + ' '.repeat(30) + '  alrededor: ' +
    (c.length ? [...new Set(c.map(x => x.m))].join(', ') + '  ·  ' + c[0].n + ' a ' + Math.round(c[0].d) + ' m'
              : 'sin paradas suficientes'));
}
console.log('');
const firme = ([, , c]) => new Set(c.map(x => x.m)).size === 1 && c[0].d <= PEGADA;
const pinta = l => {
  for (const [p, dice, c] of l.sort((a, b) => a[0].id < b[0].id ? -1 : 1)) {
    const cuenta = {};
    c.forEach(x => cuenta[x.m] = (cuenta[x.m] || 0) + 1);
    const donde = Object.entries(cuenta).sort((a, b) => b[1] - a[1])
      .map(([m, n]) => m + ' x' + n).join(', ');
    console.log('      ' + p.id.padEnd(30) + 'dice «' + dice + '»  ·  alrededor: ' + donde);
    console.log('      ' + ' '.repeat(30) + '  ' + p.lat + ', ' + p.lng + '  ·  parada mas cerca: ' +
                c[0].n + ' (' + Math.round(c[0].d) + ' m)');
  }
};
const firmes = mal.filter(firme), borde = mal.filter(x => !firme(x));
P('EL MUNICIPIO NO CUADRA, y es firme', firmes.length);
pinta(firmes);
console.log('');
P('en el borde: se avisa, no suspende', borde.length);
pinta(borde);
if (process.argv.includes('--sin-comprobar')) {
  console.log('\n  las que no se pueden comprobar, una por una:');
  for (const [p, dice] of sinComprobar)
    console.log('      ' + p.id.padEnd(30) + 'dice «' + dice + '»  ·  sin paradas a 3 km');
}
const total = firmes.length + contra.length;
console.log('\n' + (total ? '*** ' + total + ' ficha(s) con el municipio fuera de sitio, en firme ***'
                          : 'ninguna ficha nombra un municipio que no le toque'));
process.exit(total ? 1 : 0);
