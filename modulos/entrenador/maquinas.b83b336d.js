/* modulos/entrenador/maquinas.<huella>.js — Jérôme, el entrenador: las coreografías de «maquinas» (41 ejercicios).
   Lo pide modulos/entrenador.js al abrir la ficha de uno de ellos (TG_ENTRENADOR.pedir); solo, no hace nada.
   <huella> son los 8 primeros caracteres del sha256 de este fichero: si cambia una coma, cambia el nombre, y cada
   motor pide los suyos. Recibe del motor lo que usa de él (N) y le devuelve las huellas de los pasos de sus fichas.

   NO EDITAR A MANO: lo hace tools/entrenador/construir.py con tools/entrenador/src/7d-maquinas.js. */
(function () {
  'use strict';
  var T = window.TG_ENTRENADOR;
  if (!T || typeof T._trozo !== 'function') return;
  T._trozo('maquinas', function (N) {
    var ALTO = N.ALTO, C = N.C, COREO = N.COREO, D = N.D, EN_BARRA = N.EN_BARRA, EN_BARRA_SUP = N.EN_BARRA_SUP, HOMBRO = N.HOMBRO, M_COL = N.M_COL,
        PIE = N.PIE, PL = N.PL, RAD = N.RAD, SUELTA = N.SUELTA, aLocal = N.aLocal, aLosLados = N.aLosLados, abre = N.abre, aplicar = N.aplicar,
        bajaSube = N.bajaSube, bancoDe = N.bancoDe, busca = N.busca, clavar = N.clavar, clavo = N.clavo, colgando = N.colgando,
        conAgarre = N.conAgarre, cuelga = N.cuelga, deTalon = N.deTalon, el = N.el, enSusMuslos = N.enSusMuslos, entre = N.entre,
        estirado = N.estirado, flexion = N.flexion, inclinado = N.inclinado, largo = N.largo, lejos = N.lejos, mas = N.mas, menos = N.menos,
        mezcla = N.mezcla, plano = N.plano, por = N.por, porArco = N.porArco, punto = N.punto, quieto = N.quieto, reflejo = N.reflejo,
        resolver = N.resolver, sentadoEnRespaldo = N.sentadoEnRespaldo, silla5 = N.silla5, sobre = N.sobre, tumbadoEn = N.tumbadoEn,
        unidad = N.unidad;
  /* ───────────────────────── las coreografías: EN MÁQUINA Y EN MULTIPOWER (bloque 14) ─────────────────────────
     Las mismas reglas que en 70-coreografias.js: cada una sale de los pasos verificados de su ficha y no añade técnica
     que la ficha no diga. Son de todos los grupos, y lo que tienen en común es la máquina (50-material.js, «maquina»):
     cada una se dice aquí por piezas (el asiento, el respaldo, los rodillos, las palancas con sus asas, la torre de placas)
     y lo que se mueve en ella va con la parte del cuerpo que lo mueve. Van por máquina: sentado, con las piernas; la
     prensa y la hack; tumbado y de pie, con las piernas; las pantorrillas; el tronco; sentado, con los brazos; las
     dominadas asistidas; y el multipower.
     Donde el movimiento es el de un ejercicio de otro bloque (con barra o en polea), las posturas son las de aquel,
     vueltas a escribir aquí con sus números: cada trozo lleva lo suyo. */
  (function () {
    var T2 = ['ti', 'td'], NADA = [], M2 = ['mi@0:1', 'md@0:-1'];
    var NEU = { tipo: 'puno', prono: 0 };
    function dir(g) { return [0, Math.sin(g * RAD), Math.cos(g * RAD)]; }        /* en el plano de perfil: 0, hacia delante; 90, hacia arriba */

    /* ══════════════════════════════ LA SILLA DE UNA MÁQUINA ══════════════════════════════
       sentado(y, r): la cadera a «y» del suelo (el asiento queda 11 cm por debajo) y en z = 0; el tronco, recostado «r» grados en el
       respaldo. silla(y, r, o): sus piezas, para ese cuerpo: el asiento, el respaldo (a 11,5 cm del eje del tronco), la columna y el
       larguero del suelo con sus dos pies. o: { asiento: [largo, dónde va su centro], respaldo: largo, ancho, pies: [z de atrás, z de delante] } */
    function sentado(y, r, extra) { return sobre({ pel: [0, y, 0], giro: [0, -r, 0], cab: [r * 0.7, 0, 0] }, extra || {}); }
    function silla(y, r, o) {
      o = o || {};
      var n = dir(r), u = dir(90 + r), as = o.asiento || [40, 5], lr = o.respaldo || 58, w = o.ancho || 38, pz = o.pies || [-36, 30];
      var ys = y - 14.5, cr = mas([0, y, 0], mas(por(n, -15), por(u, lr / 2 - 8))), tras = mas(cr, por(n, -5.5));
      var P = [['cojin', [0, ys, as[1]], [w, 7, as[0]]], ['tubo', [0, 2, as[1]], [0, ys - 3, as[1]], 3], ['tubo', [0, 2.2, pz[0]], [0, 2.2, pz[1]], 2.6, 'hierroS'],
        ['tubo', [-27, 2, pz[0]], [27, 2, pz[0]], 2.2, 'hierroS'], ['tubo', [-27, 2, pz[1]], [27, 2, pz[1]], 2.2, 'hierroS']];
      if (lr > 0) P.push(['cojin', cr, [w - 4, 7, lr], u, n], ['tubo', [0, 2.2, pz[0]], tras, 2.6]);
      return P;
    }
    /* la torre de placas, a un lado y por detrás */
    function pila(x, z, alto, mec, gana, cero) { return ['pila', [x, 2, z], alto, { mec: mec, gana: gana, cero: cero || 0, eje: 'z' }]; }
    /* las asas de los lados del asiento: dos mangos de delante atrás, y sus agarres */
    function asasAsiento(y, z, x) { x = x || 26; return { piezas: [['asa', [x, y, z - 6], [x, y, z + 6]], ['asa', [-x, y, z - 6], [-x, y, z + 6]], ['tubo', [x, y - 9, z - 8], [x, y, z - 7], 1.4], ['tubo', [-x, y - 9, z - 8], [-x, y, z - 7], 1.4]], agarres: { i: [x, y, z], d: [-x, y, z] } }; }
    /* los brazos, a las asas de los lados del asiento (el clavo los deja en su sitio justo) */
    var A_LAS_ASAS = { a: [26, -1, 4], en: 'pelvis', polo: [0.6, 0, -1] }, EN_ASA = { tipo: 'puno', barra: [0, 0, 1], palma: [-1, 0, 0] }, EN_ASA_D = { tipo: 'puno', barra: [0, 0, 1], palma: [1, 0, 0] };

    /* ══════════════════════════════ SENTADO, CON LAS PIERNAS ══════════════════════════════
       La rodilla, en el canto del asiento y en línea con el eje de la máquina: el muslo no se mueve y la pierna gira sobre la rodilla
       (el tobillo se dice a una pierna justa de ella). pierna(K, g): el tobillo izquierdo con la pierna a «g» grados (−90, a plomo; 0,
       horizontal hacia delante) */
    function rodillaDe(y, x, cae) { cae = cae == null ? 4 : cae; return [x || 11, y - cae, Math.sqrt(D.muslo * D.muslo - cae * cae - ((x || 11) - D.caderaX) * ((x || 11) - D.caderaX))]; }
    function pierna(K, g, polo) { return { a: mas(K, por(dir(g), D.pierna)), polo: polo || [0, 1, 0.4] }; }

    /* la extensión de cuádriceps: el rodillo, por delante de las espinillas y justo encima de los tobillos; se agarra a las asas, con la
       cadera y la espalda en el respaldo; estira las piernas hasta tener las rodillas rectas, sin bloquearlas, y aguanta un instante;
       vuelve con control */
    COREO['extension-cuadriceps-maquina'] = (function () {
      var Y = 67, K = rodillaDe(Y), asas = asasAsiento(Y - 8, 6);
      var cuerpo = function (g, brazos) { return sentado(Y, 15, sobre({ p: pierna(K, g) }, brazos)); };
      var agarra = { b: A_LAS_ASAS, mi: EN_ASA, md: EN_ASA_D };
      var a0 = enSusMuslos(cuerpo(-92, {})), a = cuerpo(-92, agarra), b = cuerpo(-14, agarra);
      var eje = [0, K[1], K[2]], rul = mas(eje, mas(por(dir(-92), D.pierna - 7), por(dir(-2), 9.6)));
      return {
        vista: [[62, 10], [112, 8]], rastro: 'ti', esfuerzo: [0, 1], clavos: M2, clavosEn: { a0: NADA },
        material: [['maquina', {
          fijo: silla(Y, 15, { asiento: [46, 9], pies: [-36, 22] }).concat(asas.piezas, [pila(-47, -22, 118, 0, 0.36, 0), ['tubo', [-24, 2, 22], [-24, K[1], K[2]], 2.4], ['disco', [-25.5, K[1], K[2]], [1, 0, 0], 7, 3, M_COL.hierroL]]),
          mec: [{ gira: [eje, [1, 0, 0]], ref: mas(eje, por(dir(-90), D.pierna)), sigue: 'tobillos', lim: [-100, 12],
            piezas: [['tubo', [-24, K[1], K[2]], [-24, rul[1], rul[2]], 2.2], ['tubo', [-24, rul[1], rul[2]], [-19, rul[1], rul[2]], 1.6], ['rulo', [-19, rul[1], rul[2]], [19, rul[1], rul[2]], 5, 7]] }],
          agarres: asas.agarres }]],
        posturas: { a0: a0, a: a, b: b }, inicio: 'a', encuadra: ['a0', 'b'],
        rep: [['b', 1.7, 'empuje'], ['b', 0.7], ['a', 1.9, 'freno'], ['a', 0.4]],
        pasos: ['a0', { sec: [['a', 1.2, 'suave', NADA]], desde: 'a0' }, 'rep', 'rep']
      };
    })();

    /* el curl femoral sentado: las piernas, estiradas sobre el rodillo (por detrás, justo encima de los talones), y la almohadilla
       sobre los muslos, por encima de las rodillas; dobla las rodillas llevando el rodillo hacia atrás de los muslos; aguanta y vuelve */
    COREO['curl-femoral-sentado'] = (function () {
      var Y = 67, K = rodillaDe(Y, 11, 3), asas = asasAsiento(Y - 8, 2), G0 = -10, G1 = -112;
      var cuerpo = function (g) { return sentado(Y, 20, { p: pierna(K, g, [0, 1, 0.2]), t: { tob: 6 }, b: A_LAS_ASAS, mi: EN_ASA, md: EN_ASA_D }); };
      var eje = [0, K[1], K[2]], rul = mas(eje, mas(por(dir(G0), D.pierna - 8), por(dir(G0 - 90), 9.6))), al = [0, K[1] + 12.3, K[2] - 9];
      return {
        vista: [[66, 10], [112, 8]], rastro: 'ti', esfuerzo: [0, 1], clavos: M2,
        material: [['maquina', {
          fijo: silla(Y, 20, { asiento: [34, 2], pies: [-38, 26] }).concat(asas.piezas, [pila(-47, -24, 118, 0, 0.3, 0), ['tubo', [-24, 2, 26], [-24, K[1], K[2]], 2.4], ['disco', [-25.5, K[1], K[2]], [1, 0, 0], 7, 3, M_COL.hierroL],
            ['rulo', [-19, al[1], al[2]], [19, al[1], al[2]], 4.6, 7], ['tubo', [-24, K[1], K[2]], [-24, al[1], al[2]], 2], ['tubo', [-24, al[1], al[2]], [-19, al[1], al[2]], 1.6]]),
          mec: [{ gira: [eje, [1, 0, 0]], ref: mas(eje, por(dir(G0), D.pierna)), sigue: 'tobillos', lim: [-5, 118],
            piezas: [['tubo', [-24, K[1], K[2]], [-24, rul[1], rul[2]], 2.2], ['tubo', [-24, rul[1], rul[2]], [-19, rul[1], rul[2]], 1.6], ['rulo', [-19, rul[1], rul[2]], [19, rul[1], rul[2]], 5, -3]] }],
          agarres: asas.agarres }]],
        posturas: { a: cuerpo(G0), b: cuerpo(G1) }, inicio: 'a',
        rep: [['b', 1.5, 'empuje'], ['b', 0.8], ['a', 1.9, 'freno'], ['a', 0.4]],
        pasos: ['a', 'rep', 'rep']
      };
    })();

    /* las dos de cadera, sentado: cada muslo gira sobre su cadera y lleva su palanca, con la almohadilla junto a la rodilla (por fuera,
       en la abductora; por dentro, en la aductora) y el estribo bajo el pie. g: cuánto se abre cada muslo */
    function deCadera(dentro, G0, G1) {
      var Y = 62, yk = Y - 3.5, l = Math.sqrt(D.muslo * D.muslo - 3.5 * 3.5), asas = asasAsiento(Y - 8, -2, 27);
      var rod = function (g, sg) { return [sg * (D.caderaX + l * Math.sin(g * RAD)), yk, l * Math.cos(g * RAD)]; };
      var cuerpo = function (g, brazos) {
        var K = rod(g, 1), u = [Math.sin(g * RAD), 0, Math.cos(g * RAD)];
        return sentado(Y, 12, sobre({ p: { a: [K[0], yk - D.pierna, K[2]], polo: [u[0], 0.5, u[2]] }, t: { punta: u, arriba: [0, 1, 0] } }, brazos));
      };
      var palanca = function (sg) {
        var K = rod(G0, sg), s = Math.sin(G0 * RAD), c = Math.cos(G0 * RAD), u = [sg * s, 0, c], fuera = [sg * c, 0, -s], k = dentro ? -1 : 1;
        var pad = mas(K, mas(por(u, -7), por(fuera, k * 10.6))), bajo = [pad[0], yk - 15, pad[2]], est = [pad[0], yk - D.pierna - 9.5, K[2] + 4];
        return { gira: [[sg * D.caderaX, yk, 0], [0, 1, 0]], ref: K, sigue: 'rodilla-' + (sg > 0 ? 'i' : 'd'), lim: [-70, 70],
          piezas: [['cojin', pad, [15, 5, 17], u, por(fuera, -k), 3, 'centro'], ['tubo', [sg * D.caderaX, yk - 15, 4], bajo, 2.2], ['tubo', bajo, [pad[0], yk - 4, pad[2]], 2.2],
            ['tubo', bajo, est, 1.8], ['tubo', est, [K[0] - k * fuera[0] * 7, est[1], est[2] - k * fuera[2] * 7], 1.8, 'hierroL']] };
      };
      var agarra = { b: A_LAS_ASAS, mi: EN_ASA, md: EN_ASA_D };
      return {
        cuerpo: cuerpo, agarra: agarra,
        material: [['maquina', { fijo: silla(Y, 12, { asiento: [36, 4], pies: [-36, 22] }).concat(asas.piezas, [pila(0, -44, 112, 0, 0.9, 0)]), mec: [palanca(1), palanca(-1)], agarres: asas.agarres }]]
      };
    }
    /* la abducción: la cara externa de los muslos, contra las almohadillas; separa las piernas despacio y vuelve con control */
    COREO['abduccion-cadera-maquina'] = (function () {
      var M = deCadera(false, 6, 6), a0 = enSusMuslos(M.cuerpo(6, {})), a = M.cuerpo(6, M.agarra), b = M.cuerpo(36, M.agarra);
      return {
        vista: [[28, 14], [78, 10]], rastro: 'ri', esfuerzo: [0, 1], clavos: M2, clavosEn: { a0: NADA }, material: M.material,
        posturas: { a0: a0, a: a, b: b }, inicio: 'a', encuadra: ['a0', 'b'],
        rep: [['b', 1.6, 'empuje'], ['b', 0.4], ['a', 1.8, 'freno'], ['a', 0.4]],
        pasos: ['a0', { sec: [['a', 1.2, 'suave', NADA]], desde: 'a0' }, 'rep']
      };
    })();
    /* la aducción: las rodillas, por dentro de las almohadillas, y las manos en las asas; junta los muslos y vuelve despacio */
    COREO['aduccion-cadera-maquina'] = (function () {
      var M = deCadera(true, 36, 36), a = M.cuerpo(36, M.agarra), b = M.cuerpo(8, M.agarra);
      return {
        vista: [[28, 14], [78, 10]], rastro: 'ri', esfuerzo: [0, 1], clavos: M2, material: M.material,
        posturas: { a: a, b: b }, inicio: 'a',
        rep: [['b', 1.5, 'empuje'], ['b', 0.4], ['a', 1.9, 'freno'], ['a', 0.4]],
        pasos: ['a', 'rep', 'rep']
      };
    })();

    /* ══════════════════════════════ LA PRENSA DE PIERNAS (inclinada 45°) ══════════════════════════════
       La cadera, en el ángulo del asiento con el respaldo; la plataforma corre por los raíles (PR.d) y los pies van planos en ella.
       PR.en(t, h, x): un punto de la máquina, a «t» cm de la cadera a lo largo de los raíles y «h» hacia arriba de ellos (hacia la cabeza) */
    var PR = (function () {
      var d = dir(45), w = dir(135), C = [0, 40, 0];
      return { d: d, w: w, C: C, en: function (t, h, x) { return mas([x || 0, C[1], C[2]], mas(por(d, t), por(w, h))); } };
    })();
    var EN_ASA_PR = { tipo: 'puno', barra: PR.d, palma: [-1, 0, 0] }, EN_ASA_PR_D = { tipo: 'puno', barra: PR.d, palma: [1, 0, 0] };
    var ASAS_PR = { b: { a: PR.en(8, 3, 29.5), polo: [0.7, -0.2, -0.7] }, mi: EN_ASA_PR, md: EN_ASA_PR_D };
    function enPrensa(extra) { return sobre({ pel: PR.C, giro: [0, -45, 0], cab: [16, 0, 0] }, extra || {}); }
    /* cuánto hay de la cadera al tobillo con la rodilla a esos grados (180, recta) */
    function deCaderaATobillo(grados) { return Math.sqrt(D.muslo * D.muslo + D.pierna * D.pierna - 2 * D.muslo * D.pierna * Math.cos(grados * RAD)); }
    /* la pierna izquierda con el pie plano en la plataforma: el tobillo en x, a «h» de la línea de la cadera, con la rodilla a «grados» */
    function piePrensa(x, grados, h) {
      var L = deCaderaATobillo(grados), dx = x - D.caderaX, t = Math.sqrt(L * L - h * h - dx * dx);
      return { p: { a: PR.en(t, h, x), polo: mas(PR.w, [0.22, 0, 0]) }, t: { punta: PR.w, arriba: por(PR.d, -1) }, bola: t + 8 };
    }
    /* el pie apoyado solo en su parte delantera, girado «fi» grados sobre la bola (+: empuja con la punta); la bola, a «wb» de la línea de la cadera.
       Al empujar, los dedos se doblan lo mismo (flex) y siguen planos en la plataforma: con el pie tieso, la puntera se metía 2 cm en ella */
    function puntaPrensa(fi, x, wb, grados) {
      var c = Math.cos(fi * RAD), s = Math.sin(fi * RAD), L = deCaderaATobillo(grados), tw = wb + 8 * s - 12 * c, dx = x - D.caderaX, td = Math.sqrt(L * L - tw * tw - dx * dx);
      return { p: { a: PR.en(td, tw, x), polo: PR.w }, t: { punta: mas(por(PR.w, c), por(PR.d, s)), arriba: mas(por(PR.d, -c), por(PR.w, s)), flex: Math.max(0, fi) }, bola: td + 8 * c + 12 * s };
    }
    /* la máquina: T0, dónde espera la plataforma (a cuánto de la cadera queda su cara); lim, lo que corre */
    function prensa(T0, lim, max) {
      var en = PR.en, R = -30, pz = [en(-18, R)[2], en(128, R)[2]], pl = en(T0 + 1.6, 13);
      var fijo = [['cojin', mas(PR.C, mas(por(PR.w, -14.5), por(PR.d, 7))), [40, 7, 36], PR.d, PR.w], ['cojin', mas(PR.C, mas(por(PR.d, -15), por(PR.w, 27))), [38, 7, 72], PR.w, PR.d],
        ['tubo', [0, 2.2, -52], [0, 2.2, 20], 2.6, 'hierroS'], ['tubo', [0, 2.2, -52], mas(PR.C, mas(por(PR.d, -19), por(PR.w, 40))), 2.6], ['tubo', [0, 2.2, 14], mas(PR.C, mas(por(PR.w, -18.5), por(PR.d, 7))), 2.6],
        ['tubo', [-24, 2, -52], [24, 2, -52], 2.2, 'hierroS'],
        ['asa', en(3, -5, 29.5), en(15, -5, 29.5)], ['asa', en(3, -5, -29.5), en(15, -5, -29.5)], ['tubo', en(2, -12, 22), en(2.5, -5, 29.5), 1.4], ['tubo', en(2, -12, -22), en(2.5, -5, -29.5), 1.4]];
      [1, -1].forEach(function (s) {
        fijo.push(['tubo', en(-18, R, s * 20), en(128, R, s * 20), 2.2, 'cromoS'], ['tubo', [s * 20, 2, pz[1]], en(128, R, s * 20), 2.6], ['tubo', [s * 20, 2.2, pz[0] - 4], [s * 20, 2.2, pz[1]], 2.4, 'hierroS']);
      });
      fijo.push(['tubo', [-26, 2, pz[1]], [26, 2, pz[1]], 2.2, 'hierroS']);
      var carro = [['placa', pl, [58, 3, 46], PR.w, por(PR.d, -1), -3], ['tubo', en(T0 + 4, R, -24), en(T0 + 4, R, 24), 2.4]];
      [1, -1].forEach(function (s) {
        carro.push(['tubo', en(T0 + 4, R, s * 20), en(T0 + 3.4, 2, s * 20), 2.4], ['tubo', en(T0 + 3.4, 2, s * 20), en(T0 + 3.4, 26, s * 20), 2], ['tubo', en(T0 + 4, R, s * 20), en(T0 + 31, -13, s * 22), 2], ['tubo', en(T0 + 31, -13, s * 22), en(T0 + 31, -13, s * 40), 1.6, 'cromo'],
          ['disco', en(T0 + 31, -13, s * 31), [1, 0, 0], 19, 4.6, null, -1], ['disco', en(T0 + 31, -13, s * 36.4), [1, 0, 0], 15, 3.6, '#c9413f', -0.5]);
      });
      return ['maquina', { fijo: fijo, mec: [{ corre: PR.d, ref: en(T0, 0), sigue: 'bolas', max: max || 0, lim: lim, piezas: carro }], agarres: { i: en(9, -5, 29.5), d: en(9, -5, -29.5) },
        encuadre: [[-40, 0, -56], [40, 0, pz[1] + 4], en(128, R + 6, 24), en(T0 + lim[1] + 4, 40, 0), [0, 110, -50]] }];
    }
    /* la prensa: la espalda y el coxis, en el respaldo; los pies, planos en la plataforma, con las rodillas a unos 90 grados; agarra las
       asas y empuja estirando cadera y rodillas, sin bloquearlas; una breve pausa, y deja volver la plataforma despacio */
    COREO['prensa-piernas'] = (function () {
      var A = piePrensa(16, 90, 6), B = piePrensa(16, 160, 6);
      var a0 = enSusMuslos(enPrensa({ p: A.p, t: A.t })), a = enPrensa(sobre({ p: A.p, t: A.t }, ASAS_PR)), b = enPrensa(sobre({ p: B.p, t: B.t }, ASAS_PR));
      return {
        vista: [[72, 10], [112, 12]], rastro: 'ri', esfuerzo: [3], clavos: M2, clavosEn: { a0: NADA }, material: [prensa(A.bola, [0, 40])],
        posturas: { a0: a0, a: a, b: b }, inicio: 'b', encuadra: ['a0', 'b'],
        rep: [['b', 0.6], ['a', 1.9, 'freno'], ['a', 0.3], ['b', 1.5, 'empuje']],
        pasos: ['a0', { sec: [['a', 1.1, 'suave', NADA], ['a', 0.3], ['b', 1.5, 'empuje']], desde: 'a0' }, 'rep']
      };
    })();
    /* con los pies juntos (separados el ancho de un pie): agarra las asas, suelta los seguros y baja el peso hasta que las rodillas forman
       un ángulo recto; y empuja de nuevo hasta arriba, sin bloquear las rodillas */
    COREO['prensa-piernas-pies-juntos'] = (function () {
      var A = piePrensa(10, 90, 6), B = piePrensa(10, 162, 6);
      var b0 = enSusMuslos(enPrensa({ p: B.p, t: B.t })), a = enPrensa(sobre({ p: A.p, t: A.t }, ASAS_PR)), b = enPrensa(sobre({ p: B.p, t: B.t }, ASAS_PR));
      return {
        vista: [[72, 10], [155, 22]], rastro: 'ri', esfuerzo: [0], clavos: M2, clavosEn: { b0: NADA }, material: [prensa(A.bola, [0, 40])],
        posturas: { b0: b0, a: a, b: b }, inicio: 'a', encuadra: ['b0', 'a'],
        rep: [['b', 1.5, 'empuje'], ['b', 0.5], ['a', 1.9, 'freno'], ['a', 0.3]],
        pasos: ['b0', { sec: [['b', 1.1, 'suave', NADA], ['b', 0.5], ['a', 2.0, 'freno']], desde: 'b0' }, 'rep']
      };
    })();
    /* a una pierna: un solo pie en la plataforma (el otro espera en el suelo); empuja hasta casi estirarla; deja volver la plataforma
       despacio y, al terminar, sube el otro pie, baja este y lo repite con la otra pierna */
    COREO['prensa-piernas-una-pierna'] = (function () {
      var A = piePrensa(13, 90, 6), B = piePrensa(13, 158, 6), SUELO = { suelo: [-9.5, 32], abre: 4 }, SUELO_I = { suelo: [9.5, 32], abre: 4 };
      var cuerpo = function (I, Dr) { return enPrensa(sobre(sobre({ pi: I ? I.p : SUELO_I, pd: Dr ? reflejo(Dr.p) : SUELO }, ASAS_PR), sobre(I ? { ti: I.t } : {}, Dr ? { td: reflejo(Dr.t) } : {}))); };
      return {
        vista: [[70, 10], [112, 12]], rastro: 'ri', esfuerzo: [0], clavos: M2, material: [prensa(A.bola, [0, 40], 1)],
        posturas: { a: cuerpo(A, null), b: cuerpo(B, null), x: cuerpo(A, A), a2: cuerpo(null, A), b2: cuerpo(null, B) }, inicio: 'a', encuadra: ['b'],
        rep: [['b', 1.5, 'empuje'], ['b', 0.5], ['a', 1.9, 'freno'], ['a', 0.3]],
        pasos: ['a', 'rep', { sec: [['a', 1.8, 'freno'], ['x', 1.1, 'suave'], ['a2', 1.1, 'suave'], ['b2', 1.5, 'empuje'], ['b2', 0.4], ['a2', 1.8, 'freno']], desde: 'b', dura: 8.2 }]
      };
    })();
    /* la elevación de talones en la prensa: solo la parte delantera de los pies en la plataforma (los talones, libres bajo su canto); con
       las piernas estiradas, empuja con las puntas tan lejos como puede; y deja que la plataforma vuelva llevando las puntas hacia él */
    COREO['elevacion-talones-prensa'] = (function () {
      var WB = -7, P = function (fi) { var q = puntaPrensa(fi, 9, WB, 172); return { q: q, P: enPrensa(sobre({ p: q.p, t: q.t }, ASAS_PR)) }; }, A = P(0), B = P(30), C = P(-16);
      return {
        vista: [[76, 8], [112, 12]], rastro: 'tli', esfuerzo: [0, 1], clavos: M2, material: [prensa(A.q.bola, [-20, 20])],
        posturas: { a: A.P, b: B.P, c: C.P }, inicio: 'c', encuadra: ['b'],
        rep: [['b', 1.1, 'empuje'], ['b', 0.5], ['c', 1.6, 'freno'], ['c', 0.4]],
        pasos: ['a', 'rep', 'rep']
      };
    })();

    /* ══════════════════════════════ LA MÁQUINA HACK ══════════════════════════════
       La espalda, en el respaldo de un carro que corre por dos raíles inclinados (HK.d: 30° hacia atrás de la vertical); los hombros, bajo
       sus almohadillas; los pies, en la plataforma, que es perpendicular a los raíles. HK.en(t, f, x): un punto, a «t» cm del tobillo de la
       sentadilla a lo largo de los raíles y «f» hacia delante */
    var HK = (function () {
      var d = dir(120), e = dir(30), O = [0, 26, 24];
      return { d: d, e: e, O: O, F: -10, en: function (t, f, x) { return mas([x || 0, O[1], O[2]], mas(por(d, t), por(e, f || 0))); } };
    })();
    var EN_ASA_HK = { tipo: 'puno', barra: HK.e, palma: [-1, 0, 0] }, EN_ASA_HK_D = { tipo: 'puno', barra: HK.e, palma: [1, 0, 0] };
    /* el cuerpo, con la cadera a «t» del tobillo (por los raíles) */
    function enHack(t, pies, extra) { return sobre(sobre({ pel: HK.en(t, HK.F), giro: [0, -30, 0], cab: [22, 0, 0] }, pies), extra || {}); }
    var PIES_HK = { p: { a: HK.en(0, 0, 12), polo: mas(HK.e, [0.25, 0, 0]) }, t: { punta: unidad(mas(por(HK.e, Math.cos(8 * RAD)), [Math.sin(8 * RAD), 0, 0])), arriba: HK.d } };
    function tHack(grados, f) { var L = deCaderaATobillo(grados), q = HK.F - (f || 0); return Math.sqrt(L * L - q * q - 4); }
    /* la máquina: TR, a cuánto está la cadera con el carro en sus topes */
    function hack(TR, lim) {
      var en = HK.en, C = en(TR, HK.F), al = function (t, f, x) { return mas(C, mas([x || 0, 0, 0], mas(por(HK.d, t), por(HK.e, f)))); }, RF = HK.F - 23, base = en(-8, 13);
      var z0 = en(-9, RF)[2], zt = en(150, RF)[2];
      var fijo = [['placa', mas(base, por(HK.d, -1.6)), [60, 3, 42], HK.e, HK.d, -3], ['tubo', mas(base, por(HK.d, -3)), [0, 2, base[2] + 2], 3], ['tubo', [-28, 2, base[2] + 12], [28, 2, base[2] + 12], 2.2, 'hierroS'], ['tubo', [-28, 2, zt], [28, 2, zt], 2.2, 'hierroS']];
      [1, -1].forEach(function (s) { fijo.push(['tubo', en(-9, RF, s * 24), en(150, RF, s * 24), 2.2, 'cromoS'], ['tubo', [s * 24, 2, zt], en(150, RF, s * 24), 2.6], ['tubo', [s * 24, 2.2, zt], [s * 24, 2.2, base[2] + 12], 2.4, 'hierroS']); });
      var carro = [['cojin', al(24, -15), [36, 7, 62], HK.d, HK.e], ['tubo', al(20, -21, -24), al(20, -21, 24), 2.4], ['tubo', al(48, -21, -24), al(48, -21, 24), 2.4]];
      [1, -1].forEach(function (s) {
        carro.push(['cojin', al(53.2, 3, s * 17), [13, 6, 15], HK.e, por(HK.d, -1), 4, 'centro'], ['tubo', al(55, -15, s * 17), al(56.5, 0, s * 17), 2], ['tubo', al(56.5, 4, s * 17), al(49, 15, s * 27), 1.6], ['asa', al(49, 9, s * 27), al(49, 21, s * 27)],
          ['tubo', al(34, -21, s * 24), al(34, -50, s * 24), 2], ['tubo', al(34, -50, s * 24), al(34, -50, s * 39), 1.6, 'cromo'], ['disco', al(34, -50, s * 31), [1, 0, 0], 19, 4.6, null, -1], ['disco', al(34, -50, s * 36.2), [1, 0, 0], 15, 3.6, '#c9413f', -0.6]);
      });
      return ['maquina', { fijo: fijo, mec: [{ corre: HK.d, ref: al(32, 0), sigue: { en: 'torax', a: [0, 10, 0] }, lim: lim, piezas: carro, agarres: { i: al(49, 15, 27), d: al(49, 15, -27) } }],
        encuadre: [[-34, 0, base[2] + 34], [34, 0, zt - 4], en(150, RF, 24), [0, 150, 0]] }];
    }
    var ASAS_HK = function (P) { var C = P.pel; return sobre(P, { b: { a: mas(C, mas([27, 0, 0], mas(por(HK.d, 46), por(HK.e, 8)))), polo: [0.5, -1, 0.4] }, mi: EN_ASA_HK, md: EN_ASA_HK_D }); };
    /* la sentadilla hack: la espalda en el respaldo y los hombros bajo las almohadillas; los pies, al frente y algo más juntos que los
       hombros, con las puntas un poco abiertas; agarra las asas; se estira hasta quedar de pie y baja doblando las rodillas; y vuelve a subir */
    COREO['sentadilla-hack-maquina'] = (function () {
      var TR = tHack(148), r0 = enSusMuslos(enHack(TR, PIES_HK)), r = ASAS_HK(enHack(TR, PIES_HK)), a = ASAS_HK(enHack(tHack(170), PIES_HK)), b = ASAS_HK(enHack(tHack(92), PIES_HK));
      return {
        /* los pies van clavados a la plataforma: sin clavar, a media repetición el tobillo se iba 4 cm y la zapatilla se hundía en ella */
        vista: [[66, 10], [106, 10]], rastro: 'pel', esfuerzo: [0], clavos: M2.concat(T2), clavosEn: { r0: T2 }, material: [hack(TR, [-30, 12])],
        posturas: { r0: r0, r: r, a: a, b: b }, inicio: 'b', encuadra: ['a', 'b'],
        rep: [['a', 1.4, 'empuje'], ['a', 0.5], ['b', 1.9, 'freno'], ['b', 0.3]],
        pasos: ['r0', { sec: [['r', 1.2, 'suave', T2]], desde: 'r0' }, { sec: [['a', 1.1, 'empuje'], ['a', 0.5], ['b', 2.0, 'freno']], desde: 'r' }, 'rep']
      };
    })();
    /* la elevación de talones en la hack: la espalda en el respaldo y la mitad delantera de los pies en el canto de la plataforma; con las
       rodillas estiradas, sube los talones tanto como puede; y baja hasta estirar del todo la pantorrilla */
    COREO['elevacion-talones-hack'] = (function () {
      var FB = -2, X = 10;
      var P = function (fi) {
        var c = Math.cos(fi * RAD), s = Math.sin(fi * RAD), p = mas(por(HK.e, c), por(HK.d, -s)), ar = mas(por(HK.d, c), por(HK.e, s));
        var td = -8 + 8 * c + 12 * s, tf = FB + 8 * s - 12 * c, L = deCaderaATobillo(173), q = HK.F - tf, th = td + Math.sqrt(L * L - q * q);
        return ASAS_HK(enHack(th, { p: { a: HK.en(td, tf, X), polo: HK.e }, t: { punta: p, arriba: ar, flex: Math.max(0, fi) } }));
      };
      var a = P(0), TR = aLocal([[1, 0, 0], HK.d, HK.e], menos(a.pel, HK.O))[1];
      return {
        vista: [[72, 8], [108, 10]], rastro: 'tli', esfuerzo: [0, 1], clavos: M2, material: [hack(TR, [-14, 16])],
        posturas: { a: a, b: P(31), c: P(-17) }, inicio: 'c', encuadra: ['b'],
        rep: [['b', 1.1, 'empuje'], ['b', 0.5], ['c', 1.6, 'freno'], ['c', 0.4]],
        pasos: ['a', 'rep', 'rep']
      };
    })();

    /* la sentadilla con cinturón: de pie sobre dos cajones, con el cinturón en la cadera y la carga colgando de él entre los pies (el peso
       cuelga de la cadera y no de la espalda); baja en sentadilla con todo el recorrido y el tronco erguido; y sube */
    COREO['sentadilla-cinturon'] = (function () {
      var H = 22, pies = { suelo: [22, 0], abre: 14, alto: H, polo: [0.32, 0.1, 1] }, CINT = { a: [17, 14, 5], en: 'pelvis', polo: [1, 0, -0.3] }, R = [0, H + PIE - 1, 0];
      var a = { pel: R, p: pies, b: CINT }, b = { pel: [0, H + 37, -17], giro: [0, 14, 0], col: [2, 0, 0], cab: [-12, 0, 0], p: pies, b: CINT };
      var y = R[1] + 1.5, carga = [['rulo', [-16, y, 11], [16, y, 11], 2.6, 3], ['rulo', [-16, y, -11.5], [16, y, -11.5], 2.6, -3], ['rulo', [16.5, y, 11], [16.5, y, -11.5], 2.6, 2], ['rulo', [-16.5, y, 11], [-16.5, y, -11.5], 2.6, 2],
        ['tubo', [0, y - 2, 12.5], [0, y - 26, 5], 0.9, 'cromoS', 2], ['tubo', [0, y - 26, 5], [0, y - 47, 5], 1.3, 'cromo', 0], ['disco', [0, y - 39, 5], [0, 1, 0], 11.5, 4, null, 0.4], ['disco', [0, y - 44, 5], [0, 1, 0], 11.5, 4, '#c9413f', 0]];
      return {
        vista: [[40, 10], [84, 8]], rastro: 'pel', esfuerzo: [2], clavos: T2,
        material: [['maquina', { fijo: [['placa', [27.5, H / 2, 3], [29, H, 54]], ['placa', [-27.5, H / 2, 3], [29, H, 54]]], mec: [{ lleva: true, ref: R, sigue: { en: 'pelvis', a: [0, 0, 0] }, piezas: carga }] }]],
        posturas: { a: a, b: b },
        rep: bajaSube('b', 'a', [1.9, 0.3, 1.3, 0.5]),
        pasos: ['a', 'rep', 'rep']
      };
    })();

    /* ══════════════════════════════ TUMBADO Y DE PIE, CON LAS PIERNAS ══════════════════════════════ */
    /* el curl femoral tumbado: boca abajo, con las rodillas en línea con el eje, fuera del cojín, y el rodillo sobre las pantorrillas,
       por encima de los talones; las manos, en las asas de delante. pi, pd: cada pierna, a esos grados (183, estirada hacia atrás) */
    var CFT = (function () {
      var YB = 62, C = [0, YB + 11.5, 0], cae = 4.5, K = [10.5, C[1] - cae, -Math.sqrt(D.muslo * D.muslo - cae * cae - 0.25)], G0 = 183, eje = [0, K[1], K[2]];
      var pierna2 = function (g) { return { a: mas(K, por(dir(g), D.pierna)), polo: [0, -1, 0] }; };
      var cuerpo = function (gi, gd) {
        var P = { pel: C, giro: [0, 90, 0], cab: [-16, 0, 0], pi: pierna2(gi), pd: reflejo(pierna2(gd)), t: { tob: 14 }, mi: EN_ASA, md: EN_ASA_D };
        return sobre(P, { b: { a: [22, YB - 9, 43], polo: [1, -0.1, -0.25] } });
      };
      var rul = mas(eje, mas(por(dir(G0), D.pierna - 9), por(dir(G0 - 90), 9.6)));
      var material = function (max) {
        return [['maquina', {
          fijo: [['cojin', [0, YB - 3.5, 8], [34, 7, 88]], ['tubo', [0, 2, -8], [0, YB - 7, -8], 3], ['tubo', [0, 2, 30], [0, YB - 7, 30], 3], ['tubo', [0, 2.2, -44], [0, 2.2, 62], 2.6, 'hierroS'],
            ['tubo', [-27, 2, -44], [27, 2, -44], 2.2, 'hierroS'], ['tubo', [-27, 2, 62], [27, 2, 62], 2.2, 'hierroS'], ['tubo', [-25, 2, -44], [-25, K[1], K[2]], 2.4], ['disco', [-26.5, K[1], K[2]], [1, 0, 0], 7, 3, M_COL.hierroL],
            ['asa', [22, YB - 10, 45], [22, YB - 10, 57]], ['asa', [-22, YB - 10, 45], [-22, YB - 10, 57]], ['tubo', [22, YB - 10, 44], [0, YB - 8, 40], 1.4], ['tubo', [-22, YB - 10, 44], [0, YB - 8, 40], 1.4],
            pila(-49, 30, 112, 0, 0.26, 0)],
          mec: [{ gira: [eje, [1, 0, 0]], ref: mas(eje, por(dir(G0), D.pierna)), sigue: 'tobillos', max: max || 0, lim: [-4, 126],
            piezas: [['tubo', [-25, K[1], K[2]], [-25, rul[1], rul[2]], 2.2], ['tubo', [-25, rul[1], rul[2]], [-19, rul[1], rul[2]], 1.6], ['rulo', [-19, rul[1], rul[2]], [19, rul[1], rul[2]], 5, 2]] }],
          agarres: { i: [22, YB - 10, 51], d: [-22, YB - 10, 51] } }]];
      };
      return { G0: G0, G1: 66, cuerpo: cuerpo, material: material };
    })();
    /* con las dos piernas: agarra las asas; dobla las rodillas y lleva el rodillo hacia los glúteos; una breve pausa, y vuelve despacio */
    COREO['curl-femoral-tumbado'] = {
      vista: [[72, 12], [112, 16]], rastro: 'ti', esfuerzo: [0, 1], clavos: M2, clavosEn: { a0: NADA }, material: CFT.material(),
      posturas: { a0: sobre(CFT.cuerpo(CFT.G0, CFT.G0), { b: { a: [25, 30, 40], polo: [1, 0, -0.4] }, m: SUELTA }), a: CFT.cuerpo(CFT.G0, CFT.G0), b: CFT.cuerpo(CFT.G1, CFT.G1) }, inicio: 'a', encuadra: ['a0'],
      rep: [['b', 1.5, 'empuje'], ['b', 0.6], ['a', 1.9, 'freno'], ['a', 0.4]],
      pasos: ['a0', { sec: [['a', 1.3, 'suave', NADA]], desde: 'a0' }, 'rep', 'rep']
    };
    /* a una pierna: dobla una sola rodilla (la otra pierna se queda estirada) y, al terminar, lo repite con la otra */
    COREO['curl-femoral-tumbado-una-pierna'] = {
      vista: [[72, 12], [112, 16]], rastro: 'ti', esfuerzo: [0, 1], clavos: M2, material: CFT.material(1),
      posturas: { a: CFT.cuerpo(CFT.G0, CFT.G0), b: CFT.cuerpo(CFT.G1, CFT.G0), b2: CFT.cuerpo(CFT.G0, CFT.G1) }, inicio: 'a',
      rep: [['b', 1.5, 'empuje'], ['b', 0.6], ['a', 1.9, 'freno'], ['a', 0.4]],
      pasos: ['a', 'rep', { sec: [['a', 1.8, 'freno'], ['a', 0.3], ['b2', 1.5, 'empuje'], ['b2', 0.6], ['a', 1.8, 'freno']], desde: 'b', dura: 6.4 }]
    };

    /* el curl femoral de pie: de cara a la máquina, con los muslos contra su cojín y las manos en las asas; el rodillo, por detrás y justo
       por encima del tobillo; lleva despacio un pie hacia el glúteo (el muslo no se mueve) y vuelve; y, al terminar, lo hace con la otra pierna */
    COREO['curl-femoral-de-pie-maquina'] = (function () {
      var K = [10, D.tobillo + D.pierna, -2], eje = [0, K[1], K[2]], G0 = -90, G1 = -192;
      var rul = mas(eje, mas(por(dir(G0), D.pierna - 9), por(dir(G0 - 90), 9.6)));
      var base = { pel: [0, PIE, -2], giro: [0, 9, 0], cab: [-6, 0, 0], p: { suelo: [10, -2], abre: 2 } };
      var manos = { b: { a: [16, 110, 18], polo: [0.7, -1, -0.2] }, m: { tipo: 'puno', barra: [1, 0, 0], palma: [0, -0.4, 1] } };
      var doblada = function (g, tob) { return { a: mas(K, por(dir(g), D.pierna)), polo: [0, 0, 1], tob: tob }; };
      var con = function (k, g, tob) { var c = {}, q = doblada(g, tob); c['p' + k] = k === 'i' ? { a: q.a, polo: q.polo } : { a: [-q.a[0], q.a[1], q.a[2]], polo: q.polo }; c['t' + k] = { tob: tob }; return sobre(sobre(base, manos), c); };
      var a0 = sobre(base, { b: aLosLados(8), m: NEU }), a = sobre(base, manos);
      return {
        vista: [[108, 8], [62, 10]], rastro: 'ti', clavos: ['mi@0:1', 'md@0:-1', 'ti', 'td'], clavosEn: { a0: T2 },
        material: [['maquina', {
          fijo: [['tubo', [0, 2, 26], [0, 122, 26], 3.2], ['cojin', [0, 63, 13.6], [36, 7, 26], [0, 1, 0], [0, 0, -1], 2, 'centro'], ['tubo', [0, 63, 17], [0, 63, 26], 2.2], ['tubo', [-22, 110, 24], [22, 110, 24], 1.5, 'cromo'],
            ['asa', [10, 110, 24], [22, 110, 24]], ['asa', [-22, 110, 24], [-10, 110, 24]], ['placa', [0, 1.2, 6], [64, 2.4, 60], null, null, -20], ['tubo', [-27, 2, 0], [-27, K[1], K[2]], 2.4], ['disco', [-28.5, K[1], K[2]], [1, 0, 0], 7, 3, M_COL.hierroL],
            pila(-36, 44, 112, 0, 0.24, 0)],
          mec: [{ gira: [eje, [1, 0, 0]], ref: mas(eje, por(dir(G0), D.pierna)), sigue: 'tobillos', max: 1, lim: [0, 112],
            piezas: [['tubo', [-27, K[1], K[2]], [-27, rul[1], rul[2]], 2.2], ['tubo', [-27, rul[1], rul[2]], [-19, rul[1], rul[2]], 1.6], ['rulo', [-19, rul[1], rul[2]], [19, rul[1], rul[2]], 4.6, -2]] }],
          agarres: { i: [16, 110, 24], d: [-16, 110, 24] } }]],
        posturas: { a0: a0, a: a, mi_: con('i', -122, -24), bi: con('i', G1, 12), md_: con('d', -122, -24), bd: con('d', G1, 12) }, inicio: 'a', encuadra: ['a0', 'bi'],
        pasos: ['a0', { sec: [['a', 1.2, 'suave', T2]], desde: 'a0' },
          { sec: [['mi_', 0.45, 'entra', ['mi@0:1', 'md@0:-1', 'td']], ['bi', 1.0, 'sale', ['mi@0:1', 'md@0:-1', 'td']], ['bi', 0.4, null, ['mi@0:1', 'md@0:-1', 'td']], ['mi_', 1.1, 'entra', ['mi@0:1', 'md@0:-1', 'td']], ['a', 0.5, 'sale', ['mi@0:1', 'md@0:-1', 'td']], ['a', 0.3],
            ['md_', 0.45, 'entra', ['mi@0:1', 'md@0:-1', 'ti']], ['bd', 1.0, 'sale', ['mi@0:1', 'md@0:-1', 'ti']], ['bd', 0.4, null, ['mi@0:1', 'md@0:-1', 'ti']], ['md_', 1.1, 'entra', ['mi@0:1', 'md@0:-1', 'ti']], ['a', 0.5, 'sale', ['mi@0:1', 'md@0:-1', 'ti']]], desde: 'a', dura: 7.8 }]
      };
    })();

    /* la elevación glúteo-isquio: los tobillos, entre los rodillos, y los pies, en la plataforma; los muslos, sobre la almohadilla, justo
       por encima de las rodillas; los brazos, cruzados. Empieza con las rodillas a unos 90 grados y el tronco vertical; estira las rodillas
       (la cadera gira sobre ellas) y, cerca de la horizontal, dobla la cadera sobre la almohadilla hasta que el tronco queda casi vertical
       hacia abajo; para subir, extiende primero la cadera y, en la horizontal, dobla las rodillas */
    COREO['elevacion-gluteo-isquio'] = (function () {
      var YA = 100, A = [9, YA, -40], K = [YA, -2], CRUZ = { a: [-7, 11, 13.5], en: 'torax', polo: [1, -0.7, 0.3] }, PIE_G = { punta: [0, -1, 0], arriba: [0, 0, 1] };
      var en = function (alfa, cadera, cab) { var h = mas([0, K[0], K[1]], por(dir(alfa), D.muslo)); return { pel: h, giro: [0, 90 - alfa + cadera, 0], cab: [cab || 0, 0, 0], p: { a: A, polo: [0, -1, 0.5] }, t: PIE_G, b: CRUZ, m: SUELTA }; };
      var P = { a: en(90, 0), h: en(4, 0, -14), v: en(4, 78, -6) };
      var sube = porArco(P, 'u', P.h, P.a, 'a', 3, 2.0, K), baja = porArco(P, 'd', P.a, P.h, 'h', 3, 2.3, K), vuelve = porArco(P, 'w', P.h, P.a, 'a', 3, 2.3, K);
      return {
        vista: [[84, 8], [118, 12]], rastro: 'hombros', clavos: T2, zoom: 0.94,
        material: [['maquina', { fijo: [['rulo', [-21, 83, 16.5], [21, 83, 16.5], 12, -2], ['tubo', [-25, 2, 18], [-23, 83, 16.5], 2.6], ['tubo', [25, 2, 18], [23, 83, 16.5], 2.6],
          ['placa', [0, YA - 6, -49.6], [44, 3, 34], [0, 1, 0], [0, 0, 1], -4], ['rulo', [-18, YA + 9.3, -33], [18, YA + 9.3, -33], 4.2, 2], ['rulo', [-18, YA - 9.3, -33], [18, YA - 9.3, -33], 4.2, -2],
          ['tubo', [-22, 2, -52], [-22, YA + 9.3, -51], 2.6], ['tubo', [22, 2, -52], [22, YA + 9.3, -51], 2.6], ['tubo', [-22, YA + 9.3, -51], [-18, YA + 9.3, -33], 1.8], ['tubo', [22, YA + 9.3, -51], [18, YA + 9.3, -33], 1.8],
          ['tubo', [-22, YA - 9.3, -51], [-18, YA - 9.3, -33], 1.8], ['tubo', [22, YA - 9.3, -51], [18, YA - 9.3, -33], 1.8],
          ['tubo', [-25, 2.2, -62], [-25, 2.2, 44], 2.6, 'hierroS'], ['tubo', [25, 2.2, -62], [25, 2.2, 44], 2.6, 'hierroS'], ['tubo', [-25, 2.2, -62], [25, 2.2, -62], 2.4, 'hierroS'], ['tubo', [-25, 2.2, 44], [25, 2.2, 44], 2.4, 'hierroS']] }]],
        posturas: P, inicio: 'a', encuadra: ['a', 'v'],
        pasos: ['h', { sec: sube, desde: 'h' }, { sec: baja.concat([['v', 1.9, 'freno']]), desde: 'a' }, { sec: [['h', 1.8, 'empuje']].concat(vuelve), desde: 'v' }]
      };
    })();

    /* ══════════════════════════════ LAS PANTORRILLAS ══════════════════════════════ */
    /* de pie: los hombros, bajo los cojines; la parte delantera de los pies, en el apoyo, con los talones libres; con el cuerpo erguido y
       las rodillas estiradas, sube los talones tanto como puede; una breve pausa, y baja hasta estirar del todo la pantorrilla */
    COREO['elevacion-talones-maquina-de-pie'] = (function () {
      var ALTO = 14, ZP = -10, YH0 = HOMBRO + ALTO - 0.12, EJ = [0, YH0 + 9, 62];
      var en = function (talon) { var q = deTalon(talon); return { pel: [0, PIE + ALTO + q[1] - 0.12, ZP + q[0]], p: { suelo: [10, ZP], abre: 3, alto: ALTO, talon: talon }, b: { a: [26, 17, 8], en: 'torax', polo: [0.6, -1, 0.1] }, mi: EN_ASA, md: EN_ASA_D }; };
      var pal = [];
      [1, -1].forEach(function (s) { pal.push(['cojin', [s * 18, YH0 + 8.8, ZP + 1], [14, 6, 18], [0, 0, 1], [0, -1, 0], 4, 'centro'], ['tubo', [s * 18, YH0 + 12, ZP + 1], [s * 18, YH0 + 12, EJ[2]], 2.2], ['tubo', [s * 18, YH0 + 11, ZP + 12], [s * 27, YH0 + 1, ZP + 19], 1.6], ['asa', [s * 27, YH0 + 1, ZP + 13], [s * 27, YH0 + 1, ZP + 25]]); });
      return {
        vista: [[104, 8], [52, 10]], rastro: 'tli', esfuerzo: [0, 1], clavos: ['mi@0:1', 'md@0:-1', 'ti', 'td'],
        material: [['maquina', {
          fijo: [['placa', [0, ALTO / 2, 14.5], [70, ALTO, 30], null, null, -14], ['tubo', [0, 2, EJ[2]], [0, YH0 + 30, EJ[2]], 3.4], ['tubo', [-18, YH0 + 12, EJ[2]], [18, YH0 + 12, EJ[2]], 2.4], ['tubo', [0, 2.2, 0], [0, 2.2, EJ[2] + 24], 2.6, 'hierroS'],
            ['tubo', [-28, 2, EJ[2] + 24], [28, 2, EJ[2] + 24], 2.2, 'hierroS'], pila(0, EJ[2] + 12, 150, 0, 2.4, 0)],
          mec: [{ gira: [[0, YH0 + 12, EJ[2]], [1, 0, 0]], ref: [0, YH0, ZP], sigue: 'hombros', lim: [-14, 14], piezas: pal, agarres: { i: [27, YH0 + 1, ZP + 19], d: [-27, YH0 + 1, ZP + 19] } }] }]],
        posturas: { a: en(0), b: en(38), c: en(-14) }, inicio: 'c', encuadra: ['b'],
        rep: [['b', 1.0, 'empuje'], ['b', 0.5], ['c', 1.6, 'freno'], ['c', 0.4]],
        pasos: ['a', 'rep', 'rep']
      };
    })();
    /* sentado: la parte delantera de los pies, en el apoyo; los muslos, bajo el cojín, justo por encima de las rodillas; sube los talones
       tanto como puede; una breve pausa, y baja hasta estirar la pantorrilla */
    COREO['elevacion-talones-sentado-maquina'] = (function () {
      var AP = 8, Y = D.tobillo + D.pierna + AP, ZT = D.muslo;
      var en = function (talon) { return sentado(Y, 0, { giro: [0, 5, 0], cab: [-3, 0, 0], p: { suelo: [12, ZT], abre: 4, alto: AP, talon: talon, polo: [0.1, 1, 0.4] }, b: { a: [15, Y + 8, ZT - 4], polo: [0.8, -0.3, -0.6] }, m: { tipo: 'puno', barra: [1, 0, 0], palma: [0, -1, 0] } }); };
      var a = en(0), Ka = resolver(a).i.rod, R = [0, Ka[1], Ka[2]], EJ = [0, Ka[1] + 8, ZT + 66], al = [0, Ka[1] + 11.4, Ka[2] - 9];
      var pal = [['rulo', [-20, al[1], al[2]], [20, al[1], al[2]], 4.6, 6], ['tubo', [-24, al[1], al[2]], [-20, al[1], al[2]], 1.6], ['tubo', [24, al[1], al[2]], [20, al[1], al[2]], 1.6], ['tubo', [-15, al[1] + 7, al[2] + 5], [15, al[1] + 7, al[2] + 5], 1.5, 'cromo'],
        ['asa', [9, al[1] + 7, al[2] + 5], [21, al[1] + 7, al[2] + 5]], ['asa', [-21, al[1] + 7, al[2] + 5], [-9, al[1] + 7, al[2] + 5]], ['tubo', [0, al[1] + 7, al[2] + 5], [0, EJ[1], al[2] + 16], 1.8]];
      [1, -1].forEach(function (s) { pal.push(['tubo', [s * 24, al[1], al[2]], [s * 24, EJ[1], EJ[2]], 2.2], ['tubo', [s * 24, EJ[1], EJ[2] - 20], [s * 36, EJ[1], EJ[2] - 20], 1.6, 'cromo'], ['disco', [s * 30, EJ[1], EJ[2] - 20], [1, 0, 0], 17, 4.6, null, 0], ['disco', [s * 35, EJ[1], EJ[2] - 20], [1, 0, 0], 13, 3.6, '#c9413f', 0.4]); });
      return {
        vista: [[70, 10], [24, 16]], rastro: 'tli', esfuerzo: [0, 1], clavos: ['mi@0:1', 'md@0:-1', 'ti', 'td'],
        material: [['maquina', {
          fijo: silla(Y, 0, { asiento: [36, -2], respaldo: -1, pies: [-24, ZT + 86] }).concat([['placa', [0, AP / 2, ZT + 17], [52, AP, 12], null, null, -12], ['tubo', [-24, 2, EJ[2]], [-24, EJ[1], EJ[2]], 2.6], ['tubo', [24, 2, EJ[2]], [24, EJ[1], EJ[2]], 2.6], ['tubo', [-24, 2, EJ[2]], [24, 2, EJ[2]], 2.2, 'hierroS']]),
          mec: [{ gira: [EJ, [1, 0, 0]], ref: R, sigue: 'rodillas', lim: [-12, 12], piezas: pal, agarres: { i: [15, al[1] + 7, al[2] + 5], d: [-15, al[1] + 7, al[2] + 5] } }] }]],
        posturas: { a: a, b: en(34), c: en(-12) }, inicio: 'c', encuadra: ['b'],
        rep: [['b', 1.0, 'empuje'], ['b', 0.5], ['c', 1.5, 'freno'], ['c', 0.4]],
        pasos: ['a', 'rep', 'rep']
      };
    })();

    /* ══════════════════════════════ EL TRONCO ══════════════════════════════ */
    /* el crunch en máquina: sentado, con los pies bien apoyados y las manos en las asas, ante los hombros; enrolla el tronco hacia delante,
       despegando la espalda poco a poco; y regresa despacio. La palanca gira a la altura de la cintura y las asas van con las manos */
    COREO['crunch-maquina'] = (function () {
      var Y = 55, EJ = [0, Y + 16, -3], MAN = { tipo: 'puno', barra: [1, 0, 0], palma: [0, -0.3, 1] };
      var cuerpo = function (flex) { return sentado(Y, 6, { col: [flex, 0, 0], cab: [4 + flex * 0.25, 0, 0], p: { suelo: [14, 44], abre: 7, polo: [0.2, 1, 0.3] }, b: { a: [17, 25, 6.5], en: 'torax', polo: [0.55, -1, 0.2] }, m: MAN }); };
      var a = cuerpo(0), g = resolver(a).i.agarre, pal = [];
      [1, -1].forEach(function (s) { pal.push(['tubo', [s * 27, EJ[1], EJ[2]], [s * 27, g[1] + 3, g[2] - 5], 2.2], ['tubo', [s * 27, g[1] + 3, g[2] - 5], [s * 27, g[1], g[2]], 2], ['tubo', [s * 27, g[1], g[2]], [s * 10, g[1], g[2]], 1.5, 'cromo'], ['asa', [s * (g[0] - 6), g[1], g[2]], [s * (g[0] + 6), g[1], g[2]]]); });
      return {
        vista: [[70, 10], [112, 8]], rastro: 'hombros', esfuerzo: [0, 1], clavos: ['mi@0:1', 'md@0:-1', 'ti', 'td'],
        material: [['maquina', {
          fijo: silla(Y, 6, { respaldo: 50 }).concat([pila(-46, -24, 124, 0, 0.5, 0), ['tubo', [-27, 2, -36], [-27, EJ[1], EJ[2]], 2.4], ['tubo', [27, 2, -36], [27, EJ[1], EJ[2]], 2.4], ['disco', [-28.5, EJ[1], EJ[2]], [1, 0, 0], 6, 3, M_COL.hierroL], ['disco', [28.5, EJ[1], EJ[2]], [1, 0, 0], 6, 3, M_COL.hierroL]]),
          mec: [{ gira: [EJ, [1, 0, 0]], ref: [0, g[1], g[2]], sigue: 'manos', lim: [-8, 70], piezas: pal, agarres: { i: g, d: [-g[0], g[1], g[2]] } }] }]],
        posturas: { a: a, b: cuerpo(38) }, inicio: 'a',
        rep: [['b', 1.5, 'empuje'], ['b', 0.5], ['a', 1.9, 'freno'], ['a', 0.3]],
        pasos: ['a', 'rep', 'rep']
      };
    })();
    /* la silla romana: los antebrazos, en los cojines, y la espalda en el respaldo; el cuerpo cuelga con las piernas sueltas; sube las
       piernas tan alto como puede, una breve pausa, y las baja; el tronco no se mueve */
    COREO['elevacion-piernas-silla-romana'] = (function () {
      var YS = 150, Y = YS - 43.5, YC = YS - D.brazo, G = [21, YC + 1.5, D.antebrazo + D.mano];
      var cuerpo = function (e) { return { pel: [0, Y - 2.5, 0], hom: [2.5, 0], p: { e: e, z: 0, c: e > 40 ? 5 : 9 }, t: { tob: 24 }, b: { a: [21, YC + 1.5, D.antebrazo], polo: [0, -1, -0.3] }, m: { tipo: 'puno', barra: [0, 1, 0], palma: [-1, 0, 0] } }; };
      var fijo = [['cojin', [0, Y + 22, -15.2], [32, 7, 58], [0, 1, 0], [0, 0, 1]], ['tubo', [-31, 2, -22], [31, 2, -22], 2.4, 'hierroS'], ['tubo', [-31, YS + 44, -22], [31, YS + 44, -22], 2.6], ['tubo', [-31, Y + 22, -22], [31, Y + 22, -22], 2.2]];
      [1, -1].forEach(function (s) {
        fijo.push(['tubo', [s * 31, 2, -22], [s * 31, YS + 44, -22], 3], ['tubo', [s * 31, 2.2, -42], [s * 31, 2.2, 42], 2.6, 'hierroS'], ['tubo', [s * 31, YC - 11, -22], [s * 25, YC - 11, 22], 2.4],
          ['cojin', [s * 21, YC - 7.2, 8], [11, 6, 30], null, null, 3, 'centro'], ['tubo', [s * 25, YC - 11, 22], [s * 21, YC - 9, 32], 1.8], ['asa', [s * 21, YC - 6, 32], [s * 21, YC + 9, 32]]);
      });
      return {
        vista: [[62, 8], [100, 10]], rastro: 'ti', esfuerzo: [0, 1], clavos: M2, zoom: 0.96,
        material: [['maquina', { fijo: fijo, agarres: { i: G, d: [-G[0], G[1], G[2]] } }]],
        posturas: { a: cuerpo(3), b: cuerpo(93) }, inicio: 'a',
        rep: [['b', 1.3, 'empuje'], ['b', 0.6], ['a', 1.8, 'freno'], ['a', 0.4]],
        pasos: ['a', 'rep', 'rep']
      };
    })();

    /* ══════════════════════════════ EL HIP THRUST EN MÁQUINA ══════════════════════════════
       Como el del bloque 10: la parte alta de la espalda, en el respaldo; el tronco gira sobre él (los hombros no se mueven) y los pies no
       se mueven. El cinturón cruza la cadera y va con ella; sus dos brazos giran al pie de la máquina, donde van los discos */
    COREO['hip-thrust-maquina'] = (function () {
      var EJE = [-24, 48.5], T_HT = ['ti', 'td'];
      var en = function (y, x, abre) { var dy = EJE[1] - y, dz = Math.sqrt(43.5 * 43.5 - dy * dy); return { pel: [0, y, EJE[0] + dz], giro: [0, -Math.atan2(dz, dy) / RAD, 0], cab: [12, 0, 0], p: { suelo: [x, 60], abre: abre, polo: [0.15, 1, 0.3] }, b: { a: [28.5, 5, 13], en: 'pelvis', polo: [1, 0.2, -0.5] }, m: { tipo: 'puno', barra: [1, 0, 0], palma: [0, -1, 0] } }; };
      var s = en(17, 11, 3), s1 = sobre(s, { pi: { suelo: [18, 60], abre: 12, polo: [0.15, 1, 0.3] } }), a = en(17, 18, 12), b = sobre(en(49, 18, 12), { cab: [14, 0, 0] });
      var E0 = resolver(a), R = mas(E0.pel, aplicar(E0.Bp, [0, 3, 12.5])), cint = [['rulo', mas(R, [-33, 0, 0]), mas(R, [33, 0, 0]), 3.3, 5]];
      [1, -1].forEach(function (k) { cint.push(['tubo', [k * 32, 10, 96], mas(R, [k * 34, 0, 0]), 2.2, null, null, 'A']); });
      var g = resolver(a).i.agarre;
      return {
        vista: [[42, 20], [84, 12]], rastro: 'pel', esfuerzo: [0], clavos: ['mi@0:1', 'md@0:-1', 'ti', 'td'],
        material: [['maquina', {
          fijo: [['cojin', [0, 41.5, -31], [52, 8, 30], dir(38), dir(128)], ['tubo', [0, 2, -36], [0, 37, -33], 3.2], ['tubo', [0, 2.2, -40], [0, 2.2, 98], 2.6, 'hierroS'], ['tubo', [-30, 2, -40], [30, 2, -40], 2.2, 'hierroS'], ['tubo', [-30, 2, 98], [30, 2, 98], 2.2, 'hierroS'],
            ['placa', [0, 1.2, 66], [58, 2.4, 34], null, null, -20], ['tubo', [-32, 2, 96], [-32, 12, 96], 2.4], ['tubo', [32, 2, 96], [32, 12, 96], 2.4], ['tubo', [-46, 16, 88], [46, 16, 88], 1.6, 'cromo'],
            ['disco', [-39, 16, 88], [1, 0, 0], 14, 4.6, null, 0.5], ['disco', [-44, 16, 88], [1, 0, 0], 11, 3.6, '#c9413f', 1], ['disco', [39, 16, 88], [1, 0, 0], 14, 4.6, null, 0.5], ['disco', [44, 16, 88], [1, 0, 0], 11, 3.6, '#c9413f', 1]],
          mec: [{ lleva: true, ref: R, sigue: { en: 'pelvis', a: [0, 3, 12.5] }, piezas: cint, agarres: { i: [28.5, R[1] + 1.5, R[2] + 1], d: [-28.5, R[1] + 1.5, R[2] + 1] } }] }]],
        posturas: { s: s, s1: s1, a: a, b: b }, inicio: 'a', encuadra: ['b'],
        rep: [['b', 1.3, 'empuje'], ['b', 0.5], ['a', 1.8, 'freno'], ['a', 0.3]],
        pasos: ['s', { sec: [['s1', 0.8, 'suave', ['mi@0:1', 'md@0:-1', 'td']], ['a', 0.8, 'suave', ['mi@0:1', 'md@0:-1', 'ti']]], desde: 's' }, 'rep']
      };
    })();

    /* ══════════════════════════════ SENTADO, CON LOS BRAZOS ══════════════════════════════
       palanca(lado, eje, asa, o): una palanca que gira sobre un eje de lado a lado (eje: [alto, z]) y lleva un asa (el punto donde la
       coge la mano izquierda, con la máquina en reposo). lado: 1 o −1, la de esa mano sola; 0, una sola palanca con las dos asas.
       o: { asa: 'x' | 'y' | 'z' (a lo largo de qué va el mango), xb: a cuánto del centro va el brazo de la palanca, discos: en qué
       parte del brazo van (de 0, el eje, a 1), lim } */
    var PIES_S = { suelo: [15, 46], abre: 8, polo: [0.2, 1, 0.3] };
    function palanca(lado, eje, asa, o) {
      o = o || {};
      var xb = o.xb || (asa[0] + 6), piezas = [], ag = {}, u = o.asa === 'y' ? [0, 1, 0] : o.asa === 'z' ? [0, 0, 1] : [1, 0, 0];
      (lado ? [lado] : [1, -1]).forEach(function (s) {
        var G = [s * asa[0], asa[1], asa[2]], B = [s * xb, asa[1], asa[2]], P = [s * xb, eje[0], eje[1]], c;
        piezas.push(['tubo', P, B, 2.2], ['tubo', B, G, 1.5, 'cromo'], ['asa', menos(G, por(u, 6)), mas(G, por(u, 6))]);
        if (o.discos) { c = mezcla(P, B, o.discos); piezas.push(['tubo', c, mas(c, [s * 12, 0, 0]), 1.6, 'cromo'], ['disco', mas(c, [s * 6, 0, 0]), [1, 0, 0], 16, 4.6, null, 0], ['disco', mas(c, [s * 11, 0, 0]), [1, 0, 0], 12, 3.6, '#c9413f', 0.4]); }
        ag[s > 0 ? 'i' : 'd'] = G;
      });
      return { gira: [[0, eje[0], eje[1]], [1, 0, 0]], ref: [lado ? lado * asa[0] : 0, asa[1], asa[2]], sigue: lado ? (lado > 0 ? 'mano-i' : 'mano-d') : 'manos', lim: o.lim || [-85, 85], quieto: 0, piezas: piezas, agarres: ag };
    }
    var EN_MANGO_X = { tipo: 'puno', barra: [1, 0, 0], palma: [0, 0, 1] }, EN_MANGO_ABAJO = { tipo: 'puno', barra: [1, 0, 0], palma: [0, -1, 0] };
    /* los press de pecho: el eje, arriba (por delante, en el declinado); las asas van hacia delante. G0, G1: el asa, al empezar y con los brazos casi estirados */
    function pressPecho(o) {
      var r = o.r, G0 = o.G0, G1 = o.G1, m = mezcla(G0, G1, 0.5), d = unidad(menos(G1, G0)), n = [0, -d[2], d[1]], k = o.arriba === false ? -1 : 1;
      if (n[1] * k < 0) n = por(n, -1);
      var R = o.R || 88, h = Math.sqrt(R * R - largo(menos(G1, G0)) * largo(menos(G1, G0)) / 4), eje = [m[1] + n[1] * h, m[2] + n[2] * h], XB = 34, zt = Math.min(-34, eje[1]);
      var cuerpo = function (G, hom, polo) { return conAgarre(sentado(55, r, { cab: [o.cab == null ? r * 0.7 : o.cab, 0, 0], hom: hom || [0, 0], p: PIES_S, m: EN_MANGO_X }), G, polo || [1, -0.6, -0.8]); };
      var fijo = silla(55, r, { respaldo: 64, pies: [zt, 30] }).concat([['tubo', [-XB, eje[0], eje[1]], [XB, eje[0], eje[1]], 2.6], pila(0, zt - 14, 132, 0, 0.42, 0)]);
      [1, -1].forEach(function (s) { fijo.push(['tubo', [s * XB, 2, zt], [s * XB, eje[0], zt], 3], ['tubo', [s * XB, eje[0], zt], [s * XB, eje[0], eje[1]], 2.6], ['tubo', [s * XB, 2.2, zt], [s * XB, 2.2, 30], 2.4, 'hierroS']); });
      return {
        cuerpo: cuerpo, a0: enSusMuslos(sentado(55, r, { cab: [o.cab == null ? r * 0.7 : o.cab, 0, 0], p: PIES_S })),
        material: [['maquina', { reposo: true, fijo: fijo, mec: [palanca(0, eje, G0, { asa: 'x', xb: XB })] }]]
      };
    }
    var REP_PRESS = [['b', 1.4, 'empuje'], ['b', 0.4], ['a', 1.8, 'freno'], ['a', 0.3]];
    /* el press de pecho: las asas, a la altura de la parte baja del pecho; las agarra, saca pecho y mantiene la cabeza en el respaldo;
       empuja hacia delante hasta casi estirar los brazos, sin bloquear los codos, y vuelve despacio */
    COREO['press-pecho-maquina'] = (function () {
      var M = pressPecho({ r: 8, G0: [28, 82, 8], G1: [28, 89, 49], cab: 0 });
      return {
        vista: [[58, 10], [100, 8]], rastro: 'manos', esfuerzo: [0], clavos: M2, clavosEn: { a0: NADA }, reposo: ['a0'], material: M.material,
        posturas: { a0: M.a0, a: M.cuerpo([28, 82, 8], [0, -2]), b: M.cuerpo([28, 89, 49], [0, -1]) }, inicio: 'a', encuadra: ['a0', 'b'],
        rep: REP_PRESS,
        pasos: ['a0', { sec: [['a', 1.3, 'suave', NADA]], desde: 'a0' }, 'rep']
      };
    })();
    /* el inclinado: las asas, cerca de la parte alta del pecho; empuja despacio (hacia arriba y hacia delante) hasta extender los brazos
       sin bloquear los codos; una breve pausa, y regresa con control */
    COREO['press-inclinado-maquina'] = (function () {
      var G0 = [28, 92, -4], G1 = [28, 125.7, 24.3], M = pressPecho({ r: 30, G0: G0, G1: G1, R: 90, cab: 14 });
      return {
        vista: [[58, 10], [100, 8]], rastro: 'manos', esfuerzo: [0], clavos: M2, material: M.material,
        posturas: { a: M.cuerpo(G0, [0, -1.5], [1, -0.7, -0.6]), b: M.cuerpo(G1, [0, -1], [1, -0.7, -0.6]) }, inicio: 'a', encuadra: ['b'],
        rep: REP_PRESS,
        pasos: ['a', 'rep', 'rep']
      };
    })();
    /* el declinado: las asas, cerca de la parte baja del pecho; la cabeza, los hombros y los glúteos, en el respaldo; las agarra con las
       palmas hacia abajo, algo más abiertas que los hombros, y junta las escápulas; empuja (hacia delante y hacia abajo) y vuelve despacio */
    COREO['press-declinado-maquina'] = (function () {
      var G0 = [26, 82, 6], G1 = [26, 73.7, 43.6], M = pressPecho({ r: 10, G0: G0, G1: G1, R: 85, cab: 0 }), MANO = { m: EN_MANGO_ABAJO };
      return {
        vista: [[58, 10], [100, 8]], rastro: 'manos', esfuerzo: [0], clavos: M2, clavosEn: { a0: NADA }, reposo: ['a0'], material: M.material,
        posturas: { a0: M.a0, a: sobre(M.cuerpo(G0, [0, -2.6], [1, -0.3, -1]), MANO), b: sobre(M.cuerpo(G1, [0, -1.5], [1, -0.3, -1]), MANO) }, inicio: 'a', encuadra: ['a0', 'b'],
        rep: REP_PRESS,
        pasos: ['a0', { sec: [['a', 1.3, 'suave', NADA]], desde: 'a0' }, 'rep']
      };
    })();
    /* el press de hombros: las asas, a la altura de los hombros o algo por encima; las agarra con las muñecas rectas y lleva los hombros
       atrás y abajo; empuja hacia arriba hasta casi estirar los codos; y baja las asas despacio. El eje, detrás, a media altura */
    COREO['press-hombros-maquina'] = (function () {
      var G0 = [30, 101, 0], G1 = [30, 155.5, 0], eje = [128.25, -64], XB = 36;
      var cuerpo = function (G, hom, polo) { return conAgarre(sentado(55, 8, { cab: [5, 0, 0], hom: hom, p: PIES_S, m: EN_MANGO_X }), G, polo); };
      var fijo = silla(55, 8, { respaldo: 62, pies: [-64, 30] }).concat([['tubo', [-XB, eje[0], eje[1]], [XB, eje[0], eje[1]], 2.6], pila(0, -78, 132, 0, 0.5, 0)]);
      [1, -1].forEach(function (s) { fijo.push(['tubo', [s * XB, 2, eje[1]], [s * XB, eje[0] + 6, eje[1]], 3], ['tubo', [s * XB, 2.2, eje[1]], [s * XB, 2.2, 30], 2.4, 'hierroS']); });
      return {
        vista: [[52, 10], [98, 8]], rastro: 'manos', esfuerzo: [0], clavos: M2, clavosEn: { a0: NADA }, reposo: ['a0'],
        material: [['maquina', { reposo: true, fijo: fijo, mec: [palanca(0, eje, G0, { asa: 'x', xb: XB })] }]],
        posturas: { a0: enSusMuslos(sentado(55, 8, { cab: [5, 0, 0], p: PIES_S })), a: cuerpo(G0, [-1.5, -2], [0.7, -1, 0.1]), b: cuerpo(G1, [1.5, -1], [1, -0.4, 0.2]) }, inicio: 'a', encuadra: ['a0', 'b'],
        rep: [['b', 1.4, 'empuje'], ['b', 0.4], ['a', 1.9, 'freno'], ['a', 0.3]],
        pasos: ['a0', { sec: [['a', 1.3, 'suave', NADA]], desde: 'a0' }, 'rep', 'rep']
      };
    })();
    /* los fondos en máquina: las asas, a la altura de los codos, a los lados; las agarra con las palmas enfrentadas, los brazos pegados al
       cuerpo y los codos doblados; empuja hacia abajo hasta estirarlos, una pausa, y vuelve despacio. El eje, detrás */
    COREO['fondos-maquina'] = (function () {
      var G0 = [28, 73.5, 6], G1 = [28, 41.3, 6], eje = [57.4, -62], XB = 34;
      var cuerpo = function (G, polo) { return conAgarre(sentado(55, 6, { cab: [4, 0, 0], p: PIES_S, mi: EN_ASA, md: EN_ASA_D }), G, polo); };
      var fijo = silla(55, 6, { pies: [-62, 30] }).concat([['tubo', [-XB, eje[0], eje[1]], [XB, eje[0], eje[1]], 2.6]]);
      [1, -1].forEach(function (s) { fijo.push(['tubo', [s * XB, 2, eje[1]], [s * XB, eje[0] + 5, eje[1]], 3], ['tubo', [s * XB, 2.2, eje[1]], [s * XB, 2.2, 30], 2.4, 'hierroS']); });
      return {
        vista: [[60, 10], [104, 8]], rastro: 'manos', esfuerzo: [0], clavos: M2, clavosEn: { a0: NADA }, reposo: ['a0'],
        material: [['maquina', { reposo: true, fijo: fijo, mec: [palanca(0, eje, G0, { asa: 'z', xb: XB, discos: 0.26 })] }]],
        posturas: { a0: enSusMuslos(sentado(55, 6, { cab: [4, 0, 0], p: PIES_S })), a: cuerpo(G0, [0.02, 0.3, -1]), b: cuerpo(G1, [0.1, 0.2, -1]) }, inicio: 'a', encuadra: ['a0', 'b'],
        rep: [['b', 1.3, 'empuje'], ['b', 0.6], ['a', 1.8, 'freno'], ['a', 0.3]],
        pasos: ['a0', { sec: [['a', 1.3, 'suave', NADA]], desde: 'a0' }, 'rep']
      };
    })();

    /* los remos sentado, con el pecho en el apoyo: el eje, en el suelo, por delante; las asas vienen hacia él. alto: true, con los
       mangos atravesados y los codos abiertos a la altura de los hombros (el remo alto); si no, con los mangos de arriba abajo y los
       codos pegados al cuerpo. Cada asa lleva su palanca: una mano puede tirar sola */
    function remoMaquina(alto) {
      var S = alto ? [30, 98, 56] : [24, 97, 57], E = alto ? [30, 98, 22] : [24, 86, 14], YE = 10;
      var pz = ((S[1] - YE) * (S[1] - YE) + S[2] * S[2] - (E[1] - YE) * (E[1] - YE) - E[2] * E[2]) / (2 * (S[2] - E[2])), eje = [YE, pz], XB = alto ? 36 : 30;
      var gira = Math.atan2(E[2] - pz, E[1] - YE) / RAD, MAN = alto ? { m: EN_MANGO_ABAJO } : { mi: { tipo: 'puno', barra: [0, 1, 0], palma: [-1, 0, 0] }, md: { tipo: 'puno', barra: [0, 1, 0], palma: [1, 0, 0] } };
      var base = function (hom) { return sobre(sentado(55, 0, { hom: hom || [0, 0], p: { suelo: [17, 44], abre: 10, polo: [0.3, 1, 0.3] } }), MAN); };
      var lejos = function (P, k) { return conAgarre(P, k === 'bd' ? [-S[0], S[1], S[2]] : S, alto ? [1, -0.35, -0.2] : [0.5, -1, -0.2], k); };
      var cerca = function (P, k) { var polo = alto ? [1, 0.05, -0.45] : [0.04, -0.5, -1]; return conAgarre(P, k === 'bd' ? [-E[0], E[1], E[2]] : E, k === 'bd' ? [-polo[0], polo[1], polo[2]] : polo, k); };
      var fijo = silla(55, 0, { respaldo: -1, asiento: [38, 0], pies: [-24, pz + 8] }).concat([['cojin', [0, 80, 16.2], [24, 7, 30], [0, 1, 0], [0, 0, -1], 2, 'centro'], ['tubo', [0, 2, 22], [0, 70, 20], 2.8],
        ['tubo', [-XB, YE, pz], [XB, YE, pz], 2.6], ['tubo', [-XB, 2, pz], [-XB, YE, pz], 2.6], ['tubo', [XB, 2, pz], [XB, YE, pz], 2.6], ['tubo', [-XB - 2, 2, pz + 8], [XB + 2, 2, pz + 8], 2.2, 'hierroS']]);
      var o = { asa: alto ? 'x' : 'y', xb: XB, discos: 0.24, lim: [-40, 6] };
      return {
        S: S, E: E, base: base, lejos: lejos, cerca: cerca, gira: gira,
        a0: enSusMuslos(sentado(55, 0, { p: { suelo: [17, 44], abre: 10, polo: [0.3, 1, 0.3] } })),
        material: [['maquina', { reposo: true, fijo: fijo, mec: [palanca(1, eje, S, o), palanca(-1, eje, S, o)] }]]
      };
    }
    var M2B = M2;        /* cada mano, a su palanca (cada palanca lleva solo el asa de su lado) */
    /* el remo sentado: las asas, a la altura de los hombros, y el apoyo tocando el pecho; erguido, con los omóplatos abajo y atrás, las
       agarra; tira llevando los codos hacia atrás, pegados al cuerpo; una pausa cuando los codos pasan el tronco, y vuelve hasta estirar los brazos */
    COREO['remo-maquina-sentado'] = (function () {
      var M = remoMaquina(false), a = M.lejos(M.base([-1.5, -1.5])), b = M.cerca(M.base([-1.5, -3]));
      return {
        vista: [[64, 10], [112, 10]], rastro: 'codos', esfuerzo: [0, 1], clavos: M2B, clavosEn: { a0: NADA }, reposo: ['a0'], material: M.material,
        posturas: { a0: M.a0, a: a, b: b }, inicio: 'a', encuadra: ['a0', 'b'],
        rep: [['b', 1.3, 'empuje'], ['b', 0.7], ['a', 1.8, 'freno'], ['a', 0.3]],
        pasos: ['a0', { sec: [['a', 1.3, 'suave', NADA]], desde: 'a0' }, 'rep', 'rep']
      };
    })();
    /* a una mano: tira de una sola asa, con el codo hacia atrás y pegado al cuerpo y el tronco erguido; vuelve despacio y lo repite con el otro brazo */
    COREO['remo-maquina-una-mano'] = (function () {
      var M = remoMaquina(false), a = M.lejos(M.base([-1.5, -1.5])), bi = M.cerca(a, 'bi'), bd = M.cerca(a, 'bd');
      return {
        vista: [[64, 10], [112, 10]], rastro: 'ci', esfuerzo: [0, 1], clavos: M2B, material: M.material,
        posturas: { a: a, b: bi, b2: bd }, inicio: 'a', encuadra: ['b'],
        rep: [['b', 1.3, 'empuje'], ['b', 0.6], ['a', 1.8, 'freno'], ['a', 0.3]],
        pasos: ['a', 'rep', { sec: [['a', 1.7, 'freno'], ['a', 0.3], ['b2', 1.3, 'empuje'], ['b2', 0.6], ['a', 1.7, 'freno']], desde: 'b', dura: 6 }]
      };
    })();
    /* el remo alto: con el tronco vertical, tira de las asas abriendo los codos hacia los lados, a la altura de los hombros; para cuando
       los codos llegan a la línea de los hombros o un poco más atrás, una breve pausa, y vuelve despacio */
    COREO['remo-alto-maquina'] = (function () {
      var M = remoMaquina(true), a = M.lejos(M.base([0, 0])), b = M.cerca(M.base([0, -2.5]));
      return {
        vista: [[52, 14], [112, 10]], rastro: 'codos', esfuerzo: [0, 1], clavos: M2B, material: M.material,
        posturas: { a: a, b: b }, inicio: 'a', encuadra: ['b'],
        rep: [['b', 1.3, 'empuje'], ['b', 0.6], ['a', 1.8, 'freno'], ['a', 0.3]],
        pasos: ['a', 'rep', 'rep', 'rep']
      };
    })();
    /* y a una mano: tira de una sola asa con el codo abierto a la altura del hombro; vuelve despacio y lo repite con el otro brazo */
    COREO['remo-alto-maquina-una-mano'] = (function () {
      var M = remoMaquina(true), a = M.lejos(M.base([0, 0])), bi = M.cerca(a, 'bi'), bd = M.cerca(a, 'bd');
      return {
        vista: [[52, 14], [112, 10]], rastro: 'ci', esfuerzo: [0, 1], clavos: M2B, material: M.material,
        posturas: { a: a, b: bi, b2: bd }, inicio: 'a', encuadra: ['b'],
        rep: [['b', 1.3, 'empuje'], ['b', 0.6], ['a', 1.8, 'freno'], ['a', 0.3]],
        pasos: ['a', 'rep', { sec: [['a', 1.7, 'freno'], ['a', 0.3], ['b2', 1.3, 'empuje'], ['b2', 0.6], ['a', 1.7, 'freno']], desde: 'b', dura: 6 }]
      };
    })();

    /* ── el contractor: cada brazo de la máquina gira sobre un eje a plomo que pasa por el hombro, y su asa (de arriba abajo) va a un brazo
       casi estirado de él, a la altura del hombro. fi: hacia dónde apunta el brazo (0, al frente; 90, al lado) ── */
    function contractor(H, RH, F0, frente) {
      var YV = 156;      /* la viga de arriba: por encima del tupé (sentado, le llega a 148) */
      var en = function (fi) { return [H[0] + RH * Math.sin(fi * RAD), H[1], H[2] + RH * Math.cos(fi * RAD)]; };
      var mano = function (fi) { return { tipo: 'puno', barra: [0, 1, 0], palma: [-Math.cos(fi * RAD), 0, Math.sin(fi * RAD)] }; };
      var brazo = function (s) {
        var g = en(F0), G = [s * g[0], g[1], g[2]], T = [s * g[0], YV, g[2]], P = [s * H[0], YV, H[2]], ag = {};
        ag[s > 0 ? 'i' : 'd'] = G;
        return { gira: [[s * H[0], 0, H[2]], [0, 1, 0]], ref: G, sigue: s > 0 ? 'mano-i' : 'mano-d', lim: [-125, 125], quieto: 0,
          piezas: [['tubo', P, T, 2.2], ['tubo', T, [G[0], G[1] + 8, G[2]], 2], ['asa', [G[0], G[1] - 7, G[2]], [G[0], G[1] + 8, G[2]]]], agarres: ag };
      };
      var fijo = [['tubo', [-H[0] - 2, YV, H[2]], [H[0] + 2, YV, H[2]], 2.8]];
      if (frente) fijo.push(['tubo', [0, 2, 24], [0, YV, 24], 3.2], ['tubo', [0, YV, 24], [0, YV, H[2]], 2.8], ['cojin', [0, 80, 16.2], [24, 7, 30], [0, 1, 0], [0, 0, -1], 2, 'centro'], ['tubo', [0, 80, 19.7], [0, 80, 24], 2.2], pila(-30, 38, 128, 0, 0.24, 0), ['tubo', [-28, 2, 30], [28, 2, 30], 2.2, 'hierroS']);
      else fijo.push(['tubo', [0, 2, -40], [0, YV, -40], 3.2], ['tubo', [0, YV, -40], [0, YV, H[2]], 2.8], pila(-30, -46, 128, 0, 0.24, 0));
      return { en: en, mano: mano, fijo: fijo, mec: [brazo(1), brazo(-1)] };
    }
    /* el contractor de pecho: los brazos, paralelos al suelo; agarra las asas; junta los brazos delante del pecho hasta que las asas casi
       se tocan y vuelve despacio */
    COREO['contractor-pecho'] = (function () {
      var base = sentado(55, 8, { cab: [5, 0, 0], p: PIES_S }), H = resolver(base).i.hom, C = contractor(H, 57, 94, false);
      var con = function (fi) { return conAgarre(sobre(base, { m: C.mano(fi) }), C.en(fi), [0.2, -1, -0.4]); };
      return {
        vista: [[34, 14], [84, 10]], rastro: 'manos', esfuerzo: [0], clavos: M2B, clavosEn: { a0: NADA }, reposo: ['a0'],
        material: [['maquina', { reposo: true, fijo: silla(55, 8, { pies: [-40, 30] }).concat(C.fijo), mec: C.mec }]],
        posturas: { a0: enSusMuslos(base), a: con(94), b: con(-14.2) }, inicio: 'a', encuadra: ['a0', 'a'],
        rep: [['b', 1.4, 'empuje'], ['b', 0.4], ['a', 1.9, 'freno'], ['a', 0.3]],
        pasos: ['a0', { sec: [['a', 1.4, 'suave', NADA]], desde: 'a0' }, 'rep']
      };
    })();
    /* el contractor inverso: sentado de cara a la máquina; agarra las asas con los brazos estirados por delante, a la altura de los
       hombros; lleva los brazos hacia atrás abriéndolos, sin bajar las manos de esa altura, y vuelve despacio */
    COREO['contractor-inverso'] = (function () {
      var base = sentado(55, 0, { p: { suelo: [17, 44], abre: 10, polo: [0.3, 1, 0.3] } }), H = resolver(base).i.hom, C = contractor(H, 58.2, -11, true);
      var con = function (fi, hom) { return conAgarre(sobre(base, { m: C.mano(fi), hom: hom || [0, 0] }), C.en(fi), [0.2, -0.5, -1]); };
      return {
        vista: [[124, 14], [70, 10]], rastro: 'manos', esfuerzo: [0], clavos: M2B.concat(T2), clavosEn: { a0: T2 }, reposo: ['a0'],
        material: [['maquina', { reposo: true, fijo: silla(55, 0, { respaldo: -1, asiento: [38, 0], pies: [-24, 30] }).concat(C.fijo), mec: C.mec }]],
        posturas: { a0: enSusMuslos(base), a: con(-11), b: con(100, [0, -2.5]) }, inicio: 'a', encuadra: ['a0', 'b'],
        rep: [['b', 1.4, 'empuje'], ['b', 0.4], ['a', 1.9, 'freno'], ['a', 0.3]],
        pasos: ['a0', { sec: [['a', 1.4, 'suave', T2]], desde: 'a0' }, 'rep']
      };
    })();
    /* las elevaciones laterales: las almohadillas, por fuera de los brazos, justo por encima de los codos; con los codos doblados, empuja
       hacia fuera con ellos hasta la altura de los hombros; y baja despacio, sin encoger los hombros. Cada palanca gira sobre su hombro */
    COREO['elevaciones-laterales-maquina'] = (function () {
      var base = sentado(55, 5, { cab: [3, 0, 0], p: PIES_S }), H = resolver(base).i.hom, E0 = 14, E1 = 84;
      var br = function (e) { return [Math.sin(e * RAD), -Math.cos(e * RAD), 0]; }, fu = function (e) { return [Math.cos(e * RAD), Math.sin(e * RAD), 0]; };
      var cuerpo = function (e) {
        var C = mas(H, por(br(e), D.brazo));
        return sobre(base, { b: { a: mas(C, [0, 0, D.antebrazo]), polo: br(e) }, m: { tipo: 'puno', barra: br(e), palma: por(fu(e), -1) } });
      };
      var palancaL = function (s) {
        var m = function (v) { return [s * v[0], v[1], v[2]]; }, C = mas(H, por(br(E0), D.brazo)), pad = mas(H, mas(por(br(E0), 20.5), por(fu(E0), 7))), g = mas(C, [0, 0, D.antebrazo + D.mano]), ag = {};
        ag[s > 0 ? 'i' : 'd'] = m(g);
        return { gira: [m(H), [0, 0, 1]], ref: m(C), sigue: s > 0 ? 'codo-i' : 'codo-d', lim: [-100, 100],
          piezas: [['cojin', m(pad), [13, 5, 15], m(br(E0)), m(por(fu(E0), -1)), 3, 'centro'], ['tubo', m([H[0], H[1], H[2] - 16]), m([pad[0] + 3, pad[1], H[2] - 16]), 2.2], ['tubo', m([pad[0] + 3, pad[1], H[2] - 16]), m([pad[0] + 3, pad[1], pad[2]]), 2.2],
            ['tubo', m([pad[0] + 3, pad[1], pad[2]]), m(mas(g, por(br(E0), 8))), 1.6], ['asa', m(mas(g, por(br(E0), -7))), m(mas(g, por(br(E0), 8)))]], agarres: ag };
      };
      return {
        vista: [[24, 12], [76, 10]], rastro: 'codos', esfuerzo: [0], clavos: M2B,
        material: [['maquina', { fijo: silla(55, 5, { pies: [-40, 30] }).concat([['tubo', [-H[0] - 2, H[1], H[2] - 16], [H[0] + 2, H[1], H[2] - 16], 2.8], ['tubo', [0, 2, -40], [0, H[1], -40], 3], ['tubo', [0, H[1], -40], [0, H[1], H[2] - 16], 2.6], pila(-30, -48, 128, 0, 0.3, 0)]), mec: [palancaL(1), palancaL(-1)] }]],
        posturas: { a: cuerpo(E0), b: cuerpo(E1) }, inicio: 'a', encuadra: ['b'],
        rep: [['b', 1.3, 'empuje'], ['b', 0.4], ['a', 1.8, 'freno'], ['a', 0.3]],
        pasos: ['a', 'rep', 'rep']
      };
    })();
    /* el curl en máquina: como en el banco predicador (bloque 6): sentado, con el tronco algo inclinado y el pecho contra el cojín; los
       brazos bajan por su cara inclinada y el codo, que descansa en él, queda en línea con el eje de la máquina; agarra las asas con las
       muñecas rectas; dobla los codos hasta el final del recorrido, una pausa, y baja despacio sin llegar a bloquearlos */
    COREO['curl-maquina'] = (function () {
      var ANG = 45, sn = Math.sin(ANG * RAD), cs = Math.cos(ANG * RAD), FUERA = [0, cs, sn];
      var P = { pel: [0, 61, 0], giro: [0, 20, 0], cab: [-14, 0, 0], p: { suelo: [17, 24], abre: 14, polo: [0.3, 0.2, 1] }, hom: [-1, -1.5] }, h = resolver(P).i.hom;
      var T = [0, h[1] - 4.4 * cs - 14.3 * sn, h[2] - 4.4 * sn + 14.3 * cs], EN = T[2] - 3, C = mas(h, por(unidad([0.05, -sn, cs]), D.brazo));
      var en = function (fi, mano) { return sobre(P, { b: flexion(P, C, fi, FUERA), m: mano || { tipo: 'puno', barra: [1, 0, 0], palma: [0, 1, 0.2] } }); };
      var a = en(14), g = resolver(a).i.agarre, eje = [C[1], C[2]], XB = 33;
      var pal = palanca(0, eje, g, { asa: 'x', xb: XB, lim: [-125, 20] });
      pal.piezas.push(['tubo', [-XB, g[1], g[2]], [XB, g[1], g[2]], 1.5, 'cromo']);
      return {
        vista: [[-58, 12], [-104, 10]], rastro: 'manos', esfuerzo: [0, 1], clavos: ['mi@1:1', 'md@1:-1', 'ti', 'td'], clavosEn: { a0: T2 }, reposo: ['a0'],
        material: [['predicador', { en: [0, EN], alto: T[1], ang: ANG, largo: 32, asiento: [EN + 8, 50] }], ['maquina', { reposo: true,
          fijo: [['tubo', [-XB, 2, C[2] + 12], [-XB, C[1], C[2]], 2.6], ['tubo', [XB, 2, C[2] + 12], [XB, C[1], C[2]], 2.6], ['tubo', [-XB - 2, 2, C[2] + 12], [XB + 2, 2, C[2] + 12], 2.2, 'hierroS'], ['disco', [-XB - 1.5, C[1], C[2]], [1, 0, 0], 6, 3, M_COL.hierroL], ['disco', [XB + 1.5, C[1], C[2]], [1, 0, 0], 6, 3, M_COL.hierroL], pila(46, C[2] + 26, 118, 0, 0.3, 0)],
          mec: [pal] }]],
        posturas: { a0: en(14, { tipo: 'abierta', prono: -90 }), a: a, b: en(110) }, inicio: 'a', encuadra: ['b'],
        rep: [['b', 1.3, 'empuje'], ['b', 0.6], ['a', 2.0, 'freno'], ['a', 0.4]],
        pasos: ['a0', { sec: [['a', 0.9, 'suave', T2]], desde: 'a0' }, 'rep', 'rep']
      };
    })();

    /* ══════════════════════════════ LAS DOMINADAS ASISTIDAS ══════════════════════════════
       La torre, delante; las asas, arriba; y la plataforma, que sube con él. Elige el contrapeso (la torre de placas, a su derecha), se
       sube a la plataforma y agarra las asas; tira hasta llevar la barbilla a la altura de las asas (la plataforma lo acompaña) y baja.
       Arriba va como en las dominadas del bloque 1 y un poco más: el tronco se echa atrás (−9°, la cadera 13 cm por detrás de las asas) y la cabeza
       pasa por detrás de la barra; a plomo, la barra le cruzaba la cara. Y la viga de arriba acaba 14 cm por delante de las asas y
       baja a ellas en diagonal: recta hasta su centro, quedaba delante de los ojos */
    function asistidas(G, mano, mas_, poloB) {
      var PL = 30, YB = 220, ZS = -40, ZP = -4, T = ['mi@0:' + G, 'md@0:' + (-G)];
      var ZA = -6, yA = YB - Math.sqrt(58.3 * 58.3 - (G - D.hombroX) * (G - D.hombroX) - ZA * ZA) - 3.5 - 43.5, yB = YB - 52.5 + (mas_ || 0), sube = yB - yA, H0 = yA - PIE + 0.15;
      var enPlat = function (alto) { return { suelo: [10, ZP], abre: 5, alto: alto }; };
      var p = estirado({ pel: [0, PIE - 3, ZS - 6], giro: [0, 16, 0], cab: [-6, 12, 0], p: { suelo: [10, ZS], abre: 5 }, bi: aLosLados(8), mi: SUELTA, md: { tipo: 'indice', prono: 60 } }, [-38, 97, -10], 'bd', 1.5, [-1, -0.4, -0.3]);
      var suelto = { b: aLosLados(8), m: SUELTA };
      var s1 = sobre(suelto, { pel: [0, PIE + 2, ZS + 9], giro: [0, 9, 0], pi: enPlat(H0), pd: { suelo: [-10, ZS], abre: 5 } }), s2 = sobre(suelto, { pel: [0, H0 + PIE, ZP + 2], p: enPlat(H0) });
      var a = { pel: [0, yA, ZA], hom: [3.5, 0], p: enPlat(H0), b: { a: [G, YB - 8, 0], polo: [1, -0.2, 0.5] }, m: mano };
      var b = { pel: [0, yB, -13], giro: [0, -9, 0], hom: [-2, -1.5], col: [-3, 0, 0], cab: [6, 0, 0], p: enPlat(H0 + sube + 0.45), b: { a: [G, YB - 8, 0], polo: poloB }, m: mano };
      var fijo = [['tubo', [0, 2, 60], [0, YB + 14, 60], 3.6], ['tubo', [0, YB + 14, 60], [0, YB + 14, 14], 3], ['tubo', [0, YB + 14, 14], [0, YB + 1.5, 1.5], 2.2], ['tubo', [0, 2.2, -24], [0, 2.2, 78], 2.8, 'hierroS'], ['tubo', [-30, 2, 78], [30, 2, 78], 2.2, 'hierroS'], ['tubo', [-30, 2, -24], [30, 2, -24], 2.2, 'hierroS'],
        ['pila', [-42, 2, 4], 124, { mec: 1, gana: 0.5, cero: 0, eje: 'z' }]];
      return {
        T: T, p: p, s1: s1, s2: s2, a: a, b: b,
        material: [['maquina', { fijo: fijo, mec: [{ corre: [0, 1, 0], barra: [[0, YB, 0], [1, 0, 0]], piezas: [['tubo', [-40, YB, 0], [40, YB, 0], 1.7, 'cromo', 2.2]] },
          { corre: [0, 1, 0], ref: [0, H0 + D.tobillo, ZP], sigue: 'tobillos', max: -1, lim: [0, 70], piezas: [['placa', [0, H0 - 2, ZP + 4], [48, 4, 38], null, null, -12], ['tubo', [0, 2, ZP + 4], [0, H0 - 4, ZP + 4], 3.4, 'cromoS', -14, 'A']] }] }]]
      };
    }
    COREO['dominadas-asistidas-maquina'] = (function () {
      var M = asistidas(30, EN_BARRA, 0, [1, -1, 0.1]), K = M.T.concat(T2);
      return {
        vista: [[72, 8], [118, 10]], rastro: 'barbilla', esfuerzo: [0], clavos: K, clavosEn: { p: T2, s1: T2, s2: T2 }, zoom: 0.94, material: M.material,
        posturas: { p: M.p, s1: M.s1, s2: M.s2, a: M.a, b: M.b }, inicio: 'a', encuadra: ['p', 'b'],
        rep: [['b', 1.5, 'empuje'], ['b', 0.5], ['a', 2.0, 'freno'], ['a', 0.3]],
        pasos: ['p', { sec: [['s1', 0.8, 'suave', ['td']], ['s2', 1.0, 'empuje', ['ti']], ['a', 1.3, 'suave', T2]], desde: 'p' }, 'rep']
      };
    })();
    /* con las palmas mirando hacia él: tira hasta pasar la barbilla por encima de las asas y baja con control hasta estirar los brazos */
    COREO['dominadas-supinas-asistidas-maquina'] = (function () {
      var M = asistidas(18, EN_BARRA_SUP, 4, [0.25, -1, 0.9]), K = M.T.concat(T2);
      return {
        vista: [[72, 8], [118, 10]], rastro: 'barbilla', esfuerzo: [0], clavos: K, clavosEn: { p: T2, s1: T2, s2: T2 }, zoom: 0.94, material: M.material,
        posturas: { p: M.p, s1: M.s1, s2: M.s2, a: M.a, b: M.b }, inicio: 'a', encuadra: ['p', 'b'],
        rep: [['b', 1.5, 'empuje'], ['b', 0.5], ['a', 2.0, 'freno'], ['a', 0.3]],
        pasos: [{ sec: [['p', 1.5, null, T2], ['s1', 0.8, 'suave', ['td']], ['s2', 1.0, 'empuje', ['ti']]], desde: 'p' }, { sec: [['a', 1.3, 'suave', T2]], desde: 's2' }, 'rep']
      };
    })();

    /* ══════════════════════════════ EL MULTIPOWER ══════════════════════════════
       La barra corre por dos guías a plomo: solo sube y baja. multipower(z, y0, o): las guías, en el plano z; la barra espera en sus
       ganchos a y0. o.sigue: con qué va la barra (las manos; o un punto de la espalda, en la sentadilla); o.lim: cuánto baja y sube */
    function multipower(z, y0, o) {
      o = o || {};
      var W = 62, H = 222, fijo = [['tubo', [-W - 7, H, z - 9], [W + 7, H, z - 9], 3]], barra = [['tubo', [-98, y0, z], [98, y0, z], 1.5, 'cromo', 2.2]];
      [1, -1].forEach(function (s) {
        fijo.push(['tubo', [s * W, 3, z], [s * W, H - 3, z], 1.3, 'cromoS', -4], ['tubo', [s * (W + 7), 2, z - 9], [s * (W + 7), H, z - 9], 3.2], ['tubo', [s * (W + 7), 2.2, z - 58], [s * (W + 7), 2.2, z + 44], 2.6, 'hierroS'],
          ['tubo', [s * (W + 7), 2.2, z - 56], [s * (W + 7), 116, z - 10], 2.2], ['tubo', [s * W, 3, z], [s * (W + 7), 3, z - 9], 1.6], ['tubo', [s * W, H - 3, z], [s * (W + 7), H - 3, z - 9], 1.6]);
        barra.push(['tubo', [s * 70, y0, z], [s * 98, y0, z], 2.4, 'cromoS', 2.3], ['tubo', [s * W, y0 - 5, z], [s * W, y0 + 5, z], 2.9, 'hierroL', 1], ['disco', [s * 78, y0, z], [1, 0, 0], 17, 4.4, null, 0], ['disco', [s * 83.4, y0, z], [1, 0, 0], 13, 3.4, '#c9413f', s * 0.6]);
      });
      return ['maquina', { reposo: true, fijo: fijo, mec: [{ corre: [0, 1, 0], barra: [[0, y0, z], [1, 0, 0]], ref: [0, y0, z], sigue: o.sigue || 'manos', lim: o.lim || [-90, 90], quieto: o.sigue ? null : 0, piezas: barra }],
        encuadre: [[-W - 12, 0, z - 58], [W + 12, 0, z + 44], [W + 9, o.alto || H, z - 9], [-W - 9, o.alto || H, z - 9], [100, y0, z], [-100, y0, z]] }];
    }
    function enBarraM(G) { return ['mi@0:' + G, 'md@0:' + (-G)]; }

    /* la sentadilla: la barra, a la altura de los hombros, sobre la parte alta de la espalda; separa los pies algo más que los hombros,
       con rodillas y puntas un poco hacia fuera; baja despacio doblando rodillas y cadera, como si fuera a sentarse; una pausa abajo, y sube */
    COREO['sentadilla-multipower'] = (function () {
      var G = 36, EN = [0, 23, -9.5], mb = { b: { a: [G, 16.5, -5], en: 'torax', polo: [0.7, -1, -0.5] }, m: { tipo: 'puno', barra: [1, 0, 0], palma: [0, 0.3, 1] } };
      var juntos = { suelo: [11, 0], abre: 6 }, abiertos = { suelo: [22, 0], abre: 14, polo: [0.32, 0.1, 1] };
      var zDe = function (P) { var E = resolver(P); return mas(E.tor, aplicar(E.Bt, EN)); }, ZR = -9.5;
      var sop = sobre(mb, { pel: [0, 82, 0], p: juntos }), arr = sobre(mb, { pel: [0, PIE, 0], hom: [0, -1.5], p: juntos });
      var p1 = sobre(arr, { pi: abiertos }), a = sobre(arr, { p: abiertos });
      var bajo = function (z) { return sobre(mb, { pel: [0, 40, z], giro: [0, 40, 0], hom: [0, -1.5], col: [3, 0, 0], cab: [-34, 0, 0], p: abiertos }); };
      var b = bajo(busca(function (z) { return zDe(bajo(z))[2]; }, ZR, -60, 10)), K = enBarraM(G);
      return {
        vista: [[46, 12], [124, 10]], rastro: 'pel', esfuerzo: [2], clavos: K.concat(T2),
        material: [multipower(ZR, zDe(sop)[1], { sigue: { en: 'torax', a: EN }, lim: [-70, 20] })],
        posturas: { sop: sop, arr: arr, p1: p1, a: a, b: b }, inicio: 'a', encuadra: ['sop', 'b'],
        rep: bajaSube('b', 'a', [1.9, 0.6, 1.5, 0.4]),
        pasos: ['sop', { sec: [['arr', 0.9, 'suave'], ['p1', 0.7, 'suave', K.concat(['td'])], ['a', 0.7, 'suave', K.concat(['ti'])]], desde: 'sop' }, 'rep', 'rep']
      };
    })();
    /* los press tumbado: el banco, dentro del multipower; la barra baja a plomo sobre el pecho. o: { ang (el banco), G (las manos), z (el
       plano de las guías), abajo y arriba (a qué altura queda la barra), codo } */
    function pressMultipower(o) {
      var P = tumbadoEn(o.ang, { m: EN_BARRA }), K = enBarraM(o.G), y0 = o.arriba - 7;
      var con = function (y, codo) { return conAgarre(sobre(P, { hom: o.hom || [0, 0] }), [o.G, y, o.z], codo || o.codo || [1, -1, 0.2]); };
      return {
        K: K,
        s0: sobre(P, { b: { a: [15, 12, 11.5], en: 'pelvis', polo: [1, -0.4, -0.5] }, m: { tipo: 'abierta', prono: 90 } }), s: con(y0, o.codoS || [1, -0.5, 0.4]), a: con(o.arriba, o.codoS || [1, -0.5, 0.4]), b: con(o.abajo),
        material: [multipower(o.z, y0, { lim: [o.abajo - y0 - 3, 12], alto: o.alto || 152 }), bancoDe(o.ang)]
      };
    }
    /* el press de banca: el banco, de modo que la barra quede sobre la mitad del pecho; tumbado, la agarra a la anchura de los hombros y
       la desengancha; la baja despacio hasta el pecho y estira los brazos */
    COREO['press-banca-multipower'] = (function () {
      var M = pressMultipower({ ang: 0, G: 22, z: -4, abajo: 70.5, arriba: 112.7 });
      return {
        vista: [[30, 32], [148, 26]], rastro: 'manos', esfuerzo: [2], clavos: M.K.concat(T2), clavosEn: { s0: T2 }, reposo: ['s0'], material: M.material,
        posturas: { s0: M.s0, s: M.s, a: M.a, b: M.b }, inicio: 'a', encuadra: ['s0'],
        rep: bajaSube('b', 'a', [1.8, 0.25, 1.1, 0.5]),
        pasos: ['s0', { sec: [['s', 1.3, 'suave', T2], ['s', 0.3], ['a', 0.8, 'suave']], desde: 's0' }, 'rep']
      };
    })();
    /* el inclinado: el banco, a unos 45 grados, de forma que la barra baje hacia la parte alta del pecho; la agarra a la anchura de los
       hombros, la desengancha y mantiene las escápulas juntas contra el banco; la baja despacio, sin rebotar, y la empuja */
    COREO['press-inclinado-multipower'] = (function () {
      var M = pressMultipower({ ang: 45, G: 22, z: 10.5, abajo: 93.5, arriba: 141, alto: 178, hom: [0, -2.5], codo: [0.8, -1, 0.1] });
      return {
        vista: [[34, 20], [146, 22]], rastro: 'manos', esfuerzo: [2], clavos: M.K.concat(T2), clavosEn: { s0: T2 }, reposo: ['s0'], material: M.material,
        posturas: { s0: M.s0, s: M.s, a: M.a, b: M.b }, inicio: 'a', encuadra: ['s0'],
        rep: bajaSube('b', 'a', [1.8, 0.25, 1.1, 0.5]),
        pasos: ['s0', { sec: [['s', 1.3, 'suave', T2], ['s', 0.3], ['a', 0.8, 'suave']], desde: 's0' }, 'rep']
      };
    })();
    /* con agarre cerrado: las manos, a la anchura de los hombros; la desengancha y la baja hacia el pecho con los codos pegados al
       cuerpo; para justo antes de que lo toque y empuja hasta estirar los brazos */
    COREO['press-cerrado-multipower'] = (function () {
      var M = pressMultipower({ ang: 0, G: 19, z: 1, abajo: 71.5, arriba: 112, codo: [0.25, -1, 0.5], codoS: [0.5, -0.6, 0.6] });
      return {
        vista: [[30, 32], [148, 26]], rastro: 'manos', esfuerzo: [0], clavos: M.K.concat(T2), material: M.material,
        posturas: { s: M.s, a: M.a, b: M.b }, inicio: 'b', encuadra: ['s'],
        rep: [['a', 1.2, 'empuje'], ['a', 0.4], ['b', 1.9, 'freno'], ['b', 0.35]],
        pasos: ['s', { sec: [['a', 0.8, 'suave'], ['a', 0.3], ['b', 1.9, 'freno']], desde: 's' }, 'rep']
      };
    })();
    /* el press de hombros: un banco con el respaldo casi vertical; agarra la barra a la anchura de los hombros, la desengancha y la baja
       por delante hasta la altura del pecho; la empuja hacia arriba sin llegar a bloquear los codos y la baja despacio */
    COREO['press-hombros-multipower'] = (function () {
      var G = 24, base = sentadoEnRespaldo(80, { cab: [6, 0, 0], m: EN_BARRA }), h = resolver(base).i.hom, Z = h[2] + 17.5, K = enBarraM(G);
      var con = function (y, codo) { return conAgarre(base, [G, y, Z], codo); }, yS = h[1] + 47, yA = h[1] + 55, yB = h[1] - 5.5;
      return {
        vista: [[38, 10], [128, 10]], rastro: 'manos', esfuerzo: [0], clavos: K.concat(T2), clavosEn: { s0: T2 }, reposo: ['s0'],
        material: [multipower(Z, yS, { lim: [yB - yS - 3, 12] }), silla5(80)],
        posturas: { s0: enSusMuslos(sobre(base, { m: SUELTA })), s: con(yS, [1, -0.3, 0.5]), a: con(yA, [1, -0.3, 0.5]), b: con(yB, [0.55, -1, 0.35]) }, inicio: 'b', encuadra: ['s0', 'a'],
        rep: [['a', 1.3, 'empuje'], ['a', 0.4], ['b', 1.8, 'freno'], ['b', 0.3]],
        pasos: ['s0', { sec: [['s', 1.3, 'suave', T2], ['s', 0.3], ['b', 1.9, 'freno']], desde: 's0' }, 'rep']
      };
    })();
    /* el remo para el deltoides posterior: la barra, en su posición más baja; de pie, con las rodillas algo flexionadas; inclina el
       tronco con la espalda recta hasta dejar el pecho paralelo al suelo y la agarra algo más abierta que los hombros; la sube hacia la
       parte baja del pecho doblando y elevando los codos, la mantiene un momento y la baja */
    COREO['remo-deltoides-posterior-multipower'] = (function () {
      var G = 30, pies = { suelo: [11, 0], abre: 7 }, MAN = { tipo: 'puno', barra: [1, 0, 0], palma: [0, -0.3, -1] }, K = enBarraM(G);
      var inc = { pel: [0, 82, -21], giro: [0, 85, 0], cab: [-32, 0, 0], p: pies, m: MAN }, E = resolver(inc), h = E.i.hom, pecho = mas(E.tor, aplicar(E.Bt, [0, 4, 12])), Z = Math.round(pecho[2] * 2) / 2;
      var yA = h[1] - Math.sqrt(58.5 * 58.5 - (G - h[0]) * (G - h[0]) - (Z - h[2]) * (Z - h[2]));
      var a0 = { pel: [0, PIE - 2, -3], p: pies, b: aLosLados(8), m: SUELTA }, a = conAgarre(inc, [G, yA, Z], [1, 0.2, -0.2]), b = conAgarre(sobre(inc, { hom: [-0.5, -3] }), [G, pecho[1] - 3, Z], [1, 0.75, -0.1]);
      return {
        vista: [[-40, 12], [-128, 14]], rastro: 'codos', esfuerzo: [0, 1], clavos: K.concat(T2), clavosEn: { a0: T2 }, reposo: ['a0'],
        material: [multipower(Z, yA, { lim: [-3, pecho[1] - yA + 6] })],
        posturas: { a0: a0, a: a, b: b }, inicio: 'a', encuadra: ['a0'],
        rep: [['b', 1.2, 'empuje'], ['b', 0.7], ['a', 1.7, 'freno'], ['a', 0.3]],
        pasos: ['a0', { sec: [['a', 1.6, 'suave', T2]], desde: 'a0' }, 'rep']
      };
    })();
  })();
    return {"extension-cuadriceps-maquina": "ca46b39c8e0f", "curl-femoral-sentado": "8b6d6b9bd9cf", "abduccion-cadera-maquina": "8981e6f2411e", "aduccion-cadera-maquina": "5f144176b154", "prensa-piernas": "a02be2686167", "prensa-piernas-pies-juntos": "9abc8583ef35", "prensa-piernas-una-pierna": "36ff13f34ce4", "elevacion-talones-prensa": "2fc488f745ab", "sentadilla-hack-maquina": "9ea3fd6e7ea8", "elevacion-talones-hack": "dced72c55999", "sentadilla-cinturon": "1105d7d64c51", "curl-femoral-tumbado": "ee2640f6a755", "curl-femoral-tumbado-una-pierna": "9971bc145c4f", "curl-femoral-de-pie-maquina": "033e2eec8fa7", "elevacion-gluteo-isquio": "00a736bcbe95", "elevacion-talones-maquina-de-pie": "84d32e48e4bf", "elevacion-talones-sentado-maquina": "95f5f206e012", "crunch-maquina": "4cea7544fd2f", "elevacion-piernas-silla-romana": "13ffcbe2c45a", "hip-thrust-maquina": "68f35b80a42a", "press-pecho-maquina": "6142cb64ebe3", "press-inclinado-maquina": "6f215a9ac86a", "press-declinado-maquina": "270ea8503358", "press-hombros-maquina": "6a91df3ba822", "fondos-maquina": "ecae1c3a73f3", "remo-maquina-sentado": "7ac4ef3067e0", "remo-maquina-una-mano": "e4a762d06db0", "remo-alto-maquina": "096bd72cda56", "remo-alto-maquina-una-mano": "c0ff59521109", "contractor-pecho": "9ea5299a37ad", "contractor-inverso": "824ad4745bd3", "elevaciones-laterales-maquina": "15ef441cddd2", "curl-maquina": "1ce26b2b131a", "dominadas-asistidas-maquina": "616fab700604", "dominadas-supinas-asistidas-maquina": "8e6faab53d3c", "sentadilla-multipower": "1b3a54e4bf6c", "press-banca-multipower": "417bc3a03bc3", "press-inclinado-multipower": "f29f5215c0e7", "press-cerrado-multipower": "3b87d50fbfa6", "press-hombros-multipower": "27985d735e16", "remo-deltoides-posterior-multipower": "a535b9a15ada"};
  });
})();
