  /* ───────────────────────── las coreografías: CON CINTA DE SUSPENSIÓN, FITBALL, DISCO, BALÓN MEDICINAL, ANILLAS Y RUEDA (bloque 15) ─────────────────────────
     Las mismas reglas que en 70-coreografias.js: cada una sale de los pasos verificados de su ficha y no añade técnica
     que la ficha no diga. Son de todos los grupos, y lo que tienen en común es el material (50-material.js): el disco y
     el balón medicinal, que van en las manos (o pegados al cuerpo, o volando); el fitball, que rueda con lo que lleva
     encima; la cinta de suspensión y las anillas, que cuelgan de un pórtico; y la rueda y la barra, que ruedan por el
     suelo. Van por material.
     Donde el movimiento es el de un ejercicio de otro bloque, las posturas son las de aquel, vueltas a escribir aquí
     con sus números: cada trozo lleva lo suyo. */
  (function () {
    var T2 = ['ti', 'td'], TM = ['mi', 'md'];
    /* las piernas de una flexión: casi rectas, con la rodilla 6° doblada hacia el suelo (se aparta 2 cm de la línea de la cadera al
       tobillo, que queda una décima más cerca). Rectas del todo (la `tabla` de siempre: e 0, c 0), la rodilla no tiene lado: de una
       postura a otra el pie va clavado, la pierna se vuelve a resolver «hacia donde ya se doblaba», y a medio tramo cambiaba de lado
       de golpe (un salto de 7 a 12 cm en un cuadro, con la rodilla doblada 14° de paso; con las piernas tensas, de 2) */
    var CASI_RECTAS = { e: 2.9, z: 0, c: 6 };
    var NEU = { tipo: 'puno', prono: 0 };
    /* P con el centro de la palma (o del puño) izquierdo en «q», dicho en el marco del tórax (el derecho, en su reflejo): la muñeca va
       donde haga falta. Lo que se sujeta contra el cuerpo va con el tronco cuando gira o se inclina */
    function enTorax(P, q, polo, k) {
      k = k || 'b';
      var w = [q[0], q[1] - 5, q[2] - 3], i, E, c = {}, lado = k === 'bd' ? 'd' : 'i';
      for (i = 0; i < 12; i++) { c[k] = { a: w, en: 'torax', polo: polo }; E = resolver(sobre(P, c)); w = mas(w, menos(q, aLocal(E.Bt, menos(E[lado].agarre, E.tor)))); }
      c[k] = { a: w, en: 'torax', polo: polo };
      return sobre(P, c);
    }

    /* lo mismo con la mano de plano: los dedos hacia «dedos» y la palma mirando a «palma», dichos también en el tórax (lado: 'i' o 'd').
       La muñeca depende de cómo quede la mano y la mano de dónde quede el brazo: se afina en unas vueltas */
    function palmaEnTorax(P, lado, q, polo, dedos, palma) {
      var k = 'b' + lado, m = {}, i, Q, Bt;
      m['m' + lado] = { tipo: 'plana', prono: 90 };
      for (i = 0; i < 4; i++) { Q = enTorax(sobre(P, m), q, polo, k); Bt = resolver(Q).Bt; m['m' + lado] = manoHacia(Q, lado, aplicar(Bt, dedos), aplicar(Bt, palma), 'plana'); }
      return enTorax(sobre(P, m), q, polo, k);
    }

    /* ══════════════════════════════ EL DISCO ══════════════════════════════
       Cogido por los lados (las tres y las nueve), el disco queda de cara, como un volante: las manos, en el canto, con el pulgar
       hacia arriba. RD: su radio */
    var RD = 15, M39 = { tipo: 'puno', barra: [0, 1, 0], palma: [-1, 0, 0] };
    var volante = ['disco', { radio: RD, ejeMundo: [0, 0, 1] }];

    /* la sentadilla con el disco al frente: de pie, los pies algo más abiertos que los hombros y el disco delante del cuerpo, con los
       brazos estirados; lleva la cadera atrás y baja todo lo que puede; aguanta abajo unos instantes y sube */
    COREO['sentadilla-con-disco'] = (function () {
      var pies = { suelo: [21, 0], abre: 14, polo: [0.32, 0.1, 1] };
      /* los brazos, estirados al frente desde el hombro, un poco por debajo de él */
      var con = function (P) { var h = resolver(P).i.hom; return estirado(sobre(P, { m: M39 }), [RD - 1, h[1] - 4, h[2] + 58], 'b', 0.8, [1, -0.6, 0]); };
      return {
        vista: [42, 90], rastro: 'pel', esfuerzo: [2], clavos: T2,
        material: [volante],
        posturas: { a: con({ p: pies }), b: con({ pel: [0, 42, -25], giro: [0, 36, 0], col: [3, 0, 0], cab: [-30, 0, 0], p: pies }) },
        rep: [['b', 1.7, 'freno'], ['b', 1.0], ['a', 1.3, 'empuje'], ['a', 0.5]],
        pasos: ['a', 'rep', 'rep']
      };
    })();

    /* la elevación frontal con disco: de pie, recto, el disco cogido por los lados; con los brazos casi estirados sube por delante hasta
       la altura de los hombros; y baja despacio */
    COREO['elevacion-frontal-disco'] = (function () {
      var con = function (y, z, polo) { return conAgarre(sobre(DE_PIE, { m: M39, hom: [-1, -1] }), [RD - 1, y, z], polo); };
      return {
        vista: [58, 0], rastro: 'manos', esfuerzo: [0], clavos: T2,
        material: [volante],
        posturas: { a: con(73, 16, [1, -0.3, -0.5]), b: con(HOMBRO, 54, [1, -0.5, 0]) },
        rep: [['b', 1.3, 'empuje'], ['b', 0.3], ['a', 1.9, 'freno'], ['a', 0.45]],
        pasos: ['a', 'rep', 'rep']
      };
    })();

    /* el curl invertido con disco: de pie, las rodillas algo flexionadas; el disco, cogido por arriba (las once y la una), con las palmas
       hacia abajo: cuelga de las manos. Con los codos pegados a los lados sube despacio hacia la cabeza, y baja despacio */
    COREO['curl-invertido-disco'] = (function () {
      var base = { pel: [0, PIE - 3, -1], p: { suelo: [12, 0], abre: 8 }, m: PRONO };
      var C = [19.6, HOMBRO - 3 - 26.8, 2], G = RD * 0.5, cae = RD * Math.sqrt(0.75);       /* el codo; las manos, a media cuerda del centro; y lo que cuelga el centro del disco */
      var con = function (fi) { return sobre(base, { b: flexionG(base, C, fi, null, G) }); };
      return {
        vista: [50, 0], rastro: 'manos', esfuerzo: [0], clavos: T2,
        material: [['disco', { radio: RD, corre: cae }]],
        posturas: { a: con(17), b: con(132) },
        rep: [['b', 1.7, 'suave'], ['b', 0.35], ['a', 2.0, 'freno'], ['a', 0.45]],
        pasos: ['a', 'rep', 'rep']
      };
    })();

    /* la pinza de discos: dos discos juntos, de canto en el suelo, cogidos en pinza por arriba (los dedos por un lado y el pulgar por
       el otro); los levanta y los mantiene sujetos, de pie, con el brazo a lo largo del cuerpo */
    COREO['pinza-discos'] = (function () {
      var R = 14, X = -27, CAE = R + 3;                      /* el radio; a qué lado; y lo que queda el centro por debajo de la palma */
      var pinza = { tipo: 'suelta', prono: 0 };
      var con = function (P, y, z) { return sobre(conAgarre(sobre(P, { md: pinza }), [X, y, z], [-1, 0.2, -0.6], 'bd'), {}); };
      return {
        vista: [-48, 28], isometrico: 'b', clavos: T2,
        material: [['disco', { a: 'd', radio: R, grosor: 3, doble: true, punto: [0, -CAE, 0], ejeMundo: [1, 0, 0] }]],
        posturas: {
          s: con({ pel: [0, 54, -24], giro: [0, 44, 0], col: [4, 0, 0], cab: [-34, 0, 0], p: { suelo: [12, 0], abre: 9, polo: [0.3, 0.1, 1] } }, R + CAE, 6),
          b: con(DE_PIE, PIE - 15.5, 1)
        },
        inicio: 's', encuadra: ['s', 'b'],
        pasos: ['s', { sec: [['s', 0.5], ['b', 1.8, 'empuje']], desde: 's' }]
      };
    })();

    /* la sentadilla sissy con disco: una mano, agarrada a un soporte (un poste, a su izquierda); la otra sostiene un disco contra el
       pecho. Con los pies bien apoyados baja el cuerpo hacia el suelo —las rodillas van adelante y abajo, los talones se levantan y
       el tronco se echa atrás en línea con los muslos— hasta doblar casi del todo las rodillas; y vuelve a subir */
    COREO['sentadilla-sissy-disco'] = (function () {
      var XP = 36, ZP = 26, YP = 84, RS = 13;                 /* el poste; a qué altura lo coge; y el radio del disco */
      var enPoste = { tipo: 'puno', barra: [0, 1, 0], palma: [1, 0, 0.3] };
      var con = function (P) {
        var Q = conAgarre(sobre(P, { mi: enPoste }), [XP, YP, ZP], [0.5, -1, -0.2], 'bi');
        /* la palma, contra el disco; los dedos, cruzando el pecho hacia su izquierda y algo hacia arriba */
        return palmaEnTorax(Q, 'd', [-5, 10.5, 19.4], [-1, -0.8, 0.2], [1, 0.35, 0], [0, 0, -1]);
      };
      /* abajo (u = 1): la espinilla, casi tendida (12° sobre el suelo), con los talones levantados 56°; el muslo y el tronco, en una
         línea a 38° del suelo. p1, m y p3 son por donde pasa (u = 0,25, 0,5 y 0,75): con los tobillos clavados de a a b, la punta
         del pie, que es lo que pisa, se hundía centímetro y medio a medio camino (el tobillo sube por un arco, no derecho). Y el paso
         lo marca la cadera (lo que anda ella: porPosturas): en la primera mitad anda la mitad que en la segunda, y con los dos tramos
         igual de largos doblaba el paso de golpe al pasar por m (de 27 a 62 cm/s) */
      var pies = { suelo: [10, 0], abre: 6 };
      var en = function (u) {
        var g = (90 - 78 * u) * RAD, al = (90 - 52 * u) * RAD, tal = deTalon(56 * u), K = [tal[1] + D.tobillo + D.pierna * Math.sin(g), tal[0] + D.pierna * Math.cos(g)];
        return con({ pel: [0, K[0] + D.muslo * Math.sin(al), K[1] - D.muslo * Math.cos(al)], giro: [0, -52 * u, 0], cab: [26 * u, 0, 0], p: { suelo: [10, 0], abre: 6, talon: 56 * u, polo: [0, -0.3, 1] } });
      };
      var N = ['a', 'p1', 'm', 'p3', 'b'], P = { a: con({ p: pies }) }, S = [0], i;
      for (i = 1; i < N.length; i++) { P[N[i]] = en(i / 4); S.push(S[i - 1] + largo(menos(resolver(P[N[i]]).pel, resolver(P[N[i - 1]]).pel))); }
      return {
        vista: [-58, 24], rastro: 'pel', esfuerzo: [5, 6, 7, 8], clavos: ['ti', 'td', 'mi'],
        material: [['poste', { en: [XP, ZP], alto: 122 }], ['disco', { a: 'torax', punto: [-3, 10.5, 16.7], eje: [0, 0, 1], radio: RS }]],
        posturas: P,
        rep: porPosturas(2.0, 1.5, [0.4, 0.5], N, S),
        pasos: ['a', 'rep', 'rep']
      };
    })();

    /* ══════════════════════════════ EL BALÓN MEDICINAL ══════════════════════════════
       Entre las dos manos: cada palma, a un lado del balón y mirando a su centro. Las manos van dichas en el mundo (la palma y los
       dedos, como la mano que se apoya en el suelo): así, de una postura a otra, las palmas siguen enfrentadas y a la misma distancia,
       hagan lo que hagan los codos (con el giro del antebrazo de cada postura, a medio camino se le cerraban sobre el balón).
       conBalon(P, C, R, polo, dedos): la postura P con el balón de radio R en C (del mundo) y los dedos hacia «dedos» (sin componente
       de lado a lado).
       alCuerpo(P, c, R, polo, dedos): lo mismo con el centro, el codo y los dedos dichos en el tórax: los brazos quedan dichos en él
       (de una postura a otra con el tronco girado o inclinado de otra manera son los mismos, y el balón no se mueve del sitio del
       cuerpo donde va) y las palmas miran a donde mire el tórax */
    /* la muñeca queda del centro del balón a lo que haga falta (se busca) para que la mano, tal como se dibuja, lo coja: los dedos,
       que van algo curvados, se le hunden 3 mm y la palma queda rozándolo */
    function conBalon(P, C, R, polo, dedos) {
      var d = unidad(dedos);
      var con = function (x) { return sobre(P, { b: { a: [C[0] + R + x, C[1] - D.mano * d[1], C[2] - D.mano * d[2]], polo: polo }, m: { tipo: 'abierta', palma: [-1, 0, 0], dedos: d } }); };
      return con(busca(function (x) { return huecoPelota(resolver(con(x)), [['mano', 'i']], C, R); }, -0.3, -2, 7));
    }
    function alCuerpo(P, c, R, polo, dedos) {
      var E0 = resolver(P), Bt = E0.Bt, d = unidad(dedos), dm = aplicar(Bt, d), C = mas(E0.tor, aplicar(Bt, c));
      var con = function (x) {
        return sobre(P, { b: { a: [c[0] + R + x, c[1] - D.mano * d[1], c[2] - D.mano * d[2]], en: 'torax', polo: polo },
          mi: { tipo: 'abierta', palma: por(Bt[0], -1), dedos: dm }, md: { tipo: 'abierta', palma: Bt[0], dedos: dm } });
      };
      return con(busca(function (x) { return huecoPelota(resolver(con(x)), [['mano', 'i']], C, R); }, -0.3, -2, 7));
    }

    /* el lanzamiento a la pared: frente a ella, con el balón en las manos y los pies a la anchura de los hombros; baja en sentadilla;
       y al subir lanza el balón contra la pared lo más alto que puede, y lo recoge */
    COREO['lanzamiento-balon-pared'] = (function () {
      var ZW = 84, R = 12, pies = { suelo: [18, 0], abre: 12, polo: [0.3, 0.1, 1] };
      var alPecho = function (P) { return alCuerpo(P, [0, 11, 15.4 + R], R, [0.8, -1, 0], [0, 0.75, 0.66]); };
      /* arriba: los brazos estirados hacia donde va el balón, con los hombros subidos */
      var arriba = function (P) { var h = resolver(P).i.hom; return conBalon(P, [0, h[1] + 53, h[2] + 26], R, [1, -0.2, 0.6], [0, 0.9, 0.44]); };
      return {
        vista: [[104, 10], [152, 14]], rastro: 'pel', esfuerzo: [0], clavos: T2,
        material: [['pared', { z: ZW, alto: 292, ancho: 170 }], ['balon_medicinal', { radio: R, suelta: [{ de: 'c', a: 'c', en: [0, 264, ZW - R], u: [0, 0.5] }] }]],
        posturas: {
          a: alPecho({ p: pies, cab: [-4, 0, 0] }),
          b: alPecho({ pel: [0, 44, -23], giro: [0, 30, 0], col: [4, 0, 0], cab: [-26, 0, 0], p: pies }),
          c: arriba({ p: pies, cab: [-16, 0, 0], hom: [2.5, 0] })
        },
        inicio: 'b', encuadra: ['a', 'c'],
        rep: [['c', 0.6, 'empuje'], ['c', 1.1], ['b', 1.2, 'freno'], ['b', 0.3]],
        pasos: ['a', { sec: [['b', 1.5, 'freno']], desde: 'a' }, 'rep']
      };
    })();

    /* el lanzamiento contra el suelo: de pie, los pies a la anchura de las caderas y el balón delante del pecho; flexiona cadera y
       rodillas con la espalda plana y lleva el balón atrás, entre las piernas; se levanta con fuerza hasta ponerse de puntillas, con el
       balón por encima y por detrás de la cabeza; y lo lanza contra el suelo, entre los pies, volviendo a flexionar la cadera.
       Al bajarlo la primera vez pasa por delante de las rodillas (k) antes de ir atrás: derecho desde el pecho, las manos se le
       metían en los muslos.
       El balón sube por delante del cuerpo y pasa por encima de la cabeza (m1, m2 y t son por donde pasa: en línea recta de abajo
       arriba le cruzaría la cara, y de delante atrás, el tupé: con los brazos estirados pasa a dos dedos de él, así que va por su
       arco, alrededor de los hombros), y baja por el mismo camino (x) hasta que lo suelta. Las manos van clavadas en cada tramo:
       el balón va de un sitio a otro en línea recta. Las rodillas, abiertas: el balón y las manos pasan entre ellas */
    COREO['lanzamiento-balon-medicinal-suelo'] = (function () {
      var R = 10, pies = { suelo: [12.5, 0], abre: 20, polo: [0.95, 0.1, 1] }, ptas = { suelo: [12.5, 0], abre: 20, talon: 34 }, sube = deTalon(34)[1];
      var T4 = ['ti', 'td', 'mi', 'md'];
      var bisagra = function (y, z, g) { return { pel: [0, y, z], giro: [0, g, 0], cab: [-g * 0.62, 0, 0], p: pies }; };
      var dePuntas = { pel: [0, PIE + sube, 1.5], giro: [0, -4, 0], hom: [3.5, 0], p: ptas }, hp = resolver(dePuntas).i.hom;
      /* arriba, con los brazos estirados: el balón, en el arco que tiene su centro en los hombros (a 57,3 cm de ellos), «z» cm por delante.
         La cabeza, echada atrás (mira al balón): con la cabeza derecha, el balón, que pasa a medio metro de los hombros, se le
         metería en el tupé */
      var enArco = function (z, cab, polo, dedos) { return conBalon(sobre(dePuntas, { cab: [cab, 0, 0] }), [0, hp[1] + Math.sqrt(57.3 * 57.3 - z * z), hp[2] + z], R, polo, dedos); };
      return {
        vista: [-56, 26], rastro: 'manos', esfuerzo: [0, 1, 2, 3, 6, 7, 8, 9, 10], clavos: T4,
        material: [['balon_medicinal', { radio: R, suelta: [{ de: 'x', a: 's', en: [0, R, 13], u: [0.3, 0.8], va: 'entra', vuelve: 'sale' }] }]],
        posturas: {
          a: alCuerpo({ p: pies }, [0, 9, 18.4 + R], R, [0.8, -1, 0], [0, 0.75, 0.66]),
          q: conBalon(bisagra(63, -25, 58), [0, 37, -9], R, [1, 0.1, -0.5], [0, -0.8, -0.6]),
          /* (22-11-2026) al levantarlo, el balón pasa pegado al cuerpo, con los codos bien doblados (n): es por donde iba, a medio camino
             entre cogerlo (q) y tenerlo delante (m1), y ahora lo dice una postura (lo que se dobla tanto de paso tiene que decirse) */
          n: conBalon({ pel: [0, 71.5, -17], giro: [0, 40, 0], cab: [-24, 0, 0], p: pies }, [0, 82.5, 27.5], R, [1, -0.25, -0.25], [0, -0.82, 0.57]),
          m1: conBalon({ pel: [0, 80, -9], giro: [0, 22, 0], cab: [-12, 0, 0], p: pies }, [0, 128, 56], R, [1, -0.6, 0], [0, 0.3, 0.95]),
          k: conBalon(bisagra(72, -15, 36), [0, 46, 25], R, [1, -0.3, -0.3], [0, -0.95, 0.3]),
          m2: enArco(17, -28, [1, -0.1, 0.6], [0, 0.95, 0.3]),
          t: enArco(3, -34, [1, 0, 0.55], [0, 1, 0.05]),
          r: enArco(-6, -36, [1, 0.05, 0.5], [0, 0.99, -0.12]),
          x: conBalon({ pel: [0, PIE - 2, -4], giro: [0, 12, 0], cab: [-4, 0, 0], p: pies }, [0, 150, 45], R, [1, -0.5, 0.2], [0, 0.5, 0.87]),
          s: conBalon(bisagra(66, -23, 52), [0, 33, 21], R, [1, -0.4, -0.3], [0, -0.9, 0.44])
        },
        inicio: 'r', encuadra: ['a', 'r'],
        rep: [['t', 0.07, 'lineal'], ['m2', 0.07, 'lineal'], ['x', 0.2, 'lineal'], ['s', 0.3, 'sale'], ['s', 0.5], ['q', 0.75, 'suave'], ['n', 0.2, 'lineal'], ['m1', 0.2, 'lineal'], ['m2', 0.25, 'lineal'], ['t', 0.11, 'lineal'], ['r', 0.16, 'sale'], ['r', 0.3]],
        pasos: ['a', { sec: [['k', 0.8, 'entra'], ['q', 0.6, 'sale']], desde: 'a' }, { sec: [['n', 0.23, 'lineal'], ['m1', 0.22, 'lineal'], ['m2', 0.28, 'lineal'], ['t', 0.12, 'lineal'], ['r', 0.18, 'sale']], desde: 'q' }, 'rep']
      };
    })();

    /* la rotación de tronco sentado: en el suelo, con las rodillas dobladas y los talones apoyados (las piernas, algo abiertas: el balón
       cabe entre ellas), y un balón ligero junto al abdomen; con el pecho alto gira despacio el tronco y el balón hacia un lado, sin
       inclinarse hacia atrás; hace una pausa y gira hacia el otro, con el balón pegado al cuerpo */
    COREO['rotacion-tronco-balon-sentado'] = (function () {
      var R = 10, pu = [0, 0.57, 0.82], ar = [0, 0.82, -0.57];
      var de = function (g) {
        return alCuerpo({ pel: [0, 11.8, 0], giro: [0, -6, 0], col: [-3, 0, g], cab: [4, g * 0.4, 0], p: { a: [18, 10.4, 69], polo: [0.15, 1, 0.2] }, t: { punta: pu, arriba: ar } },
          [0, 2.5, 12.2 + R], R, [1, -0.6, 0.1], [0, 0.35, 0.94]);
      };
      return {
        vista: [[38, 16], [-34, 26]], rastro: 'manos', esfuerzo: [0, 2], clavos: T2,
        material: [['balon_medicinal', { radio: R }]],
        posturas: { s: de(0), g: de(42), g2: de(-42) },
        inicio: 'g', encuadra: ['s', 'g', 'g2'],
        rep: [['g2', 1.9, 'suave'], ['g2', 0.6], ['g', 1.9, 'suave'], ['g', 0.6]],
        pasos: ['s', { sec: [['g', 1.4, 'suave']], desde: 's' }, 'rep']
      };
    })();

    /* ══════════════════════════════ EL FITBALL ══════════════════════════════
       Una pelota de 60 cm (RF, su radio). Lo que se apoya en ella queda a su radio del centro: el tobillo de un pie que la pisa, a
       RF + 8 (lo que hay del tobillo a la planta); una espinilla, a RF + 5,5; un muslo, a RF + 7,6; el tronco, a RF + 11. Cuando rueda,
       el material la lleva debajo de lo que tiene encima (sigue) */
    var RF = 30, T4 = ['ti', 'td', 'mi', 'md'], EN_OREJAS = { a: [12.5, 35, 1.5], en: 'torax', polo: [1, -0.15, -0.25] };
    function pelota(o) { return ['fitball', une({ radio: RF }, o)]; }
    /* boca arriba en el suelo, con los hombros en z = −23,5 (no se mueven) y el tronco levantado «al» grados desde ellos hasta la cadera.
       La parte alta de la espalda sigue en el suelo (apretada contra él como cuando está tumbado) y la cabeza también: el cuello se
       dobla lo que haga falta (la base del cuello baja al inclinarse el tronco, y la barbilla se va al pecho) */
    function puente(al, extra) {
      var s = Math.sin(al * RAD), c = Math.cos(al * RAD);
      var P = function (y, cab) { return sobre({ pel: [0, y + 43.5 * s, -23.5 + 43.5 * c], giro: [0, -90 - al, 0], cab: [cab, 0, 0] }, extra || {}); };
      var y = busca(function (x) { return troncoAPlano(resolver(P(x, al)), [0, 0, 0], [0, 1, 0]); }, -2.2, 4, 18);
      return P(y, busca(function (k) { return cabezaAPlano(resolver(P(y, k)), [0, 0, 0], [0, 1, 0]); }, -3, al - 8, al + 55));
    }
    var BRAZOS_SUELO = { b: { a: [27, ALTO_MUN, 25], polo: [1, 0.2, 0] }, m: EN_SUELO }, ABIERTOS = { b: { a: [50, ALTO_MUN, -12], polo: [0.3, 0.2, -1] }, m: apoyada([1, 0, 0.2]) };

    /* el puente de glúteos con los pies en el fitball: boca arriba, las rodillas dobladas y los pies encima de la pelota; sin moverla,
       empuja con los talones y despega la cadera del suelo, con los hombros y la parte alta de la espalda en él, hasta la línea recta de
       las rodillas a la cabeza; y baja despacio. Los pies no se mueven de la pelota: pisan su cara de este lado, 28° por debajo de la cima */
    COREO['puente-gluteos-fitball'] = (function () {
      var FI = 28 * RAD, ZC = 86, A = [11, RF + (RF + D.tobillo - 1.2) * Math.cos(FI), ZC - (RF + D.tobillo - 1.2) * Math.sin(FI)];
      var pies = { p: { a: A, polo: [0.1, 1, 0.2] }, t: { punta: [0, Math.sin(FI), Math.cos(FI)], arriba: [0, Math.cos(FI), -Math.sin(FI)] } };
      /* arriba: la rodilla, en la línea de los hombros y la cadera (a un muslo de ella) y a una pierna del tobillo */
      var al = busca(function (x) { var P = puente(x); return largo(menos(mas(P.pel, por([0, Math.sin(x * RAD), Math.cos(x * RAD)], D.muslo)), [0, A[1], A[2]])); }, D.pierna, 2, 30);
      return {
        vista: [72, [28, 30]], picado: 16, rastro: 'pel', esfuerzo: [0, 1], clavos: T4,
        material: [pelota({ en: [0, ZC] })],
        posturas: { a: sobre(SUPINO_SUELO, sobre(pies, BRAZOS_SUELO)), b: puente(al, sobre(pies, BRAZOS_SUELO)) },
        rep: [['b', 1.3, 'empuje'], ['b', 0.7], ['a', 1.9, 'freno'], ['a', 0.5]],
        pasos: ['a', 'rep', 'rep', 'rep']
      };
    })();

    /* el curl femoral en fitball: boca arriba, las pantorrillas y los talones sobre la pelota y los brazos abiertos; sube la cadera hasta
       alinear cadera, tronco y piernas; sin bajarla, dobla las rodillas y acerca la pelota hasta que las plantas quedan sobre ella; y
       estira las piernas despacio y baja la cadera. La pelota rueda con los pies.
       tal(P, k): la pierna izquierda (o la derecha) de P, estirada, con el talón sobre la pelota (el tobillo, a YT del suelo) */
    var TAL = { tob: 12 }, PLANTA = { punta: [0, 0.2, 0.98], arriba: [0, 0.98, -0.2] }, LP = 77.4, RP = RF + 5.5;
    /* la pierna, estirada desde la cadera y a «g» grados del suelo, descansa en la pelota por la pantorrilla, a 8 cm del tobillo, si
       la cadera está a «y» del suelo y (LP − 8)·sen g − RP·cos g = RF − y */
    function cuesta(y) { return busca(function (g) { return (LP - 8) * Math.sin(g * RAD) - RP * Math.cos(g * RAD); }, RF - y, 5, 70); }
    function estirada(P, x, k, g) {
      var c = resolver(P)[k].cad, q = {}, dy = LP * Math.sin(g * RAD);
      q['p' + k] = { a: [x, c[1] + dy, c[2] + Math.sqrt(LP * LP - dy * dy - (x - c[0]) * (x - c[0]))], polo: [0, 1, 0.1] }; q['t' + k] = TAL;
      return sobre(P, q);
    }
    /* tumbado, con la cadera en el suelo; y con la cadera arriba, en línea de los hombros a los talones (el tronco y las piernas, a AL_REC grados) */
    var G_SUELO = cuesta(11.5), AL_REC = busca(function (x) { return (LP - 8) * Math.sin(x * RAD) - RP * Math.cos(x * RAD) + 43.5 * Math.sin(x * RAD); }, RF - 12, 5, 60);
    /* recogida: la planta sobre la pelota (el tobillo, a YP del suelo y a ZR de los hombros) y la rodilla en la línea de los hombros y la cadera */
    var YP = RF + 36.2, ZR = 64;
    var AL_DOB = busca(function (x) { var P = puente(x); return largo(menos(mas(P.pel, por([0, Math.sin(x * RAD), Math.cos(x * RAD)], D.muslo)), [0, YP, ZR])); }, D.pierna, 35, 62);
    function recogida(P, x, k) { var q = {}; q['p' + k] = { a: [x, YP, ZR], polo: [0, 1, -0.3] }; q['t' + k] = PLANTA; return sobre(P, q); }
    COREO['curl-femoral-fitball'] = (function () {
      var dos = function (f, P, g) { return f(f(P, 10, 'i', g), -10, 'd', g); };
      return {
        vista: [74, [30, 32]], picado: 16, rastro: 'pel', esfuerzo: [0], clavos: ['mi', 'md'],
        material: [pelota({ sigue: { que: 'pierna' }, en: [0, 98] })],
        posturas: {
          s: dos(estirada, sobre(SUPINO_SUELO, ABIERTOS), G_SUELO),
          u: dos(estirada, puente(AL_REC, ABIERTOS), AL_REC),
          c: dos(recogida, puente(AL_DOB, ABIERTOS))
        },
        inicio: 'u', encuadra: ['s', 'c'],
        rep: [['c', 1.4, 'empuje'], ['c', 0.4], ['u', 1.9, 'freno'], ['u', 0.3]],
        pasos: ['s', { sec: [['u', 1.4, 'empuje']], desde: 's' }, 'rep', { sec: [['u', 1.9, 'freno'], ['u', 0.25], ['s', 1.5, 'freno']], desde: 'c' }]
      };
    })();
    /* a una pierna: con las piernas estiradas y los talones en la pelota, sube la cadera; levanta una pierna recta hacia arriba; dobla la
       rodilla de la que queda en la pelota y acerca el talón mientras sube más la cadera; y la estira despacio, sin bajar la otra */
    COREO['curl-femoral-fitball-una-pierna'] = (function () {
      /* la pierna derecha, recta hacia arriba: a plomo desde la cadera. La rodilla (10° doblada) mira hacia la cabeza, que es hacia donde
         dobla con la pierna en alto (22-11-2026: miraba hacia los pies, 3,4 cm al revés, y al levantarla el pie se daba la vuelta de golpe) */
      var alta = function (P) { var c = resolver(P).d.cad; return sobre(P, { pd: { a: [c[0], c[1] + 77.6, c[2] + 4], polo: [0, 0.2, -1] }, td: { tob: 6 } }); };
      return {
        vista: [74, [30, 32]], picado: 16, rastro: 'pel', esfuerzo: [0], clavos: ['mi', 'md'],
        material: [pelota({ sigue: { que: 'pierna', lado: 'i', x: 2 }, en: [2, 98] })],
        posturas: {
          s: estirada(estirada(sobre(SUPINO_SUELO, ABIERTOS), 8, 'i', G_SUELO), -8, 'd', G_SUELO),
          u: estirada(estirada(puente(AL_REC, ABIERTOS), 8, 'i', AL_REC), -8, 'd', AL_REC),
          u1: alta(estirada(puente(AL_REC, ABIERTOS), 8, 'i', AL_REC)),
          c1: alta(recogida(puente(AL_DOB, ABIERTOS), 8, 'i'))
        },
        inicio: 'u1', encuadra: ['s', 'c1'],
        rep: [['c1', 1.5, 'empuje'], ['c1', 0.4], ['u1', 2.0, 'freno'], ['u1', 0.3]],
        pasos: [{ sec: [['s', 0.9], ['u', 1.4, 'empuje']], desde: 's' }, { sec: [['u1', 1.4, 'suave']], desde: 'u' }, 'rep', 'rep']
      };
    })();

    /* ── lo que se apoya en la pelota, medido con el dibujo (huecoPelota, 50-material.js) ──
       aPelota(P, piezas, C): lo que les falta a esas piezas de la postura P para tocar la pelota de centro C.
       posada(P, piezas, C, dir): P con la cadera corrida hacia «dir» lo justo para que la toquen sin meterse */
    var TRONCO = [['tronco']], PIERNAS = [['zapa', 'i'], ['zapa', 'd'], ['pierna', 'i'], ['pierna', 'd'], ['muslo', 'i'], ['muslo', 'd']];
    function aPelota(P, piezas, C, R) { return huecoPelota(resolver(P), piezas, C, R || RF); }
    function posada(P, piezas, C, dir, lo, hi) {
      var d = unidad(dir), k = busca(function (x) { return aPelota(sobre(P, { pel: mas(P.pel, por(d, x)) }), piezas, C); }, 0, lo == null ? -8 : lo, hi == null ? 8 : hi);
      return sobre(P, { pel: mas(P.pel, por(d, k)) });
    }
    var CRUZ = { a: [-7, 11, 13.5], en: 'torax', polo: [1, -0.7, 0.3] };

    /* el crunch en fitball: sentado en la pelota con los pies firmes en el suelo, se desliza hasta que la zona lumbar queda apoyada en
       lo alto; con las manos cruzadas sobre el pecho sube la cabeza, los hombros y el pecho; hace una pausa y vuelve despacio.
       La cadera no se mueve: queda en la cara de delante de la pelota, a 22° de la cima, y la espalda se arquea sobre ella */
    COREO['crunch-fitball'] = (function () {
      var C = [0, RF, 0], FI = 22 * RAD, dir = [0, Math.cos(FI), Math.sin(FI)];
      var a = posada({ pel: mas(C, por(dir, RF + 11)), giro: [0, -68, 0], col: [-30, 0, 0], cab: [10, 0, 0], p: { suelo: [14, 53], abre: 8, polo: [0.25, 1, 0.3] }, b: CRUZ, m: SUELTA }, TRONCO, C, dir);
      return {
        vista: [74, [30, 32]], picado: 12, rastro: 'hombros', esfuerzo: [0, 1], clavos: T2,
        material: [pelota({ en: [0, 0] })],
        posturas: { a: a, b: sobre(a, { col: [20, 0, 0], cab: [16, 0, 0] }) },
        rep: [['b', 1.2, 'empuje'], ['b', 0.5], ['a', 1.7, 'freno'], ['a', 0.4]],
        pasos: ['a', 'rep', 'rep']
      };
    })();

    /* la extensión lumbar en fitball: boca abajo sobre la pelota, con las puntas de los pies bien apoyadas en el suelo y las manos junto
       a las orejas; sube el pecho separándolo de la pelota; y baja despacio hasta apoyarlo otra vez. La cadera queda en la cara de
       atrás de la pelota y no se mueve; las piernas, tampoco */
    COREO['extension-lumbar-fitball'] = (function () {
      var C = [0, RF, 0], FI = 30 * RAD, dir = [0, Math.cos(FI), -Math.sin(FI)];
      var de = function (g, col, cab) {
        return posada({ pel: mas(C, por(dir, RF + 10.5)), giro: [0, g, 0], col: [col, 0, 0], cab: [cab, 0, 0], p: { a: [11, TOB_PUNTA, -77], polo: [0, -1, 0.3] }, t: PIES_PUNTA, b: EN_OREJAS, m: SUELTA },
          [['tronco'], ['muslo', 'i'], ['muslo', 'd']], C, dir);
      };
      return {
        vista: [78, [32, 34]], picado: 12, rastro: 'hombros', esfuerzo: [0, 1], clavos: T2,
        material: [pelota({ en: [0, 0] })],
        posturas: { a: de(60, 34, -8), b: de(44, -8, -10) },
        rep: [['b', 1.5, 'empuje'], ['b', 0.5], ['a', 2.0, 'freno'], ['a', 0.4]],
        pasos: ['a', 'rep', 'rep']
      };
    })();

    /* las manos en el suelo, bajo los hombros, y las piernas en la pelota: lo que tienen en común el encogimiento de rodillas y la pica */
    var W_SUELO = [21, ALTO_MUN, 13], MANOS_SUELO = { b: { a: W_SUELO, polo: [0.6, 0.25, -1] }, m: EN_SUELO };

    /* el encogimiento de rodillas: boca abajo sobre la pelota, avanza con las manos hasta apoyar las rodillas encima, con las manos bajo
       los hombros; con el cuerpo recto lleva las rodillas hacia el pecho (AV cm) haciendo rodar la pelota hasta apoyar las espinillas
       (la cadera sube); y estira de nuevo las piernas. La pelota rueda la mitad de lo que avanzan las rodillas: lo que se apoya en ella
       pasa de las rodillas a las espinillas. La cadera sube deprisa al principio (el tronco y los muslos son una bisagra que se
       cierra: con el primer centímetro de rodillas sube seis) y a cada paso las piernas siguen posadas en la pelota. Va por seis
       tramos, con las rodillas 1, 4, 9, 16 y 25 cm adelantadas en las posturas de paso (p1 a p5: más juntas al principio), y el paso
       lo marca la cadera (lo que anda ella): las rodillas y la pelota salen despacio. Con tres tramos iguales en rodillas, al pasar
       por el primero la cadera perdía de golpe la mitad de su paso (de 74 a 37 cm/s) */
    COREO['encogimiento-rodillas-fitball'] = (function () {
      var E9 = 9 * RAD, BETA = 9.5 * RAD, RUEDA = 0.54, AV = 36;
      /* recto, con los brazos estirados: el cuerpo sube 9° hacia los pies, que quedan en el aire */
      var a = aUnBrazo(function (y) { return sobre({ pel: [0, y, 13 - 43.5 * Math.cos(E9)], giro: [0, 99, 0], cab: [-14, 0, 0], p: { e: 0, z: 0, c: 0 }, t: { tob: 38 } }, MANOS_SUELO); }, W_SUELO, 40, 80);
      var Ea = resolver(a), ZK = Ea.i.rod[2], CA = pelotaContra(Ea, PIERNAS, 0, RF, -1), SH = [Ea.i.hom[1], Ea.i.hom[2]];
      /* con las rodillas «av» cm más adelante: la espinilla, tendida en la pelota (baja BETA hacia la rodilla, que queda a «yk» del suelo);
         la cadera, donde cierran el muslo y el tronco entre la rodilla y los hombros; y el tronco, girado hasta dejar los brazos estirados */
      var recogido = function (av, yk) {
        var u = av / AV, zk = ZK + av, K = [yk, zk], A = [10, yk + D.pierna * Math.sin(BETA), zk - D.pierna * Math.cos(BETA)];
        var cuerda = 43.5 - 1.0 * u, b = [SH[0] - K[0], SH[1] - K[1]], lb = Math.sqrt(b[0] * b[0] + b[1] * b[1]);
        var p = (D.muslo * D.muslo - cuerda * cuerda + lb * lb) / (2 * lb), h = Math.sqrt(Math.max(0, D.muslo * D.muslo - p * p));
        var H = [K[0] + (b[0] * p + b[1] * h) / lb, K[1] + (b[1] * p - b[0] * h) / lb];
        return aUnBrazo(function (g) { return sobre({ pel: [0, H[0], H[1]], giro: [0, g, 0], col: [28 * u, 0, 0], cab: [-14 - 14 * u, 0, 0], p: { a: A, polo: [0, -1, 0.25] }, t: { tob: 38 + 14 * u } }, MANOS_SUELO); }, W_SUELO, 92, 176);
      };
      /* a la altura a la que las piernas tocan la pelota, que ha rodado RUEDA · av */
      var en = function (av) { var C = [0, RF, CA + RUEDA * av]; return recogido(av, busca(function (y) { return aPelota(recogido(av, y), PIERNAS, C); }, 0, 56, 72)); };
      var NP = 6, N = ['a'], P = { a: a }, S = [0], i;
      for (i = 1; i <= NP; i++) { N.push(i === NP ? 'b' : 'p' + i); P[N[i]] = en(AV * i * i / (NP * NP)); S.push(S[i - 1] + largo(menos(resolver(P[N[i]]).pel, resolver(P[N[i - 1]]).pel))); }
      return {
        vista: [78, [32, 34]], picado: 12, rastro: 'pel', esfuerzo: [0, 1, 2, 3, 4, 5], clavos: ['mi', 'md'], tensos: TM,
        material: [pelota({ sigue: { que: 'rod', mapa: [[ZK, CA], [ZK + AV, CA + RUEDA * AV]] }, en: [0, CA] })],
        posturas: P,
        rep: porPosturas(1.4, 1.8, [0.4, 0.4], N, S),
        pasos: ['a', 'rep', 'rep']
      };
    })();

    /* la pica: desde boca abajo sobre la pelota avanza con las manos hasta apoyar solo las puntas de los pies, con los brazos estirados;
       con las piernas rectas sube la cadera hasta ponerla sobre los hombros mientras la pelota rueda hacia las manos; y baja despacio
       a la línea recta. Los tobillos van a la misma altura todo el camino (las puntas, en lo alto de la pelota, que va con ellas);
       m1 y m2 son por donde pasa: los brazos y las piernas no se doblan */
    COREO['pica-fitball'] = (function () {
      var YA = 2 * RF + TOB_PUNTA, L = 77.95;
      /* la cadera, donde digan las piernas (a «fi» grados del suelo desde los tobillos, que están en z = zt); el tronco, a «beta» */
      var P = function (fi, beta, zt, cab) {
        return sobre({ pel: [0, YA + L * Math.sin(fi * RAD), zt + L * Math.cos(fi * RAD)], giro: [0, 90 + beta, 0], cab: [cab, 0, 0],
          p: { a: [10, YA, zt], polo: [0, -0.64, 0.77] }, t: PIES_PUNTA }, MANOS_SUELO);
      };
      var en = function (beta, zt, cab) { return aUnBrazo(function (x) { return P(x, beta, zt, cab); }, W_SUELO, -30, 80); };
      var ZA = -106.7, ZB = -60, de = function (u, cab) { return en(9.8 + 78.2 * u, ZA + (ZB - ZA) * u, cab); };
      var a = de(0, -16), Ea = resolver(a);
      /* lo más bajo de la zapatilla (lo que pisa la cima de la pelota), respecto a la punta del pie */
      var bajo = (function () {
        var cs = [], min = 1e9, c = null;
        zapaAPlano(Ea.i, 'i', [0, 0, 0], [0, 1, 0], function (q) { cs.push(q); return false; });
        cs.forEach(function (q, j) { var i = 0, h = zapaAPlano(Ea.i, 'i', [0, 0, 0], [0, 1, 0], function () { return i++ === j; }); if (h < min) { min = h; c = q; } });
        return c[2] - Ea.i.dedosPie[2];
      })();
      return {
        vista: [78, [32, 34]], picado: 12, rastro: 'pel', esfuerzo: [0, 1, 2], clavos: T4, tensos: T4,
        material: [pelota({ sigue: { que: 'dedosPie', x: 0, dz: bajo }, en: [0, ZA] })],
        /* la cabeza: al subir sigue mirando al suelo, entre las manos (tiene los hombros a medio metro de él y, colgando recta, el tupé lo rozaría) */
        posturas: { a: a, m1: de(1 / 3, -28), m2: de(2 / 3, -40), b: de(1, -50) },
        rep: [['m1', 0.64, 'entra'], ['m2', 0.32, 'lineal'], ['b', 0.64, 'sale'], ['b', 0.5], ['m2', 0.8, 'entra'], ['m1', 0.4, 'lineal'], ['a', 0.8, 'sale'], ['a', 0.4]],
        pasos: ['a', 'rep', 'rep']
      };
    })();

    /* la flexión con las manos en el fitball: en posición de flexión, las manos a los lados de la parte alta de la pelota, bajo los
       hombros, y los pies en el suelo; aprieta la pelota con las manos y mantiene la línea; baja despacio hacia ella y empuja hasta
       casi estirar los codos, sin bloquearlos. Las manos, de plano en la pelota, a 42° de su cima: la palma mira a su centro */
    COREO['flexion-manos-fitball'] = (function () {
      var C = [0, RF, -8], FI = 42 * RAD, rad = [Math.sin(FI), Math.cos(FI), 0];
      var mi = { tipo: 'abierta', palma: [-rad[0], -rad[1], 0], dedos: [0, 0, 1] }, md = { tipo: 'abierta', palma: [rad[0], -rad[1], 0], dedos: [0, 0, 1] };
      var T = function (ang, w, cab) { return tabla(ang, { b: { a: w, polo: [0.55, 0.25, -1] }, mi: mi, md: md, cab: [cab == null ? -16 : cab, 0, 0], p: CASI_RECTAS }); };
      /* la muñeca, donde la mano toca la pelota sin meterse */
      var W = (function () {
        var w = function (x) { return mas(C, mas(por(rad, RF + x), [0, 0, -4])); };
        return w(busca(function (x) { return huecoPelota(resolver(T(44, w(x))), [['mano', 'i']], C, RF); }, 0, 0, 9));
      })();
      return {
        vista: [78, [34, 30]], picado: 10, rastro: 'pecho', esfuerzo: [2], clavos: T4, tensos: T2,
        material: [pelota({ en: [0, C[2]] })],
        posturas: {
          a: T(busca(function (x) { return largo(menos(resolver(T(x, W)).i.hom, W)); }, D.brazo + D.antebrazo - 1.1, 30, 62), W),
          b: T(busca(function (x) { return aPelota(T(x, W, -22), TRONCO, C); }, 2, 22, 52), W, -22)
        },
        rep: bajaSube('b', 'a', [1.7, 0.2, 1.2, 0.5]),
        pasos: ['a', 'a', 'rep']
      };
    })();

    /* la flexión con los pies en el fitball: los empeines y las espinillas, sobre la pelota, y las manos en el suelo, a la anchura de
       los hombros; empuja hasta estirar los brazos y hace una pausa; baja el pecho despacio hacia el suelo y vuelve a subir.
       Los tobillos no se mueven y los pies tampoco giran (el empeine, hacia abajo, descansa en la pelota): la pelota se queda donde
       la tocan las espinillas con el pecho abajo, que es cuando más bajan (arriba se despegan medio centímetro) */
    COREO['flexion-pies-fitball'] = (function () {
      var YT = 2 * RF + 2.5, ZT = -100, manos = { a: [24, ALTO_MUN, 21.5], polo: [0.55, 0.25, -1] };
      var P = function (ang, cab) {
        var s = Math.sin(ang * RAD), c = Math.cos(ang * RAD);
        return { pel: [0, YT + 78 * s, ZT + 78 * c], giro: [0, 90 - ang, 0], cab: [cab, 0, 0], p: CASI_RECTAS, t: { punta: [0, -0.423, -0.906], arriba: [0, -0.906, 0.423] }, b: manos, m: EN_SUELO };
      };
      var b = P(-18.5, -30);
      return {
        vista: [80, [34, 30]], picado: 12, rastro: 'pecho', esfuerzo: [2], clavos: T4, tensos: T2,
        material: [pelota({ en: [0, pelotaContra(resolver(b), [['pierna', 'i'], ['pierna', 'd']], 0, RF, -1)] })],
        posturas: { a: aUnBrazo(function (x) { return P(x, -14); }, manos.a, -22, 12), b: b },
        rep: bajaSube('b', 'a', [1.7, 0.2, 1.1, 0.5]),
        pasos: ['a', 'a', 'rep']
      };
    })();

    /* el curl sentado en el fitball: sentado en la pelota con los pies bien apoyados delante, una mancuerna en cada mano; con los codos
       a los lados y la espalda recta sube las mancuernas hasta el pecho; hace una pausa y las baja despacio. Los brazos, algo
       abiertos: las mancuernas cuelgan a los lados de la pelota */
    COREO['curl-fitball'] = (function () {
      var C = [0, RF, 0];
      /* sentado algo por delante de la cima (8 cm): así los muslos salen de la pelota rozándola, sin hundirse en ella */
      var P = posada({ pel: [0, 2 * RF + 11, 8], p: { suelo: [17, 45], abre: 12, polo: [0.3, 0.2, 1] } }, TRONCO, C, [0, 1, 0], -3, 4);
      var h = resolver(P).i.hom, CO = mas(h, por(unidad([Math.sin(9 * RAD), -Math.cos(9 * RAD), 0.035]), D.brazo));
      return {
        vista: [-40, 6], rastro: 'mi', esfuerzo: [0, 1], clavos: T2,
        material: [pelota({ en: [0, 0] }), ['mancuernas']],
        posturas: { a: sobre(P, { b: flexion(P, CO, 6), m: NEU }), b: sobre(P, { b: flexion(P, CO, 146), m: SUPINO }) },
        rep: [['b', 1.3, 'empuje'], ['b', 0.7], ['a', 2.0, 'freno'], ['a', 0.45]],
        pasos: ['a', 'rep', { rep: 1.3 }]
      };
    })();

    /* la flexión sobre balón medicinal: las dos manos sobre el balón, una a cada lado, con los hombros justo encima; las piernas,
       estiradas, y el cuerpo, recto; baja despacio hasta que el pecho roza el balón y empuja hasta estirar los codos */
    COREO['flexion-balon-medicinal'] = (function () {
      var R = 11, C = [0, R, 10], FI = 45 * RAD, rad = [Math.sin(FI), Math.cos(FI), 0];
      var mi = { tipo: 'abierta', palma: [-rad[0], -rad[1], 0], dedos: [0, 0, 1] }, md = { tipo: 'abierta', palma: [rad[0], -rad[1], 0], dedos: [0, 0, 1] };
      var T = function (ang, w, cab) { return tabla(ang, { b: { a: w, polo: [0.5, 0.2, -1] }, mi: mi, md: md, cab: [cab == null ? -16 : cab, 0, 0], p: CASI_RECTAS }); };
      var W = (function () {
        var w = function (x) { return mas(C, mas(por(rad, R + x), [0, 0, -3])); };
        return w(busca(function (x) { return huecoPelota(resolver(T(26, w(x))), [['mano', 'i']], C, R); }, 0, 0, 9));
      })();
      return {
        vista: [78, [34, 30]], picado: 14, rastro: 'pecho', esfuerzo: [2], clavos: T4, tensos: T2,
        material: [['balon_medicinal', { radio: R, en: [0, C[2]] }]],
        posturas: {
          a: T(busca(function (x) { return largo(menos(resolver(T(x, W)).i.hom, W)); }, D.brazo + D.antebrazo - 0.5, 14, 44), W),
          b: T(busca(function (x) { return aPelota(T(x, W, -26), TRONCO, C, R); }, 0.4, 2, 30), W, -26)
        },
        rep: bajaSube('b', 'a', [1.9, 0.25, 1.2, 0.5]),
        pasos: ['a', 'a', 'rep']
      };
    })();

    /* ══════════════════════════════ CON UN DISCO ENCIMA, O COLGADO ══════════════════════════════ */
    /* la flexión lastrada: en plancha alta, con un disco bien apoyado en la parte alta de la espalda; el cuerpo, recto de la cabeza a
       los talones; baja hasta que el pecho casi toca el suelo, con los codos a unos 45°, y empuja con las palmas para subir */
    COREO['flexion-lastrada'] = (function () {
      var W = [24, ALTO_MUN, 14], polo = [0.75, 0.25, -0.75];
      var T = function (ang, cab) { return tabla(ang, { b: { a: W, polo: polo }, cab: [cab, 0, 0], p: CASI_RECTAS }); };
      return {
        vista: [78, [34, 30]], picado: 16, rastro: 'pecho', esfuerzo: [2], clavos: T4, tensos: T2,
        material: [['disco', { a: 'torax', punto: [0, 8, -13.3], eje: [0, 0, 1], radio: 14 }]],
        posturas: {
          a: tablaAlta(W, polo, { p: CASI_RECTAS }),
          b: T(busca(function (x) { return troncoAPlano(resolver(T(x, -26)), [0, 0, 0], [0, 1, 0]); }, 3, -6, 20), -26)
        },
        rep: bajaSube('b', 'a', [1.9, 0.25, 1.3, 0.5]),
        pasos: ['a', 'a', 'rep']
      };
    })();

    /* las dominadas lastradas: un disco cuelga de un cinturón de lastre, bien sujeto a la cintura; la dominada, como siempre (hombros
       abajo y atrás, codos hacia el suelo y la barbilla a la altura de la barra); y baja con control hasta estirar los brazos.
       Las posturas son las de las dominadas del bloque 1, colgado 3 cm más atrás (masAtras, en 72-dorsal.js: saliendo de justo debajo
       de la barra, a media subida el pelo se le mete en ella; aquí, 3,2 cm en el vídeo). El disco cuelga de canto entre los muslos */
    COREO['dominadas-lastradas'] = {
      vista: [26, 154], rastro: 'barbilla', esfuerzo: [0], clavos: ['mi@0:28', 'md@0:-28'],
      material: [['barra_dominadas', { alto: 225, ancho: 62 }], ['disco', { a: 'pelvis', punto: [0, -25, 7], eje: [1, 0, 0], radio: 12, cinturon: true }]],
      posturas: {
        a: miraBarra(sobre(COLGADO, { pel: [0, 120, -2], hom: [3.5, 0], b: { a: [28, 217, 0], polo: [1, -0.2, 0.5] } }), -3, -10),
        a2: miraBarra(sobre(COLGADO, { pel: [0, 125.5, -2], hom: [-2, -1.5], col: [-3, 0, 0], b: { a: [28, 217, 0], polo: [1, -0.3, 0.4] } }), -5, -14),
        b: sobre(COLGADO, { pel: [0, 172, -11], giro: [0, -8, 0], hom: [-2, -1.5], col: [-3, 0, 0], cab: [-4, 0, 0], b: { a: [28, 217, 0], polo: [1, -1, 0.1] } })
      },
      inicio: 'a2',
      rep: [['b', 1.5, 'empuje'], ['b', 0.5], ['a2', 2.1, 'freno'], ['a2', 0.45]],
      pasos: ['a', 'rep', { sec: [['a2', 2.1, 'freno'], ['a', 1.0, 'suave']], desde: 'b' }]
    };

    /* ══════════════════════════════ LA RUEDA Y LA BARRA QUE RUEDAN POR EL SUELO ══════════════════════════════
       De rodillas (en z = 0; las espinillas, tendidas hacia atrás) o de pie, con los brazos estirados hasta lo que rueda: el mango de
       la rueda o la barra, que va a la altura de su radio. rodando(P, alto, G): la postura P con los puños a «alto» del suelo y a G
       del centro, delante de los hombros, a un brazo justo de ellos. De una postura a otra el puño va derecho (clavado), y hay
       posturas de paso para que no deje de ir a su altura */
    var DE_RODILLAS = { p: { a: [10, 3.6, -37.5], polo: [0.1, -1, 0.6] }, t: { punta: [0, -0.04, -1], arriba: [0, -1, 0.04] } };
    function rodando(P, alto, G, polo) {
      var h = resolver(P).i.hom, L = BRAZO - 0.3, dy = h[1] - alto;
      return estirado(P, [G, alto, h[2] + Math.sqrt(Math.max(0, L * L - dy * dy - (G - h[0]) * (G - h[0])))], 'b', 0.3, polo || [1, 0.3, -0.2]);
    }
    /* de rodillas: los muslos, echados «g» grados hacia delante; el tronco, inclinado «th» */
    function arrodillado(g, th, cab, alto, G) {
      return rodando(sobre(DE_RODILLAS, { pel: [0, 5.8 + D.muslo * Math.cos(g * RAD), D.muslo * Math.sin(g * RAD)], giro: [0, th, 0], cab: [cab, 0, 0], m: PRONO }), alto, G);
    }
    /* de la primera postura a la última y vuelta, pasando por las de en medio («s», lo que lleva andado en cada una lo que rueda, en
       cm), sin cambiar de paso al pasar por cada una: sale de parado, coge su paso en el primer 30 % del tiempo, lo lleva, y lo va
       dejando en el último 35 %. Cada tramo dura lo que ese paso tarda en ir de una postura a la siguiente */
    function porPosturas(ida, vuelta, quieto, nombres, s) {
      var n = nombres.length - 1, A = 0.3, B = 0.35, V = 1 / (1 - A / 2 - B / 2), c = function (x) { return Math.round(x * 100) / 100; }, r = [], i;
      /* lo andado (de 0 a 1) a «t» del tiempo (de 0 a 1), y cuándo se lleva andado «x» */
      var andado = function (t) { return t < A ? V * t * t / (2 * A) : t <= 1 - B ? V * (t - A / 2) : 1 - V * (1 - t) * (1 - t) / (2 * B); };
      var cuando = function (x) { return x <= 0 ? 0 : x >= 1 ? 1 : busca(andado, x, 0, 1); };
      var x = nombres.map(function (q, k) { return Math.abs(s[k] - s[0]) / Math.abs(s[n] - s[0]); });
      for (i = 0; i < n; i++) r.push([nombres[i + 1], c(ida * (cuando(x[i + 1]) - cuando(x[i]))), i === 0 ? 'entra' : i === n - 1 ? 'sale' : 'lineal']);
      r.push([nombres[n], quieto[0]]);
      for (i = n - 1; i >= 0; i--) r.push([nombres[i], c(vuelta * (cuando(1 - x[i]) - cuando(1 - x[i + 1]))), i === n - 1 ? 'entra' : i === 0 ? 'sale' : 'lineal']);
      r.push([nombres[0], quieto[1]]);
      return r;
    }

    /* el camino de lo que rueda: «np» tramos de k (u = 0: recogido) a e (u = 1: tendido), con las posturas de paso p1, p2… que da «de», y
       la repetición que las recorre. De una postura a otra todo va derecho (la cadera, el tronco), y el camino de verdad es curvo: lo
       que se aparta lo pone la cadera (lo tenso: los brazos no se doblan de paso), y cuantas más posturas, menos se aparta. Con tres
       tramos, los codos se doblaban 19° de paso en la rueda y 33° en el rollout de pie */
    function camino(de, np, ida, vuelta, quieto) {
      var N = [], P = {}, S = [], i, n;
      for (i = 0; i <= np; i++) { n = i === 0 ? 'k' : i === np ? 'e' : 'p' + i; N.push(n); P[n] = de(i / np); S.push(resolver(P[n]).i.agarre[2]); }
      return { posturas: P, rep: porPosturas(ida, vuelta, quieto, N, S),
        esfuerzo: N.slice(1).map(function (q, j) { return j; }).concat(N.slice(1).map(function (q, j) { return np + 1 + j; })) };
    }

    /* la rueda abdominal: de rodillas, agarra las asas de la rueda, colocada delante de las rodillas; la hace rodar hacia delante
       despacio, estirando el cuerpo; y tira de ella hacia las rodillas para volver */
    COREO['rueda-abdominal'] = (function () {
      var R = 9, C = camino(function (u) { return arrodillado(56 * u, 60 + 21 * u, -8 - 14 * u, R, 13); }, 8, 2.4, 2.0, [0.3, 0.4]);
      return {
        vista: [[78, 14], [34, 18]], rastro: 'manos', esfuerzo: C.esfuerzo, clavos: T4, tensos: TM,
        material: [['rueda', { radio: R }]],
        posturas: C.posturas,
        inicio: 'k', encuadra: ['k', 'e'],
        rep: C.rep,
        pasos: ['k', 'rep', 'rep']
      };
    })();

    /* el rollout con barra, de rodillas: una barra con discos en el suelo; arrodillado detrás, la agarra en prono a la anchura de los
       hombros; con los brazos estirados la hace rodar hacia delante despacio hasta que la espalda queda recta; y vuelve rodando hasta
       tenerla bajo los hombros, sin doblar los brazos */
    COREO['rollout-barra-rodillas'] = (function () {
      var R = 13, C = camino(function (u) { return arrodillado(52 * u, 58 + 22 * u, -8 - 14 * u, R, 19); }, 8, 2.4, 2.0, [0.3, 0.4]);
      return {
        vista: [[78, 14], [34, 18]], rastro: 'manos', esfuerzo: C.esfuerzo, clavos: T4, tensos: TM,
        material: [['barra', { discos: R, largo: 150 }]],
        posturas: C.posturas,
        inicio: 'k', encuadra: ['k', 'e'],
        rep: C.rep,
        pasos: ['k', 'rep', 'rep']
      };
    })();

    /* el rollout con barra, de pie: de pie, con la barra en el suelo junto a los pies, dobla la cintura y la agarra en prono a la
       anchura de los hombros; con los brazos estirados la hace rodar hacia delante despacio hasta que la espalda queda recta; y vuelve
       rodando hacia los pies mientras sube la cadera. Las piernas, rectas, giran sobre los pies (los talones se levantan al tenderse) */
    COREO['rollout-barra-de-pie'] = (function () {
      var R = 13, G = 19, L = BRAZO - 0.3;
      /* a «u» del camino (de 0, doblado por la cintura con la barra junto a los pies, a 1, tendido): las piernas han girado sobre los
         pies lo que toca (de −10° a 72° desde la vertical), los talones se levantan a partir de un cuarto, y los puños van «av» cm por
         delante de los hombros (los brazos, a plomo al salir y tendidos hacia delante al llegar). El tronco se echa lo que haga falta
         para que, con los brazos estirados, los puños lleguen a la barra: de 107° a 76°, pasando por 108,6° cuando la cadera pasa por
         encima de los pies. (Con el tronco yendo derecho de 107° a 76°, a un tercio del camino los hombros quedaban demasiado altos y la
         barra se levantaba 7 cm del suelo) */
      var de = function (u) {
        var fi = (-10 + 82 * u) * RAD, tal = 55 * CURVA.suave(entre((u - 0.25) / 0.6, 0, 1)), dt = deTalon(tal), av = 0.2 + 46.1 * u * u;
        var P = function (th) {
          return { pel: [0, D.tobillo + dt[1] + 77.6 * Math.cos(fi), dt[0] + 77.6 * Math.sin(fi)], giro: [0, th, 0], cab: [-4 - 20 * u, 0, 0],
            p: { suelo: [11, 0], abre: 5, talon: tal, polo: [0, 0.2, 1] }, m: PRONO };
        };
        var hx = resolver(P(100)).i.hom[0];
        return rodando(P(busca(function (th) { return resolver(P(th)).i.hom[1]; }, R + Math.sqrt(L * L - av * av - (G - hx) * (G - hx)), 60, 125)), R, G);
      };
      /* catorce tramos: al principio la cadera pasa por encima de los pies con los brazos a plomo, y ahí lo poco que el tronco se
         aparta de su camino mueve mucho la cadera (las piernas y los brazos, casi paralelos, no dejan otra): con menos, se nota */
      var C = camino(de, 14, 2.8, 2.4, [0.3, 0.4]);
      return {
        vista: [[78, 12], [38, 18]], rastro: 'pel', esfuerzo: C.esfuerzo, clavos: T4, tensos: T4,
        material: [['barra', { discos: R, largo: 150 }]],
        posturas: C.posturas,
        inicio: 'k', encuadra: ['k', 'e'],
        rep: C.rep,
        pasos: ['k', 'rep', 'rep']
      };
    })();

    /* ══════════════════════════════ LAS ANILLAS ══════════════════════════════
       Cuelgan de un pórtico, cada una de su cinta, a la altura de las manos (como las paralelas: 118 cm). Las posturas son las de los
       fondos y el soporte en paralelas (76-triceps.js), con las manos algo más abiertas. Los dos anclajes están más separados que
       las manos (96 cm): las cintas suben abriéndose, por fuera de los antebrazos y de los hombros, sin cruzarlos */
    var GA = 28, EN_ANILLAS = [['barra_dominadas', { alto: 252, ancho: 72 }], ['anillas', { alto: 250, sep: 96, z: 2 }]];
    var NUDILLOS_FUERA = { tipo: 'puno', prono: 0 }, RECTO = { p: { e: 5, z: 0, c: 10 }, t: { tob: 22 } };
    function enAnillas(polo) { return { a: [GA, 126, 2], polo: polo }; }
    var M_AN = ['mi', 'md'], SUBE = { sec: [['s', 1.7, null, M_AN.concat(T2)], ['a', 1.2, 'empuje', M_AN]], desde: 's' };
    var AN_S = { b: enAnillas([0.1, 0.4, -1]), m: NUDILLOS_FUERA }, AN_A = sobre(RECTO, { pel: [0, 132.6, 0], b: enAnillas([0.1, 0.1, -1]), m: NUDILLOS_FUERA });

    /* los fondos en anillas: agarra las anillas y se sube hasta quedar en apoyo, con los brazos estirados junto al cuerpo; baja doblando
       los codos con control; y empuja hasta volver a estirarlos */
    COREO['fondos-anillas'] = {
      vista: [72, 22], rastro: 'hombros', esfuerzo: [2], clavos: M_AN, material: EN_ANILLAS,
      posturas: { s: AN_S, a: AN_A, b: sobre(RECTO, { pel: [0, 103.8, 10], giro: [0, 8, 0], cab: [-8, 0, 0], b: enAnillas([0, 0.3, -1]), m: NUDILLOS_FUERA }) },
      inicio: 'a', encuadra: ['s'],
      rep: bajaSube('b', 'a', [1.8, 0.3, 1.3, 0.5]),
      pasos: [SUBE, 'rep', { rep: 2.1 }]
    };

    /* el soporte en anillas: se sube a las anillas y queda en apoyo, con los brazos estirados junto al cuerpo; gira un poco las anillas
       hacia fuera y mantiene el cuerpo en posición hueca (la pelvis recogida y las piernas juntas, algo por delante); y aguanta sin
       doblar los codos */
    COREO['soporte-anillas'] = {
      vista: [58, 20], isometrico: 'h', clavos: M_AN, material: EN_ANILLAS,
      posturas: {
        s: AN_S, a: AN_A,
        h: { pel: [0, 132.6, -1], giro: [0, -5, 0], col: [9, 0, 0], cab: [2, 0, 0], hom: [-2, 0], p: { e: 17, z: 0, c: 4 }, t: { tob: 34 }, b: enAnillas([0.1, 0.1, -1]), m: { tipo: 'puno', prono: -32 } }
      },
      inicio: 'h', encuadra: ['s'],
      pasos: [SUBE, { sec: [['a', 0.5], ['h', 1.3, 'suave']], desde: 'a' }, 'h']
    };

    /* ══════════════════════════════ LA CINTA DE SUSPENSIÓN ══════════════════════════════
       Cuelga de un pórtico (YA_S: a qué altura) y acaba en dos asas. La cinta no se estira, así que las asas no se alejan del anclaje:
       aquí no se mueven del sitio (como si fueran una barra fija, que es lo que hacen cuando tiran de ellas con el cuerpo), y es el
       cuerpo el que va y viene: recto, girando sobre los pies. De cara al anclaje (queda delante, en z > 0) se echa atrás; de
       espaldas a él (queda detrás), se echa adelante. Cada ejercicio dice dónde tiene los puños al final del tirón o abajo del
       empuje (en el tórax: enTorax), y de ahí sale dónde están las asas; la otra postura es la que deja los brazos estirados hasta ellas */
    var YA_S = 230, ZA_F = 88, ZA_B = -78;
    function conCinta(z, o, ya) { ya = ya || YA_S; return [['barra_dominadas', { alto: ya + 4, ancho: 72, z: z }], ['suspension', une({ ancla: [0, ya, z] }, o)]]; }
    var PAREJOS = { p: { suelo: [11, 0], abre: 6 } };
    /* un pie delante del otro: el izquierdo, 13 cm por delante; la pierna de atrás queda algo doblada */
    var ESCALONADOS = { pi: { suelo: [11, 5], abre: 5 }, pd: { suelo: [-11, -8], abre: 9, polo: [-0.2, 0.2, 1] } };
    /* recto y echado atrás «be» grados sobre los pies (zf: dónde está el tobillo del pie que manda, el de delante) */
    function atras(be, pies, zf, extra) {
      var s = Math.sin(be * RAD), c = Math.cos(be * RAD);
      return sobre(sobre({ pel: [0, D.tobillo + 77.7 * c, (zf || 0) - 77.7 * s], giro: [0, -be, 0], cab: [be * 0.2, 0, 0] }, pies || PAREJOS), extra || {});
    }
    /* el ángulo con el que el cuerpo P(x) deja el hombro a «d» del asa F */
    function alAsa(P, F, d, lo, hi) { return busca(function (x) { return largo(menos(resolver(P(x)).i.hom, F)); }, d, lo, hi); }
    /* de cara al anclaje: «tira» es la postura del final (echado atrás «be» grados, con los puños en q, del tórax); «cuelga», la de los
       brazos estirados hasta las mismas asas; y «pie», la de antes de echarse atrás, con los codos doblados. o: { be, q, polo (el codo al
       final, en el tórax), m (la mano), pies, zf, mb (la mano al final, si cambia), abre (lo que se abren las manos al final), cab } */
    function tiron(o) {
      var cuerpo = function (x, extra) { return atras(x, o.pies, o.zf, sobre({ m: o.m }, extra || {})); };
      var b = enTorax(cuerpo(o.be, { m: o.mb || o.m, cab: [o.cab == null ? 6 : o.cab, 0, 0] }), o.q, o.polo), F = resolver(b).i.agarre;
      var Fa = [F[0] - (o.abre || 0), F[1], F[2]], ba = alAsa(function (x) { return cuerpo(x); }, Fa, BRAZO - 0.4, o.be, 75);
      return { F: Fa, be: ba,
        b: b,
        a: conAgarre(cuerpo(ba, { hom: [0, 1] }), Fa, o.poloA || [0.6, -0.6, -0.2]),
        s: conAgarre(cuerpo(o.be + (ba - o.be) * 0.35), Fa, o.poloS || [0.5, -1, -0.1]) };
    }
    var T_S = ['mi', 'md', 'ti', 'td'];

    /* el remo: de cara al anclaje, un asa en cada mano con las palmas enfrentadas y un pie delante del otro; se echa atrás con los brazos
       estirados a la altura del pecho; dobla los codos y lleva el cuerpo hacia las manos, con los codos pegados a las costillas y el
       tronco rígido; y baja despacio */
    COREO['remo-suspension'] = (function () {
      var R = tiron({ be: 16, q: [20, 5, 9], polo: [0.3, -0.45, -1], m: NEU, pies: ESCALONADOS, zf: 5 });
      return {
        vista: [70, 150], rastro: 'pecho', esfuerzo: [0], clavos: T_S, tensos: T2, material: conCinta(ZA_F),
        posturas: { s: R.s, a: R.a, b: R.b }, inicio: 'a', encuadra: ['s', 'a'],
        rep: [['b', 1.3, 'empuje'], ['b', 0.5], ['a', 1.9, 'freno'], ['a', 0.4]],
        pasos: ['s', { sec: [['a', 1.6, 'suave']], desde: 's' }, 'rep', 'rep']
      };
    })();

    /* el remo alto: preparado como para el remo, echado atrás con los brazos estirados a la altura del pecho (las palmas, hacia abajo);
       tira del cuerpo hacia las manos subiendo los codos hasta la altura de los hombros; y baja despacio con el tronco rígido */
    COREO['remo-alto-suspension'] = (function () {
      var R = tiron({ be: 20, q: [27, 19.5, 13], polo: [1, 0.05, -0.45], m: PRONO, pies: ESCALONADOS, zf: 5, poloA: [0.8, -0.3, -0.2] });
      return {
        vista: [70, 150], rastro: 'pecho', esfuerzo: [0], clavos: T_S, tensos: T2, material: conCinta(ZA_F),
        posturas: { a: R.a, b: R.b }, inicio: 'a',
        rep: [['b', 1.3, 'empuje'], ['b', 0.5], ['a', 1.9, 'freno'], ['a', 0.4]],
        pasos: ['a', 'rep', 'rep']
      };
    })();

    /* el curl: de cara al anclaje y con un pie delante del otro, las asas con las palmas hacia arriba y los brazos estirados a la altura del
       pecho; se echa atrás con el cuerpo en línea; dobla los codos, que quedan altos y por delante, para llevar el cuerpo hacia las
       manos (acaban ante la frente), y baja despacio. El paso 4 (para quién es) lo dice de cerca */
    function curlCinta(m, extra) { return tiron(une({ be: 19, q: [13, 39, 17], polo: [0.35, 0.25, 1], m: m, pies: ESCALONADOS, zf: 5, cab: 2, poloA: [0.5, -0.8, 0.2], poloS: [0.4, -1, 0.3] }, extra)); }
    COREO['curl-suspension'] = (function () {
      var R = curlCinta(SUPINO);
      return {
        vista: [70, 150], rastro: 'pecho', esfuerzo: [0], clavos: T_S, tensos: T2, material: conCinta(ZA_F),
        posturas: { s: R.s, a: R.a, b: R.b }, inicio: 'a', encuadra: ['s', 'a'],
        rep: [['b', 1.3, 'empuje'], ['b', 0.5], ['a', 1.9, 'freno'], ['a', 0.4]],
        pasos: ['s', { sec: [['a', 1.6, 'suave']], desde: 's' }, 'rep', 'nota']
      };
    })();
    /* con agarre prono: lo mismo, con las palmas hacia abajo */
    COREO['curl-suspension-agarre-prono'] = (function () {
      var R = curlCinta(PRONO);
      return {
        vista: [70, 150], rastro: 'pecho', esfuerzo: [0], clavos: T_S, tensos: T2, material: conCinta(ZA_F),
        posturas: { s: R.s, a: R.a, b: R.b }, inicio: 'a', encuadra: ['s', 'a'],
        rep: [['b', 1.3, 'empuje'], ['b', 0.5], ['a', 1.9, 'freno'], ['a', 0.4]],
        pasos: ['s', { sec: [['a', 1.6, 'suave']], desde: 's' }, 'rep']
      };
    })();
    /* martillo: las asas, como una prolongación de las cintas, con las palmas enfrentadas; con los brazos estirados al frente se echa
       atrás con el cuerpo recto; dobla los codos para acercar el cuerpo a las cintas (al final, las manos se abren un poco); y vuelve */
    COREO['curl-martillo-suspension'] = (function () {
      var R = curlCinta(NEU, { pies: PAREJOS, zf: 0, q: [17, 37, 16], abre: 4 });
      return {
        vista: [70, 150], rastro: 'pecho', esfuerzo: [0], clavos: T_S, tensos: T2, material: conCinta(ZA_F),
        posturas: { s: R.s, a: R.a, b: R.b }, inicio: 'a', encuadra: ['s', 'a'],
        rep: [['b', 1.3, 'empuje'], ['b', 0.5], ['a', 1.9, 'freno'], ['a', 0.4]],
        pasos: ['s', { sec: [['a', 1.6, 'suave']], desde: 's' }, 'rep', { rep: 1.8 }]
      };
    })();
    /* a un brazo: de pie, sujeta las asas (las dos, juntas, en la mano izquierda) y se echa atrás con el peso en ese brazo; dobla el codo
       despacio para subir el cuerpo y, al acercarse al final, gira la palma hacia arriba; y baja despacio. El cambio de brazo no se hace */
    COREO['curl-suspension-una-mano'] = (function () {
      var libre = { bd: { e: 6, z: 0, g: 8, c: 14 }, md: SUELTA };
      var cuerpo = function (x, extra) { return atras(x, PAREJOS, 0, sobre(libre, extra || {})); };
      var b = enTorax(cuerpo(15, { mi: SUPINO, cab: [4, 0, 0] }), [15, 31, 17], [0.35, -0.2, 1], 'bi'), F = resolver(b).i.agarre;
      var ba = alAsa(function (x) { return cuerpo(x, { mi: NEU }); }, F, BRAZO - 0.4, 15, 70);
      return {
        vista: [70, 150], rastro: 'pecho', esfuerzo: [0], clavos: ['mi', 'ti', 'td'], tensos: T2, material: conCinta(ZA_F, { a: 'i' }),
        posturas: { a: conAgarre(cuerpo(ba, { mi: NEU }), F, [0.5, -0.8, 0.2], 'bi'), b: b }, inicio: 'a',
        rep: [['b', 1.5, 'empuje'], ['b', 0.5], ['a', 2.0, 'freno'], ['a', 0.4]],
        pasos: ['a', 'rep', 'rep']
      };
    })();

    /* la sentadilla asistida: de pie y de cara al anclaje, sujeta las asas y se echa atrás hasta estirar los brazos; baja en sentadilla
       dejando que las asas aguanten parte del peso (por eso llega más abajo, con la cadera atrás); y sube empujando con las piernas.
       Los brazos van estirados todo el camino: el hombro baja por un arco alrededor de las asas */
    COREO['sentadilla-asistida-cinta'] = (function () {
      var pies = { p: { suelo: [14, 0], abre: 12, polo: [0.35, 0.1, 1] } }, F = [16, 112, 40];
      var a = alAsa(function (x) { return atras(x, pies, 0, { m: NEU }); }, F, BRAZO - 0.4, 0, 30);
      var abajo = function (z) { return sobre({ pel: [0, 40, z], giro: [0, 8, 0], col: [4, 0, 0], cab: [-6, 0, 0], m: NEU }, pies); };
      var zb = alAsa(abajo, F, BRAZO - 0.4, -45, 10);
      return {
        vista: [70, 150], rastro: 'pel', esfuerzo: [2], clavos: T_S, tensos: TM, material: conCinta(ZA_F),
        posturas: { a: conAgarre(atras(a, pies, 0, { m: NEU }), F, [0.6, -0.7, -0.2]), b: conAgarre(abajo(zb), F, [0.6, -0.7, -0.2]) },
        rep: bajaSube('b', 'a', [1.9, 0.4, 1.4, 0.5]),
        pasos: ['a', 'rep', { rep: 2.3 }]
      };
    })();

    /* ── de espaldas al anclaje ── recto y echado adelante «ga» grados: sobre las puntas de los dos pies (talon: lo que se levantan los
       talones), o sobre la del pie de atrás, con el otro adelantado y plantado (zd: dónde) */
    function adelante(ga, talon, zd, extra) {
      var s = Math.sin(ga * RAD), c = Math.cos(ga * RAD), dt = deTalon(talon || 0), atr = { suelo: [10, 0], abre: 4, talon: talon || 0 };
      var P = { pel: [0, D.tobillo + dt[1] + 77.7 * c, dt[0] + 77.7 * s], giro: [0, ga, 0], cab: [-ga * 0.35, 0, 0] };
      if (zd == null) P.p = atr; else { P.pd = { suelo: [-10, 0], abre: 4, talon: talon || 0 }; P.pi = { suelo: [11, zd], abre: 4, polo: [0.1, 0.1, 1] }; }
      return sobre(P, extra || {});
    }

    /* el press de pecho: de espaldas al anclaje, las asas con los codos a la altura del pecho y las palmas hacia abajo; adelanta un pie y
       se inclina hasta tensar las cintas, bajando el tronco hacia las manos con el cuerpo recto; estira los codos para alejar el cuerpo
       de las manos y vuelve despacio. El paso 4 (para quién es) lo dice de cerca */
    COREO['press-pecho-cinta-suspension'] = (function () {
      /* (22-11-2026) las manos, algo más abiertas y más altas (a la altura de los hombros), y los codos hacia abajo: la cinta sale de cada
         asa hacia atrás y hacia arriba, y con las manos junto al pecho y los codos altos cruzaba el brazo por dentro (hasta 5 cm: se
         veía apoyada en él). Así pasa por encima del antebrazo y del hombro sin tocarlos (lo que menos, 2 cm del brazo) */
      var Q = [36, 22, 12], polo = [0.7, -1.3, -0.3], ZD = 56;
      var cuerpo = function (x, extra) { return adelante(x, 44, ZD, sobre({ m: PRONO }, extra || {})); };
      var b = enTorax(cuerpo(36), Q, polo), F = resolver(b).i.agarre;
      var ga = alAsa(function (x) { return cuerpo(x); }, F, BRAZO - 1.2, 0, 36);
      /* antes de inclinarse: de pie, con los pies juntos y las asas junto al pecho; y el paso (el pie izquierdo, en el aire) */
      var s = enTorax(adelante(2, 0, null, { m: PRONO, cab: [0, 0, 0] }), Q, polo);
      var p = enTorax(adelante(14, 20, null, { m: PRONO, pi: { a: [11, 16, 30], polo: [0.1, 0.1, 1] }, ti: { punta: [0, 0.12, 0.99], arriba: [0, 0.99, -0.12] } }), Q, polo);
      return {
        vista: [72, 28], rastro: 'pecho', esfuerzo: [0], clavos: T_S, tensos: T2, material: conCinta(ZA_B),
        posturas: { s: s, p: p, a: conAgarre(cuerpo(ga, { cab: [-6, 0, 0] }), F, [0.7, -1.3, -0.2]), b: b }, inicio: 'b', encuadra: ['s', 'b'],
        rep: [['a', 1.3, 'empuje'], ['a', 0.4], ['b', 1.9, 'freno'], ['b', 0.4]],
        pasos: ['s', { sec: [['p', 0.8, 'entra', ['td']], ['b', 1.3, 'sale', ['td']]], desde: 's' }, 'rep', 'nota']
      };
    })();

    /* la extensión de tríceps: las asas, a la altura del pecho o algo más abajo, con las palmas hacia abajo, de espaldas al anclaje; se
       inclina hacia delante con los brazos estirados, sobre las puntas de los pies; dobla los codos para acercar las manos a la cabeza
       (quedan ante la frente, con los codos por delante) y los estira para volver */
    COREO['extension-triceps-cinta-suspension'] = (function () {
      var cuerpo = function (x, extra) { return adelante(x, 42, null, sobre({ m: PRONO }, extra || {})); };
      /* las manos acaban a los lados de la frente: las cintas pasan a cada lado de la cabeza */
      var b = enTorax(cuerpo(40, { cab: [-16, 0, 0] }), [23, 43, 13], [0.55, -0.65, 1]), F = resolver(b).i.agarre;
      var ga = alAsa(function (x) { return cuerpo(x); }, F, BRAZO - 0.6, 0, 40);
      /* antes de inclinarse: de pie, con los brazos estirados al frente, algo por debajo del pecho y abiertos (las cintas le pasan por
         encima de los hombros, a cada lado de la cabeza) */
      var s = estirado(adelante(2, 0, null, { m: PRONO, cab: [0, 0, 0] }), [27, 103, 50], 'b', 0.6, [1, -0.4, -0.4]);
      return {
        vista: [72, 28], rastro: 'pecho', esfuerzo: [2], clavos: T_S, tensos: T2, material: conCinta(ZA_B),
        posturas: { s: s, a: conAgarre(cuerpo(ga, { cab: [-8, 0, 0] }), F, [0.8, -0.6, -0.2]), b: b }, inicio: 'a', encuadra: ['s', 'b'],
        rep: bajaSube('b', 'a', [1.8, 0.3, 1.3, 0.5]),
        pasos: ['s', { sec: [['a', 1.6, 'suave']], desde: 's' }, 'rep']
      };
    })();

    /* los fondos: las asas, bajo los hombros (cuelgan bajas; el anclaje queda detrás: las cintas suben por detrás de la espalda), y los
       pies en el suelo, un poco por delante; baja la cadera entre las asas doblando los codos; y los estira para volver */
    COREO['fondos-cinta-suspension'] = (function () {
      var F = [27, 66, 0], pies = { p: { suelo: [10, 22], abre: 5, polo: [0.1, 0.1, 1] } };
      var arriba = function (y) { return sobre({ pel: [0, y, -4], giro: [0, 5, 0], m: NUDILLOS_FUERA }, pies); };
      var ya = alAsa(arriba, F, BRAZO - 0.5, 60, 86);
      return {
        vista: [70, 24], rastro: 'hombros', esfuerzo: [2], clavos: T_S, material: conCinta(-56),
        posturas: {
          /* los codos se abren a los lados al doblarse: hacia atrás se cruzarían con las cintas, que suben por detrás */
          a: conAgarre(arriba(ya), F, [0.6, 0.2, -0.8]),
          b: conAgarre(sobre({ pel: [0, ya - 23, -9], giro: [0, 13, 0], cab: [-8, 0, 0], m: NUDILLOS_FUERA }, pies), F, [0.85, 0.25, -0.5])
        },
        rep: bajaSube('b', 'a', [1.7, 0.3, 1.2, 0.5]),
        pasos: ['a', 'rep', { rep: 2.0 }]
      };
    })();

    /* la flexión con los pies en la cinta: los pies, en los estribos, bajo el anclaje, y las manos en el suelo, justo debajo de los
       hombros; empuja hasta estirar los codos, sin hundir ni levantar la cadera; y baja con el tronco rígido hasta que el pecho roza
       el suelo. El paso 4 (para quién es) lo dice de cerca */
    COREO['flexion-cinta-suspension'] = (function () {
      var YT = 30, ZT = -100, manos = { a: [22, ALTO_MUN, 15], polo: [0.55, 0.25, -1] };
      var P = function (ang, cab) { var s = Math.sin(ang * RAD), c = Math.cos(ang * RAD); return { pel: [0, YT + 78 * s, ZT + 78 * c], giro: [0, 90 - ang, 0], cab: [cab, 0, 0], p: CASI_RECTAS, t: { punta: [0, -0.5, -0.866], arriba: [0, -0.866, 0.5] }, b: manos, m: EN_SUELO }; };
      /* los pies no giran en los estribos (van dichos en el mundo): las asas no se mueven y la cinta mide siempre lo mismo */
      var a = aUnBrazo(function (x) { return P(x, -14); }, manos.a, -10, 30), L = resolver(a).i;
      return {
        vista: [78, [34, 30]], picado: 10, rastro: 'pecho', esfuerzo: [2], clavos: ['mi', 'md', 'ti', 'td'], tensos: T2,
        /* la cinta cuelga de una barra baja (a 150 cm): con el pórtico alto, él, que está en el suelo, se veía muy pequeño */
        material: conCinta(mas(L.suela, mas(por(L.punta, 9), por(L.arriba, 8)))[2], { a: 'pies' }, 150),
        posturas: { a: a, b: P(busca(function (x) { return troncoAPlano(resolver(P(x, -28)), [0, 0, 0], [0, 1, 0]); }, 3, -22, 12), -28) },
        rep: bajaSube('b', 'a', [1.8, 0.25, 1.2, 0.5]),
        pasos: ['a', 'a', 'rep', 'nota']
      };
    })();
  })();
