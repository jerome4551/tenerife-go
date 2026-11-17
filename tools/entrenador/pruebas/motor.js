/* motor.js — el módulo del entrenador entero, sin navegador (16 de noviembre de 2026).
   Desde que las coreografías van por trozos, modulos/entrenador.js solo trae el motor y las del bloque 1: las demás están en
   modulos/entrenador/<grupo>.<huella>.js y en la app se piden al abrir una ficha. Las herramientas de Node las quieren
   todas: esto corre el motor y, detrás, cada uno de sus trozos (los que él nombra: TG_ENTRENADOR.trozos()).

     const { carga } = require('./motor.js');
     const E = carga(caja);              // caja: lo que el módulo ve como global (window, document…); devuelve TG_ENTRENADOR
     const E = carga(caja, fichero);     // otro modulos/entrenador.js (sus trozos, en la carpeta de al lado con su nombre)
     carga(caja, fichero, false)         // solo el motor, sin los trozos */
'use strict';
const vm = require('vm'), fs = require('fs'), path = require('path');
const RAIZ = path.join(__dirname, '..', '..', '..');
const MODULO = path.join(RAIZ, 'modulos', 'entrenador.js');
/* los ficheros de los trozos de un motor ya cargado */
function ficherosDe(E, fichero) {
  const f = fichero || MODULO, dir = f.replace(/\.js$/, '');
  return typeof E.trozos === 'function' ? E.trozos().map(n => path.join(dir, n + '.js')) : [];
}
function carga(caja, fichero, conTrozos) {
  const f = fichero || MODULO, ctx = vm.createContext(caja);
  vm.runInContext(fs.readFileSync(f, 'utf8'), ctx, { filename: 'modulos/entrenador.js' });
  const E = caja.window.TG_ENTRENADOR;
  if (conTrozos !== false) ficherosDe(E, f).forEach(t => vm.runInContext(fs.readFileSync(t, 'utf8'), ctx, { filename: 'modulos/entrenador/' + path.basename(t) }));
  return E;
}
module.exports = { carga, ficherosDe, RAIZ, MODULO };
