// tools/probar_fechas_oro.js — el motor de fechas de los avatares de oro (modulos/avatares.js), sin navegador.
//   node tools/probar_fechas_oro.js [ruta de avatares.js]   (por defecto, modulos/avatares.js)
// Es pruebas/fechas.test.js de la entrega de los de oro (23 de octubre de 2026), igual salvo
// estas tres lineas y la ruta por defecto. Lo lanza tools/auditar.sh.
// Toma el motor de avatares.js (desde «var INDICE» hasta el final) y lo prueba con reglas
// de ejemplo de cada tipo. Esperado: FECHAS EN VERDE.
const fs = require('fs'), path = require('path');
const ruta = process.argv[2] || path.join(__dirname, '..', 'modulos', 'avatares.js');
const src = fs.readFileSync(ruta, 'utf8'), ini = src.indexOf('  var INDICE = {}');
if (ini < 0) { console.log('No encuentro el motor («var INDICE») en ' + ruta); process.exit(1); }
const rt = src.slice(ini);
const SETS = [{ id: 'xx', bandera: 'x', color: '#000000', avatares: [
  { id: 'xx-pascua', a: 'bote', oro: { tipo: 'pascua', desfase: 0 }, g: ['#000000', '#FFFFFF'], m: '' },
  { id: 'xx-orto', a: 'bote', oro: { tipo: 'pascua-ortodoxa', desfase: 0 }, g: ['#000000', '#FFFFFF'], m: '' },
  { id: 'xx-midsommar', a: 'bote', oro: { tipo: 'entre', mes: 6, desde: 19, hasta: 25, semana: 5 }, g: ['#000000', '#FFFFFF'], m: '' },
  { id: 'xx-rey', a: 'bote', oro: { tipo: 'fija', mes: 4, dia: 27, si_domingo: -1 }, g: ['#000000', '#FFFFFF'], m: '' },
  { id: 'xx-vyshyvanka', a: 'bote', oro: { tipo: 'enesimo', mes: 5, n: 3, semana: 4 }, g: ['#000000', '#FFFFFF'], m: '' },
  { id: 'xx-ultimo', a: 'bote', oro: { tipo: 'enesimo', mes: 8, n: -1, semana: 3 }, g: ['#000000', '#FFFFFF'], m: '' },
  { id: 'xx-nochevieja', a: 'bote', oro: { tipo: 'fija', mes: 12, dia: 31, dias: 2 }, g: ['#000000', '#FFFFFF'], m: '' },
  { id: 'xx-tabla', a: 'bote', oro: { tipo: 'tabla', fechas: { '2026': '02-17', '2027': '02-06' } }, g: ['#000000', '#FFFFFF'], m: '' },
  { id: 'xx-carnaval', a: 'bote', oro: { tipo: 'pascua', desfase: -50, dias: 4 }, g: ['#000000', '#FFFFFF'], m: '' },
  { id: 'xx-excepcion', a: 'bote', oro: { tipo: 'pascua', desfase: -49, dias: 3, excepciones: { '2027': '02-21' } }, g: ['#000000', '#FFFFFF'], m: '' },
] }];
global.window = {};
eval("(function () { 'use strict'; var SETS = " + JSON.stringify(SETS) + ";\n" + rt);
const A = window.TG_AVATARES;
let fallos = 0;
function igual(nombre, v, esperado) { const ok = JSON.stringify(v) === JSON.stringify(esperado); if (!ok) fallos++; console.log((ok ? 'ok   ' : 'FALLO') + ' ' + nombre + ' → ' + JSON.stringify(v) + (ok ? '' : ' (esperado ' + JSON.stringify(esperado) + ')')); }
// Pascua occidental (las fechas, comprobadas con dateutil.easter de python-dateutil, como todas las de 1990 a 2099)
const PASCUA = { 2024: '2024-03-31', 2025: '2025-04-20', 2026: '2026-04-05', 2027: '2027-03-28', 2028: '2028-04-16', 2029: '2029-04-01', 2030: '2030-04-21', 2031: '2031-04-13', 2032: '2032-03-28', 2033: '2033-04-17', 2034: '2034-04-09', 2035: '2035-03-25', 2038: '2038-04-25', 2045: '2045-04-09' };
for (const y in PASCUA) igual('Pascua ' + y, A.ventana('xx-pascua', +y).desde, PASCUA[y]);
// Pascua ortodoxa (igual, con dateutil.easter(y, EASTER_ORTHODOX))
const ORTO = { 2024: '2024-05-05', 2025: '2025-04-20', 2026: '2026-04-12', 2027: '2027-05-02', 2028: '2028-04-16', 2029: '2029-04-08', 2030: '2030-04-28', 2031: '2031-04-13', 2032: '2032-05-02', 2033: '2033-04-24', 2034: '2034-04-09', 2035: '2035-04-29' };
for (const y in ORTO) igual('Pascua ortodoxa ' + y, A.ventana('xx-orto', +y).desde, ORTO[y]);
igual('Midsommar 2026', A.ventana('xx-midsommar', 2026).desde, '2026-06-19');
igual('Midsommar 2027', A.ventana('xx-midsommar', 2027).desde, '2027-06-25');
igual('Midsommar 2028', A.ventana('xx-midsommar', 2028).desde, '2028-06-23');
igual('Día del Rey 2025 (27 en domingo → 26)', A.ventana('xx-rey', 2025).desde, '2025-04-26');
igual('Día del Rey 2026', A.ventana('xx-rey', 2026).desde, '2026-04-27');
igual('Día del Rey 2031 (domingo → 26)', A.ventana('xx-rey', 2031).desde, '2031-04-26');
igual('3.er jueves de mayo 2026', A.ventana('xx-vyshyvanka', 2026).desde, '2026-05-21');
igual('3.er jueves de mayo 2027', A.ventana('xx-vyshyvanka', 2027).desde, '2027-05-20');
igual('último miércoles de agosto 2026', A.ventana('xx-ultimo', 2026).desde, '2026-08-26');
igual('último miércoles de agosto 2027', A.ventana('xx-ultimo', 2027).desde, '2027-08-25');
igual('Nochevieja 2026, dos días', A.ventana('xx-nochevieja', 2026), { desde: '2026-12-31', hasta: '2027-01-01' });
igual('disponible el 1 de enero (ventana del año anterior)', A.disponible('xx-nochevieja', '2027-01-01'), true);
igual('no disponible el 2 de enero', A.disponible('xx-nochevieja', '2027-01-02'), false);
igual('tabla 2027', A.ventana('xx-tabla', 2027).desde, '2027-02-06');
igual('tabla sin el año → null', A.ventana('xx-tabla', 2030), null);
igual('próxima de la tabla desde 2027-03-01 → ninguna', A.proxima('xx-tabla', '2027-03-01'), null);
igual('próxima desde el día de la fiesta → la de hoy', A.proxima('xx-rey', '2026-04-27'), { desde: '2026-04-27', hasta: '2026-04-27' });
igual('próxima pasada la fiesta → la del año que viene', A.proxima('xx-rey', '2026-04-28'), { desde: '2027-04-27', hasta: '2027-04-27' });
igual('carnaval 2026 (sábado a martes)', A.ventana('xx-carnaval', 2026), { desde: '2026-02-14', hasta: '2026-02-17' });
igual('disponible el martes de carnaval', A.disponible('xx-carnaval', '2026-02-17'), true);
igual('no el miércoles de ceniza', A.disponible('xx-carnaval', '2026-02-18'), false);
igual('excepción 2027 (Santa Cruz: 21-23 de febrero)', A.ventana('xx-excepcion', 2027), { desde: '2027-02-21', hasta: '2027-02-23' });
igual('sin excepción, la regla (2026: 15-17 de febrero)', A.ventana('xx-excepcion', 2026), { desde: '2026-02-15', hasta: '2026-02-17' });
igual('esOro', [A.esOro('xx-rey'), A.esOro('nada')], [true, false]);
// Cambio de hora: en Europa/Madrid el 29-3-2026; la cuenta va en UTC y no se mueve
igual('pascua 2026 + 1 (cambio de hora cerca)', A.ventana('xx-pascua', 2026).hasta, '2026-04-05');
console.log(fallos ? fallos + ' FALLOS' : 'FECHAS EN VERDE');
process.exit(fallos ? 1 : 0);
