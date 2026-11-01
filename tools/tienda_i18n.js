#!/usr/bin/env node
/* tienda_i18n.js — traducir lo que escribe el administrador.
 *
 * EL PROBLEMA. El nombre, la descripcion y el eslogan de un anuncio, una
 * excursion o un souvenir los escribe el administrador UNA vez y en
 * castellano. La app los pintaba tal cual en los diez idiomas.
 *
 * EL CIRCUITO. La traduccion vive en la columna `i18n` de cada tabla
 * (supabase/tienda-i18n.sql) y viaja DENTRO de la fila, asi que llega sin
 * una segunda peticion y funciona sin cobertura. Esta herramienta es el
 * puente:
 *
 *     node tools/tienda_i18n.js sacar    > pendiente.json
 *     ... se rellena pendiente.json ...
 *     node tools/tienda_i18n.js meter pendiente.json
 *
 * `sacar` baja lo publicado y escribe UN fichero con lo que falta, con el
 * castellano al lado para traducir mirandolo. `meter` lo sube.
 *
 * POR QUE NO TRADUCE SOLO. Traducir automaticamente significa mandar el
 * texto del administrador a un servicio de terceros. Eso es una decision
 * suya -cuesta dinero y sale de su servidor-, no una que deba tomar una
 * herramienta por su cuenta. Asi que aqui se prepara el trabajo y se
 * sube; quien traduzca es cosa aparte.
 *
 * CREDENCIALES. Salen del entorno, nunca del fichero:
 *     SUPABASE_URL=...  SUPABASE_KEY=...  node tools/tienda_i18n.js sacar
 * Para `meter` hace falta una clave con permiso de escritura: la anon no
 * vale, la RLS solo deja escribir al administrador.
 */
'use strict';

const fs = require('fs');

const TABLAS = {
  anuncios:    { campos: ['name', 'tagline'],        col: { name: 'name', tagline: 'tagline' } },
  souvenirs:   { campos: ['name', 'desc', 'info'],   col: { name: 'name', desc: 'descripcion', info: 'info' } },
  excursiones: { campos: ['name', 'desc'],           col: { name: 'name', desc: 'descripcion' } }
};

/* La lista de idiomas sale del fuente, no escrita aqui: a mano se queda
   vieja el dia que entre uno nuevo y esta herramienta pediria menos
   traducciones de las que hacen falta sin decir nada. */
function idiomas() {
  const src = fs.readFileSync(require('path').join(__dirname, '..', 'index.html'), 'utf8');
  const m = src.match(/SUPPORTED_LANGS\s*=\s*\[([^\]]*)\]/);
  if (!m) { console.error('no encuentro SUPPORTED_LANGS en index.html'); process.exit(1); }
  return m[1].split(',').map(x => x.trim().replace(/^['"]|['"]$/g, ''))
             .filter(Boolean).filter(l => l !== 'es');
}

function entorno() {
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_KEY;
  if (!url || !key) {
    console.error('faltan SUPABASE_URL y SUPABASE_KEY en el entorno.');
    console.error('  SUPABASE_URL=https://xxx.supabase.co SUPABASE_KEY=... node tools/tienda_i18n.js sacar');
    process.exit(1);
  }
  return { url: url.replace(/\/+$/, ''), key };
}

async function pedir(ruta, opciones) {
  const { url, key } = entorno();
  let r;
  try {
    r = await fetch(url + '/rest/v1/' + ruta, Object.assign({
      headers: { apikey: key, Authorization: 'Bearer ' + key,
                 'Content-Type': 'application/json', Prefer: 'return=minimal' }
    }, opciones || {}));
  } catch (e) {
    /* Sin esto, un servidor caido o un SUPABASE_URL mal escrito escupian la
       traza de undici. El que ejecuta esto quiere saber QUE pasa, no donde
       se rompio node. */
    console.error('no se pudo hablar con ' + url + ': ' + (e && e.message ? e.message : e));
    console.error('  -> comprueba SUPABASE_URL y que haya conexion.');
    process.exit(1);
  }
  if (!r.ok) {
    const cuerpo = await r.text();
    console.error('Supabase respondio ' + r.status + ': ' + cuerpo.slice(0, 300));
    if (r.status === 404) console.error('  -> falta ejecutar supabase/tienda-i18n.sql?');
    if (r.status === 401 || r.status === 403) console.error('  -> la clave anon no puede escribir: hace falta una de administrador');
    process.exit(1);
  }
  return r.status === 204 ? null : r.json();
}

async function sacar() {
  const IDI = idiomas();
  const salida = { v: 1, idiomas: IDI, generado: new Date().toISOString().slice(0, 10), filas: [] };
  for (const [tabla, def] of Object.entries(TABLAS)) {
    const cols = ['id', 'i18n'].concat(def.campos.map(c => def.col[c]));
    const filas = await pedir(tabla + '?select=' + cols.join(','));
    for (const f of filas) {
      const orig = {};
      for (const c of def.campos) if (f[def.col[c]]) orig[c] = f[def.col[c]];
      if (!Object.keys(orig).length) continue;      // fila sin nada que traducir
      const yaHay = (f.i18n && typeof f.i18n === 'object') ? f.i18n : {};
      const faltan = IDI.filter(l => {
        const t = yaHay[l];
        return !t || !Object.keys(orig).every(c => typeof t[c] === 'string' && t[c].trim());
      });
      if (!faltan.length) continue;
      const hueco = {};
      for (const l of faltan) {
        hueco[l] = {};
        for (const c of Object.keys(orig)) hueco[l][c] = (yaHay[l] && yaHay[l][c]) || '';
      }
      salida.filas.push({ tabla, id: f.id, es: orig, traducir: hueco });
    }
  }
  const n = salida.filas.length;
  process.stdout.write(JSON.stringify(salida, null, 1) + '\n');
  console.error(n ? ('pendientes: ' + n + ' fila(s) · idiomas: ' + IDI.join(' '))
                  : 'nada pendiente: todo esta traducido');
}

async function meter(fichero) {
  if (!fichero) { console.error('uso: node tools/tienda_i18n.js meter <fichero.json>'); process.exit(1); }
  const d = JSON.parse(fs.readFileSync(fichero, 'utf8'));
  if (!d || !Array.isArray(d.filas)) { console.error('el fichero no tiene `filas`'); process.exit(1); }
  const IDI = idiomas();
  let subidas = 0, vacias = 0;
  for (const fila of d.filas) {
    if (!TABLAS[fila.tabla]) { console.error('tabla desconocida: ' + fila.tabla); process.exit(1); }
    const campos = TABLAS[fila.tabla].campos;
    /* Solo se sube lo que esta ESCRITO. Un hueco vacio no se manda: se
       quedaria pisando lo que ya hubiera con una cadena vacia, y la app
       caeria al castellano creyendo que no hay traduccion. */
    const nuevo = {};
    for (const l of Object.keys(fila.traducir || {})) {
      if (!IDI.includes(l)) { console.error('idioma que no esta en SUPPORTED_LANGS: ' + l); process.exit(1); }
      const t = {};
      for (const c of Object.keys(fila.traducir[l])) {
        if (!campos.includes(c)) { console.error('campo que esa tabla no tiene: ' + fila.tabla + '.' + c); process.exit(1); }
        const v = fila.traducir[l][c];
        if (typeof v === 'string' && v.trim()) t[c] = v.trim();
      }
      if (Object.keys(t).length) nuevo[l] = t;
    }
    if (!Object.keys(nuevo).length) { vacias++; continue; }
    /* Se lee lo que ya hay y se funde, en vez de reemplazar: subir un
       idioma no puede borrar los otros nueve. */
    const [actual] = await pedir(fila.tabla + '?id=eq.' + encodeURIComponent(fila.id) + '&select=i18n');
    const fundido = Object.assign({}, (actual && actual.i18n) || {});
    for (const l of Object.keys(nuevo)) fundido[l] = Object.assign({}, fundido[l] || {}, nuevo[l]);
    await pedir(fila.tabla + '?id=eq.' + encodeURIComponent(fila.id), {
      method: 'PATCH', body: JSON.stringify({ i18n: fundido })
    });
    subidas++;
  }
  console.log('subidas: ' + subidas + ' fila(s)' + (vacias ? ' · ' + vacias + ' sin nada escrito, saltadas' : ''));
}

const orden = process.argv[2];
if (orden === 'sacar') sacar();
else if (orden === 'meter') meter(process.argv[3]);
else {
  console.log('uso:');
  console.log('  node tools/tienda_i18n.js sacar    > pendiente.json');
  console.log('  node tools/tienda_i18n.js meter pendiente.json');
  process.exit(2);
}
