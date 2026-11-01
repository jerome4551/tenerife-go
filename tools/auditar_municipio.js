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
  'Arona': ['Los Cristianos', 'Valle San Lorenzo'],
  /* Masca es de Buenavista del Norte, no de Santiago del Teide: las TRES
     paradas del catalogo que llevan «Masca» en el nombre son de Buenavista.
     Estuvo en la lista de Santiago del Teide y por eso el mirador Cruz de
     Hilda, ya corregido a Buenavista, volvia a salir como contradiccion. */
  'Buenavista del Norte': ['Buenavista', 'Masca'],
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

/* Nombres que NO son de un municipio sino de una comarca o de una zona
   turistica repartida entre varios. Estuvieron en ALIAS y cada uno mandaba
   a UN municipio, asi que el control acusaba a la ficha de mentir cuando el
   punto caia en el otro. No mentia: la zona es de los dos.

   Que son de varios no lo digo yo, lo dicen los propios puntos de la app:
     · «Las Americas»: 10 fichas la nombran, 8 caen en Arona y 2 en Adeje
       (bici-alquiler-sur, wc-troya). La raya parte la zona por el medio.
     · «Teno»: 7 fichas lo nombran, 6 caen en Buenavista del Norte y 1 en
       Los Silos (pr-tf-52-monte-agua). Es el macizo, no un ayuntamiento.
   Si un nombre manda a dos municipios distintos, no es el nombre de uno.

   No les invento la lista de municipios: una ficha que solo nombra una zona
   no declara municipio comprobable, y va a su propio apartado, contada y
   listada. Darla por buena seria llamar verificado a lo que no se ha
   mirado; darla por mala seria cantar un error que no existe. */
const ZONAS = ['Las Americas', 'Las Américas', 'Playa de las Américas', 'Teno'];
const ES_ZONA = new Set(ZONAS.map(norm));

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
    /* Cuarta columna: el municipio que la ficha declara. municipio.py
       devuelve entonces a cuantos metros esta su raya, y esa cifra es la que
       separa «el pin cayo al otro lado por 40 m» de «el texto miente por
       44 km». Sin ella, las 16 parecen el mismo problema y no lo son. */
    const entrada = PLACES.map(p => {
      const d = declara(p);
      const dice = d.length === 1 ? d[0][1] : '';
      return [p.id, p.lat, p.lng, dice].join('\t');
    }).join('\n');
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
      if (t.length >= 2 && t[1]) m[t[0]] = { muni: t[1], metros: t[2] ? +t[2] : null };
    }
    /* Dos cinturones, porque este control ya se quedo mudo una vez:
       que haya leido fichas, y que lo leido SEAN municipios de verdad. */
    if (Object.keys(m).length < PLACES.length / 2) return null;
    if (validos && Object.values(m).some(x => !validos.has(x.muni))) return null;
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
  for (const t of cat.split(' · ')) trozos.push(['cat', t.trim()]);
  const par = /\(([^()]+)\)\s*[^\p{L}]*$/u.exec(p.name || '');
  if (par) trozos.push(['nombre', par[1].trim()]);
  const out = [], zonas = [];
  for (const [de, tal] of trozos) {
    const t = norm(tal);
    /* La zona se ensena tal y como la escribe la ficha, no normalizada: si
       el informe dice «Las Americas» y la ficha pone «Las Américas», el que
       lo lea busca en el fichero una cadena que no esta. */
    if (ES_ZONA.has(t)) { if (!zonas.includes(tal)) zonas.push(tal); continue; }
    const hit = FORMAS.find(([forma]) => forma === t);
    if (hit && !out.some(x => x[1] === hit[1])) out.push([de, hit[1]]);
  }
  out.zonas = zonas;
  return out;
}

const sinDeclarar = [], sinComprobar = [], coinciden = [], mal = [], contra = [], zona = [];
for (const p of PLACES) {
  const dichos = declara(p);
  /* Nombra una zona y ningun municipio: no hay nada que contrastar. Ni pasa
     ni falla, se lista. */
  if (!dichos.length && dichos.zonas.length) { zona.push([p, dichos.zonas]); continue; }
  if (!dichos.length) { sinDeclarar.push(p); continue; }
  const info = POLIGONO ? POLIGONO[p.id] : undefined;
  const cae = info && info.muni;
  if (dichos.length > 1) {
    /* Si se contradice pero el poligono dice cual de los dos es, ya no es una
       contradiccion sin resolver: es un error con respuesta. */
    contra.push([p, dichos, cae]);
    continue;
  }
  const dice = dichos[0][1];
  if (!cae) { sinComprobar.push([p, dice]); continue; }   // en el mar, o sin poligono
  if (cae === dice) coinciden.push(p);
  else mal.push([p, dice, cerca(p), cae, info.metros]);
}

const P = (t, v) => console.log('  ' + String(t).padEnd(46, '.') + ' ' + v);
console.log('=== el municipio que dice la ficha, contra donde cae el punto ===');
if (!POLIGONO) {
  console.log('  no he podido preguntarle a tools/municipio.py: sin poligono no se comprueba');
  process.exit(0);
}
P('lugares', PLACES.length);
P('  que nombran un municipio', PLACES.length - sinDeclarar.length - zona.length);
P('  de esos, comprobados contra el POLIGONO del Cabildo', coinciden.length + mal.length);
P('  y con el punto en el agua: no cae en ningun municipio', sinComprobar.length);
P('solo nombran una zona de varios municipios', zona.length);
P('no declaran municipio', sinDeclarar.length);
console.log('');
if (zona.length) {
  console.log('  nombran una ZONA, que no es un municipio: no hay nada que comprobar');
  for (const [p, z] of zona.sort((a, b) => a[0].id < b[0].id ? -1 : 1))
    console.log('      ' + p.id.padEnd(30) + 'dice «' + z.join('», «') + '»  ·  el poligono dice «' +
                ((POLIGONO[p.id] && POLIGONO[p.id].muni) || '(cae en el agua)') + '»');
  console.log('');
}
P('LA FICHA SE CONTRADICE A SI MISMA', contra.length);
for (const [p, d, cae] of contra) {
  console.log('      ' + p.id.padEnd(30) + d.map(x => x[0] + ' dice «' + x[1] + '»').join('  vs  '));
  console.log('      ' + ' '.repeat(30) + '  el poligono dice: ' + (cae || '(el punto cae en el agua)'));
}
console.log('');
/* Ya no hay «borde»: el poligono no tiene bordes difusos. Lo unico que se
   sigue enseñando de las paradas es el entorno, para poder mirarlo. */
const pinta = l => {
  /* Ordenadas por lo lejos que esta el municipio que dicen: arriba las que
     solo pueden explicarse por el texto, abajo las que pueden ser el pin. */
  for (const [p, dice, c, cae, metros] of l.sort((a, b) => (b[4] || 0) - (a[4] || 0))) {
    console.log('      ' + p.id.padEnd(30) + 'dice «' + dice + '»  ·  el poligono dice «' + cae + '»');
    console.log('      ' + ' '.repeat(30) + '  a ' +
                (metros == null ? '?' : metros >= 1000 ? (metros / 1000).toFixed(1) + ' km' : metros + ' m') +
                ' de «' + dice + '»  ·  ' + p.lat + ', ' + p.lng +
                (c.length ? '  ·  parada: ' + c[0].n + ' (' + Math.round(c[0].d) + ' m, ' + c[0].m + ')' : ''));
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
/* Las dos cifras estan escritas tambien en el titular de AUDITORIA-FINAL.md,
   donde caducan sin que nada avise. Esta area ya se quedo «cerrada» con un
   «0 en firme» que era de la version anterior del control: la unica forma de
   que no vuelva a pasar es que el documento se cotege contra lo que cuenta la
   herramienta, y que discrepar salga en rojo. */
let docMal = 0;
try {
  const fs = require('fs'), path = require('path');
  const doc = fs.readFileSync(path.join(__dirname, '..', 'AUDITORIA-FINAL.md'), 'utf8');
  const d = /^## El municipio · (\d+) fuera de sitio, (\d+) que solo nombran una zona$/m.exec(doc);
  const bien = d && Number(d[1]) === mal.length && Number(d[2]) === zona.length;
  console.log('\n  ' + (bien ? 'OK ' : 'MAL') + ' AUDITORIA-FINAL.md dice lo mismo' +
              (bien ? '' : '   -> dice ' + (d ? d[1] + ' y ' + d[2] : '(no encuentro el titular)') +
                           ', aqui salen ' + mal.length + ' y ' + zona.length));
  if (!bien) docMal = 1;
} catch (e) { console.log('\n  --  no se pudo leer AUDITORIA-FINAL.md'); }

const total = firmes.length + contra.length;
console.log('\n' + (total ? '*** ' + total + ' ficha(s) con el municipio fuera de sitio, en firme ***'
                          : 'ninguna ficha nombra un municipio que no le toque'));
process.exit(total || docMal ? 1 : 0);
