  /* ───────────────────────── las coreografías: ESPALDA ALTA (bloque 4) ─────────────────────────
     Las mismas reglas que en 70-coreografias.js: cada una sale de los pasos verificados de su ficha y no añade técnica
     que la ficha no diga. Van por familias: los encogimientos, los remos sentado en polea, los remos libres, los
     omóplatos (de pie, en un banco, en la pared, a cuatro patas, colgado), tumbado boca abajo y los estiramientos del cuello.
     Casi todo aquí se hace con los hombros (hom: [arriba, adelante], en centímetros): encogerlos hacia las orejas, o llevar
     los omóplatos atrás (juntarlos), abajo y atrás, o adelante (separarlos). */
  (function () {
    var ENCOGE = 6;                                   /* lo que suben los hombros «lo más alto que pueda» */
    /* (busca y aUnBrazo, que nacieron aquí, están con las ayudas de cualquier bloque, en 70-coreografias.js) */

    /* ══════════ los encogimientos ══════════ */
    /* con barra: de pie, las rodillas algo flexionadas; la barra cuelga ante los muslos, con las palmas hacia abajo (hacia atrás,
       con los brazos colgando) y las manos a la anchura de los hombros; los hombros suben en vertical y bajan despacio */
    var HACIA_ATRAS = { tipo: 'puno', barra: [1, 0, 0], palma: [0, 0, -1] };
    COREO['encogimientos-barra'] = (function () {
      var base = { pel: [0, PIE - 2.5, -2.5], giro: [0, 2, 0], p: { suelo: [11, 0], abre: 7 }, m: HACIA_ATRAS };
      return {
        vista: [26, 152], rastro: 'hi', esfuerzo: [0, 1], clavos: ['ti', 'td'],
        material: [['barra', { discos: 17 }]],
        posturas: { a: colgando(base, D.hombroX, 9), b: colgando(sobre(base, { hom: [ENCOGE, 0] }), D.hombroX, 9) },
        rep: [['b', 0.9, 'empuje'], ['b', 0.7], ['a', 1.6, 'freno'], ['a', 0.4]],
        pasos: ['a', 'rep', { rep: 1.6 }]
      };
    })();
    /* en polea baja: de pie ante ella, con el agarre en las manos y los brazos estirados; arriba, un instante */
    COREO['encogimientos-polea'] = (function () {
      var G = 13, base = { pel: [0, PIE - 1, 0], p: { suelo: [11, 0], abre: 7 }, m: HACIA_ATRAS };
      return {
        vista: [-58, -118], rastro: 'hi', esfuerzo: [0, 1], clavos: ['ti', 'td'],
        material: [['polea', { en: [0, 66], alto: 22, agarre: 'barra', sobra: 7, encuadre: 150 }]],
        posturas: { a: colgando(base, G, 10), b: colgando(sobre(base, { hom: [ENCOGE, 0] }), G, 10) },
        rep: [['b', 1.0, 'empuje'], ['b', 0.8], ['a', 1.6, 'freno'], ['a', 0.4]],
        pasos: ['a', 'rep', { rep: 1.0 }]
      };
    })();
    /* entre dos poleas bajas, con un asa en cada mano: los cables tiran de los brazos, estirados, un poco hacia fuera */
    COREO['encogimientos-entre-poleas'] = (function () {
      var m = { tipo: 'puno', barra: [0, 0, 1], palma: [-1, 0, 0] }, X = 104;
      var base = { pel: [0, PIE - 1, 0], p: { suelo: [13, 0], abre: 8 }, m: m };
      var abiertos = function (P) { var h = resolver(P).i.hom; return estirado(P, [h[0] + 13, h[1] - 56, h[2] + 1], 'b', 0.3, [1, 0.1, -0.5]); };
      return {
        vista: [14, [-50, 22]], picado: 10, rastro: 'hi', esfuerzo: [0, 1], clavos: ['ti', 'td'],
        material: [['polea', { en: [X, 0], rumbo: 90, alto: 22, a: 'i', encuadre: 150 }], ['polea', { en: [-X, 0], rumbo: -90, alto: 22, a: 'd', encuadre: 150 }]],
        posturas: { a: abiertos(base), b: abiertos(sobre(base, { hom: [ENCOGE, 0] })) },
        rep: [['b', 1.0, 'empuje'], ['b', 0.5], ['a', 1.7, 'freno'], ['a', 0.4]],
        pasos: ['a', 'rep', { rep: 1.5 }]
      };
    })();
    /* silverback: de pie con la barra delante (las manos, algo más abiertas que los hombros); se inclina desde la cadera, con la espalda
       recta; y junta los omóplatos «como si quisiera que se tocaran» y los suelta: los brazos no se doblan, la barra sube lo que suben ellos */
    COREO['encogimiento-silverback'] = (function () {
      var G = 25, pies = { suelo: [18, 0], abre: 8 }, m = { tipo: 'puno', barra: [1, 0, 0], palma: [0, -0.6, -0.8] };
      var inc = sobre(inclinado(42, { m: m }), { p: pies });
      return {
        vista: [-64, -124], rastro: 'manos', esfuerzo: [0, 1], clavos: ['ti', 'td'],
        material: [['barra', { discos: 17 }]],
        posturas: {
          de: colgando({ p: pies, m: HACIA_ATRAS }, G, 9),
          a: colgando(sobre(inc, { hom: [0, 2.2] }), G, 2),
          b: colgando(sobre(inc, { hom: [-1, -3.6], col: [-3, 0, 0] }), G, 2)
        },
        inicio: 'a', encuadra: ['de'],
        rep: [['b', 1.1, 'empuje'], ['b', 0.9], ['a', 1.5, 'freno'], ['a', 0.5]],
        pasos: ['de', { sec: [['a', 1.7, 'suave']], desde: 'de' }, 'rep']
      };
    })();
    /* sin peso: los hombros suben con firmeza, se quedan unos segundos y bajan con suavidad */
    COREO['encogimientos-sin-peso'] = {
      vista: [10, 72], rastro: 'hi', esfuerzo: [0, 1],
      posturas: { a: { b: aLosLados(8), m: SUELTA }, b: { hom: [ENCOGE, 0], b: aLosLados(8), m: SUELTA } },
      rep: [['b', 1.0, 'empuje'], ['b', 2.6], ['a', 2.2, 'suave'], ['a', 0.8]],
      pasos: ['a', 'rep', { rep: 3.6 }]
    };

    /* ══════════ el remo sentado en polea baja ══════════
       Sentado en el banco de la máquina, de cara a la polea, con los pies en el apoyo (una chapa inclinada) y las rodillas algo
       flexionadas. El cable sale de la polea, abajo, y el agarre va de los brazos estirados al abdomen. */
    var YR = 53, Z_COL = 138, CHAPA = [Z_COL - 82.5, 31, 25];           /* la cadera, sentado; la columna; y el apoyo de los pies */
    var PIES_R = (function () {
      var g = CHAPA[2] * RAD, s = Math.sin(g), c = Math.cos(g);        /* la chapa, por arriba, se aleja: el pie se apoya plano en ella */
      var arriba_ = [0, s, -c], punta = [0, c, s], centro = [0, CHAPA[1], Z_COL - CHAPA[0]];
      var tob = mas(centro, mas(por(arriba_, 1.5 + D.tobillo), por(punta, -5)));
      return { p: { a: [10, tob[1], tob[2]], polo: [0.12, 1, 0.2] }, t: { punta: punta, arriba: arriba_ } };
    })();
    function maquinaRemo(agarre, sobra) {
      return [['banco', { en: [0, -16], largo: 74, alto: YR - 11 }], ['polea', { en: [0, Z_COL], alto: 46, agarre: agarre, sobra: sobra, apoyo: CHAPA, encuadre: 150 }]];
    }
    /* G: las manos, a cada lado; m: la mano; o: { agarre, sobra, alto (a cuánto de la cadera, tronco arriba, llega el agarre), codo, pausa, pasos } */
    function remoSentado(G, m, o) {
      var P = function (inc, extra) { return sobre(sobre({ pel: [0, YR, 0], giro: [0, inc, 0], cab: [-inc * 0.5, 0, 0], m: m }, PIES_R), extra || {}); };
      var a = estirado(P(5, { hom: [0, 1.5] }), [G, YR + 19, 60], 'b', 0.15, [1, -0.5, -0.2]);          /* los brazos, estirados del todo */
      var Pb = P(-4, { col: [-4, 0, 0], hom: [-1, -2.8] });
      return {
        vista: [-72, -128], rastro: 'manos', esfuerzo: [0, 1],
        material: maquinaRemo(o.agarre, o.sobra),
        posturas: { a: a, b: conAgarre(Pb, anteTronco(Pb, o.alto, 13.5, G), o.codo || [0.35, -0.3, -1]) },
        rep: [['b', 1.2, 'empuje'], ['b', o.pausa || 0.5], ['a', 1.9, 'freno'], ['a', 0.4]],
        pasos: o.pasos
      };
    }
    /* con el agarre estrecho (el triángulo, con las palmas enfrentadas): el pecho fuera, los codos atrás, pegados a las costillas, hasta
       que el agarre llega al abdomen; un segundo, y vuelve despacio */
    COREO['remo-sentado-polea'] = remoSentado(5.5, { tipo: 'puno', barra: [0, 1, 0], palma: [-1, 0, 0] },
      { agarre: 'v', alto: 13, codo: [0.3, -0.35, -1], pausa: 1.0, pasos: ['a', 'rep', { rep: 1.2 }] });
    /* con barra ancha: las manos, más separadas que los hombros; al ombligo, no más arriba, con los codos cerca del cuerpo */
    COREO['remo-sentado-polea-agarre-ancho'] = remoSentado(27, { tipo: 'puno', barra: [1, 0, 0], palma: [0, -1, 0] },
      { agarre: 'barra', sobra: 12, alto: 10.5, codo: [0.12, -0.35, -1], pasos: ['a', 'rep', { rep: 1.7 }] });
    /* con agarre supino: la barra corta, con las palmas hacia arriba y las manos juntas; al abdomen, con los codos pegados al cuerpo */
    COREO['remo-sentado-polea-supino'] = remoSentado(7, { tipo: 'puno', barra: [1, 0, 0], palma: [0, 1, 0] },
      { agarre: 'barra', sobra: 7, alto: 13, codo: [0.25, -0.4, -1], pasos: ['a', 'rep', { rep: 1.7 }] });

    /* el remo alto, sentado en un banco frente a la polea, con los pies en el suelo: primero se sienta (la barra cuelga de la polea);
       coge la barra ancha con las palmas hacia abajo; y tira, con los codos bien abiertos, hacia la parte alta del pecho; un segundo */
    COREO['remo-alto-polea-sentado'] = (function () {
      var m = { tipo: 'puno', barra: [1, 0, 0], palma: [0, -1, 0] }, G = 30, ZC = 100, ALTO_P = 100, cuelga_ = [0, ALTO_P - 17, ZC - 9];
      var P = function (inc, extra) { return sobre({ pel: [0, 55, 0], giro: [0, inc, 0], cab: [-inc * 0.5, 0, 0], p: { suelo: [12, 44], abre: 6 } }, extra || {}); };
      var s = P(0, { b: { a: [13, 62, 26], polo: [1, -0.3, -0.7] }, m: { tipo: 'abierta', prono: 90 } });
      var g = estirado(P(50, { m: m, hom: [0, 2] }), [G, cuelga_[1], cuelga_[2]], 'b', 0.2, [1, 0.1, -0.3]);
      var a = estirado(P(3, { m: m, hom: [0, 1.5] }), [G, 96, 60], 'b', 0.5, [1, 0.15, -0.2]);
      var Pb = P(-3, { m: m, col: [-4, 0, 0], hom: [-1, -2.8] }), E = resolver(Pb), pecho = mas(E.tor, aplicar(E.Bt, [0, 16.5, 11]));
      return {
        vista: [-48, -126], rastro: 'manos', esfuerzo: [0, 1], clavos: ['ti', 'td'], reposo: ['s'],      /* de tres cuartos: se ven los dos codos, abiertos */
        material: [['banco', { en: [0, -20], largo: 96 }], ['polea', { en: [0, ZC], alto: ALTO_P, agarre: 'barra', sobra: 13, reposo: cuelga_ }]],
        posturas: { s: s, g: g, a: a, b: conAgarre(Pb, [G, pecho[1], pecho[2] + 5], [1, 0.06, -0.3]) },
        inicio: 'a', encuadra: ['s', 'g'],
        rep: [['b', 1.2, 'empuje'], ['b', 1.0], ['a', 1.9, 'freno'], ['a', 0.4]],
        pasos: ['s', { sec: [['g', 1.3, 'suave'], ['g', 0.25], ['a', 1.3, 'suave']], desde: 's' }, 'rep', { rep: 2.2 }]
      };
    })();

    /* ══════════ los remos libres ══════════ */
    /* el remo alto inclinado, con mancuernas: el tronco, ligeramente inclinado; las mancuernas suben hacia el pecho con los codos lo más
       altos que se pueda (por encima de las manos), y bajan con control */
    COREO['remo-alto-inclinado-mancuernas'] = (function () {
      var m = { tipo: 'puno', barra: [1, 0, 0], palma: [0, -0.35, -0.94] };
      var inc = inclinado(24, { m: m }), Pb = sobre(inc, { hom: [1.5, -2] }), E = resolver(Pb), pecho = mas(E.tor, aplicar(E.Bt, [0, 11, 12]));
      return {
        vista: [-56, -124], rastro: 'manos', esfuerzo: [0], clavos: ['ti', 'td'],
        material: [['mancuernas']],
        posturas: {
          de: colgando(sobre(DE_PIE, { m: HACIA_ATRAS }), 17, 7),
          a: colgando(inc, 17, 4),
          b: conAgarre(Pb, [16, pecho[1], pecho[2] + 3], [1, 0.9, -0.15])
        },
        inicio: 'a', encuadra: ['de'],
        rep: [['b', 1.1, 'empuje'], ['b', 0.4], ['a', 1.7, 'freno'], ['a', 0.4]],
        pasos: [{ sec: [['de', 0.9], ['a', 1.5, 'suave']], desde: 'de' }, 'rep', { rep: 1.5 }]
      };
    })();
    /* landmine perpendicular, a una mano: la barra, anclada, queda atravesada a un lado; con la cadera un poco flexionada coge la barra
       por el extremo, junto a los discos, y la sube hasta la altura del pecho: arriba, el brazo queda paralelo al suelo (el codo, hacia
       fuera) y la mano, debajo. La punta de la barra va por su arco. (Se escribe con el brazo izquierdo y se refleja: así la barra se
       va hacia la izquierda de la pantalla, bajo los rótulos, y Jérôme queda a la derecha.) */
    COREO['remo-landmine-perpendicular'] = (function () {
      var PIV = [186, 5, 18], R = 17, ZB = 18;
      var enArcoX = function (y, r) { return PIV[0] - Math.sqrt(r * r - (y - PIV[1]) * (y - PIV[1])); };       /* la x de la punta, a una altura */
      var g0 = [16, R + 2.5, ZB], r = largo(menos(g0, PIV));
      var mano = function (g) { return { tipo: 'puno', barra: unidad(menos(PIV, g)), palma: [0, -0.3, -0.95] }; };
      var otra = { bd: aLosLados(10), md: SUELTA };
      var s0 = sobre(DE_PIE, sobre(otra, { bi: aLosLados(8), mi: SUELTA }));
      /* a cogerla, al suelo: la cadera y las rodillas se doblan lo que haga falta */
      var Pg = sobre(otra, { pel: [0, 60, -27], giro: [0, 66, 0], cab: [-24, 0, 0], p: { suelo: [11, 0], abre: 9, polo: [0.3, 0.1, 1] }, mi: mano(g0), hom: { i: [1.5, 1], d: [0, 0] } });
      /* con ella en la mano: la cadera, un poco flexionada; el brazo, colgando */
      var inc = sobre(inclinado(26), otra), ha = resolver(inc).i.hom, ya = ha[1] - BRAZO + 0.6, ga = [enArcoX(ya, r), ya, ZB];
      var yb = ha[1] - 21, gb = [enArcoX(yb, r), yb, ZB];                                                          /* arriba: la mano, a la altura del pecho */
      /* y el brazo (del hombro al codo), paralelo al suelo: el codo, hacia fuera y a la altura del hombro (se busca cuánto tira hacia arriba) */
      var Pb = sobre(inc, { mi: mano(gb), hom: { i: [0, -2.4], d: [0, 0] } }), arribaB = function (py) { return conAgarre(Pb, gb, [1, py, -0.35], 'bi'); };
      var b = arribaB(busca(function (py) { var E = resolver(arribaB(py)); return E.i.cod[1] - E.i.hom[1]; }, 0, -1.2, 1.2));
      return {
        vista: [-24, -152], rastro: 'md', esfuerzo: [0], clavos: ['ti', 'td'], reposo: ['s'],
        material: [['landmine', { pivote: [-PIV[0], PIV[2]], a: 'd', sobra: 4, dentro: 15, discos: R, reposo: [-g0[0], g0[1], g0[2]] }]],
        posturas: {
          s: refleja(s0), g: refleja(conAgarre(Pg, g0, [1, 0.2, -0.5], 'bi')),
          a: refleja(conAgarre(sobre(inc, { mi: mano(ga), hom: { i: [1.5, 0.5], d: [0, 0] } }), ga, [1, 0.3, -0.4], 'bi')),
          b: refleja(b)
        },
        inicio: 'a', encuadra: ['s', 'g'],
        rep: [['b', 1.2, 'empuje'], ['b', 0.5], ['a', 1.8, 'freno'], ['a', 0.45]],
        pasos: ['s', { sec: [['g', 1.5, 'suave'], ['g', 0.25], ['a', 1.5, 'suave']], desde: 's' }, 'rep', { rep: 1.7 }]
      };
    })();
    /* con el pecho apoyado en un banco a 45 grados: tumbado boca abajo en el respaldo, con la cabeza justo por encima del borde y las
       puntas de los pies en el suelo, a los lados del asiento; las mancuernas cuelgan y suben hacia la parte alta del abdomen */
    COREO['remo-pecho-apoyado-mancuernas'] = (function () {
      var ANG = 45, LARGO = 124, ASIENTO = 38, ZB = -22, m = { tipo: 'puno', barra: [0, 0, 1], palma: [-1, 0, 0] }, G = 23;
      var s = Math.sin(ANG * RAD), c = Math.cos(ANG * RAD), bis = [0, 44, ZB - LARGO / 2 + ASIENTO];              /* la bisagra, y de ahí el respaldo: sube hacia +Z */
      var enRespaldo = function (t, fuera) { return [0, bis[1] + t * s + fuera * c, bis[2] + t * c - fuera * s]; };   /* a «t» de la bisagra y a «fuera» de la tapicería */
      var base = { pel: enRespaldo(37.5, 11.5), giro: [0, ANG, 0], cab: [-30, 0, 0], p: { suelo: [20, bis[2] - 31], abre: 4, talon: 58, polo: [0.2, -0.3, 1] }, m: m };
      var a = colgando(sobre(base, { hom: [0, 1.5] }), G, 0), arriba_ = sobre(base, { hom: [-1, -3] });
      return {
        vista: [-62, -120], rastro: 'manos', esfuerzo: [0, 1], clavos: ['ti', 'td'],
        material: [['banco', { en: [0, ZB], largo: LARGO, respaldo: ANG, asiento: ASIENTO }], ['mancuernas']],
        posturas: { a: a, b: conAgarre(arriba_, anteTronco(arriba_, 17, 7, G), [0.3, 1, -0.6]) },
        rep: [['b', 1.1, 'empuje'], ['b', 0.7], ['a', 1.8, 'freno'], ['a', 0.45]],
        pasos: ['a', 'rep', { rep: 1.1 }]
      };
    })();

    /* ══════════ los omóplatos ══════════ */
    /* en el plano de la escápula: las palmas, enfrentadas; los codos, un poco flexionados; suben despacio hacia delante y algo hacia fuera,
       hasta más o menos la altura de los hombros, con los omóplatos atrás */
    COREO['elevacion-plano-escapular'] = (function () {
      var pies = { suelo: [18, 0], abre: 8 }, abajo = { tipo: 'puno', barra: [0, 0, 1], palma: [-1, 0, 0] }, alto = { tipo: 'puno', barra: [0, 1, 0], palma: [-0.87, 0, 0.5] };
      return {
        vista: [32, -52], rastro: 'mi', esfuerzo: [0], material: [['mancuernas']],
        posturas: {
          a: { p: pies, b: { e: 7, z: 55, g: 0, c: 12 }, m: abajo },
          a2: { p: pies, hom: [-0.5, -2.2], b: { e: 7, z: 55, g: 0, c: 12 }, m: abajo },
          b: { p: pies, hom: [-0.5, -2.2], b: { e: 88, z: 30, g: 0, c: 12 }, m: alto }
        },
        inicio: 'a2',
        rep: [['b', 2.0, 'suave'], ['b', 0.4], ['a2', 2.2, 'freno'], ['a2', 0.5]],
        pasos: ['a', 'rep', { rep: 2.4 }]
      };
    })();
    /* tumbado boca arriba en un banco, con una mancuerna y el brazo apuntando al techo: sin doblar el codo, sube solo el hombro (se
       despega del banco) y vuelve a apoyarlo */
    COREO['protraccion-escapular-tumbado'] = (function () {
      var base = { pel: [0, 55, 30], giro: [0, -90, 0], p: { suelo: [17, 68], abre: 8, polo: [0.2, 1, 0.3] },
        bd: { a: [-9, 9, 11.5], en: 'pelvis', polo: [-1, -0.2, -0.3] }, md: SUELTA, mi: { tipo: 'puno', barra: [1, 0, 0], palma: [0, 0, 1] } };
      var alTecho = function (h) { var P = sobre(base, { hom: { i: h, d: [0, 0] } }), q = resolver(P).i.hom; return estirado(P, [q[0], q[1] + 100, q[2]], 'bi', 0.12, [1, 0, 0.4]); };
      return {
        vista: [78, [24, 28]], picado: 14, rastro: 'mi', esfuerzo: [0, 1], clavos: ['ti', 'td'],
        material: [['banco', { largo: 124 }], ['mancuernas', { lado: 'i' }]],
        posturas: { a: alTecho([0, -0.5]), b: alTecho([0, 5]) },
        rep: [['b', 1.1, 'empuje'], ['b', 0.6], ['a', 1.5, 'freno'], ['a', 0.5]],
        pasos: ['a', 'rep', { rep: 1.7 }]
      };
    })();
    /* el empaquetado: de pie, saca el pecho; lleva los omóplatos hacia abajo y hacia atrás; y mantiene */
    COREO['empaquetado-escapular'] = {
      vista: [128, 30], isometrico: 'b',
      posturas: {
        a: { p: { suelo: [10, 0], abre: 6 }, b: aLosLados(8), m: SUELTA },
        a2: { p: { suelo: [10, 0], abre: 6 }, col: [-3, 0, 0], b: aLosLados(8), m: SUELTA },
        b: { p: { suelo: [10, 0], abre: 6 }, col: [-3, 0, 0], hom: [-2.6, -3.2], b: aLosLados(10), m: SUELTA }
      },
      pasos: [{ sec: [['a', 0.6], ['a2', 1.2, 'suave']], desde: 'a' }, { sec: [['b', 1.8, 'suave']], desde: 'a2' }, { sec: [['b', 2.6], ['a2', 1.4, 'suave']], desde: 'b' }]
    };
    /* trap-3: el tronco inclinado, una mano en la rodilla; el hombro del brazo que trabaja, abajo y atrás; y esa mano sube por encima
       de la cabeza, unos 15 grados abierta, sin que el hombro pierda su sitio. Al terminar, el otro brazo. (Se escribe con el brazo
       izquierdo y se refleja: el que trabaja primero es el derecho, el que queda del lado de la cámara.) */
    COREO['elevacion-trap-3'] = (function () {
      var ANG = 55, inc = inclinado(ANG), E0 = resolver(inc), rod = E0.d.rod, mano = { tipo: 'abierta', palma: [-1, 0, 0] };
      var enRodilla = { bd: { a: [rod[0] - 1, rod[1] + 9, rod[2] + 3], polo: [-1, 0.3, -0.4] }, md: { tipo: 'abierta', prono: 90, mun: -40 } };
      var P = function (h) { return sobre(inc, sobre(enRodilla, { mi: mano, hom: { i: h, d: [0, 1] } })); };
      var cuelga_ = function (h) { var q = resolver(P(h)).i.hom; return estirado(P(h), [q[0] + 2, q[1] - 100, q[2] + 4], 'bi', 0.6, [1, 0.2, -0.5]); };
      var a = cuelga_([1, 1.5]), a2 = cuelga_([-2, -2.6]);
      /* arriba: a lo largo del tronco hacia la cabeza, 15 grados abierta y 12 por encima de la línea del tronco */
      var Pb = P([-2, -2.6]), Eb = resolver(Pb), u = aplicar(Eb.Bt, [Math.sin(15 * RAD) * Math.cos(12 * RAD), Math.cos(15 * RAD) * Math.cos(12 * RAD), -Math.sin(12 * RAD)]);
      var b = estirado(Pb, mas(Eb.i.hom, por(u, 100)), 'bi', 0.5, [1, -0.4, 0.2]);
      return {
        vista: [-58, -128], rastro: 'md', esfuerzo: [0, 1], clavos: ['ti', 'td'],
        posturas: { a: refleja(a), a2: refleja(a2), b: refleja(b), ra2: a2, rb: b },
        inicio: 'a2', encuadra: ['b', 'rb'],
        rep: [['b', 1.5, 'suave'], ['b', 0.5], ['a2', 1.7, 'freno'], ['a2', 0.5]],
        pasos: ['a', { sec: [['a2', 1.3, 'suave']], desde: 'a' }, 'rep',
                { sec: [['ra2', 1.3, 'suave'], ['rb', 1.5, 'suave'], ['rb', 0.4], ['ra2', 1.1, 'freno']], desde: 'a2' }]
      };
    })();

    /* ── en la pared ── */
    /* los ángeles: de espaldas a la pared (los talones, la cadera, los hombros y la nuca la tocan); los brazos, contra ella, con los
       codos en ángulo recto a la altura de los hombros; se estiran hacia arriba deslizándose por la pared y vuelven */
    COREO['angeles-en-pared'] = (function () {
      var ZP = -13.4, base = { pel: [0, PIE - 0.5, -1.2], cab: [-3, 0, 0], p: { suelo: [9, ZP + D.talon + 0.6], abre: 5 } };
      var mano = { tipo: 'abierta', palma: [0, 0, 1] };                                 /* el dorso, contra la pared */
      var hy = resolver(base).i.hom[1], zc = ZP + 4.2;
      return {
        vista: [18, 62], rastro: 'manos', esfuerzo: [0], clavos: ['ti', 'td'],
        material: [['pared', { z: ZP, normal: [0, 0, 1], ancho: 170 }]],
        posturas: {
          a: sobre(base, { b: aLosLados(8), m: SUELTA }),
          w: sobre(base, { b: { a: [D.hombroX + 26.2, hy + 23.6, zc], polo: [1, -0.25, -0.35] }, m: mano }),
          y: sobre(base, { b: { a: [D.hombroX + 15, hy + 48.5, zc], polo: [1, -0.5, -0.3] }, m: mano })
        },
        inicio: 'w', encuadra: ['y'],
        rep: [['y', 1.5, 'suave'], ['y', 0.4], ['w', 1.7, 'freno'], ['w', 0.4]],
        pasos: ['a', { sec: [['w', 1.6, 'suave']], desde: 'a' }, 'rep', { rep: 1.9 }]
      };
    })();
    /* la flexión escapular: las manos en la pared y los brazos estirados, que no se doblan; el cuerpo se acerca (los omóplatos se
       juntan, atrás y abajo) y se aleja (la parte alta de la espalda se redondea y los omóplatos se separan) */
    COREO['flexion-escapular-pared'] = (function () {
      var W = [19, 121, 49.5], mp = { tipo: 'abierta', prono: 90, mun: -68 };
      var recto = function (extra) { return function (fi) { return sobre({ pel: [0, 8 + 78 * Math.cos(fi * RAD), 78 * Math.sin(fi * RAD)], giro: [0, fi, 0], p: { suelo: [10, 0], abre: 4 }, b: { a: W, polo: [0.3, -1, -0.3] }, m: mp }, extra); }; };
      var n = aUnBrazo(recto({}), W, -8, 25), r = aUnBrazo(recto({ hom: [-1.2, -3.4], col: [-3, 0, 0] }), W, -8, 25), p = aUnBrazo(recto({ hom: [0.5, 3.8], col: [11, 0, 0], cab: [6, 0, 0] }), W, -8, 25);
      return {
        vista: [-86, -146], rastro: 'pecho', esfuerzo: [0, 1, 2, 3], clavos: ['mi', 'md', 'ti', 'td'],
        material: [['pared', { z: 58, normal: [0, 0, -1], ancho: 130 }]],
        posturas: { a: n, r: r, p: p },
        inicio: 'r',
        rep: [['p', 1.6, 'suave'], ['p', 0.8], ['r', 1.6, 'suave'], ['r', 0.7]],
        pasos: ['a', { sec: [['r', 1.5, 'suave']], desde: 'a' }, 'rep']
      };
    })();
    /* y a cuatro patas: las manos bajo los hombros y las rodillas bajo la cadera; los brazos, estirados, no se doblan */
    COREO['flexion-escapular-cuadrupedia'] = (function () {
      var ZR = -34, YM = 5, mp = { tipo: 'abierta', prono: 90, mun: -78 };
      var piernas = { a: [10, 7, ZR - 38], polo: [0, -1, 0.3] }, pies = { punta: [0, -0.1, -1], arriba: [0, -1, 0.1] };
      var P = function (extra, w) { return function (cab) { return sobre({ pel: [0, 47, ZR], giro: [0, cab, 0], cab: [-10, 0, 0], p: piernas, t: pies, b: { a: w || [19, YM, 0], polo: [0.4, 0.2, -1] }, m: mp }, extra); }; };
      /* las manos, bajo los hombros de la postura neutra */
      var h0 = resolver(aUnBrazo(P({}, [19, YM, ZR + 43]), [19, YM, ZR + 43], 55, 89)).i.hom, W = [19, YM, h0[2]];
      var n = aUnBrazo(P({}, W), W, 55, 89), r = aUnBrazo(P({ hom: [-1, -3.4], col: [-4, 0, 0], cab: [-14, 0, 0] }, W), W, 55, 89), p = aUnBrazo(P({ hom: [0.5, 3.8], col: [13, 0, 0], cab: [-2, 0, 0] }, W), W, 55, 89);
      return {
        vista: [-76, [-36, 30]], picado: 14, rastro: 'pecho', esfuerzo: [0, 1, 2, 3], clavos: ['mi', 'md', 'ti', 'td'],
        posturas: { a: n, r: r, p: p },
        inicio: 'r',
        rep: [['p', 1.6, 'suave'], ['p', 0.8], ['r', 1.6, 'suave'], ['r', 0.7]],
        pasos: ['a', { sec: [['r', 1.5, 'suave']], desde: 'a' }, 'rep']
      };
    })();
    /* colgado de la barra, con el cuerpo recto: sin doblar los codos, los omóplatos se juntan y el cuerpo sube un poco; y vuelve despacio */
    COREO['dominadas-escapulares'] = (function () {
      var G = 22, recto = { p: { e: 3, z: 0, c: 4 }, t: { tob: 30 } };
      return {
        vista: [152, 24], rastro: 'pel', esfuerzo: [0, 1], clavos: clavosB(G), material: [barraD()],
        posturas: { a: cuelga(G, recto), b: activo(G, recto) },
        rep: [['b', 1.0, 'empuje'], ['b', 0.7], ['a', 1.9, 'freno'], ['a', 0.5]],
        pasos: ['a', 'rep', { rep: 1.7 }]
      };
    })();

    /* ══════════ tumbado boca abajo ══════════
       En el suelo, con la cabeza hacia +Z, las piernas estiradas y los empeines apoyados. Los brazos se despegan «subiendo sobre todo
       con los hombros, no con la zona lumbar»: el tronco no se mueve; suben los hombros (atrás) y, con ellos, los brazos. */
    var Z_BA = -22;
    function bocaAbajo(extra) { return sobre({ pel: [0, 11.5, Z_BA], giro: [0, 90, 0], cab: [-9, 0, 0], p: { e: 0, z: 0, c: 0 }, t: { punta: [0, 0, -1], arriba: [0, -1, 0] } }, extra || {}); }
    var SUELO_M = 4.6, ARRIBA_H = [-1.5, -3.2];
    /* el brazo, estirado desde el hombro, a «ang» grados de la línea del cuerpo (0, por encima de la cabeza; 90, en cruz) y con la muñeca a «y» del suelo */
    function brazoEn(P, ang, y) {
      var h = resolver(P).i.hom, L = D.brazo + D.antebrazo - 0.4, k = Math.sqrt(1 - (y - h[1]) * (y - h[1]) / (L * L));
      return sobre(P, { b: { a: [h[0] + L * k * Math.sin(ang * RAD), y, h[2] + L * k * Math.cos(ang * RAD)], polo: [0.5, 0.2, -1] } });
    }
    function palmaA(ang) { return { tipo: 'plana', palma: [-Math.cos(ang * RAD), 0, Math.sin(ang * RAD)] }; }      /* hacia el eje del cuerpo: los pulgares, arriba */
    /* la Y, la T y la I: se tumba; lleva los omóplatos abajo y atrás; despega los brazos y mantiene; y los apoya */
    function elevacionProna(ang, m, alto, pasos) {
      var a = brazoEn(bocaAbajo({ m: m }), ang, SUELO_M), a2 = brazoEn(bocaAbajo({ m: m, hom: [-1.5, -1.4] }), ang, SUELO_M + 0.4), b = brazoEn(bocaAbajo({ m: m, hom: ARRIBA_H }), ang, alto);
      return { vista: [[-38, 28], [-146, 34]], rastro: 'manos', isometrico: 'b', posturas: { a: a, a2: a2, b: b }, pasos: pasos };
    }
    var PASOS_4 = ['a', { sec: [['a2', 1.3, 'suave']], desde: 'a' }, { sec: [['b', 1.3, 'empuje'], ['b', 9]], desde: 'a2' }, { sec: [['b', 0.5], ['a', 1.7, 'suave']], desde: 'b' }];
    COREO['elevacion-prona-y'] = elevacionProna(36, palmaA(36), 21, PASOS_4);
    COREO['elevacion-prona-t'] = elevacionProna(90, { tipo: 'plana', palma: [0, 0, 1] }, 21, PASOS_4);        /* las palmas, hacia delante */
    COREO['elevacion-prona-i'] = elevacionProna(0, palmaA(0), 20, PASOS_4.slice(0, 3));
    /* la W: los codos, doblados y bajados hacia los costados; se despegan los brazos sin que los codos suban por encima del cuerpo */
    COREO['elevacion-prona-w'] = (function () {
      var m = { tipo: 'plana', palma: [0, -1, 0] }, w = function (z, h) { return bocaAbajo({ m: m, hom: h, b: { a: [47.5, 27, z], en: 'torax', polo: [0.85, -1, z > 0 ? 0.35 : -0.1] } }); };
      return {
        vista: [[-38, 28], [-146, 34]], rastro: 'manos', isometrico: 'b',
        posturas: { a: w(7, [0, 0]), b: w(-3.5, [-1, -3.2]) },
        pasos: ['a', { sec: [['b', 1.4, 'empuje']], desde: 'a' }, { sec: [['b', 2.4], ['a', 1.6, 'suave']], desde: 'b' }]
      };
    })();
    /* el ángel de nieve inverso: los brazos, al frente y apoyados; se despegan y van despacio hacia los costados; y vuelven al frente */
    COREO['angel-de-nieve-inverso'] = (function () {
      var m = { tipo: 'plana', palma: [0, -1, 0] }, sube = bocaAbajo({ m: m, hom: [-1, -3] });
      return {
        vista: [[-38, 28], [-146, 34]], zoom: 0.92, rastro: 'manos', esfuerzo: [0, 1, 2, 3, 4],       /* en cruz, a medio barrido, las manos llegan al borde */
        posturas: { a: brazoEn(bocaAbajo({ m: m }), 7, SUELO_M - 1.4), f: brazoEn(sube, 9, 19), t: brazoEn(sube, 90, 21), c: brazoEn(sube, 158, 20) },
        inicio: 'f',
        rep: [['t', 1.7, 'entra'], ['c', 1.7, 'sale'], ['c', 0.4], ['t', 1.7, 'entra'], ['f', 1.7, 'sale'], ['f', 0.4]],
        pasos: ['a', { sec: [['f', 0.9, 'suave'], ['t', 1.6, 'entra'], ['c', 1.7, 'sale']], desde: 'a' },
                { sec: [['c', 0.2], ['t', 1.5, 'entra'], ['f', 1.5, 'sale'], ['a', 1.0, 'suave']], desde: 'c' }]
      };
    })();
    /* el superman mariposa: los dedos, entrelazados detrás de la cabeza; se levanta la cabeza y suben los codos todo lo que puedan */
    COREO['superman-mariposa'] = (function () {
      var m = { tipo: 'suelta', palma: [0, -0.4, 0.9] };
      return {
        vista: [[-52, 20], [-146, 32]], rastro: 'cab', esfuerzo: [0, 1],
        posturas: {
          a: bocaAbajo({ cab: [-4, 0, 0], b: { a: [5.5, 36.5, -9.5], en: 'torax', polo: [1, -0.1, 0.5] }, m: m }),
          b: bocaAbajo({ cab: [-30, 0, 0], col: [-5, 0, 0], hom: [-1, -3.2], b: { a: [5.5, 37.5, -13], en: 'torax', polo: [1, 0, -0.55] }, m: m })
        },
        rep: [['b', 1.3, 'empuje'], ['b', 0.8], ['a', 1.9, 'freno'], ['a', 0.5]],
        pasos: ['a', 'rep', { rep: 2.1 }]
      };
    })();

    /* ══════════ los estiramientos del cuello ══════════ */
    /* el trapecio superior: sentado erguido, una mano sujeta el hombro contrario hacia abajo; la cabeza se inclina despacio hacia el otro
       lado; unos 5 segundos, y hacia el otro lado */
    COREO['estiramiento-trapecio-superior'] = (function () {
      var sentado = { pel: [0, 55, 46], p: { suelo: [11, 85], abre: 6, polo: [0.1, 0.3, 1] }, bi: { a: [12, 5, 24], en: 'pelvis', polo: [1, 0, -0.5] }, mi: SUELTA };
      var sujeta = { bd: { a: [9.5, 28.5, 7], en: 'torax', polo: [-0.15, -0.5, 1] }, md: { tipo: 'abierta', palma: [0.1, -1, 0.1], mun: 34 }, hom: { i: [-2.2, 0], d: [0, 2] } };
      var a = sobre(sentado, sujeta), b = sobre(a, { cab: [0, 0, -30] });
      return {
        vista: [10, -44], isometrico: 'b', clavos: ['ti', 'td'], material: [['banco', { rumbo: 180, largo: 124, respaldo: 85 }]],
        posturas: { s: sobre(sentado, { bd: { a: [-12, 5, 24], en: 'pelvis', polo: [-1, 0, -0.5] }, md: SUELTA }), a: a, b: b, a2: refleja(a), b2: refleja(b) },
        inicio: 'a', encuadra: ['s'],
        pasos: [{ sec: [['s', 0.7], ['a', 1.5, 'suave']], desde: 's' }, { sec: [['b', 2.0, 'suave']], desde: 'a' },
                { sec: [['b', 0.8], ['a', 0.8, 'suave'], ['a2', 1.2, 'suave'], ['b2', 1.4, 'suave']], desde: 'b' }]
      };
    })();
    /* el elevador de la escápula: la mano de ese lado, detrás de la espalda; la cabeza gira unos 45 grados hacia el otro lado, con la otra
       mano apoyada detrás; y baja con suavidad, sin tirar con la mano. Después, hacia el otro lado */
    COREO['estiramiento-elevador-escapula'] = (function () {
      var pies = { p: { suelo: [10, 0], abre: 6 } }, atras = { bi: { a: [-3, 5, -11.5], en: 'pelvis', polo: [1, -0.2, -0.8] }, mi: { tipo: 'suelta', palma: [0, 0, -1] } };
      var a = sobre(pies, sobre(atras, { bd: aLosLados(8), md: SUELTA }));
      var b = sobre(pies, sobre(atras, { cab: [0, -45, 0], bd: { a: [0.5, 40.5, -8.5], en: 'torax', polo: [-1, 0.25, 0.3] }, md: { tipo: 'abierta', palma: [0.6, -0.2, 0.75] } }));
      var c = sobre(b, { cab: [34, -45, 0], bd: { a: [-2, 39, -3.5], en: 'torax', polo: [-1, 0.3, 0.35] }, md: { tipo: 'abierta', palma: [0.55, -0.6, 0.55] } });
      return {
        vista: [-28, 44], isometrico: 'c', clavos: ['ti', 'td'],
        posturas: { s: sobre(pies, { b: aLosLados(8), m: SUELTA }), a: a, b: b, c: c, a2: refleja(a), b2: refleja(b), c2: refleja(c) },
        inicio: 'a', encuadra: ['s'],
        pasos: [{ sec: [['s', 0.6], ['a', 1.5, 'suave']], desde: 's' }, { sec: [['b', 2.0, 'suave']], desde: 'a' }, { sec: [['c', 2.2, 'suave']], desde: 'b' },
                { sec: [['c', 0.5], ['a', 0.9, 'suave'], ['a2', 0.9, 'suave'], ['c2', 1.9, 'suave']], desde: 'c' }]
      };
    })();
    /* la nuca: con los omóplatos abajo y atrás, la barbilla baja despacio hacia el pecho; una mano detrás de la cabeza, que casi no aprieta;
       se mantiene, y se vuelve despacio */
    COREO['estiramiento-nuca'] = (function () {
      var base = { p: { suelo: [10, 0], abre: 6 }, hom: [-2, -2.4] }, lados = { b: aLosLados(8), m: SUELTA };
      var mano = { bd: { a: [-2.5, 42.5, 0.5], en: 'torax', polo: [-1, 0.45, 0.5] }, md: { tipo: 'abierta', palma: [0.2, -0.75, 0.6] }, bi: aLosLados(8), mi: SUELTA };
      return {
        vista: [-56, 34], isometrico: 'c',
        posturas: { a: sobre(base, lados), b: sobre(base, sobre(lados, { cab: [38, 0, 0] })), c: sobre(base, sobre(mano, { cab: [42, 0, 0] })) },
        pasos: [{ sec: [['a', 0.8], ['b', 2.2, 'suave']], desde: 'a' }, { sec: [['c', 1.8, 'suave']], desde: 'b' }, { sec: [['c', 1.4], ['b', 1.0, 'suave'], ['a', 1.8, 'suave']], desde: 'c' }]
      };
    })();
    /* los círculos: solo los hombros, con suavidad; unas vueltas en un sentido y después en el contrario */
    COREO['circulos-hombros'] = (function () {
      var posturas = { a: { b: aLosLados(8), m: SUELTA } }, ida = [], ida2 = [], vuelta = [], i, N = 8, T = 0.34, T2 = 0.27;
      for (i = 0; i < N; i++) {
        var f = i * 2 * Math.PI / N;                      /* arriba, atrás, abajo, adelante */
        posturas['c' + i] = { hom: [4.4 * Math.cos(f) + 1, -3.6 * Math.sin(f)], b: aLosLados(8), m: SUELTA };
      }
      for (i = 1; i <= N; i++) { ida.push(['c' + (i % N), T, 'lineal']); ida2.push(['c' + (i % N), T2, 'lineal']); vuelta.push(['c' + ((N - i) % N), T2, 'lineal']); }
      return {
        vista: [62, 14], rastro: 'hi', posturas: posturas, inicio: 'c0',
        rep: ida,
        pasos: ['a', 'rep', { sec: ida2.concat(vuelta), desde: 'c0' }]
      };
    })();
  })();
