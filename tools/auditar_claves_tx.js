#!/usr/bin/env node
/* auditar_claves_tx.js — que toda fila que el codigo pide con tx() exista.
 *
 *     node tools/auditar_claves_tx.js
 *
 * POR QUE EXISTE. tx('clave') devuelve '' si la fila no esta en UI_TX, sin
 * avisar: el texto desaparece de la pantalla y ningun control de idioma lo
 * ve, porque esos miran las filas que hay, no las que faltan. El 12 de
 * octubre de 2026, al quitar la frase falsa de la guagua del Teide
 * (busYaSalio), se fue con ella busSinConexion, que iba en la misma linea:
 * «No hay líneas que conecten estos dos puntos» se quedaba en blanco.
 *
 * QUE MIRA: cada tx('…'), tx("…") y dpT('…') con la clave escrita tal cual
 * en index.html, y cada data-tx-hueco="…" (frases con un enlace dentro). Las que se arman en tiempo de ejecucion (tx(k), tx('a' + b))
 * no se pueden mirar asi y no cuentan.
 */
'use strict';
const fs = require('fs'), path = require('path');
const ROT = require('./rotulos_app');
const src = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

const UI = ROT.UI;
const DPUI = ROT.grab('const DP_UI = {');
const pedidas = new Map();
for (const m of src.matchAll(/\b(tx|dpT)\(\s*(['"])([A-Za-z0-9_]+)\2\s*[,)]/g)) {
  const [, fn, , clave] = m;
  const k = fn + ':' + clave;
  if (!pedidas.has(k)) pedidas.set(k, { fn, clave, linea: src.slice(0, m.index).split('\n').length });
}
/* Y las frases con un enlace dentro (data-tx-hueco, 16 de octubre de 2026):
   la app las rehace con tx(), asi que una fila que falte las deja en
   castellano sin avisar, igual que un tx() suelto. */
for (const m of src.matchAll(/data-tx-hueco="([A-Za-z0-9_]+)"/g)) {
  const k = 'tx:' + m[1];
  if (!pedidas.has(k)) pedidas.set(k, { fn: 'tx', clave: m[1], linea: src.slice(0, m.index).split('\n').length });
}
const faltan = [...pedidas.values()].filter(p => p.fn === 'tx' ? !UI[p.clave] : !DPUI[p.clave]);
const P = (t, v) => console.log('  ' + String(t).padEnd(46, '.') + ' ' + v);
console.log('=== filas que el codigo pide con tx() ===');
P('claves pedidas con el nombre escrito', pedidas.size);
P('filas en UI_TX', Object.keys(UI).length);
P('pedidas que no existen', faltan.length);
faltan.forEach(f => console.log('       ' + f.fn + "('" + f.clave + "') en la linea " + f.linea + ': no hay esa fila'));
process.exit(faltan.length ? 1 : 0);
