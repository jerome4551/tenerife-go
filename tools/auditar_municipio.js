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
  /* Masca es de Buenavista del Norte, no de Santiago del Teide: las TRES
     paradas del catalogo que llevan «Masca» en el nombre son de Buenavista.
     Estuvo en la lista de Santiago del Teide y por eso el mirador Cruz de
     Hilda, ya corregido a Buenavista, volvia a salir como contradiccion. */
  'Buenavista del Norte': ['Buenavista', 'Teno', 'Masca'],
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
  'Santiago del Teide': ['Los Gigantes', 'Puerto Santiago', 'Tamaimo'],
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

/* EL POLIGONO MANDA. Desde que llego el shapefile municipal del Cabildo, la
   pregunta «¿en que municipio cae este punto?» tiene respuesta exacta:
   tools/municipio.py hace point-in-polygon contra los 31 municipios. Se le
   pregunta UNA vez por los 787 y la geometria vive en un solo sitio.

   Antes esto se hacia por aproximacion, mirando si habia una raya municipal
   entre el punto y las paradas de alrededor. Acertaba, pero no podia cerrar
   un punto pegado a un limite y necesitaba tres paradas cerca para opinar.
   Las paradas se siguen usando, pero solo para ENSEÑAR el entorno cuando algo
   no cuadra, no para decidir. */
const path = require('path');
const { execFileSync } = require('child_process');
const POLIGONO = (() => {
  try {
    const entrada = PLACES.map(p => p.id + ' ' + p.lat + ' ' + p.lng).join('\n');
    const salida = execFileSync('python3', [path.join(__dirname, 'municipio.py'), '--lote'],
                                { input: entrada, encoding: 'utf8', maxBuffer: 1 << 24 });
    const m = {};
    let validos = null;
    for (const l of salida.split('\n')) {
      /* municipio.py --lote devuelve «id \t municipio [\t metros]». El tercer
         campo se añadio despues, y exigir exactamente dos dejo este control
         leyendo CERO fichas: decia «520 con el punto en el agua» y 0
         hallazgos. Un control que se queda mudo por un tabulador es peor que
         no tenerlo, asi que aqui se aceptan dos campos o tres, y mas abajo se
         comprueba que haya leido algo. */
      const t = l.split('\t');
      if (t[0] === '#municipios') { validos = new Set(t[1].split('|')); continue; }
      if (t.length >= 2 && t[1]) m[t[0]] = t[1];
    }
    /* Dos cinturones, porque este control ya se quedo mudo una vez:
       que haya leido fichas, y que lo leido SEAN municipios de verdad. */
    if (Object.keys(m).length < PLACES.length / 2) return null;
    if (validos && Object.values(m).some(x => !validos.has(x))) return null;
    return m;
  } catch (e) { return null; }
})();

/* Las paradas, solo para enseñar el entorno de lo que no cuadra. */
const RADIO = 1500;
const CUANTAS = 8;

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
  const cae = POLIGONO ? POLIGONO[p.id] : undefined;
  if (dichos.length > 1) {
    /* Si se contradice pero el poligono dice cual de los dos es, ya no es una
       contradiccion sin resolver: es un error con respuesta. */
    contra.push([p, dichos, cae]);
    continue;
  }
  const dice = dichos[0][1];
  if (!cae) { sinComprobar.push([p, dice]); continue; }   // en el mar, o sin poligono
  if (cae === dice) coinciden.push(p);
  else mal.push([p, dice, cerca(p), cae]);
}

const P = (t, v) => console.log('  ' + String(t).padEnd(46, '.') + ' ' + v);
console.log('=== el municipio que dice la ficha, contra donde cae el punto ===');
if (!POLIGONO) {
  console.log('  no he podido preguntarle a tools/municipio.py: sin poligono no se comprueba');
  process.exit(0);
}
P('lugares', PLACES.length);
P('  que nombran un municipio', PLACES.length - sinDeclarar.length);
P('  de esos, comprobados contra el POLIGONO del Cabildo', coinciden.length + mal.length);
P('  y con el punto en el agua: no cae en ningun municipio', sinComprobar.length);
P('no declaran municipio', sinDeclarar.length);
console.log('');
P('LA FICHA SE CONTRADICE A SI MISMA', contra.length);
for (const [p, d, cae] of contra) {
  console.log('      ' + p.id.padEnd(30) + d.map(x => x[0] + ' dice «' + x[1] + '»').join('  vs  '));
  console.log('      ' + ' '.repeat(30) + '  el poligono dice: ' + (cae || '(el punto cae en el agua)'));
}
console.log('');
/* Ya no hay «borde»: el poligono no tiene bordes difusos. Lo unico que se
   sigue enseñando de las paradas es el entorno, para poder mirarlo. */
const pinta = l => {
  for (const [p, dice, c, cae] of l.sort((a, b) => a[0].id < b[0].id ? -1 : 1)) {
    console.log('      ' + p.id.padEnd(30) + 'dice «' + dice + '»  ·  el poligono dice «' + cae + '»');
    console.log('      ' + ' '.repeat(30) + '  ' + p.lat + ', ' + p.lng +
                (c.length ? '  ·  parada mas cerca: ' + c[0].n + ' (' + Math.round(c[0].d) + ' m, ' + c[0].m + ')' : ''));
  }
};
P('EL MUNICIPIO NO CUADRA', mal.length);
pinta(mal);
const firmes = mal;
if (process.argv.includes('--sin-comprobar')) {
  console.log('\n  las que no se pueden comprobar, una por una:');
  for (const [p, dice] of sinComprobar)
    console.log('      ' + p.id.padEnd(30) + 'dice «' + dice + '»  ·  el punto no cae en ningun municipio');
}
const total = firmes.length + contra.length;
console.log('\n' + (total ? '*** ' + total + ' ficha(s) con el municipio fuera de sitio, en firme ***'
                          : 'ninguna ficha nombra un municipio que no le toque'));
process.exit(total ? 1 : 0);
