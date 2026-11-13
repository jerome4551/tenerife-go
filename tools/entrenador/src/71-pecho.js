  /* ───────────────────────── las coreografías: PECHO (bloque 2) ─────────────────────────
     Las mismas reglas que en 70-coreografias.js: cada una sale de los pasos verificados de su ficha y no añade técnica
     que la ficha no diga. Aquí van por familias (tumbado en un banco, las poleas, las flexiones…), con sus ayudas. */
  (function () {
    /* ── tumbado en un banco ──
       ang: 0, plano (como el press de banca con barra); 45, inclinado; −15, declinado (la cabeza más baja que la cadera).
       Inclinado o declinado, el banco va con rumbo 180: el respaldo sale del asiento hacia −Z, que es donde queda la cabeza. */
    var Z_BIS = 24;                         /* la bisagra del banco (largo 124, asiento 38, en el centro) */
    function banco(ang) { return ang ? ['banco', { rumbo: 180, largo: 124, respaldo: ang }] : ['banco', { largo: 124 }]; }
    function tumbado(ang, extra) {
      var P;
      if (!ang) P = { pel: [0, 55, 30], giro: [0, -90, 0], p: { suelo: [17, 68], abre: 8, polo: [0.2, 1, 0.3] } };
      else {
        /* la espalda, a 11,5 cm del respaldo; la cadera, a 11 del asiento */
        var a = ang * RAD, c = Math.cos(a), s = Math.sin(a), k = (11 - 11.5 * c) / s;
        P = { pel: [0, 55, Z_BIS + 11.5 * s - k * c], giro: [0, -(90 - ang), 0], p: { suelo: [18, 70], abre: 8, polo: [0.2, 1, 0.3] } };
      }
      return sobre(P, extra || {});
    }
    /* el brazo, dicho desde el hombro y en el mundo (dx hacia fuera, dy hacia arriba, dz hacia los pies), para cualquier inclinación
       del tronco: así «los brazos estirados sobre el pecho» son verticales aunque el banco esté inclinado. polo: hacia dónde va el codo */
    function brazo(ang, d, polo) {
      var a = ang * RAD, c = Math.cos(a), s = Math.sin(a);
      var loc = function (v) { return [v[0], v[1] * s - v[2] * c, v[1] * c + v[2] * s]; }, q = loc(d);
      return { a: [D.hombroX + q[0], D.hombroY + q[1], q[2]], en: 'torax', polo: loc(polo || [1, -1, 0.2]) };
    }

    /* la mano, tumbado y con el codo hacia fuera: con prono 0 la palma mira a los pies (el agarre de un press) y la mancuerna
       queda atravesada; con −90, las palmas se miran (agarre neutro) y la mancuerna queda a lo largo del cuerpo */
    var HACIA_PIES = { tipo: 'puno', prono: 0 }, NEUTRO = { tipo: 'puno', prono: -90 };

    /* ── los press con mancuernas ── */
    /* abajo: las mancuernas a los lados del pecho; arriba: los brazos estirados */
    function pressMancuernas(ang, o) {
      o = o || {};
      var abajo = brazo(ang, o.abajo || [10, 6, 9], o.codo || [1, -1, 0.2]), arriba = brazo(ang, o.arriba || [1.5, 50.4, 3], o.codo || [1, -1, 0.2]), m = o.m || HACIA_PIES;
      return {
        vista: o.vista || [30, 0], picado: o.picado == null ? 32 : o.picado, rastro: 'manos', esfuerzo: [0], clavos: ['ti', 'td'],
        material: [banco(ang), ['mancuernas']],
        posturas: { b: tumbado(ang, sobre(o.base || {}, { b: abajo, m: m })), a: tumbado(ang, sobre(o.base || {}, { b: arriba, m: m })) },
        inicio: 'b',
        rep: [['a', 1.2, 'empuje'], ['a', 0.3], ['b', 1.7, 'freno'], ['b', 0.45]],
        pasos: o.pasos || ['b', 'b', 'rep']
      };
    }
    COREO['press-banca-mancuernas'] = pressMancuernas(0, { pasos: ['b', 'b', 'rep', 'nota'] });
    COREO['press-inclinado-mancuernas'] = pressMancuernas(45, { abajo: [12, 3, 4], arriba: [1, 50.4, 2], vista: [52, 15], picado: 14 });
    /* con las palmas enfrentadas, los codos van más pegados */
    COREO['press-inclinado-mancuernas-agarre-neutro'] = pressMancuernas(45, { m: NEUTRO, abajo: [7, 1, 8], arriba: [0, 50.4, 2], codo: [0.45, -1, 0.3], vista: [20, 80], picado: 14 });
    /* declinado: los pies, arriba, en el asiento («la cabeza más baja que los pies») */
    var PIES_ARRIBA = { p: { suelo: [9, 50], alto: 44, abre: 4, polo: [0.1, 1, 0.2] } };
    COREO['press-declinado-mancuernas'] = (function () {
      var c = pressMancuernas(-15, { abajo: [9, 7, 10], codo: [0.6, -1, 0.3], vista: [98, 138], picado: 20, base: PIES_ARRIBA });
      /* su ficha las sube en el paso 2 («suba las mancuernas sobre el pecho») y la repetición empieza arriba: baja y sube */
      c.inicio = 'a'; c.encuadra = ['b']; c.esfuerzo = [2];
      c.rep = bajaSube('b', 'a', [1.7, 0.3, 1.2, 0.45]);
      c.pasos = ['b', { sec: [['a', 1.3, 'empuje']], desde: 'b' }, 'rep'];
      return c;
    })();
    /* a una mano: la otra descansa sobre el abdomen */
    var EN_ABDOMEN = { a: [-9, 9, 11.5], en: 'pelvis', polo: [-1, -0.2, -0.3] };
    COREO['press-mancuerna-un-brazo'] = (function () {
      var c = pressMancuernas(0, { base: { bd: EN_ABDOMEN, md: SUELTA } });
      c.posturas.b = tumbado(0, { bi: brazo(0, [10, 6, 9]), bd: EN_ABDOMEN, mi: HACIA_PIES, md: SUELTA });
      c.posturas.a = tumbado(0, { bi: brazo(0, [1.5, 50.4, 3]), bd: EN_ABDOMEN, mi: HACIA_PIES, md: SUELTA });
      c.posturas.r = tumbado(0, { bi: { a: [12, 7, 13], en: 'pelvis', polo: [1, -0.3, -0.4] }, bd: EN_ABDOMEN, mi: HACIA_PIES, md: SUELTA });
      c.material = [banco(0), ['mancuernas', { lado: 'i' }]]; c.rastro = 'mi'; c.encuadra = ['r'];
      c.pasos = ['r', { sec: [['b', 1.4, 'suave']], desde: 'r' }, 'rep'];
      return c;
    })();
    /* juntas: una contra otra, con las palmas enfrentadas, del pecho al techo */
    COREO['press-mancuernas-juntas'] = (function () {
      var abajo = brazo(0, [-5.8, 12, 14], [1, -0.6, 0.3]), arriba = brazo(0, [-9.4, 49.4, 6], [1, -0.6, 0.3]);
      return {
        vista: [30, 0], picado: 32, rastro: 'manos', esfuerzo: [2], clavos: ['ti', 'td'], material: [banco(0), ['mancuernas']],
        posturas: { b: tumbado(0, { b: abajo, m: NEUTRO }), a: tumbado(0, { b: arriba, m: NEUTRO }) },
        inicio: 'a', encuadra: ['b'],
        rep: bajaSube('b', 'a', [1.7, 0.3, 1.2, 0.45]),
        pasos: ['b', { sec: [['a', 1.3, 'empuje']], desde: 'b' }, 'rep']
      };
    })();
    /* en el suelo: se sienta, se tumba, y los brazos bajan hasta que su parte de atrás toca el suelo */
    COREO['press-suelo-mancuernas'] = (function () {
      var pies = { suelo: [12, 62], abre: 5, polo: [0.1, 1, 0.2] }, suelo = { pel: [0, 11.5, 20], giro: [0, -90, 0], p: pies };
      var abajo = brazo(0, [22.7, 17.5, 13.1], [1, -1, 0.5]), arriba = brazo(0, [3, 49.6, 5], [1, -1, 0.5]);
      return {
        vista: [[112, 30], [150, 34]], rastro: 'manos', esfuerzo: [0], clavos: ['ti', 'td'], material: [['mancuernas']],
        posturas: {
          s: { pel: [0, 11.5, 20], giro: [0, -6, 0], p: pies, b: { a: [15, 6, 13], en: 'pelvis', polo: [1, 0.2, -0.6] }, m: HACIA_PIES },
          b: sobre(suelo, { b: abajo, m: HACIA_PIES }), a: sobre(suelo, { b: arriba, m: HACIA_PIES })
        },
        inicio: 'b', encuadra: ['s'],
        rep: [['a', 1.2, 'empuje'], ['a', 0.3], ['b', 1.7, 'freno'], ['b', 0.45]],
        pasos: [{ sec: [['s', 0.9], ['b', 2.0, 'suave']], desde: 's' }, 'b', 'rep']
      };
    })();

    /* ── los press con barra, inclinado y declinado: la barra espera en su soporte ──
       (los ganchos del soporte salen 7 cm hacia +Z desde el poste, a «alto»: el agarre de «sop» tiene que caer encima, a z + 3,5) */
    function pressBarra(ang, o) {
      var base = o.base || {};
      var P = function (d, codo) { return tumbado(ang, sobre(base, { b: brazo(ang, d, codo || o.codo || [0.8, -1, 0.1]), m: EN_BARRA })); };
      return {
        vista: o.vista, picado: o.picado, rastro: 'manos', esfuerzo: [2], clavos: ['mi', 'md', 'ti', 'td'],
        material: [banco(ang), ['soporte', o.soporte], ['barra', { discos: 17 }]],
        posturas: { sop: P(o.sop), a: P(o.arriba), b: P(o.abajo) },
        inicio: 'a', encuadra: ['sop'],
        rep: bajaSube('b', 'a', [1.8, 0.25, 1.1, 0.5]),
        pasos: ['sop', { sec: [['a', 1.7, 'suave']], desde: 'sop' }, 'rep']
      };
    }
    COREO['press-inclinado-barra'] = pressBarra(45, { sop: [11, 44, -19], arriba: [11, 48.5, 9], abajo: [11, -1.3, 14], soporte: { z: -26.5, alto: 137, ancho: 52 }, vista: [28, 72], picado: 14 });
    COREO['press-declinado-barra'] = pressBarra(-15, { sop: [11, 45.5, -18], arriba: [11, 48.5, 4], abajo: [11, 11.3, 13.4], codo: [0.5, -1, 0.3], soporte: { z: -45.5, alto: 96.5, ancho: 52 }, vista: [[150, 30], [105, 16]], base: PIES_ARRIBA });

    /* ── las aperturas con mancuernas: los brazos, por ángulos respecto al tronco, así valen en cualquier banco ──
       arriba, verticales sobre el pecho (e = 90 + la inclinación del banco); abiertos, en cruz. El codo, un poco doblado y sin cambiar */
    function aperturas(ang, o) {
      o = o || {};
      /* arriba, las mancuernas quedan una junto a otra, sin pisarse (cierra: cuánto se cruzan los brazos hacia dentro) */
      var arriba = { e: 90 + ang, z: o.cierra == null ? (ang === 45 ? -4.5 : -3.25) : o.cierra, g: 90, c: 16 }, abierto = { e: 90, z: o.abre == null ? 86 : o.abre, g: 90, c: 16 }, base = o.base || {};
      return {
        vista: o.vista || [30, 0], picado: o.picado == null ? 32 : o.picado, rastro: 'manos', esfuerzo: [2], clavos: ['ti', 'td'], material: [banco(ang), ['mancuernas']],
        posturas: {
          r: tumbado(ang, sobre(base, { b: brazo(ang, [8, 5, 9], [0.6, -1, 0.3]), m: NEUTRO })),       /* tumbado, con las mancuernas junto al pecho */
          a: tumbado(ang, sobre(base, { b: arriba, m: NEUTRO })), b: tumbado(ang, sobre(base, { b: abierto, m: NEUTRO }))
        },
        encuadra: ['r'],
        rep: bajaSube('b', 'a', [1.9, 0.3, 1.4, 0.45]),
        pasos: ['r', { sec: [['a', 1.4, 'suave']], desde: 'r' }, 'rep']
      };
    }
    COREO['aperturas-mancuernas'] = aperturas(0);
    COREO['aperturas-inclinadas-mancuernas'] = aperturas(45, { vista: [52, 15], picado: 14 });
    COREO['aperturas-declinadas-mancuernas'] = aperturas(-15, { vista: [140, [100, 14]], picado: 20, base: { p: { suelo: [22, 52], abre: 10, polo: [0.4, 1, 0.3] } } });
    /* a una mano: la libre se sujeta al banco; empieza abierto y sube en arco al centro del pecho */
    COREO['apertura-mancuerna-un-brazo'] = (function () {
      var sujeta = { a: [-17.5, 43, 16], polo: [-1, -0.4, -0.6] }, mano = { tipo: 'puno', prono: 0 };
      return {
        vista: [30, 0], picado: 32, rastro: 'mi', esfuerzo: [0], clavos: ['ti', 'td'], material: [banco(0), ['mancuernas', { lado: 'i' }]],
        posturas: {
          b: tumbado(0, { bi: { e: 90, z: 86, g: 90, c: 16 }, bd: sujeta, mi: NEUTRO, md: mano }),
          a: tumbado(0, { bi: { e: 90, z: -10.5, g: 90, c: 16 }, bd: sujeta, mi: NEUTRO, md: mano })
        },
        inicio: 'b',
        rep: [['a', 1.4, 'empuje'], ['a', 0.3], ['b', 1.9, 'freno'], ['b', 0.45]],
        pasos: ['b', 'rep', { rep: 1.7 }]
      };
    })();

    /* ── los pullover: tumbado, la carga baja en arco por detrás de la cabeza y vuelve sobre el pecho ── */
    COREO['pullover-mancuerna'] = {
      vista: [82, 142], picado: 14, rastro: 'manos', esfuerzo: [2], clavos: ['ti', 'td'],
      material: [banco(0), ['mancuernas', { lado: 'i', dos: true }]],       /* una, entre las dos manos, en línea con los antebrazos */
      posturas: {
        a: tumbado(0, { b: { a: [4, 102.6, -8], polo: [1, -0.3, 0.6] }, m: NEUTRO }),       /* los codos, casi estirados (unos 20°), y así todo el arco */
        b: tumbado(0, { b: { a: [5, 52, -61.6], polo: [1, 0.5, 0.3] }, m: NEUTRO })
      },
      rep: [['b', 1.9, 'freno'], ['b', 0.3], ['a', 1.5, 'empuje'], ['a', 0.4]],
      pasos: ['a', 'rep', { rep: 2.2 }]
    };
    /* con barra: la cabeza, algo por fuera del banco; las manos, a unos 35 cm una de otra */
    COREO['pullover-barra-brazos-flexionados'] = (function () {
      var t = { pel: [0, 55, 12], giro: [0, -90, 0], p: { suelo: [17, 50], abre: 8, polo: [0.2, 1, 0.3] }, m: PRONO };
      return {
        vista: [82, 142], picado: 14, rastro: 'manos', esfuerzo: [2], clavos: ['ti', 'td'],
        material: [banco(0), ['barra', { largo: 120, discos: 13 }]],
        posturas: {
          a: sobre(t, { b: { a: [17.5, 105.4, -28], polo: [-0.3, -0.3, 1] } }),
          b: sobre(t, { b: { a: [17.5, 41.4, -80.1], polo: [-0.3, 1, 0.3] } })
        },
        rep: [['b', 2.0, 'freno'], ['b', 0.3], ['a', 1.6, 'empuje'], ['a', 0.4]],
        pasos: ['a', 'a', 'rep']
      };
    })();

    /* ── las poleas ── */
    /* dos columnas, una a cada lado, con la polea mirando al centro: la de su izquierda va a su mano izquierda */
    function dosPoleas(alto, z, enc) { var x = 105; return [['polea', { en: [x, z || 0], rumbo: 90, alto: alto, a: 'i', encuadre: enc }], ['polea', { en: [-x, z || 0], rumbo: -90, alto: alto, a: 'd', encuadre: enc }]]; }
    /* de pie entre las dos: de brazos abiertos a las manos juntas por delante. Los brazos, por ángulos; el codo, un poco doblado */
    function cruce(alto, abierto, juntas, o) {
      o = o || {};
      var pies = o.pies || {}, m = { tipo: 'puno', prono: o.prono == null ? 0 : o.prono };
      return {
        vista: o.vista || [22, [-52, 26]], picado: 12, rastro: 'manos', esfuerzo: [0, 1], clavos: ['ti', 'td'], material: dosPoleas(alto, 0),
        posturas: { a: sobre(pies, { b: abierto, m: m }), b: sobre(pies, { b: juntas, m: m }) },
        rep: [['b', 1.3, 'empuje'], ['b', 0.5], ['a', 1.8, 'freno'], ['a', 0.4]],
        pasos: o.pasos || ['a', 'a', 'rep']
      };
    }
    /* a la altura de los hombros: primero da un paso al frente, con un pie adelantado */
    COREO['cruce-poleas'] = (function () {
      var abierto = { e: 86, z: 100, g: 90, c: 20 }, juntas = { e: 80, z: -1.5, g: 90, c: 24 }, m = { tipo: 'puno', prono: 0 };
      var paso = { pel: [0, 85, 15], pi: { suelo: [10, 36], abre: 4 }, pd: { suelo: [-10, 0], abre: 10 } };
      var c = cruce(140, abierto, juntas, { pies: paso });
      c.posturas.a0 = { pd: { suelo: [-10, 0], abre: 10 }, pi: { suelo: [10, 0], abre: 10 }, b: abierto, m: m };
      c.encuadra = ['a0'];
      c.pasos = ['a0', { sec: [['a', 1.1, 'suave', ['td']]], desde: 'a0' }, 'rep'];
      return c;
    })();
    /* de abajo arriba: las poleas, abajo; los brazos, abajo y algo por detrás; suben y se juntan ante la parte alta del pecho */
    COREO['cruce-poleas-bajo-alto'] = cruce(22, { e: 24, z: 122, g: 90, c: 14 }, { e: 84, z: -0.5, g: 90, c: 26 },
      { pies: { pel: [0, 83, 0], p: { suelo: [17, 0], abre: 8 } } });
    /* de arriba abajo: las poleas, en alto; los brazos, en Y; bajan en arco y se juntan ante la parte baja del pecho */
    COREO['cruce-poleas-alto-bajo'] = cruce(204, { e: 128, z: 92, g: 90, c: 18 }, { e: 72, z: -1.5, g: 90, c: 24 }, { pasos: ['a', 'rep', { rep: 2.0 }] });
    /* a una mano, de espaldas a la columna: del lado del pecho, al frente */
    COREO['press-pecho-polea-un-brazo'] = (function () {
      var base = { pel: [0, 83, 0], p: { suelo: [10, 0], abre: 6 }, mi: { tipo: 'puno', prono: 90 }, md: SUELTA };
      return {
        vista: [78, 28], rastro: 'mi', esfuerzo: [0], clavos: ['ti', 'td'],
        material: [['polea', { en: [34, -78], rumbo: 180, alto: 127, a: 'i' }]],       /* el cable pasa por fuera del brazo */
        posturas: {
          a: sobre(base, { bi: { a: [25, 119, 8], polo: [0.7, -0.3, -1] } }),
          b: sobre(base, { bi: { a: [21, 124, 49], polo: [0.7, -0.6, -0.4] } })
        },
        rep: [['b', 1.1, 'empuje'], ['b', 0.3], ['a', 1.6, 'freno'], ['a', 0.4]],
        pasos: ['a', 'a', 'rep']
      };
    })();
    /* las aperturas en polea, tumbado en un banco entre las dos columnas: como las de mancuernas, pero empieza abierto */
    function aperturasPolea(ang, zPolea, o) {
      o = o || {};
      var c = aperturas(ang, o);
      c.material = [banco(ang)].concat(dosPoleas(o.alto || 30, zPolea, o.encuadre || 150));
      c.inicio = 'b'; delete c.posturas.r; c.encuadra = ['a'];
      c.rep = [['a', 1.4, 'empuje'], ['a', 0.5], ['b', 1.9, 'freno'], ['b', 0.4]];
      c.esfuerzo = [0, 1];
      c.pasos = ['b', 'b', 'rep'];
      return c;
    }
    COREO['aperturas-polea-banco-plano'] = aperturasPolea(0, -13.5, { cierra: -6.5, abre: 103 });       /* las manos se juntan (más cerca que dos mancuernas) y bajan hasta la altura del banco */
    COREO['aperturas-polea-banco-inclinado'] = aperturasPolea(45, -1.5, { vista: [40, 8], picado: 16, encuadre: 175, cierra: -8 });
    /* sentado, con el respaldo vertical y las poleas a la altura del pecho: los brazos se juntan por delante */
    COREO['aperturas-polea-sentado'] = (function () {
      var sentado = function (b) { return tumbado(85, { p: { suelo: [12, 78], abre: 6, polo: [0.1, 0.3, 1] }, b: b, m: { tipo: 'puno', prono: -90 } }); };       /* las palmas, enfrentadas */
      return {
        vista: [24, [-52, 26]], picado: 12, rastro: 'manos', esfuerzo: [0, 1], clavos: ['ti', 'td'],
        material: [banco(85)].concat(dosPoleas(96, 36)),
        posturas: { a: sentado({ e: 84, z: 92, g: 90, c: 20 }), b: sentado({ e: 82, z: -1.5, g: 90, c: 24 }) },
        rep: [['b', 1.3, 'empuje'], ['b', 0.5], ['a', 1.8, 'freno'], ['a', 0.4]],
        pasos: ['a', 'a', 'rep']
      };
    })();

    /* ── las flexiones ──
       plancha(ang, alto): el cuerpo recto, sobre las puntas de los pies (que pisan a «alto» del suelo), a «ang» grados del suelo */
    function plancha(ang, alto, extra) {
      var c = tabla(ang, extra);
      if (alto) c.pel = [c.pel[0], c.pel[1] + alto, c.pel[2]];
      return c;
    }
    var T4 = ['mi', 'md', 'ti', 'td'];
    /* en la pared: de pie, a un brazo de distancia; el cuerpo, recto, gira sobre los pies */
    COREO['flexion-pared'] = (function () {
      var enPared = { a: [19, 120, 49.5] }, mp = { tipo: 'abierta', prono: 90, mun: -68 };
      var recto = function (fi, polo) { return { pel: [0, 8 + 78 * Math.cos(fi * RAD), 78 * Math.sin(fi * RAD)], giro: [0, fi, 0], p: { suelo: [10, 0], abre: 4 }, b: { a: enPared.a, polo: polo }, m: mp }; };
      return {
        vista: [86, 146], rastro: 'pecho', esfuerzo: [2], clavos: T4,
        material: [['pared', { z: 58, normal: [0, 0, -1], ancho: 130 }]],
        posturas: { a: recto(0.5, [0.3, -1, -0.3]), b: recto(15, [0.25, -1, -0.6]) },
        rep: bajaSube('b', 'a'),
        pasos: ['a', 'rep', { rep: 1.9 }]
      };
    })();
    /* inclinada: las manos, en un banco */
    COREO['flexion-inclinada'] = (function () {
      var manos = { a: [25, 49, 18.5], polo: [0.7, 0.2, -1] };
      return {
        vista: [80, 36], picado: 12, rastro: 'pecho', esfuerzo: [2], clavos: T4,
        material: [['banco', { rumbo: 90, en: [0, 23], largo: 110 }]],
        posturas: { a: plancha(40, 0, { b: manos }), b: plancha(22, 0, { b: manos, cab: [-20, 0, 0] }) },
        rep: bajaSube('b', 'a', [1.6, 0.2, 1.1, 0.5]),
        pasos: ['a', 'rep', { rep: 1.8 }]
      };
    })();
    /* declinada: los pies, en un banco */
    COREO['flexion-declinada'] = (function () {
      var manos = { a: [24, 5, 21.5], polo: [0.55, 0.25, -1] };
      return {
        vista: [80, [34, 30]], picado: 12, rastro: 'pecho', esfuerzo: [2], clavos: T4,
        material: [['banco', { rumbo: 90, en: [0, -100], largo: 110 }]],
        posturas: { a: plancha(-1.2, 44, { b: manos }), b: plancha(-17, 44, { b: manos, cab: [-26, 0, 0] }) },
        rep: bajaSube('b', 'a', [1.7, 0.2, 1.1, 0.5]),
        pasos: ['a', 'a', 'rep']
      };
    })();
    /* de rodillas: primero, a cuatro patas con la cadera alta; el peso va hacia delante hasta la línea recta de las rodillas a la cabeza */
    COREO['flexion-rodillas'] = (function () {
      var manos = { a: [19, 5, 13], polo: [0.55, 0.25, -1] }, m = { tipo: 'abierta', prono: 90, mun: -72 };
      var piernas = { a: [10, 7, -98], polo: [0, -1, 0.3] }, pies = { punta: [0, -0.1, -1], arriba: [0, -1, 0.1] };
      /* la línea de las rodillas (en z = −60, a 7 del suelo) a los hombros, a «ang» grados del suelo */
      var linea = function (ang, cab) { return { pel: [0, 7 + 40 * Math.sin(ang * RAD), -60 + 40 * Math.cos(ang * RAD)], giro: [0, 90 - ang, 0], cab: [cab, 0, 0], p: piernas, t: pies, b: manos, m: m }; };
      return {
        vista: [78, [32, 34]], picado: 16, rastro: 'pecho', esfuerzo: [2], clavos: T4,
        posturas: {
          c: { pel: [0, 39.8, -37.1], giro: [0, 69.4, 0], cab: [-14, 0, 0], p: piernas, t: pies, b: manos, m: m },
          a: linea(35, -16), b: linea(8, -24)
        },
        inicio: 'a', encuadra: ['c'],
        rep: bajaSube('b', 'a', [1.6, 0.2, 1.1, 0.5]),
        pasos: ['c', { sec: [['a', 1.5, 'suave']], desde: 'c' }, 'rep']
      };
    })();
    /* con las manos abiertas y los pies juntos */
    COREO['flexion-abierta'] = (function () {
      var manos = { a: [34, 5, 14], polo: [1, 0.2, -0.7] }, juntos = { e: 7, z: -90, c: 0 };
      return {
        vista: [78, [20, 34]], picado: 16, rastro: 'pecho', esfuerzo: [2], clavos: T4,
        posturas: { a: plancha(19, 0, { b: manos, p: juntos }), b: plancha(1.5, 0, { b: manos, p: juntos, cab: [-24, 0, 0] }) },
        rep: bajaSube('b', 'a', [1.6, 0.2, 1.1, 0.5]),
        pasos: ['a', 'a', 'rep']
      };
    })();
    /* con las manos escalonadas: una se adelanta unos centímetros y la otra se va un poco hacia fuera */
    COREO['flexion-manos-escalonadas'] = (function () {
      var iguales = { a: [24, 5, 13.5], polo: [0.55, 0.25, -1] };
      var desiguales = { bi: { a: [24, 5, 23], polo: [0.55, 0.25, -1] }, bd: { a: [-32, 5, 13.5], polo: [-0.8, 0.25, -1] } };
      return {
        vista: [[30, 34], 78], picado: 16, rastro: 'pecho', esfuerzo: [2], clavos: T4,
        posturas: { a0: plancha(19.4, 0, { b: iguales }), a: plancha(19.2, 0, desiguales), b: plancha(1.5, 0, sobre(desiguales, { cab: [-24, 0, 0] })) },
        inicio: 'a', encuadra: ['a0'],
        rep: bajaSube('b', 'a', [1.7, 0.2, 1.1, 0.5]),
        pasos: ['a0', { sec: [['a0', 0.5], ['a', 1.2, 'suave', ['ti', 'td']]], desde: 'a0' }, 'rep']
      };
    })();
    /* arquero: al bajar, el peso va a un brazo, que se dobla; el otro queda casi estirado hacia su lado. Y alterna */
    COREO['flexion-arquero'] = (function () {
      var manos = { a: [40, 5, 14], polo: [1, 0.2, -0.6] };
      var lado = plancha(4.5, 0, { b: manos, cab: [-22, 0, 0] });
      /* el pecho se va 24 cm hacia la mano que carga, y la cadera, lo menos posible (la ficha: «sin girar ni desplazar la cadera»):
         el cuerpo gira solo 6° sobre los pies (la cadera se va 8 cm) y el resto lo pone el tronco, que se inclina de lado; no rota */
      lado.pel = [8.2, lado.pel[1], lado.pel[2]]; lado.giro = [6, lado.giro[1], 0]; lado.col = [0, 24, 0];
      lado.bd = { a: [-40, 5, 14], polo: [-1, 0.6, -0.2] }; lado.bi = { a: [40, 5, 14], polo: [0.6, 0.3, -1] }; delete lado.b;
      return {
        vista: [[24, 34], 78], picado: 16, rastro: 'pecho', esfuerzo: [2, 6], clavos: T4,
        posturas: { a: plancha(18, 0, { b: manos }), b: lado, b2: refleja(lado) },
        rep: [['b', 1.5, 'freno'], ['b', 0.25], ['a', 1.1, 'empuje'], ['a', 0.3], ['b2', 1.5, 'freno'], ['b2', 0.25], ['a', 1.1, 'empuje'], ['a', 0.3]],
        pasos: ['a', 'rep', { rep: 1.75 }]
      };
    })();
    /* explosiva: baja despacio y sube lo más rápido que puede, sin despegar las manos */
    COREO['flexion-explosiva'] = (function () {
      var manos = { a: [19, 5, 13.3], polo: [0.55, 0.25, -1] };
      return {
        vista: [78, [32, 34]], picado: 16, rastro: 'pecho', esfuerzo: [0], clavos: T4,
        posturas: { a: plancha(20.2, 0, { b: manos }), b: plancha(1.0, 0, { b: manos, cab: [-24, 0, 0] }) },
        inicio: 'b', encuadra: ['a'],
        rep: [['a', 0.42, 'sale'], ['a', 0.55], ['b', 2.0, 'freno'], ['b', 0.3]],
        pasos: ['a', { sec: [['b', 2.2, 'freno']], desde: 'a' }, 'rep']
      };
    })();
    /* en paralelas bajas: el pecho pasa por debajo del nivel de las manos */
    COREO['flexion-deficit'] = (function () {
      var manos = { a: [24, 28, 12], polo: [0.2, 0.3, -1] }, m = { tipo: 'puno', prono: 0 };
      return {
        vista: [78, [30, 30]], picado: 14, rastro: 'pecho', esfuerzo: [2], clavos: T4,
        material: [['paralelas', { alto: 20, ancho: 24, largo: 36, z: 12 }]],
        posturas: { a: plancha(31.4, 0, { b: manos, m: m }), b: plancha(4.7, 0, { b: manos, m: m, cab: [-24, 0, 0] }) },
        rep: bajaSube('b', 'a', [1.8, 0.2, 1.2, 0.5]),
        pasos: ['a', 'rep', { rep: 2.0 }]
      };
    })();
    /* ── los fondos en paralelas: se sube a brazos estirados; inclinado hacia delante, baja doblando los codos ── */
    COREO['fondos-paralelas'] = (function () {
      var m = { tipo: 'puno', prono: 0 }, cuelgan = { e: 10, z: 0, c: 72 }, M2 = ['mi@0:27', 'md@0:-27'];
      var B = function (polo) { return { a: [27, 126, 2], polo: polo }; };
      return {
        vista: [68, 20], rastro: 'hombros', esfuerzo: [2], clavos: M2,
        material: [['paralelas', { alto: 118, ancho: 27, largo: 110, manos: 2 }]],
        posturas: {
          s: { b: B([0.2, 0.4, -1]), m: m },
          a: { pel: [0, 132.6, 0], p: cuelgan, t: { tob: 20 }, b: B([0.3, 0.1, -1]), m: m },
          b: { pel: [0, 111.7, -2.3], giro: [0, 22, 0], cab: [-16, 0, 0], p: cuelgan, t: { tob: 20 }, b: B([0.2, 0.4, -1]), m: m }
        },
        inicio: 'a', encuadra: ['s'],
        rep: bajaSube('b', 'a', [1.7, 0.25, 1.2, 0.5]),
        pasos: [{ sec: [['s', 1.7, null, M2.concat(['ti', 'td'])], ['a', 1.2, 'empuje', M2]], desde: 's' }, 'rep', { rep: 1.95 }]
      };
    })();

    /* ── los estiramientos ── */
    /* sentado, separado del respaldo: los hombros atrás y abajo, los brazos en cruz y el pecho adelante */
    COREO['estiramiento-pecho-sentado'] = (function () {
      var sentado = { pel: [0, 55, 46], p: { suelo: [11, 85], abre: 6, polo: [0.1, 0.3, 1] } };
      return {
        vista: [36, 104], isometrico: 'b', clavos: ['ti', 'td'], material: [banco(85)],
        posturas: {
          a: sobre(sentado, { b: { a: [11, 5, 26], en: 'pelvis', polo: [1, 0, -0.5] }, m: SUELTA }),
          b: sobre(sentado, { col: [-9, 0, 0], cab: [-5, 0, 0], hom: [-1, -2.6], b: { e: 86, z: 104, g: 90, c: 12 }, m: { tipo: 'abierta', prono: -90 } })
        },
        pasos: ['a', { sec: [['b', 1.7, 'suave']], desde: 'a' }, 'b']
      };
    })();
    /* en el marco de una puerta (sus dos jambas): el antebrazo, en vertical contra él; un paso adelante sin mover el brazo; y con el otro */
    COREO['estiramiento-pecho-marco-puerta'] = (function () {
      var apoyo = { a: [46, 153.5, 2], polo: [1, -0.4, 0] }, mano = { tipo: 'abierta', prono: 90 };
      var a = { pi: { suelo: [10, 0], abre: 6 }, pd: { suelo: [-10, 0], abre: 6 }, bi: apoyo, mi: mano, md: SUELTA };
      var b = { pel: [2, 85, 13], pi: { suelo: [10, 32], abre: 4 }, pd: { suelo: [-10, 0], abre: 6, talon: 14 }, bi: apoyo, mi: mano, md: SUELTA };
      return {
        vista: [-30, 158], isometrico: 'b', clavos: ['ti', 'td'],
        material: [['pared', { x: 47, z: 9, normal: [0, 0, -1], ancho: 14 }], ['pared', { x: -47, z: 9, normal: [0, 0, -1], ancho: 14 }]],
        posturas: { a: a, b: b, a2: refleja(a), b2: refleja(b) },
        encuadra: ['b', 'b2'],
        pasos: ['a', { sec: [['b', 1.4, 'suave', ['mi', 'td']]], desde: 'a' },
                { sec: [['b', 1.0, null, ['mi', 'ti', 'td']], ['a', 1.2, 'suave', ['mi', 'td']], ['a2', 1.1, 'suave', ['ti', 'td']], ['b2', 1.4, 'suave', ['md', 'ti']]], desde: 'b' }]
      };
    })();
    /* de lado junto a una pared, con la mano en ella y el brazo estirado a la altura del hombro: gira el cuerpo hacia el otro lado.
       Para cambiar de lado se da la vuelta: la pared queda a su derecha */
    COREO['estiramiento-pecho-pared'] = (function () {
      var punto = [68.5, 129, 0], mano = { tipo: 'abierta', prono: 0, mun: -70 };
      var vuelto = { pi: { suelo: [-10, 0], abre: 6 }, pd: { suelo: [10, 0], abre: 6 }, bd: { a: punto, polo: [0.3, -1, 0.4] }, md: mano, mi: SUELTA };
      return {
        vista: [-34, -150], isometrico: 'b', clavos: [],
        material: [['pared', { x: 77, z: 0, normal: [-1, 0, 0], ancho: 130 }]],
        posturas: {
          a: { bi: { a: punto, polo: [0.3, -1, -0.4] }, mi: mano, md: SUELTA },
          b: { pel: [6, 86, 2], giro: [-38, 0, 0], cab: [0, 10, 0], bi: { a: punto, polo: [0.3, -1, -0.4] }, mi: mano, md: SUELTA },
          a2: sobre(vuelto, { giro: [180, 0, 0] }),
          b2: sobre(vuelto, { pel: [6, 86, -2], giro: [218, 0, 0], cab: [0, -10, 0] })
        },
        encuadra: ['b', 'b2'],
        pasos: ['a', { sec: [['b', 1.7, 'suave', ['mi']]], desde: 'a' },
                { sec: [['b', 1.0, null, ['mi']], ['a', 1.3, 'suave', ['mi']], ['a2', 1.5, 'suave', []], ['b2', 1.6, 'suave', ['md']]], desde: 'b' }]
      };
    })();
  })();
