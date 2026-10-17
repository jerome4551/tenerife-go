#!/usr/bin/env node
/* fuente.js — EL FUENTE ENTERO DE LA APP, para las herramientas que lo barren.
 *
 * Desde el 9 de octubre de 2026 la red de guaguas (TITSA_PARADAS y
 * TITSA_LINES) vive en datos/titsa.js, que index.html carga con su propia
 * etiqueta. Esos datos llevan textos para el usuario en los diez idiomas
 * -las notas de algunas lineas- y nombres en cirilico, y las herramientas
 * que barren el fuente tienen que seguir viendolos.
 *
 * NO ES TEORIA. Al mudarlos, con las herramientas sin tocar:
 *     barrido_idiomas.js     2.964 filas -> 2.959
 *     auditar_idioma.js      557 textos de interfaz -> 477
 *     auditar_cirilico.py    1.161 nombres en cirilico -> 1.160
 * y las tres siguieron en verde. Un control que aprueba lo que ya no mira
 * da permiso para seguir, que es el peor resultado posible.
 *
 * html() devuelve index.html con esos ficheros pegados AL FINAL, cada uno en
 * su bloque <script>, que es lo que el navegador ejecuta. Al final y no en el
 * sitio de su etiqueta para que los numeros de linea de index.html no se
 * muevan: lo que caiga despues de su ultima linea es de esos ficheros, y
 * donde(linea) dice de cual y en que linea.
 *
 * Que ficheros: los <script src> del propio origen que NO son de vendor/.
 * vendor/ son librerias de fuera (Leaflet...), no fuente de la app. Si
 * mañana sale otro fichero de datos, entra solo.
 *
 * Y LOS MODULOS DE CARGA PEREZOSA (17 de octubre de 2026). El panel del cielo
 * (modulos/cielo.js) no tiene etiqueta: lo pide su cargador cuando alguien
 * abre el panel, para no sumar unos 100 kB comprimidos a la primera descarga. Sin
 * etiqueta, ninguna herramienta lo veria, y lleva todos sus textos en diez
 * idiomas.
 * Se declara junto a su cargador con un comentario «CARGA-PEREZOSA: <ruta>»
 * y entra aqui igual que los otros, detras de ellos. ficheros() sigue
 * devolviendo solo lo que se carga al arrancar (peso_descarga.py cuenta eso);
 * perezosos() devuelve estos.
 *
 *     const F = require('./fuente');
 *     const src = F.html();        // en vez de leer index.html a pelo
 *     F.ficheros()                 // [{ ruta, texto }]
 *     F.donde(41234)               // 'datos/titsa.js:123'
 */
'use strict';
const fs = require('fs');
const path = require('path');
const RAIZ = path.dirname(__dirname);

let _cache = null;
function cargar() {
  if (_cache) return _cache;
  const index = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
  const ficheros = [];
  const re = /<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi;
  let m;
  while ((m = re.exec(index))) {
    const url = m[1];
    if (/^(?:[a-z]+:)?\/\//i.test(url)) continue;              // de otro dominio
    const ruta = url.replace(/^\.\//, '').replace(/[?#].*$/, '');
    if (ruta.startsWith('vendor/')) continue;                   // librerias, no fuente
    const abs = path.join(RAIZ, ruta);
    /* Una etiqueta que apunta a un fichero que no existe es una app rota, no
       un fichero menos que mirar: se revienta aqui. */
    if (!fs.existsSync(abs)) throw new Error('index.html carga ' + ruta + ' y no existe');
    const texto = fs.readFileSync(abs, 'utf8');
    if (/<\/script/i.test(texto)) throw new Error(ruta + ' trae «</script»: no se puede pegar en linea');
    ficheros.push({ ruta, texto });
  }
  /* los de carga perezosa, declarados en el fuente */
  const perezosos = [];
  for (const m2 of index.matchAll(/CARGA-PEREZOSA:\s*([\w./-]+\.js)\b/g)) {
    const ruta = m2[1].replace(/^\.\//, '');
    if (perezosos.some(f => f.ruta === ruta) || ficheros.some(f => f.ruta === ruta)) continue;
    const abs = path.join(RAIZ, ruta);
    if (!fs.existsSync(abs)) throw new Error('index.html declara la carga perezosa de ' + ruta + ' y no existe');
    const texto = fs.readFileSync(abs, 'utf8');
    if (/<\/script/i.test(texto)) throw new Error(ruta + ' trae «</script»: no se puede pegar en linea');
    perezosos.push({ ruta, texto, perezoso: true });
  }
  let html = index;
  const tramos = [];                     // [primera linea, ultima, ruta, desfase]
  let linea = index.split('\n').length;
  for (const f of ficheros.concat(perezosos)) {
    const cabeza = '\n<script>\n/* ════ ' + f.ruta + ' · no esta en index.html: ' +
                   (f.perezoso ? 'lo pide su cargador al abrir el panel.' : 'lo carga su etiqueta.') +
                   ' Se pega aqui solo para las herramientas (tools/fuente.js y .py). ════ */\n';
    html += cabeza;
    linea += cabeza.split('\n').length - 1;
    const n = f.texto.split('\n').length;
    tramos.push([linea, linea + n - 1, f.ruta, linea - 1]);
    html += f.texto + '\n</script>\n';
    linea += n + 1;
  }
  _cache = { index, html, ficheros, perezosos, tramos, lineasIndex: index.split('\n').length };
  return _cache;
}

module.exports = {
  RAIZ,
  html: () => cargar().html,
  index: () => cargar().index,
  ficheros: () => cargar().ficheros.slice(),
  perezosos: () => cargar().perezosos.slice(),
  /* 'index.html:N' o 'datos/titsa.js:N' para una linea de html() */
  donde(l) {
    const c = cargar();
    if (l <= c.lineasIndex) return 'index.html:' + l;
    for (const [a, b, ruta, desfase] of c.tramos) if (l >= a && l <= b) return ruta + ':' + (l - desfase);
    return 'fuente.js:' + l;
  }
};

if (require.main === module) {
  const c = cargar();
  console.log('index.html: ' + c.lineasIndex + ' lineas');
  for (const f of c.ficheros.concat(c.perezosos)) console.log(f.ruta + ': ' + f.texto.split('\n').length + ' lineas, ' + Buffer.byteLength(f.texto) + ' bytes' + (f.perezoso ? ' (carga perezosa)' : ''));
}
