  /* ───────────────────────── las coreografías: ESTIRAMIENTOS SIN MATERIAL, DE TRONCO, CADERA Y PIERNAS (bloque 17) ─────────────────────────
     Las fichas de casa y de fuera que no piden nada (o una pared, o un escalón): el tronco de pie, la cadera, los glúteos, los
     isquiotibiales, el cuádriceps y la pantorrilla, y las que se hacen caminando. Las mismas reglas que en 70-coreografias.js: cada
     una sale de los pasos verificados de su ficha y no añade técnica que la ficha no diga. Donde la ficha no dice dónde van las
     manos y colgando estorbarían (la cadera que gira, la rodilla que sube de lado), van a la cintura. */
  (function () {
    var T2 = ['ti', 'td'], HY = D.hombroY, L_BRAZO = D.brazo + D.antebrazo - 0.35;      /* del hombro a la muñeca, con el brazo estirado */
    var BASE = { pel: [0, PIE, 0], p: { suelo: [10, 0], abre: 6 } }, SUELTO = { b: aLosLados(8), m: SUELTA }, DE = sobre(BASE, SUELTO);
    /* con las piernas separadas (los tobillos, a 15 cm del centro) */
    var ABIERTO = { pel: [0, PIE - 0.6, 0], p: { suelo: [15, 0], abre: 8 } };
    var EN_CINTURA = { a: [16, 13, 6], en: 'pelvis', polo: [1, 0, -0.3] };
    /* los dos brazos a un punto dicho desde el tórax (x, hacia cada lado; y, arriba: los hombros quedan a D.hombroY; z, delante) */
    function aTorax(x, y, z, polo) { return { a: [x, y, z], en: 'torax', polo: polo }; }
    /* las dos manos, abiertas y al aire, con los dedos hacia «dedos» y la palma hacia «palma» (dichos para la izquierda; la derecha, reflejada) */
    function manos(P, dedos, palma, tipo) {
      return sobre(P, { mi: manoHacia(P, 'i', dedos, palma, tipo || 'abierta'), md: manoHacia(P, 'd', [-dedos[0], dedos[1], dedos[2]], [-palma[0], palma[1], palma[2]], tipo || 'abierta') });
    }
    /* la mano que se posa de plano en algo (dicha en el mundo: la palma y los dedos), con el giro y la muñeca que le tocan en su postura:
       así llega plana desde el aire (como en 7f-estiramientos.js) */
    function posada(P, k, dedos, palma, cerca, tipo) { return une(manoHacia(P, k, dedos, palma, tipo || 'abierta', cerca), apoyada(dedos, palma, tipo)); }
    /* la postura del otro lado: refleja() no sabe de «base», ni de los pies dichos en el mundo para los dos a la vez (como el espejo de
       7b-abdomen.js). (Lo que se ladea la muñeca, lat, ya lo refleja el motor: 10-esqueleto.js, reflejo) */
    function espejo(P) {
      var R = refleja(P), mx = function (v) { return [-v[0], v[1], v[2]]; };
      if (P.base) R.base = baseEjes(mx(P.base[1]), mx(P.base[2]));
      if (P.t && P.t.punta) R.t = { punta: mx(P.t.punta), arriba: mx(P.t.arriba), flex: P.t.flex };
      return R;
    }
    /* los brazos arriba del todo, estirados hacia el techo, con las palmas enfrentadas */
    var ARRIBA = aTorax(D.hombroX - 1.5, HY + 53.6, 1.5, [1, 0.1, 0.6]), AL_FRENTE = aTorax(D.hombroX - 1, HY - 2, 44, [1, -0.6, 0]);
    function arriba(P, extra) { return manos(sobre(P, sobre({ b: ARRIBA, hom: [3.5, 0] }, extra || {})), [0, 1, 0], [-1, 0, 0]); }
    function alFrente(P) { return manos(sobre(P, { b: AL_FRENTE }), [0, 0, 1], [-1, 0, 0]); }

    /* ══════════════════════════════ DE PIE: EL TRONCO ══════════════════════════════ */

    /* de puntillas, con los brazos arriba: de pie, sube los brazos y las manos todo lo que puede hacia el techo (por delante); y se pone
       de puntillas y mantiene */
    COREO['estiramiento-puntillas-brazos-arriba'] = (function () {
      var G = 40, dt = deTalon(G);
      var b = arriba({ pel: [0, PIE + dt[1] - 0.2, dt[0] * Math.cos(6 * RAD)], p: { suelo: [10, 0], abre: 6, talon: G } }, { hom: [4, 0], cab: [-5, 0, 0] });
      return {
        vista: [[58, 10], [112, 10]], isometrico: 'b', clavos: T2, zoom: 0.84,
        posturas: { de: DE, m: alFrente(BASE), a: arriba(BASE, { cab: [-4, 0, 0] }), b: b }, inicio: 'de', encuadra: ['de', 'b'],
        pasos: [{ sec: [['de', 0.6], ['m', 1.0, 'entra'], ['a', 1.2, 'sale']], desde: 'de' }, { sec: [['b', 1.6, 'suave']], desde: 'a' }]
      };
    })();

    /* la extensión del tronco, con las manos en la espalda: de pie, con las piernas separadas, apoya las manos en la parte de atrás de
       las caderas (de plano, con los dedos hacia abajo: van con la pelvis); lleva despacio el tronco hacia atrás, echando la cintura
       hacia delante; mantiene y vuelve */
    COREO['extension-tronco-de-pie'] = (function () {
      var atras = function (P, cerca) {
        var B = resolver(P).Bp, ded = aplicar(B, [0, -0.97, -0.24]), pal = aplicar(B, [0, 0.24, 0.97]), Q = sobre(P, { b: { a: [9.5, 10.5, -11.4], en: 'pelvis', polo: [0.8, 0.1, -1] } });
        return sobre(Q, { mi: manoHacia(Q, 'i', ded, pal, 'plana', cerca), md: manoHacia(Q, 'd', ded, pal, 'plana', cerca) });
      };
      var de = sobre(ABIERTO, SUELTO), a = atras(ABIERTO), b = atras(sobre(ABIERTO, { pel: [0, PIE - 1.2, 6], giro: [0, -9, 0], col: [-24, 0, 0], cab: [-7, 0, 0], hom: [0, -2] }), a.mi.prono);
      return {
        vista: [[108, 10], [152, 14]], isometrico: 'b', clavos: T2,
        posturas: { de: de, a: a, b: b }, inicio: 'de', encuadra: ['de', 'b'],
        pasos: [{ sec: [['de', 0.6], ['a', 1.6, 'suave']], desde: 'de' }, { sec: [['b', 2.2, 'suave']], desde: 'a' }, { sec: [['b', 1.5], ['a', 1.8, 'suave']], desde: 'b' }]
      };
    })();

    /* ── de pie, inclinado de lado ── «g» grados hacia su izquierda: la cadera se va un poco al otro lado. La mano de ese lado resbala por
       fuera de su pierna: la muñeca, a «s» cm de la cadera por el muslo y pegada a su cara de fuera (enLaPierna); se busca la
       inclinación que deja el hombro a un brazo (casi) estirado de ella. La otra mano descansa en la cadera de su lado */
    function radioMuslo(s) { s = Math.min(s, 40); return s < 19.6 ? 10.6 : s < 28 ? 8.7 - (s - 18) * 0.14 : 7.3 - (s - 28) * 0.1; }
    function enLaPierna(P, k, s) {
      var L = resolver(P)[k], sg = k === 'i' ? 1 : -1, u = unidad(menos(L.rod, L.cad)), f = unidad(sinParte([sg, 0, 0], u));
      var w = mas(L.cad, mas(por(u, s), por(f, radioMuslo(s) + ALTO_MUN))), q = mas(L.cad, mas(por(u, s + 15), por(f, radioMuslo(s + 15) + 1.3)));
      return { w: w, dedos: unidad(menos(q, w)), palma: por(f, -1) };
    }
    function deLado(pies, g, extra) { var dx = g * 0.13; return sobre(pies, sobre({ pel: [-dx, D.tobillo + Math.sqrt(77.8 * 77.8 - dx * dx) - (PIE - pies.pel[1]), 0], col: [0, g, 0] }, extra || {})); }
    var EN_CADERA = { a: [-22.8, 2, 1.5], en: 'pelvis', polo: [-1, 0.3, -0.6] };
    function resbala(pies, s, extra) {
      var con = function (g) {
        var P = deLado(pies, g, extra), M = enLaPierna(P, 'i', s), Q = sobre(P, { bi: { a: M.w, polo: [1, 0, -0.6] }, bd: EN_CADERA });
        return sobre(Q, { mi: manoHacia(Q, 'i', M.dedos, M.palma, 'plana'), md: manoHacia(Q, 'd', [0, -1, 0], [1, 0, 0], 'plana') });
      };
      return con(busca(function (g) { var P = deLado(pies, g, extra); return largo(menos(resolver(P).i.hom, enLaPierna(P, 'i', s).w)); }, L_BRAZO - 1.2, 0, 50));
    }

    /* la inclinación lateral: de pie y erguido, con los pies a la anchura de la cadera y los brazos a los lados; desliza un brazo hacia
       abajo por el costado, hasta donde le resulte cómodo; mantiene, vuelve arriba y repite con el otro brazo */
    COREO['inclinacion-lateral-de-pie'] = (function () {
      var l = resbala(BASE, 15.5), l2 = espejo(l);
      return {
        vista: [[12, 10], [-34, 12]], isometrico: 'l', clavos: T2,
        posturas: { a: DE, l: l, l2: l2 }, inicio: 'a', encuadra: ['a', 'l', 'l2'],
        pasos: ['a', { sec: [['l', 2.2, 'suave']], desde: 'a' }, { sec: [['l', 0.9], ['a', 1.4, 'suave'], ['l2', 1.9, 'suave']], desde: 'l' }]
      };
    })();

    /* la inclinación lateral con un brazo arriba: de pie, con las manos a los lados; desliza una mano por la pierna hacia la rodilla (el
       hombro se inclina hacia ese lado y hacia el suelo); a la vez estira el otro brazo hacia el techo y después por encima de la cabeza,
       hacia el lado al que se inclina; vuelve y repite hacia el otro lado */
    COREO['inclinacion-lateral-brazo-arriba'] = (function () {
      var l = resbala(BASE, 19.5), P = { a: DE, l: l };
      /* el brazo derecho, estirado desde su hombro hacia «d»; la palma, hacia «pal» */
      var con = function (d, pal, hom) {
        var Q = sobre(l, { hom: { i: [0, 0], d: hom }, bd: { a: mas(resolver(sobre(l, { hom: { i: [0, 0], d: hom } })).d.hom, por(unidad(d), L_BRAZO - 0.5)), polo: [-1, 0.2, -0.5] } });
        return sobre(Q, { md: manoHacia(Q, 'd', d, pal, 'abierta') });
      };
      P.u = con([-0.12, 1, 0.04], [1, 0.1, 0], [3, 0]);
      P.o = con([0.74, 0.67, 0.07], [0.67, -0.74, 0], [4, 0]);
      ['l', 'u', 'o'].forEach(function (n) { P[n + '2'] = espejo(P[n]); });
      return {
        vista: [[12, 10], [-34, 12]], isometrico: 'o', clavos: T2, zoom: 0.92,
        posturas: P, inicio: 'a', encuadra: ['a', 'o', 'o2', 'u'],
        pasos: ['a', { sec: [['l', 2.2, 'suave']], desde: 'a' }, { sec: [['u', 1.3, 'suave'], ['u', 0.3], ['o', 1.2, 'suave']], desde: 'l' },
                { sec: [['o', 0.4], ['u', 0.6, 'entra'], ['a', 1.0, 'sale'], ['l2', 1.2, 'suave'], ['u2', 0.8, 'entra'], ['o2', 0.9, 'sale']], desde: 'o', dura: 5.6 }]
      };
    })();

    /* el desplazamiento lateral del tronco: con los brazos abiertos hacia los lados a la altura de los hombros, lleva los hombros hacia un
       lado (el tronco entero se va hacia allí, derecho: los brazos siguen paralelos al suelo y los pies no se mueven) y mantiene; después,
       hacia el otro, sin rebotes */
    COREO['desplazamiento-lateral-tronco'] = (function () {
      var CRUZ = aTorax(D.hombroX + L_BRAZO - 0.4, HY, -1, [0, -1, -0.4]);
      var con = function (dx) { return manos(sobre(ABIERTO, { pel: [dx, PIE - 0.6 - Math.abs(dx) * 0.1, 0], b: CRUZ, hom: [0, -1] }), [1, 0, 0], [0, -1, 0]); };
      return {
        vista: [[10, 10], [-36, 12]], isometrico: 'l', clavos: T2,
        posturas: { de: sobre(ABIERTO, SUELTO), t: con(0), l: con(8.5), l2: con(-8.5) }, inicio: 'de', encuadra: ['de', 'l', 'l2'],
        pasos: [{ sec: [['de', 0.5], ['t', 1.4, 'suave'], ['t', 0.2], ['l', 1.6, 'suave']], desde: 'de' }, { sec: [['l', 0.5], ['l2', 2.4, 'suave']], desde: 'l' }]
      };
    })();

    /* la rotación de tronco, con los brazos cruzados: de pie y erguido, cruza los brazos sobre el pecho (cada mano, en el hombro contrario;
       llegan por delante); gira desde la cintura para llevar el pecho hacia un lado, sin mover los pies; vuelve al centro y repite hacia
       el otro. El brazo izquierdo, por encima del derecho: los antebrazos, a 9 cm uno de otro */
    COREO['rotacion-tronco-de-pie'] = (function () {
      var m = sobre(BASE, { b: aTorax(13, HY - 15, 29, [1, -0.8, -0.1]), m: { tipo: 'suelta', prono: 30 } });
      var x0 = sobre(BASE, { bi: aTorax(-16, HY - 1.5, 15.5, [0.25, -0.6, 1]), bd: { a: [16, HY - 10.5, 12], en: 'torax', polo: [-0.25, -1, 0.9] }, hom: [0, 2] });
      var x = sobre(x0, { mi: manoHacia(x0, 'i', [-0.8, 0.5, -0.33], [0.4, 0, -0.92], 'suelta', 30), md: manoHacia(x0, 'd', [0.8, 0.5, -0.33], [-0.4, 0, -0.92], 'suelta', 30) });
      var g = sobre(x, { col: [0, 0, 46] }), g2 = sobre(x, { col: [0, 0, -46] });
      return {
        vista: [[16, 12], [-40, 16]], isometrico: 'g', clavos: T2,
        posturas: { de: DE, m: m, x: x, g: g, g2: g2 }, inicio: 'de', encuadra: ['de'],
        pasos: [{ sec: [['de', 0.5], ['m', 0.9, 'entra'], ['x', 1.0, 'sale']], desde: 'de' }, { sec: [['g', 1.9, 'suave']], desde: 'x' }, { sec: [['g', 0.5], ['x', 1.2, 'suave'], ['g2', 1.8, 'suave']], desde: 'g' }]
      };
    })();

    /* los círculos de cadera: de pie (sin apoyo: las manos, en la cintura); sin mover los hombros ni los pies, dibuja con la cadera un
       círculo grande hacia la izquierda; y después, hacia la derecha. La pelvis va por un círculo y se ladea hacia su centro (TH grados);
       la columna se dobla lo mismo al revés (se busca) y el tórax queda derecho y en su sitio. La cadera va algo más baja que de pie:
       la pierna del lado que sube queda casi recta, y la otra rodilla se dobla lo que haga falta */
    COREO['circulos-cadera-de-pie'] = (function () {
      var pies = { suelo: [13, 0], abre: 7 }, TH = 17, N = 8, T = 0.37, P = {}, ida = [], vuelta = [], i;
      var a = { pel: [0, PIE - 0.3, 0], p: pies, b: EN_CINTURA, m: SUELTA }, T0 = resolver(a).tor;
      var en = function (fi) {
        var s = Math.sin(TH * RAD), B = baseEjes([-s * Math.cos(fi * RAD), Math.cos(TH * RAD), -s * Math.sin(fi * RAD)], [0, 0, 1]), col = [0, 0, 0], k;
        var Q = function (c) { return sobre(a, { pel: [0, PIE - 3.4, 0], base: B, col: c }); }, vertical = function (j, q) { return function (v) { var c = col.slice(); c[j] = v; return aplicar(resolver(Q(c)).Bt, [0, 1, 0])[q]; }; };
        for (k = 0; k < 3; k++) { col[0] = busca(vertical(0, 2), 0, -45, 45); col[1] = busca(vertical(1, 0), 0, -45, 45); }
        var E = resolver(Q(col));
        return sobre(Q(col), { pel: [T0[0] - E.tor[0], PIE - 3.4, T0[2] - E.tor[2]] });
      };
      /* empieza con la cadera delante (fi = 90) y sigue hacia su izquierda (fi = 0), atrás y a la derecha */
      for (i = 0; i < N; i++) P['c' + i] = en(90 - i * 360 / N);
      for (i = 1; i <= N; i++) { ida.push(['c' + (i % N), T, 'lineal']); vuelta.push(['c' + ((N - i) % N), T, 'lineal']); }
      P.a = a;
      return {
        vista: [[24, 18], [100, 12]], rastro: 'pel', clavos: T2,
        posturas: P, inicio: 'a', encuadra: ['a', 'c0', 'c2', 'c4', 'c6'],
        pasos: ['a', { sec: [['c0', 0.8, 'suave']].concat(ida, ida), desde: 'a', dura: 7.0 }, { sec: [['c0', 0.4]].concat(vuelta, vuelta), desde: 'c0', dura: 6.6 }]
      };
    })();

    /* flexión y alcance: de pie, con las piernas separadas y los brazos estirados por encima de la cabeza; baja a una sentadilla parcial sin
       despegar los talones, redondea la espalda y lleva los brazos lo más atrás que puede entre las piernas, metiendo la barbilla; vuelve
       y repite */
    COREO['flexion-y-alcance'] = (function () {
      var pies = { suelo: [22, 0], abre: 12, polo: [0.35, 0.1, 1] };
      var a = arriba({ pel: [0, PIE - 1.7, 0], p: pies });
      var b = manos({ pel: [0, 63, -19], giro: [0, 56, 0], col: [46, 0, 0], cab: [22, 0, 0], p: pies, b: { a: [6.5, 28, -6], polo: [1, 0.3, 0.3] } }, [0, -0.45, -0.89], [-1, 0, 0]);
      return {
        vista: [[62, 12], [18, 14]], rastro: 'manos', esfuerzo: [], clavos: T2, zoom: 0.86,
        posturas: { a: a, b: b }, inicio: 'a', encuadra: ['a', 'b'],
        rep: [['b', 1.4, 'suave'], ['b', 0.5], ['a', 1.4, 'suave'], ['a', 0.5]],
        pasos: ['a', { sec: [['b', 1.7, 'suave']], desde: 'a' }, { rep: 1.9 }]
      };
    })();

    /* el molino: de pie, con las piernas separadas y los brazos en cruz; dobla cadera y rodillas mientras gira el tronco a la izquierda y
       toca el exterior del pie izquierdo con la mano derecha, mirando hacia atrás; el brazo izquierdo va hacia atrás (arriba, en la línea
       de los hombros); vuelve y repite hacia el otro lado. Se busca la inclinación del tronco que deja las yemas de la mano derecha en el
       borde de fuera del pie */
    COREO['molino-de-pie'] = (function () {
      var pies = { suelo: [24, 0], abre: 10, polo: [0.3, 0.1, 1] }, F = [30.5, 6.5, 8];
      var a = manos({ pel: [0, D.tobillo + Math.sqrt(77.8 * 77.8 - 196), 0], p: pies, b: aTorax(D.hombroX + L_BRAZO - 0.4, HY, -1, [0, -1, -0.4]) }, [1, 0, 0], [0, -1, 0]);
      var Q = function (cab) { return { pel: [6, 62, -12], giro: [0, cab, 0], col: [24, 0, 52], cab: [-8, 52, 0], p: pies }; };
      var b0 = Q(busca(function (cab) { return largo(menos(resolver(Q(cab)).d.hom, F)); }, L_BRAZO + 15, 20, 110)), E = resolver(b0), u = unidad(menos(F, E.d.hom));
      var b1 = sobre(b0, { bd: { a: mas(E.d.hom, por(u, L_BRAZO - 0.5)), polo: [-0.3, 0.4, -1] }, bi: { a: mas(E.i.hom, por(unidad(mas(por(unidad(menos(E.i.hom, E.d.hom)), 0.75), [0, 0.35, -0.45])), L_BRAZO - 0.5)), polo: [0.2, -0.3, -1] } });
      var b = sobre(b1, { md: manoHacia(b1, 'd', u, unidad(sinParte([-0.2, -0.3, -1], u)), 'abierta'), mi: manoHacia(b1, 'i', unidad(menos(resolver(b1).i.mun, resolver(b1).i.cod)), [0, 0.2, 1], 'abierta') });
      var b2 = espejo(b);
      return {
        vista: [[34, 14], [-50, 16]], rastro: 'manos', esfuerzo: [], clavos: T2, zoom: 0.9,
        posturas: { a: a, b: b, b2: b2 }, inicio: 'a', encuadra: ['a', 'b', 'b2'],
        rep: [['b', 1.1, 'suave'], ['b', 0.45], ['a', 1.1, 'suave'], ['a', 0.3], ['b2', 1.1, 'suave'], ['b2', 0.45], ['a', 1.1, 'suave'], ['a', 0.3]],
        pasos: ['a', { sec: [['b', 1.5, 'suave']], desde: 'a' }, { rep: 1.55 }]
      };
    })();

    /* ── con un pie un paso atrás, apoyado en la parte delantera (el derecho): la cadera queda entre los dos ──
       s1: el pie, a medio camino, en el aire */
    var Z_AT = -44, T_AT = 26;
    function pasoAtras(extra) { return sobre({ pel: [0, PIE - 2, -13], pi: { suelo: [10, 0], abre: 4 }, pd: { suelo: [-10, Z_AT], abre: 3, talon: T_AT, polo: [-0.1, 0.2, 1] } }, extra || {}); }
    function pieAtras(extra) { return sobre({ pel: [1.5, PIE - 0.8, -4], pi: { suelo: [10, 0], abre: 4 }, pd: { a: [-10, 19, -22], polo: [-0.05, 0.2, 1] }, td: { punta: [0, -0.34, 0.94], arriba: [0, 0.94, 0.34] } }, extra || {}); }
    var JUNTOS = { pel: [0, PIE, 0], p: { suelo: [10, 0], abre: 4 } };

    /* la rotación de pie con los brazos largos: lleva el pie derecho un paso atrás y lo apoya en la parte delantera; sube el brazo derecho,
       con el codo algo flexionado, y estira el izquierdo hacia abajo, con los dedos hacia el suelo; gira el tronco hacia el interior del
       muslo izquierdo alargando los brazos (como si las manos quisieran llegar más arriba y más abajo); vuelve al centro, repite y cambia
       de lado (el pie de atrás vuelve y el otro va atrás) */
    COREO['rotacion-de-pie-brazos-largos'] = (function () {
      var P = { a0: sobre(JUNTOS, SUELTO), s1: pieAtras(SUELTO), s: pasoAtras(SUELTO) };
      var con = function (giro, sube, baja, alto, codo) {
        var Q = pasoAtras({ col: [0, 0, giro], hom: { i: [baja, 0], d: [sube, 0] }, bd: { a: [-(D.hombroX - 1), HY + sube + alto, 3], en: 'torax', polo: [-1, 0.1, 0.6] }, bi: { e: 4, z: 90, g: 90, c: codo }, mi: { tipo: 'abierta', prono: 0 } });
        return sobre(Q, { md: manoHacia(Q, 'd', aplicar(resolver(Q).Bt, [0, 1, 0]), aplicar(resolver(Q).Bt, [1, 0, 0]), 'abierta') });
      };
      P.u = con(0, 2, 0, 48.6, 5); P.g = con(38, 5, -2.5, 50.1, 2);
      ['s1', 's', 'u', 'g'].forEach(function (n) { P[n + '2'] = espejo(P[n]); });
      var KI = ['ti'], KD = ['td'];
      return {
        vista: [[38, 12], [-48, 14]], rastro: 'manos', isometrico: 'g', clavos: T2, zoom: 0.86,
        posturas: P, inicio: 'a0', encuadra: ['a0', 'g', 'g2'],
        pasos: [{ sec: [['a0', 0.5, null, T2], ['s1', 0.5, 'entra', KI], ['s', 0.5, 'sale', KI]], desde: 'a0' }, { sec: [['u', 1.7, 'suave']], desde: 's' },
                { sec: [['g', 1.3, 'suave'], ['g', 0.6], ['u', 1.0, 'suave'], ['g', 1.2, 'suave'], ['g', 0.4], ['u', 0.9, 'suave'], ['s', 0.7, 'suave'], ['s1', 0.4, 'entra', KI], ['a0', 0.4, 'sale', KI],
                        ['s12', 0.4, 'entra', KD], ['s2', 0.45, 'sale', KD], ['u2', 1.0, 'suave'], ['g2', 1.2, 'suave']], desde: 'u' }]
      };
    })();

    /* la rotación de pie con apertura cruzada: el pie derecho, un paso atrás, apoyado en la parte delantera; dobla los dos codos en ángulo
       recto: la mano derecha, delante del pecho con la palma hacia abajo; la izquierda, con los dedos hacia arriba y la palma al frente (el
       codo, abierto a la altura del hombro); gira hacia el interior del muslo izquierdo y estira a la vez los brazos: el derecho cruza por
       delante del cuerpo y el izquierdo sube por encima de la cabeza; vuelve al centro, repite y cambia de lado */
    COREO['rotacion-de-pie-brazos-cruzados'] = (function () {
      var P = { a0: sobre(JUNTOS, SUELTO), s1: pieAtras(SUELTO), s: pasoAtras(SUELTO) };
      var con = function (giro, der, poloD, izq, homI) {
        var Q = pasoAtras({ col: [0, 0, giro], hom: { i: [homI, 0], d: [0, 0] }, bd: { a: der, en: 'torax', polo: poloD }, bi: { a: izq, en: 'torax', polo: [1, -0.25, -0.1] } }), B = resolver(Q).Bt;
        return sobre(Q, { md: manoHacia(Q, 'd', aplicar(B, [1, 0, 0.12]), aplicar(B, [0, -1, 0]), 'abierta'), mi: manoHacia(Q, 'i', aplicar(B, [0, 1, 0]), aplicar(B, [0, 0, 1]), 'abierta') });
      };
      P.c = con(0, [-1, HY - 3, 31], [-1, -0.2, 0.1], [D.hombroX + 26.5, HY + 23.5, 4], 0);
      P.g = con(38, [17, HY - 3, 34.5], [-0.3, -1, 0.2], [D.hombroX + 2, HY + 3.5 + 49.8, 3], 3.5);
      ['s1', 's', 'c', 'g'].forEach(function (n) { P[n + '2'] = espejo(P[n]); });
      var KI = ['ti'], KD = ['td'];
      return {
        vista: [[36, 12], [-50, 14]], rastro: 'manos', isometrico: 'g', clavos: T2, zoom: 0.86,
        posturas: P, inicio: 'a0', encuadra: ['a0', 'g', 'g2'],
        pasos: [{ sec: [['a0', 0.5, null, T2], ['s1', 0.5, 'entra', KI], ['s', 0.5, 'sale', KI]], desde: 'a0' }, { sec: [['c', 1.8, 'suave']], desde: 's' }, { sec: [['g', 1.6, 'suave']], desde: 'c' },
                { sec: [['g', 0.5], ['c', 1.0, 'suave'], ['g', 1.2, 'suave'], ['g', 0.4], ['c', 0.9, 'suave'], ['s', 0.7, 'suave'], ['s1', 0.4, 'entra', KI], ['a0', 0.4, 'sale', KI],
                        ['s12', 0.4, 'entra', KD], ['s2', 0.45, 'sale', KD], ['c2', 1.0, 'suave'], ['g2', 1.3, 'suave']], desde: 'g', dura: 9.0 }]
      };
    })();

    /* ══════════════════════════════ DE PIE: LAS PIERNAS ══════════════════════════════ */
    /* la mano sobre el muslo de su lado, a «s» cm de la cadera (como enSuMuslo, de 70-coreografias.js, que la deja a 21): más arriba pisa
       la pernera, que abulta más */
    function enMuslo(P, k, s) {
      var L = resolver(P)[k], sg = k === 'i' ? 1 : -1, u = unidad(menos(L.rod, L.cad)), n = unidad(sinParte([0, 1, 0.01], u)), c = {}, h = s < 19.6 ? 14.3 : 12;
      c['b' + k] = { a: mas(L.cad, mas(por(u, s), por(n, h))), polo: [0.55 * sg, -0.1, -1] };
      var Q = sobre(P, c), m = {};
      m['m' + k] = manoHacia(Q, k, mas(mas(por(u, 0.94), por(n, -0.2)), [-0.27 * sg, 0, 0]), mas(mas(por(n, -0.95), por(u, -0.2)), [0.3 * sg, 0, 0]), 'plana');
      return sobre(Q, m);
    }
    /* el pie izquierdo apoyado en el talón, con la punta «fi» grados hacia arriba, y el tobillo en [x, z]: se busca la altura que deja la
       zapatilla posada */
    function enTalon(P, x, z, fi, polo) {
      var c = Math.cos(fi * RAD), s = Math.sin(fi * RAD), con = function (y) { return sobre(P, { pi: { a: [x, y, z], polo: polo || [0.05, 0.3, 1] }, ti: { punta: [0, s, c], arriba: [0, c, -s] } }); };
      return con(busca(function (y) { return bajoZapa(resolver(con(y)).i, 'i'); }, -0.2, 4, 16));
    }

    /* los isquiotibiales, de pie, con el talón adelantado: de pie y erguido, con los brazos a los lados, adelanta una pierna estirada con
       el talón apoyado en el suelo y los dedos hacia el techo; apoya las manos en la parte alta de los muslos y se inclina hacia delante
       desde la cadera, con la espalda neutra (la cadera va hacia atrás y la otra rodilla se dobla: la pierna de delante sigue recta) */
    COREO['estiramiento-isquios-de-pie-talon'] = (function () {
      var ZT = 24, FI = 46, der = { suelo: [-10, 0], abre: 5 }, P = { a0: DE };
      P.u = sobre(SUELTO, { pel: [-2, PIE - 0.5, -1], pd: der, pi: { a: [10, 15, 13], polo: [0.05, 0.1, 1] }, ti: { punta: [0, 0.26, 0.966], arriba: [0, 0.966, -0.26] } });
      /* con la pierna de delante recta: la cadera, en z, a la altura que la deja a 77,6 del tobillo */
      var con = function (z, extra) {
        var Q = function (y) { return enTalon(sobre({ pel: [-1.5, y, z], pd: der }, extra), 10, ZT, FI); };
        return Q(busca(function (y) { var L = resolver(Q(y)).i; return largo(menos(L.cad, L.tob)); }, 77.6, 60, PIE));
      };
      P.a = con(-2, SUELTO);
      P.m = enMuslo(enMuslo(con(-4, { giro: [0, 8, 0] }), 'i', 14), 'd', 14);
      P.b = enMuslo(enMuslo(con(-13, { giro: [0, 42, 0], cab: [-14, 0, 0] }), 'i', 14), 'd', 14);
      return {
        vista: [[72, 12], [118, 12]], isometrico: 'b', clavos: T2, clavosEn: { a0: T2 },
        posturas: P, inicio: 'a0', encuadra: ['a0', 'b'],
        pasos: [{ sec: [['a0', 0.5, null, T2], ['u', 0.6, 'entra', ['td']], ['a', 0.7, 'sale', ['td']]], desde: 'a0' }, { sec: [['m', 1.1, 'suave'], ['b', 1.7, 'suave']], desde: 'a' }, 'b']
      };
    })();

    /* los isquiotibiales, desde cuclillas: en cuclillas, con la parte alta del tronco en contacto con los muslos y las palmas apoyadas en el
       suelo a los lados de los pies; desde ahí estira las rodillas (la cadera sube; las manos no se mueven) hasta notar la tensión detrás
       de las piernas; y mantiene. Las rodillas, abiertas: el tronco baja entre los muslos */
    COREO['estiramiento-isquios-desde-cuclillas'] = (function () {
      var pies = { suelo: [13, 0], abre: 20, polo: [0.55, 0.3, 1] }, W = [27.5, ALTO_MUN, 7], brazos = { b: { a: W, polo: [1, 0.25, -0.5] }, m: EN_SUELO };
      var de = { pel: [0, PIE - 0.2, 0], p: sobre(pies, { polo: null }), b: aLosLados(8), m: SUELTA };
      var m = manos({ pel: [0, 62, -17], giro: [0, 40, 0], col: [14, 0, 0], cab: [-10, 0, 0], p: pies, b: { a: [26, 34, 14], polo: [1, 0.2, -0.5] } }, [0, -0.6, 0.8], [0, -0.8, -0.6]);
      var a0 = sobre(brazos, { pel: [0, 31, -21], giro: [0, 58, 0], col: [34, 0, 0], cab: [-32, 0, 0], p: pies }), a = sobre(a0, { mi: posada(a0, 'i', [0, 0, 1], [0, -1, 0]), md: posada(a0, 'd', [0, 0, 1], [0, -1, 0]) });
      var b0 = sobre(brazos, { pel: [0, 83.5, -7], giro: [0, 118, 0], col: [34, 0, 0], cab: [-35, 0, 0], p: sobre(pies, { polo: [0.3, 0.3, 1] }) }), b = sobre(b0, { mi: posada(b0, 'i', [0, 0, 1], [0, -1, 0], a.mi.prono), md: posada(b0, 'd', [0, 0, 1], [0, -1, 0], a.md.prono) });
      var K4 = T2.concat(['mi', 'md']);
      return {
        vista: [[64, 14], [16, 16]], rastro: 'pel', isometrico: 'b', clavos: K4, clavosEn: { de: T2 },
        posturas: { de: de, m: m, a: a, b: b }, inicio: 'de', encuadra: ['de', 'a', 'b'],
        pasos: [{ sec: [['de', 0.4, null, T2], ['m', 1.0, 'entra', T2], ['a', 1.1, 'sale', T2]], desde: 'de' }, { sec: [['b', 2.4, 'suave']], desde: 'a' }, 'b']
      };
    })();

    /* la patada al frente con toque de la mano contraria: de pie, con las piernas separadas y las manos en la cintura; sube la pierna
       izquierda al frente hasta dejarla paralela al suelo mientras se inclina desde la cintura y lleva la mano derecha hacia el pie
       izquierdo; el brazo izquierdo va hacia atrás; vuelve y repite con la pierna derecha y la mano izquierda */
    COREO['patada-frontal-toque-alterno'] = (function () {
      var a = sobre(ABIERTO, { b: EN_CINTURA, m: SUELTA });
      var b0 = { pel: [-8.5, PIE - 0.7, -3], giro: [0, 10, 0], col: [40, 0, 28], cab: [-20, -8, 0], pd: { suelo: [-15, 0], abre: 8 } }, c = resolver(b0).i.cad;
      var b1 = sobre(b0, { pi: { a: [c[0], c[1] - 1.5, c[2] + 77.6], polo: [0, 1, 0.2] }, ti: { tob: 2 } }), E = resolver(b1), F = mas(E.i.tob, [0, 12, 12]), u = unidad(menos(F, E.d.hom));
      var b2_ = sobre(b1, { bd: { a: mas(E.d.hom, por(u, Math.min(L_BRAZO - 0.5, largo(menos(F, E.d.hom)) - 15))), polo: [-1, -0.3, -0.2] }, bi: { a: mas(E.i.hom, por(unidad([0.35, -0.3, -0.9]), L_BRAZO - 0.8)), polo: [1, 0.3, 0.2] } });
      var b = sobre(b2_, { md: manoHacia(b2_, 'd', u, [0, -1, 0.2], 'abierta'), mi: manoHacia(b2_, 'i', [0.35, -0.3, -0.9], [-1, 0, -0.3], 'abierta') }), br = espejo(b);
      /* de paso (k): la pierna, a medio subir, y las manos, ya fuera de la cintura: la derecha, ante el pecho (en línea recta desde la
         cintura hasta el pie pasaría rozando el muslo que sube) */
      var k0 = { pel: [-5, PIE - 0.7, -1.5], giro: [0, 5, 0], col: [18, 0, 12], cab: [-8, -4, 0], pd: { suelo: [-15, 0], abre: 8 } }, ck = resolver(k0).i.cad;
      var k = sobre(k0, { pi: { a: [ck[0], ck[1] - 59.4, ck[2] + 49.9], polo: [0, 1, 0.2] }, ti: { tob: 2 }, bd: { a: [-9, HY - 12, 31], en: 'torax', polo: [-1, -0.7, 0] }, bi: { a: [23, HY - 30, -12], en: 'torax', polo: [1, 0.2, -0.6] }, m: { tipo: 'suelta', prono: 30 } }), kr = espejo(k);
      var KD = ['td'], KI = ['ti'];
      return {
        vista: [[52, 12], [-38, 14]], rastro: 'ti', esfuerzo: [], clavos: T2, zoom: 0.9,
        posturas: { a: a, k: k, b: b, k2: kr, b2: br }, inicio: 'a', encuadra: ['a', 'b', 'b2'],
        rep: [['k', 0.42, 'entra', KD], ['b', 0.5, 'sale', KD], ['b', 0.5, null, KD], ['k', 0.45, 'entra', KD], ['a', 0.45, 'sale', KD], ['a', 0.3],
              ['k2', 0.42, 'entra', KI], ['b2', 0.5, 'sale', KI], ['b2', 0.5, null, KI], ['k2', 0.45, 'entra', KI], ['a', 0.45, 'sale', KI], ['a', 0.3]],
        pasos: ['a', { sec: [['k', 0.6, 'entra', KD], ['b', 0.7, 'sale', KD]], desde: 'a' }, { rep: 1.42 }]
      };
    })();

    /* ── la zancada, de pie ── El pie izquierdo, un paso largo adelante (el tobillo, en z = ZF); el derecho se queda atrás, apoyado en la
       parte delantera (su bola no se mueve): el talón sube «t» grados y el tobillo va con él. pasoAlFrente: el pie, a medio camino,
       por el aire. En el paso (s) las dos piernas van casi rectas; en la zancada (b), la de atrás */
    var ZF = 80;
    function zancada(pel, t, extra) { return sobre({ pel: pel, pi: { suelo: [10, ZF], abre: 4, polo: [0.05, 0.3, 1] }, pd: { suelo: [-10, 0], abre: 4, talon: t, polo: [-0.05, 0.3, 1] } }, extra || {}); }
    function pasoAlFrente(extra) { return sobre({ pel: [0, PIE - 1.5, 12], pi: { a: [10, 20, 40], polo: [0, 0.3, 1] }, ti: { punta: [0, -0.17, 0.985], arriba: [0, 0.985, 0.17] }, pd: { suelo: [-10, 0], abre: 4, talon: 12 } }, extra || {}); }
    var P_PASO = [0, 78, 47], P_ZANCADA = [0, 72, 62];

    /* el flexor de la cadera, de pie, en zancada: de pie, con los pies a la anchura de la cadera, da un paso largo hacia delante con un pie;
       dobla la rodilla de delante mientras empuja hacia delante la cadera del otro lado, con el pecho erguido, y mantiene; y empuja con el
       pie de delante para volver a la posición de pie */
    COREO['estiramiento-flexor-cadera-de-pie'] = (function () {
      var P = { a0: sobre(JUNTOS, SUELTO), s1: pasoAlFrente(SUELTO), s: zancada(P_PASO, 30, SUELTO), b: zancada(P_ZANCADA, 55, sobre(SUELTO, { giro: [0, -2, 0], col: [-5, 0, 0] })) };
      var KD = ['td'];
      return {
        vista: [[76, 12], [122, 12]], isometrico: 'b', clavos: T2, zoom: 0.92,
        posturas: P, inicio: 'a0', encuadra: ['a0', 'b'],
        pasos: [{ sec: [['a0', 0.5, null, T2], ['s1', 0.55, 'entra', KD], ['s', 0.6, 'sale', KD]], desde: 'a0' }, { sec: [['b', 2.0, 'suave']], desde: 's' },
                { sec: [['b', 0.9], ['s', 0.8, 'empuje'], ['s1', 0.55, 'entra', KD], ['a0', 0.55, 'sale', KD]], desde: 'b' }]
      };
    })();

    /* la cadera, en zancada con giro de tronco: da un paso amplio hacia delante, sin que la rodilla pase de la punta del pie, y sube los
       brazos estirados por encima de la cabeza (por delante); al final de la zancada gira el tronco hacia el lado de la pierna adelantada;
       mantiene y cambia de pierna (vuelve, y da el paso con la otra) */
    COREO['estiramiento-cadera-zancada-giro'] = (function () {
      var P = { a0: sobre(JUNTOS, SUELTO), s1: alFrente(pasoAlFrente()), s: arriba(zancada(P_PASO, 30)), b: arriba(zancada(P_ZANCADA, 55)), g: arriba(zancada(P_ZANCADA, 55), { col: [0, 0, 36] }), am: alFrente(JUNTOS) };
      ['s1', 's', 'b', 'g'].forEach(function (n) { P[n + '2'] = espejo(P[n]); });
      var KD = ['td'], KI = ['ti'];
      return {
        vista: [[60, 12], [-34, 14]], isometrico: 'g', clavos: T2, zoom: 0.82,
        posturas: P, inicio: 'a0', encuadra: ['a0', 'g', 'g2'],
        pasos: [{ sec: [['a0', 0.4, null, T2], ['s1', 0.55, 'entra', KD], ['s', 0.55, 'sale', KD], ['b', 1.1, 'suave']], desde: 'a0' }, { sec: [['g', 1.7, 'suave']], desde: 'b' },
                { sec: [['g', 0.5], ['b', 0.8, 'suave'], ['s', 0.55, 'empuje'], ['s1', 0.45, 'entra', KD], ['am', 0.45, 'sale', KD], ['s12', 0.45, 'entra', KI], ['s2', 0.45, 'sale', KI], ['b2', 0.9, 'suave'], ['g2', 1.2, 'suave']], desde: 'g', dura: 6.6 }]
      };
    })();

    /* ── la zancada lateral ── */
    function alAire(g, cae) { var c = cae == null ? 0.14 : cae, k = Math.sqrt(1 - c * c), t = g * RAD; return { punta: [k * Math.sin(t), -c, k * Math.cos(t)], arriba: [c * Math.sin(t), k, c * Math.cos(t)] }; }
    var CINT = { b: EN_CINTURA, m: SUELTA };

    /* la ingle, en zancada lateral: de pie, con las piernas separadas y las manos en la cintura; da un paso largo hacia la derecha y dobla la
       rodilla derecha (queda sobre el pie), con el tronco y la cabeza mirando al frente y la pierna izquierda recta; mantiene, o baja un
       poco más; vuelve y cambia de lado */
    COREO['estiramiento-ingle-zancada-lateral'] = (function () {
      var R = 74, izq = { suelo: [15, 0], abre: 4 }, der = function (px) { return { suelo: [-R, 0], abre: 0, polo: [px, 0.1, 1] }; }, P = {};
      P.a = sobre(CINT, { pel: [0, PIE - 0.6, 0], pi: izq, pd: { suelo: [-15, 0], abre: 4 } });
      P.l = sobre(CINT, { pel: [-6, 84.6, 0], pi: izq, pd: { a: [-44, 16, 2], polo: [-0.2, 0.1, 1] }, td: alAire(0) });
      P.w = sobre(CINT, { pel: [-29.5, 77.4, 0], pi: izq, pd: der(-0.2) });
      /* la rodilla derecha, sobre su pie (se busca hacia dónde tira) */
      var baja = function (pel, inc) { var B = function (px) { return sobre(CINT, { pel: pel, giro: [0, inc, 0], pi: izq, pd: der(px) }); }; return B(busca(function (q) { return resolver(B(q)).d.rod[0]; }, -R, -0.9, 0.3)); };
      P.b = baja([-35.6, 74, -2], 5); P.c = baja([-44, 68, -3], 8);
      ['l', 'w', 'b', 'c'].forEach(function (n) { P[n + '2'] = espejo(P[n]); });
      var KI = ['ti'], KD = ['td'];
      return {
        vista: [[16, 12], [-58, 14]], isometrico: 'c', clavos: T2, zoom: 0.9,
        posturas: P, inicio: 'a', encuadra: ['a', 'c', 'c2'],
        pasos: ['a', { sec: [['l', 0.45, 'entra', KI], ['w', 0.45, 'sale', KI], ['b', 1.5, 'suave']], desde: 'a' },
                { sec: [['c', 1.1, 'suave'], ['c', 1.0], ['w', 0.9, 'empuje'], ['l', 0.45, 'entra', KI], ['a', 0.45, 'sale', KI], ['a', 0.2], ['l2', 0.45, 'entra', KD], ['w2', 0.45, 'sale', KD], ['b2', 1.2, 'suave']], desde: 'b' }]
      };
    })();

    /* la zancada lateral con rotación del tronco: de pie y erguido (las manos, en la cintura), da un paso con la pierna izquierda hacia el
       lado y baja en zancada lateral (la cadera va atrás y el tronco se inclina); lleva la mano derecha hacia la pantorrilla izquierda
       girando un poco el tronco hacia el interior del muslo; vuelve, repite con la misma pierna y cambia de lado. Se escribe con el paso
       hacia la derecha (como la zancada lateral de 79-gluteos.js) y se refleja */
    COREO['zancada-lateral-rotacion'] = (function () {
      var R = 74, izq = { suelo: [10, 0], abre: 0 }, der = function (px) { return { suelo: [-R, 0], abre: 0, polo: [px, 0.1, 1] }; }, D0 = {}, P = {};
      D0.a = sobre(CINT, { pel: [0, PIE - 0.2, 0], pi: izq, pd: { suelo: [-10, 0], abre: 0 } });
      D0.l = sobre(CINT, { pel: [-8, 84.3, 0], pi: izq, pd: { a: [-42, 16, 2], polo: [-0.2, 0.1, 1] }, td: alAire(0) });
      D0.w = sobre(CINT, { pel: [-32, 78.4, 0], pi: izq, pd: der(-0.2) });
      D0.h = sobre(CINT, { pel: [-46, 68, -12], giro: [0, 18, 0], cab: [-14, 0, 0], pi: sobre(izq, { polo: [0.3, 0.3, 1] }), pd: der(-0.3) });
      var B = function (px, extra) { return sobre(CINT, sobre({ pel: [-60, 51, -24], giro: [0, 38, 0], col: [3, 0, 0], cab: [-30, 0, 0], pi: sobre(izq, { polo: [0.3, 0.3, 1] }), pd: der(px) }, extra || {})); };
      var px = busca(function (q) { return resolver(B(q)).d.rod[0]; }, -R, -0.9, 0.3);
      D0.b = B(px);
      /* la mano izquierda, a la pantorrilla derecha, por dentro: se busca la inclinación del tronco que deja el hombro a un brazo de ella */
      var W = [-R + 9.4, 30, -1.5], Qr = function (cab) { return B(px, { giro: [0, cab, 0], col: [12, 0, -26], cab: [-cab * 0.5, -12, 0], bi: { a: W, polo: [1, 0.2, -0.6] } }); };
      var r0 = Qr(busca(function (cab) { return largo(menos(resolver(Qr(cab)).i.hom, W)); }, L_BRAZO - 0.7, 30, 88));
      D0.r = sobre(r0, { mi: manoHacia(r0, 'i', [0, -1, 0.1], [-1, 0, 0], 'abierta') });
      ['a', 'l', 'w', 'h', 'b', 'r'].forEach(function (n) { P[n] = espejo(D0[n]); P[n + '2'] = D0[n]; });
      var KD = ['td'], KI = ['ti'];
      var baja = function (q, K) { return [['l' + q, 0.4, 'entra', K], ['w' + q, 0.4, 'sale', K], ['h' + q, 0.5, 'suave']]; }, sube = function (q, K) { return [['h' + q, 0.7, 'empuje'], ['l' + q, 0.45, 'entra', K], ['a', 0.4, 'sale', K]]; };
      return {
        vista: [[-22, 14], [58, 12]], rastro: 'pel', isometrico: 'r', clavos: T2, zoom: 0.9,
        posturas: P, inicio: 'a', encuadra: ['a', 'r', 'r2'],
        pasos: [{ sec: [['a', 0.4]].concat(baja('', KD), [['b', 1.1, 'freno']]), desde: 'a' }, { sec: [['r', 1.6, 'suave']], desde: 'b' },
                { sec: [['r', 0.4]].concat(sube('', KD), [['a', 0.15]], baja('', KD), [['r', 1.1, 'freno'], ['r', 0.5]], sube('', KD), [['a', 0.15]], baja('2', KI), [['r2', 1.1, 'freno']]), desde: 'r', dura: 9.4 }]
      };
    })();

    /* ══════════════════════════════ CON UNA PARED O UN ESCALÓN ══════════════════════════════ */
    /* la misma postura tras dar media vuelta sobre el sitio: todo lo dicho en el mundo gira 180° sobre la vertical. Con espejo, es la
       postura del otro lado junto a la misma pared (o el mismo escalón), que no se mueven: girada(espejo(P)) */
    function girada(P) {
      var R = {}, k, v = function (a) { return [-a[0], a[1], -a[2]]; };
      for (k in P) R[k] = P[k];
      if (P.pel) R.pel = v(P.pel);
      R.giro = [((P.giro && P.giro[0]) || 0) + 180, (P.giro && P.giro[1]) || 0, (P.giro && P.giro[2]) || 0];
      ['b', 'bi', 'bd', 'p', 'pi', 'pd', 'm', 'mi', 'md', 't', 'ti', 'td'].forEach(function (q) {
        var a = P[q], n = {}, j; if (!a) return;
        for (j in a) n[j] = a[j];
        if (a.suelo) n.suelo = [-a.suelo[0], -a.suelo[1]];
        if (a.rumbo != null) n.rumbo = a.rumbo + 180;
        if (a.a && !a.en) n.a = v(a.a);
        if (a.polo && !a.en) n.polo = v(a.polo);
        ['punta', 'arriba', 'palma', 'dedos', 'barra'].forEach(function (c) { if (a[c]) n[c] = v(a[c]); });
        R[q] = n;
      });
      return R;
    }
    function otroLado(P) { return girada(espejo(P)); }

    /* el lateral de la cadera, con las piernas cruzadas: de pie junto a una pared (a su derecha), apoya en ella la mano de ese lado y cruza
       la pierna izquierda sobre la derecha a la altura de los tobillos (el pie pasa por delante del otro); estira el brazo izquierdo por
       encima de la cabeza, alargándolo hacia el lado derecho (la cadera izquierda sale hacia fuera); mantiene y cambia de lado: descruza,
       suelta la pared, da media vuelta (la pared le queda a la izquierda) y repite con la otra pierna y el otro brazo.
       Con los pies cruzados y las dos piernas rectas, la pelvis se ladea: baja del lado de la pierna que cruza (se busca cuánto); la
       columna lo deshace y el tronco queda derecho (o inclinado lo que se diga) */
    COREO['estiramiento-banda-iliotibial-de-pie'] = (function () {
      var XW = 56, WM = [-(XW - ALTO_MUN), 112, 9], P = {}, der = { suelo: [-10, 0], abre: 4 }, libre = { bi: aLosLados(8), mi: SUELTA }, POLO_D = [-0.3, -1, -0.5];
      var enPared = function (Q, cerca) { var R = sobre(Q, { bd: { a: WM, polo: POLO_D } }); return sobre(R, { md: posada(R, 'd', [0, 1, 0], [-1, 0, 0], cerca) }); };
      P.p0 = sobre(JUNTOS, SUELTO);
      P.n = sobre(JUNTOS, sobre(libre, { bd: { a: [-29, 96, 9], polo: POLO_D }, md: SUELTA }));
      var h00 = sobre(JUNTOS, sobre(libre, { bd: { a: [WM[0] + 13, WM[1] - 3, WM[2]], polo: POLO_D } }));
      P.h0 = sobre(h00, { md: manoHacia(h00, 'd', [0, 1, 0], [-1, 0, 0], 'abierta', 0) });
      P.h = enPared(sobre(JUNTOS, libre), P.h0.md.prono);
      /* cruzada: la pelvis, en px; el pie izquierdo, al otro lado del derecho y algo por delante, con el talón «t» grados arriba; el tronco,
         inclinado «lado» grados hacia la pared */
      var cruzada = function (px, t, lado, extra) {
        var Q = function (r) {
          var c = Math.cos(r * RAD), dx = px - 10 * c + 10;
          return sobre({ pel: [px, D.tobillo + Math.sqrt(77.7 * 77.7 - dx * dx) - 10 * Math.sin(r * RAD), 0], giro: [0, 0, r], col: [0, -r - lado, 0], pd: der, pi: { suelo: [-21, 14], abre: 0, talon: t, polo: [-0.25, 0.1, 1] } }, extra || {});
        };
        return Q(busca(function (r) { var L = resolver(Q(r)).i; return largo(menos(L.cad, L.tob)); }, 77.5, 0, 35));
      };
      /* de camino: el pie izquierdo pasa por delante de la punta del derecho, por el aire */
      P.xm = enPared(sobre(libre, { pel: [-4, PIE - 0.6, 0], pd: der, pi: { a: [-3, 17, 25], polo: [-0.1, 0.1, 1] }, ti: { punta: [-0.2, -0.1, 0.975], arriba: [0, 0.995, 0.1] } }), P.h.md.prono);
      P.x = enPared(cruzada(-9, 8, 0, libre), P.h.md.prono);
      /* el brazo de fuera, estirado hacia «d» (en el mundo) con la palma al frente */
      var conBrazo = function (Q, d, polo) {
        var h = resolver(Q).i.hom, u = unidad(d), R = enPared(sobre(Q, { bi: { a: mas(h, por(u, L_BRAZO - 1.2)), polo: polo } }), P.h.md.prono);
        return sobre(R, { mi: manoHacia(R, 'i', u, [0.05, 0, 1], 'abierta') });
      };
      P.e = conBrazo(cruzada(-5, 8, 24, { hom: { i: [3, 0], d: [0, 0] } }), [-0.62, 0.78, 0.05], [0.6, 0.2, -0.7]);
      /* y sube por el costado (xe: a media inclinación, el brazo en cruz y algo arriba): de colgar a por encima de la cabeza de un
         tirón, el camino más corto pasaba por detrás de la espalda y el antebrazo cruzaba la cabeza (12 cm dentro) */
      P.xe = conBrazo(cruzada(-7, 8, 11, { hom: { i: [1.5, 0], d: [0, 0] } }), [0.86, 0.5, 0.06], [0.1, -0.5, -0.85]);
      ['p0', 'n', 'h0', 'h', 'xm', 'x', 'xe', 'e'].forEach(function (q) { P[q + 'g'] = otroLado(P[q]); });
      var KD = ['td'], KM = ['td', 'md'], K3 = ['ti', 'td', 'md'], KMg = ['ti', 'mi'], K3g = ['ti', 'td', 'mi'];
      var vuelta = mediaVuelta(P, 'v', 1.3, SUELTO, 'p0g');
      return {
        vista: [[28, 12], [-38, 14]], isometrico: 'e', clavos: K3, clavosEn: { p0: T2 }, zoom: 0.9,
        material: [['pared', { x: -XW, z: 0, normal: [1, 0, 0], ancho: 150 }]],
        posturas: P, inicio: 'p0', encuadra: ['p0', 'e', 'eg'],
        pasos: [{ sec: [['p0', 0.4, null, T2], ['n', 0.4, 'entra', T2], ['h0', 0.4, 'lineal', T2], ['h', 0.3, 'sale', T2], ['xm', 0.5, 'entra', KM], ['x', 0.6, 'sale', KM]], desde: 'p0' },
                { sec: [['xe', 1.1, 'entra'], ['e', 1.2, 'sale']], desde: 'x' },
                { sec: [['e', 0.5, null, K3], ['xe', 0.45, 'entra', K3], ['x', 0.45, 'sale', K3], ['xm', 0.35, 'entra', KM], ['h', 0.35, 'sale', KM], ['h0', 0.25, 'entra', T2], ['n', 0.25, 'lineal', T2], ['p0', 0.25, 'sale', T2]].concat(vuelta,
                    [['ng', 0.25, 'entra', T2], ['h0g', 0.25, 'lineal', T2], ['hg', 0.25, 'sale', T2], ['xmg', 0.4, 'entra', KMg], ['xg', 0.45, 'sale', KMg], ['xeg', 0.7, 'entra', K3g], ['eg', 0.8, 'sale', K3g]]), desde: 'e', dura: 7.8 }]
      };
    })();

    /* los aductores, con la pierna en un escalón: de pie, de lado a un escalón (queda a su izquierda; las manos, en la cintura), apoya en
       él una pierna estirada; inclina el tronco hacia el lado de esa pierna; mantiene y cambia de pierna: baja el pie, da media vuelta
       (el escalón le queda a la derecha) y sube la otra */
    COREO['estiramiento-aductores-escalon'] = (function () {
      var H = 20, XA = 60.5, der = { suelo: [-10, 0], abre: 4 }, P = {};
      P.a0 = sobre(JUNTOS, CINT);
      P.u = sobre(CINT, { pel: [-3, PIE - 0.6, 0], pd: der, pi: { a: [35, 38, 3], polo: [0.5, 0.1, 1] }, ti: { punta: [0.1, -0.1, 0.99], arriba: [0, 0.995, 0.1] } });
      P.a = sobre(CINT, { pel: [-1, 85.7, 0], pd: der, pi: { suelo: [XA, 0], alto: H, abre: 6, polo: [0.3, 0.2, 1] } });
      P.b = sobre(P.a, { col: [0, 27, 0], giro: [0, 0, 3] });
      ['a0', 'u', 'a', 'b'].forEach(function (q) { P[q + 'g'] = otroLado(P[q]); });
      var KD = ['td'], KI = ['ti'], vuelta = mediaVuelta(P, 'v', 1.3, CINT, 'a0g');
      return {
        vista: [[16, 12], [-62, 14]], isometrico: 'b', clavos: T2, zoom: 0.92,
        material: [['escalon', { med: [36, H, 60], en: [XA + 3, 0] }]],
        posturas: P, inicio: 'a0', encuadra: ['a0', 'b', 'bg'],
        pasos: [{ sec: [['a0', 0.4, null, T2], ['u', 0.6, 'entra', KD], ['a', 0.6, 'sale', KD]], desde: 'a0' }, { sec: [['b', 2.1, 'suave']], desde: 'a' },
                { sec: [['b', 0.6], ['a', 0.8, 'suave'], ['u', 0.5, 'entra', KD], ['a0', 0.45, 'sale', KD]].concat(vuelta, [['ug', 0.5, 'entra', KI], ['ag', 0.5, 'sale', KI], ['bg', 1.3, 'suave']]), desde: 'b', dura: 6.4 }]
      };
    })();

    /* el gemelo, con el talón fuera del escalón: un escalón junto a una pared (delante); sube a él: todo el pie derecho, apoyado; el
       izquierdo, en el borde de atrás, apoyado solo en la parte delantera y con el talón en el aire; apoya las yemas de los dedos en la
       pared para mantener el equilibrio; baja despacio el talón de atrás hacia el suelo mientras dobla la rodilla de delante (la pierna
       de atrás sigue recta) y mantiene; y cambia de lado: el pie de atrás entra entero y el otro retrocede al borde */
    COREO['estiramiento-gemelo-escalon'] = (function () {
      var H = 20, FONDO = 34, ZB = 27, ZP = ZB + FONDO + 6, P = {};        /* el escalón, de z = ZB a ZB + FONDO; la pared, 6 cm más allá */
      var entero = function (x) { return { suelo: [x, ZB + 7], alto: H, abre: 3 }; };                                  /* el talón, a 1 cm del borde */
      var borde = function (x, t) { return { suelo: [x, ZB + 3.5 - D.bola], alto: H, abre: 2, talon: t }; };          /* la bola, 3,5 cm dentro */
      var alto = function (y, punta) { var c = punta || 0; return { punta: [0, -Math.sin(c * RAD), Math.cos(c * RAD)], arriba: [0, Math.cos(c * RAD), Math.sin(c * RAD)] }; };
      P.p0 = sobre(SUELTO, { pel: [0, PIE, ZB - 30], p: { suelo: [10, ZB - 30], abre: 4 } });
      P.r1 = sobre(SUELTO, { pel: [1.5, PIE - 0.5, ZB - 28], pi: { suelo: [10, ZB - 30], abre: 4 }, pd: { a: [-9, 34, ZB - 11], polo: [0, 0.2, 1] }, td: alto(0, 6) });
      P.r2 = sobre(SUELTO, { pel: [0, PIE + 1, ZB - 20], pi: { suelo: [10, ZB - 30], abre: 4, talon: 25 }, pd: entero(-9) });
      P.l1 = sobre(SUELTO, { pel: [-2.5, PIE + 16, ZB - 3], pd: entero(-9), pi: { a: [9, 33.5, ZB - 22], polo: [0, 0.2, 1] }, ti: alto(0, 10) });
      var arriba_ = function (extra) { return sobre({ pel: [0, 105.2, ZB - 1], pd: entero(-9), pi: borde(9, 8) }, extra); };
      P.e = arriba_(SUELTO);
      /* las yemas, en la pared: la mano, en tienda, con los dedos hacia arriba y algo hacia la pared; la muñeca, a la distancia que deja
         las yemas en ella (se busca) */
      var yemas = function (Q, y) {
        var con = function (z) { var R = sobre(Q, { b: { a: [16, y, z], polo: [0.5, -1, -0.3] } }); return sobre(R, { mi: manoHacia(R, 'i', [0, 0.94, 0.34], [0, -0.34, 0.94], 'yemas', 0), md: manoHacia(R, 'd', [0, 0.94, 0.34], [0, -0.34, 0.94], 'yemas', 0) }); };
        return con(busca(function (z) { var E = resolver(con(z)); return manoAPlano(E.i, E.S.m.i, [0, 0, ZP], [0, 0, -1]); }, -0.15, ZP - 18, ZP - 4));
      };
      P.y = yemas(arriba_({}), 128);
      /* de camino: las manos suben por delante (m) y se ponen ante la pared, ya en tienda (v), antes de tocarla */
      P.m = sobre(arriba_({}), { b: { a: [17, 110, ZB + 12], polo: [0.5, -1, -0.3] }, m: { tipo: 'suelta', prono: 20 } });
      P.v = sobre(P.y, { b: { a: [16, 126, P.y.b.a[2] - 9], polo: [0.5, -1, -0.3] } });
      /* el talón de atrás, abajo (la pierna, recta: la cadera baja lo que eso pide) y la rodilla de delante, doblada */
      var Qf = function (yy) { return { pel: [0, yy, ZB + 3], pd: entero(-9), pi: borde(9, -24) }; };
      var yf = busca(function (yy) { var L = resolver(Qf(yy)).i; return largo(menos(L.cad, L.tob)); }, 77.6, 90, 104);
      P.f = yemas(Qf(yf), 126);
      /* el cambio: el pie de atrás entra entero (c1, por el aire; c2, los dos apoyados) y el otro retrocede al borde (c3) */
      P.c1 = yemas({ pel: [-1.5, 105, ZB + 2], pd: entero(-9), pi: { a: [9, 33, ZB - 1], polo: [0, 0.2, 1] }, ti: alto(0, 4) }, 128);
      P.c2 = yemas({ pel: [0, 105.3, ZB + 6], pd: entero(-9), pi: entero(9) }, 128);
      ['e', 'y', 'f', 'c1'].forEach(function (q) { P[q + '2'] = espejo(P[q]); });
      var KI = ['ti'], KD = ['td'], M2 = ['mi', 'md'], K4 = T2.concat(M2);
      return {
        vista: [[108, 10], [152, 14]], isometrico: 'f', clavos: K4, clavosEn: { p0: T2, e: T2 }, zoom: 0.9,
        material: [['escalon', { med: [70, H, FONDO], en: [0, ZB + FONDO / 2] }], ['pared', { z: ZP, normal: [0, 0, -1], ancho: 130 }]],
        posturas: P, inicio: 'p0', encuadra: ['p0', 'e', 'f'],
        pasos: [{ sec: [['p0', 0.5, null, T2], ['r1', 0.5, 'entra', KI], ['r2', 0.5, 'sale', KI], ['r2', 0.15, null, T2], ['l1', 0.6, 'entra', KD], ['e', 0.6, 'sale', KD]], desde: 'p0' },
                { sec: [['m', 0.7, 'entra', T2], ['v', 0.6, 'lineal', T2], ['y', 0.4, 'sale', T2]], desde: 'e' },
                { sec: [['f', 1.8, 'suave'], ['f', 1.3], ['y', 0.8, 'suave'], ['c1', 0.3, 'entra', KD.concat(M2)], ['c2', 0.3, 'sale', KD.concat(M2)], ['c12', 0.3, 'entra', KI.concat(M2)], ['y2', 0.3, 'sale', KI.concat(M2)], ['f2', 1.5, 'suave']], desde: 'y' }]
      };
    })();

    /* ══════════════════════════════ CON UNA RODILLA EN EL SUELO ══════════════════════════════ */
    /* la rodilla izquierda, en el suelo bajo la cadera (su centro, a YK: 5,5 en el suelo, como en los demás bloques; más, sobre un cojín), con el empeine
       apoyado detrás; el pie derecho, delante. La cadera gira sobre esa rodilla: en(z) (como en 78-cuadriceps.js). k: de rodillas;
       rb, r: el pie derecho, por el aire, de atrás adelante */
    function conRodilla(YK) {
      var S = { atras: { a: [10, 3.6, -Math.sqrt(D.pierna * D.pierna - (YK - 3.6) * (YK - 3.6))], polo: [0.1, -1, 0.6] }, PIE_AT: { punta: [0, -0.04, -1], arriba: [0, -1, 0.04] },
        delante: { suelo: [-10, 40], abre: 3, polo: [-0.05, 1, 0.3] }, K: [YK, 0] };
      S.en = function (z, extra) { return sobre({ pel: [0, YK + Math.sqrt(1600 - z * z), z], pi: S.atras, ti: S.PIE_AT, pd: S.delante }, extra || {}); };
      S.k = function (extra) { return sobre({ pel: [0, YK + 40, 0], p: S.atras, t: S.PIE_AT }, extra || {}); };
      S.r = function (extra) { return sobre({ pel: [0, YK + 40, 0], pi: S.atras, ti: S.PIE_AT, pd: { a: [-10, 23, 9], polo: [-0.1, 0.4, 1] }, td: { punta: [0, -0.34, 0.94], arriba: [0, 0.94, 0.34] } }, extra || {}); };
      S.rb = function (extra) { return sobre({ pel: [0, YK + 40, 0], pi: S.atras, ti: S.PIE_AT, pd: { a: [-10, 24, -27], polo: [-0.1, -0.2, 1] }, td: { punta: [0, -0.77, -0.64], arriba: [0, -0.64, 0.77] } }, extra || {}); };
      return S;
    }
    var FLOJOS = { b: aLosLados(10), m: SUELTA };

    /* la movilidad de tobillo, con una rodilla en el suelo: una rodilla en el suelo y el otro pie apoyado delante; lleva el tronco, la
       cadera y la rodilla de delante por encima del pie adelantado todo lo que puede (el talón no se despega); vuelve, repite y cambia
       de pierna: recoge el pie de delante, queda de rodillas y adelanta el otro */
    COREO['movilidad-tobillo-semi-rodillas'] = (function () {
      var S = conRodilla(5.5), P = {};
      P.a = S.en(0, FLOJOS); P.b = S.en(20, sobre(FLOJOS, { giro: [0, 9, 0], cab: [-6, 0, 0] }));
      P.k = S.k(FLOJOS); P.r = S.r(FLOJOS); P.rb = S.rb(FLOJOS);
      ['a', 'b', 'r', 'rb'].forEach(function (n) { P[n + '2'] = espejo(P[n]); });
      var ida = porArco(P, 'ab', P.a, P.b, 'b', 1, 1.9, S.K), vuelve = porArco(P, 'ba', P.b, P.a, 'a', 1, 1.2, S.K), otra = porArco(P, 'ac', P.a, P.b, 'b', 1, 1.4, S.K), ida2 = porArco(P, 'ab2', P.a2, P.b2, 'b2', 1, 1.4, S.K);
      return {
        vista: [[-74, 12], [-26, 16]], rastro: 'rd', isometrico: 'b', clavos: T2,                 /* sin esterilla: su ficha no pide material */
        posturas: P, inicio: 'a', encuadra: ['a', 'b'],
        pasos: ['a', { sec: ida, desde: 'a' },
                { sec: [['b', 0.3]].concat(vuelve, otra, [['b', 0.4]], vuelve, [['r', 0.34, 'entra'], ['rb', 0.3, 'lineal'], ['k', 0.3, 'sale'], ['rb2', 0.3, 'entra'], ['r2', 0.3, 'lineal'], ['a2', 0.46, 'sale']], ida2), desde: 'b', dura: 8.0 }]
      };
    })();

    /* la cadera, de rodillas, con giro de tronco: de rodillas, adelanta un pie y lo apoya en el suelo, con la rodilla de la otra pierna
       sobre un cojín; con los brazos por encima de la cabeza (suben por los lados: por delante rozarían el muslo adelantado), gira el tronco hacia el lado de la pierna adelantada,
       con la espalda recta; mantiene y cambia de pierna (sin bajar los brazos: recoge el pie, queda de rodillas y adelanta el otro) */
    COREO['estiramiento-cadera-rodillas-giro'] = (function () {
      var S = conRodilla(8.9), P = {};
      P.k = S.k(FLOJOS); P.rb = S.rb(FLOJOS); P.r = S.r(FLOJOS); P.a = S.en(0, FLOJOS);
      P.am = manos(S.en(0, { b: aTorax(D.hombroX + 44, HY + 12, 2, [0, -1, -0.4]) }), [0.94, 0.34, 0], [0, 0, 1]); P.u = arriba(S.en(0)); P.g = arriba(S.en(0), { col: [0, 0, -36] });
      P.ru = arriba(S.r()); P.rbu = arriba(S.rb()); P.ku = arriba(S.k());
      ['u', 'g', 'ru', 'rbu'].forEach(function (n) { P[n + '2'] = espejo(P[n]); });
      return {
        vista: [[-52, 12], [36, 14]], isometrico: 'g', clavos: T2, zoom: 0.9, material: [['esterilla', { en: [0, -3], med: [48, 5, 30] }]],
        posturas: P, inicio: 'k', encuadra: ['k', 'g', 'g2'],
        pasos: [{ sec: [['k', 0.6], ['rb', 0.4, 'entra'], ['r', 0.35, 'lineal'], ['a', 0.5, 'sale']], desde: 'k' }, { sec: [['am', 0.9, 'entra'], ['u', 1.0, 'sale'], ['u', 0.2], ['g', 1.5, 'suave']], desde: 'a' },
                { sec: [['g', 0.5], ['u', 0.8, 'suave'], ['ru', 0.34, 'entra'], ['rbu', 0.3, 'lineal'], ['ku', 0.3, 'sale'], ['rbu2', 0.3, 'entra'], ['ru2', 0.3, 'lineal'], ['u2', 0.46, 'sale'], ['g2', 1.3, 'suave']], desde: 'g', dura: 5.6 }]
      };
    })();

    /* ══════════════════════════════ TUMBADO BOCA ARRIBA ══════════════════════════════
       En el suelo, con la cabeza hacia −Z (SUPINO_SUELO: la cadera, en z = 20). Como en 7b-abdomen.js y 79-gluteos.js */
    var K4 = T2.concat(['mi', 'md']), NADA = [], M2 = ['mi', 'md'];
    var EN_SUELO_PIERNA = -2.3, TENDIDAS = { e: EN_SUELO_PIERNA, z: 0, c: 0 }, PIES_PUENTE = { suelo: [11, 62], abre: 4, polo: [0.1, 1, 0.2] };
    var AL_LADO = { b: { a: [26, ALTO_MUN, 18], polo: [1, -0.3, 0] }, m: EN_SUELO }, ABIERTOS = { b: { a: [60, ALTO_MUN, -6], polo: [0, 0.3, 1] }, m: apoyada([0.94, 0, 0.34]) };
    /* la pelvis, girada «g» grados hacia las costillas (la zona lumbar se aplana contra el suelo; con g negativo, se arquea), con la
       columna doblada lo mismo: los hombros de «a» no se mueven del suelo */
    function enrollado(a, g, extra) {
      var Sa = resolver(a).i.hom, P = sobre(a, sobre({ giro: [0, -90 - g, 0], col: [g, 0, 0] }, extra || {}));
      return sobre(P, { pel: mas(a.pel, menos(Sa, resolver(P).i.hom)) });
    }
    var SOBRE_ABDOMEN = { b: { a: [8, 5, 14.5], en: 'torax', polo: [0.8, -0.7, -0.5] }, m: { tipo: 'plana', prono: 70 } };
    /* las manos, juntas detrás del muslo izquierdo, a «s» cm de la cadera (por su cara de atrás) */
    function trasMuslo(P, s) {
      var L = resolver(P).i, u = unidad(menos(L.rod, L.cad)), c = mas(L.cad, mas(por(u, s), por(L.frenteMuslo, -8.6)));
      var Q = conAgarre(sobre(P, { m: { tipo: 'puno', prono: 0 } }), [c[0] + 4.4, c[1], c[2]], [1, 0.1, 0.3], 'bi');
      return conAgarre(Q, [c[0] - 4.4, c[1], c[2]], [-1, 0.5, -0.1], 'bd');
    }

    /* el flexor de la cadera, tumbado: boca arriba, con las piernas estiradas en el suelo; dobla una rodilla, sujeta con las manos la parte
       de atrás del muslo (para alcanzarlo despega un momento la cabeza y los hombros) y lleva la rodilla hacia el pecho; la otra pierna
       sigue estirada en el suelo; y se queda quieto, sin rebotes */
    COREO['estiramiento-flexor-cadera-tumbado'] = (function () {
      var P = {}, sube = function (e, c, extra) { return sobre(SUPINO_SUELO, sobre(extra || {}, { pi: { e: e, z: 0, c: c }, ti: { tob: 6 }, pd: TENDIDAS, td: { tob: 8 } })); };
      /* las manos descansan sobre el abdomen: de ahí van al muslo sin cruzarse con nada (desde el suelo, a los lados, rozaban el muslo que sube) */
      P.t = sobre(SUPINO_SUELO, sobre(SOBRE_ABDOMEN, { p: TENDIDAS, t: { tob: 8 } }));
      P.k = sube(84, 96, SOBRE_ABDOMEN);
      var h0 = sobre(sube(100, 104, { col: [12, 0, 0], cab: [6, 0, 0] }), { m: { tipo: 'suelta', prono: 0 } });
      P.h = conAgarre(conAgarre(h0, [23, 34, 16], [1, 0.1, 0.3], 'bi'), [-3, 31, 18], [-1, 0.5, -0.1], 'bd');
      P.g = trasMuslo(sube(104, 106, { col: [14, 0, 0], cab: [7, 0, 0] }), 28);
      P.e = trasMuslo(sube(128, 122, { col: [2, 0, 0] }), 28);
      return {
        vista: [[62, 20], [20, 32]], isometrico: 'e', clavos: NADA,
        posturas: P, inicio: 't', encuadra: ['t', 'e'],
        pasos: ['t', { sec: [['k', 1.0, 'suave'], ['h', 0.5, 'entra'], ['g', 0.5, 'sale'], ['e', 1.3, 'suave']], desde: 't' }, 'e']
      };
    })();

    /* la cadera, dejando caer una rodilla: boca arriba, con las piernas juntas, las rodillas dobladas y los pies apoyados (los brazos, a los
       lados; los dos hombros, en el suelo); baja despacio una rodilla hacia el lado, hasta donde le resulte cómodo, con los pies juntos
       (el pie rueda sobre su canto de fuera) y sin mover la otra pierna; mantiene, sube la rodilla despacio y repite con la otra */
    COREO['estiramiento-cadera-rodilla-al-lado'] = (function () {
      var pies = { suelo: [3.7, 54], abre: 0, polo: [0, 1, 0.2] }, a = sobre(SUPINO_SUELO, sobre(AL_LADO, { p: pies }));
      /* la rodilla izquierda, «ang» grados sobre el suelo; el pie, rodado «ro» grados sobre su canto de fuera (el tobillo, a la altura que
         deja la zapatilla posada) */
      var cae = function (ang, ro) {
        var c = Math.cos(ro * RAD), s_ = Math.sin(ro * RAD), con = function (y) { return sobre(a, { pi: { a: [3.7 + 2.2 * s_, y, 54], polo: [Math.cos(ang * RAD), Math.sin(ang * RAD), 0.2] }, ti: { punta: [0, 0, 1], arriba: [s_, c, 0] } }); };
        return con(busca(function (y) { return bajoZapa(resolver(con(y)).i, 'i'); }, -0.2, 3, 12));
      };
      var m = cae(62, 22), b = cae(33, 50);
      return {
        vista: [[30, 26], [-40, 34]], rastro: 'ri', isometrico: 'b', clavos: K4,
        posturas: { a: a, m: m, b: b, m2: espejo(m), b2: espejo(b) }, inicio: 'a', encuadra: ['a', 'b', 'b2'],
        pasos: ['a', { sec: [['m', 1.2, 'entra'], ['b', 1.3, 'sale']], desde: 'a' }, { sec: [['b', 0.8], ['m', 0.8, 'entra'], ['a', 0.8, 'sale'], ['m2', 0.9, 'entra'], ['b2', 1.0, 'sale']], desde: 'b' }]
      };
    })();

    /* la mariposa, tumbado: boca arriba, relajado, con las rodillas dobladas y abiertas y las plantas de los pies juntas; empuja la zona
       lumbar contra el suelo (la pelvis gira hacia las costillas) y mantiene; relaja y repite */
    COREO['mariposa-tumbado'] = (function () {
      var ZF = 62, CANTO = { punta: [0, 0.1, 0.995], arriba: [1, 0, 0] };
      var con = function (y) { return sobre(SUPINO_SUELO, sobre(AL_LADO, { p: { a: [8, y, ZF], polo: [Math.cos(27 * RAD), Math.sin(27 * RAD), 0.15] }, t: CANTO })); };
      var a = con(busca(function (y) { return bajoZapa(resolver(con(y)).i, 'i'); }, -0.2, 3, 12)), b = enrollado(a, 9);
      return {
        vista: [[56, 24], [8, 36]], esfuerzo: [0, 1], clavos: K4,
        posturas: { a: a, b: b }, inicio: 'a', encuadra: ['a'],
        rep: [['b', 1.1, 'suave'], ['b', 1.5], ['a', 1.1, 'suave'], ['a', 0.8]],
        pasos: ['a', { sec: [['b', 1.4, 'suave']], desde: 'a' }, { rep: 2.6 }]
      };
    })();

    /* la báscula pélvica: boca arriba, con las rodillas dobladas y los pies apoyados; relaja el abdomen para arquear la zona lumbar,
       separándola del suelo; después aprieta el abdomen y los glúteos para aplanarla contra el suelo; relaja y vuelve */
    COREO['bascula-pelvica-tumbado'] = (function () {
      /* arqueada: la pelvis gira 9° sobre sí misma, sin bajar (con los hombros clavados a su altura, lo que sube la zona lumbar lo tendría
         que bajar la pelvis, y se hundiría en el suelo), y la columna se extiende algo más (12°): las costillas se levantan un poco por
         abajo y los hombros quedan a menos de 1 cm de donde estaban */
      var a = sobre(SUPINO_SUELO, sobre(AL_LADO, { p: PIES_PUENTE })), b = sobre(a, { giro: [0, -81, 0], col: [-12, 0, 0], cab: [3, 0, 0] }), c = enrollado(a, 9);
      return {
        vista: [[78, 14], [34, 26]], rastro: 'abdomen', clavos: K4, zoom: 1.08,
        posturas: { a: a, b: b, c: c }, inicio: 'a', encuadra: ['a'],
        pasos: ['a', { sec: [['b', 1.7, 'suave']], desde: 'a' }, { sec: [['a', 0.9, 'entra'], ['c', 1.0, 'sale']], desde: 'b' }, { sec: [['c', 0.9], ['a', 1.5, 'suave']], desde: 'c' }]
      };
    })();

    /* ── rodado ── boca arriba, con la pelvis rodada «rho» grados hacia su izquierda sobre la cadera de ese lado (que no se mueve del suelo);
       la columna gira lo mismo al revés (se busca) y el pecho sigue mirando al techo; el tronco baja de la pelvis a los hombros, que
       siguen a su altura (tau, se busca). Como la rotación de rodillas de 7b-abdomen.js. Con «giro» no se puede decir (boca arriba,
       rumbo y alabeo giran lo mismo): va con «base» */
    function rodado(a, rho, extra) {
      var sr = Math.sin(rho * RAD), cr = Math.cos(rho * RAD), y0 = resolver(a).i.hom[1];
      var G = function (tau) {
        var Q = function (tw) { return sobre(a, sobre({ pel: [a.pel[0] + D.caderaX * (1 - cr), 11.5 + (D.caderaX - 0.9) * sr, a.pel[2]], base: baseEjes([0, -Math.sin(tau * RAD), -Math.cos(tau * RAD)], [sr, cr, 0]), col: [0, 0, tw], cab: [tau * 1.3, 0, 0] }, extra || {})); };
        return Q(busca(function (tw) { return aplicar(resolver(Q(tw)).Bt, [0, 0, 1])[0]; }, 0, -89, 89));
      };
      return rho ? G(busca(function (tau) { var E = resolver(G(tau)); return (E.i.hom[1] + E.d.hom[1]) / 2; }, y0, 0, 30)) : G(0);
    }
    /* el pie izquierdo, rodado «ro» grados sobre su canto de fuera, con el tobillo en [x, z] a la altura que deja la zapatilla posada */
    function pieRodado(Q, x, z, ro, polo) {
      var c = Math.cos(ro * RAD), s = Math.sin(ro * RAD), con = function (y) { return sobre(Q, { pi: { a: [x + 2.2 * s, y, z], polo: polo }, ti: { punta: [0.07, 0, 0.998], arriba: [s, c, 0] } }); };
      return con(busca(function (y) { return bajoZapa(resolver(con(y)).i, 'i'); }, -0.2, 3, 13));
    }

    /* la torsión con el tobillo sobre la rodilla: boca arriba, con las rodillas dobladas, como para hacer abdominales (los brazos, abiertos
       en el suelo), cruza un tobillo sobre la rodilla contraria (el derecho, sobre el muslo izquierdo, junto a la rodilla; sube primero la
       rodilla); gira con suavidad las piernas hacia un lado (el de la pierna de abajo, cuyo pie sigue apoyado: la pelvis rueda sobre esa
       cadera), con los hombros en el suelo; mantiene y cambia de lado */
    COREO['torsion-figura-cuatro-tumbado'] = (function () {
      var s = sobre(SUPINO_SUELO, sobre(ABIERTOS, { p: PIES_PUENTE })), P = { s: s };
      var con = function (rho) {
        var c = Math.cos(rho * RAD), sn = Math.sin(rho * RAD), Q = pieRodado(rodado(s, rho), 11, 62, rho * 0.55, [sn, c, 0.2]);
        var L = resolver(Q).i, u = unidad(menos(L.rod, L.cad)), lat = cruz(L.frenteMuslo, u);
        return sobre(Q, { pd: { a: mas(L.cad, mas(por(u, 31), mas(por(L.frenteMuslo, 11.8), por(lat, 1.5)))), polo: [-c + 0.15 * sn, sn + 0.15 * c, 0.3] }, td: { tob: 8 } });
      };
      P.k = sobre(s, { pd: { e: 104, z: 0, c: 110 }, td: { tob: 8 } });
      P.x = con(0); P.m = con(21); P.b = con(42);
      ['k', 'x', 'm', 'b'].forEach(function (n) { P[n + '2'] = espejo(P[n]); });
      var KI = ['ti', 'mi', 'md'], KD = ['td', 'mi', 'md'];
      return {
        vista: [[40, 26], [-34, 36]], rastro: 'rodillas', isometrico: 'b', clavos: KI, clavosEn: { s: K4 },
        posturas: P, inicio: 's', encuadra: ['s', 'b', 'b2'],
        pasos: [{ sec: [['s', 0.6, null, K4], ['k', 0.7, 'entra'], ['x', 0.8, 'sale']], desde: 's' }, { sec: [['m', 1.0, 'entra'], ['b', 1.1, 'sale']], desde: 'x' },
                { sec: [['b', 0.6], ['m', 0.55, 'entra'], ['x', 0.55, 'sale'], ['k', 0.45, 'entra'], ['s', 0.4, 'sale'], ['k2', 0.4, 'entra', KD], ['x2', 0.45, 'sale', KD], ['m2', 0.55, 'entra', KD], ['b2', 0.65, 'sale', KD]], desde: 'b', dura: 5.0 }]
      };
    })();

    /* la torsión de espalda con una rodilla cruzada: boca arriba, con las rodillas dobladas y los pies apoyados; sube una rodilla hacia el
       pecho y, con la mano del otro lado en su cara de fuera, la lleva cruzando el cuerpo hacia el suelo (la derecha, hacia su izquierda,
       con la mano izquierda), girando la espalda: la pelvis rueda sobre la cadera de ese lado y la otra rodilla cae con ella; estira el
       otro brazo hacia el lado y mantiene la parte alta de la espalda en el suelo mientras estira la otra pierna (la de abajo, por el
       suelo); y vuelve. La rodilla cruza a la altura de la cintura: más abajo (a la de la cadera) la mano no llega sin despegar el hombro */
    COREO['torsion-tumbado-una-rodilla'] = (function () {
      var a0 = sobre(SUPINO_SUELO, sobre(AL_LADO, { p: PIES_PUENTE })), a = sobre(a0, { mi: posada(a0, 'i', [0, 0, 1], [0, -1, 0]) }), P = { a: a }, BR_D = { bd: reflejo(AL_LADO.b), md: EN_SUELO };
      var mz = function (p, q, u) { return [p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u, p[2] + (q[2] - p[2]) * u]; };
      /* la mano izquierda, sobre la rodilla derecha, por su cara de fuera (que al cruzar queda hacia arriba): la muñeca, del lado del
         muslo, y los dedos, por delante de la rodilla. Va pasada la zona del muslo que el Director despeja (hasta 37 cm de la cadera) */
      var enRodilla = function (Q, cerca) {
        var E = resolver(Q), L = E.d, u = unidad(menos(L.rod, L.cad)), n = unidad(sinParte(mas(cruz(u, L.frenteMuslo), [-0.3, 0.9, 0]), u)), d = unidad(sinParte(mas(menos(L.rod, E.i.hom), por(L.frenteMuslo, 30)), n));
        var R = sobre(Q, { bi: { a: mas(L.rod, mas(por(n, 9.1), por(d, -4))), polo: [0.9, 0.4, -0.3] } });
        return sobre(R, { mi: manoHacia(R, 'i', d, por(n, -1), 'plana', cerca) });
      };
      /* rodado «rho»; la pierna de abajo (la izquierda), de doblada (v = 0) a estirada por el suelo (v = 1): el tobillo resbala de z = 60 a
         98,8 y el pie pasa de rodado sobre su canto a descansar en el talón; la de arriba (la derecha) cruza por encima: su tobillo
         descansa sobre el muslo de abajo (a 30 cm de la cadera, por su cara de arriba) y su rodilla tira hacia «polo» */
      var P0 = [0.07, 0, 0.998], A0 = [0.5, 0.866, 0], P1 = unidad([0.5, 0.82, 0.28]), A1 = unidad(sinParte([-0.2, 0.3, -1], P1));
      var con = function (rho, v, brazos) {
        var Q0 = rodado(a, rho, brazos), x1 = resolver(Q0).i.cad[0] + 0.5, pu = unidad(mz(P0, P1, v)), ar = unidad(sinParte(mz(A0, A1, v), pu));
        var Q = function (y) { return sobre(Q0, { pi: { a: [12.1 + (x1 - 12.1) * v, y, 60 + 38.8 * v], polo: mz([1, 0.06, 0.25], [0.6, 0.8, 0], v) }, ti: { punta: pu, arriba: ar } }); };
        var R = Q(busca(function (y) { return bajoZapa(resolver(Q(y)).i, 'i'); }, -0.2, 3, 14)), L = resolver(R).i, u = unidad(menos(L.rod, L.cad));
        return sobre(R, { pd: { a: mas(L.cad, mas(por(u, 30), por(unidad(sinParte([0, 1, 0], u)), 11.9))), polo: mz([35, -13, -13], [35, -17, -6], v) }, td: { tob: 8 } });
      };
      var ABIERTO_D = { bd: { a: [-60, ALTO_MUN, -6], polo: [0, 0.3, 1] }, md: apoyada([-0.94, 0, 0.34]) };
      P.b = enRodilla(con(52, 0, BR_D));
      /* de camino: la rodilla sube hacia el pecho (m1) mientras la mano se despega, plana (h0), y va a su encuentro (h); la coge cuando
         empieza a cruzar (m2) */
      var m20 = pieRodado(rodado(a, 26, BR_D), 11, 61, 15, [0.55, 0.85, 0.25]);
      P.m2 = enRodilla(sobre(m20, { pd: { e: 128, z: -24, g: 0, c: 106 }, td: { tob: 8 } }), P.b.mi.prono);
      var h00 = sobre(a, { bi: { a: [29, 10, 15], polo: [1, 0, -0.1] } });
      P.h0 = sobre(h00, { mi: manoHacia(h00, 'i', [0, 0, 1], [0, -1, 0], 'abierta', a.mi.prono), pd: { e: 60, z: 0, c: 100 }, td: { tob: 8 } });
      P.m1 = sobre(a, { pd: { e: 128, z: 0, g: 0, c: 108 }, td: { tob: 8 }, bi: { a: [16, 44, -4], polo: [0.9, 0.4, -0.3] }, mi: P.m2.mi });
      /* c: la pierna de abajo, estirada; la rodilla que cruza, hasta el suelo (rho = 62°); el brazo derecho, abierto (s1, s2: de camino) */
      var entre2 = function (v) {
        return enRodilla(con(52 + 10 * v, v,
          { bd: { a: mz(reflejo(AL_LADO.b).a, ABIERTO_D.bd.a, v), polo: mz([-1, -0.3, 0], [0, 0.3, 1], v) }, md: apoyada(unidad(mz([0, 0, 1], [-0.94, 0, 0.34], v))) }), P.b.mi.prono);
      };
      P.s1 = entre2(0.34); P.s2 = entre2(0.67); P.c = entre2(1);
      var KP = ['ti', 'md'], K3 = ['ti', 'td', 'md'];
      return {
        vista: [[34, 26], [-40, 36]], rastro: 'rd', isometrico: 'c', clavos: KP, clavosEn: { a: K4, c: KP },
        posturas: P, inicio: 'a', encuadra: ['a', 'b', 'c'],
        pasos: ['a', { sec: [['h0', 0.4, 'entra', KP], ['m1', 0.6, 'lineal', KP], ['m2', 0.6, 'lineal', KP], ['b', 0.8, 'sale', KP]], desde: 'a' },
                { sec: [['s1', 0.8, 'entra', KP], ['s2', 0.7, 'lineal', KP], ['c', 0.8, 'sale', KP]], desde: 'b' },
                { sec: [['c', 0.6, null, KP], ['s2', 0.5, 'entra', KP], ['s1', 0.45, 'lineal', KP], ['b', 0.5, 'lineal', KP], ['m2', 0.55, 'lineal', KP], ['m1', 0.5, 'lineal', KP], ['h0', 0.45, 'lineal', KP], ['a', 0.35, 'sale', K3]], desde: 'c' }]
      };
    })();

    /* ══════════════════════════════ SENTADO EN EL SUELO ══════════════════════════════ */
    var YS = 11.8;                                                   /* la cadera, sentado en el suelo */
    /* la pierna izquierda, tendida al frente (el talón en el suelo: se busca la altura del tobillo) */
    function tendida(P) {
      var c = resolver(P).i.cad, con = function (y) { return sobre(P, { pi: { a: [9, y, c[2] + Math.sqrt(76.3 * 76.3 - 1 - (c[1] - y) * (c[1] - y))], polo: [0, 1, 0] }, ti: { tob: 0 } }); };
      return con(busca(function (y) { return bajoZapa(resolver(con(y)).i, 'i'); }, -0.2, 3, 14));
    }
    /* una pieza del lado izquierdo, del derecho */
    function alDerecho(P) { var R = {}; if (P.pi) R.pd = reflejo(P.pi); if (P.ti) R.td = reflejo(P.ti); return R; }

    /* el glúteo, sentado, con la pierna cruzada al pecho: sentado en el suelo con una pierna estirada (las manos, en los muslos), cruza el
       pie de la otra por encima de la pierna estirada (lo apoya al otro lado de ella, junto a la rodilla); tira de la rodilla y de la
       espinilla de la pierna cruzada hacia el pecho (las dos manos, juntas ante la espinilla, bajo la rodilla); y repite con la otra */
    COREO['estiramiento-gluteo-sentado-pierna-cruzada'] = (function () {
      var base = { pel: [0, YS, 0], giro: [0, 2, 0], cab: [-2, 0, 0] }, izq = tendida(base), P = {};
      var dos = sobre(izq, alDerecho(izq));
      P.s = enSusMuslos(dos);
      /* la derecha, cruzada: el pie, plano en el suelo al otro lado de la pierna estirada; la rodilla, arriba (hacia «polo») */
      var cruza = function (polo, extra) { return sobre(izq, sobre({ pd: { suelo: [23, 38], abre: -8, polo: polo } }, extra || {})); };
      /* de camino: la rodilla sube y el pie pasa por encima de la otra pierna */
      P.k = enSuMuslo(sobre(izq, { pd: { a: [-2, 25, 36], polo: [-0.2, 1, 0.1] }, td: { punta: [0.2, -0.2, 0.96], arriba: [0, 0.98, 0.2] }, bd: { a: [-21, 30, 18], polo: [-1, -0.3, -0.4] }, md: { tipo: 'suelta', prono: 60 } }), 'i');
      var x0 = cruza([0.2, 1, 0.1]);
      P.x = enSuMuslo(sobre(x0, { bd: { a: [-18, 27, 14], polo: [-1, -0.4, -0.3] }, md: { tipo: 'suelta', prono: 60 } }), 'i');
      /* las manos, ante la espinilla, 8 cm bajo la rodilla */
      var abraza = function (Q) {
        var L = resolver(Q).d, g = mas(mezcla(L.rod, L.tob, 0.21), por(L.frentePierna, 9.2));
        var R = conAgarre(sobre(Q, { m: { tipo: 'puno', prono: 0 } }), [g[0] + 3.6, g[1], g[2]], [1, -0.6, -0.2], 'bi');
        return conAgarre(R, [g[0] - 3.6, g[1], g[2]], [-1, -0.6, -0.2], 'bd');
      };
      P.h = abraza(cruza([0.2, 1, 0.1]));
      P.e = abraza(cruza([0, 1, -0.45], { giro: [0, 0, 0], col: [-3, 0, 0] }));
      ['k', 'x', 'h', 'e'].forEach(function (n) { P[n + '2'] = espejo(P[n]); });
      var KI = ['ti'], KD = ['td'];
      return {
        vista: [[46, 18], [-40, 22]], isometrico: 'e', clavos: T2, zoom: 1.0,
        posturas: P, inicio: 's', encuadra: ['s', 'e', 'e2'],
        pasos: [{ sec: [['s', 0.5], ['k', 0.7, 'entra', KI], ['x', 0.7, 'sale', KI]], desde: 's' },
                { sec: [['h', 0.8, 'suave'], ['e', 1.1, 'suave'], ['e', 1.3], ['h', 0.5, 'suave'], ['x', 0.5, 'suave'], ['k', 0.45, 'entra', KI], ['s', 0.5, 'sale', KI], ['k2', 0.55, 'entra', KD], ['x2', 0.55, 'sale', KD], ['h2', 0.6, 'suave'], ['e2', 1.0, 'suave']], desde: 'x', dura: 8.2 }]
      };
    })();

    /* la rotación de cadera 90/90: sentado en el suelo con las dos rodillas dobladas a 90 grados y apoyadas en él: la pierna de delante (la
       izquierda), con el muslo hacia delante y hacia fuera y la espinilla cruzada ante el cuerpo, sobre su cara de fuera; la de atrás, con
       el muslo hacia el lado y la espinilla hacia atrás, sobre su cara de dentro (las manos, en el suelo, detrás de la cadera, sobre las
       yemas: sentado tan erguido, con la palma no llega); levanta y baja con suavidad la rodilla de delante, varias veces (el pie no se
       mueve); y cambia de lado (pasando por sentado con las rodillas arriba) y repite */
    COREO['rotacion-cadera-90-90'] = (function () {
      var base = { pel: [0, YS, 0], giro: [0, 4, 0], cab: [-3, 0, 0] }, E0 = resolver(base), ci = E0.i.cad, cd = E0.d.cad, P = {};
      var KF = [ci[0] + 40 * Math.sin(40 * RAD), 7.4, ci[2] + 40 * Math.cos(40 * RAD)], tf = [Math.sin(40 * RAD), 0, Math.cos(40 * RAD)], sf = [-Math.cos(40 * RAD), 0, Math.sin(40 * RAD)];
      var KB = [cd[0] - 40 * Math.cos(15 * RAD), 7.4, cd[2] + 40 * Math.sin(15 * RAD)], tb = [-Math.cos(15 * RAD), 0, Math.sin(15 * RAD)], sb = [-Math.sin(15 * RAD), 0, -Math.cos(15 * RAD)];
      /* las yemas, en el suelo, detrás de la cadera: la muñeca, a la altura que las deja en él (se busca) */
      var yemas = function (Q) {
        var con = function (y) { var R = sobre(Q, { b: { a: [27, y, -15], polo: [0.5, 0.1, -1] } }); return sobre(R, { mi: manoHacia(R, 'i', [0.42, -0.5, -0.76], [0.25, -0.86, 0.44], 'yemas', 40), md: manoHacia(R, 'd', [-0.42, -0.5, -0.76], [-0.25, -0.86, 0.44], 'yemas', 40) }); };
        return con(busca(function (y) { var E = resolver(con(y)); return manoAPlano(E.i, E.S.m.i, [0, 0, 0], [0, 1, 0]); }, -0.15, 4, 16));
      };
      /* la rodilla de delante, levantada «sube» cm (gira sobre la línea de la cadera al tobillo) */
      var con = function (sube) {
        var Q = function (yf, yb) {
          return sobre(base, { pi: { a: [KF[0] + sf[0] * 38, yf, KF[2] + sf[2] * 38], polo: [KF[0] - ci[0], KF[1] - ci[1] + sube, KF[2] - ci[2]] }, ti: { punta: [tf[0], -0.05, tf[2]], arriba: [-sf[0], 0, -sf[2]] },
            pd: { a: [KB[0] + sb[0] * 38, yb, KB[2] + sb[2] * 38], polo: menos(KB, cd) }, td: { punta: unidad(mas(por(sb, 0.6), por(tb, 0.8))), arriba: unidad(mas(por(tb, 0.6), por(sb, -0.8))) } });
        };
        var yf = busca(function (y) { return bajoZapa(resolver(Q(y, 6)).i, 'i'); }, -0.2, 3, 12), yb = busca(function (y) { return bajoZapa(resolver(Q(yf, y)).d, 'd'); }, -0.2, 3, 12);
        return yemas(Q(yf, yb));
      };
      P.a = con(0); P.u = con(30);
      /* para cambiar de lado: sentado con las rodillas arriba y los pies apoyados, separados */
      P.n = yemas(sobre(base, { p: { suelo: [27, 44], abre: 18, polo: [0.3, 1, 0.2] } }));
      /* de camino (q): la rodilla de delante sube y su pie rueda hacia la planta; el pie de atrás se levanta y viene por el lado, por el
         aire (de un tirón, la pierna de atrás cruzaba el suelo) */
      P.q = yemas(sobre(base, { pi: { a: [15, 12, 51.5], polo: [0.6, 0.8, 0.3] }, ti: { punta: [0.451, 0, 0.892], arriba: [0.63, 0.7, -0.318] },
        pd: { a: [-50, 20, 10], polo: [-0.75, 0.6, 0.3] }, td: { punta: [-0.5, -0.06, 0.86], arriba: [0, 0.998, 0.07] } }));
      P.a2 = espejo(P.a); P.u2 = espejo(P.u); P.q2 = espejo(P.q);
      var M = ['mi', 'md'], sube = [['u', 1.0, 'suave'], ['u', 0.3], ['a', 1.0, 'suave'], ['a', 0.4]];
      return {
        vista: [[34, 24], [-52, 28]], rastro: 'ri', esfuerzo: [], clavos: K4, clavosEn: { n: K4 },
        posturas: P, inicio: 'a', encuadra: ['a', 'u', 'a2', 'n'],
        rep: sube,
        pasos: ['a', 'rep', { sec: [['a', 0.3], ['q', 0.5, 'entra', M], ['n', 0.5, 'sale', M], ['q2', 0.5, 'entra', M], ['a2', 0.5, 'sale', M], ['a2', 0.2], ['u2', 1.0, 'suave'], ['u2', 0.3], ['a2', 1.0, 'suave'], ['a2', 0.3], ['u2', 1.0, 'suave']], desde: 'a', dura: 6.4 }]
      };
    })();

    /* ══════════════════════════════ A CUATRO PATAS, EN PLANCHA Y EN V ══════════════════════════════ */
    /* a cuatro patas (como en 7b-abdomen.js y 7f-estiramientos.js): las rodillas, bajo la cadera (a 7 cm del suelo) y los empeines
       apoyados; los brazos, estirados hasta las muñecas w (apoyadas): se busca la inclinación del tronco que deja el hombro a un brazo
       justo de la mano */
    var ZR4 = -34, EMPEINE = { punta: [0, -0.1, -1], arriba: [0, -1, 0.1] }, CODO4 = [0.4, 0.2, -1];
    function aCuatroEn(w, extra, lo, hi) {
      return aUnBrazo(function (cab) { return sobre({ pel: [0, 47, ZR4], giro: [0, cab, 0], cab: [-10, 0, 0], p: { a: [10, 7, ZR4 - 38], polo: [0, -1, 0.3] }, t: EMPEINE, b: { a: w, polo: CODO4 }, m: EN_SUELO }, extra || {}); }, w, lo || 40, hi || 110);
    }
    var Z_HOMBRO4 = resolver(aCuatroEn([19, ALTO_MUN, ZR4 + 43], null, 55, 89)).i.hom[2];
    function conPosadas(P) { return sobre(P, { mi: posada(P, 'i', [0, 0, 1], [0, -1, 0]), md: posada(P, 'd', [0, 0, 1], [0, -1, 0]) }); }

    /* la postura de la paloma: a cuatro patas, pasa una pierna por debajo del abdomen hasta apoyar la rodilla y la espinilla en el suelo,
       justo detrás de las manos (la rodilla, tras la mano de su lado; el pie, ante la otra rodilla, que resbala hacia atrás al bajar la
       cadera); ajusta la rodilla doblada a unos 90 grados, por delante de la cadera, y desliza la otra pierna estirada hacia atrás,
       apoyando la rodilla y el empeine; se apoya en las manos mientras mantiene y, para hacerlo más intenso, baja el pecho hacia el
       suelo; vuelve a cuatro patas y repite con la otra pierna. Las manos no se mueven */
    COREO['postura-de-la-paloma'] = (function () {
      /* los brazos, a 1,5 cm de estirarse del todo en todas las posturas: estirados justo a cuatro patas y algo doblados de paso, el codo
         daba un tirón al llegar */
      var w = [19, ALTO_MUN, Z_HOMBRO4], zh = w[2], K = [15, 7.2, zh - 13], FLOJO = 1.5;
      var Q0 = function (g) { return { pel: [0, 47, ZR4], giro: [0, g, 0], cab: [-10, 0, 0], p: { a: [10, 7, ZR4 - 38], polo: [0, -1, 0.3] }, t: EMPEINE, b: { a: w, polo: CODO4 }, m: EN_SUELO }; };
      var a = conPosadas(Q0(busca(function (g) { return largo(menos(resolver(Q0(g)).i.hom, w)); }, L_BRAZO - FLOJO, 40, 110))), P = { a: a };
      /* el pie de delante, en línea con su espinilla (la punta, hacia donde va ella) y sobre su canto de fuera: «s», hacia dónde va la espinilla */
      var deCanto = function (s) { var u = unidad([s[0], 0, s[1]]); return { punta: [u[0], -0.04, u[2]], arriba: [u[2], 0, -u[0]] }; };
      /* la cadera, a «d» (unidad) y 40 cm de la rodilla de delante; el tobillo de delante, en A (a la altura que deja la zapatilla posada);
         la pierna de atrás, estirada: su tobillo, a 5,5 cm del suelo. El tronco: el que deja el hombro a un brazo de la mano (se busca),
         o a «cab» grados si se dice */
      var con = function (d, A, col, cabeza, flojo, cab, codos) {
        var H = mas(K, por(unidad(d), 40)), pel = [H[0] - 10, H[1], H[2]], zr = pel[2] - Math.sqrt(77.6 * 77.6 - (pel[1] - 5.5) * (pel[1] - 5.5));
        var Q = function (g, y) {
          return { pel: pel, giro: [0, g, 0], col: [col, 0, 0], cab: [cabeza, 0, 0], pi: { a: [A[0], y, A[1]], polo: menos(K, H) }, ti: deCanto([A[0] - K[0], A[1] - K[2]]), pd: { a: [-9, 5.5, zr], polo: [0, -1, 0.3] }, td: EMPEINE,
            b: { a: w, polo: codos || CODO4 }, m: a.mi };
        };
        var ya = busca(function (y) { return bajoZapa(resolver(Q(60, y)).i, 'i'); }, -0.2, 3, 14);
        var R = cab == null ? Q(busca(function (g) { return largo(menos(resolver(Q(g, ya)).i.hom, w)); }, L_BRAZO - flojo, 15, 89), ya) : Q(cab, ya);
        return sobre(R, { mi: posada(R, 'i', [0, 0, 1], [0, -1, 0], a.mi.prono), md: posada(R, 'd', [0, 0, 1], [0, -1, 0], a.md.prono) });
      };
      /* t1: la rodilla, levantada, viene hacia delante bajo el cuerpo (en las posturas de paso, los brazos, algo flojos: el hombro, a 2 cm
         menos que el brazo estirado, como en todas) */
      var Q1 = function (g) { return sobre(a, { pel: [0, 48.5, ZR4 + 1], giro: [0, g, 0], pi: { a: [5, 12.5, ZR4 - 12], polo: [0.1, -0.7, 1] }, ti: { punta: [0, -0.5, -0.87], arriba: [0, -0.87, 0.5] } }); };
      P.t1 = Q1(busca(function (g) { return largo(menos(resolver(Q1(g)).i.hom, w)); }, L_BRAZO - FLOJO, 40, 110));
      P.t2 = con([-0.1, 0.72, -0.687], [-18, zh - 31.6], -6, -14, FLOJO);
      P.b = con([-0.075, 0.22, -0.973], [-22.9, zh - 15.3], -14, -16, FLOJO);
      P.c = con([-0.075, 0.22, -0.973], [-22.9, zh - 15.3], 6, -26, 0, 73, [1, 0.35, -0.3]);
      ['t1', 't2', 'b'].forEach(function (n) { P[n + '2'] = espejo(P[n]); });
      var KD = ['mi', 'md', 'td'], KI = ['mi', 'md', 'ti'], M = ['mi', 'md'];
      return {
        vista: [[-62, 16], [-128, 26]], isometrico: 'b', clavos: KD, clavosEn: { a: K4 }, zoom: 0.92,
        posturas: P, inicio: 'a', encuadra: ['a', 'b', 'c'],
        pasos: [{ sec: [['a', 0.6, null, K4], ['t1', 0.7, 'entra', KD], ['t2', 0.9, 'sale', KD]], desde: 'a' }, { sec: [['b', 2.2, 'suave', K4]], desde: 't2' },
                { sec: [['b', 1.6, null, K4], ['c', 1.8, 'suave', K4]], desde: 'b' },
                { sec: [['c', 0.4, null, K4], ['b', 0.6, 'suave', K4], ['t2', 0.9, 'suave', K4], ['t1', 0.5, 'entra'], ['a', 0.5, 'sale'], ['t12', 0.5, 'entra', KI], ['t22', 0.6, 'sale', KI], ['b2', 1.2, 'suave', K4]], desde: 'c', dura: 5.6 }]
      };
    })();

    /* ── la V invertida (el perro boca abajo), como en 7f-estiramientos.js ── Las manos, en w, y las bolas de los pies, en z = ZB, no se
       mueven: el talón sube «g» grados sobre ellas (70, de puntillas, como en la plancha; 0, plano) y el tobillo va con él (deTalon). La
       cadera, a «L» del tobillo (77.95, las piernas estiradas); el tronco baja desde ella a «beta» grados de la horizontal (con −20 es
       una plancha; con menos, el tronco sube de la cadera a los hombros); y los brazos, estirados: se busca la inclinación de las
       piernas que deja el hombro a un brazo justo de la mano */
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

    /* la plancha con cadera abajo y cadera arriba: en plancha alta, con los brazos estirados; deja caer el cuerpo hacia el suelo, hundiéndolo
       por el centro sin doblar los brazos y con la mirada al frente (la cadera baja y el pecho sube entre los hombros), y mantiene; vuelve
       a la plancha, carga el peso en la parte delantera de los pies y sube la cadera: estira las piernas, intenta bajar los talones y mete
       la cabeza entre los brazos, con la espalda recta; mantiene y vuelve a la plancha. Las manos y las bolas de los pies no se mueven */
    COREO['extension-y-flexion-en-plancha'] = (function () {
      var ZB = -100 - deTalon(70)[0] + D.bola, pl0 = function (z) { return tablaAlta([19, ALTO_MUN, z], [0.5, 0.2, -1]); };
      var z1 = resolver(pl0(14)).i.hom[2], w = [19, ALTO_MUN, resolver(pl0(z1)).i.hom[2]], V = enV(w, ZB), bp = 90 - tablaAlta(w, [0.5, 0.2, -1]).giro[1];
      var P = { pl: V(-bp, 70, { cab: [-16, 0, 0] }), m1: V(-bp + 19, 60, { cab: [-14, 0, 0] }), m2: V(-bp + 38, 48, { cab: [-12, 0, 0] }), v: V(37, 33, { cab: [-12, 0, 0] }) };
      /* hundido: la pelvis, casi tendida, y la columna, extendida: el pecho sube entre los brazos */
      P.s1 = V(-bp + 3, 70, { col: [-24, 0, 0], cab: [-18, 0, 0] });
      P.s = V(-13, 70, { col: [-46, 0, 0], cab: [-22, 0, 0], hom: [-1.5, -2] });
      var K4v = T2.concat(['mi', 'md']);
      return {
        vista: [[-80, 10], [-138, 22]], rastro: 'pel', isometrico: 's', clavos: K4v,
        posturas: P, inicio: 'pl', encuadra: ['pl', 'v', 's'],
        pasos: ['pl', { sec: [['s1', 0.9, 'entra'], ['s', 1.1, 'sale']], desde: 'pl' },
                { sec: [['s', 0.6], ['s1', 0.8, 'entra'], ['pl', 0.7, 'sale'], ['pl', 0.4], ['m1', 0.7, 'entra'], ['m2', 0.6, 'lineal'], ['v', 0.9, 'sale']], desde: 's' },
                { sec: [['v', 1.5], ['m2', 0.75, 'entra'], ['m1', 0.5, 'lineal'], ['pl', 0.6, 'sale']], desde: 'v' }]
      };
    })();

    /* el perro boca abajo con una pierna elevada: desde el perro boca abajo, levanta una pierna y la estira hacia el techo (en la línea del
       tronco, y algo más); para estirar más, dobla esa pierna hacia atrás y por encima del cuerpo, de modo que la rodilla queda mirando
       hacia fuera (la cadera de ese lado se abre: la pelvis gira sobre el eje del tronco y la columna lo deshace, con los hombros
       quietos); mantiene y repite con la otra pierna. Las manos y el pie de apoyo no se mueven */
    COREO['perro-boca-abajo-pierna-elevada'] = (function () {
      var w = [19, ALTO_MUN, Z_HOMBRO4 + 9], TZ = ZR4 - Math.sqrt(D.pierna * D.pierna - 49), ZB = TZ - deTalon(70)[0] + D.bola, V = enV(w, ZB), P = {};
      var c = V(46, 16, { cab: [-18, 0, 0] }), E = resolver(c), ci = E.i.cad;
      P.c = c;
      /* la pierna izquierda, estirada hacia atrás y arriba, «al» grados sobre la horizontal */
      var sube = function (al, extra) {
        var Q = sobre(c, sobre({ pel: [-2, c.pel[1], c.pel[2]] }, extra || {})), h = resolver(Q).i.cad;
        return sobre(Q, { pi: { a: mas(h, por([0, Math.sin(al * RAD), -Math.cos(al * RAD)], 77.6)), polo: [0, -0.7, -0.7] }, ti: { tob: 42 } });
      };
      P.m = sube(8); P.u = sube(52);
      /* la cadera, abierta «om» grados: la pelvis gira sobre su eje largo (el pecho de la pelvis se vuelve hacia la izquierda) y la columna
         gira lo mismo al revés (se busca: los hombros, a la misma altura) */
      var abierta = function (om) {
        var B = baseDe(c.giro), Z = mas(por(B[2], Math.cos(om * RAD)), por(B[0], Math.sin(om * RAD))), base = baseEjes(B[1], Z), td = E.d.tob, wd = [-w[0], w[1], w[2]];
        /* la cadera de apoyo, a una pierna estirada de su tobillo («fi» grados sobre el suelo: se busca la que deja los hombros a un brazo
           de las manos); la pelvis gira sobre ella */
        var Q = function (fi, tw) { return sobre(c, { pel: menos([-D.caderaX, td[1] + 77.95 * Math.sin(fi * RAD), td[2] + 77.95 * Math.cos(fi * RAD)], aplicar(base, [-D.caderaX, 0, 0])), base: base, col: [0, 0, tw] }); };
        var nivel = function (fi) { return Q(fi, busca(function (tw) { var R = resolver(Q(fi, tw)); return R.i.hom[1] - R.d.hom[1]; }, 0, -60, 60)); };
        return nivel(busca(function (fi) { var R = resolver(nivel(fi)); return Math.max(largo(menos(R.i.hom, w)), largo(menos(R.d.hom, wd))); }, L_BRAZO, 30, 75));
      };
      var e0 = abierta(26), hi = resolver(e0).i.cad, T = unidad([0.42, 0.62, -0.66]), rod = mas(hi, por(T, 40));
      P.e = sobre(e0, { pi: { a: mas(rod, por(unidad([-0.8, -0.05, -0.6]), 38)), polo: T }, ti: { tob: 30 } });
      ['m', 'u', 'e'].forEach(function (n) { P[n + '2'] = espejo(P[n]); });
      var K4v = T2.concat(['mi', 'md']), KD = ['mi', 'md', 'td'], KI = ['mi', 'md', 'ti'];
      return {
        vista: [[-74, 12], [-140, 24]], rastro: 'ti', isometrico: 'e', clavos: KD, clavosEn: { c: K4v }, zoom: 0.92,
        posturas: P, inicio: 'c', encuadra: ['c', 'm', 'u', 'e', 'm2', 'u2', 'e2'],
        pasos: [{ sec: [['c', 0.6, null, K4v], ['m', 0.5, 'entra'], ['u', 1.0, 'sale']], desde: 'c' }, { sec: [['e', 1.7, 'suave']], desde: 'u' },
                { sec: [['e', 0.8], ['u', 0.7, 'suave'], ['m', 0.45, 'entra'], ['c', 0.35, 'sale'], ['m2', 0.4, 'entra', KI], ['u2', 0.6, 'sale', KI], ['e2', 1.0, 'suave', KI]], desde: 'e' }]
      };
    })();

    /* ══════════════════════════════ TUMBADO, CON EL TALÓN EN UN MURO ══════════════════════════════ */
    /* la misma postura, corrida [dx, dz] por el suelo (todo lo dicho en el mundo; lo escrito una vez para los dos lados, por separado) */
    function corrida(P, d) {
      var R = {}, k, tr = function (a) {
        var n = {}, j;
        for (j in a) n[j] = a[j];
        if (a.suelo) n.suelo = [a.suelo[0] + d[0], a.suelo[1] + d[1]];
        if (a.a && !a.en) n.a = [a.a[0] + d[0], a.a[1], a.a[2] + d[1]];
        return n;
      };
      for (k in P) R[k] = P[k];
      R.pel = [P.pel[0] + d[0], P.pel[1], P.pel[2] + d[1]];
      ['b', 'p'].forEach(function (q) {
        if (P[q]) { delete R[q]; R[q + 'i'] = tr(P[q]); R[q + 'd'] = tr(reflejo(P[q])); }
        else { if (P[q + 'i']) R[q + 'i'] = tr(P[q + 'i']); if (P[q + 'd']) R[q + 'd'] = tr(P[q + 'd']); }
      });
      return R;
    }

    /* los isquiotibiales, con el talón en la pared: boca arriba (las manos, sobre el abdomen) junto al extremo de un muro, con la pierna
       izquierda pegada a él (el pie, apoyado en su cara, con la rodilla doblada) y la derecha, tendida en el suelo, que pasa junto a su
       esquina; sube la pierna izquierda y apoya el talón en la pared, con la rodilla algo flexionada; estira la pierna con suavidad (el
       talón sube por la pared), mantiene y cambia de pierna: recoge las dos rodillas, se corre un palmo hacia el lado (el muro queda
       entre las piernas) y sube la otra. El muro, visto por su extremo: tiene de ancho lo que una pierna, y una pasa por cada lado */
    COREO['estiramiento-isquios-talon-pared'] = (function () {
      var ZP = 53, ANCHO = 18, base = sobre(SUPINO_SUELO, sobre(SOBRE_ABDOMEN, { pd: TENDIDAS, td: { tob: 8 } })), P = {};
      /* el pie izquierdo, en la pared: el tobillo, a la altura «y» y a la distancia de ella que deja la zapatilla apoyada (se busca) */
      var enMuro = function (y, pie, polo, extra) {
        var con = function (z) { return sobre(base, sobre({ pi: { a: [10, y, z], polo: polo }, ti: pie }, extra || {})); };
        return con(busca(function (z) { return zapaAPlano(resolver(con(z)).i, 'i', [0, 0, ZP], [0, 0, -1]); }, -0.2, ZP - 22, ZP - 2));
      };
      P.a = enMuro(30, { punta: [0, 1, 0], arriba: [0, 0, -1] }, [0, 0.6, -0.8]);
      P.m = enMuro(57, { punta: [0, 0.8, -0.6], arriba: [0, -0.6, -0.8] }, [0, 0.45, -0.9]);
      P.k = enMuro(81.2, { tob: 0 }, [0, 0.3, -1]);
      P.e = enMuro(85.2, { tob: 0 }, [0, 0.3, -1]);
      /* para cambiar de pierna: las dos rodillas, recogidas hacia el pecho (kk); la cadera se corre primero y los hombros la siguen (km) */
      var recogido = function (extra) { return sobre(SUPINO_SUELO, sobre(SOBRE_ABDOMEN, sobre({ p: { e: 116, z: 0, c: 118 }, t: { tob: 8 } }, extra || {}))); };
      P.kk = recogido();
      P.km = recogido({ pel: [10.5, 12.2, 20], giro: [8, -90, 0] });
      var otro = function (Q) { return corrida(espejo(Q), [20, 0]); };
      ['kk', 'a', 'm', 'k', 'e'].forEach(function (n) { P[n + '2'] = otro(P[n]); });
      var KI = ['ti'], KD = ['td'];
      return {
        vista: [[-128, 22], [176, 38]], isometrico: 'e', clavos: KI, zoom: 0.92,
        material: [['pared', { x: 10, z: ZP, normal: [0, 0, -1], ancho: ANCHO, alto: 132, grueso: 70, tapa: true }]],
        posturas: P, inicio: 'a', encuadra: ['a', 'e', 'e2', 'kk'],
        pasos: ['a', { sec: [['m', 0.8, 'entra'], ['k', 0.9, 'sale']], desde: 'a' },
                { sec: [['e', 1.5, 'suave'], ['e', 1.0], ['k', 0.5, 'suave'], ['m', 0.45, 'suave'], ['kk', 0.6, 'suave', []], ['km', 0.4, 'entra', []], ['kk2', 0.4, 'sale', []], ['m2', 0.6, 'suave', []], ['k2', 0.5, 'suave', KD], ['e2', 1.0, 'suave', KD]], desde: 'k' }]
      };
    })();

    /* ══════════════════════════════ CAMINANDO ══════════════════════════════
       Anda de verdad: sale de su sitio y avanza un tramo corto, y en cada paso hace el gesto del ejercicio con la pierna que iba a
       adelantar. Cada paso es: el doble apoyo (el pie de delante, plano; el de atrás, ya de puntillas: la cadera, en lo más bajo), el
       gesto (apoyado en una pierna, con la cadera sobre el pie que pisa) y, al soltar, el pie que va a pisar, por delante y en el aire.
       El pie que pisa va clavado. Las posturas se escriben en el marco del paso (apoya el pie derecho, con el tobillo en z = 0, y el
       gesto lo hace la pierna izquierda) y se llevan a su sitio: enPaso(k, postura) (los pasos pares, reflejados). El primer paso es
       más corto (Z1); los demás, de ZANCA. Como los paseos de 77-antebrazo-pantorrilla.js */
    var ZANCA = 50, SEP = 9, Z1 = 30, PIE_AIRE = { punta: [0, -0.1, 0.995], arriba: [0, 0.995, 0.1] }, PIE_LLEGA = { punta: [0, 0.1, 0.995], arriba: [0, 0.995, -0.1] };
    function pieP(lado, z, talon) { return { suelo: [lado === 'i' ? SEP : -SEP, z], abre: 5, talon: talon || 0 }; }
    function zPaso(k) { return Z1 + ZANCA * (k - 1); }
    function enPaso(k, Q) { return corrida(k % 2 ? Q : espejo(Q), [0, zPaso(k)]); }
    function apoyo(k) { return ['t' + (k % 2 ? 'd' : 'i')]; }
    /* el doble apoyo al llegar: delante, el pie derecho (z = 0); atrás, el izquierdo, a «zanca», de puntillas */
    function dobleApoyo(zanca, brazos) {
      var medio = zanca / 2;
      return sobre(brazos, { pel: [0, D.tobillo + Math.sqrt(77.6 * 77.6 - (medio - 3) * (medio - 3)), -medio + 3], giro: [3, 0, 0], col: [0, 0, -3], pd: pieP('d', 0), pi: pieP('i', -zanca, 30) });
    }
    /* apoyado en la pierna derecha: la cadera, sobre ese pie; «pierna», lo que hace la izquierda */
    function enUnaPierna(pierna, extra) { return sobre({ pel: [-3.5, PIE - 0.6, 2], pd: pieP('d', 0) }, sobre(pierna, extra || {})); }
    /* al soltar: el pie izquierdo, por delante y en el aire, a punto de pisar; el derecho empieza a despegar el talón */
    function alSoltar(brazos) { return sobre(brazos, { pel: [-1.5, PIE - 1.4, 12], pd: pieP('d', 0, 10), pi: { a: [SEP - 1, 14.5, 34], polo: [0, 0.2, 1] }, ti: PIE_LLEGA }); }
    /* un paso corriente: apoyado en la derecha, la izquierda pasa por el aire (como en los paseos) */
    function dePaso(brazos) { return sobre(brazos, { pel: [-1.2, PIE - 1, 3.5], pd: pieP('d', 0), pi: { a: [SEP - 1, 16.5, -5], polo: [0, 0.1, 1] }, ti: { punta: [0, -0.14, 0.99], arriba: [0, 0.99, 0.14] } }); }
    /* de pie, antes de echar a andar, y el primer paso (el pie derecho, por el aire, hasta Z1) */
    function dePie(brazos, z) { return sobre(brazos, { pel: [0, PIE, (z || 0) + 3], pi: pieP('i', z || 0), pd: pieP('d', z || 0) }); }
    function primerPaso(brazos) { return sobre(brazos, { pel: [2, PIE - 0.8, 8], pi: pieP('i', 0, 8), pd: { a: [-SEP, 14, 16], polo: [0, 0.2, 1] }, td: PIE_AIRE }); }
    /* para acabar: el pie del gesto baja junto al otro (por el aire) y queda de pie */
    function alJuntar(brazos) { return sobre(brazos, { pel: [-1.5, PIE - 0.8, 2.5], pd: pieP('d', 0), pi: { a: [SEP, 14, 5], polo: [0, 0.3, 1] }, ti: PIE_AIRE }); }
    /* lo de siempre de una caminata con los brazos «br» mientras anda: las posturas que no son el gesto, y los trozos de secuencia.
       P: donde se guardan; alAbrir: los brazos al soltar un abrazo; sale(): de pie → primer paso → doble apoyo 1; sigue(k): soltar el gesto k → doble apoyo k + 1; acaba(k): soltar
       el gesto k → de pie; pasoCorriente(k): del doble apoyo k al k + 1, sin gesto */
    function caminata(P, br, alAbrir) {
      var W = {}, bs = alAbrir || br;                /* al soltar un abrazo, las manos se abren por delante antes de colgar (bs): de un tirón rozaban los muslos */
      P.s0 = dePie(br); P.p1 = primerPaso(br); P.d1 = corrida(dobleApoyo(Z1, br), [0, Z1]);
      W.d = function (k) { var n = 'd' + k; if (!P[n]) P[n] = enPaso(k, dobleApoyo(ZANCA, br)); return n; };
      W.sale = function () { return [['s0', 0.4, null, T2], ['p1', 0.32, 'entra', ['ti']], ['d1', 0.3, 'sale', ['ti']]]; };
      W.sigue = function (k) { P['r' + k] = enPaso(k, alSoltar(bs)); return [['r' + k, 0.42, 'entra', apoyo(k)], [W.d(k + 1), 0.3, 'sale', apoyo(k)]]; };
      W.acaba = function (k) { P['j' + k] = enPaso(k, alJuntar(bs)); P['f' + k] = dePie(br, zPaso(k)); return [['j' + k, 0.45, 'entra', apoyo(k)], ['f' + k, 0.4, 'sale', apoyo(k)]]; };
      W.pasoCorriente = function (k) { P['m' + k] = enPaso(k, dePaso(br)); return [['m' + k, 0.28, 'lineal', apoyo(k)], [W.d(k + 1), 0.25, 'lineal', apoyo(k)]]; };
      /* un gesto en el paso k: las posturas (en el marco del paso) con sus tiempos: [[nombre, postura, segundos, curva]…] */
      W.gesto = function (k, lista) { return lista.map(function (q) { var n = q[0] + k; P[n] = enPaso(k, q[1]); return [n, q[2], q[3] || 'suave', apoyo(k)]; }); };
      return W;
    }

    var AL_ABRIR = { b: aTorax(D.hombroX + 4, HY - 33, 22, [1, -0.5, -0.4]), m: SUELTA };

    /* caminar abrazando la rodilla: mientras camina, sujeta con las manos la rodilla de una pierna (las dos manos, juntas ante la
       espinilla, bajo la rodilla) y la lleva hacia el pecho; suelta la pierna, apoya el pie, da un paso y repite con la otra, alternando
       a lo largo de un tramo corto */
    COREO['caminar-abrazando-rodilla'] = (function () {
      var P = {}, W = caminata(P, SUELTO, AL_ABRIR);
      var sube = sobre(enUnaPierna({ pi: { e: 66, z: 2, c: 92 }, ti: { tob: 10 } }), { b: aTorax(D.hombroX + 5, HY - 25, 30, [1, -0.5, -0.4]), m: { tipo: 'suelta', prono: 10 } });
      var abraza = function (e, extra) {
        var Q = enUnaPierna({ pi: { e: e, z: 3, c: 120 }, ti: { tob: 12 } }, extra), L = resolver(Q).i, g = mas(mezcla(L.rod, L.tob, 0.2), por(L.frentePierna, 9));
        var R = conAgarre(sobre(Q, { m: { tipo: 'puno', prono: 0 } }), [g[0] + 3.6, g[1], g[2]], [1, -0.7, -0.2], 'bi');
        return conAgarre(R, [g[0] - 3.6, g[1], g[2]], [-1, -0.7, -0.2], 'bd');
      };
      var g1 = abraza(112), g2 = abraza(126, { col: [-3, 0, 0] });
      var gesto = function (k) { return W.gesto(k, [['t', sube, 0.4, 'entra'], ['a', g1, 0.4, 'lineal'], ['g', g2, 0.45, 'sale']]); };
      return {
        vista: [[-40, 14], [48, 12]], rastro: 'rodillas', clavos: T2, zoom: 0.92,
        posturas: P, inicio: 's0', encuadra: ['s0', 'g1', 'f3'],
        pasos: [{ sec: W.sale().concat(gesto(1)), desde: 's0' },
                { sec: [['g1', 0.5, null, apoyo(1)]].concat(W.sigue(1), gesto(2), [['g2', 0.8, null, apoyo(2)]], W.sigue(2), gesto(3), [['g3', 0.8, null, apoyo(3)]], W.acaba(3)), desde: 'g1', dura: 7.4 }]
      };
    })();

    /* caminar llevando tobillo y rodilla al pecho: mientras camina, sube una pierna con la rodilla abierta hacia fuera y la espinilla
       cruzada ante el cuerpo, y sujeta con las manos la rodilla (la mano de ese lado, por fuera) y el tobillo (la otra, por debajo); lleva
       a la vez el tobillo y la rodilla hacia el pecho; suelta, da un paso y repite con la otra pierna */
    COREO['caminar-tobillo-rodilla-al-pecho'] = (function () {
      var P = {}, W = caminata(P, SUELTO, AL_ABRIR);
      /* la pierna izquierda: la rodilla, a 40 cm de la cadera hacia «t»; el tobillo, a 38 de la rodilla hacia «e» */
      var cuna = function (t, e, extra) {
        var Q0 = enUnaPierna({}, extra), h = resolver(Q0).i.cad, K = mas(h, por(unidad(t), 40)), A = mas(K, por(unidad(e), 38));
        var Q = sobre(Q0, { pi: { a: A, polo: menos(K, h) }, ti: { tob: 24 }, m: { tipo: 'puno', prono: 0 } });
        var R = conAgarre(Q, mas(K, [5, -2.5, 5.5]), [1, -0.6, -0.4], 'bi');
        return sobre(conAgarre(R, mas(A, [-1, -5.5, 3]), [-1, -0.8, -0.2], 'bd'), { md: { tipo: 'puno', prono: -70 } });
      };
      var sube = sobre(enUnaPierna({ pi: { e: 60, z: 28, c: 96 }, ti: { tob: 12 } }), { b: aTorax(D.hombroX + 6, HY - 26, 28, [1, -0.5, -0.4]), m: { tipo: 'suelta', prono: 10 } });
      var g1 = cuna([0.62, 0.3, 0.72], [-0.95, 0, -0.3]), g2 = cuna([0.58, 0.52, 0.6], [-0.95, 0.03, -0.3], { col: [-2, 0, 0] });
      var coge = function (k) { return W.gesto(k, [['t', sube, 0.42, 'entra'], ['g', g1, 0.6, 'sale']]); }, tira = function (k) { return W.gesto(k, [['e', g2, 0.9, 'suave']]); };
      return {
        vista: [[-34, 14], [52, 12]], rastro: 'rodillas', clavos: T2, zoom: 0.92,
        posturas: P, inicio: 's0', encuadra: ['s0', 'e1', 'f3'],
        pasos: [{ sec: W.sale().concat(coge(1)), desde: 's0' },
                { sec: tira(1).concat([['e1', 0.8, null, apoyo(1)]], W.sigue(1), coge(2), [['g2', 0.2, null, apoyo(2)]], tira(2), [['e2', 0.7, null, apoyo(2)]], W.sigue(2), coge(3), tira(3), [['e3', 0.7, null, apoyo(3)]], W.acaba(3)), desde: 'g1', dura: 10.4 }]
      };
    })();

    /* caminar estirando el cuádriceps: mientras camina, sujeta con una mano el tobillo de una pierna (la de su lado, por delante: donde el
       empeine se junta con la espinilla) y lo lleva hacia atrás, hacia el glúteo, sin arquear la espalda; suelta, da un paso y repite con
       la otra, alternando a lo largo de un tramo corto */
    COREO['caminar-estirando-cuadriceps'] = (function () {
      var P = {}, W = caminata(P, SUELTO);
      /* la pierna izquierda, por ángulos: el muslo, a plomo (o un poco atrás), y la rodilla doblada «c» grados; la mano izquierda, al
         tobillo por delante (4 cm por delante de él y 3,5 sobre el pie: la ficha dice «el tobillo»; en el estiramiento de cuádriceps de
         pie, de 78-cuadriceps.js, la mano va al empeine, a 7) */
      var POLO = [0.9, 0.2, -0.6], con = function (e, c, tob, extra) { return enUnaPierna({ pi: { e: e, z: 0, c: c }, ti: { tob: tob } }, sobre({ bd: aLosLados(10), md: SUELTA, bi: aLosLados(8), mi: SUELTA }, extra || {})); };
      var alEmpeine = function (Q) { var L = resolver(Q).i; return conAgarre(sobre(Q, { hom: { i: [-2, -2.5], d: [0, 0] }, mi: { tipo: 'puno', prono: 20 } }), mas(L.tob, mas(por(L.punta, 4), por(L.arriba, 3.5))), POLO, 'bi'); };
      /* el talón sube primero (k: la mano de ese lado va ya hacia atrás, por fuera de la cadera, con el codo doblado como lo tendrá al
         coger) y la mano coge el empeine cuando lo tiene al alcance, con el tronco un poco vuelto hacia ella (g). Con la rodilla a 118
         grados, como en el de pie, el puño se quedaba a 19 cm con el brazo estirado del todo, y con el codo así la mano no sabe hacia
         dónde mira: giraba de golpe al llegar */
      var k = con(-2, 112, 24, { bi: { a: [23, 87, -15], polo: POLO }, mi: { tipo: 'suelta', prono: 20 } });
      var g = alEmpeine(con(-5, 146, 28, { col: [0, 3, 9] })), b = alEmpeine(con(-8, 153, 30, { col: [0, 2, 5] }));
      var gesto = function (q) { return W.gesto(q, [['t', k, 0.42, 'entra'], ['a', g, 0.4, 'lineal'], ['g', b, 0.5, 'sale']]); };
      /* al soltar, la mano sale hacia fuera antes de colgar: derecha a su sitio, pasaba por el muslo que baja */
      var suelta = function (q) { return W.gesto(q, [['u', sobre(k, { pi: { e: 6, z: 0, c: 84 }, ti: { tob: 16 }, bi: { e: 20, z: 112, g: 90, c: 26 } }), 0.42, 'entra']]); };
      return {
        vista: [[-52, 14], [128, 12]], rastro: 'ti', clavos: T2, zoom: 0.92,
        posturas: P, inicio: 's0', encuadra: ['s0', 'g1', 'f3'],
        pasos: [{ sec: W.sale().concat(gesto(1)), desde: 's0' },
                { sec: [['g1', 0.5, null, apoyo(1)]].concat(suelta(1), W.sigue(1), gesto(2), [['g2', 0.8, null, apoyo(2)]], suelta(2), W.sigue(2), gesto(3), [['g3', 0.8, null, apoyo(3)]], suelta(3), W.acaba(3)), desde: 'g1', dura: 8.8 }]
      };
    })();

    /* abrir la puerta caminando (las manos, en la cintura): mientras camina, sube una pierna doblando la cadera y la rodilla (el muslo, al
       frente); lleva la rodilla hacia fuera describiendo medio círculo, apoya el pie y repite con la otra pierna en el paso siguiente */
    COREO['abrir-la-puerta-caminando'] = (function () {
      var P = {}, W = caminata(P, CINT);
      var con = function (e, z, c, x) { return enUnaPierna({ pi: { e: e, z: z, g: 0, c: c }, ti: { tob: 10 } }, sobre(CINT, { pel: [x == null ? -3.5 : x, PIE - 0.6, 2] })); };
      var sube = function (k) { return W.gesto(k, [['t', con(46, 0, 70), 0.36, 'entra'], ['g', con(90, 0, 92), 0.5, 'sale']]); };
      var abre = function (k) { return W.gesto(k, [['m', con(90, 42, 92, -4.5), 0.5, 'entra'], ['e', con(86, 82, 92, -5.5), 0.55, 'sale']]); };
      /* de fuera a pisar: el pie baja por delante de la cadera (b) */
      var baja = function (k) { return W.gesto(k, [['b', con(48, 46, 66, -3), 0.4, 'entra']]); };
      return {
        vista: [[-28, 14], [56, 12]], rastro: 'rodillas', clavos: T2, zoom: 0.92,
        posturas: P, inicio: 's0', encuadra: ['s0', 'e1', 'f3'],
        pasos: [{ sec: W.sale().concat(sube(1)), desde: 's0' },
                { sec: abre(1).concat([['e1', 0.5, null, apoyo(1)]], baja(1), W.sigue(1), sube(2), abre(2), [['e2', 0.4, null, apoyo(2)]], baja(2), W.sigue(2), sube(3), abre(3), [['e3', 0.4, null, apoyo(3)]], baja(3), W.acaba(3)), desde: 'g1', dura: 10.0 }]
      };
    })();

    /* cerrar la puerta caminando (las manos, en la cintura): mientras camina, sube una pierna con la rodilla doblada, llevándola hacia
       fuera, al lado del cuerpo; desde ahí lleva la rodilla hacia dentro, cruzando la línea media del cuerpo en medio círculo; apoya el
       pie y repite con la otra pierna */
    COREO['cerrar-la-puerta-caminando'] = (function () {
      var P = {}, W = caminata(P, CINT);
      var con = function (e, z, c, x) { return enUnaPierna({ pi: { e: e, z: z, g: 0, c: c }, ti: { tob: 10 } }, sobre(CINT, { pel: [x == null ? -3.5 : x, PIE - 0.6, 2] })); };
      /* al despegar, la rodilla sale ya hacia fuera y el pie viene de atrás, colgando: dicha por el tobillo, que la pierna viene de detrás
         (por ángulos, con el muslo más atrás que el costado, la rodilla se doblaba al revés y el pie barría el suelo) */
      var q = (function () {
        var Q0 = enUnaPierna({}, sobre(CINT, { pel: [-4, PIE - 0.6, 2] })), h = resolver(Q0).i.cad, r = Math.PI / 180, e = 38 * r, z = 72 * r;
        var K = mas(h, por([Math.sin(e) * Math.sin(z), -Math.cos(e), Math.sin(e) * Math.cos(z)], 40)), A = mas(K, por(unidad([-0.25, -0.72, -0.65]), 38));
        return sobre(Q0, { pi: { a: A, polo: menos(K, h) }, ti: { tob: 14 } });
      })();
      var sube = function (k) { return W.gesto(k, [['t', q, 0.36, 'entra'], ['g', con(86, 84, 92, -5.5), 0.5, 'sale']]); };
      var cierra = function (k) { return W.gesto(k, [['m', con(90, 36, 92, -4.5), 0.5, 'entra'], ['e', con(90, -16, 92, -3.5), 0.55, 'sale']]); };
      var baja = function (k) { return W.gesto(k, [['b', con(52, -4, 64, -3), 0.4, 'entra']]); };
      return {
        vista: [[-28, 14], [56, 12]], rastro: 'rodillas', clavos: T2, zoom: 0.92,
        posturas: P, inicio: 's0', encuadra: ['s0', 'g1', 'f3'],
        pasos: [{ sec: W.sale().concat(sube(1)), desde: 's0' },
                { sec: cierra(1).concat([['e1', 0.5, null, apoyo(1)]], baja(1), W.sigue(1), sube(2), [['g2', 0.25, null, apoyo(2)]], cierra(2), [['e2', 0.4, null, apoyo(2)]], baja(2), W.sigue(2), sube(3), cierra(3), [['e3', 0.4, null, apoyo(3)]], baja(3), W.acaba(3)), desde: 'g1', dura: 10.3 }]
      };
    })();

    /* la patada con la pierna recta, caminando: mientras camina, lanza hacia delante una pierna estirada, con la punta del pie hacia
       arriba; lleva hacia la punta de ese pie la mano contraria (el tronco se inclina y gira un poco hacia ella); da unos pasos y repite
       con la otra pierna */
    COREO['patada-pierna-recta-caminando'] = (function () {
      var P = {}, W = caminata(P, SUELTO);
      var arriba0 = enUnaPierna({ pi: { e: 80, z: 0, c: 4 }, ti: { tob: 0 } }, sobre(SUELTO, { giro: [0, 3, 0] }));
      var medio = enUnaPierna({ pi: { e: 40, z: 0, c: 10 }, ti: { tob: 4 } }, SUELTO);
      /* la mano derecha, hacia la punta del pie izquierdo: el brazo, estirado hacia ella */
      var toca = (function () {
        var Q = enUnaPierna({ pi: { e: 84, z: 0, c: 4 }, ti: { tob: 0 } }, { giro: [0, 6, 0], col: [36, 0, 22], cab: [-18, -8, 0], hom: { i: [0, 0], d: [3, -1] }, bi: { e: 24, z: 176, g: 176, c: 14 }, mi: SUELTA });
        var E = resolver(Q), F = mas(E.i.tob, mas(por(E.i.punta, 17), por(E.i.arriba, -2))), u = unidad(menos(F, E.d.hom));
        /* el brazo, casi estirado (el codo, unos 20 grados: estirado del todo, la mano no sabe hacia dónde mira y gira de golpe al ir y al volver) */
        var R = sobre(Q, { bd: { a: mas(E.d.hom, por(u, Math.min(L_BRAZO - 0.9, largo(menos(F, E.d.hom)) - 15))), polo: [-1, -0.3, -0.2] } });
        return sobre(R, { md: manoHacia(R, 'd', u, [0, -1, 0.2], 'abierta') });
      })();
      /* la pierna pasa recogida junto a la otra (como en un paso corriente) y de ahí se lanza: de puntillas atrás a medio subir, estirada, la
         punta barría el suelo */
      var pasa = enUnaPierna({ pi: { a: [SEP - 1, 18.5, -8], polo: [0, 0.1, 1] }, ti: { punta: [0, -0.2, 0.98], arriba: [0, 0.98, 0.2] } }, sobre(SUELTO, { pel: [-2.6, PIE - 0.8, 1] }));
      var patada = function (k) { return W.gesto(k, [['t', pasa, 0.26, 'entra'], ['g', arriba0, 0.44, 'sale']]); };
      var conMano = function (k) { return W.gesto(k, [['t', pasa, 0.26, 'entra'], ['e', toca, 0.54, 'sale']]); };
      var baja = function (k) { return W.gesto(k, [['b', medio, 0.36, 'entra']]); };
      P.e1 = enPaso(1, toca);
      return {
        vista: [[-56, 14], [34, 12]], rastro: 'ti', clavos: T2, zoom: 0.9,
        posturas: P, inicio: 's0', encuadra: ['s0', 'e1', 'e4', 'f4'],
        pasos: [{ sec: W.sale().concat(patada(1)), desde: 's0' }, { sec: [['e1', 1.3, 'suave', apoyo(1)]], desde: 'g1' },
                { sec: [['e1', 0.3, null, apoyo(1)]].concat(baja(1), W.sigue(1), W.pasoCorriente(2), W.pasoCorriente(3), conMano(4), [['e4', 0.7, null, apoyo(4)]], baja(4), W.acaba(4)), desde: 'e1', dura: 5.5 }]
      };
    })();
  })();
