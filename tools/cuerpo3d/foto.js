#!/usr/bin/env node
/* foto.js — una captura del banco del cuerpo 3D (banco.html), para mirar el motor sin la app.
 *
 *     node tools/cuerpo3d/foto.js PUERTO salida.png "fig=a&comp=1&pelo=corto&giro=30" [ancho alto] [escala]
 *
 * Con la raíz del repositorio servida en ese puerto (python3 -m http.server PUERTO). Escribe en la
 * salida los errores de la página, si los hay, y sale con 1 si el banco no llegó a «listo». */
'use strict';
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const [, , puerto, salida, consulta = '', ancho = '600', alto = '1000', escala = '1'] = process.argv;
if (!puerto || !salida) { console.error('uso: foto.js PUERTO salida.png "parametros" [ancho alto] [escala]'); process.exit(2); }
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const pg = await b.newPage({ viewport: { width: +ancho, height: +alto }, deviceScaleFactor: +escala });
  const errores = [];
  pg.on('pageerror', e => errores.push('error: ' + e.message));
  pg.on('console', m => { if (m.type() === 'error' && !/GPU stall|ReadPixels/.test(m.text())) errores.push('console: ' + m.text()); });
  await pg.goto('http://127.0.0.1:' + puerto + '/tools/cuerpo3d/banco.html?' + consulta);
  const ok = await pg.waitForFunction(() => document.title === 'listo' || document.title.indexOf('fallo') === 0, null, { timeout: 60000 }).then(() => true).catch(() => false);
  const titulo = await pg.title();
  await pg.waitForTimeout(100);
  await pg.screenshot({ path: salida });
  if (errores.length) console.log(errores.join('\n'));
  await b.close();
  if (!ok || titulo !== 'listo') { console.log(titulo || 'sin respuesta'); process.exit(1); }
})();
