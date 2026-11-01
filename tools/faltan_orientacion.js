#!/usr/bin/env node
/* Las 66 playas y charcos que no estan en PLAYAS_ORIENTACION.
 *
 * Se genera, no se escribe a mano: en cuanto entre una orientacion nueva la
 * lista se queda corta sola y basta con volver a lanzarlo.
 *
 *     node tools/faltan_orientacion.js            > por pantalla
 *     node tools/faltan_orientacion.js --md       > tabla markdown
 *
 * El municipio NO esta en places[]: sale de la marquesina de TITSA mas
 * cercana, que si lo trae. Por eso se imprime siempre la distancia: a 4 km de
 * la parada mas cercana el municipio es una pista, no un dato, y quien
 * rellene la orientacion tiene que poder verlo.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { PLACES, CAT } = require('./cargar');

/* La distancia al mar se mide contra el anillo de costa de GSHHG, que es
   solo mar -la capa `water` de OSM incluye balsas y embalses, y por eso dio
   por bueno un charco que estaba a 10 km del Atlantico-. Es tosca, 250-500 m
   en las calas, y para esto sirve: dice si el pin esta en la costa o no.
   Al SEGMENTO, nunca al vertice. */
const COSTA = (function () {
  const c = JSON.parse(fs.readFileSync(path.join(path.dirname(__dirname), 'tools', 'datos', 'costa_tenerife.json'), 'utf8'));
  const a0 = c.anillo[0];
  // por el SIGNO: en Tenerife lat es 27-29 y lng -16 a -17, las dos pasan de
  // 20, asi que un umbral de magnitud se equivoca.
  const latPrimero = a0[0] > 0 && a0[1] < 0;
  const R = 6371000, lat0 = 28.3, r = Math.PI / 180;
  const xy = (la, lo) => [lo * r * R * Math.cos(lat0 * r), la * r * R];
  const aro = c.anillo.map(q => (latPrimero ? xy(q[0], q[1]) : xy(q[1], q[0])));
  return function (la, lo) {
    const p = xy(la, lo);
    let mejor = Infinity;
    for (let i = 0; i < aro.length; i++) {
      const a = aro[i], b = aro[(i + 1) % aro.length];
      const dx = b[0] - a[0], dy = b[1] - a[1];
      let d;
      if (dx === 0 && dy === 0) d = Math.hypot(p[0] - a[0], p[1] - a[1]);
      else {
        const t = Math.max(0, Math.min(1, ((p[0]-a[0])*dx + (p[1]-a[1])*dy) / (dx*dx + dy*dy)));
        d = Math.hypot(p[0] - (a[0] + t*dx), p[1] - (a[1] + t*dy));
      }
      if (d < mejor) mejor = d;
    }
    return mejor;
  };
})();

const RAIZ = path.dirname(__dirname);
const src = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');

function objetoTras(marca) {
  const o = src.indexOf('{', src.indexOf(marca));
  let d = 0, q = null;
  for (let k = o; k < src.length; k++) {
    const c = src[k], p = src[k - 1];
    if (q) { if (c === q && p !== '\\') q = null; continue; }
    if (c === '"' || c === "'" || c === '`') { q = c; continue; }
    if (c === '{') d++;
    else if (c === '}') { d--; if (!d) return eval('(' + src.slice(o, k + 1) + ')'); }
  }
  return null;
}
const ORI = objetoTras('const PLAYAS_ORIENTACION');

const km = (a, b, c, d) => {
  const R = 6371, r = Math.PI / 180;
  const x = (c - a) * r, y = (d - b) * r * Math.cos((a + c) / 2 * r);
  return Math.sqrt(x * x + y * y) * R;
};
function municipio(p) {
  let mejor = null, dmin = Infinity;
  for (const s of Object.values(CAT)) {
    const d = km(p.lat, p.lng, s.la, s.lo);
    if (d < dmin) { dmin = d; mejor = s; }
  }
  return { m: mejor.m, d: Math.round(dmin * 1000), parada: mejor.n };
}

const banio = PLACES.filter(p => p.category === 'playa' || p.category === 'piscinas');
const faltan = banio.filter(p => !ORI[p.id]);
const filas = faltan.map(p => {
  const mu = municipio(p);
  return {
    id: p.id, nombre: p.name,
    tipo: p.category === 'piscinas' ? 'charco' : 'playa',
    lat: p.lat, lng: p.lng,
    municipio: mu.m, mDist: mu.d, parada: mu.parada,
    agua: p.aguaCalidad || '', anio: p.aguaCalidadAnio || '',
    aviso: p.warn || '',
    socorrista: p.lifeguard === true ? 'si' : p.lifeguard === false ? 'no' : '?',
    bandera: p.blueFlag === true ? 'si' : '',
    mar: Math.round(COSTA(p.lat, p.lng))
  };
}).sort((a, b) => a.municipio.localeCompare(b.municipio, 'es') || a.nombre.localeCompare(b.nombre, 'es'));

if (process.argv.includes('--md')) {
  const L = [];
  L.push('| # | punto | tipo | municipio | coordenadas | al mar | agua | socorr. | aviso | mira a… | vientos malos |');
  L.push('|---:|---|---|---|---|---:|---|:---:|---|---|---|');
  filas.forEach((f, i) => L.push('| ' + (i + 1) + ' | **' + f.nombre + '**<br><code>' + f.id + '</code> | ' +
    f.tipo + ' | ' + f.municipio + (f.mDist > 1500 ? ' ⚠️' : '') + ' | `' + f.lat + ', ' + f.lng + '` | ' +
    (f.mar > 2000 ? '**' + (f.mar/1000).toFixed(1) + ' km** ⛔' : f.mar + ' m') + ' | ' +
    (f.agua ? f.agua + ' ' + f.anio : '—') + ' | ' + f.socorrista + ' | ' +
    (f.aviso ? '⚠️ ' + f.aviso : '—') + ' | ☐ | ☐ |'));
  console.log(L.join('\n'));
} else {
  console.log('puntos de baño: %d · con orientación: %d · sin ella: %d',
    banio.length, banio.length - faltan.length, faltan.length);
  console.log('  de las que faltan: %d playas · %d charcos',
    filas.filter(f => f.tipo === 'playa').length, filas.filter(f => f.tipo === 'charco').length);
  const lejos = filas.filter(f => f.mDist > 1500);
  console.log('  municipio a más de 1,5 km de la parada más cercana (pista, no dato): %d', lejos.length);
  lejos.forEach(f => console.log('      %s  %s  a %d m de «%s»', f.id.padEnd(26), f.municipio, f.mDist, f.parada));
  console.log();
  let actual = '';
  for (const f of filas) {
    if (f.municipio !== actual) { actual = f.municipio; console.log('── ' + actual); }
    console.log('   %s %s  %s  %s%s',
      (f.tipo === 'charco' ? '○' : '●'), f.id.padEnd(28), (f.lat + ', ' + f.lng).padEnd(22), f.nombre,
      f.mar > 2000 ? '   <-- A ' + (f.mar/1000).toFixed(1) + ' km DEL MAR' : '');
  }
}
