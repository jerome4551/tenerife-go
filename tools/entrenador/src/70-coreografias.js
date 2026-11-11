  /* ───────────────────────── las coreografías ─────────────────────────
     Una por ejercicio (la clave es el id de la ficha en datos/cuerpo/ejercicios.json). Cada una
     sale de los pasos verificados de su ficha y no añade técnica que la ficha no diga:
       vista      desde dónde se mira (rumbo de la cámara): la primera, y la de «Girar»
       material   lo que hay en escena
       posturas   las posturas clave (ver 10-esqueleto.js)
       rep        la repetición, en tramos: [a qué postura, segundos, curva, lo clavado en ese tramo]
       clavos     lo que no se mueve de su sitio (pies en el suelo, manos en la barra)
       esfuerzo   en qué tramos de la repetición aprieta
       rastro     qué punto deja estela
       pasos      qué se ve mientras se lee cada paso de la ficha: una postura, 'rep', una
                  secuencia que se toca una vez ({ sec: […] }) o 'nota' (un consejo: Jérôme lo dice de cerca)
     Las medidas van en centímetros; Jérôme mira hacia +Z. */
  var COREO = {};
  var PIE = D.pelvis;                 /* la altura de la cadera, de pie */
  var HOMBRO = PIE + 22 + D.hombroY;  /* la del hombro */
  /* los brazos a los lados (c, cuánto se dobla el codo) */
  function aLosLados(c, g) { return { e: 5, z: 90, g: g == null ? 90 : g, c: c == null ? 10 : c }; }
  var PUNO = { tipo: 'puno' }, PRONO = { tipo: 'puno', prono: 90 }, SUPINO = { tipo: 'puno', prono: -90 }, PALMA_ABAJO = { tipo: 'abierta', prono: 90 }, SUELTA = { tipo: 'suelta' };
  /* los tiempos de una repetición: baja con freno, pausa, sube con empuje, pausa (o al revés) */
  function bajaSube(b, a, t) { t = t || [1.6, 0.3, 1.2, 0.5]; return [[b, t[0], 'freno'], [b, t[1]], [a, t[2], 'empuje'], [a, t[3]]]; }
  function subeBaja(b, a, t) { t = t || [1.2, 0.3, 1.7, 0.45]; return [[b, t[0], 'empuje'], [b, t[1]], [a, t[2], 'freno'], [a, t[3]]]; }
  /* boca arriba en el suelo (la cabeza hacia −Z) y boca abajo sobre las puntas de los pies (la cabeza hacia +Z) */
  var SUPINO_SUELO = { pel: [0, 11.5, 20], giro: [0, -90, 0] };
  var PIES_PUNTA = { punta: [0, -0.94, 0.34], arriba: [0, 0.34, 0.94], flex: 70 };
  /* en tabla sobre las puntas de los pies (los tobillos en z = −100, a TOB_PUNTA del suelo: la bola del pie lo pisa y la zapatilla se dobla), con
     el cuerpo a «ang» grados del suelo */
  var TOB_PUNTA = 14;
  function tabla(ang, extra) {
    var s = Math.sin(ang * RAD), c = Math.cos(ang * RAD);
    return sobre({ pel: [0, TOB_PUNTA + 78 * s, -100 + 78 * c], giro: [0, 90 - ang, 0], cab: [-16, 0, 0], p: { e: 0, z: 0, c: 0 }, t: PIES_PUNTA, m: { tipo: 'abierta', prono: 90, mun: -72 } }, extra || {});
  }
  /* colgado de la barra de dominadas (a 225 cm) */
  var COLGADO = { p: { e: 6, z: 0, c: 16 }, t: { tob: 28 }, m: PRONO };

  /* ══════════ CUÁDRICEPS ══════════ */
  (function () {
    var pies = { suelo: [14, 0], abre: 14, polo: [0.32, 0.1, 1] };
    COREO['sentadilla-peso-corporal'] = {
      vista: [42, 90], rastro: 'pel', esfuerzo: [2], clavos: ['ti', 'td'],
      posturas: {
        a: { p: pies },
        b: { pel: [0, 47, -25], giro: [0, 40, 0], col: [3, 0, 0], cab: [-34, 0, 0], p: pies, b: { e: 62, z: 6, c: 14 }, m: SUELTA }
      },
      rep: bajaSube('b', 'a'),
      pasos: ['a', 'rep', 'rep', 'rep']
    };
    var pg = { suelo: [17, 0], abre: 12, polo: [0.3, 0.1, 1] }, copa = { a: [6, 14, 17], en: 'torax', polo: [0.75, -1, 0.1] };
    COREO['sentadilla-goblet'] = {
      vista: [40, 90], rastro: 'pel', esfuerzo: [2], clavos: ['ti', 'td'], material: [['mancuernas', { lado: 'i', dos: true, ejeDos: [0, 1, 0] }]],
      posturas: {
        a: { p: pg, b: copa, m: PUNO },
        b: { pel: [0, 36, -20], giro: [0, 28, 0], col: [6, 0, 0], cab: [-26, 0, 0], p: pg, b: copa, m: PUNO }
      },
      rep: bajaSube('b', 'a'),
      pasos: ['a', 'rep', 'rep']
    };
    /* con barra: la barra va pegada a la parte alta de la espalda; las manos, a la barra */
    var atras = -34, pb = { suelo: [22, atras], abre: 16, polo: [0.34, 0.1, 1] }, mb = { a: [34, 21, -9], en: 'torax', polo: [0.6, -1, -0.5] };
    COREO['sentadilla-trasera-barra'] = {
      vista: [62, 16], rastro: 'pel', esfuerzo: [2], clavos: ['ti', 'td', 'mi@1:34', 'md@1:-34'],
      material: [['soporte', { z: -13.5, alto: 128.5, ancho: 56 }], ['barra', { ancla: 'torax', en: [0, 23, -9.5] }]],
      posturas: {
        sop: { pel: [0, 82, 0], p: { suelo: [14, 0], abre: 8 }, b: mb, m: PRONO },
        arr: { pel: [0, PIE, 0], hom: [0, -1.5], p: { suelo: [14, 0], abre: 8 }, b: mb, m: PRONO },
        p1: { pel: [0, PIE - 1, atras / 2], hom: [0, -1.5], pi: { suelo: [14, 0], abre: 8 }, pd: { suelo: [-22, atras], abre: 16 }, b: mb, m: PRONO },
        a: { pel: [0, PIE - 1.5, atras], hom: [0, -1.5], p: pb, b: mb, m: PRONO },
        b: { pel: [0, 38, atras - 22], giro: [0, 42, 0], hom: [0, -1.5], col: [3, 0, 0], cab: [-36, 0, 0], p: pb, b: mb, m: PRONO }
      },
      inicio: 'a', encuadra: ['sop'],
      rep: bajaSube('b', 'a', [1.8, 0.3, 1.3, 0.5]),
      pasos: ['sop', { sec: [['arr', 0.9, 'suave', ['mi@1:34', 'md@1:-34']], ['p1', 0.7, 'suave', ['mi@1:34', 'md@1:-34', 'ti']], ['a', 0.7, 'suave', ['mi@1:34', 'md@1:-34', 'td']]], desde: 'sop' }, 'rep', { rep: 2.1 }]
    };
    /* el escalón: sube un pie, sube el otro; baja; y cambia de pierna */
    var arribaE = 20, zE = 36;
    var enSuelo = { suelo: [10, 0], abre: 5 }, enEsc = { suelo: [10, zE], abre: 5, alto: arribaE };
    var p1 = { pel: [0, PIE + 1, 9], giro: [0, 8, 0], pi: enEsc, pd: reflejo(enSuelo) };
    COREO['subida-escalon'] = {
      vista: [98, 34], rastro: 'pel', esfuerzo: [1, 7],
      material: [['escalon', { med: [86, arribaE, 40], en: [0, zE + 4] }]],
      posturas: { a: { p: enSuelo }, p1: p1, q1: refleja(p1), arr: { pel: [0, PIE + arribaE, zE], p: enEsc } },
      rep: [['p1', 0.6, 'suave', ['td']], ['arr', 1.0, 'empuje', ['ti']], ['arr', 0.3, null, ['ti', 'td']], ['p1', 1.1, 'freno', ['ti']], ['a', 0.6, 'suave', ['td']], ['a', 0.25, null, ['ti', 'td']],
            ['q1', 0.6, 'suave', ['ti']], ['arr', 1.0, 'empuje', ['td']], ['arr', 0.3, null, ['ti', 'td']], ['q1', 1.1, 'freno', ['td']], ['a', 0.6, 'suave', ['ti']], ['a', 0.25, null, ['ti', 'td']]],
      pasos: ['a', 'rep', 'rep']
    };
    /* contra la pared: la espalda resbala por ella */
    var cruz = { a: [-7, 11, 13.5], en: 'torax', polo: [1, -0.7, 0.3] };
    COREO['sentadilla-isometrica-pared'] = {
      vista: [66, 22], isometrico: 'c', material: [['pared', { z: -13.4, normal: [0, 0, 1], ancho: 150 }]],
      posturas: {
        a: { pel: [0, PIE - 0.5, -1], p: { suelo: [10, 8], abre: 4 } },
        b: { pel: [0, 46, -1], p: { suelo: [11, 39], abre: 4, polo: [0.1, 0.4, 1] } },
        c: { pel: [0, 46, -1], p: { suelo: [11, 39], abre: 4, polo: [0.1, 0.4, 1] }, b: cruz, m: SUELTA }
      },
      inicio: 'b', encuadra: ['a'],
      pasos: [{ sec: [['a', 0.5], ['b', 2.3, 'suave']], desde: 'a' }, 'b', { sec: [['c', 0.9, 'suave']], desde: 'b' }]
    };
    /* con salto: en el aire no hay nada clavado */
    var sp = { suelo: [10, 0], abre: 6 }, T2 = ['ti', 'td'];
    COREO['sentadilla-salto'] = {
      vista: [48, 90], rastro: 'pel', esfuerzo: [2],
      posturas: {
        a: { p: sp },
        b: { pel: [0, 56, -20], giro: [0, 34, 0], cab: [-28, 0, 0], p: sp, b: { e: 34, z: 176, g: 0, c: 22 }, m: SUELTA },
        s: { pel: [0, PIE + 26, 0], giro: [0, -2, 0], p: { e: 2, z: 0, c: 5 }, t: { tob: 46 }, b: { e: 150, z: 10, g: 0, c: 14 }, m: SUELTA },
        l: { pel: [0, 62, -15], giro: [0, 28, 0], cab: [-24, 0, 0], p: sp, b: { e: 40, z: 10, g: 0, c: 30 }, m: SUELTA }
      },
      rep: [['b', 0.75, 'suave', T2], ['b', 0.16, null, T2], ['s', 0.3, 'sale', []], ['l', 0.34, 'entra', []], ['a', 0.75, 'suave', T2], ['a', 0.5, null, T2]],
      pasos: [{ sec: [['b', 0.9, 'suave', T2]], desde: 'a' }, 'rep', 'rep']
    };
  })();

  /* ══════════ GLÚTEOS ══════════ */
  (function () {
    var pies = { suelo: [11, 62], abre: 4, polo: [0.1, 1, 0.2] }, manos = { a: [27, 4, 26], polo: [1, 0.2, 0] };
    COREO['puente-gluteos'] = {
      vista: [72, [28, 30]], picado: 16, rastro: 'pel', esfuerzo: [0, 1], clavos: ['ti', 'td', 'mi', 'md'],
      posturas: {
        a: sobre(SUPINO_SUELO, { p: pies, b: manos, m: PALMA_ABAJO }),
        b: { pel: [0, 27.5, 16.5], giro: [0, -66.8, 0], cab: [-23, 0, 0], p: pies, b: manos, m: PALMA_ABAJO }
      },
      rep: [['b', 1.2, 'empuje'], ['b', 0.6], ['a', 1.6, 'freno'], ['a', 0.5]],
      pasos: ['a', 'rep', 'rep']
    };
    /* con la espalda en el banco: el tronco gira sobre el borde del banco */
    var ph = { suelo: [17, 60], abre: 6, polo: [0.15, 1, 0.3] }, enCadera = { a: [14, 4, 9], en: 'pelvis', polo: [1, 0, -0.6] };
    COREO['hip-thrust-banco'] = {
      vista: [72, 20], rastro: 'pel', esfuerzo: [0, 1], clavos: ['ti', 'td'],
      material: [['banco', { rumbo: 90, en: [0, -36], largo: 110 }]],
      posturas: {
        a0: { pel: [0, 22, 10.9], giro: [0, -53.3, 0], cab: [12, 0, 0], p: ph, b: { a: [27, 4, -3], polo: [1, 0.2, -0.7] }, m: { tipo: 'abierta', prono: 90, mun: -72 } },
        a: { pel: [0, 22, 10.9], giro: [0, -53.3, 0], cab: [12, 0, 0], p: ph, b: enCadera, m: SUELTA },
        b: { pel: [0, 49, 19.5], giro: [0, -90, 0], cab: [14, 0, 0], p: ph, b: enCadera, m: SUELTA }
      },
      rep: [['b', 1.1, 'empuje'], ['b', 0.6], ['a', 1.5, 'freno'], ['a', 0.5]],
      pasos: ['a0', { sec: [['a', 0.9, 'suave']], desde: 'a0' }, 'rep']
    };
    /* la zancada hacia atrás: el pie de delante no se mueve */
    var f = { suelo: [17, 0], abre: 4 };
    var z = { pel: [0, 47, -36], giro: [0, 5, 0], pi: { suelo: [17, 0], abre: 4, polo: [0.1, 0.1, 1] }, pd: { suelo: [-15, -70], abre: 0, talon: 62, polo: [0, -1, 0.4] } };
    COREO['zancada-atras'] = {
      vista: [62, 14], rastro: 'pel', esfuerzo: [2, 6],
      posturas: { a: { p: f }, b: z, b2: refleja(z) },
      rep: [['b', 1.25, 'freno', ['ti']], ['b', 0.5, null, ['ti', 'td']], ['a', 1.05, 'empuje', ['ti']], ['a', 0.35, null, ['ti', 'td']],
            ['b2', 1.25, 'freno', ['td']], ['b2', 0.5, null, ['ti', 'td']], ['a', 1.05, 'empuje', ['td']], ['a', 0.35, null, ['ti', 'td']]],
      pasos: ['a', 'rep', 'rep']
    };
    /* la búlgara: el empeine del pie de atrás, en el banco */
    var atrasB = { a: [-10, 50, -66], polo: [0, -1, 0.25] }, pieAtras = { punta: [0, -0.3, -0.95], arriba: [0, -0.95, 0.3] }, delante = { suelo: [10, 0], abre: 4, polo: [0, 0.1, 1] };
    COREO['sentadilla-bulgara'] = {
      vista: [68, 20], rastro: 'pel', esfuerzo: [2], clavos: ['ti', 'td'],
      material: [['banco', { rumbo: 90, en: [-10, -76], largo: 100 }]],
      posturas: {
        a: { pel: [0, 80, -26], giro: [0, 8, 0], pi: delante, pd: atrasB, td: pieAtras, b: { e: 22, z: 30, g: 60, c: 40 }, m: SUELTA },
        b: { pel: [0, 50, -30], giro: [0, 14, 0], cab: [-10, 0, 0], pi: delante, pd: atrasB, td: pieAtras, b: { e: 40, z: 24, g: 40, c: 62 }, m: SUELTA }
      },
      rep: bajaSube('b', 'a'),
      pasos: ['a', 'rep', 'rep']
    };
  })();

  /* ══════════ ISQUIOTIBIALES ══════════ */
  (function () {
    var bisagra = { pel: [0, 79, -27], giro: [0, 82, 0], cab: [-22, 0, 0] };
    COREO['peso-muerto-rumano-barra'] = {
      vista: [68, 38], rastro: 'manos', esfuerzo: [2], clavos: ['ti', 'td'], material: [['barra', { discos: 17 }]],
      posturas: {
        a: { b: { cuelga: [1, 10], largo: 50 }, m: PRONO },
        b: sobre(bisagra, { b: { cuelga: [1, -4], largo: 50 }, m: PRONO })
      },
      rep: bajaSube('b', 'a', [1.9, 0.35, 1.3, 0.5]),
      pasos: ['a', 'rep', 'b', { rep: 2.25 }]
    };
    COREO['peso-muerto-rumano-mancuernas'] = {
      vista: [68, 38], rastro: 'manos', esfuerzo: [2], clavos: ['ti', 'td'], material: [['mancuernas']],
      posturas: {
        a: { b: { cuelga: [-2, 11], largo: 50 }, m: PRONO },
        b: sobre(bisagra, { b: { cuelga: [-2, -3], largo: 50 }, m: PRONO })
      },
      rep: bajaSube('b', 'a', [1.9, 0.35, 1.3, 0.5]),
      pasos: ['a', 'rep', 'rep']
    };
    /* el peso muerto: la barra espera en el suelo hasta que se agarra (una palma hacia arriba y otra hacia abajo) */
    var pp = { suelo: [12, 0], abre: 8 };
    COREO['peso-muerto-barra'] = {
      vista: [66, 38], rastro: 'manos', esfuerzo: [0], clavos: ['ti', 'td'], reposo: ['a0'],
      material: [['barra', { reposo: [0, 21, 9.5] }]],
      posturas: {
        a0: { p: pp },
        g: { pel: [0, 60, -28], giro: [0, 64, 0], cab: [-30, 0, 0], p: pp, bi: { cuelga: [3, -2.5], largo: 50.4 }, bd: { cuelga: [3, -2.5], largo: 50.4 }, mi: SUPINO, md: PRONO },
        b: { hom: [0, -1.6], p: pp, bi: { cuelga: [3, 9], largo: 50 }, bd: { cuelga: [3, 9], largo: 50 }, mi: SUPINO, md: PRONO }
      },
      inicio: 'g', encuadra: ['a0'],
      rep: [['b', 1.4, 'empuje'], ['b', 0.5], ['g', 1.9, 'freno'], ['g', 0.5]],
      pasos: ['a0', { sec: [['g', 1.5, 'suave']], desde: 'a0' }, 'rep', { rep: 1.9 }]
    };
    var pa = { suelo: [25, 0], abre: 8 }, cad = { a: [15.5, 3, 7], en: 'pelvis', polo: [1, 0, -0.9] };
    COREO['buenos-dias-sin-peso'] = {
      vista: [70, 24], rastro: 'cab', esfuerzo: [2], clavos: ['ti', 'td'],
      posturas: {
        a: { pel: [0, 84, 0], p: pa, b: cad, m: SUELTA },
        b: { pel: [0, 83, -14], giro: [0, 70, 0], cab: [-18, 0, 0], p: pa, b: cad, m: SUELTA }
      },
      rep: bajaSube('b', 'a', [1.6, 0.3, 1.3, 0.5]),
      pasos: ['a', 'rep', 'rep']
    };
  })();

  /* ══════════ PANTORRILLAS ══════════ */
  (function () {
    COREO['elevacion-talones-de-pie'] = {
      vista: [90, 36], rastro: 'tli', esfuerzo: [0, 1], clavos: ['ti', 'td'],
      posturas: {
        a: { p: { suelo: [17, 0], abre: 4 } },
        b: { pel: [0, PIE + 6, 8], p: { suelo: [17, 0], abre: 4, talon: 42 } }
      },
      rep: [['b', 1.5, 'suave'], ['b', 0.5], ['a', 1.6, 'freno'], ['a', 0.4]],
      pasos: ['a', 'rep', 'rep']
    };
    /* en el escalón: la parte delantera de los pies, apoyada; los talones, en el aire */
    var alto = 20;
    COREO['elevacion-talones-escalon'] = {
      vista: [90, 40], rastro: 'tli', esfuerzo: [0, 1], clavos: ['ti', 'td'],
      material: [['escalon', { med: [86, alto, 40], en: [0, 19.5] }]],
      posturas: {
        a: { pel: [0, PIE + alto - 1.6, -10.4], p: { suelo: [11, -10], abre: 3, alto: alto, talon: -9 } },
        b: { pel: [0, PIE + alto + 5.6, -2.4], p: { suelo: [11, -10], abre: 3, alto: alto, talon: 40 } }
      },
      rep: [['b', 1.4, 'suave'], ['b', 0.55], ['a', 1.7, 'freno'], ['a', 0.35]],
      pasos: ['a', 'rep', 'rep']
    };
    /* los saltos pogo: pequeños y rápidos, de tobillos; los talones no llegan al suelo */
    var pt = { suelo: [12, 0], abre: 5, talon: 24 };
    COREO['saltos-pogo'] = {
      vista: [72, 0], rastro: 'tli', esfuerzo: [1], zoom: 0.94,
      posturas: {
        a: { p: { suelo: [12, 0], abre: 5 }, b: aLosLados(26), m: SUELTA },
        q: { pel: [0, PIE + 1.6, 3.6], p: pt, b: aLosLados(40), m: SUELTA },
        s: { pel: [0, PIE + 13, 3.6], p: { e: 3, z: 0, c: 7 }, t: { tob: 44 }, b: aLosLados(52), m: SUELTA }
      },
      inicio: 'q', encuadra: ['a'],
      rep: [['q', 0.1, null, ['ti', 'td']], ['s', 0.17, 'sale', []], ['q', 0.17, 'entra', []]],
      pasos: ['a', 'rep', 'rep']
    };
    /* el gemelo en la pared: una pierna atrás, con la rodilla estirada y el talón en el suelo */
    var enPared = { a: [17, 120, 43.5], polo: [0.7, -1, -0.5] }, mp = { tipo: 'abierta', prono: 90, mun: -68 };
    var e1 = { pel: [0, 78, -6], giro: [0, 12, 0], pi: { suelo: [10, 24], abre: 0 }, pd: { suelo: [-10, -36], abre: 0, polo: [0, 0, 1] }, b: enPared, m: mp };
    var e2 = { pel: [0, 74, 2], giro: [0, 16, 0], pi: { suelo: [10, 24], abre: 0, polo: [0, 0.2, 1] }, pd: { suelo: [-10, -36], abre: 0, polo: [0, 0, 1] }, b: enPared, m: mp };
    COREO['estiramiento-gemelo-pared'] = {
      vista: [100, 146], isometrico: 'b', clavos: ['mi', 'md'],
      material: [['pared', { z: 52, normal: [0, 0, -1], ancho: 130 }]],
      posturas: { a: e1, b: e2, a2: refleja(e1), b2: refleja(e2) },
      inicio: 'a', encuadra: ['b'],
      pasos: ['a', { sec: [['b', 1.5, 'suave']], desde: 'a' }, { sec: [['b', 2.6], ['a', 0.9, 'suave'], ['a2', 1.1, 'suave'], ['b2', 1.5, 'suave']], desde: 'b' }]
    };
  })();

  /* ══════════ BÍCEPS ══════════ */
  COREO['curl-mancuernas'] = {
    vista: [48, 0], rastro: 'mi', esfuerzo: [0], material: [['mancuernas']],
    posturas: {
      a: { b: aLosLados(4), m: { tipo: 'puno', prono: 0 } },
      b: { b: aLosLados(140), m: SUPINO }
    },
    rep: subeBaja('b', 'a'),
    pasos: ['a', 'rep', 'rep']
  };
  COREO['curl-martillo'] = {
    vista: [52, 0], rastro: 'mi', esfuerzo: [0], material: [['mancuernas']],
    posturas: {
      a: { pi: { suelo: [10, 8], abre: 5 }, pd: { suelo: [-10, -5], abre: 5 }, hom: [-1, -1], b: aLosLados(4), m: PUNO },
      b: { pi: { suelo: [10, 8], abre: 5 }, pd: { suelo: [-10, -5], abre: 5 }, hom: [-1, -1], b: aLosLados(138), m: PUNO }
    },
    rep: subeBaja('b', 'a'),
    pasos: ['a', 'rep', 'rep']
  };
  COREO['curl-barra'] = {
    vista: [50, 0], rastro: 'manos', esfuerzo: [0], material: [['barra', { largo: 150, discos: 13 }]],
    posturas: {
      a: { pel: [0, PIE - 1.5, 0], p: { suelo: [17, 0], abre: 8 }, b: { e: 9, z: 0, g: 0, c: 6 }, m: SUPINO },
      b: { pel: [0, PIE - 1.5, 0], p: { suelo: [17, 0], abre: 8 }, b: { e: 9, z: 0, g: 0, c: 138 }, m: SUPINO }
    },
    rep: subeBaja('b', 'a'),
    pasos: ['a', 'rep', 'rep']
  };

  /* ══════════ TRÍCEPS ══════════ */
  (function () {
    var borde = { a: [19, 47, -3], polo: [0.25, 0.25, -1] }, mb = { tipo: 'abierta', prono: 90, mun: -78 };
    COREO['fondos-banco'] = {
      vista: [70, 24], rastro: 'hombros', esfuerzo: [2], clavos: ['mi', 'md', 'ti', 'td'],
      material: [['banco', { rumbo: 90, en: [0, -17], largo: 110 }]],
      posturas: {
        s: { pel: [0, 55, -9], p: { suelo: [10, 34], abre: 4, polo: [0, 1, 0.5] }, b: borde, m: mb },
        a: { pel: [0, 53, 8], p: { suelo: [10, 47], abre: 4, polo: [0, 1, 0.5] }, b: borde, m: mb },
        b: { pel: [0, 30, 9], p: { suelo: [10, 47], abre: 4, polo: [0, 1, 0.5] }, b: borde, m: mb }
      },
      inicio: 'a', encuadra: ['s'],
      rep: bajaSube('b', 'a'),
      pasos: ['s', { sec: [['a', 1.2, 'suave', ['mi', 'md']]], desde: 's' }, 'rep']
    };
    COREO['extension-triceps-polea-cuerda'] = {
      vista: [66, 124], rastro: 'manos', esfuerzo: [0], clavos: ['ti', 'td'],
      material: [['polea', { en: [0, 64], alto: 204, agarre: 'cuerda' }]],
      posturas: {
        a: { pel: [0, PIE - 2, -4], giro: [0, 10, 0], cab: [-8, 0, 0], p: { suelo: [12, 0], abre: 8 }, b: { e: 6, z: 0, g: 24, c: 106 }, m: PUNO },
        b: { pel: [0, PIE - 2, -4], giro: [0, 10, 0], cab: [-8, 0, 0], p: { suelo: [12, 0], abre: 8 }, b: { e: 6, z: 0, g: -16, c: 5 }, m: PUNO }
      },
      rep: [['b', 1.1, 'empuje'], ['b', 0.3], ['a', 1.6, 'freno'], ['a', 0.4]],
      pasos: ['a', 'rep', 'rep']
    };
    /* la flexión diamante: las manos juntas, bajo el pecho */
    var juntas = { a: [4.5, 5, 15], polo: [1, 0.25, -0.5] };
    COREO['flexion-diamante'] = {
      vista: [78, [32, 34]], picado: 16, rastro: 'pecho', esfuerzo: [2], clavos: ['mi', 'md', 'ti', 'td'],
      posturas: { a: tabla(20.2, { b: juntas }), b: tabla(3.2, { b: juntas, cab: [-22, 0, 0] }) },
      rep: bajaSube('b', 'a', [1.7, 0.2, 1.1, 0.5]),
      pasos: ['a', 'a', 'rep']
    };
  })();

  /* ══════════ PECHO ══════════ */
  (function () {
    var tumbado = { pel: [0, 55, 30], giro: [0, -90, 0], p: { suelo: [17, 68], abre: 8, polo: [0.2, 1, 0.3] }, m: PRONO };
    COREO['press-banca-barra'] = {
      vista: [30, 0], picado: 32, rastro: 'manos', esfuerzo: [2], clavos: ['mi', 'md', 'ti', 'td'],
      material: [['banco', { largo: 124 }], ['soporte', { z: -43.5, alto: 104.5, ancho: 52 }], ['barra']],       /* la barra de «sop», sobre los ganchos (a z + 3,5) */
      posturas: {
        sop: sobre(tumbado, { b: { a: [30, 98, -36], polo: [1, -0.4, 0.4] } }),
        a: sobre(tumbado, { b: { a: [30, 104, -10], polo: [1, -0.4, 0.4] } }),
        b: sobre(tumbado, { b: { a: [30, 62.5, -4], polo: [1, -1, 0.2] } })
      },
      inicio: 'a', encuadra: ['sop'],
      rep: bajaSube('b', 'a', [1.8, 0.25, 1.1, 0.5]),
      pasos: ['sop', { sec: [['a', 1.7, 'suave']], desde: 'sop' }, 'rep', 'nota']
    };
    var manos = { a: [19, 5, 13.3], polo: [0.55, 0.25, -1] };
    COREO.flexion = {
      vista: [78, [32, 34]], picado: 16, rastro: 'pecho', esfuerzo: [2], clavos: ['mi', 'md', 'ti', 'td'],
      posturas: { a: tabla(20.2, { b: manos }), b: tabla(1.0, { b: manos, cab: [-24, 0, 0] }) },
      rep: bajaSube('b', 'a', [1.6, 0.2, 1.1, 0.5]),
      pasos: ['a', 'a', 'rep', 'rep']
    };
  })();

  /* ══════════ DORSALES ══════════ */
  (function () {
    COREO.dominadas = {
      vista: [26, 154], rastro: 'barbilla', esfuerzo: [0], clavos: ['mi@0:28', 'md@0:-28'],
      material: [['barra_dominadas', { alto: 225, ancho: 62 }]],
      posturas: {
        a: sobre(COLGADO, { pel: [0, 120, -2], hom: [3.5, 0], b: { a: [28, 217, 0], polo: [1, -0.2, 0.5] } }),
        a2: sobre(COLGADO, { pel: [0, 125.5, -2], hom: [-2, -1.5], col: [-3, 0, 0], b: { a: [28, 217, 0], polo: [1, -0.3, 0.4] } }),
        b: sobre(COLGADO, { pel: [0, 172, -11], giro: [0, -8, 0], hom: [-2, -1.5], col: [-3, 0, 0], cab: [6, 0, 0], b: { a: [28, 217, 0], polo: [1, -1, 0.1] } })
      },
      inicio: 'a2',
      rep: [['b', 1.3, 'empuje'], ['b', 0.5], ['a2', 1.9, 'freno'], ['a2', 0.45]],
      pasos: ['a', { sec: [['a2', 1.0, 'suave']], desde: 'a' }, 'rep', 'rep']
    };
    /* supinas: las palmas hacia uno; los codos bajan por delante del cuerpo */
    var sup = sobre(COLGADO, { m: SUPINO });
    COREO['dominadas-supinas'] = {
      vista: [30, 96], rastro: 'barbilla', esfuerzo: [0], clavos: ['mi@0:20', 'md@0:-20'],
      material: [['barra_dominadas', { alto: 225, ancho: 62 }]],
      posturas: {
        a: sobre(sup, { pel: [0, 119.4, -2], hom: [3.5, 0], b: { a: [20, 217, 0], polo: [0.4, -0.2, 1] } }),
        a2: sobre(sup, { pel: [0, 124.8, -2], hom: [-2, -1.5], col: [-3, 0, 0], b: { a: [20, 217, 0], polo: [0.4, -0.3, 1] } }),
        b: sobre(sup, { pel: [0, 175, -12], giro: [0, -8, 0], hom: [-2, -1.5], col: [-3, 0, 0], cab: [6, 0, 0], b: { a: [20, 217, 0], polo: [0.25, -1, 0.9] } })
      },
      inicio: 'a2',
      rep: [['b', 1.3, 'empuje'], ['b', 0.35], ['a2', 1.9, 'freno'], ['a2', 0.45]],
      pasos: ['a', { sec: [['a2', 1.0, 'suave']], desde: 'a' }, 'rep', { rep: 1.65 }]
    };
    /* el remo a una mano: la rodilla y la mano izquierdas, en el banco; la mancuerna, en la derecha */
    var apoyo = {
      pel: [0, 85, -20], giro: [0, 78, 0], cab: [-30, 0, 0],
      pi: { a: [16, 50, -58], polo: [0.1, -1, 0.5] }, ti: { punta: [0, -0.2, -1], arriba: [0, -1, 0.2] },
      pd: { suelo: [-13, -24], abre: 6 },
      bi: { a: [17, 49, 27], polo: [0.4, 0.1, -1] }, mi: { tipo: 'abierta', prono: 90, mun: -78 }, md: PUNO
    };
    COREO['remo-mancuerna-un-brazo'] = {
      vista: [-66, -18], rastro: 'md', esfuerzo: [0], clavos: ['ti', 'td', 'mi'],
      material: [['banco', { en: [16, 6], largo: 124 }], ['mancuernas', { lado: 'd' }]],
      posturas: {
        a: sobre(apoyo, { bd: { cuelga: [0, 0], largo: 50 } }),
        b: sobre(apoyo, { hom: { i: [0, 0], d: [0, -2.2] }, bd: { a: [-22, 80, -3], polo: [-0.3, 1, -0.5] } })
      },
      rep: [['b', 1.0, 'empuje'], ['b', 0.35], ['a', 1.5, 'freno'], ['a', 0.4]],
      pasos: ['a', 'rep', 'rep', 'nota']
    };
  })();

  /* ══════════ ESPALDA ALTA ══════════ */
  (function () {
    var base = { pel: [0, PIE - 1.5, 0], p: { suelo: [17, 0], abre: 8 }, b: aLosLados(3), m: PUNO };
    COREO['encogimientos-mancuernas'] = {
      vista: [0, 62], rastro: 'hi', esfuerzo: [0, 1], material: [['mancuernas']],
      posturas: { a: base, b: sobre(base, { hom: [5.6, 0] }) },
      rep: [['b', 0.9, 'empuje'], ['b', 0.7], ['a', 1.3, 'freno'], ['a', 0.4]],
      pasos: ['a', 'rep', 'rep']
    };
    /* el remo invertido: el cuerpo gira sobre los talones; las manos, en la barra */
    function bajoBarra(ang, extra) {
      var s = Math.sin(ang * RAD), c = Math.cos(ang * RAD);
      return sobre({ pel: [0, 8 + 78 * s, 88 - 78 * c], giro: [0, -(90 - ang), 0], p: { e: 0, z: 0, c: 0 }, t: { punta: [0, 0.97, 0.24], arriba: [0, 0.24, -0.97] }, m: PRONO, b: { a: [26, 72, 0], polo: [1, -1, 0.1] } }, extra || {});
    }
    COREO['remo-invertido'] = {
      vista: [72, 28], rastro: 'pecho', esfuerzo: [0], clavos: ['mi@0:26', 'md@0:-26', 'ti', 'td'],
      material: [['barra_dominadas', { alto: 80, ancho: 62 }]],
      posturas: { a: bajoBarra(10.7, { hom: [1, 2.4] }), a2: bajoBarra(11.6, { hom: [0, -2] }), b: bajoBarra(33.4, { hom: [0, -2.4] }) },
      inicio: 'a2',
      rep: [['b', 1.1, 'empuje'], ['b', 0.35], ['a2', 1.6, 'freno'], ['a2', 0.4]],
      pasos: ['a', { sec: [['a2', 0.9, 'suave']], desde: 'a' }, 'rep']
    };
    /* el face pull: la cuerda, a la altura del pecho; un pie adelantado */
    var fp = { pi: { suelo: [10, 16], abre: 6 }, pd: { suelo: [-10, -13], abre: 8 }, m: PRONO };
    COREO['face-pull-polea'] = {
      vista: [58, 112], rastro: 'manos', esfuerzo: [0, 1], clavos: ['ti', 'td'],
      material: [['polea', { en: [0, 150], alto: HOMBRO - 4, agarre: 'cuerda' }]],
      posturas: {
        a: sobre(fp, { pel: [0, PIE - 1, 0], b: { e: 88, z: 7, g: 0, c: 5 } }),
        a2: sobre(fp, { pel: [0, PIE - 4, 0], hom: [0, -2.2], b: { e: 88, z: 7, g: 0, c: 5 } }),
        b: sobre(fp, { pel: [0, PIE - 4, 0], hom: [0, -2.6], b: { e: 97, z: 80, g: 34, c: 112 } })
      },
      inicio: 'a2',
      rep: [['b', 1.1, 'empuje'], ['b', 0.7], ['a2', 1.6, 'freno'], ['a2', 0.4]],
      pasos: ['a', { sec: [['a2', 0.9, 'suave']], desde: 'a' }, 'rep', { rep: 1.1 }]
    };
  })();

  /* ══════════ HOMBROS ══════════ */
  COREO['elevaciones-laterales-mancuernas'] = {
    vista: [0, 42], rastro: 'mi', esfuerzo: [0], material: [['mancuernas']],
    posturas: {
      a: { b: { e: 6, z: 90, g: 90, c: 12 }, m: PUNO },
      a2: { hom: [-1.5, -1.5], b: { e: 6, z: 90, g: 90, c: 12 }, m: PUNO },
      b: { hom: [-1.5, -1.5], b: { e: 88, z: 88, g: 68, c: 12 }, m: PUNO }
    },
    inicio: 'a2',
    rep: [['b', 1.3, 'empuje'], ['b', 0.3], ['a2', 1.8, 'freno'], ['a2', 0.4]],
    pasos: ['a', { sec: [['a2', 0.8]], desde: 'a' }, 'rep', 'rep']
  };
  COREO['elevaciones-frontales-mancuernas'] = {
    vista: [58, 0], rastro: 'mi', esfuerzo: [0], material: [['mancuernas']],
    posturas: {
      a: { b: { e: 9, z: 0, g: 0, c: 10 }, m: PRONO },
      a2: { hom: [-1.5, -1.5], b: { e: 9, z: 0, g: 0, c: 10 }, m: PRONO },
      b: { hom: [-1.5, -1.5], b: { e: 90, z: 0, g: 0, c: 10 }, m: PRONO }
    },
    inicio: 'a2',
    rep: [['b', 1.3, 'empuje'], ['b', 0.3], ['a2', 1.8, 'freno'], ['a2', 0.4]],
    pasos: ['a', { sec: [['a2', 0.8]], desde: 'a' }, 'rep']
  };
  COREO['press-militar-barra'] = {
    vista: [22, 78], rastro: 'manos', esfuerzo: [0], clavos: ['mi', 'md'], material: [['barra', { discos: 17 }]],
    posturas: {
      a: { b: { a: [26, HOMBRO - 8.5, 15], polo: [0.3, -1, 0.6] }, m: PRONO },
      b: { b: { a: [26, HOMBRO + 49, 9], polo: [0.6, -0.2, 0.8] }, m: PRONO, cab: [-6, 0, 0] }
    },
    rep: [['b', 1.2, 'empuje'], ['b', 0.35], ['a', 1.6, 'freno'], ['a', 0.45]],
    pasos: ['a', 'rep', 'rep']
  };

  /* ══════════ CORE ══════════ */
  (function () {
    var ang = 8.5, s = Math.sin(ang * RAD), c = Math.cos(ang * RAD);
    var brazos = { a: [19, 4, -100 + 121.5 * c + 24], polo: [0, -1, -0.25] };
    COREO['plancha-antebrazos'] = {
      vista: [80, [32, 34]], picado: 16, isometrico: 'a',
      posturas: {
        a0: { pel: [0, 11.5, -22], giro: [0, 90, 0], col: [-26, 0, 0], cab: [-14, 0, 0], p: { e: 0, z: 0, c: 0 }, t: { punta: [0, 0, -1], arriba: [0, -1, 0] }, b: brazos, m: PALMA_ABAJO },
        a: { pel: [0, TOB_PUNTA + 78 * s, -100 + 78 * c], giro: [0, 90 - ang, 0], cab: [-12, 0, 0], p: { e: 0, z: 0, c: 0 }, t: PIES_PUNTA, b: brazos, m: PALMA_ABAJO }
      },
      inicio: 'a0', encuadra: ['a'],
      pasos: ['a0', { sec: [['a', 1.3, 'suave']], desde: 'a0' }, { sec: [['a', 5.5], ['a0', 1.5, 'suave']], desde: 'a' }]
    };
    /* el crunch: se enrolla el tronco; la pelvis y los pies no se mueven */
    var nuca = { a: [8, 37, -8], en: 'torax', polo: [1, 0.2, -0.3] }, pc = { suelo: [11, 60], abre: 4, polo: [0.1, 1, 0.2] };
    COREO['crunch-abdominal'] = {
      vista: [74, [30, 32]], picado: 16, rastro: 'hombros', esfuerzo: [0, 1], clavos: ['ti', 'td'],
      posturas: {
        a: sobre(SUPINO_SUELO, { p: pc, b: nuca, m: SUELTA }),
        b: sobre(SUPINO_SUELO, { col: [36, 0, 0], cab: [6, 0, 0], p: pc, b: nuca, m: SUELTA })
      },
      rep: [['b', 1.2, 'empuje'], ['b', 0.4], ['a', 1.6, 'freno'], ['a', 0.4]],
      pasos: ['a', 'rep', 'rep']
    };
    /* el bicho muerto: un brazo y la pierna contraria bajan hasta rozar el suelo */
    var centro = { pel: [0, 11.5, 0], giro: [0, -90, 0], b: { e: 90, z: 0, g: 0, c: 0 }, m: SUELTA, p: { e: 90, z: 0, g: 0, c: 90 }, t: { tob: 0 } };
    var lado = sobre(centro, { bi: { e: 174, z: 0, g: 0, c: 0 }, bd: { e: 90, z: 0, g: 0, c: 0 }, pi: { e: 90, z: 0, g: 0, c: 90 }, pd: { e: 7, z: 0, g: 0, c: 4 } });
    COREO['bicho-muerto'] = {
      vista: [72, [40, 36]], picado: 16, rastro: 'md', esfuerzo: [0, 1, 4, 5],
      posturas: { a: centro, b: lado, b2: refleja(lado) },
      rep: [['b', 1.5, 'freno'], ['b', 0.3], ['a', 1.3, 'suave'], ['a', 0.3], ['b2', 1.5, 'freno'], ['b2', 0.3], ['a', 1.3, 'suave'], ['a', 0.3]],
      pasos: ['a', 'a', 'rep', { rep: 3.4 }]
    };
    COREO['elevacion-rodillas-colgado'] = {
      vista: [62, 0], rastro: 'rodillas', esfuerzo: [0, 1], clavos: ['mi@0:24', 'md@0:-24'],
      material: [['barra_dominadas', { alto: 225, ancho: 62 }]],
      posturas: {
        a: { pel: [0, 121, -2], hom: [1, 0], p: { e: 4, z: 0, c: 8 }, t: { tob: 26 }, m: PRONO, b: { a: [24, 217, 0], polo: [1, -0.2, 0.5] } },
        b: { pel: [0, 121.5, -4], giro: [0, -8, 0], col: [12, 0, 0], hom: [1, 0], p: { e: 90, z: 0, c: 96 }, t: { tob: 10 }, m: PRONO, b: { a: [24, 217, 0], polo: [1, -0.2, 0.5] } }
      },
      rep: [['b', 1.1, 'empuje'], ['b', 0.45], ['a', 1.6, 'freno'], ['a', 0.4]],
      pasos: ['a', 'rep', 'rep']
    };
  })();

  /* ══════════ ANTEBRAZOS ══════════ */
  COREO['suspension-barra'] = {
    vista: [26, 154], isometrico: 'a', clavos: ['mi@0:24', 'md@0:-24'], sinClavos: ['l', 'f'],
    material: [['barra_dominadas', { alto: 225, ancho: 62 }]],
    posturas: {
      a: sobre(COLGADO, { pel: [0, 119.6, -2], hom: [3.5, 0], b: { a: [24, 217, 0], polo: [1, -0.2, 0.5] } }),
      m: sobre(COLGADO, { pel: [0, 119.6, -2], hom: [3.5, 0], cab: [26, 0, 0], b: { a: [24, 217, 0], polo: [1, -0.2, 0.5] } }),
      l: { pel: [0, 64, -10], giro: [0, 24, 0], cab: [-6, 0, 0], p: { suelo: [11, 0], abre: 6 }, b: { e: 40, z: 16, g: 0, c: 40 }, m: SUELTA },
      f: { p: { suelo: [11, 0], abre: 6 }, m: SUELTA }
    },
    inicio: 'a', encuadra: ['f'],
    pasos: ['a', 'a', { sec: [['m', 0.7, 'suave'], ['m', 1.3], ['l', 0.36, 'entra', []], ['f', 0.9, 'suave', ['ti', 'td']]], desde: 'a' }]
  };
