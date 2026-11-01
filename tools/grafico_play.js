#!/usr/bin/env node
/* grafico_play.js — el grafico de funciones de Google Play (1024 x 500, PNG
 * de 24 bits sin transparencia, lo que pide la ficha de Play Store). Desde el
 * 30 de octubre de 2026.
 *
 * A la izquierda el logotipo de Jerome tal cual (el mismo arte que
 * icon-512.png, el icono de la app), con el borde fundido; a la derecha el
 * cielo que pinta la propia app (la carta de «Esta noche», la noche de las
 * Geminidas de 2026, como en las capturas). Nada inventado: los dos son de la
 * app. El cielo lleva los nombres de los planetas y las estrellas, que la app
 * pinta siempre: uno por idioma, como las capturas, cada uno en el suyo.
 *
 *     node tools/app_preparar.js && python3 -m http.server 8766 --directory app/www &
 *     node tools/grafico_play.js 8766 [--idiomas=todos|es,en]
 *   deja capturas-google-play/<idioma>/grafico-1024x500.png (fuera de git)
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { chromium } = require(process.env.TGO_PLAYWRIGHT || '/opt/node22/lib/node_modules/playwright');
const CHROMIUM = fs.existsSync('/opt/pw-browsers/chromium') && !process.env.TGO_PLAYWRIGHT ? '/opt/pw-browsers/chromium' : undefined;

const RAIZ = path.join(__dirname, '..');
const PUERTO = process.argv[2] || '8766';
const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
const TODOS = ((html.match(/SUPPORTED_LANGS\s*=\s*\[([^\]]*)\]/) || [, ''])[1]).split(',').map(x => x.trim().replace(/['"]/g, '')).filter(Boolean);
const arg = (process.argv.find(a => a.startsWith('--idiomas=')) || '').slice(10);
const IDIOMAS = !arg || arg === 'todos' ? TODOS : arg.split(',');
const salida = L => path.join(RAIZ, 'capturas-google-play', L, 'grafico-1024x500.png');

(async () => {
  const b = await chromium.launch({ executablePath: CHROMIUM, args: ['--no-proxy-server'] });
  try {
    const p = await (await b.newContext({ viewport: { width: 1024, height: 500 }, serviceWorkers: 'block' })).newPage();
    await p.addInitScript(() => { try { localStorage.setItem('tenerife.tour.seen', '99'); localStorage.setItem('tenerife.welcome.seen', '1');
      localStorage.setItem('tgo_consent', JSON.stringify({ v: 'denied', t: Date.now() })); } catch (e) {} });
    await p.goto('http://127.0.0.1:' + PUERTO + '/index.html', { waitUntil: 'networkidle' });
    await p.waitForFunction(() => typeof window.TG_CIELO_CARGAR === 'function' && typeof setLang === 'function', null, { timeout: 30000 });
    for (const L of IDIOMAS) {
    const png = await p.evaluate(async idioma => {
      setLang(idioma);
      await window.TG_CIELO_CARGAR(); await TG_CIELO.cargar();
      const noche = TG_CIELO.imagenNoche('2026-12-13');               // 1080 x 1350: el cielo, arriba (640)
      const logo = await new Promise((ok, mal) => { const i = new Image(); i.onload = () => ok(i); i.onerror = mal; i.src = 'icon-512.png'; });
      const W = 1024, H = 500, c = document.createElement('canvas'); c.width = W; c.height = H;
      const g = c.getContext('2d');
      /* el negro del logo: la media de su borde, para fundirlo sin que se vea la juntura */
      const L = 456, X = 36, Y = 22, m = document.createElement('canvas'); m.width = m.height = L;
      const gm = m.getContext('2d'); gm.drawImage(logo, 0, 0, L, L);
      const px = gm.getImageData(0, 0, L, L).data; let s = [0, 0, 0], n = 0;
      for (let y = 0; y < L; y++) for (let x = 0; x < L; x++) {
        if (x > 6 && x < L - 7 && y > 6 && y < L - 7) continue;
        const i = (y * L + x) * 4; s[0] += px[i]; s[1] += px[i + 1]; s[2] += px[i + 2]; n++;
      }
      const [r, gg, bb] = s.map(v => Math.round(v / n)), fondo = 'rgb(' + r + ',' + gg + ',' + bb + ')', nada = 'rgba(' + r + ',' + gg + ',' + bb + ',0)';
      g.fillStyle = fondo; g.fillRect(0, 0, W, H);
      /* el cielo: la franja de arriba de la imagen de la noche (sin los 30 px de mas arriba,
         donde un nombre puede quedar cortado por el borde), a 500 de alto, a la derecha */
      const ancho = Math.round(1080 * H / 610);
      g.drawImage(noche, 0, 30, 1080, 610, W - ancho, 0, ancho, H);
      /* desde el borde derecho del logo (que ya se va al negro) hasta 230 px mas alla */
      const fun = g.createLinearGradient(X + L, 0, X + L + 230, 0);
      fun.addColorStop(0, fondo); fun.addColorStop(1, nada);
      g.fillStyle = fondo; g.fillRect(0, 0, X + L, H);
      g.fillStyle = fun; g.fillRect(X + L, 0, 230, H);
      /* el logo, entero, con los bordes fundidos (una franja de 28 px que se va al negro de su borde) */
      const B = 28;
      [[0, 0, B, 0, 0, 0, B, L], [L, 0, L - B, 0, L - B, 0, B, L], [0, 0, 0, B, 0, 0, L, B], [0, L, 0, L - B, 0, L - B, L, B]].forEach(([x0, y0, x1, y1, rx, ry, rw, rh]) => {
        const lg = gm.createLinearGradient(x0, y0, x1, y1); lg.addColorStop(0, fondo); lg.addColorStop(1, nada);
        gm.fillStyle = lg; gm.fillRect(rx, ry, rw, rh);
      });
      g.drawImage(m, X, Y);
      return c.toDataURL('image/png');
    }, L);
    const f = salida(L);
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, Buffer.from(png.split(',')[1], 'base64'));
    /* Play: PNG de 24 bits, sin canal alfa */
    const r = spawnSync('python3', ['-c', 'import sys; from PIL import Image; im = Image.open(sys.argv[1]).convert("RGB"); im.save(sys.argv[1]); print(im.size[0], im.size[1], im.mode)', f]);
    const sale = String(r.stdout).trim();
    if (r.status !== 0 || sale !== '1024 500 RGB') { console.log('MAL: ' + (sale || String(r.stderr).trim().split('\n').pop())); process.exit(1); }
    console.log('  ' + path.relative(RAIZ, f) + ': 1024 x 500, RGB');
    }
  } finally { await b.close(); }
})().catch(e => { console.error(e); process.exit(2); });
