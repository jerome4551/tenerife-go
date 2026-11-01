#!/usr/bin/env node
/* app_store_metadata.js — la ficha de la tienda (datos/app-store/ficha.json) y
 * las capturas (capturas-app-store/), en el formato que sube `fastlane
 * deliver` a App Store Connect: app/fastlane/metadata/<localizacion>/*.txt
 * y app/fastlane/screenshots/<localizacion>/*.png. Desde el 21 de octubre de
 * 2026 («P5»: la App Store sin Mac).
 *
 *     node tools/app_store_metadata.js              escribe app/fastlane/{metadata,screenshots}
 *     node tools/app_store_metadata.js --comprobar  lo escribe en un sitio aparte y lo coteja: lo pasa auditar.sh
 *
 * LO QUE ESCRIBE (docs.fastlane.tools/actions/deliver, leido el 21-10-2026)
 *   metadata/<loc>/name.txt, subtitle.txt, description.txt, keywords.txt,
 *   promotional_text.txt, support_url.txt, marketing_url.txt, privacy_url.txt
 *   (una carpeta por localizacion de App Store Connect: es-ES, en-GB, en-US,
 *   fr-FR, de-DE, it, nl-NL, zh-Hans, zh-Hant, pl; el bulgaro no existe en
 *   la tienda y no se escribe); metadata/copyright.txt, primary_category.txt,
 *   secondary_category.txt; metadata/review_information/notes.txt (las notas
 *   al revisor, de LANZAMIENTO-APP-STORE.md §5.5).
 *   screenshots/<loc>/: las capturas de capturas-app-store/<idioma>/ si
 *   existen (deliver sabe el aparato por el tamano: 1206x2622 es el iPhone
 *   «6,1"» y 2064x2752 el iPad de 13"), con el numero delante para el orden.
 *
 * --comprobar: cada fichero con su limite (nombre 30, subtitulo 30, promocion
 *   170, descripcion 4000, palabras clave 100 bytes), las diez carpetas, la
 *   variante en-US distinta de en-GB, y que las capturas, si las hay, son de
 *   los tamanos que Apple pide.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const COMPROBAR = process.argv.includes('--comprobar');
const DESTINO = COMPROBAR ? path.join(require('os').tmpdir(), 'tgo-metadata-' + process.pid) : path.join(RAIZ, 'app', 'fastlane');
const F = JSON.parse(fs.readFileSync(path.join(RAIZ, 'datos', 'app-store', 'ficha.json'), 'utf8'));
const CAPTURAS = path.join(RAIZ, 'capturas-app-store');
const LIMITES = { 'name.txt': 30, 'subtitle.txt': 30, 'promotional_text.txt': 170, 'description.txt': 4000 };
/* las notas al revisor: el parrafo de LANZAMIENTO-APP-STORE.md §5.5 (la cita en ingles) */
const notasRevisor = () => {
  const md = fs.readFileSync(path.join(RAIZ, 'LANZAMIENTO-APP-STORE.md'), 'utf8');
  const m = md.match(/\*Notes\*[^\n]*\n\n((?:> [^\n]*\n?)+)/);
  if (!m) throw new Error('LANZAMIENTO-APP-STORE.md: no encuentro las notas al revisor (§5.5)');
  return m[1].split('\n').filter(Boolean).map(l => l.replace(/^> /, '')).join('\n') + '\n';
};

let mal = 0;
const ok = (c, que, detalle) => { if (!c) mal++; console.log((c ? '  OK   ' : '  MAL  ') + que + (!c && detalle ? '\n         ' + detalle : '')); return c; };
const escribe = (rel, texto) => { const f = path.join(DESTINO, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, texto); return f; };

fs.rmSync(path.join(DESTINO, 'metadata'), { recursive: true, force: true });
fs.rmSync(path.join(DESTINO, 'screenshots'), { recursive: true, force: true });
const escritas = [];
let capturas = 0;
for (const [idioma, x] of Object.entries(F.idiomas)) {
  for (const loc of F.tienda[idioma] || []) {
    const v = (x.variantes || {})[loc] || {};
    const campos = {
      'name.txt': x.nombre,
      'subtitle.txt': v.subtitulo || x.subtitulo,
      'promotional_text.txt': v.promocion || x.promocion,
      'description.txt': v.descripcion || x.descripcion,
      'keywords.txt': v.palabrasClave || x.palabrasClave,
      'support_url.txt': F.urlSoporte,
      'marketing_url.txt': F.urlMarketing,
      'privacy_url.txt': F.urlPrivacidad,
    };
    for (const [f, t] of Object.entries(campos)) escribe(path.join('metadata', loc, f), String(t).replace(/\s+$/, '') + '\n');
    escritas.push(loc);
    /* las capturas, si estan hechas */
    const dir = path.join(CAPTURAS, idioma);
    if (fs.existsSync(dir)) {
      for (const f of fs.readdirSync(dir).filter(n => /^(iphone|ipad)-\d+-.*\.png$/.test(n)).sort()) {
        const [, aparato, n] = f.match(/^(iphone|ipad)-(\d+)-/);
        const dest = path.join(DESTINO, 'screenshots', loc, aparato + '-' + n.padStart(2, '0') + '-' + f.replace(/^(iphone|ipad)-\d+-/, ''));
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.copyFileSync(path.join(dir, f), dest);
        capturas++;
      }
    }
  }
}
escribe(path.join('metadata', 'copyright.txt'), F.copyright + '\n');
escribe(path.join('metadata', 'primary_category.txt'), F.categoria + '\n');
escribe(path.join('metadata', 'secondary_category.txt'), F.categoriaSecundaria + '\n');
escribe(path.join('metadata', 'review_information', 'notes.txt'), notasRevisor());
console.log('  ' + escritas.length + ' localizaciones (' + escritas.join(' ') + '), ' + capturas + ' capturas, en ' + DESTINO);

if (COMPROBAR) {
  ok(escritas.length === 10 && ['es-ES', 'en-GB', 'en-US', 'fr-FR', 'de-DE', 'it', 'nl-NL', 'zh-Hans', 'zh-Hant', 'pl'].every(l => escritas.includes(l)),
     'las diez localizaciones de la tienda (el bulgaro no existe en App Store Connect)', escritas.join(' '));
  for (const loc of escritas) {
    const fallos = [];
    for (const [f, lim] of Object.entries(LIMITES)) {
      const t = fs.readFileSync(path.join(DESTINO, 'metadata', loc, f), 'utf8').replace(/\n$/, '');
      if (!t || t.length > lim) fallos.push(f + ' ' + t.length);
    }
    const kw = fs.readFileSync(path.join(DESTINO, 'metadata', loc, 'keywords.txt'), 'utf8').replace(/\n$/, '');
    if (Buffer.byteLength(kw, 'utf8') > 100) fallos.push('keywords ' + Buffer.byteLength(kw, 'utf8') + ' bytes');
    for (const f of ['support_url.txt', 'marketing_url.txt', 'privacy_url.txt']) if (!/^https:\/\//.test(fs.readFileSync(path.join(DESTINO, 'metadata', loc, f), 'utf8'))) fallos.push(f);
    ok(fallos.length === 0, loc + ': los ocho ficheros, dentro de los limites', fallos.join('; '));
  }
  const gb = fs.readFileSync(path.join(DESTINO, 'metadata', 'en-GB', 'description.txt'), 'utf8'), us = fs.readFileSync(path.join(DESTINO, 'metadata', 'en-US', 'description.txt'), 'utf8');
  ok(gb !== us && /favourites/.test(gb) && /favorites/.test(us), 'en-US es la variante americana y en-GB la britanica');
  ok(/^\d{4} /.test(fs.readFileSync(path.join(DESTINO, 'metadata', 'copyright.txt'), 'utf8')) && /Travel/.test(fs.readFileSync(path.join(DESTINO, 'metadata', 'primary_category.txt'), 'utf8')), 'copyright y categoria');
  const notas = fs.readFileSync(path.join(DESTINO, 'metadata', 'review_information', 'notes.txt'), 'utf8');
  ok(notas.length > 300 && Buffer.byteLength(notas, 'utf8') <= 4000 && /privacidad\.html/.test(notas) && /offline/.test(notas), 'las notas al revisor (de LANZAMIENTO-APP-STORE.md §5.5), menos de 4000 bytes');
  if (capturas) {
    const { spawnSync } = require('child_process');
    const r = spawnSync('python3', ['-c', 'import sys,glob\nfrom PIL import Image\nmal=[]\nfor f in glob.glob(sys.argv[1]+"/screenshots/*/*.png"):\n  im=Image.open(f)\n  if (im.size not in [(1206,2622),(2064,2752)]) or im.mode!="RGB": mal.append(f.split("/")[-1]+" "+str(im.size)+" "+im.mode)\nprint(" ".join(mal))', DESTINO], { encoding: 'utf8' });
    ok(r.status === 0 && !r.stdout.trim(), capturas + ' capturas copiadas, todas de 1206×2622 o 2064×2752 y sin transparencia', (r.stdout + r.stderr).trim().slice(0, 300));
  } else console.log('  (sin capturas en capturas-app-store/: se copian cuando esten hechas)');
  fs.rmSync(DESTINO, { recursive: true, force: true });
}
if (mal) { console.log('\n*** ' + mal + ' cosa(s) mal ***'); process.exit(1); }
console.log(COMPROBAR ? '  todo en verde' : '  hecho');
