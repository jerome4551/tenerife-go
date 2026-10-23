#!/usr/bin/env node
/* auditar_emergencias.js — el panel 🆘 EMERGENCIAS sin navegador.
 *
 *     node tools/auditar_emergencias.js
 *
 * Carga modulos/emergencias.js en un ambito falso (vm) y coteja:
 *   1. EMERG_UI: las diez lenguas en cada fila, ninguna vacia; los {huecos}
 *      de la castellana en todas; formas de plural (pl 3, zh y zht 1, el
 *      resto 2); ninguna comilla doble ASCII; zh y zht con lo mismo fuera de
 *      los ideogramas (la paridad de siempre); el bulgaro sin letras
 *      cirilicas ajenas.
 *   2. Que cada fila que pide el modulo existe (guias, fuentes, canales,
 *      mochila, colores y las llamadas t('...') del codigo) y que no sobra
 *      ninguna. Las del armazon, en UI_TX de index.html con sus diez lenguas.
 *   3. Las fuentes: cada guia (salvo «canales») lleva al menos una y todas
 *      existen; todo enlace es https y de un dominio de la lista oficial.
 *      Las guias de «Que hacer si…» estan en uno de sus grupos (SUBGRUPOS),
 *      los «Vea tambien» llevan a guias que existen, las banderas son las de
 *      las playas de Canarias y los telefonos solo cifras.
 *   4. index.html: el boton SOS en la barra, el panel con su tel:112 en el
 *      armazon (llama aunque el modulo no cargue), el CARGA-PEREZOSA y
 *      SOS_DATOS: cada fichero que lista es de un robot con su flujo
 *      encendido, y ningun robot de datos esta encendido sin que la app lo
 *      lea. sw.js: el modulo en CORE, con su estrategia de cache al instante
 *      y FUERA de la lista «red primero». El atajo del manifiesto.
 *      Los avisos de AEMET se usan solo si index.html los tiene (typeof), y
 *      los titulares de las alertas van en castellano y declarados.
 *   5. Seguridad: sin eval, sin console.log, y innerHTML solo en ico() (los
 *      SVG de SOS_ICO, de este mismo fichero).
 * Sale con 1 si algo falla.
 */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const RAIZ = path.join(__dirname, '..');
const LANGS = ['es', 'en', 'fr', 'de', 'it', 'nl', 'zh', 'zht', 'bg', 'pl'];
const FORMAS = { pl: 3, zh: 1, zht: 1 };
const IDEO = /[㐀-䶿一-鿿豈-﫿]/g;
const HUECO = /\{(\w+)\}/g;
const DOMINIOS = ['gobiernodecanarias.org', '112canarias.com', 'boe.es', 'involcan.org', 'ign.es', 'incibe.es', 'usgs.gov',
  'rtvc.es', 'diariodeavisos.elespanol.com', 'x.com', 'instagram.com', 'whatsapp.com', 'grafcan.es', 'tenerife.es', 'aena.es',
  /* 22 de octubre, tarde: maremotos, los otros riesgos y el mar */
  'aemet.es', 'sanidad.gob.es', 'transportes.gob.es', 'salvamentomaritimo.es', 'doi.org', 'aeped.es', 'murciasalud.es',
  /* 22 de octubre, noche: las fuentes de lo verificado y de las cuatro guias
     nuevas (la guia de Proteccion Civil de 2025, la IVHHN, Tenerife ON, el
     Consejo Europeo de Resucitacion y sus traducciones oficiales, el NHS, la
     SEUP, la AESAN, el Servicio de Informacion Toxicologica...) */
  'ivhhn.org', 'educacionfpydeportes.gob.es', 'interior.gob.es', 'tenerifeon.es', 'europa.eu', 'erc.edu', 'ircouncil.it',
  'resus.org.uk', 'ilcor.org', 'nhs.uk', 'seup.org', 'comunidad.madrid', 'alicante.es', 'aesan.gob.es', 'mjusticia.gob.es'];
/* Los robots que dan datos al panel: su fichero y su flujo */
const ROBOTS = { 'sismos-ign.json': 'sismos-ign.yml', 'semaforo-involcan.json': 'semaforo-involcan.yml', 'alertas-canarias.json': 'alertas-canarias.yml' };
const SHELL = ['sosNavAria', 'sosTitulo', 'sosLlamar', 'sosLlamarSub', 'sosCargando', 'sosErrorCarga', 'sosReintentar', 'sosVolver'];

let fallos = 0, hechos = 0;
function ok(c, txt, det) { hechos++; if (c) console.log('  OK  ' + txt); else { fallos++; console.log('  MAL ' + txt + (det !== undefined ? '   -> ' + det : '')); } }

const MOD = path.join(RAIZ, 'modulos', 'emergencias.js');
const fuente = fs.readFileSync(MOD, 'utf8');
const idx = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
const sw = fs.readFileSync(path.join(RAIZ, 'sw.js'), 'utf8');

/* ── el modulo, en un ambito falso ── */
const nada = () => null;
const caja = {
  window: {}, console: { warn() {}, error() {} },
  document: { getElementById: nada, addEventListener() {}, createElement: () => ({ style: {}, setAttribute() {}, appendChild() {} }), head: { appendChild() {} }, documentElement: { classList: { add() {}, remove() {} } } },
  history: { pushState() {}, back() {}, go() {} }, location: { hash: '' }, navigator: {},
  setTimeout, clearTimeout, Promise, Intl, Date, JSON, Math, Object, Array, String, Number, RegExp
};
caja.window = caja; caja.self = caja;
caja.addEventListener = () => {};
vm.createContext(caja);
let cargado = true;
try { vm.runInContext(fuente, caja, { filename: 'modulos/emergencias.js' }); } catch (e) { cargado = false; console.log('  MAL el modulo no carga: ' + e.message); fallos++; }
const SOS = caja.TG_SOS;
console.log('— el modulo');
ok(cargado && !!SOS, 'modulos/emergencias.js carga y expone window.TG_SOS');
if (!SOS) { console.log('\nRESULTADO: ' + fallos + ' fallo(s)'); process.exit(1); }
const UI = SOS.filas;

/* ── 1. las filas ── */
console.log('— las filas de EMERG_UI (' + Object.keys(UI).length + ')');
let malas = [];
for (const [k, fila] of Object.entries(UI)) {
  const huecos = [...new Set((fila.es || '').match(HUECO) || [])].sort().join();
  for (const l of LANGS) {
    const v = fila[l];
    if (typeof v !== 'string' || !v.trim()) { malas.push(k + '.' + l + ' vacia'); continue; }
    if (v.includes('"')) malas.push(k + '.' + l + ' lleva comilla doble ASCII');
    const h = [...new Set(v.match(HUECO) || [])].sort().join();
    if (h !== huecos) malas.push(k + '.' + l + ' huecos ' + h + ' / es ' + huecos);
    if ((fila.es || '').includes('|') || v.includes('|')) {
      const n = v.split('|').length, quiero = FORMAS[l] || 2;
      if (n !== quiero) malas.push(k + '.' + l + ' ' + n + ' formas de plural, tocan ' + quiero);
    }
  }
  if (fila.zh && fila.zht && fila.zh.replace(IDEO, '') !== fila.zht.replace(IDEO, '')) malas.push(k + ' paridad zh/zht');
  if (fila.bg && /[ёєіїґыэЁЄІЇҐЫЭ]/.test(fila.bg)) malas.push(k + '.bg letra cirilica ajena');
}
ok(!malas.length, 'diez lenguas, huecos, plurales, comillas, paridad zh/zht y bulgaro', malas.slice(0, 6).join(' · '));

/* ── 2. filas pedidas y filas que sobran ── */
console.log('— las filas que se piden');
const pedidas = new Set();
const pide = k => { if (k) pedidas.add(k); };
for (const g of SOS.guias) {
  pide(g.t);
  for (const b of g.b) {
    ['p', 'h', 'nota'].forEach(x => pide(b[x]));
    (b.lista || b.pasos || []).forEach(pide);
    if (b.enlace) pide(b.enlace[0]);
    if (b.tel) pide(b.tel[0]);
    if (b.banderas) b.banderas.forEach(x => pide(x[1]));
    if (b.planes) b.planes.forEach(x => { pide(x.k); if (x.n) pide(x.n); });
    if (b.semaforo) b.semaforo.forEach(n => { pide(n.t); pide(n.q); n.l.forEach(pide); pide('sosColor_' + n.c); });
  }
}
(SOS.subgrupos || []).forEach(sg => pide(sg[1]));
for (const f of Object.values(SOS.fuentes)) { pide(f.fte); if (/^sosOrg/.test(f.org)) pide(f.org); }
const marcasMal = [];
for (const c of SOS.canales) {
  if (/^sosOrg/.test(c.org)) pide(c.org);
  c.l.forEach(x => { if (/^marca:/.test(x[0])) { if (!SOS.marcas[x[0].slice(6)]) marcasMal.push(x[0]); } else pide(x[0]); });
}
SOS.mochila.forEach(id => pide('sosMoc_' + id));
['verde', 'amarillo', 'naranja', 'rojo'].forEach(c => pide('sosColor_' + c));
/* las de t('…') y las de los botones que llaman, chipTel('…', numero) */
for (const m of fuente.matchAll(/\b(?:t|chipTel)\('([A-Za-z0-9_]+)'\s*[,)]/g)) pide(m[1]);
ok(!marcasMal.length, 'cada marca de los canales (X, Instagram) esta en MARCAS: no son filas de texto', marcasMal.join(', '));
const enUITX = k => new RegExp('"' + k + '"\\s*:\\s*\\{').test(idx);
const faltan = [...pedidas].filter(k => !UI[k] && !enUITX(k));
ok(!faltan.length, 'cada fila que pide el modulo existe (' + pedidas.size + ')', faltan.join(', '));
const sobran = Object.keys(UI).filter(k => !pedidas.has(k));
ok(!sobran.length, 'ninguna fila de EMERG_UI sobra', sobran.join(', '));
const dobles = Object.keys(UI).filter(k => SHELL.includes(k));
ok(!dobles.length, 'las filas del armazon no se repiten en el modulo', dobles.join(', '));
const shellMal = SHELL.filter(k => {
  const m = idx.match(new RegExp('"' + k + '"\\s*:\\s*(\\{[^}]*\\})'));
  if (!m) return true;
  try { const f = JSON.parse(m[1]); return LANGS.some(l => !f[l]); } catch (e) { return true; }
});
ok(!shellMal.length, 'las ' + SHELL.length + ' filas del armazon estan en UI_TX con sus diez lenguas', shellMal.join(', '));
/* Lo que el HTML del armazon trae escrito antes de traducirse tiene que ser
   el castellano de su fila (24 de octubre de 2026): la barra del 112 seguia
   diciendo «Atienden en español, inglés y alemán» cuando la fila ya decia
   «en muchos idiomas». Antes de pintarse, o sin JavaScript, se veria el dato
   viejo. */
const filaEs = k => { const m = idx.match(new RegExp('"' + k + '"\\s*:\\s*(\\{[^}]*\\})')); try { return m ? JSON.parse(m[1]).es : null; } catch (e) { return null; } };
const armazon = idx.slice(idx.indexOf('<!-- ══ EMERGENCIAS ══ -->'), idx.indexOf('<!-- ══ fin EMERGENCIAS ══ -->'));
const textoMal = [];
for (const m of armazon.matchAll(/<(\w+)[^>]*\sdata-tx="(\w+)"[^>]*>([^<]*)<\/\1>/g)) if (SHELL.includes(m[2]) && m[3] !== filaEs(m[2])) textoMal.push(m[2] + ': «' + m[3] + '»');
for (const m of idx.matchAll(/\sdata-tx-aria="(sos\w+)"[^>]*\saria-label="([^"]*)"/g)) if (m[2] !== filaEs(m[1])) textoMal.push(m[1] + ' (aria): «' + m[2] + '»');
ok(!textoMal.length, 'lo que el armazon trae escrito antes de traducirse es el castellano de su fila', textoMal.join(' · '));

/* ── 3. fuentes y enlaces ── */
console.log('— fuentes y enlaces');
const sinFuente = SOS.guias.filter(g => g.id !== 'canales' && !(g.f || []).length).map(g => g.id);
ok(!sinFuente.length, 'cada guia lleva sus fuentes', sinFuente.join(', '));
const fuenteRota = [];
SOS.guias.forEach(g => (g.f || []).forEach(id => { if (!SOS.fuentes[id]) fuenteRota.push(g.id + ':' + id); }));
ok(!fuenteRota.length, 'toda fuente citada existe', fuenteRota.join(', '));
const urls = [];
Object.values(SOS.fuentes).forEach(f => urls.push(f.url));
Object.values(SOS.urls).forEach(u => urls.push(u));
SOS.canales.forEach(c => c.l.forEach(x => urls.push(x[1])));
SOS.guias.forEach(g => g.b.forEach(b => { if (b.enlace) urls.push(b.enlace[1]); }));
/* los grupos, los «Vea tambien», las banderas y los telefonos */
const SUBS = (SOS.subgrupos || []).map(sg => sg[0]);
const sinGrupo = SOS.guias.filter(g => g.grupo === 'hacer' && !SUBS.includes(g.sub)).map(g => g.id);
ok(SUBS.length > 0 && !sinGrupo.length, 'cada guia de «Qué hacer si…» esta en uno de sus ' + SUBS.length + ' grupos', sinGrupo.join(', '));
const vacios = SUBS.filter(s => !SOS.guias.some(g => g.grupo === 'hacer' && g.sub === s));
ok(!vacios.length, 'ningun grupo vacio', vacios.join(', '));
const idsGuias = new Set(SOS.guias.map(g => g.id));
ok(idsGuias.size === SOS.guias.length && [...idsGuias].every(id => /^[a-z]+$/.test(id)), 'los ids de las guias, unicos y en minusculas (#sos-<guia>)');
/* las banderas del Decreto 116/2018 y de la Orden de 22 de julio de 2022
   (anexo III): las cuatro de colores, la de cuadros de los deportes
   nauticos, dos rojas a los lados de un peligro y la bicolor de zona segura */
const BANDERAS = ['verde', 'amarilla', 'roja', 'purpura', 'ajedrez', 'dosrojas', 'segura'];
const irMal = [], banMal = [], telMal = [];
SOS.guias.forEach(g => g.b.forEach(b => {
  if (b.ir && (!idsGuias.has(b.ir) || b.ir === g.id)) irMal.push(g.id + '→' + b.ir);
  if (b.banderas) b.banderas.forEach(x => { if (!BANDERAS.includes(x[0])) banMal.push(g.id + ':' + x[0]); });
  if (b.tel && !/^\d{3,12}$/.test(b.tel[1])) telMal.push(g.id + ':' + b.tel[1]);
}));
ok(!irMal.length, 'cada «Vea también» lleva a otra guia que existe', irMal.join(', '));
ok(!banMal.length, 'las banderas son las de las playas de Canarias (' + BANDERAS.join(', ') + ')', banMal.join(', '));
ok(!telMal.length && /^\d{9}$/.test(SOS.telSalvamento || ''), 'los telefonos que se marcan, solo cifras (Salvamento Maritimo, ' + SOS.telSalvamento + ')', telMal.join(', '));
/* los de la tarjeta del 112: el 012 por su numero largo (el corto no vale
   desde un movil extranjero) y el Servicio de Informacion Toxicologica */
const TELS = SOS.telefonos || {};
ok(TELS.salvamento === SOS.telSalvamento && TELS.info012 === '+34922470012' && TELS.toxico === '+34915620420',
  'la tarjeta del 112: el 012 (' + TELS.info012 + ') y toxicologia (' + TELS.toxico + '), con el +34', JSON.stringify(TELS));
const urlMal = urls.filter(u => {
  let h; try { const x = new URL(u); if (x.protocol !== 'https:') return true; h = x.hostname; } catch (e) { return true; }
  return !DOMINIOS.some(d => h === d || h.endsWith('.' + d));
});
ok(!urlMal.length, 'los ' + urls.length + ' enlaces son https y de dominios oficiales o de la lista', urlMal.join(' '));

/* ── 4. index.html, sw.js, manifiesto ── */
console.log('— index.html, sw.js y el manifiesto');
ok(/<button[^>]*id="v19-nav-sos"[^>]*onclick="abrirSOS\(\)"/.test(idx), 'el boton SOS esta en la barra de abajo');
const nav = idx.slice(idx.indexOf('id="v19-nav-routes"'), idx.indexOf('id="v19-nav-chat"'));
ok(nav.includes('id="v19-nav-sos"'), 'el boton SOS va entre Rutas y Asistente');
ok(/<span id="nav-lbl-sos" data-sin-traducir="[^"]+">SOS<\/span>/.test(idx), 'su rotulo, «SOS», declarado sin traducir (sigla internacional) y sin fila de texto');
const panel = (idx.match(/<div id="sos-panel"[\s\S]*?<a class="sos-112" id="sos-112" href="tel:112">/) || [''])[0];
ok(!!panel, 'el armazon lleva el 112 (tel:112) fuera del modulo');
ok(/\/\* CARGA-PEREZOSA: modulos\/emergencias\.js/.test(idx), 'el cargador declara CARGA-PEREZOSA: modulos/emergencias.js');
ok(/window\.SOS_DATOS = \[/.test(idx), 'SOS_DATOS esta declarado');
const datosLista = ((idx.match(/window\.SOS_DATOS = \[([^\]]*)\]/) || [, ''])[1].match(/'[^']*'/g) || []).map(x => x.slice(1, -1));
const flujo = f => { const p = path.join(RAIZ, '.github', 'workflows', f); return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null; };
const encendido = f => { const y = flujo(f); return !!y && /^  schedule:/m.test(y); };
const datosMal = datosLista.filter(u => { const m = u.match(/^\.\/datos\/([a-z-]+\.json)$/); return !m || !ROBOTS[m[1]] || !encendido(ROBOTS[m[1]]); });
ok(!datosMal.length, 'SOS_DATOS (' + (datosLista.length ? datosLista.join(', ') : 'vacio') + '): solo ficheros de robots con su flujo encendido', datosMal.join(', '));
const sueltos = Object.entries(ROBOTS).filter(([j, y]) => encendido(y) && !datosLista.includes('./datos/' + j)).map(([j]) => j);
ok(!sueltos.length, 'ningun robot de datos encendido sin que la app lea su fichero', sueltos.join(', '));
ok(/typeof wxVigentes === 'function' && typeof wxLineas === 'function'/.test(fuente), 'los avisos de AEMET, solo si index.html los tiene (typeof)');
ok(/setAttribute\('lang', 'es'\)[\s\S]{0,200}data-sin-traducir', 'titular oficial/.test(fuente), 'los titulares de las alertas, en castellano (lang=es) y declarados sin traducir');
ok(/'\.\/modulos\/emergencias\.js'/.test(sw.slice(sw.indexOf('const CORE'), sw.indexOf('];', sw.indexOf('const CORE')))), 'sw.js lo precachea (CORE)');
ok(/url\.pathname\.endsWith\('\/modulos\/emergencias\.js'\)\)\s*\{\s*const red = fetch/.test(sw), 'sw.js lo sirve de la cache al instante, con la red por detras');
const redPrimero = sw.slice(sw.indexOf("if (req.url.endsWith('index.html')"), sw.indexOf('return fetch(req).then(res => {', sw.indexOf("if (req.url.endsWith('index.html')")));
ok(!redPrimero.includes('emergencias'), 'y NO esta en la lista «red primero» (no espera a una red saturada)');
/* Lo que traen los robots, al reves: con `cached || fetch` el primer fichero
   que entrase se quedaria para siempre. Los de los robots que hay, y los de
   SOS_DATOS, en «red primero». */
const robotsHay = Object.keys(ROBOTS).filter(j => flujo(ROBOTS[j]) !== null).map(j => './datos/' + j);
const sinRed = Array.from(new Set(robotsHay.concat(datosLista))).filter(u => !redPrimero.includes("url.pathname.endsWith('" + u.slice(1) + "')"));
ok(!sinRed.length, 'los ficheros de los robots (' + (robotsHay.length || 'ninguno') + '), en «red primero»', sinRed.join(', '));
let man = {}; try { man = JSON.parse(fs.readFileSync(path.join(RAIZ, 'manifest.webmanifest'), 'utf8')); } catch (e) {}
ok((man.shortcuts || []).some(s => s.url === './index.html#sos'), 'el manifiesto lleva el atajo SOS');

/* ── 5. seguridad ── */
console.log('— seguridad');
ok(!/\beval\s*\(|new Function\s*\(/.test(fuente), 'sin eval ni new Function');
ok(!/console\.log/.test(fuente), 'sin console.log');
const ih = (fuente.match(/\.innerHTML\s*=/g) || []).length;
ok(ih === 1 && /s\.innerHTML = A \+ \(SOS_ICO\[nombre\] \|\| ''\) \+ '<\/svg>'/.test(fuente), 'innerHTML solo en ico(), con los SVG del propio fichero', ih);
const svgMal = Object.entries(SOS_ICO_de(fuente)).filter(([, v]) => /<script|on\w+=|href|<image|'/.test(v)).map(([k]) => k);
ok(!svgMal.length, 'los iconos no llevan script, on*, href, image ni comilla simple', svgMal.join(', '));

function SOS_ICO_de(src) {
  const m = src.match(/var SOS_ICO = \{([\s\S]*?)\n  \};/);
  const r = {};
  if (m) for (const x of m[1].matchAll(/(\w+): '([^']*)'/g)) r[x[1]] = x[2];
  return r;
}

console.log('\n' + hechos + ' controles · ' + (fallos ? fallos + ' fallo(s)' : 'EN VERDE'));
process.exit(fallos ? 1 : 0);
