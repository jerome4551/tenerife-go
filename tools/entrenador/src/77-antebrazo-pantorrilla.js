  /* ───────────────────────── las coreografías: ANTEBRAZO Y PANTORRILLA (bloque 8) ─────────────────────────
     Las mismas reglas que en 70-coreografias.js: cada una sale de los pasos verificados de su ficha y no añade técnica
     que la ficha no diga. Van por familias. El antebrazo: los curls de muñeca (sentado con barra, de rodillas ante un banco
     con mancuernas, en la polea), los giros y las desviaciones de la muñeca, los paseos con carga, la dominada con toallas,
     las flexiones sobre las yemas y los estiramientos. La pantorrilla: las elevaciones de talón (de pie, en escalón, con
     barra, sentado), el tibial, los saltos y los estiramientos.
     En casi todo el antebrazo lo que se mueve es la muñeca y nada más: el brazo se escribe igual en todas las posturas de la
     repetición y solo cambia la mano (mun: cuánto se dobla hacia la palma, +, o hacia el dorso, −; lat: hacia el pulgar, +, o
     hacia el meñique, −; prono: el giro del antebrazo). En casi toda la pantorrilla, el tobillo: el pie gira sobre su bola
     (talon) o, para el tibial, sobre el talón (enTalon). */
  (function () {
    var T2 = ['ti', 'td'];
    /* la misma mano, con otra muñeca */
    function con(m, cambios) { return une(m, cambios); }

    /* ══════════════════════════════ EL ANTEBRAZO ══════════════════════════════ */

    /* ══════════ los curls de muñeca ══════════ */
    /* ── sentado en el extremo de un banco, con la barra ──
       Los antebrazos descansan a lo largo de los muslos: el codo, a 25 cm de la cadera por la línea del muslo y 14,9 por encima de su
       eje; la muñeca, 9,6 por encima y pasada la rodilla. El tronco se inclina lo justo (se busca) para que el hombro quede a un brazo
       del codo. Las manos, a la anchura de los hombros, que es por donde va el muslo */
    var SENTADO = { pel: [0, 55, 0], p: { suelo: [17, 40], abre: 8, polo: [0.1, 1, 0.35] } };
    function sentado(inc, extra) { return sobre(SENTADO, sobre({ giro: [0, inc, 0], cab: [-inc * 0.55, 0, 0] }, extra || {})); }
    function enMuslos(mano) {
      var E = resolver(SENTADO), u = unidad(menos(E.i.rod, E.i.cad)), n = unidad(sinParte([0, 1, 0], u));
      var C = mas(E.i.cad, mas(por(u, 25), por(n, 14.9))), sw = 25 + Math.sqrt(D.antebrazo * D.antebrazo - 5.3 * 5.3 - 1.7 * 1.7), W = mas(E.i.cad, mas(por(u, sw), mas(por(n, 9.6), [-1.7, 0, 0])));
      var inc = busca(function (x) { return largo(menos(resolver(sentado(x)).i.hom, C)); }, D.brazo, 10, 60);
      return { P: sentado(inc, { b: { a: W, polo: menos(C, resolver(sentado(inc)).i.hom) }, m: mano }), C: C, W: W, inc: inc, fuera: sw - D.muslo };
    }
    /* o: { palma: 1 (hacia arriba) o −1 (hacia abajo), abajo, arriba (la muñeca, en cada extremo), sube, baja, pausa, vista } */
    function curlMunecaBarra(o) {
      var mano = { tipo: 'puno', barra: [1, 0, 0], palma: [0, o.palma, 0], prono: -90 * o.palma };
      var M = enMuslos(mano), P = M.P;
      /* antes de apoyarse: erguido, con la barra en las manos por encima de los muslos */
      var s = conAgarre(sentado(10, { m: mano }), [19, 67.5, 35], [0.4, -0.5, -1]);
      return {
        vista: o.vista || [56, [22, 16]], picado: 12, rastro: 'manos', esfuerzo: [0, 1], clavos: T2,
        material: [BANCO_DETRAS, ['barra', { largo: 150, discos: 9.5 }]],
        posturas: { s: s, a: sobre(P, { m: con(mano, { mun: o.abajo }) }), b: sobre(P, { m: con(mano, { mun: o.arriba }) }) },
        inicio: 'a', encuadra: ['s'],
        rep: [['b', o.sube || 1.1, 'empuje'], ['b', o.pausa || 0.6], ['a', o.baja || 1.9, 'freno'], ['a', 0.4]],
        pasos: ['s', { sec: [['a', 1.6, 'suave']], desde: 's' }, 'rep']
      };
    }
    /* con las palmas hacia arriba: flexiona las muñecas para subir la barra, una pausa breve, y la baja despacio */
    COREO['curl-muneca-barra'] = curlMunecaBarra({ palma: 1, abajo: -22, arriba: 52 });
    /* inverso, con las palmas hacia abajo: sube los nudillos hacia la cara extendiendo las muñecas, una pausa, y baja despacio */
    COREO['curl-muneca-inverso-barra'] = curlMunecaBarra({ palma: -1, abajo: 28, arriba: -48, pausa: 0.7 });

    /* ── de rodillas ante un banco atravesado, con los antebrazos encima y las manos por fuera del borde de delante ──
       Las rodillas, en el suelo (en z = 0), a la anchura de las caderas; los empeines, apoyados atrás (el tobillo, a 3,6 cm del suelo: así es
       el empeine de la zapatilla lo que descansa en él). El banco queda delante, a lo ancho
       (de z = 18 a z = 46, a 44 cm del suelo). El codo descansa cerca del borde de atrás y la muñeca pasa 1,4 cm del de delante: la
       mano queda fuera. El tronco se inclina lo justo (se busca) para que el hombro quede a un brazo del codo */
    var DE_RODILLAS = { p: { a: [10, 3.6, -37.5], polo: [0.1, -1, 0.6] }, t: { punta: [0, -0.04, -1], arriba: [0, -1, 0.04] } };
    function arrodillado(atras, cabeceo, extra) { return sobre(DE_RODILLAS, sobre({ pel: [0, 5.5 + Math.sqrt(1600 - atras * atras), -atras], giro: [0, cabeceo, 0] }, extra || {})); }
    var ZB = 32, BANCO_ANTE = ['banco', { rumbo: 90, en: [0, ZB], largo: 110 }];
    var COD_B = [17.5, 44 + 5.9, ZB - 8.5], MUN_B = [19, 44 + 4.2, ZB - 8.5 + Math.sqrt(D.antebrazo * D.antebrazo - 1.5 * 1.5 - 1.7 * 1.7)];
    var INC_B = busca(function (x) { return largo(menos(resolver(arrodillado(8, x)).i.hom, COD_B)); }, D.brazo, 20, 70);
    function anteBanco(extra) {
      var P = arrodillado(8, INC_B, { cab: [-INC_B * 0.45, 0, 0] });
      return sobre(P, sobre({ b: { a: MUN_B, polo: menos(COD_B, resolver(P).i.hom) } }, extra || {}));
    }
    /* o: { palma: 1 o −1, abajo, arriba, pasos } con una mancuerna en cada mano */
    function curlMunecaMancuernas(o) {
      var mano = { tipo: 'puno', prono: -90 * o.palma };
      var en = function (mun) { return anteBanco({ m: con(mano, { mun: mun }) }); };
      return {
        vista: [[58, 18], [-24, 30]], rastro: 'mi', esfuerzo: [0, 1], clavos: T2,
        material: [BANCO_ANTE, ['mancuernas', { radio: 5.6 }]],
        posturas: { n: en(0), a: en(o.abajo), b: en(o.arriba) },
        inicio: 'a', encuadra: ['n'],
        rep: [['b', 1.1, 'empuje'], ['b', 0.45], ['a', 1.8, 'freno'], ['a', 0.4]],
        pasos: ['n', { sec: [['a', 1.7, 'suave']], desde: 'n' }, 'rep']
      };
    }
    /* con las palmas hacia arriba: deja bajar las mancuernas doblando las muñecas hacia el suelo, y las sube flexionándolas */
    COREO['curl-muneca-mancuernas'] = curlMunecaMancuernas({ palma: 1, abajo: -46, arriba: 52 });
    /* inverso, con las palmas hacia abajo: las muñecas se doblan hacia el suelo y las sube extendiéndolas */
    COREO['curl-muneca-inverso-mancuernas'] = curlMunecaMancuernas({ palma: -1, abajo: 46, arriba: -46 });

    /* ── la desviación radial y cubital: el antebrazo izquierdo, de lado en el banco (el pulgar hacia arriba), la mano por fuera del borde
       con un peso ligero. Levanta la mano llevando el pulgar hacia el techo, sin despegar el antebrazo, y la baja despacio hacia el suelo.
       El otro antebrazo descansa también en el banco, con la mano suelta ── */
    COREO['desviacion-radial-cubital-peso'] = (function () {
      var en = function (lat) { return anteBanco({ mi: { tipo: 'puno', prono: 0, lat: lat }, md: { tipo: 'suelta', prono: 90, mun: 12 } }); };
      return {
        vista: [[58, 18], [-24, 30]], rastro: 'mi', esfuerzo: [3], clavos: T2,
        material: [BANCO_ANTE, ['mancuernas', { lado: 'i', radio: 4.8 }]],
        posturas: { n: en(0), b: en(24), a: en(-32) },
        inicio: 'b', encuadra: ['n'],
        rep: [['a', 2.0, 'freno'], ['a', 0.35], ['b', 1.2, 'empuje'], ['b', 0.45]],
        pasos: ['n', { sec: [['b', 1.4, 'suave']], desde: 'n' }, 'rep']
      };
    })();

    /* ── en la polea baja, a una mano: de pie ante la polea; coge el asa (que espera junto a la polea) con la palma hacia arriba y se
       queda con el codo junto al cuerpo y el antebrazo algo elevado. Flexiona la muñeca para subir el asa, una pausa, y la baja despacio ── */
    COREO['curl-muneca-polea'] = (function () {
      var XH = 21, ZC = 84, R = [XH, 30, ZC - 26], mano = { tipo: 'puno', prono: -90 };
      var base = { pel: [0, PIE - 1, 0], p: { suelo: [12, 0], abre: 8 }, bd: aLosLados(8), md: SUELTA };
      var en = function (mun) { return sobre(base, { bi: { e: 4, z: 0, g: 0, c: 68 }, mi: con(mano, { mun: mun }) }); };      /* el antebrazo, recto hacia la polea */
      var Pg = function (k) { return sobre(base, { pel: [4, PIE - 2 - k * 0.45, -k * 0.34], giro: [0, k, 0], col: [3, 10, 0], cab: [-k * 0.45, -6, 0], p: { suelo: [14, 0], abre: 9, polo: [0.3, 0.1, 1] }, mi: mano }); };
      var k = busca(function (x) { return largo(menos(resolver(Pg(x)).i.hom, R)); }, BRAZO - 1, 5, 85);
      return {
        vista: [[-52, 14], [36, 20]], rastro: 'mi', esfuerzo: [0, 1], clavos: T2, reposo: ['s'],
        material: [['polea', { en: [XH, ZC], alto: 20, a: 'i', agarre: 'asa', reposo: R, encuadre: 150 }]],
        posturas: { s: sobre(base, { bi: aLosLados(8), mi: SUELTA }), g: conAgarre(Pg(k), R, [0.6, 0.3, -1], 'bi'), a: en(-18), b: en(54) },
        inicio: 'a', encuadra: ['s', 'g'],
        rep: [['b', 1.0, 'empuje'], ['b', 0.6], ['a', 1.9, 'freno'], ['a', 0.4]],
        pasos: [{ sec: [['s', 0.7], ['g', 1.3, 'suave'], ['g', 0.25], ['a', 1.4, 'suave']], desde: 's' }, 'rep']
      };
    })();

    /* ══════════ la muñeca, de pie: doblarla y girarla ══════════ */
    var CODOS_90 = { pel: [0, PIE - 0.5, 0], p: { suelo: [11, 0], abre: 7 } };
    /* flexión y extensión con mancuernas ligeras: los codos doblados junto al cuerpo y las palmas hacia abajo; dobla las muñecas hacia
       arriba y mantiene (cuenta hasta cinco); las baja y mantiene otra vez. No hay repetición: son dos pausas largas */
    COREO['flexoextension-muneca-de-pie'] = (function () {
      var en = function (mun) { return sobre(CODOS_90, { b: aLosLados(88), m: { tipo: 'puno', prono: 90, mun: mun } }); };
      return {
        vista: [[60, 12], [18, 16]], clavos: T2,
        material: [['mancuernas', { radio: 4.8 }]],
        posturas: { a: en(0), u: en(-56), d: en(58) },
        encuadra: ['u', 'd'],
        pasos: ['a', { sec: [['u', 1.6, 'suave']], desde: 'a' }, { sec: [['d', 2.3, 'suave']], desde: 'u' }]
      };
    })();
    /* pronación y supinación: el codo doblado, pegado al costado, y una mancuerna ligera con la palma hacia abajo; gira el antebrazo
       despacio hasta que la palma mira hacia arriba, una pausa, y gira de nuevo hasta que mira hacia abajo, sin mover el codo */
    COREO['pronacion-supinacion-mancuerna'] = (function () {
      var en = function (prono) { return sobre(CODOS_90, { bi: aLosLados(88), mi: { tipo: 'puno', prono: prono }, bd: aLosLados(8), md: SUELTA }); };
      return {
        vista: [[26, 14], [72, 12]], clavos: T2,
        material: [['mancuernas', { lado: 'i', radio: 4.8 }]],
        posturas: { a: en(90), b: en(-90) },
        pasos: ['a', { sec: [['b', 2.6, 'suave']], desde: 'a' }, { sec: [['a', 2.6, 'suave']], desde: 'b' }]
      };
    })();

    /* ══════════ los paseos con carga ══════════
       Anda de verdad: sale de su sitio, llega al final del tramo, da la vuelta y regresa. Cada paso son dos posturas: el doble apoyo (el pie
       de delante, plano; el de atrás, ya de puntillas; la cadera, en lo más bajo) y el apoyo en una pierna (la cadera, en lo más alto y
       sobre el pie que pisa; el otro pie pasa por el aire). El pie que pisa va clavado; la cadera avanza a velocidad constante.
       Se escribe en el marco de quien anda (mira a +Z y sale del origen) y se lleva al mundo: a la ida, tal cual; a la vuelta, girado 180° */
    var ZANCA = 50, N_PASOS = 4, SEP = 9;
    function enMarco(P, r, z0) {
      var B = giroY(r), R = {}, k;
      var pto = function (a) { var q = aplicar(B, [a[0], 0, a[2]]); return [q[0], a[1], q[2] + z0]; }, vec = function (a) { return aplicar(B, a); };
      for (k in P) R[k] = P[k];
      if (P.pel) R.pel = pto(P.pel);
      R.giro = [((P.giro && P.giro[0]) || 0) + r, (P.giro && P.giro[1]) || 0, (P.giro && P.giro[2]) || 0];
      ['pi', 'pd'].forEach(function (q) {
        var a = P[q], n = {}, j; if (!a) return;
        for (j in a) n[j] = a[j];
        if (a.suelo) { var su = pto([a.suelo[0], 0, a.suelo[1]]); n.suelo = [su[0], su[2]]; if (a.rumbo != null) n.rumbo = a.rumbo + r; }
        if (a.a) n.a = pto(a.a);
        if (a.polo) n.polo = vec(a.polo);
        R[q] = n;
      });
      ['ti', 'td'].forEach(function (q) { var a = P[q]; if (a && a.punta) R[q] = { punta: vec(a.punta), arriba: vec(a.arriba), flex: a.flex }; });
      return R;
    }
    /* las posturas de un tramo de N pasos (en su marco) y su secuencia: [postura, segundos, curva, lo clavado] */
    function tramo(base, pre) {
      var z = [0], k, P = {}, sec = [];
      for (k = 1; k <= N_PASOS; k++) z.push(ZANCA * (k - 0.4));
      var pie = function (lado, zz, talon) { return { suelo: [lado === 'i' ? SEP : -SEP, zz], abre: 5, talon: talon || 0 }; };
      P[pre + '0'] = sobre(base, { pel: [0, PIE - 0.6, 3], pi: pie('i', 0), pd: pie('d', 0) });
      for (k = 1; k <= N_PASOS; k++) {
        var s = k % 2 ? 'i' : 'd', o = s === 'i' ? 'd' : 'i', sg = s === 'i' ? 1 : -1, medio = (z[k] - z[k - 1]) / 2, d = {}, m = {};
        /* el doble apoyo: la pierna de delante, casi estirada (77,6 de la cadera al tobillo) */
        d.pel = [0, D.tobillo + Math.sqrt(77.6 * 77.6 - (medio - 3) * (medio - 3)), z[k - 1] + medio + 3]; d.giro = [-3 * sg, 0, 0]; d.col = [0, 0, 3 * sg];
        d['p' + s] = pie(s, z[k]); d['p' + o] = pie(o, z[k - 1], 30);
        P[pre + 'd' + k] = sobre(base, d);
        /* el apoyo en una pierna: el otro pie pasa por el aire (el tobillo, a 16,5 cm), con la punta algo caída */
        m.pel = [1.2 * sg, PIE - 1, z[k] + 3.5];
        m['p' + s] = pie(s, z[k]); m['p' + o] = { a: [-sg * (SEP - 1), 16.5, z[k] - 5], polo: [0, 0.1, 1] }; m['t' + o] = { punta: [0, -0.14, 0.99], arriba: [0, 0.99, 0.14] };
        P[pre + 'm' + k] = sobre(base, m);
        sec.push([pre + 'd' + k, k === 1 ? 0.46 : 0.25, k === 1 ? 'entra' : 'lineal', ['t' + (k === 1 ? 'd' : o)]], [pre + 'm' + k, 0.28, 'lineal', ['t' + s]]);
      }
      P[pre + 'f'] = sobre(base, { pel: [0, PIE - 0.6, z[N_PASOS] + 3], pi: pie('i', z[N_PASOS]), pd: pie('d', z[N_PASOS]) });
      sec.push([pre + 'f', 0.38, 'sale', ['t' + (N_PASOS % 2 ? 'i' : 'd')]]);
      return { P: P, sec: sec, largo: z[N_PASOS] };
    }
    /* la media vuelta, sobre el sitio y hacia su izquierda, en tres apoyos: el pie izquierdo se abre hacia atrás, el derecho lo rodea por
       delante (pasando por el aire) y el izquierdo se le junta. Sale de pie, mirando a +Z, con los tobillos en z = 0; acaba mirando a −Z, con los tobillos en z = 1 */
    function vuelta(base, pre) {
      var P = {}, izq = { suelo: [2, -12], rumbo: 96, abre: 0 };
      P[pre + '1'] = sobre(base, { pel: [1, PIE - 1.2, -2], giro: [48, 0, 0], pi: izq, pd: { suelo: [-SEP, 0], rumbo: 0, abre: 5 } });
      /* el pie derecho, a medio camino: en el aire y mirando ya de lado (así gira por el plano del suelo y no por debajo de él) */
      P[pre + 'm'] = sobre(base, { pel: [1.5, PIE - 1, -2.5], giro: [92, 0, 0], pi: izq, pd: { a: [-2, 15.5, 9], polo: [1, 0.1, 0.1] }, td: { punta: [0.99, -0.14, 0], arriba: [0.14, 0.99, 0] } });
      P[pre + '2'] = sobre(base, { pel: [2, PIE - 1.2, -3], giro: [136, 0, 0], pi: izq, pd: { suelo: [SEP, 1], rumbo: 180, abre: 5 } });
      return { P: P, sec: [[pre + '1', 0.32, 'suave', ['td']], [pre + 'm', 0.19, 'entra', ['ti']], [pre + '2', 0.19, 'sale', ['ti']]] };
    }
    /* todo el paseo: ida (a…), media vuelta (g…), vuelta (v…) y otra media vuelta (h…), que lo deja como empezó. Devuelve las posturas,
       ya en el mundo, y los cuatro trozos de la secuencia */
    function paseo(base) {
      var A = tramo(base, 'a'), V = tramo(base, 'v'), G = vuelta(base, 'g'), H = vuelta(base, 'h'), P = {}, n, L = A.largo;
      for (n in A.P) P[n] = enMarco(A.P[n], 0, 0);
      for (n in G.P) P[n] = enMarco(G.P[n], 0, L);
      for (n in V.P) P[n] = enMarco(V.P[n], 180, L + 1);
      for (n in H.P) P[n] = enMarco(H.P[n], 180, 1);
      /* al acabar cada media vuelta está en la primera postura del tramo siguiente */
      return { P: P, ida: A.sec, giro1: G.sec.concat([['v0', 0.32, 'suave', ['td']]]), regreso: V.sec, giro2: H.sec.concat([['a0', 0.32, 'suave', ['td']]]), largo: L };
    }
    /* cómo se agacha a coger lo que espera en el suelo, a cada lado: la cadera baja y va hacia atrás, y el tronco se inclina, lo justo (se
       busca) para que el hombro quede a un brazo del agarre g */
    function aCoger(base, g, polo, k) {
      var Pg = function (x) { return sobre(base, { pel: [0, PIE - x, 3 - 0.42 * x], giro: [0, 12 + 0.8 * x, 0], cab: [-(8 + 0.5 * x), 0, 0], p: { suelo: [SEP + 2, 0], abre: 12, polo: [0.4, 0.1, 1] } }); };
      var x = busca(function (q) { return largo(menos(resolver(Pg(q)).i.hom, g)); }, BRAZO - 0.8, 8, 60);
      /* (22-11-2026) a medio agacharse (k, la parte del camino): las manos, ya por fuera de los muslos, encima de lo que van a coger. De
         un tirón desde el costado, la mano cruzaba el muslo por dentro y había que rodearlo: en los primeros cuadros se iba hacia atrás
         de golpe (9 cm en 0,17 s) y el codo, con el brazo casi recto, cambiaba de lado */
      if (k) { var Q = Pg(k * x); return conAgarre(Q, [g[0], resolver(Q).i.hom[1] - 50, g[2]], polo || [1, 0.3, -0.5]); }
      return conAgarre(Pg(x), g, polo || [1, 0.3, -0.5]);
    }
    var NEUTRA = { tipo: 'puno', prono: 0 }, AL_CUERPO = { tipo: 'puno', palma: [-1, 0, 0] };
    var CARGA = { b: aLosLados(5), m: NEUTRA };       /* los brazos colgando a los lados, con una mancuerna en cada mano */

    /* el paseo del granjero: coge una mancuerna en cada mano (esperan en el suelo, a los lados) y deja los brazos colgando, con las pesas
       junto a la cadera; con la espalda recta, anda el tramo; y al llegar da la vuelta y regresa al punto de partida sin soltarlas */
    COREO['paseo-granjero'] = (function () {
      var W = paseo(CARGA), R = [26, 6.6, 6], P = W.P;
      P.s = { pel: [0, PIE, 3], p: { suelo: [SEP, 0], abre: 5 }, b: aLosLados(8), m: SUELTA };
      P.g = aCoger({ m: AL_CUERPO }, R); P.g0 = aCoger({ m: AL_CUERPO }, R, null, 0.4);
      return {
        vista: [[-38, 14], [142, 12]], reposo: ['s', 'g0'],
        material: [['mancuernas', { reposo: { i: R, d: [-R[0], R[1], R[2]] } }]],
        posturas: P, inicio: 's', encuadra: ['s', 'g', 'a0', 'af', 'v0', 'vf'],
        pasos: [{ sec: [['s', 0.6], ['g0', 0.6, 'entra', T2], ['g', 0.85, 'sale', T2], ['g', 0.3, null, T2], ['a0', 1.4, 'suave', T2]], desde: 's' },
                { sec: W.ida, desde: 'a0' },
                { sec: W.giro1.concat(W.regreso, W.giro2), desde: 'af' }]
      };
    })();
    /* con toalla: enrolla una toalla en el asa de cada mancuerna (esperan en el suelo con la toalla caída encima: al cerrar la mano sobre
       ella se enrolla), para que el agarre sea más grueso; las coge por la toalla y deja los brazos colgando; y anda con la espalda recta */
    COREO['paseo-granjero-toalla'] = (function () {
      var W = paseo(CARGA), R = [33, 6.6, 9], P = W.P;
      P.s = { pel: [0, PIE, 3], p: { suelo: [SEP, 0], abre: 5 }, b: aLosLados(8), m: SUELTA };
      P.k1 = aCoger({ m: { tipo: 'abierta', palma: [-1, 0, 0] } }, [R[0], R[1] + 5.4, R[2]]);
      P.k0 = aCoger({ m: { tipo: 'abierta', palma: [-1, 0, 0] } }, [R[0], R[1] + 5.4, R[2]], null, 0.4);
      P.k2 = aCoger({ m: AL_CUERPO }, R);
      return {
        vista: [[-38, 14], [142, 12]], reposo: ['s', 'k0', 'k1'],
        material: [['mancuernas', { toalla: true, reposo: { i: R, d: [-R[0], R[1], R[2]] } }]],
        posturas: P, inicio: 'a0', encuadra: ['s', 'k1'],
        rep: W.ida.concat(W.giro1, W.regreso, W.giro2),
        pasos: [{ sec: [['s', 0.8], ['k0', 0.7, 'entra', T2], ['k1', 1.0, 'sale', T2], ['k1', 0.3, null, T2], ['k2', 1.6, 'suave', T2]], desde: 's' },
                { sec: [['k2', 0.4, null, T2], ['a0', 1.5, 'suave', T2]], desde: 'k2' }, 'rep']
      };
    })();
    /* agarrando la mancuerna por un extremo: las dos esperan de pie en el suelo, a los lados; las coge por el disco de arriba, con la mano
       en garra, y las deja colgando junto al cuerpo; y anda con la espalda recta, sin dejar que se le escurran */
    COREO['paseo-mancuerna-por-extremo'] = (function () {
      var GARRA = { tipo: 'yemas', prono: 0 }, base = { b: { e: 13, z: 90, g: 90, c: 4 }, m: GARRA };
      var W = paseo(base), R = [31, 13.2, 6], P = W.P;
      P.s = { pel: [0, PIE, 3], p: { suelo: [SEP, 0], abre: 5 }, b: aLosLados(8), m: SUELTA };
      /* la mano, sobre el disco de arriba (su centro, a 10,5 de la mitad de la mancuerna): el centro del agarre queda 5 cm por encima de él y
         1 hacia fuera (el disco va adonde llegan las yemas: a 13 de la muñeca) */
      P.g = aCoger({ m: { tipo: 'yemas', palma: [-1, 0, 0] } }, [R[0] + 1, R[1] + 10.5 + 5, R[2]]); P.g0 = aCoger({ m: { tipo: 'yemas', palma: [-1, 0, 0] } }, [R[0] + 1, R[1] + 10.5 + 5, R[2]], null, 0.4);
      return {
        vista: [[-38, 14], [142, 12]], reposo: ['s', 'g0'],
        material: [['mancuernas', { extremo: true, radio: 5.6, reposo: { i: R, d: [-R[0], R[1], R[2]] }, ejeReposo: [0, 1, 0] }]],
        posturas: P, inicio: 'a0', encuadra: ['s', 'g'],
        rep: W.ida.concat(W.giro1, W.regreso, W.giro2),
        pasos: [{ sec: [['s', 0.6], ['g0', 0.6, 'entra', T2], ['g', 0.85, 'sale', T2], ['g', 0.3, null, T2], ['a0', 1.5, 'suave', T2]], desde: 's' }, 'rep']
      };
    })();

    /* ══════════ la dominada con toallas ══════════
       Dos toallas pasadas por encima de la barra (a 225 cm): cuelgan hasta 182, que es adonde llega de pie. Las agarra con las palmas
       enfrentadas, con el centro del puño a 190; se cuelga con los brazos estirados (las rodillas dobladas: los pies no llegan al suelo),
       sube tirando de ellas hasta que la barbilla llega a la altura de las manos y baja con control hasta estirar los brazos */
    COREO['dominada-con-toallas'] = (function () {
      /* la palma, hacia dentro y algo hacia delante: al subir, con el antebrazo ya inclinado, la mano que abraza la toalla solo puede mirar
         hacia delante o hacia atrás, y «hacia dentro» a secas no decía cuál (según se inclinara el antebrazo un pelo adelante o atrás, la
         mano daba media vuelta de golpe: dos veces en cada repetición). Con los codos abiertos, mira hacia delante */
      var G = 22, YG = 190, m = { tipo: 'puno', barra: [0, 1, 0], palma: [-1, 0, 0.6] }, ag = [G, YG, 0];
      var yCuelga = function (hom) { return YG - Math.sqrt((BRAZO - 0.3) * (BRAZO - 0.3) - (G - D.hombroX) * (G - D.hombroX)) - 43.5 - hom; };
      var colgado = { p: { e: 10, z: 0, c: 84 }, t: { tob: 22 }, m: m }, brazos = { a: [G, YG - D.mano, 0], polo: [1, -0.2, 0.5] };
      var tira = function (s) { return { de: [s * G, 226.7, 0], a: s > 0 ? 'i' : 'd', cola: 7, reposo: [s * G, YG - 8, 0], sobre: [0, 225, 0] }; };
      return {
        vista: [[24, 10], [152, 12]], rastro: 'barbilla', esfuerzo: [1], clavos: ['mi@1:' + G, 'md@1:' + (-G)], sinClavos: ['s'], reposo: ['s'],
        material: [barraD(), ['toallas', { ancho: 5.5, agarreY: YG, tiras: [tira(1), tira(-1)] }]],
        posturas: {
          s: { pel: [0, PIE, -2], cab: [-22, 0, 0], p: { suelo: [10, -2], abre: 6 }, b: aLosLados(8), m: SUELTA },
          g: conAgarre({ pel: [0, PIE, -2], cab: [-14, 0, 0], hom: [3.5, 0], p: { suelo: [10, -2], abre: 6 }, m: m }, ag, [1, -0.2, 0.5]),
          h: sobre(colgado, { pel: [0, yCuelga(3.5), -2], hom: [3.5, 0], b: brazos }),
          a2: sobre(colgado, { pel: [0, yCuelga(-2), -2], hom: [-2, -1.5], col: [-3, 0, 0], b: { a: brazos.a, polo: [1, -0.3, 0.4] } }),
          b: sobre(colgado, { pel: [0, YG - 53, -11], giro: [0, -8, 0], hom: [-2, -1.5], col: [-3, 0, 0], cab: [6, 0, 0], b: { a: brazos.a, polo: [1, -1, 0.1] } })
        },
        inicio: 'a2', encuadra: ['s', 'g'],
        rep: [['a2', 0.5], ['b', 1.4, 'empuje'], ['b', 0.45], ['a2', 2.0, 'freno']],
        pasos: [{ sec: [['s', 0.7, null, T2], ['g', 1.3, 'suave', T2]], desde: 's' }, 'rep', 'rep']
      };
    })();

    /* ══════════ las flexiones sobre las yemas de los dedos ══════════
       En plancha alta, con las manos bajo los hombros y los dedos bien separados; levanta las palmas poco a poco hasta apoyarse solo en las
       yemas y los pulgares (la mano, en tienda: la muñeca sube de 3 a 10 cm del suelo y el cuerpo con ella); y, con el cuerpo recto,
       baja el pecho doblando los codos y empuja para subir. Las manos no se mueven del suelo: en cada postura se les da el giro que haga
       falta para que sigan igual (manoHacia) */
    COREO['flexiones-yemas-dedos'] = (function () {
      var polo = [0.55, 0.25, -1], W0 = [19, 3, 13.3], W1 = [19, 10, 12.4];
      var sen = function (g) { return Math.sin(g * RAD); }, cos = function (g) { return Math.cos(g * RAD); };
      var mano = function (P, tipo, cae) {
        var d = [0, -sen(cae), cos(cae)], q = [0, -cos(cae), -sen(cae)];
        return sobre(P, { mi: manoHacia(P, 'i', d, q, tipo), md: manoHacia(P, 'd', d, q, tipo) });
      };
      var tab = function (w, extra) { return function (x) { return tabla(x, sobre({ b: { a: w, polo: polo } }, extra || {})); }; };
      var p0 = mano(aUnBrazo(tab(W0), W0, 8, 34), 'separados', 0.5), a = mano(aUnBrazo(tab(W1), W1, 8, 34), 'yemas', 10);
      var b = mano(tab(W1, { cab: [-24, 0, 0] })(5.4), 'yemas', 10);
      return {
        vista: [78, [32, 34]], picado: 16, rastro: 'pecho', esfuerzo: [2], clavos: ['mi', 'md', 'ti', 'td'],
        posturas: { p: p0, a: a, b: b },
        inicio: 'a', encuadra: ['p'],
        rep: bajaSube('b', 'a', [1.7, 0.2, 1.1, 0.5]),
        pasos: ['p', { sec: [['a', 2.6, 'suave']], desde: 'p' }, 'rep']
      };
    })();

    /* ══════════ los estiramientos de la muñeca ══════════ */
    var DE_PIE_E = { pel: [0, PIE, 0], p: { suelo: [10, 0], abre: 6 } };
    /* El brazo izquierdo, estirado hacia delante con el codo recto: Jérôme tiene los brazos cortos, así que el brazo va algo hacia dentro
       (lo justo, se busca) para que la otra mano llegue a cogerle la mano. o.palma: 1, la palma hacia arriba (la otra mano la sujeta por
       la palma y lleva la muñeca hacia atrás: los flexores); −1, hacia abajo (la otra mano presiona el dorso y la dobla hacia abajo: los
       extensores). o.mun: cuánto se dobla */
    function estiraMuneca(o) {
      var libre = sobre(DE_PIE_E, { bd: aLosLados(10), md: SUELTA }), girado = sobre(DE_PIE_E, { hom: { i: [0, 0], d: [0, 3.5] }, col: [0, 0, 6], cab: [4, 0, -6] });
      /* la mano izquierda se dice en el mundo: hacia dónde mira la palma antes de doblar la muñeca (hacia arriba o hacia abajo) y cuánto se
         dobla: con el codo recto, el antebrazo no sabría decirlo */
      var mano = function (mun) { return { tipo: 'plana', palma: [0, o.palma, 0], mun: mun }; };
      var hacer = function (x) {
        var Q = [x, 113, 44], brazo = function (P) { return estirado(P, Q, 'bi', 0.25, [0.4, -1, -0.2]); };
        var coge = function (mun) {
          var P = sobre(brazo(girado), { mi: mano(mun) }), L = resolver(P).i, g = mas(L.mun, mas(por(L.mano.dir, 8.5), por(L.mano.palma, 1.7 * o.palma)));
          var dirD = L.mano.eje[0] > 0 ? L.mano.eje : por(L.mano.eje, -1), palD = por(L.mano.palma, -o.palma);
          var Pd = sobre(P, { bd: { a: menos(g, por(dirD, D.mano)), polo: [-0.5, -1, 0.2] } });
          /* la mano que ayuda no cruza la otra en ángulo recto (la muñeca se ladearía casi 50°): va en diagonal, a medio camino entre
             atravesarla y seguir su propio antebrazo */
          dirD = unidad(mas(dirD, por(unidad(sinParte(resolver(Pd).d.lw, palD)), 0.6)));
          Pd = sobre(P, { bd: { a: menos(g, por(dirD, D.mano)), polo: [-0.5, -1, 0.2] } });
          return sobre(Pd, { md: manoHacia(Pd, 'd', dirD, palD, 'suelta') });
        };
        return { a: sobre(brazo(libre), { mi: mano(0) }), c: coge(0), b: coge(o.mun) };
      };
      /* cuánto le falta a la mano derecha para llegar, en la peor de las dos posturas en que coge */
      var falta = function (x) { var K = hacer(x), r = 0; ['c', 'b'].forEach(function (n) { r = Math.max(r, largo(menos(K[n].bd.a, resolver(K[n]).d.hom))); }); return r; };
      return hacer(busca(falta, D.brazo + D.antebrazo - 1.6, -16, 12));
    }
    /* los flexores: estira el brazo con el codo recto; con la otra mano sujeta la palma y lleva la muñeca hacia atrás; y mantiene */
    COREO['estiramiento-flexores-muneca'] = (function () {
      var K = estiraMuneca({ palma: 1, mun: -68 });
      return {
        vista: [[58, 14], [-38, 12]], isometrico: 'b', clavos: T2,
        posturas: K, inicio: 'a', encuadra: ['b'],
        pasos: ['a', { sec: [['c', 1.3, 'suave'], ['c', 0.3], ['b', 1.9, 'suave']], desde: 'a' }, 'b']
      };
    })();
    /* los extensores: estira el brazo con el codo recto; con la otra mano presiona el dorso de la mano para doblar la muñeca hacia abajo;
       mantiene unos segundos y suelta despacio */
    COREO['estiramiento-extensores-muneca'] = (function () {
      var K = estiraMuneca({ palma: -1, mun: 70 });
      return {
        vista: [[58, 14], [-38, 12]], isometrico: 'b', clavos: T2,
        posturas: K, inicio: 'a', encuadra: ['b'],
        pasos: ['a', { sec: [['c', 1.3, 'suave'], ['c', 0.3], ['b', 1.9, 'suave']], desde: 'a' }, { sec: [['b', 2.2], ['c', 1.7, 'suave'], ['a', 1.0, 'suave']], desde: 'b' }]
      };
    })();
    /* en posición de oración: junta las palmas delante del pecho; sin separarlas, baja las manos poco a poco (los codos se abren y los
       antebrazos se acercan a la horizontal: la muñeca pasa de 51° a 80° de extensión); mantiene unos segundos y vuelve a subirlas.
       Los antebrazos van en el plano de las manos (el codo, a la misma distancia por delante que la muñeca): así las palmas siguen
       juntas, una contra otra, y lo único que cambia es cuánto se dobla la muñeca */
    COREO['estiramiento-oracion'] = (function () {
      var ZM = 14, XM = 2.3, h = resolver(DE_PIE_E).i.hom;
      var en = function (fuera, sube) {
        var C = [h[0] + fuera, h[1] - Math.sqrt(D.brazo * D.brazo - (ZM - h[2]) * (ZM - h[2]) - fuera * fuera), ZM], dx = C[0] - XM;
        var W = [XM, C[1] + sube * Math.sqrt(D.antebrazo * D.antebrazo - dx * dx), ZM];
        var P = sobre(DE_PIE_E, { b: { a: W, polo: menos(C, h) } }), arriba = [0, 1, 0];
        return sobre(P, { mi: manoHacia(P, 'i', arriba, [-1, 0, 0], 'plana'), md: manoHacia(P, 'd', arriba, [1, 0, 0], 'plana') });
      };
      return {
        vista: [[24, 12], [78, 12]], isometrico: 'b', clavos: T2,
        posturas: { s: sobre(DE_PIE_E, { b: aLosLados(8), m: SUELTA }), a: en(2, 1), b: en(6.9, 1) },
        inicio: 'a', encuadra: ['s', 'b'],
        pasos: [{ sec: [['s', 0.5], ['a', 1.5, 'suave']], desde: 's' }, { sec: [['b', 2.8, 'suave']], desde: 'a' }, { sec: [['b', 1.9], ['a', 1.8, 'suave']], desde: 'b' }]
      };
    })();

    /* ══════════════════════════════ LA PANTORRILLA ══════════════════════════════ */

    /* las manos en la pared de delante, a la altura del pecho, apoyadas de plano y con los dedos hacia arriba (70-coreografias.js,
       PLANA_PARED): la muñeca, en z = 43,5, y la cara de la pared, a ALTO_MUN de ella */
    var PARED = ['pared', { z: 43.5 + ALTO_MUN, normal: [0, 0, -1], ancho: 130 }], EN_PARED = { a: [17, 120, 43.5], polo: [0.7, -1, -0.5] }, M_PARED = PLANA_PARED;
    var MI_MD = ['mi', 'md'], K_I = ['mi', 'md', 'ti'], K_D = ['mi', 'md', 'td'], K_2 = ['mi', 'md', 'ti', 'td'];
    /* la pierna que no apoya: la rodilla doblada y el pie atrás, en el aire */
    var RECOGIDA = { e: 12, z: 0, c: 76 }, PIE_SUELTO = { tob: 22 };

    /* ══════════ de pie: elevaciones de talón ══════════ */
    var SUBE = 44;        /* «todo lo que pueda» */
    /* a una pierna, con las manos en la pared: levanta un pie; con la rodilla de apoyo estirada y el cuerpo erguido, sube el talón todo lo
       que puede; una pausa, baja despacio; y repite con la otra pierna */
    COREO['elevacion-talon-una-pierna'] = (function () {
      var q = deTalon(SUBE), base = { b: EN_PARED, m: M_PARED };
      var d = sobre(base, { pel: [0, PIE, 0], p: { suelo: [9, 0], abre: 5 } });
      var dq = sobre(base, { pel: [1.2, PIE, 0], pi: { suelo: [9, 0], abre: 5 }, pd: enPunta(-9, 28) });
      var dp = sobre(base, { pel: [2.5, PIE, 0], pi: { suelo: [9, 0], abre: 5 }, pd: enPunta(-9) });
      var a = sobre(base, { pel: [4, PIE, 0], pi: { suelo: [9, 0], abre: 5 }, pd: RECOGIDA, td: PIE_SUELTO });
      var b = sobre(base, { pel: [4, PIE + q[1], q[0]], pi: { suelo: [9, 0], abre: 5, talon: SUBE }, pd: RECOGIDA, td: PIE_SUELTO });
      return {
        vista: [[100, 10], [146, 12]], rastro: 'tli', esfuerzo: [0, 1], clavos: K_I,
        material: [PARED],
        posturas: { d: d, dq: dq, dp: dp, a: a, b: b, dq2: refleja(dq), dp2: refleja(dp), a2: refleja(a), b2: refleja(b) },
        inicio: 'a', encuadra: ['d'],
        rep: [['b', 1.3, 'suave'], ['b', 0.5], ['a', 1.7, 'freno'], ['a', 0.35]],
        pasos: [{ sec: [['d', 0.5, null, K_2], ['dq', 0.2, 'entra', K_2], ['dp', 0.25, 'sale', K_2], ['a', 0.7, 'suave', K_I]], desde: 'd' }, 'rep',
                { sec: [['b', 0.4, null, K_I], ['a', 1.5, 'freno', K_I], ['dp', 0.35, 'suave', K_I], ['dq', 0.12, 'entra', K_2], ['d', 0.13, 'sale', K_2], ['dq2', 0.14, 'entra', K_2], ['dp2', 0.16, 'sale', K_2], ['a2', 0.4, 'suave', K_D], ['b2', 1.2, 'suave', K_D]], desde: 'b' }]
      };
    })();
    /* con bajada a una pierna: sube de puntillas con los dos pies; pasa el peso a una pierna, levanta la otra y aguanta arriba un momento;
       baja despacio sobre esa pierna hasta apoyar el talón; y repite cambiando de lado */
    COREO['elevacion-talones-bajada-una-pierna'] = (function () {
      var q = deTalon(SUBE), base = { b: EN_PARED, m: M_PARED }, pies = function (t) { return { suelo: [9, 0], abre: 5, talon: t }; };
      var d = sobre(base, { pel: [0, PIE, 0], p: pies(0) }), u2 = sobre(base, { pel: [0, PIE + q[1], q[0]], p: pies(SUBE) });
      var u1 = sobre(base, { pel: [4, PIE + q[1], q[0]], pi: pies(SUBE), pd: RECOGIDA, td: PIE_SUELTO });
      var l1 = sobre(base, { pel: [4, PIE, 0], pi: pies(0), pd: RECOGIDA, td: PIE_SUELTO });
      var p1 = sobre(base, { pel: [2.5, PIE, 0], pi: pies(0), pd: enPunta(-9) });           /* el pie que baja se posa por la punta… */
      var q1 = sobre(base, { pel: [1.2, PIE, 0], pi: pies(0), pd: enPunta(-9, 28) });       /* …y rueda hasta el talón */
      return {
        vista: [[100, 10], [146, 12]], rastro: 'tli', esfuerzo: [0, 7], clavos: K_2,
        material: [PARED],
        posturas: { d: d, u2: u2, u1: u1, l1: l1, p1: p1, q1: q1, v1: refleja(u1), m1: refleja(l1), r1: refleja(p1), s1: refleja(q1) },
        inicio: 'u1', encuadra: ['d'],
        rep: [['l1', 2.1, 'freno', K_I], ['p1', 0.3, 'suave', K_I], ['q1', 0.12, 'entra', K_2], ['d', 0.13, 'sale', K_2], ['u2', 1.0, 'suave', K_2], ['v1', 0.8, 'suave', K_D], ['v1', 0.45, null, K_D],
              ['m1', 2.1, 'freno', K_D], ['r1', 0.3, 'suave', K_D], ['s1', 0.12, 'entra', K_2], ['d', 0.13, 'sale', K_2], ['u2', 1.0, 'suave', K_2], ['u1', 0.8, 'suave', K_I], ['u1', 0.45, null, K_I]],
        pasos: [{ sec: [['d', 0.5, null, K_2], ['u2', 1.2, 'suave', K_2]], desde: 'd' }, { sec: [['u1', 0.9, 'suave', K_I]], desde: 'u2' }, 'rep']
      };
    })();

    /* ── en el escalón (20 cm): la parte delantera del pie en el borde, el talón en el aire ── */
    var ALTO_E = 20, ESCALON = ['escalon', { med: [86, ALTO_E, 40], en: [0, 19.5] }], Z_PIE = -10;
    function enBorde(x, talon) { return { suelo: [x, Z_PIE], abre: 3, alto: ALTO_E, talon: talon }; }
    /* a una pierna: el otro pie, cruzado por detrás del tobillo del que apoya (va con él: sube y se adelanta lo mismo). Sube el talón tanto
       como le resulte cómodo, una pausa, y baja despacio; y repite con la otra pierna. Los brazos, algo abiertos: aquí no se sujeta a nada */
    COREO['elevacion-talon-una-pierna-escalon'] = (function () {
      var brazos = { b: { e: 17, z: 86, g: 80, c: 16 }, m: SUELTA };
      var en = function (talon) {
        var q = deTalon(talon), P = sobre(brazos, { pel: [4, PIE + ALTO_E + q[1] - 0.4, Z_PIE + q[0]], pi: enBorde(9, talon) }), t = resolver(P).i.tob;
        return sobre(P, { pd: { a: [t[0] - 3.5, t[1] + 6.5, t[2] - 9.5], polo: [-0.5, 0, 1] }, td: { tob: 34 } });
      };
      var d = sobre(brazos, { pel: [0, PIE + ALTO_E - 0.4, Z_PIE], p: enBorde(9, 0) }), a = en(0), b = en(40);
      return {
        vista: [[100, 10], [150, 14]], rastro: 'tli', esfuerzo: [0, 1], clavos: ['ti'],
        material: [ESCALON],
        posturas: { d: d, a: a, b: b, a2: refleja(a), b2: refleja(b) },
        inicio: 'a', encuadra: ['d'],
        rep: [['b', 1.3, 'suave'], ['b', 0.55], ['a', 1.8, 'freno'], ['a', 0.35]],
        pasos: [{ sec: [['d', 0.5, null, T2], ['a', 1.3, 'suave', ['ti']]], desde: 'd' }, 'rep',
                { sec: [['b', 0.4, null, ['ti']], ['a', 1.5, 'freno', ['ti']], ['d', 0.6, 'suave', ['ti']], ['a2', 0.7, 'suave', ['td']], ['b2', 1.2, 'suave', ['td']]], desde: 'b' }]
      };
    })();
    /* con una mancuerna en una mano: la otra mano se apoya de plano en la pared, que queda delante, justo pasado el escalón (la muñeca, a
       z = 37,5, y la cara de la pared, a ALTO_MUN de ella). Sube los talones tanto como
       le resulte cómodo, una pausa, y baja despacio hasta notar el estiramiento (los talones, por debajo del escalón) */
    COREO['elevacion-talones-escalon-mancuerna'] = (function () {
      var enPared = { a: [-17, PIE + ALTO_E + 34, 37.5], polo: [-0.7, -1, -0.4] }, K = ['ti', 'td', 'md'];
      var en = function (talon, extra) { var q = deTalon(talon); return sobre({ pel: [0, PIE + ALTO_E + q[1] - 0.4, Z_PIE + q[0]], p: enBorde(10, talon), bi: aLosLados(5), mi: NEUTRA }, extra); };
      var apoyada = { bd: enPared, md: M_PARED };
      return {
        vista: [[104, 10], [152, 14]], rastro: 'tli', esfuerzo: [3], clavos: K, clavosEn: { s: ['ti', 'td'] },      /* en s la mano aún cuelga suelta */
        material: [ESCALON, ['pared', { z: 37.5 + ALTO_MUN, normal: [0, 0, -1], ancho: 130 }], ['mancuernas', { lado: 'i' }]],
        posturas: { s: en(0, { bd: aLosLados(8), md: SUELTA }), n: en(0, apoyada), a: en(-9, apoyada), b: en(40, apoyada) },
        inicio: 'b', encuadra: ['s', 'a'],
        rep: [['b', 0.5], ['a', 1.9, 'freno'], ['a', 0.35], ['b', 1.3, 'suave']],
        pasos: ['s', { sec: [['n', 1.0, 'suave', K], ['b', 1.3, 'suave', K]], desde: 's' }, 'rep']        /* la mano va derecha a la pared: no se pasa */
      };
    })();
    /* con barra: la saca del soporte apoyada en la parte alta de la espalda, retrocede y separa los pies a la anchura de la cadera; con el
       pecho alto y las rodillas un poco flexionadas, empuja con la parte delantera de los pies y sube los talones; una pausa arriba, y baja
       despacio. El soporte queda delante: sus ganchos miran hacia él, y al retroceder se aleja de los postes */
    COREO['elevacion-talones-barra'] = (function () {
      var atras = -34, q = deTalon(42), mb = { a: [34, 21, -9], en: 'torax', polo: [0.6, -1, -0.5] }, M = ['mi@1:34', 'md@1:-34'];
      var pies = function (z, t) { return { suelo: [10, z], abre: 6, talon: t || 0 }; }, alta = { hom: [0, -1.5], b: mb, m: PRONO };
      return {
        vista: [[142, 10], [40, 14]], rastro: 'tli', esfuerzo: [0, 1], clavos: ['ti', 'td', 'mi@1:34', 'md@1:-34'],
        material: [['soporte', { z: -6, alto: 128.5, ancho: 56, haciaAtras: true }], ['barra', { ancla: 'torax', en: [0, 23, -9.5], discos: 17 }]],
        posturas: {
          sop: { pel: [0, 82, 0], p: pies(0), b: mb, m: PRONO },
          arr: sobre(alta, { pel: [0, PIE, 0], p: pies(0) }),
          p1: sobre(alta, { pel: [0, PIE - 2.2, atras / 2], pi: pies(0), pd: { suelo: [-10, atras], abre: 6 } }),
          a: sobre(alta, { pel: [0, PIE - 0.6, atras], p: pies(atras) }),
          b: sobre(alta, { pel: [0, PIE - 0.6 + q[1], atras + q[0]], p: pies(atras, 42) })
        },
        inicio: 'a', encuadra: ['sop'],
        rep: [['b', 1.3, 'empuje'], ['b', 0.7], ['a', 1.9, 'freno'], ['a', 0.4]],
        pasos: [{ sec: [['sop', 0.7], ['arr', 0.9, 'suave', M.concat(T2)], ['p1', 0.7, 'suave', M.concat(['ti'])], ['a', 0.7, 'suave', M.concat(['td'])]], desde: 'sop' }, 'rep', 'rep']
      };
    })();

    /* ══════════ sentado: elevaciones de talón ══════════
       En el extremo de un banco (la cadera, a 55 cm del suelo). Con los pies en un bloque o en un escalón bajo, la bola del pie se apoya 3 cm
       dentro de su borde y el talón queda en el aire; la rodilla, en ángulo recto. Lo que se lleva sobre los muslos (una barra, unas
       mancuernas, los codos) sube y baja con las rodillas: en cada postura se coloca sobre el muslo tal como queda */
    var BLOQUE = 10, Z_TOB = 40;                  /* el alto del bloque; y dónde cae el tobillo con la espinilla a plomo */
    function bloque(madera, ancho) { return ['escalon', { med: [ancho || 70, BLOQUE, 24], en: [0, Z_TOB + 12 - 3 + 12], madera: madera }]; }
    function pieEnBloque(x, talon) { return { suelo: [x, Z_TOB], abre: 4, alto: BLOQUE, talon: talon, polo: [0.1, 1, 0.4] }; }
    function pieEnSuelo(x, z, talon) { return { suelo: [x, z == null ? 30 : z], abre: 5, talon: talon || 0, polo: [0.1, 1, 0.4] }; }
    function sentadoEn(inc, extra) { return sobre({ pel: [0, 55, 0], giro: [0, inc, 0], cab: [-inc * 0.5, 0, 0] }, extra || {}); }
    /* y en un banco bajo (35 cm), con los pies en el suelo: la cadera queda a la altura de las rodillas y la espinilla a plomo, que es como
       las rodillas hacen ángulo recto con los pies planos (en el banco de 44, a Jérôme los muslos le bajan hacia las rodillas) */
    var BANCO_BAJO = ['banco', { en: [0, -20], largo: 96, alto: 35 }], Y_BAJO = D.tobillo + D.pierna;
    function sentadoBajo(inc, extra) { return sobre({ pel: [0, Y_BAJO, 0], giro: [0, inc, 0], cab: [-inc * 0.5, 0, 0] }, extra || {}); }
    function pieBajo(x, talon) { return { suelo: [x, D.muslo], abre: 5, talon: talon || 0, polo: [0.1, 1, 0.4] }; }

    /* con barra: un bloque delante del banco y la barra apoyada sobre los muslos (las manos la sujetan encima); apoya la parte delantera de
       los pies en el bloque; y sube y baja los talones despacio todo lo que puede, sin que los pies se separen del bloque */
    COREO['elevacion-talones-sentado-barra'] = (function () {
      var G = 27, mano = { tipo: 'puno', barra: [1, 0, 0], palma: [0, -1, 0] };
      var con2 = function (piernas) {
        var P = sentadoEn(10, sobre(piernas, { m: mano })), c = puntoEnMuslo(P, 31, 9.4);
        return conAgarre(P, [G, c[1], c[2]], [1, 0.2, -0.8]);
      };
      var s = con2({ p: pieEnSuelo(12, 28) }), f1 = con2({ pi: pieEnBloque(12, 0), pd: reflejo(pieEnSuelo(12, 28)) }), n = con2({ p: pieEnBloque(12, 0) });
      return {
        vista: [[70, 10], [26, 16]], rastro: 'tli', esfuerzo: [0, 1], clavos: T2,
        material: [BANCO_DETRAS, bloque(true), ['barra', { largo: 150, discos: 13 }]],
        posturas: { s: s, f1: f1, n: n, a: con2({ p: pieEnBloque(12, -15) }), b: con2({ p: pieEnBloque(12, 34) }) },
        inicio: 'a', encuadra: ['s'],
        rep: [['b', 1.6, 'suave'], ['b', 0.4], ['a', 1.9, 'freno'], ['a', 0.4]],
        pasos: ['s', { sec: [['f1', 0.8, 'suave', ['td']], ['n', 0.8, 'suave', ['ti']]], desde: 's' }, 'rep']
      };
    })();
    /* con mancuernas: la parte delantera de los pies, en el borde de un escalón bajo; coloca las mancuernas de pie sobre las rodillas (hasta
       entonces las lleva en las manos, a los lados) y sube los talones tanto como le resulte cómodo; una pausa, y baja despacio */
    var DE_PIE_EN_MANO = { tipo: 'puno', barra: [0, 1, 0], palma: [-1, 0, 0] };      /* la mano que sujeta una mancuerna puesta de pie */
    function mancuernaEnRodilla(P, k, polo) { var c = puntoEnMuslo(P, 33, 7.2 + 13.2, k === 'bd' ? 'd' : 'i'); return conAgarre(P, c, polo || [k === 'bd' ? -1 : 1, -0.6, -0.8], k); }
    COREO['elevacion-talones-sentado-mancuernas'] = (function () {
      var en = function (talon) { var P = sentadoEn(12, { p: pieEnBloque(12, talon), m: DE_PIE_EN_MANO }), c = puntoEnMuslo(P, 33, 7.2 + 13.2); return conAgarre(P, c, [1, -0.6, -0.8]); };
      return {
        vista: [[66, 10], [24, 16]], rastro: 'tli', esfuerzo: [3], clavos: T2,
        material: [BANCO_DETRAS, ['escalon', { med: [80, BLOQUE, 30], en: [0, Z_TOB + 12 - 3 + 15] }], ['mancuernas']],
        posturas: { s: sentadoEn(4, { p: pieEnBloque(12, 0), b: { e: 11, z: 90, g: 90, c: 5 }, m: NEUTRA }), a: en(0), b: en(34) },
        inicio: 'b', encuadra: ['s', 'a'],
        rep: [['b', 0.5], ['a', 1.8, 'freno'], ['a', 0.35], ['b', 1.3, 'suave']],
        pasos: ['s', { sec: [['a', 1.5, 'suave'], ['a', 0.2], ['b', 1.3, 'suave']], desde: 's' }, 'rep']
      };
    })();
    /* a una pierna: una mancuerna de pie sobre un muslo, y la parte delantera de ese pie en un bloque; sube y baja el talón despacio todo lo
       que puede; al terminar, cambia la mancuerna de lado (se la pasa a la otra mano por delante) y repite con el otro pie */
    COREO['elevacion-talon-sentado-una-pierna'] = (function () {
      /* la mano que no lleva la mancuerna descansa en su muslo; del otro lado se vuelve a colocar (no se refleja: el ladeo de la muñeca
         no es el mismo número en una mano que en la otra) */
      var con1 = function (talon) { return mancuernaEnRodilla(sentadoEn(10, { pi: pieEnBloque(12, talon), pd: reflejo(pieEnSuelo(13, 27)), mi: DE_PIE_EN_MANO }), 'bi'); };
      var en = function (talon) { return enSuMuslo(con1(talon), 'd'); }, alReves = function (talon) { return enSuMuslo(refleja(con1(talon)), 'i'); };
      var s = en(0), a = en(-15), b = en(34);
      /* el cambio: los dos pies en el suelo y la mancuerna en el centro, por encima de los muslos; primero la tiene la izquierda (x) y, en
         el mismo sitio, la coge la derecha (x2) */
      var medio = [0, 82, 27], centro = sentadoEn(10, { p: pieEnSuelo(13, 27), m: DE_PIE_EN_MANO });
      var x = conAgarre(conAgarre(centro, medio, [1, -0.6, -0.6], 'bi'), medio, [-1, -0.6, -0.6], 'bd');
      return {
        vista: [[62, 10], [-30, 16]], rastro: 'tli', esfuerzo: [0, 1], clavos: T2,
        material: [BANCO_DETRAS, bloque(true), ['mancuernas', { lado: 'i', otra: 'd', reposo: {}, reposoEn: ['x2', 's2', 'b2'] }]],
        posturas: { s: s, a: a, b: b, x: x, x2: x, s2: alReves(0), b2: alReves(34) },
        inicio: 'a', encuadra: ['s'],
        rep: [['b', 1.6, 'suave'], ['b', 0.35], ['a', 1.9, 'freno'], ['a', 0.35]],
        pasos: ['s', 'rep', { sec: [['s', 0.5, 'suave'], ['x', 0.9, 'suave', []], ['x2', 0.05, null, []], ['s2', 0.9, 'suave', []], ['b2', 1.3, 'suave']], desde: 'a' }]
      };
    })();
    /* sin peso: sentado, con las rodillas en ángulo recto y los pies en el suelo; sube los talones cargando el peso sobre la base de los
       dedos gordos y los baja, a un ritmo cómodo; para aumentar la carga, apoya los codos en las rodillas y empuja hacia abajo */
    COREO['elevacion-talones-sentado'] = (function () {
      var en = function (talon) { return enSusMuslos(sentadoBajo(4, { p: pieBajo(12, talon) })); };          /* las manos, sobre los muslos */
      /* los codos, sobre los muslos junto a las rodillas (el codo, a 11,7 del eje del muslo): el tronco se inclina lo justo (se busca) */
      var conCodos = function (talon) {
        var piernas = { p: pieBajo(12, talon), m: SUELTA }, C = puntoEnMuslo(sentadoBajo(0, piernas), 35, 11.7);
        var inc = busca(function (g) { return largo(menos(resolver(sentadoBajo(g, piernas)).i.hom, C)); }, D.brazo, 10, 75), P = sentadoBajo(inc, sobre(piernas, { cab: [-inc * 0.6, 0, 0] }));
        return sobre(P, { b: flexion(P, C, 62, [-0.45, -0.25, 1]) });
      };
      return {
        vista: [[68, 10], [24, 16]], rastro: 'tli', esfuerzo: [0], clavos: T2,
        posturas: { a: en(0), b: en(33), c: conCodos(0), d: conCodos(33) },
        material: [BANCO_BAJO],
        rep: [['b', 1.0, 'suave'], ['b', 0.3], ['a', 1.2, 'suave'], ['a', 0.3]],
        pasos: ['a', 'rep', { sec: [['c', 1.2, 'suave'], ['d', 1.1, 'suave'], ['d', 0.45], ['c', 1.5, 'freno'], ['c', 0.3], ['d', 1.1, 'suave']], desde: 'a' }]
      };
    })();

    /* ══════════ el tibial: la punta del pie se levanta y el talón no se mueve ══════════
       enTalon(k, [x, z], g, abre): la pierna y el pie del lado k con el pie apoyado solo en el talón y la punta levantada g grados (gira
       sobre el canto de atrás del tacón); [x, z], dónde cae el tobillo con el pie plano */
    function enTalon(k, xz, g, abre) {
      var sg = k === 'i' ? 1 : -1, a = sg * (abre || 0) * RAD, pt = [Math.sin(a), 0, Math.cos(a)], c = Math.cos(g * RAD), sn = Math.sin(g * RAD);
      var canto = [xz[0] - pt[0] * 6.5, 0, xz[1] - pt[2] * 6.5], punta = [pt[0] * c, sn, pt[2] * c], arriba = [-pt[0] * sn, c, -pt[2] * sn];
      var tob = mas(canto, mas(por(punta, 6.5), por(arriba, D.tobillo)));
      tob[1] -= bajoZapa({ suela: menos(tob, por(arriba, D.tobillo)), punta: punta, arriba: arriba, flex: 0 }, k);       /* que el tacón, tal como se dibuja, toque el suelo justo */
      return { a: tob, punta: punta, arriba: arriba };
    }
    function piesEnTalon(x, z, g, abre, polo) {
      var i = enTalon('i', [x, z], g, abre), d = enTalon('d', [-x, z], g, abre);
      return { pi: { a: i.a, polo: polo }, pd: { a: d.a, polo: polo && [-polo[0], polo[1], polo[2]] }, ti: { punta: i.punta, arriba: i.arriba }, td: { punta: d.punta, arriba: d.arriba } };
    }
    /* de pie: erguido, levanta la parte delantera de los pies y se queda apoyado solo en los talones; y la baja despacio */
    COREO['elevacion-tibial-de-pie'] = (function () {
      var G = 20, t = enTalon('i', [10, 0], G, 6).a;
      return {
        vista: [[84, 10], [34, 12]], rastro: 'dpi', esfuerzo: [0, 1], clavos: T2,
        posturas: {
          a: { pel: [0, PIE, 0], p: { suelo: [10, 0], abre: 6 } },
          b: sobre({ pel: [0, PIE + t[1] - D.tobillo - 0.15, t[2] - 0.4], giro: [0, 2.5, 0], cab: [-2, 0, 0], b: { e: 8, z: 30, g: 70, c: 12 }, m: SUELTA }, piesEnTalon(10, 0, G, 6))
        },
        rep: [['b', 0.9, 'suave'], ['b', 0.45], ['a', 1.6, 'freno'], ['a', 0.4]],
        pasos: ['a', 'rep']
      };
    })();
    /* sentado: con los pies planos, levanta las puntas sin despegar los talones y las baja, en un golpeteo continuo */
    COREO['toques-puntas-sentado'] = (function () {
      var polo = [0.1, 1, 0.4], base = sentadoBajo(4);
      return {
        vista: [[68, 10], [24, 16]], rastro: 'dpi', esfuerzo: [0], clavos: T2,
        material: [BANCO_BAJO],
        posturas: { a: enSusMuslos(sobre(base, { p: pieBajo(12) })), b: enSusMuslos(sobre(base, piesEnTalon(12, D.muslo, 17, 5, polo))) },
        rep: [['b', 0.24, 'sale'], ['a', 0.24, 'entra'], ['a', 0.08]],
        pasos: ['a', 'rep']
      };
    })();

    /* ══════════ los saltos ══════════ */
    /* los pogo altos: como los pogo (los pies separados, las rodillas casi estiradas), pero buscando altura; se impulsa con los tobillos,
       sin apoyar los talones, y los contactos con el suelo son lo más breves posible */
    COREO['saltos-pogo-altos'] = {
      vista: [72, 0], rastro: 'tli', esfuerzo: [1], zoom: 0.94,
      posturas: {
        a: { p: { suelo: [12, 0], abre: 5 }, b: aLosLados(26), m: SUELTA },
        q: { pel: [0, PIE + 0.6, 3.4], p: { suelo: [12, 0], abre: 5, talon: 22 }, b: aLosLados(48), m: SUELTA },
        s: { pel: [0, PIE + 24, 3.4], p: { e: 3, z: 0, c: 8 }, t: { tob: 50 }, b: aLosLados(72), m: SUELTA }
      },
      inicio: 'q', encuadra: ['a'],
      rep: [['q', 0.11, null, T2], ['s', 0.21, 'sale', []], ['q', 0.21, 'entra', []]],
      pasos: ['a', 'rep', 'rep']
    };
    /* los pogo laterales: sobre la parte delantera de los pies, se desplaza hacia un lado con saltos cortos y rápidos (12 de 13 cm), sin
       apoyar los talones; y, al terminar el tramo, vuelve saltando en sentido contrario */
    COREO['saltos-pogo-laterales'] = (function () {
      var N = 12, DX = 13, P = {}, ida = [], vuelta = [], k;
      var en = function (x) { return { pel: [x, PIE + 1.6, 3.6], pi: { suelo: [x + 10, 0], abre: 5, talon: 24 }, pd: { suelo: [x - 10, 0], abre: 5, talon: 24 }, b: aLosLados(40), m: SUELTA }; };
      var aire = function (x) { return { pel: [x, PIE + 10, 3.6], p: { e: 3, z: 0, c: 7 }, t: { tob: 36 }, b: aLosLados(50), m: SUELTA }; };
      for (k = 0; k <= N; k++) { P['q' + k] = en(k * DX); if (k < N) P['s' + k] = aire((k + 0.5) * DX); }
      for (k = 0; k < N; k++) ida.push(['q' + k, 0.1, null, T2], ['s' + k, 0.15, 'sale', []], ['q' + (k + 1), 0.15, 'entra', []]);
      for (k = N; k > 0; k--) vuelta.push(['q' + k, 0.1, null, T2], ['s' + (k - 1), 0.15, 'sale', []], ['q' + (k - 1), 0.15, 'entra', []]);
      var T = N * 0.4;
      return {
        vista: [[12, 8], [-62, 10]], rastro: 'tli', esfuerzo: [],
        posturas: P, inicio: 'q0',
        rep: ida.concat(vuelta),
        pasos: ['q0', { sec: ida, desde: 'q0' }, { rep: T }]
      };
    })();
    /* laterales a una pierna: apoyado en una pierna, se impulsa hacia un lado y cae sobre la otra; recupera el equilibrio antes de saltar de
       nuevo hacia el lado contrario. Los apoyos, a 30 cm a cada lado del centro */
    COREO['saltos-laterales-una-pierna'] = (function () {
      var X = 30;
      /* de pie sobre la izquierda (eI), cargando para saltar o recibiendo la caída (cI) y en el aire yendo hacia su derecha (vD) */
      var eI = { pel: [X - 5, PIE - 4, -2], giro: [0, 8, 0], cab: [-5, 0, 0], pi: { suelo: [X, 0], abre: 6 }, pd: { e: 4, z: 0, c: 66 }, td: { tob: 20 },
                 bi: { e: 14, z: 70, g: 80, c: 34 }, bd: { e: 12, z: 60, g: 80, c: 40 }, m: SUELTA };
      var cI = { pel: [X - 8, PIE - 15, -8], giro: [0, 20, 0], col: [4, 0, 0], cab: [-14, 0, 0], pi: { suelo: [X, 0], abre: 6, polo: [0.2, 0.1, 1] }, pd: { e: -8, z: 0, c: 74 }, td: { tob: 24 },
                 bi: { e: 30, z: 150, g: 40, c: 50 }, bd: { e: 34, z: 20, g: 60, c: 62 }, m: SUELTA };
      var vD = { pel: [0, PIE + 10, -2], giro: [0, 8, -6], cab: [-5, 0, 0], pi: { a: [20, 22, -6], polo: [0.2, 0, 1] }, ti: { tob: 34 }, pd: { a: [-21, 20, 2], polo: [-0.2, 0.1, 1] }, td: { tob: 0 },
                 bi: { e: 30, z: 90, g: 70, c: 30 }, bd: { e: 28, z: 80, g: 70, c: 34 }, m: SUELTA };
      /* el despegue: la pierna que empuja, casi estirada y ya de puntillas (el otro pie sigue en el aire) */
      var dI = { pel: [X - 13, PIE + 2, -4], giro: [0, 12, -8], cab: [-8, 0, 0], pi: { suelo: [X, 0], abre: 6, talon: 46 }, pd: { e: 6, z: 30, c: 60 }, td: { tob: 0 },
                 bi: { e: 30, z: 120, g: 60, c: 40 }, bd: { e: 30, z: 50, g: 70, c: 46 }, m: SUELTA };
      var eD = refleja(eI), cD = refleja(cI), vI = refleja(vD), dD = refleja(dI), I = ['ti'], Dd = ['td'];
      return {
        vista: [[10, 10], [-66, 12]], rastro: 'pel', esfuerzo: [2, 8],
        posturas: { eI: eI, cI: cI, dI: dI, vD: vD, eD: eD, cD: cD, dD: dD, vI: vI },
        inicio: 'eI',
        rep: [['eI', 0.7, null, I], ['cI', 0.3, 'suave', I], ['dI', 0.18, 'entra', I], ['vD', 0.15, 'lineal', []], ['cD', 0.24, 'entra', []], ['eD', 0.5, 'suave', Dd],
              ['eD', 0.7, null, Dd], ['cD', 0.3, 'suave', Dd], ['dD', 0.18, 'entra', Dd], ['vI', 0.15, 'lineal', []], ['cI', 0.24, 'entra', []], ['eI', 0.5, 'suave', I]],
        pasos: [{ sec: [['eD', 0.6, null, Dd], ['cD', 0.3, 'suave', Dd], ['dD', 0.18, 'entra', Dd], ['vI', 0.15, 'lineal', []], ['cI', 0.24, 'entra', []], ['eI', 0.5, 'suave', I]], desde: 'eD' }, 'rep']
      };
    })();

    /* ══════════ los estiramientos de la pantorrilla ══════════ */
    /* el sóleo, en la pared: como en el del gemelo (una pierna atrás, con el talón en el suelo y la rodilla estirada); dobla ligeramente la
       rodilla de atrás (de 165° a 148°) sin despegar el talón; mantiene, y cambia de pierna (junta los pies y lleva atrás el otro) */
    COREO['estiramiento-soleo-pared'] = (function () {
      var base = { b: EN_PARED, m: M_PARED }, del = { suelo: [10, 24], abre: 0, polo: [0, 0.2, 1] }, det = { suelo: [-10, -33], abre: 0, polo: [0, 0, 1] };
      var a = sobre(base, { pel: [0, 79.5, -3.5], giro: [0, 12, 0], pi: del, pd: det }), b = sobre(base, { pel: [0, 76.5, -2.5], giro: [0, 13, 0], pi: del, pd: det });
      var m = sobre(base, { pel: [0, PIE - 1, 21], pi: { suelo: [10, 24], abre: 0 }, pd: { suelo: [-10, 24], abre: 0 } });
      /* el pie de atrás viene a juntarse (y el otro irá atrás) pasando por el aire */
      var n = sobre(base, { pel: [1.5, PIE - 2.5, 10], giro: [0, 6, 0], pi: del, pd: { a: [-10, 15, -6], polo: [0, 0.1, 1] }, td: { punta: [0, -0.2, 0.98], arriba: [0, 0.98, 0.2] } });
      return {
        vista: [[100, 10], [146, 12]], isometrico: 'b', clavos: K_2,
        material: [PARED],
        posturas: { a: a, b: b, n: n, m: m, n2: refleja(n), a2: refleja(a), b2: refleja(b) },
        inicio: 'a', encuadra: ['b'],
        pasos: ['a', { sec: [['b', 1.7, 'suave']], desde: 'a' },
                { sec: [['b', 0.5], ['a', 0.6, 'suave'], ['n', 0.4, 'entra', K_I], ['m', 0.35, 'sale', K_I], ['n2', 0.35, 'entra', K_D], ['a2', 0.4, 'sale', K_D], ['b2', 1.2, 'suave']], desde: 'b' }]
      };
    })();
    /* el sóleo, en un escalón: apoya un pie entero en el escalón, mirando hacia delante; sin despegar el talón, lleva la rodilla hacia delante;
       mantiene, y repite con la otra pierna. Las manos, en la cintura (sujetarse es «si lo necesita») */
    COREO['estiramiento-soleo-escalon'] = (function () {
      var cintura = { b: { a: [16, 13, 6], en: 'pelvis', polo: [1, 0, -0.3] }, m: SUELTA };      /* en la cintura, por encima del pliegue de la cadera: al subir la rodilla, el muslo no les llega */
      var enEsc = { suelo: [10, 26], abre: 2, alto: ALTO_E, polo: [0, 0.2, 1] }, atras = { suelo: [-10, -8], abre: 4 };
      var s = sobre(cintura, { pel: [0, PIE, -8], pi: { suelo: [10, -8], abre: 4 }, pd: atras });
      var a = sobre(cintura, { pel: [0, PIE - 2, 3], pi: enEsc, pd: atras }), b = sobre(cintura, { pel: [0, 81.7, 14.8], giro: [0, 4, 0], pi: enEsc, pd: atras });
      return {
        vista: [[96, 10], [40, 14]], isometrico: 'b', clavos: T2,
        material: [['escalon', { med: [86, ALTO_E, 40], en: [0, 36] }]],
        posturas: { s: s, a: a, b: b, a2: refleja(a), b2: refleja(b) },
        inicio: 's', encuadra: ['b'],
        pasos: [{ sec: [['s', 0.5], ['a', 1.3, 'suave', ['td']]], desde: 's' }, { sec: [['b', 2.0, 'suave']], desde: 'a' },
                { sec: [['b', 0.5], ['a', 0.8, 'suave'], ['s', 0.8, 'suave', ['td']], ['a2', 0.9, 'suave', ['ti']], ['b2', 1.4, 'suave']], desde: 'b' }]
      };
    })();
    /* con toalla, sentado en el suelo: una pierna estirada (la otra, recogida, con el pie en el suelo) y una toalla por la planta del pie, con
       un extremo en cada mano; tira suavemente de ella hacia sí, con la rodilla recta (la punta del pie viene 20°); mantiene, y cambia de
       pierna: se inclina, saca la toalla, estira la otra pierna y se la pasa por la planta */
    COREO['estiramiento-pantorrilla-toalla'] = (function () {
      var Y = 10.5, Z_T = 77.8, recta = { a: [10, 7, Z_T], polo: [0, 1, 0] }, recogida = { suelo: [-15, 33], abre: 12, polo: [-0.35, 1, 0.2] };
      var pie = function (g) { var c = Math.cos(g * RAD), sn = Math.sin(g * RAD); return { punta: [0, c, -sn], arriba: [0, -sn, -c] }; };      /* la punta, hacia arriba y g grados hacia él */
      var puno = { tipo: 'puno', barra: [0, 0.35, 1], palma: [-1, 0, 0] };
      var sentado = function (inc, g, mano, extra) { return sobre({ pel: [0, Y, 0], giro: [0, inc, 0], pi: recta, ti: pie(g), pd: recogida, m: puno, b: { a: mano, polo: [1, -0.6, -0.3] } }, extra || {}); };
      /* la bola del pie (por donde pasa la toalla) y la mano que deja la toalla igual de larga cuando el pie viene */
      var bola = function (P) { var L = resolver(P).i; return mas(L.suela, mas(por(L.punta, 12.5), por(L.arriba, -0.9))); };
      var M0 = [13, 31, 45], a = sentado(2, -8, M0);
      var tira = function (z) { var P = sentado(-3, 12, [13, 33, z], { cab: [3, 0, 0] }); return largo(menos(bola(P), resolver(P).i.agarre)); };
      var l1 = largo(menos(bola(a), resolver(a).i.agarre)), zb = busca(tira, l1, 20, 46), b = sentado(-3, 12, [13, 33, zb], { cab: [3, 0, 0] });
      /* a quitarla y a ponerla: inclinado sobre la pierna estirada, con una mano a cada lado del pie */
      var alPie = function (lado) {
        var x = lado * 10, P = { pel: [0, Y, 0], giro: [0, 52, 0], col: [26, 0, 0], cab: [-18, 0, 0], m: puno };
        P[lado > 0 ? 'pi' : 'pd'] = { a: [x, 7, Z_T], polo: [0, 1, 0] }; P[lado > 0 ? 'ti' : 'td'] = pie(-8);
        P[lado > 0 ? 'pd' : 'pi'] = { suelo: [-lado * 15, 33], abre: 12, polo: [-lado * 0.35, 1, 0.2] };
        P.bi = { a: [x + 8.5, 17, Z_T + 1], polo: [1, 0.4, -0.2] }; P.bd = { a: [x - 8.5, 17, Z_T + 1], polo: [-1, 0.4, -0.2] };
        return P;
      };
      var yI = alPie(1), yD = alPie(-1);
      /* entre una pierna y otra: las dos a medio doblar, y la toalla tendida entre las manos */
      var x = { pel: [0, Y, 0], giro: [0, 30, 0], col: [14, 0, 0], cab: [-10, 0, 0], m: puno, pi: { a: [12, 12.5, 60], polo: [0.2, 1, 0] }, ti: pie(-40), pd: { a: [-12, 12.5, 60], polo: [-0.2, 1, 0] }, td: pie(-40),
                bi: { a: [12, 30, 52], polo: [1, -0.4, -0.3] }, bd: { a: [-12, 30, 52], polo: [-1, -0.4, -0.3] } };
      var EN_I = ['a', 'b'], EN_D = ['yD', 'a2', 'b2'], EN_M = ['yI', 'x'];
      return {
        vista: [[74, 14], [20, 22]], isometrico: 'b',
        material: [['toallas', { ancho: 6, tiras: [{ de: 'pie-i', a: 'i', cola: 9, en: EN_I }, { de: 'pie-i', a: 'd', cola: 9, en: EN_I },
                                                    { de: 'pie-d', a: 'i', cola: 9, en: EN_D }, { de: 'pie-d', a: 'd', cola: 9, en: EN_D }, { de: 'mano-d', a: 'i', cola: 9, en: EN_M }] }]],
        posturas: { a: a, b: b, yI: yI, x: x, yD: yD, a2: refleja(a), b2: refleja(b) },
        inicio: 'a', encuadra: ['b', 'yI'],
        pasos: ['a', { sec: [['b', 2.1, 'suave']], desde: 'a' },
                { sec: [['b', 0.3], ['yI', 0.8, 'suave'], ['x', 0.65, 'suave'], ['yD', 0.6, 'suave'], ['a2', 0.7, 'suave'], ['b2', 1.15, 'suave']], desde: 'b' }]
      };
    })();
    /* el tibial anterior, de rodillas: las rodillas a la anchura de la cadera y los empeines en el suelo, con los dedos hacia atrás; con el
       tronco erguido, lleva la cadera despacio hacia los talones y apoya las yemas de los dedos en el suelo por detrás; mantiene y, si nota
       molestias en las rodillas, sale despacio */
    COREO['estiramiento-tibial-rodillas'] = (function () {
      var k = arrodillado(0, 0, { b: aLosLados(8), m: SUELTA });
      /* sentado en los talones: la cadera, a 22,5 cm del suelo. Las manos bajan por detrás hasta el suelo: el tronco se echa atrás lo justo
         (se busca) para que las yemas lleguen */
      var ATRAS = 36.2, mano = { tipo: 'abierta', palma: [0, 0, 1] }, Q = [23, D.dedos * 0.16 + 1.2, -ATRAS - 27];
      var P = function (g) { return arrodillado(ATRAS, -g, { hom: [-2.5, -2], cab: [g * 0.6, 0, 0], m: mano }); };
      var g = busca(function (q) { return largo(menos(resolver(P(q)).i.hom, Q)); }, D.brazo + D.antebrazo + D.dedos - 0.9, -8, 30);
      var e = estirado(P(g), Q, 'b', 0.6, [1, 0.2, -0.6]);
      /* de arrodillado a sentado en los talones (y de vuelta), la cadera gira sobre las rodillas, que están en el suelo, en z = 0 */
      var posturas = { k: k, e: e }, K = [5.5, 0], baja = porArco(posturas, 'ke', k, e, 'e', 2, 2.6, K), sube = porArco(posturas, 'ek', e, k, 'k', 2, 2.4, K);
      return {
        vista: [[96, 12], [146, 16]], isometrico: 'e',
        posturas: posturas,
        inicio: 'k', encuadra: ['e'],
        pasos: ['k', { sec: baja, desde: 'k' }, { sec: [['e', 3.6]].concat(sube), desde: 'e' }]
      };
    })();
    /* el tobillo, sentado: erguido en un banco, sujeto al asiento con las manos; estira una pierna y la levanta del suelo; lleva la punta del
       pie hacia delante y después hacia sí; y repite con la otra pierna */
    COREO['estiramiento-tobillo-sentado'] = (function () {
      var asiento = { a: [15.5, 46.5, 3], polo: [1, 0.1, -0.8] }, agarra = { tipo: 'puno', barra: [0, 0, 1], palma: [-1, 0, 0] };
      var base = sentadoEn(0, { b: asiento, m: agarra }), suelo = pieEnSuelo(12, 30), alta = { a: [11, 46, 77.2], polo: [0, 1, 0] };
      var con2 = function (tob) { return sobre(base, { pi: alta, ti: { tob: tob }, pd: reflejo(suelo) }); };
      var s = sobre(base, { p: suelo }), l = con2(8), p = con2(46), d = con2(-18);
      return {
        vista: [[72, 10], [26, 16]],
        material: [BANCO_DETRAS],
        posturas: { s: s, l: l, p: p, d: d, l2: refleja(l), p2: refleja(p), d2: refleja(d) },
        inicio: 's', encuadra: ['p'],
        pasos: ['s', { sec: [['l', 1.5, 'suave']], desde: 's' },
                { sec: [['p', 0.9, 'suave'], ['p', 0.3], ['d', 1.0, 'suave'], ['d', 0.3], ['l', 0.35, 'suave'], ['s', 0.6, 'suave'], ['l2', 0.8, 'suave'], ['p2', 0.8, 'suave']], desde: 'l' }]
      };
    })();
  })();
