#!/usr/bin/env node
/* informe_lugares.js — TODO lo que se puede comprobar de los lugares, y,
 * dicho igual de claro, lo que NO.
 *
 * Existe porque cada auditoria sacaba una lista nueva: los controles miraban
 * la FORMA del dato -cuantos decimales tiene, si cae en tierra- y no el dato
 * cruzado con el resto del repositorio. Esto barre todos los lugares, no una
 * muestra, y separa las tres cosas que nunca hay que mezclar:
 *   lo comprobado y correcto · lo comprobado y mal · lo que no se puede
 *   comprobar desde aqui, con su motivo.
 *
 *     node tools/informe_lugares.js > REVISION-LUGARES.md
 *     node tools/informe_lugares.js --comprobar   (lo corre auditar.sh)
 *
 * CADA CIFRA SE CUENTA AL GENERARLO (17 de octubre de 2026). Hasta hoy el
 * titulo y el resumen del final llevaban cifras escritas a mano: «787 de
 * 787» con 977 lugares en el mapa, «0 de 112» zonas de baño, y cinco fichas
 * dadas por mal que ya estaban corregidas, con el metodo de las paradas que
 * se cambio por el poligono del Cabildo. Lo que no se cuenta aqui se lee de
 * la salida del control que lo mide, y si esa salida no trae la linea, el
 * informe para: un informe que se inventa una cifra es peor que ninguno.
 * Las cifras de la historia (de donde salieron las primeras verificadas)
 * van con su fecha, porque son de ese dia.
 *
 * --comprobar no escribe: para si REVISION-LUGARES.md no es lo que saldria
 * ahora, fecha aparte. Asi el informe no se queda viejo sin que se vea.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { PLACES, CAT, km } = require('./cargar');
const src = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const O = [];
const w = s => O.push(s);
const { execSync } = require('child_process');
/* Una cifra de la salida de otro control: «etiqueta.......... 454» o
   «etiqueta: 454». Si la linea no esta, PARA: escribir otra cosa seria
   inventarse la cifra. */
const cifra = (salida, etiqueta, quien) => {
  const esc = etiqueta.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = new RegExp('^\\s*' + esc + '[ .:]*(\\d+)\\s*$', 'm').exec(salida);
  if (!m) throw new Error('la salida de ' + quien + ' no trae «' + etiqueta + '»: el informe no se inventa la cifra');
  return Number(m[1]);
};

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

w('# Revisión de los ' + PLACES.length + ' lugares');
w('');
/* La fecha NO se escribe a mano: es la del dia en que se genera. Escrita,
   el informe decia septiembre cuando ya era otro mes y lo de dentro era
   nuevo, que es justo el dato viejo que este proyecto persigue. */
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
               'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const HOY = new Date();
w('**' + HOY.getDate() + ' de ' + MESES[HOY.getMonth()] + ' de ' + HOY.getFullYear()
  + '.** Generado con `node tools/informe_lugares.js`.');
w('Barre los ' + PLACES.length + ', no una muestra. Lo que no se puede comprobar desde aquí sale');
w('contado y listado, no callado.');
w('');

/* ── 1 · precision de la coordenada ─────────────────────────────────────── */
const dist = {};
for (const p of PLACES) {
  const n = Math.min(sig(lit[p.id][0]), sig(lit[p.id][1]));
  dist[n] = (dist[n] || 0) + 1;
}
/* ── 0 · lo verificado, separado de lo que no ───────────────────────────── */
const REG = (() => { try {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'datos', 'verificado.json'), 'utf8'));
} catch (e) { return {}; } })();
const VER = REG.coordenada || {};
const AREAS = REG.areas || {};

w('## 0 · El estado de cada área, de un vistazo');
w('');
w('Lo primero, porque es lo que evita repetir trabajo. **Un área en «cerrado»');
w('no se vuelve a pedir.** Cerrado no quiere decir perfecto: quiere decir que');
w('la verificación se hizo, que se agotó lo que se podía comprobar y que el');
w('techo está escrito. Un área cerrada con un dato deducido **está cerrada**:');
w('el «deducida» es el resultado honesto, no una tarea pendiente.');
w('');
w('| área | estado | qué hay |');
w('|---|---|---|');
for (const [k, a] of Object.entries(AREAS)) {
  const marca = a.estado === 'cerrado' ? '**cerrado**' : 'abierto';
  /* `resultado` es texto en unas areas y un objeto de cifras en otras */
  const r = a.resultado;
  const txt = typeof r === 'string' ? r
            : (r ? Object.entries(r).map(([x, y]) => x.replace(/_/g, ' ') + ' ' + y).join(' · ')
                 : (a.techo || ''));
  /* Las cifras del area `coordenadas` NO se leen del registro: se cuentan
     aqui. Escritas alli se quedaban viejas -decia 130 verificadas cuando ya
     eran 132- y un informe con una cifra vieja es peor que sin cifra. */
  const q = k === 'coordenadas'
    ? (PLACES.filter(x => VER[x.id]).length + ' verificadas con su fuente · '
       + PLACES.filter(x => !VER[x.id]).length + ' sin mirar · '
       /* La misma cuenta que auditar_redondeo.py: sin las verificadas y sin
          las que son un rotulo a proposito. Dos cifras distintas para lo
          mismo en dos sitios es como no tener ninguna. */
       + PLACES.filter(x => sig(lit[x.id][0]) <= 3 && sig(lit[x.id][1]) <= 3
                            && !VER[x.id] && !(REG.coordenada_de_zona || {})[x.id]).length
       + ' puestas a ojo · '
       + PLACES.filter(x => (REG.coordenada_de_zona || {})[x.id]).length
       + ' redondas a proposito')
    : String(txt).replace(/\|/g, '').slice(0, 130);
  w('| `' + k + '` | ' + marca + ' | ' + q + ' |');
}
w('');
const abiertas = Object.entries(AREAS).filter(([, a]) => a.estado !== 'cerrado');
/* Una sola area abierta decia «en las 1 areas abiertas». Un informe que no
   sabe contar hasta uno no invita a fiarse del resto de sus cifras. */
w(abiertas.length === 1
  ? '**Lo único que queda por hacer está en el área abierta que queda:**'
  : '**Lo único que queda por hacer está en las ' + abiertas.length + ' áreas abiertas:**');
w('');
for (const [k, a] of abiertas) {
  const ab = Array.isArray(a.abierto) ? a.abierto.join('; ') : (a.abierto || '');
  w('- **`' + k + '`** — ' + ab);
}
w('');
const cerradas = Object.entries(AREAS).filter(([, a]) => a.estado === 'cerrado');
w(cerradas.length === 1
  ? '### La cerrada, con su techo escrito'
  : '### Las ' + cerradas.length + ' cerradas, con su techo escrito');
w('');
for (const [k, a] of cerradas) {
  w('**`' + k + '`** · ' + (a.fecha || ''));
  if (a.fuente) w('- fuente: ' + a.fuente);
  if (a.que_se_hizo) w('- qué se hizo: ' + a.que_se_hizo);
  if (a.techo) w('- **el techo**: ' + a.techo);
  if (a.fuentes_agotadas) {
    w('- fuentes que se abrieron y no sirven:');
    for (const [f, por] of Object.entries(a.fuentes_agotadas)) w('  - **' + f + '** — ' + por);
  }
  if (a.metodo_automatico) w('- método automático: ' + a.metodo_automatico);
  if (a.auditoria) w('- auditoría: ' + a.auditoria);
  if (a.resultado && typeof a.resultado === 'string') w('- resultado: ' + a.resultado);
  if (a.resultado && typeof a.resultado === 'object')
    w('- resultado: ' + Object.entries(a.resultado).map(([x, y]) => x.replace(/_/g, ' ') + ' ' + y).join(' · '));
  if (a.precision) w('- precisión: ' + a.precision);
  if (Array.isArray(a.abierto) && a.abierto.length) {
    w('- lo único que quedó abierto de esta área:');
    for (const x of a.abierto) w('  - ' + x);
  }
  w('');
}

const nVer = PLACES.filter(p => VER[p.id]).length;
w('## 0 · Lo verificado, separado de lo que no');
w('');
w('Esto es lo primero porque es lo que faltaba. Antes se comprobaba un sitio y');
w('la comprobación no se guardaba en ninguna parte: se quedaba en los mensajes');
w('y en los commits. El siguiente control volvía a sacarlo en la lista, y');
w('parecía que todo fallaba siempre.');
w('');
w('| | fichas |');
w('|---|---|');
w('| **Coordenada verificada**, con su fuente apuntada en `datos/verificado.json` | **' + nVer + '** |');
w('| Coordenada nunca comprobada por nadie | **' + (PLACES.length - nVer) + '** |');
w('');
w('**Lo que no está verificado no es que esté mal: es que nadie lo ha mirado');
w('todavía.** Son dos cosas distintas y este informe no las mezcla.');
w('');
w('De dónde viene cada una:');
w('');
w('| id | fecha | de dónde sale |');
w('|---|---|---|');
for (const p of PLACES.filter(p => VER[p.id]).sort((a, b) => a.id < b.id ? -1 : 1))
  w('| `' + p.id + '` | ' + VER[p.id].fecha + ' | ' + VER[p.id].fuente.replace(/\|/g, '') + ' |');
w('');
w('**Estas no se vuelven a pedir.** `auditar_redondeo.py` las deja en paz aunque');
w('estén escritas con pocos decimales: la precisión de una fuente es la que es.');
w('');
w('Y no hace falta acordarse de apuntarlas: `tools/fijar_coordenada.py` escribe');
w('el apunte solo cuando aplica una coordenada, con la fuente que se le pase');
w('detrás de la `#`. Si no se le da fuente, avisa de que no la apunta.');
w('');
w('### De dónde salieron las 130 primeras (21 de septiembre)');
w('');
w('No se han inventado: se han sacado de los ficheros de fuente que ya se');
w('habían entregado y aplicado, y **se ha comprobado que la coordenada de hoy');
w('sigue siendo la que traía la fuente**. De 119 así, ninguna había cambiado');
w('después y ninguna había desaparecido.');
w('');
w('| fichero de origen | qué traía |');
w('|---|---|');
w('| `playastenerife.json` | 40 altas y 4 correcciones de coordenada, cada una con su campo `fuente`: Censo Nacional de Zonas de Aguas de Baño 2025 del Servicio Canario de la Salud, Bandera Azul 2026 y Google Places |');
w('| `listasplayascharcos.md` | las tablas de playas y charcos con su coordenada, bajo la línea «**ninguna coordenada estimada**» |');
w('| `parche2coordenadas.md` | las 4 de Anaga y Rambla de Castro que estaban corridas, con la comprobación cruzada contra `mir-rambla-castro` |');
w('| el historial de git | las 14 corregidas a propósito, con el commit que dice por qué |');
w('');
w('Las que vinieron después llevan su fuente en la tabla de arriba, una a una.');
w('');
w('**Una precisión, para no decir más de lo que es.** `listasplayascharcos.md`');
w('lista las playas por nombre y coordenada, no por id, así que el');
w('emparejamiento se hizo por **coordenada exacta**. Una ficha que comparte');
w('punto con una playa verificada —su webcam, su ficha de accesibilidad, el');
w('spot de surf que está en esa misma arena— hereda la verificación **del');
w('punto**. Lo verificado es que ese punto es el de esa playa; que la ficha');
w('deba estar ahí es otra cosa y no se afirma.');
w('');
const ORI = (() => {
  let b = src.slice(src.indexOf('const PLAYAS_ORIENTACION'));
  b = b.slice(0, b.indexOf('\n};'));
  const filas = [...b.matchAll(/'([a-z0-9-]+)':\s*\{([^}]*)\}/g)];
  if (!filas.length) throw new Error('no encuentro PLAYAS_ORIENTACION en index.html');
  return { filas: filas.length, ded: filas.filter(m => /deducida/.test(m[2])).length,
           ids: new Set(filas.map(m => m[1])) };
})();
w('### Una cosa que conviene saber: las orientaciones de playa');
w('');
w('De las **' + ORI.filas + '** filas de `PLAYAS_ORIENTACION`, **' + ORI.ded + ' son deducidas**, no');
w('verificadas. Lo dice el propio fichero que las trajo,');
w('`orientaciones65.json`: *«las 65 las produjo un modelo de lenguaje');
w('(Gemini). 11 tienen respaldo publicado que verifiqué abriendo la fuente, 1');
w('se hereda por vecindad de una verificada, y 53 son deducción auditada por');
w('coherencia con las vecinas»*. Por eso van todas con `deducida:true`, que es');
w('lo honesto.');
w('');
w('`ori` alimenta el cálculo de si una playa está resguardada del viento de');
w('hoy. **No es un dato decorativo.** Las ' + (ORI.filas - ORI.ded) + ' escritas a mano sí están');
w('comprobadas; de las otras ' + ORI.ded + ', once tienen respaldo y el fichero no dice');
w('cuáles, así que desde aquí no se pueden separar.');
w('');
w('### Lo que SÍ tiene fuente oficial dentro de la propia ficha');
w('');
w('| dato | fichas |');
w('|---|---|');
w('| Calidad del agua del censo de zonas de baño, con su año | **' + PLACES.filter(p => p.aguaCalidad && p.aguaCalidadAnio).length + '** |');
w('| Bandera Azul declarada | **' + PLACES.filter(p => p.blueFlag === true).length + '** |');
w('| Socorrista declarado (sí o no, no «se desconoce») | **' + PLACES.filter(p => p.lifeguard === true || p.lifeguard === false).length + '** |');
w('| Orientación de playa escrita a mano (las otras ' + ORI.ded + ' son deducidas) | **' + (ORI.filas - ORI.ded) + '** |');
w('');

w('## 1 · Con cuánta precisión está escrita cada coordenada');
w('');
w('Decimales **significativos** —los ceros de la derecha no cuentan— del eje');
w('menos preciso de cada ficha. Es la cuenta entera de los ' + PLACES.length + ', no un umbral:');
w('');
w('| decimales | cuadrícula | fichas |');
w('|---|---|---|');
const rej = { 0: '~110 km', 1: '~11 km', 2: '~1,1 km', 3: '~110 m', 4: '~11 m', 5: '~1 m', 6: '~10 cm', 7: '~1 cm' };
for (const k of Object.keys(dist).sort((a, b) => a - b))
  w('| ' + k + ' | ' + (rej[k] || '') + ' | **' + dist[k] + '** |');
w('');
/* Las redondas A PROPOSITO -una zona, un recorrido, un barrio- no cuentan:
   su coordenada es un rotulo, no una posicion, y estan declaradas una a una
   con su motivo en `coordenada_de_zona`. Se listan aparte, no se callan. */
const ZONA = REG.coordenada_de_zona || {};
const redondas = PLACES.filter(p => sig(lit[p.id][0]) <= 3 && sig(lit[p.id][1]) <= 3);
const red = redondas.filter(p => !ZONA[p.id]);
const rotulo = redondas.filter(p => ZONA[p.id]);
const peor = p => sig(lit[p.id][0]) <= 2 || sig(lit[p.id][1]) <= 2;
if (rotulo.length) {
  w('**' + rotulo.length + ' son redondas a propósito**: su coordenada es un rótulo, no una');
  w('posición. El Parque Rural de Anaga son 14.419 hectáreas y la Caldera de Las');
  w('Cañadas tiene 16 km de diámetro; un sendero es un recorrido. Están declaradas');
  w('una a una con su motivo en `coordenada_de_zona`, y no se vuelven a pedir:');
  w('');
  for (const p of rotulo.sort((a, b) => a.id < b.id ? -1 : 1))
    w('- `' + p.id + '` — ' + ZONA[p.id].motivo);
  w('');
}
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
const salida = (() => { try {
  return execSync('node ' + path.join(__dirname, 'auditar_municipio.js'), { encoding: 'utf8' });
} catch (e) { return e.stdout || ''; } })();
w('## 4 · El municipio que dice la ficha, contra donde cae el punto');
w('');
w('Para cada ficha que declara un municipio —en un tramo del `cat` o en el');
w('paréntesis del nombre— `tools/municipio.py` mira dentro de qué municipio');
w('cae el punto, contra el polígono municipal del Cabildo. Si no es el que');
w('dice la ficha, el punto no está donde el texto dice, o el texto se equivoca.');
w('');
w('Salida de `node tools/auditar_municipio.js`:');
w('');
w('```');
salida.split('\n').forEach(l => w(l.replace(/\s+$/, '')));
w('```');
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
w('| **El municipio de ' + cifra(salida, 'no declaran municipio', 'auditar_municipio.js') + ' fichas** | no declaran ninguno en el `cat` ni en el nombre, así que no hay nada que contrastar |');
w('| **El de ' + cifra(salida, 'solo nombran una zona de varios municipios', 'auditar_municipio.js') + ' más** | solo nombran una zona que abarca varios municipios, no un municipio |');
w('| **El de ' + cifra(salida, 'y con el punto en el agua: no cae en ningun municipio', 'auditar_municipio.js') + ' que sí lo nombran** | el punto cae en el agua, fuera de todos los polígonos: no hay con qué compararlo |');
w('');
w('**Las fuentes de fuera están bloqueadas** en este entorno: Wikipedia,');
w('tenerife.es, webtenerife.com, eldia.es y los dos endpoints de Overpass dan');
w('`000` o `403`. Todo lo de arriba sale de cruzar datos que ya estaban dentro');
w('del repositorio.');
w('');
/* ── 6 · el resumen, contado ahora ─────────────────────────────────────── */
const N = PLACES.length;
/* la misma caja que tools/fijar_coordenada.py */
const enCaja = PLACES.filter(p => p.lat >= 27.90 && p.lat <= 28.70 && p.lng >= -17.00 && p.lng <= -16.05).length;
/* la tierra la mide auditar_en_el_mar.py, contra la capa earth del mapa */
const mar = (() => { try {
  return execSync('python3 ' + path.join(__dirname, 'auditar_en_el_mar.py'), { encoding: 'utf8' });
} catch (e) { return e.stdout || ''; } })();
let tierra;
if (/no hay mapa\/tenerife-osm\.pmtiles/.test(mar)) {
  tierra = 'no se ha podido medir: falta `mapa/tenerife-osm.pmtiles`';
} else {
  const medidos = cifra(mar, 'lugares medidos contra la capa earth de OSM.', 'auditar_en_el_mar.py');
  const fuera = cifra(mar, 'de tierra y FUERA de tierra', 'auditar_en_el_mar.py');
  /* la linea de los del agua solo sale si hay alguno */
  const agua = /estan en el agua a proposito/.test(mar)
    ? cifra(mar, 'puertos, marinas y charcos (estan en el agua a proposito)', 'auditar_en_el_mar.py') : 0;
  tierra = '**' + (medidos - fuera - agua) + '** de ' + medidos + '; ' + agua
    + ' en el agua a propósito, exentas con su motivo, y **' + fuera
    + '** que tendrían que estar en tierra (`auditar_en_el_mar.py`)';
}
const vecesId = {};
PLACES.forEach(p => vecesId[p.id] = (vecesId[p.id] || 0) + 1);
const idsBien = PLACES.filter(p => /^[a-z0-9-]+$/.test(p.id) && vecesId[p.id] === 1).length;
/* el castellano esta en index.html; los otros nueve, en idiomas/*.json (el
   polaco tambien, montado desde idiomas/pl-lugares/) */
const NUEVE = ['en', 'fr', 'de', 'it', 'nl', 'zh', 'zht', 'bg', 'pl'];
const fueraTx = {};
for (const L of NUEVE) fueraTx[L] = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'idiomas', L + '.json'), 'utf8'));
const lleno = t => typeof t === 'string' && t.trim() !== '';
const diezIdiomas = PLACES.filter(p => p.desc && p.cat && lleno(p.desc.es) && lleno(p.cat.es)
  && NUEVE.every(L => fueraTx[L][p.id] && lleno(fueraTx[L][p.id].desc) && lleno(fueraTx[L][p.id].cat))).length;
/* el catalogo del planificador, como lo mira auditar_datos.js */
const refs = [];
for (const b of src.matchAll(/suggestionIds:\s*\[([\s\S]*?)\]/g))
  for (const m of b[1].matchAll(/'([a-z0-9-]+)'/g)) refs.push(m[1]);
const vivos = new Set(PLACES.map(p => p.id));
const banio = PLACES.filter(p => p.category === 'playa' || p.category === 'piscinas');
const tiposWarn = (() => {
  const t = (src.match(/WARN_I18N\s*=\s*\{[\s\S]*?\n  \};/) || [''])[0];
  return new Set([...t.matchAll(/^\s{4}(\w+):\s*\{/gm)].map(m => m[1]));
})();
if (!tiposWarn.size) throw new Error('no encuentro WARN_I18N en index.html');
const conWarn = PLACES.filter(p => p.warn);
w('## 6 · Lo que sí queda comprobado sobre los ' + N);
w('');
w('| comprobación | resultado |');
w('|---|---|');
w('| Caen dentro de la caja de Tenerife | **' + enCaja + ' de ' + N + '** |');
w('| Caen en tierra (capa `earth` de OSM) | ' + tierra + ' |');
w('| Ids únicos y con el formato `[a-z0-9-]` | **' + idsBien + '** de ' + N + ' |');
w('| Tienen `desc` y `cat` en los diez idiomas | **' + diezIdiomas + '** de ' + N + ' |');
w('| Referencias huérfanas desde el planificador | **' + refs.filter(id => !vivos.has(id)).length + '** de ' + refs.length + ' |');
w('| Zonas de baño sin orientación | **' + banio.filter(p => !ORI.ids.has(p.id)).length + '** de ' + banio.length + ' |');
w('| `lifeguard` con un valor que no sea true/false/null | **'
  + PLACES.filter(p => 'lifeguard' in p && p.lifeguard !== true && p.lifeguard !== false && p.lifeguard !== null).length + '** |');
w('| Colores fuera de `#rrggbb` | **' + PLACES.filter(p => !/^#[0-9a-fA-F]{6}$/.test(String(p.color || ''))).length + '** |');
w('| Avisos `warn` cuyo tipo no existe | **' + conWarn.filter(p => !tiposWarn.has(p.warn)).length + '** de ' + conWarn.length + ' |');

const texto = O.join('\n') + '\n';
if (process.argv.includes('--comprobar')) {
  /* la fecha es la del dia en que se genera: no cuenta */
  const sinFecha = t => t.replace(/^\*\*\d{1,2} de [a-z]+ de \d{4}\.\*\* Generado con .*$/m, '');
  const f = path.join(__dirname, '..', 'REVISION-LUGARES.md');
  const hay = fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null;
  if (hay === null || sinFecha(hay) !== sinFecha(texto)) {
    const a = (hay === null ? [] : sinFecha(hay).split('\n')), b = sinFecha(texto).split('\n');
    let i = 0; while (i < a.length && i < b.length && a[i] === b[i]) i++;
    console.log('REVISION-LUGARES.md no esta al dia: node tools/informe_lugares.js > REVISION-LUGARES.md');
    if (hay !== null) console.log('  primera linea distinta (' + (i + 1) + '):\n    hay:     ' + (a[i] || '(nada)').slice(0, 120)
                                   + '\n    saldria: ' + (b[i] || '(nada)').slice(0, 120));
    process.exit(1);
  }
  console.log('REVISION-LUGARES.md al dia: ' + PLACES.length + ' lugares, cada cifra contada');
  process.exit(0);
}
fs.writeSync(1, texto);
