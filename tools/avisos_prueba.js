/* Ficheros de avisos de AEMET para las pruebas en navegador (probar_avisos.js
 * y barrido_pantallas.js), con la forma exacta que escribe
 * tools/avisos_aemet.py. NO es un aviso de verdad para Tenerife: el texto es el
 * de un aviso amarillo real de lluvias del interior de Mallorca del 12/10/2026
 * (tools/pruebas/aemet/), puesto aqui en zonas de Tenerife y con las horas
 * alrededor de ahora para que este en pie. La app nunca lo ve fuera de una
 * prueba: las pruebas lo sirven interceptando datos/avisos-aemet.json.
 *
 * Los contornos de las zonas costeras SI son los de AEMET: salen del mensaje
 * real de costeros del 11 de octubre de 2026 que va en el .tar.gz de
 * tools/pruebas/aemet/, leido aqui mismo (contorno()), sin copiarlos a mano.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const real = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'datos', 'avisos-aemet.json'), 'utf8'));
const iso = ms => new Date(ms).toISOString().replace(/\.\d{3}Z$/, 'Z');
const H = 3600 * 1000;

/* El <polygon> de una zona en el mensaje real de costeros (un .tar sin
   comprimir son cabeceras de 512 bytes: nombre en 0..100, tamano en octal
   en 124..136, y los datos detras, rellenos hasta 512). */
const TAR = path.join(__dirname, 'pruebas', 'aemet', 'Z_CAP_C_LEMM_20261011215001_AFAP6596.tar.gz');
function contorno(codigo) {
  const tar = zlib.gunzipSync(fs.readFileSync(TAR));
  for (let o = 0; o + 512 <= tar.length;) {
    const nombre = tar.toString('utf8', o, o + 100).split('\0')[0];
    if (!nombre) break;
    const tam = parseInt(tar.toString('utf8', o + 124, o + 136).split('\0')[0].trim(), 8) || 0;
    const xml = tar.toString('utf8', o + 512, o + 512 + tam);
    o += 512 + Math.ceil(tam / 512) * 512;
    if (!/COCO\d*\.xml$/.test(nombre)) continue;
    const area = xml.split('<area>').find(a => a.includes('<value>' + codigo + '</value>'));
    const m = area && area.match(/<polygon>([^<]+)<\/polygon>/);
    if (m) return m[1].trim();
  }
  throw new Error('no esta el contorno de ' + codigo + ' en ' + TAR);
}
const COSTAS = {
  '659601C': 'Costa - Norte de Tenerife',
  '659602C': 'Costa - Área metropolitana de Tenerife',
  '659603C': 'Costa - Este, sur y oeste de Tenerife',
};

function ficheros(ahora = Date.now()) {
  const amarillo = {
    id: '2.49.0.0.724.0.ES.PRUEBA.659601PRP1', nivel: 'amarillo', fenomeno: 'PR', fenomeno_es: 'Lluvias',
    parametro: 'P1', parametro_es: 'Precipitación acumulada en una hora', valor: '20 mm', probabilidad: '10%-40%',
    zonas: [{ codigo: '659601', nombre_es: 'Norte de Tenerife' }],
    inicio: iso(ahora - H), fin: iso(ahora + 5 * H), emitido: iso(ahora - 2 * H),
    es: { descripcion: 'Precipitación acumulada en una hora: 20 mm.',
          instruccion: 'Esté atento. Manténgase informado de la predicción meteorológica más actualizada. Se pueden producir daños moderados a personas y bienes, especialmente a aquellos vulnerables o en zonas expuestas al fenómeno.' },
    en: { descripcion: 'One-hour accumulated precipitation: 20 mm.',
          instruccion: 'Be aware, keep up to date with the latest weather forecast. Moderate damages to people and properties may occur, especially to those vulnerable or in exposed areas.' },
  };
  /* uno naranja de costeros en una costa, con el contorno de AEMET. Sin
     texto: no hay ningun costero real de Tenerife entre las copias, y un
     texto de aviso no se inventa ni en una prueba. */
  const costero = (codigo, cambios) => Object.assign({}, amarillo, {
    id: '2.49.0.0.724.0.ES.PRUEBA.' + codigo + 'COCO', nivel: 'naranja', fenomeno: 'CO', fenomeno_es: 'Costeros',
    parametro: 'CO', parametro_es: 'Costeros', valor: '', probabilidad: '',
    zonas: [{ codigo, nombre_es: COSTAS[codigo], poligonos: [contorno(codigo)] }],
    es: { descripcion: '', instruccion: '' }, en: { descripcion: '', instruccion: '' },
  }, cambios || {});
  const naranjaCosta = costero('659603C');
  const base = Object.assign({}, real, { consultado: iso(ahora - 10 * 60 * 1000),
    aemet: Object.assign({}, real.aemet, { alcance: iso(ahora + 48 * H) }) });
  const sinAvisos = Object.assign({}, base, { avisos: [] });
  const con = avisos => Object.assign({}, base, { avisos });
  return {
    amarillo, naranjaCosta,
    conAvisos: con([amarillo, naranjaCosta]),
    sinAvisos,
    viejo: Object.assign({}, sinAvisos, { consultado: iso(ahora - 7 * H) }),
    caducado: Object.assign({}, sinAvisos, { avisos: [Object.assign({}, amarillo, { inicio: iso(ahora - 5 * H), fin: iso(ahora - 60 * 1000) })] }),
    // costeros en las tres costas de la isla
    tresCostas: con(['659601C', '659602C', '659603C'].map(c => costero(c))),
    // el del sur llegado sin contorno: cuenta para toda la costa
    sinContorno: con([costero('659603C', { zonas: [{ codigo: '659603C', nombre_es: COSTAS['659603C'] }] })]),
    // el del sur, pero de mañana: de 30 a 36 horas desde ahora, nunca hoy
    deManana: con([costero('659603C', { inicio: iso(ahora + 30 * H), fin: iso(ahora + 36 * H) })]),
  };
}

module.exports = { ficheros, contorno };
