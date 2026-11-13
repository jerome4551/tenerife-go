  /* ───────────────────────── las coreografías: DORSAL (bloque 3) ─────────────────────────
     Las mismas reglas que en 70-coreografias.js: cada una sale de los pasos verificados de su ficha y no añade técnica
     que la ficha no diga. Van por familias: colgado de la barra, el front lever, los jalones, los remos, la polea a una
     mano y los estiramientos. */
  (function () {
    function une(a, b) { var r = {}, k; for (k in a) r[k] = a[k]; for (k in (b || {})) r[k] = b[k]; return r; }

    /* ── colgado de la barra de dominadas (a 225 cm) ── */
    var ALTO = 225, BRAZO = D.brazo + D.antebrazo + D.mano;      /* del hombro al centro del agarre, con el brazo estirado: 59 */
    function barraD(o) { return ['barra_dominadas', une({ alto: ALTO, ancho: 62 }, o)]; }
    /* a qué altura queda la cadera con los brazos estirados: cuanto más abiertas las manos (G, a cada lado), más arriba */
    function yColgado(G, hom) { var dx = G - D.hombroX; return ALTO - Math.sqrt((BRAZO - 0.3) * (BRAZO - 0.3) - dx * dx) - 43.5 - (hom || 0); }
    /* colgado, suelto (los hombros suben hacia las orejas) y con los omóplatos abajo y atrás */
    function cuelga(G, extra) { return sobre(COLGADO, sobre({ pel: [0, yColgado(G, 3.5), -2], hom: [3.5, 0], b: { a: [G, ALTO - 8, 0], polo: [1, -0.2, 0.5] } }, extra || {})); }
    function activo(G, extra) { return sobre(COLGADO, sobre({ pel: [0, yColgado(G, -2), -2], hom: [-2, -1.5], col: [-3, 0, 0], b: { a: [G, ALTO - 8, 0], polo: [1, -0.3, 0.4] } }, extra || {})); }
    /* arriba: la cadera a «y», el tronco un poco hacia atrás y los codos hacia el suelo */
    function arriba(G, y, extra) { return sobre(COLGADO, sobre({ pel: [0, y, -11], giro: [0, -8, 0], hom: [-2, -1.5], col: [-3, 0, 0], cab: [6, 0, 0], b: { a: [G, ALTO - 8, 0], polo: [1, -1, 0.1] } }, extra || {})); }
    function clavosB(G, G2) { return ['mi@0:' + G, 'md@0:' + (-(G2 == null ? G : G2))]; }
    var SUBE_BAJA = [['b', 1.3, 'empuje'], ['b', 0.5], ['a2', 1.9, 'freno'], ['a2', 0.45]];
    /* la mano en la barra (EN_BARRA, en 70-coreografias.js): con la palma hacia delante (el agarre de una dominada) o hacia él
       (supino); y en un agarre que va de delante atrás, con las palmas enfrentadas */
    var DELANTE = EN_BARRA, HACIA_EL = EN_BARRA_SUP, DENTRO = { tipo: 'puno', barra: [0, 0, 1], palma: [-1, 0, 0] };

    /* con las manos claramente más separadas que los hombros */
    COREO['dominadas-agarre-ancho'] = {
      vista: [22, 158], rastro: 'barbilla', esfuerzo: [0], clavos: clavosB(46),
      material: [barraD({ ancho: 70 })],
      posturas: { a: cuelga(46), a2: activo(46), b: arriba(46, 170, { b: { a: [46, ALTO - 8, 0], polo: [1, -1, 0] } }) },
      inicio: 'a2', rep: SUBE_BAJA,
      pasos: ['a', { sec: [['a2', 1.0, 'suave']], desde: 'a' }, 'rep', 'rep']
    };
    /* en los agarres paralelos (salen de la barra hacia delante: la cabeza sube por delante de ella), con las palmas enfrentadas:
       los codos bajan y van hacia atrás, y el pecho se acerca a las manos */
    COREO['dominadas-agarre-neutro'] = (function () {
      var G = 23, zm = 18, m = DENTRO;
      var mano = function (polo) { return { a: [G, ALTO - 8, zm], polo: polo }; };
      return {
        vista: [36, 148], rastro: 'barbilla', esfuerzo: [0], clavos: clavosB(G),
        material: [barraD({ paralelos: G })],
        posturas: {
          a: cuelga(G, { pel: [0, yColgado(G, 3.5), zm - 2], b: mano([0.5, -0.2, 1]), m: m }),
          a2: activo(G, { pel: [0, yColgado(G, -2), zm - 2], b: mano([0.5, -0.3, 1]), m: m }),
          b: arriba(G, 171, { pel: [0, 171, zm + 4], hom: [-2, -2.2], b: mano([0.22, -1, 0.6]), m: m })
        },
        inicio: 'a2',
        rep: [['b', 1.3, 'empuje'], ['b', 0.7], ['a2', 1.9, 'freno'], ['a2', 0.45]],      /* arriba, una pausa breve */
        pasos: ['a', 'rep', 'rep']
      };
    })();
    /* con las manos más juntas que los hombros */
    COREO['dominadas-agarre-estrecho'] = {
      vista: [42, 150], rastro: 'barbilla', esfuerzo: [0], clavos: clavosB(10),
      material: [barraD()],
      posturas: {
        a: cuelga(10, { b: { a: [10, ALTO - 8, 0], polo: [0.8, -0.2, 0.7] } }),
        a2: activo(10, { b: { a: [10, ALTO - 8, 0], polo: [0.8, -0.3, 0.7] } }),
        b: arriba(10, 172, { b: { a: [10, ALTO - 8, 0], polo: [1, -0.9, 0.55] } })
      },
      inicio: 'a2', rep: SUBE_BAJA,
      pasos: ['a', 'rep', 'rep']
    };
    /* solo la bajada: de un cajón, con un saltito, arriba; y de ahí, despacio, hasta colgar con los brazos estirados */
    COREO['dominadas-negativas'] = (function () {
      var H = 60, ZC = -4, G = 28;
      var recogidas = { p: { e: 4, z: 0, c: 96 }, t: { tob: 18 } };       /* las piernas dobladas hacia atrás: no tocan el cajón */
      var enCajon = function (y, extra) { return sobre({ pel: [0, y, ZC + 1], p: { suelo: [10, ZC], alto: H, abre: 6 }, m: DELANTE, hom: [1, 0], b: { a: [G, ALTO - 8, 0], polo: [1, -0.6, 0.5] } }, extra || {}); };
      return {
        vista: [34, 146], rastro: 'barbilla', esfuerzo: [0], clavos: clavosB(G),
        material: [barraD(), ['escalon', { en: [0, ZC], med: [64, H, 42], madera: true }]],
        posturas: {
          e: enCajon(H + D.pelvis),
          e0: enCajon(H + D.pelvis - 11, { giro: [0, 6, 0] }),
          b: sobre(arriba(G, 174), recogidas),
          b2: sobre(arriba(G, 174, { hom: [-3, -2.6] }), recogidas),
          a: sobre(cuelga(G), recogidas)
        },
        inicio: 'b2', encuadra: ['e'],
        rep: [['a', 4.4, 'freno'], ['a', 0.6], ['e', 0.9, 'suave'], ['e0', 0.4, 'suave'], ['b2', 0.6, 'empuje'], ['b2', 0.8]],
        pasos: [{ sec: [['e', 1.5], ['e0', 0.45, 'suave'], ['b', 0.6, 'empuje']], desde: 'e' }, 'b2', 'rep']
      };
    })();
    /* aguantar arriba */
    COREO['dominada-isometrica'] = {
      vista: [26, 154], isometrico: 'b', clavos: clavosB(28),
      material: [barraD()],
      posturas: { a: cuelga(28), b: arriba(28, 175, { hom: [-3, -2] }) },
      inicio: 'a', encuadra: ['b'],
      pasos: [{ sec: [['a', 1.0], ['b', 1.5, 'empuje']], desde: 'a' }, 'b', { sec: [['b', 1.0], ['a', 3.4, 'freno']], desde: 'b' }]
    };
    /* medio recorrido: la mitad baja en la repetición; la mitad alta, en su paso */
    COREO['dominadas-parciales'] = (function () {
      var medio = sobre(COLGADO, { pel: [0, 148, -6], giro: [0, -4, 0], hom: [-2, -1.5], col: [-3, 0, 0], b: { a: [28, ALTO - 8, 0], polo: [1, -0.7, 0.2] } });
      return {
        vista: [26, 154], rastro: 'barbilla', esfuerzo: [0], clavos: clavosB(28),
        material: [barraD()],
        posturas: { a2: activo(28), m: medio, b: arriba(28, 172) },
        inicio: 'a2', encuadra: ['b'],
        rep: [['m', 1.0, 'empuje'], ['m', 0.3], ['a2', 1.4, 'freno'], ['a2', 0.4]],
        pasos: ['a2', 'rep', { sec: [['b', 1.0, 'empuje'], ['b', 0.6], ['m', 1.4, 'freno'], ['m', 0.3], ['b', 1.0, 'empuje'], ['b', 0.5], ['m', 1.4, 'freno'], ['m', 0.3], ['b', 1.0, 'empuje']], desde: 'm' }]
      };
    })();
    /* hacia una mano, con el otro brazo casi estirado; y a la siguiente, hacia la otra */
    COREO['dominadas-arquero'] = (function () {
      var G = 48, lado = function (s) {
        /* s: +1, hacia su mano izquierda */
        var P = sobre(COLGADO, { pel: [s * 23.5, 166.5, -9], giro: [0, -7, 0], hom: [-2, -1.5], col: [-3, 0, 0], cab: [6, s * 10, 0] });
        var cerca = { a: [s * G, ALTO - 8, 0], polo: [s * 0.7, -1, 0.15] }, lejos = { a: [-s * G, ALTO - 8, 0], polo: [-s * 0.2, -1, 0.3] };
        P[s > 0 ? 'bi' : 'bd'] = cerca; P[s > 0 ? 'bd' : 'bi'] = lejos;
        return P;
      };
      return {
        vista: [14, 166], rastro: 'barbilla', esfuerzo: [0, 4], clavos: clavosB(G),
        material: [barraD({ ancho: 72 })],
        posturas: { a: cuelga(G), a2: activo(G), bi: lado(1), bd: lado(-1) },
        inicio: 'a2',
        rep: [['bi', 1.4, 'empuje'], ['bi', 0.5], ['a2', 1.8, 'freno'], ['a2', 0.4], ['bd', 1.4, 'empuje'], ['bd', 0.5], ['a2', 1.8, 'freno'], ['a2', 0.4]],
        pasos: ['a', 'rep', 'rep']
      };
    })();
    /* arriba, de un lado al otro sin bajar */
    COREO['dominadas-maquina-de-escribir'] = (function () {
      var G = 42, Y = 173, lado = function (s) {
        var P = sobre(COLGADO, { pel: [s * 29, Y, -11], giro: [0, -8, 0], hom: [-2, -1.5], col: [-3, 0, 0], cab: [6, 0, 0] });
        var cerca = { a: [s * G, ALTO - 8, 0], polo: [s * 0.8, -1, 0.15] }, lejos = { a: [-s * G, ALTO - 8, 0], polo: [-s * 0.2, -1, 0.4] };
        P[s > 0 ? 'bi' : 'bd'] = cerca; P[s > 0 ? 'bd' : 'bi'] = lejos;
        return P;
      };
      return {
        vista: [14, 166], rastro: 'barbilla', clavos: clavosB(G),
        material: [barraD({ ancho: 70 })],
        posturas: { a: cuelga(G), b: arriba(G, Y, { b: { a: [G, ALTO - 8, 0], polo: [1, -1, 0] } }), bi: lado(1), bd: lado(-1) },
        inicio: 'a', encuadra: ['b', 'bi', 'bd'],
        pasos: [
          { sec: [['a', 1.0], ['b', 1.4, 'empuje']], desde: 'a' },
          { sec: [['b', 0.8], ['bi', 1.5, 'suave']], desde: 'b' },
          { sec: [['bd', 1.7, 'suave'], ['bd', 0.3], ['bi', 1.7, 'suave'], ['bi', 0.3], ['b', 0.9, 'suave'], ['b', 0.3], ['a', 2.4, 'freno']], desde: 'bi' }
        ]
      };
    })();
    /* de lado bajo la barra (mira a lo largo de ella; su izquierda es −Z), una mano delante de la otra, cada una cogiéndola desde su
       lado. Sube sin girar el tronco: la cabeza pasa por un lado de la barra y, a la siguiente, por el otro */
    COREO['dominadas-comando'] = (function () {
      var G = 9, mi = { tipo: 'puno', barra: [1, 0, 0], palma: [0, 0, 1] }, md = { tipo: 'puno', barra: [1, 0, 0], palma: [0, 0, -1] };
      var brazos = function (pi, pd) { return { bi: { a: [G, ALTO - 8, 0], polo: pi }, bd: { a: [-G, ALTO - 8, 0], polo: pd }, mi: mi, md: md }; };
      var cuelgaL = sobre(COLGADO, sobre({ pel: [0, yColgado(D.hombroX + Math.sqrt(G * G + D.hombroX * D.hombroX), 3.5), 0], giro: [90, 0, 0], hom: [3.5, 0] }, brazos([0.3, -1, -0.3], [-0.3, -1, 0.3])));
      /* s: +1, la cabeza pasa por su izquierda */
      var lado = function (s) { return sobre(COLGADO, sobre({ pel: [-10, 170, -s * 8], giro: [90, -9, s * 7], hom: [-2, -1.5], cab: [4, 0, 0] }, brazos([0.5, -1, -0.5], [0.5, -1, 0.5]))); };
      return {
        vista: [62, 12], rastro: 'cab', esfuerzo: [0, 4], clavos: clavosB(G),
        material: [barraD({ ancho: 78 })],
        posturas: { a: cuelgaL, bi: lado(1), bd: lado(-1) },
        rep: [['bi', 1.4, 'empuje'], ['bi', 0.45], ['a', 1.8, 'freno'], ['a', 0.4], ['bd', 1.4, 'empuje'], ['bd', 0.45], ['a', 1.8, 'freno'], ['a', 0.4]],
        pasos: ['a', 'rep', 'rep']
      };
    })();

    /* ── el front lever: colgado, el cuerpo horizontal, boca arriba, con los brazos estirados ──
       La barra queda sobre el centro del cuerpo, así que los brazos van inclinados: «ang» grados desde la vertical. La cadera se
       calcula para que el hombro quede a un brazo de la barra, sea cual sea la inclinación del tronco. */
    var GL = 24, TORRE = barraD({ voladizo: 104 }), V_FL = [84, [50, 20]];      /* en una torre: de lado, ningún poste se cruza por delante */
    function palanca(cabeceo, ang, extra) {
      var c = cabeceo * RAD, a = ang * RAD, r = BRAZO - 0.6;
      var hom = [ALTO - r * Math.cos(a), -r * Math.sin(a)];                      /* el hombro: [y, z] */
      /* del hombro a la cadera: 43,5 − 2 (los hombros, bajos) a lo largo del tronco, que apunta a (cos, −sin) */
      var l = 43.5 - 2;
      return sobre({ pel: [0, hom[0] - l * Math.cos(c), hom[1] + l * Math.sin(c)], giro: [0, -cabeceo, 0], hom: [-2, 0], cab: [8, 0, 0],
        p: { e: 0, z: 0, c: 0 }, t: { tob: 30 }, m: DELANTE, b: { a: [GL, ALTO - 8, 0], polo: [1, -0.4, -0.6] } }, extra || {});
    }
    var RECOGIDAS = { p: { e: 126, z: 0, c: 148 }, t: { tob: 20 } };
    var cuelgaFL = cuelga(GL, { p: { e: 3, z: 0, c: 4 }, t: { tob: 30 } });
    /* la subida y la bajada pasan por una postura intermedia (los brazos siguen estirados) sin pararse en ella */
    function sube(de, m, f, t) { return { sec: [[de, t == null ? 0.8 : t], [m, 1.3, 'entra'], [f, 1.3, 'sale']], desde: de }; }
    function aguantaYBaja(f, m, a) { return { sec: [[f, 2.2], [m, 1.5, 'entra'], [a, 1.5, 'sale']], desde: f }; }
    COREO['front-lever'] = {
      vista: V_FL, isometrico: 'f', clavos: clavosB(GL),
      material: [TORRE],
      posturas: { a: cuelgaFL, m: palanca(45, 18.5), f: palanca(90, 37) },
      inicio: 'a', encuadra: ['f'],
      pasos: ['a', sube('a', 'm', 'f', 0.01), aguantaYBaja('f', 'm', 'a')]
    };
    /* agrupado: con las rodillas recogidas hacia el pecho */
    COREO['front-lever-agrupado'] = {
      vista: V_FL, isometrico: 'f', clavos: clavosB(GL),
      material: [TORRE],
      posturas: {
        a: cuelgaFL,
        t: cuelga(GL, sobre(RECOGIDAS, { giro: [0, -6, 0], col: [12, 0, 0], p: { e: 108, z: 0, c: 124 } })),
        m: palanca(45, 15, RECOGIDAS),
        f: palanca(90, 30, RECOGIDAS)
      },
      inicio: 'a', encuadra: ['f', 't'],
      pasos: [{ sec: [['a', 0.9], ['t', 1.1, 'suave']], desde: 'a' }, sube('t', 'm', 'f', 0.01), aguantaYBaja('f', 'm', 't')]
    };
    /* la dominada en front lever: sin perder la horizontal, el pecho sube hacia la barra */
    COREO['dominada-front-lever'] = (function () {
      var f = palanca(90, 37);
      return {
        vista: V_FL, rastro: 'pecho', esfuerzo: [0], clavos: clavosB(GL),
        material: [TORRE],
        posturas: { a: cuelgaFL, m: palanca(45, 18.5), f: f, fb: sobre(f, { pel: [0, 205, f.pel[2] + 9], hom: [-2, -1.5], b: { a: [GL, ALTO - 8, 0], polo: [1, -1, -0.2] } }) },
        inicio: 'f', encuadra: ['a'],
        rep: [['fb', 1.2, 'empuje'], ['fb', 0.4], ['f', 1.7, 'freno'], ['f', 0.5]],
        pasos: [sube('a', 'm', 'f'), 'rep', 'rep']
      };
    })();
    /* de la posición alta de la dominada al front lever, y vuelta */
    COREO['ice-cream-maker'] = {
      vista: V_FL, rastro: 'pel', esfuerzo: [0, 2], clavos: clavosB(GL),
      material: [TORRE],
      posturas: { a: cuelga(GL), b: arriba(GL, 173, { hom: [-2, -2] }), f: palanca(90, 37) },
      inicio: 'b', encuadra: ['a'],
      rep: [['f', 1.5, 'suave'], ['f', 0.5], ['b', 1.4, 'suave'], ['b', 0.5]],
      pasos: [{ sec: [['a', 0.8], ['b', 1.4, 'empuje']], desde: 'a' }, 'rep', 'rep']
    };

    /* ── dos ayudas para colocar las manos ──
       conAgarre: la postura P con el centro del puño izquierdo en g (el derecho, en su reflejo) y el codo hacia «polo»: la muñeca
       queda a una mano de g, en la línea del antebrazo. k: 'b' (los dos brazos), 'bi' o 'bd' (uno solo; g es entonces el de ese lado) */
    function conAgarre(P, g, polo, k) {
      k = k || 'b';
      var w = [g[0], g[1] - D.mano, g[2]], i, E, c = {};
      for (i = 0; i < 5; i++) {
        c[k] = { a: w, polo: polo };
        E = resolver(sobre(P, c));
        w = menos(g, por(unidad(menos(g, E[k === 'bd' ? 'd' : 'i'].cod)), D.mano));
      }
      c[k] = { a: w, polo: polo };
      return sobre(P, c);
    }
    /* estirado: el brazo, estirado desde el hombro de la postura P hacia el punto q (a «flojo» cm de estirarse del todo); el puño
       queda en esa línea. k, como arriba; si es 'b', q es el de la mano izquierda */
    function estirado(P, q, k, flojo, polo) {
      k = k || 'b';
      var E = resolver(P), h = E[k === 'bd' ? 'd' : 'i'].hom, u = unidad(menos(q, h)), c = {};
      c[k] = { a: mas(h, por(u, BRAZO - D.mano - (flojo == null ? 0.25 : flojo))), polo: polo || [k === 'bd' ? -1 : 1, -0.3, -0.3] };
      return sobre(P, c);
    }
    /* dónde queda el puño de una postura */
    function agarreDe(P, k) { return resolver(P)[k || 'i'].agarre; }

    /* ── los jalones: sentado en la máquina, de cara a la columna, con los muslos bajo el rodillo ──
       La barra cuelga de la polea, que queda por delante de la cara: baja por delante de ella hasta la parte alta del pecho. */
    var YS = 56, ZP = 22;                     /* la cadera, sentado; y a cuánto por delante queda la polea */
    function maquina(o) { return ['polea', une({ en: [0, 86], alto: 206, brazo: 86 - ZP, torre: 224, asiento: [86, YS - 11], rodillo: [58, 62], sobra: 22 }, o)]; }
    /* sentado, con el tronco «atras» grados hacia atrás */
    function sentado(atras, extra) { return sobre({ pel: [0, YS, 0], giro: [0, -atras, 0], cab: [atras * 0.6, 0, 0], p: { suelo: [11, 37], abre: 5 } }, extra || {}); }
    /* los brazos arriba, estirados hacia la barra, que cuelga bajo la polea: las manos, a G de cada lado */
    function arribaJ(P, G) {
      var h = resolver(P).i.hom, r = BRAZO - 0.7, dx = G - h[0], dz = ZP - h[2];
      return estirado(P, [G, h[1] + Math.sqrt(r * r - dx * dx - dz * dz), ZP], 'b', 0.25, [1, -0.2, 0.3]);
    }
    /* abajo: la barra, ante la parte alta del pecho */
    function abajoJ(P, G, codo, mas_z) {
      var E = resolver(P), alt = mas(E.tor, aplicar(E.Bt, [0, 16.5, 11]));
      return conAgarre(P, [G, alt[1], alt[2] + (mas_z == null ? 6 : mas_z)], codo);
    }
    function jalon(G, m, o) {
      o = o || {};
      var atras = o.atras == null ? 9 : o.atras, atras0 = o.atras0 == null ? 3 : o.atras0;
      var a = arribaJ(sentado(0, { hom: [3, 0], m: m }), G);
      return {
        vista: o.vista || [38, 148], rastro: 'manos', esfuerzo: [0], clavos: ['ti', 'td'],
        material: [maquina(une({ agarre: o.agarre || 'barra' }, o.maquina))],
        posturas: {
          a: a,
          a2: arribaJ(sentado(atras0, { hom: [-1.5, -2], col: [-4, 0, 0], m: m }), G),
          b: abajoJ(sentado(atras, { hom: [-1.5, o.hombros == null ? -2.4 : o.hombros], col: [-4, 0, 0], m: m }), G, o.codo || [0.7, -1, -0.6])
        },
        inicio: 'a2',
        rep: [['b', 1.2, 'empuje'], ['b', o.pausa || 0.4], ['a2', 1.9, 'freno'], ['a2', 0.45]],
        pasos: o.pasos || ['a', 'rep', 'rep']
      };
    }
    /* al pecho: las manos algo más abiertas que los hombros; primero junta los omóplatos, y la barra baja a la parte alta del pecho */
    COREO['jalon-al-pecho'] = jalon(30, DELANTE, { pasos: ['a', { sec: [['a2', 1.0, 'suave']], desde: 'a' }, 'rep', 'rep'] });
    /* con las manos más juntas que los hombros: un poco hacia atrás, y los codos pegados a los costados */
    COREO['jalon-agarre-estrecho'] = jalon(10, DELANTE, { atras: 14, atras0: 11, codo: [0.25, -1, -0.5], hombros: -3, maquina: { sobra: 30 } });
    /* con las palmas hacia él, a la anchura de los hombros: erguido, y los codos cerca del cuerpo */
    COREO['jalon-supino'] = jalon(19, HACIA_EL, { atras: 4, atras0: 0, codo: [0.2, -1, -0.5], maquina: { sobra: 26 } });
    /* con el agarre en V (el triángulo): primero se sienta; luego lo coge, con las palmas enfrentadas, y tira hasta la parte alta del pecho */
    COREO['jalon-agarre-neutro'] = (function () {
      var G = 5.5, base = sentado(2, { m: DENTRO });
      var a = arribaJ(sobre(base, { hom: [3, 0] }), G), b = abajoJ(sobre(base, { hom: [-1.5, -2.2], col: [-3, 0, 0] }), G, [0.5, -1, -0.3], 3.5);
      var s0 = sobre(base, { b: { a: [15, 64, 20], polo: [1, -0.2, -0.6] }, m: { tipo: 'abierta', prono: 90 } });        /* las manos, en los muslos */
      return {
        vista: [38, 148], rastro: 'manos', esfuerzo: [0], clavos: ['ti', 'td'],
        material: [maquina({ agarre: 'v', reposo: mezcla(agarreDe(a, 'i'), agarreDe(a, 'd'), 0.5) })],
        posturas: { s: s0, a: a, b: b },
        inicio: 'a', reposo: ['s'], encuadra: ['s'],
        rep: [['b', 1.2, 'empuje'], ['b', 0.6], ['a', 1.9, 'freno'], ['a', 0.45]],
        pasos: ['s', { sec: [['a', 1.0, 'suave'], ['a', 0.35], ['b', 1.2, 'empuje']], desde: 's' }, { rep: 1.2 }]
      };
    })();
    /* a una mano, cruzado: sentado en diagonal (girado hacia su izquierda y algo atrás en el asiento), con solo la pierna derecha
       bajo el rodillo; tira el brazo izquierdo, el contrario. La polea le queda delante y a su derecha: el brazo sube por delante de
       la cara, y el cable cruza por delante del cuerpo */
    COREO['jalon-unilateral-cruzado'] = (function () {
      var R = 35, B = giroY(R), enCuerpo = function (v) { return aplicar(B, v); };
      var base = { pel: [-6, YS, -10], giro: [R, 0, 0],
        pd: { suelo: [-4, 40], abre: 0, rumbo: 8, polo: [0.1, 0.3, 1] },                     /* bajo el rodillo */
        pi: { suelo: [27, 20], abre: 0, rumbo: 44, polo: enCuerpo([0.2, 0.3, 1]) },          /* por fuera */
        bd: { a: [-11, 63.5, 16], polo: enCuerpo([-1, -0.2, -0.5]) }, md: { tipo: 'abierta', prono: 90 },
        mi: { tipo: 'puno', palma: enCuerpo([-0.5, -0.5, 0.7]) } };
      var arr = sobre(base, { hom: { i: [3.5, 1.5], d: [0, 0] }, col: [0, -3, 0], cab: [-8, -10, 0] });
      var h = resolver(arr).i.hom, r = BRAZO - 0.4, dx = -h[0], dz = ZP - h[2];
      var a = estirado(arr, [0, h[1] + Math.sqrt(r * r - dx * dx - dz * dz), ZP], 'bi', 0.3, enCuerpo([1, -0.3, 0.2]));
      var Pb = sobre(base, { hom: { i: [-2, -2.2], d: [0, 0] }, col: [0, 3, 0] }), Eb = resolver(Pb);
      var b = conAgarre(Pb, mas(Eb.i.hom, aplicar(Eb.Bt, [4, -6, 19])), enCuerpo([0.5, -1, -0.5]), 'bi');
      var s0 = sobre(base, { bi: { a: [14, 62.5, 2], polo: enCuerpo([1, -0.2, -0.5]) }, mi: { tipo: 'abierta', prono: 90 } });
      return {
        vista: [-38, 150], rastro: 'mi', esfuerzo: [0], clavos: ['ti', 'td'],
        material: [maquina({ a: 'i', agarre: 'asa', reposo: agarreDe(a, 'i') })],
        posturas: { s: s0, a: a, b: b },
        inicio: 'a', reposo: ['s'], encuadra: ['s'],
        rep: [['b', 1.3, 'empuje'], ['b', 0.5], ['a', 2.0, 'freno'], ['a', 0.5]],
        pasos: ['s', { sec: [['a', 1.0, 'suave'], ['a', 0.35], ['b', 1.3, 'empuje']], desde: 's' }, { rep: 1.3 }]
      };
    })();
    /* a una mano, con una rodilla en el suelo, frente a la polea alta: el codo baja hacia el costado */
    COREO['jalon-unilateral-rodilla'] = (function () {
      var POLEA = [0, 204, 91];
      var base = { pel: [0, 45.5, 0], giro: [0, 5, 0], cab: [-6, 0, 0],
        pi: { a: [10, 7, -37.5], polo: [0, -1, 0.6] }, ti: { punta: [0, -0.3, -1], arriba: [0, -1, 0.3] },      /* la rodilla izquierda, en el suelo */
        pd: { suelo: [-12, 39], abre: 4 },
        bd: { a: [-13, 55.5, 29], polo: [-1, -0.2, -0.6] }, md: { tipo: 'abierta', prono: 90 },
        mi: { tipo: 'puno', barra: [1, 0, 0], palma: [0, -0.7, 0.7] } };
      var a = estirado(sobre(base, { hom: { i: [3.5, 2], d: [0, 0] } }), POLEA, 'bi', 0.3, [1, -0.4, -0.2]);
      var Pb = sobre(base, { hom: { i: [-2, -2.2], d: [0, 0] } }), Eb = resolver(Pb);
      var b = conAgarre(Pb, mas(Eb.i.hom, aplicar(Eb.Bt, [4, -6, 19])), [0.45, -1, -0.55], 'bi');
      return {
        vista: [-40, 124], rastro: 'mi', esfuerzo: [0], clavos: ['ti', 'td'],      /* desde su derecha: el brazo que sube no le tapa la cara */
        material: [['polea', { en: [0, 100], alto: 204, a: 'i', agarre: 'asa' }]],
        posturas: { a: a, b: b },
        rep: [['b', 1.3, 'empuje'], ['b', 0.4], ['a', 1.9, 'freno'], ['a', 0.5]],
        pasos: ['a', 'rep', 'rep']
      };
    })();
    /* con los brazos rectos y una barra: de pie ante la polea alta; un paso atrás, el tronco algo inclinado, y la barra baja en arco a los muslos */
    COREO['jalon-brazos-rectos'] = (function () {
      var ZC = 112, POLEA = [0, 204, ZC - 9], Z0 = 56, Z1 = 30;
      var m = { tipo: 'puno', barra: [1, 0, 0], palma: [0, -0.9, -0.45] };          /* las palmas, hacia abajo (y, con la barra en los muslos, hacia ellos) */
      var haciaPolea = function (P) { return estirado(P, [D.hombroX, POLEA[1], POLEA[2]], 'b', 0.3, [1, -0.3, -0.2]); };
      var cerca = { pel: [0, PIE, Z0], p: { suelo: [10, Z0], abre: 6 }, m: m };
      var h0 = resolver(cerca).i.hom, r = BRAZO - 0.4, dz = POLEA[2] - h0[2];
      var inc = { pel: [0, 83.5, Z1 - 6], giro: [0, 20, 0], cab: [-14, 0, 0], p: { suelo: [10, Z1], abre: 6 }, m: m };
      var hi = resolver(inc).i.hom;
      return {
        vista: [72, 122], rastro: 'manos', esfuerzo: [0], clavos: ['ti', 'td'],
        material: [['polea', { en: [0, ZC], alto: 204, agarre: 'barra', sobra: 12 }]],
        posturas: {
          a0: estirado(cerca, [D.hombroX, h0[1] + Math.sqrt(r * r - dz * dz), POLEA[2]], 'b', 0.3, [1, -0.3, -0.2]),
          p1: haciaPolea({ pel: [0, 85, (Z0 + Z1) / 2 - 3], giro: [0, 10, 0], cab: [-7, 0, 0], pi: { suelo: [10, Z0], abre: 6 }, pd: { suelo: [-10, Z1], abre: 6 }, m: m }),
          a: haciaPolea(inc),
          b: estirado(inc, [D.hombroX, hi[1] - 58, hi[2] + 3.8], 'b', 0.3, [1, -0.3, -0.2])       /* la barra, delante de los muslos */
        },
        inicio: 'a', encuadra: ['a0'],
        rep: [['b', 1.3, 'empuje'], ['b', 0.35], ['a', 1.9, 'freno'], ['a', 0.45]],
        pasos: ['a0', { sec: [['p1', 0.6, 'suave', ['ti']], ['a', 0.7, 'suave', ['td']]], desde: 'a0' }, 'rep']
      };
    })();
    /* con los brazos rectos y la cuerda: un extremo en cada mano, los brazos estirados al frente; sin doblar los codos, a las caderas */
    COREO['jalon-brazos-rectos-cuerda'] = (function () {
      var POLEA = [0, 204, 112];
      var base = { pel: [0, PIE, 0], p: { suelo: [10, 0], abre: 6 }, m: { tipo: 'puno', palma: [-1, 0, 0] } };
      var h = resolver(base).i.hom;
      return {
        vista: [70, 128], rastro: 'manos', esfuerzo: [0], clavos: ['ti', 'td'],
        material: [['polea', { en: [0, POLEA[2] + 9], alto: POLEA[1], agarre: 'cuerda' }]],
        posturas: {
          a: estirado(base, [D.hombroX * 0.42, POLEA[1], POLEA[2]], 'b', 0.3, [1, -0.3, -0.2]),
          b: estirado(sobre(base, { hom: [-1.5, -1.5] }), [h[0] + 6, h[1] - 57, h[2] + 8], 'b', 0.3, [1, -0.3, -0.2])       /* a los lados de las caderas */
        },
        rep: [['b', 1.3, 'empuje'], ['b', 0.35], ['a', 1.9, 'freno'], ['a', 0.45]],
        pasos: ['a', 'rep', 'rep']
      };
    })();

    /* ── los remos inclinados: de pie, el tronco inclinado desde la cadera ──
       inclinado(ang): el tronco a «ang» grados de la vertical (90, paralelo al suelo), la cadera hacia atrás y las rodillas algo
       flexionadas; los pies no se mueven */
    function inclinado(ang, extra) {
      var k = Math.sin(ang * RAD);
      return sobre({ pel: [0, PIE - 2 - 5.5 * k, -27.5 * k], giro: [0, ang, 0], cab: [-ang * 0.3, 0, 0], p: { suelo: [11, 0], abre: 7 } }, extra || {});
    }
    var DE_PIE = { p: { suelo: [11, 0], abre: 7 } };
    /* el punto del cuerpo ante el que acaba la barra o la mancuerna: a «arriba» cm de la cadera a lo largo del tronco y a «fuera» de su
       eje hacia delante (hacia el suelo, si está inclinado) */
    function anteTronco(P, arriba_, fuera, x) { var E = resolver(P); return mas(E.pel, mas(aplicar(E.Bp, [0, arriba_, 0]), mas(aplicar(E.Bl, [0, 0, fuera]), [x || 0, 0, 0]))); }
    /* colgando: el puño, en la vertical del hombro (más «dz» hacia delante), con el brazo estirado */
    function colgando(P, G, dz) { var h = resolver(P).i.hom; return estirado(P, [G, h[1] - BRAZO, h[2] + (dz || 0)], 'b', 0.3, [1, 0.2, -0.6]); }

    /* con mancuernas: el pecho, paralelo al suelo; las mancuernas, por debajo de las rodillas; y suben hacia las caderas, con los codos cerca */
    COREO['remo-inclinado-mancuernas'] = (function () {
      var m = { tipo: 'puno', barra: [0, 0, 1], palma: [-1, 0, 0] };                 /* las palmas, enfrentadas */
      var inc = inclinado(86, { m: m }), a = colgando(inc, 21);
      var arriba_ = sobre(inc, { hom: [-1.5, -2.6] }), g = anteTronco(arriba_, 6, 2, 22.5);
      return {
        vista: [-70, -128], rastro: 'manos', esfuerzo: [0], clavos: ['ti', 'td'],
        material: [['mancuernas']],
        posturas: { de: sobre(DE_PIE, { b: { cuelga: [2, 2], largo: 50 }, m: m }), a: a, b: conAgarre(arriba_, g, [0.25, 1, -0.5]) },
        inicio: 'a', encuadra: ['de'],
        rep: [['b', 1.1, 'empuje'], ['b', 0.6], ['a', 1.7, 'freno'], ['a', 0.4]],
        pasos: [{ sec: [['de', 0.9], ['a', 1.7, 'suave']], desde: 'de' }, 'rep', 'rep']
      };
    })();
    /* con barra: de pie con ella delante; se inclina con la espalda plana y la barra colgando; y tira hacia el ombligo */
    function remoBarra(m, G, o) {
      o = o || {};
      var ang = o.ang || 58, inc = inclinado(ang, { m: m }), arriba_ = sobre(inc, { hom: [-1.5, -2.4], col: [o.pecho || 0, 0, 0] });
      var g = anteTronco(arriba_, 11, 16.5, G);                 /* ante el ombligo */
      return {
        vista: o.vista || [-66, -126], rastro: 'manos', esfuerzo: [0], clavos: ['ti', 'td'],
        material: [['barra', { discos: 17 }]],
        posturas: {
          de: colgando(sobre(DE_PIE, { m: m }), G, 9),
          a: colgando(sobre(inc, { col: [o.pecho || 0, 0, 0] }), G, 2),
          b: conAgarre(arriba_, g, o.codo || [0.6, 1, -0.4])
        },
        inicio: 'a', encuadra: ['de'],
        rep: [['b', 1.1, 'empuje'], ['b', o.pausa || 0.35], ['a', 1.8, 'freno'], ['a', 0.45]],
        pasos: ['de', { sec: [['a', 1.6, 'suave']], desde: 'de' }, 'rep', 'rep']
      };
    }
    /* las palmas, hacia abajo (hacia atrás, con la barra colgando): el agarre prono */
    COREO['remo-inclinado-barra'] = remoBarra({ tipo: 'puno', barra: [1, 0, 0], palma: [0, -0.5, -0.87] }, 26);
    /* las palmas, hacia delante: el agarre supino; el pecho fuera, los codos cerca de los costados y una pausa arriba */
    COREO['remo-inclinado-barra-supino'] = remoBarra({ tipo: 'puno', barra: [1, 0, 0], palma: [0, 0.5, 0.87] }, 24, { codo: [0.25, 1, -0.5], pausa: 0.7, pecho: -5 });
    /* Pendlay: la barra, en el suelo; la espalda, paralela al suelo; se agarra, sube al pecho moviendo solo los brazos y vuelve al suelo cada vez */
    COREO['remo-pendlay'] = (function () {
      var m = { tipo: 'puno', barra: [1, 0, 0], palma: [0, -0.2, -1] }, G = 19, ZB = 9, R = 21;
      var inc = { pel: [0, 76.5, ZB - 44.6], giro: [0, 85, 0], cab: [-26, 0, 0], p: { suelo: [11, -2], abre: 7 } };
      var g0 = [G, R, ZB], arriba_ = sobre(inc, { hom: [-1.5, -2.4], m: m });
      return {
        vista: [-66, -126], zoom: 0.88, rastro: 'manos', esfuerzo: [0], clavos: ['ti', 'td'], reposo: ['i'],
        material: [['barra', { discos: R, reposo: [0, R, ZB] }]],
        posturas: {
          i: sobre(inc, { b: { a: [15, 46, -2], polo: [1, 0.2, -0.6] }, m: { tipo: 'abierta', prono: 90 } }),       /* inclinado, con las manos en las rodillas */
          a: conAgarre(sobre(inc, { hom: [1.5, 0], m: m }), g0, [1, 0.2, -0.5]),
          b: conAgarre(arriba_, anteTronco(arriba_, 37, 16, G), [0.7, 1, -0.3])                                      /* ante el pecho */
        },
        inicio: 'a',
        rep: [['b', 1.0, 'empuje'], ['b', 0.3], ['a', 1.5, 'freno'], ['a', 0.7]],
        pasos: ['i', { sec: [['a', 1.3, 'suave']], desde: 'i' }, 'rep', 'rep']
      };
    })();
    /* la barra T: un extremo, anclado al suelo detrás de él; el otro, con los discos, sube y baja entre las piernas. La mano va
       siempre a la misma distancia del anclaje: el agarre se mueve en un arco */
    function enArco(piv, desde, y) { var r = largo(menos(desde, piv)), dy = y - piv[1]; return [desde[0], y, piv[2] + Math.sqrt(r * r - dy * dy - (desde[0] - piv[0]) * (desde[0] - piv[0]))]; }
    /* hasta dónde sube el agarre (desde «ga», en su arco) antes de que los discos, que van «zd» cm más allá, toquen el pecho */
    function hastaElPecho(P, piv, ga, R, zd, tope) {
      var E = resolver(P), y, H, d, n, alto, rel;
      for (y = ga[1]; y < tope; y += 0.5) {
        H = enArco(piv, ga, y + 0.5); d = unidad(menos(H, piv)); n = unidad(menos([0, 1, 0], por(d, d[1])));
        alto = mas(mas(H, por(d, zd)), por(n, R));                    /* lo más alto del disco */
        rel = aLocal(E.Bt, menos(alto, E.tor));
        if (rel[2] < 13 && rel[1] > -24 && rel[1] < 30) break;        /* a menos de un dedo del pecho */
      }
      return enArco(piv, ga, y);
    }
    var PIV_T = [0, 5, -92], PIES_T = { suelo: [17, 0], abre: 12 };
    /* con el agarre estrecho (las asas, bajo la barra, por detrás de los discos): primero, a un lado y otro de la barra; luego la
       coge, se inclina hasta dejar el pecho paralelo al suelo, y tira hasta donde los discos tocan el pecho */
    COREO['remo-barra-t'] = (function () {
      var R = 12, SOBRA = 20, ZD = SOBRA - 9 + 5.4, m = { tipo: 'puno', barra: [0, 0, 1], palma: [-1, 0, 0] };            /* las palmas, enfrentadas */
      var inc = inclinado(86, { p: PIES_T, m: m }), a = colgando(inc, 7), ga = [0, agarreDe(a)[1], agarreDe(a)[2]];
      var arriba_ = sobre(inc, { hom: [-1.5, -2.6] }), gb = hastaElPecho(arriba_, PIV_T, ga, R, ZD, anteTronco(arriba_, 30, 16.5)[1]);
      var s0 = { p: PIES_T, pel: [0, PIE - 3, -2], b: aLosLados(8), m: SUELTA };
      /* en el suelo, la barra descansa sobre sus discos: para cogerla, baja la cadera */
      var g0 = enArco(PIV_T, ga, R - 1.2), coge = { pel: [0, 62, -31], giro: [0, 80, 0], cab: [-26, 0, 0], p: PIES_T, m: m };
      return {
        vista: [-70, -128], rastro: 'manos', esfuerzo: [0], clavos: ['ti', 'td'], reposo: ['s'],
        material: [['landmine', { pivote: [PIV_T[0], PIV_T[2]], asas: 'v', sobra: SOBRA, discos: R, reposo: g0 }]],
        posturas: { s: s0, g: conAgarre(coge, [7, g0[1], g0[2]], [1, 0.2, -0.5]), a: a, b: conAgarre(arriba_, [7, gb[1], gb[2]], [0.55, 1, -0.4]) },
        inicio: 'a', encuadra: ['s'],
        rep: [['b', 1.1, 'empuje'], ['b', 0.6], ['a', 1.7, 'freno'], ['a', 0.4]],
        pasos: ['s', { sec: [['g', 1.3, 'suave'], ['g', 0.3], ['a', 1.2, 'suave']], desde: 's' }, 'rep']
      };
    })();
    /* con el agarre ancho (el travesaño va en la punta de la barra, por fuera de los discos): el tronco, inclinado sin llegar a
       paralelo; el pecho fuera; y la barra, hacia el ombligo, no más arriba */
    COREO['remo-barra-t-agarre-ancho'] = (function () {
      var G = 26, m = { tipo: 'puno', barra: [1, 0, 0], palma: [0, -0.5, -0.87] };
      var inc = inclinado(58, { p: PIES_T, m: m }), a = colgando(inc, G, 2);
      var fuera = sobre(inc, { col: [-7, 0, 0], hom: [-1, -2.2], cab: [-10, 0, 0] }), a2 = colgando(fuera, G, 2);
      var gb = enArco(PIV_T, [0, agarreDe(a2)[1], agarreDe(a2)[2]], anteTronco(fuera, 11, 16.5)[1]);
      return {
        vista: [-68, -126], zoom: 0.88, rastro: 'manos', esfuerzo: [0], clavos: ['ti', 'td'],
        material: [['landmine', { pivote: [PIV_T[0], PIV_T[2]], asas: 'ancha', sobra: 5, dentro: 13, discos: 12 }]],
        posturas: { a: a, a2: a2, b: conAgarre(fuera, [G, gb[1], gb[2]], [0.6, 1, -0.4]) },
        inicio: 'a2',
        rep: [['b', 1.1, 'empuje'], ['b', 0.35], ['a2', 1.9, 'freno'], ['a2', 0.45]],
        pasos: ['a', { sec: [['a2', 1.1, 'suave']], desde: 'a' }, 'rep']
      };
    })();
    /* Helms: de pie, el pecho apoyado en el extremo alto de un banco inclinado (con algo blando debajo); los codos van hacia atrás */
    COREO['remo-helms'] = (function () {
      var m = { tipo: 'puno', barra: [0, 0, 1], palma: [-1, 0, 0] }, ANG = 80, G = 23.5;
      var base = { pel: [0, 84, -14], giro: [0, ANG, 0], cab: [-22, 0, 0], p: { suelo: [11, 0], abre: 7 }, m: m };
      var E = resolver(base), apoyo = mas(E.tor, aplicar(E.Bt, [0, 8, 11.5]));          /* el pecho, a la altura de los pezones */
      var a = colgando(base, G), arriba_ = sobre(base, { hom: [-1.5, -2.8] });
      var RESP = 22, alto = apoyo[1] - 3, zc = apoyo[2] - 4 - 24 + 86 * Math.cos(RESP * RAD);    /* el extremo alto del respaldo, bajo el pecho */
      return {
        vista: [68, 128], zoom: 0.92, rastro: 'manos', esfuerzo: [0], clavos: ['ti', 'td'],      /* la cadera, atrás del todo: que no toque el borde */
        material: [['banco', { en: [0, zc], rumbo: 180, largo: 124, respaldo: RESP, alto: alto - 86 * Math.sin(RESP * RAD) }],
                   ['toalla', { en: [0, alto + 1.2 - 3 * Math.sin(RESP * RAD), apoyo[2] + 3.5], cabeceo: RESP, med: [26, 3, 15] }], ['mancuernas']],
        posturas: { a: a, b: conAgarre(arriba_, anteTronco(arriba_, 16, 13, G), [0.3, 1, -0.5]) },
        rep: [['b', 1.1, 'empuje'], ['b', 0.5], ['a', 1.8, 'freno'], ['a', 0.45]],
        pasos: ['a', 'rep', 'rep']
      };
    })();
    /* renegado: en posición de flexión sobre dos mancuernas; una flexión, y arriba rema un brazo; otra flexión, y el otro */
    COREO['remo-renegado'] = (function () {
      var m = { tipo: 'puno', barra: [0, 0, 1], palma: [-1, 0, 0] }, RM = 6.6, G = 21;
      var ARR = 25.1, ABA = 9;
      var sh = function (ang) { return [14 + 121.5 * Math.sin(ang * RAD), -100 + 121.5 * Math.cos(ang * RAD)]; };      /* el hombro: [y, z] */
      var zm = sh(ARR)[1], g = [G, RM, zm];
      var en = function (ang, extra) { return conAgarre(tabla(ang, sobre({ m: m }, extra || {})), g, [0.75, 0.3, -1]); };
      var a = en(ARR), b = en(ABA, { cab: [-22, 0, 0] });
      /* rema un brazo: el codo, atrás y arriba; la mancuerna, junto al costado (la otra mano y los pies no se mueven) */
      var rema = function (k) {
        var s = k === 'bi' ? 1 : -1, E = resolver(a), q = mas(E.tor, aplicar(E.Bt, [s * 23, 2, 9])), hom = {};
        hom[s > 0 ? 'i' : 'd'] = [-1.5, -2.6]; hom[s > 0 ? 'd' : 'i'] = [0, 0];
        return conAgarre(sobre(a, { hom: hom, cab: [-16, s * 10, 0] }), q, [s * 0.4, 1, -0.5], k);
      };
      var T4 = ['mi', 'md', 'ti', 'td'], SIN_I = ['md', 'ti', 'td'], SIN_D = ['mi', 'ti', 'td'];
      return {
        vista: [62, [124, 22]], picado: 14, rastro: 'pecho', esfuerzo: [2, 4, 10, 12], clavos: T4,
        material: [['mancuernas']],
        posturas: { a: a, b: b, ri: rema('bi'), rd: rema('bd') },
        rep: [['b', 1.1, 'freno'], ['b', 0.15], ['a', 0.9, 'empuje'], ['a', 0.25], ['ri', 0.8, 'empuje', SIN_I], ['ri', 0.4, null, SIN_I], ['a', 0.9, 'freno', SIN_I], ['a', 0.25],
              ['b', 1.1, 'freno'], ['b', 0.15], ['a', 0.9, 'empuje'], ['a', 0.25], ['rd', 0.8, 'empuje', SIN_D], ['rd', 0.4, null, SIN_D], ['a', 0.9, 'freno', SIN_D], ['a', 0.25]],
        pasos: ['a', { sec: [['b', 1.1, 'freno'], ['b', 0.15], ['a', 0.9, 'empuje'], ['a', 0.25], ['ri', 0.8, 'empuje', SIN_I]], desde: 'a' }, { rep: 3.6 }]
      };
    })();
    /* Meadows: junto al extremo de una barra anclada (el anclaje, a su derecha y algo atrás), con el pie izquierdo adelantado; el
       antebrazo izquierdo, en la pierna de delante; la mano derecha coge la punta de la barra, con la palma hacia abajo, y tira
       hacia la cadera de atrás hasta que el codo llega a la altura del tronco. (Se escribe con el brazo izquierdo y se refleja.) */
    COREO['remo-meadows'] = (function () {
      var R = 17, PIV = [128, 5, -78];
      var pies = { pd: { suelo: [-12, 30], abre: 6 }, pi: { suelo: [12, -42], abre: 14 } };
      /* el antebrazo del otro lado, cruzado sobre la rodilla de delante */
      var inc = sobre(pies, { pel: [0, 70, -11], giro: [0, 80, 0], cab: [-26, 0, 0],
        bd: { a: [-3, 39.5, 37], polo: [-1, 0.2, -0.8] }, md: SUELTA });
      var h = resolver(inc).i.hom, ga = [h[0] + 2, 19.2, h[2] + 1], uB = unidad(menos(PIV, ga));
      var m = { tipo: 'puno', barra: uB, palma: [-0.55, 0, -0.83] };
      var a = conAgarre(sobre(inc, { mi: m, hom: { i: [2, 0], d: [0, 0] } }), ga, [1, 0.3, -0.4], 'bi');
      /* arriba: el codo, a la altura del tronco; la punta de la barra ha subido en su arco */
      var arr = sobre(inc, { mi: m, hom: { i: [-2, -2.6], d: [0, 0] } }), r = largo(menos(ga, PIV));
      var yb = 58, hb = Math.sqrt(r * r - (yb - PIV[1]) * (yb - PIV[1])), uH = unidad([ga[0] - PIV[0], 0, ga[2] - PIV[2]]);
      var gb = [PIV[0] + uH[0] * hb, yb, PIV[2] + uH[2] * hb];
      var s0 = sobre(pies, { pel: [0, PIE - 3, -6], b: aLosLados(8), m: SUELTA });
      return {
        vista: [-34, -150], rastro: 'md', esfuerzo: [0], clavos: ['ti', 'td'], reposo: ['s'],
        material: [['landmine', { pivote: [-PIV[0], PIV[2]], a: 'd', sobra: 4, dentro: 15, discos: R, reposo: [-ga[0], ga[1], ga[2]] }]],
        posturas: { s: refleja(s0), a: refleja(a), b: refleja(conAgarre(arr, gb, [0.35, 1, -0.6], 'bi')) },
        inicio: 'a', encuadra: ['s'],
        rep: [['b', 1.1, 'empuje'], ['b', 0.5], ['a', 1.8, 'freno'], ['a', 0.45]],
        pasos: ['s', { sec: [['a', 1.6, 'suave']], desde: 's' }, 'rep', 'rep']
      };
    })();

    /* ── la polea, a una mano ── */
    var PALMA_ABAJO_I = { tipo: 'puno', palma: [-0.5, -0.8, -0.3] }, PALMA_ARRIBA_I = { tipo: 'puno', palma: [-0.5, 0.85, 0.1] }, PALMA_DENTRO_I = { tipo: 'puno', palma: [-1, 0, 0] };
    /* de pie ante la polea baja, a unos 60 cm, con una pierna delante y otra detrás: del brazo estirado y el hombro adelantado, a
       llevar el hombro atrás y doblar el codo, girando la palma hacia arriba */
    COREO['remo-polea-de-pie-una-mano'] = (function () {
      var POLEA = [19, 24, 90];
      var pies = { pd: { suelo: [-12, 30], abre: 6 }, pi: { suelo: [12, -32], abre: 14 } };
      var base = function (inc, giro, extra) { return sobre(pies, sobre({ pel: [0, 80, -3], giro: [0, inc, 0], col: [0, 0, giro], cab: [-inc * 0.5, -giro * 0.5, 0],
        bd: { a: [-21, 78, 2], polo: [-1, -0.2, -0.7] }, md: SUELTA }, extra || {})); };
      var a0 = estirado(base(12, 0, { mi: PALMA_ABAJO_I }), POLEA, 'bi', 3.2, [1, -0.4, -0.5]);
      var a = estirado(base(24, -14, { mi: PALMA_ABAJO_I, hom: { i: [0, 3.2], d: [0, 0] } }), POLEA, 'bi', 0.3, [1, -0.4, -0.5]);
      var Pb = base(10, 10, { mi: PALMA_ARRIBA_I, hom: { i: [-1.5, -2.8], d: [0, 0] } });
      return {
        vista: [72, 126], rastro: 'mi', esfuerzo: [0], clavos: ['ti', 'td'],
        material: [['polea', { en: [POLEA[0], POLEA[2] + 9], alto: POLEA[1], a: 'i', agarre: 'asa', encuadre: 176 }]],
        posturas: { a0: a0, a: a, b: conAgarre(Pb, anteTronco(Pb, 13, 4, 23.5), [0.3, 0.2, -1], 'bi') },
        inicio: 'a', encuadra: ['a0'],
        rep: [['b', 1.2, 'empuje'], ['b', 0.6], ['a', 1.9, 'freno'], ['a', 0.45]],
        pasos: ['a0', { sec: [['a', 1.2, 'suave']], desde: 'a0' }, 'rep', 'rep']
      };
    })();
    /* de pie ante la polea alta, a un metro: la coge a la altura de la cabeza, da un paso atrás con el pie de ese lado y tira del codo
       hacia el tronco, con un ligero giro */
    COREO['remo-polea-alta-una-mano'] = (function () {
      var POLEA = [19, 204, 100];
      var manoD = { bd: { e: 6, z: 80, g: 60, c: 14 }, md: SUELTA };
      var junto = sobre(manoD, { p: { suelo: [10, 0], abre: 6 }, mi: PALMA_ABAJO_I });
      var atras = sobre(manoD, { pel: [0, PIE - 4, -16], giro: [0, 6, 0], pd: { suelo: [-10, 0], abre: 6 }, pi: { suelo: [11, -38], abre: 12 } });
      var Pb = sobre(atras, { col: [0, 0, 12], cab: [0, -6, 0], hom: { i: [-2, -2.8], d: [0, 0] }, mi: PALMA_DENTRO_I });
      var Eb = resolver(Pb);
      return {
        vista: [72, 126], rastro: 'mi', esfuerzo: [0], clavos: ['ti', 'td'],
        material: [['polea', { en: [POLEA[0], POLEA[2] + 9], alto: POLEA[1], a: 'i', agarre: 'asa' }]],
        posturas: {
          a0: estirado(junto, POLEA, 'bi', 2.2, [1, -0.5, -0.2]),
          a: estirado(sobre(atras, { mi: PALMA_ABAJO_I, hom: { i: [2, 2], d: [0, 0] }, col: [0, 0, -6] }), POLEA, 'bi', 1.6, [1, -0.5, -0.2]),
          b: conAgarre(Pb, mas(Eb.i.hom, aplicar(Eb.Bt, [5, -4, 19.5])), [0.4, -1, -0.25], 'bi')        /* el antebrazo, en la línea del cable */
        },
        inicio: 'a', encuadra: ['a0'],
        rep: [['b', 1.2, 'empuje'], ['b', 0.5], ['a', 1.9, 'freno'], ['a', 0.45]],
        pasos: ['a0', { sec: [['a', 1.1, 'suave', ['td']]], desde: 'a0' }, 'rep', 'rep']
      };
    })();
    /* sentado en un banco, de cara a la polea baja, con un asa en una mano: tira hacia el cuerpo, despacio, y vuelve estirando el brazo */
    COREO['remo-polea-baja-una-mano'] = (function () {
      var POLEA = [19, 46, 132];
      var base = function (inc, extra) { return sobre({ pel: [0, 55, 2], giro: [0, inc, 0], cab: [-inc * 0.6, 0, 0], p: { suelo: [13, 43], abre: 6 },
        bd: { a: [-14, 61.5, 24], polo: [-1, -0.2, -0.6] }, md: { tipo: 'abierta', prono: 90 } }, extra || {}); };
      var a = estirado(base(9, { mi: PALMA_DENTRO_I, hom: { i: [0, 3], d: [0, 0] }, col: [0, 0, -8] }), POLEA, 'bi', 0.3, [1, -0.4, -0.5]);
      var Pb = base(-3, { mi: PALMA_DENTRO_I, hom: { i: [-1.5, -2.8], d: [0, 0] }, col: [-3, 0, 6] });
      return {
        vista: [70, 126], rastro: 'mi', esfuerzo: [0], clavos: ['ti', 'td'],
        material: [['banco', { en: [0, -38], largo: 110 }], ['polea', { en: [POLEA[0], POLEA[2] + 9], alto: POLEA[1], a: 'i', agarre: 'asa', encuadre: 150 }]],
        posturas: { a: a, b: conAgarre(Pb, anteTronco(Pb, 14, 3, 23.5), [0.3, 0.1, -1], 'bi') },
        rep: [['b', 1.9, 'suave'], ['b', 0.5], ['a', 2.1, 'freno'], ['a', 0.5]],
        pasos: ['a', 'rep', 'rep', 'nota']
      };
    })();

    /* ── los estiramientos del dorsal: de rodillas ante un banco ──
       Las rodillas, en el suelo (en z = 0), separadas a la anchura de las caderas; los empeines, apoyados atrás. La cadera gira sobre
       las rodillas: va hacia atrás por un arco de 40 cm. */
    var DE_RODILLAS = { p: { a: [10, 7, -37.5], polo: [0.1, -1, 0.6] }, t: { punta: [0, -0.3, -1], arriba: [0, -1, 0.3] } };
    function arrodillado(atras, cabeceo, extra) {
      return sobre(DE_RODILLAS, sobre({ pel: [0, 5.5 + Math.sqrt(1600 - atras * atras), -atras], giro: [0, cabeceo, 0] }, extra || {}));
    }
    var T4R = ['ti', 'td', 'mi', 'md'];
    /* con las manos en el banco y los brazos estirados: la cadera va hacia atrás, la cabeza sigue en línea y los pulgares giran hacia arriba */
    COREO['estiramiento-dorsal-rodillas-banco'] = (function () {
      var MUN = [19, 46.5, 80.5];
      var plana = { tipo: 'abierta', prono: 90, mun: -14 }, canto = { tipo: 'plana', palma: [-1, 0, 0], mun: 0 };
      var enBanco = { a: MUN, polo: [0.6, -1, -0.2] };
      return {
        vista: [74, [40, 22]], isometrico: 'e', clavos: T4R,
        material: [['banco', { rumbo: 90, en: [0, MUN[2] + 6], largo: 110 }]],
        posturas: {
          k: arrodillado(0, 0, { b: aLosLados(8), m: SUELTA }),
          h: arrodillado(0, 55, { cab: [-18, 0, 0], b: enBanco, m: plana }),
          e: arrodillado(16, 95, { cab: [-8, 0, 0], hom: [3, 0], b: enBanco, m: canto })
        },
        inicio: 'k', encuadra: ['h', 'e'],
        pasos: ['k', { sec: [['h', 1.8, 'suave']], desde: 'k' }, { sec: [['e', 2.2, 'suave']], desde: 'h' }, 'e']
      };
    })();
    /* con los codos en el banco (en su borde: la cabeza queda por encima del asiento), las palmas juntas y las manos hacia arriba: el
       pecho baja hacia el suelo y las manos van hacia los hombros, sin mover los codos */
    COREO['estiramiento-dorsal-codos-banco'] = (function () {
      var juntas = { tipo: 'plana', palma: [-1, 0, 0] }, CODO = [15, 48.5, 68.6];
      return {
        vista: [74, [40, 24]], isometrico: 'e', clavos: ['ti', 'td'],
        material: [['banco', { rumbo: 90, en: [0, CODO[2] + 10], largo: 110 }]],
        posturas: {
          k: arrodillado(0, 0, { b: aLosLados(8), m: SUELTA }),
          c: arrodillado(1.25, 78, { cab: [-14, 0, 0], hom: [1.5, 0], b: { a: [4.6, 70, 67.5], polo: [0.2, -0.7, 0.7] }, m: juntas }),
          e: arrodillado(3, 86, { cab: [-22, 0, 0], hom: [1.5, 0], b: { a: [5, 58.5, 49.2], polo: [0.13, -0.2, 1] }, m: juntas })
        },
        inicio: 'k', encuadra: ['c', 'e'],
        pasos: ['k', { sec: [['c', 1.9, 'suave']], desde: 'k' }, { sec: [['e', 2.2, 'suave']], desde: 'c' }, 'e']
      };
    })();
  })();
