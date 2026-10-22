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
 * Y LOS TEXTOS QUE VAN UN FICHERO POR IDIOMA (22 de octubre de 2026). Las
 * curiosidades de las 88 constelaciones salieron de modulos/cielo.js a
 * idiomas/cielo/<idioma>.json, para que cada movil baje solo las suyas. Sin
 * mas, ninguna herramienta las veria: se declaran con «IDIOMAS-PEREZOSOS:
 * <carpeta>» y aqui se juntan los ficheros de esa carpeta (uno por idioma de
 * SUPPORTED_LANGS) en una tabla de filas de diez idiomas,
 * var IDIOMAS_<CARPETA> = { "clave": {"es": "…", "en": "…", …}, … },
 * pegada detras de los modulos: las herramientas las miran como miraban las
 * filas de CIELO_UI. Una carpeta declarada que no existe, un idioma sin su
 * fichero o una clave que no esta en todos revientan aqui.
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
  /* los de un fichero por idioma, declarados en el fuente: una tabla por carpeta */
  const langs = ((index.match(/SUPPORTED_LANGS\s*=\s*\[([^\]]*)\]/) || [, ''])[1].match(/[a-z]+/g)) || [];
  const porIdioma = [];
  for (const m3 of index.matchAll(/IDIOMAS-PEREZOSOS:\s*([\w./-]+)/g)) {
    const dir = m3[1].replace(/^\.\//, '').replace(/\/$/, '');
    if (porIdioma.some(f => f.ruta === dir)) continue;
    if (!langs.length) throw new Error('IDIOMAS-PEREZOSOS: ' + dir + ', y no encuentro SUPPORTED_LANGS en index.html');
    const filas = {};
    let claves = null;
    for (const l of langs) {
      const abs = path.join(RAIZ, dir, l + '.json');
      if (!fs.existsSync(abs)) throw new Error('index.html declara ' + dir + ' y falta ' + dir + '/' + l + '.json');
      const d = JSON.parse(fs.readFileSync(abs, 'utf8'));
      const ks = Object.keys(d);
      if (claves === null) claves = ks;
      else if (ks.join('\n') !== claves.join('\n')) throw new Error(dir + '/' + l + '.json no tiene las mismas claves, en el mismo orden, que ' + dir + '/' + langs[0] + '.json');
      for (const k of ks) { if (typeof d[k] !== 'string') throw new Error(dir + '/' + l + '.json: ' + k + ' no es un texto'); (filas[k] = filas[k] || {})[l] = d[k]; }
    }
    const nombre = 'IDIOMAS_' + dir.split('/').pop().toUpperCase().replace(/[^A-Z0-9]/g, '_');
    const texto = 'var ' + nombre + ' = {\n' + claves.map(k => '    ' + JSON.stringify(k) + ': {' +
      langs.map(l => JSON.stringify(l) + ': ' + JSON.stringify(filas[k][l])).join(', ') + '}').join(',\n') + '\n};';
    porIdioma.push({ ruta: dir, texto, porIdioma: true, nombre });
  }
  let html = index;
  const tramos = [];                     // [primera linea, ultima, ruta, desfase]
  let linea = index.split('\n').length;
  for (const f of ficheros.concat(perezosos, porIdioma)) {
    const cabeza = '\n<script>\n/* ════ ' + (f.porIdioma ? f.ruta + '/<idioma>.json' : f.ruta) + ' · no esta en index.html: ' +
                   (f.porIdioma ? 'el modulo pide solo el del idioma de quien mira; aqui van los de todos juntos, fila a fila.' :
                    f.perezoso ? 'lo pide su cargador al abrir el panel.' : 'lo carga su etiqueta.') +
                   ' Se pega aqui solo para las herramientas (tools/fuente.js y .py). ════ */\n';
    html += cabeza;
    linea += cabeza.split('\n').length - 1;
    const n = f.texto.split('\n').length;
    tramos.push([linea, linea + n - 1, f.ruta, linea - 1]);
    html += f.texto + '\n</script>\n';
    linea += n + 1;
  }
  _cache = { index, html, ficheros, perezosos, porIdioma, tramos, lineasIndex: index.split('\n').length };
  return _cache;
}

module.exports = {
  RAIZ,
  html: () => cargar().html,
  index: () => cargar().index,
  ficheros: () => cargar().ficheros.slice(),
  perezosos: () => cargar().perezosos.slice(),
  porIdioma: () => cargar().porIdioma.slice(),
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
  for (const f of c.porIdioma) console.log(f.ruta + '/<idioma>.json: ' + (f.texto.split('\n').length - 2) + ' filas de diez idiomas, juntas en ' + f.nombre);
}
