#!/usr/bin/env node
/* auditar_readme.js — las cifras del README, contadas.
 *
 * EL HUECO QUE TAPA
 *   El README decia «42 categorias», «municipios (41) … playas (35)», «137
 *   claves de interfaz», «Cinco tablas», que el aviso diario «corre cuatro
 *   veces cada mañana» y que «19 lineas van sin precio», cuando ya eran 43
 *   categorias, 74 playas, 130 claves, siete tablas, nueve lanzamientos y
 *   ninguna linea sin precio. Cifras escritas a mano que nadie cotejaba
 *   (17 de octubre de 2026; Jerome: que se cuenten).
 *
 * COMO
 *   Cada frase del README que dice una cifra del estado de hoy se busca aqui
 *   y su cifra se compara con la que sale de contar: places[], la red,
 *   frases.json, las tablas de idioma, supabase/*.sql, el workflow... Si la
 *   frase ya no esta (alguien la reescribio), tambien suspende: una cifra que
 *   este control no mira es una cifra que se puede quedar vieja otra vez. Lo
 *   que lleva fecha («medido el ...») es de ese dia y no se coteja.
 *
 *     node tools/auditar_readme.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { PLACES, LINES, CAT, RAIZ } = require('./cargar');
const R = require('./rotulos_app');

const md = fs.readFileSync(path.join(RAIZ, 'README.md'), 'utf8');
const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
const leer = f => fs.readFileSync(path.join(RAIZ, f), 'utf8');

const PALABRA = ['cero', 'una', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho',
                 'nueve', 'diez', 'once', 'doce'];
const palabra = s => PALABRA.indexOf(String(s).toLowerCase());
const cifra = s => Number(String(s).replace(/\./g, ''));     // «2.514» -> 2514
const sinTildes = s => String(s).normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

let mal = 0;
const ver = (que, dice, cuenta) => {
  const ok = dice !== null && dice !== undefined && String(dice) === String(cuenta);
  if (!ok) mal++;
  console.log((ok ? '  OK   ' : '  MAL  ') + que.padEnd(50, '.') + ' README '
              + (dice === null || dice === undefined ? '(no encuentro la frase)' : dice) + ' · contado ' + cuenta);
};
/* las frases se buscan con los saltos de linea y los espacios de mas
   aplanados: el README parte las frases donde le cabe la linea */
const plano = md.replace(/\s+/g, ' ');
const frase = re => re.exec(plano);

console.log('=== las cifras del README, contra lo que hay ===');

/* ── los idiomas ── */
const IDIOMAS = ((html.match(/SUPPORTED_LANGS\s*=\s*\[([^\]]*)\]/) || [, ''])[1])
  .split(',').map(x => x.trim()).filter(Boolean).length;
let m = frase(/traducida a (\w+) idiomas/);
ver('idiomas de la app («traducida a …»)', m && palabra(m[1]), IDIOMAS);
m = frase(/Los otros (\w+) idiomas/);
ver('idiomas que no son el castellano', m && palabra(m[1]), IDIOMAS - 1);
m = frase(/\*\*Los (\w+) idiomas\*\*/);
ver('idiomas que hay que mirar antes de dar algo por bueno', m && palabra(m[1]), IDIOMAS);

/* ── la tabla de ficheros ── */
m = frase(/y dentro los ([\d.]+) lugares/);
ver('lugares en index.html', m && cifra(m[1]), PLACES.length);
m = frase(/las ([\d.]+) líneas y las ([\d.]+) marquesinas/);
ver('líneas en datos/titsa.js', m && cifra(m[1]), LINES.length);
ver('marquesinas en datos/titsa.js', m && cifra(m[2]), Object.keys(CAT).length);
const FRASES = JSON.parse(leer('frases.json'));
m = frase(/Las ([\d.]+) frases de la notificación diaria/);
ver('frases de la notificación diaria', m && cifra(m[1]), (FRASES.frases || []).length);
const versionLeaflet = ((leer('vendor/leaflet.js').slice(0, 400).match(/Leaflet (\d+\.\d+\.\d+)/) || [])[1]) || '(sin version en vendor/leaflet.js)';
m = frase(/Leaflet (\d+\.\d+\.\d+) y Leaflet\.markercluster/);
ver('versión de Leaflet en vendor/', m && m[1], versionLeaflet);

/* ── las categorias ── */
const BASE = R.grab('const categoriesBase = {');
const GRUPOS = R.grab('const CAT_GROUPS = [');
const LANGS = R.grab('const LANGS = {');
m = frase(/Reparto actual: ([\d.]+) categorías en ([\d.]+) pestañas de filtro/);
ver('categorías', m && cifra(m[1]), Object.keys(BASE).length);
ver('pestañas del filtro de categorías', m && cifra(m[2]), GRUPOS.length);
{
  /* «gasolineras (211), playas (74) … y supermercados (36)»: cada nombre es
     el de la categoria en castellano, cada cifra se cuenta, y tienen que ser
     de verdad las que mas lugares tienen, en ese orden. */
  m = frase(/Las que más lugares tienen, contando solo la categoría principal de cada uno: ([^.]+)\./);
  const porCat = {};
  PLACES.forEach(p => porCat[p.category] = (porCat[p.category] || 0) + 1);
  const nombreDe = {};
  for (const [k, v] of Object.entries(LANGS.es.categories)) nombreDe[sinTildes(v)] = k;
  if (!m) ver('las categorías con más lugares', null, '');
  else {
    const pares = [...m[1].matchAll(/([^,()]+?)\s*\((\d+)\)/g)]
      .map(x => [x[1].replace(/^\s*y\s+/, '').trim(), Number(x[2])]);
    for (const [nombre, n] of pares) {
      const k = nombreDe[sinTildes(nombre)];
      ver('lugares de «' + nombre + '»', n, k ? (porCat[k] || 0) : '(no es una categoría)');
    }
    const orden = Object.values(porCat).sort((a, b) => b - a);
    const dichas = pares.map(x => x[1]);
    ver('son las ' + pares.length + ' con más lugares, de más a menos', dichas.join(' > '),
        orden.slice(0, pares.length).join(' > '));
  }
}

/* ── las tablas de idioma ── */
const clavesEs = Object.keys(LANGS.es).length;
const desiguales = Object.keys(LANGS).filter(L => Object.keys(LANGS[L]).length !== clavesEs);
m = frase(/(\d+) claves de interfaz por idioma/);
ver('claves de LANGS por idioma', m && cifra(m[1]), desiguales.length ? 'distintas en ' + desiguales.join(', ') : clavesEs);
m = frase(/el nombre de\s+las (\d+) categorías/);
ver('categorías con nombre en LANGS', m && cifra(m[1]), Object.keys(LANGS.es.categories).length);

/* ── la red ── */
const tranvia = LINES.filter(l => l.tipo === 'tranvia');
m = frase(/`TITSA_LINES` tiene \*\*([\d.]+) líneas y ([\d.]+) paradas\*\*: las ([\d.]+) del GTFS oficial de\s+TITSA más (L\d+) y (L\d+) del tranvía/);
ver('líneas de TITSA_LINES', m && cifra(m[1]), LINES.length);
ver('paradas de TITSA_LINES', m && cifra(m[2]), LINES.reduce((a, l) => a + l.paradas.length, 0));
ver('líneas del GTFS (las que no son tranvía)', m && cifra(m[3]), LINES.length - tranvia.length);
ver('las del tranvía', m && m[4] + ' y ' + m[5], tranvia.map(l => l.numero).join(' y '));
m = frase(/catálogo de\s+([\d.]+) marquesinas físicas/);
ver('marquesinas del catálogo', m && cifra(m[1]), Object.keys(CAT).length);
m = frase(/Son ([\d.]+) puntos entre\s+las ([\d.]+)/);
ver('puntos del trazado (via)', m && cifra(m[1]), LINES.reduce((a, l) => a + (l.via || []).length, 0));
ver('líneas con trazado', m && cifra(m[2]), LINES.filter(l => (l.via || []).length).length);
m = frase(/\*\*Todas las líneas llevan `precio`\.\*\*/);
ver('líneas sin precio', m ? 0 : null, LINES.filter(l => !l.precio).length);
m = frase(/en las ([\d.]+) que llevan\s+`precioDesde`/);
ver('líneas con precio «desde»', m && cifra(m[1]), LINES.filter(l => l.precioDesde).length);
m = frase(/las otras ([\d.]+) llevan/);
ver('líneas con su importe', m && cifra(m[1]), LINES.filter(l => !l.precioDesde).length);
{
  const veces = {};
  LINES.forEach(l => veces[l.numero] = (veces[l.numero] || 0) + 1);
  m = frase(/Hoy no hay ningún número compartido por dos líneas/);
  ver('números de línea compartidos', m ? 0 : null, Object.values(veces).filter(n => n > 1).length);
}
m = frase(/se agrupan en el panel por `tipo`: ((?:`\w+`(?:,\s+|\s+y\s+)?)+)\./);
ver('tipos de línea', m && [...m[1].matchAll(/`(\w+)`/g)].map(x => x[1]).sort().join(' '),
    [...new Set(LINES.map(l => l.tipo))].sort().join(' '));

/* ── servicios, Supabase y el aviso diario ── */
const MAR_COSTAS = R.grab('var MAR_COSTAS = [');
m = frase(/Estado del mar en (\d+) costas/);
ver('costas del panel del mar', m && cifra(m[1]), MAR_COSTAS.length);
{
  /* las tablas que dice el README son las de su propia tabla, y en ella
     tiene que estar cada una de las que crea supabase/*.sql */
  const ini = md.indexOf('| Tabla | Quién puede leer |');
  const filas = ini < 0 ? [] : md.slice(ini).split('\n\n')[0].split('\n').slice(2);
  const enReadme = filas.flatMap(f => [...(f.split('|')[1] || '').matchAll(/`(\w+)`/g)].map(x => x[1]));
  const sql = fs.readdirSync(path.join(RAIZ, 'supabase')).filter(f => f.endsWith('.sql'))
    .flatMap(f => [...leer('supabase/' + f).matchAll(/create table (?:if not exists )?(?:public\.)?(\w+)/gi)].map(x => x[1]));
  const faltan = [...new Set(sql)].filter(t => !enReadme.includes(t));
  m = frase(/(\w+) tablas\. El esquema/);
  ver('tablas de Supabase', m && palabra(m[1]), enReadme.length);
  ver('tablas de supabase/*.sql que faltan en el README', faltan.length ? faltan.join(', ') : 0, 0);
}
{
  const yml = leer('.github/workflows/notificacion-diaria.yml');
  const crons = [...yml.matchAll(/^\s*-\s*cron:\s*'(\d+) (\d+) \* \* \*'/gm)]
    .map(x => String(x[2]).padStart(2, '0') + ':' + String(x[1]).padStart(2, '0')).sort();
  m = frase(/se lanza (\w+) veces, de las (\d\d:\d\d) a las (\d\d:\d\d) UTC/);
  ver('lanzamientos del aviso diario', m && palabra(m[1]), crons.length);
  ver('el primero y el último (UTC)', m && m[2] + ' y ' + m[3], crons[0] + ' y ' + crons[crons.length - 1]);
  const horas = ((leer('enviar-notificacion.js').match(/TARGET_HOURS\s*=\s*\(process\.env\.TARGET_HOURS \|\| '([\d,]+)'\)/) || [])[1] || '')
    .split(',').filter(Boolean).map(Number);
  m = frase(/ventana \(de (\d+) a (\d+) h en Canarias\)/);
  ver('la ventana del envío (hora de Canarias)', m && m[1] + '-' + m[2],
      horas.length ? Math.min(...horas) + '-' + (Math.max(...horas) + 1) : '(sin TARGET_HOURS)');
}

console.log(mal ? '\n*** ' + mal + ' cifra(s) del README que no son las de hoy ***'
                : '\nel README dice las cifras de hoy');
process.exit(mal ? 1 : 0);
