/* modulos/entrenador/hombros.<huella>.js — Jérôme, el entrenador: las coreografías de «hombros» (34 ejercicios).
   Lo pide modulos/entrenador.js al abrir la ficha de uno de ellos (TG_ENTRENADOR.pedir); solo, no hace nada.
   <huella> son los 8 primeros caracteres del sha256 de este fichero: si cambia una coma, cambia el nombre, y cada
   motor pide los suyos. Recibe del motor lo que usa de él (N) y le devuelve las huellas de los pasos de sus fichas.

   NO EDITAR A MANO: lo hace tools/entrenador/construir.py con tools/entrenador/src/74-hombros.js. */
(function () {
  'use strict';
  var T = window.TG_ENTRENADOR;
  if (!T || typeof T._trozo !== 'function') return;
  T._trozo('hombros', function (N) {
    var ALTO = N.ALTO, ALTO_MUN = N.ALTO_MUN, BANCO_DETRAS = N.BANCO_DETRAS, BRAZO = N.BRAZO, COREO = N.COREO, D = N.D, DE_PIE = N.DE_PIE,
        EN_SUELO = N.EN_SUELO, HOMBRO = N.HOMBRO, PIE = N.PIE, PIES_PUNTA = N.PIES_PUNTA, RAD = N.RAD, SUELTA = N.SUELTA, TOB_PUNTA = N.TOB_PUNTA,
        V = N.V, aLosLados = N.aLosLados, aUnBrazo = N.aUnBrazo, abre = N.abre, anteTronco = N.anteTronco, aplicar = N.aplicar, apoyada = N.apoyada,
        arco = N.arco, bajaSube = N.bajaSube, busca = N.busca, cabezaAPlano = N.cabezaAPlano, colgando = N.colgando, conAgarre = N.conAgarre,
        cruz = N.cruz, cuelga = N.cuelga, el = N.el, entre = N.entre, estirado = N.estirado, flexion = N.flexion, girar = N.girar,
        inclinado = N.inclinado, largo = N.largo, lejos = N.lejos, mas = N.mas, menos = N.menos, miembroAPlano = N.miembroAPlano,
        pieSobreSuelo = N.pieSobreSuelo, por = N.por, punto = N.punto, quieto = N.quieto, refleja = N.refleja, reflejo = N.reflejo,
        resolver = N.resolver, sentadoAlBorde = N.sentadoAlBorde, sentadoEnRespaldo = N.sentadoEnRespaldo, silla5 = N.silla5, sobre = N.sobre,
        tabla = N.tabla, troncoAPlano = N.troncoAPlano, une = N.une, unidad = N.unidad, zapaAPlano = N.zapaAPlano;
  /* ───────────────────────── las coreografías: HOMBROS (bloque 5) ─────────────────────────
     Las mismas reglas que en 70-coreografias.js: cada una sale de los pasos verificados de su ficha y no añade técnica
     que la ficha no diga. Van por familias: los press, las elevaciones, el deltoides posterior (los pájaros, las aperturas
     inversas, los remos), los rotadores, lo de calistenia (la pica, el pino, la pseudoplancha, la flexión hindú) y los
     estiramientos. Lo que se coge en un paso («agarre la barra», «agarre el asa») espera en su sitio hasta ese paso. */
  (function () {
    /* ── las manos ── */
    var PRESS = { tipo: 'puno', barra: [1, 0, 0], palma: [0, 0, 1] };             /* las palmas hacia delante (el agarre de un press) */
    var HACIA_EL = { tipo: 'puno', barra: [1, 0, 0], palma: [0, 0, -1] };         /* hacia él (o hacia atrás, con el brazo colgando) */
    var NEUTRA = { tipo: 'puno', barra: [0, 0, 1], palma: [-1, 0, 0] };           /* enfrentadas: la mancuerna, de delante atrás */
    var ABAJO = { tipo: 'puno', barra: [1, 0, 0], palma: [0, -1, 0] };            /* hacia abajo, lo que agarra va de lado a lado */
    var ABAJO_Z = { tipo: 'puno', barra: [0, 0, 1], palma: [0, -1, 0] };          /* hacia abajo, lo que agarra va de delante atrás (el brazo, en cruz) */
    var EN_MUSLO = { tipo: 'abierta', prono: 90 };

    /* ── sentado: silla5, sentadoEnRespaldo, BANCO_DETRAS y sentadoAlBorde, en 70-coreografias.js (los usa también el bloque 6) ── */
    /* la muñeca, dicha desde el hombro y en el marco del tórax (gira con el tronco): hacia fuera, hacia la cabeza, hacia delante */
    function desdeHombro(d, polo) { return { a: [D.hombroX + d[0], D.hombroY + d[1], d[2]], en: 'torax', polo: polo || [1, -1, 0.2] }; }

    /* ══════════ los press ══════════ */
    /* con barra, sentado en un banco con el respaldo casi vertical. La barra espera en su soporte, detrás y por encima de la cabeza:
       en el paso 2 la coge (las palmas hacia delante, algo más que la anchura de los hombros) y la baja por delante de la cabeza
       hasta la altura de los hombros; en el 3 empuja sin bloquear los codos, hace una pausa y baja con control.
       (20-11-2026) «Por delante de la cabeza» de verdad: arriba la barra queda 12 cm por delante de los hombros (antes, 6,5) y abajo
       echa la cabeza atrás para dejarle paso (antes la tenía quieta, y a media subida la barra se le metía 5,8 cm por la frente:
       lo mide la auditoría, «la cabeza y las barras»). Abajo los codos van más abiertos: el antebrazo, vertical, y la barra sobre
       la muñeca, que no se le eche encima */
    COREO['press-hombros-barra-sentado'] = (function () {
      var G = 25, base = sentadoEnRespaldo(85, { cab: [4, 0, 0] }), h = resolver(base).i.hom;
      var Hs = Math.round(h[1] + 55), Zs = 4, enSop = [0, Hs + 0.6, Zs + 4];        /* (22-11-2026) el soporte, 4 cm más alto: al sacar la barra, pasaba rozando las púas del tupé */
      var P = function (extra) { return sobre(base, sobre({ m: PRESS }, extra || {})); };
      return {
        vista: [34, 100], rastro: 'manos', esfuerzo: [0], clavos: ['ti', 'td', 'mi', 'md'], reposo: ['s'],
        material: [silla5(85), ['soporte', { z: Zs, alto: Hs, ancho: 52 }], ['barra', { discos: 17, reposo: enSop }]],
        posturas: {
          s: sobre(base, { b: { a: [14, 63.5, h[2] + 27], polo: [1, -0.3, -0.7] }, m: EN_MUSLO }),
          g: conAgarre(P({ cab: [-6, 0, 0] }), [G, enSop[1], enSop[2]], [1, -0.15, 0.6]),
          u: conAgarre(P({ cab: [0, 0, 0] }), [G, h[1] + 56.9, h[2] + 12], [1, -0.2, 0.3]),      /* sin bloquear los codos: a 15° de estirarse, como antes */
          b: conAgarre(P({ cab: [-16, 0, 0] }), [G, h[1] + 1.5, h[2] + 17], [0.9, -1, 0])
        },
        inicio: 'b', encuadra: ['s', 'g', 'u'],
        rep: [['u', 1.2, 'empuje'], ['u', 0.7], ['b', 1.7, 'freno'], ['b', 0.4]],
        /* hasta que la coge, las manos van sueltas (salen de encima de los muslos sin atravesarlos) */
        pasos: ['s', { sec: [['g', 1.2, 'suave', ['ti', 'td']], ['g', 0.25], ['u', 1.0, 'suave'], ['u', 0.2], ['b', 1.6, 'freno']], desde: 's' }, 'rep']
      };
    })();
    /* con mancuernas, sentado con la cabeza, los hombros y los glúteos en el respaldo: las mancuernas esperan sobre los muslos; a la
       altura de los hombros, con las palmas hacia delante y los codos algo adelantados; arriba, los codos estirados y las mancuernas
       cerca, sin chocar; y bajan despacio */
    var EN_PIE_MUSLO = { tipo: 'puno', barra: [0, 1, 0], palma: [-1, 0, 0] };          /* la mancuerna, de pie sobre el muslo */
    COREO['press-hombros-mancuernas'] = (function () {
      var base = sentadoEnRespaldo(85, { cab: [4, 0, 0] }), h = resolver(base).i.hom;
      var P = function (m) { return sobre(base, { m: m }); };
      return {
        vista: [28, 84], rastro: 'manos', esfuerzo: [0], clavos: ['ti', 'td'],
        material: [silla5(85), ['mancuernas']],
        posturas: {
          s: conAgarre(P(EN_PIE_MUSLO), [14.5, 76, h[2] + 26], [1, -0.4, -0.6]),
          b: conAgarre(P(PRESS), [h[0] + 11, h[1] + 4.5, h[2] + 9], [0.8, -1, 0.9]),
          u: conAgarre(P(PRESS), [15.5, h[1] + 58.2, h[2] + 3], [1, -0.2, 0.5])
        },
        inicio: 'b', encuadra: ['s'],
        rep: [['u', 1.2, 'empuje'], ['u', 0.35], ['b', 1.9, 'freno'], ['b', 0.4]],
        pasos: ['s', { sec: [['b', 1.5, 'suave']], desde: 's' }, 'rep']
      };
    })();
    /* a una mano, de pie (los pies, a la anchura de los hombros): la mancuerna cuelga; sube al hombro con el codo doblado; y de ahí,
       en línea recta, hasta estirar el brazo por encima de la cabeza */
    COREO['press-hombro-mancuerna-un-brazo'] = (function () {
      var base = { p: { suelo: [19, 0], abre: 9 }, bd: aLosLados(10), md: SUELTA }, h = resolver(base).i.hom;
      var P = function (m) { return sobre(base, { mi: m }); };
      return {
        vista: [22, 84], rastro: 'mi', esfuerzo: [0], clavos: ['ti', 'td'],
        material: [['mancuernas', { lado: 'i' }]],
        posturas: {
          s: estirado(P(NEUTRA), [h[0] + 3, h[1] - 100, h[2] + 2], 'bi', 0.35, [1, 0.2, -0.6]),
          b: conAgarre(P(PRESS), [h[0] + 8.5, h[1] + 3.5, h[2] + 7], [0.75, -1, 0.35], 'bi'),
          u: conAgarre(P(PRESS), [h[0] + 1, h[1] + 58.4, h[2] + 2], [1, -0.2, 0.5], 'bi')
        },
        inicio: 'b', encuadra: ['s'],
        rep: [['u', 1.2, 'empuje'], ['u', 0.3], ['b', 1.7, 'freno'], ['b', 0.45]],
        pasos: ['s', { sec: [['b', 1.4, 'suave']], desde: 's' }, 'rep']
      };
    })();
    /* Arnold: sentado, las mancuernas ante los hombros con las palmas hacia él; al empujar giran los antebrazos y arriba las palmas
       miran hacia delante, con las mancuernas cerca y los codos sin bloquear; baja deshaciendo el giro */
    COREO['press-arnold'] = (function () {
      var base = sentadoAlBorde(0), h = resolver(base).i.hom;
      /* (22-11-2026) el giro, repartido por toda la subida: a media altura (m) las palmas se miran y los codos ya se abren. Dicho solo
         abajo (hacia él) y arriba (hacia delante), la palma pasaba de un lado al otro por un punto en el que no miraba a ningún sitio, y
         el puño daba media vuelta de golpe a mitad de camino. La mancuerna gira con la mano (su eje, de atravesado a de frente y otra
         vez atravesado); el sentido de cada eje está elegido para que la palma quede siempre del mismo lado de él */
      var mano = function (bi, pi, bd, pd) { return { mi: { tipo: 'puno', barra: bi, palma: pi }, md: { tipo: 'puno', barra: bd, palma: pd } }; };
      return {
        vista: [26, 76], rastro: 'manos', esfuerzo: [0, 1], clavos: ['ti', 'td'],
        material: [BANCO_DETRAS, ['mancuernas']],
        posturas: {
          b: conAgarre(sobre(base, mano([1, 0, 0], [0, 0, -1], [-1, 0, 0], [0, 0, -1])), [12, h[1] + 3, h[2] + 21], [0.25, -1, 0.3]),
          m: conAgarre(sobre(base, mano([0, 0, -1], [-1, 0, 0], [0, 0, -1], [1, 0, 0])), [14.5, h[1] + 29, h[2] + 13], [0.8, -0.8, 0.35]),
          u: conAgarre(sobre(base, mano([-1, 0, 0], [0, 0, 1], [1, 0, 0], [0, 0, 1])), [15.5, h[1] + 57.4, h[2] + 3], [1, -0.2, 0.5])
        },
        inicio: 'b',
        rep: [['m', 0.45, 'lineal'], ['u', 1.0, 'sale'], ['u', 0.4], ['m', 0.95, 'freno'], ['b', 0.95, 'freno'], ['b', 0.4]],
        pasos: ['b', 'rep', { rep: 1.45 }]
      };
    })();
    /* en un banco inclinado a 45 grados: las mancuernas, sobre los muslos; empieza con los codos doblados y los brazos a la altura de
       los hombros; y empuja hacia arriba hasta juntarlas por encima de los hombros */
    COREO['press-hombros-inclinado-mancuernas'] = (function () {
      var base = sentadoEnRespaldo(45, { cab: [10, 0, 0] }), h = resolver(base).i.hom;
      var P = function (m) { return sobre(base, { m: m }); };
      return {
        vista: [44, 98], picado: 12, rastro: 'manos', esfuerzo: [0], clavos: ['ti', 'td'],
        material: [silla5(45), ['mancuernas']],
        posturas: {
          s: conAgarre(P(EN_PIE_MUSLO), [14.5, 76, h[2] + 44], [1, -0.4, -0.6]),
          b: conAgarre(P(PRESS), [h[0] + 27, h[1] + 30, h[2] + 1], [1, -0.35, 0]),
          u: conAgarre(P(PRESS), [13.6, h[1] + 58.2, h[2] + 1.5], [1, -0.1, 0.4])
        },
        inicio: 'b', encuadra: ['s'],
        rep: [['u', 1.3, 'empuje'], ['u', 0.3], ['b', 1.9, 'freno'], ['b', 0.4]],
        pasos: ['s', { sec: [['b', 1.5, 'suave']], desde: 's' }, 'rep']
      };
    })();
    /* con rotación del tronco: de pie (los pies, a la anchura de la cadera), las mancuernas ante los hombros con las palmas enfrentadas;
       gira el tronco a un lado y, al acabar el giro, empuja la de ese lado; la baja, gira al otro y empuja la otra */
    COREO['press-hombros-rotacion'] = (function () {
      var pies = { p: { suelo: [10, 0], abre: 8 } };
      var ante = desdeHombro([-5, -3.5, 17], [0.45, -1, 0.15]), arriba_ = desdeHombro([0.5, 50.2, 2], [1, -0.2, 0.5]);
      /* la mancuerna gira con el tronco: su agarre va de delante atrás de él, no del mundo */
      var mano = function (g) { var s = Math.sin(g * RAD), c = Math.cos(g * RAD); return { tipo: 'puno', barra: [s, 0, c], palma: [-c, 0, s] }; };
      var girado = function (g, sube) {
        var mi = mano(g), md = reflejo(mano(-g));
        return sobre(pies, { giro: [g * 0.28, 0, 0], col: [0, 0, g * 0.72], cab: [0, -g * 0.25, 0], bi: sube ? arriba_ : ante, bd: reflejo(ante), mi: mi, md: md });
      };
      var gi = girado(50), pi_ = girado(50, true);
      return {
        vista: [6, 64], rastro: 'manos', clavos: ['ti', 'td'],
        material: [['mancuernas']],
        posturas: { a: girado(0), gi: gi, pi: pi_, gd: refleja(gi), pd: refleja(pi_) },
        pasos: ['a', { sec: [['gi', 1.0, 'suave'], ['pi', 1.1, 'empuje'], ['pi', 0.5]], desde: 'a' },
                { sec: [['gi', 1.2, 'freno'], ['gd', 1.3, 'suave'], ['pd', 1.1, 'empuje'], ['pd', 0.6]], desde: 'pi' }]
      };
    })();
    /* push press: de pie, la barra apoyada por delante sobre los hombros; flexiona las rodillas con el tronco recto; estira las piernas
       con fuerza y, con ese impulso, la barra sube por encima de la cabeza; y baja con control a los hombros.
       (20-11-2026) La barra rodea la cara. Sale de los hombros, pegada al cuello, y acaba encima de la cabeza: en línea recta de un
       sitio al otro (como estaba) pasaba por dentro de la cara (11 cm). Ahora hay una postura a media subida (m): la barra, a la
       altura de la nariz y 16,5 cm por delante de los hombros, con la cabeza echada atrás; de ahí sube y vuelve sobre la cabeza. Los
       tiempos son los mismos: hasta «m» va a velocidad constante y de «m» arriba frena desde esa misma velocidad (lineal y sale:
       no se nota la costura), y baja igual, al revés. Arriba queda 9 cm por delante de los hombros (antes, 5) */
    COREO['push-press'] = (function () {
      var G = 26, pies = { suelo: [16, 0], abre: 10, polo: [0.3, 0.1, 1] };
      var enHombros = function (P) { var h = resolver(P).i.hom; return conAgarre(P, [G, h[1] + 3.5, h[2] + 11.5], [0.35, -1, 0.75]); };
      var deP = { p: pies, m: PRESS, cab: [-10, 0, 0] }, h0 = resolver(deP).i.hom;
      return {
        vista: [36, 84], rastro: 'manos', esfuerzo: [0, 1, 2], clavos: ['ti', 'td', 'mi', 'md'],
        material: [['barra', { discos: 21 }]],
        posturas: {
          a: enHombros(deP),
          d: enHombros({ pel: [0, PIE - 6.5, -2.5], giro: [0, 2, 0], p: pies, m: PRESS, cab: [-10, 0, 0] }),
          m: conAgarre({ p: pies, m: PRESS, cab: [-16, 0, 0] }, [G, h0[1] + 23, h0[2] + 16.5], [0.6, -0.8, 0.6]),
          u: conAgarre({ p: pies, m: PRESS, cab: [-9, 0, 0] }, [G, h0[1] + 57.1, h0[2] + 10.5], [0.6, -0.2, 0.8])
        },
        inicio: 'd', encuadra: ['u'],
        rep: [['a', 0.3, 'sale'], ['m', 0.12, 'lineal'], ['u', 0.43, 'sale'], ['u', 0.55], ['m', 0.96, 'lineal'], ['a', 0.54, 'lineal'], ['a', 0.4], ['d', 0.8, 'suave'], ['d', 0.2]],
        pasos: ['a', { sec: [['d', 1.0, 'suave']], desde: 'a' }, 'rep']
      };
    })();

    /* ══════════ las elevaciones ══════════ */
    /* laterales, sentado: el tronco, ligeramente inclinado; los brazos suben por los lados, con los codos un poco flexionados, hasta la
       altura de los hombros; y bajan despacio */
    COREO['elevaciones-laterales-sentado'] = (function () {
      var base = sentadoAlBorde(10), h = resolver(base).i.hom;
      return {
        vista: [10, 64], rastro: 'mi', esfuerzo: [0], clavos: ['ti', 'td'],
        material: [BANCO_DETRAS, ['mancuernas']],
        posturas: {
          a: colgando(sobre(base, { m: NEUTRA }), 23, 0),
          b: sobre(base, { b: { a: [h[0] + 49, h[1] + 1.5, h[2] + 4], polo: [0.3, -0.35, -1] }, m: ABAJO_Z })
        },
        rep: [['b', 1.3, 'empuje'], ['b', 0.3], ['a', 2.0, 'freno'], ['a', 0.4]],
        pasos: ['a', 'rep', { rep: 1.6 }]
      };
    })();
    /* frontal con barra: de pie, las rodillas algo flexionadas, la barra con las palmas hacia abajo; con los brazos estirados sube por
       delante hasta la altura de los hombros, se mantiene un momento y baja con el mismo control */
    COREO['elevacion-frontal-barra'] = (function () {
      var G = 19, base = { pel: [0, PIE - 2.5, -2.5], giro: [0, 2, 0], p: { suelo: [19, 0], abre: 8 } }, h = resolver(base).i.hom;
      return {
        vista: [-50, 18], rastro: 'manos', esfuerzo: [0, 1], clavos: ['ti', 'td'],
        material: [['barra', { discos: 13 }]],
        posturas: {
          a: colgando(sobre(base, { m: HACIA_EL }), G, 9),
          b: estirado(sobre(base, { m: ABAJO }), [G, h[1] + 1, h[2] + 100], 'b', 0.3, [1, -0.3, -0.2])
        },
        rep: [['b', 1.5, 'suave'], ['b', 0.7], ['a', 1.5, 'suave'], ['a', 0.4]],
        pasos: ['a', 'rep', { rep: 1.5 }]
      };
    })();

    /* ── en polea, a una mano ──
       La columna queda a su derecha (x negativo) y el asa espera colgando de la polea: la coge con la mano más alejada, la izquierda,
       girando el tronco hacia la máquina; el cable pasa por delante del cuerpo. */
    var XC = -58, ZP = 24;
    function asaEn(alto) { return [XC + 17, alto < 40 ? alto + 8 : alto - 8, ZP]; }          /* donde espera el asa: colgando de la polea (o sobre ella, si está abajo) */
    function poleaLado(alto, extra) { return ['polea', une({ en: [XC, ZP], rumbo: -90, alto: alto, a: 'i', agarre: 'asa', reposo: asaEn(alto), encuadre: 150 }, extra)]; }
    var PIES_L = { p: { suelo: [12, 0], abre: 8 } }, OTRO_SUELTO = { bd: aLosLados(10), md: SUELTA };
    /* de pie, gira y se inclina hacia la máquina hasta que la mano izquierda llega al asa (se busca cuánto); si la polea está abajo,
       además flexiona la cadera y las rodillas */
    function alAsa(alto) {
      var R = asaEn(alto), bajo = alto < 40;
      var P = bajo
        ? function (k) { return sobre(OTRO_SUELTO, { pel: [-9, PIE - 1 - 0.42 * k, -0.3 * k], giro: [-16, k, 0], col: [4, -14, -30], cab: [-k * 0.4, -14, 0], p: { suelo: [12, 0], abre: 9, polo: [0.3, 0.1, 1] }, mi: HACIA_EL }); }
        : function (k) { return sobre(PIES_L, sobre(OTRO_SUELTO, { pel: [-3 - k * 0.2, PIE - 1, 2], giro: [-k * 0.5, 4, 0], col: [4, -k * 0.45, -k], cab: [6, -k * 0.5, 0], mi: HACIA_EL })); };
      var k = busca(function (x) { return largo(menos(resolver(P(x)).i.hom, R)); }, BRAZO - 1.2, 0, bajo ? 85 : 60);
      return conAgarre(P(k), R, bajo ? [0.4, 0.3, -1] : [0.2, -0.4, 1], 'bi');
    }
    /* lateral: el brazo va de delante de la cadera contraria hasta quedar paralelo al suelo; una pausa, y baja despacio */
    COREO['elevacion-lateral-polea'] = (function () {
      var HP = 92, P = sobre(PIES_L, OTRO_SUELTO);
      return {
        vista: [14, 152], rastro: 'mi', esfuerzo: [0, 1], clavos: ['ti', 'td'], reposo: ['s'],
        material: [poleaLado(HP)],
        posturas: {
          s: sobre(PIES_L, { b: aLosLados(8), m: SUELTA }), g: alAsa(HP),
          a: conAgarre(sobre(P, { mi: HACIA_EL }), [-7, 85, 17], [0.7, -0.3, 0.7], 'bi'),
          /* (22-11-2026) arriba, el asa va de delante atrás dicha en el sentido que deja la palma del mismo lado de ella que abajo
             (con el otro, a medio camino la palma no sabía de qué lado quedar y el puño daba media vuelta de golpe al bajar) */
          b: sobre(P, { bi: { a: [D.hombroX + 49, HOMBRO + 1, 7], polo: [0.3, -0.35, -1] }, mi: { tipo: 'puno', barra: [0, 0, -1], palma: [0, -1, 0] } })
        },
        inicio: 'a', encuadra: ['s', 'g'],
        rep: [['b', 1.3, 'empuje'], ['b', 0.7], ['a', 2.0, 'freno'], ['a', 0.4]],
        pasos: ['s', { sec: [['g', 1.1, 'suave'], ['g', 0.25], ['a', 1.1, 'suave']], desde: 's' }, 'rep']
      };
    })();
    /* apertura inversa: la polea, a la altura del hombro; el brazo va de cruzado ante el pecho hacia fuera y hacia atrás, en un arco amplio */
    COREO['apertura-inversa-polea-un-brazo'] = (function () {
      var HP = 124, P = sobre(PIES_L, OTRO_SUELTO), ASA_V = { tipo: 'puno', barra: [0, 1, 0], palma: [-1, 0, 0] };
      return {
        vista: [14, 152], rastro: 'mi', esfuerzo: [0, 1], clavos: ['ti', 'td'], reposo: ['s'],
        material: [poleaLado(HP)],
        posturas: {
          s: sobre(PIES_L, { b: aLosLados(8), m: SUELTA }), g: alAsa(HP),
          a: conAgarre(sobre(P, { mi: ASA_V, col: [0, 0, -6] }), [-20, HOMBRO - 6, 27], [0.5, -0.7, 0.4], 'bi'),
          /* (22-11-2026) a medio camino (m), el brazo va por delante del hombro, casi tan largo como al acabar: el arco es amplio. De un
             tirón de cruzado a abierto, la mano pasaba a 25 cm del hombro, con el codo doblado 129° */
          m: conAgarre(sobre(P, { mi: { tipo: 'puno', barra: [0, 1, 0], palma: [-1, 0, 0.2] }, col: [0, 0, -3], hom: { i: [0, -1.2], d: [0, 0] } }), [D.hombroX + 27, HOMBRO - 4, 47], [0.6, -0.7, -0.2], 'bi'),
          b: sobre(P, { hom: { i: [0, -2.5], d: [0, 0] }, bi: { a: [D.hombroX + 46.6, HOMBRO - 2, -19], polo: [0.4, -0.5, -1] }, mi: { tipo: 'puno', barra: [0, 1, 0], palma: [-0.4, 0, 0.9] } })
        },
        inicio: 'a', encuadra: ['s', 'g'],
        rep: [['m', 0.5, 'lineal'], ['b', 1.0, 'sale'], ['b', 0.4], ['m', 1.0, 'freno'], ['a', 1.0, 'freno'], ['a', 0.4]],
        pasos: [{ sec: [['s', 0.9], ['g', 1.1, 'suave'], ['g', 0.25], ['a', 1.1, 'suave']], desde: 's' }, 'rep', { rep: 1.9 }]
      };
    })();
    /* la rotación externa: la polea, a la altura de la cintura (la del codo); el codo, doblado a 90 grados y pegado al costado, no se
       mueve: gira el antebrazo hacia fuera, con suavidad, y vuelve despacio */
    var HACIA_CODO = unidad([2, -27, 1]);                                        /* del hombro al codo, pegado al costado */
    var CODO_L = mas([D.hombroX, HOMBRO, 0], por(HACIA_CODO, D.brazo));          /* el codo izquierdo, de pie: no se mueve de ahí */
    function antebrazoA(g) {                                                     /* el antebrazo, horizontal, a «g» grados del frente (+, hacia fuera) */
      var s = Math.sin(g * RAD), c = Math.cos(g * RAD);
      return { bi: { a: [CODO_L[0] + D.antebrazo * s, CODO_L[1], CODO_L[2] + D.antebrazo * c], polo: HACIA_CODO }, mi: { tipo: 'puno', barra: [0, 1, 0], palma: [-c, 0, s] } };
    }
    COREO['rotacion-externa-polea'] = (function () {
      var HP = 102, P = sobre(PIES_L, OTRO_SUELTO);
      return {
        vista: [16, 60], rastro: 'mi', esfuerzo: [0], clavos: ['ti', 'td'], reposo: ['s'],
        material: [poleaLado(HP)],
        posturas: { s: sobre(PIES_L, { b: aLosLados(8), m: SUELTA }), g: alAsa(HP), a: sobre(P, antebrazoA(-55)), b: sobre(P, antebrazoA(48)) },
        inicio: 'a', encuadra: ['s', 'g'],
        rep: [['b', 1.5, 'suave'], ['b', 0.4], ['a', 2.0, 'freno'], ['a', 0.4]],
        pasos: [{ sec: [['s', 0.9], ['g', 1.1, 'suave'], ['g', 0.25], ['a', 1.1, 'suave']], desde: 's' }, 'rep', { rep: 1.9 }]
      };
    })();
    /* el pájaro con el tronco inclinado: coge el asa de la polea baja y se inclina hasta casi paralelo al suelo; apoya la mano libre en
       el muslo y deja colgar el brazo; y lo sube hacia el lado hasta dejarlo paralelo al suelo */
    COREO['pajaro-polea-inclinado'] = (function () {
      var HP = 22, inc = inclinado(74, { p: { suelo: [12, 0], abre: 8 } }), E0 = resolver(inc), h = E0.i.hom, rod = E0.d.rod;
      var enMuslo = { bd: { a: [rod[0] - 1, rod[1] + 12, rod[2] + 2], polo: [-1, 0.3, -0.4] }, md: { tipo: 'abierta', prono: 90, mun: -35 } };
      var cuelgaI = function (P) { return estirado(sobre(P, { mi: NEUTRA }), [h[0] + 1, h[1] - 100, h[2] + 2], 'bi', 1.2, [1, 0.2, -0.5]); };
      return {
        vista: [30, 150], picado: 12, rastro: 'mi', esfuerzo: [0], clavos: ['ti', 'td'], reposo: ['s'],
        material: [poleaLado(HP)],
        posturas: {
          s: sobre(PIES_L, { b: aLosLados(8), m: SUELTA }), g: alAsa(HP),
          a0: cuelgaI(sobre(inc, OTRO_SUELTO)), a: cuelgaI(sobre(inc, enMuslo)),
          b: sobre(inc, sobre(enMuslo, { hom: { i: [0, -2], d: [0, 0] }, bi: { a: [h[0] + 49.4, h[1] + 1.5, h[2] + 1], polo: [0.2, 1, -0.4] }, mi: ABAJO_Z }))
        },
        inicio: 'a', encuadra: ['s', 'g'],
        rep: [['b', 1.4, 'empuje'], ['b', 0.3], ['a', 2.0, 'freno'], ['a', 0.4]],
        pasos: [{ sec: [['s', 0.8], ['g', 1.3, 'suave'], ['g', 0.25], ['a0', 1.3, 'suave']], desde: 's' }, { sec: [['a', 1.1, 'suave']], desde: 'a0' }, 'rep']
      };
    })();
    /* frontal: de cara a la polea, que está en lo más bajo. En el paso 2 coge el asa con la palma hacia abajo y sube el brazo estirado
       por delante hasta la altura del hombro; una pausa, y baja despacio */
    COREO['elevacion-frontal-polea'] = (function () {
      var XP = 12, ZC = 80, R = [XP + 4, 30, ZC - 26];
      var base = { pel: [0, PIE - 2.5, -2.5], giro: [0, 2, 0], p: { suelo: [12, 0], abre: 8 } }, h = resolver(base).i.hom;
      var P = sobre(base, OTRO_SUELTO);
      var Pg = function (k) { return sobre(OTRO_SUELTO, { pel: [0, PIE - 2 - k * 0.4, -k * 0.4], giro: [0, k, 0], cab: [-k * 0.5, 0, 0], p: { suelo: [12, 0], abre: 9, polo: [0.3, 0.1, 1] }, mi: ABAJO }); };
      var k = busca(function (x) { return largo(menos(resolver(Pg(x)).i.hom, R)); }, BRAZO - 1, 10, 85);
      return {
        vista: [-64, 24], rastro: 'mi', esfuerzo: [0, 1], clavos: ['ti', 'td'], reposo: ['s'],
        material: [['polea', { en: [XP, ZC], alto: 22, a: 'i', agarre: 'asa', reposo: R, encuadre: 150 }]],
        posturas: {
          s: sobre(base, { b: aLosLados(8), m: SUELTA }), g: conAgarre(Pg(k), R, [0.4, 0.3, -1], 'bi'),
          a: estirado(sobre(P, { mi: HACIA_EL }), [h[0] + 1, h[1] - 100, h[2] + 10], 'bi', 0.3, [1, 0.2, -0.6]),
          b: estirado(sobre(P, { mi: ABAJO }), [h[0], h[1] + 1, h[2] + 100], 'bi', 0.3, [1, -0.3, -0.2])
        },
        inicio: 'a', encuadra: ['s', 'g'],
        rep: [['b', 1.3, 'empuje'], ['b', 0.8], ['a', 2.1, 'freno'], ['a', 0.4]],
        pasos: ['s', { sec: [['g', 1.2, 'suave'], ['g', 0.25], ['a', 1.2, 'suave'], ['b', 1.3, 'empuje']], desde: 's' }, { rep: 1.3 }]
      };
    })();

    /* ══════════ el deltoides posterior ══════════ */
    /* los pájaros, sentado: el tronco inclinado hacia delante, los brazos cuelgan; suben hacia los lados hasta la altura de los hombros
       con los codos ligeramente flexionados, y bajan despacio con la misma flexión */
    var CODO_PAJARO = 1.4;                            /* la holgura del brazo «con los codos ligeramente flexionados»: unos 153 grados */
    function enCruz(P, sube) {                        /* los brazos, a los lados y a la altura de los hombros, con esa misma flexión */
      var h = resolver(P).i.hom, L = D.brazo + D.antebrazo - CODO_PAJARO;
      return sobre(P, { b: { a: [h[0] + Math.sqrt(L * L - (sube || 0) * (sube || 0)), h[1] + (sube || 0), h[2]], polo: [0.2, 0.6, -0.8] }, m: ABAJO_Z });
    }
    function cuelgan(P, m, dz) { var h = resolver(P).i.hom; return estirado(sobre(P, { m: m || NEUTRA }), [h[0] + 3, h[1] - 100, h[2] + (dz || 0)], 'b', CODO_PAJARO, [1, 0.2, -0.6]); }
    COREO['pajaros-mancuernas'] = (function () {
      var base = sentadoAlBorde(58, { cab: [-34, 0, 0], p: { suelo: [13, 44], abre: 7 } });
      return {
        vista: [26, 146], picado: 12, rastro: 'manos', esfuerzo: [0], clavos: ['ti', 'td'],
        material: [BANCO_DETRAS, ['mancuernas']],
        posturas: { a: cuelgan(base, NEUTRA, -3), b: enCruz(sobre(base, { hom: [-0.5, -2.5] }), 2) },
        rep: [['b', 1.3, 'empuje'], ['b', 0.3], ['a', 2.0, 'freno'], ['a', 0.4]],
        pasos: ['a', 'rep', { rep: 1.6 }]
      };
    })();
    /* tumbado boca abajo en un banco alto (los brazos cuelgan libres, las puntas de los pies en el suelo). Las mancuernas esperan en el
       suelo: en el paso 2 las coge, con los codos algo flexionados; y en el 3 suben hacia los lados hasta la altura de los hombros */
    function enBancoAlto(alto, extra) {
      var y = alto + 11.5, z = 4, dz = Math.sqrt(77 * 77 - (y - TOB_PUNTA) * (y - TOB_PUNTA));
      return sobre({ pel: [0, y, z], giro: [0, 90, 0], cab: [-14, 0, 0], p: { a: [10, TOB_PUNTA, z - dz], polo: [0, -1, 0.3] }, t: PIES_PUNTA }, extra || {});
    }
    function bancoAlto(alto) { return ['banco', { en: [0, -9], largo: 112, alto: alto }]; }
    COREO['pajaros-tumbado-banco'] = (function () {
      var ALTO_B = 58, base = enBancoAlto(ALTO_B), h = resolver(base).i.hom, enSuelo = [h[0] + 3, 6.6, h[2] + 1];
      var baja = sobre(base, { hom: [0, 4.5], m: NEUTRA });
      return {
        vista: [[-26, 18], [-112, 16]], rastro: 'manos', esfuerzo: [0], clavos: ['ti', 'td'], reposo: ['a0'],
        material: [bancoAlto(ALTO_B), ['mancuernas', { reposo: { i: enSuelo, d: [-enSuelo[0], enSuelo[1], enSuelo[2]] } }]],
        posturas: {
          a0: estirado(sobre(base, { m: SUELTA }), [h[0] + 2, h[1] - 100, h[2] + 1], 'b', 2.2, [1, 0.2, -0.6]),
          g: conAgarre(baja, enSuelo, [1, 0.3, -0.5]),
          a: cuelgan(base, NEUTRA, 1), b: enCruz(sobre(base, { hom: [-0.5, -2.8] }), 1.5)
        },
        inicio: 'a', encuadra: ['a0'],
        rep: [['b', 1.3, 'empuje'], ['b', 0.3], ['a', 1.9, 'freno'], ['a', 0.4]],
        pasos: ['a0', { sec: [['g', 1.0, 'suave'], ['g', 0.2], ['a', 1.0, 'suave']], desde: 'a0' }, 'rep']
      };
    })();
    /* a una mano: la mancuerna, en el suelo junto a él (en su mano); la otra mano, apoyada en el suelo; sube hacia el lado hasta la
       altura del hombro y baja despacio. (Se escribe con el brazo izquierdo y se refleja: el que trabaja queda del lado de la cámara.) */
    COREO['pajaro-tumbado-un-brazo'] = (function () {
      var ALTO_B = 52, base = enBancoAlto(ALTO_B, { hom: { i: [0, 1], d: [0, 6] } }), E = resolver(base), h = E.i.hom, hd = E.d.hom;
      var apoyo = { bd: { a: [hd[0] - 2, 6.5, hd[2] + 2], polo: [-1, 0.3, -0.4] }, md: { tipo: 'abierta', prono: 90, mun: -78 } };
      var a = conAgarre(sobre(base, sobre(apoyo, { mi: NEUTRA })), [h[0] + 5, 6.8, h[2] + 1], [1, 0.3, -0.5], 'bi');
      var Pb = sobre(base, sobre(apoyo, { hom: { i: [-0.5, -2.8], d: [0, 6] }, mi: ABAJO_Z })), hb = resolver(Pb).i.hom, L = D.brazo + D.antebrazo - CODO_PAJARO;
      var b = sobre(Pb, { bi: { a: [hb[0] + L, hb[1] + 1, hb[2]], polo: [0.2, 0.6, -0.8] } });
      return {
        vista: [[-34, 24], [146, 26]], rastro: 'md', esfuerzo: [0], clavos: ['ti', 'td', 'mi'],
        material: [bancoAlto(ALTO_B), ['mancuernas', { lado: 'd' }]],
        posturas: { a: refleja(a), b: refleja(b) },
        rep: [['b', 1.3, 'empuje'], ['b', 0.3], ['a', 1.9, 'freno'], ['a', 0.5]],
        pasos: ['a', 'rep', { rep: 1.6 }]
      };
    })();
    /* el remo para el deltoides posterior, con mancuernas: la espalda casi paralela al suelo, los brazos colgando; los codos se doblan y
       suben hacia los lados, en línea con los hombros, hasta que los brazos quedan paralelos al suelo */
    COREO['remo-deltoides-posterior-mancuernas'] = (function () {
      var inc = inclinado(76, { m: HACIA_EL }), Pb = sobre(inc, { hom: [-0.5, -2.6] }), h = resolver(Pb).i.hom;
      return {
        vista: [-40, -140], picado: 10, rastro: 'manos', esfuerzo: [0], clavos: ['ti', 'td'],
        material: [['mancuernas']],
        posturas: {
          de: colgando(sobre(DE_PIE, { m: HACIA_EL }), 19, 6),
          a: colgando(inc, 19, 2),
          b: conAgarre(Pb, [h[0] + D.brazo - 1, h[1] - 30.5, h[2] + 1], [1, 0.5, 0])
        },
        inicio: 'a', encuadra: ['de'],
        rep: [['b', 1.2, 'empuje'], ['b', 0.4], ['a', 1.8, 'freno'], ['a', 0.4]],
        pasos: [{ sec: [['de', 0.8], ['a', 1.6, 'suave']], desde: 'de' }, 'rep', { rep: 1.6 }]
      };
    })();
    /* y con barra: la barra espera en el suelo; con las rodillas flexionadas y la espalda recta se inclina y la coge con un agarre ancho,
       las palmas hacia abajo; tira hacia el pecho todo lo que puede, la mantiene un momento y la baja con control */
    COREO['remo-deltoides-posterior-barra'] = (function () {
      var G = 39, ZB = 21, enSuelo = [0, 21.6, ZB], m = { tipo: 'puno', barra: [1, 0, 0], palma: [0, -0.35, -0.94] };
      var pies = { suelo: [15, 0], abre: 9, polo: [0.3, 0.1, 1] };
      var Pg = function (k) { return { pel: [0, PIE - 6 - 0.3 * k, -0.34 * k], giro: [0, k, 0], cab: [-k * 0.42, 0, 0], p: pies, m: m }; };
      var k = busca(function (x) { var q = resolver(Pg(x)).i.hom; return largo(menos(q, [G, enSuelo[1], enSuelo[2]])); }, BRAZO - 0.6, 20, 88);
      var inc = sobre(inclinado(58, { m: m }), { p: pies }), Pb = sobre(inc, { hom: [-0.5, -3] });
      return {
        vista: [-58, -128], rastro: 'manos', esfuerzo: [0, 1], clavos: ['ti', 'td'], reposo: ['de'],
        material: [['barra', { discos: 21, reposo: enSuelo }]],
        posturas: {
          de: { pel: [0, PIE, -1], p: pies, b: aLosLados(8), m: SUELTA },
          g: conAgarre(Pg(k), [G, enSuelo[1], enSuelo[2]], [1, 0.3, -0.4]),
          a: colgando(inc, G, 2),
          b: conAgarre(Pb, anteTronco(Pb, 30, 13.5, G), [1, 0.75, -0.1])
        },
        inicio: 'a', encuadra: ['de', 'g'],
        rep: [['b', 1.2, 'empuje'], ['b', 0.7], ['a', 1.8, 'freno'], ['a', 0.4]],
        pasos: [{ sec: [['de', 0.7], ['g', 1.3, 'suave'], ['g', 0.25], ['a', 1.2, 'suave']], desde: 'de' }, 'rep', { rep: 1.2 }]
      };
    })();

    /* ── entre dos poleas ──
       Cada asa espera en su polea y se coge con la mano contraria, una y después la otra (cada polea trae su «reposoEn»). */
    var ASA_A = function (px, pz) { return { tipo: 'puno', barra: [0, 1, 0], palma: unidad([px, 0, pz]) }; };      /* el asa, vertical; la palma, hacia (px, pz) */
    /* de pie: las poleas, a la altura de los hombros o algo por debajo y un paso por delante de él. Da un paso hacia cada una para
       coger su asa con la mano contraria y vuelve al centro con los brazos cruzados; los abre hasta formar una línea recta, hace una
       pausa y vuelve despacio */
    COREO['aperturas-inversas-polea'] = (function () {
      var X = 88, ZPP = 34, HP = 122, Ri = [X - 19, HP - 8, ZPP], Rd = [-(X - 19), HP - 8, ZPP];
      var centro = { p: { suelo: [12, 0], abre: 8 } };
      /* un paso hacia la polea de su derecha, girado hacia ella: lo que haga falta para que la mano izquierda llegue al asa */
      var paso = function (k) { return { pel: [-k, PIE - 1.5, 10], giro: [-26, 3, 0], col: [0, -5, -24], cab: [0, -14, 0], pi: { suelo: [-k + 14, 3], abre: 0 }, pd: { suelo: [-k - 13, 16], abre: 22 } }; };
      var k = busca(function (x) { return largo(menos(resolver(paso(x)).i.hom, Rd)); }, BRAZO - 1.5, 0, 60);
      var g1 = conAgarre(sobre(paso(k), { mi: ASA_A(-1, 0.2), bd: aLosLados(14), md: SUELTA }), Rd, [0.3, -0.6, 0.7], 'bi');
      /* y hacia la otra: la mano izquierda ya lleva su asa, ante el pecho */
      var g2 = conAgarre(sobre(refleja(paso(k)), { md: ASA_A(1, 0.2), bi: desdeHombro([-9, -10, 27], [0.5, -1, 0.1]), mi: ASA_A(-1, 0.3) }), Ri, [-0.3, -0.6, 0.7], 'bd');
      var hy = HOMBRO;
      return {
        vista: [0, [38, 16]], rastro: 'manos', esfuerzo: [0, 1], clavos: ['ti', 'td'],
        material: [['polea', { en: [X, ZPP], rumbo: 90, alto: HP, a: 'd', agarre: 'asa', reposo: Ri, reposoEn: ['s', 'g1'], encuadre: 150 }],
                   ['polea', { en: [-X, ZPP], rumbo: -90, alto: HP, a: 'i', agarre: 'asa', reposo: Rd, reposoEn: ['s'], encuadre: 150 }]],
        posturas: {
          s: sobre(centro, { b: aLosLados(8), m: SUELTA }), g1: g1, g2: g2,
          a: sobre(centro, { bi: { a: [-12, hy - 8, 31], polo: [1, -0.8, 0.2] }, bd: { a: [12, hy - 15, 33], polo: [-1, -0.8, 0.2] }, mi: ASA_A(-1, 0), md: ASA_A(1, 0) }),
          b: sobre(centro, { hom: [0, -2.5], bi: { a: [D.hombroX + 50.4, hy - 3, -3], polo: [0.3, -0.4, -1] }, bd: { a: [-(D.hombroX + 50.4), hy - 3, -3], polo: [-0.3, -0.4, -1] }, mi: ASA_A(-0.4, 0.9), md: ASA_A(0.4, 0.9) })
        },
        inicio: 'a', encuadra: ['s', 'g1', 'g2'],
        rep: [['b', 1.4, 'empuje'], ['b', 0.7], ['a', 2.0, 'freno'], ['a', 0.4]],
        pasos: ['s', { sec: [['g1', 1.2, 'suave', []], ['g1', 0.2, null, []], ['g2', 1.8, 'suave', []], ['g2', 0.2, null, []], ['a', 1.3, 'suave', []]], desde: 's' }, 'rep']
      };
    })();
    /* sentado en el borde de un banco entre dos poleas bajas, el pecho sobre los muslos: se inclina a cada lado para coger el asa con la
       mano contraria; los cables se cruzan por delante de las espinillas. Los brazos suben hacia los lados hasta la altura de los hombros */
    COREO['pajaros-polea-sentado'] = (function () {
      var X = 54, ZPP = 62, HP = 20, Ri = [X - 12, HP + 8, ZPP - 2], Rd = [-(X - 12), HP + 8, ZPP - 2];
      var base = sentadoAlBorde(72, { cab: [-38, 0, 0], p: { suelo: [13, 36], abre: 7 } });
      /* inclinado hacia su derecha: la mano izquierda llega al asa de esa polea */
      var lado = function (k) { return sobre(base, { col: [0, -k, -k * 0.9], cab: [-30, -k * 0.5, 0] }); };
      var k = busca(function (x) { return largo(menos(resolver(lado(x)).i.hom, Rd)); }, BRAZO - 1.5, 0, 55);
      var hb = resolver(base).i.hom, cuelgaI = { a: [hb[0] + 3, hb[1] - 56, hb[2] + 9], polo: [1, 0.2, -0.6] };
      var g1 = conAgarre(sobre(lado(k), { mi: ASA_A(-1, 0.2), bd: reflejo(cuelgaI), md: SUELTA }), Rd, [0.4, 0.2, -1], 'bi');
      var g2 = conAgarre(sobre(refleja(lado(k)), { md: ASA_A(1, 0.2), bi: cuelgaI, mi: ASA_A(-1, 0.2) }), Ri, [-0.4, 0.2, -1], 'bd');
      return {
        vista: [18, 148], picado: 12, rastro: 'manos', esfuerzo: [0, 1], clavos: ['ti', 'td'],
        material: [BANCO_DETRAS,
                   ['polea', { en: [X, ZPP], rumbo: 90, alto: HP, a: 'd', agarre: 'asa', reposo: Ri, reposoEn: ['s', 'g1'], encuadre: 130 }],
                   ['polea', { en: [-X, ZPP], rumbo: -90, alto: HP, a: 'i', agarre: 'asa', reposo: Rd, reposoEn: ['s'], encuadre: 130 }]],
        posturas: {
          s: sobre(base, { b: cuelgaI, m: SUELTA }), g1: g1, g2: g2,
          a: sobre(base, { b: cuelgaI, m: ASA_A(-1, 0.2) }),
          b: enCruz(sobre(base, { hom: [-0.5, -2.5], m: ABAJO_Z }), 2)
        },
        inicio: 'a', encuadra: ['s', 'g1', 'g2'],
        rep: [['b', 1.4, 'empuje'], ['b', 0.7], ['a', 1.9, 'freno'], ['a', 0.4]],
        pasos: ['s', { sec: [['g1', 1.1, 'suave'], ['g1', 0.2], ['g2', 1.6, 'suave'], ['g2', 0.2], ['a', 1.1, 'suave']], desde: 's' }, 'rep']
      };
    })();

    /* ══════════ los rotadores ══════════ */
    /* tumbado de lado, la pierna de abajo descansa en el suelo sin hundir la zapatilla: pieSobreSuelo, en 70-coreografias.js */
    /* tumbado de lado (sobre el derecho, de cara a la cámara), con una mancuerna ligera en la mano de arriba y el codo a 90 grados, pegado
       al costado: gira el hombro y la mano sube hacia arriba y hacia fuera, sin despegar el codo; y baja despacio. El paso 2 (una toalla
       entre el codo y el costado, «si lo desea») lo dice de cerca */
    COREO['rotacion-externa-mancuerna-tumbado'] = (function () {
      var base = pieSobreSuelo({ pel: [0, 21.5, 0], giro: [-90, 0, -84], cab: [0, 0, -14], p: { e: 30, z: 0, c: 44 }, t: { tob: 8 },
        bd: { a: [-(D.hombroX - 1), D.hombroY + 42, 9], en: 'torax', polo: [-0.2, -0.3, 1] }, md: { tipo: 'abierta', prono: 90 } }, 'd');
      var Bt = resolver(base).Bt, haciaCodo = unidad([2, -27, 2]), codo = mas([D.hombroX, D.hombroY, 0], por(haciaCodo, D.brazo));
      var P = function (g) {
        var s = Math.sin(g * RAD), c = Math.cos(g * RAD);
        return sobre(base, { bi: { a: [codo[0] + D.antebrazo * s, codo[1], codo[2] + D.antebrazo * c], en: 'torax', polo: haciaCodo },
          mi: { tipo: 'puno', barra: aplicar(Bt, [0, 1, 0]), palma: aplicar(Bt, [-c, 0, s]) } });
      };
      return {
        vista: [[-90, 10], [-58, 34]], rastro: 'mi', esfuerzo: [0],
        material: [['mancuernas', { lado: 'i', radio: 4.8 }]],
        posturas: { a: P(-34), b: P(56) },
        rep: [['b', 1.4, 'suave'], ['b', 0.4], ['a', 2.0, 'freno'], ['a', 0.4]],
        pasos: ['a', 'nota', 'rep']
      };
    })();
    /* la rotación interna: sentado en el suelo, de lado junto a una polea baja (así queda a la altura del codo); coge el asa con la mano
       más cercana; con el codo a 90 grados y pegado al costado, lleva el antebrazo hacia el abdomen, sin mover el codo ni girar el tronco,
       y vuelve despacio */
    COREO['rotacion-interna-polea'] = (function () {
      var XR = -70, ZR = 16, HP = 28, R = [XR + 17, HP - 8, ZR];
      var PIE_TALON = { punta: [0, 0.906, 0.423], arriba: [0, 0.423, -0.906] };                 /* el talón en el suelo, la punta hacia arriba */
      var base = { pel: [0, 11.5, 0], giro: [0, -3, 0], cab: [3, 0, 0], p: { a: [11, 8.8, 75.4], polo: [0, 1, 0.05] }, t: PIE_TALON,
        bi: { a: [12, 22.5, 27], polo: [1, 0.2, -0.6] }, mi: EN_MUSLO };
      var hd = resolver(base).d.hom, haciaCodo = unidad([-2, -27, 1]), codo = mas(hd, por(haciaCodo, D.brazo));
      var ante = function (g) {                                                   /* el antebrazo derecho, a «g» grados del frente (+, hacia fuera) */
        var s = Math.sin(g * RAD), c = Math.cos(g * RAD);
        return sobre(base, { bd: { a: [codo[0] - D.antebrazo * s, codo[1], codo[2] + D.antebrazo * c], polo: haciaCodo }, md: { tipo: 'puno', barra: [0, 1, 0], palma: [c, 0, s] } });
      };
      return {
        vista: [14, 60], picado: 14, rastro: 'md', esfuerzo: [0], reposo: ['s'],
        material: [['polea', { en: [XR, ZR], rumbo: -90, alto: HP, a: 'd', agarre: 'asa', reposo: R, encuadre: 110 }]],
        posturas: {
          s: sobre(base, { bd: { a: [-12, 22.5, 27], polo: [-1, 0.2, -0.6] }, md: EN_MUSLO }),
          g: conAgarre(sobre(base, { col: [0, -8, -6], cab: [6, -22, 0], md: ASA_A(1, 0.2) }), R, [-1, -0.2, -0.3], 'bd'),
          a: ante(40), b: ante(-52)
        },
        inicio: 'a', encuadra: ['s', 'g'],
        rep: [['b', 1.5, 'suave'], ['b', 0.4], ['a', 2.0, 'freno'], ['a', 0.4]],
        pasos: [{ sec: [['s', 0.9], ['g', 1.1, 'suave'], ['g', 0.25], ['a', 1.1, 'suave']], desde: 's' }, 'rep', { rep: 1.9 }]
      };
    })();
    /* el empuje isométrico: de pie frente a una pared, el codo a 90 grados y pegado al costado, el puño contra la pared; empuja hacia
       delante, aumentando la tensión poco a poco; mantiene, y relaja despacio. (Se escribe con el brazo izquierdo y se refleja.) */
    COREO['empuje-isometrico-hombro-pared'] = (function () {
      var ZW = 37.2, pies = { p: { suelo: [10, 0], abre: 6 } };
      var P = function (extra) {
        return sobre(pies, sobre({ bd: aLosLados(8), md: SUELTA, bi: { a: [CODO_L[0], CODO_L[1], CODO_L[2] + D.antebrazo], polo: [0, -1, 0] }, mi: { tipo: 'puno', barra: [0, 1, 0], palma: [-1, 0, 0] } }, extra || {}));
      };
      return {
        vista: [-86, -146], isometrico: 'b', clavos: ['ti', 'td', 'md'],
        material: [['pared', { z: ZW, normal: [0, 0, -1], ancho: 130 }]],
        posturas: { a: refleja(P()), b: refleja(P({ pel: [0, PIE, 0.8], giro: [0, 1.8, 0], hom: { i: [0, 1.0], d: [0, 0] } })) },
        pasos: ['a', { sec: [['b', 2.4, 'suave']], desde: 'a' }, { sec: [['b', 2.6], ['a', 1.6, 'suave']], desde: 'b' }]
      };
    })();

    /* ══════════ la calistenia ══════════ */
    /* la mano, plana en el suelo con los dedos hacia delante (+Z): apoyada de verdad (70-coreografias.js, apoyada: la muñeca, a ALTO_MUN
       del suelo, y la mano tendida en él), se doble lo que se doble la muñeca y llegue el antebrazo de donde llegue (en la pica, de
       atrás; en la pseudoplancha, de delante) */
    var Y_MUN = ALTO_MUN;
    function planas(P) { var r = sobre(P, { m: EN_SUELO }); delete r.mi; delete r.md; return r; }
    /* dónde quedan la frente y la coronilla de una postura */
    function frente(P) { var E = resolver(P); return mas(E.cab, aplicar(E.Bc, [0, 26, 9.5])); }
    function coronilla(P) { var E = resolver(P); return mas(E.cab, aplicar(E.Bc, [0, 33.5, 0])); }

    /* ── la pica ── las puntas de los pies no se mueven (los tobillos, en z = −100, a «alto» del suelo si pisan en algo) ni las manos
       (las muñecas, en w); las piernas, estiradas desde los pies; el tronco baja desde la cadera, a «beta» grados de la horizontal
       (con −20 es una plancha; con 34, la V invertida); y los brazos, estirados. De una a otra se va subiendo la cadera */
    var ZT = -100, G_PICA = 25;
    var CODO_PICA = [0.5, 0.65, 0.6];                 /* los codos, hacia fuera y hacia arriba: el antebrazo queda casi vertical sobre la mano */
    function picaEn(w, alto) {
      alto = alto || 0;
      /* con la cadera donde digan las piernas (a «fi» grados del suelo; L, de la cadera al tobillo: 78, estiradas) */
      var P = function (fi, beta, extra, L) {
        L = L || 77.95;
        return sobre({ pel: [0, alto + TOB_PUNTA + L * Math.sin(fi * RAD), ZT + L * Math.cos(fi * RAD)], giro: [0, 90 + beta, 0],
          p: { a: [10, alto + TOB_PUNTA, ZT], polo: [0, -0.64, 0.77] }, t: PIES_PUNTA, b: { a: w, polo: CODO_PICA } }, extra || {});
      };
      return {
        /* con los brazos estirados */
        arriba: function (beta, extra, L) { return planas(aUnBrazo(function (x) { return P(x, beta, extra, L); }, w, -30, 80)); },
        /* con los codos doblados lo que haga falta para que lo más bajo de la cabeza (el tupé cuenta: 30-cabeza.js, cabezaAPlano) quede
           a «y» del suelo: muy cerca, sin meterse en él */
        abajo: function (beta, y, extra) { var Q = function (x) { return P(x, beta, extra); }; return planas(Q(busca(function (x) { return cabezaAPlano(resolver(Q(x)), [0, 0, 0], [0, 1, 0]); }, y, -20, 70))); }
      };
    }
    /* la flexión en pica: como en una flexión, pero con la cadera hacia el techo (las manos y los pies no se mueven de donde estaban),
       los brazos y las piernas estirados y las manos algo más abiertas que los hombros. Si hace falta para la espalda, las rodillas se
       flexionan un poco. Los codos se doblan y la cabeza baja hacia el suelo, la frente por delante de las manos, y vuelve a subir.
       El paso 4 (lo que no hay que hacer) lo dice de cerca */
    COREO['flexion-pica'] = (function () {
      var F = picaEn([G_PICA, Y_MUN, 13.5]);
      return {
        vista: [78, [32, 34]], picado: 16, rastro: 'cab', esfuerzo: [2], clavos: ['mi', 'md', 'ti', 'td'],
        posturas: {
          pl: F.arriba(-19.8, { cab: [-16, 0, 0] }), m1: F.arriba(-2, { cab: [-10, 0, 0] }), m2: F.arriba(16, { cab: [-3, 0, 0] }),
          a: F.arriba(34, { cab: [4, 0, 0] }), k: F.arriba(35, { cab: [4, 0, 0] }, 76.2),
          b: F.abajo(42, 1.2, { cab: [-34, 0, 0] })
        },
        inicio: 'a', encuadra: ['pl', 'k'],
        rep: bajaSube('b', 'a', [1.7, 0.3, 1.2, 0.5]),
        pasos: [{ sec: [['pl', 1.3], ['m1', 0.7, 'entra'], ['m2', 0.6, 'lineal'], ['a', 0.8, 'sale']], desde: 'pl' },
                { sec: [['a', 1.6], ['k', 1.3, 'suave'], ['k', 1.1], ['a', 1.3, 'suave']], desde: 'a' }, 'rep', 'nota']
      };
    })();
    /* con los pies elevados: los pies, en un banco, y las manos, en el suelo; la cadera sube hasta la V invertida, con los brazos
       estirados y la cabeza alineada con la espalda; los codos se doblan y la cabeza baja hacia el suelo, por delante de las manos */
    COREO['flexion-pica-pies-elevados'] = (function () {
      var ALTO = 44, F = picaEn([G_PICA, Y_MUN, 7], ALTO);
      return {
        vista: [78, [32, 34]], picado: 16, rastro: 'cab', esfuerzo: [2], clavos: ['mi', 'md', 'ti', 'td'],
        material: [['banco', { rumbo: 90, en: [0, -100], largo: 110 }]],
        posturas: {
          pl: F.arriba(12, { cab: [-12, 0, 0] }), m1: F.arriba(33, { cab: [-5, 0, 0] }),
          a: F.arriba(52, { cab: [2, 0, 0] }),
          b: F.abajo(57, 1.2, { cab: [-40, 0, 0] })
        },
        inicio: 'a', encuadra: ['pl'],
        rep: bajaSube('b', 'a', [1.7, 0.3, 1.2, 0.5]),
        pasos: [{ sec: [['pl', 1.3], ['m1', 0.9, 'entra'], ['a', 0.9, 'sale']], desde: 'pl' }, 'a', 'rep']
      };
    })();
    /* la pseudoplancha: en posición de flexión, el cuerpo se adelanta hasta que los hombros quedan por delante de las muñecas (los pies
       se ponen de puntas del todo y se arriman un poco); y la flexión se hace sin que los hombros dejen de ir adelantados */
    COREO['flexion-pseudoplancha'] = (function () {
      var W = [22, Y_MUN, 13.5], AV = 12.5, Y_T = 11.3;
      var PIES_AV = { punta: [0, -0.996, -0.087], arriba: [0, -0.087, 0.996], flex: 86 };
      var adelantado = function (ang, extra) {
        var s = Math.sin(ang * RAD), c = Math.cos(ang * RAD);
        return sobre({ pel: [0, Y_T + 78 * s, ZT + AV + 78 * c], giro: [0, 90 - ang, 0], cab: [-16, 0, 0], p: { a: [10, Y_T, ZT + AV], polo: [0, -1, 0.3] }, t: PIES_AV, b: { a: W, polo: [0.4, 0.3, -1] } }, extra || {});
      };
      var enFlexion = function (ang) { return tabla(ang, { p: { a: [10, TOB_PUNTA, ZT], polo: [0, -1, 0.3] }, b: { a: W, polo: [0.55, 0.25, -1] } }); };
      return {
        vista: [78, [32, 34]], picado: 16, rastro: 'pecho', esfuerzo: [2], clavos: ['mi', 'md', 'ti', 'td'],
        posturas: {
          pl: planas(aUnBrazo(enFlexion, W, 8, 32)),
          a: planas(aUnBrazo(adelantado, W, 8, 32)),
          b: planas(adelantado(3.2, { cab: [-24, 0, 0], b: { a: W, polo: [0.3, 0.8, -1] } }))
        },
        inicio: 'a', encuadra: ['pl'],
        rep: bajaSube('b', 'a', [1.7, 0.25, 1.2, 0.5]),
        pasos: [{ sec: [['pl', 1.3], ['a', 1.9, 'suave', ['mi', 'md']]], desde: 'pl' }, 'rep']
      };
    })();
    /* la flexión hindú: del perro boca abajo (manos y pies en el suelo, la cadera alta), los codos se doblan y el pecho va hacia
       delante, cerca del suelo, hasta acabar en la cobra, sin apoyar las piernas ni el tronco; y vuelve por el mismo recorrido */
    COREO['flexion-hindu'] = (function () {
      var W = [G_PICA, Y_MUN, 13.5], F = picaEn(W);
      var pierna = { a: [10, TOB_PUNTA, ZT], polo: [0, -0.64, 0.77] };
      /* la cadera, a «y» del suelo, con las piernas estiradas desde las puntas de los pies; el tronco, a «c» grados de cabeceo y arqueado «arco» */
      var bajo = function (y, c, arco, extra) {
        return sobre({ pel: [0, y, ZT + Math.sqrt(77.95 * 77.95 - (y - TOB_PUNTA) * (y - TOB_PUNTA))], giro: [0, c, 0], col: [-arco, 0, 0], p: pierna, t: PIES_PUNTA }, extra || {});
      };
      return {
        vista: [78, [32, 34]], picado: 16, rastro: 'pecho', clavos: ['mi', 'md', 'ti', 'td'],
        posturas: {
          a: F.arriba(40, { cab: [4, 0, 0] }),
          m: F.abajo(42, 4, { cab: [-34, 0, 0] }),
          n: planas(bajo(28, 100, 16, { cab: [-36, 0, 0], b: { a: W, polo: [0.6, 0.3, -1] } })),
          c: planas(aUnBrazo(function (y) { return bajo(y, 65, 36, { cab: [-18, 0, 0], b: { a: W, polo: [0.7, 0, -0.7] } }); }, W, 14, 40))
        },
        encuadra: ['m', 'n', 'c'],
        pasos: ['a', { sec: [['m', 1.3, 'entra'], ['n', 0.9, 'lineal'], ['c', 1.4, 'sale']], desde: 'a' },
                { sec: [['n', 1.3, 'entra'], ['m', 0.9, 'lineal'], ['a', 1.4, 'sale']], desde: 'c' }]
      };
    })();

    /* ── el pino ── cabeza abajo sobre las manos (los dedos, hacia +Z; el pecho mira hacia −Z). El cuerpo, a «c» grados de cabeceo
       (180, vertical; menos, los pies se van hacia −Z; más, hacia +Z), con el centro de los hombros en z = zS y las muñecas en w; los
       brazos, estirados, o los hombros a la altura yS si se dice */
    var PINO = { cab: [-14, 0, 0], p: { e: 4, z: -90, c: 0 }, t: { tob: 58 } };
    function pino(c, w, zS, extra, yS) {
      var dz = 0, dy = 0, i, E, P, base = sobre(PINO, extra || {});
      var con = function (dz, y) { return sobre(base, { pel: [0, y, zS + dz], giro: [0, c, 0], b: base.b || { a: w, polo: [0.8, 0, -0.6] } }); };
      for (i = 0; i < 6; i++) {
        P = yS == null ? aUnBrazo(function (y) { return con(dz, y); }, w, 60, 130) : con(dz, 100 + dy);
        E = resolver(P); dz += zS - (E.i.hom[2] + E.d.hom[2]) / 2; if (yS != null) dy += yS - (E.i.hom[1] + E.d.hom[1]) / 2;
      }
      return planas(P);
    }
    /* el pino libre: sin apoyo, con los brazos estirados (se le ve equilibrarse: se va un pelo hacia los dedos y vuelve); empuja el suelo
       con las manos (los hombros suben hacia las orejas y el cuerpo crece) y aprieta el abdomen y los glúteos (el arco de la espalda se
       va): queda en una línea */
    COREO['pino-libre'] = (function () {
      /* la cabeza, algo echada atrás (mira a las manos): así el tupé no llega al suelo */
      var w = [20, Y_MUN, -4], suelto = { col: [-9, 0, 0], cab: [-36, 0, 0], p: { e: 7, z: 170, c: 0 } };        /* c: 0 (22-11-2026): con z: 170 la rodilla doblaba 3° al revés */
      return {
        vista: [86, [-146, 12]], corre: [46, 0], isometrico: 'p', clavos: ['mi', 'md'],
        posturas: {
          p0: pino(183, w, -1.5, suelto), p1: pino(184.4, w, -0.6, sobre(suelto, { col: [-10.5, 0, 0] })), p2: pino(182, w, -2.2, sobre(suelto, { col: [-8, 0, 0] })),
          p: pino(180.6, w, 0, { hom: [2.6, 0], cab: [-34, 0, 0] })
        },
        inicio: 'p0', encuadra: ['p', 'p0', 'p1', 'p2'],
        pasos: [{ sec: [['p1', 1.2, 'suave'], ['p2', 1.5, 'suave'], ['p0', 1.2, 'suave']], desde: 'p0' }, { sec: [['p', 1.8, 'suave']], desde: 'p0' }]
      };
    })();
    /* la flexión en pino contra la pared: de espaldas a ella, con los talones apoyados; mantiene el pino con control; los codos se
       doblan y el cuerpo baja hasta acercar la cabeza al suelo (los talones resbalan por la pared); y empuja hasta estirar los brazos */
    COREO['flexion-pino-pared'] = (function () {
      var w = [23, Y_MUN, 0], pies = { t: { tob: 26 }, p: { e: 2, z: -90, c: 0 } };
      var t = pino(186, w, 2, sobre(pies, { cab: [-10, 0, 0], hom: [2.2, 0] }));
      /* abajo: Jérôme tiene la cabeza grande y los brazos cortos, y con la cabeza en línea no cabe entre los hombros y el suelo: baja
         mirando al suelo (la cabeza, echada atrás 68°) hasta que lo más bajo de ella, el tupé, queda a 1 cm de él. Los hombros se
         van hacia delante (a z = −13,5) y el cuerpo se inclina 13°: lo justo (medido) para que los talones sigan en la pared y la
         nuca no la toque */
      var abajo = function (y) { return pino(193, w, -13.5, sobre(pies, { cab: [-68, 0, 0], b: { a: w, polo: [1, 0.1, -0.9] } }), y); };
      var b = abajo(busca(function (y) { return cabezaAPlano(resolver(abajo(y)), [0, 0, 0], [0, 1, 0]); }, 1, 26, 56));
      /* de arriba a abajo pasa por «m»: primero los hombros se adelantan y la cabeza se echa atrás, casi sin bajar; después baja. En
         línea recta de «t» a «b», el tupé rozaría el suelo a medio camino */
      var m = pino(191.5, w, -10.5, sobre(pies, { cab: [-56, 0, 0], hom: [2, 0], b: { a: w, polo: [1, 0.1, -0.9] } }), 52);
      /* la pared, donde la tocan los talones (y la espalda) arriba: lo más saliente de lo que se dibuja, no un punto del esqueleto */
      var E = resolver(t), ZW = -Math.min(zapaAPlano(E.i, 'i', [0, 0, 0], [0, 0, -1]), zapaAPlano(E.d, 'd', [0, 0, 0], [0, 0, -1]), troncoAPlano(E, [0, 0, 0], [0, 0, -1]), cabezaAPlano(E, [0, 0, 0], [0, 0, -1]),
        miembroAPlano(E, 'i', 'pierna', [0, 0, 0], [0, 0, -1]), miembroAPlano(E, 'i', 'muslo', [0, 0, 0], [0, 0, -1]));
      return {
        vista: [86, [146, 12]], corre: [50, 0], rastro: 'cab', esfuerzo: [3, 4], isometrico: 't', clavos: ['mi', 'md'],
        material: [['pared', { z: ZW, normal: [0, 0, -1], ancho: 130 }]],
        posturas: { t0: t, t: t, m: m, b: b },            /* t0 y t son la misma: en el paso 1 se coloca; en el 2 la mantiene (y se le nota) */
        inicio: 't', encuadra: ['t'],
        rep: [['m', 0.8, 'entra'], ['b', 1.1, 'sale'], ['b', 0.3], ['m', 0.7, 'entra'], ['t', 0.6, 'sale'], ['t', 0.6]],
        pasos: ['t0', 't', 'rep']
      };
    })();
    /* el pino contra la pared, con el pecho hacia ella. Se sube andando por la pared: boca abajo, con las manos en el suelo, apoya los
       pies en ella (paso 1: los dos, antes de mover una mano) y después los sube mientras acerca las manos, una mano o un pie cada
       vez (paso 2): siempre quedan tres apoyos. Arriba, las manos en el suelo junto a la pared y las puntas de los pies apoyadas en
       ella; los brazos, estirados, y la pared sostiene la postura (paso 3). Para salir (paso 4) baja por donde subió: las manos se
       alejan y los pies bajan por la pared, una mano o un pie cada vez, y los pies no dejan la pared hasta que las dos manos están
       lejos; acaba con los pies en el suelo */
    COREO['pino-pared'] = (function () {
      var G = 21, ZPL = 13.5, AV = 105, Z0 = ZPL - AV, LB = D.brazo + D.antebrazo - 0.35, dx = G - D.hombroX, L_T = 43.5, L_P = 77.95, L_ANDA = 77.3;
      var PIE_PARED = { punta: [0, 0.574, -0.819], arriba: [0, -0.819, -0.574] }, PIE_AIRE = { punta: [0, -0.26, -0.966], arriba: [0, 0.966, -0.26] };
      /* la rodilla que se dobla va hacia abajo y hacia la pared, y algo hacia fuera: junto a la pared no cabe de frente */
      var RODILLA = [0, -1, -0.3], RODILLA_I = [0.5, -1, -0.3], RODILLA_D = [-0.5, -1, -0.3], Y_BAJO = 50, SUBE = 7;
      var w = [G, Y_MUN, ZPL];
      var pl = planas(aUnBrazo(function (x) { return tabla(x, { b: { a: w, polo: [0.55, 0.25, -1] } }); }, w, 8, 32));
      /* la pared, donde la tocan las suelas en la plancha (lo más saliente de la zapatilla, tal como se dibuja); y el tobillo del pie que
         pisa en ella con la punta (PIE_PARED), a lo que mide la zapatilla: la toca sin meterse */
      var ZWALL = zapaAPlano(resolver(pl).i, 'i', [0, 0, 0], [0, 0, 1]);
      var ZA = ZWALL - zapaAPlano(resolver({ p: { a: [10, 100, 0], polo: RODILLA }, t: PIE_PARED }).i, 'i', [0, 0, 0], [0, 0, 1]);
      /* el cuerpo. Los hombros, sobre el centro de las dos manos, a lo que den los brazos estirados. Y la cadera, donde deja estirada
         la pierna de uno de los pies que pisan (a las alturas de «pisan») sin que el otro quede fuera de alcance: si ese pie está todo
         lo alto que llega (recto), el cuerpo queda en línea de los hombros a ese tobillo; si está más bajo, se dobla por la cadera,
         que se aleja de la pared. Así se anda por una pared: tras acercar una mano, la cadera sale; al subir un pie, el cuerpo se
         estira. Con el pecho hacia la pared las rodillas se doblan hacia ella, y arriba, entre el cuerpo y la pared, no caben.
         «lp»: lo que mide la pierna estirada. Arriba, quieto, del todo (L_P); andando, un pelo menos (L_ANDA): con las dos manos y un
         pie clavados, una pierna estirada del todo no dejaría sitio ni para respirar */
      var cuerpo = function (zi, zd, pisan, lp) {
        lp = lp || L_ANDA;
        var zm = Z0 + (zi + zd) / 2 + 1.1, h = Math.abs(zi - zd) / 2 + 1.1, yS = Y_MUN + Math.sqrt(LB * LB - h * h - dx * dx);
        var L = L_T + lp, recto = yS + Math.sqrt(Math.max(0, L * L - (zm - ZA) * (zm - ZA))), r = null;
        (pisan && pisan.length ? pisan : [recto]).forEach(function (yT) {
          yT = Math.min(yT, recto);
          var uy = yT - yS, uz = ZA - zm, dd = Math.sqrt(uy * uy + uz * uz), a = (L_T * L_T - lp * lp + dd * dd) / (2 * dd), f = Math.sqrt(Math.max(0, L_T * L_T - a * a));
          var py = yS + (a * uy - f * uz) / dd, pz = zm + (a * uz + f * uy) / dd, falta = 0;
          /* lo que le faltaría al otro pie para llegar */
          (pisan || []).forEach(function (y) { falta = Math.max(falta, Math.sqrt((y - py) * (y - py) + (ZA - pz) * (ZA - pz)) - lp); });
          if (!r || falta < r.falta) r = { recto: recto, pel: [0, py, pz], c: Math.atan2(zm - pz, yS - py) / RAD, falta: falta };
        });
        return r;
      };
      /* una postura del camino: las muñecas, a zi y zd de donde quedan arriba (o.mi, o.md: esa mano va en el aire, a esos centímetros
         del suelo), y los tobillos, en la pared a las alturas yi e yd (o.pi, o.pd: ese pie va en el aire, separado de ella esos centímetros) */
      var andando = function (zi, zd, yi, yd, o) {
        o = o || {};
        var q = cuerpo(zi, zd, (o.pi ? [] : [yi]).concat(o.pd ? [] : [yd]), o.largo);
        var P = function (cab) {
          return planas({ pel: q.pel, giro: [0, q.c, 0], cab: [cab, 0, 0],
            bi: { a: [G, Y_MUN + (o.mi || 0), Z0 + zi], polo: [1, 0, -0.5] }, bd: { a: [-G, Y_MUN + (o.md || 0), Z0 + zd], polo: [-1, 0, -0.5] },
            pi: { a: [10, yi, ZA + (o.pi || 0)], polo: o.largo ? RODILLA : RODILLA_I }, pd: { a: [-10, yd, ZA + (o.pd || 0)], polo: o.largo ? RODILLA : RODILLA_D }, t: PIE_PARED });
        };
        /* la cabeza, mirando al suelo: cuanto más a plomo va el tronco, más se echa atrás, para que el tupé no roce el suelo (lo más
           bajo de la cabeza, tal como se dibuja, queda a 1,5 cm de él como poco) */
        var libre = function (cab) { return cabezaAPlano(resolver(P(cab)), [0, 0, 0], [0, 1, 0]); };
        return P(libre(-16) >= 1.5 ? -16 : busca(libre, 1.5, -64, -24));
      };
      /* con las manos lejos, en su sitio: el cuerpo, a «c» grados de cabeceo, con los hombros sobre ellas */
      var sobreManos = function (c, extra) {
        var yS = Y_MUN + Math.sqrt(LB * LB - 1.1 * 1.1 - dx * dx);
        return planas(sobre({ pel: [0, yS - L_T * Math.cos(c * RAD), ZPL + 1.1 - L_T * Math.sin(c * RAD)], giro: [0, c, 0], cab: [-16, 0, 0], b: { a: w, polo: [0.55, 0.25, -1] } }, extra));
      };
      var enPared = { a: [10, Y_BAJO, ZA], polo: RODILLA };
      /* el camino de las manos, de lejos a junto a la pared, en seis pasos de 35 cm (la derecha primero): [la izquierda, la derecha] */
      var MANOS = [[AV, AV], [AV, 70], [70, 70], [70, 35], [35, 35], [35, 0], [0, 0]];
      /* la altura a la que pisa el pie que sube tras cada mano: todo lo alto que llega con el cuerpo en línea */
      var ALTO = MANOS.map(function (m) { return cuerpo(m[0], m[1]).recto; });
      /* las dos manos y los dos pies van clavados a su camino en todos los tramos: lo que apoya no se mueve (siempre quedan tres apoyos
         en la subida) y lo que da el paso va en línea recta de donde estaba a su postura en el aire, y de ahí a donde se posa */
      var TODO = ['mi', 'md', 'ti', 'td'], sin = function () { return TODO; };
      var T_MANO = 0.28, tPie = function (cm) { return entre(0.2 + cm / 260, 0.23, 0.48); };      /* medio paso: levantar, o apoyar */
      var K = { pl: pl }, pies = [Y_BAJO, ALTO[0]], k, m0, m1, der, q, y1, mano, pie, t, fuera;
      /* ── paso 1 ── los dos pies a la pared (las manos no se mueven): el izquierdo, bajo; el derecho, donde deja la pierna en línea */
      K.e1 = sobre(pl, { pi: { a: [10, (Y_BAJO + TOB_PUNTA) / 2 + 4, ZA + 13], polo: RODILLA }, ti: PIE_AIRE });
      K.e2 = sobre(pl, { pi: enPared, ti: PIE_PARED });
      K.e3 = sobreManos(89, { pi: enPared, ti: PIE_PARED, pd: { a: [-10, (ALTO[0] + TOB_PUNTA) / 2 + 4, ZA + 16], polo: RODILLA }, td: PIE_AIRE });
      K.c0 = andando(AV, AV, Y_BAJO, ALTO[0]);
      var apoya = [['pl', 0.6, null, TODO], ['e1', 0.36, 'entra', sin('ti')], ['e2', 0.38, 'sale', sin('ti')], ['e3', 0.4, 'entra', sin('td')], ['c0', 0.4, 'sale', sin('td')]], sube = [];
      /* ── paso 2 ── cinco veces: una mano se acerca (a: en el aire; b: apoyada, con la cadera fuera) y sube el pie contrario (d: en el
         aire, más separado de la pared cuanto más largo es el paso; c: apoyado, con el cuerpo otra vez en línea) */
      for (k = 1; k <= 5; k++) {
        m0 = MANOS[k - 1]; m1 = MANOS[k]; der = k % 2 === 1; mano = der ? 'md' : 'mi';
        K['a' + k] = andando((m0[0] + m1[0]) / 2, (m0[1] + m1[1]) / 2, pies[0], pies[1], der ? { md: SUBE } : { mi: SUBE });
        K['b' + k] = andando(m1[0], m1[1], pies[0], pies[1]);
        q = der ? 0 : 1; pie = q ? 'td' : 'ti'; y1 = pies[q] + (ALTO[k] - pies[q]) * 0.6; t = tPie(ALTO[k] - pies[q]); fuera = 8 + (ALTO[k] - pies[q]) / 7;
        K['d' + k] = andando(m1[0], m1[1], q ? pies[0] : y1, q ? y1 : pies[1], q ? { pd: fuera } : { pi: fuera });
        pies[q] = ALTO[k];
        K['c' + k] = andando(m1[0], m1[1], pies[0], pies[1]);
        sube.push(['a' + k, T_MANO, 'entra', sin(mano)], ['b' + k, T_MANO, 'sale', sin(mano)], ['d' + k, t, 'entra', sin(pie)], ['c' + k, t, 'sale', sin(pie)]);
      }
      /* y la última mano. Junto a la pared ya no hay sitio para doblar una rodilla: el cuerpo se estira según llega la mano y las
         puntas de los pies resbalan por la pared hasta su altura, sin despegarse (unos centímetros) */
      var ARRIBA = cuerpo(0, 0, null, L_P).recto;
      K.a6 = andando(MANOS[5][0] / 2, 0, (pies[0] + ARRIBA) / 2, (pies[1] + ARRIBA) / 2, { mi: SUBE });
      K.p = andando(0, 0, ARRIBA, ARRIBA, { largo: L_P });
      sube.push(['a6', T_MANO + 0.04, 'entra', sin('mi')], ['p', T_MANO + 0.04, 'sale', sin('mi')]);
      /* ── la bajada (paso 4) ── por donde subió: las mismas posturas en orden inverso (lo que entraba en el aire, ahora sale de él) */
      var todo = apoya.concat(sube), baja = [['p', 0.3, null, TODO]];
      for (k = todo.length - 1; k >= 1; k--) baja.push([todo[k - 1][0], todo[k][1], todo[k][2] === 'entra' ? 'sale' : 'entra', todo[k][3]]);
      return {
        vista: [94, [40, 16]], isometrico: 'p', clavos: ['mi', 'md'], sobreManos: true,
        material: [['pared', { z: ZWALL, normal: [0, 0, 1], ancho: 130 }]],
        posturas: K,
        inicio: 'p', encuadra: ['p', 'b5', 'c4', 'b4', 'c3', 'b3', 'c2', 'b2', 'c1', 'b1', 'c0', 'e2', 'pl'],
        pasos: [{ sec: apoya, desde: 'pl' }, { sec: sube, desde: 'c0' }, 'p', { sec: baja, desde: 'p' }]
      };
    })();

    /* ══════════ la movilidad y los estiramientos ══════════ */
    /* los círculos: de pie, erguido, con los brazos estirados; círculos amplios, por delante, hacia abajo, por detrás y por encima de
       la cabeza (desde abajo: atrás, arriba, delante y abajo); y después, en el otro sentido */
    COREO['circulos-brazos'] = (function () {
      var pies = { p: { suelo: [11, 0], abre: 7 } };
      /* el brazo, en ocho puntos del círculo: [cuánto se levanta, hacia dónde (0, al frente; 180, atrás), el hombro (arriba, adelante)] */
      var Q = { ab: [3, 80, 0, 0], ba: [45, 160, 0, -1.5], at: [92, 126, 0.5, -2.5], ta: [135, 150, 1.8, -1.5], ar: [177, 0, 2.6, 0], da: [135, 4, 1.6, 1], de: [90, 6, 0, 1.5], bd: [45, 12, 0, 0.5] };
      var P = function (q) { return sobre(pies, { hom: [q[2], q[3]], b: { e: q[0], z: q[1], g: 0, c: 5 }, m: { tipo: 'plana', palma: [-1, 0, 0] } }); };
      var K = {}, n, T = 0.31;
      for (n in Q) K[n] = P(Q[n]);
      var vuelta = function (l) { return l.map(function (q) { return [q, T, 'lineal']; }); };
      var atras = ['ba', 'at', 'ta', 'ar', 'da', 'de', 'bd', 'ab'], delante = ['bd', 'de', 'da', 'ar', 'ta', 'at', 'ba', 'ab'];
      return {
        vista: [66, 22], rastro: 'mi', clavos: ['ti', 'td'],
        posturas: K,
        inicio: 'ab', encuadra: ['ar', 'de', 'at'],
        rep: vuelta(atras),
        pasos: ['ab', 'rep', { sec: vuelta(delante).concat(vuelta(delante)), desde: 'ab' }]
      };
    })();
    /* el hombro, con el brazo cruzado: un brazo cruza por delante del pecho; el otro lo sujeta y lo mantiene; y cambia de brazo */
    COREO['estiramiento-hombro-cruzado'] = (function () {
      var pies = { p: { suelo: [11, 0], abre: 7 } };
      var cruza = { a: [-27, D.hombroY - 2, 21.5], en: 'torax', polo: [0, -0.5, 1] };                      /* el izquierdo, cruzado ante el pecho */
      var sujeta = { a: [-5, 12, 25], en: 'torax', polo: [-0.6, -1, 0.2] };                                /* la mano derecha lo sujeta por encima del codo */
      var c1 = sobre(pies, { hom: { i: [0, 2.2], d: [0, 0] }, bi: cruza, mi: { tipo: 'suelta' }, bd: aLosLados(10), md: SUELTA });
      var h1 = sobre(pies, { hom: { i: [0, 2.6], d: [0, 0.5] }, bi: { a: [-28, D.hombroY - 2, 19.5], en: 'torax', polo: [0, -0.5, 1] }, mi: { tipo: 'suelta' },
        bd: sujeta, md: { tipo: 'abierta', palma: [0.15, 0, -1], mun: 12 } });
      var de = sobre(pies, { b: aLosLados(10), m: SUELTA });
      return {
        vista: [14, 58], isometrico: 'h1', clavos: ['ti', 'td'],
        posturas: { de: de, c1: c1, h1: h1, c2: refleja(c1), h2: refleja(h1) },
        inicio: 'de', encuadra: ['h1', 'h2'],
        pasos: [{ sec: [['de', 0.6], ['c1', 1.5, 'suave']], desde: 'de' }, { sec: [['h1', 1.4, 'suave']], desde: 'c1' },
                { sec: [['h1', 0.35], ['de', 1.0, 'suave'], ['c2', 1.1, 'suave'], ['h2', 1.2, 'suave']], desde: 'h1' }]
      };
    })();
    /* el estiramiento del durmiente: tumbado de lado sobre el hombro que se estira, con ese brazo delante a 90 grados y el codo doblado
       (los dedos, al techo); el cuerpo gira un poco hacia atrás; y la otra mano empuja suavemente la palma hacia el suelo, sin mover el codo */
    COREO['estiramiento-durmiente'] = (function () {
      /* sobre el costado derecho, de cara a −X; la cabeza, hacia −Z */
      var lado = function (rueda, extra) {
        return sobre({ pel: [0, 21.5, 0], giro: [-90, rueda, -84], cab: [0, 0, -26], p: { e: 32, z: 0, c: 50 }, t: { tob: 8 },
          bi: { a: [D.hombroX + 4, D.hombroY - 44, 9], en: 'torax', polo: [1, 0, -0.3] }, mi: { tipo: 'abierta', prono: 90 } }, extra || {});
      };
      var h0 = resolver(lado(0)).d.hom, Y_CODO = 6.2, codo = [h0[0] - Math.sqrt(D.brazo * D.brazo - (h0[1] - Y_CODO) * (h0[1] - Y_CODO)), Y_CODO, h0[2]];
      /* el antebrazo de abajo, a «g» grados de la vertical hacia los pies; el codo no se mueve */
      var abajo = function (g) { var s = Math.sin(g * RAD), c = Math.cos(g * RAD); return { a: [codo[0], codo[1] + D.antebrazo * c, codo[2] + D.antebrazo * s], polo: menos(codo, h0) }; };
      var mano = function (g) { var s = Math.sin(g * RAD), c = Math.cos(g * RAD); return { tipo: 'abierta', palma: [0, -s, c] }; };
      /* girado «rueda» grados hacia atrás sin que el hombro de abajo se mueva del suelo */
      var girado = function (rueda, g, extra) {
        var P = lado(rueda, sobre({ bd: abajo(g), md: mano(g) }, extra || {})), h = resolver(P).d.hom;
        return pieSobreSuelo(sobre(P, { pel: [P.pel[0] + h0[0] - h[0], P.pel[1] + h0[1] - h[1], P.pel[2] + h0[2] - h[2]] }), 'd');
      };
      var R = -16, G = 48;
      var a = girado(0, 0), r = girado(R, 0);
      /* la otra mano, sobre el dorso de la de abajo */
      var sobreMano = function (g) {
        var m = resolver(girado(R, g)).d.agarre, s = Math.sin(g * RAD), c = Math.cos(g * RAD);
        return { bi: { a: [m[0] + 1, m[1] + 4.2 * s + 1.5, m[2] - 4.2 * c], polo: [0.2, 1, -0.4] }, mi: { tipo: 'abierta', palma: [0, -s, c] } };
      };
      return {
        vista: [[-140, 28], [-92, 16]], isometrico: 's',
        posturas: { a: a, r: r, s0: girado(R, 0, sobreMano(0)), s: girado(R, G, sobreMano(G)) },
        inicio: 'a', encuadra: ['a', 'r', 's'],
        pasos: ['a', { sec: [['r', 1.7, 'suave']], desde: 'a' }, { sec: [['s0', 1.5, 'suave'], ['s0', 0.3], ['s', 2.2, 'suave']], desde: 'r' }]
      };
    })();
  })();
    return {"press-hombros-barra-sentado": "d66b94946187", "press-hombros-mancuernas": "38003bb6c4eb", "press-hombro-mancuerna-un-brazo": "2775529078f5", "press-arnold": "30a9a896a67a", "press-hombros-inclinado-mancuernas": "5a2942f116c9", "press-hombros-rotacion": "1fe650641685", "push-press": "9c23439d230d", "elevaciones-laterales-sentado": "a522e4675689", "elevacion-frontal-barra": "d13a016dcf7a", "elevacion-lateral-polea": "d9768e4b90df", "apertura-inversa-polea-un-brazo": "7c1dd69f0b58", "rotacion-externa-polea": "82e2462542b8", "pajaro-polea-inclinado": "80de90e40db8", "elevacion-frontal-polea": "b01ed4163239", "pajaros-mancuernas": "377c97f4ed0b", "pajaros-tumbado-banco": "2e8a120c3539", "pajaro-tumbado-un-brazo": "5e522017d6c4", "remo-deltoides-posterior-mancuernas": "512a375699fa", "remo-deltoides-posterior-barra": "92d511ee56d3", "aperturas-inversas-polea": "94ad20265333", "pajaros-polea-sentado": "11ad0428e77f", "rotacion-externa-mancuerna-tumbado": "9e58747504ca", "rotacion-interna-polea": "502383813ddb", "empuje-isometrico-hombro-pared": "2114f9da73fd", "flexion-pica": "d338d144be1b", "flexion-pica-pies-elevados": "89c2229d768a", "flexion-pseudoplancha": "f94d2cd5cdcd", "flexion-hindu": "2941e2517f2f", "pino-libre": "ceb6859fcff7", "flexion-pino-pared": "b189f45c00e7", "pino-pared": "bc5d3a16d718", "circulos-brazos": "4feceeff49aa", "estiramiento-hombro-cruzado": "5fcc791d96b7", "estiramiento-durmiente": "cd8c68cb3d9d"};
  });
})();
