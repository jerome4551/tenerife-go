/* modulos/entrenador/banda.<huella>.js — Jérôme, el entrenador: las coreografías de «banda» (38 ejercicios).
   Lo pide modulos/entrenador.js al abrir la ficha de uno de ellos (TG_ENTRENADOR.pedir); solo, no hace nada.
   <huella> son los 8 primeros caracteres del sha256 de este fichero: si cambia una coma, cambia el nombre, y cada
   motor pide los suyos. Recibe del motor lo que usa de él (N) y le devuelve las huellas de los pasos de sus fichas.

   NO EDITAR A MANO: lo hace tools/entrenador/construir.py con tools/entrenador/src/7c-banda.js. */
(function () {
  'use strict';
  var T = window.TG_ENTRENADOR;
  if (!T || typeof T._trozo !== 'function') return;
  T._trozo('banda', function (N) {
    var ALTO_MUN = N.ALTO_MUN, COLGADO = N.COLGADO, COREO = N.COREO, D = N.D, EN_SUELO = N.EN_SUELO, HOMBRO = N.HOMBRO, PIE = N.PIE, PRONO = N.PRONO,
        PUNO = N.PUNO, RAD = N.RAD, SUELTA = N.SUELTA, V = N.V, aLosLados = N.aLosLados, abre = N.abre, aplicar = N.aplicar, arco = N.arco,
        aro = N.aro, bajaSube = N.bajaSube, busca = N.busca, colgando = N.colgando, conAgarre = N.conAgarre, cuelga = N.cuelga, el = N.el,
        entre = N.entre, estirado = N.estirado, flexion = N.flexion, giroY = N.giroY, inclinado = N.inclinado, largo = N.largo, lejos = N.lejos,
        mas = N.mas, menos = N.menos, n1 = N.n1, n2 = N.n2, plano = N.plano, por = N.por, punto = N.punto, quieto = N.quieto, refleja = N.refleja,
        resolver = N.resolver, signo = N.signo, sobre = N.sobre, subeBaja = N.subeBaja, troncoAPlano = N.troncoAPlano, une = N.une,
        unidad = N.unidad, zapaAPlano = N.zapaAPlano;
  /* ───────────────────────── las coreografías: CON BANDA ELÁSTICA (bloque 13) ─────────────────────────
     Las mismas reglas que en 70-coreografias.js: cada una sale de los pasos verificados de su ficha y no añade técnica
     que la ficha no diga. Son de todos los grupos, y lo que tienen en común es la banda (50-material.js, «banda»): pisada,
     atada a un poste, en las manos o rodeando las piernas. Van por cómo se lleva la banda: de pie, pisándola; atada a un
     poste; de rodillas; en el suelo; colgado de la barra; entre las manos; y con el antebrazo en el banco.
     Donde el movimiento es el de un ejercicio de otro bloque (con mancuernas, en polea o sin peso), las posturas son las
     de aquel, vueltas a escribir aquí con sus números: cada trozo lleva lo suyo. */
  (function () {
    var T2 = ['ti', 'td'], NADA = [], K4 = ['mi', 'md', 'ti', 'td'];
    var SUP = { tipo: 'puno', prono: -90 }, NEU = { tipo: 'puno', prono: 0 };

    /* ══════════════════════════════ DE PIE, PISANDO LA BANDA ══════════════════════════════
       La banda sale de debajo de la zapatilla por el canto que mira a la mano. EN_HOMBROS: los puños, ante los hombros, con un
       extremo cada uno y los codos abajo */
    var EN_HOMBROS = { a: [17.5, 15, 10], en: 'torax', polo: [0.8, -1, 0.2] };

    /* la sentadilla: pisa la banda con los pies a la anchura de los hombros; sube los extremos a los hombros; baja hasta que los
       muslos quedan paralelos al suelo y vuelve despacio. Es la sentadilla del bloque 1, con los puños en los hombros. La banda
       pasa por fuera de las rodillas: en línea recta del pie al hombro, abajo atravesaría el muslo */
    COREO['sentadilla-con-banda'] = (function () {
      var pies = { suelo: [14, 0], abre: 14, polo: [0.32, 0.1, 1] };
      var a = { p: pies, b: aLosLados(8), m: NEU }, h = { p: pies, b: EN_HOMBROS, m: NEU };
      var b = { pel: [0, 47, -25], giro: [0, 40, 0], col: [3, 0, 0], cab: [-34, 0, 0], p: pies, b: EN_HOMBROS, m: NEU };
      return {
        vista: [[42, 8], [90, 6]], rastro: 'pel', esfuerzo: [2], clavos: T2,
        material: [['banda', { tiras: [
          { de: 'pie-i', por: [{ de: 'i', p: 'rod', mas: [7.5, 0, 0] }], a: 'mano-i', asas: 'a' },
          { de: 'pie-d', por: [{ de: 'd', p: 'rod', mas: [-7.5, 0, 0] }], a: 'mano-d', asas: 'a' },
          { de: 'pie-i', a: 'pie-d' }] }]],
        posturas: { a: a, h: h, b: b }, inicio: 'h', encuadra: ['a', 'b'],
        rep: bajaSube('b', 'h'),
        pasos: ['a', { sec: [['h', 1.3, 'suave']], desde: 'a' }, 'rep']
      };
    })();

    /* la elevación de talones: pisa el centro de la banda con la parte delantera de los pies y lleva los extremos a la altura de
       los hombros; sube de puntillas con las manos junto a los hombros; una breve pausa, y baja los talones hasta el suelo */
    COREO['elevacion-talones-banda'] = (function () {
      var p = { suelo: [17, 0], abre: 4 };
      var s = { p: p, b: aLosLados(8), m: NEU }, a = { p: p, b: EN_HOMBROS, m: NEU };
      var b = { pel: [0, PIE + 6, 8], p: { suelo: [17, 0], abre: 4, talon: 42 }, b: EN_HOMBROS, m: NEU };
      return {
        vista: [[90, 6], [36, 8]], rastro: 'tli', esfuerzo: [0, 1], clavos: T2,
        material: [['banda', { tiras: [{ de: 'bola-i', a: 'mano-i' }, { de: 'bola-d', a: 'mano-d' }, { de: 'bola-i', a: 'bola-d' }] }]],
        posturas: { s: s, a: a, b: b }, inicio: 'a', encuadra: ['s', 'b'],
        rep: [['b', 1.5, 'suave'], ['b', 0.5], ['a', 1.6, 'freno'], ['a', 0.4]],
        pasos: [{ sec: [['s', 0.7], ['a', 1.2, 'suave']], desde: 's' }, { sec: [['b', 1.5, 'suave']], desde: 'a' }, { rep: 1.5 }]
      };
    })();

    /* el curl de bíceps: pisa el centro de la banda con un pie (el izquierdo, algo adelantado) y coge un asa en cada mano, con las
       palmas hacia arriba; con los codos pegados a los costados, dobla los brazos y lleva las manos hacia los hombros; y las baja
       despacio. La banda sale por los dos cantos de la zapatilla: a la mano de su lado y, cruzando por delante de la otra pierna, a la otra */
    COREO['curl-banda'] = (function () {
      var pies = { pi: { suelo: [10, 9], abre: 5 }, pd: { suelo: [-10, -6], abre: 6 } };
      var a = une(pies, { b: aLosLados(4), m: SUP }), b = une(pies, { b: aLosLados(140), m: SUP });
      return {
        vista: [[48, 6], [0, 6]], rastro: 'mi', esfuerzo: [0], clavos: T2,
        material: [['banda', { tiras: [{ de: 'mano-i', por: ['pie-i'], a: 'mano-d', asas: true }] }]],
        posturas: { a: a, b: b }, inicio: 'a',
        rep: subeBaja('b', 'a'),
        pasos: ['a', { sec: [['b', 1.2, 'empuje']], desde: 'a' }, { rep: 1.2 }]
      };
    })();

    /* el curl alterno: de pie sobre el centro de la banda, con los pies a la anchura de las caderas y un asa en cada mano, con las
       palmas hacia delante; sube un asa hacia el hombro mientras baja la otra: los brazos se mueven en sentidos opuestos */
    var PISADA2 = ['banda', { tiras: [{ de: 'pie-i', a: 'mano-i', asas: 'a' }, { de: 'pie-d', a: 'mano-d', asas: 'a' }, { de: 'pie-i', a: 'pie-d' }] }];
    COREO['curl-banda-alterno'] = (function () {
      var pies = { suelo: [10, 0], abre: 6 }, abajo = aLosLados(4), arriba = aLosLados(140);
      var a = { p: pies, b: abajo, m: SUP }, i = { p: pies, bi: arriba, bd: abajo, m: SUP }, d = { p: pies, bi: abajo, bd: arriba, m: SUP };
      return {
        vista: [[44, 6], [0, 6]], rastro: 'mi', esfuerzo: [0, 2], clavos: T2, material: [PISADA2],
        posturas: { a: a, i: i, d: d }, inicio: 'i',
        rep: [['d', 1.3, 'suave'], ['d', 0.25], ['i', 1.3, 'suave'], ['i', 0.25]],
        pasos: ['a', { sec: [['i', 1.2, 'empuje'], ['i', 0.25], ['d', 1.3, 'suave']], desde: 'a' }, { rep: 1.55 }]
      };
    })();

    /* el curl cruzado: de pie sobre el centro de la banda, con un asa en cada mano y las palmas mirando hacia el cuerpo; sube un asa
       cruzando por delante del tronco hacia el hombro contrario; la baja y repite con el otro brazo. Los brazos, los del curl martillo
       cruzado del bloque 6 */
    COREO['curl-banda-cruzado'] = (function () {
      var pies = { suelo: [13, 0], abre: 8 }, abajo = { a: [21.67, 78.76, 3.86], polo: [1.41, -26.95, 0.94] };
      var a = { p: pies, b: abajo, m: NEU };
      var i = { p: pies, m: NEU, bi: { a: [-2.33, 118.52, 14.24], polo: [1, -1, 0.5] }, bd: { a: [-21.67, 78.76, 3.86], polo: [-1.41, -26.95, 0.94] } };
      return {
        vista: [[18, 6], [62, 6]], rastro: 'mi', esfuerzo: [2, 6], clavos: T2, material: [PISADA2],
        posturas: { a: a, i: i, d: refleja(i) }, inicio: 'i',
        rep: [['a', 1.9, 'freno'], ['a', 0.25], ['d', 1.25, 'empuje'], ['d', 0.35], ['a', 1.9, 'freno'], ['a', 0.25], ['i', 1.25, 'empuje'], ['i', 0.35]],
        pasos: ['a', { sec: [['i', 1.25, 'empuje']], desde: 'a' }, 'rep']
      };
    })();

    /* el curl a una mano: pisa la banda con la parte delantera del pie y coge el asa con la palma hacia arriba; con el codo pegado
       al cuerpo y la muñeca recta, dobla el codo y sube el asa despacio; y la baja despacio, sin balancear el brazo. Los brazos, los
       del curl en polea a una mano del bloque 6. Lo que sobra de banda queda en el suelo, tras el pie */
    COREO['curl-banda-una-mano'] = (function () {
      var base = { pel: [0, 83.5, -1.5], giro: [0, 1, 0], p: { suelo: [15, 0], abre: 8 }, bd: aLosLados(10), md: SUELTA, mi: SUP };
      var a = sobre(base, { bi: { a: [23.44, 76.87, 6.51], polo: [2.35, -26.83, 1.88] } }), b = sobre(base, { bi: { a: [23.44, 119.98, 14.5], polo: [2.35, -26.83, 1.88] } });
      return {
        vista: [[-34, 8], [28, 6]], rastro: 'mi', esfuerzo: [0], clavos: T2,
        material: [['banda', { tiras: [{ de: 'bola-i', a: 'mano-i', asas: 'a' }, { de: 'bola-i', a: [9, 0.5, -14], sesgo: -6 }] }]],
        posturas: { a: a, b: b }, inicio: 'a',
        rep: [['b', 1.5, 'empuje'], ['b', 0.3], ['a', 2, 'freno'], ['a', 0.45]],
        pasos: ['a', { sec: [['b', 1.5, 'empuje']], desde: 'a' }, { rep: 1.5 }]
      };
    })();

    /* un pie por el aire, a medio paso: el tobillo, en (x, z) y despegado «alto» cm, con la punta algo caída (los pasos de lado de
       la aducción en polea del bloque 10) */
    function alAire(k, x, z, alto) {
      var s = k === 'i' ? 1 : -1, c = {};
      c['p' + k] = { a: [x, D.tobillo + (alto == null ? 5 : alto), (z || 0) + 1], polo: [s * 0.2, 0.1, 1] };
      c['t' + k] = { punta: [s * 0.09, -0.14, 0.99], arriba: [s * 0.01, 0.99, 0.14] };
      return c;
    }
    /* los dos puños juntos ante la cadera: donde una cosa pasa de una mano a la otra */
    var JUNTO_I = { a: [4, 9, 15], en: 'pelvis', polo: [1, 0.1, -0.5] }, JUNTO_D = { a: [-4, 9, 15], en: 'pelvis', polo: [-1, 0.1, -0.5] };

    /* la elevación lateral: pisa un extremo de la banda con un pie (el izquierdo) y sujeta el otro con la mano de ese lado, con el
       brazo colgando y el codo algo flexionado; con las rodillas sueltas y la espalda erguida, sube el brazo hacia el lado hasta la
       altura del hombro y lo baja despacio; y cambia de lado. El cambio: junta los puños ante la cadera y el asa pasa a la mano
       derecha; aparta el pie izquierdo y el derecho pisa la banda donde estaba (la banda no se mueve del suelo: se mueve él) */
    COREO['elevacion-lateral-banda'] = (function () {
      var Y = PIE - 1.5, X = 10, pies = { suelo: [X, 0], abre: 6 };
      var cuelga = { e: 6, z: 90, g: 90, c: 14 }, arriba = { e: 88, z: 88, g: 68, c: 12 }, quieto = aLosLados(10);
      var s = { p: pies, bi: cuelga, mi: PUNO, bd: quieto, md: SUELTA };
      var a = sobre(s, { pel: [0, Y, 0], hom: [-1.5, -1.5] }), b = sobre(a, { bi: arriba });
      var x = sobre(a, { bi: JUNTO_I, bd: JUNTO_D, mi: PUNO, md: PUNO });
      var D1 = { hom: [-1.5, -1.5], bi: quieto, mi: SUELTA, bd: JUNTO_D, md: PUNO };
      var l1 = une(D1, une({ pel: [3, Y - 0.5, 0], pd: { suelo: [-X, 0], abre: 6 } }, alAire('i', 2 * X, 0)));
      var l2 = une(D1, { pel: [X, Y - 1, 0], pi: { suelo: [3 * X, 0], abre: 6 }, pd: { suelo: [-X, 0], abre: 6 } });
      var l3 = une(D1, une({ pel: [2 * X - 3, Y - 0.5, 0], pi: { suelo: [3 * X, 0], abre: 6 } }, alAire('d', 0, 0)));
      var l4 = une(D1, { pel: [2 * X, Y, 0], pi: { suelo: [3 * X, 0], abre: 6 }, pd: { suelo: [X, 0], abre: 6 } });
      var a2 = sobre(l4, { bd: cuelga }), b2 = sobre(a2, { bd: arriba });
      return {
        vista: [[0, 6], [42, 8]], rastro: 'mi', esfuerzo: [0], clavos: T2,
        material: [['banda', { tiras: [
          { de: 'pie-i:fuera', a: 'mano-i', asas: 'a', ve: ['s', 'a', 'b'] },
          { de: [X - 5.4, 0.6, 6.5], a: 'mano-d', asas: 'a', ve: ['x', 'l1', 'l2', 'l3'] },
          { de: 'pie-d:fuera', a: 'mano-d', asas: 'a', ve: ['l4', 'a2', 'b2'] }] }]],
        posturas: { s: s, a: a, b: b, x: x, l1: l1, l2: l2, l3: l3, l4: l4, a2: a2, b2: b2 }, inicio: 'a', encuadra: ['s', 'b', 'b2'],
        rep: [['b', 1.3, 'empuje'], ['b', 0.3], ['a', 1.8, 'freno'], ['a', 0.4]],
        pasos: ['s', { sec: [['a', 0.9, 'suave']], desde: 's' },
          { sec: [['b', 1.3, 'empuje'], ['b', 0.3], ['a', 1.7, 'freno'], ['x', 0.75, 'suave'], ['x', 0.2], ['l1', 0.28, 'entra'], ['l2', 0.26, 'sale'], ['l3', 0.28, 'entra'], ['l4', 0.26, 'sale'],
                   ['a2', 0.6, 'suave'], ['b2', 1.3, 'empuje'], ['b2', 0.3], ['a2', 1.7, 'freno']], desde: 'a', dura: 10.4 }]
      };
    })();

    /* las aperturas de abajo arriba: con un pie adelantado (el izquierdo) y la banda bajo el de atrás, un extremo en cada mano;
       empieza con los brazos abajo en forma de V y las palmas hacia delante; los sube en arco hasta la altura del pecho y vuelve a la V */
    COREO['aperturas-banda-bajo-alto'] = (function () {
      var base = { pel: [0, PIE - 1.5, 9], pi: { suelo: [10, 30], abre: 4 }, pd: { suelo: [-10, -8], abre: 10 } };
      var s = sobre(base, { b: aLosLados(8), m: NEU }), v = sobre(base, { b: { e: 24, z: 62, g: 90, c: 10 }, m: SUP });
      var b = sobre(base, { hom: [0, 1.5], b: { e: 76, z: 9, g: 90, c: 20 }, m: SUP });
      return {
        vista: [[30, 8], [-62, 8]], rastro: 'manos', esfuerzo: [0, 1], clavos: T2,
        material: [['banda', { tiras: [{ de: 'mano-i', por: ['pie-d'], a: 'mano-d' }] }]],
        posturas: { s: s, v: v, b: b }, inicio: 'v', encuadra: ['s', 'b'],
        rep: [['b', 1.4, 'empuje'], ['b', 0.4], ['v', 1.8, 'freno'], ['v', 0.4]],
        pasos: ['s', { sec: [['v', 1.1, 'suave']], desde: 's' }, 'rep']
      };
    })();

    /* ══════════════════════════════ ATADA A UN POSTE ══════════════════════════════
       El poste, de hierro, a un metro o así; la banda lo rodea a la altura que diga la ficha (un lazo) y de ahí va a las manos, al
       brazo o al tobillo. EN_POSTE: el puño que se agarra a un poste (vertical) */
    var EN_POSTE = { tipo: 'puno', barra: [0, 1, 0], palma: [-1, 0, 0] };
    function atada(en, alto, tiras, extra) { return ['banda', une({ lazos: [{ en: [en[0], alto, en[1]], r: 3.7 }], tiras: tiras }, extra)]; }

    /* el curl femoral de pie: frente a un apoyo estable (el poste, con las dos manos), con la banda por un tobillo (el izquierdo) y
       el otro extremo pisado con el pie contrario; dobla la rodilla y lleva el pie hacia el glúteo; y lo baja despacio. La pierna, la
       del curl de pie sin peso del bloque 11: el pie se despega primero un poco, plano, y el muslo no se mueve */
    COREO['curl-femoral-de-pie-banda'] = (function () {
      var ZP = 47, KD = ['mi', 'md', 'td'];
      var asido = function (P) { return conAgarre(conAgarre(sobre(P, { mi: EN_POSTE, md: refleja({ mi: EN_POSTE }).md }), [0, 120, ZP], [1, -0.8, -0.3], 'bi'), [0, 107, ZP], [-1, -0.8, -0.3], 'bd'); };
      var s = { pel: [0, 85.7, 0], p: { suelo: [10, 0], abre: 4 }, b: aLosLados(10), m: SUELTA };
      var a = asido({ pel: [0, 85.7, 0], p: { suelo: [10, 0], abre: 4 } });
      var m = asido({ pel: [-1.5, 85.7, 0], pd: { suelo: [-10, 0], abre: 4 }, pi: { a: [10, 13, -8], polo: [0, 0, 1] }, ti: { punta: [0, -0.1, 1], arriba: [0, 1, 0.1] } });
      var b = asido({ pel: [-2.5, 85.7, 0], pd: { suelo: [-10, 0], abre: 4 }, pi: { a: [7.5, 59.94, -35.23], polo: [0, -0.2, 1] }, ti: { tob: 26 } });
      return {
        vista: [[72, 10], [118, 10]], rastro: 'ti', esfuerzo: [1, 2], clavos: K4, clavosEn: { s: T2 },
        material: [['poste', { en: [0, ZP], alto: 150 }], ['banda', { lazos: [{ en: 'tobillo-i' }], tiras: [{ de: 'lazo:0', a: 'pie-d:dentro' }] }]],
        posturas: { s: s, a: a, m: m, b: b }, inicio: 'a', encuadra: ['s', 'b'],
        rep: [['m', 0.35, 'entra', KD], ['b', 0.95, 'sale', KD], ['b', 1, null, KD], ['m', 1.2, 'entra', KD], ['a', 0.4, 'sale', KD], ['a', 0.25, null, K4]],
        pasos: [{ sec: [['s', 0.8, null, T2], ['a', 1.2, 'suave', T2]], desde: 's' }, { sec: [['m', 0.4, 'entra', KD], ['b', 1, 'sale', KD]], desde: 'a' }, { rep: 1.3 }]
      };
    })();

    /* las aperturas de pie: la banda, atada a un poste que queda a su espalda, con un extremo en cada mano; da un paso adelante hasta
       tensarla; abre los brazos hacia los lados a la altura del pecho, con las palmas hacia delante; junta las manos delante del
       pecho, las mantiene un momento y vuelve despacio. Los brazos, los del cruce de poleas del bloque 2. Al cerrar, cada mitad de la
       banda rodea su hombro por fuera (rodea): en línea recta atravesaría el pecho */
    COREO['aperturas-banda'] = (function () {
      var ZP = -80, H = 124, AL_PECHO = { a: [20, 10, 12], en: 'torax', polo: [1, -0.6, -0.4] };
      var s = { p: { suelo: [10, 0], abre: 8 }, b: AL_PECHO, m: NEU };
      var paso = { pel: [0, 85, 15], pi: { suelo: [10, 36], abre: 4 }, pd: { suelo: [-10, 0], abre: 10 } };
      var a1 = sobre(paso, { b: AL_PECHO, m: NEU }), a = sobre(paso, { b: { e: 86, z: 100, g: 90, c: 20 }, m: NEU }), b = sobre(paso, { b: { e: 80, z: -1.5, g: 90, c: 24 }, m: NEU });
      var cinta = function (k, sg) { return { de: [0, H, ZP + 3], a: 'mano-' + k, rodea: { en: 'torax', c: [0, 16, 1], a: 26, b: 15, sentido: sg } }; };
      return {
        vista: [[22, 12], [-52, 26]], rastro: 'manos', esfuerzo: [0, 1], clavos: T2,
        material: [['poste', { en: [0, ZP], alto: 190 }], atada([0, ZP], H, [cinta('i', 1), cinta('d', -1)])],
        posturas: { s: s, a1: a1, a: a, b: b }, inicio: 'a', encuadra: ['s', 'a', 'b'],
        rep: [['b', 1.3, 'empuje'], ['b', 0.6], ['a', 1.8, 'freno'], ['a', 0.4]],
        pasos: [{ sec: [['s', 0.8], ['a1', 1.1, 'suave', ['td']]], desde: 's' }, { sec: [['a', 1.2, 'suave']], desde: 'a1' }, 'rep']
      };
    })();

    /* el press de pecho de pie: con los pies a la anchura de los hombros y la banda por la espalda, bajo las axilas, con un extremo
       en cada mano; dobla los codos y los sube a la altura del pecho, con las palmas hacia el suelo; estira los brazos hacia delante
       sin bloquear los codos y vuelve despacio. No va atada: rodea la espalda (rodea, por detrás) */
    COREO['press-pecho-banda'] = (function () {
      var pies = { suelo: [14, 0], abre: 8 };
      var s = { p: pies, b: { a: [19.5, 9, 12], en: 'torax', polo: [0.7, -1, -0.3] }, m: PRONO };
      var a = { p: pies, hom: [0, -1], b: { e: 76, z: 72, g: 90, c: 108 }, m: PRONO }, b = { p: pies, hom: [0, 1.5], b: { e: 82, z: 14, g: 90, c: 16 }, m: PRONO };
      return {
        vista: [[52, 10], [128, 12]], rastro: 'manos', esfuerzo: [0, 1], clavos: T2,
        material: [['banda', { tiras: [{ de: 'mano-i', a: 'mano-d', rodea: { en: 'torax', c: [0, 13, 1.7], a: 20, b: 14, sentido: -1, siempre: true } }] }]],
        posturas: { s: s, a: a, b: b }, inicio: 'a', encuadra: ['s', 'b'],
        rep: [['b', 1.3, 'empuje'], ['b', 0.4], ['a', 1.8, 'freno'], ['a', 0.4]],
        pasos: ['s', { sec: [['a', 1.2, 'suave']], desde: 's' }, 'rep']
      };
    })();

    /* el face pull: la banda, anclada a la altura de la cara, con los brazos estirados; tira llevando los codos altos y abiertos
       hacia la cara mientras junta los omóplatos; y vuelve despacio. El del bloque 1 en polea, con la banda */
    COREO['face-pull-banda'] = (function () {
      var ZP = 108, H = HOMBRO + 22, fp = { pi: { suelo: [10, 16], abre: 6 }, pd: { suelo: [-10, -13], abre: 8 }, m: PRONO };
      var a = sobre(fp, { pel: [0, PIE - 2, 0], b: { e: 97, z: 7, g: 0, c: 5 } });
      var b = sobre(fp, { pel: [0, PIE - 4, 0], hom: [0, -2.6], b: { e: 97, z: 80, g: 34, c: 112 } });
      return {
        vista: [[58, 8], [112, 10]], rastro: 'manos', esfuerzo: [0, 1], clavos: T2,
        material: [['poste', { en: [0, ZP], alto: 200 }], atada([0, ZP], H, [{ de: [2.5, H, ZP - 2.5], a: 'mano-i' }, { de: [-2.5, H, ZP - 2.5], a: 'mano-d' }])],
        posturas: { a: a, b: b }, inicio: 'a',
        rep: [['b', 1.1, 'empuje'], ['b', 0.7], ['a', 1.6, 'freno'], ['a', 0.4]],
        pasos: ['a', { sec: [['b', 1.1, 'empuje']], desde: 'a' }, { rep: 1.1 }]
      };
    })();

    /* el remo con la banda anclada: a un punto firme (el poste, a la altura de una barandilla), con los brazos estirados y la banda
       tensa; mete un poco la barbilla y dobla los codos para tirar de la banda hacia él, juntando los omóplatos; mantiene tres
       segundos y vuelve despacio */
    COREO['remo-banda-anclada'] = (function () {
      var ZP = 112, H = 104, base = { pel: [0, PIE - 2, -2], p: { suelo: [11, 0], abre: 7 }, m: NEU };
      var a = sobre(base, { b: { e: 68, z: 6, g: 0, c: 6 } });
      var b = sobre(base, { hom: [0, -2.6], cab: [7, 0, 0], b: { a: [18.5, 5, 9], en: 'torax', polo: [0.45, -0.5, -1] } });
      return {
        vista: [[62, 8], [118, 10]], rastro: 'manos', esfuerzo: [0, 1], clavos: T2,
        material: [['poste', { en: [0, ZP], alto: 108, r: 3.4 }], atada([0, ZP], H - 6, [{ de: [2.5, H - 6, ZP - 2.5], a: 'mano-i' }, { de: [-2.5, H - 6, ZP - 2.5], a: 'mano-d' }])],
        posturas: { a: a, b: b }, inicio: 'a',
        rep: [['b', 1.2, 'empuje'], ['b', 3], ['a', 1.8, 'freno'], ['a', 0.4]],
        pasos: ['a', { sec: [['b', 1.2, 'empuje']], desde: 'a' }, { sec: [['b', 3], ['a', 1.8, 'freno']], desde: 'b', dura: 5.3 }]
      };
    })();

    /* los pájaros de pie: la banda, alrededor de un poste a la altura del pecho, agarrada con los brazos estirados por delante; se
       aleja hasta tensarla (un paso atrás con cada pie); con los pies a la anchura de los hombros y las rodillas algo flexionadas,
       abre los brazos hacia atrás hasta dejarlos en línea con los hombros y vuelve despacio al frente. Los brazos, los de las
       aperturas inversas en polea del bloque 5, sin cruzar */
    COREO['pajaros-banda'] = (function () {
      var ZP = 112, H = 122, DZ = 20, VERT_I = { tipo: 'puno', barra: [0, 1, 0], palma: [-1, 0, 0] }, VERT_D = { tipo: 'puno', barra: [0, 1, 0], palma: [1, 0, 0] };
      var frente = function (z) { return { bi: { a: [8, H - 1, z + 48.3], polo: [1, -0.8, 0.2] }, bd: { a: [-8, H - 1, z + 48.3], polo: [-1, -0.8, 0.2] }, mi: VERT_I, md: VERT_D }; };
      var s = une({ pel: [0, PIE, DZ], p: { suelo: [14, DZ], abre: 8 } }, { bi: { a: [8, H - 6, DZ + 38], polo: [1, -1, 0.1] }, bd: { a: [-8, H - 6, DZ + 38], polo: [-1, -1, 0.1] }, mi: VERT_I, md: VERT_D });
      var l1 = une(frente(DZ - 6), une({ pel: [2.5, PIE - 0.5, DZ - 4], pi: { suelo: [14, DZ], abre: 8 } }, alAire('d', -14, DZ / 2 - 1)));
      var l2 = une(frente(DZ / 2 - 4), { pel: [0, PIE - 1, DZ / 2], pi: { suelo: [14, DZ], abre: 8 }, pd: { suelo: [-14, 0], abre: 8 } });
      var l3 = une(frente(-3), une({ pel: [-2.5, PIE - 1.5, 4], pd: { suelo: [-14, 0], abre: 8 } }, alAire('i', 14, DZ / 2 - 1)));
      var a = une(frente(0), { pel: [0, PIE - 2, -1], p: { suelo: [14, 0], abre: 8 } });
      var b = { pel: [0, PIE - 2, -1], p: { suelo: [14, 0], abre: 8 }, hom: [0, -2.5], bi: { a: [69.4, 126.5, -3], polo: [0.3, -0.4, -1] }, bd: { a: [-69.4, 126.5, -3], polo: [-0.3, -0.4, -1] },
                mi: { tipo: 'puno', barra: [0, 1, 0], palma: [-0.41, 0, 0.91] }, md: { tipo: 'puno', barra: [0, 1, 0], palma: [0.41, 0, 0.91] } };
      return {
        vista: [[38, 14], [152, 10]], rastro: 'manos', esfuerzo: [0, 1], clavos: T2,
        material: [['poste', { en: [0, ZP], alto: 190 }], atada([0, ZP], H, [{ de: [3, H, ZP - 2], a: 'mano-i' }, { de: [-3, H, ZP - 2], a: 'mano-d' }])],
        posturas: { s: s, l1: l1, l2: l2, l3: l3, a: a, b: b }, inicio: 'a', encuadra: ['s', 'a', 'b'],
        rep: [['b', 1.4, 'empuje'], ['b', 0.7], ['a', 2, 'freno'], ['a', 0.4]],
        pasos: [{ sec: [['s', 0.8], ['l1', 0.3, 'entra'], ['l2', 0.28, 'sale'], ['l3', 0.3, 'entra'], ['a', 0.3, 'sale']], desde: 's' }, 'a', 'rep']
      };
    })();

    /* la rotación externa de hombro: la banda, atada a un poste a la altura del codo; de lado a él (el poste, a su derecha), la
       agarra con la mano más alejada (la izquierda), con el codo doblado a 90 grados y la mano delante del pecho; gira el antebrazo
       hacia fuera, como en un revés de tenis, sin despegar el codo del costado, y vuelve despacio. El brazo, el de la rotación
       externa en polea del bloque 5 */
    COREO['rotacion-externa-banda'] = (function () {
      var XP = -62, ZP = 20, H = 102.6, base = { p: { suelo: [12, 0], abre: 8 }, bd: aLosLados(10), md: SUELTA };
      var s = sobre(base, { bi: { a: [9, 8, 13], en: 'pelvis', polo: [1, 0, -0.5] }, mi: { tipo: 'puno', barra: [0, 1, 0], palma: [-0.57, 0, -0.82] } });
      var a = sobre(base, { bi: { a: [1.33, 102.59, 14.76], polo: [0.07, -1, 0.04] }, mi: { tipo: 'puno', barra: [0, 1, 0], palma: [-0.57, 0, -0.82] } });
      var b = sobre(base, { bi: { a: [38.83, 102.59, 17.06], polo: [0.07, -1, 0.04] }, mi: { tipo: 'puno', barra: [0, 1, 0], palma: [-0.67, 0, 0.74] } });
      return {
        vista: [[16, 8], [60, 8]], rastro: 'mi', esfuerzo: [0], clavos: T2,
        material: [['poste', { en: [XP, ZP], alto: 150 }], atada([XP, ZP], H, [{ de: [XP + 3.5, H, ZP], a: 'mano-i' }])],
        posturas: { s: s, a: a, b: b }, inicio: 'a', encuadra: ['s', 'b'],
        rep: [['b', 1.5, 'suave'], ['b', 0.4], ['a', 2, 'freno'], ['a', 0.4]],
        pasos: ['s', { sec: [['a', 1.1, 'suave']], desde: 's' }, 'rep']
      };
    })();

    /* la retracción escapular: un extremo de la banda, anclado a la altura del hombro; mete el brazo (el izquierdo) en el lazo, a la
       altura del tríceps; retrocede hasta que la banda queda tensa; lleva hacia atrás el codo y el hombro contra la banda, vuelve
       despacio y cambia de brazo. El cambio, a la vista: la mano derecha saca el lazo del brazo izquierdo, lo pasa a la izquierda por
       delante del pecho y esta lo mete en el brazo derecho */
    COREO['retraccion-escapular-banda'] = (function () {
      var ZP = 104, H = HOMBRO, DZ = 20, quieto = aLosLados(10);
      var brazos = { bi: { a: [19, -6, 29], en: 'torax', polo: [0.3, -1, -0.2] }, mi: SUELTA, bd: quieto, md: SUELTA };
      var s = une(brazos, { pel: [0, PIE, DZ], p: { suelo: [11, DZ], abre: 7 } });
      var l1 = une(brazos, une({ pel: [2.5, PIE - 0.5, DZ - 4], pi: { suelo: [11, DZ], abre: 7 } }, alAire('d', -11, DZ / 2 - 1)));
      var l2 = une(brazos, { pel: [0, PIE - 1, DZ / 2], pi: { suelo: [11, DZ], abre: 7 }, pd: { suelo: [-11, 0], abre: 7 } });
      var l3 = une(brazos, une({ pel: [-2.5, PIE - 0.5, 4], pd: { suelo: [-11, 0], abre: 7 } }, alAire('i', 11, DZ / 2 - 1)));
      var a = une(brazos, { pel: [0, PIE, 0], p: { suelo: [11, 0], abre: 7 } });
      var b = sobre(a, { hom: { i: [0, -3.4], d: [0, 0] }, bi: { a: [20.5, -4, 13], en: 'torax', polo: [0.4, -0.6, -1] } });
      /* dónde queda el lazo en el brazo izquierdo: a 17 cm del hombro (bajo la manga); el puño derecho va a su cara de delante */
      var Ea = resolver(a), lz = mas(Ea.i.hom, por(unidad(menos(Ea.i.cod, Ea.i.hom)), 17));
      var x1 = conAgarre(sobre(a, { md: PUNO }), [lz[0] - 2, lz[1], lz[2] + 7], [-1, -0.5, 0.3], 'bd');
      var x2 = sobre(a, { bi: { a: [4.5, 4, 19], en: 'torax', polo: [1, -0.7, -0.1] }, bd: { a: [-4.5, 4, 19], en: 'torax', polo: [-1, -0.7, -0.1] }, mi: PUNO, md: PUNO });
      var izq = ['s', 'l1', 'l2', 'l3', 'a', 'b'], der = ['x3', 'a2', 'b2'], P0 = [0, H, ZP - 3.5];
      return {
        vista: [[42, 10], [124, 12]], rastro: 'ci', esfuerzo: [0, 1], clavos: T2,
        material: [['poste', { en: [0, ZP], alto: 190 }], ['banda', {
          lazos: [{ en: 'brazo-i', a: 17, ve: izq }, { en: 'brazo-d', a: 17, ve: der }, { en: [0, H, ZP], r: 3.7 }],
          tiras: [{ de: P0, a: 'lazo:0', ve: izq }, { de: P0, a: 'mano-d', ve: ['x1'] }, { de: P0, a: 'mano-i', ve: ['x2'] }, { de: P0, a: 'lazo:1', ve: der }] }]],
        posturas: { s: s, l1: l1, l2: l2, l3: l3, a: a, b: b, x1: x1, x2: x2, x3: refleja(x1), a2: refleja(a), b2: refleja(b) }, inicio: 'a', encuadra: ['s', 'a', 'b'],
        rep: [['b', 1.1, 'empuje'], ['b', 0.5], ['a', 1.5, 'freno'], ['a', 0.4]],
        pasos: ['s', { sec: [['l1', 0.3, 'entra'], ['l2', 0.28, 'sale'], ['l3', 0.3, 'entra'], ['a', 0.3, 'sale']], desde: 's' },
          { sec: [['b', 1.1, 'empuje'], ['b', 0.5], ['a', 1.5, 'freno'], ['x1', 0.7, 'suave'], ['x1', 0.15], ['x2', 0.6, 'suave'], ['x2', 0.15], ['x3', 0.7, 'suave'], ['x3', 0.15],
                   ['a2', 0.7, 'suave'], ['b2', 1.1, 'empuje'], ['b2', 0.5], ['a2', 1.5, 'freno']], desde: 'a', dura: 9.8 }]
      };
    })();

    /* el peso muerto a una pierna: la banda, anclada a un punto bajo (el pie del poste), con un asa en cada mano; se aleja hasta notar
       resistencia y dobla un poco la rodilla de la pierna que trabaja (la derecha, que es la que apoya); se inclina desde la cadera
       con los brazos estirados, que avanzan al bajar, y extiende la cadera para volver. Una sola pierna. El cuerpo, el del peso muerto
       a una pierna del bloque 11; los brazos, estirados hacia el anclaje */
    COREO['peso-muerto-una-pierna-banda'] = (function () {
      var ZP = 112, H = 14, DZ = 22, TD = ['td'];
      var asas = function (P) { return estirado(estirado(sobre(P, { m: NEU }), [7, H, ZP], 'bi', 0.12, [1, -0.3, -0.3]), [-7, H, ZP], 'bd', 0.12, [-1, -0.3, -0.3]); };
      var s = asas({ pel: [0, 84, DZ], p: { suelo: [9, DZ], abre: 4 } });
      var l1 = asas(une({ pel: [2.5, 83.5, DZ - 4], pi: { suelo: [9, DZ], abre: 4 } }, alAire('d', -9, DZ / 2 - 1)));
      var l2 = asas({ pel: [0, 83, DZ / 2], pi: { suelo: [9, DZ], abre: 4 }, pd: { suelo: [-9, 0], abre: 4 } });
      var l3 = asas(une({ pel: [-2.5, 83.5, 4], pd: { suelo: [-9, 0], abre: 4 } }, alAire('i', 9, DZ / 2 - 1)));
      var a = asas({ pel: [0, 84, 0], p: { suelo: [9, 0], abre: 4 } });
      var apoyo = { pd: { suelo: [-9, 0], abre: 4, polo: [-0.05, 0.1, 1] } };
      var m = asas(une(apoyo, { pel: [-3, 82.5, -1.5], giro: [0, 7, 0], cab: [-2, 0, 0], pi: { a: [9, 14, -17], polo: [0, 0.1, 1] }, ti: { punta: [0, -0.24, 0.97], arriba: [0, 0.97, 0.24] } }));
      var c = asas(une(apoyo, { pel: [-3, 80.48, -10.79], giro: [0, 46, 0], cab: [-13.8, 0, 0], pi: { a: [7, 26.44, -66.75], polo: [0, -0.72, 0.69] }, ti: { tob: 24 } }));
      var b = asas(une(apoyo, { pel: [-3, 79.67, -14.27], giro: [0, 72, 0], cab: [-21.6, 0, 0], pi: { a: [7, 55.63, -88.26], polo: [0, -0.95, 0.31] }, ti: { tob: 24 } }));
      return {
        vista: [[-64, 12], [-114, 14]], rastro: 'pel', esfuerzo: [3, 4], clavos: T2, clavosEn: { c: TD, b: TD },
        material: [['poste', { en: [0, ZP], alto: 150 }], atada([0, ZP], H, [{ de: [2.5, H, ZP - 2.5], a: 'mano-i', asas: 'a' }, { de: [-2.5, H, ZP - 2.5], a: 'mano-d', asas: 'a' }])],
        posturas: { s: s, l1: l1, l2: l2, l3: l3, a: a, m: m, c: c, b: b }, inicio: 'm', encuadra: ['s', 'a', 'b'],
        rep: [['c', 0.8, 'entra'], ['b', 1, 'sale'], ['b', 0.5, null, TD], ['c', 0.8, 'entra'], ['m', 0.8, 'sale'], ['m', 0.4]],
        pasos: ['s', { sec: [['l1', 0.3, 'entra'], ['l2', 0.28, 'sale'], ['l3', 0.3, 'entra'], ['a', 0.3, 'sale'], ['a', 0.25], ['m', 0.7, 'suave']], desde: 's' }, 'rep']
      };
    })();

    /* la extensión de rodilla de pie: la banda, al tobillo (el izquierdo), con el anclaje detrás; de pie, con los pies a la anchura de
       la cadera; levanta el pie de 2,5 a 5 cm del suelo (4,5: la rodilla se adelanta y queda doblada), en equilibrio sobre la otra
       pierna; estira la rodilla hasta tener la pierna recta, sin mover la cadera ni el tronco (el muslo no se mueve); y la baja despacio */
    COREO['extension-rodilla-pie-banda'] = (function () {
      var ZP = -88, H = 14, EN_CINTURA = { a: [16, 13, 6], en: 'pelvis', polo: [1, 0, -0.3] }, TD = ['td'];
      var a = { p: { suelo: [10, 0], abre: 5 }, b: EN_CINTURA, m: SUELTA };
      var base = { pel: [-2.5, PIE - 0.6, 0], pd: { suelo: [-10, 0], abre: 5 }, b: EN_CINTURA, m: SUELTA };
      var MUSLO = 19.5, m = sobre(base, { pi: { e: MUSLO, z: 0, c: 41.7 }, ti: { punta: [0, -0.1, 0.995], arriba: [0, 0.995, 0.1] } });
      var b = sobre(base, { pi: { e: MUSLO, z: 0, c: 4 }, ti: { tob: 4 } });
      return {
        vista: [[62, 10], [112, 12]], rastro: 'ti', esfuerzo: [0, 1], clavos: T2, clavosEn: { b: TD },
        material: [['poste', { en: [10, ZP], alto: 150 }], ['banda', { lazos: [{ en: 'tobillo-i' }, { en: [10, H, ZP], r: 3.7 }], tiras: [{ de: [10, H, ZP + 3.5], a: 'lazo:0' }] }]],
        posturas: { a: a, m: m, b: b }, inicio: 'm', encuadra: ['a', 'b'],
        rep: [['b', 1.2, 'empuje', TD], ['b', 0.5, null, TD], ['m', 1.7, 'freno', TD], ['m', 0.4, null, TD]],
        pasos: ['a', { sec: [['m', 1, 'suave']], desde: 'a' }, { sec: [['b', 1.2, 'empuje', TD]], desde: 'm' }, { rep: 1.2 }]
      };
    })();

    /* el leñador inverso: la banda, atada a un punto firme por debajo de la rodilla (a su izquierda), agarrada con las dos manos
       como un bate; con las rodillas dobladas, empieza con las manos a un lado de la cadera; gira la cadera y el tronco mientras
       lleva las manos en diagonal hasta por encima del hombro contrario, y vuelve con control. Los pies no se mueven */
    COREO['lenador-inverso-banda'] = (function () {
      var XP = 78, H = 34, pies = { suelo: [17, 0], abre: 7 };
      var bate = function (i, d) { return { bi: { a: i, en: 'torax', polo: [1, -0.6, 0.1] }, bd: { a: d, en: 'torax', polo: [-1, -0.6, 0.1] }, m: NEU }; };
      /* el signo del rumbo y del giro de la columna que llevan las manos hacia +X (hacia el poste) */
      var con = function (y, g, tw, col, alto, br) { return sobre({ pel: [0, y, alto], giro: [g, alto ? 14 : 0, 0], col: [col, 0, tw], cab: [0, -(g + tw) * 0.6, 0], p: pies }, br); };
      var prueba = function (sg) { return resolver(con(72, sg * 15, sg * 25, 6, -5, bate([4, -9, 33], [-3, -3, 34]))).i.mun[0]; }, sg = prueba(1) > prueba(-1) ? 1 : -1;
      var s = { p: pies, bi: { a: [15, 6, 14], en: 'pelvis', polo: [1, 0, -0.4] }, bd: { a: [8, 11, 15.5], en: 'pelvis', polo: [-1, -0.2, -0.2] }, m: NEU };
      /* abajo, los puños a un lado de la cadera (el izquierdo, que es el del poste): 20 cm por fuera de ella y a su altura, uno sobre otro */
      var a = conAgarre(conAgarre(con(72, sg * 15, sg * 25, 6, -5, { m: NEU }), [31, 66, 3], [0.6, 0, -1], 'bi'), [28, 72.5, 6], [-0.6, -0.5, 0.6], 'bd');
      var b = con(PIE - 2, -sg * 15, -sg * 25, -3, 0, bate([-10, 40, 36], [-17, 45, 33]));
      return {
        vista: [[-24, 10], [-70, 8]], rastro: 'manos', esfuerzo: [0, 1], clavos: T2,
        material: [['poste', { en: [XP, 0], alto: 150 }], atada([XP, 0], H, [{ de: [XP - 3.5, H, 0], a: 'manos', rodea: { en: 'torax', c: [0, 12, 1.5], a: 20, b: 13.5, sentido: 1 } }])],
        posturas: { s: s, a: a, b: b }, inicio: 'a', encuadra: ['s', 'a', 'b'],
        rep: [['b', 1.3, 'empuje'], ['b', 0.4], ['a', 1.8, 'freno'], ['a', 0.4]],
        pasos: ['s', { sec: [['a', 1.2, 'suave']], desde: 's' }, 'rep']
      };
    })();

    /* ══════════════════════════════ DE RODILLAS ══════════════════════════════
       Como en los bloques 8 a 11: las rodillas, en el suelo; los tobillos, 37,5 cm por detrás, con los empeines tendidos; el tronco,
       derecho (la cadera, a un muslo de las rodillas). arrodillado(g): lo mismo, mirando «g» grados hacia su izquierda */
    function arrodillado(g, extra) {
      var B = giroY(g || 0);
      return sobre({ pel: [0, 45.5, 0], giro: [g || 0, 0, 0],
        pi: { a: aplicar(B, [10, 3.6, -37.5]), polo: aplicar(B, [0.1, -1, 0.6]) }, pd: { a: aplicar(B, [-10, 3.6, -37.5]), polo: aplicar(B, [-0.1, -1, 0.6]) },
        t: { punta: aplicar(B, [0, -0.04, -1]), arriba: [0, -1, 0.04] } }, extra || {});
    }

    /* el press Pallof de rodillas: la banda, fija a un punto firme (a su izquierda, a la altura del esternón); de rodillas, de lado a
       ella, con el tronco erguido y las manos junto al esternón; estira los brazos hacia delante sin dejar que la banda le gire el
       tronco; vuelve a llevar las manos al pecho y repite mirando hacia el otro lado (se da la vuelta sobre las rodillas, de cara al
       poste). Los brazos, los del press Pallof en polea del bloque 12 */
    COREO['press-pallof-banda-rodillas'] = (function () {
      var XP = 90, H = 80, cerca = { bd: { a: [-1.4, 12.5, 15], en: 'torax', polo: [-1, -0.7, 0.2] }, bi: { a: [5.6, 12.5, 15], en: 'torax', polo: [1, -0.7, 0.2] }, m: NEU };
      var lejos = { bd: { a: [-1.4, 12.5, 47.6], en: 'torax', polo: [-1, -0.7, 0.2] }, bi: { a: [5.6, 12.5, 47.6], en: 'torax', polo: [1, -0.7, 0.2] }, m: NEU };
      return {
        vista: [[-30, 12], [-78, 10]], rastro: 'manos', esfuerzo: [0, 1], clavos: T2,
        material: [['poste', { en: [XP, 0], alto: 150 }], atada([XP, 0], H, [{ de: [XP - 3.5, H, 0], a: 'manos' }])],
        posturas: { a: arrodillado(0, cerca), b: arrodillado(0, lejos), v1: arrodillado(45, cerca), v2: arrodillado(90, cerca), v3: arrodillado(135, cerca), a2: arrodillado(180, cerca), b2: arrodillado(180, lejos) },
        inicio: 'a', encuadra: ['a', 'b', 'b2'],
        rep: [['b', 1.6, 'freno'], ['b', 0.6], ['a', 1.6, 'suave'], ['a', 0.4]],
        pasos: ['a', { sec: [['b', 1.7, 'freno']], desde: 'a' },
          { sec: [['a', 1.6, 'suave'], ['a', 0.2], ['v1', 0.34, 'entra', NADA], ['v2', 0.3, 'lineal', NADA], ['v3', 0.3, 'lineal', NADA], ['a2', 0.34, 'sale', NADA], ['a2', 0.3], ['b2', 1.6, 'freno']], desde: 'b', dura: 5.5 }]
      };
    })();

    /* la apertura inversa de rodillas: de rodillas, con las asas de una banda anclada delante, los brazos estirados a la altura de los
       hombros y las palmas enfrentadas; lleva los hombros hacia atrás y hacia abajo; lleva los brazos estirados hacia atrás y hacia
       abajo en un arco amplio hasta la cadera, girándolos para que las palmas miren hacia arriba; y vuelve despacio, con el tronco vertical */
    COREO['apertura-inversa-rodillas'] = (function () {
      var ZP = 98, H = 89;
      var a0 = arrodillado(0, { b: { e: 90, z: 4, g: 0, c: 4 }, m: NEU }), a = sobre(a0, { hom: [-2, -2.6] });
      var m = sobre(a, { b: { e: 58, z: 80, g: 0, c: 5 }, m: { tipo: 'puno', prono: -45 } }), b = sobre(a, { b: { e: 15, z: 118, g: 0, c: 5 }, m: SUP });
      return {
        vista: [[38, 12], [108, 12]], rastro: 'mi', esfuerzo: [0, 1], clavos: T2,
        material: [['poste', { en: [0, ZP], alto: 150 }], atada([0, ZP], H, [{ de: [2.5, H, ZP - 2.5], a: 'mano-i', asas: 'a' }, { de: [-2.5, H, ZP - 2.5], a: 'mano-d', asas: 'a' }])],
        posturas: { a0: a0, a: a, m: m, b: b }, inicio: 'a', encuadra: ['a', 'b'],
        rep: [['m', 0.7, 'entra'], ['b', 0.8, 'sale'], ['b', 0.5], ['m', 0.9, 'entra'], ['a', 0.9, 'sale'], ['a', 0.4]],
        pasos: ['a0', { sec: [['a', 0.9, 'suave']], desde: 'a0' }, { sec: [['m', 0.7, 'entra'], ['b', 0.8, 'sale']], desde: 'a' }, { rep: 1.5 }]
      };
    })();

    /* ══════════════════════════════ EN EL SUELO Y CON LA MINIBANDA ══════════════════════════════
       La minibanda (un aro corto) rodea las dos piernas: por las pantorrillas, por encima de las rodillas o por los tobillos
       (lazos: 'pantorrillas' | 'muslos' | 'tobillos'): se ve estirarse cuando las separa */

    /* la abducción sentado: la minibanda, alrededor de las pantorrillas; sentado en el suelo con las rodillas dobladas, los pies
       apoyados y las manos un poco por detrás; con la espalda recta, abre las piernas hacia los lados girando la cadera hacia
       fuera (las rodillas caen hacia los lados; los pies giran sin moverse apenas del sitio); y vuelve con control */
    COREO['abduccion-sentado-banda'] = (function () {
      var INC = -20, XM = 25, juntas = { suelo: [9, 48], abre: 3, polo: [0, 1, 0.15] }, abiertas = { suelo: [13, 46], abre: 30, polo: [1, 1.15, 0.1] };
      var P = function (y, w, p) { return { pel: [0, y, 0], giro: [0, INC, 0], cab: [8, 0, 0], p: p, b: { a: w, polo: [0.3, 0, -1] }, m: EN_SUELO }; };
      var ys = busca(function (y) { return troncoAPlano(resolver(P(y, [XM, ALTO_MUN, -22], juntas)), [0, 0, 0], [0, 1, 0]); }, -0.3, 7, 16);
      /* las manos, detrás: donde el brazo queda casi estirado (sin bloquear el codo) */
      var h = resolver(P(ys, [XM, ALTO_MUN, -22], juntas)).i.hom, w = [XM, ALTO_MUN, h[2] - busca(function (d) { return largo(menos(h, [XM, ALTO_MUN, h[2] - d])); }, D.brazo + D.antebrazo - 0.5, 0, 20)];
      return {
        vista: [[28, 18], [78, 12]], rastro: 'ri', esfuerzo: [0, 1], clavos: K4,
        material: [['banda', { lazos: [{ en: 'pantorrillas' }] }]],
        posturas: { a: P(ys, w, juntas), b: P(ys, w, abiertas) }, inicio: 'a',
        rep: [['b', 1.3, 'empuje'], ['b', 0.5], ['a', 1.7, 'freno'], ['a', 0.4]],
        pasos: ['a', { sec: [['b', 1.3, 'empuje']], desde: 'a' }, { rep: 1.3 }]
      };
    })();

    /* el puente de glúteos: la minibanda, alrededor de las pantorrillas; boca arriba, con las rodillas dobladas; sube la cadera en
       puente con la banda en tensión (los pies, algo más separados que la cadera, y las rodillas empujando hacia fuera); baja hasta
       rozar el suelo con la cadera (a un centímetro) y vuelve a subir. El puente, el del bloque 1 */
    COREO['puente-gluteos-banda'] = (function () {
      var pies = { suelo: [13, 62], abre: 6, polo: [0.28, 1, 0.2] }, manos = { a: [27, ALTO_MUN, 25], polo: [1, 0.2, 0] };
      var en = function (f) { return { pel: [0, 11.5 + 14.8 * f, 20 - 3.17 * f], giro: [0, -90 - 22 * f, 0], cab: [35 * f, 0, 0], p: pies, b: manos, m: EN_SUELO }; };
      return {
        vista: [[72, 16], [28, 30]], rastro: 'pel', esfuerzo: [2, 3], clavos: K4,
        material: [['banda', { lazos: [{ en: 'pantorrillas' }] }]],
        posturas: { a: en(0), b: en(1), r: en(0.07) }, inicio: 'b', encuadra: ['a', 'b'],
        rep: [['r', 1.6, 'freno'], ['r', 0.25], ['b', 1.2, 'empuje'], ['b', 0.6]],
        pasos: ['a', { sec: [['b', 1.2, 'empuje']], desde: 'a' }, { rep: 0.3 }]
      };
    })();

    /* la almeja: la banda, justo por encima de las rodillas; de lado, con las piernas dobladas una sobre otra; con los bordes de
       dentro de los pies juntos, gira hacia fuera la pierna de arriba hasta el final de su recorrido; la baja con control y, al
       terminar, cambia de lado (rueda sobre la espalda) y lo hace con la otra. Las posturas, las de la almeja del bloque 10 */
    COREO['almeja-banda'] = (function () {
      var CIN = { a: [16, 13, 6], en: 'pelvis', polo: [1, 0, -0.3] }, T8 = { tob: 8 }, PD = { a: [-13.5, 6.12, 53.95], polo: [-1, -0.08, -0.04] };
      var lado = { pel: [-12, 21.5, 0], giro: [-90, 0, -84], cab: [0, 0, -14], bi: CIN, mi: SUELTA, bd: { a: [-37.7, 2.7, -74.74], polo: [-2, -1.35, -26.89] }, md: { tipo: 'abierta', palma: [0, -1, 0], dedos: [-1, 0, -0.1] }, pd: PD, td: T8, ti: T8 };
      var a = sobre(lado, { pi: { a: [-13.5, 16.62, 53.95], polo: [-0.97, -0.21, -0.09] } }), b = sobre(lado, { pi: { a: [-13.5, 16.62, 53.95], polo: [-0.88, 0.47, 0.11] } });
      /* la vuelta: suelta la mano de abajo, rueda boca arriba con las piernas recogidas y sigue hasta el otro lado */
      var vq = sobre(a, { cab: [0, 0, -3], bd: { a: [-29.57, 25.02, -26.2], polo: [-25.96, -1.3, 7.3] }, md: { tipo: 'suelta', prono: 40 } });
      var vas = { pel: [-6, 17.4, 0], base: [[0.72, 0.7, 0.03], [0, 0.05, -1], [-0.7, 0.72, 0.04]], cab: [0, 0, 2], t: T8, m: { tipo: 'suelta', prono: 40 },
        bd: { a: [-3, 5, 16.5], en: 'torax', polo: [-0.25, -1, 0.4] }, bi: { a: [10, 3, 16], en: 'torax', polo: [0.5, -1, 0.3] }, p: { e: 54, z: 0, c: 96 } };
      var vsa = { pel: [6, 17.4, 0], base: [[0.72, -0.7, -0.03], [0, 0.05, -1], [0.7, 0.72, 0.04]], cab: [0, 0, -2], t: T8, m: { tipo: 'suelta', prono: 40 },
        bi: { a: [3, 5, 16.5], en: 'torax', polo: [0.25, -1, 0.4] }, bd: { a: [-10, 3, 16], en: 'torax', polo: [-0.5, -1, 0.3] }, p: { e: 54, z: 0, c: 96 } };
      var vs = { pel: [0, 11.5, 0], giro: [0, -90, 0], p: { suelo: [11, 45], abre: 4, polo: [0.1, 1, 0.2] }, t: T8, b: { a: [8, 5, 14.5], en: 'torax', polo: [0.8, -0.7, -0.5] }, m: { tipo: 'plana', prono: 70 } };
      return {
        vista: [[-40, 18], [-78, 16]], rastro: 'ri', esfuerzo: [0, 1], clavos: T2,
        material: [['banda', { lazos: [{ en: 'muslos' }] }]],
        posturas: { a: a, b: b, a2: refleja(a), b2: refleja(b), vq: vq, vas: vas, vsa: vsa, vs: vs, vq2: refleja(vq) }, inicio: 'a', encuadra: ['a', 'b', 'a2', 'vs'],
        rep: [['b', 1.3, 'suave'], ['b', 0.5], ['a', 1.7, 'freno'], ['a', 0.4]],
        pasos: ['a', 'rep', { sec: [['a', 1.3, 'freno', T2], ['vq', 0.42, 'suave', NADA], ['vas', 0.34, 'entra', NADA], ['vs', 0.32, 'lineal', NADA], ['vsa', 0.32, 'lineal', NADA], ['vq2', 0.34, 'sale', NADA], ['a2', 0.46, 'suave', NADA],
          ['a2', 0.3, null, T2], ['b2', 1.3, 'suave', T2], ['b2', 0.5, null, T2], ['a2', 1.7, 'freno', T2]], desde: 'b', dura: 7.6 }]
      };
    })();

    /* la patada de glúteo: a cuatro patas, con la banda sujeta al pie que trabaja (el derecho: lo rodea por el empeine y la planta,
       y sus dos cabos van a las manos, que los sujetan contra el suelo: el que va a la mano contraria pasa por dentro de la rodilla
       de apoyo, que en línea recta atravesaría); con la espalda plana, lleva el talón hacia atrás y hacia arriba; aprieta arriba y
       vuelve despacio. Las posturas, las de la patada en cuadrupedia del bloque 10 */
    COREO['patada-gluteo-banda'] = (function () {
      var KI = ['mi', 'md', 'ti'], PLANO = { punta: [0, -0.1, -1], arriba: [0, -1, 0.1] };
      var cuatro = { giro: [0, 81.6, 0], cab: [-10, 0, 0], pi: { a: [10, 7, -72], polo: [0, -1, 0.3] }, ti: PLANO, b: { a: [19, ALTO_MUN, 9.03], polo: [0.4, 0.2, -1] }, m: EN_SUELO };
      var a = sobre(cuatro, { pel: [0, 47, -34], pd: { a: [-10, 7, -72], polo: [0, -1, 0.3] }, td: PLANO });
      var b = sobre(cuatro, { pel: [2, 47, -34], pd: { a: [-10, 46, -111.6], polo: [0, -1, 0] }, td: { punta: [0, -0.77, -0.64], arriba: [0, -0.64, 0.77] } });
      return {
        vista: [[-78, 12], [-142, 22]], rastro: 'td', esfuerzo: [0, 1], clavos: K4,
        material: [['banda', { lazos: [{ en: 'pie-d' }], tiras: [{ de: 'lazo:0', por: [{ de: 'i', p: 'rod', mas: [-10, 8, 4] }], a: 'mano-i' }, { de: 'lazo:0', a: 'mano-d' }] }]],
        posturas: { a: a, b: b }, inicio: 'a',
        rep: [['b', 1.3, 'empuje', KI], ['b', 1, null, KI], ['a', 1.5, 'freno', KI], ['a', 0.3]],
        pasos: ['a', { sec: [['b', 1.3, 'empuje', KI]], desde: 'a' }, { rep: 1.3 }]
      };
    })();

    /* agachado, con las manos en la cintura: la cadera, a «y» cm del suelo y «atras» cm por detrás del punto (x, z); el tronco,
       inclinado lo justo para no caerse (erguido); los pies, donde se diga (cada uno, en el mundo) */
    function agachado(y, inc, x, z, pi, pd, extra) {
      return sobre({ pel: [x, y, z - (PIE - y) * 0.55], giro: [0, inc, 0], cab: [-inc * 0.8, 0, 0], pi: pi, pd: pd, b: { a: [16, 13, 6], en: 'pelvis', polo: [1, 0, -0.3] }, m: SUELTA }, extra || {});
    }
    function enSuelo(x, z, abre) { return { suelo: [x, z], abre: abre == null ? 3 : abre, polo: [x > 0 ? 0.12 : -0.12, 0.1, 1] }; }

    /* el paso lateral: la banda, alrededor de los tobillos; en media sentadilla, con los pies a la anchura de los hombros; sin salir
       de ella, da un paso amplio hacia un lado (el izquierdo) con la banda en tensión; acerca el otro pie, sin arrastrarlo, hasta
       recuperar la anchura de los hombros, con el tronco erguido y las puntas al frente. Y vuelve igual hacia el otro lado */
    COREO['paso-lateral-banda'] = (function () {
      var Y = 70, INC = 16, A = 17, PASO = 26;
      var en = function (x, pi, pd) { return agachado(Y, INC, x, 0, pi, pd); }, I = function (x) { return enSuelo(x, 0, 2); }, D2 = function (x) { return enSuelo(x, 0, 2); };
      var a = en(0, I(A), D2(-A)), w = en(PASO / 2, I(A + PASO), D2(-A)), a2 = en(PASO, I(A + PASO), D2(-A + PASO));
      var l1 = une(en(PASO * 0.3, null, D2(-A)), alAire('i', A + PASO * 0.5, 0, 6)), r1 = une(en(PASO * 0.7, I(A + PASO), null), alAire('d', -A + PASO * 0.5, 0, 6));
      var abre = [['l1', 0.5, 'entra'], ['w', 0.5, 'sale']], cierra = [['r1', 0.5, 'entra'], ['a2', 0.5, 'sale']], vuelveAbre = [['r1', 0.5, 'entra'], ['w', 0.5, 'sale']], vuelveCierra = [['l1', 0.5, 'entra'], ['a', 0.5, 'sale']];
      return {
        vista: [[24, 10], [-58, 10]], rastro: 'pel', clavos: T2,
        material: [['banda', { lazos: [{ en: 'tobillos' }] }]],
        posturas: { a: a, l1: l1, w: w, r1: r1, a2: a2 }, inicio: 'a', encuadra: ['a', 'w', 'a2'],
        pasos: ['a', { sec: abre, desde: 'a' },
          { sec: cierra.concat([['a2', 0.6]], vuelveAbre, [['w', 0.3]], vuelveCierra, [['a', 0.6]], abre, [['w', 0.3]], cierra, [['a2', 0.6]], vuelveAbre, [['w', 0.3]], vuelveCierra), desde: 'w', dura: 10 }]
      };
    })();

    /* el paso de monstruo: la banda, alrededor de los tobillos; en cuarto de sentadilla; sin subir, avanza con pasos en diagonal
       hacia delante (el pie pasa junto al otro y sale hacia delante y hacia fuera: los pies no se juntan nunca del todo); y vuelve
       caminando hacia atrás hasta el punto de partida, por donde vino */
    COREO['paso-monstruo-banda'] = (function () {
      var Y = 78, INC = 14, A = 18, B = 21, L = 26;
      var a = agachado(Y, INC, 0, 0, enSuelo(A, 0, 8), enSuelo(-A, 0, 8));
      var m1 = une(agachado(Y, INC, -2.5, L * 0.2, null, enSuelo(-A, 0, 8)), alAire('i', 12, L * 0.45, 5));
      var p1 = agachado(Y, INC, 1, L * 0.5, enSuelo(B, L, 8), enSuelo(-A, 0, 8));
      var m2 = une(agachado(Y, INC, 3, L * 0.85, enSuelo(B, L, 8), null), alAire('d', -12, L, 5));
      var p2 = agachado(Y, INC, 0, L * 1.5, enSuelo(B, L, 8), enSuelo(-B, L * 2, 8));
      var ida = [['m1', 0.55, 'entra'], ['p1', 0.55, 'sale'], ['p1', 0.3], ['m2', 0.55, 'entra'], ['p2', 0.55, 'sale']], vuelta = [['m2', 0.55, 'entra'], ['p1', 0.55, 'sale'], ['p1', 0.3], ['m1', 0.55, 'entra'], ['a', 0.55, 'sale']];
      return {
        vista: [[34, 14], [90, 8]], rastro: 'pel', clavos: T2,
        material: [['banda', { lazos: [{ en: 'tobillos' }] }]],
        posturas: { a: a, m1: m1, p1: p1, m2: m2, p2: p2 }, inicio: 'a', encuadra: ['a', 'p1', 'p2'],
        pasos: ['a', { sec: ida, desde: 'a' }, { sec: vuelta.concat([['a', 0.5]], ida, [['p2', 0.4]], vuelta), desde: 'p2', dura: 8.6 }]
      };
    })();

    /* ══════════════════════════════ SENTADO EN EL SUELO ══════════════════════════════
       La cadera, donde el tronco toca el suelo (se busca, como en los L-sit del bloque 12). El talón de la pierna estirada descansa
       en el suelo sea cual sea el ángulo del tobillo: la altura del tobillo se busca en cada postura con la zapatilla que se pinta
       (zapaAPlano: con la punta hacia arriba, lo más bajo es el contrafuerte del talón); la pierna entera sube o baja un par de
       grados desde la cadera, y la rodilla no se dobla */
    var ASIENTO = function (P) { return busca(function (y) { return troncoAPlano(resolver(P(y)), [0, 0, 0], [0, 1, 0]); }, -0.3, 7, 16); };
    /* el pie, con la punta a «teta» grados de la vertical (hacia delante, positivo: estirada; hacia la espinilla, negativo) */
    function pieA(teta) { var c = Math.cos(teta * RAD), s = Math.sin(teta * RAD); return { punta: [0, c, s], arriba: [0, s, -c] }; }
    /* sentado con una pierna estirada (la izquierda; la rodilla, sin doblar ni bloquear) y la otra recogida, con el pie en el suelo */
    function sentadoUna(inc, teta, extra) {
      var P = function (y, ya) { return sobre({ pel: [0, y, 0], giro: [0, inc, 0], pi: { a: [10, ya, 77.6], polo: [0, 1, 0] }, ti: pieA(teta), pd: { suelo: [-15, 33], abre: 12, polo: [-0.35, 1, 0.2] } }, extra || {}); };
      var ys = ASIENTO(function (y) { return P(y, 9); });
      return P(ys, busca(function (ya) { return zapaAPlano(resolver(P(ys, ya)).i, 'i', [0, 0, 0], [0, 1, 0]); }, -0.2, 3, 16));
    }

    /* el remo sentado: en el suelo, con las rodillas algo flexionadas y la banda por la planta de los pies, a la altura del arco (va de
       una mano al canto de fuera de un pie, cruza las dos plantas y vuelve a la otra mano); con la espalda neutra, tira hacia atrás
       doblando los codos, como si remara; junta los omóplatos sin encorvarse; y vuelve con suavidad. Los brazos, los del remo
       sentado en polea del bloque 4, 43 cm más abajo */
    COREO['remo-sentado-banda'] = (function () {
      var ASA = { tipo: 'puno', barra: [0, 1, 0], palma: [-1, 0, 0] }, PIE_R = pieA(20);
      var P = function (y, ya, inc, extra) { return sobre({ pel: [0, y, 0], giro: [0, inc, 0], p: { a: [9, ya, 76], polo: [0.1, 1, 0] }, t: PIE_R, m: ASA }, extra || {}); };
      var ys = ASIENTO(function (y) { return P(y, 8, 0); }), ya = busca(function (v) { return zapaAPlano(resolver(P(ys, v, 0)).i, 'i', [0, 0, 0], [0, 1, 0]); }, -0.2, 3, 16);
      var a = P(ys, ya, 5, { cab: [-2.5, 0, 0], hom: [0, 1.5], b: { a: [7.8, ys + 23.1, 50.65], polo: [1, -0.5, -0.2] } });
      var b = P(ys, ya, -4, { cab: [2, 0, 0], col: [-4, 0, 0], hom: [-1, -2.8], b: { a: [8.4, ys + 14.9, 5.1], polo: [0.3, -0.35, -1] } });
      return {
        vista: [[64, 12], [22, 20]], rastro: 'manos', esfuerzo: [0, 1], clavos: T2,
        material: [['banda', { tiras: [{ de: 'mano-i', por: ['canto-i:fuera', 'arco-i', 'canto-i:dentro', 'canto-d:dentro', 'arco-d', 'canto-d:fuera'], a: 'mano-d', asas: true, largo0: 90 }] }]],
        posturas: { a: a, b: b }, inicio: 'a',
        rep: [['b', 1.2, 'empuje'], ['b', 1], ['a', 1.9, 'freno'], ['a', 0.4]],
        pasos: ['a', { sec: [['b', 1.2, 'empuje']], desde: 'a' }, 'b', { rep: 2.2 }]
      };
    })();

    /* la flexión dorsal del tobillo: sentado erguido, con una pierna estirada (la izquierda) y, por el pie, una banda atada delante a
       un punto firme (el pie del poste: rodea el empeine y tira de él hacia delante); con la punta estirada, lleva los dedos hacia la
       espinilla moviendo solo el tobillo; y vuelve despacio, sin doblar ni bloquear la rodilla. Las manos, en el suelo, a los lados */
    COREO['flexion-dorsal-banda'] = (function () {
      var ZP = 150, H = 15, manos = { hom: [-1.5, 0], b: { a: [27, ALTO_MUN, -3], polo: [0.3, 0, -1] }, m: EN_SUELO }, K3 = ['mi', 'md', 'td'];
      var a = sentadoUna(0, 40, manos), b = sentadoUna(0, -14, manos);
      return {
        vista: [[70, 12], [28, 20]], rastro: 'tli', esfuerzo: [0, 1], clavos: K3,
        material: [['poste', { en: [10, ZP], alto: 110 }], ['banda', { lazos: [{ en: 'pie-i', a: 11.5 }, { en: [10, H, ZP], r: 3.7 }], tiras: [{ de: [10, H, ZP - 3.5], a: 'lazo:0' }] }]],
        posturas: { a: a, b: b }, inicio: 'a', encuadra: ['a'],
        rep: [['b', 1.2, 'empuje'], ['b', 0.6], ['a', 1.8, 'freno'], ['a', 0.4]],
        pasos: ['a', { sec: [['b', 1.2, 'empuje']], desde: 'a' }, { rep: 1.2 }]
      };
    })();

    /* la flexión plantar, sentado: con una pierna estirada (la izquierda) y la banda por la planta del pie (bajo los dedos), con un
       extremo en cada mano; con la rodilla recta, empuja la punta del pie hacia delante moviendo solo el tobillo; una breve pausa, y
       vuelve despacio. Las manos no se mueven. La postura, la del estiramiento de pantorrilla con toalla del bloque 8 */
    COREO['flexion-plantar-banda'] = (function () {
      var K3 = ['mi', 'md', 'td'], manos = { m: { tipo: 'puno', barra: [0, 0.35, 1], palma: [-1, 0, 0] }, bi: { a: [16, 31, 38], polo: [1, -0.6, -0.3] }, bd: { a: [4, 31, 38], polo: [-1, -0.6, -0.3] } };
      var a = sentadoUna(2, 6, manos), b = sentadoUna(2, 42, manos);
      return {
        vista: [[70, 12], [24, 22]], rastro: 'tli', esfuerzo: [0, 1], clavos: K3,
        material: [['banda', { tiras: [{ de: 'mano-i', por: ['canto-i:fuera:planta', 'planta-i', 'canto-i:dentro:planta'], a: 'mano-d', largo0: 70 }] }]],
        posturas: { a: a, b: b }, inicio: 'a', encuadra: ['a', 'b'],
        rep: [['b', 1.2, 'empuje'], ['b', 0.7], ['a', 1.8, 'freno'], ['a', 0.4]],
        pasos: ['a', { sec: [['b', 1.2, 'empuje']], desde: 'a' }, { rep: 1.2 }]
      };
    })();

    /* ══════════════════════════════ COLGADO DE LA BARRA ══════════════════════════════ */

    /* las dominadas asistidas: una banda gruesa, pasada por la barra; en el lazo de abajo mete un pie (el izquierdo: la otra pierna,
       doblada por detrás); agarra la barra, lleva los hombros abajo y atrás y hace una dominada normal: sube hasta pasar la cabeza
       por encima de la barra y baja despacio. La banda cuelga de la barra entre la cabeza y la mano de ese lado (no le tapa la
       cara), baja por delante del pecho y de la cadera hasta el pie, y se estira al bajar (más fina): cuanto más abajo, más ayuda. Las posturas, las de las dominadas del bloque 1 */
    COREO['dominadas-asistidas-banda'] = (function () {
      var YB = 225, base = { pi: { e: 14, z: 0, c: 10 }, ti: { punta: [0, -0.05, 1], arriba: [0, 1, 0.05] }, pd: { e: 4, z: 180, c: 64 }, td: { tob: 24 }, m: { tipo: 'puno', barra: [1, 0, 0], palma: [0, 0, 1] } };
      var a = sobre(base, { pel: [0, 120, -2], hom: [3.5, 0], b: { a: [28, 217, 0], polo: [1, -0.2, 0.5] } });
      var a2 = sobre(base, { pel: [0, 125.5, -2], hom: [-2, -1.5], col: [-3, 0, 0], b: { a: [28, 217, 0], polo: [1, -0.3, 0.4] } });
      var b = sobre(base, { pel: [0, 172, -11], giro: [0, -8, 0], hom: [-2, -1.5], col: [-3, 0, 0], cab: [6, 0, 0], b: { a: [28, 217, 0], polo: [1, -1, 0.1] } });
      var XB = 12, cabo = function (x, xp, canto) { return { de: [x, YB + 2.2, 1.5], por: [{ en: 'torax', a: [x, 12, 10.5] }, { en: 'pelvis', a: [xp, 2, 12] }], a: canto, ancho: 3.4, largo0: 100 }; };
      return {
        vista: [[30, 6], [96, 6]], rastro: 'barbilla', esfuerzo: [0], clavos: ['mi@0:28', 'md@0:-28'],
        material: [['barra_dominadas', { alto: YB, ancho: 62 }], ['banda', { lazos: [{ en: [XB, YB, 0], eje: [1, 0, 0], r: 2.5, ancho: 7.5 }],
          tiras: [cabo(XB + 1.8, 12.5, 'canto-i:fuera'), cabo(XB - 1.8, 8, 'canto-i:dentro'), { de: 'canto-i:fuera', por: ['arco-i'], a: 'canto-i:dentro', ancho: 3.4 }] }]],
        posturas: { a: a, a2: a2, b: b }, inicio: 'a2', encuadra: ['a', 'b'],
        rep: [['b', 1.3, 'empuje'], ['b', 0.5], ['a2', 1.9, 'freno'], ['a2', 0.45]],
        pasos: ['a', { sec: [['a2', 1, 'suave'], ['a2', 0.2], ['b', 1.3, 'empuje']], desde: 'a' }, { rep: 1.3 }, 'rep']
      };
    })();

    /* ══════════════════════════════ ENTRE LAS MANOS ══════════════════════════════
       La banda va de un puño al otro: se ve estirarse (y afinarse) cuando los separa */

    /* la separación de banda: la sujeta delante con las dos manos, los brazos estirados a la altura de los hombros y los codos un
       poco flexionados; junta los omóplatos y la separa abriendo los brazos hasta que toca o casi toca el pecho (los puños bajan
       un poco: la banda queda ante el esternón, a un dedo de él, y no en el cuello; los codos se doblan en horizontal: g 90); mantiene un momento y vuelve despacio */
    COREO['separacion-banda'] = (function () {
      var pies = { suelo: [11, 0], abre: 7 }, PR = { tipo: 'puno', prono: 90 };
      var a = { p: pies, b: { e: 90, z: 4, g: 90, c: 12 }, m: PR };
      var b = { p: pies, hom: [0, -2.6], b: { e: 84, z: 79, g: 90, c: 12 }, m: PR };
      return {
        vista: [[28, 8], [150, 10]], rastro: 'mi', esfuerzo: [0, 1], clavos: T2,
        material: [['banda', { tiras: [{ de: 'mano-i', a: 'mano-d', largo0: 33 }] }]],
        posturas: { a: a, b: b }, inicio: 'a', encuadra: ['a', 'b'],
        rep: [['b', 1.3, 'empuje'], ['b', 0.8], ['a', 1.8, 'freno'], ['a', 0.4]],
        pasos: ['a', { sec: [['b', 1.3, 'empuje']], desde: 'a' }, { rep: 1.3 }]
      };
    })();

    /* la rotación externa con la banda (o una bufanda) entre las manos: los codos, pegados al cuerpo y doblados a 90 grados; un
       extremo en cada mano; tira hacia fuera con una (la izquierda) sin despegar el codo, mientras la otra hace resistencia (no se
       mueve); vuelve y, al terminar, cambia de brazo. El codo queda en (21, 102,6, 1): la muñeca gira a 24 cm de él */
    COREO['rotacion-externa-hombro-bufanda'] = (function () {
      var pies = { suelo: [11, 0], abre: 7 }, Y = 102.6, POLO = [0.07, -1, 0.04];
      var ante = function (fi) { var s = Math.sin(fi * RAD), c = Math.cos(fi * RAD); return { b: { a: [21 + 24 * s, Y, 1 + 24 * c], polo: POLO }, m: { tipo: 'puno', barra: [0, 1, 0], palma: [-c, 0, s] } }; };
      var con = function (fi, fd) { var i = ante(fi), d = refleja({ bi: ante(fd).b, mi: ante(fd).m }); return { p: pies, bi: i.b, mi: i.m, bd: d.bd, md: d.md }; };
      var a = con(-22, -22), b = con(46, -22), b2 = con(-22, 46);
      return {
        vista: [[22, 12], [-22, 12]], rastro: 'mi', clavos: T2,
        material: [['banda', { tiras: [{ de: 'mano-i', a: 'mano-d', largo0: 22 }] }]],
        posturas: { a: a, b: b, b2: b2 }, inicio: 'a', encuadra: ['a', 'b', 'b2'],
        pasos: ['a', { sec: [['b', 1.5, 'suave']], desde: 'a' },
          { sec: [['b', 0.4], ['a', 2, 'freno'], ['a', 0.5], ['b2', 1.5, 'suave'], ['b2', 0.4], ['a', 2, 'freno']], desde: 'b', dura: 7.2 }]
      };
    })();

    /* la extensión de tríceps: de pie, con la banda sujeta con una mano detrás de la cintura (la derecha) y con la otra detrás de la
       nuca, algo tensa; sin mover la mano de abajo, estira el brazo de arriba por encima de la cabeza moviendo solo el codo; baja
       despacio y cambia de brazo (las manos pasan por los lados, con la banda siempre por detrás del cuerpo). El brazo de arriba,
       el de la extensión de tríceps a un brazo con mancuerna del bloque 7 */
    COREO['extension-triceps-banda'] = (function () {
      var pies = { suelo: [11, 0], abre: 7 }, ARR = [1.91, 26.92, 0.78];
      var abajo = { a: [-5, 103, -13.5], polo: [-1, -0.2, -0.5] };
      var con = function (w) { return { p: pies, hom: { i: [4, 0], d: [0, 0] }, cab: [8, 0, 0], m: NEU, bi: { a: w, polo: ARR }, bd: abajo }; };
      var a = con([7.31, 151.04, -16.63]), b = con([19.48, 184.16, -2.44]);
      var x = { p: pies, m: NEU, bi: { a: [32, 90, -18], polo: [0.3, 0.2, -1] }, bd: { a: [-32, 90, -18], polo: [-0.3, 0.2, -1] } };
      return {
        vista: [[118, 8], [60, 8]], rastro: 'mi', esfuerzo: [0], clavos: T2,
        material: [['banda', { tiras: [{ de: 'mano-i', a: 'mano-d', largo0: 46 }] }]],
        posturas: { a: a, b: b, x: x, a2: refleja(a), b2: refleja(b) }, inicio: 'a', encuadra: ['a', 'b', 'x'],
        rep: [['b', 1.3, 'empuje'], ['b', 0.35], ['a', 1.8, 'freno'], ['a', 0.4]],
        pasos: ['a', { sec: [['b', 1.3, 'empuje']], desde: 'a' },
          { sec: [['b', 0.3], ['a', 1.8, 'freno'], ['a', 0.3], ['x', 0.9, 'suave'], ['a2', 0.9, 'suave'], ['a2', 0.3], ['b2', 1.3, 'empuje'], ['b2', 0.35], ['a2', 1.8, 'freno']], desde: 'b', dura: 8.2 }]
      };
    })();

    /* ══════════════════════════════ CON EL ANTEBRAZO EN EL BANCO ══════════════════════════════
       De rodillas ante el banco, como en los ejercicios de muñeca del bloque 8 (el tronco inclinado y el antebrazo izquierdo sobre la
       tapa, con la muñeca por fuera del borde de delante). Aquí el banco le queda a la izquierda: termina a 8 cm del antebrazo, y por
       ese hueco pasa el otro brazo, que es el que sujeta la banda: por debajo de la muñeca, por encima o a su altura. La banda rodea la
       mano que trabaja (lazo 'mano-i') y va de ahí a la otra mano. Al empezar, la otra mano espera colgando, con su extremo. Se
       mira desde delante y desde su derecha, algo desde arriba: desde la izquierda, el banco tapa las manos */
    var ANTE_BANCO = { p: { a: [10, 3.6, -37.5], polo: [0.1, -1, 0.6] }, t: { punta: [0, -0.04, -1], arriba: [0, -1, 0.04] }, pel: [0, 44.69, -8], giro: [0, 42.48, 0], cab: [-19.12, 0, 0],
      bi: { a: [19, 48.2, 47.39], polo: [-1.5, -26.87, 2.12] }, md: { tipo: 'puno', barra: [0, 1, 0], palma: [1, 0, 0] } };
    var BANCO_IZQ = ['banco', { rumbo: 90, en: [46, 32], largo: 70 }], LAZO_MANO = ['banda', { lazos: [{ en: 'mano-i' }], tiras: [{ de: 'lazo:0', a: 'mano-d' }] }];
    var DEBAJO = [4, 33, 50], ENCIMA = [15, 68, 53], AL_LADO = [-4, 48.5, 52];
    /* la mano izquierda, como se diga; la derecha, con el puño en «donde» (o colgando, si no se dice) */
    function enElBanco(mi, donde) {
      var P = sobre(ANTE_BANCO, { mi: mi });
      return donde ? conAgarre(P, donde, [-1, -0.3, -0.4], 'bd') : sobre(P, { bd: { cuelga: [-2, 3], largo: 50 } });
    }

    /* la extensión de muñeca: el antebrazo, en el banco, con la palma hacia abajo y la muñeca por fuera del borde; con la otra mano
       sujeta el extremo de la banda por debajo de la muñeca, de modo que pase por el dorso de la mano; levanta la mano extendiendo
       la muñeca contra la banda y vuelve despacio a la posición neutra */
    COREO['extension-muneca-banda'] = (function () {
      var mano = function (mun) { return { tipo: 'puno', prono: 90, mun: mun }; };
      return {
        vista: [[-22, 26], [58, 18]], rastro: 'mi', esfuerzo: [0, 1], clavos: T2,
        material: [BANCO_IZQ, LAZO_MANO],
        posturas: { s: enElBanco(mano(0)), n: enElBanco(mano(0), DEBAJO), b: enElBanco(mano(-46), DEBAJO) }, inicio: 'n', encuadra: ['s'],
        rep: [['b', 1.1, 'empuje'], ['b', 0.45], ['n', 1.8, 'freno'], ['n', 0.4]],
        pasos: ['s', { sec: [['n', 1.4, 'suave']], desde: 's' }, 'rep']
      };
    })();

    /* la flexión de muñeca: el antebrazo, en el banco, con la palma hacia abajo y la muñeca por fuera del borde; con la otra mano
       sujeta, por encima de la muñeca, el extremo de una banda que pasa por la palma; baja la mano flexionando la muñeca contra la
       banda y vuelve despacio a la posición neutra */
    COREO['flexion-muneca-banda'] = (function () {
      var mano = function (mun) { return { tipo: 'puno', prono: 90, mun: mun }; };
      return {
        vista: [[-22, 26], [58, 18]], rastro: 'mi', esfuerzo: [0, 1], clavos: T2,
        material: [BANCO_IZQ, LAZO_MANO],
        posturas: { s: enElBanco(mano(0)), n: enElBanco(mano(0), ENCIMA), b: enElBanco(mano(46), ENCIMA) }, inicio: 'n', encuadra: ['s'],
        rep: [['b', 1.1, 'empuje'], ['b', 0.45], ['n', 1.8, 'freno'], ['n', 0.4]],
        pasos: ['s', { sec: [['n', 1.4, 'suave']], desde: 's' }, 'rep']
      };
    })();

    /* la desviación radial y cubital: el antebrazo, de lado en el banco, con el pulgar hacia arriba y la mano por fuera del borde;
       con la banda sujeta por encima de la muñeca, inclina la mano hacia el suelo contra su resistencia y vuelve; después la sujeta
       por debajo e inclina la mano hacia el techo */
    COREO['desviacion-radial-cubital-banda'] = (function () {
      var mano = function (lat) { return { tipo: 'puno', prono: 0, lat: lat }; };
      var veces = function (n, x) { return [[n, 1.3, 'suave'], [n, 0.2], [x, 1.2, 'empuje'], [x, 0.4], [n, 1.7, 'freno'], [n, 0.3], [x, 1.2, 'empuje'], [x, 0.4], [n, 1.7, 'freno']]; };
      return {
        vista: [[-22, 26], [58, 18]], rastro: 'mi', clavos: T2,
        material: [BANCO_IZQ, LAZO_MANO],
        posturas: { s: enElBanco(mano(0)), n1: enElBanco(mano(0), ENCIMA), u: enElBanco(mano(-32), ENCIMA), n2: enElBanco(mano(0), DEBAJO), r: enElBanco(mano(24), DEBAJO) }, inicio: 's', encuadra: ['s'],
        pasos: ['s', { sec: veces('n1', 'u'), desde: 's', dura: 8.6 }, { sec: veces('n2', 'r'), desde: 'n1', dura: 8.6 }]
      };
    })();

    /* la pronación y supinación: el antebrazo, de lado en el banco, con el pulgar hacia arriba y la muñeca por fuera del borde; con
       la otra mano sujeta una banda que pasa por la mano, a la altura de la muñeca; gira la palma hacia arriba contra la banda y
       vuelve despacio a la posición inicial */
    COREO['pronacion-supinacion-banda'] = (function () {
      var mano = function (pr) { return { tipo: 'puno', prono: pr }; };
      return {
        vista: [[-22, 26], [58, 18]], rastro: 'mi', esfuerzo: [0, 1], clavos: T2,
        material: [BANCO_IZQ, LAZO_MANO],
        posturas: { s: enElBanco(mano(0)), n: enElBanco(mano(0), AL_LADO), b: enElBanco(mano(-90), AL_LADO) }, inicio: 'n', encuadra: ['s'],
        rep: [['b', 1.4, 'suave'], ['b', 0.4], ['n', 1.8, 'freno'], ['n', 0.4]],
        pasos: ['s', { sec: [['n', 1.4, 'suave']], desde: 's' }, 'rep']
      };
    })();
  })();
    return {"sentadilla-con-banda": "39b1aaf9f678", "elevacion-talones-banda": "c67ba2fc1656", "curl-banda": "9f1da325e0ca", "curl-banda-alterno": "ed2688c7f39f", "curl-banda-cruzado": "4bb8d7cd8a05", "curl-banda-una-mano": "5b38825e7a5c", "elevacion-lateral-banda": "f8d8ae230850", "aperturas-banda-bajo-alto": "f78b5a997488", "curl-femoral-de-pie-banda": "ea9b6b82719f", "aperturas-banda": "a8452d74b589", "press-pecho-banda": "5db1e0d89b07", "face-pull-banda": "19044571508e", "remo-banda-anclada": "305e6279fd4b", "pajaros-banda": "a2a6d80e8b33", "rotacion-externa-banda": "e06eac696325", "retraccion-escapular-banda": "11a53ffee1e9", "peso-muerto-una-pierna-banda": "518f8f69e430", "extension-rodilla-pie-banda": "0febeb65537a", "lenador-inverso-banda": "37b05d130db1", "press-pallof-banda-rodillas": "1f0b3e9a1e0b", "apertura-inversa-rodillas": "2ee2d7481902", "abduccion-sentado-banda": "b123f210c398", "puente-gluteos-banda": "6e65d1be0a69", "almeja-banda": "48204c4b9f40", "patada-gluteo-banda": "3ff7bf8950c0", "paso-lateral-banda": "a01b730e78c8", "paso-monstruo-banda": "9375757dbe70", "remo-sentado-banda": "deb909ada498", "flexion-dorsal-banda": "3d264f7b6693", "flexion-plantar-banda": "9479c91c98a3", "dominadas-asistidas-banda": "791bbc3ce3dc", "separacion-banda": "268cf34a6ad3", "rotacion-externa-hombro-bufanda": "da1f4d624718", "extension-triceps-banda": "fd9f1e44b9cf", "extension-muneca-banda": "0248e8e50a09", "flexion-muneca-banda": "5df8a1e189ca", "desviacion-radial-cubital-banda": "644bc027d49f", "pronacion-supinacion-banda": "19deb0b43264"};
  });
})();
