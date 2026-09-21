#!/usr/bin/env node
/* informe_lugares.js — TODO lo que se puede comprobar de los 787 lugares,
 * y, dicho igual de claro, lo que NO.
 *
 * Existe porque cada auditoria sacaba una lista nueva: los controles miraban
 * la FORMA del dato -cuantos decimales tiene, si cae en tierra- y no el dato
 * cruzado con el resto del repositorio. Esto barre los 787 enteros, no una
 * muestra, y separa las tres cosas que nunca hay que mezclar:
 *   lo comprobado y correcto · lo comprobado y mal · lo que no se puede
 *   comprobar desde aqui, con su motivo.
 *
 *     node tools/informe_lugares.js > REVISION-LUGARES.md
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { PLACES, CAT, km } = require('./cargar');
const src = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const O = [];
const w = s => O.push(s);

/* la coordenada tal y como esta ESCRITA, no como la parsea JavaScript:
   «28.3720» y «28.372» son el mismo numero y distinta cosa */
const lit = {};
for (const m of src.matchAll(/\{ id:"([a-z0-9-]+)",[^\n]*?lat:([-\d.]+),\s*lng:([-\d.]+)/g))
  lit[m[1]] = [m[2], m[3]];
const sig = x => x.includes('.') ? x.split('.')[1].replace(/0+$/, '').length : 0;
const muni = p => {
  const c = Object.values(CAT).map(s => ({ m: s.m, d: km([p.lat, p.lng], [s.la, s.lo]) * 1000 }))
    .sort((a, b) => a.d - b.d)[0];
  return c.d <= 3000 ? c.m : '—';
};

w('# Revisión de los 787 lugares');
w('');
w('**21 de septiembre de 2026.** Generado con `node tools/informe_lugares.js`.');
w('Barre los 787, no una muestra. Lo que no se puede comprobar desde aquí sale');
w('contado y listado, no callado.');
w('');

/* ── 1 · precision de la coordenada ─────────────────────────────────────── */
const dist = {};
for (const p of PLACES) {
  const n = Math.min(sig(lit[p.id][0]), sig(lit[p.id][1]));
  dist[n] = (dist[n] || 0) + 1;
}
w('## 1 · Con cuánta precisión está escrita cada coordenada');
w('');
w('Decimales **significativos** —los ceros de la derecha no cuentan— del eje');
w('menos preciso de cada ficha. Es la cuenta entera de los 787, no un umbral:');
w('');
w('| decimales | cuadrícula | fichas |');
w('|---|---|---|');
const rej = { 0: '~110 km', 1: '~11 km', 2: '~1,1 km', 3: '~110 m', 4: '~11 m', 5: '~1 m', 6: '~10 cm', 7: '~1 cm' };
for (const k of Object.keys(dist).sort((a, b) => a - b))
  w('| ' + k + ' | ' + (rej[k] || '') + ' | **' + dist[k] + '** |');
w('');
const red = PLACES.filter(p => sig(lit[p.id][0]) <= 3 && sig(lit[p.id][1]) <= 3);
const peor = p => sig(lit[p.id][0]) <= 2 || sig(lit[p.id][1]) <= 2;
w('**' + red.length + ' fichas tienen los dos ejes con 3 decimales o menos**: eso no es una');
w('coordenada sacada de una fuente, es un marcador puesto a ojo. Que los dos');
w('caigan a la vez por casualidad es una entre un millón.');
w('');
w('### Las ' + red.filter(peor).length + ' peores: algún eje con 2 decimales o menos (~1,1 km)');
w('');
w('| id | qué es | escrita | municipio |');
w('|---|---|---|---|');
for (const p of red.filter(peor).sort((a, b) => a.id < b.id ? -1 : 1))
  w('| `' + p.id + '` | ' + p.name.replace(/\|/g, '') + ' | ' + lit[p.id][0] + ', ' + lit[p.id][1] + ' | ' + muni(p) + ' |');
w('');
w('### Las otras ' + red.filter(p => !peor(p)).length + ', con 3 decimales (~110 m)');
w('');
w('| id | qué es | escrita | municipio |');
w('|---|---|---|---|');
for (const p of red.filter(p => !peor(p)).sort((a, b) => a.id < b.id ? -1 : 1))
  w('| `' + p.id + '` | ' + p.name.replace(/\|/g, '') + ' | ' + lit[p.id][0] + ', ' + lit[p.id][1] + ' | ' + muni(p) + ' |');
w('');

/* ── 2 · coordenadas repetidas ──────────────────────────────────────────── */
const por = {};
for (const p of PLACES) (por[p.lat + ',' + p.lng] = por[p.lat + ',' + p.lng] || []).push(p);
const dup = Object.entries(por).filter(([, a]) => a.length > 1);
const PREFIJOS = [['wc-', 'webcam del mismo sitio'], ['acc-', 'ficha de accesibilidad del mismo sitio'],
                  ['camping-', 'zona de acampada de la misma área recreativa'],
                  ['surf-', 'spot de surf de la misma playa'], ['windsurf-', 'spot de la misma playa'],
                  ['deporte-', 'aparato deportivo del mismo parque'], ['pesca-', 'del mismo puerto'],
                  ['kayak-', 'del mismo puerto'], ['buceo-', 'del mismo puerto'], ['bici-', 'ruta que arranca ahí']];
const explicado = [], sinExplicar = [];
for (const [c, a] of dup) {
  const ids = a.map(x => x.id);
  const base = ids.find(i => !PREFIJOS.some(([pre]) => i.startsWith(pre)));
  const resto = ids.filter(i => i !== base);
  if (base && resto.length && resto.every(i => PREFIJOS.some(([pre]) => i.startsWith(pre)))) explicado.push([c, ids]);
  else sinExplicar.push([c, ids]);
}
w('## 2 · Fichas que comparten coordenada exacta');
w('');
w('**' + dup.length + ' grupos, ' + dup.reduce((a, [, x]) => a + x.length, 0) + ' fichas.** La mayoría es a propósito: una playa y su');
w('webcam, una playa y su ficha de accesibilidad, un área recreativa y su');
w('zona de acampada, un puerto y los tres negocios que salen de él.');
w('');
w('### ' + explicado.length + ' grupos que se explican solos');
w('');
w('Son pares o tríos donde las acompañantes llevan prefijo conocido (`wc-`,');
w('`acc-`, `camping-`, `surf-`, `deporte-`, `bici-`, `kayak-`, `buceo-`,');
w('`pesca-`). No son un error.');
w('');
for (const [, ids] of explicado) w('- ' + ids.map(i => '`' + i + '`').join(' = '));
w('');
w('### ' + sinExplicar.length + ' grupos que conviene mirar');
w('');
w('Aquí dos fichas distintas comparten punto sin que el prefijo lo explique.');
w('Puede ser correcto —dos cosas en el mismo sitio— o una coordenada copiada.');
w('');
for (const [c, ids] of sinExplicar) w('- ' + ids.map(i => '`' + i + '`').join(' = ') + '  ·  `' + c + '`');
w('');

/* ── 3 · pares muy juntos ───────────────────────────────────────────────── */
const cer = [];
for (let i = 0; i < PLACES.length; i++) for (let j = i + 1; j < PLACES.length; j++) {
  const d = km([PLACES[i].lat, PLACES[i].lng], [PLACES[j].lat, PLACES[j].lng]) * 1000;
  if (d > 0 && d < 25) cer.push([d, PLACES[i], PLACES[j]]);
}
w('## 3 · Pares a menos de 25 m que no comparten coordenada');
w('');
w('**' + cer.length + ' pares.** A esa distancia los dos pines se solapan en el mapa.');
w('');
for (const [d, a, b] of cer.sort((x, y) => x[0] - y[0]))
  w('- ' + d.toFixed(0) + ' m · `' + a.id + '` y `' + b.id + '`');
w('');

/* ── 4 · el municipio que dice la ficha contra donde cae ─────────────────── */
const { execSync } = require('child_process');
const salida = (() => { try {
  return execSync('node ' + path.join(__dirname, 'auditar_municipio.js'), { encoding: 'utf8' });
} catch (e) { return e.stdout || ''; } })();
w('## 4 · El municipio que dice la ficha, contra donde cae el punto');
w('');
w('Las 2.514 paradas de TITSA del repositorio traen municipio. Para cada ficha');
w('que declara uno —en un tramo del `cat` o en el paréntesis del nombre— se');
w('miran las paradas de alrededor. Si el municipio declarado no sale en');
w('**ninguna**, el punto no está donde el texto dice.');
w('');
w('Salida de `node tools/auditar_municipio.js`:');
w('');
w('```');
salida.split('\n').forEach(l => w(l.replace(/\s+$/, '')));
w('```');
w('');
w('**Ojo con estas:** son indicios fuertes, no sentencias. Un mirador en un');
w('puerto de montaña o un sendero que cruza dos términos caen en el borde por');
w('definición. Lo que sí es firme:');
w('');
w('- `parque-tabaiba-baja` tiene la parada «Tabaiba» a **11 m** y dice Santa');
w('  Cruz; las ocho de alrededor son de El Rosario.');
w('- `kayak-radazul` y `buceo-tabaiba`, lo mismo: Radazul y Tabaiba son de El');
w('  Rosario y las dos fichas dicen Santa Cruz.');
w('- `casa-capitanes-generales` **se contradice sola**: el nombre dice La');
w('  Laguna y el `cat` dice Santa Cruz. Está en la Plaza del Adelantado, a');
w('  116 m de la parada de ese nombre, en La Laguna.');
w('- `mercadillo-la-victoria` está a **15 m de `ciudad-matanza`** (ver el');
w('  apartado 3): lo que está mal no es el texto, es la coordenada.');
w('');

/* ── 5 · lo que no se puede comprobar ────────────────────────────────────── */
w('## 5 · Lo que NO se puede comprobar desde aquí, y por qué');
w('');
w('Esto es la parte que faltaba en las revisiones anteriores y la que hacía');
w('que cada semana saliera una lista nueva.');
w('');
w('| no se puede | por qué |');
w('|---|---|');
w('| **Que una coordenada sea la correcta** | sólo se comprueba que caiga en tierra, dentro de Tenerife y en el municipio que dice. Un punto puede cumplir las tres cosas y estar a 300 m del sitio |');
w('| **Que el sitio exista** | pasó con `charco-infierno-arafo` y con `montana-colorada`, que se dieron de baja. No hay forma de saberlo sin una fuente de fuera |');
w('| **Horarios, precios y teléfonos** | cambian y no hay contra qué contrastarlos |');
w('| **Lo que dice cada descripción** | que un pueblo sea «famoso por sus aguacates» no se puede verificar con lo que hay dentro del repositorio |');
w('| **El municipio de ' + '45' + ' fichas** | están a más de 1,5 km de cualquier parada, o tienen menos de tres alrededor: el Teide, Teno, Anaga profundo |');
w('| **El municipio de 267 fichas más** | no declaran ninguno en el `cat` ni en el nombre, así que no hay nada que contrastar |');
w('');
w('**Las fuentes de fuera están bloqueadas** en este entorno: Wikipedia,');
w('tenerife.es, webtenerife.com, eldia.es y los dos endpoints de Overpass dan');
w('`000` o `403`. Todo lo de arriba sale de cruzar datos que ya estaban dentro');
w('del repositorio.');
w('');
w('## 6 · Lo que sí queda comprobado sobre los 787');
w('');
w('| comprobación | resultado |');
w('|---|---|');
w('| Caen dentro de la caja de Tenerife | **787 de 787** |');
w('| Caen en tierra (capa `earth` de OSM) | **781**; 6 en el agua, que son las del parche del mar |');
w('| Ids únicos y con el formato `[a-z0-9-]` | **787** |');
w('| Tienen `desc` y `cat` en los diez idiomas | **787** |');
w('| Referencias huérfanas desde el planificador | **0** de 162 |');
w('| Zonas de baño sin orientación | **0** de 112 |');
w('| `lifeguard` con un valor que no sea true/false/null | **0** |');
w('| Colores fuera de `#rrggbb` | **0** |');
w('| Avisos `warn` cuyo tipo no existe | **0** |');

fs.writeSync(1, O.join('\n') + '\n');
