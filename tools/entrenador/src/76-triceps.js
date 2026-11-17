  /* ───────────────────────── las coreografías: TRÍCEPS (bloque 7) ─────────────────────────
     Las mismas reglas que en 70-coreografias.js: cada una sale de los pasos verificados de su ficha y no añade técnica
     que la ficha no diga. Van por familias: tumbado (el press francés y sus variantes), por encima de la cabeza (de pie y
     sentado), las patadas, las poleas, los press en banco, los fondos y las flexiones, y el estiramiento.
     En casi todas el brazo no se mueve y solo se estira el codo: se fija el codo en su sitio (alzado) y el antebrazo gira
     sobre él (flexion, flexionG). */
  (function () {
    /* ── las manos: donde el codo se dobla en un solo plano giran con el antebrazo y se dicen por su giro (prono): 0, enfrentadas; 90, la
       palma hacia los pies (tumbado, con los brazos arriba), y en una barra recta, además, a lo largo de qué va; en una rampa de la barra
       Z, la muñeca a medio girar. Donde no (el brazo colgando estirado, el antebrazo que va hacia dentro), se dicen en el mundo, más abajo ── */
    var NEU = { tipo: 'puno', prono: 0 }, PRO_BARRA = { tipo: 'puno', prono: 90, barra: [1, 0, 0] }, SEMI = { tipo: 'puno', prono: 65 };
    var L32 = D.antebrazo + D.mano;                   /* del codo al centro de lo que agarra */
    var ATRAS = [0, 0, -1];                           /* hacia donde se dobla el codo: hacia la cabeza (tumbado) o hacia atrás (de pie) */

    /* ── el brazo que se estira ──
       alzado(P, dir, hacia, flex, G): el brazo izquierdo de la postura P, casi estirado (doblado «flex» grados hacia «hacia») desde el
       hombro en la dirección «dir» (del mundo); con G, el puño queda a G del centro (una barra). Devuelve el codo (C), que de ahí no
       se mueve, y el puño de arriba (g). El codo queda un poco al otro lado de la línea del hombro al puño: así el brazo se dobla solo
       hacia «hacia», nunca de lado (con el brazo casi estirado, la mano no sabría hacia dónde mira) */
    function alzado(P, dir, hacia, flex, G) {
      var h = resolver(P).i.hom, f = (flex == null ? 12 : flex) * RAD, d = Math.sqrt(D.brazo * D.brazo + L32 * L32 + 2 * D.brazo * L32 * Math.cos(f));
      var w = unidad(dir);
      if (G != null) { var dx = (G - h[0]) / d, r = Math.sqrt(1 - dx * dx), l = Math.sqrt(w[1] * w[1] + w[2] * w[2]) || 1; w = [dx, r * w[1] / l, r * w[2] / l]; }
      var lado = unidad(sinParte(hacia || ATRAS, w)), al = Math.asin(L32 * Math.sin(f) / d);
      return { C: mas(h, por(mas(por(w, Math.cos(al)), por(lado, -Math.sin(al))), D.brazo)), g: mas(h, por(w, d)), h: h };
    }
    /* hacia dónde se dobla el codo cuando el antebrazo tiene que pasar junto a la cabeza y no por encima: hacia atrás y «fi» grados hacia fuera */
    function atrasFuera(fi) { return [Math.sin(fi * RAD), 0, -Math.cos(fi * RAD)]; }

    /* ══════════ tumbado: el press francés y sus variantes ══════════
       o: { ang (el banco: 0, 45, −15), base, mano, G (una barra: cada mano, del centro), fuera (las mancuernas: cuántos grados se abre
       el antebrazo al doblarse, para pasar junto a la cabeza y no por encima), tilt (el brazo, cuántos grados hacia la cabeza), abajo
       (cuánto se dobla el codo), baja, sube, material, mas (otras posturas: lo que cambia sobre la base), inicio, pasos } */
    function frances(o) {
      var P = tumbadoEn(o.ang || 0, sobre(o.base || {}, { m: o.mano })), t = (o.tilt || 0) * RAD;
      var hacia = o.fuera ? atrasFuera(o.fuera) : ATRAS, A = alzado(P, [0, Math.cos(t), -Math.sin(t)], hacia, 12, o.G);
      var en = function (fi) { return sobre(P, { b: o.G != null ? flexionG(P, A.C, fi, hacia, o.G) : flexion(P, A.C, fi, hacia) }); };
      var baja = o.baja || 1.8, sube = o.sube || 1.2, pos = { a: en(12), b: en(o.abajo) }, k;
      for (k in (o.mas || {})) pos[k] = sobre(P, o.mas[k]);
      return {
        vista: o.vista || [80, 140], picado: o.picado == null ? 14 : o.picado, rastro: 'manos', esfuerzo: o.esfuerzo || [0], clavos: ['ti', 'td'],
        material: [bancoDe(o.ang || 0)].concat(o.material),
        posturas: pos, inicio: o.inicio || 'b', encuadra: ['a'],
        rep: o.inicio === 'a' ? [['b', baja, 'freno'], ['b', 0.3], ['a', sube, 'empuje'], ['a', 0.4]] : [['a', sube, 'empuje'], ['a', 0.3], ['b', baja, 'freno'], ['b', 0.4]],
        pasos: o.pasos || ['a', { sec: [['b', baja, 'freno']], desde: 'a' }, 'rep']
      };
    }
    /* las mancuernas, antes de subirlas: junto a los hombros, con los codos doblados (en el marco del tórax) */
    var EN_HOMBROS = { b: { a: [22, 15, 12.5], en: 'torax', polo: [0.45, -1, -0.15] } };
    /* con la barra Z, por las rampas de fuera (las manos quedan sobre los hombros): baja hacia la frente y, justo antes de tocarla, sube */
    COREO['press-frances-barra-z'] = frances({ mano: SEMI, G: 22.5, abajo: 112, material: [['barra', { z: true }]] });
    /* con la barra recta: arriba, la barra sobre la cara (el brazo, 12° hacia la cabeza); baja despacio hasta justo encima de la frente y sube despacio */
    COREO['press-frances-barra'] = frances({ mano: PRO_BARRA, G: 19, tilt: 12, abajo: 103, baja: 2.0, sube: 1.7, material: [['barra', { largo: 150, discos: 13 }]] });
    /* con mancuernas, las palmas enfrentadas: bajan en arco junto a la cabeza */
    COREO['press-frances-mancuernas'] = frances({ mano: NEU, fuera: 10, abajo: 131, material: [['mancuernas']] });
    /* una mancuerna entre las dos manos, en línea con los antebrazos (como en el pullover): del pecho al techo y, con el brazo quieto, en
       arco hacia atrás. Con el brazo vertical, a Jérôme el antebrazo no le llega detrás de la cabeza (la tiene grande): baja hasta que
       queda horizontal, y la mancuerna acaba encima de la frente, a 9 cm de ella */
    COREO['extension-triceps-tumbado-una-mancuerna'] = (function () {
      var G = 4.5, P = tumbadoEn(0, { m: NEU }), A = alzado(P, [0, 1, 0], ATRAS, 12, G);
      var en = function (fi) { return sobre(P, { b: flexionG(P, A.C, fi, ATRAS, G) }); };
      return {
        vista: [80, 140], picado: 14, rastro: 'manos', esfuerzo: [2], clavos: ['ti', 'td'],
        material: [bancoDe(0), ['mancuernas', { lado: 'i', dos: true, medio: true }]],
        posturas: { p: conAgarre(P, [G, 76.5, -2], [1, -0.5, 0.35]), a: en(12), b: en(93) },
        inicio: 'a', encuadra: ['a'],
        rep: [['b', 1.9, 'freno'], ['b', 0.3], ['a', 2.1, 'suave'], ['a', 0.4]],
        pasos: ['p', { sec: [['a', 1.5, 'empuje']], desde: 'p' }, 'rep']
      };
    })();
    /* a una mano (la izquierda; el cambio de brazo no se hace): la libre cruza el pecho y sujeta el brazo por encima del codo; la
       mancuerna, pequeña («empiece con poco peso»), baja hacia la cabeza y solo se mueve el antebrazo */
    COREO['extension-triceps-tumbado-un-brazo'] = (function () {
      var hacia = atrasFuera(8), P = tumbadoEn(0, { mi: NEU, md: { tipo: 'suelta', palma: [1, 0, -0.2] } }), A = alzado(P, [0, 1, 0], hacia, 12);
      var enAbdomen = { a: [-9, 9, 11.5], en: 'pelvis', polo: [-1, -0.2, -0.3] }, sujeta = { a: [9.5, 68.5, -9], polo: [-0.2, 0.5, 1] };
      var en = function (fi, libre) { return sobre(P, { bi: flexion(P, A.C, fi, hacia), bd: libre || sujeta }); };
      return {
        vista: [80, 140], picado: 14, rastro: 'mi', esfuerzo: [2], clavos: ['ti', 'td'],
        material: [bancoDe(0), ['mancuernas', { lado: 'i', radio: 5.6 }]],
        posturas: { a0: sobre(en(12, enAbdomen), { md: { tipo: 'suelta', prono: 90 } }), a: en(12), b: en(128) },
        inicio: 'a', encuadra: ['a'],
        rep: [['b', 1.8, 'freno'], ['b', 0.3], ['a', 1.3, 'empuje'], ['a', 0.4]],
        pasos: ['a0', { sec: [['a', 1.3, 'suave']], desde: 'a0' }, 'rep']
      };
    })();
    /* en banco inclinado a 45°: las mancuernas esperan junto a los hombros, suben sobre ellos (los brazos, a plomo) y bajan por detrás de la cabeza */
    COREO['press-frances-inclinado-mancuernas'] = frances({ ang: 45, mano: NEU, fuera: 12, abajo: 124, inicio: 'a', esfuerzo: [2], material: [['mancuernas']], mas: { p: EN_HOMBROS },
      vista: [72, 138], pasos: ['p', { sec: [['a', 1.3, 'empuje']], desde: 'p' }, 'rep'] });
    /* en banco declinado (los pies, arriba, en el asiento, como en los press declinados): los brazos, perpendiculares al pecho, así que
       apuntan 15° hacia la cabeza; el codo no se mueve y la barra baja hacia la cabeza; vuelve despacio */
    var PIES_EN_ASIENTO = { p: { suelo: [9, 50], alto: 44, abre: 4, polo: [0.1, 1, 0.2] } };
    COREO['press-frances-declinado-barra-z'] = frances({ ang: -15, base: PIES_EN_ASIENTO, mano: SEMI, G: 22.5, tilt: 15, abajo: 110, sube: 2.0, material: [['barra', { z: true }]], vista: [72, 140] });
    COREO['press-frances-declinado-mancuernas'] = frances({ ang: -15, base: PIES_EN_ASIENTO, mano: NEU, fuera: 10, tilt: 15, abajo: 126, sube: 2.0, material: [['mancuernas']], mas: { p: EN_HOMBROS },
      vista: [72, 140], pasos: ['p', { sec: [['a', 1.3, 'empuje'], ['a', 0.45], ['b', 1.8, 'freno']], desde: 'p' }, 'rep'] });
    /* en el suelo: aquí el brazo sí se va hacia atrás (la ficha no lo fija): la barra pasa sobre la frente y baja por detrás de la cabeza
       hasta que sus discos (13 cm de radio) se apoyan en el suelo */
    COREO['press-frances-suelo'] = (function () {
      var G = 22.5, P = sobre(SUPINO_SUELO, { cab: [8, 0, 0], p: { suelo: [11, 62], abre: 4, polo: [0.1, 1, 0.2] }, m: SEMI });
      var A = alzado(P, [0, 1, 0], ATRAS, 12, G), con = function (g, polo) { return conAgarre(P, g, polo); };
      return {
        vista: [80, 140], picado: 14, rastro: 'manos', esfuerzo: [0, 1], clavos: ['ti', 'td'],
        material: [['barra', { z: true }]],
        posturas: { a: sobre(P, { b: flexionG(P, A.C, 12, ATRAS, G) }), m: con([G, 41, -62], [0.25, 1, 0.5]), b: con([G, 13, -80], [0.25, 1, 0.25]) },
        inicio: 'b', encuadra: ['a'],
        rep: [['m', 0.8, 'lineal'], ['a', 0.9, 'empuje'], ['a', 0.4], ['m', 1.1, 'lineal'], ['b', 0.9, 'freno'], ['b', 0.5]],
        pasos: ['a', { sec: [['m', 1.1, 'lineal'], ['b', 0.9, 'freno']], desde: 'a' }, 'rep']
      };
    })();

    /* ══════════ por encima de la cabeza, de pie o sentado ══════════
       Jérôme tiene la cabeza grande y el codo, con el brazo en alto, le queda a la altura de las orejas: con las dos manos juntas arriba,
       los brazos estirados no caben a los lados de la cabeza. Así que sube los hombros, mete un poco la barbilla y lleva los brazos
       algo hacia atrás («tilt» grados): pasan justo por detrás de la cabeza, con los codos pegados a ella, que es lo que piden las fichas */
    var ARRIBA = { hom: [4, 0], cab: [10, 0, 0] };
    function alto(P, tilt, G, hacia) {
      var t = tilt * RAD, A = alzado(P, [0, Math.cos(t), -Math.sin(t)], hacia || ATRAS, 12, G);
      A.en = function (fi) { return sobre(P, { b: G != null ? flexionG(P, A.C, fi, hacia || ATRAS, G) : flexion(P, A.C, fi, hacia || ATRAS) }); };
      return A;
    }
    /* una mancuerna con las dos manos: las manos, por debajo del disco de arriba (la mancuerna cuelga a plomo de ellas). Del pecho (o
       del regazo) a lo alto no cabe por encima de la cabeza (colgando de las manos le llega 18 cm por debajo de ellas, y las manos de
       Jérôme, con los brazos estirados, solo suben 17 por encima de la coronilla): la rodea por la izquierda. La mano derecha la suelta un momento, la izquierda la sube
       junto a la oreja y la lleva detrás, y allí la derecha la vuelve a coger (une: true) */
    var DOS_MANOS = ['mancuernas', { lado: 'i', dos: true, une: true, ejeDos: [0, 1, 0], corre: -5 }];
    function enTorax(P, v) { var E = resolver(P); return mas(E.tor, aplicar(E.Bt, v)); }
    /* o: { base (de pie o sentado), tilt, abajo, previa: [dónde la tiene antes de subirla (el puño izquierdo, en el marco del tórax), hacia dónde va el codo]
       (o p, esa postura ya hecha), vista, material, baja } */
    function dosManosArriba(o) {
      var G = 4.5, P0 = sobre(o.base, { m: NEU }), P = sobre(P0, ARRIBA), A = alto(P, o.tilt, G);
      var P1 = sobre(P0, { hom: [2, 0], cab: [5, 0, 0], md: SUELTA });
      var rodea = function (Q, gi, pi, gd, pd) { return conAgarre(conAgarre(Q, enTorax(Q, gi), pi, 'bi'), enTorax(Q, gd), pd, 'bd'); };
      var baja = o.baja || 1.8;
      return {
        vista: o.vista || [112, 58], rastro: 'manos', esfuerzo: [2], clavos: ['ti', 'td'], material: (o.material || []).concat([DOS_MANOS]),
        posturas: {
          p: o.p || conAgarre(P0, enTorax(P0, o.previa[0]), o.previa[1]),
          m1: rodea(P1, [22, 55, 3], [1, -0.5, 0.2], [-15, 40, 13], [-0.6, -1, 0.1]),
          m2: rodea(sobre(P, { md: SUELTA }), [17, 68, -20], [1, 0.25, 0.1], [-17, 62, -13], [-1, 0.2, 0.3]),
          a: A.en(12), b: A.en(o.abajo)
        },
        encuadra: ['a'], baja: baja,
        sube: [['m1', 0.85, 'suave'], ['m2', 0.6, 'lineal'], ['a', 0.75, 'suave']]
      };
    }
    /* de pie: la tiene ante el pecho; la sube y, con los codos cerca de la cabeza, la baja en arco por detrás; y estira los codos */
    COREO['extension-triceps-sobre-cabeza-mancuerna'] = (function () {
      var c = dosManosArriba({ base: DE_PIE, tilt: 15, abajo: 108, previa: [[4.5, 17, 15.5], [0.75, -1, 0.1]] }), sube = c.sube, baja = c.baja;
      delete c.sube; delete c.baja;
      c.inicio = 'b'; c.esfuerzo = [0];
      c.rep = [['a', 1.3, 'empuje'], ['a', 0.35], ['b', baja, 'freno'], ['b', 0.4]];
      c.pasos = ['p', { sec: sube.concat([['a', 0.3], ['b', baja, 'freno']]), desde: 'p' }, 'rep'];
      return c;
    })();
    /* sentado en un banco con respaldo (corto: no estorba a la mancuerna cuando baja por detrás). En el paso 1 solo se sienta: la mancuerna
       espera de pie sobre el muslo izquierdo, bajo esa mano, y la otra mano descansa en el otro muslo. En el 2 la coge con las dos (la
       izquierda la sube junto a la cabeza y la derecha la alcanza detrás) y estira los brazos; y la baja despacio por detrás de la cabeza */
    COREO['extension-triceps-sentado-mancuerna'] = (function () {
      var S0 = sentadoEnRespaldo(85, { mi: NEU, md: { tipo: 'abierta', palma: [0, -1, 0] } }), E = resolver(S0);
      var qi = mezcla(E.i.cad, E.i.rod, 0.6), qd = mezcla(E.d.cad, E.d.rod, 0.62);         /* un punto de cada muslo; su cara de arriba queda 9,3 cm por encima */
      var p = conAgarre(conAgarre(S0, [qi[0] + 1, qi[1] + 9.3 + 13.2 + 5, qi[2]], [1, -0.4, -0.5], 'bi'), [qd[0] - 1, qd[1] + 9.3 + 1.5, qd[2]], [-1, 0.1, -0.7], 'bd');
      var c = dosManosArriba({ base: sentadoEnRespaldo(85), tilt: 20, abajo: 108, baja: 2.1, p: p,
        material: [['banco', { rumbo: 180, largo: 88, respaldo: 85, en: [0, 18] }]] }), sube = [['m1', 1.0, 'suave']].concat(c.sube.slice(1)), baja = c.baja;
      delete c.sube; delete c.baja;
      c.inicio = 'a';
      c.rep = [['b', baja, 'freno'], ['b', 0.3], ['a', 1.3, 'empuje'], ['a', 0.4]];
      c.pasos = ['p', { sec: sube, desde: 'p' }, 'rep'];
      return c;
    })();
    /* a una mano (la izquierda; el cambio de brazo no se hace): el brazo, a plomo sobre el hombro; el codo no se mueve y el antebrazo
       baja por detrás de la cabeza hacia dentro, hasta que la mancuerna queda en la línea de la columna */
    COREO['extension-triceps-un-brazo-mancuerna'] = (function () {
      var P = sobre(DE_PIE, { hom: { i: [4, 0], d: [0, 0] }, cab: [8, 0, 0], mi: NEU, bd: { e: 6, z: 80, g: 90, c: 10 } });
      var hacia = [-0.62, 0, -0.78], A = alzado(P, [0, 1, -0.06], hacia, 12), h = A.h;
      var abajo = function (g) { return sobre(P, { bi: { a: mas(A.C, por(unidad(menos(g, A.C)), D.antebrazo)), polo: menos(A.C, h) } }); };
      return {
        vista: [118, 60], rastro: 'mi', esfuerzo: [0], clavos: ['ti', 'td'], material: [['mancuernas', { lado: 'i' }]],
        posturas: { a: sobre(P, { bi: flexion(P, A.C, 12, hacia) }), b: abajo([0, 146, -26]) },
        inicio: 'b', encuadra: ['a'],
        rep: [['a', 1.3, 'empuje'], ['a', 0.35], ['b', 1.8, 'freno'], ['b', 0.4]],
        pasos: ['a', { sec: [['b', 1.8, 'freno']], desde: 'a' }, 'rep']
      };
    })();
    /* con barra y agarre estrecho (las manos, a 20 cm): los codos, arriba y cerca de la cabeza; la barra baja por detrás */
    COREO['extension-triceps-sobre-cabeza-barra'] = (function () {
      var G = 10, P = sobre(DE_PIE, sobre(ARRIBA, { m: PRO_BARRA })), A = alto(P, 9, G);
      return {
        vista: [112, 58], rastro: 'manos', esfuerzo: [0], clavos: ['ti', 'td'], material: [['barra', { largo: 150, discos: 13 }]],
        posturas: { a: A.en(12), b: A.en(114) },
        inicio: 'b', encuadra: ['a'],
        rep: [['a', 1.3, 'empuje'], ['a', 0.35], ['b', 1.8, 'freno'], ['b', 0.4]],
        pasos: ['a', { sec: [['b', 1.8, 'freno']], desde: 'a' }, 'rep']
      };
    })();

    /* ══════════ las patadas ══════════
       Inclinado hacia delante, el brazo va pegado al tronco y no se mueve; el codo, doblado a 90°, se estira hacia atrás.
       patada(P, dir, hacia, k): el brazo (k: 'b', los dos; 'bi', el izquierdo) va del hombro hacia «dir» (ahí queda el codo); doblado a 90°, el
       antebrazo apunta hacia «hacia»; estirado, le quedan 12° (el codo, a 168°) */
    function patada(P, dir, hacia, k) {
      var C = mas(resolver(P).i.hom, por(unidad(dir), D.brazo));
      var en = function (fi) { var q = {}; q[k || 'b'] = flexion(P, C, fi, hacia); return sobre(P, q); };
      return { a: en(90), b: en(12), C: C };
    }
    /* las palmas, hacia el cuerpo: dicho en el mundo, para que valga también con el brazo colgando estirado (ahí el codo no dice hacia dónde mira la mano) */
    var AL_CUERPO = { tipo: 'puno', palma: [-1, 0, 0] };
    /* la mano libre (la derecha), apoyada en el muslo de su lado: a «t» de la cadera a la rodilla, por delante */
    var EN_MUSLO = { tipo: 'abierta', palma: [0, -0.62, -0.78] };
    function manoEnMuslo(P, t, polo) {
      var E = resolver(P), q = mezcla(E.d.cad, E.d.rod, t), u = unidad(menos(E.d.rod, E.d.cad)), n = unidad(sinParte([0, 0.4, 1], u));
      return conAgarre(sobre(P, { md: EN_MUSLO }), mas(q, por(n, 8.5)), polo || [-1, 0.3, -0.5], 'bd');
    }
    /* con una mancuerna (en la izquierda): los pies en paso, con la pierna derecha delante; la mano derecha, en ese muslo; el tronco, a
       60° de la vertical. El brazo, paralelo al tronco; el codo, a 90°; y se estira del todo */
    COREO['patada-triceps-mancuerna'] = (function () {
      var ANG = 60, s = Math.sin(ANG * RAD), c = Math.cos(ANG * RAD);
      var pies = { pd: { suelo: [-10, 18], abre: 5 }, pi: { suelo: [11, -30], abre: 8, talon: 16 } };
      var E0 = sobre(pies, { pel: [0, PIE - 4, -6], mi: AL_CUERPO, md: SUELTA }), h0 = resolver(E0).i.hom;
      var P = manoEnMuslo(sobre(pies, { pel: [0, 80, -10], giro: [0, ANG, 0], cab: [-25, 0, 0], mi: AL_CUERPO }), 0.6), h = resolver(P).i.hom;
      var K = patada(P, [0.06, -c, -s], [0, -s, c], 'bi');
      return {
        vista: [78, 118], rastro: 'mi', esfuerzo: [0], clavos: ['ti', 'td'], material: [['mancuernas', { lado: 'i' }]],
        posturas: {
          e: estirado(E0, [22, h0[1] - 60, h0[2] + 2], 'bi', 0.3, [1, 0.2, -0.6]),
          s: estirado(P, [21, h[1] - 60, h[2] + 2], 'bi', 0.3, [1, 0.2, -0.6]),
          a: K.a, b: K.b
        },
        inicio: 'a', encuadra: ['e'],
        rep: [['b', 1.1, 'empuje'], ['b', 0.4], ['a', 1.9, 'freno'], ['a', 0.4]],
        pasos: [{ sec: [['s', 1.5, 'suave']], desde: 'e' }, { sec: [['a', 1.2, 'suave']], desde: 's' }, 'rep']
      };
    })();
    /* con dos: el tronco, casi paralelo al suelo (a 80° de la vertical); los brazos, pegados a él y paralelos al suelo; los antebrazos
       cuelgan y se estiran hacia atrás. Las palmas, hacia el cuerpo */
    COREO['patada-triceps-dos-mancuernas'] = (function () {
      var P = inclinado(80, { m: AL_CUERPO }), E0 = sobre(DE_PIE, { m: AL_CUERPO }), K = patada(P, [0.05, 0, -1], [0, -1, 0]);
      return {
        vista: [80, 122], rastro: 'manos', esfuerzo: [0], clavos: ['ti', 'td'], material: [['mancuernas']],
        posturas: { e: colgando(E0, 22, 2), s: colgando(P, 21, 0), a: K.a, b: K.b },
        inicio: 'a', encuadra: ['e'],
        rep: [['b', 1.1, 'empuje'], ['b', 0.4], ['a', 1.9, 'freno'], ['a', 0.4]],
        pasos: [{ sec: [['s', 1.6, 'suave']], desde: 'e' }, { sec: [['a', 1.2, 'suave']], desde: 's' }, 'rep']
      };
    })();
    /* en polea baja, a una mano (la izquierda): inclinado ante la columna, lleva el codo arriba y atrás; el brazo, paralelo al suelo (queda
       un poco por encima de la línea del tronco, que baja hacia la cadera); el cable pasa junto a la pierna */
    COREO['patada-triceps-polea'] = (function () {
      var P = manoEnMuslo(inclinado(60, { cab: [-24, 0, 0], mi: AL_CUERPO }), 0.55, [-1, 0.2, -0.4]), h = resolver(P).i.hom;
      var K = patada(P, [0.06, 0, -1], [0, -1, 0], 'bi');
      return {
        vista: [78, 118], rastro: 'mi', esfuerzo: [0], clavos: ['ti', 'td'], material: [['polea', { en: [23, 112], alto: 22, a: 'i', agarre: 'asa' }]],
        posturas: { p: estirado(P, [21, h[1] - 55, h[2] + 22], 'bi', 0.4, [1, 0.2, -0.6]), a: K.a, b: K.b },
        inicio: 'a', encuadra: ['a'],
        rep: [['b', 1.1, 'empuje'], ['b', 0.4], ['a', 1.9, 'freno'], ['a', 0.4]],
        pasos: [{ sec: [['a', 1.4, 'suave']], desde: 'p' }, 'a', 'rep']
      };
    })();
    /* con el pecho apoyado en un banco a 60°: boca abajo en el respaldo, el cuerpo casi en línea recta y las puntas de los pies en el
       suelo, a los lados del asiento. Junta las escápulas y lleva los codos por detrás del tronco (el brazo, a 8° del suelo); estira
       los codos hasta dejar los brazos rectos y baja despacio */
    COREO['patada-triceps-banco-inclinado'] = (function () {
      var ANG = 60, LARGO = 124, ASIENTO = 38, ZB = -22, s = Math.sin(ANG * RAD), c = Math.cos(ANG * RAD), bis = [0, 44, ZB - LARGO / 2 + ASIENTO];
      var enRespaldo = function (t, fuera) { return [0, bis[1] + t * s + fuera * c, bis[2] + t * c - fuera * s]; };   /* a «t» de la bisagra y a «fuera» de la tapicería */
      var base = { pel: enRespaldo(34, 11.5), giro: [0, 90 - ANG, 0], cab: [-22, 0, 0], p: { suelo: [20, bis[2] - 46], abre: 4, talon: 58, polo: [0.2, -0.3, 1] }, m: AL_CUERPO };
      var atras = sobre(base, { hom: [-1, -3] }), K = patada(atras, [0.05, -0.14, -0.99], [0, -0.99, 0.14]);
      return {
        vista: [-66, -118], rastro: 'manos', esfuerzo: [0], clavos: ['ti', 'td'],
        material: [['banco', { en: [0, ZB], largo: LARGO, respaldo: ANG, asiento: ASIENTO }], ['mancuernas']],
        posturas: { s: colgando(base, 23, 0), a: K.a, b: K.b },
        inicio: 'a', encuadra: ['s'],
        rep: [['b', 1.1, 'empuje'], ['b', 0.4], ['a', 2.0, 'freno'], ['a', 0.4]],
        pasos: ['s', { sec: [['a', 1.3, 'suave']], desde: 's' }, 'rep']
      };
    })();

    /* ══════════ la polea alta: de pie ante ella, los codos en los costados ══════════
       El agarre espera colgando a plomo de la polea; lo coge, pega los codos a los costados y empuja hacia abajo: el codo no se mueve.
       El codo queda en el costado, 4 cm por delante del hombro: así, con los brazos estirados, la barra acaba ante los muslos sin meterse
       en el pantalón. La barra recta se coge a la anchura de los hombros (más junta, con el codo en el costado el brazo no se estira).
       o: { mano (y manoG, manoA, manoB, si cambia de una postura a otra), G (cada mano, del centro; sin G, a una mano: la izquierda), agarre,
       codo (hacia dónde va el brazo desde el hombro), abajo/arriba (cuánto se dobla el codo) } */
    var ANTE_POLEA = { pel: [0, PIE - 2, -4], giro: [0, 8, 0], cab: [-6, 0, 0], p: { suelo: [12, 0], abre: 8 } };
    var Z_POLEA = 64, Y_CUELGA = 140, DELANTE = [0, 0, 1];
    /* la mano en la barra de la polea: va de lado a lado; la palma, hacia abajo y atrás (o hacia arriba y adelante, en el agarre inverso) */
    var PALMA_ABAJO_P = { tipo: 'puno', barra: [1, 0, 0], palma: [0, -0.7, -0.7] }, PALMA_ARRIBA_P = { tipo: 'puno', barra: [1, 0, 0], palma: [0, 0.7, 0.7] };
    function empujon(o) {
      var una = o.G == null, k = una ? 'bi' : 'b', X = una ? 21 : 0, cual = function (m) { return una ? { mi: m, md: SUELTA } : { m: m }; };
      var P = sobre(ANTE_POLEA, cual(o.mano)), h = resolver(P).i.hom, C = mas(h, por(unidad(o.codo || [0.07, -1, 0.15]), D.brazo));
      var en = function (fi, mano) { var q = mano ? cual(mano) : {}; q[k] = una ? flexion(P, C, fi, DELANTE) : flexionG(P, C, fi, DELANTE, o.G); return sobre(P, q); };
      var mat = { en: [X, Z_POLEA], alto: 204, agarre: o.agarre, reposo: [X, Y_CUELGA, Z_POLEA - 9] };
      if (una) mat.a = 'i'; else { mat.ancho0 = o.G; mat.sobra = 9; }
      return {
        vista: o.vista || [66, 124], rastro: una ? 'mi' : 'manos', esfuerzo: [0], clavos: ['ti', 'td'], material: [['polea', mat]],
        posturas: {
          s: sobre(ANTE_POLEA, { m: SUELTA }),
          g: conAgarre(sobre(P, cual(o.manoG || o.mano)), [una ? X : o.G, Y_CUELGA, Z_POLEA - 9], [1, -0.7, -0.2], k),
          a: en(o.arriba || 106, o.manoA), b: en(o.abajo || 9, o.manoB)
        },
        reposo: ['s'], inicio: 'a', encuadra: ['s']
      };
    }
    /* con barra recta: frente a la polea, la espalda erguida y las rodillas algo flexionadas; coge la barra, pega los codos y empuja hasta
       estirar del todo los brazos */
    COREO['extension-triceps-polea-barra'] = (function () {
      var c = empujon({ mano: PALMA_ABAJO_P, G: 19, agarre: 'barra' });
      c.rep = [['b', 1.1, 'empuje'], ['b', 0.35], ['a', 1.7, 'freno'], ['a', 0.4]];
      c.pasos = ['s', { sec: [['g', 1.0, 'suave'], ['g', 0.3], ['a', 1.1, 'suave']], desde: 's' }, 'rep'];
      return c;
    })();
    /* con la barra en V: las palmas, hacia abajo y un poco enfrentadas (los mangos bajan hacia fuera, 32°); la empuja hacia los muslos y hace una pausa */
    COREO['extension-triceps-polea-barra-v'] = (function () {
      var v = function (p) { return { tipo: 'puno', palma: p }; };       /* la palma de la mano izquierda, en el mundo, según hacia dónde va el antebrazo */
      var c = empujon({ mano: v([-0.53, -0.85, 0]), manoG: v([-0.53, -0.75, 0.4]), manoA: v([-0.53, -0.85, 0]), manoB: v([-0.53, 0, -0.85]), G: 8, agarre: 'barra_v', codo: [-0.05, -1, 0.17], abajo: 10 });
      c.rep = [['b', 1.1, 'empuje'], ['b', 0.9], ['a', 1.7, 'freno'], ['a', 0.4]];
      c.pasos = [{ sec: [['g', 1.1, 'suave']], desde: 's' }, { sec: [['a', 1.1, 'suave']], desde: 'g' }, 'rep'];
      return c;
    })();
    /* con agarre inverso (las palmas hacia arriba): la lleva hacia los muslos estirando los brazos, hace una pausa y vuelve despacio */
    COREO['extension-triceps-polea-agarre-inverso'] = (function () {
      var c = empujon({ mano: PALMA_ARRIBA_P, G: 19, agarre: 'barra' });
      c.inicio = 'b'; c.esfuerzo = [3];
      c.rep = [['b', 0.9], ['a', 2.2, 'freno'], ['a', 0.4], ['b', 1.2, 'empuje']];
      c.pasos = [{ sec: [['g', 1.1, 'suave']], desde: 's' }, { sec: [['a', 1.0, 'suave'], ['a', 0.3], ['b', 1.2, 'empuje']], desde: 'g' }, 'rep'];
      return c;
    })();
    /* a una mano (la izquierda; el cambio de brazo no se hace), con la palma hacia arriba: el codo, en el costado */
    COREO['extension-triceps-polea-un-brazo'] = (function () {
      var c = empujon({ mano: PALMA_ARRIBA_P, agarre: 'asa' });
      c.rep = [['b', 1.1, 'empuje'], ['b', 0.35], ['a', 2.0, 'freno'], ['a', 0.4]];
      c.pasos = [{ sec: [['g', 1.1, 'suave']], desde: 's' }, { sec: [['a', 1.1, 'suave']], desde: 'g' }, 'rep'];
      return c;
    })();

    /* ══════════ otras poleas ══════════ */
    /* sobre la cabeza, con cuerda: de espaldas a la polea alta; da un paso al frente con el pie izquierdo e inclina un poco el tronco
       desde la cadera (25°). Los codos, arriba junto a la cabeza y sin moverse; estira hacia arriba y adelante (10° por delante de la
       línea del tronco) y, al final, separa los extremos de la cuerda (de 30 a 48 cm). Los antebrazos pasan a los lados de la cabeza (las
       manos, a 32 cm una de otra, detrás de ella): juntas no caben */
    COREO['extension-triceps-polea-sobre-cabeza'] = (function () {
      var E0 = { pel: [0, PIE - 1, 0], pi: { suelo: [10, 0], abre: 7 }, pd: { suelo: [-10, 0], abre: 9 }, hom: [3, 0], cab: [4, 0, 0], m: AL_CUERPO };
      var P = { pel: [0, PIE - 4, 8], giro: [0, 25, 0], cab: [-10, 0, 0], hom: [3, 0], pi: { suelo: [10, 30], abre: 5 }, pd: { suelo: [-10, 0], abre: 9 }, m: AL_CUERPO };
      /* los brazos, en el marco del tronco: así valen de pie y ya inclinado */
      var brazos = function (Q, fi, G) {
        var Bt = resolver(Q).Bt, dir = aplicar(Bt, [0, 0.985, 0.174]), hacia = aplicar(Bt, [0, 0.174, -0.985]), A = alzado(Q, dir, hacia, 12, 24);
        return sobre(Q, { b: flexionG(Q, A.C, fi, hacia, G) });
      };
      return {
        vista: [84, 132], rastro: 'manos', esfuerzo: [0], clavos: ['ti', 'td'],
        material: [['polea', { en: [0, -64], rumbo: 180, alto: 204, agarre: 'cuerda' }]],
        posturas: { e: brazos(E0, 120, 16), a: brazos(P, 120, 16), b0: brazos(P, 30, 15), b: brazos(P, 12, 24) },
        inicio: 'a', encuadra: ['e', 'b'],
        rep: [['b0', 0.9, 'empuje'], ['b', 0.4, 'suave'], ['b', 0.45], ['a', 1.9, 'freno'], ['a', 0.3]],
        pasos: [{ sec: [['a', 1.4, 'suave', ['td']]], desde: 'e' }, 'a', 'rep']
      };
    })();
    /* sobre la cabeza, a una mano (la izquierda; el cambio de lado no se hace), con la polea baja a la espalda: coge el asa por detrás del
       cuerpo, sube el brazo por el costado hasta dejar el codo arriba, junto a la cabeza, y lo sujeta con la otra mano (que llega por
       detrás de la cabeza); estira el brazo hacia el techo y lo baja despacio por detrás de la cabeza */
    COREO['extension-triceps-polea-baja-un-brazo'] = (function () {
      var P0 = sobre(DE_PIE, { mi: NEU, md: SUELTA }), P = sobre(P0, { hom: { i: [4, 0], d: [3, 0] }, cab: [12, 0, 0] });
      var hacia = [-0.34, 0, -0.94], A = alzado(P, [0, 1, -0.03], hacia, 12);
      var sujeta = function (Q) { return conAgarre(sobre(Q, { md: { tipo: 'suelta', palma: [1, 0, 0.3] } }), [A.C[0] - 2, A.C[1] + 2, A.C[2] - 8.5], [-0.25, 0.25, -1], 'bd'); };
      var con = function (Q, g, polo) { return conAgarre(Q, g, polo, 'bi'); };
      return {
        vista: [118, 60], rastro: 'mi', esfuerzo: [0], clavos: ['ti', 'td'],
        material: [['polea', { en: [17, -64], rumbo: 180, alto: 22, a: 'i', agarre: 'asa' }]],
        posturas: {
          s: con(P0, [23, 78, -17], [1, 0.1, -0.5]),
          m1: con(sobre(P0, { hom: { i: [2, 0], d: [0, 0] } }), [31, 112, -15], [1, 0.2, -0.6]),
          m2: con(sobre(P, { md: SUELTA }), [20, 140, -22], [1, 0.4, 0.1]),
          a: sujeta(sobre(P, { bi: flexion(P, A.C, 122, hacia) })),
          b: sujeta(sobre(P, { bi: flexion(P, A.C, 12, hacia) }))
        },
        inicio: 'a', encuadra: ['b'],
        rep: [['b', 1.2, 'empuje'], ['b', 0.4], ['a', 2.0, 'freno'], ['a', 0.4]],
        pasos: ['s', { sec: [['m1', 0.8, 'suave'], ['m2', 0.7, 'lineal'], ['a', 0.9, 'suave']], desde: 's' }, 'rep']
      };
    })();
    /* tumbado, con la cabeza hacia una polea baja (a la altura del banco, justo detrás de él) con barra corta, que espera colgando de la polea:
       echa las manos atrás y la agarra, estrecho (las manos, a 16 cm) y con las palmas hacia abajo; la trae sobre la frente y estira los
       brazos hacia arriba; y, sin mover los codos, la baja hacia la polea y vuelve a estirarlos despacio */
    COREO['extension-triceps-polea-tumbado'] = (function () {
      var G = 8, ZP = -88, ALTO = 44, R = [0, ALTO, ZP + 15];
      var c = frances({ mano: PRO_BARRA, G: G, abajo: 100, sube: 2.0, inicio: 'a', esfuerzo: [2],
        material: [['polea', { en: [0, ZP], rumbo: 180, alto: ALTO, agarre: 'barra', ancho0: G, sobra: 8, encuadre: 120, reposo: R }]] });
      var libre = { tipo: 'suelta', prono: 90 }, P = tumbadoEn(0, { m: libre });
      c.posturas.s = sobre(P, { b: { a: [9, 9, 11.5], en: 'pelvis', polo: [1, -0.2, -0.3] } });                          /* las manos, sobre el abdomen */
      c.posturas.r = sobre(P, { b: { a: [14, 84, -30], polo: [0.5, 0.4, 1] } });                                          /* arriba, de camino hacia atrás */
      c.posturas.g = conAgarre(tumbadoEn(0, { hom: [5, 0], m: PRO_BARRA }), [G, R[1], R[2]], [1, 0.1, 0]);            /* la coge, detrás de la cabeza */
      c.reposo = ['s', 'r']; c.encuadra = ['a', 's'];
      c.pasos = ['s', { sec: [['r', 0.7, 'suave'], ['g', 0.7, 'suave'], ['g', 0.25], ['b', 0.9, 'suave'], ['a', 1.3, 'empuje']], desde: 's' }, 'rep'];
      return c;
    })();

    /* ══════════ los press en banco ══════════
       Como el press de banca, pero con las manos más juntas y los codos pegados al tronco: así el trabajo pasa al tríceps. La barra espera en
       su soporte (sobre los ganchos: a 106 cm del suelo y a z = −40). El antebrazo de Jérôme es largo para lo poco que le sobresale el
       pecho: con la barra abajo y el antebrazo a plomo, el codo queda por debajo del tablero del banco, junto a él.
       o: { G, mano, arriba: z de la barra arriba (los brazos, estirados: el codo, a 168°), abajo: [y, z], codo (hacia dónde va) } */
    var SOPORTE = ['soporte', { z: -43.5, alto: 104.5, ancho: 52 }], HACIA_CARA = [0, 0, -1];
    function pressCodos(o) {
      var P = tumbadoEn(0, { m: o.mano }), h = resolver(P).i.hom, codo = o.codo || [0.1, -1, 0.5];
      var dz = o.arriba - h[2], dx = o.G - h[0], A = alzado(P, [0, Math.sqrt(58.66 * 58.66 - dx * dx - dz * dz), dz], HACIA_CARA, 12, o.G);
      return {
        vista: o.vista || [30, 0], picado: o.picado == null ? 32 : o.picado, rastro: 'manos', esfuerzo: [0], clavos: ['mi', 'md', 'ti', 'td'],
        material: [bancoDe(0)].concat(o.material || [SOPORTE, ['barra']]),
        posturas: {
          sop: conAgarre(P, [o.G, 106, -40], [0.6, -0.5, 0.6]),
          a: sobre(P, { b: flexionG(P, A.C, 12, HACIA_CARA, o.G) }),
          b: conAgarre(P, [o.G, o.abajo[0], o.abajo[1]], codo)
        },
        inicio: 'b', encuadra: ['sop']
      };
    }
    /* con agarre cerrado (las manos, a la anchura de los hombros): baja con control hacia la parte baja del pecho y sube en línea recta */
    COREO['press-banca-agarre-cerrado'] = (function () {
      var c = pressCodos({ G: 19, mano: EN_BARRA, arriba: 1, abajo: [71.5, 1] });
      c.rep = [['a', 1.2, 'empuje'], ['a', 0.4], ['b', 1.9, 'freno'], ['b', 0.35]];
      c.pasos = ['sop', { sec: [['a', 1.5, 'suave'], ['a', 0.3], ['b', 1.9, 'freno']], desde: 'sop' }, 'rep'];
      return c;
    })();
    /* con agarre inverso (las palmas hacia la cara, las manos a 40 cm): deja la barra sobre el pecho, un poco por debajo de los pezones;
       estira los brazos y la baja despacio */
    COREO['press-banca-agarre-inverso'] = (function () {
      var c = pressCodos({ G: 20, mano: EN_BARRA_SUP, arriba: -5, abajo: [69.2, 0], codo: [0.15, -1, 0.45] });
      c.rep = [['a', 1.2, 'empuje'], ['a', 0.4], ['b', 2.2, 'freno'], ['b', 0.4]];
      c.pasos = ['sop', { sec: [['a', 1.5, 'suave'], ['a', 0.3], ['b', 1.9, 'freno']], desde: 'sop' }, 'rep'];
      return c;
    })();
    /* el press JM: agarre medio (las manos, a 48 cm), los codos cerca del cuerpo y la barra sobre el esternón; baja a ritmo normal hacia él,
       hace una pausa breve y sube deprisa, en línea recta */
    COREO['press-jm'] = (function () {
      var c = pressCodos({ G: 24, mano: EN_BARRA, arriba: -7, abajo: [75, -7], codo: [0.2, -1, 0.4] });
      c.rep = [['a', 0.85, 'empuje'], ['a', 0.4], ['b', 1.5, 'freno'], ['b', 0.6]];
      c.pasos = [{ sec: [['a', 1.6, 'suave']], desde: 'sop' }, { sec: [['b', 1.5, 'freno']], desde: 'a' }, 'rep'];
      return c;
    })();
    /* con mancuernas, sujetas en paralelo al cuerpo (las palmas enfrentadas): bajan hacia la mitad del pecho con los codos pegados y suben */
    COREO['press-mancuernas-codos-pegados'] = (function () {
      var c = pressCodos({ G: 19.5, mano: { tipo: 'puno', barra: [0, 0, 1], palma: [-1, 0, 0] }, arriba: -4, abajo: [75.5, -4], codo: [0.1, -1, 0.5], material: [['mancuernas']] });
      delete c.posturas.sop;
      c.clavos = ['ti', 'td']; c.encuadra = ['a'];
      c.rep = [['a', 1.2, 'empuje'], ['a', 0.4], ['b', 1.8, 'freno'], ['b', 0.35]];
      c.pasos = ['a', { sec: [['b', 1.8, 'freno']], desde: 'a' }, 'rep'];
      return c;
    })();
    /* el press Tate: arriba, los brazos estirados sobre el pecho, las mancuernas juntas (punta con punta) y las palmas hacia los pies; los
       codos se doblan hacia fuera y las mancuernas bajan, ya de pie, hasta el centro del pecho. La ficha pide no mover la parte superior
       del brazo: no se puede (el antebrazo mide más que medio ancho de hombros: con el brazo quieto, los puños se cruzarían); el codo
       sale hacia fuera lo justo para que las mancuernas lleguen al centro del pecho */
    COREO['press-tate'] = (function () {
      var G = 13.3, ZC = -6, P = tumbadoEn(0, { m: NEU }), h = resolver(P).i.hom, DENTRO = [-1, 0, 0];
      var dz = ZC - h[2], dx = G - h[0], A = alzado(P, [0, Math.sqrt(58.66 * 58.66 - dx * dx - dz * dz), dz], DENTRO, 12, G);
      return {
        vista: [24, -40], picado: 30, rastro: 'manos', esfuerzo: [0], clavos: ['ti', 'td'], material: [bancoDe(0), ['mancuernas']],
        posturas: {
          a: sobre(P, { b: { a: mas(A.C, por(unidad(menos(A.g, A.C)), D.antebrazo)), polo: menos(A.C, h) } }),
          b: conAgarre(P, [9.6, 81, ZC], [1, 0.45, 0])
        },
        inicio: 'b', encuadra: ['a'],
        rep: [['a', 1.3, 'empuje'], ['a', 0.4], ['b', 1.9, 'freno'], ['b', 0.4]],
        pasos: ['a', { sec: [['b', 1.9, 'freno']], desde: 'a' }, 'rep']
      };
    })();

    /* ══════════ con el peso del cuerpo: fondos y flexiones ══════════ */
    /* la mano abierta, plana sobre lo que pisa (el suelo, el banco): la muñeca se dobla lo justo para que los dedos queden hacia «dedos»
       (hacia delante y 18° hacia abajo, si no se dice: la muñeca queda a 5 cm del suelo y la palma lo pisa), esté el antebrazo como esté:
       con el codo hacia atrás hace falta menos que con el antebrazo a plomo */
    function plana(P, dedos) {
      var E = resolver(P), f = unidad(menos(E.i.mun, E.i.cod)), m = {}, k;
      for (k in P.m) m[k] = P.m[k];
      m.mun = -Math.acos(entre(punto(f, unidad(dedos || [0, -0.31, 0.95])), -1, 1)) / RAD;
      return sobre(P, { m: m });
    }
    /* las manos, en el borde del banco que tiene detrás (como en los fondos en banco del bloque 1): los dedos, hacia delante */
    var BORDE = { a: [19, 47, -3], polo: [0.12, 0.25, -1] }, EN_BORDE = { tipo: 'abierta', prono: 90, mun: -78 };
    var BANCO_FONDOS = ['banco', { rumbo: 90, en: [0, -17], largo: 110 }], EN_BANCO = [0, -0.2, 0.98];
    /* entre dos bancos: los talones, en el otro, con las piernas estiradas; baja con los codos hacia atrás hasta los 90° y sube hasta casi
       estirar los brazos */
    COREO['fondos-entre-bancos'] = (function () {
      var talones = { p: { a: [10, 50.8, 85.6], polo: [0, 1, 0] }, t: { punta: [0, 1, 0.15], arriba: [0, 0.15, -1] }, b: BORDE, m: EN_BORDE };
      return {
        vista: [70, 24], rastro: 'hombros', esfuerzo: [0], clavos: ['mi', 'md', 'ti', 'td'],
        material: [BANCO_FONDOS, ['banco', { rumbo: 90, en: [0, 92], largo: 110 }]],
        posturas: { a: plana(sobre(talones, { pel: [0, 52.5, 8] }), EN_BANCO), b: plana(sobre(talones, { pel: [0, 37.6, 9], cab: [-6, 0, 0] }), EN_BANCO) },
        inicio: 'b', encuadra: ['a'],
        rep: [['a', 1.2, 'empuje'], ['a', 0.4], ['b', 1.7, 'freno'], ['b', 0.35]],
        pasos: ['a', { sec: [['b', 1.7, 'freno']], desde: 'a' }, 'rep']
      };
    })();
    /* con rotación: sentado en el banco, despega los glúteos; baja hasta los 90° y sube; y arriba gira el tronco y cruza una mano por
       delante mientras el otro brazo le sostiene, la vuelve a apoyar y, tras la bajada siguiente, lo hace hacia el otro lado */
    COREO['fondos-banco-con-rotacion'] = (function () {
      var pies = { suelo: [10, 47], abre: 4, polo: [0, 1, 0.5] }, arriba_ = { pel: [0, 52.5, 8], p: pies, b: BORDE, m: EN_BORDE };
      var cruza = { tipo: 'suelta', palma: [0, -1, 0] };
      var I = ['mi', 'ti', 'td'], Dd = ['md', 'ti', 'td'];       /* lo que sigue apoyado mientras una mano cruza */
      return {
        vista: [-58, -16], rastro: 'hombros', esfuerzo: [5, 11], clavos: ['mi', 'md', 'ti', 'td'], material: [BANCO_FONDOS],
        posturas: {
          s: { pel: [0, 55, -9], p: { suelo: [10, 34], abre: 4, polo: [0, 1, 0.5] }, b: BORDE, m: EN_BORDE },
          a: arriba_,
          b: plana(sobre(arriba_, { pel: [0, 37.6, 9], cab: [-6, 0, 0] }), EN_BANCO),
          r1: sobre(arriba_, { col: [0, 0, 28], cab: [0, 10, 0], bd: { a: [20, 99, 34], polo: [-0.4, -1, 0.1] }, md: cruza }),
          r2: sobre(arriba_, { col: [0, 0, -28], cab: [0, -10, 0], bi: { a: [-20, 99, 34], polo: [0.4, -1, 0.1] }, mi: cruza })
        },
        inicio: 'a', encuadra: ['s'],
        rep: [['r1', 0.8, 'suave', I], ['r1', 0.4, null, I], ['a', 0.7, 'suave', I], ['b', 1.3, 'freno'], ['b', 0.2], ['a', 1.0, 'empuje'],
          ['r2', 0.8, 'suave', Dd], ['r2', 0.4, null, Dd], ['a', 0.7, 'suave', Dd], ['b', 1.3, 'freno'], ['b', 0.2], ['a', 1.0, 'empuje']],
        pasos: [{ sec: [['a', 1.2, 'suave', ['mi', 'md']]], desde: 's' }, { sec: [['b', 1.5, 'freno'], ['b', 0.25], ['a', 1.1, 'empuje']], desde: 'a' }, 'rep']
      };
    })();
    /* en el suelo: sentado, con las rodillas dobladas, los pies juntos y las manos apoyadas detrás (los dedos, hacia delante); estira los
       brazos y despega la cadera; dobla los codos para bajarla y vuelve a estirarlos */
    COREO['fondos-suelo'] = (function () {
      var base = { p: { suelo: [4, 47], abre: 2, polo: [0.1, 1, 0.3] }, b: { a: [19, 5, -26], polo: [0.12, 0.3, -1] }, m: { tipo: 'abierta', prono: 90, mun: -72 } };
      var con = function (y, z, atras, cab) { return plana(sobre(base, { pel: [0, y, z], giro: [0, -atras, 0], cab: [cab, 0, 0] })); };
      return {
        vista: [72, 28], picado: 14, rastro: 'pel', esfuerzo: [2], clavos: ['mi', 'md', 'ti', 'td'],
        posturas: { s: con(11.5, 4.5, 24, 10), a: con(21.1, 3.5, 37.5, 22), b: con(12.6, 4, 43.5, 26) },
        inicio: 'a', encuadra: ['a'],
        rep: [['b', 1.5, 'freno'], ['b', 0.3], ['a', 1.1, 'empuje'], ['a', 0.45]],
        pasos: ['s', { sec: [['a', 1.3, 'empuje']], desde: 's' }, 'rep']
      };
    })();
    /* en paralelas, para el tríceps: el cuerpo recto y los codos pegados; baja hasta que el brazo queda paralelo al suelo y sube despacio */
    var EN_PARALELAS = ['paralelas', { alto: 118, ancho: 27, largo: 110, manos: 2 }], M2 = ['mi@0:27', 'md@0:-27'], NUDILLOS_FUERA = { tipo: 'puno', prono: 0 };
    function enParalelas(polo) { return { a: [27, 126, 2], polo: polo }; }
    var RECTO = { p: { e: 5, z: 0, c: 10 }, t: { tob: 22 } };      /* las piernas, estiradas y colgando */
    COREO['fondos-paralelas-triceps'] = {
      vista: [72, 22], rastro: 'hombros', esfuerzo: [0], clavos: M2, material: [EN_PARALELAS],
      posturas: {
        s: { b: enParalelas([0.1, 0.4, -1]), m: NUDILLOS_FUERA },
        a: sobre(RECTO, { pel: [0, 132.6, 0], b: enParalelas([0.1, 0.1, -1]), m: NUDILLOS_FUERA }),
        b: sobre(RECTO, { pel: [0, 103.8, 10], giro: [0, 8, 0], cab: [-8, 0, 0], b: enParalelas([0, 0.3, -1]), m: NUDILLOS_FUERA })
      },
      inicio: 'b', encuadra: ['s'],
      rep: [['a', 2.0, 'suave'], ['a', 0.4], ['b', 1.7, 'freno'], ['b', 0.3]],
      pasos: [{ sec: [['s', 1.7, null, M2.concat(['ti', 'td'])], ['a', 1.2, 'empuje', M2]], desde: 's' }, { sec: [['b', 1.7, 'freno']], desde: 'a' }, 'rep']
    };
    /* el soporte: entre las paralelas, las manos en ellas con los nudillos hacia fuera; empuja hasta despegar los pies y aguanta con los
       brazos estirados */
    COREO['soporte-paralelas'] = {
      vista: [58, 20], isometrico: 'a', clavos: M2, material: [EN_PARALELAS],
      posturas: {
        s: { b: enParalelas([0.1, 0.4, -1]), m: NUDILLOS_FUERA },
        a: sobre(RECTO, { pel: [0, 132.6, 0], b: enParalelas([0.1, 0.1, -1]), m: NUDILLOS_FUERA })
      },
      inicio: 'a', encuadra: ['s'],
      pasos: ['s', { sec: [['s', 0.6, null, M2.concat(['ti', 'td'])], ['a', 1.4, 'empuje', M2]], desde: 's' }, 'a']
    };
    /* la flexión con los codos pegados: las manos, a la anchura de los hombros; los codos van hacia atrás, junto a los costados */
    COREO['flexion-codos-pegados'] = (function () {
      var manos = { a: [19, 5, 13.3], polo: [0.1, 0.3, -1] };
      return {
        vista: [78, [32, 34]], picado: 16, rastro: 'pecho', esfuerzo: [0], clavos: ['mi', 'md', 'ti', 'td'],
        posturas: { a: tabla(20.2, { b: manos }), b: plana(tabla(2.2, { b: manos, cab: [-24, 0, 0] })) },
        inicio: 'b', encuadra: ['a'],
        rep: [['a', 1.1, 'empuje'], ['a', 0.45], ['b', 1.7, 'freno'], ['b', 0.25]],
        pasos: ['a', { sec: [['b', 1.7, 'freno']], desde: 'a' }, 'rep']
      };
    })();
    /* de rodillas, desde la postura del niño: sentado sobre los talones, con los brazos estirados hacia delante (las manos ya no se mueven
       de ahí); adelanta el cuerpo sobre las rodillas y baja el pecho entre las manos, con los codos hacia atrás; empuja y vuelve a
       sentarse sobre los talones. Las rodillas, en el suelo (en z = −60): la cadera gira sobre ellas */
    COREO['flexion-triceps-rodillas-postura-nino'] = (function () {
      var ZM = -8, K = [7, -60];                      /* las muñecas; y las rodillas (alto, z) */
      var piernas = { a: [10, 7, -98], polo: [0, -1, 0.3] }, pies = { punta: [0, -0.1, -1], arriba: [0, -1, 0.1] };
      var mano = function (mun) { return { tipo: 'abierta', prono: 90, mun: mun }; };
      /* la cadera, sobre el arco de las rodillas (a un muslo de ellas), y el tronco recto hasta el hombro, que queda en [alto, z] */
      var con = function (S, polo, cab, mun) {
        var d = Math.sqrt((S[0] - K[0]) * (S[0] - K[0]) + (S[1] - K[1]) * (S[1] - K[1])), T = 43.5, d1 = (D.muslo * D.muslo - T * T + d * d) / (2 * d), hh = Math.sqrt(D.muslo * D.muslo - d1 * d1);
        var u = [(S[0] - K[0]) / d, (S[1] - K[1]) / d], cad = [K[0] + d1 * u[0] + hh * u[1], K[1] + d1 * u[1] - hh * u[0]];
        return plana({ pel: [0, cad[0], cad[1]], giro: [0, Math.atan2(S[1] - cad[1], S[0] - cad[0]) / RAD, 0], cab: [cab, 0, 0], p: piernas, t: pies, b: { a: [19, 5, ZM], polo: polo }, m: mano(mun) });
      };
      return {
        vista: [78, [32, 34]], picado: 16, rastro: 'pecho', esfuerzo: [0], clavos: ['mi', 'md', 'ti', 'td'],
        posturas: {
          n: plana({ pel: [0, 23, -96.7], giro: [0, 62, 0], col: [30, 0, 0], cab: [16, 0, 0], p: piernas, t: pies, b: { a: [19, 5, ZM], polo: [0.3, 1, -0.2] }, m: mano(-24) }),
          b: con([16.5, ZM + 8], [0.1, 0.4, -1], -24, -62),
          u: con([55.8, ZM + 1], [0.15, 0.2, -1], -14, -72)
        },
        inicio: 'b', encuadra: ['n', 'u'],
        rep: [['u', 1.1, 'empuje'], ['n', 1.2, 'suave'], ['n', 0.6], ['b', 1.8, 'freno'], ['b', 0.3]],
        pasos: ['n', { sec: [['b', 1.8, 'freno']], desde: 'n' }, 'rep']
      };
    })();

    /* ══════════ el estiramiento ══════════
       De pie: levanta un brazo (el izquierdo; el cambio de brazo no se hace) y dobla el codo para llevar la mano hacia la espalda; con la
       otra mano, que llega por detrás de la cabeza, sujeta el codo y lo empuja con suavidad hacia atrás (unos 10 cm) y hacia abajo (2,5);
       y aguanta */
    COREO['estiramiento-triceps'] = (function () {
      var P0 = sobre(DE_PIE, { m: SUELTA }), P = sobre(P0, { hom: { i: [4, 0], d: [3, 0] }, cab: [12, 0, 0], mi: { tipo: 'suelta', palma: [0, 0.2, 1] } });
      var h = resolver(P).i.hom;
      var brazo = function (dir, mano) { var C = mas(h, por(unidad(dir), D.brazo)); return { C: C, bi: { a: mas(C, por(unidad(mano), D.antebrazo)), polo: menos(C, h) } }; };
      var A0 = brazo([0.02, 1, -0.04], [-0.3, -0.8, -0.52]), A1 = brazo([-0.12, 0.9, -0.4], [-0.22, -0.9, -0.38]);
      var sujeta = function (Q, C) { return conAgarre(sobre(Q, { md: { tipo: 'suelta', palma: [1, 0, 0.3] } }), [C[0] - 2, C[1] + 2, C[2] - 8.5], [-0.25, 0.25, -1], 'bd'); };
      return {
        vista: [152, 40], isometrico: 'a', clavos: ['ti', 'td'],
        posturas: {
          e: P0,
          a0: sobre(P, { bi: A0.bi }),
          a1: sujeta(sobre(P, { bi: A0.bi }), A0.C),
          a: sujeta(sobre(P, { bi: A1.bi }), A1.C)
        },
        inicio: 'a', encuadra: ['a0'],
        pasos: [{ sec: [['a0', 1.5, 'suave']], desde: 'e' }, { sec: [['a1', 1.1, 'suave'], ['a1', 0.25], ['a', 1.1, 'suave']], desde: 'a0' }, 'a']
      };
    })();
  })();
