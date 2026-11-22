  /* ───────────────────────── las coreografías: CUÁDRICEPS (bloque 9) ─────────────────────────
     Las mismas reglas que en 70-coreografias.js: cada una sale de los pasos verificados de su ficha y no añade técnica
     que la ficha no diga. Van por familias: las sentadillas sobre los dos pies (con mancuernas, con barra, con apoyo, en la
     pared, la hindú), sentarse y levantarse (de un banco, de una silla), los escalones (bajar, subir, el impulso alterno y el
     salto al cajón), las sentadillas a una pierna (con apoyo de puntas, la del camarón, la pistol), de rodillas (el curl
     nórdico inverso y el flexor de la cadera), en el suelo (la pierna recta, la toalla bajo la rodilla y el estiramiento
     tumbado de lado), el estiramiento de pie y los saltos.
     En una sentadilla la cadera baja y va hacia atrás, el tronco se inclina lo que haga falta para no caerse y los pies no se
     mueven: «muslos paralelos al suelo» es la cadera a la altura de las rodillas (medido con mide.js, no a ojo). */
  (function () {
    var T2 = ['ti', 'td'];
    /* agachado sobre los dos pies: la cadera a «y» del suelo y «z» por detrás de los tobillos, el tronco «inc» grados hacia delante y la
       cabeza mirando al frente */
    function agachado(pies, y, z, inc, extra) { return sobre({ pel: [0, y, z], giro: [0, inc, 0], cab: [-inc * 0.85, 0, 0], p: pies }, extra || {}); }
    /* los brazos cruzados sobre el pecho y las manos detrás de la cabeza (como en el bloque 1) */
    var CRUZ = { a: [-7, 11, 13.5], en: 'torax', polo: [1, -0.7, 0.3] }, NUCA = { a: [8, 37, -8], en: 'torax', polo: [1, 0.2, 0.15] };

    /* un pie en el aire, mirando «g» grados hacia fuera y con la punta algo caída (el izquierdo; el derecho, con −g) */
    function alAire(g, cae) { var c = cae == null ? 0.14 : cae, k = Math.sqrt(1 - c * c), t = g * RAD; return { punta: [k * Math.sin(t), -c, k * Math.cos(t)], arriba: [c * Math.sin(t), k, c * Math.cos(t)] }; }
    /* lo más alto que puede ir la cadera con un tobillo a «dx» de la vertical de su cadera (la pierna, a 0,2 cm de estirarse del todo) */
    function altoCon(dx) { return D.tobillo + Math.sqrt(77.8 * 77.8 - dx * dx); }
    /* ABRIR LOS PIES. De pie, de un apoyo (de: [x, abre]) a otro más abierto (a: [x, abre]): primero el pie izquierdo y después el derecho,
       cada uno por el aire (el tobillo sube 5 cm) y girando ya hacia donde va a apuntar, con el peso en el otro. Añade las posturas (pre0:
       como empieza; pre1 a pre3; y «fin», que pone quien llama con los pies en «a») y devuelve los tramos, con los dos tobillos clavados a
       su camino (y lo de «mas_»: las manos en la barra). base: lo que no cambia (los brazos, la barra) */
    function abrirPies(posturas, pre, base, de, a, fin, seg, mas_) {
      var pie = function (q, polo) { return { suelo: [q[0], 0], abre: q[1], polo: polo }; }, m = [(de[0] + a[0]) / 2, (de[1] + a[1]) / 2], d = (seg || 2.2) / 4;
      var y0 = Math.min(PIE, altoCon(de[0] - D.caderaX)), y1 = altoCon(a[0] - D.caderaX + 2);
      posturas[pre + '0'] = sobre(base, { pel: [0, y0, 0], p: pie(de) });
      posturas[pre + '1'] = sobre(base, { pel: [-3.5, y0 - 0.8, 0], pi: { a: [m[0], D.tobillo + 5, 1], polo: [0.2, 0.1, 1] }, ti: alAire(m[1]), pd: reflejo(pie(de)) });
      posturas[pre + '2'] = sobre(base, { pel: [(a[0] - de[0]) / 2, y1, 0], pi: pie(a), pd: reflejo(pie(de)) });
      posturas[pre + '3'] = sobre(base, { pel: [(a[0] - de[0]) / 2 + 3.5, y1 - 0.8, 0], pi: pie(a), pd: { a: [-m[0], D.tobillo + 5, 1], polo: [-0.2, 0.1, 1] }, td: alAire(-m[1]) });
      var K = T2.concat(mas_ || []);
      return [[pre + '1', d, 'entra', K], [pre + '2', d, 'sale', K], [pre + '3', d, 'entra', K], [fin, d, 'sale', K]];
    }

    /* ══════════════════════════════ LAS SENTADILLAS ══════════════════════════════ */

    /* con mancuernas: una en cada mano, colgando junto a los muslos por fuera; los pies, algo más abiertos que los hombros, con las rodillas y
       las puntas un poco hacia fuera; baja despacio, como si se sentara, sin irse hacia las puntas (los talones no se despegan); una pausa
       abajo, y sube despacio */
    COREO['sentadilla-mancuernas'] = (function () {
      var pies = { suelo: [22, 0], abre: 14, polo: [0.36, 0.1, 1] }, G = 36;
      var a = colgando({ pel: [0, altoCon(12), 0], p: pies, m: PUNO }, G, 2), b = colgando(agachado(pies, 46.5, -27, 38, { col: [3, 0, 0], m: PUNO }), G, 3);
      return {
        vista: [46, 90], rastro: 'pel', esfuerzo: [2], clavos: T2, material: [['mancuernas']],
        posturas: { a: a, b: b },
        rep: bajaSube('b', 'a', [2.1, 0.8, 1.8, 0.5]),
        pasos: ['a', 'rep', 'rep']
      };
    })();

    /* con las manos en la nuca: los pies a la anchura de la cadera y las puntas al frente; lleva las manos detrás de la cabeza, con los codos
       hacia los lados; la cadera va atrás y las rodillas se doblan, con el tronco lo más erguido que puede; las rodillas, hacia fuera (no se
       juntan), y sube */
    COREO['sentadilla-prisionero'] = (function () {
      var pies = { suelo: [11, 0], abre: 0, polo: [0.3, 0.1, 1] };
      var a0 = { p: pies, b: aLosLados(10), m: SUELTA }, a = { p: pies, b: NUCA, m: SUELTA };
      var b = agachado(pies, 50, -22, 24, { col: [-4, 0, 0], b: NUCA, m: SUELTA });
      return {
        vista: [42, 90], rastro: 'pel', esfuerzo: [2], clavos: T2,
        posturas: { a0: a0, a: a, b: b },
        inicio: 'a', encuadra: ['a0'],
        rep: bajaSube('b', 'a'),
        pasos: [{ sec: [['a0', 0.7], ['a', 1.2, 'suave']], desde: 'a0' }, 'rep', 'rep']
      };
    })();

    /* sumo, con una mancuerna: separa los pies algo más que los hombros, con las puntas 45° hacia fuera (la mancuerna espera de pie en el
       suelo, delante); la coge por arriba con las dos manos y la deja colgando en el centro del cuerpo, con las rodillas un poco dobladas y la
       espalda recta; baja como si fuera a sentarse hasta que los muslos quedan paralelos al suelo, y vuelve con control */
    COREO['sentadilla-sumo-mancuerna'] = (function () {
      var DE = [11, 6], A = [28, 45], pies = { suelo: [A[0], 0], abre: A[1], polo: [0.8, 0.1, 0.78] }, ZM = 13, R = [0, 13.2, ZM];
      /* las manos, en garra sobre el disco de arriba, una a cada lado: el centro del agarre, 5 cm por encima del centro del disco */
      var GARRA = { tipo: 'yemas', palma: [-1, 0, 0] }, alDisco = function (P, y) { return conAgarre(P, [2.2, y, ZM], [1, 0.3, -0.5]); };
      var posturas = {}, base0 = { b: aLosLados(10), m: SUELTA };
      posturas.s = sobre(base0, { pel: [0, altoCon(A[0] - D.caderaX), 0], p: pies });
      var abre = abrirPies(posturas, 'o', base0, DE, A, 's', 2.0);
      /* a cogerla: la cadera baja y va atrás, y el tronco se inclina lo justo para que las manos lleguen */
      var Pg = function (x) { return agachado(pies, 84 - x, -0.5 * x, 10 + 0.85 * x, { m: GARRA }); };
      var xg = busca(function (q) { return largo(menos(resolver(Pg(q)).i.hom, [2.2, R[1] + 15.5, ZM])); }, BRAZO - 1, 10, 60);
      posturas.g = alDisco(Pg(xg), R[1] + 15.5);
      /* con ella colgando: los brazos, estirados; abajo se doblan lo justo para que la mancuerna (24 cm bajo el disco de arriba) no llegue al suelo */
      var conElla = function (P) { var h = resolver(P).i.hom; return alDisco(P, Math.max(h[1] - BRAZO + 1.2, R[1] + 15.5 + 3.5)); };
      posturas.a = conElla(agachado(pies, 81, -2, 4, { m: GARRA }));
      posturas.b = conElla(agachado(pies, 45, -13, 20, { col: [2, 0, 0], m: GARRA }));
      return {
        vista: [34, 86], rastro: 'pel', esfuerzo: [2], clavos: T2, reposo: ['o0', 'o1', 'o2', 'o3', 's'],
        material: [['mancuernas', { lado: 'i', extremo: true, radio: 6.2, reposo: { i: R }, ejeReposo: [0, 1, 0] }]],
        posturas: posturas, inicio: 'a', encuadra: ['o0', 'g'],
        rep: bajaSube('b', 'a', [1.9, 0.35, 1.5, 0.5]),
        pasos: [{ sec: [['o0', 0.6, null, T2]].concat(abre), desde: 'o0' },
                { sec: [['s', 0.4, null, T2], ['g', 1.5, 'suave', T2], ['g', 0.3, null, T2], ['a', 1.5, 'suave', T2]], desde: 's' }, 'rep']
      };
    })();

    /* frontal, con mancuernas: una en cada mano, a la altura de los hombros, justo por debajo de la barbilla; los pies, algo más abiertos que
       los hombros, con los talones apoyados; la cadera va atrás y baja hasta que los codos tocan las rodillas (se busca la altura a la que el
       codo se posa en el muslo junto a la rodilla: a 11 cm de su eje, que es medio muslo más medio codo); y sube */
    COREO['sentadilla-frontal-mancuernas'] = (function () {
      var pies = { suelo: [22, 0], abre: 14, polo: [0.36, 0.1, 1] }, alHombro = { a: [11, 21, 16], en: 'torax', polo: [0, -0.5, 1] }, M = { tipo: 'puno', prono: 0 };
      var a = { pel: [0, altoCon(12), 0], p: pies, b: alHombro, m: M };
      var P = function (y) { return agachado(pies, y, -25, 32, { col: [5, 0, 0], b: alHombro, m: M }); };
      var alMuslo = function (E) { var L = E.i, u = unidad(menos(L.rod, L.cad)), w = menos(L.cod, L.cad); return largo(menos(w, por(u, punto(w, u)))); };
      var yb = busca(function (y) { return alMuslo(resolver(P(y))); }, 11, 28, 52), b = P(yb);
      return {
        vista: [44, 90], rastro: 'pel', esfuerzo: [2], clavos: T2, material: [['mancuernas']],
        posturas: { a: a, b: b },
        rep: bajaSube('b', 'a', [1.8, 0.4, 1.4, 0.6]),
        pasos: ['a', 'rep', 'rep']
      };
    })();

    /* ── con la barra a la espalda (como en el bloque 1): la barra, pegada a la parte alta de la espalda; las manos, a la barra ── */
    var ESPALDA = ['barra', { ancla: 'torax', en: [0, 23, -9.5] }], A_LA_BARRA = { hom: [0, -1.5], b: { a: [34, 21, -9], en: 'torax', polo: [0.6, -1, -0.5] }, m: PRONO };
    function enBarra(n) { return ['mi@' + n + ':34', 'md@' + n + ':-34']; }

    /* sumo, con barra: con la barra sobre los hombros, separa los pies bastante más que los hombros y gira las puntas 45° hacia fuera; con la
       espalda recta, baja despacio, como si se sentara, hasta que los muslos quedan paralelos al suelo; y vuelve arriba estirando las piernas */
    COREO['sentadilla-sumo-barra'] = (function () {
      var DE = [12, 6], A = [34, 45], pies = { suelo: [A[0], 0], abre: A[1], polo: [0.8, 0.1, 0.78] }, K = T2.concat(enBarra(0)), posturas = {};
      posturas.a = sobre(A_LA_BARRA, { pel: [0, altoCon(A[0] - D.caderaX), 0], p: pies });
      var abre = abrirPies(posturas, 'o', A_LA_BARRA, DE, A, 'a', 2.6, enBarra(0));
      posturas.b = agachado(pies, 45.5, -14, 24, sobre(A_LA_BARRA, { col: [3, 0, 0] }));
      return {
        vista: [30, 84], rastro: 'pel', esfuerzo: [2], clavos: K, material: [ESPALDA],
        posturas: posturas, inicio: 'a', encuadra: ['o0'],
        rep: bajaSube('b', 'a', [2.0, 0.3, 1.4, 0.5]),
        pasos: [{ sec: [['o0', 0.7, null, K]].concat(abre), desde: 'o0' }, 'rep', 'rep']
      };
    })();

    /* al banco, con barra: un banco detrás; saca la barra del soporte sobre los hombros y da un paso atrás, hasta quedar delante del banco;
       con los pies algo más abiertos que los hombros, baja despacio hasta rozar el banco con los glúteos (la cadera, a 11,6 cm de su tapa:
       lo toca y no se sienta); una pausa, y sube despacio */
    COREO['sentadilla-al-banco-barra'] = (function () {
      var atras = -34, pb = { suelo: [22, atras], abre: 14, polo: [0.34, 0.1, 1] }, cerca = { suelo: [14, 0], abre: 8 }, KB = enBarra(1);
      var con = function (c) { return sobre(A_LA_BARRA, c); };
      return {
        vista: [62, 16], rastro: 'pel', esfuerzo: [2], clavos: T2.concat(KB),
        material: [['soporte', { z: -13.5, alto: 128.5, ancho: 56 }], ESPALDA, ['banco', { rumbo: 90, en: [0, atras - 28], largo: 110 }]],
        posturas: {
          sop: con({ pel: [0, 82, 0], hom: [0, 0], p: cerca }),
          arr: con({ pel: [0, PIE, 0], p: cerca }),
          p1: con({ pel: [0, PIE - 1, atras / 2], pi: cerca, pd: { suelo: [-22, atras], abre: 14 } }),
          a: con({ pel: [0, altoCon(12), atras], p: pb }),
          b: agachado(pb, 44 + 11.6, atras - 23, 36, con({ col: [3, 0, 0] }))
        },
        inicio: 'a', encuadra: ['sop'],
        rep: bajaSube('b', 'a', [2.1, 0.8, 1.8, 0.5]),
        pasos: [{ sec: [['sop', 0.9, null, KB.concat(T2)], ['arr', 0.9, 'suave', KB], ['p1', 0.7, 'suave', KB.concat(['ti'])], ['a', 0.7, 'suave', KB.concat(['td'])]], desde: 'sop' }, 'rep', 'rep']
      };
    })();

    /* frontal, con barra: la barra, en lo alto del pecho, sobre la parte delantera de los hombros, sujeta con los brazos cruzados (cada
       mano encima de la barra, junto al hombro contrario; los codos, altos y al frente); la cabeza y la espalda rectas y las puntas de los
       pies un poco hacia fuera; baja despacio hasta que los muslos quedan paralelos al suelo y vuelve despacio arriba */
    COREO['sentadilla-frontal-barra'] = (function () {
      var pies = { suelo: [20, 0], abre: 13, polo: [0.34, 0.1, 1] }, M = { tipo: 'plana', prono: 90 };
      var brazos = { bi: { a: [-12, 26.6, 11.5], en: 'torax', polo: [0.3, 0.35, 1] }, bd: { a: [12, 24.4, 11.5], en: 'torax', polo: [-0.3, 0.1, 1] }, m: M };
      var a = sobre(brazos, { pel: [0, altoCon(10), 0], p: pies }), b = agachado(pies, 45.5, -20, 22, sobre(brazos, { col: [-3, 0, 0] }));
      return {
        vista: [50, 90], rastro: 'pel', esfuerzo: [2], clavos: T2, material: [['barra', { ancla: 'torax', en: [0, 22.5, 10.8] }]],
        posturas: { a: a, b: b },
        rep: bajaSube('b', 'a', [2.2, 0.3, 2.0, 0.5]),
        pasos: ['a', 'a', 'rep']
      };
    })();

    /* con la barra sobre la cabeza: separa los pies algo más que los hombros, con las puntas un poco hacia fuera; la barra, por encima de la
       cabeza, con un agarre muy abierto y los brazos y los codos estirados del todo; sin bajarla (los brazos siguen a plomo: la barra queda
       sobre los pies), dobla las rodillas hasta que los muslos quedan paralelos al suelo; y sube */
    COREO['sentadilla-por-encima-cabeza'] = (function () {
      var DE = [11, 5], A = [22, 13], pies = { suelo: [A[0], 0], abre: A[1], polo: [0.36, 0.1, 1] }, G = 45, posturas = {};
      /* los brazos, estirados desde el hombro hasta la barra, que va G a cada lado y 2 cm por delante de los tobillos */
      var ZB = -1.5, arriba = function (P) { var h = resolver(P).i.hom, dx = G - h[0], dz = ZB - h[2]; return estirado(sobre(P, { m: EN_BARRA }), [G, h[1] + Math.sqrt(BRAZO * BRAZO - dx * dx - dz * dz), ZB], 'b', 0.03, [1, 0.1, -0.5]); };        /* (22-11-2026) la barra, 3,5 cm más atrás: sobre la nuca, no sobre las púas del tupé (las rozaba) */
      var base = arriba({ hom: [2.5, 0] });
      posturas.a = arriba({ pel: [0, altoCon(12), 0], hom: [2.5, 0], p: pies });
      var abre = abrirPies(posturas, 'o', {}, DE, A, 'a', 2.2);
      ['o0', 'o1', 'o2', 'o3'].forEach(function (n) { posturas[n] = arriba(sobre(posturas[n], { hom: [2.5, 0] })); });
      posturas.b = arriba(agachado(pies, 46, -25, 30, { col: [-6, 0, 0], hom: [2.5, 0] }));
      return {
        vista: [38, 90], rastro: 'pel', esfuerzo: [2], clavos: T2, zoom: 0.86, material: [['barra', { discos: 15 }]],
        posturas: posturas, inicio: 'a', encuadra: ['o0'],
        rep: bajaSube('b', 'a', [2.0, 0.4, 1.6, 0.6]),
        pasos: [{ sec: [['o0', 0.5, null, T2]].concat(abre), desde: 'o0' }, 'a', 'rep', 'rep']
      };
    })();

    /* hack, con barra: la barra, en el suelo, justo detrás de las piernas; los pies, a la anchura de los hombros y con las puntas hacia
       delante; se agacha y la agarra por detrás, con las palmas hacia atrás; la levanta estirando la cadera y las rodillas, sin llegar a
       bloquearlas; y baja hasta que los muslos quedan paralelos al suelo y sube despacio. La barra sube y baja a plomo, por detrás de las piernas */
    COREO['sentadilla-hack-barra'] = (function () {
      var pies = { suelo: [17, 0], abre: 0, polo: [0.2, 0.1, 1] }, G = 30, RD = 17, ZB = -15.5, MANO = { tipo: 'puno', barra: [1, 0, 0], palma: [0, 0, -1] };
      var detras = function (P, y) { return conAgarre(sobre(P, { m: MANO }), [G, y, ZB], [1, 0.2, -0.7]); };
      var colgada = function (P) { var h = resolver(P).i.hom, dx = G - h[0], dz = ZB - h[2]; return detras(P, h[1] - Math.sqrt((BRAZO - 0.6) * (BRAZO - 0.6) - dx * dx - dz * dz)); };
      var s = { p: pies, b: aLosLados(10), m: SUELTA };
      /* a cogerla: muy agachado, con el tronco casi erguido (los hombros, sobre la barra); se busca cuánto para llegar con los brazos estirados */
      var Pg = function (x) { return agachado(pies, PIE - x, -0.36 * x, 5 + 0.2 * x, { col: [4, 0, 0] }); };
      var xg = busca(function (q) { return largo(menos(resolver(Pg(q)).i.hom, [G, RD, ZB])); }, BRAZO - 0.6, 20, 62);
      var g = detras(Pg(xg), RD), a = colgada(agachado(pies, 83.6, -3, 3, {})), b = colgada(agachado(pies, 46.5, -23, 27, { col: [3, 0, 0] }));
      return {
        vista: [-58, [-104, 12]], rastro: 'pel', esfuerzo: [2], clavos: T2, reposo: ['s'],
        material: [['barra', { discos: RD, reposo: [0, RD, ZB] }]],
        posturas: { s: s, g: g, a: a, b: b }, inicio: 'a', encuadra: ['s', 'g'],
        rep: bajaSube('b', 'a', [1.9, 0.3, 1.9, 0.5]),
        pasos: ['s', { sec: [['g', 1.7, 'suave', T2]], desde: 's' }, { sec: [['g', 0.3, null, T2], ['a', 1.7, 'empuje', T2]], desde: 'g' }, 'rep']
      };
    })();

    /* media sentadilla con apoyo: de pie, con los pies a la anchura de la cadera, apoya las manos en el respaldo de una silla; dobla despacio
       las rodillas sin pasar de unos 45 grados (se busca la altura de la cadera con la que se doblan 44), con las rodillas hacia el dedo gordo y
       la espalda recta; y sube con suavidad.
       La silla, delante y de espaldas a él: lo alto del respaldo, a 94 cm del suelo y a 36 de sus pies. Las manos, encima, con la palma hacia
       abajo y la muñeca doblada lo que haga falta para quedar planas sobre él (el respaldo de una silla no lo mide contactos.js: se dice con
       prono y mun, no como una mano apoyada en el suelo) */
    COREO['media-sentadilla-apoyo'] = (function () {
      var pies = { suelo: [10, 0], abre: 4, polo: [0.1, 0.1, 1] }, LR = 50, ZR = 40, ALTO_R = 40.5 + LR * Math.sin(85 * RAD) + 3.6;
      var enResp = { a: [10.5, ALTO_R + ALTO_MUN, ZR - LR * Math.cos(85 * RAD) - 2.5], polo: [0.9, -0.5, -0.6] }, K = T2.concat(['mi', 'md']);
      var a0 = { p: pies, b: aLosLados(10), m: SUELTA }, a = { p: pies, b: enResp, m: { tipo: 'plana', prono: 90, mun: -44 } };
      var abajo = function (y) { return agachado(pies, y, -(PIE - y), 9, { b: enResp, m: { tipo: 'plana', prono: 90, mun: -52 } }); };
      var dobla = function (P) { var L = resolver(P).i; return 180 - Math.acos(entre(punto(unidad(menos(L.cad, L.rod)), unidad(menos(L.tob, L.rod))), -1, 1)) / RAD; };
      var b = abajo(busca(function (y) { return -dobla(abajo(y)); }, -44, 72, 85));
      return {
        vista: [80, 128], rastro: 'pel', esfuerzo: [2], clavos: K,
        material: [['banco', { en: [0, ZR - (38 + LR) / 2 + 38], rumbo: 180, largo: 38 + LR, respaldo: 85, tapa: true }]],
        posturas: { a0: a0, a: a, b: b }, inicio: 'a', encuadra: ['a0'],
        rep: bajaSube('b', 'a', [1.9, 0.35, 1.6, 0.5]),
        pasos: [{ sec: [['a0', 0.7, null, T2], ['a', 1.3, 'suave', T2]], desde: 'a0' }, 'rep', 'rep']
      };
    })();

    /* deslizando por la pared: la espalda, apoyada en ella; los pies, a 30 cm de la pared y un poco girados hacia fuera; dobla despacio las
       rodillas deslizando la espalda por la pared, con las rodillas en línea con los pies y sin pasar de las puntas (baja hasta que los muslos
       quedan casi paralelos al suelo: ahí la rodilla sigue por detrás de la punta, que se comprueba); y sube. Para ponerse, los pies se
       separan de la pared de uno en uno, por el aire */
    COREO['sentadilla-deslizando-pared'] = (function () {
      var ZP = -13.4, ZT = ZP + 30 + D.talon, cerca = { suelo: [10, 8], abre: 4 }, lejos = { suelo: [10, ZT], abre: 10, polo: [0.2, 0.3, 1] }, PIE_AIRE = { punta: [0, -0.34, 0.94], arriba: [0, 0.94, 0.34] };
      var brazos = { b: aLosLados(8), m: SUELTA }, en = function (y, c) { return sobre(brazos, sobre({ pel: [0, y, -1] }, c)); };
      var ya = altoCon(ZT + 1), P = function (y) { return en(y, { p: lejos }); };
      /* lo más abajo que iría sin que la rodilla pase de 2 cm por detrás de la punta del pie; se queda antes: con los muslos casi paralelos */
      var yTope = busca(function (y) { return resolver(P(y)).i.rod[2]; }, ZT + D.punta - 2, 40, ya - 2), yb = Math.max(yTope, 47.5);
      return {
        vista: [66, 22], rastro: 'pel', esfuerzo: [2], clavos: T2, material: [['pared', { z: ZP, normal: [0, 0, 1], ancho: 150 }]],
        posturas: {
          s: en(PIE - 0.5, { p: cerca }),
          w1: en(PIE - 1.6, { pi: { a: [10.3, 18, 16], polo: [0.1, 0.3, 1] }, ti: PIE_AIRE, pd: reflejo(cerca) }),
          w2: en(PIE - 2.6, { pi: lejos, pd: reflejo(cerca) }),
          w3: en(ya - 0.6, { pi: lejos, pd: { a: [-10.3, 18, 16], polo: [-0.1, 0.3, 1] }, td: PIE_AIRE }),
          a: P(ya), b: P(yb)
        },
        inicio: 'a', encuadra: ['s'],
        rep: bajaSube('b', 'a', [2.0, 0.4, 1.6, 0.5]),
        pasos: [{ sec: [['s', 0.6], ['w1', 0.5, 'entra'], ['w2', 0.55, 'sale'], ['w3', 0.55, 'entra'], ['a', 0.55, 'sale']], desde: 's' }, 'rep', 'rep']
      };
    })();

    /* (22-11-2026: los brazos «por detrás» se dicen con e negativo; con z: 176 el codo doblaba al revés y la mano giraba de golpe)
       la hindú: los pies, a la anchura de los hombros, y los brazos un poco por detrás del cuerpo; al bajar levanta los talones, con la espalda
       lo más vertical que puede; abajo toca los talones con las manos, y sube apoyándolos de nuevo, con los brazos estirados delante del pecho;
       y lleva los brazos atrás, como si remara, para empezar la siguiente. Cada paso de la ficha, en el suyo; y en el último sigue la repetición */
    COREO['sentadilla-hindu'] = (function () {
      var X = 17, TAL = 50, q = deTalon(TAL);
      var pie = function (t) { return { suelo: [X, 0], abre: 6, talon: t, polo: [0.3, 0.1, 1] }; };
      var atras = { e: -13, z: -8, g: 0, c: 12 }, rema = { a: [25, 1, 3], en: 'torax', polo: [0.45, -0.25, -1] }, alFrente = { e: 86, z: 5, g: 0, c: 5 };
      var a = { p: pie(0), b: atras, m: SUELTA }, c = { p: pie(0), b: alFrente, m: { tipo: 'abierta', prono: 90 } }, r = { p: pie(0), b: rema, m: SUELTA };
      /* abajo: de puntillas, con el tronco casi vertical y la cadera sobre los talones; las yemas de los dedos llegan al talón de la zapatilla */
      var B = { pel: [0, 33, q[0] - 15], giro: [0, 6, 0], cab: [-4, 0, 0], p: pie(TAL) }, EB = resolver(B), tal = EB.i.talon;
      var b = sobre(B, { b: { a: [tal[0] + 4.5, tal[1] + D.dedos - 1, tal[2] - 1], polo: [1, 0.2, -0.8] }, m: { tipo: 'abierta', prono: 0 } });
      /* a medio camino: el pie, a medio rodar sobre su bola (si no, el tobillo iría en línea recta y la zapatilla cortaría el suelo) */
      var m1 = { pel: [0, 62, -7], giro: [0, 8, 0], cab: [-6, 0, 0], p: pie(TAL / 2), b: { e: -10, z: -8, g: 0, c: 10 }, m: SUELTA };
      var m2 = { pel: [0, 60, -8], giro: [0, 9, 0], cab: [-7, 0, 0], p: pie(TAL / 2), b: { e: 46, z: 8, g: 0, c: 22 }, m: { tipo: 'abierta', prono: 60 } };
      var baja = [['m1', 0.75, 'entra', T2], ['b', 0.8, 'sale', T2]], sube = [['m2', 0.65, 'entra', T2], ['c', 0.75, 'sale', T2]], remo = [['r', 0.5, 'entra', T2], ['a', 0.5, 'sale', T2]];
      return {
        vista: [64, 18], rastro: 'pel', esfuerzo: [3, 4], clavos: T2,
        posturas: { a: a, m1: m1, b: b, m2: m2, c: c, r: r },
        rep: baja.concat([['b', 0.3, null, T2]], sube, [['c', 0.25, null, T2]], remo, [['a', 0.2, null, T2]]),
        pasos: ['a', { sec: baja, desde: 'a' }, { sec: [['b', 0.5, null, T2]].concat(sube), desde: 'b' }, { rep: 0.75 + 0.8 + 0.3 + 0.65 + 0.75 + 0.25 }]
      };
    })();

    /* ══════════════════════════════ SENTARSE Y LEVANTARSE ══════════════════════════════
       En el borde de un banco atravesado (su tapa, a 44 cm: la cadera, a 55). Para levantarse el tronco se echa hacia delante, la cadera
       despega y va hacia los pies, y las piernas se estiran; para sentarse, lo mismo al revés y más despacio. Los pies no se mueven */
    var BANCO_SENTARSE = ['banco', { rumbo: 90, en: [0, -6], largo: 100 }];

    /* sentarse y levantarse: sentado en el borde, con los pies a la anchura de la cadera y el cuerpo algo inclinado hacia delante (las
       manos, sobre los muslos); se levanta despacio con las piernas, sin los brazos (se despegan de los muslos antes de subir) y mirando
       al frente; y, ya de pie, se sienta otra vez lo más despacio que puede */
    COREO['sentarse-levantarse'] = (function () {
      var ZP = 33, pies = { suelo: [10, ZP], abre: 4, polo: [0.1, 0.6, 1] }, alFrente = { e: 28, z: 12, g: 20, c: 26 };
      var s = enSusMuslos({ pel: [0, 55, 1], giro: [0, 12, 0], cab: [-9, 0, 0], p: pies });
      var l = { pel: [0, 58.5, 9], giro: [0, 40, 0], col: [3, 0, 0], cab: [-33, 0, 0], p: pies, b: alFrente, m: SUELTA };
      var a = { pel: [0, PIE, ZP - 1.5], p: pies, b: aLosLados(10), m: SUELTA };
      return {
        vista: [70, 24], rastro: 'pel', clavos: T2, material: [BANCO_SENTARSE],
        posturas: { s: s, l: l, a: a }, inicio: 's', encuadra: ['a'],
        pasos: ['s', { sec: [['l', 0.9, 'suave'], ['a', 2.0, 'empuje']], desde: 's' }, { sec: [['a', 0.45], ['l', 2.4, 'freno'], ['s', 1.4, 'suave']], desde: 'a' }]
      };
    })();

    /* con un pie adelantado: sentado en una silla firme apoyada contra la pared, con los brazos cruzados y un pie por delante del otro; se
       levanta hasta quedar de pie; y vuelve a sentarse despacio y con control. La silla: el asiento, de 38 cm, y el respaldo, de 46 */
    COREO['sentarse-levantarse-pie-adelantado'] = (function () {
      var LR = 46, ZH = -11, ZS = ZH + 10.6, atras = { suelo: [-10, ZS + 33], abre: 4, polo: [-0.1, 0.6, 1] }, delante = { suelo: [10, ZS + 47], abre: 4, polo: [0.1, 0.6, 1] };
      var base = { b: CRUZ, m: SUELTA, pi: delante, pd: atras };
      var s = sobre(base, { pel: [0, 55, ZS], giro: [0, -1, 0], cab: [1, 0, 0] });
      var l = sobre(base, { pel: [0, 58.5, ZS + 9], giro: [0, 38, 0], col: [3, 0, 0], cab: [-31, 0, 0] });
      var a = sobre(base, { pel: [0, altoCon(8.5), ZS + 39] });
      return {
        vista: [66, 24], rastro: 'pel', clavos: T2,
        material: [['banco', { en: [0, ZH - (38 + LR) / 2 + 38], rumbo: 180, largo: 38 + LR, respaldo: 85 }], ['pared', { z: ZH - LR * Math.cos(85 * RAD) - 4.2, normal: [0, 0, 1], ancho: 150 }]],
        posturas: { s: s, l: l, a: a }, inicio: 's', encuadra: ['a'],
        pasos: ['s', { sec: [['l', 0.8, 'suave'], ['a', 1.7, 'empuje']], desde: 's' }, { sec: [['a', 0.35], ['l', 2.0, 'freno'], ['s', 1.2, 'suave']], desde: 'a' }]
      };
    })();

    /* la extensión de rodilla, sentado: con la espalda erguida en el extremo de un banco (las manos, sobre los muslos); estira y levanta
       despacio una pierna, con el pie un poco girado hacia fuera; aprieta y mantiene (entre el final de ese paso y el principio del
       siguiente, 5 segundos en el idioma más corto); y cambia de pierna */
    COREO['extension-rodilla-sentado'] = (function () {
      var suelo = { suelo: [11, 40], abre: 5, polo: [0.1, 1, 0.4] }, G = 14, c = Math.cos(12 * RAD), sn = Math.sin(12 * RAD);
      /* la pierna, estirada desde la cadera (el muslo sigue en el banco); el pie, con la punta hacia arriba y G grados hacia fuera */
      var alta = { a: [12, 51, 77.3], polo: [0, 1, 0] }, pie = { punta: [c * Math.sin(G * RAD), c * Math.cos(G * RAD), -sn], arriba: [-sn * Math.sin(G * RAD), -sn * Math.cos(G * RAD), -c] };
      var base = { pel: [0, 55, 0], giro: [0, -1, 0] };
      var s = enSusMuslos(sobre(base, { p: suelo })), l = enSusMuslos(sobre(base, { pi: alta, ti: pie, pd: reflejo(suelo) }));
      return {
        vista: [[64, 12], [20, 16]], isometrico: 'l', clavos: T2, material: [BANCO_DETRAS],
        posturas: { s: s, l: l, l2: refleja(l) }, inicio: 's', encuadra: ['l'],
        pasos: ['s', { sec: [['l', 1.8, 'suave']], desde: 's' }, { sec: [['l', 2.5], ['s', 1.2, 'suave'], ['l2', 1.7, 'suave']], desde: 'l' }]
      };
    })();

    /* ══════════════════════════════ LOS ESCALONES ══════════════════════════════ */

    /* la bajada del escalón: de pie sobre el primer peldaño (17 cm), de cara a la bajada y sobre una pierna (la izquierda); dobla despacio
       la rodilla de apoyo y el otro pie baja por delante del borde hasta rozar el suelo con el talón (la punta, hacia arriba); con los
       hombros sobre la cadera y la rodilla en línea con el pie, sube estirando la pierna. El pie libre sale primero hacia delante y después
       baja (y al revés): no corta la esquina del peldaño */
    COREO['bajada-escalon'] = (function () {
      var ALTO = 17, ZA = -19, apoyo = { suelo: [10, ZA], abre: 4, alto: ALTO, polo: [0.05, 0.1, 1] }, K = Math.cos(20 * RAD), S20 = Math.sin(20 * RAD);
      var TALON = { punta: [0, S20, K], arriba: [0, K, -S20] }, Y_TALON = D.tobillo * K + D.talon * S20 + 0.3;       /* el tobillo, con el talón rozando el suelo */
      var brazos = { b: aLosLados(16), m: SUELTA }, ZL = 8.5;
      var a0 = sobre(brazos, { pel: [0, PIE + ALTO, ZA], p: apoyo });
      var a = sobre(brazos, { pel: [2.5, PIE + ALTO, ZA], pi: apoyo, pd: { a: [-10, ALTO + D.tobillo + 7, ZA + 12], polo: [-0.1, 0.1, 1] }, td: alAire(-4) });
      var m = sobre(brazos, { pel: [2.5, PIE + ALTO - 5, ZA - 1.5], giro: [0, 3, 0], pi: apoyo, pd: { a: [-10, ALTO + D.tobillo + 4, ZL + 3], polo: [-0.1, 0.1, 1] }, td: { punta: [0, 0.1, 0.995], arriba: [0, 0.995, -0.1] } });
      /* abajo: la pierna libre, estirada hasta el suelo; la cadera baja lo que eso pide */
      var yb = Y_TALON + Math.sqrt(77.6 * 77.6 - (ZL - ZA + 5) * (ZL - ZA + 5));
      var b = sobre(brazos, { pel: [2.5, yb, ZA - 5], giro: [0, 6, 0], cab: [-4, 0, 0], pi: apoyo, pd: { a: [-10, Y_TALON, ZL], polo: [-0.1, 0.2, 1] }, td: TALON });
      return {
        vista: [[64, 12], [112, 10]], rastro: 'pel', esfuerzo: [3], clavos: T2,
        material: [['escalon', { med: [90, ALTO, 34], en: [0, -17] }]],
        posturas: { a0: a0, a: a, m: m, b: b }, inicio: 'a', encuadra: ['a0', 'b'],
        rep: [['m', 0.55, 'entra'], ['b', 1.7, 'sale'], ['b', 0.3], ['m', 1.4, 'empuje'], ['a', 0.5, 'sale'], ['a', 0.4]],
        pasos: [{ sec: [['a0', 0.7], ['a', 1.1, 'suave']], desde: 'a0' }, 'rep', 'rep']
      };
    })();

    /* ── la subida al banco (44 cm; atravesado delante): sube una pierna, sube y lleva la otra a su lado; baja en el mismo orden (primero
       la que subió primero); y la siguiente repetición empieza con la otra pierna. El pie que sube o baja no va en línea recta: pasa por
       delante del canto del banco, por encima de su tapa (u, v, x, y). carga: los brazos y lo que llevan; K: lo clavado de más ── */
    function subidaBanco(carga, K) {
      var H = 44, ZB = 40, ZA = ZB - 4, suelo = { suelo: [10, 0], abre: 5 }, arriba = { suelo: [10, ZA], abre: 5, alto: H, polo: [0.05, 0.2, 1] }, P = {}, k, T = T2.concat(K || []);
      var enAire = function (y, z, cae) { return { a: [10, y, z], polo: [0.05, 0.2, 1] }; };
      P.a = sobre(carga, { p: suelo });
      /* sube el pie izquierdo: en el aire, ante el canto (u); en el banco (p) */
      P.u = sobre(carga, { pel: [-2.5, PIE - 0.6, 2], pi: enAire(H + D.tobillo + 7, 15), ti: alAire(4, 0.1), pd: reflejo(suelo) });
      P.p = sobre(carga, { pel: [0, PIE - 1, 11], giro: [0, 9, 0], pi: arriba, pd: reflejo(suelo) });
      /* sube el cuerpo sobre la pierna izquierda; el pie derecho deja el suelo y sube ante el canto (v), y se posa al lado (arr) */
      P.v = sobre(carga, { pel: [1.5, PIE + H - 9, ZA - 5], giro: [0, 7, 0], pi: arriba, pd: { a: [-10, H + D.tobillo + 7, 15], polo: [-0.05, 0.2, 1] }, td: alAire(-4, 0.1) });
      P.arr = sobre(carga, { pel: [0, PIE + H, ZA], p: arriba });
      /* baja en el mismo orden: el pie izquierdo sale hacia atrás por encima del canto (x) y pisa el suelo (q); después baja el derecho (y) */
      P.x = sobre(carga, { pel: [-1.5, PIE + H - 9, ZA - 5], giro: [0, 7, 0], pi: enAire(H + D.tobillo + 7, 15), ti: alAire(4, 0.1), pd: reflejo(arriba) });
      P.q = sobre(carga, { pel: [0, PIE - 1, 11], giro: [0, 9, 0], pi: suelo, pd: reflejo(arriba) });
      P.y = sobre(carga, { pel: [2.5, PIE - 0.6, 2], pi: suelo, pd: { a: [-10, H + D.tobillo + 7, 15], polo: [-0.05, 0.2, 1] }, td: alAire(-4, 0.1) });
      var sube = [['u', 0.5, 'entra', T], ['p', 0.4, 'sale', T], ['v', 0.85, 'empuje', T], ['arr', 0.45, 'sale', T], ['arr', 0.35, null, T]];
      var baja = [['x', 0.5, 'entra', T], ['q', 0.85, 'freno', T], ['y', 0.5, 'entra', T], ['a', 0.45, 'sale', T], ['a', 0.3, null, T]];
      var otro = function (l) { return l.map(function (t) { return [t[0] === 'a' || t[0] === 'arr' ? t[0] : t[0] + '2', t[1], t[2], t[3]]; }); };
      ['u', 'p', 'v', 'x', 'q', 'y'].forEach(function (n) { P[n + '2'] = refleja(P[n]); });
      var dSube = sube.reduce(function (n, t) { return n + t[1]; }, 0);
      return { P: P, sube: sube, baja: baja, rep: sube.concat(baja, otro(sube), otro(baja)), tBaja: dSube, H: H, ZB: ZB };
    }
    var BANCO_SUBIR = ['banco', { rumbo: 90, en: [0, 40], largo: 110 }];

    /* con mancuernas: una en cada mano, colgando a los lados; apoya la pierna izquierda en el banco, sube y lleva la derecha a su lado; baja
       en el mismo orden y la siguiente repetición empieza con la otra pierna */
    COREO['subida-banco-mancuernas'] = (function () {
      var W = subidaBanco({ b: aLosLados(6), m: { tipo: 'puno', prono: 0 } });
      return {
        vista: [[58, 14], [104, 12]], rastro: 'pel', esfuerzo: [2, 12], material: [BANCO_SUBIR, ['mancuernas']],
        posturas: W.P, encuadra: ['arr'],
        rep: W.rep,
        pasos: ['a', { sec: W.sube.slice(0, 4), desde: 'a' }, { rep: W.tBaja }]
      };
    })();

    /* con barra: la barra, sobre los hombros, con un agarre abierto; sube al banco con una pierna y lleva la otra a su lado; baja en el mismo
       orden y alterna la pierna con la que empieza */
    COREO['subida-banco-barra'] = (function () {
      var W = subidaBanco(A_LA_BARRA, enBarra(1));
      return {
        vista: [[58, 14], [104, 12]], rastro: 'pel', esfuerzo: [2, 12], clavos: enBarra(1), material: [BANCO_SUBIR, ESPALDA],
        posturas: W.P, encuadra: ['arr'],
        rep: W.rep,
        pasos: ['a', { sec: W.sube.slice(0, 4), desde: 'a' }, { rep: W.tBaja }]
      };
    })();

    /* ══════════════════════════════ A UNA PIERNA ══════════════════════════════ */

    /* con apoyo de puntas: el pie derecho, un poco adelantado y con el peso; del izquierdo solo los dedos tocan el suelo (para el
       equilibrio); se inclina desde la cadera con la espalda plana, llevando la cadera atrás mientras dobla la rodilla derecha; con la pelvis
       nivelada y el pie de apoyo plano, empuja para volver arriba; y cambia de pierna (junta los pies y adelanta el otro) */
    COREO['sentadilla-una-pierna'] = (function () {
      var XA = -9, ZA = 9, apoyo = { suelo: [XA, ZA], abre: 4, polo: [-0.1, 0.1, 1] }, punta = function (t) { return { suelo: [9, -15], abre: 5, talon: t, polo: [0.1, 0.2, 1] }; };
      var brazos = { b: aLosLados(14), m: SUELTA }, q = deTalon(54);
      var a = sobre(brazos, { pel: [-4, PIE - 0.6, 4], pd: apoyo, pi: punta(54) });
      var b = sobre({ b: { e: 26, z: 20, g: 30, c: 30 }, m: SUELTA }, { pel: [-4, 60, -15], giro: [0, 42, 0], cab: [-34, 0, 0], pd: apoyo, pi: punta(62) });
      /* para cambiar: los dos pies planos, juntos (n); el que estaba de puntas se adelanta por el aire */
      var n = sobre(brazos, { pel: [0, PIE - 0.4, 0], pd: { suelo: [XA, 0], abre: 4 }, pi: { suelo: [9, 0], abre: 4 } });
      var n1 = sobre(brazos, { pel: [-2.5, PIE - 0.8, 2], pd: apoyo, pi: { suelo: [9, -8], abre: 5, talon: 28 } });
      return {
        vista: [[-62, 10], [-108, 10]], rastro: 'pel', esfuerzo: [2], clavos: T2,
        posturas: { a: a, b: b, n1: n1, n: n, a2: refleja(a), b2: refleja(b), n2: refleja(n1) },
        rep: bajaSube('b', 'a', [1.9, 0.3, 1.5, 0.5]),
        pasos: ['a', 'rep', { sec: [['b', 0.5], ['a', 1.4, 'empuje'], ['n1', 0.35, 'entra'], ['n', 0.4, 'sale'], ['n2', 0.4, 'entra'], ['a2', 0.35, 'sale'], ['b2', 1.7, 'freno']], desde: 'b' }]
      };
    })();

    /* la del camarón: de pie sobre una pierna (la izquierda), dobla la otra rodilla y deja ese pie detrás; baja despacio doblando la pierna
       de apoyo hasta que la rodilla de atrás toca el suelo (se busca la altura del pie de atrás con la que su rodilla queda posada); y sube
       empujando con la pierna de apoyo. Los brazos van hacia delante al bajar, que es lo que pide el equilibrio */
    COREO['sentadilla-camaron'] = (function () {
      var apoyo = { suelo: [9, 0], abre: 4, polo: [0.1, 0.1, 1] }, DETRAS = { punta: [0, 0.5, -0.87], arriba: [0, -0.87, -0.5] };
      var a0 = { p: { suelo: [9, 0], abre: 4 }, b: aLosLados(10), m: SUELTA };
      var a = { pel: [2.5, PIE - 0.4, 0], pi: apoyo, pd: { e: -6, z: 0, c: 96 }, td: { tob: 24 }, b: aLosLados(16), m: SUELTA };
      /* el pie se recoge despegando por la punta (a1, a2): si no, la zapatilla cortaría el suelo */
      var a1 = { pel: [1, PIE - 0.4, 0], pi: apoyo, pd: reflejo(enPunta(9, 28)), b: aLosLados(12), m: SUELTA }, a2 = { pel: [2, PIE - 0.4, 0], pi: apoyo, pd: reflejo(enPunta(9)), b: aLosLados(14), m: SUELTA };
      var P = function (y) { return { pel: [2.5, 44, -20], giro: [0, 44, 0], col: [4, 0, 0], cab: [-36, 0, 0], pi: apoyo, pd: { a: [-10, y, -47], polo: [0, -1, 0.6] }, td: DETRAS, b: { e: 100, z: 8, g: 0, c: 10 }, m: SUELTA }; };
      var yb = busca(function (y) { return resolver(P(y)).d.rod[1]; }, 6.1, 14, 44), b = P(yb);
      return {
        vista: [[70, 12], [112, 12]], rastro: 'pel', esfuerzo: [2], clavos: ['ti'],
        posturas: { a0: a0, a1: a1, a2: a2, a: a, b: b }, inicio: 'a', encuadra: ['a0'],
        rep: bajaSube('b', 'a', [2.1, 0.3, 1.5, 0.5]),
        pasos: [{ sec: [['a0', 0.6, null, T2], ['a1', 0.2, 'entra', T2], ['a2', 0.25, 'sale', T2], ['a', 0.9, 'suave']], desde: 'a0' }, 'rep', 'rep']
      };
    })();

    /* la pistol: de pie sobre una pierna (la izquierda), con la otra estirada hacia delante y los brazos extendidos a la altura de los
       hombros; baja despacio en sentadilla sobre la pierna de apoyo, con la espalda y la otra pierna rectas; y sube despacio estirando la
       rodilla doblada, sin bajar la pierna libre ni los brazos */
    COREO['sentadilla-pistol'] = (function () {
      var apoyo = { suelo: [9, 0], abre: 4, polo: [0.1, 0.1, 1] }, alFrente = { e: 88, z: 6, g: 0, c: 4 }, PUNTA_ARRIBA = { punta: [0, 0.5, 0.87], arriba: [0, 0.87, -0.5] };
      var a0 = { p: { suelo: [9, 0], abre: 4 }, b: aLosLados(10), m: SUELTA };
      /* la pierna libre, estirada desde su cadera hasta un tobillo a «y» del suelo */
      var libre = function (P, y) { var c = resolver(sobre(P, { pd: { e: 0, z: 0, c: 0 } })).d.cad, dy = y - c[1]; return sobre(P, { pd: { a: [c[0], y, c[2] + Math.sqrt(77.6 * 77.6 - dy * dy)], polo: [0, 1, 0] }, td: PUNTA_ARRIBA }); };
      var a = libre({ pel: [2.5, PIE - 0.4, 0], pi: apoyo, b: alFrente, m: { tipo: 'abierta', prono: 90 } }, 46);
      var b = libre({ pel: [2.5, 31, -23], giro: [0, 38, 0], col: [5, 0, 0], cab: [-36, 0, 0], pi: apoyo, b: { e: 131, z: 6, g: 0, c: 4 }, m: { tipo: 'abierta', prono: 90 } }, 27);
      return {
        vista: [[66, 12], [108, 12]], rastro: 'pel', esfuerzo: [2], clavos: ['ti'],
        posturas: { a0: a0, a: a, b: b }, inicio: 'a', encuadra: ['a0'],
        rep: bajaSube('b', 'a', [2.3, 0.3, 2.0, 0.5]),
        pasos: [{ sec: [['a0', 0.6, null, T2], ['a', 1.4, 'suave']], desde: 'a0' }, 'rep', 'rep']
      };
    })();

    /* ══════════════════════════════ DE RODILLAS ══════════════════════════════
       Las rodillas, en el suelo (en z = 0, a 5,5 cm de él) y los empeines también, con los dedos hacia atrás. De una postura a otra la cadera
       gira sobre las rodillas (porArco, en 70-coreografias.js) */
    var DE_RODILLAS = { p: { a: [10, 3.6, -37.5], polo: [0.1, -1, 0.6] }, t: { punta: [0, -0.04, -1], arriba: [0, -1, 0.04] } }, K_ROD = [5.5, 0];
    var ESTERILLA = ['esterilla', { en: [0, -14], med: [66, 1.6, 150] }];

    /* el curl nórdico inverso: de rodillas, con los brazos cruzados sobre el pecho y el tronco erguido; con la cadera estirada y el tronco
       rígido (de las rodillas a la cabeza, una línea), se inclina despacio hacia atrás doblando las rodillas; y las estira para volver */
    COREO['curl-nordico-inverso'] = (function () {
      var en = function (g) { return sobre(DE_RODILLAS, { pel: [0, 5.5 + 40 * Math.cos(g * RAD), -40 * Math.sin(g * RAD)], giro: [0, -g, 0], cab: [g * 0.25, 0, 0], b: CRUZ, m: SUELTA }); };
      var posturas = { k: en(0), e: en(34) }, baja = porArco(posturas, 'ke', posturas.k, posturas.e, 'e', 2, 2.7, K_ROD, T2), sube = porArco(posturas, 'ek', posturas.e, posturas.k, 'k', 2, 1.9, K_ROD, T2);
      var pausa = [['e', 0.35, null, T2]], arriba = [['k', 0.5, null, T2]];
      return {
        vista: [[84, 12], [36, 16]], rastro: 'hombros', esfuerzo: [0, 1, 2, 3], clavos: T2, material: [ESTERILLA],
        posturas: posturas, inicio: 'k',
        rep: baja.concat(pausa, sube, arriba),
        pasos: ['k', 'k', { sec: baja, desde: 'k' }, { rep: 2.7 + 0.35 }]
      };
    })();

    /* el flexor de la cadera, de rodillas: la rodilla izquierda, en el suelo bajo la cadera; el pie derecho, delante, con la rodilla derecha
       sobre el tobillo; apoya las manos en el muslo derecho, con la pelvis nivelada; se echa hacia delante sobre la cadera derecha (la cadera
       gira sobre la rodilla de atrás); mantiene, y cambia de lado: recoge el pie de delante, queda de rodillas y adelanta el otro */
    COREO['estiramiento-flexor-cadera-rodillas'] = (function () {
      var atras = { a: [10, 3.6, -37.5], polo: [0.1, -1, 0.6] }, PIE_AT = { punta: [0, -0.04, -1], arriba: [0, -1, 0.04] }, delante = { suelo: [-10, 40], abre: 3, polo: [-0.05, 1, 0.3] };
      var en = function (z, extra) { return sobre({ pel: [0, 5.5 + Math.sqrt(1600 - z * z), z], pi: atras, ti: PIE_AT, pd: delante }, extra || {}); };
      /* las dos manos, en el muslo de delante: la de ese lado, más cerca de la rodilla; la otra cruza y se posa más arriba */
      var manos = function (P) {
        var Q = enSuMuslo(P, 'd'), c = puntoEnMuslo(P, 14, 12.4, 'd');
        Q = sobre(Q, { bi: { a: [c[0] + 1.5, c[1], c[2]], polo: [0.8, -0.4, 0.4] } });
        return sobre(Q, { mi: manoHacia(Q, 'i', [-0.5, -0.1, 0.86], [0.1, -0.99, -0.1], 'plana') });
      };
      var sueltas = { b: aLosLados(10), m: SUELTA };
      var a0 = en(0, sueltas), a = manos(en(0, {})), b = manos(en(15, { giro: [0, 3, 0] }));
      var k = sobre(DE_RODILLAS, sobre({ pel: [0, 45.5, 0] }, sueltas));
      /* para cambiar de lado: el pie de delante se recoge por el aire (r: bajo la cadera; rb: ya detrás, con la punta hacia abajo) y su
         rodilla se posa junto a la otra (k); y el otro pie sale hacia delante por el mismo camino */
      var r = sobre(sueltas, { pel: [0, 45.5, 0], pi: atras, ti: PIE_AT, pd: { a: [-10, 23, 9], polo: [-0.1, 0.4, 1] }, td: { punta: [0, -0.34, 0.94], arriba: [0, 0.94, 0.34] } });
      var rb = sobre(sueltas, { pel: [0, 45.5, 0], pi: atras, ti: PIE_AT, pd: { a: [-10, 24, -27], polo: [-0.1, -0.2, 1] }, td: { punta: [0, -0.77, -0.64], arriba: [0, -0.64, 0.77] } });
      /* del otro lado, igual que del primero: las manos se posan en el muslo al llegar el pie (a2) y solo entonces se echa hacia delante
         (yendo de un tirón de los brazos sueltos a las manos en el muslo, la postura de en medio tenía la mano dentro del muslo: se
         la apartaba hacia un lado al llegar y hacia otro al salir, y saltaba 15 cm) */
      var posturas = { a0: a0, a: a, b: b, r: r, rb: rb, k: k, r2: refleja(r), rb2: refleja(rb), a2: refleja(a), b2: refleja(b) };
      var echa = porArco(posturas, 'ab', a, b, 'b', 1, 2.2, K_ROD), vuelve = porArco(posturas, 'ba', b, a0, 'a0', 1, 0.7, K_ROD), echa2 = porArco(posturas, 'ab2', posturas.a2, posturas.b2, 'b2', 1, 1.25, K_ROD);
      return {
        vista: [[-72, 12], [-24, 16]], isometrico: 'b', clavos: T2, material: [ESTERILLA],
        posturas: posturas, inicio: 'a0', encuadra: ['b'],
        pasos: ['a0', { sec: [['a', 1.4, 'suave']], desde: 'a0' }, { sec: echa, desde: 'a' },
                { sec: [['b', 0.35]].concat(vuelve, [['r', 0.34, 'entra'], ['rb', 0.3, 'lineal'], ['k', 0.3, 'sale'], ['rb2', 0.3, 'entra'], ['r2', 0.3, 'lineal'], ['a2', 0.46, 'sale']], echa2), desde: 'b' }]      /* 4,30 s: cabe en el paso más corto (4,40 s) */
      };
    })();

    /* ══════════════════════════════ EN EL SUELO ══════════════════════════════
       Boca arriba (la cabeza hacia −Z), con las manos apoyadas junto a la cadera. Una pierna estirada descansa en el suelo con el talón
       (el tobillo, a 8,4 cm): desde la cadera, 2,3° por debajo de la línea del tronco. La pierna que sube se dice por ángulos: va recta todo
       el camino (dicha por su tobillo iría en línea recta y la rodilla se doblaría a medio subir) */
    var EN_SUELO_PIERNA = -2.3, MANOS_SUELO = { a: [27, ALTO_MUN, 25], polo: [1, 0.2, 0] }, K_MANOS = ['mi', 'md'];

    /* la elevación de pierna recta: tumbado, con las piernas estiradas; aprieta el muslo y empuja la rodilla hacia abajo (la punta del pie
       viene hacia él); sin dejar de apretar, levanta toda la pierna del suelo, mantiene y la baja despacio */
    COREO['elevacion-pierna-recta'] = (function () {
      var base = sobre(SUPINO_SUELO, { b: MANOS_SUELO, m: EN_SUELO, pd: { e: EN_SUELO_PIERNA, z: 0, c: 0 }, td: { tob: 10 } });
      var con = function (e, tob) { return sobre(base, { pi: { e: e, z: 0, c: 0 }, ti: { tob: tob } }); };
      return {
        vista: [72, [30, 30]], picado: 16, isometrico: 'u', clavos: K_MANOS.concat(['td']),
        posturas: { a: con(EN_SUELO_PIERNA, 10), t: con(EN_SUELO_PIERNA, -12), u: con(33, -12) }, inicio: 'a', encuadra: ['u'],
        pasos: ['a', { sec: [['t', 1.3, 'suave']], desde: 'a' }, { sec: [['u', 1.4, 'suave'], ['u', 2.6], ['t', 2.0, 'freno']], desde: 't' }]
      };
    })();

    /* el cuádriceps isométrico con toalla: boca arriba, con una toalla enrollada debajo de la rodilla (la izquierda: queda algo doblada, con
       el talón en el suelo); aprieta el muslo y empuja la rodilla contra la toalla hasta estirarla, y el talón se despega del suelo;
       mantiene (entre los dos pasos, de 5 a 10 segundos) y relaja despacio */
    COREO['cuadriceps-isometrico-toalla'] = (function () {
      var R = 5, ZC = 20, base = sobre(SUPINO_SUELO, { b: MANOS_SUELO, m: EN_SUELO, pd: { e: EN_SUELO_PIERNA, z: 0, c: 0 }, td: { tob: 10 } });
      var pie = function (g) { var c = Math.cos(g * RAD), sn = Math.sin(g * RAD); return { punta: [0, c, -sn], arriba: [0, -sn, -c] }; };
      /* relajada: el talón, en el suelo, y la corva, sobre el rollo (el centro de la rodilla, a 6,3 cm de él); se busca dónde cae el tobillo */
      var Pa = function (z) { return sobre(base, { pi: { a: [10, 8.6, z], polo: [0, 1, 0] }, ti: pie(-16) }); };
      var za = busca(function (z) { return resolver(Pa(z)).i.rod[1]; }, 2 * R + 6.3, ZC + 60, ZC + 77.9), a = Pa(za), rod = resolver(a).i.rod;
      /* apretando: la pierna, recta desde la cadera y pasando por la rodilla, que aplasta el rollo 0,8 cm */
      var cad = resolver(a).i.cad, u = unidad(menos([rod[0], rod[1] - 0.8, rod[2]], cad)), tb = mas(cad, por(u, 77.98)), fi = Math.asin(u[1]) / RAD;
      var b = sobre(base, { pi: { a: tb, polo: [0, 1, 0] }, ti: pie(fi + 12) });
      return {
        vista: [[38, 26], [74, 14]], isometrico: 'b', clavos: K_MANOS.concat(T2),
        material: [['toalla', { en: [rod[0], R, rod[2] - 0.5], rollo: [34, R] }]],
        posturas: { a: a, b: b }, inicio: 'a', encuadra: ['b'],
        pasos: ['a', { sec: [['b', 1.4, 'suave']], desde: 'a' }, { sec: [['b', 2.4], ['a', 1.8, 'freno']], desde: 'b' }]
      };
    })();

    /* ══════════════════════════════ EL ESTIRAMIENTO TUMBADO DE LADO ══════════════════════════════
       Sobre el lado derecho (la cabeza hacia −Z, de cara a −X), con el tronco algo levantado: el codo derecho, en el suelo, y la cabeza,
       apoyada en esa mano. Las piernas, estiradas una sobre otra. Con la mano izquierda coge el empeine del pie izquierdo y lleva el talón
       hacia el glúteo, sin que la rodilla se separe de la otra (el muslo no se mueve: solo se dobla la rodilla). Mantiene, y se da la vuelta
       rodando sobre la espalda para repetirlo del otro lado (las mismas posturas, reflejadas) */
    COREO['estiramiento-cuadriceps-tumbado'] = (function () {
      var X0 = -12, tronco = { pel: [X0, 21.5, 0], giro: [-90, 0, -84], col: [0, 20, 0], cab: [0, 0, 5] };
      /* el brazo de abajo: el codo, en el suelo por delante de la cara (a 5,8 cm: lo que mide apoyado), a un brazo del hombro y a un
         antebrazo y una mano del lado de la cabeza que mira al suelo; la mano, de plano contra ella */
      var E0 = resolver(tronco), hom = E0.d.hom, centro = mas(E0.cab, aplicar(E0.Bc, [0, 17, 0])), lado = mas(centro, aplicar(E0.Bc, [-14.2, -2, 1]));
      var YC = 5.8, LM = D.antebrazo + D.mano + 1.2, r1 = Math.sqrt(D.brazo * D.brazo - (hom[1] - YC) * (hom[1] - YC)), r2 = Math.sqrt(LM * LM - (lado[1] - YC) * (lado[1] - YC));
      var dx = lado[0] - hom[0], dz = lado[2] - hom[2], dd = Math.sqrt(dx * dx + dz * dz), ca = (r1 * r1 - r2 * r2 + dd * dd) / (2 * dd), ch = Math.sqrt(Math.max(0, r1 * r1 - ca * ca));
      var codo = [hom[0] + ca * dx / dd - ch * dz / dd, YC, hom[2] + ca * dz / dd + ch * dx / dd];
      if (codo[0] > hom[0]) codo = [hom[0] + ca * dx / dd + ch * dz / dd, YC, hom[2] + ca * dz / dd - ch * dx / dd];
      var ua = unidad(menos(lado, codo)), conCabeza = function (P) {
        var Q = sobre(P, { bd: { a: mas(codo, por(ua, D.antebrazo)), polo: menos(codo, hom) } });
        return sobre(Q, { md: manoHacia(Q, 'd', ua, unidad(menos(centro, lado)), 'plana') });
      };
      /* la pierna de abajo, estirada en el suelo (la rodilla, apenas doblada hacia delante: así el pie mira al frente); su tobillo sube lo
         justo para que la zapatilla, de lado, descanse en el suelo sin hundirse. Y la de arriba, estirada sobre ella (su tobillo, 11 cm
         por encima del otro) */
      var cadD = E0.d.cad, cadI = E0.i.cad;
      var conAbajo = function (y) { var d = 77.6, x = -2; return conCabeza(sobre(tronco, { pd: { a: [cadD[0] + x, y, cadD[2] + Math.sqrt(d * d - x * x - (cadD[1] - y) * (cadD[1] - y))], polo: [-1, 0, 0] }, td: { tob: 8 } })); };
      var base = conAbajo(busca(function (y) { return bajoZapa(resolver(conAbajo(y)).d, 'd'); }, -0.3, 3, 11)), Ed = resolver(base).d;
      var haciaTob = unidad(menos([Ed.tob[0], Ed.tob[1] + 11, Ed.tob[2] + 1], cadI)), recta = { a: mas(cadI, por(haciaTob, 77.8)), polo: [-1, 0, 0] };
      /* doblada: la rodilla de arriba descansa sobre la de abajo (11,5 cm por encima) y no se mueve; la pierna se dobla «fi» grados hacia atrás */
      var dy = cadI[1] - (Ed.rod[1] + 11.5), dxr = Ed.rod[0] - cadI[0], rodI = [Ed.rod[0], Ed.rod[1] + 11.5, cadI[2] + Math.sqrt(D.muslo * D.muslo - dy * dy - dxr * dxr)];
      var tm = unidad(menos(rodI, cadI)), atras = unidad(sinParte([1, 0, 0], tm));
      var doblada = function (fi) { var c = Math.cos(fi * RAD), sn = Math.sin(fi * RAD); return { a: mas(rodI, por(mas(por(tm, c), por(atras, sn)), D.pierna)), polo: menos(rodI, cadI) }; };
      var conPierna = function (q, tob) { return sobre(base, { pi: q, ti: { tob: tob } }); };
      /* la mano de arriba. En reposo, sobre la cadera de su lado (el arranque del muslo), de plano; levantada sobre ella (para ir al pie o
         volver de él sin atravesar el muslo); y al empeine (7 cm por delante del tobillo y 3,5 sobre él) */
      var enCadera = function (P) {
        var L = resolver(P).i, u = unidad(menos(L.rod, L.cad)), n = unidad(sinParte([0, 1, 0], u)), Q = sobre(P, { bi: { a: puntoEnMuslo(P, 11, 12.7, 'i'), polo: [0.5, 1, -0.4] } });
        return sobre(Q, { mi: manoHacia(Q, 'i', mas(por(u, 0.97), por(n, -0.2)), mas(por(n, -0.97), por(u, -0.2)), 'plana') });
      };
      var levantada = function (P) { return sobre(P, { bi: { a: mas(cadI, [5, 19, 9]), polo: [0.5, 1, -0.4] }, mi: { tipo: 'suelta', prono: 30 } }); };
      var alEmpeine = function (P) { var L = resolver(P).i; return conAgarre(sobre(P, { hom: { i: [-2, -2.5], d: [0, 0] }, mi: { tipo: 'puno', prono: 20 } }), mas(L.tob, mas(por(L.punta, 7), por(L.arriba, 3.5))), [0.6, 0.9, -0.2], 'bi'); };
      var a = enCadera(conPierna(recta, 8)), r = levantada(conPierna(doblada(100), 24)), g = alEmpeine(conPierna(doblada(104), 26)), b = alEmpeine(conPierna(doblada(146), 30));
      /* boca arriba, a medio darse la vuelta: las manos, sobre el abdomen, y las piernas, estiradas */
      var s = sobre(SUPINO_SUELO, { pel: [0, 11.5, 0], p: { e: EN_SUELO_PIERNA, z: 0, c: 0 }, t: { tob: 8 }, b: { a: [8, 5, 14.5], en: 'torax', polo: [0.8, -0.7, -0.5] }, m: { tipo: 'plana', prono: 70 } });
      /* antes de rodar suelta la cabeza y el tronco baja un poco (q): el antebrazo de abajo queda tendido en el suelo, por delante del
         cuerpo; al rodar, ese brazo se recoge ante el pecho (RECOGIDO: el codo ya no toca el suelo) */
      var RECOGIDO = { a: [-3, 5, 16.5], en: 'torax', polo: [-0.25, -1, 0.4] };
      var q = enCadera(sobre(conPierna(recta, 8), { col: [0, 12, 0], cab: [0, 0, 3], bd: { a: [X0 - 19, ALTO_MUN, -20], polo: [-1, -0.3, -0.5] }, md: EN_SUELO }));
      /* a medio rodar entre el lado y la espalda (sg: 1, desde el derecho; −1, desde el izquierdo): el cuerpo, girado 45° sobre su eje; el
         brazo de abajo ya ha soltado la cabeza y viene hacia el pecho; y las piernas, estiradas y algo levantadas (la zapatilla de abajo,
         que rueda de su costado al talón, es más ancha en diagonal: con el tobillo en línea recta se hundiría) */
      var medio = function (sg) {
        var tr = { pel: [X0 * 0.5 * sg, 17.4, 0], base: baseEjes([0, 0.05, -1], [-0.7 * sg, 0.72, 0]), col: [0, 9 * sg, 0], cab: [0, 0, 2 * sg], t: { tob: 8 }, m: { tipo: 'suelta', prono: 40 } };
        var abajo = RECOGIDO, arriba = { a: [10, 3, 16], en: 'torax', polo: [0.5, -1, 0.3] };
        tr[sg > 0 ? 'bd' : 'bi'] = sg > 0 ? abajo : reflejo(abajo); tr[sg > 0 ? 'bi' : 'bd'] = sg > 0 ? arriba : reflejo(arriba);
        var con = function (e) { return sobre(tr, { p: { e: e, z: 0, c: 2 } }); }, k = sg > 0 ? 'd' : 'i';
        return con(busca(function (e) { return bajoZapa(resolver(con(e))[k], k); }, 0.4, -6, 14));
      };
      var P = { a: a, r: r, g: g, b: b, q: q, s: s, as: medio(1), sa: medio(-1) };
      ['a', 'r', 'g', 'b', 'q'].forEach(function (n) { P[n + '2'] = refleja(P[n]); });
      return {
        vista: [[-90, 44], [58, 30]], isometrico: 'b',
        posturas: P, inicio: 'a', encuadra: ['a', 'b', 'a2', 'b2', 's'],
        pasos: ['a', { sec: [['r', 0.75, 'suave'], ['g', 0.7, 'suave'], ['b', 1.3, 'suave']], desde: 'a' },
                { sec: [['b', 0.15], ['r', 0.5, 'suave'], ['q', 0.5, 'suave'], ['as', 0.34, 'entra'], ['s', 0.32, 'lineal'], ['sa', 0.32, 'lineal'], ['q2', 0.34, 'sale'],
                        ['a2', 0.4, 'suave'], ['r2', 0.45, 'suave'], ['g2', 0.5, 'suave'], ['b2', 0.7, 'suave']], desde: 'b' }]
      };
    })();

    /* ══════════════════════════════ EL ESTIRAMIENTO DE PIE ══════════════════════════════
       Ante una pared (el apoyo firme): una mano en ella, a la altura del pecho. Dobla la rodilla del otro lado y lleva el talón hacia el
       glúteo, sujetando el empeine con la mano de ese lado (lo de la toalla es «si no llega»: no hace falta); con la espalda recta, mantiene;
       y cambia de pierna: suelta el pie, lo posa por la punta, cambia la mano de la pared y repite con la otra */
    COREO['estiramiento-cuadriceps-de-pie'] = (function () {
      var ZW = 43.5, PARED = ['pared', { z: ZW + ALTO_MUN, normal: [0, 0, -1], ancho: 130 }], pies = { suelo: [9, 0], abre: 5 };
      var enPared = { bd: { a: [-17, 118, ZW], polo: [-0.7, -1, -0.5] }, md: PLANA_PARED }, suelto = { e: 5, z: 90, g: 90, c: 10 };
      var a0 = { p: pies, b: suelto, m: SUELTA };
      var a = sobre(enPared, { p: pies, bi: suelto, mi: SUELTA });
      /* la pierna izquierda, por ángulos: el muslo, a plomo (o un poco atrás), y la rodilla doblada «c» grados; el pie, suelto */
      var con = function (e, c, tob) { return sobre(enPared, { pel: [-2.5, PIE - 0.3, 0], pd: reflejo(pies), pi: { e: e, z: 0, c: c }, ti: { tob: tob }, bi: suelto, mi: SUELTA }); };
      /* la mano izquierda, al empeine (7 cm por delante del tobillo y 3,5 sobre él) */
      var alEmpeine = function (P) { var L = resolver(P).i; return conAgarre(sobre(P, { hom: { i: [-2, -2.5], d: [0, 0] }, mi: { tipo: 'puno', prono: 20 } }), mas(L.tob, mas(por(L.punta, 7), por(L.arriba, 3.5))), [0.9, 0.2, -0.6], 'bi'); };
      var k = con(-2, 112, 26), g = alEmpeine(k), b = alEmpeine(con(-6, 148, 30));
      /* a posarlo: por la punta (dp) y rodando hasta el talón (dq) */
      var dp = sobre(enPared, { pel: [-1.5, PIE - 0.3, 0], pd: reflejo(pies), pi: enPunta(9), bi: suelto, mi: SUELTA }), dq = sobre(enPared, { pel: [-0.6, PIE - 0.2, 0], pd: reflejo(pies), pi: enPunta(9, 28), bi: suelto, mi: SUELTA });
      /* la mano que llega a la pared se pone primero ante ella, ya de plano, y después la toca (h); la que se va, al revés: en línea recta
         desde el costado, los dedos entrarían en la pared */
      var ante = { a: [17, 114, ZW - 9], polo: [0.7, -1, -0.5] }, h = sobre(a, { bi: ante, mi: PLANA_PARED }), ab = sobre(a, { bi: { a: [17, 118, ZW], polo: [0.7, -1, -0.5] }, mi: PLANA_PARED });
      var h0 = sobre(a0, { bd: reflejo(ante), md: PLANA_PARED });
      /* y entre colgar del costado y ponerse ante la pared, la mano pasa por delante, a media altura y todavía suelta (n): de colgar
         (los dedos hacia abajo) a plana ante la pared (hacia arriba) de un tirón, a medio camino los dedos se daban la vuelta de golpe */
      var medio = { a: [19, 97, 24], polo: [0.7, -1, -0.5] }, n = sobre(a, { bi: medio, mi: SUELTA }), n0 = sobre(a0, { bd: reflejo(medio), md: SUELTA });
      var P = { a0: a0, n0: n0, h0: h0, a: a, k: k, g: g, b: b, dp: dp, dq: dq, n: n, h: h, ab: ab }, KD = ['md', 'td'], KI = ['mi', 'ti'], K4 = T2.concat(['mi', 'md']);
      ['a', 'k', 'g', 'b', 'dp', 'dq', 'n', 'h'].forEach(function (n) { P[n + '2'] = refleja(P[n]); });
      return {
        vista: [[104, 10], [150, 12]], isometrico: 'b', clavos: ['td', 'md'], clavosEn: { a0: T2, b2: KI }, material: [PARED],
        posturas: P, inicio: 'a0', encuadra: ['b'],
        pasos: [{ sec: [['a0', 0.5, null, T2], ['n0', 0.5, 'entra', T2], ['h0', 0.45, 'lineal', T2], ['a', 0.3, 'sale', T2]], desde: 'a0' },
                { sec: [['dq', 0.15, 'entra', T2.concat(['md'])], ['dp', 0.2, 'sale', T2.concat(['md'])], ['k', 0.8, 'suave', KD], ['g', 0.8, 'suave', KD], ['b', 1.3, 'suave', KD]], desde: 'a' },
                { sec: [['b', 1.2, null, KD], ['k', 0.7, 'suave', KD], ['dp', 0.45, 'suave', KD], ['dq', 0.12, 'entra', T2.concat(['md'])], ['a', 0.13, 'sale', T2.concat(['md'])],
                        ['n', 0.3, 'entra', T2.concat(['md'])], ['h', 0.25, 'lineal', T2.concat(['md'])], ['ab', 0.2, 'sale', T2.concat(['md'])], ['h2', 0.2, 'entra', T2.concat(['mi'])], ['n2', 0.25, 'lineal', T2.concat(['mi'])], ['a2', 0.3, 'sale', T2.concat(['mi'])],
                        ['dq2', 0.15, 'entra', T2.concat(['mi'])], ['dp2', 0.2, 'sale', T2.concat(['mi'])], ['k2', 0.7, 'suave', KI], ['g2', 0.6, 'suave', KI], ['b2', 0.9, 'suave', KI]], desde: 'b' }]
      };
    })();

    /* ══════════════════════════════ LOS SALTOS ══════════════════════════════
       En el aire no hay nada clavado. Se despega por las puntas (el talón, arriba) y se cae primero sobre la parte delantera del pie, que
       rueda hasta el talón mientras la cadera baja para amortiguar */
    var NADA = [];

    /* con las rodillas al pecho: de pie, con los pies a la anchura de la cadera; la cadera va atrás y baja hasta que los talones están a
       punto de despegarse; salta con fuerza y, en el aire, lleva las rodillas hacia el pecho y los talones hacia los glúteos; cae suave
       sobre la mitad del pie, rueda hacia los talones y baja la cadera para amortiguar, sin bloquear las rodillas */
    COREO['salto-rodillas-pecho'] = (function () {
      var sp = function (t) { return { suelo: [10, 0], abre: 5, talon: t || 0, polo: [0.15, 0.1, 1] }; }, q = deTalon(46), q2 = deTalon(20);
      var a = { p: sp(), b: aLosLados(12), m: SUELTA };
      var b = { pel: [0, 57, -20], giro: [0, 36, 0], cab: [-30, 0, 0], p: sp(), b: { e: -36, z: -8, g: 0, c: 14 }, m: SUELTA }; /* por detrás de verdad (e negativo), con el codo doblando hacia delante: 70-coreografias.js, sentadilla-salto */
      /* a medio empuje: el pie rueda sobre su parte delantera (con el tobillo clavado de un tirón, la zapatilla cortaría el suelo) */
      var m = { pel: [0, 76, -4], giro: [0, 18, 0], cab: [-14, 0, 0], p: sp(20), b: { e: 12, z: 8, g: 0, c: 22 }, m: SUELTA };
      var d = { pel: [0, PIE + q[1] - 0.6, q[0]], giro: [0, 4, 0], p: sp(46), b: { e: 72, z: 8, g: 0, c: 26 }, m: SUELTA };
      var s = { pel: [0, PIE + 38, 2], giro: [0, 14, 0], col: [10, 0, 0], cab: [-12, 0, 0], p: { e: 104, z: 4, c: 126 }, t: { tob: 18 }, b: { e: 62, z: 12, g: 0, c: 46 }, m: SUELTA };
      var c = { pel: [0, PIE + q2[1] - 6, q2[0] - 2], giro: [0, 12, 0], cab: [-10, 0, 0], p: sp(20), b: { e: 44, z: 14, g: 0, c: 34 }, m: SUELTA };
      var l = { pel: [0, 60, -17], giro: [0, 32, 0], cab: [-27, 0, 0], p: sp(), b: { e: 48, z: 10, g: 0, c: 30 }, m: SUELTA };
      return {
        vista: [52, 90], rastro: 'pel', esfuerzo: [2], zoom: 0.94,
        posturas: { a: a, b: b, m: m, d: d, s: s, c: c, l: l }, encuadra: ['s'],
        rep: [['b', 0.8, 'suave', T2], ['b', 0.12, null, T2], ['m', 0.15, 'entra', T2], ['d', 0.09, 'lineal', T2], ['s', 0.3, 'sale', NADA], ['c', 0.3, 'entra', NADA], ['l', 0.26, 'sale', T2], ['a', 0.8, 'suave', T2], ['a', 0.5, null, T2]],
        pasos: [{ sec: [['a', 0.6, null, T2], ['b', 1.0, 'suave', T2]], desde: 'a' }, { rep: 0.8 }, 'rep']
      };
    })();

    /* el salto horizontal: con los pies a la anchura de la cadera, la cadera atrás y las rodillas dobladas, con los brazos estirados hacia
       atrás; se impulsa hacia delante y arriba con los pies uno al lado del otro, balanceando los brazos por encima de la cabeza; mira al punto
       de llegada y cae suave, primero sobre la parte delantera de los pies y luego sobre el talón, doblando cadera y rodillas. Para repetirlo
       se da la vuelta donde ha caído y salta de regreso (las mismas posturas, giradas) */
    COREO['salto-horizontal'] = (function () {
      var L = 112, P = {}, pies = function (z, t) { return { suelo: [10, z], abre: 4, talon: t || 0, polo: [0.12, 0.1, 1] }; }, q = deTalon(48), q2 = deTalon(26);
      P.a = { pel: [0, PIE, 0], p: pies(0), b: aLosLados(12), m: SUELTA };
      P.b = { pel: [0, 58, -19], giro: [0, 40, 0], cab: [-34, 0, 0], p: pies(0), b: { e: -46, z: -6, g: 0, c: 5 }, m: SUELTA }; /* por detrás de verdad (e negativo), con el codo doblando hacia delante: 70-coreografias.js, sentadilla-salto */
      /* a medio empuje: el pie rueda sobre su parte delantera y los brazos ya pasan por delante */
      P.m = { pel: [0, 74, 2], giro: [0, 33, 0], cab: [-27, 0, 0], p: pies(0, 22), b: { e: 6, z: 8, g: 0, c: 10 }, m: SUELTA };
      P.d = { pel: [0, PIE + q[1] - 6, q[0] + 13], giro: [0, 24, 0], cab: [-18, 0, 0], p: pies(0, 48), b: { e: 62, z: 6, g: 0, c: 10 }, m: SUELTA };
      P.v = { pel: [0, PIE + 13, L * 0.5], giro: [0, 16, 0], col: [6, 0, 0], cab: [-10, 0, 0], p: { e: 46, z: 3, c: 78 }, t: { tob: 12 }, b: { e: 132, z: 6, g: 0, c: 12 }, m: SUELTA };
      P.w = { pel: [0, PIE - 3, L - 26], giro: [0, 26, 0], col: [8, 0, 0], cab: [-20, 0, 0], p: { e: 62, z: 3, c: 42 }, t: { tob: 10 }, b: { e: 152, z: 8, g: 0, c: 14 }, m: SUELTA };
      P.c = { pel: [0, 74, L - 15 + q2[0]], giro: [0, 26, 0], cab: [-21, 0, 0], p: pies(L, 26), b: { e: 110, z: 8, g: 0, c: 18 }, m: SUELTA };
      P.l = { pel: [0, 55, L - 20], giro: [0, 40, 0], col: [3, 0, 0], cab: [-33, 0, 0], p: pies(L), b: { e: 70, z: 8, g: 0, c: 22 }, m: SUELTA };
      P.e = { pel: [0, PIE, L], p: pies(L), b: aLosLados(12), m: SUELTA };
      /* la misma postura, vista desde el otro extremo: girada media vuelta sobre el centro del tramo */
      var vuelta = function (Q) {
        var R = {}, k; for (k in Q) R[k] = Q[k];
        R.pel = [-Q.pel[0], Q.pel[1], L - Q.pel[2]]; R.giro = [180, (Q.giro || [0, 0, 0])[1], 0];
        ['pi', 'pd'].forEach(function (n) { var x = (Q.p || {}).suelo ? Q.p : null; if (!x) return; var sg = n === 'pi' ? 1 : -1; R[n] = { suelo: [-sg * x.suelo[0], L - x.suelo[1]], abre: x.abre, talon: x.talon, polo: [-sg * x.polo[0], x.polo[1], -x.polo[2]] }; });
        if ((Q.p || {}).suelo) delete R.p;
        return R;
      };
      ['a', 'b', 'm', 'd', 'v', 'w', 'c', 'l', 'e'].forEach(function (n) { P[n + 'r'] = vuelta(P[n]); });
      /* la media vuelta, en tres giros de 60° con los pies planos (de «de» grados a «de» + 180, alrededor de z = zc) */
      var gira = function (pre, de, zc) {
        [60, 120].forEach(function (g, i) {
          var t = (de + g) * RAD, c = Math.cos(t), sn = Math.sin(t);
          P[pre + (i + 1)] = { pel: [0, PIE - 0.5, zc], giro: [de + g, 0, 0], pi: { suelo: [10 * c, zc - 10 * sn], abre: 4 }, pd: { suelo: [-10 * c, zc + 10 * sn], abre: 4 }, b: aLosLados(12), m: SUELTA };
        });
      };
      gira('g', 0, L); gira('h', 180, 0);
      P.a360 = sobre(P.a, { giro: [360, 0, 0] });
      var salto = function (r) { return [['b' + r, 0.7, 'suave', T2], ['b' + r, 0.1, null, T2], ['m' + r, 0.16, 'entra', T2], ['d' + r, 0.1, 'lineal', T2], ['v' + r, 0.24, 'sale', NADA], ['w' + r, 0.2, 'lineal', NADA], ['c' + r, 0.13, 'entra', NADA], ['l' + r, 0.3, 'sale', T2], ['e' + r, 0.8, 'suave', T2], ['e' + r, 0.35, null, T2]]; };
      var media = function (pre, llega) { return [[pre + '1', 0.5, 'entra', T2], [pre + '2', 0.3, 'lineal', T2], [llega, 0.5, 'sale', T2], [llega, 0.3, null, T2]]; };
      return {
        vista: [[84, 10], [118, 14]], rastro: 'pel', esfuerzo: [2, 15], zoom: 0.96,
        posturas: P, inicio: 'a', encuadra: ['a', 'e', 'v'],
        rep: salto('').concat(media('g', 'ar'), salto('r'), media('h', 'a')),
        pasos: [{ sec: [['a', 0.6, null, T2], ['b', 1.0, 'suave', T2]], desde: 'a' }, { rep: 0.7 }, 'rep']
      };
    })();

    /* el salto al cajón (bajo: 30 cm), a unos 10 cm de él y con los pies a la anchura de la cadera: la cadera va atrás, baja hasta que los
       talones están a punto de despegarse y salta arriba y adelante impulsándose con los brazos; cae suave sobre el cajón con todo el pie, la
       cadera atrás y las rodillas algo dobladas; se pone de pie y baja andando: un pie hacia atrás y después el otro */
    COREO['salto-cajon'] = (function () {
      var H = 30, ZC = 28, ZA = ZC + 13, q = deTalon(46), P = {};
      var abajo = function (t) { return { suelo: [9, 0], abre: 4, talon: t || 0, polo: [0.12, 0.1, 1] }; }, arriba = { suelo: [9, ZA], abre: 4, alto: H, polo: [0.12, 0.1, 1] };
      P.a = { p: abajo(), b: aLosLados(12), m: SUELTA };
      P.b = { pel: [0, 57, -19], giro: [0, 37, 0], cab: [-31, 0, 0], p: abajo(), b: { e: -44, z: -6, g: 0, c: 8 }, m: SUELTA }; /* por detrás de verdad (e negativo), con el codo doblando hacia delante: 70-coreografias.js, sentadilla-salto */
      /* a medio empuje: el pie rueda sobre su parte delantera y los brazos ya pasan por delante */
      P.m = { pel: [0, 76, -2], giro: [0, 24, 0], cab: [-19, 0, 0], p: abajo(20), b: { e: 2, z: 8, g: 0, c: 14 }, m: SUELTA };
      P.d = { pel: [0, PIE + q[1] - 3, q[0] + 7], giro: [0, 14, 0], cab: [-10, 0, 0], p: abajo(46), b: { e: 54, z: 7, g: 0, c: 18 }, m: SUELTA };
      P.v = { pel: [0, PIE + H + 6, ZA - 16], giro: [0, 22, 0], col: [8, 0, 0], cab: [-16, 0, 0], p: { e: 84, z: 3, c: 104 }, t: { tob: 6 }, b: { e: 104, z: 8, g: 0, c: 26 }, m: SUELTA };
      P.l = { pel: [0, H + 63, ZA - 16], giro: [0, 32, 0], cab: [-26, 0, 0], p: arriba, b: { e: 72, z: 8, g: 0, c: 24 }, m: SUELTA };
      P.e = { pel: [0, H + PIE, ZA], p: arriba, b: aLosLados(12), m: SUELTA };
      /* a bajar andando: el pie izquierdo sale hacia atrás por encima del canto (x) y pisa el suelo (y); después baja el derecho (z) */
      P.x = { pel: [-2, H + PIE - 9, ZA - 6], giro: [0, 6, 0], pd: reflejo(arriba), pi: { a: [9, H + D.tobillo + 6, ZC - 12], polo: [0.1, 0.2, 1] }, ti: alAire(4, 0.1), b: aLosLados(14), m: SUELTA };
      P.y = { pel: [0, PIE - 3, 9], giro: [0, 8, 0], pi: abajo(), pd: reflejo(arriba), b: aLosLados(14), m: SUELTA };
      P.z = { pel: [2, PIE - 0.6, 2], pi: abajo(), pd: { a: [-9, H + D.tobillo + 6, ZC - 12], polo: [-0.1, 0.2, 1] }, td: alAire(-4, 0.1), b: aLosLados(13), m: SUELTA };
      return {
        vista: [[62, 14], [104, 12]], rastro: 'pel', esfuerzo: [2], zoom: 0.94,
        material: [['escalon', { med: [70, H, 50], en: [0, ZC + 25], madera: true }]],
        posturas: P, encuadra: ['e', 'v'],
        rep: [['b', 0.75, 'suave', T2], ['b', 0.1, null, T2], ['m', 0.15, 'entra', T2], ['d', 0.09, 'lineal', T2], ['v', 0.26, 'sale', NADA], ['l', 0.24, 'entra', NADA], ['l', 0.2, null, T2], ['e', 0.8, 'suave', T2], ['e', 0.3, null, T2],
              ['x', 0.5, 'entra', T2], ['y', 0.6, 'sale', T2], ['z', 0.5, 'entra', T2], ['a', 0.45, 'sale', T2], ['a', 0.45, null, T2]],
        pasos: ['a', 'rep', 'rep']
      };
    })();

    /* el impulso alterno desde el escalón (20 cm): de cara a él, el pie derecho encima y el izquierdo en el suelo, con el tronco algo
       inclinado hacia delante; empuja con fuerza con el pie de arriba, estirando tobillo, rodilla y cadera, y se ayuda con los brazos; en el
       aire cambia de pierna y cae suave con el pie izquierdo arriba y el derecho en el suelo, con la cadera atrás; y para entre saltos.
       La cadera casi no viaja: sube y baja sobre el canto del escalón, y son las piernas las que se cruzan en el aire. Los brazos, como al
       correr: delante, el contrario a la pierna de arriba */
    COREO['impulso-alterno-escalon'] = (function () {
      var H = 20, ZE = 27, ZS = -12;
      var arriba = function (t) { return { suelo: [-10, ZE], abre: 4, alto: H, talon: t || 0, polo: [-0.08, 0.2, 1] }; }, abajo = function (t) { return { suelo: [10, ZS], abre: 4, talon: t || 0, polo: [0.08, 0.2, 1] }; };
      /* el brazo izquierdo, como al correr: de atrás (f = −1: el codo detrás del cuerpo y la mano junto a la cadera, algo por detrás) a delante
         (f = 1: el codo delante y la mano a la altura del pecho), con el codo siempre doblado */
      var corre = function (f) {
        var t = (2.5 + 37.5 * f) * RAD, c = t + (75 + 15 * f) * RAD, x = 19 - 5 * f;
        return { a: [x + 2, D.hombroY - D.brazo * Math.cos(t) - D.antebrazo * Math.cos(c), D.brazo * Math.sin(t) + D.antebrazo * Math.sin(c)], en: 'torax', polo: [0.3, -0.2, -1] };
      };
      var brazos = function (i, d) { return { bi: corre(i), bd: reflejo(corre(d)), m: SUELTA }; };
      /* el derecho arriba: esperando (e), cargado (c: la cadera atrás y abajo), a medio empuje (m: el pie de arriba rueda sobre su parte
         delantera y el de abajo acaba de dejar el suelo) y al final del empuje (d: de puntillas sobre el escalón, con la pierna estirada y
         la otra rodilla subiendo) */
      var e = sobre({ pel: [-1, 82, 6], giro: [0, 16, 0], cab: [-12, 0, 0], pd: arriba(), pi: abajo() }, brazos(0.8, -0.8));
      var c = sobre({ pel: [-1, 76, 5], giro: [0, 27, 0], cab: [-21, 0, 0], pd: arriba(), pi: abajo(20) }, brazos(1, -1));
      var m = sobre({ pel: [-2, 93, 11], giro: [0, 18, 0], cab: [-13, 0, 0], pd: arriba(20), pi: { a: [9, 21, ZS + 5], polo: [0.1, 0.2, 1] }, ti: alAire(4, 0.72) }, brazos(0.1, 0));
      var d = sobre({ pel: [-2, 108, 16], giro: [0, 9, 0], cab: [-6, 0, 0], pd: arriba(44), pi: { e: 56, z: 0, c: 84 }, ti: { tob: 6 } }, brazos(-1, 1.25));
      /* en el aire, a medio cambiar: el pie izquierdo ya está sobre el escalón, bajando hacia él, y el derecho lo ha dejado y baja por detrás del canto */
      var v = sobre({ pel: [0, 116, 14], giro: [0, 11, 0], cab: [-8, 0, 0], pi: { a: [10, 46, ZE - 2], polo: [0.1, 0.2, 1] }, ti: alAire(4, 0.1), pd: { a: [-10, 42, 6], polo: [-0.1, 0.2, 1] }, td: alAire(-4, 0.5) }, brazos(-0.9, 1.1));
      /* al tocar (k2, con el izquierdo ya arriba): el pie de arriba, entero sobre el escalón, y el de abajo, por su parte delantera. Es la
         postura de espera del otro lado, más alta y con el talón de abajo levantado; de ahí baja a amortiguar (c2) */
      var k = sobre({ pel: [-1, 90, 9], giro: [0, 15, 0], cab: [-11, 0, 0], pd: arriba(), pi: abajo(38) }, brazos(0.85, -0.8));
      var P = { e: e, c: c, m: m, d: d, v: v, k: k };
      ['e', 'c', 'm', 'd', 'v', 'k'].forEach(function (n) { P[n + '2'] = refleja(P[n]); });
      var salto = function (r, o, ka) {
        return [['c' + r, 0.34, 'suave', T2], ['m' + r, 0.13, 'entra', ka], ['d' + r, 0.07, 'lineal', ka], ['v' + r, 0.15, 'sale', NADA], ['k' + o, 0.2, 'entra', NADA],
                ['c' + o, 0.22, 'sale', T2], ['e' + o, 0.5, 'suave', T2], ['e' + o, 0.75, null, T2]];
      };
      return {
        vista: [[-66, 12], [-112, 12]], rastro: 'pel', esfuerzo: [1, 7], zoom: 0.94,
        material: [['escalon', { med: [86, H, 40], en: [0, 38] }]],
        posturas: P, inicio: 'e', encuadra: ['d', 'v'],
        rep: salto('', '2', ['td']).concat(salto('2', '', ['ti'])),
        pasos: ['e', 'rep', 'rep', 'rep']
      };
    })();
  })();
