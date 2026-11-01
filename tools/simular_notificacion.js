#!/usr/bin/env node
/* simular_notificacion.js — probar la notificacion diaria sin enviar nada.
 *
 *     npm install web-push@3.6.7
 *     node tools/simular_notificacion.js "2026-09-08T13:47:30Z" "2026-08-28"
 *
 *   1er argumento: la hora UTC que se le hace creer al guion.
 *   2o argumento : el ultimo sent_date de push_sends, o "-" si no hubo ninguno.
 *
 * POR QUE HACE FALTA
 *   El fallo de septiembre no estaba en el codigo del envio: estaba en que la
 *   ventana horaria y la hora a la que GitHub lanza de verdad dejaron de
 *   solaparse. Eso no se ve leyendo el guion, solo ejecutandolo a la hora
 *   equivocada. Aqui se congela el reloj y se responde a mano lo que
 *   devolveria Supabase, asi que se puede probar cualquier hora y cualquier
 *   racha sin tocar la base ni mandar una notificacion a nadie.
 *
 * LOS CINCO CASOS QUE TIENEN QUE SEGUIR SALIENDO ASI
 *   ventana vieja 9,10 · 13:47Z · ultimo 2026-08-28  -> rojo, con el motivo
 *   ventana nueva      · 13:47Z · ultimo 2026-08-28  -> envia
 *   ventana nueva      · 03:10Z · ultimo 2026-08-28  -> rojo
 *   ventana nueva      · 03:10Z · ultimo hoy         -> verde y callado
 *   ventana nueva      · 03:10Z · sin envios previos -> verde, sin falsa alarma
 */
'use strict';
const HORA_UTC = process.argv[2];
const ULTIMO   = process.argv[3];
if (!HORA_UTC || !ULTIMO) { console.error('faltan argumentos, mira la cabecera'); process.exit(2); }

const FIJA = new Date(HORA_UTC).getTime();
const RealDate = Date;
global.Date = class extends RealDate {
  constructor(...a) { if (!a.length) super(FIJA); else super(...a); }
  static now() { return FIJA; }
};

global.fetch = async (url) => {
  const u = String(url);
  if (u.includes('push_sends?select'))
    return { ok: true, status: 200, json: async () => (ULTIMO === '-' ? [] : [{ sent_date: ULTIMO }]) };
  if (u.includes('push_sends'))  return { ok: true, status: 201, text: async () => '' };
  if (u.includes('push_subs'))   return { ok: true, status: 200, json: async () => [] };
  return { ok: false, status: 500, text: async () => 'peticion no esperada: ' + u };
};

process.env.SUPABASE_URL         = 'https://ejemplo.supabase.co';
process.env.SUPABASE_SERVICE_KEY = 'simulada';
process.env.VAPID_PUBLIC         = 'simulada';
process.env.VAPID_PRIVATE        = 'simulada';

require(require('path').join(__dirname, '..', 'enviar-notificacion.js'));
process.on('exit', c => console.log('   --> codigo de salida: ' + c));
