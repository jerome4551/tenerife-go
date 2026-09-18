#!/usr/bin/env node
/* Las tres consultas del cliente, en un movil de verdad.
 *
 * No es lo mismo que probar_faq.js: alli el motor corre suelto en Node con
 * los ficheros leidos del disco. Aqui corre la app entera en un navegador,
 * con su fetch por red y su viewport de telefono, que es donde el parche
 * tiene que funcionar.
 *
 * DOS TRAMPAS QUE ESTA PRUEBA YA SE COMIO, y por eso el codigo es asi:
 *
 * 1. El asistente suelta un mensaje de bienvenida al abrirse, y ese mensaje
 *    ya esta traducido. Leer «la ultima burbuja» sin mas daba por buena la
 *    bienvenida: la consulta china salio en verde comprobando que habia
 *    caracteres chinos... en el saludo. Se cuentan las burbujas ANTES de
 *    preguntar y se espera a que aparezca una mas.
 *
 * 2. LANGS y TG_FAQ se declaran con `const`, asi que NO estan en window:
 *    viven en el ambito lexico global y solo se alcanzan por su nombre
 *    pelado. Con window.TG_FAQ la espera no terminaba nunca.
 *
 *     node tools/probar_movil.js [puerto]
 */
'use strict';
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const PUERTO = process.argv[2] || '8777';
const BASE = 'http://127.0.0.1:' + PUERTO + '/index.html';

const CONSULTAS = [
  { que: 'el permiso del Teide en aleman', lang: 'de',
    q: 'Brauche ich eine Genehmigung für den Gipfel?',
    debe: [/Genehmigung/, /PNT 10/],
    noDebe: [/autorización/i, /sendero/i, /permiso/i] },

  { que: 'playas en chino', lang: 'zh', q: '海滩',
    /* No es una entrada del FAQ: las playas son una categoria del mapa, asi
       que lo que tiene que salir es el rotulo chino de la categoria y una
       lista de sitios. Pedir «seis caracteres chinos seguidos» era mas
       estricto que la realidad -la respuesta lleva cifras y puntuacion
       dentro- y suspendia una respuesta correcta. */
    debe: [/海滩/],
    noDebe: [/playas/i, /Puedo enseñarte/i, /lugares/i],
    conLista: true, botones: /[一-鿿]/ },

  { que: 'guaguas en polaco', lang: 'pl', q: 'autobusy',
    debe: [/TITSA/, /Autobusy/],
    noDebe: [/guaguas/i, /Las guaguas/],
    botones: /[a-zA-Ząćęłńóśźż]/ },
];

(async () => {
  const nav = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await nav.newContext({
    viewport: { width: 390, height: 844 },   // un telefono, no un escritorio
    isMobile: true, hasTouch: true, deviceScaleFactor: 3,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 '
             + '(KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
  });
  const cuenta = pg => pg.evaluate(() => document.querySelectorAll('#chat-messages .chat-bubble.bot .chat-body').length);
  let malos = 0;

  for (const c of CONSULTAS) {
    const pg = await ctx.newPage();
    const errores = [];
    pg.on('pageerror', e => errores.push(e.message));
    await pg.goto(BASE, { waitUntil: 'load' });
    await pg.waitForFunction(() => typeof setLang === 'function' && typeof TG_FAQ !== 'undefined',
                             null, { timeout: 30000 });

    const tieneIdioma = await pg.evaluate(l => typeof LANGS !== 'undefined' && !!LANGS[l], c.lang);
    await pg.evaluate(l => { try { setLang(l); } catch (e) {} }, c.lang);
    await pg.waitForFunction(() => TG_FAQ.entradas().length > 0, null, { timeout: 15000 }).catch(() => {});
    const cargadas = await pg.evaluate(() => TG_FAQ.entradas().length);

    await pg.evaluate(() => openChatPanel());
    // la bienvenida tarda: hay que dejarla llegar y contarla antes de preguntar
    await pg.waitForFunction(() => document.querySelectorAll('#chat-messages .chat-bubble.bot .chat-body').length >= 1,
                             null, { timeout: 15000 }).catch(() => {});
    const antes = await cuenta(pg);

    await pg.evaluate(q => { document.getElementById('chat-input').value = q; }, c.q);
    await pg.click('.chat-send');
    await pg.waitForFunction(n => document.querySelectorAll('#chat-messages .chat-bubble.bot .chat-body').length > n,
                             antes, { timeout: 20000 }).catch(() => {});
    const despues = await cuenta(pg);

    const resp = despues > antes ? await pg.evaluate(() => {
      const b = document.querySelectorAll('#chat-messages .chat-bubble.bot .chat-body');
      return b[b.length - 1].textContent;
    }) : '';
    const lista = await pg.evaluate(() => document.querySelectorAll('#chat-messages .chat-poi-item, #chat-messages .chat-poi').length);
    const chips = await pg.evaluate(() => [...document.querySelectorAll('#chat-quick .chat-qbtn')].map(b => b.textContent));

    const faltan  = c.debe.filter(r => !r.test(resp));
    const sobran  = c.noDebe.filter(r => r.test(resp));
    const sinLista = c.conLista && !lista;
    /* Los botones de seguimiento tambien son respuesta: una contestacion en
       chino con los botones en castellano no esta bien puesta. */
    const botonesMal = c.botones ? !(chips.length && chips.every(t => c.botones.test(t))) : false;
    const ok = despues > antes && !faltan.length && !sobran.length && !sinLista
            && !botonesMal && !errores.length;
    if (!ok) malos++;

    console.log((ok ? '  ok   ' : ' FALLA ') + c.que + '   [' + c.lang + '] «' + c.q + '»');
    console.log('        idioma en LANGS: ' + (tieneIdioma ? 'si' : 'NO')
              + ' · entradas FAQ cargadas: ' + cargadas
              + ' · burbujas ' + antes + '→' + despues + (c.conLista ? ' · lugares: ' + lista : ''));
    console.log('        → ' + (resp ? resp.slice(0, 170).replace(/\n/g, ' ⏎ ') : 'NO CONTESTO'));
    if (chips.length) console.log('        botones: ' + chips.join(' | '));
    if (faltan.length)  console.log('        le falta: ' + faltan.join(' '));
    if (sobran.length)  console.log('        sale en otro idioma: ' + sobran.join(' '));
    if (sinLista)       console.log('        no salio ninguna lista de lugares');
    if (botonesMal)     console.log('        los botones no estan en ese idioma');
    if (errores.length) console.log('        ERRORES DE PAGINA: ' + errores.join(' / '));
    console.log('');
    await pg.close();
  }
  await nav.close();
  console.log(malos ? malos + ' de ' + CONSULTAS.length + ' no pasan' : 'las ' + CONSULTAS.length + ' responden en su idioma');
  process.exit(malos ? 1 : 0);
})();
