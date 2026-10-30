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
    noDebe: [/playas/i, /Puedo enseñar(te|le)/i, /lugares/i],
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
    debe: [/Plages/], noDebe: [/Según lo que busques?/i, /Arena negra/i], conLista: true },

  /* «help» a secas: desde el 12/10/2026 propone 112, emergencia y ayuda de
     la app (Jerome, para «ayuda»; lo mismo en los diez idiomas). El de
     emergencia, pulsado, da el 112. */
  { que: 'ayuda en ingles: 112, emergencia o ayuda de la app', lang: 'en', q: 'help', debe: [/emergency/], noDebe: [/emergencia/i],
    acciones: [/Call 112/, /Emergency/, /Help with the app/], pulsar: /Emergency/, trasPulsar: [/112/] },
  { que: '«ayuda» a secas: el boton de la app lleva a como funciona', lang: 'es', q: '¡ayuda!', debe: [/emergencia/], noDebe: [],
    acciones: [/Llamar al 112/, /Emergencia/, /Ayuda con la app/], pulsar: /Ayuda con la app/, trasPulsar: [/en pocas palabras/] },
  { que: '«Hilfe» en aleman', lang: 'de', q: 'Hilfe', debe: [/Notfall/], noDebe: [/emergencia/i],
    acciones: [/112 anrufen/, /Notfall/, /Hilfe zur App/] },
  { que: '«pedir ayuda» no es ambiguo: el 112 directo', lang: 'es', q: 'pedir ayuda', debe: [/llame al 112/], noDebe: [], sinAcciones: true },

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
    pulsar: /Emergencia/, trasPulsar: [/llame al 112/] },
  { que: '«socorro» en aleman: los botones en aleman', lang: 'de', q: 'socorro',
    debe: [/Hilfe/], noDebe: [/Emergencia/], acciones: [/112 anrufen/, /Notfall/, /Playa El Socorro/],
    pulsar: /Playa El Socorro/, trasPulsarLista: 3 },
  { que: '«socorro» en polaco', lang: 'pl', q: 'socorro',
    debe: [/pomoc/], noDebe: [/Emergencia/], acciones: [/Zadzwoń pod 112/, /Nagły wypadek/, /Playa El Socorro/] },
  { que: '«pedir socorro» no es ambiguo: el 112 directo', lang: 'es', q: 'pedir socorro',
    debe: [/llame al 112/], noDebe: [], sinAcciones: true },
  { que: '«auxilio»: el 112 directo', lang: 'es', q: 'auxilio', debe: [/llame al 112/], noDebe: [] },
  { que: '«emergencia» sigue llevando al 112', lang: 'es', q: 'emergencia', debe: [/llame al 112/], noDebe: [] },
  { que: '«Polizei», en aleman: el 112', lang: 'de', q: 'Polizei', debe: [/112/], noDebe: [/llam[ae]/] },

  /* «Ordena mis favoritos por distancia» (12/10/2026): exc-03 lo prometia y
     el asistente no sabia hacerlo. Con la ubicacion, el orden tiene que ser
     el del vecino mas cercano desde donde esta la persona, calculado aqui
     aparte; sin ella, lo dice; sin favoritos, dice el boton con el rotulo
     de la pantalla. */
  { que: 'favoritos ordenados desde Santa Cruz, en aleman', lang: 'de', q: 'Sortiere meine Favoriten nach Entfernung',
    favs: ['teide', 'anaga', 'playa-socorro', 'playa-socorro-guimar'], geo: { latitude: 28.4636, longitude: -16.2518 },
    debe: [/Luftlinie/, /ohne Hin und Her/], noDebe: [/ordeno|línea recta/], ordenDesde: true },
  { que: 'nueve favoritos por toda la isla, desde La Laguna, en ingles: sin cruces', lang: 'en', q: 'sort my favourites by distance',
    favs: ['masca', 'piscinas-garachico', 'nucleo-los-cristianos', 'acantilados-gigantes', 'el-medano', 'candelaria', 'catedral-laguna', 'anaga', 'teide'],
    geo: { latitude: 28.4874, longitude: -16.3159 }, debe: [/without going back and forth/, /straight-line/], noDebe: [/línea recta/], ordenDesde: true },
  /* Con estos seis, desde Santa Cruz, «cada vez el mas cercano» se cruza
     consigo mismo (buscado entre los lugares reales para que esta prueba vea
     si falta la parte que deshace las idas y vueltas). */
  { que: 'seis favoritos donde «el mas cercano» se cruza: el orden no', lang: 'it', q: 'ordina i miei preferiti per distanza',
    favs: ['playa-los-patos', 'playa-tabaiba', 'paisaje-lunar', 'mirador-pico-ingles', 'playa-socorro-guimar', 'benijo'],
    geo: { latitude: 28.4636, longitude: -16.2518 }, debe: [/senza andare avanti e indietro/, /linea d’aria/], noDebe: [/línea recta/], ordenDesde: true },
  { que: 'favoritos sin ubicacion, en polaco: empieza por un extremo y lo dice', lang: 'pl', q: 'posortuj moje ulubione',
    favs: ['teide', 'anaga', 'playa-socorro'], debe: [/Bez znanej pozycji/], noDebe: [/No sé/], listaDe: 3 },
  { que: 'sin favoritos: el boton con su rotulo de la pantalla', lang: 'es', q: 'ordena mis favoritos',
    favs: [], debe: [/Aún no tiene favoritos/], noDebe: [], rotuloAddFav: true },
  { que: 'el boton «Ordena mis favoritos por distancia» de app-02 lo hace', lang: 'es', q: '¿Cómo guardo un lugar en favoritos?',
    favs: ['teide', 'anaga'], pulsarChip: /Ordena mis favoritos/, debe: [/Añadir a favoritos/], noDebe: [], trasChip: [/línea recta/], trasChipLista: 2 },
];

/* La forma polaca que pide el numero de lugares: 1 miejsce · 2-4 miejsca
   (salvo 12-14) · 5+ miejsc. La bienvenida tiene que traer la suya. */
const formaPl = n => n === 1 ? 'miejsce' : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14)) ? 'miejsca' : 'miejsc';

(async () => {
  const nav = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
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

    if (c.geo) { await ctx.grantPermissions(['geolocation']); await ctx.setGeolocation(c.geo); }
    else { await ctx.clearPermissions(); }
    if (c.favs) await pg.evaluate(ids => { favorites.clear(); ids.forEach(i => favorites.add(i)); }, c.favs);
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
    let favMal = '';
    const nombresLista = await pg.evaluate(() => {
      const m = document.getElementById('chat-messages');
      const l = m && [...m.querySelectorAll('.chat-poi-list')].pop();
      return l ? [...l.querySelectorAll('.chat-poi-name')].map(x => x.textContent) : [];
    });
    if (c.ordenDesde) {
      /* Lo que tiene que cumplir el orden, mirado aqui sin el codigo de la
         app: estan todos los favoritos, una vez; el recorrido desde la
         posicion no es mas largo que el de «cada vez el mas cercano»; y no
         se cruza consigo mismo (sin idas y vueltas). */
      const v = await pg.evaluate(([ids, g, lista]) => {
        const R = 6371, rad = Math.PI / 180;
        const d = (a, b) => { const x = Math.sin((b.lat - a.lat) * rad / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin((b.lng - a.lng) * rad / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); };
        const yo = { lat: g.latitude, lng: g.longitude };
        const favs = ids.map(i => places.find(p => p.id === i));
        const app = lista.map(t => favs.find(p => (t.replace(/^\d+\. /, '')) === p.name));
        if (app.some(x => !x) || new Set(app).size !== favs.length) return 'no son los favoritos: ' + lista.join(' | ');
        const largo = r => r.reduce((s, p, i) => i ? s + d(r[i - 1], p) : 0, 0);
        let act = yo, resto = favs.slice(), nn = [yo];
        while (resto.length) { resto.sort((a, b) => d(act, a) - d(act, b)); act = resto.shift(); nn.push(act); }
        const rApp = [yo].concat(app);
        if (largo(rApp) > largo(nn) + 1e-6) return 'mas largo (' + largo(rApp).toFixed(1) + ' km) que el del mas cercano (' + largo(nn).toFixed(1) + ' km)';
        const cruza = (p1, p2, p3, p4) => { const o = (a, b, c) => Math.sign((b.lng - a.lng) * (c.lat - a.lat) - (b.lat - a.lat) * (c.lng - a.lng)); return o(p1, p2, p3) * o(p1, p2, p4) < 0 && o(p3, p4, p1) * o(p3, p4, p2) < 0; };
        for (let i = 1; i < rApp.length; i++) for (let k = i + 2; k < rApp.length; k++) if (cruza(rApp[i - 1], rApp[i], rApp[k - 1], rApp[k])) return 'el recorrido se cruza';
        return '';
      }, [c.favs, c.geo, nombresLista]);
      if (v) favMal = v;
    }
    if (c.listaDe && nombresLista.length !== c.listaDe) favMal = 'la lista trae ' + nombresLista.length + ', no ' + c.listaDe;
    if (c.rotuloAddFav) {
      const rot = await pg.evaluate(l => LANGS[l].addFav, c.lang);
      if (!rot || resp.indexOf('«' + rot + '»') < 0) favMal = 'no cita «' + rot + '», el rotulo de la pantalla';
    }
    if (c.pulsarChip) {
      const antes3 = await cuenta(pg);
      const hay = await pg.evaluate(src => { const re = new RegExp(src); const b = [...document.querySelectorAll('#chat-quick .chat-qbtn')].find(x => re.test(x.textContent)); if (b) b.click(); return !!b; }, c.pulsarChip.source);
      if (!hay) favMal = 'no hay boton que case con ' + c.pulsarChip;
      await pg.waitForFunction(n => document.querySelectorAll('#chat-messages .chat-bubble.bot .chat-body').length > n, antes3, { timeout: 25000 }).catch(() => {});
      const r3 = await pg.evaluate(() => { const b = document.querySelectorAll('#chat-messages .chat-bubble.bot .chat-body'); return b[b.length - 1].textContent; });
      const l3 = await pg.evaluate(() => { const m = document.getElementById('chat-messages'); const l = [...m.querySelectorAll('.chat-poi-list')].pop(); return l ? l.querySelectorAll('.chat-poi-item').length : 0; });
      if (hay && c.trasChip.some(r => !r.test(r3))) favMal = 'tras el boton: ' + r3.slice(0, 120);
      if (hay && c.trasChipLista && l3 !== c.trasChipLista) favMal = 'tras el boton salen ' + l3 + ' lugares, no ' + c.trasChipLista;
    }
    const faltan  = c.debe.filter(r => !r.test(resp));
    const sobran  = c.noDebe.filter(r => r.test(resp));
    const sinLista = c.conLista && !lista;
    /* Los botones de seguimiento tambien son respuesta: una contestacion en
       chino con los botones en castellano no esta bien puesta. */
    const botonesMal = c.botones ? !(chips.length && chips.every(t => c.botones.test(t))) : false;
    const sinContacto = c.contacto && !contacto;
    const ok = despues > antes && !faltan.length && !sobran.length && !sinLista
            && !botonesMal && !errores.length && !sinContacto && !bienvenidaMal && !accionesMal && !trasMal && !favMal;
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
    if (nombresLista.length && (c.favs || c.ordenDesde)) console.log('        lista: ' + nombresLista.join(' | '));
    if (favMal)         console.log('        favoritos: ' + favMal);
    if (errores.length) console.log('        ERRORES DE PAGINA: ' + errores.join(' / '));
    console.log('');
    await pg.close();
  }
  await nav.close();
  console.log(malos ? malos + ' de ' + CONSULTAS.length + ' no pasan' : 'las ' + CONSULTAS.length + ' responden en su idioma');
  process.exit(malos ? 1 : 0);
})();
