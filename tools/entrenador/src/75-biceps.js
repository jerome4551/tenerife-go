  /* ───────────────────────── las coreografías: BÍCEPS (bloque 6) ─────────────────────────
     Las mismas reglas que en 70-coreografias.js: cada una sale de los pasos verificados de su ficha y no añade técnica
     que la ficha no diga. Van por familias: de pie con una barra, de pie con mancuernas (y con la pesa rusa), en un banco
     (sentado, inclinado, tumbado), el banco predicador y la araña, las poleas, la barra fija y el estiramiento.
     En casi todas el codo no se mueve («sin mover los codos», «sin despegar el brazo»): se fija el codo en su sitio y el
     antebrazo gira sobre él (codoDe + doblado). */
  (function () {
    /* ── las manos: en un curl giran con el antebrazo, así que se dicen por su giro (prono): −90, la palma hacia arriba (hacia delante,
       con el brazo colgando); 0, enfrentadas; 90, hacia abajo. Si agarran una barra recta, además, a lo largo de qué va ── */
    var SUP = { tipo: 'puno', prono: -90 }, NEU = { tipo: 'puno', prono: 0 }, PRO = { tipo: 'puno', prono: 90 };
    var SUP_BARRA = { tipo: 'puno', prono: -90, barra: [1, 0, 0] }, PRO_BARRA = { tipo: 'puno', prono: 90, barra: [1, 0, 0] };
    var SEMI = { tipo: 'puno', prono: -65 };          /* en una rampa de la barra Z: la muñeca, a medio girar */
    var LIBRE = { bd: aLosLados(10), md: SUELTA };    /* el brazo que no trabaja */

    /* ── el curl ──
       codoDe(P, ade, fuera): dónde queda el codo izquierdo de la postura P, con el brazo colgando del hombro «ade» grados hacia
       delante y «fuera» hacia el lado. De ahí no se mueve.
       doblado(P, C, fi, dx): el brazo con el codo en C y el antebrazo a «fi» grados de la plomada (0, cuelga; 90, horizontal hacia
       delante; 150, casi en el hombro), girando sobre el eje que va de lado a lado. dx: cuánto se abre el antebrazo hacia fuera (el
       seno). Si no se dice, lo mismo que se abre el brazo: así el codo se dobla solo hacia delante (si además se doblase hacia dentro,
       con el brazo casi estirado la mano no sabría hacia dónde mira). Con una barra las manos no cambian de sitio en ella y el
       antebrazo gira en un cono: dx es entonces lo que haga falta (abre) y el codo se pone en la línea del hombro al puño (codoHacia) */
    function codoDe(P, ade, fuera) {
      var h = resolver(P).i.hom, a = (ade || 0) * RAD, f = (fuera || 0) * RAD;
      return mas(h, por(unidad([Math.sin(f), -Math.cos(a) * Math.cos(f), Math.sin(a) * Math.cos(f)]), D.brazo));
    }
    function hacia(fi, dx) { var k = Math.sqrt(1 - (dx || 0) * (dx || 0)); return [dx || 0, -k * Math.cos(fi * RAD), k * Math.sin(fi * RAD)]; }
    function caida(P, C) { return (C[0] - resolver(P).i.hom[0]) / D.brazo; }
    function doblado(P, C, fi, dx) { return { a: mas(C, por(hacia(fi, dx == null ? caida(P, C) : dx), D.antebrazo)), polo: menos(C, resolver(P).i.hom) }; }
    /* el codo de un brazo que baja recto del hombro al puño, con el puño a G del centro y a «z» (delante de la cadera) y el codo doblado
       «flex» grados: queda un poco por detrás de esa línea, y el antebrazo, un poco por delante */
    function codoHacia(P, G, z, flex) {
      var h = resolver(P).i.hom, f = (flex == null ? 12 : flex) * RAD, L = D.antebrazo + D.mano;
      var d = Math.sqrt(D.brazo * D.brazo + L * L + 2 * D.brazo * L * Math.cos(f));
      var g = [G, h[1] - Math.sqrt(d * d - (G - h[0]) * (G - h[0]) - (z - h[2]) * (z - h[2])), z];
      var w = unidad(menos(g, h)), ade = unidad(sinParte([0, 0, 1], w)), al = Math.asin(L * Math.sin(f) / d);
      return mas(h, por(mas(por(w, Math.cos(al)), por(ade, -Math.sin(al))), D.brazo));
    }
    /* cuando el brazo no cuelga a plomo (apoyado en un cojín, en un muslo): flexion, flexionG y abre, en 70-coreografias.js (las usa
       también el bloque 7) */
    /* el puño (el centro de lo que agarra) de ese brazo */
    function punoEn(C, fi, dx) { return mas(C, por(hacia(fi, dx), D.antebrazo + D.mano)); }
    /* el ángulo con el que el puño queda a «z» (la barra, apoyada en los muslos) */
    function fiPara(C, z, dx) { return Math.asin(entre((z - C[2]) / ((D.antebrazo + D.mano) * Math.sqrt(1 - (dx || 0) * (dx || 0))), -1, 1)) / RAD; }

    /* ══════════ de pie, con una barra ══════════ */
    var FLEX = { pel: [0, PIE - 2.5, -1.5], giro: [0, 1, 0], p: { suelo: [15, 0], abre: 8 } };       /* «con las rodillas algo flexionadas» */
    var RECTO = { p: { suelo: [13, 0], abre: 8 } };
    var Z_MUSLO = 13.2;                               /* a esa distancia por delante de la cadera queda la barra apoyada en los muslos */
    /* o: { base, G (cada mano, del centro), mano, barra (el material), arriba (hasta dónde: grados), pausa, baja } */
    function curlBarra(o) {
      var P = sobre(o.base || FLEX, { m: o.mano || SUP_BARRA }), zb = resolver(P).pel[2] + Z_MUSLO, C = codoHacia(P, o.G, zb, 12);
      var dx = abre(C, o.G), fa = fiPara(C, zb, dx), fb = o.arriba || 146, pausa = o.pausa == null ? 0.3 : o.pausa;
      return {
        vista: o.vista || [50, 0], rastro: 'manos', esfuerzo: [0], clavos: ['ti', 'td'], material: [o.barra],
        posturas: { a: sobre(P, { b: doblado(P, C, fa, dx) }), b: sobre(P, { b: doblado(P, C, fb, dx) }) },
        rep: [['b', 1.25, 'empuje'], ['b', pausa], ['a', o.baja || 2.0, 'freno'], ['a', 0.45]],
        pasos: ['a', 'rep', { rep: 1.25 }]
      };
    }
    /* con la barra Z, en las rampas de fuera: apoyada en los muslos, sube hasta el pecho sin mover los codos y baja despacio */
    COREO['curl-barra-z'] = curlBarra({ G: 22.5, mano: SEMI, barra: ['barra', { z: true }] });
    /* la barra Z «por la parte más interior»: las manos, a unos 10 cm una de otra; arriba, una pausa breve */
    COREO['curl-barra-z-agarre-estrecho'] = curlBarra({ base: RECTO, G: 9.5, mano: SEMI, barra: ['barra', { z: true }], pausa: 0.7 });
    /* con las manos tan abiertas como resulte cómodo */
    COREO['curl-barra-agarre-ancho'] = curlBarra({ G: 36, barra: ['barra', { largo: 170, discos: 13 }], pausa: 0.7, vista: [24, 72] });
    /* con las manos a unos 30 centímetros */
    COREO['curl-barra-agarre-estrecho'] = curlBarra({ G: 15, barra: ['barra', { largo: 150, discos: 13 }], pausa: 0.7 });
    /* invertido: las palmas hacia abajo, a la anchura de los hombros; los codos, abajo y pegados a los costados */
    COREO['curl-invertido-barra'] = curlBarra({ base: RECTO, G: 20, mano: PRO_BARRA, barra: ['barra', { largo: 150, discos: 13 }], arriba: 142 });
    /* a una mano: una barra sin discos, cogida por el centro para que quede equilibrada; la mano libre, a un lado; sube hasta que el
       antebrazo toca el bíceps y baja despacio */
    COREO['curl-barra-una-mano'] = (function () {
      var P = sobre(RECTO, sobre(LIBRE, { mi: SUP })), C = codoDe(P, 4, 3), fa = fiPara(C, Z_MUSLO, caida(P, C));
      return {
        vista: [34, -8], rastro: 'mi', esfuerzo: [0], clavos: ['ti', 'td'], material: [['barra', { largo: 150, discos: 0, una: 'i' }]],
        posturas: { a: sobre(P, { bi: doblado(P, C, fa) }), b: sobre(P, { bi: doblado(P, C, 152) }) },
        rep: [['b', 1.3, 'empuje'], ['b', 0.3], ['a', 2.0, 'freno'], ['a', 0.45]],
        pasos: ['a', 'rep', { rep: 1.3 }]
      };
    })();

    /* ══════════ de pie, con mancuernas ══════════ */
    /* una y luego la otra: en el paso 2 sube una y se queda arriba; en el 3 la baja y repite con el otro brazo.
       o: { base, mano, ade, fuera, abajo, arriba (grados del antebrazo), vista } */
    function alterno(o) {
      var P = sobre(o.base, { m: o.mano }), C = codoDe(P, o.ade, o.fuera);
      var ab = doblado(P, C, o.abajo), ar = doblado(P, C, o.arriba);
      var i = sobre(P, { bi: ar, bd: reflejo(ab) });
      return {
        vista: o.vista || [44, 0], rastro: 'mi', esfuerzo: [2, 6], clavos: ['ti', 'td'], material: [['mancuernas']],
        posturas: { a: sobre(P, { b: ab }), i: i, d: refleja(i) },
        inicio: 'i',
        rep: [['a', 1.6, 'freno'], ['a', 0.25], ['d', 1.2, 'empuje'], ['d', 0.35], ['a', 1.6, 'freno'], ['a', 0.25], ['i', 1.2, 'empuje'], ['i', 0.35]],
        pasos: ['a', { sec: [['i', 1.2, 'empuje']], desde: 'a' }, 'rep']
      };
    }
    var SEPARADOS = { pel: [0, PIE - 2.5, -1.5], giro: [0, 1, 0], p: { suelo: [18, 0], abre: 9 } };       /* los pies separados y las rodillas algo flexionadas */
    /* el curl alterno: las mancuernas cuelgan con los brazos estirados; sube una hacia el hombro doblando el codo */
    COREO['curl-alterno-mancuernas'] = alterno({ base: SEPARADOS, mano: SUP, ade: 3, fuera: 6, abajo: 12, arriba: 146 });
    /* el martillo alterno: las palmas, enfrentadas; sube en arco hacia el hombro del mismo lado, sin girar la muñeca */
    COREO['curl-martillo-alterno'] = alterno({ base: FLEX, mano: NEU, ade: 2, fuera: 3, abajo: 7, arriba: 144 });
    /* el martillo cruzado: las palmas miran al cuerpo; sin girar el brazo, una mancuerna sube cruzando por delante hasta tocar el hombro
       contrario (el codo se adelanta lo justo para llegar); baja despacio, y la otra */
    COREO['curl-martillo-cruzado'] = (function () {
      var P = sobre(RECTO, { m: NEU }), C = codoDe(P, 2, 3), ab = doblado(P, C, 7), h = resolver(P).i.hom;
      var i = conAgarre(sobre(P, { bd: reflejo(ab) }), [-h[0] + 9.5, h[1] - 7.5, h[2] + 13.5], [1, -1, 0.5], 'bi');
      return {
        vista: [18, 62], rastro: 'mi', esfuerzo: [2, 6], clavos: ['ti', 'td'], material: [['mancuernas']],
        posturas: { a: sobre(P, { b: ab }), i: i, d: refleja(i) },
        inicio: 'i',
        rep: [['a', 1.9, 'freno'], ['a', 0.25], ['d', 1.25, 'empuje'], ['d', 0.35], ['a', 1.9, 'freno'], ['a', 0.25], ['i', 1.25, 'empuje'], ['i', 0.35]],
        pasos: ['a', { sec: [['i', 1.25, 'empuje']], desde: 'a' }, 'rep']
      };
    })();
    /* las mancuernas con las palmas hacia delante, a los lados: algo abiertas y adelantadas, para que no tropiecen con los muslos */
    function aLosLadosSup(P, mano) { var Q = sobre(P, { m: mano || SUP }), C = codoDe(Q, 5, 7); return { P: Q, C: C, b: doblado(Q, C, 12) }; }
    /* de arrastre: los codos van hacia atrás mientras las mancuernas suben pegadas al tronco hasta la altura del pecho; una pausa, y
       bajan despacio por el mismo camino */
    COREO['curl-arrastre'] = (function () {
      var L = aLosLadosSup(RECTO), P = L.P, h = resolver(P).i.hom, g0 = agarreDe(sobre(P, { b: L.b }));
      var g1 = [h[0] + 4, h[1] - 15.5, h[2] + 18.5];
      var en = function (k, polo) { return conAgarre(P, mezcla(g0, g1, k), polo); };
      return {
        vista: [64, 14], rastro: 'mi', esfuerzo: [0, 1], clavos: ['ti', 'td'], material: [['mancuernas']],
        posturas: { a: sobre(P, { b: L.b }), m: en(0.5, [0.35, -0.75, -1]), b: sobre(en(1, [0.3, -0.55, -1]), { hom: [0, -1.5] }) },
        rep: [['m', 0.7, 'entra'], ['b', 0.7, 'sale'], ['b', 0.7], ['m', 1.0, 'lineal'], ['a', 1.0, 'sale'], ['a', 0.45]],
        pasos: ['a', 'rep', { rep: 1.4 }]
      };
    })();
    /* Zottman: sube con las palmas hacia delante (hacia arriba); arriba las gira hacia abajo y baja despacio; y abajo las vuelve a girar
       hacia delante antes de la siguiente */
    COREO['curl-zottman'] = (function () {
      var L = aLosLadosSup(RECTO), P = L.P, C = L.C, Pp = sobre(P, { m: PRO });
      var arriba_ = doblado(P, C, 144);
      return {
        vista: [40, -4], rastro: 'mi', esfuerzo: [2], clavos: ['ti', 'td'], material: [['mancuernas']],
        posturas: { a: sobre(P, { b: L.b }), u: sobre(P, { b: arriba_ }), up: sobre(Pp, { b: arriba_ }), ap: sobre(Pp, { b: L.b }) },
        inicio: 'ap', encuadra: ['a'],
        rep: [['a', 0.8, 'suave'], ['a', 0.3], ['u', 1.25, 'empuje'], ['u', 0.2], ['up', 0.8, 'suave'], ['up', 0.2], ['ap', 2.3, 'freno'], ['ap', 0.3]],
        pasos: ['a', { sec: [['u', 1.25, 'empuje']], desde: 'a' }, { sec: [['up', 0.8, 'suave'], ['up', 0.2], ['ap', 2.3, 'freno']], desde: 'u' }, 'rep']
      };
    })();
    /* invertido: las palmas hacia abajo; con los brazos a los lados y los codos quietos, suben hacia los hombros; una pausa breve */
    COREO['curl-invertido-mancuernas'] = (function () {
      var L = aLosLadosSup(FLEX, PRO), P = L.P;
      return {
        vista: [46, 0], rastro: 'mi', esfuerzo: [0], clavos: ['ti', 'td'], material: [['mancuernas']],
        posturas: { a: sobre(P, { b: L.b }), b: sobre(P, { b: doblado(P, L.C, 140) }) },
        rep: [['b', 1.25, 'empuje'], ['b', 0.7], ['a', 1.9, 'freno'], ['a', 0.45]],
        pasos: ['a', 'rep', { rep: 1.25 }]
      };
    })();

    /* ══════════ con la pesa rusa ══════════ */
    /* a dos manos: las piernas algo separadas, los brazos estirados; dobla los codos hasta que las manos llegan a la altura de los
       hombros, y baja despacio hasta estirarlos */
    COREO['curl-kettlebell'] = (function () {
      var G = 5.5, P = { p: { suelo: [16, 0], abre: 9 }, m: SUP_BARRA }, h = resolver(P).i.hom;
      return {
        vista: [52, 4], rastro: 'manos', esfuerzo: [0], clavos: ['ti', 'td'], material: [['kettlebell', { cuelga: true }]],
        posturas: {
          a: estirado(P, [G, h[1] - 100, h[2] + 22], 'b', 0.5, [1, 0.1, -0.5]),
          b: conAgarre(P, [G, h[1] - 1.5, h[2] + 17], [1, -1, 0.15])
        },
        rep: [['b', 1.3, 'empuje'], ['b', 0.3], ['a', 2.1, 'freno'], ['a', 0.45]],
        pasos: ['a', 'rep', { rep: 1.3 }]
      };
    })();
    /* a una mano: el brazo estirado; dobla el codo hasta que la mano llega a la altura del hombro, y baja despacio */
    COREO['curl-kettlebell-una-mano'] = (function () {
      var P = sobre(RECTO, sobre(LIBRE, { mi: SUP })), C = codoDe(P, 6, 7), h = resolver(P).i.hom;
      var dx = caida(P, C), fb = busca(function (x) { return punoEn(C, x, dx)[1]; }, h[1] - 1.5, 110, 165);
      return {
        vista: [50, 2], rastro: 'mi', esfuerzo: [0], clavos: ['ti', 'td'], material: [['kettlebell', { lado: 'i', cuelga: true }]],
        posturas: { a: sobre(P, { bi: doblado(P, C, 14) }), b: sobre(P, { bi: doblado(P, C, fb) }) },
        rep: [['b', 1.3, 'empuje'], ['b', 0.3], ['a', 2.1, 'freno'], ['a', 0.45]],
        pasos: ['a', 'rep', { rep: 1.3 }]
      };
    })();

    /* ══════════ en un banco ══════════ */
    /* sentado, con la espalda recta y los pies en el suelo: las mancuernas cuelgan con las palmas enfrentadas; suben girando las palmas
       hacia arriba; aprieta arriba y baja despacio */
    COREO['curl-mancuernas-sentado'] = (function () {
      var P = sentadoAlBorde(0), C = codoDe(P, 2, 7);
      return {
        vista: [-40, 6], rastro: 'mi', esfuerzo: [0, 1], clavos: ['ti', 'td'], material: [BANCO_DETRAS, ['mancuernas']],
        posturas: { a: sobre(P, { b: doblado(P, C, 6), m: NEU }), b: sobre(P, { b: doblado(P, C, 146), m: SUP }) },
        rep: [['b', 1.3, 'empuje'], ['b', 0.7], ['a', 2.0, 'freno'], ['a', 0.45]],
        pasos: ['a', 'rep', { rep: 1.3 }]
      };
    })();
    /* inclinado: en un banco a 45 o 60 grados, con la espalda apoyada y los brazos colgando a plomo; con las palmas hacia delante y los
       brazos quietos, las mancuernas suben hacia los hombros y bajan sin que los brazos se balanceen */
    COREO['curl-inclinado-mancuernas'] = (function () {
      var ANG = 55, P = sentadoEnRespaldo(ANG, { cab: [8, 0, 0], m: SUP }), C = codoDe(P, 0, 5);
      return {
        vista: [58, 14], rastro: 'mi', esfuerzo: [0], clavos: ['ti', 'td'], material: [silla5(ANG), ['mancuernas']],
        posturas: { a: sobre(P, { b: doblado(P, C, 7) }), b: sobre(P, { b: doblado(P, C, 142) }) },
        rep: [['b', 1.3, 'empuje'], ['b', 0.3], ['a', 2.0, 'freno'], ['a', 0.45]],
        pasos: ['a', 'rep', { rep: 1.3 }]
      };
    })();
    /* tumbado boca arriba en un banco plano: los brazos cuelgan a los lados, hacia el suelo; sin mover los codos, las mancuernas suben
       hasta que los antebrazos quedan verticales, y bajan despacio hasta casi tocar el suelo */
    COREO['curl-tumbado-banco'] = (function () {
      var P = { pel: [0, 55, 30], giro: [0, -90, 0], p: { suelo: [17, 68], abre: 8, polo: [0.2, 1, 0.3] }, m: SUP }, h = resolver(P).i.hom;
      var CAE = 52, C = mas(h, por(unidad([0.14, -Math.sin(CAE * RAD), Math.cos(CAE * RAD)]), D.brazo));        /* el brazo cae 52 grados por debajo del banco, hacia los pies */
      return {
        vista: [-62, -112], picado: 12, rastro: 'mi', esfuerzo: [0], clavos: ['ti', 'td'], material: [['banco', { largo: 124 }], ['mancuernas']],
        posturas: { a: sobre(P, { b: doblado(P, C, 90 - CAE + 7) }), b: sobre(P, { b: doblado(P, C, 180) }) },
        rep: [['b', 1.4, 'empuje'], ['b', 0.3], ['a', 2.1, 'freno'], ['a', 0.45]],
        pasos: ['a', 'rep', { rep: 1.4 }]
      };
    })();
    /* la araña: boca abajo en un banco a 45 grados, con los pies en el suelo; deja colgar los brazos con las mancuernas y las sube hacia
       la cabeza, sin que los brazos se balanceen */
    COREO['curl-arana-mancuernas'] = (function () {
      var ANG = 45, LARGO = 124, ASIENTO = 38, ZB = -22;
      var s = Math.sin(ANG * RAD), c = Math.cos(ANG * RAD), bis = [0, 44, ZB - LARGO / 2 + ASIENTO];              /* la bisagra; de ahí el respaldo sube hacia +Z */
      var enRespaldo = function (t, fuera) { return [0, bis[1] + t * s + fuera * c, bis[2] + t * c - fuera * s]; };   /* a «t» de la bisagra y a «fuera» de la tapicería */
      var P = { pel: enRespaldo(37.5, 11.5), giro: [0, ANG, 0], cab: [-30, 0, 0], p: { suelo: [20, bis[2] - 31], abre: 4, talon: 58, polo: [0.2, -0.3, 1] }, m: SUP };
      var C = codoDe(P, 0, 5);
      return {
        vista: [-58, -122], rastro: 'mi', esfuerzo: [0, 1], clavos: ['ti', 'td'],
        material: [['banco', { en: [0, ZB], largo: LARGO, respaldo: ANG, asiento: ASIENTO }], ['mancuernas']],
        posturas: { s: sobre(P, { b: doblado(P, C, 118) }), a: sobre(P, { b: doblado(P, C, 7) }), b: sobre(P, { b: doblado(P, C, 142) }) },
        encuadra: ['s'],
        rep: [['b', 1.3, 'empuje'], ['b', 0.6], ['a', 2.0, 'freno'], ['a', 0.45]],
        pasos: ['s', { sec: [['a', 1.6, 'freno']], desde: 's' }, 'rep']
      };
    })();

    /* de pie detrás de un banco inclinado (a 45 grados; su respaldo sube hacia él): se inclina sobre el canto y apoya el brazo en la parte
       alta del respaldo, estirado hacia abajo (la mancuerna, de momento, en la otra mano); en el paso 2 se la pasa y la coge con la
       palma hacia arriba; y, sin despegar el brazo del banco, la sube hacia la cabeza, una pausa, y la baja despacio */
    COREO['curl-banco-inclinado-de-pie'] = (function () {
      var ANG = 45, INC = 32, ZC = 60, XP = -14, sn = Math.sin(ANG * RAD), cs = Math.cos(ANG * RAD);
      var T = [0, 40.5 + 86 * sn + 3.5 * cs, ZC - (-24 + 86 * cs - 3.5 * sn)];                  /* el canto de arriba de la tapicería */
      var FUERA = [0, cs, sn];
      /* el hombro izquierdo: sobre el respaldo, a 4,4 cm de la tapicería; cuánto antes del canto, lo dice la altura a la que queda */
      var d0 = resolver({ pel: [0, 0, 0], giro: [0, INC, 0] }).i.hom, hy = 84 + d0[1], antes = (hy - T[1] - 4.4 * cs) / sn, hz = T[2] + 4.4 * sn - antes * cs;
      var P = { pel: [XP, 84, hz - d0[2]], giro: [0, INC, 0], cab: [-INC * 0.6, 0, 0], p: { suelo: [11, hz - d0[2] - 4], abre: 8, polo: [0.25, 0.1, 1] } };
      var hi = resolver(P).i.hom, C = mas(hi, por([0, -sn, cs], D.brazo));
      var cuelgaD = { bd: { cuelga: [2, 0], largo: 50 } };
      var en = function (fi, extra) { return sobre(P, sobre({ bi: flexion(P, C, fi, FUERA), mi: SUP }, extra)); };
      var g0 = en(114, {}), pg = agarreDe(g0, 'i');
      var g = conAgarre(sobre(g0, { md: { tipo: 'puno', barra: [1, 0, 0], palma: [0, 0, -1] } }), pg, [-1, -0.7, 0.1], 'bd');
      var libre = sobre(cuelgaD, { md: SUELTA });
      return {
        vista: [52, 128], rastro: 'mi', esfuerzo: [0, 1], clavos: ['ti', 'td'], reposo: ['s'],
        material: [['banco', { en: [0, ZC], rumbo: 180, largo: 124, respaldo: ANG, tapa: true }], ['mancuernas', { lado: 'i', otra: 'd', reposo: {} }]],
        posturas: {
          s: en(5, sobre(cuelgaD, { mi: SUELTA, md: { tipo: 'puno', barra: [0, 0, 1], palma: [1, 0, 0] } })),
          g: g, a: en(5, libre), b: en(106, libre)
        },
        encuadra: ['s', 'g'],
        rep: [['b', 1.3, 'empuje'], ['b', 0.6], ['a', 2.1, 'freno'], ['a', 0.4]],
        pasos: ['s', { sec: [['g', 1.1, 'suave'], ['g', 0.3], ['a', 1.4, 'suave']], desde: 's' }, 'rep']
      };
    })();

    /* ── el curl concentrado: sentado en el extremo de un banco, con las piernas separadas ── */
    function abierto(pies) { return function (inc, extra) { return sobre({ pel: [0, 55, 0], giro: [0, inc, 0], cab: [-inc * 0.5, 0, 0], p: pies }, extra || {}); }; }
    /* el punto de la cara interna del muslo izquierdo donde se apoya el codo: a «k» del muslo (de la cadera a la rodilla) */
    function enMusloDentro(P, k, dentro, abajo) { var E = resolver(P), q = mezcla(E.i.cad, E.i.rod, k); return [q[0] - (dentro == null ? 10.5 : dentro), q[1] - (abajo == null ? 1.5 : abajo), q[2] + 1]; }
    /* el antebrazo, descansando a lo largo del muslo de su lado (con el tronco tan inclinado, la mano en la rodilla dejaría el codo en alto):
       el del lado izquierdo; el derecho es su reflejo */
    function sobreMuslo(P) {
      var E = resolver(P), q = function (k) { var v = mezcla(E.i.cad, E.i.rod, k); return [v[0], v[1] + 9.5, v[2]]; };
      var w = q(0.86), c = q(0.3);
      return { a: [w[0] + 1, w[1], w[2]], polo: menos([c[0] + 5, c[1] + 2, c[2]], E.i.hom) };
    }
    var EN_MUSLO = { tipo: 'abierta', prono: 90, mun: -12 };
    /* con mancuerna: en el paso 1, sentado, con la mancuerna en una mano y la palma hacia delante; en el 2 se inclina y apoya la parte
       de atrás del brazo en la cara interna del muslo; y la sube hacia el hombro sin despegarlo */
    COREO['curl-concentrado'] = (function () {
      var S = abierto({ suelo: [29, 34], abre: 24 }), C = enMusloDentro(S(0), 0.8);
      var inc = busca(function (x) { return largo(menos(resolver(S(x)).i.hom, C)); }, D.brazo, 30, 88);
      var P = S(inc, { mi: SUP }), u = unidad(menos(C, resolver(P).i.hom)), f0 = Math.acos(entre(-u[1], -1, 1)) / RAD;
      var P0 = S(14, { mi: { tipo: 'puno', palma: [0, 0, 1] } }), h0 = resolver(P0).i.hom;      /* «con la palma hacia delante» */
      var con = function (Q) { return sobre(Q, { bd: reflejo(sobreMuslo(Q)), md: EN_MUSLO }); };
      return {
        vista: [-28, 44], rastro: 'mi', esfuerzo: [0], clavos: ['ti', 'td'], material: [BANCO_DETRAS, ['mancuernas', { lado: 'i' }]],
        posturas: {
          s: con(estirado(P0, [3, h0[1] - 100, h0[2] + 34], 'bi', 0.5, [1, 0.2, -0.4])),
          a: con(sobre(P, { bi: flexion(P, C, f0, [0, -1, 0]) })),
          b: con(sobre(P, { bi: flexion(P, C, 140, [0, -1, 0]) }))
        },
        encuadra: ['s'],
        rep: [['b', 1.3, 'empuje'], ['b', 0.35], ['a', 2.0, 'freno'], ['a', 0.45]],
        pasos: ['s', { sec: [['a', 1.6, 'suave']], desde: 's' }, 'rep', 'rep']
      };
    })();
    /* con barra: inclina el tronco con la espalda recta; coge la barra (que espera en el suelo, ante él) con las palmas hacia arriba y
       las manos a unos 15 cm, los codos contra la cara interna de los muslos; la sube hacia el pecho y la baja hasta cerca del suelo */
    COREO['curl-concentrado-barra'] = (function () {
      var G = 9, S = abierto({ suelo: [27, 28], abre: 20 }), C = enMusloDentro(S(0), 0.82, 9.5, 0);
      var inc = busca(function (x) { return largo(menos(resolver(S(x)).i.hom, C)); }, D.brazo, 30, 88);
      var P = S(inc, { m: SUP_BARRA }), u = unidad(menos(C, resolver(P).i.hom)), f0 = Math.acos(entre(-u[1], -1, 1)) / RAD;
      var doblar = function (fi) { return sobre(P, { b: flexionG(P, C, fi, [0, -1, 0], G) }); };
      var a = doblar(f0), R = Math.round((agarreDe(a)[1] - 0.3) * 10) / 10, Ps = S(inc);      /* con el antebrazo a plomo, los discos tocan el suelo */
      return {
        vista: [-38, 40], rastro: 'manos', esfuerzo: [0], clavos: ['ti', 'td'], reposo: ['s'],
        material: [BANCO_DETRAS, ['barra', { largo: 150, discos: R, reposo: [0, R + 0.3, agarreDe(a)[2]] }]],
        posturas: { s: sobre(Ps, { b: sobreMuslo(Ps), m: EN_MUSLO }), a: a, a2: doblar(f0 + 17), b: doblar(132) },
        inicio: 'a2', encuadra: ['s', 'a'],
        rep: [['b', 1.3, 'empuje'], ['b', 0.3], ['a2', 2.1, 'freno'], ['a2', 0.45]],
        pasos: ['s', { sec: [['a', 1.4, 'suave'], ['a', 0.3], ['a2', 0.6, 'suave']], desde: 's' }, 'rep']
      };
    })();

    /* ══════════ el banco predicador ══════════
       Sentado, con el tronco algo inclinado y el pecho contra el cojín. El cojín se coloca para ese cuerpo («ajuste el asiento para que
       los brazos queden a la altura del apoyo»): su canto, bajo las axilas; la cara inclinada, bajo los brazos, que bajan por ella a 45
       grados. El codo descansa en el cojín y de ahí no se mueve: el antebrazo sube «hacia la cabeza» (flexion, hacia fuera del cojín). */
    var ARRIBA_PRED = 108;                            /* hasta dónde sube el antebrazo «hacia la cabeza»: las manos, ante la barbilla */
    var PRED = (function () {
      var ANG = 45, INC = 20, ASIENTO = 50, LARGO = 32, sn = Math.sin(ANG * RAD), cs = Math.cos(ANG * RAD);
      var R_BRAZO = 4.4, ANTES = 14.3;                /* el brazo va a 4,4 cm de la tapicería, y el hombro queda 14,3 cm antes del canto */
      var sen = function (inc, extra) { return sobre({ pel: [0, ASIENTO + 11, 0], giro: [0, inc, 0], cab: [-inc * 0.7, 0, 0], p: { suelo: [17, 24], abre: 14, polo: [0.3, 0.2, 1] } }, extra || {}); };
      var P = sen(INC), h = resolver(P).i.hom;
      var T = [0, h[1] - R_BRAZO * cs - ANTES * sn, h[2] - R_BRAZO * sn + ANTES * cs];           /* el canto de la cara inclinada */
      var EN = T[2] - 3, FUERA = [0, cs, sn];
      return {
        P: P, sen: sen, T: T, FUERA: FUERA, ANG: ANG, LARGO: LARGO,
        /* el banco; ganchos: dónde espera la barra (un punto del mundo) */
        banco: function (o) {
          o = o || {};
          var m = { en: [0, EN], alto: T[1], ang: ANG, largo: LARGO, asiento: [EN + 8, ASIENTO] };
          if (o.ganchos) { m.ganchos = [o.ganchos[1], o.ganchos[2] - EN]; m.sep = o.sep || 33; }
          return ['predicador', m];
        },
        /* el codo izquierdo, sobre el cojín (fuera: cuánto se abre el brazo) */
        codo: function (Q, fuera) { var q = resolver(Q || P).i.hom; return mas(q, por(unidad([fuera || 0, -sn, cs]), D.brazo)); },
        /* las manos, por encima del canto (sentado, antes de apoyar los brazos) */
        sobreCanto: function (G, extra, alto) { var Q = sen(5, extra); return conAgarre(Q, [G, T[1] + (alto == null ? 8 : alto), T[2] + 1], [1, -1, -0.25]); }
      };
    })();
    /* hacia dónde sube el extremo de fuera de cada puño: el plano de la W de la barra Z, para cuando espera en sus ganchos */
    function planoZ(Q) {
      var E = resolver(Q), e = unidad(menos(E.i.agarre, E.d.agarre), [1, 0, 0]), ui = E.i.mano.eje, ud = E.d.mano.eje;
      if (punto(ui, e) < 0) ui = por(ui, -1);
      if (punto(ud, e) > 0) ud = por(ud, -1);
      return unidad(mas(sinParte(ui, e), sinParte(ud, e)), [0, 0, 1]);
    }
    /* con barra (la Z, en sus rampas de fuera), que espera en los ganchos del banco: en el paso 2 apoya los brazos estirados y la coge;
       sin despegarlos, la sube hacia la cabeza, una pausa breve, y la baja despacio hasta estirar los codos */
    COREO['curl-predicador-barra'] = (function () {
      var G = 22.5, P = sobre(PRED.P, { m: SEMI }), C = PRED.codo(P, 0.06);
      var en = function (fi) { return sobre(P, { b: flexionG(P, C, fi, PRED.FUERA, G) }); };
      var a = en(5), g = agarreDe(a);
      return {
        vista: [-58, -18], rastro: 'manos', esfuerzo: [0, 1], clavos: ['ti', 'td'], reposo: ['s'],
        material: [PRED.banco({ ganchos: [0, g[1], g[2]], sep: 33 }), ['barra', { z: true, reposo: [0, g[1], g[2]], w: planoZ(a) }]],
        posturas: { s: PRED.sobreCanto(15, { m: { tipo: 'suelta', prono: 60 } }, 5), a: a, b: en(ARRIBA_PRED) },
        encuadra: ['s'],
        rep: [['b', 1.3, 'empuje'], ['b', 0.6], ['a', 2.1, 'freno'], ['a', 0.4]],
        pasos: ['s', { sec: [['a', 1.6, 'suave']], desde: 's' }, 'rep']
      };
    })();
    /* a una mano, con mancuerna: la tiene ya cogida, con la palma hacia arriba; en el paso 2 apoya el brazo estirado en el cojín (la otra
       mano descansa sobre él); la sube hacia la cabeza sin despegar el brazo y la baja despacio */
    function unBrazoPred(extraS) {
      var P = sobre(PRED.P, { mi: SUP }), C = PRED.codo(P, 0), T = PRED.T;
      /* la mano libre, descansando sobre el canto del cojín */
      var descansa = { bd: { a: [-20, T[1] + 3.6, T[2] + 0.5], polo: [-1, -0.42, -0.4] }, md: { tipo: 'abierta', prono: 90 } };
      return { P: sobre(P, descansa), C: C, descansa: descansa };
    }
    COREO['curl-predicador-mancuerna'] = (function () {
      var U = unBrazoPred(), P = U.P, C = U.C;
      var en = function (fi) { return sobre(P, { bi: flexion(P, C, fi, PRED.FUERA) }); };
      return {
        vista: [-56, -14], rastro: 'mi', esfuerzo: [0], clavos: ['ti', 'td'],
        material: [PRED.banco(), ['mancuernas', { lado: 'i' }]],
        posturas: { s: sobre(PRED.sobreCanto(19, { mi: SUP }, 11), { bd: aLosLados(16), md: SUELTA }), a: en(5), b: en(ARRIBA_PRED) },
        encuadra: ['s'],
        rep: [['b', 1.3, 'empuje'], ['b', 0.3], ['a', 2.1, 'freno'], ['a', 0.4]],
        pasos: ['s', { sec: [['a', 1.6, 'suave']], desde: 's' }, 'rep']
      };
    })();
    /* martillo: una mancuerna en cada mano, con las palmas enfrentadas; los brazos, estirados sobre el cojín a la anchura de los hombros;
       sin despegar brazos ni codos, suben hacia la cabeza, una pausa, y bajan despacio */
    COREO['curl-predicador-martillo'] = (function () {
      var P = sobre(PRED.P, { m: NEU }), C = PRED.codo(P, 0);
      var en = function (fi) { return sobre(P, { b: flexion(P, C, fi, PRED.FUERA) }); };
      return {
        vista: [-56, -14], rastro: 'manos', esfuerzo: [0, 1], clavos: ['ti', 'td'],
        material: [PRED.banco(), ['mancuernas']],
        posturas: { s: PRED.sobreCanto(19, { m: NEU }, 11), a: en(5), b: en(ARRIBA_PRED) },
        encuadra: ['s'],
        rep: [['b', 1.3, 'empuje'], ['b', 0.6], ['a', 2.1, 'freno'], ['a', 0.4]],
        pasos: ['s', { sec: [['a', 1.6, 'suave']], desde: 's' }, 'rep']
      };
    })();
    /* Zottman en el predicador, a una mano: empieza con el brazo estirado sobre el cojín y la palma hacia arriba; sube y, al acercarse al
       pecho, gira la muñeca hasta que la palma mira hacia abajo; una pausa, y vuelve a la posición inicial */
    COREO['curl-zottman-predicador'] = (function () {
      var U = unBrazoPred(), P = U.P, C = U.C;
      var en = function (fi, m) { return sobre(P, { bi: flexion(P, C, fi, PRED.FUERA), mi: m || SUP }); };
      return {
        vista: [-56, -14], rastro: 'mi', esfuerzo: [0, 1], clavos: ['ti', 'td'],
        material: [PRED.banco(), ['mancuernas', { lado: 'i' }]],
        posturas: { a: en(5), m: en(82), b: en(ARRIBA_PRED, PRO) },
        rep: [['m', 1.0, 'entra'], ['b', 0.7, 'sale'], ['b', 0.7], ['a', 2.2, 'freno'], ['a', 0.4]],
        pasos: ['a', 'rep', { rep: 1.7 }]
      };
    })();
    /* en polea: el banco, frente a la polea baja, con una barra corta enganchada, que espera en los ganchos; apoya los brazos estirados y
       la coge con las palmas hacia arriba y las manos a unos 15 cm; tira hacia la cabeza, una pausa breve, y baja despacio */
    COREO['curl-predicador-polea'] = (function () {
      var G = 9, P = sobre(PRED.P, { m: SUP_BARRA }), C = PRED.codo(P, -0.17);
      var en = function (fi) { return sobre(P, { b: flexionG(P, C, fi, PRED.FUERA, G) }); };
      var a = en(5), g = agarreDe(a);
      return {
        vista: [-62, -22], rastro: 'manos', esfuerzo: [0, 1], clavos: ['ti', 'td'], reposo: ['s'],
        material: [PRED.banco({ ganchos: [0, g[1], g[2]], sep: 17 }), ['polea', { en: [0, g[2] + 92], alto: 20, a: 'manos', agarre: 'barra', reposo: [0, g[1], g[2]], ancho0: G, sobra: 13, encuadre: 150 }]],
        posturas: { s: PRED.sobreCanto(15, { m: { tipo: 'suelta', prono: 60 } }, 5), a: a, b: en(ARRIBA_PRED) },
        encuadra: ['s'],
        rep: [['b', 1.3, 'empuje'], ['b', 0.6], ['a', 2.1, 'freno'], ['a', 0.4]],
        pasos: ['s', { sec: [['a', 1.6, 'suave']], desde: 's' }, 'rep']
      };
    })();

    /* la araña con barra: el mismo banco, usado desde el otro lado. De pie, el pecho sobre la cara inclinada y los hombros por encima del
       canto: los brazos cuelgan a plomo por la cara vertical. La barra espera atravesada en el asiento, justo debajo de las manos: la
       coge con las palmas hacia arriba y las manos a unos 15 cm, y la sube hasta que el bíceps toca el antebrazo */
    COREO['curl-arana-barra'] = (function () {
      var G = 9, H = 89, ANG = PRED.ANG, ZT = 25, sn = Math.sin(ANG * RAD), cs = Math.cos(ANG * RAD);
      /* el hombro: a 11,5 cm de la tapicería (el pecho descansa en ella) y 6 cm más allá de la cara vertical */
      var hz = ZT + 6, hy = H + (11.5 + (hz - ZT + 3) * sn) / cs;
      var d0 = resolver({ pel: [0, 0, 0], giro: [0, ANG, 0] }).i.hom;
      var P = { pel: [0, hy - d0[1], hz - d0[2]], giro: [0, ANG, 0], cab: [-30, 0, 0], p: { suelo: [12, hz - d0[2] - 16], abre: 8, polo: [0.2, 0.1, 1] }, m: SUP_BARRA };
      var C = codoHacia(P, G, hz + 2.6, 8), dx = abre(C, G);
      var en = function (fi) { return sobre(P, { b: doblado(P, C, fi, dx) }); };
      var a = en(fiPara(C, hz + 2.6, dx)), g = agarreDe(a);
      return {
        vista: [-66, -124], rastro: 'manos', esfuerzo: [0], clavos: ['ti', 'td'], reposo: ['s'],
        material: [['predicador', { en: [0, ZT], rumbo: 180, alto: H, ang: ANG, largo: PRED.LARGO, asiento: [g[2] - ZT + 10, g[1] - 1.5] }],
                   ['barra', { largo: 120, discos: 9.5, reposo: [0, g[1], g[2]] }]],          /* discos pequeños: «empiece con poco peso» */
        posturas: { s: sobre(P, { b: doblado(P, codoDe(P, 0, 4), 6), m: SUELTA }), a: a, b: en(150) },
        encuadra: ['s'],
        rep: [['b', 1.3, 'empuje'], ['b', 0.3], ['a', 2.1, 'freno'], ['a', 0.45]],
        pasos: ['s', { sec: [['a', 1.1, 'suave']], desde: 's' }, 'rep']
      };
    })();

    /* ══════════ las poleas ══════════ */
    /* de pie ante la polea baja, que queda delante: se agacha (lo justo: se busca) hasta que las manos llegan al agarre, que espera junto
       a la polea */
    function aLaPoleaBaja(R, G, mano) {
      var Pg = function (k) { return { pel: [0, PIE - 2 - k * 0.42, -k * 0.38], giro: [0, k, 0], cab: [-k * 0.5, 0, 0], p: { suelo: [15, 0], abre: 9, polo: [0.3, 0.1, 1] }, m: mano }; };
      var k = busca(function (x) { return largo(menos(resolver(Pg(x)).i.hom, [G, R[1], R[2]])); }, BRAZO - 1, 10, 88);
      return conAgarre(Pg(k), [G, R[1], R[2]], [0.5, 0.3, -1]);
    }
    /* con una barra corta: de pie a 30 o 40 cm de la polea, las rodillas algo flexionadas; la coge con las palmas hacia arriba y las manos
       bastante juntas, los brazos estirados ante los muslos; sube hasta la parte alta del pecho doblando solo los codos; pausa, y vuelve */
    COREO['curl-polea-baja'] = (function () {
      var G = 8, ZC = 64, R = [0, 29, ZC - 25], P = sobre(FLEX, { m: SUP_BARRA }), zb = resolver(P).pel[2] + Z_MUSLO + 1;
      var C = codoHacia(P, G, zb, 12), dx = abre(C, G), fa = fiPara(C, zb, dx);
      return {
        vista: [-58, 20], rastro: 'manos', esfuerzo: [0, 1], clavos: ['ti', 'td'], reposo: ['s'],
        material: [['polea', { en: [0, ZC], alto: 20, a: 'manos', agarre: 'barra', reposo: R, ancho0: G, sobra: 13, encuadre: 150 }]],
        posturas: { s: sobre(FLEX, { b: aLosLados(8), m: SUELTA }), g: aLaPoleaBaja(R, G, SUP_BARRA), a: sobre(P, { b: doblado(P, C, fa, dx) }), b: sobre(P, { b: doblado(P, C, 150, dx) }) },
        encuadra: ['s', 'g'],
        rep: [['b', 1.3, 'empuje'], ['b', 0.7], ['a', 2.0, 'freno'], ['a', 0.45]],
        pasos: ['s', { sec: [['g', 1.3, 'suave'], ['g', 0.25], ['a', 1.3, 'suave']], desde: 's' }, 'rep']
      };
    })();
    /* martillo, con la cuerda: la sujeta con las dos manos, las palmas enfrentadas y el cuerpo recto; con los codos quietos a los lados,
       sube la carga; y baja despacio sin llegar a estirar del todo los brazos */
    COREO['curl-martillo-polea-cuerda'] = (function () {
      var G = 7, ZC = 66, R = [0, 30, ZC - 27], P = sobre(RECTO, { m: NEU }), C = codoHacia(P, G, 11, 14), dx = abre(C, G);
      return {
        vista: [-56, 22], rastro: 'manos', esfuerzo: [0], clavos: ['ti', 'td'], reposo: ['s'],
        material: [['polea', { en: [0, ZC], alto: 20, a: 'manos', agarre: 'cuerda', reposo: R, encuadre: 150 }]],
        posturas: {
          s: sobre(RECTO, { b: aLosLados(8), m: SUELTA }), g: aLaPoleaBaja(R, G, NEU),
          a: sobre(P, { b: doblado(P, C, fiPara(C, 11, dx), dx) }), a2: sobre(P, { b: doblado(P, C, 36, dx) }), b: sobre(P, { b: doblado(P, C, 142, abre(C, 10)) })
        },
        inicio: 'a2', encuadra: ['s', 'g', 'a'],
        rep: [['b', 1.3, 'empuje'], ['b', 0.3], ['a2', 2.1, 'freno'], ['a2', 0.4]],
        pasos: [{ sec: [['s', 0.8], ['g', 1.3, 'suave'], ['g', 0.25], ['a', 1.3, 'suave']], desde: 's' }, 'rep', { rep: 1.3 }]
      };
    })();
    /* a una mano, de lado a la máquina (queda a su izquierda): con las rodillas algo flexionadas, coge el estribo con la palma hacia
       arriba y lleva la mano junto a los muslos; sin mover el codo, lo sube hacia el pecho y lo baja despacio */
    COREO['curl-polea-una-mano'] = (function () {
      var XL = 52, R = [XL - 17, 30, 3], P = sobre(FLEX, sobre(LIBRE, { mi: SUP })), C = codoDe(P, 4, 5);
      var Pg = function (k) { return sobre(LIBRE, { pel: [5, PIE - 2 - k * 0.5, -k * 0.3], giro: [0, k, 0], col: [3, 16, 0], cab: [-k * 0.4, -8, 0], p: { suelo: [15, 0], abre: 9, polo: [0.3, 0.1, 1] }, mi: SUP }); };
      var k = busca(function (x) { return largo(menos(resolver(Pg(x)).i.hom, R)); }, BRAZO - 1, 5, 80);
      return {
        vista: [-34, 28], rastro: 'mi', esfuerzo: [0], clavos: ['ti', 'td'], reposo: ['s'],
        material: [['polea', { en: [XL, 3], rumbo: 90, alto: 22, a: 'i', agarre: 'asa', reposo: R, encuadre: 150 }]],
        posturas: {
          s: sobre(FLEX, { b: aLosLados(8), m: SUELTA }), g: conAgarre(Pg(k), R, [0.6, 0.3, -1], 'bi'),
          a: sobre(P, { bi: doblado(P, C, 13) }), b: sobre(P, { bi: doblado(P, C, 146) })
        },
        encuadra: ['s', 'g'],
        rep: [['b', 1.3, 'empuje'], ['b', 0.3], ['a', 2.0, 'freno'], ['a', 0.45]],
        pasos: ['s', { sec: [['g', 1.2, 'suave'], ['g', 0.25], ['a', 1.2, 'suave']], desde: 's' }, 'rep']
      };
    })();
    /* entre dos poleas altas: coge un estribo con cada mano, las palmas hacia arriba; estira los brazos hacia los lados, a la altura de
       los hombros; y, sin mover los codos, lleva las manos hacia los lados de la cabeza */
    COREO['curl-polea-alta'] = (function () {
      var X = 106, HP = 190, Ri = [X - 26, HP - 32, 0], Rd = [-Ri[0], Ri[1], 0];
      var centro = { p: { suelo: [13, 0], abre: 8 } }, h = resolver(centro).i.hom, C = [h[0] + D.brazo, h[1] + 0.5, h[2]];
      var enCruz = function (fi) { return flexion(centro, C, fi, [0, 1, 0]); };
      /* un paso hacia la polea de su izquierda: lo que haga falta para que esa mano llegue al estribo */
      var paso = function (k) { return { pel: [k, PIE - 1, 0], giro: [0, 0, 5], col: [0, 8, 0], pi: { suelo: [k + 15, 0], abre: 14 }, pd: { suelo: [k - 13, 0], abre: 6 } }; };
      var k = busca(function (x) { return largo(menos(resolver(paso(x)).i.hom, Ri)); }, BRAZO - 1.5, 0, 60);
      var dob = enCruz(128);
      var g1 = conAgarre(sobre(paso(k), { mi: SUP, bd: aLosLados(12), md: SUELTA }), Ri, [0.5, -1, 0.2], 'bi');
      var g2 = conAgarre(sobre(refleja(paso(k)), { md: SUP, bi: { a: [dob.a[0] - k * 0.6, dob.a[1] - 6, dob.a[2] + 3], polo: [1, -0.8, 0] }, mi: SUP }), Rd, [-0.5, -1, 0.2], 'bd');
      return {
        vista: [0, [34, 14]], rastro: 'manos', esfuerzo: [0, 1], clavos: ['ti', 'td'],
        material: [['polea', { en: [X, 0], rumbo: 90, alto: HP, a: 'i', agarre: 'asa', reposo: Ri, reposoEn: ['s'], encuadre: HP + 14 }],
                   ['polea', { en: [-X, 0], rumbo: -90, alto: HP, a: 'd', agarre: 'asa', reposo: Rd, reposoEn: ['s', 'g1'], encuadre: HP + 14 }]],
        posturas: {
          s: sobre(centro, { b: aLosLados(8), m: SUELTA }), g1: g1, g2: g2,
          b: sobre(centro, { b: dob, m: SUP }), a: sobre(centro, { b: enCruz(9), m: SUP })
        },
        encuadra: ['s', 'g1', 'g2'],
        rep: [['b', 1.3, 'empuje'], ['b', 0.6], ['a', 2.0, 'freno'], ['a', 0.45]],
        pasos: [{ sec: [['s', 0.5, null, []], ['g1', 1.2, 'suave', []], ['g1', 0.2, null, []], ['g2', 1.7, 'suave', []], ['g2', 0.2, null, []], ['b', 1.3, 'suave', []]], desde: 's' },
                { sec: [['a', 1.6, 'freno']], desde: 'b' }, 'rep']
      };
    })();
    /* tumbado boca arriba en el suelo, con los pies hacia la máquina: la barra corta de la polea más baja espera sobre los muslos; la
       coge con las palmas hacia arriba, los brazos estirados y los codos a los lados, y tira de ella en arco hasta el pecho.
       Con los brazos estirados hasta lo alto de los muslos, el codo no toca el suelo; al doblarlos baja a apoyarse en él, junto al
       costado, y de ahí gira el antebrazo: es la única forma de que la barra acabe en el pecho y no en el cuello */
    COREO['curl-tumbado-polea'] = (function () {
      var G = 19, ZC = 140, YB = 24.3;                /* la barra, encima de los muslos (el pantalón llega a 23 cm del suelo) */
      var P = sobre(SUPINO_SUELO, { cab: [8, 0, 0], p: { a: [10, 6.8, 117.4], polo: [0, 1, 0] }, t: { punta: [0, 1, 0.12], arriba: [0, 0.12, -1] }, m: SUP_BARRA });
      var h = resolver(P).i.hom, L = D.antebrazo + D.mano;
      /* estirados: el codo, doblado 12 grados hacia arriba, sobre la línea del hombro al puño */
      var f = 12 * RAD, d = Math.sqrt(D.brazo * D.brazo + L * L + 2 * D.brazo * L * Math.cos(f));
      var g = [G, YB, h[2] + Math.sqrt(d * d - (G - h[0]) * (G - h[0]) - (YB - h[1]) * (YB - h[1]))];
      var w = unidad(menos(g, h)), arr = unidad(sinParte([0, 1, 0], w)), al = Math.asin(L * Math.sin(f) / d);
      var Ca = mas(h, por(mas(por(w, Math.cos(al)), por(arr, -Math.sin(al))), D.brazo));
      var a = sobre(P, { b: { a: mas(Ca, por(unidad(menos(g, Ca)), D.antebrazo)), polo: menos(Ca, h) } });
      /* doblados: el codo, en el suelo, junto al costado */
      var C = [h[0] + 3.5, 6.2, h[2] + Math.sqrt(D.brazo * D.brazo - 3.5 * 3.5 - (h[1] - 6.2) * (h[1] - 6.2))];
      var en = function (fi) { return sobre(P, { b: flexionG(P, C, fi, [0, 1, 0], G) }); };
      return {
        vista: [-55, -140], picado: 20, rastro: 'manos', esfuerzo: [0, 1], reposo: ['s'],
        material: [['polea', { en: [0, ZC], alto: 14, a: 'manos', agarre: 'barra', reposo: g, ancho0: G, sobra: 6, encuadre: 60 }]],
        posturas: { s: sobre(P, { b: { a: [C[0] + 4, 5, C[2] + 23], polo: [0.4, -0.2, 1] }, m: { tipo: 'abierta', palma: [0, -1, 0] } }), a: a, m: en(84), b: en(142) },
        encuadra: ['s'],
        rep: [['m', 0.75, 'entra'], ['b', 0.65, 'sale'], ['b', 0.7], ['m', 0.9, 'entra'], ['a', 1.1, 'sale'], ['a', 0.45]],
        pasos: ['s', { sec: [['a', 1.4, 'suave']], desde: 's' }, 'rep']
      };
    })();

    /* ══════════ en la barra fija ══════════ */
    /* el remo invertido con las palmas hacia él: cuelga bajo la barra con los brazos estirados y el cuerpo recto, sobre los talones; en el
       paso 2 afirma los hombros y empieza a doblar los codos; en el 3 tira hasta acercar el pecho a la barra y baja con control */
    COREO['remo-invertido-supino'] = (function () {
      var HB = 80, ZT = 88, G = 20;
      var bajo = function (ang, hom, polo) {
        var s = Math.sin(ang * RAD), c = Math.cos(ang * RAD);
        return { pel: [0, 8 + 78 * s, ZT - 78 * c], giro: [0, -(90 - ang), 0], hom: hom, p: { e: 0, z: 0, c: 0 }, t: { punta: [0, 0.97, 0.24], arriba: [0, 0.24, -0.97] }, m: EN_BARRA_SUP, b: { a: [G, HB - 8, 0], polo: polo || [0.4, -1, 0.1] } };
      };
      /* el ángulo del cuerpo con el que el hombro queda a «d» del agarre */
      var con = function (d, hom) { return busca(function (x) { return largo(menos(resolver(bajo(x, hom)).i.hom, [G, HB, 0])); }, d, 4, 60); };
      var a0 = con(BRAZO - 0.3, [1, 2.4]), a2 = con(BRAZO - 0.3, [0, -2]), b = con(23.5, [0, -2.4]);
      return {
        vista: [-72, -28], rastro: 'pecho', esfuerzo: [0, 4], clavos: ['mi@0:' + G, 'md@0:' + (-G), 'ti', 'td'],
        material: [['barra_dominadas', { alto: HB, ancho: 62 }]],
        posturas: { a: bajo(a0, [1, 2.4]), a2: bajo(a2, [0, -2]), m: bajo(a2 + (b - a2) * 0.5, [0, -2.2]), b: bajo(b, [0, -2.4]) },
        inicio: 'm', encuadra: ['a'],
        rep: [['b', 0.6, 'sale'], ['b', 0.4], ['a2', 1.8, 'freno'], ['a2', 0.4], ['m', 0.6, 'entra']],
        pasos: ['a', { sec: [['a2', 0.9, 'suave'], ['m', 0.9, 'entra']], desde: 'a' }, 'rep']
      };
    })();
    /* el curl con el peso del cuerpo: bajo una barra a la altura del pecho, con los pies por delante de ella, la coge con las palmas hacia
       él; se echa hacia atrás hasta estirar los brazos (el cuerpo, recto e inclinado, sobre los talones); y dobla los codos, que quedan
       altos y cerca de la barra, para acercar el tronco a ella: arriba la barra queda ante la cara, como la mancuerna al final de un curl */
    COREO['curl-biceps-peso-corporal'] = (function () {
      var HB = 110, ZT = 50, G = 19, M = [G, HB, 0], YT = 10;
      var HACIA_EL = { tipo: 'puno', barra: [1, 0, 0], palma: [0, 0.7, -0.7] };
      var cuerpo = function (beta, extra) {
        var s = Math.sin(beta * RAD), c = Math.cos(beta * RAD);
        return sobre({ pel: [0, YT + 78 * s, ZT - 78 * c], giro: [0, -(90 - beta), 0], p: { e: 0, z: 0, c: 0 }, t: { punta: [0, c, s], arriba: [0, s, -c] }, m: HACIA_EL }, extra || {});
      };
      /* el ángulo del cuerpo con el que el hombro queda a «d» de la barra */
      var con = function (d, extra) { return busca(function (x) { return largo(menos(resolver(cuerpo(x, extra)).i.hom, M)); }, d, 20, 75); };
      var b0 = con(BRAZO - 0.4, { hom: [0, 1] }), b1 = con(22);
      return {
        vista: [70, 24], rastro: 'pecho', esfuerzo: [0], clavos: ['mi@0:' + G, 'md@0:' + (-G), 'ti', 'td'],
        material: [['barra_dominadas', { alto: HB, ancho: 62 }]],
        posturas: {
          s: conAgarre(cuerpo(b0 + (b1 - b0) * 0.72), M, [0.5, -1, 0]),
          a: conAgarre(cuerpo(b0, { hom: [0, 1] }), M, [0.6, -0.5, 0.3]),
          b: conAgarre(cuerpo(b1, { cab: [8, 0, 0] }), M, [0.45, 0.35, 1])
        },
        encuadra: ['s'],
        rep: [['b', 1.25, 'empuje'], ['b', 0.4], ['a', 1.9, 'freno'], ['a', 0.4]],
        pasos: ['s', { sec: [['a', 1.6, 'suave']], desde: 's' }, 'rep']
      };
    })();
    /* el muscle-up, en sus tres tiempos: una dominada explosiva (la enseña dos veces: la segunda se queda arriba, con la barra ante la
       parte alta del pecho); el giro rápido de las muñecas, con el que los antebrazos pasan por encima de la barra; y, con el cuerpo
       inclinado hacia delante, estirar los codos hasta quedar con la barra a la altura de la cintura y los brazos rectos */
    COREO['muscle-up'] = (function () {
      var G = 28, M = [G, ALTO_BARRA, 0];
      var ENCIMA = { tipo: 'puno', barra: [1, 0, 0], palma: [0, -1, -0.2] }, APOYO = { tipo: 'puno', barra: [1, 0, 0], palma: [0, -0.3, -1] };
      var p = conAgarre(sobre(COLGADO, { pel: [0, 178.8, -9.5], giro: [0, -14, 0], hom: [-1, -1.5], col: [-4, 0, 0], cab: [5, 0, 0], p: { e: 22, z: 0, c: 14 } }), M, [1, -1, -0.3]);
      var t_ = conAgarre({ pel: [0, 207.3, -20.75], giro: [0, 30, 0], cab: [-20, 0, 0], p: { e: 34, z: 0, c: 16 }, t: { tob: 30 }, m: ENCIMA }, M, [0.8, 0.5, -1]);
      var s = conAgarre({ pel: [0, 241, -12], giro: [0, 8, 0], cab: [-4, 0, 0], hom: [-1.5, 0], p: { e: 14, z: 0, c: 4 }, t: { tob: 34 }, m: APOYO }, M, [1, -0.1, -0.6]);
      return {
        vista: [66, 18], rastro: 'hombros', clavos: clavosB(G),
        material: [barraD({ ancho: 64 })],
        posturas: { a: cuelga(G), a2: activo(G), p: p, t: t_, s: s },
        encuadra: ['p', 't', 's'],
        pasos: [{ sec: [['a', 0.9], ['a2', 0.45, 'suave'], ['p', 0.5, 'sale'], ['p', 0.25], ['a2', 1.2, 'freno'], ['a2', 0.35], ['p', 0.5, 'sale']], desde: 'a' },
                { sec: [['p', 0.5], ['t', 0.6, 'sale']], desde: 'p' },
                { sec: [['t', 0.4], ['s', 1.3, 'empuje']], desde: 't' }]
      };
    })();

    /* ══════════ el estiramiento ══════════ */
    /* de pie, con un brazo cerca de una pared (queda a su izquierda): lo estira y apoya la mano en ella; gira el cuerpo con suavidad hacia
       el otro lado; y cambia de brazo (se da la vuelta: la pared queda a su derecha) */
    COREO['estiramiento-biceps-pared'] = (function () {
      var L = D.brazo + D.antebrazo - 0.35;           /* del hombro a la muñeca, con el brazo estirado */
      var punto = [D.hombroX + Math.sqrt(L * L - 2.5 * 2.5 - 2 * 2), 127, -2], punto2 = [punto[0], punto[1], -punto[2]];
      var mano = { tipo: 'abierta', prono: 0, mun: -70 };
      var estira = { bi: { a: punto, polo: [0.3, -1, -0.4] }, mi: mano, md: SUELTA };
      var vuelto = { pi: { suelo: [-10, 0], abre: 6 }, pd: { suelo: [10, 0], abre: 6 }, bd: { a: punto2, polo: [0.3, -1, 0.4] }, md: mano, mi: SUELTA };
      /* al girar el cuerpo, se arrima a la pared lo justo para que el brazo siga estirado y la mano no se mueva */
      var girado = function (x) { return sobre(estira, { pel: [x, 86, 2], giro: [-38, 0, 0], cab: [0, 10, 0] }); };
      var girado2 = function (x) { return sobre(vuelto, { pel: [x, 86, -2], giro: [218, 0, 0], cab: [0, -10, 0] }); };
      var x2 = busca(function (x) { return largo(menos(resolver(girado2(x)).d.hom, punto2)); }, L, 0, 14);
      return {
        vista: [-34, -150], isometrico: 'b2', clavos: [],
        material: [['pared', { x: punto[0] + 8.5, z: 0, normal: [-1, 0, 0], ancho: 130 }]],
        posturas: {
          s: { b: aLosLados(8), m: SUELTA },
          a: estira,
          b: aUnBrazo(girado, punto, 0, 14),
          a2: sobre(vuelto, { giro: [180, 0, 0] }),
          b2: girado2(x2)
        },
        inicio: 's', encuadra: ['b', 'b2'],
        pasos: ['s', { sec: [['a', 1.4, 'suave', []]], desde: 's' },
                { sec: [['b', 1.4, 'suave', ['mi']], ['b', 0.7, null, ['mi']], ['a', 0.7, 'suave', ['mi']], ['a2', 1.1, 'suave', []], ['b2', 1.1, 'suave', ['md']]], desde: 'a' }]
      };
    })();
  })();
