#!/usr/bin/env node
/* og-image.jpg: la imagen que sale al compartir el enlace (og:image,
 * twitter:image y el JSON-LD la piden). 1200x630, JPG ligero, el logo
 * (icon-512.png) a su tamano sobre #0F1117. Sin cifras ni promesas.
 * LANZAMIENTO-PLAY.md 1.7, 16 de octubre de 2026.
 *
 *     node tools/generar_og_image.js og-image.jpg
 */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
(async () => {
  const nav = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const pg = await nav.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  const b64 = fs.readFileSync(require('path').join(__dirname, '..', 'icon-512.png')).toString('base64');
  // el fondo propio del logo es mas oscuro (#05060A) que #0F1117: los bordes,
  // difuminados, para que no se vea un cuadrado
  const borde = 'radial-gradient(circle closest-side, #000 80%, transparent 100%)';
  await pg.setContent(`<!doctype html><html><body style="margin:0;width:1200px;height:630px;background:#0F1117;display:flex;align-items:center;justify-content:center">
    <img src="data:image/png;base64,${b64}" width="512" height="512" style="display:block;
      -webkit-mask-image:${borde};mask-image:${borde}">
    </body></html>`);
  await pg.waitForTimeout(300);
  await pg.screenshot({ path: process.argv[2] || require('path').join(__dirname, '..', 'og-image.jpg'), type: 'jpeg', quality: 82 });
  await nav.close();
})();
