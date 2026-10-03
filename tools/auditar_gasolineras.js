#!/usr/bin/env node
/* auditar_gasolineras.js — que no se quede ninguna estacion atras.
 *
 * EL HUECO QUE TAPA
 *   Son 212 estaciones repartidas en 31 sesiones. «No dejar nada atras» no se
 *   consigue acordandose: se consigue con un control que mire el registro
 *   entero cada vez. Si una estacion no esta en la app Y su sesion ya figura
 *   como hecha, es que se quedo por el camino, y eso se pone ROJO.
 *
 * COMO LAS EMPAREJA
 *   Por el IDEESS, que es el identificador oficial de la estacion y lo unico
 *   que no cambia aunque cambien el rotulo, la marca o la direccion. Por eso
 *   cada ficha de gasolinera lo lleva dentro.
 *
 * LO QUE NO MIRA
 *   Si la ficha esta bien escrita: de eso ya se encargan los otros controles.
 *   Esto solo mira que no falte ninguna y que ninguna este dos veces.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { PLACES } = require('./cargar');

const RAIZ = path.join(__dirname, '..');
const P = (t, v) => console.log('  ' + String(t).padEnd(46, '.') + ' ' + v);

const fReg = path.join(RAIZ, 'registro', 'gasolineras-canarias.json');
const fSes = path.join(RAIZ, 'datos', 'gasolineras', 'sesiones.json');
console.log('=== las gasolineras del registro, una por una ===');
if (!fs.existsSync(fReg)) {
  console.log('  no esta registro/gasolineras-canarias.json: lo baja el flujo de Actions');
  process.exit(0);
}
if (!fs.existsSync(fSes)) {
  console.log('  FALLO: no esta datos/gasolineras/sesiones.json, el cuaderno de sesiones');
  process.exit(1);
}
const reg = JSON.parse(fs.readFileSync(fReg, 'utf8').replace(/^﻿/, ''));
const ses = JSON.parse(fs.readFileSync(fSes, 'utf8')).sesiones;

const num = s => Number(String(s == null ? '' : s).replace(',', '.'));
/* La provincia 38 trae tambien La Palma, La Gomera y El Hierro: la misma caja
   que usa auditar_datos.js para los lugares, para no tener dos verdades. */
const deTenerife = e => {
  const la = num(e['Latitud']), lo = num(e['Longitud (WGS84)']);
  return la >= 27.95 && la <= 28.62 && lo >= -16.98 && lo <= -16.05;
};
const esta = (reg.ListaEESSPrecio || []).filter(deTenerife);

const gas = PLACES.filter(p => p.category === 'gasolinera');
const conId = gas.filter(p => p.ideess);
const porId = new Map();
for (const p of conId) {
  if (porId.has(String(p.ideess))) {
    console.log('  FALLO: dos fichas con el mismo IDEESS ' + p.ideess);
  }
  porId.set(String(p.ideess), p);
}

/* Que sesion le toca a cada estacion: la de su municipio. El municipio lo pone
   el poligono, igual que en todo lo demas; aqui se usa el del registro solo
   para elegir la sesion, no para escribir nada. */
const llano = s => (s || '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
  .replace(/^(.*?)\s*\((el|la|los|las)\)$/, '$2 $1');
const sesionDe = new Map();
for (const [k, s] of Object.entries(ses)) if (s.municipio) sesionDe.set(llano(s.municipio), k);

/* EN ESPERA: el registro las trae pero no se dan de alta hasta que Jerome
   confirme que estan abiertas (datos/gasolineras/correcciones-registro.json).
   La DISA de Pedro de Valdivia entro en la sesion 01 aunque el LEEME de las
   capturas decia «no dar de alta sin confirmar que esta operativa»: el aviso
   estaba escrito en prosa y nada lo leia. Ahora es un dato, y si una de estas
   tiene ficha, esto se pone ROJO. */
const fCor = path.join(RAIZ, 'datos', 'gasolineras', 'correcciones-registro.json');
const espera = fs.existsSync(fCor) ? (JSON.parse(fs.readFileSync(fCor, 'utf8')).en_espera || {}) : {};
const colada = Object.keys(espera).filter(i => porId.has(i));
const sinFicha = [], perdidas = [];
for (const e of esta) {
  if (porId.has(String(e.IDEESS))) continue;
  if (espera[String(e.IDEESS)]) continue;
  const k = sesionDe.get(llano(e.Municipio));
  const estado = k ? ses[k].estado : null;
  (estado === 'hecha' ? perdidas : sinFicha).push({ e, k, estado });
}

P('estaciones del registro en Tenerife', esta.length);
P('fichas de gasolinera en la app', gas.length);
P('  de esas, con IDEESS apuntado', conId.length);
P('estaciones que ya tienen ficha', esta.length - sinFicha.length - perdidas.length - Object.keys(espera).length + colada.length);
P('estaciones aun sin ficha, con su sesion pendiente', sinFicha.length);
P('en espera de confirmar que estan abiertas', Object.keys(espera).length);
for (const i of Object.keys(espera)) console.log('      ' + i.padEnd(8) + (espera[i].estacion || ''));
P('EN ESPERA Y CON FICHA (no debia entrar)', colada.length);
P('SE QUEDARON ATRAS (su sesion dice «hecha»)', perdidas.length);
for (const x of perdidas.slice(0, 20)) {
  console.log('      ' + String(x.e.IDEESS).padEnd(8) + (x.e['Rótulo'] || '?').slice(0, 28).padEnd(30) +
              (x.e.Municipio || '?') + '   sesion ' + (x.k || '(ninguna)'));
}
const hechas = Object.values(ses).filter(s => s.estado === 'hecha').length;
P('sesiones hechas', hechas + ' de ' + Object.keys(ses).length);

const mal = perdidas.length + colada.length;
console.log('\n' + (mal ? '*** ' + [perdidas.length ? perdidas.length + ' estacion(es) se quedaron atras' : '',
                                   colada.length ? colada.length + ' en espera y con ficha: no debia entrar' : '']
                                  .filter(Boolean).join(' · ') + ' ***'
                        : 'ninguna estacion se ha quedado atras ni se ha colado ninguna en espera'));
process.exit(mal ? 1 : 0);
