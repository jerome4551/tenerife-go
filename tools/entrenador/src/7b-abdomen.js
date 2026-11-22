  /* ───────────────────────── las coreografías: ABDOMEN Y LUMBARES (bloque 12) ─────────────────────────
     Las mismas reglas que en 70-coreografias.js: cada una sale de los pasos verificados de su ficha y no añade técnica
     que la ficha no diga. Van por familias: las planchas sobre las manos (alta, con toque de hombro, arriba y abajo y con
     rotación) y el gateo del oso; a cuatro patas (el perro-pájaro, el gato-vaca y la postura del niño); de lado sobre el
     antebrazo (las planchas laterales); boca arriba (los abdominales, las elevaciones de piernas y los estiramientos);
     boca abajo (el superman y la cobra); sentado en el suelo (el giro ruso y los L-sit); en banco (el crunch declinado,
     la elevación de piernas y la hiperextensión lumbar); colgado de la barra; de pie (el crunch lateral, la flexión
     lateral y el paseo de maleta) y con polea o barra anclada (el press Pallof, el leñador, el crunch y la rotación). */
  (function () {
    var T2 = ['ti', 'td'], NADA = [], K4 = ['mi', 'md', 'ti', 'td'], KI3 = ['mi', 'ti', 'td'], KD3 = ['md', 'ti', 'td'];

    /* ══════════════════════════════ LAS PLANCHAS SOBRE LAS MANOS ══════════════════════════════
       Como la flexión del bloque 1: los tobillos, en z = −100, sobre las puntas de los pies; las muñecas, en W (las manos, de plano, bajo
       los hombros). tablaR es la tabla con el cuerpo girado «rho» grados sobre su eje largo (el hombro derecho, hacia arriba) y los
       tobillos en su sitio: con «giro» no se puede decir (boca abajo, rumbo y alabeo giran lo mismo) y va con «base» */
    var W = [19, ALTO_MUN, 13.3], POLO_W = [0.55, 0.25, -1], EN_W = { a: W, polo: POLO_W };
    var PIES_TABLA = { a: [10, TOB_PUNTA, -100], polo: [0, -1, 0.3] };
    /* refleja() no sabe de «base» ni de los pies dichos en el mundo para los dos a la vez (t): la postura del otro lado, con ellos */
    function espejo(P) {
      var R = refleja(P), mx = function (v) { return [-v[0], v[1], v[2]]; };
      if (P.base) R.base = baseEjes(mx(P.base[1]), mx(P.base[2]));
      if (P.t && P.t.punta) R.t = { punta: mx(P.t.punta), arriba: mx(P.t.arriba), flex: P.t.flex };
      return R;
    }
    function tablaR(ang, rho, extra) {
      var s = Math.sin(ang * RAD), c = Math.cos(ang * RAD), sr = Math.sin(rho * RAD), cr = Math.cos(rho * RAD);
      return sobre({ pel: [0, TOB_PUNTA + 78 * s, -100 + 78 * c], base: baseEjes([0, s, c], [-sr, -cr * c, cr * s]), cab: [-16, 0, 0], p: PIES_TABLA, t: PIES_PUNTA, m: EN_SUELO }, extra || {});
    }

    /* la plancha alta: tumbado boca abajo, con las palmas en el suelo junto a los hombros; estira los brazos hasta apoyarse solo en las
       manos y las puntas de los pies; y mantiene, con la espalda, los brazos y las piernas rectos */
    COREO['plancha-alta'] = (function () {
      var t = tabla(-1.3, { b: EN_W, cab: [-10, 0, 0] }), a = tablaAlta(W, POLO_W);
      return {
        vista: [78, [32, 34]], picado: 16, isometrico: 'a', clavos: K4,
        posturas: { t: t, a: a }, inicio: 't', encuadra: ['a'],
        pasos: [{ sec: [['t', 1.1, null, K4], ['a', 1.7, 'empuje', K4]], desde: 't' }, 'a']
      };
    })();

    /* con toque de hombro: en plancha alta, con los pies algo más separados que los hombros; levanta una mano, toca con ella el hombro
       contrario (el cuerpo se va un par de centímetros hacia la mano que apoya) y la apoya de nuevo; y lo mismo con la otra */
    COREO['plancha-toque-hombro'] = (function () {
      var a = tablaAlta(W, POLO_W, { p: { a: [23, TOB_PUNTA, -100], polo: [0, -1, 0.3] } });
      var base = sobre(a, { pel: [-2.2, a.pel[1], a.pel[2]] }), E = resolver(base), pecho = aplicar(E.Bt, [0, 0, 1]);
      var g = mas(mas(E.d.hom, por(pecho, 7)), [5.5, 0, -1]);
      var b = conAgarre(sobre(base, { mi: { tipo: 'abierta', prono: 70 } }), g, [0.5, -1, -0.5], 'bi');
      return {
        vista: [[62, 14], [24, 30]], rastro: 'mi', esfuerzo: [0, 1, 4, 5], clavos: K4,
        material: [['esterilla', { en: [0, -42], med: [74, 1.6, 196] }]],
        posturas: { a: a, b: b, b2: refleja(b) }, inicio: 'a',
        rep: [['b', 0.7, 'suave'], ['b', 0.5], ['a', 0.7, 'suave'], ['a', 0.3], ['b2', 0.7, 'suave'], ['b2', 0.5], ['a', 0.7, 'suave'], ['a', 0.3]],
        pasos: ['a', { sec: [['b', 0.8, 'suave']], desde: 'a' }, { rep: 1.2 }]
      };
    })();

    /* arriba y abajo: de la plancha alta a la de antebrazos, bajando primero un codo (el izquierdo) y luego el otro; y de vuelta, apoyando
       una mano y después la otra. El codo se posa bajo el hombro y el antebrazo queda tendido hacia delante (como en la plancha del
       bloque 1): la mano que cambia de sitio va por el aire, con la muñeca clavada a su camino (suelta, se hundiría en el suelo al bajar
       el hombro). Al subir, lo mismo reflejado: sube primero la mano izquierda */
    COREO['plancha-arriba-abajo'] = (function () {
      var AF = 8.5, ZF = -100 + 121.5 * Math.cos(AF * RAD) + 24, ANTE = { a: [19, ALTO_MUN + 0.2, ZF], polo: [0, -1, -0.25] };
      var a = tablaAlta(W, POLO_W);
      /* la mano izquierda, en el aire camino de su antebrazo; el brazo derecho cede */
      var AIRE = { tipo: 'abierta', prono: 90, mun: -24 };
      var ma = tablaR(15.5, 3, { bi: { a: [19, 16, 33], polo: [0.3, -0.5, -1] }, mi: AIRE, bd: reflejo(EN_W) });
      /* el antebrazo izquierdo, en el suelo (el hombro, a un brazo del codo); la mano derecha, todavía en su sitio, con el codo doblado */
      var conIzq = function (ang) { return tablaR(ang, 5, { bi: ANTE, bd: reflejo({ a: W, polo: [0.9, 0.5, -0.5] }) }); };
      var m1 = conIzq(busca(function (x) { return resolver(conIzq(x)).i.hom[1]; }, 5.8 + D.brazo, 6, 16));
      /* la mano derecha, en el aire camino del suyo */
      var fb = tablaR(AF + 0.4, 2, { bi: ANTE, bd: reflejo({ a: [19, 16, 35], polo: [1, 0.2, -0.6] }), md: AIRE });
      var f = tablaR(AF, 0, { b: ANTE, cab: [-12, 0, 0] });
      return {
        vista: [78, [32, 34]], picado: 16, rastro: 'hombros', esfuerzo: [6, 7, 8], clavos: K4,
        posturas: { a: a, ma: ma, m1: m1, fb: fb, f: f, fb2: espejo(fb), m2: espejo(m1), ma2: espejo(ma) }, inicio: 'a',
        rep: [['ma', 0.32, 'entra'], ['m1', 0.45, 'sale'], ['fb', 0.3, 'entra'], ['f', 0.42, 'sale'], ['f', 0.45],
              ['fb2', 0.3, 'entra'], ['m2', 0.45, 'sale'], ['ma2', 0.36, 'entra'], ['a', 0.5, 'sale'], ['a', 0.45]],
        pasos: ['a', { sec: [['ma', 0.36, 'entra'], ['m1', 0.5, 'sale'], ['m1', 0.2], ['fb', 0.34, 'entra'], ['f', 0.46, 'sale']], desde: 'a' }, { rep: 1.94 }]
      };
    })();

    /* con rotación torácica: en plancha alta, con los pies a la anchura de la cadera; empuja el suelo con una mano y gira la cadera y los
       hombros para llevar el otro brazo hacia el techo; lo baja, apoya la mano y gira hacia el otro lado.
       El giro es el de la tabla entera sobre la línea que va de la mano que apoya a donde pisa ese pie: el brazo de apoyo sigue recto y
       su mano no se mueve; los pies ruedan sobre su canto (el de abajo, por fuera; el de arriba queda sobre él) */
    COREO['plancha-alta-rotacion'] = (function () {
      var a = tablaAlta(W, POLO_W), Q = [10, 0, -92], eje = unidad(menos(W, Q)), B = baseDe(a.giro);
      var enEsfera = function (h, x, y, r) { return [x, y, h[2] - Math.sqrt(r * r - (h[0] - x) * (h[0] - x) - (h[1] - y) * (h[1] - y))]; };
      /* girada «rho» grados: el pie de abajo, con el tobillo en xi y a la altura que deja la zapatilla posada (se busca); el de arriba, en
         [xd, lo que suba sobre el otro]; las piernas, rectas (cada tobillo, a una pierna de su cadera) */
      var girada = function (rho, xi, xd, sube, flex, extra, hueco) {
        var gv = function (v) { return girar(v, eje, rho); }, gp = function (p) { return mas(Q, gv(menos(p, Q))); };
        var r0 = sobre({ pel: gp(a.pel), base: baseEjes(gv(B[1]), gv(B[2])), cab: [-8, 0, 0], bi: { a: W, polo: [0, 0.2, -1] }, mi: EN_SUELO,
          t: { punta: gv(PIES_PUNTA.punta), arriba: gv(PIES_PUNTA.arriba), flex: flex } }, extra || {});
        var Er = resolver(r0), hi = Er.i.cad, hd = Er.d.cad;
        var con = function (y) { return sobre(r0, { pi: { a: enEsfera(hi, xi, y, 77.7), polo: gv([0, -1, 0.3]) }, pd: { a: enEsfera(hd, xd, y + sube, 77.7), polo: gv([0, -1, 0.3]) } }); };
        return con(busca(function (y) { return bajoZapa(resolver(con(y)).i, 'i'); }, hueco == null ? -0.3 : hueco, 1, 16));
      };
      /* a medio girar: la mano que se levanta, ya despegada y recogida bajo su hombro */
      var m0 = girada(-40, 15.5, -2, 5, 35, null, 0.9), hm = resolver(m0).d.hom;
      var m = conAgarre(sobre(m0, { md: SUELTA }), [hm[0] + 3, hm[1] - 33, hm[2] - 3], [-1, 0.3, -0.6], 'bd');
      var r1 = girada(-80, 21.5, 20.5, 10.6, 0, { md: { tipo: 'abierta', prono: 0 } });
      var r = estirado(r1, mas(resolver(r1).d.hom, [0, 100, 0]), 'bd', 0.3, [-1, 0, -0.3]);
      return {
        vista: [[70, 14], [28, 30]], rastro: 'md', esfuerzo: [0, 1, 2, 6, 7, 8], clavos: K4, clavosEn: { r: KI3, r2: KD3, m: KI3, m2: KD3 },
        posturas: { a: a, m: m, r: r, m2: espejo(m), r2: espejo(r) }, inicio: 'a', encuadra: ['a', 'r', 'r2'],
        rep: [['m', 0.55, 'entra', K4], ['r', 0.65, 'sale', KI3], ['r', 0.6, null, KI3], ['m', 0.65, 'entra', KI3], ['a', 0.55, 'sale', K4], ['a', 0.3, null, K4],
              ['m2', 0.55, 'entra', K4], ['r2', 0.65, 'sale', KD3], ['r2', 0.6, null, KD3], ['m2', 0.65, 'entra', KD3], ['a', 0.55, 'sale', K4], ['a', 0.3, null, K4]],
        pasos: ['a', { sec: [['m', 0.6, 'entra', K4], ['r', 0.7, 'sale', KI3]], desde: 'a' }, { rep: 1.8 }]
      };
    })();

    /* el gateo del oso: sobre las manos y las puntas de los pies, con las rodillas en el aire y la espalda recta (la cadera, a la altura
       de los hombros); avanza moviendo a la vez una mano y la pierna contraria, y después las otras dos. Cada mano y cada pie van por el
       aire a su sitio siguiente (2 × PASO más allá) mientras el cuerpo avanza PASO; empieza y acaba con medio paso */
    COREO['gateo-oso'] = (function () {
      var PASO = 10, YH = 50.5, ZC = -34, ZM = 6.5, ZT = ZC - 37, N = 6;
      var oso = function (zc, mi, md, ti, td, yi, yd, yti, ytd) {
        var mano = function (x, z, y) { return { a: [x, y == null ? ALTO_MUN : y, z], polo: [x > 0 ? 0.6 : -0.6, 0.3, -1] }; };
        var pie = function (x, z, y) { return { a: [x, y == null ? TOB_PUNTA : y, z], polo: [0, -0.5, 1] }; };
        var P = function (cab) { return { pel: [0, YH, ZC + zc], giro: [0, cab, 0], cab: [-18, 0, 0], bi: mano(19, ZM + mi, yi), bd: mano(-19, ZM + md, yd), pi: pie(10, ZT + ti, yti), pd: pie(-10, ZT + td, ytd),
          t: PIES_PUNTA, m: EN_SUELO }; };
        return P(busca(function (cab) { return resolver(P(cab)).i.hom[1]; }, YH + 1.2, 70, 100));
      };
      var P = {}, sec = [], k, z = { mi: 0, md: 0, ti: 0, td: 0 }, zc = 0;
      P.o0 = oso(0, 0, 0, 0, 0);
      for (k = 1; k <= N + 1; k++) {
        /* los impares mueven la mano izquierda y el pie derecho; los pares, los otros dos. El primero y el último, medio paso */
        var izq = k % 2 === 1, d = k === 1 || k === N + 1 ? PASO : 2 * PASO, m = izq ? 'mi' : 'md', t = izq ? 'td' : 'ti', antes = { mi: z.mi, md: z.md, ti: z.ti, td: z.td };
        z[m] += d; z[t] += d;
        var medio = function (q) { return (antes[q] + z[q]) / 2; };
        P['m' + k] = oso(zc + d / 4, medio('mi'), medio('md'), medio('ti'), medio('td'), izq ? 8.5 : null, izq ? null : 8.5, izq ? null : TOB_PUNTA + 5, izq ? TOB_PUNTA + 5 : null);
        zc += d / 2;
        P['o' + k] = oso(zc, z.mi, z.md, z.ti, z.td);
        sec.push(['m' + k, k === 1 ? 0.3 : 0.27, k === 1 ? 'entra' : 'lineal', K4], ['o' + k, 0.27, k === N + 1 ? 'sale' : 'lineal', K4]);
      }
      var mitad = N / 2 * 2;                         /* hasta o4: la primera mitad del recorrido, que acaba con los cuatro apoyos repartidos */
      return {
        vista: [[72, 12], [34, 30]], rastro: 'pel', clavos: K4,
        posturas: P, inicio: 'o0', encuadra: ['o0', 'o' + (N + 1)],
        pasos: ['o0', { sec: sec.slice(0, mitad), desde: 'o0' }, { sec: sec.slice(mitad), desde: 'o' + (mitad / 2) }]
      };
    })();

    /* ══════════════════════════════ A CUATRO PATAS (las ayudas, del bloque 10) ══════════════════════════════
       Las manos, bajo los hombros (de plano, con los dedos hacia delante) y las rodillas, bajo la cadera (a 7 cm del suelo), con los
       empeines apoyados. Los brazos, estirados: se busca la inclinación del tronco que deja el hombro a un brazo justo de la mano */
    var ZR4 = -34, EMPEINE = { punta: [0, -0.1, -1], arriba: [0, -1, 0.1] };
    function aCuatro(extra, x) {
      var P = function (w) { return function (cab) { return sobre({ pel: [x || 0, 47, ZR4], giro: [0, cab, 0], cab: [-10, 0, 0], pi: { a: [10, 7, ZR4 - 38], polo: [0, -1, 0.3] }, pd: { a: [-10, 7, ZR4 - 38], polo: [0, -1, 0.3] },
        t: EMPEINE, b: { a: w, polo: [0.4, 0.2, -1] }, m: EN_SUELO }, extra || {}); }; };
      var W0 = [19, ALTO_MUN, ZR4 + 43], W4 = [19, ALTO_MUN, resolver(aUnBrazo(P(W0), W0, 55, 89)).i.hom[2]];
      return aUnBrazo(P(W4), W4, 55, 89);
    }
    /* lo mismo, con las manos donde se diga (las de otra postura): para doblar la espalda sin moverlas */
    function aCuatroEn(w, extra, lo, hi) {
      return aUnBrazo(function (cab) { return sobre({ pel: [0, 47, ZR4], giro: [0, cab, 0], cab: [-10, 0, 0], p: { a: [10, 7, ZR4 - 38], polo: [0, -1, 0.3] }, t: EMPEINE, b: { a: w, polo: [0.4, 0.2, -1] }, m: EN_SUELO }, extra || {}); }, w, lo || 40, hi || 110);
    }

    /* el perro-pájaro: a cuatro patas, con la espalda neutra; estira una pierna hacia atrás y el brazo contrario hacia delante (los dos, a
       la altura del tronco), sin girar la cadera ni los hombros; vuelve despacio y repite con el otro lado */
    COREO['perro-pajaro'] = (function () {
      var a = aCuatro(), base = aCuatro({}, 2), PIE_ATRAS = { punta: [0, -0.77, -0.64], arriba: [0, -0.64, 0.77] };
      var b0 = sobre(base, { pd: { a: [-10, 46, ZR4 - 77.92], polo: [0, -1, 0] }, td: PIE_ATRAS, mi: { tipo: 'abierta', prono: 0 } });
      var b = estirado(b0, mas(resolver(b0).i.hom, [0, 1.5, 100]), 'bi', 0.3, [1, -0.4, 0]);
      var N1 = ['md', 'ti'], N2 = ['mi', 'td'];
      /* (22-11-2026) a medio camino: la mano, que va en línea recta del suelo a su sitio de delante, pasa cerca del hombro con el codo
         doblado (92°), como al alcanzar algo. Se veía así, pero no lo decía ninguna postura; ahora lo dice esta (m: todo a mitad de
         camino, y la mano con la palma aún hacia el suelo), y la auditoría sabe que ese codo se dobla porque se quiere */
      var Ea = resolver(a), Eb = resolver(b), med = function (p, q) { return mezcla(p, q, 0.5); };
      var m = sobre(a, { pel: med(Ea.pel, Eb.pel), giro: [0, (a.giro[1] + b.giro[1]) / 2, 0], bi: { a: med(Ea.i.mun, Eb.i.mun), polo: [0.4, 0.2, -1] }, mi: { tipo: 'abierta', palma: [0, -1, 0] },
        pd: { a: med(Ea.d.tob, Eb.d.tob), polo: [0, -1, 0.15] }, td: { punta: unidad(med(Ea.d.punta, Eb.d.punta)), arriba: unidad(med(Ea.d.arriba, Eb.d.arriba)) } });
      return {
        vista: [[-78, 12], [-142, 22]], rastro: 'mi', esfuerzo: [0, 1, 2, 6, 7, 8], clavos: K4, clavosEn: { b: N1, b2: N2 },
        posturas: { a: a, m: m, b: b, m2: refleja(m), b2: refleja(b) }, inicio: 'a',
        rep: [['m', 0.7, 'entra', K4], ['b', 0.7, 'sale', K4], ['b', 0.9, null, N1], ['m', 0.75, 'entra', K4], ['a', 0.75, 'sale', K4], ['a', 0.3, null, K4],
              ['m2', 0.7, 'entra', K4], ['b2', 0.7, 'sale', K4], ['b2', 0.9, null, N2], ['m2', 0.75, 'entra', K4], ['a', 0.75, 'sale', K4], ['a', 0.3, null, K4]],
        pasos: ['a', { sec: [['m', 0.75, 'entra', K4], ['b', 0.75, 'sale', K4]], desde: 'a' }, { rep: 2.3 }]
      };
    })();

    /* el gato-vaca: a cuatro patas; mete el abdomen y redondea la espalda hacia el techo, dejando caer la cabeza, y mantiene; después deja
       caer el abdomen hacia el suelo, curva la zona lumbar y acerca las escápulas, y mantiene. Las manos y las rodillas no se mueven */
    COREO['gato-vaca'] = (function () {
      var a = aCuatro(), w = a.b.a;
      var g = aCuatroEn(w, { col: [42, 0, 0], cab: [36, 0, 0] }), v = aCuatroEn(w, { col: [-24, 0, 0], cab: [-28, 0, 0], hom: [0, -1.6] });
      return {
        vista: [[-78, 12], [-136, 22]], rastro: 'pecho', clavos: K4,
        posturas: { a: a, g: g, v: v }, inicio: 'a', encuadra: ['a', 'g', 'v'],
        pasos: ['a', { sec: [['g', 2.4, 'suave']], desde: 'a' }, { sec: [['v', 2.8, 'suave']], desde: 'g' }]
      };
    })();

    /* la postura del niño: de rodillas, con los dedos gordos juntos y las rodillas separadas, y las manos en el suelo bajo los hombros;
       lleva los glúteos hacia los talones sin mover las manos, hasta dejar el pecho entre los muslos y la frente en el suelo; y mantiene.
       Las rodillas (K) y los tobillos no se mueven: la cadera gira sobre las rodillas (queda a un muslo de ellas) */
    COREO['postura-del-nino'] = (function () {
      var XK = 21, K = [XK, 7, ZR4], RM = Math.sqrt(D.muslo * D.muslo - (XK - D.caderaX) * (XK - D.caderaX));
      var TOB = [4.6, 7, ZR4 - Math.sqrt(D.pierna * D.pierna - (XK - 4.6) * (XK - 4.6))];
      /* la cadera, a «th» grados sobre las rodillas (90: encima de ellas); el tronco, con la inclinación y la curva que se digan */
      var con = function (th, cab, extra) {
        var pel = [0, 7 + RM * Math.sin(th * RAD), ZR4 - RM * Math.cos(th * RAD)], cad = [D.caderaX, pel[1], pel[2]];
        return sobre({ pel: pel, giro: [0, cab, 0], cab: [-10, 0, 0], p: { a: TOB, polo: menos(K, mezcla(cad, TOB, 0.5)) }, t: EMPEINE, m: EN_SUELO }, extra || {});
      };
      var w0 = [19, ALTO_MUN, ZR4 + 43], P0 = function (cab) { return con(90, cab, { b: { a: w0, polo: [0.4, 0.2, -1] } }); };
      var w = [19, ALTO_MUN, resolver(aUnBrazo(P0, w0, 55, 89)).i.hom[2]], brazos = function (polo) { return { b: { a: w, polo: polo } }; };
      var a = aUnBrazo(function (cab) { return con(90, cab, brazos([0.4, 0.2, -1])); }, w, 55, 89);
      var m1 = con(64, 91, sobre(brazos([0.7, 0.2, -1]), { col: [8, 0, 0] })), m2 = con(42, 97, sobre(brazos([1, 0.1, -0.5]), { col: [18, 0, 0], cab: [-22, 0, 0] }));
      /* abajo: sentado sobre los talones; el tronco baja entre los muslos hasta que la frente llega al suelo (se busca) */
      var fin = function (cab) { return con(23, cab, sobre(brazos([1, 0.25, -0.2]), { col: [30, 0, 0], cab: [94 - cab - 30, 0, 0] })); };
      var n = fin(busca(function (cab) { return cabezaAPlano(resolver(fin(cab)), [0, 0, 0], [0, 1, 0]); }, 0.3, 78, 116));
      return {
        vista: [[-74, 14], [-128, 26]], rastro: 'pel', isometrico: 'n', clavos: K4,
        posturas: { a: a, m1: m1, m2: m2, n: n }, inicio: 'a', encuadra: ['a', 'n'],
        pasos: ['a', { sec: [['m1', 0.9, 'entra'], ['m2', 0.8, 'lineal'], ['n', 1.2, 'sale']], desde: 'a' }, 'n']
      };
    })();

    /* ══════════════════════════════ DE LADO, SOBRE EL ANTEBRAZO (las ayudas, del bloque 10) ══════════════════════════════
       Sobre el lado derecho (la cabeza hacia −Z, de cara a −X). El codo de abajo, en el suelo y justo bajo el hombro; el antebrazo,
       tendido hacia delante. Con la cadera en el suelo (recostado), el tronco se dobla de lado lo que eso pide; con la cadera en el aire
       (en línea), va recto del hombro a los pies. Del otro lado, lo mismo reflejado: se da la vuelta rodando sobre la espalda */
    var X_LADO = -12, EN_SUELO_PIERNA = -2.3, EN_CINTURA = { a: [16, 13, 6], en: 'pelvis', polo: [1, 0, -0.3] };
    var Y_CODO = 5.8, Y_HOMBRO = Y_CODO + D.brazo, AL_REC = 74;
    function recostado(extra, sube) {
      var P = function (L) { return sobre({ pel: [X_LADO, 11.55 + D.caderaX * Math.sin(AL_REC * RAD) + (sube || 0), 0], giro: [-90, 0, -AL_REC], col: [0, L, 0], cab: [0, 0, -L * 0.35], bi: EN_CINTURA, mi: SUELTA }, extra || {}); };
      return P(busca(function (L) { return resolver(P(L)).d.hom[1]; }, Y_HOMBRO, 0, 80));
    }
    function enLinea(beta, S, extra) {
      var g = [-90, 0, -(90 - beta)];
      return sobre({ pel: menos(S, aplicar(baseDe(g), [-D.hombroX, D.lumbar + D.torax + D.hombroY, 0])), giro: g, bi: EN_CINTURA, mi: SUELTA }, extra || {});
    }
    function antebrazoEn(S) { return { bd: { a: [S[0] - 23.8, ALTO_MUN, S[2]], polo: [0, -1, 0] }, md: apoyada([-1, 0, 0]) }; }
    function piernaCon(P, k, tob, ang) {
      var c = resolver(P)[k].cad, eje = unidad(menos(tob, c)), f = unidad(sinParte([-1, 0, 0], eje)), u = unidad(sinParte([0, 1, 0], eje));
      return { a: tob, polo: mas(por(f, Math.cos(ang * RAD)), por(u, Math.sin(ang * RAD))) };
    }
    function piernaAbajo(P, adelante, sube) {
      var c = resolver(P).d.cad, d = 77.6, x = -2 - (adelante || 0);
      var con = function (y) { return sobre(P, { pd: { a: [c[0] + x, y, c[2] + Math.sqrt(d * d - x * x - (c[1] - y) * (c[1] - y))], polo: [-1, 0, 0] }, td: { tob: 8 } }); };
      var y0 = busca(function (y) { return bajoZapa(resolver(con(y)).d, 'd'); }, -0.3, 3, 11);
      return con(y0 + (sube || 0));
    }
    function piernaArriba(P, ang) {
      var E = resolver(P), ci = E.i.cad, t = resolver(piernaAbajo(P)).d.tob, u0 = unidad(menos([t[0], t[1] + 11, t[2] + 1], ci));
      return sobre(P, { pi: { a: mas(ci, por(girar(u0, [-1, 0, 0], ang), 77.8)), polo: [-1, 0, 0] }, ti: { tob: 8 } });
    }
    /* DARSE LA VUELTA, del lado derecho al izquierdo, rodando sobre la espalda (como en el bloque 10): añade a «P» las posturas (con el
       prefijo «pre») y devuelve los tramos, de «de» a su reflejo («de» + '2', que pone quien llama) */
    function medioRodar(sg, dobladas) {
      var tr = { pel: [X_LADO * 0.5 * sg, 17.4, 0], base: baseEjes([0, 0.05, -1], [-0.7 * sg, 0.72, 0]), cab: [0, 0, 2 * sg], t: { tob: 8 }, m: { tipo: 'suelta', prono: 40 } };
      var abajo = { a: [-3, 5, 16.5], en: 'torax', polo: [-0.25, -1, 0.4] }, arriba = { a: [10, 3, 16], en: 'torax', polo: [0.5, -1, 0.3] }, k = sg > 0 ? 'd' : 'i';
      tr[sg > 0 ? 'bd' : 'bi'] = sg > 0 ? abajo : reflejo(abajo); tr[sg > 0 ? 'bi' : 'bd'] = sg > 0 ? arriba : reflejo(arriba);
      if (dobladas) return sobre(tr, { p: { e: 54, z: 0, c: 96 } });
      var con = function (e) { return sobre(tr, { p: { e: e, z: 0, c: 2 } }); };
      return con(busca(function (e) { return bajoZapa(resolver(con(e))[k], k); }, 0.4, -6, 14));
    }
    function darLaVuelta(P, pre, de, dobladas, seg) {
      var A = P[de], k = (seg || 2.2) / 2.2;
      var S = resolver(A).d.hom, cq = mas(S, por(unidad([-0.96, (5.85 - S[1]) / D.brazo, 0.27]), D.brazo));
      P[pre + 'q'] = sobre(A, { cab: [0, 0, -3], bd: { a: mas(cq, por(unidad([0.35, 0.8, 0.49]), D.antebrazo)), polo: menos(cq, S) }, md: { tipo: 'suelta', prono: 40 } });
      P[pre + 'as'] = medioRodar(1, dobladas); P[pre + 'sa'] = medioRodar(-1, dobladas);
      P[pre + 's'] = sobre(SUPINO_SUELO, { pel: [0, 11.5, 0], p: dobladas ? { suelo: [11, 45], abre: 4, polo: [0.1, 1, 0.2] } : { e: EN_SUELO_PIERNA, z: 0, c: 0 }, t: { tob: 8 },
        b: { a: [8, 5, 14.5], en: 'torax', polo: [0.8, -0.7, -0.5] }, m: { tipo: 'plana', prono: 70 } });
      P[pre + 'q2'] = refleja(P[pre + 'q']);
      return [[pre + 'q', 0.42 * k, 'suave'], [pre + 'as', 0.34 * k, 'entra'], [pre + 's', 0.32 * k, 'lineal'], [pre + 'sa', 0.32 * k, 'lineal'], [pre + 'q2', 0.34 * k, 'sale'], [de + '2', 0.46 * k, 'suave']];
    }
    var SIN_CLAVOS = function (t) { return t.concat([NADA]); }, K3 = ['md', 'ti', 'td'], K3I = ['mi', 'ti', 'td'];

    /* recostado con la cadera de abajo en H y el hombro de abajo en S: se buscan el alabeo de la pelvis y la curva del tronco que los
       dejan ahí (la pelvis va donde pide su cadera) */
    function recostadoEn(S, H, extra) {
      var con = function (al) {
        var g = [-90, 0, -al], off = resolver({ pel: [0, 0, 0], giro: g }).d.cad, pel = menos(H, off);
        var P = function (L) { return sobre({ pel: pel, giro: g, col: [0, L, 0], cab: [0, 0, -L * 0.35], bi: EN_CINTURA, mi: SUELTA }, extra || {}); };
        return P(busca(function (L) { return resolver(P(L)).d.hom[1]; }, S[1], -30, 85));
      };
      return con(busca(function (al) { return resolver(con(al)).d.hom[2]; }, S[2], 50, 89.5));
    }
    /* la plancha lateral, con las piernas estiradas. El hombro de abajo (S, sobre el codo) y el tobillo de abajo (T) no se mueven. b, en
       línea: el tronco y la pierna de abajo, rectos y uno a continuación del otro (se busca la inclinación que deja el tobillo posado);
       a, recostado, con la cadera en el suelo; c, con la cadera a «baja» cm de él (la dinámica): en las dos, la cadera queda a una pierna
       de T */
    function plancha(baja) {
      var r0 = recostado(), S = resolver(r0).d.hom, AB = antebrazoEn(S), H0 = resolver(r0).d.cad;
      var yT = resolver(piernaAbajo(sobre(r0, AB))).d.tob[1];
      var linea = function (x) { return enLinea(x, S, AB); };
      var tobDe = function (x) { var Q = linea(x); return mas(resolver(Q).d.cad, por(baseDe(Q.giro)[1], -77.7)); };
      var beta = busca(function (x) { return tobDe(x)[1]; }, yT, 2, 40), T = tobDe(beta);
      var cadera = function (sube) { var y = H0[1] - 2.6 + sube; return [H0[0], y, T[2] - Math.sqrt(77.7 * 77.7 - (y - T[1]) * (y - T[1]))]; };
      var a0 = sobre(recostadoEn(S, cadera(0), AB), { pd: { a: T, polo: [-1, 0, 0] }, td: { tob: 8 } }), Ea = resolver(a0), PIE_ABAJO = { punta: Ea.d.punta, arriba: Ea.d.arriba };
      /* la pierna de arriba: en línea, recta (su pie queda algo más allá del otro: su cadera va por delante); recostado, la pelvis está
         más girada y el pie se posa sobre el otro, con la rodilla algo doblada */
      var apoyo = function (Q, recta) {
        var R0 = sobre(Q, { pd: { a: T, polo: [-1, 0, 0] }, td: PIE_ABAJO });
        return recta ? piernaArriba(R0, 0) : sobre(R0, { pi: { a: [T[0] - 0.5, T[1] + 10.8, T[2] + 2.5], polo: [-1, 0.25, 0] }, ti: { tob: 8 } });
      };
      var P = { a: apoyo(a0), b: apoyo(linea(beta), true) };
      if (baja != null) P.c = apoyo(recostadoEn(S, cadera(baja), AB));
      P.a2 = refleja(P.a); P.b2 = refleja(P.b);
      return P;
    }
    /* la vuelta, con las piernas estiradas: antes de rodar, los pies se despegan un poco (si no, la zapatilla de abajo, al girar, corta el suelo) */
    function vueltaRecta(P) {
      var v = darLaVuelta(P, 'v', 'a', false);
      P.vq = piernaArriba(piernaAbajo(P.vq, 0, 6), 2); P.vq2 = refleja(P.vq);
      /* rueda a paso constante: lo que tarda en arrancar y en frenar (el doble que cada uno de los dos tramos de en medio) hace que
         la velocidad no cambie de golpe de un tramo al siguiente. Con los cuatro iguales se doblaba al empezar a frenar, y los pies,
         que con las piernas estiradas quedan lejos y van un instante detrás de la cadera, daban un salto (5 cm) */
      v[1][1] = 0.44; v[2][1] = 0.22; v[3][1] = 0.22; v[4][1] = 0.44;
      return v.map(SIN_CLAVOS);
    }
    /* la plancha lateral: tumbado de lado, con las piernas estiradas y el antebrazo apoyado bajo el hombro; eleva la cadera hasta apoyarse
       solo en el antebrazo y el lateral de los pies, con el cuerpo recto; mantiene, baja con control y repite sobre el otro lado */
    COREO['plancha-lateral'] = (function () {
      var P = plancha(), vuelta = vueltaRecta(P);
      return {
        vista: [[-62, 14], [-18, 26]], rastro: 'pel', isometrico: 'b', clavos: K3, clavosEn: { a2: K3I, b2: K3I },
        posturas: P, inicio: 'a', encuadra: ['a', 'b', 'a2', 'vs'],
        pasos: ['a', { sec: [['b', 1.6, 'empuje', K3]], desde: 'a' },
          { sec: [['b', 1.1, null, K3], ['a', 1.5, 'freno', K3], ['a', 0.25, null, K3]].concat(vuelta, [['b2', 1.5, 'empuje', K3I]]), desde: 'b', dura: 7.4 }]
      };
    })();
    /* la dinámica: en plancha lateral, con el cuerpo en línea recta; baja la cadera hacia el suelo (hasta 3 cm de él) y la sube otra vez
       hasta la línea recta; repite y, después, cambia de lado */
    COREO['plancha-lateral-dinamica'] = (function () {
      var P = plancha(3), vuelta = vueltaRecta(P);
      return {
        vista: [[-62, 14], [-18, 26]], rastro: 'pel', esfuerzo: [2, 3], clavos: K3, clavosEn: { a2: K3I, b2: K3I },
        posturas: P, inicio: 'b', encuadra: ['a', 'b', 'a2', 'vs'],
        rep: [['c', 1.3, 'freno', K3], ['c', 0.3, null, K3], ['b', 1.2, 'empuje', K3], ['b', 0.4, null, K3]],
        pasos: ['b', 'rep',
          { sec: [['c', 1.2, 'freno', K3], ['b', 1.1, 'empuje', K3], ['b', 0.3, null, K3], ['a', 1.3, 'freno', K3], ['a', 0.2, null, K3]].concat(vuelta, [['b2', 1.4, 'empuje', K3I]]), desde: 'b', dura: 8.2 }]
      };
    })();
    /* sobre las rodillas: de lado, con las rodillas dobladas, una pierna sobre la otra, y el codo bajo el hombro; eleva la cadera del suelo
       manteniendo la rodilla de abajo apoyada (ni ella ni su espinilla se mueven) y la cabeza en línea con la columna; baja despacio y
       repite sobre el otro lado. Es la almeja en plancha lateral del bloque 10, sin abrir la rodilla de arriba */
    COREO['plancha-lateral-rodillas'] = (function () {
      var C = [X_LADO, Y_CODO, -48.3], brazo = function (P) { return sobre(P, { bd: { a: [C[0] - 23.8, ALTO_MUN, C[2]], polo: menos(C, resolver(P).d.hom) }, md: apoyada([-1, 0, 0]) }); };
      var b0 = brazo(enLinea(24, [C[0], Y_HOMBRO, C[2]])), cb = resolver(b0).d.cad, dyb = cb[1] - 6.4;
      var K = [cb[0] - 6, 6.4, cb[2] + Math.sqrt(D.muslo * D.muslo - 36 - dyb * dyb)];
      var rec = function (L, z) { return { pel: [X_LADO, 11.55 + D.caderaX * Math.sin(AL_REC * RAD), z], giro: [-90, 0, -AL_REC], col: [0, L, 0], cab: [0, 0, -L * 0.35], bi: EN_CINTURA, mi: SUELTA }; };
      var z0 = K[2] - Math.sqrt(D.muslo * D.muslo - 36 - 5.15 * 5.15) - resolver(rec(0, 0)).d.cad[2];
      var a0 = brazo(rec(busca(function (L) { return largo(menos(resolver(rec(L, z0)).d.hom, C)); }, D.brazo, 5, 45), z0));
      var tobAbajo = function (y) { return [K[0] + 32, y, K[2] + Math.sqrt(D.pierna * D.pierna - 1024 - (K[1] - y) * (K[1] - y))]; };
      var conAbajo = function (P, y) { return sobre(P, { pd: { a: tobAbajo(y), polo: menos(K, resolver(P).d.cad) }, td: { tob: 8 } }); };
      var yA = busca(function (y) { return bajoZapa(resolver(conAbajo(a0, y)).d, 'd'); }, -0.3, 3, 11), A = tobAbajo(yA), A2 = [A[0], A[1] + 10.5, A[2]];
      var Ep = resolver(conAbajo(a0, yA)).d, PIE_ABAJO = { punta: Ep.punta, arriba: Ep.arriba };
      var piernas = function (P) {
        var Q = sobre(conAbajo(P, yA), { td: PIE_ABAJO }), arr = function (g) { return sobre(Q, { pi: piernaCon(Q, 'i', A2, g), ti: { tob: 8 } }); };
        return arr(busca(function (g) { return resolver(arr(g)).i.rod[1]; }, resolver(Q).d.rod[1] + 11.5, -70, 70));
      };
      var P = { a: piernas(a0), b: piernas(b0) };
      P.a2 = refleja(P.a); P.b2 = refleja(P.b);
      var vuelta = darLaVuelta(P, 'v', 'a', true);
      /* antes de rodar, los pies se despegan del suelo: si no, la zapatilla de abajo, al girar, lo cortaría */
      P.vq = sobre(P.vq, { pd: { a: [A[0], A[1] + 6, A[2]], polo: P.a.pd.polo }, pi: { a: [A2[0], A2[1] + 6, A2[2]], polo: P.a.pi.polo } }); P.vq2 = refleja(P.vq);
      return {
        vista: [[-66, 14], [-22, 26]], rastro: 'pel', clavos: K3, clavosEn: { a2: K3I, b2: K3I },
        posturas: P, inicio: 'a', encuadra: ['a', 'b', 'a2', 'vs'],
        pasos: ['a', { sec: [['b', 1.5, 'empuje', K3]], desde: 'a' },
          { sec: [['a', 1.6, 'freno', K3], ['a', 0.3, null, K3]].concat(vuelta.map(SIN_CLAVOS), [['b2', 1.5, 'empuje', K3I]]), desde: 'b', dura: 6.2 }]
      };
    })();

    /* ══════════════════════════════ BOCA ABAJO (las ayudas, del bloque 3) ══════════════════════════════
       En el suelo, con la cabeza hacia +Z, las piernas estiradas y los empeines apoyados */
    var Z_BA = -22;
    function bocaAbajo(extra) { return sobre({ pel: [0, 11.5, Z_BA], giro: [0, 90, 0], cab: [-9, 0, 0], p: { e: 0, z: 0, c: 0 }, t: { punta: [0, 0, -1], arriba: [0, -1, 0] } }, extra || {}); }
    /* el brazo, estirado desde el hombro, a «ang» grados de la línea del cuerpo (0, por encima de la cabeza) y con la muñeca a «y» del suelo */
    function brazoEn(P, ang, y) {
      var h = resolver(P).i.hom, L = D.brazo + D.antebrazo - 0.4, k = Math.sqrt(1 - (y - h[1]) * (y - h[1]) / (L * L));
      return sobre(P, { b: { a: [h[0] + L * k * Math.sin(ang * RAD), y, h[2] + L * k * Math.cos(ang * RAD)], polo: [0.5, 0.2, -1] } });
    }

    /* el superman: tumbado boca abajo, con las piernas estiradas y los brazos extendidos por delante de la cabeza; eleva a la vez los
       brazos y las piernas unos centímetros (8), sin girarlos ni levantar la cabeza; mantiene un momento y baja despacio */
    COREO.superman = (function () {
      var G = 7, a = brazoEn(bocaAbajo({ m: apoyada([Math.sin(G * RAD), 0, Math.cos(G * RAD)]) }), G, ALTO_MUN);
      var b = brazoEn(bocaAbajo({ m: { tipo: 'plana', palma: [0, -1, 0] }, hom: [-1.5, -3.2], p: { e: -6, z: 0, c: 0 } }), G, 11);
      return {
        vista: [[-52, 20], [-146, 32]], rastro: 'manos', esfuerzo: [0, 1],
        posturas: { a: a, b: b }, inicio: 'a',
        rep: [['b', 1.3, 'empuje'], ['b', 1.1], ['a', 1.9, 'freno'], ['a', 0.5]],
        pasos: ['a', { sec: [['b', 1.4, 'empuje']], desde: 'a' }, { rep: 1.3 }]
      };
    })();

    /* la cobra: tumbado boca abajo, con las piernas estiradas y las manos apoyadas bajo los hombros; con la cadera contra el suelo, eleva
       el pecho estirando los brazos (los codos quedan algo doblados: así la cadera no se levanta); mantiene y baja despacio */
    COREO['estiramiento-cobra'] = (function () {
      var a0 = bocaAbajo({}), h = resolver(a0).i.hom, w = [h[0] + 2, ALTO_MUN, h[2] - 3], brazos = { a: w, polo: [0.5, 0.5, -1] };
      var a = sobre(a0, { b: brazos, m: EN_SUELO });
      var b = bocaAbajo({ giro: [0, 80, 0], col: [-66, 0, 0], cab: [-6, 0, 0], p: { e: -10, z: 0, c: 0 }, b: brazos, m: EN_SUELO });
      return {
        vista: [[-58, 16], [-140, 28]], rastro: 'pecho', isometrico: 'b', clavos: ['mi', 'md'],
        posturas: { a: a, b: b }, inicio: 'a', encuadra: ['a', 'b'],
        pasos: ['a', { sec: [['b', 2.2, 'suave']], desde: 'a' }, { sec: [['b', 1.9], ['a', 2.2, 'suave']], desde: 'b' }]
      };
    })();

    /* ══════════════════════════════ BOCA ARRIBA ══════════════════════════════
       En el suelo, con la cabeza hacia −Z (SUPINO_SUELO: la cadera, en z = 20). Las manos detrás de la cabeza (NUCA) o en el suelo junto
       a la cadera, con las palmas hacia abajo (AL_LADO); las piernas, tendidas (TENDIDAS) o con los pies apoyados */
    var NUCA = { a: [8, 37, -8], en: 'torax', polo: [1, 0.2, 0.15] }, AL_LADO = { b: { a: [26, ALTO_MUN, 18], polo: [1, -0.3, 0] }, m: EN_SUELO };
    var TENDIDAS = { e: EN_SUELO_PIERNA, z: 0, c: 0 }, ABIERTOS = { b: { a: [60, ALTO_MUN, -6], polo: [0, 0.3, 1] }, m: apoyada([0.94, 0, 0.34]) };
    /* la pelvis, girada «g» grados hacia las costillas, con la columna doblada lo mismo: los hombros de «a» no se mueven del suelo */
    function enrollado(a, g, extra) {
      var Sa = resolver(a).i.hom, P = sobre(a, sobre({ giro: [0, -90 - g, 0], col: [g, 0, 0] }, extra || {}));
      return sobre(P, { pel: mas(a.pel, menos(Sa, resolver(P).i.hom)) });
    }

    /* los toques de talón laterales: boca arriba, con las rodillas dobladas, los pies apoyados y los brazos estirados junto al cuerpo, sin
       tocar el suelo; despega un poco la cabeza y los hombros y, sin bajarlos, inclina el tronco hacia un lado para acercar la mano a ese
       talón; vuelve al centro y repite hacia el otro lado */
    COREO['toques-talon-laterales'] = (function () {
      var pies = { suelo: [12, 53], abre: 4, polo: [0.1, 1, 0.2] }, TALON = [14, 9, 46];
      var con = function (col, cab) { return estirado(sobre(SUPINO_SUELO, { col: col, cab: cab, p: pies, m: { tipo: 'plana', palma: [-1, 0, 0] } }), TALON, 'b', 0.3, [1, 0, 0.2]); };
      var a = con([0, 0, 0], [0, 0, 0]), c = con([20, 0, 0], [8, 0, 0]);
      var i0 = sobre(SUPINO_SUELO, { col: [20, 15, 0], cab: [8, 5, 0], p: pies, m: { tipo: 'plana', palma: [-1, 0, 0] } });
      var i = estirado(estirado(i0, TALON, 'bi', 0.3, [1, 0, 0.2]), [-TALON[0], TALON[1] + 5, TALON[2]], 'bd', 0.3, [-1, 0, 0.2]);
      return {
        vista: [[52, 22], [-18, 34]], rastro: 'mi', esfuerzo: [0, 1, 3, 4], clavos: T2,
        posturas: { a: a, c: c, i: i, d: refleja(i) }, inicio: 'c', encuadra: ['a', 'i', 'd'],
        rep: [['i', 0.7, 'suave'], ['i', 0.35], ['c', 0.6, 'suave'], ['d', 0.7, 'suave'], ['d', 0.35], ['c', 0.6, 'suave']],
        pasos: ['a', { sec: [['c', 1.0, 'suave'], ['c', 0.3], ['i', 0.8, 'suave']], desde: 'a' }, { rep: 1.05 }]
      };
    })();

    /* los toques de talón alternos: boca arriba, con los brazos a los lados y las piernas en el aire, con las rodillas dobladas en ángulo
       recto; baja despacio un pie hasta tocar el suelo con el talón (la rodilla no cambia: baja el muslo), vuelve y alterna */
    COREO['toques-talon-tumbado'] = (function () {
      var a = sobre(SUPINO_SUELO, sobre(AL_LADO, { p: { e: 90, z: 0, c: 90 }, t: { tob: 0 } }));
      var baja = function (e) { return sobre(a, { pd: { e: e, z: 0, c: 90 } }); };
      var b = baja(busca(function (e) { return bajoZapa(resolver(baja(e)).d, 'd'); }, 0, 10, 90));
      return {
        vista: [[58, 20], [-22, 32]], rastro: 'td', esfuerzo: [2, 6], clavos: ['mi', 'md'],
        posturas: { a: a, b: b, b2: refleja(b) }, inicio: 'a',
        rep: [['b', 1.6, 'freno'], ['b', 0.3], ['a', 1.2, 'empuje'], ['a', 0.3], ['b2', 1.6, 'freno'], ['b2', 0.3], ['a', 1.2, 'empuje'], ['a', 0.3]],
        pasos: ['a', { sec: [['b', 1.7, 'freno']], desde: 'a' }, { rep: 1.9 }]
      };
    })();

    /* el abdominal completo: boca arriba, con las rodillas dobladas, los pies sujetos bajo un apoyo firme (una barra cargada, sobre los
       empeines) y las manos detrás de la cabeza; sube el tronco enrollando la espalda (primero los hombros, después la zona lumbar) hasta
       acercar los codos a las rodillas; y baja desenrollándola hasta apoyarla de nuevo */
    COREO['abdominal-completo'] = (function () {
      var pies = { suelo: [11, 62], abre: 4, polo: [0.1, 1, 0.2] }, CODOS = { a: [8, 37, -8], en: 'torax', polo: [0.45, -0.5, 1] };
      var a = sobre(SUPINO_SUELO, { p: pies, b: NUCA, m: SUELTA });
      var m1 = sobre(a, { col: [38, 0, 0], cab: [8, 0, 0] });
      var m2 = sobre(a, { pel: [0, 11.8, 20], giro: [0, -56, 0], col: [46, 0, 0], cab: [6, 0, 0], b: CODOS });
      var b = sobre(a, { pel: [0, 11.8, 20], giro: [0, -21, 0], col: [64, 0, 0], cab: [-8, 0, 0], b: CODOS });
      return {
        vista: [[62, 16], [22, 30]], rastro: 'hombros', esfuerzo: [0, 1, 2], clavos: T2,
        material: [['esterilla', { en: [0, 8], med: [72, 1.6, 196] }], ['barra', { ancla: 'mundo', en: [0, 11, 70.5], discos: 11 }]],
        posturas: { a: a, m1: m1, m2: m2, b: b }, inicio: 'a', encuadra: ['a', 'b'],
        rep: [['m1', 0.6, 'entra'], ['m2', 0.6, 'lineal'], ['b', 0.7, 'sale'], ['b', 0.4], ['m2', 0.8, 'entra'], ['m1', 0.8, 'lineal'], ['a', 0.8, 'sale'], ['a', 0.4]],
        pasos: ['a', { sec: [['m1', 0.65, 'entra'], ['m2', 0.65, 'lineal'], ['b', 0.8, 'sale']], desde: 'a' }, { rep: 2.3 }]
      };
    })();

    /* en bicicleta: boca arriba, con las manos detrás de la cabeza; despega del suelo los hombros y las piernas; lleva una rodilla hacia el
       pecho mientras gira el tronco para acercarle el codo contrario, y estira a la vez la otra pierna; y cambia de lado, pedaleando */
    COREO['crunch-bicicleta'] = (function () {
      var base = sobre(SUPINO_SUELO, { b: NUCA, m: SUELTA, t: { tob: 10 } });
      var t = sobre(base, { p: TENDIDAS }), a = sobre(base, { col: [24, 0, 0], cab: [6, 0, 0], p: { e: 64, z: 0, c: 72 } });
      /* el codo izquierdo, hacia la rodilla derecha: el giro del tronco se busca con el signo que adelanta ese hombro */
      var lado = function (g) { return sobre(base, { col: [44, 0, g], cab: [6, 0, 0], bi: { a: [8, 37, -8], en: 'torax', polo: [0, -0.6, 1] }, pd: { e: 132, z: 0, c: 124 }, pi: { e: 22, z: 0, c: 6 } }); };
      var b = resolver(lado(40)).i.hom[1] > resolver(lado(-40)).i.hom[1] ? lado(40) : lado(-40);
      return {
        vista: [[56, 22], [-20, 34]], rastro: 'rodillas', esfuerzo: [0, 1, 2, 3],
        posturas: { t: t, a: a, b: b, b2: refleja(b) }, inicio: 'b', encuadra: ['t', 'b', 'b2'],
        rep: [['b2', 0.95, 'suave'], ['b2', 0.25], ['b', 0.95, 'suave'], ['b', 0.25]],
        pasos: [{ sec: [['t', 0.9], ['a', 1.3, 'suave']], desde: 't' }, { sec: [['b', 1.1, 'suave']], desde: 'a' }, 'rep']
      };
    })();

    /* el crunch inverso: boca arriba, con los brazos abiertos y las palmas en el suelo, y las rodillas sobre la cadera, dobladas en ángulo
       recto; despega la cadera del suelo enrollando la columna para acercar la pelvis a las costillas, sin cambiar el ángulo de las
       rodillas; y baja despacio. La pelvis gira y la columna se dobla lo mismo: los hombros no se mueven del suelo */
    COREO['crunch-inverso'] = (function () {
      var a = sobre(SUPINO_SUELO, sobre(ABIERTOS, { p: { e: 90, z: 0, c: 90 }, t: { tob: 0 } }));
      return {
        vista: [[60, 18], [-24, 32]], rastro: 'rodillas', esfuerzo: [0, 1], clavos: ['mi', 'md'],
        posturas: { a: a, b: enrollado(a, 34) }, inicio: 'a',
        rep: [['b', 1.3, 'empuje'], ['b', 0.4], ['a', 1.8, 'freno'], ['a', 0.4]],
        pasos: ['a', { sec: [['b', 1.4, 'empuje']], desde: 'a' }, { rep: 1.7 }]
      };
    })();

    /* las patadas alternas: boca arriba; eleva del suelo las piernas estiradas; baja una hasta casi rozar el suelo (a 3 cm) mientras sube
       la otra, y alterna en un movimiento continuo, con las piernas rectas */
    COREO['patadas-alternas'] = (function () {
      var base = sobre(SUPINO_SUELO, sobre(AL_LADO, { t: { tob: 14 } }));
      var t = sobre(base, { p: TENDIDAS, t: { tob: 8 } }), a = sobre(base, { p: { e: 20, z: 0, c: 0 } });
      var con = function (e) { return sobre(base, { pi: { e: 36, z: 0, c: 0 }, pd: { e: e, z: 0, c: 0 } }); };
      var b = con(busca(function (e) { return bajoZapa(resolver(con(e)).d, 'd'); }, 3, -2, 30));
      return {
        vista: [[60, 18], [-24, 32]], rastro: 'pies', esfuerzo: [0, 1], clavos: ['mi', 'md'],
        posturas: { t: t, a: a, b: b, b2: refleja(b) }, inicio: 'b2', encuadra: ['t', 'b'],
        rep: [['b', 0.5, 'suave'], ['b2', 0.5, 'suave']],
        pasos: [{ sec: [['t', 0.9], ['a', 1.3, 'suave']], desde: 't' }, 'rep', 'rep']
      };
    })();

    /* las rodillas al pecho: boca arriba; lleva las rodillas hacia el pecho, ayudándose con las manos (una en cada espinilla, bajo la
       rodilla); para intensificar, levanta la cabeza y acerca la barbilla al pecho; y mantiene */
    COREO['rodillas-al-pecho'] = (function () {
      var t = sobre(SUPINO_SUELO, sobre(AL_LADO, { p: TENDIDAS, t: { tob: 8 } }));
      var K0 = enrollado(sobre(SUPINO_SUELO, { p: { e: 124, z: 0, c: 130 }, t: { tob: 10 }, m: { tipo: 'suelta', prono: 60 } }), 12), E = resolver(K0);
      var g = mas(mezcla(E.i.rod, E.i.tob, 0.2), [2.5, 4.6, 1.5]);
      var k = conAgarre(K0, g, [1, -0.5, 0.2]), i = sobre(k, { col: [26, 0, 0], cab: [28, 0, 0] });
      return {
        vista: [[58, 20], [-22, 32]], rastro: 'rodillas', isometrico: 'i', clavos: NADA, clavosEn: { t: ['mi', 'md'] },
        posturas: { t: t, k: k, i: i }, inicio: 't', encuadra: ['t', 'k'],
        pasos: [{ sec: [['t', 0.8], ['k', 1.9, 'suave']], desde: 't' }, { sec: [['i', 1.3, 'suave']], desde: 'k' }, 'i']
      };
    })();

    /* la rotación de rodillas: boca arriba, con las rodillas dobladas y juntas; deja caer despacio las dos rodillas hacia un lado mientras
       la parte alta del cuerpo sigue quieta en el suelo (los brazos, abiertos, con las palmas abajo); mantiene y repite hacia el otro
       lado. La pelvis rueda sobre la cadera de ese lado y la columna gira lo mismo al revés (se busca): el pecho sigue mirando al techo */
    COREO['rotacion-rodillas-tumbado'] = (function () {
      var a = sobre(SUPINO_SUELO, sobre(ABIERTOS, { p: { suelo: [3.7, 54], abre: 0, polo: [0, 1, 0.2] } }));
      /* girado «f» de lo que gira (0 a 1): el tobillo de abajo, a la altura que deja la zapatilla posada (o a «hueco» cm del suelo) */
      var girado = function (f, hueco) {
        var rho = 52 * f, sr = Math.sin(rho * RAD), cr = Math.cos(rho * RAD), y0 = resolver(a).i.hom[1];
        /* la pelvis rueda sobre la cadera de ese lado y sube; el tronco baja de ella a los hombros, que siguen en el suelo (tau, se busca) */
        var G = function (tau) {
          var Q = function (tw) { return sobre(ABIERTOS, { pel: [6 * f, 11.5 - 0.9 * f + D.caderaX * sr, 20], base: baseEjes([0, -Math.sin(tau * RAD), -Math.cos(tau * RAD)], [sr, cr, 0]), col: [0, 0, tw], cab: [tau * 1.3, 0, 0] }); };
          return Q(busca(function (tw) { return aplicar(resolver(Q(tw)).Bt, [0, 0, 1])[0]; }, 0, -89, 89));
        };
        var b0 = f ? G(busca(function (tau) { var E = resolver(G(tau)); return (E.i.hom[1] + E.d.hom[1]) / 2; }, y0, 0, 25)) : G(0);
        var con = function (y) { return sobre(b0, { pi: { a: [3.7 + 11.3 * f, y, 54 - 4 * f], polo: [f, 1 - f, 0.25] }, pd: { a: [-3.7 + 17.2 * f, y + 9.4 * f, 54 - 7 * f], polo: [f, 1 - 0.88 * f, 0.25] }, t: { tob: 8 } }); };
        return con(busca(function (y) { return bajoZapa(resolver(con(y)).i, 'i'); }, hueco, 2, 14));
      };
      var m = girado(0.5, 0.8), b = girado(1, -0.3);
      return {
        vista: [[38, 26], [-30, 36]], rastro: 'rodillas', isometrico: 'b', clavos: K4,
        posturas: { a: a, m: m, b: b, m2: espejo(m), b2: espejo(b) }, inicio: 'a', encuadra: ['a', 'b', 'b2'],
        pasos: ['a', { sec: [['m', 1.2, 'entra'], ['b', 1.3, 'sale']], desde: 'a' }, { sec: [['b', 0.5], ['m', 0.7, 'entra'], ['a', 0.7, 'sale'], ['m2', 0.9, 'entra'], ['b2', 1.0, 'sale']], desde: 'b' }]
      };
    })();

    /* la retracción abdominal: boca arriba, con las rodillas dobladas y los pies apoyados; al final de una espiración lleva el ombligo
       hacia la columna, sin mover la cadera ni las costillas, y mantiene mientras sigue respirando. No se mueve nada: a0 y a son la misma
       postura (en la segunda brilla el abdomen) */
    COREO['retraccion-abdominal'] = (function () {
      var a = sobre(SUPINO_SUELO, sobre(AL_LADO, { p: { suelo: [11, 60], abre: 4, polo: [0.1, 1, 0.2] } }));
      return {
        vista: [[60, 18], [-24, 32]], isometrico: 'a', clavos: K4,
        posturas: { a0: a, a: sobre(a, {}) }, inicio: 'a0', encuadra: ['a'],
        pasos: ['a0', 'a', 'a']
      };
    })();

    /* la posición hueca: boca arriba, con los brazos (por encima de la cabeza) y las piernas estirados; despega a la vez del suelo la
       cabeza, los hombros, los brazos y las piernas, con la zona lumbar pegada al suelo; y mantiene */
    COREO['posicion-hueca'] = (function () {
      var arriba = function (P, y) {
        var h = resolver(P).i.hom, L = D.brazo + D.antebrazo - 0.4, k = Math.sqrt(1 - (y - h[1]) * (y - h[1]) / (L * L));
        return sobre(P, { b: { a: [h[0] + 2.5, y, h[2] - L * k], polo: [0.5, 0.3, 1] } });
      };
      var a = arriba(sobre(SUPINO_SUELO, { p: TENDIDAS, t: { tob: 8 }, m: apoyada([0, 0, -1], [0, 1, 0]) }), ALTO_MUN);
      var b = arriba(sobre(SUPINO_SUELO, { col: [26, 0, 0], cab: [6, 0, 0], p: { e: 13, z: 0, c: 0 }, t: { tob: 22 }, m: { tipo: 'plana', palma: [0, 1, 0] } }), 33);
      return {
        vista: [[60, 18], [-24, 32]], rastro: 'manos', isometrico: 'b',
        posturas: { a: a, b: b }, inicio: 'a', encuadra: ['a', 'b'],
        pasos: ['a', { sec: [['b', 1.6, 'empuje']], desde: 'a' }, 'b']
      };
    })();

    /* la elevación de piernas en banco: boca arriba en un banco, con las piernas fuera desde las rodillas (el banco acaba en ellas) y
       agarrado a sus cantos, junto a la cadera; con las piernas juntas y casi rectas, las sube hasta cerca de la vertical de la cadera;
       una pausa, y las baja despacio hasta casi la horizontal, sin apoyarlas en el banco */
    COREO['elevacion-piernas-banco'] = (function () {
      var H = 44, base = { pel: [0, H + 11.5, 20], giro: [0, -90, 0], b: { a: [15.6, H - 2.5, 13], polo: [1, 0.2, -0.3] }, m: { tipo: 'puno', barra: [0, 0, 1], palma: [-1, 0, 0] }, t: { tob: 16 } };
      var a = sobre(base, { p: { e: 5, z: 0, c: 5 } }), b = sobre(base, { p: { e: 83, z: 0, c: 7 } });
      return {
        vista: [[64, 12], [-26, 24]], rastro: 'pies', esfuerzo: [0, 1], clavos: ['mi', 'md'],
        material: [['banco', { en: [0, 0], largo: 120 }]],
        posturas: { a: a, b: b }, inicio: 'a', encuadra: ['a', 'b'],
        rep: [['b', 1.5, 'empuje'], ['b', 0.6], ['a', 2.0, 'freno'], ['a', 0.3]],
        pasos: ['a', { sec: [['b', 1.6, 'empuje']], desde: 'a' }, { rep: 1.5 }]
      };
    })();

    /* ══════════════════════════════ SENTADO EN EL SUELO ══════════════════════════════
       La cadera, a 11,8 cm del suelo (YS) */
    var YS = 11.8;

    /* el giro ruso: sentado en el suelo con las rodillas dobladas; inclina el tronco hacia atrás, con la espalda recta; despega los pies
       del suelo y gira el tronco hacia un lado hasta rozar el suelo con las manos; gira hacia el otro lado y alterna, con los pies en
       el aire */
    COREO['giro-ruso'] = (function () {
      var JUNTAS = { tipo: 'puno', prono: 0 }, s = { pel: [0, YS, 0], giro: [0, -27, 0], cab: [8, 0, 0], p: { suelo: [9, 50], abre: 3, polo: [0, 1, 0.15] }, b: { a: [3.4, 12, 25], en: 'torax', polo: [1, -0.7, 0.2] }, m: JUNTAS };
      var a = sobre(s, { p: { e: 104, z: 0, c: 76 }, t: { tob: 6 } });
      /* hacia su izquierda: el giro de la columna, con el signo que lleva hacia allí el hombro derecho (se mira) */
      var gira = function (g) { return sobre(a, { col: [6, 0, g], cab: [8, g * 0.45, 0] }); };
      var g0 = resolver(gira(40)).d.hom[0] > resolver(gira(-40)).d.hom[0] ? gira(40) : gira(-40);
      /* (22-11-2026) la mano de lejos va hacia donde roza la otra, hasta donde llega con el codo aún algo doblado (el suelo junto a la
         cadera contraria le queda a más de un brazo: estirándose del todo hacia él, el brazo recto dejaba de decir hacia dónde miraba
         la mano, que giraba de golpe). Y de un lado al otro pasa por el centro (a), con las manos ante el pecho: de un tirón, los
         brazos cruzaban doblándose 129° por el camino */
      var hd = resolver(g0).d.hom, L2 = D.brazo + D.antebrazo, lejos = mas(hd, por(unidad(menos([22.7, 22.1, 3.9], hd)), L2 - 2));
      var g = sobre(conAgarre(g0, [28, 5, 3], [1, 0.2, -0.6], 'bi'), { bd: { a: lejos, polo: [-0.2, -0.4, 1] } });
      return {
        vista: [[38, 16], [-34, 26]], rastro: 'manos', esfuerzo: [0, 1, 2, 3, 4, 5],
        posturas: { s: s, a: a, g: g, g2: refleja(g) }, inicio: 'g', encuadra: ['s', 'g', 'g2'],
        /* la repetición empieza por la pausa: al llegar a ella desde el paso anterior, el Director mezcla un instante lo que venía
           haciendo con lo que toca, y si lo que toca es ya levantar la mano por encima del muslo, la mezcla lo atraviesa */
        rep: [['g', 0.3], ['a', 0.5, 'entra'], ['g2', 0.5, 'sale'], ['g2', 0.3], ['a', 0.5, 'entra'], ['g', 0.5, 'sale']],
        pasos: ['s', { sec: [['a', 0.9, 'suave'], ['a', 0.2], ['g', 0.9, 'suave']], desde: 's' }, 'rep']
      };
    })();

    /* LOS L-SIT, en el suelo: las manos, de plano a los lados de la cadera; los brazos, estirados, bloqueados y a plomo bajo los hombros;
       el tronco, derecho. Lo que despega la cadera es empujar los hombros hacia abajo (hom): sentado derecho, el hombro de Jérôme queda
       justo a un brazo estirado del suelo (con la palma plana), y cada centímetro que bajan los hombros es uno que sube la cadera.
       Con ellos 6 cm abajo sube casi 6. Es poco, como en el ejercicio de verdad con las palmas en el suelo (las piernas quedan justo por
       encima de él). Lo que no vale es inclinar el tronco hacia delante y redondearlo para ganar sitio (así iba antes: 13° y la espalda
       curva): no es una L, y sentado así la pelvis apoya 2 cm más arriba, con lo que la cadera aún subía menos (4 cm).
       sentadoL busca la altura a la que la pelvis derecha toca el suelo (sentado: s, con los hombros donde dejan las palmas en el
       suelo), la altura de la cadera que estira los brazos con los hombros abajo (levantado: b) y dónde van las muñecas (w) */
    function sentadoL(inc, col, piernasB, piernasS) {
      var ZP = -4, L = D.brazo + D.antebrazo - 0.1, X = 28, BAJA = -6;
      var P = function (y, h) { return function (w) { return { pel: [0, y, ZP], giro: [0, inc, 0], col: [col, 0, 0], cab: [-(inc + col * 0.55), 0, 0], hom: [h, 0], b: { a: w, polo: [0.3, 0, -1] }, m: EN_SUELO }; }; };
      var alza = function (w) { return P(busca(function (y) { return largo(menos(resolver(P(y, BAJA)(w)).i.hom, w)); }, L, 8, 32), BAJA)(w); };
      var w = [X, ALTO_MUN, resolver(alza([X, ALTO_MUN, ZP + 2])).i.hom[2]], b0 = alza(w);
      var ys = busca(function (y) { return troncoAPlano(resolver(P(y, 0)(w)), [0, 0, 0], [0, 1, 0]); }, -0.3, 7, 14);
      var s0 = P(ys, busca(function (h) { return largo(menos(resolver(P(ys, h)(w)).i.hom, w)); }, L, -9, 5))(w);
      return { w: w, b: piernasB(b0), s: piernasS(s0) };
    }
    /* las piernas, juntas y estiradas, con los talones en el suelo: el tobillo, a una pierna de la cadera y a la altura que deja la
       zapatilla posada (se busca); o en el tobillo que se diga (el de otra postura) */
    function tendidas(P, tob) {
      var c = resolver(P).i.cad, con = function (y) { return sobre(P, { p: { a: [5, y, c[2] + Math.sqrt(77.95 * 77.95 - 25 - (c[1] - y) * (c[1] - y))], polo: [0, 1, 0] }, t: { tob: 0 } }); };
      if (tob) return sobre(P, { p: { a: [5, tob[1], tob[2]], polo: [0, 1, 0] }, t: { tob: 0 } });
      return con(busca(function (y) { return bajoZapa(resolver(con(y)).i, 'i'); }, -0.2, 3, 14));
    }
    /* el L-sit: sentado, con las piernas juntas y estiradas y las manos a los lados de la cadera; empuja con los brazos estirados hasta
       despegar del suelo la cadera y los pies, con las piernas rectas en forma de L; y mantiene */
    COREO['l-sit'] = (function () {
      var Q = sentadoL(0, 4, function (P) { var c = resolver(P).i.cad; return sobre(P, { p: { a: [5, c[1] + 0.5, c[2] + 77.78], polo: [0, 1, 0] }, t: { tob: 0 } }); }, tendidas);
      return {
        vista: [[64, 12], [28, 24]], rastro: 'pel', isometrico: 'b', clavos: ['mi', 'md'],
        posturas: { s: Q.s, b: Q.b }, inicio: 's', encuadra: ['s', 'b'],
        pasos: ['s', { sec: [['b', 1.5, 'empuje']], desde: 's' }, 'b']
      };
    })();
    /* con los pies apoyados: lo mismo, pero solo despega la cadera: los talones se quedan en el suelo y descargan parte del peso */
    COREO['l-sit-pies-apoyados'] = (function () {
      var Q = sentadoL(0, 4, function (P) { return P; }, tendidas), Es = resolver(Q.s).i, tob = Es.tob;
      /* al subir la cadera la pierna gira sobre el talón: el tobillo no se mueve y el pie se dobla lo justo (se busca) para seguir posado.
         El pie se dice en el mundo (la punta hacia arriba, «g» grados hacia delante): dicho por el tobillo sigue a la rodilla, y con la
         pierna casi recta la rodilla cambia de idea sobre hacia dónde se dobla (a media subida el pie giraba 30° de golpe) */
      var pieEn = function (g) { var r = g * RAD; return { punta: [0, Math.cos(r), Math.sin(r)], arriba: [0, Math.sin(r), -Math.cos(r)] }; };
      var con = function (g) { return sobre(Q.b, { p: { a: [5, tob[1], tob[2]], polo: [0, 1, 0] }, t: pieEn(g) }); };
      var b = con(busca(function (g) { return bajoZapa(resolver(con(g)).i, 'i'); }, -0.2, -25, 25));
      var s0 = sobre(Q.s, { t: pieEn(Math.atan2(Es.punta[2], Es.punta[1]) / RAD) });
      return {
        vista: [[64, 12], [28, 24]], rastro: 'pel', isometrico: 'b', clavos: K4,
        posturas: { s: s0, b: b }, inicio: 's', encuadra: ['s', 'b'],
        pasos: ['s', { sec: [['b', 1.5, 'empuje']], desde: 's' }, 'b']
      };
    })();
    /* con las rodillas encogidas: las manos en el suelo junto a la cadera, con los brazos estirados; despega el cuerpo y lleva las rodillas
       hacia el pecho, con los pies en el aire y la espalda erguida; y mantiene, con los hombros hacia abajo */
    COREO['l-sit-encogido'] = (function () {
      var Q = sentadoL(0, 6, function (P) { return sobre(P, { p: { e: 150, z: 0, c: 140 }, t: { tob: 8 } }); }, function (P) { return sobre(P, { p: { suelo: [9, resolver(P).i.cad[2] + 44], abre: 3, polo: [0, 1, 0.15] } }); });
      return {
        vista: [[64, 12], [28, 24]], rastro: 'pel', isometrico: 'b', clavos: ['mi', 'md'],
        posturas: { s: Q.s, b: Q.b }, inicio: 's', encuadra: ['s', 'b'],
        pasos: ['s', { sec: [['b', 1.5, 'empuje']], desde: 's' }, 'b']
      };
    })();

    /* ══════════════════════════════ COLGADO DE LA BARRA ══════════════════════════════
       Como la elevación de rodillas del bloque 1: la barra, a 225 cm; las muñecas, clavadas a 24 cm del centro. Con las piernas arriba el
       cuerpo se va hacia atrás (los brazos, inclinados) y la espalda se redondea: plegado(G, C, …) busca la altura de la cadera que deja
       los brazos estirados */
    var BARRA_D = ['barra_dominadas', { alto: 225, ancho: 62 }], K_BARRA = ['mi@0:24', 'md@0:-24'], ASIDO = { a: [24, 217, 0], polo: [1, -0.2, 0.5] };
    var COLGADO = { pel: [0, 121, -2], hom: [1, 0], p: { e: 4, z: 0, c: 8 }, t: { tob: 26 }, m: EN_BARRA, b: ASIDO };
    function plegado(G, C, zp, e, tob) {
      var P = function (y) { return { pel: [0, y, zp], giro: [0, G, 0], col: [C, 0, 0], cab: [C * 0.2, 0, 0], hom: [1, 0], p: { e: e, z: 0, c: 4 }, t: { tob: tob }, m: EN_BARRA, b: ASIDO }; };
      return P(busca(function (y) { return largo(menos(resolver(P(y)).i.hom, ASIDO.a)); }, D.brazo + D.antebrazo - 0.3, 100, 200));
    }

    /* la elevación de piernas rectas: colgado, con los brazos estirados; eleva las piernas estiradas hasta formar un ángulo recto con el
       tronco (quedan horizontales); una pausa, y las baja con control, sin balancearse */
    COREO['elevacion-piernas-colgado'] = (function () {
      var b = plegado(-9, 12, -7, 84, 6);
      return {
        vista: [[62, 0], [18, 4]], rastro: 'pies', esfuerzo: [0, 1], clavos: K_BARRA, material: [BARRA_D],
        posturas: { a: COLGADO, b: b }, inicio: 'a', encuadra: ['a', 'b'],
        rep: [['b', 1.4, 'empuje'], ['b', 0.6], ['a', 2.0, 'freno'], ['a', 0.4]],
        pasos: ['a', { sec: [['b', 1.5, 'empuje']], desde: 'a' }, { rep: 1.4 }]
      };
    })();

    /* con las piernas plegadas hacia la barra: se busca cuánto suben (e) para que la punta de los pies quede a «alto», y cuánto se va la
       cadera hacia atrás (zp) para que quede a «zd» de la barra (por delante de ella) */
    function aLaBarra(G, C, tob, alto, zd) {
      var con = function (zp) {
        var Q = function (e) { return plegado(G, C, zp, e, tob); };
        return Q(busca(function (e) { return resolver(Q(e)).i.dedosPie[1]; }, alto, 60, 176 + G));
      };
      return con(busca(function (zp) { return resolver(con(zp)).i.dedosPie[2]; }, zd, -70, -6));
    }
    /* los pies a la barra: colgado, con los brazos estirados; eleva las piernas hasta tocar la barra con las puntas de los pies; y las
       baja con control */
    COREO['pies-a-la-barra'] = (function () {
      var b = aLaBarra(-40, 36, 2, 223.4, 2.0), m = plegado(-22, 20, -13, 96, 14);
      return {
        vista: [[62, 0], [18, 4]], rastro: 'pies', esfuerzo: [0, 1, 2], clavos: K_BARRA, material: [BARRA_D],
        posturas: { a: COLGADO, m: m, b: b }, inicio: 'a', encuadra: ['a', 'b'],
        rep: [['m', 0.75, 'entra'], ['b', 0.75, 'sale'], ['b', 0.4], ['m', 0.95, 'entra'], ['a', 0.95, 'sale'], ['a', 0.4]],
        pasos: ['a', { sec: [['m', 0.8, 'entra'], ['b', 0.8, 'sale']], desde: 'a' }, { rep: 1.9 }]
      };
    })();

    /* el limpiaparabrisas: colgado; eleva las piernas estiradas hacia el techo; con las piernas rectas, las lleva hacia un lado y luego
       hacia el otro; y, al terminar, las baja con control. Las piernas barren porque la cadera gira bajo el tórax, que no se mueve: los
       dos hombros se quedan donde estaban, y las manos, en la barra (medido: un hombro que se aparta 3 cm deja la mano sin llegar).
       La pelvis que deja el tórax como estaba con ese giro de la columna: Bp = Bt · Rᵀ, con R el tórax visto desde la pelvis.
       La barra, más ancha que la de los otros (los postes, a 84 cm del centro): los pies barren hasta 72 cm a cada lado y caben entre ellos */
    COREO['limpiaparabrisas-colgado'] = (function () {
      var u = aLaBarra(-52, 34, 8, 236, 9), m = plegado(-26, 20, -14, 100, 14), Eu = resolver(u);
      var barrido = function (tw) {
        var R = resolver({ pel: [0, 100, 0], giro: [0, 0, 0], col: [u.col[0], 0, tw] }).Bt;
        var eje = function (n) { return mas(mas(por(Eu.Bt[0], R[0][n]), por(Eu.Bt[1], R[1][n])), por(Eu.Bt[2], R[2][n])); };
        var P = { pel: u.pel, base: baseEjes(eje(1), eje(2)), col: [u.col[0], 0, tw], cab: u.cab, hom: u.hom, p: u.p, t: u.t, m: u.m, b: u.b };
        return sobre(P, { pel: mas(P.pel, menos(Eu.i.hom, resolver(P).i.hom)) });
      };
      return {
        vista: [[22, 4], [70, 2]], rastro: 'pies', esfuerzo: [0, 1, 2, 3], clavos: K_BARRA, material: [['barra_dominadas', { alto: 225, ancho: 84 }]],
        posturas: { a: COLGADO, m: m, u: u, wi: barrido(-48), wd: barrido(48) }, inicio: 'wi', encuadra: ['a', 'u', 'wi', 'wd'],
        rep: [['wd', 1.3, 'suave'], ['wd', 0.2], ['wi', 1.3, 'suave'], ['wi', 0.2]],
        pasos: [{ sec: [['a', 0.6], ['m', 0.8, 'entra'], ['u', 0.8, 'sale']], desde: 'a' }, 'rep', { sec: [['u', 0.8, 'suave'], ['m', 1.0, 'entra'], ['a', 1.0, 'sale']], desde: 'wi' }]
      };
    })();

    /* ══════════════════════════════ EN BANCO, CON LOS PIES BAJO LOS RODILLOS ══════════════════════════════ */
    var CRUZ = { a: [-7, 11, 13.5], en: 'torax', polo: [1, -0.7, 0.3] };

    /* el crunch en banco declinado: boca arriba en un banco declinado (20°: la cabeza, más baja que la cadera), con las rodillas sobre el
       rodillo de arriba, los pies sujetos bajo el de abajo y los brazos cruzados sobre el pecho; sube el tronco despacio enrollando la
       espalda, una breve pausa arriba, y baja con control hasta apoyarla, sin mover la cabeza.
       El banco va con rumbo 180 (el respaldo cae hacia −Z, donde va la cabeza): en su marco, z = −(z del mundo − la del banco) */
    COREO['crunch-declinado'] = (function () {
      var DEC = 20, H = 58, LA = 30, LAR = 122, ZB = 2, s = Math.sin(DEC * RAD), c = Math.cos(DEC * RAD);
      var zh = ZB + LAR / 2 - LA, sup = function (d) { return [0, H - d * s, zh - d * c]; }, n = [0, c, -s];         /* la bisagra y el respaldo, cuesta abajo */
      var pel = mas(sup(7), por(n, 11.5)), K = [10, H + 7.4, zh + LA + 1.5], T = [10, K[1] - 36.2, K[2] - 11.5];
      var a = { pel: pel, giro: [0, -90 - DEC, 0], cab: [0, 0, 0], b: CRUZ, m: SUELTA, p: { a: T, polo: menos(K, mezcla([10, pel[1], pel[2]], T, 0.5)) }, t: { tob: 2 } };
      var b = sobre(a, { col: [38, 0, 0] });
      var loc = function (z) { return -(z - ZB); };
      return {
        vista: [[66, 12], [-30, 24]], rastro: 'hombros', esfuerzo: [0, 1], clavos: T2,
        material: [['banco', { en: [0, ZB], rumbo: 180, largo: LAR, alto: H, asiento: LA, respaldo: -DEC, rodillos: [[loc(K[2] + 1), K[1] - 10.6, -4], [loc(T[2] + 9.5), T[1] + 3.5, 3]] }]],
        posturas: { a: a, b: b }, inicio: 'a', encuadra: ['a', 'b'],
        rep: [['b', 1.5, 'empuje'], ['b', 0.5], ['a', 1.8, 'freno'], ['a', 0.4]],
        pasos: ['a', { sec: [['b', 1.6, 'empuje']], desde: 'a' }, { rep: 1.5 }]
      };
    })();

    /* la hiperextensión lumbar: en el banco de hiperextensiones (el cojín, a 90 cm: los muslos, apoyados en él; la cadera, justo por
       delante de su canto), con los tobillos bajo el rodillo y los brazos cruzados sobre el pecho; con la espalda recta, baja el tronco
       hacia el suelo flexionando por la cadera (66°); y sube despacio hasta que el tronco queda alineado con las piernas, sin pasar de
       la horizontal */
    COREO['hiperextension-lumbar'] = (function () {
      var H = 90, ZP = 10, pel = [0, H + 11.5, ZP], T = [10, H + 8.2, ZP - 77.4];
      var con = function (g, cab) { return { pel: pel, giro: [0, 90 + g, 0], cab: [cab, 0, 0], b: CRUZ, m: SUELTA, p: { a: T, polo: [0, -1, 0.1] }, t: { punta: [0, -0.94, -0.34], arriba: [0, 0.34, -0.94] } }; };
      var ZC = ZP - 26;                               /* el cojín: de ZP − 48 a ZP − 4 */
      return {
        vista: [[-68, 8], [-126, 16]], rastro: 'hombros', esfuerzo: [0, 1], clavos: T2,
        material: [['banco', { en: [0, ZC], largo: 44, alto: H, ancho: 32, rodillos: [[T[2] + 1.5 - ZC, T[1] + 9.6, 3]] }]],
        posturas: { a: con(66, -10), b: con(1, -8) }, inicio: 'a', encuadra: ['a', 'b'],
        rep: [['b', 1.7, 'empuje'], ['b', 0.4], ['a', 2.0, 'freno'], ['a', 0.4]],
        pasos: ['b', { sec: [['a', 2.0, 'freno']], desde: 'b' }, 'rep']
      };
    })();

    /* ══════════════════════════════ DE PIE ══════════════════════════════ */
    var NEUTRA = { tipo: 'puno', prono: 0 }, ANCHOS = { suelo: [17, 0], abre: 7 };
    /* el brazo del lado k, colgando a plomo de su hombro (con la mancuerna, que pesa): el puño, «fuera» cm más afuera que el hombro */
    function aPlomo(P, k, fuera, dz) {
      var h = resolver(P)[k === 'bd' ? 'd' : 'i'].hom, sg = k === 'bd' ? -1 : 1;
      return estirado(P, [h[0] + sg * (fuera || 0), h[1] - 100, h[2] + (dz == null ? 3 : dz)], k, 0.3, [sg, 0, -0.4]);
    }

    /* el crunch lateral de pie: con los pies a la anchura de los hombros y las manos detrás de la cabeza; inclina el tronco hacia un lado,
       acercando el codo a la cadera de ese lado; vuelve a la posición erguida y repite hacia el otro */
    COREO['crunch-lateral-de-pie'] = (function () {
      var a = { pel: [0, PIE - 0.4, 0], p: ANCHOS, b: { a: [8, 37, -8], en: 'torax', polo: [1, 0.2, 0.15] }, m: SUELTA };
      var i = sobre(a, { pel: [-2.6, PIE - 0.6, 0], col: [0, 32, 0], cab: [0, 0, 0] });
      return {
        vista: [[8, 6], [52, 10]], rastro: 'hombros', esfuerzo: [0, 1, 3, 4], clavos: T2,
        posturas: { a: a, i: i, d: refleja(i) }, inicio: 'a', encuadra: ['a', 'i', 'd'],
        rep: [['i', 1.0, 'suave'], ['i', 0.3], ['a', 0.9, 'suave'], ['d', 1.0, 'suave'], ['d', 0.3], ['a', 0.9, 'suave']],
        pasos: ['a', { sec: [['i', 1.1, 'suave']], desde: 'a' }, { rep: 1.3 }]
      };
    })();

    /* la flexión lateral con mancuerna: de pie, con los pies a la anchura de los hombros y las rodillas algo flexionadas, y una mancuerna
       en una mano (la derecha); inclina el tronco hacia ese lado todo lo que puede, doblándose solo por la cintura (la mancuerna baja a
       plomo junto a la pierna); sube despacio hasta quedar erguido y, al terminar, cambia la mancuerna de mano: junta las dos manos en el
       asa, por delante de la cadera, y se la lleva la izquierda */
    COREO['flexion-lateral-mancuerna'] = (function () {
      var Y = PIE - 0.9, de = function (col, x) { return { pel: [x, Y, 0], col: [0, col, 0], p: ANCHOS, m: NEUTRA, bi: aLosLados(9), mi: SUELTA }; };
      var a = aPlomo(de(0, 0), 'bd', 3), b = aPlomo(de(-27, 0), 'bd', 3);
      /* las dos manos, en el asa (atravesada, por delante de la cadera) */
      var EN_ASA = { tipo: 'puno', barra: [1, 0, 0], palma: [0, 0, -1] }, G = [4.4, Y - 6, 16.5];
      var x = conAgarre(sobre(de(0, 0), { m: EN_ASA }), G, [1, -0.2, -0.6]);
      var a2 = refleja(a), b2 = refleja(b);
      return {
        vista: [[10, 6], [58, 10]], rastro: 'hombros', esfuerzo: [0, 1], clavos: T2,
        material: [['mancuernas', { lado: 'd', cambia: { i: ['x', 'a2', 'b2'] } }]],
        posturas: { a: a, b: b, x: x, a2: a2, b2: b2 }, inicio: 'a', encuadra: ['a', 'b', 'b2'],
        rep: [['b', 1.5, 'freno'], ['b', 0.4], ['a', 1.6, 'empuje'], ['a', 0.4]],
        pasos: ['a', { sec: [['b', 1.6, 'freno']], desde: 'a' },
          { sec: [['a', 1.6, 'empuje'], ['a', 0.25], ['x', 0.9, 'suave'], ['x', 0.3], ['a2', 0.9, 'suave'], ['a2', 0.2], ['b2', 1.5, 'freno']], desde: 'b', dura: 6.2 }]
      };
    })();

    /* EL PASEO, andando de verdad (como los paseos con carga del bloque 8): cada paso son dos posturas, el doble apoyo y el apoyo en una
       pierna; el pie que pisa va clavado. tramo() da las posturas de N pasos hacia delante y su secuencia; alReves(), la misma al revés:
       andando hacia atrás hasta el punto de partida */
    var ZANCA = 50, N_PASOS = 4, SEP = 9;
    function tramo(base, pre) {
      var z = [0], k, P = {}, sec = [];
      for (k = 1; k <= N_PASOS; k++) z.push(ZANCA * (k - 0.4));
      var pie = function (lado, zz, talon) { return { suelo: [lado === 'i' ? SEP : -SEP, zz], abre: 5, talon: talon || 0 }; };
      P[pre + '0'] = sobre(base, { pel: [0, PIE - 0.6, 3], pi: pie('i', 0), pd: pie('d', 0) });
      for (k = 1; k <= N_PASOS; k++) {
        var s = k % 2 ? 'i' : 'd', o = s === 'i' ? 'd' : 'i', sg = s === 'i' ? 1 : -1, medio = (z[k] - z[k - 1]) / 2, d = {}, m = {};
        d.pel = [0, D.tobillo + Math.sqrt(77.6 * 77.6 - (medio - 3) * (medio - 3)), z[k - 1] + medio + 3]; d.giro = [-3 * sg, 0, 0]; d.col = [0, 0, 3 * sg];
        d['p' + s] = pie(s, z[k]); d['p' + o] = pie(o, z[k - 1], 30);
        P[pre + 'd' + k] = sobre(base, d);
        m.pel = [1.2 * sg, PIE - 1, z[k] + 3.5];
        m['p' + s] = pie(s, z[k]); m['p' + o] = { a: [-sg * (SEP - 1), 16.5, z[k] - 5], polo: [0, 0.1, 1] }; m['t' + o] = { punta: [0, -0.14, 0.99], arriba: [0, 0.99, 0.14] };
        P[pre + 'm' + k] = sobre(base, m);
        sec.push([pre + 'd' + k, k === 1 ? 0.46 : 0.25, k === 1 ? 'entra' : 'lineal', ['t' + (k === 1 ? 'd' : o)]], [pre + 'm' + k, 0.28, 'lineal', ['t' + s]]);
      }
      P[pre + 'f'] = sobre(base, { pel: [0, PIE - 0.6, z[N_PASOS] + 3], pi: pie('i', z[N_PASOS]), pd: pie('d', z[N_PASOS]) });
      sec.push([pre + 'f', 0.38, 'sale', ['t' + (N_PASOS % 2 ? 'i' : 'd')]]);
      return { P: P, sec: sec, largo: z[N_PASOS] };
    }
    function alReves(pre) {
      var sec = [], k;
      for (k = N_PASOS; k >= 1; k--) {
        var s = k % 2 ? 'i' : 'd', o = s === 'i' ? 'd' : 'i';
        sec.push([pre + 'm' + k, k === N_PASOS ? 0.4 : 0.25, k === N_PASOS ? 'entra' : 'lineal', ['t' + (k === N_PASOS ? s : o === 'i' ? 'd' : 'i')]]);
        sec.push([pre + 'd' + k, 0.28, 'lineal', ['t' + s]]);
      }
      sec.push([pre + '0', 0.46, 'sale', ['td']]);
      return sec;
    }
    /* el paseo de maleta: una mancuerna en una sola mano (la derecha), con el brazo estirado junto al cuerpo; anda hacia delante y hacia
       atrás con el tronco erguido, sin inclinarse hacia ningún lado; cambia la mancuerna de mano (como en la flexión lateral) y repite
       el recorrido */
    COREO['paseo-maleta'] = (function () {
      var carga = { bd: { e: 3, z: 90, g: 90, c: 4 }, md: NEUTRA, bi: aLosLados(9), mi: SUELTA }, otra = refleja(carga);
      var A = tramo(carga, 'a'), B = tramo(otra, 'w'), P = A.P, n, deB = ['x'];
      for (n in B.P) { P[n] = B.P[n]; deB.push(n); }
      var EN_ASA = { tipo: 'puno', barra: [1, 0, 0], palma: [0, 0, -1] };
      P.x = conAgarre(sobre(P.a0, { m: EN_ASA, bi: null, bd: null }), [4.4, PIE - 7, 19.5], [1, -0.2, -0.6]);
      var T2x = ['ti', 'td'];
      return {
        vista: [[-38, 14], [142, 12]], rastro: 'pel', clavos: T2x,
        material: [['mancuernas', { lado: 'd', cambia: { i: deB } }]],
        posturas: P, inicio: 'a0', encuadra: ['a0', 'af'],
        pasos: ['a0', { sec: A.sec.concat([['af', 0.3, null, T2x]], alReves('a')), desde: 'a0' },
          { sec: [['x', 0.8, 'suave', T2x], ['x', 0.25, null, T2x], ['w0', 0.8, 'suave', T2x]].concat(B.sec, [['wf', 0.3, null, T2x]], alReves('w')), desde: 'a0', dura: 8.3 }]
      };
    })();

    /* ══════════════════════════════ CON POLEA Y CON LA BARRA ANCLADA ══════════════════════════════ */
    /* una postura escrita mirando a +Z, llevada al mundo: girada «r» grados y con el origen en z0 (del bloque 8). Los brazos, si van
       dichos en el tórax, giran con ella */
    function enMarco(P, r, z0) {
      var B = giroY(r), R = {}, k;
      var pto = function (a) { var q = aplicar(B, [a[0], 0, a[2]]); return [q[0], a[1], q[2] + z0]; }, vec = function (a) { return aplicar(B, a); };
      for (k in P) R[k] = P[k];
      if (P.pel) R.pel = pto(P.pel);
      R.giro = [((P.giro && P.giro[0]) || 0) + r, (P.giro && P.giro[1]) || 0, (P.giro && P.giro[2]) || 0];
      ['pi', 'pd'].forEach(function (q) {
        var a = P[q], n = {}, j; if (!a) return;
        for (j in a) n[j] = a[j];
        if (a.suelo) { var su = pto([a.suelo[0], 0, a.suelo[1]]); n.suelo = [su[0], su[2]]; if (a.rumbo != null) n.rumbo = a.rumbo + r; else n.rumbo = r; }
        if (a.a) n.a = pto(a.a);
        if (a.polo) n.polo = vec(a.polo);
        R[q] = n;
      });
      ['ti', 'td'].forEach(function (q) { var a = P[q]; if (a && a.punta) R[q] = { punta: vec(a.punta), arriba: vec(a.arriba), flex: a.flex }; });
      return R;
    }
    /* la media vuelta, sobre el sitio y hacia su izquierda, en tres apoyos (del bloque 8): sale mirando a +Z, con los tobillos en z = 0, y
       acaba mirando a −Z, con los tobillos en z = 1 */
    function vuelta(base, pre) {
      var P = {}, izq = { suelo: [2, -12], rumbo: 96, abre: 0 };
      P[pre + '1'] = sobre(base, { pel: [1, PIE - 1.2, -2], giro: [48, 0, 0], pi: izq, pd: { suelo: [-SEP, 0], rumbo: 0, abre: 5 } });
      P[pre + 'm'] = sobre(base, { pel: [1.5, PIE - 1, -2.5], giro: [92, 0, 0], pi: izq, pd: { a: [-2, 15.5, 9], polo: [1, 0.1, 0.1] }, td: { punta: [0.99, -0.14, 0], arriba: [0.14, 0.99, 0] } });
      P[pre + '2'] = sobre(base, { pel: [2, PIE - 1.2, -3], giro: [136, 0, 0], pi: izq, pd: { suelo: [SEP, 1], rumbo: 180, abre: 5 } });
      return { P: P, sec: [[pre + '1', 0.32, 'suave', ['td']], [pre + 'm', 0.19, 'entra', ['ti']], [pre + '2', 0.19, 'sale', ['ti']]] };
    }

    /* el press Pallof: de pie, de lado a la polea (a su izquierda, a la altura del pecho), con el agarre en las dos manos junto al
       esternón; con el tronco mirando al frente, estira los brazos despacio hacia delante, sin dejar que el cable le gire; vuelve a
       llevar las manos al pecho y repite mirando hacia el otro lado (da media vuelta: la polea le queda a la derecha) */
    COREO['press-pallof-polea'] = (function () {
      var XP = 98, YA = 121, PIES = { pi: { suelo: [SEP, 0], abre: 5 }, pd: { suelo: [-SEP, 0], abre: 5 } };
      var manos = function (z) { return { bd: { a: [-1.4, 12.5, z], en: 'torax', polo: [-1, -0.7, 0.2] }, bi: { a: [5.6, 12.5, z], en: 'torax', polo: [1, -0.7, 0.2] }, m: NEUTRA }; };
      var a = sobre(sobre({ pel: [0, PIE - 1.2, 0] }, PIES), manos(15)), b = sobre(a, manos(47.6));
      var V = vuelta(manos(15), 'v'), P = { a: a, b: b, a2: enMarco(a, 180, 1), b2: enMarco(b, 180, 1) }, n;
      for (n in V.P) P[n] = V.P[n];
      return {
        vista: [[-30, 10], [-78, 8]], rastro: 'md', esfuerzo: [0, 1], clavos: T2,
        material: [['polea', { en: [XP, 0], rumbo: 90, alto: YA, a: 'd', agarre: 'asa', encuadre: 170 }]],
        posturas: P, inicio: 'a', encuadra: ['a', 'b', 'b2'],
        rep: [['b', 1.6, 'freno'], ['b', 0.6], ['a', 1.6, 'suave'], ['a', 0.4]],
        pasos: ['a', { sec: [['b', 1.7, 'freno']], desde: 'a' },
          { sec: [['a', 1.6, 'suave'], ['a', 0.2]].concat(V.sec, [['a2', 0.32, 'suave', ['td']], ['a2', 0.3], ['b2', 1.6, 'freno']]), desde: 'b' }]
      };
    })();

    /* el leñador: la polea, un poco por debajo de la altura del pecho y a su izquierda; de lado a ella, con la cadera estable y mirando al
       frente; con los brazos estirados, lleva el asa hacia delante cruzando por delante del cuerpo (gira el tronco: 38° hacia la polea
       al empezar y otros tantos hacia el otro lado al acabar); sostiene un instante y vuelve despacio */
    COREO['lenador-polea'] = (function () {
      var XP = 104, YA = 110, base = { pel: [0, PIE - 1.8, 0], p: ANCHOS, m: NEUTRA };
      var brazos = { bd: { a: [-1.4, 7, 46.5], en: 'torax', polo: [-1, -0.5, 0] }, bi: { a: [5.6, 7, 46.5], en: 'torax', polo: [1, -0.5, 0] } };
      /* el giro de la columna (con la cabeza al frente: gira lo mismo al revés), con el signo que lleva las manos hacia +X */
      var girado = function (g) { return sobre(base, sobre(brazos, { col: [0, 0, g], cab: [0, 0, 0] })); };
      var sg = resolver(girado(30)).d.mun[0] > resolver(girado(-30)).d.mun[0] ? 1 : -1;
      var con = function (g) {
        var Q = function (y) { return sobre(girado(sg * g), { cab: [0, y, 0] }); };
        return Q(busca(function (y) { return resolver(Q(y)).Bc[2][0]; }, 0, -80, 80));
      };
      return {
        vista: [[-22, 10], [-70, 8]], rastro: 'md', esfuerzo: [0, 1], clavos: T2,
        material: [['polea', { en: [XP, 0], rumbo: 90, alto: YA, a: 'd', agarre: 'asa', encuadre: 170 }]],
        posturas: { a: con(38), b: con(-38) }, inicio: 'a', encuadra: ['a', 'b'],
        rep: [['b', 1.3, 'empuje'], ['b', 0.5], ['a', 1.9, 'freno'], ['a', 0.4]],
        pasos: ['a', { sec: [['b', 1.4, 'empuje']], desde: 'a' }, { rep: 1.3 }]
      };
    })();

    /* el crunch en polea alta: de rodillas ante la polea, con el cable (la cuerda) en las manos, junto a las sienes, y el tronco recto,
       inclinado hacia delante; baja enrollando la espalda, con los codos apuntando hacia las rodillas; y vuelve despacio.
       (20-11-2026) Junto a las sienes de verdad. Las manos iban a un punto fijo del tórax que caía bajo la barbilla, a 5 cm del eje
       de la cara: los puños quedaban dentro de la mandíbula, y los ramales de la cuerda, que van del nudo a cada puño, le cruzaban
       la cabeza (13 cm: lo mide la auditoría, «la cabeza y las barras»). Ahora cada puño va a un lado de la cabeza (SIEN, dicho en
       la cabeza: a 17,8 cm de su eje, pegado al pelo, y a la altura de la sien) y la sigue cuando la cabeza gira; los ramales la
       rodean por fuera. La columna, 12 cm más lejos: el cable baja más tendido y, enrollado, la cabeza no se le echa encima */
    COREO['crunch-polea'] = (function () {
      var SIEN = [17.8, 23, 0], POLO = [0.25, -0.5, 1];
      var de = function (g, col, cab) {
        var P = { pel: [0, 47, -3], giro: [0, g, 0], col: [col, 0, 0], cab: [cab, 0, 0], p: { a: [10, 7, -38], polo: [0, -1, 1] }, t: { punta: [0, -0.1, -1], arriba: [0, -1, 0.1] }, m: NEUTRA };
        /* el puño, en el marco del tórax (la cabeza gira «cab» grados sobre su base, que está a D.cabeza de él); y la muñeca, donde haga
           falta para que el puño caiga ahí */
        var q = mas([0, D.cabeza, 0], aplicar(giroX(cab), SIEN)), w = [q[0], q[1] - 6, q[2] + 3], i, E;
        for (i = 0; i < 12; i++) { E = resolver(sobre(P, { b: { a: w, en: 'torax', polo: POLO } })); w = mas(w, menos(q, aLocal(E.Bt, menos(E.i.agarre, E.tor)))); }
        return sobre(P, { b: { a: w, en: 'torax', polo: POLO } });
      };
      return {
        vista: [[70, 8], [112, 12]], rastro: 'hombros', esfuerzo: [0, 1], clavos: T2,
        material: [['polea', { en: [0, 108], alto: 204, a: 'manos', agarre: 'cuerda' }]],
        posturas: { a: de(26, 0, -14), b: de(31, 70, 4) }, inicio: 'a', encuadra: ['a', 'b'],
        rep: [['b', 1.5, 'empuje'], ['b', 0.4], ['a', 1.9, 'freno'], ['a', 0.4]],
        pasos: ['a', { sec: [['b', 1.6, 'empuje']], desde: 'a' }, { rep: 1.9 }]
      };
    })();

    /* la rotación con landmine: sujeta con las dos manos el extremo libre de una barra anclada al suelo (delante de él: su punta va por
       la esfera que le deja el anclaje) y lo empuja hacia arriba hasta estirar los brazos en alto; gira el tronco para bajar la barra
       en arco hacia un lado de la cadera (el izquierdo); y la sube con control hasta la posición inicial */
    COREO['rotacion-landmine'] = (function () {
      var PIV = [0, 5, 179], R = 206.7, PAL_L = [[0.89, -0.45, -0.07], [-0.49, -0.76, -0.43]];
      var punta = function (x, y) { return [x, y, PIV[2] - Math.sqrt(R * R - x * x - (y - PIV[1]) * (y - PIV[1]))]; };
      /* cada mano dice la barra tal como va (dicha una vez para las dos, la derecha la llevaba reflejada) y hacia dónde mira su palma:
         arriba, la una hacia la otra (pi, pd: si no se dicen) */
      var con = function (t, extra, pi, pd) {
        var d = unidad(menos(PIV, t)), P = sobre({ pel: [0, PIE - 1.5, 0], p: ANCHOS, mi: { tipo: 'puno', barra: d, palma: pi || [-1, 0, 0] }, md: { tipo: 'puno', barra: d, palma: pd || [1, 0, 0] } }, extra || {});
        return conAgarre(conAgarre(P, [t[0] + 4.3, t[1], t[2]], [1, -0.6, -0.2], 'bi'), [t[0] - 4.3, t[1], t[2]], [-1, -0.6, -0.2], 'bd');
      };
      var c = con(punta(0, 139)), t = con(punta(0, 166), { hom: [1.5, 0], pel: [0, PIE - 1.5, 2.5], giro: [0, 4, 0] });
      /* hacia la cadera izquierda: el tronco gira hacia allí (el signo, el que adelanta el hombro derecho) y se inclina un poco */
      var gira = function (g) { return { pel: [2.5, PIE - 2.4, 0], col: [6, 5, g], cab: [4, g * 0.3, 0] }; };
      var gl = resolver(sobre({ p: ANCHOS }, gira(36))).d.hom[2] > resolver(sobre({ p: ANCHOS }, gira(-36))).d.hom[2] ? 36 : -36;
      /* (22-11-2026) abajo, las manos siguen del lado de la barra por el que la cogieron arriba (no la sueltan): al bajarla junto a la
         cadera, la izquierda queda entre la barra y el cuerpo, con la palma hacia fuera, y la derecha, que cruza, encima, con la palma
         hacia abajo. Dichas «la una hacia la otra» también abajo, a media bajada la palma dejaba de decir de qué lado de la barra
         quedaba la mano y los dos puños daban media vuelta de golpe (en cada repetición, al bajar y al subir) */
      var l = con(punta(29, 91), gira(gl), PAL_L[0], PAL_L[1]);
      return {
        vista: [[-34, 10], [18, 8]], rastro: 'manos', esfuerzo: [2, 3], clavos: T2,
        material: [['landmine', { pivote: [PIV[0], PIV[2]], a: 'manos', sobra: 8, dentro: 26, discos: 13 }]],
        posturas: { c: c, t: t, l: l }, inicio: 't', encuadra: ['c', 't', 'l'],
        rep: [['l', 1.6, 'freno'], ['l', 0.3], ['t', 1.5, 'empuje'], ['t', 0.4]],
        pasos: [{ sec: [['c', 0.9], ['t', 1.3, 'empuje']], desde: 'c' }, { sec: [['l', 1.7, 'freno']], desde: 't' }, { rep: 1.9 }]
      };
    })();
  })();
