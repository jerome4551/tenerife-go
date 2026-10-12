/* Ficheros de avisos de AEMET para las pruebas en navegador (probar_avisos.js
 * y barrido_pantallas.js), con la forma exacta que escribe
 * tools/avisos_aemet.py. NO es un aviso de verdad para Tenerife: el texto es el
 * de un aviso amarillo real de lluvias del interior de Mallorca del 12/10/2026
 * (tools/pruebas/aemet/), puesto aqui en zonas de Tenerife y con las horas
 * alrededor de ahora para que este en pie. La app nunca lo ve fuera de una
 * prueba: las pruebas lo sirven interceptando datos/avisos-aemet.json.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const real = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'datos', 'avisos-aemet.json'), 'utf8'));
const iso = ms => new Date(ms).toISOString().replace(/\.\d{3}Z$/, 'Z');
const H = 3600 * 1000;

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
  /* uno naranja de costeros en la costa del sur (zona 659603C), para el panel
     del mar. Sin texto: no hay ningun costero real de Tenerife entre las
     copias, y un texto de aviso no se inventa ni en una prueba. */
  const naranjaCosta = Object.assign({}, amarillo, {
    id: '2.49.0.0.724.0.ES.PRUEBA.659603CCOCO', nivel: 'naranja', fenomeno: 'CO', fenomeno_es: 'Costeros',
    parametro: 'CO', parametro_es: 'Costeros', valor: '', probabilidad: '',
    zonas: [{ codigo: '659603C', nombre_es: 'Costa - Este, sur y oeste de Tenerife' }],
    es: { descripcion: '', instruccion: '' }, en: { descripcion: '', instruccion: '' },
  });
  const base = Object.assign({}, real, { consultado: iso(ahora - 10 * 60 * 1000),
    aemet: Object.assign({}, real.aemet, { alcance: iso(ahora + 48 * H) }) });
  const sinAvisos = Object.assign({}, base, { avisos: [] });
  return {
    amarillo, naranjaCosta,
    conAvisos: Object.assign({}, base, { avisos: [amarillo, naranjaCosta] }),
    sinAvisos,
    viejo: Object.assign({}, sinAvisos, { consultado: iso(ahora - 7 * H) }),
    caducado: Object.assign({}, sinAvisos, { avisos: [Object.assign({}, amarillo, { inicio: iso(ahora - 5 * H), fin: iso(ahora - 60 * 1000) })] }),
  };
}

module.exports = { ficheros };
