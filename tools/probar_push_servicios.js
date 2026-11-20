#!/usr/bin/env node
/* probar_push_servicios.js — el envio de cada manana solo va a los servicios de avisos de los navegadores, y con plazo
 * (20 de noviembre de 2026, prueba de los dos moviles, bloque 5; Jerome: «5 si»).
 *
 * EL HUECO QUE TAPA
 *   guardar_push_sub() daba de alta cualquier direccion que empezara por https:// (la llama cualquiera: la clave anon
 *   va en la app), y enviar-notificacion.js enviaba a todas, una a una y sin plazo. Con direcciones inventadas se
 *   podia llenar el tope de 50.000 suscripciones y alargar el envio de cada manana. La funcion ya solo da de alta las
 *   de los servicios de los navegadores (supabase/push-servicios.sql, probada en un PostgreSQL 16: ver
 *   AUDITORIA-FINAL.md); aqui, el envio, con la misma regla:
 *     · a las de esos servicios (el de Google, el de Mozilla, cualquier subdominio de push.apple.com y cualquiera de
 *       notify.windows.com) les llega su aviso, una vez;
 *     · a las de otro sitio, o con trampa (el nombre del servicio dentro de otro dominio, en la ruta, con usuario o
 *       con puerto, sin https), no les llega nada, y el resumen dice cuantas eran;
 *     · cada envio lleva el TTL de siempre y el plazo de 10 s (timeout, la opcion de web-push 3.6.7);
 *     · en lo que escribe el envio no sale ninguna direccion.
 *   Con Supabase y web-push de mentira: nada sale de la maquina.
 *
 *     node tools/probar_push_servicios.js [RAIZ]      (RAIZ: otra copia del repositorio, por ejemplo la de antes)
 */
'use strict';
const path = require('path');
const Module = require('module');
const RAIZ = path.resolve(process.argv[2] || path.join(__dirname, '..'));

let bien = 0, mal = 0;
function ver(c, txt, det) {
  if (c) { bien++; console.log('  OK  ' + txt); }
  else { mal++; console.log('  MAL ' + txt + (det !== undefined ? '   -> ' + String(det).slice(0, 300) : '')); }
}

const BUENAS = [
  ['https://fcm.googleapis.com/fcm/send/prueba-1', 'Chrome, Opera para Android y Samsung Internet (fcm.googleapis.com)'],
  ['https://fcm.googleapis.com/wp/prueba-2', 'el mismo servicio con la ruta /wp/'],
  ['https://updates.push.services.mozilla.com/wpush/v2/prueba-3', 'Firefox (updates.push.services.mozilla.com)'],
  ['https://web.push.apple.com/prueba-4', 'Safari y el iPhone (web.push.apple.com)'],
  ['https://api.push.apple.com/prueba-5', 'otro subdominio de push.apple.com (Apple pide aceptarlos todos)'],
  ['https://wns2-par02p.notify.windows.com/w/?token=prueba-6', 'Edge en Windows (notify.windows.com)'],
  ['https://FCM.GoogleApis.com/fcm/send/prueba-7', 'el nombre del servicio en mayusculas'],
];
const MALAS = [
  ['https://push.prueba.invalid/prueba-11', 'una direccion inventada'],
  ['https://fcm.googleapis.com.evil.invalid/prueba-12', 'el nombre de un servicio dentro de otro dominio'],
  ['https://evil.invalid/fcm.googleapis.com/prueba-13', 'el nombre de un servicio en la ruta de otro'],
  ['https://fcm.googleapis.com@evil.invalid/prueba-14', 'con usuario delante de otro dominio'],
  ['https://fcm.googleapis.com:8443/prueba-15', 'con puerto'],
  ['https://fcm.googleapis.com', 'sin la barra despues del nombre'],
  ['https://fcm.googleapis.com./prueba-17', 'con un punto al final del nombre'],
  ['https://push.apple.com/prueba-18', 'push.apple.com sin subdominio'],
  ['https://notify.windows.com/prueba-19', 'notify.windows.com sin subdominio'],
  ['https://x.push.apple.com.evil.invalid/prueba-20', 'un subdominio de Apple dentro de otro dominio'],
  ['http://fcm.googleapis.com/fcm/send/prueba-21', 'sin https'],
];

/* lo que hace PostgREST con ?order=…&offset=…&limit=…: el trozo pedido, y nunca mas de 1.000 filas */
function pagina(lista, u) {
  const q = new URL(u).searchParams, orden = (q.get('order') || '').split('.')[0];
  const l = orden ? lista.slice().sort((a, b) => a[orden] < b[orden] ? -1 : a[orden] > b[orden] ? 1 : 0) : lista;
  const desde = Number(q.get('offset') || 0), cuantas = Math.min(Number(q.get('limit') || Infinity), 1000);
  return l.slice(desde, desde + cuantas);
}

(async () => {
  console.log('=== el envio de cada manana, con suscripciones de los servicios de avisos y de otros sitios ===');
  console.log('    (enviar-notificacion.js de ' + RAIZ + ')');
  const enviados = [];
  const cargar = Module._load;
  Module._load = function (pedido, ...resto) {
    if (pedido === 'web-push') return {
      setVapidDetails() {},
      sendNotification: async (sub, payload, op) => { enviados.push({ endpoint: sub.endpoint, op: op || {} }); }
    };
    return cargar.call(this, pedido, ...resto);
  };
  /* un martes de octubre a las 9:30 de Canarias (8:30 UTC), dentro de la ventana del envio */
  const AHORA = Date.parse('2026-10-20T08:30:00Z');
  const RealDate = Date;
  global.Date = class extends RealDate {
    constructor(...a) { if (!a.length) super(AHORA); else super(...a); }
    static now() { return AHORA; }
  };
  const subs = BUENAS.concat(MALAS).map(([e], i) => ({ endpoint: e, p256dh: 'k', auth: 'a', lang: i % 2 ? 'en' : 'es' }));
  const peticiones = [];
  global.fetch = async (url, op) => {
    const u = String(url);
    peticiones.push(u);
    if (u.includes('push_sends?select')) return { ok: true, status: 200, json: async () => [{ sent_date: '2026-10-19' }] };
    if (u.includes('push_sends')) return { ok: true, status: 201, text: async () => '' };
    if (u.includes('push_subs')) return { ok: true, status: 200, json: async () => pagina(subs, u) };
    return { ok: false, status: 500, text: async () => 'peticion no esperada' };
  };
  Object.assign(process.env, { SUPABASE_URL: 'https://ejemplo.supabase.invalid', SUPABASE_SERVICE_KEY: 'simulada',
    VAPID_PUBLIC: 'simulada', VAPID_PRIVATE: 'simulada', FORCE: '' });
  const log = console.log, err = console.error, lineas = [];
  console.log = (...a) => lineas.push(a.join(' '));
  console.error = (...a) => lineas.push(a.join(' '));
  require(path.join(RAIZ, 'enviar-notificacion.js'));
  const hasta = performance.now() + 8000;
  while (!lineas.some(l => l.includes('Resumen')) && performance.now() < hasta) await new Promise(r => setTimeout(r, 20));
  await new Promise(r => setTimeout(r, 100));
  console.log = log; console.error = err;
  global.Date = RealDate;

  const a = e => enviados.filter(x => x.endpoint === e);
  console.log('\n── a las de los servicios de avisos les llega, una vez ──');
  for (const [e, nombre] of BUENAS) ver(a(e).length === 1, nombre, a(e).length + ' envios');
  console.log('\n── a las de otro sitio, nada ──');
  for (const [e, nombre] of MALAS) ver(a(e).length === 0, nombre, a(e).length + ' envios');
  console.log('\n── cada envio, con su TTL y su plazo ──');
  ver(enviados.length > 0 && enviados.every(x => x.op.timeout === 10000), 'cada envio lleva timeout: 10000 (10 s)',
      JSON.stringify(enviados.map(x => x.op.timeout)));
  ver(enviados.length > 0 && enviados.every(x => typeof x.op.TTL === 'number' && x.op.TTL > 0), 'y su TTL, como antes',
      JSON.stringify(enviados.map(x => x.op.TTL)));
  console.log('\n── lo que escribe el envio ──');
  const resumen = lineas.find(l => l.includes('Resumen')) || '';
  ver(/no reconocid[a-z]*, sin enviar: 11\b/.test(resumen), 'el resumen dice cuantas eran de otro sitio (11)', resumen.trim());
  ver(/enviados: 7\b/.test(resumen), 'y cuantas se enviaron (7)', resumen.trim());
  const todas = subs.map(s => s.endpoint);
  const fuga = lineas.find(l => todas.some(e => l.includes(e)) || /prueba-\d+/.test(l));
  ver(!fuga, 'ninguna direccion en lo que escribe', fuga);
  ver(!peticiones.some(u => !u.startsWith('https://ejemplo.supabase.invalid/')), 'nada sale de la maquina: solo la Supabase de mentira',
      peticiones.filter(u => !u.startsWith('https://ejemplo.supabase.invalid/')).join(' · '));

  console.log('\n' + bien + ' bien, ' + mal + ' mal');
  process.exit(mal ? 1 : 0);
})().catch(e => { console.error('REVENTO', e); process.exit(2); });
