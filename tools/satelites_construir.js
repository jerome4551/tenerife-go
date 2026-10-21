#!/usr/bin/env node
/* satelites_construir.js — vendor/satellite.js y tools/sgp4_verificacion.json
 * desde sus fuentes con commit fijado (21 de octubre de 2026).
 *
 *     bash tools/satelites_fuentes.sh /tmp/fuentes-satelites
 *     node tools/satelites_construir.js /tmp/fuentes-satelites [--comprobar]
 *
 * QUE HACE
 *   1. Compila satellite.js (shashwatak/satellite-js, MIT, el commit de
 *      tools/satelites_fuentes.sh) con el `tsc` de la maquina, sin la parte
 *      WASM (el panel no la usa), y lo junta en UN fichero sin dependencias
 *      que deja `self.satellite` (y module.exports en Node): el repositorio
 *      no trae ninguna version compilada, y npm no esta al alcance de todas
 *      las maquinas donde se audita esto.
 *   2. Saca de los vectores de verificacion oficiales de SGP4 (SGP4-VER.TLE y
 *      tcppver.out, los del codigo de Vallado, Crawford, Hujsak y Kelso
 *      «Revisiting Spacetrack Report #3», AIAA 2006-6753, tal como los
 *      distribuye python-sgp4) un extracto, tools/sgp4_verificacion.json: de
 *      cada uno de los 33 casos, la posicion y la velocidad TEME en tres
 *      instantes (el primero, uno de en medio y el ultimo). Con el, cualquier
 *      maquina comprueba el motor sin bajar nada (auditar_cielo.js, parte 11).
 *   3. Con --comprobar: no escribe; compara lo que saldria con lo que hay en
 *      el repositorio, byte a byte, y propaga los 33 casos con el motor recien
 *      construido contra TODOS los instantes de tcppver.out.
 *
 * POR QUE WGS72 Y MODO «i». satellite.js fija las constantes WGS72 y el modo
 * «improved» de la referencia de 2006; tcppver.out esta generado asi tambien
 * (python-sgp4 lo coteja a 1e-8 con los mismos ajustes). Se ve en los
 * numeros: 33 casos, todos los instantes, a menos de 1e-6 km.
 */
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), { execFileSync } = require('child_process');
const RAIZ = path.dirname(__dirname);
const args = process.argv.slice(2);
const FUENTES = args.find(a => !a.startsWith('--')) || process.env.FUENTES_SATELITES || '/tmp/fuentes-satelites';
const COMPROBAR = args.includes('--comprobar');
const SATJS = path.join(FUENTES, 'satjs'), PYSGP4 = path.join(FUENTES, 'pysgp4');
const salidaJs = path.join(RAIZ, 'vendor', 'satellite.js');
const salidaLic = path.join(RAIZ, 'vendor', 'LICENSE-satellite.txt');
const salidaVer = path.join(RAIZ, 'tools', 'sgp4_verificacion.json');

function pines() {
  const sh = fs.readFileSync(path.join(RAIZ, 'tools', 'satelites_fuentes.sh'), 'utf8'), out = {};
  for (const m of sh.matchAll(/^traer\s+(\w+)\s+(\S+)\s+([0-9a-f]{40})/gm)) out[m[1]] = { repo: m[2], commit: m[3] };
  return out;
}

/* ── 1. compilar y empaquetar ─────────────────────────────────────────── */
function construirMotor() {
  const P = pines();
  for (const f of ['src/propagation/sgp4.ts', 'LICENSE.md', 'package.json']) if (!fs.existsSync(path.join(SATJS, f))) throw new Error('falta ' + f + ' en ' + SATJS + ': bash tools/satelites_fuentes.sh');
  const version = JSON.parse(fs.readFileSync(path.join(SATJS, 'package.json'), 'utf8')).version;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'satjs-'));
  const src = path.join(tmp, 'src');
  copiar(path.join(SATJS, 'src'), src, p => !/[\\/]wasm([\\/]|$)/.test(p) && !/index\.ts$/.test(p));
  fs.writeFileSync(path.join(src, 'indexNav.ts'), [
    "/* la entrada sin la parte WASM: lo que usa el panel del cielo */",
    "export * as constants from './constants.js';",
    "export { jday, invjday } from './ext.js';",
    "export { twoline2satrec, json2satrec } from './io.js';",
    "export { propagate, sgp4, gstime } from './propagation.js';",
    "export { checkForDecay } from './propagation/check-for-decay.js';",
    "export { dopplerFactor } from './dopplerFactor.js';",
    "export { radiansToDegrees, degreesToRadians, degreesLat, degreesLong, radiansLat, radiansLong, geodeticToEcf, eciToGeodetic, eciToEcf, ecfToEci, ecfToLookAngles } from './transforms.js';",
    "export { sunPos } from './sun.js';",
    "export * from './shadow.js';",
    "export { SatRecError } from './propagation/SatRec.js';", ''].join('\n'));
  fs.writeFileSync(path.join(tmp, 'tsconfig.json'), JSON.stringify({ compilerOptions: {
    ignoreDeprecations: '6.0', target: 'ES2017', module: 'commonjs', moduleResolution: 'node', strict: false, skipLibCheck: true,
    esModuleInterop: true, rootDir: './src', outDir: './out', lib: ['ES2022', 'DOM'], types: [], declaration: false, sourceMap: false, removeComments: false
  }, include: ['src/**/*.ts'] }));
  execFileSync('tsc', ['-p', path.join(tmp, 'tsconfig.json')], { stdio: 'pipe' });
  const out = path.join(tmp, 'out'), modulos = [];
  (function andar(d) { for (const n of fs.readdirSync(d).sort()) { const p = path.join(d, n); if (fs.statSync(p).isDirectory()) andar(p); else if (n.endsWith('.js')) modulos.push(path.relative(out, p).split(path.sep).join('/')); } })(out);
  /* un cargador CommonJS minimo: cada fichero, una funcion; require() resuelve
     las rutas relativas desde la carpeta del que pide */
  let js = '';
  js += '/* vendor/satellite.js — satellite.js ' + version + ' (shashwatak/satellite-js @ ' + P.satjs.commit + '), MIT:\n';
  js += '   vendor/LICENSE-satellite.txt. El motor SGP4/SDP4 (Vallado, Crawford, Hujsak y Kelso, «Revisiting\n';
  js += '   Spacetrack Report #3», AIAA 2006-6753) con las transformaciones TEME/ECF, la posicion del Sol y la\n';
  js += '   sombra de la Tierra, para los pasos de la Estacion Espacial y los satelites brillantes del panel\n';
  js += '   «Cielo de Tenerife». Compilado desde el TypeScript del commit con tsc (sin la parte WASM) y junto\n';
  js += '   en un fichero por tools/satelites_construir.js; se comprueba contra los 33 casos de verificacion\n';
  js += '   oficiales (tools/sgp4_verificacion.json). No se edita a mano: se regenera. */\n';
  js += '(function (raiz) {\n  "use strict";\n  var MOD = {};\n';
  for (const m of modulos) {
    const cuerpo = fs.readFileSync(path.join(out, m), 'utf8');
    js += '  MOD[' + JSON.stringify(m) + '] = function (exports, require, module) {\n' + cuerpo + '\n  };\n';
  }
  js += `  var CACHE = {};
  function normal(p) { var o = []; p.split('/').forEach(function (s) { if (s === '..') o.pop(); else if (s !== '.' && s !== '') o.push(s); }); return o.join('/'); }
  function cargar(ruta) {
    if (CACHE[ruta]) return CACHE[ruta].exports;
    var f = MOD[ruta]; if (!f) throw new Error('satellite.js: no esta ' + ruta);
    var dir = ruta.indexOf('/') >= 0 ? ruta.slice(0, ruta.lastIndexOf('/') + 1) : '';
    var modulo = { exports: {} }; CACHE[ruta] = modulo;
    f(modulo.exports, function (q) { return cargar(normal(dir + q)); }, modulo);
    return modulo.exports;
  }
  var api = cargar('indexNav.js');
  api.version = ${JSON.stringify(version)};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  raiz.satellite = api;
})(typeof self !== 'undefined' ? self : this);
`;
  fs.rmSync(tmp, { recursive: true, force: true });
  const lic = fs.readFileSync(path.join(SATJS, 'LICENSE.md'), 'utf8');
  return { js, lic: lic.endsWith('\n') ? lic : lic + '\n' };
}
function copiar(de, a, filtro) {
  fs.mkdirSync(a, { recursive: true });
  for (const n of fs.readdirSync(de)) {
    const p = path.join(de, n), q = path.join(a, n);
    if (fs.statSync(p).isDirectory()) { if (filtro(p)) copiar(p, q, filtro); }
    else if (filtro(p)) fs.copyFileSync(p, q);
  }
}

/* ── 2. los vectores de verificacion ──────────────────────────────────── */
function leerVerificacion() {
  const tle = fs.readFileSync(path.join(PYSGP4, 'sgp4', 'SGP4-VER.TLE'), 'utf8').split('\n');
  const casos = [];
  for (let i = 0; i < tle.length; i++) {
    if (!tle[i].startsWith('1 ')) continue;
    const l1 = tle[i], l2raw = tle[i + 1];
    const l2 = l2raw.slice(0, 69);
    const extra = l2raw.slice(69).trim().split(/\s+/).map(Number);     // inicio, fin, paso (minutos)
    casos.push({ satnum: l1.slice(2, 7).trim(), l1, l2, inicio: extra[0], fin: extra[1], paso: extra[2] });
  }
  const out = fs.readFileSync(path.join(PYSGP4, 'sgp4', 'tcppver.out'), 'utf8').split('\n');
  /* los casos van en el mismo orden en los dos ficheros, y el 20413 sale dos
     veces (dos epocas distintas): se empareja por orden, no solo por numero */
  let actual = null, desde = 0;
  for (const ln of out) {
    const m = ln.match(/^\s*(\d+)\s+xx/);
    if (m) {
      const i = casos.findIndex((c, k) => k >= desde && (c.satnum === m[1].padStart(5, '0') || c.satnum === m[1]));
      actual = i >= 0 ? casos[i] : null; if (actual) { actual.filas = []; desde = i + 1; }
      continue;
    }
    if (!actual) continue;
    const t = ln.trim().split(/\s+/);
    if (t.length < 7 || isNaN(+t[0])) continue;
    actual.filas.push(t.slice(0, 7).map(Number));              // minutos, x, y, z, vx, vy, vz
  }
  /* el caso 33334 esta ahi para provocar el error 3 (excentricidad media fuera
     de rango): la unica fila que imprime el programa de referencia es el
     ultimo estado del caso anterior, no un resultado. Se guarda como caso de
     error, sin filas que comparar. */
  for (let i = 1; i < casos.length; i++) {
    const c = casos[i], ant = casos[i - 1];
    if (c.filas && c.filas.length === 1 && ant.filas && ant.filas.length && c.filas[0].slice(1).every((x, k) => x === ant.filas[ant.filas.length - 1][k + 1])) { c.filas = []; c.esperaError = 3; }
  }
  return casos.filter(c => c.filas && (c.filas.length || c.esperaError));
}
function extracto(casos) {
  return { fuente: 'SGP4-VER.TLE y tcppver.out de brandon-rhodes/python-sgp4 @ ' + pines().pysgp4.commit + ' (los vectores de verificacion de Vallado, Crawford, Hujsak y Kelso, AIAA 2006-6753)',
           unidades: 'minutos desde la epoca; km y km/s en TEME; constantes WGS72, modo i',
           casos: casos.map(c => { const n = c.filas.length, idx = [0, Math.floor(n / 2), n - 1]; return c.esperaError ? { satnum: c.satnum, l1: c.l1, l2: c.l2, filas: [], esperaError: c.esperaError } : { satnum: c.satnum, l1: c.l1, l2: c.l2, filas: idx.map(i => c.filas[i]) }; }) };
}
function comprobarMotor(js, casos, todas) {
  const m = { exports: {} }; new Function('module', 'exports', 'self', js)(m, m.exports, {});
  const sat = m.exports; let peor = 0, n = 0, fallos = [];
  for (const c of casos) {
    const rec = sat.twoline2satrec(c.l1, c.l2);
    if (c.esperaError) { n++; if (rec.error !== c.esperaError && sat.sgp4(rec, 0) !== null) fallos.push(c.satnum + ': esperaba el error ' + c.esperaError + ' y da ' + rec.error); continue; }
    for (const f of (todas ? c.filas : c.filas.slice(0, 1))) {
      const r = sat.sgp4(rec, f[0]); n++;
      if (!r) { fallos.push(c.satnum + ' @' + f[0] + ': sin resultado (error ' + rec.error + ')'); continue; }
      const d = Math.max(Math.abs(r.position.x - f[1]), Math.abs(r.position.y - f[2]), Math.abs(r.position.z - f[3]));
      const dv = Math.max(Math.abs(r.velocity.x - f[4]), Math.abs(r.velocity.y - f[5]), Math.abs(r.velocity.z - f[6]));
      peor = Math.max(peor, d, dv * 60);
      if (d > 1e-6 || dv > 1e-7) fallos.push(c.satnum + ' @' + f[0] + ': ' + d.toExponential(2) + ' km, ' + dv.toExponential(2) + ' km/s');
    }
  }
  return { n, peor, fallos };
}

/* ── main ───────────────────────────────────────────────────────────── */
const { js, lic } = construirMotor();
const casos = leerVerificacion();
if (casos.length !== 33) throw new Error('esperaba 33 casos de verificacion y hay ' + casos.length);
const ver = JSON.stringify(extracto(casos), null, 1) + '\n';
const prueba = comprobarMotor(js, casos, true);
console.log('motor: ' + prueba.n + ' instantes de 33 casos, desviacion maxima ' + prueba.peor.toExponential(2) + ' km' + (prueba.fallos.length ? '\n  FALLOS:\n  ' + prueba.fallos.slice(0, 10).join('\n  ') : ''));
if (prueba.fallos.length) process.exit(1);
if (COMPROBAR) {
  const mismoJs = fs.existsSync(salidaJs) && fs.readFileSync(salidaJs, 'utf8') === js;
  const mismaLic = fs.existsSync(salidaLic) && fs.readFileSync(salidaLic, 'utf8') === lic;
  const mismoVer = fs.existsSync(salidaVer) && fs.readFileSync(salidaVer, 'utf8') === ver;
  console.log('vendor/satellite.js ' + (mismoJs ? 'igual' : 'DISTINTO') + ' · LICENSE ' + (mismaLic ? 'igual' : 'DISTINTA') + ' · sgp4_verificacion.json ' + (mismoVer ? 'igual' : 'DISTINTO'));
  process.exit(mismoJs && mismaLic && mismoVer ? 0 : 1);
}
fs.writeFileSync(salidaJs, js); fs.writeFileSync(salidaLic, lic); fs.writeFileSync(salidaVer, ver);
console.log('escritos vendor/satellite.js (' + js.length + ' bytes), vendor/LICENSE-satellite.txt y tools/sgp4_verificacion.json (' + casos.length + ' casos)');
