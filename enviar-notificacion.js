/* =====================================================================
   TENERIFE GO  ·  Envio de la notificacion diaria
   ---------------------------------------------------------------------
   Corre en GitHub Actions cada manana. Lee las suscripciones de Supabase
   y envia a cada dispositivo la frase del dia en su idioma.

   Variables de entorno (se ponen como Secrets del repo en GitHub):
     SUPABASE_URL          https://aupjvdrubjytryzqirdn.supabase.co
     SUPABASE_SERVICE_KEY  clave service_role (SECRETA, solo servidor)
     VAPID_PUBLIC          clave publica VAPID
     VAPID_PRIVATE         clave privada VAPID (SECRETA)
   Opcionales:
     VAPID_SUBJECT         mailto:tenerife.go.app@gmail.com  (por defecto)
     APP_URL               https://jerome4551.github.io/tenerife-go/
     TARGET_HOURS          "9,10"  (horas de Canarias en que se permite enviar)
     FORCE                 "1" para saltar la comprobacion horaria (pruebas)
   ===================================================================== */

'use strict';
const fs = require('fs');
const path = require('path');
const webpush = require('web-push');

const SUPABASE_URL         = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const VAPID_PUBLIC         = process.env.VAPID_PUBLIC || '';
const VAPID_PRIVATE        = process.env.VAPID_PRIVATE || '';
const VAPID_SUBJECT        = process.env.VAPID_SUBJECT || 'mailto:tenerife.go.app@gmail.com';
const APP_URL              = process.env.APP_URL || 'https://jerome4551.github.io/tenerife-go/';
const TARGET_HOURS         = (process.env.TARGET_HOURS || '9,10').split(',').map(s => parseInt(s, 10));
const FORCE                = process.env.FORCE === '1';

function fail(msg) { console.error('✗ ' + msg); process.exit(1); }

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) fail('Falta SUPABASE_URL o SUPABASE_SERVICE_KEY.');
if (!VAPID_PUBLIC || !VAPID_PRIVATE)        fail('Falta VAPID_PUBLIC o VAPID_PRIVATE.');

// --- Fecha y hora en Canarias (maneja el cambio de hora automaticamente) ---
function canaryParts() {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Atlantic/Canary',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', hourCycle: 'h23'
  });
  const p = {};
  for (const part of fmt.formatToParts(new Date())) p[part.type] = part.value;
  return {
    year:  parseInt(p.year, 10),
    month: parseInt(p.month, 10),
    day:   parseInt(p.day, 10),
    hour:  parseInt(p.hour, 10),
    date:  `${p.year}-${p.month}-${p.day}`
  };
}
function dayOfYear(y, m, d) {
  const start = Date.UTC(y, 0, 0);
  const cur   = Date.UTC(y, m - 1, d);
  return Math.floor((cur - start) / 86400000); // 1..366
}

const sbHeaders = {
  'apikey': SUPABASE_SERVICE_KEY,
  'Authorization': 'Bearer ' + SUPABASE_SERVICE_KEY,
  'Content-Type': 'application/json'
};

async function main() {
  const now = canaryParts();
  console.log(`Hora Canarias: ${now.date} ${String(now.hour).padStart(2, '0')}h`);

  if (!FORCE && TARGET_HOURS.indexOf(now.hour) === -1) {
    console.log(`No es hora de enviar (permitidas: ${TARGET_HOURS.join(', ')}). Salgo.`);
    return;
  }

  // --- Guarda anti-duplicado: marcar el dia ANTES de enviar ---
  if (!FORCE) {
    const r = await fetch(SUPABASE_URL + '/rest/v1/push_sends', {
      method: 'POST',
      headers: Object.assign({}, sbHeaders, { 'Prefer': 'return=minimal' }),
      body: JSON.stringify({ sent_date: now.date })
    });
    if (r.status === 409) { console.log('Ya se envio hoy. Salgo.'); return; }
    if (!r.ok) fail(`No pude marcar el envio del dia (HTTP ${r.status}). ${await r.text()}`);
  }

  // --- Cargar frases ---
  const frasesPath = path.join(__dirname, 'frases.json');
  if (!fs.existsSync(frasesPath)) fail('No encuentro frases.json junto al script.');
  const CONT = JSON.parse(fs.readFileSync(frasesPath, 'utf8'));
  if (!CONT.frases || !CONT.frases.length) fail('frases.json no tiene frases.');
  const idx = dayOfYear(now.year, now.month, now.day) % CONT.frases.length;
  const fraseHoy = CONT.frases[idx];
  console.log(`Frase del dia #${idx}: "${fraseHoy.es}"`);

  // --- Leer suscripciones (service_role ignora RLS) ---
  const resp = await fetch(
    SUPABASE_URL + '/rest/v1/push_subs?select=endpoint,p256dh,auth,lang',
    { headers: sbHeaders }
  );
  if (!resp.ok) fail(`No pude leer las suscripciones (HTTP ${resp.status}). ${await resp.text()}`);
  const subs = await resp.json();
  console.log(`Suscripciones: ${subs.length}`);
  if (!subs.length) { console.log('Nadie suscrito todavia. Nada que enviar.'); return; }

  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);

  let enviados = 0, fallidos = 0, limpiados = 0;

  for (const s of subs) {
    const lang = (fraseHoy[s.lang] ? s.lang : 'es');
    const payload = JSON.stringify({
      title: CONT.titulo[lang] || CONT.titulo.es,
      body:  fraseHoy[lang]    || fraseHoy.es,
      url:   APP_URL,
      lang:  lang
    });
    const subscription = { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } };

    try {
      await webpush.sendNotification(subscription, payload, { TTL: 6 * 3600 });
      enviados++;
    } catch (err) {
      const code = err && err.statusCode;
      if (code === 404 || code === 410) {
        // Suscripcion caducada: se borra para no reintentar cada dia.
        try {
          await fetch(
            SUPABASE_URL + '/rest/v1/push_subs?endpoint=eq.' + encodeURIComponent(s.endpoint),
            { method: 'DELETE', headers: Object.assign({}, sbHeaders, { 'Prefer': 'return=minimal' }) }
          );
          limpiados++;
        } catch (e2) { /* si falla el borrado, no es critico */ }
      } else {
        fallidos++;
        console.error(`  · fallo (${code || 'sin codigo'}) en un dispositivo`);
      }
    }
  }

  console.log(`\nResumen -> enviados: ${enviados} | fallidos: ${fallidos} | caducados limpiados: ${limpiados}`);
}

main().catch(e => fail(e && e.message ? e.message : String(e)));
