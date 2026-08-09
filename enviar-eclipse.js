/* =====================================================================
   TENERIFE GO  ·  Avisos del eclipse parcial del 12 de agosto de 2026
   ---------------------------------------------------------------------
   Dos envios sueltos, no una tarea recurrente:

     MOMENTO=aviso    el lunes por la tarde, para que de tiempo a buscar
                      gafas certificadas y decidir sitio.
     MOMENTO=inicio   el miercoles cuando empieza.

   Reutiliza la misma tabla push_subs que la notificacion diaria, con el
   idioma que cada dispositivo guardo al suscribirse, y la misma tabla
   push_sends como guarda anti-duplicado.

   Sobre el anti-duplicado: push_sends lleva una fecha por dia enviado. Si
   aqui se marcara la fecha real, la notificacion diaria de ese mismo dia
   se creeria ya enviada y se quedaria sin salir. Por eso se marcan dos
   fechas centinela imposibles -1970-01-01 y 1970-01-02-, que no chocan
   con ningun dia real y no necesitan tabla nueva ni tocar Supabase.

   Y el tag: va uno propio, 'tgo-eclipse'. Sin el, este aviso borraria la
   frase del dia de la bandeja y la frase del dia siguiente lo borraria a
   el.

   Variables de entorno: las mismas que enviar-notificacion.js, mas
     MOMENTO   'aviso' | 'inicio'
     FORCE     '1' para saltarse la guarda (pruebas)
   ===================================================================== */

'use strict';
const webpush = require('web-push');

const SUPABASE_URL         = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const VAPID_PUBLIC         = process.env.VAPID_PUBLIC || '';
const VAPID_PRIVATE        = process.env.VAPID_PRIVATE || '';
const VAPID_SUBJECT        = process.env.VAPID_SUBJECT || 'mailto:tenerife.go.app@gmail.com';
const APP_URL              = process.env.APP_URL || 'https://jerome4551.github.io/tenerife-go/';
const MOMENTO              = (process.env.MOMENTO || 'aviso').trim();
const FORCE                = process.env.FORCE === '1';

function fail(msg) { console.error('✗ ' + msg); process.exit(1); }
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) fail('Falta SUPABASE_URL o SUPABASE_SERVICE_KEY.');
if (!VAPID_PUBLIC || !VAPID_PRIVATE)        fail('Falta VAPID_PUBLIC o VAPID_PRIVATE.');
if (MOMENTO !== 'aviso' && MOMENTO !== 'inicio') fail('MOMENTO debe ser "aviso" o "inicio".');

/* Los textos. Cortos a proposito: el movil recorta el cuerpo a unas dos
   lineas y lo que no puede perderse es lo de las gafas. */
const TX = {
  aviso: {
    es:  { t: '🌘 Mañana hay eclipse de Sol',
           b: 'Miércoles 18:58-20:45, máximo a las 19:53. Se oculta cerca del 70 %. Hacen falta gafas de eclipse certificadas: nunca mires sin ellas. Mira en Fiestas dónde verlo.' },
    en:  { t: '🌘 Solar eclipse tomorrow',
           b: 'Wednesday 18:58-20:45, maximum 19:53. Around 70 % covered. Certified eclipse glasses are essential: never look without them. See Festivals for where to watch.' },
    fr:  { t: '🌘 Éclipse de Soleil demain',
           b: 'Mercredi 18h58-20h45, maximum à 19h53. Environ 70 % occulté. Lunettes d’éclipse certifiées indispensables : ne regardez jamais sans. Voir Fêtes pour les lieux.' },
    de:  { t: '🌘 Morgen Sonnenfinsternis',
           b: 'Mittwoch 18:58-20:45, Maximum 19:53. Etwa 70 % bedeckt. Zertifizierte Finsternisbrille nötig: nie ohne hinsehen. Orte unter Feste.' },
    it:  { t: '🌘 Domani eclissi di Sole',
           b: 'Mercoledì 18:58-20:45, massimo alle 19:53. Circa il 70 % coperto. Servono occhiali da eclissi certificati: mai guardare senza. Vedi Feste per i luoghi.' },
    nl:  { t: '🌘 Morgen zonsverduistering',
           b: 'Woensdag 18:58-20:45, maximum 19:53. Ongeveer 70 % bedekt. Gecertificeerde eclipsbril nodig: kijk er nooit zonder. Zie Feesten voor de plekken.' },
    zh:  { t: '🌘 明天有日偏食',
           b: '周三 18:58-20:45，19:53 极大，约七成被遮。必须佩戴认证日食眼镜，切勿直视。观测地点见「节日」。' },
    zht: { t: '🌘 明天有日偏食',
           b: '週三 18:58-20:45，19:53 極大，約七成被遮。必須佩戴認證日食眼鏡，切勿直視。觀測地點見「節日」。' }
  },
  inicio: {
    es:  { t: '🌘 Empieza el eclipse',
           b: 'Máximo a las 19:53 y acaba a las 20:45, justo con la puesta de sol. El Sol está bajo, al oeste. ⚠️ Solo con gafas de eclipse certificadas, sin quitártelas.' },
    en:  { t: '🌘 The eclipse is starting',
           b: 'Maximum at 19:53, ends 20:45 right at sunset. The Sun is low, due west. ⚠️ Only with certified eclipse glasses, and keep them on.' },
    fr:  { t: '🌘 L’éclipse commence',
           b: 'Maximum à 19h53, fin à 20h45, juste au coucher du soleil. Le Soleil est bas, à l’ouest. ⚠️ Uniquement avec des lunettes d’éclipse certifiées, sans les retirer.' },
    de:  { t: '🌘 Die Finsternis beginnt',
           b: 'Maximum 19:53, Ende 20:45 genau zum Sonnenuntergang. Die Sonne steht tief im Westen. ⚠️ Nur mit zertifizierter Finsternisbrille, nicht absetzen.' },
    it:  { t: '🌘 Inizia l’eclissi',
           b: 'Massimo alle 19:53, finisce alle 20:45 proprio al tramonto. Il Sole è basso, a ovest. ⚠️ Solo con occhiali da eclissi certificati, senza toglierli.' },
    nl:  { t: '🌘 De eclips begint',
           b: 'Maximum om 19:53, einde 20:45 precies bij zonsondergang. De zon staat laag in het westen. ⚠️ Alleen met gecertificeerde eclipsbril, en hou hem op.' },
    zh:  { t: '🌘 日食开始了',
           b: '19:53 极大，20:45 结束，正值日落。太阳低悬西方。⚠️ 务必佩戴认证日食眼镜，全程不要摘下。' },
    zht: { t: '🌘 日食開始了',
           b: '19:53 極大，20:45 結束，正值日落。太陽低懸西方。⚠️ 務必佩戴認證日食眼鏡，全程不要摘下。' }
  }
};

// Fechas centinela: no son un dia real, solo una marca de "esto ya salio".
const MARCA = { aviso: '1970-01-01', inicio: '1970-01-02' };

const sbHeaders = {
  'apikey': SUPABASE_SERVICE_KEY,
  'Authorization': 'Bearer ' + SUPABASE_SERVICE_KEY,
  'Content-Type': 'application/json'
};

async function main() {
  const textos = TX[MOMENTO];
  console.log(`Eclipse · momento "${MOMENTO}"`);

  if (!FORCE) {
    const r = await fetch(SUPABASE_URL + '/rest/v1/push_sends', {
      method: 'POST',
      headers: Object.assign({}, sbHeaders, { 'Prefer': 'return=minimal' }),
      body: JSON.stringify({ sent_date: MARCA[MOMENTO] })
    });
    if (r.status === 409) { console.log('Este aviso ya salio. Salgo.'); return; }
    if (!r.ok) fail(`No pude marcar el envio (HTTP ${r.status}). ${await r.text()}`);
  }

  const resp = await fetch(
    SUPABASE_URL + '/rest/v1/push_subs?select=endpoint,p256dh,auth,lang',
    { headers: sbHeaders }
  );
  if (!resp.ok) fail(`No pude leer las suscripciones (HTTP ${resp.status}). ${await resp.text()}`);
  const subs = await resp.json();
  console.log(`Suscripciones: ${subs.length}`);
  if (!subs.length) { console.log('Nadie suscrito. Nada que enviar.'); return; }

  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);

  let enviados = 0, fallidos = 0, limpiados = 0;
  const porIdioma = {};

  for (const s of subs) {
    const lang = textos[s.lang] ? s.lang : 'es';
    porIdioma[lang] = (porIdioma[lang] || 0) + 1;
    const payload = JSON.stringify({
      title: textos[lang].t,
      body:  textos[lang].b,
      url:   APP_URL,
      lang:  lang,
      tag:   'tgo-eclipse'
    });
    const subscription = { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } };
    try {
      /* TTL corto en el aviso de inicio: si el movil esta apagado y el
         mensaje se entrega tres horas tarde, el eclipse ya ha acabado y
         solo confunde. El del lunes aguanta hasta la tarde del martes. */
      const ttl = (MOMENTO === 'inicio') ? 45 * 60 : 20 * 3600;
      await webpush.sendNotification(subscription, payload, { TTL: ttl });
      enviados++;
    } catch (err) {
      const code = err && err.statusCode;
      if (code === 404 || code === 410) {
        try {
          await fetch(
            SUPABASE_URL + '/rest/v1/push_subs?endpoint=eq.' + encodeURIComponent(s.endpoint),
            { method: 'DELETE', headers: Object.assign({}, sbHeaders, { 'Prefer': 'return=minimal' }) }
          );
          limpiados++;
        } catch (e2) { /* no critico */ }
      } else {
        fallidos++;
        console.error(`  · fallo (${code || 'sin codigo'}) en un dispositivo`);
      }
    }
  }

  console.log('Por idioma: ' + JSON.stringify(porIdioma));
  console.log(`\nResumen -> enviados: ${enviados} | fallidos: ${fallidos} | caducados limpiados: ${limpiados}`);
}

main().catch(e => fail(e && e.message ? e.message : String(e)));
