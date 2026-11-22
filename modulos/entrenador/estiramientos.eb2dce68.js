/* modulos/entrenador/estiramientos.<huella>.js — Jérôme, el entrenador: las coreografías de «estiramientos» (30 ejercicios).
   Lo pide modulos/entrenador.js al abrir la ficha de uno de ellos (TG_ENTRENADOR.pedir); solo, no hace nada.
   <huella> son los 8 primeros caracteres del sha256 de este fichero: si cambia una coma, cambia el nombre, y cada
   motor pide los suyos. Recibe del motor lo que usa de él (N) y le devuelve las huellas de los pasos de sus fichas.

   NO EDITAR A MANO: lo hace tools/entrenador/construir.py con tools/entrenador/src/7f-estiramientos.js. */
(function () {
  'use strict';
  var T = window.TG_ENTRENADOR;
  if (!T || typeof T._trozo !== 'function') return;
  T._trozo('estiramientos', function (N) {
    var ALTO_MUN = N.ALTO_MUN, COREO = N.COREO, D = N.D, EN_SUELO = N.EN_SUELO, KM = N.KM, MATERIAL = N.MATERIAL, PIE = N.PIE,
        PIES_PUNTA = N.PIES_PUNTA, PLANA_PARED = N.PLANA_PARED, RAD = N.RAD, SUELTA = N.SUELTA, SUPINO_SUELO = N.SUPINO_SUELO,
        TOB_PUNTA = N.TOB_PUNTA, V = N.V, aLosLados = N.aLosLados, aUnBrazo = N.aUnBrazo, abre = N.abre, aplicar = N.aplicar, apoyada = N.apoyada,
        bajoZapa = N.bajoZapa, baseEjes = N.baseEjes, busca = N.busca, cabezaAPlano = N.cabezaAPlano, colgando = N.colgando, cruz = N.cruz,
        cuelga = N.cuelga, curva = N.curva, deTalon = N.deTalon, el = N.el, enSusMuslos = N.enSusMuslos, entre = N.entre, estirado = N.estirado,
        girar = N.girar, largo = N.largo, lejos = N.lejos, manoHacia = N.manoHacia, mas = N.mas, menos = N.menos, mezcla = N.mezcla, n2 = N.n2,
        plano = N.plano, por = N.por, porArco = N.porArco, punto = N.punto, refleja = N.refleja, reflejo = N.reflejo, resolver = N.resolver,
        signo = N.signo, sinParte = N.sinParte, sobre = N.sobre, tablaAlta = N.tablaAlta, une = N.une, unidad = N.unidad;
  /* ───────────────────────── las coreografías: ESTIRAMIENTOS SIN MATERIAL (bloque 16) ─────────────────────────
     Cuello, espalda alta, hombros, pecho, dorsal y brazos: las fichas nuevas de casa y de fuera que no piden nada (o una
     pared). Las mismas reglas que en 70-coreografias.js: cada una sale de los pasos verificados de su ficha y no añade
     técnica que la ficha no diga. Donde la ficha dice «de pie o sentado», de pie.
     Las manos entrelazadas: los dos puños juntos (las muñecas, a 7 cm una de otra). */
  (function () {
    var T2 = ['ti', 'td'];
    var BASE = { pel: [0, PIE, 0], p: { suelo: [10, 0], abre: 6 } }, SUELTO = { b: aLosLados(8), m: SUELTA };
    var DE = sobre(BASE, SUELTO), JUNTAS = { tipo: 'puno', prono: 0 };
    /* los dos brazos a un punto dicho desde el tórax (x, hacia cada lado; y, arriba: los hombros quedan a D.hombroY; z, delante) */
    function aTorax(x, y, z, polo) { return { a: [x, y, z], en: 'torax', polo: polo }; }
    var HY = D.hombroY;
    /* las dos manos, abiertas y al aire, con los dedos hacia «dedos» y la palma hacia «palma» (dichos para la izquierda; la derecha, reflejada) */
    function manos(P, dedos, palma, tipo) {
      return sobre(P, { mi: manoHacia(P, 'i', dedos, palma, tipo || 'abierta'), md: manoHacia(P, 'd', [-dedos[0], dedos[1], dedos[2]], [-palma[0], palma[1], palma[2]], tipo || 'abierta') });
    }

    /* el pecho, con las manos entrelazadas a la espalda: de pie, entrelaza los dedos detrás de la espalda; con los brazos rectos, los
       levanta por detrás, hacia arriba y hacia atrás; mantiene y relaja */
    COREO['estiramiento-pecho-manos-entrelazadas-espalda'] = (function () {
      var a = sobre(BASE, { b: aTorax(3.5, HY - 46, -15, [1, -0.1, -0.7]), m: JUNTAS, hom: [0, -1.5] });
      var b = sobre(BASE, { b: aTorax(3.5, HY - 36, -33, [1, 0.2, -0.6]), m: JUNTAS, hom: [0, -3], col: [-5, 0, 0], cab: [-4, 0, 0] });
      return {
        vista: [[112, 10], [156, 14]], isometrico: 'b', clavos: T2,
        posturas: { de: DE, a: a, b: b }, inicio: 'de', encuadra: ['de', 'b'],
        pasos: [{ sec: [['de', 0.6], ['a', 1.6, 'suave']], desde: 'de' }, { sec: [['b', 1.9, 'suave']], desde: 'a' },
                { sec: [['b', 2.2], ['a', 1.5, 'suave']], desde: 'b' }]
      };
    })();

    /* los brazos arriba con las manos unidas: entrelaza las manos delante del cuerpo; estira los brazos hacia arriba, como si quisiera
       tocar el techo, hasta que las manos quedan por encima de la cabeza; mantiene y relaja */
    var DELANTE_BAJO = aTorax(3.5, HY - 38, 15, [1, -0.3, 0.1]);
    function arriba_(x) { return aTorax(x, HY + 48.5, 1, [1, 0.1, 0.5]); }
    COREO['estiramiento-brazos-arriba-manos-entrelazadas'] = (function () {
      var a = sobre(BASE, { b: DELANTE_BAJO, m: JUNTAS });
      var m = sobre(BASE, { b: aTorax(3.5, HY + 4, 30, [1, -0.5, 0.2]), m: JUNTAS });
      var b = sobre(BASE, { b: arriba_(3.5), m: JUNTAS, hom: [3, 0], cab: [-3, 0, 0] });
      return {
        vista: [[24, 10], [96, 10]], isometrico: 'b', clavos: T2, zoom: 0.9,
        posturas: { de: DE, a: a, m: m, b: b }, inicio: 'de', encuadra: ['de', 'b'],
        pasos: [{ sec: [['de', 0.6], ['a', 1.4, 'suave']], desde: 'de' }, { sec: [['m', 0.9, 'entra'], ['b', 1.1, 'sale']], desde: 'a' },
                { sec: [['b', 2.2], ['m', 1.0, 'entra'], ['a', 0.9, 'sale']], desde: 'b' }]
      };
    })();

    /* el costado, con los brazos arriba: de pie, con las piernas algo separadas, entrelaza las manos y sube los brazos rozando las orejas;
       sin bajarlos, inclina el tronco hacia un lado; mantiene y repite hacia el otro */
    COREO['estiramiento-lateral-brazos-arriba'] = (function () {
      var pies = { pel: [0, PIE - 0.6, 0], p: { suelo: [15, 0], abre: 8 } };
      var s = sobre(pies, SUELTO), a = sobre(pies, { b: arriba_(3.5), m: JUNTAS, hom: [3, 0] });
      var m = sobre(pies, { b: aTorax(3.5, HY + 4, 30, [1, -0.5, 0.2]), m: JUNTAS });
      /* hacia su derecha: la cadera se va un poco al otro lado; se mira hacia dónde inclina la curva de la columna */
      var lado = function (g) { return sobre(pies, { pel: [g > 0 ? 3.5 : -3.5, PIE - 1.2, 0], col: [0, g, 0], cab: [0, 0, 0], b: arriba_(3.5), m: JUNTAS, hom: [3, 0] }); };
      var der = resolver(lado(24)).cab[0] < resolver(lado(-24)).cab[0] ? 24 : -24, l = lado(der), l2 = lado(-der);
      return {
        vista: [[14, 10], [-30, 12]], isometrico: 'l', clavos: T2, zoom: 0.9,
        posturas: { s: s, m: m, a: a, l: l, l2: l2 }, inicio: 's', encuadra: ['s', 'l', 'l2'],
        pasos: [{ sec: [['s', 0.5], ['m', 1.0, 'entra'], ['a', 1.1, 'sale']], desde: 's' }, { sec: [['l', 2.0, 'suave']], desde: 'a' },
                { sec: [['l', 1.0], ['a', 1.3, 'suave'], ['l2', 1.8, 'suave']], desde: 'l' }]
      };
    })();

    /* los codos, con las manos en la nuca: de pie y erguido, dobla los codos y apoya las manos en la parte de atrás de la cabeza; y abre
       los codos hacia los lados (los omóplatos bajan y se acercan) */
    COREO['apertura-codos-manos-nuca'] = (function () {
      var mano = { tipo: 'suelta', palma: [0, 0, 1] };
      var a = sobre(BASE, { b: aTorax(7, 37, -7.5, [0.55, 0.05, 1]), m: mano, cab: [3, 0, 0] });
      var b = sobre(BASE, { b: aTorax(8, 37, -8, [1, 0.15, -0.3]), m: mano, hom: [-1.2, -3], col: [-3, 0, 0] });
      return {
        vista: [[20, 12], [150, 14]], isometrico: 'b', clavos: T2,
        posturas: { de: DE, a: a, b: b }, inicio: 'de', encuadra: ['de', 'b'],
        pasos: [{ sec: [['de', 0.6], ['a', 1.8, 'suave']], desde: 'de' }, { sec: [['b', 2.0, 'suave']], desde: 'a' }]
      };
    })();

    /* la espalda alta, con las manos delante: de pie, las manos entrelazadas delante; gira las manos para que las palmas miren al suelo
       y sube los brazos a la altura del pecho; y empuja las palmas lejos del cuerpo */
    COREO['estiramiento-espalda-alta-manos-delante'] = (function () {
      var a = sobre(BASE, { b: DELANTE_BAJO, m: JUNTAS });
      var g = manos(sobre(BASE, { b: aTorax(5, HY - 37, 16, [1, -0.3, 0.1]) }), [-1, 0, 0], [0, -1, 0]);
      var c = manos(sobre(BASE, { b: aTorax(5, HY - 5, 30, [1, -0.6, 0]) }), [-1, 0, 0], [0, 0, 1]);
      var b = manos(sobre(BASE, { b: aTorax(5, HY - 4, 46.5, [1, -0.5, 0]), hom: [0, 4], col: [9, 0, 0], cab: [8, 0, 0] }), [-1, 0, 0], [0, 0, 1]);
      return {
        vista: [[70, 10], [20, 12]], isometrico: 'b', clavos: T2,
        posturas: { de: DE, a: a, g: g, c: c, b: b }, inicio: 'a', encuadra: ['de', 'b'],
        pasos: [{ sec: [['de', 0.6], ['a', 1.5, 'suave']], desde: 'de' }, { sec: [['g', 0.9, 'suave'], ['c', 1.4, 'suave']], desde: 'a' }, { sec: [['b', 1.9, 'suave']], desde: 'c' }]
      };
    })();

    /* el cuello, girando la cabeza: gira la cabeza hacia un lado hasta notar cierta tensión; mantiene, hace una pausa y repite hacia el otro */
    COREO['giro-cabeza-estiramiento'] = (function () {
      var g = sobre(DE, { cab: [0, 58, 0] }), g2 = sobre(DE, { cab: [0, -58, 0] });
      return {
        vista: [[8, 10], [-36, 12]], isometrico: 'g', clavos: T2,
        posturas: { a: DE, g: g, g2: g2 }, inicio: 'a', encuadra: ['a'],
        pasos: [{ sec: [['a', 0.6], ['g', 1.9, 'suave']], desde: 'a' }, { sec: [['g', 1.4], ['a', 1.2, 'suave'], ['a', 0.5], ['g2', 1.9, 'suave']], desde: 'g' }]
      };
    })();

    /* separar y juntar los omóplatos: los brazos estirados hacia delante a la altura de los hombros, como si sujetara una caja; y, sin
       doblar los codos, separa y junta los omóplatos */
    COREO['separar-juntar-omoplatos-brazos-al-frente'] = (function () {
      var con = function (h, z, extra) { return manos(sobre(BASE, sobre({ b: aTorax(D.hombroX - 1, HY - 1, z, [1, -0.5, 0]), hom: [0, h] }, extra || {})), [0, 0, 1], [-1, 0, 0]); };
      return {
        vista: [[72, 12], [156, 30]], rastro: 'manos', esfuerzo: [0, 2], clavos: T2,
        posturas: { de: DE, a: con(0, 49), p: con(4, 52.6, { col: [4, 0, 0] }), r: con(-3.6, 46) }, inicio: 'r', encuadra: ['de', 'p'],
        rep: [['p', 1.1, 'suave'], ['p', 0.45], ['r', 1.3, 'suave'], ['r', 0.45]],
        pasos: [{ sec: [['de', 0.6], ['a', 1.6, 'suave']], desde: 'de' }, 'rep']
      };
    })();

    /* las tijeras de brazos: de pie, levanta los brazos al frente a la altura de los hombros y los cruza; después lleva los codos hacia
       atrás y aprieta los omóplatos */
    COREO['tijeras-brazos-omoplatos'] = (function () {
      var mano = { tipo: 'suelta', palma: [0, -1, 0] };
      var x = sobre(BASE, { bi: aTorax(-9, HY - 3, 45, [1, -0.5, 0]), bd: { a: [9, HY + 1, 43.5], en: 'torax', polo: [-1, -0.5, 0] }, m: mano, hom: [0, 2] });
      var r = sobre(BASE, { b: aTorax(26, HY - 3, 9, [0.7, -0.15, -1]), m: mano, hom: [0, -3.6], col: [-3, 0, 0] });
      return {
        vista: [[30, 14], [150, 26]], rastro: 'manos', esfuerzo: [0], clavos: T2,
        posturas: { de: DE, x: x, r: r }, inicio: 'x', encuadra: ['de', 'x', 'r'],
        rep: [['r', 1.1, 'suave'], ['r', 0.6], ['x', 1.2, 'suave'], ['x', 0.4]],
        pasos: [{ sec: [['de', 0.6], ['x', 1.6, 'suave']], desde: 'de' }, 'rep']
      };
    })();

    /* los círculos de codos: las manos sobre los hombros; y círculos con los codos hacia delante y después hacia atrás.
       Se dice el codo (hacia dónde apunta el brazo en cada punto del círculo: abajo y algo hacia fuera, atrás, arriba, delante; por
       detrás, menos: el hombro no da más) y de él sale la muñeca: con el codo doblado del todo queda a RW del hombro, del lado de G
       (arriba y delante), y la mano, doblada hacia el hombro (prono −90: la palma mira al hueco del codo). Con la muñeca quieta en
       un punto junto al cuello, como estaba el 22-11-2026, el codo solo podía andar por un círculo pegado a la cabeza: los
       antebrazos se cruzaban delante del pecho y pasaban por el cuello (9 cm dentro de la cabeza) */
    COREO['circulos-codos-manos-hombros'] = (function () {
      var P = { de: DE }, ida = [], vuelta = [], i, N = 8, T = 0.3, mano = { tipo: 'suelta', prono: -90, mun: 60 };
      var RW = 12, cf = (D.brazo * D.brazo + RW * RW - D.antebrazo * D.antebrazo) / (2 * D.brazo * RW), sf = Math.sqrt(1 - cf * cf), G = [-0.2, 0.75, 0.6];
      for (i = 0; i < N; i++) {
        var f = (-90 - i * 360 / N) * RAD, z = Math.cos(f);
        var e = unidad([0.55 - 0.35 * Math.min(0, z), 0.9 * Math.sin(f), z > 0 ? 0.85 * z : 0.42 * z]);
        var n = unidad(menos(G, por(e, punto(G, e)))), w = mas(por(e, RW * cf), por(n, RW * sf));
        P['c' + i] = sobre(BASE, { b: aTorax(D.hombroX + w[0], HY + w[1], w[2], e), m: mano });
      }
      for (i = 1; i <= N; i++) { ida.push(['c' + (i % N), T, 'lineal']); vuelta.push(['c' + ((N - i) % N), T, 'lineal']); }
      return {
        vista: [[58, 12], [14, 12]], rastro: 'ci', clavos: T2,
        posturas: P, inicio: 'c0', encuadra: ['de', 'c0', 'c4'],
        pasos: [{ sec: [['de', 0.6], ['c0', 1.7, 'suave']], desde: 'de' }, { sec: ida.concat(ida, [['c0', 0.5]], vuelta, vuelta), desde: 'c0', dura: 10.4 }]
      };
    })();

    /* las letras T y L: abre los brazos en cruz (una T), con los pulgares hacia atrás; después forma una L: los codos doblados y pegados
       al cuerpo, con los pulgares hacia atrás; y mantiene cada posición */
    COREO['letras-t-l-brazos'] = (function () {
      var t = manos(sobre(BASE, { b: aTorax(D.hombroX + 49.5, HY, -1, [0, -1, -0.4]), hom: [0, -2] }), [1, 0, 0], [0, 1, 0]);
      var l = manos(sobre(BASE, { b: aTorax(D.hombroX + 24, HY - 26.5, 6, [0.15, -1, -0.5]), hom: [0, -2] }), [1, 0, 0.2], [0, 1, 0]);
      return {
        vista: [[16, 12], [150, 24]], isometrico: 't', clavos: T2,
        posturas: { de: DE, t: t, l: l }, inicio: 'de', encuadra: ['de', 't'],
        pasos: [{ sec: [['de', 0.6], ['t', 1.8, 'suave']], desde: 'de' }, { sec: [['l', 1.9, 'suave']], desde: 't' },
                { sec: [['l', 1.4], ['t', 1.7, 'suave'], ['t', 1.4], ['l', 1.7, 'suave']], desde: 'l', dura: 6.6 }]
      };
    })();

    /* las letras Y y W (el candelabro): una Y con los brazos estirados hacia arriba, los pulgares hacia atrás; después una W: los codos
       doblados y pegados al cuerpo y los antebrazos hacia arriba, también con los pulgares hacia atrás; y mantiene cada posición */
    COREO['letras-y-w-candelabro'] = (function () {
      var y = manos(sobre(BASE, { b: aTorax(D.hombroX + 25, HY + 43.5, -1, [1, -0.3, -0.5]), hom: [2, -1.5] }), [0.5, 0.87, 0], [-0.87, 0.5, 0]);
      var w = manos(sobre(BASE, { b: aTorax(D.hombroX + 11, HY - 4, 2, [0.3, -1, -0.45]), hom: [-1, -2.5] }), [0.2, 0.98, 0], [0.98, -0.2, 0]);
      return {
        vista: [[16, 12], [150, 24]], isometrico: 'y', clavos: T2, zoom: 0.9,
        posturas: { de: DE, y: y, w: w }, inicio: 'de', encuadra: ['de', 'y'],
        pasos: [{ sec: [['de', 0.6], ['y', 1.9, 'suave']], desde: 'de' }, { sec: [['w', 1.9, 'suave']], desde: 'y' },
                { sec: [['w', 1.4], ['y', 1.7, 'suave'], ['y', 1.4], ['w', 1.7, 'suave']], desde: 'w', dura: 6.6 }]
      };
    })();

    /* la marcha de dedos por una pared imaginaria: imagina una pared justo delante; sube los dedos por ella, como si caminaran, hasta
       tener los brazos por encima de la cabeza; mantiene y los baja igual de despacio; después intenta tocarse las manos por detrás de
       la espalda, buscando con cada mano el codo contrario. Al subir, una mano va siempre un paso por delante de la otra */
    COREO['marcha-dedos-movilidad-hombros'] = (function () {
      var en = function (y, z, d) {
        return manos(sobre(BASE, { bi: aTorax(12.5, HY + y + d, z, [1, -0.8, 0]), bd: { a: [-12.5, HY + y - d, z], en: 'torax', polo: [-1, -0.8, 0] }, cab: [-Math.max(0, y) * 0.22, 0, 0] }), [0, 1, 0], [0, 0, 1]);
      };
      var t = sobre(BASE, { bi: aTorax(-9, HY - 27, -11.5, [1, -0.4, -0.7]), bd: { a: [9, HY - 23.5, -11.5], en: 'torax', polo: [-1, -0.4, -0.7] }, m: SUELTA, hom: [0, -2] });
      return {
        vista: [[64, 10], [150, 14]], isometrico: 'w4', clavos: T2, zoom: 0.9,
        posturas: { de: DE, w0: en(-8, 40, 0), w1: en(6, 42, 2.6), w2: en(20, 40, -2.6), w3: en(34, 33, 2.6), w4: en(47, 13, 0), t: t }, inicio: 'de', encuadra: ['de', 'w4'],
        pasos: [{ sec: [['de', 0.6], ['w0', 1.7, 'suave']], desde: 'de' },
                { sec: [['w1', 0.7, 'suave'], ['w2', 0.7, 'suave'], ['w3', 0.7, 'suave'], ['w4', 0.8, 'suave'], ['w4', 2.4], ['w3', 0.8, 'suave'], ['w2', 0.7, 'suave'], ['w1', 0.7, 'suave'], ['w0', 0.7, 'suave']], desde: 'w0' },
                { sec: [['de', 1.3, 'suave'], ['t', 2.0, 'suave']], desde: 'w0' }]
      };
    })();

    /* los círculos de muñeca con los dedos entrelazados: entrelaza los dedos de las dos manos; y hace círculos con las muñecas en un
       sentido y después en el contrario. Las manos van juntas: lo que una muñeca se dobla hacia la palma, la otra, hacia el dorso */
    COREO['circulos-munecas-dedos-entrelazados'] = (function () {
      var P = { de: DE }, ida = [], vuelta = [], i, N = 8, T = 0.28;
      for (i = 0; i < N; i++) {
        var f = i * 2 * Math.PI / N, mu = 30 * Math.sin(f), la = 20 * Math.cos(f);
        P['c' + i] = sobre(BASE, { b: aTorax(3.5, HY - 15, 21, [1, -0.8, 0.1]), mi: { tipo: 'puno', prono: 0, mun: mu, lat: la }, md: { tipo: 'puno', prono: 0, mun: -mu, lat: la } });
      }
      for (i = 1; i <= N; i++) { ida.push(['c' + (i % N), T, 'lineal']); vuelta.push(['c' + ((N - i) % N), T, 'lineal']); }
      return {
        vista: [[22, 12], [70, 12]], rastro: 'manos', clavos: T2,
        posturas: P, inicio: 'c0', encuadra: ['de'],
        pasos: [{ sec: [['de', 0.6], ['c0', 1.6, 'suave']], desde: 'de' }, { sec: ida.concat(ida, [['c0', 0.5]], vuelta, vuelta), desde: 'c0', dura: 9.8 }]
      };
    })();

    /* la oración invertida: junta el dorso de las manos y de los dedos delante de la cintura, con los dedos hacia el suelo; sube las manos
       hacia el techo, de modo que los codos se separan y los dedos siguen apuntando al suelo; mantiene y baja */
    COREO['estiramiento-oracion-invertida'] = (function () {
      var en = function (y, polo) { return manos(sobre(BASE, { b: aTorax(2.4, y, 15, polo) }), [0, -1, 0], [1, 0, 0], 'plana'); };
      var a = en(HY - 30, [1, -0.3, -0.4]), b = en(HY - 13, [1, 0.05, -0.2]);
      return {
        vista: [[24, 12], [78, 12]], isometrico: 'b', clavos: T2,
        posturas: { de: DE, a: a, b: b }, inicio: 'de', encuadra: ['de', 'b'],
        pasos: [{ sec: [['de', 0.6], ['a', 1.7, 'suave']], desde: 'de' }, { sec: [['b', 2.0, 'suave']], desde: 'a' }, { sec: [['b', 2.0], ['a', 1.7, 'suave']], desde: 'b' }]
      };
    })();

    /* los giros de muñeca con el codo pegado: de pie, el codo doblado en ángulo recto y pegado al costado, la mano abierta y el pulgar
       hacia arriba; gira la mano hasta que la palma mira hacia arriba y mantiene; vuelve con el pulgar hacia arriba, gira la palma
       hacia el suelo y mantiene; al terminar, cambia de mano */
    COREO['rotaciones-muneca'] = (function () {
      var con = function (pr) { return sobre(BASE, { bi: aTorax(D.hombroX + 2, HY - 26.5, 23.5, [0.25, -1, -0.35]), mi: { tipo: 'abierta', prono: pr }, bd: aLosLados(8), md: SUELTA }); };
      var n = con(0), u = con(-86), d = con(86);
      return {
        vista: [[52, 14], [-40, 14]], isometrico: 'u', clavos: T2,
        posturas: { de: DE, n: n, u: u, d: d, n2: refleja(n) }, inicio: 'de', encuadra: ['de', 'n'],
        pasos: [{ sec: [['de', 0.6], ['n', 1.6, 'suave']], desde: 'de' }, { sec: [['u', 1.4, 'suave']], desde: 'n' },
                { sec: [['u', 0.9], ['n', 1.0, 'suave'], ['d', 1.2, 'suave'], ['d', 1.3], ['n', 0.9, 'suave'], ['de', 1.0, 'suave'], ['n2', 1.3, 'suave']], desde: 'u', dura: 8.0 }]
      };
    })();

    /* ══════════════════════════════ EN EL SUELO ══════════════════════════════ */
    var K4 = T2.concat(['mi', 'md']);
    /* a cuatro patas (como en 7b-abdomen.js): las rodillas, bajo la cadera (a 7 cm del suelo) y los empeines apoyados; los brazos,
       estirados hasta las muñecas w (apoyadas): se busca la inclinación del tronco que deja el hombro a un brazo justo de la mano */
    var ZR4 = -34, EMPEINE = { punta: [0, -0.1, -1], arriba: [0, -1, 0.1] }, CODO4 = [0.4, 0.2, -1];
    function aCuatroEn(w, extra, lo, hi) {
      return aUnBrazo(function (cab) { return sobre({ pel: [0, 47, ZR4], giro: [0, cab, 0], cab: [-10, 0, 0], p: { a: [10, 7, ZR4 - 38], polo: [0, -1, 0.3] }, t: EMPEINE, b: { a: w, polo: CODO4 }, m: EN_SUELO }, extra || {}); }, w, lo || 40, hi || 110);
    }
    /* con las manos justo bajo los hombros (o «dz» cm por delante de ellos) */
    var Z_HOMBRO4 = resolver(aCuatroEn([19, ALTO_MUN, ZR4 + 43], null, 55, 89)).i.hom[2];
    function aCuatro(dz, extra) { return aCuatroEn([19, ALTO_MUN, Z_HOMBRO4 + (dz || 0)], extra); }

    /* ── la V invertida (el perro boca abajo) ── Las manos, en w, y las bolas de los pies, en z = ZB, no se mueven: el talón sube «g»
       grados sobre ellas (70, de puntillas, como en la plancha; 0, plano) y el tobillo va con él (deTalon). La cadera, a «L» del tobillo
       (77.95, las piernas estiradas; menos, las rodillas dobladas); el tronco baja desde ella a «beta» grados de la horizontal (con −20
       es una plancha); y los brazos, estirados: se busca la inclinación de las piernas que deja el hombro a un brazo justo de la mano */
    var CODO_V = [0.5, 0.65, 0.6];
    function enV(w, ZB) {
      return function (beta, g, extra, L) {
        var dt = deTalon(g), ya = D.tobillo + dt[1], za = ZB - D.bola + dt[0], s = Math.sin(g * RAD), c = Math.cos(g * RAD);
        L = L || 77.95;
        return aUnBrazo(function (fi) {
          return sobre({ pel: [0, ya + L * Math.sin(fi * RAD), za + L * Math.cos(fi * RAD)], giro: [0, 90 + beta, 0], p: { a: [10, ya, za], polo: [0, -0.64, 0.77] },
            t: { punta: [0, -s, c], arriba: [0, c, s], flex: g }, b: { a: w, polo: CODO_V }, m: EN_SUELO }, extra || {});
        }, w, -30, 85);
      };
    }

    /* el perro boca abajo: a cuatro patas, con las manos a la anchura de los hombros (algo por delante de ellos); mete los dedos de los
       pies (los levanta un momento del suelo) y sube la cadera hacia arriba y hacia atrás; estira la espalda, con la cabeza y el cuello
       relajados, y baja los talones hacia el suelo; y mantiene. Las manos y las bolas de los pies no se mueven. La cabeza no cuelga
       del todo: es grande (33,5 cm del cuello a la coronilla, y el tupé) y, con los hombros a 45 cm del suelo, colgando lo tocaría;
       queda entre los brazos, 6 cm por encima de él */
    COREO['perro-boca-abajo'] = (function () {
      var a = aCuatro(9), w = a.b.a, TZ = ZR4 - Math.sqrt(D.pierna * D.pierna - 49), ZB = TZ - deTalon(70)[0] + D.bola, V = enV(w, ZB);
      var t1 = sobre(a, { p: { a: [10, 22, ZR4 - Math.sqrt(D.pierna * D.pierna - 225)], polo: [0, -1, 0.3] }, t: { punta: [0, -0.866, -0.5], arriba: [0, -0.5, 0.866] } });
      var a1 = sobre(a, { p: { a: [10, TOB_PUNTA, TZ], polo: [0, -1, 0.3] }, t: PIES_PUNTA });
      var k = V(20, 66, { cab: [-10, 0, 0] }, 63), b = V(40, 44, { cab: [-8, 0, 0] }), c = V(46, 16, { cab: [-18, 0, 0] });
      return {
        vista: [[-78, 12], [-136, 22]], rastro: 'pel', isometrico: 'c', clavos: K4,
        posturas: { a: a, t1: t1, a1: a1, k: k, b: b, c: c }, inicio: 'a', encuadra: ['a', 'c'],
        pasos: ['a', { sec: [['t1', 0.45, 'entra', ['mi', 'md']], ['a1', 0.45, 'sale', ['mi', 'md']], ['a1', 0.25], ['k', 0.9, 'entra'], ['b', 1.1, 'sale']], desde: 'a' },
                { sec: [['c', 2.2, 'suave']], desde: 'b' }, 'c']
      };
    })();

    /* el perro boca abajo desde la plancha: en plancha alta, con los hombros justo encima de las manos; lleva la cadera atrás y arriba
       con los brazos y las piernas estirados, mete la cabeza entre los hombros y lleva los talones hacia el suelo, hasta formar una V
       invertida con la espalda plana; y vuelve a la plancha. Las manos y las bolas de los pies no se mueven */
    COREO['perro-boca-abajo-desde-plancha'] = (function () {
      var ZB = -100 - deTalon(70)[0] + D.bola, pl0 = function (z) { return tablaAlta([19, ALTO_MUN, z], [0.5, 0.2, -1]); };
      var z1 = resolver(pl0(14)).i.hom[2], w = [19, ALTO_MUN, resolver(pl0(z1)).i.hom[2]], V = enV(w, ZB);
      var pl = tablaAlta(w, [0.5, 0.2, -1]), bp = 90 - pl.giro[1];
      var P = { pl: sobre(V(-bp, 70, { cab: [-16, 0, 0] }), {}), m1: V(-bp + 19, 60, { cab: [-14, 0, 0] }), m2: V(-bp + 38, 48, { cab: [-12, 0, 0] }), v: V(37, 33, { cab: [-12, 0, 0] }) };
      return {
        vista: [[-80, 10], [-138, 22]], rastro: 'pel', esfuerzo: [0, 1, 2], clavos: K4,
        posturas: P, inicio: 'pl', encuadra: ['pl', 'v'],
        rep: [['m1', 0.55, 'entra'], ['m2', 0.5, 'lineal'], ['v', 0.75, 'sale'], ['v', 1.2], ['m2', 0.75, 'entra'], ['m1', 0.5, 'lineal'], ['pl', 0.6, 'sale'], ['pl', 0.7]],
        pasos: ['pl', { sec: [['m1', 0.7, 'entra'], ['m2', 0.6, 'lineal'], ['v', 0.9, 'sale']], desde: 'pl' }, 'v', { rep: 1.8 }]
      };
    })();

    /* los antebrazos, a cuatro patas: de rodillas, con los brazos estirados y las manos apoyadas en el suelo con las muñecas giradas (los
       dedos, hacia las rodillas); lleva el cuerpo hacia atrás (la cadera gira sobre las rodillas, que no se mueven) sin despegar las
       manos; y mantiene */
    COREO['estiramiento-antebrazos-rodillas-manos-suelo'] = (function () {
      var GIRADA = apoyada([0, 0, -1]), a = aCuatro(0, { m: GIRADA }), w = a.b.a, RM = D.muslo;
      var atras = function (th, extra) {
        return aUnBrazo(function (cab) {
          return sobre({ pel: [0, 7 + RM * Math.sin(th * RAD), ZR4 - RM * Math.cos(th * RAD)], giro: [0, cab, 0], cab: [-8, 0, 0], p: { a: [10, 7, ZR4 - 38], polo: [0, -1, 0.3] }, t: EMPEINE, b: { a: w, polo: CODO4 }, m: GIRADA }, extra || {});
        }, w, 40, 110);
      };
      var m = atras(77), b = atras(64);
      return {
        vista: [[-78, 12], [-136, 22]], isometrico: 'b', clavos: K4,
        posturas: { a: a, m: m, b: b }, inicio: 'a', encuadra: ['a', 'b'],
        pasos: ['a', { sec: [['m', 1.0, 'entra'], ['b', 1.1, 'sale']], desde: 'a' }, 'b']
      };
    })();

    var KI3 = ['mi', 'ti', 'td'], KD3 = ['md', 'ti', 'td'];
    /* la mano que se despega de su apoyo (o se posa en él). De una mano apoyada (dicha en el mundo: la palma y los dedos) a otra al aire
       (dicha con su giro y su muñeca: manoHacia), cada parte se mezcla por su lado, y a medio camino la mano se ladea y se hunde. Para
       que siga plana, la apoyada lleva también el giro y la muñeca que le tocan en su postura: posada(P, k, dedos, palma) */
    function posada(P, k, dedos, palma, cerca) { return une(manoHacia(P, k, dedos, palma, 'abierta', cerca), apoyada(dedos, palma)); }
    function conPosadas(P) { return sobre(P, { mi: posada(P, 'i', [0, 0, 1], [0, -1, 0]), md: posada(P, 'd', [0, 0, 1], [0, -1, 0]) }); }
    /* de qué signo es el giro de la columna que, boca abajo, baja el hombro izquierdo; y el giro de la cabeza que la vuelve hacia −X */
    var GIRO_IZQ = (function () {
      var P = function (t) { return sobre({ pel: [0, 47, ZR4], giro: [0, 95, 0], col: [0, 0, t] }, {}); };
      return resolver(P(30)).i.hom[1] < resolver(P(-30)).i.hom[1] ? 1 : -1;
    })();
    var MIRA_DER = (function () {
      var P = function (y) { return { pel: [0, 47, ZR4], giro: [0, 95, 0], cab: [0, y, 0] }; }, x = function (y) { var E = resolver(P(y)); return aplicar(E.Bc, [0, 0, 1])[0]; };
      return x(30) < x(-30) ? 1 : -1;
    })();

    /* enhebrar la aguja: a cuatro patas, con las manos bajo los hombros y las rodillas bajo la cadera; despega una mano y la pasa por
       debajo del cuerpo hacia el lado contrario (por detrás de la otra mano, con la palma hacia arriba), dejando que el hombro baje
       hacia el suelo y que el pecho y la cabeza giren; mantiene, vuelve despacio y repite hacia el otro lado. La mano que sigue en el
       suelo no se mueve: su codo se dobla lo que pide el hombro al bajar */
    COREO['enhebrar-la-aguja'] = (function () {
      var a = conPosadas(aCuatro()), w = a.b.a, wd = [-w[0], w[1], w[2]], c0 = a.giro[1], pr0 = a.mi.prono;
      var hilo = function (cab, t, mira, brazo) {
        return sobre({ pel: [0, 47, ZR4], giro: [0, cab, 0], col: [0, 0, GIRO_IZQ * t], cab: [-6, MIRA_DER * mira, 0], p: { a: [10, 7, ZR4 - 38], polo: [0, -1, 0.3] }, t: EMPEINE,
          bd: { a: wd, polo: [-1, 0.3, -0.5] }, md: a.md }, brazo);
      };
      /* primero la despega (d1: la palma sigue hacia el suelo); a medio camino (m), la mano pasa de canto bajo el pecho */
      var d0 = sobre(a, { bi: { a: [17.5, 9, w[2] - 1], polo: CODO4 } }), d1 = sobre(d0, { mi: manoHacia(d0, 'i', [0, 0, 1], [0, -1, 0], 'abierta', pr0) });
      var m0 = hilo((c0 + 104) / 2, 17, 8, { bi: { a: [-2, 16.5, w[2] - 9], polo: [0.7, 0.2, -0.7] } });
      var m = sobre(m0, { mi: manoHacia(m0, 'i', [-0.8, -0.25, 0.55], [-0.5, 0, -0.866], 'abierta', pr0) });
      var b0 = hilo(104, 38, 24, { bi: { a: [-31, ALTO_MUN, w[2] - 15], polo: [0.2, -0.2, -1] } }), b = sobre(b0, { mi: posada(b0, 'i', [-1, 0, 0], [0, 1, 0], m.mi.prono) });
      return {
        vista: [[-62, 16], [-128, 26]], isometrico: 'b', clavos: K4,
        posturas: { a: a, d1: d1, m: m, b: b, e1: refleja(d1), m2: refleja(m), b2: refleja(b) }, inicio: 'a', encuadra: ['a', 'b', 'b2'],
        pasos: ['a', { sec: [['d1', 0.4, 'entra', KD3], ['m', 0.75, 'lineal', KD3], ['b', 1.1, 'sale', KD3]], desde: 'a' },
                { sec: [['b', 1.5, null, K4], ['m', 0.95, 'entra', KD3], ['d1', 0.7, 'lineal', KD3], ['a', 0.4, 'sale', KD3]], desde: 'b' },
                { sec: [['e1', 0.4, 'entra', KI3], ['m2', 0.75, 'lineal', KI3], ['b2', 1.1, 'sale', KI3]], desde: 'a' }]
      };
    })();

    /* la rotación a cuatro patas con la mano en la nuca: a cuatro patas; lleva la mano derecha a la nuca, con el brazo y el tronco
       mirando al suelo; gira el tronco hacia fuera subiendo el codo, vuelve y repite; y cambia de lado. El brazo de apoyo sigue
       estirado: se busca la inclinación del tronco que deja su hombro a un brazo justo de la mano */
    COREO['rotacion-cuadrupedia-mano-nuca'] = (function () {
      var a = conPosadas(aCuatro()), w = a.b.a;
      var n = aCuatroEn(w, { bd: { a: [-8, 37, -8], en: 'torax', polo: [-0.55, 0.25, 1] }, md: { tipo: 'suelta', palma: [0, -1, 0] }, cab: [-4, 0, 0] });
      var u = aCuatroEn(w, { bd: { a: [-8, 37, -8], en: 'torax', polo: [-1, 0.25, -0.25] }, md: { tipo: 'suelta', palma: [-0.64, -0.77, 0] }, col: [0, 0, GIRO_IZQ * 40], cab: [-4, 0, 0] });
      /* la mano se despega (e: plana, con la palma hacia el suelo) antes de ir a la nuca, y se posa igual */
      var e0 = sobre(a, { bd: { a: [-17.5, 10, w[2] - 1], polo: [-0.4, 0.2, -1] } }), e = sobre(e0, { md: manoHacia(e0, 'd', [0, 0, 1], [0, -1, 0], 'abierta', a.md.prono) });
      var n2 = refleja(n), u2 = refleja(u);
      /* el último paso enseña los dos lados: gira y vuelve con la derecha en la nuca, cambia de mano y gira hacia el otro lado. (Como
         repetición no se vería: el paso dura lo que se tarda en leerlo, y el cambio de lado llegaría después) */
      return {
        vista: [[-66, 14], [-130, 24]], rastro: 'cd', clavos: K4,
        posturas: { a: a, e: e, n: n, u: u, e2: refleja(e), n2: n2, u2: u2 }, inicio: 'a', encuadra: ['a', 'u', 'u2'],
        pasos: ['a', { sec: [['e', 0.4, 'entra', KI3], ['n', 1.3, 'sale', KI3]], desde: 'a' },
                { sec: [['u', 1.2, 'suave', KI3], ['u', 0.4, null, KI3], ['n', 1.2, 'suave', KI3], ['n', 0.25, null, KI3], ['e', 0.7, 'entra', KI3], ['a', 0.3, 'sale', KI3],
                        ['e2', 0.35, 'entra', KD3], ['n2', 0.8, 'sale', KD3], ['u2', 1.2, 'suave', KD3]], desde: 'n', dura: 7.4 }]
      };
    })();

    /* la postura del niño hacia un lado: de rodillas, se sienta sobre los talones (la cadera gira sobre las rodillas, que no se mueven);
       desliza las manos hacia delante por el suelo hasta dejar la frente en él, con el cuello relajado; lleva el tronco y las manos hacia
       un lado, mantiene y repite hacia el otro. Las rodillas, a la anchura de la cadera: el vientre descansa en los muslos */
    COREO['postura-nino-lateral'] = (function () {
      var TOB = [10, 7, ZR4 - D.pierna], RM = D.muslo, L = D.brazo + D.antebrazo - 0.9, P = {};
      /* la cadera, a «th» grados sobre las rodillas (90, encima de ellas; 30, sentado sobre los talones) */
      var con = function (th, cab, extra) {
        return sobre({ pel: [0, 7 + RM * Math.sin(th * RAD), ZR4 - RM * Math.cos(th * RAD)], giro: [0, cab, 0], p: { a: TOB, polo: [0, -1, 0.3] }, t: EMPEINE }, extra || {});
      };
      P.r = con(90, 0, SUELTO);
      P.s = con(30, 5, sobre(SUELTO, { cab: [-2, 0, 0] }));
      /* plegado: la cabeza, con la frente hacia el suelo (se busca la inclinación del tronco que la deja en él); «lat», lo que la columna
         se dobla de lado */
      var plegado = function (lat) { return function (cab, extra) { return con(30, cab, sobre({ col: [28, lat, 0], cab: [94 - cab - 28, 0, 0], m: EN_SUELO }, extra || {})); }; };
      var alSuelo = function (Q) { return busca(function (cab) { return cabezaAPlano(resolver(Q(cab)), [0, 0, 0], [0, 1, 0]); }, 0.3, 50, 100); };
      /* la muñeca, en el suelo, a un brazo (casi) estirado del hombro y «fi» grados hacia la izquierda */
      var alcanza = function (E, k, fi) { var h = E[k].hom, r = Math.sqrt(L * L - (h[1] - ALTO_MUN) * (h[1] - ALTO_MUN)); return [h[0] + r * Math.sin(fi * RAD), ALTO_MUN, h[2] + r * Math.cos(fi * RAD)]; };
      var N0 = plegado(0), cn = alSuelo(N0), En = resolver(N0(cn)), w = alcanza(En, 'i', 3), w1 = [w[0], ALTO_MUN, ZR4 + 13];
      P.m1 = aUnBrazo(function (cab) { return con(30, cab, { col: [12, 0, 0], cab: [4, 0, 0], b: { a: w1, polo: [0.6, 0.2, -1] }, m: EN_SUELO }); }, w1, 15, 80);
      P.n = N0(cn, { b: { a: w, polo: [1, 0.25, -0.2] } });
      /* hacia su izquierda (+X): la columna se dobla 20° de lado y las manos van hacia allí */
      var sgL = resolver(plegado(20)(cn)).i.hom[0] > resolver(plegado(-20)(cn)).i.hom[0] ? 1 : -1, L0 = plegado(sgL * 20), cl = alSuelo(L0), El = resolver(L0(cl));
      P.l = L0(cl, { bi: { a: alcanza(El, 'i', 24), polo: [1, 0.25, -0.2] }, bd: { a: alcanza(El, 'd', 24), polo: [-1, 0.25, -0.2] }, m: apoyada([0.4, 0, 0.92]) });
      P.l2 = refleja(P.l);
      var sienta = porArco(P, 'q', P.r, P.s, 's', 2, 1.7, [7, ZR4], T2);
      return {
        vista: [[-74, 14], [-128, 26]], isometrico: 'l', clavos: K4,
        posturas: P, inicio: 'r', encuadra: ['r', 'n', 'l', 'l2'],
        pasos: [{ sec: [['r', 0.7, null, T2]].concat(sienta), desde: 'r' }, { sec: [['m1', 1.0, 'entra', T2], ['n', 1.5, 'sale']], desde: 's' },
                { sec: [['l', 1.6, 'suave'], ['l', 1.8], ['n', 1.4, 'suave'], ['l2', 1.6, 'suave']], desde: 'n', dura: 6.6 }]
      };
    })();

    /* ══════════════════════════════ EN LA PARED ══════════════════════════════ */
    var L_BRAZO = D.brazo + D.antebrazo - 0.35;                     /* del hombro a la muñeca, con el brazo estirado */
    /* de cara a una pared: el cuerpo, recto de los tobillos a los hombros, se inclina hacia ella «fi» grados (los pies, planos) */
    /* las palmas, de plano en una pared que queda delante, con los dedos hacia arriba: apoyadas, y con el giro y la muñeca que les tocan
       (posada), para que lleguen planas desde el aire */
    function enPared(P, cerca) { return sobre(P, { mi: posada(P, 'i', [0, 1, 0], [0, 0, 1], cerca), md: posada(P, 'd', [0, 1, 0], [0, 0, 1], cerca) }); }
    /* y antes de apoyarlas: al aire, igual de planas (solo con su giro y su muñeca) */
    function antePared(P, cerca) { return sobre(P, { mi: manoHacia(P, 'i', [0, 1, 0], [0, 0, 1], 'abierta', cerca), md: manoHacia(P, 'd', [0, 1, 0], [0, 0, 1], 'abierta', cerca) }); }
    var SUELTO_ANCHO = { b: { e: 9, z: 90, g: 90, c: 10 }, m: SUELTA };          /* con los pies a la anchura de los hombros, los muslos quedan más fuera: las manos, también */
    function haciaPared(fi, extra) { return sobre({ pel: [0, D.tobillo + 78 * Math.cos(fi * RAD), 78 * Math.sin(fi * RAD)], giro: [0, fi, 0], p: { suelo: [15, 0], abre: 5 } }, extra || {}); }

    /* subir las manos por la pared: de cara a ella, algo más lejos de lo que alcanza el brazo, con los pies a la anchura de los hombros;
       se inclina y apoya las palmas a la altura y a la anchura de los hombros; con la espalda recta, sube las manos por la pared, como
       caminando (una y después la otra), hasta tener los brazos por encima de la cabeza; mantiene y las baja igual. El cuerpo se
       inclina lo que pide la mano que va más alta (se busca): a esa distancia, con los brazos arriba queda a 24° de la vertical */
    COREO['subir-manos-por-la-pared'] = (function () {
      var ZP = 72.7, zm = ZP - ALTO_MUN, X = D.hombroX, P = {};
      var con = function (yi, yd, cab) {
        var wi = [X, yi, zm], wd = [-X, yd, zm];
        var Q = function (fi) { return haciaPared(fi, { cab: [cab || 0, 0, 0], bi: { a: wi, polo: [1, -0.6, -0.2] }, bd: { a: wd, polo: [-1, -0.6, -0.2] }, m: PLANA_PARED }); };
        /* el brazo que más pide, a medio centímetro de estirarse del todo: estirado justo, al respirar la mano clavada no llegaba (0,09 cm) */
        var f = function (fi) { var E = resolver(Q(fi)); return Math.max(largo(menos(E.i.hom, wi)), largo(menos(E.d.hom, wd))); }, fi = 0;
        while (fi < 30 && f(fi) > L_BRAZO - 0.5) fi += 0.5;                /* la primera inclinación con la que llega (más allá vuelve a alejarse) */
        return enPared(Q(busca(f, L_BRAZO - 0.5, Math.max(0, fi - 0.5), fi)), 0);
      };
      var y0 = resolver(con(127, 127)).i.hom[1]; y0 = resolver(con(y0, y0)).i.hom[1];
      var S = [[0, 0, 0], [12, 0, -2], [12, 24, -3], [36, 24, -5], [36, 36, -6]], sube = [], baja = [], i;       /* 36 cm por encima de los hombros: más arriba, a esa distancia de la pared, el brazo ya no llega */
      P.de = haciaPared(0, SUELTO_ANCHO);
      for (i = 0; i < S.length; i++) P['w' + i] = con(y0 + S[i][0], y0 + S[i][1], S[i][2]);
      /* antes de apoyarlas, las manos suben por delante, ya de plano (v) */
      P.v = antePared(haciaPared(P.w0.giro[1] * 0.55, { b: { a: [X, y0 - 13, zm - 17], polo: [1, -0.6, -0.2] } }), 0);
      for (i = 1; i < S.length; i++) { sube.push(['w' + i, 0.7, 'suave']); baja.push(['w' + (S.length - 1 - i), 0.7, 'suave']); }
      return {
        vista: [[-70, 8], [-140, 14]], isometrico: 'w4', clavos: K4, zoom: 0.9,
        material: [['pared', { z: ZP, normal: [0, 0, -1], ancho: 130 }]],
        posturas: P, inicio: 'de', encuadra: ['de', 'w4'],
        pasos: ['de', { sec: [['v', 1.0, 'entra', T2], ['w0', 0.8, 'sale', T2]], desde: 'de' }, { sec: sube, desde: 'w0' }, { sec: [['w4', 1.3]].concat(baja), desde: 'w4' }]
      };
    })();

    /* la espalda, con las manos en la pared: de pie frente a ella, a un metro más o menos; apoya las manos con los brazos estirados;
       inclina el tronco hasta dejarlo paralelo al suelo, con las piernas rectas (la cadera va hacia atrás; las manos no se mueven); y,
       para hacerlo más difícil, cruza las piernas (un pie delante del otro, cruzados), mantiene y repite con la otra delante.
       Para cruzarlas: un pie va hacia atrás, al otro lado, y después el otro cruza por delante de él (así no se pisan) */
    COREO['estiramiento-espalda-manos-pared'] = (function () {
      var ZP = 88, W = [D.hombroX, 85.6, ZP - ALTO_MUN], LP = 77.9, P = {};
      /* la altura de la cadera que deja estirada la pierna que más pide: z, la de la cadera; f, dónde pisa cada pie ([x, z]) */
      var alto = function (z, f) { return D.tobillo + Math.sqrt(LP * LP - Math.max((f.i[0] - 10) * (f.i[0] - 10) + (f.i[1] - z) * (f.i[1] - z), (f.d[0] + 10) * (f.d[0] + 10) + (f.d[1] - z) * (f.d[1] - z))); };
      var con = function (ang, f, cab, ti, td, lo, hi) {
        return enPared(aUnBrazo(function (z) {
          return { pel: [0, alto(z, f), z], giro: [0, ang, 0], cab: [cab, 0, 0], hom: [4, 0], pi: { suelo: f.i, abre: 4, talon: ti || 0 }, pd: { suelo: f.d, abre: 4, talon: td || 0 }, b: { a: W, polo: [1, -0.4, -0.3] }, m: PLANA_PARED };
        }, W, lo, hi), 0);
      };
      var F0 = { i: [10, 0], d: [-10, 0] }, FC = { i: [-2, -28], d: [2, 1] };      /* cruzadas: la cadera queda en medio de los dos pies, y las dos piernas, igual de rectas */
      P.de = { pel: [0, D.tobillo + LP, 0], pi: { suelo: F0.i, abre: 4 }, pd: { suelo: F0.d, abre: 4 }, b: aLosLados(8), m: SUELTA };
      /* la cabeza, caída entre los brazos, y los hombros, hacia las orejas: es grande (33,5 cm del cuello a la coronilla, y el tupé) y,
         levantada, llega a la pared antes que las manos. Por eso apoya las manos con el tronco ya casi paralelo al suelo (a) */
      P.v = antePared({ pel: [0, D.tobillo + LP - 1.2, -14], giro: [0, 68, 0], cab: [22, 0, 0], hom: [2, 0], pi: { suelo: F0.i, abre: 4 }, pd: { suelo: F0.d, abre: 4 }, b: { a: [W[0], W[1] + 8, W[2] - 22], polo: [1, -0.4, -0.3] } }, 0);
      P.a = con(78, F0, 30, 0, 0, -22, 8);
      P.b = con(90, F0, 24, 0, 0, -22, 8);
      P.x1 = con(90, { i: [5, -14], d: F0.d }, 24, 0, 0, -22, 8);
      P.c1 = con(90, { i: FC.i, d: F0.d }, 24, 0, 0, -22, 8);
      P.x2 = con(90, { i: FC.i, d: [-4, 0.5] }, 24, 0, 0, -22, 8);
      P.c = con(90, FC, 24, 0, 0, -22, 8);
      ['x1', 'c1', 'x2', 'c'].forEach(function (n) { P[n + 'r'] = refleja(P[n]); });
      var KI = ['mi', 'md', 'td'], KD = ['mi', 'md', 'ti'], cruza = function (r, k1, k2) { return [['x1' + r, 0.4, 'entra', k1], ['c1' + r, 0.4, 'sale', k1], ['x2' + r, 0.4, 'entra', k2], ['c' + r, 0.45, 'sale', k2]]; };
      var descruza = function (r, k1, k2) { return [['x2' + r, 0.4, 'entra', k2], ['c1' + r, 0.4, 'sale', k2], ['x1' + r, 0.4, 'entra', k1], ['b', 0.45, 'sale', k1]]; };
      return {
        vista: [[-78, 8], [-140, 16]], isometrico: 'c', clavos: K4,
        material: [['pared', { z: ZP, normal: [0, 0, -1], ancho: 130 }]],
        posturas: P, inicio: 'de', encuadra: ['de', 'b'],
        pasos: [{ sec: [['de', 0.6, null, T2], ['v', 1.0, 'entra', T2], ['a', 0.9, 'sale', T2]], desde: 'de' }, { sec: [['b', 2.2, 'suave']], desde: 'a' },
                { sec: cruza('', KI, KD).concat([['c', 2.0]], descruza('', KI, KD), cruza('r', KD, KI)), desde: 'b' }]
      };
    })();

    /* los hombros, de espaldas a la pared: la espalda apoyada, los pies a la anchura de los hombros y los brazos abiertos a la altura de
       los hombros; dobla los codos y las yemas apuntan al techo, con el dorso de las manos en la pared; deja rodar los brazos hacia
       delante, sin estirar los codos, hasta que los dedos apuntan al suelo (el antebrazo no llega a la pared: se queda a unos 25° de
       ella); y alterna las dos posiciones. El codo no se mueve: el antebrazo gira sobre el brazo, que sigue en la pared */
    COREO['estiramiento-hombros-pared-brazos-en-cruz'] = (function () {
      var ZP = -13.4, base = { pel: [0, PIE - 0.9, -1.2], p: { suelo: [15, ZP + D.talon + 0.6], abre: 5 } };
      var hy = resolver(base).i.hom[1], zc = ZP + ALTO_MUN, XC = D.hombroX + 26.2, ZC = ZP + 6;
      var dorso = function (P, dedos, cerca) { return sobre(P, { mi: posada(P, 'i', dedos, [0, 0, 1], cerca), md: posada(P, 'd', [-dedos[0], dedos[1], dedos[2]], [0, 0, 1], cerca) }); };
      var s = sobre(base, SUELTO_ANCHO);
      var hz = resolver(base).i.hom[2], t = dorso(sobre(base, { b: { a: [D.hombroX + Math.sqrt((L_BRAZO - 0.7) * (L_BRAZO - 0.7) - (hz - zc) * (hz - zc)), hy, zc], polo: [0, -1, -0.4] } }), [1, 0, 0]);      /* la muñeca queda 9 cm por detrás del hombro: el brazo, a 0,7 cm de estirarse */
      var e = dorso(sobre(base, { b: { a: [XC, hy + 23.6, zc], polo: [1, -0.25, -0.2] } }), [0, 1, 0], t.mi.prono);
      /* el antebrazo, a «g» grados de apuntar al techo, girando hacia delante sobre el codo (90, al frente; 155, casi abajo) */
      var rueda = function (g, cerca) {
        var d = [0, Math.cos(g * RAD), Math.sin(g * RAD)], Q = sobre(base, { b: { a: [XC, hy + 0.3 + D.antebrazo * d[1], ZC + D.antebrazo * d[2]], polo: [1, -0.25 * d[1], -0.3] } });
        return sobre(Q, { mi: manoHacia(Q, 'i', d, [0, -d[2], d[1]], 'abierta', cerca), md: manoHacia(Q, 'd', d, [0, -d[2], d[1]], 'abierta', cerca) });
      };
      var f1 = rueda(48, e.mi.prono), f = rueda(96, f1.mi.prono), f2 = rueda(128, f.mi.prono), i = rueda(155, f2.mi.prono);
      var ade = [['f1', 0.55, 'entra', T2], ['f', 0.5, 'lineal', T2], ['f2', 0.5, 'lineal', T2], ['i', 0.6, 'sale', T2]], atr = [['f2', 0.6, 'entra', T2], ['f', 0.5, 'lineal', T2], ['f1', 0.5, 'lineal', T2], ['e', 0.6, 'sale', T2]];
      return {
        vista: [[24, 10], [66, 12]], isometrico: 'e', clavos: K4,
        material: [['pared', { z: ZP, normal: [0, 0, 1], ancho: 190 }]],
        posturas: { s: s, t: t, e: e, f1: f1, f: f, f2: f2, i: i }, inicio: 's', encuadra: ['s', 't', 'e'],
        pasos: [{ sec: [['s', 0.6, null, T2], ['t', 1.7, 'suave', T2]], desde: 's' }, { sec: [['e', 1.8, 'suave']], desde: 't' }, { sec: [['e', 0.8]].concat(ade), desde: 'e' },
                { sec: [['i', 1.6, null, T2]].concat(atr, [['e', 1.6]], ade), desde: 'i', dura: 8.6 }]
      };
    })();

    /* el durmiente, de pie: con el costado en una pared (queda a su izquierda) y el hombro y el brazo de ese lado contra ella: el brazo,
       al frente a la altura del hombro; el codo, doblado, y el antebrazo, paralelo al suelo (cruza por delante del pecho); con la otra
       mano empuja despacio el antebrazo hacia el suelo (gira sobre el brazo, que no se mueve de la pared); y lo acompaña de vuelta */
    COREO['estiramiento-durmiente-de-pie-pared'] = (function () {
      var XW = 25.7, base = { pel: [0, PIE, 0], p: { suelo: [10, 0], abre: 5 } }, h = resolver(base).i.hom, CODO = [h[0] + 1.6, h[1], h[2] + Math.sqrt(D.brazo * D.brazo - 1.6 * 1.6)];
      /* el antebrazo izquierdo, «g» grados por debajo de la horizontal; la mano derecha, sobre él, 6 cm antes de la muñeca */
      var con = function (g, sujeta) {
        var c = Math.cos(g * RAD), s_ = Math.sin(g * RAD), w = [CODO[0] - D.antebrazo * c, CODO[1] - D.antebrazo * s_, CODO[2]];
        var P = sobre(base, { bi: { a: w, polo: menos(CODO, h) }, mi: { tipo: 'suelta', palma: [s_, -c, 0] }, bd: aLosLados(8), md: SUELTA });
        if (!sujeta) return P;
        return sobre(P, { bd: { a: [w[0] + 6 * c - 4.6 * s_, w[1] + 6 * s_ + 4.6 * c, w[2] + 1], polo: [-1, -0.2, 0.35] }, md: { tipo: 'suelta', palma: [s_, -c, 0] } });
      };
      return {
        vista: [[-28, 10], [-72, 12]], isometrico: 'b', clavos: T2,
        material: [['pared', { x: XW, z: 0, normal: [-1, 0, 0], ancho: 130 }]],
        posturas: { a: con(0), h: con(0, 1), m: con(28, 1), b: con(52, 1) }, inicio: 'a', encuadra: ['a', 'b'],
        pasos: ['a', { sec: [['h', 1.3, 'suave'], ['h', 0.3], ['m', 1.0, 'entra'], ['b', 1.1, 'sale']], desde: 'a' },
                { sec: [['b', 1.6], ['m', 1.0, 'entra'], ['h', 1.1, 'sale']], desde: 'b' }]
      };
    })();

    /* el barrido circular junto a la pared: de pie, de lado y cerca de ella (queda a su izquierda), con un pie adelantado; con el brazo
       de ese lado dibuja un círculo amplio siguiendo la pared con la mano (el dorso, hacia ella), sin apoyarse; en un sentido y después
       en el otro; y, para exigir más estabilidad, con una rodilla en el suelo y los pies en línea. El brazo, estirado, gira en un plano
       paralelo a la pared; el codo dobla siempre hacia dentro del giro */
    COREO['barrido-circular-brazo-pared'] = (function () {
      var XH = 22.4, XW = XH + 5.2, N = 12, T = 0.3, P = {}, ida = [], vuelta = [], ida2 = [], i;      /* la muñeca gira en x = XH; el dorso de la mano roza la pared */
      var de_pie = { pel: [0, PIE - 1.6, 0], pi: { suelo: [10, -12], abre: 5 }, pd: { suelo: [-10, 14], abre: 5 }, bd: aLosLados(8), md: SUELTA };
      /* arrodillado en línea: la rodilla izquierda, en el suelo bajo la cadera (con los dedos del pie metidos), y el pie derecho, delante */
      var ZK = -23, YK = 7 + Math.sqrt(D.muslo * D.muslo - 81);
      var rodilla = { pel: [0, YK, ZK], pi: { a: [1, TOB_PUNTA, ZK - Math.sqrt(D.pierna * D.pierna - 49)], polo: [0, -1, 0.4] }, ti: PIES_PUNTA, pd: { suelo: [-1, 14], abre: 3, polo: [0.35, 0.3, 1] }, bd: aLosLados(8), md: SUELTA };
      var MUN = -17;                 /* la muñeca, algo doblada hacia el dorso: el antebrazo es más grueso que la mano, y son los dedos los que rozan la pared */
      /* el brazo izquierdo, a «fi» grados de colgar, girando hacia delante (90, al frente; 180, arriba; 270, atrás) */
      var brazo = function (base, fi) {
        var c = Math.cos(fi * RAD), s_ = Math.sin(fi * RAD), Q = sobre(base, { hom: { i: [3 * Math.max(0, -c), 0], d: [0, 0] } }), hh = resolver(Q).i.hom;
        var R = Math.sqrt((L_BRAZO - 0.1) * (L_BRAZO - 0.1) - (XH - hh[0]) * (XH - hh[0]));
        return sobre(Q, { bi: { a: [XH, hh[1] - R * c, hh[2] + R * s_], polo: [0, -s_, -c] }, mi: { tipo: 'abierta', palma: [-1, 0, 0], mun: MUN } });
      };
      for (i = 0; i < N; i++) { P['c' + i] = brazo(de_pie, i * 360 / N); P['k' + i] = brazo(rodilla, i * 360 / N); }
      for (i = 1; i <= N; i++) { ida.push(['c' + (i % N), T, 'lineal']); vuelta.push(['c' + ((N - i) % N), T, 'lineal']); ida2.push(['k' + (i % N), T, 'lineal', ['ti', 'td']]); }
      /* de pie a arrodillado: el pie de delante se pone en línea; el de atrás retrocede sobre la punta (zancada); y la rodilla baja */
      P.l1 = brazo(sobre(de_pie, { pd: { suelo: [-1, 14], abre: 3 } }), 0);
      P.l15 = brazo({ pel: [0, 78, -6], pi: { a: [6, 21, -38], polo: [0, -0.3, 1] }, ti: { punta: [0, -0.5, 0.866], arriba: [0, 0.866, 0.5] }, pd: { suelo: [-1, 14], abre: 3 }, bd: aLosLados(8), md: SUELTA }, 0);
      P.l2 = brazo({ pel: [0, 66, -13], pi: { a: [1, TOB_PUNTA, rodilla.pi.a[2]], polo: [0, -1, 0.4] }, ti: PIES_PUNTA, pd: { suelo: [-1, 14], abre: 3, polo: [0.2, 0.3, 1] }, bd: aLosLados(8), md: SUELTA }, 0);
      return {
        vista: [[-80, 8], [-36, 12]], rastro: 'mi', clavos: T2, zoom: 0.86,
        material: [['pared', { x: XW, z: 0, normal: [-1, 0, 0], ancho: 150 }]],
        posturas: P, inicio: 'c0', encuadra: ['c0', 'c6', 'c3', 'c9'],
        pasos: ['c0', { sec: ida.concat(ida), desde: 'c0', dura: 7.4 }, { sec: [['c0', 0.4]].concat(ida, [['c0', 0.5]], vuelta, vuelta), desde: 'c0', dura: 11.9 },
                { sec: [['l1', 0.5, 'suave', ['ti']], ['l15', 0.45, 'entra', ['td']], ['l2', 0.5, 'lineal', ['td']], ['k0', 0.8, 'sale', ['ti', 'td']], ['k0', 0.3, null, ['ti', 'td']]].concat(ida2), desde: 'c0', dura: 6.6 }]
      };
    })();

    /* ══════════════════════════════ TUMBADO Y SENTADO ══════════════════════════════ */
    var EN_SUELO_PIERNA = -2.3, X_LADO = -12;
    /* de lado (como en 79-gluteos.js): sobre el lado derecho, la cabeza hacia −Z y de cara a −X. piernaCon: la pierna del lado k, con el
       tobillo en «tob» y la rodilla girada «ang» grados alrededor de la línea de la cadera al tobillo (0, hacia delante: −X; 90, arriba) */
    function piernaCon(P, k, tob, ang) {
      var c = resolver(P)[k].cad, eje = unidad(menos(tob, c)), f = unidad(sinParte([-1, 0, 0], eje)), u = unidad(sinParte([0, 1, 0], eje));
      return { a: tob, polo: mas(por(f, Math.cos(ang * RAD)), por(u, Math.sin(ang * RAD))) };
    }

    /* el libro abierto: de lado, con las rodillas recogidas en ángulo recto delante de la cadera y los brazos estirados al frente, a la
       altura del pecho, con las palmas juntas; mirando la mano de arriba, la separa y la lleva hacia arriba y hacia atrás, hacia el suelo
       del otro lado (el pecho gira; la pelvis y las piernas no se mueven); pausa, vuelve a juntar las manos y cambia de lado (rueda sobre
       la espalda). El hombro de abajo no se despega del suelo: la columna, además de girar, se dobla de lado lo que eso pide (se busca) */
    COREO['libro-abierto-tumbado'] = (function () {
      var base0 = { pel: [X_LADO, 21.5, 0], giro: [-90, 0, -84] }, cd = resolver(base0).d.cad, i, y = 6, ang = 0, P = {};
      var abajo = function (yy, g) { return { pd: piernaCon(base0, 'd', [cd[0] - 38, yy, cd[2] + 37], g), td: { tob: 8 } }; };
      for (i = 0; i < 3; i++) {
        ang = busca(function (g) { return resolver(sobre(base0, abajo(y, g))).d.rod[1]; }, 6.4, -40, 20);
        y = busca(function (yy) { return bajoZapa(resolver(sobre(base0, abajo(yy, ang))).d, 'd'); }, -0.3, 3, 11);
      }
      var Qd = sobre(base0, abajo(y, ang)), Ed = resolver(Qd).d, tobI = [Ed.tob[0], Ed.tob[1] + 10.5, Ed.tob[2]];
      var angI = busca(function (g) { return resolver(sobre(Qd, { pi: piernaCon(Qd, 'i', tobI, g), ti: { tob: 8 } })).i.rod[1]; }, Ed.rod[1] + 11.5, -40, 40);
      var base = sobre(Qd, { pi: piernaCon(Qd, 'i', tobI, angI), ti: { tob: 8 } });
      /* los signos: el giro que lleva el hombro de arriba hacia atrás (+X), el doblez de lado que baja los hombros y el giro de la cabeza
         que la vuelve hacia el techo */
      var GT = resolver(sobre(base, { col: [0, 0, 30] })).i.hom[0] > resolver(sobre(base, { col: [0, 0, -30] })).i.hom[0] ? 1 : -1;
      var GL = resolver(sobre(base, { col: [0, 12, 0] })).d.hom[1] < resolver(sobre(base, { col: [0, -12, 0] })).d.hom[1] ? 1 : -1;
      var GC = aplicar(resolver(sobre(base, { cab: [0, 30, 0] })).Bc, [0, 0, 1])[1] > aplicar(resolver(sobre(base, { cab: [0, -30, 0] })).Bc, [0, 0, 1])[1] ? 1 : -1;
      var Y0 = resolver(base).d.hom[1];
      /* girado «t» grados (negativo, hacia el suelo de delante), con el hombro de abajo a su altura */
      var girado = function (t, mira, extra) {
        var Q = function (lat) { return sobre(base, sobre({ col: [0, GL * lat, GT * t], cab: [0, GC * mira, -14] }, extra || {})); };
        return Q(busca(function (lat) { return resolver(Q(lat)).d.hom[1]; }, Y0, -30, 30));
      };
      /* el brazo de abajo, tendido hacia delante con el dorso de la mano en el suelo; el de arriba, sobre él, palma con palma */
      var alFrente = function (Q) { var sd = resolver(Q).d.hom, r = Math.sqrt((L_BRAZO - 0.4) * (L_BRAZO - 0.4) - (sd[1] - ALTO_MUN) * (sd[1] - ALTO_MUN)); return [sd[0] - r, ALTO_MUN, sd[2]]; };
      var ta = busca(function (t) { var Q = girado(t, 0), w = alFrente(Q); return largo(menos(resolver(Q).i.hom, [w[0], w[1] + 4.4, w[2]])); }, L_BRAZO - 0.2, -45, 5);
      /* (el pecho gira sobre la columna y el hombro de abajo, que va con él, se adelanta: ese brazo sigue estirado y su mano resbala
         hacia delante por el suelo; si la mano se quedara clavada, el codo se doblaría) */
      var A0 = girado(ta, 0), wd = alFrente(A0);
      var conAbajo = function (Q, cerca) { var R = sobre(Q, { bd: { a: alFrente(Q), polo: [0, 1, -0.2] } }); return sobre(R, { md: posada(R, 'd', [-1, 0, 0], [0, 1, 0], cerca) }); };
      var a0 = conAbajo(sobre(A0, { bi: { a: [wd[0], wd[1] + 4.4, wd[2]], polo: [0, 0.3, -1] } }), 0);
      P.a = sobre(a0, { mi: manoHacia(a0, 'i', [-1, 0, 0], [0, -1, 0], 'abierta', 0) });
      P.m1 = conAbajo(girado(16, 40, { bi: { e: 92, z: 40, g: 40, c: 8 }, mi: { tipo: 'abierta', prono: P.a.mi.prono * 0.5 } }), P.a.md.prono);
      P.b = conAbajo(girado(46, 66, { bi: { e: 90, z: 104, g: 104, c: 7 }, mi: { tipo: 'abierta', prono: -60 } }), P.a.md.prono);
      /* para cambiar de lado: recoge los brazos ante el pecho (q), rueda sobre la espalda con las rodillas dobladas (as, s, sa) y queda
         del otro lado, reflejado */
      var REC_AB = { a: [-3, 5, 16.5], en: 'torax', polo: [-0.25, -1, 0.4] }, REC_AR = { a: [10, 3, 16], en: 'torax', polo: [0.5, -1, 0.3] }, FLOJA = { tipo: 'suelta', prono: 40 };
      var rodar = function (sg) {
        var tr = { pel: [X_LADO * 0.5 * sg, 17.4, 0], base: baseEjes([0, 0.05, -1], [-0.7 * sg, 0.72, 0]), cab: [0, 0, 2 * sg], t: { tob: 8 }, m: FLOJA, p: { e: 54, z: 0, c: 96 } };
        tr[sg > 0 ? 'bd' : 'bi'] = sg > 0 ? REC_AB : reflejo(REC_AB); tr[sg > 0 ? 'bi' : 'bd'] = sg > 0 ? REC_AR : reflejo(REC_AR);
        return tr;
      };
      /* antes de rodar, el brazo de abajo viene hacia el pecho: el codo resbala por el suelo y el antebrazo se levanta (como en 79-gluteos.js) */
      var Q0 = girado(0, 0), Sq = resolver(Q0).d.hom, cq = mas(Sq, por(unidad([-0.96, (5.85 - Sq[1]) / D.brazo, 0.27]), D.brazo));
      P.q = sobre(Q0, { bd: { a: mas(cq, por(unidad([0.35, 0.8, 0.49]), D.antebrazo)), polo: menos(cq, Sq) }, bi: REC_AR, m: FLOJA });
      P.as = rodar(1); P.sa = rodar(-1);
      P.s = sobre(SUPINO_SUELO, { pel: [0, 11.5, 0], p: { suelo: [11, 45], abre: 4, polo: [0.1, 1, 0.2] }, t: { tob: 8 }, b: { a: [8, 5, 14.5], en: 'torax', polo: [0.8, -0.7, -0.5] }, m: { tipo: 'plana', prono: 70 } });
      P.q2 = refleja(P.q); P.a2 = refleja(P.a);
      var KD = ['md'], vuelta = [['q', 0.6, 'suave'], ['as', 0.42, 'entra'], ['s', 0.36, 'lineal'], ['sa', 0.36, 'lineal'], ['q2', 0.42, 'sale'], ['a2', 0.7, 'suave']];
      return {
        vista: [[-90, 14], [-40, 34]], rastro: 'mi', clavos: [],
        posturas: P, inicio: 'a', encuadra: ['a', 'b', 'a2', 's'],
        pasos: ['a', 'a', { sec: [['m1', 1.3, 'entra', KD], ['b', 1.5, 'sale', KD]], desde: 'a' },
                { sec: [['b', 1.2, null, KD], ['m1', 1.2, 'entra', KD], ['a', 1.3, 'sale', KD], ['a', 0.3, null, KD]].concat(vuelta), desde: 'b', dura: 7.2 }]
      };
    })();

    /* la rotación de hombros, tumbado: boca arriba, con las piernas estiradas; abre los brazos en cruz y dobla los codos (los antebrazos,
       en el suelo hacia los pies; después, las manos al techo): los hombros y los brazos siguen apoyados todo el tiempo; deja caer los
       antebrazos hacia atrás y mantiene; vuelve a apuntar al techo y los deja caer hacia delante, hacia la cadera, y mantiene. El codo
       no se mueve: el antebrazo gira sobre el brazo */
    COREO['rotacion-hombros-tumbado'] = (function () {
      var base = sobre(SUPINO_SUELO, { pel: [0, 11.5, 0], cab: [4, 0, 0], p: { e: EN_SUELO_PIERNA, z: 0, c: 0 }, t: { tob: 8 } }), h = resolver(base).i.hom;
      var CODO = [h[0] + Math.sqrt(D.brazo * D.brazo - (h[1] - 5.8) * (h[1] - 5.8)), 5.8, h[2]];
      /* el antebrazo, a «g» grados de apuntar al techo: negativo, hacia atrás (la cabeza); positivo, hacia delante (la cadera) */
      var con = function (g) {
        var c = Math.cos(g * RAD), s_ = Math.sin(g * RAD);
        return sobre(base, { b: { a: [CODO[0], CODO[1] + D.antebrazo * c, CODO[2] + D.antebrazo * s_], polo: menos(CODO, h) }, m: { tipo: 'abierta', palma: [0, -s_, c] } });
      };
      var s0 = sobre(base, { b: { a: [27, ALTO_MUN, h[2] + 47.5], polo: [1, 0.2, 0] } }), s = conPosadas(s0);
      var t0 = sobre(base, { b: { a: [CODO[0], ALTO_MUN, CODO[2] + Math.sqrt(D.antebrazo * D.antebrazo - (5.8 - ALTO_MUN) * (5.8 - ALTO_MUN))], polo: menos(CODO, h) } }), t = conPosadas(t0);
      var KM = ['mi', 'md'];
      return {
        vista: [[40, 28], [-28, 40]], isometrico: 'e', clavos: [],
        posturas: { s: s, t: t, m: con(45), u: con(0), e: con(-76), i: con(64) }, inicio: 's', encuadra: ['s', 'u', 'e'],
        pasos: ['s', { sec: [['t', 1.3, 'suave', KM], ['m', 0.6, 'entra'], ['u', 0.7, 'sale']], desde: 's' }, { sec: [['e', 2.1, 'suave']], desde: 'u' },
                { sec: [['e', 1.4], ['u', 1.4, 'suave'], ['i', 1.8, 'suave']], desde: 'e' }]
      };
    })();

    /* el abrazo: sentado (en el suelo, con las piernas tendidas y las manos en los muslos); abre los brazos en cruz y los alarga todo lo
       que puede; después los cruza delante del pecho, abrazándose (cada mano, en el hombro contrario; la espalda alta se redondea);
       mantiene y relaja */
    COREO['abrazo-espalda-alta'] = (function () {
      var base0 = { pel: [0, 11.8, 0], giro: [0, 2, 0], cab: [-2, 0, 0] }, c = resolver(base0).i.cad;
      var pierna = function (y) { return { p: { a: [9, y, c[2] + Math.sqrt(76.3 * 76.3 - 1 - (c[1] - y) * (c[1] - y))], polo: [0, 1, 0] }, t: { tob: 0 } }; };
      var base = sobre(base0, pierna(busca(function (y) { return bajoZapa(resolver(sobre(base0, pierna(y))).i, 'i'); }, -0.2, 3, 14)));
      var s = enSusMuslos(base);
      var t = manos(sobre(base, { b: aTorax(D.hombroX + L_BRAZO - 0.4, HY, -1, [0, -1, -0.4]), hom: [0, -1] }), [1, 0, 0], [0, -1, 0]);
      /* de la cruz al abrazo, los brazos vienen por delante, a la altura del pecho: sin esta postura de paso, la mezcla de la cruz y
         del abrazo subía las manos a la altura de la cabeza y las pasaba por la cara (22-11-2026: 8,7 cm dentro) */
      var m = manos(sobre(base, { b: aTorax(D.hombroX + 1, HY - 3, 40, [1, -0.45, 0]), hom: [0, 1], col: [4, 0, 0], cab: [3, 0, 0] }), [0, 0, 1], [-0.7, -0.7, 0]);
      /* el brazo izquierdo, por encima y por delante del derecho: los antebrazos se cruzan a 10 cm uno de otro; las manos, sobre el hombro contrario */
      var b = sobre(base, { bi: aTorax(-17, HY + 1, 16.5, [0.2, -0.45, 1]), bd: { a: [17, HY - 8.5, 12.5], en: 'torax', polo: [-0.2, -0.9, 1] }, mi: { tipo: 'suelta', palma: [0.5, 0, -0.87] }, md: { tipo: 'suelta', palma: [-0.5, 0, -0.87] },
        hom: [0, 4], col: [10, 0, 0], cab: [8, 0, 0] });
      return {
        vista: [[28, 14], [150, 22]], isometrico: 'b', clavos: T2,
        posturas: { s: s, t: t, m: m, b: b }, inicio: 's', encuadra: ['s', 't'],
        pasos: [{ sec: [['s', 0.6], ['t', 1.8, 'suave']], desde: 's' }, { sec: [['m', 1.0, 'entra'], ['b', 1.3, 'sale']], desde: 't' }, { sec: [['b', 2.4], ['s', 1.9, 'suave']], desde: 'b' }]
      };
    })();

    /* la zancada baja con rotación: la pierna derecha, atrás y estirada (sobre la punta del pie); el tobillo izquierdo, bajo la rodilla; y
       una mano a cada lado del pie de delante; lleva el brazo izquierdo hacia arriba y gira el tronco hacia el interior del muslo
       izquierdo; vuelve al centro, repite y cambia de lado (un pie va atrás, a la plancha, y el otro viene adelante: las manos no se
       mueven). El brazo que sigue apoyado, estirado: se busca la inclinación del tronco que deja su hombro a un brazo justo de la mano */
    COREO['zancada-corredor-rotacion'] = (function () {
      var W = [17, ALTO_MUN, 0], Wd = [-17, ALTO_MUN, 0], YH = 36, ZF = -4, CODO = [0.6, 0.3, -1], P = {};
      var ZH = ZF - Math.sqrt(D.muslo * D.muslo - 9 - (46 - YH) * (46 - YH)), ZB = ZH - Math.sqrt(77.9 * 77.9 - (YH - TOB_PUNTA) * (YH - TOB_PUNTA));
      var ATRAS = { a: [-10, TOB_PUNTA, ZB], polo: [0, -0.64, 0.77] };
      var piernas = { pi: { suelo: [5, ZF], abre: 2, polo: [0.1, 1, 0.25] }, pd: ATRAS, td: PIES_PUNTA };
      var tronco = function (pel, cab, col, cabeza, extra) { return sobre({ pel: pel, giro: [0, cab, 0], col: col, cab: cabeza, b: { a: W, polo: CODO }, m: EN_SUELO }, extra); };
      P.a = conPosadas(aUnBrazo(function (cab) { return tronco([0, YH, ZH], cab, [32, 0, 0], [-30, 0, 0], piernas); }, W, 25, 88));
      /* la mano izquierda se despega (m) y el brazo sube en la línea de los hombros (u): el tronco gira 48° */
      var m0 = sobre(P.a, { bi: { a: [17, 11, 1], polo: CODO } });
      P.m = sobre(m0, { mi: manoHacia(m0, 'i', [0, 0, 1], [0, -1, 0], 'abierta', P.a.mi.prono) });
      var Qu = function (cab) { return sobre(P.a, { giro: [0, cab, 0], col: [26, 0, -GIRO_IZQ * 48], cab: [-12, -MIRA_DER * 52, 0], bi: aLosLados(8), mi: { tipo: 'abierta', prono: 0 } }); };
      var u0 = Qu(busca(function (cab) { return largo(menos(resolver(Qu(cab)).d.hom, Wd)); }, L_BRAZO, 25, 88)), Eu = resolver(u0);
      P.u = sobre(estirado(u0, mas(Eu.i.hom, por(unidad(mas(por(unidad(menos(Eu.i.hom, Eu.d.hom)), 0.3), [0, 1, 0])), 100)), 'bi', 0.3, [0, -0.3, -1]), { hom: { i: [2, -2], d: [0, 0] } });
      /* el cambio de pierna: el pie de delante va atrás (s1: a medio camino, en el aire) hasta la plancha (pl); y el otro viene adelante */
      var up = unidad([0, 53.3 - TOB_PUNTA, -2 - ZB]), PP = [0, TOB_PUNTA + 77.9 * up[1], ZB + 77.9 * up[2]];
      /* por el camino: el talón se levanta con la punta aún en el suelo (s0) y el pie va hacia atrás a ras de suelo, de puntillas, con la
         rodilla recogida bajo el pecho (s1, s2): el tobillo va clavado a su camino, en línea recta, y la cadera sube lo justo para que la
         rodilla no toque el suelo al pasar */
      /* (los brazos, algo flojos en estas posturas de paso: de una a otra el hombro se acerca y se aleja un centímetro de la mano, y con
         el brazo estirado del todo el codo daba un tirón al llegar al tope) */
      var paso = function (pel, col, pierna) {
        var Q = function (cab) { return tronco(pel, cab, [col, 0, 0], [-24, 0, 0], sobre({ pd: ATRAS, td: PIES_PUNTA }, pierna)); };
        return conPosadas(Q(busca(function (cab) { return largo(menos(resolver(Q(cab)).i.hom, W)); }, L_BRAZO - 2.2, 25, 89)));
      };
      var aRas = function (z) { return { pi: { a: [8.5, TOB_PUNTA + 2.5, z], polo: [0, -0.5, 1] }, ti: PIES_PUNTA }; };
      /* la cadera, a «y» de alto y donde deja estirada la pierna de atrás, que no se mueve */
      var cadera = function (y) { return [0, y, ZB + Math.sqrt(77.9 * 77.9 - (y - TOB_PUNTA) * (y - TOB_PUNTA))]; };
      P.s00 = paso(cadera(38.5), 30, { pi: { suelo: [5, ZF], abre: 2, talon: 31, polo: [0.1, 1, 0.25] } });
      P.s0 = paso(cadera(41.5), 28, { pi: { suelo: [5, ZF], abre: 2, talon: 62, polo: [0.1, 1, 0.25] } });
      P.s1 = paso(cadera(50), 22, aRas(-48));
      P.s2 = paso(cadera(47), 12, aRas(-102));
      P.pl = paso(PP, 6, { pi: { a: [10, TOB_PUNTA, ZB], polo: [0, -0.64, 0.77] }, ti: PIES_PUNTA });
      ['a', 'm', 'u', 's00', 's0', 's1', 's2'].forEach(function (n) { P[n + '2'] = refleja(P[n]); });
      var KDm = ['md', 'ti', 'td'], KIm = ['mi', 'ti', 'td'];
      /* el último paso enseña el cambio de lado: vuelve al centro, cambia de pierna y gira hacia el otro lado. (Como repetición no se
         vería: el paso dura lo que se tarda en leerlo, 4,4 s, y el cambio llegaría después) */
      return {
        vista: [[60, 12], [-64, 16]], rastro: 'mi', clavos: K4,
        posturas: P, inicio: 'a', encuadra: ['a', 'u', 'u2', 'pl'],
        pasos: ['a', { sec: [['m', 0.4, 'entra', KDm], ['u', 1.3, 'sale', KDm]], desde: 'a' },
                { sec: [['u', 0.5, null, KDm], ['m', 0.9, 'entra', KDm], ['a', 0.4, 'sale', KDm], ['s00', 0.2, 'entra', K4], ['s0', 0.16, 'lineal', K4], ['s1', 0.32, 'lineal', K4], ['s2', 0.34, 'lineal', K4], ['pl', 0.34, 'sale', K4],
                        ['s22', 0.34, 'entra', K4], ['s12', 0.34, 'lineal', K4], ['s02', 0.32, 'lineal', K4], ['s002', 0.16, 'lineal', K4], ['a2', 0.2, 'sale', K4], ['a2', 0.25, null, K4], ['m2', 0.4, 'entra', KIm], ['u2', 1.1, 'sale', KIm]], desde: 'u', dura: 6.9 }]
      };
    })();
  })();
    return {"estiramiento-pecho-manos-entrelazadas-espalda": "a49d0f911e27", "estiramiento-brazos-arriba-manos-entrelazadas": "ab344f8a3b8f", "estiramiento-lateral-brazos-arriba": "34e16c6c88e7", "apertura-codos-manos-nuca": "ebcce4461aa0", "estiramiento-espalda-alta-manos-delante": "eeae1bb39225", "giro-cabeza-estiramiento": "6dfc550aa42d", "separar-juntar-omoplatos-brazos-al-frente": "85cca1df61eb", "tijeras-brazos-omoplatos": "eaf5510e07b3", "circulos-codos-manos-hombros": "6c97c4f9fbe5", "letras-t-l-brazos": "05888e2d19ea", "letras-y-w-candelabro": "2d576e791f76", "marcha-dedos-movilidad-hombros": "f3fb322e7fc6", "circulos-munecas-dedos-entrelazados": "4f0e50bb7e91", "estiramiento-oracion-invertida": "7e3507edd135", "rotaciones-muneca": "c334aa7804f2", "perro-boca-abajo": "cba0639aaee5", "perro-boca-abajo-desde-plancha": "d4b8286e4bf2", "estiramiento-antebrazos-rodillas-manos-suelo": "2a973a95ea12", "enhebrar-la-aguja": "9916f023c60d", "rotacion-cuadrupedia-mano-nuca": "1d0fa271fbc0", "postura-nino-lateral": "c54eb220ccd2", "subir-manos-por-la-pared": "73929101b2eb", "estiramiento-espalda-manos-pared": "3c315994cca4", "estiramiento-hombros-pared-brazos-en-cruz": "bd3f0c690204", "estiramiento-durmiente-de-pie-pared": "b315e941616c", "barrido-circular-brazo-pared": "4c9cb184d8d0", "libro-abierto-tumbado": "b8fa62e5fc9c", "rotacion-hombros-tumbado": "05baa2f1442a", "abrazo-espalda-alta": "fa29f75a6888", "zancada-corredor-rotacion": "c835b5cee56f"};
  });
})();
