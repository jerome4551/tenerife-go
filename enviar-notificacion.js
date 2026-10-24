/* =====================================================================
   TENERIFE GO  ·  Envio de la notificacion diaria
   ---------------------------------------------------------------------
   Corre en GitHub Actions cada manana. Lee las suscripciones de Supabase
   y envia a cada dispositivo la frase del dia en su idioma. Los domingos,
   en vez de la frase, un consejo del panel SOS (CONSEJOS, mas abajo).

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

const SUPABASE_URL         = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const VAPID_PUBLIC         = process.env.VAPID_PUBLIC || '';
const VAPID_PRIVATE        = process.env.VAPID_PRIVATE || '';
const VAPID_SUBJECT        = process.env.VAPID_SUBJECT || 'mailto:tenerife.go.app@gmail.com';
const APP_URL              = process.env.APP_URL || 'https://jerome4551.github.io/tenerife-go/';
/* La ventana era '9,10' y eso la rompio. GitHub no lanza los cron a su hora:
   medido sobre las ejecuciones reales del 29 de agosto al 8 de septiembre,
   sale entre 4 y 6 HORAS tarde, siempre. Con los cron a las 08:07-09:37 UTC
   las ejecuciones caian a las 12:49-15:09 UTC -13:49 a 16:09 en Canarias- y
   esta comprobacion las rechazaba todas. El workflow terminaba en verde sin
   enviar nada, once dias seguidos.
   La ventana NO es lo que impide enviar dos veces: eso lo hace push_sends,
   que tiene el dia como clave unica y devuelve 409 al segundo intento. La
   ventana solo esta para no despertar a nadie de madrugada, asi que puede
   ser ancha sin ningun riesgo. */
const TARGET_HOURS         = (process.env.TARGET_HOURS || '7,8,9,10,11,12,13,14,15')
                               .split(',').map(s => parseInt(s, 10));
/* Dias sin enviar a partir de los cuales la ejecucion se pone en ROJO. Un
   fallo que deja el job en verde no lo ve nadie: este lleva once dias. */
const AVISO_DIAS           = parseInt(process.env.AVISO_DIAS || '2', 10);
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

/* --- Las filas del panel SOS (modulos/emergencias.js) ---
   El consejo del domingo no trae textos propios: son
   filas del panel, las mismas que se leen en la app, verificadas contra su
   fuente oficial, en los diez idiomas y de usted. Se leen del modulo, sin
   copiarlas aqui: si el panel cambia una fila, la notificacion dice lo mismo
   que el panel. Si falta una fila o uno de sus idiomas, no se compone nada a
   mano. */
const IDIOMAS_SOS = ['es', 'en', 'fr', 'de', 'it', 'nl', 'zh', 'zht', 'bg', 'pl'];
function leerPanelSOS() {
  const src = fs.readFileSync(path.join(__dirname, 'modulos', 'emergencias.js'), 'utf8');
  const ini = src.indexOf('var EMERG_UI = {'), fin = src.indexOf('\n  };', ini);
  if (ini < 0 || fin < 0) throw new Error('no encuentro las filas (EMERG_UI) en modulos/emergencias.js');
  const filas = {};
  for (const linea of src.slice(ini, fin).split('\n')) {
    const m = /^\s*"(\w+)"\s*:\s*(\{.*\})\s*,?\s*$/.exec(linea);
    if (!m) continue;
    try { filas[m[1]] = JSON.parse(m[2]); } catch (e) { /* una fila que no se entiende no se usa */ }
  }
  const loc = /var SOS_LOCALE = (\{[^}]*\});/.exec(src);
  return { filas, locale: loc ? JSON.parse(loc[1]) : {} };
}
function filaSOS(panel, k, lang) {
  const f = panel.filas[k];
  if (!f || typeof f[lang] !== 'string' || !f[lang].trim()) throw new Error('falta la fila ' + k + ' en «' + lang + '»');
  return f[lang];
}

/* --- El consejo del domingo ---
   Jerome, 24 de octubre de 2026: «no es malo preparar la gente de veces
   cuando para que se queda informada», y «que no sea una alarma que asuste a
   la gente, más un consejo de quedarse informados de que hacer en tal caso.
   Que las alertas asustaron a algunas gente por no estar informadas».
   Los domingos, la notificacion de la manana trae, en vez de la frase, una
   fila del panel SOS debajo del titulo de su guia, con el «Buenos dias» de
   siempre. Es la misma notificacion (ese dia no sale otra) y al tocarla se
   abre esa guia. Solo filas que informan sin asustar: que es ES-Alert y que
   hacer cuando llega (tambien si es un simulacro), el hotel, el plan, la
   mochila, la montana. Doce, una cada domingo: cada una vuelve a los tres
   meses. La primera, el 25 de octubre de 2026. */
const CONSEJOS = [
  ['esalert',  'sosGuiaEsAlert',  'sosEsa2'],      // SIMULACRO o PRUEBA: es un ensayo
  ['visita',   'sosGuiaVisita',   'sosVis1'],      // pregunte en su hotel
  ['esalert',  'sosGuiaEsAlert',  'sosEsa1'],      // que es ES-Alert
  ['semaforo', 'sosGuiaSemaforo', 'sosSemIntro'],  // que es el semaforo
  ['plan',     'sosGuiaPlan',     'sosPlan1'],     // un punto de encuentro
  ['visita',   'sosGuiaVisita',   'sosVis3'],      // los idiomas del 112
  ['esalert',  'sosGuiaEsAlert',  'sosEsa5'],      // no llame al 112 para preguntar
  ['mochila',  'sosGuiaMochila',  'sosMocIntro'],  // la mochila
  ['visita',   'sosGuiaVisita',   'sosVis4'],      // ES-Alert en un movil extranjero
  ['montana',  'sosGuiaMontana',  'sosMon1'],      // diga a alguien su ruta
  ['esalert',  'sosGuiaEsAlert',  'sosEsa3'],      // si es real: calma, leerlo y seguirlo
  ['esalert',  'sosGuiaEsAlert',  'sosEsa8']       // nunca le pedira datos personales
];
const CONSEJO_PRIMERO = Date.UTC(2026, 9, 25);     // domingo, 25 de octubre de 2026
function consejoDelDia(y, m, d) {
  const hoy = Date.UTC(y, m - 1, d);
  if (new Date(hoy).getUTCDay() !== 0) return null;
  const n = Math.round((hoy - CONSEJO_PRIMERO) / (7 * 86400000)) % CONSEJOS.length;
  return CONSEJOS[(n + CONSEJOS.length) % CONSEJOS.length];
}
/* El titulo de la guia y debajo la fila: un salto de linea, que vale igual en
   los diez idiomas (los dos puntos no se escriben igual en frances ni en
   chino). */
function textoConsejo(panel, c, lang) {
  return filaSOS(panel, c[1], lang) + '\n' + filaSOS(panel, c[2], lang);
}

const sbHeaders = {
  'apikey': SUPABASE_SERVICE_KEY,
  'Authorization': 'Bearer ' + SUPABASE_SERVICE_KEY,
  'Content-Type': 'application/json'
};

/* Cuantos dias hace del ultimo envio. Devuelve null si nunca se envio -no es
   un fallo: puede ser una instalacion nueva- y null tambien si la consulta
   falla, porque no se va a tumbar el envio del dia por no poder mirar esto. */
async function diasSinEnviar(hoy) {
  try {
    const r = await fetch(SUPABASE_URL +
      '/rest/v1/push_sends?select=sent_date&order=sent_date.desc&limit=1', { headers: sbHeaders });
    if (!r.ok) return null;
    const filas = await r.json();
    if (!filas.length || !filas[0].sent_date) return null;
    const ult = Date.parse(filas[0].sent_date + 'T00:00:00Z');
    const ahora = Date.parse(hoy + 'T00:00:00Z');
    if (!isFinite(ult) || !isFinite(ahora)) return null;
    return { dias: Math.round((ahora - ult) / 86400000), ultimo: filas[0].sent_date };
  } catch (e) { return null; }
}

async function main() {
  const now = canaryParts();
  console.log(`Hora Canarias: ${now.date} ${String(now.hour).padStart(2, '0')}h`);

  /* Se mira ANTES de la ventana horaria a proposito: si se mirara despues, una
     ejecucion fuera de hora saldria por el `return` de abajo y nunca llegaria
     a comprobar nada. Justo lo que dejo pasar once dias en silencio. */
  const retraso = await diasSinEnviar(now.date);
  if (retraso) console.log(`Ultimo envio: ${retraso.ultimo} (hace ${retraso.dias} dia(s))`);

  if (!FORCE && TARGET_HOURS.indexOf(now.hour) === -1) {
    console.log(`No es hora de enviar (permitidas: ${TARGET_HOURS.join(', ')}). Salgo.`);
    if (retraso && retraso.dias > AVISO_DIAS) {
      console.log(`::error::La notificacion lleva ${retraso.dias} dias sin salir ` +
        `(ultimo: ${retraso.ultimo}). Esta ejecucion cayo a las ${now.hour}h de Canarias, ` +
        `fuera de la ventana ${TARGET_HOURS[0]}-${TARGET_HOURS[TARGET_HOURS.length - 1]}h.`);
      process.exitCode = 1;
    }
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

  /* El aviso de racha va AQUI y no en el resumen final. Puesto al final no
     salia cuando no hay suscripciones, porque ese caso tiene su propio
     `return` mas abajo: un informe que se salta por un return anticipado es
     justo la forma de este fallo. Aqui ya se sabe que hoy sale, y no queda
     ningun camino que se lo salte. */
  if (retraso && retraso.dias > AVISO_DIAS) {
    console.log(`::warning::Hoy si sale, pero antes hubo ${retraso.dias} dias sin ` +
      `enviar (ultimo: ${retraso.ultimo}).`);
  }

  // --- Cargar frases ---
  const frasesPath = path.join(__dirname, 'frases.json');
  if (!fs.existsSync(frasesPath)) fail('No encuentro frases.json junto al script.');
  const CONT = JSON.parse(fs.readFileSync(frasesPath, 'utf8'));
  if (!CONT.frases || !CONT.frases.length) fail('frases.json no tiene frases.');
  const idx = dayOfYear(now.year, now.month, now.day) % CONT.frases.length;
  const fraseHoy = CONT.frases[idx];
  console.log(`Frase del dia #${idx}: "${fraseHoy.es}"`);

  /* El consejo del domingo, si toca. Antes de enviar nada se compone en los
     diez idiomas: si falla una fila, ese domingo va la frase de siempre. */
  let consejo = consejoDelDia(now.year, now.month, now.day), panel = null;
  if (consejo) {
    try {
      panel = leerPanelSOS();
      for (const l of IDIOMAS_SOS) textoConsejo(panel, consejo, l);
      console.log(`Domingo: en vez de la frase, el consejo ${consejo[0]}/${consejo[2]}: "${textoConsejo(panel, consejo, 'es').replace('\n', ' · ')}"`);
    } catch (e) {
      console.log(`::warning::El consejo del domingo no sale (${e.message}): va la frase del dia.`);
      consejo = null;
    }
  }

  await enviarATodos(sLang => {
    const lang = (fraseHoy[sLang] ? sLang : 'es');
    if (consejo) {
      const l = IDIOMAS_SOS.indexOf(lang) >= 0 ? lang : 'es';
      return { title: CONT.titulo[l] || CONT.titulo.es, body: textoConsejo(panel, consejo, l),
               url: APP_URL + '#sos-' + consejo[0], lang: l };
    }
    return { title: CONT.titulo[lang] || CONT.titulo.es, body: fraseHoy[lang] || fraseHoy.es,
             url: APP_URL, lang: lang };
  }, 6 * 3600);
}

/* Lee todas las suscripciones y le manda a cada una lo que `componer` diga
   para su idioma: {title, body, url, lang} y, si hace falta, un tag propio. */
async function enviarATodos(componer, ttl) {
  // --- Leer suscripciones (service_role ignora RLS) ---
  /* Supabase devuelve como mucho unas cuantas filas por peticion (Max rows:
     1.000 en cada proyecto, si nadie lo cambia), y la service_role no se lo
     salta. Leidas de una vez, a partir de la mil y una nadie recibia la
     notificacion, sin ningun aviso (23 de octubre de 2026). Se leen por
     paginas, en orden, hasta una vacia: vale con cualquier tope. */
  const subs = [];
  for (;;) {
    const resp = await fetch(
      SUPABASE_URL + '/rest/v1/push_subs?select=endpoint,p256dh,auth,lang&order=endpoint&offset=' + subs.length + '&limit=1000',
      { headers: sbHeaders }
    );
    if (!resp.ok) fail(`No pude leer las suscripciones (HTTP ${resp.status}). ${await resp.text()}`);
    const pagina = await resp.json();
    if (!Array.isArray(pagina) || !pagina.length) break;
    subs.push(...pagina);
  }
  console.log(`Suscripciones: ${subs.length}`);
  if (!subs.length) { console.log('Nadie suscrito todavia. Nada que enviar.'); return; }

  const webpush = require('web-push');
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);

  let enviados = 0, fallidos = 0, limpiados = 0;

  for (const s of subs) {
    const payload = JSON.stringify(componer(s.lang));
    const subscription = { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } };

    try {
      await webpush.sendNotification(subscription, payload, { TTL: ttl });
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
