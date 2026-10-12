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

  /* Lo que hasta el 12 de octubre de 2026 contestaba CHAT_KB, en castellano,
     en cualquier idioma. Cada una con algo que solo dice la respuesta de su
     idioma y algo que solo decia la vieja en castellano. */
  { que: 'el Teide a secas, en aleman', lang: 'de', q: 'Teide',
    debe: [/Genehmigung/, /3\.715/], noDebe: [/autorización/i, /teleférico/i] },

  { que: 'el boton «Meilleures plages», en frances', lang: 'fr', boton: /Meilleures plages/,
    /* el boton manda por dentro «mejores playas»: antes caia en la respuesta
       castellana de CHAT_KB («Según lo que busques…») */
    debe: [/Plages/], noDebe: [/Según lo que busques/i, /Arena negra/i], conLista: true },

  { que: 'ayuda en ingles', lang: 'en', q: 'help', debe: [/112/], noDebe: [/emergencia/i] },

  { que: 'la app sin conexion, en neerlandes', lang: 'nl', q: 'werkt het offline',
    debe: [/Eiland offline/], noDebe: [/sin conexión/i] },

  { que: 'algo falla, en castellano: respuesta y boton de contacto', lang: 'es', q: 'no funciona',
    debe: [/Recargar/], noDebe: [], contacto: true },

  { que: 'la bienvenida en polaco cuenta bien el plural', lang: 'pl', q: 'zaskocz mnie',
    debe: [/kostka|losowe|Przenosi/i], noDebe: [/dado/i], bienvenidaPlural: true },

  /* «socorro» es una playa y es pedir ayuda (12/10/2026). Jerome: «que
     proponga los 3, Playa El Socorro, emergencia y 112, y la gente elige».
     Los tres botones, en su idioma y en su orden; y el de emergencia, pulsado,
     tiene que dar la respuesta del 112. */
  { que: '«socorro»: 112, emergencia y la playa, para elegir', lang: 'es', q: 'socorro',
    debe: [/ayuda/], noDebe: [/Los Realejos/], acciones: [/112/, /Emergencia/, /Playa El Socorro/],
    pulsar: /Emergencia/, trasPulsar: [/llama al 112/] },
  { que: '«socorro» en aleman: los botones en aleman', lang: 'de', q: 'socorro',
    debe: [/Hilfe/], noDebe: [/Emergencia/], acciones: [/112 anrufen/, /Notfall/, /Playa El Socorro/],
    pulsar: /Playa El Socorro/, trasPulsarLista: 3 },
  { que: '«socorro» en polaco', lang: 'pl', q: 'socorro',
    debe: [/pomocy/], noDebe: [/Emergencia/], acciones: [/Zadzwoń pod 112/, /Nagły wypadek/, /Playa El Socorro/] },
  { que: '«pedir socorro» no es ambiguo: el 112 directo', lang: 'es', q: 'pedir socorro',
    debe: [/llama al 112/], noDebe: [], sinAcciones: true },
  { que: '«auxilio»: el 112 directo', lang: 'es', q: 'auxilio', debe: [/llama al 112/], noDebe: [] },
  { que: '«emergencia» sigue llevando al 112', lang: 'es', q: 'emergencia', debe: [/llama al 112/], noDebe: [] },
  { que: '«Polizei», en aleman: el 112', lang: 'de', q: 'Polizei', debe: [/112/], noDebe: [/llama/] },
];

/* La forma polaca que pide el numero de lugares: 1 miejsce · 2-4 miejsca
   (salvo 12-14) · 5+ miejsc. La bienvenida tiene que traer la suya. */
const formaPl = n => n === 1 ? 'miejsce' : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14)) ? 'miejsca' : 'miejsc';

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
    let bienvenidaMal = '';
    if (c.bienvenidaPlural) {
      const [n, saludo] = await pg.evaluate(() => [places.length,
        document.querySelector('#chat-messages .chat-bubble.bot .chat-body').textContent]);
      if (!new RegExp(n + ' ' + formaPl(n) + '\\b').test(saludo)) bienvenidaMal = n + ' pide «' + formaPl(n) + '»: ' + saludo.slice(0, 120);
    }

    if (c.boton) {
      // pulsar el boton de seguimiento, que es lo que hace la gente
      const hecho = await pg.evaluate(src => {
        const re = new RegExp(src);
        const b = [...document.querySelectorAll('#chat-quick .chat-qbtn')].find(x => re.test(x.textContent));
        if (b) b.click();
        return !!b;
      }, c.boton.source);
      if (!hecho) errores.push('no hay boton que case con ' + c.boton);
    } else {
      await pg.evaluate(q => { document.getElementById('chat-input').value = q; }, c.q);
      await pg.click('.chat-send');
    }
    await pg.waitForFunction(n => document.querySelectorAll('#chat-messages .chat-bubble.bot .chat-body').length > n,
                             antes, { timeout: 20000 }).catch(() => {});
    const despues = await cuenta(pg);

    const resp = despues > antes ? await pg.evaluate(() => {
      const b = document.querySelectorAll('#chat-messages .chat-bubble.bot .chat-body');
      return b[b.length - 1].textContent;
    }) : '';
    const lista = await pg.evaluate(() => document.querySelectorAll('#chat-messages .chat-poi-item, #chat-messages .chat-poi').length);
    const chips = await pg.evaluate(() => [...document.querySelectorAll('#chat-quick .chat-qbtn')].map(b => b.textContent));

    /* el boton de contacto no va dentro de la burbuja: addBotMessage lo pone
       detras, como hermano, en #chat-messages */
    const contacto = await pg.evaluate(() => {
      const m = document.getElementById('chat-messages');
      const ult = m && m.lastElementChild;
      return !!(ult && (ult.classList.contains('chat-contact-btn') || ult.querySelector('.chat-contact-btn')));
    });
    /* los botones de accion van detras de la burbuja, como hermanos */
    const acciones = await pg.evaluate(() => {
      const m = document.getElementById('chat-messages'), out = [];
      let n = m ? m.lastElementChild : null;
      while (n && !n.classList.contains('chat-bubble')) {
        if (n.classList.contains('chat-action-btn')) out.unshift(n.textContent);
        n = n.previousElementSibling;
      }
      return out;
    });
    let accionesMal = '';
    if (c.acciones && (acciones.length !== c.acciones.length || c.acciones.some((r, i) => !r.test(acciones[i] || ''))))
      accionesMal = acciones.join(' | ') || '(ninguno)';
    if (c.sinAcciones && acciones.length) accionesMal = 'no debia haber botones: ' + acciones.join(' | ');
    let trasMal = '';
    if (c.pulsar) {
      const antes2 = await cuenta(pg);
      await pg.evaluate(src => {
        const re = new RegExp(src);
        const b = [...document.querySelectorAll('#chat-messages .chat-action-btn')].reverse().find(x => re.test(x.textContent));
        if (b) b.click();
      }, c.pulsar.source);
      await pg.waitForFunction(n => document.querySelectorAll('#chat-messages .chat-bubble.bot .chat-body').length > n,
                               antes2, { timeout: 20000 }).catch(() => {});
      const r2 = await pg.evaluate(() => { const b = document.querySelectorAll('#chat-messages .chat-bubble.bot .chat-body'); return b[b.length - 1].textContent; });
      const l2 = await pg.evaluate(() => { const m = document.getElementById('chat-messages'); const u = m.lastElementChild; return u && u.querySelectorAll ? u.querySelectorAll('.chat-poi-item').length : 0; });
      if (c.trasPulsar && c.trasPulsar.some(r => !r.test(r2))) trasMal = 'tras pulsar: ' + r2.slice(0, 120);
      if (c.trasPulsarLista && l2 !== c.trasPulsarLista) trasMal = 'tras pulsar salen ' + l2 + ' lugares, no ' + c.trasPulsarLista;
    }
    const faltan  = c.debe.filter(r => !r.test(resp));
    const sobran  = c.noDebe.filter(r => r.test(resp));
    const sinLista = c.conLista && !lista;
    /* Los botones de seguimiento tambien son respuesta: una contestacion en
       chino con los botones en castellano no esta bien puesta. */
    const botonesMal = c.botones ? !(chips.length && chips.every(t => c.botones.test(t))) : false;
    const sinContacto = c.contacto && !contacto;
    const ok = despues > antes && !faltan.length && !sobran.length && !sinLista
            && !botonesMal && !errores.length && !sinContacto && !bienvenidaMal && !accionesMal && !trasMal;
    if (!ok) malos++;

    console.log((ok ? '  ok   ' : ' FALLA ') + c.que + '   [' + c.lang + '] «' + (c.q || 'boton ' + c.boton) + '»');
    console.log('        idioma en LANGS: ' + (tieneIdioma ? 'si' : 'NO')
              + ' · entradas FAQ cargadas: ' + cargadas
              + ' · burbujas ' + antes + '→' + despues + (c.conLista ? ' · lugares: ' + lista : ''));
    console.log('        → ' + (resp ? resp.slice(0, 170).replace(/\n/g, ' ⏎ ') : 'NO CONTESTO'));
    if (chips.length) console.log('        botones: ' + chips.join(' | '));
    if (faltan.length)  console.log('        le falta: ' + faltan.join(' '));
    if (sobran.length)  console.log('        sale en otro idioma: ' + sobran.join(' '));
    if (sinLista)       console.log('        no salio ninguna lista de lugares');
    if (botonesMal)     console.log('        los botones no estan en ese idioma');
    if (sinContacto)    console.log('        falta el boton de escribirle a Jerome');
    if (bienvenidaMal)  console.log('        bienvenida con el plural mal: ' + bienvenidaMal);
    if (acciones.length) console.log('        acciones: ' + acciones.join(' | '));
    if (accionesMal)    console.log('        los botones de accion no son los que tocan: ' + accionesMal);
    if (trasMal)        console.log('        ' + trasMal);
    if (errores.length) console.log('        ERRORES DE PAGINA: ' + errores.join(' / '));
    console.log('');
    await pg.close();
  }
  await nav.close();
  console.log(malos ? malos + ' de ' + CONSULTAS.length + ' no pasan' : 'las ' + CONSULTAS.length + ' responden en su idioma');
  process.exit(malos ? 1 : 0);
})();
