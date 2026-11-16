#!/usr/bin/env node
/* probar_socorristas.js — el horario de los socorristas que enseña la ficha de una playa (16 de noviembre de 2026).
 *
 *     node tools/probar_socorristas.js
 *
 * Lee de index.html la tabla SOCORRISTAS y las funciones que deciden qué se enseña (fechaCanaria, socDiasEntre,
 * socHorasHoy, estadoSocorristas, horaCanaria) y las corre con el reloj puesto en un instante dado, sin navegador.
 * Mira:
 *   · que las fichas renovadas con el visor oficial del Gobierno de Canarias (16-11-2026: del 16/09/2026 al
 *     31/12/2026, de lunes a domingo, de 10:00 a 18:00) dicen el horario con su fecha de revisión y su «hasta»;
 *   · que un horario no se dice antes de su «desde» ni después de su «hasta» (el periodo del visor), aunque la
 *     revisión sea reciente, y que un «desde» o un «hasta» mal escrito hace que no se diga nada;
 *   · que lo que el visor no confirma (La Caleta de Adeje y las tres piscinas de La Laguna) caduca como estaba
 *     previsto: a los SOC_VIDA_DIAS de su revisión de agosto deja de decirse.
 * Sale con 1 si algo falla. */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const ini = html.indexOf('const SOCORRISTAS = {');
const fin = html.indexOf('function badgeSocorristas(');
const hc = html.indexOf('function horaCanaria() {');
if (ini < 0 || fin < 0 || hc < 0 || fin < ini) { console.error('PARADO: no encuentro SOCORRISTAS y sus funciones en index.html'); process.exit(2); }
/* horaCanaria(), entera: de su «{» a su pareja */
let i = html.indexOf('{', hc), prof = 0;
for (; i < html.length; i++) { const c = html[i]; if (c === '{') prof++; else if (c === '}' && --prof === 0) break; }
const codigo = html.slice(ini, fin) + '\n' + html.slice(hc, i + 1);

let AHORA = 0;
class Reloj extends Date {
  constructor(...a) { if (a.length) super(...a); else super(AHORA); }
  static now() { return AHORA; }
}
const ctx = vm.createContext({ Date: Reloj, Intl, console });
vm.runInContext(codigo, ctx, { filename: 'index.html (SOCORRISTAS)' });
const corre = (instante, js) => { AHORA = Date.parse(instante); return vm.runInContext(js, ctx); };

let malos = 0, n = 0;
const prueba = (nombre, ok, detalle) => { n++; if (!ok) malos++; console.log((ok ? '  OK  ' : '  MAL ') + nombre + (ok ? '' : '   -> ' + detalle)); };
const estado = (id, instante) => corre(instante, 'estadoSocorristas({ id: ' + JSON.stringify(id) + ' })');

console.log('=== el horario de los socorristas ===');
const RENOVADAS = ['las-vistas', 'playa-camison', 'el-duque', 'playa-americas', 'fanabe', 'playa-callao', 'playa-torviscas'];
const S = corre('2026-11-16T12:00:00Z', 'JSON.parse(JSON.stringify(SOCORRISTAS))');
for (const id of RENOVADAS) {
  const s = S[id] || {};
  prueba(id + ': renovada con el visor (revisado 2026-11-16, hasta 2026-12-31, 10:00-18:00, todos los días)',
    s.revisado === '2026-11-16' && s.hasta === '2026-12-31' && s.h1 === '10:00' && s.h2 === '18:00' && JSON.stringify(s.dias) === '[0,1,2,3,4,5,6]',
    JSON.stringify(s));
}
/* Hora canaria en noviembre y diciembre = UTC (WET). */
for (const id of RENOVADAS) {
  prueba(id + ': el 20 de noviembre a las 12:00, «ahora»', estado(id, '2026-11-20T12:00:00Z') === 'ahora', estado(id, '2026-11-20T12:00:00Z'));
  prueba(id + ': el 20 de noviembre a las 19:30, el horario', estado(id, '2026-11-20T19:30:00Z') === 'horario', estado(id, '2026-11-20T19:30:00Z'));
  prueba(id + ': el 31 de diciembre a las 17:59, «ahora»', estado(id, '2026-12-31T17:59:00Z') === 'ahora', estado(id, '2026-12-31T17:59:00Z'));
  prueba(id + ': el 1 de enero de 2027, nada (se acabó el periodo del visor)', estado(id, '2027-01-01T12:00:00Z') === null, estado(id, '2027-01-01T12:00:00Z'));
}
/* El verano de Arona (15/06 a 15/09, hasta las 19:00) no se cuela fuera de su ventana. */
prueba('las-vistas: el 20 de noviembre, las horas de hoy son 10:00-18:00, no las del verano',
  JSON.stringify(corre('2026-11-20T12:00:00Z', 'socHorasHoy(SOCORRISTAS["las-vistas"], "2026-11-20")')) === '{"h1":"10:00","h2":"18:00"}',
  JSON.stringify(corre('2026-11-20T12:00:00Z', 'socHorasHoy(SOCORRISTAS["las-vistas"], "2026-11-20")')));

/* desde y hasta, con una ficha de prueba revisada hoy: la revisión reciente no basta */
corre('2026-11-16T12:00:00Z', 'SOCORRISTAS["prueba-hasta"] = { h1:"10:00", h2:"18:00", dias:[0,1,2,3,4,5,6], revisado:"2026-11-16", hasta:"2026-11-15" };' +
  'SOCORRISTAS["prueba-desde"] = { h1:"10:00", h2:"18:00", dias:[0,1,2,3,4,5,6], revisado:"2026-11-16", desde:"2026-11-20" };' +
  'SOCORRISTAS["prueba-mal"] = { h1:"10:00", h2:"18:00", dias:[0,1,2,3,4,5,6], revisado:"2026-11-16", hasta:"31/12/2026" };' +
  'SOCORRISTAS["prueba-mal2"] = { h1:"10:00", h2:"18:00", dias:[0,1,2,3,4,5,6], revisado:"2026-11-16", desde:"16-09-2026" };' +
  'SOCORRISTAS["prueba-bien"] = { h1:"10:00", h2:"18:00", dias:[0,1,2,3,4,5,6], revisado:"2026-11-16", desde:"2026-09-16", hasta:"2026-12-31" };');
prueba('después de su «hasta», nada aunque la revisión sea de hoy', estado('prueba-hasta', '2026-11-16T12:00:00Z') === null, estado('prueba-hasta', '2026-11-16T12:00:00Z'));
prueba('antes de su «desde», nada', estado('prueba-desde', '2026-11-16T12:00:00Z') === null, estado('prueba-desde', '2026-11-16T12:00:00Z'));
prueba('y desde su «desde», el horario', estado('prueba-desde', '2026-11-20T12:00:00Z') === 'ahora', estado('prueba-desde', '2026-11-20T12:00:00Z'));
prueba('un «hasta» mal escrito: nada', estado('prueba-mal', '2026-11-16T12:00:00Z') === null, estado('prueba-mal', '2026-11-16T12:00:00Z'));
prueba('un «desde» mal escrito: nada', estado('prueba-mal2', '2026-11-16T12:00:00Z') === null, estado('prueba-mal2', '2026-11-16T12:00:00Z'));
prueba('dentro de su «desde» y su «hasta», el horario', estado('prueba-bien', '2026-11-16T12:00:00Z') === 'ahora', estado('prueba-bien', '2026-11-16T12:00:00Z'));
prueba('y el último día de su «hasta», todavía', estado('prueba-bien', '2026-12-31T12:00:00Z') === 'ahora', estado('prueba-bien', '2026-12-31T12:00:00Z'));

/* lo que el visor no confirma caduca como estaba previsto (revisado en agosto + SOC_VIDA_DIAS) */
const vida = corre('2026-11-16T12:00:00Z', 'SOC_VIDA_DIAS');
for (const id of ['playa-la-caleta-adeje', 'piscinas-bajamar', 'punta-hidalgo', 'piscina-jover-tejina']) {
  const s = S[id] || {};
  prueba(id + ': sin renovar (el visor del 16-11 no da socorristas ahí): revisado en agosto', /^2026-08-/.test(s.revisado || ''), JSON.stringify(s));
  prueba(id + ': el 20 de noviembre ya no se dice (' + vida + ' días desde la revisión)', estado(id, '2026-11-20T12:00:00Z') === null, estado(id, '2026-11-20T12:00:00Z'));
}
prueba('una playa sin fila en la tabla: nada', estado('playa-que-no-esta', '2026-11-16T12:00:00Z') === null, '');

console.log('\n  ' + n + ' controles' + (malos ? ', ' + malos + ' MAL' : ', todos en verde'));
process.exit(malos ? 1 : 0);
