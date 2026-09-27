#!/usr/bin/env node
// auditar_places_osm.js - Tenerife Go
// SOLO LECTURA: compara las coordenadas de `places` (index.html) con OSM y genera un informe.
// No modifica index.html. Sin dependencias (Node >= 14).
//
// Uso:
//   node auditar_places_osm.js <index.html> <osm_pois_tenerife.json> <osm_lugares_tenerife.json> <carpeta_salida>
// Salidas:
//   auditoria_places_osm.json   (indexado por id de place)
//   auditoria_places_osm.csv    (solo 'revisar' y 'discrepancia', de mayor a menor distancia)
'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const crypto = require('crypto');

const [, , HTML, POIS, LUGARES, OUT] = process.argv;
if (!HTML || !POIS || !LUGARES || !OUT) {
  console.error('Uso: node auditar_places_osm.js index.html osm_pois_tenerife.json osm_lugares_tenerife.json carpeta_salida');
  process.exit(1);
}

// ---------- 1. places desde index.html (anclas estrictas: si no cuadran, PARAR)
const html = fs.readFileSync(HTML, 'utf8');
const ANCLA = 'const places = [';
const nAncla = html.split(ANCLA).length - 1;
if (nAncla !== 1) { console.error('PARADA: ancla "' + ANCLA + '" aparece ' + nAncla + ' veces (se esperaba 1)'); process.exit(2); }
const ini = html.indexOf(ANCLA);
const fin = html.indexOf('\n];', ini);
if (fin < 0) { console.error('PARADA: no se encuentra el cierre "\\n];" tras la ancla'); process.exit(2); }
let places;
try {
  places = vm.runInNewContext('(' + html.slice(ini + 'const places = '.length, fin + 2) + ')', Object.create(null), { timeout: 5000 });
} catch (e) { console.error('PARADA: no se pudo leer el array places: ' + e.message); process.exit(2); }
if (!Array.isArray(places) || !places.length) { console.error('PARADA: places vacio'); process.exit(2); }
const malos = places.filter(p => !p || typeof p.id !== 'string' || typeof p.lat !== 'number' || typeof p.lng !== 'number');
if (malos.length) { console.error('PARADA: ' + malos.length + ' places sin id/lat/lng numericos'); process.exit(2); }

// ---------- 2. OSM
function cargar(f, clave) {
  const j = JSON.parse(fs.readFileSync(f, 'utf8'));
  return { meta: j._meta, items: Object.entries(j[clave]).map(([id, o]) => Object.assign({ id }, o)) };
}
const P = cargar(POIS, 'pois');
const L = cargar(LUGARES, 'lugares');
const osm = P.items.concat(L.items).filter(o => o.name);

// ---------- 3. normalizacion de nombres
const STOP = new Set('de del la las el los y e en a al lo the of da do s n'.split(' '));
const GENERICAS = new Set(('playa playas mirador miradores parque museo iglesia ermita charco charcos piscina piscinas ' +
  'natural naturales centro sendero senderos camping zona recreativa area puerto faro bar restaurante hotel parking ' +
  'aparcamiento supermercado farmacia hospital montana roque barranco pico castillo casa plaza calle avenida ' +
  'club cafeteria mercado mercadillo reserva paisaje protegido espacio visitantes informacion oficina turismo ' +
  'cueva cuevas volcan caldera punta risco degollada fuente mar caleta cala muelle embarcadero').split(' '));
function norm(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
}
function tokens(s) { return norm(s).split(' ').filter(t => t && !STOP.has(t)); }
function nucleo(ts) { const c = ts.filter(t => !GENERICAS.has(t)); return c.length ? c : ts; }

function limpiar(nombre) {                    // quita '(...)' y lo que va tras ' — ' o ' · '
  return String(nombre || '').replace(/\([^)]*\)/g, ' ').split(/\s[\u2014\u00b7]\s/)[0];
}
osm.forEach(o => { o._t = [...new Set(tokens(o.name))]; });
const DF = new Map();
osm.forEach(o => o._t.forEach(t => DF.set(t, (DF.get(t) || 0) + 1)));
const NDOC = osm.length;
function peso(t) { return GENERICAS.has(t) ? 0.2 : Math.log(1 + NDOC / (DF.get(t) || 1)); }
function simPonderada(a, b) {                 // Jaccard ponderado (IDF; genericas pesan poco)
  const A = new Set(a), B = new Set(b);
  let wi = 0, wu = 0;
  new Set([...A, ...B]).forEach(t => { const w = peso(t); wu += w; if (A.has(t) && B.has(t)) wi += w; });
  return wu ? wi / wu : 0;
}
const inv = new Map();
osm.forEach((o, i) => o._t.forEach(t => { if (!inv.has(t)) inv.set(t, []); inv.get(t).push(i); }));

// ---------- 4. compatibilidad categoria app <-> OSM
const COMPAT = {
  playa: ['beach'], nudista: ['beach'], piscinas: ['beach', 'swimming_pool'], montana: ['peak', 'volcano'],
  mirador: ['viewpoint', 'observation_tower'], museo: ['museum'], faros: ['lighthouse'],
  hospital: ['hospital'], farmacia: ['pharmacy'], gasolinera: ['fuel'], parking: ['parking'],
  supermercado: ['supermarket', 'convenience'], mercadillo: ['marketplace'], camping: ['camp_site', 'caravan_site'],
  golf: ['golf_course'], animales: ['zoo'], puerto_ocio: ['marina'], puerto_comercial: ['ferry_terminal', 'marina'],
  veterinario: ['veterinary'], oficina_turismo: ['tourist_info'], csalud: ['clinic', 'doctors', 'hospital'],
  barbacoa: ['picnic_site'], ciudad: ['city', 'town', 'village', 'suburb', 'hamlet', 'locality'],
  municipio: ['city', 'town', 'village', 'suburb', 'hamlet', 'locality'],
  naturaleza: ['peak', 'volcano', 'cave_entrance', 'spring', 'cliff', 'waterfall', 'tree', 'beach', 'viewpoint', 'park'],
  cultura: ['museum', 'monument', 'memorial', 'ruins', 'archaeological', 'castle', 'fort', 'attraction', 'theatre',
    'arts_centre', 'christian', 'christian_catholic', 'town_hall', 'library', 'windmill', 'water_mill', 'artwork'],
  familia: ['attraction', 'zoo', 'park', 'playground', 'swimming_pool'],
  gastronomia: ['restaurant', 'cafe', 'bar', 'pub', 'fast_food', 'food_court', 'marketplace'],
};

function hav(lon1, lat1, lon2, lat2) {
  const R = 6371008.8, r = Math.PI / 180;
  const dp = (lat2 - lat1) * r, dl = (lon2 - lon1) * r;
  const a = Math.sin(dp / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(dl / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
function distBbox(p, bb) {                       // 0 si el punto cae dentro del bbox del poligono OSM
  const x = Math.min(Math.max(p.lng, bb[0]), bb[2]);
  const y = Math.min(Math.max(p.lat, bb[1]), bb[3]);
  return hav(p.lng, p.lat, x, y);
}

// ---------- 5. emparejar
// Paso local: objeto OSM compatible a <= 500 m con relacion de nombre (confirma o marca 'revisar').
// Paso fuerte: nombre muy parecido (Jaccard ponderado >= 0.6) y compatible a <= 5 km (detecta desplazamientos).
const RADIO = 5000, LOCAL = 500, UMBRAL = 0.6;
const NUCLEO = new Set(['ciudad', 'municipio']);
const res = {};
const cuenta = { ok: 0, revisar: 0, discrepancia: 0, sin_match: 0, no_comparable: 0 };
for (const p of places) {
  const r = { name: p.name, category: p.category, lat: p.lat, lng: p.lng };
  const compatFc = COMPAT[p.category];
  if (!compatFc) { r.estado = 'no_comparable'; cuenta.no_comparable++; res[p.id] = r; continue; }
  const tp = [...new Set(tokens(limpiar(p.name)))];
  const setP = new Set(tp);
  const cand = new Set();
  tp.forEach(t => (inv.get(t) || []).forEach(i => cand.add(i)));
  let fuerte = null, local = null;
  for (const i of cand) {
    const o = osm[i];
    if (!(o.fclass || []).some(fc => compatFc.includes(fc))) continue;
    const d = hav(p.lng, p.lat, o.lng, o.lat);
    if (d > RADIO) continue;
    const dEf = o.bbox ? Math.min(d, distBbox(p, o.bbox)) : d;
    const sim = simPonderada(tp, o._t);
    const comparteEsp = o._t.some(t => setP.has(t) && !GENERICAS.has(t));
    const subconj = o._t.length && o._t.every(t => setP.has(t));
    const via = sim >= UMBRAL ? 'nombre' : (comparteEsp && sim >= 0.4) ? 'comparte' : (subconj && dEf <= 150) ? 'generico' : null;
    if (!via) continue;
    const c = { o, d, dEf, sim, via };
    if (c.via === 'nombre' && (!fuerte || dEf < fuerte.dEf)) fuerte = c;
    if (dEf <= LOCAL && (!local || dEf < local.dEf)) local = c;
  }
  // un 'local' solo generico (p.ej. 'Mirador') no tapa un match fuerte lejano
  let best = null;
  if (local && (local.via !== 'generico' || !fuerte || fuerte.dEf <= LOCAL)) best = (fuerte && fuerte.dEf < local.dEf) ? fuerte : local;
  else best = fuerte || local;
  if (!best) { r.estado = 'sin_match'; cuenta.sin_match++; res[p.id] = r; continue; }
  const o = best.o;
  const [uOk, uRev] = NUCLEO.has(p.category) ? [1000, 2500] : [150, 500];   // nucleos: centro difuso
  r.estado = best.dEf <= uOk ? 'ok' : best.dEf <= uRev ? 'revisar' : 'discrepancia';
  cuenta[r.estado]++;
  Object.assign(r, {
    dist_m: Math.round(best.d), dist_efectiva_m: Math.round(best.dEf), similitud: +best.sim.toFixed(2), via: best.via,
    osm_id: o.id, osm_name: o.name, osm_fclass: o.fclass, osm_lat: o.lat, osm_lng: o.lng, osm_geom: o.geom,
    osm_muni: o.muni,
    osm_mapa: 'https://www.openstreetmap.org/?mlat=' + o.lat + '&mlon=' + o.lng + '#map=18/' + o.lat + '/' + o.lng,
  });
  res[p.id] = r;
}

// ---------- 6. salida
fs.mkdirSync(OUT, { recursive: true });
const md5 = crypto.createHash('md5').update(fs.readFileSync(HTML)).digest('hex');
const informe = {
  _meta: {
    index_html: path.basename(HTML), index_md5: md5, places: places.length,
    osm_datos_a: P.meta.datos_osm_a, generado: new Date().toISOString().slice(0, 10),
    criterios: 'solo categorias comparables con OSM y fclass compatible. via=nombre: Jaccard ponderado (IDF) >= 0.6 hasta 5 km; ' +
      'via=comparte (token propio comun y Jaccard>=0.4) solo hasta 500 m; via=generico (nombre OSM generico contenido) solo ' +
      'hasta 150 m. dist_efectiva = distancia al bbox si el objeto OSM es poligono. ok<=150 m, revisar<=500 m, ' +
      'discrepancia>500 m (ciudad/municipio: ok<=1000, revisar<=2500)',
    aviso: 'OSM no es fuente oficial. Un estado revisar/discrepancia es una PISTA: verificar contra la fuente oficial ' +
      'antes de tocar ninguna coordenada. sin_match no implica error.',
  },
  resumen: cuenta,
  places: res,
};
fs.writeFileSync(path.join(OUT, 'auditoria_places_osm.json'), JSON.stringify(informe, null, 1));
const filas = Object.entries(res).filter(([, r]) => r.estado === 'revisar' || r.estado === 'discrepancia')
  .sort((a, b) => b[1].dist_efectiva_m - a[1].dist_efectiva_m);
const q = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
const csv = ['estado,id,name,category,lat,lng,dist_efectiva_m,similitud,via,osm_id,osm_name,osm_fclass,osm_lat,osm_lng,osm_mapa']
  .concat(filas.map(([id, r]) => [r.estado, id, r.name, r.category, r.lat, r.lng, r.dist_efectiva_m, r.similitud,
    r.via, r.osm_id, r.osm_name, (r.osm_fclass || []).join('|'), r.osm_lat, r.osm_lng, r.osm_mapa].map(q).join(',')));
fs.writeFileSync(path.join(OUT, 'auditoria_places_osm.csv'), '\ufeff' + csv.join('\n') + '\n');
console.log('places ' + places.length + ' | index md5 ' + md5 + ' | ' + JSON.stringify(cuenta));
