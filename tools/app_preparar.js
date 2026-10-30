#!/usr/bin/env node
/* app_preparar.js — monta app/www/, lo que viaja dentro de la aplicacion de
 * las tiendas (Capacitor, iOS): la misma PWA, fichero a fichero, sin build.
 * Desde el 21 de octubre de 2026 («P4»: la App Store).
 *
 *     node tools/app_preparar.js              monta app/www/ (lo borra y lo rehace)
 *     node tools/app_preparar.js --comprobar  lo monta y lo coteja: lo pasa auditar.sh
 *
 * LO QUE HACE
 *   1. Copia a app/www/ SOLO lo que la app pide en el movil: index.html, el
 *      manifiesto, los iconos y los arranques (splash-*.png), privacidad.html
 *      y borrar-cuenta.html, los diez idiomas (idiomas/<l>.json y
 *      idiomas/etiquetas/), el asistente (faq/<l>.json), los datos que lee
 *      index.html (datos/), el modulo del cielo, vendor/ entero (librerias,
 *      fuentes, imagenes de Leaflet, licencias) y los dos mapas (.pmtiles).
 *      Ni sw.js (dentro de la app no hay service worker), ni las carpetas de
 *      trabajo (idiomas/pl-fuente, datos/osm-geofabrik, faq/fuente...), ni
 *      los controles.
 *   2. A index.html le pone, justo encima del bloque TGO-NATIVO (la
 *      cabecera), la linea «window.TGO_NATIVO = true»: con ella la app no
 *      registra service worker, no ofrece instalarse, esconde los dos
 *      botones de avisos push (el de la cuenta y el de «Continuar como
 *      invitado») y pide los datos que cambian a diario a la web viva, con
 *      los de dentro de respaldo. Es la UNICA diferencia con la web. (Google
 *      Analytics y su aviso de cookies tambien miraban la marca; desde el
 *      30-10-2026 no estan en ninguna parte.)
 *   3. Escribe app/ios/plantillas/<idioma>.lproj/InfoPlist.strings, los
 *      textos de los permisos de iOS (camara, ubicacion, sensores) en los
 *      diez idiomas, SACADOS de la politica de privacidad
 *      (idiomas/privacidad/<l>.json), para que digan lo mismo que ella.
 *
 * --comprobar, ademas:
 *   · que cada recurso local que index.html, privacidad.html y
 *     borrar-cuenta.html enlazan (href, src, fetch con ruta fija), cada
 *     fichero de CORE y de red-primero de sw.js (menos el propio sw.js) y
 *     los idiomas de SUPPORTED_LANGS (idiomas, etiquetas, faq) estan en
 *     app/www/;
 *   · que www/index.html es el de la raiz mas esa unica linea;
 *   · que las plantillas de iOS tienen lo que iOS pide (las tres claves de
 *     uso con texto en cada idioma, CFBundleLocalizations con los diez,
 *     el manifiesto de privacidad bien formado y sin rastreo, el icono de
 *     1024 sin transparencia, el arranque de 2732x2732);
 *   · que los .strings generados son los de hoy (si la politica cambia y
 *     no se vuelve a pasar, para aqui);
 *   · y que app/www/ no se cuela en git (.gitignore).
 */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const RAIZ = path.join(__dirname, '..');
const APP = path.join(RAIZ, 'app');
const WWW = path.join(APP, 'www');
const PLANTILLAS = path.join(APP, 'ios', 'plantillas');
const COMPROBAR = process.argv.includes('--comprobar');

const lee = f => fs.readFileSync(path.join(RAIZ, f), 'utf8');
const existe = f => fs.existsSync(path.join(RAIZ, f));
const sha = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');

let mal = 0;
const ok = (c, que, detalle) => {
  if (!c) mal++;
  console.log((c ? '  OK   ' : '  MAL  ') + que + (detalle && !c ? '\n         ' + detalle : ''));
  return c;
};

const index = lee('index.html');
const IDIOMAS = ((index.match(/SUPPORTED_LANGS\s*=\s*\[([^\]]*)\]/) || [, ''])[1])
  .split(',').map(x => x.trim().replace(/['"]/g, '')).filter(Boolean);
if (IDIOMAS.length < 2) { console.log('MAL: no encuentro SUPPORTED_LANGS en index.html'); process.exit(1); }

/* ── 1 · lo que viaja ───────────────────────────────────────────────────── */
/* Sueltos de la raiz. Los arranques (splash-*.png) se leen de index.html:
   si alguien anade uno y no esta aqui, --comprobar lo ve (cada href local
   tiene que existir en www). */
const SUELTOS = ['index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png',
  'icon-maskable-512.png', 'apple-touch-icon.png', 'privacidad.html', 'borrar-cuenta.html']
  .concat([...new Set([...index.matchAll(/href="(splash-[\dx]+\.png)"/g)].map(m => m[1]))]);
/* Carpetas, con el filtro de lo que entra de cada una.
   Los datos que cambian a diario viajan tambien, de respaldo: la app los pide
   a la web viva (tgoFetchDatos) y, sin conexion, usa la copia de dentro, que
   cada panel ensena con su fecha y esconde cuando es vieja. Los tres de los
   robots del panel SOS (window.SOS_DATOS), desde que se encendieron (24 de
   octubre de 2026): sin ellos aqui, la app de las tiendas sin conexion pedia
   tres ficheros que no llevaba. */
const DATOS = ['titsa.js', 'cielo.json', 'satelites.json', 'precios-gasolineras.json',
  'gasolineras-municipio.json', 'avisos-aemet.json',
  'sismos-ign.json', 'semaforo-involcan.json', 'alertas-canarias.json'];
const CARPETAS = [
  ['idiomas', f => IDIOMAS.includes(f.replace(/\.json$/, '')) && /\.json$/.test(f)],
  ['idiomas/etiquetas', f => /\.json$/.test(f)],
  ['idiomas/cielo', f => IDIOMAS.includes(f.replace(/\.json$/, '')) && /\.json$/.test(f)],
  ['faq', f => IDIOMAS.includes(f.replace(/\.json$/, '')) && /\.json$/.test(f)],
  ['datos', f => DATOS.includes(f)],
  ['modulos', f => /\.js$/.test(f)],
  ['vendor', f => /\.(js|css|txt)$/.test(f)],
  ['vendor/fuentes', f => /\.woff2$/.test(f)],
  ['vendor/images', f => /\.png$/.test(f)],
  ['mapa', f => /\.pmtiles$/.test(f)],
];

const MARCA = '<script>window.TGO_NATIVO = true;</script>\n';
const ANCLA = '<!-- TGO-NATIVO:';

function montar() {
  fs.rmSync(WWW, { recursive: true, force: true });
  fs.mkdirSync(WWW, { recursive: true });
  const copiados = [];
  let bytes = 0;
  const copia = (rel, cuerpo) => {
    const dest = path.join(WWW, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    if (cuerpo !== undefined) fs.writeFileSync(dest, cuerpo);
    else fs.copyFileSync(path.join(RAIZ, rel), dest);
    bytes += fs.statSync(dest).size;
    copiados.push(rel);
  };
  for (const f of SUELTOS) {
    if (!existe(f)) { console.log('  MAL  falta en la raiz: ' + f); mal++; continue; }
    if (f === 'index.html') {
      if (index.indexOf(ANCLA) < 0) { console.log('  MAL  index.html no tiene el bloque TGO-NATIVO'); mal++; continue; }
      copia(f, index.replace(ANCLA, MARCA + ANCLA));
    } else copia(f);
  }
  for (const [carpeta, filtro] of CARPETAS) {
    if (!existe(carpeta)) { console.log('  MAL  falta la carpeta ' + carpeta); mal++; continue; }
    for (const f of fs.readdirSync(path.join(RAIZ, carpeta)).sort()) {
      const rel = carpeta + '/' + f;
      if (fs.statSync(path.join(RAIZ, rel)).isFile() && filtro(f)) copia(rel);
    }
  }
  return { copiados, bytes };
}

/* ── 3 · InfoPlist.strings de la politica ───────────────────────────────── */
/* Los textos que iOS ensena al pedir cada permiso. Salen de la politica de
   privacidad de cada idioma (idiomas/privacidad/<l>.json): la etiqueta y la
   frase de la geolocalizacion, de los sensores y de la camara. Asi dicen
   exactamente lo que la politica dice, en cada idioma, y si la politica
   cambia, --comprobar para hasta que se vuelva a pasar. */
const CLAVES_USO = {
  NSLocationWhenInUseUsageDescription: ['ppDatosGeo', 'ppDatosGeoTxt'],
  NSMotionUsageDescription: ['ppDatosSensores', 'ppDatosSensoresTxt'],
  NSCameraUsageDescription: ['ppDatosCamara', 'ppDatosCamaraTxt'],
};
/* iOS nombra los dos chinos por su escritura. El resto, igual que la app. */
const LPROJ = { zh: 'zh-Hans', zht: 'zh-Hant' };
const esc = s => String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, ' ');
const xml = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
/* Las frases de un idioma, clave -> frase, de su politica */
function frasesDe(l) {
  const pol = JSON.parse(lee('idiomas/privacidad/' + l + '.json'));
  const out = {};
  for (const [clave, [etq, txt]] of Object.entries(CLAVES_USO)) {
    if (!pol[etq] || !pol[txt]) throw new Error('idiomas/privacidad/' + l + '.json: falta ' + etq + ' o ' + txt);
    /* «Geolocalización: solo cuando la activas. …», con los dos puntos de la
       etiqueta tal y como los escribe su idioma: «Géolocalisation :», y en
       chino los de ancho completo sin espacio detras («定位：»). Antes se
       quitaban y se ponian los latinos en todos, y en chino salia «定位: ». */
    const etiqueta = /[:：]\s*$/.test(String(pol[etq])) ? String(pol[etq]).trim() : String(pol[etq]).trim() + ':';
    out[clave] = (etiqueta + (/：$/.test(etiqueta) ? '' : ' ') + String(pol[txt]).trim()).replace(/\s+/g, ' ');
  }
  return out;
}
function stringsDe(l) {
  const lineas = ['/* Tenerife Go · ' + l + ' · generado por tools/app_preparar.js de idiomas/privacidad/' + l + '.json: no editar a mano */',
    '"CFBundleDisplayName" = "Tenerife Go";'];
  for (const [clave, frase] of Object.entries(frasesDe(l))) lineas.push('"' + clave + '" = "' + esc(frase) + '";');
  return lineas.join('\n') + '\n';
}
/* Lo que se anade al Info.plist que genera `npx cap add ios`
   (PlistBuddy -c "Merge …", en aplicar.sh). Las tres frases de uso son las
   del castellano; los demas idiomas van en su .lproj/InfoPlist.strings. */
function fragmentoPlist() {
  const f = frasesDe('es');
  const locs = IDIOMAS.map(l => '    <string>' + (LPROJ[l] || l) + '</string>').join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<!-- Tenerife Go · lo que se anade al Info.plist de la app de Capacitor.
     Generado por tools/app_preparar.js (las frases, de idiomas/privacidad/es.json): no editar a mano.
     Se aplica con ios/plantillas/aplicar.sh (PlistBuddy Merge) despues de «npx cap add ios». -->
<plist version="1.0">
<dict>
  <!-- el idioma base y los diez de la app; cada uno lleva su .lproj/InfoPlist.strings -->
  <key>CFBundleDevelopmentRegion</key>
  <string>es</string>
  <key>CFBundleLocalizations</key>
  <array>
${locs}
  </array>
  <!-- los permisos, con lo que dice la politica de privacidad -->
  <key>NSLocationWhenInUseUsageDescription</key>
  <string>${xml(f.NSLocationWhenInUseUsageDescription)}</string>
  <key>NSMotionUsageDescription</key>
  <string>${xml(f.NSMotionUsageDescription)}</string>
  <key>NSCameraUsageDescription</key>
  <string>${xml(f.NSCameraUsageDescription)}</string>
  <!-- la app solo usa HTTPS (cifrado exento): asi App Store Connect no pregunta por el cifrado en cada subida -->
  <key>ITSAppUsesNonExemptEncryption</key>
  <false/>
  <!-- vertical y apaisado, en iPhone y en iPad, como la web -->
  <key>UISupportedInterfaceOrientations</key>
  <array>
    <string>UIInterfaceOrientationPortrait</string>
    <string>UIInterfaceOrientationLandscapeLeft</string>
    <string>UIInterfaceOrientationLandscapeRight</string>
  </array>
  <key>UISupportedInterfaceOrientations~ipad</key>
  <array>
    <string>UIInterfaceOrientationPortrait</string>
    <string>UIInterfaceOrientationPortraitUpsideDown</string>
    <string>UIInterfaceOrientationLandscapeLeft</string>
    <string>UIInterfaceOrientationLandscapeRight</string>
  </array>
</dict>
</plist>
`;
}
function escribirStrings() {
  const salidas = {};
  fs.mkdirSync(PLANTILLAS, { recursive: true });
  for (const l of IDIOMAS) {
    const dir = path.join(PLANTILLAS, (LPROJ[l] || l) + '.lproj');
    fs.mkdirSync(dir, { recursive: true });
    const cuerpo = stringsDe(l);
    const f = path.join(dir, 'InfoPlist.strings');
    const antes = fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null;
    salidas[l] = { f, cambia: antes !== cuerpo };
    if (!COMPROBAR) fs.writeFileSync(f, cuerpo);
  }
  if (!COMPROBAR) fs.writeFileSync(path.join(PLANTILLAS, 'Info.plist.fragmento.plist'), fragmentoPlist());
  return salidas;
}

/* ── --comprobar ────────────────────────────────────────────────────────── */
function comprobar(montado) {
  const enWww = rel => fs.existsSync(path.join(WWW, rel));
  const local = u => u && !/^(https?:|mailto:|tel:|data:|#|javascript:)/.test(u) && !/[${'+]/.test(u);   // ni plantillas ni concatenaciones
  const limpia = u => u.replace(/^\.\//, '').replace(/[?#].*$/, '');

  /* lo que enlazan las tres paginas */
  const faltan = new Set();
  for (const pag of ['index.html', 'privacidad.html', 'borrar-cuenta.html']) {
    const h = lee(pag);
    for (const m of h.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (!local(m[1])) continue;
      const rel = limpia(m[1]);
      if (!rel || rel === '/' || rel === 'sw.js') continue;
      if (!enWww(rel)) faltan.add(pag + ' → ' + rel);
    }
  }
  /* los fetch con ruta fija de index.html y del modulo */
  for (const [f, h] of [['index.html', index], ['modulos/cielo.js', lee('modulos/cielo.js')]]) {
    for (const m of h.matchAll(/\b(?:fetch|tgoFetchDatos|pedir)\(\s*'([^']+)'/g)) {
      if (!local(m[1])) continue;
      if (!enWww(limpia(m[1]))) faltan.add(f + ' → ' + m[1]);
    }
  }
  /* los ficheros de los robots que esten encendidos (window.SOS_DATOS): el
     panel SOS los pide con tgoFetchDatos, y sin conexion, los de dentro */
  const sosDatos = (((index.match(/window\.SOS_DATOS = \[([^\]]*)\]/) || [, ''])[1]).match(/'[^']+'/g) || [])
    .map(x => limpia(x.slice(1, -1)));
  for (const rel of sosDatos) if (!enWww(rel)) faltan.add('window.SOS_DATOS → ' + rel);
  /* sw.js: CORE y red-primero, menos el propio sw.js */
  const sw = lee('sw.js');
  for (const m of sw.matchAll(/'\.\/([^']+)'/g)) {
    const rel = m[1];
    if (rel === '' || rel === 'sw.js' || /\.(json|js|css|pmtiles|woff2|webmanifest|html|png)$/.test(rel) === false) continue;
    if (!enWww(rel)) faltan.add('sw.js → ' + rel);
  }
  /* los idiomas */
  for (const l of IDIOMAS) {
    if (l !== 'es' && !enWww('idiomas/' + l + '.json')) faltan.add('idiomas/' + l + '.json');
    if (l !== 'es' && !enWww('idiomas/etiquetas/' + l + '.json')) faltan.add('idiomas/etiquetas/' + l + '.json');
    if (!enWww('faq/' + l + '.json')) faltan.add('faq/' + l + '.json');
    if (!enWww('idiomas/cielo/' + l + '.json')) faltan.add('idiomas/cielo/' + l + '.json');
  }
  ok(faltan.size === 0, 'todo lo que la app pide en el movil esta en app/www/ (' + montado.copiados.length + ' ficheros, '
     + (montado.bytes / 1e6).toFixed(1) + ' MB)', [...faltan].join(', '));
  /* y nada mas: cada fichero copiado, contra lo que nunca puede viajar (el
     service worker, los controles, los robots, las carpetas de trabajo y
     las fuentes de los idiomas, los documentos, los registros, las tablas
     de Supabase, las claves de nadie) */
  const NUNCA = /^(sw\.js|tools\/|\.github\/|supabase\/|registro\/|chk\/|app\/|capturas-app-store\/|capturas-google-play\/|datos\/(osm-geofabrik|auditoria-osm|entregas|gasolineras\/|verificado\.json|app-store|google-play)|idiomas\/(pl-fuente|pl-lugares|glosario-cat|paginas|privacidad|borrar-cuenta|castellano-aceptado|pantalla-aceptado|etiquetas-sin-traducir)|faq\/(fuente|indice\.json)|frases\.json|enviar-notificacion\.js|consulta-overpass|og-image|.*\.(md|py|sh|sql|overpassql|env|pem|key)$)/;
  const sobran = montado.copiados.filter(f => NUNCA.test(f));
  ok(sobran.length === 0 && montado.copiados.length >= 80 && !fs.existsSync(path.join(WWW, 'sw.js')) && !fs.existsSync(path.join(WWW, 'tools')),
     'y nada mas: ni sw.js, ni controles, ni robots, ni carpetas de trabajo, ni documentos, ni claves (' + montado.copiados.length + ' ficheros cotejados contra la lista de lo que nunca viaja)', sobran.join(', '));

  /* index.html: el de la raiz mas la marca */
  const w = fs.readFileSync(path.join(WWW, 'index.html'), 'utf8');
  ok(w.replace(MARCA + ANCLA, ANCLA) === index && w.indexOf(MARCA + ANCLA) >= 0 && w.split(MARCA).length === 2,
     'app/www/index.html es el index.html de la raiz mas la linea «window.TGO_NATIVO = true», delante del bloque TGO-NATIVO');
  /* lo que esa marca tiene que encontrar en index.html */
  ok(/window\.TGO_NATIVO = window\.TGO_NATIVO === true;/.test(index) && /function tgoFetchDatos\(ruta, opc\)/.test(index)
     && /var TGO_BASE_VIVA = 'https:\/\/tenerifego\.app\/';/.test(index),
     'index.html: la marca se respeta (TGO_NATIVO === true), tgoFetchDatos y la direccion viva');
  const csp = (index.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/) || [, ''])[1];
  ok(/connect-src [^;]*https:\/\/tenerifego\.app[ ;]/.test(csp) && !/jerome4551\.github\.io/.test(csp), 'la CSP deja pedir a la web viva, en su dominio (connect-src https://tenerifego.app), y ya no a la direccion vieja');
  ok(/if \(window\.TGO_NATIVO\) return;\s*\n\s*\/\/ Registrar tras 'load'/.test(index), 'sin service worker con la marca');
  ok(/if \(window\.TGO_NATIVO\) return true;\s*\/\/ TGO-NATIVO/.test(index) && /!window\.TGO_NATIVO && \(isStandalone\(\) \|\| \('serviceWorker' in navigator\)\)/.test(index),
     'con la marca cuenta como instalada (ni banner de instalar ni boton flotante)');
  ok(/var PUSH_BOTONES = \[\['auth-push-btn', 'auth-push-msg'\], \['auth-push-btn-invitado', 'auth-push-msg-invitado'\]\];/.test(index)
     && /if \(window\.TGO_NATIVO\) \{ b\.hidden = true; var mN = document\.getElementById\(par\[1\]\); if \(mN\) mN\.hidden = true; return; \}/.test(index),
     'los dos botones de avisos push (el de la cuenta y el de «Continuar como invitado») y sus mensajes se esconden con la marca');
  ok(/if \(window\.TGO_NATIVO\) return fetch\(DETALLE_URL\)/.test(index) && /if \(window\.TGO_NATIVO\) return Promise\.resolve\(null\);/.test(index),
     'el mapa detallado: con la marca viaja dentro (nada que descargar ni borrar)');
  ok(/emailRedirectTo: window\.TGO_NATIVO \? TGO_BASE_VIVA :/.test(index), 'el correo de confirmacion de la cuenta vuelve a la web viva, no a capacitor://');
  for (const ruta of ['datos/precios-gasolineras.json', 'datos/gasolineras-municipio.json']) {
    ok(new RegExp("tgoFetchDatos\\('" + ruta.replace(/[./]/g, '\\$&') + "'").test(index), ruta + ' se pide con tgoFetchDatos');
  }
  ok(/await tgoFetchDatos\(WX_URL, op\)/.test(index), 'los avisos de AEMET se piden con tgoFetchDatos');
  ok(/var pedir = typeof tgoFetchDatos === 'function' \? tgoFetchDatos : fetch;/.test(lee('modulos/cielo.js')), 'los elementos de los satelites (modulos/cielo.js), tambien');

  /* las plantillas de iOS */
  const plist = fs.existsSync(path.join(PLANTILLAS, 'Info.plist.fragmento.plist')) ? fs.readFileSync(path.join(PLANTILLAS, 'Info.plist.fragmento.plist'), 'utf8') : '';
  for (const clave of Object.keys(CLAVES_USO)) ok(new RegExp('<key>' + clave + '</key>\\s*<string>[^<]{20,}</string>').test(plist), 'Info.plist.fragmento.plist: ' + clave + ' con texto');
  ok(plist === fragmentoPlist(), 'Info.plist.fragmento.plist es el de hoy (las frases de la politica en castellano, los idiomas de SUPPORTED_LANGS)');
  const locs = (plist.match(/<key>CFBundleLocalizations<\/key>\s*<array>([\s\S]*?)<\/array>/) || [, ''])[1];
  const codigos = [...locs.matchAll(/<string>([^<]+)<\/string>/g)].map(m => m[1]);
  ok(IDIOMAS.every(l => codigos.includes(LPROJ[l] || l)) && codigos.length === IDIOMAS.length,
     'CFBundleLocalizations: los ' + IDIOMAS.length + ' idiomas de la app (' + codigos.join(' ') + ')');
  for (const l of IDIOMAS) {
    const f = path.join(PLANTILLAS, (LPROJ[l] || l) + '.lproj', 'InfoPlist.strings');
    const s = fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : '';
    const bien = Object.keys(CLAVES_USO).every(k => new RegExp('^"' + k + '" = ".{20,}";$', 'm').test(s));
    ok(bien && s === stringsDe(l), (LPROJ[l] || l) + '.lproj/InfoPlist.strings: las tres frases, las de la politica de hoy');
  }
  const priv = fs.existsSync(path.join(PLANTILLAS, 'PrivacyInfo.xcprivacy')) ? fs.readFileSync(path.join(PLANTILLAS, 'PrivacyInfo.xcprivacy'), 'utf8') : '';
  ok(/<key>NSPrivacyTracking<\/key>\s*<false\/>/.test(priv) && /<key>NSPrivacyTrackingDomains<\/key>\s*<array\/>/.test(priv)
     && /NSPrivacyCollectedDataTypeEmailAddress/.test(priv) && /NSPrivacyCollectedDataTypeUserID/.test(priv) && /NSPrivacyCollectedDataTypeOtherUserContent/.test(priv)
     && /NSPrivacyCollectedDataTypePreciseLocation/.test(priv) && /NSPrivacyCollectedDataTypeSearchHistory/.test(priv)
     && /NSPrivacyCollectedDataTypeName</.test(priv) && /NSPrivacyCollectedDataTypeHealth</.test(priv) && /NSPrivacyCollectedDataTypeFitness</.test(priv)
     && !/NSPrivacyCollectedDataTypeTracking<\/key>\s*<true\/>/.test(priv),
     'PrivacyInfo.xcprivacy: sin rastreo, sin dominios de rastreo, y los datos que la politica dice que salen (correo, id de usuario, favoritos, coordenadas, busquedas y, con permiso, el perfil: nombre, salud y forma fisica)');
  /* Google Analytics: hasta el 30-10-2026 solo en la web (la marca lo
     apagaba en la app); desde entonces, en ninguna parte (Jerome: «Google
     analítica puedes quitarlo»). Si vuelve -su cargador, su dominio en la
     CSP o el aviso de cookies-, para aqui: el manifiesto no declara
     analitica (ni uso, ni ubicacion aproximada, ni identificador), y la
     politica dice que no la hay. probar_app.js lo mira ademas en el
     navegador. */
  ok(!/googletagmanager|google-analytics|analytics\.google|gtag\(|tgoLoadGA|tgo_consent|consent-banner/.test(index.replace("localStorage.removeItem('tgo_consent')", '')),
     'sin Google Analytics en index.html: ni su cargador, ni sus dominios en la CSP, ni el aviso de cookies');
  ok(/localStorage\.removeItem\('tgo_consent'\)/.test(index) && /if \(\/\^_ga\(_\|\$\)\/\.test\(n\)\)/.test(index),
     'y lo que dejo en el dispositivo quien lo acepto antes (su respuesta y las cookies _ga) se borra al abrir');
  ok(!/NSPrivacyCollectedDataTypePurposeAnalytics|NSPrivacyCollectedDataType(?:ProductInteraction|CoarseLocation|DeviceID)</.test(priv),
     'PrivacyInfo.xcprivacy: sin analitica (ni uso, ni ubicacion aproximada, ni identificador), porque en la app no hay Google Analytics');
  const polEs = JSON.parse(lee('idiomas/privacidad/es.json'));
  ok(/no usa Google Analytics/.test(polEs.ppStatsNo || '') && /no pone cookies/.test(polEs.ppStatsNo || ''),
     'la politica lo dice (ppStatsNo): la app no usa Google Analytics ni pone cookies', polEs.ppStatsNo);
  /* los dos plist bien formados: python3 los lee con plistlib */
  const { spawnSync } = require('child_process');
  for (const f of ['Info.plist.fragmento.plist', 'PrivacyInfo.xcprivacy']) {
    const r = spawnSync('python3', ['-c', 'import plistlib,sys; plistlib.load(open(sys.argv[1],"rb")); print("ok")', path.join(PLANTILLAS, f)]);
    ok(r.status === 0 && /ok/.test(String(r.stdout)), f + ' es un plist bien formado (plistlib)', String(r.stderr).trim().split('\n').pop());
  }
  /* el icono y el arranque */
  const png = f => {
    /* im.load(): Image.open solo lee la cabecera, y un PNG cortado a la mitad
       pasaba con su tamano y su modo; asi se descodifica entero */
    const r = spawnSync('python3', ['-c', 'from PIL import Image; import sys; im=Image.open(sys.argv[1]); im.load(); print(im.size[0], im.size[1], im.mode)', path.join(PLANTILLAS, f)]);
    if (r.status === 0) return String(r.stdout).trim().split(' ');
    /* sin Pillow no se ha mirado nada, y eso no es un hallazgo: la linea de
       python sale tal cual, a principio de linea, y auditar.sh lo cuenta como
       control roto (pip install -r tools/requisitos.txt), no como rojo */
    const err = String(r.stderr).trim().split('\n').pop();
    if (/^ModuleNotFoundError/.test(err)) console.log(err);
    return [err];
  };
  const ic = png('AppIcon-1024.png');
  ok(ic && ic[0] === '1024' && ic[1] === '1024' && ic[2] === 'RGB', 'AppIcon-1024.png: 1024×1024 sin transparencia (lo que pide App Store Connect)', ic && ic.join(' '));
  const sp = png('Splash-2732.png');
  ok(sp && sp[0] === '2732' && sp[1] === '2732', 'Splash-2732.png: 2732×2732 (el arranque de la plantilla de Capacitor)', sp && sp.join(' '));
  ok(fs.existsSync(path.join(PLANTILLAS, 'aplicar.sh')) && fs.existsSync(path.join(APP, 'capacitor.config.json')) && fs.existsSync(path.join(APP, 'package.json')),
     'app/: capacitor.config.json, package.json y ios/plantillas/aplicar.sh');
  const cfg = JSON.parse(fs.readFileSync(path.join(APP, 'capacitor.config.json'), 'utf8'));
  ok(cfg.webDir === 'www' && cfg.appName === 'Tenerife Go', 'capacitor.config.json: webDir www, appName «Tenerife Go»');
  /* el identificador lo decidio Jerome el 30 de octubre de 2026 («Yo quiero
     tenerifego.app»), el mismo en Google Play, y no se cambia despues de
     publicar: si alguno de los cuatro sitios que lo llevan dice otra cosa, rojo.
     Vale en las dos tiendas: Android pide al menos dos partes que empiecen por
     letra (letras, numeros y _), y Apple, letras, numeros, guiones y puntos */
  const ids = [cfg.appId,
    (lee('app/fastlane/Appfile').match(/^app_identifier\(ENV\["TGO_APP_ID"\] \|\| "([^"]*)"\)$/m) || [])[1],
    (lee('app/fastlane/Fastfile').match(/^APP_ID += +ENV\["TGO_APP_ID"\] \|\| "([^"]*)"$/m) || [])[1],
    (lee('.github/workflows/app-store.yml').match(/^ +TGO_APP_ID: (\S+)$/m) || [])[1]];
  ok(ids.every(i => i === 'tenerifego.app'),
     'el identificador de la app, tenerifego.app, igual en capacitor.config.json, Appfile, Fastfile y app-store.yml', ids.join(' · '));
  const gi = lee('.gitignore');
  ok(/^app\/www\/$/m.test(gi) && /^app\/ios\/App\/$/m.test(gi) && /^app\/node_modules\/$/m.test(gi), '.gitignore: app/www/, app/ios/App/ y app/node_modules/ no entran en git');
}

/* ── main ───────────────────────────────────────────────────────────────── */
console.log('=== app/www/: la app para las tiendas, montada de la raiz ===');
const montado = montar();
const strings = escribirStrings();
console.log('  ' + montado.copiados.length + ' ficheros, ' + (montado.bytes / 1e6).toFixed(1) + ' MB en app/www/'
  + (COMPROBAR ? '' : '; InfoPlist.strings en ' + Object.keys(strings).length + ' idiomas'));
if (COMPROBAR) comprobar(montado);
if (mal) { console.log('\n*** ' + mal + ' cosa(s) mal ***'); process.exit(1); }
console.log(COMPROBAR ? '  todo en verde' : '  hecho');
