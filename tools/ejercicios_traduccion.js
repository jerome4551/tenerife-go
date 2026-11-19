#!/usr/bin/env node
/* ejercicios_traduccion.js — las fichas de los ejercicios de «Su cuerpo» de un idioma nuevo, ANCLADAS EN EL CASTELLANO.
 *
 *   node tools/ejercicios_traduccion.js ro --probar            dice cuantas fichas casan, cuales han cambiado y cuantas faltan
 *   node tools/ejercicios_traduccion.js ro --probar --lista    y cuales faltan, una a una
 *   node tools/ejercicios_traduccion.js ro                     escribe datos/cuerpo/ejercicios-ro.json (solo si estan todas
 *                                                              y todas casan)
 *   node tools/ejercicios_traduccion.js ro --comprobar         que datos/cuerpo/ejercicios-ro.json es el que saldria hoy
 *
 * Lee idiomas/<lang>-fuente/ejercicios-*.json (los trozos del rumano: bloques R14 a R16). Cada ficha lleva su id, EL
 * CASTELLANO QUE TRADUCE (nombre y pasos, como en datos/cuerpo/ejercicios-es.json) y su traduccion, con los mismos pasos:
 *
 *   { "idioma": "ro", "fichas": [ { "id": "press-banca-barra",
 *       "es": { "nombre": "…", "pasos": ["…", "…"] }, "ro": { "nombre": "…", "pasos": ["…", "…"] } } ] }
 *
 * POR QUE ANCLADAS. datos/cuerpo/ lo rehace el construir.py de «Su cuerpo» desde sus fuentes, que no estan en el repo:
 * si entre la traduccion y la entrega cambia el castellano de una ficha (un paso nuevo, como el pino de la nota 47), la
 * traduccion vieja entraria igual y el video de esa ficha dejaria de salir en ese idioma (el reproductor solo lo pone
 * cuando la ficha y la coreografia tienen los mismos pasos: tools/auditar_entrenador.js). Aqui cada ficha se compara con
 * lo que ejercicios-es.json dice HOY: si su castellano cambio, esa ficha no casa, se dice que parte y NO SE ESCRIBE NADA.
 * Es lo que hace tools/lugares_traduccion.js con las fichas de los lugares.
 *
 * Mientras falten fichas (los bloques que vienen), --probar da 0 si todo lo que hay casa, y sin --probar no se escribe: un
 * idioma a medias no se ofrece (la app pone el castellano de las fichas que faltan). El fichero que escribe tiene la forma
 * de ejercicios-es.json: un objeto id -> [nombre, [pasos]], en el orden del catalogo (datos/cuerpo/ejercicios.json), en
 * una linea, sin salto al final. Despues de cada construir.py de «Su cuerpo», si ese construir.py no escribe este idioma,
 * se vuelve a pasar esta herramienta (--comprobar dice si hace falta).
 */
'use strict';
const fs = require('fs'), path = require('path');
const RAIZ = path.join(__dirname, '..');
const args = process.argv.slice(2);
const L = args.find(a => !a.startsWith('--'));
const PROBAR = args.includes('--probar'), LISTA = args.includes('--lista'), COMPROBAR = args.includes('--comprobar');
if (!/^[a-z]{2,3}$/.test(L || '') || L === 'es') {
  console.error('uso: node tools/ejercicios_traduccion.js <idioma> [--probar [--lista] | --comprobar]'); process.exit(2);
}
const CUERPO = path.join(RAIZ, 'datos', 'cuerpo');
const leer = f => JSON.parse(fs.readFileSync(f, 'utf8'));

/* el catalogo y el castellano de hoy */
const ids = leer(path.join(CUERPO, 'ejercicios.json')).ejercicios.map(e => e.id);
const ES = leer(path.join(CUERPO, 'ejercicios-es.json'));
const enCatalogo = new Set(ids);
const textos = t => t && typeof t.nombre === 'string' && Array.isArray(t.pasos) && t.pasos.every(p => typeof p === 'string');
const limpio = s => s.trim() === s && s.length > 0 && !/ {2}/.test(s);

/* los trozos */
const DIR = path.join(RAIZ, 'idiomas', L + '-fuente');
const ficheros = fs.existsSync(DIR) ? fs.readdirSync(DIR).filter(f => /^ejercicios-[\w-]+\.json$/.test(f)).sort() : [];
if (!ficheros.length) { console.error('no hay idiomas/' + L + '-fuente/ejercicios-*.json'); process.exit(2); }
const tiene = new Map(), malos = [], cambiadas = [], sobran = [], nombres = new Map();
for (const f of ficheros) {
  const D = leer(path.join(DIR, f));
  if (D.idioma !== L || !Array.isArray(D.fichas)) { malos.push(f + ': no es un fichero de ' + L + ' con «fichas»'); continue; }
  let n = 0;
  for (const x of D.fichas) {
    const donde = f + ' · ' + (x && x.id);
    if (!x || typeof x.id !== 'string' || !textos(x.es) || !textos(x[L])) { malos.push(donde + ': sin id, sin castellano o sin texto'); continue; }
    if (tiene.has(x.id)) { malos.push(donde + ': ya estaba en ' + tiene.get(x.id).f); continue; }
    if (!enCatalogo.has(x.id) || !Array.isArray(ES[x.id])) { sobran.push(donde + ': esa ficha ya no esta en el catalogo'); continue; }
    const [nEs, pEs] = ES[x.id], dif = [];
    if (x.es.nombre !== nEs) dif.push('el nombre');
    if (x.es.pasos.length !== pEs.length) dif.push('el numero de pasos (' + x.es.pasos.length + ' entonces, ' + pEs.length + ' hoy)');
    else x.es.pasos.forEach((p, i) => { if (p !== pEs[i]) dif.push('el paso ' + (i + 1)); });
    if (dif.length) { cambiadas.push({ donde, que: dif.join(', ') }); continue; }
    const t = x[L];
    if (t.pasos.length !== pEs.length) { malos.push(donde + ': ' + t.pasos.length + ' pasos y el castellano tiene ' + pEs.length); continue; }
    if (![t.nombre, ...t.pasos].every(limpio)) { malos.push(donde + ': un texto vacio o con espacios de mas'); continue; }
    if (nombres.has(t.nombre)) { malos.push(donde + ': el nombre «' + t.nombre + '» ya lo tiene ' + nombres.get(t.nombre)); continue; }
    nombres.set(t.nombre, x.id);
    tiene.set(x.id, { f, nombre: t.nombre, pasos: t.pasos });
    n++;
  }
  console.log('  ' + f + ': ' + D.fichas.length + ' fichas, ' + n + ' casan');
}
const faltan = ids.filter(i => !tiene.has(i));
console.log('casan ' + tiene.size + ' de ' + ids.length + ' fichas de datos/cuerpo/ejercicios.json; faltan ' + faltan.length);
malos.forEach(x => console.log('  MAL  ' + x));
sobran.forEach(x => console.log('  SOBRA  ' + x));
cambiadas.forEach(x => console.log('  CAMBIO EL CASTELLANO  ' + x.donde + ': ' + x.que + ' (esa ficha se traduce otra vez)'));
if (LISTA) faltan.forEach(i => console.log('  falta  ' + i));
const problemas = malos.length + sobran.length + cambiadas.length;

const ruta = path.join(CUERPO, 'ejercicios-' + L + '.json');
if (PROBAR) {
  console.log(problemas ? '--probar: ' + problemas + ' fichas que no valen (arriba); no se ha escrito nada'
                        : '--probar: todo lo que hay casa' + (faltan.length ? ' (faltan los bloques que vienen)' : '; se puede escribir'));
  process.exit(problemas ? 1 : 0);
}
if (COMPROBAR && !problemas && faltan.length) {
  const existe = fs.existsSync(ruta);
  console.log('--comprobar: faltan ' + faltan.length + ' fichas (los bloques que vienen) y datos/cuerpo/ejercicios-' + L + '.json '
    + (existe ? 'existe: no es el que sale de las fuentes' : 'todavia no existe, como debe'));
  process.exit(existe ? 1 : 0);
}
if (problemas || faltan.length) {
  console.error((problemas ? problemas + ' fichas que no valen' : '') + (problemas && faltan.length ? ' y ' : '')
    + (faltan.length ? faltan.length + ' fichas sin traducir' : '') + ': no se ha escrito nada');
  process.exit(1);
}
/* datos/cuerpo/ejercicios-<lang>.json, con la forma de ejercicios-es.json */
const salida = {};
for (const i of ids) salida[i] = [tiene.get(i).nombre, tiene.get(i).pasos];
const texto = JSON.stringify(salida);
if (COMPROBAR) {
  const hay = fs.existsSync(ruta) ? fs.readFileSync(ruta, 'utf8') : null;
  console.log(hay === texto ? '--comprobar: datos/cuerpo/ejercicios-' + L + '.json al dia'
    : '--comprobar: datos/cuerpo/ejercicios-' + L + '.json ' + (hay === null ? 'no existe' : 'no es el que sale de las fuentes')
      + ' (node tools/ejercicios_traduccion.js ' + L + ')');
  process.exit(hay === texto ? 0 : 1);
}
fs.writeFileSync(ruta, texto);
console.log(ruta + '  ' + ids.length + ' fichas · ' + Math.round(Buffer.byteLength(texto) / 1024) + ' kB');
